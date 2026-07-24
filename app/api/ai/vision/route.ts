import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { checkMatchQuota } from "@/lib/entitlements";
import { saveAiUsage } from "@/lib/ai-usage";
import { saveMatchEvent } from "@/lib/match-events";
import { realityCheck, buildFactGround } from "@/lib/reality-checker";
import { loadVisionKnowledge } from "@/lib/knowledge-loader";
import { sanitizePromptInput } from "@/lib/prompt-safety";
import { loadPlayerMemory, buildMemoryContext } from "@/lib/player-memory";
import { isUuidV4 } from "@/lib/uuid";
import { buildPolicyBlock, CONFIDENCE_PROMPTS } from "@/lib/ai-policy";
import { buildAgentAbilityHint, enforceAgentKit } from "@/lib/agent-abilities";
import { cleanCoachText, clampWords, stripNumericHp } from "@/lib/coach-text";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_EN_ADDENDUM, USER_PROMPT, USER_PROMPT_EN, buildFactSheet, buildRoundFeedbackSchema } from "@/lib/vision-prompt";
import { classifyDeath, buildDeathTypeDirective } from "@/lib/death-type";
import { extractKillerWeapon, classifyCompArchetype, buildWeaponCompDirective } from "@/lib/comp-weapon";
import { mapKey } from "@/lib/map-callouts";

// ── Coach-voice OUTPUT cleaner ─────────────────────────────────────────────
// cleanCoachText is now the SHARED single-source deterministic net in
// lib/coach-text.ts (council 2026-06-25, Cycle 2 fix #1) — every AI route
// applies the same cleanup. This route both builds an inline SYSTEM_PROMPT AND
// injects ai-policy.buildPolicyBlock (see the systemSections assembly below),
// so the coach-voice rules reach the model; cleanCoachText is the on-the-wire
// guaranteed safety layer applied to the parsed output. Lang-aware: TR-jargon
// translation + apostrophe-fix run ONLY for tr. WHITELISTED English (ai-policy
// ENGLISH_WHITELIST_RULE — peek/swing/entry/default/util/molly/smoke/flash/op/
// off-angle...) is intentionally LEFT untouched.

/**
 * POST /api/ai/vision
 * Analyzes a Valorant round-end screenshot for real-time coaching feedback.
 * Backend proxy for OpenAI GPT-5 mini (migrated May 2026 from Anthropic Sonnet
 * 4.6 — ~91% cost reduction with comparable vision quality for AIMLO's
 * structured-text + KB-driven coach output workflow).
 *
 * - Requires authenticated user (Supabase JWT)
 * - Rate limited (verifyAuthAndRateLimit, "vision" tier)
 * - OPENAI_API_KEY is server-side only
 * - Accepts base64-encoded PNG/JPEG/WebP screenshot
 * - Returns strict JSON via OpenAI response_format json_schema
 */

// Vercel function-level timeout (Pro plan: max 300s). We pick 90 to give AI 60s + 30s buffer
// for auth, KB load, prompt assembly, and response processing.
export const maxDuration = 90;

const AI_TIMEOUT_MS = 60_000; // Sonnet 4.6 + vision + KB prompt — 60s covers cold-start edge cases
const MAX_PAYLOAD_BYTES = 5_000_000; // 5MB max (base64 images are large)
// Migrated to OpenAI GPT-5 mini (May 2026) for ~91% cost reduction vs Sonnet.
// See docs/audit/feedback-samples-100.md for the coach-voice baseline this
// migration must preserve.
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Strict JSON schema — OpenAI enforces structure server-side. Length caps
// applied post-response (OpenAI strict mode doesn't support maxLength).
/* ROUND_FEEDBACK_SCHEMA, SYSTEM_PROMPT, USER_PROMPT moved to lib/vision-prompt.ts (Cycle 3) */

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

type RoundEvidenceEntry = {
  round_index: number;
  died: boolean;
  round_won: boolean;
  death_detected_confidence: string;
  timestamp: number;
};

const VALID_IMAGE_FORMATS = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
type ImageFormat = typeof VALID_IMAGE_FORMATS[number];

// Coach-voice 3-field schema:
//   deathAnalysis     : 1-2 sentence Turkish/English with explanation
//   enemyAnalysis     : 2 items × 1 sentence each
//   nextRoundSuggestion: 1-2 sentence simple working tactic
// Real output ~180-280 tokens (Turkish needs more chars than English to
// say the same thing naturally). 450 cap gives ~60% headroom for outliers
// like multi-pattern rounds. Output cost was 42% of per-call — even at
// 280 tokens (vs old 400) we save ~30% on output bill.
const DEFAULT_MAX_TOKENS = 350;
const MAX_TOKENS_CAP = 450;

type VisionRequest = {
  image: string; // base64-encoded image
  imageFormat?: string; // e.g. "image/jpeg" — defaults to "image/png"
  maxTokens?: number; // client-requested max tokens — capped at 512
  roundHistory?: RoundEvidenceEntry[];
  map?: string; // e.g. "Ascent", "Bind"
  agent?: string; // e.g. "Jett", "Omen"
  rank?: string; // e.g. "gold", "immortal"
  enemyComp?: string[]; // e.g. ["Jett", "Omen", "Sova"]
  patternContext?: string; // Rust client pattern analysis
  // Client-provided round context (used to enrich AI prompt)
  round?: number;
  score?: string;
  result?: string;
  died?: boolean;
  deathTiming?: string;
  bannerType?: string;
  combatReportVisible?: boolean;
  scoreChanged?: boolean;
  // Game context fields from desktop app
  side?: string; // "attack" | "defense"
  mode?: string; // "competitive" | "unrated" etc.
  killerInfo?: string; // e.g. "killed by jett with vandal"
  deathLocation?: string; // e.g. "a site", "mid window"
  deathAngle?: string; // e.g. "back-left", "front-right"
  alliesAlive?: number; // 0-4
  enemiesAlive?: number; // 0-5
  credits?: number; // round start credits e.g. 3900
  loadout?: string; // current weapon e.g. "vandal", "spectre"
  lang?: string; // "tr" | "en" — feedback language (desktop Settings; absent = tr, back-compat)
  economyType?: string; // "full_buy"/"force_buy"/"half_buy"/"eco"/"pistol"
  // New fields from desktop app
  spikePlanted?: boolean; // was spike planted when player died
  healthAtDeath?: number; // HP + shield at death (0-150)
  hpSampleAgeSec?: number; // 2026-07-09 additive: age of the last-alive HP sample at death-confirm (older desktop builds omit it)
  ultReady?: boolean; // was ultimate ready when player died
  roundTimerAtDeath?: number; // seconds remaining on round timer (0-140)
  // ── FAZ2/FAZ3 additive fields (default-absent) ──
  // Desktop sends these ONLY when its feature flags are on AND the value was
  // actually measured. Absent ⇒ byte-identical request to before. The route
  // never invents them; reality-checker.guardUnprovenFacts strips any AI claim
  // about route/trade when the matching field is absent.
  playerKills?: number;      // scoreboard K this match (0-99)
  playerDeaths?: number;     // scoreboard D this match (0-99)
  playerAssists?: number;    // scoreboard A this match (0-99)
  tradedByAlly?: boolean;    // was the player's death traded by a teammate (killfeed-derived)
  tradeKillerAgent?: string; // agent that traded the killer (optional context)
  playerRoute?: string;      // MEASURED route, e.g. "B Main → Mid → A Site" (FAZ3 minimap)
  routeConfidence?: string;  // "high" | "medium" | "low" — gates how firmly AI may state it
  scoreboardKda?: string;    // free-form "K/D/A" summary, if desktop sends as text
  killfeedOrder?: string[];  // chronological kill events this round
  // Match correlation — desktop generates UUID v4 in its SQLite queue so
  // per-round vision calls + the eventual match-report INSERT all share
  // the same matchId. Optional; vision itself does NOT persist anything,
  // it's just validated + logged for debugging round↔match correlation.
  matchId?: string;
};

type PatternData = {
  deathLocation?: string;
  peekType?: string;
  utilUsed?: boolean;
  traded?: boolean;
  deathTiming?: string;
  enemyWeapon?: string;
  mapControl?: string;
  wasRepeatedMistake?: boolean;
};

const PEEK_TYPES = ["dry_peek", "util_peek", "jiggle", "wide_swing", "holding", "unknown"];
const DEATH_TIMINGS = ["early", "mid", "late", "post_plant"];
const MAP_CONTROLS = ["full_control", "partial_control", "no_control", "contested"];

