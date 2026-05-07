# UI / React state / hooks — brutal audit (2026-05-07)

Scope: web app only (`/Users/gunayerdem/Desktop/aimlo/`). Read-only — no
files were modified.

Files audited:

- `app/page.tsx` (4645 lines, single client file, `Home` component is ~1480 lines)
- `app/layout.tsx`
- `app/(auth)/layout.tsx`
- `app/(auth)/AuthBg.tsx`
- `app/(auth)/{register,login,verify,forgot-password,reset-password}/{page,*Form,actions}.tsx`
- `app/(auth)/schemas.ts`
- `app/globals.css`
- `lib/supabase.ts`
- `lib/supabase/server.ts`
- `lib/storage.ts`
- `hooks/useScrollReveal.ts`

---

## Summary

- **2 P0**, **9 P1**, **14 P2**, **8 P3**
- Worst offender by far is `app/page.tsx` (single file, every screen, every
  modal, dead legacy code, dead state, dead render-time redirect).

### Top-3 plain-language P0/P1 issues

1. **`app/page.tsx:3837-3848`** — when an unauthenticated user lands on `/`,
   `Home()` fires `window.location.href = "/login"` *during render*. This is
   an unconditional side-effect on every render of the loading-state branch.
   In React 19 with strict mode + transitions this re-fires on the second
   render and can cause noticeable double-navigations or drop pending state.
   It should be inside a `useEffect`.
2. **Missing animation classes referenced by both legacy and new auth flows.**
   `animate-rotate-slow`, `animate-scale-in`, `animate-slide-up-big`, and
   `hover-underline` are used across all five `(auth)/**` forms and pages
   (and the legacy `AuthScreen` in `page.tsx`) but none of them are defined
   in `app/globals.css`. The "decorative orbiting rings" don't rotate, the
   error pop-ins don't scale-in, the form cards don't slide-up, link
   underlines never appear. Recent visual regressions on the new
   `/register`, `/login`, `/verify`, `/forgot-password`, `/reset-password`
   screens almost certainly trace to this — they were copied from page.tsx
   where these classes were already missing.
3. **`app/page.tsx` is loaded by the root route as a `"use client"`
   component containing 4645 lines, ~1300 lines of hard-coded blog post
   bodies in TR/EN, 4 modal components, AmbientBg with 40 inline particles,
   the legacy `AuthScreen` (dead — never reached), and the entire
   dashboard / history / report-detail UI.** Every visit to `/` (the
   landing page) ships all of it. Even unauthenticated visitors download
   the dashboard, history, and report-detail JSX trees.

---

## P0

### P0-1 Render-time `window.location.href` redirect in `Home`
- **File + line:** `app/page.tsx:3837-3848`
- **Description:** The `Home` component, after the `authLoading || !lang`
  guard, hits an `if (!user) { ... window.location.href = ... }` block
  during render. The redirect is fired as a render-time side effect with
  only `typeof window !== "undefined"` to gate it. React 19 may invoke a
  render twice (strict mode in dev, concurrent rendering, transitions).
  Each render re-assigns `location.href`, which the browser coalesces but
  it can interleave with a still-in-flight Server Action redirect after
  login. Worse, the `authMode` state used to choose `/register` vs
  `/login` is **never updated** anywhere (`setAuthMode` is unused — see
  P2-2), so the conditional is dead — it always picks `/login`.
- **Impact:** Race conditions between Supabase `onAuthStateChange` cookie
  hydration and this hard redirect; users who briefly transition through
  `user === null` (sign-out, token refresh failure) get bounced to /login
  even when the auth state is about to recover.
- **Suggested fix:** Move the redirect into a `useEffect` keyed on
  `[user, authLoading]`, and use a `<Navigate>` / `redirect()` pattern or
  `router.replace("/login")` from `useRouter()`. Drop the unused
  `authMode` ladder. Better: render `null` and let the middleware or a
  Server Component decide.

### P0-2 Missing CSS class definitions cause silent visual breakage
- **File + line:** `app/globals.css` (entire file); references in
  `app/page.tsx`, `app/(auth)/layout.tsx:22-29`,
  `app/(auth)/{register,login,verify,forgot-password,reset-password}/{page,*Form}.tsx`
