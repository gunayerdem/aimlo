-- ═══════════════════════════════════════════════════════════════
-- AIMLO — Faz 3: abonelik + gelir altyapısı (2026-07-20)
-- ═══════════════════════════════════════════════════════════════
-- Ödeme sağlayıcısı (Stripe-şekilli, provider kolonu ile sağlayıcı-agnostik)
-- webhook'larının beslediği iki tablo:
--   subscriptions  — kullanıcı başına abonelik durumu (MRR/entitlement kaynağı)
--   billing_events — webhook idempotency defteri + tahsilat (gross) kaydı
--
-- Kod tarafı (lib/billing.ts + app/api/billing/webhook) bu tablolar YOKKEN
-- zarif düşer (PGRST205 → revenue sayfası "migration bekliyor" durumu).
-- Ham webhook payload'ı SAKLANMAZ (PII-minimal) — yalnız gereken kolonlar.
-- İdempotent; tekrar çalıştırmak güvenlidir.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  provider                 text not null default 'stripe',
  provider_customer_id     text,
  provider_subscription_id text not null,
  status                   text not null,                 -- active | trialing | past_due | canceled | incomplete | unpaid
  plan                     text,                          -- price nickname ya da price id
  amount_cents             integer not null default 0,    -- dönem başına yinelenen tutar
  currency                 text not null default 'usd',
  billing_interval         text not null default 'month', -- month | year
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index if not exists subscriptions_user_idx
  on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx
  on public.subscriptions (status);

alter table public.subscriptions enable row level security;

-- Kullanıcı KENDİ aboneliğini okuyabilir (ileride hesap sayfası için);
-- yazma yalnız service-role (hiç insert/update policy yok).
drop policy if exists subscriptions_owner_select on public.subscriptions;
create policy subscriptions_owner_select
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.subscriptions from anon, authenticated;

create table if not exists public.billing_events (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null default 'stripe',
  event_id     text not null,          -- sağlayıcının event id'si (idempotency anahtarı)
  event_type   text not null,          -- ör. invoice.paid, customer.subscription.updated
  user_id      uuid references auth.users(id) on delete set null,
  amount_cents integer,                -- yalnız tahsilat event'lerinde dolu (gross gelir defteri)
  currency     text,
  created_at   timestamptz not null default now(),
  unique (provider, event_id)
);

create index if not exists billing_events_created_idx
  on public.billing_events (created_at desc);
create index if not exists billing_events_type_idx
  on public.billing_events (event_type, created_at desc);

alter table public.billing_events enable row level security;

-- ai_usage kalıbı: anon/authenticated için HİÇ policy yok — yalnız service-role.
revoke all on public.billing_events from anon, authenticated;
