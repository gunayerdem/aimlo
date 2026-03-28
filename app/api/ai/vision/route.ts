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

const SYSTEM_PROMPT =
  "Sen AIMLO, profesyonel bir Valorant koçusun. Ekran görüntüsünü analiz et ve round feedback ver. JSON formatında döndür.";

const USER_PROMPT = `Bu bir Valorant round sonu ekran görüntüsü. Şu bilgileri çıkar ve Türkçe coaching feedback ver:

1. Skor
2. Round sonucu (win/loss)
3. Oyuncu öldü mü
4. Ölüm analizi (neden öldü, ne yanlış yaptı)
5. Düşman analizi (düşman pattern'leri, alışkanlıklar)
6. Sonraki round önerisi (somut, uygulanabilir strateji)

JSON formatında döndür:
{
  "round": number,
  "score": "X-Y",
  "result": "win" | "loss",
  "died": boolean,
  "deathAnalysis": "...",
  "enemyAnalysis": ["madde1", "madde2"],
  "nextRoundSuggestion": "..."
}`;

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

type VisionRequest = {
  image: string; // base64-encoded PNG
};

type RoundFeedback = {
  round: number;
  score: string;
  result: string;
  died: boolean;
  deathAnalysis: string;
  enemyAnalysis: string[];
  nextRoundSuggestion: string;
};

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */

function isValidVisionRequest(obj: unknown): obj is VisionRequest {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return typeof o.image === "string" && o.image.length > 100;
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
                text: USER_PROMPT,
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
      return NextResponse.json({
        round: typeof fb.round === "number" ? fb.round : 0,
        score: typeof fb.score === "string" ? fb.score.slice(0, 10) : "?-?",
        result: fb.result === "win" ? "win" : "loss",
        died: !!fb.died,
        deathAnalysis: fb.deathAnalysis.slice(0, 500),
        enemyAnalysis: fb.enemyAnalysis.slice(0, 5).map((s) => String(s).slice(0, 200)),
        nextRoundSuggestion: fb.nextRoundSuggestion.slice(0, 500),
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
