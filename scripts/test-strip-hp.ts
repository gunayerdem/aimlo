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
// canlı-test #8 (23099d1): stripHpClaims nitel can iddialarını da siler — beklenti güncellendi
// B01/TR-KALAN-24 (2026-09-23): eski beklenti KÜÇÜK harfle başlayan metni doğru
// sayıyordu ("dövüşe…") — süzgecin cümle başını bozması tam da o bulgunun konusu.
// Metin başı artık büyütülüyor (yalnız 0. konum, tr-TR locale).
eq("cleanCoachText TR uçtan uca",
  cleanCoachText("Düşük canla (41 HP) dövüşe girip öldün; Reyna olarak risk aldın.", "tr"),
  "Dövüşe girip öldün; Reyna olarak risk aldın.");
eq("cleanCoachText asla boş dönmez (yalnız HP-öbeği yeniden yazılır)",
  cleanCoachText("41 HP ile öldün.", "tr").length > 0,
  true);

// ── dalga-6 (2026-07-19): Clove-decay KB dilinin sızma yolları ──
eq("'erimiş canla' silinir",
  cleanCoachText("Erimiş canla düelloya girdin; geri çekilmeliydin.", "tr").toLowerCase().includes("erimiş"),
  false);
eq("'eksik canla' silinir ama cümle kalır",
  cleanCoachText("Düelloya eksik canla girdin; açıyı bırak.", "tr").includes("açıyı bırak"),
  true);
eq("'canın eriyordu' silinir",
  cleanCoachText("Canın eriyordu, yine de peek attın.", "tr").toLowerCase().includes("eriyor"),
  false);
eq("'eriyen' fiil-sıfatı can'sız bağlamda KORUNUR",
  cleanCoachText("Alanda eriyen smoke'un ardından girdin.", "tr").includes("eriyen"),
  true);

// ── HP-yalnız cümle artığı (W1 followup #50 / W2 inceleme RW1-F1, 2026-09-24) ──
// Probe (HEAD 8afefe8): ifade cümlenin TAMAMIYSA terminatörü öksüz kalıyordu.
eq("baştaki HP cümlesi → öksüz '. ' kalmaz", cleanCoachText("41 HP ile. Açıyı tut.", "tr"), "Açıyı tut.");
eq("sondaki HP cümlesi → çift nokta kalmaz", cleanCoachText("Açıyı tut. 41 HP ile.", "tr"), "Açıyı tut.");
eq("ortadaki HP cümlesi → 'bekliyor.. ' kalmaz",
  cleanCoachText("Savunma B'de bekliyor. 41 HP ile. Açıyı tut.", "tr"), "Savunma B'de bekliyor. Açıyı tut.");
eq("EN 'Low HP. Hold the angle.' → öksüz '. ' kalmaz", cleanCoachText("Low HP. Hold the angle.", "en"), "Hold the angle.");
eq("virgüllü HP öbeği → öksüz ', ' kalmaz, cümle başı büyür", cleanCoachText("41 HP ile, açıyı tut.", "tr"), "Açıyı tut.");
eq("cümle ortasında virgüllü HP → 'Bekle. İçeri girme.' (TR İ)", cleanCoachText("Bekle. 41 HP ile, içeri girme.", "tr"), "Bekle. İçeri girme.");
eq("yalnız HP cümlesi → '' (içeriksiz; eskiden '.')", cleanCoachText("41 HP ile.", "tr"), "");
eq("meşru '?!' ve '...' HP süzgeci ateşlese de korunur",
  cleanCoachText("Neden?! 41 HP ile. Açıyı tut...", "tr"), "Neden?! Açıyı tut...");
eq("HP süzgeci ATEŞLEMEZSE onarım koşmaz (metin bayt-aynı)",
  cleanCoachText("Bekle... Sonra gir?! Açıyı tut.", "tr"), "Bekle... Sonra gir?! Açıyı tut.");

// ── EN artık onarımı TR-locale büyütme KULLANMAZ (W2 inceleme REV-W2, 2026-09-24) ──
// Probe (HEAD 7fc9df7): tidyHpStripResidue lang almıyordu → EN'de "i" → "İ" (U+0130):
// "Play safe. İt's better to hold.", "Hold. İf they push, fall back.".
eq("EN virgüllü HP öbeği sonrası 'it's' → 'It's' (U+0130 YOK)",
  cleanCoachText("Play safe. On low HP, it's better to hold.", "en"), "Play safe. It's better to hold.");
eq("EN sayısal HP öbeği sonrası 'if' → 'If' (U+0130 YOK)",
  cleanCoachText("Hold. 41 HP, if they push, fall back.", "en"), "Hold. If they push, fall back.");
eq("EN 'instead'/'in'/'immediately' başlangıçlarında U+0130 yok",
  ["Don't re-peek. Low HP, instead play for the trade.", "Wait for util. Low HP, in that spot you lose every duel.",
    "Reposition. Low HP, immediately fall back"].some((s) => cleanCoachText(s, "en").includes("İ")), false);
eq("TR eşi değişmedi: 'Bekle. 41 HP ile, içeri girme.' → 'Bekle. İçeri girme.' (tr-locale İ)",
  cleanCoachText("Bekle. 41 HP ile, içeri girme.", "tr"), "Bekle. İçeri girme.");

console.log(fail ? `\n${fail} FAIL` : "\nTAM YESIL");
process.exit(fail ? 1 : 0);
