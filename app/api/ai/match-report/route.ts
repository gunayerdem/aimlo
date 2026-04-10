/**
 * POST /api/ai/match-report
 * Alias for /api/ai/report — the desktop app POSTs here at match end.
 * Re-exports the same handler so both paths work identically.
 */
export { POST } from "../report/route";
