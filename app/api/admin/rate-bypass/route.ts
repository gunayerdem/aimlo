import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAudit } from "@/lib/admin-auth";
import { grantRateBypass, revokeRateBypass } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// Admin-only: grant/revoke a runtime rate-limit bypass for a user. Gate is the
// admins table (getAdminUser); non-admins get 404 (surface hidden). Audited.
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: { userId?: string; grant?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (body.grant) await grantRateBypass(userId);
  else await revokeRateBypass(userId);

  void logAdminAudit(admin.id, body.grant ? "grant_rate_bypass" : "revoke_rate_bypass", userId);
  return NextResponse.json({ ok: true, userId, granted: !!body.grant });
}