function sanitizePatternData(raw: unknown): PatternData | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const safe: PatternData = {};
  let hasField = false;

  if (typeof src.deathLocation === "string" && src.deathLocation.length > 0) {
    safe.deathLocation = src.deathLocation.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
    hasField = true;
  }
  if (typeof src.peekType === "string" && PEEK_TYPES.includes(src.peekType)) {
    safe.peekType = src.peekType;
    hasField = true;
  }
  if (typeof src.utilUsed === "boolean") {
    safe.utilUsed = src.utilUsed;
    hasField = true;
  }
  if (typeof src.traded === "boolean") {
    safe.traded = src.traded;
    hasField = true;
  }
  if (typeof src.deathTiming === "string" && DEATH_TIMINGS.includes(src.deathTiming)) {
    safe.deathTiming = src.deathTiming;
    hasField = true;
  }
  if (typeof src.enemyWeapon === "string" && src.enemyWeapon.length > 0) {
    safe.enemyWeapon = src.enemyWeapon.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    hasField = true;
  }
  if (typeof src.mapControl === "string" && MAP_CONTROLS.includes(src.mapControl)) {
    safe.mapControl = src.mapControl;
    hasField = true;
  }
  if (typeof src.wasRepeatedMistake === "boolean") {
    safe.wasRepeatedMistake = src.wasRepeatedMistake;
    hasField = true;
  }

  return hasField ? safe : null;
}

type RoundFeedback = {
  round: number;
  score: string;
  result: string;
  died: boolean;
  deathAnalysis: string;
  enemyAnalysis: string[];
  nextRoundSuggestion: string;
  // coachInsight removed — purple "KOÇ İÇGÖRÜSÜ" block dropped from overlay design.
  // Pattern-aware insight now folds into deathAnalysis or nextRoundSuggestion when relevant.
  killerAgent?: string | null;
  killerWeapon?: string | null;
  killfeedConfidence?: string;
  deathPosition?: string | null;
  positionConfidence?: string;
  positionSignals?: number;
  patternData?: unknown;
};

/* ══════════════════════════════════════════════════════════
   MESSAGE CONTENT BUILDER — image-skip optimization
   ══════════════════════════════════════════════════════════ */

// OpenAI Chat Completions content block format.
type OpenAITextBlock = { type: "text"; text: string };
type OpenAIImageBlock = { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };
type UserContentBlock = OpenAITextBlock | OpenAIImageBlock;

/**
 * Build the OpenAI message `content` array. For SURVIVED rounds (died=false)
 * the image is skipped — AI doesn't need a death-cam screenshot to coach a
 * round the player didn't die in. OCR data + KB carry full context.
 *
 * Stateless per-call: each round independently decides based on `died`.
 * Next death automatically re-attaches the image.
 *
 * Image format: `data:<media_type>;base64,<data>` — OpenAI's data-URL format.
 *
 * GÖRSEL TOKEN MALİYETİ (düzeltme 2026-07-20). Buradaki eski yorum "detail:auto
 * → ~85 token" diyordu; bu GPT-4o'nun TILE tabanlı fiyatlandırmasıydı ve gpt-5-mini
 * için YANLIŞ. GPT-5 ailesi PATCH tabanlı fiyatlandırır:
 *   patch  = ceil(genişlik/32) × ceil(yükseklik/32)
 *   1280×720 → ceil(1280/32)=40 · ceil(720/32)=23 → 40×23 = 920 patch
 *   920 ≤ 1536 patch bütçesi olduğu için görsel KÜÇÜLTÜLMEZ (bütçe aşılsaydı
 *   model görüntüyü 1536 patch'e sığacak şekilde ölçekler).
 *   token  = patch × 1.62 (gpt-5-mini çarpanı) → 920 × 1.62 ≈ 1490 token
 * Yani ölümlü bir round'un görseli ~1490 token — eski varsayımın ~17,5 katı.
 * `detail` parametresi GPT-5 ailesinde YOK SAYILIR (low/high/auto fark etmez),
 * bu yüzden "auto" bırakmak zararsızdır ve olası model değişiminde güvenli
 * varsayılan kalır. Görselden tasarrufun TEK yolu onu hiç göndermemektir —
 * `died !== false` kapısı tam olarak bunu yapar (hayatta kalınan round'da
 * görsel yok, ~1490 token doğrudan düşer).
 */
