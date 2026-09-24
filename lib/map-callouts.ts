/** HARİTA-BAŞINA CALLOUT TABLOSU — koçun uydurma yer adı söylemesini engeller.
 *
 * ## Neden var (canlı bug, 2026-07-21)
 *
 * Kaan LOTUS oynadı; maç raporu şöyle başladı:
 *   "A Short: Düşman takım sabit bekliyor, sen solo geniş açı aldın ve takım
 *    senkronunu bozarak A Short'ta tek başına girdin."
 *
 * **Lotus'ta "A Short" YOKTUR.** O callout Ascent/Bind/Haven'a aittir. Yani koç,
 * oynanmayan bir haritanın yer adını uydurdu. Radiant-seviye koçluk iddiasındaki
 * bir üründe bu, ilk cümlede güvenilirliği sıfırlayan türden bir hata.
 *
 * KÖK NEDEN: lib/reality-checker.ts içindeki POSITION_NAMES **tek, düz,
 * HARİTA-BAĞIMSIZ** bir listeydi ve "a short" o listede VARDI — doğrulayıcı onu
 * geçerli callout sayıp geçirdi, hangi haritanın oynandığına hiç bakmadan.
 *
 * ## Bu tablo nasıl üretildi
 *
 * 13 harita, 13 ayrı ajan tarafından knowledge/maps/<harita>.md dosyalarından
 * çıkarıldı (uydurma yasak — yalnız dosyada geçen yer adları), sonra bağımsız bir
 * denetçi ajan çapraz-sızıntı (bir haritaya başka haritanın callout'unun
 * yazılması), callout-olmayan girdi (ajan/yetenek/silah/genel terim) ve eksik
 * arayarak doğruladı. Denetim sonucu: Lotus listesi TEMİZ — "a short" YOK.
 *
 * ## Fazla girdi GÜVENLİ, eksik girdi TEHLİKELİ (bilinçli tercih)
 *
 * Bu tablo bir **beyaz liste**: yalnızca listede OLMAYAN callout'lar metinden
 * ayıklanır. Dolayısıyla risk asimetrik:
 *   • Fazladan girdi  → en kötü ihtimalle bir uydurmayı ayıklamayı kaçırırız.
 *   • Eksik girdi     → MEŞRU koçluk metnini bozarız (çok daha kötü).
 * Bu yüzden denetçinin tartışmalı bulduğu girdiler (ascent "rafters"/"hell",
 * split "link"/"lobby"/"heaven", bind "teleporter", ascent "ct") BİLEREK
 * listede BIRAKILDI.
 *
 * ## Bakım
 *
 * scripts/verify-kb.ts bu tablodaki her callout'un ilgili harita .md dosyasında
 * gerçekten geçtiğini doğrular — tablo KB'den sessizce sapamaz ([N]). Ters yönü
 * [N2] tutar: harita KB'sinin TAM METNİNDE geçen çok-kelimeli her callout adı (yalnız
 * kalın "- **X:**" etiketleri değil) kendi haritasında stripForeignCallouts'tan
 * bayt-aynı geçmeli — KB tablodan sessizce sapamaz.
 */

/** HER haritada bulunan evrensel konum adları.
 *
 * Bunlar harita-başına listelerde aranmaz: her Valorant haritasında saldıran ve
 * savunan spawn'ı vardır, ama KB dosyaları hepsini tek tek yazmaz (13 dosyanın
 * yalnız 3'ünde "defender spawn" geçiyor). Ayrı tutulmasalardı doğrulayıcı
 * bunları "yabancı callout" sayıp MEŞRU koçluk metninden silerdi — yani
 * uydurmayı engellerken gerçeği bozardık. verify-kb da bunları harita-başına
 * KB kontrolünden muaf tutar. */
export const UNIVERSAL_CALLOUTS: readonly string[] = [
  "attacker spawn",
  "defender spawn",
  "ct spawn",
  "t spawn",
];

