/**
 * TELEMETRİ GÖRÜNÜRLÜK TESTİ — B08 (2026-09-24 · A006/A064)
 * ─────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-telemetry-route.ts   (exit 1 = kırık)
 *
 * NEDEN VAR: /api/telemetry kısmi başarıda 200 dönüyor ve yalnız red SAYISINI
 * logluyordu; desktop da yalnız HTTP statüsüne baktığı için app_open/login_ok/
 * watch_started 31.07 → 16.09 arası `invalid_type` ile iki tarafta da görünmeden
 * düştü. Bu test route fix'ini kilitler:
 *   [A] route: GERÇEK POST handler — red sebebi+tipi `[TELEMETRY_REJECTED]`
 *       satırında, `telemetry_rejected` özet satırları DB'ye (TÜMÜ reddedilen
 *       batch dahil), yanıt şekli DEĞİŞMEDEN.
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

  console.log(fail === 0 ? `\n✅ TELEMETRİ GÖRÜNÜRLÜK: ${pass} geçti, 0 kırık` : `\n❌ TELEMETRİ GÖRÜNÜRLÜK: ${fail} kırık (${pass} geçti)`);
  process.exit(fail ? 1 : 0);
}

void main().catch((e) => {
  console.error("\n❌ TELEMETRİ TESTİ ÇÖKTÜ:", (e as Error).stack || e);
  process.exit(1);
});