- **Description:** The following classes are referenced but **never
  defined** anywhere in the project:
  - `animate-rotate-slow` — used by the orbiting rings in
    `app/(auth)/layout.tsx:22-29` and `app/page.tsx:3073-3074`. The keyframe
    `@keyframes rotate-slow` does not exist either.
  - `animate-scale-in` — used by every error pill: `RegisterForm.tsx:302`,
    `LoginForm.tsx:105`, `VerifyForm.tsx:186`, `ForgotForm.tsx:64`,
    `ResetForm.tsx:107`, `app/(auth)/login/page.tsx:48`, `app/page.tsx:3138`.
  - `animate-slide-up-big` — used as the entry animation on every auth
    page wrapper: `app/(auth)/{register,login,verify,forgot-password,reset-password}/page.tsx`,
    `app/page.tsx:3050,3077`.
  - `hover-underline` — used everywhere a `Link`/`<a>` should get an
    underline-on-hover: every auth `page.tsx`, `RegisterForm.tsx:272,281,290`,
    `LoginForm.tsx:98,110`, `VerifyForm.tsx:225`, `app/page.tsx` (multiple).

  `globals.css` only defines `animate-slide-up`, `animate-fade-in`,
  `animate-float-slow`, `animate-glow-pulse`, `animate-orb`,
  `animate-pulse` (Tailwind built-in), and `animate-ping` (Tailwind built-in).
  All four classes above are silently dropped because Tailwind v4 won't
  generate them without a `@keyframes` + `@utility`/`@theme` declaration.
- **Impact:** All entrance animations on the new OTP auth pages are dead.
  Error states pop in instead of scale-in. Decorative rings sit static.
  Links don't show their hover underline. The "premium feel" of the auth
  flow that was the whole point of the migration is silently absent.
- **Suggested fix:** Add the four missing keyframes and the four
  utilities to `globals.css`:
  ```css
  @keyframes rotate-slow { to { transform: rotate(360deg); } }
  @keyframes scale-in { from { opacity:0; transform: scale(.94); } to { opacity:1; transform: scale(1); } }
  @keyframes slide-up-big { from { opacity:0; transform: translateY(60px); } to { opacity:1; transform: translateY(0); } }

  .animate-rotate-slow { animation: rotate-slow 60s linear infinite; }
  .animate-scale-in { animation: scale-in .25s cubic-bezier(.16,1,.3,1) forwards; }
  .animate-slide-up-big { animation: slide-up-big .9s cubic-bezier(.16,1,.3,1) forwards; }
  .hover-underline { position: relative; }
  .hover-underline::after { content:""; position:absolute; left:0; right:0; bottom:-2px; height:1px; background:currentColor; transform: scaleX(0); transform-origin:left; transition: transform .25s; }
  .hover-underline:hover::after { transform: scaleX(1); }
  ```

---

## P1

### P1-1 4645-line client bundle on the landing page
- **File + line:** `app/page.tsx:1-4645`
- **Description:** `app/page.tsx` is `"use client"`, exports a single `Home`
  component, and is the entry for `/` (the landing page). Every visitor
  downloads the entire file: the 1300+ line embedded blog database
  (`landingBlogPosts` for both TR and EN inside the i18n object), all five
  rendered screens (landing/dashboard/history/reportDetail/lang), all
  modals, `AmbientBg`, `MapBg`, `Navbar`, the legacy retired `AuthScreen`
  (P1-2), and the dead manual-analysis state plumbing.
- **Impact:** First-load JS for the marketing page is far heavier than it
  needs to be, hurting LCP / TTI. Hydration time scales linearly with
  source size on low-end devices.
- **Suggested fix:** Split into separate route files. The Next 16 app
  router actively encourages this — `/dashboard`, `/history`,
  `/report/[id]` should be their own routes (Server Components by default).
  Move `landingBlogPosts` to `constants/blog-posts.ts`. Move
  `AmbientBg` and `Navbar` to `components/`. The current file is a
  pre-app-router monolith that survived the migration.

### P1-2 Dead `AuthScreen` component still in the bundle
- **File + line:** `app/page.tsx:2898-3162`
- **Description:** `AuthScreen` is a 264-line client component with full
  email/username/password form, real `supabase.auth.signUp`/
  `signInWithPassword` calls, error localization, and "🙈 / 👁️" emoji
  password toggles. The migration replaced it with the new `(auth)`
  routes, but the function is still in the file. The only reference is the
  comment "Legacy AuthScreen retired" at line 3838 — it's never rendered.
