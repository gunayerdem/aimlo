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
import { realityCheck } from "../lib/reality-checker";

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

console.log(`\n${fail === 0 ? "TÜM TESTLER GEÇTİ ✓" : `${fail} TEST BAŞARISIZ ✗`}`);
process.exit(fail ? 1 : 0);
