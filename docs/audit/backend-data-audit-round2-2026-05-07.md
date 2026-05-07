# Brutal backend / data-integrity audit — ROUND 2

**Date:** 2026-05-07
**Scope:** Verify Wave 1-3 hot-fix commit `63df8b27` against Round-1 P0/P1 + sweep for new issues.
**Auditor:** Read-only review of `supabase/`, `lib/`, `app/(auth)/`, `app/api/ai/`, `app/page.tsx`, `app/account/`.

Severities reused: **P0** = ship-blocker / silent-data-loss / privesc-vector. **P1** = high-risk in normal operation. **P2** = correctness / cost concern under load. **P3** = polish, nit, future tech-debt.

---

## 1) Round-1 verification

### Verified FIXED

- **D-P0-1 — analyses table missing migration** — FIXED.
  `supabase/0004_analyses_player_memory.sql` creates `public.analyses` with the full legacy column set the app writes. Schema matches `app/page.tsx:3397-3420` payload (`riot_id` legacy=map, `region` legacy=agent, `summary`, `weakness`, `strength`, `focus`, `raw_result_json`, `created_at`, `user_id`). RLS enabled, owner-only SELECT/INSERT/UPDATE/DELETE policies in place. `created_at desc` index exists for `loadHistory`. Cascade on `auth.users` delete is wired (`references auth.users(id) on delete cascade`).

- **D-P0-2 — `tg_handle_new_user` duplicate username crash** — PARTIALLY FIXED at the application layer; trigger itself is unchanged. The trigger in `0002_otp_auth.sql:74-92` still has no `EXCEPTION` block and will still raise `unique_violation` on a true race. However `app/(auth)/register/actions.ts:213-221` now matches `profiles_username` and `unique` substrings in `createErr.message` and returns a friendly `{username: "Az önce alındı, başka bir tane dene."}` field error. The pre-check at `:123-135` plus this catch closes the *user-visible* failure mode — but the failed `auth.users` INSERT still rolls back atomically, leaving no orphan row. Still a P2: the trigger ought to swallow its own conflict, but no longer ships a P0 user-facing bug.

- **D-P0-3 — Rate-limiter INCR/EXPIRE race** — FIXED (`lib/api-auth.ts:86-127`). Two separate `AbortController`s (4s for INCR, 3s for EXPIRE), so a slow EXPIRE no longer aborts an in-flight INCR. The "always re-apply TTL on every INCR" pattern (`:107-124`) self-heals a TTL-less key on the next call, eliminating the permanent-lockout failure mode. Same fix applied in `lib/auth-rate-limit.ts:66-109`. Comments accurately describe the race history. NOTE: the per-request approach uses two HTTP round-trips per check; an alternative `SET key 1 EX ttl NX` + `INCR` pipeline would be a single round-trip — flagged as P3 perf.

- **D-P0-5 — Player memory used browser client server-side** — FIXED. `lib/player-memory.ts:1-3` now starts with `import "server-only"` + `import { createServiceSupabase } from "@/lib/supabase/server"`. Both `loadPlayerMemory` and `updatePlayerMemory` use the service-role client (RLS-bypass). No other server-side file imports `@/lib/supabase` (browser client) — verified via grep across `app/api/**`. Comment at `:18-19` explicitly names the audit ID being closed.

- **P1-2 — `lookup_email_by_username` perf + enumeration** — PARTIALLY FIXED.
  `0003_user_lookup.sql:42-67` redefines the function with `STABLE` marker (planner can cache → perf win achieved). Anon grant is intentionally kept (`:67`) because the login flow still resolves username → email before `signInWithPassword`. App-layer rate-limit on the auth actions (`lib/auth-rate-limit.ts`, 8/min/identifier + 32/min/IP for login) replaces the previously absent throttle. The fundamental enumeration risk (anon can resolve usernames to emails) remains by design — accepted per commit message. Threat model is now documented inline (`0003:53-55`).

- **P1-10 — reality-checker EN patterns** — FIXED. `lib/reality-checker.ts:35-48` now includes English count patterns (`\d+ times?`, `\d+ deaths?`, `\d+ rounds? (in a row|straight|consecutive)`, `\d+ matches? in a row`). `WINDOW_PATTERNS:50-60` adds `last N rounds/matches`, `past N rounds`, `over the last N`. `REPETITION_KEYWORDS:74-83` adds `in a row`, `straight`, `consecutive`, `consistently`, `every round`, `same spot`, `same position`, `repeating`, `recurring`, `persistent`, `every time`. `rewriteUnsafeClaims:189-227` mirrors the new patterns in level-2 rewrite (Turkish + English). Level-3 rewrite still strips Turkish-only `kez`/`son N` — minor gap because level-3 implies "fully strip" so any English residue is statistically rare, but logged below as a NEW issue (R2-NEW-1).

### Still broken / partial

- **D-P0-4 — `updatePlayerMemory` lost-update race** — STILL OPEN. Code unchanged (`lib/player-memory.ts:104-228`); the read-modify-write pattern remains. Comment at `:97-103` explicitly defers it as a follow-up. Real-world impact bounded (two near-simultaneous match-ends per user — rare), but the bug exists. P1.

