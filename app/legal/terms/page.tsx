import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — AIMLO",
  description:
    "AIMLO kullanım koşulları, hizmet şartları ve abonelik/ücretlendirme esasları.",
};

export default function TermsPage() {
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
            Kullanım Koşulları
          </h1>
          <p className="text-sm text-neutral-500">
            Son güncelleme: 20 Temmuz 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">1. Hizmet</h2>
          <p>
            AIMLO, Valorant oyuncularına yapay zekâ destekli round-sonu koçluk
            geri bildirimi sunan bir Windows masaüstü uygulaması ve web
            panelidir. Hizmet, ücretli abonelik karşılığında sunulmaktadır.
          </p>
          <p>
            AIMLO, hizmetin özelliklerini geliştirmek amacıyla güncelleme
            yapabilir. Abonelerin edindiği hakları esaslı biçimde azaltan
            değişiklikler, yürürlüğe girmeden önce e-posta yoluyla
            bildirilir; bu değişiklikleri kabul etmeyen abone, aboneliğini
            iptal edip{" "}
            <Link
              href="/legal/iade"
              className="text-[#FF4655] hover:underline"
            >
              İptal ve İade Koşulları
            </Link>{" "}
            uyarınca iade talebinde bulunabilir.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">2. Hesap</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>13 yaşından büyük olmalısın.</li>
            <li>Hesap bilgilerinin gizliliği senin sorumluluğundadır.</li>
            <li>Bot, otomasyon veya scraping yasaktır.</li>
            <li>
              Hesabın istediğin zaman{" "}
              <Link
                href="/account/delete"
                className="text-[#FF4655] hover:underline"
              >
                silinebilir
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            3. Abonelik ve Ücretlendirme
          </h2>
          <p>
            AIMLO Pro, aylık veya yıllık dönemli ücretli bir abonelik hizmetidir.
            Güncel plan ve bedeller{" "}
            <Link
              href="/fiyatlandirma"
              className="text-[#FF4655] hover:underline"
            >
              Fiyatlandırma
            </Link>{" "}
            sayfasında yayımlanır. Yürürlükteki bedeller şunlardır:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Aylık plan: 499 TL / ay (KDV dahil)</li>
            <li>
              Yıllık plan: 4.790 TL / yıl (KDV dahil) — aylık karşılığı 399 TL
            </li>
            <li>
              Yurt dışında yerleşik müşteriler: 9,99 USD / ay veya 95,88 USD /
              yıl
            </li>
          </ul>
          <p>
            <strong className="text-white">Fiyatlar KDV dahildir.</strong> AIMLO
            Pro dijital bir hizmettir ve %20 KDV oranına tabidir; gösterilen
            tutarlar tüketicinin ödeyeceği nihai bedeldir. Türkiye&apos;de
            yerleşik müşteriler Türk Lirası üzerinden ücretlendirilir; yabancı
            para birimi yalnızca yurt dışında yerleşik müşteriler için geçerlidir.
          </p>
          <p>
            <strong className="text-white">
              Ödeme tek çekim olarak tahsil edilir; hiçbir planda taksit
              seçeneği sunulmaz.
            </strong>{" "}
            Ödemeler, ödeme kuruluşunun güvenli altyapısı üzerinden alınır; kart
            bilgileri AIMLO tarafından saklanmaz.
          </p>
          <p>
            Abonelik, iptal edilmediği sürece seçilen dönemin sonunda aynı
            koşullarla otomatik olarak yenilenir ve kayıtlı ödeme yönteminden
            tahsil edilir. Yenileme öncesinde e-posta ile bilgilendirilirsin.
            Aboneliğini dilediğin an hesabından iptal edebilirsin; iptal, içinde
            bulunduğun ödenmiş dönemin sonunda yürürlüğe girer ve o döneme kadar
            hizmetten yararlanmaya devam edersin.
          </p>
          <p>
            Bedel değişiklikleri yalnızca ileriye dönük olarak uygulanır ve
            yenileme tarihinden önce bildirilir. Satış işleminin tarafları,
            teslimat ve ifa koşulları için{" "}
            <Link
              href="/legal/mesafeli-satis"
              className="text-[#FF4655] hover:underline"
            >
              Mesafeli Satış Sözleşmesi
            </Link>
            ; cayma hakkı, iptal ve iade için{" "}
            <Link
              href="/legal/iade"
              className="text-[#FF4655] hover:underline"
            >
              İptal ve İade Koşulları
            </Link>{" "}
            geçerlidir. Bu koşullar ile anılan belgeler arasında çelişki
            bulunması hâlinde, tüketici lehine olan hüküm uygulanır.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">4. AI Çıktısı</h2>
          <p>
            AI tarafından üretilen koçluk yorumları yardımcı bilgi
            niteliğindedir. Hata, yanlış pattern tespiti veya eksik
            bilgi içerebilir. AIMLO, AI çıktısına dayanarak verdiğiniz
            kararlardan sorumlu değildir.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">5. Riot Games</h2>
          <p>
            AIMLO Riot Games tarafından desteklenmemekte ve onaylanmamaktadır.
            VALORANT, Riot Games Inc.&apos;in ticari markasıdır. AIMLO Valorant
            oyununa hile, makro veya gerçek zamanlı saldırı yardımı SUNMAZ —
            yalnızca round sonu pasif analiz yapar (Riot ToS uyumlu).
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">6. İletişim</h2>
          <p>
            Hizmet sağlayıcı: {"GÜNAY ERDEM VE KAAN DAĞDELEN ADİ ORTAKLIĞI"} · {"Yenişehir Mah. Ankara Cad. 360 Office Kapı No: 405 Daire No: 95 Pendik/İstanbul"} ·{" "}
            {"0534 911 31 81"}
          </p>
          <p>
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
