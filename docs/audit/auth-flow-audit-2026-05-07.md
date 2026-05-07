# Auth & Session Flow — Brutal Audit (2026-05-07)

Scope: web app `/Users/gunayerdem/Desktop/aimlo/` only. Read-only; no source modifications.

The recently-fixed bug (client `localStorage` Supabase vs server cookie SSR) was the canary. This audit chases the same class of issue across the rest of the auth surface: anything that looks fine in isolation but breaks under real flow / weird input / cold-start / load.

Counts: **3 P0**, **6 P1**, **5 P2**, **3 P3**.

---

## P0 — Security or data loss

### P0-1. Open-redirect via backslash in `?next=` on `/auth/callback`
- **File + line:** `app/auth/callback/route.ts:16`
- **Description:** The whitelist is `rawNext.startsWith("/") && !rawNext.startsWith("//")`. This blocks `//evil.com` but not values starting with a single `/` followed by a backslash. Example: `?next=/\evil.com`. The check passes (starts with `/`, does not start with `//`). Server then sets `Location: https://aimlo.gg/\evil.com`. WHATWG URL (Chrome/Firefox/Safari) normalises `\` to `/` during parsing, so the browser resolves the Location header to `https://evil.com/`. Verified locally: `new URL('/\\evil.com', 'https://aimlo.gg').href === 'https://evil.com/'`.
- **Impact:** Phisher sends a Supabase password-reset / magic-link with a crafted `redirect_to` and lands the freshly-authenticated user on attacker-controlled domain right after `exchangeCodeForSession` succeeds. Cookie is already set by the time the redirect fires. Classic open-redirect for credential-relay / OAuth-fishing.
- **Suggested fix:** Reject any `next` containing `\`, `:`, `@`, or any `//` substring (not just prefix). Better: parse `next` with `new URL(next, origin)` and assert `parsed.origin === origin && parsed.pathname.startsWith('/')`.

### P0-2. `lib/supabase/server.ts` is not server-only — service-role key can leak
- **File + line:** `lib/supabase/server.ts` (no `import "server-only"` / no `"use server"` directive)
- **Description:** `createServiceSupabase()` reads `SUPABASE_SERVICE_ROLE_KEY` and exports a function from a regular module. Today, callers are all `"use server"` files (register/login/verify actions) so the secret never ships. But there is **no enforcement** preventing a future client component from `import { createServiceSupabase } from "@/lib/supabase/server"`. Next.js will happily bundle that import client-side, and `process.env.SUPABASE_SERVICE_ROLE_KEY` is empty at the client → the app *throws*, but the import statement itself can leak the key if it's ever re-typed as `NEXT_PUBLIC_*` or if a build-time inliner sees a `process.env.<name>` reference. More immediately: the *anon* fallback `SUPABASE_URL`/`ANON_KEY` is shared with the server client, but a careless refactor (e.g. exporting a module-level `serviceClient = createServiceSupabase()`) would build-fail on client but in *server-side* JS that gets exposed via Edge runtime errors / source maps.
- **Impact:** Service role bypasses RLS. Leakage = full DB read/write/delete. The lack of `import "server-only"` is the missing guardrail.
- **Suggested fix:** Add `import "server-only";` as the first line of `lib/supabase/server.ts`. This will *fail the build* at the moment any client component imports the module — the canonical Next.js pattern for env-key isolation.

### P0-3. Account deletion flow does not exist (KVKK / Article 17 GDPR violation)
- **File + line:** none — codebase has zero `deleteUser` / `delete account` paths. Verified by `grep -rn "deleteAccount\|admin.deleteUser\|hesab.*sil"` — no hits in `app/`, `lib/`, `components/`.
- **Description:** Registration form forces KVKK consent (`schemas.ts:42`), but there is no UI or API for the user to exercise their data-erasure right. Even the SQL migration `0002_otp_auth.sql:110` says "No DELETE policy by user — account deletion goes through admin endpoint" but that endpoint isn't built.
- **Impact:** KVKK Article 11 / GDPR Art 17 require user-initiated deletion. Compliance gap once you have a real user. Also Vercel/legal exposure if anyone files a complaint.
- **Suggested fix:** Add a `/api/account/delete` route (Bearer-auth → `admin.deleteUser(user.id)`), plus a settings UI with double-confirm. Cascades on `auth.users` already drop profile + analyses + player_memory.

