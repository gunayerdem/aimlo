import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Shared API utilities: auth verification + rate limiting.
 *
 * Production: Upstash Redis (REQUIRED in prod) — set UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN. Both per-minute rate windows AND per-day quotas
 * use Redis INCR with TTL — surviving cold starts and parallel lambdas.
 *
 * Dev fallback: in-memory only used when Upstash env vars are unset
 * (local dev convenience). In prod we FAIL CLOSED if Upstash is configured
 * but unreachable, instead of silently degrading to per-lambda memory which
 * would let an attacker bypass quotas by burst-spawning concurrent calls.
 */

// Set to "true" in env to force production strictness even without Upstash configured.
// (Intended for staging.) When unset and Upstash is unavailable, prod still
// fails closed if NODE_ENV === "production".
const STRICT_RATE_LIMIT = process.env.STRICT_RATE_LIMIT === "true";

// ── Rate limiting configuration ──

type RouteKey = "feedback" | "report" | "vision" | "insight" | "ask" | "telemetry" | "admin" | "support" | "default";

const RATE_LIMITS: Record<RouteKey, { window: number; max: number }> = {
  feedback:  { window: 60, max: 15 }, // 15/min
  report:    { window: 60, max: 5 },  // 5/min (more expensive)
  // 6/min (beta 2026-06-26: bir maçta ölümler kümelenebilir; 4→6 nefes payı).
  // Maliyet: ~$0.0024/çağrı — ÖLÇÜLDÜ 2026-07-31 (B76/B55), eski "~$0.0015-0.002" tahmini bayattı.
  vision:    { window: 60, max: 6 },
  insight:   { window: 60, max: 10 }, // 10/min
  // B61/F79 (pano özellik dalgası, 2026-08-04): "Koça sor" tek-soru follow-up.
  // 4/dk BİLİNÇLİ dar: özellik sohbet DEĞİL (tek soru → tek cevap, geçmiş tur
  // yok); rapor/round başına 1-2 soru gerçek kullanımdır, 4/dk bunu bol bol
  // karşılar ama script'lenmiş soru-yağmurunu dakika kapısında keser.
  ask:       { window: 60, max: 4 },
  telemetry: { window: 60, max: 60 }, // 60/min — generous, telemetry must not eat user's AI quota
  admin:     { window: 60, max: 30 }, // 30/min — owner panel; defense-in-depth vs heavy aggregation abuse
  support:   { window: 60, max: 5 },  // 5/min — Destek form; abuse/spam guard (no AI cost, just storage)
  default:   { window: 60, max: 20 },
};

