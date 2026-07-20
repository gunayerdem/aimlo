// Billing saf-fonksiyon regresyon testleri (Faz 3, 2026-07-20).
// RUN: npx tsx scripts/test-billing.ts  (exit 1 = kırık)
// server-only guard'ı tsx altında import'u engellemesin diye önce module'ü boşla:
import Module from "node:module";
const origResolve = (Module as unknown as { _resolveFilename: (...a: unknown[]) => unknown })._resolveFilename;
(Module as unknown as { _resolveFilename: (...a: unknown[]) => unknown })._resolveFilename = function (...args: unknown[]) {
  if (args[0] === "server-only") return origResolve.call(this, "node:path");
  return origResolve.apply(this, args);
};

import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// lib/billing → lib/supabase/server import-anında env doğrular; .env.local'ı yükle.
try {
  const envRaw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
  for (const line of envRaw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch { /* CI'da env zaten set olabilir */ }

let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) console.log(`  ok  ${name}`);
  else { fail++; console.log(`  FAIL ${name}: got=${g} want=${w}`); }
};

async function main() {
  const { verifyStripeSignature, monthlyCents } = await import("../lib/billing");
  const { formatUsd } = await import("../lib/openai-pricing");

  // ── verifyStripeSignature ──
  const secret = "whsec_test_123";
  const body = '{"id":"evt_1","type":"invoice.paid"}';
  const t = Math.floor(Date.now() / 1000);
  const sig = (ts: number | string, b: string, s: string) =>
    createHmac("sha256", s).update(`${ts}.${b}`, "utf8").digest("hex");

  eq("geçerli imza kabul", verifyStripeSignature(body, `t=${t},v1=${sig(t, body, secret)}`, secret), true);
  eq("bozuk gövde red", verifyStripeSignature(body + "x", `t=${t},v1=${sig(t, body, secret)}`, secret), false);
  eq("yanlış secret red", verifyStripeSignature(body, `t=${t},v1=${sig(t, body, "baska")}`, secret), false);
  const old = t - 3600;
  eq("eski timestamp red (replay)", verifyStripeSignature(body, `t=${old},v1=${sig(old, body, secret)}`, secret), false);
  eq("çoklu v1 — biri doğruysa kabul",
    verifyStripeSignature(body, `t=${t},v1=deadbeef,v1=${sig(t, body, secret)}`, secret), true);
  eq("header yok red", verifyStripeSignature(body, null, secret), false);
  eq("secret boş red", verifyStripeSignature(body, `t=${t},v1=${sig(t, body, secret)}`, ""), false);
  eq("v1 yok red", verifyStripeSignature(body, `t=${t}`, secret), false);
  // L2 kanoniklik: baştaki-sıfırlu t token'ı — imza ham token üzerinden atılırsa geçmeli.
  const tPad = `0${t}`;
  eq("kanonik olmayan t token'ı (ham token imzası) kabul",
    verifyStripeSignature(body, `t=${tPad},v1=${sig(tPad, body, secret)}`, secret), true);

  // ── monthlyCents (MRR indirgeme) ──
  eq("month 1:1", monthlyCents(999, "month"), 999);
  eq("year /12", monthlyCents(12000, "year"), 1000);
  eq("week ×4.35", monthlyCents(100, "week"), 435);
  eq("day ×30.4", monthlyCents(100, "day"), 3040);

  // ── formatUsd (negatif kâr kartı) ──
  eq("negatif büyük", formatUsd(-4.23), "-$4.23");
  eq("negatif küçük", formatUsd(-0.005), "-$0.0050");
  eq("sıfır", formatUsd(0), "$0");
  eq("pozitif", formatUsd(12.34), "$12.34");

  console.log(fail === 0 ? "\nTÜM TESTLER GEÇTİ ✓" : `\n${fail} TEST BAŞARISIZ ✗`);
  process.exit(fail ? 1 : 0);
}

void main();
