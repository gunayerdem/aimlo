/**
 * KNOWLEDGE-LOADER SAF FONKSİYON TESTLERİ (F60, pano dalga 2026-08-04)
 * NEDEN: extractEnemyAgentFromKillerInfo / stripRankSections / filterSectionsBySide
 * export edilen, fs'e dokunmayan SAF string fonksiyonları — ama davranışları yalnız
 * verify-kb'nin dolaylı yolundan sınanıyordu. Üçü de yaşanmış bug sınıfları taşıyor:
 *   - dotted-İ OCR tuzağı (3 aylık ölüm bug'ının kök nedeni) → NFD normalize
 *   - Chromium uppercase-İ tuzağı ("RANK BAZINDA" /i ile eşleşmez) → [ıiİI] sınıfı
 *   - side-filtresinin H2-öncesi girişi asla düşürmeme sözleşmesi
 * Bu testler o davranışları DOĞRUDAN kilitler. Tamamen OFFLINE (fonksiyonlar fs okumaz).
 * RUN: npx tsx scripts/test-kb-pure-fns.ts
 */
import {
  extractEnemyAgentFromKillerInfo,
  stripRankSections,
  filterSectionsBySide,
} from "../lib/knowledge-loader";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};

console.log("\n[1] extractEnemyAgentFromKillerInfo — sözlük eşleşmesi");
{
  t("killer + silah → ajan", extractEnemyAgentFromKillerInfo("killed by jett with vandal") === "Jett");
  t("silah-only → null (normal durum, uyarısız)", extractEnemyAgentFromKillerInfo("killed by vandal") === null);
  t("boş metin → null", extractEnemyAgentFromKillerInfo("") === null);
}

console.log("\n[2] tam-kelime sınırı — alt-dizgi yanlış-pozitifi yok");
{
  t("'cloverfield' Clove DEĞİL", extractEnemyAgentFromKillerInfo("cloverfield tarafından") === null);
  t("'clove' kelime olarak → Clove", extractEnemyAgentFromKillerInfo("clove ile öldün") === "Clove");
  t("'jett2' (rakam bitişik) → null", extractEnemyAgentFromKillerInfo("jett2 killed you") === null);
}

console.log("\n[3] 🔴 Türkçe dotted-İ OCR tuzağı (3-aylık bug'ın kök nedeni — NFD normalize)");
{
  // "VİPER".toLowerCase() → "vi" + U+0307 combining-dot + "per"; normalize
  // edilmeden tam-kelime regex EŞLEŞMEZ. U+0130 bilinçli escape ile üretiliyor.
  const dotted = "VİPER vurdu seni";
  t("'VİPER' (U+0130) → Viper", extractEnemyAgentFromKillerInfo(dotted) === "Viper",
    `→ ${String(extractEnemyAgentFromKillerInfo(dotted))}`);
}

console.log("\n[4] KAY/O slug toleransı + en-önce-geçen kazanır");
{
  t("'kayo' → KAY/O", extractEnemyAgentFromKillerInfo("kayo seni vurdu") === "KAY/O");
  t("'kay/o' → KAY/O", extractEnemyAgentFromKillerInfo("kay/o seni vurdu") === "KAY/O");
  // Killfeed formatında killer önce yazılır → metinde EN ÖNCE geçen ajan seçilir.
  t("iki ajan → önce geçen (Sage)", extractEnemyAgentFromKillerInfo("killed by sage then traded by reyna") === "Sage");
}

console.log("\n[5] stripRankSections — rank-gating bölümleri düşer (softi kararı 2026-06-26)");
{
  const md = [
    "# Giriş", "giriş metni", "",
    "## Oyun Planı", "içerik A", "",
    "## Rank Modülasyonu", "gated içerik", "",
    "## RANK BAZINDA NOTLAR", "gated 2", "",
    "## Rank Notu", "gated 3", "",
    "## Son Bölüm", "içerik B", "",
  ].join("\n");
  const out = stripRankSections(md);
  t("normal bölümler kalır", out.includes("## Oyun Planı") && out.includes("içerik A") && out.includes("## Son Bölüm"));
  t("H2-öncesi giriş kalır", out.includes("giriş metni"));
  t("'Rank Modülasyonu' düşer", !out.includes("Rank Modülasyonu") && !out.includes("gated içerik"));
  // Chromium uppercase-İ tuzağı: /i bayrağı 'ı'↔'I' eşlemez → [ıiİI] sınıfı şart.
  t("🔴 'RANK BAZINDA NOTLAR' (BÜYÜK harf) düşer", !out.includes("RANK BAZINDA") && !out.includes("gated 2"));
  t("'Rank Notu' düşer", !out.includes("Rank Notu") && !out.includes("gated 3"));
}

console.log("\n[6] filterSectionsBySide — karşı-taraf bölümleri düşer, giriş ASLA düşmez");
{
  const md = [
    "Giriş metni (H2 yok)", "",
    "## Genel İlkeler", "hep kalır", "",
    "## Saldırı Stratejileri", "atak içerik", "",
    "## Savunma Kurulumları", "def içerik", "",
  ].join("\n");
  const atk = filterSectionsBySide(md, "attack");
  t("attack: Savunma bölümü düşer", !atk.includes("Savunma Kurulumları") && !atk.includes("def içerik"));
  t("attack: Saldırı + genel + giriş kalır",
    atk.includes("Saldırı Stratejileri") && atk.includes("hep kalır") && atk.includes("Giriş metni"));
  const def = filterSectionsBySide(md, "defense");
  t("defense: Saldırı bölümü düşer", !def.includes("Saldırı Stratejileri") && !def.includes("atak içerik"));
  t("defense: Savunma + genel + giriş kalır",
    def.includes("Savunma Kurulumları") && def.includes("hep kalır") && def.includes("Giriş metni"));
  t("side yok → içerik AYNEN döner", filterSectionsBySide(md, undefined) === md);
  t("bilinmeyen side → filtre yok", filterSectionsBySide(md, "spectator") === md);
}

console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
if (fail > 0) process.exit(1);
