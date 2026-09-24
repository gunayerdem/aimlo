import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { checkMatchQuota } from "@/lib/entitlements";
import { saveAiUsage } from "@/lib/ai-usage";
import { saveMatchEvent } from "@/lib/match-events";
import { loadPlayerMemory, buildMemoryContext } from "@/lib/player-memory";
import { isUuidV4 } from "@/lib/uuid";
import { logSafe } from "@/lib/log-safe";
// Model-sonrası son-işlem zinciri (realityCheck → cleanCoachText → enforceAgentKit →
// kapak → fixCallout) TEK KAYNAK: lib/vision-postprocess.ts (OLCUM-ARACI-08).
import { finalizeVisionFeedback, visionOutputFailure } from "@/lib/vision-postprocess";
// Prompt kurulumu (sistem + kullanıcı mesajı), çağrı parametreleri, şema ve yanıt
// ayrıştırma TEK KAYNAK: lib/vision-prompt-builder.ts (B06 · OLCUM-ARACI-01/02/03/04,
// TR-KALAN-18/19). scripts/eval-vision.ts ve scripts/measure-prompt-prefix.ts AYNI
// fonksiyonları çağırır — elle kopyalanmış ayna yok.
import {
  VISION_CALL,
  resolveVisionMaxTokens,
  resolveVisionLang,
  buildVisionSystemMessage,
  buildVisionUserMessage,
  prevDeathTypesFromHistory,
  buildVisionRequestBody,
  toVisionFeedbackOutcome,
  isValidVisionFeedbackShape,
  visionPostprocessOpts,
  type VisionLogLine,
} from "@/lib/vision-prompt-builder";
// match-concepts (rank-4, 2026-08-24): cross-round ban fallback'i — desktop
// death_type echo'su BOŞKEN prevDeathTypes'ı sunucu-yanı Upstash listesinden
// besler. Her hata yolu sessiz boş liste/no-op → feedback bloklanmaz.
import { readMatchConcepts, recordMatchConcept } from "@/lib/match-concepts";

// ── Coach-voice OUTPUT cleaner ─────────────────────────────────────────────
// cleanCoachText is now the SHARED single-source deterministic net in
// lib/coach-text.ts (council 2026-06-25, Cycle 2 fix #1) — every AI route
// applies the same cleanup. The vision prompt (SYSTEM_PROMPT + ai-policy
// buildPolicyBlock + KB) is assembled in lib/vision-prompt-builder.ts
// buildVisionSystemMessage, so the coach-voice rules reach the model; cleanCoachText is the on-the-wire
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

// Token tavanı (varsayılan 350 / tavan 450), model ve reasoning_effort:
// lib/vision-prompt-builder.ts VISION_CALL — eval-vision aynı sabitleri import eder
// (B06 · OLCUM-ARACI-04: eval eskiden 350'yi elle kopyalıyordu, prod fiilen 450).