/** Harita slug'ı → o haritada GERÇEKTEN bulunan callout adları (küçük harf).
 *
 * KB ↔ TABLO SENKRONU (TR-KALAN-17 / B10, 2026-09-24): KB'nin kalın callout
 * maddeleri ("- **B Tunnel:**") tabloda yoktu ama başka haritanın tablosunda
 * KANITLIYDI → stripForeignCallouts'un cross-map kapısı modelin KB'den öğrenip
 * yazdığı meşru adı siliyordu ("B Tunnel'da öldün." → "öldün."). Eklenenler ve
 * doğrulama kaynağı (resmi = wiki.playvalorant.com/en-us/<Harita> harita etiketleri;
 * metabot = metabot.gg/en/valorant/map/<Harita>/overview callout listesi):
 *   • fracture "a main", "a link", "b link", "b tunnel" — resmi + metabot +
 *     keengamer.com / theglobalgaming.com Fracture rehberleri
 *   • ascent "a link" — resmi ("Each site has one door (A Link for A and Market
 *     for B)") + redbull.com / dexerto.com ("down Mid Catwalk into A Link")
 *   • bind "b link" — resmi + metabot
 *   • haven "a tower" — resmi + metabot (A site etiketi; "A Heaven" resmi listede yok)
 *   • abyss "a default", "b default" — harita etiketi DEĞİL, genel plant-noktası
 *     terimi; bind/fracture/haven/icebox/lotus/pearl/split tablolarıyla aynı kural
 * Breeze "A Cave" EKLENMEDİ: resmi v7.04 notu "A Cave blocked off", güncel resmi
 * ve metabot listelerinde yok → KB maddesi (breeze.md) kaldırıldı.
 * Masaüstü src-tauri/src/callouts.rs MAP_CALLOUTS aynı eklemeleri almalı (D22).
 *
 * TAM-METİN SENKRONU (B10 inceleme [0], W3-fix 2026-09-24): [N2] yalnız "- **X:**"
 * etiketlerini tarıyordu; tam metin taraması aynı sınıftan üç meşru adı daha buldu
 * (kendi haritasının KB'sinde yazılı, tabloda yok, başka haritada kanıtlı → siliniyordu):
 *   • ascent "market kapısı" — ascent.md:167/:174/:245 ("Market kapısı kapatıldığında");
 *     resmi: "Each site has one door (A Link for A and Market for B)" (yukarıda)
 *   • haven "a sewer" — resmi Haven etiketi "A Sewer" (wiki.playvalorant.com/en-us/Haven);
 *     haven.md:22 "A Short = A Sewers". Model resmi tekil adı yazarsa Split kanıtıyla siliniyordu.
 *   • icebox "zip line" — icebox.md:11/:15/:61-64/:113/:166-167; resmi "Icebox is the first
 *     map to introduce horizontal ziplines, seen at A Site" (wiki.playvalorant.com/en-us/Icebox)
 * Üçü de başka bir tabloda zaten vardı (sunset / split / fracture) → tablo birleşimi, yani
 * silinebilir ad kümesi DEĞİŞMEDİ; başka haritada yeni silme oluşamaz.
 * Doğrulanamayan iki ad tabloya ALINMADI, KB metni düzeltildi: bind.md:167 "B Lobby" (resmi
 * Bind listesinde yok) ve fracture.md:150 "B CT" (resmi Fracture listesinde yok).
 * Masaüstü callouts.rs aynı üç eklemeyi almalı (D22 devamı — followup). */