- **Impact:** ~9KB of dead JS shipped to every landing-page visitor.
  Confuses code search ("which form does email validation?"). Carries the
  emoji toggles that the new `EyeIcon` SVG was supposed to retire.
- **Suggested fix:** Delete `AuthScreen` (lines 2898-3162). Also delete
  `localizeAuthError` (lines 237-262) — it's only called from `AuthScreen`.

### P1-3 `<html lang="tr">` is hard-coded; `LandingPage` toggles language without updating it
- **File + line:** `app/layout.tsx:46`, `app/page.tsx:1971-1972, 3973-3977`
- **Description:** Root layout renders `<html lang="tr">`. The user can
  toggle to English via the `TR/EN` button (`onLangToggle`), which calls
  `setLang("en")` and `saveLang("en")`. The `<html>` `lang` attribute
  never changes. Screen readers, search engines, and Chrome's
  translate-this-page detector all rely on `lang`. The comment
  acknowledges this is a known issue but the fix is "TODO".
- **Impact:** Mid-page lang toggle leaves the document-level language tag
  wrong for the entire session. Accessibility regression for English users
  on a TR-defaulted page. Bad SEO signal.
- **Suggested fix:** Imperatively `document.documentElement.lang = lang`
  inside the existing `useEffect(() => setLang(loadLang() || "en"), [])`
  block and inside `handleLangToggle` / `onLangToggle`.

### P1-4 No focus management when error appears in OTP form / forms
- **File + line:** `app/(auth)/verify/VerifyForm.tsx:185-191`,
  `RegisterForm.tsx:301-305`, `LoginForm.tsx:104-116`,
  `ForgotForm.tsx:63-67`, `ResetForm.tsx:106-110`
- **Description:** Error pills render `role="alert"` only on the verify
  page (`VerifyForm.tsx:188`, `:235`). Register, Login, Forgot, and Reset
  forms have a `<p className="...text-[#FF3D71]">` with no `role="alert"`
  or `aria-live`. Screen-reader users get no announcement when validation
  fails. Sighted keyboard users also lose focus context — focus stays on
  the submit button.
- **Impact:** Form validation failures are invisible to AT users.
- **Suggested fix:** Wrap the existing error block in `role="alert"` (or
  `aria-live="polite"` for less interrupting), and on first error, move
  focus to the first invalid input via `useEffect` keyed on `state.error`.

### P1-5 OTP `autoFocus` triggers on every render with `hasError`
- **File + line:** `app/(auth)/verify/VerifyForm.tsx:159, 254-283`
- **Description:** `<CharBox>` for slot 0 has `autoFocus`. When
  `verifyState.error` changes (from a failed verify), the parent re-renders;
  the `CharBox` is keyed by `i`, so React keeps the same instance. The
  `autoFocus` prop is a one-shot on mount, so this isn't broken, but the
  combination with `onFocus={(e) => e.target.select()}` and the `hasError`
  prop changing means the styling refreshes but focus does not move back to
  slot 0. After error, the user might still be on slot 5 with a stale value.
- **Impact:** Confusing UX — error appears, user has no clue where to
  type next.
- **Suggested fix:** Add a `useEffect(() => { if (verifyState.error)
  refs.current[0]?.focus(); setChars(["","","","","",""]); },
  [verifyState.error])`. (Bonus: clear the chars too.)

### P1-6 `Home`'s `handleSignOut` references `setScreen` before declaration
- **File + line:** `app/page.tsx:3188-3197` calls `setScreen` declared at
  line 3199.
- **Description:** Function declarations are hoisted but the
  `useState`-returned `setScreen` is in the temporal-dead-zone of the
  function-body scope. JavaScript doesn't crash because the function body
  isn't executed until later, but this is a structural code smell — the
  function lives inside the `Home` component above its own closure
  dependencies. If anyone reorders the file or wraps `handleSignOut` in
  `useCallback` (which the function should be — it's passed to children
  that may memoize), the TDZ would now bite at hook initialization.
- **Impact:** Latent bug; today it works.
- **Suggested fix:** Define all `useState` calls first, then helpers.
  Wrap `handleSignOut` in `useCallback([])` — it's already passed to
  `LandingPage` and `Navbar`, both as `onSignOut` and `navProps.onSignOut`,
  causing every render to re-mount their event handlers.

