import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — AIMLO",
  description: "AIMLO gizlilik politikası ve veri kullanımı.",
};

export default function PrivacyPage() {
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
            Gizlilik Politikası
          </h1>
          <p className="text-sm text-neutral-500">
            Son güncelleme: 7 Mayıs 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Topladığımız Veri</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kayıt sırasında: isim, soyisim, kullanıcı adı, e-posta, şifre (hash)</li>
            <li>Oyun analizi: harita, ajan, round sonuçları, ölüm konumları</li>
            <li>Oturum: IP adresi, tarayıcı, çerez bilgisi</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Nerede Saklıyoruz</h2>
          <p>
            Kullanıcı verileri Supabase (AB - eu-central-1) sunucularında
            saklanır. Maç verileri ve oyun istatistikleri Row Level
            Security ile sadece sahibine açılır.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Üçüncü Taraflar</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vercel (barındırma) — bkz. vercel.com/legal/privacy-policy</li>
            <li>Supabase (veritabanı + auth) — bkz. supabase.com/privacy</li>
            <li>Resend (e-posta iletimi) — bkz. resend.com/legal/privacy-policy</li>
            <li>OpenAI (AI işleme — sadece prompt verisi) — bkz. openai.com/policies/privacy-policy</li>
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
