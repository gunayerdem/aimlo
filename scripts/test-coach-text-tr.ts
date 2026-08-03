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

console.log("\n[11] 🔴 İÇ ETİKET SIZINTISI — prompt notu çıktıya kopyalanmamalı");
{
  // Kanıta-bağlama direktifinin ilk sürümü modeli etiketi BİREBİR kopyalamaya itti
  // (31 örneğin 15'inde). Direktif düzeltildi + burada deterministik süzgeç.
  const o1 = tr("Position pattern: b main bölgesinde tekrar eden ölüm var — bu round tek tutma.");
  const o2 = tr("Position pattern (GÜÇLÜ — 3 kez) nedeniyle A Ramp'ı aynı şekilde tutma.");
  const o3 = tr("Position pattern ve Death zone pattern: a main bölgesinde ölüm var.");
  console.log("    SONRA:", o1, "|", o2, "|", o3);
  t("etiket söküldü (1)", !/position pattern/i.test(o1), `→ "${o1}"`);
  t("içerik korundu (1)", /b main/i.test(o1) && /tek tutma/i.test(o1), `→ "${o1}"`);
  t("parantezli niteleyici de söküldü", !/position pattern/i.test(o2) && /A Ramp/i.test(o2), `→ "${o2}"`);
  t("çoklu etiket söküldü", !/pattern/i.test(o3) && /a main/i.test(o3), `→ "${o3}"`);
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

console.log("\n[12] EK HATASI — \"round'ta/round'tan\" → \"round'da/round'dan\" (canlı-test #7)");
{
  // DB kanıtı 2026-07-31: model "Bu round'ta erken düştün" üretti. "round" (raund)
  // yumuşak d ile biter → ünsüz benzeşmesi yok; yanlış uyum ('te/'ten) de düzelmeli.
  const a = tr("Bu round'ta erken düştün.");
  const b = tr("Önceki round'tan ders çıkar.");
  const c = tr("Round'te aynı hatayı yaptın, o round'ten sonra toparladın.");
  const d = tr("Bu round'da doğruydu.");
  console.log("    SONRA:", a, "|", b, "|", c, "|", d);
  t("round'ta → round'da", /round'da/i.test(a) && !/round'ta/i.test(a), `→ "${a}"`);
  t("round'tan → round'dan", /round'dan/i.test(b) && !/round'tan/i.test(b), `→ "${b}"`);
  t("yanlış uyum 'te/'ten de düzeldi", /Round'da/.test(c) && /round'dan/.test(c), `→ "${c}"`);
  t("doğru biçim DOKUNULMADI", /round'da doğruydu/.test(d), `→ "${d}"`);
}

console.log("\n[13] ABARTILI FİİL — \"infilak et-\" (canlı-test #8, 2026-08-03)");
{
  // softi'nin canlı çıktısı BİREBİR: "A Nest'te bilgi beklemeden infilak
  // etmişsin, Jett seni oradan öldürdü." Şikâyet: "yakalanmalı, GİRMİŞSİN gibi
  // SADE olmalı." Kelime KB'de/prompt'ta YOK (repo grep: 0) → model uydurması,
  // yalnız deterministik net kapatabilir.
  const a = tr("A Nest'te bilgi beklemeden infilak etmişsin, Jett seni oradan öldürdü.");
  const b = tr("Bilgi almadan infilak ettin.");
  const c = tr("Sürekli infilak ediyorsun.");
  const d = tr("Takım hazır değilken infilak etmiş.");
  const e = tr("Bilgi beklemeden infilak etme.");
  console.log("    SONRA:", a, "|", b, "|", c, "|", d, "|", e);
  t("'infilak' hiçbir çekimde kalmadı", ![a, b, c, d, e].some((s) => /infilak/i.test(s)), `→ "${a}"`);
  t("etmişsin → girmişsin", /girmişsin/.test(a), `→ "${a}"`);
  t("cümlenin kalanı korundu", /Jett seni oradan öldürdü/.test(a), `→ "${a}"`);
  t("ettin → girdin", /girdin/.test(b), `→ "${b}"`);
  t("ediyorsun → giriyorsun", /giriyorsun/.test(c), `→ "${c}"`);
  // 3. tekil -miş ayrıca hedge netine düşer: "girmiş" → "girdi" (koç KESİN konuşur)
  t("etmiş → girdi (hedge neti de çalıştı)", /girdi/.test(d) && !/girmiş/.test(d), `→ "${d}"`);
  t("etme → girme", /girme(?![a-zçğıöşü])/.test(e), `→ "${e}"`);
  // Çekim uyumu kanıtı: "girti/girmişin" gibi bozuk ek ÜRETİLMEDİ
  t("bozuk çekim üretilmedi", ![a, b, c, d, e].some((s) => /girti|girmişin|girdiyor/i.test(s)), `→ "${b}"`);
}

console.log("\n[14] KIRIK KELİME ARTIĞI — \"ğunda\" (canlı-test #8, 2026-08-03)");
{
  // Canlı çıktı: "...retake'i planla: ğunda bir kişi defuse hattını...".
  // KÖK NEDEN coach-text'te DEĞİL: lib/reality-checker.ts SPIKE_PATTERNS
  // (/\bspike\s*['’]?\s*(kuruldu|…)/gi) sağ sınırsız olduğu için
  // "spike kurulduğunda" içinden "spike kuruldu"yu söküyor. Birebir üretildi:
  //   "Retake'i planla: spike kurulduğunda bir kişi defuse hattını tut."
  //   → "Retake'i planla: ğunda bir kişi defuse hattını tut."
  // Buradaki guard SINIR SAVUNMASI: Türkçede hiçbir kelime "ğ" ile BAŞLAMAZ.
  const a = tr("Retake'i planla: ğunda bir kişi defuse hattını tut.");
  const b = tr("ğinde açıyı tut.");
  console.log("    SONRA:", a, "|", b);
  t("'ğunda' artığı silindi", !/ğunda/.test(a), `→ "${a}"`);
  t("cümlenin kalanı korundu", /planla: bir kişi defuse hattını tut/.test(a), `→ "${a}"`);
  t("baştaki 'ğinde' artığı silindi", !/ğinde/.test(b) && /açıyı tut/.test(b), `→ "${b}"`);
  // YANLIŞ-POZİTİF KONTROLÜ: sağlam Türkçe kelimeler DOKUNULMAZ
  const c = tr("Spike kurulduğunda bir kişi defuse hattını tut.");
  const d = tr("Düşman sesini duyduğunda köşeye yaslan.");
  const e = tr("Yağmur yağdığında bile aynı açıyı tut.");
  console.log("    NEGATİF:", c, "|", d, "|", e);
  t("'kurulduğunda' bozulmadı", /kurulduğunda/.test(c), `→ "${c}"`);
  t("'duyduğunda' bozulmadı", /duyduğunda/.test(d), `→ "${d}"`);
  t("'yağdığında' bozulmadı", /yağdığında/.test(e), `→ "${e}"`);
}

console.log(`
══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════
`);
if (fail > 0) process.exit(1);