### P1-7 Footer `new Date().getFullYear()` rendered server- and client-side
- **File + line:** `app/page.tsx:2888`
- **Description:** Footer copyright uses `new Date().getFullYear()` inline
  in JSX. The marketing page is a `"use client"` component at root, so
  Next still renders it on the server first (RSC streaming). Server and
  client clocks at year-boundary rollover (or different timezones) can
  emit different strings, causing a hydration mismatch warning.
- **Impact:** Once a year, hydration errors. Always: a small but real
  re-render on hydration.
- **Suggested fix:** Move year to a build-time constant
  (`const COPYRIGHT_YEAR = new Date().getFullYear()` at top of file) — or
  put it in metadata, or hard-code "2026".

### P1-8 `LandingPage` `IntersectionObserver` effect doesn't re-run on conditional sections
- **File + line:** `app/page.tsx:1999-2009`
- **Description:** The `useEffect` that observes `[data-animate]` runs
  once on mount with empty deps. Modals (`{showAllBlog && (...)}`,
  `{selectedPost !== null && (...)}`) inject new `[data-animate]` nodes
  later. Those nodes never get observed because the effect doesn't re-run.
  The CSS `animate-fade-in` on the modal compensates, but the
  `data-animate` attribute is attached to non-modal sections too — adding
  another section in the future would silently fail to animate.
- **Impact:** Latent — works today.
- **Suggested fix:** Use `useScrollReveal` (already imported) on each
  section, or use a `MutationObserver`, or drop the homemade observer in
  favor of the existing `useScrollReveal` hook everywhere.

### P1-9 `Home` does no focus return after `screen` change
- **File + line:** `app/page.tsx:3199` and every `setScreen("...")` call
- **Description:** `setScreen("dashboard")`, `setScreen("history")`,
  `setScreen("reportDetail")` etc. swap the entire main element but
  never move focus to the new screen's heading. Keyboard users stay on
  whatever button they clicked, but the visual context jumped.
- **Impact:** A11y / keyboard-nav regression.
- **Suggested fix:** Use `aria-live` regions, or a `useEffect` keyed on
  `screen` that focuses the new `h1`/`h2`.

---

## P2

### P2-1 Five `useState` declarations are dead state in `Home`
- **File + line:** `app/page.tsx`
  - `compTarget` / `setCompTarget` (3220) — never read or written after
    initialization.
  - `isSubmitting` / `setIsSubmitting` (3252) — never read or written
    after initialization.
  - `submitLockRef` (3280) — never read or written.
  - `downloadBannerDismissed` / `setDownloadBannerDismissed` (3253) —
    never read or written.
  - `authMode` setter (`setAuthMode`, 3169) — never called; `authMode`
    is only read in the dead-render redirect (P0-1).
- **Description:** Reserved memory for state that has no callers.
- **Impact:** Code clarity; no functional bug, but signals the file
  hasn't been swept in a long time.
- **Suggested fix:** Delete all six.

### P2-2 `headers` declared but unused in `deleteReport`
- **File + line:** `app/page.tsx:3709`
- **Description:** `const headers = await getAuthHeaders()` returns a
  value that is never used — the deletion uses the `supabase` client's
  built-in cookie/JWT, not the bearer header.
- **Impact:** Wasted async call (forces `supabase.auth.getSession()`),
  TS lints clean because of the `unused-expression` rule disabled by
  default in this repo.
- **Suggested fix:** Remove the call.

### P2-3 `useEffect` deps miss `setSetup` reference / closures stale
- **File + line:** `app/page.tsx:3738-3769`
- **Description:** `useEffect(() => { setSetup(prev => ...) }, [setup.agent])`.
  The `setSetup` setter is stable so omitting it is fine, but the effect
  reads `prev.teamComp` — which it correctly receives from the updater
  function, so this one is OK. But the same pattern appears at line 3522
  (`useEffect(() => { ... loadDraft() ... }, [user, lang])`). It calls
  `setSetup`, `setSetupStep`, `setRounds`, `setRoundIdx`, `setScreen`. All
  are stable. The `draftRestored.current = true` flag is set inside; if a
  user signs out and back in same session, the flag stays `true` and the
  draft never re-restores.
