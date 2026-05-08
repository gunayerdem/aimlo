"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabase,
  createServiceSupabase,
} from "@/lib/supabase/server";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { authRateLimit } from "@/lib/auth-rate-limit";
import { loginSchema } from "../schemas";

const OTP_TTL_MS = 10 * 60 * 1000;

export interface LoginState {
  ok: boolean;
  error?: string;
  values?: { identifier?: string };
}

interface AuthUserSummary {
  id: string;
  email: string | null;
  email_confirmed_at: string | null;
  user_metadata: Record<string, unknown>;
}

async function findUserByEmail(
  admin: ReturnType<typeof createServiceSupabase>,
  email: string,
): Promise<AuthUserSummary | null> {
  const { data, error } = await admin.rpc("find_user_by_email", {
    p_email: email.toLowerCase().trim(),
  });
  if (error) {
    console.error("[Aimlo login] find_user_by_email RPC failed:", error.message);
    return null;
  }
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  const u = Array.isArray(data) ? data[0] : data;
  return {
    id: u.id,
    email: u.email,
    email_confirmed_at: u.email_confirmed_at,
    user_metadata: (u.raw_user_meta_data ?? {}) as Record<string, unknown>,
  };
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    identifier: String(formData.get("identifier") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const echo = { identifier: raw.identifier };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "E-posta/kullanıcı adı ve şifre gerekli", values: echo };
  }

  // Rate-limit per (identifier, IP). 8 / minute — kills bots without
  // blocking real users who mistype once.
  const id = parsed.data.identifier.trim().toLowerCase();
  const rl = await authRateLimit("login", id);
  if (rl.blocked) {
    return { ok: false, error: rl.error, values: echo };
  }

  const password = parsed.data.password;
  const isEmail = id.includes("@");

  let admin;
  try {
    admin = createServiceSupabase();
  } catch (e) {
    console.error("[Aimlo login] service client failed:", (e as Error).message);
    return {
      ok: false,
      error: "Sunucu yapılandırma hatası. Lütfen biraz sonra dene.",
      values: echo,
    };
  }

  // Resolve username → email if needed.
  let email: string;
  if (isEmail) {
    email = id;
  } else {
    const { data, error } = await admin.rpc("lookup_email_by_username", {
      lookup_username: id,
    });
    if (error) {
      console.error("[Aimlo login] lookup_email_by_username failed:", error.message);
      return { ok: false, error: "Bir şey ters gitti. Lütfen tekrar dene.", values: echo };
    }
    if (!data) {
      // Same generic error as bad-password to avoid registered-user enumeration.
      return { ok: false, error: "Geçersiz e-posta veya şifre", values: echo };
    }
    email = (data as string).toLowerCase();
  }

  // Sign in with the cookie-bound SSR client so the session cookie is set.
  const ssr = await createServerSupabase();
  const { data: signinData, error: signinErr } =
    await ssr.auth.signInWithPassword({ email, password });

  if (signinErr) {
    const msg = signinErr.message.toLowerCase();
    // Email not confirmed — re-issue OTP and bounce to /verify.
    if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
      try {
        const code = generateOtp();
        const hash = hashOtp(code, email);
        const u = await findUserByEmail(admin, email);
        if (u) {
          await admin.auth.admin.updateUserById(u.id, {
            user_metadata: {
              ...u.user_metadata,
              otp: {
                hash,
                expiresAt: Date.now() + OTP_TTL_MS,
                attempts: 0,
                purpose: "register" as const,
              },
            },
          });
          await sendOtpEmail({ to: email, code, lang: "tr", purpose: "register" });
        }
      } catch (e) {
        console.error("[Aimlo login] re-issue OTP on unverified login failed:", (e as Error).message);
      }
      // SOFTENED ENUMERATION: don't return `needsVerification: { email }`
      // — that flag was a clean enumeration oracle ("yes, you typed the
      // right password for an existing-but-unverified account"). We still
      // re-issue the OTP silently so a real user has a fresh code in
      // their inbox; the response message is generic enough that an
      // attacker who guessed the password can't distinguish "wrong
      // password" from "right password but unverified email" without
      // checking the user's inbox (which they can't).
      return {
        ok: false,
        error: "Geçersiz e-posta veya şifre",
        values: echo,
      };
    }
    if (msg.includes("invalid") || msg.includes("credentials")) {
      return { ok: false, error: "Geçersiz e-posta veya şifre", values: echo };
    }
    if (msg.includes("rate") || msg.includes("too many")) {
      return {
        ok: false,
        error: "Çok fazla deneme yapıldı. Lütfen 1-2 dakika sonra tekrar dene.",
        values: echo,
      };
    }
    console.error("[Aimlo login] signInWithPassword failed:", signinErr.message);
    return { ok: false, error: "Giriş yapılamadı. Lütfen tekrar dene.", values: echo };
  }

  if (!signinData.session) {
    return { ok: false, error: "Oturum açılamadı. Lütfen tekrar dene.", values: echo };
  }

  // GATE: even if Supabase's "Confirm email" provider toggle is off (we
  // disabled it so it wouldn't send its own template), we still require the
  // user to have completed our OTP verification. signInWithPassword may
  // hand back a session before email_confirmed_at is set — sign out, fire
  // a fresh OTP, and bounce them to /verify.
  if (!signinData.user?.email_confirmed_at) {
    await ssr.auth.signOut();
    try {
      const code = generateOtp();
      const hash = hashOtp(code, email);
      const u = await findUserByEmail(admin, email);
      if (u) {
        await admin.auth.admin.updateUserById(u.id, {
          user_metadata: {
            ...u.user_metadata,
            otp: {
              hash,
              expiresAt: Date.now() + OTP_TTL_MS,
              attempts: 0,
              purpose: "register" as const,
            },
          },
        });
        await sendOtpEmail({ to: email, code, lang: "tr", purpose: "register" });
      }
    } catch (e) {
      console.error("[Aimlo login] gate OTP issue:", (e as Error).message);
    }
    // Same softened response as above — no needsVerification flag, no
    // distinguishable success path. Generic error keeps the response
    // shape symmetric with "wrong password".
    return {
      ok: false,
      error: "Geçersiz e-posta veya şifre",
      values: echo,
    };
  }

  redirect("/?verified=true");
}
