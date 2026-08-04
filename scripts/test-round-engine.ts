/**
 * ROUND-ENGINE SAF FONKSİYON TESTLERİ (F60, pano dalga 2026-08-04)
 * NEDEN: lib/round-engine.ts'in export ettiği 5 saf fonksiyon (analyzeRoundPatterns /
 * generateDeathContext / generateDeathPatterns / generateNextRoundPlan /
 * computeMatchInsights) feedback + report route'larının prompt'una VERİ üretir ama
 * script-katmanında hiç birim testi yoktu — eşik/sıralama/streak mantığındaki bir
 * regresyon ancak canlı feedback bozulunca görülürdü. Testler tamamen OFFLINE
 * (fs/ağ yok) ve deterministik.
 * RUN: npx tsx scripts/test-round-engine.ts
 */
import {
  analyzeRoundPatterns,
  generateDeathContext,
  generateDeathPatterns,
  generateNextRoundPlan,
  computeMatchInsights,
  type PatternData,
} from "../lib/round-engine";
import { BANNED_PHRASES } from "../lib/ai-policy";
import type { RoundData, SetupData } from "../types";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};

// ── Fixture yardımcıları ────────────────────────────────────────────────────
const SETUP: SetupData = {
  map: "Ascent",
  agent: "Jett",
  side: "attack",
  teamComp: [],
  enemyComp: [],
  unknownEnemyComp: false,
};

const R = (n: number, o: Partial<RoundData> = {}): RoundData => ({
  roundNumber: n,
  deathLocation: "",
  enemyCount: "",
  yourNote: "",
  result: "loss",
  skipped: false,
  survived: false,
  feedback: null,
  ...o,
});

// PatternData fixture — generateNextRoundPlan'ı izole test etmek için.
const P = (o: Partial<PatternData> = {}): PatternData => ({
  deathLocationFrequency: {},
  repeatedDeathLocations: [],
  deathsWithoutTrade: 0,
  deathSiteConcentration: [],
  repeatedDeathPositions: [],
  deathTimingPattern: "mixed",
  playerWeakSide: null,
  playerWeakMap: null,
  survivalRate: 0.5,
  winStreak: 0,
  lossStreak: 0,
  recentPerformance: "stable",
  overallConfidence: "low",
  ...o,
});

console.log("\n[1] analyzeRoundPatterns — boş girişte güvenli varsayılanlar");
{
  const p = analyzeRoundPatterns([], SETUP);
  t("survivalRate 0", p.survivalRate === 0);
  t("overallConfidence low", p.overallConfidence === "low");
  t("streak'ler 0", p.winStreak === 0 && p.lossStreak === 0);
  t("deathTimingPattern mixed", p.deathTimingPattern === "mixed");
  t("tekrar listeleri boş", p.repeatedDeathLocations.length === 0 && p.deathSiteConcentration.length === 0);
}

console.log("\n[2] analyzeRoundPatterns — tekrar/trade/site matematiği");
{
  const rounds = [
    R(1, { deathLocation: "B Main", result: "loss" }),
    R(2, { deathLocation: "B Main", result: "loss" }),
    R(3, { survived: true, result: "win" }),
    R(4, { deathLocation: "B Main", result: "win" }), // ölüm ama round kazanıldı → trade sayılır
    R(5, { deathLocation: "Market", result: "loss" }),
  ];
  const p = analyzeRoundPatterns(rounds, SETUP);
  t("deathLocationFrequency doğru", p.deathLocationFrequency["B Main"] === 3 && p.deathLocationFrequency["Market"] === 1);
  t("repeatedDeathLocations = [B Main] (2+ eşiği)", p.repeatedDeathLocations.length === 1 && p.repeatedDeathLocations[0] === "B Main");
  t("deathsWithoutTrade = 3 (yalnız LOSS ölümleri)", p.deathsWithoutTrade === 3, `→ ${p.deathsWithoutTrade}`);
  t("survivalRate 1/5", p.survivalRate === 0.2, `→ ${p.survivalRate}`);
  const top = p.deathSiteConcentration[0];
  t("site yoğunluğu B (3/4 → high)", !!top && top.site === "B" && top.frequency === 3 && top.confidence === "high",
    `→ ${JSON.stringify(p.deathSiteConcentration)}`);
  t("Market → Mid site eşlemesi", p.deathSiteConcentration.some((s) => s.site === "Mid" && s.frequency === 1));
  t("lossStreak 1 (R5 loss, R4 win keser)", p.lossStreak === 1 && p.winStreak === 0);
}

console.log("\n[3] streak — skipped round'lar seriyi KIRMAZ (continue sözleşmesi)");
{
  const p1 = analyzeRoundPatterns(
    [R(1, { survived: true, result: "win" }), R(2, { skipped: true }), R(3, { survived: true, result: "win" })],
    SETUP,
  );
  t("win-win-arada-skip → winStreak 2", p1.winStreak === 2, `→ ${p1.winStreak}`);
  const p2 = analyzeRoundPatterns(
    [R(1, { result: "loss" }), R(2, { result: "loss" }), R(3, { skipped: true })],
    SETUP,
  );
  t("loss-loss-sonda-skip → lossStreak 2", p2.lossStreak === 2, `→ ${p2.lossStreak}`);
}

