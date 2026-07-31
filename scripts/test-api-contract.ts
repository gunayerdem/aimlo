/**
 * ROUTE SÖZLEŞME TESTİ (desktop + billing) — B43 (denetim 2026-07-31)
 * ────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-api-contract.ts   (exit 1 = kırık)
 *
 * NEDEN VAR: app/api altında 6 route grubu var ve HİÇBİRİNİN route-seviyesi
 * testi yoktu — auth-reddi, telemetry kind senkronu ve billing imza-reddi yalnız
 * CANLI testte doğrulanıyordu. Paddle entegrasyonu gündemdeyken imza-doğrulama
 * yolunun testsiz olması = launch'ta gelir + güven kaybı riski.
 *
 * YAKLAŞIM: Next 16 route handler'ları düz Node'da doğrudan import edilip
 * standart `Request` ile çağrılabiliyor (sunucu ayağa kaldırmaya gerek yok).
 * ⚠ HİÇBİR GERÇEK AI/DB/AĞ ÇAĞRISI YAPILMAZ — seçilen yolların HEPSİ ilk
 * kapıda (auth header yok / imza geçersiz / sağlayıcı yok) döner; OpenAI ve
 * Supabase'e giden kod satırına hiç ulaşılmaz. Bu bilinçli: test hem bedava
 * hem deterministik hem de CI'de secret istemiyor.
 *
 * KAPSAM DIŞI — BİLEREK (gizlemek yerine yazıyorum):
 *   • vision 400 (bozuk gövde) ve report 409 (idempotency): ikisi de AUTH'u
 *     GEÇMEYİ gerektiriyor, yani `supabase.auth.getUser` + gerçek DB. Modül
 *     seviyesinde Supabase stub'lamak mümkün ama kırılgan; bu iki assert
 *     Paddle/DB entegrasyon PR'ında gerçek test-kullanıcısıyla eklenmeli.
 *     Gövde doğrulayıcısının kendisi (isValidVisionRequest / isValidRoundHistory)
 *     route-içi private → dışa açılmadan birim-test edilemiyor.
 */
import Module from "node:module";
import * as path from "node:path";

/* ── Modül çözümleyici yamaları — test-billing.ts/test-entitlements.ts ile
 * AYNI kanıtlanmış kalıp. İKİ iş yapar:
 *   1) "server-only" → boş modüle çevir. O paket düz Node'da import edilince
 *      THROW eder (node_modules/server-only/index.js); lib/supabase/server,
 *      lib/entitlements, lib/ai-usage, lib/billing hepsi onu import ediyor.
 *   2) "@/..." alias'ını repo köküne çevir. Route dosyaları tsconfig paths
 *      alias'ını kullanıyor; bu yama tsx'in paths desteğine BAĞIMLILIĞI
 *      kaldırır (davranış tsx sürümünden bağımsız hâle gelir).
 * NOT: yama ÖNCE kurulmalı, bu yüzden route'lar aşağıda main() içinde
 * DİNAMİK import ediliyor (statik import'lar yamadan önce koşardı). */
const REPO_ROOT = path.join(__dirname, "..");
type ResolveFn = (...a: unknown[]) => unknown;
const origResolve = (Module as unknown as { _resolveFilename: ResolveFn })._resolveFilename;
(Module as unknown as { _resolveFilename: ResolveFn })._resolveFilename = function (...args: unknown[]) {
  const req = args[0];
  if (req === "server-only") return origResolve.call(this, "node:path", ...args.slice(1));
  if (typeof req === "string" && req.startsWith("@/")) {
    return origResolve.call(this, path.join(REPO_ROOT, req.slice(2)), ...args.slice(1));
  }
  return origResolve.apply(this, args);
};

