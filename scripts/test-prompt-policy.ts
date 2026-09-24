/**
 * PROMPT POLİTİKASI KİLİTLERİ — B09 prompt/KB dalgası (2026-09-24).
 *
 * NEDEN: bu dalganın maddeleri "prompt modele YASAK biçimi öğretiyor / kendi yasağıyla
 * çelişiyor" sınıfı (KB 10h dersi: yasak ifadeyi başka katman emrediyordu). Süzgeç
 * (lib/coach-text) ikinci katman; bu test KAYNAĞI kilitler. Yalnız ÖLÇÜMDE hedef sınıfı
 * düşüren maddeler kaldı (b09-base → b09-cand/cand2, gpt-5-mini, TR 58 + EN 10 örnek):
 *
 *   [P1] TR-KALAN-07 (EN) — [OPENER] (a) "the most critical ROOT cause" ad öbeği etiket
 *        olarak kopyalanıyordu ("Root cause: …" 2/10). (a) artık düz cümle tarifi.
 *        ÖLÇÜLMÜŞ PRİMİNG KİLİDİ: "iki nokta üst üste ile başlama" şekil yasağı TR'de
 *        iki-noktalı açılışı 0/58 → 5/58 yaptı → açılış satırı iki noktayı ANMAZ.
 *   [P3] TR-KALAN-06 — yumuşak ölüm fiili: NATURAL_COACH_RULE "seni X'ten aldı" ve
 *        "düştün/düşmüşsün"ü yasaklamıyordu; aynı kural "seni oradan kesiyor"u ÖNERİYORDU
 *        (kendi yasağıyla çelişki); vision SYSTEM_PROMPT örneği "seni B short'tan
 *        operator'la aldı" diye öğretiyordu. Ölçüm: "seni … aldı/kesti/…" 13 → 2 (ham).
 *        KB tarafı verify-kb [17]'de kilitli.
 *   [P6] TR-KALAN-05 prompt kökü — vision prompt'u alan adını Türkçe EKLE yazıyordu
 *        ("killerInfo'da", "enemyComp'u", "enemyRoster'da", "enemyComp'taki", "roster'dan")
 *        → model aynı biçimi çıktıya taşıyıp süzgeç "Katil bilgisi'da" üretiyordu.
 *   [P7] EN rapor user prompt'u lang='en' iken Türkçe sabit taşıyordu ("Top killers (kim
 *        seni en çok öldürdü)", "data yok", "SALDIRI/SAVUNMA"); TR bayt-aynı kalmalı.
 * Ölçülüp GERİ ALINANLAR (kilit YOK, gerekçe lib/ai-policy.ts "B09 ÖLÇÜM NOTU"): TR [AÇILIŞ]
 * (a) + odak kuralı (a), ölüm-tipi başlık yasağı, KB_SOURCE_RULE uzlaştırması, TUTANAK /
 * VERİ-YOKSA-SESSİZ-KAL + BANNED_PHRASES eklemeleri.
 *
 * RUN: npx tsx scripts/test-prompt-policy.ts   (npm test içinde)
 */
import { NATURAL_COACH_RULE } from "../lib/ai-policy";
import {
  buildVisionSystemMessage,
  buildVisionUserMessage,
  buildVisionResponseFormat,
  type VisionPromptBody,
} from "../lib/vision-prompt-builder";
import { SYSTEM_PROMPT } from "../lib/vision-prompt";
import { buildReportPrompts, validateRequest } from "../lib/report-prompt";
import { REPORT_FIXTURES } from "../evals/report-fixtures";

let fail = 0;
let pass = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (kosul) pass++;
  else fail++;
};

function visionBody(round: number): VisionPromptBody {
  return {
    round, score: "3-2", result: "loss", map: "Ascent", agent: "Jett", side: "attack",
    died: true, killerInfo: "killed by cypher with vandal", deathLocation: "B Main",
    enemyComp: ["Cypher", "Sova", "Omen", "Jett", "Reyna"], economyType: "full_buy", roundHistory: [],
  } as VisionPromptBody;
}
function openerLine(round: number, lang: "tr" | "en"): string {
  const up = buildVisionUserMessage({ body: visionBody(round), lang, prevDeathTypes: [], prevSource: "-", imageAvailable: true }).userPrompt;
  const tag = lang === "en" ? "[OPENER]" : "[AÇILIŞ]";
  return up.split("\n").find((l) => l.startsWith(tag)) ?? "";
}

