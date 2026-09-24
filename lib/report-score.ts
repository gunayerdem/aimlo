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
 *  - ATLAMA YALNIZ GEÇ TESLİM EDİLEN ERKEN round için geçerlidir (B05 inceleme,
 *    2026-09-24): atlanan HER çiftin round numarası, seçilen geçerli round'un
 *    numarasından KESİN KÜÇÜK olmalı. Seçilenden SONRAKİ (ya da numarası eşit /
 *    okunamayan) bir round'un skoru okunamadıysa seçilen skor maçın SONU değil,
 *    maç ortasından bayat bir ara skordur: rapor onu "final" ilan eder, matchWon
 *    ondan türetilip analyses.raw_result_json.won + player_memory'ye yazılır
 *    (ölçülen: Swiftplay R8 "4 - 4" + R9 "?-?" result "won" → "Score: 4-4 (LOSS)",
 *    "Skoru 4 - 4 geride kapattın"). O şekil B05 öncesi gibi GEÇERSİZ (400).
 *    Numara okuma sırası validateRequest ile aynı: roundNumber (web) → round (desktop).
 *  - FB01 · F90 (2026-09-24): okunamayan çift dizinin SON elemanıysa numaraya HİÇ
 *    bakılmadan geçersiz (late_unreadable) — masaüstü sayacı OCR resync'iyle geri
 *    sarılabildiği için (gunay-runtime.log:7159 → :7310 round=2) numarası küçük görünen
 *    son round "geç teslim edilen erken round" sayılamaz. Numara kuralı yalnız ORTADAKİ
 *    (son eleman olmayan) atlanan çift için geçerli.
 *  - FB01 inceleme · F90 (2026-09-24): late_unreadable'da bulunan son GEÇERLİ skor
 *    lastValid'de döner. İstemci AÇIKÇA matchComplete:false dediyse (FD01 masaüstü
 *    çapa-sonrası sıfırlamada '?-?'yi bilerek doldurmaz ve bunu gönderir) validateRequest
 *    o skoru "kayıttaki son skor" olarak kabul eder — sonuç UNFINISHED (won=null) olduğu
 *    için bayat skor final İLAN EDİLMEZ, rapor da 400'le kaybolmaz. matchComplete yok
 *    (v1.0.19) ya da true → 400 AYNEN.
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
// B05 inceleme (2026-09-24): eski `Number(s)` kontrolü "" (→0), "1e1" (→10),
// "0x1" (→1), "3.0" (→3) değerlerini GEÇERLİ sayıyordu → " - " çifti taramayı
// durdurup "Skor:  - " basıyor, "1e1-2" prompt'a "Skor: 1e1 - 2" olarak gidiyordu.
// Yalnız 1-2 haneli ASCII ondalık rakam dizisi (masaüstü "{l} - {r}" biçimi).
const SCORE_DIGITS = /^\d{1,2}$/;
export function isValidScoreValue(s: string): boolean {
  return SCORE_DIGITS.test(s) && Number(s) <= MAX_SCORE_VALUE;
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
  | {
      ok: false;
      /** "late_unreadable": seçilen geçerli skordan SONRAKİ (ya da numarasız) bir
       *  round'un skoru okunamadı → bayat ara skor final ilan edilmez (log için). */
      reason?: "late_unreadable";
      /** late_unreadable'da taramanın bulduğu son GEÇERLİ skor (OCR'ın gerçekten okuduğu).
       *  Final DEĞİLDİR; validateRequest yalnız istemci matchComplete:false dediğinde onu
       *  "kayıttaki son skor" olarak (sonuç UNFINISHED) kullanır (FB01 inceleme · F90). */
      lastValid?: { yours: string; enemy: string };
    };

/** Round numarası — validateRequest ile AYNI okuma sırası (roundNumber → round). */
function roundNumberOf(r: Record<string, unknown>): number | null {
  const n = typeof r.roundNumber === "number" ? r.roundNumber
    : typeof r.round === "number" ? r.round : null;
  return n !== null && Number.isFinite(n) ? n : null;
}

/**
 * score — support all 3 shapes:
 *   1. { score: { yours: "13", enemy: "7" } }    — web nested shape
 *   2. { score: "13-7" }                          — web string convenience
 *   3. (no top-level score, but rounds[] present) — desktop A2 flat shape
 *      ships per-round score in the round entries but omits a match-level
 *      score field; we pull "yours-enemy" from the last round entry that
 *      has a NUMERIC "X-Y" score string (A058: "?-?" is skipped — ONLY when
 *      it is NOT the array's last element (F90) and every skipped round is
 *      numbered strictly BELOW the selected one).
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
    let selectedNum: number | null = null;
    const skippedNums: (number | null)[] = [];
    // FB01 · F90: atlanan okunamayan çift dizinin SON elemanı mı (teslim sırasında en son)?
    let lastElementSkipped = false;
    for (let i = rs.length - 1; i >= 0; i--) {
      const r = rs[i];
      if (r && typeof r === "object") {
        const rec = r as Record<string, unknown>;
        const rScore = rec.score;
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
              selectedNum = roundNumberOf(rec);
              break;
            }
            skippedInvalid++;
            skippedNums.push(roundNumberOf(rec));
            if (i === rs.length - 1) lastElementSkipped = true;
          }
        }
      }
    }
    // 2-parçalı dizi vardı ama HİÇBİRİ sayısal değil → eskisi gibi geçersiz.
    if (sawPair && !found) return { ok: false };
    // FB01 · F90 (2026-09-24): dizinin SON elemanı okunamayan bir çiftse (sondan ilk
    // atlanan) round numarasına HİÇ bakılmaz → late_unreadable (9355dec / B05 öncesi
    // davranış). KANIT: masaüstü sayacı OCR resync'iyle geri sarılabiliyor
    // (gunay-runtime.log:7159 'round2c' → sayaç 19→1, :7310 round=2, :8061 round=22);
    // numarası sıfırlanmış son round {round:1,'?-?'} "geç teslim edilen erken round"
    // sanılıp R19'un '3 - 12' ara skoru final ilan ediliyordu. Dizi sırası = masaüstü
    // MATCH_ROUNDS ekleme (teslim) sırası; SON eleman maçın en son teslim edilen round'u.
    // FB01 inceleme · F90: "D09+ masaüstü bu dala girmez" iddiası YANLIŞTI — FD01
    // (aimlo-desktop ad311c5) reset_after_anchor çapadan sonra tam sıfırlama olduysa
    // (UNCONFIRM backstop / oyun kapanışı) sondaki '?-?'yi bilerek doldurmuyor ve
    // matchComplete:false gönderiyor. Bu dal o gövdede de çalışır; son geçerli skor
    // lastValid'de döner, final ilan edilip edilmeyeceğine validateRequest karar verir.
    if (lastElementSkipped) {
      return { ok: false, reason: "late_unreadable", lastValid: { yours, enemy } };
    }
    // B05 inceleme: ORTADAKİ (son eleman olmayan) atlanan okunamayan round'un numarası
    // seçilenden büyük/eşitse (ya da numarasızsa) → seçilen skor maç sonu değil, bayat
    // ara skor → 400. Numarası seçilenden KÜÇÜK olan orta eleman (sonradan teslim
    // edilmiş erken round) atlanmaya devam eder.
    if (
      skippedNums.length > 0 &&
      (selectedNum === null || skippedNums.some((n) => n === null || n >= selectedNum!))
    ) {
      return { ok: false, reason: "late_unreadable", lastValid: { yours, enemy } };
    }
  }
  if (!isValidScoreValue(yours) || !isValidScoreValue(enemy)) {
    return { ok: false };
  }
  return { ok: true, yours, enemy, skippedInvalid };
}
