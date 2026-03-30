import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { loadKnowledge } from "@/lib/knowledge-loader";
import { checkOutputQuality } from "@/evals/generic-detector";
import { buildPolicyBlock } from "@/lib/ai-policy";

/**
 * POST /api/ai/insight
 * Generates dashboard coaching insight from structured match data.
 * Used by the desktop app as a backend proxy for Anthropic API calls.
 *
 * - Requires authenticated user (Supabase JWT)
 * - Rate limited via verifyAuthAndRateLimit
 * - Anthropic API key is server-side only
 */

const AI_TIMEOUT_MS = 20_000;
const MAX_PAYLOAD_BYTES = 100_000; // 100KB max
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const BASE_SYSTEM_PROMPT = `Sen AIMLO — Radiant seviye Valorant koçusun. VCT analisti gibi düşün, veriye dayalı konuş.

ÇIKTI YAPISI:
1) SORUN — ne oluyor (spesifik pozisyon, round, sayı)
2) NEDEN — mekanik veya karar hatası
3) DÜŞMAN — SADECE kanıt varsa (bkz. düşman analizi koşulu)
4) FIX — somut aksiyon (pozisyon/timing/ability referanslı)

İYİ OYNAMA: "Devam et" YASAK. Ne çalışıyor + neden + nasıl tekrarlanır.
SIDE SPLIT: Attack/defense fark varsa yorumla.

Türkçe yanıt ver. JSON formatında döndür.

ÇIKTI FORMATI:
{
  "dashboardInsight": {
    "title": "kısa başlık",
    "insight": "ana yorum (2-3 cümle, veri destekli)",
    "reasoning": "neden bu önemli",
    "suggestedFocus": "bir sonraki maç için odak",
    "confidence": "high|medium|low"
  },
  "criticalPattern": {
    "pattern": "en kritik tekrar eden sorun",
    "frequency": "kaç maçta görüldü",
    "impact": "oyun etkisi",
    "fix": "nasıl düzeltilir"
  },
  "growthPlan": {
    "dailyFocus": "bugünkü ana odak",
    "tasks": [
      {"category": "positioning|decision|mechanical|trade|side-awareness", "task": "spesifik görev", "reason": "neden"}
    ]
  },
  "matchSummaries": [
    {"matchIndex": 0, "miniInsight": "bu maça özgü kısa yorum"}
  ]
}`;

// All policy constants imported from shared source — no local duplicates
function buildSystemPrompt(
  confidenceLevel: string,
  knowledgeContext: string,
  tone?: string,
  lang?: string,
): string {
  const policyBlock = buildPolicyBlock({ confidence: confidenceLevel, tone, lang });
  const knowledgePart = knowledgeContext ? `\n\nKOÇLUK BİLGİ KAYNAĞI:\n${knowledgeContext}` : "";
  return BASE_SYSTEM_PROMPT + policyBlock + knowledgePart;
}

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */

// Allowed context fields — prevents prompt injection via extra fields
const ALLOWED_CONTEXT_FIELDS = [
  "totalMatches", "winRate", "recentWinRate", "olderWinRate", "trend",
  "deathClusters", "topDeathLocation", "repeatedDeathLocations",
  "mapStats", "worstMap", "bestMap",
  "agentStats", "mostPlayedAgent", "survivalRate", "averageDeathsPerMatch",
  "tradeRate", "sideSplit", "confidence", "currentStreak", "consistencyScore",
  "recentMatches", "rank", "tone", "lang",
];

function sanitizeContext(raw: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const key of ALLOWED_CONTEXT_FIELDS) {
    if (key in raw) clean[key] = raw[key];
  }
  return clean;
}

function isValidContext(obj: unknown): obj is { context: Record<string, unknown> } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (!o.context || typeof o.context !== "object") return false;
  const ctx = o.context as Record<string, unknown>;
  return (
    typeof ctx.totalMatches === "number" &&
    typeof ctx.winRate === "number"
  );
}

