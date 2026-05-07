"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { authRateLimit } from "@/lib/auth-rate-limit";

export interface ResetState {
  ok: boolean;
  error?: string;
  fieldErrors?: { password?: string; passwordConfirm?: string };
}

export async function resetAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const fieldErrors: ResetState["fieldErrors"] = {};
  if (password.length < 8) fieldErrors.password = "Şifre en az 8 karakter olmalı";
  if (password.length > 72) fieldErrors.password = "Şifre çok uzun (en fazla 72)";
  if (password !== passwordConfirm) fieldErrors.passwordConfirm = "Şifreler eşleşmiyor";
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Lütfen formu kontrol et", fieldErrors };
  }

  const supabase = await createServerSupabase();

  // Recovery session must be active (set by /auth/callback after the user
  // clicked the reset link). updateUser changes the password.
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return {
      ok: false,
      error: "Sıfırlama oturumu geçersiz veya süresi dolmuş. Yeniden link iste.",
    };
  }

  // Rate-limit by user.id (the recovery session is bound to a user already).
  // 5 / minute — handles typo-retry without enabling brute against current pw.
  const rl = await authRateLimit("reset", user.id);
  if (rl.blocked) {
    return { ok: false, error: rl.error };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[Aimlo reset] updateUser failed:", error.message);
    const msg = error.message.toLowerCase();
    if (msg.includes("password")) {
      return { ok: false, error: error.message, fieldErrors: { password: error.message } };
    }
    return { ok: false, error: "Şifre değiştirilemedi. Lütfen tekrar dene." };
  }

  // Sign out the recovery session — force a fresh login with the new password.
  await supabase.auth.signOut();
  redirect("/login?reset=success");
}
