@AGENTS.md

# AIMLO Backend (aimlo.gg) — Claude project memory

> Auto-loaded every session. Keep lean (<200 lines). Deep domain knowledge lives in the
> specialist agents under `.claude/agents/`. The `@AGENTS.md` import above is CRITICAL: this is
> **Next.js 16** — read `node_modules/next/dist/docs/` before writing Next code.

## What this is
Next.js 16 + Supabase backend for the AIMLO Valorant AI coach. **LIVE in production at
https://aimlo.gg (Vercel, region fra1).** The Windows desktop app (`gunayerdem/aimlo-desktop`)
calls these endpoints. Supabase project ref `bzwnchzetebwrdedkjkq`. AI model: **gpt-5-mini**.

## Owner & working rules (NON-NEGOTIABLE)
- Owner **gunayerdem ("softi")** — **respond in Turkish**. Full-stack: softi owns desktop + backend.
- **This is PRODUCTION.** RLS/Supabase changes affect real users — summarize before deploy; never
  break the desktop contract (esp. the `lookup_email_by_username` anon grant the desktop login needs).
- **No security holes** ("açık istemiyorum"): auth, rate-limit, RLS, prompt-safety stay strict.
- **NO fake AI output:** on AI failure return a structured error — never synthesized coach text. The
  frontend rejects responses containing the substring `"Analiz yapılamadı."`.
