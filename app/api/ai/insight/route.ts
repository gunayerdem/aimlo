import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { loadKnowledge } from "@/lib/knowledge-loader";
import { checkOutputQuality } from "@/evals/generic-detector";

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

ÇIKTI YAPISI (HER YORUM İÇİN ZORUNLU):
1) SORUN — ne oluyor (spesifik pozisyon, round, sayı)
2) NEDEN — mekanik veya karar hatası
3) DÜŞMAN — düşman ne exploit ediyor, ne bekliyor, nasıl adapte olacak
4) FIX — somut, uygulanabilir aksiyon (pozisyon/timing/ability referanslı)
Bu 4 bileşen eksikse output GEÇERSİZ.

FORMAT KURALI:
- Max 4 cümle. Her cümle bilgi taşımalı. Paragraf YASAK.
- Her fix'te MİNİMUM 2 varyasyon veya koşullu mantık sun ("A yap VEYA B yap")
- Tek fix YASAK — düşman tek fix'e adapte olur
- Spesifik pozisyon ZORUNLU: "A Short", "B Main entry", "Generator off-angle" gibi mikro-pozisyon
- "Site", "mid", "pozisyon" tek başına KABUL EDİLMEZ — nerede olduğunu söyle

SIFIR SAHTE AI:
- Veride OLMAYAN bilgiyi UYDURMA. Veri yoksa "veri yetersiz" de.
- Her cümlede veri referansı ZORUNLU: pozisyon adı, yüzde, maç sayısı veya round no
- YASAK KALIPLAR: "farklı dene", "daha dikkatli ol", "pozisyonunu geliştir", "daha iyi oyna", "gelişmeye devam et", "iyi gidiyorsun", "daha verimli kullan", "daha agresif oyna"
- İstatistik tekrarı YASAK — yorumla, sadece sayı verme

KANIT SEVİYESİ:
- Veri kanıtlıyorsa → kesin dil ("Son 5 maçta 3 kez A Short'ta öldün")
- Veri gösteriyorsa ama kesin değilse → çıkarım dili ("Bu pattern tekrar ediyor olabilir")
- Veri yoksa → iddia yapma ("Bu konuda yeterli veri yok")
- "Düşman seni okuyor" → SADECE tekrar eden ölüm pattern'i kanıtlanmışsa söylenebilir

DÜŞMAN MODELİ (ZORUNLU):
- Düşman senin pattern'ini OKUYOR: aynı açı = pre-aim, aynı timing = bekleme
- Düşman ne YAPACAK: adapte olacak mı, stack mı atacak, utility mi saklayacak
- Counter: oyuncu nasıl bir adım önde kalır
- COUNTER-ADAPTATION ZORUNLU: "Bu fix'i de öğrenirse..." ile başlayan bir sonraki adım

İYİ OYNAMA DURUMU:
- "Devam et" YASAK. Bunun yerine:
  - Ne çalışıyor (spesifik davranış)
  - Neden çalışıyor (düşman ne yapamıyor)
  - Nasıl tekrarlanır (2-3 adım)
  - Düşman nasıl adapte olur + counter

SIDE SPLIT:
- Attack/defense fark varsa MUTLAKA yorumla
- Side weakness verisini kullan

CROSS-MATCH:
- Birden fazla maç varsa pattern değişimini referans et
- Veri yoksa uydurmak yerine "ilk veriler" de

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

// Confidence-aware prompt additions
const CONFIDENCE_PROMPTS: Record<string, string> = {
  calibrating: "\n\nDİKKAT: Veri çok sınırlı (kalibrasyon aşaması). Kesin ifadeler kullanma. 'Henüz yeterli veri yok ama ilk gözlemler...' gibi ihtimalli dil kullan. Güçlü tavsiye verme.",
  low: "\n\nDİKKAT: Veri sınırlı. İhtimalli dil kullan — 'görünüyor ki', 'muhtemelen', 'erken verilere göre'. Kesin kalıp tespiti yapma. Genel yönelim göster ama 'her zaman' gibi ifadelerden kaçın.",
  medium: "\n\nVeri orta düzeyde. Gözlenen pattern'leri belirt ama 'bu trend devam ederse' gibi koşullu dil kullanabilirsin. Net tavsiye verebilirsin ama kesin kalıp tespitinde dikkatli ol.",
  high: "\n\nVeri yeterli. Net, doğrudan ve güvenli ifadeler kullanabilirsin. Pattern'leri kesin olarak belirt. Somut, uygulanabilir tavsiyeler ver.",
};

