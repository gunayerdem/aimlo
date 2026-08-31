// lib/death-type.ts
// DETERMINISTIC death-type classifier (Cycle "variety", 2026-06-30).
//
// ROOT CAUSE this fixes (live-test, softi): in a single match all rounds returned
// the SAME idea — "açıkta kaldın + utility'siz girme". universal.md HAS an 11-type
// death taxonomy, but selection was left to the model, which runs at
// reasoning_effort:"minimal" over a 300+-line KB → it can't pick the right block and
// falls back to the most generic two ("util'siz girme" / "açıkta dur-ma"). The few-shot
// itself modelled that phrasing, and there is no cross-round memory.
//
// FIX: derive the death-type DETERMINISTICALLY from the OCR fields the desktop already
// sends (no new AI call, no I/O — pure function, microseconds), then INJECT a directive
// that tells the model exactly which lesson to give for THIS death and to NOT repeat
// concepts already used earlier this match. Different death context → different type →
// different concept, by construction. Latency-neutral (string only, user-message side).
//
// NO FAKE / NO word-killing: this does not delete words; it STEERS the concept at the
// source. The "exposed/no-utility" concept stays valid for the two types where it is
// genuinely correct (info-less-push, entry-no-trade); it just stops being the default.
//
// NOT (denetim 2026-07-08): "lurk-caught" tipi classifyDeath'in HİÇBİR dalından
// dönmez — DeathSignals'ta takımdan-uzaklık sinyali yok (desktop göndermiyor).
// Tip + KB bloğu bilinçli DURUYOR: desktop bir gün team-distance/flank sinyali
// gönderirse tek dalla aktive olur; ayrıca desktop roundHistory'de death_type
// echo'lar, dışarıdan gelen "lurk-caught" ban-listesi yolunda geçerli kalmalı.

import { extractKillerWeapon, extractLoadoutWeapon } from "@/lib/comp-weapon";

export type DeathType =
  | "repeat-angle"
  | "op-angle"
  | "pistol-round"
  | "eco-force-loss"
  | "entry-no-trade"
  | "entry-traded"               // denetim B85 (2026-07-31): trade'LENMİŞ ölüm — azarlanmaz
  | "post-plant-solo"
  | "retake-no-util"
  | "retake-advantage-thrown"   // KB wiring 2026-07-19: sayı avantajlı retake'i tek tek eritme
  | "over-peek-advantage"
  | "numbers-down-carry"        // KB wiring 2026-07-19: sayı azken silahı taşı
  | "crosshair-loss"
  | "timing-window"
  | "late-no-plant"             // KB wiring 2026-07-19: geç round + plant yok (saldırı)
  | "late-def-no-plant"         // KB wiring 2026-07-19: geç round + plant yok (savunma)
  | "full-buy-first-contact"    // KB wiring 2026-07-19: tam alımda açılış ölümü
  | "op-loss"                   // KB wiring 2026-07-19: kendi loadout'unda Operator'le ölüm
  | "low-hp-no-save"
  | "clutch-lost"
  | "ult-in-pocket"
  | "lurk-caught"
  | "loss-streak"               // KB wiring 2026-07-19: akıllı default — 3+ üst üste kayıp
  | "win-streak-comfort"        // KB wiring 2026-07-19: akıllı default — 3+ üst üste kazanç
  | "overtime-matchpoint"       // KB wiring 2026-07-19: akıllı default — uzatma/maç sayısı
  | "def-no-crossfire"          // KB wiring 2026-07-19: savunmada trade'lenmemiş ölüm
  | "def-wide-hold"
  | "info-less-push";

/** Per-type coaching guide: the universal.md block to anchor on, the one-line lesson
 *  (DISTINCT concept, not a synonym of another), and a short concept tag used for the
 *  cross-round "don't repeat" ban list. Lessons are deliberately different IDEAS.
 *
 *  kbBlock SÖZLEŞMESİ (denetim 2026-07-08 — 5 çapa parafraz yüzünden KOPUKTU):
 *  kbBlock = universal.md'deki başlığın VERBATIM hâli: "H2" ya da "H2 — H3".
 *  ASLA parafraz/kısaltma yazma — reasoning minimal'de model başlığı arayıp
 *  bulamazsa en generic bloğa kaçıyor (çeşitlilik fixi delinir).
 *  scripts/verify-kb.ts bu sözleşmeyi assert eder (kırık çapa CI'da patlar). */
