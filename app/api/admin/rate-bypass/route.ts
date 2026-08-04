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

  // ── Gövde boyu kapısı (güvenlik denetimi beta4, 2026-08-04) ──
  // NEDEN: aşağıdaki invariant fix'i kota kapısını gövde parse'ının ALTINA
  // taşıyor; yani revoke yolunda `req.json()` artık sayaçla sınırlanmıyor.
  // Next 16 App Router route handler'larında gövde boyu için yerleşik bir
  // tavan YOK (`bodyParser.sizeLimit` yalnız Pages Router'daydı), dolayısıyla
  // kotasız kalan parse yolunu bir sınırla telafi ediyoruz. Meşru gövde
  // ~60 bayt (app/admin/RateBypassToggle.tsx:17 → {"userId","grant"}) ve
  // docs/LAUNCH_RUNBOOK.md:115 aynı şekli tarif ediyor; 4 KB tavanın altında
  // hiçbir gerçek çağrı yok. Content-Length YOKSA (chunked) reddetmiyoruz —
  // fail-open, meşru istemciyi kırmamak için. Admin kapısının ALTINDA:
  // yetkisiz kullanıcı bu kodun hiçbirine ulaşamaz.
  const declaredLen = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLen) && declaredLen > 4096) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: { userId?: string; grant?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Dal koşulu TEK KAYNAK: eski kod `if (body.grant) ... else ...` ile truthy
  // kontrol yapıyordu — davranış birebir korunsun diye aynı predicate.
  // (Gerçek çağıranlar zaten boolean gönderiyor: RateBypassToggle.tsx:17
  // `grant: !on`, runbook `"grant": true` / `grant:false`.)
  const isGrant = !!body.grant;

  // ── Kota kapısı YALNIZ grant'ta (güvenlik denetimi beta4, 2026-08-04) ──
  // Rate-limit'in kendisi B65'te (2026-07-31) eklendi: RATE_LIMITS.admin
  // tanımlıydı ama hiçbir admin route'una bağlı değildi (ölü konfig).
  // BULGU: kapı HEM grant HEM revoke için, gövde parse edilmeden ÖNCE
  // çalışıyordu — bu, lib/api-auth.ts:127-131'de yazılı invariant'ı ihlal
  // ediyordu (birebir alıntı):
  //   "⚠ TAM GARANTİ İÇİN ROUTE TARAFI: bu dosya yalnız tavanı yükseltebilir;
  //    'revoke HER DURUMDA çalışsın' güvencesi app/api/admin/rate-bypass/
  //    route.ts içinde, kota kapısını yalnız `body.grant === true` iken
  //    uygulayarak (ya da revoke dalını kapının ÜSTÜNE alarak) tamamlanmalı.
  //    Geri alma işlemi ne AI ne PII maliyeti üretir; kısıtlanması yalnız
  //    zarar verir."
  // Somut zarar: günlük kova anahtarı `daily:<user>:admin:<gün>` /admin/export
  // ile PAYLAŞIMLI (api-auth.ts:113-125). Aynı gün 60 admin çağrısı yapılmışsa
  // 61. çağrı 429 alır; o çağrı bir bypass GERİ ALMA'sı ise verilmiş bir
  // rate-limit muafiyetini kapatmak İMKÂNSIZLAŞIR — yani kota, bir güvenlik
  // kontrolünü ulaşılmaz kılıyordu. Revoke acil bir güvenlik işlemidir.
  // ATLANAN YALNIZ KOTA KAPISI: auth + admin doğrulaması (getAdminUser,
  // yukarıda, gövde parse'ından ÖNCE) hiçbir koşulda atlanmıyor. Grant yolu
  // AYNEN eskisi gibi kotaya tabi (maliyet/abuse tavanı orada duruyor).
  if (isGrant) {
    const rl = await checkRateLimit(admin.id, "admin");
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
      );
    }
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
  if (isGrant && !isUuidV4(userId)) {
    return NextResponse.json({ error: "invalid_user_id" }, { status: 400 });
  }

  // B66 KAPANDI (2026-07-31): bypass artık SÜRESİZ DEĞİL. grantRateBypass
  // kullanıcı başına tekil anahtara 24 saatlik TTL ile yazıyor
  // (lib/api-auth.ts, RL_BYPASS_PREFIX + SETEX) → unutulan bir bypass
  // kendiliğinden düşer. Bu dosyada değişiklik gerekmedi; imzalar aynı.
  if (isGrant) await grantRateBypass(userId);
  else await revokeRateBypass(userId);

  void logAdminAudit(admin.id, isGrant ? "grant_rate_bypass" : "revoke_rate_bypass", userId);
  // Yanıt şekli DEĞİŞMEDİ: `granted: !!body.grant` ile isGrant birebir aynı değer.
  return NextResponse.json({ ok: true, userId, granted: isGrant });
}
