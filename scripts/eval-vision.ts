/**
 * EMPIRICAL COACH-VOICE EVAL HARNESS — KB brutal-audit Cycle 3 (2026-06-26)
 * ─────────────────────────────────────────────────────────────────────────
 * Reproduces the EXACT vision-route prompt pipeline OFFLINE and generates real
 * gpt-5-mini coach feedback for a battery of realistic round scenarios, then
 * applies the SAME post-processing the route does (realityCheck + cleanCoachText).
 *
 * WHY: the KB-audit run must be EMPIRICALLY verified — not reasoned about. This
 * produces the actual text a user would see so the language-editor / ai-prompt-
 * expert agents can brutally grade it and the next fix cycle targets REAL defects.
 *
 * ⚠ SADAKAT SÖZLEŞMESİ (B9, 2026-07-31): aşağıdaki "SAME post-processing" iddiası
 * bir süre SAHTEYDİ — postProcess prod'dan 5 noktada sapmıştı (detay orada).
 * KURAL: app/api/ai/vision/route.ts'in son-işlem zinciri (realityCheck →
 * cleanCoachText → enforceAgentKit → clampWords) DEĞİŞTİĞİNDE burası da AYNI
 * commit'te güncellenir. Aksi hâlde eval "empirik kanıt" olmaktan çıkıp sahte
 * güvene döner. Zincirin sıra-testi: scripts/test-pipeline-chain.ts (B10).
 *
 * Faithfulness: imports the same shared modules the route uses —
 *   - SYSTEM_PROMPT(_EN_ADDENDUM) / USER_PROMPT(_EN) / buildRoundFeedbackSchema (lib/vision-prompt)
 *   - buildPolicyBlock (vision opts: ocr/single/vision)    (lib/ai-policy)
 *   - loadVisionKnowledge (real knowledge/**.md RAG)        (lib/knowledge-loader)
 *   - realityCheck                                          (lib/reality-checker)
 *   - cleanCoachText                                        (lib/coach-text)
 *   - sanitizePromptInput                                   (lib/prompt-safety)
 * The system+user assembly below mirrors app/api/ai/vision/route.ts:731-996.
 * Text-only (no image) — coach-voice quality is independent of the screenshot;
 * died scenarios send the OCR truth the desktop derives, which is what matters.
 *
 * RUN:  npx tsx scripts/eval-vision.ts
 * OUT:  scripts/eval-out/cycle<N>-samples.json  (+ console summary)
 */
import * as fs from "fs";
import * as path from "path";
// B57 (2026-07-31): EN aynası için route'un EN parçaları da import edilir
// (SYSTEM_PROMPT_EN_ADDENDUM / USER_PROMPT_EN / buildRoundFeedbackSchema).
import { SYSTEM_PROMPT, SYSTEM_PROMPT_EN_ADDENDUM, USER_PROMPT, USER_PROMPT_EN, buildRoundFeedbackSchema } from "../lib/vision-prompt";
import { buildPolicyBlock } from "../lib/ai-policy";
import { loadVisionKnowledge } from "../lib/knowledge-loader";
// B9 (2026-07-31): factGround artık ELDE kurulmuyor — route'un buildFactGround'u.
import { realityCheck, buildFactGround } from "../lib/reality-checker";
import { cleanCoachText, clampWords, stripNumericHp } from "../lib/coach-text";
import { buildAgentAbilityHint, enforceAgentKit } from "../lib/agent-abilities";
// B60 (2026-08-04): EN-native korpus — aşağıda SCENARIOS'a ekleniyor.
import { EN_VISION_SCENARIOS } from "../evals/en-corpus";
import { sanitizePromptInput } from "../lib/prompt-safety";
import { classifyDeath, buildDeathTypeDirective, type DeathType } from "../lib/death-type";
import { buildHistoryBlock, type RoundHistoryEntry } from "../lib/history-block";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// (rank-4, 2026-08-24) lib/match-concepts.ts Upstash set'inin koşu-içi simülasyonu:
// maç başına (id'deki M\d+ öneki) verilen death-type kümesi. Route'taki fallback'in
// eval karşılığı — sadakat sözleşmesi (B9 sınıfı): iki dosya AYNI commit'te aynı
// prev listesini kurar. Sentetik id'ler desene uymaz → boş kalır, ölçüm tabanı değişmez.
const MATCH_CONCEPT_SIM = new Map<string, Set<DeathType>>();
const CYCLE = process.env.EVAL_CYCLE || "3";

// ── Load OPENAI_API_KEY from .env.local (tsx doesn't auto-load) ──
function loadApiKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  }
  throw new Error("OPENAI_API_KEY not found in env or .env.local");
}
const API_KEY = loadApiKey();

// ── Scenario type: a realistic round the desktop would POST ──
type Scenario = {
  id: string;
  note: string; // what this scenario stresses
  body: Record<string, unknown>; // VisionRequest-shaped (no image)
  memoryContext?: string; // optional synthetic cross-match memory block
  /* B57 (2026-07-31): İSTEK DİLİ — route'un reqLang'i (VisionRequest.lang).
   * ÖNCEDEN: korpusun 31/31 senaryosu sessizce TR'ydi ve buildPolicyBlock'a
   * lang:"tr" HARDCODE ediliyordu → EN kullanıcıya giden zincir (SYSTEM_PROMPT_
   * EN_ADDENDUM + USER_PROMPT_EN + EN şema + cleanCoachText'in EN dalı +
   * realityCheck'in EN replacement'ları) PROD'DA CANLI olduğu hâlde eval'de
   * HİÇ egzersiz edilmiyordu. Alan opsiyonel: verilmezse "tr" → mevcut 31
   * senaryonun davranışı BAYT-AYNI kalır (eski cycle'larla karşılaştırılabilirlik
   * korunur). */
  lang?: "tr" | "en";
};

/** Senaryonun istek dili — route'un reqLang'iyle aynı sözleşme (varsayılan tr). */
function langOf(s: Scenario): "tr" | "en" {
  return s.lang === "en" ? "en" : "tr";
}