export const DEATH_TYPE_GUIDE: Record<DeathType, { kbBlock: string; angle: string; concept: string }> = {
  "repeat-angle":        { kbBlock: "Okunabilirlik ve Bilgi Sızıntısı Ölümleri", angle: "aynı açıdan tekrar öldün, pozisyonun okundu — o açıyı bir round tamamen boş bırak, düşmanın okumasını boşa çıkar", concept: "okunma" },
  "op-angle":            { kbBlock: "Zamanlama Ölümleri — Operatöre karşı timing'ini kır", angle: "tek açıya kilitli bir operatör/awp seni aynı timing'le yakaladı — o silah çekilince veya körlenince re-peek at, kendi zamanlamanı kır", concept: "op-timing" },
  "pistol-round":        { kbBlock: "Erken Round Ölümleri", angle: "pistol round'da tüfek-round'u gibi düello aradın — tabanca mesafesinde oyna, util'le açı kapat, ilk ölümü sen olma", concept: "pistol-acilis" },
  "eco-force-loss":      { kbBlock: "Karar ve Ekonomi Ölümleri", angle: "zayıf ekonomide tam-alımmış gibi oynayıp silahı yaktın — düşman elini oku, yarım alımla bas ya da düşmanın yerini öğrenip sağ kal", concept: "ekonomi-karari" },
  "entry-no-trade":      { kbBlock: "Pozisyon ve Açı Ölümleri — Solo peek yerine geri-alım kurulumu", angle: "solo giriş yapıp space aldın ama ölümün geri-alınmadı — yanındaki arkadaş trade'e hazır beklerken, senkronlu gir", concept: "trade-yok" },
  // TRADE'LENMİŞ ÖLÜM (denetim B85, 2026-07-31): ölüm trade'lendiyse çoğu zaman
  // DOĞRU oyundur (space alıp trade bırakmak) — ders "hata yaptın" değil, "alınan
  // alan kullanıldı mı" olmalı. kbBlock takım/alan bölümü (universal.md H2).
  "entry-traded":        { kbBlock: "Takım Koordinasyonu ve Alan Kontrolü", angle: "ölümün takımın tarafından trade'lendi — space'i doğru ödedin; asıl soru alanın kullanılıp kullanılmadığı: girişin takımın basışıyla aynı anda mıydı, arkandan gelen hazır mıydı", concept: "trade-edilmis-space" },
  "post-plant-solo":     { kbBlock: "Post-Plant Ölümleri", angle: "spike kurulduktan sonra tek açı tuttun ve retake'i tek karşıladın — çapraz post-plant açısı kur, zamanı oyna, sen onlara gitme", concept: "post-plant-tek-aci" },
  "retake-no-util":      { kbBlock: "Retake Ölümleri", angle: "site'ı util'siz/dağınık geri almaya çalıştın — util'i defuse'u geciktirmeye harca ve birlikte sayı bas, tek tek girme", concept: "retake-dagintik" },
  "retake-advantage-thrown": { kbBlock: "Retake Ölümleri — Sayı avantajlı retake'i tek tek eritme", angle: "retake'te sayı avantajı sendeyken tek tek girip eridin — sayı sendeyken bile trade dizilimiyle aynı anda girin; bir kayıp avantajı eşitler, defuse penceresi daralır", concept: "retake-avantaj" },
  "over-peek-advantage": { kbBlock: "Avantaj Yönetimi — Üstünlüğü Sadeleştir", angle: "sayı üstünündeyken gereksiz peek arayıp avantajı eşitledin — önde olduğun round'da köşe kur, düşmanı sana gelmeye zorla", concept: "avantaj-yaktin" },
  "numbers-down-carry":  { kbBlock: "Karar ve Ekonomi Ölümleri — Sayı azken silahı taşı", angle: "sayı net karşıdayken dövüş arayıp silahı da teslim ettin — kaybedilmiş sayıda dövüş arama; tutulmayan yoldan çekil, silahı ve util'i sonraki round'a taşı", concept: "sayi-azken-tasi" },
  "crosshair-loss":      { kbBlock: "Aim ve Crosshair Ölümleri", angle: "tam alım düellosunda göründüğün an vuruldun, nişanın hazır değildi — crosshair'i baş hizasında tut, dur-ateş-et disiplinine gir", concept: "crosshair" },
  "timing-window":       { kbBlock: "Zamanlama Ölümleri — Beklenti penceresi kapanınca çık", angle: "smoke/duvar daha açılırken, beklenti penceresi açıkken çıktın — pencere kapanınca, düşmanın gevşeme anında peek at", concept: "zamanlama-penceresi" },
  "late-no-plant":       { kbBlock: "Zamanlama Ölümleri — Geç round'da plant yoksa bekleme", angle: "geç round'da spike hâlâ kurulu değilken beklemeye devam ettin — karar ver: ya sadeleşip plant için bas ya da silahları sonraki round'a taşı; ikisinin ortasında bekleme", concept: "gec-plant-yok" },
  "late-def-no-plant":   { kbBlock: "Zamanlama Ölümleri — Plant yoksa savunmada zaman senin", angle: "savunmada geç round'da spike kurulmamışken dövüş aradın — zaman senin lehine, plant edemeyen saldırı kaybeder; av arayıp silah hediye etme, açını tut", concept: "savunmada-zaman" },
  "full-buy-first-contact": { kbBlock: "Karar ve Ekonomi Ölümleri — Tam alımda ilk temas util'in işi", angle: "tam alım round'unun açılışında ilk teması sen aldın — ilk temas util'in işi: smoke ya da flash inmeden geniş açıya çıkma, takımla trade mesafesinde gir", concept: "tam-alim-acilis" },
  "op-loss":             { kbBlock: "Karar ve Ekonomi Ölümleri — Operator'ü bedavaya teslim etme", angle: "elinde Operator varken ölüp silahı düşmana bıraktın — atıştan sonra yer değiştir, trade'siz açık düello arama; hattı tut, dövüşü düşman sana gelince aç", concept: "op-teslim" },
  "low-hp-no-save":      { kbBlock: "Karar ve Ekonomi Ölümleri — Kaybedilmiş dövüşü zorlama — silahı kurtar", angle: "kaybedilmiş dövüşte save etmeyip silahı sundun — dezavantajdayken dövüş aramayı bırak, silahı kurtar, sonraki round'a yatırım yap", concept: "save-etmedin" },
  "clutch-lost":         { kbBlock: "Karar ve Ekonomi Ölümleri — Clutch'ı 1v1 dizisine indir", angle: "son canlıyken sonuca göre değil panikle oynadın — tek açı izole et, sesle düşmanları ayır, durumu ardışık 1v1'lere indir", concept: "clutch" },
  "ult-in-pocket":       { kbBlock: "Karar ve Ekonomi Ölümleri — Dolu ult'la ölme — hazır ult'u cebinde çürütme", angle: "ult'un doluyken hiç kullanmadan öldün — ölüm riski yüksek hamleyi ult'suz alma; hamleyi ult'la aç ya da ilk teması takıma bırak", concept: "ult-cepte" },
  "lurk-caught":         { kbBlock: "Lurk Ölümleri", angle: "takımdan kopuk erken lurk'te yakalandın — lurk'ünü execute'a senkronla, takım baskısı havadayken düşmanın yerini öğren", concept: "lurk" },
  "loss-streak":         { kbBlock: "Seri Kayıp Sonrası Round", angle: "üst üste kayıp serisinde plan karmaşasıyla düştün — bir round'u bilerek sadeleştir: tek site tek plan, util sırayla insin, ilk teması util ya da birlikte çıkan takım açsın", concept: "seri-kayip" },
  "win-streak-comfort":  { kbBlock: "Karar ve Ekonomi Ölümleri — Kazanma serisinde bonus baskınına hazır ol", angle: "kazanma serisinde rahatlayıp düşmanın bonus baskınına yakalandın — düşman en yüksek kayıp bonusunda, force gelir: mesafeni koru, yakın mesafeye inme, anti-eco disipliniyle oyna", concept: "seri-rahatlik" },
  "overtime-matchpoint": { kbBlock: "Uzatma ve Maç Sayısı Round'u", angle: "maçın en ağır round'unda yeni fikir deneyip düştün — en çok tutan setup'ı oyna, kahramanlık peek'i arama; ilk teması util ya da takım açsın", concept: "yuksek-agirlik" },
  "def-no-crossfire":    { kbBlock: "Pozisyon ve Açı Ölümleri — Crossfire kur, yan yana durma", angle: "savunmada ölümün trade'lenmedi, açıyı desteksiz tuttun — round başında crossfire kur: biri klasik köşeyi, diğeri onu gören yan açıyı tutsun; düşen anında geri alınsın", concept: "crossfire-yok" },
  "def-wide-hold":       { kbBlock: "Pozisyon ve Açı Ölümleri — Açıkta değil, siperin yanında dur", angle: "savunmada açıyı erken/geniş açtın ve ilk atışı yedin — siperin yanında dur, off-angle al, peek atmadan ilk kontağı bekle", concept: "savunma-genis-aci" },
  "info-less-push":      { kbBlock: "Zamanlama Ölümleri — Tetikleyici bekle — açılışta da, basarken de", angle: "somut bir tetikleyici beklemeden, düşmanın yerini öğrenmeden bastın — ses kesilmesi ya da ilk kontağı bekle, sonra çık", concept: "tetikleyici-yok" },
};

