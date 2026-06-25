-- ═══════════════════════════════════════════════════════════════
-- AIMLO — AI usage / cost ledger (2026-06-25)
-- ═══════════════════════════════════════════════════════════════
-- Persists per-call OpenAI token usage so the admin /cost panel can show
-- REAL gpt-5-mini spend over time. Until now the vision/report/feedback/
-- insight routes only console.log token counts → Vercel logs are ephemeral
-- and no historical cost can be derived. lib/ai-usage.ts saveAiUsage()
-- writes one row per AI call (non-blocking, service-role) right where the
-- usage object is already parsed.
--
-- USD cost is NOT stored — it is computed at read time from token columns
-- via lib/openai-pricing.ts, so a price change re-prices history correctly
-- without a backfill.
--
-- Owner-only by RLS with NO anon/authenticated policy: only the service-role
-- writes and only the admin panel (service-role) reads. Idempotent.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.ai_usage (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  route_type        text not null,         -- 'vision' | 'report' | 'feedback' | 'insight'
  model             text,                  -- e.g. 'gpt-5-mini'
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  cached_tokens     integer not null default 0,  -- subset of prompt_tokens served from cache
  created_at        timestamptz not null default now()
);

create index if not exists ai_usage_created_idx
  on public.ai_usage (created_at desc);
create index if not exists ai_usage_user_created_idx
  on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_route_created_idx
  on public.ai_usage (route_type, created_at desc);

alter table public.ai_usage enable row level security;

-- No anon/authenticated policy: service-role only (writes + admin reads).
revoke all on public.ai_usage from anon, authenticated;
