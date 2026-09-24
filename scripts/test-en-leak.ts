/**
 * TR-SIZINTI DETEKTÖRÜ TESTİ + EN KORPUS STATİK GUARD'I — B60
 * (pano özellik dalgası, 2026-08-04)
 * ─────────────────────────────────────────────────────────────────────────────
 * NEDEN: EN çıktı kalitesi hiç ölçülmemişti; evals/en-leak-detector.ts bu boşluğu
 * kapatıyor ama "hiç ateşlenmeyen guard işe yaramaz" (denetim gecesi dersi,
 * 2026-07-31) — bu test detektörü SENTETİK örneklerle iki yönde sınar:
 *   1) temiz EN koç metni GEÇMELİ (yanlış-pozitif avı: "you've", "once",
 *      "predictable", "Hookah" gibi tuzaklar dahil),
 *   2) TR-sızıntılı metin YAKALANMALI (Türkçe karakter, ASCII-bozuk TR kelime,
 *      apostrof-ek, EN hedge) — kategori bazında doğrulanır.
 * Ek guard'lar:
 *   3) EN_HEDGE_BANNED ↔ CONFIDENCE_PROMPTS_EN senkronu (policy değişirse
 *      ölçüt sessizce eskiyemez — test kırmızıya döner),
 *   4) evals/en-corpus.ts'in MODEL GİRDİSİ olan alanları (patternContext,
 *      memoryContext, killerInfo, deathLocation, playerRoute, killfeed,
 *      rapor userPrompt) statik taranır: korpusun kendisi sızıntısız olmalı,
 *   5) korpus boyutu görev bandında (20-33; B60'ın 20-30'u + B05 inceleme ER5
 *      gerçek-maç rapor fixture'ı + FB03 F58 iki masaüstü-taraf senaryosu) ve
 *      died/survived karışımı var.
 *
 * API ÇAĞRISI YOK — tamamen statik/sentetik. RUN: npx tsx scripts/test-en-leak.ts
 */
import {
  detectEnLeak,
  hedgeListInSyncWithPolicy,
  EN_HEDGE_BANNED,
  type EnLeakCategory,
} from "../evals/en-leak-detector";
import { EN_VISION_SCENARIOS, EN_REPORT_SCENARIOS, EN_CORPUS_TOTAL } from "../evals/en-corpus";
import { realityCheck } from "../lib/reality-checker";
import { buildVisionContext, type VisionPromptBody } from "../lib/vision-prompt-builder";
import { toRoundMemory } from "../lib/vision-postprocess";
import { buildReportCleaner, validateRequest } from "../lib/report-prompt";

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ── 1) TEMİZ EN ÖRNEKLERİ — hepsi geçmeli (yanlış-pozitif avı) ───────────────
console.log("\n── 1) Temiz EN koç metni (yanlış-pozitif avı) ──");
const CLEAN_SAMPLES: { name: string; text: string }[] = [
  {
    name: "düz koç cümlesi (callout + eylem)",
    text: "You died at A Main holding a wide angle against the Killjoy turret. Hold the corner next to cover and wait for the first contact before you peek.",
  },
  {
    name: "trade/entry dili + Hookah callout'u",
    text: "They traded you instantly at Hookah because you entered before your flash popped. Enter with your team and let the smoke land first.",
  },
  {
    name: "İngilizce kısaltma 'you've' ('ve apostrof-ek DEĞİL)",
    text: "You've kept the Operator alive through the eco round; that is the right call. Keep it for the next full buy.",
  },
  {
    name: "'once'/'predictable' (TR listesindeki 'önce'nin ASCII'si BİLEREK dışarıda)",
    text: "That off-angle makes you predictable once the enemy has seen it twice. Swap to the other side of the crate after the first kill.",
  },
  {
    name: "kesin dil — hedge yok (was/is, 'unlikely' alt-dizgi tuzağı yok)",
    text: "The Jett was holding Mid Doors with the Operator. Do not force that duel; hit B Main with your team and make the retake unlikely to succeed.",
  },
  {
    name: "rapor tarzı (round referansları + yüzde)",
    text: "R4 and R9 show the same mistake: you anchored B Main alone. Your survival rate on defense is 38% — stack with the Sage and cross the site together.",
  },
];
for (const s of CLEAN_SAMPLES) {
  const r = detectEnLeak(s.text);
  check(
    s.name,
    r.clean,
    r.hits.map((h) => `${h.category}:${h.hit}`).join(", "),
  );
}

