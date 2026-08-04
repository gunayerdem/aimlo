// --------------------------------------------------------------------------
// EN EVAL KORPUSU — B60 (pano özellik dalgası, 2026-08-04)
// --------------------------------------------------------------------------
// NEDEN: TR korpusu 31 senaryo + 5 EN-aynası ile ölçülüyordu ama EN çıktı
// kalitesinin KENDİ korpusu yoktu (KB %100 Türkçe, EN yolu tek addendum).
// Bu dosya EN-native 30 senaryo taşır: 26 round (vision) + 4 maç raporu.
// Kapsam: died/survived, farklı death-type sinyalleri (repeat-angle, op-angle,
// pistol, eco/force, entry-no-trade, entry-traded, post-plant, retake,
// retake-advantage, over-peek, clutch, numbers-down, late-no-plant,
// full-buy-first-contact, timing-window, def-no-crossfire, def-wide-hold,
// info-less-push), edge-case'ler (killerInfo yok, unknownEnemyComp),
// cross-match memory, playerRoute, killfeed.
//
// BİÇİM SÖZLEŞMESİ (bilinçli — kopya değil uyum):
//   • EnVisionScenario, scripts/eval-vision.ts'in Scenario tipiyle YAPISAL
//     olarak aynıdır (id/note/body/memoryContext/lang). O tip export edilmiyor;
//     bağlarken yapısal uyumluluk yeter: SCENARIOS.push(...EN_VISION_SCENARIOS).
//   • EnReportScenario, scripts/eval-report.ts'in ReportScenario tipiyle aynı
//     (isTr:false → EN dalı).
//   • id deseni eval-score.ts'in mapOfId/agentOfId sözleşmesine uyar:
//     "E1-ascent-jett-atk-..." → parça[1]=harita, parça[2]=ajan (küçük harf).
//     "E" öneki S-serisiyle çakışmaz → EVAL_ONLY=E ile yalnız EN korpus koşulur.
//   • deathLocation'lar lib/map-callouts.ts tablolarındaki GERÇEK callout'lar —
//     eval-score calloutHits ölçümü boş dönmesin diye doğrulandı.
//   • patternContext/memoryContext İNGİLİZCE: masaüstü deterministik olgu
//     notlarını reqLang'de gönderir (EN dil zinciri, 2026-07-18) — TR yazmak
//     canlıyı yansıtmazdı. scripts/test-en-leak.ts bu alanları statik tarar.
//
// BAĞLAMA (ana oturum; bu dosya tek başına HİÇBİR akışı değiştirmez):
//   eval-vision.ts → import { EN_VISION_SCENARIOS } from "../evals/en-corpus";
//                    SCENARIOS.push(...EN_VISION_SCENARIOS);
//   eval-report.ts → import { EN_REPORT_SCENARIOS } from "../evals/en-corpus";
//                    SCENARIOS.push(...EN_REPORT_SCENARIOS);
//   Ölçüm: EVAL_SCORE_LANG=en npx tsx scripts/eval-score.ts <cycle>
// --------------------------------------------------------------------------

export type EnVisionScenario = {
  id: string;
  note: string;
  body: Record<string, unknown>; // VisionRequest-shaped (görüntüsüz) + lang:"en"
  memoryContext?: string;
  lang: "en";
};

export type EnReportScenario = {
  id: string;
  note: string;
  map: string;
  agent: string;
  rank: string;
  side: string;
  enemyComp: string[];
  isTr: false;
  confidence: string;
  userPrompt: string;
};

// Kısayol: roundHistory üretici (TR korpusla aynı alan adları — desktop payload).
function rh(
  n: number,
  diedAt: (i: number) => boolean,
  wonAt: (i: number) => boolean,
  pos?: (i: number) => string | undefined,
  posConf: "high" | "medium" = "high",
): Record<string, unknown>[] {
  return Array.from({ length: n }, (_, i) => {
    const e: Record<string, unknown> = {
      round_index: i + 1,
      died: diedAt(i),
      round_won: wonAt(i),
      death_detected_confidence: "observed",
      timestamp: i,
    };
    const p = pos?.(i);
    if (p) {
      e.death_position = p;
      e.position_confidence = posConf;
    }
    return e;
  });
}