type VisionRequest = {
  image: string; // base64-encoded image
  imageFormat?: string; // e.g. "image/jpeg" — defaults to "image/png"
  maxTokens?: number; // client-requested max tokens — capped at VISION_CALL.maxTokensCap (450); desktop sends 900 (ai_client.rs:827)
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

// B111 (2026-07-31): PatternData tipi + sanitizePatternData + PEEK_TYPES /
// DEATH_TIMINGS / MAP_CONTROLS sabitleri SİLİNDİ — hiçbir yerden çağrılmıyorlardı
// (grep: tek referans kendi tanımlarıydı). Yanıttaki `patternData: null` alanı
// AYNEN duruyor: desktop onu deserialize ediyor (ai_client.rs:464-465), sözleşme
// değişmedi. RoundFeedback'ten de yalnız HİÇ okunmayan opsiyonel alan tanımları
// (killerAgent/killerWeapon/killfeedConfidence/deathPosition/positionConfidence/
// positionSignals/patternData) kaldırıldı — bu tip modelin PARSE edilen çıktısını
// tanımlar, HTTP yanıt gövdesini değil, dolayısıyla yanıt JSON'u etkilenmez.
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

/* ── B124 (2026-07-31): GÖRSEL BOYUT POLİTİKASI ───────────────────────────────
 * Tek sınır MAX_IMAGE_BYTES'tı; PİKSEL boyutu hiç bakılmıyordu. İki sonuç:
 *  (a) ölçülemezlik — 1080p gönderen bir istemci ölüm başına ~1000 token fazla
 *      yakıyor (patch fiyatlaması, aşağıdaki nota bakın) ve bu /cost panelinde
 *      görünmüyordu; artık her görsel için boyut+patch logu düşer.
 *  (b) sağlamlık — küçük bir dosyada devasa başlık boyutu bildiren bozuk/kötücül
 *      bir görsel (decompression-bomb kalıbı) doğrudan modele iletiliyordu.
 * ÜST SINIR bilinçli olarak ÇOK yüksek (16384 px): en geniş üçlü-4K masaüstü
 * yakalaması bile ~11520 px — yani gerçek hiçbir kullanıcıyı reddetmez, yalnız
 * saçma başlıkları eler. Backend RESIZE YAPMAZ (istek gövdesi zaten kodlanmış):
 * gerçek tasarruf desktop'ın ≤1280×720 göndermesiyle gelir, bu log onu ölçmek
 * içindir. `died=false` yolunda görsel hiç gönderilmez, log da düşmez.
 */
const MAX_IMAGE_DIMENSION = 16_384;
/** Patch bütçesi (GPT-5 ailesi): bunun üstü model tarafında ölçeklenir → boşa token. */
const IMAGE_PATCH_BUDGET = 1536;
/** Başlık okumak için yeterli base64 önek (4'ün katı; ≈6000 çözülmüş bayt). */
const IMAGE_HEADER_B64_CHARS = 8000;

const byteAt = (s: string, i: number): number => s.charCodeAt(i) & 0xff;

/**
 * Çözülmüş görsel baytlarından piksel boyutunu okur (PNG IHDR / JPEG SOF /
 * WebP VP8·VP8L·VP8X). Okunamazsa null döner — ASLA throw etmez ve null
 * hiçbir zaman reddetme sebebi değildir (bilinmeyen kodlayıcıyı kırmamak için).
 */
function readImageDimensions(bin: string): { w: number; h: number } | null {
  if (bin.length < 24) return null;
  // PNG: IHDR ilk chunk'tır — genişlik 16-19, yükseklik 20-23 (big-endian).
  if (byteAt(bin, 0) === 0x89 && bin.slice(1, 4) === "PNG") {
    if (bin.slice(12, 16) !== "IHDR") return null;
    const w = (byteAt(bin, 16) << 24) | (byteAt(bin, 17) << 16) | (byteAt(bin, 18) << 8) | byteAt(bin, 19);
    const h = (byteAt(bin, 20) << 24) | (byteAt(bin, 21) << 16) | (byteAt(bin, 22) << 8) | byteAt(bin, 23);
    return w > 0 && h > 0 ? { w, h } : null;
  }
  // JPEG: SOF (Start Of Frame) işaretçisini tara — boyut orada durur.
  if (byteAt(bin, 0) === 0xff && byteAt(bin, 1) === 0xd8) {
    let i = 2;
    while (i + 9 < bin.length) {
      if (byteAt(bin, i) !== 0xff) { i++; continue; }
      const marker = byteAt(bin, i + 1);
      if (marker === 0xff) { i++; continue; }                            // dolgu baytı
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; } // uzunluksuz
      const len = (byteAt(bin, i + 2) << 8) | byteAt(bin, i + 3);
      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
      if (isSof) {
        const h = (byteAt(bin, i + 5) << 8) | byteAt(bin, i + 6);
        const w = (byteAt(bin, i + 7) << 8) | byteAt(bin, i + 8);
        return w > 0 && h > 0 ? { w, h } : null;
      }
      if (len < 2) return null;
      i += 2 + len;
    }
    return null;
  }
  // WebP: RIFF konteyneri — üç alt biçim.
  if (bin.slice(0, 4) === "RIFF" && bin.slice(8, 12) === "WEBP" && bin.length >= 30) {
    const chunk = bin.slice(12, 16);
    if (chunk === "VP8X") {
      const w = 1 + (byteAt(bin, 24) | (byteAt(bin, 25) << 8) | (byteAt(bin, 26) << 16));
      const h = 1 + (byteAt(bin, 27) | (byteAt(bin, 28) << 8) | (byteAt(bin, 29) << 16));
      return { w, h };
    }
    if (chunk === "VP8 ") {
      const w = ((byteAt(bin, 27) << 8) | byteAt(bin, 26)) & 0x3fff;
      const h = ((byteAt(bin, 29) << 8) | byteAt(bin, 28)) & 0x3fff;
      return w > 0 && h > 0 ? { w, h } : null;
    }
    if (chunk === "VP8L") {
      const b0 = byteAt(bin, 21), b1 = byteAt(bin, 22), b2 = byteAt(bin, 23), b3 = byteAt(bin, 24);
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { w, h };
    }
  }
  return null;
}

/** Boyuttan patch + tahmini token (gpt-5-mini çarpanı 1.62). */
function estimateImageTokens(w: number, h: number): { patches: number; tokens: number } {
  const patches = Math.ceil(w / 32) * Math.ceil(h / 32);
  return { patches, tokens: Math.round(Math.min(patches, IMAGE_PATCH_BUDGET) * 1.62) };
}

