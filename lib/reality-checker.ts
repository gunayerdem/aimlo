/**
 * AIMLO Reality Checker
 * Validates AI output claims against actual round memory.
 * Runs AFTER AI generation, BEFORE response to user.
 * Deterministic — no extra AI calls.
 */

// ── Types ──

interface RoundMemoryEntry {
  round_index: number;
  died: boolean;
  death_position?: string | null;
  position_confidence?: string;
}

interface ExtractedClaims {
  claimedCount: number | null;
  claimedWindow: number | null;
  claimedPosition: string | null;
  repetitionClaim: boolean;
}

interface ValidationResult {
  countValid: boolean;
  positionValid: boolean;
  repetitionValid: boolean;
  actualCount: number;
  actualWindow: number;
  rewriteLevel: 1 | 2 | 3;
}

// ── Claim Extraction ──

const COUNT_PATTERNS = [
  /(\d+)\s*kez/i,
  /(\d+)\s*round/i,
  /(\d+)\s*defa/i,
  /(\d+)'[iu]nde/i,
  /(\d+)'[iu]nda/i,
];

const WINDOW_PATTERNS = [
  /son\s+(\d+)\s*round/i,
  /son\s+(\d+)\s*maç/i,
  /son\s+(\d+)/i,
];

const POSITION_NAMES = [
  "a short", "a long", "a main", "a site", "a heaven", "a hell",
  "b short", "b long", "b main", "b site", "b heaven", "b hell",
  "c site", "c long", "c main",
  "mid", "mid top", "mid bottom", "mid doors",
  "market", "garage", "garden", "heaven", "hell",
  "catwalk", "elbow", "cubby", "window", "tree",
  "lobby", "hookah", "lamps", "showers", "link",
  "sewers", "pizza", "wine", "tiles", "u-hall",
  "rafters", "pocket", "generator", "ct spawn",
];

const REPETITION_KEYWORDS = [
  "tekrar eden", "tekrar", "art arda", "sürekli",
  "hep aynı", "aynı bölge", "aynı pozisyon",
  "pattern", "kalıcı",
];

export function extractClaims(text: string): ExtractedClaims {
  const lower = text.toLowerCase();

  // Extract count
  let claimedCount: number | null = null;
  for (const p of COUNT_PATTERNS) {
    const m = lower.match(p);
    if (m) { claimedCount = parseInt(m[1]); break; }
  }

  // Extract window
  let claimedWindow: number | null = null;
  for (const p of WINDOW_PATTERNS) {
    const m = lower.match(p);
    if (m) { claimedWindow = parseInt(m[1]); break; }
  }

  // Extract position
  let claimedPosition: string | null = null;
  for (const pos of POSITION_NAMES) {
    if (lower.includes(pos)) { claimedPosition = pos; break; }
  }

  // Detect repetition claim
  const repetitionClaim = REPETITION_KEYWORDS.some(k => lower.includes(k));

  return { claimedCount, claimedWindow, claimedPosition, repetitionClaim };
}

// ── Memory Validation ──