---

## 2) SQL migration sanity check (`0004_analyses_player_memory.sql`)

| Check | Status | Note |
|---|---|---|
| Idempotent creates | YES | `create table if not exists` on both tables |
| Idempotent policies | YES | `drop policy if exists` then `create policy` for all 8 |
| RLS enabled — analyses | YES | `:42` |
| RLS enabled — player_memory | YES | `:76` |
| Owner-only SELECT/INSERT/UPDATE/DELETE — analyses | YES | All four use `auth.uid() = user_id` |
| Owner-only policies — player_memory | YES | All four use `auth.uid() = user_id` |
| Legacy columns analyses (`riot_id`, `region`) | YES | matches `page.tsx:3399-3400` |
| `player_memory.memory_data jsonb` | YES | `:71` |
| `player_memory.updated_at` | YES | `:73` |
| `tg_set_updated_at` trigger reference | YES | `:107-109` |
| Cascade analyses → auth.users | YES | `:28` |
| Cascade player_memory → auth.users | YES | `:70` |

All checks pass. Migration is safe to re-run on a DB that already has the manually-created tables.

---

## 3) NEW issues found in Round 2

**Count:** 9 new (1 P1, 4 P2, 4 P3).

### Top 3 by severity

#### R2-NEW-1 (P1) — **Orphan SQL file `supabase/player-memory-table.sql` conflicts with the canonical 0004 migration**
**File:** `supabase/player-memory-table.sql`
The legacy file (no version prefix) defines `player_memory` with a different schema: separate `id uuid PK` + `UNIQUE(user_id)` index, where 0004 uses `user_id` as the PK directly. If somebody runs this file by mistake — or if 0004 was never applied and a fresh DB picks up `player-memory-table.sql` from a `find . -name "*.sql"` setup — the schema diverges from what the code expects (`upsert({ onConflict: "user_id" })` works in both, but downstream JOINs and any code that `.eq("id", ...)`s would break). Plus it has `CREATE POLICY` without `IF EXISTS` guards.
**Fix:** Delete `supabase/player-memory-table.sql`. It's a footgun.

#### R2-NEW-2 (P1) — **`analyses` writes from the browser client rely on cookie-bound auth — silent failure if cookies don't propagate**
**File:** `app/page.tsx:3423` + `lib/supabase.ts`
`saveReportToDb` does `supabase.from("analyses").insert(payload)` via the **browser** Supabase client (`lib/supabase.ts` exports `createBrowserClient` which reads cookies). RLS on `analyses` requires `auth.uid() = user_id` — this only succeeds if the cookie session reaches PostgREST. If the user's tab outlives the cookie's `Max-Age`, or if the auth helper writes the session to localStorage on some legacy path while the SSR cookie was rotated, the INSERT silently 401s/403s and the code falls back to `localStorage.setItem("aimlo_local_reports_…")` — exactly the "silent data loss" mode that D-P0-5 tried to kill on the player_memory side. The `console.error` at `:3424` is the only signal; users see "Saved" UI cosmetically (loadHistory just re-renders local state).
**Fix:** Same pattern as the player_memory fix — push the insert through a server action or `app/api/analyses/save` route that uses `createServerSupabase()` (cookie-bound, but the request-time cookie is canonical). At minimum surface the error to the UI as a toast so the user knows their match is local-only.

#### R2-NEW-3 (P2) — **KB loader still has zero in-process caching (Round-1 P1-5 unmitigated)**
**File:** `lib/knowledge-loader.ts:83-90`
`loadFile` calls `fs.readFileSync` on every invocation. Every AI request reads ~5-7 markdown files (25-140 KB) from disk. Vercel keeps a lambda hot for ~minutes; a `Map<string,string>` cache would eliminate the repeated reads for the lifetime of the lambda. Files are immutable per deploy — cache is safe forever.
**Fix:** As noted in Round 1 — wrap `loadFile` in a `Map` keyed on `relativePath`. 8-line change.

---

### Other new findings

- **R2-NEW-4 (P2) — `lib/api-auth.ts:274` creates a stateless `createClient` (anon key + Authorization header) for token verification.** This is correct for desktop callers; but it doesn't honour the cookie session on the same request, so a web client calling `/api/ai/*` must always supply a Bearer token. `app/page.tsx` does this (`getAuthHeaders()`), but if a future feature ever calls these endpoints from a Server Component or a fetch without explicit Authorization, it will 401. Document the requirement.

- **R2-NEW-5 (P2) — `find_user_by_email` RPC is not marked `STABLE`.** `supabase/0003_user_lookup.sql:23` is `language plpgsql` with default `VOLATILE`. The function is read-only — should be `STABLE`. Symmetric with the `lookup_email_by_username` fix. No user-visible bug, just a planner micro-perf miss.

