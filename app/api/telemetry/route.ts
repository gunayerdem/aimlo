import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import {
  validateTelemetryEvent,
  TELEMETRY_LIMITS,
  type TelemetryEvent,
  type TelemetryRejection,
  type TelemetryResponse,
} from "@/lib/telemetry-types";

/**
 * POST /api/telemetry
 *
 * Aggregated event reporter for the desktop overlay. Accepts a batch of
 * structured events (no PII), validates each independently, and emits a
 * single console.log line per accepted event for now. Sentry / PostHog /
 * a dedicated analytics warehouse can hook in later — the contract here
 * stays stable.
 *
 * Privacy:
 *   - User identity is reduced to `sha256(user.id).slice(0,16)` before any
 *     logging or forwarding. The raw Supabase user_id never lands in stdout.
 *   - The route rejects any payload that doesn't match the strict schema
 *     in lib/telemetry-types — no free-form `metadata` field, no string
 *     blobs, no IP, no user agent, no email/username.
 *
 * Limits:
 *   - 100 events per batch (413 if exceeded)
 *   - 60/min, 1000/day per user (rate-limited via verifyAuthAndRateLimit)
 *   - ts must be within ±30d of server time
 *   - value caps at 10 minutes (anti-overflow)
 *   - code/route strings capped at 64 chars
 *
 * Partial-success semantics:
 *   - One bad event in a batch does NOT reject the whole batch.
 *   - Response always 200 with `{ ok: true, accepted: N, rejected: [...] }`.
 *   - Only structural errors (no `events` array, payload too large, auth)
 *     get a non-200 status.
 */

// Tight Vercel timeout — telemetry is fire-and-forget, must not eat budget.
export const maxDuration = 10;

const MAX_PAYLOAD_BYTES = 200_000; // 200KB — 100 events × ~2KB each, plenty of headroom.

function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Reject oversize payloads before parsing JSON.
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const auth = await verifyAuthAndRateLimit(request, "telemetry");
  if (!auth.ok) return auth.response;

  // Parse body. Malformed JSON → 400.
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const events = (body as { events?: unknown }).events;
  if (!Array.isArray(events)) {
    return NextResponse.json({ error: "events_array_required" }, { status: 400 });
  }
  if (events.length === 0) {
    // Empty batch is technically valid — accept silently.
    const empty: TelemetryResponse = { ok: true, accepted: 0 };
    return NextResponse.json(empty, { status: 200 });
  }
  if (events.length > TELEMETRY_LIMITS.maxEventsPerBatch) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const userIdHash = hashUserId(auth.userId);
  const serverNowMs = Date.now();

  const accepted: TelemetryEvent[] = [];
  const rejected: TelemetryRejection[] = [];

  for (let i = 0; i < events.length; i++) {
    const reason = validateTelemetryEvent(events[i], serverNowMs);
    if (reason !== null) {
      rejected.push({ idx: i, reason });
      continue;
    }
    accepted.push(events[i] as TelemetryEvent);
  }

  // Forward accepted events to the logging sink. Format: one batch-level
  // structured line per request. The field names (`userIdHash`, `count`,
  // `rejected`, `bucket`, `ts`) are the contract the post-launch dashboard
  // will grep against — keep them stable.
  //
  // Per-event detail follows on a second line so individual values are
  // still recoverable from logs without bloating the primary index line.
  console.log(
    "[TELEMETRY]",
    JSON.stringify({
      userIdHash,
      count: accepted.length,
      rejected: rejected.length,
      bucket: accepted[0]?.type ?? "mixed",
      ts: serverNowMs,
    }),
  );
  if (accepted.length > 0) {
    console.log(
      "[TELEMETRY_EVENTS]",
      JSON.stringify({
        userIdHash,
        events: accepted.map((e) => ({
          type: e.type,
          ts: e.ts,
          value: e.value,
          count: e.count,
          code: e.code,
          route: e.route,
          round: e.round,
        })),
      }),
    );
  }

  const response: TelemetryResponse = {
    ok: true,
    accepted: accepted.length,
    ...(rejected.length > 0 ? { rejected } : {}),
  };
  return NextResponse.json(response, { status: 200 });
}
