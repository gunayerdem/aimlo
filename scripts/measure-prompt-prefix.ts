/**
 * PROMPT PREFIX-CACHE ÖLÇÜMÜ — "cache oranı %47 → ~%90" iddiasının BAYT KANITI
 * ────────────────────────────────────────────────────────────────────────────
 * Bugüne kadarki tüm cache tahminleri ELLE hesaplandı. Bu script iki farklı
 * istek için vision route'unun GERÇEK system prompt'unu kurar ve aralarındaki
 * ORTAK ÖNEK uzunluğunu bayt bazında ölçer.
 *
 * NEDEN ÖNEK: OpenAI otomatik prompt-cache YALNIZCA prompt'un ÖNEKİNDE çalışır
 * (en uzun ortak önek, 1024 token min, 128'lik artışlar). Önekte TEK bir karakter
 * değişirse o noktadan SONRASI tamamen taze token olarak faturalanır. Dolayısıyla
 * "ortak önek / toplam" oranı = teorik cache-hit üst sınırı.
 *
 * SADECE OKUR VE ÖLÇER: OpenAI çağrısı YOK, dosya yazma YOK, ağ erişimi YOK.
 * RUN: npx tsx scripts/measure-prompt-prefix.ts [etiket]
 *
 * ════════════════════════════════════════════════════════════════════════════
 * BAŞLANGIÇ (BASELINE) — 2026-07-20, adım 1-3 UYGULANMADAN ÖNCE
 * ════════════════════════════════════════════════════════════════════════════
 * Canlı ai_usage (53 çağrı): ortalama 0,00516 USD · prompt 33.298 tok ·
 * cached 15.679 (%47) · output 181. Maliyetin %85'i TAZE prompt token.
 *
 * İLK KIRILMA NOKTASI — ÖLÇÜLDÜ: byte 27.917 = policy bloğu içindeki CONFIDENCE
 * metni. (Elle yapılan tahmin 25.979'du; MEKANİZMA aynı, sayı ~2 KB kaymış —
 * bu script ölçtüğü için artık tahmin değil.) Kanıt: buildPolicyBlock("low") vs
 * ("medium") kendi içinde 8.629. byte'ta ayrılıyor; SYSTEM_PROMPT + ayraç =
 * 19.288 byte önde → 19.288 + 8.629 = 27.917.
 * roundHistory uzunluğu 3→4 olunca (calibrating→low→medium→high, maç başına
 * ~3 kez) bu metin değişiyor ve ARDINDAKİ ~56 KB (static+agent+abilityHint+
 * map+contextual) komple cache dışı kalıp taze faturalanıyor.
 *
 * BASELINE önek oranları — ÖLÇÜLDÜ (makine-okur hâli aşağıdaki BASELINE sabitinde;
 * script her çalıştığında ölçülenle karşılaştırıp DELTA sütununu basar):
 *   A) ardışık round (spike/eco farkı)      → önek %81,5  (83.129 / 102.017 B)
 *   B) confidence kademesi 3→4              → önek %33,3  (27.917 / 83.863 B) ← EN BÜYÜK KAYIP
 *   C) devre arası side flip                → önek %50,9  (43.065 / 84.660 B)
 *   D) tamamen farklı maç                   → önek %32,2  (27.917 / 86.776 B)
 *   E) side=undefined (OCR side kaçırma)    → önek %48,3  (43.258 / 89.530 B)
 *
 * (E) SENARYOSUNUN GERÇEK MALİYETİ — ilk kez ölçüldü, bugüne kadar tahmindi:
 * OCR side'ı kaçırdığında AYNI round için önek %81,5'ten %48,3'e düşüyor;
 * 46.272 byte (~14.460 token) taze faturalanıyor — yani tek bir kaçırılmış
 * side OCR'ı, o çağrının cache'lenebilir bölgesinin yarısını yakıyor.
 *
 * HEDEF — adım 1+2+3 (confidence'ı prefix'ten çıkar · side/eco'yu prompt sonuna
 * taşı · statik blokları öne al) uygulandıktan SONRA beklenen:
 *   A ≥ %90   ·   D ≥ %64
 * ════════════════════════════════════════════════════════════════════════════
 */