- **Coach voice (Turkish):** proper imperatives ("kafadan vur-", "açıyı tut-", "geniş açıyla peek
  at-"), NEVER tarzanca ("head atıyor", "swing yapıyor"). Sade dil, specific (callout/agent/weapon),
  1–2 sentences/field. Rules live in `lib/ai-policy.ts`.
- **OCR-only contract:** the desktop sends OCR-derived truth (score, deathLocation, etc.); the
  backend must not invent game facts — `lib/reality-checker.ts` rewrites AI claims that contradict
  the round memory.
- Commit per change (evidence + reason + `Co-Authored-By`). Push only when asked; branch first if on
  `main`. Push to `main` = Vercel auto-deploys to prod.

## Build / dev / deploy
```bash
npm install
npm run build      # Next.js 16 (Turbopack) production build — must pass
npm run dev        # http://localhost:3000
```
- Secrets: `vercel env pull .env.local` (UPSTASH_* only live in Vercel; dev has memory fallback).
- `.env.local` is gitignored — never commit secrets.
- Deploy: push `main` → Vercel. Supabase migrations in `supabase/` are ALREADY applied in prod —
  reference only, don't re-run.

## API routes (`app/api/`) — the desktop contract
Auth (Supabase JWT bearer) + Upstash rate-limit on all. camelCase fields. Keep shapes stable.
- **`ai/vision`** — round-end screenshot → coach feedback. `maxDuration 90s`, AI timeout 60s,
  rate limitleri **tek kaynak `lib/api-auth.ts`** (bugün 6/min · 100/gün, beta). gpt-5-mini,
  `json_schema` strict. Returns `{deathAnalysis, enemyAnalysis[],
  nextRoundSuggestion}`. Image optional when `died=false`.
- **`ai/report`** (alias **`ai/match-report`**, desktop posts here) — match summary
  `{summary, mistake, tendencies, adjustment, bestRound, decisionScore, ...stats, savedAnalysisId?}`.
  `persistOnServer:true` + `matchId` (uuid) → INSERT into `analyses` (RLS owner). `409` = idempotent
  hit (already saved).
- **`ai/feedback`** — text-only per-round feedback. `ai/insight` — dashboard long-term insight
  (whitelisted context fields only). **`telemetry`** — PII-free events, user_id SHA256-hashed; must
  stay in sync with desktop `telemetry.rs` `CANONICAL_KIND_LIST` (`lib/telemetry-types.ts`).
<!-- B112 (2026-07-31): ai/vision satırında "4/min·30/day" yazıyordu, kod 6/min·100/gün'e çıkmıştı.
     Sayıyı burada tekrarlamak bayatlıyor ve Friday denetiminde sahte alarm üretiyor → tek kaynağa
     (lib/api-auth.ts RATE_LIMITS/DAILY_QUOTA) işaret ediyoruz. -->
<!-- B112 yeniden-denetim (pano dalga, 2026-08-04): buradaki TÜM sayılar kodla birebir doğrulandı —
     vision 6/min·100/gün (api-auth RATE_LIMITS/DAILY_QUOTA), maxDuration 90s + AI 60s + imaj ≤4MB
     (vision/route.ts:52/54/229), per-IP 3× (api-auth checkRateLimit). B2 ile report günlük kotası
     30→10 indi; sayı bu dosyada BİLEREK tekrarlanmıyor, tek kaynak lib/api-auth.ts. -->

## lib/ modules
`api-auth` (JWT + Upstash rate-limit; env tabanlı bypass YOK — tek bypass yolu admin panelinden
verilen runtime `grantRateBypass`/`revokeRateBypass`, TTL'li, yalnız limit AŞILDIĞINDA bakılır) ·
`auth-rate-limit` (auth flows) · `ai-policy` (coach-voice rules, ban list, rubrics) ·
`knowledge-loader` (fs-reads `knowledge/**/*.md`, cached; needs `outputFileTracingIncludes` in
`next.config.ts` or Vercel can't find KB) · `round-engine` (death clusters, survival) · `scoring` ·
`player-memory` (cross-match profile) · `skill-system`/`playstyle-system`/`improvement-plan` ·
`prompt-safety` (injection defense: strip tags/bidi/zero-width/role-prefixes, length cap) ·
`reality-checker` (anti-hallucination) · `otp`/`email` (Resend) · `supabase` (browser) /
`supabase/server` (service-role, `server-only` guard).
<!-- B7 (2026-07-31): api-auth satırında "DEV_USER_ALLOWLIST bypass — REMOVE after beta" yazıyordu;
     YANLIŞTI — o env bypass'ı koddan tamamen kaldırıldı (lib/api-auth.ts, "DEV_USER_ALLOWLIST
     KALDIRILDI" gerekçe bloğu). Doküman bayat kalırsa denetçi var olmayan bir env'i arar ve
     gerçek bypass yüzeyini (admin panelinden verilen grantRateBypass) gözden kaçırır. -->

## Security model
JWT via `supabase.auth.getUser`. Rate-limit per-user (per-min/daily) + per-IP (3×), Upstash; fails
closed in prod. RLS on `analyses`/`player_memory` (owner-only). `lookup_email_by_username` is an
intentional anon grant for desktop login — **preserve it**. Service-role key never reaches client
(`server-only`). All user-supplied text → `prompt-safety` before entering a prompt.

## AI pipeline (vision)
auth+rate-limit → image validation (magic bytes, ≤4MB) → `knowledge-loader` (agent/map/rank/matchup
blocks, ordered for prompt-cache) → system prompt = `ai-policy` + KB + contextual + sanitized
patternContext → user msg (image if died + round JSON) → gpt-5-mini json_schema strict → JSON
extract → shape validate → `reality-checker` → truncate. **Failure → structured error, never fake.**

## Engineering discipline (every agent + the main session — harvested from systematic-debugging)
- **No fix without root cause** — prove it (`file:line`); don't guess. After 3+ failed attempts,
  question the premise, not the implementation.
- **Verify before "done"** — not done until `npm run build` passes (Next 16) and the desktop contract
  + any tests hold. State what you verified.
- **Defense-in-depth** — after the root fix, add a guard at the boundary (validation / auth / sanitize).
- **No fake AI output** — structured error on failure, never canned coach text.
- **Plan multi-step work**; keep the task list current.

## Fix protocol (softi's STANDING rule — 2026-06-03)
When softi says **"fixle" / "düzelt" / "çöz"** or reports a bug: DEFAULT to the **council approach**
— fan out the relevant specialists (security-auditor + backend-reviewer + ai-prompt-expert) to
root-cause, adversarially cross-verify, THEN fix with discipline (verify-before-done: `npm run build`
+ desktop-contract/tests hold). **Scale to difficulty:** trivial/obvious → do it directly and say so;
non-obvious or previously-unsolved → full multi-agent council. Goal: prove + fix the root cause,
never a symptom. softi has pre-authorized multi-agent / Workflow orchestration for fixes.

## Specialist agents (`.claude/agents/`)
- **security-auditor** (opus, read-only) — auth/rate-limit/RLS/prompt-safety/secrets; prod-grade.
- **backend-reviewer** (sonnet) — Next 16 correctness, API-contract stability, code quality.
- **ai-prompt-expert** (opus) — the AI routes, prompt-safety, reality-checker, coach-voice, KB.

## Persistent memory & agent authority
This file + `.claude/agents/` are committed → shared with the Mac "Friday" auditor. Secrets never
here. Cross-session user/style facts live in Claude's memory dir.
**Agent precedence — no conflict with Friday's Mac-wide globals:** in this repo ALWAYS use the repo's
`.claude/agents/`. Claude Code precedence is **project > user (~/.claude/agents/) > built-in**, and a
project agent SHADOWS a same-named global one. Friday's Mac-wide global agents apply only OUTSIDE the
AIMLO repos; in-repo these tuned agents always win. They don't mix.
