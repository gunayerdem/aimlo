import "server-only";

import { createServiceSupabase } from "@/lib/supabase/server";

/**
 * Cross-match player profile — accumulated death locations, map/agent
 * stats, and detected behavioral tendencies. Used by AI routes
 * (vision/feedback/report/insight) to inject "you've died at A Short
 * 23 times across the last 30 matches" context into prompts.
 *
 * Server-only because:
 *   - Writes need to bypass RLS (system writes the user's memory after
 *     a match completes; the user is not directly in the writer call
 *     stack at AI-route invocation time).
 *   - Reads use the same client for symmetry.
 *   - Earlier version imported the browser supabase client which had
 *     RLS-rejected writes silently (audit-D-P0-5) — every UPSERT was
 *     denied and the entire memory feature was dead in the web app.
 */

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

  // B58 (2026-07-31): ölüm-tipi dağılımı — tendency tespiti tek kaleme
  // (repeated_position) takılıydı; oysa backend her ölümde 13+ sınıflı
  // DETERMİNİSTİK death-type üretiyor (lib/death-type.ts). Maç sonunda
  // agrege edilince overpeek / no_trade eğilimleri EK AI ÇAĞRISI OLMADAN
  // çıkıyor. Yalnız DEATH_TYPE_TENDENCY'de tanınan tipler saklanır (anahtar
  // kümesi sınırlı — kurcalanmış istemci jsonb'yi şişiremez).
  deathTypeCounts: Record<string, number>;
  // death-type'ı OKUNABİLEN tüm ölümlerin sayısı (pay/payda: bir ailenin
  // ölümlerin yüzde kaçını oluşturduğunu bilmeden eşik anlamsız olur).
  classifiedDeaths: number;

  // Improvement tracking
  previousWeakSpots: string[]; // what was weak last check
  improvedAreas: string[]; // patterns that got better

  // Meta
  totalMatches: number;
  totalRounds: number;
  overallWinRate: number;
  lastUpdated: string;
}

/**
 * B58 (2026-07-31) — ölüm-tipi → davranış ailesi eşlemesi.
 *
 * Anahtarlar lib/death-type.ts `DeathType` birliğinden birebir alındı
 * (verbatim; parafraz YOK). Burada olmayan tipler yok sayılır — hem jsonb
 * anahtar kümesi sınırlı kalır hem de "her ölüm bir etiket" enflasyonu olmaz.
 * Değerler PlayerMemory.tendencies'in zaten belgelenmiş etiketleri.
 */
const DEATH_TYPE_TENDENCY: Record<string, string> = {
  // Ölümü geri alınmıyor / desteksiz açı — "trade yok" ailesi
  "entry-no-trade": "no_trade",
  "post-plant-solo": "no_trade",
  "def-no-crossfire": "no_trade",
  "retake-advantage-thrown": "no_trade",
  // Gereksiz/erken peek — "fazla peek" ailesi
  "over-peek-advantage": "overpeek",
  "info-less-push": "overpeek",
  "def-wide-hold": "overpeek",
};

/** Eşikler: gürültüden eğilim üretmemek için hem MUTLAK sayı hem PAY şartı.
 *  (repeated_position'ın >=5 eşiğiyle aynı büyüklük — tutarlı sertlik.) */
const TENDENCY_MIN_CLASSIFIED = 8; // en az bu kadar okunabilir ölüm birikmeden etiket yok
const TENDENCY_MIN_COUNT = 5; // aile en az bu kadar tekrar etmeli
const TENDENCY_MIN_SHARE = 0.25; // ve ölümlerin en az %25'i o aileden olmalı
/** Kurcalanmış istemciye karşı: aşırı uzun death-type dizesi sayıma girmez. */
const MAX_DEATH_TYPE_LEN = 40;

// Load player memory from Supabase using the service-role client
// (RLS-bypass).
export async function loadPlayerMemory(
  userId: string,
): Promise<PlayerMemory | null> {
  try {
    const admin = createServiceSupabase();
    const { data, error } = await admin
      .from("player_memory")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Aimlo memory] load failed:", error.message);
      return null;
    }
    if (!data) return null;

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
      // B58 (2026-07-31): eski satırlarda bu alanlar YOK — boş/0 ile başlar,
      // ilk maç sonunda dolmaya başlar (backfill gerekmez).
      deathTypeCounts: (mem?.deathTypeCounts as Record<string, number>) || {},
      classifiedDeaths: (mem?.classifiedDeaths as number) || 0,
      previousWeakSpots: (mem?.previousWeakSpots as string[]) || [],
      improvedAreas: (mem?.improvedAreas as string[]) || [],
      totalMatches: (mem?.totalMatches as number) || 0,
      totalRounds: (mem?.totalRounds as number) || 0,
      overallWinRate: (mem?.overallWinRate as number) || 0,
      lastUpdated: (data.updated_at as string) || new Date().toISOString(),
    };
  } catch (e) {
    console.error("[Aimlo memory] load exception:", (e as Error).message);
    return null;
  }
}