/** Subset of the vision request used for classification. All optional — absent fields
 *  simply skip their branch. Field names + values match the live desktop payload. */
export type DeathSignals = {
  side?: string;            // "attacking" | "defending" (desktop) — normalised here
  killerInfo?: string;      // "killed by jett with vandal"
  deathLocation?: string;
  deathTiming?: string;     // "early" | "mid" | "late"
  // healthAtDeath SINIFLANDIRMADA ARTIK KULLANILMIYOR (canlı-test #8 devamı,
  // 2026-07-19): ölüm-anı tek HP örneği çatışma-öncesi canı KANITLAYAMAZ (stale
  // + çatışma-içi hasarı yakalar) — hp>=100 "tam can" kapısı da 50 can + 50
  // kalkanla kırpılmış oyuncuyu 100 gösteriyordu. Alan geriye-uyumluluk için
  // duruyor (eski çağıranlar geçmeye devam edebilir); hiçbir dal okumaz.
  // ÖLÜ SİNYAL KABLOSU (denetim B114+B131, 2026-07-31): route.ts hâlâ
  // hpSampleAgeSec ile bu alanı özenle stale-gate'leyip classifier'a geçiriyor,
  // desktop da "backend stale-gate'ler" gerekçesiyle göndermeye devam ediyor —
  // ama BURADA HİÇBİR DAL OKUMUYOR (canlı-test #8 BİLİNÇLİ kaldırma kararı).
  // Pratik etki sıfır; tehlike şu: buraya yeni bir hp-bağımlı dal eklenirse
  // "kesin veri yoksa CAN feedback'i YOK" kuralı sessizce delinir. Yeni dal
  // EKLEME — CAN/HP iddiası prompt'ta da, çıktı süzgecinde de yasak.
  healthAtDeath?: number;   // 0-150 — ölü alan, yalnız back-compat (tüketici YOK)
  alliesAlive?: number;     // 0-4
  enemiesAlive?: number;    // 0-5
  spikePlanted?: boolean;
  ultReady?: boolean;       // ult charged + unused at death (desktop OCR truth)
  economyType?: string;     // "full_buy" | "force_buy" | "half_buy" | "eco" | "pistol"
  tradedByAlly?: boolean;
  repeatedPosition?: boolean; // derived in route.ts from roundHistory
  // ── KB wiring 2026-07-19 (yeni sinyaller — hepsi opsiyonel, yokken dal atlanır) ──
  loadout?: string;         // oyuncunun KENDİ silahı, örn. "operator" (op-loss kapısı)
  playerAgent?: string;     // oyuncu ajanı — Clove ult istisnası (ult yalnız ölüm sonrası)
  lossStreak?: boolean;     // route.ts türetir: önceki 3+ round üst üste kayıp
  winStreak?: boolean;      // route.ts türetir: önceki 3+ round üst üste kazanç
  highStakes?: boolean;     // route.ts türetir (score): uzatma ya da maç sayısı round'u
};

