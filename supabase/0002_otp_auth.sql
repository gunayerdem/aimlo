-- ═══════════════════════════════════════════════════════════════
-- AIMLO — OTP Auth Migration (2026-05-06)
-- ═══════════════════════════════════════════════════════════════
-- Adapts auto-karar's production-tested OTP system.
-- BLAST RADIUS: drops `profiles` + all `auth.users` (cascades to
-- analyses + player_memory). Run on a clean slate — re-register
-- all beta users via /register OTP flow.
--
-- USAGE: paste into Supabase Studio → SQL Editor → Run.
-- DO NOT run this without confirming you accept the data loss.
-- ═══════════════════════════════════════════════════════════════

-- Required extensions
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ──────────────────────────────────────────────────────────────
-- DESTRUCTIVE: drop existing setup
-- ──────────────────────────────────────────────────────────────

-- Drop the old profile-creation trigger if it exists (any version)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.tg_handle_new_user();

-- Drop and recreate the profiles table (current 8 rows lost)
drop table if exists public.profiles cascade;

-- ⚠️ This is the line that kills auth.users + cascades to analyses
-- Comment OUT next line if you want Option B (keep auth.users + analyses)
delete from auth.users;

-- ──────────────────────────────────────────────────────────────
-- HELPERS
-- ──────────────────────────────────────────────────────────────

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ──────────────────────────────────────────────────────────────
-- PROFILES TABLE (auto-karar schema)
-- ──────────────────────────────────────────────────────────────

create table public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  first_name   text,
  last_name    text,
  username     citext,                              -- case-insensitive
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Unique username (when set) — citext handles case
create unique index profiles_username_uniq_idx
  on public.profiles (username)
  where username is not null;

-- updated_at auto-bump on UPDATE
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ──────────────────────────────────────────────────────────────
-- When admin.createUser() inserts into auth.users, this trigger
-- auto-creates the matching profiles row using user_metadata.

create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name, first_name, last_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'username'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- RLS POLICIES (profiles)
-- ──────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

create policy "profiles_self_read" on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "profiles_self_update" on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No INSERT policy — inserts ONLY happen via the trigger (security definer).
-- No DELETE policy by user — account deletion goes through admin endpoint.

-- ──────────────────────────────────────────────────────────────
-- USERNAME LOOKUP RPC (preserves existing auth-helpers.ts contract)
-- ──────────────────────────────────────────────────────────────
-- Existing code: lib/auth-helpers.ts:101 calls
-- supabase.rpc('lookup_email_by_username', { lookup_username })
-- Return: email string or null (not the email itself for sec — boolean would
-- be safer, but auto-karar login flow needs the email to call signInWithPassword)

create or replace function public.lookup_email_by_username(lookup_username text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  found_email text;
begin
  -- Find user_id from profiles, then email from auth.users.
  -- Returns NULL if username not found.
  select u.email
    into found_email
    from public.profiles p
    join auth.users u on u.id = p.user_id
   where p.username = lookup_username::citext
   limit 1;
  return found_email;
end;
$$;

-- Grant EXECUTE to client roles. Without this, calls via the anon key (web +
-- desktop apps) silently return null because PostgREST blocks the function.
-- security definer means the body still runs as postgres, so RLS on profiles
-- and auth.users is bypassed safely (the function is read-only).
grant execute on function public.lookup_email_by_username(text) to anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- DONE
-- ──────────────────────────────────────────────────────────────
-- After running:
--   - profiles  : 0 rows (fresh)
--   - auth.users: 0 rows (if Option A — delete uncommented)
--   - analyses  : 0 rows (CASCADE'd from auth.users)
--   - player_memory: 0 rows (CASCADE'd from auth.users)
-- ═══════════════════════════════════════════════════════════════