/* ── SAHTE ENV — lib/supabase/server.ts import ANINDA bu ikisini şart koşuyor
 * (server.ts:29-30 throw). Değerler kasten geçersiz: gerçek bir projeye
 * işaret etmezler ve test edilen yolların hiçbiri ağa çıkmaz. */
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://contract-test.invalid";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "contract-test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "contract-test-service-key";
// Upstash TANIMSIZ kalmalı → rate-limiter bellek fallback'i (ağ yok).
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
// Billing sırları testin KENDİSİ tarafından yönetiliyor (aşağıda set/unset).
delete process.env.PADDLE_WEBHOOK_SECRET;
delete process.env.STRIPE_WEBHOOK_SECRET;

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};
const eqStatus = async (ad: string, res: Response, beklenen: number) => {
  const got = res.status;
  let govde = "";
  try { govde = (await res.text()).slice(0, 160); } catch { /* gövde okunamadı, önemsiz */ }
  t(`${ad} → ${beklenen}`, got === beklenen, `got=${got} body=${govde}`);
};

/** Desktop'ın attığı biçimde POST isteği (NextRequest yerine standart Request —
 *  test edilen kapılar yalnız headers.get/json/text kullanıyor). */
function post(url: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function main() {
  console.log("\n══════ ROUTE SÖZLEŞME TESTİ (ağ/AI/DB çağrısı YOK) ══════");

  // ── 1) AUTH KAPISI — token'sız her AI route'u 401 ─────────────────────────
  // verifyAuthAndRateLimit (lib/api-auth.ts:359-365) Authorization başlığı
  // "Bearer " ile başlamıyorsa Supabase'e HİÇ gitmeden 401 döner. Desktop bu
  // sözleşmeye göre 401'de oturumu yeniliyor — statü kodu DEĞİŞEMEZ.
  console.log("\n[1] AUTH — Authorization başlığı yokken 401");
  {
    const vision = await import("../app/api/ai/vision/route");
    const report = await import("../app/api/ai/report/route");
    const telemetry = await import("../app/api/telemetry/route");

    await eqStatus(
      "POST /api/ai/vision (token yok)",
      await vision.POST(post("https://aimlo.gg/api/ai/vision", { image: "x" }) as never),
      401,
    );
    await eqStatus(
      "POST /api/ai/report (token yok)",
      await report.POST(post("https://aimlo.gg/api/ai/report", { matchId: "x" }) as never),
      401,
    );
    await eqStatus(
      "POST /api/telemetry (token yok)",
      await telemetry.POST(post("https://aimlo.gg/api/telemetry", { events: [] }) as never),
      401,
    );

    // Alias sözleşmesi: desktop RAPORU /api/ai/match-report'a POST'luyor
    // (CLAUDE.md). Alias'ın POST'u re-export ettiği ve maxDuration taşıdığı
    // burada doğrulanır — B23'te alias'ın maxDuration'ı DÜŞÜRDÜĞÜ bulunmuştu.
    const alias = await import("../app/api/ai/match-report/route");
    t("match-report alias POST export ediyor", typeof alias.POST === "function");
    t(
      "match-report alias maxDuration=60 (Vercel 15s sessiz-kill koruması)",
      (alias as { maxDuration?: number }).maxDuration === 60,
      `got=${(alias as { maxDuration?: number }).maxDuration}`,
    );
  }

  // ── 2) PAYLOAD TAVANI — auth'tan ÖNCE 413 ────────────────────────────────
  // vision/route.ts:441-447: content-length > 5MB ise auth'a bile bakmadan 413.
  console.log("\n[2] PAYLOAD — content-length > 5MB → 413 (auth'tan önce)");
  {
    const vision = await import("../app/api/ai/vision/route");
    const req = post("https://aimlo.gg/api/ai/vision", { image: "x" }, { "content-length": "6000000" });
    // undici bazı sürümlerde content-length'i Request üzerinde tutmaz; başlık
    // gerçekten taşınmadıysa test ATLANIR (yanlış-kırmızı CI üretmemek için).
    if (req.headers.get("content-length") === "6000000") {
      await eqStatus("POST /api/ai/vision (6MB beyanı)", await vision.POST(req as never), 413);
    } else {
      console.log("  ⏭  ATLANDI — bu Node sürümü Request'te content-length taşımıyor");
    }
  }

  // ── 3) TELEMETRY KIND SENKRONU — desktop telemetry.rs ile ────────────────
  // Desktop CANONICAL_KIND_LIST (telemetry.rs:311-317) ile backend VALID_TYPES
  // birbirinden bağımsız iki liste; ayrışırlarsa desktop'ın gönderdiği event
  // sessizce "invalid_type" ile düşer. Bu test listeyi ÇİVİLER.
  console.log("\n[3] TELEMETRY — bilinmeyen kind reddi + kanonik liste");
  {
    const { validateTelemetryEvent } = await import("../lib/telemetry-types");
    const now = Date.now();
    t(
      "bilinmeyen kind reddedilir",
      validateTelemetryEvent({ type: "totally_made_up_kind", ts: now, value: 1 }, now) === "invalid_type",
      `got=${validateTelemetryEvent({ type: "totally_made_up_kind", ts: now, value: 1 }, now)}`,
    );
    t("type alanı yoksa reddedilir", validateTelemetryEvent({ ts: now }, now) === "invalid_type");
    // Desktop'ın gönderdiği 5 kanonik tip KABUL edilmeli (sözleşme kilidi).
    const KANONIK: [string, Record<string, unknown>][] = [
      ["round_end_latency_ms", { value: 1200 }],
      ["ai_call_duration_ms", { value: 3400, route: "vision" }],
      ["error_code_count", { count: 2, code: "ai_timeout" }],
      ["ocr_frame_budget_ms", { value: 18 }],
      ["match_completed", {}],
    ];
    for (const [type, extra] of KANONIK) {
      const r = validateTelemetryEvent({ type, ts: now, ...extra }, now);
      t(`kanonik kind kabul: ${type}`, r === null, `reddedildi: ${r}`);
    }
  }

  // ── 4) BILLING WEBHOOK — uyku + imza reddi ───────────────────────────────
  // Bu route'ta JWT YOK (çağıran ödeme sağlayıcısı) → tek kapı İMZA. Paddle
  // entegrasyonu bu hafta gündemde; imza yolunun testsiz kalması kabul edilemez.
  // İkisi de DB'ye DOKUNMADAN döner (createServiceSupabase imza kontrolünden SONRA).
  console.log("\n[4] BILLING WEBHOOK — sağlayıcı yok / imza geçersiz");
  {
    const billing = await import("../app/api/billing/webhook/route");
    const govde = JSON.stringify({ event_id: "evt_1", event_type: "subscription.created" });

    // (a) Hiçbir sağlayıcı sırrı yok → UYKUDA (503), hiçbir şey yazmaz.
    await eqStatus(
      "sağlayıcı yapılandırılmamış",
      await billing.POST(post("https://aimlo.gg/api/billing/webhook", govde) as never),
      503,
    );

    // (b) Paddle sırrı var ama imza saçma → 400.
    process.env.PADDLE_WEBHOOK_SECRET = "pdl_test_secret";
    await eqStatus(
      "Paddle geçersiz imza",
      await billing.POST(post("https://aimlo.gg/api/billing/webhook", govde, { "paddle-signature": "ts=1;h1=deadbeef" }) as never),
      400,
    );
    // (c) Sır var ama HİÇBİR imza başlığı yok → "imzasız kabul" ASLA olmamalı.
    await eqStatus(
      "imza başlığı hiç yok",
      await billing.POST(post("https://aimlo.gg/api/billing/webhook", govde) as never),
      400,
    );
    delete process.env.PADDLE_WEBHOOK_SECRET;

    // (d) Stripe sırrı var ama imza saçma → 400 (Stripe yolu da korunuyor).
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    await eqStatus(
      "Stripe geçersiz imza",
      await billing.POST(post("https://aimlo.gg/api/billing/webhook", govde, { "stripe-signature": "t=1,v1=deadbeef" }) as never),
      400,
    );
    delete process.env.STRIPE_WEBHOOK_SECRET;
  }

  console.log(fail === 0 ? "\n✅ SÖZLEŞME TESTLERİ GEÇTİ" : `\n❌ ${fail} SÖZLEŞME TESTİ BAŞARISIZ`);
  process.exit(fail ? 1 : 0);
}

void main().catch((e) => {
  console.error("\n❌ SÖZLEŞME TESTİ ÇÖKTÜ:", (e as Error).stack || e);
  process.exit(1);
});
