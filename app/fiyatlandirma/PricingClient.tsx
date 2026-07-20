"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ *
 * FİYATLAR — TEK KAYNAK.
 * Fiyat değişikliği YALNIZCA burada yapılır; sayfanın geri kalanı bu
 * sabitten okur. Tüm tutarlar KDV DAHİLDİR (dijital hizmet, KDV %20).
 *
 * Türkiye'de yerleşik müşteriye dövizle fiyatlama mevzuat gereği
 * yapılamaz (Tebliğ 2008-32/34 Md. 8/7) — ödeme adımında TR ikametli
 * müşteri / Türk kartı her hâlükârda TL ile ücretlendirilir.
 * ------------------------------------------------------------------ */
export const PRICING = {
  TR: {
    locale: "TR",
    currencyCode: "TRY",
    monthly: {
      price: "499 TL",
      periodLabel: "/ay",
    },
    yearly: {
      price: "4.790 TL",
      periodLabel: "/yıl",
      perMonth: "399 TL",
      discountPct: 20,
    },
  },
  EN: {
    locale: "EN",
    currencyCode: "USD",
    monthly: {
      price: "$9.99",
      periodLabel: "/mo",
    },
    yearly: {
      price: "$95.88",
      periodLabel: "/yr",
      perMonth: "$7.99",
      discountPct: 20,
    },
  },
} as const;

type Lang = keyof typeof PRICING;
type Plan = "aylik" | "yillik";

const COPY = {
  TR: {
    planName: "AIMLO Pro",
    planTagline: "Tek ürün, iki faturalama dönemi.",
    monthlyTab: "Aylık",
    yearlyTab: "Yıllık",
    discountBadge: "%20 indirim",
    perMonthNote: (v: string) => `Aylık karşılığı ${v}`,
    vatNote: "KDV dahil",
    billedYearly: "Yılda bir kez tek çekim olarak tahsil edilir.",
    billedMonthly: "Her ay tek çekim olarak tahsil edilir.",
    cta: "Satın Al",
    featuresTitle: "Pakete dahil olanlar",
    features: [
      "Canlı round-sonu ölüm analizi",
      "Düşman pattern tespiti",
      "Sonraki round önerisi",
      "Maç sonu detaylı rapor",
      "Geçmiş maç arşivi",
      "İlerleme takibi",
      "Türkçe ve İngilizce koçluk dili",
    ],
    currencyLabel: "Para birimi",
  },
  EN: {
    planName: "AIMLO Pro",
    planTagline: "One product, two billing periods.",
    monthlyTab: "Monthly",
    yearlyTab: "Yearly",
    discountBadge: "20% off",
    perMonthNote: (v: string) => `${v}/mo equivalent`,
    vatNote: "VAT included",
    billedYearly: "Charged once a year as a single payment.",
    billedMonthly: "Charged monthly as a single payment.",
    cta: "Buy Now",
    featuresTitle: "What's included",
    features: [
      "Live post-round death analysis",
      "Enemy pattern detection",
      "Next-round suggestion",
      "Detailed end-of-match report",
      "Past match archive",
      "Progress tracking",
      "Turkish and English coaching language",
    ],
    currencyLabel: "Currency",
  },
} as const;

export function PricingClient() {
  const [lang, setLang] = useState<Lang>("TR");
  const [plan, setPlan] = useState<Plan>("aylik");

  const prices = PRICING[lang];
  const t = COPY[lang];
  const isYearly = plan === "yillik";
  const active = isYearly ? prices.yearly : prices.monthly;

  return (
    <div className="space-y-6">
      {/* Dil / para birimi + faturalama dönemi anahtarları */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-neutral-500">
            {t.currencyLabel}:
          </span>
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
            {(["TR", "EN"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`rounded-md px-3 py-1.5 text-[12px] font-bold transition ${
                  lang === code
                    ? "bg-[#FF4655] text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {code === "TR" ? "TR · ₺" : "EN · $"}
              </button>
            ))}
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setPlan("aylik")}
            aria-pressed={!isYearly}
            className={`rounded-md px-4 py-1.5 text-[12px] font-bold transition ${
              !isYearly
                ? "bg-[#FF4655] text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.monthlyTab}
          </button>
          <button
            type="button"
            onClick={() => setPlan("yillik")}
            aria-pressed={isYearly}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-[12px] font-bold transition ${
              isYearly
                ? "bg-[#FF4655] text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.yearlyTab}
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                isYearly
                  ? "bg-white/20 text-white"
                  : "bg-[#FF4655]/15 text-[#FF6B77]"
              }`}
            >
              {t.discountBadge}
            </span>
          </button>
        </div>
      </div>

      {/* Tek ürün kartı */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">
                {t.planName}
              </h2>
              <p className="mt-1 text-[13px] text-neutral-500">
                {t.planTagline}
              </p>
            </div>

            <div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight text-white">
                  {active.price}
                </span>
                <span className="pb-1.5 text-sm text-neutral-400">
                  {active.periodLabel}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-neutral-500">
                {t.vatNote} · {prices.currencyCode}
              </p>

              {isYearly && (
                <p className="mt-2 text-[13px] font-semibold text-[#FF6B77]">
                  {t.perMonthNote(prices.yearly.perMonth)}
                </p>
              )}

              <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">
                {isYearly ? t.billedYearly : t.billedMonthly}
              </p>
            </div>

            <Link
              href={`/satin-al?plan=${plan}`}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#FF4655] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#FF6B77]"
            >
              {t.cta}
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-neutral-500">
              {t.featuresTitle}
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed text-neutral-300">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span aria-hidden className="text-[#FF4655]">
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
