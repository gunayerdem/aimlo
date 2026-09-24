/**
 * MAÇ SONUCU — TEK KAYNAK (FB01 · F03, 2026-09-24)
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

/** 12-12'den sonra 2 fark kuralıyla uzayan modlar (desktop valorant_score_shape_plausible). */
const WIN_BY_TWO_MODES: ReadonlySet<string> = new Set(["competitive", "unrated", "premier"]);

/** "Spike Rush" / "spike_rush" / " Competitive " → "spike_rush" / "competitive"; boş → "". */
export function normalizeModeToken(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/**
 * Skor maç SONU olabilir mi? null = mod tanınmıyor (karar verilemez).
 * Rekabetçi/derecesiz/premier: max ≥ 13 VE (min ≤ 11 YA DA fark ≥ 2) — 13-11 biter,
 * 13-12 / 12-12 / 14-13 uzatma ortasıdır. Swiftplay/spike rush: max ≥ eşik.
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

