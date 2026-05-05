import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { loadKnowledge } from "@/lib/knowledge-loader";
import { checkOutputQuality } from "@/evals/generic-detector";
import { buildPolicyBlock } from "@/lib/ai-policy";
import { sanitizeJsonStrings } from "@/lib/prompt-safety";

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

const BASE_SYSTEM_PROMPT = `Sen AIMLO — Radiant seviye gerçek bir Valorant koçusun. Veriye dayalı, direkt konuş.

DİL — ZORUNLU:
- Türkçe istek → Türkçe çıktı (sokak Türkçesi, sade dil, "deployment"/"optimal" gibi corp dili YASAK).
- İngilizce istek → İngilizce çıktı (clear coach English, no Turkish words mixed in, no corporate jargon).
- AYNI Radiant koç kalitesi her iki dilde — direkt, somut, eylem odaklı.
- Evrensel oyun terimleri her dilde aynı: peek, trade, retake, lurk, anchor, rotate, default, execute, fake, stack, smoke, flash, util, op, dash, spike, eco.
- ⚠ ZAMAN-BAĞIMLI TAVSİYE YASAK. Saniye/timer ("16'da", "45s", "30 saniye", "at 16s") KULLANMA. Olay-bazlı konuş ("1 düşman düştü", "Op sesi duyuldu", "spike kuruldu", "after first kill").

ÇIKTI YAPISI:
1) SORUN — ne oluyor (spesifik pozisyon, round, sayı)
2) NEDEN — mekanik veya karar hatası
3) DÜŞMAN — SADECE kanıt varsa (bkz. düşman analizi koşulu)
4) FIX — somut aksiyon (pozisyon, ability, olay tetikleyicisi referanslı; timer YOK)

İYİ OYNAMA: "Devam et" / "Keep going" YASAK. Ne çalışıyor + neden + nasıl tekrarlanır.
SIDE SPLIT: Attack/defense fark varsa yorumla.

JSON formatında döndür.

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

    // Auth + rate limit (uses dedicated insight tier — 10/min, 60/day)
    const auth = await verifyAuthAndRateLimit(request, "insight");
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

    // Call Anthropic with quality gate (single retry if weak).
    // Recursively sanitize all string values in the context before stringifying
    // — prevents prompt-injection through nested fields like recentMatches[i].note
    // or mapStats.<map>.note that the simple field allow-list above doesn't catch.
    const sanitizedContext = sanitizeJsonStrings(safeContext, { max: 500 });
    const contextJson = JSON.stringify(sanitizedContext, null, 2);
    const baseUserPrompt = `Aşağıdaki oyuncu verisini analiz et ve coaching insight üret:\n\n${contextJson}`;
    const agentCtx = typeof safeContext.mostPlayedAgent === "string" ? safeContext.mostPlayedAgent as string : undefined;

    /**
     * Discriminated result so the caller can distinguish:
     *  - { ok: true, value }       → real model output
     *  - { ok: false, kind: "rate" }    → upstream 429 (surface to client)
     *  - { ok: false, kind: "5xx" }     → upstream 5xx (single retry attempted internally)
     *  - { ok: false, kind: "shape" }   → output didn't parse / wrong shape
     *  - { ok: false, kind: "timeout" } → AbortController fired
     */
    type AICallResult =
      | { ok: true; value: unknown }
      | { ok: false; kind: "rate" | "5xx" | "shape" | "timeout" | "network"; httpStatus?: number };

    const callAI = async (userPrompt: string, attempt = 1): Promise<AICallResult> => {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
      try {
        const res = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "extended-cache-ttl-2025-04-11",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1500,
            // 1h cache for system prompt (KB + policy block) — these are
            // identical for any user with same rank/agent/lang/tone, so the
            // cache amortizes well across many concurrent users.
            system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral", ttl: "1h" } }],
            messages: [{ role: "user", content: userPrompt }],
          }),
          signal: ctrl.signal,
        });
        if (!res.ok) {
          // Upstream rate-limit: surface to client.
          if (res.status === 429) return { ok: false, kind: "rate", httpStatus: 429 };
          // Upstream 5xx: try ONE retry with jittered backoff (200-700ms).
          if (res.status >= 500 && res.status < 600 && attempt === 1) {
            await new Promise(r => setTimeout(r, 200 + Math.random() * 500));
            return callAI(userPrompt, 2);
          }
          return { ok: false, kind: "5xx", httpStatus: res.status };
        }
        const d = await res.json();
        // Token-usage observability.
        const usage = d?.usage as { input_tokens?: number; output_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number } | undefined;
        if (usage) {
          console.log(`[Aimlo AI tokens] insight in=${usage.input_tokens ?? 0} out=${usage.output_tokens ?? 0} cache_create=${usage.cache_creation_input_tokens ?? 0} cache_read=${usage.cache_read_input_tokens ?? 0}`);
        }
        const t: string = d?.content?.[0]?.text || "";
        try { return { ok: true, value: JSON.parse(t) }; } catch {
          const m = t.match(/\{[\s\S]*\}/);
          if (m) {
            try { return { ok: true, value: JSON.parse(m[0]) }; } catch { /* fall through */ }
          }
        }
        return { ok: false, kind: "shape" };
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return { ok: false, kind: "timeout" };
        return { ok: false, kind: "network" };
      } finally {
        clearTimeout(tid);
      }
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
    const first = await callAI(baseUserPrompt);
    if (!first.ok) {
      // Surface upstream errors with proper status — overlay can decide retry policy.
      const status = first.kind === "rate" ? 429
        : first.kind === "timeout" ? 504
        : first.kind === "5xx" ? 502
        : first.kind === "network" ? 502
        : 502;
      const msg = first.kind === "rate" ? "Upstream rate limit"
        : first.kind === "timeout" ? "AI analysis timed out"
        : first.kind === "5xx" ? `AI upstream error (${first.httpStatus})`
        : first.kind === "network" ? "AI network error"
        : "AI returned malformed output";
      console.error(`[Aimlo AI] Insight failed: ${first.kind}${first.httpStatus ? ` (HTTP ${first.httpStatus})` : ""}`);
      return NextResponse.json(
        { error: `ai_${first.kind}`, message: msg },
        {
          status,
          headers: first.kind === "rate" ? { "Retry-After": "60" } : {},
        },
      );
    }
    if (!isValidInsightShape(first.value)) {
      console.error("[Aimlo AI] Insight: shape invalid");
      return NextResponse.json({ error: "ai_shape", message: "Model output missing required fields" }, { status: 502 });
    }

    let output = first.value;
    const score1 = scoreOutput(output);
    console.log(`[Aimlo AI] Insight quality: ${score1}/100`);

    // Quality gate: retry once if below threshold (best-effort, non-fatal).
    if (score1 < 70) {
      const regenPrompt = baseUserPrompt + "\n\n--- QUALITY ENFORCEMENT ---\nPrevious output was too generic. You MUST:\n- Include specific position names (A Short, B Main, etc.)\n- Reference round numbers or percentages\n- Model enemy behavior explicitly\n- Give a clear actionable fix\nDo NOT return vague coaching.";

      const retry = await callAI(regenPrompt);
      if (retry.ok && isValidInsightShape(retry.value)) {
        const score2 = scoreOutput(retry.value);
        console.log(`[Aimlo AI] Insight regen quality: ${score2}/100 (was ${score1})`);
        if (score2 > score1) { output = retry.value; }
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
