/**
 * AIMLO Skill Score System
 *
 * Scores based on REAL data we can measure:
 * - Survival: How often you stay alive (measurable)
 * - Positioning: Death location variety (measurable)
 * - Decision Making: Win contribution pattern (measurable)
 * - Adaptability: How quickly you stop repeating mistakes (measurable)
 * - Consistency: Performance variance (measurable)
 *
 * NOT included (we can't measure):
 * - Aim (no headshot data)
 * - Utility usage (no ability data)
 * - Economy management (no econ data)
 */

export interface SkillProfile {
  overall: number; // 1-100

  // Core scores (1-100 each)
  survival: number; // How often you survive rounds
  positioning: number; // Death location variety + avoidance of repeated spots
  decisionMaking: number; // Win rate when alive vs when dead, clutch contribution
  adaptability: number; // How fast you stop dying at the same spots
  consistency: number; // Performance variance across matches

  // Rank
  rank: SkillRank;
  rankProgress: number; // 0-100 progress to next rank

  // Explanations (Turkish)
  explanations: {
    survival: string;
    positioning: string;
    decisionMaking: string;
    adaptability: string;
    consistency: string;
  };

  // Trends
  trends: {
    survival: "up" | "down" | "stable";
    positioning: "up" | "down" | "stable";
    decisionMaking: "up" | "down" | "stable";
    overall: "up" | "down" | "stable";
  };
}

export type SkillRank =
  | "Iron"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Ascendant"
  | "Immortal"
  | "Radiant";

interface MatchInput {
  won: boolean;
  rounds: Array<{
    deathLocation?: string;
    survived?: boolean;
    skipped?: boolean;
    result?: string;
    enemyCount?: string;
    yourNote?: string;
  }>;
  map?: string;
  agent?: string;
}