console.log("\n[4] overallConfidence eşikleri (<10 low · 10-20 medium · >20 high)");
{
  const mk = (n: number) => Array.from({ length: n }, (_, i) => R(i + 1, { survived: true, result: "win" }));
  t("9 round → low", analyzeRoundPatterns(mk(9), SETUP).overallConfidence === "low");
  t("10 round → medium", analyzeRoundPatterns(mk(10), SETUP).overallConfidence === "medium");
  t("21 round → high", analyzeRoundPatterns(mk(21), SETUP).overallConfidence === "high");
}

console.log("\n[5] deathTimingPattern — erken/geç dağılım (1.5× eşiği)");
{
  const early = [
    R(1, { deathLocation: "Mid" }), R(2, { deathLocation: "Mid" }), R(3, { deathLocation: "Mid" }),
    R(4, { survived: true, result: "win" }), R(5, { survived: true, result: "win" }), R(6, { survived: true, result: "win" }),
  ];
  t("ölümler ilk yarıda → fast", analyzeRoundPatterns(early, SETUP).deathTimingPattern === "fast");
  const late = [
    R(1, { survived: true, result: "win" }), R(2, { survived: true, result: "win" }), R(3, { survived: true, result: "win" }),
    R(4, { deathLocation: "Mid" }), R(5, { deathLocation: "Mid" }), R(6, { deathLocation: "Mid" }),
  ];
  t("ölümler ikinci yarıda → slow", analyzeRoundPatterns(late, SETUP).deathTimingPattern === "slow");
}

console.log("\n[6] generateDeathContext — reason öncelik sırası deterministik");
{
  // 3+ aynı konum → repeated_position her şeyi ezer
  const rep = [R(1, { deathLocation: "Hookah" }), R(2, { deathLocation: "Hookah" }), R(3, { deathLocation: "Hookah", yourNote: "peek attım" })];
  const c1 = generateDeathContext(rep[2], rep, SETUP);
  t("3× aynı konum → repeated_position (not'taki 'peek'e rağmen)", c1.reason === "repeated_position" && c1.timesAtSameLocation === 3,
    `→ ${c1.reason}/${c1.timesAtSameLocation}`);
  // enemyCount >= 3 → isolated
  const iso = R(1, { deathLocation: "Mid", enemyCount: "3" });
  t("enemyCount 3 → isolated", generateDeathContext(iso, [iso], SETUP).reason === "isolated");
  // not anahtar kelimeleri
  const peek = R(1, { deathLocation: "A Main", yourNote: "geniş peek attım" });
  t("not 'peek' → overpeek", generateDeathContext(peek, [peek], SETUP).reason === "overpeek");
  const solo = R(1, { deathLocation: "A Main", yourNote: "yalnız kaldım" });
  t("not 'yalnız' → no_trade", generateDeathContext(solo, [solo], SETUP).reason === "no_trade");
  const util = R(1, { deathLocation: "A Main", yourNote: "flash kullanmadan girdim" });
  t("not 'flash' → utility_miss", generateDeathContext(util, [util], SETUP).reason === "utility_miss");
  const plain = R(1, { deathLocation: "A Main" });
  t("sinyal yok → bad_timing (varsayılan)", generateDeathContext(plain, [plain], SETUP).reason === "bad_timing");
}

console.log("\n[7] generateDeathContext — kenar durumlar");
{
  const win = R(1, { deathLocation: "Mid", result: "win" });
  t("öldü ama round win → wasTraded true", generateDeathContext(win, [win], SETUP).wasTraded === true);
  const loss = R(1, { deathLocation: "Mid", result: "loss" });
  t("öldü + round loss → wasTraded false", generateDeathContext(loss, [loss], SETUP).wasTraded === false);
  // Boş deathLocation: `=== location && location` guard'ı sayacı 0 tutmalı
  // (guard silinirse boş-konumlu TÜM ölümler birbirini "aynı yer" sayar).
  const empty = R(1, { deathLocation: "" });
  const many = [empty, R(2, { deathLocation: "" }), R(3, { deathLocation: "" })];
  const ce = generateDeathContext(empty, many, SETUP);
  t("boş konum → timesAtSameLocation 0 (falsy-guard)", ce.timesAtSameLocation === 0, `→ ${ce.timesAtSameLocation}`);
}

console.log("\n[8] generateNextRoundPlan — strateji dalları");
{
  const fake = generateNextRoundPlan(P({ deathSiteConcentration: [{ site: "A", frequency: 3, confidence: "high" }] }), SETUP);
  t("high+3 site → fake_A_go_other", fake.suggestedApproach === "fake_A_go_other", `→ ${fake.suggestedApproach}`);
  t("fake hint'i site adını taşıyor", fake.strategyHint.includes("A fake at"), `→ ${fake.strategyHint}`);
  const avoid = generateNextRoundPlan(P({ repeatedDeathLocations: ["b main"] }), SETUP);
  t("tekrar konum → kaçınma hint'i", avoid.strategyHint.includes("pozisyonlarından kaçın") && avoid.avoidLocations[0] === "b main");
  const trade = generateNextRoundPlan(P({ deathsWithoutTrade: 3 }), SETUP);
  t("trade'siz 3+ ölüm → takım hint'i", trade.strategyHint.includes("takımla birlikte hareket et"));
  const stable = generateNextRoundPlan(P(), SETUP);
  t("sinyalsiz → boş hint (uydurma yok)", stable.strategyHint === "" && stable.suggestedApproach === "default");
}

