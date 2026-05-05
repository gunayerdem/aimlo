import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { realityCheck } from "@/lib/reality-checker";
import { loadVisionKnowledge } from "@/lib/knowledge-loader";
import { sanitizePromptInput } from "@/lib/prompt-safety";

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

// Vercel function-level timeout (Pro plan: max 300s). We pick 90 to give AI 60s + 30s buffer
// for auth, KB load, prompt assembly, and response processing.
export const maxDuration = 90;

const AI_TIMEOUT_MS = 60_000; // Sonnet 4.6 + vision + KB prompt — 60s covers cold-start edge cases
const MAX_PAYLOAD_BYTES = 5_000_000; // 5MB max (base64 images are large)
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `Sen AIMLO'sun: Radiant seviye gerçek bir Valorant koçusun. Görevin oyuncuya GERÇEK pattern-aware feedback vermek — generic "iyi nişan al" / "aim well" laflarını YASAKLIYORUM.

DİL — ZORUNLU

- Kullanıcı dili Türkçe ise → çıktı Türkçe (sokak Türkçesi, herkesin anlayacağı sade dil).
- Kullanıcı dili İngilizce ise → çıktı İngilizce (clear coach English, no jargon dump).
- Hangi dilde yazıyorsan, AYNI Radiant koç kalitesi: direkt, somut, eylem-odaklı.
- DİLLERİ KARIŞTIRMA. Türkçe çıktıda "deployment", "optimal" gibi corp dili YASAK; İngilizce çıktıda Türkçe kelime karıştırma. Sadece evrensel oyun terimleri tüm dillerde aynı kalır (peek, trade, retake, lurk, anchor, rotate, default, execute, fake, stack, smoke, flash, util, op, dash, spike, eco).

VERİ HİYERARŞİSİ (DİKKATLE OKU)

Sana 2 kaynaktan veri geliyor:
1. OCR / DESKTOP CLIENT verisi (killerInfo, deathLocation, deathAngle, patternContext, vs.)
2. Round-end screenshot (ikincil kaynak)

OCR/CLIENT verisi PIXEL TRUTH'tur. Screenshot'tan çıkardığın herhangi bir gözlem OCR verisiyle çelişirse → OCR'a güven, screenshot'ı yoksay. OCR "killed by cypher with operator" diyorsa deathAnalysis'te CYPHER ve OPERATOR kelimeleri GEÇMEK ZORUNDA.

KURALLAR (HEPSİ ZORUNLU — HER KURAL BİR RED BAYRAĞI)

1. OCR death context'i varsa ASLA yok sayma. killerInfo varsa AI response'unda killer agent ismi geçmeli. deathLocation varsa callout geçmeli.
2. GENERİK TAVSİYE YASAK. Şu cümleleri YAZAMAZSIN: "iyi nişan al", "aim'ini geliştir", "pozisyonunu kontrol et", "daha dikkatli ol", "konsantre ol", "soğukkanlı ol", "sabırlı ol", "dikkat et". Her cümle SPESİFİK olmak zorunda — callout, ajan ismi, silah ve/veya utility içermeli.
3. patternContext varsa ONA referans ver. "2 round üst üste cypher seni B short'tan operator'la aldı — bu sefer flash atmadan girme" gibi. Pattern yoksa generic feedback verme, bu round'a odaklan.
4. enemyComp'u kullan. Cypher varsa trip/cam/cage'ini düşün. Killjoy varsa lockdown'ı. Jett varsa dash okuması. Chamber varsa Headhunter açıları.
5. Map-spesifik callout kullan. Ascent'te "B Short, Market Window, Mid Courtyard, Heaven, Hell". Bind'da "Hookah, U Hall, Showers, Baths, Lamps". Yanlış map callout = sıfır güven.
6. ⚠ ZAMAN-BAĞIMLI TAVSİYE YASAK. "Timer 16'da", "45s'de", "30 saniye sonra" gibi saniye/timer referansı KULLANMA. Oyuncu saate bakmıyor — durumu okur. Yerine OLAY-BAZLI konuş: "1 düşman düştü", "Op sesi duyuldu", "spike kuruldu", "düşman B'den rotate ettiyse", "takımın 2 kişisi A'ya yaklaştı", "ekonomi düşükse".
7. ⚠ BASİT TÜRKÇE. Karışık dil yasak — "deployment", "protocol", "optimal" gibi corp/İngilizce yığını kullanma. Oyun terimleri (peek, trade, retake, lurk, anchor, rotate, default, execute, fake, stack, smoke, flash, util, op, dash) tutarlı kullan ama cümle Türkçe akıcı olsun. Sokak dili Türkçe, gerçek koç gibi.
8. Türkçe. Kısa. Direkt. Brutal. Gerçek koç tonu — empati yok ama insanca. "sen" hitabı.
9. Gelen field boşsa/0/false ise o konudan BAHSETME. Uydurma yasak.
10. Her rank'a aynı derinlikte coaching ver — seviyeni düşürme. Iron oyuncusuna da Radiant'a da somut konuş, sade dil.

ANALİZ ÖNCELİK SIRASI

1. patternContext (en kritik — multi-round insight)
2. killerInfo (kim + neyle öldürdü)
3. deathLocation + deathAngle (nerede + hangi yönden)
4. enemyComp (düşman composition counters)
5. economyType + credits + loadout (ekonomi kararları)
6. alliesAlive/enemiesAlive + spikePlanted (durum farkındalığı)
7. healthAtDeath (HP'ye göre agresiflik tavsiyesi)
8. ultReady (ult kullanılabilir miydi)
9. roundTimerAtDeath (timing baskısı)

EKONOMİ SPESİFİK KURALLARI (economyType varsa UYGULA)

- economyType="eco" veya credits<2000: SAVE round. nextRoundSuggestion'da "Classic/Shorty ile bilgi topla, ölme, sonraki round full-buy hedefle" de. Full buy ile çarpışmaya girme tavsiyesi YASAK.
- economyType="force_buy": risk/reward. Spectre/Marshal ile pick oynamayı öner.
- economyType="full_buy": loadout'a göre spesifik angle öner. Vandal=long range, Phantom=close range, Operator=one-shot angles.
- economyType="pistol": Ghost headshot + utility öncelik öner.
- economyType boşsa bu konudan BAHSETME.

KOÇ TONU — KRİTİK

Sen oyuncuya konuşan GERÇEK BİR KOÇSUN. AI gibi konuşma.

DİL — SADE TÜRKÇE / SADE İNGİLİZCE

Türkçe çıktıda:
- Türkçe konuş — sıradan oyuncu anlasın, jargon çorbası yapma.
- Evrensel oyun terimleri DOĞAL kullanılır (ama tek başına bırakma):
  YES: "operator" (snipper silahı), "smoke" (duman ability), "flash", "drone",
       "default", "execute", "retake", "lurk", "peek", "trade", "rotate",
       "spike", "eco", "anchor"
- KISALTMA / SLANG İNGİLİZCE YASAK:
  ✗ "wide swing"           → ✓ "geniş açıyla peek attın"
  ✗ "trip"                 → ✓ "tuzak" (Cypher Trapwire için "tuzak")
  ✗ "op var"               → ✓ "operator'la bekliyor"
  ✗ "yığ"                  → ✓ "yüklen" / "hep birlikte git"
  ✗ "relatively boş"       → ✓ "tarafı boş kalıyor"
  ✗ "bekleyen op"          → ✓ "operator açısı tutuyor"
  ✗ "pre-aim ediyordu"     → ✓ "açıyı tutuyordu" / "önceden nişan almıştı"
  ✗ "pre-aim ediyor"       → ✓ "açıyı tutuyor"
  ✗ "pre-aim eder"         → ✓ "açı tutar" / "önceden nişan alır"
  ✗ "pick alıyor" (kill için) → ✓ "kill alıyor" / "ucuza kill alıyor"
     (NOT: 'pick' Valorant'ta 'erken/bedava kill' demek, 'peek' DEĞİL.
      Türkçe çıktıda kafa karıştırmamak için 'kill' kullan.
      'must-pick agent' gibi roster terimleri korunabilir.)
- Cümle Türkçe gramerli olmalı, "B Main wide swing yedin" GİBİ Tarzanca yok.
- 1-2 cümle ile DETAY ver — generic ("op var") değil, açıklayıcı ama kısa.

İngilizce çıktıda:
- Clear coach English.
- Game terms naturally: "wide-peek", "trap" (Cypher's Trapwire — use "trap"
  not "trip"), "Operator", "smoke off", "trade kill", "lurk", "default",
  "rotate" — universal in English Valorant scene.
- Sentences flow naturally. No Turkish mixed in.

YASAKLI — DİL'DEN BAĞIMSIZ:
- "tek vuruş yetti", "basın", "trade kazanır" → AI dolgu/jargon yığını
- 3-4 cümlelik narration ("attın + yapmadın + değildi + yetti") → AI tarzı
- Mikro-detay komutu ("dash'ini X için sakla", "smoke'unu Y'ye at") → fazla micromanage

ÖRNEK — AI vs KOÇ TONU:

AI tarzı (yasak):
"B Main'de cypher'a operator'la headshot yedin. Düşman seni B Heaven'dan
bekliyordu. Pre-aim yapmadan wide swing attın, dash hazır değildi. Full HP'yle
gittin ama tek vuruş yetti."

KOÇ Türkçe (hedef):
"B Main'den geniş açıyla çıktın, Cypher seni Heaven'dan operator'la oradan
bekliyordu — bir sonraki round o açıyı tekrar deneme, smoke yokken o köşeyi
sallamaya gerek yok."

KOÇ English (hedef):
"You wide-peeked B Main and the Cypher one-tapped you with the Operator from
Heaven — don't take that angle dry next round, smoke or flash it first. Their
traps are pinned to B Main entry."

Fark: koç hatayı net söyler + KISA bir nasıl-düzeltirsin ekler. AI gibi adım
adım açıklama yapmaz.

ÇIKTI — SADECE JSON (markdown yok, code block yok)

3 alan yaz:

{
  "deathAnalysis": "<1-2 cümle Türkçe (ya da İngilizce): hata + sebep + kısa düzeltme. Spesifik callout + ajan + silah/utility dahil. Anlaşılır, akıcı dil. Örn TR: 'B Main'den geniş açıyla peek attın, Cypher seni Heaven'dan operator'la oradan bekliyordu — bir sonraki round o açıyı smoke atmadan deneme.'>",
  "enemyAnalysis": [
    "<1 cümle: düşman bu round'da ne yaptı (setup/utility/pozisyon)>",
    "<1 cümle: pratik counter ya da gözlem>"
  ],
  "nextRoundSuggestion": "<1-2 cümle: basit, işleyen taktik. Hangi site, neden mantıklı, kısa nasıl. Mikro-detay (dash zamanlaması vs) yok. Örn TR: 'Bu round B'yi bırak, takımca A'dan default ilerleyin — Cypher tuzaklarını B'ye dikti, rotate edip A'yı tutamayacak.'>"
}

KURAL:
- enemyAnalysis 2 madde × 1 cümle.
- deathAnalysis ve nextRoundSuggestion 1-2 cümle, en fazla.
- Generic değil, detaylı ama akıcı.
- coachInsight field'ı YAZMA — yok.`;

