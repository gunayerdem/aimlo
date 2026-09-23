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
// BİÇİM: her dosya { id, note, memoryContext, body }. `body` validateRequest'ten
// GEÇEN bir ReportRequest'tir (test-eval-fidelity kilitler). İki grup var:
//
// (A) R4 / ER5 — MASAÜSTÜ DÜZ GÖVDESİ BİREBİR (B05 inceleme, 2026-09-24):
//     aimlo-desktop ai_client.rs send_match_report'un attığı şekil —
//     rounds[] {round, score ("l - r" round başı kümülatif), result, died,
//     deathAnalysis, enemyAnalysis, nextRoundSuggestion, deathLocation?,
//     killerInfo?} + maxTokens/lang/map/agent/mode/side/enemyComp; ÜST-SEVİYE
//     score YOK (masaüstü göndermez) → skor round'lardan seçilir (A058 yolu,
//     lib/report-score.ts). Kaynak: gerçek maç (aimlo-runtime 01.txt 7df93d52),
//     survived round'lar dahil tam liste; ER5 aynı maçın EN çevirisi.
//
// (B) R1-R3 / ER1-ER4 — eski elle yazılmış senaryoların ReportRequest karşılığı
//     (3 TR + 4 EN; aynı round'lar, konumlar, katiller, analiz cümleleri, skor,
//     kadro). Masaüstü gövdesinden BİLİNÇLİ SAPMALAR (bu fixture'lar masaüstü
//     şekli DEĞİLDİR):
//   • Skor üst-seviye dizeyle verilir ("11-13", "13-8" …; validateRequest biçim 2 —
//     web şekli, masaüstü göndermez) → A058 round-skoru yolu bu fixture'larda KOŞMAZ.
//   • Her senaryo maçın yalnız 8 round'unu taşıyor (masaüstü survived dahil bütün
//     round'ları gönderir); round-başı kümülatif skor uydurmamak için round'lara
//     skor yazılmadı → deterministik özet "8 round" ile ör. "Skor 11-13"ü yan
//     yana taşır.
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
