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

// ── ÖLÇÜM: findMetaTermHits ham sızıntıyı yakalar, temiz metni yakalamaz ────
// (bu geceki kör nokta: ölçüm korpusu bu sınıfı HİÇ saymıyordu — eval-score.ts
// artık bu dedektörü ihlal sınıfı olarak koşuyor.)
console.log("── meta-terim dedektörü ──");
for (const [name, f] of [["F1", F1], ["F2", F2], ["F3", F3], ["F4", F4]] as const) {
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

console.log(fail ? `\n${fail} FAIL` : "\nTAM YESIL");
process.exitCode = fail ? 1 : 0;
