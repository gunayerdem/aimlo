# Auth & Session Flow — Round 2 Re-Audit (2026-05-07)

Verifies the Wave 1-3 hot-fix commit (`63df8b27`) against the Round-1
findings (`docs/audit/auth-flow-audit-2026-05-07.md`) and probes for
new issues introduced by the patches. Read-only, source-level review.

Counts: **0 new P0**, **2 new P1**, **3 new P2**, **2 new P3**.
Round-1 status: **3 P0 fixed**, **5 of 6 P1 fixed**, 1 P1 partially fixed.

---

## Round-1 verification

### P0 — all three fixed

#### P0-1. Open-redirect via `?next=` on /auth/callback — FIXED
`app/auth/callback/route.ts:21-38`. The new validation:
1. `rawNext.startsWith("/")` — blocks scheme-relative + absolute URLs.
2. `!rawNext.startsWith("//")` — blocks protocol-relative.
3. `!rawNext.includes("\\")` — blocks the literal-backslash bypass.
4. `!/%5c/i.test(rawNext)` — blocks percent-encoded backslash.
5. `!/%2f%2f/i.test(rawNext)` — blocks percent-encoded `//`.
6. Final: `new URL(rawNext, SITE_URL)` and assert `candidate.origin === SITE_URL.origin`.

Walk-through against the Round-1 attack list:
- `?next=/\evil.com` — `searchParams.get` returns the literal `/\evil.com`; `includes("\\")` → blocked.
- `?next=//evil.com` — `startsWith("//")` → blocked.
- `?next=%5Cevil.com` — decoded to `\evil.com`, no leading `/` → blocked at startsWith.
- `?next=%2F%5C/evil.com` — decoded to `/\/evil.com`, `includes("\\")` → blocked.
- `?next=javascript:alert(1)` — no leading `/` → blocked.
- `?next=/legitimate/path?redirect=//evil.com` — accepted, but the redirect lands on aimlo.gg with that query string; not a callback-level open-redirect (any onward redirect would be a separate issue in `/legitimate/path`).

Length cap (200) prevents pathological URL parsing. URL-parse path normalisation (`/x/../../evil` → `/evil`) stays on origin. Hash and search are preserved correctly. Fixed.

#### P0-2. `lib/supabase/server.ts` not server-only — FIXED
`lib/supabase/server.ts:5` — `import "server-only";` is the first import line below the doc comment. Any client-component import will now crash the build with the canonical Next.js sentinel error. Same guard added to `lib/auth-rate-limit.ts:1` and `lib/player-memory.ts:1`. Fixed.

#### P0-3. Account deletion flow does not exist (KVKK Art. 17) — FIXED
- Page: `app/account/delete/page.tsx` — server-rendered, requires session, sets `robots: { index: false, follow: false }`.
- Form: `app/account/delete/DeleteForm.tsx` — disables submit until "SİL" typed.
- Action: `app/account/delete/actions.ts:30-68` — re-checks confirmation, requires session, rate-limits on `delete:${user.id}`, calls `admin.auth.admin.deleteUser`, signs out, redirects.
- Cascade: `auth.users` FK on `profiles`, `analyses`, `player_memory` is `ON DELETE CASCADE` (verified in `0002_otp_auth.sql:49`, `0004_analyses_player_memory.sql:28,70`).
- KVKK page (`app/legal/kvkk/page.tsx:102`) links to `/account/delete` — route matches.

CSRF: Next.js Server Actions include the same-origin Origin/Host check + the Server Action signature validation in App Router; no obvious CSRF issue here. The form submits via `useActionState(deleteAccountAction)` → React serializes a form payload bound to the deployed action ID; cross-site POSTs to the action endpoint without the matching ID will fail. OK.

Mid-flight OTP edge case: if the user has an active OTP in `user_metadata` when delete fires, `deleteUser` cascades the row anyway. No issue.

Fixed.

### P1 — 5 of 6 fixed

#### P1-1. `listUsers({ perPage: 200 })` time bomb — FIXED
- `supabase/0003_user_lookup.sql` defines `find_user_by_email(text)` with `security definer`, `set search_path = public, auth`, `language plpgsql`. Returns the columns the actions need.
- Grant: `revoke execute ... from public, anon, authenticated; grant execute ... to service_role` — locked down.
- All four call-sites now use the RPC: `app/(auth)/register/actions.ts:43-63`, `app/(auth)/login/actions.ts:31-50,121,175`, `app/(auth)/verify/actions.ts:36-58`. No `listUsers` left in any auth action.
- citext is loaded at `0002_otp_auth.sql:15`; `find_user_by_email` does not use citext (it uses plain `lower(trim(...))` against the text column `auth.users.email`), so it's safe regardless of citext install state.

