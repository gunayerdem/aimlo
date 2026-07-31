import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAudit } from "@/lib/admin-auth";
import { checkRateLimit, grantRateBypass, revokeRateBypass } from "@/lib/api-auth";
import { isUuidV4 } from "@/lib/uuid";

export const dynamic = "force-dynamic";

// Admin-only: grant/revoke a runtime rate-limit bypass for a user. Gate is the
// admins table (getAdminUser); non-admins get 404 (surface hidden). Audited.
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Rate-limit (B65, 2026-07-31): RATE_LIMITS.admin tanımlıydı ama hiçbir admin
  // route'una bağlı değildi (ölü konfig). Bu route her çağrıda Upstash'e yazıyor.
  const rl = await checkRateLimit(admin.id, "admin");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
    );
  }

  let body: { userId?: string; grant?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  // UUID doğrulaması (B66, 2026-07-31): önceden herhangi bir boş-olmayan string
  // doğrudan `aimlo:rl_bypass` set'ine yazılıyordu. Set'in TTL'i yok, temizliği
  // yok — typo/çöp değerler kalıcı birikiyordu ve isRateBypassed her limit
  // aşımında bu set'i sorguluyor; ayrıca yanlış yapıştırılan bir id başka bir
  // kullanıcıya süresiz sınırsız AI hakkı veriyordu. Supabase user_id'leri
  // UUID v4 (gen_random_uuid) — formatı tutmayan girdi ARTIK set'e hiç girmiyor.
  // Kapı YALNIZ grant'ta: revoke, set'te hâlihazırda duran çöp değerleri
  // temizleyebilmek için serbest kalıyor (silme işlemi risk üretmez).
  if (body.grant && !isUuidV4(userId)) {
    return NextResponse.json({ error: "invalid_user_id" }, { status: 400 });
  }

  // B66 KAPANDI (2026-07-31): bypass artık SÜRESİZ DEĞİL. grantRateBypass
  // kullanıcı başına tekil anahtara 24 saatlik TTL ile yazıyor
  // (lib/api-auth.ts, RL_BYPASS_PREFIX + SETEX) → unutulan bir bypass
  // kendiliğinden düşer. Bu dosyada değişiklik gerekmedi; imzalar aynı.
  if (body.grant) await grantRateBypass(userId);
  else await revokeRateBypass(userId);

  void logAdminAudit(admin.id, body.grant ? "grant_rate_bypass" : "revoke_rate_bypass", userId);
  return NextResponse.json({ ok: true, userId, granted: !!body.grant });
}
