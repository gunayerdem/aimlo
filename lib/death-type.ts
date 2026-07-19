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

import { extractKillerWeapon } from "@/lib/comp-weapon";

export type DeathType =
  | "repeat-angle"
  | "op-angle"
  | "pistol-round"
  | "eco-force-loss"
  | "entry-no-trade"
  | "post-plant-solo"
  | "retake-no-util"
  | "over-peek-advantage"
  | "crosshair-loss"
  | "timing-window"
  | "low-hp-no-save"
  | "clutch-lost"
  | "lurk-caught"
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
  "post-plant-solo":     { kbBlock: "Post-Plant Ölümleri", angle: "spike kurulduktan sonra tek açı tuttun ve retake'i tek karşıladın — çapraz post-plant açısı kur, zamanı oyna, sen onlara gitme", concept: "post-plant-tek-aci" },
  "retake-no-util":      { kbBlock: "Retake Ölümleri", angle: "site'ı util'siz/dağınık geri almaya çalıştın — util'i defuse'u geciktirmeye harca ve birlikte sayı bas, tek tek girme", concept: "retake-dagintik" },
  "over-peek-advantage": { kbBlock: "Avantaj Yönetimi — Üstünlüğü Sadeleştir", angle: "sayı üstünündeyken gereksiz peek arayıp avantajı eşitledin — önde olduğun round'da köşe kur, düşmanı sana gelmeye zorla", concept: "avantaj-yaktin" },
  "crosshair-loss":      { kbBlock: "Aim ve Crosshair Ölümleri", angle: "tam can ve açık düelloda göründüğün an vuruldun, nişanın hazır değildi — crosshair'i baş hizasında tut, dur-ateş-et disiplinine gir", concept: "crosshair" },
  "timing-window":       { kbBlock: "Zamanlama Ölümleri — Beklenti penceresi kapanınca çık", angle: "smoke/duvar daha açılırken, beklenti penceresi açıkken çıktın — pencere kapanınca, düşmanın gevşeme anında peek at", concept: "zamanlama-penceresi" },
  "low-hp-no-save":      { kbBlock: "Karar ve Ekonomi Ölümleri — Düşük canla dövüşü zorlama — silahı kurtar", angle: "düşük canla save etmeyip silahı sundun — düşük HP + dezavantajda silahı kurtar, sonraki round'a yatırım yap", concept: "save-etmedin" },
  "clutch-lost":         { kbBlock: "Karar ve Ekonomi Ölümleri — Clutch'ı 1v1 dizisine indir", angle: "son canlıyken sonuca göre değil panikle oynadın — tek açı izole et, sesle düşmanları ayır, durumu ardışık 1v1'lere indir", concept: "clutch" },
  "lurk-caught":         { kbBlock: "Lurk Ölümleri", angle: "takımdan kopuk erken lurk'te yakalandın — lurk'ünü execute'a senkronla, takım baskısı havadayken düşmanın yerini öğren", concept: "lurk" },
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
  healthAtDeath?: number;   // 0-150
  alliesAlive?: number;     // 0-4
  enemiesAlive?: number;    // 0-5
  spikePlanted?: boolean;
  economyType?: string;     // "full_buy" | "force_buy" | "half_buy" | "eco" | "pistol"
  tradedByAlly?: boolean;
  repeatedPosition?: boolean; // derived in route.ts from roundHistory
};

/** Classify a death into exactly one type. Priority = MOST specific → most generic;
 *  the first matching branch wins, so an op death is "op-angle" even if it was also a
 *  solo entry. `info-less-push` is the genuine default (no specific signal). */
