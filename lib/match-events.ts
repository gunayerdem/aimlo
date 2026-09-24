// Live match-event logger — server-only. One row per death (vision call) so the
// admin /live feed can show matches as they happen. NON-BLOCKING + FAIL-SAFE:
// never delays/breaks the AI response. Piggybacks data the vision route already
// has → zero extra AI cost. Service-role (match_events has no anon/auth policy).
import "server-only";

import { after } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export type MatchEventInput = {
  userId?: string | null;
  matchId?: string | null;
  kind?: "death" | "match_end";
  map?: string | null;
  agent?: string | null;
  side?: string | null;
  roundNo?: number | null;
  score?: string | null;
  deathLoc?: string | null;
  result?: string | null;
  feedback?: Record<string, unknown> | null;
};

/* ── METİN ALANI KAPAKLARI (FB03 · F55, 2026-09-24) ────────────────────────────
 * KANIT: vision route deathLoc'u HAM gövdeden veriyordu ve bu dosya insert'ten önce
 * hiçbir alanı kırpmıyordu (0008_match_events.sql: düz `text`, CHECK yok) → 1.000.000
 * karakterlik deathLocation status 200 ile match_events.death_loc'a aynen yazıldı
 * (scratchpad rba/bigfield.ts). admin /live son 60 satırı 8 sn'de bir çekiyor (DoS +
 * DB/egress şişmesi). Asıl düzeltme route'ta (temizlenmiş değer); bu kapı ikinci katman:
 * hangi çağıran gelirse gelsin satır sınırlı. Kapaklar gerçek değerlerin kat kat üstünde
 * (5 runtime logunda en uzun: map 6, agent 9, side 9, score 6, result 7, deathLocation 14
 * kr) → meşru satır BAYT-AYNI. Dize olmayan metin alanı (tip-karışık gövde) null yazılır;
 * round_no yalnız sonlu tam sayı. CHECK migration'ı YAPILMADI (prod şeması — ayrı karar). */
export const MATCH_EVENT_TEXT_CAPS = {
  map: 40, agent: 40, side: 20, score: 12, death_loc: 100, result: 16,
} as const;

const capText = (v: unknown, max: number): string | null =>
  typeof v === "string" ? v.slice(0, max) : null;

/** match_events satırı (insert gövdesi) — SAF; kapaklar burada (test edilebilir). */
export function buildMatchEventRow(input: MatchEventInput): Record<string, unknown> {
  const rn = input.roundNo;
  return {
    user_id: input.userId ?? null,
    match_id: input.matchId ?? null,
    kind: input.kind ?? "death",
    map: capText(input.map, MATCH_EVENT_TEXT_CAPS.map),
    agent: capText(input.agent, MATCH_EVENT_TEXT_CAPS.agent),
    side: capText(input.side, MATCH_EVENT_TEXT_CAPS.side),
    round_no: typeof rn === "number" && Number.isInteger(rn) ? rn : null,
    score: capText(input.score, MATCH_EVENT_TEXT_CAPS.score),
    death_loc: capText(input.deathLoc, MATCH_EVENT_TEXT_CAPS.death_loc),
    result: capText(input.result, MATCH_EVENT_TEXT_CAPS.result),
    feedback: input.feedback ?? null,
  };
}

/**
 * B67 (2026-07-31): mikrotask fire-and-forget → `after()`. Vercel yanıt
 * gönderilir gönderilmez lambda'yı dondurduğu için mikrotask'a atılmış insert
 * tamamlanmadan kaybolabiliyordu — /admin/live feed'i sessizce eksik kalıyordu.
 * Next 16 `after()` işi yanıttan SONRA, route'un maxDuration bütçesi içinde
 * koşturur. İmza ve çağıranlar DEĞİŞMEDİ; hâlâ bloklamaz, hâlâ patlamaz.
 */
export function saveMatchEvent(input: MatchEventInput): void {
  const work = async () => {
    try {
      const svc = createServiceSupabase();
      const { error } = await svc.from("match_events").insert(buildMatchEventRow(input));
      if (error) console.error("[match-events] insert failed:", error.message);
    } catch (e) {
      console.error("[match-events] saveMatchEvent error:", (e as Error).message);
    }
  };

  try {
    after(work);
  } catch {
    // İstek bağlamı dışında (script/test) after() fırlatır — eski mikrotask yolu.
    void work();
  }
}
