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
 *   → clampWords (350)
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
import { buildFactGround } from "../lib/reality-checker";
import { finalizeVisionFeedback } from "../lib/vision-postprocess";

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
console.log("\n[GENEL] clampWords KELİME sınırında keser (route .slice değil clampWords kullanır)");
{
  // 350'yi aşan tek-cümlelik metin: kelime ortasından kesilmemeli.
  const uzun = "Ascent haritasında " + "A Main'de geniş açıyla peek atıp trade alamadan düştün. ".repeat(12);
  const out = zincir({
    ad: "uzun", kaynak: "sentetik uzunluk sınavı", metin: uzun,
    kind: "death", lang: "tr", map: "Ascent", agent: "Jett",
    body: { killerInfo: "killed by sova with guardian" }, ctx: { deathLocation: "A Main" },
  });
  t("350 karakteri aşmaz", out.length <= 350, `len=${out.length}`);
  // Kelime sınırında kesildiyse sonu boşluk/kırık-kelime olmaz (clampWords trim eder).
  t("sonu kırık boşlukla bitmez", out === out.trim(), `→ "${out.slice(-30)}"`);
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
console.log("\n[TEK KAYNAK] vision son-işlem zinciri elle kopyalanmıyor (grep-guard)");
{
  const root = path.join(__dirname, "..");
  const walk = (d: string): string[] =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) return e.name === "node_modules" || e.name === "eval-out" ? [] : walk(p);
      return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
    });
  const files = [...walk(path.join(root, "scripts")), ...walk(path.join(root, "app"))];
  const chainCopy = "clampWords(" + "enforceAgentKit(";
  const fixCall = "enforceSupplied" + "Callout(";
  const g1: string[] = [], g2: string[] = [];
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const rel = path.relative(root, f);
    if (src.includes(chainCopy)) g1.push(rel);
    if (src.includes(fixCall) && /clamp(?:Words|ToSentence)\(/.test(src)) g2.push(rel);
  }
  t(`G1 elle zincir kopyası yok (${files.length} dosya tarandı)`, g1.length === 0, `→ ${g1.join(", ")}`);
  t("G2 fixCallout + kapak birlikte yalnız lib/vision-postprocess.ts'te", g2.length === 0, `→ ${g2.join(", ")}`);
  for (const rel of ["app/api/ai/vision/route.ts", "scripts/eval-vision.ts", "scripts/replay-tr.ts", "scripts/test-pipeline-chain.ts"]) {
    const src = fs.readFileSync(path.join(root, rel), "utf8");
    t(`G3 ${rel} → finalizeVisionFeedback(`, src.includes("finalizeVision" + "Feedback("));
  }
}

console.log(fail === 0 ? "\n✅ ZİNCİR TESTLERİ GEÇTİ" : `\n❌ ${fail} ZİNCİR TESTİ BAŞARISIZ`);
if (fail > 0) process.exit(1);
