import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/_components/SiteHeader";

export const metadata: Metadata = {
  title: "Güvenlik & Sık Sorulanlar — AIMLO",
  description:
    "AIMLO nasıl çalışır, Vanguard/ban güvenliği, gizlilik. AIMLO maçını izler — oyuna müdahale etmez, hile değildir.",
};

export default function GuvenlikPage() {
  return (
    /* pt-10: SiteHeader kendi 64px yer tutucusunu getiriyor; py-16 ile
       üst üste binince tepede çift boşluk oluyordu. */
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 pb-16 pt-10">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa.
          Eski "← Ana Sayfa" bağı kaldırıldı: panel aynı işi görüyor. */}
      <SiteHeader />
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Güvenlik &amp; Sık Sorulanlar
          </h1>
          <p className="text-sm text-neutral-500">Son güncelleme: 4 Ağustos 2026</p>
        </header>

        {/* F44 — "Vanguard-güven" bloğu (pano dalga, 2026-08-04).
            NEDEN yeniden yazıldı: önceki metin "ban yedirir mi? → Hayır." diye
            KESİN garanti veriyordu. Ban kararı yalnızca Riot'a aittir; hukuki
            taahhüt veremeyiz (pano riski aynen bunu işaret ediyor). Metin artık
            teknik gerçeklerde kalıyor — "yalnızca ekranı okur (OCR), oyuna
            müdahale etmez, dosyaya/belleğe dokunmaz, injection yok" — ve
            garanti vermediğini açıkça söylüyor. */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            Vanguard ve hesap güvenliği (en çok sorulan)
          </h2>
          <p>
            AIMLO bir hile (cheat) <strong className="text-white">değildir</strong>{" "}
            ve <strong className="text-white">oyuna müdahale etmez</strong>. Yaptığı
            tek şey, maç sırasında ekranda zaten görünen bilgiyi okumaktır (OCR —
            görüntüden yazı okuma): skor, round sonucu, ölüm bilgisi gibi veriler
            ekran görüntüsünden çıkarılır.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Oyunun belleğine girmez — okumaz, yazmaz.</li>
            <li>Oyun dosyalarına ve Vanguard&apos;a dokunmaz.</li>
            <li>Oyuna hiçbir kod / DLL enjekte etmez (injection yok).</li>
            <li>
              <strong className="text-white">Yalnızca ekranı okur</strong> — tıpkı
              bir yayın programının (OBS) ya da Discord ekran paylaşımının yaptığı
              gibi, oyunun tamamen dışında çalışır.
            </li>
          </ul>
          <p className="text-neutral-400">
            Dürüst olalım: hiçbir üçüncü taraf yazılım Riot tarafından resmî
            olarak &quot;onaylı&quot; değildir ve ban kararları yalnızca
            Riot&apos;a aittir — bu yüzden kimseye &quot;ban yemezsin&quot;
            garantisi vermiyoruz. Verebileceğimiz söz teknik olandır:
            AIMLO&apos;nun çalışma biçimi (oyun dışından, müdahalesiz izleme)
            yaygın yayın/overlay araçlarıyla aynı sınıftadır.
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