function buildUserContent(
  died: boolean | undefined,
  image: string,
  mediaType: string,
  textPrompt: string,
): UserContentBlock[] {
  const content: UserContentBlock[] = [];
  if (died !== false) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${mediaType};base64,${image}`,
        detail: "auto",
      },
    });
  }
  content.push({ type: "text", text: textPrompt });
  return content;
}

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */

// Base64 character set regex (A-Z, a-z, 0-9, +, /, =)
const BASE64_REGEX = /^[A-Za-z0-9+/]+=*$/;
const MAX_IMAGE_BYTES = 4_000_000; // 4MB decoded max (~5.3MB base64)

function isValidVisionRequest(obj: unknown): obj is VisionRequest {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.image !== "string") return false;
  const img = o.image as string;
  // Minimum length for a real image
  if (img.length < 1000) return false;
  // Max base64 length (decoded ≈ length × 0.75)
  if (img.length > MAX_IMAGE_BYTES * 1.4) return false;
  // FULL base64 character-set validation (not just first 1000 chars — that
  // allowed a polyglot/garbage payload past the cheap prefix check).
  if (!BASE64_REGEX.test(img)) return false;
  // Decode the full image and verify magic bytes match the declared format.
  // atob() throws on invalid base64, catch and reject.
  let bin: string;
  try {
    bin = atob(img);
  } catch {
    return false;
  }
  if (bin.length > MAX_IMAGE_BYTES) return false;
  if (bin.length < 100) return false;
  // Magic bytes
  const b0 = bin.charCodeAt(0), b1 = bin.charCodeAt(1), b2 = bin.charCodeAt(2), b3 = bin.charCodeAt(3);
  const isPng = b0 === 0x89 && b1 === 0x50 && b2 === 0x4E && b3 === 0x47;
  const isJpeg = b0 === 0xFF && b1 === 0xD8 && b2 === 0xFF;
  const isWebp = bin.length >= 12 && bin.slice(0, 4) === "RIFF" && bin.slice(8, 12) === "WEBP";
  if (!isPng && !isJpeg && !isWebp) return false;
  // If client supplied an imageFormat, ensure it matches the actual bytes.
  if (typeof o.imageFormat === "string") {
    const fmt = (o.imageFormat as string).toLowerCase();
    if (isPng && !fmt.includes("png")) return false;
    if (isJpeg && !fmt.includes("jpeg") && !fmt.includes("jpg")) return false;
    if (isWebp && !fmt.includes("webp")) return false;
  }
  // matchId optional but if present must be a valid UUID v4. Reject
  // garbage early so the field can't smuggle prompt-injection text past
  // the rest of the validation just because it isn't sanitized.
  if (o.matchId !== undefined && !isUuidV4(o.matchId)) {
    return false;
  }
  return true;
}

function isValidFeedbackShape(obj: unknown): obj is RoundFeedback {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.deathAnalysis === "string" &&
    Array.isArray(o.enemyAnalysis) &&
    typeof o.nextRoundSuggestion === "string"
  );
}

// ── Explicit error response builder (NO canned content fallbacks) ──
// Frontend rejects responses containing "Analiz yapılamadı." substring,
// so error paths MUST return non-200 + {error,message} — never fake content.
function errorResponse(
  code: string,
  message: string,
  status: number,
  detail?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      error: code,
      message,
      ...(detail ? { detail } : {}),
    },
    { status },
  );
}

/* ══════════════════════════════════════════════════════════
   ROUTE HANDLER
   ══════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    // Reject oversized payloads
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 },
      );
    }

    // Auth + rate limit (uses dedicated "vision" tier — 4/min, 30/day —
    // vision is $0.015+/call so kept tighter than feedback)
    const auth = await verifyAuthAndRateLimit(request, "vision");
    if (!auth.ok) return auth.response;

    // Parse body
    const body = await request.json().catch(() => null);
    if (!isValidVisionRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { image: string }" },
        { status: 400 },
      );
    }

    // ── Ücretsiz katman kotası (2026-07-20) — haftada 3 MAÇ ──
    // ŞU AN KAPALI: yalnızca FREE_TIER_ENFORCED="true" env'i varken çalışır,
    // beta boyunca hiçbir ağ çağrısı bile yapmaz (bayrak ilk kontrol edilir).
    // AIMLO+ abonesi → sınırsız. Kota AI çağrısından ÖNCE, ücretli iş başlamadan.
    const quota = await checkMatchQuota(auth.userId, (body as VisionRequest).matchId);
    if (!quota.allowed) {
      console.log(
        `[QUOTA] free tier limit reached — user=${auth.userId.slice(0, 8)} used=${quota.used}/${quota.limit}`,
      );
      // Denetim M6: istemci "ne zaman sıfırlanır" diyebilsin diye detail taşı.
      return NextResponse.json(
        {
          error: "quota_exceeded",
          message: `Ücretsiz hesabın haftalık ${quota.limit} maç analizi hakkı doldu. AIMLO+ ile sınırsız analiz al.`,
          detail: { used: quota.used, limit: quota.limit, resetsAt: quota.resetsAt },
        },
        { status: 402 }, // Payment Required — desktop "yükselt" akışına bağlayabilir
      );
    }

    // Get API key
    // All AI routes use OpenAI GPT-5 mini as of May 2026. Single key.
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Aimlo AI] Vision: no API key configured");
      return errorResponse("ai_unavailable", "AI service not configured (missing API key)", 503);
    }

    // Resolve imageFormat (default: image/png for backward compat)
    const rawFormat = (body as VisionRequest).imageFormat;
    const resolvedMediaType: ImageFormat =
      typeof rawFormat === "string" && (VALID_IMAGE_FORMATS as readonly string[]).includes(rawFormat)
        ? (rawFormat as ImageFormat)
        : "image/png";
    if (rawFormat && rawFormat !== resolvedMediaType) {
      console.log(`[Aimlo AI] imageFormat rejected: "${rawFormat}" → default "image/png"`);
    } else {
      console.log(`[Aimlo AI] imageFormat: ${resolvedMediaType}`);
    }

    // Resolve maxTokens (default: 400, cap: 512)
    const rawMaxTokens = (body as VisionRequest).maxTokens;
    let resolvedMaxTokens = DEFAULT_MAX_TOKENS;
    if (typeof rawMaxTokens === "number" && rawMaxTokens > 0) {
      resolvedMaxTokens = Math.min(rawMaxTokens, MAX_TOKENS_CAP);
    }
    console.log(`[Aimlo AI] maxTokens: requested=${rawMaxTokens ?? "none"}, resolved=${resolvedMaxTokens}`);

    // ── KB context loading (RAG-lite) ──────────────────────
    const reqMap = typeof (body as VisionRequest).map === "string" ? (body as VisionRequest).map : undefined;
    const reqAgent = typeof (body as VisionRequest).agent === "string" ? (body as VisionRequest).agent : undefined;
    const reqRank = typeof (body as VisionRequest).rank === "string" ? (body as VisionRequest).rank : undefined;
    const reqEnemyComp = Array.isArray((body as VisionRequest).enemyComp) ? (body as VisionRequest).enemyComp : undefined;
    const reqPatternContext = typeof (body as VisionRequest).patternContext === "string" ? (body as VisionRequest).patternContext : undefined;

    const reqSpikePlanted = typeof (body as VisionRequest).spikePlanted === "boolean" ? (body as VisionRequest).spikePlanted : undefined;
    const reqEconomyType = typeof (body as VisionRequest).economyType === "string" ? (body as VisionRequest).economyType : undefined;
    const reqSide = typeof (body as VisionRequest).side === "string" ? (body as VisionRequest).side : undefined;
    // Feedback dili (canlı-test 2026-07-18): desktop Ayarlar → "Geri Bildirim Dili".
    // Whitelist — yalnız "en" kabul, diğer her şey tr (eski desktop lang göndermez → tr).
    const reqLang: "tr" | "en" = (body as VisionRequest).lang === "en" ? "en" : "tr";

    // Karşı-ajan kesiti kapısı (denetim 2026-07-19): loader'daki [KARŞI-AJAN] yolu
    // killerInfo bekliyordu ama buradan hiç geçmiyordu — ölü kod. died===true kapısı
    // ŞART (aşağıdaki extractKillerWeapon ile aynı desen): ölünmeyen round'da bayat
    // killerInfo karşı-ajan kesiti tetiklemesin. Loader sözlük-bağlı — prompt'a ham
    // metin DEĞİL, yalnız AGENT_ROLE_MAP anahtarı + yerel dosya kesiti girer;
    // sanitizePromptInput yine de uygulanır (defense-in-depth, ctx.killerInfo
    // yolundaki parametrelerin birebir aynısı: max 120, collapseWhitespace).
    const rawKillerInfo = (body as VisionRequest).killerInfo;
    const reqKillerInfo =
      (body as VisionRequest).died === true && typeof rawKillerInfo === "string" && rawKillerInfo.length > 0
        ? sanitizePromptInput(rawKillerInfo, { max: 120, collapseWhitespace: true }) || undefined
        : undefined;

    const kb = loadVisionKnowledge({
      map: reqMap,
      agent: reqAgent,
      rank: reqRank,
      enemyAgents: reqEnemyComp,
      spikePlanted: reqSpikePlanted,
      economyType: reqEconomyType,
      // Side-aware filter: drops only explicit opposite-side strategy sections.
      // Conservative — keeps all general/callout/agent-tier/anti-strat sections.
      side: reqSide,
      // Karşı-ajan kesiti: seni öldüren ajanın "Bu Ajana Karşı" bölümü (died-kapılı).
      killerInfo: reqKillerInfo,
    });

    // KB observability (council 2026-06-08): prove per-request whether the KB is
    // actually injected (softi: "feedback benim KB'den gelmiyor"). The KB IS loaded
    // + concatenated below; this logs the injected byte sizes + selectors so it's
    // visible in Vercel logs. Rank-gating was REMOVED (2026-06-26): every rank now
    // maps to the single un-gated universal.md, so a missing/empty rank no longer
    // caps insight — depth is selected by death-type RAG inside the file.
    const staticLen = kb.blocks.static?.length ?? 0;
    const agentLen = kb.blocks.agent?.length ?? 0;
    const mapLen = kb.blocks.map?.length ?? 0;
    const ctxLen = kb.blocks.contextual?.length ?? 0;
    // profile = ranks/universal.md — HER istekte bayt-aynı, cache önekinin
    // en büyük parçası (maliyet optimizasyonu 2026-07-20). Prod telemetride
    // görünmezse sessiz bir cache regresyonu fark edilmez.
    const profileLen = kb.blocks.profile?.length ?? 0;
    const kbTotal = staticLen + agentLen + mapLen + ctxLen + profileLen;
    console.log(
      `[KB] injected static=${staticLen}b profile=${profileLen}b agent=${agentLen}b map=${mapLen}b ctx=${ctxLen}b total=${kbTotal}b ` +
      `files=[${kb.files.join(", ")}] selectors map=${reqMap ?? "-"} agent=${reqAgent ?? "-"} ` +
      `rank=${reqRank ?? "-"} enemies=${reqEnemyComp?.length ?? 0}`,
    );
    if (!reqRank) {
      console.warn(`[KB] rank MISSING → universal.md served (rank-gating removed; insight depth is death-type driven, not rank).`);
    }
    if (kbTotal === 0) {
      console.warn(`[KB] EMPTY — tracing regression? knowledge/*.md missing from serverless bundle.`);
    }

    // Build system message — flattened for OpenAI Chat Completions API.
    //
    // OpenAI uses automatic prefix-based caching (no explicit cache_control needed).
    // Order blocks by stability so the most-stable prefix matches across calls:
    //   1. SYSTEM_PROMPT  (most stable — coach voice, never changes)
    //   2. Agent KB       (stable across matches — main agent rarely changes)
    //   3. Map KB         (per-match — changes when player switches map)
    //   4. Contextual KB  (rank + matchup + post-plant + economy — situational)
    //   5. patternContext (every round — DO NOT include in stable prefix)
    //
    // OpenAI auto-cache hits the longest-matching prefix. For Match 2 with the
    // same agent but different map, blocks 1+2 still cache-hit (cached at 90%
    // discount = $0.025/M instead of $0.25/M). Blocks 3+4 rewrite as fresh input.
    // Cache lifetime ~5 minutes for first-tier, ~1h for high-volume keys.
    //
    // Single-source coach policy (ai-policy.buildPolicyBlock): the inline
    // SYSTEM_PROMPT alone never reached ai-policy's BANNED_PHRASES / vague-ban /
    // natural-coach / Silver rules. Inject them right after SYSTEM_PROMPT so the
    // stable prefix carries them (cache-friendly). includeDecisionRubric:false is
    // MANDATORY — vision has no decision score. Confidence is derived from how
    // much round history the desktop sent (calibrating→high) so the coach hedges
    // language when data is thin.
    const _rh = (body as VisionRequest).roundHistory;
    const visionConfidence = (!_rh || !_rh.length)
      ? "calibrating"
      : _rh.length < 4 ? "low"
      : _rh.length < 8 ? "medium"
      : "high";
    const systemSections: string[] = [
      // EN modunda TR gövde + İngilizce few-shot eki (★2): TR gövde bayt-aynı
      // kalır (TR cache'i korunur); EN istekler kendi sabit prefix'inde cache'lenir.
      reqLang === "en" ? SYSTEM_PROMPT + SYSTEM_PROMPT_EN_ADDENDUM : SYSTEM_PROMPT,
      buildPolicyBlock({
        confidence: visionConfidence,
        tone: "strict",
        lang: reqLang,
        includeEnemyGate: true,
        includeDecisionRubric: false,
        // Cycle 2 (council 2026-06-25) — vision opts into the schema-aligned
        // variants: OCR anchor (no invent-a-stat), single-fix 1-2 sentence
        // focus, concrete-anchor enemy items. Resolves the prompt vs schema
        // contradictions; report/insight keep defaults (byte-identical).
        anchorMode: "ocr",
        outputFocusMode: "single",
        enemyGateMode: "vision",
        // Prompt-cache (2026-07-20): confidence roundHistory.length ile maç içinde
        // calibrating→low→medium→high diye DEĞİŞİYORDU ve policy bloğu prefix'in
        // en başında olduğu için her geçişte ARKASINDAKİ ~65KB KB cache'ten
        // düşüyordu. Artık prefix'e girmiyor; birebir aynı metin
        // (CONFIDENCE_PROMPTS[visionConfidence]) user mesajına ekleniyor —
        // emsal: factSheet/deathTypeDirective/weaponCompDirective. `confidence`
        // argümanı bilinçli KORUNDU: diğer opsiyonlarla tutarlılık + tek satır
        // değişiklikle geri alınabilirlik.
        confidenceInPrefix: false,
      }),
    ];
    // Block 0 — statik silah+komp rehberi (2026-07-08): istekten bağımsız TEK içerik,
    // policy'den hemen sonra → tüm kullanıcılar/maçlar arası prefix-cache paylaşır.
    // Bölüm seçimi user-message [SİLAH+KOMP İPUCU] işaretçisinde (cache'e dokunmaz).
    if (kb.blocks.static)     systemSections.push(kb.blocks.static);
    // Blok 0b — koçluk profili (knowledge/ranks/universal.md). 2026-07-20 ölçümü:
    // bu dosya rank/map/agent/side'dan BAĞIMSIZ, HER istekte BAYT-AYNI (rank-gating
    // kaldırıldığından beri her rank aynı dosyaya map'leniyor) ama contextual'ın
    // ~%91'i olarak dinamik blokların ARKASINDA duruyordu → her round taze
    // faturalanıyordu. static'ten hemen sonraya alındı: static+profile birlikte
    // 43.612 B ≈ 13.629 tokenlik KALICI küresel önek oluşturur (tüm kullanıcı ve
    // maçlar arası paylaşılır). İçerik aynı, yalnızca yeri değişti.
    if (kb.blocks.profile)    systemSections.push(kb.blocks.profile);
    if (kb.blocks.agent)      systemSections.push(kb.blocks.agent);
    // Agent-ability grounding (2026-06-26): oyuncunun GERÇEK kitini enjekte et →
    // model ajana OLMAYAN yeteneği önermez (canlı bug: Killjoy'a "tel"=Cypher's).
    // SIRA (denetim 2026-07-08): abilityHint AGENT-stabil → map/contextual'dan ÖNCE
    // push edilir; eskiden contextual'dan sonraydı ve spike/eco toggle'ı her round
    // contextual'ı değiştirdiğinde abilityHint+memory de cache'ten düşüyordu.
    const abilityHint = buildAgentAbilityHint(reqAgent, reqLang);
    if (abilityHint) systemSections.push(abilityHint);
    if (kb.blocks.map)        systemSections.push(kb.blocks.map);
    if (kb.blocks.contextual) systemSections.push(kb.blocks.contextual);

    // ── Cross-match player memory (GROUNDED prior history) ──────────────────
    // buildMemoryContext returns ONLY persisted facts (top death spots, weak
    // map, best agent, detected tendencies) — never invented stats. Same
    // service-role load + builder the report route uses (lib/player-memory.ts).
    // Injected as a clearly-labelled CROSS-MATCH block so the coach may
    // reference long-term patterns ("A Short'ta 23 kez öldün") but must not
    // treat it as this-round truth. Loaded best-effort: a memory failure never
    // blocks live round feedback. Length-capped to protect the token budget.
    let playerMemoryBlock: string | null = null;
    try {
      const memory = await loadPlayerMemory(auth.userId);
      const memoryContext = buildMemoryContext(memory, reqLang);
      if (memoryContext && memoryContext.trim().length > 0) {
        // buildMemoryContext is bounded (top-3 deaths + 1 map + 1 agent +
        // short tendency list) so it's already small; cap defensively.
        const cappedMemory = memoryContext.trim().slice(0, 1200);
        // Sarmalayıcı reqLang'de: EN'de Türkçe örnek cümle ("yine A Short'ta
        // öldün") model tarafından aynen taklit edilebiliyordu (canlı-test
        // 2026-07-18 dil sızıntısı). Blok zaten kullanıcıya-özel → cache'e ek
        // etkisi yok; tr'de bayt-bayt eski hali.
        playerMemoryBlock = reqLang === "en"
          ? `[CROSS-MATCH HISTORY — long-term player profile (from persisted data, NOT this round)]\n` +
            `This is the player's accumulated profile from past matches. You may reference it like a coach when relevant ` +
            `(e.g. "you died at A Short again — that is your recurring spot"); but this round's OCR data always takes priority. ` +
            `Do NOT alter these numbers, do NOT invent new statistics.\n${cappedMemory}`
          : `[CROSS-MATCH GEÇMİŞİ — uzun vadeli oyuncu profili (kalıcı veriden, bu round'a ait DEĞİL)]\n` +
            `Bu, oyuncunun geçmiş maçlardan birikmiş profilidir. İlgiliyse koç gibi referans verebilirsin ` +
            `(ör. "yine A Short'ta öldün — bu senin tekrar eden noktan"); ama bu round'un OCR verisi her zaman önceliklidir. ` +
            `Buradaki sayıları DEĞİŞTİRME, yeni istatistik UYDURMA.\n${cappedMemory}`;
      }
    } catch (e) {
      console.log(`[Aimlo AI] Vision: player memory unavailable: ${(e as Error).message}`);
    }
    if (playerMemoryBlock) systemSections.push(playerMemoryBlock);

    let patternContextBlock: string | null = null;
    if (reqPatternContext) {
      // Sanitize: user-influenced data (Rust client pattern string can be
      // tampered with by a malicious local proxy, so treat as untrusted).
      const cleanPattern = sanitizePromptInput(reqPatternContext, { max: 2000 });
      if (cleanPattern) {
        patternContextBlock = `[PATTERN CONTEXT — Rust Client]\n${cleanPattern}`;
      }
    }
    // Pattern context goes at the END of system message — keeps the cacheable
    // prefix above stable. Per-round changes don't bust the prefix cache.
    if (patternContextBlock) systemSections.push(patternContextBlock);

    const systemMessage = systemSections.join("\n\n---\n\n");
    // Council 2026-06-08: prove KB is a real share of the final system prompt.
    console.log(
      `[PROMPT] system=${systemMessage.length}b KB=${kbTotal}b ` +
      `pattern=${patternContextBlock?.length ?? 0}b ` +
      `KB-share=${systemMessage.length > 0 ? ((kbTotal / systemMessage.length) * 100).toFixed(0) : 0}%`,
    );

    // Build round context as compact JSON. Replaces previous verbose Turkish text
    // blocks with `═══` borders. Two wins:
    //   1. ~250 token saving per call (uncached, so direct $/call savings)
    //   2. Future-compatible with GPT-5 mini (text and structured both parse JSON cleanly)
    // All field names + values preserved. Only fields that are present (non-empty/non-null)
    // are included — no noise. Keys in Turkish so the model's existing instructions still
    // line up ("killerInfo", "deathLocation", etc. are referenced by name in SYSTEM_PROMPT).
    const reqBody = body as VisionRequest;
    const ctx: Record<string, unknown> = {};

    // Round durumu
    if (typeof reqBody.round === "number") ctx.round = reqBody.round;
    if (typeof reqBody.score === "string") ctx.score = reqBody.score;
    if (typeof reqBody.result === "string") ctx.result = reqBody.result.toUpperCase();
    if (typeof reqMap === "string") ctx.map = reqMap;
    if (typeof reqAgent === "string") ctx.agent = reqAgent;
    if (typeof reqBody.side === "string") {
      // Label the side so the model can't misread the raw token. Attack = sen
      // giriyorsun (entry/execute), Defense = sen tutuyorsun (hold/retake/save).
      ctx.side =
        reqBody.side === "attack"
          ? (reqLang === "en" ? "attack (ATTACK — you are entering the site)" : "attack (SALDIRI — sen siteye giriyorsun)")
          : reqBody.side === "defense"
            ? (reqLang === "en" ? "defense (DEFENSE — you are holding the site)" : "defense (SAVUNMA — sen siteyi tutuyorsun)")
            : reqBody.side;
    }
    if (typeof reqBody.mode === "string") ctx.mode = reqBody.mode;
    if (Array.isArray(reqEnemyComp) && reqEnemyComp.length > 0) {
      const comp = reqEnemyComp.filter(a => typeof a === "string" && a.length > 0).slice(0, 5);
      if (comp.length > 0) ctx.enemyRoster = comp;
    }

    // Ölüm bağlamı (OCR pixel truth — daha güvenilir, model SYSTEM_PROMPT'ta belirtildiği üzere
    // bu alanlara öncelik vermeli)
    if (reqBody.died === true) {
      ctx.died = true;
      if (typeof reqBody.deathTiming === "string") ctx.deathTiming = reqBody.deathTiming;
      if (typeof reqBody.killerInfo === "string" && reqBody.killerInfo.length > 0) {
        const safe = sanitizePromptInput(reqBody.killerInfo, { max: 120, collapseWhitespace: true });
        if (safe) ctx.killerInfo = safe;
      }
      if (typeof reqBody.deathLocation === "string" && reqBody.deathLocation.length > 0) {
        const safe = sanitizePromptInput(reqBody.deathLocation, { max: 50, collapseWhitespace: true });
        if (safe) ctx.deathLocation = safe;
      }
      if (typeof reqBody.deathAngle === "string" && reqBody.deathAngle.length > 0) {
        const safe = sanitizePromptInput(reqBody.deathAngle, { max: 30, collapseWhitespace: true });
        if (safe) ctx.deathAngle = safe;
      }
      // healthAtDeath deliberately NOT put into ctx (live-test #5, 2026-07-09):
      // the value is the last-alive OCR sample and can be seconds stale (a death
      // logged "HP 100"), so a numeric HP in the prompt invites a fabricated
      // "(41 HP)" claim. The number stays a classifyDeath signal below; the
      // death-type directive carries the qualitative "düşük canla" state instead.
      if (typeof reqBody.alliesAlive === "number") ctx.alliesAlive = reqBody.alliesAlive;
      if (typeof reqBody.enemiesAlive === "number") ctx.enemiesAlive = reqBody.enemiesAlive;
      if (typeof reqBody.roundTimerAtDeath === "number" && reqBody.roundTimerAtDeath > 0) {
        ctx.roundTimerAtDeath = Math.min(Math.max(reqBody.roundTimerAtDeath, 0), 140);
      }
      if (reqBody.ultReady === true) ctx.ultReady = true;
      if (reqBody.spikePlanted === true) ctx.spikePlanted = true;
      // FAZ2: trade truth (killfeed-derived). Meaningful BOTH ways — true = the
      // death was traded (don't scold the trade), false = solo/no-trade death.
      // Only set when actually present so guardUnprovenFacts can tell.
      if (typeof reqBody.tradedByAlly === "boolean") {
        ctx.tradedByAlly = reqBody.tradedByAlly;
      }
      if (typeof reqBody.tradeKillerAgent === "string" && reqBody.tradeKillerAgent.length > 0) {
        const safe = sanitizePromptInput(reqBody.tradeKillerAgent, { max: 30, collapseWhitespace: true });
        if (safe) ctx.tradeKillerAgent = safe;
      }
      // FAZ3: MEASURED route (minimap tracking). Present ONLY when the desktop
      // actually tracked the path — without it the AI must not infer a route.
      if (typeof reqBody.playerRoute === "string" && reqBody.playerRoute.length > 0) {
        const safe = sanitizePromptInput(reqBody.playerRoute, { max: 120, collapseWhitespace: true });
        if (safe) {
          ctx.playerRoute = safe;
          if (reqBody.routeConfidence === "high" || reqBody.routeConfidence === "medium" || reqBody.routeConfidence === "low") {
            ctx.routeConfidence = reqBody.routeConfidence;
          }
        }
      }
    } else if (reqBody.died === false) {
      ctx.died = false;
    }

    // Ekonomi
    if (typeof reqBody.economyType === "string" && reqBody.economyType.length > 0) {
      ctx.economyType = reqBody.economyType.slice(0, 20);
    }
    if (typeof reqBody.credits === "number") ctx.credits = reqBody.credits;
    if (typeof reqBody.loadout === "string" && reqBody.loadout.length > 0) {
      const safe = sanitizePromptInput(reqBody.loadout, { max: 30, collapseWhitespace: true });
      if (safe) ctx.loadout = safe;
    }

    // FAZ2: scoreboard performance (match-cumulative — valid on any round).
    if (typeof reqBody.playerKills === "number") ctx.playerKills = Math.min(Math.max(Math.trunc(reqBody.playerKills), 0), 99);
    if (typeof reqBody.playerDeaths === "number") ctx.playerDeaths = Math.min(Math.max(Math.trunc(reqBody.playerDeaths), 0), 99);
    if (typeof reqBody.playerAssists === "number") ctx.playerAssists = Math.min(Math.max(Math.trunc(reqBody.playerAssists), 0), 99);
    if (typeof reqBody.scoreboardKda === "string" && reqBody.scoreboardKda.length > 0) {
      const safe = sanitizePromptInput(reqBody.scoreboardKda, { max: 40, collapseWhitespace: true });
      if (safe) ctx.scoreboardKda = safe;
    }
    if (Array.isArray(reqBody.killfeedOrder) && reqBody.killfeedOrder.length > 0) {
      const events = reqBody.killfeedOrder
        .filter(e => typeof e === "string" && e.length > 0)
        .slice(0, 10)
        .map(e => sanitizePromptInput(e, { max: 60, collapseWhitespace: true }))
        .filter((e): e is string => !!e);
      if (events.length > 0) ctx.killfeedOrder = events;
    }

    // Pattern context (multi-round history) — kept as raw text since it's already
    // a free-form analysis string from Rust client (not structured fields).
    // .slice re-clamp (security audit M1): the bucket text is longer than the
    // number it replaces, so stripNumericHp can grow past sanitize's 2000 cap —
    // re-clamp so one field can't dominate the prompt budget.
    const patternBlock = (typeof reqBody.patternContext === "string" && reqBody.patternContext.length > 0)
      ? stripNumericHp(sanitizePromptInput(reqBody.patternContext, { max: 2000 }) || "", reqLang).slice(0, 2000)
      : "";

    // Death-Data Contract (Ölüm-Veri Sözleşmesi 2026-06-29): build the ground
    // truth ONCE here so BOTH the prompt fact-sheet AND the post-process guard
    // read the SAME object (no drift). Same helper is reused by report/route.ts.
    const factGround = buildFactGround(
      reqBody as unknown as Record<string, unknown>,
      ctx as unknown as Record<string, unknown>,
    );
    const factSheet = buildFactSheet(factGround, ctx as unknown as Record<string, unknown>, reqLang);

    // DEATH-TYPE directive (variety fix 2026-06-30, softi canlı-test): in one match all
    // rounds collapsed to the same idea ("açıkta kaldın + utility'siz girme") because the
    // model (reasoning_effort:minimal) couldn't pick the right block from the 300-line KB
    // and fell back to the two most generic ones. We DETERMINISTICALLY classify THIS death
    // from the OCR fields and tell the model exactly which lesson to give → different death
    // context yields a different concept by construction. No new AI call, no I/O; injected
    // into the USER message so the SYSTEM prompt-cache prefix is untouched (zero cache impact).
    let deathTypeDirective = "";
    let deathTypeOut: string | null = null;   // returned in the response (Phase-2 cross-round loop)
    if (reqBody.died === true) {
      const rh = (body as VisionRequest).roundHistory;
      const loc = (reqBody.deathLocation || "").toLowerCase();
      // CRITICAL (canlı 2026-06-30): roundHistory NOW includes the CURRENT round (recorded
      // on-death before this call), so the current death matched ITSELF → repeatedPosition was
      // true for EVERY death → everything classified repeat-angle → every feedback "o açıyı boş
      // bırak". EXCLUDE the current round (round_index !== current) so a repeat means a PRIOR round.
      const curRound = typeof reqBody.round === "number" ? reqBody.round : -1;
      const repeatedPosition = !!loc && Array.isArray(rh) && rh.some((r: Record<string, unknown>) =>
        r.died === true &&
        r.round_index !== curRound &&
        typeof r.death_position === "string" &&
        (r.death_position as string).toLowerCase().includes(loc) &&
        (r.position_confidence === "high" || r.position_confidence === "medium"),
      );
      // Akıllı-default sinyalleri (KB wiring 2026-07-19): universal.md'nin "Seri
      // Kayıp Sonrası Round" / "Uzatma ve Maç Sayısı Round'u" blokları yazılıydı
      // ama deterministik yoldan hiç seçilemiyordu. Seri roundHistory'den, ağırlık
      // score'dan türetilir. Mevcut round HARİÇ (on-death kaydedildiği için listede
      // olabilir; sonucu da henüz kesin değil). Ardışıklık round_index üzerinden
      // doğrulanır — atlanan ya da sonucu bilinmeyen round (outcome_known===false,
      // R3 UNKNOWN→loss düzeltmesinin alanı) filtrelenir → index boşluğu seriyi kırar.
      const priorRounds = (Array.isArray(rh) ? (rh as unknown as Record<string, unknown>[]) : [])
        .filter((r) =>
          typeof r.round_index === "number" &&
          r.round_index !== curRound &&
          typeof r.round_won === "boolean" &&
          r.outcome_known !== false,
        )
        .sort((a, b2) => (b2.round_index as number) - (a.round_index as number));
      let streakLen = 0;
      let streakWon: boolean | null = null;
      for (let i = 0; i < priorRounds.length; i++) {
        const r = priorRounds[i];
        if (i > 0 && (r.round_index as number) !== (priorRounds[i - 1].round_index as number) - 1) break;
        if (streakWon === null) streakWon = r.round_won === true;
        else if ((r.round_won === true) !== streakWon) break;
        streakLen++;
      }
      const lossStreak = streakWon === false && streakLen >= 3;
      const winStreak = streakWon === true && streakLen >= 3;
      // Uzatma/maç sayısı: score "11-12" biçiminden — taraflardan biri ≥12 (standart
      // 13-round modlarda maç sayısı; 12-12 ve sonrası uzatma). Kısa modlarda (örn.
      // Spike Rush) eşik hiç tetiklenmez → yanlış pozitif üretmez.
      const scoreM = typeof reqBody.score === "string" ? reqBody.score.match(/(\d{1,2})\D+(\d{1,2})/) : null;
      const highStakes = !!scoreM && (parseInt(scoreM[1], 10) >= 12 || parseInt(scoreM[2], 10) >= 12);
      const dtype = classifyDeath({
        side: reqBody.side,
        killerInfo: reqBody.killerInfo,
        deathLocation: reqBody.deathLocation,
        deathTiming: reqBody.deathTiming,
        // Stale-gate (2026-07-09): the desktop stamps how old the last-alive HP
        // sample was at death-confirm; the confirm itself lags 2-3s, so ≤4s means
        // "as fresh as physically possible". Older builds omit the field → legacy
        // behavior (use the value) so low-hp classification doesn't vanish there.
        healthAtDeath:
          typeof reqBody.hpSampleAgeSec !== "number" ||
          (Number.isFinite(reqBody.hpSampleAgeSec) && reqBody.hpSampleAgeSec >= 0 && reqBody.hpSampleAgeSec <= 4)
            ? reqBody.healthAtDeath
            : undefined,
        alliesAlive: reqBody.alliesAlive,
        enemiesAlive: reqBody.enemiesAlive,
        spikePlanted: reqBody.spikePlanted,
        // ult-in-pocket dalı (KB pipeline denetimi 2026-07-19): ctx.ultReady zaten
        // prompt'a giriyordu ama classifier'a hiç ulaşmıyordu — tek kablo burası.
        ultReady: reqBody.ultReady === true ? true : undefined,
        economyType: reqBody.economyType,
        tradedByAlly: reqBody.tradedByAlly,
        repeatedPosition,
        // KB wiring 2026-07-19: kendi silahın (op-loss), ajan (Clove ult istisnası),
        // seri/ağırlık akıllı-default sinyalleri. loadout classifier'da yalnız
        // sözlük-regex'le sınanır (prompt'a girmez) → ham geçirmek güvenli.
        loadout: reqBody.loadout,
        playerAgent: reqAgent,
        lossStreak,
        winStreak,
        highStakes,
      });
      deathTypeOut = dtype;
      // CROSS-ROUND ban (Phase 2-ready): prior rounds' death-types from roundHistory IF the
      // desktop stamps them (death_type). Until the desktop sends it this is empty → per-death
      // classification alone drives variety (Phase 1). When the desktop echoes deathType back,
      // the in-match same-type repetition ban activates with ZERO further backend change.
      const prevDeathTypes = (Array.isArray(rh) ? rh : [])
        .map((r: Record<string, unknown>) => (typeof r.death_type === "string" ? r.death_type : ""))
        .filter((s): s is string => s.length > 0) as import("@/lib/death-type").DeathType[];
      deathTypeDirective = buildDeathTypeDirective(dtype, prevDeathTypes, reqLang);
      console.log(
        `[Aimlo AI] death-type=${dtype} repeatPos=${repeatedPosition} ` +
        `streak=${lossStreak ? `L${streakLen}` : winStreak ? `W${streakLen}` : "-"} stakes=${highStakes} ` +
        `prevTypes=${prevDeathTypes.length}`,
      );
    }

    // SİLAH+KOMP işaretçisi (2026-07-08, death-type direktifi deseni): katil silahı
    // (killerInfo'dan sözlük-bağlı) + düşman komp arketipi (enemyRoster'dan sayım-bazlı)
    // deterministik türetilir, user-message'a sistem-prompt'taki SİLAH + KOMP REHBERİ'nin
    // ilgili bölümünü gösteren işaretçi eklenir. Sinyal yoksa boş → uydurma teşviki yok.
    const killerWeapon = reqBody.died === true ? extractKillerWeapon(reqBody.killerInfo) : null;
    const compArchetype = classifyCompArchetype(reqEnemyComp);
    // GÜVENLİK: loadout kullanıcı-kontrollü — direktife HAM reqBody.loadout değil,
    // yukarıda sanitizePromptInput'tan geçmiş ctx.loadout gömülür (max 30, tag/bidi
    // temiz). killerWeapon zaten sözlük-bağlı (yalnız whitelist silah adı çıkar),
    // compArchetype enum — ikisi injection taşıyamaz.
    const weaponCompDirective = buildWeaponCompDirective(
      killerWeapon,
      compArchetype,
      typeof ctx.loadout === "string" ? ctx.loadout : undefined,
      reqLang,
    );
    if (weaponCompDirective) {
      console.log(`[Aimlo AI] weapon=${killerWeapon?.name ?? "-"} comp=${compArchetype ?? "-"}`);
    }

    // Assemble JSON-formatted context — single block, no decorative borders, no header chrome.
    const ctxJson = Object.keys(ctx).length > 0 ? JSON.stringify(ctx, null, 2) : "";
    // Dil direktifi (2026-07-18): SYSTEM_PROMPT'un "kullanıcı dili İngilizce ise →
    // İngilizce" kuralına AÇIK sinyal. KB Türkçe olduğu için çeviri emri şart.
    // User-message'da → prompt-cache'e sıfır etki; tr'de boş → eski davranış birebir.
    const langDirective = reqLang === "en"
      ? `\n[LANGUAGE] The player's language is ENGLISH. Write deathAnalysis, enemyAnalysis and nextRoundSuggestion ONLY in natural English coach language (keep universal game terms: peek, trade, smoke, eco...). The knowledge blocks and some context/instruction lines are in Turkish — use them as source FACTS and LESSONS but always RESTATE them in English. NEVER copy a Turkish sentence or word into your output.`
      : "";
    // Dil-uzman denetimi 2026-07-18 ★3: EN'de dil emri EN BAŞA (model önce dili
    // görsün) + kalan başlıklar reqLang'de. TR yolunda sıra/bayt birebir eski.
    // VERİ SEVİYESİ direktifi (prompt-cache 2026-07-20): metin BİREBİR
    // buildPolicyBlock'un ürettiğiyle aynı — yalnız system prefix'i yerine user
    // mesajında taşınıyor. Gerekçe: roundHistory uzadıkça calibrating→low→
    // medium→high değişiyor ve prefix'in başındaki bu tek satır her geçişte
    // arkasındaki tüm KB'yi cache'ten düşürüyordu. Emsal: factSheet /
    // deathTypeDirective / weaponCompDirective de aynı sebeple user-msg'de.
    const confidenceDirective =
      CONFIDENCE_PROMPTS[visionConfidence] || CONFIDENCE_PROMPTS.medium;
    // HARİTA OKUNAMADI direktifi (2026-07-24, konsey — Omen/Unknown maçı): harita
    // tespit edilemediyse (mid-match/Spike Rush başlangıcı) modeli callout UYDURMAKTAN
    // menet — reality-checker'ın deterministik strip'i zaten uydurmayı siliyor, bu
    // direktif kaynağı kurutuyor (daha temiz çıktı, daha az strip). Yalnız Unknown'da
    // aktif; bilinen haritada BOŞ string → known-map davranışı bayt-aynı.
    const mapUnknownDirective = (!reqMap || mapKey(reqMap) === null)
      ? (reqLang === "en"
          ? `\n[MAP UNREADABLE] The map could not be read this match. Do NOT invent any callout/position name ("A Short", "B Main", "Mid"...). Use only an OCR-supplied deathLocation if present; otherwise anchor the lesson to agent + weapon + side + decision (trade/util order/timing). Those are specific and true without a map.`
          : `\n[HARİTA OKUNAMADI] Bu maçta harita okunamadı. HİÇBİR callout/yer adı UYDURMA ("A Short", "B Main", "Mid"...). Yalnız OCR'ın gönderdiği deathLocation varsa onu kullan; yoksa dersi ajan + silah + side + karar (trade/util-sırası/timing) üzerinden çapala. Bunlar harita olmadan da spesifik ve doğru.`)
      : "";
    const clientContext = reqLang === "en"
      ? langDirective +      // dil emri EN BAŞTA — Türkçe bloklardan önce
        factSheet +
        confidenceDirective +  // VERİ SEVİYESİ — EN'de dil emrinden sonra
        mapUnknownDirective +
        deathTypeDirective +
        weaponCompDirective +
        (ctxJson ? `\n\n[ROUND CONTEXT — OCR pixel truth, more reliable than the screenshot]\n${ctxJson}` : "") +
        (patternBlock ? `\n\n[PATTERN — recurring mistake across recent rounds. If present, reference it like a coach inside deathAnalysis or nextRoundSuggestion — do not open an extra field]\n${patternBlock}` : "")
      : factSheet +   // BİLİNEN/BİLİNMEYEN sözleşmesi EN BAŞTA — model olgu-sınırını önce görsün
        langDirective +        // dil emri — olgu sınırından hemen sonra (EN'de aktif)
        confidenceDirective +  // VERİ SEVİYESİ — system prefix'ten taşındı (per-round, user-msg)
        mapUnknownDirective +  // HARİTA OKUNAMADI — Unknown'da callout uydurmayı menet (per-round)
        deathTypeDirective +   // ÖLÜM-TİPİ çıpası — factSheet'ten hemen sonra (per-round, user-msg)
        weaponCompDirective +  // SİLAH+KOMP işaretçisi — statik rehberin bölüm seçicisi (per-round, user-msg)
        (ctxJson ? `\n\n[ROUND CONTEXT — OCR pixel truth, screenshot'tan güvenilir]\n${ctxJson}` : "") +
        (patternBlock ? `\n\n[PATTERN — son round'lardaki tekrar eden hata. Bu varsa deathAnalysis veya nextRoundSuggestion'da koç gibi referans ver — extra alan açma]\n${patternBlock}` : "");

    // Build round history context for the user prompt
    let userPromptWithHistory = (reqLang === "en" ? USER_PROMPT_EN : USER_PROMPT) + clientContext;
    const roundHistory = (body as VisionRequest).roundHistory;
    if (roundHistory && Array.isArray(roundHistory) && roundHistory.length > 0) {
      // Dil-duyarlı (canlı-test 2026-07-18 EN: model bu Türkçe olgu-cümlelerini
      // AYNEN kopyalayıp EN feedback'in içine Türkçe parça sızdırıyordu —
      // "bölgesinde 2 kez öldün"). Olgu-notları artık reqLang'de yazılır.
      const en = reqLang === "en";
      const historyLines = roundHistory.map((r: Record<string, unknown>) => {
        const status = r.died ? (en ? "died" : "öldü") : (en ? "survived" : "hayatta kaldı");
        const confidence = r.death_detected_confidence === "observed" ? (en ? " (confidence: observed)" : " (güven: observed)") : "";
        // Include position info if available
        const posInfo = r.death_position ? ` @ ${r.death_position}` : "";
        return `R${r.round_index}: ${status}${confidence}${posInfo}`;
      });
      const deathCount = roundHistory.filter((r) => r.died).length;
      const total = roundHistory.length;
      const patternNote = deathCount >= total * 0.5
        ? (en
            ? `Pattern: died in ${deathCount} of the last ${total} rounds → a repeating problem is proven`
            : `Pattern: Son ${total} round'un ${deathCount}'${deathCount > 1 ? "inde" : "unda"} ölüm → tekrar eden sorun kanıtlanmış`)
        : (en
            ? `${deathCount} death(s) in the last ${total} rounds`
            : `Son ${total} round'da ${deathCount} ölüm`);

      // Position pattern detection with temporal stability scoring
      const posEntries = roundHistory
        .filter((r: Record<string, unknown>) => r.died && r.death_position && (r.position_confidence === "high" || r.position_confidence === "medium"))
        .map((r: Record<string, unknown>) => ({
          pos: (r.death_position as string).toLowerCase(),
          round: r.round_index as number,
        }));

      const posCounts: Record<string, number> = {};
      posEntries.forEach(e => { posCounts[e.pos] = (posCounts[e.pos] || 0) + 1; });
      const topPos = Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0];

      // Temporal stability: check if deaths at same position are RECENT (not spread across 10+ rounds)
      let posNote = "";
      if (topPos && topPos[1] >= 2) {
        const matchingRounds = posEntries.filter(e => e.pos === topPos[0]).map(e => e.round);
        const recentRounds = matchingRounds.slice(-3); // last 3 occurrences
        const span = recentRounds.length >= 2 ? recentRounds[recentRounds.length - 1] - recentRounds[0] : 0;
        const isRecent = span <= 5; // within last 5 rounds = temporally clustered

        if (topPos[1] >= 3 && isRecent) {
          posNote = en
            ? `\nPosition pattern (STRONG — ${topPos[1]} times within the last ${span + 1} rounds): repeated deaths in the ${topPos[0]} area. The timing of this pattern is consistent too.`
            : `\nPosition pattern (GÜÇLÜ — ${topPos[1]} kez, son ${span + 1} round içinde): ${topPos[0]} bölgesinde tekrar eden ölüm. Bu pattern zamanlama olarak da tutarlı.`;
        } else if (topPos[1] >= 2) {
          posNote = en
            ? `\nPosition pattern (PROVEN): you died ${topPos[1]} times in the ${topPos[0]} area`
            : `\nPosition pattern (KANITLANMIŞ): ${topPos[0]} bölgesinde ${topPos[1]} kez öldün`;
        }
      }

      // Death zone pattern — repeated deaths at same location (NOT entry path inference)
      // We know WHERE the player died, NOT how they got there
      let deathZoneNote = "";
      if (posEntries.length >= 2) {
        // Check consecutive rounds dying at same position
        let consecutiveCount = 1;
        let consecutivePos = "";
        for (let i = 1; i < posEntries.length; i++) {
          if (posEntries[i].pos === posEntries[i - 1].pos && posEntries[i].round - posEntries[i - 1].round <= 2) {
            consecutiveCount++;
            consecutivePos = posEntries[i].pos;
          } else {
            consecutiveCount = 1;
          }
        }

        // Detect area change — died at different location than before
        const lastPos = posEntries[posEntries.length - 1]?.pos;
        const prevPositions = posEntries.slice(0, -1).map(e => e.pos);
        const isNewArea = lastPos && prevPositions.length > 0 && !prevPositions.includes(lastPos);

        if (consecutiveCount >= 3) {
          deathZoneNote = en
            ? `\nDeath zone pattern (STRONG): you died ${consecutiveCount} rounds in a row in the ${consecutivePos} area — you keep getting killed for free from that angle.`
            : `\nDeath zone pattern (GÜÇLÜ): ${consecutivePos} bölgesinde ${consecutiveCount} round art arda öldün — bu açıdan tekrar tekrar bedavaya öldürülüyorsun.`;
        } else if (consecutiveCount >= 2) {
          deathZoneNote = en
            ? `\nDeath zone pattern: back-to-back deaths in the ${consecutivePos} area — this area may be a problem.`
            : `\nDeath zone pattern: ${consecutivePos} bölgesinde art arda ölüm — bu bölge sorun oluşturuyor olabilir.`;
        } else if (isNewArea) {
          deathZoneNote = en
            ? `\nDeath area changed: in earlier rounds you were in the ${prevPositions[prevPositions.length - 1]} area, now ${lastPos}.`
            : `\nÖlüm bölgesi değişti: önceki round'larda ${prevPositions[prevPositions.length - 1]} bölgesindeydin, şimdi ${lastPos}.`;
        }
      }

      userPromptWithHistory += en
        ? `\n\nRecent round history (observed):\n${historyLines.join("\n")}\n${patternNote}${posNote}${deathZoneNote}`
        : `\n\nSon round geçmişi (gözlemlenmiş):\n${historyLines.join("\n")}\n${patternNote}${posNote}${deathZoneNote}`;
    }

    // Sandviç tekniği (dil-uzman denetimi ★3): üretimden hemen önceki SON satır
    // dil emri olsun — model son talimata en çok ağırlık verir. TR'de eklenmez.
    if (reqLang === "en") {
      userPromptWithHistory += `\n\n[REMINDER] Output language: ENGLISH ONLY. All three fields in natural English coach voice — never a Turkish word.`;
    }

    // Call OpenAI GPT-5 mini (Chat Completions API)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // GPT-5 mini — cheap, vision-capable, JSON-schema strict mode.
        model: "gpt-5-mini",
        // GPT-5 family uses max_completion_tokens (max_tokens deprecated for these).
        max_completion_tokens: resolvedMaxTokens,
        // Strict JSON enforcement — server rejects malformed schema. Eliminates
        // the markdown-fence/preamble extraction logic we needed with Anthropic.
        response_format: { type: "json_schema", json_schema: buildRoundFeedbackSchema(reqLang) },
        // Minimal reasoning effort — coach output is template-fill, not chain-of-thought.
        // Saves output tokens + latency. Bump to "low" or "medium" if quality drops.
        reasoning_effort: "minimal",
        messages: [
          { role: "system", content: systemMessage },
          {
            role: "user",
            content: buildUserContent(reqBody.died, body.image, resolvedMediaType, userPromptWithHistory),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      const errorBody = await response.text().catch(() => "unreadable");
      // Security audit 2026-06-11 (M-2): keep the upstream body in the SERVER
      // log only — do NOT reflect it to the client (info-disclosure habit;
      // the desktop branches on upstreamStatus alone).
      console.error(`[Aimlo AI] Vision API ${response.status}: ${errorBody.slice(0, 500)}`);
      return errorResponse(
        "ai_upstream_error",
        `OpenAI API returned ${response.status}`,
        502,
        { upstreamStatus: response.status },
      );
    }

    const data = await response.json();
    clearTimeout(timeoutId);

    // OpenAI usage object: prompt_tokens, completion_tokens, prompt_tokens_details.cached_tokens
    const promptTokens = data?.usage?.prompt_tokens ?? 0;
    const completionTokens = data?.usage?.completion_tokens ?? 0;
    const cachedTokens = data?.usage?.prompt_tokens_details?.cached_tokens ?? 0;
    const freshTokens = promptTokens - cachedTokens;
    const finishReason = data?.choices?.[0]?.finish_reason ?? "unknown";
    const cacheStatus = cachedTokens > 0 ? "HIT" : "MISS";
    const cacheRatio = promptTokens > 0 ? ((cachedTokens / promptTokens) * 100).toFixed(1) : "0.0";
    console.log(`[CACHE ${cacheStatus}] cached=${cachedTokens} fresh=${freshTokens} total_in=${promptTokens} hit_ratio=${cacheRatio}% output=${completionTokens} finish=${finishReason}`);
    // Persist usage for the admin /cost panel (non-blocking, fail-safe).
    saveAiUsage({ userId: auth.userId, routeType: "vision", model: data?.model ?? "gpt-5-mini", promptTokens, completionTokens, cachedTokens });

    const text: string = data?.choices?.[0]?.message?.content || "";
    if (!text) {
      console.error("[Aimlo AI] Empty response from API. Full data:", JSON.stringify(data).slice(0, 500));
      return errorResponse("ai_empty_response", "OpenAI returned empty content", 502, { finishReason });
    }
    // OpenAI strict JSON mode guarantees valid JSON — but keep extractor as defense.
    const stopReason = finishReason; // alias for downstream code that still reads `stopReason`

    // ── Robust JSON parser: handles markdown fences, trailing junk, BOMs ──
    function extractJSON(raw: string): { ok: true; obj: unknown } | { ok: false; reason: string } {
      let s = raw.trim();
      // Strip BOM
      if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
      // Strip markdown code fences (```json ... ``` or ``` ... ```)
      const fenceMatch = s.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
      if (fenceMatch) s = fenceMatch[1].trim();
      // Try direct parse
      try { return { ok: true, obj: JSON.parse(s) }; } catch {}
      // Find first { ... } balanced span
      const start = s.indexOf("{");
      if (start === -1) return { ok: false, reason: "no opening brace" };
      let depth = 0;
      let inStr = false;
      let escape = false;
      let end = -1;
      for (let i = start; i < s.length; i++) {
        const ch = s[i];
        if (escape) { escape = false; continue; }
        if (ch === "\\") { escape = true; continue; }
        if (ch === '"') inStr = !inStr;
        if (inStr) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (end === -1) return { ok: false, reason: "unterminated JSON object" };
      const candidate = s.slice(start, end + 1);
      try { return { ok: true, obj: JSON.parse(candidate) }; } catch (e) {
        return { ok: false, reason: `parse error: ${(e as Error).message}` };
      }
    }

    const parseResult = extractJSON(text);
    if (!parseResult.ok) {
      console.error(`[Aimlo AI] JSON parse failed (${parseResult.reason}). Raw text:`, text.slice(0, 500));
      return errorResponse("ai_invalid_json", `Model output was not valid JSON: ${parseResult.reason}`, 502, { rawPreview: text.slice(0, 300), stopReason });
    }
    const parsed: unknown = parseResult.obj;

    // ── Coerce shape: enemyAnalysis can come as string, normalize to array ──
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.enemyAnalysis === "string") {
        // Split by newline, semicolon, or " | " or just wrap as single
        const s = obj.enemyAnalysis as string;
        const parts = s.split(/\n|;|\s\|\s/).map((p) => p.trim()).filter((p) => p.length > 0);
        obj.enemyAnalysis = parts.length > 0 ? parts : [s];
      }
      // Nullish-safe defaults so isValidFeedbackShape passes
      if (typeof obj.deathAnalysis !== "string") obj.deathAnalysis = "";
      if (typeof obj.nextRoundSuggestion !== "string") obj.nextRoundSuggestion = "";
      if (!Array.isArray(obj.enemyAnalysis)) obj.enemyAnalysis = [];
    }

    if (isValidFeedbackShape(parsed)) {
      const fb = parsed as RoundFeedback;

      // Reality check against round memory (modifies text if AI claims contradict observed data)
      const memoryForCheck = (roundHistory || []).map((r: Record<string, unknown>) => ({
        round_index: r.round_index as number,
        died: !!r.died,
        death_position: r.death_position as string | null | undefined,
        position_confidence: r.position_confidence as string | undefined,
      }));
      // Present-round ground truth (factGround) built ABOVE via buildFactGround
      // (Ölüm-Veri Sözleşmesi 2026-06-29) — same object that produced the prompt
      // fact-sheet, so the guard strips exactly the facts the model was told were
      // unknown (killer/weapon/location/headshot/alive/spike/route/trade).
      // reqLang geçirilir (denetim 2026-07-19 F5): guard/rewrite replacement dili
      // artık özel-harf heuristiği değil, isteğin kendi dili ("Cypher seni B Main'de
      // vurdu" gibi özel-harfsiz TR cümleye "an enemy" enjekte edilmesin).
      // reqMap (canlı bug 2026-07-21): oynanan haritaya ait OLMAYAN callout'lar
      // ayıklanır — Lotus maçında "A Short" uydurması gibi. Harita bilinmiyorsa
      // (Unknown / gelmedi) davranış eskisiyle aynı.
      const checkedAnalysis = realityCheck(fb.deathAnalysis, memoryForCheck, factGround, "death", reqLang, reqMap);
      const checkedSuggestion = realityCheck(fb.nextRoundSuggestion, memoryForCheck, factGround, "suggestion", reqLang, reqMap);
      if (checkedAnalysis.modified || checkedSuggestion.modified) {
        console.log(`[Aimlo AI] Reality check: deathAnalysis rewrite=${checkedAnalysis.rewriteLevel}, suggestion rewrite=${checkedSuggestion.rewriteLevel}`);
      }

      // Note: coachInsight field removed — purple "KOÇ İÇGÖRÜSÜ" block dropped from overlay.
      // Pattern-aware insight now folds into deathAnalysis or nextRoundSuggestion when relevant.

      // Final coach text (clean BEFORE slice — plainify/apostrophe can change length).
      // Empty-guard (security audit L1): stripNumericHp's deletion forms can empty a
      // text that was ONLY an HP label — keep the reality-checked original then
      // (mirrors the enemyAnalysis/safeSuggestion fallback pattern below).
      const cleanedAnalysis = cleanCoachText(checkedAnalysis.text, reqLang);
      const deathAnalysisOut = clampWords(
        enforceAgentKit(cleanedAnalysis && cleanedAnalysis.trim() ? cleanedAnalysis : checkedAnalysis.text, reqAgent),
        350,
      );
      // enemyAnalysis de reality-check'ten GEÇER (grounding audit 2026-06-26: bu dizi
      // önceden HİÇ denetlenmiyordu → killer/rota/sayı uydurması elenmeden çıkıyordu).
      // kind:"suggestion" → tümü stripped olursa "" döner, orijinali koru.
      const enemyAnalysisOut = fb.enemyAnalysis.slice(0, 2).map((s) => {
        const c = realityCheck(String(s), memoryForCheck, factGround, "suggestion", reqLang, reqMap);
        const safe = c.text && c.text.trim() ? c.text : String(s);
        return clampWords(enforceAgentKit(cleanCoachText(safe, reqLang), reqAgent), 180);
      });
      // Cycle 3: if reality-check emptied the suggestion (every sentence was an
      // unproven repetition claim → "suggestion" kind returns "" rather than a
      // past-tense death stub), keep the model's original advice — still a valid
      // actionable next-round plan. Prevents the S9-class stub regression.
      const safeSuggestion = checkedSuggestion.text && checkedSuggestion.text.trim()
        ? checkedSuggestion.text
        : fb.nextRoundSuggestion;
      const nextRoundOut = clampWords(enforceAgentKit(cleanCoachText(safeSuggestion, reqLang), reqAgent), 350);

      // Live match feed (admin /live + /feedback): one row per death with the ACTUAL
      // coaching the user received — piggybacks this vision call, ZERO extra AI cost,
      // non-blocking + fail-safe.
      saveMatchEvent({
        userId: auth.userId,
        matchId: (body as VisionRequest).matchId ?? null,
        kind: "death",
        map: reqMap ?? null,
        agent: reqAgent ?? null,
        side: (body as VisionRequest).side ?? null,
        roundNo: (body as VisionRequest).round ?? null,
        score: (body as VisionRequest).score ?? null,
        deathLoc: (body as VisionRequest).deathLocation ?? null,
        feedback: { deathAnalysis: deathAnalysisOut, enemyAnalysis: enemyAnalysisOut, nextRoundSuggestion: nextRoundOut },
      });

      // Copy meta fields from REQUEST (desktop is source of truth for round/score/result/died).
      return NextResponse.json({
        round: typeof reqBody.round === "number" ? reqBody.round : 0,
        score: typeof reqBody.score === "string" ? reqBody.score.slice(0, 10) : "?-?",
        result: reqBody.result === "win" || reqBody.result === "loss" || reqBody.result === "WON" || reqBody.result === "LOST"
          ? (reqBody.result.toLowerCase() === "won" ? "win" : reqBody.result.toLowerCase() === "lost" ? "loss" : reqBody.result.toLowerCase())
          : "loss",
        died: typeof reqBody.died === "boolean" ? reqBody.died : true,
        deathAnalysis: deathAnalysisOut,
        enemyAnalysis: enemyAnalysisOut,
        nextRoundSuggestion: nextRoundOut,
        patternData: null,
        deathType: deathTypeOut,   // Phase-2: desktop stores → echoes back in roundHistory[].death_type
      });
    }

    console.error("[Aimlo AI] Response shape validation failed. Parsed:", JSON.stringify(parsed).slice(0, 300));
    return errorResponse(
      "ai_invalid_shape",
      "Model output missing required fields (deathAnalysis/enemyAnalysis/nextRoundSuggestion)",
      502,
      { parsedPreview: JSON.stringify(parsed).slice(0, 300) },
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Aimlo AI] Vision request timed out");
      return errorResponse("ai_timeout", `OpenAI request exceeded ${AI_TIMEOUT_MS}ms`, 504);
    }
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[Aimlo AI] Vision route error:", msg);
    return errorResponse("ai_internal_error", msg, 500);
  }
}
