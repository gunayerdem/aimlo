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
// NEDEN coach-text.ts'te DEĞİL: coach-text app/LandingClient.tsx ("use client") tarafından
// da bağlanıyor; reality-checker'ı oraya statik bağlamak landing bundle'ına girme
// riski taşır (coach-text.ts başındaki not). Bu modülü yalnız sunucu route'u ve
// scriptler import eder.
//
// SAHTE ÇIKTI YOK: hiçbir koç metni ÜRETİLMEZ; yalnız süzülür/kırpılır. Süzgeç
// deathAnalysis'i tamamen boşaltırsa alan "" döner ve route YAPISAL HATA verir
// (visionOutputFailure) — ham/yasaklı metne geri düşülmez (CANLI-TEST-07).
import { realityCheck, type FactGround } from "@/lib/reality-checker";
import {
  cleanCoachText,
  clampToSentence,
  enforceSuppliedCallout,
  enforceAgentNames,
  stripDiagnosisLabel,
  hasCoachContent,
  rewriteKayitVarFacts,
  isOnlyHedgedEnemyClaim,
} from "@/lib/coach-text";
import { enforceAgentKit } from "@/lib/agent-abilities";
import { knownAgent } from "@/lib/format-display";

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
  /** Oyuncunun ajanı (kit-dışı yetenek süzgeci + ajan-adı kilidi çapası). */
  agent?: string;
  /** İstek gövdesinin enemyComp'u (ham) — ajan-adı kilidinin çapası (TR-KALAN-09). */
  enemyComp?: ReadonlyArray<unknown> | null;
  /** Masaüstünün OCR'la ölçtüğü ham deathLocation (callout-yazım kilidi, S5). */
  suppliedLoc?: string | null;
};

/** Karakter kapağının ATEŞLEDİĞİ alan (W2 inceleme RW1-F3): kapak cümle-sınırlı
 *  kırptığında son cümle (DA'da şemanın "ZORUNLU somut düzeltme"si) düşebilir.
 *  VISION_DEATH_CAP (400) ölçülen korpus tavanına EŞİT — pay yok; route her ateşlemede
 *  WARN basar ki sınıfın geri dönüşü prod logunda ölçülebilsin (davranış değişmez). */
export type VisionCapHit = {
  field: "deathAnalysis" | "nextRoundSuggestion" | "enemyAnalysis";
  /** Kapak öncesi (süzülmüş + kit-süzgeçli) uzunluk. */
  before: number;
  /** Kapak sonrası uzunluk. */
  after: number;
};

export type VisionPostprocessResult = VisionFeedbackFields & {
  realityModified: boolean;
  rewriteLevels: { death: number; suggestion: number };
  /** Bu çağrıda ateşleyen kapaklar (boş = hiçbiri). */
  capHits: VisionCapHit[];
};

/** Karakter kapakları. NR 350 (değişmedi). EA 180 → 240 (TR-KALAN-08): süzgeçten
 *  geçmiş EA[1] ölçümü TR n=139 p50 133 / p90 171 / p95 186 / MAX 212, EN MAX 187 —
 *  180 her iki dilde maddelerin %6,5'ini cümle ortasından kesiyordu. Bu bir
 *  yanıt-sonrası KARAKTER kapağı; token bütçesi (DEFAULT_MAX_TOKENS 350) değişmedi.
 *  DA 350 → 400 (B03 inceleme): cümle-sınırlı kapak ateşlediğinde DA'nın SON cümlesi
 *  düşüyor — şemada o cümle "ZORUNLU somut düzeltme" (teşhis + düzeltme). Gerçek
 *  korpusta (scripts/eval-out, 944 örnek) kapak-öncesi DA: p50 196 / p99 299 / MAX
 *  400; 350'yi aşan 2 örneğin (cyclereal-r3 M1-R18 359, M1-R24 400) ikisinde de
 *  düzeltme cümlesi tümüyle siliniyordu. 400 ölçülen tavanı karşılar → korpusta kapak
 *  hiç ateşlemez; clampWords'e (kesik cümle, TR-KALAN-08 sınıfı) geri dönülmez.
 *  PAY YOK (W2 inceleme RW1-F3): 400 = korpus MAX; zincir metni uzatabiliyor (katil-guard
 *  "Jett olarak" → "bir düşman olarak" +6, slash → " ya da "). Kapağı yükseltmek overlay
 *  görsel kararı (softi göz kontrolü bekliyor, W2 followup) → değer AYNI kaldı; bunun
 *  yerine her ateşleme `capHits` ile döner ve route WARN basar ("vision cap fired"). */