/* ── B22 (2026-07-31): roundHistory ŞEMASI ────────────────────────────────────
 * roundHistory HİÇ doğrulanmıyordu: ne dizi uzunluğu ne eleman tipleri. Değerler
 * lib/history-block.ts'te prompt'a interpolate ediliyor (death_position) ve
 * repeat/streak hesaplarına giriyor. 5MB payload tavanı içinde kalan kurcalanmış
 * bir istemci megabaytlarca metni doğrudan gpt-5-mini'ye faturalatabiliyordu.
 * KAPI: desktop en fazla 12 giriş yolluyor (aimlo-desktop/src-tauri/src/
 * ai_client.rs:815 `hist.len().saturating_sub(12)`) — 30 tavanı 2.5× pay bırakır,
 * yani meşru hiçbir istemciyi reddetmez. İçerik temizliği (sanitizePromptInput)
 * buildHistoryBlock'ta, defense-in-depth olarak yapılır.
 */
const MAX_ROUND_HISTORY_ENTRIES = 30;
const MAX_HISTORY_STRING_LEN = 200;

/* ── ctx SERBEST-METİN ALANLARI: SINIR KAPISI ────────────────────────────────
 * GÜVENLİK DENETİMİ beta4 (2026-08-04) — denetimin tek ORTA bulgusunun ikinci
 * katmanı. Asıl düzeltme aşağıda ctx kurulumundadır (sanitizePromptInput ile,
 * bkz. "ctx ALAN TEMİZLİĞİ" bloğu); burası defense-in-depth kapısı.
 * NEDEN: map/agent/mode/score/result/deathTiming/side/economyType/rank alanları
 * prompt'a giden ctx'e kopyalanıyordu ve isValidVisionRequest bunların HİÇBİRİNİ
 * doğrulamıyordu (yalnız image/matchId/roundHistory). 5 MB'lık MAX_PAYLOAD_BYTES
 * tavanının altında kalan megabaytlık tek bir alan, hiçbir kapıya takılmadan
 * atob/KB/AI yoluna giriyordu.
 * EŞİK CÖMERT: bu alanlar OCR'dan gelen kısa etiketlerdir ("Ascent", "Jett",
 * "13-11", "competitive", "early") — onlarca karakter. 4096 kat kat pay bırakır,
 * yani meşru hiçbir istemciyi reddetmez. Tip toleransı korunur: string OLMAYAN
 * değerler reddedilmez (aşağıdaki typeof kapıları onları zaten yok sayar) —
 * yalnız akıl-dışı uzunluktaki string elenir.
 */
const MAX_CTX_FIELD_LEN = 4096;
const CTX_TEXT_FIELDS = [
  "map", "agent", "mode", "score", "result", "deathTiming", "side", "economyType", "rank",
] as const;

function isValidRoundHistory(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true;   // alan opsiyonel
  if (!Array.isArray(raw)) return false;
  if (raw.length > MAX_ROUND_HISTORY_ENTRIES) return false;
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    const e = entry as Record<string, unknown>;
    if (e.round_index !== undefined && (typeof e.round_index !== "number" || !Number.isFinite(e.round_index))) return false;
    if (e.died !== undefined && typeof e.died !== "boolean") return false;
    if (e.round_won !== undefined && typeof e.round_won !== "boolean") return false;
    // Serbest metin alanları: string olmalı ve tek başına prompt'u domine edememeli.
    for (const key of ["death_position", "position_confidence", "death_detected_confidence", "death_type"]) {
      const v = e[key];
      if (v === undefined || v === null) continue;
      if (typeof v !== "string" || v.length > MAX_HISTORY_STRING_LEN) return false;
    }
  }
  return true;
}

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
  // B124 (2026-07-31): piksel üst sınırı. Boyut OKUNAMAZSA reddetmeyiz (bilinmeyen
  // kodlayıcı meşru olabilir); yalnız gerçekte imkânsız bir başlık (>16384 px)
  // elenir — bu, birkaç KB'lik dosyanın dev bir görsel bildirdiği bozuk/kötücül
  // kalıptır. Gerçek ekran yakalamaları bu sınırın çok altında kalır.
  const dims = readImageDimensions(bin);
  if (dims && (dims.w > MAX_IMAGE_DIMENSION || dims.h > MAX_IMAGE_DIMENSION)) {
    console.warn(`[Aimlo AI] image rejected: implausible dimensions ${dims.w}x${dims.h}`);
    return false;
  }
  // matchId optional but if present must be a valid UUID v4. Reject
  // garbage early so the field can't smuggle prompt-injection text past
  // the rest of the validation just because it isn't sanitized.
  if (o.matchId !== undefined && !isUuidV4(o.matchId)) {
    return false;
  }
  // B22 (2026-07-31): roundHistory şeması — prompt'a giren tek doğrulanmamış
  // dizi buydu (uzunluk + eleman tipleri serbestti).
  if (!isValidRoundHistory(o.roundHistory)) {
    return false;
  }
  // Güvenlik denetimi beta4 (2026-08-04): ctx serbest-metin alanlarında akıl-dışı
  // uzunluk kapısı (gerekçe + eşik: MAX_CTX_FIELD_LEN notu yukarıda).
  for (const key of CTX_TEXT_FIELDS) {
    const v = o[key];
    if (typeof v === "string" && v.length > MAX_CTX_FIELD_LEN) {
      console.warn(`[Aimlo AI] vision rejected: ctx field '${key}' too long (${v.length}b)`);
      return false;
    }
  }
  return true;
}