// Daily quotas. Routes not listed have no daily cap (only per-minute).
//
// ── MALİYET TAVANI — ÖLÇÜLDÜ 2026-07-31 (B55/B76) ──
// Tek kanonik kaynak: `npx tsx scripts/measure-quota-cost.ts` (KB'yi gerçek
// loader'dan ölçer, fiyatı lib/openai-pricing.ts'ten okur). Elle tahmin YOK.
// Eski "~$0.20/gün üst sınır/kullanıcı" yorumu YANLIŞTI: yalnız vision'ı
// sayıyordu ve KB büyüdükçe bayatlamıştı — hesap geneli tavan 20× daha yüksekti.
//
//   route      $/çağrı    × günlük kota   = $/gün/kullanıcı
//   vision     ~$0.0024   × 100           = $0.24   (prompt-cache %86 ile)
//   report     ~$0.0183   ×  10           = $0.18   (B2: kota 30→10, 2026-08-04)
//   insight    ~$0.0062   ×  60           = $0.37
//   ask        ≤$0.0062   ×  20           ≤ $0.12   (ÜST SINIR — aşağıdaki B61 notuna bak)
//   ────────────────────────────────────────────────
//   EN-KÖTÜ GÜN / KULLANICI                ≈ $0.91  (ask üst-sınırıyla; B2 öncesi $1.16; B29 öncesi $4.18)
//
// B61/F79 ask satırı notu (pano özellik dalgası, 2026-08-04): ask HENÜZ
// scripts/measure-quota-cost.ts ile ÖLÇÜLMEDİ (route bu dalgada doğdu; script
// kopyası bu paketin DIŞINDA — ana oturum script'e "ask" ekleyip yeniden
// koşmalı). Tablodaki $/çağrı bir tahmin DEĞİL, KANITLI ÜST SINIRDIR: ask
// prompt'u insight'ın KESİN alt kümesinden küçüktür (KB bloğu YOK, context
// ≤ ~4.3KB whitelist-kırpılmış string + soru ≤300 karakter, çıktı 1-3 cümle
// ~150 token tavanlı) → per-çağrı maliyet insight'ın ölçülmüş $0.0062'sinin
// altında kalmak ZORUNDA. 20×$0.0062 = $0.12/gün en-kötü tavan.
//
// B2 tablo notu (pano dalga, 2026-08-04): $/çağrı değerleri 2026-07-31
// ölçümünden AYNEN alındı — kota değişikliği yalnız ÇARPANI etkiler (KB/prompt
// değişmedi, per-çağrı maliyet aynı), o yüzden ölçüm scripti yeniden
// koşulmadı (merkezî doğrulama ana oturumda). DİKKAT: scripts/
// measure-quota-cost.ts:32'deki DAILY_QUOTA kopyasında report hâlâ 30 —
// o dosya bu fix paketinin DIŞINDA; ana oturum elle senkronlamalı.
//
// feedback satırı B32 (2026-07-31) ile tablodan DÜŞTÜ — route 410 Gone, AI
// maliyeti sıfır (aşağıdaki nota bak). admin route'unun AI maliyeti yoktur,
// kotası maliyet değil PII-döküm tavanı olduğu için tabloda yer almaz.
//
// KURAL: buradaki kotaları değiştirirsen ölçüm scriptini yeniden koş ve bu
// tabloyu güncelle (script içindeki DAILY_QUOTA kopyası da elle senkronlanır).
const DAILY_QUOTA: Partial<Record<RouteKey, number>> = {
  // ── B32 (2026-07-31): `feedback` günlük kotası KALDIRILDI ──
  // NEDEN: app/api/ai/feedback/route.ts artık ilk satırda 410 Gone dönüyor
  // (ROUTE_RETIRED) — verifyAuthAndRateLimit'e HİÇ ulaşılmıyor, yani bu kota
  // ölü konfigdi ve "feedback günde 30 AI çağrısı yapabilir" diye YANLIŞ bir
  // maliyet izlenimi veriyordu. RouteKey'deki "feedback" ve RATE_LIMITS.feedback
  // BİLEREK duruyor: route canlandırılırsa kapı hazır olsun + başka referanslar
  // kırılmasın. Route geri açılırsa buraya kotayı geri eklemeyi UNUTMA.
  // ── B2 (pano dalga, 2026-08-04): report 30 → 10 ──
  // NEDEN: report maç başına 1 çağrıdır; yoğun bir günde bile 8 maç = 8 report,
  // 10 bol pay bırakır. report EN PAHALI route (~$0.0183/çağrı — ölçüm
  // 2026-07-31, B55/B76); 30'luk tavan kullanılmayan ~$0.37/gün'lük ek harcama
  // yüzeyi açıyordu (sızmış JWT senaryosunda fatura tavanı). Desktop sözleşmesi
  // DEĞİŞMEDİ: aşımda aynı 429 + "Daily quota exceeded" + Retry-After yolu,
  // yalnız eşik indi. Vision 100/gün BİLEREK aynen (beta kararı softi'nin).
  report:    10,
  vision:    100, // beta 2026-06-26: 30→100 (~6-10 maç/gün; 30 ~2 maçta bitiyordu). Ölçülen tavan $0.24/gün; /cost panelinden izle
  insight:   60,
  // B61/F79 (pano özellik dalgası, 2026-08-04): "Koça sor" günlük kotası.
  // 20/gün: bir günde ~8 maç × 2 soru gerçekçi tavanın üstünde; maliyet tavanı
  // yukarıdaki tabloda (≤$0.12/gün üst sınır). Bu kota FREE_TIER_ENFORCED
  // bayrağından BAĞIMSIZ her zaman uygulanır (checkRateLimit DAILY_QUOTA yolu
  // entitlements'a hiç bakmaz) — beta dâhil sabittir; sözleşme gereği aşımda
  // 429 + "Daily quota exceeded" + Retry-After döner.
  ask:       20,
  telemetry: 1000, // generous — desktop batches every 24h, but instrumentation can fire often during a long session
  support:   20, // 20/day — a real user won't file 20 support tickets a day; caps spam
  // B65 (2026-07-31): admin route'larının günlük tavanı YOKTU — yalnız 30/dk
  // vardı, yani ele geçen bir admin oturumu gün boyu 43.200 çağrı yapıp
  // /api/admin/export üzerinden kullanıcı verisini sınırsız dökebilirdi.
  //
  // ── KARŞI-DENETİM 2026-07-31 (R13): 10 → 60 ──
  // NEDEN: günlük kova anahtarı `daily:<user>:admin:<gün>` — yani "admin"
  // ROUTE ANAHTARI /api/admin/export ile /api/admin/rate-bypass ARASINDA
  // PAYLAŞILIYOR. 10'luk tavanla softi aynı gün 10 CSV indirirse 11. admin
  // çağrısı 429 alır ve o çağrı bir bypass GERİ ALMA'sı olabilir → verilmiş bir
  // rate-limit bypass'ını kapatmak imkânsızlaşır. Yani maliyet/PII tavanı diye
  // konan kota, BİR GÜVENLİK KONTROLÜNÜ ulaşılmaz hâle getiriyordu; B65'in
  // kendi getirdiği regresyon buydu.
  // 60/gün: kurucu panelinin gerçek kullanımının (birkaç döküm + birkaç bypass
  // işlemi) hâlâ çok üstünde; 30/dk pencere kapısı burst'ü zaten sınırlıyor;
  // otomatik kitle-sızdırmanın (43.200/gün) çok altında kalıyor. Ayrıca export
  // her çağrıda AYNI tam listeyi döküyor — N kat döküm N kat veri değil, o
  // yüzden tavanı 60'a çıkarmak sızdırma yüzeyini genişletmiyor.
  //
  // ⚠ TAM GARANTİ İÇİN ROUTE TARAFI: bu dosya yalnız tavanı yükseltebilir;
  // "revoke HER DURUMDA çalışsın" güvencesi app/api/admin/rate-bypass/route.ts
  // içinde, kota kapısını yalnız `body.grant === true` iken uygulayarak (ya da
  // revoke dalını kapının ÜSTÜNE alarak) tamamlanmalı. Geri alma işlemi ne AI
  // ne PII maliyeti üretir; kısıtlanması yalnız zarar verir.
  admin:     60,
};

