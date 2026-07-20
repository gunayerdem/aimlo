import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import PricingClient, { type Lang } from "./PricingClient";
import { PricingBackdrop } from "./PricingBackdrop";

export const metadata: Metadata = {
  title: "Fiyatlandırma — AIMLO",
  description:
    "AIMLO Pro abonelik fiyatları: aylık 499 TL, yıllık 4.790 TL (KDV dahil). Valorant için yapay zekâ destekli round-sonu koçluk.",
};

const LEGAL_LINKS = [
  { href: "/legal/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/legal/iade", label: "İade ve Cayma Koşulları" },
  { href: "/legal/terms", label: "Kullanım Koşulları" },
  { href: "/legal/privacy", label: "Gizlilik Politikası" },
  { href: "/iletisim", label: "İletişim" },
];

/* Satıcı bilgileri — e-ticaret mevzuatı gereği zorunlu künye.
   Placeholder'lar YAYIN ÖNCESİ doldurulmalıdır. */
const SELLER = [
  ["Ticaret unvanı", "{{TICARET_UNVANI}}"],
  ["Adres", "{{ADRES}}"],
  ["Telefon", "{{TELEFON}}"],
  ["E-posta", "{{EPOSTA}}"],
  ["Vergi dairesi", "{{VERGI_DAIRESI}}"],
  ["Vergi / TC kimlik no", "{{VERGI_NO}}"],
  ["MERSİS no", "{{MERSIS}}"],
] as const;

export default async function PricingPage() {
  /* Ülke algılama (softi 2026-07-20): Vercel edge her isteğe ziyaretçinin
     ülkesini başlıkla ekler. TR → Türk Lirası, diğer → USD. Bu yalnız
     BAŞLANGIÇ değeri; kullanıcı sayfadaki düğmeyle değiştirebilir.
     Mevzuat notu: TR'de yerleşik müşteri ödeme adımında HER HÂLÜKÂRDA TL ile
     ücretlendirilir (Tebliğ 2008-32/34 Md. 8/7) — burada gösterim, orada kural.
     Başlık yoksa (yerel geliştirme / başka platform) güvenli varsayılan TR. */
  const h = await headers();
  const country = (h.get("x-vercel-ip-country") ?? "TR").toUpperCase();
  const initialLang: Lang = country === "TR" ? "TR" : "EN";

  return (
    <main className="relative min-h-screen bg-[#030711] px-4 py-16 text-zinc-200">
      {/* Canlı IRIS gözü — içeriğin gerisinde, boş alanı dolduruyor */}
      <PricingBackdrop />
      {/* pb-24: sabit ödeme çubuğunun payı — sayfanın EN SONUNDA, içerik
          aralarında değil. Böylece panel-künye arası sıkı, çubuk hiçbir
          şeyin üstünü örtmüyor. */}
      <article className="relative z-10 mx-auto max-w-3xl space-y-14 pb-24">
        <Link href="/" className="block text-[12px] text-neutral-500 transition hover:text-[#FF6B77]">
          ← Ana Sayfa
        </Link>

        <PricingClient initialLang={initialLang} />

        {/* Satıcı bilgileri — zorunlu künye */}
        <section className="space-y-3 border-t border-white/10 pt-8">
          <h2 className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider">
            Satıcı bilgileri
          </h2>
          <dl className="grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
            {SELLER.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-neutral-600">{k}:</dt>
                <dd className="text-neutral-300">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[13px]">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-neutral-500 transition hover:text-[#FF6B77]">
              {l.label}
            </Link>
          ))}
        </footer>
      </article>
    </main>
  );
}
