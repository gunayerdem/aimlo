-- ═══════════════════════════════════════════════════════════════
-- AIMLO — User-lookup helper (2026-05-07)
-- ═══════════════════════════════════════════════════════════════
-- Replaces the auth-flow's reliance on admin.auth.admin.listUsers({
-- perPage: 200 }) which silently breaks at user 201. This RPC does
-- O(1) lookup against auth.users via a SECURITY DEFINER function
-- callable only by the service role.
--
-- Why service-role-only? Returning a user row to anon would be a
-- straight email/id enumeration vector. The OTP server actions use
-- the service-role client (createServiceSupabase), so they can call
-- this; nothing else should.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.find_user_by_email(p_email text)
returns table (
  id uuid,
  email text,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return query
  select u.id, u.email, u.email_confirmed_at, u.last_sign_in_at, u.raw_user_meta_data
    from auth.users u
   where u.email = lower(trim(p_email))
   limit 1;
end;
$$;

-- Service role only — anon and authenticated must NOT enumerate.
revoke execute on function public.find_user_by_email(text) from public, anon, authenticated;
grant execute on function public.find_user_by_email(text) to service_role;

-- Also rate-limit / auth-gate the existing username RPC.
-- Mark it STABLE so the planner can cache. Add comment for ops.
create or replace function public.lookup_email_by_username(lookup_username text)
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  found_email text;
begin
  -- This RPC is called by anon clients during login (resolve username → email
  -- before signInWithPassword). Returning the email enables enumeration —
  -- mitigated at the application layer by aggressive rate limiting on the
  -- /login server action (see lib/auth-rate-limit.ts).
  select u.email
    into found_email
    from public.profiles p
    join auth.users u on u.id = p.user_id
   where p.username = lookup_username::citext
   limit 1;
  return found_email;
end;
$$;

-- Keep the anon grant we set earlier — login flow needs it.
grant execute on function public.lookup_email_by_username(text) to anon, authenticated;
