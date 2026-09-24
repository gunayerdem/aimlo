/**
 * RAPOR ROUTE TEST DÜZENEĞİ — B05 (2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * scripts/test-report-score.ts ve scripts/test-eval-fidelity.ts'in ORTAK düzeneği.
 * app/api/ai/report/route.ts'in GERÇEK POST handler'ını düz Node'da (tsx) koşar;
 * dış bağımlılıklar sahtelenir, route kodunun kendisi AYNEN çalışır.
 *
 * YAKLAŞIM — scripts/test-api-contract.ts ile AYNI kanıtlanmış modül-çözümleyici
 * kalıbı + CJS önbellek sahtesi:
 *   1) "server-only" → boş modül ("path"); "@/..." → repo kökü.
 *   2) Module._cache'e sahte `exports` konur (route CJS require ile yükler):
 *        lib/api-auth      → GERÇEK modül, yalnız verifyAuthAndRateLimit ve
 *                            consumeDailyQuota sahte (A058-B: günlük kota çağrıları
 *                            SAYILIR, ret modu verilebilir; verify'ın opts'u kaydedilir)
 *                            (authUnavailableResponse GERÇEK kalır → 503 gövdesi
 *                            prod ile aynı fonksiyondan gelir)
 *        lib/entitlements  → checkMatchQuota her zaman izinli
 *        lib/ai-usage      → saveAiUsage çağrıları SAYILIR (OLCUM-ARACI-15)
 *        lib/player-memory → bellek yükleme/yazma sahte; buildMemoryContext
 *                            testin verdiği memoryContext'i döndürür
 * ⚠ AĞ YOK: globalThis.fetch yalnız testin sahte OpenAI yanıtlarını döndürür;
 * başka her URL THROW eder. OPENAI_API_KEY varsayılan TANIMSIZ (testler kendi
 * sahte değerini koyar); .env.local OKUNMAZ.
 */
import Module from "node:module";
import * as path from "node:path";

const REPO_ROOT = path.join(__dirname, "..");
type ResolveFn = (...a: unknown[]) => unknown;
type ModuleInternals = { _resolveFilename: ResolveFn; _cache: Record<string, { exports: unknown }> };
const M = Module as unknown as ModuleInternals;

let installed = false;
function installResolver(): void {
  if (installed) return;
  installed = true;
  const origResolve = M._resolveFilename;
  M._resolveFilename = function (this: unknown, ...args: unknown[]) {
    const req = args[0];
    if (req === "server-only") return origResolve.call(this, "path", ...args.slice(1));
    if (typeof req === "string" && req.startsWith("@/")) {
      return origResolve.call(this, path.join(REPO_ROOT, req.slice(2)), ...args.slice(1));
    }
    return origResolve.apply(this, args);
  };
}

export type AuthMode =
  | { kind: "ok"; userId: string }
  | { kind: "throw"; message: string }
  | { kind: "reject"; status: number; body: Record<string, unknown> };

export type UsageCall = Record<string, unknown>;

export type FetchCall = { url: string; body: Record<string, unknown> };
export type ModelReply = { content: string; finishReason?: string; usage?: Record<string, unknown>; model?: string; status?: number };

export const harness = {
  auth: { kind: "ok", userId: "00000000-0000-4000-8000-000000000001" } as AuthMode,
  usageCalls: [] as UsageCall[],
  memoryContext: "",
  fetchCalls: [] as FetchCall[],
  /** Sıradaki OpenAI çağrılarının yanıtları (FIFO). Boşsa fetch THROW eder. */
  replies: [] as ModelReply[],
  /** A058-B: consumeDailyQuota çağrı sayısı (günlük rapor kotası harcandı mı). */
  dailyCalls: 0,
  /** A058-B: verilirse consumeDailyQuota bu yanıtı döner (kota dolu simülasyonu). */
  dailyReject: null as null | { status: number; body: Record<string, unknown> },
  /** A058-B: verifyAuthAndRateLimit'e route'un geçtiği 3. argüman (deferDaily). */
  verifyOpts: [] as unknown[],
};

