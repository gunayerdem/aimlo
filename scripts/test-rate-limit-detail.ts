/**
 * P9 regresyon kilidi (2026-08-05): 429 gövdesindeki detail.kind sözleşmesi.
 *
 * NEDEN: desktop (ai_client.rs classify_http_error) 429'u "günlük kota mı,
 * kısa-pencere mi" diye ÖNCE detail.kind ile ayırır; alan yokken yedek yol
 * `message` alanına bakıyordu ama backend metni `error` alanına koyar — yani
 * günlük kota PerIp sanılıp kullanıcı "3600 sn sonra tekrar dene" görüyordu
 * (gerçek: kota UTC gece yarısına kadar kapalı). Bu test, alanın sessizce
 * silinmesini veya yanlış dala bağlanmasını yakalar.
 *
 * Route dosyaları HTTP metotları dışında export edemediği ve checkRateLimit
 * Upstash'e bağlı olduğu için [1]-[4] bir KAYNAK-YAPI kilididir (aynı desen:
 * test-vision-ctx-sanitize.ts bölüm [5]).
 *
 * B04 (2026-09-23) — DAVRANIŞ testleri eklendi ([5]-[8]). Gerçek
 * verifyAuthAndRateLimit / checkRateLimit, tek bir node:http sahte sunucuya
 * karşı koşar: aynı sunucu hem GoTrue'yu (/auth/v1/user) hem Upstash REST'i
 * (/pipeline, /get/...) taklit eder. HİÇBİR gerçek ağ/AI/DB çağrısı yok.
 *   [5] A021 saf sınıflandırıcı — auth-js'in GERÇEK hata sınıflarıyla.
 *   [6] A021 uçtan uca — Supabase Auth erişilemez/5xx/429 → 503 auth_unavailable
 *       + Retry-After 15; 401/403 bad_jwt → 401 aynen (desktop sözleşme kilidi);
 *       503 yolunda rate-limit adımına HİÇ gidilmez.
 *   [7] A110 — günlük 429: Retry-After = UTC gece yarısına kalan gerçek süre,
 *       detail {kind:"daily", resetsAt:ISO}; kısa-pencere 429 resetsAt taşımaz.
 *   [8] A060 — per-IP reddinde günlük sayaç iade edilir (tek DECR); bypass'ta
 *       iade yok; kullanıcı-dakika reddi günlük sayaca dokunmaz; DECR hatası
 *       isteği bozmaz, throw etmez (prod modunda da).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import http from "node:http";
import type { AddressInfo } from "node:net";

let fail = 0;
function ok(cond: boolean, label: string) {
  console.log(`  ${cond ? "ok " : "FAIL"} ${label}`);
  if (!cond) fail = 1;
}

const src = readFileSync(join(process.cwd(), "lib", "api-auth.ts"), "utf8");

console.log("[1] 429 gövdesi detail.kind taşıyor (desktop sözleşmesi)");
// isDailyQuota ternary'sine bağlı kind üretimi — birebir yapı. B04/A110: kind'den
// sonra EKLEMELİ alan (resetsAt) gelebilir → kapanış `}` ya da `,` kabul edilir;
// ternary'nin kendisi aynen kilitli.
ok(/detail:\s*\{\s*kind:\s*isDailyQuota\s*\?\s*"daily"\s*:\s*"ip"\s*[,}]/.test(src),
  'detail.kind = isDailyQuota ? "daily" : "ip" mevcut');
// Service (503) dalına detail bulaşmıyor — spread isService kapısının arkasında.
ok(/\.\.\.\(isService\s*\?\s*\{\}\s*:\s*\{\s*detail:/.test(src),
  "detail yalnız 429'da (isService dalı hariç)");

console.log("[2] Mevcut gövde alanları DEĞİŞMEDİ (eski desktop'lar kırılmaz)");
ok(src.includes('"Daily quota exceeded"'), 'günlük kota metni aynen: "Daily quota exceeded"');
ok(src.includes('"Too many requests. Please wait a moment."'), "kısa-pencere metni aynen");
ok(/retryAfter:\s*rateResult\.retryAfter/.test(src), "retryAfter alanı duruyor");
ok(/"Retry-After":\s*String\(rateResult\.retryAfter\)/.test(src), "Retry-After başlığı duruyor");

console.log("[3] kind kaynakları: reason eşlemesi bozulmadı");
ok(/reason:\s*"daily"/.test(src), 'günlük aşım reason:"daily" üretiyor');
ok(/reason:\s*"rate"/.test(src) && /reason:\s*"ip"/.test(src),
  'kısa-pencere reason:"rate"/"ip" üretiyor (ikisi de kind:"ip" olur)');

console.log("[4] B04 kaynak kilitleri");
ok(!/retryAfter:\s*3600/.test(src), "günlük 429'da sabit retryAfter: 3600 KALMADI (A110)");
ok(/resetsAt:\s*new Date\(rateResult\.resetAt\)\.toISOString\(\)/.test(src),
  "günlük 429 gövdesi detail.resetsAt üretiyor (A110)");
// feedback route'u 410 Gone ile emekli (ROUTE_RETIRED) → catch dalı çalışma
// zamanında ulaşılamaz; route canlandırılırsa 401'e geri dönmesin diye kaynak kilidi.
const fbSrc = readFileSync(join(process.cwd(), "app", "api", "ai", "feedback", "route.ts"), "utf8");
const fbAuthBlock = fbSrc.slice(fbSrc.indexOf('verifyAuthAndRateLimit(request, "feedback")'));
const fbCatch = fbAuthBlock.slice(0, fbAuthBlock.indexOf("let rawBody"));
ok(/catch\s*\(err\)\s*\{[\s\S]*return authUnavailableResponse\(\);/.test(fbCatch),
  "feedback auth istisnası → authUnavailableResponse() (503), 401 değil (A021)");
ok(!/status:\s*401/.test(fbCatch), "feedback auth catch'inde 401 kalmadı (A021)");

/* ───────────────────────── Davranış testleri ───────────────────────── */

