import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/feedback
 * Generates round-by-round coaching feedback.
 *
 * - When ANTHROPIC_API_KEY is set → real AI with deterministic fallback
 * - When not set → deterministic only
 * - All paths guaranteed to return valid FeedbackResponse shape
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

type FeedbackRequest = {
  setup: {
    map: string;
    agent: string;
    side: string;
    teamComp: string[];
    enemyComp: string[];
    unknownEnemyComp: boolean;
  };
  form: {
    deathLocation: string;
    enemyCount: string;
    yourNote: string;
  };
  result: "win" | "loss";
  allRounds: RoundData[];
  lang: "tr" | "en";
  survived: boolean;
};

type FeedbackResponse = {
  mainMistake: string;
  enemyHabit: string;
  microPlan: string;
};

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */
const MAX_NOTE_LENGTH = 500;
const MAX_ROUNDS = 50;
const AI_TIMEOUT_MS = 15_000;
const VALID_RESULTS = new Set(["win", "loss"]);
const VALID_LANGS = new Set(["tr", "en"]);
const VALID_SIDES = new Set(["attack", "defense"]);

const MAP_LOCATIONS: Record<string, string[]> = {
  Ascent: [
    "A Main",
    "A Short",
    "A Site",
    "A Heaven",
    "B Main",
    "B Site",
    "B Market",
    "Mid Top",
    "Mid Bottom",
    "Mid Cubby",
    "Tree",
    "CT Spawn",
    "Garden",
  ],
  Bind: [
    "A Short",
    "A Bath",
    "A Site",
    "A Lamps",
    "A Tower",
    "B Long",
    "B Short",
    "B Site",
    "B Elbow",
    "B Garden",
    "B Hall",
    "Hookah",
    "CT Spawn",
  ],
  Haven: [
    "A Main",
    "A Short",
    "A Site",
    "A Sewer",
    "B Main",
    "B Site",
    "B Back",
    "C Main",
    "C Long",
    "C Site",
    "C Cubby",
    "Garage",
    "Mid Window",
    "CT Spawn",
  ],
  Split: [
    "A Main",
    "A Ramp",
    "A Rafters",
    "A Site",
    "A Heaven",
    "B Main",
    "B Heaven",
    "B Site",
    "B Back",
    "Mid Vent",
    "Mid Mail",
    "Mid Top",
    "CT Spawn",
  ],
  Lotus: [
    "A Main",
    "A Root",
    "A Site",
    "A Rubble",
    "A Tree",
    "B Main",
    "B Upper",
    "B Site",
    "B Pillar",
    "C Main",
    "C Mound",
    "C Site",
    "C Hall",
    "CT Spawn",
  ],
  Sunset: [
    "A Main",
    "A Elbow",
    "A Site",
    "A Alley",
    "B Main",
    "B Market",
    "B Site",
    "B Boba",
    "Mid Top",
    "Mid Bottom",
    "Mid Courtyard",
    "CT Spawn",
  ],
  Icebox: [
    "A Main",
    "A Belt",
    "A Site",
    "A Nest",
    "A Pipes",
    "B Main",
    "B Orange",
    "B Site",
    "B Green",
    "B Yellow",
    "Mid Boiler",
    "Mid Blue",
    "CT Spawn",
  ],
  Breeze: [
    "A Main",
    "A Hall",
    "A Site",
    "A Cave",
    "A Bridge",
    "B Main",
    "B Elbow",
    "B Site",
    "B Back",
    "Mid Pillar",
    "Mid Nest",
    "CT Spawn",
  ],
  Fracture: [
    "A Main",
    "A Dish",
    "A Site",
    "A Drop",
    "A Rope",
    "B Main",
    "B Arcade",
    "B Site",
    "B Tree",
    "B Tower",
    "Mid Hall",
    "CT Spawn",
  ],
  Pearl: [
    "A Main",
    "A Art",
    "A Site",
    "A Dugout",
    "B Main",
    "B Long",
    "B Site",
    "B Hall",
    "B Link",
    "Mid Plaza",
    "Mid Top",
    "CT Spawn",
  ],
  Abyss: [
    "A Main",
    "A Short",
    "A Site",
    "A Ramp",
    "B Main",
    "B Site",
    "B Tower",
    "B Ramp",
    "Mid Link",
    "Mid Bridge",
    "CT Spawn",
  ],
};

