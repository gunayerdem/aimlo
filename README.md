# AIMLO

AI-powered Valorant coaching app. Web client + Next.js API routes that proxy
the Anthropic API and serve as the backend for the desktop overlay
(separately maintained on Windows).

## Architecture

- **`app/`** — Next.js App Router pages (landing, dashboard, auth, reports).
  - **`app/api/ai/{feedback,insight,report,vision}/`** — server-side proxies
    to Anthropic. Auth-guarded (Supabase JWT), rate-limited, prompt-cached,
    knowledge-base aware.
- **`lib/`** — shared utilities. Notable files:
  - `api-auth.ts` — Bearer-token verification + Upstash-backed rate limits.
  - `prompt-safety.ts` — sanitizers for user input that lands in LLM prompts.
  - `knowledge-loader.ts` — KB file loader; route-specific prompt assembly.
  - `ai-policy.ts`, `ai-knowledge.ts` — coach-voice policy + KB selection.
- **`knowledge/`** — markdown KB consumed by the AI routes. Edit-then-audit
  cycles run via `/tmp/aimlo_audit/brutal_final_audit.py` (see commit history).
  Out-of-rotation maps live in `knowledge/maps/_archive/`.
- **`constants/`** — single source of truth for game data (agents, maps).
  `MAP_LOCATIONS` lives here only — API routes import it.
- **`hooks/`, `components/`, `evals/`, `supabase/`** — standard split.

## Setup

```bash
cp .env.example .env.local
# fill in Supabase + Anthropic + Upstash keys
npm install
npm run dev
```

See `.env.example` for full variable documentation. Production requires
**Upstash Redis** for rate limiting — without it the API fails closed (503).

## AGENTS.md

This is *not* the Next.js you may know from training data — it's a custom
fork. Read `AGENTS.md` (root) before writing code; check
`node_modules/next/dist/docs/` for the actual API surface, and **heed
deprecation notices**.

## Security posture

- All `/api/ai/*` routes require a valid Supabase Bearer token.
- Rate limits: 4–15 req/min per route, 30–200/day, IP-augmented at 3× user limit.
- Prompt-injection: user-controlled fields run through `lib/prompt-safety.ts`
  before being placed into prompts (strips closing tags, control chars,
  bidi/zero-width unicode, role prefixes).
- `next.config.ts` sets CSP, HSTS, COOP/CORP, frame-ancestors none.
- Anthropic + Upstash secrets are server-only — never `NEXT_PUBLIC_*`.

## Where things are

- Landing page UI:    `app/page.tsx`
- AI feedback route:  `app/api/ai/feedback/route.ts`
- AI vision route:    `app/api/ai/vision/route.ts`
- AI insight route:   `app/api/ai/insight/route.ts`
- AI report route:    `app/api/ai/report/route.ts`
- KB loader:          `lib/knowledge-loader.ts`
- Auth + rate limit:  `lib/api-auth.ts`
- Prompt sanitizer:   `lib/prompt-safety.ts`
- Game constants:     `constants/game-data.ts`

## Audit history

Run reports live in `docs/audit_old/` (sprint history) and
`docs/sprints/` (CHANGELOG, STANDARDS, AUDIT_PROTOCOL). Latest brutal-pass
KB report: `docs/audit_old/brutal-final-audit-2026-05-05.md` — 165 / 167
files at 9–10 ship-grade.
