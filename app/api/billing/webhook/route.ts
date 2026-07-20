// POST /api/billing/webhook — ödeme sağlayıcısı (Stripe) webhook alıcısı.
// Faz 3 (2026-07-20). STRIPE_WEBHOOK_SECRET yokken UYKUDA: 503 döner, hiçbir
// şey yazmaz — prod'da güvenle dururken sağlayıcı bağlanınca canlanır.
//
// Güvenlik modeli (JWT YOK — çağıran Stripe'tır):
//   1. İmza: Stripe-Signature v1 HMAC-SHA256 + ±5 dk timestamp toleransı
//      (lib/billing.verifyStripeSignature, timing-safe). Geçmeyen her istek 400.
//   2. Sıralama (denetim M3): önce dedup-probe (SELECT), sonra İDEMPOTENT senkron
//      işlemleri, EN SON defter kaydı. Senkron başarısız olursa defter yazılmaz
//      ve 5xx döneriz → Stripe retry eder; defter yazıldıysa event tam işlenmiştir.
//      Eşzamanlı çift teslimat UNIQUE(provider,event_id) + idempotent upsert'lerle
//      zararsızdır.
//   3. Gövde tavanı 256KB (Content-Length ön-kontrol + bayt-doğru ölçüm).
//   4. user eşlemesi YALNIZ subscription.metadata.user_id — UUID regex'inden
//      geçmeyen değer yok sayılır; ham payload SAKLANMAZ (PII-minimal).
//
// ⚠️ CHECKOUT YAZILIRKEN (denetim M2): subscription metadata.user_id alanı
// MUTLAKA sunucu tarafında `supabase.auth.getUser()` ile doğrulanmış oturumdan
// konmalı — asla istek gövdesinden. Aksi hâlde kullanıcı aboneliğini başka
// hesaba iliştirebilir.
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { verifyStripeSignature, isTableMissing } from "@/lib/billing";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MAX_BODY_BYTES = 256 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
};

function asString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
function metadataUserId(obj: Record<string, unknown>): string | null {
  const meta = obj["metadata"];
  if (!meta || typeof meta !== "object") return null;
  const raw = asString((meta as Record<string, unknown>)["user_id"]);
  return raw && UUID_RE.test(raw) ? raw.toLowerCase() : null;
}

/** subscription objesinin ilk item'ından fiyat + dönem-sonu çıkarır.
 * current_period_end: üst seviye YA DA item seviyesi (Stripe flexible billing
 * mode yeni hesaplarda alanı item'a taşıdı — denetim K3). */