function isValidInsightShape(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return !!(
    o.dashboardInsight &&
    typeof o.dashboardInsight === "object"
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

    // Auth + rate limit
    const auth = await verifyAuthAndRateLimit(request, "feedback");
    if (!auth.ok) return auth.response;

    // Parse body
    const body = await request.json().catch(() => null);
    if (!isValidContext(body)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { context: MatchContext }" },
        { status: 400 },
      );
    }

    // Sanitize context — only allow known fields (prevents prompt injection)
    const safeContext = sanitizeContext(body.context as Record<string, unknown>);

    // Get API key
    const apiKey = process.env.AIMLO_AI_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[Aimlo AI] Insight: no API key configured");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 },
      );
    }

    // Load rank-aware knowledge for the insight task
    const rank = (safeContext.rank as string) || undefined;
    const agent = (safeContext.mostPlayedAgent as string) || undefined;
    const knowledgeContext = loadKnowledge("insight", { rank, agent });

    // Determine confidence level from context (if provided by desktop)
    const confidenceLevel = typeof safeContext.confidence === "object" && safeContext.confidence !== null
      ? String((safeContext.confidence as Record<string, unknown>).level || "medium")
      : "medium";

    // Build confidence-aware system prompt with knowledge
    // Extract tone and lang from context
    const tone = typeof safeContext.tone === "string" ? safeContext.tone : "strict";
    const lang = typeof safeContext.lang === "string" ? safeContext.lang : "tr";
    const systemPrompt = buildSystemPrompt(confidenceLevel, knowledgeContext, tone, lang);

    // Call Anthropic with quality gate (single retry if weak)
    const contextJson = JSON.stringify(safeContext, null, 2);
    const baseUserPrompt = `Aşağıdaki oyuncu verisini analiz et ve coaching insight üret:\n\n${contextJson}`;
    const agentCtx = typeof safeContext.mostPlayedAgent === "string" ? safeContext.mostPlayedAgent as string : undefined;

    const callAI = async (userPrompt: string): Promise<unknown | null> => {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
      const res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1500, system: systemPrompt, messages: [{ role: "user", content: userPrompt }] }),
        signal: ctrl.signal,
      });
      if (!res.ok) { clearTimeout(tid); return null; }
      const d = await res.json(); clearTimeout(tid);
      const t: string = d?.content?.[0]?.text || "";
      try { return JSON.parse(t); } catch {
        const m = t.match(/\{[\s\S]*\}/);
        if (m) try { return JSON.parse(m[0]); } catch { /* */ }
      }
      return null;
    };

    const scoreOutput = (obj: unknown): number => {
      if (!isValidInsightShape(obj)) return 0;
      const p = obj as Record<string, unknown>;
      const di = p.dashboardInsight as Record<string, unknown> | undefined;
      return checkOutputQuality({
        insight: typeof di?.insight === "string" ? di.insight : undefined,
        summary: typeof di?.reasoning === "string" ? di.reasoning : undefined,
      }, { agent: agentCtx }).score;
    };

    // First attempt
    let output = await callAI(baseUserPrompt);
    if (!output || !isValidInsightShape(output)) {
      console.error("[Aimlo AI] Insight: invalid response");
      return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
    }

    const score1 = scoreOutput(output);
    console.log(`[Aimlo AI] Insight quality: ${score1}/100`);

    // Quality gate: retry once if below threshold
    if (score1 < 70) {
      const regenPrompt = baseUserPrompt + "\n\n--- QUALITY ENFORCEMENT ---\nPrevious output was too generic. You MUST:\n- Include specific position names (A Short, B Main, etc.)\n- Reference round numbers or percentages\n- Model enemy behavior explicitly\n- Give a clear actionable fix\nDo NOT return vague coaching.";

      const retry = await callAI(regenPrompt);
      if (retry && isValidInsightShape(retry)) {
        const score2 = scoreOutput(retry);
        console.log(`[Aimlo AI] Insight regen quality: ${score2}/100 (was ${score1})`);
        if (score2 > score1) { output = retry; }
      }
    }

    return NextResponse.json(output);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Aimlo AI] Insight request timed out");
      return NextResponse.json(
        { error: "AI analysis timed out" },
        { status: 504 },
      );
    }
    console.error(
      "[Aimlo AI] Insight route error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