- **R2-NEW-6 (P2) — Daily quota TTL key collision potential under clock-skew.** `lib/api-auth.ts:159-192` keys the daily counter by UTC date string. If a Vercel lambda's clock drifts more than a few minutes around midnight, two parallel lambdas could be writing to *different* day keys for the same logical request burst, allowing a small amount of quota over-spend. Bounded (≤max-clock-skew seconds × max-rps), but worth noting. Fix: use `Math.floor(Date.now() / 86400000)` as the day index — single source of truth across lambdas.

- **R2-NEW-7 (P2) — `MAX_PAYLOAD_BYTES` still trusts client-set `content-length`** (Round-1 P1-7 unmitigated). Confirmed at `app/api/ai/feedback/route.ts:602-605` etc.

- **R2-NEW-8 (P3) — Reality-checker level-3 rewrite is Turkish-only** (`lib/reality-checker.ts:243-251`). Level-2 was extended for English; level-3 wasn't. Level-3 only fires when `claimedPosition` and `actualCount` are both invalid — extremely rare path — but the inconsistency is now in the code. Mirror the same English regexes used in level-2.

- **R2-NEW-9 (P3) — No backup story documented in repo.** No `docs/runbook/backups.md`, no `supabase/backups.sql` schedule. Production relies entirely on Supabase managed daily backups, which are sufficient for the current pre-launch stage but should be explicitly documented (retention period, restore drill cadence). 0-line code fix; a doc.

---

## 4) Audit checklist responses

- **A) `player_memory` race in SQL transaction?** Not done — read-modify-write in JS. Tracked as D-P0-4 / R2-still-open. Recommended fix: Postgres function `update_player_memory(p_user uuid, p_match jsonb)` doing the merge under `SELECT … FOR UPDATE` row lock, or refactor to append-only schema.

- **B) `analyses` RLS via browser client** — confirmed risk (R2-NEW-2 above). The `createBrowserClient` from `@supabase/ssr` does propagate cookies in normal operation, but any cookie-rotation/expiry edge case will silently fall back to localStorage with no UI surface. Same bug class as the player-memory one, different table.

- **C) `find_user_by_email` perms** — verified. `supabase/0003_user_lookup.sql:37-38` revokes from `public, anon, authenticated` and grants only to `service_role`. All callers use `createServiceSupabase()` (`app/(auth)/register/actions.ts:111`, `app/(auth)/verify/actions.ts:87,183`, `app/(auth)/login/actions.ts:80`). `SUPABASE_SERVICE_ROLE_KEY` is documented in `.env.example:16` — required for these actions to function. If unset in Vercel the OTP/login flow will throw at module-load with `"SUPABASE_SERVICE_ROLE_KEY is missing — required for OTP server actions"`.

- **D) KB loading** — unchanged from Round 1. Synchronous reads, no cache. R2-NEW-3 above.

- **E) AI route token logging** — IMPLEMENTED across all four AI routes. Each logs `prompt_tokens`, `cached_tokens`, `completion_tokens` after every OpenAI call:
  - `app/api/ai/feedback/route.ts:486-489`
  - `app/api/ai/insight/route.ts:271-275`
  - `app/api/ai/report/route.ts:689-692` (also logs `finish` reason)
  - `app/api/ai/vision/route.ts:807-810`
  No cost-conversion / aggregation / Sentry span yet — just stdout. Fine for current scale; flag for revisit when MAU > 1k.

- **F) deleteAccount + CASCADE** — verified clean. `app/account/delete/actions.ts:60` calls `admin.auth.admin.deleteUser(user.id)` which deletes the `auth.users` row. Both `analyses` and `player_memory` declare `references auth.users(id) on delete cascade` (`0004:28,70`). Profile row also cascades (`0002:49`). All three child tables drop in one transaction. Safe.

- **G) Migration ordering** — `0002` MUST run before `0004` because `0004:107-109` references `public.tg_set_updated_at` which is created in `0002:36-42`. Migration files are numerically prefixed (`0002`, `0003`, `0004`) so any conventional runner applies them in the right order. NOT documented in a `supabase/README.md`. Worth adding (1-2 lines) to prevent a future maintainer from dropping `0002` independently.

- **H) Backup story** — R2-NEW-9. No documented strategy in repo.

---

## 5) Summary

| Category | Count |
|---|---|
| Round-1 P0 verified FIXED | 3 (D-P0-1, D-P0-3, D-P0-5) |
| Round-1 P0 PARTIAL / app-layer only | 1 (D-P0-2 — trigger unchanged, register catches) |
| Round-1 P0 STILL OPEN | 1 (D-P0-4 — player_memory race, deferred) |
| Round-1 P1 verified FIXED | 2 (P1-2, P1-10) |
| New P1 | 2 (R2-NEW-1 orphan SQL, R2-NEW-2 analyses browser-client RLS) |
| New P2 | 4 |
| New P3 | 3 |

The two new P1s are real and will bite. R2-NEW-1 is a 1-minute fix (delete the orphan file). R2-NEW-2 is structurally identical to D-P0-5 and deserves the same treatment.

---

**Verdict: NEEDS FIX.**
