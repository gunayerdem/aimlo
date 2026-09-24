import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — AIMLO",
  description:
    "AIMLO Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    /* py-16 → pb-16 pt-10: SiteHeader kendi 64px yer tutucusunu getiriyor,
       py-16 üstüne binince tepede çift boşluk oluşuyordu. */
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 pb-16 pt-10">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa. */}
      <SiteHeader />
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 border-b border-white/10 pb-6">
          {/* "← Ana Sayfa" bağlantısı KALDIRILDI: tepe panelindeki logo
              aynı işi yapıyor, ikisi birden gereksiz tekrar. */}
          <h1 className="text-3xl font-black text-white tracking-tight">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-sm text-neutral-500">
            Son güncelleme: 24 Eylül 2026
          </p>
        </header>

        {/* F49 (2026-09-24): "AIMLO platformu veri sorumlusudur" bir kişi
            değildi; kimlik lib/seller.ts'te (TEK KAYNAK) duruyordu ama bu sayfa
            onu okumuyordu. Kopyalama yok — SELLER'dan okunur. Adi ortaklıkta
            veri sorumlusunun hukuken kim sayılacağı hukukçu sorusu:
            docs/legal/KVKK-HUKUKCU-TASLAGI.md. */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
            kapsamında veri sorumlusu, AIMLO&apos;yu (&quot;AIMLO&quot;,
            &quot;Biz&quot;) işleten {SELLER.tradeName} olup bilgileri
            aşağıdadır:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adres: {SELLER.address}</li>
            <li>
              Vergi dairesi ve VKN: {SELLER.taxOffice} · {SELLER.taxNumber}
            </li>
            <li>
              E-posta:{" "}
              <a
                href={`mailto:${SELLER.email}`}
                className="text-[#FF4655] hover:underline"
              >
                {SELLER.email}
              </a>
            </li>
          </ul>
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
            {/* F49 (2026-09-24): aşağıdaki üç kalem kodda işleniyordu ama
                metinde yoktu. Ekran görüntüsü: vision/route.ts buildUserContent
                görseli yalnız died !== false iken OpenAI'ye koyar; route ne
                görseli ne base64'ü DB'ye/storage'a yazar (saveMatchEvent /
                saveAiUsage alanlarında görsel yok). Destek:
                support_messages (user_id, email, message). Telemetri:
                telemetry_events.user_hash = sha256(user.id) ilk 16 hane. */}
            <li>
              Ekran görüntüsü: izleme sırasında alınan oyun karesi. Yalnızca
              öldüğünüz round&apos;da, anlık yapay zekâ analizi için
              OpenAI&apos;ye (ABD) gönderilir; AIMLO sunucularında
              kaydedilmez.
            </li>
            <li>
              Destek mesajları: destek formundan yazdığınız metin ve
              hesabınızın e-posta adresi
            </li>
            <li>
              Teknik telemetri: uygulamanın çalışma ölçümleri (süreler, hata
              kodları, uygulama sürümü); kullanıcı kimliğiniz SHA-256 ile
              özetlenerek saklanır
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
          {/* F49 (2026-09-24): alıcı listesi koda göre tamamlandı — Upstash
              (lib/api-auth.ts rate:ip:<IP> + kullanıcı kimliği anahtarları,
              lib/auth-rate-limit.ts authrl:<eylem>:id:<e-posta> ve
              authrl:<eylem>:ip:<IP>), Vercel Analytics + Speed Insights
              (app/layout.tsx). Aşağıdaki "açık rızanız esas alınır" cümlesi
              ve md.9 dayanağı hukukçu onayı bekliyor, DOKUNULMADI. */}
          <p>
            Kişisel verileriniz; barındırma (Vercel; Vercel Analytics ve
            Speed Insights ile sayfa görüntüleme ve performans ölçümü dâhil),
            veritabanı ve kimlik doğrulama (Supabase), hız sınırı sayaçları
            (Upstash; IP adresi, e-posta adresi ve kullanıcı kimliği tabanlı
            sayaç anahtarları), e-posta iletimi (Resend), AI işleme (OpenAI;
            öldüğünüz round&apos;daki ekran görüntüsü ve round verisi) hizmet
            sağlayıcılarına yalnızca hizmetin gerektirdiği ölçüde aktarılır.
            Yurtdışına
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
