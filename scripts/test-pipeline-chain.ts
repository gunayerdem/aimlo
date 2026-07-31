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
 * ZİNCİR (app/api/ai/vision/route.ts:1356-1389 ile BİREBİR):
 *   realityCheck(text, memory, factGround, kind, lang, map)
 *     └─ içinde: stripForeignCallouts → guardUnprovenFacts → claim-rewrite
 *   → cleanCoachText(lang)
 *     └─ içinde: stripNumericHp → stripHpClaims → plainifyAbilities → TR jargon
 *   → enforceAgentKit(agent)
 *   → clampWords(350)
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
import { realityCheck, buildFactGround } from "../lib/reality-checker";
import { cleanCoachText, clampWords } from "../lib/coach-text";
import { enforceAgentKit } from "../lib/agent-abilities";

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

/** PROD ZİNCİRİ — route.ts:1356-1389'un BİREBİR kopyası (kind'a göre dallanır). */
function zincir(v: Vaka): string {
  const memory = (v.roundHistory || []).map((r) => ({
    round_index: r.round_index,
    died: r.died,
    death_position: r.death_position,
    position_confidence: r.position_confidence,
  }));
  const factGround = buildFactGround(v.body || {}, v.ctx || {});
  const checked = realityCheck(v.metin, memory, factGround, v.kind, v.lang, v.map);

  if (v.kind === "death") {
    // route.ts:1369-1373 — TEMİZLE ÖNCE, empty-guard, SONRA clamp.
    // Empty-guard: cleanCoachText metni tamamen boşaltabilir (yalnız HP
    // etiketinden ibaret cümle) → o zaman reality-check'lenmiş ORİJİNAL korunur.
    const cleaned = cleanCoachText(checked.text, v.lang);
    return clampWords(
      enforceAgentKit(cleaned && cleaned.trim() ? cleaned : checked.text, v.agent),
      350,
    );
  }
  // route.ts:1386-1389 — "suggestion" kind'ı boş dönebilir (S9-sınıfı stub);
  // o durumda MODELİN ORİJİNAL tavsiyesi korunur, sonra temizlenir.
  const safe = checked.text && checked.text.trim() ? checked.text : v.metin;
  return clampWords(enforceAgentKit(cleanCoachText(safe, v.lang), v.agent), 350);
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
    korunmali: ["peek attın"],
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

console.log(fail === 0 ? "\n✅ ZİNCİR TESTLERİ GEÇTİ" : `\n❌ ${fail} ZİNCİR TESTİ BAŞARISIZ`);
if (fail > 0) process.exit(1);