export const EN_VISION_SCENARIOS: EnVisionScenario[] = [
  {
    id: "E1-ascent-jett-atk-repeat-angle",
    note: "EN / Ascent / Jett / ATTACK / repeat-angle: aynı yerden tekrar ölüm + EN patternContext + high confidence",
    lang: "en",
    body: {
      lang: "en", round: 10, score: "5-4", result: "loss", map: "Ascent", agent: "Jett", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Killjoy", "Sova", "Omen", "Reyna", "Cypher"],
      died: true, killerInfo: "killed by killjoy with vandal", deathLocation: "A Main", deathAngle: "front-right",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      patternContext: "You died at A Main in 3 of the last 4 rounds, each time from the same right-side angle.",
      roundHistory: rh(9, (i) => i % 2 === 0, (i) => i % 3 === 0, (i) => (i % 2 === 0 ? "A Main" : "Mid")),
    },
  },
  {
    id: "E2-bind-cypher-def-op-angle",
    note: "EN / Bind / Cypher / DEFENSE / op-angle: operator katili — timing dersi",
    lang: "en",
    body: {
      lang: "en", round: 7, score: "3-3", result: "loss", map: "Bind", agent: "Cypher", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Omen", "Raze", "Skye"],
      died: true, killerInfo: "killed by jett with operator", deathLocation: "B Long", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "phantom",
      roundHistory: rh(6, (i) => i % 2 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E3-haven-reyna-atk-pistol",
    note: "EN / Haven / Reyna / ATTACK / pistol-round + R1 (calibrating, history YOK) — hedge yasağı testi",
    lang: "en",
    body: {
      lang: "en", round: 1, score: "0-0", result: "loss", map: "Haven", agent: "Reyna", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Sova", "Phoenix", "Astra", "Chamber"],
      died: true, killerInfo: "killed by cypher with ghost", deathLocation: "C Long", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 5, economyType: "pistol", loadout: "classic",
    },
  },
  {
    id: "E4-split-omen-def-eco-force",
    note: "EN / Split / Omen / DEFENSE / eco-force-loss + low confidence (3 round history)",
    lang: "en",
    body: {
      lang: "en", round: 4, score: "1-2", result: "loss", map: "Split", agent: "Omen", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Breach", "Skye", "Cypher", "Jett"],
      died: true, killerInfo: "killed by raze with vandal", deathLocation: "A Ramp", deathAngle: "back-right",
      healthAtDeath: 60, alliesAlive: 2, enemiesAlive: 4, economyType: "eco", credits: 1500, loadout: "sheriff",
      roundHistory: rh(3, () => true, () => false, () => "A Ramp"),
    },
  },
  {
    id: "E5-lotus-neon-atk-entry-no-trade",
    note: "EN / Lotus / Neon / ATTACK / entry-no-trade + playerRoute MEASURED + EN patternContext",
    lang: "en",
    body: {
      lang: "en", round: 9, score: "4-4", result: "loss", map: "Lotus", agent: "Neon", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Chamber", "Killjoy", "Viper", "Fade", "Skye"],
      died: true, killerInfo: "killed by chamber with vandal", deathLocation: "A Main", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 5, economyType: "full_buy", loadout: "vandal",
      tradedByAlly: false,
      playerRoute: "A Root → A Main", routeConfidence: "high",
      patternContext: "You entered first in 3 of the last 4 rounds and no teammate traded your death.",
      roundHistory: rh(8, (i) => i % 2 === 0, (i) => i % 2 === 1, (i) => (i % 2 === 0 ? "Mid" : undefined), "medium"),
    },
  },
  {
    id: "E6-sunset-raze-atk-entry-traded",
    note: "EN / Sunset / Raze / ATTACK / entry-traded: trade'lenmiş ölüm — azarlamayan çerçeve testi",
    lang: "en",
    body: {
      lang: "en", round: 11, score: "6-4", result: "win", map: "Sunset", agent: "Raze", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Sova", "Omen", "Sage", "Jett"],
      died: true, killerInfo: "killed by omen with phantom", deathLocation: "B Main", deathAngle: "front-left",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 3, economyType: "half_buy", loadout: "spectre",
      tradedByAlly: true, deathTiming: "mid",
      roundHistory: rh(10, (i) => i % 3 === 0, (i) => i % 2 === 0),
    },
  },
  {
    id: "E7-icebox-viper-atk-post-plant",
    note: "EN / Icebox / Viper / ATTACK / post-plant-solo: spike kurulu, saldırıda solo ölüm",
    lang: "en",
    body: {
      lang: "en", round: 14, score: "7-6", result: "loss", map: "Icebox", agent: "Viper", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Sage", "Killjoy", "Jett", "Sova", "Omen"],
      died: true, killerInfo: "killed by sage with phantom", deathLocation: "B Site", deathAngle: "back",
      healthAtDeath: 100, alliesAlive: 1, enemiesAlive: 2, spikePlanted: true, economyType: "full_buy", loadout: "phantom",
      roundHistory: rh(13, (i) => i % 2 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E8-pearl-killjoy-def-retake-no-util",
    note: "EN / Pearl / Killjoy / DEFENSE / retake-no-util: spike kurulu, sayı dezavantajlı retake",
    lang: "en",
    body: {
      lang: "en", round: 13, score: "6-6", result: "loss", map: "Pearl", agent: "Killjoy", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Sova", "Astra", "Jett", "Skye"],
      died: true, killerInfo: "killed by raze with vandal", deathLocation: "A Site", deathAngle: "left",
      healthAtDeath: 100, alliesAlive: 1, enemiesAlive: 2, spikePlanted: true, economyType: "full_buy", loadout: "vandal",
      roundHistory: rh(12, (i) => i % 3 === 0, (i) => i % 2 === 1),
    },
  },
  {
    id: "E9-fracture-sage-def-retake-advantage",
    note: "EN / Fracture / Sage / DEFENSE / retake-advantage-thrown: sayı avantajlı retake'i tek tek eritme",
    lang: "en",
    body: {
      lang: "en", round: 16, score: "8-7", result: "loss", map: "Fracture", agent: "Sage", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Neon", "Breach", "Viper", "Cypher", "Jett"],
      died: true, killerInfo: "killed by neon with phantom", deathLocation: "B Site", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 1, spikePlanted: true, economyType: "full_buy", loadout: "vandal",
      roundHistory: rh(15, (i) => i % 3 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E10-abyss-iso-def-over-peek",
    note: "EN / Abyss / Iso / DEFENSE / over-peek-advantage: sayı üstünken gereksiz peek",
    lang: "en",
    body: {
      lang: "en", round: 8, score: "4-3", result: "loss", map: "Abyss", agent: "Iso", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Neon", "Gekko", "Vyse", "Tejo", "Yoru"],
      died: true, killerInfo: "killed by neon with phantom", deathLocation: "Mid Catwalk", deathAngle: "front-right",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 2, economyType: "full_buy", loadout: "vandal",
      deathTiming: "mid",
      roundHistory: rh(7, (i) => i % 2 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E11-breeze-chamber-atk-op-loss",
    note: "EN / Breeze / Chamber / ATTACK / op-loss sinyali: kendi loadout'u Operator'ken ölüm",
    lang: "en",
    body: {
      lang: "en", round: 6, score: "3-2", result: "loss", map: "Breeze", agent: "Chamber", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Viper", "Cypher", "Jett", "Sova", "Harbor"],
      died: true, killerInfo: "killed by sova with vandal", deathLocation: "A Site", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 3, economyType: "full_buy", loadout: "operator",
      deathTiming: "mid",
      roundHistory: rh(5, (i) => i % 2 === 0, (i) => i % 2 === 1),
    },
  },
  {
    id: "E12-haven-sova-def-ult-pocket",
    note: "EN / Haven / Sova / DEFENSE / ult-in-pocket sinyali: dolu ult'la ölüm (takım-etkili ult, muaf değil)",
    lang: "en",
    body: {
      lang: "en", round: 12, score: "6-5", result: "loss", map: "Haven", agent: "Sova", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Phoenix", "Raze", "Omen", "Skye", "Chamber"],
      died: true, killerInfo: "killed by phoenix with vandal", deathLocation: "Garage", deathAngle: "left",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 2, ultReady: true, economyType: "full_buy", loadout: "vandal",
      deathTiming: "mid",
      roundHistory: rh(11, (i) => i % 3 === 0, (i) => i % 2 === 0),
    },
  },
  {
    id: "E13-corrode-clove-def-clutch",
    note: "EN / Corrode / Clove / DEFENSE / clutch-lost: son kalan (1vX) — panik dersi",
    lang: "en",
    body: {
      lang: "en", round: 10, score: "4-5", result: "loss", map: "Corrode", agent: "Clove", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Brimstone", "Sage", "Raze"],
      died: true, killerInfo: "killed by jett with phantom", deathLocation: "B Site", deathAngle: "front-left",
      healthAtDeath: 100, alliesAlive: 0, enemiesAlive: 2, economyType: "full_buy", loadout: "vandal",
      roundHistory: rh(9, (i) => i % 2 === 0, (i) => i % 2 === 1),
    },
  },
  {
    id: "E14-icebox-sova-atk-numbers-down",
    note: "EN / Icebox / Sova / ATTACK / numbers-down-carry: geç round + net sayı dezavantajı",
    lang: "en",
    body: {
      lang: "en", round: 18, score: "9-8", result: "loss", map: "Icebox", agent: "Sova", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Sage", "Viper", "Jett", "Killjoy", "Reyna"],
      died: true, killerInfo: "killed by reyna with vandal", deathLocation: "Kitchen", deathAngle: "back",
      healthAtDeath: 100, alliesAlive: 1, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      deathTiming: "late", spikePlanted: false,
      roundHistory: rh(16, (i) => i % 2 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E15-ascent-omen-atk-late-no-plant",
    note: "EN / Ascent / Omen / ATTACK / late-no-plant: round bitiyor, spike hâlâ yerde değil",
    lang: "en",
    body: {
      lang: "en", round: 15, score: "7-7", result: "loss", map: "Ascent", agent: "Omen", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Killjoy", "Cypher", "Jett", "Sova", "Sage"],
      died: true, killerInfo: "killed by killjoy with vandal", deathLocation: "A Main", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 2, economyType: "full_buy", loadout: "vandal",
      deathTiming: "late", spikePlanted: false,
      roundHistory: rh(14, (i) => i % 3 === 0, (i) => i % 2 === 1, (i) => (i % 3 === 0 ? "Mid" : undefined), "medium"),
    },
  },
  {
    id: "E16-bind-brimstone-def-late-def",
    note: "EN / Bind / Brimstone / DEFENSE / late-def-no-plant: geç round, plant yok, savunma kararı",
    lang: "en",
    body: {
      lang: "en", round: 20, score: "10-9", result: "loss", map: "Bind", agent: "Brimstone", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Yoru", "Skye", "Viper", "Cypher"],
      died: true, killerInfo: "killed by raze with phantom", deathLocation: "A Site", deathAngle: "right",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 2, economyType: "full_buy", loadout: "phantom",
      deathTiming: "late", spikePlanted: false,
      roundHistory: rh(18, (i) => i % 3 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E17-breeze-jett-atk-full-buy-first",
    note: "EN / Breeze / Jett / ATTACK / full-buy-first-contact: tam alımda açılış ölümü",
    lang: "en",
    body: {
      lang: "en", round: 5, score: "2-2", result: "loss", map: "Breeze", agent: "Jett", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Viper", "Sova", "Chamber", "Killjoy"],
      died: true, killerInfo: "killed by cypher with vandal", deathLocation: "A Main", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 5, economyType: "full_buy", loadout: "vandal",
      deathTiming: "early",
      roundHistory: rh(4, (i) => i % 2 === 0, (i) => i % 2 === 1),
    },
  },
  {
    id: "E18-split-fade-atk-timing-window",
    note: "EN / Split / Fade / ATTACK / timing-window: erken temas, yarım alım — pencere dersi",
    lang: "en",
    body: {
      lang: "en", round: 3, score: "1-1", result: "loss", map: "Split", agent: "Fade", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Raze", "Sage", "Sova", "Jett"],
      died: true, killerInfo: "killed by cypher with spectre", deathLocation: "Mid Mail", deathAngle: "front-left",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 5, economyType: "half_buy", loadout: "spectre",
      deathTiming: "early",
      roundHistory: rh(2, () => true, () => false),
    },
  },
  {
    id: "E19-lotus-vyse-def-no-crossfire",
    note: "EN / Lotus / Vyse / DEFENSE / def-no-crossfire: trade'lenmemiş savunma ölümü + yeni sentinel KB",
    lang: "en",
    body: {
      lang: "en", round: 9, score: "5-3", result: "loss", map: "Lotus", agent: "Vyse", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Neon", "Fade", "Astra", "Raze", "Skye"],
      died: true, killerInfo: "killed by neon with phantom", deathLocation: "C Mound", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 3, economyType: "full_buy", loadout: "vandal",
      tradedByAlly: false, deathTiming: "mid",
      roundHistory: rh(8, (i) => i % 2 === 1, (i) => i % 2 === 0, (i) => (i % 2 === 1 ? "C Mound" : undefined), "medium"),
    },
  },
  {
    id: "E20-sunset-gekko-def-wide-hold",
    note: "EN / Sunset / Gekko / DEFENSE / def-wide-hold: sinyalsiz savunma ölümü (geniş açı default'u)",
    lang: "en",
    body: {
      lang: "en", round: 7, score: "4-2", result: "loss", map: "Sunset", agent: "Gekko", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Sova", "Omen", "Jett", "Skye"],
      died: true, killerInfo: "killed by raze with judge", deathLocation: "B Market", deathAngle: "left",
      healthAtDeath: 100, alliesAlive: 1, enemiesAlive: 3, economyType: "full_buy", loadout: "phantom",
      deathTiming: "mid",
      roundHistory: rh(6, (i) => i % 2 === 0, (i) => i % 2 === 1),
    },
  },
  {
    id: "E21-haven-yoru-atk-info-less",
    note: "EN / Haven / Yoru / ATTACK / info-less-push: tetikleyicisiz basış (saldırı default'u)",
    lang: "en",
    body: {
      lang: "en", round: 4, score: "2-1", result: "loss", map: "Haven", agent: "Yoru", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Killjoy", "Cypher", "Sova", "Omen", "Sage"],
      died: true, killerInfo: "killed by killjoy with spectre", deathLocation: "Mid Window", deathAngle: "front-right",
      healthAtDeath: 100, alliesAlive: 1, enemiesAlive: 2, economyType: "half_buy", loadout: "spectre",
      deathTiming: "mid",
      roundHistory: rh(3, (i) => i % 2 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E22-ascent-sage-def-survived",
    note: "EN / Ascent / Sage / DEFENSE / died=false (SURVIVED) — pozisyon/util odaklı EN feedback",
    lang: "en",
    body: {
      lang: "en", round: 6, score: "4-1", result: "win", map: "Ascent", agent: "Sage", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Raze", "Omen", "Skye", "Chamber"],
      died: false, economyType: "full_buy", loadout: "vandal",
      roundHistory: rh(5, (i) => i < 1, (i) => i >= 1),
    },
  },
  {
    id: "E23-icebox-phoenix-atk-survived-killfeed",
    note: "EN / Icebox / Phoenix / ATTACK / died=false + scoreboard K/D + killfeed — EN istatistik dili",
    lang: "en",
    body: {
      lang: "en", round: 9, score: "5-3", result: "win", map: "Icebox", agent: "Phoenix", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Sage", "Viper", "Jett", "Killjoy", "Sova"],
      died: false, economyType: "full_buy", loadout: "vandal",
      playerKills: 7, playerDeaths: 4, playerAssists: 1,
      killfeedOrder: ["you killed sage", "jett killed ally", "you killed viper"],
      roundHistory: rh(8, (i) => i % 3 === 2, (i) => i % 2 === 0),
    },
  },
  {
    id: "E24-pearl-deadlock-def-survived-memory",
    note: "EN / Pearl / Deadlock / DEFENSE / died=false + cross-match memory (EN profil bloğu)",
    lang: "en",
    body: {
      lang: "en", round: 17, score: "9-7", result: "win", map: "Pearl", agent: "Deadlock", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Sova", "Astra", "Chamber", "Skye"],
      died: false, economyType: "full_buy", loadout: "phantom",
      roundHistory: rh(16, (i) => i % 4 === 0, (i) => i % 2 === 0),
    },
    memoryContext:
      "Most frequent death spots: B Link (14 times), Mid Shops (9 times). Weakest map: Pearl (41% winrate). " +
      "Best agent: Deadlock. Detected tendency: on defense you hold angles too wide before the first contact.",
  },
  {
    id: "E25-bind-waylay-atk-no-killer",
    note: "EN / Bind / Waylay / ATTACK / EDGE: killerInfo YOK (öldü ama kimden belli değil) — uydurma kontrolü",
    lang: "en",
    body: {
      lang: "en", round: 8, score: "3-4", result: "loss", map: "Bind", agent: "Waylay", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Viper", "Raze", "Skye", "Brimstone"],
      died: true, deathLocation: "Hookah", healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 3,
      economyType: "full_buy", loadout: "vandal", deathTiming: "mid",
      roundHistory: rh(7, (i) => i % 2 === 1, (i) => i % 2 === 0),
    },
  },
  {
    id: "E26-corrode-tejo-def-unknown-comp",
    note: "EN / Corrode / Tejo / DEFENSE / EDGE: unknownEnemyComp (düşman roster YOK) — uydurma kontrolü",
    lang: "en",
    body: {
      lang: "en", round: 5, score: "3-1", result: "loss", map: "Corrode", agent: "Tejo", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: [], unknownEnemyComp: true,
      died: true, killerInfo: "killed by unknown with phantom", deathLocation: "Top Mid", deathAngle: "right",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "phantom",
      roundHistory: rh(4, (i) => i % 2 === 0, (i) => i % 2 === 1),
    },
  },
];

// ── MAÇ RAPORU SENARYOLARI (eval-report.ts biçimi, isTr:false → EN dalı) ─────
export const EN_REPORT_SCENARIOS: EnReportScenario[] = [
  {
    id: "ER1-ascent-cypher-def-loss",
    note: "EN RAPOR / Ascent / Cypher / DEFENSE / 11-13 kayıp / B Main tekrar-ölüm pattern",
    map: "Ascent", agent: "Cypher", rank: "silver", side: "defense",
    enemyComp: ["Jett", "Sova", "Omen", "Killjoy", "Reyna"], isTr: false, confidence: "high",
    userPrompt: `Map: Ascent, Agent: Cypher, Side: defense (DEFENSE — the player is holding sites), Rank: silver, Mode: competitive
Score: 11-13 (LOSS)
Team: Cypher,Jett,Sova,Omen,Sage vs Enemy: Jett,Sova,Omen,Killjoy,Reyna
Rounds:
R1 loss @ B Main (killed by jett operator) | R3 loss @ B Main (killed by jett operator) | R5 win | R7 loss @ Market (killed by reyna vandal) | R9 loss @ B Main (killed by jett operator) | R12 win | R15 loss @ A Site (killed by killjoy) | R20 loss @ B Main
MATCH INSIGHTS: Top mistake: holding B Main alone. Weakest area: site anchoring. Best round: R12. Decision score: 5/10. Survival rate: 38%.
AGGREGATED: Top killers: Jett operator x4. Top death locations: B Main x4, Market x2.
PER-ROUND DEATH ANALYSIS: R1: you held B Main alone and the Jett hit you from Heaven with the Operator. R9: same spot, same angle.`,
  },
  {
    id: "ER2-bind-raze-atk-win",
    note: "EN RAPOR / Bind / Raze / ATTACK / 13-8 galibiyet (iyi maç — ne işe yaradı)",
    map: "Bind", agent: "Raze", rank: "silver", side: "attack",
    enemyComp: ["Viper", "Cypher", "Chamber", "Skye", "Brimstone"], isTr: false, confidence: "high",
    userPrompt: `Map: Bind, Agent: Raze, Side: attack (ATTACK — the player is entering sites), Rank: silver, Mode: competitive
Score: 13-8 (WIN)
Team: Raze,Skye,Brimstone,Viper,Sage vs Enemy: Viper,Cypher,Chamber,Skye,Brimstone
Rounds:
R1 win | R2 win @ A Site (entry) | R4 loss @ Hookah | R6 win | R8 win @ B Site | R11 win (clutch 1v2) | R14 loss @ Showers | R19 win
MATCH INSIGHTS: Top mistake: solo lurk through Hookah. Weakest area: lurk timing. Best round: R11. Decision score: 8/10. Survival rate: 62%.
AGGREGATED: Top killers: Cypher vandal x2. Top death locations: Hookah x2.
PER-ROUND DEATH ANALYSIS: R4: you walked into Hookah alone and the Cypher trap plus vandal ended it. R11: you entered A with the boombot and a satchel, took 2 kills and won the clutch.`,
  },
  {
    id: "ER3-lotus-omen-atk-close",
    note: "EN RAPOR / Lotus / Omen / ATTACK / 13-11 yakın galibiyet / controller + eco yönetimi",
    map: "Lotus", agent: "Omen", rank: "silver", side: "attack",
    enemyComp: ["Chamber", "Killjoy", "Viper", "Fade", "Sage"], isTr: false, confidence: "medium",
    userPrompt: `Map: Lotus, Agent: Omen, Side: attack (ATTACK — the player is entering sites), Rank: silver, Mode: competitive
Score: 13-11 (WIN)
Team: Omen,Raze,Sova,Killjoy,Sage vs Enemy: Chamber,Killjoy,Viper,Fade,Sage
Rounds:
R2 loss @ A Main (killed by chamber operator) | R5 loss @ A Main (killed by chamber operator) | R8 win | R10 loss on eco | R13 win | R18 win | R22 loss @ C Site | R24 win
MATCH INSIGHTS: Top mistake: entering A Main without smokes. Weakest area: smoke timing. Best round: R13. Decision score: 6/10. Survival rate: 50%.
AGGREGATED: Top killers: Chamber operator x2. Top death locations: A Main x2.
PER-ROUND DEATH ANALYSIS: R2: you walked into A Main with no smoke up and the Chamber Operator took the same angle. R5: same mistake, same angle.`,
  },
  {
    id: "ER4-icebox-viper-def-overtime",
    note: "EN RAPOR / Icebox / Viper / DEFENSE / 12-14 uzatma kaybı / retake pattern + yüksek baskı",
    map: "Icebox", agent: "Viper", rank: "silver", side: "defense",
    enemyComp: ["Jett", "Sova", "Raze", "Omen", "Sage"], isTr: false, confidence: "high",
    userPrompt: `Map: Icebox, Agent: Viper, Side: defense (DEFENSE — the player is holding sites), Rank: silver, Mode: competitive
Score: 12-14 (LOSS, overtime)
Team: Viper,Sage,Jett,Killjoy,Sova vs Enemy: Jett,Sova,Raze,Omen,Sage
Rounds:
R1 win | R4 loss @ B Site (killed by raze phantom, retake) | R7 loss @ Kitchen | R10 win | R14 loss @ B Site (retake, spike planted) | R18 win | R22 loss @ Mid | R26 loss @ B Site (overtime, retake)
MATCH INSIGHTS: Top mistake: retaking B Site without wall or util. Weakest area: retake discipline. Best round: R18. Decision score: 6/10. Survival rate: 46%.
AGGREGATED: Top killers: Raze phantom x3. Top death locations: B Site x3, Kitchen x1.
PER-ROUND DEATH ANALYSIS: R14: you walked into the B Site retake with no wall active and the Raze cleared you first. R26: overtime retake, same entry path, no util traded for it.`,
  },
];

/** Toplam senaryo sayısı — test-en-leak.ts görev bandını (20-30) buradan doğrular. */
export const EN_CORPUS_TOTAL = EN_VISION_SCENARIOS.length + EN_REPORT_SCENARIOS.length;
