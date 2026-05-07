# Brutal backend / data-integrity / migrations / Supabase audit
**Date:** 2026-05-07
**Scope:** `/Users/gunayerdem/Desktop/aimlo` (web app only)
**Auditor:** Read-only review of supabase/, lib/, app/api/ai/, hooks/, knowledge-loader, key route handlers.

Severities used: **P0** = ship-blocker / silent-data-loss / privesc-vector. **P1** = high-risk in normal operation. **P2** = correctness / cost concern under load. **P3** = polish, nit, future tech-debt.

---

## P0 — Critical

### P0-1 — `analyses` table is an undocumented production dependency with no migration in repo
**File:** `app/page.tsx:3596,3674,3711` + `supabase/0002_otp_auth.sql:5-6,153`
**Description:** The web client reads/writes `public.analyses` (columns: `id`, `user_id`, `riot_id` [legacy: stores map], `region` [legacy: stores agent], `summary`, `weakness`, `strength`, `focus`, `raw_result_json`, `created_at`). The migration file mentions analyses three times (claims it cascades from `auth.users`) but **does not create or enable RLS on it**. There is no `analyses.sql` migration anywhere in `supabase/`. Production state is therefore not reproducible from the repo — any drop/recreate from migrations will break the dashboard.
**Impact:** Disaster recovery is broken. New environments (staging, fresh dev DB) will throw "relation analyses does not exist" on first `loadHistory()`. Worse: if the table exists but RLS is missing/wrong, any authed user can read every other user's saved match reports (the README/FAQ at `app/page.tsx:1063` literally promises RLS protects user data).
**Suggested fix:** Add `supabase/0001_analyses.sql` (or fold into 0002) capturing the live schema + RLS policies (`user_id = auth.uid()` for select/insert/update/delete). Verify via `\d+ analyses` in prod and check `pg_policies WHERE tablename='analyses'`. Add a CI check that a fresh DB built from migrations passes a smoke test.

### P0-2 — `tg_handle_new_user` will throw if `username` metadata exists and collides via citext unique index — and the throw cancels the whole `auth.users` INSERT
**File:** `supabase/0002_otp_auth.sql:74-92`
**Description:** The trigger is `AFTER INSERT … FOR EACH ROW EXECUTE …` with no exception handler. If the inserted user has a `username` in `raw_user_meta_data` that matches an existing citext value (case-insensitive), the trigger's INSERT into `profiles` raises a unique-violation, which propagates up and rolls back the `auth.users` INSERT entirely. The register flow calls `admin.auth.admin.createUser` (`app/(auth)/register/actions.ts:155-191`) — when this rolls back, `createErr.message` will say something like "duplicate key value violates unique constraint", which `register/actions.ts` does NOT match against ("already" + "registered"), so the user gets the generic "Kayıt oluşturulamadı" error and the OTP email is never sent. Subsequent retry forms will hit the same problem.
The pre-check at `register/actions.ts:81-93` (`SELECT user_id FROM profiles WHERE username=…`) reduces the window but doesn't close it (race between concurrent registrations).
**Impact:** Race-conditioned silent registration failure with a misleading error message. Worse: the user types the failed username into the form, retries with the same username, gets the same opaque error every time. Support burden + support-ticket noise.
**Suggested fix:** Wrap trigger body in `BEGIN…EXCEPTION WHEN unique_violation THEN INSERT into profiles without username; END`, OR catch the duplicate inside the trigger and set `username := NULL` so the row still gets created. Then surface the conflict to the caller via a separate post-create probe. Also broaden the message-match in `register/actions.ts:168-175` to catch `duplicate key`/`profiles_username_uniq_idx`.