console.log("\n[9] 🔴 YASAK-KALIP REGRESYON KİLİDİ (dil denetimi 2026-07-25 fix'i)");
{
  // 'declining' dalı eskiden "daha pasif oyna, bilgi topla" üretiyordu — ikisi de
  // BANNED_PHRASES'te. Fix somut derse çevirdi; bu test dalın geri gelmesini kilitler.
  const dec = generateNextRoundPlan(P({ recentPerformance: "declining" }), SETUP);
  t("declining → somut ders var", dec.strategyHint.includes("ilk temasa sen girme"), `→ ${dec.strategyHint}`);
  t("'bilgi topla' YOK", !dec.strategyHint.toLowerCase().includes("bilgi topla"));
  t("'daha pasif oyna' YOK", !dec.strategyHint.toLowerCase().includes("daha pasif oyna"));
  // Süpürme: temsilî tüm dallardan çıkan hint'ler hiçbir yasak kalıbı içermemeli
  // (prompt'a ipucu olarak giren metin = modelin kopyalayacağı metin).
  const hints = [
    dec,
    generateNextRoundPlan(P({ deathSiteConcentration: [{ site: "B", frequency: 4, confidence: "high" }], deathsWithoutTrade: 4, recentPerformance: "declining" }), SETUP),
    generateNextRoundPlan(P({ repeatedDeathLocations: ["mid", "a main"], deathsWithoutTrade: 3 }), SETUP),
  ].map((x) => x.strategyHint.toLowerCase());
  const violations: string[] = [];
  for (const h of hints) {
    for (const phrase of BANNED_PHRASES) {
      if (h.includes(phrase.toLowerCase())) violations.push(`"${phrase}" ← "${h}"`);
    }
  }
  t(`üretilen hiçbir hint yasak kalıp içermiyor (${BANNED_PHRASES.length} kalıp × ${hints.length} hint)`,
    violations.length === 0, `\n      ${violations.join("\n      ")}`);
}

console.log("\n[10] computeMatchInsights — skor sınırları deterministik");
{
  const worst = [R(1, { deathLocation: "Mid Window" }), R(2, { deathLocation: "Mid Window" }), R(3, { deathLocation: "Mid Window" }), R(4, { deathLocation: "Mid Window" })];
  const iw = computeMatchInsights(worst, SETUP);
  t("hepsi-loss → decisionScore 1 (taban)", iw.decisionScore === 1, `→ ${iw.decisionScore}`);
  t("topMistake konum+sayı taşıyor", iw.topMistake === "Mid Window'de 4 kez ölüm", `→ ${iw.topMistake}`);
  t("weakestArea = en sık konum", iw.weakestArea === "Mid Window");
  t("worstPattern tekrar konumunu söylüyor", iw.worstPattern.includes("Mid Window"));
  t("iyileştirme alanları dolu (pozisyon + hayatta kalma)",
    iw.improvementAreas.some((a) => a.includes("Pozisyon")) && iw.improvementAreas.some((a) => a.includes("Hayatta kalma")));

  const best = Array.from({ length: 5 }, (_, i) => R(i + 1, { survived: true, result: "win" }));
  const ib = computeMatchInsights(best, SETUP);
  t("hepsi-win+survive → decisionScore 8 (wr*5 + surv*3)", ib.decisionScore === 8, `→ ${ib.decisionScore}`);
  t("bestRound = ilk survived+win", ib.bestRound === 1);
  t("kusursuz maçta iyileştirme alanı yok", ib.improvementAreas.length === 0, `→ ${JSON.stringify(ib.improvementAreas)}`);
  t("tekrar yoksa dürüst metin", ib.topMistake === "Belirgin tekrar yok" && ib.weakestArea === "N/A");
}

console.log("\n[11] generateDeathPatterns — özet satırları veriden türetiliyor");
{
  const rounds = [R(1, { deathLocation: "B Main" }), R(2, { deathLocation: "B Main" }), R(3, { deathLocation: "B Main" })];
  const g = generateDeathPatterns(rounds, SETUP);
  t("zamanlama satırı her zaman var", g.summary.includes("Ölüm zamanlama paterni"));
  t("sabit-pozisyon davranışı sayıyla", g.agentHabits.some((h) => h.behavior === "B Main — sabit pozisyon (3 kez)"),
    `→ ${JSON.stringify(g.agentHabits)}`);
  t("sitePreference analyzeRoundPatterns ile tutarlı", g.sitePreference[0]?.site === "B" && g.sitePreference[0]?.frequency === 3);
}

console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
if (fail > 0) process.exit(1);
