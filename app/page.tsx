import LandingClient from "./LandingClient";
import { isFreeTierEnforced } from "@/lib/flags";

/**
 * Ana sayfa — ince SUNUCU sarmalayıcısı (F91, 2026-09-24).
 *
 * NEDEN: landing SSS'indeki "Beta süresince her şey sınırsız ve ücretsiz"
 * cümlesi sabit metindi. FREE_TIER_ENFORCED açıldığı gün fiyat sayfası
 * "haftada 3 maç" derken landing "her şey sınırsız" diyecekti. Bayrak sunucu
 * env'i (NEXT_PUBLIC_ değil); eski app/page.tsx "use client" olduğu için onu
 * okuyamıyordu. Gövde olduğu gibi ./LandingClient.tsx'e taşındı, bayrak burada
 * okunup prop olarak geçiliyor.
 *
 * Kural kota kapısı ve PricingPageBody.tsx ile TEK KAYNAKTA: lib/flags.ts
 * isFreeTierEnforced (yalnız tam "true" string'i açık; FB02 inceleme · B9 ayna —
 * eskiden burada literal kopyaydı). lib/entitlements'tan import EDİLMİYOR (o zincir
 * service-role anahtarını import anında doğruluyor; lib/flags sıfır import'lu).
 * Bayrak Vercel'de değişince redeploy zaten gerekiyor (docs/LAUNCH_RUNBOOK.md §1.2).
 */
export default function Home() {
  const quotaEnforced = isFreeTierEnforced();
  return <LandingClient quotaEnforced={quotaEnforced} />;
}
