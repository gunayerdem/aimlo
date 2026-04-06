import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { realityCheck } from "@/lib/reality-checker";
import { loadVisionKnowledge } from "@/lib/knowledge-loader";

/**
 * POST /api/ai/vision
 * Analyzes a Valorant game screenshot for real-time coaching feedback.
 * Used by the desktop overlay as a backend proxy for Anthropic Vision API.
 *
 * - Requires authenticated user (Supabase JWT)
 * - Rate limited
 * - Anthropic API key is server-side only
 * - Accepts base64-encoded PNG screenshot
 */

const AI_TIMEOUT_MS = 15_000;
const MAX_PAYLOAD_BYTES = 5_000_000; // 5MB max (base64 images are large)
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `Sen AIMLO, Valorant koçusun. Screenshot'tan round feedback ver, JSON döndür.

KURALLAR:
- deathAnalysis: SADECE 1 sorun. Öncelik: tekrar eden pattern > mekanik hata > tek gözlem.
- nextRoundSuggestion: SADECE 1 aksiyon.
- enemyAnalysis: max 2-3 madde.
- Kanıtlı bilgi kesin dille, çıkarım ihtimalli dille ("olabilir","muhtemelen"). Kanıtsız tarihsel iddia YASAK.
- Tek round = pattern iddiası YASAK. 2+ round aynı pozisyon = "tekrar eden".
- Ölüm pozisyonu ≠ giriş yolu. Sadece NEREDE öldüğünü biliyoruz.

patternData (opsiyonel, sadece tespit edileni doldur — emin değilsen KOYMA):
deathLocation: string — callout, küçük harf+underscore ("a_long","b_main")
peekType: "dry_peek"|"util_peek"|"jiggle"|"wide_swing"|"holding"|"unknown"
utilUsed: boolean — ölümden önce ability kullandı mı
traded: boolean — takım trade aldı mı
deathTiming: "early"|"mid"|"late"|"post_plant"
enemyWeapon: string — küçük harf ("vandal","operator")
mapControl: "full_control"|"partial_control"|"no_control"|"contested"
wasRepeatedMistake: boolean — patternContext'te benzer hata varsa true
Hayatta kalınan round: sadece mapControl+utilUsed doldur.`;

const USER_PROMPT = `Valorant round sonu screenshot'u. Türkçe coaching feedback ver.

ÖLÜM POZİSYONU — 4 sinyal kontrol et: minimap, sahne geometrisi, kamera yönü, çevresel ipuçları.
2+ sinyal aynı bölge → confidence=high. 1 sinyal → medium. Çelişi/yok → "unknown". Uydurma YASAK.
Alt-bölge ekle mümkünse: "B Main entry", "A Site back left".

MEKANİK HATA — sadece GÖRÜNEN kanıtlar (açık kalma, açı tipi, cover durumu, tehdit yönü).
2+ sinyal → hata iddiası. 1 sinyal → "olabilir". 0 → iddia YASAK.
Trade/çatışma anı = hata DEĞİL. "aim'ini geliştir" YASAK.

JSON döndür:
{"round":number,"score":"X-Y","result":"win"|"loss","died":boolean,"deathAnalysis":"...","enemyAnalysis":["..."],"nextRoundSuggestion":"...","deathPosition":"bölge|unknown","positionConfidence":"high"|"medium"|"low","positionSignals":0-4,"patternData":{"deathLocation":"a_long","peekType":"dry_peek","utilUsed":false,"traded":false,"deathTiming":"early","enemyWeapon":"operator","mapControl":"no_control","wasRepeatedMistake":true}}`;

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

const DEFAULT_MAX_TOKENS = 450;
const MAX_TOKENS_CAP = 512;

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