---

## P1 — Functional bugs

### P1-1. `listUsers({ perPage: 200 })` silently breaks past 200 accounts
- **File + line:** `app/(auth)/register/actions.ts:97-100`, `app/(auth)/login/actions.ts:87-90,145`, `app/(auth)/verify/actions.ts:39`
- **Description:** All four service-role lookups use `admin.auth.admin.listUsers({ page: 1, perPage: 200 })`. The register file's comment ("Beta-scale OK with listUsers; switch to a server RPC if user count > 1k") notes the limit, but past 200 users `findUserByEmail` will return `null` for any user whose row is past page 1. Verify will say "Bu e-posta için aktif bir kayıt yok. Önce kayıt ol." for legit users mid-OTP. Login's unverified-OTP re-issue and gate paths will silently fail. Register's existing-user check will let a duplicate slip past the friendly check and only fail at the unique constraint with a less helpful error.
- **Impact:** P1 today (beta), P0 on day 201. Classic time-bomb — perfectly fine in dev/staging, breaks in prod once user count crosses the threshold without any deploy or env change.
- **Suggested fix:** Replace each `listUsers` + `find` with a single SQL RPC: `select * from auth.users where email = lower($1) limit 1`, security-definer, callable only via service-role helper.

### P1-2. Verify success window is wide-open to OTP replay (no atomic invalidate)
- **File + line:** `app/(auth)/verify/actions.ts:106-127`
- **Description:** The success branch does:
  1. compute hash, timing-safe compare → `valid`
  2. `await admin.auth.admin.updateUserById(... email_confirm: true, otp: null)`
  3. `redirect("/login?confirmed=1")`
  Two concurrent requests with the same valid code (user double-clicks "Doğrula", or mobile back-button triggers re-submit) both pass step 1 because the metadata is read at step (1) and only written at step (2). The second request also reaches step 2, succeeds (idempotent), and the second `redirect` may or may not reach the user. More worrying: between (1) read and (2) write the failure path on a *wrong* code increments `attempts`, but a concurrent right-then-wrong race could overwrite `attempts: 0` (right path's clear) with `attempts: N+1` (wrong path's increment based on stale read).
- **Impact:** Not a security hole today (the code is single-use because step 2 nulls it; subsequent verify will hit "Aktif kod yok"). But the metadata-read-then-write race lets a stale `otp` object stomp the `email_confirm: true` state if requests arrive in the unlucky order. User sees "Kod hatalı" right after a "Doğrula" succeeded — confusing flow. No replay protection if `email_confirmed_at` was already set (`emailConfirmed` is read but not used to short-circuit the flow).
- **Suggested fix:** (a) Short-circuit if `user.emailConfirmed` is already true → redirect straight to `/login?confirmed=1` (idempotent verify). (b) Move OTP storage out of `user_metadata` and into a dedicated table with a `WHERE` clause that asserts the hash hasn't been cleared yet (single UPDATE that returns row count → atomic single-use).

### P1-3. OTP attempt counter is account-level DoS vector
- **File + line:** `app/(auth)/verify/actions.ts:91-93,107-113`
- **Description:** Anyone who knows a victim's email can hit `/verify` with bogus codes 5 times. After `attempts >= MAX_ATTEMPTS`, the only path forward is "Yeni kod iste" → `resendAction`. `resendAction` has no rate limiting at all (`lib/api-auth.ts` is for `/api/*` routes — server actions don't go through it). Attacker scripts: 5 verify hits + 1 resend hit per minute = victim never finishes registration / verification.
- **Impact:** Account-level DoS during the registration window, and post-recovery for any unverified leftover account. Unverified leftover accounts also get their email spammed: each resend triggers a Resend.com email to the victim → free-tier 100/day burns fast, plus the victim's mailbox fills with codes they didn't request.
- **Suggested fix:** Per-IP and per-email rate limits on `verifyAction` and `resendAction`. Reuse the Upstash helpers from `lib/api-auth.ts` keyed on email + IP. Also: only the *correct* email owner should be able to flip `attempts` — i.e. require a one-time challenge token issued at /register-time so random IPs can't push attempts.

