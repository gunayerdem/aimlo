/** ÜRÜN ADI — TEK KAYNAK.
 *
 * softi (2026-07-20): "aimlo pro yerine aimlo+ olsun adı".
 *
 * ─── NEDEN BİR SABİT DOSYASI ───────────────────────────────────────
 * Ürün adı şu an birbirinden bağımsız ~20 string olarak duruyordu ve
 * bu yüzden ÜÇ FARKLI ad aynı anda canlıdaydı:
 *   • Mesafeli Satış Sözleşmesi bedel tablosu → "AIMLO Pro — Aylık"
 *   • Ödeme onay ekranı (sipariş özeti)       → "AIMLO Aylık Abonelik"
 *   • Kullanım Koşulları                      → "AIMLO Pro"
 * Tüketicinin onayladığı sipariş özeti ile sözleşmenin tarif ettiği
 * hizmetin adı tutmuyordu. Bu, ad değişikliğinden BAĞIMSIZ bir kusurdu.
 * Artık üçü de buradan besleniyor.
 *
 * ─── TÜRKÇE EK KURALI (ihlal etme) ─────────────────────────────────
 * "+" işaretine ASLA doğrudan ek getirme:
 *   YASAK:  AIMLO+'ya · AIMLO+'ta · AIMLO+'nın · AIMLO+'lı
 *   DOĞRU:  AIMLO+ aboneliği · AIMLO+ ile · AIMLO+ planı · AIMLO+ satın al
 * Ek, "+" işaretine değil ondan sonraki İSME biner. Okunaksızlığı
 * ("+'ya") ortadan kaldıran tek güvenli yol bu.
 *
 * ─── DÜZ METİN / BİLEŞEN AYRIMI ────────────────────────────────────
 * Buradaki sabitler DÜZ METİN. Next metadata, API hata mesajı, hukuki
 * sözleşme gövdesi, e-posta ve aria-label yüzeylerinde YALNIZCA bunlar
 * kullanılır — React bileşeni oraya konamaz.
 * Yalnızca pazarlama JSX'inde `<AimloPlus />` (app/_components/PlusMark.tsx)
 * kullanılabilir; o "+" işaretini marka renginde boyar.
 */

/** Ürünün adı. Her yerde birebir bu. */
export const PRODUCT_NAME = "AIMLO+";

/** Şirket/marka adı (ürün değil) — künye ve alan adı bağlamında. */
export const BRAND_NAME = "AIMLO";

/** Plan adları — KANONİK.
 *
 * Bu üç yerde BİREBİR aynı olmak zorunda:
 *   1. app/legal/mesafeli-satis  → sözleşme bedel tablosu
 *   2. app/satin-al              → sipariş özeti (tüketicinin onayladığı ekran)
 *   3. Ödeme sağlayıcı panelindeki plan/ürün adı → e-arşiv fatura kalemi
 * Ayrışırlarsa "tüketici neyi satın aldı" sorusu belgeyle kanıtlanamaz.
 *
 * TİRE YOK — bilerek. Önceki biçimde uzun tire (—) vardı; bu karakter
 * bazı e-arşiv/entegratör kalem-açıklama alanlarında sorun çıkarıyor.
 * Boşluklu sade biçim hem sözleşmede hem faturada güvenli.
 */
export const PLAN_NAMES = {
  aylik: "AIMLO+ Aylık Abonelik",
  yillik: "AIMLO+ Yıllık Abonelik",
} as const;

/** Satış CTA'sı — web ve masaüstü AYNI ifadeyi kullanır.
 *  "…ile devam et" bilerek KULLANILMIYOR: bu düğmeyi gören kullanıcı
 *  henüz abone değil, "devam" edeceği bir şey yok. */
export const CTA_BUY = { tr: "AIMLO+ satın al", en: "Get AIMLO+" } as const;

/** Kart ekstresinde görünecek işyeri açıklaması için ÖNERİ.
 *  Ürün adından TÜRETİLMEZ: "+" karakteri banka ekstre alanlarında
 *  kırpılabilir ve kullanıcı ödemeyi tanıyamazsa "tanımadığım işlem"
 *  itirazı (chargeback) açar — yeni bir üye işyeri için en zararlı metrik.
 *  Ödeme sağlayıcı panelinde bu değer ayrıca ayarlanmalı; kod okumaz. */
export const STATEMENT_DESCRIPTOR_SUGGESTION = "AIMLO.GG";
