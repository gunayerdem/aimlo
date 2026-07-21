import Link from "next/link";
import PricingClient, { type Lang } from "./PricingClient";
import { PricingBackdrop } from "./PricingBackdrop";
import { SellerInfo } from "@/app/_components/SellerInfo";
import { SiteHeader } from "@/app/_components/SiteHeader";

/** Fiyatlandırma sayfasının paylaşılan gövdesi.
 *
 * softi (2026-07-21): site dili İngilizceyse "Get AIMLO+" → /pricing,
 * Türkçeyse → /fiyatlandirma. Yani URL dili SABİTLİYOR.
 *
 * İki rota (app/fiyatlandirma + app/pricing) bu tek gövdeyi kullanıyor;
 * fark yalnız `lang`. Böylece içerik kopyalanmıyor, ikisi hep senkron.
 * Ağır içerik zaten PricingClient'te (o kendi TR/EN sözlüğünü taşıyor);
 * burası yalnız kabuk (panel + göz + künye + footer).
 *
 * ÖNCEKİ ülke-algılama (x-vercel-ip-country) KALDIRILDI: artık dili URL
 * belirliyor. Landing, kullanıcının seçtiği dile göre doğru URL'e
 * yönlendiriyor; sayfanın ayrıca ülke tahmini yapması gereksiz ve
 * çelişkili olurdu (EN seçmiş TR'li kullanıcı /pricing'e gelince ülke
 * tahmini onu yanlışlıkla TR'ye çevirirdi). Sayfadaki TR/EN düğmesi
 * yine para birimini/dili anında değiştiriyor. */

const LEGAL_LINKS: Record<Lang, ReadonlyArray<{ href: string; label: string }>> = {
  TR: [
    { href: "/legal/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
    { href: "/legal/iade", label: "İade ve Cayma Koşulları" },
    { href: "/legal/terms", label: "Kullanım Koşulları" },
    { href: "/legal/privacy", label: "Gizlilik Politikası" },
    { href: "/iletisim", label: "İletişim" },
  ],
  EN: [
    { href: "/legal/mesafeli-satis", label: "Distance Sales Agreement" },
    { href: "/legal/iade", label: "Cancellation & Refund" },
    { href: "/legal/terms", label: "Terms of Use" },
    { href: "/legal/privacy", label: "Privacy Policy" },
    { href: "/iletisim", label: "Contact" },
  ],
};

export function PricingPageBody({ lang }: { lang: Lang }) {
  const links = LEGAL_LINKS[lang];

  return (
    /* main'de yatay padding YOK: tepe paneli kenardan kenara uzansın
       (ana sayfadaki gibi). Yatay boşluk article'a taşındı. */
    <main className="relative min-h-screen bg-[#030711] pb-16 text-zinc-200">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa. */}
      <SiteHeader />
      {/* Canlı IRIS gözü — içeriğin gerisinde, boş alanı dolduruyor */}
      <PricingBackdrop />
      {/* pb-24: sabit ödeme çubuğunun payı — sayfanın EN SONUNDA. */}
      <article className="relative z-10 mx-auto max-w-3xl space-y-14 px-4 pb-24 pt-10">
        <PricingClient initialLang={lang} />

        <SellerInfo />

        <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[13px]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-neutral-500 transition hover:text-[#FF6B77]">
              {l.label}
            </Link>
          ))}
        </footer>
      </article>
    </main>
  );
}
