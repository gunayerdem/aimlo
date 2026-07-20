import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import PricingClient, { type Lang } from "./PricingClient";
import { PricingBackdrop } from "./PricingBackdrop";
import { SellerInfo } from "@/app/_components/SellerInfo";
import { SiteHeader } from "@/app/_components/SiteHeader";

export const metadata: Metadata = {
  title: "Fiyatlandırma — AIMLO",
  description:
    "AIMLO+ abonelik fiyatları: aylık 499 TL, yıllık 4.790 TL (KDV dahil). Valorant için yapay zekâ destekli round-sonu koçluk.",
};

const LEGAL_LINKS = [
  { href: "/legal/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/legal/iade", label: "İade ve Cayma Koşulları" },
  { href: "/legal/terms", label: "Kullanım Koşulları" },
  { href: "/legal/privacy", label: "Gizlilik Politikası" },
  { href: "/iletisim", label: "İletişim" },
];

/* Künye artık lib/seller.ts'ten (tek kaynak) — 5 sayfada kopyalanmıyor. */

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
    /* main'de yatay padding YOK: tepe paneli kenardan kenara uzansın
       (ana sayfadaki gibi). Yatay boşluk article'a taşındı. */
    <main className="relative min-h-screen bg-[#030711] pb-16 text-zinc-200">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa.
          Kendi yer tutucusunu getiriyor, ayrıca pt vermeye gerek yok. */}
      <SiteHeader />
      {/* Canlı IRIS gözü — içeriğin gerisinde, boş alanı dolduruyor */}
      <PricingBackdrop />
      {/* pb-24: sabit ödeme çubuğunun payı — sayfanın EN SONUNDA, içerik
          aralarında değil. Böylece panel-künye arası sıkı, çubuk hiçbir
          şeyin üstünü örtmüyor. */}
      <article className="relative z-10 mx-auto max-w-3xl space-y-14 px-4 pb-24 pt-10">
        {/* "← Ana Sayfa" bağlantısı KALDIRILDI: tepe panelindeki logo
            aynı işi yapıyor, ikisi birden gereksiz tekrar. */}

        <PricingClient initialLang={initialLang} />

        <SellerInfo />

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
