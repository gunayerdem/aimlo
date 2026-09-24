/**
 * MAÇ SONUCU + TARAF DEĞİŞİMİ — TEK KAYNAK (FB01 · F03/F13, 2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * KANIT (F03): maç sonucu dört ayrı yerde `yours > enemy ? WIN : LOSS` diye türetiliyordu
 * (report-prompt.ts deterministik şablon + engine girdisi + "Score:" satırı, route.ts
 * player_memory). Maçın BİTİP BİTMEDİĞİNE hiç bakılmıyordu: aimlo-runtime 01.txt:5548
 * elle bitirilen 12 round'luk rekabetçi maç (defter 9-4'te donmuş) → :5567 "Maçı 9-4
 * kazandın"; LOG.txt:4502 9 round'luk maç → :4538 "Maçı 4-5 kaybettin". Beraberlik de
 * LOSS sayılıyordu. Sonuç analyses.raw_result_json.won'a ve player_memory WR'sine
 * kalıcı yazılıyordu.
 *
 * SÖZLEŞME (FD01 ile ORTAK — masaüstü additive gönderir, alan yoksa v1.0.19 davranışı):
 *   matchComplete : boolean  — maç gerçekten bitti mi (bitiş ekranı ya da terminal skor)
 *   endReason     : MATCH_END_REASONS'tan biri — finalize'ı ne tetikledi
 *   rounds[].side : "attack" | "defense" (masaüstü "attacking"/"defending" de yollayabilir;
 *                   normalizeSide kanonikleştirir)
 * ⚠ Aşağıdaki sabit listeler aimlo-desktop'taki (FD01) Rust listesiyle AYNI YAZIMLA
 * tutulur; birini değiştiren ikisini birden değiştirir.
 */

/** finalize nedeni — masaüstü FD01 `endReason` değerleri (aynı yazım, aynı sıra). */
export const MATCH_END_REASONS = [
  "end_screen",
  "manual",
  "lobby",
  "progression",
  "valorant_exit",
  "new_match",
] as const;
export type MatchEndReason = (typeof MATCH_END_REASONS)[number];

export function parseMatchEndReason(raw: unknown): MatchEndReason | undefined {
  if (typeof raw !== "string") return undefined;
  const s = raw.trim().toLowerCase();
  return (MATCH_END_REASONS as readonly string[]).includes(s) ? (s as MatchEndReason) : undefined;
}

/**
 * Maç-bitiş eşiği (kazanan tarafın alması gereken round). aimlo-desktop
 * src-tauri/src/lib.rs:7505 `match_end_threshold` ile AYNI TABLO (spike_rush 4,
 * swiftplay 5, diğer 13). Masaüstü tanınmayan modu 13'e düşürür; backend ise
 * tanınmayan/boş modda sonuç ÇIKARIMI yapmaz (geri uyum: bugünkü yours>enemy kuralı).
 * Premier masaüstünde "competitive" token'ıyla gelir (A012); yine de tabloda.
 */
const MATCH_END_THRESHOLD: Readonly<Record<string, number>> = {
  spike_rush: 4,
  swiftplay: 5,
  competitive: 13,
  unrated: 13,
  premier: 13,
};

/**
 * 12-12'den sonra 2 fark kuralıyla uzayan modlar (desktop valorant_score_shape_plausible).
 * FB01 inceleme: DERECESİZ (unrated) bu kümede DEĞİL — 12-12'de tek round'luk "Endgame"
 * (sudden death) oynanır, 13-12 geçerli bir FİNAL skordur (Valorant: Unrated modu; uzatma
 * yok). Eskiden isTerminalScore(13,12,"unrated") false → eski istemcide ve bitiş ekranını
 * okuyamayan FD01 istemcisinde maç UNFINISHED görünüyordu. Rekabetçi/premier kuralı AYNEN.
 * ⚠ Masaüstü terminal_score (lib.rs) aynı tabloyu kullanıyor — orada da düzeltilmeli.
 */
const WIN_BY_TWO_MODES: ReadonlySet<string> = new Set(["competitive", "premier"]);

/**
 * Devre arası taraf değişimi — bu round TAMAMLANINCA taraf değişir. aimlo-desktop
 * src-tauri/src/detection.rs `is_side_swap_probe_round` / `expected_swap_count` ile
 * AYNI swap noktaları (spike_rush R3, swiftplay R4, rekabetçi/derecesiz R12).
 */
const HALF_SWAP_AFTER_ROUND: Readonly<Record<string, number>> = {
  spike_rush: 3,
  swiftplay: 4,
  competitive: 12,
  unrated: 12,
  premier: 12,
};

