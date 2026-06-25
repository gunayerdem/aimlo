// Admin gate — server-only. The admin decision lives in public.admins and is
// read ONLY via the service-role client (the table has no anon/authenticated
// RLS policy). NEVER gate admin surfaces with client-side checks or by trusting
// cookie presence / user_metadata — always validate the JWT with getUser() and
// confirm against this table.
import "server-only";

import type { User } from "@supabase/supabase-js";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";

/**
 * True iff `userId` is present in public.admins. Uses the service-role client
 * (bypasses RLS) — the table is intentionally unreadable by anon/authenticated,
 * so this is the only valid lookup path. Fails CLOSED (returns false) on any
 * error so a transient DB issue can never grant access.
 */
export async function requireAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  try {
    const svc = createServiceSupabase();
    const { data, error } = await svc
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("[admin-auth] admins lookup failed:", error.message);
      return false;
    }
    return !!data;
  } catch (e) {
    console.error("[admin-auth] requireAdmin error:", (e as Error).message);
    return false;
  }
}

/**
 * Server-side admin gate for Server Components, route handlers, and server
 * actions. Returns the authenticated admin `User`, or null when the caller is
 * not signed in OR not an admin. ALWAYS verifies the session via getUser()
 * (which re-validates the JWT against Supabase, not just cookie existence) and
 * then the admins table.
 *
 * Pages should call this and `notFound()` when it returns null — that hides the
 * very existence of the admin surface (no 403 that confirms it's there).
 */
export async function getAdminUser(): Promise<User | null> {
  const ssr = await createServerSupabase();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return null;
  const ok = await requireAdmin(user.id);
  return ok ? user : null;
}

/**
 * Append a KVKK/GDPR audit row (service-role, non-blocking). Records which admin
 * looked at which user's data. Best-effort: never throws into the request path.
 */
export async function logAdminAudit(
  adminUserId: string,
  action: string,
  targetUserId?: string | null,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    const svc = createServiceSupabase();
    await svc.from("admin_audit").insert({
      admin_user_id: adminUserId,
      action,
      target_user_id: targetUserId ?? null,
      detail: detail ?? null,
    });
  } catch (e) {
    console.error("[admin-auth] audit log failed:", (e as Error).message);
  }
}
