/**
 * UUID v4 helpers — used by AI routes that accept a client-supplied
 * matchId (desktop SQLite write-behind queue → server-side analyses
 * INSERT). Keeping the regex in one place so vision/report/match-report
 * agree on the contract.
 */

// Canonical UUID v4: 8-4-4-4-12 hex with version=4 and variant in {8,9,a,b}.
// Case-insensitive — desktop emits lowercase, but accept either.
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV4(v: unknown): v is string {
  return typeof v === "string" && UUID_V4_REGEX.test(v);
}
