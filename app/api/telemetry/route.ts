import { createHash } from "node:crypto";
import { NextRequest, NextResponse, after } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { createServiceSupabase } from "@/lib/supabase/server";
import {
  validateTelemetryEvent,
  isValidAppVersion,
  TELEMETRY_LIMITS,
  type TelemetryEvent,
  type TelemetryRejection,
  type TelemetryResponse,
} from "@/lib/telemetry-types";

/**
 * POST /api/telemetry
 *
 * Aggregated event reporter for the desktop overlay. Accepts a batch of
 * structured events (no PII), validates each independently, logs a
 * structured console line, and — B5 (2026-07-31) — persists the accepted
 * events into `public.telemetry_events` (supabase/0015_telemetry_events.sql)
 * so the data survives Vercel's short-lived logs. Sentry / PostHog can still
 * hook in later — the wire contract here stays stable.
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
 *   - appVersion (B80, opsiyonel: event ya da batch zarfı) 64 char'da doğrulanır,
 *     DB kolonu 32 olduğu için yazarken kırpılır
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

// supabase/0015_telemetry_events.sql — app_version CHECK sınırı. Doğrulama
// 64 char'a izin veriyor (code/route ile aynı), DB kolonu 32; INSERT'in
// constraint'e takılıp TÜM batch'i düşürmemesi için burada kırpıyoruz.
const APP_VERSION_DB_MAX = 32;

function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

/**
 * B5 + B67 + B80 (2026-07-31) — telemetriyi KALICI yaz.
 *
 * NEDEN (B5): route şimdiye kadar yalnız `console.log` atıyordu; Vercel
 * logları kısa ömürlü olduğu için error_code_count / ai_call_duration /
 * match_completed verisi pratikte ölüyordu — launch haftasında "hata oranı
 * arttı mı, gecikme kötüleşti mi" sorusu cevapsızdı. `saveAiUsage` kalıbı
 * (lib/ai-usage.ts): service-role client, hata YUTULUR, istek asla bloklanmaz.
 *
 * NEDEN after() (B67): mikrotask'a atılan fire-and-forget insert, Vercel
 * yanıtı gönderir göndermez lambda'yı dondurduğu için tamamlanmadan
 * kaybolabiliyor. Next 16 `after()` işi yanıttan SONRA, route'un maxDuration
 * bütçesi içinde koşturur. İstek bağlamı olmayan bir çağrıda (script/test)
 * after() fırlatabilir → eski mikrotask yoluna düşülür.
 *
 * NEDEN app_version (B80): auto-updater canlı; sürüm alanı olmadan hata
 * artışı bir sürüme bağlanamıyor. Event-seviyesi öncelikli, yoksa batch zarfı.
 *
 * GİZLİLİK (B127): kullanıcı kimliği yalnız `user_hash` = sha256(user.id)
 * ilk 16 hex olarak yazılır — ham user_id tabloya ASLA girmez.
 */
function persistTelemetryEvents(
  userIdHash: string,
  events: TelemetryEvent[],
  batchAppVersion: string | null,
): void {
  const rows = events.map((e) => {
    const version = e.appVersion ?? batchAppVersion;
    return {
      user_hash: userIdHash,
      type: e.type,
      value: typeof e.value === "number" ? e.value : null,
      count: typeof e.count === "number" ? Math.round(e.count) : null,
      code: e.code ?? null,
      route: e.route ?? null,
      round: typeof e.round === "number" ? Math.round(e.round) : null,
      app_version: version ? version.slice(0, APP_VERSION_DB_MAX) : null,
      // Olayın CİHAZDA oluştuğu an; created_at sunucu-tarafı default kalır.
      // ts doğrulamadan geçti (sonlu + ±30 gün) → Date güvenli.
      event_ts: new Date(e.ts).toISOString(),
    };
  });

  const work = async () => {
    try {
      const svc = createServiceSupabase();
      const { error } = await svc.from("telemetry_events").insert(rows);
      if (error) console.error("[telemetry] insert failed:", error.message);
    } catch (err) {
      console.error("[telemetry] persist error:", (err as Error).message);
    }
  };

  try {
    after(work);
  } catch {
    // İstek bağlamı yok (after() yalnız request scope'unda çalışır) —
    // eski davranışa düş: mikrotask, yine bloklamadan.
    void work();
  }
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

  // B80 (2026-07-31): batch-zarfı sürümü — event'inde `appVersion` olmayan
  // her olay bunu devralır. Geçersizse sessizce yok sayılır (batch reddedilmez).
  const rawBatchVersion = (body as { appVersion?: unknown }).appVersion;
  const batchAppVersion = isValidAppVersion(rawBatchVersion) ? rawBatchVersion : null;

  // Forward accepted events to the logging sink. Format: one batch-level
  // structured line per request. The field names (`userIdHash`, `count`,
  // `rejected`, `types`, `ts`) are the contract the post-launch dashboard
  // will grep against — keep them stable.
  //
  // B135 (2026-07-31): `bucket: accepted[0]?.type` YANILTICIYDI — desktop
  // batch'leri her zaman karışık tip taşır (drain sıralı) ve ilk eleman
  // neredeyse hep en sık tip (ocr_frame_budget_ms) olduğu için log-tabanlı
  // hızlı analiz yanlış yönlendiriyordu. Yerine tip-başına gerçek sayım.
  //
  // Per-event detail follows on a second line so individual values are
  // still recoverable from logs without bloating the primary index line.
  const typeCounts: Record<string, number> = {};
  for (const e of accepted) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;

  console.log(
    "[TELEMETRY]",
    JSON.stringify({
      userIdHash,
      count: accepted.length,
      rejected: rejected.length,
      types: typeCounts,
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

    // B5 (2026-07-31): log'un YANINA kalıcı yazım — console satırları duruyor
    // (canlı tail için), veri artık telemetry_events'te de kalıyor.
    // Bloklamaz, patlamaz: after() + iç try/catch (yukarıdaki gerekçe).
    persistTelemetryEvents(userIdHash, accepted, batchAppVersion);
  }

  const response: TelemetryResponse = {
    ok: true,
    accepted: accepted.length,
    ...(rejected.length > 0 ? { rejected } : {}),
  };
  return NextResponse.json(response, { status: 200 });
}
