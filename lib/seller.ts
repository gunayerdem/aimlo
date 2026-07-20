/** SATICI KÜNYESİ — TEK KAYNAK.
 *
 * E-ticaret mevzuatı (6563 sayılı Kanun + Mesafeli Sözleşmeler Yönetmeliği)
 * bu bilgilerin sitede açıkça bulunmasını zorunlu kılar; iyzico başvuru
 * incelemesi de bunları arar.
 *
 * Bilgi 5 ayrı sayfada gösteriliyor (fiyatlandırma, satın-al, mesafeli satış,
 * iade, iletişim). Kopyalamak yerine buradan okunur — biri değişince
 * (adres/telefon) tek yerde güncellenir, sayfalar arası tutarsızlık olmaz.
 *
 * MERSİS numarası YOK: adi ortaklığın tüzel kişiliği olmadığı için ticaret
 * siciline tescil edilmez, dolayısıyla MERSİS alamaz (yalnız limited/anonim
 * şirketlerde bulunur). Künyeye "yok" yazmak yerine satır hiç gösterilmiyor.
 */
export const SELLER = {
  tradeName: "GÜNAY ERDEM VE KAAN DAĞDELEN ADİ ORTAKLIĞI",
  address:
    "Yenişehir Mah. Ankara Cad. 360 Office Kapı No: 405 Daire No: 95 Pendik/İstanbul",
  phone: "0534 911 31 81",
  /** tel: bağlantısı için boşluksuz uluslararası biçim. */
  phoneHref: "+905349113181",
  email: "support@aimlo.gg",
  taxOffice: "Pendik Vergi Dairesi",
  taxNumber: "44461434066",
} as const;

/** Künye satırları — gösterim sırası. Etiket + değer. */
export const SELLER_ROWS: ReadonlyArray<readonly [string, string]> = [
  ["Ticaret unvanı", SELLER.tradeName],
  ["Adres", SELLER.address],
  ["Telefon", SELLER.phone],
  ["E-posta", SELLER.email],
  ["Vergi dairesi", SELLER.taxOffice],
  ["Vergi / TCKN no", SELLER.taxNumber],
];
