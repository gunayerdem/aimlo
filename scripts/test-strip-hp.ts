// stripNumericHp saf-fonksiyon regresyon testleri (live-test #5, 2026-07-09).
// Kural: sayısal HP feedback metnine asla yazılmaz (anlık OCR okuması güvenilmez);
// kova eşikleri classifyDeath ile hizalı (<50 düşük, 50-80 orta, >80 sağlam).
// RUN: npx tsx scripts/test-strip-hp.ts  (exit 1 = kırık)
import { stripNumericHp, cleanCoachText } from "../lib/coach-text";

let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) console.log(`  ok  ${name}`);
  else { fail++; console.log(`  FAIL ${name}: got=${g} want=${w}`); }
};

// ── TR: canlı-testte görülen gerçek sızıntılar ──
eq("parantez (41 HP)",
  stripNumericHp("Düşük canla (41 HP) dövüşe girip öldün", "tr"),
  "Düşük canla dövüşe girip öldün");
eq("rapor sızıntısı '41 HP ile'",
  stripNumericHp("R3'te 41 HP ile direnip silahını kaybettin", "tr"),
  "R3'te düşük canla direnip silahını kaybettin");
eq("bitişik ek '30 canla'",
  stripNumericHp("30 canla peek atma", "tr"),
  "düşük canla peek atma");
eq("apostrof ek '100 HP'yle'",
  stripNumericHp("100 HP'yle girdin", "tr"),
  "sağlam canla girdin");
eq("orta kova '65 canla'",
  stripNumericHp("65 canla düelloya girdin", "tr"),
  "orta canla düelloya girdin");
eq("eşik hizası '45 HP' < 50 → düşük (classifyDeath ile aynı)",
  stripNumericHp("45 HP ile tuttun", "tr"),
  "düşük canla tuttun");
eq("üst kova '85 HP ile'",
  stripNumericHp("85 HP ile devam ettin", "tr"),
  "sağlam canla devam ettin");
eq("etiket 'HP: 41'", stripNumericHp("HP: 41", "tr"), "");

// ── TR: dokunulMAması gerekenler ──
eq("1v3 dokunma", stripNumericHp("1v3 durumunda geri çekil", "tr"), "1v3 durumunda geri çekil");
eq("'canını koru' dokunma (sayı yok)", stripNumericHp("canını koru, save et", "tr"), "canını koru, save et");
eq("'2 canlı düşman' dokunma (alive ≠ HP)",
  stripNumericHp("2 canlı düşman kaldı, açıyı tut", "tr"),
  "2 canlı düşman kaldı, açıyı tut");
eq("skor '2-4' dokunma", stripNumericHp("Skor 2-4, rakip önde", "tr"), "Skor 2-4, rakip önde");

// ── EN: leksikografik tuzak dahil ──
eq("EN 'at 41 hp' → low (parseInt, '41'>='100' string tuzağı DEĞİL)",
  stripNumericHp("you died at 41 hp again", "en"),
  "you died at low HP again");
eq("EN 'with 100 hp' → high", stripNumericHp("pushed with 100 HP", "en"), "pushed at high HP");
eq("EN çıplak '75 hp'", stripNumericHp("you had 75 hp left", "en"), "you had half HP left");
eq("EN parantez", stripNumericHp("Low health (41 HP) fight", "en"), "Low health fight");
eq("EN dil-izolasyonu: 'düşük canla' enjekte ETME",
  stripNumericHp("hold the angle with 30 hp", "en").includes("canla"),
  false);

// ── cleanCoachText entegrasyonu (boşluk/akış normalize dahil, uçtan uca) ──
eq("cleanCoachText TR uçtan uca",
  cleanCoachText("Düşük canla (41 HP) dövüşe girip öldün; Reyna olarak risk aldın.", "tr"),
  "Düşük canla dövüşe girip öldün; Reyna olarak risk aldın.");
eq("cleanCoachText asla boş dönmez (yalnız HP-öbeği yeniden yazılır)",
  cleanCoachText("41 HP ile öldün.", "tr").length > 0,
  true);

console.log(fail ? `\n${fail} FAIL` : "\nTAM YESIL");
process.exit(fail ? 1 : 0);
