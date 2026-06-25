-- ═══════════════════════════════════════════════════════════════
-- AIMLO — Admin gate + audit (2026-06-25)
-- ═══════════════════════════════════════════════════════════════
-- Backs the owner-only admin panel (/admin). The admin DECISION lives
-- in this table — it is the single source of truth, queried ONLY by the
-- service-role client (createServiceSupabase) from server code. There is
-- intentionally NO anon/authenticated RLS policy, so a logged-in user can
-- never read or write it with their own JWT. We also stamp
-- auth.users.app_metadata.is_admin (service-role only) as a second,
-- independent signal, but the table is the final word.
--
-- WHY a table + app_metadata and NOT user_metadata: register/verify write
-- user_metadata from form input, and a user can change their OWN
-- user_metadata via supabase.auth.updateUser({data:{...}}) — that would be
-- a privilege-escalation hole. app_metadata is writable ONLY by the
-- service-role admin API; this table only by service_role. Both are
-- client-unwritable.
--
-- Idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS) — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1) ADMINS — who may access /admin. Add rows manually (service-role)
--    for new partners/staff; delete to revoke. No role column yet
--    (flat allow-list; add one later if read-only vs full is needed).
-- ──────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  added_at   timestamptz not null default now(),
  added_by   uuid references auth.users(id) on delete set null,
  note       text
);

alter table public.admins enable row level security;

-- NO anon/authenticated policy on purpose. RLS-enabled with zero policies
-- = nobody can read/write via anon/authenticated. service_role bypasses RLS
-- (Supabase grants it full DML by default) so server code still works.
-- Defensive: explicitly revoke any table grants from anon/authenticated.
revoke all on public.admins from anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 2) ADMIN_AUDIT — KVKK/GDPR trail: which admin viewed which user's
--    data and when. Append-only from server (service-role).
-- ──────────────────────────────────────────────────────────────
create table if not exists public.admin_audit (
  id             uuid primary key default gen_random_uuid(),
  admin_user_id  uuid not null references auth.users(id) on delete cascade,
  action         text not null,            -- e.g. 'view_users', 'view_user_detail'
  target_user_id uuid,                     -- the user whose data was viewed (nullable)
  detail         jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists admin_audit_admin_created_idx
  on public.admin_audit (admin_user_id, created_at desc);
create index if not exists admin_audit_target_idx
  on public.admin_audit (target_user_id);

alter table public.admin_audit enable row level security;
revoke all on public.admin_audit from anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 3) is_admin(uuid) — convenience predicate, service-role only.
--    The TS layer (lib/admin-auth.ts) queries the table directly via
--    service-role, but this RPC is handy for SQL/dashboard checks.
-- ──────────────────────────────────────────────────────────────
create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = p_user_id);
$$;

revoke execute on function public.is_admin(uuid) from public, anon, authenticated;
grant execute on function public.is_admin(uuid) to service_role;
