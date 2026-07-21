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
  /* Adi ortaklığın 10 haneli VERGİ KİMLİK NUMARASI (VKN) — kişisel TCKN DEĞİL.
     E-Ticaret Yönetmeliği Md.5: MERSİS'i olmayan işletme (adi ortaklığın tüzel
     kişiliği yok) künyede vergi kimlik numarası göstermeli. Önceden yanlışlıkla
     11 haneli kişisel TCKN konmuştu; KVKK açısından hassas ve yasanın istediği
     de o değil. VKN kurumsal ve zaten aleni bir numaradır. */
  taxNumber: "4271175312",
} as const;

/** Künye satırları — gösterim sırası. Etiket + değer. */
export const SELLER_ROWS: ReadonlyArray<readonly [string, string]> = [
  ["Ticaret unvanı", SELLER.tradeName],
  ["Adres", SELLER.address],
  ["Telefon", SELLER.phone],
  ["E-posta", SELLER.email],
  ["Vergi dairesi", SELLER.taxOffice],
  ["Vergi kimlik no", SELLER.taxNumber],
];