### P1-4. `lookup_email_by_username` enables username → email enumeration
- **File + line:** `supabase/0002_otp_auth.sql:120-145`, `app/page.tsx:115-117`, `lib/auth-helpers.ts:101-104`, `app/(auth)/login/actions.ts:59-66`
- **Description:** The RPC returns the email (string) for a given username, or null. With anon-key grant (`grant execute on function ... to anon`) and no rate limit at the DB layer, a scraper can iterate through usernames, harvest emails, and use the email list for phishing or correlation with breached-email databases. Comment in SQL acknowledges this trade-off ("would be safer, but auto-karar login flow needs the email") but the auto-karar flow needs only a *boolean* — `signInWithPassword` is server-side in `login/actions.ts` and already runs as service-role.
- **Impact:** Username → email PII leak. Especially severe given KVKK exposure; emails are personal data under Turkish law. Anyone hitting `/api/...` with the anon key can enumerate.
- **Suggested fix:** Drop the public grant. Make `lookup_email_by_username` callable only by service-role (revoke from anon/authenticated). Server actions already use the service client. The legacy client-side `checkUsernameAvailable` (lib/auth-helpers.ts:101) is only used by the dead AuthScreen — see P2-1.

### P1-5. Forgot-password email enumeration via Resend timing
- **File + line:** `app/(auth)/forgot-password/actions.ts:30-43`
- **Description:** UI returns the same "if registered, link sent" success regardless. Good. But Supabase's `resetPasswordForEmail` issues a real Resend-templated email only when the user exists, taking ~200-800ms on the network path. For non-existent emails the call returns nearly instantly (Supabase short-circuits). An attacker can binary-classify any email by timing the server action's response (Server Actions report their wall-clock duration to the client via the `Server-Timing` header on Vercel and via raw response time to JS).
- **Impact:** Email-presence oracle. Lets an attacker confirm whether `someone@gmail.com` has an account. Lower severity than P1-4 (this is gmail→yes/no, not username→email) but still a leak.
- **Suggested fix:** Pad the response to a constant minimum (e.g. `await new Promise(r => setTimeout(r, 700))` after the Supabase call when no error, slightly more when there is) — better yet, fire-and-forget the Supabase call and always return after a fixed delay.

### P1-6. `userMetadata.otp` mutation race in register & login retry path
- **File + line:** `app/(auth)/register/actions.ts:133-145` and `app/(auth)/login/actions.ts:93-103,148-158`
- **Description:** `updateUserById(... user_metadata: { ...existingUser.user_metadata, ... })` performs read-modify-write on `user_metadata`. Two near-simultaneous register POSTs (user clicks twice / refreshes / opens duplicate tab) each fetch the same `existingUser.user_metadata`, mutate `otp`, and last-write-wins. If one of the two also updated other metadata (e.g. `username`), the second wipes it. More important: the 60-second resend cooldown is purely *client-side* (`VerifyForm.tsx:60-68`) — a refresh re-mounts and resets the timer. An impatient user spamming the register page also generates two emails with two different codes; the user typing the *first* code into /verify will hit "Kod hatalı" because the second register call clobbered it.
- **Impact:** UX foot-gun: user enters the code from the first email, gets "Kod hatalı", thinks the system is broken. Race window is whole network round-trip (~500ms-1s).
- **Suggested fix:** Server-side cooldown stamp in metadata (`otp.lastSentAt`) — refuse a fresh OTP issue within 60s. Or move OTP into a dedicated `otp_codes` table with `INSERT ... ON CONFLICT (user_id) DO UPDATE WHERE excluded.created_at > otp_codes.created_at + interval '60 seconds'`.

---

## P2 — UX / latent issues