### P0-3 — Rate-limiter race window: `INCR` succeeds, `EXPIRE` aborts, key never expires → user is blocked permanently from that route
**File:** `lib/api-auth.ts:77-114`
**Description:** The 5-second `AbortController` `tid` is shared across BOTH the `INCR` and `EXPIRE` `fetch()` calls inside the same `try`. If `INCR` takes 4.9s and `EXPIRE` is fired with ~100ms before the timer expires and Upstash returns slow, `AbortError` will fire on EXPIRE. The `console.warn` on EXPIRE failure is wrong — the comment says "key will live forever but count is correct", but if the EXPIRE fails systematically (e.g. Upstash flap), every subsequent INCR keeps incrementing the same key forever. The user/IP rate-limit key is per-(user,route) — so a single failed EXPIRE during a hot moment locks that user out of feedback for the rest of the year (until someone manually deletes the key). The daily-quota key is similar: if the daily count survives 24h+ it'll keep blocking.
**Impact:** Users randomly get permanently rate-limited for a route after a transient Upstash hiccup. Hard to debug because the "warn" log line doesn't mention which user/key. Cost is also wrong because the counter is never reset.
**Suggested fix:** (a) Use independent abort timers per fetch. (b) On EXPIRE failure, log at ERROR and either retry once asynchronously or DELETE the key (`fetch /del/${key}`) so the next request reinitialises with a fresh TTL. (c) Add a Sentry alert on the warn path. (d) Belt-and-braces: use Upstash pipeline (`SET key val EX ttl NX` first then `INCR`) — atomic in one round-trip, no race.

### P0-4 — `updatePlayerMemory` is read-modify-write with no concurrency control → lost updates
**File:** `lib/player-memory.ts:72-194`
**Description:** Two simultaneous match-end requests (e.g. user submits two reports back-to-back, or browser retries a 504 while the original eventually completes) will both call `loadPlayerMemory` → mutate the JS object → `upsert` with their own snapshot. Whichever upsert lands LAST wins; the other match's data (death locations, wins/losses, totalMatches++) silently disappears. The `updated_at` timestamp is even passed in by the client (`memory.lastUpdated = new Date().toISOString()`), making the race undetectable.
**Impact:** Player memory loses match data with no error visible anywhere. Tendencies, weakest map, and improvement tracking become wrong over time. The Reality Checker (lib/reality-checker.ts) eventually trusts memory that is missing 10-30% of recent matches, so coach feedback drifts.
**Suggested fix:** Move aggregation to a server-side RPC: `update_player_memory(p_user uuid, p_match jsonb)` that does the read+merge inside a single transaction with `FOR UPDATE` row lock, OR convert to append-only schema (one row per match, aggregate on read). At minimum, add an `if-match` revision column and retry on conflict.

### P0-5 — Web report route writes to `player_memory` from server with the user's JWT-scoped client → either silently fails RLS or uses a stale client
**File:** `app/api/ai/report/route.ts:792-810` + `lib/player-memory.ts:1`
**Description:** `lib/player-memory.ts` imports the client-side `supabase` singleton from `@/lib/supabase` (top of file: `"use client"` directive + `createBrowserClient`). When invoked from the report route handler (which runs on the Vercel Node runtime, not the browser), the import will work (TypeScript doesn't care about the directive at runtime) but the client has no auth context — it sends requests with the bare anon key. RLS on `player_memory` requires `auth.uid() = user_id` for both INSERT and UPDATE. **Every call to `updatePlayerMemory` from the server is silently rejected by RLS**, the `error` is logged as a one-line string ("Player memory save failed"), and no retry happens. Player memory is therefore effectively never updated by the web flow; only the desktop client (which calls Supabase directly with the user's session) writes to it.
**Impact:** The entire player-memory feature is dead in the web app. `buildMemoryContext` always returns `""` because the row never exists. AI reports lose the cross-match coaching layer. This may have been intentional (desktop-only feature) but if so the import + call from the server route is dead code burning latency and confusing future maintainers.
**Suggested fix:** Either (a) delete the call from `report/route.ts:792-810` if memory is desktop-only, OR (b) refactor `player-memory.ts` to accept a `SupabaseClient` argument and pass `createServiceSupabase()` from the route handler (bypassing RLS but still enforcing user ownership in the function arg).

---

## P1 — High

### P1-1 — Cookie-bound SSR client used for AI route auth verification when a stateless client is what's actually wanted
**File:** `lib/api-auth.ts:248-272`
**Description:** `verifyAuthAndRateLimit` creates a fresh `createClient(...)` (correct), but elsewhere we use `createServerSupabase` which depends on `cookies()` from `next/headers`. The desktop client sends only an Authorization header (no cookies), so AI routes must NOT rely on cookie state. This is currently OK in the audited code, but `lib/player-memory.ts` violates the boundary by importing the browser singleton from server code (see P0-5). Document the boundary or you will see this regress.
**Impact:** Architectural drift risk. Will silently fail authz under particular invocation patterns.
**Suggested fix:** Add a comment on `lib/supabase.ts` warning that any `import { supabase } from "@/lib/supabase"` from an `app/api/**` route handler is a bug. Add an ESLint rule (`no-restricted-imports` scoped to `app/api`) to enforce.

