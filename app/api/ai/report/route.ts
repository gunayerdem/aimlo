import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";

/**
 * POST /api/ai/report
 * Generates end-of-match coaching report.
 *
 * - ANTHROPIC_API_KEY set → AI text fields + deterministic stats
 * - ANTHROPIC_API_KEY missing → deterministic only
 * - All paths guaranteed to return valid ReportResponse shape
 */

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */
type RoundData = {
  roundNumber: number;
  deathLocation: string;
  enemyCount: string;
  yourNote: string;
  result: "win" | "loss";
  skipped: boolean;
  survived: boolean;
};

type ReportRequest = {
  setup: {
    map: string;
    agent: string;
    side: string;
    teamComp: string[];
    enemyComp: string[];
    unknownEnemyComp: boolean;
  };
  rounds: RoundData[];
  lang: "tr" | "en";
  score: { yours: string; enemy: string };
};

type ReportResponse = {
  summary: string;
  mistake: string;
  tendencies: string;
  adjustment: string;
  won: number;
  lost: number;
  skipped: number;
  survivedCount: number;
  total: number;
  winPct: number;
  scoreStr: string;
  matchWon: boolean;
};

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */
const MAX_ROUNDS = 50;
const MAX_NOTE_LENGTH = 500;
const AI_TIMEOUT_MS = 20_000;
const MAX_PROMPT_ROUNDS = 30; // limit rounds sent to AI prompt
const VALID_RESULTS = new Set(["win", "loss"]);
const VALID_LANGS = new Set(["tr", "en"]);
const VALID_SIDES = new Set(["attack", "defense"]);
const VALID_SCORES = new Set([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
]);

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */
function sanitize(s: unknown, maxLen: number): string {
  if (typeof s !== "string") return "";
  return s.slice(0, maxLen).trim();
}

function validateRequest(
  body: unknown,
): { valid: true; data: ReportRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object")
    return { valid: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;

  // setup
  const setup = b.setup as Record<string, unknown> | undefined;
  if (!setup || typeof setup !== "object")
    return { valid: false, error: "Missing setup" };
  if (typeof setup.map !== "string" || !setup.map)
    return { valid: false, error: "Missing setup.map" };
  if (typeof setup.agent !== "string" || !setup.agent)
    return { valid: false, error: "Missing setup.agent" };
  if (!VALID_SIDES.has(setup.side as string))
    return { valid: false, error: "Invalid setup.side" };

  // lang
  if (!VALID_LANGS.has(b.lang as string))
    return { valid: false, error: "Invalid lang" };

  // score
  const score = b.score as Record<string, unknown> | undefined;
  if (!score || typeof score !== "object")
    return { valid: false, error: "Missing score" };
  const yours = sanitize(score.yours, 3);
  const enemy = sanitize(score.enemy, 3);
  if (!VALID_SCORES.has(yours) || !VALID_SCORES.has(enemy)) {
    return { valid: false, error: "Invalid score values" };
  }

  // rounds — tolerate missing/empty
  const rawRounds = Array.isArray(b.rounds)
    ? b.rounds.slice(0, MAX_ROUNDS)
    : [];
  const rounds: RoundData[] = rawRounds
    .filter(
      (r): r is Record<string, unknown> => r != null && typeof r === "object",
    )
    .map((r) => ({
      roundNumber: typeof r.roundNumber === "number" ? r.roundNumber : 0,
      deathLocation: sanitize(r.deathLocation, 100),
      enemyCount: sanitize(r.enemyCount, 5),
      yourNote: sanitize(r.yourNote, MAX_NOTE_LENGTH),
      result: VALID_RESULTS.has(r.result as string)
        ? (r.result as "win" | "loss")
        : "loss",
      skipped: Boolean(r.skipped),
      survived: Boolean(r.survived),
    }));

  return {
    valid: true,
    data: {
      setup: {
        map: sanitize(setup.map, 50),
        agent: sanitize(setup.agent, 50),
        side: setup.side as string,
        teamComp: Array.isArray(setup.teamComp)
          ? (setup.teamComp as string[]).slice(0, 5).map((s) => sanitize(s, 50))
          : [],
        enemyComp: Array.isArray(setup.enemyComp)
          ? (setup.enemyComp as string[])
              .slice(0, 5)
              .map((s) => sanitize(s, 50))
          : [],
        unknownEnemyComp: Boolean(setup.unknownEnemyComp),
      },
      rounds,
      lang: b.lang as "tr" | "en",
      score: { yours, enemy },
    },
  };
}

function isValidAITextFields(
  obj: unknown,
): obj is {
  summary: string;
  mistake: string;
  tendencies: string;
  adjustment: string;
} {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.summary === "string" &&
    o.summary.length > 0 &&
    typeof o.mistake === "string" &&
    o.mistake.length > 0 &&
    typeof o.tendencies === "string" &&
    o.tendencies.length > 0 &&
    typeof o.adjustment === "string" &&
    o.adjustment.length > 0
  );
}

