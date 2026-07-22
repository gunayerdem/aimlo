/**
 * HARİTA-CALLOUT AYIKLAYICI TESTİ — canlı bug'ın birebir metniyle.
 * RUN: npx tsx scripts/test-map-callouts.ts
 *
 * Kanıtladığı iki şey:
 *   1. Kaan'ın Lotus maçındaki GERÇEK uydurma ("A Short") ayıklanıyor
 *   2. MEŞRU metin (Lotus'un kendi callout'ları, Ascent'te A Short,
 *      bilinmeyen harita) BOZULMUYOR — softi'nin "çalışanı bozma" şartı
 */
import { stripForeignCallouts } from "../lib/reality-checker";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};

// DB'den birebir alınan gerçek bug metni (analyses, 2026-07-21T17:01, Lotus)
const BUG =
  "A Short: Düşman takım sabit bekliyor, sen solo geniş açı aldın ve takım senkronunu bozarak A Short'ta tek başına girdin.";

console.log("\n[1] GERÇEK BUG — Lotus'ta 'A Short' ayıklanmalı");
const d1 = stripForeignCallouts(BUG, "Lotus");
console.log("    ÖNCE :", BUG);
console.log("    SONRA:", d1);
t("'a short' metinden çıktı", !/a short/i.test(d1));
// SERT KONTROL: yalnız callout düşmeli, DİĞER HER KELİME sağlam kalmalı.
// İlk sürümde bu kontrol yoktu ve "geniş" → "iş" hasarını KAÇIRDIM ("gen"
// Ascent callout'u, kapanış kelime sınırı olmadığı için kelime içinden silindi).
{
  const kelimeler = (s: string) =>
    s.toLowerCase().replace(/[.,:;!?'’]/g, " ").split(/\s+/).filter(Boolean);
  // Callout'un kendisi + ona yapışan Türkçe hâl eki ("A Short'TA") beklenen
  // kayıplar — ek callout'la birlikte gitmeli. Geri kalan her kelime kalmalı.
  const beklenenKayip = new Set(["a", "short", "ta", "te", "da", "de", "tan", "ten", "dan", "den"]);
  const oncekiler = kelimeler(BUG).filter((w) => !beklenenKayip.has(w));
  const sonrakiler = new Set(kelimeler(d1));
  const bozulan = oncekiler.filter((w) => !sonrakiler.has(w));
  t(
    "callout dışındaki HER kelime birebir korundu",
    bozulan.length === 0,
    bozulan.length ? `→ BOZULAN/KAYIP: ${bozulan.join(", ")}` : "",
  );
}

console.log("\n[2] REGRESYON — Lotus'un KENDİ callout'ları bozulmamalı");
const mesru = "C Mound'da tek başına kaldın, A Main'e rotasyon yapmalıydın.";
const d2 = stripForeignCallouts(mesru, "Lotus");
t("meşru Lotus metni DEĞİŞMEDİ", d2 === mesru, `→ "${d2}"`);

console.log("\n[3] Ascent'te 'A Short' MEŞRU — dokunulmamalı");
const asc = "A Short'ta geniş açı aldın.";
t("Ascent metni DEĞİŞMEDİ", stripForeignCallouts(asc, "Ascent") === asc);

console.log("\n[4] Harita bilinmiyorsa HİÇBİR ŞEY değişmemeli (no-op)");
t("map='Unknown' → aynen", stripForeignCallouts(BUG, "Unknown") === BUG);
t("map=undefined → aynen", stripForeignCallouts(BUG, undefined) === BUG);
t("map='' → aynen", stripForeignCallouts(BUG, "") === BUG);

console.log("\n[5] EN metin — yabancı callout düşer, fiil kalır");
const en = "You died at A Short after pushing from Market.";
const d5 = stripForeignCallouts(en, "Lotus");
console.log("    SONRA:", d5);
t("'a short' çıktı", !/a short/i.test(d5));
t("'market' çıktı (Lotus'ta yok)", !/market/i.test(d5));
t("'you died' korundu", /you died/i.test(d5));

console.log("\n[6] Boş/kısa girdi güvenli");
t("boş metin", stripForeignCallouts("", "Lotus") === "");

console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
if (fail > 0) process.exit(1);