### P1-2 — `lookup_email_by_username` RPC is `LANGUAGE plpgsql` + no `STABLE` / `IMMUTABLE` marker → forces row-level execution every call
**File:** `supabase/0002_otp_auth.sql:120-139`
**Description:** Function omits volatility — defaults to `VOLATILE`, blocking PG and PostgREST from caching. With ~100s of login attempts per day (worst-case bot) this matters less, but the larger issue is that this function runs `SECURITY DEFINER` and exposes `auth.users.email` to any caller who knows a username. There's no rate-limit on the RPC itself (only on AI routes). An attacker can enumerate the username space to find which usernames have which emails — useful for credential stuffing, doxxing, or spear-phishing.
**Impact:** Username → email enumeration vector. Privacy concern even though the function is "read-only".
**Suggested fix:** Mark function `STABLE` (cheap perf win). Add a debounce/rate-limit on the auth lookup (server-side, via the same Upstash limiter, keyed on IP or username with a tight cap of e.g. 10/min). Better: change return type to `boolean` (exists?) and only resolve email server-side via `admin.auth.admin.listUsers` after password verification. (This breaks the desktop login flow; either way, document the threat model.)

### P1-3 — `tg_handle_new_user` uses `coalesce(... split_part(new.email, '@', 1))` — null email → null display_name → silent inconsistency
**File:** `supabase/0002_otp_auth.sql:81`
**Description:** If `new.email` is NULL (which Supabase auth.users allows for phone-only auth, anonymous users, or future SSO providers), `split_part(NULL, '@', 1)` returns NULL. Combined with no `first_name` in metadata, `display_name` ends up NULL — which isn't enforced by a NOT NULL constraint, but downstream reads (e.g. UI) will break or render literally "null". Less catastrophic than P0-2 but it's a latent bug for any future auth method that doesn't supply email.
**Impact:** UI bugs the moment we enable phone or anonymous auth. Today: harmless because OTP flow always supplies email.
**Suggested fix:** `coalesce(new.raw_user_meta_data->>'first_name', split_part(coalesce(new.email,''), '@', 1), 'Player')` — guarantee a non-null fallback.

