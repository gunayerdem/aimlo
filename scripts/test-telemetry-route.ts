/**
 * TELEMETRİ GÖRÜNÜRLÜK TESTİ — B08 (2026-09-24 · A006/A064)
 * ─────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-telemetry-route.ts   (exit 1 = kırık)
 *
 * NEDEN VAR: /api/telemetry kısmi başarıda 200 dönüyor ve yalnız red SAYISINI
 * logluyordu; desktop da yalnız HTTP statüsüne baktığı için app_open/login_ok/
 * watch_started 31.07 → 16.09 arası `invalid_type` ile iki tarafta da görünmeden
 * düştü. telemetry_events'i okuyan tek bir ekran da yoktu. Bu test iki fix'i
 * kilitler:
 *   [A] route: GERÇEK POST handler — red sebebi+tipi `[TELEMETRY_REJECTED]`
 *       satırında, `telemetry_rejected` özet satırları DB'ye (TÜMÜ reddedilen
 *       batch dahil), yanıt şekli DEĞİŞMEDEN.
 *   [B] lib/admin-telemetry: saf toplayıcılar (percentile_cont, sum(count),
 *       ayrık kullanıcı) + getTelemetrySummary'nin sayfalama / "bilinmiyor"
 *       (sahte 0 yok) davranışı.
 *   [C] /admin/altyapi Telemetri kartı render'ı: ölçülemeyen "bilinmiyor",
 *       tavana dayanan "≥", ölçülmüş boş bölüm açık boş-durum metni.
 *
 * YAKLAŞIM: scripts/vision-route-harness.ts ile aynı kalıp — "server-only" boş
 * modül, "@/..." → repo kökü, bağımlılıklar Module._cache'e sahte `exports`
 * olarak konur (route CJS require ile yükler):
 *   lib/api-auth        → verifyAuthAndRateLimit her zaman { ok, userId }
 *   lib/supabase/server → createServiceSupabase = sahte istemci (insert yakalar,
 *                         select zincirini kaydeder ve testin verisini döndürür)
 * ⚠ AĞ/DB YOK. .env.local OKUNMAZ.
 */
import Module from "node:module";
import * as path from "node:path";
import { createHash } from "node:crypto";

const REPO_ROOT = path.join(__dirname, "..");
type ResolveFn = (...a: unknown[]) => unknown;
type ModuleInternals = { _resolveFilename: ResolveFn; _cache: Record<string, { exports: unknown }> };
const M = Module as unknown as ModuleInternals;

const origResolve = M._resolveFilename;
M._resolveFilename = function (this: unknown, ...args: unknown[]) {
  const req = args[0];
  // "path" — "node:path" DEĞİL (Node 22 CI ENOENT; bkz. test-entitlements.ts).
  if (req === "server-only") return origResolve.call(this, "path", ...args.slice(1));
  if (typeof req === "string" && req.startsWith("@/")) {
    return origResolve.call(this, path.join(REPO_ROOT, req.slice(2)), ...args.slice(1));
  }
  return origResolve.apply(this, args);
};

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://telemetry-test.invalid";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "telemetry-test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "telemetry-test-service-key";
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

let fail = 0;
let pass = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  if (kosul) { pass++; console.log(`  ✅ ${ad}`); }
  else { fail++; console.log(`  ❌ ${ad} ${detay}`); }
};
const eq = (ad: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  t(ad, g === w, `\n       got=${g}\n      want=${w}`);
};

// ── Sahte Supabase ─────────────────────────────────────────────────────────
type Row = Record<string, unknown>;
type QueryRecord = {
  table: string;
  columns: string;
  filters: [string, string, unknown][];
  order: [string, boolean | undefined][];
  range: [number, number] | null;
};
type QueryResult = { data: Row[] | null; error: { message: string } | null };
const fake: {
  inserts: { table: string; rows: Row[] }[];
  /** insert hatası üreteci (null = başarılı). */
  insertError: (rows: Row[]) => string | null;
  queries: QueryRecord[];
  /** select zinciri sonucu. */
  onQuery: (q: QueryRecord) => QueryResult;
} = {
  inserts: [],
  insertError: () => null,
  queries: [],
  onQuery: () => ({ data: [], error: null }),
};

