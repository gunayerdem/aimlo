"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabase,
  createServiceSupabase,
} from "@/lib/supabase/server";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { loginSchema } from "../schemas";

const OTP_TTL_MS = 10 * 60 * 1000;

export interface LoginState {
  ok: boolean;
  error?: string;
  values?: { identifier?: string };
  /** Set when the user's email is unconfirmed — UI shows "verify your email"
   *  with a link to /verify?email=…&purpose=register. */
  needsVerification?: { email: string };
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

  const id = parsed.data.identifier.trim().toLowerCase();
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
    // Email not confirmed — redirect user through OTP verify flow.
    if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
      // Re-issue an OTP so they can verify and proceed.
      try {
        const code = generateOtp();
        const hash = hashOtp(code, email);

        // Find user to update OTP metadata.
        const { data: list } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        const user = list?.users.find((u) => u.email?.toLowerCase() === email);
        if (user) {
          await admin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
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
      return {
        ok: false,
        error:
          "E-posta henüz doğrulanmamış. E-postana yeni bir kod gönderdik — kayıt akışını tamamla.",
        values: echo,
        needsVerification: { email },
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
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const u = list?.users.find((x) => x.email?.toLowerCase() === email);
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
    return {
      ok: false,
      error:
        "E-postan henüz doğrulanmamış. Yeni bir kod gönderdik — kayıt akışını tamamla.",
      values: echo,
      needsVerification: { email },
    };
  }

  redirect("/?verified=true");
}