// ── 2) SIZINTILI ÖRNEKLER — kategori bazında yakalanmalı ─────────────────────
console.log("\n── 2) TR-sızıntılı metin (yakalama) ──");
const LEAKY_SAMPLES: { name: string; text: string; expect: EnLeakCategory[] }[] = [
  {
    name: "Türkçe karakter + kelime (düşman)",
    text: "You died at A Main because düşman read your angle.",
    expect: ["turkish-char", "turkish-word"],
  },
  {
    name: "ASCII-bozuk TR cümle (raundu/dusman/kafadan/vurdu)",
    text: "Bu raundu kaybettin, dusman kafadan vurdu.",
    expect: ["turkish-word"],
  },
  {
    name: "apostrof-ek (A Main'de)",
    text: "Hold the corner at A Main'de and wait for the swing.",
    expect: ["apostrophe-suffix"],
  },
  {
    name: "EN hedge (might be + it seems)",
    text: "The Jett might be waiting behind the box; it seems risky to peek.",
    expect: ["en-hedge"],
  },
  {
    name: "karışık sızıntı (aciyi/tuttun + could be)",
    text: "Aciyi wide tuttun, that could be punished by the Operator.",
    expect: ["turkish-word", "en-hedge"],
  },
  {
    name: "combining-dot U+0307 (dotted-i mirası)",
    text: "Hold the Mi̇d angle after the flash.",
    expect: ["turkish-char"],
  },
];
for (const s of LEAKY_SAMPLES) {
  const r = detectEnLeak(s.text);
  const cats = new Set(r.hits.map((h) => h.category));
  const missing = s.expect.filter((c) => !cats.has(c));
  check(
    s.name,
    !r.clean && missing.length === 0,
    r.clean ? "temiz sanıldı (kaçak!)" : `eksik kategori: ${missing.join(", ")} | bulunan: ${[...cats].join(", ")}`,
  );
}

// Nokta-atışı: hedge listesindeki HER kalıp tek başına yakalanmalı.
console.log("\n── 2b) Hedge kalıpları tek tek ──");
for (const h of EN_HEDGE_BANNED) {
  const r = detectEnLeak(`This ${h} the reason you lost the duel.`);
  check(
    `hedge "${h}"`,
    r.hits.some((x) => x.category === "en-hedge" && x.hit === h),
  );
}

// ── 3) POLİCY SENKRON GUARD'I ────────────────────────────────────────────────
console.log("\n── 3) EN_HEDGE_BANNED ↔ CONFIDENCE_PROMPTS_EN senkronu ──");
const sync = hedgeListInSyncWithPolicy();
check(
  "hedge listesi CONFIDENCE_PROMPTS_EN.calibrating ile uyumlu",
  sync.ok,
  sync.missing.length ? `policy metninde geçmeyen: ${sync.missing.join(", ")}` : "",
);

