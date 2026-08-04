// --------------------------------------------------------------------------
// EN ÇIKTIDA TÜRKÇE-SIZINTI DETEKTÖRÜ — B60 (pano özellik dalgası, 2026-08-04)
// --------------------------------------------------------------------------
// NEDEN: EN dil zinciri 2026-07-18'den beri PROD'DA CANLI ama EN çıktının
// kalitesi HİÇ ölçülmemişti (KB %100 Türkçe, EN yolu tek addendum). En sık ve
// en utandırıcı hata sınıfı: İngilizce feedback'in içine Türkçe kelime/ek
// sızması ("You died at A Main'de", "dusman kafadan vurdu"). Bu modül üç
// kategori + bir ek-kalıbıyla sızıntıyı DETERMİNİSTİK yakalar:
//   (a) turkish-char      — Türkçe'ye özgü karakterler (ığüşöç İĞÜŞÖÇ + U+0307
//                           combining-dot; dotted-i OCR mirası, bkz. bellek).
//   (b) turkish-word      — yaygın Türkçe kelime listesi, TAM-KELİME eşleşme.
//                           ⚠ Türkçe-\b tuzağı (KB 10h nöbeti dersi): JS \b
//                           ASCII'dir, "açı"+ek'i böler → \b YERİNE
//                           (?<![a-zçğıöşü]) / (?![a-zçğıöşü]) sınıfı kullanılır.
//   (c) apostrophe-suffix — İngilizce metne apostrofla yapışan Türkçe hâl eki
//                           ("A Main'de", "Hookah'ta") — çok sık sızıntı biçimi.
//   (d) en-hedge          — EN tahmin dili yasağı (might be / may be / could be
//                           + CONFIDENCE_PROMPTS_EN'deki tam liste). Bu modal
//                           formlar BİLEREK deterministik süzgeçte YOK
//                           (karşı-denetim 2026-07-31: "is/was"a çevirmek özne
//                           bozar + tahmini olguya çevirir) → tek yakalama
//                           noktası ölçümdür, o da burasıdır.
//
// KULLANIM: scripts/eval-score.ts EN örneklerde otomatik çağırır (TR akışına
// dokunulmaz); scripts/test-en-leak.ts sentetik örnekler + EN korpusla sınar.
// API çağrısı YOK — tamamen statik metin analizi.
// --------------------------------------------------------------------------

import { CONFIDENCE_PROMPTS_EN } from "../lib/ai-policy";

export type EnLeakCategory = "turkish-char" | "turkish-word" | "apostrophe-suffix" | "en-hedge";

export interface EnLeakHit {
  category: EnLeakCategory;
  hit: string;      // yakalanan metin parçası (normalize edilmiş)
  context: string;  // ±18 karakter çevre — teşhis için
}

export interface EnLeakResult {
  clean: boolean;
  hits: EnLeakHit[];
}

// ── (d) EN HEDGE LİSTESİ ─────────────────────────────────────────────────────
// KAYNAK SÖZLEŞMESİ: CONFIDENCE_PROMPTS_EN.calibrating'in yasak listesiyle
// BİREBİR aynı ("maybe", "probably", "it seems", "perhaps", "might be",
// "may be", "could be"). Prompt metni bir string olduğundan liste buradan
// import EDİLEMİYOR → kopya kaçınılmaz; senkron scripts/test-en-leak.ts'teki
// guard'la ZORLANIR (listedeki her kalıp prompt metninde geçmek zorunda,
// geçmezse test kırmızı). "likely" BİLEREK yok: "unlikely" alt-dizgisi
// yanlış-pozitif üretirdi (lib/ai-policy'deki kararın aynısı).
export const EN_HEDGE_BANNED = [
  "maybe",
  "probably",
  "it seems",
  "perhaps",
  "might be",
  "may be",
  "could be",
] as const;

/** Senkron guard'ı: EN_HEDGE_BANNED, CONFIDENCE_PROMPTS_EN.calibrating ile
 *  uyumlu mu? test-en-leak.ts her koşuda çağırır — policy değişirse ölçüt
 *  sessizce eskimez, test kırılır. */
export function hedgeListInSyncWithPolicy(): { ok: boolean; missing: string[] } {
  const src = (CONFIDENCE_PROMPTS_EN.calibrating || "").toLowerCase();
  const missing = EN_HEDGE_BANNED.filter((p) => !src.includes(p));
  return { ok: missing.length === 0, missing };
}

// ── (a) TÜRKÇE-ÖZGÜ KARAKTERLER ──────────────────────────────────────────────
// U+0307 (combining dot above): İ→i̇ dotted-i mirası — OCR/normalize kazaları
// EN metne bu görünmez karakteri taşıyabilir; o da sızıntı sayılır.
const TURKISH_CHAR_RE = /[çğıöşüÇĞİÖŞÜ̇]/gu;

