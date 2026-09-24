import type { Metadata } from "next";
import { SiteHeader } from "@/app/_components/SiteHeader";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — AIMLO",
  description: "AIMLO gizlilik politikası ve veri kullanımı.",
};

export default function PrivacyPage() {
  return (
    /* pt-10: SiteHeader kendi 64px yer tutucusunu getiriyor, py-16 üstüne
       binince tepede çift boşluk oluyordu. */
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 pb-16 pt-10">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa. */}
      <SiteHeader />
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 border-b border-white/10 pb-6">
          {/* "← Ana Sayfa" bağı kaldırıldı: tepe panelindeki logo aynı işi görüyor. */}
          <h1 className="text-3xl font-black text-white tracking-tight">
            Gizlilik Politikası
          </h1>
          <p className="text-sm text-neutral-500">
            Son güncelleme: 24 Eylül 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Topladığımız Veri</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kayıt sırasında: isim, soyisim, kullanıcı adı, e-posta, şifre (hash)</li>
            <li>Oyun analizi: harita, ajan, round sonuçları, ölüm konumları</li>
            {/* F49 (2026-09-24): kodda işlenen ama metinde olmayan üç kalem.
                Ekran görüntüsü yalnız died !== false iken OpenAI'ye gider
                (vision/route.ts buildUserContent) ve hiçbir yere yazılmaz. */}
            <li>
              Ekran görüntüsü (yalnızca ölünen round&apos;da): anlık AI analizi
              için OpenAI&apos;ye gönderilir; AIMLO sunucularında saklanmaz
            </li>
            <li>Destek mesajları: mesaj metni ve hesabın e-posta adresi</li>
            <li>
              Teknik telemetri: süre ve hata ölçümleri; kullanıcı kimliği
              SHA-256 ile özetlenir
            </li>
            <li>Oturum: IP adresi, tarayıcı, çerez bilgisi</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Nerede Saklıyoruz</h2>
          <p>
            Kullanıcı verileri Supabase (AB - eu-central-1) sunucularında
            saklanır. Maç verileri ve oyun istatistikleri Row Level
            Security ile diğer kullanıcılara kapalıdır; hizmetin işletilmesi
            ve destek için yalnızca yetkili AIMLO yöneticileri erişebilir.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Üçüncü Taraflar</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Vercel (barındırma + Analytics/Speed Insights: sayfa görüntüleme ve
              performans ölçümü) — bkz. vercel.com/legal/privacy-policy
            </li>
            <li>Supabase (veritabanı + auth) — bkz. supabase.com/privacy</li>
            <li>Resend (e-posta iletimi) — bkz. resend.com/legal/privacy-policy</li>
            <li>
              Upstash (hız sınırı sayaçları: IP adresi, e-posta adresi ve
              kullanıcı kimliği tabanlı anahtarlar) — bkz. upstash.com
            </li>
            {/* F49 (2026-09-24): "sadece prompt verisi" yanlıştı — ölünen
                round'da ekran görüntüsü de gidiyor (vision/route.ts:212-219). */}
            <li>
              OpenAI (AI işleme — ekran görüntüsü (yalnızca ölünen round&apos;da)
              + round verisi; AIMLO saklamaz) — bkz.
              openai.com/policies/privacy-policy
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Çerezler</h2>
          <p>
            Yalnızca oturum yönetimi için zorunlu çerez kullanırız.
            Reklam veya 3. parti analitik çerezi yoktur.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">İletişim</h2>
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