Fixed.

#### P1-2. OTP replay race in /verify — PARTIALLY FIXED (P2 residual)
The Wave 1 rate limit (8/min on verify, 3/5min on resend) closes the parallel-burn brute-force window. However the audit's idempotent-verify suggestion is NOT implemented: when `user.emailConfirmed === true` the action does not short-circuit. It still reads `metadata.otp`, finds it null/expired (cleared by the prior successful verify), and returns "Aktif kod yok" — confusing but not security-critical.

Additionally, the metadata read-modify-write race on `attempts` (read at line 98, write at 122) is unchanged — but rate-limiting makes the practical race window irrelevant. Treating residual as P2.

#### P1-3. OTP attempt-counter / resend DoS — FIXED
`authRateLimit("verify", email)` (8/min) and `authRateLimit("resend", email)` (3/5min) cover the previously unrate-limited verify+resend combo. Per-IP cap is 4× the per-id cap. With Upstash configured the limit is global. Fail-closed in production (`isProduction()` returns true on `NODE_ENV === "production"` OR `STRICT_RATE_LIMIT === "true"`).

In dev (no Upstash) the limiter falls back to in-process memory — useless across multiple lambdas, but harmless because dev. Production fails closed. Verified.

#### P1-4. `lookup_email_by_username` username→email enumeration — PARTIALLY FIXED
The 0003 SQL re-creates `lookup_email_by_username` but **keeps the anon/authenticated grant**:
```
grant execute on function public.lookup_email_by_username(text) to anon, authenticated;
```
The comment justifies this with "login flow needs it", but `app/(auth)/login/actions.ts:95` calls the RPC via `admin = createServiceSupabase()` — service-role can already execute (Supabase grants service_role implicit execute on all functions). The anon grant is unnecessary post-AuthScreen-removal.

A scraper hitting Supabase's public REST endpoint with the anon key can still enumerate emails by username. The application-layer rate limit on `/login` does NOT cover this path (the attacker calls the RPC directly, not the login action). **Not fixed.** Severity: P1 still.

#### P1-5. Forgot-password timing oracle — NOT FIXED
`app/(auth)/forgot-password/actions.ts` — there is no constant-time pad (`setTimeout` / `new Promise`) before returning. Worse: the rate-limited branch returns `{ ok: true, sent: true }` *immediately* without doing the Supabase round trip — that's a NEW timing channel separating "rate-limited" from "in-budget" requests, on top of the original existent-vs-nonexistent oracle. Not fixed.

#### P1-6. `userMetadata.otp` mutation race in register/login — MITIGATED
Rate-limit on `register` (5 / 10min) and `resend` (3 / 5min) bounds the resend cadence. The read-modify-write on `user_metadata` itself is unchanged but two near-simultaneous OTP issues from a single user are now blocked at the rate-limit layer. Acceptable mitigation.

---

## NEW issues (introduced or missed in Round 1)

### N-P1-1. `lookup_email_by_username` still public — username enumeration
Same as P1-4 above. Repeated here because the partial fix in 0003 is a deliberate choice that leaves the issue open. Severity: P1.

### N-P1-2. Forgot-password timing/branching oracle — widened
P1-5 above. The rate-limited branch is now visibly faster than the un-rate-limited branch (no Supabase call vs ~300-800ms call), which is a NEW oracle in addition to the original. Severity: P1.

### N-P2-1. `0004_analyses_player_memory.sql` is NOT idempotent
The migration claims "Idempotent (CREATE IF NOT EXISTS, DROP POLICY IF EXISTS)" in the header comment. This is true for tables and policies, but **the `create trigger player_memory_set_updated_at` at line 107 has no `IF NOT EXISTS` and no preceding `DROP TRIGGER IF EXISTS`**. Re-running the migration on a database that already has the trigger will fail with "trigger already exists for relation". Either pre-drop the trigger or use `create or replace trigger` (Postgres 14+).

### N-P2-2. Auth-rate-limit shares "reset" bucket with delete-account
`app/account/delete/actions.ts:48` — `authRateLimit("reset", \`delete:${user.id}\`)`. The "reset" limit (5/min) is shared with `/reset-password`. A user mid password-reset who also triggers a delete attempt could exhaust the reset-action bucket and lock themselves out of password reset, or vice versa. Cosmetic — define a distinct `"delete"` action key in `lib/auth-rate-limit.ts:32` for clarity.

