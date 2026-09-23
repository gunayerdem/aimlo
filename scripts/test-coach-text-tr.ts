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
  t("enemyComp'u → \"kadro'\" yok", !/kadro['’]/.test(d), `→ "${d}"`);
  t("deathLocation'da → 'Ölüm yerinde öldün.'", e === "Ölüm yerinde öldün.", `→ "${e}"`);
  t("economyType'ı → kesmesiz ('Ekonomiyi düşük.')", f === "Ekonomiyi düşük.", `→ "${f}"`);
  const g = tr("deathAngle'sındaki açı.");
  t("tanınmayan ekte de kesme kalmaz", !/['’]/.test(g), `→ "${g}"`);
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
  for (const s of ["Bu round'un en kritik anı A girişiydi.", "Pozisyonun A Site'ta sabit kaldı — açıyı değiştir.", "En kritik neden:"]) {
    const out = stripDiagnosisLabel(s, "tr");
    t(`bayt-aynı: "${s.slice(0, 40)}"`, out === s, `→ "${out}"`);
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
}

console.log(`
══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ (B01 dahil)" : `❌ ${fail} BAŞARISIZ`} ══════
`);
if (fail > 0) process.exit(1);
