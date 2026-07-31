// Ücretsiz katman kotası — server-only. (2026-07-20, softi kararı)
//
// MODEL: Ücretsiz hesap haftada **3 MAÇ** analiz edebilir. AIMLO+ aboneliğinde
// ADİL KULLANIM tavanı geçerlidir (ayda 100 maç). Birim MAÇ'tır, ölüm değil —
// bir maçın tüm ölümleri + maç-sonu raporu tek hak sayılır (kullanıcı ürünün
// tam döngüsünü 3 kez yaşar).
//
// ADİL KULLANIM (2026-07-31, denetim B14): AIMLO+ önceden "sınırsız"dı. Ölçülen
// birim ekonomi ~$0.08–0.12/maç; $9.99'da (Paddle kesintisi sonrası ~$9 net)
// başa baş ≈ 100 maç/ay. Mevcut günlük rate-limit tavanları (vision 100/gün =
// 5 maç/gün ≈ 150 maç/ay) ZARAR ürettirebiliyordu. Bu yüzden abone tarafına da
// maç-bazlı tavan kondu: aynı SET altyapısı, aylık pencere, çok yüksek limit —
// tipik abone (3-4 maç/gün) tavanı GÖRMEZ, yalnız uç kullanım kesilir.
//
// ⚠️ ŞU AN KAPALI. Kapı yalnızca FREE_TIER_ENFORCED="true" env'i varken
// çalışır. Beta boyunca herkes sınırsız (softi: "betada sınırsız olacak").
// Bayrak İLK kontrol edilir → beta'da tek ağ çağrısı bile yapılmaz.
//
// SAYAÇ: Upstash SET, ISO hafta anahtarlı. Aynı match_id ikinci kez gelirse
// hak YENİDEN düşmez — bir maçta 10+ vision çağrısı olur, hepsi aynı hakkı
// kullanır; vision ve report aynı SET'i paylaşır (aynı maç iki hak yakmaz).
//
// GÜVENLİK DENETİMİ 2026-07-20 — kapatılan bulgular:
//   C1 matchId'siz istek kotayı TAMAMEN atlıyordu (istemci alanı opsiyonel →
//      curl ile sınırsız analiz, ~$15/ay/hesap kaçak). Artık günlük kovaya
//      düşüyor: kimliksiz istekler günde 1 hak yakar, eski istemci kilitlenmez.
//   H2 timeout yoktu → Upstash asılırsa istek maxDuration(90s) boyunca beklerdi.
//      Her çağrıda 2s AbortController (emsal: api-auth.ts).
//   H4 subscriptions tablosu yokken herkes "free" sayılıyordu → bayrak
//      migration'dan önce açılırsa ödeme yapan dâhil herkes kilitlenirdi.
//      Artık tablo yoksa FAIL-OPEN (paywall zorlanmaz) + console.error.
//   M1 reddedilen denemeler sayacı şişiriyordu → önce SISMEMBER/SCARD ile
//      karar, hak ancak yer varsa yazılır.
//   M2 matchId case-normalize edilmiyordu (report route lowercase yapıyor,
//      vision yapmıyordu → aynı maç iki üye = iki hak).
//
// FAIL-OPEN tercihi: Upstash/abonelik erişilemezse kota AÇILIR. Burası bir
// güvenlik sınırı değil, ticari kota; altyapı arızasında ödeme yapan/yapmayan
// herkesi kilitlemek birkaç bedava analizden kötüdür. (Karşılaştır:
// lib/api-auth.ts kötüye-kullanım rate-limit'i prod'da FAIL-CLOSED.)
import "server-only";

import { getSubscriptionState } from "@/lib/billing";

/** Ücretsiz hesabın haftalık maç analizi hakkı. */
export const FREE_WEEKLY_MATCH_QUOTA = 3;

/** AIMLO+ adil kullanım tavanı — takvim ayı başına maç analizi (B14, 2026-07-31).
 *  Başa baş noktasının (~100 maç/ay) üstünde kalan uç kullanımı keser; günde
 *  3 maç oynayan bir abone (≈90/ay) tavanı görmez. */
export const PLUS_MONTHLY_MATCH_QUOTA = 100;

const QUOTA_KEY_PREFIX = "aimlo:free_matches";
const PLUS_QUOTA_KEY_PREFIX = "aimlo:plus_matches";
/** 8 gün: haftalık pencere döndükten sonra anahtar kendiliğinden düşer. */
const QUOTA_TTL_SECONDS = 8 * 24 * 60 * 60;
/** 40 gün: aylık pencere döndükten sonra anahtar kendiliğinden düşer. */
const PLUS_QUOTA_TTL_SECONDS = 40 * 24 * 60 * 60;
/** Upstash çağrısı başına üst sınır — asılı kalan istek tüm route'u bekletmesin. */
const UPSTASH_TIMEOUT_MS = 2000;

