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
 * Faithfulness: imports the same shared modules the route uses —
 *   - SYSTEM_PROMPT / USER_PROMPT / ROUND_FEEDBACK_SCHEMA  (lib/vision-prompt)
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
import { SYSTEM_PROMPT, USER_PROMPT, ROUND_FEEDBACK_SCHEMA } from "../lib/vision-prompt";
import { buildPolicyBlock } from "../lib/ai-policy";
import { loadVisionKnowledge } from "../lib/knowledge-loader";
import { realityCheck } from "../lib/reality-checker";
import { cleanCoachText, stripNumericHp } from "../lib/coach-text";
import { buildAgentAbilityHint, enforceAgentKit } from "../lib/agent-abilities";
import { sanitizePromptInput } from "../lib/prompt-safety";
import { classifyDeath, buildDeathTypeDirective } from "../lib/death-type";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
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
};

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
  const confidence = deriveConfidence(b.roundHistory);
  const sections: string[] = [
    SYSTEM_PROMPT,
    buildPolicyBlock({
      confidence, tone: "strict", lang: "tr",
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
  const abilityHint = buildAgentAbilityHint(b.agent as string | undefined, "tr");
  if (abilityHint) sections.push(abilityHint);
  if (s.memoryContext) {
    const capped = s.memoryContext.trim().slice(0, 1200);
    sections.push(
      `[CROSS-MATCH GEÇMİŞİ — uzun vadeli oyuncu profili (kalıcı veriden, bu round'a ait DEĞİL)]\n` +
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

// ── ctx + user prompt assembly (route 807-996, fields-present subset) ──
function buildUserPrompt(s: Scenario): string {
  const b = s.body;
  const ctx: Record<string, unknown> = {};
  if (typeof b.round === "number") ctx.round = b.round;
  if (typeof b.score === "string") ctx.score = b.score;
  if (typeof b.result === "string") ctx.result = (b.result as string).toUpperCase();
  if (typeof b.map === "string") ctx.map = b.map;
  if (typeof b.agent === "string") ctx.agent = b.agent;
  if (typeof b.side === "string") {
    ctx.side = b.side === "attack" ? "attack (SALDIRI — sen siteye giriyorsun)"
      : b.side === "defense" ? "defense (SAVUNMA — sen siteyi tutuyorsun)" : b.side;
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
  const patternBlock = typeof b.patternContext === "string" && b.patternContext ? stripNumericHp(sanitizePromptInput(b.patternContext, { max: 2000 }) || "", "tr") : "";

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
    deathTypeDirective = buildDeathTypeDirective(dtype, []);
  }

  let prompt = USER_PROMPT +
    deathTypeDirective +
    (ctxJson ? `\n\n[ROUND CONTEXT — OCR pixel truth, screenshot'tan güvenilir]\n${ctxJson}` : "") +
    (patternBlock ? `\n\n[PATTERN — son round'lardaki tekrar eden hata. Bu varsa deathAnalysis veya nextRoundSuggestion'da koç gibi referans ver — extra alan açma]\n${patternBlock}` : "");

  const rh = b.roundHistory as Record<string, unknown>[] | undefined;
  if (rh && rh.length) {
    const lines = rh.map((r) => {
      const status = r.died ? "öldü" : "hayatta kaldı";
      const conf = r.death_detected_confidence === "observed" ? " (güven: observed)" : "";
      const pos = r.death_position ? ` @ ${r.death_position}` : "";
      return `R${r.round_index}: ${status}${conf}${pos}`;
    });
    const deaths = rh.filter((r) => r.died).length;
    const total = rh.length;
    const patternNote = deaths >= total * 0.5
      ? `Pattern: Son ${total} round'un ${deaths}'${deaths > 1 ? "inde" : "unda"} ölüm → tekrar eden sorun kanıtlanmış`
      : `Son ${total} round'da ${deaths} ölüm`;
    prompt += `\n\nSon round geçmişi (gözlemlenmiş):\n${lines.join("\n")}\n${patternNote}`;
  }
  return prompt;
}

// ── OpenAI call (route 1002-1064) ──
async function callModel(systemMessage: string, userPrompt: string): Promise<unknown> {
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
      response_format: { type: "json_schema", json_schema: ROUND_FEEDBACK_SCHEMA },
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

// ── post-process (route 1129-1154) ──
function postProcess(s: Scenario, fb: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }) {
  const rh = (s.body.roundHistory as Record<string, unknown>[] | undefined) || [];
  const memoryForCheck = rh.map((r) => ({
    round_index: r.round_index as number, died: !!r.died,
    death_position: r.death_position as string | null | undefined,
    position_confidence: r.position_confidence as string | undefined,
  }));
  const factGround = {
    hasRoute: typeof s.body.playerRoute === "string" && (s.body.playerRoute as string).length > 0,
    hasTradeData: typeof s.body.tradedByAlly === "boolean",
    // prod ile eşle (2026-06-29): killerInfo varsa hasKiller; headshot HİÇ okunmuyor → daima false.
    hasKiller: typeof s.body.killerInfo === "string" && (s.body.killerInfo as string).length > 0,
    hasDeathLocation: typeof s.body.deathLocation === "string" && (s.body.deathLocation as string).length > 0,
    hasHeadshot: false,
  };
  const ca = realityCheck(fb.deathAnalysis, memoryForCheck, factGround);
  const cs = realityCheck(fb.nextRoundSuggestion, memoryForCheck, factGround);
  const agent = s.body.agent as string | undefined;
  return {
    deathAnalysis: enforceAgentKit(cleanCoachText(ca.text, "tr"), agent).slice(0, 350),
    enemyAnalysis: (fb.enemyAnalysis || []).slice(0, 2).map((x) => enforceAgentKit(cleanCoachText(String(x), "tr"), agent).slice(0, 180)),
    nextRoundSuggestion: enforceAgentKit(cleanCoachText(cs.text, "tr"), agent).slice(0, 350),
    realityModified: ca.modified || cs.modified,
    rewriteLevels: { death: ca.rewriteLevel, suggestion: cs.rewriteLevel },
  };
}

async function main() {
  const results: unknown[] = [];
  // EVAL_ONLY=S1,S9 → sadece bu id-prefix'leri çalıştır (grounding izi için odak).
  const only = process.env.EVAL_ONLY ? process.env.EVAL_ONLY.split(",").map((x) => x.trim()) : null;
  const list = only ? SCENARIOS.filter((s) => only.some((o) => s.id.startsWith(o))) : SCENARIOS;
  console.log(`\n══════ EMPIRICAL EVAL — Cycle ${CYCLE} — ${list.length} scenarios ══════\n`);
  for (const s of list) {
    process.stdout.write(`[${s.id}] generating... `);
    try {
      const sm = buildSystemMessage(s) as unknown as { msg: string; confidence: string; kb: { files: string[] } };
      const up = buildUserPrompt(s);
      const { parsed, usage } = (await callModel(sm.msg, up)) as { parsed: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }; usage: unknown };
      const final = postProcess(s, parsed);
      console.log(`done (conf=${sm.confidence}, kb=[${sm.kb.files.join(", ")}], reality=${final.realityModified ? "MOD" : "ok"})`);
      results.push({
        id: s.id, note: s.note, confidence: sm.confidence, kbFiles: sm.kb.files,
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
