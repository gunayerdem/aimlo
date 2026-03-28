import type { RoundData, SetupData } from "@/types";

// ─── Exported Interfaces ────────────────────────────────────────────────────

export interface PatternData {
  // Death patterns
  deathLocationFrequency: Record<string, number>;
  repeatedDeathLocations: string[];
  deathsWithoutTrade: number;

  // Death-inferred patterns (named for what they actually measure)
  deathSiteConcentration: {
    site: string;
    frequency: number;
    confidence: "high" | "medium" | "low";
  }[];
  repeatedDeathPositions: {
    agent: string;
    behavior: string;
    roundsSeen: number;
  }[];
  deathTimingPattern: "fast" | "slow" | "mixed";

  // Player patterns
  playerWeakSide: "attack" | "defense" | null;
  playerWeakMap: string | null;
  survivalRate: number;

  // Trends
  winStreak: number;
  lossStreak: number;
  recentPerformance: "improving" | "declining" | "stable";

  // Data confidence based on volume: <10 rounds = low, 10-20 = medium, >20 = high
  overallConfidence: "low" | "medium" | "high";
}

export interface DeathContext {
  location: string;
  killer: string;
  weapon: string;
  reason:
    | "overpeek"
    | "no_trade"
    | "bad_timing"
    | "utility_miss"
    | "isolated"
    | "repeated_position";
  timesAtSameLocation: number;
  wasTraded: boolean;
}

