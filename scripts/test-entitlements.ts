// Ücretsiz katman kotası regresyon testleri (Faz 3, 2026-07-20).
// RUN: npx tsx scripts/test-entitlements.ts  (exit 1 = kırık)
//
// EN KRİTİK TEST: bayrak KAPALIYKEN hiçbir ağ çağrısı yapılmamalı (beta'da
// sıfır maliyet + sıfır gecikme). fetch'i sarmalayıp çağrı sayıyoruz.
import Module from "node:module";
const origResolve = (Module as unknown as { _resolveFilename: (...a: unknown[]) => unknown })._resolveFilename;
(Module as unknown as { _resolveFilename: (...a: unknown[]) => unknown })._resolveFilename = function (...args: unknown[]) {
  // ⚠ "path" — "node:path" DEĞİL (CI kırmızıydı, 2026-08-03). `server-only`
  // paketini zararsız bir yerleşik modüle yönlendiriyoruz; ama _resolveFilename'in
  // DÖNÜŞ değeri yükleyici için bir dosya yolu gibi işlenir. Node 24 "node:path"i
  // yerleşik olarak tanıyıp geçiyor, Node 22 (CI runner'ı) onu gerçek bir dosya
  // sanıp `ENOENT: open 'node:path'` ile patlıyordu. Öneksiz "path" iki sürümde de
  // yerleşiğe çözülür.
  if (args[0] === "server-only") return origResolve.call(this, "path");
  return origResolve.apply(this, args);
};

let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) console.log(`  ok  ${name}`);
  else { fail++; console.log(`  FAIL ${name}: got=${g} want=${w}`); }
};

// Ağ çağrısı sayacı — bayrak-kapalı no-op kanıtı için.
let fetchCalls = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = ((...a: Parameters<typeof realFetch>) => {
  fetchCalls++;
  return realFetch(...a);
}) as typeof realFetch;

// lib/billing → lib/supabase/server import-anında env doğruluyor; sahte değer yeter.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-key";

async function main() {
  const ent = await import("../lib/entitlements");

  // ── isoWeekKey: yıl sınırı (ISO 8601) ──
  eq("2027-01-01 (Cuma) → 2026-W53", ent.isoWeekKey(new Date("2027-01-01T12:00:00Z")), "2026-W53");
  eq("2027-01-04 (Pzt) → 2027-W01", ent.isoWeekKey(new Date("2027-01-04T12:00:00Z")), "2027-W01");
  eq("2026-07-20 (Pzt) → 2026-W30", ent.isoWeekKey(new Date("2026-07-20T12:00:00Z")), "2026-W30");
  eq("hafta içi aynı anahtar", ent.isoWeekKey(new Date("2026-07-24T23:00:00Z")), ent.isoWeekKey(new Date("2026-07-20T01:00:00Z")));
  eq("sonraki hafta FARKLI anahtar",
    ent.isoWeekKey(new Date("2026-07-27T00:00:00Z")) !== ent.isoWeekKey(new Date("2026-07-20T00:00:00Z")), true);

  // ── Bayrak varsayılan KAPALI ──
  delete process.env.FREE_TIER_ENFORCED;
  eq("bayrak varsayılan kapalı", ent.isFreeTierEnforced(), false);
  process.env.FREE_TIER_ENFORCED = "1";
  eq("'1' yetmez — yalnız 'true'", ent.isFreeTierEnforced(), false);
  process.env.FREE_TIER_ENFORCED = "TRUE";
  eq("'TRUE' yetmez (case-sensitive)", ent.isFreeTierEnforced(), false);
  process.env.FREE_TIER_ENFORCED = "true";
  eq("'true' açar", ent.isFreeTierEnforced(), true);

  // ── BETA NO-OP KANITI: bayrak kapalı → SIFIR ağ çağrısı ──
  delete process.env.FREE_TIER_ENFORCED;
  fetchCalls = 0;
  const v1 = await ent.checkMatchQuota("user-1", "11111111-1111-4111-8111-111111111111");
  eq("kapalıyken izin verir", v1.allowed, true);
  eq("kapalıyken enforced=false", v1.enforced, false);
  eq("kapalıyken SIFIR ağ çağrısı", fetchCalls, 0);

  // matchId'siz de aynı — beta'da kimse engellenmez
  fetchCalls = 0;
  const v2 = await ent.checkMatchQuota("user-1", null);
  eq("kapalı + matchId yok → izin", v2.allowed, true);
  eq("kapalı + matchId yok → sıfır çağrı", fetchCalls, 0);

  // ── Bayrak AÇIK ama Upstash yapılandırılmamış → fail-open ──
  process.env.FREE_TIER_ENFORCED = "true";
  const savedUrl = process.env.UPSTASH_REDIS_REST_URL;
  const savedTok = process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const v3 = await ent.checkMatchQuota("user-1", "11111111-1111-4111-8111-111111111111");
  eq("Upstash yoksa fail-open (izin)", v3.allowed, true);
  eq("Upstash yoksa enforced=true raporlanır", v3.enforced, true);
  if (savedUrl) process.env.UPSTASH_REDIS_REST_URL = savedUrl;
  if (savedTok) process.env.UPSTASH_REDIS_REST_TOKEN = savedTok;
  delete process.env.FREE_TIER_ENFORCED;

  // ── Sabitler ──
  eq("haftalık hak 3", ent.FREE_WEEKLY_MATCH_QUOTA, 3);

  console.log(fail === 0 ? "\nTÜM TESTLER GEÇTİ ✓" : `\n${fail} TEST BAŞARISIZ ✗`);
  process.exit(fail ? 1 : 0);
}

void main();
