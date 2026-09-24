/**
 * TÜRKÇE POST-PROCESS REGRESYON TESTİ — canlı çıktıdan alınmış BOZUK metinlerle.
 * RUN: npx tsx scripts/test-coach-text-tr.ts
 *
 * NEDEN: 2026-07-25 dil denetiminde 20 gerçek feedback'in 20'sinde kusur bulundu ve
 * bir kısmının kökü coach-text.ts'teki regex tuzaklarıydı (Türkçe "ı" harfinde \b'nin
 * çalışmaması, boşluklu slash, kapalı '+' listesi). Bu test o kusurların GERİ GELMESİNİ
 * engeller — her vaka canlı çıktıdan BİREBİR alınmıştır.
 */
import * as CT from "../lib/coach-text";
import { finalizeVisionFeedback } from "../lib/vision-postprocess";
import { realityCheck, buildFactGround } from "../lib/reality-checker";
const { cleanCoachText, finalizeCoachText } = CT;
// B01 (2026-09-23) yeni saf fonksiyonları dinamik erişimle: fonksiyon yoksa (eski
// kod) test DERLEME hatası yerine ❌ ile KIRMIZI yanar — fix-olmadan-kırılır kanıtı
// tüm dosyanın tek koşumunda görülebilsin.
const fnOf = (name: string) => (CT as unknown as Record<string, unknown>)[name] as
  ((...a: unknown[]) => string) | undefined;
const stripDiagnosisLabel = (s: string, l: "tr" | "en") => fnOf("stripDiagnosisLabel")?.(s, l) ?? "<fonksiyon yok>";
const enforceAgentNames = (s: string, a: string[]) => fnOf("enforceAgentNames")?.(s, a) ?? "<fonksiyon yok>";

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
  // B01/TR-KALAN-24 (2026-09-23): metin başı artık büyütülüyor → "Açıyı tut."
  // (eski çıktı küçük harfle başlıyordu: " açıyı tut." → "açıyı tut."). Niyet aynı.
  t("baştaki 'ğinde' artığı silindi", !/ğinde/.test(b) && /^Açıyı tut/.test(b), `→ "${b}"`);
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

