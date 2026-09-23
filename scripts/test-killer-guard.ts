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

console.log(`\n${fail === 0 ? "TÜM TESTLER GEÇTİ ✓" : `${fail} TEST BAŞARISIZ ✗`}`);
process.exit(fail ? 1 : 0);