/* ══════════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════════ */
function sanitizeString(s: unknown, maxLen: number): string {
  if (typeof s !== "string") return "";
  return s.slice(0, maxLen).trim();
}

function validateRequest(
  body: unknown,
): { valid: true; data: FeedbackRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object")
    return { valid: false, error: "Invalid request body" };
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

  // form
  const form = b.form as Record<string, unknown> | undefined;
  if (!form || typeof form !== "object")
    return { valid: false, error: "Missing form" };

  // result, lang, survived
  if (!VALID_RESULTS.has(b.result as string))
    return { valid: false, error: "Invalid result" };
  if (!VALID_LANGS.has(b.lang as string))
    return { valid: false, error: "Invalid lang" };
  if (typeof b.survived !== "boolean")
    return { valid: false, error: "Invalid survived" };

  // allRounds — tolerate missing/non-array
  const allRounds = Array.isArray(b.allRounds)
    ? b.allRounds.slice(0, MAX_ROUNDS)
    : [];

  return {
    valid: true,
    data: {
      setup: {
        map: sanitizeString(setup.map, 50),
        agent: sanitizeString(setup.agent, 50),
        side: setup.side as string,
        teamComp: Array.isArray(setup.teamComp)
          ? (setup.teamComp as string[]).slice(0, 5)
          : [],
        enemyComp: Array.isArray(setup.enemyComp)
          ? (setup.enemyComp as string[]).slice(0, 5)
          : [],
        unknownEnemyComp: Boolean(setup.unknownEnemyComp),
      },
      form: {
        deathLocation: sanitizeString(form.deathLocation, 100),
        enemyCount: sanitizeString(form.enemyCount, 5),
        yourNote: sanitizeString(form.yourNote, MAX_NOTE_LENGTH),
      },
      result: b.result as "win" | "loss",
      allRounds: allRounds.map((r: Record<string, unknown>) => ({
        roundNumber: typeof r.roundNumber === "number" ? r.roundNumber : 0,
        deathLocation: sanitizeString(r.deathLocation, 100),
        enemyCount: sanitizeString(r.enemyCount, 5),
        yourNote: sanitizeString(r.yourNote, MAX_NOTE_LENGTH),
        result: VALID_RESULTS.has(r.result as string)
          ? (r.result as "win" | "loss")
          : "loss",
        skipped: Boolean(r.skipped),
        survived: Boolean(r.survived),
      })),
      lang: b.lang as "tr" | "en",
      survived: b.survived as boolean,
    },
  };
}

function isValidFeedbackShape(obj: unknown): obj is FeedbackResponse {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.mainMistake === "string" &&
    o.mainMistake.length > 0 &&
    typeof o.enemyHabit === "string" &&
    o.enemyHabit.length > 0 &&
    typeof o.microPlan === "string" &&
    o.microPlan.length > 0
  );
}

/* ══════════════════════════════════════════════════════════
   DETERMINISTIC FEEDBACK — stable, no Math.random
   ══════════════════════════════════════════════════════════ */
