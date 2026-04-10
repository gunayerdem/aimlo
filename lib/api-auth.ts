import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Shared API utilities: auth verification + rate limiting
 *
 * Dual-mode rate limiter:
 * - In-memory fallback (dev/small scale, resets on deploy)
 * - Upstash Redis (production, when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set)
 */

// ── Rate limiting configuration ──

const RATE_LIMITS = {
  feedback: { window: 60, max: 15 },  // 15 per minute
  report: { window: 60, max: 5 },     // 5 per minute (more expensive)
  default: { window: 60, max: 20 },
};

// Daily quota per user
const DAILY_QUOTA = {
  feedback: 200,  // max 200 feedback calls per day
  report: 30,     // max 30 report calls per day
};

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetAt: number }>();
const dailyStore = new Map<string, { count: number; resetAt: number }>();

let lastCleanup = Date.now();

// Lazy cleanup: every 60s, purge expired entries (serverless-safe)
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

// Check if Upstash is configured
function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Upstash rate check (simple REST API, no SDK needed)
async function upstashRateCheck(key: string, limit: number, windowSec: number): Promise<{ allowed: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  try {
    // INCR the key
    const incrRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const incrData = await incrRes.json();
    const count = incrData.result as number;

    // Set TTL only on first request (count === 1)
    if (count === 1) {
      await fetch(`${url}/expire/${encodeURIComponent(key)}/${windowSec}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (e) {
    console.warn("[Aimlo] Upstash rate check failed, falling back to memory");
    return memoryRateCheck(key, limit, windowSec);
  }
}

// In-memory rate check
function memoryRateCheck(key: string, limit: number, windowSec: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

// Daily quota check
function dailyQuotaCheck(userId: string, route: string, maxDaily: number): { allowed: boolean; remaining: number } {
  const key = `daily:${userId}:${route}`;
  const now = Date.now();
  const entry = dailyStore.get(key);

  // Reset at midnight
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const resetAt = midnight.getTime();

  if (!entry || now > entry.resetAt) {
    dailyStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxDaily - 1 };
  }

  entry.count++;
  return { allowed: entry.count <= maxDaily, remaining: Math.max(0, maxDaily - entry.count) };
}

// Main rate limit function
export async function checkRateLimit(
  userId: string,
  route: "feedback" | "report" | "default" = "default",
  ip?: string
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  cleanupStores();

  const limits = RATE_LIMITS[route];
  const dailyLimit = DAILY_QUOTA[route as keyof typeof DAILY_QUOTA];

  // Per-user rate check
  const userKey = `rate:${userId}:${route}`;
  const rateResult = isUpstashConfigured()
    ? await upstashRateCheck(userKey, limits.max, limits.window)
    : memoryRateCheck(userKey, limits.max, limits.window);

  if (!rateResult.allowed) {
    return { allowed: false, remaining: 0, retryAfter: limits.window };
  }

  // Daily quota check (always in-memory for now)
  if (dailyLimit) {
    const dailyResult = dailyQuotaCheck(userId, route, dailyLimit);
    if (!dailyResult.allowed) {
      return { allowed: false, remaining: 0, retryAfter: 3600 };
    }
  }

  // Per-IP rate check (if IP available, extra protection)
  if (ip) {
    const ipKey = `rate:ip:${ip}`;
    const ipResult = isUpstashConfigured()
      ? await upstashRateCheck(ipKey, limits.max * 3, limits.window) // IP limit is 3x user limit
      : memoryRateCheck(ipKey, limits.max * 3, limits.window);

    if (!ipResult.allowed) {
      return { allowed: false, remaining: 0, retryAfter: limits.window };
    }
  }

  return { allowed: true, remaining: rateResult.remaining };
}

// ── Auth verification ──
export async function verifyAuthAndRateLimit(
  request: NextRequest,
  route: "feedback" | "report" | "default" = "default",
): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  // Extract Bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.slice(7);

  // Verify with Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Aimlo API] Missing Supabase env vars");
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      ),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }

  // Extract IP for rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             request.headers.get("x-real-ip") ||
             undefined;

  // Rate limit check
  const rateResult = await checkRateLimit(user.id, route, ip);
  if (!rateResult.allowed) {
    const isDailyQuota = rateResult.retryAfter === 3600;
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: isDailyQuota ? "Daily quota exceeded" : "Too many requests. Please wait a moment.",
          retryAfter: rateResult.retryAfter,
        },
        { status: 429 },
      ),
    };
  }

  return { ok: true, userId: user.id };
}
