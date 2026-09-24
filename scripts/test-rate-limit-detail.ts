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
 *
 * FB04 (2026-09-24):
 *   [6b] F88 — Auth erişilemezken eski masaüstü (UA TAM "aimlo-desktop/1.0" ya da UA'sız
 *        v1.0.19 rapor/telemetri istemcisi) B04 öncesi 401'i alır; sürümlü UA ve web 503.
 *   [10] F47 — (f) NODE_ENV=production + UPSTASH_* YOK → görünür console.error (soğuk
 *        başlangıç başına bir kez), davranış bellek yedeği (fail-OPEN) olarak KİLİTLİ;
 *        (g) STRICT_RATE_LIMIT=true + env yok → reason "service" / consumeDailyQuota 503
 *        (eskiden bellek yedeği); lib/auth-rate-limit checkOne aynı iki kural.
 *        F71 — 503 gövdesi {error:"rate_limiter_unavailable", retryAfter:30}, message YOK.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import http from "node:http";
import type { AddressInfo } from "node:net";
import Module from "node:module";

// FB04 · F47 [10]: lib/auth-rate-limit "server-only" + "next/headers" import ediyor —
// "server-only" boş modüle ("path"), next/headers aşağıda Module._cache ile sahtelenir
// (aynı kalıp: scripts/test-entitlements.ts, scripts/vision-route-harness.ts).
type ResolveFn = (...a: unknown[]) => unknown;
const MI = Module as unknown as { _resolveFilename: ResolveFn; _cache: Record<string, unknown> };
const origResolve = MI._resolveFilename;
MI._resolveFilename = function (this: unknown, ...args: unknown[]) {
  if (args[0] === "server-only") return origResolve.call(this, "path", ...args.slice(1));
  return origResolve.apply(this, args);
};

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

  // FB04 · F88: varsayılan UA = güncel masaüstünün sürümlü UA'sı (v1.0.20+). null → UA'sız.
  const DESKTOP_UA = "aimlo-desktop/1.0.20 (windows)";
  const mkReq = (ip = "198.51.100.1", ua: string | null = DESKTOP_UA) =>
    new NextRequest("http://localhost/api/ai/vision", {
      headers: { authorization: "Bearer a.b.c", "x-real-ip": ip, ...(ua === null ? {} : { "user-agent": ua }) },
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

  console.log("[6b] FB04 · F88 — Auth erişilemezken eski masaüstü B04 öncesi 401'i alır");
  {
    // KANIT: v1.0.19 (aimlo-desktop 61ee71f) vision istemcisi UA "aimlo-desktop/1.0"
    // (ai_client.rs:796); rapor (A2 kuyruğu, :1161) ve telemetri (telemetry.rs:309) istemcisi
    // UA'SIZ (reqwest 0.12 varsayılanı yalnız accept). 503 auth_unavailable'ı tanımaz → kuyruk
    // satırı ~3 saatte failed_permanent olur ve diriltilmez. v1.0.20+ sürümlü UA → 503 tanır.
    const uaCases: Array<[string | null, number, string]> = [
      ["aimlo-desktop/1.0", 401, "UA TAM 'aimlo-desktop/1.0' (v1.0.19 vision istemcisi) → 401"],
      [null, 401, "UA'sız (v1.0.19 rapor/telemetri istemcisi) → 401"],
      ["", 401, "boş UA → 401 (UA'sız ile aynı)"],
      ["aimlo-desktop/1.0.20 (windows)", 503, "sürümlü UA 'aimlo-desktop/1.0.20 (windows)' → 503 (önek DEĞİL eşitlik)"],
      ["aimlo-desktop/1.0.19", 503, "'aimlo-desktop/1.0.19' → 503 (yalnız TAM eşitlik eski sayılır)"],
      ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36", 503, "tarayıcı (web) → 503"],
    ];
    for (const mode of ["503", "500html"] as AuthMode[]) {
      authMode = mode;
      for (const [ua, want, label] of uaCases) {
        const before = pipelineCalls;
        const { v: r } = await quiet(() => verifyAuthAndRateLimit(mkReq("198.51.100.9", ua), "vision"));
        const status = r.ok ? 200 : r.response.status;
        const body = r.ok ? {} : ((await r.response.json()) as Json);
        const wantErr = want === 503 ? "auth_unavailable" : "Invalid or expired token";
        const ra = r.ok ? null : r.response.headers.get("Retry-After");
        ok(status === want && body.error === wantErr && (want === 503 ? ra === "15" : ra === null) && pipelineCalls === before,
          `[${mode}] ${label} (gelen ${status} ${JSON.stringify(body)} RA=${ra})`);
      }
    }
    // Token GERÇEKTEN geçersizken (401 modu) UA ne olursa olsun 401 — sözleşme aynen.
    authMode = "401";
    for (const ua of ["aimlo-desktop/1.0.20 (windows)", "aimlo-desktop/1.0", null]) {
      const { v: r } = await quiet(() => verifyAuthAndRateLimit(mkReq("198.51.100.9", ua), "vision"));
      ok(!r.ok && r.response.status === 401, `token geçersiz + UA ${JSON.stringify(ua)} → 401 (değişmedi)`);
    }
    authMode = "ok";
  }

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

  console.log("[9] A058-B (W2 followup #62/#68): günlük kota gövde doğrulamasından SONRA harcanır");
  {
    const { consumeDailyQuota } = await import("../lib/api-auth");
    const day = utcDayKey();
    const dk = (u: string) => upstash.get(`daily:${u}:report:${day}`) ?? 0;
    if (typeof consumeDailyQuota !== "function") {
      ok(false, "consumeDailyQuota lib/api-auth.ts'ten export ediliyor");
    } else {
      // (a) deferDaily: JWT + dakika kapısı çalışır, günlük sayaç ARTMAZ.
      authUserId = "u-rep";
      const mkRep = (ip: string) => new NextRequest("http://localhost/api/ai/report", { headers: { authorization: "Bearer a.b.c", "x-real-ip": ip } });
      const r1 = await verifyAuthAndRateLimit(mkRep("198.51.100.20"), "report", { deferDaily: true });
      ok(r1.ok && dk("u-rep") === 0 && (upstash.get("rate:u-rep:report") ?? 0) === 1,
        `(a) deferDaily → ok, günlük 0, dakika 1 (gelen ok=${r1.ok}, günlük ${dk("u-rep")}, dakika ${upstash.get("rate:u-rep:report")})`);
      // (b) varsayılan çağrı (deferDaily yok) eski davranış: günlük sayaç artar.
      authUserId = "u-rep2";
      const r2 = await verifyAuthAndRateLimit(mkRep("198.51.100.21"), "report");
      ok(r2.ok && dk("u-rep2") === 1, `(b) varsayılan çağrı günlük sayacı artırır (eski davranış) — gelen ${dk("u-rep2")}`);
      // (c) consumeDailyQuota: 10/gün (report) — 10 izin, 11. aynı 429 gövdesi.
      const results: (Response | null)[] = [];
      for (let i = 0; i < 11; i++) results.push(await consumeDailyQuota("u-rep", "report"));
      const last = results[10];
      const body = last ? ((await last.json()) as Json) : {};
      const detail = (body.detail ?? {}) as Json;
      ok(results.slice(0, 10).every((x) => x === null) && dk("u-rep") === 11,
        `(c) ilk 10 çağrı izinli (null), sayaç 11 (gelen ${dk("u-rep")})`);
      ok(!!last && last.status === 429 && body.error === "Daily quota exceeded" && detail.kind === "daily"
        && typeof detail.resetsAt === "string" && typeof body.retryAfter === "number"
        && last.headers.get("Retry-After") === String(body.retryAfter),
        `(c) 11. → verifyAuthAndRateLimit'in günlük 429 gövdesinin AYNISI (gelen ${last?.status} ${JSON.stringify(body)})`);
      // (d) bypass'lı kullanıcı kota aşımında da geçer (checkRateLimit ile aynı).
      bypassUsers.add("u-rep-bypass");
      upstash.set(`daily:u-rep-bypass:report:${day}`, 10);
      ok((await consumeDailyQuota("u-rep-bypass", "report")) === null, "(d) bypass → null (izinli)");
      // (e) prod + Upstash erişilemez → fail-closed 503 (servis gövdesi, detail YOK).
      const env = process.env as Record<string, string | undefined>;
      const prevEnv = env.NODE_ENV, prevUrl = env.UPSTASH_REDIS_REST_URL;
      env.NODE_ENV = "production"; env.UPSTASH_REDIS_REST_URL = "http://127.0.0.1:9";
      let r5: Response | null = null;
      try { r5 = (await quiet(() => consumeDailyQuota("u-rep", "report"))).v; }
      finally { env.NODE_ENV = prevEnv; env.UPSTASH_REDIS_REST_URL = prevUrl; }
      const b5 = r5 ? ((await r5.json()) as Json) : {};
      // FB04 · F71: makine kodu, message YOK, detail YOK; 503 + Retry-After 30 aynı.
      ok(!!r5 && r5.status === 503 && JSON.stringify(b5) === JSON.stringify({ error: "rate_limiter_unavailable", retryAfter: 30 })
        && r5.headers.get("Retry-After") === "30",
        `(e) prod + Upstash erişilemez → 503 {error:"rate_limiter_unavailable", retryAfter:30} (gelen ${r5?.status} ${JSON.stringify(b5)})`);
      authUserId = "user-ok";
    }
  }

  console.log("[10] FB04 · F47 — UPSTASH_* env'i HİÇ YOK: prod'da görünür uyarı (fail-OPEN kilitli), STRICT'te fail-closed");
  {
    const { consumeDailyQuota, RATE_LIMIT_MEMORY_FALLBACK_WARNING } = await import("../lib/api-auth");
    const WARN = "[RATE-LIMIT] UPSTASH_* yok — bellek yedeği: lambda başına sayaç, günlük kota küresel DEĞİL (fail-OPEN)";
    ok(RATE_LIMIT_MEMORY_FALLBACK_WARNING === WARN, "uyarı metni sabiti birebir (Vercel log araması bununla yapılır)");
    // lib/auth-rate-limit: next/headers sahte (istek bağlamı yok) — resolveIp x-real-ip okur.
    const nhPath = require.resolve("next/headers");
    MI._cache[nhPath] = { id: nhPath, filename: nhPath, loaded: true, children: [], paths: [],
      exports: { headers: async () => new Headers({ "x-real-ip": "203.0.113.47" }) } };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { authRateLimit } = require("../lib/auth-rate-limit") as typeof import("../lib/auth-rate-limit");

    const env = process.env as Record<string, string | undefined>;
    const saved = { NODE_ENV: env.NODE_ENV, URL: env.UPSTASH_REDIS_REST_URL, TOK: env.UPSTASH_REDIS_REST_TOKEN, STRICT: env.STRICT_RATE_LIMIT };
    const restore = () => {
      env.NODE_ENV = saved.NODE_ENV; env.UPSTASH_REDIS_REST_URL = saved.URL; env.UPSTASH_REDIS_REST_TOKEN = saved.TOK;
      if (saved.STRICT === undefined) delete env.STRICT_RATE_LIMIT; else env.STRICT_RATE_LIMIT = saved.STRICT;
    };
    try {
      // (f) prod + env HİÇ yok, STRICT yok → bellek yedeği + TEK görünür uyarı.
      env.NODE_ENV = "production";
      delete env.UPSTASH_REDIS_REST_URL; delete env.UPSTASH_REDIS_REST_TOKEN; delete env.STRICT_RATE_LIMIT;
      const upBefore = pipelineCalls;
      const { v: fr, logs: fl } = await quiet(async () => {
        const out: Awaited<ReturnType<typeof checkRateLimit>>[] = [];
        for (let i = 0; i < 7; i++) out.push(await checkRateLimit("u-f47", "vision", "198.51.100.47"));
        const daily = await consumeDailyQuota("u-f47", "report");
        return { out, daily };
      });
      const warns = fl.filter((l) => l.includes(WARN)).length;
      ok(warns === 1, `(f) prod + UPSTASH_* yok → console.error '${WARN.slice(0, 32)}…' TAM 1 kez (7 checkRateLimit + 1 consumeDailyQuota; gelen ${warns})`);
      ok(fr.out.slice(0, 6).every((x) => x.allowed) && !fr.out[6].allowed && fr.out[6].reason === "rate",
        `(f) davranış bellek yedeği (fail-OPEN, KİLİTLİ): 1-6 izinli, 7. reason "rate" — "service" DEĞİL (gelen ${JSON.stringify(fr.out.map((x) => x.reason ?? "ok"))})`);
      ok(fr.daily === null, "(f) consumeDailyQuota bellek yedeğinde izinli (null) — 503 ÜRETMEZ");
      ok(pipelineCalls === upBefore, "(f) Upstash'e 0 çağrı (env yok)");
      const { v: fa, logs: fal } = await quiet(async () => [
        await authRateLimit("login", "f47@example.invalid"),
        await authRateLimit("login", "f47@example.invalid"),
      ]);
      ok(fa.every((x) => x.blocked === false) && fal.filter((l) => l.includes(WARN)).length === 1,
        `(f) authRateLimit: bellek yedeği (engel yok) + aynı uyarı TAM 1 kez (gelen ${JSON.stringify(fa)}, uyarı ${fal.filter((l) => l.includes(WARN)).length})`);

      // (g) STRICT_RATE_LIMIT=true + env yok → fail-closed (eskiden bayrak bu dalda ETKİSİZDİ).
      env.NODE_ENV = saved.NODE_ENV;
      env.STRICT_RATE_LIMIT = "true";
      const { v: gr } = await quiet(() => checkRateLimit("u-g47", "vision", "198.51.100.48"));
      ok(!gr.allowed && gr.reason === "service" && gr.retryAfter === 30,
        `(g) STRICT + env yok → checkRateLimit reason "service", retryAfter 30 (gelen ${JSON.stringify(gr)})`);
      const { v: gd } = await quiet(() => consumeDailyQuota("u-g47", "report"));
      const gdb = gd ? ((await gd.json()) as Json) : {};
      ok(!!gd && gd.status === 503 && JSON.stringify(gdb) === JSON.stringify({ error: "rate_limiter_unavailable", retryAfter: 30 })
        && gd.headers.get("Retry-After") === "30",
        `(g) STRICT + env yok → consumeDailyQuota 503 {error:"rate_limiter_unavailable", retryAfter:30}, message/detail YOK (gelen ${gd?.status} ${JSON.stringify(gdb)})`);
      authUserId = "u-g47v";
      const { v: gv } = await quiet(() => verifyAuthAndRateLimit(mkReq("198.51.100.49"), "vision"));
      const gvb = gv.ok ? {} : ((await gv.response.json()) as Json);
      ok(!gv.ok && gv.response.status === 503 && gvb.error === "rate_limiter_unavailable" && !("message" in gvb) && !("detail" in gvb),
        `(g) STRICT + env yok → verifyAuthAndRateLimit 503 rate_limiter_unavailable (gelen ${gv.ok ? 200 : gv.response.status} ${JSON.stringify(gvb)})`);
      authUserId = "user-ok";
      const { v: ga } = await quiet(() => authRateLimit("login", "g47@example.invalid"));
      ok(ga.blocked === true && ga.retryAfterSec === 30 && ga.error.startsWith("Servis geçici olarak yoğun"),
        `(g) STRICT + env yok → authRateLimit engelli "servis" (30 sn) (gelen ${JSON.stringify(ga)})`);
    } finally {
      restore();
    }
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
