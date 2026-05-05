"use server";

import { redirect } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase/server";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
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

  // Look for an existing auth.users row with this email. Beta-scale OK with
  // listUsers; switch to a server RPC if user count > 1k.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("[Aimlo register] listUsers failed:", listErr.message);
    return {
      ok: false,
      error: "Bir şey ters gitti. Lütfen tekrar dene.",
      values: echo,
    };
  }
  const existingUser = list?.users.find((u) => u.email?.toLowerCase() === email);

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
      if (msg.includes("already") && msg.includes("registered")) {
        return {
          ok: false,
          error: "Bu e-posta zaten kayıtlı",
          fieldErrors: { email: "Bu e-posta zaten kayıtlı. Giriş yap." },
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