// ── DEV_USER_ALLOWLIST KALDIRILDI (B7/B75 — 2026-07-31) ──
//
// NEDEN: beta bitti, ürün v1.0.7 ile halka açık. Env tabanlı bypass
// `checkRateLimit`'in EN BAŞINDA duruyordu ve listedeki user_id için
// per-dakika + günlük kota + per-IP kontrollerinin HİÇBİRİ çalışmıyordu
// (vision/report/feedback/insight/telemetry/support dâhil her route).
// O hesabın JWT'si sızarsa sınırsız AI harcaması yapılabilirdi.
//
// Env'i Vercel'den silmek yetmiyordu: yanlışlıkla geri eklenirse bypass
// sessizce canlanırdı. Bu yüzden KODDAN kaldırıldı — env artık okunmuyor.
//
// YERİNE: aşağıdaki `grantRateBypass` (admin paneli, TTL'li Upstash anahtarı —
// B66/2026-07-31 ile SET'ten taşındı) — aynı yetenek, runtime'da verilip geri
// alınabilir, redeploy gerektirmez, denetlenebilir ve 24 saatte kendi kendine
// sönümlenir. Test seansı için onu kullan.

// ── Admin-granted rate-limit bypass (Upstash, TTL'li tekil anahtar) ──
// Runtime-editable from the admin panel (no redeploy).
// CHECKED ONLY on the rate-limit-EXCEEDED path → zero cost for normal traffic.
// Bypass per-minute + daily + per-IP kapılarının hepsini atlar. Kaldırılan
// DEV_USER_ALLOWLIST'in tek meşru halefi (B7/B75, 2026-07-31).
//
// B66 (2026-07-31): eskiden TTL'siz bir SET (`aimlo:rl_bypass`) kullanılıyordu →
// bir kez verilen bypass SÜRESİZ yaşıyordu. Admin panelinden "geri al"a
// basılmadıkça o hesap sınırsız AI harcayabilirdi; JWT'si sızarsa fatura tavanı
// diye bir şey kalmıyordu (kaldırılan DEV_USER_ALLOWLIST ile aynı risk, sadece
// runtime'a taşınmış hâli). Artık kullanıcı başına TEKİL anahtar + SETEX TTL:
// bypass kendi kendine sönümlenir, "unutulmuş bypass" diye bir durum olamaz.
//
// ⚠ ESKİ SET BİLİNÇLİ OLARAK OKUNMUYOR: geriye dönük uyumluluk için okusaydık
// tam da kapatmak istediğimiz süresiz bypass'ları yaşatmış olurduk. Eski set
// üyeleri bu deploy ile GEÇERSİZ; ihtiyaç varsa panelden yeniden verilir.
const RL_BYPASS_PREFIX = "aimlo:rl_bypass:";
// 24 saat — bir test/destek seansına fazlasıyla yeter; panelden tekrar verilebilir.
const RL_BYPASS_TTL_SEC = 86_400;
// Yalnız temizlik için tutuluyor: revoke, eski TTL'siz set'te kalmış üyeleri de
// silebilsin (okuma yolunda ARTIK kullanılmıyor — yukarıdaki uyarıya bak).
const RL_BYPASS_LEGACY_SET = "aimlo:rl_bypass";

