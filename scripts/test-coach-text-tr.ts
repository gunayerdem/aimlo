/**
 * TÜRKÇE POST-PROCESS REGRESYON TESTİ — canlı çıktıdan alınmış BOZUK metinlerle.
 * RUN: npx tsx scripts/test-coach-text-tr.ts
 *
 * NEDEN: 2026-07-25 dil denetiminde 20 gerçek feedback'in 20'sinde kusur bulundu ve
 * bir kısmının kökü coach-text.ts'teki regex tuzaklarıydı (Türkçe "ı" harfinde \b'nin
 * çalışmaması, boşluklu slash, kapalı '+' listesi). Bu test o kusurların GERİ GELMESİNİ
 * engeller — her vaka canlı çıktıdan BİREBİR alınmıştır.
 */
import { cleanCoachText } from "../lib/coach-text";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};
const tr = (s: string) => cleanCoachText(s, "tr");

console.log("\n[1] TÜRKÇE-\\b TUZAĞI — \"crosshair'ı\" (S10/S11/S14'te 4 kez ekrana düştü)");
{
  const out = tr("A Hall'da crosshair'ı sabitleyemeyip geniş açıdan çıktın.");
  console.log("    SONRA:", out);
  t("apostroflu 'nişangâh'ı' ÜRETİLMEDİ", !/nişangâh['’]ı/i.test(out), `→ "${out}"`);
  t("düzgün 'nişangâhı' üretildi", /nişangâhı/i.test(out), `→ "${out}"`);
}

console.log("\n[2] 'i' varyantı (ASCII — eskiden de çalışıyordu) BOZULMADI");
{
  const out = tr("crosshair'i köşeye hizala.");
  t("'nişangâhı' üretildi", /nişangâhı/i.test(out) && !/nişangâh['’]/i.test(out), `→ "${out}"`);
}

console.log("\n[3] BOŞLUKLU SLASH — 'crossfire/ trade' (S15'te ekrana düştü)");
{
  const out = tr("Takım arkadaşıyla crossfire/ trade kurarak o hattı kapatın.");
  console.log("    SONRA:", out);
  t("eğik çizgi kalmadı", !out.includes("/"), `→ "${out}"`);
  t("'ya da' ile birleşti", /crossfire ya da trade/i.test(out), `→ "${out}"`);
}

console.log("\n[4] TEK-HARFLİ SITE ADI 'A/B split' KORUNDU (istisna çalışıyor)");
{
  const out = tr("Bu round A/B split kur.");
  t("'A/B' bozulmadı", /A\/B/.test(out), `→ "${out}"`);
}

console.log("\n[5] '+' BİRLEŞTİRME — liste-dışı tokenlar (S16 'tuzak+ult', S2 'bilgi+trade')");
{
  const o1 = tr("Sen tuzak+ult ile post-plant'i bekle.");
  const o2 = tr("Önce bilgi+trade al.");
  console.log("    SONRA:", o1, "|", o2);
  t("'tuzak+ult' düzeldi", !o1.includes("+") && /tuzak ve ult/i.test(o1), `→ "${o1}"`);
  t("'bilgi+trade' düzeldi", !o2.includes("+") && /bilgi ve trade/i.test(o2), `→ "${o2}"`);
}

console.log("\n[6] ESKİ DAVRANIŞ KORUNDU — liste-içi '+' hâlâ çalışıyor");
{
  const out = tr("bot+molly ile açıyı temizle.");
  t("'bot ve molly'", /bot ve molly/i.test(out) && !out.includes("+"), `→ "${out}"`);
}

console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
if (fail > 0) process.exit(1);

console.log("\n[7] YÖN ÇEVİRİCİ — ünlü uyumlu ek (S8 'sağ önı') + çıplak 'front hattı' (S18)");
{
  const o1 = tr("Biri front-right'ı tutsun, diğeri içeri baksın.");
  const o2 = tr("Sova C Long'dan front hattı kontrol ediyor.");
  console.log("    SONRA:", o1, "|", o2);
  t("'sağ önı' ÜRETİLMEDİ", !/sağ önı/i.test(o1), `→ "${o1}"`);
  t("doğru ek 'sağ önü'", /sağ önü/i.test(o1), `→ "${o1}"`);
  t("'front hattı' Türkçeleşti", !/\bfront\b/i.test(o2) && /ön hattı/i.test(o2), `→ "${o2}"`);
}

console.log("\n[8] SİLAH ADI TUTARLILIĞI — 'operatör' (makine operatörü!) + karışık büyük/küçük");
{
  const o1 = tr("Jett seni operator'la vurdu — operatöre karşı açıyı kapat.");
  const o2 = tr("vandal ile sheriff arasında seçim yap.");
  console.log("    SONRA:", o1, "|", o2);
  t("'operatör' kalmadı", !/operatör/i.test(o1), `→ "${o1}"`);
  t("tek biçim 'Operator'", (o1.match(/Operator/g) || []).length >= 2, `→ "${o1}"`);
  t("silah adları büyük harf", /Vandal/.test(o2) && /Sheriff/.test(o2), `→ "${o2}"`);
}

console.log("\n[9] TARZANCA 'kill al-' ailesi + TEMİZLEYİCİNİN ÖZ-ÇELİŞKİSİ");
{
  // coach-text.ts:123 "cezalandırdı"yı "bedavaya kill aldı" diye düzeltiyordu —
  // oysa "kill aldı" ai-policy.ts:59 BANNED_PHRASES'te. Temizleyici yasak ifade
  // ÜRETİYORDU (canlı eval'de 2 senaryoda çıktı).
  const o1 = tr("Jett seni oradan cezalandırdı.");
  const o2 = tr("Raze o açıdan bedavaya kill aldı.");
  const o3 = tr("Cypher orada sürekli kill alıyor.");
  console.log("    SONRA:", o1, "|", o2, "|", o3);
  t("cezalandırdı → YASAK ifade üretmiyor", !/kill al/i.test(o1), `→ "${o1}"`);
  t("cezalandırdı → düz Türkçe", /bedavaya öldürdü/i.test(o1), `→ "${o1}"`);
  t("'kill aldı' → 'öldürdü'", !/kill al/i.test(o2) && /öldürdü/i.test(o2), `→ "${o2}"`);
  t("'kill alıyor' → 'öldürüyor'", !/kill al/i.test(o3) && /öldürüyor/i.test(o3), `→ "${o3}"`);
  // SERT KONTROL: ilk sürümde bu testler GEÇTİ ama çıktı "öldürüyorkill" idi —
  // assertion yalnız "kill al" yokluğuna bakıyordu, yapışık artığı KAÇIRDI
  // (yanlış-pozitif geçiş). Kök neden: coach-text.ts:24'te (kill|frag) YAKALAMA
  // grubuydu, $1 yakalanan kelimeyi geri yapıştırıyordu. Artık artık aranıyor.
  t("'kill' kelimesi metinde HİÇ kalmadı", !/kill/i.test(o2) && !/kill/i.test(o3), `→ "${o2}" | "${o3}"`);
  t("yapışık artık yok (öldürüyorkill)", !/öldürüyor[a-zçğıöşü]*kill/i.test(o3), `→ "${o3}"`);
}

console.log("\n[10] EK ÇEKİMLER — 'kill alıyordu/alıyorlar' ve 'frag alıyor'");
{
  const a = tr("Sürekli kill alıyordu.");
  const b = tr("Onlar kill alıyorlar.");
  const c = tr("Rakip frag alıyor.");
  console.log("    SONRA:", a, "|", b, "|", c);
  t("'alıyordu' temiz", !/kill/i.test(a) && /öldürüyordu/i.test(a), `→ "${a}"`);
  t("'alıyorlar' temiz", !/kill/i.test(b) && /öldürüyorlar/i.test(b), `→ "${b}"`);
  t("'frag alıyor' temiz", !/frag/i.test(c) && /öldürüyor/i.test(c), `→ "${c}"`);
}

console.log(`
══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════
`);
if (fail > 0) process.exit(1);
