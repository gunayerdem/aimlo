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

export type Lang = keyof typeof PRICING;
type Plan = "aylik" | "yillik";

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
    selected: "Seçildi",
    select: "Seç",
    featuresTitle: "Her iki planda da:",
    features: [
      "Her ölümde anlık analiz",
      "Rakip alışkanlık tespiti",
      "Sonraki round önerisi",
      "Maç sonu detaylı rapor",
      "Geçmiş maç arşivi",
      "Türkçe ve İngilizce koçluk",
    ],
    payTitle: "Ödemeye geç",
    payCta: "Ödemeye Geç",
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
    selected: "Selected",
    select: "Select",
    featuresTitle: "Both plans include:",
    features: [
      "Instant analysis on every death",
      "Enemy pattern detection",
      "Next-round suggestion",
      "Full post-match report",
      "Match history archive",
      "Turkish and English coaching",
    ],
    payTitle: "Continue to payment",
    payCta: "Continue to Payment",
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

export default function PricingClient({ initialLang = "TR" }: { initialLang?: Lang }) {
  // initialLang sunucudan gelir (Vercel geo başlığı) — TR ise TL, değilse USD.
  const [lang, setLang] = useState<Lang>(initialLang);
  const [plan, setPlan] = useState<Plan>("yillik"); // varsayılan: daha avantajlı olan
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const p = PRICING[lang];
  const c = COPY[lang];
  const sel = plan === "aylik" ? p.monthly : p.yearly;

  return (
    <>
      <div className="space-y-14 pb-28">
        {/* ── Dil / para birimi ── */}
        <div className="flex justify-end pr-rise">
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
        <header className="space-y-4 pr-hero">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            {c.heroTitle}
          </h1>
          <p className="text-[15px] text-neutral-400">{c.heroSub}</p>
        </header>

        {/* ── Planlar — TIKLA-SEÇ ── */}
        <div className="grid gap-5 sm:grid-cols-2">
          {(["aylik", "yillik"] as const).map((planKey, i) => {
            const isYearly = planKey === "yillik";
            const d = isYearly ? p.yearly : p.monthly;
            const isSel = plan === planKey;
            return (
              <button
                key={planKey}
                type="button"
                onClick={() => setPlan(planKey)}
                aria-pressed={isSel}
                style={{ animationDelay: `${180 + i * 110}ms` }}
                className={`pr-card ${isSel ? "pr-sel" : ""} rounded-2xl border p-7 text-left ${
                  isSel
                    ? "border-[#FF4655]/60 bg-[#FF4655]/[0.055]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]"
                }`}
              >
                {isYearly && (
                  <span className="absolute top-4 right-5 rounded-full bg-[#FF4655] px-2.5 py-1 text-[10px] font-black tracking-wide text-white">
                    {c.badge}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-[18px] w-[18px] place-items-center rounded-full border-2 transition ${
                      isSel ? "border-[#FF4655] bg-[#FF4655]" : "border-white/25"
                    }`}
                  >
                    {isSel && (
                      <svg key={planKey} className="pr-tick" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-[13px] font-bold uppercase tracking-wider ${isSel ? "text-[#FF6B77]" : "text-neutral-400"}`}>
                    {isYearly ? c.yearly : c.monthly}
                  </span>
                </div>

                <div key={`${lang}-${planKey}`} className="pr-price mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tight text-white">{d.price}</span>
                  <span className="text-[15px] text-neutral-500">{d.period}</span>
                </div>

                <p className="mt-2 text-[12px] text-neutral-500">
                  {isYearly ? `${c.perMonth(p.yearly.perMonth)} · ` : ""}
                  {c.vat} · {isYearly ? c.billedYearly : c.billedMonthly}
                </p>

                <p className={`mt-6 text-[12px] font-bold uppercase tracking-wider ${isSel ? "text-[#FF4655]" : "text-neutral-600"}`}>
                  {isSel ? `✓ ${c.selected}` : c.select}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Özellikler ── */}
        <section className="space-y-4 pr-rise" style={{ animationDelay: "420ms" }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-neutral-400">
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

        {/* ── Zorunlu bilgilendirme ── */}
        <p className="text-[12px] leading-relaxed text-neutral-600">
          {c.renewNote} {c.tlNote}
        </p>

        {/* ── SSS ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">{c.faqTitle}</h2>
          <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {c.faq.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-[14px] font-semibold text-white transition hover:text-[#FF6B77]"
                  aria-expanded={openFaq === i}
                >
                  {f.q}
                  <span className="shrink-0 text-lg leading-none text-neutral-500">
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

      {/* ── STICKY ÖDEME ÇUBUĞU — seçilen plan hep görünür, ödeme hep bir tık ── */}
      <div className="pr-paybar pr-bar fixed bottom-0 left-0 right-0 z-40" style={{ animationDelay: "700ms" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3.5 sm:px-0">
          <div key={`${lang}-${plan}-bar`} className="pr-price min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {plan === "yillik" ? c.yearly : c.monthly}
            </p>
            <p className="truncate text-[17px] font-black text-white">
              {sel.price}
              <span className="text-[13px] font-medium text-neutral-500">{sel.period}</span>
              <span className="ml-2 text-[11px] font-medium text-neutral-500">{c.vat}</span>
            </p>
          </div>
          <Link
            href={`/satin-al?plan=${plan}`}
            className="btn-neon shrink-0 rounded-xl px-7 py-3 text-[14px] font-bold"
          >
            {c.payCta}
          </Link>
        </div>
      </div>
    </>
  );
}
