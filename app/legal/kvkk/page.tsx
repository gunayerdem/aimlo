import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — AIMLO",
  description:
    "AIMLO Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma metni.",
};

export default function KvkkPage() {
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
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-sm text-neutral-500">
            Son güncelleme: 7 Mayıs 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
            kapsamında AIMLO platformu (&quot;AIMLO&quot;, &quot;Biz&quot;)
            veri sorumlusudur. İletişim:{" "}
            <a
              href="mailto:support@aimlo.gg"
              className="text-[#FF4655] hover:underline"
            >
              support@aimlo.gg
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            2. İşlenen Kişisel Veriler
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kimlik: ad, soyad, kullanıcı adı</li>
            <li>İletişim: e-posta adresi</li>
            <li>
              Kullanım: oyun verisi (harita, ajan, round sonucu), uygulama
              içi etkileşim logları
            </li>
            <li>
              Teknik: IP adresi, tarayıcı bilgisi, oturum çerezleri
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">3. İşleme Amaçları</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Hesap oluşturma ve oturum yönetimi</li>
            <li>Yapay zekâ destekli koçluk hizmetinin sunulması</li>
            <li>Kötüye kullanım, sahtekarlık ve kötü amaçlı bot tespiti</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">4. Aktarım</h2>
          <p>
            Kişisel verileriniz; barındırma (Vercel, Supabase), e-posta
            iletimi (Resend), AI işleme (OpenAI) hizmet sağlayıcılarına
            yalnızca hizmetin gerektirdiği ölçüde aktarılır. Yurtdışına
            aktarım gerçekleştiğinde KVKK 9. madde uyarınca açık rızanız
            esas alınır.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            5. KVKK 11. Madde Hakları
          </h2>
          <p>
            Kişisel verilerinize ilişkin olarak; bilgi talep etme,
            işlenen verilerinizi öğrenme, düzeltme, silme veya yok etme,
            işlemeye itiraz etme ve aktarıldığı kişileri öğrenme
            haklarınız vardır. Bu haklarınızı{" "}
            <a
              href="mailto:support@aimlo.gg"
              className="text-[#FF4655] hover:underline"
            >
              support@aimlo.gg
            </a>{" "}
            adresine talep göndererek kullanabilirsiniz.
          </p>
          <p>
            Hesabınızı tamamen silmek için{" "}
            <Link
              href="/account/delete"
              className="text-[#FF4655] hover:underline"
            >
              hesap silme sayfasını
            </Link>{" "}
            kullanabilirsiniz.
          </p>
        </section>
      </article>
    </main>
  );
}
