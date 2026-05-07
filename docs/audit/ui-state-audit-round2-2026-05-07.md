# UI / React State / Hooks — Round 2 Re-Audit

Date: 2026-05-07
Scope: post-commit `63df8b27` (Wave 1-3 hot fixes) — verify Round-1 P0/P1 fixes, surface any new regressions.

Stack pinned: Next 16.2.5 · React 19.2.4 · Tailwind v4 · TypeScript 5.

`tsc --noEmit` → **clean (exit 0)**.
`eslint app/` → 3 errors / 75 warnings (details below).

---

## A. Round-1 fixes — verification

### P0/P1 #1 — render-time `window.location.href` in `app/page.tsx`

**FIXED.** The legacy `AuthScreen` and its render-time redirect are gone. Replaced by:

```ts
function UnauthRedirect({ mode }: { mode: AuthMode }) {
  useEffect(() => {
    const target = mode === "register" ? "/register" : "/login";
    window.location.replace(target);
  }, [mode]);
  return (
    <main …>
      <div className="… animate-spin …" />
    </main>
  );
}
```

(`app/page.tsx:2900-2910`)

`if (!user) return <UnauthRedirect mode={authMode} />;` at line 3591 — render-time path is now SSR-safe (no side-effect during render). Effect runs once per mount; subsequent renders are idempotent (deps `[mode]`, mode never changes).

Minor: `window.location.replace` is a hard navigation. It WILL flash the spinner until the next document loads (≈100–300 ms). Could be replaced with `router.replace()` from `next/navigation` for a soft transition (no document reload, no flash) — see "New issues / N3" below.

### P0/P1 #2 — 4 missing CSS classes

**FIXED.** Defined in `app/globals.css:90-114`:

| Class                    | Defined  | Keyframe defined |
|--------------------------|----------|------------------|
| `animate-slide-up-big`   | line 104 | line 92          |
| `animate-scale-in`       | line 105 | line 96          |
| `animate-rotate-slow`    | line 106 | line 100         |
| `hover-underline`        | line 107 | n/a (transition) |

No name collisions. The existing `.animate-slide-up` (line 84, 0.8s) is distinct from the new `.animate-slide-up-big` (60-px translate, 0.7s).

Used by:
- `animate-slide-up-big` — all 5 (auth) pages' top wrapper.
- `animate-scale-in` — auth form error banners + login banner.
- `animate-rotate-slow` — `(auth)/layout.tsx` orbiting rings.
- `hover-underline` — auth pages, KVKK link inside register form.

### P0/P1 #3 — page.tsx 4645 → ~4389 lines, AuthScreen removed

**FIXED.** `wc -l app/page.tsx` = **4389** (matches expected 4645 − 256).

`grep "function AuthScreen|const AuthScreen|<AuthScreen"` returns **0 hits** — no orphan declarations or jsx tags remain.

Imports remain correct: `AuthMode` is still imported (line 28) and used by `UnauthRedirect` and `useState<AuthMode>("login")`.

---

## B. Form-page audit (RegisterForm / LoginForm / VerifyForm / ForgotForm / ResetForm)

All 5 use `useActionState(action, initial)` from `react`. Per `node_modules/next/dist/docs/01-app/02-guides/forms.md`, the API in Next 16 is unchanged (`[state, formAction, pending]`). Each form binds the right action:

| Page                   | Action import                | Form action used      |
|------------------------|------------------------------|-----------------------|
| RegisterForm           | `./actions/registerAction`   | `useActionState` ✓    |
| LoginForm              | `./actions/loginAction`      | `useActionState` ✓    |
| VerifyForm             | `./actions/{verify,resend}`  | two `useActionState` ✓|
| ForgotForm             | `./actions/forgotAction`     | `useActionState` ✓    |
| ResetForm              | `./actions/resetAction`      | `useActionState` ✓    |

Server-side validation schemas (`app/(auth)/schemas.ts`) are intact and align with the client `required` / `minLength` hints (8 ≤ password ≤ 72; username 3–20 of `[a-zA-Z0-9_]`; email max 254).

No TypeScript errors related to Wave 1 changes (rate-limit identifier passing through correctly).

---

## C. /account/delete page + DeleteForm