function generateDeterministicFeedback(
  body: FeedbackRequest,
): FeedbackResponse {
  const { setup, form, result, allRounds, lang, survived } = body;
  const isTr = lang === "tr";
  const loc =
    form.deathLocation || (isTr ? "bilinmeyen konum" : "unknown location");
  const cnt = form.enemyCount;
  const note = (form.yourNote || "").toLowerCase();
  const sideLabel = isTr
    ? setup.side === "attack"
      ? "saldırı"
      : "savunma"
    : setup.side === "attack"
      ? "attack"
      : "defense";

  // Safe filter — tolerate broken allRounds entries
  const safeRounds = (allRounds || []).filter(
    (r): r is RoundData => r != null && typeof r === "object",
  );
  const prevDeaths = safeRounds.filter(
    (r) => !r.skipped && !r.survived && r.deathLocation === loc,
  );
  const repeatCount = prevDeaths.length;

  let mistake: string;
  if (survived) {
    mistake =
      result === "win"
        ? isTr
          ? "Hayatta kaldın ve round kazanıldı. İyi iş! Pozisyonunu korumaya devam et."
          : "You survived and won. Good job! Keep holding your position."
        : isTr
          ? "Hayatta kaldın ama round kaybedildi. Takım koordinasyonunu gözden geçir."
          : "You survived but the round was lost. Review team coordination.";
  } else if (repeatCount >= 2) {
    mistake = isTr
      ? `${loc} konumunda daha önce ${repeatCount} kez öldün. Farklı bir açıya geçmeyi düşün.`
      : `You've died at ${loc} ${repeatCount} times before. Consider switching to a different angle.`;
  } else if (Number(cnt) >= 3) {
    mistake = isTr
      ? `${loc} konumunda ${cnt} düşmana karşı sayısal dezavantajdaydın. Geri çekilip bilgi vermeliydin.`
      : `You faced ${cnt} enemies at ${loc}. Fall back and call info.`;
  } else if (
    note.includes("rotate") ||
    note.includes("rotasyon") ||
    note.includes("döndüm")
  ) {
    mistake = isTr
      ? `Rotasyonun ${loc} bölgesinde seni açık bıraktı. ${sideLabel} tarafında erken rotasyon düşmana kolay entry verir.`
      : `Your rotation left you exposed at ${loc}. On ${sideLabel}, rotating early gives easy entry.`;
  } else if (note.includes("solo") || note.includes("tek")) {
    mistake = isTr
      ? `${loc} bölgesinde solo oynaman riskli oldu. Takım desteği olmadan tutunamaman normal.`
      : `Playing solo at ${loc} was risky. It's expected to struggle without team support.`;
  } else if (
    note.includes("util") ||
    note.includes("ability") ||
    note.includes("yetenek")
  ) {
    mistake = isTr
      ? `Utility sonrası ${loc} konumunda savunmasız kaldın. Util sonrası kısa bekleme ekle.`
      : `After using utility you were vulnerable at ${loc}. Add a short delay after ability usage.`;
  } else {
    mistake = isTr
      ? `${loc} konumunda pozisyonun ${sideLabel} tarafı için ideal değildi. Daha korunaklı bir açı seçmeliydin.`
      : `Your position at ${loc} wasn't ideal for ${sideLabel}. Choose a more covered angle.`;
  }

  const nonSkipped = safeRounds.filter((r) => !r.skipped);
  const avgEnemy =
    nonSkipped.length > 0
      ? (
          nonSkipped.reduce((s, r) => s + Number(r.enemyCount || 0), 0) /
          nonSkipped.length
        ).toFixed(1)
      : cnt || "0";

  let habit: string;
  if (survived && !cnt) {
    habit = isTr
      ? "Düşman hareket kalıplarını izlemeye devam et."
      : "Keep observing enemy movement patterns.";
  } else if (Number(cnt) >= 4) {
    habit = isTr
      ? `Düşman bu bölgeye ${cnt} kişiyle geldi. Yoğun baskı devam ediyor.`
      : `The enemy pushed with ${cnt} players. Heavy pressure continues.`;
  } else if (Number(cnt) <= 2) {
    habit = isTr
      ? `Düşman ${cnt} kişiyle hareket etti. Temkinli oyun veya lurker paterni.`
      : `Enemy moved with ${cnt} players. Cautious play or lurker pattern.`;
  } else {
    habit = isTr
      ? `Düşman ortalama ${avgEnemy} kişilik gruplarla baskı yapıyor.`
      : `Enemy pressing with groups averaging ${avgEnemy}.`;
  }

  // Deterministic location suggestion — hash-based, not random
  const altLocations = (MAP_LOCATIONS[setup.map] ?? []).filter(
    (x) => x !== loc,
  );
  const hashIndex =
    altLocations.length > 0
      ? (loc.length + safeRounds.length + (cnt ? Number(cnt) : 0)) %
        altLocations.length
      : 0;
  const suggestedLoc =
    altLocations[hashIndex] ||
    loc ||
    (isTr ? "farklı bir pozisyon" : "a different position");

  let microPlan: string;
  if (survived && result === "win") {
    microPlan = isTr
      ? "İyi gidiyorsun. Aynı stratejiyi koru, hafif açı değişikliği düşün."
      : "You're doing well. Keep strategy, consider slight angle changes.";
  } else if (survived && result === "loss") {
    microPlan = isTr
      ? "Bireysel olarak iyiydin ama takım kaybetti. Daha erken bilgi ver ve trade pozisyonu kur."
      : "You played well but team lost. Share info earlier and set up trades.";
  } else if (result === "loss" && repeatCount >= 2) {
    microPlan = isTr
      ? `${suggestedLoc} konumunda oyna. Derin açı tut ve ilk bilgiyi bekle.`
      : `Play ${suggestedLoc}. Hold a deep angle and wait for first info.`;
  } else if (result === "loss" && Number(cnt) >= 3) {
    microPlan = isTr
      ? `Retake oyna. ${suggestedLoc} civarında geri dur ve takımını bekle.`
      : `Play retake. Fall back near ${suggestedLoc} and wait for team.`;
  } else if (result === "loss") {
    microPlan = isTr
      ? `${suggestedLoc} konumuna geç. Utility'ni erken kullan ve geri çekil.`
      : `Switch to ${suggestedLoc}. Use utility early and fall back.`;
  } else {
    microPlan = isTr
      ? `Aynı stratejiyi koru ama açını hafifçe değiştir. ${suggestedLoc} iyi alternatif.`
      : `Keep strategy but shift angle. ${suggestedLoc} could be good.`;
  }

  return { mainMistake: mistake, enemyHabit: habit, microPlan };
}