import { loadVisionKnowledge } from "../lib/knowledge-loader";
import { buildPolicyBlock } from "../lib/ai-policy";
import { buildAgentAbilityHint } from "../lib/agent-abilities";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_EN_ADDENDUM } from "../lib/vision-prompt";

/* ══════════════════════════════════════════════════════════
   İSTEK MODELİ
   ══════════════════════════════════════════════════════════ */

type PromptOpts = {
  map?: string;
  agent?: string;
  rank?: string;
  enemyAgents?: string[];
  spikePlanted?: boolean;
  economyType?: string;
  side?: string;
  killerInfo?: string;
  /** Desktop'ın gönderdiği round geçmişi UZUNLUĞU — confidence bunu türetir. */
  roundHistoryLen?: number;
  lang?: "tr" | "en";
};

/**
 * vision route'undaki systemSections kurulumunun BİREBİR TAKLİDİ.
 * Referans: app/api/ai/vision/route.ts:650-703 (+ join'i 753. satır).
 * (Satır numaraları karşı-denetim 2026-07-31'de doğrulandı; eski 483-521/587
 *  referansı kaymıştı ve replikanın güncelliğini kontrol etmeyi zorlaştırıyordu.)
 * Sıra KOPYALANIR, mantık ÇOĞALTILMAZ — yalnız ölçüm amaçlı.
 *
 * Route'ta bunun ARDINDAN gelen iki blok burada YOK, çünkü ikisi de zaten
 * ölçülen önekten SONRA duruyor ve öneği etkilemiyor:
 *   - playerMemoryBlock (kullanıcıya özel)
 *   - patternContextBlock (her round değişir)
 * Yani buradaki "toplam", cache'lenebilir bölgenin tamamıdır.
 */
function buildSystemPrompt(opts: PromptOpts): string {
  const lang = opts.lang ?? "tr";

  const kb = loadVisionKnowledge({
    map: opts.map,
    agent: opts.agent,
    rank: opts.rank,
    enemyAgents: opts.enemyAgents,
    spikePlanted: opts.spikePlanted,
    economyType: opts.economyType,
    side: opts.side,
    killerInfo: opts.killerInfo,
  });

  // route.ts: confidence roundHistory uzunluğundan türetilir
  const n = opts.roundHistoryLen ?? 0;
  const visionConfidence = n === 0 ? "calibrating" : n < 4 ? "low" : n < 8 ? "medium" : "high";

  const systemSections: string[] = [
    lang === "en" ? SYSTEM_PROMPT + SYSTEM_PROMPT_EN_ADDENDUM : SYSTEM_PROMPT,
    buildPolicyBlock({
      confidence: visionConfidence,
      tone: "strict",
      lang,
      includeEnemyGate: true,
      includeDecisionRubric: false,
      anchorMode: "ocr",
      outputFocusMode: "single",
      enemyGateMode: "vision",
      // Route ile SENKRON (2026-07-20): confidence metni prefix'ten çıkarılıp
      // user mesajına taşındı. Bu satır olmazsa script ESKİ prompt'u ölçer ve
      // yanlış-negatif regresyon sinyali verir.
      confidenceInPrefix: false,
    }),
  ];
  if (kb.blocks.static) systemSections.push(kb.blocks.static);
  // Blok 0b — koçluk profili (universal.md). Route'ta static'ten hemen sonra;
  // replikada da aynı yerde olmalı, yoksa ölçüm gerçeği yansıtmaz.
  if (kb.blocks.profile) systemSections.push(kb.blocks.profile);
  // Blok 0c — profilin 2. sayfası (universal-2.md). KARŞI-DENETİM 2026-07-31 (R11):
  // B37 bölünmesinde route.ts:693 bu bloğu kazandı ama replika güncellenmemişti →
  // ölçülen statik önek prod'dakinden ~4,5 KB KISA çıkıyor, cache-hit hedefi (A≥%90,
  // D≥%64) yanlış paydayla değerlendiriliyordu. Route'taki sırayla geri eklendi.
  if (kb.blocks.profile2) systemSections.push(kb.blocks.profile2);
  if (kb.blocks.agent) systemSections.push(kb.blocks.agent);
  const abilityHint = buildAgentAbilityHint(opts.agent, lang);
  if (abilityHint) systemSections.push(abilityHint);
  if (kb.blocks.map) systemSections.push(kb.blocks.map);
  if (kb.blocks.contextual) systemSections.push(kb.blocks.contextual);

  return systemSections.join("\n\n---\n\n");
}