- **Impact:** Drafts stop restoring after first sign-out within the same
  page-load. (Page reload fixes it because the ref resets.)
- **Suggested fix:** Reset `draftRestored.current = false` inside
  `handleSignOut`.

### P2-4 `IntersectionObserver` cleanup leak on Hot Module Reload
- **File + line:** `app/page.tsx:1999-2009`
- **Description:** Cleanup is `() => observer.disconnect()`. Good. But
  the `setVisibleSections((prev) => new Set(prev).add(...))` allocates a
  new Set on every intersection event, even for IDs already present.
- **Impact:** Minor perf nit; many wasted renders if many sections cross
  threshold simultaneously on slow scroll.
- **Suggested fix:** Bail early `if (prev.has(entry.target.id)) return prev;`
  inside the updater.

### P2-5 `localStorage` accessed without `typeof window` guard inside `loadHistory`
- **File + line:** `app/page.tsx:3611, 3631, 3683, 3691, 3721, 3725`
- **Description:** All inside async functions called from effects, so
  `typeof window` is always defined by then. Not a bug today. But if
  `loadHistory` ever gets called from a Server Action or a server
  component refactor, it'll throw `ReferenceError: localStorage is not
  defined`.
- **Impact:** Latent.
- **Suggested fix:** Either move the localStorage shim into
  `lib/storage.ts` (which already has `try/catch`) and reuse those
  helpers, or wrap in `typeof window !== "undefined"`.

### P2-6 `RegisterForm` does not echo password fields
- **File + line:** `app/(auth)/register/RegisterForm.tsx:170-228`
- **Description:** On a validation failure, the server action returns
  `state.values` containing only `email/username/firstName/lastName`. The
  password / passwordConfirm inputs have no `defaultValue`, so they blank
  out on every error. User has to retype both even when only `firstName`
  was wrong.
- **Impact:** UX friction; users reach for password manager autofill
  every retry.
- **Suggested fix:** Either echo back password too (the comment in
  `RegisterState` says they decided not to — fine), or render
  field-level errors at the top of the form so the user sees what was
  wrong without having to scroll past the password fields they're now
  retyping.

### P2-7 Pending state has no recovery
- **File + line:** Every `useActionState` consumer:
  `RegisterForm.tsx:307`, `LoginForm.tsx:118`, `VerifyForm.tsx:194-196`,
  `ForgotForm.tsx:69`, `ResetForm.tsx:112`
- **Description:** Submit button is `disabled={pending}` with no client-
  side timeout. If the network drops between request send and response
  receipt, the button stays disabled forever (until the user navigates
  away). React 19's `useActionState` does not surface a "stuck" state.
- **Impact:** User can hit a permanent disabled-button trap on flaky
  connections.
- **Suggested fix:** Add a `useEffect(() => { if (!pending) return; const
  t = setTimeout(() => /* show recovery message */, 30000); return () =>
  clearTimeout(t); }, [pending])` pattern, or surface a "still trying…
  retry?" UI after 15s.

### P2-8 OTP form clears chars on success but not on `verifyState.error`
- **File + line:** `app/(auth)/verify/VerifyForm.tsx:48-56, 185-191`
- **Description:** After a wrong code, `verifyState.error` populates and
  the boxes turn red, but the typed digits remain. Users see "Kod hatalı.
  4 deneme hakkın kaldı." while their wrong code is still in the boxes.
  The submit button stays disabled (good — `code.length !== 6` is false
  but the code IS still 6, so actually it's enabled — they can re-submit
  the same wrong code).
- **Impact:** Confusing flow — looks like the submission didn't go
  through; user might re-submit the same wrong code and burn another
  attempt.
- **Suggested fix:** On `verifyState.error`, `setChars(["","","","","",""])`
  and refocus slot 0. Also disable submit immediately if state error is
  freshly present.

### P2-9 Resend "✓ Yeni kod gönderildi" message lingers forever
- **File + line:** `app/(auth)/verify/VerifyForm.tsx:227-231`
- **Description:** After a successful resend the cooldown timer counts
  60s, but the success label `"✓ Yeni kod gönderildi"` only renders when
  cooldown is 0 (the entire button replaces the timer). When cooldown
  expires, the success label appears as button text. If the user never
  resends again, that "✓ sent" label persists forever.
- **Impact:** Stale success message.
- **Suggested fix:** Use a separate `useEffect` to clear `resentLabel`
  after the cooldown elapses.

### P2-10 `handleFormPaste` typing
- **File + line:** `app/(auth)/verify/VerifyForm.tsx:124-132`
- **Description:** `onPaste` is on the `<form>` element. If the user
  pastes into the resend form (separate `<form action={resendDoAction}>`
  below), the paste handler still fires on the parent form? No — they
  are sibling forms in the DOM, so this is fine. But the focus-after-
  paste setTimeout(0) is brittle: in React 19 with concurrent transitions
  the next paint can be deferred. Use `flushSync` or `requestAnimationFrame`.
- **Impact:** Race on slow devices — focus might not advance.
- **Suggested fix:** Use a `useEffect` keyed on `chars` length that moves
  focus to the next empty slot.

### P2-11 `resentBanner` cleanup race after sign-out
- **File + line:** `app/page.tsx:3260-3277`
- **Description:** The verified-banner timer is registered on mount with
  empty deps. If the user signs out (`clearDraft()`, `setUser(null)`,
  `setScreen("landing")`) while the banner is showing, the cleanup
  function is not retriggered (deps are `[]`); the 8s timeout still
  fires `setVerifiedBanner(null)`. That's fine because the component is
  still mounted, but if something ever unmounts it, this will throw the
  classic "Can't perform a React state update on an unmounted component"
  warning. React 19 silenced that warning, but the underlying memory leak
  remains.
- **Impact:** Trivial.
- **Suggested fix:** N/A unless sign-out triggers an unmount.

### P2-12 Inline `setTimeout` for download-section scroll lacks cleanup
- **File + line:** `app/page.tsx:4017`
- **Description:** `setTimeout(() => document.getElementById(...)?.scrollIntoView(...), 100)`
  fires after navigating from a sub-screen back to landing. If the user
  navigates away again before 100ms, the timeout still runs. No cleanup.
- **Impact:** Tiny edge case.
- **Suggested fix:** Use `requestAnimationFrame` plus a navigation event
  listener; or track the timeout in a ref.

### P2-13 `passwordConfirm` not echoed but `password` is also blanked on Reset
- **File + line:** `app/(auth)/reset-password/ResetForm.tsx:45-104`,
  `actions.ts:13-25`
- **Description:** Same issue as P2-6. On reset failure, both passwords
  blank, plus password manager autofill kicks in differently for "new
  password" semantics.
- **Impact:** UX friction.
- **Suggested fix:** Add a hint above the form on error rather than
  re-trying.

### P2-14 No `aria-required` / `aria-describedby` linking errors to inputs
- **File + line:** All forms.
- **Description:** Inputs have `required` HTML attribute and
  `aria-invalid={!!err}`, but the error `<p>` below has no `id` and no
  `aria-describedby` link from the input. Screen readers don't pair
  field with its error text.
- **Impact:** A11y.
- **Suggested fix:** Generate ids per field
  (`id="reg-first-error"`) and reference them via `aria-describedby` on
  the input.

---

## P3

### P3-1 `dangerouslySetInnerHTML` for blog content `**bold**` parsing
- **File + line:** `app/page.tsx:2771`
- **Description:** Blog post bodies live in i18n constants and contain
  `**bold**` markup, parsed via regex into `<strong>` and injected.
  Content is hard-coded today — no XSS today. But if blog posts are
  ever loaded from a CMS / Supabase / RSS, this becomes a stored-XSS
  vector.
- **Impact:** Latent.
- **Suggested fix:** Use a markdown library (`react-markdown` is React
  19 compat) or a sanitizer.

### P3-2 Hardcoded blog database in `app/page.tsx`'s i18n object
- **File + line:** `app/page.tsx:415-1300+` (TR + EN copies)
- **Description:** All blog post bodies (multiple thousand-character
  Turkish + English Markdown strings) live in the page module. Adds
  significantly to the JS payload. (Counts toward P1-1.)
- **Suggested fix:** Move to `constants/blog-posts.ts` (or generate at
  build time from a JSON file). Even better: separate route `/blog/[slug]`
  Server Component.

### P3-3 `Math.random` / `crypto.randomUUID` calls during render
- **File + line:** `app/page.tsx:3553, 3687`
- **Description:** Both are inside async callbacks (`loadHistory`,
  `saveReportToDb`), not render. Safe.
- **Suggested fix:** N/A — flagging only because the audit asked.

### P3-4 `key={i}` for arrays that re-render with stable identity
- **File + line:** `app/page.tsx:2156, 2298, 2418, 2530, 2639, 2811,
  3157` and 5 more.
- **Description:** Index keys for static config arrays. Fine, but if
  ever the array is filtered or reordered, list state will tear.
- **Suggested fix:** Use stable IDs (`featureVisuals[i].agentId`,
  `post.title`, etc.).

### P3-5 Testimonials map shadows imported `t`
- **File + line:** `app/page.tsx:2489`
- **Description:** `(lang === "tr" ? [...] : [...]).map((t, i) => (...))`.
  The parameter `t` shadows the i18n object `t` imported at line 266.
  The closure does not reference the outer `t`, so this works, but ESLint
  `no-shadow` would flag it.
- **Suggested fix:** Rename to `testimonial`.

### P3-6 `prefers-color-scheme` not respected; site is always dark
- **File + line:** `app/globals.css:3-11`, `app/layout.tsx`
- **Description:** Site is hard-coded dark (`#080c14` background, white
  foreground). No `@media (prefers-color-scheme: light)` block, no
  `colorScheme` viewport metadata. Users with an explicit light-mode
  preference get a forced dark experience.
