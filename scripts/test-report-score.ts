/**
 * RAPOR SKOR SEÇİMİ + AUTH İSTİSNASI TESTİ — B05 (A058 backend, A021 rapor kısmı)
 * ─────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-report-score.ts   (exit 1 = kırık)
 *
 * A058: masaüstü okunamayan round skorunu "?-?" gönderiyor (kaan-runtime.log:480).
 *   HEAD'de validateRequest round'ları sondan tarayıp İLK 2-parçalı dizide duruyordu
 *   → son round "?-?" ise önceki GERÇEK skorlar varken bile 400 "Invalid score values".
 *   Beklenen: sayısal olmayan çift atlanır, son GEÇERLİ skor seçilir; hiç geçerli çift
 *   yoksa 400 AYNEN (40ce444f vakası: 1 round, tek skor "?-?" → yine 400).
 * A021 (rapor kısmı): verifyAuthAndRateLimit İSTİSNA atarsa HEAD 401 "Authentication
 *   required" dönüyordu → desktop 401'de oturumu yıkar. Beklenen: 503 auth_unavailable
 *   + Retry-After 15 (lib/api-auth.ts authUnavailableResponse).
 *
 * Route-seviyesi assert'ler GERÇEK POST handler'ını koşar (scripts/report-route-harness.ts);
 * AĞ/AI/DB çağrısı YOK (OPENAI_API_KEY tanımsız → deterministik istatistik yolu).
 */
import { harness, resetHarness, loadReportRoute, reportRequest } from "./report-route-harness";
import { pickReportScore, isValidScoreValue } from "../lib/report-score";

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}
const pick = (rounds: unknown, score?: unknown) => pickReportScore(rounds, score);
const show = (x: unknown) => JSON.stringify(x);

