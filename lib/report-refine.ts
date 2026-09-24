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
 * FB01 (2026-09-24): refine olgu listesine round satırları + sonuç/taraf notu (F48/F03/
 * F13), kural 1 "verilmeyeni anma, eksik veriyi söyleme" (F48) ve kabul kapısına meta-dil
 * reddi (F48) eklendi — bu üçü dışında prompt/gövde/kapı aynı.
 */
import { checkOutputQuality, scoreFields } from "@/evals/generic-detector";
import {
  buildReportCleaner,
  reportOutcome,
  resolveReportSides,
  type ReportRequest,
  type ReportResponse,
} from "@/lib/report-prompt";
// Model id + reasoning_effort TEK KAYNAK (B07 · OLCUM-ARACI-17).
import { AI_MODEL, AI_REASONING_EFFORT } from "@/lib/ai-model";

/** Refine eşiği: qc.score bunun ALTINDAYSA en zayıf alan yeniden yazdırılır. */
export const REPORT_REFINE_QC_THRESHOLD = 65;

/** FB01 · F48: refine olgu listesine giren en fazla round satırı (ana prompt MAX_PROMPT_ROUNDS ile aynı). */
const REFINE_MAX_ROUND_FACTS = 30;

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

/**
 * FB01 · F48 (2026-09-24) — META-DİL KAPISI. KANIT: aimlo-runtime LOG.txt:4538 (05.08,
 * Haven) refine çıktısı prompt'un KENDİ kuralını okuyucuya anlattı: "R5 ve R10 bilgisi
 * listede yok — bunları yazamam … Eğer ölüm konumu listede yoksa konum belirtme." ve
 * kabul kapısı (yalnız uzunluk + finish_reason) bunu summary'nin yerine yazdı (:4540
 * "✅ Saved"). Eşleşirse refine REDDEDİLİR, eldeki metin kalır (kurtarma yolu = mevcut
 * metin; yeni metin üretilmez). Türkçe-\b tuzağı: sınırlar \p{L} lookaround ile.
 * Yanlış-pozitif ölçümü: scripts/test-report-outcome.ts (eval-out'taki 20 kabul edilmiş
 * refine alanı + tüm final rapor alanları → 0 eşleşme).
 */
const REFINE_META_PATTERNS: readonly RegExp[] = [
  /(?<!\p{L})listede\s+(?:yok(?:sa)?|olmayan)(?!\p{L})/iu,
  /(?<!\p{L})yazamam(?!\p{L})/iu,
  /(?<!\p{L})belirtemem(?!\p{L})/iu,
  /(?<!\p{L})not\s+in\s+the\s+(?:list|facts)(?!\p{L})/iu,
  /(?<!\p{L})isn['’]t\s+listed(?!\p{L})/iu,
  /(?<!\p{L})can(?:['’]t|not)\s+(?:write|mention)(?!\p{L})/iu,
];

/** Refine metni prompt'un iç kurallarını / eksik veriyi okuyucuya anlatıyor mu? */
export function hasRefineMetaLanguage(text: string): boolean {
  return REFINE_META_PATTERNS.some((re) => re.test(text));
}

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
  /** FB01 · F48: refine metni meta-dil kapısında reddedildi (alan değişmedi). */
  metaRejected?: boolean;
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
    // FB01 · F03: sonuç kesin değilse refine de "maçı X-Y kaybettin" YAZMASIN (LOG.txt:4538
    // refine çıktısı tam olarak "Maçı 4-5 kaybettin." ile başlıyordu — 9 round'luk maç).
    const matchOutcome = reportOutcome(body);
    const scoreNote = matchOutcome.label === "UNFINISHED"
      ? " (maç sonucu kesinleşmedi — kazandın/kaybettin yazma)"
      : matchOutcome.label === "DRAW" ? " (berabere)" : "";
    // FB01 · F13: devre arasında taraf değişen maçta tek taraf olgu diye verilmez.
    const sides = resolveReportSides(body);
    const sideFact = sides.mixed
      ? "iki taraf (devre arasında değişti)"
      : rSetup.side === "attack" ? "saldırı" : "savunma";
    // FB01 · F48 KÖK: eski olgu listesinde round YOKTU ama kural 1 "listede olmayan round
    // yazma" diyor, "Mevcut" metin ise R-numaralı — model çelişkiyi kuralı okuyucuya
    // anlatarak çözüyordu ("R5 ve R10 bilgisi listede yok"). Round satırları (R#, sonuç,
    // ölüm konumu) ana prompt'taki gibi verilir; eksik alan yazılmaz (yer tutucu yok).
    const roundFacts = body.rounds
      .filter((r) => r && !r.skipped)
      .slice(0, REFINE_MAX_ROUND_FACTS)
      .map((r) => {
        const side = r.side === "attack" ? " (saldırı)" : r.side === "defense" ? " (savunma)" : "";
        const result = r.result === "win" ? "kazanıldı, " : r.result === "loss" ? "kaybedildi, " : "";
        const loc = typeof r.deathLocation === "string" ? r.deathLocation.trim() : "";
        const fate = r.survived ? "hayatta kaldın" : `öldün${loc ? ` — ${loc}` : ""}`;
        return `  R${r.roundNumber}${side}: ${result}${fate}`;
      });
    const refinePrompt = `Bu ${fieldMap[fs.weakest] || fs.weakest} zayıf. Yeniden yaz.

BU MAÇTA ÖLÇÜLEN OLGULAR (TEK gerçek kaynak — dışına çıkma):
- Harita: ${rSetup.map && rSetup.map !== "Unknown" ? rSetup.map : "OKUNAMADI"}
- Oyuncunun ajanı: ${rSetup.agent && rSetup.agent !== "Unknown" ? rSetup.agent : "OKUNAMADI"}
- Taraf: ${sideFact}
- Skor: ${body.score.yours}-${body.score.enemy}${scoreNote}
- Düşman kadrosu: ${refineEnemies.length > 0 ? refineEnemies.join(", ") : "OKUNAMADI"}
- Ölüm konumları: ${refineLocs.length > 0 ? refineLocs.join(", ") : "OKUNAMADI"}${roundFacts.length > 0 ? `
- Round'lar:
${roundFacts.join("\n")}` : ""}

KURALLAR:
1. YALNIZ yukarıdaki olguları kullan. Verilmeyen bilgiden (ajan, konum, round, skor, sayı) hiç söz etme ve eksik veriyi okuyucuya söyleme — "listede yok", "yazamam" gibi cümleler YASAK. Uydurma YASAK.
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
        // FB01 · F48: meta-dil (prompt kuralını/eksik veriyi okuyucuya anlatan) refine
        // REDDEDİLİR — mevcut tam metin kalır (no-fake: kötü metinle değiştirilmez).
        const meta = !!refined && refined.length > 30 && rFinish === "stop" && hasRefineMetaLanguage(refined);
        if (meta) {
          outcome.metaRejected = true;
          console.warn(`[Aimlo AI] Report refine REJECTED (meta-language) — keeping original ${fs.weakest}`);
        } else if (refined && refined.length > 30 && rFinish === "stop") {
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