export function validateClaims(
  claims: ExtractedClaims,
  memory: RoundMemoryEntry[],
): ValidationResult {
  // Filter to reliable entries only (died + position with medium/high confidence)
  const reliableDeaths = memory.filter(r =>
    r.died &&
    r.death_position &&
    (r.position_confidence === "high" || r.position_confidence === "medium")
  );

  const totalRounds = memory.length;

  // Window: use claimed window or all available
  const windowSize = claims.claimedWindow || totalRounds;
  const windowEntries = memory.slice(-windowSize);
  const windowDeaths = windowEntries.filter(r =>
    r.died &&
    r.death_position &&
    (r.position_confidence === "high" || r.position_confidence === "medium")
  );

  // Count matching position
  let actualCount = 0;
  if (claims.claimedPosition) {
    const posLower = claims.claimedPosition.toLowerCase();
    actualCount = windowDeaths.filter(r =>
      (r.death_position || "").toLowerCase().includes(posLower)
    ).length;
  } else {
    actualCount = windowDeaths.length;
  }

  // Validate count
  const countValid = claims.claimedCount === null || claims.claimedCount <= actualCount;

  // Validate position exists in memory
  const positionValid = claims.claimedPosition === null || actualCount > 0;

  // Validate repetition claim
  const repetitionValid = !claims.repetitionClaim || actualCount >= 2;

  // Determine rewrite level
  let rewriteLevel: 1 | 2 | 3;
  if (countValid && positionValid && repetitionValid) {
    rewriteLevel = 1; // all valid
  } else if (positionValid && actualCount >= 1) {
    rewriteLevel = 2; // position exists but count/repetition overclaimed
  } else {
    rewriteLevel = 3; // only current round data available
  }

  return {
    countValid,
    positionValid,
    repetitionValid,
    actualCount,
    actualWindow: windowSize,
    rewriteLevel,
  };
}

// ── Safe Rewrite ──

export function rewriteUnsafeClaims(
  text: string,
  claims: ExtractedClaims,
  validation: ValidationResult,
): string {
  if (validation.rewriteLevel === 1) {
    return text; // all claims verified
  }

  let result = text;

  if (validation.rewriteLevel === 2) {
    // Position valid but count/repetition overclaimed
    // Replace specific count claims with safer language
    if (claims.claimedCount !== null && !validation.countValid) {
      // Replace "3 kez" with actual count or "birden fazla kez"
      const countRegex = new RegExp(`${claims.claimedCount}\\s*kez`, "gi");
      if (validation.actualCount >= 2) {
        result = result.replace(countRegex, `${validation.actualCount} kez`);
      } else {
        result = result.replace(countRegex, "birden fazla kez");
      }
    }

    if (claims.claimedWindow !== null) {
      // Replace specific window with vaguer "son roundlarda"
      const windowRegex = new RegExp(`son\\s+${claims.claimedWindow}\\s*round`, "gi");
      result = result.replace(windowRegex, "son roundlarda");
    }
  }

  if (validation.rewriteLevel === 3) {
    // Only current round valid — strip all historical claims
    // Replace repetition language with current-round-only phrasing
    for (const keyword of REPETITION_KEYWORDS) {
      if (result.toLowerCase().includes(keyword)) {
        result = result.replace(new RegExp(keyword, "gi"), "bu round'da");
      }
    }

    // If position was claimed but not in memory, keep position if from current frame
    // but remove pattern language
    if (claims.claimedCount !== null) {
      const countRegex = new RegExp(`${claims.claimedCount}\\s*kez`, "gi");
      result = result.replace(countRegex, "");
    }
  }

  return result.trim();
}

// ── Main Entry Point ──

/**
 * Validate AI output against round memory.
 * Call this AFTER AI generation, BEFORE returning response.
 *
 * @param outputText - The AI-generated text (deathAnalysis, insight, etc.)
 * @param roundHistory - Current round memory from the watch session
 * @returns Safe text with false claims rewritten
 */
export function realityCheck(
  outputText: string,
  roundHistory: RoundMemoryEntry[],
): { text: string; modified: boolean; rewriteLevel: number } {
  if (!outputText || roundHistory.length === 0) {
    return { text: outputText, modified: false, rewriteLevel: 1 };
  }

  const claims = extractClaims(outputText);

  // If no verifiable claims found, pass through
  if (!claims.claimedCount && !claims.claimedPosition && !claims.repetitionClaim) {
    return { text: outputText, modified: false, rewriteLevel: 1 };
  }

  const validation = validateClaims(claims, roundHistory);
  const safeText = rewriteUnsafeClaims(outputText, claims, validation);

  return {
    text: safeText,
    modified: safeText !== outputText,
    rewriteLevel: validation.rewriteLevel,
  };
}