export const VISION_TEXT_CAP = 350;
export const VISION_DEATH_CAP = 400;
export const VISION_ENEMY_ITEM_CAP = 240;

/** Tel roundHistory kaydı → realityCheck'in round hafızası (route'un memoryForCheck'i). */
export function toRoundMemory(roundHistory: ReadonlyArray<Record<string, unknown>> | null | undefined) {
  return (roundHistory || []).map((r) => ({
    round_index: r.round_index as number,
    died: !!r.died,
    death_position: r.death_position as string | null | undefined,
    position_confidence: r.position_confidence as string | undefined,
  }));
}

/** Ajan-adı kilidinin çapaları: katil (sözlük-bağlı) + rakip kadro + oyuncunun ajanı,
 *  hepsi resmi tabloyla (format-display knownAgent) kanonikleştirilmiş. Tanınmayan
 *  değer çapa OLMAZ (gürültü OCR'dan bulanık eşleme doğmaz). */
export function agentNameAnchors(
  factGround: FactGround,
  enemyComp: ReadonlyArray<unknown> | null | undefined,
  agent: string | null | undefined,
): string[] {
  const out: string[] = [];
  const add = (a: unknown) => {
    const k = knownAgent(a);
    if (k && !out.includes(k)) out.push(k);
  };
  add(factGround.killerAgent);
  for (const a of enemyComp || []) add(a);
  add(agent);
  return out;
}

/**
 * Vision route'un model-sonrası son-işlem zinciri (tek kaynak). Alan başına sıra:
 *   enforceAgentNames → [yalnız DA: stripDiagnosisLabel] → realityCheck →
 *   cleanCoachText → boş-guard → enforceAgentKit → clampToSentence → fixCallout.
 */
