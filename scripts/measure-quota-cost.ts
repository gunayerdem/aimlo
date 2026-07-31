/**
 * KANONİK MALİYET TAVANI ÖLÇÜMÜ — "bir kullanıcı en kötü günde kaç dolar yakar?"
 *
 * NEDEN VAR (denetim 2026-07-31): aynı soruya kod içinde iki farklı cevap vardı.
 * `lib/api-auth.ts:41` yorumu "~$0.20/gün üst sınır/kullanıcı" diyor; ölçüm ise
 * bunun katlarını çıkarıyor. İki sebep: (a) yorum YALNIZ vision'ı sayıyor,
 * feedback/report/insight günlük kotalarını hiç toplamıyor; (b) yorum yazıldığından
 * beri sistem promptu ve KB büyüdü. Kota/fiyatlama kararları bu yüzden yanlış
 * rakamla veriliyordu — bu script tek doğru kaynağı üretir.
 *
 * Elle yazılmış maliyet sabiti YOK: KB yükü gerçek loader'dan ölçülür, fiyat
 * lib/openai-pricing.ts'ten okunur. Yalnız günlük kotalar api-auth.ts'ten elle
 * kopyalanmıştır (aşağıda not düşüldü) çünkü DAILY_QUOTA export edilmiyor.
 *
 * Koşum:  npx tsx scripts/measure-quota-cost.ts
 */
import { loadKnowledge, loadVisionKnowledge } from "../lib/knowledge-loader";
import { PRICING } from "../lib/openai-pricing";

const P = PRICING["gpt-5-mini"];

/**
 * lib/api-auth.ts DAILY_QUOTA ile AYNI olmalı. DAILY_QUOTA export edilmediği için
 * burada tekrarlanıyor — api-auth.ts'te kota değiştirirsen burayı da güncelle.
 */
const DAILY_QUOTA = { vision: 100, feedback: 200, report: 30, insight: 60 } as const;

/** Gerçekçi en-kötü girdi: bilinen harita/ajan + 5 düşmanlı tam kadro. */
const CTX = {
  map: "Ascent",
  agent: "Jett",
  enemyAgents: ["Sova", "Killjoy", "Omen", "Reyna", "Sage"],
  side: "attack",
};

/** Türkçe metinde ~3.2 bayt/token (repo ölçüm kalibrasyonu). */
const BYTES_PER_TOKEN = 3.2;
const tok = (bytes: number) => Math.round(bytes / BYTES_PER_TOKEN);

/**
 * prompt-cache oranı. Yalnız vision statik-önek stratejisiyle tasarlandı;
 * ölçülen değer bugün ~%86 (denetim 2026-07-31, hedef %90 → FAIL).
 * Diğer route'ların cache stratejisi yok → 0 kabul edilir.
 */
const CACHE = { vision: 0.86, feedback: 0, report: 0, insight: 0 } as const;
/** Şema sınırlarına göre tipik çıktı uzunluğu (max_completion_tokens mertebesi). */
const OUT = { vision: 350, feedback: 300, report: 700, insight: 400 } as const;

function callCost(kbBytes: number, cacheHit: number, outTokens: number) {
  const inTok = tok(kbBytes);
  const cached = Math.round(inTok * cacheHit);
  const fresh = inTok - cached;
  return (fresh * P.inputPerM + cached * P.cachedInputPerM + outTokens * P.outputPerM) / 1_000_000;
}

function main() {
  console.log("\n══ KANONİK MALİYET TAVANI — gpt-5-mini ══\n");
  console.log(`fiyat: taze $${P.inputPerM}/M · cache $${P.cachedInputPerM}/M · çıktı $${P.outputPerM}/M`);
  console.log(`girdi: ${CTX.map} / ${CTX.agent} / ${CTX.enemyAgents.length} düşman\n`);

  const sizes: Record<string, number> = {
    vision: Buffer.byteLength(loadVisionKnowledge(CTX).content, "utf8"),
    feedback: Buffer.byteLength(loadKnowledge("feedback", CTX), "utf8"),
    report: Buffer.byteLength(loadKnowledge("report", CTX), "utf8"),
    insight: Buffer.byteLength(loadKnowledge("insight", CTX), "utf8"),
  };

  let total = 0;
  for (const task of ["vision", "feedback", "report", "insight"] as const) {
    const bytes = sizes[task];
    const per = callCost(bytes, CACHE[task], OUT[task]);
    const day = per * DAILY_QUOTA[task];
    total += day;
    console.log(
      `  ${task.padEnd(9)} ${(bytes / 1024).toFixed(0).padStart(4)}KB ≈ ${String(tok(bytes)).padStart(6)} tok` +
        ` · cache %${String(Math.round(CACHE[task] * 100)).padStart(2)}` +
        ` · $${per.toFixed(5)}/çağrı × ${String(DAILY_QUOTA[task]).padStart(3)}/gün` +
        ` = $${day.toFixed(2)}/gün`,
    );
  }

  console.log(`\n  EN-KÖTÜ GÜN / KULLANICI: $${total.toFixed(2)}   ·   30 günde $${(total * 30).toFixed(0)}`);
  console.log(`  AIMLO+ fiyatı $9.99/ay → kotasız tek kullanıcı fiyatın ${((total * 30) / 9.99).toFixed(1)}× katını yakabilir.`);
  console.log(`  api-auth.ts:41 yorumu ("~$0.20/gün") ${(total / 0.2).toFixed(0)}× DÜŞÜK — yalnız vision'ı sayıyor.\n`);

  // Tipik (abuse olmayan) kullanım: günde 3 maç, maç başına ~12 ölüm + 1 rapor.
  const perMatch = callCost(sizes.vision, CACHE.vision, OUT.vision) * 12 + callCost(sizes.report, 0, OUT.report);
  console.log(`  Referans — TİPİK kullanım: maç başı $${perMatch.toFixed(4)}`);
  console.log(`    3 maç/gün  → $${(perMatch * 3 * 30).toFixed(2)}/ay    (3-maç/hafta kotası ≈ $${(perMatch * 12).toFixed(2)}/ay)`);
  console.log(`    60 maç/ay  → $${(perMatch * 60).toFixed(2)}/ay  ·  başa baş: ~${Math.round(9.99 / perMatch)} maç/ay\n`);
}

main();
