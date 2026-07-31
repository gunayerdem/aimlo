/**
 * POST /api/ai/match-report
 * Alias for /api/ai/report — the desktop app POSTs here at match end.
 * Re-exports the same handler so both paths work identically.
 */
export { POST } from "../report/route";

// B23 (2026-07-31): Next'te route segment config (maxDuration) SADECE o route
// dosyasının KENDİ export'undan okunur — `export { POST } from "../report/route"`
// handler'ı taşır ama ../report/route.ts:112'deki `maxDuration = 60`'ı TAŞIMAZ.
// Desktop maç raporunu ASIL buraya POST'luyor (ai_client.rs MATCH_REPORT_URL);
// bu satır olmadan fonksiyon platform default'unda kalıyordu (report/route.ts:110
// yorumu: "Without this export, Vercel kills the function at 15s on Pro silently")
// — AI 30s + refine 10s tam bu pencerede kesilebilirdi.
export const maxDuration = 60;