export function calculateSkillProfile(
  allMatches: MatchInput[],
  previousProfile?: SkillProfile | null
): SkillProfile {
  // Collect all rounds
  const allRounds = allMatches.flatMap((m) =>
    m.rounds.filter((r) => !r.skipped)
  );
  if (allRounds.length < 10) {
    // Not enough data — return defaults
    return getDefaultProfile();
  }

  // === SURVIVAL SCORE (1-100) ===
  // Simple: % of rounds you survived, scaled to 1-100
  // Pro players survive ~55-65% of rounds
  const totalRounds = allRounds.length;
  const survivedRounds = allRounds.filter((r) => r.survived).length;
  const survivalRate = survivedRounds / totalRounds; // 0 to 1
  // Scale: 0.3 = 26, 0.5 = 50, 0.7 = 74, 0.8+ = 86
  const survival = Math.min(
    100,
    Math.max(1, Math.round(survivalRate * 120 - 10))
  );

  // === POSITIONING SCORE (1-100) ===
  // Based on: (a) death location diversity (b) NOT dying at same spot repeatedly
  const deathLocs: Record<string, number> = {};
  allRounds
    .filter((r) => !r.survived && r.deathLocation)
    .forEach((r) => {
      deathLocs[r.deathLocation!] = (deathLocs[r.deathLocation!] || 0) + 1;
    });

  const totalDeaths = allRounds.filter((r) => !r.survived).length;
  const uniqueLocations = Object.keys(deathLocs).length;
  const deathCounts = Object.values(deathLocs);
  const maxAtOneSpot = deathCounts.length > 0 ? Math.max(...deathCounts) : 0;
  const concentrationRatio =
    totalDeaths > 0 ? maxAtOneSpot / totalDeaths : 0;
  // Good positioning = diverse deaths, low concentration
  // diversity bonus (0-40) + anti-concentration (0-60)
  const diversityScore = Math.min(40, uniqueLocations * 5);
  const antiConcentration = Math.round((1 - concentrationRatio) * 60);
  const positioning = Math.min(
    100,
    Math.max(1, diversityScore + antiConcentration)
  );

  // === DECISION MAKING (1-100) ===
  // When you survive → did team win? (good decisions keep you alive AND win rounds)
  // When you die → did team still win? (dying in a useful way vs useless death)
  const survivedAndWon = allRounds.filter(
    (r) => r.survived && r.result === "win"
  ).length;
  const survivedTotal = allRounds.filter((r) => r.survived).length;
  const diedAndWon = allRounds.filter(
    (r) => !r.survived && r.result === "win"
  ).length;
  const diedTotal = allRounds.filter((r) => !r.survived).length;

  const aliveWinRate =
    survivedTotal > 0 ? survivedAndWon / survivedTotal : 0.5;
  const deathTradeRate = diedTotal > 0 ? diedAndWon / diedTotal : 0.3; // how often death was "useful"

  const decisionMaking = Math.min(
    100,
    Math.max(1, Math.round(aliveWinRate * 60 + deathTradeRate * 40))
  );

  // === ADAPTABILITY (1-100) ===
  // Compare first half vs second half of rounds — did repeated deaths decrease?
  const halfPoint = Math.floor(allRounds.length / 2);
  const firstHalf = allRounds.slice(0, halfPoint);
  const secondHalf = allRounds.slice(halfPoint);

  const firstHalfRepeats = countRepeatedDeaths(firstHalf);
  const secondHalfRepeats = countRepeatedDeaths(secondHalf);

  let adaptability: number;
  if (firstHalfRepeats === 0 && secondHalfRepeats === 0) {
    adaptability = 75; // no repeated deaths at all = good
  } else if (secondHalfRepeats < firstHalfRepeats) {
    // Improved — fewer repeats in second half
    const improvement =
      (firstHalfRepeats - secondHalfRepeats) / Math.max(firstHalfRepeats, 1);
    adaptability = Math.round(60 + improvement * 40);
  } else if (secondHalfRepeats > firstHalfRepeats) {
    // Got worse
    adaptability = Math.round(
      40 - (secondHalfRepeats - firstHalfRepeats) * 5
    );
  } else {
    adaptability = 50; // same
  }
  adaptability = Math.min(100, Math.max(1, adaptability));

  // === CONSISTENCY (1-100) ===
  // Use per-round win rate variance, not per-match binary
  let consistency: number;
  const roundResults: number[] = allRounds.map((r) =>
    r.result === "win" ? 1 : 0
  );
  // Calculate running variance using windows of 5 rounds
  const windowSize = 5;
  const windowAverages: number[] = [];
  for (let i = 0; i <= roundResults.length - windowSize; i++) {
    const window = roundResults.slice(i, i + windowSize);
    windowAverages.push(window.reduce((a, b) => a + b, 0) / windowSize);
  }
  if (windowAverages.length >= 3) {
    const avg =
      windowAverages.reduce((a, b) => a + b, 0) / windowAverages.length;
    const variance =
      windowAverages.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
      windowAverages.length;
    // variance ranges 0 to ~0.25. Scale: 0=100, 0.1=60, 0.2=20, 0.25=0
    consistency = Math.min(
      100,
      Math.max(1, Math.round(100 - variance * 400))
    );
  } else {
    consistency = 50;
  }

  // === OVERALL ===
  const overall = Math.round(
    survival * 0.25 +
      positioning * 0.2 +
      decisionMaking * 0.25 +
      adaptability * 0.15 +
      consistency * 0.15
  );

  // === RANK ===
  const rank = scoreToRank(overall);
  const rankProgress = calculateRankProgress(overall);

  // === TRENDS ===
  const trends = calculateTrends(allMatches, previousProfile);

  // === EXPLANATIONS ===
  const explanations = {
    survival:
      survival >= 70
        ? "Hayatta kalma oranın yüksek — iyi pozisyon alıyorsun"
        : survival >= 45
          ? "Hayatta kalma oranın ortalama — gereksiz ölümlerden kaçın"
          : "Çok sık ölüyorsun — gereksiz peek ve agresyondan kaçın",
    positioning:
      positioning >= 70
        ? "Farklı pozisyonlar kullanıyorsun — okuması zor"
        : positioning >= 45
          ? "Bazı pozisyonlarda takılıyorsun — çeşitlendir"
          : "Aynı yerlerden sürekli ölüyorsun — çok öngörülebilirsin",
    decisionMaking:
      decisionMaking >= 70
        ? "Hayatta kaldığında roundları kazanıyorsun"
        : decisionMaking >= 45
          ? "Karar verme ortalama — bazı ölümler gereksiz"
          : "Ölümlerin çoğu takıma katkı sağlamıyor — trade pozisyonu kur",
    adaptability:
      adaptability >= 70
        ? "Hatalarını hızlı düzeltiyorsun"
        : adaptability >= 45
          ? "Bazı hataları tekrarlıyorsun — farkındalık artır"
          : "Aynı hataları tekrar ediyorsun — her ölümden ders çıkar",
    consistency:
      consistency >= 70
        ? "Stabil performans gösteriyorsun"
        : consistency >= 45
          ? "Bazı maçlar iyi, bazıları kötü — tutarlılık geliştir"
          : "Performansın çok dalgalı — mental oyunu güçlendir",
  };

  return {
    overall,
    survival,
    positioning,
    decisionMaking,
    adaptability,
    consistency,
    rank,
    rankProgress,
    explanations,
    trends,
  };
}

