import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAudit } from "@/lib/admin-auth";
import { getUsersList } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Admin-only CSV export. Gate = admins table; non-admins 404. Audited.
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "not found" }, { status: 404 });

  const type = req.nextUrl.searchParams.get("type") ?? "users";
  void logAdminAudit(admin.id, `export_${type}`);

  const rows = await getUsersList();
  const header = ["user_id", "username", "email", "matches", "last_match", "last_sign_in", "created_at", "email_confirmed", "win_rate"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [r.userId, r.username, r.email, r.matches, r.lastMatch, r.lastSignIn, r.createdAt, r.emailConfirmed, r.winRate]
        .map(csvCell)
        .join(","),
    );
  }
  const csv = "﻿" + lines.join("\n"); // BOM for Excel UTF-8

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aimlo-users-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
