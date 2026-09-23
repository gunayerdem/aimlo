/**
 * VISION ROUTE TEST DÜZENEĞİ — B06 (2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * app/api/ai/vision/route.ts'in GERÇEK POST handler'ını düz Node'da (tsx) koşar;
 * dış bağımlılıklar sahtelenir, route kodunun kendisi AYNEN çalışır. Amaç:
 * route'un OpenAI'a yolladığı istek gövdesini (sistem + kullanıcı mesajı, şema,
 * token tavanı) yakalayıp eval-vision ve lib/vision-prompt-builder ile BAYT
 * düzeyinde kıyaslamak (scripts/test-eval-fidelity.ts [V] bölümü).
 *
 * YAKLAŞIM — scripts/report-route-harness.ts ile AYNI kalıp (B05), aynı paylaşımlı
 * durum nesnesi (`harness`: auth / usageCalls / memoryContext / fetchCalls /
 * replies) ve aynı sahte OpenAI uç noktası (`fakeFetch`):
 *   1) "server-only" → boş modül ("path"); "@/..." → repo kökü.
 *   2) Module._cache'e sahte `exports` konur (route CJS require ile yükler):
 *        lib/api-auth      → GERÇEK modül, yalnız verifyAuthAndRateLimit sahte
 *        lib/entitlements  → checkMatchQuota her zaman izinli
 *        lib/ai-usage      → saveAiUsage çağrıları sayılır
 *        lib/player-memory → buildMemoryContext testin memoryContext'ini döndürür
 *        lib/match-events  → saveMatchEvent kaydedilir (DB yok)
 *        lib/match-concepts→ readMatchConcepts `visionHarness.matchConcepts`i
 *                            döndürür (eval-vision MATCH_CONCEPT_SIM'in karşılığı)
 * ⚠ AĞ YOK: globalThis.fetch yalnız sahte OpenAI yanıtlarını döndürür; başka her
 * URL THROW eder. .env.local OKUNMAZ; OPENAI_API_KEY testin sahte değeridir.
 */
import Module from "node:module";
import * as path from "node:path";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import { harness, fakeFetch } from "./report-route-harness";
import type { VisionGoldenCase } from "../evals/vision-golden";

const REPO_ROOT = path.join(__dirname, "..");
type ResolveFn = (...a: unknown[]) => unknown;
type ModuleInternals = { _resolveFilename: ResolveFn; _cache: Record<string, { exports: unknown }> };
const M = Module as unknown as ModuleInternals;

