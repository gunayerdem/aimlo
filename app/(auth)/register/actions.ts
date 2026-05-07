"use server";

import { redirect } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase/server";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { authRateLimit } from "@/lib/auth-rate-limit";
import { registerSchema } from "../schemas";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface RegisterState {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<
    Record<
      "email" | "username" | "firstName" | "lastName" | "password" | "passwordConfirm" | "kvkk",
      string
    >
  >;
  /** Echo back form values so the user doesn't lose them on validation error.
   *  We DO echo back password values so the form doesn't blank — the connection
   *  is HTTPS in prod and the response only goes back to the same browser. */
  values?: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface AuthUserSummary {
  id: string;
  email: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata: Record<string, unknown>;
}

/** Find a user by email via the find_user_by_email SQL RPC (O(1),
 * service-role only). Replaces listUsers({ perPage: 200 }) which silently
 * broke at user 201. */
async function findUserByEmail(
  admin: ReturnType<typeof createServiceSupabase>,
  email: string,
): Promise<AuthUserSummary | null> {
  const { data, error } = await admin.rpc("find_user_by_email", {
    p_email: email.toLowerCase().trim(),
  });
  if (error) {
    console.error("[Aimlo register] find_user_by_email RPC failed:", error.message);
    return null;
  }
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  const u = Array.isArray(data) ? data[0] : data;
  return {
    id: u.id,
    email: u.email,
    email_confirmed_at: u.email_confirmed_at,
    last_sign_in_at: u.last_sign_in_at,
    user_metadata: (u.raw_user_meta_data ?? {}) as Record<string, unknown>,
  };
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    username: String(formData.get("username") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    kvkk: String(formData.get("kvkk") ?? ""),
  };

  // Echo back non-secret fields only.
  const echo = {
    email: raw.email,
    username: raw.username,
    firstName: raw.firstName,
    lastName: raw.lastName,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: RegisterState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0]?.toString() as keyof NonNullable<
        RegisterState["fieldErrors"]
      >;
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { ok: false, error: "Lütfen formu kontrol et", fieldErrors, values: echo };
  }

  const { email, username, firstName, lastName, password } = parsed.data;

  // Rate-limit per (email, IP). 5 / 10min — tight enough to discourage
  // mass-signup bots, loose enough that a real user retrying after a typo
  // won't get blocked.
  const rl = await authRateLimit("register", email);
  if (rl.blocked) {
    return { ok: false, error: rl.error, values: echo };
  }

  let admin;
  try {
    admin = createServiceSupabase();
  } catch (e) {
    console.error("[Aimlo register] service client failed:", (e as Error).message);
    return {
      ok: false,
      error: "Sunucu yapılandırma hatası. Lütfen biraz sonra dene.",
      values: echo,
    };
  }

  // Username availability — citext unique index, but we check first for a
  // friendlier error than "duplicate key".
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("user_id")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (existingProfile) {
    return {
      ok: false,
      error: "Kullanıcı adı alınmış",
      fieldErrors: { username: "Bu kullanıcı adı alınmış" },
      values: echo,
    };
  }

  // O(1) email lookup via SQL RPC — replaces broken listUsers paging.
  const existingUser = await findUserByEmail(admin, email);

  // Generate OTP
  const code = generateOtp();
  const hash = hashOtp(code, email);
  const otpMeta = {
    hash,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    purpose: "register" as const,
  };

  if (existingUser) {
    const wasVerified =
      !!existingUser.last_sign_in_at || !!existingUser.email_confirmed_at;
    if (wasVerified) {
      return {
        ok: false,
        error: "Bu e-posta zaten kayıtlı",
        fieldErrors: { email: "Bu e-posta zaten kayıtlı. Giriş yap." },
        values: echo,
      };
    }
    // Unverified leftover — refresh password + metadata + OTP, re-send.
    const { error: updErr } = await admin.auth.admin.updateUserById(
      existingUser.id,
      {
        password,
        user_metadata: {
          ...existingUser.user_metadata,
          username: username.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          otp: otpMeta,
        },
      },
    );
    if (updErr) {
      console.error("[Aimlo register] updateUserById failed:", updErr.message);
      return {
        ok: false,
        error: "Kayıt güncellenemedi. Lütfen tekrar dene.",
        values: echo,
      };
    }
  } else {
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // we set this true after OTP success
      user_metadata: {
        username: username.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        otp: otpMeta,
      },
    });
    if (createErr) {
      console.error("[Aimlo register] createUser failed:", createErr.message);
      const msg = createErr.message.toLowerCase();
      if (
        (msg.includes("already") && msg.includes("registered")) ||
        msg.includes("duplicate") ||
        msg.includes("user_already_exists")
      ) {
        return {
          ok: false,
          error: "Bu e-posta zaten kayıtlı",
          fieldErrors: { email: "Bu e-posta zaten kayıtlı. Giriş yap." },
          values: echo,
        };
      }
      // The auto profile-creation trigger (tg_handle_new_user) raises if a
      // duplicate username slips through to the trigger because the unique
      // citext index rejects it. We already pre-checked profiles above, so
      // this only fires on a true race — rare but should be handled.
      if (msg.includes("profiles_username") || msg.includes("unique")) {
        return {
          ok: false,
          error: "Kullanıcı adı az önce alındı, başka bir tane dene.",
          fieldErrors: { username: "Az önce alındı, başka bir tane dene." },
          values: echo,
        };
      }
      if (msg.includes("password")) {
        return {
          ok: false,
          error: "Şifre kabul edilmedi",
          fieldErrors: { password: createErr.message },
          values: echo,
        };
      }
      return {
        ok: false,
        error: "Kayıt oluşturulamadı. Lütfen tekrar dene.",
        values: echo,
      };
    }
  }

  try {
    await sendOtpEmail({ to: email, code, lang: "tr", purpose: "register" });
  } catch (e) {
    console.error("[Aimlo register] sendOtpEmail failed:", (e as Error).message);
    return {
      ok: false,
      error: "Doğrulama maili gönderilemedi. Lütfen birkaç dakika sonra dene.",
      values: echo,
    };
  }

  redirect(`/verify?email=${encodeURIComponent(email)}&purpose=register`);
}