/* ══════════════════════════════════════════════════════════
   DETERMINISTIC REPORT — stable, no randomness
   ══════════════════════════════════════════════════════════ */
function generateDeterministicReport(body: ReportRequest): ReportResponse {
  const { setup, rounds, lang, score } = body;
  const isTr = lang === "tr";
  const safeRounds = (rounds || []).filter(
    (r): r is RoundData => r != null && typeof r === "object",
  );
  const won = safeRounds.filter((r) => r.result === "win").length;
  const lost = safeRounds.filter((r) => r.result === "loss").length;
  const skipped = safeRounds.filter((r) => r.skipped).length;
  const survivedCount = safeRounds.filter(
    (r) => r.survived && !r.skipped,
  ).length;
  const total = safeRounds.length;
  const winPct = total > 0 ? Math.round((won / total) * 100) : 0;
  const nonSkipped = safeRounds.filter((r) => !r.skipped);
  const locationCounts: Record<string, number> = {};
  nonSkipped
    .filter((r) => !r.survived)
    .forEach((r) => {
      if (r.deathLocation)
        locationCounts[r.deathLocation] =
          (locationCounts[r.deathLocation] || 0) + 1;
    });
  const topLoc = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];
  const topDeathLoc = topLoc ? topLoc[0] : "N/A";
  const topDeathCount = topLoc ? topLoc[1] : 0;
  const avgEnemy =
    nonSkipped.length > 0
      ? (
          nonSkipped.reduce((s, r) => s + Number(r.enemyCount || 0), 0) /
          nonSkipped.length
        ).toFixed(1)
      : "0";
  const sideLabel = isTr
    ? setup.side === "attack"
      ? "Saldırı"
      : "Savunma"
    : setup.side === "attack"
      ? "Attack"
      : "Defense";
  const scoreStr = `${score.yours} - ${score.enemy}`;
  const matchWon = Number(score.yours) > Number(score.enemy);
  const allNotes = nonSkipped
    .map((r) => (r.yourNote || "").toLowerCase())
    .join(" ");
  const hasRotateIssue = /rotat|rotasyon|döndüm/.test(allNotes);
  const hasSoloIssue = /solo|tek/.test(allNotes);
  const hasUtilIssue = /util|ability|yetenek/.test(allNotes);
  const survivedText =
    survivedCount > 0
      ? isTr
        ? ` ${survivedCount} round'da hayatta kaldın.`
        : ` Survived ${survivedCount} rounds.`
      : "";
  const summary = isTr
    ? `${setup.map} haritasında ${setup.agent} ile ${sideLabel} tarafında oynadın. Skor: ${scoreStr}. ${total} round (${skipped} atlanan).${survivedText} En çok ölüm: ${topDeathLoc} (${topDeathCount}x). Ort. düşman: ${avgEnemy}.`
    : `Played ${setup.map} as ${setup.agent} on ${sideLabel}. Score: ${scoreStr}. ${total} rounds (${skipped} skipped).${survivedText} Most deaths: ${topDeathLoc} (${topDeathCount}x). Avg enemy: ${avgEnemy}.`;
  let mistake: string;
  if (topDeathCount >= 3) {
    mistake = isTr
      ? `${topDeathLoc} konumunda ${topDeathCount} kez öldün. Bu tekrar düşmana okuma kolaylığı sağlıyor.`
      : `You died at ${topDeathLoc} ${topDeathCount} times. This makes you predictable.`;
  } else if (hasRotateIssue) {
    mistake = isTr
      ? "Birden fazla round'da erken rotasyon sorunu yaşadın."
      : "Early rotation issues in multiple rounds.";
  } else if (hasSoloIssue) {
    mistake = isTr
      ? "Solo oynadığını belirttin. Takım koordinasyonu eksik."
      : "Playing solo noted. Team coordination lacking.";
  } else if (hasUtilIssue) {
    mistake = isTr
      ? "Utility zamanlamanla ilgili sorunlar tespit edildi."
      : "Issues with utility timing detected.";
  } else {
    mistake = isTr
      ? "Genel pozisyonlama sorunları göze çarpıyor."
      : "General positioning issues stand out.";
  }
  const enemyAgents = setup.unknownEnemyComp
    ? isTr
      ? "bilinmiyor"
      : "unknown"
    : (setup.enemyComp || []).filter(Boolean).join(", ");
  const tendencies = isTr
    ? `Düşman (${enemyAgents}) ort. ${avgEnemy} kişilik gruplarla hareket etti. ${matchWon ? "Baskı yapsa da takımın karşılık verdi." : "Sayısal üstünlükle baskı kurdu."}`
    : `Enemy (${enemyAgents}) moved in groups avg ${avgEnemy}. ${matchWon ? "Despite pressure, team responded." : "Applied pressure with numbers."}`;
  const adjustment = isTr
    ? `${topDeathLoc !== "N/A" ? `${topDeathLoc} yerine farklı açılardan oyna. ` : ""}${setup.agent} olarak utility'ni stratejik zamanla. ${matchWon ? "İyi performans, pozisyon çeşitliliğini artır." : "Retake pozisyonlarına erken geç."}`
    : `${topDeathLoc !== "N/A" ? `Play different angles instead of ${topDeathLoc}. ` : ""}As ${setup.agent}, time utility strategically. ${matchWon ? "Good performance, increase positional variety." : "Set up retake earlier."}`;
  return {
    summary,
    mistake,
    tendencies,
    adjustment,
    won,
    lost,
    skipped,
    survivedCount,
    total,
    winPct,
    scoreStr,
    matchWon,
  };
}