- **Impact:** Acceptable for a gaming product, but inconsistent with
  `themeColor` patterns and hurts contrast for some users.
- **Suggested fix:** Add `export const viewport: Viewport = {
  colorScheme: "dark", themeColor: "#080c14" }` to `app/layout.tsx` so
  the OS UI agrees.

### P3-7 `MAP_IMAGES[entry.map]` returns undefined for unknown maps
- **File + line:** `app/page.tsx:4257, 4307, 4419, 4434, 4522`
- **Description:** `<img src={MAP_IMAGES[entry.map]}>` renders an empty
  src if the map is missing from the constant. Browser fires an extra
  request for the page URL itself. Same pattern in `MapBg`.
- **Impact:** Minor — broken image icon + wasted request when a new
  Valorant map drops before the constant is updated.
- **Suggested fix:** `MAP_IMAGES[entry.map] ?? FALLBACK_MAP_IMAGE` or
  conditionally render.

### P3-8 OTP CharBox `value` includes more than 1 char during paste
- **File + line:** `app/(auth)/verify/VerifyForm.tsx:269` (`maxLength={6}`)
- **Description:** `maxLength={6}` allows the input to briefly hold the
  full pasted code before `handleChange` distributes it. A controlled
  input renders the React-state-driven value, so this should be 1 char
  always. But during paste, before state updates, users may see a
  flicker where one box momentarily shows multiple digits. Use
  `maxLength={1}` and let the paste handler intercept.