// ── (b) TÜRKÇE KELİME LİSTESİ ────────────────────────────────────────────────
// İki tür girdi:
//   "kelime"   → TAM kelime eşleşmesi (her iki yanda harf-sınıfı sınırı)
//   "gövde-"   → gövde + opsiyonel Türkçe/Latin ek harfleri ("raund-" →
//                raund/raundu/raundda...). Gövdeler ÖZENLE seçildi: hiçbir
//                İngilizce kelime bu gövdeyle BAŞLAMAZ (örn. "gir-" alınmadı
//                çünkü "girl" ile çakışır; "tut-" alınmadı çünkü "tutorial").
// ASCII-bozulmuş biçimler de listede ("dusman", "aciyi") — Türkçe karakter
// kontrolü (a) onları YAKALAYAMAZ, asıl hedef bu ASCII sızıntılarıdır.
const TURKISH_WORDS: readonly string[] = [
  // gövdeler (ek-toleranslı — EN-önek çakışması yok)
  "raund-", "dusman-", "düşman-", "silah-", "kafa-", "oyna-", "bekle-",
  "kullan-", "sonra-", "takim-", "olum-", "oldu-", "kose-", "vur-",
  // tam kelimeler (gövdesi EN ile çakışacağından tekil biçimler listelendi)
  "aciyi", "aciya", "acidan", "aciyla",
  "tuttun", "tutma", "tutarken", "tutuyorsun",
  "girdin", "girme", "girdi", "girip", "giriyorsun",
  "yaptin", "yapma", "yapiyor", "yapmadan",
  "atmadan", "atarken",
  "kaybettin", "kazandin", "yedin",
  "senin", "sana", "yine", "yerine", "yeniden",
  "hemen", "zaten", "kadar", "degil", "cunku", "icin",
  "ayni", "boyle", "soyle", "simdi",
];

// Sınır sınıfı — görev tarifiyle birebir: (?<![a-zçğıöşü]) ... (?![a-zçğıöşü]).
// \b KULLANILMAZ (Türkçe-\b tuzağı).
const B = "a-zçğıöşü";
const WORD_RES: { label: string; re: RegExp }[] = TURKISH_WORDS.map((w) => {
  const isStem = w.endsWith("-");
  const core = isStem ? `${w.slice(0, -1)}[${B}]*` : w;
  return { label: w, re: new RegExp(`(?<![${B}])${core}(?![${B}])`, "gu") };
});

// ── (c) APOSTROF-EK KALIBI ───────────────────────────────────────────────────
// "A Main'de", "Hookah'ta", "Jett'in" gibi Türkçe hâl/iyelik ekleri. İngilizce
// kısaltmalarla çakışmaz: 've/'d/'s/'ll/'re/'t/'m listede YOK. En uzun ek önce
// (alternation soldan-sağa — "'deki" "'de"den önce denenmeli).
const APOSTROPHE_SUFFIX_RE = new RegExp(
  `'(?:deki|daki|ndan|nden|nin|nın|nun|nün|den|dan|de|da|te|ta|ye|ya|yi|yı)(?![${B}])`,
  "gu",
);

// ── normalize ────────────────────────────────────────────────────────────────
// Küçük harfe indir + tipografik apostrofları düzle + combining-dot'u temizle
// (İ.toLowerCase() = "i"+U+0307). Kelime/ek/hedge eşleşmeleri bu normalize
// metin üzerinde; Türkçe-karakter kontrolü HAM metin üzerinde (normalize U+0307
// silerek kanıtı yok ederdi).
function normalizeEn(text: string): string {
  return text.toLowerCase().replace(/[’ʼ`´]/g, "'").replace(/̇/g, "");
}

function contextAt(text: string, index: number, len: number): string {
  const from = Math.max(0, index - 18);
  const to = Math.min(text.length, index + len + 18);
  return `${from > 0 ? "…" : ""}${text.slice(from, to)}${to < text.length ? "…" : ""}`;
}

function collect(re: RegExp, text: string, category: EnLeakCategory, hits: EnLeakHit[], label?: string) {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    hits.push({ category, hit: label ?? m[0], context: contextAt(text, m.index, m[0].length) });
    if (m[0].length === 0) re.lastIndex++; // güvence: sonsuz döngü imkânsız
  }
}

/** EN koç metninde Türkçe sızıntısı + hedge ihlali ara. Dil-bağımsız değil —
 *  SADECE lang==="en" çıktısına uygulanmalı (TR metin doğal olarak "kirli"
 *  görünür). eval-score bu ayrımı kendisi yapar. */
export function detectEnLeak(text: string): EnLeakResult {
  const hits: EnLeakHit[] = [];
  if (!text || !text.trim()) return { clean: true, hits };

  // (a) Türkçe karakter — HAM metin (normalize kanıt siler)
  collect(TURKISH_CHAR_RE, text, "turkish-char", hits);

  const t = normalizeEn(text);

  // (b) Türkçe kelime — normalize metin, tam-kelime/gövde sınırlı
  for (const { label, re } of WORD_RES) collect(re, t, "turkish-word", hits, label);

  // (c) apostrof-ek
  collect(APOSTROPHE_SUFFIX_RE, t, "apostrophe-suffix", hits);

  // (d) EN hedge — CONFIDENCE_PROMPTS_EN listesi, kelime-sınırlı
  for (const phrase of EN_HEDGE_BANNED) {
    const re = new RegExp(`(?<![a-z])${phrase.replace(/ /g, "\\s+")}(?![a-z])`, "gu");
    collect(re, t, "en-hedge", hits, phrase);
  }

  return { clean: hits.length === 0, hits };
}
