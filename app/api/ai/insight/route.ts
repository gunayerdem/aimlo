import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { saveAiUsage } from "@/lib/ai-usage";
import { loadKnowledge } from "@/lib/knowledge-loader";
import { checkOutputQuality } from "@/evals/generic-detector";
import { buildPolicyBlock } from "@/lib/ai-policy";
import { cleanCoachTextDeep } from "@/lib/coach-text";
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

// Vercel function deadline (Pro plan max 300s; we use 60 for AI + cushion).
// Without this export, Vercel kills the function at 15s on Pro silently.
export const maxDuration = 60;
const AI_TIMEOUT_MS = 30_000;
const MAX_PAYLOAD_BYTES = 100_000; // 100KB max
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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

🚫 YASAK TÜRKÇE İFADELER (varyantları dahil):
  PRE-AIM tüm formları:
    "pre-aim ediyordu / ediyor / çekiyor / çekti / yapıyor / yaptı",
    "head pre-aim / head pre-aim'le / pre-aim'le vurdu",
    "head açısını tutuyor / tutarak"   ← Tarzan, YASAK
    → "açıyı tutuyor / açıyı tutuyordu / aynı yere bakıyor"

  "head + Türkçe-fiil" Tarzan (HEPSİ yasak):
    "head atıyor / atıyordu / attı / buldu / buluyor"
    → "kafadan vuruyor / kafadan vurdu / kafadan vuruyordu /
       aynı açıdan kafadan vurdu / aynı yerden kafadan vuruyor"
  Tarzan-Türkçesi ("çek-" yan-fiili utility için yanlış):
    "stun çekiyor"   → "stun atıyor / açıyor / yedirdi"
    "flash çekiyor"  → "flash atıyor"
    "molly çekiyor"  → "molly atıyor / döküyor"
    "smoke çekiyor"  → "smoke atıyor / kapatıyor"
    "ult çekiyor"    → "ult kullanmak (her durum), at- / aç- / patlat- (özel)"
    "peek yapıyor / ediyor"  → "peek atıyor"
    "hold ediyor / yapıyor"  → "açıyı tutuyor"
    "swing yapıyor"           → "swing atıyor"
                                (wide swing → "geniş açıyla yüklen-")
  Slang / lazy:
    "wide swing"     → "geniş açıyla yüklen-"
    "trip" (slang)   → "tuzak / tripwire"
    "op var"         → "Operatör var / OP açıyı tutuyor"
    "yığ" (emir)     → "yüklen / yüklenin"
    "basın" (lazy emir) → spesifik: "Omen smoke + flash ile yüklenin"
    "pick alıyor"    → "kill alıyor"
    "tek vuruş yetti" → spesifik söyle: "head one-tap'ledi"

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

// CORS — insightService.ts (desktop) hits this with a plain browser fetch, so the
// WebView2 preflight needs these headers or the call is silently CORS-blocked (returns
// null → dashboard shows no AI insight). Same safe rationale as /api/support: Bearer
// header auth, no cookies/credentials, so wildcard ACAO grants no abusable access.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const res = await handleInsight(request);
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