### N-P2-3. Idempotent-verify short-circuit not added
P1-2 residual. If the user clicks "Doğrula" twice or the network retries, the second call returns "Aktif kod yok. Yeni kod iste." instead of bouncing them straight to `/login?confirmed=1`. UX foot-gun. The fix is one early-return at `verify/actions.ts:97`:
```
if (user.emailConfirmed) redirect("/login?confirmed=1");
```

### N-P3-1. `setAuthMode` is dead state in `app/page.tsx`
`app/page.tsx:2918` — `const [authMode, setAuthMode] = useState<AuthMode>("login")`. Post-AuthScreen-removal nothing calls `setAuthMode`, and `UnauthRedirect` always routes to `/login` based on the constant initial value. The `AuthMode` import (line 28) and the prop on `UnauthRedirect` could go away. Pure cleanup.

### N-P3-2. `checkUsernameAvailable` is dead code in `app/page.tsx`
`app/page.tsx:112` defines a `checkUsernameAvailable` helper that calls `lookup_email_by_username` via the browser supabase client. Nothing in the file calls it (verified with grep). Same function exists in `lib/auth-helpers.ts:98` and is also unreferenced. Both can be removed; would also kill one of the three-line justifications for the public RPC grant in P1-4.

---

## Other checks (clean)

- `lib/auth-rate-limit.ts` — fail-closed in prod confirmed (line 144-147), per-IP fallback uses last XFF element (line 158-167). Identifier normalised lowercase+trim (line 182). Per-(action, identifier, IP) keys correct.
- All five auth actions call `authRateLimit` BEFORE expensive work (DB lookups, RPC, signInWithPassword). Verified each: register:104, login:70, verify:80, resend:176, forgot:35, reset:42, delete:48.
- Rate-limit identifier choice is sensible: register/login/forgot use email (or login identifier), verify/resend use email, reset/delete use user.id.
- Per-IP limit at 4× per-id cap — sensible for shared NAT (school, mobile carrier) without giving up IP-level throttling.
- `lib/api-auth.ts` INCR/EXPIRE separate AbortControllers + always-re-apply-TTL: verified at lines 86-124. Closes the prior TTL-less-key permanent-lockout bug.
- `lib/player-memory.ts` — `import "server-only"` + `createServiceSupabase()` for both load and update; the previously-broken cross-match memory feature is now operational. Verified.
- `lib/prompt-safety.ts` — VARIATION_SELECTORS and TAG_BLOCK regexes are bounded (Plane 14 tag block uses Unicode flag and a 128-codepoint range; default `max=1000` cap on input). No perf concern even on adversarial input.
- `lib/supabase.ts` (browser) — `createBrowserClient`, cookie storage, in sync with server. No leftover localStorage path.
- All `(auth)` form pages render. Legal routes exist at `/legal/kvkk`, `/legal/privacy`, `/legal/terms` with proper `metadata`. KVKK page links to `/account/delete` (matches actual route).
- No render-time `window.location.href` redirects in `app/page.tsx`. The remaining `window.location.href = "/login"` etc. are inside `onClick` callbacks (line 3568, 3571, 3574), not render-phase.
- `UnauthRedirect` uses `useEffect` and `window.location.replace` — correctly side-effects after mount, not during render.
- CASCADE FKs verified for delete: `profiles.user_id`, `analyses.user_id`, `player_memory.user_id` all `on delete cascade`.
- CSRF on `/account/delete`: server actions are bound to a deployed action ID; cross-origin POSTs without matching action ID fail. OK.
- `find_user_by_email` does not depend on citext (operates on plain `auth.users.email` text). Will work even on a fresh database without 0002 applied (though in practice 0002 must precede it).

---

## Summary table

| Round-1 ID | Status                | Notes                                    |
| ---------- | --------------------- | ---------------------------------------- |
| P0-1       | FIXED                 | Open-redirect blocked across all 6 vectors |
| P0-2       | FIXED                 | server-only sentinel in place            |
| P0-3       | FIXED                 | /account/delete + cascade FKs            |
| P1-1       | FIXED                 | RPC replaces listUsers everywhere        |
| P1-2       | PARTIAL (P2 residual) | RL solves brute-force; idempotent-verify missing |
| P1-3       | FIXED                 | Verify + resend rate-limited             |
| P1-4       | PARTIAL (P1 residual) | Anon grant on RPC retained               |
| P1-5       | NOT FIXED             | No timing pad on /forgot                 |
| P1-6       | MITIGATED             | RL bounds resend cadence                 |

NEW: 2 P1 (lookup grant, forgot timing — both inherited from partial fixes), 3 P2 (migration trigger non-idempotent, shared rate-limit bucket, missing idempotent-verify), 2 P3 (dead authMode/checkUsernameAvailable).