export function finalizeVisionFeedback(
  fb: VisionFeedbackFields,
  opts: VisionPostprocessOpts,
): VisionPostprocessResult {
  const { factGround, lang, map, agent } = opts;
  const memory = toRoundMemory(opts.roundHistory);

  // AJAN-ADI KİLİDİ — ZİNCİRİN İLK HALKASI (TR-KALAN-09): model nadir ajan adını
  // harf düzeyinde bozuyor ("Rejyna/Reına/Reğu/Reay", "Cyclpher"); realityCheck'in
  // katil-guard'ı TAM yazıma bağlı olduğundan bozuk ad onu atlatıyor ve katil
  // bilinmezken "Rejyna seni vurdu" kullanıcıya gidiyordu. Kanonik ad realityCheck'ten
  // ÖNCE yazılır ki guard onu görsün. Yalnız düzeltir; eşleşme yoksa bayt-aynı.
  const anchors = agentNameAnchors(factGround, opts.enemyComp, agent);
  const fixNames = (t: string) => enforceAgentNames(t, anchors);

  // TANI-ETİKETİ SOYUCU (TR-KALAN-07 sınır savunması) — YALNIZ deathAnalysis:
  // "En kritik neden:", "Kök neden: okunabilirlik sızıntısı —" gibi rapor
  // etiketleri (HEAD replay 12/91 DA). realityCheck'ten ÖNCE: yan-cümle silmesi
  // etiketi yetim bırakmasın ("Kök neden: okunabilirlik sızıntısı." kalıntısı).
  // Kök (prompt): B09'da ölçülüp TR tarafı BİLİNÇLİ bırakıldı (TR etiketli açılış
  // tabanda 0/58; TR değişikliğini içeren adaylar m3/detector'da geriledi — ai-policy.ts
  // "B09 ÖLÇÜM NOTU"); yalnız EN [OPENER] (a) değişti. TR için bu soyucu tek savunma.
  // "KAYIT VAR" TUTANAK DİLİ → OLGU (FB06 · F95): "B Main'de üç kez öldüğün kayıt var" →
  // "B Main'de üç kez öldün" realityCheck'ten ÖNCE yazılır ki sayım (F57 yazıyla sayı dahil) ve
  // konum doğrulaması dönüştürülmüş metinde çalışsın. Aynı dönüşüm cleanCoachText'in ilk meta
  // halkasında da var (idempotent). Eşleşme yoksa bayt-aynı. NR'nin ham-metin kurtarması (nrIn)
  // de dönüştürülmüş hâli kullanır — tutanak dili ham metne geri dönmez.
  const daIn = rewriteKayitVarFacts(stripDiagnosisLabel(fixNames(fb.deathAnalysis), lang));
  const nrIn = rewriteKayitVarFacts(fixNames(fb.nextRoundSuggestion));

  // Reality check against round memory (modifies text if AI claims contradict
  // observed data). factGround = route'un buildFactGround'u (Ölüm-Veri Sözleşmesi
  // 2026-06-29) — prompt fact-sheet'ini üreten AYNI nesne; guard, modele "bilinmiyor"
  // denen olguları (killer/weapon/location/headshot/alive/spike/route/trade) söker.
  // lang (denetim 2026-07-19 F5): replacement dili isteğin kendi dili. map (canlı
  // bug 2026-07-21): oynanan haritaya ait OLMAYAN callout'lar ayıklanır.
  const checkedAnalysis = realityCheck(daIn, memory, factGround, "death", lang, map);
  const checkedSuggestion = realityCheck(nrIn, memory, factGround, "suggestion", lang, map);

  // Callout-yazım kilidi (canlı-test #10 kalite dalgası, S5): model verilen
  // callout'u aynı cevapta bozabiliyor (canlı kanıt: deathLocation="a lamps"
  // → çıktıda "Lambs gibi"). Verilen değerin bozuk yakın-varyantı orijinal
  // görünümle değiştirilir; dar kapsam + korumalar lib/coach-text.ts'te.
  const suppliedLoc = opts.suppliedLoc ? String(opts.suppliedLoc) : "";
  const fixCallout = (t: string) => (suppliedLoc ? enforceSuppliedCallout(t, suppliedLoc) : t);
  // Kapak: clampToSentence (TR-KALAN-08) — kırpılmayan metin bayt-aynı; kırpma
  // olursa son tam cümle / yan-cümle sınırına sarar (lib/coach-text.ts sözleşmesi).
  const capHits: VisionCapHit[] = [];
  const finish = (t: string, cap: number, field: VisionCapHit["field"]) => {
    // Zincir biçimi tek ifadede kalır (test-pipeline-chain G1 grep-guard'ı bu biçimi
    // tek tanım olarak arar); ölçüm için kit-süzgeçli uzunluk ayrıca hesaplanır
    // (enforceAgentKit saf/deterministik — aynı girdiye aynı çıktı).
    const clamped = clampToSentence(enforceAgentKit(t, agent), cap);
    const before = enforceAgentKit(t, agent).length;
    if (before > cap) capHits.push({ field, before, after: clamped.length });
    return fixCallout(clamped);
  };

  // deathAnalysis — temizle ÖNCE, sonra kapak (plainify/apostrof uzunluğu değiştirir).
  // BOŞ-GUARD (CANLI-TEST-07): cleanCoachText metni tamamen boşaltırsa (ör. yalnız
  // "(41 HP)" etiketi) eskiden reality-check'lenmiş HAM metin dönüyordu → süzgecin
  // sildiği HP/meta içerik kullanıcıya GERİ geliyordu; noktalama-yalnız çıktı da
  // "dolu" sayılıyordu. Artık anlamlı değilse "" → route yapısal hata döner.
  const cleanedAnalysis = cleanCoachText(checkedAnalysis.text, lang);
  const daOut = hasCoachContent(cleanedAnalysis) ? finish(cleanedAnalysis, VISION_DEATH_CAP, "deathAnalysis") : "";
  const deathAnalysis = hasCoachContent(daOut) ? daOut : "";

  // enemyAnalysis de reality-check'ten GEÇER (grounding audit 2026-06-26).
  // TR-KALAN-26 (karar varsayılanı b): realityCheck bir maddeyi TÜMÜYLE kanıtsız
  // bulup "" döndürürse eskiden HAM metin geri konuyordu → süzgecin yakaladığı
  // kanıtsız iddia ("3 rundur tekrar eden bu hata") aynen kullanıcıya gidiyordu.
  // Artık o madde DÜŞER — ama kanıtlı madde kalmazsa SON madde (ad-düzeltilmiş ham
  // hâliyle, yine tam süzgeçten geçerek) korunur (kararın "son madde asla düşmez"i).
  // DİZİ BOŞALABİLİR (W2 inceleme RW1-F4 — eski "dizi asla boşalmaz" yorumu yanlıştı):
  // korunan son madde süzgeçten İÇERİKSİZ çıkarsa (ör. yalnız "41 HP ile.") o da düşer
  // ve dizi [] olur — noktalama-yalnız madde gösterilmez. Masaüstü [] şeklini kabul
  // ediyor (ai_client.rs RoundFeedback enemy_analysis Vec<String>); overlay boş bloğu
  // için masaüstü followup'ı var (W2 inceleme RW1-F4).
  // .filter (canlı-test #10, S1 dizi-kuralı): cleanCoachText SAF-META bir elemanı
  // '' yapabilir — boş eleman diziden düşer, kullanıcıya boş satır gitmez.
  // BOŞ-GUARD EA'ya da (B03 inceleme, CANLI-TEST-07 sınıfı): eski süzgeç
  // `x.text.trim().length > 0` idi → yalnız HP etiketi olan madde ("41 HP ile.")
  // stripNumericHp/stripHpClaims'ten "." olarak çıkıp "dolu" sayılıyor, overlay
  // "› ." madde işareti basıyordu. Artık DA ile AYNI tanım (hasCoachContent):
  //   • kanıtlı sayılmak için realityCheck çıktısının SÜZÜLMÜŞ hâli içerik taşımalı;
  //     taşımıyorsa madde kanıtsız muamelesi görür (ad-düzeltilmiş ham metin, aynı
  //     süzgeçten) — TR-KALAN-26 (b) kuralı aynen işler (kurtarma yolu);
  //   • süzülmüş ham hâli de içeriksizse madde düşer (içeriksiz metin ASLA gösterilmez).
  // BİLİNEN SINIR (W2 inceleme RW1-F1, karar TR-KALAN-26 (b) uygulandı): kurtarma
  // yolunun ateşlemesi için realityCheck çıktısının süzgeçte içeriksiz kalması, ham
  // metnin ise içerik taşıması gerekir → ham metindeki içerik TANIM GEREĞİ realityCheck'in
  // SİLDİĞİ kısımdır. Yani bu yol, dizideki SON madde için RC'nin reddettiği iddiayı
  // (süzgeçten geçmiş hâliyle) geri getirir — kararın lafzı ("son madde asla düşmez")
  // bunu kapsıyor. Korpus sıklığı 0/7644 (inceleme A/B'si). Yasaklı İÇERİK
  // (HP/meta/kod-ad) süzgeçten geçtiği için geri gelmez; RC'nin reddettiği kanıtsız
  // iddia ise gelebilir. Karar değişirse (inceleme seçeneği a) RC çıktısının "boş değil
  // ama içeriksiz" hâli "RC tüm içeriği reddetti" sayılmalı (NR "", EA maddesi düşer).
  const eaItems = (fb.enemyAnalysis || []).slice(0, 2).map((s) => {
    const src = rewriteKayitVarFacts(fixNames(String(s)));    // FB06 · F95 (bkz. daIn/nrIn)
    const c = realityCheck(src, memory, factGround, "suggestion", lang, map);
    const cleanedChecked = c.text && c.text.trim() ? cleanCoachText(c.text, lang) : "";
    // FB07 · F43: maddenin TAMAMI hedge'li düşman tahmini ("Cypher … tel koymuş olabilir.")
    // ise kanıtsız sayılır → dizide kanıtlı madde varsa düşer; yoksa son madde (hedge'i
    // korunmuş, kesinleştirilmemiş hâliyle) kalır.
    const proven = hasCoachContent(cleanedChecked) && !isOnlyHedgedEnemyClaim(c.text, lang);
    return { proven, text: finish(proven ? cleanedChecked : cleanCoachText(src, lang), VISION_ENEMY_ITEM_CAP, "enemyAnalysis") };
  }).filter((x) => hasCoachContent(x.text));
  const provenItems = eaItems.filter((x) => x.proven);
  const enemyAnalysis = (provenItems.length > 0 ? provenItems : eaItems.slice(-1)).map((x) => x.text);

  // Cycle 3: if reality-check emptied the suggestion (every sentence was an
  // unproven repetition claim → "suggestion" kind returns "" rather than a
  // past-tense death stub), keep the model's original advice — still a valid
  // actionable next-round plan. Prevents the S9-class stub regression.
  // TR-KALAN-26 kararı: nextRoundSuggestion alanı boş kalamaz → ham metin korunur.
  // BOŞ-GUARD NR'ye de (B03 inceleme, CANLI-TEST-07 sınıfı): "41 HP ile." süzgeçten
  // "." çıkıyor ve overlay'in plan satırı tek nokta gösteriyordu. Kararın ruhu
  // (alan boş kalmasın → ham metin korunur) "içeriksiz" çıktıya da uygulanır:
  // realityCheck'li metin süzgeçte içeriksiz kalırsa ad-düzeltilmiş HAM metin AYNI
  // süzgeçten geçirilir; o da içeriksizse (HP/meta'dan ibaret) alan "" döner —
  // süzülmemiş (yasaklı içerikli) ham metne ya da sentetik koç metnine ASLA düşülmez.
  // "" sözleşmede zaten var (şema-boş NR route.ts toFeedbackOutcome'da "" olarak geçer).
  // BİLİNEN SINIR (W2 inceleme RW1-F1): EA'daki notun aynısı — bu kurtarma yolu RC'nin
  // SİLDİĞİ iddiayı süzülmüş hâliyle geri getirebilir; karar TR-KALAN-26 (b) "NR'de ham
  // metin korunur" lafzıyla uygulandı. HP-yalnız cümlenin bıraktığı ". " / ".." artığı
  // cleanCoachText'te onarıldı (tidyHpStripResidue) → kurtarılan metin artıkla başlamaz.
  const safeSuggestion = checkedSuggestion.text && checkedSuggestion.text.trim()
    ? checkedSuggestion.text
    : nrIn;
  let cleanedSuggestion = cleanCoachText(safeSuggestion, lang);
  if (!hasCoachContent(cleanedSuggestion) && safeSuggestion !== nrIn) {
    cleanedSuggestion = cleanCoachText(nrIn, lang);
  }
  const nrOut = hasCoachContent(cleanedSuggestion) ? finish(cleanedSuggestion, VISION_TEXT_CAP, "nextRoundSuggestion") : "";
  const nextRoundSuggestion = hasCoachContent(nrOut) ? nrOut : "";

  return {
    deathAnalysis,
    enemyAnalysis,
    nextRoundSuggestion,
    realityModified: checkedAnalysis.modified || checkedSuggestion.modified,
    rewriteLevels: { death: checkedAnalysis.rewriteLevel, suggestion: checkedSuggestion.rewriteLevel },
    capHits,
  };
}

/** Route'un son-işlem sonrası döndüğü YAPISAL HATA (CANLI-TEST-07). deathAnalysis
 *  süzgeçte tamamen boşaldıysa sahte/ham koç metni YERİNE mevcut "ai_invalid_shape"
 *  yolu (desktop ai_client.rs → OverlayError::InvalidShape) kullanılır. Gövdede
 *  kullanıcı metni YOK (yasaklı içerik hata gövdesinden de sızmaz); "Analiz
 *  yapılamadı." alt-dizgisi YOK (frontend o metni reddeder). */
export function visionOutputFailure(out: VisionPostprocessResult): {
  code: "ai_invalid_shape";
  message: string;
  status: 502;
  detail: { field: "deathAnalysis"; reason: "empty_after_filter" };
} | null {
  if (hasCoachContent(out.deathAnalysis)) return null;
  return {
    code: "ai_invalid_shape",
    message: "Model output unusable: deathAnalysis empty after output filter",
    status: 502,
    detail: { field: "deathAnalysis", reason: "empty_after_filter" },
  };
}
