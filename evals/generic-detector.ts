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
const PASS_THRESHOLD = 60;

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
  context?: { map?: string; agent?: string }
): QualityCheckResult {
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
      score -= 15 * found.length;
    }
  }

  // --- Minimum word count per field ---
  for (const field of fields) {
    const wc = countWords(field.text);
    if (wc < MIN_WORD_COUNT) {
      issues.push(
        `${field.name} is too short (${wc} words, minimum ${MIN_WORD_COUNT})`
      );
      score -= 10;
    }
  }

  // --- Numeric reference count ---
  const numericReferenceCount = countNumericReferences(allText);
  if (numericReferenceCount === 0) {
    issues.push("No numeric references (stats, percentages, round numbers) found in output");
    score -= 20;
  } else if (numericReferenceCount <= 2) {
    // Acceptable but not great -- small deduction
    score -= 5;
  }
  // 3+ is good, no deduction

  // --- Map reference ---
  const hasMapReference =
    containsAny(allText, VALORANT_MAPS) ||
    (context?.map ? allTextLower.includes(toLower(context.map)) : false);

  if (!hasMapReference) {
    issues.push("No Valorant map name referenced in output");
    score -= 10;
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
    score -= 10;
  }

  // --- Side reference ---
  const hasSideReference = containsAny(allText, SIDE_KEYWORDS);
  if (!hasSideReference) {
    issues.push("No attack/defense side reference in output");
    score -= 5;
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
