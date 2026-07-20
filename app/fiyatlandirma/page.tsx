import type { Metadata } from "next";
import Link from "next/link";
import PricingClient from "./PricingClient";

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

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 py-16">
      <article className="mx-auto max-w-3xl space-y-14">
        <Link href="/" className="block text-[12px] text-neutral-500 transition hover:text-[#FF6B77]">
          ← Ana Sayfa
        </Link>

        <PricingClient />

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