// ── 4) EN KORPUS STATİK TARAMASI — model girdileri sızıntısız olmalı ─────────
console.log("\n── 4) evals/en-corpus.ts statik sızıntı taraması ──");
let corpusLeaks = 0;
for (const sc of EN_VISION_SCENARIOS) {
  const b = sc.body as Record<string, unknown>;
  const inputs: string[] = [];
  for (const k of ["patternContext", "killerInfo", "deathLocation", "deathAngle", "playerRoute", "loadout"]) {
    if (typeof b[k] === "string") inputs.push(b[k] as string);
  }
  if (Array.isArray(b.killfeedOrder)) inputs.push((b.killfeedOrder as string[]).join(" "));
  if (sc.memoryContext) inputs.push(sc.memoryContext);
  const r = detectEnLeak(inputs.join(" \n "));
  if (!r.clean) {
    corpusLeaks++;
    console.log(`  ❌ ${sc.id} → ${r.hits.map((h) => `${h.category}:${h.hit}`).join(", ")}`);
  }
}
// B05 (OLCUM-ARACI-11): EN rapor senaryoları artık ReportRequest fixture'ı
// (evals/report-fixtures/ER*.json). Modele giden SERBEST METİN alanları taranır
// (kadro/harita/ajan + round konumu, katil bağlamı, analiz, not, hafıza). Prod'un
// kendi sabit şablon satırları (TR side etiketi, "kim seni en çok öldürdü") korpus
// değil → prompt'un tamamı taranmaz. Boş girdi taraması sessizce "temiz" demesin
// diye her fixture'ın analiz metni taşıdığı ayrıca kilitlenir.
function reportFixtureInputs(sc: (typeof EN_REPORT_SCENARIOS)[number]): string {
  const b = sc.body as Record<string, unknown>;
  const parts: string[] = [];
  for (const k of ["map", "agent", "rank", "mode", "side"]) if (typeof b[k] === "string") parts.push(b[k] as string);
  for (const k of ["enemyComp", "teamComp"]) if (Array.isArray(b[k])) parts.push((b[k] as string[]).join(" "));
  for (const r of (Array.isArray(b.rounds) ? b.rounds : []) as Record<string, unknown>[]) {
    for (const k of ["deathLocation", "killerInfo", "deathAnalysis", "yourNote", "coachInsight", "nextRoundSuggestion"]) {
      if (typeof r[k] === "string") parts.push(r[k] as string);
    }
    if (Array.isArray(r.enemyAnalysis)) parts.push((r.enemyAnalysis as string[]).join(" "));
  }
  if (sc.memoryContext) parts.push(sc.memoryContext);
  return parts.join(" \n ");
}
let reportAnalysisChars = 0;
for (const sc of EN_REPORT_SCENARIOS) {
  const rounds = ((sc.body as Record<string, unknown>).rounds ?? []) as Record<string, unknown>[];
  reportAnalysisChars += rounds.reduce((n, r) => n + (typeof r.deathAnalysis === "string" ? r.deathAnalysis.length : 0), 0);
  const r = detectEnLeak(reportFixtureInputs(sc));
  if (!r.clean) {
    corpusLeaks++;
    console.log(`  ❌ ${sc.id} → ${r.hits.map((h) => `${h.category}:${h.hit}`).join(", ")}`);
  }
}
check(`korpusun ${EN_CORPUS_TOTAL} senaryosunun model girdileri sızıntısız`, corpusLeaks === 0, `${corpusLeaks} senaryoda sızıntı`);
check(`EN rapor fixture taraması boş değil (analiz metni ${reportAnalysisChars} kr)`, reportAnalysisChars > 100);

// ── 5) KORPUS KAPSAM GUARD'LARI (görev bandı + karışım) ──────────────────────
console.log("\n── 5) Korpus kapsamı ──");
// B05 inceleme (2026-09-24): üst sınır 30 → 31. B60 bandı 26 vision + 4 rapor
// senaryosuyla tam 30'du; ER5 (masaüstü düz gövdesi birebir, tam round listesi —
// A058 round-skoru yolunu eval'de koşturan TEK EN fixture) eklenince 31 oldu.
// FB03 · F58 (2026-09-24): 31 → 33. Masaüstünün GERÇEK taraf değerleri ("attacking"/
// "defending") eval korpusunda hiç yoktu (hepsi sentetik attack/defense) → prod'daki etiket /
// KB side-filtresi / [SENARYO İPUCU] kırığı ölçülemiyordu. E27 (defending+spike) + E28
// (attacking) eklendi; bant yalnız bu iki senaryo kadar genişledi (koşu maliyeti +2 çağrı).
check(
  `toplam senaryo 20-33 bandında (şu an ${EN_CORPUS_TOTAL})`,
  EN_CORPUS_TOTAL >= 20 && EN_CORPUS_TOTAL <= 33,
);
const died = EN_VISION_SCENARIOS.filter((s) => (s.body as Record<string, unknown>).died === true).length;
const survived = EN_VISION_SCENARIOS.filter((s) => (s.body as Record<string, unknown>).died === false).length;
check(`died/survived karışımı var (died=${died}, survived=${survived})`, died >= 10 && survived >= 2);
check(`rapor senaryoları var (${EN_REPORT_SCENARIOS.length})`, EN_REPORT_SCENARIOS.length >= 3);
const allEn = [...EN_VISION_SCENARIOS].every(
  (s) => s.lang === "en" && (s.body as Record<string, unknown>).lang === "en",
);
check("her vision senaryosu lang='en' (Scenario.lang + body.lang)", allEn);
const badIds = [...EN_VISION_SCENARIOS, ...EN_REPORT_SCENARIOS].filter(
  // eval-score mapOfId/agentOfId sözleşmesi: parça[1]=harita, parça[2]=ajan (küçük harf).
  (s) => !/^E[R]?\d+-[a-z]+-[a-z]+-/.test(s.id),
);
check("id'ler eval-score mapOfId/agentOfId sözleşmesine uyuyor", badIds.length === 0, badIds.map((s) => s.id).join(", "));

