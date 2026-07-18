import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Güvenlik & Sık Sorulanlar — AIMLO",
  description:
    "AIMLO nasıl çalışır, Vanguard/ban güvenliği, gizlilik. AIMLO maçını izler — oyuna müdahale etmez, hile değildir.",
};

export default function GuvenlikPage() {
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
            Güvenlik &amp; Sık Sorulanlar
          </h1>
          <p className="text-sm text-neutral-500">Son güncelleme: 26 Haziran 2026</p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            AIMLO ban yedirir mi? (En çok sorulan)
          </h2>
          <p>
            <strong className="text-white">Hayır.</strong> AIMLO bir hile (cheat)
            değildir. Oyunun belleğine girmez, dosyalarına dokunmaz, hiçbir kod
            enjekte etmez ve oyunun çalışmasına müdahale etmez. AIMLO maçını{" "}
            <strong className="text-white">yalnızca ekrandan izler</strong> — tıpkı
            bir yayın programının (OBS) ya da Discord ekran paylaşımının yaptığı
            gibi. Bu yüzden Riot Vanguard&apos;ın tespit ettiği türden bir yazılım
            değildir.
          </p>
          <p className="text-neutral-400">
            Not: Hiçbir üçüncü taraf yazılım Riot tarafından resmî olarak
            &quot;onaylı&quot; değildir; ama AIMLO&apos;nun çalışma biçimi
            (oyun dışından, müdahalesiz izleme) yaygın yayın/overlay araçlarıyla
            aynı sınıftadır.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">AIMLO nasıl çalışır?</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              &quot;Maçı İzle&quot; dediğinde AIMLO Valorant&apos;ın açık
              olup olmadığını kontrol eder (sadece Windows).
            </li>
            <li>
              Sen oynarsın; AIMLO maçını arka planda sessizce izler — senin
              hiçbir şey yapman gerekmez.
            </li>
            <li>
              Her round bittiğinde, o rounda özel koçluk saniyeler içinde
              ekranına gelir: neden öldün, düşman ne yaptı, sonraki round ne
              yapmalısın.
            </li>
            <li>
              Tüm bunlar oyunun <strong className="text-white">dışında</strong>{" "}
              olur. Oyuna hiçbir şekilde müdahale edilmez.
            </li>
          </ol>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            AIMLO ne YAPMAZ?
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Oyunun belleğini okumaz / yazmaz.</li>
            <li>Oyuna kod / DLL enjekte etmez.</li>
            <li>Fare/klavyeyi senin yerine oynamaz, otomatik nişan almaz.</li>
            <li>Oyun dosyalarını veya Vanguard&apos;ı değiştirmez.</li>
            <li>İzleme kapalıyken veya Valorant kapalıyken hiçbir şey yakalamaz.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            Gizlilik — izleme sırasında ne işlenir?
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Koçluk üretmek için izleme sırasında ekrandaki maç görüntüsü
              işlenir ve analiz için{" "}
              <strong className="text-white">OpenAI</strong> yapay zekâ servisine
              güvenli bağlantıyla (HTTPS) gönderilir.
            </li>
            <li>
              Görüntüler AIMLO tarafından <strong className="text-white">kalıcı
              olarak saklanmaz</strong>; yalnızca o anlık analiz için kullanılır.
            </li>
            <li>
              İzleme <strong className="text-white">tüm ekranı</strong> kapsar,
              sadece Valorant penceresini değil. Açık başka pencereler görünürse
              içerikleri de işlenebilir.
            </li>
            <li>
              <strong className="text-white">Tavsiye:</strong> izlemeyi başlatmadan
              önce hassas uygulamaları (banka, e-posta, mesajlaşma) kapat ya da
              küçült.
            </li>
          </ul>
          <p className="text-neutral-400">
            Kişisel verilerinin işlenmesi hakkında ayrıntı için{" "}
            <Link href="/legal/kvkk" className="text-[#FF4655] hover:underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            ve{" "}
            <Link href="/legal/privacy" className="text-[#FF4655] hover:underline">
              Gizlilik Politikası
            </Link>
            &apos;na bak.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            Kapalı beta hakkında
          </h2>
          <p>
            Şu an AIMLO kapalı betadadır — sınırlı sayıda davetli test ediyor.
            Bir sorun yaşarsan ya da geri bildirim vermek istersen{" "}
            <a
              href="mailto:support@aimlo.gg"
              className="text-[#FF4655] hover:underline"
            >
              support@aimlo.gg
            </a>{" "}
            adresine yaz. Geri bildirimin ürünü doğrudan şekillendiriyor.
          </p>
        </section>
      </article>
    </main>
  );
}
