import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Shared API utilities: auth verification + rate limiting.
 *
 * Production: Upstash Redis (REQUIRED in prod) — set UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN. Both per-minute rate windows AND per-day quotas
 * use Redis INCR with TTL — surviving cold starts and parallel lambdas.
 *
 * Dev fallback: in-memory only used when Upstash env vars are unset
 * (local dev convenience). In prod we FAIL CLOSED if Upstash is configured
 * but unreachable, instead of silently degrading to per-lambda memory which
 * would let an attacker bypass quotas by burst-spawning concurrent calls.
 */

// Set to "true" in env to force production strictness even without Upstash configured.
// (Intended for staging.) When unset and Upstash is unavailable, prod still
// fails closed if NODE_ENV === "production".
const STRICT_RATE_LIMIT = process.env.STRICT_RATE_LIMIT === "true";

// ── Rate limiting configuration ──

type RouteKey = "feedback" | "report" | "vision" | "insight" | "telemetry" | "admin" | "default";

const RATE_LIMITS: Record<RouteKey, { window: number; max: number }> = {
  feedback:  { window: 60, max: 15 }, // 15/min
  report:    { window: 60, max: 5 },  // 5/min (more expensive)
  vision:    { window: 60, max: 4 },  // 4/min (vision is $0.015+/call — keep tight)
  insight:   { window: 60, max: 10 }, // 10/min
  telemetry: { window: 60, max: 60 }, // 60/min — generous, telemetry must not eat user's AI quota
  admin:     { window: 60, max: 30 }, // 30/min — owner panel; defense-in-depth vs heavy aggregation abuse
  default:   { window: 60, max: 20 },
};

// Daily quotas. Routes not listed have no daily cap (only per-minute).
const DAILY_QUOTA: Partial<Record<RouteKey, number>> = {
  feedback:  200,
  report:    30,
  vision:    30,  // vision is most expensive — tight daily cap
  insight:   60,
  telemetry: 1000, // generous — desktop batches every 24h, but instrumentation can fire often during a long session
};

// ── Dev allowlist (intensive test sessions bypass quota gates) ──
//
// Env: DEV_USER_ALLOWLIST = comma-separated Supabase user_ids (JWT sub).
// Members bypass per-minute + daily + per-IP rate checks entirely. Use
// ONLY for the team's own test accounts during real-match iteration
// (Spike Rush sessions burn ~30 vision calls in 30 min; the standard
// daily cap blocks debugging the rest of the day).
//
// Production user_ids must NEVER land in this list. Rollback: unset the
// env var in Vercel + redeploy — single flip, no code change required.
//
// Parsed once at module load. To rotate, redeploy (Vercel does this on
// env-var change automatically).
const DEV_USER_ALLOWLIST: ReadonlySet<string> = new Set(
  (process.env.DEV_USER_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0),
);

function isDevUser(userId: string): boolean {
  return DEV_USER_ALLOWLIST.has(userId);
}

// In-memory fallback (dev only — see prod-strictness logic in checkRateLimit).
const memoryStore = new Map<string, { count: number; resetAt: number }>();
const dailyStore  = new Map<string, { count: number; resetAt: number }>();

let lastCleanup = Date.now();

function cleanupStores() {
  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    lastCleanup = now;
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
    for (const [key, entry] of dailyStore) {
      if (now > entry.resetAt) dailyStore.delete(key);
    }
  }
}

function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || STRICT_RATE_LIMIT;
}

// ── Upstash REST helpers (no SDK) ──

interface RateResult { allowed: boolean; remaining: number; degraded?: boolean }

/**
 * INCR + (optional) EXPIRE. Returns count on success, throws on network/HTTP error.
 * Caller must catch and decide policy (fail-closed in prod, fall back in dev).
 */
