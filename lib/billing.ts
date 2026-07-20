// Billing çekirdeği — server-only. Faz 3 (2026-07-20): abonelik durumu +
// gelir toplamları. Ödeme sağlayıcısı henüz bağlı değilken de derlenir ve
// çalışır: subscriptions/billing_events tabloları yoksa (PGRST205) her
// fonksiyon "ready:false" ile zarif döner — asla throw etmez.
//
// Webhook imza doğrulaması da burada (app/api/billing/webhook kullanır):
// Stripe-Signature v1 = HMAC-SHA256(`${t}.${rawBody}`, secret), timing-safe
// karşılaştırma + timestamp toleransı. stripe npm paketi GEREKMEZ.
import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceSupabase } from "@/lib/supabase/server";

// ── Tipler ─────────────────────────────────────────────────────────────────

export type SubscriptionRow = {
  id: string;
  user_id: string;
  provider: string;
  provider_customer_id: string | null;
  provider_subscription_id: string;
  status: string;
  plan: string | null;
  amount_cents: number;
  currency: string;
  billing_interval: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type RevenueData = {
  /** false → subscriptions tablosu henüz DB'de yok (migration bekliyor). */
  ready: boolean;
  activeSubs: number;
  mrrCents: number;
  arpuCents: number;          // MRR / aktif abone
  grossCents: number;         // billing_events tahsilat toplamı (tüm zaman)
  grossMonthCents: number;    // son 30 gün tahsilat
  recent: { date: string; type: string; amountCents: number | null; currency: string | null }[];
};

/** Aktif sayılan abonelik durumları (MRR + entitlement). */
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Tablo-yok hatası (PostgREST schema cache). */
export function isTableMissing(err: { code?: string } | null | undefined): boolean {
  return err?.code === "PGRST205";
}

/** Plan dönemini aylığa indirger — MRR hesabının tek kaynağı.
 * Stripe interval'ları: month | year | week | day (denetim: week/day 1:1
 * sayılırsa MRR yanlış büyür). */
export function monthlyCents(amountCents: number, interval: string): number {
  switch (interval) {
    case "year": return Math.round(amountCents / 12);
    case "week": return Math.round(amountCents * 4.35);
    case "day":  return Math.round(amountCents * 30.4);
    default:     return amountCents; // month
  }
}

// ── Entitlement (ileride özellik kapılama için — şu an beta, herkes ücretsiz) ──

export async function getActiveSubscription(userId: string): Promise<SubscriptionRow | null> {
  if (!userId) return null;
  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(5);
  if (error) {
    if (!isTableMissing(error)) console.error("[billing] getActiveSubscription:", error.message);
    return null;
  }
  const rows = (data ?? []) as SubscriptionRow[];
  return rows.find((r) => ACTIVE_STATUSES.has(r.status)) ?? null;
}

// ── Gelir toplamları (admin /revenue) ──────────────────────────────────────

export async function getRevenueData(): Promise<RevenueData> {
  const empty: RevenueData = {
    ready: false, activeSubs: 0, mrrCents: 0, arpuCents: 0,
    grossCents: 0, grossMonthCents: 0, recent: [],
  };
  const svc = createServiceSupabase();

  // Denetim O4: gross toplamlar TAHSİLAT satırlarından (amount_cents > 0) ayrı
  // sorguyla — ödeme-dışı lifecycle event'leri pencereyi tüketip eski tahsilatı
  // düşüremesin. 20000 tahsilat satırı ≈ yıllar; tavan aşımı loglanır.
  const [subsRes, paidRes] = await Promise.all([
    svc.from("subscriptions").select("status, amount_cents, billing_interval").limit(50000),
    svc
      .from("billing_events")
      .select("event_type, amount_cents, currency, created_at")
      .gt("amount_cents", 0)
      .order("created_at", { ascending: false })
      .limit(20000),
  ]);

  if (subsRes.error) {
    if (!isTableMissing(subsRes.error)) console.error("[billing] revenue subs:", subsRes.error.message);
    return empty;
  }
  if (paidRes.error && !isTableMissing(paidRes.error)) {
    // Denetim O5: sessiz $0 teşhis edilemez — hatayı logla.
    console.error("[billing] revenue events:", paidRes.error.message);
  }

  const subs = (subsRes.data ?? []) as { status: string; amount_cents: number; billing_interval: string }[];
  const active = subs.filter((s) => ACTIVE_STATUSES.has(s.status));
  const mrrCents = active.reduce((sum, s) => sum + monthlyCents(s.amount_cents || 0, s.billing_interval), 0);

  const paid = (paidRes.error ? [] : (paidRes.data ?? [])) as {
    event_type: string; amount_cents: number; currency: string | null; created_at: string;
  }[];
  if (paid.length === 20000) {
    console.warn("[billing] gross toplamı 20000-satır tavanına çarptı — SQL sum() agregasyonuna geçilmeli");
  }
  const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
  // Not: toplam tek para birimi (USD) varsayar — çoklu para birimi eklenirse
  // currency-bazlı ayrıştırma gerekir (şema hazır, kod bilinçli USD-only).
  const grossCents = paid.reduce((s, e) => s + e.amount_cents, 0);
  const grossMonthCents = paid
    .filter((e) => new Date(e.created_at).getTime() >= monthAgo)
    .reduce((s, e) => s + e.amount_cents, 0);

  return {
    ready: true,
    activeSubs: active.length,
    mrrCents,
    arpuCents: active.length ? Math.round(mrrCents / active.length) : 0,
    grossCents,
    grossMonthCents,
    recent: paid.slice(0, 12).map((e) => ({
      date: e.created_at, type: e.event_type, amountCents: e.amount_cents, currency: e.currency,
    })),
  };
}

// ── Webhook imza doğrulaması (Stripe-Signature) ────────────────────────────

/** ±5 dk timestamp toleransı — replay penceresini kapatır. */
const SIGNATURE_TOLERANCE_SEC = 300;

/**
 * `Stripe-Signature: t=...,v1=...[,v1=...]` başlığını doğrular.
 * true dönerse gövde, secret'ı bilen tarafça timestamp penceresi içinde
 * imzalanmıştır. Hatalı/eksik her durumda false (asla throw).
 */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = new Map<string, string[]>();
  for (const piece of header.split(",")) {
    const idx = piece.indexOf("=");
    if (idx <= 0) continue;
    const k = piece.slice(0, idx).trim();
    const v = piece.slice(idx + 1).trim();
    if (!parts.has(k)) parts.set(k, []);
    parts.get(k)!.push(v);
  }
  // Denetim L2: HMAC ham `t` token'ı üzerinden (kanonik Stripe şeması) —
  // Number-roundtrip baştaki-sıfır gibi biçimlerde meşru imzayı bozabilirdi.
  const tRaw = parts.get("t")?.[0] ?? "";
  const t = Number(tRaw);
  const v1s = parts.get("v1") ?? [];
  if (!tRaw || !Number.isFinite(t) || v1s.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - t) > SIGNATURE_TOLERANCE_SEC) return false;

  const expected = createHmac("sha256", secret).update(`${tRaw}.${rawBody}`, "utf8").digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  return v1s.some((sig) => {
    const sigBuf = Buffer.from(sig, "utf8");
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
  });
}
