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
 *   5) korpus boyutu görev bandında (20-30) ve died/survived karışımı var.
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
for (const sc of EN_REPORT_SCENARIOS) {
  const r = detectEnLeak(sc.userPrompt);
  if (!r.clean) {
    corpusLeaks++;
    console.log(`  ❌ ${sc.id} → ${r.hits.map((h) => `${h.category}:${h.hit}`).join(", ")}`);
  }
}
check(`korpusun ${EN_CORPUS_TOTAL} senaryosunun model girdileri sızıntısız`, corpusLeaks === 0, `${corpusLeaks} senaryoda sızıntı`);

// ── 5) KORPUS KAPSAM GUARD'LARI (görev bandı + karışım) ──────────────────────
console.log("\n── 5) Korpus kapsamı ──");
check(
  `toplam senaryo 20-30 bandında (şu an ${EN_CORPUS_TOTAL})`,
  EN_CORPUS_TOTAL >= 20 && EN_CORPUS_TOTAL <= 30,
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

// ── SONUÇ ────────────────────────────────────────────────────────────────────
console.log(`\n══════ SONUÇ: ${pass} geçti / ${fail} kaldı ══════\n`);
if (fail > 0) process.exit(1);
