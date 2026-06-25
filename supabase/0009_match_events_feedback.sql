-- ═══════════════════════════════════════════════════════════════
-- AIMLO 0009 — per-death feedback on match_events (2026-06-25)
-- ═══════════════════════════════════════════════════════════════
-- Stores the ACTUAL coaching the user received on each death (the vision
-- response: deathAnalysis / enemyAnalysis / nextRoundSuggestion) so the admin
-- /feedback + /live surfaces can review real per-death feedback. Piggybacks the
-- existing vision call → zero extra AI cost. Idempotent.
-- ═══════════════════════════════════════════════════════════════

alter table public.match_events add column if not exists feedback jsonb;
