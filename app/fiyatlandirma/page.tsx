import type { Metadata } from "next";
import Link from "next/link";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Fiyatlandırma — AIMLO",
  description:
    "AIMLO Pro abonelik fiyatları: aylık 499 TL, yıllık 4.790 TL (KDV dahil). Valorant için yapay zekâ destekli round-sonu koçluk.",
};

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Aboneliğimi nasıl iptal ederim?",
    a: (
      <>
        Aboneliğini istediğin zaman hesap ayarlarından tek tıkla iptal
        edebilirsin. İptal ettiğinde ek bir ücret alınmaz; hizmet, bedelini
        ödediğin dönemin sonuna kadar açık kalır ve o tarihte kendiliğinden
        sona erer. Taahhüt veya cayma bedeli yoktur.
      </>
    ),
  },
  {
    q: "İade koşulları nedir?",
    a: (
      <>
        AIMLO, ödeme onayının hemen ardından elektronik ortamda anında ifa
        edilen dijital bir hizmettir. Satın alma adımında verdiğin açık onayla
        birlikte, Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/1-(ğ) maddesi
        uyarınca <strong className="text-white">cayma hakkı kullanılamaz</strong>.
        Bu açık onay alınmamışsa 14 günlük cayma hakkın saklıdır. Ayrıca yasal
        cayma hakkının kapsamı dışında kalan hâllerde de ticari iade
        imkânlarımız bulunur; ayrıntılar ve iade talebi adımları için{" "}
        <Link href="/legal/iade" className="text-[#FF4655] hover:underline">
          İade ve Cayma Koşulları
        </Link>{" "}
        sayfasına bak.
      </>
    ),
  },
  {
    q: "Hangi platformlarda çalışıyor?",
    a: (
      <>
        AIMLO masaüstü uygulaması <strong className="text-white">Windows</strong>{" "}
        için geliştirilmiştir (Windows 10 ve 11). Maç geçmişin, raporların ve
        ilerleme takibin ayrıca web panelinden herhangi bir modern tarayıcıyla
        görüntülenebilir. macOS ve Linux sürümü bulunmamaktadır.
      </>
    ),
  },
  {
    q: "Valorant hesabım güvende mi?",
    a: (
      <>
        Evet. AIMLO oyunun belleğine girmez, oyun dosyalarına dokunmaz, kod
        enjekte etmez ve oyuna hiçbir müdahalede bulunmaz. Yalnızca round
        sonunda <strong className="text-white">ekranı okur</strong> — tıpkı bir
        yayın programı (OBS) gibi. Riot hesap bilgin AIMLO&apos;ya hiçbir zaman
        verilmez. Ayrıntılar için{" "}
        <Link href="/guvenlik" className="text-[#FF4655] hover:underline">
          Güvenlik sayfası
        </Link>
        .
      </>
    ),
  },
  {
    q: "Faturamı nasıl alırım?",
    a: (
      <>
        Ödeme başarıyla tamamlandığında e-fatura/e-arşiv faturan, kayıt olurken
        verdiğin e-posta adresine otomatik olarak gönderilir. Geçmiş faturalarına
        hesap ayarlarındaki faturalandırma bölümünden de ulaşabilirsin. Kurumsal
        fatura talebin varsa ödeme öncesinde{" "}
        <a
          href="mailto:support@aimlo.gg"
          className="text-[#FF4655] hover:underline"
        >
          support@aimlo.gg
        </a>{" "}
        adresine yazman yeterli.
      </>
    ),
  },
];

const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: "/legal/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/legal/iade", label: "İade ve Cayma Koşulları" },
  { href: "/legal/terms", label: "Kullanım Koşulları" },
  { href: "/legal/privacy", label: "Gizlilik Politikası" },
  { href: "/iletisim", label: "İletişim" },
];

export default function FiyatlandirmaPage() {
  return (
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 py-16">
      <article className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="text-[12px] text-neutral-500 hover:text-[#FF6B77]"
          >
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Fiyatlandırma
          </h1>
          <p className="text-sm leading-relaxed text-neutral-300">
            AIMLO, Valorant maçlarını round sonunda ekrandan okuyup yapay zekâ
            destekli koçluk geri bildirimi veren bir Windows masaüstü
            uygulamasıdır. Nerede ve neden öldüğünü çözümler, rakibin
            alışkanlıklarını çıkarır ve bir sonraki round için somut bir öneri
            sunar.
          </p>
        </header>

        <PricingClient />

        {/* Yasal fiyat notları */}
        <section className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-[13px] leading-relaxed text-neutral-400">
          <p>
            <strong className="text-white">Tüm fiyatlar KDV dahildir.</strong>{" "}
            AIMLO Pro dijital bir hizmettir ve %20 KDV oranına tabidir; yukarıda
            gösterilen tutarlar tüketicinin ödeyeceği nihai bedellerdir.
          </p>
          <p>
            Türkiye&apos;de yerleşik müşteriler için faturalama Türk Lirası
            üzerinden yapılır. Yabancı para birimi yalnızca yurt dışında yerleşik
            müşteriler içindir.
          </p>
          <p>
            Abonelik, iptal edilmediği sürece seçtiğin dönemin sonunda aynı
            koşullarla otomatik olarak yenilenir. Yenileme öncesinde e-posta ile
            bilgilendirilirsin.
          </p>
        </section>

        {/* SSS */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-white">Sık Sorulan Sorular</h2>
          <div className="space-y-5">
            {FAQ.map((item) => (
              <div key={item.q} className="space-y-2">
                <h3 className="text-sm font-bold text-white">{item.q}</h3>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Satıcı bilgileri — softi dolduracak */}
        <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white">Satıcı Bilgileri</h2>
          <dl className="grid gap-x-6 gap-y-2 text-[13px] leading-relaxed text-neutral-300 sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500">Ticaret unvanı</dt>
              <dd>{"{{TICARET_UNVANI}}"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Adres</dt>
              <dd>{"{{ADRES}}"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Telefon</dt>
              <dd>{"{{TELEFON}}"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">E-posta</dt>
              <dd>{"{{EPOSTA}}"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Vergi dairesi</dt>
              <dd>{"{{VERGI_DAIRESI}}"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Vergi / TC kimlik no</dt>
              <dd>{"{{VERGI_NO}}"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">MERSİS no</dt>
              <dd>{"{{MERSIS}}"}</dd>
            </div>
          </dl>
        </section>

        {/* Yasal linkler */}
        <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[13px]">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-neutral-400 transition hover:text-[#FF6B77]"
            >
              {l.label}
            </Link>
          ))}
        </footer>
      </article>
    </main>
  );
}
