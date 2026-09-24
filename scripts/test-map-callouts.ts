/**
 * HARİTA-CALLOUT AYIKLAYICI TESTİ — canlı bug'ın birebir metniyle.
 * RUN: npx tsx scripts/test-map-callouts.ts
 *
 * Kanıtladığı iki şey:
 *   1. Kaan'ın Lotus maçındaki GERÇEK uydurma ("A Short") ayıklanıyor
 *   2. MEŞRU metin (Lotus'un kendi callout'ları, Ascent'te A Short,
 *      bilinmeyen harita) BOZULMUYOR — softi'nin "çalışanı bozma" şartı
 *   3. (FB05 · F02) masaüstü callouts.rs tablosu bu tabloyla BİREBİR — kardeş repo
 *      (../aimlo-desktop ya da AIMLO_DESKTOP_DIR) yoksa SKIP, CI kırılmaz.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { stripForeignCallouts, realityCheck } from "../lib/reality-checker";
import { calloutBelongsToMap, MAP_CALLOUTS, UNIVERSAL_CALLOUTS } from "../lib/map-callouts";
import { CALLOUT_WORDS } from "../lib/coach-text";

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

console.log("\n[4] UNKNOWN harita — AI'ın uydurduğu cross-map callout SİLİNİR, gönderilen konum KORUNUR");
// YENİ DAVRANIŞ (2026-07-24 konsey): eskiden Unknown'da no-op'tu → canlı Omen bug'ı
// (map=Unknown iken AI "A Short/B Main/Mid" uyduruyordu). Artık Unknown'da da çalışır:
// başka haritaya AİT KANITLI callout ("a short" ∈ Ascent/Haven/Bind) düşer.
{
  const dU = stripForeignCallouts(BUG, "Unknown");
  console.log("    SONRA:", dU);
  t("Unknown'da uydurma 'A Short' silindi", !/a short/i.test(dU), `→ "${dU}"`);
  // Gönderilen konum Unknown haritada bile KORUNUR (masaüstü-ölçümlü gerçek).
  const dUsup = stripForeignCallouts("A Short'ta tek kaldın.", "Unknown", "a short");
  t("Unknown'da GÖNDERİLEN 'A Short' korundu (supplied)", /a short/i.test(dUsup), `→ "${dUsup}"`);
  // Hiçbir tabloda olmayan özgün ifade Unknown'da da korunur.
  const dUnov = stripForeignCallouts("Sağ arka açıda tek kaldın.", "Unknown");
  t("Unknown'da özgün ifade 'sağ arka açı' korundu", /sağ arka açı/i.test(dUnov), `→ "${dUnov}"`);
}

console.log("\n[5] EN metin — ÇOK-KELİMELİ yabancı callout düşer, tek-kelime KALIR");
const en = "You died at A Short after pushing from Market.";
const d5 = stripForeignCallouts(en, "Lotus");
console.log("    SONRA:", d5);
t("'a short' çıktı (çok-kelimeli yabancı)", !/a short/i.test(d5));
// YENİ POLİTİKA (multi-word-only): tek-kelimelik "Market" artık KORUNUR —
// gerçek tek-kelime konumları silmemek için bilinçli tercih (konsey rank-5).
t("'market' KORUNDU (tek kelime, multi-word-only)", /market/i.test(d5));
t("'you died' korundu", /you died/i.test(d5));

console.log("\n[6] Boş/kısa girdi güvenli");
t("boş metin", stripForeignCallouts("", "Lotus") === "");

// ── CANLI REGRESYON (2026-07-24, Fracture): masaüstünün gönderdiği ölüm yeri
//    tablomda olmasa bile SİLİNMEMELİ ──
console.log("\n[7] REGRESYON — masaüstünün ölçtüğü konum tabloda olmasa da korunur");
{
  // 2026-07-24'te Fracture tablosunda 'a main' ve 'b link' YOKTU; masaüstü bunları
  // ölçüp gönderdi → strip onları SİLMEMELİ. (B10 ile ikisi de tabloya girdi —
  // aşağıdaki iki iddia artık tablo yolundan da geçer; supplied yolunu hâlâ sınamak
  // için 'a lobby' vakası eklendi: Fracture tablosunda YOK, başka haritada KANITLI.)
  const fr1 = "A Main'de utility'siz kaldın, düşman seni oradan avladı.";
  const d1 = stripForeignCallouts(fr1, "Fracture", "a main");
  t("Fracture 'A Main' (gönderilen konum) KORUNDU", /a main/i.test(d1), `→ "${d1}"`);

  const fr2 = "B Link'te açıkta kaldın ve vuruldun.";
  const d2 = stripForeignCallouts(fr2, "Fracture", "b link");
  t("Fracture 'B Link' (gönderilen konum) KORUNDU", /b link/i.test(d2), `→ "${d2}"`);

  const fr3 = "A Lobby'de açıkta kaldın ve vuruldun.";
  t("kontrol: Fracture 'A Lobby' gönderilmezse siliniyor (tabloda yok)", !/a lobby/i.test(stripForeignCallouts(fr3, "Fracture")));
  t("Fracture 'A Lobby' (gönderilen konum, tabloda YOK) KORUNDU", stripForeignCallouts(fr3, "Fracture", "a lobby") === fr3,
    `→ "${stripForeignCallouts(fr3, "Fracture", "a lobby")}"`);
}

console.log("\n[8] Tek-kelimelik generic ('Tree') artık SİLİNMEZ (multi-word-only)");
{
  const d = stripForeignCallouts("A Main'e girdin, Tree'den gelen ateşte öldün.", "Lotus", "a main");
  t("'Tree' korundu (tek kelime, multi-word-only)", /tree/i.test(d), `→ "${d}"`);
}

console.log("\n[9] AI'ın UYDURDUĞU çok-kelimeli yabancı callout HÂLÂ silinir");
{
  // Lotus'ta 'A Short' YOK ve masaüstü onu göndermedi → uydurma → silinmeli.
  const d = stripForeignCallouts("A Short'ta tek başına girdin.", "Lotus", "c mound");
  t("Lotus uydurma 'A Short' silindi", !/a short/i.test(d), `→ "${d}"`);
}

console.log("\n[10] CROSS-MAP KAPISI — hiçbir tabloda olmayan ad, SUPPLIED OLMASA da korunur");
{
  // 🔴 Bugünkü canlı bug'ın çekirdeği: masaüstü OCR "A Hall"ı "a hail" okudu → HİÇBİR
  // harita tablosunda "a hail" YOK. supplied geçilmese bile SİLİNMEMELİ (eski cross-map
  // öncesi kod silerdi). Yalnız BAŞKA haritada KANITLI callout silinir.
  const d1 = stripForeignCallouts("A Hail'de utility'siz kaldın ve öldün.", "Fracture");
  t("Fracture OCR-varyantı 'A Hail' korundu (hiçbir tabloda yok, supplied yok)", /a hail/i.test(d1), `→ "${d1}"`);
  // Özgün çok-kelimeli ifade (callout değil) korunur.
  const d2 = stripForeignCallouts("Dar koridorda beklerken vuruldun.", "Fracture");
  t("Özgün 'dar koridor' korundu", /dar koridor/i.test(d2), `→ "${d2}"`);
  // Ama BAŞKA haritanın gerçek callout'u (Lotus'ta Ascent'in 'B Lanes'i) hâlâ silinir.
  const d3 = stripForeignCallouts("B Lanes'ten geldiler.", "Lotus");
  t("Lotus'ta yabancı 'B Lanes' (Ascent callout'u) silindi", !/b lanes/i.test(d3), `→ "${d3}"`);
}

console.log("\n[11] SİTE-HARFİ BESTESİ (TR-KALAN-17, 2026-09-23) — masaüstü resolve() aynası");
{
  // HEAD: "öldün." — Ascent tablosunda yalnız çıplak "tree" var, "a tree" Lotus'ta
  // KANITLI olduğu için cross-map kapısı siliyordu (real-rounds-23'te rh'de 19 kez).
  const a = "A Tree'de öldün.";
  const d = stripForeignCallouts(a, "ascent");
  t("Ascent 'A Tree' (harf + meşru çıplak 'tree') KORUNDU", d === a, `→ "${d}"`);
  // Cross-map kapısı AÇILMADI: Lotus'ta çıplak "short" yok → hâlâ yabancı.
  const l = stripForeignCallouts("A Short'ta öldün.", "lotus");
  t("Lotus 'A Short' hâlâ siliniyor", !/a short/i.test(l), `→ "${l}"`);
  // Harfin BAŞKA biçimi haritada varsa ("long" Bind'da yalnız "b long") beste YOK.
  const b = stripForeignCallouts("C Long'da öldün.", "bind");
  t("Bind 'C Long' hâlâ siliniyor (tabloda yalnız 'b long')", !/c long/i.test(b), `→ "${b}"`);
  const b2 = stripForeignCallouts("A Long'da öldün.", "bind");
  t("Bind 'A Long' hâlâ siliniyor", !/a long/i.test(b2), `→ "${b2}"`);
  // Harita bilinmiyorsa beste uygulanmaz (meşru küme yalnız evrensel + gönderilen).
  const u = stripForeignCallouts("A Tree'de öldün.", "Unknown");
  t("Unknown haritada 'A Tree' (Lotus'ta kanıtlı) eskisi gibi siliniyor", !/a tree/i.test(u), `→ "${u}"`);
  // B02 İNCELEME: beste YANLIŞ site harfini kabul ediyordu → Ascent'te "B Tree"
  // (Fracture) / "B Garden" (Bind) cross-map callout'u korunuyordu. KB: ascent.md:234
  // Tree, :236 Garden → A tarafı. HEAD: ikisi de bayt-aynı.
  const bt = stripForeignCallouts("B Tree'de öldün.", "ascent");
  t("Ascent 'B Tree' (yanlış site, Fracture callout'u) siliniyor", !/b tree/i.test(bt), `→ "${bt}"`);
  const bg = stripForeignCallouts("B Garden'da öldün.", "ascent");
  t("Ascent 'B Garden' (yanlış site, Bind callout'u) siliniyor", !/b garden/i.test(bg), `→ "${bg}"`);
  const ag = "A Garden'da öldün.";
  t("Ascent 'A Garden' (doğru site) KORUNDU", stripForeignCallouts(ag, "ascent") === ag, `→ "${stripForeignCallouts(ag, "ascent")}"`);
  // Ölçülmüş konum her zaman meşru (masaüstü "b tree" gönderdiyse silinmez).
  const ms = "B Tree'de öldün.";
  t("gönderilen konum 'b tree' Ascent'te de KORUNUR", stripForeignCallouts(ms, "ascent", "b tree") === ms, `→ "${stripForeignCallouts(ms, "ascent", "b tree")}"`);
}

console.log("\n[12] KB ↔ TABLO SENKRONU (TR-KALAN-17 / B10) — KB'nin kalın callout'ları kendi haritasında silinmez");
{
  // HEAD (B10 öncesi): hepsi "öldün." — ad tabloda yoktu, başka haritada KANITLIYDI →
  // cross-map kapısı siliyordu. Kaynaklar lib/map-callouts.ts MAP_CALLOUTS yorumunda.
  const legit: [string, string][] = [
    ["fracture", "A Main"], ["fracture", "A Link"], ["fracture", "B Link"], ["fracture", "B Tunnel"],
    ["ascent", "A Link"], ["bind", "B Link"], ["haven", "A Tower"],
    ["abyss", "A Default"], ["abyss", "B Default"],
  ];
  for (const [m, name] of legit) {
    const s = `${name}'da öldün.`;
    const d = stripForeignCallouts(s, m);
    t(`${m} '${name}' KORUNDU`, d === s, `→ "${d}"`);
    // Masaüstü sözleşmesi: [HARİTA İPUCU] kapısı (vision-prompt-builder) aynı tabloyu okur.
    t(`calloutBelongsToMap('${name.toLowerCase()}', '${m}')`, calloutBelongsToMap(name.toLowerCase(), m));
  }
  // Canlı korpus (tr-cards r4-a, fracture): gönderilen konum OLMADAN da geçmiş round adı
  // "R3 B Link)" artık öksüz "R3 )" bırakmıyor.
  const r4 = "Son 3 round'da her round öldün (R1 A Hall, R2 B Generator, R3 B Link) — rakip farklı açılarda seni yakalıyor.";
  t("fracture 'R3 B Link)' (supplied yok) KORUNDU", stripForeignCallouts(r4, "fracture") === r4, `→ "${stripForeignCallouts(r4, "fracture")}"`);
  // Cross-map kapısı AÇILMADI: yeni adlar BAŞKA haritada hâlâ yabancı.
  const neg: [string, string][] = [["lotus", "B Tunnel"], ["lotus", "A Tower"], ["sunset", "B Link"], ["ascent", "B Tunnel"]];
  for (const [m, name] of neg) {
    const d = stripForeignCallouts(`${name}'da öldün.`, m);
    t(`${m} '${name}' (başka haritanın callout'u) hâlâ siliniyor`, !new RegExp(name, "i").test(d), `→ "${d}"`);
  }
  // Breeze "A Cave" BİLEREK eklenmedi (resmi v7.04: "A Cave blocked off"; güncel resmi +
  // metabot listelerinde yok) → Summit'in callout'u olarak Breeze'de yabancı kalır.
  const bc = stripForeignCallouts("A Cave'de öldün.", "breeze");
  t("breeze 'A Cave' (kapatılmış alan, tabloda yok) siliniyor", !/a cave/i.test(bc), `→ "${bc}"`);
  t("summit 'A Cave' (kendi callout'u) KORUNDU", stripForeignCallouts("A Cave'de öldün.", "summit") === "A Cave'de öldün.");
}

console.log("\n[13] TAM-METİN SENKRONU (B10 inceleme [0], W3-fix) — KB gövdesindeki meşru ad kendi haritasında silinmez");
{
  // HEAD (bu düzeltme öncesi): üçü de "öldün."/cümle başı kopuk — ad kendi haritasının KB'sinde
  // yazılı ama tabloda yoktu, başka haritada (sunset / split / fracture) KANITLIYDI.
  const legit: [string, string][] = [
    ["ascent", "Market kapısı kapatıldığında B'ye CT'den dön."], // ascent.md:245
    ["haven", "A Sewer'da öldün."], // resmi Haven etiketi (haven.md:22 "A Sewers")
    ["icebox", "A'daki zip line'ı kullanıp Nest'e çık."], // icebox.md:15
  ];
  for (const [m, s] of legit) {
    const d = stripForeignCallouts(s, m);
    t(`${m} «${s}» KORUNDU`, d === s, `→ "${d}"`);
  }
  t("calloutBelongsToMap('a sewer', 'haven')", calloutBelongsToMap("a sewer", "haven"));
  t("calloutBelongsToMap('zip line', 'icebox')", calloutBelongsToMap("zip line", "icebox"));
  t("calloutBelongsToMap('market kapısı', 'ascent')", calloutBelongsToMap("market kapısı", "ascent"));
  // Cross-map kapısı AÇILMADI: eklenen adlar tablo birleşiminde zaten vardı; başka haritada
  // hâlâ yabancı.
  const neg: [string, string][] = [["lotus", "A Sewer"], ["ascent", "Zip line"], ["bind", "Market kapısı"]];
  for (const [m, name] of neg) {
    const d = stripForeignCallouts(`${name}'da öldün.`, m);
    t(`${m} '${name}' (başka haritanın callout'u) hâlâ siliniyor`, !new RegExp(name, "i").test(d), `→ "${d}"`);
  }
  // Doğrulanamayan iki ad TABLOYA ALINMADI (resmi Bind/Fracture listelerinde yok) — KB metni
  // düzeltildi (bind.md:167, fracture.md:150); uydurma olarak yazılırsa silinmeye devam eder.
  t("bind 'B Lobby' (resmi listede yok) hâlâ siliniyor", !/b lobby/i.test(stripForeignCallouts("B Lobby'den çıkarken öldün.", "bind")));
  t("fracture 'B CT' (resmi listede yok) hâlâ siliniyor", !/b ct/i.test(stripForeignCallouts("B CT çıkışında öldün.", "fracture")));
}

console.log("\n[14] İKİ REPO SENKRONU (FB05 · F02) — masaüstü callouts.rs ↔ lib/map-callouts.ts birebir");
{
  // KANIT (F02): backend 2b956b2 MAP_CALLOUTS'a 3 ad ekledi (ascent "market kapısı", haven
  // "a sewer", icebox "zip line"), masaüstü aynası güncellenmedi. İki repo arasındaki TEK
  // senkron denetimi masaüstü release betiğindeydi (release-desktop.ps1 0c →
  // scripts/check-callout-sync.mjs); ne backend `npm test`inde ne masaüstü `cargo test`inde
  // koşuyordu → ayrışma ancak launch günü release'i durdurunca görülecekti.
  // ÇÖZÜM: backend tarafı da aynı kıyası `npm test`te yapar. Ayrıştırma ve özet
  // check-callout-sync.mjs'in BİREBİR aynısıdır (parseDesktopRs regex'leri + FNV-1a 64
  // "harita|ad\n" / "*|ad\n" beslemesi = callouts.rs d22 pini ile aynı tanım). Backend
  // tablosu çalışma kopyasından, ÇALIŞAN modülün kendisinden okunur (Object.entries
  // ekleme sırası = kaynak sırası). Kardeş repo yoksa SKIP (CI/başka makine kırılmaz);
  // dosya VAR ama ayrıştırılamıyorsa KIRMIZI (sessiz geçiş yok).
  // BigInt LİTERALİ YOK (1n): Next build'in tip denetimi scripts/'i de tarıyor ve hedef
  // ES2017 — "BigInt literals are not available" ile build kırılıyordu. BigInt() çağrısı aynı.
  const FNV = (maps: [string, readonly string[]][], universal: readonly string[]): string => {
    let h = BigInt("0xcbf29ce484222325");
    const P = BigInt("0x100000001b3");
    const M = (BigInt(1) << BigInt(64)) - BigInt(1);
    const feed = (str: string) => {
      for (const b of Buffer.from(str, "utf8")) {
        h ^= BigInt(b);
        h = (h * P) & M;
      }
    };
    for (const [map, list] of maps) for (const n of list) feed(`${map}|${n}\n`);
    for (const n of universal) feed(`*|${n}\n`);
    return h.toString(16).padStart(16, "0");
  };
  // Algoritma pini: check-callout-sync.mjs tableDigest'in bu iki girdide verdiği değerler
  // (2026-09-24, masaüstü ebf30eb'de node ile hesaplandı). Özet tanımı sapmaz.
  t("özet algoritması check-callout-sync.mjs ile aynı (boş tablo = FNV ofseti)", FNV([], []) === "cbf29ce484222325", FNV([], []));
  t("özet algoritması check-callout-sync.mjs ile aynı (UTF-8 + evrensel satırı)",
    FNV([["x", ["a b", "ç"]]], ["c"]) === "91ccf4bbbd116967", FNV([["x", ["a b", "ç"]]], ["c"]));

  const backend = { maps: Object.entries(MAP_CALLOUTS) as [string, readonly string[]][], universal: UNIVERSAL_CALLOUTS };
  const deskDir = process.env.AIMLO_DESKTOP_DIR
    ? path.resolve(process.env.AIMLO_DESKTOP_DIR)
    : path.resolve(__dirname, "..", "..", "aimlo-desktop");
  const rsPath = path.join(deskDir, "src-tauri", "src", "callouts.rs");
  if (!fs.existsSync(rsPath)) {
    console.log(`  ⏭  SKIP — kardeş masaüstü reposu yok (${rsPath}); senkron kapısı release-desktop.ps1 0c'de`);
  } else {
    // parseDesktopRs (check-callout-sync.mjs) BİREBİR.
    const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    const names = (block: string) => [...block.matchAll(/"([^"\\]*)"/g)].map((m) => m[1]);
    const s = fs.readFileSync(rsPath, "utf8").replace(/\r\n/g, "\n");
    const u = /pub const UNIVERSAL_CALLOUTS:[^=]*=\s*&\[([\s\S]*?)\];/.exec(s);
    const m = /pub const MAP_CALLOUTS:[^=]*=\s*&\[([\s\S]*?)\n\];/.exec(s);
    t("callouts.rs ayrıştırılabildi (UNIVERSAL_CALLOUTS + MAP_CALLOUTS)", !!u && !!m, rsPath);
    if (u && m) {
      const desk = {
        maps: [...stripComments(m[1]).matchAll(/\(\s*"([^"]+)"\s*,\s*&\[([\s\S]*?)\]\s*\)/g)].map((e) => [e[1], names(e[2])] as [string, string[]]),
        universal: names(stripComments(u[1])),
      };
      const total = (t2: { maps: [string, readonly string[]][] }) => t2.maps.reduce((a, [, l]) => a + l.length, 0);
      const bd = FNV(backend.maps, backend.universal);
      const dd = FNV(desk.maps, desk.universal);
      console.log(`    backend  ${backend.maps.length} harita / ${total(backend)} girdi, özet ${bd}`);
      console.log(`    masaüstü ${desk.maps.length} harita / ${total(desk)} girdi, özet ${dd}`);
      // diffTables (check-callout-sync.mjs) — okunur fark satırları.
      const diff: string[] = [];
      const bMaps = backend.maps.map(([k]) => k), dMaps = desk.maps.map(([k]) => k);
      if (bMaps.join(",") !== dMaps.join(",")) diff.push(`harita listesi/sırası farklı: [${bMaps.join(", ")}] ↔ [${dMaps.join(", ")}]`);
      const dIdx = new Map(desk.maps);
      for (const [map, bl] of backend.maps) {
        const dl = dIdx.get(map);
        if (!dl) continue;
        const missing = bl.filter((n) => !dl.includes(n)), extra = dl.filter((n) => !bl.includes(n));
        if (missing.length) diff.push(`${map}: masaüstünde EKSİK: ${missing.join(", ")}`);
        if (extra.length) diff.push(`${map}: masaüstünde FAZLA: ${extra.join(", ")}`);
        if (!missing.length && !extra.length && bl.join("|") !== dl.join("|")) diff.push(`${map}: girdi SIRASI farklı`);
      }
      if (backend.universal.join("|") !== desk.universal.join("|")) diff.push("UNIVERSAL_CALLOUTS farklı");
      t("iki tablo sıra dahil BİREBİR (özet eşit) — ayrışırsa callouts.rs + d22 pini güncellenmeli",
        bd === dd && diff.length === 0, `→ ${diff.join(" · ")}`);
    }
  }
}

console.log("\n[15] CALLOUT KELİME KOPYASI (FB05 · F11) — coach-text CALLOUT_WORDS ↔ MAP_CALLOUTS birebir");
{
  // coach-text.ts landing bundle'ına girdiği için tabloyu import etmiyor; enforceSuppliedCallout'un
  // "başka callout'u hedef alma" koruması tablonun SABİT kelime kopyasını kullanıyor. Kural:
  // MAP_CALLOUTS ∪ UNIVERSAL_CALLOUTS adlarının boşlukla bölünmüş ≥4 harfli kelimeleri, sıralı.
  // Tabloya ad eklenip kopya güncellenmezse yeni ad düzeltici tarafından BAŞKA callout'a
  // çevrilebilir (F11 sınıfı) → burada KIRMIZI.
  const derived = new Set<string>();
  for (const c of [...Object.values(MAP_CALLOUTS).flat(), ...UNIVERSAL_CALLOUTS]) {
    for (const w of c.split(/\s+/)) if (w.length >= 4) derived.add(w);
  }
  const want = [...derived].sort();
  const have = [...CALLOUT_WORDS];
  const missing = want.filter((w) => !have.includes(w));
  const extra = have.filter((w) => !derived.has(w));
  t(`CALLOUT_WORDS tablodan türetilen kümeyle birebir (${want.length} kelime)`,
    missing.length === 0 && extra.length === 0 && have.join("|") === want.join("|"),
    `→ EKSİK: ${missing.join(", ") || "-"} · FAZLA: ${extra.join(", ") || "-"}`);
}

console.log("\n[16] EN BELİRSİZ ARTİKEL (FB05 · F12) — 'a long' / 'a short' / 'a wall' callout sanılıp silinmez");
{
  // HEAD (bu düzeltme öncesi, aitext/exp1 + v1 probe'ları): hepsi artikel+sıfatıyla birlikte
  // siliniyordu ("Jett held sightline down B Long", "Execute two-man post-plant", "Plant for
  // and play…", "Hold until…", "Chamber held, static A Main line").
  const keep: [string, string][] = [
    ["Jett held a long sightline down B Long with an Operator.", "Bind"],
    ["Jett sat on a long Operator angle and punished the wide front peek at B Long.", "Bind"],
    ["Omen was anchoring a long B Main line with a rifle.", "Sunset"],
    ["You exposed a long sightline without breaking her line.", "Ascent"],
    ["Execute a short two-man post-plant.", "Icebox"],
    ["Plant for a default and play off the spike.", "Ascent"],
    ["Hold a wall until the Sova drone is gone, then swing.", "Bind"],
    ["Hold a wall until the Sova drone is gone, then swing.", "Summit"],
    ["Chamber held a long, static A Main line.", "Lotus"],
    ["A long sightline punished your wide swing.", "Bind"],
  ];
  for (const [s, m] of keep) {
    const d = stripForeignCallouts(s, m, null, "en");
    t(`EN [${m}] bayt-aynı: "${s.slice(0, 44)}…"`, d === s, `→ "${d}"`);
  }
  // Callout HÂLÂ silinir: büyük harfli site öneki + büyük harfli ad (EN ve TR biçimi).
  const lotusEn = stripForeignCallouts("You died at A Short while pushing alone.", "Lotus", null, "en");
  t("EN [Lotus] 'You died at A Short' hâlâ siliniyor", lotusEn === "You died while pushing alone.", `→ "${lotusEn}"`);
  const lotusTr = stripForeignCallouts("A Short'ta öldün.", "Lotus", null, "en");
  t("EN istek [Lotus] 'A Short'ta öldün.' hâlâ siliniyor (cümle başı 'A' + büyük 'Short')", !/a short/i.test(lotusTr), `→ "${lotusTr}"`);
  const bindLong = stripForeignCallouts("A long sightline punished you. A Long is not on this map.", "Bind", null, "en");
  t("EN [Bind] cümle başı 'A long' korunur, 'A Long' (callout) silinir",
    bindLong.startsWith("A long sightline punished you.") && !/A Long/.test(bindLong), `→ "${bindLong}"`);
  // lang verilmeyen (TR) yol BAYT-AYNI: lang'sız çağrı = lang "tr" çağrısı (TR yolu değişmedi).
  for (const [s, m] of [...keep, ["A Short'ta öldün.", "Lotus"], ["Sova A Long'u kapatsın, sen B'yi tut.", "Bind"]] as [string, string][]) {
    t(`lang'sız = lang "tr": "${s.slice(0, 36)}…" [${m}]`, stripForeignCallouts(s, m) === stripForeignCallouts(s, m, null, "tr"));
  }
  // Bağlantı: realityCheck istek dilini strip'e geçiriyor (HEAD: geçirmiyordu → EN'de de siliniyordu).
  const rcEn = realityCheck("Jett held a long sightline down B Long.", [], undefined, "suggestion", "en", "Bind").text;
  t("realityCheck(lang=en, Bind) 'a long sightline' korunur", rcEn === "Jett held a long sightline down B Long.", `→ "${rcEn}"`);
  t("lang'sız yol eskisi gibi: [Bind] 'held a long sightline' (TR yolunda artikel kavramı yok)",
    stripForeignCallouts("Jett held a long sightline down B Long with an Operator.", "Bind") === "Jett held sightline down B Long with an Operator.");
}

console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
if (fail > 0) process.exit(1);
