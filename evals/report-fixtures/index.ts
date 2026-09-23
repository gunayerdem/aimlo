// --------------------------------------------------------------------------
// MAÇ RAPORU EVAL FIXTURE'LARI — OLCUM-ARACI-11 (B05, 2026-09-24)
// --------------------------------------------------------------------------
// NEDEN: eski scripts/eval-report.ts senaryoları elle yazılmış bir userPrompt
// taşıyordu ("R1 loss @ B Main (killed by jett operator) | ..." + tek satır
// MATCH INSIGHTS). Prod ise kullanıcı prompt'unu round verisinden KENDİSİ kurar
// (roundSummary, computeMatchInsights, analyzeRoundPatterns, PLAYER SCORES,
// IMPROVEMENT FOCUS, confidence). Eval bu dönüşümü hiç koşmadığı için validate /
// unknown-round çözümleme / deterministik fallback / prompt formatı ölçüme
// girmiyordu.
//
// BİÇİM: her dosya { id, note, memoryContext, body }. `body` desktop'un
// /api/ai/match-report'a attığı DÜZ gövde şeklindedir (aimlo-desktop
// ai_client.rs send_match_report: rounds[] {round, result, died, deathLocation,
// killerInfo ("killed by X with Y"), deathAnalysis, enemyAnalysis,
// nextRoundSuggestion} + map/agent/rank/mode/side/enemyComp/lang) ve
// lib/report-prompt.ts validateRequest'ten GEÇER (test-eval-fidelity kilitler).
// Eski senaryonun içeriği korunarak dönüştürüldü (3 TR + 4 EN; aynı round'lar,
// konumlar, katiller, analiz cümleleri, skor, kadro). Bilinçli sapmalar:
//   • Skor üst-seviye "11-13" dizesiyle verilir (validateRequest biçim 2) —
//     senaryolar maçın yalnız 8 round'unu taşıyor; round-başı kümülatif skor
//     uydurmamak için round'lara skor yazılmadı.
//   • "(entry)", "(clutch 1v2)", "eco", "(retake, spike planted)" gibi eski
//     parantez notları `yourNote` alanına taşındı (prompt'ta <user_note>).
//   • teamComp korunur (desktop göndermiyor ama web gövdesi gönderebilir;
//     eski senaryo içeriğinin parçası).
//   • Eski elle yazılmış "MATCH INSIGHTS/AGGREGATED" satırları ve elle verilen
//     `confidence` KALDIRILDI — artık prod motorları round'lardan hesaplıyor.
//   • memoryContext: route'ta lib/player-memory'den gelir; eski senaryolarda
//     yoktu → "" (buildReportPrompts'a aynen verilir).
// Yeni fixture eklemek için bu klasöre JSON koymak yeter (otomatik yüklenir).
// --------------------------------------------------------------------------
import * as fs from "fs";
import * as path from "path";

export type ReportFixture = {
  id: string;
  note: string;
  /** buildReportPrompts'a verilen oyuncu-hafızası bloğu ("" = yok). */
  memoryContext: string;
  /** /api/ai/match-report gövdesi (validateRequest girdisi). */
  body: Record<string, unknown>;
};

const DIR = path.join(__dirname);

function load(): ReportFixture[] {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
  const out = files.map((f) => {
    const fx = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as ReportFixture;
    if (!fx || typeof fx.id !== "string" || !fx.body || typeof fx.body !== "object") {
      throw new Error(`report fixture biçimi bozuk: ${f}`);
    }
    if (`${fx.id}.json` !== f) throw new Error(`report fixture id/dosya adı uyuşmuyor: ${f} ↔ ${fx.id}`);
    return { ...fx, memoryContext: typeof fx.memoryContext === "string" ? fx.memoryContext : "" };
  });
  // Eski koşu sırası: önce TR (R*), sonra EN (ER*).
  return out.sort((a, b) =>
    a.body.lang === b.body.lang ? a.id.localeCompare(b.id) : a.body.lang === "en" ? 1 : -1,
  );
}

export const REPORT_FIXTURES: ReportFixture[] = load();
