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
      const { error } = await svc.from("match_events").insert({
        user_id: input.userId ?? null,
        match_id: input.matchId ?? null,
        kind: input.kind ?? "death",
        map: input.map ?? null,
        agent: input.agent ?? null,
        side: input.side ?? null,
        round_no: input.roundNo ?? null,
        score: input.score ?? null,
        death_loc: input.deathLoc ?? null,
        result: input.result ?? null,
        feedback: input.feedback ?? null,
      });
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
