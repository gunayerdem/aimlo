// --------------------------------------------------------------------------
// VISION PROMPT GOLDEN VAKALARI — B06 (TR-KALAN-18 / OLCUM-ARACI-01/02, 2026-09-24)
// --------------------------------------------------------------------------
// NEDEN: vision route'un prompt kurulumu (sistem bölümleri + kullanıcı mesajı
// direktifleri) route.ts içinden lib/vision-prompt-builder.ts'e TAŞINDI. Taşıma
// prod prompt'unu tek bayt değiştirmemeli (prefix-cache + ölçüm tabanı). Bu
// vakalar için refactor ÖNCESİ route'un OpenAI'a yolladığı istek
// route-prompts.json'a yazıldı (GERÇEK POST handler, scripts/vision-route-harness.ts);
// scripts/test-eval-fidelity.ts [V] bugünkü route'un aynı gövdeyi ürettiğini kilitler.
//
// KAPSAM (bilerek çeşitli): TR/EN · konumlu/konumsuz · katilli/katilsiz · harita
// Unknown · ajan Unknown · sözlük-dışı silah ("with blade") · sözleşme-dışı canlı
// sayısı (allies=5) · spike+eco senaryo işaretçisi · ultReady/deathTiming/timer ·
// route/trade/K-D-A/killfeed · hafıza bloğu · patternContext (HP içerir) · maç
// kavram fallback'i (roundHistory'de death_type yokken) · hayatta kalınan round.
//
// GOLDEN YENİLEME (prompt BİLİNÇLİ değiştiğinde — ör. B09 prompt dalgası):
//   UPDATE_VISION_GOLDEN=1 npx tsx scripts/test-eval-fidelity.ts
// ve farkı commit mesajında gerekçelendir. Sistem mesajı karşılaştırması KB
// içeriği (knowledge/**) golden'daki özetle aynıyken yapılır; KB dalgası tek
// başına bu testi kırmaz (route↔builder↔eval paritesi yine her koşuda sınanır).
// --------------------------------------------------------------------------

export type VisionGoldenCase = {
  id: string;
  note: string;
  /** Desktop'ın /api/ai/vision'a attığı gövde (görsel hariç — düzenek ekler). */
  body: Record<string, unknown>;
  /** lib/player-memory buildMemoryContext çıktısı ("" = yok). */
  memoryContext?: string;
  /** readMatchConcepts'in döndüreceği maç kavram listesi (mc fallback'i). */
  matchConcepts?: string[];
};

const MATCH_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

function history(
  n: number,
  f: (i: number) => Record<string, unknown>,
): Record<string, unknown>[] {
  return Array.from({ length: n }, (_, i) => ({
    round_index: i + 1,
    death_detected_confidence: "observed",
    timestamp: i,
    ...f(i),
  }));
}

