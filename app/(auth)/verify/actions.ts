"use server";

import { redirect } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase/server";
import { hashOtp, normalizeOtp } from "@/lib/otp";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { authRateLimit } from "@/lib/auth-rate-limit";
import { verifySchema } from "../schemas";
import { timingSafeEqual } from "node:crypto";

const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000;

export interface VerifyState {
  ok: boolean;
  error?: string;
  /** When non-null, UI shows a "code resent" success message. */
  resent?: boolean;
}

interface OtpMeta {
  hash: string;
  expiresAt: number;
  attempts: number;
  purpose: "register" | "login";
}

interface FoundUser {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
  emailConfirmed: boolean;
}

async function findUserByEmail(
  admin: ReturnType<typeof createServiceSupabase>,
  email: string,
): Promise<FoundUser | null> {
  // O(1) via SQL RPC. Replaces listUsers({ perPage: 200 }) which silently
  // broke at user 201.
  const { data, error } = await admin.rpc("find_user_by_email", {
    p_email: email.toLowerCase().trim(),
  });
  if (error) {
    console.error("[Aimlo verify] find_user_by_email RPC failed:", error.message);
    return null;
  }
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  const u = Array.isArray(data) ? data[0] : data;
  if (!u || !u.email) return null;
  return {
    id: u.id as string,
    email: u.email as string,
    metadata: (u.raw_user_meta_data ?? {}) as Record<string, unknown>,
    emailConfirmed: !!u.email_confirmed_at,
  };
}

export async function verifyAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const parsed = verifySchema.safeParse({
    email: String(formData.get("email") ?? ""),
    code: String(formData.get("code") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: "Geçersiz form girdisi" };
  }
  const { email } = parsed.data;
  const codeNorm = normalizeOtp(parsed.data.code);
  if (codeNorm.length !== 6) {
    return { ok: false, error: "6 haneli kod gir" };
  }

  // Rate-limit per (email, IP). 8 / minute — combined with the 5-attempt
  // OTP-meta cap, this kills the parallel-burn brute-force bug where N
  // simultaneous verifyAction calls all see attempts=0 and burn N guesses.
  const rl = await authRateLimit("verify", email);
  if (rl.blocked) {
    return { ok: false, error: rl.error };
  }

  let admin;
  try {
    admin = createServiceSupabase();
  } catch (e) {
    console.error("[Aimlo verify] service client failed:", (e as Error).message);
    return { ok: false, error: "Sunucu yapılandırma hatası. Lütfen biraz sonra dene." };
  }

  // Uniform error message for "user missing", "no active OTP", "OTP
  // expired", "attempts maxed" — all the cases where we don't have a
  // valid code to compare against. Distinct messages would leak whether
  // the email is registered, even after rate-limit (text content is the
  // oracle). User flow: any of these → user clicks "Yeni kod gönder".
  const GENERIC_INVALID = "Kod geçersiz veya süresi dolmuş. Yeni kod iste.";

  const user = await findUserByEmail(admin, email);
  if (!user) {
    return { ok: false, error: GENERIC_INVALID };
  }

  const otpMeta = (user.metadata.otp ?? null) as OtpMeta | null;
  if (!otpMeta || typeof otpMeta.hash !== "string") {
    return { ok: false, error: GENERIC_INVALID };
  }
  if (Date.now() > otpMeta.expiresAt) {
    return { ok: false, error: GENERIC_INVALID };
  }
  if (otpMeta.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: GENERIC_INVALID };
  }

  let candidateHash: string;
  try {
    candidateHash = hashOtp(codeNorm, email);
  } catch {
    return { ok: false, error: "Sunucu yapılandırma hatası. Lütfen biraz sonra dene." };
  }

  const a = Buffer.from(candidateHash, "hex");
  const b = Buffer.from(otpMeta.hash, "hex");
  const valid = a.length > 0 && a.length === b.length && timingSafeEqual(a, b);

  if (!valid) {
    const remaining = MAX_ATTEMPTS - otpMeta.attempts - 1;
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.metadata,
        otp: { ...otpMeta, attempts: otpMeta.attempts + 1 },
      },
    });
    return {
      ok: false,
      error:
        remaining > 0
          ? `Kod hatalı. ${remaining} deneme hakkın kaldı.`
          : "Kod hatalı ve deneme hakkın bitti. Yeni kod iste.",
    };
  }

  // Success — clear OTP, mark email confirmed.
  const { error: confirmErr } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
    user_metadata: { ...user.metadata, otp: null },
  });
  if (confirmErr) {
    console.error("[Aimlo verify] updateUserById confirm failed:", confirmErr.message);
    return { ok: false, error: "Doğrulama tamamlanamadı. Lütfen tekrar dene." };
  }

  // Email is now confirmed. We don't auto-login here because the magic-link
  // verifyOtp dance is brittle on serverless (cookies sometimes don't flush
  // before the redirect). Send the user to /login with a success banner —
  // they enter the password they just chose during register, signin succeeds
  // immediately because the email is now confirmed.
  redirect("/login?confirmed=1");
}

export interface ResendState {
  ok: boolean;
  error?: string;
  resent?: boolean;
}

export async function resendAction(
  _prev: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const purpose = (String(formData.get("purpose") ?? "register") === "login"
    ? "login"
    : "register") as "register" | "login";

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Geçersiz e-posta" };
  }

  // Rate-limit per (email, IP). 3 / 5min — kills inbox-flood + the
  // bruteforce-by-resend loop that previously bypassed the 5-attempt cap.
  const rl = await authRateLimit("resend", email);
  if (rl.blocked) {
    return { ok: false, error: rl.error };
  }

  let admin;
  try {
    admin = createServiceSupabase();
  } catch {
    return { ok: false, error: "Sunucu yapılandırma hatası" };
  }

  // Uniform success — never leak "this email isn't registered". If the user
  // doesn't exist, we silently no-op and pretend we sent (same response
  // the caller would see for a registered email). Combined with the
  // resend rate-limit, this prevents email enumeration via the form.
  const user = await findUserByEmail(admin, email);
  if (!user) {
    return { ok: true, resent: true };
  }

  const code = generateOtp();
  let hash: string;
  try {
    hash = hashOtp(code, email);
  } catch {
    return { ok: false, error: "Sunucu yapılandırma hatası" };
  }

  const otpMeta: OtpMeta = {
    hash,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    purpose,
  };

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.metadata, otp: otpMeta },
  });
  if (updErr) {
    console.error("[Aimlo resend] updateUserById failed:", updErr.message);
    return { ok: false, error: "Bir şey ters gitti. Lütfen tekrar dene." };
  }

  try {
    await sendOtpEmail({ to: email, code, lang: "tr", purpose });
  } catch (e) {
    console.error("[Aimlo resend] sendOtpEmail failed:", (e as Error).message);
    return { ok: false, error: "Mail gönderilemedi. Lütfen biraz sonra dene." };
  }

  return { ok: true, resent: true };
}
