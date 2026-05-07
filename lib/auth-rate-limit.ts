import "server-only";

import { headers } from "next/headers";

/**
 * Auth-flow rate limiter — keyed per (route, identifier, IP).
 *
 * The /api/ai/* routes have their own rate limiter (lib/api-auth.ts)
 * tied to the authenticated Supabase user. Auth server actions
 * (register / login / verify / forgot / resend / reset) DON'T have a
 * user yet, so we throttle by email + IP instead. Without this an
 * attacker can:
 *   - brute the 6-digit OTP (10^6 space, 5 attempts per re-issued
 *     code) by spamming resend → verify in parallel
 *   - flood a victim's inbox via /forgot-password
 *   - enumerate registered users via /login error timing
 *
 * Backed by Upstash Redis (REST INCR + EXPIRE), with an in-memory
 * fallback for local dev only. Production fails CLOSED if Upstash
 * is configured but unreachable.
 */

const STRICT_RATE_LIMIT = process.env.STRICT_RATE_LIMIT === "true";

interface AuthLimit {
  /** Window length in seconds. */
  windowSec: number;
  /** Max attempts per (identifier, IP) pair within the window. */
  max: number;
}

export type AuthAction =
  | "register"
  | "login"
  | "verify"
  | "resend"
  | "forgot"
  | "reset";

const LIMITS: Record<AuthAction, AuthLimit> = {
  register: { windowSec: 60 * 10, max: 5 },   // 5 / 10min — discourages mass-signup
  login:    { windowSec: 60,      max: 8 },   // 8 / min — bots get throttled
  verify:   { windowSec: 60,      max: 8 },   // 8 / min — combined with 5-attempt OTP cap
  resend:   { windowSec: 60 * 5,  max: 3 },   // 3 / 5min — kills inbox-flood + bruteforce-by-resend
  forgot:   { windowSec: 60 * 10, max: 3 },   // 3 / 10min — discourages mass reset emails
  reset:    { windowSec: 60,      max: 5 },   // 5 / min — final-stage password change
};

interface RateResult {
  allowed: boolean;
  retryAfterSec?: number;
  reason?: "rate" | "service";
}

// In-memory fallback (dev). Per-process — useless in prod.
const memStore = new Map<string, { count: number; resetAt: number }>();

function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || STRICT_RATE_LIMIT;
}

async function upstashIncr(key: string, ttlSec: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  // Separate AbortControllers so EXPIRE failure doesn't abort INCR mid-flight.
  const incrCtrl = new AbortController();
  const incrTid = setTimeout(() => incrCtrl.abort(), 4000);
  let count: number;
  try {
    const incrRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: incrCtrl.signal,
    });
    if (!incrRes.ok) throw new Error(`Upstash INCR HTTP ${incrRes.status}`);
    const incrData = await incrRes.json();
    count = incrData.result as number;
    if (typeof count !== "number") {
      throw new Error(`Upstash INCR returned non-number: ${JSON.stringify(incrData)}`);
    }
  } finally {
    clearTimeout(incrTid);
  }

  // Always set TTL — even if count > 1, ensures keys never become TTL-less
  // because of an earlier EXPIRE timeout. Cheap (one extra REST call) and
  // closes the lockout race in lib/api-auth.ts.
  const expCtrl = new AbortController();
  const expTid = setTimeout(() => expCtrl.abort(), 3000);
  try {
    const expRes = await fetch(`${url}/expire/${encodeURIComponent(key)}/${ttlSec}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: expCtrl.signal,
    });
    if (!expRes.ok) {
      console.warn(`[Aimlo authRL] EXPIRE failed for ${key}: HTTP ${expRes.status}`);
    }
  } catch (e) {
    console.warn(`[Aimlo authRL] EXPIRE error for ${key}:`, (e as Error).message);
  } finally {
    clearTimeout(expTid);
  }

  return count;
}

function memCheck(key: string, max: number, windowSec: number): RateResult {
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true };
  }
  entry.count++;
  if (entry.count > max) {
    return {
      allowed: false,
      reason: "rate",
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { allowed: true };
}

async function checkOne(
  key: string,
  max: number,
  windowSec: number,
): Promise<RateResult> {
  if (!isUpstashConfigured()) {
    return memCheck(key, max, windowSec);
  }
  try {
    const count = await upstashIncr(key, windowSec);
    if (count > max) {
      return { allowed: false, reason: "rate", retryAfterSec: windowSec };
    }
    return { allowed: true };
  } catch (e) {
    if (isProduction()) {
      console.error("[Aimlo authRL] Upstash unavailable in prod — failing closed:", (e as Error).message);
      return { allowed: false, reason: "service", retryAfterSec: 30 };
    }
    console.warn("[Aimlo authRL] Upstash unavailable (dev) — memory fallback:", (e as Error).message);
    return memCheck(key, max, windowSec);
  }
}

/**
 * Resolve client IP from the request headers (Vercel sets x-real-ip;
 * x-forwarded-for is client-controllable except for the LAST entry,
 * which is the only one we trust as a fallback).
 */
async function resolveIp(): Promise<string> {
  const h = await headers();
  const real = h.get("x-real-ip");
  if (real) return real;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const last = xff.split(",").pop()?.trim();
    if (last) return last;
  }
  return "unknown";
}

/**
 * Throttle an auth server action. Returns null when allowed; on block
 * returns a human-readable error string + retry-after seconds that
 * the action can plug into its `{ ok: false, error }` return shape.
 */
export async function authRateLimit(
  action: AuthAction,
  identifier: string,
): Promise<{ blocked: false } | { blocked: true; error: string; retryAfterSec: number }> {
  const limit = LIMITS[action];
  const ip = await resolveIp();
  // Normalise identifier — lowercase + trim so case-only variants don't bypass.
  const idNorm = identifier.toLowerCase().trim() || "anon";

  // Two-key check: per-identifier AND per-IP. Whichever bucket fills first
  // blocks. Per-IP cap is 4× the per-identifier cap to tolerate shared NAT
  // (school / mobile carrier).
  const idKey = `authrl:${action}:id:${idNorm}`;
  const ipKey = `authrl:${action}:ip:${ip}`;

  const [r1, r2] = await Promise.all([
    checkOne(idKey, limit.max, limit.windowSec),
    checkOne(ipKey, limit.max * 4, limit.windowSec),
  ]);

  for (const r of [r1, r2]) {
    if (!r.allowed) {
      const isService = r.reason === "service";
      return {
        blocked: true,
        error: isService
          ? "Servis geçici olarak yoğun. Lütfen 30 saniye sonra dene."
          : "Çok fazla deneme. Lütfen biraz sonra tekrar dene.",
        retryAfterSec: r.retryAfterSec ?? limit.windowSec,
      };
    }
  }

  return { blocked: false };
}