export function resetHarness(): void {
  harness.auth = { kind: "ok", userId: "00000000-0000-4000-8000-000000000001" };
  harness.usageCalls = [];
  harness.memoryContext = "";
  harness.fetchCalls = [];
  harness.replies = [];
  harness.dailyCalls = 0;
  harness.dailyReject = null;
  harness.verifyOpts = [];
}

/** Sahte OpenAI uç noktası — route ve eval AYNI fonksiyonu kullanır. */
export const fakeFetch: typeof fetch = async (input: unknown, init?: unknown) => {
  const url = typeof input === "string" ? input : String((input as { url?: string })?.url ?? input);
  if (url !== "https://api.openai.com/v1/chat/completions") {
    throw new Error(`harness: beklenmeyen ağ çağrısı ${url}`);
  }
  const rawBody = (init as { body?: unknown } | undefined)?.body;
  const body = JSON.parse(typeof rawBody === "string" ? rawBody : "{}") as Record<string, unknown>;
  harness.fetchCalls.push({ url, body });
  const r = harness.replies.shift();
  if (!r) throw new Error("harness: sahte model yanıtı kalmadı");
  const payload = {
    model: r.model ?? "gpt-5-mini-2025-08-07",
    choices: [{ message: { content: r.content }, finish_reason: r.finishReason ?? "stop" }],
    ...(r.usage ? { usage: r.usage } : {}),
  };
  return new Response(JSON.stringify(payload), {
    status: r.status ?? 200,
    headers: { "content-type": "application/json" },
  });
};

let routeMod: { POST: (req: Request) => Promise<Response> } | null = null;

/** Route'u sahtelerle yükler (tek sefer). */
export function loadReportRoute(): { POST: (req: Request) => Promise<Response> } {
  if (routeMod) return routeMod;
  installResolver();
  process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://report-harness.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "report-harness-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= "report-harness-service-key";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  const resolveRepo = (rel: string) => require.resolve(path.join(REPO_ROOT, rel));

  // lib/api-auth: GERÇEK modül + sahte verifyAuthAndRateLimit.
  const apiAuthPath = resolveRepo("lib/api-auth");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const realApiAuth = require(apiAuthPath) as Record<string, unknown>;
  M._cache[apiAuthPath].exports = {
    ...realApiAuth,
    verifyAuthAndRateLimit: async (_req: unknown, _route: unknown, opts?: unknown) => {
      harness.verifyOpts.push(opts);
      const a = harness.auth;
      if (a.kind === "throw") throw new Error(a.message);
      if (a.kind === "reject") {
        return { ok: false, response: Response.json(a.body, { status: a.status }) };
      }
      return { ok: true, userId: a.userId };
    },
    consumeDailyQuota: async () => {
      harness.dailyCalls++;
      const r = harness.dailyReject;
      return r ? Response.json(r.body, { status: r.status }) : null;
    },
  };

  const fakeModule = (rel: string, exports: Record<string, unknown>) => {
    const fn = resolveRepo(rel);
    M._cache[fn] = { id: fn, filename: fn, loaded: true, exports, children: [], paths: [] } as unknown as { exports: unknown };
  };
  fakeModule("lib/entitlements", {
    checkMatchQuota: async () => ({ allowed: true, used: 0, limit: 3, resetsAt: null }),
  });
  fakeModule("lib/ai-usage", {
    saveAiUsage: (input: UsageCall) => { harness.usageCalls.push(input); },
  });
  fakeModule("lib/player-memory", {
    loadPlayerMemory: async () => (harness.memoryContext ? { fake: true } : null),
    updatePlayerMemory: async () => {},
    buildMemoryContext: () => harness.memoryContext,
  });

  globalThis.fetch = fakeFetch;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  routeMod = require(resolveRepo("app/api/ai/report/route")) as { POST: (req: Request) => Promise<Response> };
  return routeMod;
}

/** Desktop'ın attığı biçimde POST (Bearer başlıklı). */
export function reportRequest(body: unknown): Request {
  return new Request("https://aimlo.gg/api/ai/match-report", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer harness.token" },
    body: JSON.stringify(body),
  });
}