// Tone modes — controls coaching style
const TONE_PROMPTS: Record<string, string> = {
  strict: `\n\nTON: SERT KOÇ
- Doğrudan konuş, yuvarlama
- Hata varsa net söyle, yumuşatma
- Övgü sadece gerçekten kazanıldıysa
- Kısa cümleler, fluff yok
- Koç gibi konuş, arkadaş gibi değil
- Sert ton SADECE tekrar eden hatalarda ve ciddi sorunlarda kullan
- Her output'ta aynı sert kalıbı tekrarlama — cümle yapısını çeşitle
- "bu kabul edilemez" gibi kalıpları her çıktıda KULLANMA, sadece gerçekten kritik ve tekrar eden pattern'lerde kullan`,
  balanced: `\n\nTON: DENGELİ KOÇ
- Net ama saygılı
- Hataları belirt, açıkla, yönlendir
- Başarıyı tanı ama abartma
- Öğretici ton, ne yapılmalı odaklı`,
  analytical: `\n\nTON: ANALİTİK
- Sıfır duygu, saf veri ve mantık
- "Veriler X gösteriyor, bu Y anlamına geliyor, Z yapılmalı"
- Yorum değil analiz
- Rakamlar ve pattern'ler konuşsun`,
};

// Hybrid language rules — gaming terms stay English
const HYBRID_LANGUAGE_RULE = `\n\nDİL KURALI:
Cümleler Türkçe olacak AMA oyun terimleri İngilizce kalacak.
İngilizce KALACAK terimler: peek, trade, dash, entry, utility, angle, timing, setup, execute, rotate, lurk, anchor, retake, default, swing, jiggle, smoke, flash, molly, lineup, post-plant, anti-eco, eco, save, force buy, op, spray, one-tap, crosshair, off-angle, site, plant, defuse, clutch, ace
YANLIŞ: "yetenek kullan", "tuzak kur", "kurulum yap"
DOĞRU: "utility kullanmadan entry atıyorsun", "aynı setup'a tekrar giriyorsun", "post-plant positioning'in zayıf"`;

// Cross-match personalization instruction
const PERSONALIZATION_RULE = `\n\nKİŞİSELLEŞTİRME KURALI:
Eğer context'te birden fazla maç verisi varsa, cross-match referansı yap:
- "Son maçlarda A Short sorunu azalmış ama B Main'de yeni pattern oluşmuş"
- "Bu pattern 3+ maçta tekrar ediyor — kalıcı hale gelmiş"
GÜVENLİK: Sadece veride GERÇEKTEN OLAN pattern'leri referans et. Uydurma trend veya geçmiş maç referansı YAPMA. Veri yoksa veya yetersizse geçmiş maç hakkında yorum yapma — sadece mevcut veriyi analiz et.`;

function buildSystemPrompt(
  confidenceLevel: string,
  knowledgeContext: string,
  tone?: string,
  lang?: string,
): string {
  const confidenceAddition = CONFIDENCE_PROMPTS[confidenceLevel] || CONFIDENCE_PROMPTS.medium;
  const toneAddition = TONE_PROMPTS[tone || "strict"] || TONE_PROMPTS.strict;
  const knowledgePart = knowledgeContext ? `\n\nKOÇLUK BİLGİ KAYNAĞI:\n${knowledgeContext}` : "";
  const langRule = (lang === "en") ? "" : HYBRID_LANGUAGE_RULE;
  return BASE_SYSTEM_PROMPT + toneAddition + confidenceAddition + PERSONALIZATION_RULE + langRule + knowledgePart;
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
