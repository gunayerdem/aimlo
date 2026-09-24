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
import * as fs from "node:fs";
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
  // "path" — "node:path" DEĞİL: Node 22'de (CI) ENOENT'e yol açıyordu.
  // Bkz. scripts/test-entitlements.ts'teki ayrıntılı gerekçe.
  if (req === "server-only") return origResolve.call(this, "path", ...args.slice(1));
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

  // ── 1b) RAPOR AI HATASI TEL KODLARI — FB01 · F54 ─────────────────────────
  // Rapor route'u AI hatasında artık 502/504 döner (şablon yok). Masaüstü v1.0.19
  // classify_http_error KOD EŞLEMESİ statüden ÖNCE gelir (aimlo-desktop ai_client.rs:619-626):
  // "ai_invalid_json"/"ai_invalid_shape" → InvalidShape → report_flush_is_permanent
  // (lib.rs:7484) → A2 kuyruğu maçı KALICI düşürür. Tel `error` alanı bu yüzden YALNIZ
  // Upstream kümesinden olabilir (ai_client.rs:623: ai_timeout | ai_unavailable |
  // ai_upstream_error) ve statü 5xx olmalı — aksi hâlde AI kesintisi maç kaybına döner.
  console.log("\n[1b] RAPOR AI HATASI — tel kodu masaüstünün Upstream (yeniden denenir) kümesinde");
  {
    const rp = await import("../lib/report-prompt");
    const DESKTOP_UPSTREAM = new Set(["ai_timeout", "ai_unavailable", "ai_upstream_error"]);
    for (const [code, wire] of Object.entries(rp.REPORT_AI_FAILURE_WIRE)) {
      const f = rp.buildReportAIFailure(code as Parameters<typeof rp.buildReportAIFailure>[0], "tr");
      t(`${code} → ${wire.status} error=${wire.error} (Upstream, kalıcı değil) + Retry-After`,
        DESKTOP_UPSTREAM.has(f.body.error) && f.status >= 500 && f.status < 600 && f.headers["Retry-After"] === "30" && f.body.detail.reason === code,
        JSON.stringify(f));
    }
    t("hata gövdesinde koç metni alanı yok ve 'Analiz yapılamadı.' yok (frontend reddi)",
      Object.keys(rp.REPORT_AI_FAILURE_WIRE).every((c) => {
        const f = rp.buildReportAIFailure(c as Parameters<typeof rp.buildReportAIFailure>[0], "en");
        return !("summary" in f.body) && !JSON.stringify(f.body).includes("Analiz yapılamadı.");
      }));
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
  // Desktop CANONICAL_KIND_LIST (aimlo-desktop/src-tauri/src/telemetry.rs) ile
  // backend VALID_TYPES birbirinden bağımsız iki liste; ayrışırlarsa desktop'ın
  // gönderdiği event sessizce "invalid_type" ile düşer. Bu test listeyi ÇİVİLER.
  console.log("\n[3] TELEMETRY — bilinmeyen kind reddi + kanonik liste");
  {
    const tt = await import("../lib/telemetry-types");
    const { validateTelemetryEvent } = tt;
    const now = Date.now();
    t(
      "bilinmeyen kind reddedilir",
      validateTelemetryEvent({ type: "totally_made_up_kind", ts: now, value: 1 }, now) === "invalid_type",
      `got=${validateTelemetryEvent({ type: "totally_made_up_kind", ts: now, value: 1 }, now)}`,
    );
    t("type alanı yoksa reddedilir", validateTelemetryEvent({ ts: now }, now) === "invalid_type");
    // Desktop'ın gönderdiği TÜM kanonik tipler KABUL edilmeli (sözleşme kilidi).
    // ⚠ 16.09.2026 launch denetimi: bu liste 5 tipte DONMUŞTU; desktop
    // CANONICAL_KIND_LIST'te 9 tip vardı (telemetry.rs:457-467). Eksik 4'ün
    // 3'ü (app_open/login_ok/watch_started) backend VALID_TYPES'ta da yoktu →
    // 31.07.2026'dan beri her biri `invalid_type` ile SESSİZCE düşüyordu ve
    // "sözleşmeyi çivileyen" bu test onu göremiyordu. Liste artık TAM:
    // desktop telemetry.rs CANONICAL_KIND_LIST ile birebir 9 tip.
    const KANONIK: [string, Record<string, unknown>][] = [
      ["round_end_latency_ms", { value: 1200 }],
      ["ai_call_duration_ms", { value: 3400, route: "vision" }],
      ["error_code_count", { count: 2, code: "ai_timeout" }],
      ["ocr_frame_budget_ms", { value: 18 }],
      ["match_completed", {}],
      ["watch_health", { value: 22, count: 26, round: 3, code: "fb b0/0 s2+0/p5/a12 p7 0-0" }],
      ["app_open", { count: 1 }],
      ["login_ok", { count: 1 }],
      ["watch_started", { count: 1 }],
      // B08 (2026-09-24): backend ÖNCE — desktop D20 sonra gönderir (A006 dersi).
      ["watch_stopped", { count: 1, code: "user_stop", round: 3 }],
      ["rig_profile", { count: 1, code: "w26100 wgc1 b1L0 gnv1 1920x1080@100 m1 uitr ocrtr fs1" }],
    ];
    for (const [type, extra] of KANONIK) {
      const r = validateTelemetryEvent({ type, ts: now, ...extra }, now);
      t(`kanonik kind kabul: ${type}`, r === null, `reddedildi: ${r}`);
    }

    // B08 · A006 SÖZLEŞME KİLİDİ: KANONIK elle yazılmış bir liste — 16.09'da
    // tam da bu yüzden 5 tipte donmuş ve kaymayı göstermemişti. Desktop repo'su
    // yan klasördeyse (geliştirici makinesi) CANONICAL_KIND_LIST DOSYADAN okunur
    // ve HER tipin (a) KANONIK'te örnek yükü olduğu, (b) backend'de kabul
    // edildiği iddia edilir. CI'da dosya yok → açık ATLANDI satırı (sessiz geçiş
    // yok). Dosya var ama liste çözümlenemiyorsa bu bir KIRMIZIDIR (format
    // değiştiyse kilit kör kalmasın).
    const desktopTelemetry = path.join(REPO_ROOT, "..", "aimlo-desktop", "src-tauri", "src", "telemetry.rs");
    const kanonikTipler = new Set(KANONIK.map(([type]) => type));
    if (fs.existsSync(desktopTelemetry)) {
      const src = fs.readFileSync(desktopTelemetry, "utf8");
      const m = /const\s+CANONICAL_KIND_LIST\s*:\s*&\[&str\]\s*=\s*&\[([\s\S]*?)\];/.exec(src);
      const desktopKinds = m
        ? [...m[1].split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, "")).join("\n").matchAll(/"([^"]+)"/g)].map((x) => x[1])
        : [];
      t("desktop CANONICAL_KIND_LIST çözümlendi (≥1 tip)", desktopKinds.length > 0, `dosya=${desktopTelemetry}`);
      for (const kind of desktopKinds) {
        t(`desktop kind KANONIK'te örnekli: ${kind}`, kanonikTipler.has(kind), "KANONIK tablosuna örnek yük ekle");
        const extra = KANONIK.find(([type]) => type === kind)?.[1] ?? {};
        const r = validateTelemetryEvent({ type: kind, ts: now, ...extra }, now);
        t(`desktop kind backend'de kabul: ${kind}`, r === null, `reddedildi: ${r} — prod bu olayı SESSİZCE düşürür`);
      }
      const yalnizBackend = [...kanonikTipler].filter((k) => !desktopKinds.includes(k));
      if (yalnizBackend.length > 0) {
        console.log(`  ℹ  desktop henüz göndermiyor (backend önde, beklenen): ${yalnizBackend.join(", ")}`);
      }
    } else {
      console.log(`  ⏭  ATLANDI — desktop repo yok (${desktopTelemetry}); KANONIK elle tutulan listeye güveniliyor`);
    }

    // Ters yön: backend'in kabul ettiği HER tipin KANONIK'te örnek yükü olmalı —
    // yeni tip eklenip zorunlu-alan kuralı test edilmeden kalmasın.
    const backendTipleri: readonly string[] = (tt as { TELEMETRY_EVENT_TYPES?: readonly string[] }).TELEMETRY_EVENT_TYPES ?? [];
    t("backend tip listesi dışa açık (TELEMETRY_EVENT_TYPES)", backendTipleri.length > 0);
    for (const type of backendTipleri) {
      t(`backend tipi KANONIK'te örnekli: ${type}`, kanonikTipler.has(type));
    }

    // Zorunlu alanlar (B08): sebep / rig dizesi olmadan olay değersiz.
    const zorunlu: [string, Record<string, unknown>, string][] = [
      ["watch_stopped", { count: 1 }, "code_required"],
      ["rig_profile", { count: 1 }, "code_required"],
      ["rig_profile", { count: 1, code: "x".repeat(65) }, "code_invalid"],
    ];
    for (const [type, extra, want] of zorunlu) {
      const r = validateTelemetryEvent({ type, ts: now, ...extra }, now);
      t(`${type} ${JSON.stringify(extra).slice(0, 40)} → ${want}`, r === want, `got=${r}`);
    }
    // Sunucunun kendi yazdığı özet tipi istemciden SAHTELENEMEZ.
    t(
      "telemetry_rejected istemciden gelirse invalid_type",
      validateTelemetryEvent({ type: "telemetry_rejected", ts: now, count: 999, code: "x" }, now) === "invalid_type",
    );

    // A030: sürüm alanı + zenginleşmiş kodlar (desktop D10/D11/D19) bugünkü
    // kapılardan geçmeli — yeni tip gerektirmezler.
    t("isValidAppVersion('1.0.19')", tt.isValidAppVersion("1.0.19") === true);
    t("isValidAppVersion(65 char) → false", tt.isValidAppVersion("1".repeat(65)) === false);
    t(
      "error_code_count code 'capture_init_failed:border_noapi:0x80004002' kabul",
      validateTelemetryEvent({ type: "error_code_count", ts: now, count: 1, code: "capture_init_failed:border_noapi:0x80004002" }, now) === null,
    );
    t(
      "watch_started + code (rig dizesi) kabul",
      validateTelemetryEvent({ type: "watch_started", ts: now, count: 1, code: "w19045 nv c8 r16 1920x1080@100" }, now) === null,
    );

    // Red özeti (route [TELEMETRY_REJECTED] satırı + telemetry_rejected satırları).
    const summarize = (tt as { summarizeTelemetryRejections?: typeof tt.summarizeTelemetryRejections }).summarizeTelemetryRejections;
    if (typeof summarize !== "function") {
      t("summarizeTelemetryRejections dışa açık", false, "fonksiyon yok");
    } else {
      const s = summarize([{ type: "app_open", ts: now, count: 1 }], [{ idx: 0, reason: "invalid_type" }]);
      t(
        "red özeti: types={app_open:1}, reasons={invalid_type:1}, rows=[invalid_type:app_open×1]",
        JSON.stringify(s) === JSON.stringify({ reasons: { invalid_type: 1 }, types: { app_open: 1 }, rows: [{ code: "invalid_type:app_open", count: 1 }] }),
        `got=${JSON.stringify(s)}`,
      );
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
