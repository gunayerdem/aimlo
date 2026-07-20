"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ *
 * FİYATLAR — TEK KAYNAK.
 * Fiyat değişikliği YALNIZCA burada yapılır. Tüm tutarlar KDV DAHİLDİR
 * (dijital hizmet, KDV %20).
 *
 * Türkiye'de yerleşik müşteriye dövizle fiyatlama mevzuat gereği
 * yapılamaz (Tebliğ 2008-32/34 Md. 8/7) — ödeme adımında TR ikametli
 * müşteri / Türk kartı her hâlükârda TL ile ücretlendirilir.
 * ------------------------------------------------------------------ */
export const PRICING = {
  TR: {
    currencyCode: "TRY",
    monthly: { price: "499 TL", period: "/ay" },
    yearly: { price: "4.790 TL", period: "/yıl", perMonth: "399 TL", discountPct: 20 },
  },
  EN: {
    currencyCode: "USD",
    monthly: { price: "$9.99", period: "/mo" },
    yearly: { price: "$95.88", period: "/yr", perMonth: "$7.99", discountPct: 20 },
  },
} as const;

type Lang = keyof typeof PRICING;

const COPY = {
  TR: {
    heroTitle: "Her ölümden ders çıkar.",
    heroSub: "AIMLO Pro — aylık 499 TL. İstediğin zaman iptal et.",
    monthly: "Aylık",
    yearly: "Yıllık",
    badge: "%20 indirim",
    vat: "KDV dahil",
    perMonth: (v: string) => `Aylık ${v}`,
    billedMonthly: "Her ay tek çekim",
    billedYearly: "Yılda bir tek çekim",
    cta: "Satın Al",
    featuresTitle: "Her iki planda da:",
    features: [
      "Her ölümde anlık analiz",
      "Rakip alışkanlık tespiti",
      "Sonraki round önerisi",
      "Maç sonu detaylı rapor",
      "Geçmiş maç arşivi",
      "Türkçe ve İngilizce koçluk",
    ],
    faqTitle: "Soruların mı var?",
    faq: [
      { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet. Taahhüt yok, cayma bedeli yok. İptal ettiğinde ödediğin dönemin sonuna kadar erişimin devam eder." },
      { q: "Hangi platformlarda çalışıyor?", a: "Windows 10 ve 11. macOS ve Linux desteği yok." },
      { q: "Valorant hesabım risk altında mı?", a: "Hayır. AIMLO yalnızca ekranı okur; oyun dosyalarına ve belleğine dokunmaz." },
      { q: "Faturamı nasıl alırım?", a: "Ödeme sonrası e-arşiv faturan e-posta ile gönderilir." },
      { q: "İade alabilir miyim?", a: "Koşullar İade ve Cayma Koşulları sayfasında." },
    ],
    faqLink: "İade ve Cayma Koşulları",
    tlNote: "Türkiye'de yerleşik müşteriler TL ile ücretlendirilir.",
    renewNote: "Abonelik dönem sonunda otomatik yenilenir.",
  },
  EN: {
    heroTitle: "Learn from every death.",
    heroSub: "AIMLO Pro — $9.99 a month. Cancel anytime.",
    monthly: "Monthly",
    yearly: "Yearly",
    badge: "20% off",
    vat: "VAT included",
    perMonth: (v: string) => `${v} per month`,
    billedMonthly: "Billed monthly",
    billedYearly: "Billed once a year",
    cta: "Get AIMLO Pro",
    featuresTitle: "Both plans include:",
    features: [
      "Instant analysis on every death",
      "Enemy pattern detection",
      "Next-round suggestion",
      "Full post-match report",
      "Match history archive",
      "Turkish and English coaching",
    ],
    faqTitle: "Questions?",
    faq: [
      { q: "Can I cancel anytime?", a: "Yes. No commitment, no cancellation fee. Access continues until the end of your paid period." },
      { q: "Which platforms are supported?", a: "Windows 10 and 11. No macOS or Linux support." },
      { q: "Is my Valorant account at risk?", a: "No. AIMLO only reads the screen; it never touches game files or memory." },
      { q: "How do I get an invoice?", a: "Your invoice is emailed after payment." },
      { q: "Can I get a refund?", a: "See the Cancellation and Refund Terms page." },
    ],
    faqLink: "Cancellation and Refund Terms",
    tlNote: "Customers resident in Türkiye are billed in Turkish Lira.",
    renewNote: "Subscription renews automatically at the end of each period.",
  },
} as const;

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF4655" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[3px]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function PricingClient() {
  const [lang, setLang] = useState<Lang>("TR");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const p = PRICING[lang];
  const c = COPY[lang];

  return (
    <div className="space-y-14">
      {/* ── Dil / para birimi ── */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-white/[0.08] p-0.5">
          {(["TR", "EN"] as const).map((L) => (
            <button
              key={L}
              onClick={() => setLang(L)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                lang === L ? "bg-white/[0.08] text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              {L === "TR" ? "TR · ₺" : "EN · $"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <header className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
          {c.heroTitle}
        </h1>
        <p className="text-[15px] text-neutral-400">{c.heroSub}</p>
      </header>

      {/* ── Planlar — yan yana ── */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Aylık */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 flex flex-col">
          <p className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider">{c.monthly}</p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white tracking-tight">{p.monthly.price}</span>
            <span className="text-[15px] text-neutral-500">{p.monthly.period}</span>
          </div>
          <p className="mt-2 text-[12px] text-neutral-500">
            {c.vat} · {c.billedMonthly}
          </p>
          <Link
            href="/satin-al?plan=aylik"
            className="mt-7 rounded-xl border border-white/[0.14] px-6 py-3 text-center text-[14px] font-bold text-white transition hover:bg-white/[0.06]"
          >
            {c.cta}
          </Link>
        </div>

        {/* Yıllık — vurgulu */}
        <div className="relative rounded-2xl border border-[#FF4655]/40 bg-[#FF4655]/[0.04] p-7 flex flex-col">
          <span className="absolute -top-2.5 right-6 rounded-full bg-[#FF4655] px-2.5 py-1 text-[10px] font-black text-white tracking-wide">
            {c.badge}
          </span>
          <p className="text-[13px] font-bold text-[#FF6B77] uppercase tracking-wider">{c.yearly}</p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white tracking-tight">{p.yearly.price}</span>
            <span className="text-[15px] text-neutral-500">{p.yearly.period}</span>
          </div>
          <p className="mt-2 text-[12px] text-neutral-500">
            {c.perMonth(p.yearly.perMonth)} · {c.vat} · {c.billedYearly}
          </p>
          <Link
            href="/satin-al?plan=yillik"
            className="mt-7 rounded-xl bg-[#FF4655] px-6 py-3 text-center text-[14px] font-bold text-white transition hover:bg-[#FF6B77]"
          >
            {c.cta}
          </Link>
        </div>
      </div>

      {/* ── Özellikler — tek liste, iki plan da aynı ── */}
      <section className="space-y-4">
        <h2 className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider">
          {c.featuresTitle}
        </h2>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {c.features.map((f) => (
            <li key={f} className="flex gap-2.5 text-[14px] text-neutral-300">
              <Check />
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Zorunlu bilgilendirme (kısa) ── */}
      <p className="text-[12px] text-neutral-600 leading-relaxed">
        {c.renewNote} {c.tlNote}
      </p>

      {/* ── SSS ── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black text-white tracking-tight">{c.faqTitle}</h2>
        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {c.faq.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-[14px] font-semibold text-white transition hover:text-[#FF6B77]"
                aria-expanded={openFaq === i}
              >
                {f.q}
                <span className="shrink-0 text-neutral-500 text-lg leading-none">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-4 text-[13px] leading-relaxed text-neutral-400">
                  {f.a}{" "}
                  {i === 4 && (
                    <Link href="/legal/iade" className="text-[#FF4655] hover:underline">
                      {c.faqLink}
                    </Link>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
