import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { sanitizePromptInput } from "@/lib/prompt-safety";
import { createServiceSupabase } from "@/lib/supabase/server";

/**
 * POST /api/support
 *
 * Backs the desktop "Destek" screen. A signed-in user submits a free-text
 * support question/message; we store it in public.support_messages for the
 * founder to review in /admin → "Yardım / Sorular".
 *
 * Security:
 *   - Auth (Supabase JWT) + per-user + per-IP rate-limit via verifyAuthAndRateLimit
 *     (route key "support": 5/min, 20/day — generous for a human, kills spam).
 *   - user_id is taken from the VERIFIED JWT (never the body) so a forged
 *     user_id can't be planted; the RLS with-check on the table is the DB-level
 *     backstop if the insert ever ran under the user's own client.
 *   - The message is sanitized through lib/prompt-safety (strips tags/bidi/
 *     zero-width/role-prefixes, control chars) before storage — defense-in-depth
 *     against stored-XSS/injection when later rendered in the admin panel.
 *   - The INSERT uses the service-role client (server-only); the key never
 *     reaches the browser.
 *
 * Body: { message: string }
 * Response: { ok: true } | { ok: false, error: string }  (camelCase, structured).
 *
 * Note: requires migration supabase/0010_support_messages.sql — NOT yet applied
 * in prod. Until it is, inserts fail and we return a structured 503.
 */

// Tight Vercel timeout — a single small INSERT, no AI.
export const maxDuration = 10;

const MAX_PAYLOAD_BYTES = 20_000; // 20KB — a 4000-char message + overhead, plenty.
const MAX_MESSAGE_CHARS = 4000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Reject oversize payloads before parsing JSON.
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const auth = await verifyAuthAndRateLimit(request, "support");
  if (!auth.ok) return auth.response;

  // Parse body. Malformed JSON → 400.
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const rawMessage = (body as { message?: unknown }).message;
  if (typeof rawMessage !== "string") {
    return NextResponse.json({ ok: false, error: "message_required" }, { status: 400 });
  }

  // Reject over-length BEFORE sanitizing (so a 100KB blob is a clear 400, not a
  // silently-truncated insert). We trim first so trailing whitespace doesn't
  // tip a borderline message over the cap.
  const trimmed = rawMessage.trim();
  if (trimmed.length === 0) {
    return NextResponse.json({ ok: false, error: "message_empty" }, { status: 400 });
  }
  if (trimmed.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ ok: false, error: "message_too_long" }, { status: 400 });
  }

  // Sanitize: strip tags/bidi/zero-width/role-prefixes/control chars. We do NOT
  // strip backticks here (it's a support message, not an LLM prompt — a user may
  // legitimately paste a code snippet or path). The hard cap is the same.
  const message = sanitizePromptInput(trimmed, { max: MAX_MESSAGE_CHARS, stripBackticks: false });
  if (message.length === 0) {
    // Everything got stripped (e.g. message was only control/invisible chars).
    return NextResponse.json({ ok: false, error: "message_empty" }, { status: 400 });
  }

  // Resolve the user's email via service-role (best-effort — never blocks the
  // insert). The JWT is already verified by verifyAuthAndRateLimit, so this is
  // a trusted lookup of the same user's own email.
  let email: string | null = null;
  try {
    const svc = createServiceSupabase();
    const { data: u } = await svc.auth.admin.getUserById(auth.userId);
    email = u?.user?.email ?? null;

    const { error } = await svc.from("support_messages").insert({
      user_id: auth.userId,
      email,
      message,
    });

    if (error) {
      console.error("[Aimlo support] insert failed:", error.message);
      return NextResponse.json(
        { ok: false, error: "store_failed" },
        { status: 503 },
      );
    }
  } catch (e) {
    console.error("[Aimlo support] route error:", (e as Error).message);
    return NextResponse.json(
      { ok: false, error: "store_failed" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