### P2-1. Legacy `AuthScreen` is dead code but still compiled into the bundle
- **File + line:** `app/page.tsx:2898-3162`
- **Description:** `AuthScreen` is defined and `authMode`/`AuthMode` types still flow through the page. There are no `<AuthScreen ...>` JSX render sites (verified via grep). The function is therefore reachable only if someone re-introduces the JSX. It still calls `supabase.auth.signUp(...)` (line 2970) which sends Supabase's *built-in* confirmation email, completely bypassing the OTP flow. If a future feature accidentally re-renders it (e.g. from a refactor that wires `authMode === "register"` to render this instead of the redirect), users would receive Supabase's default email *and* the cookie session would be set without the OTP gate.
- **Impact:** ~265 lines of dead code in the client bundle (size). More importantly: a landmine for the next person editing this file. The `data.user && data.session` branch (line 3014) ignores `email_confirmed_at` — duplicates the very gate that `login/actions.ts:140` was added to enforce.
- **Suggested fix:** Delete `AuthScreen` (lines 2898-3162). Remove `AuthMode` import (line 28), `authMode` state (3169), and the now-unused branch at 3838-3842. The bounce becomes a single `redirect("/login")` at the top of `Home`.

### P2-2. `/legal/kvkk`, `/legal/terms`, `/legal/privacy` are 404s
- **File + line:** `app/(auth)/register/RegisterForm.tsx:269,278,287` (links) — `app/legal/` directory does not exist (verified)
- **Description:** Register form links to three legal docs from the KVKK consent text. None of those routes exist in `app/`. User clicks "KVKK Aydınlatma Metni" → 404.
- **Impact:** Compliance gap (KVKK *requires* the consent text be available before consent is taken — clicking through a broken link is arguably non-consent), and obvious UX bug.
- **Suggested fix:** Add `app/legal/{kvkk,terms,privacy}/page.tsx` with the actual text (or `mdx`). Block deploy if any of the 3 are missing.

### P2-3. CSP `connect-src` allows realtime but not Resend / OpenAI
- **File + line:** `next.config.ts:46-47`
- **Description:** `connect-src 'self' https://*.supabase.co`. This is correct for browser-side Supabase but does not mention any CDN. The auth flow itself is fine (Resend & OpenAI calls are server-side). However: `frame-ancestors 'none'` plus `X-Frame-Options: DENY` is intentional but means the auth pages cannot be embedded in any partner integration (e.g. desktop app future webview) — flag as future constraint.
- **Impact:** Not a current bug. Worth flagging that any future client-side integration with third-party domains (analytics, Stripe, etc) will require CSP relaxation, and CSP changes can break the auth redirect chain in subtle ways (`form-action 'self'` already blocks any external POST target).
- **Suggested fix:** None now. Add a regression test that fetches `/login` and asserts CSP header is unchanged.

### P2-4. Mid-session refresh: confirm cookie writes on token rotation in Server Actions
- **File + line:** `lib/supabase/server.ts:34-44`, all server-action callers
- **Description:** `createServerSupabase` swallows cookie-write errors when called from RSC ("Server Components cannot mutate cookies"). When `signInWithPassword` or `getUser` triggers an auto-refresh during a Server Component render, the new tokens are computed but the `setAll` catch silently drops them. Subsequent requests still have the *old* refresh token → eventually it ages out → user gets logged out without warning. This won't happen on the auth pages themselves (they're Server *Actions*, where cookie writes succeed) but it can happen during any RSC render of `/` after Home is migrated to RSC.
- **Impact:** Silent session expiry on long-lived SSR-heavy pages. Today, `app/page.tsx` is `"use client"` so the issue is dormant. Latent.
- **Suggested fix:** Document in the file header: "Do not call this helper from RSC unless you accept silent refresh failures." Provide a separate `createServerSupabaseRO` that doesn't even attempt cookie writes.

### P2-5. Double-redirect from `/` for unauthenticated users (full reload)
- **File + line:** `app/page.tsx:3837-3848`
- **Description:** When `!user`, the component sets `window.location.href = ...` *during render* (inside `if (typeof window !== "undefined")`). This triggers a full-page navigation, but it also causes one render with the spinner to flash. Worse: if `setVerifiedBanner("success")` fired earlier in the same effect cycle, the success banner is mounted briefly and then unmounted by the redirect — user sees a flash of "✓ E-posta doğrulandı" right before being bounced to `/login`. Confusing.
- **Impact:** Glitchy UX. Not broken. Spinner-then-flash-then-login.
- **Suggested fix:** Move the redirect out of render — `useEffect(() => { if (!user && !authLoading) router.replace(authMode === "register" ? "/register" : "/login"); }, [user, authLoading])` and use Next's `router.replace` so it doesn't do a hard reload.

