import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İletişim — AIMLO",
  description:
    "AIMLO iletişim bilgileri, yasal künye ve destek kanalları.",
};

/** softi tarafından doldurulacak alan — görünür bırakıldı, yayına almadan önce doldur. */
function Ph({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-[#FF4655]/10 px-1.5 py-0.5 font-mono text-[13px] font-bold text-[#FF4655]">
      {children}
    </span>
  );
}

function KunyeRow({
  label,
  children,
  note,
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-44 shrink-0 text-[13px] font-semibold text-neutral-400">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-neutral-200">
        {children}
        {note ? (
          <span className="ml-2 text-[12px] text-neutral-500">({note})</span>
        ) : null}
      </dd>
    </div>
  );
}

export default function IletisimPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 py-16">
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="text-[12px] text-neutral-500 hover:text-[#FF6B77]"
          >
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            İletişim
          </h1>
          <p className="text-sm text-neutral-500">
            Yasal künye ve destek kanalları
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <p>
            AIMLO, Valorant oyuncularına yapay zekâ destekli round sonu koçluk
            geri bildirimi sunan bir dijital hizmettir. Aşağıda hizmet
            sağlayıcıya ait yasal bilgiler ve bize ulaşabileceğiniz kanallar yer
            alır.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Künye</h2>
          <dl className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-2">
            <KunyeRow label="Ticaret unvanı">
              <Ph>{"{{TICARET_UNVANI}}"}</Ph>
            </KunyeRow>
            <KunyeRow label="Adres">
              <Ph>{"{{ADRES}}"}</Ph>
            </KunyeRow>
            <KunyeRow label="Telefon">
              <Ph>{"{{TELEFON}}"}</Ph>
            </KunyeRow>
            <KunyeRow label="E-posta">
              <Ph>{"{{EPOSTA}}"}</Ph>
            </KunyeRow>
            <KunyeRow label="Vergi dairesi">
              <Ph>{"{{VERGI_DAIRESI}}"}</Ph>
            </KunyeRow>
            <KunyeRow label="Vergi / TC kimlik no">
              <Ph>{"{{VERGI_NO}}"}</Ph>
            </KunyeRow>
            <KunyeRow label="MERSİS no" note="varsa; adi ortaklık/şahıs işletmelerinde bulunmayabilir">
              <Ph>{"{{MERSIS}}"}</Ph>
            </KunyeRow>
            <KunyeRow label="Web sitesi">
              <a
                href="https://aimlo.gg"
                className="text-[#FF4655] hover:underline"
              >
                https://aimlo.gg
              </a>
            </KunyeRow>
          </dl>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Destek</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">
                Uygulama içi destek
              </h3>
              <p className="text-sm leading-relaxed text-neutral-300">
                En hızlı yol. Masaüstü uygulaması ve web panelindeki{" "}
                <strong className="text-white">Destek</strong> bölümünden talep
                açabilirsiniz; hesabınız otomatik eşleştiği için sorun daha
                çabuk çözülür.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">E-posta</h3>
              <p className="text-sm leading-relaxed text-neutral-300">
                Genel destek, fatura, iptal ve iade talepleri için:
              </p>
              <p className="text-sm">
                <Ph>{"{{EPOSTA}}"}</Ph>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3 text-sm leading-relaxed text-neutral-300">
            <h3 className="text-sm font-bold text-white">
              Çalışma saatleri ve dönüş süresi
            </h3>
            <p>
              Destek ekibimiz hafta içi{" "}
              <strong className="text-white">09.00 - 18.00</strong> (TSİ)
              saatleri arasında çalışır. Hafta sonu ve resmî tatillerde gelen
              talepler takip eden ilk iş günü değerlendirilir.
            </p>
            <p>
              Tüm destek taleplerine{" "}
              <strong className="text-white">
                en geç 2 iş günü içinde dönüş yapıyoruz.
              </strong>{" "}
              Ödeme, iptal ve iade konulu talepler öncelikli olarak ele alınır.
            </p>
          </div>
        </section>

        <section className="space-y-3 border-t border-white/10 pt-6 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">İlgili sayfalar</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Link
                href="/legal/iade"
                className="text-[#FF4655] hover:underline"
              >
                İptal, İade ve Cayma Koşulları
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
            <li>
              <Link
                href="/legal/kvkk"
                className="text-[#FF4655] hover:underline"
              >
                KVKK Aydınlatma Metni
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}
