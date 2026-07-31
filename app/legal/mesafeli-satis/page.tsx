import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_NAME, PLAN_NAMES } from "@/lib/brand";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu — AIMLO",
  description:
    "AIMLO+ dijital abonelik hizmetine ilişkin Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu.",
};

/* B122 (2026-07-31): eski `PLACEHOLDER` sabiti gerçek künye değerlerini kırmızı
   mono-font chip'e sarıyordu — hukuki belge "doldurulmamış şablon" gibi
   görünüyordu (ödeme kuruluşu incelemesinde güven kıran detay). Değerler nötr
   metin oldu; ad da amacını yansıtacak şekilde `FIELD` yapıldı. */
const FIELD = "text-neutral-300";

/* Henüz KESİNLEŞMEMİŞ alan (ödeme kuruluşu unvanı — sağlayıcı seçimi
   sürüyor). Vurgu bilerek duruyor: burası gerçekten doldurulacak bir yer,
   yayına almadan önce nihai kuruluş adıyla değiştirilmeli. */
const PENDING =
  "inline-block rounded bg-[#FF4655]/10 px-1.5 py-0.5 font-mono text-[12px] text-[#FF6B77]";

export default function MesafeliSatisPage() {
  return (
    /* pt-10: SiteHeader kendi 64px yer tutucusunu getiriyor, py-16 üstüne
       binince tepede çift boşluk oluşuyordu. */
    <main className="min-h-screen bg-[#030711] text-zinc-200 px-4 pb-16 pt-10">
      {/* Sitenin tepe paneli — logo/yazıya basınca ana sayfa.
          Eski "← Ana Sayfa" bağlantısı kaldırıldı: panel aynı işi görüyor. */}
      <SiteHeader />
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu
          </h1>
          <p className="text-sm text-neutral-500">
            Son güncelleme: 20 Temmuz 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <p>
            İşbu Mesafeli Satış Sözleşmesi, 6502 sayılı Tüketicinin Korunması
            Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun
            olarak, aşağıda bilgileri yer alan SATICI ile ALICI arasında,
            elektronik ortamda sunulan dijital abonelik hizmetinin satışına
            ilişkin olarak düzenlenmiştir. ALICI, sipariş adımında bu sözleşmeyi
            ve Ön Bilgilendirme Formu&apos;nu okuduğunu ve elektronik ortamda
            onayladığını kabul eder.
          </p>
        </section>

        {/* 1 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">1. Taraflar</h2>

          {/* B123 (2026-07-31): künye artık lib/seller.ts TEK KAYNAK'tan —
              adres/telefon değişince beş sayfa arasında tutarsızlık doğmaz
              (mesafeli satış mevzuatının cezalandırdığı hata sınıfı). */}
          <h3 className="font-semibold text-white">1.1. SATICI</h3>
          <ul className="list-none space-y-1.5 rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <li>
              <span className="text-neutral-500">Ticaret Unvanı: </span>
              <span className={FIELD}>{SELLER.tradeName}</span>
            </li>
            <li>
              <span className="text-neutral-500">Adres: </span>
              <span className={FIELD}>{SELLER.address}</span>
            </li>
            <li>
              <span className="text-neutral-500">Telefon: </span>
              <span className={FIELD}>{SELLER.phone}</span>
            </li>
            <li>
              <span className="text-neutral-500">E-posta: </span>
              <span className={FIELD}>{SELLER.email}</span>
            </li>
            <li>
              <span className="text-neutral-500">Vergi Dairesi: </span>
              <span className={FIELD}>{SELLER.taxOffice}</span>
            </li>
            <li>
              <span className="text-neutral-500">Vergi Numarası: </span>
              <span className={FIELD}>{SELLER.taxNumber}</span>
            </li>
            <li>
              <span className="text-neutral-500">İnternet Sitesi: </span>
              <span className="text-neutral-300">https://aimlo.gg</span>
            </li>
          </ul>

          <h3 className="font-semibold text-white">1.2. ALICI</h3>
          <p>
            Hizmeti satın alan tüketici. ALICI&apos;nın ad-soyad/unvan, adres,
            e-posta adresi, telefon numarası ve fatura bilgileri, sipariş
            sırasında ALICI tarafından beyan edilen bilgilerden oluşur ve işbu
            sözleşmenin ayrılmaz parçası sayılır. Bu bilgilerin doğruluğundan
            ALICI sorumludur.
          </p>
        </section>

        {/* 2 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">2. Konu</h2>
          <p>
            İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait{" "}
            <span className="text-neutral-200">aimlo.gg</span> internet sitesi
            üzerinden elektronik ortamda siparişini verdiği, aşağıda nitelikleri
            ve satış fiyatı belirtilen dijital abonelik hizmetinin satışı ve
            ifası ile ilgili olarak, 6502 sayılı Tüketicinin Korunması Hakkında
            Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince
            tarafların hak ve yükümlülüklerinin belirlenmesidir.
          </p>
        </section>

        {/* 3 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            3. Sözleşme Konusu Hizmetin Temel Nitelikleri
          </h2>
          <p>
            Sözleşme konusu hizmet, <strong className="text-white">{PRODUCT_NAME}</strong>{" "}
            adlı dijital abonelik hizmetidir. AIMLO, VALORANT oyuncularına yapay
            zekâ destekli koçluk geri bildirimi sunan bir yazılım hizmetidir.
            Abonelik kapsamında sunulan başlıca özellikler:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Windows masaüstü uygulaması üzerinden round sonu yapay zekâ koçluk
              geri bildirimi.
            </li>
            <li>Maç sonu performans raporu ve istatistik özeti.</li>
            <li>
              Web paneli üzerinden geçmiş maç analizlerine ve uzun vadeli
              gelişim içgörülerine erişim.
            </li>
            <li>Abonelik süresince yayınlanan güncellemeler.</li>
          </ul>
          <p>
            Hizmet tamamen dijitaldir; fiziksel bir ürün teslimatı
            içermez. Hizmete internet bağlantısı üzerinden, ALICI&apos;nın
            kullanıcı hesabı aracılığıyla erişilir. Hizmetin kullanımı için
            uyumlu bir Windows bilgisayar ve internet bağlantısı gereklidir.
          </p>
          <p className="text-neutral-400">
            AIMLO, Riot Games tarafından desteklenmemekte ve onaylanmamaktadır.
            Yapay zekâ tarafından üretilen koçluk yorumları yardımcı bilgi
            niteliğinde olup hata içerebilir.
          </p>
        </section>

        {/* 4 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            4. Fiyat ve Ödeme Koşulları
          </h2>
          <p>
            Aşağıda belirtilen tüm fiyatlar{" "}
            <strong className="text-white">KDV dâhil</strong> toplam fiyatlardır.
            Dijital hizmet niteliği gereği ayrıca teslimat, kargo veya benzeri ek
            masraf yansıtılmaz.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400">
                  <th className="py-2 pr-4 font-semibold">Plan</th>
                  <th className="py-2 pr-4 font-semibold">Türkiye (TL)</th>
                  <th className="py-2 font-semibold">Yurt dışı (USD)</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">{PLAN_NAMES.aylik}</td>
                  <td className="py-2 pr-4">499 TL / ay</td>
                  <td className="py-2">9,99 USD / ay</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">{PLAN_NAMES.yillik}</td>
                  <td className="py-2 pr-4">4.790 TL / yıl</td>
                  <td className="py-2">95,88 USD / yıl</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul className="list-disc pl-5 space-y-1">
            <li>
              Ödeme yalnızca{" "}
              <strong className="text-white">tek çekim</strong> olarak
              yapılır. Hiçbir planda{" "}
              <strong className="text-white">taksit seçeneği bulunmamaktadır</strong>.
            </li>
            <li>
              Ödemeler kredi kartı veya banka kartı ile,{" "}
              <strong className="text-white">
                lisanslı bir ödeme kuruluşu
              </strong>{" "}
              (<span className={PENDING}>{"iyzico Ödeme Hizmetleri A.Ş."}</span>)
              altyapısı üzerinden güvenli şekilde tahsil edilir. SATICI kart
              bilgilerini saklamaz.
            </li>
            <li>
              Yıllık planın aylık karşılığı 399 TL olup, aylık plana kıyasla
              yaklaşık %20 avantaj sağlar.
            </li>
            <li>
              Sipariş toplamı, ödeme adımında ALICI&apos;ya onaydan önce açıkça
              gösterilir.
            </li>
          </ul>

          <div className="rounded-lg border border-[#FF4655]/30 bg-[#FF4655]/[0.06] p-4">
            <p>
              <strong className="text-white">Para birimi hakkında:</strong>{" "}
              Türkiye&apos;de yerleşik ALICI&apos;lar, 32 sayılı Karara ilişkin
              2008-32/34 sayılı Tebliğ&apos;in 8. maddesi uyarınca her hâlükârda{" "}
              <strong className="text-white">Türk Lirası (TL)</strong> üzerinden
              ücretlendirilir. Sitede USD fiyatların görüntülenmesi yalnızca
              bilgilendirme amaçlıdır; ödeme adımında Türkiye&apos;de yerleşik
              müşteriye veya Türkiye&apos;de ihraç edilmiş karta yapılan
              işlemlerde tahsilat TL olarak gerçekleştirilir.
            </p>
          </div>
        </section>

        {/* 5 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">5. İfa</h2>
          <p>
            Hizmet, ödemenin ilgili banka/ödeme kuruluşu tarafından onaylanmasının
            ardından{" "}
            <strong className="text-white">derhâl (ani) ifa</strong> edilir. AIMLO+
            aboneliği, ödeme onayıyla birlikte ALICI&apos;nın kullanıcı hesabına
            otomatik olarak tanımlanır ve ALICI hizmetten aynı anda yararlanmaya
            başlar. Ayrıca fiziki bir teslimat süreci veya teslim süresi söz
            konusu değildir.
          </p>
          <p>
            Ödemenin herhangi bir nedenle gerçekleşmemesi veya iptal edilmesi
            hâlinde SATICI, hizmeti ifa yükümlülüğünden kurtulmuş sayılır.
          </p>
        </section>

        {/* 6 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">6. Cayma Hakkı</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin birinci
            fıkrasının (ğ) bendi uyarınca,{" "}
            <strong className="text-white">
              elektronik ortamda anında ifa edilen hizmetler ile tüketiciye
              anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde cayma
              hakkı kullanılamaz
            </strong>
            . AIMLO+ aboneliği, ödeme onayının hemen ardından elektronik
            ortamda anında ifa edildiğinden bu istisna kapsamındadır.
          </p>
          <p>
            Ancak bu istisnanın geçerli olabilmesi için, tüketicinin{" "}
            <strong className="text-white">önceden açık onayının alınmış</strong>{" "}
            olması ve cayma hakkını kaybedeceği konusunda{" "}
            <strong className="text-white">bilgilendirilmiş</strong> olması
            şarttır. Bu nedenle satın alma adımında ({" "}
            <Link href="/satin-al" className="text-[#FF4655] hover:underline">
              /satin-al
            </Link>{" "}
            ), ALICI&apos;dan sözleşme onayından ayrı bir onay kutusu ile şu
            beyan alınır:
          </p>
          <blockquote className="rounded-lg border-l-2 border-[#FF4655] bg-white/[0.03] px-4 py-3 text-neutral-200">
            &ldquo;Hizmetin ödeme onayının hemen ardından elektronik ortamda
            anında ifa edilmesini açıkça talep ediyorum ve bu nedenle cayma
            hakkımı kaybedeceğimi biliyorum.&rdquo;
          </blockquote>
          <p>
            <strong className="text-white">Önemli:</strong> Bu ayrı onay
            alınmamışsa cayma hakkı istisnası uygulanmaz. Bu durumda ALICI,
            sözleşmenin kurulduğu tarihten itibaren{" "}
            <strong className="text-white">14 (on dört) gün</strong> içinde
            hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını
            kullanabilir. Cayma bildirimi{" "}
            <span className={FIELD}>{SELLER.email}</span> adresine yazılı
            olarak veya kalıcı veri saklayıcısı ile iletilir. Usulüne uygun cayma
            hâlinde ödenen bedel, bildirimin SATICI&apos;ya ulaşmasından itibaren
            14 gün içinde ALICI&apos;ya ödeme yaptığı araçla iade edilir.
          </p>
          <p>
            Cayma hakkının kullanıldığı hâllerde, ALICI&apos;nın hizmetten
            yararlanmış olduğu süreye karşılık gelen orantılı bedel mahsup
            edilebilir.
          </p>
        </section>

        {/* 7 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            7. Abonelik Yenileme ve İptal
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Abonelik, seçilen dönem sonunda (aylık planda her ay, yıllık planda
              her yıl){" "}
              <strong className="text-white">otomatik olarak yenilenir</strong> ve
              o dönem için geçerli ücret aynı ödeme yöntemiyle tahsil edilir.
            </li>
            <li>
              ALICI, aboneliğini{" "}
              <strong className="text-white">istediği zaman</strong>, herhangi bir
              gerekçe göstermeksizin ve ek ücret ödemeksizin hesap ayarlarından
              veya{" "}
              <span className={FIELD}>{SELLER.email}</span> adresine
              bildirimde bulunarak iptal edebilir.
            </li>
            <li>
              İptal,{" "}
              <strong className="text-white">
                içinde bulunulan ödeme döneminin sonunda
              </strong>{" "}
              geçerli olur; iptal anında bedel iadesi yapılmaz.
            </li>
            <li>
              İptal sonrasında ALICI, ödemesini yaptığı dönemin sonuna kadar
              hizmeti{" "}
              <strong className="text-white">kullanmaya devam edebilir</strong>.
              Dönem sonunda abonelik sona erer ve yeni bir tahsilat yapılmaz.
            </li>
            <li>
              Yenileme tarihinden önce fiyat değişikliği yapılması hâlinde ALICI,
              yenileme tarihinden makul bir süre önce bilgilendirilir ve
              bilgilendirmenin ardından aboneliğini iptal etme hakkına sahiptir.
            </li>
          </ul>
        </section>

        {/* 8 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">
            8. Teslimat / İfa Şekli
          </h2>
          <p>
            Hizmet dijital olarak, internet üzerinden ifa edilir. Fiziksel bir
            ürün gönderimi bulunmadığından{" "}
            <strong className="text-white">
              teslimat masrafı, kargo ücreti veya benzeri bir ek maliyet
              yoktur
            </strong>
            . İfa, ödeme onayı ile eş zamanlı olarak, ALICI&apos;nın kayıtlı
            kullanıcı hesabına aboneliğin tanımlanması suretiyle gerçekleşir.
            ALICI&apos;nın hizmete erişimi, aimlo.gg web paneli ve AIMLO Windows
            masaüstü uygulaması üzerinden sağlanır.
          </p>
        </section>

        {/* 9 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">9. Uyuşmazlıkların Çözümü</h2>
          <p>
            İşbu sözleşmeden doğabilecek uyuşmazlıklarda ALICI, Ticaret
            Bakanlığı&apos;nca ilgili yıl için belirlenen parasal sınırlar
            dâhilinde, kendi yerleşim yerinin veya işlemin yapıldığı yerin{" "}
            <strong className="text-white">Tüketici Hakem Heyetlerine</strong>;
            bu sınırların üzerindeki uyuşmazlıklarda ise{" "}
            <strong className="text-white">Tüketici Mahkemelerine</strong>{" "}
            başvurabilir. Parasal sınırlar her takvim yılı başında yeniden
            belirlenmekte olup güncel tutarlar Ticaret Bakanlığı tarafından ilan
            edilir.
          </p>
          <p>
            ALICI, şikâyet ve talepleri için öncelikle{" "}
            <span className={FIELD}>{SELLER.email}</span> adresine veya{" "}
            <span className={FIELD}>{SELLER.phone}</span> numarasına
            başvurabilir.
          </p>
        </section>

        {/* 10 */}
        <section className="space-y-3 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-lg font-bold text-white">10. Yürürlük</h2>
          <p>
            İşbu sözleşme, ALICI tarafından elektronik ortamda okunup
            onaylanmasının ardından yürürlüğe girer ve ödeme işleminin
            tamamlanmasıyla birlikte taraflar arasında kurulmuş sayılır. ALICI,
            sözleşmenin tüm koşullarını ve Ön Bilgilendirme Formu&apos;nu ödeme
            işleminden önce okuduğunu, anladığını ve kabul ettiğini beyan eder.
            Sözleşmenin bir örneği ALICI&apos;nın e-posta adresine gönderilir ve
            hesabı üzerinden erişilebilir tutulur.
          </p>
        </section>

        {/* ÖN BİLGİLENDİRME FORMU */}
        <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-relaxed text-neutral-300">
          <h2 className="text-xl font-black text-white tracking-tight">
            Ön Bilgilendirme Formu
          </h2>
          <p className="text-neutral-400">
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 5. maddesi uyarınca,
            sözleşme kurulmadan önce ALICI aşağıdaki hususlarda
            bilgilendirilmiştir.
          </p>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-white">
                Satıcının kimliği ve iletişim bilgileri
              </h3>
              <p>
                <span className={FIELD}>{SELLER.tradeName}</span> ·{" "}
                <span className={FIELD}>{SELLER.address}</span> ·{" "}
                <span className={FIELD}>{SELLER.phone}</span> ·{" "}
                <span className={FIELD}>{SELLER.email}</span> · Vergi
                Dairesi/No:{" "}
                <span className={FIELD}>{SELLER.taxOffice}</span> /{" "}
                <span className={FIELD}>{SELLER.taxNumber}</span>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Hizmetin temel nitelikleri
              </h3>
              <p>
                AIMLO+ dijital abonelik: VALORANT için yapay zekâ destekli
                round sonu koçluk geri bildirimi, maç raporu, web paneli erişimi
                ve güncellemeler. Hizmet tamamen dijitaldir; Windows masaüstü
                uygulaması ve web paneli üzerinden sunulur.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Toplam fiyat (tüm vergiler dâhil)
              </h3>
              <p>
                Türkiye: 499 TL/ay veya 4.790 TL/yıl (KDV dâhil). Yurt dışı: 9,99
                USD/ay veya 95,88 USD/yıl. Ek teslimat/kargo masrafı yoktur.
                Türkiye&apos;de yerleşik müşteriler TL ile ücretlendirilir.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Ödeme şekli</h3>
              <p>
                Kredi kartı veya banka kartı ile, lisanslı bir ödeme kuruluşu (
                <span className={PENDING}>{"iyzico Ödeme Hizmetleri A.Ş."}</span>)
                altyapısı üzerinden tek çekim. Taksit seçeneği yoktur.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">İfa şekli ve süresi</h3>
              <p>
                Elektronik ortamda anında ifa. Ödeme onayının ardından abonelik
                derhâl kullanıcı hesabına tanımlanır. Fiziki teslimat yoktur.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Cayma hakkı</h3>
              <p>
                Yönetmelik Md. 15/1-(ğ) uyarınca elektronik ortamda anında ifa
                edilen hizmetler cayma hakkı istisnasındadır. Bu istisna, ALICI
                satın alma adımında anında ifayı açıkça talep ettiğini ve cayma
                hakkını kaybedeceğini bildiğini ayrı bir onay kutusuyla beyan
                ettiği takdirde uygulanır. Bu onay alınmamışsa ALICI 14 günlük
                cayma hakkını kullanabilir.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Abonelik süresi ve fesih
              </h3>
              <p>
                Abonelik seçilen dönem sonunda otomatik yenilenir. ALICI istediği
                zaman iptal edebilir; iptal dönem sonunda geçerli olur ve dönem
                sonuna kadar hizmet kullanılmaya devam edilebilir.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Şikâyet ve başvuru yolları
              </h3>
              <p>
                Öncelikli başvuru:{" "}
                <span className={FIELD}>{SELLER.email}</span> /{" "}
                <span className={FIELD}>{SELLER.phone}</span>. Ayrıca
                ALICI, ilgili yıl için belirlenen parasal sınırlar dâhilinde
                Tüketici Hakem Heyetlerine, bu sınırların üzerinde ise Tüketici
                Mahkemelerine başvurabilir.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-white/10 pt-6 text-sm leading-relaxed text-neutral-400">
          <p>
            İlgili diğer metinler:{" "}
            <Link href="/legal/terms" className="text-[#FF4655] hover:underline">
              Kullanım Koşulları
            </Link>{" "}
            ·{" "}
            <Link href="/legal/privacy" className="text-[#FF4655] hover:underline">
              Gizlilik Politikası
            </Link>{" "}
            ·{" "}
            <Link href="/legal/kvkk" className="text-[#FF4655] hover:underline">
              KVKK Aydınlatma Metni
            </Link>
          </p>
        </section>
      </article>
    </main>
  );
}