/** "Spike Rush" / "spike_rush" / " Competitive " → "spike_rush" / "competitive"; boş → "". */
export function normalizeModeToken(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/**
 * Skor maç SONU olabilir mi? null = mod tanınmıyor (karar verilemez).
 * Rekabetçi/premier: max ≥ 13 VE (min ≤ 11 YA DA fark ≥ 2) — 13-11 biter,
 * 13-12 / 12-12 / 14-13 uzatma ortasıdır. Derecesiz: max ≥ 13 (12-12 → tek round sudden
 * death, 13-12 biter). Swiftplay/spike rush: max ≥ eşik.
 */
export function isTerminalScore(yours: number, enemy: number, mode: unknown): boolean | null {
  const m = normalizeModeToken(mode);
  const threshold = MATCH_END_THRESHOLD[m];
  if (threshold === undefined) return null;
  if (!Number.isFinite(yours) || !Number.isFinite(enemy)) return false;
  const max = Math.max(yours, enemy);
  const min = Math.min(yours, enemy);
  if (max < threshold) return false;
  if (!WIN_BY_TWO_MODES.has(m)) return true;
  return min <= threshold - 2 || max - min >= 2;
}

export type MatchOutcomeLabel = "WIN" | "LOSS" | "DRAW" | "UNFINISHED";
export type MatchOutcome = { won: boolean | null; label: MatchOutcomeLabel };

/**
 * Maç sonucu — route, deterministik şablon, prompt ve player_memory'nin TEK kaynağı.
 *  - matchComplete === false → UNFINISHED (won=null): maç bitmedi, sonuç YOK.
 *  - matchComplete === true  → skor: eşit → DRAW (won=null), aksi WIN/LOSS.
 *  - matchComplete yok (v1.0.19 ve öncesi): mod tanınıyorsa ve skor terminal değilse
 *    → UNFINISHED; mod bilinmiyorsa bugünkü yours>enemy kuralı (eşitlik artık DRAW).
 * won=null "bilinmiyor" demektir: hiçbir tüketici onu galibiyet/mağlubiyet saymaz.
 */
export function deriveMatchOutcome(input: {
  yours: number | string;
  enemy: number | string;
  matchComplete?: boolean;
  mode?: unknown;
}): MatchOutcome {
  const y = Number(input.yours);
  const e = Number(input.enemy);
  if (input.matchComplete === false) return { won: null, label: "UNFINISHED" };
  if (input.matchComplete !== true && isTerminalScore(y, e, input.mode) === false) {
    return { won: null, label: "UNFINISHED" };
  }
  if (y === e) return { won: null, label: "DRAW" };
  return y > e ? { won: true, label: "WIN" } : { won: false, label: "LOSS" };
}

/**
 * Oynanan round sayısına göre devre arası geçildi mi? null = mod tanınmıyor.
 * `played` = çağıranın ölçtüğü en büyük oynanan-round sayısı (round dizisi uzunluğu,
 * en büyük round numarası, skor toplamı — hangisi büyükse).
 */
export function crossedHalfSwap(played: number, mode: unknown): boolean | null {
  const swapAfter = HALF_SWAP_AFTER_ROUND[normalizeModeToken(mode)];
  if (swapAfter === undefined) return null;
  return played > swapAfter;
}

/**
 * FB01 inceleme · F03 (web tüketicisi, 2026-09-24): kayıttaki (analyses.raw_result_json.won)
 * maç sonucu. Yalnız GERÇEK boolean sonuçtur; null (UNFINISHED/DRAW — masaüstü
 * persistOnServer satırları) ve eksik/bozuk değer "bilinmiyor" (null) döner.
 * KANIT: app/LandingClient.tsx rowToReport `won: (json.won as boolean) ?? false` null'ı
 * false'a çökertiyordu → web geçmişi/panosu sonucu bilinmeyen her masaüstü maçını
 * "Yenilgi" gösterip WR paydasına kayıp olarak katıyordu. Masaüstü FD01 (29d687a)
 * parseMatchWon ile aynı üç durum.
 */
export function parseStoredWon(raw: unknown): boolean | null {
  return typeof raw === "boolean" ? raw : null;
}

/**
 * Sonucu BİLİNEN maçlardan kazanma oranı — null sonuç paydaya GİRMEZ.
 * pct: sonucu bilinen maç yoksa null (UI "—" basar; %0 iddiası yok).
 */
export function decidedWinRate(matches: readonly { won: boolean | null }[]): {
  wins: number;
  losses: number;
  decided: number;
  pct: number | null;
} {
  let wins = 0;
  let losses = 0;
  for (const m of matches) {
    if (m.won === true) wins++;
    else if (m.won === false) losses++;
  }
  const decided = wins + losses;
  return { wins, losses, decided, pct: decided > 0 ? Math.round((wins / decided) * 100) : null };
}
