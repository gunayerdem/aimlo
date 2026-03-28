/**
 * AIMLO Playstyle Identity System
 *
 * Classifies player behavior into archetypes based on REAL data.
 * Updates after every match.
 */

export type PlaystyleArchetype =
  | "aggressive_entry" // Dies a lot but wins rounds — entry fragger mentality
  | "passive_anchor" // Survives a lot, holds positions
  | "balanced_flex" // Mix of aggression and survival
  | "chaotic_aggressive" // Dies a lot AND loses — undisciplined aggression
  | "careful_lurker" // High survival, plays alone (inferred from death locations)
  | "trade_player" // Dies but team wins (good trades)
  | "unknown";

export interface PlaystyleProfile {
  archetype: PlaystyleArchetype;
  archetypeLabel: string; // "Agresif Entry" etc
  archetypeDescription: string;

  // Behavioral metrics (0-100)
  aggressionLevel: number; // How often you die (inverse of survival)
  positionDiversity: number; // How varied your positions are
  tradeSuccessRate: number; // How often your death leads to team win

  // Confidence in classification (0-100)
  confidence: number;

  // Mismatch detection
  mismatch: {
    detected: boolean;
    message: string;
  } | null;

  // AI coaching message
  coachMessage: string;
}

interface MatchInput {
  won: boolean;
  agent?: string;
  rounds: Array<{
    deathLocation?: string;
    survived?: boolean;
    skipped?: boolean;
    result?: string;
  }>;
}

const ARCHETYPE_LABELS: Record<
  PlaystyleArchetype,
  { label: string; desc: string }
> = {
  aggressive_entry: {
    label: "Agresif Entry",
    desc: "Ilk temasa giren, riski seven oyuncu. Olumlerin cogu takima faydali.",
  },
  passive_anchor: {
    label: "Pasif Anchor",
    desc: "Pozisyon tutan, hayatta kalmayi oncelik yapan oyuncu.",
  },
  balanced_flex: {
    label: "Dengeli Flex",
    desc: "Duruma gore agresif veya pasif oynayabilen cok yonlu oyuncu.",
  },
  chaotic_aggressive: {
    label: "Kontrolsuz Agresif",
    desc: "Cok oluyorsun ve olumlerin takima katki saglamiyor. Disiplin gerekli.",
  },
  careful_lurker: {
    label: "Dikkatli Lurker",
    desc: "Hayatta kalip farkli acilardan oynayan, bilgi toplayan oyuncu.",
  },
  trade_player: {
    label: "Trade Oyuncusu",
    desc: "Olumlerin cogu takimin round kazanmasina yardimci oluyor.",
  },
  unknown: {
    label: "Belirleniyor",
    desc: "Daha fazla mac verisi gerekiyor.",
  },
};

