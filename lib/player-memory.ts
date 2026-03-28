import { supabase } from "@/lib/supabase";

export interface PlayerMemory {
  userId: string;

  // Cumulative death data
  weakLocations: Record<string, number>; // "A Short" -> 23 total deaths

  // Map performance
  mapStats: Record<string, { wins: number; losses: number }>;

  // Agent performance
  agentStats: Record<string, { wins: number; losses: number }>;

  // Behavioral tendencies (detected patterns across matches)
  tendencies: string[]; // ["overpeek", "no_trade", "repeated_position"]

  // Improvement tracking
  previousWeakSpots: string[]; // what was weak last check
  improvedAreas: string[]; // patterns that got better

  // Meta
  totalMatches: number;
  totalRounds: number;
  overallWinRate: number;
  lastUpdated: string;
}

// Load player memory from Supabase
export async function loadPlayerMemory(
  userId: string
): Promise<PlayerMemory | null> {
  try {
    const { data, error } = await supabase
      .from("player_memory")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    const rawMem = data.memory_data;
    const mem = (rawMem && typeof rawMem === "object" && !Array.isArray(rawMem))
      ? (rawMem as Record<string, unknown>)
      : null;

    return {
      userId,
      weakLocations: (mem?.weakLocations as Record<string, number>) || {},
      mapStats:
        (mem?.mapStats as Record<string, { wins: number; losses: number }>) ||
        {},
      agentStats:
        (mem?.agentStats as Record<
          string,
          { wins: number; losses: number }
        >) || {},
      tendencies: (mem?.tendencies as string[]) || [],
      previousWeakSpots: (mem?.previousWeakSpots as string[]) || [],
      improvedAreas: (mem?.improvedAreas as string[]) || [],
      totalMatches: (mem?.totalMatches as number) || 0,
      totalRounds: (mem?.totalRounds as number) || 0,
      overallWinRate: (mem?.overallWinRate as number) || 0,
      lastUpdated: (data.updated_at as string) || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// Update player memory after a match
export async function updatePlayerMemory(
  userId: string,
  matchData: {
    map: string;
    agent: string;
    won: boolean;
    rounds: Array<{
      deathLocation?: string;
      survived?: boolean;
      skipped?: boolean;
      result?: string;
    }>;
  }
): Promise<void> {
  try {
    // Load existing memory
    let memory = await loadPlayerMemory(userId);

    if (!memory) {
      memory = {
        userId,
        weakLocations: {},
        mapStats: {},
        agentStats: {},
        tendencies: [],
        previousWeakSpots: [],
        improvedAreas: [],
        totalMatches: 0,
        totalRounds: 0,
        overallWinRate: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update death locations
    matchData.rounds
      .filter((r) => !r.skipped && !r.survived && r.deathLocation)
      .forEach((r) => {
        memory!.weakLocations[r.deathLocation!] =
          (memory!.weakLocations[r.deathLocation!] || 0) + 1;
      });

    // Update map stats
    if (!memory.mapStats[matchData.map]) {
      memory.mapStats[matchData.map] = { wins: 0, losses: 0 };
    }
    if (matchData.won) memory.mapStats[matchData.map].wins++;
    else memory.mapStats[matchData.map].losses++;

    // Update agent stats
    if (!memory.agentStats[matchData.agent]) {
      memory.agentStats[matchData.agent] = { wins: 0, losses: 0 };
    }
    if (matchData.won) memory.agentStats[matchData.agent].wins++;
    else memory.agentStats[matchData.agent].losses++;

    // Detect tendencies
    const deathLocs = Object.entries(memory.weakLocations).sort(
      (a, b) => b[1] - a[1]
    );
    const topDeath = deathLocs[0];
    if (topDeath && topDeath[1] >= 5) {
      if (!memory.tendencies.includes("repeated_position")) {
        memory.tendencies.push("repeated_position");
      }
    }

    // Check for improvement
    const previousTop3 = memory.previousWeakSpots.slice(0, 3);
    const currentTop3 = deathLocs.slice(0, 3).map(([loc]) => loc);

    // If a previously weak spot dropped out of top 3 → improvement
    previousTop3.forEach((spot) => {
      if (!currentTop3.includes(spot) && !memory!.improvedAreas.includes(spot)) {
        memory!.improvedAreas.push(spot);
      }
    });

    // Update previous weak spots for next check
    memory.previousWeakSpots = currentTop3;

    // Update totals
    memory.totalMatches++;
    memory.totalRounds += matchData.rounds.filter((r) => !r.skipped).length;

    // Calculate overall win rate
    let totalWins = 0,
      totalGames = 0;
    Object.values(memory.mapStats).forEach((s) => {
      totalWins += s.wins;
      totalGames += s.wins + s.losses;
    });
    memory.overallWinRate = totalGames > 0 ? totalWins / totalGames : 0;

    memory.lastUpdated = new Date().toISOString();

    // Save to Supabase
    const { error } = await supabase.from("player_memory").upsert(
      {
        user_id: userId,
        memory_data: {
          weakLocations: memory.weakLocations,
          mapStats: memory.mapStats,
          agentStats: memory.agentStats,
          tendencies: memory.tendencies,
          previousWeakSpots: memory.previousWeakSpots,
          improvedAreas: memory.improvedAreas,
          totalMatches: memory.totalMatches,
          totalRounds: memory.totalRounds,
          overallWinRate: memory.overallWinRate,
        },
        updated_at: memory.lastUpdated,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("[Aimlo] Player memory save error:", error.message);
    }
  } catch (err) {
    console.error("[Aimlo] Player memory update failed:", err);
  }
}

// Build a text context from memory for AI prompts
export function buildMemoryContext(
  memory: PlayerMemory | null,
  lang: string
): string {
  if (!memory || memory.totalMatches < 2) return "";

  const isTr = lang === "tr";

  const topDeaths = Object.entries(memory.weakLocations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const worstMap = Object.entries(memory.mapStats)
    .filter(([, s]) => s.wins + s.losses >= 2)
    .sort((a, b) => {
      const wrA = a[1].wins / (a[1].wins + a[1].losses);
      const wrB = b[1].wins / (b[1].wins + b[1].losses);
      return wrA - wrB;
    })[0];

  const bestAgent = Object.entries(memory.agentStats)
    .filter(([, s]) => s.wins + s.losses >= 2)
    .sort((a, b) => {
      const wrA = a[1].wins / (a[1].wins + a[1].losses);
      const wrB = b[1].wins / (b[1].wins + b[1].losses);
      return wrB - wrA;
    })[0];

  let context = isTr
    ? `\nOYUNCU PROFİLİ (${memory.totalMatches} maç, ${memory.totalRounds} round):\n`
    : `\nPLAYER PROFILE (${memory.totalMatches} matches, ${memory.totalRounds} rounds):\n`;

  if (topDeaths.length > 0) {
    context += isTr
      ? `- Sürekli zayıf noktalar: ${topDeaths.map(([loc, count]) => `${loc} (${count} ölüm)`).join(", ")}\n`
      : `- Persistent weak spots: ${topDeaths.map(([loc, count]) => `${loc} (${count} deaths)`).join(", ")}\n`;
  }

  if (worstMap) {
    const wr = Math.round(
      (worstMap[1].wins / (worstMap[1].wins + worstMap[1].losses)) * 100
    );
    context += isTr
      ? `- En zayıf harita: ${worstMap[0]} (%${wr} WR)\n`
      : `- Weakest map: ${worstMap[0]} (${wr}% WR)\n`;
  }

  if (bestAgent) {
    const wr = Math.round(
      (bestAgent[1].wins / (bestAgent[1].wins + bestAgent[1].losses)) * 100
    );
    context += isTr
      ? `- En güçlü ajan: ${bestAgent[0]} (%${wr} WR)\n`
      : `- Strongest agent: ${bestAgent[0]} (${wr}% WR)\n`;
  }

  if (memory.tendencies.length > 0) {
    context += isTr
      ? `- Davranış eğilimleri: ${memory.tendencies.join(", ")}\n`
      : `- Behavioral tendencies: ${memory.tendencies.join(", ")}\n`;
  }

  if (memory.improvedAreas.length > 0) {
    context += isTr
      ? `- İyileşen alanlar: ${memory.improvedAreas.join(", ")}\n`
      : `- Improved areas: ${memory.improvedAreas.join(", ")}\n`;
  }

  return context;
}
