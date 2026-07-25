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
