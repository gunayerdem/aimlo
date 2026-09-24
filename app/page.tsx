import LandingClient from "./LandingClient";

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
 * Kural PricingPageBody.tsx ile AYNI: yalnız tam "true" string'i açık sayılır.
 * lib/entitlements'tan import EDİLMİYOR (aynı gerekçe: o zincir service-role
 * anahtarını import anında doğruluyor; halka açık pazarlama sayfası o sırra
 * bağlanmasın). Bayrak Vercel'de değişince redeploy zaten gerekiyor
 * (docs/LAUNCH_RUNBOOK.md §1.2).
 */
export default function Home() {
  const quotaEnforced = process.env.FREE_TIER_ENFORCED === "true";
  return <LandingClient quotaEnforced={quotaEnforced} />;
}
