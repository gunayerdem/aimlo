/**
 * MAÇ RAPORU SKOR SEÇİMİ — A058 backend (B05, 2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * NEDEN AYRI DOSYA: Next route dosyası HTTP metodu + segment config dışında export
 * edemez (next-types-plugin checkFields) → saf fonksiyon lib'de, test edilebilir.
 *
 * KANIT (A058): report/route.ts validateRequest round'ları sondan geriye tarıyor ve
 * İLK 2-parçalı skor dizisinde `break` yapıyordu; sayısallığa bakmıyordu. Masaüstü
 * skor OCR'ı okuyamadığı round'u "?-?" gönderiyor (kaan-runtime.log:480
 * `[DISPATCH:1] round=1 ... score=?-?`). Tek bir okunamayan SON round, önceki
 * gerçek OCR skorlarını maskeleyip raporu 400 "Invalid score values" ile
 * düşürüyordu (desktop kuyruğu bu 400'ü 10 kez deneyip günlük rapor kotasını yakıyor).
 *
 * KURAL (OCR-only, uydurma YOK):
 *  - Round taramasında sayısal olmayan ("?-?") çift ATLANIR, bir öncekine bakılır.
 *    Seçilen skor masaüstünün GERÇEKTEN okuduğu son geçerli skordur — yeni değer
 *    üretilmez.
 *  - Hiç geçerli çift yok ama 2-parçalı geçersiz dizi VARSA → eskisi gibi geçersiz
 *    (400 "Invalid score values"); uydurma 0-0 WIN/LOSS üretilmez.
 *  - Hiç skor alanı yoksa bugünkü 0-0 davranışı AYNEN.
 *  - Üst-seviye `score` (nesne / "13-7" dizesi) yolları AYNEN: geçersizse 400.
 *  - Overtime (15-13, 17-15) geçerli kalır (MAX_SCORE_VALUE, 2026-07-09 fix'i).
 */
import { sanitizePromptInput } from "@/lib/prompt-safety";

// Overtime fix (backend-review 2026-07-09): eski VALID_SCORES seti 14'te
// bitiyordu → 15-13/17-15 gibi overtime skorları 400 "Invalid score values"
// ile REDDEDİLİYORDU (maç hiç rapora dönüşmüyor, desktop kuyruğu takılıyordu).
// Sayısal aralık kontrolü: 0-40 (OT teorik üst sınırının çok üstünde tampon).
export const MAX_SCORE_VALUE = 40;
export function isValidScoreValue(s: string): boolean {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= MAX_SCORE_VALUE;
}

/**
 * Sanitize a user-controlled string before placing it in a prompt.
 * Wraps the shared prompt-safety helper which strips closing tags,
 * control chars, bidi/zero-width unicode, role prefixes, and sentinel
 * markers in addition to the length cap. The .trim() on the legacy version
 * is unnecessary because the helper handles whitespace.
 */
export function sanitizeReportInput(s: unknown, maxLen: number): string {
  return sanitizePromptInput(s, { max: maxLen, collapseWhitespace: true });
}

export type PickedReportScore =
  | {
      ok: true;
      yours: string;
      enemy: string;
      /** Round taramasında atlanan sayısal-olmayan SON çift sayısı (log/ölçüm için). */
      skippedInvalid: number;
    }
  | { ok: false };

/**
 * score — support all 3 shapes:
 *   1. { score: { yours: "13", enemy: "7" } }    — web nested shape
 *   2. { score: "13-7" }                          — web string convenience
 *   3. (no top-level score, but rounds[] present) — desktop A2 flat shape
 *      ships per-round score in the round entries but omits a match-level
 *      score field; we pull "yours-enemy" from the last round entry that
 *      has a NUMERIC "X-Y" score string (A058: "?-?" is skipped).
 */
export function pickReportScore(rounds: unknown, score: unknown): PickedReportScore {
  let yours = "0";
  let enemy = "0";
  let skippedInvalid = 0;
  if (score && typeof score === "object") {
    const scoreObj = score as Record<string, unknown>;
    yours = sanitizeReportInput(scoreObj.yours, 3);
    enemy = sanitizeReportInput(scoreObj.enemy, 3);
  } else if (typeof score === "string") {
    const parts = score.split("-").map((s: string) => s.trim());
    if (parts.length === 2) {
      yours = sanitizeReportInput(parts[0], 3);
      enemy = sanitizeReportInput(parts[1], 3);
    }
  } else if (Array.isArray(rounds)) {
    // Walk rounds from the end — last round with a VALID "X-Y" score wins.
    const rs = rounds as unknown[];
    let sawPair = false;
    let found = false;
    for (let i = rs.length - 1; i >= 0; i--) {
      const r = rs[i];
      if (r && typeof r === "object") {
        const rScore = (r as Record<string, unknown>).score;
        if (typeof rScore === "string") {
          const parts = rScore.split("-").map((s) => s.trim());
          if (parts.length === 2) {
            sawPair = true;
            const y = sanitizeReportInput(parts[0], 3);
            const e = sanitizeReportInput(parts[1], 3);
            if (isValidScoreValue(y) && isValidScoreValue(e)) {
              yours = y;
              enemy = e;
              found = true;
              break;
            }
            skippedInvalid++;
          }
        }
      }
    }
    // 2-parçalı dizi vardı ama HİÇBİRİ sayısal değil → eskisi gibi geçersiz.
    if (sawPair && !found) return { ok: false };
  }
  if (!isValidScoreValue(yours) || !isValidScoreValue(enemy)) {
    return { ok: false };
  }
  return { ok: true, yours, enemy, skippedInvalid };
}
