/**
 * KB TOKEN MALİYET ÖLÇÜMÜ — "maliyeti artırmadan" KANITI
 * Temsili istek matrisi için loadVisionKnowledge blok boyutlarını (byte) ölçer.
 * KB değişikliği ÖNCESİ ve SONRASI çalıştırılıp karşılaştırılır: sonra ≤ önce olmalı.
 * (byte ≈ token×~3.2 Türkçe için — oran sabit olduğundan byte karşılaştırması yeterli)
 * RUN: npx tsx scripts/measure-kb.ts [etiket]
 *
 * KOVALAR — prompt sırasıyla, kararlıdan değişkene (prefix-cache mantığı):
 *   static     → silah+komp rehberi; HER istekte bayt-aynı (küresel statik önek)
 *   profile    → koçluk profili (ranks/universal.md); HER istekte bayt-aynı.
 *                Eskiden `contextual` içinde ölçülüyordu ve "en değişken blok"
 *                diye etiketleniyordu — YANLIŞ okuma: 2026-07-20 ölçümünde
 *                contextual'in 41.228 B'sinin 37.658 B'si (%91) tam da bu
 *                bayt-aynı dosyaydı. Ayrı kova = ölçüm artık gerçeği gösteriyor.
 *   agent      → yarı-statik (oyuncunun main ajanı, maçlar arası nadiren değişir)
 *   map        → maç başına değişir
 *   contextual → GERÇEK değişken kuyruk (matchup + post-plant/retake + ekonomi +
 *                karşı-ajan). Prefix-cache'i kıran tek kısım burası olmalı.
 *
 * ÖNCESİ/SONRASI KARŞILAŞTIRMA TALİMATI (adım 1+3 kanıtı):
 *   "İçerik silinmedi, sadece yeri değişti" iddiası ancak TOPLAM bayt aynı
 *   kalırsa doğrudur. profile kovasının eklenmesi bir TAŞIMA'dır, silme değil:
 *   profile'a giden baytlar contextual'den düşer. Yani kova kova rakamlar
 *   kayabilir ama `TOPLAM` satırı DEĞİŞMEMELİDİR. TOPLAM düştüyse içerik
 *   kaybolmuş (veya kanıtlı mükerrer temizlenmiş — ayrıca gerekçelendir),
 *   arttıysa maliyet artmış demektir.
 *
 *   TEK MEŞRU SAPMA — ayırıcı artefaktı: profile ayrı bloğa çıkınca, eskiden
 *   contextual'in İÇİNDE ölçülen bir "\n\n---\n\n" ayırıcısı (7 byte) artık
 *   bloklar ARASI birleştiriciye taşınır ve hiçbir kovada sayılmaz. Bu yüzden
 *   ölçülen toplam kombinasyon başına tam 7 byte düşer (6 combo = 42 byte).
 *   Beklenen sapma budur ve içerik kaybı DEĞİLDİR; 7'nin katı olmayan ya da
 *   kombinasyon başına 7 byte'tan büyük bir düşüş varsa içerik kaybolmuştur.
 *
 * DEĞİŞMEZLİK GUARD'I: profile bloğu 6 vision kombinasyonunun HEPSİNDE aynı
 *   byte olmalı. Değilse süreç non-zero exit ile düşer — bu, ileride biri
 *   RANK_FILE_MAP'i çeşitlendirip profile'ı isteğe bağımlı yaparsa oluşacak
 *   SESSİZ cache regresyonunu (statik önek kısalır → taze token patlar) yakalar.
 */
import { loadVisionKnowledge, loadKnowledge } from "../lib/knowledge-loader";

const MATRIX: Array<{ name: string; opts: Parameters<typeof loadVisionKnowledge>[0] }> = [
  { name: "ascent-jett-atk", opts: { map: "Ascent", agent: "Jett", side: "attack", enemyAgents: ["Omen", "Cypher", "Sova", "Reyna", "Sage"] } },
  { name: "bind-omen-def", opts: { map: "Bind", agent: "Omen", side: "defense", enemyAgents: ["Jett", "Raze", "Skye", "Viper", "Killjoy"] } },
  { name: "haven-cypher-def-eco", opts: { map: "Haven", agent: "Cypher", side: "defense", economyType: "eco", enemyAgents: ["Neon", "Breach", "Astra", "Chamber", "Gekko"] } },
  { name: "summit-raze-atk-postplant", opts: { map: "Summit", agent: "Raze", side: "attack", spikePlanted: true, enemyAgents: ["Jett", "Omen", "Fade", "Vyse", "Iso"] } },
  { name: "corrode-tejo-atk", opts: { map: "Corrode", agent: "Tejo", side: "attack", enemyAgents: ["Waylay", "Clove", "Tejo", "Deadlock", "Phoenix"] } },
  { name: "icebox-reyna-def-force", opts: { map: "Icebox", agent: "Reyna", side: "defense", economyType: "force_buy", enemyAgents: ["Jett", "Harbor", "Sova", "Sage", "Yoru"] } },
];

