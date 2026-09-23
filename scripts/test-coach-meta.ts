// META-DİL SÜZGECİ + VERİLEN-CALLOUT KORUYUCU regresyon testleri
// (canli-test #10 kalite dalgasi, 2026-08-05)
//
// S1 (KRİTİK, log-kanıtlı): model olgu-listesinin KAYNAK dilini ("OCR'da kesin",
// "kayıtta var") kullanıcı metnine taşıdı — 5 round'un 4'ünde. Fixture'lar canlı
// çıktıdan BİREBİR alınmıştır. S5 (düşük): verilen callout aynı cevapta bozuldu
// ("a lamps" verildi → "Lambs" çıktı).
// RUN: npx tsx scripts/test-coach-meta.ts  (exit 1 = kırık)
import {
  stripMetaTerms,
  findMetaTermHits,
  enforceSuppliedCallout,
  cleanCoachText,
} from "../lib/coach-text";

let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) console.log(`  ok  ${name}`);
  else { fail++; console.log(`  FAIL ${name}:\n    got =${g}\n    want=${w}`); }
};

// ── S1: 4 GERÇEK sızıntı (canlı log 2026-08-05, birebir) ────────────────────
// Beklenti: meta yan-cümle/kuyruk atılır, BİLGİLENDİRİCİ kısım korunur.
const F1 = "katil olarak Iso OCR'da kesin.";
const F2 = "Bir düşman seni A Tower'da öldürdü; öldüğün yer OCR'da kayıtlı.";
const F3 = "katil bilgisi Phoenix olarak kayıtta var.";
const F4 = "Phoenix seni B Exit'te yakaladı; katil Phoenix olarak kayıtta var.";

console.log("── stripMetaTerms: gerçek sızıntı fixture'ları ──");
eq("F1 OCR'da-kesin kuyruğu düşer, katil kalır",
  stripMetaTerms(F1), "Katil olarak Iso.");
eq("F2 meta yan-cümle düşer, ölüm cümlesi korunur",
  stripMetaTerms(F2), "Bir düşman seni A Tower'da öldürdü.");
eq("F3 bilgi-sarmalayıcı sökülür, katil adı korunur",
  stripMetaTerms(F3), "Katil Phoenix.");
eq("F4 (görevin birebir örneği) yan-cümle düşer",
  stripMetaTerms(F4), "Phoenix seni B Exit'te yakaladı.");

// Tam zincir: route'ların gerçekte çağırdığı yol cleanCoachText — süzgeç TR
// dalının ilk halkası olduğu için aynı sonuçlar uçtan uca da tutmalı.
console.log("── cleanCoachText uçtan uca (route seviyesi) ──");
eq("F1 uçtan uca", cleanCoachText(F1, "tr"), "Katil olarak Iso.");
eq("F2 uçtan uca", cleanCoachText(F2, "tr"), "Bir düşman seni A Tower'da öldürdü.");
eq("F3 uçtan uca", cleanCoachText(F3, "tr"), "Katil Phoenix.");
eq("F4 uçtan uca", cleanCoachText(F4, "tr"), "Phoenix seni B Exit'te yakaladı.");

// ── Saf-meta eleman → boş döner (dizi alanında çağıran eleman atar) ─────────
console.log("── saf-meta eleman ──");
eq("yalnız-meta cümle boşalır", stripMetaTerms("öldüğün yer OCR'da kayıtlı."), "");
eq("konum+sistemde boşalır", stripMetaTerms("Ölüm konumun sistemde kayıtlı."), "");

// ── MEŞRU cümleler BAYT-AYNI (bu geceki temiz feedback'lerin temsilcileri) ──
// "bilgi" çıplak hâliyle koçluk dilidir; "kayıp/kayarak" kayıt- köküne komşu
// ama farklı kelime; "tespit et" emir kipi meşru — hiçbirine DOKUNULMAMALI.
console.log("── meşru cümleler (bayt-aynı) ──");
const LEGIT = [
  "Phoenix seni B Exit'te yakaladı; bir dahaki sefere geniş açıyla peek at.",
  "A Lamps'ta aynı açıdan iki kez öldün; açı değiştir.",
  "Düşman Iso B Main'de agresif peek atıyor; açıyı önceden tut.",
  "Retake'i planla: spike kurulduğunda bir kişi defuse hattını tut.",
  "Bilgi almadan dar açıya girme; önce util at.",
  "Savunmada erken rotasyon yapma; site düşmeden bilgi bekle.",
  "Sağa kayıp açıyı yeniden al.",
  "Drone'la önce tespit et, sonra gir.",
];
for (const s of LEGIT) {
  eq(`bayt-aynı: "${s.slice(0, 34)}..."`, stripMetaTerms(s), s);
  eq(`dedektör-0: "${s.slice(0, 26)}..."`, findMetaTermHits(s).length, 0);
}

