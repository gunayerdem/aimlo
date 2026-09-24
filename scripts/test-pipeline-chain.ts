/**
 * TEMİZLEYİCİ ZİNCİRİNİN UÇTAN-UCA SIRA TESTİ — B10 (denetim 2026-07-31)
 * ────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-pipeline-chain.ts   (exit 1 = kırık)
 *
 * NEDEN VAR: geçmişteki üç olayın ÜÇÜ de KATMANLAR-ARASI etkileşim hatasıydı:
 *   1. KB-10h dersi — "kod kendisiyle çelişiyordu: bir katman yasaklarken
 *      başka katman aynı ifadeyi EMREDİYORDU".
 *   2. strip-callout regresyonu (2026-07-24) — realityCheck'in içindeki
 *      stripForeignCallouts GERÇEK ölüm yerini siliyordu ("a hail").
 *   3. kafadan+apostrof post-process bozması — cleanCoachText'in kendi
 *      kuralları birbirinin çıktısını bozuyordu.
 * Mevcut testlerin HEPSİ tek-katman izole (test-coach-text-tr → yalnız
 * cleanCoachText, test-map-callouts → yalnız stripForeignCallouts,
 * test-strip-hp → yalnız stripNumericHp). Bu sınıf hata izole testte
 * GÖRÜNMEZ; ancak metin TAM zincirden PROD SIRASIYLA geçirilince çıkar.
 *
 * ZİNCİR = lib/vision-postprocess.ts:finalizeVisionFeedback — route'un ÇAĞIRDIĞI
 * FONKSİYONUN KENDİSİ (OLCUM-ARACI-08, 2026-09-23; eskiden burada route.ts:1356-1389
 * referanslı ELLE bir kopya vardı, bayattı ve fixCallout halkası HİÇ yoktu):
 *   realityCheck(text, memory, factGround, kind, lang, map)
 *     └─ içinde: stripForeignCallouts → guardUnprovenFacts → claim-rewrite
 *   → cleanCoachText(lang)
 *     └─ içinde: stripNumericHp → stripHpClaims → plainifyAbilities → TR jargon
 *   → enforceAgentKit(agent)
 *   (B03/2: zincirin başına enforceAgentNames, DA'ya stripDiagnosisLabel eklendi)
 *   → clampToSentence (350; enemyAnalysis 240)
 *   → fixCallout (enforceSuppliedCallout — gövdede deathLocation varsa)
 *
 * ASSERT BİÇİMİ — bilinçli tercih: birebir "golden string" YERİNE
 * `korunmali` / `silinmeli` invariantları. Gerekçe: golden string, ilgisiz ve
 * MEŞRU bir ifade değişikliğinde de kırılır (CI gürültüsü → test'e güven
 * kaybı); invariant ise yalnız ZİNCİRİN SÖZLEŞMESİ bozulunca kırılır. Ayrıca
 * her vakada `bosDegil` zorunlu — "katman metni tamamen yedi" sınıfı (canlı
 * empty-guard bug'ı) bu tek koşulla yakalanır.
 *
 * BAKIM: her yeni katman-çelişkisi bug'ında korpusa 1 VAKA EKLE (canlı
 * metniyle, kaynağını yorumda belirterek).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { buildFactGround, realityCheck } from "../lib/reality-checker";
import { clampToSentence, clampWords, enforceAgentNames } from "../lib/coach-text";
import {
  finalizeVisionFeedback,
  visionOutputFailure,
  VISION_DEATH_CAP,
  VISION_ENEMY_ITEM_CAP,
  VISION_TEXT_CAP,
} from "../lib/vision-postprocess";
import { sanitizePromptInput } from "../lib/prompt-safety";
import { buildVisionContext, visionPostprocessOpts, type VisionPromptBody } from "../lib/vision-prompt-builder";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};

type Vaka = {
  ad: string;
  kaynak: string;               // bu metin nereden geldi (canlı bug / DB / korpus)
  metin: string;                // modelin ÜRETTİĞİ ham metin
  kind: "death" | "suggestion";
  lang: "tr" | "en";
  map?: string;
  agent?: string;
  /** VisionRequest gövdesi — factGround route'un buildFactGround'uyla kurulur. */
  body?: Record<string, unknown>;
  /** ctx alanları (route.ts ctx'i): deathLocation / deathAngle / playerRoute. */
  ctx?: Record<string, unknown>;
  roundHistory?: { round_index: number; died: boolean; death_position?: string | null; position_confidence?: string }[];
  korunmali?: string[];         // çıktıda AYNEN bulunmalı
  silinmeli?: string[];         // çıktıda BULUNMAMALI
};

/** PROD ZİNCİRİ — route'un kullandığı finalizeVisionFeedback'in KENDİSİ (kind'a göre alan). */
function zincir(v: Vaka): string {
  const body = v.body || {};
  // kind → alan: "death" deathAnalysis, "suggestion" nextRoundSuggestion. Öteki
  // alanlar boş verilir (realityCheck/cleanCoachText boş girdide erken döner).
  const fb = v.kind === "death"
    ? { deathAnalysis: v.metin, enemyAnalysis: [], nextRoundSuggestion: "" }
    : { deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: v.metin };
  const out = finalizeVisionFeedback(fb, {
    roundHistory: v.roundHistory,
    // route: factGround = buildFactGround(gövde, ctx) — ctx route'ta gövdeden kurulur.
    factGround: buildFactGround(body, v.ctx || {}),
    lang: v.lang,
    map: v.map,
    agent: v.agent,
    // route: enemyComp = body.enemyComp (ajan-adı kilidinin çapası, TR-KALAN-09).
    enemyComp: Array.isArray(body.enemyComp) ? body.enemyComp : undefined,
    // route: suppliedLoc = body.deathLocation (ham OCR değeri → fixCallout halkası).
    suppliedLoc: typeof body.deathLocation === "string" ? body.deathLocation : "",
  });
  return v.kind === "death" ? out.deathAnalysis : out.nextRoundSuggestion;
}

