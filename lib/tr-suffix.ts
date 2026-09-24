/**
 * TÜRKÇE SAYI EKİ — TEK KAYNAK (prompt + süzgeç aynı kuralı kullansın).
 *
 * 🔴 KANIT (B2, TR boru hattı denetimi 2026-09-16): lib/history-block.ts:135
 * eki bir BOOLEAN ile üretiyordu (`deathCount > 1 ? "inde" : "unda"`). Ünlü
 * uyumu yok → ölçülen 7 değerin 6'sı YANLIŞ: 19→"19'inde" (doğrusu 19'unda),
 * 9→"9'inde" (9'unda), 3→"3'inde" (3'ünde), 2→"2'inde" (2'sinde),
 * 1→"1'unda" (1'inde), 10→"10'inde" (10'unda); yalnız 21 tesadüfen doğruydu.
 * Yani PROMPT modele bozuk Türkçe ÖĞRETİYOR, SÜZGEÇ de aynı bozukluğu
 * temizlemeye çalışıyordu — "kod kendisiyle çelişiyor" (KB-10h nöbeti dersi).
 *
 * ⚠ NEDEN AYRI YAPRAK MODÜL (import'u YOK, olmayacak):
 * Bu tabloya İKİ katman muhtaç — lib/history-block.ts (prompt) ve
 * lib/reality-checker.ts (denetim). Biri diğerini import ederse katmanlar
 * yanlış yönde bağlanır. lib/coach-text.ts de uygun DEĞİL: o dosyanın kendi
 * yorumu (coach-text.ts:17-21) app/LandingClient.tsx'in ("use client") bu dosyadan
 * trLocative aldığını ve landing bundle'ına ağır modül sokmama politikasını
 * belgeliyor. Sıfır-import yaprak modül, iki büyük modül arasında HİÇ yeni
 * kenar açmayan tek seçenektir.
 *
 * Kural: ek, sayının SON OKUNAN sözüne uyar — "üç-ün-de" → 3'ünde,
 * "altı-sın-da" → 6'sında, "dokuz-un-da" → 9'unda.
 */

/** Son HANE → 3. tekil iyelik + bulunma eki. */
const TR_DIGIT_LOC: Record<string, string> = {
  "0": "'ında", "1": "'inde", "2": "'sinde", "3": "'ünde", "4": "'ünde",
  "5": "'inde", "6": "'sında", "7": "'sinde", "8": "'inde", "9": "'unda",
};
/** Sonu 0 olan sayılarda son hane DEĞİL onluk sözü belirler: on-unda → 10'unda. */
const TR_TENS_LOC: Record<string, string> = {
  "1": "'unda", "2": "'sinde", "3": "'unda", "4": "'ında", "5": "'sinde",
  "6": "'ında", "7": "'inde", "8": "'inde", "9": "'ında",
};
/** yüz-ünde / bin-inde / milyon-unda / milyar-ında (AIMLO'da tetiklenmez; tamlık). */
const TR_MAG_LOC: Record<number, string> = {
  2: "'ünde", 3: "'inde", 6: "'unda", 9: "'ında", 12: "'unda",
};

/** "Son N round'un M'inde" yapısındaki M için ünlü-uyumlu Türkçe ek. */
export function trOrdinalLocative(n: number): string {
  if (!Number.isFinite(n)) return "0'ında";
  const s = String(Math.trunc(Math.abs(n)));
  if (s === "0") return "0'ında";
  const last = s[s.length - 1];
  if (last !== "0") return `${s}${TR_DIGIT_LOC[last]}`;
  const tens = s.length >= 2 ? s[s.length - 2] : "0";
  if (tens !== "0") return `${s}${TR_TENS_LOC[tens]}`;
  const zeros = s.length - s.replace(/0+$/, "").length;
  const mag = zeros >= 12 ? 12 : zeros >= 9 ? 9 : zeros >= 6 ? 6 : zeros >= 3 ? 3 : 2;
  return `${s}${TR_MAG_LOC[mag]}`;
}

// ── SAYI + BULUNMA EKİ (TR-KALAN-27, 2026-09-23) ───────────────────────────────
// lib/coach-text.ts trLocative yalnız HARF ünlü uyumuna bakıyordu; rakamda ünlü
// olmadığı için her sayıya "'de" veriyordu (HEAD probe: 3'de/6'de/9'de/10'de/
// 40'de/60'de/90'de — doğrusu 3'te/6'da/9'da/10'da/40'ta/60'ta/90'da). Kural
// trOrdinalLocative ile AYNI: ek, sayının SON OKUNAN sözüne uyar (ünlü + sertlik).
/** Son HANE sözü → bulunma eki: bir-de, iki-de, üç-te, dört-te, beş-te, altı-da,
 *  yedi-de, sekiz-de, dokuz-da; 0 tek başına "sıfır-da". */
const TR_DIGIT_LOCATIVE: Record<string, string> = {
  "0": "'da", "1": "'de", "2": "'de", "3": "'te", "4": "'te",
  "5": "'te", "6": "'da", "7": "'de", "8": "'de", "9": "'da",
};
/** Sonu 0 olan sayıda ONLUK sözü: on-da, yirmi-de, otuz-da, kırk-ta, elli-de,
 *  altmış-ta, yetmiş-te, seksen-de, doksan-da. */
const TR_TENS_LOCATIVE: Record<string, string> = {
  "1": "'da", "2": "'de", "3": "'da", "4": "'ta", "5": "'de",
  "6": "'ta", "7": "'te", "8": "'de", "9": "'da",
};
/** yüz-de / bin-de / milyon-da / milyar-da / trilyon-da. */
const TR_MAG_LOCATIVE: Record<number, string> = {
  2: "'de", 3: "'de", 6: "'da", 9: "'da", 12: "'da",
};

/** Sayı + ünlü/sertlik uyumlu bulunma eki: 3 → "3'te", 40 → "40'ta", 100 → "100'de".
 *  Rakam dizisi olarak verilirse yazım korunur (baştaki sıfırlar yalnız hesapta düşer). */
export function trNumberLocative(n: number | string): string {
  const raw = typeof n === "number"
    ? (Number.isFinite(n) ? String(Math.trunc(Math.abs(n))) : "0")
    : String(n).trim();
  if (!/^\d+$/.test(raw)) return `${raw}'de`;
  const s = raw.replace(/^0+(?=\d)/, "");
  if (s === "0") return `${raw}${TR_DIGIT_LOCATIVE["0"]}`;
  const last = s[s.length - 1];
  if (last !== "0") return `${raw}${TR_DIGIT_LOCATIVE[last]}`;
  const tens = s.length >= 2 ? s[s.length - 2] : "0";
  if (tens !== "0") return `${raw}${TR_TENS_LOCATIVE[tens]}`;
  const zeros = s.length - s.replace(/0+$/, "").length;
  const mag = zeros >= 12 ? 12 : zeros >= 9 ? 9 : zeros >= 6 ? 6 : zeros >= 3 ? 3 : 2;
  return `${raw}${TR_MAG_LOCATIVE[mag]}`;
}
