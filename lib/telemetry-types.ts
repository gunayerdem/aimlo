/**
 * Shared telemetry types — desktop client and `/api/telemetry` route both
 * import from here so the wire contract stays in one place.
 *
 * Privacy stance: the route never persists raw `userId`. It hashes (sha256
 * → first 16 hex chars) before any logging or downstream forwarding. PII
 * (email, username, IP) is never accepted here — only durations, counts,
 * and bounded enums.
 */

export type TelemetryEventType =
  /** Wall-clock between round-end detection and feedback delivery to UI. */
  | "round_end_latency_ms"
  /** Single AI route round-trip latency. */
  | "ai_call_duration_ms"
  /** Aggregated count of a specific OverlayError code over the batch window. */
  | "error_code_count"
  /** Per-frame OCR pipeline budget (M23 instrumentation). */
  | "ocr_frame_budget_ms"
  /** Lifecycle counter — match completed end-to-end. */
  | "match_completed";

export interface TelemetryEvent {
  /** Discriminator. */
  type: TelemetryEventType;
  /** Unix epoch ms. Must be within ±30 days of server time. */
  ts: number;
  /** Numeric measurement for `*_ms` types. Required there, ignored otherwise. */
  value?: number;
  /** Bucket count for `error_code_count` (≥1). */
  count?: number;
  /** Error code (matches OverlayError discriminants). */
  code?: string;
  /** Route name for `ai_call_duration_ms` — `"vision"` | `"report"` | `"match-report"` | `"feedback"` | `"insight"`. */
  route?: string;
  /** Optional round number context. */
  round?: number;
}

export interface TelemetryRequest {
  events: TelemetryEvent[];
}

export interface TelemetryRejection {
  idx: number;
  reason: string;
}

export interface TelemetryResponse {
  ok: true;
  accepted: number;
  rejected?: TelemetryRejection[];
}

/** Hard caps enforced server-side. */
export const TELEMETRY_LIMITS = {
  /** Maximum events per request. */
  maxEventsPerBatch: 100,
  /** ts must be within this window of server now() — both directions. */
  maxTsDriftMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  /** Maximum value for any *_ms field. Protects against integer overflow + nonsense data. */
  maxValueMs: 10 * 60 * 1000, // 10 minutes
  /** Maximum count value. */
  maxCount: 100_000,
  /** Maximum length of code/route fields (anti-payload-bloat). */
  maxStringLen: 64,
} as const;

const VALID_TYPES: ReadonlySet<TelemetryEventType> = new Set<TelemetryEventType>([
  "round_end_latency_ms",
  "ai_call_duration_ms",
  "error_code_count",
  "ocr_frame_budget_ms",
  "match_completed",
]);

/**
 * Per-event validation. Returns null on success, or a short reason string
 * on rejection. The route handler uses this to populate the `rejected[]`
 * array — partial-success semantics, never reject the whole batch for one
 * bad event.
 */
export function validateTelemetryEvent(
  event: unknown,
  serverNowMs: number,
): string | null {
  if (!event || typeof event !== "object") return "not_an_object";
  const e = event as Record<string, unknown>;

  if (typeof e.type !== "string" || !VALID_TYPES.has(e.type as TelemetryEventType)) {
    return "invalid_type";
  }
  if (typeof e.ts !== "number" || !Number.isFinite(e.ts)) {
    return "invalid_ts";
  }
  const drift = Math.abs(serverNowMs - e.ts);
  if (drift > TELEMETRY_LIMITS.maxTsDriftMs) {
    return "ts_out_of_window";
  }

  if (e.value !== undefined) {
    if (typeof e.value !== "number" || !Number.isFinite(e.value) || e.value < 0) {
      return "value_invalid";
    }
    if (e.value > TELEMETRY_LIMITS.maxValueMs) {
      return "value_too_large";
    }
  }
  if (e.count !== undefined) {
    if (typeof e.count !== "number" || !Number.isFinite(e.count) || e.count < 0) {
      return "count_invalid";
    }
    if (e.count > TELEMETRY_LIMITS.maxCount) {
      return "count_too_large";
    }
  }
  if (e.code !== undefined) {
    if (typeof e.code !== "string" || e.code.length === 0 || e.code.length > TELEMETRY_LIMITS.maxStringLen) {
      return "code_invalid";
    }
  }
  if (e.route !== undefined) {
    if (typeof e.route !== "string" || e.route.length === 0 || e.route.length > TELEMETRY_LIMITS.maxStringLen) {
      return "route_invalid";
    }
  }
  if (e.round !== undefined) {
    if (typeof e.round !== "number" || !Number.isFinite(e.round) || e.round < 0 || e.round > 1000) {
      return "round_invalid";
    }
  }

  // Type-specific shape rules.
  switch (e.type as TelemetryEventType) {
    case "round_end_latency_ms":
    case "ai_call_duration_ms":
    case "ocr_frame_budget_ms":
      if (typeof e.value !== "number") return "value_required";
      break;
    case "error_code_count":
      if (typeof e.code !== "string") return "code_required";
      if (typeof e.count !== "number") return "count_required";
      break;
    case "match_completed":
      // No required value — pure counter event.
      break;
  }

  return null;
}
