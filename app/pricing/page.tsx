import type { Metadata } from "next";
import { PricingPageBody } from "../fiyatlandirma/PricingPageBody";

export const metadata: Metadata = {
  title: "Pricing — AIMLO",
  description:
    "AIMLO+ subscription pricing: $9.99 a month or $95.88 a year (VAT included). AI-powered round-end coaching for Valorant.",
  alternates: {
    canonical: "/pricing",
    languages: { "tr-TR": "/fiyatlandirma", en: "/pricing" },
  },
};

/** İngilizce fiyatlandırma rotası — dil EN'e SABİT (softi 2026-07-21).
 *  Türkçe eşi: app/fiyatlandirma (aynı gövde, lang="TR"). Landing'deki
 *  "Get AIMLO+" düğmesi site dili EN iken buraya yönlendiriyor. */
export default function PricingPage() {
  return <PricingPageBody lang="EN" />;
}
