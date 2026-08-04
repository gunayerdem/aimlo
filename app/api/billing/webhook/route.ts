// POST /api/billing/webhook — ödeme sağlayıcısı webhook alıcısı.
// Faz 3 (2026-07-20). Hiçbir sağlayıcı sırrı yokken UYKUDA: 503 döner, hiçbir
// şey yazmaz — prod'da güvenle dururken sağlayıcı bağlanınca canlanır.
//
// SAĞLAYICI-AGNOSTİK (2026-07-31, denetim B56/B18): ödeme kararı PADDLE ama bu
// route yalnız Stripe-Signature ve Stripe olay şemasını biliyordu; Paddle
// bağlanınca HER webhook 400 dönerdi. Artık istek başlığına + hangi sırrın
// tanımlı olduğuna göre dallanıyor:
//   PADDLE_WEBHOOK_SECRET + `Paddle-Signature` → Paddle Billing
//   STRIPE_WEBHOOK_SECRET + `Stripe-Signature` → Stripe
// İki olay şeması ortak bir `NormalizedEvent`e indirgenir; DB yazma yolu tektir
// (provider sütunu hangi sağlayıcı olduğunu taşır). Stripe davranışı AYNEN
// korundu; Paddle sırrı YOKKEN davranış bugünküyle birebir aynı (503/uykuda).
//
// Güvenlik modeli (JWT YOK — çağıran ödeme sağlayıcısıdır):
//   1. İmza: Stripe `t`/`v1` + HMAC(`t.body`) · Paddle `ts`/`h1` + HMAC(`ts:body`),
//      ikisinde de ±5 dk timestamp toleransı ve timing-safe karşılaştırma
//      (lib/billing). Geçmeyen her istek 400.
//   2. Sıralama (denetim M3): önce dedup-probe (SELECT), sonra İDEMPOTENT senkron
//      işlemleri, EN SON defter kaydı. Senkron başarısız olursa defter yazılmaz
//      ve 5xx döneriz → sağlayıcı retry eder; defter yazıldıysa event tam işlenmiştir.
//      Eşzamanlı çift teslimat UNIQUE(provider,event_id) + idempotent upsert'lerle
//      zararsızdır.
//   3. Gövde tavanı 256KB (Content-Length ön-kontrol + bayt-doğru ölçüm).
//   4. user eşlemesi YALNIZ sağlayıcı metadata'sı (Stripe `metadata.user_id`,
//      Paddle `custom_data.user_id`) — UUID regex'inden geçmeyen değer yok
//      sayılır; ham payload SAKLANMAZ (PII-minimal).
//
// ⚠️ CHECKOUT YAZILIRKEN (denetim M2): metadata.user_id / custom_data.user_id
// MUTLAKA sunucu tarafında `supabase.auth.getUser()` ile doğrulanmış oturumdan
// konmalı — asla istek gövdesinden. Aksi hâlde kullanıcı aboneliğini başka
// hesaba iliştirebilir.
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { verifyStripeSignature, verifyPaddleSignature, isTableMissing } from "@/lib/billing";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MAX_BODY_BYTES = 256 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Provider = "stripe" | "paddle";

/** Sağlayıcıdan bağımsız abonelik senkron paketi. */
type SubscriptionSync = {
  subscriptionId: string;
  customerId: string | null;
  status: string;
  plan: string | null;
  amountCents: number;
  currency: string;
  interval: string;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/** İki sağlayıcı şemasının indirgendiği ortak biçim. */
type NormalizedEvent = {
  eventId: string;
  eventType: string;
  /** Defter satırına yazılacak kullanıcı (UUID doğrulanmış) — yoksa null. */
  userId: string | null;
  /** Abonelik upsert'i gerekiyorsa dolu. */
  sync: SubscriptionSync | null;
  /** Ödeme başarısız → past_due işaretlenecek abonelik id'si. */
  pastDueSubscriptionId: string | null;
  /** Tahsilat tutarı — yalnız gerçek ödeme event'i taşır (çift-sayım guard'ı). */
  amountCents: number | null;
  currency: string | null;
};

function asString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}
/** UUID süzgeci — sağlayıcıdan gelen serbest metin asla doğrudan user_id olmaz. */
function validUserId(raw: string | null): string | null {
  return raw && UUID_RE.test(raw) ? raw.toLowerCase() : null;
}