export const MAP_CALLOUTS: Record<string, readonly string[]> = {
  abyss: ["a bridge", "a default", "a link", "a lobby", "a main", "a secret", "a security", "a site", "a tower", "a vent", "ascender", "attacker spawn", "b danger", "b default", "b link", "b lobby", "b main", "b nest", "b site", "b tower", "defender spawn", "mid", "mid bend", "mid bottom", "mid catwalk", "mid library", "mid top", "void"],
  ascent: ["a link", "a lobby", "a main", "a short", "a site", "b lanes", "b link", "b lobby", "b main", "b site", "back b", "boathouse", "catwalk", "closet", "ct", "ct b", "cubby", "defender spawn b", "dice", "garden", "gen", "generator", "heaven", "hell", "market", "market kapısı", "mid", "mid bottom", "mid courtyard", "mid link", "mid top", "pizza", "rafters", "switch", "top mid", "tree", "window", "wine"],
  bind: ["a bath", "a default", "a heaven", "a hell", "a lamps", "a lobby", "a short", "a showers", "a site", "a tower", "arka bahçe", "b default", "b elbow", "b garden", "b hall", "b hookah", "b link", "b long", "b site", "b window", "bath", "elbow", "garden", "hall", "hamam", "heaven", "hell", "hookah", "lamps", "long", "short", "showers", "teleporter", "triple box", "window"],
  breeze: ["a main", "a pyramid", "a site", "attacker spawn", "b main", "b site", "b window", "chute", "cubby", "defender spawn", "doors", "elbow", "halls", "mid", "nest", "pyramid", "window"],
  corrode: ["a link", "a main", "a site", "b elbow", "b link", "b main", "b site", "bottom mid", "elbow", "mid", "mid window", "pocket", "stairs", "top mid", "tower", "yard"],
  fracture: ["a default", "a dish", "a drop", "a hall", "a link", "a main", "a rope", "a site", "b arcade", "b canteen", "b default", "b generator", "b link", "b main", "b site", "b tower", "b tree", "b tunnel", "ct spawn", "defender spawn", "mid", "zip line"],
  haven: ["a default", "a heaven", "a hell", "a long", "a sewer", "a short", "a site", "a tower", "b back", "b default", "b site", "c default", "c link", "c long", "c platform", "c site", "ct spawn", "garage", "mid", "mid doors", "mid window", "plat"],
  // ⚠ AÇIK EKSİK — KB BOŞLUĞU (canlı-test #8, 2026-08-03): canlı maçta "mid boiler"
  // (log:1351) ve "b tube" (log:1377) 3/3 stratejiyle TEMİZ okundu, "mid blue" de
  // ölüm yeri oldu. Bileşik biçimleri bu tabloda YOK; yalnız çıplak "boiler"/"tube"/
  // "blue" var. Tabloya eklemeyi DENEDİM ve verify-kb [N] guard'ı HAKLI OLARAK
  // reddetti: knowledge/maps/icebox.md'de Boiler ve Blue hakkında TEK SATIR koçluk
  // içeriği yok (Tube var, ötekiler yok). Tabloya eklemek, koçun hakkında hiçbir
  // şey bilmediği bir bölge adını "meşru" ilan etmek olurdu.
  // KASITLI OLARAK EKLENMEDİ: eksik olan tablo değil, KB. Doğru sıra önce
  // icebox.md'ye Boiler/Blue koçluk içeriği yazmak (oyun-olgusal doğrulukla),
  // sonra tabloyu genişletmek. Harita bilgisi UYDURULMAZ.
  // Bu arada zarar YOK: desktop kanonik eşleyicisi kelime-bazlı kademeye sahip
  // ("mid" + "boiler" ayrı ayrı tabloda) → doğru okuma zaten geçiyor.
  icebox: ["a belt", "a box", "a default", "a main", "a nest", "a pipes", "a rafters", "a screens", "a site", "a zip", "b default", "b green", "b hall", "b kitchen", "b main", "b orange", "b site", "b snowman", "b yellow", "belt", "blue", "boiler", "ct spawn", "green", "kitchen", "mid", "nest", "orange", "pallet", "pipes", "rafters", "screens", "snowman", "t spawn", "tube", "yellow", "zip line"],
  lotus: ["a default", "a link", "a main", "a root", "a site", "a stairs", "a tree", "b default", "b main", "b site", "b upper", "c default", "c hall", "c main", "c mound", "c site", "c waterfall", "mid", "mid link", "silent drop", "waterfall"],
  pearl: ["a art", "a ct", "a default", "a dugout", "a flowers", "a link", "a main", "a secret", "a site", "b club", "b default", "b hall", "b link", "b main", "b ramp", "b screen", "b site", "b tower", "b tunnel", "ct spawn", "mid", "mid connector", "mid doors", "mid plaza", "mid shops", "mid top", "t spawn"],
  split: ["a back", "a ct", "a default", "a elbow", "a lobby", "a main", "a rafters", "a ramp", "a screens", "a sewer", "a site", "a tower", "b back", "b ct", "b default", "b garage", "b link", "b main", "b pillar", "b rafters", "b site", "b tower", "ct spawn", "elbow", "garage", "heaven", "link", "lobby", "mail", "mid", "mid bottom", "mid mail", "mid rope", "mid top", "mid vent", "pillar", "rafters", "ramp", "rope", "screens", "sewer", "t spawn", "tower", "vent"],
  // canlı-test #14 (web-doğrulandı, metabot.gg 24-callout listesi): 'a hall' ve
  // 'b drop' resmi listede VAR ama tabloda yoktu — 'b drop' summit.md §12'de zaten
  // yazılıydı (tablo-eksikliği meşru adı bozuyordu, map-callouts kendi dokümanının
  // "daha kötü yön" uyarısı); 'a hall' aynı commit'te summit.md §12'ye de eklendi
  // (verify-kb tablo→KB yönü ghost üretmesin). NOT: 'b ule' (Kaan OCR'ı) HİÇBİR
  // kaynakta yok — muhtemel TR 'B KULE'=B Tower artefaktı; dump kanıtı gelmeden
  // TR-varyant EKLENMEZ (düzeltme katmanı desktop kanonik eşleyicisidir).
  summit: ["a art", "a cave", "a garden", "a hall", "a link", "a lobby", "a main", "a site", "a wall", "b ct", "b drop", "b gym", "b link", "b lobby", "b main", "b site", "b tower", "b trophy", "b wall", "boxes", "close box", "ct", "double box", "mid", "mid bend", "mid bottom", "mid fountain", "mid tiles", "mid top", "mid wall", "mid window", "plant", "triples"],
  sunset: ["a alley", "a elbow", "a link", "a main", "a site", "b main", "b market", "b market kapısı", "b site", "boba", "courtyard", "ct spawn", "market", "market kapısı", "mid", "mid bottom", "mid courtyard", "mid top", "t spawn", "tiles"],
};

