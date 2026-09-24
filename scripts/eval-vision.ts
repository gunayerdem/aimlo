/**
 * EMPIRICAL COACH-VOICE EVAL HARNESS — KB brutal-audit Cycle 3 (2026-06-26)
 * ─────────────────────────────────────────────────────────────────────────
 * Runs the vision-route prompt pipeline OFFLINE and generates real gpt-5-mini
 * coach feedback for a battery of realistic round scenarios, then applies the
 * SAME post-processing the route does (lib/vision-postprocess.ts).
 *
 * WHY: the KB-audit run must be EMPIRICALLY verified — not reasoned about. This
 * produces the actual text a user would see so the language-editor / ai-prompt-
 * expert agents can brutally grade it and the next fix cycle targets REAL defects.
 *
 * ⚠ SADAKAT SÖZLEŞMESİ (B06, 2026-09-24 — OLCUM-ARACI-01/02/03/04/05/07,
 * TR-KALAN-18/19, CANLI-TEST-10): bu dosya ARTIK HİÇBİR prompt parçasını
 * KOPYALAMAZ. Route'un çağırdığı AYNI fonksiyonlar kullanılır:
 *   buildVisionSystemMessage  (lib/vision-prompt-builder) — policy + tüm KB blokları
 *                             (static/scenario/profile/profile2/agent/abilityHint/
 *                             map/contextual + karşı-ajan) + hafıza (pattern: kullanıcı mesajında, FB03 F46a)
 *   buildVisionUserMessage    (lib/vision-prompt-builder) — ctx + factGround +
 *                             factSheet + tüm direktifler + geçmiş bloğu
 *                             (ölüm-tipi sinyalleri lib/death-type computeDeathSignals)
 *   buildVisionRequestBody    (lib/vision-prompt-builder) — gpt-5-mini, 450 token
 *                             (masaüstünün 900'ü → tavan; EVAL_MAX_TOKENS ile
 *                             değişir), json_schema + enemyAnalysis eki, minimal
 *   toVisionFeedbackOutcome   (lib/vision-prompt-builder) — prod'un parse'ı
 *   finalizeVisionFeedback    (lib/vision-postprocess) — son-işlem zinciri,
 *                             visionPostprocessOpts + kurucunun factGround'u ile
 * Bilinçli farklar: (1) METİN-ONLY — görsel gönderilmez (imageAvailable:false,
 * OLCUM-ARACI-05 karar B): görsele dayalı [GÖRÜNTÜDEKİ YETENEK İKONLARI]
 * direktifi prompt'tan AÇIKÇA düşer ve her örneğe `scope` notu yazılır;
 * görüntü-bağımlı metrikler (görselden ult/yetenek okuma, görsel kaynaklı
 * uydurma) bu eval'in kapsamı DIŞINDADIR. (2) I/O yerine senaryo verisi:
 * oyuncu hafızası = senaryonun memoryContext'i, maç-kavram hafızası =
 * MATCH_CONCEPT_SIM. (3) Ağ katmanı: route'un 60 sn AbortController'ı ve B70
 * length-retry'ı yok — finish_reason örneğe yazılır.
 * Sıra-kilidi: scripts/test-eval-fidelity.ts [E] (her korpus senaryosunda istek
 * gövdesi kurucuyla, sistem mesajı GERÇEK route'la bayt-eşit).
 *
 * ÖLÇÜM TABANI (B06): bu değişiklikten ÖNCE koşulan cycle'lar "pre-parity"
 * tabandır (yarım prompt: senaryo başına ~82,8 KB sistem + 11 direktif eksik).
 * Onlarla elma-elma kıyas için dondurulmuş eski ayna:
 *   EVAL_LEGACY_MIRROR=1 npx tsx scripts/eval-vision.ts   (scripts/eval-vision-legacy.ts)
 *
 * RUN:  npx tsx scripts/eval-vision.ts
 *       EVAL_DRY_RUN=1 → API çağrısı YOK, anahtar okunmaz; prompt boyut/başlık dökümü
 * OUT:  scripts/eval-out/cycle<N>-samples.json  (+ console summary)
 * Anahtar: OPENAI_API_KEY env ya da .env.local — YALNIZ main() içinde okunur
 * (modülü import eden testler anahtara/ağa dokunmaz).
 */
