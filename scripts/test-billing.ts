// Billing saf-fonksiyon regresyon testleri (Faz 3, 2026-07-20).
// RUN: npx tsx scripts/test-billing.ts  (exit 1 = kırık)
// server-only guard'ı tsx altında import'u engellemesin diye önce module'ü boşla:
import Module from "node:module";
const origResolve = (Module as unknown as { _resolveFilename: (...a: unknown[]) => unknown })._resolveFilename;
(Module as unknown as { _resolveFilename: (...a: unknown[]) => unknown })._resolveFilename = function (...args: unknown[]) {
  // "path" — "node:path" DEĞİL: dönüş değeri dosya yolu gibi işleniyor ve Node 22
  // (CI) `node:path`i gerçek dosya sanıp ENOENT veriyordu. Bkz. test-entitlements.ts.
  if (args[0] === "server-only") return origResolve.call(this, "path");
  return origResolve.apply(this, args);
};

import { createHmac } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
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

  // ── OLCUM-ARACI-17 (B07, 2026-09-24): model kimliği TEK KAYNAK — lib/ai-model.ts ──
  // Model id 5 route + saveAiUsage fallback'leri + VISION/REPORT/REFINE_CALL + eval
  // aynaları + FALLBACK_MODEL'da elle yazılıydı; göçte biri atlanırsa route'lar arası
  // karışık model / yanlış ai_usage etiketi (→ yanlış fiyat). Model değişimi artık
  // tek satır; bu kilitler göçün eksik kalmasını CI'da yakalar.
  const { AI_MODEL } = await import("../lib/ai-model");
  const { PRICING } = await import("../lib/openai-pricing");
  eq("PRICING[AI_MODEL] tanımlı — model göçünde fiyat satırı AYNI commit'te eklenmeli",
    Object.prototype.hasOwnProperty.call(PRICING, AI_MODEL), true);
  const ROOT = join(__dirname, "..");
  const aiModelSrc = readFileSync(join(ROOT, "lib", "ai-model.ts"), "utf8");
  eq("lib/ai-model.ts yaprak modül (import/require yok → döngü riski yok)",
    /^\s*(import\b|export\s[^=]*\bfrom\b)|\brequire\(/m.test(aiModelSrc), false);
  // Grep-guard: app/ lib/ scripts/ kodunda AI_MODEL'in TIRNAKLI literal'i yalnız
  // lib/ai-model.ts'te ve fiyat tablosunun anahtarında (tam 1 kez) geçebilir.
  // Desen AI_MODEL'den kurulur → göçten sonra YENİ id için de aynı kural işler.
  const modelEsc = AI_MODEL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const litRe = new RegExp("[\"'`]" + modelEsc + "[\"'`]", "g");
  const litHits: string[] = [];
  const walk = (rel: string): void => {
    for (const e of readdirSync(join(ROOT, rel), { withFileTypes: true })) {
      const r = `${rel}/${e.name}`;
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        walk(r);
        continue;
      }
      if (!/\.(ts|tsx|mts|cts|js|mjs|cjs)$/.test(e.name)) continue;
      const n = (readFileSync(join(ROOT, r), "utf8").match(litRe) ?? []).length;
      if (n === 0 || r === "lib/ai-model.ts" || (r === "lib/openai-pricing.ts" && n === 1)) continue;
      litHits.push(`${r}×${n}`);
    }
  };
  for (const d of ["app", "lib", "scripts"]) walk(d);
  eq(`grep-guard: app/ lib/ scripts/ altında tırnaklı ${AI_MODEL} literal'i yok (izinli: lib/ai-model.ts + fiyat tablosu anahtarı)`,
    litHits, []);

  // ── OLCUM-ARACI-16 (B07, 2026-09-24): bilinmeyen model id artık UYARILI + SAYILI ──
  // Eskiden pricingFor tablo-dışı id'yi SESSİZCE fallback fiyatına düşürüyordu (ölçüm:
  // yazım hatalı 'gpt5.6-terra' $0.0041, gerçek 'gpt-5.6-terra' $0.0316 → 7,7× eksik)
  // ve önek eşleşmesi Object.keys sırasındaki İLK anahtarı alıyordu. Fiyat DEĞERLERİ
  // değişmez (bilinen modeller bayt-aynı, bilinmeyen yine fallback); değişen görünürlük.
  const pricingMod = await import("../lib/openai-pricing");
  const { computeCost, pricingFor, resolvePricing } = pricingMod;
  const { aggregateRollup } = await import("../lib/admin-data");
  // Fix-öncesi kodda resolvePricing/aggregateRollup yok → çağrı TypeError; testin
  // geri kalanı koşsun diye istisna FAIL sayılır.
  const safe = (name: string, fn: () => void) => {
    try { fn(); } catch (e) { fail++; console.log(`  FAIL ${name}: threw ${(e as Error).message}`); }
  };
  const baseOf = (id: string) => id.replace(/-\d{4}-\d{2}-\d{2}$/, "");
  const USAGES = [
    { promptTokens: 50000, completionTokens: 300, cachedTokens: 40000 },
    { promptTokens: 12345, completionTokens: 678, cachedTokens: 0 },
    { promptTokens: 100, completionTokens: 50, cachedTokens: 500 }, // bozuk satır: cached > prompt (clamp)
    { promptTokens: 1_000_000, completionTokens: 1_000_000, cachedTokens: 1_000_000 },
  ];
  // Fix-ÖNCESİ (HEAD 297250a) lib/openai-pricing.ts computeCost çıktısı — tarihli
  // snapshot id'leri (OpenAI yanıtındaki `model` alanı böyle gelir, ai_usage'a bu yazılır).
  const GOLDEN_COST: Record<string, number[]> = {
    "gpt-5-mini-2025-08-07": [0.0041, 0.00444225, 0.00010250000000000001, 2.025],
    "gpt-5.6-luna-2026-05-01": [0.00316, 0.0032826, 0.000062, 1.22],
    "gpt-5.4-nano-2026-03-17": [0.003175, 0.0033165, 0.0000645, 1.27],
    "gpt-5.6-terra-2026-05-01": [0.0316, 0.032826, 0.0006200000000000001, 12.2],
    "gpt-5-nano-2025-08-07": [0.00082, 0.00088845, 0.0000205, 0.405],
    "gpt-5.4-mini-2026-03-17": [0.01185, 0.01230975, 0.0002325, 4.575],
    "gpt-6-astra-2026-06-01": [0.15500000000000003, 0.15735, 0.0026, 51],
  };
  const costs = (id: string | null) => USAGES.map((u) => computeCost(u, id));

  const warns: string[] = [];
  const origWarn = console.warn;
  console.warn = (...a: unknown[]) => { warns.push(a.map(String).join(" ")); };
  const warnsSince = (mark: number) => warns.slice(mark);
  try {
    // (a) computeCost bilinen modellerde bugünküyle BAYT-AYNI (tarihli id + tablo anahtarı).
    let mark = warns.length;
    for (const [id, want] of Object.entries(GOLDEN_COST)) {
      eq(`computeCost bayt-aynı: ${id}`, costs(id), want);
      eq(`computeCost bayt-aynı: ${baseOf(id)} (tablo anahtarı)`, costs(baseOf(id)), want);
    }
    // Yanlış-pozitif ölçümü: prod'un yazdığı id'ler (route fallback = AI_MODEL, OpenAI
    // yanıtı = tarihli snapshot) + tablonun tüm anahtarları → HİÇ uyarı yok.
    for (const k of Object.keys(PRICING)) pricingFor(k);
    pricingFor(AI_MODEL);
    eq("bilinen id'lerde (tablo + tarihli snapshot + AI_MODEL) 0 uyarı — yanlış-pozitif yok", warnsSince(mark), []);

    // (b) resolvePricing: tarihli id bilinen; matchedKey tablo anahtarı.
    safe("resolvePricing tarihli id", () => {
      const r = resolvePricing("gpt-5-mini-2025-08-07");
      eq("resolvePricing('gpt-5-mini-2025-08-07').known === true · matchedKey tablo anahtarı",
        [r.known, r.matchedKey, r.pricing], [true, baseOf("gpt-5-mini-2025-08-07"), PRICING[baseOf("gpt-5-mini-2025-08-07")]]);
    });

    // (c) bilinmeyen id: known=false, fallback = AI_MODEL fiyatı, console.warn TAM 1 kez, ikincide 0.
    safe("resolvePricing bilinmeyen id", () => {
      mark = warns.length;
      const r = resolvePricing("gpt-5.5-mini");
      eq("resolvePricing('gpt-5.5-mini').known === false · matchedKey = AI_MODEL · fiyat = PRICING[AI_MODEL]",
        [r.known, r.matchedKey, r.pricing], [false, AI_MODEL, PRICING[AI_MODEL]]);
      const first = warnsSince(mark);
      eq("bilinmeyen id → console.warn tam 1 kez (id + fallback adı + kurtarma yolu)",
        [first.length, first.length === 1 && first[0].includes("gpt-5.5-mini") && first[0].includes(`priced as ${AI_MODEL}`) && first[0].includes("PRICING")],
        [1, true]);
      mark = warns.length;
      resolvePricing("gpt-5.5-mini");
      eq("aynı id ikinci kez → 0 yeni uyarı (log seli yok)", warnsSince(mark).length, 0);
    });

    // (d) Eski API yolu (admin panelleri computeCost→pricingFor çağırır): değer AYNI, uyarı artık VAR.
    mark = warns.length;
    eq("yazım hatalı 'gpt5.6-terra' fiyat DEĞERİ değişmedi (fallback = AI_MODEL fiyatı)", costs("gpt5.6-terra"), costs(AI_MODEL));
    eq("computeCost('gpt5.6-terra') yolu da tam 1 uyarı basar (4 çağrıda 1 — eskiden 0, sessiz düşüş)",
      warnsSince(mark).filter((w) => w.includes("gpt5.6-terra")).length, 1);

    // (e) null/boş id tahmini fiyatlanır (tek etiket), "constructor" gibi id NaN üretmez.
    safe("resolvePricing null/boş", () => {
      mark = warns.length;
      eq("null ve '' → known false (ikisi tek '(boş)' uyarısı)", [resolvePricing(null).known, resolvePricing("").known, warnsSince(mark).length], [false, false, 1]);
    });
    eq("computeCost(…, 'constructor') sonlu ve fallback fiyatında (eskiden Object.prototype → NaN)", costs("constructor"), costs(AI_MODEL));

    // (f) EN UZUN önek: tabloya kısa bir "gpt-5" anahtarı ÖNE eklense bile tarihli
    // "gpt-5-mini-…" id'si kendi fiyatını alır (eskiden ilk eşleşen "gpt-5" kazanırdı).
    const snapshot = { ...PRICING };
    try {
      for (const k of Object.keys(PRICING)) delete PRICING[k];
      PRICING["gpt-5"] = { inputPerM: 1.25, outputPerM: 10, cachedInputPerM: 0.125 };
      Object.assign(PRICING, snapshot);
      const id = "gpt-5-mini-2025-08-07";
      eq("en-uzun-önek: 'gpt-5' anahtarı önde iken 'gpt-5-mini-2025-08-07' → kendi fiyatı (gpt-5 DEĞİL)",
        pricingFor(id), snapshot[baseOf(id)]);
      safe("resolvePricing en-uzun-önek", () => {
        eq("en-uzun-önek: matchedKey tablo anahtarı", resolvePricing(id).matchedKey, baseOf(id));
      });
    } finally {
      for (const k of Object.keys(PRICING)) delete PRICING[k];
      Object.assign(PRICING, snapshot);
    }
    eq("PRICING tablo sırası/içeriği test sonrası geri geldi", Object.keys(PRICING), Object.keys(snapshot));

    // (g) /admin/cost 'unpriced' sayacı (RPC rollup yolu — saf fonksiyon).
    safe("aggregateRollup unpriced sayacı", () => {
      const day = new Date().toISOString().slice(0, 10);
      const row = (route_type: string, model: string | null, calls: number, p: number, c: number, k: number) =>
        ({ day, route_type, model, calls, prompt_tokens: p, completion_tokens: c, cached_tokens: k });
      const rows = [
        row("vision", "gpt-5-mini-2025-08-07", 7, 70000, 2100, 50000),
        row("report", AI_MODEL, 2, 30000, 1800, 20000),
        row("vision", "gpt-9-unknown", 3, 30000, 900, 0),
        row("ask", null, 1, 5000, 100, 0),
      ];
      const out = aggregateRollup(rows);
      let wantTotal = 0;
      for (const r of rows) wantTotal += computeCost({ promptTokens: r.prompt_tokens, completionTokens: r.completion_tokens, cachedTokens: r.cached_tokens }, r.model);
      eq("aggregateRollup: bilinmeyen + boş model çağrıları sayılır (3+1), id listesi sıralı",
        [out.unpriced, out.unpricedModels, out.rows], [4, ["(boş)", "gpt-9-unknown"], 13]);
      eq("aggregateRollup: toplam maliyet satır-satır computeCost ile aynı (fiyat değişmedi)", out.total, wantTotal);
      const known = aggregateRollup(rows.slice(0, 2));
      eq("aggregateRollup: yalnız prod id'leri (tarihli + AI_MODEL) → unpriced 0 (rozet çıkmaz)",
        [known.unpriced, known.unpricedModels], [0, []]);
    });
  } finally {
    console.warn = origWarn;
  }

  console.log(fail === 0 ? "\nTÜM TESTLER GEÇTİ ✓" : `\n${fail} TEST BAŞARISIZ ✗`);
  process.exit(fail ? 1 : 0);
}

void main();
