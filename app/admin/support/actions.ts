"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, logAdminAudit } from "@/lib/admin-auth";
import { createServiceSupabase } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_STATUS = new Set(["open", "in_progress", "resolved", "rejected"]);

/**
 * Toggle a support message between "open" and "resolved" from the admin panel.
 *
 * SECURITY: a server action is an independently-callable POST endpoint, so it
 * MUST NOT trust the /admin layout gate alone — it re-verifies the caller via
 * getAdminUser() (re-validates the JWT with getUser() AND checks public.admins
 * through the service-role client) itself. A non-admin caller is a silent no-op
 * (no 403 that would confirm the surface). `id` is uuid-validated and `status`
 * is whitelisted, so neither field can be turned into an injection or used to
 * write an arbitrary status. The UPDATE runs under the service-role client and
 * is scoped to a single row by id. Every change is recorded in admin_audit.
 */
export async function updateSupportStatus(formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return; // hard gate — never mutate for a non-admin

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID_RE.test(id) || !ALLOWED_STATUS.has(status)) return;

  const svc = createServiceSupabase();
  const { error } = await svc
    .from("support_messages")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("[admin support] status update failed:", error.message);
    return;
  }

  await logAdminAudit(admin.id, "support_status", null, { id, status });
  revalidatePath("/admin/support");
}