interface RoundLike {
  survived?: boolean;
  deathLocation?: string;
}

function countRepeatedDeaths(rounds: RoundLike[]): number {
  const locs: Record<string, number> = {};
  rounds
    .filter((r) => !r.survived && r.deathLocation)
    .forEach((r) => {
      locs[r.deathLocation!] = (locs[r.deathLocation!] || 0) + 1;
    });
  return Object.values(locs).filter((c) => c >= 2).length;
}

function scoreToRank(score: number): SkillRank {
  if (score >= 95) return "Radiant";
  if (score >= 85) return "Immortal";
  if (score >= 75) return "Ascendant";
  if (score >= 65) return "Diamond";
  if (score >= 55) return "Platinum";
  if (score >= 45) return "Gold";
  if (score >= 35) return "Silver";
  if (score >= 25) return "Bronze";
  return "Iron";
}

function calculateRankProgress(score: number): number {
  const thresholds = [0, 25, 35, 45, 55, 65, 75, 85, 95, 100];
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (score < thresholds[i + 1]) {
      const range = thresholds[i + 1] - thresholds[i];
      return Math.round(((score - thresholds[i]) / range) * 100);
    }
  }
  return 100;
}

function calculateTrends(
  allMatches: MatchInput[],
  prev: SkillProfile | null | undefined
): SkillProfile["trends"] {
  if (!prev || allMatches.length < 4) {
    return {
      survival: "stable",
      positioning: "stable",
      decisionMaking: "stable",
      overall: "stable",
    };
  }

  // Split matches into recent (last 3) vs older (before that)
  const recent = allMatches.slice(0, 3);
  const older = allMatches.slice(3, 6);
  if (older.length < 2)
    return {
      survival: "stable",
      positioning: "stable",
      decisionMaking: "stable",
      overall: "stable",
    };

  const recentRounds = recent.flatMap((m) =>
    m.rounds.filter((r) => !r.skipped)
  );
  const olderRounds = older.flatMap((m) =>
    m.rounds.filter((r) => !r.skipped)
  );

  function calcSurvival(rounds: MatchInput["rounds"]) {
    return (
      rounds.filter((r) => r.survived).length / Math.max(rounds.length, 1)
    );
  }
  function calcWinRate(rounds: MatchInput["rounds"]) {
    return (
      rounds.filter((r) => r.result === "win").length /
      Math.max(rounds.length, 1)
    );
  }

  const THRESHOLD = 0.08; // 8% change needed to be "improving" or "declining"
  function trend(
    recentVal: number,
    olderVal: number
  ): "up" | "down" | "stable" {
    if (recentVal > olderVal + THRESHOLD) return "up";
    if (recentVal < olderVal - THRESHOLD) return "down";
    return "stable";
  }

  return {
    survival: trend(calcSurvival(recentRounds), calcSurvival(olderRounds)),
    positioning: "stable", // Can't meaningfully trend positioning without more data
    decisionMaking: trend(
      calcWinRate(recentRounds),
      calcWinRate(olderRounds)
    ),
    overall: trend(
      (calcSurvival(recentRounds) + calcWinRate(recentRounds)) / 2,
      (calcSurvival(olderRounds) + calcWinRate(olderRounds)) / 2
    ),
  };
}

function getDefaultProfile(): SkillProfile {
  return {
    overall: 50,
    survival: 50,
    positioning: 50,
    decisionMaking: 50,
    adaptability: 50,
    consistency: 50,
    rank: "Gold",
    rankProgress: 50,
    explanations: {
      survival: "Veri bekleniyor",
      positioning: "Veri bekleniyor",
      decisionMaking: "Veri bekleniyor",
      adaptability: "Veri bekleniyor",
      consistency: "Veri bekleniyor",
    },
    trends: {
      survival: "stable",
      positioning: "stable",
      decisionMaking: "stable",
      overall: "stable",
    },
  };
}