/** ── DERS AİLELERİ (canlı-test #14, 2026-09-01 — Kaan 8/12 aynı-nakarat vakası) ──
 *  Kullanıcı KULAĞINDA aynı ders gibi çınlayan tipler tek ailede toplanır:
 *  over-peek-advantage ("gereksiz geniş peek atma") + def-wide-hold ("açıyı geniş
 *  açtın") + full-buy-first-contact ("geniş açıya çıkma") üçü de "geniş açı/peek"
 *  nakaratı. Tekrar sayacı ve bastırma AİLE düzeyinde işler — tip değişse de aynı
 *  nakarat sürüyorsa tekrar sayılır. Aile üyesi olmayan tipler kendi başına aile. */
export const DEATH_TYPE_FAMILY: Partial<Record<DeathType, string>> = {
  "over-peek-advantage": "genis-aci",
  "def-wide-hold": "genis-aci",
  "full-buy-first-contact": "genis-aci",
};

/** Tip → aile anahtarı (ailesizse tipin kendisi). */
export function deathFamily(t: DeathType): string {
  return DEATH_TYPE_FAMILY[t] ?? t;
}

/** Classify a death into exactly one type. Priority = MOST specific → most generic;
 *  the first matching branch wins, so an op death is "op-angle" even if it was also a
 *  solo entry. `info-less-push` is the genuine default (no specific signal).
 *
 *  `suppress` (canlı-test #14): bastırılan tipin dalı ATLANIR ve akış bir sonraki
 *  GERÇEK dala düşer — uydurma yok, kanıt-temelli kalır. Yalnız aile-üyesi dallar
 *  bastırılabilir; yan default'lar (def-wide-hold/info-less-push, satır sonu) asla
 *  bastırılmaz → sonuç her zaman var (kurtarma-yolu kuralı). Aile-bastırma kararının
 *  kendisi classifyDeathVaried'de: akış aynı ailenin default'una dönerse bastırma
 *  İPTAL edilir ve orijinal tip korunur (çeşitlilik o durumda banLine katmanından gelir). */