function fakeClient() {
  return {
    from(table: string) {
      const q: QueryRecord = { table, columns: "", filters: [], order: [], range: null };
      const builder: Record<string, unknown> = {};
      Object.assign(builder, {
        insert(rows: Row[]) {
          fake.inserts.push({ table, rows });
          const msg = fake.insertError(rows);
          return Promise.resolve({ error: msg ? { message: msg } : null });
        },
        select(c: string) { q.columns = c; return builder; },
        in(col: string, vals: unknown) { q.filters.push(["in", col, vals]); return builder; },
        eq(col: string, v: unknown) { q.filters.push(["eq", col, v]); return builder; },
        gte(col: string, v: unknown) { q.filters.push(["gte", col, v]); return builder; },
        order(col: string, o?: { ascending?: boolean }) { q.order.push([col, o?.ascending]); return builder; },
        range(a: number, b: number) { q.range = [a, b]; return builder; },
        abortSignal() { return builder; },
        then(res: (v: unknown) => unknown, rej: (e: unknown) => unknown) {
          fake.queries.push(q);
          return Promise.resolve().then(() => fake.onQuery(q)).then(res, rej);
        },
      });
      return builder;
    },
  };
}

const resolveRepo = (rel: string) => require.resolve(path.join(REPO_ROOT, rel));
const fakeModule = (rel: string, exports: Record<string, unknown>) => {
  const fn = resolveRepo(rel);
  M._cache[fn] = { id: fn, filename: fn, loaded: true, exports, children: [], paths: [] } as unknown as { exports: unknown };
};
const USER_ID = "00000000-0000-4000-8000-000000000b08";
const USER_HASH = createHash("sha256").update(USER_ID).digest("hex").slice(0, 16);
fakeModule("lib/api-auth", {
  verifyAuthAndRateLimit: async () => ({ ok: true, userId: USER_ID }),
});
fakeModule("lib/supabase/server", {
  createServiceSupabase: () => fakeClient(),
  createServerSupabase: () => fakeClient(),
});

type RouteMod = { POST: (req: Request) => Promise<Response> };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const route = require(resolveRepo("app/api/telemetry/route")) as RouteMod;

function telemetryRequest(body: unknown): Request {
  return new Request("https://aimlo.gg/api/telemetry", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer test.token" },
    body: JSON.stringify(body),
  });
}

async function callRoute(body: unknown): Promise<{ status: number; json: Row; logs: string[]; warns: string[] }> {
  fake.inserts = [];
  const logs: string[] = [];
  const warns: string[] = [];
  const orig = { log: console.log, warn: console.warn, error: console.error };
  const fmt = (a: unknown[]) => a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");
  console.log = (...a: unknown[]) => { logs.push(fmt(a)); };
  console.error = (...a: unknown[]) => { logs.push(fmt(a)); };
  console.warn = (...a: unknown[]) => { warns.push(fmt(a)); };
  let res: Response;
  try {
    res = await route.POST(telemetryRequest(body));
    // after() istek bağlamı dışında fırlatır → route mikrotask yoluna düşer;
    // insert'lerin tamamlanması için olay döngüsüne bir tur ver.
    await new Promise((r) => setTimeout(r, 20));
  } finally {
    console.log = orig.log; console.warn = orig.warn; console.error = orig.error;
  }
  return { status: res.status, json: (await res.json()) as Row, logs, warns };
}

function rejectedLine(warns: string[]): Row | null {
  const line = warns.find((w) => w.startsWith("[TELEMETRY_REJECTED] "));
  return line ? (JSON.parse(line.slice("[TELEMETRY_REJECTED] ".length)) as Row) : null;
}