export type QuotaVerdict = {
  /** false ise istek reddedilmeli. */
  allowed: boolean;
  /** Kota kapısı devrede mi (env bayrağı). */
  enforced: boolean;
  /** Bu pencerede kullanılan farklı maç sayısı (bilinmiyorsa null). */
  used: number | null;
  limit: number;
  /** AIMLO+ katmanında mı (ücretsiz haftalık kotaya tabi DEĞİL).
   *  DİKKAT (B14): artık "hiç sınır yok" demek DEĞİL — abone de aylık adil
   *  kullanım tavanına tabi. Katman ayrımı için `tier`e bak. */
  unlimited: boolean;
  /** Hangi katmanın kotası uygulandı (2026-07-31 eklendi — mevcut alanlar aynen durur). */
  tier: "free" | "plus";
  /** HANGİ tavana çarpıldı — 402 mesajını route'un doğru seçebilmesi için.
   *
   *  KARŞI-DENETİM 2026-07-31 (R14): B14 ile abone tarafına da aylık adil
   *  kullanım tavanı konmuştu, ama 402 mesajını üreten iki route (app/api/ai/
   *  vision/route.ts ve app/api/ai/report/route.ts) tek bir sabit metin
   *  yazıyor: "Ücretsiz hesabın haftalık N maç analizi hakkı doldu. AIMLO+ ile
   *  sınırsız analiz al." → tavana çarpan PARA ÖDEYEN aboneye "ücretsiz
   *  hesabın" denip üstüne "abone ol" satışı yapılıyordu. Verdict'te katman
   *  zaten vardı (`tier`) ama anlamı ikili: kota kapısına özgü, tek anlamlı bir
   *  ayraç lazımdı — route `verdict.reason` ile mesajı dallandırır.
   *    "free_tier" → ücretsiz haftalık hak doldu (yükseltme CTA'sı YERİNDE)
   *    "fair_use"  → AIMLO+ aylık adil kullanım tavanı doldu (CTA YOK; yalnız
   *                  tavan + `resetsAt` bilgisi verilir)
   *  Alan `allowed:true` iken de dolu gelir; anlamı "bu istekte hangi kova
   *  uygulanıyor"dur, kendi başına bir ret sinyali DEĞİLDİR. */
  reason: "free_tier" | "fair_use";
  /** Geçerli pencerenin bitişi (ISO) — istemci "ne zaman sıfırlanır" diyebilsin. */
  resetsAt: string | null;
};

/** Kota kapısı açık mı? Varsayılan KAPALI — env açıkça "true" olmalı. */
export function isFreeTierEnforced(): boolean {
  return process.env.FREE_TIER_ENFORCED === "true";
}

function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/** ISO hafta anahtarı: "2026-W29". Pazartesi başlangıçlı, UTC, yıl sınırında doğru.
 *  (Denetim doğruladı: 2027-01-01 → 2026-W53, 2027-01-04 → 2027-W01.) */
export function isoWeekKey(d: Date = new Date()): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day); // ISO: perşembeye kaydır
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Bulunulan ISO haftasının bitişi (gelecek pazartesi 00:00 UTC). */
function weekResetsAt(now: Date = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay() || 7; // pazartesi=1 … pazar=7
  d.setUTCDate(d.getUTCDate() + (8 - day));
  return d.toISOString();
}

/** Takvim ayı anahtarı: "2026-07" (UTC) — AIMLO+ adil kullanım penceresi. */
export function monthKey(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Bulunulan takvim ayının bitişi (gelecek ayın 1'i 00:00 UTC). */
function monthResetsAt(now: Date = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

async function upstash(path: string): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  // Her çağrıya AYRI controller (api-auth.ts'teki paylaşılan-controller
  // kilitlenme yarışının dersi).
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTASH_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`upstash ${res.status}`);
    const d = (await res.json()) as { result?: unknown };
    return d?.result;
  } finally {
    clearTimeout(timer);
  }
}

function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v ?? 0);
}

/**
 * Maç-SET'i üzerinden tek hak tüketimi (ücretsiz ve AIMLO+ için ORTAK).
 *
 * M1 kuralı korunur: önce KARAR, sonra yazma — reddedilen deneme sayacı
 * şişirmez. Aynı maç ikinci kez gelirse hak yeniden düşmez.
 * Hata durumunda `null` döner; çağıran FAIL-OPEN yapar (dosya başındaki gerekçe).
 */