// ── "tespit edildi" ailesi (sistem sesi → düz saptama, dilbilgisi korunur) ──
console.log("── tespit edildi formları ──");
eq("ortaç + tespit edildi → net",
  stripMetaTerms("Aynı açıdan öldüğün tespit edildi."), "Aynı açıdan öldüğün net.");
eq("ad + tespit edildi → var",
  stripMetaTerms("Aynı açıdan iki ölüm tespit edildi."), "Aynı açıdan iki ölüm var.");
eq("olarak tespit edildi → kuyruk düşer",
  stripMetaTerms("Katil Iso olarak tespit edildi."), "Katil Iso.");
eq("verilere göre öneki düşer + baş harf büyür",
  stripMetaTerms("verilere göre B'ye ağırlık ver."), "B'ye ağırlık ver.");

// ── 'raporlan-' META-VARYANTI (canli-test #11, 2026-08-05, kanıt F) ─────────
// GERÇEK sızıntı: rekabetçi canlı testte (15:36:47) "Katil Jett olarak
// raporlanmış" çıktı — 'raporlan-' ailesi ne stripMetaTerms'te ne
// BANNED_PHRASES'teydi, iki katmanı da atladı. Cerrahinin mevcut kuralı
// tutarlı uygulanır: "olarak <meta>" kuyruğu düşer, OLGU ("Katil Jett") ve
// bilgilendirici yan-cümle KORUNUR (F1/F3 ile aynı şekil).
console.log("── raporlan- ailesi (canli-test #11) ──");
const F5 = "Katil Jett olarak raporlanmış; A Site'ta seni karşılayan agresif bir duelist var.";
eq("F5 (canlı sızıntı) olarak-raporlanmış kuyruğu düşer, bilgi kalır",
  stripMetaTerms(F5),
  "Katil Jett; A Site'ta seni karşılayan agresif bir duelist var.");
eq("F5 uçtan uca (cleanCoachText)",
  cleanCoachText(F5, "tr"),
  "Katil Jett; A Site'ta seni karşılayan agresif bir duelist var.");
const F6 = "Phoenix seni A Long'da öldürdü; katil Jett olarak raporlanmış.";
eq("F6 ayraç-sonrası raporlan- yan-cümlesi komple düşer (F4 şekli)",
  stripMetaTerms(F6), "Phoenix seni A Long'da öldürdü.");
const F7 = "Katil Iso olarak rapor edildi.";
eq("F7 'olarak rapor edildi' kuyruğu düşer, katil kalır",
  stripMetaTerms(F7), "Katil Iso.");
eq("'rapora göre' öneki düşer + baş harf büyür",
  stripMetaTerms("rapora göre B'ye ağırlık ver."), "B'ye ağırlık ver.");
eq("saf-meta raporlan- cümlesi boşalır (ölüm-yeri öznesi)",
  stripMetaTerms("Ölüm yerin A Long olarak raporlandı."), "");
// EN aynası — stripMetaTerms bugün zincirde yalnız TR dalında koşuyor; desenler
// EN dalına bağlanırsa hazır (prompt yasağı + dedektör EN'i zaten kapsıyor).
const F8 = "The killer was reported as Jett.";
eq("EN: 'was reported as' → kopula korunur",
  stripMetaTerms(F8), "The killer was Jett.");
const F9 = "Jett killed you at A Long, as reported.";
eq("EN: cümle-sonu ', as reported' kuyruğu düşer",
  stripMetaTerms(F9), "Jett killed you at A Long.");

// ── MEŞRU 'rapor' ürün terimleri BAYT-AYNI (desen-dar-kaldı kanıtı) ─────────
// "maç raporu / raporunda / rapor oluştur" koç metninde zaten hedef alan değil;
// bu assert'ler desenlerin çıplak "rapor" köküne DOKUNMADIĞINI kanıtlar.
console.log("── meşru rapor-terimleri (bayt-aynı) ──");
const RAPOR_LEGIT = [
  "Maç raporunda bu hatayı görürsün; aynı açıdan iki kez öldün.",
  "Maç sonunda raporu aç, gelişimini oradan takip et.",
  "Rapor oluştur ve haftalık gelişimine bak.",
];
for (const s of RAPOR_LEGIT) {
  eq(`bayt-aynı: "${s.slice(0, 30)}..."`, stripMetaTerms(s), s);
  eq(`dedektör-0: "${s.slice(0, 24)}..."`, findMetaTermHits(s).length, 0);
}