| Check                                                            | Result |
|------------------------------------------------------------------|--------|
| Server-side `await getUser()` gate before render                 | ✓ (page.tsx:14-16) |
| DeleteForm uses `"use client"` + `useActionState`                | ✓     |
| Confirm token comparison `confirm !== "SİL"`                     | ⚠ case-sensitive, locale-fragile |
| `<label htmlFor="confirm-input">` paired with `id="confirm-input"`| ✓    |
| Submit button disabled until ready                               | ✓     |
| Error block `role="alert"` / aria-live                           | ✗ missing — see B1 |

The DeleteForm strictly compares `confirmText === "SİL"` (TR uppercase İ) on both client (line 12) and server (`actions.ts:31`). On a non-Turkish keyboard layout (en-US default for many users) producing the diacritic-i requires Compose key tricks; "SIL" or "sil" (without dot/diacritic) silently does NOT match. The user can succeed only by pasting from the visible label or having a TR layout. Not a bug per se (UX choice), but worth documenting — see N1.

---

## D. /legal/{kvkk, privacy, terms}

All three pages:
- Use `<main>` + `<article>` semantic landmarks ✓
- Single `<h1>` per page ✓
- `<h2>` section headings ✓
- `<ul><li>` for lists ✓
- Mobile-friendly: `max-w-2xl px-4 py-16 leading-relaxed` ✓
- "Son güncelleme" date hard-coded "7 Mayıs 2026" — synced with today ✓
- Mailto links, inter-page links work; `Link` for internal, `<a>` for external/mailto ✓

No accessibility regressions detected. They are static, server-rendered, no client JS. Good.

One minor: every legal page hard-codes `<main className="min-h-screen bg-[#030711] text-zinc-200 px-4 py-16">` — consider extracting a `LegalLayout` for DRY (cosmetic, not P0/P1).

---

## E. Bundle bloat (page.tsx 4389 lines)

`app/page.tsx` still contains 1300+ lines of inline blog content (`BLOG_POSTS_*` arrays, FAQ data, etc.). The AuthScreen removal did **not** strand any string references — `t[lang]` lookup keys are intact. But the page.tsx imports a number of constants and utilities that are now **unused** (full list — see N2 below).

