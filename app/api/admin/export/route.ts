import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAudit } from "@/lib/admin-auth";
import { getUsersList } from "@/lib/admin-data";
import { checkRateLimit } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// CSV formül-enjeksiyonu nötrleme (B130 / B20, 2026-07-31): username ve
// display_name kullanıcının kendi JWT'siyle PostgREST üzerinden serbestçe
// yazılabiliyor (profiles_self_update politikasında hiçbir CHECK yok), bu CSV ise
// softi'nin kendi iş istasyonunda Excel'de açılıyor. "=", "+", "-", "@" ile
// başlayan ya da tab/CR taşıyan bir hücreyi Excel FORMÜL olarak çalıştırır
// (=cmd|'/C ...'!A0, =WEBSERVICE(...)). Baştaki tehlikeli karakteri tek tırnakla
// nötrle, SONRA normal CSV alıntılamasını uygula.
function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Admin-only CSV export. Gate = admins table; non-admins 404. Audited.
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Rate-limit (B65 / B130, 2026-07-31): RATE_LIMITS.admin (30/dk) api-auth.ts:32'de
  // "defense-in-depth vs heavy aggregation abuse" yorumuyla tanımlıydı ama HİÇBİR
  // route'a bağlı değildi — yani yazılan koruma yoktu. Bu route TÜM kullanıcıların
  // e-postasını CSV döküyor ve arkasında getUsersList() 50 sayfaya kadar
  // listUsers() dönüyor; ele geçirilmiş/açık kalmış bir admin oturumu sınırsız PII
  // dökümü + ciddi Supabase yük çarpanı demekti.
  const rl = await checkRateLimit(admin.id, "admin");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
    );
  }

  const type = req.nextUrl.searchParams.get("type") ?? "users";

  const rows = await getUsersList();
  // Denetim izine satır sayısı (B65, 2026-07-31): anormal hacimli dökümler
  // admin_audit.detail'den görülebilsin diye audit çağrısı satırlar
  // çekildikten SONRA, detail ile atılıyor.
  void logAdminAudit(admin.id, `export_${type}`, null, { rows: rows.length });
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