// ════════════════════════════════════════════════════════════════════════════
// B01 PAKETİ (2026-09-23) — TR süzgeç dalgası. Her vaka HEAD probe'unda KIRMIZI
// görüldü (fix-olmadan-kırılır kanıtı commit mesajında).
// ════════════════════════════════════════════════════════════════════════════
console.log("\n[15] TR-KALAN-05 — veri-etiketi kesme eki Türkçeleşir (\"katil bilgisi'da\" YOK)");
{
  const a = tr("killerInfo'da Raze var.");
  const b = tr("enemyRoster'da Cypher var.");
  const c = tr("enemyComp'taki Jett hızlı girer.");
  const d = tr("Rakip enemyComp'u agresif");
  const e = tr("deathLocation'da öldün.");
  const f = tr("economyType'ı düşük.");
  console.log("    SONRA:", a, "|", b, "|", c, "|", d, "|", e, "|", f);
  t("killerInfo'da → \"bilgisi'\" yok", !/bilgisi['’]/.test(a) && /Raze var/.test(a), `→ "${a}"`);
  t("enemyRoster'da → 'Rakip kadroda Cypher var.'", b === "Rakip kadroda Cypher var.", `→ "${b}"`);
  t("enemyComp'taki → 'Rakip kadrodaki Jett hızlı girer.'", c === "Rakip kadrodaki Jett hızlı girer.", `→ "${c}"`);
  // FB08 · F94: eski iki beklenti BOZUK Türkçeyi kilitliyordu — :228 yalnız kesme yokluğuna
  // bakıp "Rakip kadroyu agresif"i, :230 tam eşitlikle "Ekonomiyi düşük."ü geçiriyordu. Sıfat
  // yüklemi önündeki çıplak -I iyeliktir (bilinçli beklenti güncellemesi).
  t("enemyComp'u agresif → tam 'Rakip kadrosu agresif' (iyelik)", d === "Rakip kadrosu agresif", `→ "${d}"`);
  t("deathLocation'da → 'Ölüm yerinde öldün.'", e === "Ölüm yerinde öldün.", `→ "${e}"`);
  t("economyType'ı düşük → 'Ekonomisi düşük.' (iyelik)", f === "Ekonomisi düşük.", `→ "${f}"`);
  // B01 inceleme: eski assertion yalnız kesme YOKLUĞUNA bakıyordu ve bozuk
  // "Ölüm yönüsındaki açı." çıktısını GEÇER sayıyordu (test bozuk Türkçeyi kilitliyordu).
  // Artık TAM beklenen çıktı: iyelik önekli ve çoğul ekler Türkçeleşir.
  const LBL: [string, string][] = [
    ["deathAngle'sındaki açı.", "Ölüm yönündeki açı."],
    ["deathLocation'ında öldün.", "Ölüm yerinde öldün."],
    ["enemyComp'unda Jett var.", "Rakip kadrosunda Jett var."],
    ["deathTiming'inde hata var.", "Ölüm zamanlamasında hata var."],
    ["deathLocation'ları kullan.", "Ölüm yerlerini kullan."],
    ["deathLocation'larında öldün.", "Ölüm yerlerinde öldün."],
    ["enemyComp'larında Jett var.", "Rakip kadrolarında Jett var."],
    ["ultReady'sinde gir.", "Ult'unda gir."],
  ];
  for (const [src, want] of LBL) {
    const out = tr(src);
    t(`"${src}" → "${want}"`, out === want, `→ "${out}"`);
  }
  const g2 = tr("killerInfo'sunda Raze var.");
  t("killerInfo'sunda → 'bilgisisunda' YOK, killerInfo'da ile aynı sonuç", g2 === a && !/bilgisis/.test(g2), `→ "${g2}" / "${a}"`);
  const h = tr("ultReady'yi kullan.");
  t("yabancı karşılık kesmeyi korur + ek uyumlanır (ultReady'yi → Ult'u)", h === "Ult'u kullan.", `→ "${h}"`);
  const i = tr("deathLocation belirsiz.");
  t("eksiz etiket eski davranış ('deathLocation' → 'Ölüm yeri')", i === "Ölüm yeri belirsiz.", `→ "${i}"`);
  const j = tr("Rakip kadro'da Jett var.");
  t("backstop: model 'kadro'da' yazarsa kesme düşer", j === "Rakip kadroda Jett var.", `→ "${j}"`);
}

console.log("\n[16] TR-KALAN-06 — yumuşatılmış ölüm fiili (\"seni oradan aldı\", \"düşmüşsün\")");
{
  const pos: [string, string][] = [
    ["Jett seni oradan aldı.", "Jett seni oradan öldürdü."],
    ["Cypher seni A Main'den aldı.", "Cypher seni A Main'den öldürdü."],
    ["Jett seni Vandal'la aldı.", "Jett seni Vandal'la öldürdü."],
    ["Jett seni B Site sol açıdan Vandal ile aldı.", "Jett seni B Site sol açıdan Vandal ile öldürdü."],
    ["A Site'ta düşmüşsün.", "A Site'ta öldün."],
    ["R7'de yine Hookah'da düştün.", "R7'de yine Hookah'da öldün."],
  ];
  for (const [src, want] of pos) {
    const out = tr(src);
    t(`"${src}" → "${want}"`, out === want, `→ "${out}"`);
  }
  // Bayt-aynı: "seni" nesne DEĞİL / silahsız araç / yönelme eki / soyut durum /
  // 3. şahıs / çift-fiil kalkanı (aynı cümlede zaten "öld-" var)
  const same = [
    "Savunma seni trade etmeden önce kişi bilgisi aldı.",
    "Rakip seni yavaşlatıp alanı A Main'den aldı.",
    "Seni öldürdükten sonra Operator'ü senden aldı.",
    "Düşman seni gördükten sonra bilgiyi oradan alıyor.",
    "Neon seni Mid'de sağ ön açıdan Phantom'la baskıyla aldı.",
    "Aynı tuzağa düştün.",
    "Tek ölümle iki kayıp verdin: sayı düştün.",
    "Skorda geride düştün.",
    "R1 ve R7'de B Site'ta öldün, R5'te de B Main'de düştün.",
    "Takım arkadaşın A Site'ta düştü.",
    // B01 inceleme: kalkan ;/—/: sınırında duruyordu → aynı NOKTA-cümlesinde iki "öl-"
    // (korpus 18 dönüşümün 16'sı). Gerçek raw'lar (cyclereal-r3d3 M1-R18, cyclefinal3 S14):
    "Son 15 round'un hepsinde öldün; bu round da Mid Link'te düştün, yani aynı tip pozisyonlarda ısrar ediyoruz.",
    "Son 6 round'un 3'ünde benzer şekilde öldün; R7'de yine Hookah'da düştün — bu round Hookah'ı bırak.",
    "A Site'ta düştün; zaten R3'te de orada öldün.",
  ];
  for (const s of same) {
    const out = tr(s);
    t(`bayt-aynı: "${s.slice(0, 44)}"`, out === s, `→ "${out}"`);
  }
}

console.log("\n[17] TR-KALAN-07 — teşhis etiketi soyucu (stripDiagnosisLabel, sınır savunması)");
{
  const cases: [string, string][] = [
    ["En kritik neden: savunmada aynı pozisyonda kaldın.", "Savunmada aynı pozisyonda kaldın."],
    ["En kritik kök: okunabilirlik sızıntısı — B site'te açıkta kaldın.", "B site'te açıkta kaldın."],
    ["EN KRİTİK NEDEN: aynı açıda kaldın.", "Aynı açıda kaldın."],
    ["İlk temas hatası: geç açıldın orada.", "Geç açıldın orada."],
    ["En kritik neden: erken peek yüzünden tempo kaybı — takım geride kaldı.",
      "Erken peek yüzünden tempo kaybı — takım geride kaldı."],
  ];
  for (const [src, want] of cases) {
    const out = stripDiagnosisLabel(src, "tr");
    t(`"${src.slice(0, 40)}…"`, out === want, `→ "${out}"`);
  }
  for (const s of ["Bu round'un en kritik anı A girişiydi.", "Pozisyonun A Site'ta sabit kaldı — açıyı değiştir.", "En kritik neden:",
    // B01 inceleme: açık sınıf KONUM ("A Site sorunu:") ve ATIF ("Takım arkadaşının
    // hatası:") taşıyan etiketi siliyordu — bilgi kaybı. HEAD: ikisi de soyuluyordu.
    "A Site sorunu: kimse yoktu, sen tek başına kaldın.",
    "Takım arkadaşının hatası: trade gelmedi.",
    "B Main hatası: açıyı çok geniş tuttun."]) {
    const out = stripDiagnosisLabel(s, "tr");
    t(`bayt-aynı: "${s.slice(0, 40)}"`, out === s, `→ "${out}"`);
  }
  // Korpustaki tek açık-sınıf eşleşmesi (teşhis adı "açı") hâlâ soyulur.
  {
    const out = stripDiagnosisLabel("Açı tutma hatası: savunmada aynı köşeyi tuttun.", "tr");
    t("korpus 'Açı tutma hatası:' soyulur", out === "Savunmada aynı köşeyi tuttun.", `→ "${out}"`);
  }
}

console.log("\n[18] TR-KALAN-09 — ajan-adı kilidi (enforceAgentNames)");
{
  const roster = ["Jett", "Reyna"];
  const pos: [string, string[], string][] = [
    ["Reına varsa agresif girişlerde körlükle önce onu dışarı çıkar.", roster, "Reyna varsa agresif girişlerde körlükle önce onu dışarı çıkar."],
    ["Reına'ya karşı açıyı dar tut.", roster, "Reyna'ya karşı açıyı dar tut."],
    ["Rakip Jett/ Rejyna hattı seni köşede bekledi.", roster, "Rakip Jett/ Reyna hattı seni köşede bekledi."],
    ["Reğu varsa sersem sonrası peek at.", [], "Reyna varsa sersem sonrası peek at."],
    ["Cyclpher/Killjoy tuzaklarını kontrol et.", [], "Cypher/Killjoy tuzaklarını kontrol et."],
    ["Killjoi bot'unu önce temizle.", ["Killjoy"], "Killjoy bot'unu önce temizle."],
  ];
  for (const [src, anchors, want] of pos) {
    const out = enforceAgentNames(src, anchors);
    t(`"${src.slice(0, 36)}…" → düzeldi`, out === want, `→ "${out}"`);
  }
  // Bayt-aynı: gerçek sözcükler, 4 harfli çapa tuzakları, dur-listesi, "constructor" tuzağı
  const all = ["Jett", "Reyna", "Yoru", "Skye", "Clove", "Astra", "Viper", "Sage"];
  for (const s of ["Siper arkasında bekle.", "Close range'de dikkat.", "Clone'u kandırmak için kullan.",
    "Astral formda bekliyor.", "You died.", "Recon okunu at.", "Retake'e hazırlan.", "Reyna'yı izole et.",
    "Yorum yapma, oyna.", "Yordu seni.", "Jetti gördün.", "Skyes ekibi.", "Constructor pattern kullan."]) {
    const out = enforceAgentNames(s, all);
    t(`bayt-aynı: "${s}"`, out === s, `→ "${out}"`);
  }
  // B01 inceleme: çapa + kesmesiz Türkçe EK bozulma değildir — mesafe-1 eşleşmesi eki
  // silip nesneyi özneye çeviriyordu ("Viperı gördün." → "Viper gördün."). HEAD: 4'ü de değişiyordu.
  for (const s of ["Viperı gördün.", "Chambere dikkat et.", "Breachi gördün.", "Vipers geldi."]) {
    const out = enforceAgentNames(s, ["Viper", "Chamber", "Breach"]);
    t(`ek korunur (bayt-aynı): "${s}"`, out === s, `→ "${out}"`);
  }
}

console.log("\n[19] TR-KALAN-20 — Miks / KAY/O ad tablosu (casing)");
{
  const a = tr("miks seni A Hall'da öldürdü.");
  const b = tr("Rakip kay/o flash attı.");
  const c = tr("Rakip miks smoke attı.");
  console.log("    SONRA:", a, "|", b, "|", c);
  t("'miks' → 'Miks' (cümle başı)", a.startsWith("Miks"), `→ "${a}"`);
  t("'kay/o' → 'KAY/O'", b.includes("KAY/O"), `→ "${b}"`);
  t("'miks' → 'Miks' (cümle içi — ajan tablosu, baş-harf kuralı değil)", c.includes("Rakip Miks"), `→ "${c}"`);
}

console.log("\n[20] TR-KALAN-24 — metin başı büyük harf (süzgeç küçük harf üretmesin)");
{
  const a = tr("Roster'da Jett var, hızlı peek bekle.");
  const b = tr("Info al ve sonra gir.");
  const c = tr("iso ile gir.");
  const d = tr("ışık tarafından gir.");
  console.log("    SONRA:", a, "|", b, "|", c, "|", d);
  t("\"Roster'da\" → 'Kadrosunda…'", a.startsWith("Kadrosunda"), `→ "${a}"`);
  t("'Info al' → 'Bilgi al…'", b.startsWith("Bilgi al"), `→ "${b}"`);
  t("'iso ile gir.' → 'Iso ile gir.'", c === "Iso ile gir.", `→ "${c}"`);
  t("TR locale: 'ı' → 'I' (i→İ tuzağı yok)", d.startsWith("Işık"), `→ "${d}"`);
}

console.log("\n[20b] B01 inceleme — 'kadrosu' özne kuralı alt-bağlaçta ATEŞLENMEZ");
{
  const a = tr("Rakip roster'ı takip et çünkü Jett agresif oynuyor.");
  t("'… takip et çünkü Jett … oynuyor' → belirtme 'kadrosunu'", a === "Rakip kadrosunu takip et çünkü Jett agresif oynuyor.", `→ "${a}"`);
  const b = tr("Rakip roster'ı kontrol et ama Jett erken gelebilir.");
  t("'ama' ile yeni özneli yan-cümle → 'kadrosunu'", /Rakip kadrosunu kontrol et/.test(b), `→ "${b}"`);
  const c = tr("Chamber roster'ı uzun menzile izin vermiyor.");
  t("gerçek özne kullanımı (cyclefix1 S12) hâlâ 'kadrosu'", c === "Chamber kadrosu uzun menzile izin vermiyor.", `→ "${c}"`);
}

console.log("\n[21] CANLI-TEST-07 — finalizeCoachText boşalınca HAM metne dönmez");
{
  const f = (s: string, fallback?: string) => finalizeCoachText(s, { lang: "tr", cap: 350, fallback });
  t("'(41 HP)' → '' (HP yasağı delinmez)", f("(41 HP)") === "", `→ "${f("(41 HP)")}"`);
  t("'41 HP ile.' → '' (tek nokta DEĞİL)", f("41 HP ile.") === "", `→ "${f("41 HP ile.")}"`);
  t("'Ölüm yeri OCR verisinde yok.' → '' (META sızmaz)",
    f("Ölüm yeri OCR verisinde yok.") === "", `→ "${f("Ölüm yeri OCR verisinde yok.")}"`);
  const en = finalizeCoachText("Low HP.", { lang: "en", cap: 350 });
  t("EN 'Low HP.' → ''", en === "", `→ "${en}"`);
  t("fallback süzülüp anlamlıysa o döner",
    f("(41 HP)", "Maçı 11-13 kaybettin.") === "Maçı 11-13 kaybettin.", `→ "${f("(41 HP)", "Maçı 11-13 kaybettin.")}"`);
  t("fallback de yasaklıysa ''", f("(41 HP)", "(30 HP)") === "", `→ "${f("(41 HP)", "(30 HP)")}"`);
  const normal = "Jett seni A Main'de öldürdü; açıyı değiştir.";
  t("normal metin bayt-aynı", f(normal) === normal, `→ "${f(normal)}"`);
  // B01 inceleme: check (realityCheck) metni boşaltırsa ve fallback yoksa HAM metin
  // (süzülmüş ama DOĞRULANMAMIŞ) dönüyordu. HEAD: "Jett seni B Main'de vurdu."
  const chk = (s: string, fallback?: string) =>
    finalizeCoachText(s, { lang: "tr", cap: 350, fallback, check: () => "" });
  t("check boşalttı + fallback yok → ''", chk("Jett seni B Main'de vurdu.") === "", `→ "${chk("Jett seni B Main'de vurdu.")}"`);
  t("check boşalttı + fallback var → süzülmüş fallback",
    chk("Jett seni B Main'de vurdu.", "Maçı 11-13 kaybettin.") === "Maçı 11-13 kaybettin.",
    `→ "${chk("Jett seni B Main'de vurdu.", "Maçı 11-13 kaybettin.")}"`);
}

console.log("\n[F43] FB07 — hedge'li düşman tahmini kesinleştirilmez; 2. şahıs korunur");
{
  // Korpus HEAD (b9b0564) ham metinleri BİREBİR. Fix olmadan: "koymuş olabilirsin" →
  // "koydu" (şahıs kayması), "tel/kamera koymuş olabilir" → "koydu" (uydurma olgu),
  // "Muhtemelen Jett seni Operator ile vurmuş olabilir" → "Jett seni Operator ile vurdu".
  const s16 = tr("B Site'de, sol açıdayken Jett seni Vandal'la kafadan kesti — Deadlock olarak duvar/tuzağı orada fazla açığa koymuş olabilirsin; sonraki savunmada o sol açıyı smoke/tuzağa bırakıp oraya direkt durma.");
  t("cycle5 S16: 'koymuş olabilirsin' → 'koymuşsun' (2. şahıs korunur)", /koymuşsun;/.test(s16) && !/koydu;/.test(s16), `→ "${s16}"`);
  const m0 = tr("Bu round ölmüşsün değil; takımın 0-0 başladı ve Jett olarak giriş sorumluluğun vardı — ilk teması sen açmalıydın ama girişte fazla erken peek atmış olabilirsin; takımınla aynı anda execute başlat.");
  t("cyclereal-r3d2 M0-R0: 'peek atmış olabilirsin' → 'peek atmışsın'", /peek atmışsın;/.test(m0) && !/peek attı/.test(m0), `→ "${m0}"`);
  const v1 = tr("Cypher B veya Garage girişlerine tel/kamera koymuş olabilir, Operator taşıyan Chamber/Astra uzun hattı kontrol ediyor.");
  t("cyclevariety1 S3: hedge'li Cypher yan-cümlesi DÜŞER, kalan korunur",
    v1 === "Operator taşıyan Chamber ya da Astra uzun hattı kontrol ediyor.", `→ "${v1}"`);
  const g = tr("Rakipler açıyı tuttu — bu round A Elbow civarında siper yanında dururken seni o açıdan vurmuş olabilir; aynı açıda üç roundda öldün, o açıyı tekrar gövdene alıp bekleme.");
  t("cycletr-posters3 skye-g: ölüm çekirdeği (seni … vurmuş) korunur, ad uydurulmaz, hedge kalmaz",
    /seni o açıdan vurdu;/.test(g) && !/olabilir/.test(g) && !/Jett|Reyna|Cypher/.test(g), `→ "${g}"`);
  const two = tr("Cypher A Main'e tuzak bırakmış olabilir. A Main'de beklemeden girdin.");
  t("sentetik: hedge'li düşman CÜMLESİ düşer, oyuncunun olgusu kalır", two === "A Main'de beklemeden girdin.", `→ "${two}"`);
  const only = "Cypher B/C girişlerine tel ve kamera koymuş olabilir.";
  const o = tr(only);
  t("tek içerik hedge'li düşman cümlesi: DÜŞMEZ ama KESİNLEŞMEZ ('koydu' yok)", o === only, `→ "${o}"`);
  const onlyFn = fnOf("isOnlyHedgedEnemyClaim") as unknown as ((s: string, l: "tr" | "en") => boolean) | undefined;
  t("isOnlyHedgedEnemyClaim: yalnız hedge'li düşman maddesi → true; karışık → false",
    onlyFn?.(only, "tr") === true && onlyFn?.("Cypher tel koymuş olabilir, Chamber op tutuyor.", "tr") === false,
    `→ ${String(onlyFn?.(only, "tr"))}`);
  // Zincir (prod finalizeVisionFeedback, katil/silah okunmamış): katil + silah uydurulmaz;
  // EA'da hedge'li madde kanıtlı madde varken düşer.
  const fg = { ...buildFactGround({ died: true }, {}), playerAgentKnown: true, playerAgent: "Jett" };
  const fin = finalizeVisionFeedback(
    { deathAnalysis: "Muhtemelen Jett seni Operator ile vurmuş olabilir.",
      enemyAnalysis: [only, "Chamber uzun hattı Operator ile tutuyor."],
      nextRoundSuggestion: "B'ye util'le gir." },
    { factGround: fg, lang: "tr", map: "haven", agent: "Jett", roundHistory: [] } as never,
  );
  t("sentetik 'Muhtemelen Jett seni Operator ile vurmuş olabilir.' → 'Bir düşman seni vurdu.'",
    fin.deathAnalysis === "Bir düşman seni vurdu.", `→ "${fin.deathAnalysis}"`);
  t("EA: hedge'li düşman maddesi düştü, kanıtlı madde kaldı",
    JSON.stringify(fin.enemyAnalysis) === JSON.stringify(["Chamber uzun hattı Operator ile tutuyor."]), `→ ${JSON.stringify(fin.enemyAnalysis)}`);
  // B35 genişlemesi (tel/kamera/cihaz/taret + "koydu"): çok cümleli metinde kesin kipli
  // düşman-cihaz iddiası düşer; oyuncunun KENDİ kiti (2. şahıs "koydun") ve "teleport" dokunulmaz.
  const rc = (s: string) => realityCheck(s, [] as never, { hasEnemyUtil: false } as never, "death", "tr").text;
  const u1 = rc("Cypher Hookah girişine tel ya da kamera koydu. Hookah'a util'siz girdin.");
  t("B35: 'Cypher … tel ya da kamera koydu.' cümlesi düşer", u1 === "Hookah'a util'siz girdin.", `→ "${u1}"`);
  for (const s of [
    "Cypher olarak kameranı B Main'e erken koydun. Hookah'ta öldün.",
    "Omen teleport noktasını B Main'e koydu. Hookah'ta öldün.",
  ]) t(`B35 NEG bayt-aynı: "${s.slice(0, 40)}…"`, rc(s) === s, `→ "${rc(s)}"`);

  // FB07 inceleme · F43 (medium): "-yor olabilir" / isim + "olabilir" düşman tahmini de hedge.
  // Korpus ham metinleri BİREBİR (HEAD: hepsi kesinleşiyordu — "kapatıyor.", "bekliyor;", "tuzak ve kamera;").
  const y1 = tr("Cypher seni A Ramp'te sheriff ile bekliyor; telleri/kamerasıyla o hattı kapatıyor olabilir.");
  t("F43b cycleb06-pre-syn-rp S23: '-yor olabilir' yan-cümlesi DÜŞER (HEAD: '…o hattı kapatıyor.')",
    y1 === "Cypher seni A Ramp'te Sheriff ile bekliyor." && !/kapatıyor/.test(y1), `→ "${y1}"`);
  for (const s of ["Düşman A Long'da Operator'la bekliyor olabilir.", "Cypher rakibe bilgi veriyor olabilir."]) {
    const o2 = tr(s);
    t(`F43b tek içerik '-yor olabilir': düşmez ama KESİNLEŞMEZ: "${s}"`, o2 === s, `→ "${o2}"`);
  }
  const n1 = tr("Cypher rakip rosterında olduğu için tuzak ve kamera olabilir; B Hall girişine gelmeden takımdan smoke/flash isteyip crossfire kurun.");
  t("F43b cyclefinal S25 EA1: isim + 'olabilir' kesinleşmez ('tuzak ve kamera;' yok)", !/tuzak ve kamera;/.test(n1) && /olabilir/.test(n1), `→ "${n1}"`);
  // FB07 inceleme (low): düşen yan-cümleden sonra asılı bağlaç / öncülsüz gösterme.
  const c1 = tr("Takım arkadaşın Sova düşmanı görmüş olabilir, ama sen bilgiyi kullanmadın.");
  t("F43c düşen yan-cümle sonrası asılı 'ama' yok (HEAD: 'Ama sen bilgiyi kullanmadın.')", c1 === "Sen bilgiyi kullanmadın.", `→ "${c1}"`);
  const d1 = "Cypher rosterda; Hookah girişine tel/kamera veya op açısı kurmuş olabilir, o açıya direct bakıyordu.";
  t("F43c cyclevariety5 S14 EA0: öncülü düşen 'o açıya' asılı kalmaz → madde bütün hedge'li (isOnlyHedgedEnemyClaim)",
    onlyFn?.(d1, "tr") === true, `→ ${String(onlyFn?.(d1, "tr"))} / "${tr(d1)}"`);
  // FB07 inceleme · F43 (high): tamamı hedge'li EA maddesi RC'li metinle kalır — HAM src değil.
  // HEAD: RC'nin sildiği headshot / "1v3" / konum son maddede geri geliyordu.
  const fgH = { ...buildFactGround({ died: true }, {}), playerAgentKnown: true, playerAgent: "Sova" };
  const eaOnly = (s: string) => finalizeVisionFeedback(
    { deathAnalysis: "Açıkta kaldın.", enemyAnalysis: [s], nextRoundSuggestion: "Smoke at." },
    { factGround: fgH, lang: "tr", map: "haven", agent: "Sova", roundHistory: [] } as never,
  ).enemyAnalysis;
  const h1 = eaOnly("Reyna seni kafadan vurarak girmiş olabilir.");
  t("F43d tek hedge'li madde: RC'nin sildiği 'kafadan' geri gelmez, hedge kalır (HEAD: ham src)",
    h1.length === 1 && !/kafadan/.test(h1[0]) && /olabilir/.test(h1[0]), JSON.stringify(h1));
  const h2 = eaOnly("Rakip 1v3 durumda retake'e gelmiş olabilir.");
  t("F43d tek hedge'li madde: '1v3' geri gelmez", h2.length === 1 && !/1v3/.test(h2[0]), JSON.stringify(h2));
  const h3 = eaOnly("Reyna A Main'e her round aynı yerden girmiş olabilir.");
  t("F43d tek hedge'li madde: RC'nin sildiği konum ('A Main'e') geri gelmez", h3.length === 1 && !/A Main/.test(h3[0]), JSON.stringify(h3));
  const h4 = finalizeVisionFeedback(
    { deathAnalysis: "Açıkta kaldın.", enemyAnalysis: ["Killjoy B'ye taret koymuş olabilir.", "Omen seni kafadan vurarak girmiş olabilir."], nextRoundSuggestion: "Smoke at." },
    { factGround: fgH, lang: "tr", map: "haven", agent: "Sova", roundHistory: [] } as never,
  ).enemyAnalysis;
  t("F43d iki madde de hedge'li: son madde RC'li ('kafadan' yok)", h4.length === 1 && !/kafadan/.test(h4[0]), JSON.stringify(h4));
}

// ════════════════════════════════════════════════════════════════════════════
// FB08 PAKETİ (2026-09-24) — TR dil düzeltmeleri. Her vaka HEAD 4f86159 probe'unda
// KIRMIZI görüldü (fix-olmadan-kırılır kanıtı commit mesajında).
// ════════════════════════════════════════════════════════════════════════════
console.log("\n[FB08 · F42] 'cezalandır-' nesneye göre — isim nesne 'fırsata çevir-', oyuncu nesnesi 'bedavaya öldür-'");
{
  // Korpus ham metinleri (replay): nesne açı/hat/pozisyon/mesafe/hata/sızıntı → "bedavaya öldür-" YOK.
  const NOUN: [string, string][] = [
    ["Rakip orta hattı kontrol edip senin sabit açını cezalandırıyor.", "Rakip orta hattı kontrol edip senin sabit açını fırsata çeviriyor."], // cycleb09-cand2-real M1-R18
    ["Rakip B yönünden gelen baskıyı kontrol ediyor ve senin sabit B Main pozisyonunu cezalandırdı.", "Rakip B yönünden gelen baskıyı kontrol ediyor ve senin sabit B Main pozisyonunu fırsata çevirdi."], // cycleb09-base-real M1-R17
    ["Miks Classic ile A Hall'da yakın mesafeyi cezalandırdı, tabanca kafa isabetiyle tek atış etkili olur.", "Miks Classic ile A Hall'da yakın mesafeyi fırsata çevirdi, tabanca kafa isabetiyle tek atış etkili olur."], // cycleb09-base-trpc r1-c
    ["Rakip seni aynı şekilde karşılıyor ve aynı hatayı cezalandırıyor.", "Rakip seni aynı şekilde karşılıyor ve aynı hatayı fırsata çeviriyor."], // cyclereal-r3c M1-R9
    ["Rakipler pozisyon tekrarlarını ezberlemiş ve bilgi sızıntısını cezalandırıyor.", "Rakipler pozisyon tekrarlarını ezberlemiş ve bilgi sızıntısını fırsata çeviriyor."], // cyclereal-n14 M1-R19
    ["Raze site içindeki tek açıyı cezalandırırlar.", "Raze site içindeki tek açıyı fırsata çevirirler."],   // -ır + lar (cycleb09-base-trpc r4-a)
    ["Jett Operator'la uzun hattı tek atışla cezalandırıyor.", "Jett Operator'la uzun hattı tek atışla fırsata çeviriyor."], // 1-3 sözcük penceresi (cycler5syn S30)
    ["Sabit pozisyonunu cezalandırdı.", "Sabit pozisyonunu fırsata çevirdi."],
    ["Raze sağ taraftan agresif Vandal ile geniş açıları zorluyor, solo peek'leri cezalandırıyor.", "Raze sağ taraftan agresif Vandal ile geniş açıları zorluyor, solo peek'leri fırsata çeviriyor."], // cyclevariety1 S12
    ["Jett hızlı peek ve dash ile girişleri cezalandırır.", "Jett hızlı peek ve dash ile girişleri fırsata çevirir."], // cyclew3-base2-trpc phoenix-c
  ];
  for (const [src, want] of NOUN) {
    const o = tr(src);
    t(`isim nesne: "${src.slice(0, 48)}…"`, o === want && !/bedavaya öl/.test(o), `→ "${o}"`);
  }
  // Oyuncu nesnesi (seni/-(y)AnI/-(y)AnlArI/hedefleri) ESKİ davranış — "bedavaya öldür-" kalır.
  const PLAYER: [string, string][] = [
    ["Jett seni oradan cezalandırdı.", "Jett seni oradan bedavaya öldürdü."],
    ["Raze A Ramps'in dar açısına yaklaşanları Sheriff ile cezalandırdı.", "Raze A Ramps'in dar açısına yaklaşanları Sheriff ile bedavaya öldürdü."], // cycle3c S4
    ["Neon Phantom ile açık hedefleri cezalandırdı.", "Neon Phantom ile açık hedefleri bedavaya öldürdü."], // cycle5 S8
    ["Rakipler açıyı önceden tutanı cezalandırıyorlar.", "Rakipler açıyı önceden tutanı bedavaya öldürüyorlar."], // cyclew3-cand1-trpc r3-b
    ["Reyna tek tek girenleri cezalandırdı.", "Reyna tek tek girenleri bedavaya öldürdü."],
    ["Jett seni açıyı tutarken cezalandırdı.", "Jett seni açıyı tutarken bedavaya öldürdü."],   // seni öncelikli
    ["Karşı savunma açısı seni cezalandırıyor.", "Karşı savunma açısı seni bedavaya öldürüyor."], // "açısı" yalın özne
    ["Tek başına beklemek seni cezalandırır.", "Tek başına beklemek seni bedavaya öldürür."],
    ["Bu açı cezalandırır.", "Bu açı bedavaya öldürür."],   // yalın "açı" liste dışı → eski kural
  ];
  for (const [src, want] of PLAYER) {
    const o = tr(src);
    t(`oyuncu/diğer (eski kural): "${src.slice(0, 44)}…"`, o === want, `→ "${o}"`);
  }
}

console.log("\n[FB08 · F82] 'seni … ödedi/ödecek' → 'öldürdü/öldürecek' (ünlü uyumu; 'öldürdi'/'öldürcek' YOK)");
{
  const CASES: [string, string][] = [
    ["Jett seni ödedi.", "Jett seni öldürdü."],
    ["Bu açı seni yine ödecek.", "Bu açı seni yine öldürecek."],
    ["Jett katil; tek kontakta seni ödedi.", "Jett katil; tek kontakta seni öldürdü."],   // cycleb09-cand2-trpc phoenix-c
    ["Aynı açı seni tekrardan ödedi — bu kez off-angle al.", "Aynı açı seni tekrardan öldürdü — bu kez off-angle al."], // skye-b
  ];
  for (const [src, want] of CASES) {
    const o = tr(src);
    t(`"${src}" → "${want}"`, o === want && !/öldürdi|öldürcek/.test(o), `→ "${o}"`);
  }
  // Kardeş kurallar değişmedi.
  t("'seni ödüyor' → 'seni öldürüyor' (bayt-aynı davranış)", tr("Jett seni ödüyor.") === "Jett seni öldürüyor.", `→ "${tr("Jett seni ödüyor.")}"`);
}

console.log("\n[FB08 · F94] etiket çıplak -I eki: var/yok ve sıfat/3. şahıs yüklem önünde iyelik; emir/2. şahısta belirtme");
{
  const POSS: [string, string][] = [
    ["Takımın economyType'ı düşük.", "Takımın ekonomisi düşük."],
    ["Takımın economyType'ı yok.", "Takımın ekonomisi yok."],
    ["Rakip enemyComp'u var.", "Rakip kadrosu var."],
    ["deathAngle'ı dar.", "Ölüm yönü dar."],
    ["deathTiming'i erken.", "Ölüm zamanlaması erken."],
    ["Rakip enemyComp'u agresif oynuyor.", "Rakip kadrosu agresif oynuyor."],
  ];
  for (const [src, want] of POSS) {
    const o = tr(src);
    t(`iyelik: "${src}" → "${want}"`, o === want, `→ "${o}"`);
  }
  // Belirtme KORUNUR: emir, 2. şahıs, özne düşmüş geçişli 3. şahıs, alt-bağlaç.
  const ACC: [string, string][] = [
    ["enemyComp'u oku.", "Rakip kadroyu oku."],
    ["economyType'ı kontrol et.", "Ekonomiyi kontrol et."],
    ["Rakip enemyComp'u oku ve B'ye git.", "Rakip kadroyu oku ve B'ye git."],
    ["enemyComp'u okudu.", "Rakip kadroyu okudu."],
    ["enemyComp'u okudun.", "Rakip kadroyu okudun."],
    ["killerInfo'yu oku.", "Katil bilgisini oku."],
    ["ultReady'yi kullan.", "Ult'u kullan."],
  ];
  for (const [src, want] of ACC) {
    const o = tr(src);
    t(`belirtme: "${src}" → "${want}"`, o === want, `→ "${o}"`);
  }
}

console.log(`
══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ (B01 dahil)" : `❌ ${fail} BAŞARISIZ`} ══════
`);
if (fail > 0) process.exit(1);