const USER_PROMPT = `Valorant round sonu. Aşağıdaki OCR/CLIENT pixel truth — screenshot'tan güvenilir.

GÖREVİN: Gerçek bir koç gibi, kısa ve direkt feedback ver. AI tarzı uzun açıklamalar YASAK. Her alan tek cümle (enemyAnalysis 2 madde × 1 cümle).

Sadece JSON döndür — markdown yok, code block yok, başka açıklama yok.`;

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
  economyType?: string; // "full_buy"/"force_buy"/"half_buy"/"eco"/"pistol"
  // New fields from desktop app
  spikePlanted?: boolean; // was spike planted when player died
  healthAtDeath?: number; // HP + shield at death (0-150)
  ultReady?: boolean; // was ultimate ready when player died
  roundTimerAtDeath?: number; // seconds remaining on round timer (0-140)
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

    // Get API key
    const apiKey = process.env.AIMLO_AI_KEY || process.env.ANTHROPIC_API_KEY;
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
    });

    if (kb.files.length > 0) {
      console.log(`[KB] selected: ${kb.files.join(", ")}`);
    }

    // Build system prompt array with 4-block cache topology.
    //
    // Anthropic supports up to 4 cache_control breakpoints per request. We exploit that:
    //   Block 1: SYSTEM_PROMPT  (most stable — coach voice, never changes)
    //   Block 2: Agent KB       (stable across matches — main agent rarely changes)
    //   Block 3: Map KB         (per-match — high cache-miss rate across matches)
    //   Block 4: Contextual KB  (rank + matchup + post-plant + economy — situational)
    //
    // Why this matters: when a user plays Match 2 with the SAME agent on a DIFFERENT map,
    // Blocks 1+2 stay cached (read-rate $0.30/M) while only Block 3 is rewritten. Without
    // this split, the entire KB block was a single cache breakpoint — switching maps cost
    // a full rewrite ($6/M for 1h TTL) on all KB content.
    //
    // 1h TTL covers a full Valorant match (typically 20-40 min) plus inter-match downtime,
    // so per-match cache reuse is near-100% within the match.
    type CacheControl = { type: "ephemeral"; ttl?: "5m" | "1h" };
    type SystemBlock = { type: "text"; text: string; cache_control?: CacheControl };
    const systemBlocks: SystemBlock[] = [
      // Block 1 — system prompt (cache anchor, most stable)
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral", ttl: "1h" },
      },
    ];

    // Block 2 — Agent KB (stable across matches with same main)
    if (kb.blocks.agent) {
      systemBlocks.push({
        type: "text",
        text: kb.blocks.agent,
        cache_control: { type: "ephemeral", ttl: "1h" },
      });
    }

    // Block 3 — Map KB (changes per match)
    if (kb.blocks.map) {
      systemBlocks.push({
        type: "text",
        text: kb.blocks.map,
        cache_control: { type: "ephemeral", ttl: "1h" },
      });
    }

    // Block 4 — Contextual KB (rank, matchup, situational — most variable)
    if (kb.blocks.contextual) {
      systemBlocks.push({
        type: "text",
        text: kb.blocks.contextual,
        cache_control: { type: "ephemeral", ttl: "1h" },
      });
    }

    if (reqPatternContext) {
      // patternContext changes every round — DO NOT cache (cache write overhead > benefit).
      // Sanitize before injecting: this is user-influenced data (Rust client's pattern
      // string can be tampered with by a malicious local proxy, so treat as untrusted).
      const cleanPattern = sanitizePromptInput(reqPatternContext, { max: 2000 });
      if (cleanPattern) {
        systemBlocks.push({
          type: "text",
          text: `[PATTERN CONTEXT — Rust Client]\n${cleanPattern}`,
        });
      }
    }

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
    if (typeof reqBody.side === "string") ctx.side = reqBody.side;
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
      if (typeof reqBody.healthAtDeath === "number" && reqBody.healthAtDeath > 0) {
        ctx.healthAtDeath = Math.min(Math.max(reqBody.healthAtDeath, 0), 150);
      }
      if (typeof reqBody.alliesAlive === "number") ctx.alliesAlive = reqBody.alliesAlive;
      if (typeof reqBody.enemiesAlive === "number") ctx.enemiesAlive = reqBody.enemiesAlive;
      if (typeof reqBody.roundTimerAtDeath === "number" && reqBody.roundTimerAtDeath > 0) {
        ctx.roundTimerAtDeath = Math.min(Math.max(reqBody.roundTimerAtDeath, 0), 140);
      }
      if (reqBody.ultReady === true) ctx.ultReady = true;
      if (reqBody.spikePlanted === true) ctx.spikePlanted = true;
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

    // Pattern context (multi-round history) — kept as raw text since it's already
    // a free-form analysis string from Rust client (not structured fields).
    const patternBlock = (typeof reqBody.patternContext === "string" && reqBody.patternContext.length > 0)
      ? sanitizePromptInput(reqBody.patternContext, { max: 2000 })
      : "";

    // Assemble JSON-formatted context — single block, no decorative borders, no header chrome.
    const ctxJson = Object.keys(ctx).length > 0 ? JSON.stringify(ctx, null, 2) : "";
    const clientContext =
      (ctxJson ? `\n\n[ROUND CONTEXT — OCR pixel truth, screenshot'tan güvenilir]\n${ctxJson}` : "") +
      (patternBlock ? `\n\n[PATTERN — son round'lardaki tekrar eden hata. Bu varsa deathAnalysis veya nextRoundSuggestion'da koç gibi referans ver — extra alan açma]\n${patternBlock}` : "");

    // Build round history context for the user prompt
    let userPromptWithHistory = USER_PROMPT + clientContext;
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
        // extended-cache-ttl enables 1h ttl option (prompt-caching itself is now GA)
        "anthropic-beta": "extended-cache-ttl-2025-04-11",
      },
      body: JSON.stringify({
        // Pinned to dated alias to prevent silent model drift (matches haiku route style).
        model: "claude-sonnet-4-6-20251015",
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
      const errorBody = await response.text().catch(() => "unreadable");
      console.error(`[Aimlo AI] Vision API ${response.status}: ${errorBody.slice(0, 500)}`);
      return errorResponse(
        "ai_upstream_error",
        `Anthropic API returned ${response.status}`,
        502,
        { upstreamStatus: response.status, upstreamBody: errorBody.slice(0, 500) },
      );
    }

    const data = await response.json();
    clearTimeout(timeoutId);

    // Log prompt cache metrics — R1 should show creation>0, R2+ should show read>0 (cache hit)
    const cacheCreation = data?.usage?.cache_creation_input_tokens ?? 0;
    const cacheRead = data?.usage?.cache_read_input_tokens ?? 0;
    const inputTokens = data?.usage?.input_tokens ?? 0;
    const outputTokens = data?.usage?.output_tokens ?? 0;
    const stopReason = data?.stop_reason ?? "unknown";
    const cacheHit = cacheRead > 0 ? "HIT" : cacheCreation > 0 ? "WRITE" : "MISS";
    const totalInput = cacheCreation + cacheRead + inputTokens;
    const cacheRatio = totalInput > 0 ? ((cacheRead / totalInput) * 100).toFixed(1) : "0.0";
    console.log(`[CACHE ${cacheHit}] creation=${cacheCreation} read=${cacheRead} fresh=${inputTokens} total_in=${totalInput} hit_ratio=${cacheRatio}% output=${outputTokens} stop=${stopReason}`);

    const text: string = data?.content?.[0]?.text || "";
    if (!text) {
      console.error("[Aimlo AI] Empty response from API. Full data:", JSON.stringify(data).slice(0, 500));
      return errorResponse("ai_empty_response", "Anthropic returned empty content", 502, { stopReason });
    }

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
      const checkedAnalysis = realityCheck(fb.deathAnalysis, memoryForCheck);
      const checkedSuggestion = realityCheck(fb.nextRoundSuggestion, memoryForCheck);
      if (checkedAnalysis.modified || checkedSuggestion.modified) {
        console.log(`[Aimlo AI] Reality check: deathAnalysis rewrite=${checkedAnalysis.rewriteLevel}, suggestion rewrite=${checkedSuggestion.rewriteLevel}`);
      }

      // Note: coachInsight field removed — purple "KOÇ İÇGÖRÜSÜ" block dropped from overlay.
      // Pattern-aware insight now folds into deathAnalysis or nextRoundSuggestion when relevant.

      // Copy meta fields from REQUEST (desktop is source of truth for round/score/result/died —
      // no longer asking AI to echo them back, saves tokens).
      return NextResponse.json({
        round: typeof reqBody.round === "number" ? reqBody.round : 0,
        score: typeof reqBody.score === "string" ? reqBody.score.slice(0, 10) : "?-?",
        result: reqBody.result === "win" || reqBody.result === "loss" || reqBody.result === "WON" || reqBody.result === "LOST"
          ? (reqBody.result.toLowerCase() === "won" ? "win" : reqBody.result.toLowerCase() === "lost" ? "loss" : reqBody.result.toLowerCase())
          : "loss",
        died: typeof reqBody.died === "boolean" ? reqBody.died : true,
        // Length caps for coach-voice format (1-2 sentence Turkish):
        //   deathAnalysis      : ~350 chars (1-2 sentences with explanation)
        //   enemyAnalysis      : 2 items × ~180 chars each
        //   nextRoundSuggestion: ~350 chars (1-2 sentences)
        deathAnalysis: checkedAnalysis.text.slice(0, 350),
        enemyAnalysis: fb.enemyAnalysis.slice(0, 2).map((s) => String(s).slice(0, 180)),
        nextRoundSuggestion: checkedSuggestion.text.slice(0, 350),
        patternData: null,
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
      return errorResponse("ai_timeout", `Anthropic request exceeded ${AI_TIMEOUT_MS}ms`, 504);
    }
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[Aimlo AI] Vision route error:", msg);
    return errorResponse("ai_internal_error", msg, 500);
  }
}