const label = process.argv[2] ?? "run";
const rows: Array<Record<string, number | string>> = [];
let totalAll = 0;
/** Kombinasyon başına profile-bloğu boyutu — değişmezlik guard'ının girdisi. */
const profileSizes: Array<{ combo: string; bytes: number }> = [];

for (const { name, opts } of MATRIX) {
  const kb = loadVisionKnowledge(opts);
  const s = kb.blocks.static?.length ?? 0; // silah+komp statik bloğu (2026-07-08 sonrası)
  const p = kb.blocks.profile?.length ?? 0; // koçluk profili — istekten BAĞIMSIZ olmalı
  const a = kb.blocks.agent?.length ?? 0;
  const m = kb.blocks.map?.length ?? 0;
  const c = kb.blocks.contextual?.length ?? 0;
  const total = s + p + a + m + c;
  totalAll += total;
  profileSizes.push({ combo: name, bytes: p });
  // kolon sırası = prompt sırası (static → profile → agent → map → contextual)
  rows.push({ combo: name, static: s, profile: p, agent: a, map: m, contextual: c, total });
}

// report task (match report KB)
const report = loadKnowledge("report", { map: "Ascent", agent: "Jett", enemyAgents: ["Omen", "Cypher"], side: "attack" });
rows.push({ combo: "report-task", profile: 0, agent: 0, map: 0, contextual: 0, total: report.length });
totalAll += report.length;

console.log(`\n[measure-kb] etiket=${label} tarih=${new Date().toISOString()}`);
console.table(rows);
console.log(`TOPLAM (6 vision + 1 report): ${totalAll} byte  (~${Math.round(totalAll / 3.2)} token)`);
console.log(
  "NOT: profile bloğu contextual'den TAŞINDI (silinmedi). Öncesi/sonrası ölçümde " +
    "kova rakamları kayabilir; TOPLAM satırı AYNI kalmalı.",
);
console.log(JSON.stringify({ label, totalAll, rows }, null, 0));

/* ── DEĞİŞMEZLİK KONTROLÜ: profile bloğu küresel-statik önek mi? ──────────── */
const profileBytes = new Set(profileSizes.map((r) => r.bytes));
if (profileBytes.size > 1) {
  console.error(
    "\n[measure-kb] HATA — profile bloğu isteğe bağımlı hale gelmiş; prefix-cache varsayımı bozuldu.",
  );
  console.error(
    "  Beklenen: 6 vision kombinasyonunun HEPSİNDE profile bloğu bayt-aynı (küresel statik önek).",
  );
  console.error(`  Ölçülen farklı boyutlar: ${[...profileBytes].sort((x, y) => x - y).join(", ")} byte`);
  console.table(profileSizes);
  console.error(
    "  Sonuç: profile artık statik öneke ait değil → arkasındaki tüm bloklar her istekte\n" +
      "  TAZE token olarak faturalanır (sessiz maliyet regresyonu). Muhtemel sebep:\n" +
      "  RANK_FILE_MAP çeşitlendirildi veya profile içeriği istek parametrelerine bağlandı.\n" +
      "  Ya değişkenliği geri al, ya da profile'ı contextual (değişken kuyruk) tarafına taşı.",
  );
  process.exit(1);
}

const profileOne = profileSizes[0]?.bytes ?? 0;
if (profileOne === 0) {
  console.log(
    "[measure-kb] UYARI: profile bloğu boş/yok (0 byte) — knowledge-loader henüz ayrı " +
      "profile bloğu döndürmüyor olabilir. Değişmezlik kontrolü trivially geçti.",
  );
} else {
  console.log(`[measure-kb] OK: profile bloğu 6/6 kombinasyonda ${profileOne} byte — küresel statik önek korunuyor.`);
}