// ── 6) EN ÖLÇÜLMEMİŞ KONUM NÖTRLEYİCİSİ (TR-KALAN-13, 2026-09-23) ────────────
// HEAD: konum okunmamışken "You held the same corner at A Heaven…" DEĞİŞMEDEN
// geçiyordu (EN aynası yalnız "died at / killed you at" ölüm fiilini yakalıyordu).
console.log("\n── 6) EN konum nötrleyici (hasDeathLocation=false) ──");
{
  const noLoc = { hasDeathLocation: false } as never;
  const en = (s: string, rh: unknown[] = []) => realityCheck(s, rh as never, noLoc, "death", "en").text;
  const a = en("You held the same corner at A Heaven and Jett killed you from there.");
  check("2. şahıs geçmiş 'you held … at A Heaven' → 'there'",
    a === "You held the same corner there and Jett killed you from there.", `→ "${a}"`);
  check("nötrlenen metin sızıntısız (detectEnLeak temiz)", detectEnLeak(a).clean, detectEnLeak(a).hits.map((h) => h.hit).join(", "));
  const b = en("Jett was waiting for you at B Main.");
  check("3. şahıs + kurban çapası ('for you') → 'at B Main' kalkar", b === "Jett was waiting for you there.", `→ "${b}"`);
  // Bayt-aynı kilitleri: emir/öğüt, kurban çapasız müttefik cümlesi, ölçülmüş konum, bayrak.
  for (const s of [
    "Hold the angle at A Heaven next round.",
    "Your teammate held B Main.",
    "Your teammate was holding at B Main while you pushed.",
    "You got caught near the window and lost the duel.",
  ]) check(`bayt-aynı: "${s.slice(0, 40)}…"`, en(s) === s, `→ "${en(s)}"`);
  const c = "You held the same corner at A Heaven and Jett killed you from there.";
  // B02 inceleme: geçmiş round konumu yalnız GEÇMİŞE ÇAPALI cümlede muaf ("In R1 …");
  // çapasız cümle geçmiş konumu bu round'a yapıştırır → nötrlenir.
  const rhHeaven = [{ round_index: 1, died: true, death_position: "a heaven", position_confidence: "high" }];
  const cR = "In R1 you held the same corner at A Heaven and Jett killed you from there.";
  check("ölçülmüş GEÇMİŞ konum (R-çapalı, roundHistory 'a heaven') bayt-aynı", en(cR, rhHeaven) === cR, `→ "${en(cR, rhHeaven)}"`);
  check("çapasız geçmiş konum nötrlenir ('there')",
    en(c, rhHeaven) === "You held the same corner there and Jett killed you from there.", `→ "${en(c, rhHeaven)}"`);
  // FB05 · F14 BEKLENTİ DARALTILDI: eski başlık "hasDeathLocation:true iken bayt-aynı" genel
  // bir sözleşme gibi okunuyor ve konum biliniyorken "You died at <başka callout>" iddiasının
  // hiç denetlenmemesini (bulgu F14) doğru davranış diye kilitliyordu. Bu cümle bayt-aynı
  // kalmalı ama gerekçesi DAR: ölçülen konum değeri yok ve "A Heaven" ölüm fiiline değil
  // "held"e bağlı (bu round'un pozisyon betimi, nötrleyici bayrağı false değil).
  check("hasDeathLocation:true, ölçülen konum yok, callout 'held'e bağlı → bayt-aynı",
    realityCheck(c, [] as never, { hasDeathLocation: true } as never, "death", "en").text === c);
  // Karşı vaka: konum ÖLÇÜLMÜŞ ve metin bu round başka callout'ta öldüğünü söylüyor → ölçülen konum.
  const fgSite = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const d = realityCheck("You died at B Main this round, so hold a tighter angle.", [] as never, fgSite, "death", "en", "Ascent").text;
  check("hasDeathLocation:true + ölçülen 'a site' → 'You died at B Main' → 'at A Site'",
    d === "You died at A Site this round, so hold a tighter angle.", `→ "${d}"`);
  check("düzeltilen metin sızıntısız (detectEnLeak temiz)", detectEnLeak(d).clean, detectEnLeak(d).hits.map((h) => h.hit).join(", "));
}

