import type { SavedReport, RoundData } from "@/types";

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

/**
 * Simplified per-match score (1-10 scale).
 * For the full 1-100 skill profile with trends/ranks, see skill-system.ts.
 */
export interface PlayerScore {
  overall: number; // 1-10
  decisionMaking: number; // 1-10
  positioning: number; // 1-10
  consistency: number; // 1-10
  explanation: {
    decisionMaking: string;
    positioning: string;
    consistency: string;
  };
}

/* ══════════════════════════════════════════════════════════
   calculatePlayerScore

   Computes a real scoring breakdown from actual gameplay data:
   - matches: historical SavedReport[] for consistency tracking
   - rounds: RoundData[] from the current (or all) match(es)
   ══════════════════════════════════════════════════════════ */
export function calculatePlayerScore(
  matches: SavedReport[],
  rounds: RoundData[],
): PlayerScore {
  const totalRounds = rounds.filter((r) => !r.skipped);
  const survived = totalRounds.filter((r) => r.survived).length;
  const survivalRate =
    totalRounds.length > 0 ? survived / totalRounds.length : 0;

  // Death location frequency and variety
  const deathLocs: Record<string, number> = {};
  totalRounds
    .filter((r) => !r.survived && r.deathLocation)
    .forEach((r) => {
      deathLocs[r.deathLocation] = (deathLocs[r.deathLocation] || 0) + 1;
    });
  const uniqueDeaths = Object.keys(deathLocs).length;
  const totalDeaths = totalRounds.filter((r) => !r.survived).length;
  const maxRepeat = Math.max(...Object.values(deathLocs), 0);
  const repeatRatio = totalDeaths > 0 ? maxRepeat / totalDeaths : 0;

  // Win rate
  const wins = totalRounds.filter((r) => r.result === "win").length;
  const wr = totalRounds.length > 0 ? wins / totalRounds.length : 0.5;

  // ─── DECISION MAKING (1-10) ───────────────────────────────────────────────
  // Based on: win rate, survival rate when making aggressive plays
  // High score: wins rounds, survives, doesn't repeat mistakes
  // Low score: repeatedly dies same way, loses winnable rounds
  const dm = Math.min(
    10,
    Math.max(
      1,
      Math.round(wr * 4 + survivalRate * 3 + (1 - repeatRatio) * 3),
    ),
  );

  // ─── POSITIONING (1-10) ───────────────────────────────────────────────────
  // Based on: death location variety (diverse = good),
  // repeated same-spot deaths (bad), survival rate
  // High score: dies in different places (not predictable)
  // Low score: same spot deaths repeatedly
  const pos = Math.min(
    10,
    Math.max(
      1,
      Math.round(
        (uniqueDeaths > 0 ? Math.min(uniqueDeaths / 4, 2.5) : 2.5) + // variety bonus
          (1 - repeatRatio) * 4 + // low repeat bonus
          survivalRate * 3.5,
      ),
    ),
  );

  // ─── CONSISTENCY (1-10) ───────────────────────────────────────────────────
  // Based on: round-level win rate variance using sliding windows
  // High score: similar performance every match
  // Low score: wildly different results
  let cons = 5;
  const roundResults: number[] = totalRounds.map((r) =>
    r.result === "win" ? 1 : 0
  );
  const windowSize = 5;
  const windowAverages: number[] = [];
  for (let i = 0; i <= roundResults.length - windowSize; i++) {
    const w = roundResults.slice(i, i + windowSize);
    windowAverages.push(w.reduce((a, b) => a + b, 0) / windowSize);
  }
  if (windowAverages.length >= 3) {
    const avg =
      windowAverages.reduce((a, b) => a + b, 0) / windowAverages.length;
    const variance =
      windowAverages.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
      windowAverages.length;
    // variance ranges 0 to ~0.25. Scale to 1-10: 0=10, 0.25=1
    cons = Math.min(10, Math.max(1, Math.round(10 - variance * 36)));
  }

  const overall = Math.round(((dm + pos + cons) / 3) * 10) / 10;

  return {
    overall,
    decisionMaking: dm,
    positioning: pos,
    consistency: cons,
    explanation: {
      decisionMaking:
        dm >= 7
          ? "Round kazanma ve hayatta kalma oranın iyi"
          : dm >= 5
            ? "Ortalama — bazı kararların tekrarlanıyor"
            : "Aynı hataları tekrarlıyorsun, karar verme sürecini değiştir",
      positioning:
        pos >= 7
          ? "Farklı pozisyonlar kullanıyorsun, okunması zor"
          : pos >= 5
            ? "Bazı pozisyonlarda takılıyorsun"
            : "Çok öngörülebilirsin — aynı yerlerden ölüyorsun",
      consistency:
        cons >= 7
          ? "Stabil performans gösteriyorsun"
          : cons >= 5
            ? "Bazı maçlar iyi, bazıları kötü"
            : "Performansın çok dalgalı — tutarlılık geliştir",
    },
  };
}
