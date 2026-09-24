/**
 * KATİL-TUTARLILIĞI GUARD'I TESTİ (reality-checker).
 *
 * NEDEN VAR (karşı-denetim, 2026-07-31 gecesi): guard, metindeki YANLIŞ katil
 * adını OCR'ın okuduğu gerçek katille düzeltmek için eklendi. Ama clause sınırı
 * ajan adlarını geçirdiği için, ölüm çekirdeğine giden yolda duran BAŞKA bir
 * ajanı da eziyordu — uydurmayı önleyen katman uydurma üretiyordu:
 *   "Sage duvarını beklerken Cypher seni vurdu" → "Cypher duvarını beklerken..."
 *   "Jett ile dash attın ve Reyna seni vurdu"   → oyuncunun KENDİ ajanı değişiyordu
 * İkincisi, canlı-test #7'de OCR tarafında düzelttiğimiz "ajan dönmesi"nin
 * deterministik ikizi — yani kullanıcının en çok şikâyet ettiği hata sınıfı.
 *
 * Bu test iki şeyi birden kilitler: guard MEŞRU işini yapmaya devam etmeli,
 * ve komşu ajan adlarına DOKUNMAMALI.
 *
 * Koşum: npx tsx scripts/test-killer-guard.ts   (npm test içinde)
 */
import { realityCheck, extractKillerAgent, buildFactGround } from "../lib/reality-checker";
import { buildReportCleaner, validateRequest } from "../lib/report-prompt";
import { finalizeVisionFeedback } from "../lib/vision-postprocess";

let fail = 0;
function t(name: string, ok: boolean, extra = "") {
  console.log(`  ${ok ? "ok " : "FAIL"} ${name}${ok ? "" : " — " + extra}`);
  if (!ok) fail++;
}

/** Vision route'un kurduğu FactGround'un ilgili alt kümesi. */
const ground = (killerAgent: string) =>
  ({ hasKiller: true, killerAgent, hasDeathLocation: true, hasHeadshot: false } as never);

const run = (text: string, killer: string) => realityCheck(text, [] as never, ground(killer), "death", "tr", "Ascent").text;

console.log("\n[1] GUARD MEŞRU İŞİNİ YAPIYOR — yanlış katil düzeltiliyor");
{
  const out = run("Sova seni A Short'ta vurdu.", "Cypher");
  console.log("    SONRA:", out);
  t("yanlış katil düzeltildi", /Cypher seni/.test(out) && !/Sova/.test(out), `→ "${out}"`);

  const out2 = run("Jett B Main'den operator'la seni vurdu.", "Chamber");
  console.log("    SONRA:", out2);
  t("araya kelime girse de düzeltir", /Chamber/.test(out2) && !/Jett/.test(out2), `→ "${out2}"`);

  const out3 = run("Cypher seni A Short'ta vurdu.", "Cypher");
  t("doğru katil DOKUNULMADI", out3.includes("Cypher seni"), `→ "${out3}"`);
}

console.log("\n[2] KOMŞU AJAN EZİLMİYOR — asıl regresyon");
{
  const out = run("Sage duvarını beklerken Cypher seni A Short'ta vurdu.", "Cypher");
  console.log("    SONRA:", out);
  t("Sage korundu", out.includes("Sage duvarını"), `→ "${out}"`);
  t("Cypher tek kez geçiyor", (out.match(/Cypher/g) || []).length === 1, `→ "${out}"`);

  const out2 = run("Jett ile dash attın ve Reyna seni vurdu.", "Reyna");
  console.log("    SONRA:", out2);
  t("oyuncunun KENDİ ajanı korundu", out2.includes("Jett ile dash"), `→ "${out2}"`);
  t("katil doğru kaldı", /Reyna seni/.test(out2), `→ "${out2}"`);
}

