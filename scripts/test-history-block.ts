/**
 * GEÇMİŞ-BLOĞU TESTİ — route ile eval'in AYNI metni kurduğunun + pencere-sayı
 * tutarlılığının kanıtı.
 * RUN: npx tsx scripts/test-history-block.ts
 */
import { buildHistoryBlock } from "../lib/history-block";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};

// S1 senaryosunun BİREBİR verisi (scripts/eval-vision.ts:73-77)
const S1 = Array.from({ length: 11 }, (_, i) => ({
  round_index: i + 1,
  died: i % 2 === 0,
  round_won: i % 3 === 0,
  death_detected_confidence: "observed",
  death_position: i % 2 === 0 ? "B Main" : "Market",
  position_confidence: "high",
}));

console.log("\n[1] 🔴 PENCERE-SAYI TUTARLILIĞI (imkânsız istatistik fix'i)");
{
  const out = buildHistoryBlock(S1, "tr");
  const m = out.match(/GÜÇLÜ — (\d+) kez, son (\d+) round içinde/);
  t("GÜÇLÜ pattern satırı üretildi", !!m, `→ ${out.slice(0, 120)}`);
  if (m) {
    const kez = Number(m[1]), pencere = Number(m[2]);
    console.log(`    → "${m[0]}"`);
    t("sayı ≤ pencere (matematiksel olarak MÜMKÜN)", kez <= pencere, `→ ${kez} kez / ${pencere} round`);
    t("eski bozuk değer (6) ÜRETİLMİYOR", kez !== 6, `→ ${kez}`);
  }
}

console.log("\n[2] GEÇMİŞ VARSA kullanım direktifi eklenir");
{
  const out = buildHistoryBlock(S1, "tr");
  t("[GEÇMİŞİ KULLAN] var", out.includes("[GEÇMİŞİ KULLAN]"));
  t("uydurma yasağı var", /UYDURMA/.test(out));
  // Sözleşme: model sayıyı ÜRETMEZ, verilen sayıyı ALIR (uydurma baskısı yaratmamak
  // için kritik — "her cümlede sayı zorunlu" kuralı geçmişte uydurmaya itmişti).
  t("kopyala/al emri var (sayı ÜRETME değil)", /yazıldığı gibi al/i.test(out), `→ ${out.slice(-260)}`);
  t("kendi hesaplaması yasak", /kendin sayma/i.test(out));
  // 🔴 ETİKET YASAĞI (2026-07-25 regresyonundan doğdu): direktifin ilk sürümü modeli
  // "Position pattern:" etiketini birebir çıktıya kopyalamaya itmişti (15/31 örnek).
  t("iç etiketi yazma yasağı var", /ETİKET/i.test(out) && /ÇIKTIYA YAZMA/i.test(out), `→ ${out.slice(-260)}`);
}

console.log("\n[3] GEÇMİŞ YOKSA bu-round çapası eklenir (R1/calibrating)");
{
  const out = buildHistoryBlock(undefined, "tr");
  t("[GEÇMİŞ YOK] var", out.includes("[GEÇMİŞ YOK]"));
  t("geçmiş iddiası yasaklanmış", /UYDURMA/.test(out));
  t("boş dizi de aynı davranır", buildHistoryBlock([], "tr") === out);
}

console.log("\n[4] EN yolu Türkçe sızdırmıyor (2026-07-18 canlı bug'ı)");
{
  const out = buildHistoryBlock(S1, "en");
  t("[USE THE HISTORY] var", out.includes("[USE THE HISTORY]"));
  t("Türkçe kelime yok", !/öldün|bölgesinde|geçmiş/i.test(out), `→ ${out.slice(0, 100)}`);
}

console.log("\n[5] KANITLANMIŞ (2 kez) yolu — sayı doğru");
{
  const iki = [
    { round_index: 1, died: true, death_position: "A Site", position_confidence: "high", death_detected_confidence: "observed" },
    { round_index: 2, died: false },
    { round_index: 9, died: true, death_position: "A Site", position_confidence: "high", death_detected_confidence: "observed" },
  ];
  const out = buildHistoryBlock(iki, "tr");
  t("KANITLANMIŞ satırı 2 kez diyor", /KANITLANMIŞ\): a site bölgesinde 2 kez öldün/.test(out), `→ ${out}`);
}

console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
if (fail > 0) process.exit(1);
