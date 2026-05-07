import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — AIMLO",
  description: "AIMLO kullanım koşulları ve hizmet şartları.",
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
            Son güncelleme: 7 Mayıs 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">1. Hizmet</h2>
          <p>
            AIMLO, Valorant oyuncularına yapay zekâ destekli post-round
            koçluk geri bildirimi sunan bir platformdur. Hizmet beta
            aşamasındadır ve önceden bildirim yapılmaksızın değiştirilebilir.
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
          <h2 className="text-lg font-bold text-white">3. AI Çıktısı</h2>
          <p>
            AI tarafından üretilen koçluk yorumları yardımcı bilgi
            niteliğindedir. Hata, yanlış pattern tespiti veya eksik
            bilgi içerebilir. AIMLO, AI çıktısına dayanarak verdiğiniz
            kararlardan sorumlu değildir.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">4. Riot Games</h2>
          <p>
            AIMLO Riot Games tarafından desteklenmemekte ve onaylanmamaktadır.
            VALORANT, Riot Games Inc.&apos;in ticari markasıdır. AIMLO Valorant
            oyununa hile, makro veya gerçek zamanlı saldırı yardımı SUNMAZ —
            yalnızca round sonu pasif analiz yapar (Riot ToS uyumlu).
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">5. İletişim</h2>
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