// ── Stripe şeması ──────────────────────────────────────────────────────────

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
};

function stripeMetadataUserId(obj: Record<string, unknown>): string | null {
  const meta = asRecord(obj["metadata"]);
  return meta ? validUserId(asString(meta["user_id"])) : null;
}

/** subscription objesinin ilk item'ından fiyat + dönem-sonu çıkarır.
 * current_period_end: üst seviye YA DA item seviyesi (Stripe flexible billing
 * mode yeni hesaplarda alanı item'a taşıdı — denetim K3). */
function firstItemOf(obj: Record<string, unknown>): Record<string, unknown> | null {
  const items = asRecord(obj["items"]);
  if (!items) return null;
  const data = items["data"];
  if (!Array.isArray(data) || data.length === 0) return null;
  return (data[0] ?? null) as Record<string, unknown> | null;
}
function priceOf(obj: Record<string, unknown>): {
  amountCents: number; currency: string; interval: string; plan: string | null;
} {
  const fallback = { amountCents: 0, currency: "usd", interval: "month", plan: null as string | null };
  const item = firstItemOf(obj);
  const p = item ? asRecord(item["price"]) : null;
  if (!p) return fallback;
  const recurring = asRecord(p["recurring"]) ?? {};
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

function normalizeStripe(evt: StripeEvent): NormalizedEvent | null {
  const eventId = asString(evt.id);
  const eventType = asString(evt.type);
  if (!eventId || !eventType) return null;
  const obj = (evt.data?.object ?? {}) as Record<string, unknown>;
  const userId = stripeMetadataUserId(obj);

  let sync: SubscriptionSync | null = null;
  if (
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated" ||
    eventType === "customer.subscription.deleted"
  ) {
    const subId = asString(obj["id"]);
    if (subId && userId) {
      const price = priceOf(obj);
      sync = {
        subscriptionId: subId,
        customerId: asString(obj["customer"]),
        status: eventType === "customer.subscription.deleted" ? "canceled" : (asString(obj["status"]) ?? "active"),
        plan: price.plan,
        amountCents: price.amountCents,
        currency: price.currency,
        interval: price.interval,
        periodEnd: periodEndOf(obj),
        cancelAtPeriodEnd: obj["cancel_at_period_end"] === true,
      };
    } else if (subId && !userId) {
      // metadata.user_id'siz abonelik eşlenemez — checkout kurulumu bu alanı
      // koymak ZORUNDA (dosya başındaki M2 notu). Defterde iz kalır; log yeter.
      console.warn(`[billing-webhook] ${eventType} sub=${subId} has no metadata.user_id — not synced`);
    }
  }

  // Çift-sayım guard'ı (denetim K1): Stripe başarılı tahsilatta invoice.paid VE
  // invoice.payment_succeeded'i AYRI id'lerle yollar — tutarı yalnız
  // invoice.paid taşır, kardeş event tutar-suz loglanır.
  const amountCents =
    eventType === "invoice.paid" && typeof obj["amount_paid"] === "number"
      ? (obj["amount_paid"] as number)
      : null;

  return {
    eventId,
    eventType,
    userId,
    sync,
    pastDueSubscriptionId: eventType === "invoice.payment_failed" ? asString(obj["subscription"]) : null,
    amountCents,
    currency: amountCents !== null ? (asString(obj["currency"]) ?? "usd") : null,
  };
}

// ── Paddle Billing şeması ──────────────────────────────────────────────────
//
// Stripe'tan farkları (denetim B56): zarf `event_id`/`event_type`/`data`
// (Stripe `id`/`type`/`data.object`), kullanıcı eşlemesi `custom_data`
// (Stripe `metadata`), tutarlar MINOR-UNIT STRING (Stripe number), dönem
// sonu ISO string (Stripe unix saniye), durumlar
// active|trialing|past_due|paused|canceled.
//
// ── TODO — PADDLE SANDBOX DOĞRULAMASI (F59/F67, pano dalga, 2026-08-04) ────
// NEDEN: aşağıdaki alan eşlemesi Paddle Billing dokümantasyonuna göre yazıldı
// ama HİÇ gerçek Paddle payload'ı görmedi (route prod'da UYKUDA —
// PADDLE_WEBHOOK_SECRET tanımlı değil, secret'sız her istek 503). Kod bilerek
// canlı bırakıldı (yorum-taslağa çevirmek önceki dalganın çalışan fix'ini
// bozardı); riski sıfırlayan şey secret'ın YOKLUĞU. PADDLE_WEBHOOK_SECRET
// prod'a konmadan ÖNCE Paddle sandbox'ında ("Notifications → Simulate" +
// gerçek test-checkout) şu maddeler TEK TEK işaretlenmeli
// (prosedür: docs/LAUNCH_RUNBOOK.md §4 "Paddle onboarding"):
//   [ ] Paddle-Signature `ts=...;h1=...` sandbox event'iyle verifyPaddleSignature'dan geçiyor
//   [ ] subscription.activated → data.status="active", items[0].price.unit_price.amount doğru okunuyor
//   [ ] subscription.canceled → "canceled" özel durumu + scheduled_change.action="cancel" eşlemesi
//   [ ] transaction.completed → details.totals.grand_total minor-unit STRING geliyor (paddleMinorUnits)
//   [ ] custom_data.user_id test-checkout'tan ULAŞIYOR (M2: checkout yazılırken
//       SUNUCU-doğrulamalı oturumdan konacak — istek gövdesinden ASLA)
//   [ ] current_billing_period.ends_at ISO string → current_period_end doğru
// Eşleme tutmayan alan varsa düzeltme BURADA (normalizePaddle) yapılır;
// NormalizedEvent şekli ve DB yazma yolu DEĞİŞMEZ.

type PaddleEvent = {
  event_id?: string;
  event_type?: string;
  data?: Record<string, unknown>;
};

/** Paddle tutarları minor-unit STRING ("49900") gelir — tam sayıya çevir. */
function paddleMinorUnits(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  const s = asString(v);
  if (!s || !/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

function paddleFirstItemPrice(data: Record<string, unknown>): Record<string, unknown> | null {
  const items = data["items"];
  if (!Array.isArray(items) || items.length === 0) return null;
  const first = asRecord(items[0]);
  return first ? asRecord(first["price"]) : null;
}

function normalizePaddle(evt: PaddleEvent): NormalizedEvent | null {
  const eventId = asString(evt.event_id);
  const eventType = asString(evt.event_type);
  if (!eventId || !eventType) return null;
  const data = asRecord(evt.data) ?? {};
  const custom = asRecord(data["custom_data"]);
  const userId = custom ? validUserId(asString(custom["user_id"])) : null;

  let sync: SubscriptionSync | null = null;
  if (eventType.startsWith("subscription.")) {
    const subId = asString(data["id"]);
    if (subId && userId) {
      const price = paddleFirstItemPrice(data);
      const unitPrice = price ? asRecord(price["unit_price"]) : null;
      // Abonelik nesnesinde billing_cycle üst seviyededir; fiyat seviyesi yedek.
      // NOT: frequency>1 (ör. 3 aylık plan) MRR'ı şişirir — AIMLO'da yalnız
      // aylık/yıllık (frequency=1) var; çok-dönemli plan eklenirse
      // lib/billing.monthlyCents frequency parametresi almalı.
      const cycle = asRecord(data["billing_cycle"]) ?? (price ? asRecord(price["billing_cycle"]) : null);
      const period = asRecord(data["current_billing_period"]);
      const scheduled = asRecord(data["scheduled_change"]);
      sync = {
        subscriptionId: subId,
        customerId: asString(data["customer_id"]),
        status: eventType === "subscription.canceled" ? "canceled" : (asString(data["status"]) ?? "active"),
        plan: price ? (asString(price["name"]) ?? asString(price["id"])) : null,
        amountCents: (unitPrice ? paddleMinorUnits(unitPrice["amount"]) : null) ?? 0,
        // Stripe tarafı küçük harf ("usd") yazıyor — tek biçim tut, MRR
        // raporlarında iki yazım iki para birimi gibi görünmesin.
        currency: (
          (unitPrice ? asString(unitPrice["currency_code"]) : null) ??
          asString(data["currency_code"]) ??
          "usd"
        ).toLowerCase(),
        interval: asString(cycle?.["interval"]) ?? "month",
        periodEnd: period ? asString(period["ends_at"]) : null,
        cancelAtPeriodEnd: asString(scheduled?.["action"]) === "cancel",
      };
    } else if (subId && !userId) {
      console.warn(`[billing-webhook] ${eventType} sub=${subId} has no custom_data.user_id — not synced`);
    }
  }

  // Tahsilat: tutarı YALNIZ transaction.completed taşır (Stripe invoice.paid emsali).
  let amountCents: number | null = null;
  if (eventType === "transaction.completed") {
    const totals = asRecord(asRecord(data["details"])?.["totals"] ?? null);
    amountCents = totals ? paddleMinorUnits(totals["grand_total"]) : null;
  }

  return {
    eventId,
    eventType,
    userId,
    sync,
    pastDueSubscriptionId:
      eventType === "transaction.payment_failed" ? asString(data["subscription_id"]) : null,
    amountCents,
    currency: amountCents !== null ? (asString(data["currency_code"]) ?? "usd").toLowerCase() : null,
  };
}

// ── Route ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const paddleSecret = process.env.PADDLE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!paddleSecret && !stripeSecret) {
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

  // Sağlayıcı seçimi: SIRRI TANIMLI + BAŞLIĞI GELMİŞ olan kazanır. İkisi de
  // tutmuyorsa doğrulanamayan istektir → 400 (asla "imzasız kabul").
  const paddleHeader = req.headers.get("paddle-signature");
  const stripeHeader = req.headers.get("stripe-signature");
  let provider: Provider;
  if (paddleSecret && paddleHeader) {
    provider = "paddle";
    if (!verifyPaddleSignature(raw, paddleHeader, paddleSecret)) {
      console.warn("[billing-webhook] paddle signature verification failed");
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }
  } else if (stripeSecret && stripeHeader) {
    provider = "stripe";
    if (!verifyStripeSignature(raw, stripeHeader, stripeSecret)) {
      console.warn("[billing-webhook] signature verification failed");
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }
  } else {
    console.warn("[billing-webhook] no usable signature header for configured provider(s)");
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const evt =
    provider === "paddle"
      ? normalizePaddle(parsed as PaddleEvent)
      : normalizeStripe(parsed as StripeEvent);
  if (!evt) {
    return NextResponse.json({ error: "malformed event" }, { status: 400 });
  }

  const svc = createServiceSupabase();

  // 1) Dedup-probe: bu event daha önce TAM işlendiyse (defterde varsa) çık.
  const probe = await svc
    .from("billing_events")
    .select("id")
    .eq("provider", provider)
    .eq("event_id", evt.eventId)
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

  // 2) İdempotent senkron — başarısızlıkta 5xx (defter yazılmadan) → sağlayıcı retry.
  if (evt.sync) {
    const s = evt.sync;
    const { error } = await svc.from("subscriptions").upsert(
      {
        user_id: evt.userId,
        provider,
        provider_customer_id: s.customerId,
        provider_subscription_id: s.subscriptionId,
        status: s.status,
        plan: s.plan,
        amount_cents: s.amountCents,
        currency: s.currency,
        billing_interval: s.interval,
        current_period_end: s.periodEnd,
        cancel_at_period_end: s.cancelAtPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider,provider_subscription_id" },
    );
    if (error) {
      console.error("[billing-webhook] subscription upsert:", error.message);
      return NextResponse.json({ error: "sync failed" }, { status: 500 });
    }
  }

  if (evt.pastDueSubscriptionId) {
    const { error } = await svc
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("provider", provider)
      .eq("provider_subscription_id", evt.pastDueSubscriptionId);
    if (error) {
      console.error("[billing-webhook] past_due update:", error.message);
      return NextResponse.json({ error: "sync failed" }, { status: 500 });
    }
  }

  // 3) Defter kaydı (idempotency anahtarı + gross gelir defteri) — EN SON.
  const ledger = await svc.from("billing_events").insert({
    provider,
    event_id: evt.eventId,
    event_type: evt.eventType,
    user_id: evt.userId,
    amount_cents: evt.amountCents,
    currency: evt.currency,
  });
  if (ledger.error && ledger.error.code !== "23505") {
    // 23505 = eşzamanlı teslimat defteri bizden önce yazdı — senkron idempotent, sorun değil.
    console.error("[billing-webhook] ledger insert:", ledger.error.message);
    return NextResponse.json({ error: "storage error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
