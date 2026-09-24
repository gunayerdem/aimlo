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
 * B06 (2026-09-24, OLCUM-ARACI-09): ölçülen metin route'un GERÇEK sistem mesajı
 * (lib/vision-prompt-builder.ts buildVisionSystemMessage) — elle replika YOK. Eski
 * replikada statik SENARYO REHBERİ (29.669 B) eksikti; "scenario dahil" yeni taban
 * aşağıda BASELINE_B06'da. scripts/test-eval-fidelity.ts [M] kilitler.
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
 *
 * ════════════════════════════════════════════════════════════════════════════
 * FB03 · F58 BİLİNÇLİ KABUL (2026-09-24) — masaüstü taraf değerleri (senaryo F)
 * ════════════════════════════════════════════════════════════════════════════
 * ÖLÇÜLDÜ (bu script, aynı ağaç, lib/ yalnız HEAD↔F58 farkıyla):
 *   F58 ÖNCESİ  F attacking→defending: önek 180.727 / 180.727 B = %100 — ama bu bir
 *               "iyi cache" DEĞİL: KB side filtresi prod değerlerini tanımadığı için HER
 *               istek iki tarafın bölümlerini birden taşıyordu (E side-undefined ile aynı
 *               180.727 B; rakip tarafın ~4,9-5,8 KB'ı her istekte prompt'ta).
 *   F58 SONRASI F: önek 122.277 / 175.861 B = %69,5 (C ile birebir) — devre arasındaki İLK
 *               istekte 53.584 B (~16,7K token) taze; sonraki her istek saldırıda 174.952 B,
 *               savunmada 175.861 B (−5.775 / −4.866 B, çoğu cache'li token).
 * KABUL: yarı başına 2 önek varyantı = maç başına ~1 ek cache-miss (~16,7K taze token ≈
 * $0,004); karşılığında rakip tarafın bölümleri modele "bu tarafın dersi" diye girmez ve
 * sentetik C senaryosunun 2026-07-20'den beri ölçtüğü tasarım prod'da ilk kez gerçekleşir.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { buildVisionSystemMessage, type VisionPromptBody } from "../lib/vision-prompt-builder";

/* ══════════════════════════════════════════════════════════
   İSTEK MODELİ
   ══════════════════════════════════════════════════════════ */

export type PromptOpts = {
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
 * Ölçülen metin = vision route'unun GERÇEK sistem mesajı (B06 · OLCUM-ARACI-09,
 * 2026-09-24). Eskiden burada route'un systemSections kurulumunun ELLE bir
 * replikası vardı; B42/F76'da static'ten hemen sonraya taşınan SENARYO REHBERİ
 * (post-plant/retake/ekonomi, 29.669 B) replikaya hiç eklenmemişti → "toplam B"
 * paydası prod'dan ~29,7 KB kısa, önek oranları yanlış paydayla hesaplanıyordu
 * (profile2 için 2026-07-31'de yaşanan sınıfın tekrarı). Artık route'un çağırdığı
 * AYNI fonksiyon çağrılır: lib/vision-prompt-builder.ts buildVisionSystemMessage.
 * Replika yok → blok taşıması bu ölçüme kendiliğinden yansır.
 *
 * Route'ta öneğin ARDINDAN gelen blok (playerMemoryBlock) burada boş bırakılır
 * (memoryContext ""): ölçülen önekten SONRA duruyor ve öneği etkilemiyor. Yani buradaki
 * "toplam", cache'lenebilir bölgenin tamamıdır. (patternContextBlock FB03 · F46(a) ile
 * sistem mesajından kalktı — pattern yalnız kullanıcı mesajında.)
 */
export function bodyOf(opts: PromptOpts): VisionPromptBody {
  return {
    map: opts.map,
    agent: opts.agent,
    rank: opts.rank,
    enemyComp: opts.enemyAgents,
    spikePlanted: opts.spikePlanted,
    economyType: opts.economyType,
    side: opts.side,
    killerInfo: opts.killerInfo,
    // Karşı-ajan kesiti route'ta died===true kapılı (ölünmeyen round'da bayat
    // killerInfo tetiklemesin) — killerInfo'lu ölçüm senaryosu bir ÖLÜM round'udur.
    died: opts.killerInfo ? true : undefined,
    // confidence yalnız UZUNLUKTAN türetilir; içerik sistem mesajına girmez.
    roundHistory: Array.from({ length: opts.roundHistoryLen ?? 0 }, (_, i) => ({ round_index: i + 1 })),
    lang: opts.lang,
  };
}

export function buildSystemPrompt(opts: PromptOpts): string {
  const lang = opts.lang ?? "tr";
  return buildVisionSystemMessage({ body: bodyOf(opts), lang, memoryContext: "" }).systemMessage;
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

export const SCENARIOS: Scenario[] = [
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
  // FB03 · F58 (2026-09-24): masaüstünün GERÇEK taraf değerleri. C/E sentetik "attack"/
  // "defense" ile ölçüyordu; prod'da masaüstü "attacking"/"defending" gönderir ve F58'e
  // kadar KB side filtresi bu değerleri tanımadığı için prod öneği yarılar arasında HİÇ
  // bölünmüyordu (F = %100). F58 filtreyi prod'da gerçekten çalıştırır → F artık C ile
  // aynı sayıyı verir: yarı başına 2 önek varyantı (bilinçli kabul — aşağıdaki not).
  {
    id: "F",
    name: "side-flip-masaustu",
    why: "Devre arasi side flip, masaustu degerleri (attacking → defending)",
    first: { ...MATCH_1_BASE, side: "attacking" },
    second: { ...MATCH_1_BASE, side: "defending" },
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
   BASELINE-2 — B06 (2026-09-24), "SCENARIO DAHİL" (prod kurucusu)
   ══════════════════════════════════════════════════════════
   OLCUM-ARACI-09: B06'ya kadar bu script route'un elle kopyasını ölçüyordu ve
   kopyada statik SENARYO REHBERİ yoktu. Aşağıdaki sayılar ölçülen metin route'un
   GERÇEK sistem mesajına bağlandıktan sonraki İLK koşudan ALINDI (tahmin DEĞİL).
   Yeni bir prefix-cache değişikliği bu tabana göre "delta B06" sütunuyla okunur.
   Aynı gün ESKİ replikanın (scenario HARİÇ) ölçtüğü değerler — kıyas için:
     A 145.777/145.777 %100 · B 145.777/145.777 %100 · C 92.938/146.686 %63,4 ·
     D 92.291/139.213 %66,3 · E 93.131/151.556 %61,4  (ilk kırılma 92.291 B)
   Yukarıdaki 2026-07-20 BASELINE tarihsel "adım 1-3 öncesi" zeminidir; ikisi
   birlikte basılır.
   ⚠ LF DÜZELTMESİ (W2 inceleme B06-F1, 2026-09-24): ilk sabitlenen değerler (A/B
   175.453, C 122.614/176.362, D 121.967/168.889, E 122.807/181.232, ilk kırılma
   121.967) Windows çalışma ağacının CRLF KB baytlarını içeriyordu — prod (LF) bu
   \r baytlarını HİÇ göndermez. knowledge-loader artık CRLF'i normalize ediyor; aşağıdaki
   değerler aynı koşunun LF (= prod, git index) ölçümü. Yüzdeler ±0,03 pp içinde. */
const BASELINE_B06_FIRST_BREAK = 121_487;
const BASELINE_B06: Record<string, { prefixB: number; totalB: number; prefixPct: number }> = {
  A: { prefixB: 174_802, totalB: 174_802, prefixPct: 100 },
  B: { prefixB: 174_802, totalB: 174_802, prefixPct: 100 },
  C: { prefixB: 122_125, totalB: 175_711, prefixPct: 69.5 },
  D: { prefixB: 121_487, totalB: 168_296, prefixPct: 72.19 },
  E: { prefixB: 122_314, totalB: 180_577, prefixPct: 67.74 },
};

/* ══════════════════════════════════════════════════════════
   KOŞ
   ══════════════════════════════════════════════════════════ */

export type PrefixRow = { id: string; name: string; prefixB: number; totalB: number; pct: number; freshB: number };

/** Her senaryo için ortak önek / toplam (payda = 2. istek, yani faturalanan istek). */
export function measurePrefixScenarios(): PrefixRow[] {
  return SCENARIOS.map((sc) => {
    const p1 = buildSystemPrompt(sc.first);
    const p2 = buildSystemPrompt(sc.second);
    const prefixB = commonPrefixBytes(p1, p2);
    const totalB = byteLen(p2);
    const pct = totalB > 0 ? (prefixB / totalB) * 100 : 0;
    return { id: sc.id, name: sc.name, prefixB, totalB, pct: Number(pct.toFixed(2)), freshB: totalB - prefixB };
  });
}

function main(): void {
  const label = process.argv[2] ?? "run";

  console.log(`\n[measure-prompt-prefix] etiket=${label} tarih=${new Date().toISOString()}`);
  console.log(`Olculen: vision route'unun GERCEK system prompt'u (lib/vision-prompt-builder buildVisionSystemMessage: SYSTEM_PROMPT + policy + static + scenario + profile + profile2 + agent + abilityHint + map + contextual)`);
  console.log(`Not: memory/patternContext bloklari zaten onekten SONRA — oneki etkilemez.\n`);

  const json = measurePrefixScenarios();
  const firstBreak = Math.min(...json.map((r) => r.prefixB));
  const rows = json.map((r) => {
    const base = BASELINE[r.id];
    const b06 = BASELINE_B06[r.id];
    const target = TARGET[r.id];
    return {
      senaryo: `${r.id} ${r.name}`,
      "onek B": r.prefixB,
      "toplam B": r.totalB,
      "onek %": Number(r.pct.toFixed(1)),
      "taze B": r.freshB,
      "~onek tok": toTokens(r.prefixB),
      "~taze tok": toTokens(r.freshB),
      "0720 %": base ? base.prefixPct : "-",
      "B06 %": b06 ? b06.prefixPct : "-",
      "delta B06 pp": b06 ? Number((r.pct - b06.prefixPct).toFixed(1)) : "-",
      hedef: target ? `>=${target}%  ${r.pct >= target ? "OK" : "X"}` : "-",
    };
  });

  console.table(rows);

  for (const sc of SCENARIOS) console.log(`  ${sc.id} = ${sc.why}`);

  const breakDelta = firstBreak - BASELINE_FIRST_BREAK;
  console.log(`\nILK KIRILMA (tum senaryolarin en kisa oneki): ${firstBreak} byte (~${toTokens(firstBreak)} token)`);
  console.log(
    `BASELINE 0720 ilk kirilma: ${BASELINE_FIRST_BREAK} byte (policy icindeki confidence metni) ` +
    `→ delta ${breakDelta >= 0 ? "+" : ""}${breakDelta} byte · BASELINE B06 (scenario dahil): ${BASELINE_B06_FIRST_BREAK} byte ` +
    `→ delta ${firstBreak - BASELINE_B06_FIRST_BREAK >= 0 ? "+" : ""}${firstBreak - BASELINE_B06_FIRST_BREAK} byte`,
  );

  const aPct = json.find((r) => r.id === "A")?.pct;
  const dPct = json.find((r) => r.id === "D")?.pct;
  const pass = (aPct ?? 0) >= TARGET.A && (dPct ?? 0) >= TARGET.D;
  console.log(
    `HEDEF KONTROL: A=${aPct}% (hedef >=${TARGET.A}%) · D=${dPct}% (hedef >=${TARGET.D}%) → ${pass ? "GECTI" : "HENUZ DEGIL (adim 1-3 uygulanmadi)"}`,
  );

  console.log(JSON.stringify({ label, firstBreak, scenarios: json }, null, 0));
}

if (require.main === module) main();