import * as fs from "fs";
import * as path from "path";
import {
  VISION_CALL,
  DESKTOP_VISION_MAX_TOKENS,
  resolveVisionMaxTokens,
  buildVisionSystemMessage,
  buildVisionUserMessage,
  prevDeathTypesFromHistory,
  buildVisionRequestBody,
  toVisionFeedbackOutcome,
  visionPostprocessOpts,
  resolveVisionLang,
  type VisionPromptBody,
  type VisionFeedbackShape,
} from "../lib/vision-prompt-builder";
import type { FactGround } from "../lib/reality-checker";
// OLCUM-ARACI-08: son-işlem zinciri prod ile AYNI fonksiyon (elle ayna YOK).
import { finalizeVisionFeedback, visionOutputFailure } from "../lib/vision-postprocess";
// B60 (2026-08-04): EN-native korpus — aşağıda SCENARIOS'a ekleniyor.
import { EN_VISION_SCENARIOS } from "../evals/en-corpus";
import type { DeathType } from "../lib/death-type";
// B06: dondurulmuş pre-parity ayna — yalnız EVAL_LEGACY_MIRROR=1 iken kullanılır.
import * as legacy from "./eval-vision-legacy";

export const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// (rank-4, 2026-08-24) lib/match-concepts.ts Upstash listesinin koşu-içi simülasyonu:
// maç başına (id'deki M\d+ öneki) verilen death-type listesi. Route'taki fallback'in
// eval karşılığı: echo (roundHistory[].death_type) BOŞKEN ve ölüm round'unda okunur.
// Sentetik id'ler desene uymaz → boş kalır.
// (canlı-test #14) Set→Array: match-concepts SET→LIST göçünün aynası — tekrar
// sayısı artık veri (repeatCount), Set onu 1'e sabitliyordu.
export type MatchConceptSim = Map<string, DeathType[]>;
const MATCH_CONCEPT_SIM: MatchConceptSim = new Map();
const CYCLE = process.env.EVAL_CYCLE || "3";

// ── Load OPENAI_API_KEY from .env.local (tsx doesn't auto-load) — YALNIZ main() çağırır ──
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