// ── FB06 · F85 — EN sayım silmesi parantez artığı + "multiple times in the match" ──
console.log("\n── FB06 · F85: EN sayım silmesi '( )' bırakmaz; kanıtsız çapraz-round niceliği yan-cümlece düşer ──");
{
  // Korpus E25 NR (cycleb06-pre-syn-rp / cycler5syn), prod zinciriyle aynı factGround/hafıza.
  // HEAD: "This round you died at Hookah multiple times in the match ( ) — on the next round …"
  // (doğru "3 deaths in the last 7 rounds" siliniyor, kanıtsız "at Hookah multiple times" kalıyordu).
  const sc = EN_VISION_SCENARIOS.find((x) => x.id === "E25-bind-waylay-atk-no-killer");
  if (!sc) throw new Error("E25 senaryosu yok");
  const b = sc.body as VisionPromptBody;
  const fg = buildVisionContext(b, "en").factGround;
  const nr = "This round you died at Hookah multiple times in the match (3 deaths in the last 7 rounds) — on the next round avoid solo wide peeks into Hookah: have one teammate clear high angle while you hold a tightened crosshair for the head and enter together with a trade ready.";
  const o = realityCheck(nr, toRoundMemory(b.roundHistory as never), fg, "suggestion", "en", b.map as string).text;
  check("E25 NR: '( )' artığı yok", !/\(\s*[,;:]?\s*\)/.test(o), `→ "${o}"`);
  check("E25 NR: kanıtsız 'multiple times in the match' yan-cümlesi düştü", !/multiple times/.test(o), `→ "${o}"`);
  check("E25 NR: öğüt 'avoid solo wide peeks into Hookah' kaldı", /avoid solo wide peeks into Hookah/.test(o), `→ "${o}"`);
  check("E25 NR: sonuç sızıntısız (detectEnLeak temiz)", detectEnLeak(o).clean, detectEnLeak(o).hits.map((h) => h.hit).join(", "));
  // Onarım halkası (level-3): tekrar anahtarı olmayan yan-cümlede sayım + pencere silinir.
  const mem7 = Array.from({ length: 7 }, (_, i) => ({ round_index: i + 1, died: i % 2 === 1, death_position: null }));
  const fgA = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const o3 = realityCheck("You died at Hookah (3 deaths in the last 7 rounds) — avoid solo wide peeks into Hookah.", mem7 as never, fgA, "suggestion", "en").text;
  check("level-3 onarım: '(3 deaths in the last 7 rounds)' → parantez artığı kalmaz",
    o3 === "You died at Hookah — avoid solo wide peeks into Hookah.", `→ "${o3}"`);
  // Onarım halkası (level-2 EN sayım silmesi, actualCount<2 → replacement "").
  const mem1 = [
    { round_index: 1, died: false, death_position: null },
    { round_index: 2, died: true, death_position: "b main", position_confidence: "high" },
  ];
  const o2 = realityCheck("You keep losing B Main (3 times) — hold a tighter angle.", mem1 as never, fgA, "suggestion", "en").text;
  check("level-2 onarım: '(3 times)' silinince '()' kalmaz", o2 === "You keep losing B Main — hold a tighter angle.", `→ "${o2}"`);
  // Negatif: dokunulmamış metin (parantez dahil) bayt-aynı; öğüt 'multiple times' anahtar değil.
  for (const s of [
    "You died at A Site again (R2 · R4 · R6) — hold a tighter angle next round.",
    "Peek multiple times with your flash before you commit to A Site.",
    "Swing A Main multiple times this round with a teammate ready to trade.",
  ]) {
    const x = realityCheck(s, mem7 as never, fgA, "suggestion", "en").text;
    check(`bayt-aynı: "${s.slice(0, 44)}…"`, x === s, `→ "${x}"`);
  }
}

