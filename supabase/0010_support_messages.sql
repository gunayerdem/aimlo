-- ═══════════════════════════════════════════════════════════════
-- AIMLO 0010 — Support messages / user questions (2026-06-30)
-- ═══════════════════════════════════════════════════════════════
-- ⚠️  NEW MIGRATION — NOT YET APPLIED IN PRODUCTION.
--     Run this in the Supabase SQL Editor (project bzwnchzetebwrdedkjkq)
--     BEFORE the /api/support route and /admin/support page can work.
--     Unlike 0002–0009, do NOT assume this is already live.
--
-- Backs the desktop "Destek" screen: a user submits a free-text support
-- question/message; the founder reviews it in /admin under "Yardım / Sorular".
--
-- RLS model (owner-only writes + read-own; admins handled via service-role):
--   - authenticated users may INSERT only their OWN row (user_id = auth.uid())
--   - authenticated users may SELECT only their OWN rows
--   - NO authenticated UPDATE/DELETE (status changes are admin-only, done via
--     the service-role client which bypasses RLS — mirrors how /admin reads
--     match_events / analyses today). anon has no access at all.
--   - service_role bypasses RLS (Supabase default) → the admin panel reads ALL
--     rows and updates status through createServiceSupabase().
--
-- The API route ALSO sanitizes the message (lib/prompt-safety) before insert,
-- so what lands here is already stripped of tags/bidi/zero-width/role-prefixes
-- and length-capped — defense-in-depth against stored-XSS when rendered in the
-- admin panel (which additionally relies on React's default escaping).
--
-- Idempotent (CREATE IF NOT EXISTS / DROP POLICY IF EXISTS) — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  email       text,
  message     text not null,
  status      text not null default 'open',   -- 'open' | 'resolved' (admin-managed)
  created_at  timestamptz not null default now()
);

-- Newest-first listing for the admin panel.
create index if not exists support_messages_created_idx
  on public.support_messages (created_at desc);
-- Lets a user efficiently read their own submissions (read-own policy).
create index if not exists support_messages_user_idx
  on public.support_messages (user_id, created_at desc);

alter table public.support_messages enable row level security;

drop policy if exists "support_messages_owner_insert" on public.support_messages;
drop policy if exists "support_messages_owner_read"   on public.support_messages;

-- Authenticated users can submit ONLY their own message. The API route always
-- sets user_id from the verified JWT (never from the body), so this with-check
-- is the DB-level backstop against a forged user_id.
create policy "support_messages_owner_insert"
  on public.support_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- A user may read back ONLY their own submissions (e.g. a future desktop
-- "my tickets" view). They can never see anyone else's.
create policy "support_messages_owner_read"
  on public.support_messages for select
  to authenticated
  using (auth.uid() = user_id);

-- NO authenticated/anon UPDATE or DELETE policy on purpose: status changes are
-- admin-only and go through the service-role client (which bypasses RLS).
-- Defensive: ensure anon has zero table access (RLS already blocks it, but be
-- explicit so a future GRANT can't silently widen the surface).
revoke all on public.support_messages from anon;
