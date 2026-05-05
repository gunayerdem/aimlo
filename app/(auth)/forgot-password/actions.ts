"use server";

import { createServerSupabase } from "@/lib/supabase/server";
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
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  // Always show success message — don't reveal whether email exists.
  if (error) {
    console.error("[Aimlo forgot] resetPasswordForEmail failed:", error.message);
  }

  return { ok: true, sent: true, values: raw };
}
