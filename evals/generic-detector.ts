// --------------------------------------------------------------------------
// AIMLO AI Output Quality Checker
// Detects generic, low-quality, or hallucination-prone coaching outputs.
// --------------------------------------------------------------------------

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-100
  issues: string[]; // list of detected problems
  metrics: {
    genericPhraseCount: number;
    numericReferenceCount: number;
    wordCount: number;
    hasMapReference: boolean;
    hasAgentReference: boolean;
    hasPositionReference: boolean;
    hasSideReference: boolean;
  };
}

// --------------- Constants ---------------

const FORBIDDEN_PHRASES: string[] = [
  "daha dikkatli oyna",
  "dikkatli ol",
  "bilgi topla",
  "pozisyonunu geliştir",
  "takımınla oyna",
  "utility kullan",
  "daha iyi karar ver",
  "play carefully",
  "gather information",
  "improve positioning",
  "play with team",
  "use utility",
  "farklı dene",
  "farklı bir şey dene",
  "daha iyi oyna",
  "gelişmeye devam et",
  "iyi gidiyorsun",
  "be better",
  "try different",
  "keep improving",
  "daha verimli kullan",
  "daha agresif oyna",
  "daha yaratıcı kullan",
  // Cycle 2 fix #15 — enemy-gate / "not enough data" filler the vision route
  // must never emit (mirrors ai-policy BANNED_PHRASES additions).
  "düşman analizi için yeterli veri yok",
  "yeterli veri yok",
  "düşman iyi oynadı",
];

const VALORANT_MAPS: string[] = [
  "ascent",
  "bind",
  "haven",
  "split",
  "icebox",
  "breeze",
  "fracture",
  "pearl",
  "lotus",
  "sunset",
  "abyss",
];

const VALORANT_AGENTS: string[] = [
  "jett",
  "reyna",
  "raze",
  "phoenix",
  "neon",
  "yoru",
  "iso",
  "sage",
  "skye",
  "gekko",
  "kayo",
  "kay/o",
  "breach",
  "fade",
  "sova",
  "cypher",
  "killjoy",
  "chamber",
  "deadlock",
  "omen",
  "brimstone",
  "astra",
  "viper",
  "harbor",
  "clove",
  "vyse",
  "tejo",
  "waylay",
];

const VALORANT_POSITIONS: string[] = [
  "a short",
  "a long",
  "a main",
  "a site",
  "a heaven",
  "a hell",
  "b short",
  "b long",
  "b main",
  "b site",
  "b heaven",
  "b hell",
  "c site",
  "c long",
  "c main",
  "mid",
  "mid top",
  "mid bottom",
  "mid doors",
  "market",
  "garage",
  "garden",
  "heaven",
  "hell",
  "ct spawn",
  "t spawn",
  "attacker spawn",
  "defender spawn",
  "catwalk",
  "elbow",
  "cubby",
  "window",
  "tree",
  "lobby",
  "hookah",
  "lamps",
  "showers",
  "link",
  "sewers",
  "pizza",
  "wine",
  "tiles",
  "u-hall",
  "rafters",
  "pocket",
];

const SIDE_KEYWORDS: string[] = [
  "attack",
  "defense",
  "defence",
  "atak",
  "savunma",
  "attacking",
  "defending",
  "attacker",
  "defender",
];

const MIN_WORD_COUNT = 10;
const PASS_THRESHOLD = 65;

// --------------- Helpers ---------------

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function toLower(text: string): string {
  return text.toLocaleLowerCase("tr");
}

function countNumericReferences(text: string): number {
  const patterns = [
    /\d+(\.\d+)?%/g, // percentages like 38%
    /yüzde\s*\d+/gi, // Turkish "yüzde 50"
    /\bR\d+\b/g, // round refs like R1, R12
    /\bRound\s*\d+/gi, // "Round 1"
    /\braund\s*\d+/gi, // Turkish "raund 1"
    /\b\d+\s*(kill|death|assist|ölüm|öldürme)/gi, // stat counts
    /\b\d+\/\d+/g, // ratios like 3/5
  ];

  const matches = new Set<string>();
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      matches.add(match[0]);
    }
  }

  // Also count standalone numbers that look like stats (2+ digits or contextual)
  const standaloneNumbers = text.match(/\b\d{1,3}\b/g) || [];
  // Only count numbers that are not already part of the above matches
  const existingMatchText = Array.from(matches).join(" ");
  for (const num of standaloneNumbers) {
    if (!existingMatchText.includes(num)) {
      matches.add(`standalone_${num}_${Math.random()}`);
    }
  }

  return matches.size;
}

