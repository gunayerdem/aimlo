"use server";

import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { hashOtp, normalizeOtp } from "@/lib/otp";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
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
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    console.error("[Aimlo verify] listUsers failed:", error.message);
    return null;
  }
  const u = data?.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
  if (!u || !u.email) return null;
  return {
    id: u.id,
    email: u.email,
    metadata: (u.user_metadata ?? {}) as Record<string, unknown>,
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
    return { ok: false, error: "6 karakterlik kod gir" };
  }

  let admin;
  try {
    admin = createServiceSupabase();
  } catch (e) {
    console.error("[Aimlo verify] service client failed:", (e as Error).message);
    return { ok: false, error: "Sunucu yapılandırma hatası. Lütfen biraz sonra dene." };
  }

  const user = await findUserByEmail(admin, email);
  if (!user) {
    return { ok: false, error: "Bu e-posta için aktif bir kayıt yok. Önce kayıt ol." };
  }

  const otpMeta = (user.metadata.otp ?? null) as OtpMeta | null;
  if (!otpMeta || typeof otpMeta.hash !== "string") {
    return { ok: false, error: "Aktif kod yok. Yeni kod iste." };
  }
  if (Date.now() > otpMeta.expiresAt) {
    return { ok: false, error: "Kodun süresi doldu. Yeni kod iste." };
  }
  if (otpMeta.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Çok fazla yanlış deneme. Yeni kod iste." };
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

  // Generate a magic link to obtain a hashed_token, then verify it
  // server-side with the cookie-bound SSR client. This sets the session
  // cookies directly — no redirect-through-Supabase dance, no implicit-flow
  // hash fragment that the server can't see.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error("[Aimlo verify] generateLink failed:", linkErr?.message);
    return { ok: false, error: "Oturum açılamadı. Lütfen 'login' sayfasından dene." };
  }

  // Cookie-bound client — verifyOtp will write Set-Cookie headers via our
  // cookies adapter in createServerSupabase().
  const ssr = await createServerSupabase();
  const { error: verifyErr } = await ssr.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });

  if (verifyErr) {
    console.error("[Aimlo verify] verifyOtp(token_hash) failed:", verifyErr.message);
    return { ok: false, error: "Oturum açılamadı. Lütfen tekrar dene." };
  }

  // Session cookie set. Send to home.
  redirect("/?verified=true");
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

  let admin;
  try {
    admin = createServiceSupabase();
  } catch {
    return { ok: false, error: "Sunucu yapılandırma hatası" };
  }

  const user = await findUserByEmail(admin, email);
  if (!user) {
    return { ok: false, error: "Bu e-posta için kayıt bulunamadı" };
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
