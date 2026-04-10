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
  const totalRounds = memory.length;

  // FIX #1: Window MUST be strict — only use last N rounds for windowed claims
  const windowSize = claims.claimedWindow
    ? Math.min(claims.claimedWindow, totalRounds)
    : totalRounds;
  const windowEntries = memory.slice(-windowSize);

  // FIX #2: ONLY count HIGH or MEDIUM confidence — LOW NEVER counted
  const windowDeaths = windowEntries.filter(r =>
    r.died === true &&
    typeof r.death_position === "string" &&
    r.death_position.length > 0 &&
    (r.position_confidence === "high" || r.position_confidence === "medium")
  );

  // Count matching position within window
  let actualCount = 0;
  if (claims.claimedPosition) {
    const posLower = claims.claimedPosition.toLowerCase();
    actualCount = windowDeaths.filter(r =>
      (r.death_position || "").toLowerCase().includes(posLower)
    ).length;
  } else {
    actualCount = windowDeaths.length;
  }

  // Validate count — claimed must be <= actual
  const countValid = claims.claimedCount === null || claims.claimedCount <= actualCount;

  // Validate position exists in windowed memory
  const positionValid = claims.claimedPosition === null || actualCount > 0;

  // FIX #4: Repetition requires actualCount >= 2, no exceptions
  const repetitionValid = !claims.repetitionClaim || actualCount >= 2;

  // Determine rewrite level
  let rewriteLevel: 1 | 2 | 3;
  if (countValid && positionValid && repetitionValid) {
    rewriteLevel = 1;
  } else if (positionValid && actualCount >= 1) {
    rewriteLevel = 2;
  } else {
    rewriteLevel = 3;
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
    if (claims.claimedCount !== null && !validation.countValid) {
      const countRegex = new RegExp(`${claims.claimedCount}\\s*kez`, "gi");
      if (validation.actualCount >= 2) {
        result = result.replace(countRegex, `${validation.actualCount} kez`);
      } else {
        result = result.replace(countRegex, "");
      }
    }

    if (claims.claimedWindow !== null) {
      const windowRegex = new RegExp(`son\\s+${claims.claimedWindow}\\s*round`, "gi");
      result = result.replace(windowRegex, "son roundlarda");
    }

    // FIX #3+#4: If repetition invalid, strip ALL repetition language at level 2 too
    if (!validation.repetitionValid) {
      for (const keyword of REPETITION_KEYWORDS) {
        if (result.toLowerCase().includes(keyword)) {
          result = result.replace(new RegExp(keyword, "gi"), "");
        }
      }
    }
  }

  if (validation.rewriteLevel === 3) {
    // No memory support — strip ALL historical and repetition claims
    for (const keyword of REPETITION_KEYWORDS) {
      if (result.toLowerCase().includes(keyword)) {
        result = result.replace(new RegExp(keyword, "gi"), "bu round'da");
      }
    }

    // Remove count claims entirely
    if (claims.claimedCount !== null) {
      const countRegex = new RegExp(`${claims.claimedCount}\\s*kez`, "gi");
      result = result.replace(countRegex, "");
    }

    // Remove window claims
    if (claims.claimedWindow !== null) {
      const windowRegex = new RegExp(`son\\s+${claims.claimedWindow}\\s*(round|maç)`, "gi");
      result = result.replace(windowRegex, "");
    }

    // Remove "pattern" word if no pattern proven
    result = result.replace(/\bpattern\b/gi, "");
  }

  // Clean up double spaces and trailing punctuation issues
  result = result.replace(/\s{2,}/g, " ").trim();

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
