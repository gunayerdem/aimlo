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
 * Effect: FIRST deletes the user's support_messages rows (service-role),
 * THEN removes the auth.users row → CASCADE removes profiles, analyses,
 * player_memory. Session is signed out. The user's email is freed for
 * future re-registration.
 *
 * F50 (2026-09-24): support_messages.user_id is `on delete set null`
 * (supabase/0010_support_messages.sql:31) and the row keeps its own `email`
 * + `message` columns. CASCADE never touched it: after deleteUser the row
 * survived with user_id = NULL (e-mail + message text kept forever, still
 * listed in /admin/support via lib/admin-analytics.ts r.email). ORDER MATTERS:
 * once deleteUser runs the row can no longer be matched by user_id, so the
 * delete must run BEFORE it. If it fails, account deletion stops (the user
 * sees a generic error + support address) instead of leaving orphaned PII.
 * Out of reach here: the notification copies already mailed to the support
 * inbox (lib/email.ts sendSupportNotification) — the page tells the user to
 * write to support for those.
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

  // F50: destek satırları deleteUser'dan ÖNCE (sıra kritik — yukarıdaki not).
  const SUPPORT_FAIL =
    "Hesap silinemedi. Lütfen tekrar dene; sorun sürerse support@aimlo.gg adresine yaz.";
  try {
    const { error: supErr } = await admin
      .from("support_messages")
      .delete()
      .eq("user_id", user.id);
    if (supErr) {
      console.error("[Aimlo deleteAccount] support_messages delete failed:", supErr.message);
      return { ok: false, error: SUPPORT_FAIL };
    }
  } catch (e) {
    console.error("[Aimlo deleteAccount] support_messages delete threw:", (e as Error).message);
    return { ok: false, error: SUPPORT_FAIL };
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