// Şekil doğrulayıcı (deathAnalysis/enemyAnalysis/nextRoundSuggestion) →
// lib/vision-prompt-builder.ts isValidVisionFeedbackShape (eval aynı parse'ı kullanır).

/** Kurucunun log satırını ÜRETİLDİĞİ AN basar (kurucuya onLog olarak verilir).
 *  W2 inceleme B06-F2: eskiden satırlar kurucu dönünce topluca basılıyordu → kurucu
 *  istisna atarsa (tip-karışık gövde) o ana kadarki teşhis satırları kayboluyordu.
 *  Başarılı yolda sıra ve içerik aynı (test-eval-fidelity [V] log kıyası). */
function emitVisionLog(l: VisionLogLine): void {
  if (l.level === "warn") console.warn(l.msg);
  else console.log(l.msg);
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

    // Auth + rate limit — "vision" katmanı. GERÇEK SAYILAR İÇİN TEK KAYNAK:
    // lib/api-auth.ts RATE_LIMITS/DAILY_QUOTA. (B112, 2026-07-31: buradaki eski
    // "4/min, 30/day — $0.015+/call" yorumu üç rakamda birden bayattı; ölçülen
    // değer $0.0024/çağrı, limitler 6/dk-100/gün. Sayıyı burada TEKRARLAMIYORUZ
    // ki bir daha sapmasın — tek kaynağa bakılır.)
    const auth = await verifyAuthAndRateLimit(request, "vision");
    if (!auth.ok) return auth.response;
    // Daraltılmış userId'yi sabitle: aşağıdaki yardımcı fonksiyon HOISTED olduğu
    // için TypeScript orada `auth` daraltmasını koruyamıyor (çağrı sırası
    // kanıtlanamaz) → union tipi görüp derleme hatası veriyordu.
    const authedUserId = auth.userId;

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
      // Log forging (W2 inceleme RW1-F2): isValidVisionRequest PNG için yalnız
      // `includes("png")` ister → "png\n[Aimlo AI] …" doğrulamadan geçer; ham basılmaz.
      console.log(`[Aimlo AI] imageFormat rejected: "${logSafe(rawFormat)}" → default "image/png"`);
    } else {
      console.log(`[Aimlo AI] imageFormat: ${resolvedMediaType}`);
    }

    // B124 (2026-07-31): görsel boyutu + tahmini patch/token gözlemlenebilirliği.
    // Yalnız görselin GERÇEKTEN gönderildiği yolda (died !== false) çalışır ve
    // sadece BAŞLIK önekini çözer (~6KB) — tam decode maliyeti yok. Böylece
    // /cost panelindeki vision girdisi ile çözünürlük korele edilebilir.
    if ((body as VisionRequest).died !== false) {
      try {
        const head = atob((body as VisionRequest).image.slice(0, IMAGE_HEADER_B64_CHARS));
        const dims = readImageDimensions(head);
        const b64Len = (body as VisionRequest).image.length;
        const approxBytes = Math.floor((b64Len * 3) / 4);
        if (dims) {
          const est = estimateImageTokens(dims.w, dims.h);
          console.log(
            `[IMAGE] ${dims.w}x${dims.h} bytes≈${approxBytes} patches=${est.patches} est_tokens≈${est.tokens}`,
          );
          if (est.patches > IMAGE_PATCH_BUDGET) {
            console.warn(
              `[IMAGE] over patch budget (${est.patches} > ${IMAGE_PATCH_BUDGET}) — model downscales; ` +
              `desktop should send ≤1280x720 to stop paying for pixels it discards.`,
            );
          }
        } else {
          console.log(`[IMAGE] dimensions unreadable bytes≈${approxBytes}`);
        }
      } catch {
        // Ölçüm hiçbir zaman isteği düşüremez — log yoksa yok.
      }
    }

    // maxTokens: istemcinin istediği → min(istek, 450); göndermeyen istemci 350.
    // Kural TEK KAYNAK: lib/vision-prompt-builder.ts resolveVisionMaxTokens (B06).
    const rawMaxTokens = (body as VisionRequest).maxTokens;
    const resolvedMaxTokens = resolveVisionMaxTokens(rawMaxTokens);
    // maxTokens tip doğrulamasız gelir (dize/satır sonu) → logSafe (RW1-F2).
    console.log(`[Aimlo AI] maxTokens: requested=${rawMaxTokens === undefined || rawMaxTokens === null ? "none" : logSafe(rawMaxTokens)}, resolved=${resolvedMaxTokens}`);

    const reqBody = body as VisionRequest;
    const reqMap = typeof reqBody.map === "string" ? reqBody.map : undefined;
    const reqAgent = typeof reqBody.agent === "string" ? reqBody.agent : undefined;
    // Feedback dili (canlı-test 2026-07-18): desktop Ayarlar → "Geri Bildirim Dili".
    // Whitelist — yalnız "en" kabul, diğer her şey tr (eski desktop lang göndermez → tr).
    const reqLang = resolveVisionLang(reqBody);

    // ── PROMPT KURULUMU — TEK KAYNAK (B06 · OLCUM-ARACI-01/02/03, TR-KALAN-18/19) ──
    // Sistem mesajı (SYSTEM_PROMPT + policy + static/scenario/profile/profile2/agent/
    // abilityHint/map/contextual KB + hafıza + pattern) ve kullanıcı mesajı (ctx →
    // factGround → factSheet → direktif zinciri → geçmiş bloğu) lib/vision-prompt-
    // builder.ts'te kurulur. scripts/eval-vision.ts ve scripts/measure-prompt-prefix.ts
    // AYNI fonksiyonları çağırır; eskiden elle kopyalanmış aynalar prod'dan senaryo
    // başına ~82 KB sistem bloğu + 11 kullanıcı-mesajı direktifi geride kalmıştı.
    // Taşıma bayt-aynı (evals/vision-golden + scripts/test-eval-fidelity.ts [V]).
    // Burada yalnız I/O kalır:

    // (1) Cross-match oyuncu hafızası (lib/player-memory). Best-effort: hafıza
    // hatası canlı round feedback'ini ASLA bloklamaz. Sarmalayıcı + 1200 kapağı
    // builder'da (buildVisionSystemMessage).
    let memoryContext = "";
    try {
      const memory = await loadPlayerMemory(auth.userId);
      memoryContext = buildMemoryContext(memory, reqLang);
    } catch (e) {
      console.log(`[Aimlo AI] Vision: player memory unavailable: ${(e as Error).message}`);
    }
    const sys = buildVisionSystemMessage({ body: reqBody, lang: reqLang, memoryContext, onLog: emitVisionLog });
    const systemMessage = sys.systemMessage;

    // (2) Cross-round ders geçmişi (canlı-test #14): desktop echo'su
    // (roundHistory[].death_type — v1.0.17'de CANLI, desktop commit 07a91b1); echo
    // BOŞKEN maç-kavram hafızası (lib/match-concepts). Yalnız ölüm round'unda okunur
    // (sınıflandırıcı yalnız orada koşar — eski davranışın birebiri).
    const roundHistory = reqBody.roundHistory;
    let prevDeathTypes = prevDeathTypesFromHistory(roundHistory);
    let prevSource = "rh";
    const mcMatchId = reqBody.matchId;
    if (reqBody.died === true && prevDeathTypes.length === 0 && typeof mcMatchId === "string" && mcMatchId) {
      prevDeathTypes = await readMatchConcepts(auth.userId, mcMatchId);
      prevSource = prevDeathTypes.length > 0 ? "mc" : "-";
    }

    // (3) Kullanıcı mesajı. Görsel died!==false yolunda eklenir (buildUserContent);
    // görsele dayalı [GÖRÜNTÜDEKİ YETENEK İKONLARI] direktifi de yalnız o zaman girer.
    const user = buildVisionUserMessage({
      body: reqBody,
      lang: reqLang,
      prevDeathTypes,
      prevSource,
      imageAvailable: reqBody.died !== false,
      onLog: emitVisionLog,
    });
    const userPromptWithHistory = user.userPrompt;
    // factGround: prompt fact-sheet'ini üreten AYNI nesne → son-işlem guard'ı da onu okur.
    const factGround = user.factGround;
    const deathTypeOut = user.deathType;   // returned in the response (Phase-2 cross-round loop)

    /* ── B70 (2026-07-31): LENGTH-KESİLMESİNDE TEK RETRY ─────────────────────
     * GPT-5'te reasoning token'ları max_completion_tokens ile AYNI bütçeden düşer
     * (reasoning_effort "minimal" = sıfır değil). Bütçe taşınca finish_reason=
     * "length" gelir, JSON yarıda kesilir ve tek davranış 502 ai_invalid_json'du
     * → o round'un koçluğu TAMAMEN kayboluyordu. Artık kesilme KANITLANDIĞINDA
     * (finish=length + çıktı kullanılamaz) tek sefer VISION_CALL.maxTokensCap (450)
     * ile yeniden denenir.
     * ⚠ KAPSAM (B06 · OLCUM-ARACI-04, 2026-09-24): blok yazılırken ilk denemenin
     * 350 olduğu varsayılmıştı. Masaüstü her istekte maxTokens=900 gönderir
     * (aimlo-desktop src-tauri/src/ai_client.rs:827, vision'ın tek istemcisi) →
     * ilk deneme ZATEN 450 ve `attemptTokens < maxTokensCap` false: masaüstü
     * isteklerinde bu retry HİÇ tetiklenmez. Dal yalnız maxTokens göndermeyen ya da
     * 450'den az isteyen istemcide canlıdır. Karar (OLCUM-ARACI-04 varsayılanı):
     * tavan 450 kalır, dal zararsız olduğu için korunur.
     * SINIRLAR: (a) yalnız başarısız çağrıda → maliyet etkisi ihmal edilebilir,
     * (b) upstream hatasında (5xx/429) retry YOK — o ayrı bir arıza sınıfı,
     * (c) iki çağrı ORTAK bir süre bütçesini paylaşır (aiDeadline) → maxDuration
     * 90s aşılamaz, kalan süre yetmezse retry hiç denenmez,
     * (d) BAŞARILI bir yanıt asla yeniden denenmez.
     * SAHTE ÇIKTI YOK: retry de başarısız olursa yapısal hata döner (ürün kuralı).
     */
    const aiDeadline = Date.now() + AI_TIMEOUT_MS;
    const RETRY_MIN_BUDGET_MS = 15_000; // bundan azı kaldıysa retry denenmez

    // OpenAI Chat Completions yanıtının bizim okuduğumuz kısmı (hepsi opsiyonel —
    // eksik alan varsayılanlara düşer, asla throw etmez).
    type OpenAIChatResponse = {
      model?: string;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        prompt_tokens_details?: { cached_tokens?: number };
      };
      choices?: { finish_reason?: string; message?: { content?: string } }[];
    };

    async function callVisionModel(
      maxTokens: number,
    ): Promise<{ ok: true; data: OpenAIChatResponse } | { ok: false; status: number }> {
      // Abort sinyali gövde okumasını da kapsar (eski kod clearTimeout'u
      // response.json()'dan SONRA çağırıyordu — aynı davranış korunuyor).
      const remaining = Math.max(1_000, aiDeadline - Date.now());
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), remaining);
      try {
        const response = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          // İstek gövdesi TEK KAYNAK (B06): model, max_completion_tokens, json_schema
          // strict (temel şema + enemyAnalysis KAYNAK-DİLİ/ANTİ-TEKRAR eki), reasoning_effort
          // minimal — lib/vision-prompt-builder.ts buildVisionRequestBody (alan sırası aynı).
          body: JSON.stringify(buildVisionRequestBody({
            systemMessage,
            userContent: buildUserContent(reqBody.died, body.image, resolvedMediaType, userPromptWithHistory),
            maxTokens,
            lang: reqLang,
          })),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "unreadable");
          // Security audit 2026-06-11 (M-2): keep the upstream body in the SERVER
          // log only — do NOT reflect it to the client (info-disclosure habit;
          // the desktop branches on upstreamStatus alone).
          console.error(`[Aimlo AI] Vision API ${response.status}: ${errorBody.slice(0, 500)}`);
          return { ok: false, status: response.status };
        }
        return { ok: true, data: await response.json() };
      } finally {
        clearTimeout(timeoutId);
      }
    }

    /** Kullanım logu + /cost kaydı; finish_reason'ı döndürür. */
    function trackUsage(d: OpenAIChatResponse, attempt: number, latencyMs?: number): string {
      // OpenAI usage object: prompt_tokens, completion_tokens, prompt_tokens_details.cached_tokens
      const promptTokens = d?.usage?.prompt_tokens ?? 0;
      const completionTokens = d?.usage?.completion_tokens ?? 0;
      const cachedTokens = d?.usage?.prompt_tokens_details?.cached_tokens ?? 0;
      const freshTokens = promptTokens - cachedTokens;
      const finishReason = d?.choices?.[0]?.finish_reason ?? "unknown";
      const cacheStatus = cachedTokens > 0 ? "HIT" : "MISS";
      const cacheRatio = promptTokens > 0 ? ((cachedTokens / promptTokens) * 100).toFixed(1) : "0.0";
      console.log(`[CACHE ${cacheStatus}] cached=${cachedTokens} fresh=${freshTokens} total_in=${promptTokens} hit_ratio=${cacheRatio}% output=${completionTokens} finish=${finishReason}${attempt > 1 ? ` attempt=${attempt}` : ""}`);
      // Persist usage for the admin /cost panel (non-blocking, fail-safe).
      // Retry de faturalanır → her deneme ayrı kaydedilir, maliyet paneli gerçeği görsün.
      // F8 koordinasyonu (pano dalga, 2026-08-04): 0018 kolonları — matchId istekte
      // varsa (isValidVisionRequest UUID v4 doğruladı) round↔maç korelasyonu için,
      // latencyMs = o denemenin ölçülen AI çağrı süresi. İkisi de lib/ai-usage.ts'te
      // OPSİYONEL; migration uygulanmamışsa fallback orada (eski kolon setiyle retry).
      saveAiUsage({
        userId: authedUserId,
        routeType: "vision",
        model: d?.model ?? VISION_CALL.model,
        promptTokens,
        completionTokens,
        cachedTokens,
        matchId: (body as VisionRequest).matchId ?? null,
        latencyMs: latencyMs ?? null,
      });
      return finishReason;
    }

    // Yanıt ayrıştırma (extractJSON + string→array coercion + nullish default + şekil)
    // TEK KAYNAK: lib/vision-prompt-builder.ts toVisionFeedbackOutcome. B70'ten beri ilk
    // deneme ile retry aynı fonksiyondan geçer; B06'dan beri eval-vision da (eskiden
    // çıplak JSON.parse — prod'un kurtardığı yanıtı hata sayıyordu).

    // ── 1. deneme ──────────────────────────────────────────────────────────
    let attemptTokens = resolvedMaxTokens;
    // F8 (pano dalga, 2026-08-04): deneme-başına AI çağrı süresi — /cost paneli
    // latency_ms kolonu. Ölçüm fetch + gövde okumasını kapsar (callVisionModel'in
    // tamamı); başarısız çağrıda kayıt yok (trackUsage zaten yalnız ok yolunda).
    const firstCallStart = Date.now();
    const firstCall = await callVisionModel(attemptTokens);
    const firstLatencyMs = Date.now() - firstCallStart;
    if (!firstCall.ok) {
      return errorResponse("ai_upstream_error", `OpenAI API returned ${firstCall.status}`, 502, {
        upstreamStatus: firstCall.status,
      });
    }
    let data: OpenAIChatResponse = firstCall.data;
    let finishReason = trackUsage(data, 1, firstLatencyMs);
    let text: string = data?.choices?.[0]?.message?.content || "";
    let outcome = toVisionFeedbackOutcome(text);

    // ── 2. deneme (B70) — YALNIZ kanıtlı length-kesilmesinde ───────────────
    if (
      !outcome.ok &&
      finishReason === "length" &&
      attemptTokens < VISION_CALL.maxTokensCap &&
      aiDeadline - Date.now() > RETRY_MIN_BUDGET_MS
    ) {
      console.warn(
        `[Aimlo AI] finish=length → truncated output (${outcome.code}); retrying ONCE with max_completion_tokens=${VISION_CALL.maxTokensCap}`,
      );
      attemptTokens = VISION_CALL.maxTokensCap;
      const retryStart = Date.now();
      const retryCall = await callVisionModel(attemptTokens);
      const retryLatencyMs = Date.now() - retryStart;
      if (retryCall.ok) {
        data = retryCall.data;
        finishReason = trackUsage(data, 2, retryLatencyMs);
        text = data?.choices?.[0]?.message?.content || "";
        // Retry sonucu ne olursa olsun onu kullanırız: ilk yanıt zaten
        // kullanılamaz durumdaydı, saklamanın değeri yok.
        outcome = toVisionFeedbackOutcome(text);
        console.log(`[Aimlo AI] length-retry result: ${outcome.ok ? "recovered" : outcome.code} finish=${finishReason}`);
      } else {
        // Retry upstream'de patladı → ilk denemenin hata sınıfı korunur (aşağıda döner).
        console.error(`[Aimlo AI] length-retry upstream failed (${retryCall.status}); keeping original failure`);
      }
    }

    if (!outcome.ok) {
      console.error(
        `[Aimlo AI] vision output unusable (${outcome.code}) finish=${finishReason} preview: ${outcome.preview.slice(0, 300)}`,
      );
      if (outcome.code === "ai_empty_response") {
        // Boş içerikte tek ipucu üst-veridir (eski davranış korunur).
        console.error("[Aimlo AI] Empty response from API. Full data:", JSON.stringify(data).slice(0, 500));
      }
      return errorResponse(
        outcome.code,
        outcome.message,
        502,
        outcome.code === "ai_invalid_json"
          ? { rawPreview: outcome.preview, stopReason: finishReason }
          : outcome.code === "ai_invalid_shape"
            ? { parsedPreview: outcome.preview }
            : { finishReason },
      );
    }

    const parsed: unknown = outcome.obj;

    if (isValidVisionFeedbackShape(parsed)) {
      const fb = parsed as RoundFeedback;

      // SON-İŞLEM ZİNCİRİ — TEK KAYNAK (OLCUM-ARACI-08, 2026-09-23):
      // lib/vision-postprocess.ts:finalizeVisionFeedback (enforceAgentNames → [DA:
      // stripDiagnosisLabel] → realityCheck → cleanCoachText → boş-guard →
      // enforceAgentKit → clampToSentence → fixCallout). eval-vision,
      // test-pipeline-chain ve replay-tr AYNI fonksiyonu import eder → elle kopyalanmış
      // ayna yok. factGround, prompt fact-sheet'ini üreten AYNI nesne (builder);
      // seçenekler (harita/ajan/kadro/ölçülen konum) visionPostprocessOpts'tan (B06 ·
      // OLCUM-ARACI-07 — eval ve replay-tr aynı türetmeyi kullanır).
      const post = finalizeVisionFeedback(fb, visionPostprocessOpts(reqBody, reqLang, factGround));
      if (post.realityModified) {
        console.log(`[Aimlo AI] Reality check: deathAnalysis rewrite=${post.rewriteLevels.death}, suggestion rewrite=${post.rewriteLevels.suggestion}`);
      }
      // KAPAK ÖLÇÜMÜ (W2 inceleme RW1-F3): DA kapağı (400) korpus tavanına eşit, pay yok;
      // ateşlediğinde son cümle (zorunlu düzeltme) düşebilir. Davranış aynı — yalnız
      // görünürlük: Vercel'de "vision cap fired" araması sınıfın geri dönüşünü sayar.
      for (const h of post.capHits) {
        console.warn(`[Aimlo AI] vision cap fired field=${h.field} len=${h.before}→${h.after}`);
      }
      // CANLI-TEST-07: süzgeç deathAnalysis'i tamamen boşalttıysa (ör. model yalnız
      // "(41 HP)" yazdı) eskiden HAM metin dönüyordu → HP/meta yasağı deliniyordu.
      // Artık mevcut yapısal hata yolu: sahte ya da ham koç metni YOK. Maç kavramı ve
      // canlı akış kaydı da yazılmaz (kullanıcı bu round'un dersini görmedi).
      const outputFailure = visionOutputFailure(post);
      if (outputFailure) {
        console.error(`[Aimlo AI] vision output unusable after filter (${outputFailure.detail.reason}) field=${outputFailure.detail.field} rewrite=${post.rewriteLevels.death}`);
        return errorResponse(outputFailure.code, outputFailure.message, outputFailure.status, outputFailure.detail);
      }

      // Note: coachInsight field removed — purple "KOÇ İÇGÖRÜSÜ" block dropped from overlay.
      // Pattern-aware insight now folds into deathAnalysis or nextRoundSuggestion when relevant.
      const deathAnalysisOut = post.deathAnalysis;
      const enemyAnalysisOut = post.enemyAnalysis;
      const nextRoundOut = post.nextRoundSuggestion;

      // Live match feed (admin /live + /feedback): one row per death with the ACTUAL
      // coaching the user received — piggybacks this vision call, ZERO extra AI cost,
      // non-blocking + fail-safe.
      // (rank-4) Kavram hafızası — bu round'un death-type'ı maç set'ine yazılır
      // (fire-and-forget, saveMatchEvent emsali: yanıtı BLOKLAMAZ, hata sessiz).
      // Faz2 echo'su gelince roundHistory kazanır, bu yazım okunmadan kalır — zararsız.
      {
        const mcId = (body as VisionRequest).matchId;
        if (deathTypeOut && typeof mcId === "string" && mcId) {
          void recordMatchConcept(auth.userId, mcId, deathTypeOut);
        }
      }

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
      // 🔴 B115 + B111 (2026-07-31) — result eşlemesi iki ayrı hata taşıyordu:
      //  (1) BÜYÜK/küçük harf: yalnız "win"/"loss"/"WON"/"LOST" literalleri kabul
      //      ediliyordu; küçük harf "won"/"lost" hiçbir dala uymayıp ternary
      //      default'una düşüyor ve KAZANILAN round yanıtta "loss" işaretleniyordu.
      //      Üstelik prompt tarafı (ctx.result) toUpperCase() ile zaten
      //      harf-toleranslıydı → sözleşmenin iki ucu farklı normalize ediyordu.
      //  (2) "unknown" ZORLAMASI: desktop 'win'/'loss'/'unknown' gönderir
      //      (aimlo-desktop lib.rs:1708-1712); unknown sessizce "loss"a
      //      çevriliyordu — R3'te report route'unda ayıklanan "UNKNOWN'ı loss'a
      //      zorlama, ASLA uydurma" dersinin vision'daki kalıntısı. Desktop yanıtı
      //      snapshot'la ezdiği için bugün zararsız, ama başka bir istemci echo'ya
      //      güvenirse yanlış "Kaybedildi" görür.
      // Yanıt ANAHTARLARI ve bilinen değerler değişmedi (sözleşme korunur).
      return NextResponse.json({
        round: typeof reqBody.round === "number" ? reqBody.round : 0,
        score: typeof reqBody.score === "string" ? reqBody.score.slice(0, 10) : "?-?",
        result: (() => {
          const r = String(reqBody.result ?? "").toLowerCase();
          if (r === "win" || r === "won") return "win";
          if (r === "loss" || r === "lost") return "loss";
          if (r === "unknown") return "unknown";
          return "loss";
        })(),
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
    // İç hata metni YANITA konmaz (W2 inceleme B06-F2): tip-karışık gövde eskiden
    // `(b.side || "").toLowerCase is not a function` metnini istemciye sızdırıyordu.
    // Ayrıntı yukarıdaki sunucu logunda; kod/statü aynı (desktop statüye bakar),
    // ask route'unun "Internal server error" emsali.
    return errorResponse("ai_internal_error", "Internal server error", 500);
  }
}
