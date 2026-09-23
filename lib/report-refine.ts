/**
 * RAPOR KALİTE KAPISI + ALAN REFINE'I — route + eval ORTAK (OLCUM-ARACI-14, B05)
 * ─────────────────────────────────────────────────────────────────────────────
 * NEDEN: kalite kapısı (checkOutputQuality qc < 65 → en zayıf alanı İKİNCİ bir AI
 * çağrısıyla yeniden yazdır) POST handler'ının içinde inline duruyordu; eval
 * yalnız ilk çağrıyı yapıyordu → ölçülen metin kullanıcıya giden metin
 * olmayabiliyordu, refine oranı ve refine'ın ürettiği metin hiç ölçülmüyordu.
 * Artık route ve scripts/eval-report.ts AYNI fonksiyonu çağırır; model çağrısı
 * enjekte edilir (`callModel`) — route gerçek OpenAI fetch'ini (10 sn timeout +
 * maliyet kaydı), eval kendi anahtarıyla aynı gövdeyi, testler sahte yanıtı verir.
 *
 * TAŞIMA BAYT-AYNI: kapı koşulu, refine prompt'u, istek gövdesi (model /
 * max_completion_tokens 500 / reasoning_effort / messages sırası), finish_reason
 * kapısı ve temizleyici (buildReportCleaner, cap 600, fallback = mevcut metin)
 * route.ts'ten kesilip taşındı. `callModel` null → kapı yine ölçülür/loglanır
 * ama çağrı yapılmaz (eski `apiKey` koşulunun karşılığı).
 */
import { checkOutputQuality, scoreFields } from "@/evals/generic-detector";
import { buildReportCleaner, type ReportRequest, type ReportResponse } from "@/lib/report-prompt";
// Model id + reasoning_effort TEK KAYNAK (B07 · OLCUM-ARACI-17).
import { AI_MODEL, AI_REASONING_EFFORT } from "@/lib/ai-model";

/** Refine eşiği: qc.score bunun ALTINDAYSA en zayıf alan yeniden yazdırılır. */
export const REPORT_REFINE_QC_THRESHOLD = 65;

/**
 * Refine çağrısının parametreleri — TEK KAYNAK.
 * 300 → 500 (2026-07-09): gpt-5-mini'de reasoning token'ları da bu
 * bütçeden düşer; 300'de refine finish=length ile kelime ortasında
 * kesiliyordu (canlı kanıt: summary "...rotasy" / 672 bayt).
 */
export const REFINE_CALL = {
  model: AI_MODEL,
  maxCompletionTokens: 500,
  reasoningEffort: AI_REASONING_EFFORT,
} as const;

/**
 * Canlı-test #8 (2026-08-03): eski sistem mesajı da "her cümlede
 * pozisyon + düşman ZORUNLU" diyerek — veri verilmeden — uydurmayı
 * dayatıyordu. Artık olgu-bağlılık birinci kural.
 */
export const REFINE_SYSTEM_PROMPT = "Radiant Valorant koçu. YALNIZ sana verilen olgulara dayanırsın; verilmeyen ajan, konum veya olayı ASLA uydurmazsın. Her cümlede somut aksiyon olsun.";

/** OpenAI chat/completions refine gövdesi (alan sırası eski route gövdesiyle aynı). */
export function buildRefineRequestBody(refinePrompt: string) {
  return {
    model: REFINE_CALL.model,
    max_completion_tokens: REFINE_CALL.maxCompletionTokens,
    reasoning_effort: REFINE_CALL.reasoningEffort,
    messages: [
      { role: "system", content: REFINE_SYSTEM_PROMPT },
      { role: "user", content: refinePrompt },
    ],
  };
}

export type RefineRequestBody = ReturnType<typeof buildRefineRequestBody>;
/** Model yanıtı: HTTP başarısızsa null; aksi hâlde ham içerik + finish_reason. */
export type RefineModelResult = { content: unknown; finishReason: unknown } | null;
export type RefineCallModel = (requestBody: RefineRequestBody) => Promise<RefineModelResult>;