// Update player memory after a match. Uses service-role client (RLS-bypass).
//
// CONCURRENCY NOTE: read-modify-write pattern — two simultaneous match-end
// requests for the same user will race and one update can be lost. Real-
// world impact: extremely rare (a user finishes two matches at the exact
// same instant on two devices?). Tracked as a follow-up; for a true atomic
// merge we'd push the merge into a SQL function operating on the jsonb
// in-place. Not worth the complexity at current scale.
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
      /**
       * B58 (2026-07-31): o round için backend'in ürettiği deterministik
       * ölüm tipi (lib/death-type.ts). OPSİYONEL — göndermeyen çağıran için
       * davranış birebir eskisi gibi kalır.
       */
      deathType?: string;
    }>;
  },
): Promise<void> {
  try {
    const admin = createServiceSupabase();

    // Load existing memory
    let memory = await loadPlayerMemory(userId);

    if (!memory) {
      memory = {
        userId,
        weakLocations: {},
        mapStats: {},
        agentStats: {},
        tendencies: [],
        deathTypeCounts: {},
        classifiedDeaths: 0,
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

    // B58 (2026-07-31): ölüm-tipi dağılımını biriktir (maç-içi → cross-match).
    // Yalnız gerçekten ölünen, atlanmayan roundlar; tip yoksa hiçbir şey sayılmaz.
    matchData.rounds
      .filter((r) => !r.skipped && !r.survived)
      .forEach((r) => {
        const dt = typeof r.deathType === "string" ? r.deathType.trim().toLowerCase() : "";
        if (!dt || dt.length > MAX_DEATH_TYPE_LEN) return;
        memory!.classifiedDeaths++;
        // Tanınmayan tip: paydaya girer (yüzde dürüst kalsın) ama anahtar olarak
        // saklanmaz — jsonb anahtar kümesi sınırlı kalır.
        if (!DEATH_TYPE_TENDENCY[dt]) return;
        memory!.deathTypeCounts[dt] = (memory!.deathTypeCounts[dt] || 0) + 1;
      });

    // Detect tendencies
    const deathLocs = Object.entries(memory.weakLocations).sort(
      (a, b) => b[1] - a[1],
    );
    const topDeath = deathLocs[0];
    if (topDeath && topDeath[1] >= 5) {
      if (!memory.tendencies.includes("repeated_position")) {
        memory.tendencies.push("repeated_position");
      }
    }

    // B58 (2026-07-31): İKİNCİ eğilim kaynağı — ölüm-tipi ailesi.
    // NEDEN: 'AI seni tanıyor' vaadi tek sinyale (repeated_position) takılıydı;
    // oysa her ölümde deterministik death-type zaten üretiliyor. Agregasyon
    // bedava (AI çağrısı yok) ve buildMemoryContext tendencies'i prompt'a
    // zaten basıyor. Çift eşik (mutlak sayı + %pay) tek kötü maçın etiket
    // yapıştırmasını engeller.
    if (memory.classifiedDeaths >= TENDENCY_MIN_CLASSIFIED) {
      const familyCounts: Record<string, number> = {};
      for (const [type, n] of Object.entries(memory.deathTypeCounts)) {
        const family = DEATH_TYPE_TENDENCY[type];
        if (!family) continue;
        familyCounts[family] = (familyCounts[family] || 0) + n;
      }
      for (const [family, n] of Object.entries(familyCounts)) {
        const share = n / memory.classifiedDeaths;
        if (n < TENDENCY_MIN_COUNT || share < TENDENCY_MIN_SHARE) continue;
        if (!memory.tendencies.includes(family)) memory.tendencies.push(family);
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

    // Save to Supabase via service-role client (bypasses RLS)
    const { error } = await admin.from("player_memory").upsert(
      {
        user_id: userId,
        memory_data: {
          weakLocations: memory.weakLocations,
          mapStats: memory.mapStats,
          agentStats: memory.agentStats,
          tendencies: memory.tendencies,
          // B58 (2026-07-31): yeni alanlar — memory_data jsonb olduğu için
          // migration GEREKMEZ; eski satırlar okurken boş/0'a düşer.
          deathTypeCounts: memory.deathTypeCounts,
          classifiedDeaths: memory.classifiedDeaths,
          previousWeakSpots: memory.previousWeakSpots,
          improvedAreas: memory.improvedAreas,
          totalMatches: memory.totalMatches,
          totalRounds: memory.totalRounds,
          overallWinRate: memory.overallWinRate,
        },
        updated_at: memory.lastUpdated,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("[Aimlo memory] save failed:", error.message);
    }
  } catch (err) {
    console.error("[Aimlo memory] update failed:", (err as Error).message);
  }
}

// Build a text context from memory for AI prompts
export function buildMemoryContext(
  memory: PlayerMemory | null,
  lang: string,
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
      (worstMap[1].wins / (worstMap[1].wins + worstMap[1].losses)) * 100,
    );
    context += isTr
      ? `- En zayıf harita: ${worstMap[0]} (%${wr} WR)\n`
      : `- Weakest map: ${worstMap[0]} (${wr}% WR)\n`;
  }

  if (bestAgent) {
    const wr = Math.round(
      (bestAgent[1].wins / (bestAgent[1].wins + bestAgent[1].losses)) * 100,
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