/** Harita adını tablo anahtarına indirger ("Lotus" → "lotus"). */
export function mapKey(map: string | undefined | null): string | null {
  if (!map) return null;
  const k = map.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(MAP_CALLOUTS, k) ? k : null;
}

/** Bu callout bu haritada var mı?
 *
 *  Harita bilinmiyorsa (tabloda yoksa, "Unknown" ise, hiç verilmediyse) TRUE
 *  döner — bilinmeyen haritada HİÇBİR ŞEY ayıklanmaz, davranış eskisiyle
 *  bayt-aynı kalır. Ayıklama yalnız haritayı KESİN bildiğimizde devreye girer. */
export function calloutBelongsToMap(callout: string, map: string | undefined | null): boolean {
  const c = callout.trim().toLowerCase();
  if (UNIVERSAL_CALLOUTS.includes(c)) return true; // her haritada var
  const k = mapKey(map);
  if (!k) return true;
  return MAP_CALLOUTS[k].includes(c);
}

// ── ÖLÇÜLEN KONUMUN KANONİK ADI (yakınsama Y03, 2026-09-24) ──────────────────────
// KANIT: reality-checker F14 halkası (correctContradictedDeathLocation) ölçülen deathLocation
// tabloda KANONİK değilse "çelişki" diye modelin DOĞRU callout'unu "o noktada"ya indiriyordu:
// saha v1.0.19 gövdeleri 'istemci b ana' (aimlo-runtime 01.txt:4974), 'a/lobi'
// (aimlo-runtimeKAAN.txt:4226), 'a/kanalizasyon' (LOG.txt:987) — probe: "Bu round B Main'de
// öldün" → "Bu round o noktada öldün". v1.0.19 masaüstü bu okumaları TR→EN eşlemeden HAM
// gönderiyor (güncel masaüstü callouts.rs TR_WORD_ALIASES + tidy_callout ile çözüyor).
// Bu yardımcı YALNIZ karşılaştırma içindir: gönderilen/saklanan değer değişmez (A016).
// Kural masaüstüyle aynı yönde ve DAR: (1) '/' '\' → boşluk; (2) baştaki HUD token'ları
// (rakamlı ya da katlanmış hâlde 'emc'/'fps'/'ient'/'surum' içeren, ya da a/b/c dışındaki
// tek harf — FPS/"İstemci" sayacı kırpıma sızıyor, ocr.rs tidy_callout testleri) atılır;
// (3) çok-kelimeli ve kelime başına TR→EN eşleme (callouts.rs TR_PHRASE_ALIASES /
// TR_WORD_ALIASES BİREBİR — test-map-callouts [16] kardeş repoyla kıyaslar); (4) sonuç O
// HARİTANIN tablosundaysa döner, değilse null (uydurma kanonik ad ÜRETİLMEZ).
/** callouts.rs TR_WORD_ALIASES birebir (anahtarlar katlanmış: ü→u ş→s ğ→g ç→c ı→i ö→o). */
export const TR_WORD_ALIASES: readonly (readonly [string, string])[] = [
  ["lobi", "lobby"], ["lobisi", "lobby"], ["orta", "mid"], ["ana", "main"], ["pazar", "market"],
  ["cennet", "heaven"], ["cehennem", "hell"], ["bolge", "site"], ["baglanti", "link"], ["kupa", "trophy"],
  ["bahce", "garden"], ["ust", "top"], ["alt", "bottom"], ["agac", "tree"], ["donemec", "bend"],
  ["kirisler", "rafters"], ["kiris", "rafters"], ["carsi", "market"], ["hucre", "cubby"], ["cesme", "fountain"],
  ["resim", "art"], ["pencere", "window"], ["uzun", "long"], ["garaj", "garage"], ["kule", "tower"],
  ["kanalizasyon", "sewer"], ["kapilar", "doors"], ["seramikler", "tiles"], ["seramik", "tiles"], ["hol", "hall"],
  ["botge", "site"],
];
/** callouts.rs TR_PHRASE_ALIASES birebir (çok-kelimeli TR ad → tek EN kelime). */
export const TR_PHRASE_ALIASES: readonly (readonly [string, string])[] = [
  ["spor salonu", "gym"],
  ["pazar yeri", "market"],
];
const TR_FOLD_MAP: Record<string, string> = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };
function foldTrWord(w: string): string {
  return w.toLocaleLowerCase("tr").replace(/\u0307/g, "").replace(/[çğıöşüâîû]/g, (c) => TR_FOLD_MAP[c] ?? c);
}
function isHudToken(tok: string): boolean {
  const f = foldTrWord(tok);
  if (/\d/.test(f)) return true;
  if (/emc|fps|ient|surum/.test(f)) return true;
  return f.replace(/[^a-z]/g, "").length <= 1 && !/^[abc]$/.test(f);
}
/** Ölçülen (ham) konumun o haritadaki kanonik adı; eşlenemezse null. Bkz. yukarıdaki not. */
export function canonicalCalloutForMap(raw: string, mk: string): string | null {
  const table = MAP_CALLOUTS[mk];
  if (!table) return null;
  const low = raw.trim().toLocaleLowerCase("tr").replace(/\u0307/g, "").replace(/[/\\]+/g, " ").replace(/\s+/g, " ").trim();
  if (!low) return null;
  if (table.includes(low)) return low;
  let toks = low.split(" ");
  while (toks.length > 1 && isHudToken(toks[0])) toks = toks.slice(1);
  const words = new Map(TR_WORD_ALIASES.map(([a, b]) => [a, b] as [string, string]));
  const phrases = new Map(TR_PHRASE_ALIASES.map(([a, b]) => [a, b] as [string, string]));
  const out: string[] = [];
  for (let i = 0; i < toks.length; i++) {
    const f = foldTrWord(toks[i]);
    const pair = i + 1 < toks.length ? phrases.get(`${f} ${foldTrWord(toks[i + 1])}`) : undefined;
    if (pair) { out.push(pair); i++; continue; }
    out.push(words.get(f) ?? toks[i]);
  }
  const cand = out.join(" ");
  return table.includes(cand) ? cand : null;
}