/* ══════════════════════════════════════════════════════════
   ORTAK ÖNEK — ilk farklı BAYT indeksi
   ══════════════════════════════════════════════════════════ */

/** İki string'in ilk farklı bayt indeksini döndürür (= ortak önek bayt sayısı). */
function commonPrefixBytes(a: string, b: string): number {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  const max = Math.min(ba.length, bb.length);
  let i = 0;
  while (i < max && ba[i] === bb[i]) i++;
  return i;
}

const byteLen = (s: string) => Buffer.byteLength(s, "utf8");
const toTokens = (bytes: number) => Math.round(bytes / 3.2); // TR: ~3,2 bayt/token

/* ══════════════════════════════════════════════════════════
   SENARYOLAR
   ══════════════════════════════════════════════════════════ */

// Ortak maç zemini: Ascent / Jett / saldırı
const MATCH_1_BASE: PromptOpts = {
  map: "Ascent",
  agent: "Jett",
  side: "attack",
  enemyAgents: ["Omen", "Cypher", "Sova", "Reyna", "Sage"],
  roundHistoryLen: 5,
  economyType: "full_buy",
  killerInfo: "killed by omen with vandal",
};

type Scenario = {
  id: string;
  name: string;
  why: string;
  first: PromptOpts;
  second: PromptOpts;
};

const SCENARIOS: Scenario[] = [
  {
    id: "A",
    name: "ardisik-round",
    why: "Ayni mac, ardisik iki round — yalniz spikePlanted/economyType farki",
    first: MATCH_1_BASE,
    second: { ...MATCH_1_BASE, spikePlanted: true, economyType: "eco" },
  },
  {
    id: "B",
    name: "confidence-3-4",
    why: "Ayni mac, roundHistory 3 → 4 (confidence low → medium)",
    first: { ...MATCH_1_BASE, roundHistoryLen: 3 },
    second: { ...MATCH_1_BASE, roundHistoryLen: 4 },
  },
  {
    id: "C",
    name: "side-flip",
    why: "Devre arasi side flip (attack → defense)",
    first: MATCH_1_BASE,
    second: { ...MATCH_1_BASE, side: "defense" },
  },
  {
    id: "D",
    name: "farkli-mac",
    why: "Tamamen farkli mac (Ascent/Jett → Bind/Omen)",
    first: MATCH_1_BASE,
    second: {
      map: "Bind",
      agent: "Omen",
      side: "defense",
      enemyAgents: ["Raze", "Skye", "Viper", "Killjoy", "Neon"],
      roundHistoryLen: 9,
      economyType: "full_buy",
      killerInfo: "killed by raze with phantom",
    },
  },
  {
    id: "E",
    name: "side-undefined",
    why: "OCR side kacirma: side=attack → side=undefined (ayni round!)",
    first: MATCH_1_BASE,
    second: { ...MATCH_1_BASE, side: undefined },
  },
];

/* ══════════════════════════════════════════════════════════
   BASELINE (2026-07-20, adım 1-3 ÖNCESİ) — önce/sonra farkı için sabit
   ══════════════════════════════════════════════════════════
   Bu sayılar bu script'in 2026-07-20 baseline koşusundan ALINDI (tahmin DEĞİL).
   Adım 1-3 uygulandıktan sonra script tekrar koşulur; DELTA sütunu farkı basar.
   Bu bloğu adım 1-3 SONRASI GÜNCELLEME — karşılaştırma zemini olarak kalmalı.

   KARŞI-DENETİM 2026-07-31 (R11) NOTU: profile2 (universal-2.md) replikaya geri
   bağlandığı için hem "onek B" hem "toplam B" sütunları baseline'a göre ~4,5 KB
   büyür. profile2 SABİT önek bölgesinde durduğundan bu ölçüm-düzeltmesi oranları
   düşürmez; delta okurken bayt farkını içerik büyümesiyle karıştırma. */
