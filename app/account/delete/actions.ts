"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabase,
  createServiceSupabase,
} from "@/lib/supabase/server";
import { authRateLimit } from "@/lib/auth-rate-limit";

export interface DeleteState {
  ok: boolean;
  error?: string;
}

/**
 * Permanent account deletion — KVKK Art. 11 / GDPR Art. 17 compliance.
 *
 * Effect: removes auth.users row → CASCADE removes profiles, analyses,
 * player_memory. Session is signed out. The user's email is freed for
 * future re-registration.
 *
 * Requires:
 *   - Active session (the user must be signed in)
 *   - Confirmation token "SİL" typed by the user
 */
export async function deleteAccountAction(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "SİL") {
    return {
      ok: false,
      error: "Onay metni eşleşmedi. Silmek için kutuya 'SİL' yazmalısın.",
    };
  }

  const ssr = await createServerSupabase();
  const { data: { user }, error: userErr } = await ssr.auth.getUser();
  if (userErr || !user) {
    return {
      ok: false,
      error: "Oturum bulunamadı. Tekrar giriş yapıp dene.",
    };
  }

  // Rate-limit by user.id — prevents accidental double-submit and bots.
  const rl = await authRateLimit("reset", `delete:${user.id}`);
  if (rl.blocked) {
    return { ok: false, error: rl.error };
  }

  let admin;
  try {
    admin = createServiceSupabase();
  } catch {
    return { ok: false, error: "Sunucu yapılandırma hatası." };
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    console.error("[Aimlo deleteAccount] failed:", delErr.message);
    return { ok: false, error: "Hesap silinemedi. Lütfen tekrar dene." };
  }

  // Sign out the now-deleted session. Then redirect with a flag.
  await ssr.auth.signOut();
  redirect("/?deleted=1");
}