function bypassKey(userId: string): string {
  return `${RL_BYPASS_PREFIX}${encodeURIComponent(userId)}`;
}

/** Fire-and-forget Upstash REST komutu (bypass yönetimi). Hata yutulur — eski davranış. */
async function upstashBypassCmd(path: string): Promise<void> {
  if (!isUpstashConfigured()) return;
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  await fetch(`${url}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** True iff the admin granted this user a runtime rate-limit bypass. Fail-safe (false on error). */
async function isRateBypassed(userId: string): Promise<boolean> {
  if (!isUpstashConfigured()) return false;
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL!;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
    // B66: SISMEMBER → GET. Anahtar TTL dolunca kendiliğinden yok olur, yani
    // "bypass süresi doldu" durumu ayrı bir temizlik işi gerektirmiyor.
    const res = await fetch(`${url}/get/${bypassKey(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const d = await res.json();
    return d?.result === 1 || d?.result === "1";
  } catch {
    return false;
  }
}

/**
 * Admin actions (called from the admin panel only, behind requireAdmin).
 * B66 (2026-07-31): imzalar ve dönüş şekli AYNEN korundu — admin panelindeki
 * "bypass ver / geri al" akışı (app/api/admin/rate-bypass/route.ts) değişmiyor;
 * yalnız altındaki Redis temsili SET → SETEX'li tekil anahtara taşındı.
 */
export async function grantRateBypass(userId: string): Promise<void> {
  // SETEX <key> 86400 1 — TTL doğuştan geliyor, "expire koymayı unutma" yarışı yok.
  await upstashBypassCmd(`setex/${bypassKey(userId)}/${RL_BYPASS_TTL_SEC}/1`);
}
export async function revokeRateBypass(userId: string): Promise<void> {
  await upstashBypassCmd(`del/${bypassKey(userId)}`);
  // B66: eski TTL'siz set'te kalmış üyeyi de düşür. Okuma yolu artık o set'e
  // bakmıyor ama panelin "geri al" düğmesi eski kayıtları da temizleyebilsin
  // (admin route'undaki revoke bilerek UUID kapısının dışında bırakılmıştı).
  await upstashBypassCmd(`srem/${RL_BYPASS_LEGACY_SET}/${encodeURIComponent(userId)}`);
}
export async function isRateBypassedPublic(userId: string): Promise<boolean> { return isRateBypassed(userId); }

// In-memory fallback (dev only — see prod-strictness logic in checkRateLimit).
const memoryStore = new Map<string, { count: number; resetAt: number }>();
const dailyStore  = new Map<string, { count: number; resetAt: number }>();

let lastCleanup = Date.now();

function cleanupStores() {
  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    lastCleanup = now;
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
    for (const [key, entry] of dailyStore) {
      if (now > entry.resetAt) dailyStore.delete(key);
    }
  }
}

function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || STRICT_RATE_LIMIT;
}

// ── Upstash REST helpers (no SDK) ──

interface RateResult { allowed: boolean; remaining: number; degraded?: boolean }