function firstItemOf(obj: Record<string, unknown>): Record<string, unknown> | null {
  const items = obj["items"];
  if (!items || typeof items !== "object") return null;
  const data = (items as Record<string, unknown>)["data"];
  if (!Array.isArray(data) || data.length === 0) return null;
  return (data[0] ?? null) as Record<string, unknown> | null;
}
function priceOf(obj: Record<string, unknown>): {
  amountCents: number; currency: string; interval: string; plan: string | null;
} {
  const fallback = { amountCents: 0, currency: "usd", interval: "month", plan: null as string | null };
  const item = firstItemOf(obj);
  const price = item?.["price"];
  if (!price || typeof price !== "object") return fallback;
  const p = price as Record<string, unknown>;
  const recurring = (p["recurring"] ?? {}) as Record<string, unknown>;
  return {
    amountCents: typeof p["unit_amount"] === "number" ? (p["unit_amount"] as number) : 0,
    currency: asString(p["currency"]) ?? "usd",
    interval: asString(recurring["interval"]) ?? "month",
    plan: asString(p["nickname"]) ?? asString(p["id"]),
  };
}
function periodEndOf(obj: Record<string, unknown>): string | null {
  const top = obj["current_period_end"];
  if (typeof top === "number") return new Date(top * 1000).toISOString();
  const item = firstItemOf(obj);
  const itemLevel = item?.["current_period_end"];
  if (typeof itemLevel === "number") return new Date(itemLevel * 1000).toISOString();
  return null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Uyku modu: sağlayıcı bağlı değil. Yapılandırma gelene kadar kapalı kapı.
    return NextResponse.json({ error: "billing not configured" }, { status: 503 });
  }

  // Gövde tavanı: önce Content-Length (okumadan reddet), sonra bayt-doğru ölçüm.
  const declaredLen = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLen) && declaredLen > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret)) {
    console.warn("[billing-webhook] signature verification failed");
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let evt: StripeEvent;
  try {
    evt = JSON.parse(raw) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const eventId = asString(evt.id);
  const eventType = asString(evt.type);
  const obj = (evt.data?.object ?? {}) as Record<string, unknown>;
  if (!eventId || !eventType) {
    return NextResponse.json({ error: "malformed event" }, { status: 400 });
  }

  const svc = createServiceSupabase();

  // 1) Dedup-probe: bu event daha önce TAM işlendiyse (defterde varsa) çık.
  const probe = await svc
    .from("billing_events")
    .select("id")
    .eq("provider", "stripe")
    .eq("event_id", eventId)
    .limit(1);
  if (probe.error) {
    if (isTableMissing(probe.error)) {
      console.error("[billing-webhook] billing_events tablosu yok — supabase/0011 uygulanmalı");
      return NextResponse.json({ error: "billing storage not ready" }, { status: 503 });
    }
    console.error("[billing-webhook] dedup probe:", probe.error.message);
    return NextResponse.json({ error: "storage error" }, { status: 500 });
  }
  if ((probe.data ?? []).length > 0) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 2) İdempotent senkron — başarısızlıkta 5xx (defter yazılmadan) → Stripe retry.
  if (
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated" ||
    eventType === "customer.subscription.deleted"
  ) {
    const subId = asString(obj["id"]);
    const userId = metadataUserId(obj);
    if (subId && userId) {
      const price = priceOf(obj);
      const { error } = await svc.from("subscriptions").upsert(
        {
          user_id: userId,
          provider: "stripe",
          provider_customer_id: asString(obj["customer"]),
          provider_subscription_id: subId,
          status: eventType === "customer.subscription.deleted" ? "canceled" : (asString(obj["status"]) ?? "active"),
          plan: price.plan,
          amount_cents: price.amountCents,
          currency: price.currency,
          billing_interval: price.interval,
          current_period_end: periodEndOf(obj),
          cancel_at_period_end: obj["cancel_at_period_end"] === true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider,provider_subscription_id" },
      );
      if (error) {
        console.error("[billing-webhook] subscription upsert:", error.message);
        return NextResponse.json({ error: "sync failed" }, { status: 500 });
      }
    } else if (subId && !userId) {
      // metadata.user_id'siz abonelik eşlenemez — checkout kurulumu bu alanı
      // koymak ZORUNDA (dosya başındaki M2 notu). Defterde iz kalır; log yeter.
      console.warn(`[billing-webhook] ${eventType} sub=${subId} has no metadata.user_id — not synced`);
    }
  }

  if (eventType === "invoice.payment_failed") {
    const subId = asString(obj["subscription"]);
    if (subId) {
      const { error } = await svc
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("provider", "stripe")
        .eq("provider_subscription_id", subId);
      if (error) {
        console.error("[billing-webhook] past_due update:", error.message);
        return NextResponse.json({ error: "sync failed" }, { status: 500 });
      }
    }
  }

  // 3) Defter kaydı (idempotency anahtarı + gross gelir defteri) — EN SON.
  // Çift-sayım guard'ı (denetim K1): Stripe başarılı tahsilatta invoice.paid VE
  // invoice.payment_succeeded'i AYRI id'lerle yollar — tutarı yalnız
  // invoice.paid taşır, kardeş event tutar-suz loglanır.
  const amountCents =
    eventType === "invoice.paid" && typeof obj["amount_paid"] === "number"
      ? (obj["amount_paid"] as number)
      : null;
  const ledger = await svc.from("billing_events").insert({
    provider: "stripe",
    event_id: eventId,
    event_type: eventType,
    user_id: metadataUserId(obj),
    amount_cents: amountCents,
    currency: amountCents !== null ? (asString(obj["currency"]) ?? "usd") : null,
  });
  if (ledger.error && ledger.error.code !== "23505") {
    // 23505 = eşzamanlı teslimat defteri bizden önce yazdı — senkron idempotent, sorun değil.
    console.error("[billing-webhook] ledger insert:", ledger.error.message);
    return NextResponse.json({ error: "storage error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