let resolverInstalled = false;
function installResolver(): void {
  if (resolverInstalled) return;
  resolverInstalled = true;
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

/** Vision'a özgü sahte durum (paylaşımlı `harness`'e ek). */
export const visionHarness = {
  /** readMatchConcepts'in döndüreceği maç kavram listesi (route'un mc fallback'i). */
  matchConcepts: [] as string[],
  /** recordMatchConcept çağrıları. */
  recordedConcepts: [] as string[],
  /** saveMatchEvent çağrıları. */
  matchEvents: [] as Record<string, unknown>[],
};

export function resetVisionHarness(): void {
  visionHarness.matchConcepts = [];
  visionHarness.recordedConcepts = [];
  visionHarness.matchEvents = [];
}

type VisionRouteModule = { POST: (req: Request) => Promise<Response> };
let routeMod: VisionRouteModule | null = null;

/** Route'u sahtelerle yükler (tek sefer). */
export function loadVisionRoute(): VisionRouteModule {
  if (routeMod) return routeMod;
  installResolver();
  process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://vision-harness.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "vision-harness-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= "vision-harness-service-key";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  const resolveRepo = (rel: string) => require.resolve(path.join(REPO_ROOT, rel));

  const apiAuthPath = resolveRepo("lib/api-auth");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const realApiAuth = require(apiAuthPath) as Record<string, unknown>;
  M._cache[apiAuthPath].exports = {
    ...realApiAuth,
    verifyAuthAndRateLimit: async () => {
      const a = harness.auth;
      if (a.kind === "throw") throw new Error(a.message);
      if (a.kind === "reject") return { ok: false, response: Response.json(a.body, { status: a.status }) };
      return { ok: true, userId: a.userId };
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
    saveAiUsage: (input: Record<string, unknown>) => { harness.usageCalls.push(input); },
  });
  fakeModule("lib/player-memory", {
    loadPlayerMemory: async () => (harness.memoryContext ? { fake: true } : null),
    updatePlayerMemory: async () => {},
    buildMemoryContext: () => harness.memoryContext,
  });
  fakeModule("lib/match-events", {
    saveMatchEvent: (input: Record<string, unknown>) => { visionHarness.matchEvents.push(input); },
  });
  fakeModule("lib/match-concepts", {
    readMatchConcepts: async () => [...visionHarness.matchConcepts],
    recordMatchConcept: async (_u: string, _m: string, t: string) => { visionHarness.recordedConcepts.push(t); },
  });

  globalThis.fetch = fakeFetch;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  routeMod = require(resolveRepo("app/api/ai/vision/route")) as VisionRouteModule;
  return routeMod;
}

/** 1280×720 PNG başlığı (IHDR) + dolgu — isValidVisionRequest'in sihirli bayt,
 *  base64 ≥1000 karakter ve piksel-sınırı kapılarından geçer. Piksel verisi yok:
 *  route görseli çözmez, yalnız başlığı okur (readImageDimensions). */
export const TEST_PNG_B64: string = (() => {
  const b = Buffer.alloc(800, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(1280, 16);
  b.writeUInt32BE(720, 20);
  b[24] = 8; b[25] = 2;
  return b.toString("base64");
})();

/** Desktop'ın attığı biçimde POST (Bearer başlıklı). Görsel verilmezse TEST_PNG_B64. */
export function visionRequest(body: Record<string, unknown>): Request {
  return new Request("https://aimlo.gg/api/ai/vision", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer harness.token" },
    body: JSON.stringify({ image: TEST_PNG_B64, imageFormat: "image/png", ...body }),
  });
}

/** Geçerli (şema-uyumlu) sahte koç yanıtı — route'un son-işlem yolunu sonuna kadar yürütür. */
export const VALID_FEEDBACK_JSON = JSON.stringify({
  deathAnalysis: "Açıyı erken açtın ve ilk atışı yedin. Siperin yanında dur, ilk kontağı bekle.",
  enemyAnalysis: [
    "Rakip aynı açıdan ilk atışı aldı.",
    "Bir sonraki round o açıya smoke iste ve geri çekil.",
  ],
  nextRoundSuggestion: "Round başında takım arkadaşınla çapraz açı kur ve ilk teması birlikte al.",
});

export type CapturedVisionCall = {
  status: number;
  json: Record<string, unknown>;
  /** OpenAI'a giden ilk istek gövdesi (model/max_completion_tokens/response_format/messages). */
  requestBody: Record<string, unknown> | null;
  systemMessage: string;
  /** Kullanıcı mesajının METİN bloğu (görsel bloğu hariç). */
  userText: string;
  /** Kullanıcı mesajında image_url bloğu var mı. */
  hasImage: boolean;
  /** Route'un console.log/warn/error satırları (sırasıyla). */
  logs: string[];
};

/**
 * Tek isteği GERÇEK route'tan geçirir; OpenAI'a giden gövdeyi yakalar. Konsol
 * çıktısı yutulur ve `logs`a yazılır (test çıktısı temiz kalsın). Paylaşımlı
 * harness durumunu (fetchCalls/replies/usageCalls) çağıran sıfırlar.
 */
export async function captureVisionCall(
  body: Record<string, unknown>,
  opts: { reply?: string; finishReason?: string; memoryContext?: string; matchConcepts?: string[] } = {},
): Promise<CapturedVisionCall> {
  const route = loadVisionRoute();
  harness.fetchCalls = [];
  harness.usageCalls = [];
  harness.replies = [{ content: opts.reply ?? VALID_FEEDBACK_JSON, finishReason: opts.finishReason ?? "stop", usage: { prompt_tokens: 1000, completion_tokens: 100 } }];
  harness.memoryContext = opts.memoryContext ?? "";
  visionHarness.matchConcepts = opts.matchConcepts ? [...opts.matchConcepts] : [];
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-test-harness-not-real";
  const logs: string[] = [];
  const orig = { log: console.log, warn: console.warn, error: console.error };
  const sink = (...a: unknown[]) => { logs.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ")); };
  console.log = sink; console.warn = sink; console.error = sink;
  let res: Response;
  try {
    res = await route.POST(visionRequest(body));
  } finally {
    console.log = orig.log; console.warn = orig.warn; console.error = orig.error;
    if (prevKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = prevKey;
  }
  const json = (await res.json()) as Record<string, unknown>;
  const requestBody = (harness.fetchCalls[0]?.body ?? null) as Record<string, unknown> | null;
  const messages = (requestBody?.messages ?? []) as { role: string; content: unknown }[];
  const systemMessage = typeof messages[0]?.content === "string" ? (messages[0].content as string) : "";
  const userContent = messages[1]?.content;
  let userText = "";
  let hasImage = false;
  if (Array.isArray(userContent)) {
    for (const blk of userContent as { type: string; text?: string }[]) {
      if (blk.type === "text" && typeof blk.text === "string") userText = blk.text;
      if (blk.type === "image_url") hasImage = true;
    }
  } else if (typeof userContent === "string") {
    userText = userContent;
  }
  return { status: res.status, json, requestBody, systemMessage, userText, hasImage, logs };
}

/* ── GOLDEN KAYDI (TR-KALAN-18) ────────────────────────────────────────────── */

export const sha256 = (s: string): string => crypto.createHash("sha256").update(s, "utf8").digest("hex");

/** knowledge/** içeriğinin özeti — sistem mesajı golden'ı YALNIZ KB aynıyken kıyaslanır. */
export function knowledgeDigest(): string {
  const root = path.join(REPO_ROOT, "knowledge");
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) files.push(p);
    }
  };
  walk(root);
  files.sort();
  const h = crypto.createHash("sha256");
  for (const f of files) {
    h.update(path.relative(root, f).split(path.sep).join("/"));
    h.update("\u0000");
    h.update(fs.readFileSync(f));
    h.update("\u0000");
  }
  return h.digest("hex");
}

