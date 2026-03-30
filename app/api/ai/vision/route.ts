import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";

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

const SYSTEM_PROMPT = `Sen AIMLO, profesyonel bir Valorant koçusun. Ekran görüntüsünü analiz et ve round feedback ver. JSON formatında döndür.

KANIT POLİTİKASI (ZORUNLU):
Sana verilen round geçmişi GERÇEK gözlemlerdir. Bu verilere göre konuş:

GÖZLEMLENEN (kesin dille söylenebilir):
- "Son X round'da Y kez öldün" — eğer roundHistory bunu kanıtlıyorsa
- "Bu round öldün" — eğer died=true ise

ÇIKARIM (ihtimalli dille söylenmeli):
- "Bu tekrar, giriş açının okunabilir hale geldiğini gösteriyor olabilir"
- "Muhtemelen düşman bu açıyı tutuyor"
Çıkarım kelimeleri: "olabilir", "muhtemelen", "gösteriyor olabilir", "yüksek ihtimalle"

YASAK KESİNLİK (kanıtsız söylenemez):
- "Jett 3 rounddur seni burada bekliyor" — killer bilgisi yoksa YASAK
- "Her round aynı şeyi yapıyorlar" — kanıt yoksa YASAK
- "Düşman seni kesin okudu" — gözlem değil tahmin

KURAL: Kanıt yoksa tarihsel iddia yapma. Sadece mevcut round'u yorumla.`;

const USER_PROMPT = `Bu bir Valorant round sonu ekran görüntüsü. Şu bilgileri çıkar ve Türkçe coaching feedback ver:

1. Skor
2. Round sonucu (win/loss)
3. Oyuncu öldü mü
4. Ölüm analizi (neden öldü, ne yanlış yaptı)
5. Düşman analizi (düşman pattern'leri, alışkanlıklar)
6. Sonraki round önerisi (somut, uygulanabilir strateji)
7. ÖLÜM POZİSYONU — eğer oyuncu öldüyse, spectator kamera açısından ve HUD bilgisinden:
   - Hangi harita bölgesinde öldü? (örn: "A Short", "B Main", "Mid Catwalk")
   - Valorant callout isimleri kullan
   - Emin değilsen "unknown" döndür, UYDURMA
   - Emin olduğun seviyeyi belirt

JSON formatında döndür:
{
  "round": number,
  "score": "X-Y",
  "result": "win" | "loss",
  "died": boolean,
  "deathAnalysis": "...",
  "enemyAnalysis": ["madde1", "madde2"],
  "nextRoundSuggestion": "...",
  "deathPosition": "bölge adı veya unknown",
  "positionConfidence": "high" | "medium" | "low"
}`;

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

type VisionRequest = {
  image: string; // base64-encoded PNG
  roundHistory?: RoundEvidenceEntry[];
};

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

      // Position pattern detection from memory (medium+ confidence entries)
      const deathPositions = roundHistory
        .filter((r: Record<string, unknown>) => r.died && r.death_position && (r.position_confidence === "high" || r.position_confidence === "medium"))
        .map((r: Record<string, unknown>) => (r.death_position as string).toLowerCase());
      const posCounts: Record<string, number> = {};
      deathPositions.forEach(p => { posCounts[p] = (posCounts[p] || 0) + 1; });
      const topPos = Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0];
      const posNote = topPos && topPos[1] >= 2
        ? `\nPosition pattern (KANITLANMIŞ): ${topPos[0]} bölgesinde ${topPos[1]} kez öldün`
        : "";

      userPromptWithHistory += `\n\nSon round geçmişi (gözlemlenmiş):\n${historyLines.join("\n")}\n${patternNote}${posNote}`;
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
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
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

      // Death position extraction — from spectator cam / scene analysis (NOT minimap icons)
      const deathPosition = typeof (fb as Record<string, unknown>).deathPosition === "string"
        ? ((fb as Record<string, unknown>).deathPosition as string).slice(0, 50)
        : "unknown";
      const posConfRaw = typeof (fb as Record<string, unknown>).positionConfidence === "string"
        ? (fb as Record<string, unknown>).positionConfidence as string
        : "low";
      const positionConfidence = ["high", "medium", "low"].includes(posConfRaw) ? posConfRaw : "low";

      return NextResponse.json({
        round: typeof fb.round === "number" ? fb.round : 0,
        score: typeof fb.score === "string" ? fb.score.slice(0, 10) : "?-?",
        result: fb.result === "win" ? "win" : "loss",
        died: !!fb.died,
        deathAnalysis: fb.deathAnalysis.slice(0, 500),
        enemyAnalysis: fb.enemyAnalysis.slice(0, 5).map((s) => String(s).slice(0, 200)),
        nextRoundSuggestion: fb.nextRoundSuggestion.slice(0, 500),
        deathPosition: deathPosition !== "unknown" ? deathPosition : null,
        positionConfidence: positionConfidence,
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