const BASELINE_FIRST_BREAK = 27_917; // = SYSTEM_PROMPT+ayraç 19.288 + policy-içi confidence 8.629
const BASELINE: Record<string, { prefixB: number; prefixPct: number }> = {
  A: { prefixB: 83_129, prefixPct: 81.5 },
  B: { prefixB: 27_917, prefixPct: 33.3 },
  C: { prefixB: 43_065, prefixPct: 50.9 },
  D: { prefixB: 27_917, prefixPct: 32.2 },
  E: { prefixB: 43_258, prefixPct: 48.3 },
};

/** Adım 1+2+3 sonrası beklenen hedefler (yalnız A ve D icin sozlesme). */
const TARGET: Record<string, number> = { A: 90, D: 64 };

/* ══════════════════════════════════════════════════════════
   KOŞ
   ══════════════════════════════════════════════════════════ */

const label = process.argv[2] ?? "run";

console.log(`\n[measure-prompt-prefix] etiket=${label} tarih=${new Date().toISOString()}`);
console.log(`Olculen: vision system prompt (SYSTEM_PROMPT + policy + static + profile + profile2 + agent + abilityHint + map + contextual)`);
console.log(`Not: memory/patternContext bloklari zaten onekten SONRA — oneki etkilemez.\n`);

const rows: Array<Record<string, string | number>> = [];
const json: Array<Record<string, unknown>> = [];
let firstBreak = Number.POSITIVE_INFINITY;

for (const sc of SCENARIOS) {
  const p1 = buildSystemPrompt(sc.first);
  const p2 = buildSystemPrompt(sc.second);

  const prefixB = commonPrefixBytes(p1, p2);
  // Payda = 2. istek (faturalanan istek): onun kaci cache'ten gelebilir?
  const totalB = byteLen(p2);
  const pct = totalB > 0 ? (prefixB / totalB) * 100 : 0;
  const freshB = totalB - prefixB;

  if (prefixB < firstBreak) firstBreak = prefixB;

  const base = BASELINE[sc.id];
  const target = TARGET[sc.id];

  rows.push({
    senaryo: `${sc.id} ${sc.name}`,
    "onek B": prefixB,
    "toplam B": totalB,
    "onek %": Number(pct.toFixed(1)),
    "taze B": freshB,
    "~onek tok": toTokens(prefixB),
    "~taze tok": toTokens(freshB),
    "baseline %": base ? base.prefixPct : "-",
    "delta pp": base ? Number((pct - base.prefixPct).toFixed(1)) : "-",
    hedef: target ? `>=${target}%  ${pct >= target ? "OK" : "X"}` : "-",
  });

  json.push({ id: sc.id, name: sc.name, prefixB, totalB, pct: Number(pct.toFixed(2)), freshB });
}

console.table(rows);

for (const sc of SCENARIOS) console.log(`  ${sc.id} = ${sc.why}`);

const breakDelta = firstBreak - BASELINE_FIRST_BREAK;
console.log(`\nILK KIRILMA (tum senaryolarin en kisa oneki): ${firstBreak} byte (~${toTokens(firstBreak)} token)`);
console.log(
  `BASELINE ilk kirilma: ${BASELINE_FIRST_BREAK} byte (policy icindeki confidence metni) ` +
  `→ delta ${breakDelta >= 0 ? "+" : ""}${breakDelta} byte`,
);

const aPct = json.find(r => r.id === "A")?.pct as number | undefined;
const dPct = json.find(r => r.id === "D")?.pct as number | undefined;
const pass = (aPct ?? 0) >= TARGET.A && (dPct ?? 0) >= TARGET.D;
console.log(
  `HEDEF KONTROL: A=${aPct}% (hedef >=${TARGET.A}%) · D=${dPct}% (hedef >=${TARGET.D}%) → ${pass ? "GECTI" : "HENUZ DEGIL (adim 1-3 uygulanmadi)"}`,
);

console.log(JSON.stringify({ label, firstBreak, scenarios: json }, null, 0));
