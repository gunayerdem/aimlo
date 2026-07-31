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
import { cleanCoachText } from "../lib/coach-text";

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

console.log(`\n${fail === 0 ? "TÜM TESTLER GEÇTİ ✓" : `${fail} TEST BAŞARISIZ ✗`}`);
process.exit(fail ? 1 : 0);
