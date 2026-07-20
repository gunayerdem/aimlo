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
    yearly: { price: "4.790 TL", period: "/yıl", perMonth: "399 TL" },
  },
  EN: {
    currencyCode: "USD",
    monthly: { price: "$9.99", period: "/mo" },
    yearly: { price: "$95.88", period: "/yr", perMonth: "$7.99" },
  },
} as const;

export type Lang = keyof typeof PRICING;
type Plan = "aylik" | "yillik";

const COPY = {
  TR: {
    regionLabel: "Türkiye",
    regionOther: "Diğer ülkeler",
    heroTitle: "Her ölümden ders çıkar.",
    heroSub: "AIMLO Pro — aylık 499 TL. İstediğin zaman iptal et.",
    heroCta: "Satın Al",
    heroCta2: "Planları gör",
    payMethods: "Güvenli ödeme",
    monthly: "Aylık",
    yearly: "Yıllık",
    badge: "%20 indirim",
    vat: "KDV dahil",
    perMonth: (v: string) => `Aylık ${v}`,
    billedMonthly: "Her ay tek çekim",
    billedYearly: "Yılda bir tek çekim",
    selected: "Seçildi",
    select: "Seç",
    diffTitle: "Farkı keşfet",
    diffSub: "Ücretsiz hesapla maçlarını kaydet. Pro ile her ölümün nedenini öğren.",
    colFree: "Ücretsiz hesap",
    colPro: "AIMLO Pro",
    diffRows: [
      { label: "Uygulamayı indir ve kur", free: true },
      { label: "Hesap ve maç geçmişi", free: true },
      { label: "Her ölümde anlık analiz", free: false },
      { label: "Rakip alışkanlık tespiti", free: false },
      { label: "Sonraki round önerisi", free: false },
      { label: "Maç sonu detaylı rapor", free: false },
      { label: "İlerleme takibi", free: false },
      { label: "Türkçe ve İngilizce koçluk", free: false },
    ],
    payTitle: "Ödemeye geç",
    paySub: "Seçtiğin plan aşağıda. Ödeme adımında sözleşmeleri onaylayacaksın.",
    payCta: "Ödemeye Geç",
    faqTitle: "Soruların mı var?",
    faq: [
      { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet. Taahhüt yok, cayma bedeli yok. İptal ettiğinde ödediğin dönemin sonuna kadar erişimin devam eder." },
      { q: "Hangi platformlarda çalışıyor?", a: "Windows 10 ve 11. macOS ve Linux desteği yok." },
      { q: "Valorant hesabım risk altında mı?", a: "Hayır. AIMLO yalnızca ekranı okur; oyun dosyalarına ve belleğine dokunmaz." },
      { q: "Faturamı nasıl alırım?", a: "Ödeme sonrası e-arşiv faturan e-posta ile gönderilir." },
      { q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", a: "Visa, Mastercard, American Express ve Troy kredi/banka kartları. Taksit yok, tek çekim." },
      { q: "İade alabilir miyim?", a: "Koşullar İade ve Cayma Koşulları sayfasında." },
    ],
    faqLink: "İade ve Cayma Koşulları",
    tlNote: "Türkiye'de yerleşik müşteriler TL ile ücretlendirilir.",
    renewNote: "Abonelik dönem sonunda otomatik yenilenir.",
  },
  EN: {
    regionLabel: "Türkiye",
    regionOther: "Other countries",
    heroTitle: "Learn from every death.",
    heroSub: "AIMLO Pro — $9.99 a month. Cancel anytime.",
    heroCta: "Get AIMLO Pro",
    heroCta2: "See plans",
    payMethods: "Secure payment",
    monthly: "Monthly",
    yearly: "Yearly",
    badge: "20% off",
    vat: "VAT included",
    perMonth: (v: string) => `${v} per month`,
    billedMonthly: "Billed monthly",
    billedYearly: "Billed once a year",
    selected: "Selected",
    select: "Select",
    diffTitle: "See the difference",
    diffSub: "Track your matches with a free account. Go Pro to learn why you die.",
    colFree: "Free account",
    colPro: "AIMLO Pro",
    diffRows: [
      { label: "Download and install the app", free: true },
      { label: "Account and match history", free: true },
      { label: "Instant analysis on every death", free: false },
      { label: "Enemy pattern detection", free: false },
      { label: "Next-round suggestion", free: false },
      { label: "Full post-match report", free: false },
      { label: "Progress tracking", free: false },
      { label: "Turkish and English coaching", free: false },
    ],
    payTitle: "Continue to payment",
    paySub: "Your selected plan is below. You'll approve the terms at the payment step.",
    payCta: "Continue to Payment",
    faqTitle: "Questions?",
    faq: [
      { q: "Can I cancel anytime?", a: "Yes. No commitment, no cancellation fee. Access continues until the end of your paid period." },
      { q: "Which platforms are supported?", a: "Windows 10 and 11. No macOS or Linux support." },
      { q: "Is my Valorant account at risk?", a: "No. AIMLO only reads the screen; it never touches game files or memory." },
      { q: "How do I get an invoice?", a: "Your invoice is emailed after payment." },
      { q: "Which payment methods do you accept?", a: "Visa, Mastercard, American Express and Troy credit/debit cards. Single payment, no instalments." },
      { q: "Can I get a refund?", a: "See the Cancellation and Refund Terms page." },
    ],
    faqLink: "Cancellation and Refund Terms",
    tlNote: "Customers resident in Türkiye are billed in Turkish Lira.",
    renewNote: "Subscription renews automatically at the end of each period.",
  },
} as const;

/* Kabul edilen kart şemaları — marka görseli KULLANILMIYOR (telif/marka riski);
   sade wordmark rozetleri. Mastercard'ın iki halkası saf CSS. */
function CardBadges() {
  const badge = "flex h-9 items-center justify-center rounded-md bg-white px-3.5 shadow-sm";
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className={badge}>
        <span className="text-[13px] font-black italic tracking-tight text-[#1A1F71]">VISA</span>
      </span>
      <span className={badge}>
        <span className="relative mr-1.5 inline-flex h-[15px] w-[24px] items-center">
          <span className="absolute left-0 h-[15px] w-[15px] rounded-full bg-[#EB001B]" />
          <span className="absolute right-0 h-[15px] w-[15px] rounded-full bg-[#F79E1B] opacity-90" />
        </span>
        <span className="text-[10px] font-bold text-neutral-700">mastercard</span>
      </span>
      <span className={badge}>
        <span className="text-[11px] font-black tracking-tight text-[#006FCF]">AMEX</span>
      </span>
      <span className={badge}>
        <span className="text-[12px] font-black tracking-tight text-[#00A0DF]">troy</span>
      </span>
    </div>
  );
}

function Tick({ on }: { on: boolean }) {
  if (!on) return <span className="block h-[2px] w-4 rounded bg-neutral-700" />;
  return (
    <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#030711" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

export default function PricingClient({ initialLang = "TR" }: { initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [plan, setPlan] = useState<Plan>("yillik");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const p = PRICING[lang];
  const c = COPY[lang];
  const sel = plan === "aylik" ? p.monthly : p.yearly;

  const scrollToPlans = () =>
    document.getElementById("planlar")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="space-y-20">
      {/* ── Bölge / para birimi — "Türkiye" ↔ "Diğer ülkeler" ── */}
      <div className="flex justify-end pr-rise">
        <div className="inline-flex rounded-lg border border-white/[0.08] p-0.5">
          {(["TR", "EN"] as const).map((L) => (
            <button
              key={L}
              onClick={() => setLang(L)}
              className={`rounded-md px-3.5 py-1.5 text-[11px] font-semibold transition ${
                lang === L ? "bg-white/[0.08] text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              {L === "TR" ? `${c.regionLabel} · ₺` : `${c.regionOther} · $`}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO — iki buton + kart rozetleri (Spotify deseni) ── */}
      <header className="space-y-6 pr-hero">
        <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-white">
          {c.heroTitle}
        </h1>
        <p className="text-[15px] text-neutral-400">{c.heroSub}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={scrollToPlans} className="btn-neon rounded-xl px-8 py-3.5 text-[14px] font-bold">
            {c.heroCta}
          </button>
          <button
            onClick={scrollToPlans}
            className="rounded-xl border border-white/[0.14] px-8 py-3.5 text-[14px] font-bold text-white transition hover:bg-white/[0.06]"
          >
            {c.heroCta2}
          </button>
        </div>
        <div className="space-y-2.5 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">{c.payMethods}</p>
          <CardBadges />
        </div>
      </header>

      {/* ── PLANLAR — tıkla-seç ── */}
      <section id="planlar" className="grid gap-5 sm:grid-cols-2">
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
              style={{ animationDelay: `${140 + i * 110}ms` }}
              className={`pr-card ${isSel ? "pr-sel" : ""} rounded-2xl border p-7 text-left ${
                isSel
                  ? "border-[#FF4655]/60 bg-[#FF4655]/[0.055]"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]"
              }`}
            >
              {isYearly && (
                <span className="absolute right-5 top-4 rounded-full bg-[#FF4655] px-2.5 py-1 text-[10px] font-black tracking-wide text-white">
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
      </section>

      {/* ── FARKI KEŞFET — karşılaştırma tablosu (Spotify deseni) ── */}
      <section className="space-y-8 pr-rise">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white">{c.diffTitle}</h2>
          <p className="mx-auto max-w-lg text-[14px] text-neutral-400">{c.diffSub}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.12]">
                <th className="pb-4 pr-4 align-bottom text-[13px] font-bold text-neutral-300">
                  {lang === "TR" ? "Elde edeceğin avantajlar" : "What you get"}
                </th>
                <th className="w-[110px] pb-4 text-center align-bottom text-[12px] font-bold text-neutral-500">
                  {c.colFree}
                </th>
                <th className="w-[110px] pb-4 text-center align-bottom text-[12px] font-bold text-[#FF6B77]">
                  {c.colPro}
                </th>
              </tr>
            </thead>
            <tbody>
              {c.diffRows.map((r) => (
                <tr key={r.label} className="border-b border-white/[0.06]">
                  <td className="py-4 pr-4 text-[14px] text-neutral-300">{r.label}</td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <Tick on={r.free} />
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <Tick on />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="space-y-5">
        <h2 className="text-3xl font-black tracking-tight text-white">{c.faqTitle}</h2>
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
                  {i === c.faq.length - 1 && (
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

      {/* ── ÖDEME — EN AŞAĞIDA, sabit çubuk değil ── */}
      <section className="pr-rise rounded-2xl border border-[#FF4655]/30 bg-[#FF4655]/[0.04] p-8 text-center">
        <h2 className="text-2xl font-black tracking-tight text-white">{c.payTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] text-neutral-400">{c.paySub}</p>

        <div key={`${lang}-${plan}-pay`} className="pr-price mt-7">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {plan === "yillik" ? c.yearly : c.monthly}
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {sel.price}
            <span className="text-[15px] font-medium text-neutral-500">{sel.period}</span>
          </p>
          <p className="mt-1 text-[12px] text-neutral-500">{c.vat}</p>
        </div>

        <Link
          href={`/satin-al?plan=${plan}`}
          className="btn-neon mt-7 inline-flex rounded-xl px-10 py-4 text-[14px] font-bold"
        >
          {c.payCta}
        </Link>

        <div className="mt-7 flex justify-center">
          <CardBadges />
        </div>

        <p className="mx-auto mt-6 max-w-lg text-[12px] leading-relaxed text-neutral-600">
          {c.renewNote} {c.tlNote}
        </p>
      </section>
    </div>
  );
}