console.log("\n[P1] TR-KALAN-07 (EN) — [OPENER] kopyalanabilir etiket VERMİYOR; açılış satırı iki noktayı ANMIYOR");
{
  for (const round of [6, 7, 8]) {
    const line = openerLine(round, "en");
    t(`en round ${round}: açılış satırı üretildi`, line.length > 0);
    t(`en round ${round}: "ROOT cause" ad öbeği yok`, !/\bROOT\s+cause\b/i.test(line), `«${line}»`);
  }
  t("en (a) varyantı = plain sentence saying WHY you died", /\(a\) a plain sentence saying WHY you died/.test(openerLine(6, "en")));
  // Ölçülmüş priming kilidi (b09-cand): iki noktayı anan şekil yasağı biçimi çağırdı (TR 0/58 → 5/58).
  for (const lang of ["tr", "en"] as const) {
    for (const round of [6, 7, 8]) {
      const line = openerLine(round, lang);
      t(`${lang} round ${round}: açılış satırı iki noktayı anmıyor`, !/iki nokta|colon/i.test(line), `«${line}»`);
    }
  }
  t("açılış satırlarında tırnaklı örnek etiket ('…:') yok (V1 F4b)",
    ![6, 7, 8].flatMap((r) => [openerLine(r, "tr"), openerLine(r, "en")]).some((s) => /"[^"\n]{1,40}:"/.test(s)));
}

console.log("\n[P3] TR-KALAN-06 — yumuşak ölüm fiili prompt'ta yasak, hiçbir yerde ÖNERİLMİYOR");
{
  t("NATURAL_COACH_RULE: 'seni oradan aldı' yasak listesinde", /seni oradan aldı/.test(NATURAL_COACH_RULE));
  t("NATURAL_COACH_RULE: 'seni <yer>'den aldı' biçimi yasak listesinde", /seni B Main'den aldı/.test(NATURAL_COACH_RULE));
  t("NATURAL_COACH_RULE: ölümü 'düştün/düşmüşsün' diye yumuşatma yasak", /"düştün \/ düşmüşsün"/.test(NATURAL_COACH_RULE));
  t("NATURAL_COACH_RULE: kendi yasağıyla çelişen 'seni oradan kesiyor' ÖNERİSİ kalktı", !/seni oradan kesiyor/.test(NATURAL_COACH_RULE));
  // vision sistem prompt'u (KB hariç) "seni … aldı" / "seni kesti" / ölüm anlamlı "düştün" ÖRNEĞİ vermiyor.
  const soft = /(?<!\p{L})seni(?:\s+[^\s.;!?"]+){0,4}?\s+(?:ald[ıi]|kesti)(?!\p{L})/u;
  t("vision SYSTEM_PROMPT'ta 'seni … aldı/kesti' örneği yok", !soft.test(SYSTEM_PROMPT), `«${SYSTEM_PROMPT.match(soft)?.[0]}»`);
  t("vision SYSTEM_PROMPT'ta ölüm anlamlı 'düştün' örneği yok", !/(?<!\p{L})düştün(?!\p{L})/u.test(SYSTEM_PROMPT));
}

console.log("\n[P6] TR-KALAN-05 prompt kökü — alan adı Türkçe ekle yazılmıyor (sistem + kullanıcı + şema)");
{
  const RE = /(killerInfo|enemyComp|enemyRoster|deathLocation|deathAngle|economyType|ultReady|deathTiming|spikePlanted|killfeedOrder|playerRoute|roster)['’]\p{L}+/gu;
  const body = visionBody(6);
  for (const lang of ["tr", "en"] as const) {
    const sys = buildVisionSystemMessage({ body, lang, memoryContext: "" }).systemMessage;
    const usr = buildVisionUserMessage({ body, lang, prevDeathTypes: [], prevSource: "-", imageAvailable: true }).userPrompt;
    const sch = JSON.stringify(buildVisionResponseFormat(lang));
    for (const [ad, metin] of [["sistem", sys], ["kullanıcı", usr], ["şema", sch]] as const) {
      const hits = [...metin.matchAll(RE)].map((m) => m[0]);
      t(`${lang} ${ad} mesajı: alan-adı+ek biçimi 0`, hits.length === 0, `(${[...new Set(hits)].join(", ")})`);
    }
  }
}

console.log("\n[P7] EN rapor user prompt'u Türkçe sabit taşımıyor; TR bayt-aynı");
{
  const TR_CONST = ["kim seni en çok öldürdü", "en çok nerede öldün", "data yok", "SALDIRI", "SAVUNMA", "oyuncu site'lara giriyor", "oyuncu site'ları tutuyor"];
  const en = REPORT_FIXTURES.filter((f) => f.body.lang === "en");
  const tr = REPORT_FIXTURES.filter((f) => f.body.lang !== "en");
  t(`fixture'lar yüklendi (EN ${en.length}, TR ${tr.length})`, en.length > 0 && tr.length > 0);
  for (const fx of en) {
    const v = validateRequest(fx.body);
    if (!v.valid) { t(`${fx.id}: validateRequest`, false, v.error); continue; }
    const { userPrompt } = buildReportPrompts(v.data, { memoryContext: fx.memoryContext });
    const hits = TR_CONST.filter((c) => userPrompt.includes(c));
    t(`${fx.id}: EN user prompt'ta Türkçe sabit yok`, hits.length === 0, `(${hits.join(", ")})`);
    t(`${fx.id}: EN etiketler var`, /Top killers \(who killed you most\)/.test(userPrompt) && /Top death locations \(where you died most\)/.test(userPrompt));
  }
  for (const fx of tr) {
    const v = validateRequest(fx.body);
    if (!v.valid) { t(`${fx.id}: validateRequest`, false, v.error); continue; }
    const { userPrompt } = buildReportPrompts(v.data, { memoryContext: fx.memoryContext });
    t(`${fx.id}: TR user prompt Türkçe etiketleri AYNEN taşıyor`,
      userPrompt.includes("- Top killers (kim seni en çok öldürdü): ") && userPrompt.includes("- Top death locations (en çok nerede öldün): ") &&
      /Side: (attack \(SALDIRI — oyuncu site'lara giriyor: entry\/execute\/trade\/space\)|defense \(SAVUNMA — oyuncu site'ları tutuyor: hold\/off-angle\/retake\/save\))/.test(userPrompt));
  }
}

console.log(`\n${fail === 0 ? "TAM YEŞİL" : "KIRMIZI"} — ${pass}/${pass + fail} geçti${fail ? `, ${fail} HATA` : ""}`);
process.exit(fail ? 1 : 0);