// ── ÖLÇÜM: findMetaTermHits ham sızıntıyı yakalar, temiz metni yakalamaz ────
// (bu geceki kör nokta: ölçüm korpusu bu sınıfı HİÇ saymıyordu — eval-score.ts
// artık bu dedektörü ihlal sınıfı olarak koşuyor.)
console.log("── meta-terim dedektörü ──");
for (const [name, f] of [["F1", F1], ["F2", F2], ["F3", F3], ["F4", F4],
  ["F5", F5], ["F6", F6], ["F7", F7], ["F8", F8], ["F9", F9]] as const) {
  eq(`ham ${name} işaretlenir`, findMetaTermHits(f).length >= 1, true);
  eq(`temiz ${name} işaretlenmez`, findMetaTermHits(stripMetaTerms(f)).length, 0);
}

// ── S5: enforceSuppliedCallout — Lambs→Lamps, başka kelimeye DOKUNMA ────────
console.log("── enforceSuppliedCallout ──");
eq("Lambs→Lamps (canlı fixture; diğer kelimeler bayt-aynı)",
  enforceSuppliedCallout("A Lamps'ta öldün; Lambs gibi dar köşede bekleme.", "a lamps"),
  "A Lamps'ta öldün; Lamps gibi dar köşede bekleme.");
eq("doğru kullanım dokunulmaz (mesafe 0)",
  enforceSuppliedCallout("A Lamps'ta öldün.", "a lamps"), "A Lamps'ta öldün.");
eq("eksik harf de düzelir (Lamp→Lamps, mesafe 1)",
  enforceSuppliedCallout("Lamp tarafından geldi.", "a lamps"), "Lamps tarafından geldi.");
eq("mesafe>2 dokunulmaz",
  enforceSuppliedCallout("Library tarafına dön.", "a lamps"), "Library tarafına dön.");
eq("küçük harfli meşru kelime korunur (lamba≠callout)",
  enforceSuppliedCallout("Üstteki lamba hizasından peek atma.", "a lamps"),
  "Üstteki lamba hizasından peek atma.");
eq("silah adı korunur (Ares↔apps d=2 tuzağı)",
  enforceSuppliedCallout("Ares'le açıyı tutuyor.", "apps"), "Ares'le açıyı tutuyor.");
eq("harita adı korunur (Haven↔heaven d=1 tuzağı)",
  enforceSuppliedCallout("Haven'da A Heaven açısında öldün.", "a heaven"),
  "Haven'da A Heaven açısında öldün.");
eq("ajan adı korunur (Jett↔gett gibi yakınlıklarda bile liste koruması)",
  enforceSuppliedCallout("Jett seni yukarıdan vurdu.", "jets"), "Jett seni yukarıdan vurdu.");
eq("callout+bitişik ek dokunulmaz (Sitede = site+de)",
  enforceSuppliedCallout("Sitede bekleme.", "b site"), "Sitede bekleme.");
eq("kısa supplied kelimeler atlanır (tek harfli site öneki)",
  enforceSuppliedCallout("Ana giriş dar.", "a"), "Ana giriş dar.");
eq("null supplied → bayt-aynı",
  enforceSuppliedCallout("A Lamps'ta öldün.", null), "A Lamps'ta öldün.");
eq("boş metin → bayt-aynı", enforceSuppliedCallout("", "a lamps"), "");

// ── Kesişim: süzgeç + koruyucu birlikte (S1+S5 aynı cümlede) ────────────────
console.log("── birleşik senaryo ──");
eq("meta düşer + bozuk callout düzelir",
  enforceSuppliedCallout(
    cleanCoachText("A Lamps'ta öldün; Lambs gibi köşede bekleme; öldüğün yer OCR'da kayıtlı.", "tr"),
    "a lamps",
  ),
  "A Lamps'ta öldün; Lamps gibi köşede bekleme.");