/**
 * INCR + EXPIRE — TEK Upstash REST çağrısı (/pipeline). Başarıda sayacı döner,
 * ağ/HTTP hatasında THROW eder. Çağıran yakalayıp politikayı belirler
 * (prod'da fail-closed, dev'de bellek fallback).
 *
 * B102 (2026-07-31): eskiden ardışık İKİ fetch vardı (INCR sonra EXPIRE), ve bu
 * fonksiyon istek başına 3 kez çağrıldığı için (per-dakika + günlük + per-IP)
 * her AI isteğinden ÖNCE 6 seri REST round-trip koşuyordu (fra1→Upstash RTT×6
 * ≈ +60-180ms, ölüm anı feedback gecikmesine doğrudan ekleniyordu). Pipeline
 * ile round-trip 6→3'e indi, komut sayısı aynı kaldı.
 *
 * DAVRANIŞ BİREBİR KORUNDU:
 *  - INCR hatası / sayı-olmayan sonuç → throw (prod fail-closed yolu aynen).
 *  - EXPIRE hatası sayacı BOZMAZ → yalnız warn, count yine döner (eski davranış).
 *  - TTL her istekte yeniden uygulanır (count===1 şartı YOK): önceki bir EXPIRE
 *    başarısız olup TTL'siz anahtar bıraktıysa bir sonraki çağrı kendini iyileştirir.
 *    Bu kural olmadan anahtar sonsuza kadar yaşar ve kullanıcı kalıcı kilitlenir.
 *  - Tek AbortController artık güvenli: iki komut TEK istekte gittiği için eski
 *    "yavaş EXPIRE, uçuştaki INCR'ı iptal ediyor" yarışı yapısal olarak imkânsız.
 *
 * NOT: üç SAYACIN hepsini tek pipeline'a toplamak (6 komut/1 POST) bilerek
 * YAPILMADI — o zaman per-dakika kapısında zaten bloklanmış istekler de günlük
 * kotayı tüketirdi; bir retry fırtınası kullanıcıyı tüm gün kilitleyebilirdi.
 * Sayaçların sıralı erken-çıkış mantığı checkRateLimit'te aynen duruyor.
 */