- **Impact:** Tiny visual glitch.
- **Suggested fix:** `maxLength={1}` per box.

---

## Cross-cutting observations

- **No `components/` directory** has any actual files. The directory
  exists but is empty. Everything is in `app/page.tsx` or co-located in
  `app/(auth)/*`. The agent guidelines suggest splitting into modules
  isn't enforced.
- **Two `AmbientBg` definitions:** `app/page.tsx:1496` and
  `app/(auth)/AuthBg.tsx`. They share the same 40-particle data array.
  When particle data needs to change, both must be updated. Extract to
  `constants/particles.ts`.
- **i18n `t` is module-level, not React-scoped.** Any change to copy
  forces a full refresh; no concern, just an observation.
- **No tests.** `lib/__tests__` exists, but there's no UI test (Playwright,
  RTL) for the new auth routes. The migration changes are unverified
  by an automated check.
- **Type safety:** the audit finds only one `as Record<string, unknown>`
  and `as unknown[]` per file — clean for a 4.6 kloc file. No `any`
  casts in critical auth code.
- **No `Promise.all` ignoring rejections.** Audit clean.
- **Console errors expected at build time:** `next build` will surface
  the eslint warnings about `no-img-element` (already silenced via
  comment in auth pages — fine), and `react-hooks/exhaustive-deps` may
  flag the `[]` deps on the `IntersectionObserver` effect (P1-8).

---
