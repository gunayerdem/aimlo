import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Sipariş Özeti — AIMLO",
  description:
    "AIMLO abonelik sipariş özeti, ön bilgilendirme ve ödeme onayı adımı.",
};

function CheckoutFallback() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6">
      <p className="text-sm text-neutral-500">Sipariş özeti yükleniyor…</p>
    </div>
  );
}

export default function SatinAlPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 py-16">
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <Link
            href="/fiyatlandirma"
            className="text-[12px] text-neutral-500 hover:text-[#FF6B77]"
          >
            ← Fiyatlandırma
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Sipariş Özeti
          </h1>
          <p className="text-sm text-neutral-500">
            Ödemeden önce siparişinizi ve sözleşme onaylarını kontrol edin.
          </p>
        </header>

        {/*
          useSearchParams() prerender sırasında en yakın Suspense sınırına kadar
          olan ağacı client-side render'a düşürür (Next 16). Sipariş özeti bu
          nedenle ayrı bir client component olarak Suspense içine alınmıştır.
        */}
        <Suspense fallback={<CheckoutFallback />}>
          <CheckoutClient />
        </Suspense>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Satıcı Bilgileri</h2>
          <ul className="space-y-1 text-neutral-400">
            <li>Ticaret unvanı: {"GÜNAY ERDEM VE KAAN DAĞDELEN ADİ ORTAKLIĞI"}</li>
            <li>Adres: {"Yenişehir Mah. Ankara Cad. 360 Office Kapı No: 405 Daire No: 95 Pendik/İstanbul"}</li>
            <li>Telefon: {"0534 911 31 81"}</li>
            <li>E-posta: {"support@aimlo.gg"}</li>
            <li>Vergi dairesi: {"Pendik Vergi Dairesi"}</li>
            <li>Vergi / TCKN no: {"44461434066"}</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300 border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white">İlgili Belgeler</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <Link
                href="/legal/mesafeli-satis"
                className="text-[#FF4655] hover:underline"
              >
                Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu
              </Link>
            </li>
            <li>
              <Link
                href="/legal/iade"
                className="text-[#FF4655] hover:underline"
              >
                İptal ve İade Koşulları
              </Link>
            </li>
            <li>
              <Link
                href="/legal/terms"
                className="text-[#FF4655] hover:underline"
              >
                Kullanım Koşulları
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="text-[#FF4655] hover:underline"
              >
                Gizlilik Politikası
              </Link>
            </li>
          </ul>
          <p className="text-neutral-400">
            Sorularınız için{" "}
            <a
              href="mailto:support@aimlo.gg"
              className="text-[#FF4655] hover:underline"
            >
              support@aimlo.gg
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