function containsAny(text: string, terms: string[]): boolean {
  const lower = toLower(text);
  return terms.some((term) => lower.includes(toLower(term)));
}

function findForbiddenPhrases(text: string): string[] {
  const lower = toLower(text);
  return FORBIDDEN_PHRASES.filter((phrase) => lower.includes(toLower(phrase)));
}

function getFirstNWords(text: string, n: number): string {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, n)
    .join(" ")
    .toLocaleLowerCase("tr");
}

// --------------- Main checker ---------------

export function checkOutputQuality(
  output: {
    deathAnalysis?: string;
    enemyPatterns?: string | string[];
    nextRoundPlan?: string;
    insight?: string;
    summary?: string;
    mistake?: string;
  },
  // Cycle 2 fix #15: optional `route:'vision'` opts into vision-specific checks
  // (max-sentence guard, lower per-item word floor, relaxed numeric-ref) so the
  // report/feedback scoring stays UNCHANGED when the flag is absent.
  context?: { map?: string; agent?: string; route?: "vision" }
): QualityCheckResult {
  const isVision = context?.route === "vision";
  const issues: string[] = [];
  let score = 100;

  // Flatten all text fields into an array for per-field and aggregate checks
  const fields: { name: string; text: string }[] = [];

  const addField = (name: string, value: string | string[] | undefined) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => fields.push({ name: `${name}[${i}]`, text: v }));
    } else {
      fields.push({ name, text: value });
    }
  };

  addField("deathAnalysis", output.deathAnalysis);
  addField("enemyPatterns", output.enemyPatterns);
  addField("nextRoundPlan", output.nextRoundPlan);
  addField("insight", output.insight);
  addField("summary", output.summary);
  addField("mistake", output.mistake);

  if (fields.length === 0) {
    return {
      passed: false,
      score: 0,
      issues: ["No output fields provided"],
      metrics: {
        genericPhraseCount: 0,
        numericReferenceCount: 0,
        wordCount: 0,
        hasMapReference: false,
        hasAgentReference: false,
        hasPositionReference: false,
        hasSideReference: false,
      },
    };
  }

  const allText = fields.map((f) => f.text).join(" ");
  const allTextLower = toLower(allText);
  const totalWordCount = countWords(allText);

  // --- Forbidden phrase check ---
  let genericPhraseCount = 0;
  for (const field of fields) {
    const found = findForbiddenPhrases(field.text);
    if (found.length > 0) {
      genericPhraseCount += found.length;
      issues.push(
        `Forbidden phrase(s) in ${field.name}: ${found.map((p) => `"${p}"`).join(", ")}`
      );
      score -= 30 * found.length;
    }
  }

  // --- Minimum word count per field ---
  // Cycle 2 fix #15(4): make the floor field-aware. enemyAnalysis array items
  // are terse-but-specific counters (~6-12 words); a flat 10-word floor
  // false-fails good output. Array items (name has "[") get a lower floor.
  for (const field of fields) {
    const wc = countWords(field.text);
    const floor = field.name.includes("[") ? 6 : MIN_WORD_COUNT;
    if (wc < floor) {
      issues.push(
        `${field.name} is too short (${wc} words, minimum ${floor})`
      );
      score -= 10;
    }
  }

  // --- Max sentence / narration guard (vision only) ---
  // Cycle 2 fix #15(3): vision schema caps deathAnalysis / nextRoundSuggestion
  // at 1-2 sentences. >2 sentences = narration creep (the old "max 4 cümle"
  // contradiction). Only enforced for the vision route so report/feedback
  // (longer fields by design) are unaffected.
  if (isVision) {
    for (const field of fields) {
      if (!/deathAnalysis|nextRound/i.test(field.name)) continue;
      const sentenceCount = field.text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
      if (sentenceCount > 2) {
        issues.push(`${field.name} is too long / narration (${sentenceCount} sentences, max 2)`);
        score -= 15;
      }
    }
  }

  // --- Numeric reference count ---
  // Cycle 2 fix #15(5): the vision route legitimately has no match-level stats
  // (after fix #2 it anchors on OCR truth, not invented numbers) — so the
  // numeric-ref deduction would punish correct output. Skip it for vision.
  const numericReferenceCount = countNumericReferences(allText);
  if (!isVision) {
    if (numericReferenceCount === 0) {
      issues.push("No numeric references (stats, percentages, round numbers) found in output");
      score -= 25;
    } else if (numericReferenceCount <= 1) {
      score -= 10;
    }
    // 3+ is good, no deduction
  }

  // --- Map reference ---
  const hasMapReference =
    containsAny(allText, VALORANT_MAPS) ||
    (context?.map ? allTextLower.includes(toLower(context.map)) : false);

  if (!hasMapReference) {
    issues.push("No Valorant map name referenced in output");
    score -= 15;
  }

  // --- Agent reference ---
  const hasAgentReference =
    containsAny(allText, VALORANT_AGENTS) ||
    (context?.agent ? allTextLower.includes(toLower(context.agent)) : false);

  if (!hasAgentReference) {
    issues.push("No Valorant agent name referenced in output");
    score -= 5;
  }

  // --- Position reference ---
  const hasPositionReference = containsAny(allText, VALORANT_POSITIONS);
  if (!hasPositionReference) {
    issues.push("No Valorant position callout referenced in output");
    score -= 25;
  }

  // --- Side reference ---
  const hasSideReference = containsAny(allText, SIDE_KEYWORDS);
  if (!hasSideReference) {
    issues.push("No attack/defense side reference in output");
    score -= 5;
  }

  // --- Enemy behavior presence check ---
  const ENEMY_KEYWORDS = ["düşman", "enemy", "rakip", "opponent", "pre-aim", "exploit", "adapt", "bekliy", "okuy", "stack", "rotate"];
  const hasEnemyBehavior = ENEMY_KEYWORDS.some(k => allTextLower.includes(k));
  if (!hasEnemyBehavior) {
    issues.push("No enemy behavior modeling in output");
    score -= 25;
  }

  // --- Actionability check (clear next step) ---
  const ACTION_KEYWORDS = ["yap", "dene", "değiştir", "geç", "koy", "at", "tut", "oyna", "switch", "change", "use ", "try ", "hold", "play "];
  const hasAction = ACTION_KEYWORDS.some(k => allTextLower.includes(k));
  if (!hasAction) {
    issues.push("No actionable next step in output");
    score -= 25;
  }

  // --- Vague verb / fake specificity detection ---
  // NOTE: "biraz daha" is added (vague comparative), but bare "biraz" is NOT —
  // it false-positives in legitimate concrete sentences.
  const VAGUE_PATTERNS = [
    "geliştir", "improve", "adjust", "iyileştir", "düzelt", "farklı dene",
    "daha iyi", "try different", "be better",
    "genelde", "genel olarak", "biraz daha", "şöyle böyle", "galiba",
    "sanırım", "bir şekilde", "aşağı yukarı", "kabaca", "çoğunlukla",
  ];
  const vagueCount = VAGUE_PATTERNS.filter(p => allTextLower.includes(p)).length;
  if (vagueCount >= 1) {
    issues.push(`Vague verbs detected (${vagueCount})`);
    score -= 15 * vagueCount;
  }

  // --- Tarzanca (broken EN-noun+TR-verb jargon) detection ---
  // Deterministic regression guard for the jargon the model still leaks and the
  // TR_JARGON net should have scrubbed. Any hit = a real defect (-30 each).
  const TARZANCA = [
    "head atıyor", "head attı", "head buldu", "swing yapıyor", "swing yaptın",
    "peek yapıyor", "hold ediyor", "hold yapıyor", "pre-aim",
    "stun çekiyor", "flash çekiyor", "smoke çekiyor", "pick alıyor", "cezalandır",
    // Cycle 2 fix #15 — additional leaks observed / guarded this cycle.
    "kill aldı", "frag verdi", "frag verir", "shift walk", "predict",
    "blade storm", "swing yap",
  ];
  const tarzancaHits = TARZANCA.filter(p => allTextLower.includes(p));
  if (tarzancaHits.length > 0) {
    issues.push(`Tarzanca jargon detected: ${tarzancaHits.map(p => `"${p}"`).join(", ")}`);
    score -= 30 * tarzancaHits.length;
  }

  // --- Silver-banned ability codename detection ---
  // Reader is Silver/Gold — official ability codenames must be plainified
  // (ability-plain-map). A leaked codename = a real defect (-30 each).
  const SILVER_BANNED = [
    "cloudburst", "curveball", "snake bite", "recon bolt", "owl drone",
    "trapwire", "blade storm", "showstopper", "poison cloud", "toxic screen",
    // Cycle 2 fix #15 — more official codenames that must be plainified.
    "nebula", "poison cloud", "cyber cage", "barrier orb", "dismiss",
    "tailwind", "fault line",
  ];
  const silverHits = SILVER_BANNED.filter(p => allTextLower.includes(p));
  if (silverHits.length > 0) {
    issues.push(`Silver-banned ability codename(s): ${silverHits.map(p => `"${p}"`).join(", ")}`);
    score -= 30 * silverHits.length;
  }

  // --- Repeated template detection ---
  if (fields.length >= 2) {
    const firstWords = fields.map((f) => getFirstNWords(f.text, 5));
    const seen = new Map<string, string[]>();
    for (let i = 0; i < firstWords.length; i++) {
      const key = firstWords[i];
      if (!key || key.split(/\s+/).length < 5) continue;
      const list = seen.get(key) || [];
      list.push(fields[i].name);
      seen.set(key, list);
    }
    seen.forEach((names, phrase) => {
      if (names.length >= 2) {
        issues.push(
          `Repeated template detected: fields ${names.join(", ")} share the same opening ("${phrase}...")`
        );
        score -= 15;
      }
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    passed: score >= PASS_THRESHOLD,
    score,
    issues,
    metrics: {
      genericPhraseCount,
      numericReferenceCount,
      wordCount: totalWordCount,
      hasMapReference,
      hasAgentReference,
      hasPositionReference,
      hasSideReference,
    },
  };
}

// --------------- Field-level scoring ---------------

export interface FieldScore {
  field: string;
  score: number; // 0-100
  weak: boolean;
  issues: string[];
}

/**
 * Score individual fields separately to identify which is weakest.
 * Returns per-field scores + the name of the weakest field.
 */
export function scoreFields(
  fields: Record<string, string | string[] | undefined>,
  context?: { map?: string; agent?: string },
): { scores: FieldScore[]; weakest: string | null } {
  const results: FieldScore[] = [];

  for (const [name, value] of Object.entries(fields)) {
    if (!value) continue;
    const text = Array.isArray(value) ? value.join(" ") : value;
    let s = 100;
    const issues: string[] = [];

    // Forbidden phrases
    const forbidden = findForbiddenPhrases(text);
    if (forbidden.length > 0) { s -= 20 * forbidden.length; issues.push("generic phrase"); }

    // Word count
    if (countWords(text) < MIN_WORD_COUNT) { s -= 15; issues.push("too short"); }

    // Numeric references
    const numRefs = countNumericReferences(text);
    if (numRefs === 0) { s -= 25; issues.push("no data reference"); }

    // Position reference
    if (!containsAny(text, VALORANT_POSITIONS)) { s -= 15; issues.push("no position"); }

    // Agent reference
    if (context?.agent && !toLower(text).includes(toLower(context.agent))) {
      if (!containsAny(text, VALORANT_AGENTS)) { s -= 10; issues.push("no agent"); }
    }

    results.push({ field: name, score: Math.max(0, Math.min(100, s)), weak: s < 60, issues });
  }

  // Find weakest
  let weakest: string | null = null;
  let minScore = 101;
  for (const r of results) {
    if (r.score < minScore) { minScore = r.score; weakest = r.field; }
  }

  return { scores: results, weakest };
}