export type VisionGoldenRecord = {
  id: string;
  status: number;
  deathType: unknown;
  model: unknown;
  maxCompletionTokens: unknown;
  reasoningEffort: unknown;
  hasImage: boolean;
  responseFormatSha256: string;
  systemBytes: number;
  systemSha256: string;
  userText: string;
};

/** Golden vakayı GERÇEK route'tan geçirip kayda çevirir (maxTokens: desktop'ın 900'ü). */
export async function goldenRecordFor(c: VisionGoldenCase): Promise<{ record: VisionGoldenRecord; capture: CapturedVisionCall }> {
  const capture = await captureVisionCall({ maxTokens: 900, ...c.body }, {
    memoryContext: c.memoryContext ?? "",
    matchConcepts: c.matchConcepts ?? [],
  });
  const rb = capture.requestBody ?? {};
  return {
    capture,
    record: {
      id: c.id,
      status: capture.status,
      deathType: capture.json.deathType ?? null,
      model: rb.model ?? null,
      maxCompletionTokens: rb.max_completion_tokens ?? null,
      reasoningEffort: rb.reasoning_effort ?? null,
      hasImage: capture.hasImage,
      responseFormatSha256: sha256(JSON.stringify(rb.response_format ?? null)),
      systemBytes: Buffer.byteLength(capture.systemMessage, "utf8"),
      systemSha256: sha256(capture.systemMessage),
      userText: capture.userText,
    },
  };
}
