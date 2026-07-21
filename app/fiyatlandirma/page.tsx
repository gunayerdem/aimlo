import type { Metadata } from "next";
import { PricingPageBody } from "./PricingPageBody";

export const metadata: Metadata = {
  title: "Fiyatlandırma — AIMLO",
  description:
    "AIMLO+ abonelik fiyatları: aylık 499 TL, yıllık 4.790 TL (KDV dahil). Valorant için yapay zekâ destekli round-sonu koçluk.",
  alternates: {
    canonical: "/fiyatlandirma",
    languages: { "tr-TR": "/fiyatlandirma", en: "/pricing" },
  },
};

/** Türkçe fiyatlandırma rotası — dil TR'ye SABİT (softi 2026-07-21).
 *  İngilizce eşi: app/pricing (aynı gövde, lang="EN"). */
export default function FiyatlandirmaPage() {
  return <PricingPageBody lang="TR" />;
}
