// Ücretsiz katman kotası — server-only. (2026-07-20, softi kararı)
//
// MODEL: Ücretsiz hesap haftada **3 MAÇ** analiz edebilir. AIMLO Pro abonesinde
// sınır yok. Birim MAÇ'tır, ölüm değil — bir maçın tüm ölümleri + maç-sonu
// raporu tek hak sayılır (kullanıcı ürünün tam döngüsünü 3 kez yaşar).
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

const QUOTA_KEY_PREFIX = "aimlo:free_matches";
/** 8 gün: haftalık pencere döndükten sonra anahtar kendiliğinden düşer. */
const QUOTA_TTL_SECONDS = 8 * 24 * 60 * 60;
/** Upstash çağrısı başına üst sınır — asılı kalan istek tüm route'u bekletmesin. */
const UPSTASH_TIMEOUT_MS = 2000;

export type QuotaVerdict = {
  /** false ise istek reddedilmeli. */
  allowed: boolean;
  /** Kota kapısı devrede mi (env bayrağı). */
  enforced: boolean;
  /** Bu hafta kullanılan farklı maç sayısı (bilinmiyorsa null). */
  used: number | null;
  limit: number;
  /** Pro abone olduğu için sınırsız mı. */
  unlimited: boolean;
  /** Haftalık pencerenin bitişi (ISO) — istemci "ne zaman sıfırlanır" diyebilsin. */
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

  // Pro abone → sınırsız. Tablo yoksa (migration uygulanmamış) paywall'ı ZORLAMA.
  try {
    const state = await getSubscriptionState(userId);
    if (!state.ready) {
      console.error("[entitlements] subscriptions tablosu yok — kota UYGULANMIYOR (migration bekliyor)");
      return enforcedBase;
    }
    if (state.active) return { ...enforcedBase, unlimited: true };
  } catch (e) {
    console.error("[entitlements] subscription lookup failed — kota UYGULANMIYOR:", (e as Error).message);
    return enforcedBase;
  }

  // C1 fix: matchId yoksa muaf DEĞİL — günlük kovaya düşer. Kimliksiz istemci
  // günde 1 hak yakar (eski sürüm kilitlenmez, sınırsız kaçak kapanır).
  const member = (matchId ?? `nomatch:${new Date().toISOString().slice(0, 10)}`).toLowerCase();
  const key = `${QUOTA_KEY_PREFIX}:${userId}:${isoWeekKey()}`;
  const k = encodeURIComponent(key);
  const m = encodeURIComponent(member);

  try {
    // M1 fix: önce KARAR, sonra yazma. Reddedilen deneme sayacı şişirmez.
    const already = num(await upstash(`sismember/${k}/${m}`)) === 1;
    const used = num(await upstash(`scard/${k}`));
    if (already) {
      // Bu maç zaten sayılmış — sonraki tüm çağrıları bedava.
      return { ...enforcedBase, allowed: true, used };
    }
    if (used >= FREE_WEEKLY_MATCH_QUOTA) {
      return { ...enforcedBase, allowed: false, used };
    }
    await upstash(`sadd/${k}/${m}`);
    await upstash(`expire/${k}/${QUOTA_TTL_SECONDS}`);
    return { ...enforcedBase, allowed: true, used: used + 1 };
  } catch (e) {
    console.error("[entitlements] quota check failed — allowing:", (e as Error).message);
    return enforcedBase; // FAIL-OPEN (dosya başındaki gerekçe)
  }
}