// ── 10 scenarios — both sides, died/survived, all confidence + economy tiers,
//    trade/route fields, newer maps, pattern context, cross-match memory ──
const SCENARIOS: Scenario[] = [
  {
    id: "S1-ascent-cypher-def-strong",
    note: "Ascent / Cypher / SAVUNMA / yüksek confidence + güçlü tekrar-pattern (operator B Main)",
    body: {
      round: 12, score: "7-4", result: "loss", map: "Ascent", agent: "Cypher", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Omen", "Killjoy", "Reyna"],
      died: true, killerInfo: "killed by jett with operator", deathLocation: "B Main", deathAngle: "front-left",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      patternContext: "Son 3 round'da 2 kez B Main'i tek tutarken Jett'e operator'la öldün.",
      roundHistory: Array.from({ length: 11 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: i % 3 === 0,
        death_detected_confidence: "observed", timestamp: i,
        death_position: i % 2 === 0 ? "B Main" : "Market", position_confidence: "high",
      })),
    },
  },
  {
    id: "S2-bind-sage-atk-r1-calibrating",
    note: "Bind / Sage / SALDIRI / R1 (calibrating, history YOK) — hedge dili DOĞRU ama spesifik kalmalı",
    body: {
      round: 1, score: "0-0", result: "loss", map: "Bind", agent: "Sage", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Viper", "Cypher", "Raze", "Skye", "Brimstone"],
      died: true, killerInfo: "killed by cypher with vandal", deathLocation: "A Showers", deathAngle: "right",
      healthAtDeath: 80, alliesAlive: 4, enemiesAlive: 5, economyType: "pistol", loadout: "ghost",
    },
  },
  {
    id: "S3-haven-jett-atk-survived",
    note: "Haven / Jett / SALDIRI / died=false (ölüm YOK) — pozisyon/util hatasına odak",
    body: {
      round: 6, score: "3-2", result: "win", map: "Haven", agent: "Jett", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Sova", "Phoenix", "Astra", "Chamber"],
      died: false, economyType: "full_buy", loadout: "operator",
      roundHistory: Array.from({ length: 5 }, (_, i) => ({
        round_index: i + 1, died: i < 2, round_won: i >= 2,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  {
    id: "S4-split-omen-def-eco",
    note: "Split / Omen / SAVUNMA / eco + sheriff killer + low confidence (3 round history)",
    body: {
      round: 4, score: "1-2", result: "loss", map: "Split", agent: "Omen", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Breach", "Skye", "Cypher", "Jett"],
      died: true, killerInfo: "killed by raze with sheriff", deathLocation: "A Ramps", deathAngle: "back-right",
      healthAtDeath: 50, alliesAlive: 2, enemiesAlive: 4, economyType: "eco", credits: 1400, loadout: "spectre",
      roundHistory: Array.from({ length: 3 }, (_, i) => ({
        round_index: i + 1, died: true, round_won: false,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "A Ramps", position_confidence: "high",
      })),
    },
  },
  {
    id: "S5-lotus-raze-atk-op-pattern",
    note: "Lotus / Raze / SALDIRI / düşman operator + pattern (B Main tekrar) + medium",
    body: {
      round: 8, score: "4-3", result: "loss", map: "Lotus", agent: "Raze", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Chamber", "Killjoy", "Viper", "Skye", "Fade"],
      died: true, killerInfo: "killed by chamber with operator", deathLocation: "A Main", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 5, economyType: "full_buy", loadout: "vandal",
      patternContext: "2 round üst üste A Main'e utility'siz girdin, Chamber operator'la aynı açıdan aldı.",
      roundHistory: Array.from({ length: 7 }, (_, i) => ({
        round_index: i + 1, died: i >= 4, round_won: i < 4,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "A Main", position_confidence: "high",
      })),
    },
  },
  {
    id: "S6-sunset-killjoy-def-retake-lowhp",
    note: "Sunset / Killjoy / SAVUNMA / spike planted + düşük HP + retake/save kararı",
    body: {
      round: 15, score: "8-6", result: "loss", map: "Sunset", agent: "Killjoy", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Omen", "Breach", "Reyna"],
      died: true, killerInfo: "killed by reyna with phantom", deathLocation: "A Site", deathAngle: "left",
      healthAtDeath: 30, alliesAlive: 1, enemiesAlive: 3, spikePlanted: true, economyType: "full_buy", loadout: "phantom",
      roundHistory: Array.from({ length: 14 }, (_, i) => ({
        round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 0,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  {
    id: "S7-icebox-sova-atk-forcebuy-badkd",
    note: "Icebox / Sova / SALDIRI / force_buy + scoreboard K/D kötü + killfeed",
    body: {
      round: 10, score: "5-4", result: "loss", map: "Icebox", agent: "Sova", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Sage", "Viper", "Jett", "Killjoy", "Sova"],
      died: true, killerInfo: "killed by jett with vandal", deathLocation: "B Site", deathAngle: "right",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 4, economyType: "force_buy", credits: 2300, loadout: "spectre",
      playerKills: 4, playerDeaths: 9, playerAssists: 2,
      killfeedOrder: ["jett killed you", "viper killed ally", "you killed sage"],
      roundHistory: Array.from({ length: 9 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: false,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  {
    id: "S8-abyss-clove-def-notrade",
    note: "Abyss (yeni harita) / Clove / SAVUNMA / tradedByAlly=false (solo death)",
    body: {
      round: 7, score: "3-3", result: "loss", map: "Abyss", agent: "Clove", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Yoru", "Gekko", "Vyse", "Tejo", "Neon"],
      died: true, killerInfo: "killed by neon with phantom", deathLocation: "Mid", deathAngle: "front-right",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 5, economyType: "full_buy", loadout: "vandal",
      tradedByAlly: false,
      roundHistory: Array.from({ length: 6 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 1, round_won: i % 2 === 0,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  {
    id: "S9-breeze-chamber-atk-route",
    note: "Breeze / Chamber / SALDIRI / playerRoute MEASURED (FAZ3) + high confidence",
    body: {
      round: 13, score: "7-5", result: "loss", map: "Breeze", agent: "Chamber", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Viper", "Cypher", "Jett", "Sova", "Harbor"],
      died: true, killerInfo: "killed by viper with operator", deathLocation: "A Site", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 3, economyType: "full_buy", loadout: "operator",
      playerRoute: "A Main → A Shop → A Site", routeConfidence: "high",
      roundHistory: Array.from({ length: 12 }, (_, i) => ({
        round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 1,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  {
    id: "S10-pearl-fade-def-memory",
    note: "Pearl / Fade / SAVUNMA / cross-match memory bloğu (uzun-vadeli profil) + medium",
    body: {
      round: 5, score: "2-3", result: "loss", map: "Pearl", agent: "Fade", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Cypher", "Omen", "Sova", "Sage"],
      died: true, killerInfo: "killed by jett with vandal", deathLocation: "B Link", deathAngle: "back-left",
      healthAtDeath: 70, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "phantom",
      roundHistory: Array.from({ length: 4 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: i % 2 === 1,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
    memoryContext:
      "En çok öldüğün yerler: B Link (18 kez), A Main (11 kez). En zayıf harita: Pearl (%38 winrate). " +
      "En iyi ajan: Fade. Tespit edilen eğilim: savunmada açıyı çok geniş tutuyorsun.",
  },
  // ── Cycle 5 genişletme: daha çok ajan + restore haritalar + edge case ──
  {
    id: "S11-fracture-breach-atk",
    note: "Fracture (restore) / Breach / SALDIRI / initiator + full data",
    body: {
      round: 9, score: "4-4", result: "loss", map: "Fracture", agent: "Breach", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Viper", "Jett", "Killjoy", "Astra"],
      died: true, killerInfo: "killed by killjoy with vandal", deathLocation: "A Hall", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 8 }, (_, i) => ({ round_index: i + 1, died: i % 2 === 0, round_won: i % 2 === 1, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S12-corrode-gekko-def",
    note: "Corrode (yeni harita) / Gekko / SAVUNMA / initiator",
    body: {
      round: 6, score: "3-2", result: "loss", map: "Corrode", agent: "Gekko", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Sova", "Omen", "Sage", "Chamber"],
      died: true, killerInfo: "killed by raze with vandal", deathLocation: "B Site", deathAngle: "right",
      healthAtDeath: 60, alliesAlive: 3, enemiesAlive: 5, economyType: "full_buy", loadout: "phantom",
      roundHistory: Array.from({ length: 5 }, (_, i) => ({ round_index: i + 1, died: i % 2 === 0, round_won: i % 2 === 1, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S13-icebox-harbor-atk",
    note: "Icebox (restore) / Harbor / SALDIRI / controller — KB grounding retest",
    body: {
      round: 11, score: "6-5", result: "loss", map: "Icebox", agent: "Harbor", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Sage", "Viper", "Jett", "Sova", "Killjoy"],
      died: true, killerInfo: "killed by sage with operator", deathLocation: "Mid", deathAngle: "front-left",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 3, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 10 }, (_, i) => ({ round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 0, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S14-bind-yoru-atk-nokiller",
    note: "Bind / Yoru / SALDIRI / EDGE: killerInfo YOK (öldü ama kimden belli değil) — uydurma kontrolü",
    body: {
      round: 7, score: "3-4", result: "loss", map: "Bind", agent: "Yoru", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Viper", "Raze", "Skye", "Brimstone"],
      died: true, deathLocation: "Hookah", healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 3,
      economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 6 }, (_, i) => ({ round_index: i + 1, died: i % 2 === 1, round_won: i % 2 === 0, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S15-ascent-iso-def-unknowncomp",
    note: "Ascent / Iso / SAVUNMA / EDGE: unknownEnemyComp (düşman roster YOK) — uydurma kontrolü",
    body: {
      round: 4, score: "2-1", result: "loss", map: "Ascent", agent: "Iso", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: [], unknownEnemyComp: true,
      died: true, killerInfo: "killed by unknown with phantom", deathLocation: "A Main", deathAngle: "right",
      healthAtDeath: 80, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "phantom",
      roundHistory: Array.from({ length: 3 }, (_, i) => ({ round_index: i + 1, died: i % 2 === 0, round_won: i % 2 === 1, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S16-sunset-deadlock-def-ult",
    note: "Sunset / Deadlock / SAVUNMA / sentinel + ultReady + spikePlanted (retake)",
    body: {
      round: 16, score: "9-6", result: "loss", map: "Sunset", agent: "Deadlock", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Omen", "Breach", "Reyna"],
      died: true, killerInfo: "killed by jett with vandal", deathLocation: "B Site", deathAngle: "left",
      healthAtDeath: 40, alliesAlive: 1, enemiesAlive: 2, spikePlanted: true, ultReady: true,
      economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 15 }, (_, i) => ({ round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 0, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S17-lotus-astra-atk-eco",
    note: "Lotus / Astra / SALDIRI / controller + eco (save kararı)",
    body: {
      round: 5, score: "2-3", result: "loss", map: "Lotus", agent: "Astra", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Chamber", "Killjoy", "Viper", "Skye", "Fade"],
      died: true, killerInfo: "killed by killjoy with sheriff", deathLocation: "A Main", deathAngle: "right",
      healthAtDeath: 30, alliesAlive: 1, enemiesAlive: 3, economyType: "eco", credits: 1200, loadout: "classic",
      roundHistory: Array.from({ length: 4 }, (_, i) => ({ round_index: i + 1, died: true, round_won: false, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S19-summit-raze-atk-walls",
    note: "Summit (YENİ harita) / Raze / SALDIRI / Mid kontrol + duvar mekaniği — KB grounding testi",
    body: {
      round: 8, score: "4-3", result: "loss", map: "Summit", agent: "Raze", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Sova", "Omen", "Killjoy", "Jett"],
      died: true, killerInfo: "killed by cypher with vandal", deathLocation: "A Main", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 7 }, (_, i) => ({ round_index: i + 1, died: i % 2 === 0, round_won: i % 2 === 1, death_detected_confidence: "observed", timestamp: i, death_position: i % 2 === 0 ? "A Main" : "Mid Fountain", position_confidence: "high" })),
    },
  },
  {
    id: "S20-summit-cypher-def-mid",
    note: "Summit (YENİ harita) / Cypher / SAVUNMA / Mid Fountain + duvar — sentinel/kamera-duvar etkileşimi",
    body: {
      round: 12, score: "6-5", result: "loss", map: "Summit", agent: "Cypher", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Skye", "Omen", "Raze"],
      died: true, killerInfo: "killed by jett with operator", deathLocation: "Mid Fountain", deathAngle: "right",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 11 }, (_, i) => ({ round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 0, death_detected_confidence: "observed", timestamp: i })),
    },
  },
  {
    id: "S18-haven-phoenix-def-r2",
    note: "Haven / Phoenix / SAVUNMA / duelist-on-defense + düşük confidence (R2)",
    body: {
      round: 2, score: "1-0", result: "win", map: "Haven", agent: "Phoenix", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Sova", "Cypher", "Jett", "Omen", "Sage"],
      died: true, killerInfo: "killed by sova with guardian", deathLocation: "C Long", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: [{ round_index: 1, died: false, round_won: true, death_detected_confidence: "observed", timestamp: 0 }],
    },
  },

  // ── KAPSAM GENİŞLETME (KB 10h nöbeti 2026-07-25) ──────────────────────────
  // İlk 20 senaryo 11 ajanın KB dosyasına HİÇ dokunmuyordu (reyna, viper,
  // brimstone, skye, kayo, neon, tejo, vyse, waylay, veto, miks) — o dosyalar
  // eval ile hiç doğrulanmıyordu. En yeni ajanların (tejo/vyse/waylay/veto/miks)
  // KB'si en az test edilmiş olan; fix dalgasından sonra regresyon avlamak için
  // şart. NOT: S1-S20 ID'leri BOZULMADI — A/B karşılaştırması o 20 üzerinden
  // yapılır, bunlar kapsam taraması.
  {
    id: "S21-ascent-reyna-atk-solo",
    note: "Ascent / Reyna / SALDIRI / solo entry + tekrar eden aynı-açı ölümü",
    body: {
      round: 9, score: "4-4", result: "loss", map: "Ascent", agent: "Reyna", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Killjoy", "Sova", "Omen", "Jett", "Sage"],
      died: true, killerInfo: "killed by killjoy with vandal", deathLocation: "A Main", deathAngle: "front-right",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 5, economyType: "full_buy", loadout: "vandal",
      patternContext: "Son 4 round'da 3 kez A Main'e ilk giren sen oldun ve trade alınmadan öldün.",
      roundHistory: Array.from({ length: 8 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: i % 3 === 0,
        death_detected_confidence: "observed", timestamp: i,
        death_position: i % 2 === 0 ? "A Main" : "Mid", position_confidence: "high",
      })),
    },
  },
  {
    id: "S22-icebox-viper-def-postplant",
    note: "Icebox / Viper / SAVUNMA / spike kurulu + post-plant/retake yolu",
    body: {
      round: 14, score: "7-6", result: "loss", map: "Icebox", agent: "Viper", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Raze", "Omen", "Sage"],
      died: true, killerInfo: "killed by raze with phantom", deathLocation: "B Site", deathAngle: "back",
      healthAtDeath: 100, alliesAlive: 1, enemiesAlive: 3, economyType: "full_buy", loadout: "phantom",
      spikePlanted: true,
      roundHistory: Array.from({ length: 13 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 1, round_won: i % 2 === 0,
        death_detected_confidence: "observed", timestamp: i,
        death_position: i % 3 === 0 ? "B Site" : "Mid", position_confidence: "medium",
      })),
    },
  },
  {
    id: "S23-split-brimstone-atk-eco",
    note: "Split / Brimstone / SALDIRI / eco round + ekonomi rehberi yolu",
    body: {
      round: 5, score: "1-3", result: "loss", map: "Split", agent: "Brimstone", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Raze", "Sage", "Sova", "Jett"],
      died: true, killerInfo: "killed by cypher with sheriff", deathLocation: "A Ramp", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 4, economyType: "eco", loadout: "classic",
      roundHistory: Array.from({ length: 4 }, (_, i) => ({
        round_index: i + 1, died: true, round_won: false,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "A Ramp", position_confidence: "high",
      })),
    },
  },
  {
    id: "S24-lotus-skye-atk-info",
    note: "Lotus / Skye / SALDIRI / initiator bilgi-util kullanımı",
    body: {
      round: 7, score: "3-3", result: "loss", map: "Lotus", agent: "Skye", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Chamber", "Viper", "Killjoy", "Fade", "Neon"],
      died: true, killerInfo: "killed by chamber with operator", deathLocation: "C Mound", deathAngle: "front-left",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 6 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: i % 2 === 1,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "C Mound", position_confidence: "high",
      })),
    },
  },
  {
    id: "S25-bind-kayo-def-flank",
    note: "Bind / KAY/O / SAVUNMA / flank ölümü + arka kontrol",
    body: {
      round: 11, score: "5-5", result: "loss", map: "Bind", agent: "KAY/O", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Yoru", "Raze", "Skye", "Brimstone", "Cypher"],
      died: true, killerInfo: "killed by yoru with vandal", deathLocation: "B Hall", deathAngle: "back",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "phantom",
      roundHistory: Array.from({ length: 10 }, (_, i) => ({
        round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 1,
        death_detected_confidence: "observed", timestamp: i,
        death_position: i % 3 === 0 ? "B Hall" : "A Site", position_confidence: "medium",
      })),
    },
  },
  {
    id: "S26-breeze-neon-atk-tempo",
    note: "Breeze / Neon / SALDIRI / hız-tempo ölümü (duelist over-aggression)",
    body: {
      round: 6, score: "2-4", result: "loss", map: "Breeze", agent: "Neon", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Viper", "Cypher", "Sova", "Jett", "Harbor"],
      died: true, killerInfo: "killed by viper with vandal", deathLocation: "A Main", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 5, economyType: "full_buy", loadout: "vandal",
      patternContext: "3 round üst üste takımdan önce girdin ve trade alınmadan öldün.",
      roundHistory: Array.from({ length: 5 }, (_, i) => ({
        round_index: i + 1, died: true, round_won: false,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "A Main", position_confidence: "high",
      })),
    },
  },
  {
    id: "S27-sunset-tejo-atk-newagent",
    note: "Sunset / Tejo / SALDIRI / EN YENİ ajan — KB doğruluğu kritik",
    body: {
      round: 8, score: "4-3", result: "loss", map: "Sunset", agent: "Tejo", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Killjoy", "Cypher", "Jett", "Omen", "Sova"],
      died: true, killerInfo: "killed by killjoy with phantom", deathLocation: "B Market", deathAngle: "front-right",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 7 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: i % 3 === 1,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "B Market", position_confidence: "medium",
      })),
    },
  },
  {
    id: "S28-pearl-vyse-def-newagent",
    note: "Pearl / Vyse / SAVUNMA / EN YENİ sentinel — KB doğruluğu kritik",
    body: {
      round: 10, score: "5-4", result: "loss", map: "Pearl", agent: "Vyse", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Sova", "Astra", "Chamber", "Skye"],
      died: true, killerInfo: "killed by raze with vandal", deathLocation: "B Link", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 2, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 9 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 1, round_won: i % 2 === 0,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "B Link", position_confidence: "high",
      })),
    },
  },
  {
    id: "S29-fracture-waylay-atk-newagent",
    note: "Fracture / Waylay / SALDIRI / EN YENİ duelist — KB doğruluğu kritik",
    body: {
      round: 12, score: "6-5", result: "loss", map: "Fracture", agent: "Waylay", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Cypher", "Viper", "Sova", "Killjoy", "Jett"],
      died: true, killerInfo: "killed by cypher with vandal", deathLocation: "A Hall", deathAngle: "front-left",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "phantom",
      roundHistory: Array.from({ length: 11 }, (_, i) => ({
        round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 0,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "A Hall", position_confidence: "medium",
      })),
    },
  },
  {
    id: "S30-corrode-veto-def-newagent",
    note: "Corrode / Veto / SAVUNMA / EN YENİ ajan + en yeni harita — çift risk",
    body: {
      round: 7, score: "3-3", result: "loss", map: "Corrode", agent: "Veto", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Jett", "Sova", "Brimstone", "Sage", "Raze"],
      died: true, killerInfo: "killed by jett with operator", deathLocation: "Mid", deathAngle: "front",
      healthAtDeath: 100, alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 6 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: i % 2 === 1,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "Mid", position_confidence: "medium",
      })),
    },
  },
  {
    id: "S31-summit-miks-atk-newagent",
    note: "Summit / Miks / SALDIRI / EN YENİ ajan — KB doğruluğu kritik",
    body: {
      round: 9, score: "4-4", result: "loss", map: "Summit", agent: "Miks", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Killjoy", "Cypher", "Sova", "Omen", "Jett"],
      died: true, killerInfo: "killed by sova with guardian", deathLocation: "A Main", deathAngle: "front-right",
      healthAtDeath: 100, alliesAlive: 4, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 8 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 1, round_won: i % 3 === 0,
        death_detected_confidence: "observed", timestamp: i,
        death_position: "A Main", position_confidence: "high",
      })),
    },
  },
];

/* ── EN AYNA SENARYOLARI — B57 (2026-07-31) ──────────────────────────────────
 * SORUN: korpusun 31/31 senaryosu TR'ydi. EN dil zinciri 2026-07-18'den beri
 * PROD'DA CANLI (route reqLang, 4 katman) ama hiçbir senaryo onu LLM çıktısı
 * üzerinde egzersiz etmiyordu — cleanCoachText/stripHpClaims/realityCheck'in EN
 * dalları kör noktaydı (yalnız test-strip-hp'de birkaç izole EN vakası vardı).
 *
 * TASARIM: gövdeler KOPYALANMIYOR, mevcut senaryolardan TÜRETİLİYOR — TR
 * senaryosu güncellenince aynası kendiliğinden güncel kalır (kopya-yapıştır
 * çürümesi yapısal olarak imkânsız). Seçilen 5 senaryo B57'nin işaret ettiği
 * eksenleri kapsar: S1 tekrar-pattern + yüksek confidence, S3 died=false
 * (survived yolu — korpusta yalnız 2 tane vardı), S9 route/trade alanları,
 * S21 solo-giriş, S26 tempo.
 *
 * MALİYET: +5 çağrı/koşu (~%16). Yalnızca eval-vision KOŞULDUĞUNDA harcanır;
 * CI'ye GİRMEZ (.github/workflows/ci.yml'de bilerek dışarıda). Yalnız TR
 * ölçmek istersen: EVAL_LANG=tr npx tsx scripts/eval-vision.ts
 */
const EN_MIRROR_PREFIXES = ["S1-", "S3-", "S9-", "S21-", "S26-"];
for (const base of SCENARIOS.filter((s) => EN_MIRROR_PREFIXES.some((p) => s.id.startsWith(p)))) {
  SCENARIOS.push({
    ...base,
    id: `${base.id}-en`,
    note: `[EN AYNASI] ${base.note}`,
    lang: "en",
    // body.lang: masaüstünün gerçekte POST'ladığı alan (VisionRequest.lang).
    // Prompt kurucuları Scenario.lang'i okur; bu alan gövdeyi sadık tutar.
    body: { ...base.body, lang: "en" },
  });
}

// ── EN-NATIVE KORPUS BAĞLANTISI — B60 (pano özellik dalgası, 2026-08-04) ──
// Yukarıdaki 5 EN-AYNASI, TR senaryolarından türetiliyor: EN yolunun bozulmadığını
// gösterir ama EN'e ÖZGÜ senaryoları (farklı death-type dağılımı, edge-case'ler)
// hiç ölçmez. evals/en-corpus.ts 26 EN-native round senaryosu taşıyor; buraya
// bağlanmadan ölçüme HİÇ girmiyordu — korpus yazıldı ama kullanılmıyordu.
// Yapısal uyum yeter (aynı id/note/body/memoryContext/lang alanları); id'ler
// "E" önekli olduğu için S-serisiyle çakışmaz → yalnız EN ölçmek için:
//   EVAL_ONLY=E npx tsx scripts/eval-vision.ts     (ya da EVAL_LANG=en)
// MALİYET UYARISI: bu +26 gerçek AI çağrısı demek; koşu ~2 katına çıkar.
// CI'ye GİRMEZ (eval'ler bilerek CI dışında).
SCENARIOS.push(...(EN_VISION_SCENARIOS as unknown as Scenario[]));

/* ── GERÇEK-KORPUS YOLU — kanıt altyapısı rank-1 (2026-08-24) ─────────────────
 * EVAL_CORPUS=real → SCENARIOS yerine evals/real-rounds-23.json yüklenir:
 * canlı-test #12 masaüstü dump'ındaki 23 GERÇEK round (kullanıcı 6583ac7a,
 * Ascent/Jett; 1 maçsız ısınma + 22 round'luk maç 13c08622), Scenario şekline
 * dönüştürülmüş ve roundHistory zinciri korunmuş (her round'un history'si aynı
 * maçın önceki round'larından kurulur; round_won skor-deltasından türetilir).
 * Id sözleşmesi: M{n}-R{r}-{map}-{agent} → eval-score maç-gruplu repeatScore'u
 * bu id'den parse eder. Tanımsızsa davranış BUGÜNKÜYLE BAYT-AYNI (sentetik
 * korpus; eski cycle A/B'leri etkilenmez). Baseline koşusu:
 *   EVAL_CYCLE=real-base EVAL_CORPUS=real npx tsx scripts/eval-vision.ts */
function loadScenarios(): Scenario[] {
  if (process.env.EVAL_CORPUS !== "real") return SCENARIOS;
  const p = path.join(process.cwd(), "evals", "real-rounds-23.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as Scenario[];
}

// ── confidence derivation (route 725-730) ──
function deriveConfidence(rh: unknown): "calibrating" | "low" | "medium" | "high" {
  const arr = Array.isArray(rh) ? rh : null;
  if (!arr || !arr.length) return "calibrating";
  if (arr.length < 4) return "low";
  if (arr.length < 8) return "medium";
  return "high";
}

// ── system message assembly (route 731-792) ──
function buildSystemMessage(s: Scenario): string {
  const b = s.body;
  const lang = langOf(s);                            // B57 (2026-07-31)
  const confidence = deriveConfidence(b.roundHistory);
  const sections: string[] = [
    // route.ts:639 — EN'de sistem prompt'una EN eklentisi biner.
    lang === "en" ? SYSTEM_PROMPT + SYSTEM_PROMPT_EN_ADDENDUM : SYSTEM_PROMPT,
    buildPolicyBlock({
      confidence, tone: "strict", lang,
      includeEnemyGate: true, includeDecisionRubric: false,
      anchorMode: "ocr", outputFocusMode: "single", enemyGateMode: "vision",
    }),
  ];
  const kb = loadVisionKnowledge({
    map: b.map as string | undefined,
    agent: b.agent as string | undefined,
    rank: b.rank as string | undefined,
    enemyAgents: b.enemyComp as string[] | undefined,
    spikePlanted: typeof b.spikePlanted === "boolean" ? (b.spikePlanted as boolean) : undefined,
    economyType: b.economyType as string | undefined,
    side: b.side as string | undefined,
  });
  if (kb.blocks.agent) sections.push(kb.blocks.agent);
  if (kb.blocks.map) sections.push(kb.blocks.map);
  if (kb.blocks.contextual) sections.push(kb.blocks.contextual);
  const abilityHint = buildAgentAbilityHint(b.agent as string | undefined, lang);
  if (abilityHint) sections.push(abilityHint);
  if (s.memoryContext) {
    const capped = s.memoryContext.trim().slice(0, 1200);
    // route.ts:707-715 — sarmalayıcı reqLang'de (EN'de Türkçe örnek cümle
    // modelce taklit ediliyordu, canlı-test 2026-07-18 dil sızıntısı).
    sections.push(
      lang === "en"
        ? `[CROSS-MATCH HISTORY — long-term player profile (from persisted data, NOT this round)]\n` +
          `This is the player's accumulated profile from past matches. You may reference it like a coach when relevant ` +
          `(e.g. "you died at A Short again — that is your recurring spot"); but this round's OCR data always takes priority. ` +
          `Do NOT alter these numbers, do NOT invent new statistics.\n${capped}`
        : `[CROSS-MATCH GEÇMİŞİ — uzun vadeli oyuncu profili (kalıcı veriden, bu round'a ait DEĞİL)]\n` +
          `Bu, oyuncunun geçmiş maçlardan birikmiş profilidir. İlgiliyse koç gibi referans verebilirsin ` +
          `(ör. "yine A Short'ta öldün — bu senin tekrar eden noktan"); ama bu round'un OCR verisi her zaman önceliklidir. ` +
          `Buradaki sayıları DEĞİŞTİRME, yeni istatistik UYDURMA.\n${capped}`,
    );
  }
  if (typeof b.patternContext === "string" && b.patternContext) {
    const clean = sanitizePromptInput(b.patternContext, { max: 2000 });
    if (clean) sections.push(`[PATTERN CONTEXT — Rust Client]\n${clean}`);
  }
  return { msg: sections.join("\n\n---\n\n"), confidence, kb } as unknown as string;
}

// ── ctx + user prompt assembly (route 769-1101, fields-present subset) ──
//
// ⚠ AÇIK SADAKAT BOŞLUĞU — B83 denetimi sırasında ÖLÇÜLDÜ (2026-07-31).
// B83'ün asıl derdi (factGround eval'de elle kuruluyor) postProcess'te ZATEN
// kapalı (aşağıya bak). Ama aynı sınıftan bir sapma PROMPT tarafında duruyor:
// prod'un user mesajı (route.ts:1062-1080) burada ÜRETİLMEYEN iki blok taşıyor:
//   • factSheet = buildFactSheet(factGround, ctx, lang) — TR'de EN BAŞTA gelir;
//     "BİLİNEN/BİLİNMEYEN" olgu sözleşmesi, HER round dolu (vision-prompt.ts:21).
//   • weaponCompDirective = buildWeaponCompDirective(killerWeapon, compArchetype,
//     loadout, lang) — killerInfo'da silah varken dolu (comp-weapon.ts:117,125).
// Sapma OLMAYANLAR (yanlış alarm üretmesin diye ölçüldü): mapUnknown/locUnknown
// direktifleri bu korpusun TAMAMINDA boş çıkar (her senaryonun haritası + ölüm
// yeri var); confidence direktifi eval'de system prefix'inde (buildPolicyBlock
// varsayılanı confidenceInPrefix!==false), prod'da user mesajında — İÇERİK aynı,
// yalnız KONUM farklı.
// SONUÇ: eval modeli prod'dan DAHA AZ kısıtlar → uydurma oranı prod'dakinden
// YÜKSEK ölçülür (yanlış-kötümser, yanlış-iyimser değil).
// NEDEN KAPATILMADI: bu bloklar prompt'a eklenince ölçüm TABANI değişir ve eski
// cycle'larla A/B kıyaslanabilirlik kırılır — B83'ün tarifi dışı, bilinçli olarak
// ANA OTURUMA bırakıldı; sessizce yapılmadı.
function buildUserPrompt(s: Scenario): string {
  const b = s.body;
  const lang = langOf(s);                            // B57 (2026-07-31)
  const ctx: Record<string, unknown> = {};
  if (typeof b.round === "number") ctx.round = b.round;
  if (typeof b.score === "string") ctx.score = b.score;
  if (typeof b.result === "string") ctx.result = (b.result as string).toUpperCase();
  if (typeof b.map === "string") ctx.map = b.map;
  if (typeof b.agent === "string") ctx.agent = b.agent;
  if (typeof b.side === "string") {
    // route.ts:764-766 — side etiketi de reqLang'de.
    ctx.side = b.side === "attack"
      ? (lang === "en" ? "attack (ATTACK — you are entering the site)" : "attack (SALDIRI — sen siteye giriyorsun)")
      : b.side === "defense"
        ? (lang === "en" ? "defense (DEFENSE — you are holding the site)" : "defense (SAVUNMA — sen siteyi tutuyorsun)")
        : b.side;
  }
  if (typeof b.mode === "string") ctx.mode = b.mode;
  if (Array.isArray(b.enemyComp) && (b.enemyComp as string[]).length) ctx.enemyRoster = (b.enemyComp as string[]).slice(0, 5);
  if (b.died === true) {
    ctx.died = true;
    if (typeof b.killerInfo === "string") ctx.killerInfo = sanitizePromptInput(b.killerInfo, { max: 120, collapseWhitespace: true });
    if (typeof b.deathLocation === "string") ctx.deathLocation = sanitizePromptInput(b.deathLocation, { max: 50, collapseWhitespace: true });
    if (typeof b.deathAngle === "string") ctx.deathAngle = sanitizePromptInput(b.deathAngle, { max: 30, collapseWhitespace: true });
    // MIRROR route.ts (2026-07-09): healthAtDeath is no longer put into ctx —
    // numeric HP stays out of the prompt (classifyDeath below still gets the number).
    if (typeof b.alliesAlive === "number") ctx.alliesAlive = b.alliesAlive;
    if (typeof b.enemiesAlive === "number") ctx.enemiesAlive = b.enemiesAlive;
    if (b.spikePlanted === true) ctx.spikePlanted = true;
    if (typeof b.tradedByAlly === "boolean") ctx.tradedByAlly = b.tradedByAlly;
    if (typeof b.playerRoute === "string") {
      ctx.playerRoute = sanitizePromptInput(b.playerRoute, { max: 120, collapseWhitespace: true });
      if (b.routeConfidence) ctx.routeConfidence = b.routeConfidence;
    }
  } else if (b.died === false) {
    ctx.died = false;
  }
  if (typeof b.economyType === "string") ctx.economyType = (b.economyType as string).slice(0, 20);
  if (typeof b.credits === "number") ctx.credits = b.credits;
  if (typeof b.loadout === "string") ctx.loadout = sanitizePromptInput(b.loadout, { max: 30, collapseWhitespace: true });
  if (typeof b.playerKills === "number") ctx.playerKills = b.playerKills;
  if (typeof b.playerDeaths === "number") ctx.playerDeaths = b.playerDeaths;
  if (typeof b.playerAssists === "number") ctx.playerAssists = b.playerAssists;
  if (Array.isArray(b.killfeedOrder) && (b.killfeedOrder as string[]).length) {
    ctx.killfeedOrder = (b.killfeedOrder as string[]).slice(0, 10).map((e) => sanitizePromptInput(e, { max: 60, collapseWhitespace: true }));
  }

  const ctxJson = Object.keys(ctx).length ? JSON.stringify(ctx, null, 2) : "";
  const patternBlock = typeof b.patternContext === "string" && b.patternContext ? stripNumericHp(sanitizePromptInput(b.patternContext, { max: 2000 }) || "", lang) : "";

  // DEATH-TYPE directive — MIRROR route.ts (variety fix 2026-06-30) so the eval measures
  // the SAME pipeline the desktop hits. Without this the eval would test the OLD behavior.
  let deathTypeDirective = "";
  if (b.died === true) {
    const rh2 = b.roundHistory as Record<string, unknown>[] | undefined;
    const loc = (typeof b.deathLocation === "string" ? b.deathLocation : "").toLowerCase();
    const repeatedPosition = !!loc && Array.isArray(rh2) && rh2.some((r) =>
      r.died === true && typeof r.death_position === "string" &&
      (r.death_position as string).toLowerCase().includes(loc) &&
      (r.position_confidence === "high" || r.position_confidence === "medium"));
    const dtype = classifyDeath({
      side: b.side as string | undefined,
      killerInfo: b.killerInfo as string | undefined,
      deathLocation: b.deathLocation as string | undefined,
      deathTiming: b.deathTiming as string | undefined,
      // MIRROR route.ts stale-gate (2026-07-09): stale HP (>4s sample age) is
      // dropped as a classifier signal, exactly like the prod route.
      healthAtDeath:
        typeof b.hpSampleAgeSec !== "number" ||
        (Number.isFinite(b.hpSampleAgeSec) && (b.hpSampleAgeSec as number) >= 0 && (b.hpSampleAgeSec as number) <= 4)
          ? (b.healthAtDeath as number | undefined)
          : undefined,
      alliesAlive: b.alliesAlive as number | undefined,
      enemiesAlive: b.enemiesAlive as number | undefined,
      spikePlanted: b.spikePlanted as boolean | undefined,
      economyType: b.economyType as string | undefined,
      tradedByAlly: b.tradedByAlly as boolean | undefined,
      repeatedPosition,
    });
    // (rank-4, 2026-08-24) MIRROR route.ts cross-round ban + fallback: prev önce
    // roundHistory[].death_type'tan (route prevDeathTypes), BOŞSA matchId-anahtarlı
    // koşu-içi hafızadan — lib/match-concepts.ts'in Upstash set'inin in-memory
    // simülasyonu (eval tek süreç, ağ yok; sıralı koşu = round sırası). Sentetik
    // korpus id'leri M\d+-R desenine uymaz VE rh'de death_type yok → prev=[] =
    // eski cycle'larla bayt-aynı (A/B kıyaslanabilirlik korunur).
    const prevFromRh = (Array.isArray(rh2) ? rh2 : [])
      .map((r) => (typeof r.death_type === "string" ? r.death_type : ""))
      .filter((s): s is string => s.length > 0) as DeathType[];
    const mcKey = /^(M\d+)-R\d+/.exec(s.id)?.[1] ?? "";
    const prevTypes = prevFromRh.length > 0
      ? prevFromRh
      : mcKey ? [...(MATCH_CONCEPT_SIM.get(mcKey) ?? [])] : [];
    deathTypeDirective = buildDeathTypeDirective(dtype, prevTypes, lang);
    if (mcKey) {
      const set = MATCH_CONCEPT_SIM.get(mcKey) ?? new Set<DeathType>();
      set.add(dtype);
      MATCH_CONCEPT_SIM.set(mcKey, set);
    }
  }

  // AÇILIŞ-ROTASYONU — MIRROR route.ts (rank-3, 2026-08-24): round % 3 seed'li
  // deterministik iskelet seçimi; sadakat sözleşmesi B9 — iki dosya AYNI commit'te
  // AYNI direktifi kurar, yoksa ölçüm canlıyı yansıtmaz. died=false / round yoksa boş.
  let openerDirective = "";
  if (b.died === true && typeof b.round === "number" && Number.isFinite(b.round)) {
    const oi = ((Math.trunc(b.round as number) % 3) + 3) % 3;
    openerDirective = lang === "en"
      ? `\n[OPENER] This round open deathAnalysis with: ${["(a) the most critical ROOT cause", "(b) the lesson as an imperative, with its own verb", "(c) what the enemy did — make the ENEMY the subject"][oi]}. The [DEATH-TYPE HINT] picks the lesson; this line only picks the opener.`
      : `\n[AÇILIŞ] deathAnalysis açılışı bu round: ${["(a) en kritik KÖK neden", "(b) dersin EMİR hali, dersin kendi fiiliyle", "(c) düşmanın yaptığı — öznen RAKİP olsun"][oi]}. [ÖLÜM-TİPİ İPUCU] dersi seçer; bu satır yalnız açılışı seçer.`;
  }

  // B57 (2026-07-31): dil direktifi — route.ts:1013-1014. EN'de EN BAŞA gelir
  // (route.ts:1048-1049: "model önce dili görsün"); TR'de boş → bayt-aynı.
  const langDirective = lang === "en"
    ? `\n[LANGUAGE] The player's language is ENGLISH. Write deathAnalysis, enemyAnalysis and nextRoundSuggestion ONLY in natural English coach language (keep universal game terms: peek, trade, smoke, eco...). The knowledge blocks and some context/instruction lines are in Turkish — use them as source FACTS and LESSONS but always RESTATE them in English. NEVER copy a Turkish sentence or word into your output.`
    : "";

  let prompt = (lang === "en" ? USER_PROMPT_EN : USER_PROMPT) +
    langDirective +
    deathTypeDirective +
    openerDirective + // AÇILIŞ BİÇİMİ — route ile aynı rotasyon (rank-3, per-round)
    (ctxJson
      ? (lang === "en"
          ? `\n\n[ROUND CONTEXT — OCR pixel truth, more reliable than the screenshot]\n${ctxJson}`
          : `\n\n[ROUND CONTEXT — OCR pixel truth, screenshot'tan güvenilir]\n${ctxJson}`)
      : "") +
    (patternBlock
      ? (lang === "en"
          ? `\n\n[PATTERN — recurring mistake across recent rounds. If present, reference it like a coach inside deathAnalysis or nextRoundSuggestion — do not open an extra field]\n${patternBlock}`
          : `\n\n[PATTERN — son round'lardaki tekrar eden hata. Bu varsa deathAnalysis veya nextRoundSuggestion'da koç gibi referans ver — extra alan açma]\n${patternBlock}`)
      : "");

  // GECMIS BLOGU: route ile AYNI fonksiyon (lib/history-block.ts). Eskiden burada
  // EKSIK bir kopya vardi (yalniz patternNote) → eval, canlida modelin gordugu
  // posNote/deathZoneNote kanitini hic gostermiyordu ve olcum canliyi yansitmiyordu.
  prompt += buildHistoryBlock(
    b.roundHistory as RoundHistoryEntry[] | undefined,
    lang,
  );
  // Sandviç tekniği (route.ts:1085-1087): EN'de üretimden hemen önceki SON
  // satır dil emri olsun. TR'de eklenmez → bayt-aynı.
  if (lang === "en") {
    prompt += `\n\n[REMINDER] Output language: ENGLISH ONLY. All three fields in natural English coach voice — never a Turkish word.`;
  }
  return prompt;
}

// ── OpenAI call (route 1002-1064) ──
// B57 (2026-07-31): şema da dile bağlı — route.ts:1140 buildRoundFeedbackSchema(reqLang).
// json_schema description'ları üretimden hemen önceki EN GÜÇLÜ sinyal (vision-prompt.ts:108-113),
// EN aynası TR şemayla koşarsa ölçüm prod'u yansıtmaz.
async function callModel(systemMessage: string, userPrompt: string, lang: "tr" | "en" = "tr"): Promise<unknown> {
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "gpt-5-mini",
      // EVAL_MAX_TOKENS / EVAL_EFFORT (KB 10h nöbeti 2026-07-25): canlı route'un
      // değerleri VARSAYILAN (minimal / 350) — sadakat korunur. Env ile
      // değiştirilebilir ki "reasoning_effort kaliteyi ne kadar taşıyor?" sorusu
      // KB değişikliğinden AYRI bir değişken olarak ölçülebilsin (route.ts:1057'deki
      // "kalite düşerse low/medium'a çıkar" notunun ampirik sınaması).
      max_completion_tokens: Number(process.env.EVAL_MAX_TOKENS || 350),
      response_format: { type: "json_schema", json_schema: buildRoundFeedbackSchema(lang) },
      reasoning_effort: (process.env.EVAL_EFFORT || "minimal") as "minimal" | "low" | "medium" | "high",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "unreadable");
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return { parsed: JSON.parse(text), usage: data?.usage };
}

/* ── post-process — PROD ZİNCİRİNİN BİREBİR AYNISI (route.ts:1336-1389) ──────
 * B9 (2026-07-31): bu fonksiyon prod'dan DRIFT etmişti ve dosyanın başındaki
 * "applies the SAME post-processing the route does" iddiası SAHTE GÜVEN
 * üretiyordu. Kapatılan 5 sapma:
 *   (1) realityCheck'e kind/lang/map GEÇİRİLMİYORDU → map olmadan
 *       stripForeignCallouts (reality-checker.ts:1081) HİÇ tetiklenmiyordu.
 *       Yani 2026-07-24'te gerçek ölüm yerini silen ("a hail") feedback-çöküşü
 *       regresyonunu bu eval YAKALAYAMAZDI. kind eksikliği ayrıca
 *       suggestion-fallback davranışını prod'dan farklı kılıyordu.
 *   (2) factGround ELDE kuruluyordu ve route'un buildFactGround'undaki
 *       `deathLocation` (ham konum dizesi) alanı YOKTU → masaüstünün ölçtüğü
 *       konumun strip-muafiyeti eval'de çalışmıyordu; killerAgent/hasWeapon/
 *       hasDeathAngle de eksikti.
 *   (3) .slice(0, 350) KARAKTER kesiyordu; prod clampWords(…, 350) ile kelime
 *       sınırında kesiyor (route.ts:1370).
 *   (4) empty-guard'lar yoktu: cleanCoachText bir metni tamamen boşaltırsa
 *       (yalnız HP etiketinden ibaret cümle) prod orijinali koruyor, eval boş
 *       string ölçüyordu.
 *   (5) enemyAnalysis reality-check'ten HİÇ geçmiyordu (route.ts:1377-1381).
 * Zincir SIRASI da prod ile aynı: realityCheck → cleanCoachText →
 * enforceAgentKit → clampWords. */
function postProcess(s: Scenario, fb: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }) {
  const b = s.body;
  const lang = langOf(s);
  const map = typeof b.map === "string" ? (b.map as string) : undefined;
  const agent = typeof b.agent === "string" ? (b.agent as string) : undefined;

  const rh = (b.roundHistory as Record<string, unknown>[] | undefined) || [];
  const memoryForCheck = rh.map((r) => ({
    round_index: r.round_index as number, died: !!r.died,
    death_position: r.death_position as string | null | undefined,
    position_confidence: r.position_confidence as string | undefined,
  }));

  // factGround: route.ts:894-897 ile AYNI fonksiyon. ctx alanları buildUserPrompt
  // ile aynı sanitize + aynı died-koşulu altında kurulur (buildFactGround yalnız
  // ctx.deathLocation / ctx.deathAngle / ctx.playerRoute okur).
  //
  // B83 DOĞRULAMASI (2026-07-31): 1. dalgada reality-checker'a eklenen YENİ
  // FactGround alanları — killerAgent (katil-tutarlılığı guard'ı, reality-checker.ts:
  // 673-697) ve hasEnemyUtil (düşman-util guard'ı, :854) — burada AYRICA KURULMAZ:
  // buildFactGround onları killerInfo'dan (extractKillerAgent) ve sabit sözleşmeden
  // kendisi türetir, yani her iki yeni guard eval'de ZATEN çalışıyor. Elle kurulan
  // eski nesne B9'da kaldırıldığı için alan-sızması yapısal olarak imkânsız; tip
  // her zaman tam uyumlu ve reality-checker'a yeni alan eklendiğinde eval onu
  // kendiliğinden ölçer. BURAYA ELLE ALAN EKLEME — sapma tam oradan doğar.
  const ctxForFacts: Record<string, unknown> = {};
  if (b.died === true) {
    if (typeof b.deathLocation === "string") ctxForFacts.deathLocation = sanitizePromptInput(b.deathLocation, { max: 50, collapseWhitespace: true });
    if (typeof b.deathAngle === "string") ctxForFacts.deathAngle = sanitizePromptInput(b.deathAngle, { max: 30, collapseWhitespace: true });
    if (typeof b.playerRoute === "string") ctxForFacts.playerRoute = sanitizePromptInput(b.playerRoute, { max: 120, collapseWhitespace: true });
  }
  const factGround = buildFactGround(b as Record<string, unknown>, ctxForFacts);

  const ca = realityCheck(fb.deathAnalysis, memoryForCheck, factGround, "death", lang, map);
  const cs = realityCheck(fb.nextRoundSuggestion, memoryForCheck, factGround, "suggestion", lang, map);

  // deathAnalysis — route.ts:1369-1373 (clean ÖNCE, empty-guard, sonra clamp).
  const cleanedAnalysis = cleanCoachText(ca.text, lang);
  const deathAnalysisOut = clampWords(
    enforceAgentKit(cleanedAnalysis && cleanedAnalysis.trim() ? cleanedAnalysis : ca.text, agent),
    350,
  );
  // enemyAnalysis — route.ts:1377-1381: dizinin HER elemanı da reality-check'ten geçer.
  const enemyAnalysisOut = (fb.enemyAnalysis || []).slice(0, 2).map((x) => {
    const c = realityCheck(String(x), memoryForCheck, factGround, "suggestion", lang, map);
    const safe = c.text && c.text.trim() ? c.text : String(x);
    return clampWords(enforceAgentKit(cleanCoachText(safe, lang), agent), 180);
  });
  // nextRoundSuggestion — route.ts:1386-1389: "suggestion" kind'ı boş döndürürse
  // modelin ORİJİNAL tavsiyesi korunur (S9-sınıfı stub regresyonu).
  const safeSuggestion = cs.text && cs.text.trim() ? cs.text : fb.nextRoundSuggestion;
  const nextRoundOut = clampWords(enforceAgentKit(cleanCoachText(safeSuggestion, lang), agent), 350);

  return {
    deathAnalysis: deathAnalysisOut,
    enemyAnalysis: enemyAnalysisOut,
    nextRoundSuggestion: nextRoundOut,
    realityModified: ca.modified || cs.modified,
    rewriteLevels: { death: ca.rewriteLevel, suggestion: cs.rewriteLevel },
  };
}

async function main() {
  const results: unknown[] = [];
  // EVAL_ONLY=S1,S9 → sadece bu id-prefix'leri çalıştır (grounding izi için odak).
  const only = process.env.EVAL_ONLY ? process.env.EVAL_ONLY.split(",").map((x) => x.trim()) : null;
  // rank-1 (2026-08-24): korpus seçimi tek noktadan — EVAL_CORPUS tanımsızsa
  // loadScenarios() SCENARIOS'un kendisini döndürür (davranış bayt-aynı).
  const corpus = loadScenarios();
  let list = only ? corpus.filter((s) => only.some((o) => s.id.startsWith(o))) : corpus;
  // B57 (2026-07-31): EVAL_LANG=tr|en → yalnız o dilin senaryoları. Tanımsızsa
  // hepsi (TR korpus + EN aynaları). TR-only koşu eski cycle'larla birebir
  // karşılaştırılabilir kalsın diye var.
  const langFilter = process.env.EVAL_LANG === "tr" || process.env.EVAL_LANG === "en" ? process.env.EVAL_LANG : null;
  if (langFilter) list = list.filter((s) => langOf(s) === langFilter);
  console.log(`\n══════ EMPIRICAL EVAL — Cycle ${CYCLE} — ${list.length} scenarios${langFilter ? ` (lang=${langFilter})` : ""} ══════\n`);
  for (const s of list) {
    process.stdout.write(`[${s.id}] generating... `);
    try {
      const sm = buildSystemMessage(s) as unknown as { msg: string; confidence: string; kb: { files: string[] } };
      const up = buildUserPrompt(s);
      const { parsed, usage } = (await callModel(sm.msg, up, langOf(s))) as { parsed: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }; usage: unknown };
      const final = postProcess(s, parsed);
      console.log(`done (lang=${langOf(s)}, conf=${sm.confidence}, kb=[${sm.kb.files.join(", ")}], reality=${final.realityModified ? "MOD" : "ok"})`);
      results.push({
        // B57: lang örnek dosyasına yazılır → eval-score EN/TR ayrıştırabilsin.
        id: s.id, note: s.note, lang: langOf(s), confidence: sm.confidence, kbFiles: sm.kb.files,
        systemPromptBytes: sm.msg.length, usage,
        raw: parsed, final,
        // EVAL_DUMP_PROMPTS=1 → grounding izi için TAM enjekte KB + OCR. Böylece
        // her çıktı cümlesi KB/OCR/model-bilgisi diye sınıflanabilir.
        ...(process.env.EVAL_DUMP_PROMPTS === "1" ? { systemMessage: sm.msg, userPrompt: up } : {}),
      });
    } catch (e) {
      console.log(`FAILED: ${(e as Error).message}`);
      results.push({ id: s.id, note: s.note, error: (e as Error).message });
    }
  }

  const outDir = path.join(process.cwd(), "scripts", "eval-out");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `cycle${CYCLE}-samples.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), "utf8");

  // Readable console dump for quick eyeball
  console.log(`\n══════ FINAL COACH TEXT (post realityCheck + cleanCoachText) ══════\n`);
  for (const r of results as Record<string, unknown>[]) {
    if (r.error) { console.log(`\n### ${r.id} — ERROR: ${r.error}`); continue; }
    const f = r.final as { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string };
    console.log(`\n### ${r.id}  (conf=${r.confidence})`);
    console.log(`  deathAnalysis:      ${f.deathAnalysis}`);
    console.log(`  enemyAnalysis[0]:   ${f.enemyAnalysis[0] || "(empty)"}`);
    console.log(`  enemyAnalysis[1]:   ${f.enemyAnalysis[1] || "(empty)"}`);
    console.log(`  nextRoundSuggestion:${f.nextRoundSuggestion}`);
  }
  console.log(`\n✅ wrote ${outFile}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
