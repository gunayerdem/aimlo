"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCell, PlusMark } from "@/app/_components/PlusMark";

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
    heroSub: "AIMLO+ — aylık 499 TL. İstediğin zaman iptal et.",
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
    /* Ek "abonelik" ismine biniyor, "+" işaretine DEĞİL — "AIMLO+'ta" okunaksız. */
    diffSub: "Ücretsiz hesapla haftada 3 maçını analiz et. AIMLO+ aboneliğinde haftalık limit kalkar.",
    betaNote: "Beta süresince tüm özellikler sınırsız ve ücretsiz.",
    /* B91 (2026-07-31): kota bayrağı AÇILDIĞINDA "beta süresince sınırsız"
       cümlesi YALAN olur. Metin artık bayrağa bağlı — bu satır, kota
       uygulanırken betaNote'un YERİNE gösterilir. */
    quotaNote: "Ücretsiz hesapta haftada 3 maç analizi. AIMLO+ ile adil kullanım kapsamında ayda 100 maç.",
    /* B14 (2026-07-31): AIMLO+ artık "sınırsız" DEĞİL — birim ekonomi başa baş
       ≈100 maç/ay olduğu için adil kullanım tavanı kondu (lib/entitlements.ts
       PLUS_MONTHLY_MATCH_QUOTA). Sayı orada değişirse burası da güncellenmeli. */
    fairUse: "* Adil kullanım: AIMLO+ aboneliğinde ayda 100 maç analizi. Günde 3 maç oynayan bir oyuncu bu tavanı görmez.",
    colFree: "Ücretsiz hesap",
    colPro: "AIMLO+",
    /* Ekran okuyucu: artı işareti aria-hidden, anlamı buradan gelir. */
    a11yIncluded: "var",
    a11yExcluded: "yok",
    /* Tablo KISALTILDI (softi 2026-07-20, "B" kararı): önceki hâlde 8
       satırın 7'si iki sütunda da aynıydı — tablo fiilen "ücretsiz hesapla
       AIMLO+ aynı şey" diyordu ve tek gerçek fark (maç kotası) o tekrarın
       içinde kayboluyordu. Artık tabloda YALNIZ fark var; ortak özellikler
       aşağıda liste hâlinde duruyor: değer görünmeye devam ediyor ama
       karşılaştırmayı boğmuyor. */
    diffRows: [
      { label: "Maç analizi", free: "Haftada 3", pro: "Sınırsız*" },
      { label: "Tüm koçluk özellikleri", free: true },
    ],
    sharedTitle: "İki planda da var",
    shared: [
      "Uygulamayı indir ve kur",
      "Hesap ve maç geçmişi",
      "Her ölümde anlık analiz",
      "Rakip alışkanlık tespiti",
      "Sonraki round önerisi",
      "Maç sonu detaylı rapor",
      "Türkçe ve İngilizce koçluk",
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
    heroSub: "AIMLO+ — $9.99 a month. Cancel anytime.",
    heroCta: "Get AIMLO+",
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
    diffSub: "Analyse 3 matches a week on a free account. AIMLO+ removes the weekly limit.",
    betaNote: "Everything is unlimited and free during the beta.",
    quotaNote: "Free accounts analyse 3 matches a week. AIMLO+ covers 100 matches a month under fair use.",
    fairUse: "* Fair use: AIMLO+ covers 100 match analyses per month. Playing 3 matches a day never reaches that ceiling.",
    colFree: "Free account",
    colPro: "AIMLO+",
    a11yIncluded: "included",
    a11yExcluded: "not included",
    diffRows: [
      { label: "Match analysis", free: "3 per week", pro: "Unlimited*" },
      { label: "All coaching features", free: true },
    ],
    sharedTitle: "On both plans",
    shared: [
      "Download and install the app",
      "Account and match history",
      "Instant analysis on every death",
      "Enemy pattern detection",
      "Next-round suggestion",
      "Full post-match report",
      "Turkish and English coaching",
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

/* Hücre üç durumlu: true → artı işareti, false → tire, metin → kota etiketi
   (ör. "Haftada 3" / "Sınırsız").

   softi (2026-07-20): beyaz tik yerine marka renginde "+" işareti.
   `tone` sütuna göre: AIMLO+ sütunu iris tayfında parlar, Ücretsiz sütun
   nötr kalır — iki sütun da aynı beyaz tik olunca tablo fark anlatmıyordu. */
function Cell({ v, tone = "brand", label }: { v: boolean | string; tone?: "brand" | "muted"; label: string }) {
  if (typeof v === "string") {
    return <span className="text-[12px] font-bold text-neutral-300">{v}</span>;
  }
  if (!v) {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="block h-[2px] w-4 rounded bg-neutral-700" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }
  return <PlusCell tone={tone} label={label} />;
}

/** B91 (2026-07-31): `quotaEnforced` sunucudan gelir (FREE_TIER_ENFORCED).
 *  Beta vaadi ("sınırsız ve ücretsiz") ile kota kapısı ayrı ayrı yaşayınca
 *  metin yalan söylüyordu; artık tek kaynağa bağlı. Varsayılan false =
 *  bugünkü davranış (beta rozeti). */
export default function PricingClient({
  initialLang = "TR",
  quotaEnforced = false,
}: {
  initialLang?: Lang;
  quotaEnforced?: boolean;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [plan, setPlan] = useState<Plan>("yillik");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const p = PRICING[lang];
  const c = COPY[lang];
  const sel = plan === "aylik" ? p.monthly : p.yearly;

  const scrollToPlans = () =>
    document.getElementById("planlar")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
    {/* pb YOK: ödeme panelinin ALTINDA boşluk oluşuyordu (softi: "aşağısında
        boşluk oluşmuş onu sıfırla"). Sabit çubuğun payı sayfanın EN SONUNA
        (page.tsx article'ına) verildi — panelle künye arası sıkı kalsın. */}
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
          {/* Beta dürüstlüğü: kota kodda hazır ama KAPALIYKEN kimse sınıra
              çarpmıyor. Bayrak açıldığında "beta süresince sınırsız" cümlesi
              YALAN olurdu (B91) — o yüzden metin bayrağa bağlı. */}
          <p className="inline-block rounded-full border border-[#FF4655]/30 bg-[#FF4655]/[0.07] px-4 py-1.5 text-[12px] font-semibold text-[#FF6B77]">
            {quotaEnforced ? c.quotaNote : c.betaNote}
          </p>
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
                      {/* Ücretsiz sütun nötr tonda — artı işareti burada parlamaz */}
                      <Cell v={r.free} tone="muted" label={r.free ? c.a11yIncluded : c.a11yExcluded} />
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center">
                      <Cell
                        v={"pro" in r ? (r as { pro: string }).pro : true}
                        tone="brand"
                        label={c.a11yIncluded}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* B14 (2026-07-31): "Sınırsız*" yıldızının karşılığı — adil kullanım
            tavanı lib/entitlements.ts PLUS_MONTHLY_MATCH_QUOTA'da uygulanıyor.
            Vaadi kodun gerçekten yaptığı şeye bağlar. */}
        <p className="text-center text-[11px] leading-relaxed text-neutral-600">
          {c.fairUse}
        </p>

        {/* Ortak özellikler — tablodan ÇIKARILDI, burada liste hâlinde.
            Tablo artık yalnız farkı gösteriyor; değer görünmeye devam
            ediyor ama karşılaştırmayı boğmuyor (softi "B" kararı). */}
        <div className="space-y-3.5 border-t border-white/[0.06] pt-7">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {c.sharedTitle}
          </p>
          <ul className="grid gap-x-7 gap-y-2.5 sm:grid-cols-2">
            {c.shared.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-[13px] text-neutral-400">
                <PlusMark tone="muted" size={11} />
                {s}
              </li>
            ))}
          </ul>
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

    {/* ── SABİT ÖDEME ÇUBUĞU (softi 2026-07-20: "geri getir aşağıda") ──
        Sayfanın en altındaki tam panel DURUYOR; bu ince çubuk ona EK.
        Nerede olursan ol seçili plan + ödeme bir tık uzakta. Alttaki
        panelle çakışmasın diye içerik pb-24 ile boşluk bırakıyor. */}
    <div className="pr-paybar pr-bar fixed bottom-0 left-0 right-0 z-40" style={{ animationDelay: "600ms" }}>
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <div key={`${lang}-${plan}-bar`} className="pr-price min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {plan === "yillik" ? c.yearly : c.monthly}
          </p>
          <p className="truncate text-[16px] font-black text-white">
            {sel.price}
            <span className="text-[12px] font-medium text-neutral-500">{sel.period}</span>
            <span className="ml-2 text-[10px] font-medium text-neutral-500">{c.vat}</span>
          </p>
        </div>
        <Link
          href={`/satin-al?plan=${plan}`}
          className="btn-neon shrink-0 rounded-xl px-6 py-2.5 text-[13px] font-bold"
        >
          {c.payCta}
        </Link>
      </div>
    </div>
    </>
  );
}
