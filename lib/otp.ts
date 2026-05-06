import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/**
 * 6-digit numeric OTP (e.g. "847291"), displayed as "847-291".
 * Numeric-only because users find it faster to type on mobile than mixed
 * case alphanumerics (auto-karar pattern).
 *
 * Storage model: we DO NOT store the raw code anywhere — only an
 * HMAC-SHA256(secret, "<email>:<code>") in user_metadata.otp.hash.
 * Binding the email into the HMAC input means a leaked hash from one
 * account cannot be replayed against a different account.
 */

const ALPHABET = "0123456789"; // 10 chars (digits)
const OTP_LEN = 6;

export function generateOtp(): string {
  let code = "";
  for (let i = 0; i < OTP_LEN; i++) {
    code += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return code;
}

/** "ABC4XY" -> "ABC-4XY" for display in emails / UIs. */
export function formatOtp(code: string): string {
  return code.length === OTP_LEN ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}

/** Strip everything but digits, truncate to 6. */
export function normalizeOtp(input: string): string {
  return input.replace(/[^0-9]/g, "").slice(0, OTP_LEN);
}

export function hashOtp(code: string, email: string): string {
  const secret = process.env.OTP_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("OTP_HMAC_SECRET missing or too short (need >=32 chars)");
  }
  return createHmac("sha256", secret)
    .update(`${email.toLowerCase().trim()}:${code}`)
    .digest("hex");
}

/** Constant-time compare. Returns false on any length / format mismatch. */
export function verifyOtp(input: string, expectedHash: string, email: string): boolean {
  const normalized = normalizeOtp(input);
  if (normalized.length !== OTP_LEN) return false;
  let candidate: string;
  try {
    candidate = hashOtp(normalized, email);
  } catch {
    return false;
  }
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