export function classifyDeath(b: DeathSignals): DeathType {
  const killer = (b.killerInfo || "").toLowerCase();
  // Tek-kaynak silah sözlüğü (lib/comp-weapon.ts WEAPON_CLASS) — denetim 2026-07-08:
  // eski yerel regex'te judge EKSİKTİ (eco/force'un ana silahı) ve bulldog (2050
  // kredilik tüfek) yanlışlıkla eco sayılıyordu. "op"/"awp" kısaltmaları sözlükte
  // yok ama OCR'da geçebilir — sniper dalı için ayrıca kabul edilir.
  const kw = extractKillerWeapon(killer);
  const isOp = kw?.cls === "sniper" || /\b(op|awp)\b/.test(killer);
  const isEcoWeapon = kw ? kw.cls === "pistol" || kw.cls === "smg" || kw.cls === "shotgun" : false;
  const side = (b.side || "").toLowerCase();
  const atk = side.startsWith("attack");
  const def = side.startsWith("defend") || side.startsWith("defens");
  const hp = typeof b.healthAtDeath === "number" ? b.healthAtDeath : undefined;
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
  if (b.spikePlanted && atk) return "post-plant-solo";                    // attack + spike up
  if (b.spikePlanted && def) return "retake-no-util";                     // defense + spike up = retake
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
  if (aliveReliable && (aa as number) > (ea as number)) return "over-peek-advantage"; // man-advantage
  if (atk && b.tradedByAlly === false) return "entry-no-trade";          // un-traded entry
  if (b.deathTiming === "early" && atk) return "timing-window";          // peeked into the window
  if (typeof hp === "number" && hp >= 100 && !isEcoWeapon) return "crosshair-loss"; // full hp, rifle duel
  // Side-aware default: a defense death with no specific signal is a wide-angle
  // hold (NOT an attack "push") — info-less-push uses attack language ("bastın")
  // which is wrong on a defender (audit 2026-06-30, S10). Split by side.
  if (def) return "def-wide-hold";
  return "info-less-push";                                                // attack default
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
  if (lang === "en") {
    const banLineEn = bannedConcepts.length
      ? `\nEARLIER ROUNDS THIS MATCH ALREADY COVERED: ${bannedConcepts.join(", ")}. Do NOT repeat those angles (or synonyms) — this round has a different death-type, coach a different concept.`
      : "";
    return (
      `\n[DEATH-TYPE HINT — this round's focus]\n` +
      `This death's type: ${type}. The KB section in the system prompt for this type is titled "${g.kbBlock}" (the KB is in Turkish).\n` +
      `Base deathAnalysis on THAT section's lesson — but do NOT copy its sentence; restate the lesson in ENGLISH, tied to this round's concrete details (callout + agent + weapon).\n` +
      `Use the "caught in the open / don't push without utility" framing ONLY if this type really is a utility-absence type (info-less-push / entry-no-trade); otherwise give THIS type's own lesson.` +
      banLineEn
    );
  }
  const banLine = bannedConcepts.length
    ? `\nBU MAÇTA ÖNCEKİ ROUND'LARDA ŞU AÇILARI ZATEN VERDİN: ${bannedConcepts.join(", ")}. Aynısını (eşanlamlısı dahil) TEKRARLAMA — bu round farklı bir ölüm-tipi, farklı bir kavramdan konuş.`
    : "";
  // ÖNEMLİ (canlı 2026-06-30, softi "KBye bağlı değil"): direktif HAZIR CÜMLE DAYATMAZ.
  // Önceki sürüm tam-cümle 'angle' veriyordu, model onu kopyalıyordu → KB bypass, robotik.
  // Şimdi sadece ölüm-tipini + KB BÖLÜMÜNÜ işaret eder; modelin KENDİ derin cümlesini
  // (sistem prompt'undaki tam KB bölümünden) bu round'un somut detayına bağlayarak yazmasını ister.
  return (
    `\n[ÖLÜM-TİPİ İPUCU — bu round'un odağı]\n` +
    `Bu ölümün tipi: ${type}. Sistem prompt'undaki KB'de bu tipe karşılık gelen bölüm: "${g.kbBlock}".\n` +
    `deathAnalysis'i O KB bölümünün dersine dayandır — ama bölümün cümlesini KOPYALAMA. Bu round'un ` +
    `somut detayına (callout + ajan + silah) bağlayarak, KB'nin derinliğini KENDİ cümlenle ver.\n` +
    `"açıkta kaldın / utility'siz girme" kalıbını SADECE bu tip gerçekten util-yokluğu ise (info-less-push / entry-no-trade) kullan; değilse o tipin KENDİ dersini ver.` +
    banLine
  );
}

/** Concept tag for a type — exported so route.ts can stamp roundHistory / response. */
export function deathConcept(type: DeathType): string {
  return DEATH_TYPE_GUIDE[type].concept;
}