/* ══════════════════════════════════════════════════════════
   AI FEEDBACK — with timeout, validation, safe prompt
   ══════════════════════════════════════════════════════════ */
async function generateAIFeedback(
  body: FeedbackRequest,
): Promise<FeedbackResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return generateDeterministicFeedback(body);

  const { setup, form, result, allRounds, lang, survived } = body;
  const isTr = lang === "tr";

  const systemPrompt = `You are AIMLO, an expert Valorant coach. Analyze the round data and give actionable feedback.
Respond ONLY in ${isTr ? "Turkish" : "English"}.
Return ONLY valid JSON with exactly these 3 string fields: mainMistake, enemyHabit, microPlan.
Each field: 1-2 sentences max. Be specific. No markdown, no code blocks, just JSON.`;

  // Sanitized user prompt — note is truncated and escaped
  const safeNote = form.yourNote.replace(/["\\\n\r\t]/g, " ").slice(0, 300);
  const roundCount = Array.isArray(allRounds) ? allRounds.length : 0;
  const roundsWon = Array.isArray(allRounds)
    ? allRounds.filter((r) => r.result === "win").length
    : 0;
  const repeatDeaths = Array.isArray(allRounds)
    ? allRounds.filter(
        (r) =>
          !r.skipped && !r.survived && r.deathLocation === form.deathLocation,
      ).length
    : 0;

  const userPrompt = `Map: ${setup.map}, Agent: ${setup.agent}, Side: ${setup.side}
${survived ? "Player survived this round." : `Death location: ${form.deathLocation}, Enemies faced: ${form.enemyCount}`}
Player note: ${safeNote}
Round result: ${result}
Previous rounds: ${roundCount} played, ${roundsWon} won
Repeated death at same location: ${repeatDeaths} times`;

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
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[Aimlo AI] API ${response.status}`);
      return generateDeterministicFeedback(body);
    }

    const data = await response.json();
    const text: string = data?.content?.[0]?.text || "";

    // Try direct JSON parse first, then regex fallback
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[^{}]*\}/);
      if (!jsonMatch) {
        console.error("[Aimlo AI] No JSON in response");
        return generateDeterministicFeedback(body);
      }
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.error("[Aimlo AI] Invalid JSON extracted");
        return generateDeterministicFeedback(body);
      }
    }

    if (isValidFeedbackShape(parsed)) {
      return {
        mainMistake: parsed.mainMistake.slice(0, 500),
        enemyHabit: parsed.enemyHabit.slice(0, 500),
        microPlan: parsed.microPlan.slice(0, 500),
      };
    }

    console.error(
      "[Aimlo AI] Invalid shape:",
      JSON.stringify(parsed).slice(0, 200),
    );
    return generateDeterministicFeedback(body);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Aimlo AI] Request timed out");
    } else {
      console.error(
        "[Aimlo AI] Exception:",
        err instanceof Error ? err.message : "unknown",
      );
    }
    return generateDeterministicFeedback(body);
  }
}

/* ══════════════════════════════════════════════════════════
   ROUTE HANDLER
   ══════════════════════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
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

    const feedback = await generateAIFeedback(validation.data);
    return NextResponse.json(feedback);
  } catch (err) {
    console.error(
      "[Aimlo API] Feedback route error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