console.log("\n[3] KATİL BİLİNMİYORKEN — ad UYDURULMAZ, genelleştirilir");
{
  // Not: burada beklenen davranış "ad korunsun" DEĞİL. killerInfo OCR'da yoksa
  // hangi ajanın öldürdüğü BİLİNMİYOR demektir; ajan adını bırakmak uydurma olur.
  // reality-checker doğru olanı yapıp adı jenerik ifadeye çeviriyor. Bu testin işi
  // o davranışı kilitlemek — katil-tutarlılığı guard'ı bunu bozmamalı.
  const noKiller = realityCheck(
    "Sova seni A Short'ta vurdu.",
    [] as never,
    { hasKiller: false, hasDeathLocation: true } as never,
    "death", "tr", "Ascent",
  ).text;
  console.log("    SONRA:", noKiller);
  t("uydurma ajan adı silindi", !/Sova/i.test(noKiller), `→ "${noKiller}"`);
  t("cümle anlamlı kaldı", /seni A Short'ta vurdu/.test(noKiller), `→ "${noKiller}"`);
}

console.log("\n[4] MİKS KATİLKEN — ad tablosu eksikliği (TR-KALAN-20, 2026-09-23)");
{
  // HEAD probe: knownAgent('miks') → undefined → extractKillerAgent → null →
  // factGround.killerAgent undefined → B83 katil-tutarlılığı Miks'te HİÇ çalışmıyor.
  const got = extractKillerAgent("killed by miks with vandal");
  t("extractKillerAgent('killed by miks with vandal') === 'Miks'", got === "Miks", `→ ${String(got)}`);
  const fg = buildFactGround({ killerInfo: "killed by miks with vandal" }, {});
  t("buildFactGround(...).killerAgent === 'Miks'", fg.killerAgent === "Miks", `→ ${String(fg.killerAgent)}`);
  // Bilinçli davranış değişikliği: guard artık Miks'i gerçek katil olarak görür.
  const out = realityCheck("Jett seni A Short'ta vurdu.", [] as never,
    buildFactGround({ killerInfo: "killed by miks with vandal" }, { deathLocation: "A Short" }),
    "death", "tr", "Ascent").text;
  console.log("    SONRA:", out);
  t("B83 Miks'te çalışıyor (yanlış katil 'Jett' → 'Miks')", /Miks seni/.test(out) && !/Jett/.test(out), `→ "${out}"`);
}

console.log("\n[5] KOŞULLU ROSTER TAVSİYESİ — STEP1 yalnız katil hedge'ini indirir (TR-KALAN-21, 2026-09-23)");
{
  // HEAD: STEP1 disjunction'ı kill-fiili / kurban çapası aramadan "bir düşman"a
  // indiriyordu → koç tavsiyesinin öznesi kayboluyordu.
  const nk = (s: string, lang: "tr" | "en" = "tr") =>
    realityCheck(s, [] as never, { hasKiller: false } as never, "death", lang).text;
  for (const s of [
    "Jett/Reyna varsa agresif girişlerde körlükle önce onu çıkar.",
    "Jett/Reyna'nin hızlı peek'ine trade verebilecek düzen kur.",
    "Eğer Jett varsa köşe dönüşlerinde dash bekle, Jett/Reyna varsa agresif girişlerde körlük ile önce onu dışarı çıkar.",
  ]) {
    const out = nk(s);
    t(`koşullu/genel tavsiye bayt-aynı: "${s.slice(0, 36)}…"`, out === s, `→ "${out}"`);
  }
  // Katil hedge'i (kurban çapası / öldürme fiili) eskisi gibi iner.
  const a = nk("Jett/Reyna seni aynı pozisyonda beklerken o açıdan vurdular.");
  t("kurban çapalı disjunction → 'Bir düşman seni…'", a.startsWith("Bir düşman seni aynı pozisyonda"), `→ "${a}"`);
  const b = nk("Reyna ya da Jett ya da Deadlock seni öldürdü.");
  t("canlı-test 2026-06-29 sınıfı → 'Bir düşman seni öldürdü.'", b === "Bir düşman seni öldürdü.", `→ "${b}"`);
  const c = nk("The Cypher or Jett killed you.", "en");
  t("EN 'The Cypher or Jett killed you.' → 'An enemy killed you.'", c === "An enemy killed you.", `→ "${c}"`);
  // 2. şahıs ölüm yüklemi de katil-hedge imzası (replay: cyclehedge/S14 gerçek raw'ı).
  const d = nk("Hookah'da açıkta dururken Raze ya da Brimstone util'ine yakalanıp öldün.");
  t("'X ya da Y util'ine yakalanıp öldün' hâlâ iner", /bir düşman util'ine yakalanıp öldün/.test(d) && !/Raze|Brimstone/.test(d), `→ "${d}"`);
}

console.log("\n[6] SİLAH OKUNMAMIŞKEN EN aynası — katil silahı uydurulmaz (CANLI-TEST-06, 2026-09-23)");
{
  // HEAD: guardUnprovenFacts'in hasWeapon=false kolu yalnız TR kalıbını tanıyordu →
  // "Jett killed you with an Operator from long range." DEĞİŞMEDEN çıkıyordu.
  const nw = (s: string) => realityCheck(s, [] as never, { hasWeapon: false } as never, "death", "en").text;
  const POS: [string, string][] = [
    ["Jett killed you with an Operator from long range.", "Jett killed you from long range."],
    ["Cypher shot you with a Spectre from the front-right.", "Cypher shot you from the front-right."],
    ["Chamber picked you off with the Operator at B Long.", "Chamber picked you off at B Long."],
    ["Reyna's Vandal shot you before you could react.", "Reyna shot you before you could react."],
  ];
  for (const [src, want] of POS) {
    const out = nw(src);
    t(`silah öbeği düştü: "${src.slice(0, 34)}…"`, out === want, `→ "${out}"`);
  }
  // NEG: oyuncunun KENDİ loadout'u, öğüt, oyuncu-nesnesiz cümle → bayt-aynı.
  for (const s of [
    "You bought a Vandal but lost the duel.",
    "Buy an Operator next round and hold B Long.",
    "With an Operator you can hold that angle.",
    "Jett killed your teammate with a Vandal.",
  ]) {
    const out = nw(s);
    t(`NEG bayt-aynı: "${s.slice(0, 34)}…"`, out === s, `→ "${out}"`);
  }
  const g = "Jett killed you with an Operator from long range.";
  t("hasWeapon:true iken bayt-aynı",
    realityCheck(g, [] as never, { hasWeapon: true } as never, "death", "en").text === g);
}

console.log("\n[7] B02 İNCELEME — katil hedge'i BİTİŞİK yan-cümlede / çoğul fiille (gerçek raw'lar)");
{
  const nk7 = (s: string) => realityCheck(s, [] as never, { hasKiller: false } as never, "death", "tr").text;
  // HEAD (85d1989): ikisi de adları koruyordu (fiil bitişik yan-cümlede / 3. çoğul).
  const a = nk7("Hookah girişinde öldün; Raze/Skye çapraz ateşinden yüzünü açtın.");
  t("cyclesummit/S14: 'Raze/Skye çapraz ateşinden' → 'bir düşman …'", /bir düşman çapraz ateşinden/.test(a) && !/Raze|Skye/.test(a), `→ "${a}"`);
  const b = nk7("Hookah'da nişangâh kaybettin ve Cypher ya da Viper ya da Brimstone üçlüsünün kesişen açılarında kaldın — seni oradan öldürdüler.");
  t("cyclefix1/S14: çoğul 'öldürdüler' imzası → adlar iner", !/Cypher|Viper|Brimstone/.test(b), `→ "${b}"`);
  // NEG: emir/öğüt yan-cümlesi komşu ölüm cümlesine rağmen korunur; 'gibi' örneklemesi korunur.
  for (const s of [
    "Hookah'ta öldün; bir sonraki round Skye/Brimstone'dan smoke iste.",
    "Jett/Reyna gibi duelistler seni erken arar, açıyı dar tut.",
    "Rakipte Skye/Brimstone varsa smoke iste.",
  ]) {
    const out = nk7(s);
    t(`NEG bayt-aynı: "${s.slice(0, 40)}…"`, out === s, `→ "${out}"`);
  }
}

// ── W1 followup #51: katil bilinmiyorken OYUNCUNUN KENDİ ajanı "X olarak" ─────
// Gerçek korpus (cyclereal-r3 M1-R18, oyuncu Jett, killerInfo yok) BİREBİR:
// "…pozisyonda Jett olarak orada beklerken rakip seni öldürdü" → STEP2 "bir düşman
// olarak" bozuğu üretiyordu (1075 örnekte 15 tekil). Muafiyet yalnız okunmuş oyuncu
// ajanı + "olarak"; katil iddiası ve başka ajan eskisi gibi iner.
console.log("\n[#51] oyuncunun kendi ajanı 'X olarak' katil sayılmaz (katil bilinmiyor)");
{
  const fgSelf = (agent?: string) => ({ ...buildFactGround({ died: true }, {}), playerAgentKnown: !!agent, playerAgent: agent }) as never;
  const rc = (s: string, agent?: string) => realityCheck(s, [] as never, fgSelf(agent), "death", "tr", "Ascent").text;
  const m1r18 = "Mid Link'te aynı açık açıda durup savunmayı tek bir hatta tutmuşsun; geniş savunma açısı tutma pozisyonda Jett olarak orada beklerken rakip seni öldürdü.";
  const o1 = rc(m1r18, "Jett");
  t("gerçek M1-R18: 'Jett olarak' korunur, 'bir düşman olarak' bozuğu YOK", /Jett olarak orada beklerken/.test(o1) && !/bir düşman olarak/i.test(o1), `→ "${o1}"`);
  const o2 = rc("Jett olarak orada bekleyip vuruldun.", "Jett");
  t("cümle başı 'Jett olarak … vuruldun' korunur", o2 === "Jett olarak orada bekleyip vuruldun.", `→ "${o2}"`);
  const o3 = rc("Jett seni A Main'de vurdu.", "Jett");
  t("katil iddiası ('Jett seni vurdu') oyuncu Jett olsa da İNDİRİLİR (katil bilinmiyor)", /^Bir düşman seni/.test(o3), `→ "${o3}"`);
  // İddia İFADEDEN BAĞIMSIZ (W2 inceleme REV-W2, 2026-09-24): eskiden beklenen çıktı
  // /bir düşman olarak/ idi — #51'in düzelttiği bozuk kalıbın kendisini doğru sayıyordu.
  // Kilitlenen davranış: muafiyet DAR (başka ajan adı kalmaz, metin dokunulmadan geçmez).
  const o4in = "Reyna olarak orada beklerken vuruldun.";
  const o4 = rc(o4in, "Jett");
  t("BAŞKA ajan + 'olarak' muafiyet almaz: kanıtsız 'Reyna' kalmaz, metin değişir", !/Reyna/.test(o4) && o4 !== o4in, `→ "${o4}"`);
  console.log(`       BİLİNEN SINIR (kilit DEĞİL): yanlış-ajan yakıştırması bugün "${o4}" olarak iniyor`);
  const o5 = rc("Jett olarak orada bekleyip vuruldun.", undefined);
  t("oyuncu ajanı OKUNMAMIŞSA muafiyet yok (ajan-boş süpürgesi 'X olarak'ı zaten söker)", !/Jett olarak/.test(o5), `→ "${o5}"`);
}

// ── REV-W2 (2026-09-24): #51 muafiyeti RAPOR yolunda ────────────────────────────
// buildReportCleaner fg'si playerAgent taşımıyordu → katil okunmamış maçta rapor
// özeti "Jett olarak A Main'de tek başına beklerken vuruldun." → "Bir düşman olarak …"
// (probe, HEAD 7fc9df7). Model rapor özetinde "<ajan> olarak" kalıbını kullanıyor
// (scripts/eval-out/report-samples.json 7 özetin 2'si). Kaynak vision ile aynı (knownAgent).
console.log("\n[#51-rapor] rapor temizleyicisi: oyuncunun kendi ajanı 'X olarak' katil sayılmaz");
{
  const cleanerFor = (agent: unknown) => {
    const v = validateRequest({ rounds: [{ round: 1, score: "0 - 1", result: "loss", died: true }], lang: "tr", map: "ascent", agent });
    if (!v.valid) throw new Error("fixture geçersiz");
    return buildReportCleaner(v.data);
  };
  const jett = cleanerFor("jett");
  const r1 = jett("Jett olarak A Main'de tek başına beklerken vuruldun.", 1000, "YEDEK");
  t("rapor: 'Jett olarak … beklerken vuruldun' korunur, 'bir düşman olarak' bozuğu YOK",
    /^Jett olarak/.test(r1) && !/bir düşman olarak/i.test(r1), `→ "${r1}"`);
  const r2 = jett("Jett seni A Main'de vurdu.", 1000, "YEDEK");
  t("rapor: katil iddiası ('Jett seni vurdu') oyuncu Jett olsa da İNDİRİLİR", /^Bir düşman seni/.test(r2), `→ "${r2}"`);
  const r3in = "Reyna olarak orada beklerken vuruldun.";
  const r3 = jett(r3in, 1000, "YEDEK");
  t("rapor: BAŞKA ajan + 'olarak' muafiyet almaz (kanıtsız 'Reyna' kalmaz)", !/Reyna/.test(r3) && r3 !== r3in, `→ "${r3}"`);
  const r4 = cleanerFor(undefined)("Jett olarak orada beklerken vuruldun.", 1000, "YEDEK");
  t("rapor: ajan okunmamışsa ('Unknown') muafiyet yok", !/Jett olarak/.test(r4), `→ "${r4}"`);
  const r5 = cleanerFor("kayo")("KAY/O olarak orada beklerken vuruldun.", 1000, "YEDEK");
  t("rapor: 'kayo' gövdesi → resmî 'KAY/O' (knownAgent) muafiyeti alır", /^KAY\/O olarak/.test(r5), `→ "${r5}"`);
}

// ── FB07 · F44: ikame token'ın ÇEVRESİ (öncül / tamlama / tire / parantez) ─────────
// Korpus HEAD (b9b0564) ham metinleri BİREBİR; katil okunmamış (hasKiller=false).
// Fix olmadan: "Düşman bir düşman seni…", "Rakibin bir düşmandan biri…", "Bir düşman bir
// düşman kadrosundan…", "An enemy (enemy comp includes an enemy)…", "bir düşman-bir düşman
// takımının…", "The enemy an enemy killed you".
console.log("\n[F44] katil ikamesi çevresini onarıyor (öncül/tamlama/tire/parantez)");
{
  const nk = (s: string, lang: "tr" | "en" = "tr") =>
    realityCheck(s, [] as never, { hasKiller: false } as never, "death", lang).text;
  const CASES: [string, string, string, "tr" | "en"][] = [
    ["cycleb09-cand-trpc skye-i (öncül 'Düşman')",
      "Düşman Jett ya da Reyna seni savunmada açık bir yerde gördü ve o açıdan vurdu — açıkta durmak yerine siper kenarına geçip açıyı off-angle'dan tutmalıydın.",
      "Bir düşman seni savunmada açık bir yerde gördü ve o açıdan vurdu — açıkta durmak yerine siper kenarına geçip açıyı off-angle'dan tutmalıydın.", "tr"],
    ["cycleb09-cand2-trpc skye-h (öncül 'düşman', cümle ortası)",
      "Savunan taraftasın; düşman Jett veya Reyna tarafından öldürüldün—ölüm yer okunamadı ama açıda kaldığın için tek açıdan vuruldun.",
      "Savunan taraftasın; bir düşman tarafından öldürüldün—ölüm yer okunamadı ama açıda kaldığın için tek açıdan vuruldun.", "tr"],
    ["cycleb09-cand-trpc skye-j (''dan biri')",
      "Rakibin Jett ya da Reyna'dan biri seni açıkta vurdu—savunmada site kenarında açık alanda kalmak riskli.",
      "Bir düşman seni açıkta vurdu—savunmada site kenarında açık alanda kalmak riskli.", "tr"],
    ["cyclew3-cand2-trpc skye-a (öncülde 'Bir')",
      "Bir düşman Jett veya Reyna kadrosundan hızlı bir tempo ile giriş zamanlamasını kullandı, seni köşede yakalayıp öldürdü.",
      "Bir düşman hızlı bir tempo ile giriş zamanlamasını kullandı, seni köşede yakalayıp öldürdü.", "tr"],
    ["cyclew3-cand2-en E25 (parantezli kadro notu)",
      "Cypher (enemy comp includes Cypher) held Hookah and shot you while you were entering mid — you peeked that angle with a Vandal and lost the duel.",
      "An enemy held Hookah and shot you while you were entering mid — you peeked that angle with a Vandal and lost the duel.", "en"],
    ["cyclefix2 S14 (tireli çift + 'takımının')",
      "Hookah girişinde crosshair'ı kaybettin, Cypher-Viper takımının üst üste açı kontrolü seni oradan vurdu — o açıya tek başına geniş açıyla swing atma.",
      "Hookah girişinde crosshair'ı kaybettin, rakip takımının üst üste açı kontrolü seni oradan vurdu — o açıya tek başına geniş açıyla swing atma.", "tr"],
    ["sentetik 'Düşman Jett seni B Main'de vurdu.'",
      "Düşman Jett seni B Main'de vurdu.", "Bir düşman seni B Main'de vurdu.", "tr"],
    ["sentetik EN 'The enemy Jett killed you'",
      "The enemy Jett killed you at B Main.", "An enemy killed you at B Main.", "en"],
    ["cyclew3-cand2-trpc skye-h (parantezli TR kadro notu)",
      "Bir düşman (Jett veya Reyna kadrosundan) seni açıkta gördü ve hızlıca tepki verip öldürdü.",
      "Bir düşman seni açıkta gördü ve hızlıca tepki verip öldürdü.", "tr"],
    ["cycleb09-cand-trpc skye-h ('Rakip X/Y kombinasyonu', cümle başı)",
      "Rakip Jett/Reyna kombinasyonu seni savunmada açıkta yakaladı — sen Skye olarak köşede fazla açık kaldın.",
      "Rakip kombinasyonu seni savunmada açıkta yakaladı — sen Skye olarak köşede fazla açık kaldın.", "tr"],
  ];
  const BAD = /(?:^|[\s(])(?:düşman|rakibin) bir düşman|bir düşman[- ]\(?bir düşman|enemy an enemy|includes an enemy|bir düşman['’]?\s*d[ae]n biri/i;
  for (const [name, src, want, lang] of CASES) {
    const out = nk(src, lang);
    t(`F44 ${name}`, out === want && !BAD.test(out), `→ "${out}"`);
  }
  // NEG: niceleme "tek bir düşman kadrosu" ikame DEĞİL → dokunulmaz; katil BİLİNİYORKEN bayt-aynı.
  const neg = "Jett bu round seni bekleyip karşı açıyı kullandı ve tek bir düşman kadrosu var.";
  t("F44 NEG 'tek bir düşman kadrosu' bayt-aynı", nk(neg) === neg, `→ "${nk(neg)}"`);
  const known = "Düşman Jett seni B Main'de vurdu.";
  t("F44 NEG hasKiller=true iken bayt-aynı",
    realityCheck(known, [] as never, { hasKiller: true } as never, "death", "tr").text === known);
}

// ── FB07 · F53: katil bilinmezken yüklem-isim / edilgen / "yakaladı" kalıpları ────────
// Fix olmadan 9 negatif vakanın hepsi DEĞİŞMEDEN geçiyordu (katil uydurması kullanıcıya).
// Korpus: cycleab-luna-none M1-R19 "düşman Jett seni orada yakaladı", cycleb06-pre-syn-rp
// E25 EA "Cypher was the killer at Hookah" (killerInfo yok).
console.log("\n[F53] katil bilinmezken yaygın katil kalıpları nötrleniyor (DA/EA/NR)");
{
  const fg53 = { ...buildFactGround({ died: true }, { deathLocation: "Hookah" }), playerAgentKnown: true, playerAgent: "Waylay" } as never;
  const rc53 = (s: string, lang: "tr" | "en", fg = fg53) => realityCheck(s, [] as never, fg, "death", lang, "bind").text;
  const NEG9: [string, "tr" | "en", string][] = [
    ["Cypher was the killer at Hookah.", "en", "An enemy was the killer at Hookah."],
    ["The killer was Cypher.", "en", "The killer was an enemy."],
    ["You were killed by Cypher at Hookah.", "en", "You were killed by an enemy at Hookah."],
    ["You died to Cypher at Hookah.", "en", "You died to an enemy at Hookah."],
    ["Cypher got you at Hookah.", "en", "An enemy got you at Hookah."],
    ["Katil Cypher'dı, Hookah'ta seni bekliyordu.", "tr", "Katil bir düşmandı, Hookah'ta seni bekliyordu."],
    ["Seni öldüren Cypher Hookah'ta bekliyordu.", "tr", "Seni öldüren bir düşman Hookah'ta bekliyordu."],
    ["Hookah'ta Cypher'a öldün.", "tr", "Hookah'ta bir düşmana öldün."],
    ["Cypher seni Hookah'ta yakaladı.", "tr", "Bir düşman seni Hookah'ta yakaladı."],
  ];
  for (const [src, lang, want] of NEG9) {
    const out = rc53(src, lang);
    t(`F53 nötr: "${src}"`, out === want && !/Cypher/.test(out), `→ "${out}"`);
  }
  // Pozitif tutarlılık (STEP1'in "Jett/Reyna seni yakaladı" davranışıyla eşit).
  const p1 = rc53("Jett seni orada yakaladı.", "tr");
  t("F53 'Jett seni orada yakaladı.' → 'Bir düşman seni orada yakaladı.'", p1 === "Bir düşman seni orada yakaladı.", `→ "${p1}"`);
  const p2 = rc53("Jett got you.", "en");
  t("F53 'Jett got you.' → 'An enemy got you.'", p2 === "An enemy got you.", `→ "${p2}"`);
  // Bayt-aynı: iyelik (util/bilgi gözlemi), katil BİLİNİYORKEN, oyuncunun kendi ajanı "X olarak".
  const SAME: [string, "tr" | "en", never?][] = [
    ["Sova'nın okları seni yakaladı.", "tr"],
    ["Cypher's trip got you at Hookah.", "en"],
    ["Waylay olarak Hookah'a girdin ve orada yakalandın.", "tr"],
    ["Waylay olarak girişi açtın, Hookah'ta rakibi yakaladın.", "tr"],
  ];
  for (const [s, lang] of SAME) {
    const out = rc53(s, lang);
    t(`F53 bayt-aynı: "${s}"`, out === s, `→ "${out}"`);
  }
  const fgK = { ...buildFactGround({ died: true, killerInfo: "killed by cypher" }, { deathLocation: "Hookah" }), playerAgentKnown: true, playerAgent: "Waylay" } as never;
  for (const [s, lang] of [["Katil Cypher'dı, Hookah'ta seni bekliyordu.", "tr"], ["Cypher was the killer at Hookah.", "en"]] as [string, "tr" | "en"][]) {
    const out = rc53(s, lang, fgK);
    t(`F53 hasKiller=true bayt-aynı: "${s}"`, out === s, `→ "${out}"`);
  }
  // Zincir: EA maddesi (E25'te sızıntı EA'dan geldi) — prod finalizeVisionFeedback.
  const fin = finalizeVisionFeedback(
    { deathAnalysis: "Hookah'ta öldün.", enemyAnalysis: ["Cypher was the killer at Hookah and used the map's elevated angle to punish wide swings."], nextRoundSuggestion: "Hold Hookah with a teammate." },
    { factGround: fg53, lang: "en", map: "bind", agent: "Waylay", roundHistory: [] } as never,
  );
  t("F53 zincir EA: 'Cypher was the killer' → 'An enemy was the killer'",
    fin.enemyAnalysis[0] === "An enemy was the killer at Hookah and used the map's elevated angle to punish wide swings.",
    `→ ${JSON.stringify(fin.enemyAnalysis)}`);
}

console.log(`\n${fail === 0 ? "TÜM TESTLER GEÇTİ ✓" : `${fail} TEST BAŞARISIZ ✗`}`);
process.exit(fail ? 1 : 0);
