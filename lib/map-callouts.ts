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
 * gerçekten geçtiğini doğrular — tablo KB'den sessizce sapamaz.
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

/** Harita slug'ı → o haritada GERÇEKTEN bulunan callout adları (küçük harf). */
export const MAP_CALLOUTS: Record<string, readonly string[]> = {
  abyss: ["a bridge", "a link", "a lobby", "a main", "a secret", "a security", "a site", "a tower", "a vent", "ascender", "attacker spawn", "b danger", "b link", "b lobby", "b main", "b nest", "b site", "b tower", "defender spawn", "mid", "mid bend", "mid bottom", "mid catwalk", "mid library", "mid top", "void"],
  ascent: ["a lobby", "a main", "a short", "a site", "b lanes", "b link", "b lobby", "b main", "b site", "back b", "boathouse", "catwalk", "closet", "ct", "ct b", "cubby", "defender spawn b", "dice", "garden", "gen", "generator", "heaven", "hell", "market", "mid", "mid bottom", "mid courtyard", "mid link", "mid top", "pizza", "rafters", "switch", "top mid", "tree", "window", "wine"],
  bind: ["a bath", "a default", "a heaven", "a hell", "a lamps", "a lobby", "a short", "a showers", "a site", "a tower", "arka bahçe", "b default", "b elbow", "b garden", "b hall", "b hookah", "b long", "b site", "b window", "bath", "elbow", "garden", "hall", "hamam", "heaven", "hell", "hookah", "lamps", "long", "short", "showers", "teleporter", "triple box", "window"],
  breeze: ["a main", "a pyramid", "a site", "attacker spawn", "b main", "b site", "b window", "chute", "cubby", "defender spawn", "doors", "elbow", "halls", "mid", "nest", "pyramid", "window"],
  corrode: ["a link", "a main", "a site", "b elbow", "b link", "b main", "b site", "bottom mid", "elbow", "mid", "mid window", "pocket", "stairs", "top mid", "tower", "yard"],
  fracture: ["a default", "a dish", "a drop", "a hall", "a rope", "a site", "b arcade", "b canteen", "b default", "b generator", "b main", "b site", "b tower", "b tree", "ct spawn", "defender spawn", "mid", "zip line"],
  haven: ["a default", "a heaven", "a hell", "a long", "a short", "a site", "b back", "b default", "b site", "c default", "c link", "c long", "c platform", "c site", "ct spawn", "garage", "mid", "mid doors", "mid window", "plat"],
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
  icebox: ["a belt", "a box", "a default", "a main", "a nest", "a pipes", "a rafters", "a screens", "a site", "a zip", "b default", "b green", "b hall", "b kitchen", "b main", "b orange", "b site", "b snowman", "b yellow", "belt", "blue", "boiler", "ct spawn", "green", "kitchen", "mid", "nest", "orange", "pallet", "pipes", "rafters", "screens", "snowman", "t spawn", "tube", "yellow"],
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
