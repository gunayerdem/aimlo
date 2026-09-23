// ── VISION SON-İŞLEM ZİNCİRİ — TEK KAYNAK (OLCUM-ARACI-08, 2026-09-23) ─────────
//
// KÖK: vision route'un model-sonrası zinciri (realityCheck → cleanCoachText →
// boş-guard → enforceAgentKit → clampWords → fixCallout) DÖRT yerde elle
// kopyalanmıştı: app/api/ai/vision/route.ts:1788-1848, scripts/eval-vision.ts:
// 896-968, scripts/test-pipeline-chain.ts:60-87 ve scripts/replay-tr.ts:20-50.
// Her yeni halka yalnız bazı kopyalara ulaşıyordu: 9355dec'in eval'e eklediği
// fixCallout halkası test-pipeline-chain'de YOKTU (B10 sıra testi onu hiç
// ölçmüyordu), test-pipeline-chain'in route referansı (:1356-1389) bayattı.
// ÇÖZÜM: zincir BURADA bir kez yazılır; route, eval-vision, test-pipeline-chain ve
// replay-tr bu fonksiyonu import eder. Bir halka değişirse dördü birlikte değişir
// — ayna sapması (B9 sınıfı) yapısal olarak imkânsız.
//
// NEDEN coach-text.ts'te DEĞİL: coach-text app/page.tsx ("use client") tarafından
// da bağlanıyor; reality-checker'ı oraya statik bağlamak landing bundle'ına girme
// riski taşır (coach-text.ts başındaki not). Bu modülü yalnız sunucu route'u ve
// scriptler import eder.
//
// SAHTE ÇIKTI YOK: hiçbir koç metni ÜRETİLMEZ; yalnız süzülür/kırpılır.
import { realityCheck, type FactGround } from "@/lib/reality-checker";
import { cleanCoachText, clampWords, enforceSuppliedCallout } from "@/lib/coach-text";
import { enforceAgentKit } from "@/lib/agent-abilities";

/** Modelin (JSON-şema doğrulanmış) ham koç alanları. */
export type VisionFeedbackFields = {
  deathAnalysis: string;
  enemyAnalysis: string[];
  nextRoundSuggestion: string;
};

export type VisionPostprocessOpts = {
  /** İstek gövdesinin roundHistory'si (ham tel kaydı); realityCheck hafızasına çevrilir. */
  roundHistory?: ReadonlyArray<Record<string, unknown>> | null;
  /** buildFactGround çıktısı — prompt fact-sheet'iyle AYNI nesne (route). */
  factGround: FactGround;
  lang: "tr" | "en";
  map?: string;
  /** Oyuncunun ajanı (kit-dışı yetenek süzgeci). */
  agent?: string;
  /** Masaüstünün OCR'la ölçtüğü ham deathLocation (callout-yazım kilidi, S5). */
  suppliedLoc?: string | null;
};

export type VisionPostprocessResult = VisionFeedbackFields & {
  realityModified: boolean;
  rewriteLevels: { death: number; suggestion: number };
};

/** Tel roundHistory kaydı → realityCheck'in round hafızası (route'un memoryForCheck'i). */
export function toRoundMemory(roundHistory: ReadonlyArray<Record<string, unknown>> | null | undefined) {
  return (roundHistory || []).map((r) => ({
    round_index: r.round_index as number,
    died: !!r.died,
    death_position: r.death_position as string | null | undefined,
    position_confidence: r.position_confidence as string | undefined,
  }));
}

/**
 * Vision route'un model-sonrası son-işlem zinciri (tek kaynak).
 * Sıra: realityCheck → cleanCoachText → boş-guard → enforceAgentKit → clampWords
 * → fixCallout (enforceSuppliedCallout). Ayrıntılı gerekçeler halkaların yanında.
 */
