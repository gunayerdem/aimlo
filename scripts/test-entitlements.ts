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

  // ── FB04 · F93: 402 gövdesi abone/ücretsiz ayrımı yapar ──
  // KÖK: iki route sabit "Ücretsiz hesabın haftalık N maç … AIMLO+ ile sınırsız analiz al."
  // yazıyordu → adil kullanım tavanındaki PARA ÖDEYEN aboneye "ücretsiz" + "sınırsız" satışı.
  console.log("\n[F93] quotaExceededBody — fair_use CTA'sız, free_tier metni bayt-aynı");
  const qeb = (ent as { quotaExceededBody?: (q: unknown, lang?: "tr" | "en") => { error: string; message: string; detail: Record<string, unknown> } }).quotaExceededBody;
  const FAIR = { allowed: false, enforced: true, used: 100, limit: 100, unlimited: true, tier: "plus", reason: "fair_use", resetsAt: "2026-10-01T00:00:00.000Z" };
  const FREE = { allowed: false, enforced: true, used: 3, limit: 3, unlimited: false, tier: "free", reason: "free_tier", resetsAt: "2026-09-28T00:00:00.000Z" };
  const LEGACY_FREE = "Ücretsiz hesabın haftalık 3 maç analizi hakkı doldu. AIMLO+ ile sınırsız analiz al.";
  if (typeof qeb !== "function") {
    eq("quotaExceededBody lib/entitlements'tan export ediliyor", typeof qeb, "function");
  } else {
    const trF = qeb(FAIR, "tr");
    eq("fair_use TR metni (CTA'sız, tavan + yenilenme)", trF.message, "AIMLO+ aylık adil kullanım tavanın (100 maç) doldu; hakkın 1 Ekim'de yenilenir.");
    eq("fair_use TR: 'Ücretsiz' ve 'sınırsız' YOK", /ücretsiz|sınırsız/i.test(trF.message), false);
    const enF = qeb(FAIR, "en");
    eq("fair_use EN metni", enF.message, "You've reached the AIMLO+ fair-use limit of 100 match analyses this month; your allowance renews on October 1 (UTC).");
    eq("fair_use EN: 'free'/'unlimited' YOK", /\bfree\b|unlimited/i.test(enF.message), false);
    eq("fair_use detail: used/limit/resetsAt + reason/tier (additive)", trF.detail,
      { used: 100, limit: 100, resetsAt: "2026-10-01T00:00:00.000Z", reason: "fair_use", tier: "plus" });
    eq("error kodu değişmedi", trF.error, "quota_exceeded");
    eq("fair_use resetsAt yok → TR 'ay başında'", qeb({ ...FAIR, resetsAt: null }, "tr").message,
      "AIMLO+ aylık adil kullanım tavanın (100 maç) doldu; hakkın ay başında yenilenir.");
    eq("fair_use resetsAt yok → EN 'start of next month'", qeb({ ...FAIR, resetsAt: null }, "en").message,
      "You've reached the AIMLO+ fair-use limit of 100 match analyses this month; your allowance renews at the start of next month.");
    eq("TR ay eki tablosu (Ocak'ta / Eylül'de / Aralık'ta)", [
      qeb({ ...FAIR, resetsAt: "2027-01-01T00:00:00.000Z" }, "tr").message.includes("hakkın 1 Ocak'ta yenilenir"),
      qeb({ ...FAIR, resetsAt: "2026-09-01T00:00:00.000Z" }, "tr").message.includes("hakkın 1 Eylül'de yenilenir"),
      qeb({ ...FAIR, resetsAt: "2026-12-01T00:00:00.000Z" }, "tr").message.includes("hakkın 1 Aralık'ta yenilenir"),
    ], [true, true, true]);
    eq("'+' işaretine ek YOK (lib/brand.ts kuralı)", /AIMLO\+['’]/.test(trF.message + enF.message), false);
    eq("free_tier TR metni BAYT-AYNI (eski route metni)", qeb(FREE, "tr").message, LEGACY_FREE);
    eq("free_tier EN isteğinde de aynı metin (masaüstü EN 402 message'ını kullanmıyor)", qeb(FREE, "en").message, LEGACY_FREE);
    eq("free_tier detail reason/tier", qeb(FREE, "tr").detail,
      { used: 3, limit: 3, resetsAt: "2026-09-28T00:00:00.000Z", reason: "free_tier", tier: "free" });
  }

  // Route düzeyi: iki route da 402'yi AYNI kurucudan üretir (sahte harness, ağ/AI/DB yok).
  console.log("\n[F93] vision + report route 402 gövdesi (gerçek POST handler)");
  {
    const rh = await import("./report-route-harness");
    const vh = await import("./vision-route-harness");
    const reportRoute = rh.loadReportRoute();
    const visionRoute = vh.loadVisionRoute();
    const validReport = {
      rounds: [
        { round: 1, score: "1 - 0", result: "win", died: false, deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
        { round: 2, score: "1 - 1", result: "loss", died: true, deathLocation: "A Main", deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: "" },
      ],
      maxTokens: 800, map: "ascent", agent: "jett", side: "attacking",
    };
    const cases: [string, () => Promise<Response>][] = [
      ["report TR", () => reportRoute.POST(rh.reportRequest({ ...validReport, lang: "tr" }))],
      ["report EN", () => reportRoute.POST(rh.reportRequest({ ...validReport, lang: "en" }))],
      ["vision TR", () => visionRoute.POST(vh.visionRequest({ died: true, round: 1, map: "Ascent", agent: "Jett", lang: "tr" }))],
      ["vision EN", () => visionRoute.POST(vh.visionRequest({ died: true, round: 1, map: "Ascent", agent: "Jett", lang: "en" }))],
    ];
    for (const [label, call] of cases) {
      rh.resetHarness();
      rh.harness.quota = FAIR;
      const res = await call();
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string; detail?: Record<string, unknown> };
      const msg = String(body.message ?? "");
      eq(`${label}: fair_use → 402 quota_exceeded`, [res.status, body.error], [402, "quota_exceeded"]);
      eq(`${label}: gövdede 'Ücretsiz' ve 'sınırsız' YOK`, /Ücretsiz|sınırsız/.test(msg), false);
      eq(`${label}: detail.reason = fair_use, tier = plus`, [body.detail?.reason, body.detail?.tier], ["fair_use", "plus"]);
      eq(`${label}: AI çağrısı yapılmadı`, rh.harness.fetchCalls.length, 0);
    }
    rh.resetHarness();
    rh.harness.quota = FREE;
    const rf = await reportRoute.POST(rh.reportRequest({ ...validReport, lang: "tr" }));
    const bf = (await rf.json().catch(() => ({}))) as { message?: string; detail?: Record<string, unknown> };
    eq("report free_tier → eski metin bayt-aynı + reason free_tier", [rf.status, bf.message, bf.detail?.reason], [402, LEGACY_FREE, "free_tier"]);
    rh.resetHarness();
  }

  console.log(fail === 0 ? "\nTÜM TESTLER GEÇTİ ✓" : `\n${fail} TEST BAŞARISIZ ✗`);
  process.exit(fail ? 1 : 0);
}

void main();