async function consumeMatchSlot(
  key: string,
  member: string,
  limit: number,
  ttlSeconds: number,
): Promise<{ allowed: boolean; used: number } | null> {
  const k = encodeURIComponent(key);
  const m = encodeURIComponent(member);
  try {
    const already = num(await upstash(`sismember/${k}/${m}`)) === 1;
    const used = num(await upstash(`scard/${k}`));
    // Bu maç zaten sayılmış — sonraki tüm çağrıları bedava.
    if (already) return { allowed: true, used };
    if (used >= limit) return { allowed: false, used };
    await upstash(`sadd/${k}/${m}`);
    await upstash(`expire/${k}/${ttlSeconds}`);
    return { allowed: true, used: used + 1 };
  } catch (e) {
    console.error("[entitlements] quota check failed — allowing:", (e as Error).message);
    return null;
  }
}

/**
 * Bu maç analiz edilebilir mi?
 *
 * Sıra: bayrak → abonelik → sayaç. Bayrak kapalıysa hiçbir ağ çağrısı yapılmaz.
 * vision ve report AYNI anahtarı kullanır → bir maç tek hak yakar.
 */
export async function checkMatchQuota(
  userId: string,
  matchId: string | null | undefined,
): Promise<QuotaVerdict> {
  const base: QuotaVerdict = {
    allowed: true,
    enforced: false,
    used: null,
    limit: FREE_WEEKLY_MATCH_QUOTA,
    unlimited: false,
    tier: "free",
    reason: "free_tier",
    resetsAt: null,
  };

  if (!isFreeTierEnforced()) return base;               // beta: kapı kapalı
  const enforcedBase = { ...base, enforced: true, resetsAt: weekResetsAt() };
  if (!userId) return enforcedBase;
  if (!isUpstashConfigured()) {
    // Bayrak açık ama sayaç deposu yok — paywall sessizce kapalı kalmasın.
    console.error("[entitlements] FREE_TIER_ENFORCED açık ama UPSTASH_* eksik — kota UYGULANMIYOR");
    return enforcedBase;
  }

  // C1 fix: matchId yoksa muaf DEĞİL — günlük kovaya düşer. Kimliksiz istemci
  // günde 1 hak yakar (eski sürüm kilitlenmez, sınırsız kaçak kapanır).
  const member = (matchId ?? `nomatch:${new Date().toISOString().slice(0, 10)}`).toLowerCase();

  // AIMLO+ abonesi → ücretsiz haftalık kotadan muaf, AMA aylık adil kullanım
  // tavanına tabi (B14). Tablo yoksa (migration uygulanmamış) paywall'ı ZORLAMA.
  try {
    const state = await getSubscriptionState(userId);
    if (!state.ready) {
      console.error("[entitlements] subscriptions tablosu yok — kota UYGULANMIYOR (migration bekliyor)");
      return enforcedBase;
    }
    if (state.active) {
      const plusBase: QuotaVerdict = {
        ...enforcedBase,
        unlimited: true,
        tier: "plus",
        // R14 (karşı-denetim 2026-07-31): abone tavanı ADİL KULLANIM'dır —
        // route buradan mesajı ayırt eder, ödeme yapana "abone ol" DENMEZ.
        reason: "fair_use",
        limit: PLUS_MONTHLY_MATCH_QUOTA,
        resetsAt: monthResetsAt(),
      };
      const slot = await consumeMatchSlot(
        `${PLUS_QUOTA_KEY_PREFIX}:${userId}:${monthKey()}`,
        member,
        PLUS_MONTHLY_MATCH_QUOTA,
        PLUS_QUOTA_TTL_SECONDS,
      );
      if (!slot) return plusBase; // FAIL-OPEN — ödeme yapan asla altyapı arızasıyla kilitlenmez
      if (!slot.allowed) {
        console.warn(
          `[entitlements] AIMLO+ adil kullanım tavanı doldu — user=${userId.slice(0, 8)} used=${slot.used}/${PLUS_MONTHLY_MATCH_QUOTA}`,
        );
      }
      return { ...plusBase, allowed: slot.allowed, used: slot.used };
    }
  } catch (e) {
    console.error("[entitlements] subscription lookup failed — kota UYGULANMIYOR:", (e as Error).message);
    return enforcedBase;
  }

  const slot = await consumeMatchSlot(
    `${QUOTA_KEY_PREFIX}:${userId}:${isoWeekKey()}`,
    member,
    FREE_WEEKLY_MATCH_QUOTA,
    QUOTA_TTL_SECONDS,
  );
  if (!slot) return enforcedBase; // FAIL-OPEN (dosya başındaki gerekçe)
  return { ...enforcedBase, allowed: slot.allowed, used: slot.used };
}