export function finalizeVisionFeedback(
  fb: VisionFeedbackFields,
  opts: VisionPostprocessOpts,
): VisionPostprocessResult {
  const { factGround, lang, map, agent } = opts;
  const memory = toRoundMemory(opts.roundHistory);
  // Reality check against round memory (modifies text if AI claims contradict
  // observed data). factGround = route'un buildFactGround'u (Ölüm-Veri Sözleşmesi
  // 2026-06-29) — prompt fact-sheet'ini üreten AYNI nesne; guard, modele "bilinmiyor"
  // denen olguları (killer/weapon/location/headshot/alive/spike/route/trade) söker.
  // lang (denetim 2026-07-19 F5): replacement dili isteğin kendi dili. map (canlı
  // bug 2026-07-21): oynanan haritaya ait OLMAYAN callout'lar ayıklanır.
  const checkedAnalysis = realityCheck(fb.deathAnalysis, memory, factGround, "death", lang, map);
  const checkedSuggestion = realityCheck(fb.nextRoundSuggestion, memory, factGround, "suggestion", lang, map);

  // Final coach text (clean BEFORE slice — plainify/apostrophe can change length).
  // Empty-guard (security audit L1): stripNumericHp's deletion forms can empty a
  // text that was ONLY an HP label — keep the reality-checked original then
  // (mirrors the enemyAnalysis/safeSuggestion fallback pattern below).
  // Callout-yazım kilidi (canlı-test #10 kalite dalgası, S5): model verilen
  // callout'u aynı cevapta bozabiliyor (canlı kanıt: deathLocation="a lamps"
  // → çıktıda "Lambs gibi"). Verilen değerin bozuk yakın-varyantı orijinal
  // görünümle değiştirilir; dar kapsam + korumalar lib/coach-text.ts'te.
  const suppliedLoc = opts.suppliedLoc ? String(opts.suppliedLoc) : "";
  const fixCallout = (t: string) => (suppliedLoc ? enforceSuppliedCallout(t, suppliedLoc) : t);
  const cleanedAnalysis = cleanCoachText(checkedAnalysis.text, lang);
  const deathAnalysis = fixCallout(clampWords(
    enforceAgentKit(cleanedAnalysis && cleanedAnalysis.trim() ? cleanedAnalysis : checkedAnalysis.text, agent),
    350,
  ));
  // enemyAnalysis de reality-check'ten GEÇER (grounding audit 2026-06-26: bu dizi
  // önceden HİÇ denetlenmiyordu → killer/rota/sayı uydurması elenmeden çıkıyordu).
  // kind:"suggestion" → tümü stripped olursa "" döner, orijinali koru.
  // .filter (canlı-test #10, S1 dizi-kuralı): stripMetaTerms SAF-META bir
  // elemanı ("katil bilgisi X olarak kayıtta var" gibi tek-cümlelik kaynak-dili)
  // '' yapabilir — boş eleman diziden düşer, kullanıcıya boş satır gitmez.
  const enemyAnalysis = (fb.enemyAnalysis || []).slice(0, 2).map((s) => {
    const c = realityCheck(String(s), memory, factGround, "suggestion", lang, map);
    const safe = c.text && c.text.trim() ? c.text : String(s);
    return fixCallout(clampWords(enforceAgentKit(cleanCoachText(safe, lang), agent), 180));
  }).filter((s) => s && s.trim().length > 0);
  // Cycle 3: if reality-check emptied the suggestion (every sentence was an
  // unproven repetition claim → "suggestion" kind returns "" rather than a
  // past-tense death stub), keep the model's original advice — still a valid
  // actionable next-round plan. Prevents the S9-class stub regression.
  const safeSuggestion = checkedSuggestion.text && checkedSuggestion.text.trim()
    ? checkedSuggestion.text
    : fb.nextRoundSuggestion;
  const nextRoundSuggestion = fixCallout(clampWords(enforceAgentKit(cleanCoachText(safeSuggestion, lang), agent), 350));

  return {
    deathAnalysis,
    enemyAnalysis,
    nextRoundSuggestion,
    realityModified: checkedAnalysis.modified || checkedSuggestion.modified,
    rewriteLevels: { death: checkedAnalysis.rewriteLevel, suggestion: checkedSuggestion.rewriteLevel },
  };
}