export function classifyDeath(b: DeathSignals, suppress?: ReadonlySet<DeathType>): DeathType {
  const killer = (b.killerInfo || "").toLowerCase();
  // Tek-kaynak silah sözlüğü (lib/comp-weapon.ts WEAPON_CLASS) — denetim 2026-07-08:
  // eski yerel regex'te judge EKSİKTİ (eco/force'un ana silahı) ve bulldog (2050
  // kredilik tüfek) yanlışlıkla eco sayılıyordu. "op"/"awp" kısaltmaları sözlükte
  // yok ama OCR'da geçebilir — sniper dalı için ayrıca kabul edilir.
  const kw = extractKillerWeapon(killer);
  const isOp = kw?.cls === "sniper" || /\b(op|awp)\b/.test(killer);
  const isEcoWeapon = kw ? kw.cls === "pistol" || kw.cls === "smg" || kw.cls === "shotgun" : false;
  // KENDİ silahın (KB wiring 2026-07-19): loadout OCR — sözlük-bağlı; op-loss dersi
  // özel olarak Operator içindir (Marshal/Outlaw dahil DEĞİL — "en pahalı silah" dersi).
  // "op"/"awp" kısaltmaları isOp ile aynı gerekçeyle ayrıca kabul edilir.
  const ownWeapon = extractLoadoutWeapon(b.loadout);
  const hasOperator = ownWeapon?.name === "operator" || /\b(op|awp)\b/.test((b.loadout || "").toLowerCase());
  // Clove istisnası (KB wiring 2026-07-19): Clove ult'u YALNIZ ölüm SONRASI
  // kullanılabilir (kendini diriltme) — "hamleyi ult'la aç" dersi Clove için
  // oyun-olgusal imkânsız ve clove.md ile aynı prompt'ta çelişir → dal atlanır.
  const agentSlug = (b.playerAgent || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const side = (b.side || "").toLowerCase();
  const atk = side.startsWith("attack");
  const def = side.startsWith("defend") || side.startsWith("defens");
  const aa = b.alliesAlive, ea = b.enemiesAlive;
  const eco = (b.economyType || "").toLowerCase();
  // GÜVENİLİRLİK GUARD'I (denetim, wiring bulgusu-2): reality-checker aynı sinyali
  // "desktop 0-ile-okunamadı'yı ayırt edemez" diye güvenilmez sayıyor (hasAliveCount
  // hard-false). aa=0 ∧ ea=0 = "okunamadı" imzası → clutch-lost/over-peek dalları
  // bu durumda ATLANIR; yoksa her okunamayan round yanlış "clutch paniği" dersi alır.
  const aliveReliable = typeof aa === "number" && typeof ea === "number" && !(aa === 0 && ea === 0);

  // Priority order: specific → generic.
  if (b.repeatedPosition) return "repeat-angle";                          // read by the enemy — top priority
  if (isOp) return "op-angle";                                            // weapon-anchored
  // retake-advantage-thrown (KB wiring 2026-07-19): retake-no-util'den ÖNCE —
  // sayı avantajı varken tek tek erime daha spesifik retake hatası. aa>ea STRICT
  // (over-peek'in aksine eşitlik burada avantaj sayılmaz).
  if (b.spikePlanted && def && aliveReliable && (aa as number) > (ea as number)) return "retake-advantage-thrown";
  if (b.spikePlanted && atk) return "post-plant-solo";                    // attack + spike up
  if (b.spikePlanted && def) return "retake-no-util";                     // defense + spike up = retake
  // op-loss (KB wiring 2026-07-19): spike dallarından SONRA (retake/post-plant
  // bağlamı daha spesifik), ult dalından ÖNCE — Operator kaybı çift kayıptır.
  if (hasOperator) return "op-loss";                                      // died holding an Operator
  // ult-in-pocket (KB pipeline denetimi 2026-07-19): sinyal payload'da VARDI
  // (route ctx.ultReady) ama classifier dalı yoktu → universal.md "Dolu ult'la
  // ölme" bloğu deterministik yoldan hiç seçilemiyordu. Spike dallarından SONRA:
  // post-plant/retake bağlamı dolu-ult dersinden daha spesifik.
  //
  // 🔴 MUAFİYET GENİŞLETİLDİ (canlı-test #7, softi 2026-07-31): Jett oynarken
  // 6 round'un 3'ünde "ultin hazırken öldün" dersi geldi ("sürekli geliyor,
  // reyna jett gibi karakterlere gelmemeli"). Oyun gerçeği: bu ajanların ult'u
  // KENDİNE DÖNÜK dövüş aracıdır (Jett bıçak, Reyna İmparatoriçe, Neon Overdrive,
  // Phoenix geri-dönüş, Iso düello, Chamber ult'u = ult-puanıyla alınan Op) —
  // doğru anı bekletmek NORMALdir, ult'lu ölüm tek başına hata değildir. Ders,
  // takım-etkili büyük ult'lar (Sova/Brim/Killjoy/Sage/Breach...) için kalır;
  // onlarda cepte çürüyen ult gerçek kayıptır. Clove istisnasının gerekçesi ayrı
  // (ult'u ölüm SONRASI çalışır) ama sonuç aynı: dal atlanır.
  const ULT_POCKET_EXEMPT = new Set(["clove", "jett", "reyna", "neon", "phoenix", "iso", "chamber"]);
  if (b.ultReady === true && !ULT_POCKET_EXEMPT.has(agentSlug)) return "ult-in-pocket"; // died with charged, unused ult
  // Pistol round = kendi bloğu (denetim: universal.md "Erken Round Ölümleri" bölümü
  // hiçbir tipe bağlı değildi = ölü içerik; pistol ölümü eco dersi değil açılış dersi ister).
  if (eco === "pistol") return "pistol-round";
  // Eco dalı KENDİ ekonomine bakar (denetim: katilin silahından oyuncunun ekonomisini
  // çıkarsamak yanlıştı — half_buy'da spectre'ye ölen "silahı yaktın" dersi alıyordu).
  if (eco === "eco" || eco === "force_buy") return "eco-force-loss";      // economy decision
  // low-hp-no-save TETİKLEYİCİSİ KALDIRILDI (canlı-test #8, softi 2026-07-19):
  // ölüme ≤4sn kala alınan HP örneği çatışma İÇİNDEKİ hasarı yakalıyor — tam
  // canla girip kırpılarak ölen oyuncu "düşük canla, save etmeliydin" dersi
  // alıyordu (yanlış: ders "dövüşe ZATEN düşük girme" içindir ve tek örnekten
  // giriş-anı HP'si KANITLANAMAZ). softi kuralı: kesin veri yoksa CAN'la ilgili
  // feedback YOK. Tip enum'da + rehberde duruyor (desktop echo + verify-kb
  // çapa uyumu); yalnız erişilemez.
  if (aliveReliable && aa === 0) return "clutch-lost";                    // last alive (sayı okunduysa)
  // numbers-down-carry (denetim fix 2026-07-19): GERÇEK sayı dezavantajı şart —
  // alliesAlive oyuncu HARİÇ olduğundan ölüm-öncesi dezavantaj aa+1<ea ⇔ aa<ea-1.
  // Eski aa<ea kapısı aa+1==ea (EŞİT sayı; örn. round'un İLK ölümü 5v5'te aa=4,
  // ea=5) durumunu da yakalayıp "sayı net karşıdaydı" diye YANLIŞ kesin-iddia
  // üretiyordu (CAN-iddiası yasağıyla aynı sınıf hata). KB bloğu "Sayı azken GEÇ
  // dövüş" dediği için deathTiming==='late' şartı da eklendi; erken/orta dezavantaj
  // ölümleri alttaki spesifik dallara düşer. late-no-plant'ten ÖNCE: geç round +
  // net dezavantajda "silahı taşı" dersi genel karar dersinden daha keskin.
  if (aliveReliable && (aa as number) > 0 && (aa as number) < (ea as number) - 1 && b.deathTiming === "late") return "numbers-down-carry"; // numbers against, late
  // Geç-round plant-yok dalları (KB wiring 2026-07-19): entry-no-trade ve
  // timing-window'dan ÖNCE — geç round'da "senkron gir / pencereyi bekle"
  // çerçevesi yanlıştır (round bitiyor), karar dersi gerekir.
  // spikePlanted === false (denetim fix 2026-07-19): eski !==true kapısı sinyal
  // YOKKEN (undefined, OCR okuyamadı) "kurulu değil" varsayıp "spike hâlâ kurulu
  // değilken" kesin-olgusu üretiyordu — AÇIK negatif sinyal şart (aa/ea'daki
  // aliveReliable guard'ının simetriği; spike dalları zaten önce döner).
  if (atk && b.deathTiming === "late" && b.spikePlanted === false) return "late-no-plant";
  if (def && b.deathTiming === "late" && b.spikePlanted === false) return "late-def-no-plant";
  if (atk && b.tradedByAlly === false) return "entry-no-trade";          // un-traded entry
  // full-buy-first-contact (KB wiring 2026-07-19): timing-window'dan ÖNCE —
  // ekonomi sinyali pencere dersinden daha spesifik (tam alımda ilk temas util'in işi).
  if (eco === "full_buy" && atk && b.deathTiming === "early" && !suppress?.has("full-buy-first-contact")) return "full-buy-first-contact";
  if (b.deathTiming === "early" && atk) return "timing-window";          // peeked into the window
  // def-no-crossfire (KB wiring 2026-07-19): def-wide-hold default'undan önce —
  // trade'lenmemiş savunma ölümü ölçülü killfeed sinyali (entry-no-trade simetriği).
  if (def && b.tradedByAlly === false) return "def-no-crossfire";
  // over-peek-advantage (denetim fix 2026-07-19): spesifik dallardan SONRAYA taşındı.
  // aa>=ea kapısı (ölüm-öncesi gerçek üstünlük aa+1>ea ⇔ aa>=ea; alliesAlive oyuncu
  // HARİÇ) clutch-lost + eski aa<ea dalıyla birlikte TÜM sayı-uzayını kapatıyordu:
  // aliveReliable olan HER ölüm bu üçlüye düşüyor, plant/trade/timing/eco dalları ve
  // akıllı default'lar ölü koda dönüyordu. Kapı aynı kaldı (+1 avantaj kapsamı — bu
  // dalganın amacı — korunur) ama katman değişti: ölçülü sinyalli dallar önce
  // denenir, sayı-avantajı dersi spesifik sebebi olmayan ölümlere kalır.
  if (aliveReliable && (aa as number) >= (ea as number) && !suppress?.has("over-peek-advantage")) return "over-peek-advantage"; // man-advantage
  // crosshair-loss yeni kapısı (canlı-test #8 uyumu, 2026-07-19): hp>=100 kapısı
  // KALDIRILDI — stale tek HP örneği "tam can" kanıtı sayılamaz (yukarıdaki
  // low-hp gerekçesinin aynası) ve 50 can + 50 kalkanla kırpılmış oyuncu da 100
  // görünüyordu. Yerine: tam alımda tüfek-sınıfı silaha ölüm = mekanik düello
  // kaybı. healthAtDeath hiçbir dalda okunmuyor artık (alan back-compat).
  if (eco === "full_buy" && !isEcoWeapon) return "crosshair-loss";       // full-buy rifle duel
  // Akıllı default'lar (KB wiring 2026-07-19): spesifik ölüm-sebebi kalmadıysa
  // round-BAĞLAMI dersleri generic huniden (def-wide-hold/info-less-push) önce
  // gelir — generic tekrarını round geçmişi/skor sinyali böler.
  if (b.highStakes === true) return "overtime-matchpoint";                // overtime / match point
  if (b.lossStreak === true) return "loss-streak";                        // 3+ consecutive losses
  if (b.winStreak === true) return "win-streak-comfort";                  // 3+ consecutive wins
  // ÇİFT-DİREKTİF ÇELİŞKİSİ FIX (denetim B85, 2026-07-31): tradedByAlly=true olan
  // saldırı ölümü hiçbir spesifik dala düşmediğinde generic "info-less-push"e
  // (= "tetikleyici beklemeden bastın") iniyordu — oysa AYNI user-mesajında
  // vision-prompt "tradedByAlly=true: takımın seni TRADE ETTİ — bunu hata gibi
  // yazma" direktifi var. Model iki zıt emirden birini seçiyor ve oyuncu doğru
  // oynadığı round'da haksız azar yiyordu ("iyi ölüm" kavramı taksonomide yoktu).
  // KASITLI OLARAK EN ALTTA: spesifik dallar (op/repeat/spike/eco/timing…) ve
  // bağlam default'ları (highStakes/seri) ÖNCE denenir — trade sinyali yalnız
  // generic azarlama default'unun yerini alır, çeşitliliği yutmaz.
  if (atk && b.tradedByAlly === true) return "entry-traded";
  // Side-aware default: a defense death with no specific signal is a wide-angle
  // hold (NOT an attack "push") — info-less-push uses attack language ("bastın")
  // which is wrong on a defender (audit 2026-06-30, S10). Split by side.
  if (def) return "def-wide-hold";
  return "info-less-push";                                                // attack default
}

/** ÇEŞİTLİLİK KATMANI (canlı-test #14): önce normal sınıflandır; aynı AİLE bu maçta
 *  zaten ≥2 kez verildiyse aileyi bastırarak yeniden sınıflandır — akış bir sonraki
 *  gerçek dala (crosshair-loss / seri / entry-traded / karşı-taraf default'u) iner.
 *  Bastırılmış akış AYNI ailenin default'una dönerse (Kaan sınıfı: savunma + başka
 *  sinyal yok → def-wide-hold) bastırma İPTAL edilir, orijinal tip korunur —
 *  çeşitlilik o durumda dürüstçe banLine'ın iskelet-değişim dayatmasına kalır
 *  (uydurma alternatif tip YOK). prev boşsa davranış classifyDeath ile birebir. */
export function classifyDeathVaried(b: DeathSignals, prev: DeathType[] = []): DeathType {
  const primary = classifyDeath(b);
  const fam = DEATH_TYPE_FAMILY[primary];
  if (!fam || prev.length === 0) return primary;
  const famCount = prev.filter((p) => DEATH_TYPE_FAMILY[p] === fam).length;
  if (famCount < 2) return primary;
  const familyMembers = new Set(
    (Object.keys(DEATH_TYPE_FAMILY) as DeathType[]).filter((t) => DEATH_TYPE_FAMILY[t] === fam),
  );
  const alt = classifyDeath(b, familyMembers);
  if (DEATH_TYPE_FAMILY[alt] === fam) return primary; // aile-default çakışması → iptal
  return alt;
}

/** Build the user-message directive: which block + lesson for THIS death, plus a ban
 *  on concepts already used earlier this match. Injected into the USER message (per-round,
 *  uncached) so the SYSTEM prompt-cache prefix is untouched (zero cache-hit impact). */
export function buildDeathTypeDirective(
  type: DeathType,
  prev: DeathType[] = [],
  // Dil (2026-07-18 "bir TR bir EN"): direktif user-message'ın büyük Türkçe
  // bloklarındandı — EN istekte İngilizce sarmalayıcı (KB bölüm başlığı Türkçe
  // kalır, KB Türkçe; talimat "dersi İngilizce yeniden ifade et" der).
  lang: "tr" | "en" = "tr",
): string {
  const g = DEATH_TYPE_GUIDE[type];
  const bannedConcepts = [...new Set(prev)]
    .filter((p) => p !== type)
    .map((p) => DEATH_TYPE_GUIDE[p]?.concept)   // optional: ignore unknown types the client may send
    .filter((c): c is string => !!c);
  // (rank-4, 2026-08-24) TEKRAR DALI — A/B KANITLI düzeltme: prev listesi canlanınca
  // (match-concepts fallback'i) salt diğer-kavram sayımı m3'ü DÜŞÜRMEDİ, YÜKSELTTİ
  // (real-r4 0.818 / real-r4b 0.909 vs baseline 0.773) — kendi-tip muafiyeti +
  // "diğerlerini yasakla" birleşimi modeli tekrarlanan kavramın İÇİNE huniliyordu
  // (kb-findings "rotation" (2) öngörüsü aynen). Tip TEKRAR ediyorsa yasak sayım
  // değil KALIP yasağı: ders (tip=veri) kalır, cümle sınıfı/kalıp değişir.
  // PREMİS DÜZELTMESİ (canlı-test #14): desktop echo'su v1.0.17'de CANLI
  // (roundHistory[].death_type dolu geliyor, commit 07a91b1) — prev listesi
  // artık gerçek veri; "echo yok, fallback boş" cümlesi bayattı.
  // AİLE-DÜZEYİ SAYIM (canlı-test #14, Kaan 8/12 vakası): tip değişse de aynı
  // nakarat sürüyorsa (genis-aci ailesi) tekrar SAYILIR — sayaç aile üstünden.
  const repeatCount = prev.filter((p) => deathFamily(p) === deathFamily(type)).length;
  // AZARLAMAYAN SARMALAYICI (denetim B85, 2026-07-31): trade'lenmiş ölümde ders
  // "hata yaptın" değil "alınan alanın bedeli doğru muydu" olmalı — direktif bunu
  // AÇIKÇA söyler ki prompt'un trade kuralıyla çelişmesin.
  const tradedNote = type === "entry-traded";
  if (lang === "en") {
    const banLineEn = repeatCount >= 1
      ? `\nYou already gave this lesson (or its close family) ${repeatCount}x this match — change the sentence SKELETON, the opening pattern AND the anchor; use a different sentence class and tie it to a DIFFERENT concrete detail of THIS round.`
      : bannedConcepts.length
        ? `\nEARLIER ROUNDS THIS MATCH ALREADY COVERED: ${bannedConcepts.join(", ")}. Do NOT repeat those angles (or synonyms) — this round has a different death-type, coach a different concept.`
        : "";
    // Canlı-test #14 (kod-ad sızıntısı): ham enum slug'ı ('over-peek-advantage')
    // direktiften SİLİNDİ — 3 kez kullanıcı metnine verbatim sızdı. KB bölüm
    // BAŞLIĞI tek işaretçi olarak yeter (R4 'avantajı sadeleştir' izi kanıtı).
    return (
      `\n[DEATH-TYPE HINT — this round's focus]\n` +
      `The KB section in the system prompt for this death is titled "${g.kbBlock}" (the KB is in Turkish).\n` +
      `Base deathAnalysis on THAT section's lesson — but do NOT copy its sentence; restate the lesson in ENGLISH, tied to this round's concrete details (callout + agent + weapon).\n` +
      `Use the "caught in the open / don't push without utility" framing ONLY if this type really is a utility-absence type (info-less-push / entry-no-trade); otherwise give THIS type's own lesson.` +
      (tradedNote
        ? `\nThis death WAS traded by a teammate — do NOT frame it as a mistake and do NOT scold. Coach the follow-up instead: was the space you bought actually used, was your entry synced with the team's push?`
        : "") +
      banLineEn
    );
  }
  const banLine = repeatCount >= 1
    ? `\nBu dersi (yakın ailesiyle) bu maçta ${repeatCount} kez zaten verdin — cümle İSKELETİNİ, açılış kalıbını VE çapayı değiştir; farklı bir cümle sınıfıyla BU round'un FARKLI bir somut detayına bağla.`
    : bannedConcepts.length
      ? `\nBU MAÇTA ÖNCEKİ ROUND'LARDA ŞU AÇILARI ZATEN VERDİN: ${bannedConcepts.join(", ")}. Aynısını (eşanlamlısı dahil) TEKRARLAMA — bu round farklı bir ölüm-tipi, farklı bir kavramdan konuş.`
      : "";
  // ÖNEMLİ (canlı 2026-06-30, softi "KBye bağlı değil"): direktif HAZIR CÜMLE DAYATMAZ.
  // Önceki sürüm tam-cümle 'angle' veriyordu, model onu kopyalıyordu → KB bypass, robotik.
  // Şimdi sadece ölüm-tipini + KB BÖLÜMÜNÜ işaret eder; modelin KENDİ derin cümlesini
  // (sistem prompt'undaki tam KB bölümünden) bu round'un somut detayına bağlayarak yazmasını ister.
  // Canlı-test #14 (kod-ad sızıntısı): 'Bu ölümün tipi: ${type}.' cümlesi SİLİNDİ —
  // R7/R11/R23'te enum slug'ı kullanıcı metnine verbatim sızdı ('over-peek-advantage
  // hatasını yaptın'). KB bölüm BAŞLIĞI işaretçi olarak yeterli; ~10 token/istek kâr.
  return (
    `\n[ÖLÜM-TİPİ İPUCU — bu round'un odağı]\n` +
    `Bu ölümün KB bölümü: "${g.kbBlock}".\n` +
    `deathAnalysis'i O KB bölümünün dersine dayandır — ama bölümün cümlesini KOPYALAMA. Bu round'un ` +
    `somut detayına (callout + ajan + silah) bağlayarak, KB'nin derinliğini KENDİ cümlenle ver.\n` +
    `"açıkta kaldın / utility'siz girme" kalıbını SADECE bu tip gerçekten util-yokluğu ise (info-less-push / entry-no-trade) kullan; değilse o tipin KENDİ dersini ver.` +
    (tradedNote
      ? `\nBu ölüm takımın tarafından TRADE EDİLDİ — hata gibi yazma, azarlama. Dersi devamına bağla: aldığın alan kullanıldı mı, girişin takımın basışıyla aynı anda mıydı?`
      : "") +
    banLine
  );
}

/** Concept tag for a type — exported so route.ts can stamp roundHistory / response. */
export function deathConcept(type: DeathType): string {
  return DEATH_TYPE_GUIDE[type].concept;
}