async function main() {
  console.log("\n── 1) pickReportScore — saf seçim kuralı (A058) ──");
  {
    // B05 inceleme (2026-09-24): atlama YALNIZ geç teslim edilen ERKEN round için.
    // Masaüstü ocr_score maç içinde yapışkan (detection.rs:3372 dışında None'a
    // dönmüyor) → geç "?-?" pratikte ilk skor okunmadan önceki bir round'dur.
    // FB01 · F90 (2026-09-24): dizinin SON elemanı okunamayan çiftse numaraya BAKILMAZ →
    // late_unreadable (9355dec davranışı). Masaüstü sayacı OCR resync'iyle geri sarılabildiği
    // için (gunay-runtime.log:7159 → :7310 round=2) küçük numara "geç teslim edilen erken
    // round" kanıtı değildir. Numara kuralı yalnız ORTADAKİ (son eleman olmayan) çift için.
    const a = pick([{ round: 2, score: "5-3" }, { round: 1, score: "?-?" }]);
    check("F90: SON eleman '?-?' (numarası R1, küçük) → geçersiz (numara yok sayılır)", !a.ok && (a as { reason?: string }).reason === "late_unreadable", show(a));
    const f90 = pick([{ round: 19, score: "3 - 12" }, { round: 1, score: "?-?" }]);
    check("F90: [R19 '3 - 12', {round:1,'?-?'}] → 400 (HEAD: ok 3-12 bayat ara skor final)", !f90.ok && (f90 as { reason?: string }).reason === "late_unreadable", show(f90));
    const p4 = pick([{ round: 17, score: "3 - 11" }, { round: 18, score: "3 - 11" }, { round: 19, score: "3 - 12" }, { round: 2, score: "?-?" }]);
    check("F90: sayaç 19→2 sarması (probe p4) → geçersiz", !p4.ok, show(p4));
    const b = pick([{ round: 5, score: "7-5" }, { round: 1, score: "?-?" }, { round: 2, score: " ? - ? " }]);
    check("iki okunamayan SON round → geçersiz (F90)", !b.ok && (b as { reason?: string }).reason === "late_unreadable", show(b));
    const mid = pick([{ round: 2, score: "5-3" }, { round: 1, score: "?-?" }, { round: 3 }]);
    check("ORTADAKİ geç ERKEN '?-?' (R1 < R2) + skorsuz son round → 5-3 (numara kuralı korunur)", mid.ok && mid.yours === "5" && mid.enemy === "3" && mid.skippedInvalid === 1, show(mid));
    const midLate = pick([{ round: 1, score: "1-0" }, { round: 3, score: "?-?" }, { round: 4 }]);
    check("ORTADAKİ '?-?' numarası seçilenden BÜYÜK → geçersiz (numara kuralı korunur)", !midLate.ok, show(midLate));
    const late = pick([{ round: 1, score: "1-0" }, { round: 2, score: "1-1" }, { round: 3, score: "?-?" }]);
    check("SON round (R3) '?-?' → geçersiz (bayat 1-1 final ilan edilmez)", !late.ok && (late as { reason?: string }).reason === "late_unreadable", show(late));
    const unnumbered = pick([{ score: "5-3" }, { score: "?-?" }]);
    check("numarasız '?-?' atlanamaz (sırası bilinemiyor) → geçersiz (B05 öncesi gibi)", !unnumbered.ok, show(unnumbered));
    const selUnnumbered = pick([{ score: "5-3" }, { round: 1, score: "?-?" }]);
    check("seçilen geçerli round numarasız + atlanan var → geçersiz", !selUnnumbered.ok, show(selUnnumbered));
    const dup = pick([{ round: 2, score: "1-1" }, { round: 3, score: "2-1" }, { round: 3, score: "?-?" }]);
    check("aynı numaralı (R3) '?-?' seçilenden sonra → geçersiz (eşit = küçük değil)", !dup.ok, show(dup));
    const realistic = pick([
      { round: 1, score: "0 - 1", result: "loss" },
      { round: 2, score: "1 - 1", result: "win" },
      { round: 3, score: "2 - 1", result: "win" },
      { round: 1, score: "?-?", result: "loss" },
    ]);
    check("R1..R3 + SON eleman geç R1 '?-?' → geçersiz (F90; ayrım yalnız numarayla yapılamaz)", !realistic.ok, show(realistic));
    const webNum = pick([{ roundNumber: 4, score: "3-1" }, { roundNumber: 2, score: "?-?" }, { roundNumber: 5 }]);
    check("web 'roundNumber' alanı da okunur (validateRequest ile aynı sıra) — ortadaki R2 < R4", webNum.ok && webNum.yours === "3", show(webNum));
    const webNumLate = pick([{ roundNumber: 4, score: "3-1" }, { roundNumber: 6, score: "?-?" }, { roundNumber: 7 }]);
    check("web 'roundNumber': ortadaki R6 > R4 → geçersiz", !webNumLate.ok, show(webNumLate));
    const swift: Record<string, unknown>[] = ["1 - 0", "1 - 1", "2 - 1", "2 - 2", "3 - 2", "3 - 3", "4 - 3", "4 - 4"]
      .map((s, i) => ({ round: i + 1, score: s, result: i % 2 === 0 ? "win" : "loss" }));
    swift.push({ round: 9, score: "?-?", result: "won" });
    const sw = pick(swift);
    check("Swiftplay R8 '4 - 4' + R9 '?-?' result 'won' → geçersiz (HEAD: '4-4 LOSS' persist)", !sw.ok, show(sw));
    const trailing: Record<string, unknown>[] = [{ round: 1, score: "1 - 0" }, { round: 2, score: "1 - 1" }, { round: 3, score: "2 - 1" }];
    for (let r = 4; r <= 20; r++) trailing.push({ round: r, score: "?-?", result: r % 4 === 0 ? "win" : "loss" });
    const tr17 = pick(trailing);
    check("3 geçerli + 17 sondaki '?-?' → geçersiz (HEAD: 'önde kapattın 2 - 1', gerçek 7W/13L)", !tr17.ok, show(tr17));
    const c = pick([{ score: "?-?" }]);
    check("tek round '?-?' (40ce444f vakası) → geçersiz (400 aynen)", !c.ok, show(c));
    const d = pick([{ score: "?-?" }, { score: "?-?" }]);
    check("tümü '?-?' → geçersiz", !d.ok, show(d));
    const e = pick([{ round: 1 }, { round: 2 }]);
    check("round'larda skor alanı yok → 0-0 (bugünkü davranış)", e.ok && e.yours === "0" && e.enemy === "0" && e.skippedInvalid === 0, show(e));
    const f = pick(undefined);
    check("rounds da skor da yok → 0-0", f.ok && f.yours === "0" && f.enemy === "0", show(f));
    const g = pick([{ score: "12-10" }, { score: "13-10" }]);
    check("son skor geçerli → HEAD ile aynı seçim (13-10)", g.ok && g.yours === "13" && g.enemy === "10" && g.skippedInvalid === 0, show(g));
    const h = pick([{ score: "14-13" }, { score: "15-13" }]);
    check("overtime 15-13 geçerli", h.ok && h.yours === "15" && h.enemy === "13", show(h));
    const i = pick(undefined, "17-15");
    check("üst-seviye dize '17-15' (OT) geçerli", i.ok && i.yours === "17" && i.enemy === "15", show(i));
    const j = pick([{ score: "5-3" }], { yours: "13", enemy: "7" });
    check("üst-seviye nesne {13,7} round'lardan ÖNCELİKLİ (değişmedi)", j.ok && j.yours === "13" && j.enemy === "7", show(j));
    const k = pick([{ score: "5-3" }], { yours: "?", enemy: "7" });
    check("geçersiz üst-seviye nesne → geçersiz (round'a düşmez, değişmedi)", !k.ok, show(k));
    const l = pick([{ score: "5-3" }], "?-?");
    check("geçersiz üst-seviye dize → geçersiz (round'a düşmez, değişmedi)", !l.ok, show(l));
    const m = pick([{ round: 2, score: "5-3" }, { round: 1, score: "41-3" }, { round: 3 }]);
    check("aralık dışı (41) ORTADAKİ geç ERKEN çift atlanır → 5-3", m.ok && m.yours === "5" && m.enemy === "3", show(m));
    const mLast = pick([{ round: 2, score: "5-3" }, { round: 1, score: "41-3" }]);
    check("aralık dışı (41) SON eleman → geçersiz (F90)", !mLast.ok, show(mLast));
    const mLate = pick([{ round: 1, score: "5-3" }, { round: 2, score: "41-3" }]);
    check("aralık dışı (41) SONRAKİ round → geçersiz", !mLate.ok, show(mLate));
    const n = pick([{ score: "5-3" }, { score: "" }, { score: "dizi" }]);
    check("2-parçalı OLMAYAN son değerler (eskisi gibi) atlanır, sayılmaz → 5-3", n.ok && n.yours === "5" && n.skippedInvalid === 0, show(n));
    check("isValidScoreValue: 0/40 sınırları", isValidScoreValue("0") && isValidScoreValue("40") && !isValidScoreValue("41") && !isValidScoreValue("?"));
    // B05 inceleme: Number("")===0, Number("1e1")===10, Number("0x1")===1, Number("3.0")===3
    // eskiden GEÇERLİ sayılıyordu.
    check("isValidScoreValue: '', '1e1', '0x1', '3.0', '+5', ' 5' geçersiz; '05' geçerli",
      !isValidScoreValue("") && !isValidScoreValue("1e1") && !isValidScoreValue("0x1") && !isValidScoreValue("3.0")
        && !isValidScoreValue("+5") && !isValidScoreValue(" 5") && isValidScoreValue("05"));
    const blank = pick([{ round: 2, score: "5-3" }, { round: 1, score: " - " }, { round: 3 }]);
    check("ORTADAKİ geç ERKEN ' - ' çifti atlanır → 5-3 (B05 öncesi: yours='' → 'Skor:  - ')", blank.ok && blank.yours === "5" && blank.enemy === "3" && blank.skippedInvalid === 1, show(blank));
    const blankLate = pick([{ round: 1, score: "5-3" }, { round: 2, score: " - " }]);
    check("SONRAKİ round ' - ' → geçersiz (boş skor final olmaz)", !blankLate.ok, show(blankLate));
    const sci = pick([{ round: 1, score: "1e1-2" }]);
    check("'1e1-2' → geçersiz (HEAD: yours '1e1' prompt'a gidiyordu)", !sci.ok, show(sci));
    const dec = pick([{ round: 1, score: "3.0-2" }]);
    check("'3.0-2' → geçersiz", !dec.ok, show(dec));
    const hex = pick(undefined, "0x1-2");
    check("üst-seviye '0x1-2' → geçersiz", !hex.ok, show(hex));
  }

  const route = loadReportRoute();

  console.log("\n── 2) Route — auth İSTİSNASI → 503 auth_unavailable (A021) ──");
  {
    resetHarness();
    harness.auth = { kind: "throw", message: "upstash fetch failed" };
    const res = await route.POST(reportRequest({ rounds: [{ round: 1, score: "1-0", result: "win", died: false }] }));
    const body = await res.json().catch(() => ({}));
    check("statü 503 (HEAD: 401 → desktop oturumu yıkıyordu)", res.status === 503, `got=${res.status} body=${show(body)}`);
    check("gövde {error:'auth_unavailable'} (message YOK)", body?.error === "auth_unavailable" && body?.message === undefined, show(body));
    check("Retry-After: 15", res.headers.get("retry-after") === "15", `got=${res.headers.get("retry-after")}`);
  }
  {
    resetHarness();
    harness.auth = { kind: "reject", status: 401, body: { error: "Invalid or expired token" } };
    const res = await route.POST(reportRequest({ rounds: [] }));
    const body = await res.json().catch(() => ({}));
    check("bilinen auth reddi auth.response ile AYNEN geçer (401 sözleşmesi)", res.status === 401 && body?.error === "Invalid or expired token", `got=${res.status} ${show(body)}`);
  }

  console.log("\n── 3) Route — ORTADAKİ geç ERKEN '?-?' raporu düşürmez; SON round '?-?' bayat skoru final yapmaz (A058 + F90) ──");
  {
    resetHarness();
    delete process.env.OPENAI_API_KEY; // deterministik yol — AI çağrısı YOK
    const desktopFlat = {
      rounds: [
        { round: 1, score: "0 - 1", result: "loss", died: true, deathLocation: "A Main", deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        { round: 2, score: "1 - 1", result: "win", died: false, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        { round: 3, score: "2 - 1", result: "win", died: false, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        // SON eleman: numarası küçük (R1) '?-?' — F90: numara yok sayılır
        { round: 1, score: "?-?", result: "loss", died: true, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
      ],
      maxTokens: 800, lang: "tr", map: "ascent", agent: "jett", side: "attacking",
    };
    const res = await route.POST(reportRequest(desktopFlat));
    const body = await res.json().catch(() => ({}));
    check("SON eleman geç R1 '?-?' → 400 (F90; 9355dec davranışı)", res.status === 400 && body?.error === "Invalid score values", `got=${res.status} ${show(body).slice(0, 160)}`);
    resetHarness();
    const midFlat = { ...desktopFlat, rounds: [...desktopFlat.rounds, { round: 4, result: "unknown", died: true }] };
    const resMid = await route.POST(reportRequest(midFlat));
    const bodyMid = await resMid.json().catch(() => ({}));
    check("ORTADAKİ geç R1 '?-?' + skorsuz son round → 200", resMid.status === 200, `got=${resMid.status} ${show(bodyMid).slice(0, 160)}`);
    check("scoreStr = en son okunan skor '2 - 1' (uydurma yok), matchWon=true (mod yok → bugünkü kural)", bodyMid?.scoreStr === "2 - 1" && bodyMid?.matchWon === true, `got=${bodyMid?.scoreStr} won=${bodyMid?.matchWon}`);
    check("aiGenerated=false (anahtar yok → şablon, dürüst bayrak)", bodyMid?.aiGenerated === false);
    check("fetch hiç çağrılmadı", harness.fetchCalls.length === 0);
  }
  {
    resetHarness();
    const res = await route.POST(reportRequest({
      rounds: [
        { round: 1, score: "1-0", result: "win", died: false, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        { round: 2, score: "1-1", result: "loss", died: true, deathLocation: "A Main", deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        { round: 3, score: "?-?", result: "unknown", died: true, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
      ],
      maxTokens: 800, lang: "tr", map: "ascent", agent: "jett", side: "attacking",
    }));
    const body = await res.json().catch(() => ({}));
    check("SON round (R3) '?-?' → 400 'Invalid score values' (bayat '1 - 1 geride kapattın' YOK)", res.status === 400 && body?.error === "Invalid score values", `got=${res.status} ${show(body).slice(0, 160)}`);
  }
  {
    resetHarness();
    const rounds: Record<string, unknown>[] = ["1 - 0", "1 - 1", "2 - 1", "2 - 2", "3 - 2", "3 - 3", "4 - 3", "4 - 4"]
      .map((s, i) => ({ round: i + 1, score: s, result: i % 2 === 0 ? "win" : "loss", died: i % 2 === 1 }));
    rounds.push({ round: 9, score: "?-?", result: "won", died: false });
    const res = await route.POST(reportRequest({ rounds, lang: "tr", map: "bind", agent: "sage", mode: "swiftplay" }));
    const body = await res.json().catch(() => ({}));
    check("Swiftplay R9 '?-?' + 'won' → 400 (HEAD: 200 '4 - 4' matchWon=false → DB'ye LOSS)", res.status === 400 && body?.error === "Invalid score values", `got=${res.status} scoreStr=${body?.scoreStr} won=${body?.matchWon}`);
  }
  {
    resetHarness();
    const res = await route.POST(reportRequest({
      rounds: [{ round: 1, score: "?-?", result: "unknown", died: true, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" }],
      lang: "tr", map: "summit",
    }));
    const body = await res.json().catch(() => ({}));
    check("tek round '?-?' → 400 'Invalid score values' AYNEN", res.status === 400 && body?.error === "Invalid score values", `got=${res.status} ${show(body)}`);
  }
  {
    resetHarness();
    const res = await route.POST(reportRequest({
      rounds: [
        { round: 27, score: "14-13", result: "win", died: false },
        { round: 28, score: "15-13", result: "win", died: false },
      ],
      lang: "en", map: "bind",
    }));
    const body = await res.json().catch(() => ({}));
    check("overtime 15-13 → 200, scoreStr '15 - 13'", res.status === 200 && body?.scoreStr === "15 - 13", `got=${res.status} ${body?.scoreStr}`);
  }

  // ── W2 followup #94: deterministik rapor — boş kadro etiketi ve beraberlik ──────
  console.log("\n── 5) deterministik rapor: boş kadro 'Rakip kadro: .' yok; berabere skor 'geride' denmez (W2 followup #94) ──");
  {
    resetHarness();
    const res = await route.POST(reportRequest({
      rounds: [
        { round: 7, score: "3 - 4", result: "loss", died: true, enemyCount: 0 },
        { round: 8, score: "4 - 4", result: "win", died: false, enemyCount: 0 },
      ],
      lang: "tr", map: "bind", enemyComp: [],
    }));
    const body = await res.json().catch(() => ({}));
    const tn = String(body?.tendencies ?? "");
    check("TR boş kadro + 4-4 → 'Rakip kadro:' / 'Düşman ()' yok, 'berabere' var, 'geride' yok, baş boşluk yok",
      res.status === 200 && !/Rakip kadro:\s*\./.test(tn) && !/\(\s*\)/.test(tn) && /4 - 4 berabere/.test(tn) && !/geride/.test(tn) && tn === tn.trim(),
      `got=${res.status} ${show(tn)}`);
    resetHarness();
    const resEn = await route.POST(reportRequest({
      rounds: [{ round: 8, score: "4 - 4", result: "win", died: false, enemyCount: 0 }],
      lang: "en", map: "bind",
    }));
    const tnEn = String((await resEn.json().catch(() => ({})))?.tendencies ?? "");
    check("EN boş kadro + 4-4 → 'Enemy roster: .' yok, 'ended level' var, 'behind' yok",
      !/Enemy roster:\s*\./.test(tnEn) && /ended level at 4 - 4/.test(tnEn) && !/behind/.test(tnEn), show(tnEn));
    resetHarness();
    const resLoss = await route.POST(reportRequest({
      rounds: [{ round: 8, score: "3 - 5", result: "loss", died: true, enemyCount: 0 }],
      lang: "tr", map: "bind", enemyComp: ["Jett", "Omen", "Sova", "Sage", "Killjoy"],
    }));
    const tnLoss = String((await resLoss.json().catch(() => ({})))?.tendencies ?? "");
    check("kadrolu + gerçek kayıp → eski metin aynen ('Rakip kadro: Jett, …' + 'geride kapattın')",
      /^Rakip kadro: Jett, Omen, Sova, Sage, Killjoy\./.test(tnLoss) && /Skoru 3 - 5 geride kapattın\./.test(tnLoss), show(tnLoss));
  }

  // ── W2 followup #63(a)/(c): rapor kapağı cümle-sınırlı + decisionScore etiketi ────
  console.log("\n── 6) rapor temizleyicisi: 600 kapağı cümle ortasından kesmez; 'decisionScore' etiketi sızmaz (W2 followup #63) ──");
  {
    const { buildReportCleaner, validateRequest } = await import("../lib/report-prompt");
    const v = validateRequest({ rounds: [{ round: 1, score: "1 - 0", result: "win", died: false }], lang: "tr", map: "bind" });
    if (!v.valid) throw new Error("fixture geçersiz");
    const clean = buildReportCleaner(v.data);
    const sent = "B Site girişinde smoke'u erken harcayıp tek başına girme, takımınla aynı anda bas. ";
    const long = sent.repeat(9) + "Son cümle kapağın ötesinde kesilecek ve yarım kalmamalı";
    const out = clean(long, 600, "yedek");
    check("600 kapağı: çıktı tam cümleyle biter (eskiden kelime sınırında yarım cümle), girdinin öneki",
      out.length <= 600 && /\.$/.test(out) && long.startsWith(out) && out.length >= 390, `len=${out.length} tail=${show(out.slice(-40))}`);
    const leak = clean("Hayatta kalma %50; decisionScore orta (5/10).", 1000, "yedek");
    check("'decisionScore' alan adı → 'karar puanı' (ücretli eval R3 summary birebir)", /karar puanı orta \(5\/10\)/.test(leak) && !/decisionScore/.test(leak), show(leak));
  }

  // ── A058-B (W2 followup #62/#68): 400 alan istek günlük rapor kotasını YAKMAZ ─────
  console.log("\n── 7) günlük rapor kotası yalnız GEÇERLİ gövdede harcanır (A058-B) ──");
  {
    resetHarness();
    const bad = await route.POST(reportRequest({
      rounds: [{ round: 1, score: "?-?", result: "unknown", died: true }], lang: "tr", map: "summit",
    }));
    check("geçersiz gövde (40ce444f biçimi) → 400 ve günlük kota HARCANMADI (consumeDailyQuota 0)",
      bad.status === 400 && harness.dailyCalls === 0, `got=${bad.status} dailyCalls=${harness.dailyCalls}`);
    check("route verifyAuthAndRateLimit'e { deferDaily: true } veriyor",
      JSON.stringify(harness.verifyOpts[0]) === JSON.stringify({ deferDaily: true }), show(harness.verifyOpts));
    resetHarness();
    const good = await route.POST(reportRequest({
      rounds: [{ round: 1, score: "1 - 0", result: "win", died: false }], lang: "tr", map: "bind",
    }));
    check("geçerli gövde → 200 ve günlük kota TAM 1 kez harcandı", good.status === 200 && harness.dailyCalls === 1,
      `got=${good.status} dailyCalls=${harness.dailyCalls}`);
    resetHarness();
    harness.dailyReject = { status: 429, body: { error: "Daily quota exceeded", retryAfter: 3600, detail: { kind: "daily" } } };
    process.env.OPENAI_API_KEY = "sk-test-not-real";
    const full = await route.POST(reportRequest({
      rounds: [{ round: 1, score: "1 - 0", result: "win", died: false }], lang: "tr", map: "bind",
    }));
    delete process.env.OPENAI_API_KEY;
    const fb = await full.json().catch(() => ({}));
    check("kota dolu → consumeDailyQuota'nın 429 gövdesi aynen döner, AI çağrısı YOK",
      full.status === 429 && fb?.error === "Daily quota exceeded" && harness.fetchCalls.length === 0,
      `got=${full.status} ${show(fb)} fetch=${harness.fetchCalls.length}`);
  }

  console.log(`\n${fail === 0 ? "✅" : "❌"} test-report-score: ${pass} geçti, ${fail} kırık\n`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