export const VISION_GOLDEN_CASES: VisionGoldenCase[] = [
  {
    id: "G1-tr-loc-killer-spike-eco",
    note: "TR · konumlu · katilli (op) · spike kurulu + eco (senaryo işaretçisi) · HP'li patternContext · death_type echo'lu geçmiş · hafıza",
    body: {
      round: 12, score: "7-4", result: "loss", map: "Ascent", agent: "Cypher", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Omen", "Killjoy", "Reyna"],
      died: true, killerInfo: "killed by jett with operator", deathLocation: "B Main", deathAngle: "front-left",
      deathTiming: "late", healthAtDeath: 100, hpSampleAgeSec: 1, alliesAlive: 3, enemiesAlive: 4,
      spikePlanted: true, economyType: "eco", credits: 1400, loadout: "spectre",
      patternContext: "Son 3 round'da 2 kez B Main'i tek tutarken 30 HP ile öldün.",
      matchId: MATCH_ID,
      roundHistory: history(11, (i) => ({
        died: i % 2 === 0, round_won: i % 3 === 0,
        ...(i % 2 === 0 ? { death_position: "B Main", position_confidence: "high", death_type: i % 4 === 0 ? "def-wide-hold" : "repeat-angle" } : {}),
      })),
    },
    memoryContext: "En çok öldüğün yerler: B Main (9 kez), Market (4 kez). En zayıf harita: Ascent.",
  },
  {
    id: "G2-en-loc-killer-route-ult",
    note: "EN · konumlu · katilli · ultReady + deathTiming + timer · route/trade/K-D-A/killfeed · kayıp serisi",
    body: {
      lang: "en", round: 9, score: "4-4", result: "loss", map: "Breeze", agent: "Chamber", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Viper", "Cypher", "Jett", "Sova", "Harbor"],
      died: true, killerInfo: "killed by viper with operator", deathLocation: "A Site", deathAngle: "front",
      deathTiming: "mid", alliesAlive: 2, enemiesAlive: 3, ultReady: true, roundTimerAtDeath: 38,
      economyType: "full_buy", loadout: "operator", playerRoute: "A Main → A Shop → A Site", routeConfidence: "high",
      tradedByAlly: false, tradeKillerAgent: "Jett", playerKills: 4, playerDeaths: 7, playerAssists: 2,
      scoreboardKda: "4/7/2", killfeedOrder: ["viper killed you", "jett killed viper"],
      roundHistory: history(8, (i) => ({ died: i >= 5, round_won: i < 5 })),
    },
  },
  {
    id: "G3-tr-noloc-nokiller-agent-unknown",
    note: "TR · konumsuz · katilsiz (bağlamsız ölüm) · ajan Unknown · allies=5 sözleşme-dışı · 12-11 maç sayısı · mc fallback",
    body: {
      round: 23, score: "12-11", result: "loss", map: "Lotus", agent: "Unknown", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Chamber", "Killjoy", "Viper", "Skye", "Fade"],
      died: true, alliesAlive: 5, enemiesAlive: 3, economyType: "full_buy", loadout: "vandal",
      matchId: MATCH_ID,
      roundHistory: history(22, (i) => ({ died: i % 2 === 1, round_won: i % 2 === 0 })),
    },
    matchConcepts: ["def-wide-hold", "def-wide-hold"],
  },
  {
    id: "G4-tr-map-unknown-blade",
    note: "TR · harita Unknown · sözlük-dışı silah ('with blade') · side yok · spike kurulu + half_buy",
    body: {
      round: 6, score: "3-2", result: "loss", map: "Unknown", agent: "Jett", rank: "silver",
      mode: "competitive", enemyComp: ["Chamber", "Sova", "Omen", "Killjoy", "Raze"],
      died: true, killerInfo: "killed by chamber with blade", deathLocation: "B Site",
      spikePlanted: true, economyType: "half_buy", loadout: "vandal",
      roundHistory: history(5, (i) => ({ died: i % 2 === 0, round_won: i % 2 === 1 })),
    },
  },
  {
    id: "G5-en-noloc-killer-pistol",
    note: "EN · konumsuz · katilli (sheriff) · pistol (ekonomi işaretçisi)",
    body: {
      lang: "en", round: 4, score: "1-2", result: "loss", map: "Split", agent: "Omen", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Breach", "Skye", "Cypher", "Jett"],
      died: true, killerInfo: "killed by raze with sheriff", economyType: "pistol", loadout: "ghost",
      roundHistory: history(3, () => ({ died: true, round_won: false })),
    },
  },
  {
    id: "G6-tr-survived",
    note: "TR · hayatta kalındı (died=false) — görsel ve ölüm direktifleri yok",
    body: {
      round: 6, score: "3-2", result: "win", map: "Haven", agent: "Jett", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Sova", "Phoenix", "Astra", "Chamber"],
      died: false, economyType: "full_buy", loadout: "operator",
      roundHistory: history(5, (i) => ({ died: i < 2, round_won: i >= 2 })),
    },
  },
];