// ── B4 TUTANAK DİLİ (TR-KALAN-04, 2026-09-23) ──────────────────────────────
// Fixture'lar TR pipeline denetiminin (2026-09-16) canlı çıktılarından BİREBİR;
// iki doğrulayıcının (V0 sözleşme, V1 regresyon) düzeltilmiş beklentileriyle.
console.log("── B4 tutanak dili: canlı sızıntılar ──");
const B4: [string, string, string][] = [
  ["B4-1 know-g (kesme-ekli 'katil bilgisi'da' + kaydedildi)",
    "Raze seni A Site'ta aynı bölgeden öldürdü, katil bilgisi'da Raze olarak kaydedildi.",
    "Raze seni A Site'ta aynı bölgeden öldürdü."],
  ["B4-2 omen-b ('olarak doğrulanmış' + tekrar kuyruğu)",
    "Jett seni B Main'de karşıdan bekliyordu ve öldüren olarak doğrulanmış düşman Jett.",
    "Jett seni B Main'de karşıdan bekliyordu."],
  ["B4-3 r2-c ('olarak kaydedildi')",
    "Yoru seni B Generator'da bekleyip öldürdü, öldüren ajan Yoru olarak kaydedildi.",
    "Yoru seni B Generator'da bekleyip öldürdü."],
  ["B4-4 know-d (katil olarak X var + tekrar 'ölüm … gerçekleşti')",
    "Raze seni A Site'ta öldürdü; katil olarak Raze var ve ölüm A Site'te gerçekleşti.",
    "Raze seni A Site'ta öldürdü."],
  ["B4-5 r1-b (etiket tümden kalkar, virgül-splice YOK — V1 beklentisi)",
    "Katil olarak Miks var ve Classic'le A Hall'daki geniş görüş hattından bedava atış aldı.",
    "Miks Classic'le A Hall'daki geniş görüş hattından bedava atış aldı."],
  ["B4-6 r3-b (çıplak onay ortacı düşer, olgu KALIR)",
    "Katil Jett ve Vandal doğrulanmış; B Link'te seni uzaktan karşılayıp öldürdü.",
    "Katil Jett ve Vandal; B Link'te seni uzaktan karşılayıp öldürdü."],
  ["B4-7 omen-c (süzgecin ESKİ regresyonu 'Katil Jett görünüyor' kapanır)",
    "Katil Jett olarak kayıtlarda görünüyor, B Main'de seni karşıladı.",
    "Katil Jett, B Main'de seni karşıladı."],
  ["B4-8 astra-e ('net olarak' + envanter kuyruğu)",
    "Jett Vandal'la A site içinden uzak mesafeden seni öldürdü, katil net olarak Jett ve silah Vandal.",
    "Jett Vandal'la A site içinden uzak mesafeden seni öldürdü."],
  ["B4-9 r1-c (form-alanı iki noktası)",
    "Katil: Miks, Classic ile A Hall girişini kontrol etmiş ve uzak mesafede seni yakaladı.",
    "Katil Miks, Classic ile A Hall girişini kontrol etmiş ve uzak mesafede seni yakaladı."],
  ["B4-10 M0-R0 (veri seti + veri yokluğu)",
    "Bu round veri setinde öldüren bilgi yok; kimse seni öldürmedi.",
    "Kimse seni öldürmedi."],
  ["B4-11 M1-R1 (eksik-veri raporu düşer, olgu kalır)",
    "Bir düşman seni B Site'te öldürdü; öldüren ajan/cihaz bilgisi gelmedi.",
    "Bir düşman seni B Site'te öldürdü."],
  ["B4-12 S29 (yüklem ortaçta cümle KIRILMAZ)",
    "Cypher seni A Hall'dan Vandal'la tutuyor, öldürülme silah ve konumuyla doğrulanmış.",
    "Cypher seni A Hall'dan Vandal'la tutuyor."],
  ["B4-19 cyclereal-r3d3 M1-R1 (sıra kilidi: 'katil yok' kırığı üretilmez)",
    "Bir düşman seni B Site'ta vurdu; katil bilgisi yok.",
    "Bir düşman seni B Site'ta vurdu."],
  ["B4-20 öğüt KORUNUR (virgül köprüyü durdurur)",
    "Bir düşman seni B Site'te öldürdü; öldüren ajan bilgisi yok, o yüzden geniş açıyla peek at.",
    "Bir düşman seni B Site'te öldürdü, o yüzden geniş açıyla peek at."],
  ["R1 komşu meşru yan-cümle ('takımın trade alamadı') KORUNUR",
    "Jett seni B Main'de öldürdü, takımın trade alamadı, katil Jett doğrulandı.",
    "Jett seni B Main'de öldürdü, takımın trade alamadı."],
  ["R4 iki meşru yan-cümle KORUNUR",
    "Spike'ı kurdun, B Link'i tuttun, pozisyonun doğrulandı.",
    "Spike'ı kurdun, B Link'i tuttun."],
  ["R6 öznesi olan devam → iki düzgün cümle (virgül-splice YOK)",
    "Katil olarak Jett var ve sen A Site'te açıkta kaldın.",
    "Katil Jett. Sen A Site'te açıkta kaldın."],
  ["R7 tekrar olan 'ölüm … gerçekleşti' silinir",
    "Sova bu round seni mid cubby'den öldürdü; ölüm cubby'de gerçekleşti.",
    "Sova bu round seni mid cubby'den öldürdü."],
  ["virgül yan-cümle (önek çekimli yüklemle bitiyor) temizlenir",
    "Bu roundta kimse seni öldürmedi, dolayısıyla katil bilgisi yok.",
    "Bu roundta kimse seni öldürmedi."],
];
for (const [name, input, want] of B4) eq(name, stripMetaTerms(input), want);
eq("B4-16 mevcut F1 korunur (fiilsiz 'katil olarak Iso')",
  stripMetaTerms("katil olarak Iso OCR'da kesin."), "Katil olarak Iso.");

