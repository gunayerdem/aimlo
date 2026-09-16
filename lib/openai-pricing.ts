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
  // Yalnız ÖLÇÜM için tabloda; üretim modeli hâlâ gpt-5-mini (lib/ai-* rotaları).
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

/** Pricing used when an exact model id isn't in the table (defensive). */
const FALLBACK_MODEL = "gpt-5-mini";

export function pricingFor(model: string | null | undefined): ModelPricing {
  if (model && PRICING[model]) return PRICING[model];
  // Tolerate dated ids like "gpt-5-mini-2025-08-07".
  if (model) {
    const base = Object.keys(PRICING).find((k) => model.startsWith(k));
    if (base) return PRICING[base];
  }
  return PRICING[FALLBACK_MODEL];
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
