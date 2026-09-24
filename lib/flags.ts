/**
 * BAYRAK YAPRAĞI — tek kaynak, SIFIR import (FB02 inceleme · B9 ayna, 2026-09-25).
 *
 * KANIT: `process.env.FREE_TIER_ENFORCED === "true"` kuralı dört yerde literal
 * kopyaydı — lib/entitlements.ts (asıl kota kapısı), app/fiyatlandirma/PricingPageBody.tsx
 * (fiyat sayfası beta cümlesi), app/page.tsx (landing betaNote) ve lib/admin-infra.ts
 * (/admin/altyapi bayrak kartı). Test yalnız landing literal'ini kilitliyordu; kapının
 * kuralı değişirse (ör. "1" de kabul edilirse) kapı açılır ama landing ve fiyat sayfası
 * hâlâ "Beta süresince her şey sınırsız" derdi — F91'in kapattığı yanlışın aynısı.
 *
 * NEDEN AYRI MODÜL: halka açık pazarlama sayfaları lib/entitlements'ı import ETMEZ
 * (lib/entitlements → lib/billing → lib/supabase/server zinciri servis-rol anahtarını
 * import anında doğruluyor). Bu dosya hiçbir şey import etmez; herkes buradan okur.
 * Kural: yalnız tam "true" string'i açık sayılır ("1", "TRUE" kapalı). Bayrak Vercel'de
 * değişince redeploy gerekir (docs/LAUNCH_RUNBOOK.md §1.2).
 */

/** Kota kapısı açık mı? Varsayılan KAPALI — env açıkça "true" olmalı. */
export function isFreeTierEnforced(): boolean {
  return process.env.FREE_TIER_ENFORCED === "true";
}
