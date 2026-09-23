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

/** Pricing used when a model id isn't in the table (defensive) — the production
 *  model (lib/ai-model.ts, OLCUM-ARACI-17). scripts/test-billing.ts asserts
 *  PRICING[AI_MODEL] exists, so a model migration without a price row fails CI. */
const FALLBACK_MODEL: string = AI_MODEL;

export type PricingResolution = {
  pricing: ModelPricing;
  /** true → id is in the table (exact or dated-snapshot prefix); false → ESTIMATED at FALLBACK_MODEL's rate. */
  known: boolean;
  /** Table key that supplied the price (FALLBACK_MODEL when unknown). */
  matchedKey: string;
};

// OLCUM-ARACI-16 (B07, 2026-09-24): bilinmeyen id eskiden SESSİZCE fallback fiyatına
// düşüyordu (ölçüm: 'gpt5.6-terra' yazım hatası $0.0041, gerçek 'gpt-5.6-terra' $0.0316
// → 7,7× eksik). Artık id başına YALNIZ BİR KEZ uyarı basılır: /cost her görüntülemede
// gün×route×model satırlarını fiyatlıyor, satır başına log seli olmasın. Kurtarma
// yolu: PRICING tablosuna o id'nin satırını eklemek (uyarı metni bunu söyler).
const warnedUnknownModels = new Set<string>();

function hasPrice(key: string): boolean {
  // Own-property kontrolü: "constructor" gibi id'ler Object.prototype'tan fonksiyon
  // döndürüp computeCost'u NaN yapmasın.
  return Object.prototype.hasOwnProperty.call(PRICING, key);
}

/**
 * Model id → fiyat + fiyatın tablodan mı geldiği. Birebir anahtar, yoksa tarihli
 * snapshot id'leri ("gpt-5-mini-2025-08-07") için EN UZUN önek eşleşmesi — eskiden
 * Object.keys sırasındaki İLK eşleşme alınıyordu; tabloya "gpt-5" gibi kısa bir
 * anahtar eklenseydi "gpt-5-mini-…" onun fiyatını alırdı. Tabloda olmayan id:
 * FALLBACK_MODEL fiyatı + known:false + id başına tek console.warn.
 */
export function resolvePricing(model: string | null | undefined): PricingResolution {
  if (model) {
    if (hasPrice(model)) return { pricing: PRICING[model], known: true, matchedKey: model };
    let best: string | null = null;
    for (const k of Object.keys(PRICING)) {
      if (model.startsWith(k) && (best === null || k.length > best.length)) best = k;
    }
    if (best !== null) return { pricing: PRICING[best], known: true, matchedKey: best };
  }
  const label = model ? model : "(boş)";
  if (!warnedUnknownModels.has(label)) {
    warnedUnknownModels.add(label);
    console.warn(
      `[pricing] unknown model id ${JSON.stringify(model ?? null)} — priced as ${FALLBACK_MODEL} (add a row to PRICING in lib/openai-pricing.ts)`,
    );
  }
  return { pricing: PRICING[FALLBACK_MODEL], known: false, matchedKey: FALLBACK_MODEL };
}

/** Backward-compatible wrapper: price only (unknown id → FALLBACK_MODEL, warned once). */
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
