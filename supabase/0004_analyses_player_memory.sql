-- ═══════════════════════════════════════════════════════════════
-- AIMLO — Match analyses + player memory tables (2026-05-07)
-- ═══════════════════════════════════════════════════════════════
-- Creates the two user-data tables that the web app and AI routes
-- reference but were never captured in a migration:
--
--   public.analyses       — match summary rows written by saveReportToDb
--                           in app/page.tsx (after each match analysis)
--   public.player_memory  — cross-match aggregated profile written by
--                           lib/player-memory.ts (after each match-end)
--
-- Both have RLS enabled — owner-only read/write/delete. Service-role
-- writes (player-memory aggregation) are explicitly allowed via the
-- "service_role bypass" policy (Supabase already grants SELECT/INSERT/
-- UPDATE/DELETE to service_role by default; RLS policies don't apply
-- to that role, but we add a defensive comment).
--
-- IMPORTANT: This migration is idempotent (CREATE IF NOT EXISTS,
-- DROP POLICY IF EXISTS) so it's safe to run on a database that already
-- has the tables manually created.
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1) ANALYSES — per-match summary
-- ──────────────────────────────────────────────────────────────
create table if not exists public.analyses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  riot_id         text,                 -- legacy column name; stores map
  region          text,                 -- legacy column name; stores agent
  summary         text,
  weakness        text,
  strength        text,
  focus           text,
  raw_result_json jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

drop policy if exists "analyses_owner_read"   on public.analyses;
drop policy if exists "analyses_owner_insert" on public.analyses;
drop policy if exists "analyses_owner_update" on public.analyses;
drop policy if exists "analyses_owner_delete" on public.analyses;

create policy "analyses_owner_read"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "analyses_owner_insert"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "analyses_owner_update"
  on public.analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "analyses_owner_delete"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 2) PLAYER MEMORY — cross-match aggregated profile
-- ──────────────────────────────────────────────────────────────
create table if not exists public.player_memory (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  memory_data jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.player_memory enable row level security;

drop policy if exists "player_memory_owner_read"   on public.player_memory;
drop policy if exists "player_memory_owner_insert" on public.player_memory;
drop policy if exists "player_memory_owner_update" on public.player_memory;
drop policy if exists "player_memory_owner_delete" on public.player_memory;

-- Reads from the user themselves (dashboard etc.) are owner-only.
-- The system writes from lib/player-memory.ts now use the service-role
-- client which bypasses RLS, so we don't need a permissive write policy
-- for anon/authenticated.
create policy "player_memory_owner_read"
  on public.player_memory for select
  using (auth.uid() = user_id);

-- Defensive: even if a code path mistakenly uses the user's own client to
-- write, the user can write only their own row.
create policy "player_memory_owner_insert"
  on public.player_memory for insert
  with check (auth.uid() = user_id);

create policy "player_memory_owner_update"
  on public.player_memory for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "player_memory_owner_delete"
  on public.player_memory for delete
  using (auth.uid() = user_id);

-- updated_at auto-bump
create trigger player_memory_set_updated_at
  before update on public.player_memory
  for each row execute function public.tg_set_updated_at();