export interface MatchInsights {
  topMistake: string;
  weakestArea: string;
  bestRound: number;
  worstPattern: string;
  decisionScore: number;
  improvementAreas: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractSite(location: string): string | null {
  if (!location) return null;
  const loc = location.toLowerCase();
  if (loc.startsWith("a ") || loc.includes(" a ") || loc === "a") return "A";
  if (loc.startsWith("b ") || loc.includes(" b ") || loc === "b") return "B";
  if (loc.startsWith("c ") || loc.includes(" c ") || loc === "c") return "C";
  if (
    loc.includes("mid") ||
    loc.includes("market") ||
    loc.includes("garage") ||
    loc.includes("window") ||
    loc.includes("connector")
  )
    return "Mid";
  return null;
}

function computeStreak(
  rounds: RoundData[],
  target: "win" | "loss",
): number {
  let streak = 0;
  for (let i = rounds.length - 1; i >= 0; i--) {
    const r = rounds[i];
    if (r.skipped) continue;
    if (r.result === target) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function confidenceFromFrequency(
  freq: number,
  total: number,
): "high" | "medium" | "low" {
  if (total === 0) return "low";
  const ratio = freq / total;
  if (ratio >= 0.6) return "high";
  if (ratio >= 0.4) return "medium";
  return "low";
}

// ─── Core: analyzeRoundPatterns ─────────────────────────────────────────────

export function analyzeRoundPatterns(
  rounds: RoundData[],
  _setup: SetupData,
): PatternData {
  // 1. Death location frequency
  const deathLocs: Record<string, number> = {};
  const deathRounds = rounds.filter(
    (r) => !r.skipped && !r.survived && r.deathLocation,
  );
  deathRounds.forEach((r) => {
    deathLocs[r.deathLocation] = (deathLocs[r.deathLocation] || 0) + 1;
  });

  // 2. Repeated death locations (2+ times same spot)
  const repeatedDeaths = Object.entries(deathLocs)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([loc]) => loc);

  // 3. Deaths without trade estimate: died but team lost the round
  const deathsWithoutTrade = deathRounds.filter(
    (r) => r.result === "loss",
  ).length;

  // 4. Enemy site preference from last 5 non-skipped death rounds
  const recentDeaths = deathRounds.slice(-5);
  const siteCount: Record<string, number> = {};
  recentDeaths.forEach((r) => {
    const site = extractSite(r.deathLocation);
    if (site) siteCount[site] = (siteCount[site] || 0) + 1;
  });
  const deathSiteConcentration = Object.entries(siteCount)
    .sort((a, b) => b[1] - a[1])
    .map(([site, frequency]) => ({
      site,
      frequency,
      confidence: confidenceFromFrequency(frequency, recentDeaths.length),
    }));

  // 5. Enemy agent habits — detect repeated kills from same location patterns
  // Group death locations and look for clustering that implies a fixed position
  const locationCluster: Record<string, number> = {};
  deathRounds.forEach((r) => {
    if (r.deathLocation) {
      locationCluster[r.deathLocation] =
        (locationCluster[r.deathLocation] || 0) + 1;
    }
  });
  const repeatedDeathPositions = Object.entries(locationCluster)
    .filter(([, count]) => count >= 2)
    .map(([loc, count]) => ({
      agent: "Unknown",
      behavior: `${loc} — sabit pozisyon (${count} kez)`,
      roundsSeen: count,
    }));

  // 6. Enemy tempo — based on when deaths occur (early vs late round numbers)
  // Heuristic: if most deaths happen in first half of rounds, enemy is fast
  const halfPoint = Math.ceil(rounds.length / 2);
  const earlyDeaths = deathRounds.filter(
    (r) => r.roundNumber <= halfPoint,
  ).length;
  const lateDeaths = deathRounds.filter(
    (r) => r.roundNumber > halfPoint,
  ).length;
  let deathTimingPattern: "fast" | "slow" | "mixed" = "mixed";
  if (earlyDeaths > lateDeaths * 1.5) deathTimingPattern = "fast";
  else if (lateDeaths > earlyDeaths * 1.5) deathTimingPattern = "slow";

  // 7. Player weak side — not enough data per-match to determine, set null
  const playerWeakSide: "attack" | "defense" | null = null;

  // 8. Player weak map — single match context, null
  const playerWeakMap: string | null = null;

  // 9. Survival rate
  const nonSkipped = rounds.filter((r) => !r.skipped);
  const survived = nonSkipped.filter((r) => r.survived).length;
  const survivalRate =
    nonSkipped.length > 0 ? survived / nonSkipped.length : 0;

  // 10. Win/loss streaks
  const winStreak = computeStreak(rounds, "win");
  const lossStreak = computeStreak(rounds, "loss");

  // 11. Recent performance trend
  const last5 = rounds.slice(-5).filter((r) => !r.skipped);
  const last5Wins = last5.filter((r) => r.result === "win").length;
  const prev5 = rounds
    .slice(-10, -5)
    .filter((r) => !r.skipped);
  let recentPerformance: "improving" | "declining" | "stable" = "stable";
  if (prev5.length > 0) {
    const prev5Wins = prev5.filter((r) => r.result === "win").length;
    const last5Rate = last5.length > 0 ? last5Wins / last5.length : 0;
    const prev5Rate = prev5Wins / prev5.length;
    if (last5Rate > prev5Rate + 0.15) recentPerformance = "improving";
    else if (last5Rate < prev5Rate - 0.15) recentPerformance = "declining";
  }

  // Data confidence based on round volume
  const overallConfidence: "low" | "medium" | "high" =
    nonSkipped.length > 20 ? "high" : nonSkipped.length >= 10 ? "medium" : "low";

  return {
    deathLocationFrequency: deathLocs,
    repeatedDeathLocations: repeatedDeaths,
    deathsWithoutTrade,
    deathSiteConcentration,
    repeatedDeathPositions,
    deathTimingPattern,
    playerWeakSide,
    playerWeakMap,
    survivalRate,
    winStreak,
    lossStreak,
    recentPerformance,
    overallConfidence,
  };
}

// ─── Core: generateDeathContext ─────────────────────────────────────────────

export function generateDeathContext(
  round: RoundData,
  allRounds: RoundData[],
  _setup: SetupData,
): DeathContext {
  const location = round.deathLocation || "";
  const timesAtSame = allRounds.filter(
    (r) =>
      !r.skipped && !r.survived && r.deathLocation === location && location,
  ).length;

  // Determine reason deterministically from available signals
  let reason: DeathContext["reason"];
  const note = (round.yourNote || "").toLowerCase();

  if (timesAtSame >= 3) {
    reason = "repeated_position";
  } else if (round.enemyCount && Number(round.enemyCount) >= 3) {
    reason = "isolated";
  } else if (
    note.includes("peek") ||
    note.includes("swing") ||
    note.includes("agro") ||
    note.includes("aggro")
  ) {
    reason = "overpeek";
  } else if (
    note.includes("solo") ||
    note.includes("tek") ||
    note.includes("alone") ||
    note.includes("yalnız")
  ) {
    reason = "no_trade";
  } else if (
    note.includes("utility") ||
    note.includes("flash") ||
    note.includes("smoke") ||
    note.includes("molly")
  ) {
    reason = "utility_miss";
  } else {
    reason = "bad_timing";
  }

  // Rough trade estimate: if player died but team still won, likely traded
  const wasTraded = round.result === "win";

  return {
    location,
    killer: "",
    weapon: "",
    reason,
    timesAtSameLocation: timesAtSame,
    wasTraded,
  };
}

// ─── Core: generateEnemyPatterns ────────────────────────────────────────────

export function generateDeathPatterns(
  allRounds: RoundData[],
  setup: SetupData,
): {
  sitePreference: PatternData["deathSiteConcentration"];
  agentHabits: PatternData["repeatedDeathPositions"];
  tempo: PatternData["deathTimingPattern"];
  summary: string;
} {
  const patterns = analyzeRoundPatterns(allRounds, setup);

  // Build human-readable summary
  const lines: string[] = [];

  if (patterns.deathSiteConcentration.length > 0) {
    const top = patterns.deathSiteConcentration[0];
    lines.push(
      `Ölüm yoğunluğu: ${top.site} (son 5 ölümün ${top.frequency}'i bu bölgede — düşman bu tarafa ağırlık veriyor olabilir, güven: ${top.confidence})`,
    );
  }

  if (patterns.repeatedDeathPositions.length > 0) {
    patterns.repeatedDeathPositions.forEach((h) => {
      lines.push(`${h.behavior}`);
    });
  }

  lines.push(`Ölüm zamanlama paterni: ${patterns.deathTimingPattern} (erken/geç round ölüm dağılımına göre)`);

  return {
    sitePreference: patterns.deathSiteConcentration,
    agentHabits: patterns.repeatedDeathPositions,
    tempo: patterns.deathTimingPattern,
    summary: lines.join("\n"),
  };
}

// ─── Core: generateNextRoundPlan ────────────────────────────────────────────

export function generateNextRoundPlan(
  patterns: PatternData,
  _setup: SetupData,
): {
  strategyHint: string;
  avoidLocations: string[];
  suggestedApproach: string;
} {
  const avoid = patterns.repeatedDeathLocations;

  let approach = "default";
  if (patterns.deathSiteConcentration.length > 0) {
    const topSite = patterns.deathSiteConcentration[0];
    if (topSite.confidence === "high" && topSite.frequency >= 3) {
      approach = `fake_${topSite.site}_go_other`;
    }
  }

  let hint = "";
  if (approach.startsWith("fake_")) {
    const fakeSite = approach.split("_")[1];
    hint = `Düşman ${fakeSite} ağırlıklı → ${fakeSite} fake at, diğer site'a execute et`;
  } else if (avoid.length > 0) {
    hint = `${avoid.join(", ")} pozisyonlarından kaçın — farklı açılar dene`;
  }

  if (patterns.deathsWithoutTrade > 2) {
    hint += hint
      ? ". Trade alınmadan çok ölüm var — takımla birlikte hareket et"
      : "Trade alınmadan çok ölüm var — takımla birlikte hareket et";
  }

  if (patterns.recentPerformance === "declining") {
    hint += hint
      ? ". Performans düşüşte — daha pasif oyna, bilgi topla"
      : "Performans düşüşte — daha pasif oyna, bilgi topla";
  }

  return { strategyHint: hint, avoidLocations: avoid, suggestedApproach: approach };
}

// ─── Core: computeMatchInsights ─────────────────────────────────────────────

export function computeMatchInsights(
  rounds: RoundData[],
  setup: SetupData,
): MatchInsights {
  const patterns = analyzeRoundPatterns(rounds, setup);

  // Top mistake: most repeated death location
  const deathEntries = Object.entries(patterns.deathLocationFrequency).sort(
    (a, b) => b[1] - a[1],
  );
  const topDeathEntry = deathEntries[0] ?? null;

  // Best round: first round where survived AND won
  const bestRoundIdx = rounds.findIndex(
    (r) => r.survived && r.result === "win",
  );
  const bestRound = bestRoundIdx >= 0 ? rounds[bestRoundIdx].roundNumber : 1;

  // Decision score: composite of win rate, survival, death variety
  const nonSkipped = rounds.filter((r) => !r.skipped);
  const wr =
    nonSkipped.length > 0
      ? nonSkipped.filter((r) => r.result === "win").length / nonSkipped.length
      : 0;
  const deathVariety = Object.keys(patterns.deathLocationFrequency).length;
  const score = Math.min(
    10,
    Math.max(
      1,
      Math.round(
        wr * 5 + patterns.survivalRate * 3 + Math.min(deathVariety / 3, 2),
      ),
    ),
  );

  // Improvement areas
  const improvementAreas: string[] = [];
  if (patterns.repeatedDeathLocations.length > 0) {
    improvementAreas.push("Pozisyon ceşitliliği artır");
  }
  if (patterns.survivalRate < 0.4) {
    improvementAreas.push("Hayatta kalma oranını yükselt");
  }
  if (patterns.recentPerformance === "declining") {
    improvementAreas.push(
      "Son roundlarda düşüş var — strateji değiştir",
    );
  }
  if (patterns.deathsWithoutTrade > 3) {
    improvementAreas.push("Trade alınamayan ölümleri azalt");
  }
  if (patterns.deathTimingPattern === "fast" && patterns.survivalRate < 0.5) {
    improvementAreas.push("Hızlı düşman temposuna karşı erken bilgi al");
  }

  return {
    topMistake: topDeathEntry
      ? `${topDeathEntry[0]}'de ${topDeathEntry[1]} kez ölüm`
      : "Belirgin tekrar yok",
    weakestArea: topDeathEntry ? topDeathEntry[0] : "N/A",
    bestRound,
    worstPattern:
      patterns.repeatedDeathLocations.length > 0
        ? `Aynı pozisyonlarda tekrarlayan ölüm: ${patterns.repeatedDeathLocations.join(", ")}`
        : "Belirgin kötü pattern yok",
    decisionScore: score,
    improvementAreas,
  };
}