async function handleInsight(request: NextRequest) {
  // B68 (2026-07-31): toplam AI bütçesi için istek başlangıcı. maxDuration=60 iken
  // ilk çağrı (30s) + 5xx iç-retry (30s) + kalite-regen (30s) teorik olarak 90s'e
  // çıkabiliyordu → platform fonksiyonu ortasında kesip route'un yapısal
  // {error,message} gövdesi yerine opak 504 döndürüyordu. Aşağıdaki regen kapısı
  // bu damgayı kullanarak kalan bütçeyi kontrol eder.
  const routeStartedAt = Date.now();
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
    // B110 (2026-07-31): saveAiUsage'a userId geçebilmek için doğrulanmış id'yi
    // yakala — aşağıdaki callAI closure'ı bunu kullanır (eskiden userId:null
    // yazılıyordu, /admin/cost insight maliyetini kullanıcıya atfedemiyordu).
    const authedUserId = auth.userId;

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
    const apiKey = process.env.OPENAI_API_KEY;
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
      // F8 (pano dalga, 2026-08-04): AI çağrı süresi ölçümü — yalnız saveAiUsage'a
      // latencyMs geçmek için; 5xx retry'ında recursion yeni ölçüm başlatır.
      const aiStartMs = Date.now();
      try {
        const res = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-5-mini",
            max_completion_tokens: 1500,
            reasoning_effort: "minimal",
            // OpenAI auto-cache: prefix-based, 90% discount on cached tokens.
            // systemPrompt (KB + policy) is the stable prefix; userPrompt is per-call.
            // No explicit cache_control needed — auto-handled.
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            // Insight schema is complex (nested objects, optional fields), so we
            // rely on the prompt's explicit JSON shape spec rather than json_schema
            // strict mode which requires `additionalProperties: false` and all
            // properties in `required` (incompatible with our optional fields).
            response_format: { type: "json_object" },
          }),
          signal: ctrl.signal,
        });
        if (!res.ok) {
          if (res.status === 429) return { ok: false, kind: "rate", httpStatus: 429 };
          if (res.status >= 500 && res.status < 600 && attempt === 1) {
            await new Promise(r => setTimeout(r, 200 + Math.random() * 500));
            return callAI(userPrompt, 2);
          }
          return { ok: false, kind: "5xx", httpStatus: res.status };
        }
        const d = await res.json();
        // OpenAI usage object.
        const usage = d?.usage as { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } } | undefined;
        if (usage) {
          const cached = usage.prompt_tokens_details?.cached_tokens ?? 0;
          console.log(`[Aimlo AI tokens] insight in=${usage.prompt_tokens ?? 0} cached=${cached} out=${usage.completion_tokens ?? 0}`);
          // B110 (2026-07-31): userId:null → authedUserId (kullanıcı-başı maliyet görünürlüğü).
          // F8 (pano dalga, 2026-08-04): latencyMs eklendi (insight'ta matchId yok);
          // lib/ai-usage.ts migration'sız ortamda eski kolon setine düşer.
          saveAiUsage({ userId: authedUserId, routeType: "insight", model: d?.model ?? "gpt-5-mini", promptTokens: usage.prompt_tokens ?? 0, completionTokens: usage.completion_tokens ?? 0, cachedTokens: cached, latencyMs: Date.now() - aiStartMs });
        }
        const t: string = d?.choices?.[0]?.message?.content || "";
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
    // B68 (2026-07-31) BÜTÇE KAPISI: regen ikinci bir 30s'lik AI çağrısıdır.
    // İlk çağrı 5xx iç-retry yapıp ~60s yemişse regen maxDuration=60'ı aşar ve
    // platform fonksiyonu keser → istemci route'un yapısal {error,message}
    // gövdesi yerine opak 504 alır (tam da "AI kötü gününde"). İki savunma:
    //   1) kalan bütçe < ~35s ise regen'i HİÇ başlatma (elde geçerli çıktı var),
    //   2) regen'i attempt=2 ile çağır → callAI'nin kendi 5xx iç-retry'ı kapanır.
    const REGEN_START_BUDGET_MS = 25_000; // maxDuration 60s − AI_TIMEOUT 30s − 5s tampon
    const elapsedBeforeRegen = Date.now() - routeStartedAt;
    if (score1 < 70 && elapsedBeforeRegen >= REGEN_START_BUDGET_MS) {
      console.warn(`[Aimlo AI] Insight regen SKIPPED — bütçe doldu (${elapsedBeforeRegen}ms geçti, skor ${score1}/100)`);
    }
    if (score1 < 70 && elapsedBeforeRegen < REGEN_START_BUDGET_MS) {
      const regenPrompt = baseUserPrompt + "\n\n--- QUALITY ENFORCEMENT ---\nPrevious output was too generic. You MUST:\n- Include specific position names (A Short, B Main, etc.)\n- Reference round numbers or percentages\n- Model enemy behavior explicitly\n- Give a clear actionable fix\nDo NOT return vague coaching.";

      const retry = await callAI(regenPrompt, 2);
      if (retry.ok && isValidInsightShape(retry.value)) {
        const score2 = scoreOutput(retry.value);
        console.log(`[Aimlo AI] Insight regen quality: ${score2}/100 (was ${score1})`);
        if (score2 > score1) { output = retry.value; }
      }
    }

    // Cycle 2 fix #7: run the shared coach-voice cleaner recursively over the
    // nested insight output (dashboardInsight / criticalPattern / growthPlan).
    // cleanCoachTextDeep preserves shape and skips enum/label keys
    // (confidence/category/frequency/matchIndex/title) — string contents only.
    output = cleanCoachTextDeep(output, lang === "en" ? "en" : "tr") as typeof output;

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