// ── FB07 · F84: B35 düşman-util guard'ı KİŞİ ayırıyor (EN) ────────────────────────
// Fix olmadan: oyuncunun kendi ajanıyla öz-eleştirisi ("As Brimstone you used your smokes
// too early…") ve emir kipindeki öğüt ("Set up a crossfire…") siliniyordu; rapor ER5
// bestRound gerekçesi düşüp yalnız "Repeat the same…" kalıyordu.
console.log("\n[F84] B35 kişi ayrımı — öz-eleştiri/öğüt korunur, düşman-util iddiası düşer");
{
  const e16 = EN_VISION_SCENARIOS.find((s) => s.id === "E16-bind-brimstone-def-late-def");
  if (!e16) throw new Error("E16 senaryosu yok");
  const { factGround: fg16 } = buildVisionContext(e16.body as unknown as VisionPromptBody, "en");
  const mem16 = toRoundMemory((e16.body as { roundHistory?: Record<string, unknown>[] }).roundHistory ?? []);
  const rc16 = (s: string, kind: "death" | "suggestion") => realityCheck(s, mem16 as never, fg16, kind, "en", "Bind").text;
  for (const kind of ["death", "suggestion"] as const) {
    const a = "Raze killed you on A Site. As Brimstone you used your smokes too early, so the site was open. Keep one smoke for post-plant.";
    check(`exp12 [${kind}] 'As Brimstone you used your smokes too early…' korunur`, rc16(a, kind) === a, `→ "${rc16(a, kind)}"`);
    const b = "Anchor A. Set up a crossfire with a teammate from Lamps so Raze can't duel you; use your smokes to delay the retake.";
    check(`exp12 [${kind}] 'Anchor A. Set up a crossfire…' tam kalır`, rc16(b, kind) === b, `→ "${rc16(b, kind)}"`);
  }
  // Düşman-util iddiası hâlâ düşer (3. şahıs "set up" + ayna-pick'te "Enemy" öznesi).
  const c = rc16("Raze killed you on A Site. Cypher set up a trap at A Lamps. Keep one smoke for post-plant.", "death");
  check("'Cypher set up a trap at A Lamps.' düşer", c === "Raze killed you on A Site. Keep one smoke for post-plant.", `→ "${c}"`);
  const d = rc16("Raze killed you on A Site. Enemy Brimstone used smokes on A Main. Keep one smoke for post-plant.", "death");
  check("ayna-pick 'Enemy Brimstone used smokes…' (oyuncu Brimstone) düşer", d === "Raze killed you on A Site. Keep one smoke for post-plant.", `→ "${d}"`);
  // Rapor: ER5 bestRound (report-b09-base-en ham metni BİREBİR) gerekçesiyle geri gelir.
  const cleanerOf = (id: string) => {
    const fx = EN_REPORT_SCENARIOS.find((s) => s.id === id);
    if (!fx) throw new Error(`${id} yok`);
    const v = validateRequest(fx.body);
    if (!v.valid) throw new Error(`${id} geçersiz`);
    return buildReportCleaner(v.data);
  };
  const er5raw = "R4 — coordinated entry executed: util used before wide peek, Brimstone stayed off the open line and team traded; result: clean site take and no Brimstone early death. Repeat the same util-first, second-man entry pattern at B.";
  const er5 = cleanerOf("ER5-summit-brimstone-atk-fullmatch")(er5raw, 500, "(FALLBACK)");
  check("rapor ER5 bestRound gerekçesi geri gelir", er5 === er5raw, `→ "${er5}"`);
  // 4 DOĞRU silme sürer (ER2, oyuncu Raze; eval-out ham metinleri BİREBİR).
  const er2 = cleanerOf("ER2-bind-raze-atk-win");
  for (const s of [
    "Enemy used Cypher trap at Hookah (R4) to punish solo entry. Opposing setup included defenders able to hold Showers and Hookah angles (deaths at Hookah R4 and Showers R14).",
    "Enemy used Cypher tripwire to punish lone entries (R4). Chamber and long-hold tools present make off-angle and anchor plays possible.",
    "Enemy used Cypher to anchor Hookah with trap; Chamber and Brimstone present but not top killers. Hookah showed as weakest area for you (top mistake flagged).",
    "Enemy used Cypher tripwire to punish isolated Hookah entries (R4). No repeated multi-round deaths, but Hookah is the clear vulnerability.",
  ]) {
    const out = er2(s, 1000, "(FALLBACK)");
    check(`doğru silme sürer: "${s.slice(0, 40)}…"`, !/Enemy used Cypher/.test(out) && out.length > 0 && out !== "(FALLBACK)", `→ "${out}"`);
  }
}

// ── SONUÇ ────────────────────────────────────────────────────────────────────
console.log(`\n══════ SONUÇ: ${pass} geçti / ${fail} kaldı ══════\n`);
if (fail > 0) process.exit(1);
