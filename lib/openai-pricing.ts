// OpenAI price table + cost computation. SINGLE source of truth for $/token —
// the admin /cost panel computes spend from the token columns in public.ai_usage
// at READ time, so updating a rate here re-prices all history correctly with no
// backfill.
//
// ⚠️ VERIFY against the live price page when rates change:
//    https://openai.com/api/pricing/  (confirmed 2026-06-25 for gpt-5-mini)
//    gpt-5-mini: input $0.25 / output $2.00 / cached input $0.025  per 1M tokens.

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
};

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
