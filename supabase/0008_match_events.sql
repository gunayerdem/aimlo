-- ═══════════════════════════════════════════════════════════════
-- AIMLO 0008 — Live match events (2026-06-25)
-- ═══════════════════════════════════════════════════════════════
-- Powers the admin /live feed. One row per vision call (a death during a
-- live match) — persisted backend-side from data the vision route ALREADY
-- receives, so there is ZERO extra AI cost and NO desktop change. RLS-locked
-- (service-role only); the admin panel reads it, nobody else.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.match_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  match_id    uuid,
  kind        text not null default 'death',   -- 'death' | 'match_end'
  map         text,
  agent       text,
  side        text,
  round_no    integer,
  score       text,
  death_loc   text,
  result      text,                            -- 'win' | 'loss' | 'unknown'
  created_at  timestamptz not null default now()
);

create index if not exists match_events_created_idx on public.match_events (created_at desc);
create index if not exists match_events_user_idx on public.match_events (user_id, created_at desc);

alter table public.match_events enable row level security;
revoke all on public.match_events from anon, authenticated;