/* ══════════════════════════════════════════════════════════
   AI REPORT — with timeout, validation, safe prompt
   ══════════════════════════════════════════════════════════ */
async function generateAIReport(body: ReportRequest): Promise<ReportResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const stats = generateDeterministicReport(body);

  if (!apiKey) return stats;

  const { setup, rounds, lang, score } = body;
  const isTr = lang === "tr";

  const systemPrompt = `You are AIMLO, an expert Valorant analyst. Generate a match report.
Respond ONLY in ${isTr ? "Turkish" : "English"}.
Return ONLY valid JSON with exactly these 4 string fields: summary, mistake, tendencies, adjustment.
Each field: 1-3 sentences max. Be specific, actionable. No markdown, no code blocks, just JSON.`;

  // Build round summary — truncated, sanitized
  const safeRounds = (rounds || []).filter(
    (r): r is RoundData => r != null && typeof r === "object" && !r.skipped,
  );
  const roundSummary = safeRounds
    .slice(0, MAX_PROMPT_ROUNDS)
    .map((r) => {
      const note = (r.yourNote || "")
        .replace(/["\\\n\r\t]/g, " ")
        .slice(0, 150);
      return `R${r.roundNumber}: ${r.result}${r.survived ? " (alive)" : ` died@${r.deathLocation || "?"} vs ${r.enemyCount || "?"}`} <note>${note}</note>`;
    })
    .join("\n");

  const userPrompt = `Map: ${setup.map}, Agent: ${setup.agent}, Side: ${setup.side}
Score: ${score.yours}-${score.enemy} (${Number(score.yours) > Number(score.enemy) ? "WIN" : "LOSS"})
Team: ${(setup.teamComp || []).join(",")} vs Enemy: ${setup.unknownEnemyComp ? "unknown" : (setup.enemyComp || []).join(",")}
Rounds:\n${roundSummary}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      console.error(`[Aimlo AI] Report API ${response.status}`);
      return stats;
    }

    // Parse body with timeout still active
    const data = await response.json();
    clearTimeout(timeoutId);
    const text: string = data?.content?.[0]?.text || "";

    // Parse AI JSON — try direct first, then regex fallback
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[^{}]*\}/);
      if (!jsonMatch) {
        console.error("[Aimlo AI] No JSON in report response");
        return stats;
      }
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.error("[Aimlo AI] Invalid JSON in report response");
        return stats;
      }
    }

    // Validate shape + merge with stats (stats always provides numeric fields)
    if (isValidAITextFields(parsed)) {
      return {
        ...stats,
        summary: parsed.summary.slice(0, 1000),
        mistake: parsed.mistake.slice(0, 1000),
        tendencies: parsed.tendencies.slice(0, 1000),
        adjustment: parsed.adjustment.slice(0, 1000),
      };
    }

    console.error(
      "[Aimlo AI] Report invalid shape:",
      JSON.stringify(parsed).slice(0, 200),
    );
    return stats;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Aimlo AI] Report request timed out");
    } else {
      console.error(
        "[Aimlo AI] Report exception:",
        err instanceof Error ? err.message : "unknown",
      );
    }
    return stats;
  }
}

/* ══════════════════════════════════════════════════════════
   ROUTE HANDLER
   ══════════════════════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    // Auth + rate limit check
    const auth = await verifyAuthAndRateLimit(request);
    if (!auth.ok) return auth.response;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validation = validateRequest(rawBody);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const report = await generateAIReport(validation.data);
    return NextResponse.json(report);
  } catch (err) {
    console.error(
      "[Aimlo API] Report route error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