// ════════════════════════════════════════════════════════════════════════════
// KORPUS — hepsi GERÇEK metin biçimleri (uydurma vaka yok)
// ════════════════════════════════════════════════════════════════════════════
const KORPUS: Vaka[] = [
  {
    // scripts/repro-strip.ts:5 — 2026-07-24 feedback çöküşünün ana vakası.
    // İKİ katman AYNI cümlede iş yapıyor: stripForeignCallouts "C Mound"u
    // KORUMALI (Lotus'un kendi callout'u, üstelik OCR'ın gönderdiği konum) ve
    // cleanCoachText "avladı" eufemizmini düzleştirmeli. Eskiden strip önce
    // konumu yiyordu → "nerede öldüğünü söylemiyor" şikayeti.
    ad: "Lotus — gerçek callout KORUNUR + 'avladı' düzleşir",
    kaynak: "scripts/repro-strip.ts:5 (canlı bug korpusu)",
    metin: "C Mound'da tek başına kaldın, düşman seni oradan avladı.",
    kind: "death", lang: "tr", map: "Lotus", agent: "Omen",
    body: { killerInfo: "killed by jett with vandal" },
    ctx: { deathLocation: "C Mound" },
    korunmali: ["C Mound"],
    silinmeli: ["avladı"],
  },
  {
    // scripts/test-map-callouts.ts'teki gerçek DB metninin zincir hâli.
    // "A Short" Lotus'ta YOK (Ascent/Bind/Haven'a ait) → başka-haritada-KANITLI
    // olduğu için silinir. Bu, zincirin İLK adımının hâlâ çalıştığının kanıtı.
    ad: "Lotus — yabancı callout 'A Short' AYIKLANIR",
    kaynak: "analyses tablosu, 2026-07-21T17:01 (Kaan'ın Lotus maçı)",
    metin: "A Short'ta tek başına girdin ve takım senkronunu bozdun.",
    kind: "death", lang: "tr", map: "Lotus", agent: "Omen",
    body: { killerInfo: "killed by jett with vandal" },
    silinmeli: ["A Short", "a short"],
  },
  {
    // Canlı-test #8 (2026-07-19): "tam canla çatışırken 'az canla' dendi".
    // stripNumericHp sayıyı kovaya çevirir, stripHpClaims kovayı da siler —
    // İKİ katman arka arkaya; sıra bozulursa "düşük canla" ekrana kaçar.
    ad: "HP iddiası — sayı DA kova DA silinir (iki katman arka arkaya)",
    kaynak: "canlı-test #8, softi 2026-07-19",
    metin: "45 HP ile açıyı zorladın ve karşı ateşte düştün.",
    kind: "death", lang: "tr", map: "Ascent", agent: "Jett",
    body: { killerInfo: "killed by cypher with vandal" },
    ctx: { deathLocation: "A Main" },
    silinmeli: ["45", "HP", "düşük canla", "az canla"],
  },
  {
    // CÜMLE-KORUMA sözleşmesi (lib/coach-text.ts:487-488'de yazılı): stripHpClaims
    // YALNIZ İFADEYİ siler, CÜMLEYİ korur. Katman-çelişkisinin klasik biçimi —
    // bir katman ifadeyi silerken cümleyi de götürürse kullanıcı boş/kırık
    // feedback görür (canlı-test #8'in ikinci yarısı).
    ad: "HP ifadesi silinir ama CÜMLE ayakta kalır",
    kaynak: "lib/coach-text.ts:487-488 sözleşmesi + canlı-test #8",
    metin: "Az canla peek attın ve açıyı tutamadın.",
    kind: "death", lang: "tr", map: "Ascent", agent: "Jett",
    body: { killerInfo: "killed by cypher with vandal" },
    ctx: { deathLocation: "A Main" },
    // B01/TR-KALAN-24 (2026-09-23): "Az canla" silinince açıkta kalan metin başı
    // artık büyütülüyor → "Peek attın …" (eski çıktı küçük harfle başlıyordu).
    korunmali: ["Peek attın", "açıyı tutamadın"],
    silinmeli: ["Az canla", "az canla"],
  },
  {
    // canlı-test #7 (2026-07-31): model "Bu round'ta" üretti. "round" yumuşak
    // d ile biter → doğrusu "round'da". Türkçe-\b tuzağının aynı ailesi.
    ad: "Ek hatası — \"round'ta\" → \"round'da\"",
    kaynak: "canlı-test #7, 2026-07-31 (DB çıktısı)",
    metin: "Bu round'ta erken açıldın ve trade alamadan düştün.",
    kind: "death", lang: "tr", map: "Bind", agent: "Sage",
    // tradedByAlly VAR → hasTradeData=true; aksi hâlde guardUnprovenFacts
    // "trade alamadan" ifadesini kanıtsız sayıp cümleyi değiştirebilirdi ve
    // test ölçmek istediği EK KURALINI (round'ta→round'da) ölçemezdi.
    body: { killerInfo: "killed by raze with vandal", tradedByAlly: false },
    korunmali: ["round'da"],
    silinmeli: ["round'ta"],
  },
  {
    // Dil denetimi 2026-07-25: "crosshair'ı" — Türkçe "ı" harfinde JS \b
    // çalışmadığı için ekrana "nişangâh'ı" (apostroflu, bozuk) düşüyordu.
    // Zincirde ölçülmesi önemli: realityCheck'in strip'i cümleyi kırparsa
    // cleanCoachText'in gördüğü metin değişir.
    ad: "Türkçe-\\b tuzağı — crosshair'ı zincir sonunda düzgün",
    kaynak: "dil denetimi 2026-07-25 (canlı çıktıda 4 kez)",
    metin: "A Main'de crosshair'ı sabitleyemeyip geniş açıdan çıktın.",
    kind: "death", lang: "tr", map: "Ascent", agent: "Jett",
    body: { killerInfo: "killed by sova with guardian" },
    ctx: { deathLocation: "A Main" },
    korunmali: ["nişangâhı"],
    silinmeli: ["crosshair", "nişangâh'ı"],
  },
  {
    // KATİL UYDURMASI: killerInfo YOK → guardUnprovenFacts ajan adını "bir
    // düşman"a indirmeli. Sonra cleanCoachText o cümleyi BOZMAMALI.
    // (grounding audit 2026-06-26'nın #1 fabrikasyon kaynağı.)
    ad: "killerInfo yokken katil adı uydurulamaz (guard + temizleyici birlikte)",
    kaynak: "grounding audit 2026-06-26 / canlı-test 2026-06-29",
    metin: "Cypher seni B Main'de vurup öldürdü.",
    kind: "death", lang: "tr", map: "Ascent", agent: "Killjoy",
    body: {},                      // killerInfo YOK → hasKiller=false
    ctx: { deathLocation: "B Main" },
    silinmeli: ["Cypher"],
  },
  {
    // EN dalı (B57 ile aynı kör nokta): zincirin EN yolu prod'da CANLI ama
    // hiçbir zincir testi ondan geçmiyordu. HP iddiası EN'de de silinmeli.
    ad: "EN — HP iddiası İngilizce dalda da silinir",
    kaynak: "EN dil zinciri 2026-07-18 (prod canlı)",
    metin: "You pushed the angle at 45 hp and got traded down.",
    kind: "death", lang: "en", map: "Ascent", agent: "Jett",
    body: { killerInfo: "killed by cypher with vandal", tradedByAlly: true },
    ctx: { deathLocation: "A Main" },
    // stripNumericHp EN: "at 45 hp" → "at low HP" (HP_BUCKET_EN),
    // ardından stripHpClaims EN o kovayı da siler → sayı DA nitel iddia DA gider.
    silinmeli: ["45", "hp", "low HP"],
  },
  {
    // SUGGESTION kind'ı: realityCheck "suggestion"da boş dönebilir (S9-sınıfı
    // stub). Zincir yine de kullanılabilir bir tavsiye döndürmeli.
    ad: "suggestion — reality-check boşaltsa bile tavsiye kaybolmaz",
    kaynak: "route.ts:1382-1389 (Cycle 3, S9 stub regresyonu)",
    metin: "Bir sonraki round'da yanındakiyle senkron gir, tek başına açılma.",
    kind: "suggestion", lang: "tr", map: "Haven", agent: "Sova",
    body: { killerInfo: "killed by omen with phantom" },
    roundHistory: [
      { round_index: 1, died: true, death_position: "A Long", position_confidence: "high" },
      { round_index: 2, died: true, death_position: "A Long", position_confidence: "high" },
    ],
  },
  {
    // OCR VARYANTI: masaüstünün gönderdiği konum tabloda OLMASA BİLE korunur
    // (2026-07-24 Fracture felaketi: "a main" tabloda yoktu → silindi).
    // factGround.deathLocation strip'e muafiyet verir — zincir bunu taşımalı.
    ad: "OCR'ın gönderdiği konum tabloda olmasa da SİLİNMEZ",
    kaynak: "canlı regresyon 2026-07-24 (Fracture, 'a hail')",
    metin: "A Hail'de tek kaldın ve çapraz ateşte düştün.",
    kind: "death", lang: "tr", map: "Fracture", agent: "Breach",
    body: { killerInfo: "killed by neon with vandal" },
    ctx: { deathLocation: "A Hail" },
    korunmali: ["A Hail"],
  },
  {
    // OLCUM-ARACI-08: fixCallout halkası ZİNCİRDE (route 1824-1848'in DIŞ halkası).
    // Eski elle kopya bu halkayı HİÇ içermiyordu → B10 sıra testi onu ölçemezdi.
    // Pozitif vaka halkanın GERÇEKTEN bağlı olduğunun kanıtı: canlı-test #10 S5
    // ("a lamps" verilmişken model aynı cevapta "Lambs" yazdı).
    ad: "fixCallout zincirde — verilen callout'un bozuk varyantı düzelir (Lambs→Lamps)",
    kaynak: "canlı-test #10 S5 (scripts/test-coach-meta.ts canlı fixture'ı)",
    metin: "A Lamps'ta öldün; Lambs gibi dar köşede bekleme.",
    kind: "death", lang: "tr", map: "Lotus", agent: "Omen",
    body: { died: true, killerInfo: "killed by jett with vandal", deathLocation: "a lamps" },
    ctx: { deathLocation: "a lamps" },
    korunmali: ["Lamps gibi"],
    silinmeli: ["Lambs"],
  },
  {
    // 9355dec notu (B1 sınır savunması): Levenshtein plant↔plaza=2 → supplied
    // "a plaza" iken callout-düzeltici koç terimini callout'a ÇEVİRMEMELİ.
    ad: "fixCallout koç terimini bozmaz — 'Plant sonrası' + supplied 'a plaza'",
    kaynak: "9355dec / lib/coach-text.ts PROTECTED_MAP_NAMES notu",
    metin: "Plant sonrası uzak açıya çekil.",
    kind: "suggestion", lang: "tr", map: "Pearl", agent: "Omen",
    body: { died: true, killerInfo: "killed by jett with vandal", deathLocation: "a plaza" },
    ctx: { deathLocation: "a plaza" },
    korunmali: ["Plant sonrası"],
    silinmeli: ["Plaza sonrası"],
  },
  {
    // Aynı sınıfın ikinci biçimi: post↔plat=2 (Haven "plat").
    ad: "fixCallout koç terimini bozmaz — 'Post-plant'te' + supplied 'plat'",
    kaynak: "9355dec / lib/coach-text.ts PROTECTED_MAP_NAMES notu",
    metin: "Post-plant'te çapraz açı tut.",
    kind: "death", lang: "tr", map: "Haven", agent: "Omen",
    body: { died: true, killerInfo: "killed by jett with vandal", deathLocation: "plat" },
    ctx: { deathLocation: "plat" },
    korunmali: ["Post-plant'te"],
    silinmeli: ["Plat-plant"],
  },
];