export type RefineOutcome = {
  qcScore: number;
  weakest: string | null;
  /** Kapı açıldı ve model çağrıldı mı? */
  attempted: boolean;
  /** Zayıf alan refine metniyle DEĞİŞTİRİLDİ mi? */
  refined: boolean;
  finishReason?: string;
};

/**
 * Kalite kapısı: rapor alanlarını puanlar; qc < 65 ve en zayıf alan metinse
 * `callModel` ile yeniden yazdırır. finish_reason "stop" değilse (yarım metin)
 * REDDEDER — mevcut metin kalır. Kabul edilen metin ana alanlarla AYNI
 * temizleyiciden geçer (realityCheck dahil; canlı-test #8). `report` YERİNDE
 * güncellenir (eski davranış). Model hatası/istisna → orijinal kalır.
 */
export async function maybeRefineReport(
  report: ReportResponse,
  body: ReportRequest,
  callModel: RefineCallModel | null,
): Promise<RefineOutcome> {
  const qc = checkOutputQuality({
    summary: typeof report.summary === "string" ? report.summary : undefined,
    mistake: typeof report.mistake === "string" ? report.mistake : undefined,
  });
  const fs = scoreFields({
    summary: typeof report.summary === "string" ? report.summary : undefined,
    mistake: typeof report.mistake === "string" ? report.mistake : undefined,
    adjustment: typeof report.adjustment === "string" ? report.adjustment : undefined,
  });
  console.log(`[Aimlo AI] Report quality: ${qc.score}/100${fs.weakest ? ` (weakest: ${fs.weakest})` : ""}`);

  const outcome: RefineOutcome = { qcScore: qc.score, weakest: fs.weakest, attempted: false, refined: false };

  // Field-level refinement if quality is low
  if (qc.score < REPORT_REFINE_QC_THRESHOLD && fs.weakest && callModel && typeof (report as Record<string, unknown>)[fs.weakest] === "string") {
    const weakText = (report as Record<string, unknown>)[fs.weakest] as string;
    const fieldMap: Record<string, string> = { summary: "maç özeti", mistake: "ana hata analizi", adjustment: "düzeltme önerisi" };
    // ── 🔴 OLGU-BAĞLI REFINE (canlı-test #8, 2026-08-03) ────────────────
    // ESKİ PROMPT UYDURMAYI EMREDİYORDU: refine çağrısına harita, düşman kadrosu,
    // round verisi ve ölüm konumları HİÇ gönderilmiyordu; buna rağmen "Pozisyon
    // ismi ZORUNLU (A Short, B Main, Mid vb.)" + "Düşman davranışı ZORUNLU"
    // deniyordu. Veri elinden alınmış model zorunluluğu doldurmak için (a)
    // prompt'un KENDİ ÖRNEĞİNİ birebir kopyaladı (Icebox maçında "A Short" —
    // Icebox'ta böyle bir callout YOK), (b) kadro bilgisi olmadığı için düşmanları
    // uydurdu ("Sova pikiyle", "Reyna push yaptı" — kadro chamber/raze/phoenix).
    // FIX: gerçek olgular prompt'a VERİLİR ve model YALNIZ onlara bağlanır;
    // örnek callout'lar SİLİNDİ (model onları kopyalıyordu). Kalite kapısının
    // amacı korunuyor: zayıf alan yine güçlendiriliyor, ama UYDURARAK değil.
    const rSetup = body.setup;
    const refineLocs = [
      ...new Set(
        body.rounds
          .map((r) => (typeof r.deathLocation === "string" ? r.deathLocation.trim() : ""))
          .filter((l) => l.length > 0),
      ),
    ].slice(0, 12);
    // unknownEnemyComp=true → kadro OKUNMADI; "bilinmiyor" demek uydurmadan iyidir.
    const refineEnemies = rSetup.unknownEnemyComp
      ? []
      : (rSetup.enemyComp || []).filter((a) => a && a !== "Unknown");
    const refineTr = body.lang !== "en";
    const refinePrompt = `Bu ${fieldMap[fs.weakest] || fs.weakest} zayıf. Yeniden yaz.

BU MAÇTA ÖLÇÜLEN OLGULAR (TEK gerçek kaynak — dışına çıkma):
- Harita: ${rSetup.map && rSetup.map !== "Unknown" ? rSetup.map : "OKUNAMADI"}
- Oyuncunun ajanı: ${rSetup.agent && rSetup.agent !== "Unknown" ? rSetup.agent : "OKUNAMADI"}
- Taraf: ${rSetup.side === "attack" ? "saldırı" : "savunma"}
- Skor: ${body.score.yours}-${body.score.enemy}
- Düşman kadrosu: ${refineEnemies.length > 0 ? refineEnemies.join(", ") : "OKUNAMADI"}
- Ölüm konumları: ${refineLocs.length > 0 ? refineLocs.join(", ") : "OKUNAMADI"}

KURALLAR:
1. YALNIZ yukarıdaki olguları kullan. Listede OLMAYAN ajan, konum, round ya da skor YAZMA — uydurma YASAK.
2. Konum: sadece "Ölüm konumları" listesindekilerden birini kullanabilirsin. Liste OKUNAMADI ise hiç yer adı yazma.
3. Düşman: sadece "Düşman kadrosu" listesindeki ajanlardan bahsedebilirsin. Liste OKUNAMADI ise ajan adı yazma, "bir düşman" de.
4. Somut aksiyon ZORUNLU — ne yapacağı net olsun.
5. "Geliştir", "dikkatli ol" gibi genel tavsiye YASAK.
${refineTr ? "Türkçe yaz." : "Write in English."}
Mevcut: "${weakText}"
Sadece düzeltilmiş metni döndür.`;

    try {
      outcome.attempted = true;
      const res = await callModel(buildRefineRequestBody(refinePrompt));
      if (res) {
        const refined = (res.content as string | null | undefined)?.trim();
        const rFinish = res.finishReason as string | undefined;
        outcome.finishReason = rFinish;
        // finish_reason kapısı (2026-07-09, canlı-kanıtlı kök fix): token
        // kapağına çarpan YARIM refine metni orijinal alanın üzerine yazılıyordu
        // ("...rakip defansif rotasy"). "stop" değilse REDDET — mevcut geçerli
        // metin kalır (no-fake ilkesi: yarım metin basmaktansa eldeki tam metin).
        if (refined && refined.length > 30 && rFinish === "stop") {
          // Cycle 2 fix #5: clean the refined field too (same coach-voice net).
          // B82 (2026-07-31): elle kurulan cleanCoachText + clampWords ikilisi
          // ortak finalizeCoachText'e geçti (aynı sıra, aynı 600 kapağı,
          // aynı word-safe kırpma).
          //
          // 🔴 CANLI-TEST #8 (2026-08-03) — KÖK FIX: burada `check` HİÇ
          // VERİLMİYORDU. Eski gerekçe ("refine, doğrulanmış alanın yeniden
          // yazımı") YANLIŞ çıktı: refine İKİNCİ bir AI çağrısıdır ve YENİ
          // metin üretir — o metin realityCheck'ten geçmediği için
          // stripForeignCallouts (Icebox'ta "A Short") ve guardUnprovenFacts
          // (kanıtsız katil/konum) hiç çalışmadı, uydurma doğrudan rapora
          // yazıldı. Artık ana alanlarla AYNI zincir uygulanıyor
          // (buildReportCleaner → aynı fg, aynı harita, aynı dil).
          // fallback=weakText: süzgeç metni boşaltırsa bu bloğun ilkesi
          // gereği ELDEKİ tam metin kalır (no-fake: uydurma metin üretilmez).
          (report as Record<string, unknown>)[fs.weakest] =
            buildReportCleaner(body)(refined, 600, weakText);
          outcome.refined = true;
          console.log(`[Aimlo AI] Report field refined: ${fs.weakest}`);
        } else if (refined && rFinish !== "stop") {
          console.warn(`[Aimlo AI] Report refine REJECTED (finish=${rFinish}) — keeping original ${fs.weakest}`);
        }
      }
    } catch { /* refinement failed — keep original */ }
  }
  return outcome;
}