console.log("── B4 bayt-aynı guard'lar (guard'ın kendisi regresyon üretmesin) ──");
const B4_SAME = [
  "Katil bilgisini takımına ver, sonra rotasyon yap.",                     // B4-13 sağ sınır
  "Ult'u doğrulanmış düşman yoğunluğuna yönlendir.",                        // B4-14 tejo.md:26
  "Bu round'da öldüren bilgi yok.",                                          // B4-15 tam-metin guard'ı
  "Jett seni A Site'te öldürdü. Silah sesi dışında bilgi yok, ortayı kontrol et.", // R2 çıplak 'silah' rol değil
  "Verisine göre harita Ascent, ölüm Mid Link'te gerçekleşti ve savunmada bir oyuncu seni oradan vurdu.", // R3 TEK konum
  "Açıyı çok geniş tuttun, öldüren Chamber.",                                // R5 yeni bilgi taşıyan kuyruk
  "Takımın trade alamadı, açıyı değiştir.",
  // Korpus ölçümünde yakalanan kendi regresyonumuz (cycleab-luna-none M0-R0):
  // virgül LİSTE ayırıcısıyken silme "Bu round düşman öldürmesi." kırığı üretiyordu.
  "Bu round düşman öldürmesi, ölüm yeri veya silah bilgisi yok.",
];
for (const s of B4_SAME) eq(`bayt-aynı: "${s.slice(0, 40)}..."`, stripMetaTerms(s), s);

console.log("── B4 dedektör (ölçüm) ──");
// Asılmama: "Katil: …" dedektörü /g'siz yazılsaydı while(re.exec) sonsuz dönerdi.
eq("findMetaTermHits('Katil: Miks, …') döner, tam 1 hit",
  findMetaTermHits("Katil: Miks, Classic ile A Hall girişini kontrol etmiş ve uzak mesafede seni yakaladı.").length, 1);
eq("ham 'olarak kaydedildi' işaretlenir",
  findMetaTermHits("öldüren ajan Yoru olarak kaydedildi").length >= 1, true);
for (const [name, input] of B4) {
  eq(`temiz ${name.split(" ")[0]} işaretlenmez`, findMetaTermHits(stripMetaTerms(input)).length, 0);
}
eq("EN dalı: 'Killer:' etiketi TR deseniyle eşleşmez (bayt-aynı)",
  cleanCoachText("Killer: Jett held the angle from A Heaven.", "en"), "Killer: Jett held the angle from A Heaven.");
eq("uçtan uca know-g ham metni (killerInfo'da → Türkçe ek → meta söküm)",
  cleanCoachText("Raze seni A Site'ta aynı bölgeden öldürdü, killerInfo'da Raze olarak kaydedildi.", "tr"),
  "Raze seni A Site'ta aynı bölgeden öldürdü.");

console.log(fail ? `\n${fail} FAIL` : "\nTAM YESIL");
process.exitCode = fail ? 1 : 0;