const PATTERN_DATA_ALLOWED_KEYS = [
  "deathLocation", "peekType", "utilUsed", "traded",
  "deathTiming", "enemyWeapon", "mapControl", "wasRepeatedMistake",
] as const;

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
  killerAgent?: string | null;
  killerWeapon?: string | null;
  killfeedConfidence?: string;
  deathPosition?: string | null;
  positionConfidence?: string;
  positionSignals?: number;
  patternData?: unknown;
};

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
  // Max size check (base64 is ~33% larger than decoded)
  if (img.length > MAX_IMAGE_BYTES * 1.4) return false;
  // Validate base64 character set (check first 1000 chars for performance)
  if (!BASE64_REGEX.test(img.slice(0, 1000))) return false;
  // Check PNG header in decoded bytes (first 4 bytes: 0x89 0x50 0x4E 0x47)
  try {
    const header = atob(img.slice(0, 12));
    const isPng = header.charCodeAt(0) === 0x89 && header.charCodeAt(1) === 0x50;
    const isJpeg = header.charCodeAt(0) === 0xFF && header.charCodeAt(1) === 0xD8;
    if (!isPng && !isJpeg) return false;
  } catch {
    return false; // Invalid base64
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

const DEFAULT_FEEDBACK: RoundFeedback = {
  round: 0,
  score: "?-?",
  result: "loss",
  died: true,
  deathAnalysis: "Analiz yapılamadı.",
  enemyAnalysis: ["Analiz yapılamadı."],
  nextRoundSuggestion: "Dikkatli oyna, bilgi topla.",
  killerAgent: null,
  killerWeapon: null,
  killfeedConfidence: "unreadable",
  deathPosition: null,
  positionConfidence: "low",
  positionSignals: 0,
};

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

    // Auth + rate limit (uses "feedback" tier — 15/min)
    const auth = await verifyAuthAndRateLimit(request, "feedback");
    if (!auth.ok) return auth.response;

    // Parse body
    const body = await request.json().catch(() => null);
    if (!isValidVisionRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { image: string }" },
        { status: 400 },
      );
    }

    // Get API key
    const apiKey = process.env.AIMLO_AI_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[Aimlo AI] Vision: no API key configured");
      return NextResponse.json(DEFAULT_FEEDBACK);
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

    const kb = loadVisionKnowledge({
      map: reqMap,
      agent: reqAgent,
      rank: reqRank,
      enemyAgents: reqEnemyComp,
    });

    if (kb.files.length > 0) {
      console.log(`[KB] selected: ${kb.files.join(", ")}`);
    }

    // Build system prompt array — static prompt (cached) + dynamic KB + patternContext
    const systemBlocks: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }> = [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ];

    if (kb.content) {
      systemBlocks.push({
        type: "text",
        text: kb.content,
        cache_control: { type: "ephemeral" },
      });
    }

    if (reqPatternContext) {
      systemBlocks.push({
        type: "text",
        text: `[PATTERN CONTEXT — Rust Client]\n${reqPatternContext.slice(0, 2000)}`,
      });
    }

    // Build round history context for the user prompt
    let userPromptWithHistory = USER_PROMPT;
    const roundHistory = (body as VisionRequest).roundHistory;
    if (roundHistory && Array.isArray(roundHistory) && roundHistory.length > 0) {
      const historyLines = roundHistory.map((r: Record<string, unknown>) => {
        const status = r.died ? "öldü" : "hayatta kaldı";
        const confidence = r.death_detected_confidence === "observed" ? " (güven: observed)" : "";
        // Include position info if available
        const posInfo = r.death_position ? ` @ ${r.death_position}` : "";
        return `R${r.round_index}: ${status}${confidence}${posInfo}`;
      });
      const deathCount = roundHistory.filter((r) => r.died).length;
      const total = roundHistory.length;
      const patternNote = deathCount >= total * 0.5
        ? `Pattern: Son ${total} round'un ${deathCount}'${deathCount > 1 ? "inde" : "unda"} ölüm → tekrar eden sorun kanıtlanmış`
        : `Son ${total} round'da ${deathCount} ölüm`;

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
          posNote = `\nPosition pattern (GÜÇLÜ — ${topPos[1]} kez, son ${span + 1} round içinde): ${topPos[0]} bölgesinde tekrar eden ölüm. Bu pattern zamanlama olarak da tutarlı.`;
        } else if (topPos[1] >= 2) {
          posNote = `\nPosition pattern (KANITLANMIŞ): ${topPos[0]} bölgesinde ${topPos[1]} kez öldün`;
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
          deathZoneNote = `\nDeath zone pattern (GÜÇLÜ): ${consecutivePos} bölgesinde ${consecutiveCount} round art arda öldün — bu bölgede tekrar cezalandırılıyorsun.`;
        } else if (consecutiveCount >= 2) {
          deathZoneNote = `\nDeath zone pattern: ${consecutivePos} bölgesinde art arda ölüm — bu bölge sorun oluşturuyor olabilir.`;
        } else if (isNewArea) {
          deathZoneNote = `\nÖlüm bölgesi değişti: önceki round'larda ${prevPositions[prevPositions.length - 1]} bölgesindeydin, şimdi ${lastPos}.`;
        }
      }

      userPromptWithHistory += `\n\nSon round geçmişi (gözlemlenmiş):\n${historyLines.join("\n")}\n${patternNote}${posNote}${deathZoneNote}`;
    }

    // Call Anthropic Vision
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: resolvedMaxTokens,
        system: systemBlocks,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: resolvedMediaType,
                  data: body.image,
                },
              },
              {
                type: "text",
                text: userPromptWithHistory,
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      console.error(`[Aimlo AI] Vision API ${response.status}`);
      return NextResponse.json(DEFAULT_FEEDBACK);
    }

    const data = await response.json();
    clearTimeout(timeoutId);

    // Log prompt cache metrics
    const cacheCreation = data?.usage?.cache_creation_input_tokens ?? 0;
    const cacheRead = data?.usage?.cache_read_input_tokens ?? 0;
    const inputTokens = data?.usage?.input_tokens ?? 0;
    console.log(`[CACHE] creation=${cacheCreation}, read=${cacheRead}, input=${inputTokens}`);

    const text: string = data?.content?.[0]?.text || "";

    // Parse JSON from response
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(DEFAULT_FEEDBACK);
        }
      } else {
        return NextResponse.json(DEFAULT_FEEDBACK);
      }
    }

    if (isValidFeedbackShape(parsed)) {
      const fb = parsed as RoundFeedback;
      // Validate killfeed data — only pass if confidence is meaningful
      const validAgents = ["jett","reyna","raze","phoenix","neon","yoru","iso","waylay","sage","cypher","killjoy","chamber","deadlock","vyse","veto","omen","brimstone","viper","astra","harbor","clove","miks","sova","fade","skye","kayo","kay/o","gekko","breach","tejo"];
      const rawKiller = typeof fb.killerAgent === "string" ? fb.killerAgent.toLowerCase().trim() : null;
      const killerAgent = rawKiller && validAgents.includes(rawKiller) ? fb.killerAgent!.trim() : null;
      const killerWeapon = typeof fb.killerWeapon === "string" && fb.killerWeapon.trim().length > 1 ? fb.killerWeapon.trim().slice(0, 30) : null;
      const killfeedConfidence = typeof fb.killfeedConfidence === "string" && ["high","medium","low","unreadable"].includes(fb.killfeedConfidence) ? fb.killfeedConfidence : "unreadable";

      // Multi-signal death position extraction
      const rawPos = (fb as Record<string, unknown>).deathPosition;
      const deathPosition = typeof rawPos === "string" && rawPos !== "unknown" && rawPos.length > 1
        ? (rawPos as string).slice(0, 50)
        : "unknown";
      const posConfRaw = typeof (fb as Record<string, unknown>).positionConfidence === "string"
        ? (fb as Record<string, unknown>).positionConfidence as string
        : "low";
      const posSignals = typeof (fb as Record<string, unknown>).positionSignals === "number"
        ? (fb as Record<string, unknown>).positionSignals as number
        : 0;

      // CONSENSUS GATE: require 2+ signals for position to be stored
      // Single signal → downgrade to low confidence (won't be stored in memory)
      let positionConfidence: string;
      if (deathPosition === "unknown" || posSignals < 1) {
        positionConfidence = "low";
      } else if (posSignals >= 2 && posConfRaw === "high") {
        positionConfidence = "high";
      } else if (posSignals >= 2) {
        positionConfidence = "medium";
      } else {
        // Single signal → force low (won't enter memory)
        positionConfidence = "low";
      }

      // Reality check: verify AI claims against actual round memory
      const memoryForCheck = (roundHistory || []).map((r: Record<string, unknown>) => ({
        round_index: r.round_index as number,
        died: !!r.died,
        death_position: r.death_position as string | null | undefined,
        position_confidence: r.position_confidence as string | undefined,
      }));

      const checkedAnalysis = realityCheck(fb.deathAnalysis, memoryForCheck);
      const checkedSuggestion = realityCheck(fb.nextRoundSuggestion, memoryForCheck);

      if (checkedAnalysis.modified || checkedSuggestion.modified) {
        console.log(`[Aimlo AI] Reality check: deathAnalysis rewrite=${checkedAnalysis.rewriteLevel}, suggestion rewrite=${checkedSuggestion.rewriteLevel}`);
      }

      // Extract and sanitize patternData (whitelist filter — only known fields pass)
      let patternData: PatternData | null = null;
      try {
        patternData = sanitizePatternData((fb as Record<string, unknown>).patternData);
      } catch {
        console.log("[PATTERN-DATA] parse error — returning null");
      }
      console.log(`[PATTERN-DATA] ${JSON.stringify(patternData)}`);

      return NextResponse.json({
        round: typeof fb.round === "number" ? fb.round : 0,
        score: typeof fb.score === "string" ? fb.score.slice(0, 10) : "?-?",
        result: fb.result === "win" ? "win" : "loss",
        died: !!fb.died,
        deathAnalysis: checkedAnalysis.text.slice(0, 500),
        enemyAnalysis: fb.enemyAnalysis.slice(0, 5).map((s) => String(s).slice(0, 200)),
        nextRoundSuggestion: checkedSuggestion.text.slice(0, 500),
        deathPosition: deathPosition !== "unknown" && positionConfidence !== "low" ? deathPosition : null,
        positionConfidence: positionConfidence,
        positionSignals: posSignals,
        patternData,
      });
    }

    return NextResponse.json(DEFAULT_FEEDBACK);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Aimlo AI] Vision request timed out");
    } else {
      console.error(
        "[Aimlo AI] Vision route error:",
        err instanceof Error ? err.message : "unknown",
      );
    }
    return NextResponse.json(DEFAULT_FEEDBACK);
  }
}