async function main() {
  const now = Date.now();
  const tt = await import("../lib/telemetry-types");
  const REJ = (tt as { TELEMETRY_REJECTED_TYPE?: string }).TELEMETRY_REJECTED_TYPE ?? "telemetry_rejected";

  console.log("\n══════ TELEMETRİ GÖRÜNÜRLÜK TESTİ (ağ/DB YOK) ══════");

  // ── [A1] karışık batch ────────────────────────────────────────────────────
  console.log("\n[A1] karışık batch — 1 kabul, 4 red (sebep + tip görünür, yanıt şekli aynı)");
  {
    const r = await callRoute({
      appVersion: "1.0.19",
      events: [
        { type: "bogus", ts: now },
        { type: "app_open", ts: now, count: 1 },
        { type: 42, ts: now },
        "x",
        { type: "watch_health", ts: now },
      ],
    });
    eq("200 + yanıt şekli değişmedi (ok/accepted/rejected[idx,reason])", [r.status, r.json], [
      200,
      {
        ok: true,
        accepted: 1,
        rejected: [
          { idx: 0, reason: "invalid_type" },
          { idx: 2, reason: "invalid_type" },
          { idx: 3, reason: "not_an_object" },
          { idx: 4, reason: "value_required" },
        ],
      },
    ]);
    const line = rejectedLine(r.warns);
    eq("[TELEMETRY_REJECTED] satırı: sebep ve tip sayımı", line, {
      userIdHash: USER_HASH,
      reasons: { invalid_type: 2, not_an_object: 1, value_required: 1 },
      types: { bogus: 1, "?": 2, watch_health: 1 },
    });
    const main = r.logs.find((l) => l.startsWith("[TELEMETRY] "));
    t("[TELEMETRY] ana satırı korunuyor (rejected sayısı dahil)", !!main && main.includes('"rejected":4') && main.includes('"count":1'), `got=${main}`);
    const acc = fake.inserts.find((i) => i.rows.some((row) => row.type === "app_open"));
    t("kabul edilen olay yazıldı (app_open, sürüm 1.0.19)", !!acc && acc.rows.length === 1 && acc.rows[0].app_version === "1.0.19");
    const rej = fake.inserts.find((i) => i.rows.every((row) => row.type === REJ));
    eq(
      "telemetry_rejected özet satırları (sebep:tip → adet)",
      rej?.rows.map((row) => [row.code, row.count]).sort(),
      [["invalid_type:?", 1], ["invalid_type:bogus", 1], ["not_an_object:?", 1], ["value_required:watch_health", 1]],
    );
    const row0 = rej?.rows[0] ?? {};
    eq("özet satırı alanları: user_hash + sürüm + ham kimlik YOK", {
      user_hash: row0.user_hash, type: row0.type, app_version: row0.app_version,
      value: row0.value, route: row0.route, round: row0.round, tsOk: typeof row0.event_ts === "string",
    }, { user_hash: USER_HASH, type: REJ, app_version: "1.0.19", value: null, route: null, round: null, tsOk: true });
    t("hiçbir yazılan satırda ham user_id yok", !JSON.stringify(fake.inserts).includes(USER_ID));
  }

  // ── [A2] TÜMÜ reddedilen batch (31.07 senaryosu) ────────────────────────────
  console.log("\n[A2] TÜMÜ reddedilen batch — eskiden hiç iz bırakmıyordu");
  {
    const r = await callRoute({ events: [{ type: "app_oppen", ts: now, count: 1 }, { type: "app_oppen", ts: now, count: 1 }] });
    eq("yanıt: accepted 0 + iki red", r.json, { ok: true, accepted: 0, rejected: [{ idx: 0, reason: "invalid_type" }, { idx: 1, reason: "invalid_type" }] });
    eq("yalnız TEK insert: red özeti (kabul edilen yok)", fake.inserts.map((i) => i.rows.map((row) => [row.type, row.code, row.count])), [
      [[REJ, "invalid_type:app_oppen", 2]],
    ]);
    t("[TELEMETRY_REJECTED] satırı basıldı", rejectedLine(r.warns) !== null);
  }

  // ── [A3] temiz batch — gürültü yok ─────────────────────────────────────────
  console.log("\n[A3] temiz batch — red satırı / red insert'i YOK");
  {
    const r = await callRoute({ events: [{ type: "match_completed", ts: now }, { type: "login_ok", ts: now, count: 1 }] });
    eq("yanıt: rejected alanı yok", r.json, { ok: true, accepted: 2 });
    t("[TELEMETRY_REJECTED] satırı yok", rejectedLine(r.warns) === null);
    t("yalnız kabul insert'i", fake.inserts.length === 1 && fake.inserts[0].rows.length === 2);
  }

  // ── [A4] satır şişmesi tavanı ──────────────────────────────────────────────
  console.log("\n[A4] 30 farklı sahte tip — özet satır sayısı sınırlı, adet kaybolmaz");
  {
    const events = Array.from({ length: 30 }, (_, i) => ({ type: `fake_kind_${String(i).padStart(2, "0")}`, ts: now }));
    await callRoute({ events });
    const rows = fake.inserts.flatMap((i) => i.rows);
    const max = (tt as { TELEMETRY_REJECT_MAX_ROWS?: number }).TELEMETRY_REJECT_MAX_ROWS ?? 10;
    t(`özet satırı ≤ ${max + 1}`, rows.length > 0 && rows.length <= max + 1, `got=${rows.length}`);
    t("adet toplamı = 30", rows.reduce((n, row) => n + Number(row.count), 0) === 30);
    t("taşma satırı _overflow:* olarak yazıldı", rows.some((row) => row.code === "_overflow:*"));
  }

  // ── [A5] sahteleme + güvenli etiket ────────────────────────────────────────
  console.log("\n[A5] istemci telemetry_rejected gönderemez; tip metni log/DB'ye ham girmez");
  {
    const r = await callRoute({
      events: [
        { type: "telemetry_rejected", ts: now, count: 999, code: "invalid_type:app_open" },
        { type: "x y\n<script>ali@example.com", ts: now },
        { type: "k".repeat(200), ts: now },
      ],
    });
    eq("üçü de invalid_type", (r.json.rejected as Row[]).map((x) => x.reason), ["invalid_type", "invalid_type", "invalid_type"]);
    const rows = fake.inserts.flatMap((i) => i.rows);
    t("sahte 'telemetry_rejected' kabul edilmedi (count 999 yazılmadı)", !rows.some((row) => row.count === 999));
    t("sahte olay kendi reddiyle kayıtlı: invalid_type:telemetry_rejected", rows.some((row) => row.code === "invalid_type:telemetry_rejected"));
    t("tüm code'lar [A-Za-z0-9_.:*?-] ve ≤64", rows.every((row) => typeof row.code === "string" && /^[A-Za-z0-9_.:*?-]{1,64}$/.test(row.code)),
      `got=${JSON.stringify(rows.map((row) => row.code))}`);
    const line = JSON.stringify(rejectedLine(r.warns));
    t("log satırında ham '<script>' / '@' / satır sonu yok", !line.includes("<script>") && !line.includes("@") && !line.includes("\\n"), `got=${line}`);
  }

  // ── [A6] red insert'i düşerse kabul edilen veri etkilenmez ──────────────────
  console.log("\n[A6] ayrı insert + ayrı hata yakalama");
  {
    fake.insertError = (rows) => (rows.some((row) => row.type === REJ) ? "boom" : null);
    const r = await callRoute({ events: [{ type: "app_open", ts: now, count: 1 }, { type: "bogus", ts: now }] });
    fake.insertError = () => null;
    t("yanıt yine 200", r.status === 200);
    t("kabul insert'i yapıldı", fake.inserts.some((i) => i.rows.some((row) => row.type === "app_open")));
    t("red insert hatası loglandı (yutuldu, patlamadı)", r.logs.some((l) => l.includes("rejected-summary insert failed")));
  }

  // ── [B] admin-telemetry ─────────────────────────────────────────────────────
  console.log("\n[B1] saf toplayıcılar — 0015 örnek SQL'i ile aynı anlam");
  const at = await import("../lib/admin-telemetry");
  {
    // percentile_cont elle: [100,200,300,400] → p50 konum 1.5 = 250; p95 konum 2.85 = 385.
    eq("percentileCont p50/p95 (doğrusal enterpolasyon)", [at.percentileCont([100, 200, 300, 400], 0.5), at.percentileCont([100, 200, 300, 400], 0.95)], [250, 385]);
    eq("percentileCont tek eleman / boş", [at.percentileCont([7], 0.95), at.percentileCont([], 0.5)], [7, null]);
    const lat = at.aggregateLatency([
      { route: "vision", value: 400 }, { route: "vision", value: 100 }, { route: "vision", value: 300 }, { route: "vision", value: "200" },
      { route: "report", value: 5000 }, { route: null, value: 10 }, { route: "vision", value: null },
    ]);
    eq("aggregateLatency: route bazlı n/p50/p95, string sayı okunur, null değer atlanır", lat, [
      { route: "vision", n: 4, p50: 250, p95: 385 },
      { route: "(yok)", n: 1, p50: 10, p95: 10 },
      { route: "report", n: 1, p50: 5000, p95: 5000 },
    ]);
    const shortSince = now - 24 * 3600e3;
    const iso = (hAgo: number) => new Date(now - hAgo * 3600e3).toISOString();
    const errs = at.aggregateErrorCodes([
      { code: "ai_timeout", count: 2, app_version: null, created_at: iso(1) },
      { code: "ai_timeout", count: 3, app_version: null, created_at: iso(48) },
      { code: "ai_timeout", count: 1, app_version: "1.0.20", created_at: iso(2) },
      { code: "auth_expired", count: null, app_version: null, created_at: iso(3) },
    ], shortSince);
    eq("aggregateErrorCodes: kod × sürüm, sum(count) (NULL=0), 24s/7g ayrımı", errs, [
      { code: "ai_timeout", appVersion: null, hitsShort: 2, hitsLong: 5 },
      { code: "ai_timeout", appVersion: "1.0.20", hitsShort: 1, hitsLong: 1 },
      { code: "auth_expired", appVersion: null, hitsShort: 0, hitsLong: 0 },
    ]);
    eq("countFunnel: ayrık kullanıcı (aynı kişi 3 kez açtı = 1)", at.countFunnel([
      { type: "app_open", user_hash: "a" }, { type: "app_open", user_hash: "a" }, { type: "app_open", user_hash: "a" },
      { type: "app_open", user_hash: "b" }, { type: "login_ok", user_hash: "a" }, { type: "watch_started", user_hash: null },
    ]), { appOpen: 2, loginOk: 1, watchStarted: 0 });
    eq("aggregateRejections: ilk ':' ayırıcı, adet toplamı", at.aggregateRejections([
      { code: "invalid_type:app_open", count: 2 }, { code: "invalid_type:app_open", count: 1 },
      { code: "value_required:watch_health", count: 1 }, { code: "legacy", count: 4 }, { code: "code_invalid:a:b", count: 1 },
    ]), [
      { reason: "legacy", type: "?", hits: 4 },
      { reason: "invalid_type", type: "app_open", hits: 3 },
      { reason: "code_invalid", type: "a:b", hits: 1 },
      { reason: "value_required", type: "watch_health", hits: 1 },
    ]);
  }

  console.log("\n[B2] getTelemetrySummary — sorgular, sayfalama, 'bilinmiyor' (sahte 0 yok)");
  {
    const typesOf = (q: QueryRecord) => (q.filters.find((f) => f[0] === "in" && f[1] === "type")?.[2] ?? []) as string[];
    const sinceOf = (q: QueryRecord) => q.filters.find((f) => f[0] === "gte" && f[1] === "created_at")?.[2] as string;
    const PAGE = at.TELEMETRY_PAGE_SIZE;
    fake.queries = [];
    fake.onQuery = (q) => {
      const types = typesOf(q);
      if (types.includes("ai_call_duration_ms")) return { data: null, error: { message: "timeout" } };
      if (types.includes("watch_health")) {
        // 2 tam sayfa + 1 yarım: sayfalama sonuna kadar okumalı.
        const [a] = q.range ?? [0, 0];
        const n = a < 2 * PAGE ? PAGE : 500;
        return { data: Array.from({ length: n }, (_, i) => ({ user_hash: `u${(a + i) % 1234}` })), error: null };
      }
      if (types.includes("error_code_count")) {
        // Her sayfa tam dolu → tavana dayanır → truncated.
        return { data: Array.from({ length: PAGE }, () => ({ code: "ai_timeout", count: 1, app_version: null, created_at: new Date(now).toISOString() })), error: null };
      }
      if (types.includes("app_open")) {
        return { data: [{ type: "app_open", user_hash: "a" }, { type: "login_ok", user_hash: "a" }], error: null };
      }
      return { data: [], error: null }; // telemetry_rejected: gerçekten boş
    };
    const s = await at.getTelemetrySummary(now);
    t("sorgu hatası → latency null ('bilinmiyor'), 0 DEĞİL", s.latency === null);
    eq("izleme nabzı: 3 sayfa okundu, ayrık kullanıcı 1234, tavan yok", s.watching, { data: 1234, truncated: false });
    t("hata kodları: tavana dayanınca truncated=true", s.errors?.truncated === true && s.errors.data[0].hitsLong === PAGE * at.TELEMETRY_MAX_PAGES,
      `got=${JSON.stringify(s.errors && { t: s.errors.truncated, h: s.errors.data[0]?.hitsLong })}`);
    eq("huni", s.funnel, { data: { appOpen: 1, loginOk: 1, watchStarted: 0 }, truncated: false });
    eq("reddedilenler: sorgu başarılı + boş → [] (null değil)", s.rejected, { data: [], truncated: false });
    const wh = fake.queries.filter((q) => typesOf(q).includes("watch_health"));
    eq("watch_health sayfa aralıkları", wh.map((q) => q.range), [[0, PAGE - 1], [PAGE, 2 * PAGE - 1], [2 * PAGE, 3 * PAGE - 1]]);
    t("izleme penceresi 60 dk (desktop 30 dk'lık flush → 2×)", sinceOf(wh[0]) === new Date(now - 60 * 60e3).toISOString(), `got=${sinceOf(wh[0])}`);
    const ec = fake.queries.find((q) => typesOf(q).includes("error_code_count"));
    t("hata kodu penceresi 7 gün", !!ec && sinceOf(ec) === new Date(now - 7 * 24 * 3600e3).toISOString());
    t("sıralama created_at ↑ + id ↑ (kararlı sayfalama)", JSON.stringify(wh[0].order) === JSON.stringify([["created_at", true], ["id", true]]));
    const rq = fake.queries.find((q) => typesOf(q).includes(REJ));
    t("reddedilenler yalnız sunucu tipi telemetry_rejected'ı okur", !!rq && JSON.stringify(typesOf(rq)) === JSON.stringify([REJ]));
    t("tüm sorgular telemetry_events tablosunda", fake.queries.every((q) => q.table === "telemetry_events"));
    t("dönen yapıda user_hash yok (kimlik sızmaz)", !JSON.stringify(s).includes("user_hash") && !JSON.stringify(s).includes("u1"));
  }

  // ── [C] admin kartı render — "bilinmiyor" / "≥" / boş-durum metinleri ─────
  console.log("\n[C] /admin/altyapi Telemetri kartı — sahte 0 yok, tavan '≥' ile");
  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { renderToStaticMarkup } = require("react-dom/server") as typeof import("react-dom/server");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createElement } = require("react") as typeof import("react");
    const card = await import("../app/admin/altyapi/TelemetryCard");
    const html = (tsum: unknown) =>
      renderToStaticMarkup(createElement(card.TelemetrySectionView, { t: tsum as Parameters<typeof card.TelemetrySectionView>[0]["t"] }));

    const hNull = html(null);
    t("özet hiç okunamadı → 'Telemetri okunamadı', tablo/sayı yok", hNull.includes("Telemetri okunamadı") && !hNull.includes("<table"));

    const allNull = html({ generatedAt: "x", errors: null, latency: null, funnel: null, watching: null, rejected: null });
    t("her bölüm null → 4 kutu 'bilinmiyor' + 3 tabloda '0 DEĞİL' notu",
      (allNull.match(/>bilinmiyor</g) ?? []).length === 4 && (allNull.match(/0 DEĞİL/g) ?? []).length === 3,
      `bilinmiyor=${(allNull.match(/>bilinmiyor</g) ?? []).length} not=${(allNull.match(/0 DEĞİL/g) ?? []).length}`);

    const full = html({
      generatedAt: "x",
      errors: { data: [{ code: "capture_wgc_fallback", appVersion: null, hitsShort: 2, hitsLong: 2 }], truncated: false },
      latency: { data: [{ route: "vision", n: 37, p50: 4516, p95: 7851.999999999985 }], truncated: false },
      funnel: { data: { appOpen: 1234, loginOk: 12, watchStarted: 3 }, truncated: true },
      watching: { data: 2, truncated: false },
      rejected: { data: [{ reason: "invalid_type", type: "app_open", hits: 5 }], truncated: false },
    });
    t("tavana dayanan huni '≥1.234' yazılır", full.includes("≥1.234"), full.slice(0, 200));
    t("gecikme ms yuvarlanır (4.516 ms / 7.852 ms)", full.includes("4.516 ms") && full.includes("7.852 ms"));
    t("sürümsüz hata satırı '— (sürüm yok)'", full.includes("— (sürüm yok)"));
    t("red satırı sebep × tip × adet", full.includes("invalid_type") && full.includes("app_open") && full.includes(">5<"));

    const empty = html({
      generatedAt: "x",
      errors: { data: [], truncated: false },
      latency: { data: [], truncated: false },
      funnel: { data: { appOpen: 0, loginOk: 0, watchStarted: 0 }, truncated: false },
      watching: { data: 0, truncated: false },
      rejected: { data: [], truncated: false },
    });
    t("ölçülmüş boş bölüm → açık boş-durum metni ('bilinmiyor' DEĞİL)",
      empty.includes("reddedilen olay yok") && empty.includes("hata kodu yok") && empty.includes("ölçüm yok") && !empty.includes(">bilinmiyor<"));
  }

  console.log(fail === 0 ? `\n✅ TELEMETRİ GÖRÜNÜRLÜK: ${pass} geçti, 0 kırık` : `\n❌ TELEMETRİ GÖRÜNÜRLÜK: ${fail} kırık (${pass} geçti)`);
  process.exit(fail ? 1 : 0);
}

void main().catch((e) => {
  console.error("\n❌ TELEMETRİ TESTİ ÇÖKTÜ:", (e as Error).stack || e);
  process.exit(1);
});