**12 named imports + 25 declared-but-never-read locals** — all flagged as `@typescript-eslint/no-unused-vars` warnings. None are runtime errors, but they bloat the initial JS bundle for this client component (every dead helper still ships to the browser because the bundler can't tree-shake function declarations referenced by closures within the same file unless it can prove the dead code is unreached, and ESLint already proved it).

---

## Performance / hydration

- **AmbientBg / AuthBg** — both still use the `.particle` class + `particle-drift` keyframe (defined `globals.css:74-78`, `270-277`). Particle positions are deterministic via `useMemo` → no SSR/CSR mismatch. ✓
- **UnauthRedirect** — runs once in effect. `window.location.replace` causes a HARD navigation (full document reload) → unavoidable ≈100–300 ms spinner flash before /login document hydrates. Suggested fix in N3.

---

## NEW issues found

Total NEW: **8** (1 P0, 3 P1, 4 P2).

### N1 (P1) — VerifyForm: `setState in useEffect` lint error

`app/(auth)/verify/VerifyForm.tsx:61-63`:

```ts
useEffect(() => {
  if (resendState.resent) setResendCooldown(60);
}, [resendState.resent]);
```

ESLint (`react-hooks/set-state-in-effect`) flags this as an error. The pattern is mirroring server action state into local state, which causes a cascading render. React's official guidance: "you might not need an effect" — derive the cooldown directly from `resendState.resent` + a timestamp, OR call `setResendCooldown(60)` inside the form's `onSubmit` handler before the action fires.

Right now the effect-cascade also has a subtle bug: if the user resends → the action returns `{resent:true}` → cooldown resets to 60. But on the NEXT render (cooldown ticking down, action's `resent` is still `true`), the effect re-runs only if `resendState.resent` flips false-to-true. Once `resent` stays true, the second resend won't re-trigger the timer because the dep didn't change — silently breaking subsequent resends until the action returns a different identity. This IS the bug that lint is warning about.

### N2 (P0) — `setAuthMode` is dead code; `authMode` is a constant

`app/page.tsx:2918`:

```ts
const [authMode, setAuthMode] = useState<AuthMode>("login");
```

`grep "setAuthMode"` → 0 call sites. The whole state slot is dead — only ever holds `"login"`, only ever read by `<UnauthRedirect mode={authMode} />`. Since the value is constant, `UnauthRedirect` will ALWAYS redirect to `/login`, never `/register`. The `mode === "register"` branch in `UnauthRedirect` (line 2902) is unreachable.

**Effect:** the CTA "Kayıt Ol" / register button on the landing page directly does `window.location.href = "/register"` (line 3568, 3574) — that path works. But ANY guarded auth screen (e.g. someone deep-links `/dashboard` while signed out) will land on `/login` regardless of intent. Round-1 reportedly relied on `authMode` to differentiate; with the modal flow gone, the differentiation is now effectively dropped. P0 because it's a regression from the prior UX (register CTA from a logged-out deep-link → now redirects to login, not register).

Fix: either remove the `authMode` state entirely + hardcode `<UnauthRedirect mode="login" />`, or wire `setAuthMode` to a query-param so `/dashboard?mode=register` routes correctly.

### N3 (P1) — `UnauthRedirect` uses `window.location.replace` instead of `router.replace`

A hard navigation triggers a full document reload. The user sees the AIMLO loading spinner, a white flash, then the /login page hydrate. Switching to `useRouter().replace(target)` from `next/navigation` keeps it a SPA transition — instant.

```diff
- window.location.replace(target);
+ const router = useRouter();
+ router.replace(target);
```

### N4 (P1) — apostrophe escape lint errors in 2 forms

`app/(auth)/forgot-password/ForgotForm.tsx:33` and `app/(auth)/register/RegisterForm.tsx:294` — raw `'` inside JSX text triggers `react/no-unescaped-entities`. ESLint blocks the build with `"strict"` lint config. Use `&apos;` or backtick template strings.

Specifics:
- `ForgotForm.tsx:33` — `spam'e bak.` → `spam&apos;e bak.`
- `RegisterForm.tsx:294` — `'nı okudum` → `&apos;nı okudum`

### N5 (P2) — Page.tsx unused imports / dead state (25+ items)

Top offenders (see lint output for full list):
- imports: `AGENT_GROUPS`, `AGENT_GROUP_LABELS`, `MAPS`, `SCORE_OPTIONS`, `isValidFeedback`, `upsertProfile`, `checkUsernameAvailable`, `AimloWordmark`, `localizeAuthError`, `genRoundFeedback`, `Label`, `InlineError`, `FeatureIcon`, `FeedbackCard`, `AgentMiniCard`, `CompSlot`
- locals (in `Home`): `setupErrors`, `compTarget`/`setCompTarget`, `roundForm`, `roundErrors`, `roundMode`, `currentFeedback`, `currentResult`, `survived`, `matchScore`, `report`, `feedbackLoading`/`setFeedbackLoading`, `isSubmitting`/`setIsSubmitting`, `downloadBannerDismissed`/`setDownloadBannerDismissed`, `locations`, `roundNum`, `submitLockRef`, `topDeathSpot`
- helper functions: `updateSetup`, `updateRound`, `handleCompSelect`, `loadRoundAtIndex`, `goToScoreInput`, `finishWithScore`, `getStepLabel`, `SETUP_STEPS`, `getMatchInsight`

These are all leftover from the in-page setup/round/scoreInput flow (now redirected to dashboard at `app/page.tsx:2953-2957`). Roughly **400-600 lines** of dead code that will tree-shake poorly because they sit in a `"use client"` file. Cleanup is a low-risk WIN — eliminates the ~25 KB extra JS.

### N6 (P2) — `?deleted=1` redirect lands on / with no UI feedback

`app/account/delete/actions.ts:68` does `redirect("/?deleted=1")`. The landing page's verified-banner effect (`app/page.tsx:3009-3026`) only handles `verified=true|error` — `?deleted=1` is silently swallowed. The user is signed out and bounced home with no confirmation toast. Add a "Hesabın silindi" banner branch or redirect to a dedicated farewell page.

### N7 (P2) — DeleteForm: error block missing `role="alert"`

When `state.error` is rendered (`DeleteForm.tsx:34-38`), screen readers don't announce the failure because the parent div has no `role="alert"` / `aria-live="polite"`. The other auth forms have similar issues — only VerifyForm (line 187) sets `role="alert"`. Add `role="alert"` consistently across `state.error` blocks.

### N8 (P2) — DeleteForm: case-sensitive Turkish "SİL" comparison

Already noted in section C. Server-side is the authoritative gate (`actions.ts:31`). Even if the client passes (which it does after typing exactly "SİL"), users on en-US keyboards struggle to produce dotted-İ without copy/paste. Two fixes:
- Accept any case-insensitive form: `if (confirm.toLocaleUpperCase("tr-TR") !== "SİL")`.
- Or accept English fallback: `if (!["SİL", "SIL", "DELETE"].includes(confirm.toLocaleUpperCase("en-US")))`.

The label can stay "SİL" as the canonical form.

---

## Tailwind v4 / `flex-shrink-0` etc.

Searched `app/`, `components/`, `hooks/` for legacy Tailwind v3 utility names that v4 renames:
- `flex-shrink-0` → not found ✓
- `flex-grow-*` → not found ✓
- `overflow-ellipsis` → not found ✓

Tailwind v4 is happy. Note that `globals.css:333` uses raw CSS `flex-shrink: 0;` (not a class) inside `.step-number` — that's CSS, not a utility, and works fine in v4.

---

## Console warnings / errors at runtime

No `console.warn` / `console.error` calls fire on a happy-path session. Server actions log via `console.error` only on failure paths (verified Round 1). Two minor warnings that DevTools surfaces:

1. React 19 strict mode emits a DEV-only warning if ANY of the unused state setters in `Home` is referenced inside a `useEffect` cleanup (won't break, but noisy).
2. The `react-hooks/set-state-in-effect` warning (N1) becomes a runtime DEV-only warning too, not just lint.

---

## Form validation client/server alignment

| Field            | Client (HTML5)         | Server (zod)            | Match |
|------------------|------------------------|-------------------------|-------|
| firstName        | maxLength=40           | min(1)–max(40)          | ✓     |
| lastName         | maxLength=40           | min(1)–max(40)          | ✓     |
| username         | 3–20 of `[a-zA-Z0-9_]+`| 3–20 of `[a-zA-Z0-9_]+` | ✓     |
| email            | type=email             | zod email + max 254     | ✓     |
| password         | min=8, max=72          | min(8)–max(72)          | ✓     |
| passwordConfirm  | min=8, max=72          | refine(== password)     | ✓     |
| kvkk             | required (checkbox)    | literal("on")           | ✓     |
| OTP code         | 6 digits via 6 boxes   | min(6)–max(8)           | ✓ (server tolerant)|
| login identifier | max=254                | min(1)–max(254)         | ✓     |
| reset password   | min=8, max=72          | inline ≥8, ≤72          | ✓     |

No drift. Reset uses inline checks vs zod elsewhere — consistent at the threshold values, though style-inconsistent.

---

## Round-2 verdict

### Round-1 P0/P1 verified fixed
1. ✓ Render-time `window.location.href` (P0) — moved to `useEffect` in `UnauthRedirect`.
2. ✓ 4 missing CSS classes (P1) — defined in `globals.css:92-114`, no name collisions.
3. ✓ AuthScreen removal (P1) — no orphan declarations / jsx tags / props.

### Still broken / partially fixed
- **`authMode` state is now a constant (`"login"`)** — N2 (P0). Round 1's intent (differentiate register vs login redirect) is silently broken because `setAuthMode` is never called.
- **UnauthRedirect uses hard navigation** — N3 (P1). Functional but visually janky.

### NEW issues — count + top 3
- 1 P0, 3 P1, 4 P2 (8 total).
- Top 3:
  1. **N2 (P0)** — `setAuthMode` is dead; UnauthRedirect always sends to `/login`. Functional regression vs. Round 1's stated design.
  2. **N1 (P1)** — VerifyForm `setState-in-effect` triggers a real bug: a second resend within the same session won't reset the cooldown. Also a hard ESLint error.
  3. **N4 (P1)** — Two `react/no-unescaped-entities` ESLint errors in ForgotForm and RegisterForm. Will fail any `eslint --max-warnings 0` CI gate.
