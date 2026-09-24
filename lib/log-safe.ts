// LOG-GÜVENLİ GÖSTERİM — kullanıcı kontrollü değerler için (log forging).
// ─────────────────────────────────────────────────────────────────────────────
// KÖK (B03 inceleme → W2 inceleme RW1-F2, 2026-09-24): vision route'un console
// şablonları istemci değerini TİP ve İÇERİK kontrolü olmadan interpolate ediyordu.
// 1b61e55 yalnız canlı-sayısı WARN satırını kapatmıştı (aliveCountForLog); aynı
// sınıf aynı route'ta açık kaldı:
//   · route.ts imageFormat red satırı — isValidVisionRequest yalnız
//     `fmt.includes("png")` istiyor → "png\n[Aimlo AI] vision OK user=admin"
//     doğrulamadan geçip Vercel loguna SAHTE SATIR yazıyordu;
//   · route.ts maxTokens satırı — maxTokens için tip doğrulaması yok;
//   · builder [KB] satırı (map/agent/rank seçicileri) ve knowledge-loader'ın seçici
//     uyarıları — MAX_CTX_FIELD_LEN (4096) altındaki her dize, satır sonu dahil.
// ÇÖZÜM: tek yardımcı. Sayı/boolean → String (satır sonu içeremez). Dize → uzunluk
// kapağı + kontrol karakterleri (C0/C1, U+2028/2029) ve bidi yön karakterleri
// (U+202A-202E, U+2066-2069 — log görüntüleyicide satırı görsel olarak ters
// çevirebilir) \uXXXX kaçışıyla; SIRADAN DİZE BAYT-AYNI kalır ("Ascent",
// "image/jpeg", "Jett") → mevcut log satırları ve aramalar değişmez. Başka tip →
// yalnız tip etiketi (aliveCountForLog emsali).
// YAPRAK MODÜL: hiçbir şey import etmez (route, builder, loader güvenle kullanır).

const UNSAFE_LOG_CHARS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g;

/** Log satırına basılacak kullanıcı kontrollü değerin güvenli gösterimi. */
export function logSafe(v: unknown, max = 64): string {
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "string") {
    const cut = v.length > max ? `${v.slice(0, max)}…(+${v.length - max})` : v;
    return cut.replace(UNSAFE_LOG_CHARS, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  }
  return `<${v === null ? "null" : Array.isArray(v) ? "array" : typeof v}>`;
}