export function analyzePlaystyle(
  matches: MatchInput[],
  previousArchetype?: PlaystyleArchetype | null
): PlaystyleProfile {
  const allRounds = matches.flatMap((m) =>
    m.rounds.filter((r) => !r.skipped)
  );
  // Require 20+ rounds (not 15) for meaningful classification
  if (allRounds.length < 20) return getDefaultPlaystyle();

  const total = allRounds.length;
  const deaths = allRounds.filter((r) => !r.survived).length;
  const deathRate = deaths / total; // 0 to 1

  // Aggression level: higher death rate = more aggressive
  const aggressionLevel = Math.round(deathRate * 100);

  // Position diversity
  const deathLocs: Record<string, number> = {};
  allRounds
    .filter((r) => !r.survived && r.deathLocation)
    .forEach((r) => {
      deathLocs[r.deathLocation!] = (deathLocs[r.deathLocation!] || 0) + 1;
    });
  const uniqueSpots = Object.keys(deathLocs).length;
  const positionDiversity = Math.min(100, uniqueSpots * 8);

  // Trade success rate: when you die, does team still win?
  const diedAndWon = allRounds.filter(
    (r) => !r.survived && r.result === "win"
  ).length;
  const tradeSuccessRate =
    deaths > 0 ? Math.round((diedAndWon / deaths) * 100) : 50;

  // Win rate
  const winRate = matches.filter((m) => m.won).length / matches.length;

  // Classification with hysteresis margin
  let archetype: PlaystyleArchetype;
  const MARGIN = 0.05; // 5% hysteresis margin

  if (
    deathRate >
      0.6 + (previousArchetype === "aggressive_entry" ? -MARGIN : 0) &&
    tradeSuccessRate > 45
  ) {
    archetype = "aggressive_entry"; // Dies a lot but deaths are useful
  } else if (
    deathRate >
      0.6 + (previousArchetype === "chaotic_aggressive" ? -MARGIN : 0) &&
    tradeSuccessRate <= 45
  ) {
    archetype = "chaotic_aggressive"; // Dies a lot, deaths are wasted
  } else if (
    deathRate <
      0.4 + (previousArchetype === "passive_anchor" ? MARGIN : 0) &&
    positionDiversity < 40
  ) {
    archetype = "passive_anchor"; // Rarely dies, stays in same spots
  } else if (
    deathRate <
      0.4 + (previousArchetype === "careful_lurker" ? MARGIN : 0) &&
    positionDiversity >= 40
  ) {
    archetype = "careful_lurker"; // Rarely dies, moves around
  } else if (tradeSuccessRate > 50) {
    archetype = "trade_player"; // Good at enabling team
  } else {
    archetype = previousArchetype || "balanced_flex";
  }

  // Confidence based on data volume (0-100)
  const confidence = Math.min(100, Math.round((allRounds.length / 50) * 100));

  // Mismatch detection
  let mismatch: PlaystyleProfile["mismatch"] = null;
  if (archetype === "aggressive_entry" && winRate < 0.4) {
    mismatch = {
      detected: true,
      message:
        "Agresif oynuyorsun ama kazanma oranin dusuk. Entry almadan once utility kullan.",
    };
  } else if (archetype === "chaotic_aggressive") {
    mismatch = {
      detected: true,
      message:
        "Cok oluyorsun ve olumlerin ise yaramiyor. Daha kontrollu oyna, trade pozisyonu kur.",
    };
  } else if (archetype === "passive_anchor" && winRate < 0.4) {
    mismatch = {
      detected: true,
      message:
        "Pasif oynuyorsun ama kazanamiyorsun. Bazen agresif olman gerekiyor.",
    };
  }

  // Coach message
  const coachMessages: Record<PlaystyleArchetype, string> = {
    aggressive_entry:
      "Entry oynuyorsun — olumlerin cogu takima yariyor. Flash/drone ile entry kaliteni artir.",
    chaotic_aggressive:
      "Agresyonun kontrolsuz. Her peek'in bir sebebi olmali. Utility kullanmadan girme.",
    passive_anchor:
      "Iyi anchor oynuyorsun. Retake zamanlamani ve bilgi verme kaliteni gelistir.",
    careful_lurker:
      "Lurk oyunun iyi ama zamanlamaya dikkat et — takimin senden bilgi bekliyor.",
    trade_player:
      "Trade pozisyonlarin guclu. Entry fragger'inla koordinasyonu artir.",
    balanced_flex:
      "Dengeli oynuyorsun. Bir yonunu guclendirmek icin odaklan.",
    unknown: "Birkac mac daha oyna, oyun tarzini analiz edelim.",
  };

  return {
    archetype,
    archetypeLabel: ARCHETYPE_LABELS[archetype].label,
    archetypeDescription: ARCHETYPE_LABELS[archetype].desc,
    aggressionLevel,
    positionDiversity,
    tradeSuccessRate,
    confidence,
    mismatch,
    coachMessage: coachMessages[archetype],
  };
}

function getDefaultPlaystyle(): PlaystyleProfile {
  return {
    archetype: "unknown",
    archetypeLabel: "Belirleniyor",
    archetypeDescription: "Daha fazla mac verisi gerekiyor.",
    aggressionLevel: 50,
    positionDiversity: 50,
    tradeSuccessRate: 50,
    confidence: 0,
    mismatch: null,
    coachMessage: "Birkac mac daha oyna, oyun tarzini analiz edelim.",
  };
}
