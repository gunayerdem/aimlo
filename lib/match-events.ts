// Live match-event logger — server-only. One row per death (vision call) so the
// admin /live feed can show matches as they happen. NON-BLOCKING + FAIL-SAFE:
// never delays/breaks the AI response. Piggybacks data the vision route already
// has → zero extra AI cost. Service-role (match_events has no anon/auth policy).
import "server-only";

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

export function saveMatchEvent(input: MatchEventInput): void {
  Promise.resolve()
    .then(async () => {
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
    })
    .catch((e) => console.error("[match-events] saveMatchEvent error:", (e as Error).message));
}
