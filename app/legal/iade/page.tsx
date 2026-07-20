import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İptal, İade ve Cayma Koşulları — AIMLO",
  description:
    "AIMLO abonelik iptali, cayma hakkı ve iade koşulları. Mesafeli Sözleşmeler Yönetmeliği kapsamında bilgilendirme.",
};

/** softi tarafından doldurulacak alan — görünür bırakıldı, yayına almadan önce doldur. */
function Ph({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-[#FF4655]/10 px-1.5 py-0.5 font-mono text-[13px] font-bold text-[#FF4655]">
      {children}
    </span>
  );
}

export default function IadePage() {
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
            İptal, İade ve Cayma Koşulları
          </h1>
          <p className="text-sm text-neutral-500">Son güncelleme: 20 Temmuz 2026</p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <p>
            Bu metin, AIMLO dijital koçluk hizmetine ilişkin aboneliklerin
            iptali, cayma hakkının kapsamı ve iade süreçlerini düzenler.
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
            Sözleşmeler Yönetmeliği hükümleri saklıdır.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">1. Aboneliğin İptali</h2>
          <p>
            AIMLO abonelikleri aylık veya yıllık dönemler hâlinde satılır ve
            dönem sonunda otomatik olarak yenilenir. Aboneliğinizi dilediğiniz
            zaman, herhangi bir gerekçe göstermeden ve ek ücret ödemeden iptal
            edebilirsiniz.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Hesap ayarlarından:</strong> web
              panelinde hesap / abonelik bölümünden &quot;Aboneliği iptal
              et&quot; adımını izleyin.
            </li>
            <li>
              <strong className="text-white">Destek üzerinden:</strong> uygulama
              içi destek sistemi veya <Ph>{"support@aimlo.gg"}</Ph> adresine
              göndereceğiniz bir talep yeterlidir.
            </li>
          </ul>
          <p>
            İptal talebi <strong className="text-white">anında</strong> işleme
            alınır; otomatik yenileme durdurulur. Hizmete erişiminiz, bedelini
            ödemiş olduğunuz{" "}
            <strong className="text-white">
              mevcut dönemin sonuna kadar aynen devam eder
            </strong>{" "}
            ve dönem bittiğinde sona erer. İptal anında hesabınız kapanmaz,
            kalan gün hakkınız yanmaz.
          </p>
          <p>
            Yıllık abonelikte iptal, bir sonraki yıllık yenilemeyi durdurur;
            içinde bulunulan yıl için aşağıdaki iade koşulları uygulanır.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">2. Cayma Hakkı</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/1-(ğ) maddesi uyarınca,{" "}
            <strong className="text-white">
              elektronik ortamda anında ifa edilen ve tüketiciye anında teslim
              edilen gayrimaddi mallara ilişkin sözleşmelerde cayma hakkı
              kullanılamaz.
            </strong>{" "}
            AIMLO, satın alma tamamlandığı anda erişime açılan bir dijital
            hizmettir ve bu istisna kapsamındadır.
          </p>
          <p>
            Bu nedenle satın alma adımında, hizmetin ödeme onayının hemen
            ardından ifa edileceğini ve bu durumda cayma hakkınızın
            bulunmadığını kabul ettiğinize dair{" "}
            <strong className="text-white">açık onayınız</strong> ayrı bir kutu
            işaretlenerek alınır. Bu onayı vermeden satın alma tamamlanamaz.
          </p>
          <p>
            Söz konusu açık onayın alınmadığı veya ön bilgilendirmenin usulüne
            uygun yapılmadığı hâllerde, tüketici sözleşmenin kurulduğu tarihten
            itibaren <strong className="text-white">14 (on dört) gün</strong>{" "}
            içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma
            hakkını kullanabilir. Cayma bildirimi{" "}
            <Ph>{"support@aimlo.gg"}</Ph> adresine yapılabilir.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">3. İade Politikası</h2>
          <p>
            Yasal cayma hakkının kapsamı dışında kalan hâllerde dahi, kullanıcı
            memnuniyeti gereği aşağıdaki ticari iade imkânlarını sunuyoruz. Bu
            politika, tüketicinin yasal haklarını sınırlamaz.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Hiç kullanılmamış hizmet:</strong>{" "}
              Satın alma tarihinden itibaren 14 gün içinde başvurmanız ve hesabınızda{" "}
              <strong className="text-white">hiç maç analizi üretilmemiş</strong>{" "}
              olması (0 analiz) hâlinde, ödediğiniz bedelin tamamı iade edilir.
            </li>
            <li>
              <strong className="text-white">Teknik nedenle çalışmama:</strong>{" "}
              Hizmet, bizden kaynaklanan teknik bir nedenle çalışmıyorsa ve
              destek ekibimiz sorunu makul sürede çözemiyorsa, hizmetten
              yararlanamadığınız döneme karşılık gelen{" "}
              <strong className="text-white">orantılı (pro-rata) iade</strong>{" "}
              yapılır.
            </li>
          </ul>
          <p>
            İadeler, ödemenin yapıldığı{" "}
            <strong className="text-white">aynı ödeme yöntemine</strong> ve aynı
            para birimiyle gerçekleştirilir. İade talebi onaylandıktan sonra
            tutar tarafımızca derhâl bankaya/ödeme kuruluşuna iletilir; tutarın
            kart veya hesabınıza yansıması bankanızın sürecine bağlı olarak
            genellikle <strong className="text-white">5-10 iş günü</strong>{" "}
            sürer. Bu süredeki gecikmelerden bankalar sorumludur.
          </p>
          <p className="text-neutral-400">
            İadenin kapsamı dışında kalan hâller: aboneliğin normal şekilde
            kullanıldığı geçmiş dönemler, kullanıcının kendi donanım/işletim
            sistemi kaynaklı uyumsuzlukları ve kullanım koşullarının ihlali
            nedeniyle kapatılan hesaplar.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            4. Başarısız Ödeme ve Yenileme Sorunları
          </h2>
          <p>
            Yenileme tarihinde ödemenin alınamaması (limit yetersizliği, kartın
            süresinin dolması, bankanın işlemi reddetmesi vb.) hâlinde:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Sizi e-posta ile bilgilendirir ve ödeme yöntemini güncellemeniz
              için makul bir süre tanırız.
            </li>
            <li>
              Bu süre içinde ödeme birkaç kez yeniden denenir; başarısız
              denemeler için sizden ek bir ücret alınmaz.
            </li>
            <li>
              Ödeme yine alınamazsa abonelik askıya alınır ve ücretli
              özelliklere erişim durur. Hesabınız ve geçmiş analiz verileriniz
              silinmez.
            </li>
            <li>
              Ödemeyi tamamladığınızda abonelik kaldığı yerden devam eder.
            </li>
          </ul>
          <p>
            Hatalı veya mükerrer çekim tespit ederseniz, fazla çekilen tutar
            koşulsuz olarak iade edilir. Lütfen işlem tarihi ve tutarıyla
            birlikte bize ulaşın.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            5. İade Talebi Nasıl Yapılır?
          </h2>
          <p>
            Talebinizi aşağıdaki kanallardan birine iletmeniz yeterlidir. Hesap
            e-postanız, satın alma tarihi ve talebin gerekçesini belirtmeniz
            süreci hızlandırır.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              E-posta: <Ph>{"support@aimlo.gg"}</Ph>
            </li>
            <li>
              Uygulama içi destek sistemi (masaüstü uygulaması ve web panelinde
              &quot;Destek&quot; bölümü)
            </li>
          </ul>
          <p>
            Talepler en geç{" "}
            <strong className="text-white">2 iş günü</strong> içinde
            yanıtlanır; onaylanan iadeler yasal süreler içinde işleme alınır.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            6. Uyuşmazlıkların Çözümü
          </h2>
          <p>
            Talebinizin çözüme kavuşmadığını düşünüyorsanız, 6502 sayılı
            Tüketicinin Korunması Hakkında Kanun uyarınca, Ticaret
            Bakanlığı&apos;nca her yıl belirlenen parasal sınırlar çerçevesinde
            ikametgâhınızın veya işlemin yapıldığı yerin{" "}
            <strong className="text-white">Tüketici Hakem Heyetleri</strong>&apos;ne
            ya da <strong className="text-white">Tüketici Mahkemeleri</strong>&apos;ne
            başvurabilirsiniz. Güncel parasal sınırlar Ticaret Bakanlığı
            tarafından ilan edilir.
          </p>
        </section>

        <section className="space-y-3 border-t border-white/10 pt-6 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">Satıcı Bilgileri</h2>
          <p>
            Ticaret unvanı: <Ph>{"GÜNAY ERDEM VE KAAN DAĞDELEN ADİ ORTAKLIĞI"}</Ph>
          </p>
          <p>
            Adres: <Ph>{"Yenişehir Mah. Ankara Cad. 360 Office Kapı No: 405 Daire No: 95 Pendik/İstanbul"}</Ph>
          </p>
          <p>
            E-posta: <Ph>{"support@aimlo.gg"}</Ph> · Telefon:{" "}
            <Ph>{"0534 911 31 81"}</Ph>
          </p>
          <p className="text-neutral-400">
            Tüm künye bilgileri için{" "}
            <Link href="/iletisim" className="text-[#FF4655] hover:underline">
              İletişim
            </Link>{" "}
            sayfasına bakabilirsiniz.
          </p>
        </section>
      </article>
    </main>
  );
}