type Json = Record<string, unknown>;
type AuthMode = "ok" | "503" | "500json" | "500html" | "429" | "403badjwt" | "401";

const upstash = new Map<string, number>();
const bypassUsers = new Set<string>();
let authMode: AuthMode = "ok";
let authUserId = "user-ok";
let pipelineCalls = 0;
let decrCalls = 0;
let failDecr = false;

function sendJson(res: http.ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...extra });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => { raw += c; });
  req.on("end", () => {
    const url = req.url || "";
    // ── GoTrue: GET /auth/v1/user ──
    if (url.startsWith("/auth/v1/user")) {
      switch (authMode) {
        case "ok":
          return sendJson(res, 200, {
            id: authUserId, aud: "authenticated", role: "authenticated",
            email: "test@example.invalid", app_metadata: {}, user_metadata: {},
            created_at: "2026-01-01T00:00:00Z",
          });
        case "503": return sendJson(res, 503, { msg: "upstream unavailable" });
        case "500json": return sendJson(res, 500, { msg: "internal error" });
        case "500html":
          res.writeHead(500, { "Content-Type": "text/html" });
          return res.end("<html><body>Bad gateway</body></html>");
        case "429": return sendJson(res, 429, { msg: "rate limit exceeded" });
        case "403badjwt":
          return sendJson(res, 403, { code: "bad_jwt", msg: "invalid JWT" },
            { "x-supabase-api-version": "2024-01-01" });
        case "401": return sendJson(res, 401, { msg: "JWT expired" });
      }
    }
    // ── Upstash REST: POST /pipeline ──
    if (url === "/pipeline") {
      pipelineCalls++;
      const cmds = JSON.parse(raw) as string[][];
      if (cmds.some((c) => c[0] === "DECR")) {
        decrCalls++;
        if (failDecr) return sendJson(res, 500, { error: "boom" });
      }
      const out: Json[] = [];
      for (const c of cmds) {
        if (c[0] === "INCR") { const v = (upstash.get(c[1]) ?? 0) + 1; upstash.set(c[1], v); out.push({ result: v }); }
        else if (c[0] === "DECR") { const v = (upstash.get(c[1]) ?? 0) - 1; upstash.set(c[1], v); out.push({ result: v }); }
        else out.push({ result: 1 }); // EXPIRE
      }
      return sendJson(res, 200, out);
    }
    // ── Upstash REST: GET /get/<key> (bypass okuması) ──
    if (url.startsWith("/get/")) {
      const key = decodeURIComponent(url.slice("/get/".length));
      const uid = key.startsWith("aimlo:rl_bypass:") ? key.slice("aimlo:rl_bypass:".length) : "";
      return sendJson(res, 200, { result: bypassUsers.has(uid) ? 1 : null });
    }
    sendJson(res, 404, { error: "not found" });
  });
});

function utcDayKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function nextUtcMidnight(d = new Date()): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0);
}

async function main() {
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  // Env: api-auth her çağrıda process.env okur (STRICT_RATE_LIMIT hariç — o set edilmiyor).
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";
  process.env.NEXT_PUBLIC_SUPABASE_URL = base;
  process.env.UPSTASH_REDIS_REST_URL = base;
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

  const { NextRequest } = await import("next/server");
  const { verifyAuthAndRateLimit, checkRateLimit, isAuthServiceUnavailable } = await import("../lib/api-auth");
  const sb = await import("@supabase/supabase-js");

  const mkReq = (ip = "198.51.100.1") =>
    new NextRequest("http://localhost/api/ai/vision", {
      headers: { authorization: "Bearer a.b.c", "x-real-ip": ip },
    });

  // auth-js ağ hatasında console.error(e) basıyor; test çıktısını kirletmesin.
  // Kendi "[Aimlo API] Supabase Auth unavailable" logumuzu da buradan doğruluyoruz.
  async function quiet<T>(fn: () => Promise<T>): Promise<{ v: T; logs: string[] }> {
    const logs: string[] = [];
    const origErr = console.error;
    const origWarn = console.warn;
    console.error = (...a: unknown[]) => { logs.push(a.map(String).join(" ")); };
    console.warn = (...a: unknown[]) => { logs.push(a.map(String).join(" ")); };
    try {
      return { v: await fn(), logs };
    } finally {
      console.error = origErr;
      console.warn = origWarn;
    }
  }

  console.log("[5] A021 saf sınıflandırıcı (auth-js GERÇEK hata sınıfları)");
  // Export yoksa (regresyon) tek FAIL bas ve [6]-[8]'e devam et — tüm kırıklar görünsün.
  if (typeof isAuthServiceUnavailable !== "function") {
    ok(false, "isAuthServiceUnavailable lib/api-auth.ts'ten export ediliyor");
  } else {
    ok(isAuthServiceUnavailable(new sb.AuthRetryableFetchError("fetch failed", 0)), "AuthRetryableFetchError(0) → erişilemez");
    ok(isAuthServiceUnavailable(new sb.AuthRetryableFetchError("bad gateway", 503)), "AuthRetryableFetchError(503) → erişilemez");
    ok(isAuthServiceUnavailable(new sb.AuthUnknownError("html body", new Error("x"))), "AuthUnknownError (status yok) → erişilemez");
    ok(isAuthServiceUnavailable(new sb.AuthApiError("internal", 500, undefined)), "AuthApiError 500 → erişilemez");
    ok(isAuthServiceUnavailable(new sb.AuthApiError("rate", 429, undefined)), "AuthApiError 429 → erişilemez");
    ok(!isAuthServiceUnavailable(new sb.AuthApiError("expired", 401, undefined)), "AuthApiError 401 → token hatası (401 kalır)");
    ok(!isAuthServiceUnavailable(new sb.AuthApiError("invalid JWT", 403, "bad_jwt")), "AuthApiError 403 bad_jwt → token hatası");
    ok(!isAuthServiceUnavailable(new sb.AuthSessionMissingError()), "AuthSessionMissingError (400, oturum silinmiş) → token hatası");
    ok(!isAuthServiceUnavailable(null) && !isAuthServiceUnavailable(undefined) && !isAuthServiceUnavailable("x"),
      "null/undefined/string → false (varsayılan 401)");
  }

  console.log("[6] A021 uçtan uca: verifyAuthAndRateLimit");
  {
    // (a) Supabase Auth host'u erişilemez (bağlantı reddi) — plan birebir: 127.0.0.1:9.
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:9";
    const before = pipelineCalls;
    const { v: r, logs } = await quiet(() => verifyAuthAndRateLimit(mkReq(), "vision"));
    process.env.NEXT_PUBLIC_SUPABASE_URL = base;
    const status = r.ok ? 200 : r.response.status;
    const body = r.ok ? {} : ((await r.response.json()) as Json);
    ok(status === 503, `erişilemez host → 503 (gelen ${status})`);
    ok(body.error === "auth_unavailable", `gövde error=auth_unavailable (gelen ${JSON.stringify(body)})`);
    ok(!("message" in body), "503 gövdesinde message YOK (desktop kendi TR/EN metnini basar)");
    ok(!r.ok && r.response.headers.get("Retry-After") === "15", "Retry-After: 15");
    ok(pipelineCalls === before, "503 yolunda rate-limit adımına gidilmedi (Upstash'e 0 çağrı)");
    ok(logs.some((l) => l.includes("[Aimlo API] Supabase Auth unavailable")), "altyapı hatası loglandı");
  }
  const cases: Array<[AuthMode, number, string]> = [
    ["503", 503, "GoTrue 503 (AuthRetryableFetchError)"],
    ["500html", 503, "GoTrue 500 HTML (AuthUnknownError)"],
    ["500json", 503, "GoTrue 500 JSON (AuthApiError 500)"],
    ["429", 503, "GoTrue 429"],
    ["403badjwt", 401, "GoTrue 403 bad_jwt — sözleşme kilidi"],
    ["401", 401, "GoTrue 401 — sözleşme kilidi"],
  ];
  for (const [mode, want, label] of cases) {
    authMode = mode;
    const before = pipelineCalls;
    const { v: r } = await quiet(() => verifyAuthAndRateLimit(mkReq(), "vision"));
    const status = r.ok ? 200 : r.response.status;
    const body = r.ok ? {} : ((await r.response.json()) as Json);
    const wantErr = want === 503 ? "auth_unavailable" : "Invalid or expired token";
    ok(status === want && body.error === wantErr, `${label} → ${want} ${wantErr} (gelen ${status} ${JSON.stringify(body)})`);
    ok(pipelineCalls === before, `${label}: rate-limit adımına gidilmedi`);
  }
  authMode = "ok";

  console.log("[7] A110 günlük 429: gerçek sıfırlama zamanı + detail.resetsAt");
  {
    authUserId = "u-daily";
    const t0 = Date.now();
    upstash.set(`daily:u-daily:vision:${utcDayKey()}`, 100); // kota (100) dolu
    const r = await verifyAuthAndRateLimit(mkReq("198.51.100.2"), "vision");
    const t1 = Date.now();
    const status = r.ok ? 200 : r.response.status;
    const body = r.ok ? {} : ((await r.response.json()) as Json);
    const detail = (body.detail ?? {}) as Json;
    const midnight = nextUtcMidnight(new Date(t0));
    const lo = Math.max(60, Math.ceil((midnight - t1) / 1000) - 2);
    const hi = Math.max(60, Math.ceil((midnight - t0) / 1000) + 1);
    const ra = body.retryAfter as number;
    ok(status === 429 && body.error === "Daily quota exceeded", `429 "Daily quota exceeded" (gelen ${status} ${String(body.error)})`);
    ok(detail.kind === "daily", 'detail.kind === "daily" (P9 sözleşmesi aynen)');
    ok(typeof ra === "number" && ra >= lo && ra <= hi,
      `retryAfter = UTC gece yarısına kalan sn [${lo}..${hi}] (gelen ${String(ra)}; eskiden sabit 3600)`);
    ok(!r.ok && r.response.headers.get("Retry-After") === String(ra), "Retry-After başlığı = gövde retryAfter");
    ok(detail.resetsAt === new Date(midnight).toISOString(),
      `detail.resetsAt = ${new Date(midnight).toISOString()} (gelen ${String(detail.resetsAt)})`);

    // Kısa-pencere 429: kind "ip", resetsAt YOK (yalnız günlükte).
    authUserId = "u-minute";
    upstash.set("rate:u-minute:vision", 6); // 6/dk dolu → 7. istek reddedilir
    const r2 = await verifyAuthAndRateLimit(mkReq("198.51.100.3"), "vision");
    const b2 = r2.ok ? {} : ((await r2.response.json()) as Json);
    const d2 = (b2.detail ?? {}) as Json;
    ok(!r2.ok && r2.response.status === 429 && d2.kind === "ip" && !("resetsAt" in d2) && b2.retryAfter === 60,
      `kısa-pencere 429: kind "ip", resetsAt yok, retryAfter 60 (gelen ${JSON.stringify(b2)})`);
    authUserId = "user-ok";
  }

  console.log("[8] A060 per-IP reddinde günlük sayaç iadesi");
  {
    const ip = "203.0.113.7";
    const day = utcDayKey();
    const dk = (u: string) => upstash.get(`daily:${u}:vision:${day}`) ?? 0;
    let allAllowed = true;
    // 3 kullanıcı × 6 vision = 18 = IP tavanı (6×3) → hepsi geçer.
    for (const u of ["u1", "u2", "u3"]) {
      for (let i = 0; i < 6; i++) {
        const r = await checkRateLimit(u, "vision", ip);
        if (!r.allowed) allAllowed = false;
      }
    }
    ok(allAllowed, "u1-u3 × 6 aynı IP'den → hepsi geçti (IP tavanı 18)");
    const decr0 = decrCalls;
    const { v: r4, logs } = await quiet(() => checkRateLimit("u4", "vision", ip));
    ok(!r4.allowed && r4.reason === "ip", `u4 → reason "ip" (gelen ${JSON.stringify(r4)})`);
    ok(dk("u4") === 0, `u4 günlük sayacı iade edildi → 0 (gelen ${dk("u4")}; eskiden 1)`);
    ok(decrCalls === decr0 + 1, `tek DECR (gelen ${decrCalls - decr0})`);
    ok(logs.some((l) => l.includes("[Aimlo] rate ip-reject route=vision")) && !logs.some((l) => l.includes(ip)),
      "ip-reject ölçüm logu var, IP loglanmadı (PII)");
    ok(dk("u1") === 6, `(b) geçen isteklerde iade yok: u1 günlük = 6 (gelen ${dk("u1")})`);

    // (c) aynı kullanıcı dakika tavanında → reason "rate", günlük sayaç artmaz.
    const r7 = await checkRateLimit("u1", "vision", ip);
    ok(!r7.allowed && r7.reason === "rate" && dk("u1") === 6,
      `(c) u1 7. istek → "rate", günlük 6 kaldı (gelen ${r7.reason}, ${dk("u1")})`);

    // (d) bypass'lı kullanıcı: IP aşımında istek GEÇER → günlük hak yanmış kalır, iade YOK.
    bypassUsers.add("u5");
    const decr1 = decrCalls;
    const r5 = await quiet(() => checkRateLimit("u5", "vision", ip));
    ok(r5.v.allowed && dk("u5") === 1 && decrCalls === decr1,
      `(d) bypass → allowed, günlük 1, DECR yok (gelen ${r5.v.allowed}, ${dk("u5")}, ${decrCalls - decr1})`);

    // (e) DECR endpoint 500 → istek yine 429/ip, THROW YOK — prod modunda da
    //     (iade fail-closed yoluna girmez; en kötü durum = eski davranış).
    const env = process.env as Record<string, string | undefined>;
    const prevEnv = env.NODE_ENV;
    env.NODE_ENV = "production";
    failDecr = true;
    let threw = false;
    let r6: Awaited<ReturnType<typeof checkRateLimit>> | undefined;
    try {
      r6 = (await quiet(() => checkRateLimit("u6", "vision", ip))).v;
    } catch {
      threw = true;
    }
    failDecr = false;
    env.NODE_ENV = prevEnv;
    ok(!threw && !!r6 && !r6.allowed && r6.reason === "ip",
      `(e) DECR 500 (prod) → throw yok, {allowed:false, reason:"ip"} (gelen ${JSON.stringify(r6)})`);
    ok(dk("u6") === 1, `(e) iade başarısız → sayaç yanık kalır (eski davranış), 1 (gelen ${dk("u6")})`);
  }

  server.close();
  if (fail) {
    console.error("\nTEST BAŞARISIZ — P9/B04 sözleşmesi bozulmuş olabilir (lib/api-auth.ts).");
    process.exit(1);
  }
  console.log("\nTÜM TESTLER GEÇTİ ✓");
  process.exit(0);
}

main().catch((e) => {
  console.error("\nTEST ÇALIŞTIRILAMADI:", e instanceof Error ? e.stack : e);
  process.exit(1);
});