async function upstashIncr(key: string, ttlSec: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Anahtar gövdede JSON string olarak gidiyor → URL-encode gerekmiyor.
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(ttlSec)],
      ]),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      throw new Error(`Upstash pipeline HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) {
      throw new Error(`Upstash pipeline unexpected body: ${JSON.stringify(data)}`);
    }

    const incr = data[0];
    if (incr?.error) {
      throw new Error(`Upstash INCR error: ${incr.error}`);
    }
    const count = incr?.result as number;
    if (typeof count !== "number") {
      throw new Error(`Upstash INCR returned non-number: ${JSON.stringify(incr)}`);
    }

    // EXPIRE hatası sayacı geçersiz kılmaz — eski koddaki gibi yalnız uyarı.
    const exp = data[1];
    if (exp?.error) {
      console.warn(`[Aimlo] Upstash EXPIRE failed for ${key}: ${exp.error}`);
    }

    return count;
  } finally {
    clearTimeout(tid);
  }
}

async function upstashRateCheck(key: string, limit: number, windowSec: number): Promise<RateResult> {
  try {
    const count = await upstashIncr(key, windowSec);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (e) {
    // In production: fail closed.
    if (isProduction()) {
      console.error("[Aimlo] Upstash rate check failed in production — failing closed:", (e as Error).message);
      throw new Error("rate-limiter-unavailable");
    }
    // Dev: log and degrade to memory (with degraded flag for caller awareness).
    console.warn("[Aimlo] Upstash rate check failed (dev) — falling back to memory:", (e as Error).message);
    const r = memoryRateCheck(key, limit, windowSec);
    return { ...r, degraded: true };
  }
}

function memoryRateCheck(key: string, limit: number, windowSec: number): RateResult {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }
  entry.count++;
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

// Daily quota — Upstash-backed in prod with TTL to next-midnight (UTC).
// Uses date-stamped key so the count auto-rolls without explicit reset logic.
async function dailyQuotaCheck(userId: string, route: string, maxDaily: number): Promise<RateResult> {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const dayKey = `${yyyy}-${mm}-${dd}`;
  const key = `daily:${userId}:${route}:${dayKey}`;

  // TTL = seconds until next UTC midnight + 60s buffer.
  const midnight = new Date(Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  const ttlSec = Math.max(60, Math.ceil((midnight.getTime() - now.getTime()) / 1000) + 60);

  if (isUpstashConfigured()) {
    try {
      const count = await upstashIncr(key, ttlSec);
      return { allowed: count <= maxDaily, remaining: Math.max(0, maxDaily - count) };
    } catch (e) {
      if (isProduction()) {
        console.error("[Aimlo] Upstash daily quota failed in production — failing closed:", (e as Error).message);
        throw new Error("rate-limiter-unavailable");
      }
      console.warn("[Aimlo] Upstash daily quota failed (dev) — memory fallback:", (e as Error).message);
    }
  }

  // Dev fallback (in-memory).
  const entry = dailyStore.get(key);
  if (!entry || now.getTime() > entry.resetAt) {
    dailyStore.set(key, { count: 1, resetAt: midnight.getTime() });
    return { allowed: true, remaining: maxDaily - 1, degraded: true };
  }
  entry.count++;
  return { allowed: entry.count <= maxDaily, remaining: Math.max(0, maxDaily - entry.count), degraded: true };
}

// Main rate limit function
export async function checkRateLimit(
  userId: string,
  route: RouteKey = "default",
  ip?: string
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number; reason?: string }> {
  cleanupStores();

  // B7/B75 (2026-07-31): dev-allowlist short-circuit BURADAN KALDIRILDI.
  // Artık HİÇBİR kullanıcı kapıları atlamıyor; tek bypass yolu admin
  // panelinden verilen `grantRateBypass` ve o da yalnızca limit AŞILDIĞINDA
  // kontrol ediliyor (aşağıda) — yani normal trafiğe ek maliyeti yok.
  const limits = RATE_LIMITS[route] || RATE_LIMITS.default;
  const dailyLimit = DAILY_QUOTA[route];

  try {
    // Per-user rate check
    const userKey = `rate:${userId}:${route}`;
    const rateResult = isUpstashConfigured()
      ? await upstashRateCheck(userKey, limits.max, limits.window)
      : memoryRateCheck(userKey, limits.max, limits.window);

    if (!rateResult.allowed) {
      if (await isRateBypassed(userId)) return { allowed: true, remaining: Number.MAX_SAFE_INTEGER };
      return { allowed: false, remaining: 0, retryAfter: limits.window, reason: "rate" };
    }

    // Daily quota check (Upstash in prod)
    if (dailyLimit) {
      const dailyResult = await dailyQuotaCheck(userId, route, dailyLimit);
      if (!dailyResult.allowed) {
        if (await isRateBypassed(userId)) return { allowed: true, remaining: Number.MAX_SAFE_INTEGER };
        return { allowed: false, remaining: 0, retryAfter: 3600, reason: "daily" };
      }
    }

    // Per-IP rate check (extra protection)
    if (ip) {
      const ipKey = `rate:ip:${ip}:${route}`;
      const ipResult = isUpstashConfigured()
        ? await upstashRateCheck(ipKey, limits.max * 3, limits.window)
        : memoryRateCheck(ipKey, limits.max * 3, limits.window);
      if (!ipResult.allowed) {
        if (await isRateBypassed(userId)) return { allowed: true, remaining: Number.MAX_SAFE_INTEGER };
        return { allowed: false, remaining: 0, retryAfter: limits.window, reason: "ip" };
      }
    }

    return { allowed: true, remaining: rateResult.remaining };
  } catch (e) {
    // Fail-closed (only thrown by Upstash helpers in production).
    if ((e as Error).message === "rate-limiter-unavailable") {
      return { allowed: false, remaining: 0, retryAfter: 30, reason: "service" };
    }
    throw e;
  }
}

// ── Auth verification ──
export async function verifyAuthAndRateLimit(
  request: NextRequest,
  route: RouteKey = "default",
): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Aimlo API] Missing Supabase env vars");
    return {
      ok: false,
      response: NextResponse.json({ error: "Server configuration error" }, { status: 500 }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }

  // IP for rate limiting. On Vercel, x-real-ip is the actual client IP set by
  // the platform proxy and CANNOT be spoofed by client headers — prefer it.
  // x-forwarded-for is client-controllable on Vercel (clients can set any
  // value via headers, Vercel only APPENDS the real IP at the END of the
  // chain). So if we must fall back to XFF, take the LAST element, not first.
  const xff = request.headers.get("x-forwarded-for");
  const xffLast = xff ? xff.split(",").pop()?.trim() : undefined;
  const ip = request.headers.get("x-real-ip") || xffLast || undefined;

  const rateResult = await checkRateLimit(user.id, route, ip);
  if (!rateResult.allowed) {
    const isDailyQuota = rateResult.reason === "daily";
    const isService = rateResult.reason === "service";
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: isService
            ? "Rate limiter unavailable — please retry shortly."
            : isDailyQuota
            ? "Daily quota exceeded"
            : "Too many requests. Please wait a moment.",
          retryAfter: rateResult.retryAfter,
        },
        {
          status: isService ? 503 : 429,
          headers: rateResult.retryAfter ? { "Retry-After": String(rateResult.retryAfter) } : {},
        },
      ),
    };
  }

  return { ok: true, userId: user.id };
}
