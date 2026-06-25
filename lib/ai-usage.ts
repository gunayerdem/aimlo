// AI usage logger — server-only. Persists one row per OpenAI call to
// public.ai_usage so the admin /cost panel can show real spend over time.
// Call it right where each AI route already parses the usage object.
//
// NON-BLOCKING + FAIL-SAFE: this must NEVER delay or break an AI response.
// Callers should NOT await it (fire-and-forget) — and it swallows every error
// internally as a final guard. Uses the service-role client (ai_usage has no
// anon/authenticated RLS policy).
import "server-only";

import { createServiceSupabase } from "@/lib/supabase/server";

export type SaveUsageInput = {
  userId: string | null | undefined;
  routeType: "vision" | "report" | "feedback" | "insight";
  model?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  cachedTokens?: number | null;
};

/**
 * Fire-and-forget insert of a usage row. Returns immediately; the write happens
 * in the background and any failure is logged, never thrown. Do not `await` in a
 * hot path — call `void saveAiUsage(...)`.
 */
export function saveAiUsage(input: SaveUsageInput): void {
  // Defer to a microtask so even the client construction can't block the caller.
  Promise.resolve()
    .then(async () => {
      const svc = createServiceSupabase();
      const { error } = await svc.from("ai_usage").insert({
        user_id: input.userId ?? null,
        route_type: input.routeType,
        model: input.model ?? null,
        prompt_tokens: Math.max(0, Math.round(input.promptTokens ?? 0)),
        completion_tokens: Math.max(0, Math.round(input.completionTokens ?? 0)),
        cached_tokens: Math.max(0, Math.round(input.cachedTokens ?? 0)),
      });
      if (error) console.error("[ai-usage] insert failed:", error.message);
    })
    .catch((e) => console.error("[ai-usage] saveAiUsage error:", (e as Error).message));
}