async function upstashIncr(key: string, ttlSec: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  // Separate AbortControllers — a slow EXPIRE must not abort an in-flight
  // INCR (and vice versa). Earlier shared-controller version had a lockout
  // race: INCR succeeded, EXPIRE aborted on the shared signal, the key lived
  // forever, every subsequent INCR went past the limit, and the user was
  // permanently blocked from every rate-limited route.
  const incrCtrl = new AbortController();
  const incrTid = setTimeout(() => incrCtrl.abort(), 4000);
  let count: number;
  try {
    const incrRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: incrCtrl.signal,
    });
    if (!incrRes.ok) {
      throw new Error(`Upstash INCR HTTP ${incrRes.status}`);
    }
    const incrData = await incrRes.json();
    count = incrData.result as number;
    if (typeof count !== "number") {
      throw new Error(`Upstash INCR returned non-number: ${JSON.stringify(incrData)}`);
    }
  } finally {
    clearTimeout(incrTid);
  }

  // Always re-apply TTL — not just on count===1. If a previous EXPIRE failed
  // and left a TTL-less key, this self-heals the rate-limit on the next call
  // instead of staying poisoned. One extra REST call per request is cheap
  // for a guaranteed bound on lockout.
  const expCtrl = new AbortController();
  const expTid = setTimeout(() => expCtrl.abort(), 3000);
  try {
    const expRes = await fetch(`${url}/expire/${encodeURIComponent(key)}/${ttlSec}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: expCtrl.signal,
    });
    if (!expRes.ok) {
      console.warn(`[Aimlo] Upstash EXPIRE failed for ${key}: HTTP ${expRes.status}`);
    }
  } catch (e) {
    console.warn(`[Aimlo] Upstash EXPIRE error for ${key}:`, (e as Error).message);
  } finally {
    clearTimeout(expTid);
  }

  return count;
}

async function upstashRateCheck(key: string, limit: number, windowSec: number): Promise<RateResult> {
  try {
    const count = await upstashIncr(key, windowSec);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (e) {
    // In production: fail closed.
    if (isProduction()) {
      console.error("[Aimlo] Upstash rate check failed in production — failing closed:", (e as Error).message);
      throw new Error("rate-limiter-unavailable");
    }
    // Dev: log and degrade to memory (with degraded flag for caller awareness).
    console.warn("[Aimlo] Upstash rate check failed (dev) — falling back to memory:", (e as Error).message);
    const r = memoryRateCheck(key, limit, windowSec);
    return { ...r, degraded: true };
  }
}

function memoryRateCheck(key: string, limit: number, windowSec: number): RateResult {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }
  entry.count++;
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

// Daily quota — Upstash-backed in prod with TTL to next-midnight (UTC).
// Uses date-stamped key so the count auto-rolls without explicit reset logic.
async function dailyQuotaCheck(userId: string, route: string, maxDaily: number): Promise<RateResult> {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const dayKey = `${yyyy}-${mm}-${dd}`;
  const key = `daily:${userId}:${route}:${dayKey}`;

  // TTL = seconds until next UTC midnight + 60s buffer.
  const midnight = new Date(Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  const ttlSec = Math.max(60, Math.ceil((midnight.getTime() - now.getTime()) / 1000) + 60);

  if (isUpstashConfigured()) {
    try {
      const count = await upstashIncr(key, ttlSec);
      return { allowed: count <= maxDaily, remaining: Math.max(0, maxDaily - count) };
    } catch (e) {
      if (isProduction()) {
        console.error("[Aimlo] Upstash daily quota failed in production — failing closed:", (e as Error).message);
        throw new Error("rate-limiter-unavailable");
      }
      console.warn("[Aimlo] Upstash daily quota failed (dev) — memory fallback:", (e as Error).message);
    }
  }

  // Dev fallback (in-memory).
  const entry = dailyStore.get(key);
  if (!entry || now.getTime() > entry.resetAt) {
    dailyStore.set(key, { count: 1, resetAt: midnight.getTime() });
    return { allowed: true, remaining: maxDaily - 1, degraded: true };
  }
  entry.count++;
  return { allowed: entry.count <= maxDaily, remaining: Math.max(0, maxDaily - entry.count), degraded: true };
}

// Main rate limit function
export async function checkRateLimit(
  userId: string,
  route: RouteKey = "default",
  ip?: string
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number; reason?: string }> {
  cleanupStores();

  // Dev allowlist short-circuit: bypass ALL quota gates (per-minute,
  // daily, per-IP) so intensive testing sessions aren't blocked by the
  // standard 30/day vision cap. Production user_ids must never appear
  // in DEV_USER_ALLOWLIST. See env-var doc at top of file for rollback.
  if (isDevUser(userId)) {
    console.log(`[Aimlo rate-limit] dev allowlist bypass: user=${userId.slice(0, 8)}… route=${route}`);
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER };
  }

  const limits = RATE_LIMITS[route] || RATE_LIMITS.default;
  const dailyLimit = DAILY_QUOTA[route];

  try {
    // Per-user rate check
    const userKey = `rate:${userId}:${route}`;
    const rateResult = isUpstashConfigured()
      ? await upstashRateCheck(userKey, limits.max, limits.window)
      : memoryRateCheck(userKey, limits.max, limits.window);

    if (!rateResult.allowed) {
      return { allowed: false, remaining: 0, retryAfter: limits.window, reason: "rate" };
    }

    // Daily quota check (Upstash in prod)
    if (dailyLimit) {
      const dailyResult = await dailyQuotaCheck(userId, route, dailyLimit);
      if (!dailyResult.allowed) {
        return { allowed: false, remaining: 0, retryAfter: 3600, reason: "daily" };
      }
    }

    // Per-IP rate check (extra protection)
    if (ip) {
      const ipKey = `rate:ip:${ip}:${route}`;
      const ipResult = isUpstashConfigured()
        ? await upstashRateCheck(ipKey, limits.max * 3, limits.window)
        : memoryRateCheck(ipKey, limits.max * 3, limits.window);
      if (!ipResult.allowed) {
        return { allowed: false, remaining: 0, retryAfter: limits.window, reason: "ip" };
      }
    }

    return { allowed: true, remaining: rateResult.remaining };
  } catch (e) {
    // Fail-closed (only thrown by Upstash helpers in production).
    if ((e as Error).message === "rate-limiter-unavailable") {
      return { allowed: false, remaining: 0, retryAfter: 30, reason: "service" };
    }
    throw e;
  }
}

// ── Auth verification ──
export async function verifyAuthAndRateLimit(
  request: NextRequest,
  route: RouteKey = "default",
): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Aimlo API] Missing Supabase env vars");
    return {
      ok: false,
      response: NextResponse.json({ error: "Server configuration error" }, { status: 500 }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }

  // IP for rate limiting. On Vercel, x-real-ip is the actual client IP set by
  // the platform proxy and CANNOT be spoofed by client headers — prefer it.
  // x-forwarded-for is client-controllable on Vercel (clients can set any
  // value via headers, Vercel only APPENDS the real IP at the END of the
  // chain). So if we must fall back to XFF, take the LAST element, not first.
  const xff = request.headers.get("x-forwarded-for");
  const xffLast = xff ? xff.split(",").pop()?.trim() : undefined;
  const ip = request.headers.get("x-real-ip") || xffLast || undefined;

  const rateResult = await checkRateLimit(user.id, route, ip);
  if (!rateResult.allowed) {
    const isDailyQuota = rateResult.reason === "daily";
    const isService = rateResult.reason === "service";
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: isService
            ? "Rate limiter unavailable — please retry shortly."
            : isDailyQuota
            ? "Daily quota exceeded"
            : "Too many requests. Please wait a moment.",
          retryAfter: rateResult.retryAfter,
        },
        {
          status: isService ? 503 : 429,
          headers: rateResult.retryAfter ? { "Retry-After": String(rateResult.retryAfter) } : {},
        },
      ),
    };
  }

  return { ok: true, userId: user.id };
}
