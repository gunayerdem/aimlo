"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { authRateLimit } from "@/lib/auth-rate-limit";
import { forgotSchema } from "../schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aimlo.gg";

export interface ForgotState {
  ok: boolean;
  error?: string;
  sent?: boolean;
  values?: { email?: string };
}

export async function forgotAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const raw = { email: String(formData.get("email") ?? "") };

  const parsed = forgotSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta",
      values: raw,
    };
  }

  const { email } = parsed.data;

  // Pad total response time to ~600ms regardless of code path. Prevents
  // timing-based registered-vs-not enumeration: rate-limited path used to
  // return instantly while the actual reset-email path took ~300-500ms,
  // creating a side channel even though both responses looked identical.
  const t0 = Date.now();
  const TARGET_MS = 600;

  // Rate-limit per (email, IP). 3 / 10min — discourages mass reset-email
  // floods to a victim's inbox + email-bombing as a DoS. We do NOT short-
  // circuit on rate-limit: still wait the full window before responding.
  const rl = await authRateLimit("forgot", email);

  if (!rl.blocked) {
    try {
      const supabase = await createServerSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
      });
      if (error) {
        console.error("[Aimlo forgot] resetPasswordForEmail failed:", error.message);
      }
    } catch (e) {
      console.error("[Aimlo forgot] exception:", (e as Error).message);
    }
  } else {
    console.warn("[Aimlo forgot] rate-limited:", email);
  }

  const elapsed = Date.now() - t0;
  if (elapsed < TARGET_MS) {
    await new Promise((r) => setTimeout(r, TARGET_MS - elapsed));
  }

  // Always show success — never reveal whether the email is registered.
  return { ok: true, sent: true, values: raw };
}