---

## P3 — Nits

### P3-1. `OTP_HMAC_SECRET` rotation has no graceful path
- **File + line:** `lib/otp.ts:35-43`, `app/(auth)/verify/actions.ts:97-100`
- **Description:** If the secret is rotated, every in-flight OTP becomes invalid (hash mismatch). Users mid-registration see "Kod hatalı". No way for them to know it's a server config change. They burn 5 attempts and then must "Yeni kod iste" — fine, but the experience between rotation and resend is mysterious.
- **Impact:** Operational footgun during emergency secret rotation.
- **Suggested fix:** Support `OTP_HMAC_SECRET` and `OTP_HMAC_SECRET_PREVIOUS` — verify accepts either; new codes use only current. Sunset previous after 11 minutes.

### P3-2. Login UX requires re-typing password right after verify
- **File + line:** `app/(auth)/verify/actions.ts:138`, `app/(auth)/login/page.tsx:50-52`
- **Description:** After `/verify` succeeds, user is bounced to `/login?confirmed=1` and must re-type the password they just chose 30 seconds ago. The verify action's comment explicitly notes this is to avoid the brittle `verifyOtp` cookie-flush issue on serverless.
- **Impact:** UX friction on the most-friction-sensitive page (registration funnel). Not a bug — design choice acknowledged in the comment.
- **Suggested fix:** Trade-off only. To keep the password in-flight: signed-cookie carry of `email` + short-lived nonce → /login auto-fills identifier and pre-fetches a CSRF token; user clicks one button. *Don't* carry the password itself in the cookie even encrypted — re-key risk.

### P3-3. `verifySchema.code` accepts up to 8 chars, then `normalizeOtp` truncates to 6
- **File + line:** `app/(auth)/schemas.ts:53`, `lib/otp.ts:31-33`
- **Description:** Schema allows 6-8 chars, normalize strips non-digits and slices to 6. Inputs like `"123-456-78"` (10 chars) fail schema (max 8) but `"123-456"` (7 chars with dash) passes schema and normalises to `"123456"`. Inconsistent — schema says max 8, normaliser says first 6 digits. If a user pastes a code with extra spaces (`"123 456 99"`), the normaliser yields `"123456"` and the trailing `99` is silently dropped.
- **Impact:** Users may not realise a paste went wrong. Also: timing of the schema is wrong — schema validates raw, normaliser runs after. Easier to validate normalised form.
- **Suggested fix:** Normalise *first*, then schema-check `length === 6`. Drop max:8 from schema.

---

## Cross-cutting observations (not numbered)

- The `lookup_email_by_username` RPC is called from three places: legacy AuthScreen (dead), `lib/auth-helpers.ts` (only used by dead AuthScreen — verified — so also dead), and `login/actions.ts` (server-side, service-role). The grant to `anon` is no longer needed once the dead client paths are removed. Tightening the grant after deleting AuthScreen is essentially free.
- `lib/api-auth.ts` rate-limit is correctly fail-closed in prod (line 122-125) and the per-IP fallback uses the *last* element of `x-forwarded-for` (lines 277-281) — this is the correct Vercel-aware pattern. No issue here, called out because it's a common bug elsewhere.
- All four server action files start with `"use server";` — server-action boundary is clean. The risk is one level higher: `lib/supabase/server.ts` itself (P0-2).
- Verified the originally-fixed bug is actually fixed: `lib/supabase.ts` now uses `createBrowserClient` (cookie-based), and `app/page.tsx:3171,3183` use `supabase.auth.getSession()` / `onAuthStateChange()` against that same client. The Home `useEffect` will see the session set by `login/actions.ts`'s `signInWithPassword` because both sides read/write the same cookie store.

---