// ── Scenario type: a realistic round the desktop would POST ──
export type Scenario = {
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

/** Senaryonun istek dili — route'un reqLang'iyle AYNI kaynak: gövdenin `lang` alanı
 *  (resolveVisionLang). W2 inceleme B06-F3: eskiden yalnız Scenario.lang okunuyordu;
 *  dili yalnız body.lang'de EN olan bir senaryo (EVAL_CORPUS_FILE) prod'da EN kurulurken
 *  eval'de TR prompt ile koşardı. Scenario.lang verilmiş ve gövdeyle ÇELİŞİYORSA senaryo
 *  tanımı hatalıdır → koşu durur (sessiz sapma yok; bugünkü korpusun hepsi tutarlı). */
export function langOf(s: Scenario): "tr" | "en" {
  const bodyLang = resolveVisionLang(s.body);
  if (s.lang !== undefined && s.lang !== bodyLang) {
    throw new Error(`senaryo ${s.id}: lang=${s.lang} ama gövde lang → ${bodyLang} (route yalnız body.lang okur)`);
  }
  return bodyLang;
}

// ── 10 scenarios — both sides, died/survived, all confidence + economy tiers,
//    trade/route fields, newer maps, pattern context, cross-match memory ──
export const SCENARIOS: Scenario[] = [
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

  // ── B06 (2026-09-24, OLCUM-ARACI-07): factGround paritesini GÖRÜNÜR kılan iki
  // senaryo. Eski eval factGround'u ham killerInfo ile kuruyor ve playerAgentKnown'u
  // hiç set etmiyordu; mevcut korpusta fark 0 çıkıyordu (tüm killer'lar sözlükte,
  // hiç Unknown ajan yok) → sapma ölçülemiyordu. Bu iki senaryo prod'un iki gerçek
  // sınıfını taşır: maç ortası agent-OCR boşluğu (canlı-test #9) ve güvenilmez
  // Region-3 okumasından gelen sözlük-dışı silah token'ı (canlı-test #8: "blade",
  // gerçek silah Judge'dı). Id'ler S1-S31 A/B kıyasını bozmaz (yeni id).
  {
    id: "S32-lotus-unknown-def-agentmiss",
    note: "Lotus / ajan OKUNAMADI ('Unknown' — maç ortası agent-OCR boş) / SAVUNMA — oyuncuya ajan yakıştırma kontrolü (canlı-test #9)",
    body: {
      round: 10, score: "4-5", result: "loss", map: "Lotus", agent: "Unknown", rank: "silver",
      side: "defense", mode: "competitive", enemyComp: ["Raze", "Omen", "Sova", "Killjoy", "Jett"],
      died: true, killerInfo: "killed by raze with vandal", deathLocation: "A Main", deathAngle: "front",
      alliesAlive: 3, enemiesAlive: 4, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 9 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 0, round_won: i % 3 === 0,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  {
    id: "S33-split-jett-atk-bladekiller",
    note: "Split / Jett / SALDIRI / katil 'killed by chamber with blade' — sözlük-dışı silah token'ı prompt'a ve factGround'a girmemeli (canlı-test #8)",
    body: {
      round: 6, score: "2-3", result: "loss", map: "Split", agent: "Jett", rank: "silver",
      side: "attack", mode: "competitive", enemyComp: ["Chamber", "Viper", "Cypher", "Skye", "Raze"],
      died: true, killerInfo: "killed by chamber with blade", deathLocation: "B Main", deathAngle: "front-right",
      alliesAlive: 4, enemiesAlive: 5, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 5 }, (_, i) => ({
        round_index: i + 1, died: i % 2 === 1, round_won: i % 2 === 0,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  /* ── MASAÜSTÜ TARAF SÖZLÜĞÜ — FB03 · F58 (2026-09-24) ─────────────────────────
   * Yukarıdaki S/E serisi side için SENTETİK "attack"/"defense" kullanıyor; masaüstü
   * ise detection.rs side_from_code ile YALNIZ "attacking"/"defending" gönderir (5 runtime
   * logunda 50 defending + 3 attacking, 0 attack/defense). Bu yüzden eval, prod'daki
   * etiket/KB side-filtresi/[SENARYO İPUCU] kırığını hiç görmüyordu. Bu iki senaryo
   * gövdeyi masaüstünün GERÇEK biçimiyle (küçük harf harita/ajan/konum, ham side)
   * taşır. */
  {
    id: "S34-ascent-sova-def-desktop-retake",
    note: "Ascent / Sova / SAVUNMA — masaüstü değeri side='defending' + spike kurulu → [RETAKE TAKTİK] işaretçisi + SAVUNMA etiketi + side filtresi (F58)",
    body: {
      round: 14, score: "7-6", result: "loss", map: "ascent", agent: "sova", rank: "silver",
      side: "defending", mode: "competitive", enemyComp: ["jett", "omen", "killjoy", "breach", "reyna"],
      died: true, killerInfo: "killed by breach with phantom", deathLocation: "b main",
      alliesAlive: 2, enemiesAlive: 3, spikePlanted: true, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 13 }, (_, i) => ({
        round_index: i + 1, died: i % 3 === 1, round_won: i % 2 === 1,
        death_detected_confidence: "observed", timestamp: i,
      })),
    },
  },
  {
    id: "S35-split-raze-atk-desktop-postplant",
    note: "Split / Raze / SALDIRI — masaüstü değeri side='attacking' + spike kurulu → [POST-PLANT TAKTİK] (\"Saldırı\" bölümleri) + SALDIRI etiketi + side filtresi (F58)",
    body: {
      round: 17, score: "9-7", result: "loss", map: "split", agent: "raze", rank: "silver",
      side: "attacking", mode: "competitive", enemyComp: ["cypher", "sage", "omen", "jett", "sova"],
      died: true, killerInfo: "killed by cypher with vandal", deathLocation: "b site",
      alliesAlive: 2, enemiesAlive: 2, spikePlanted: true, economyType: "full_buy", loadout: "vandal",
      roundHistory: Array.from({ length: 16 }, (_, i) => ({
        round_index: i + 1, died: i % 3 === 0, round_won: i % 2 === 0,
        death_detected_confidence: "observed", timestamp: i,
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
export function loadScenarios(): Scenario[] {
  // EVAL_CORPUS_FILE (2026-09-16): özel senaryo dosyası (ör. pazarlama kartı yeniden-üretimi —
  // GERÇEK pipeline'dan geçmesi şart, elle yazmak yasak). Verilmezse davranış bayt-aynı.
  if (process.env.EVAL_CORPUS_FILE) return JSON.parse(fs.readFileSync(process.env.EVAL_CORPUS_FILE, "utf8")) as Scenario[];
  if (process.env.EVAL_CORPUS !== "real") return SCENARIOS;
  const p = path.join(process.cwd(), "evals", "real-rounds-23.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as Scenario[];
}

/* ══════════════════════════════════════════════════════════════════════════
   PROMPT + İSTEK — PROD KURUCUSUNUN KENDİSİ (B06, 2026-09-24)
   ══════════════════════════════════════════════════════════════════════════
 * ESKİDEN burada route'un ELLE kopyası vardı (buildSystemMessage /
 * buildUserPrompt / ctxForFacts — "mirrors route.ts:731-996"). Ölçüm (85 korpus
 * senaryosu, GERÇEK route ↔ kopya): sistem mesajı senaryo başına ~82,8 KB eksik
 * (static/scenario/profile/profile2 + 53 ölümde [KARŞI-AJAN]), kullanıcı mesajında
 * 11 direktif yok (factSheet, silah-komp, ajan-kiti, harita-ipucu, ders-geçmişi,
 * senaryo, konum/harita/ajan-bilinmiyor, yetenek-ikonu; confidence sistem
 * öneğinde), ders tipi 7 round'da farklı (sinyal kopyası: ultReady/loadout/
 * playerAgent/seri/ağırlık yok, repeatedPosition mevcut round'u hariç tutmuyor),
 * factGround elle (ham killerInfo, playerAgentKnown yok), 350 token (prod fiilen
 * 450), çıplak şema (enemyAnalysis eki yok), çıplak JSON.parse. O kopya
 * dondurulmuş olarak scripts/eval-vision-legacy.ts'te (EVAL_LEGACY_MIRROR=1). */

/** Metin-only koşunun kapsam notu (OLCUM-ARACI-05, karar B) — her örneğe yazılır. */
export const EVAL_SCOPE_NOTE =
  "görsel yok — eval metin-only (imageAvailable:false): görsele dayalı [GÖRÜNTÜDEKİ YETENEK İKONLARI] " +
  "direktifi prompt'tan AÇIKÇA düşer; görüntü-bağımlı metrikler (görselden ult/yetenek okuma, görsel " +
  "kaynaklı uydurma) kapsam dışı. Prod'da ölüm round'unda görsel HER ZAMAN ekli (imageAvailable:true).";

/** Varsayılan: masaüstünün gönderdiği 900 → route tavanı 450 (prod'un FİİLÎ değeri). */
export function evalMaxTokens(): number {
  return process.env.EVAL_MAX_TOKENS
    ? Number(process.env.EVAL_MAX_TOKENS)
    : resolveVisionMaxTokens(DESKTOP_VISION_MAX_TOKENS);
}

export type EvalRequest = {
  lang: "tr" | "en";
  confidence: string;
  /** Prompt'a GERÇEKTEN giren KB dosyaları (TR-KALAN-19: eskiden yüklenmeyen blokların dosyaları da yazılıyordu). */
  kbFiles: string[];
  systemMessage: string;
  userPrompt: string;
  /** OpenAI'a giden gövdenin tamamı (route ile aynı alan sırası). */
  requestBody: ReturnType<typeof buildVisionRequestBody>;
  /** Kurucunun factGround'u — son-işleme AYNEN geçer (OLCUM-ARACI-07). */
  factGround: FactGround;
  deathType: DeathType | null;
  prevTypes: DeathType[];
};

/**
 * Senaryonun OpenAI isteğini PROD kurucusuyla kurar. Ağ yok, anahtar yok.
 * `sim` (maç-kavram hafızası) burada yalnız OKUNUR; yazım recordEvalConcept'te.
 */
export function buildEvalRequest(s: Scenario, sim: MatchConceptSim = MATCH_CONCEPT_SIM): EvalRequest {
  const body = s.body as VisionPromptBody;
  const lang = langOf(s);
  const sys = buildVisionSystemMessage({ body, lang, memoryContext: s.memoryContext ?? "" });
  // prev kaynağı route ile aynı: echo; echo boşken (ölüm round'u) maç-kavram hafızası.
  const echo = prevDeathTypesFromHistory(body.roundHistory);
  const mcKey = /^(M\d+)-R\d+/.exec(s.id)?.[1] ?? "";
  const prevTypes = echo.length > 0 ? echo : body.died === true && mcKey ? [...(sim.get(mcKey) ?? [])] : [];
  const user = buildVisionUserMessage({
    body,
    lang,
    prevDeathTypes: prevTypes,
    prevSource: echo.length > 0 ? "rh" : mcKey ? "sim" : "-",
    imageAvailable: false, // OLCUM-ARACI-05 karar B — metin-only (EVAL_SCOPE_NOTE)
  });
  // EVAL_MODEL (model A/B, 2026-09-16): varsayılan prod modeli — sadakat korunur.
  // EVAL_EFFORT=omit → reasoning_effort GÖNDERİLMEZ (parametreyi tanımayan adaylar
  // 400 dönmesin); EVAL_EFFORT=none → "none" değeri GÖNDERİLİR.
  const effortEnv = process.env.EVAL_EFFORT;
  const requestBody = buildVisionRequestBody({
    systemMessage: sys.systemMessage,
    // Route görselsiz round'da da içeriği blok dizisi olarak yollar — aynı biçim.
    userContent: [{ type: "text", text: user.userPrompt }],
    maxTokens: evalMaxTokens(),
    lang,
    model: process.env.EVAL_MODEL || VISION_CALL.model,
    reasoningEffort: effortEnv === "omit" ? null : effortEnv || VISION_CALL.reasoningEffort,
  });
  return {
    lang,
    confidence: sys.confidence,
    kbFiles: sys.kbFiles,
    systemMessage: sys.systemMessage,
    userPrompt: user.userPrompt,
    requestBody,
    factGround: user.factGround,
    deathType: user.deathType,
    prevTypes,
  };
}

/**
 * Route'un recordMatchConcept aynası — YALNIZ başarılı yanıttan sonra çağrılır.
 * W2 inceleme B06-F3: yazım eskiden buildEvalRequest içinde, API çağrısından ÖNCE
 * yapılıyordu → 429 / parse hatası / outputFailure olan round da maç listesine giriyor,
 * sonraki round'ların classifyDeathVaried aile-bastırması prod'da oluşamayacak bir
 * listeyle koşuyordu (repeatScore A/B'si kayar). Route (app/api/ai/vision/route.ts)
 * kavramı son-işlem + visionOutputFailure kontrolünden SONRA, deathType ve matchId
 * varken yazar; eval'de matchId karşılığı id'deki M\d+ öneki.
 */
export function recordEvalConcept(s: Scenario, deathType: DeathType | null, sim: MatchConceptSim = MATCH_CONCEPT_SIM): void {
  const mcKey = /^(M\d+)-R\d+/.exec(s.id)?.[1] ?? "";
  if (!deathType || !mcKey) return;
  // (canlı-test #14) SET→LIST aynası: tekrarlar KORUNUR (match-concepts RPUSH).
  const list = sim.get(mcKey) ?? [];
  list.push(deathType);
  sim.set(mcKey, list);
}

/** Kurucunun factGround'u ile prod son-işlem zinciri (OLCUM-ARACI-07: ctxForFacts yok). */
export function postProcess(s: Scenario, fb: VisionFeedbackShape, factGround: FactGround) {
  return finalizeVisionFeedback(fb, visionPostprocessOpts(s.body as VisionPromptBody, langOf(s), factGround));
}

/** Kullanıcı mesajındaki direktif başlıkları (dry-run dökümü için). */
function directiveHeaders(userPrompt: string): string[] {
  return [...userPrompt.matchAll(/\n\[([^\]\n]{2,60})\]/g)].map((m) => m[1].split(" — ")[0]);
}

async function main() {
  const legacyMode = process.env.EVAL_LEGACY_MIRROR === "1";
  const dryRun = process.env.EVAL_DRY_RUN === "1";
  const apiKey = dryRun ? "" : loadApiKey();
  const results: unknown[] = [];
  // EVAL_ONLY=S1,S9 → sadece bu id-prefix'leri çalıştır (grounding izi için odak).
  const only = process.env.EVAL_ONLY ? process.env.EVAL_ONLY.split(",").map((x) => x.trim()) : null;
  // rank-1 (2026-08-24): korpus seçimi tek noktadan — EVAL_CORPUS tanımsızsa
  // loadScenarios() SCENARIOS'un kendisini döndürür.
  const corpus = loadScenarios();
  let list = only ? corpus.filter((s) => only.some((o) => s.id.startsWith(o))) : corpus;
  // B57 (2026-07-31): EVAL_LANG=tr|en → yalnız o dilin senaryoları.
  const langFilter = process.env.EVAL_LANG === "tr" || process.env.EVAL_LANG === "en" ? process.env.EVAL_LANG : null;
  if (langFilter) list = list.filter((s) => langOf(s) === langFilter);
  const mode = legacyMode ? "LEGACY pre-parity ayna (eval-vision-legacy.ts)" : `prod kurucusu, metin-only, max_completion_tokens=${evalMaxTokens()}`;
  console.log(`\n══════ EMPIRICAL EVAL — Cycle ${CYCLE} — ${list.length} scenarios${langFilter ? ` (lang=${langFilter})` : ""} — ${mode}${dryRun ? " — DRY-RUN" : ""} ══════\n`);
  const legacySim = new Map<string, DeathType[]>();
  for (const s of list) {
    process.stdout.write(`[${s.id}] ${dryRun ? "dry-run" : "generating"}... `);
    try {
      if (legacyMode) {
        const sm = legacy.buildSystemMessage(s) as unknown as { msg: string; confidence: string; kb: { files: string[] } };
        const up = legacy.buildUserPrompt(s, legacySim);
        if (dryRun) { console.log(`sys=${sm.msg.length}c user=${up.length}c (legacy)`); continue; }
        const { parsed, usage } = (await legacy.callModel(apiKey, sm.msg, up, langOf(s))) as { parsed: VisionFeedbackShape; usage: unknown };
        const final = legacy.postProcess(s, parsed);
        console.log(`done (legacy, lang=${langOf(s)}, conf=${sm.confidence}, reality=${final.realityModified ? "MOD" : "ok"})`);
        results.push({
          id: s.id, note: s.note, lang: langOf(s), mirror: "legacy-pre-parity", confidence: sm.confidence, kbFiles: sm.kb.files,
          systemPromptBytes: sm.msg.length, usage, raw: parsed, final,
          ...(process.env.EVAL_DUMP_PROMPTS === "1" ? { systemMessage: sm.msg, userPrompt: up } : {}),
        });
        continue;
      }
      const req = buildEvalRequest(s);
      if (dryRun) {
        console.log(`sys=${Buffer.byteLength(req.systemMessage, "utf8")}B user=${Buffer.byteLength(req.userPrompt, "utf8")}B max=${req.requestBody.max_completion_tokens} dtype=${req.deathType ?? "-"} [${directiveHeaders(req.userPrompt).join(" | ")}]`);
        recordEvalConcept(s, req.deathType); // dry-run her round'u başarılı varsayar (önizleme = başarılı koşunun aynası)
        continue;
      }
      const res = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(req.requestBody),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "unreadable");
        throw new Error(`OpenAI ${res.status}: ${t.slice(0, 300)}`);
      }
      const data = await res.json();
      const text: string = data?.choices?.[0]?.message?.content || "";
      const finishReason: string = data?.choices?.[0]?.finish_reason ?? "unknown";
      const base = {
        id: s.id, note: s.note, lang: req.lang, mirror: "prod-parity", imageAvailable: false, scope: EVAL_SCOPE_NOTE,
        confidence: req.confidence, kbFiles: req.kbFiles, systemPromptBytes: req.systemMessage.length,
        userPromptBytes: req.userPrompt.length, maxCompletionTokens: req.requestBody.max_completion_tokens,
        finish_reason: finishReason, deathType: req.deathType, usage: data?.usage,
        ...(process.env.EVAL_DUMP_PROMPTS === "1" ? { systemMessage: req.systemMessage, userPrompt: req.userPrompt } : {}),
      };
      // Prod'un parse'ı (extractJSON + coercion + şekil). Başarısızlık prod'da 502 yapısal
      // hata olurdu → örnek HATA olarak kaydedilir (uydurma yok).
      const outcome = toVisionFeedbackOutcome(text);
      if (!outcome.ok) {
        console.log(`FAILED (${outcome.code}, finish=${finishReason})`);
        results.push({ ...base, error: `${outcome.code}: ${outcome.message}`, rawPreview: outcome.preview });
        continue;
      }
      const raw = JSON.parse(JSON.stringify(outcome.obj)) as VisionFeedbackShape;
      const final = postProcess(s, outcome.obj as VisionFeedbackShape, req.factGround);
      // Süzgeç deathAnalysis'i boşalttıysa prod YAPISAL HATA döner (CANLI-TEST-07) — kaydedilir.
      const outputFailure = visionOutputFailure(final);
      // Route aynası: kavram YALNIZ kullanıcıya ders gittiyse (yapısal hata yoksa) yazılır.
      if (!outputFailure) recordEvalConcept(s, req.deathType);
      console.log(`done (lang=${req.lang}, conf=${req.confidence}, finish=${finishReason}, dtype=${req.deathType ?? "-"}, reality=${final.realityModified ? "MOD" : "ok"}${outputFailure ? `, OUTPUT-FAIL=${outputFailure.detail.reason}` : ""})`);
      results.push({ ...base, raw, final, ...(outputFailure ? { outputFailure: outputFailure.detail } : {}) });
    } catch (e) {
      console.log(`FAILED: ${(e as Error).message}`);
      results.push({ id: s.id, note: s.note, error: (e as Error).message });
    }
  }
  if (dryRun) { console.log(`\n(dry-run) API çağrısı yok, örnek dosyası yazılmadı.\n`); return; }

  const outDir = path.join(process.cwd(), "scripts", "eval-out");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `cycle${CYCLE}-samples.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), "utf8");

  // Readable console dump for quick eyeball
  console.log(`\n══════ FINAL COACH TEXT (post realityCheck + cleanCoachText) ══════\n`);
  for (const r of results as Record<string, unknown>[]) {
    if (r.error) { console.log(`\n### ${r.id} — ERROR: ${r.error}`); continue; }
    const f = r.final as { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string };
    console.log(`\n### ${r.id}  (conf=${r.confidence}${r.finish_reason ? `, finish=${r.finish_reason}` : ""})`);
    console.log(`  deathAnalysis:      ${f.deathAnalysis}`);
    console.log(`  enemyAnalysis[0]:   ${f.enemyAnalysis[0] || "(empty)"}`);
    console.log(`  enemyAnalysis[1]:   ${f.enemyAnalysis[1] || "(empty)"}`);
    console.log(`  nextRoundSuggestion:${f.nextRoundSuggestion}`);
  }
  const rs = results as Record<string, unknown>[];
  const fin: Record<string, number> = {};
  for (const r of rs) { const k = String(r.finish_reason ?? (r.error ? "error" : "?")); fin[k] = (fin[k] || 0) + 1; }
  console.log(`\nÖZET: ${rs.filter((r) => !r.error).length}/${rs.length} örnek · finish=${JSON.stringify(fin)} · output-fail=${rs.filter((r) => r.outputFailure).length}`);
  console.log(`\n✅ wrote ${outFile}\n`);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
