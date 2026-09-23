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
    const a = pick([{ score: "5-3" }, { score: "?-?" }]);
    check("son round '?-?' + önceki '5-3' → 5-3 (HEAD: 400)", a.ok && a.yours === "5" && a.enemy === "3" && a.skippedInvalid === 1, show(a));
    const b = pick([{ score: "7-5" }, { score: "?-?" }, { score: " ? - ? " }]);
    check("iki okunamayan son round → önceki 7-5, skippedInvalid=2", b.ok && b.yours === "7" && b.enemy === "5" && b.skippedInvalid === 2, show(b));
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
    const m = pick([{ score: "5-3" }, { score: "41-3" }]);
    check("aralık dışı (41) son çift atlanır → 5-3", m.ok && m.yours === "5" && m.enemy === "3", show(m));
    const n = pick([{ score: "5-3" }, { score: "" }, { score: "dizi" }]);
    check("2-parçalı OLMAYAN son değerler (eskisi gibi) atlanır, sayılmaz → 5-3", n.ok && n.yours === "5" && n.skippedInvalid === 0, show(n));
    check("isValidScoreValue: 0/40 sınırları", isValidScoreValue("0") && isValidScoreValue("40") && !isValidScoreValue("41") && !isValidScoreValue("?"));
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

  console.log("\n── 3) Route — son round '?-?' raporu düşürmez (A058) ──");
  {
    resetHarness();
    delete process.env.OPENAI_API_KEY; // deterministik yol — AI çağrısı YOK
    const desktopFlat = {
      rounds: [
        { round: 1, score: "1-0", result: "win", died: false, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        { round: 2, score: "1-1", result: "loss", died: true, deathLocation: "A Main", deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        { round: 3, score: "?-?", result: "unknown", died: true, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
      ],
      maxTokens: 800, lang: "tr", map: "ascent", agent: "jett", side: "attacking",
    };
    const res = await route.POST(reportRequest(desktopFlat));
    const body = await res.json().catch(() => ({}));
    check("statü 200 (HEAD: 400 Invalid score values)", res.status === 200, `got=${res.status} ${show(body).slice(0, 160)}`);
    check("scoreStr = son GEÇERLİ skor '1 - 1' (uydurma yok)", body?.scoreStr === "1 - 1", `got=${body?.scoreStr}`);
    check("aiGenerated=false (anahtar yok → şablon, dürüst bayrak)", body?.aiGenerated === false);
    check("fetch hiç çağrılmadı", harness.fetchCalls.length === 0);
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

  console.log(`\n${fail === 0 ? "✅" : "❌"} test-report-score: ${pass} geçti, ${fail} kırık\n`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