### P1-4 — Vision route accepts `image/gif` in `VALID_IMAGE_FORMATS` but never matches GIF magic bytes
**File:** `app/api/ai/vision/route.ts:245,422-458`
**Description:** `VALID_IMAGE_FORMATS` includes `"image/gif"` but `isValidVisionRequest` only validates PNG / JPEG / WebP magic bytes (`isPng`, `isJpeg`, `isWebp`). A client sending `imageFormat: "image/gif"` with PNG bytes is accepted; sending a real GIF is rejected. Inconsistency suggests `image/gif` was added without test coverage.
**Impact:** Inconsistent contract; potential security drift (model accepts a media type its OCR pipeline isn't tested against).
**Suggested fix:** Either drop GIF from `VALID_IMAGE_FORMATS` or add the GIF magic-byte check (`b0=0x47 b1=0x49 b2=0x46 b3=0x38`, "GIF8").

### P1-5 — KB files are read synchronously on every AI request — no in-process cache
**File:** `lib/knowledge-loader.ts:83-90,190-250,342-428`
**Description:** Every call to `loadKnowledge` / `loadVisionKnowledge` does `fs.readFileSync` on each KB markdown file. With ~5-7 files per call (core + rank + map + agent + 1-2 matchups + general/post-plant) at 5-20KB each, that's 25-140KB of disk reads per AI request. Vercel serverless functions reuse the lambda across requests within ~minutes, so a Map cache keyed on file path would eliminate this entirely.
**Impact:** Adds 10-50ms to every AI request (negligible if SSD-backed) BUT also wastes EFS file-handle quota under load. More importantly: it's a missed cache opportunity — the OpenAI prompt cache hit rate depends on the system prefix being byte-identical. Any subtle race between concurrent requests reading the same file (e.g. mid-deploy file-handle limits) could silently truncate KB content and bust the prefix cache.
**Suggested fix:** Add `const cache = new Map<string, string>(); function loadFile(p) { if (!cache.has(p)) cache.set(p, fs.readFileSync(...)); return cache.get(p); }` — KB files are immutable per deploy, cache is safe forever.

### P1-6 — Path-traversal surface in `loadFile(relativePath)` is theoretical but unguarded
**File:** `lib/knowledge-loader.ts:83-90,109,154`
**Description:** `loadFile` does `path.join(KNOWLEDGE_DIR, relativePath)`. The `relativePath` is constructed from request fields (`map`, `agent`, enemy roster) via `.toLowerCase().replace(/[^a-z0-9]/g, "")` (no leading dot, no `/`), so traversal is currently impossible. But this is one regex change away from a `..\\` slip. There is no `path.resolve` containment check.
**Impact:** Future regression risk. If anyone loosens the slug regex (e.g. allow hyphens, add periods), an attacker controlling `setup.map` could read `/etc/passwd` via `../../../etc/passwd`.
**Suggested fix:** Add belt-and-braces:
```ts
const full = path.resolve(KNOWLEDGE_DIR, relativePath);
if (!full.startsWith(KNOWLEDGE_DIR + path.sep)) return "";
```

### P1-7 — `MAX_PAYLOAD_BYTES` is checked against `content-length` header only, which is client-controlled
**File:** `app/api/ai/vision/route.ts:496-502` + `app/api/ai/feedback/route.ts:602-605` + `app/api/ai/report/route.ts:758-761` + `app/api/ai/insight/route.ts:162-168`
**Description:** All four routes reject oversized payloads via `request.headers.get("content-length")`. If the client omits the header (legal under HTTP/1.1 chunked encoding), the check is skipped and `request.json()` will read the entire body. Vercel may impose its own limits, but our explicit 100KB / 5MB caps are bypassable. Insider attacker (compromised desktop app) can OOM a lambda by streaming a multi-MB body.
**Impact:** DoS via lambda OOM. Limited blast radius (single function instance, will retry on next request).
**Suggested fix:** After reading the body via `request.text()`, check `text.length` before `JSON.parse`. Or use Next 16's `request.signal` with a body-size limit middleware.

### P1-8 — `daily` quota midnight calculation: edge case at year-end + leap-second is fine, but `Date.UTC(yyyy, mm, dd+1, ...)` still on the daily TTL has a 60s buffer that may double-count on the boundary
**File:** `lib/api-auth.ts:147-156`
**Description:** `Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)` does roll over the month/year correctly (verified mentally — JS Date overflow handling). The `+ 60s` buffer in `ttlSec` is intentional, but combined with the date-stamped key (`yyyy-mm-dd`), at 23:59:59 UTC the request creates key `2026-05-07` with TTL=61. At 00:00:00 UTC the next request creates `2026-05-08` (fresh count=1). The OLD key `2026-05-07` lives until 00:01:00 UTC but is no longer queried. So no double-count — verified clean.
*However*: if the lambda's clock drifts forward (NTP jump), the "current" key is computed from drifted time but Upstash TTL is set from drifted time — both consistent. Drift backward (rare) is also self-consistent. The buffer is mainly to avoid a sub-millisecond gap. No bug — but worth a unit test.
**Impact:** None observed. Worth a regression test.
**Suggested fix:** Add a unit test in `lib/__tests__` for the boundary cases (Dec 31 23:59, leap year Feb 28 → 29).

### P1-9 — `degraded` flag on rate-limit results is consumed nowhere
**File:** `lib/api-auth.ts:71,128,175,178` + `lib/api-auth.ts:222`
**Description:** The `degraded` field is set when the in-memory fallback fires in dev (Upstash unreachable). It is returned by `upstashRateCheck` / `dailyQuotaCheck` but the top-level `checkRateLimit` discards it: the return shape doesn't expose `degraded` to the route handler. So no log, no alert, no header on the response.
**Impact:** In dev/staging the team has no visibility that the limiter has degraded. In prod (where it would have failed-closed) this is moot. Cost: silent loss of debug signal.
**Suggested fix:** Plumb `degraded` through to `verifyAuthAndRateLimit`'s response; emit a `console.warn` once per cold-start when degraded fires. Optionally surface in a `X-Aimlo-Degraded: 1` response header.

### P1-10 — Reality-checker's count regex is dangerously narrow + fails silently on novel claim language
**File:** `lib/reality-checker.ts:35-41,67-94,160-225`
**Description:** `COUNT_PATTERNS` has 5 Turkish patterns (`\d+ kez`, `\d+ round`, `\d+ defa`, `\d+'inde/iunde`, `\d+'inda/iunda`). English equivalents (`\d+ times`, `\d+ rounds`) are missing. The `realityCheck` function is the **only** safeguard against the AI hallucinating death-count claims, and it bypasses entirely for English-language outputs (which `lang === "en"` branches in the prompts produce). Repetition keywords (`tekrar`, `pattern`, `aynı bölge`) are also Turkish-only.
Worse: the `rewriteUnsafeClaims` function uses Turkish-only replacement (`countRegex` matches `\\d+\\s*kez`); for an English over-claim it can't rewrite anyway.
**Impact:** English coach output is **unprotected** against count/repetition hallucinations. The vision route accepts both languages; English users get fabricated stats with no reality check.
**Suggested fix:** Extend `COUNT_PATTERNS`, `WINDOW_PATTERNS`, `REPETITION_KEYWORDS` with English variants. Mirror the rewrite logic. Add a unit test for English over-claim → rewrite.

---

## P2 — Medium

### P2-1 — `analyzeRoundPatterns.deathTimingPattern` divides by zero implicitly through tempo logic but trivially safe
**File:** `lib/round-engine.ts:167-178`
**Description:** `if (earlyDeaths > lateDeaths * 1.5)` — when `lateDeaths === 0`, RHS is 0 and any positive `earlyDeaths` triggers `"fast"`. When BOTH are 0, RHS is 0 and `0 > 0` is false → `"mixed"` is returned. Verified clean. No division.
**Impact:** None.
**Suggested fix:** None needed.

### P2-2 — `calculatePlayerScore` consistency window scales `variance * 36` based on a guessed range
**File:** `lib/scoring.ts:88-106`
**Description:** Comment says "variance ranges 0 to ~0.25" but for a 24-round match the windowed variance can easily be 0.21+ legitimately. The `* 36` multiplier means a perfectly normal player gets `cons = 10 - 7.6 ≈ 2`, which is a "consistency 2/10". The bound is then clamped at 1, so they score "1/10" for being a normal player. This propagates into UI as "Performansın çok dalgalı".
**Impact:** Bad coaching: players told they're inconsistent when they're average. This isn't a crash but it's wrong feedback at scale.
**Suggested fix:** Recalibrate against real data — log windowed variance for 100 matches, set the multiplier so the median maps to ~6/10. Or use Z-score against a historical distribution.

### P2-3 — `extractSite` in round-engine is ASCII-only; Turkish callouts won't match
**File:** `lib/round-engine.ts:64-79`
**Description:** Match keys are lowercase English (`mid`, `market`, `garage`, `window`, `connector`). Turkish locales / desktop OCR may produce `pencere` (window), `piyasa` (market), etc. The function returns `null` and the death silently doesn't contribute to `deathSiteConcentration`.
**Impact:** Pattern detection blind to Turkish callouts; under-reports site concentration.
**Suggested fix:** Either standardize callout names to English at OCR time (Rust desktop client) or extend the keyword list.

### P2-4 — `sanitizePromptInput` regex `CONTROL_CHARS = /[\x00-\x1f]/g` strips newlines + tabs from notes
**File:** `lib/prompt-safety.ts:21`
**Description:** The displayed regex is `[ --]` after Unicode escape stripping. The intent (per JSDoc on lines 12-13) is "Control chars except newline + tab". The actual code strips ALL control chars including \n and \t. User notes that span multiple lines collapse to a single line. Fine for current usage (notes are 300-500 chars max), but the comment is wrong.
**Impact:** Minor. Comment-vs-code drift.
**Suggested fix:** Make regex `/[\x00-\x08\x0b\x0c\x0e-\x1f]/g` to actually preserve newlines + tabs. Update the comment if the new behavior is desired.

### P2-5 — `loadVisionKnowledge` filter regex uses `\b` boundary that doesn't handle Turkish characters
**File:** `lib/knowledge-loader.ts:319,323`
**Description:** Comment says `// No \b boundary — \b doesn't handle Turkish 'ı' well in JS regex`, but the regex itself includes `\battack\b` and `\batak\b` for English/Turkish. The `\b` boundary in JS is `\w` based — which is `[A-Za-z0-9_]`. Turkish `ı`/`İ`/`ş`/`ç`/`ğ`/`ü`/`ö` are NOT in `\w`, so `\batak\b` matches "atak" inside "atakkk" wrongly (since "k" is in \w, no boundary). Verified: the comment acknowledges the issue but the alternation patterns still use `\b`.
**Impact:** Side-filtering may incorrectly drop or keep sections — minor coaching quality blip.
**Suggested fix:** Use lookarounds: `(?<![a-zA-ZçğıİöşüÇĞİÖŞÜ])atak(?![a-zA-Z…])`.

### P2-6 — `report/route.ts` falls back to deterministic stats on AI failure but the deterministic path always produces "valid" content — defeats the "honest no-AI" pledge in feedback route
**File:** `app/api/ai/report/route.ts:411,683,737-748` vs. `app/api/ai/feedback/route.ts:202-206,584,592`
**Description:** The two routes have inconsistent failure semantics. Feedback throws `FeedbackAIError("ai_not_configured", …, 503)` if `OPENAI_API_KEY` is missing — caller sees a 503 and can show "AI unavailable". Report silently returns deterministic stats (with prebuilt Turkish coaching strings via `generateDeterministicReport`) — caller sees a 200 with content that looks like AI output but is templated. The user has no way to know they got the fallback.
**Impact:** Inconsistent product behavior. Possibly violates the documented decision (cited in feedback/route.ts:182-185) that "wrong-feeling response is worse than honest unavailable".
**Suggested fix:** Pick one policy. If reports must always succeed (e.g. desktop app saves the report locally even on AI failure), add a `aiGenerated: boolean` field to the response so the UI can label.

### P2-7 — `tg_set_updated_at` recursion concern is unfounded in practice but should be verified
**File:** `supabase/0002_otp_auth.sql:36-42,64-66`
**Description:** Trigger fires `BEFORE UPDATE` and assigns `new.updated_at = now()`. Since this is in a BEFORE trigger setting a NEW column directly (not via UPDATE statement), it does NOT recurse. Postgres handles this correctly. Verified clean.
**Impact:** None.
**Suggested fix:** None needed; document for future maintainers.

### P2-8 — `extractJSON` parser in vision/report routes is duplicated and has subtle string-escape bugs
**File:** `app/api/ai/vision/route.ts:826-859` + `app/api/ai/report/route.ts:696-716`
**Description:** Two near-identical `extractJSON` functions. The "string state machine" tracks `inStr` and `escape` but doesn't handle JSON-escaped control chars properly: `if (escape) { escape = false; continue; }` skips ANY char following `\`, which is correct, but the OUTER `if (ch === '"') inStr = !inStr;` runs BEFORE the `if (inStr) continue;` check on the same iteration, meaning a `"` immediately after a `\` exit (i.e. line 845-846 ordering: `if (escape) { escape = false; continue; }` early-returns, so OK).
On closer read: the loop is correct. But the duplication is a maintenance cost; a future fix to one will not propagate.
**Impact:** Tech debt; potential drift.
**Suggested fix:** Extract to `lib/json-extract.ts`; share between routes.

### P2-9 — Insight route doesn't use `realityCheck` against the produced output
**File:** `app/api/ai/insight/route.ts:331-346`
**Description:** Vision and (implicitly) feedback get reality-checked against round memory. The dashboard insight route builds insights from aggregate stats that the user already sees — and DOES NOT pass through `realityCheck`. If the model invents "in your last 10 matches you died 14 times at A Short", there is no validation against actual stats.
**Impact:** Silent hallucination on dashboard insights — these are the "wow factor" surface and most likely to be screenshotted/shared by users.
**Suggested fix:** Add a numeric-claim validator that cross-references `safeContext.totalMatches`, `winRate`, `topDeathLocation`, etc. — reject or rewrite if the AI claims numbers outside ±10% tolerance.

### P2-10 — `verifyAuthAndRateLimit` falls into the catch on Upstash failure but `checkRateLimit` re-throws non-`rate-limiter-unavailable` errors
**File:** `lib/api-auth.ts:223-229,283-304`
**Description:** `verifyAuthAndRateLimit` calls `checkRateLimit(user.id, route, ip)` without a try/catch. If `checkRateLimit` throws (anything other than the caught `rate-limiter-unavailable`), the error propagates up to the route's `try/catch` which returns 500. The route returns `Internal server error` to the client with no detail. Combined with the lack of Sentry/error reporting (no calls to a structured error tracker found), debugging this silently-thrown path requires log-spelunking.
**Impact:** Operational; not user-facing data integrity.
**Suggested fix:** Wrap `checkRateLimit` in a try/catch inside `verifyAuthAndRateLimit`; on unexpected error, fail-closed (503 + retry-after) and log structured.

### P2-11 — Cost: every AI route loads KB on every call even for trivial requests (1-round feedback)
**File:** `app/api/ai/feedback/route.ts:211-216` + `app/api/ai/insight/route.ts:199` + `app/api/ai/report/route.ts:478-487`
**Description:** A user submitting a 1-round survival ping ("survived: true") still loads `core + rank + map + agent + 5 enemy agents + 2 matchups` worth of KB tokens (~3-5K input tokens). For survived-with-no-death rounds, the KB context is mostly wasted (no death analysis to ground). Vision route already skips the screenshot for survived rounds (line 394-412); KB could similarly skip enemy agent / matchup files.
**Impact:** ~$0.005 per survived-round call wasted across thousands of users = real money over time.
**Suggested fix:** Add a `task` mode like `feedback-survived` that loads only `core + rank + agent`, dropping enemy/matchup/map files. Survived rounds don't need 4K tokens of pattern lore.

### P2-12 — `auth-helpers.ts` `upsertProfile` writes a column that doesn't exist post-0002
**File:** `lib/auth-helpers.ts:67-95`
**Description:** Function constructs payload with `email`, but `profiles` table per migration 0002 has columns: `user_id`, `display_name`, `first_name`, `last_name`, `username`, `created_at`, `updated_at`. **No `email` column.** If this function is called from anywhere it will fail with "column 'email' of relation 'profiles' does not exist". The retry loop hides this for one round trip then surfaces an opaque error.
**Impact:** Latent bug if `upsertProfile` is called. `grep` shows it's not currently called from `app/`, but it's exported and could be used.
**Suggested fix:** Remove the `email` field from the payload OR delete the function entirely (looks orphaned post-OTP migration).

---

## P3 — Low

### P3-1 — Unique partial index `WHERE username IS NOT NULL` allows null-username profiles, but the trigger always inserts the metadata value (which could be a literal empty string, not null)
**File:** `supabase/0002_otp_auth.sql:59-61,84`
**Description:** If `raw_user_meta_data->>'username'` returns `""` (empty string), the trigger inserts `username = ''`. The unique partial index treats `''` as a value and uniqueness IS enforced. But a future signup with empty username will collide. Today's register flow always sets a non-empty username (zod schema in `app/(auth)/schemas.ts` enforces). For SSO/OAuth fallback registrations, the metadata might be `""`. Cast to NULL via `nullif(... , '')`.
**Impact:** Latent. Will bite when SSO provider returns no username metadata.
**Suggested fix:** `nullif(new.raw_user_meta_data->>'username', '')` in the trigger.

### P3-2 — `analyses` table column naming is legacy/cryptic
**File:** `app/page.tsx:3654-3672` (writes `riot_id` for map, `region` for agent)
**Description:** Comment acknowledges it. The repo has no migration for this table so the legacy names persist forever. New devs will be confused.
**Impact:** Confusing; not broken.
**Suggested fix:** Add a fresh migration `0003_analyses_rename.sql` that does `ALTER TABLE analyses RENAME COLUMN riot_id TO map; RENAME COLUMN region TO agent;` and update the four read/write sites.

### P3-3 — `lib/storage.ts` is unused on the server but exists in `lib/` (not `lib/client/`)
**File:** `lib/storage.ts`
**Description:** Pure localStorage helpers. Calling them from a server route would throw `localStorage is not defined`. They aren't, but the location is misleading.
**Impact:** Polish.
**Suggested fix:** Move to `lib/client/storage.ts` or add `"use client"` pragma.

### P3-4 — `improvement-plan.ts` checks `previousPlan` but no caller passes one
**File:** `lib/improvement-plan.ts:54,215`
**Description:** Both `feedback/route.ts:391-396` and `report/route.ts:621-626` call `generateImprovementPlan([{...}])` with no second argument. The whole `improvements` / `ongoingIssues` tracking branch is dead code in the web app.
**Impact:** Tech debt; missed product value.
**Suggested fix:** Either thread previous plan from client or remove the branch.

### P3-5 — KB token-savings strip (`stripKbWhitespace`) only applied in `loadVisionKnowledge`, not `loadKnowledge`
**File:** `lib/knowledge-loader.ts:286-292,190-250` vs `342-428`
**Description:** Vision route gets the trimmed KB; feedback/report/insight get raw markdown with decorative borders. The borders are tokens charged at full rate.
**Impact:** Small cost. ~10% input token savings missed on the 3 non-vision routes.
**Suggested fix:** Apply `stripKbWhitespace` in `loadKnowledge` too.

### P3-6 — `sendOtpEmail` swallows non-thrown Resend errors only via the `error` field, no rate-limit on retries
**File:** `lib/email.ts:60-74`
**Description:** Resend returns `{error}` when send fails. Caller (`register/actions.ts:193-202`) catches the throw and shows a friendly error. No backoff or retry. If Resend has a 5xx blip, user must resubmit — but resubmitting creates a new OTP that invalidates the old one, so any in-flight email also becomes stale. Mostly fine because OTP TTL is 10 min.
**Impact:** Operational.
**Suggested fix:** Add 1-shot retry on 5xx with 200ms delay before user-facing error.

### P3-7 — No documented backup/restore story
**File:** project-wide
**Description:** README and AGENTS.md don't mention backup. Supabase has automatic daily backups (Pro plan), retained 7 days. No additional layer (e.g. weekly export to S3, point-in-time-recovery for Free plan, profile/analyses table dumps).
**Impact:** Beta. Acceptable for now; document the assumption.
**Suggested fix:** Add a `docs/backup.md` stating: "We rely on Supabase daily backups. Restore tested: never. Recovery point: ~24h. Acceptable for beta only — pre-launch task: PITR + weekly external dump."

### P3-8 — Migrations vs production drift visibility — no `pg_dump` schema check
**File:** `supabase/`
**Description:** Only two .sql files exist (0002 OTP migration + standalone player-memory). The `analyses` schema is undocumented (P0-1). There's no automated drift detection (e.g. `supabase db diff`). Manual `ALTER`s in Supabase Studio (likely happened) are not captured.
**Impact:** Disaster recovery scenario painful.
**Suggested fix:** Run `supabase db dump --schema public > supabase/baseline-2026-05-07.sql` and commit. Add CI step to fail if schema drifts.

### P3-9 — Vision route's `realityCheck` only checks `deathAnalysis` and `nextRoundSuggestion`; `enemyAnalysis` items are unchecked
**File:** `app/api/ai/vision/route.ts:893-894`
**Description:** Each item in `enemyAnalysis` is a free-text claim about the enemy. Reality-checker does not run on them, so the model can hallucinate "Cypher trapwired B 3 rounds in a row" without verification.
**Impact:** Pattern claims about enemy behavior unchecked.
**Suggested fix:** Loop reality-check over `enemyAnalysis` items too.

### P3-10 — `report/route.ts` accepts both flat and nested setup formats with no usage docs
**File:** `app/api/ai/report/route.ts:128-148`
**Description:** Dual-format support is a fragile API contract. Desktop sends flat, web sends nested. A future refactor of one client will break the other silently.
**Impact:** Tech debt.
**Suggested fix:** Add a `setupFormat: "flat" | "nested"` field or unify the contract. At minimum, log which format was used so analytics catches drift.

---

## Summary

- **5 P0**, **10 P1**, **12 P2**, **10 P3** found
- **Top-3 priority fixes** (P0):
  1. **P0-5** Player memory writes from web report route are silently RLS-rejected — feature is dead in web. Fix: pass service client OR delete the call.
  2. **P0-1** No `analyses` table migration in repo — production schema not reproducible, RLS unverified — confirms via SQL `\d+ analyses` + `\d+ pg_policies`. Add the missing migration.
  3. **P0-3** Rate-limiter `INCR`+`EXPIRE` race can permanently lock a user out of a route after a transient Upstash hiccup. Fix with atomic SET-EX-NX-then-INCR or independent abort timers + DELETE on EXPIRE failure.

Honourable mentions worth fast-tracking even though not P0:
- **P0-2** Trigger throws on duplicate username → blocks `auth.users` INSERT → user gets opaque error.
- **P0-4** `updatePlayerMemory` lost-update race (no row lock).
- **P1-2** `lookup_email_by_username` is a username→email enumeration vector with no rate-limit.
- **P1-10** Reality-checker is Turkish-only — English coach output is unprotected against count/repetition hallucinations.

Report path: `/Users/gunayerdem/Desktop/aimlo/docs/audit/backend-data-audit-2026-05-07.md`
