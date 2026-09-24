// OpenAI price table + cost computation. SINGLE source of truth for $/token —
// the admin /cost panel computes spend from the token columns in public.ai_usage
// at READ time, so updating a rate here re-prices all history correctly with no
// backfill.
//
// ⚠️ VERIFY against the live price page when rates change:
//    https://developers.openai.com/api/docs/pricing  (doğrulandı 2026-09-16)
//    gpt-5-mini: input $0.25 / output $2.00 / cached input $0.025  per 1M tokens — DEĞİŞMEMİŞ.
//
// 📅 GÖÇ TAKVİMİ (model raporu 16.09.2026): `gpt-5-mini-2025-08-07` snapshot'ı
//    11.12.2026'da KAPANIYOR (resmî deprecations, duyuru 11.06.2026); kısa ad alias
//    olduğu için o da düşer. Aday model A/B'si başladı (scripts/eval-vision.ts +
//    EVAL_MODEL), bu yüzden aday satırları ŞİMDİ tabloda olmalı: `pricingFor` bilinmeyen
//    id'yi sessizce gpt-5-mini fiyatına düşürüyordu → admin /cost paneli aday koşularını
//    YANLIŞ fiyatlıyordu (luna gerçekte %20 ucuz, panel gpt-5-mini gibi sayıyordu).
//    B07 (2026-09-24): bilinmeyen id artık uyarılı + sayılı (resolvePricing, /cost rozeti);
//    üretim model id'si TEK KAYNAK lib/ai-model.ts (AI_MODEL).

import { AI_MODEL } from "./ai-model";

export type ModelPricing = {
  /** USD per 1,000,000 fresh (uncached) input tokens. */
  inputPerM: number;
  /** USD per 1,000,000 output (completion) tokens. */
  outputPerM: number;
  /** USD per 1,000,000 cached input tokens (prompt-cache hit). */
  cachedInputPerM: number;
};

export const PRICING: Record<string, ModelPricing> = {
  "gpt-5-mini": { inputPerM: 0.25, outputPerM: 2.0, cachedInputPerM: 0.025 },
  // ── Göç adayları (fiyatlar developers.openai.com/api/docs/pricing, 16.09.2026) ──
  // Yalnız ÖLÇÜM için tabloda; üretim modeli hâlâ gpt-5-mini (lib/ai-model.ts AI_MODEL).
  "gpt-5.6-luna": { inputPerM: 0.2, outputPerM: 1.2, cachedInputPerM: 0.02 },   // birincil aday (≈0.8×)
  "gpt-5.4-nano": { inputPerM: 0.2, outputPerM: 1.25, cachedInputPerM: 0.02 },  // ikincil aday
  "gpt-5.6-terra": { inputPerM: 2.0, outputPerM: 12.0, cachedInputPerM: 0.2 },  // resmî yedek (≈8.6× — elendi)
  "gpt-5-nano": { inputPerM: 0.05, outputPerM: 0.4, cachedInputPerM: 0.005 },
  "gpt-5.4-mini": { inputPerM: 0.75, outputPerM: 4.5, cachedInputPerM: 0.075 },
  "gpt-6-astra": { inputPerM: 10.0, outputPerM: 50.0, cachedInputPerM: 1.0 },   // referans (≈40× — elendi)
};

// ⚠ 5.6+ ailesinde önbellek YAZMA da ücretli (uncached girdinin 1.25×'i, ayrı kalem).
// Bu tablo yalnız okuma/çıkış/cached-okuma taşıyor; yazma kalemi `ai_usage`'da
// ölçülmediği için panelde EKSİK kalır (Luna'da ıskalama başına ≈ $0.01).
// Göçe karar verilirse `ModelPricing.cacheWritePerM` + `TokenUsage.cacheWriteTokens`
// eklenmeli (OpenAI usage nesnesinde böyle bir alan var mı: DOĞRULANMADI).

/** Tarihli snapshot soneki ("gpt-5-mini" + "-2025-08-07"). OpenAI yanıtının `model` alanı
 *  ve ai_usage satırları bu biçimde gelir (206/206 prod satırı: gpt-5-mini-2025-08-07). */
const DATED_SNAPSHOT_SUFFIX_RE = /^-\d{4}-\d{2}-\d{2}$/;

/**
 * Model id → tablo anahtarı: BİREBİR anahtar ya da TARİHLİ SNAPSHOT (anahtar +
 * "-YYYY-MM-DD"); ikisi de değilse null.
 * W2 inceleme B07-F2 (2026-09-24): eski döngü `model.startsWith(k)` ile HER öneki bilinen
 * sayıyordu → kardeş model id'leri sessizce yanlış fiyatlanıyordu (ölçüm:
 * 'gpt-5.6-luna-mini' → known=true key=gpt-5.6-luna; 'gpt-5-mini-tts' → gpt-5-mini; uyarı
 * yok, unpriced 0, rozet yok — OLCUM-ARACI-16'nın kökü bu id sınıfı için sürüyordu).
 * Artık önekten sonra YALNIZ tarih soneki kabul. Own-property kontrolü: "constructor"
 * gibi id'ler Object.prototype'tan fonksiyon döndürüp computeCost'u NaN yapmasın.
 */
export function lookupPricingKey(model: string, table: Record<string, ModelPricing> = PRICING): string | null {
  if (Object.prototype.hasOwnProperty.call(table, model)) return model;
  let best: string | null = null;
  for (const k of Object.keys(table)) {
    if (model.startsWith(k) && DATED_SNAPSHOT_SUFFIX_RE.test(model.slice(k.length)) && (best === null || k.length > best.length)) best = k;
  }
  return best;
}

