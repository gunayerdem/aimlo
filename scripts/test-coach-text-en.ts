/**
 * EN ÇIKTI DİLİ TESTİ — cleanCoachText'in "en" dalı.
 *
 * NEDEN VAR (karşı-denetim, 2026-07-31 gecesi): EN yolu için hedge süzgeci
 * eklenmişti ve TÜM testler yeşil geçiyordu — çünkü tek bir EN testi yoktu
 * (test-coach-text-tr.ts adından da belli: TR-only). Süzgeç, modal fiili özneye
 * bakmadan "is/was" ile değiştirdiği için bu ürünün EN SIK kurduğu cümlelerde
 * bozuk İngilizce üretiyordu: "You might be over-peeking" → "You is over-peeking".
 * Ana koç alanında, kullanıcının gözünün önünde.
 *
 * Bu dosyanın işi o sınıfı kalıcı olarak kapatmak: EN çıktısı ASLA özne-yüklem
 * uyumu bozuk olmamalı ve süzgeç, dokunmaması gereken metni DEĞİŞTİRMEMELİ.
 *
 * Koşum: npx tsx scripts/test-coach-text-en.ts   (npm test içinde)
 */
import * as CT from "../lib/coach-text";
import { realityCheck } from "../lib/reality-checker";
const { cleanCoachText } = CT;

const en = (s: string) => cleanCoachText(s, "en");

let fail = 0;
function t(name: string, ok: boolean, extra = "") {
  console.log(`  ${ok ? "ok " : "FAIL"} ${name}${ok ? "" : " — " + extra}`);
  if (!ok) fail++;
}

console.log("\n[1] ÖZNE-YÜKLEM UYUMU — modal asla 'is/was'a çevrilmemeli");
{
  const cases: [string, string][] = [
    ["You might be over-peeking B Main.", "You is"],
    ["They may be rotating, so hold your angle.", "They is"],
    ["Enemies could be stacking B.", "Enemies is"],
    ["Your teammates may have been trading you.", "teammates was"],
    ["They might have been holding heaven.", "They was"],
  ];
  for (const [input, forbidden] of cases) {
    const out = en(input);
    t(`"${forbidden}" üretmiyor`, !out.includes(forbidden), `→ "${out}"`);
  }
}

console.log("\n[2] GÜVENLİ HEDGE SİLME — özneye dokunmayan ibareler temizleniyor");
{
  const a = en("Maybe you peeked early without utility.");
  const b = en("It seems the defender held that angle.");
  const c = en("I think you should trade with your teammate.");
  console.log("    SONRA:", a, "|", b, "|", c);
  t("'maybe' silindi", !/maybe/i.test(a), `→ "${a}"`);
  t("'it seems' silindi", !/it seems/i.test(b), `→ "${b}"`);
  t("'i think' silindi", !/i think/i.test(c), `→ "${c}"`);
  t("cümle başı BÜYÜK harf", /^[A-Z]/.test(a) && /^[A-Z]/.test(b) && /^[A-Z]/.test(c), `→ "${a}"`);
}

console.log("\n[3] ÇOK CÜMLELİ — ikinci cümlenin başı da büyütülmeli");
{
  const out = en("You died at A Short. Maybe you pushed too early there.");
  console.log("    SONRA:", out);
  t("ikinci cümle büyük harfle", /\.\s+You pushed/.test(out), `→ "${out}"`);
  t("küçük harfle başlayan cümle yok", !/[.!?]\s+[a-z]/.test(out), `→ "${out}"`);
}

console.log("\n[4] DOKUNULMAZLIK — hedge yoksa metin BİREBİR aynı kalmalı");
{
  const clean = "You over-peeked B Main and Cypher punished you from Heaven with an Operator.";
  const out = en(clean);
  t("temiz metin değişmedi", out === clean, `→ "${out}"`);
  const modal = "You might be able to retake with the Sage wall.";
  t("modal cümle bozulmadan geçti", en(modal).includes("might be able"), `→ "${en(modal)}"`);
}

console.log("\n[5] B01 (2026-09-23) — EN dalı: yeni TR kuralları EN'e sızmaz, EN eşleri çalışır");
{
  // TR-KALAN-24: metin başı büyütme iki dilde de (EN korpusunda 1 gerçek vaka: E25 final).
  const a = en("an enemy held Hookah and killed you.");
  t("'an enemy held…' → 'An enemy held…'", a === "An enemy held Hookah and killed you.", `→ "${a}"`);
  // TR-KALAN-05: EN'de etiket gövdesi değişir, ek AYNEN kalır (eski davranış bayt-aynı).
  const b = en("Check the killerInfo field.");
  t("'killerInfo' → 'killer info'", b === "Check the killer info field.", `→ "${b}"`);
  const c = en("The enemyComp's duelist entered first.");
  t("EN iyelik eki korunur ('enemy comp's')", c === "The enemy comp's duelist entered first.", `→ "${c}"`);
  // TR-KALAN-04: TR tutanak desenleri EN metne dokunmaz; EN 'reported as' eşi sürer.
  const d = "Killer: Jett held the angle from A Heaven.";
  t("'Killer:' etiketi bayt-aynı (TR 'Katil:' deseni EN'de eşleşmez)", en(d) === d, `→ "${en(d)}"`);
  const e = en("The killer was reported as Jett.");
  t("'was reported as' → 'was'", e === "The killer was Jett.", `→ "${e}"`);
  // TR-KALAN-07: EN teşhis-etiketi soyucu (sınır savunması; zincire bağlama B03'te).
  const sdl = (CT as unknown as Record<string, unknown>).stripDiagnosisLabel as
    ((s: string, l: "tr" | "en") => string) | undefined;
  const f = sdl ? sdl("Root cause: you held the same B Main wide angle.", "en") : "<fonksiyon yok>";
  t("'Root cause: you held…' → 'You held…'", f === "You held the same B Main wide angle.", `→ "${f}"`);
  const g = "Core problem-solving becomes easier with comms.";
  const gOut = sdl ? sdl(g, "en") : "<fonksiyon yok>";
  t("'Core problem-solving…' bayt-aynı (tire önünde boşluk yok → ayraç değil)", gOut === g, `→ "${gOut}"`);
}

console.log("\n[6] B02 (2026-09-23) — prod zinciri (realityCheck → cleanCoachText): EN silah aynası (CANLI-TEST-06)");
{
  // HEAD probe (realityCheck + cleanCoachText tam zincir, hasWeapon=false):
  // "Jett killed you with an Operator from long range." → DEĞİŞMEDEN.
  const chain = (s: string) =>
    cleanCoachText(realityCheck(s, [] as never, { hasWeapon: false } as never, "death", "en").text, "en");
  const a = chain("Jett killed you with an Operator from long range.");
  t("zincir: silah öbeği düşer, cümle kurallı kalır", a === "Jett killed you from long range.", `→ "${a}"`);
  const b = "Buy an Operator next round and hold B Long.";
  t("zincir: öğüt bayt-aynı", chain(b) === b, `→ "${chain(b)}"`);
}

console.log(`\n${fail === 0 ? "TÜM TESTLER GEÇTİ ✓" : `${fail} TEST BAŞARISIZ ✗`}`);
process.exit(fail ? 1 : 0);
