-- ═══════════════════════════════════════════════════════════════
-- AIMLO — Audit follow-up fixes (2026-05-07)
-- ═══════════════════════════════════════════════════════════════
-- 1) tg_handle_new_user — swallow duplicate-username + null-metadata
--    so a transient race or malformed input never rolls back the
--    auth.users INSERT (D-P0-2).
-- 2) update_player_memory_atomic — atomic JSONB merge function so the
--    read-modify-write pattern in lib/player-memory.ts can no longer
--    lose updates under concurrent match-end requests (D-P0-4).
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1) Hardened auto-profile trigger
-- ──────────────────────────────────────────────────────────────
create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.profiles (user_id, display_name, first_name, last_name, username)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'username'
    );
  exception
    when unique_violation then
      -- Duplicate username/user_id — log and continue. The auth.users
      -- INSERT must NOT roll back, otherwise the user gets a confusing
      -- "registration failed" error even though the race is recoverable
      -- (the application layer does the username pre-check; this is the
      -- safety net for a true concurrent insert).
      raise warning '[Aimlo trigger] profile insert skipped (unique violation): user=%, username=%',
        new.id, new.raw_user_meta_data->>'username';
    when others then
      raise warning '[Aimlo trigger] profile insert failed (%): user=%', sqlerrm, new.id;
  end;
  return new;
end;
$$;

-- ──────────────────────────────────────────────────────────────
-- 2) Atomic player-memory update — JSONB-merge in a single
--    transaction with row-level lock. Closes the lost-update
--    race when two match-end requests fire simultaneously.
-- ──────────────────────────────────────────────────────────────
create or replace function public.player_memory_atomic_merge(
  p_user_id uuid,
  p_patch   jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_data jsonb;
  merged_data  jsonb;
begin
  -- SELECT FOR UPDATE serialises concurrent merges per user.
  select memory_data into current_data
    from public.player_memory
   where user_id = p_user_id
   for update;

  if current_data is null then
    insert into public.player_memory (user_id, memory_data, updated_at)
    values (p_user_id, p_patch, now());
    return p_patch;
  end if;

  -- Top-level shallow merge — keys in p_patch override.
  merged_data := current_data || p_patch;

  update public.player_memory
     set memory_data = merged_data,
         updated_at  = now()
   where user_id = p_user_id;

  return merged_data;
end;
$$;

-- Service role only — same as find_user_by_email.
revoke execute on function public.player_memory_atomic_merge(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.player_memory_atomic_merge(uuid, jsonb) to service_role;