/**
 * Bilinmeyen id'nin TAHMİNİ fiyatının anahtarı.
 * W2 inceleme B07-F1 (2026-09-24): FALLBACK_MODEL = AI_MODEL idi → PRICING[AI_MODEL]
 * yoksa (göçte unutulan satır ya da tarihli pin 'gpt-5-mini-2025-08-07') fallback fiyatı
 * `undefined` dönüyor, computeCost `p.inputPerM`'de TypeError atıyor ve /admin, /admin/cost,
 * /admin/revenue, /admin/users/[id] 500 veriyordu — B07/2 rozeti tam bu senaryo için
 * vardı ama render bile edilemiyordu. CI (test-billing) deploy kapısı DEĞİL (main push →
 * Vercel). Artık: AI_MODEL tabloda (birebir/tarihli) varsa o; yoksa tablodaki EN PAHALI
 * satır — muhafazakâr: tahmini maliyet asla EKSİK gösterilmez (OLCUM-ARACI-16'nın kökü
 * eksik fiyattı), rozet "tahmini" diye işaretler.
 */
export function pickFallbackPricingKey(table: Record<string, ModelPricing>, aiModel: string): string {
  const own = lookupPricingKey(aiModel, table);
  if (own) return own;
  return Object.keys(table).sort((a, b) =>
    table[b].outputPerM - table[a].outputPerM || table[b].inputPerM - table[a].inputPerM || (a < b ? -1 : a > b ? 1 : 0),
  )[0];
}

/** Tablo-dışı id'nin fiyatlandığı anahtar (bugün AI_MODEL = "gpt-5-mini"). */
export const FALLBACK_PRICING_KEY: string = pickFallbackPricingKey(PRICING, AI_MODEL);
/** Modül yüklenirken alınan kopya — tablo çalışma zamanında değişse (test) bile
 *  resolvePricing ASLA undefined fiyat döndürmez. */
const FALLBACK_PRICING_SNAPSHOT: ModelPricing = { ...PRICING[FALLBACK_PRICING_KEY] };

export type PricingResolution = {
  pricing: ModelPricing;
  /** true → id is in the table (exact or dated-snapshot "-YYYY-MM-DD" suffix); false → ESTIMATED at FALLBACK_PRICING_KEY's rate. */
  known: boolean;
  /** Table key that supplied the price (FALLBACK_PRICING_KEY when unknown). */
  matchedKey: string;
};

// OLCUM-ARACI-16 (B07, 2026-09-24): bilinmeyen id eskiden SESSİZCE fallback fiyatına
// düşüyordu (ölçüm: 'gpt5.6-terra' yazım hatası $0.0041, gerçek 'gpt-5.6-terra' $0.0316
// → 7,7× eksik). Artık id başına YALNIZ BİR KEZ uyarı basılır: /cost her görüntülemede
// gün×route×model satırlarını fiyatlıyor, satır başına log seli olmasın. Kurtarma
// yolu: PRICING tablosuna o id'nin satırını eklemek (uyarı metni bunu söyler).
const warnedUnknownModels = new Set<string>();

/**
 * Model id → fiyat + fiyatın tablodan mı geldiği (lookupPricingKey: birebir ya da
 * tarihli snapshot; EN UZUN anahtar — eskiden Object.keys sırasındaki İLK eşleşme
 * alınıyordu). Tabloda olmayan id: FALLBACK_PRICING_KEY fiyatı + known:false + id başına
 * tek console.warn. ASLA undefined fiyat döndürmez (W2 inceleme B07-F1).
 */
export function resolvePricing(model: string | null | undefined): PricingResolution {
  if (model) {
    const key = lookupPricingKey(model);
    if (key !== null) return { pricing: PRICING[key], known: true, matchedKey: key };
  }
  const label = model ? model : "(boş)";
  if (!warnedUnknownModels.has(label)) {
    warnedUnknownModels.add(label);
    console.warn(
      `[pricing] unknown model id ${JSON.stringify(model ?? null)} — priced as ${FALLBACK_PRICING_KEY} (add a row to PRICING in lib/openai-pricing.ts)`,
    );
  }
  return {
    pricing: PRICING[FALLBACK_PRICING_KEY] ?? FALLBACK_PRICING_SNAPSHOT,
    known: false,
    matchedKey: FALLBACK_PRICING_KEY,
  };
}

/** Backward-compatible wrapper: price only (unknown id → FALLBACK_PRICING_KEY, warned once). */
export function pricingFor(model: string | null | undefined): ModelPricing {
  return resolvePricing(model).pricing;
}

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  /** Subset of promptTokens served from cache (billed at the discounted rate). */
  cachedTokens: number;
};

/**
 * USD cost of one call. Fresh input = promptTokens − cachedTokens (billed at the
 * input rate); cachedTokens billed at the cached rate; completion at the output
 * rate. Returns a number in USD (not rounded — round at display time).
 */
export function computeCost(usage: TokenUsage, model?: string | null): number {
  const p = pricingFor(model);
  const cached = Math.max(0, Math.min(usage.cachedTokens || 0, usage.promptTokens || 0));
  const freshInput = Math.max(0, (usage.promptTokens || 0) - cached);
  return (
    (freshInput / 1_000_000) * p.inputPerM +
    (cached / 1_000_000) * p.cachedInputPerM +
    ((usage.completionTokens || 0) / 1_000_000) * p.outputPerM
  );
}

/** Format a USD amount for the admin UI (e.g. $0.0123, $12.34, -$4.23).
 * Negatif değerler işaret-önde biçimlenir (kâr kartı eksiye düşebilir) —
 * eski hâli negatifte `$-4.2300` gibi kırık string üretiyordu. */
export function formatUsd(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (abs === 0) return "$0";
  if (abs < 0.01) return `${sign}$${abs.toFixed(4)}`;
  if (abs < 1) return `${sign}$${abs.toFixed(3)}`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