console.log("\n══════ ZİNCİR SIRA TESTİ — realityCheck → cleanCoachText → enforceAgentKit → clampWords ══════");

for (const v of KORPUS) {
  const out = zincir(v);
  console.log(`\n[${v.ad}]`);
  console.log(`  kaynak: ${v.kaynak}`);
  console.log(`  ÖNCE : ${v.metin}`);
  console.log(`  SONRA: ${out}`);

  // 1) HER vakada: zincir metni tamamen yutmamalı (katman-çelişkisinin en sert biçimi).
  t("boş değil", out.trim().length > 0, `→ "${out}"`);

  // 2) Korunması gereken parçalar (meşru koçluk bilgisi silinmemeli).
  for (const k of v.korunmali || []) {
    t(`korunmalı: "${k}"`, out.includes(k), `→ "${out}"`);
  }

  // 3) Silinmesi gereken parçalar (yasaklı/uydurma ifade sızmamalı).
  for (const s of v.silinmeli || []) {
    t(`silinmeli: "${s}"`, !out.toLowerCase().includes(s.toLowerCase()), `→ "${out}"`);
  }
}

// ── Zincir-seviyesi genel sözleşmeler ───────────────────────────────────────
console.log("\n[GENEL] kapak (clampToSentence) kelime ortasından kesmez, cümle sınırında biter");
{
  // DA kapağını (VISION_DEATH_CAP, B03 inceleme: 350 → 400) aşan metin: kelime ortasından kesilmemeli.
  const uzun = "Ascent haritasında " + "A Main'de geniş açıyla peek atıp trade alamadan düştün. ".repeat(12);
  const out = zincir({
    ad: "uzun", kaynak: "sentetik uzunluk sınavı", metin: uzun,
    kind: "death", lang: "tr", map: "Ascent", agent: "Jett",
    body: { killerInfo: "killed by sova with guardian" }, ctx: { deathLocation: "A Main" },
  });
  t(`DA kapağını (${VISION_DEATH_CAP}) aşmaz`, out.length <= VISION_DEATH_CAP, `len=${out.length}`);
  // Kelime sınırında kesildiyse sonu boşluk/kırık-kelime olmaz (clampWords trim eder).
  t("sonu kırık boşlukla bitmez", out === out.trim(), `→ "${out.slice(-30)}"`);
  // TR-KALAN-08: kapak ateşlese de alan TAM CÜMLE ile biter (eski clampWords 346 kr
  // "…trade alamadan" gibi kesik bırakıyordu).
  t("noktalama ile biter (cümle-sınırlı kapak)", /[.!?…]["'”’)\]]*$/.test(out), `→ "${out.slice(-30)}"`);
}

// ── CÜMLE-SINIRLI KAPAK (TR-KALAN-08, 2026-09-23) ───────────────────────────
// Fixture'lar scripts/eval-out korpusundaki GERÇEK süzülmüş (kapak-öncesi) metinler.
console.log("\n[TR-KALAN-08] clampToSentence — monoton sözleşme");
{
  const TERM = /[.!?…]["'”’)\]]*$/;
  // r2-b EA[1] (cycletr-cards): ham 206 → süzgeç sonrası 212 kr. 180 kapağında
  // clampWords "…böylece Yoru'nun tek" diye kesiyordu (HEAD replay kanıtı).
  const r2b = "Plant sonrası B Generator köşesini çapraz tutacak birini al ya da Jett smoke ile site içine girip kutu arkası ya da duvar kenarı gibi kapalı bir açıya geç, böylece Yoru'nun tek açılı temizlemesini zorlaştırırsın.";
  t("kırpılmayan metin bayt-aynı (kapak 240)", clampToSentence(r2b, VISION_ENEMY_ITEM_CAP) === r2b);
  t("EA kapağı 240 (ölçülen TR tavanı 212 kesilmez)", VISION_ENEMY_ITEM_CAP === 240 && r2b.length <= VISION_ENEMY_ITEM_CAP);
  t("NR kapağı 350 (değişmedi); DA kapağı 400 (B03 inceleme, ölçülen tavan)", VISION_TEXT_CAP === 350 && VISION_DEATH_CAP === 400);
  // 180'e zorlanınca: tek sınır virgül ("geç, böylece") → virgül sınır DEĞİL ve nokta
  // uydurulmaz → çıktı BUGÜNKÜ clampWords'e eşit (asla bugünden kötü değil).
  t("r2-b @180: sınır yok → clampWords'e eşit (monoton)", clampToSentence(r2b, 180) === clampWords(r2b, 180),
    `→ "${clampToSentence(r2b, 180).slice(-40)}"`);
  // Doğrulayıcının 180 kapağında "SİLİNİYOR" dediği 3 madde: artık asla boş değil.
  const nonEmpty: [string, string][] = [
    ["know-d", "Raze'in patlayıcı util'leri A Site'ın sıkışık açılarında etkili, A Garden ya da CT eksenini bir ekip arkadaşıyla crossfire olarak tut veya molly ya da flash ile alanı daraltıp cevap ver."],
    ["E7", "Do not retake or hold the planted spike alone from the open back angle — have your teammate anchor the close defuse lane so you can trade or use Viper molly/smoke to block that sightline."],
    ["E16", "Against Raze on A, stop holding a fixed right-side angle solo and either swap to an off-angle toward Lamps or fall back behind a Brimstone smoke so she can't re-peek you for a clean duel."],
  ];
  for (const [id, x] of nonEmpty) {
    const o = clampToSentence(x, 180);
    t(`${id} @180 boş dönmez; clampWords'e eşit ya da girdinin öneki`,
      o.trim().length > 0 && (o === clampWords(x, 180) || x.startsWith(o)), `→ "${o}"`);
  }
  // ";" yan-cümle sınırı: M1-R9 EA[1] (cycleab-base) — yarım "…seni tek" yerine tam yan-cümle.
  const r9 = "Bir oyuncu kadrosundan Jett'e karşı op veya uzun hat açan birini koyduysa, onun görüş hattını smoke ile kapatıp farklı bir açıdan çık; yoksa takımınla crossfire kur ve seni tek açıdan tutmalarını engelle.";
  const r9o = clampToSentence(r9, 180);
  t("';' sınırı: yan-cümle bütün kalır, ayraç atılır, nokta UYDURULMAZ",
    r9o === "Bir oyuncu kadrosundan Jett'e karşı op veya uzun hat açan birini koyduysa, onun görüş hattını smoke ile kapatıp farklı bir açıdan çık", `→ "${r9o}"`);
  // Sıra sayısı "3." cümle sonu DEĞİL (eski yama "…aynı açıya 3." üretiyordu).
  const ord = "Bu round A Tree'yi bırak, Heaven veya Generator'a çekil ve orada off-angle ile bekle — aynı açıya 3. kez düşme, rotasyonla pozisyonu değiştir.";
  for (const cap of [120, 125, 138]) {
    const o = clampToSentence(ord, cap);
    t(`'3.' ile bitmez (kapak ${cap})`, !/3\.$/.test(o), `→ "${o}"`);
  }
  // Virgül sınır DEĞİL: "X değil, Y kullan" karşıtlığı virgülden kesilip "değil." olmaz.
  const neg = "Mid'den execute başlat ve dash'i ilk temasta değil, util patladıktan sonra kullan.";
  t("'…değil, … kullan.' virgülden kesilmez", !/değil\.?$/.test(clampToSentence(neg, 60)), `→ "${clampToSentence(neg, 60)}"`);
  // Kısaltma noktası cümle sonu değil.
  const abbr = "Smoke, flash vb. util'i takımla senkron kullanıp site'a birlikte gir ve trade mesafesini koru ki tek tek düşmeyesin.";
  t("'vb.' ile bitmez", !/vb\.$/.test(clampToSentence(abbr, 60)), `→ "${clampToSentence(abbr, 60)}"`);
  // B03 inceleme: "e.g." / "ör." kısaltması ve KAPANMAMIŞ parantez içindeki nokta/ayraç
  // cümle sonu değil (HEAD: "…first, e.g." / "…öne sür (ör." / "…util kullan (Sova oku").
  // Beklenen: kısaltma/parantez sınırı atlanır → daha öndeki geçerli sınır ya da (taban
  // tutmazsa) bugünkü clampWords çıktısı — monoton sözleşme korunur.
  const eg = "Do not peek the long angle alone and wait for your team, next round use utility first, e.g. a Sova dart or a Skye dog, before you swing wide on A Main.";
  const ego = clampToSentence(eg, 110);
  t("'e.g.' ile bitmez (kapak 110) ve clampWords'e eşit", !/e\.g\.$/.test(ego) && ego === clampWords(eg, 110), `→ "${ego}"`);
  const orp = "Tek başına açıya çıkma, bir sonraki round geniş açıyla peek atmadan önce bilgi için öne sür (ör. Sova oku ya da Skye köpeği gönder) ve sonra gir.";
  const orpo = clampToSentence(orp, 110);
  t("'(ör.' ile bitmez — kapanmamış parantez içi nokta sınır değil (kapak 110)", !/\(ör\.$/.test(orpo) && orpo === clampWords(orp, 110), `→ "${orpo}"`);
  const semi = "Tek başına açıya çıkma, bir sonraki round geniş açıyla peek atmadan önce bilgi için util kullan (Sova oku; Skye köpeği ya da Fade kuzgunu) ve sonra gir.";
  const semio = clampToSentence(semi, 120);
  t("parantez İÇİNDEKİ ';' yan-cümle sınırı değil (kapak 120)", !/\(Sova oku$/.test(semio) && semio === clampWords(semi, 120), `→ "${semio}"`);
  // Negatif: kapalı parantezden SONRAKİ gerçek cümle sonu hâlâ sınır.
  const closed = "Bir sonraki round bilgi için öne sür (ör. Sova oku) ve takımını bekle. Sonra geniş açıyla peek at ve trade mesafesini koru ki tek düşmeyesin.";
  const closedo = clampToSentence(closed, 100);
  t("kapanmış parantezden sonraki nokta sınır kalır", closedo === "Bir sonraki round bilgi için öne sür (ör. Sova oku) ve takımını bekle.", `→ "${closedo}"`);
  // DA 350 GERÇEK ateşleme biçimi (cyclereal-r3 M1-R18, etiket soyulmuş hâli uzatıldı).
  const da = "Mid Link'te aynı açık açıda durup savunmayı tek bir hatta tutmuşsun; geniş savunma açısı tutma pozisyonda bir düşman olarak orada beklerken rakip seni öldürdü — Heaven ya da Market rotasını kontrol eden takım seni o hatta bekliyor. Bir sonraki round Mid Link'te sabit bekleyip aynı açıyı tutma, pozisyonu değiştirip Heaven veya Catwalk'i görecek off-angle al ve bu açının bir sonraki round da okunmasını engelle.";
  const dao = clampToSentence(da, 350);
  t("kapak 350 ateşleyince TAM cümle ile biter (clampToSentence birim sözleşmesi)", TERM.test(dao) && dao.length <= 350 && da.startsWith(dao), `→ "…${dao.slice(-40)}"`);
  // Sarkan bağlaç (sınır yoksa): yalnız bağlaç atılır, nokta KONMAZ.
  const dang = "Yanına birini çek ve takım util'ini bekle sonra birlikte gir ve fazladan uzatma metni buraya kadar";
  t("sarkan bağlaç atılır, nokta uydurulmaz",
    clampToSentence(dang, 66) === "Yanına birini çek ve takım util'ini bekle sonra birlikte gir",
    `→ "${clampToSentence(dang, 66)}"`);
}

// ── AJAN-ADI KİLİDİ zincirde İLK halka (TR-KALAN-09) ───────────────────────
console.log("\n[TR-KALAN-09] bozuk ajan adı realityCheck'ten ÖNCE kanonikleşir");
{
  const fg = buildFactGround({}, {});   // killerInfo YOK → hasKiller=false
  const direct = realityCheck(enforceAgentNames("Rejyna seni vurdu, açıyı tut.", ["Jett", "Reyna"]), [], fg, "death", "tr");
  t("realityCheck(enforceAgentNames('Rejyna seni vurdu…')) → katil-guard Reyna'yı görür",
    direct.text === "Bir düşman seni vurdu, açıyı tut.", `→ "${direct.text}"`);
  const out = zincir({
    ad: "rejyna", kaynak: "HEAD trace (TR-KALAN-09)", metin: "Rejyna seni vurdu, açıyı tut.",
    kind: "death", lang: "tr", map: "Ascent", agent: "Sage",
    body: { died: true, enemyComp: ["Jett", "Reyna"] },
  });
  t("zincir: uydurma katil iddiası kullanıcıya GİTMEZ", !/Rejyna|Reyna/.test(out) && out.includes("Bir düşman seni vurdu"), `→ "${out}"`);
  const ea = finalizeVisionFeedback(
    { deathAnalysis: "Açıyı erken verdin.", enemyAnalysis: ["Eğer Jett varsa köşe dönüşlerinde dash bekle, Reına varsa agresif girişlerde körlük ya da sersemletmeyle önce onu dışarı çıkar."], nextRoundSuggestion: "Reğu varsa sersem sonrası peek at." },
    { factGround: buildFactGround({ died: true, killerInfo: "killed by jett with vandal" }, {}), lang: "tr", map: "Ascent", agent: "Skye", enemyComp: ["Jett", "Reyna"] },
  );
  t("EA: 'Reına varsa' → 'Reyna varsa' (koşullu tavsiye korunur)", !!ea.enemyAnalysis[0]?.includes("Reyna varsa agresif"), `→ ${JSON.stringify(ea.enemyAnalysis)}`);
  t("NR: 'Reğu varsa' → 'Reyna varsa'", ea.nextRoundSuggestion.startsWith("Reyna varsa"), `→ "${ea.nextRoundSuggestion}"`);
}

// ── TANI ETİKETİ yalnız deathAnalysis'ten soyulur (TR-KALAN-07 bağlaması) ──
console.log("\n[TR-KALAN-07] deathAnalysis rapor etiketiyle açılmaz");
{
  const da = zincir({
    ad: "etiket", kaynak: "HEAD replay (cycleab-base M1-R9)", metin: "En kritik neden: savunmada aynı pozisyonda kaldın.",
    kind: "death", lang: "tr", map: "Ascent", agent: "Jett", body: { died: true, killerInfo: "killed by jett with vandal" },
  });
  t("'En kritik neden:' → 'Savunmada aynı pozisyonda kaldın.'", da === "Savunmada aynı pozisyonda kaldın.", `→ "${da}"`);
  const kb = zincir({
    ad: "kb-başlık", kaynak: "HEAD replay (M1-R3b)", metin: "En kritik kök: okunabilirlik sızıntısı — B site'te açıkta kaldın ve takım util'ini beklemeden girdin.",
    kind: "death", lang: "tr", map: "Ascent", agent: "Jett", body: { died: true, killerInfo: "killed by jett with vandal", deathLocation: "b site" }, ctx: { deathLocation: "b site" },
  });
  t("KB başlığı parçası da düşer ('okunabilirlik sızıntısı —')", kb.startsWith("B site'te açıkta kaldın"), `→ "${kb}"`);
  const en = zincir({
    ad: "en", kaynak: "cycle3 EN korpusu", metin: "Root cause: you held the same angle and got punished.",
    kind: "death", lang: "en", map: "Ascent", agent: "Jett", body: { died: true, killerInfo: "killed by jett with vandal" },
  });
  t("EN 'Root cause:' soyulur", en.startsWith("You held the same angle"), `→ "${en}"`);
  const legit = "Bu round'un en kritik anı A girişiydi.";
  const legitOut = zincir({ ad: "meşru", kaynak: "B01 negatif fixture", metin: legit, kind: "death", lang: "tr", map: "Ascent", agent: "Jett", body: { died: true, killerInfo: "killed by jett with vandal" } });
  t("cümle içi meşru 'en kritik anı' dokunulmaz", legitOut.includes("en kritik anı"), `→ "${legitOut}"`);
}

// ── BOŞ-GUARD: süzgeç DA'yı boşaltırsa HAM metin DÖNMEZ (CANLI-TEST-07) ─────
console.log("\n[CANLI-TEST-07] süzülüp boşalan deathAnalysis → yapısal hata, ham metin yok");
{
  const fg = buildFactGround({}, {});
  for (const raw of ["(41 HP)", "41 HP ile.", "Ölüm yeri OCR verisinde yok."]) {
    const o = finalizeVisionFeedback({ deathAnalysis: raw, enemyAnalysis: [], nextRoundSuggestion: "Açıyı tut." }, { factGround: fg, lang: "tr" });
    t(`"${raw}" → deathAnalysis "" (ham/tek-nokta DEĞİL)`, o.deathAnalysis === "", `→ "${o.deathAnalysis}"`);
    const f = visionOutputFailure(o);
    const body = JSON.stringify(f);
    t(`"${raw}" → ai_invalid_shape 502; gövdede kullanıcı metni ve "Analiz yapılamadı." YOK`,
      !!f && f.code === "ai_invalid_shape" && f.status === 502 && !body.includes("Analiz yapılamadı.") && !body.includes("HP") && !body.includes("OCR"),
      `→ ${body}`);
  }
  const ok = finalizeVisionFeedback({ deathAnalysis: "Açıyı erken verdin, geri çekil.", enemyAnalysis: [], nextRoundSuggestion: "Açıyı tut." }, { factGround: fg, lang: "tr" });
  t("normal deathAnalysis → hata YOK, metin bayt-aynı", visionOutputFailure(ok) === null && ok.deathAnalysis === "Açıyı erken verdin, geri çekil.", `→ "${ok.deathAnalysis}"`);
}

// ── BOŞ-GUARD EA maddesi ve NR'ye de (B03 inceleme, CANLI-TEST-07 sınıfı) ─────
// HEAD: DA hasCoachContent ile korunuyordu ama EA süzgeci `trim().length > 0`, NR'de
// hiç kontrol yoktu → "41 HP ile." / "Low HP." süzgeçten "." çıkıp overlay'de "› ."
// maddesi ya da tek noktalık plan satırı oluyordu (probe: EA [geçerli, "."], NR ".").
console.log("\n[CANLI-TEST-07/EA+NR] içeriksiz (noktalama-yalnız) EA maddesi düşer, NR '.' olmaz");
{
  const fg = buildFactGround({ died: true, killerInfo: "killed by jett with vandal" }, {});
  const gecerli = "Jett'e karşı smoke'la açıyı kapat.";
  const run = (ea: string[], nr: string, lang: "tr" | "en" = "tr") => finalizeVisionFeedback(
    { deathAnalysis: "Geniş açıda kaldın, geri çekil.", enemyAnalysis: ea, nextRoundSuggestion: nr },
    { factGround: fg, lang, map: "Ascent", agent: "Omen" },
  );
  const a = run([gecerli, "41 HP ile."], "41 HP ile.");
  t("EA ['geçerli','41 HP ile.'] → 1 madde (geçerli)", a.enemyAnalysis.length === 1 && a.enemyAnalysis[0] === gecerli, `→ ${JSON.stringify(a.enemyAnalysis)}`);
  t("NR '41 HP ile.' → '.' DEĞİL (içerik yoksa '')", a.nextRoundSuggestion !== "." && a.nextRoundSuggestion === "", `→ "${a.nextRoundSuggestion}"`);
  const b = run(["41 HP ile.", gecerli], "Açıyı tut.");
  t("EA ['41 HP ile.','geçerli'] → 1 madde; sağlam NR bayt-aynı", b.enemyAnalysis.length === 1 && b.enemyAnalysis[0] === gecerli && b.nextRoundSuggestion === "Açıyı tut.",
    `→ ${JSON.stringify(b.enemyAnalysis)} / "${b.nextRoundSuggestion}"`);
  const en = run(["Hold the angle with a teammate.", "Low HP."], "Low HP.", "en");
  t("EN EA ['…','Low HP.'] → 1 madde; NR 'Low HP.' → ''", en.enemyAnalysis.length === 1 && en.nextRoundSuggestion === "",
    `→ ${JSON.stringify(en.enemyAnalysis)} / "${en.nextRoundSuggestion}"`);
  const only = run(["41 HP ile."], "Açıyı tut.");
  t("EA tek madde içeriksiz → [] (noktalama-yalnız madde gösterilmez)", only.enemyAnalysis.length === 0, `→ ${JSON.stringify(only.enemyAnalysis)}`);
  // Kurtarma yolu (TR-KALAN-26 kararının ruhu): realityCheck'li NR süzgeçte içeriksiz
  // kalırsa ad-düzeltilmiş ham metin AYNI süzgeçten geçer — alan boş kalmaz.
  const rh = [{ round_index: 1, died: true, death_position: "A Main", position_confidence: "high" }];
  const nrRaw = "41 HP ile. Savunma B Site çevresinde tekrar eden girişlerini okuyup aynı tehdidi bekliyor.";
  const rc = realityCheck(nrRaw, rh, buildFactGround({ died: true }, {}), "suggestion", "tr", "Lotus");
  const rec = finalizeVisionFeedback(
    { deathAnalysis: "Geniş açı tuttun.", enemyAnalysis: [gecerli], nextRoundSuggestion: nrRaw },
    { roundHistory: rh, factGround: buildFactGround({ died: true }, {}), lang: "tr", map: "Lotus", agent: "Omen" },
  ).nextRoundSuggestion;
  // W2 inceleme RW1-F1: eski iddia `rec === cleanCoachText(nrRaw)` başta ". " artığı
  // olan çıktıyı BEKLENEN sayıyordu (". Savunma B Site …"). Artık biçim kilitli: artık
  // yok (cleanCoachText tidyHpStripResidue), HP yok. İçerik kararı: TR-KALAN-26 (b)
  // "NR'de ham metin korunur" UYGULANDI (decisions-final) → RC'nin sildiği tekrar
  // iddiası süzülmüş hâliyle GERİ GELİR — bu bilinen sınır (vision-postprocess.ts notu)
  // burada AÇIKÇA kilitlenir ki karar değişirse (seçenek a) test bilinçli güncellensin.
  t("kurtarma: realityCheck yalnız '41 HP ile.' bırakınca NR içerik taşır, '. '/'..' artığı ve HP YOK",
    rc.text === "41 HP ile." && !/^[\s.!?,;:]/.test(rec) && !/\.\./.test(rec) && !/HP/.test(rec)
      && rec === "Savunma B Site çevresinde tekrar eden girişlerini okuyup aynı tehdidi bekliyor.",
    `→ rc="${rc.text}" / "${rec}"`);
  t("bilinen sınır (karar b): RC'nin sildiği 'B Site … tekrar eden' iddiası NR'de geri gelir",
    /tekrar eden/.test(rec) && !/tekrar eden/.test(rc.text), `→ "${rec}"`);
  // EA meta-kalıntılı vaka (inceleyicinin 2. vakası; eskiden [] idi): RC yalnız meta
  // cümlesini bırakıyor, süzgeç onu "" yapıyor → madde kanıtsız → tek madde olduğu için
  // karar (b) "son madde asla düşmez" → süzülmüş ham hâli (meta cümlesi süzgeçte düşer).
  const fgA = buildFactGround({ died: true }, {});
  const eaRun = (ea: string[]) => finalizeVisionFeedback(
    { deathAnalysis: "Geniş açı tuttun.", enemyAnalysis: ea, nextRoundSuggestion: "Açıyı tut." },
    { roundHistory: rh, factGround: fgA, lang: "tr", map: "Lotus", agent: "Omen" },
  ).enemyAnalysis;
  const eaMeta = eaRun(["Savunma B Site çevresinde tekrar eden girişlerini okuyup aynı tehdidi bekliyor. Ölüm yeri OCR verisinde yok."]);
  t("EA meta-kalıntı: tek madde korunur (karar b), OCR meta'sı ve '..' yok",
    eaMeta.length === 1 && !/OCR/.test(eaMeta[0]) && !/\.\./.test(eaMeta[0]) && /bekliyor\.$/.test(eaMeta[0]),
    `→ ${JSON.stringify(eaMeta)}`);
  const eaHp = eaRun(["Savunma B Site çevresinde tekrar eden girişlerini okuyup aynı tehdidi bekliyor. 41 HP ile."]);
  t("EA '… bekliyor. 41 HP ile.' → çift nokta YOK (eskiden 'bekliyor..')",
    eaHp.length === 1 && !/\.\./.test(eaHp[0]) && !/HP/.test(eaHp[0]), `→ ${JSON.stringify(eaHp)}`);
}

// ── KAPAK ÖLÇÜMÜ (W2 inceleme RW1-F3): ateşleyen kapak capHits ile döner ──────────
console.log("\n[RW1-F3] kapak ateşlemesi ölçülebilir (capHits) — davranış aynı");
{
  const fg = buildFactGround({ died: true, killerInfo: "killed by jett with vandal" }, {});
  const kisa = finalizeVisionFeedback({ deathAnalysis: "Geniş açıda kaldın, geri çekil.", enemyAnalysis: ["Açıyı kapat."], nextRoundSuggestion: "Açıyı tut." }, { factGround: fg, lang: "tr" });
  t("kapak ateşlemeyen çıktı → capHits []", Array.isArray(kisa.capHits) && kisa.capHits.length === 0, JSON.stringify(kisa.capHits));
  const uzunDa = ("A Main'de geniş açıda tek başına bekledin ve Jett seni ilk temasta vurdu. ").repeat(5) + "Bir sonraki round siperin dibinde dur.";
  const uzun = finalizeVisionFeedback({ deathAnalysis: uzunDa, enemyAnalysis: [], nextRoundSuggestion: "Açıyı tut." }, { factGround: fg, lang: "tr", map: "Ascent" });
  const h = uzun.capHits.find((x) => x.field === "deathAnalysis");
  t("DA 400'ü aşınca capHits'te deathAnalysis (before>400, after≤400) ve metin kapak altında",
    !!h && h.before > 400 && h.after <= 400 && uzun.deathAnalysis.length === h.after, JSON.stringify(uzun.capHits));
  const routeSrc = fs.readFileSync(path.join(__dirname, "..", "app", "api", "ai", "vision", "route.ts"), "utf8");
  t("route her ateşlemede WARN basar ('vision cap fired')", /for \(const h of post\.capHits\)[\s\S]{0,120}console\.warn\(`\[Aimlo AI\] vision cap fired/.test(routeSrc));
}

// ── DA KAPAĞI 400: düzeltme cümlesi düşmez (B03 inceleme) ────────────────────
// Gerçek korpus: cyclereal-r3 M1-R18 / M1-R24 (ham model çıktısı birebir; gövde
// evals/real-rounds-23.json). 350 kapağında clampToSentence SON cümleyi — şemanın
// "ZORUNLU somut düzeltme"sini — tümüyle siliyordu ("…o hatta bekliyor." ile bitiyordu).
console.log("\n[B03/DA-400] uzun DA'da düzeltme cümlesi korunur");
{
  const real = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "evals", "real-rounds-23.json"), "utf8")) as { id: string; body: Record<string, unknown> }[];
  const raws: [string, string][] = [
    ["M1-R18-ascent-jett", "En kritik kök: Mid Link'te aynı açık açıda durup savunmayı tek bir hatta tutmuşsun; def-wide-hold tipi pozisyonda Jett olarak orada beklerken rakip seni öldürdü — Heaven/Market rotasını kontrol eden takım seni o hatta bekliyor. Bir sonraki round Mid Link'te sabit bekleyip aynı açıyı tutma, pozisyonu değiştirip Heaven veya Catwalk'i görecek off-angle al. "],
    ["M1-R24-ascent-jett", "Kök neden: B site'te tekrar eden aynı açıya gidiyorsun; son 20 round'da hep öldün ve son üç round'da yine B site'de düşmüşsün — savunmada aynı açıyı tekrar tutmak okunabilirlik veriyor, rakip o açıyı önceden nişan alıyor; o açıda bekleyen olursa seni trade ile değil direkt öldürürsün. Bir sonraki round orada sabit bekleme yerine pozisyona hareketli kal veya farklı off-angle al ki aynı açıya nişanlanmasınlar. "],
  ];
  for (const [id, raw] of raws) {
    const b = real.find((x) => x.id === id)!.body;
    const ctx: Record<string, unknown> = typeof b.deathLocation === "string" ? { deathLocation: b.deathLocation } : {};
    const o = finalizeVisionFeedback(
      { deathAnalysis: raw, enemyAnalysis: [], nextRoundSuggestion: "Açıyı tut." },
      {
        roundHistory: b.roundHistory as Record<string, unknown>[], factGround: buildFactGround(b, ctx), lang: "tr",
        map: String(b.map), agent: String(b.agent), suppliedLoc: typeof b.deathLocation === "string" ? b.deathLocation : "",
      },
    ).deathAnalysis;
    t(`${id}: düzeltme cümlesi ('Bir sonraki round …') korunur, tam cümleyle biter, ≤ ${VISION_DEATH_CAP}`,
      o.includes("Bir sonraki round") && /[.!?…]$/.test(o) && o.length <= VISION_DEATH_CAP, `→ len=${o.length} "…${o.slice(-60)}"`);
  }
}

// ── REPORT EA kapağı = vision EA kapağı (B03 inceleme) ─────────────────────────
// Vision EA maddesi 240'a kadar üretiliyor (VISION_ENEMY_ITEM_CAP); report route'u aynı
// alanı 200'de SERT kesiyordu (sanitizePromptInput max → kelime ortası). Kesilen hâl
// analyses.raw_result_json.rounds'a yazılıyor ve masaüstü maç geçmişi kartı
// (aimlo-desktop src/App.tsx loadMatches: fdSrc.enemyAnalysis) onu gösteriyor.
console.log("\n[B03/REPORT-EA] report route EA'yı vision kapağıyla keser");
{
  // B05 (OLCUM-ARACI-10): report validateRequest route.ts'ten lib/report-prompt.ts'e
  // taşındı (route + eval ortak) — kilit artık kodun YAŞADIĞI dosyayı okur; route'ta
  // ikinci bir sabit-200 kesici de doğmamalı.
  const routeSrc = fs.readFileSync(path.join(__dirname, "..", "app", "api", "ai", "report", "route.ts"), "utf8");
  const reportLibSrc = fs.readFileSync(path.join(__dirname, "..", "lib", "report-prompt.ts"), "utf8");
  t("report enemyAnalysis → sanitize(s, VISION_ENEMY_ITEM_CAP) (sabit 200 değil)",
    /enemyAnalysis[\s\S]{0,200}?sanitize\(s, VISION_ENEMY_ITEM_CAP\)/.test(reportLibSrc)
      && !/sanitize\(s, 200\)/.test(reportLibSrc) && !/sanitize\(s, 200\)/.test(routeSrc));
  // Davranış: ölçülen TR tavanı (212 kr, cycletr-cards r2-b EA[1]) report kapağında kesilmez.
  const r2b = "Plant sonrası B Generator köşesini çapraz tutacak birini al ya da Jett smoke ile site içine girip kutu arkası ya da duvar kenarı gibi kapalı bir açıya geç, böylece Yoru'nun tek açılı temizlemesini zorlaştırırsın.";
  const cut = (max: number) => sanitizePromptInput(r2b, { max, collapseWhitespace: true });
  t("212 kr gerçek EA maddesi: 200'de kesilirdi, VISION_ENEMY_ITEM_CAP'te bayt-aynı",
    cut(200) !== r2b && cut(VISION_ENEMY_ITEM_CAP) === r2b, `→ 200:"…${cut(200).slice(-25)}"`);
}

// ── TR-KALAN-26 (karar b): kanıtsız EA maddesi düşer, SON madde asla ─────────
console.log("\n[TR-KALAN-26] tümüyle kanıtsız enemyAnalysis maddesi düşer; dizi asla boşalmaz");
{
  // roundHistory'de A/B Site'ta TEKRAR eden ölüm YOK → "tekrar eden" iddiası kanıtsız;
  // realityCheck(suggestion) maddeyi tümüyle boşaltır (eskiden HAM metin geri konuyordu).
  const rh = [{ round_index: 1, died: true, death_position: "A Main", position_confidence: "high" }, { round_index: 2, died: false }];
  const kanitsiz = "Düşman A Site'taki tekrar eden açını okuyup seni orada öldürdü.";
  const kanitsiz2 = "Savunma B Site çevresinde tekrar eden girişlerini okuyup aynı tehdidi bekliyor.";
  const gecerli = "Jett'e karşı smoke'la açıyı kapat.";
  const run = (ea: string[]) => finalizeVisionFeedback(
    { deathAnalysis: "Geniş açı tuttun.", enemyAnalysis: ea, nextRoundSuggestion: "Açıyı tut." },
    { roundHistory: rh, factGround: buildFactGround({ died: true }, {}), lang: "tr", map: "Lotus", agent: "Omen" },
  ).enemyAnalysis;
  const a = run([kanitsiz, gecerli]);
  t("[kanıtsız, geçerli] → 1 madde (geçerli)", a.length === 1 && a[0] === gecerli, `→ ${JSON.stringify(a)}`);
  const b = run([gecerli, kanitsiz]);
  t("[geçerli, kanıtsız] → 1 madde (geçerli)", b.length === 1 && b[0] === gecerli, `→ ${JSON.stringify(b)}`);
  const c = run([kanitsiz]);
  t("[kanıtsız] → 1 madde (son madde korunur, dizi boşalmaz)", c.length === 1, `→ ${JSON.stringify(c)}`);
  const d = run([kanitsiz, kanitsiz2]);
  t("[kanıtsız, kanıtsız] → 1 madde (SON madde)", d.length === 1 && d[0] === kanitsiz2, `→ ${JSON.stringify(d)}`);
  const nr = finalizeVisionFeedback(
    { deathAnalysis: "Geniş açı tuttun.", enemyAnalysis: [gecerli], nextRoundSuggestion: kanitsiz2 },
    { roundHistory: rh, factGround: buildFactGround({ died: true }, {}), lang: "tr", map: "Lotus", agent: "Omen" },
  ).nextRoundSuggestion;
  t("nextRoundSuggestion boşalmaz (karar: ham metin korunur)", nr.length > 0, `→ "${nr}"`);
}

// ── FB05 · F11: callout-yazım kilidi (fixCallout) sıradan kelimeyi ve BAŞKA callout'u çevirmez ──
// HEAD (korpus, bu commit öncesi zincir): S23 "Rakip Cypher…" → "Ramp Cypher…" (Split, "a ramp");
// E3/S18 "Garage/C Link" → "Garage/C Long" (Haven, "c long"); E2 "teleporter/Link" →
// "teleporter/Long" (Bind, "b long"); deney: "Make sure" + b main → "Main sure", "Hold the angle"
// + a hall → "Hall the angle", "Siper kenarında" + a site → "Site kenarında", "Hemen çekil" +
// a heaven → "Heaven çekil". Kilit: fixCallout halkası bunlarda NO-OP (verilen konumla ve
// konumsuz zincir çıktısı BAYT-AYNI); canlı hedef (Lambs→Lamps, Loby→Lobby) korunur.
// NOT: düzeltici burada doğrudan ÇAĞRILMAZ (G2 grep-guard'ı) — halka zincirin kendisinden,
// suppliedLoc'lu ve suppliedLoc'suz iki koşunun farkıyla ölçülür (başka her halka aynı).
console.log("\n[FB05 · F11] fixCallout: sıradan kelime / başka callout değişmez; bozuk verilen callout düzelir");
{
  type K = "death" | "suggestion";
  const run = (metin: string, kind: K, lang: "tr" | "en", map: string, loc: string) => {
    const fb = kind === "death"
      ? { deathAnalysis: metin, enemyAnalysis: [], nextRoundSuggestion: "" }
      : { deathAnalysis: "", enemyAnalysis: [], nextRoundSuggestion: metin };
    const opts = {
      factGround: buildFactGround({ died: true, killerInfo: "killed by jett with vandal", deathLocation: loc }, { deathLocation: loc }),
      lang, map, agent: "Omen", suppliedLoc: loc,
    };
    const pick = (o: ReturnType<typeof finalizeVisionFeedback>) => (kind === "death" ? o.deathAnalysis : o.nextRoundSuggestion);
    return { withLoc: pick(finalizeVisionFeedback(fb, opts)), noLoc: pick(finalizeVisionFeedback(fb, { ...opts, suppliedLoc: "" })) };
  };
  const noop: [string, string, K, "tr" | "en", string, string, string][] = [
    // [ad, ham metin (korpus raw birebir), alan, dil, harita, deathLocation, korunması gereken parça]
    ["S23 cycleb06-pre-syn-rp/cycler5syn DA (Split, a ramp)",
      "Rakip Cypher A Ramp açısını tekrar tekrar tutuyor ve bu round da seni sheriff'le orada vurdu — aynı açıda 4 round üst üste ölmüşsün, o köşeyi smoke veya takım flash'ı olmadan tek başına deneme. ",
      "death", "tr", "Split", "a ramp", "Rakip Cypher"],
    ["E3 cycle3 NR (Haven, c long)",
      "Avoid solo wide peeks into C Long on the next round; either stack a two-man entry through Garage/C Link into C or have a teammate flash/push with you so Cypher can't take a clean Ghost duel. ",
      "suggestion", "en", "Haven", "c long", "Garage/C Link"],
    ["S18 cyclefix1 EA1 (Haven, c long)",
      "C Link veya Plat'ten bir takım arkadaşıyla crossfire kur; Sova uzak açıya tek başına ateş edemezse trade gelir. ",
      "suggestion", "tr", "Haven", "c long", "C Link veya Plat"],
    ["E2 cyclew3-cand1-en NR (Bind, b long)",
      "Give up the long B sightline this round and instead use your camera to watch the teleporter/Link and place a tel on the flank path, then smoke the B Long lane to cut the Operator's view so your team can hold tighter crossfires. ",
      "suggestion", "en", "Bind", "b long", "teleporter/Link"],
    ["deney 'Make sure' + b main", "Make sure you clear Market first.", "suggestion", "en", "Ascent", "b main", "Make sure"],
    ["deney 'Hold the angle' + a hall", "Hold the angle with a teammate next round.", "suggestion", "en", "Fracture", "a hall", "Hold the angle"],
    ["deney 'Siper kenarında' + a site", "Siper kenarında kal, açıyı tut.", "suggestion", "tr", "Ascent", "a site", "Siper kenarında"],
    ["deney 'Hemen çekil' + a heaven", "A Heaven'da öldün. Hemen çekil ve takımı bekle.", "death", "tr", "Bind", "a heaven", "Hemen çekil"],
  ];
  for (const [ad, metin, kind, lang, map, loc, keep] of noop) {
    const { withLoc, noLoc } = run(metin, kind, lang, map, loc);
    t(`${ad}: fixCallout NO-OP ve "${keep}" korunur`, withLoc === noLoc && withLoc.includes(keep), `→ "${withLoc}"`);
  }
  // Canlı hedef (S5) korunur: verilen callout'un BOZUK yakın varyantı düzelir.
  const lamps = run("A Lamps'ta öldün; Lambs gibi dar köşede bekleme.", "death", "tr", "Bind", "a lamps");
  t("Lambs→Lamps korunur (halka hâlâ bağlı)", lamps.withLoc.includes("Lamps gibi") && lamps.noLoc.includes("Lambs gibi"), `→ "${lamps.withLoc}"`);
  const lobby = run("A Loby'de tek başına kaldın ve öldün.", "death", "tr", "Ascent", "a lobby");
  t("Loby→Lobby korunur", lobby.withLoc.includes("A Lobby'de") && lobby.noLoc.includes("A Loby'de"), `→ "${lobby.withLoc}"`);
}

// ── FB05 · F14: ölçülmüş konum varken "bu round <başka callout>'da öldün" (4 gerçek raw) ──
// Kaynak: scripts/eval-out (gitignore) örneklerinin `raw.nextRoundSuggestion` alanları BİREBİR;
// gövdeler evals/real-rounds-23.json. HEAD zinciri (bu commit öncesi) nihai metinleri:
//   r2b  M1-R7  (ölçülen b site)     "…; bu round B Main'de öldün, sonraki round …"
//   base M1-R8  (ölçülen mid bottom) "Bu round B Main'de ve diğerlerde de sık öldün — …"
//   r4c  M1-R8  (ölçülen mid bottom) "Bu round B Main'de 2, genel olarak son 6 round'da hep öldün; …"
//   luna-default M1-R12 (ölçülen a site) "…; B Main'de öldüğün için bu round Market…" (silme
//   "2 kez" ile geçmiş çapasını da siliyordu → R5'in konumu bu round'a yapışıyordu).
console.log("\n[FB05 · F14] 4 gerçek raw: bu round'un konum iddiası ölçülen konumla çelişmez");
{
  const real = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "evals", "real-rounds-23.json"), "utf8")) as { id: string; body: Record<string, unknown> }[];
  const fixtures: [string, string, string, (o: string) => boolean][] = [
    ["r2b M1-R7 NR", "M1-R7-ascent-jett",
      "B Site'i tek başına aynı açıdan tutma; bu round B Main'de öldün, sonraki round bir arkadaşını Market/Heaven tarafına koyup sen farklı bir açıdan rotate ederek crossfire oluştur — çünkü rakip artık tek açıyı okuyor.",
      (o) => o.includes("bu round B Site'ta öldün, sonraki round") && !/B Main'de öldün/.test(o)],
    ["base M1-R8 NR", "M1-R8-ascent-jett",
      "Bu round B Main'de 2 kez ve diğerlerde de sık öldün — bir sonraki savunmada Mid Bottom'da aynı açıyı tamamen bırak, off-angle al veya bir arkadaşla crossfire kur ki tek açıdan yenilme.",
      (o) => o.startsWith("Bu round Mid Bottom'da ve diğerlerde de sık öldün — bir sonraki savunmada") && !/B Main/.test(o)],
    ["r4c M1-R8 NR", "M1-R8-ascent-jett",
      "Bu round B Main'de 2, genel olarak son 6 round'da hep öldün; savunmada mid bottom/özellikle B yönlerine tek başına açı verme — birini yanına çek, crossfire kur ve pozisyonunu yüksekliğe veya zıt köşeye değiştir.",
      (o) => o.startsWith("Bu round Mid Bottom'da 2, genel olarak son 6 round'da hep öldün;") && !/B Main/.test(o)],
    ["luna-default M1-R12 NR", "M1-R12-ascent-jett",
      "B Site'a tek başına yapışma; B Main'de 2 kez öldüğün için bu round Market tarafında takımınla crossfire kur ve ilk temastan sonra dash'le geri çekil. Böylece B Main baskısını siper arkasından karşılar, site'ı tek açıya bırakmazsın.",
      (o) => o.includes("R5'te B Main'de öldüğün için bu round Market tarafında takımınla crossfire kur")],
  ];
  for (const [ad, id, raw, ok] of fixtures) {
    const b = real.find((x) => x.id === id)!.body;
    const vb = buildVisionContext(b as VisionPromptBody, "tr");
    const o = finalizeVisionFeedback(
      { deathAnalysis: "Açıyı erken verdin.", enemyAnalysis: [], nextRoundSuggestion: raw },
      visionPostprocessOpts(b as VisionPromptBody, "tr", vb.factGround),
    ).nextRoundSuggestion;
    t(`${ad} (ölçülen ${String(b.deathLocation)}): konum iddiası ölçülenle/geçmiş çapasıyla tutarlı`, ok(o), `→ "${o}"`);
  }
}

// ── TEK KAYNAK KİLİDİ (OLCUM-ARACI-08, 2026-09-23) ──────────────────────────
// Vision son-işlem zinciri DÖRT yerde elle kopyalanmıştı (route, eval-vision,
// test-pipeline-chain, replay-tr) ve her yeni halka yalnız bazı kopyalara
// ulaşıyordu. Bu kilit, zincirin yeniden ELLE kurulmasını yakalar:
//   G1 — kapak çağrısının içinde DOĞRUDAN enforceAgentKit çağrısı (elle kopyanın
//        imzası) scripts/ ve app/ altında HİÇBİR dosyada yok.
//   G2 — hiçbir dosya hem callout düzelticisini (enforceSuppliedCallout) hem bir
//        uzunluk kapağını (clampWords / clampToSentence) ÇAĞIRMIYOR: ikisinin
//        birlikteliği vision zincirinin imzasıdır. Düzelticiyi İZOLE birim-test
//        eden dosyalar (test-coach-meta, test-tr-guards) kapak çağırmaz → meşru.
//   G3 — dört tüketici finalizeVisionFeedback'i ÇAĞIRIYOR.
// Literaller birleştirilerek kurulur ve bu dosyanın yorumları çağrı biçimi
// (ad + parantez) içermez → dosya kendi kendini eşlemez, ama kendisi de (eski
// dört kopyadan biri) taranmaya DEVAM eder.
// B03 inceleme: G1 eskiden yalnız "clampWords + enforceAgentKit" literalini arıyordu;
// B03/2'den sonra gerçek zincir imzası clampToSentence ile → yeni lib'den elle
// kopyalanan zincir G1'e de G2'ye de (fixCallout unutulunca) takılmıyordu. Artık iki
// kapak da ve aradaki boşluk tek regex'le; lib/ de taranır — yalnız zincirlerin İKİ
// TANIMI izinli, TAM olarak birer kez: lib/vision-postprocess.ts (vision zinciri,
// clampToSentence) ve lib/coach-text.ts finalizeCoachText (report/ask zinciri,
// clampWords). Başka dosyada ya da tanım dosyasında İKİNCİ bir kopya → kırmızı.
console.log("\n[TEK KAYNAK] vision son-işlem zinciri elle kopyalanmıyor (grep-guard)");
{
  const root = path.join(__dirname, "..");
  const walk = (d: string): string[] =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) return e.name === "node_modules" || e.name === "eval-out" ? [] : walk(p);
      return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
    });
  const files = [...walk(path.join(root, "scripts")), ...walk(path.join(root, "app")), ...walk(path.join(root, "lib"))];
  const chainCopy = new RegExp("clamp(?:Words|ToSentence)\\(\\s*" + "enforceAgent" + "Kit\\(", "g");
  // Tanım dosyaları ve izinli imza (tam 1 kez): kapak türü de sabit — vision'da
  // clampWords'e geri dönülmesi ya da finalizeCoachText'in kapağının değişmesi fark edilir.
  const CHAIN_DEFS: Record<string, string> = {
    [path.join("lib", "vision-postprocess.ts")]: "clampToSentence",
    [path.join("lib", "coach-text.ts")]: "clampWords",
  };
  const fixCall = "enforceSupplied" + "Callout(";
  const g1: string[] = [], g2: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const rel = path.relative(root, f);
    const hits = [...src.matchAll(chainCopy)].map((m) => m[0].slice(0, m[0].indexOf("(")));
    const def = CHAIN_DEFS[rel];
    if (def ? !(hits.length === 1 && hits[0] === def) : hits.length > 0) g1.push(`${rel} [${hits.join(",") || "tanım yok"}]`);
    if (!def && src.includes(fixCall) && /clamp(?:Words|ToSentence)\(/.test(src)) g2.push(rel);
  }
  t(`G1 elle zincir kopyası yok; iki tanım tam birer kez (${files.length} dosya tarandı)`, g1.length === 0, `→ ${g1.join(", ")}`);
  t("G2 fixCallout + kapak birlikte yalnız zincir tanımlarında", g2.length === 0, `→ ${g2.join(", ")}`);
  for (const rel of ["app/api/ai/vision/route.ts", "scripts/eval-vision.ts", "scripts/replay-tr.ts", "scripts/test-pipeline-chain.ts"]) {
    const src = fs.readFileSync(path.join(root, rel), "utf8");
    t(`G3 ${rel} → finalizeVisionFeedback(`, src.includes("finalizeVision" + "Feedback("));
  }
  // CANLI-TEST-07: route boşalan deathAnalysis için yapısal hata yardımcısını çağırıyor.
  const routeSrc = fs.readFileSync(path.join(root, "app/api/ai/vision/route.ts"), "utf8");
  t("G4 route → visionOutputFailure(post) + errorResponse",
    routeSrc.includes("visionOutput" + "Failure(post)") && /outputFailure\.code, outputFailure\.message, outputFailure\.status/.test(routeSrc));
}

console.log(fail === 0 ? "\n✅ ZİNCİR TESTLERİ GEÇTİ" : `\n❌ ${fail} ZİNCİR TESTİ BAŞARISIZ`);
if (fail > 0) process.exit(1);
