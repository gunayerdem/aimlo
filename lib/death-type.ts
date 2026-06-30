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

export type DeathType =
  | "repeat-angle"
  | "op-angle"
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
  | "info-less-push";

/** Per-type coaching guide: the universal.md block to anchor on, the one-line lesson
 *  (DISTINCT concept, not a synonym of another), and a short concept tag used for the
 *  cross-round "don't repeat" ban list. Lessons are deliberately different IDEAS. */
const DEATH_TYPE_GUIDE: Record<DeathType, { kbBlock: string; angle: string; concept: string }> = {
  "repeat-angle":        { kbBlock: "Okunabilirlik ve Bilgi Sızıntısı", angle: "aynı açıdan tekrar öldün, pozisyonun okundu — o açıyı bir round tamamen boş bırak, düşmanın okumasını boşa çıkar", concept: "okunma" },
  "op-angle":            { kbBlock: "Zamanlama — Operatöre karşı timing", angle: "tek açıya kilitli bir operatör/awp seni aynı timing'le yakaladı — o silah çekilince veya körlenince re-peek at, kendi zamanlamanı kır", concept: "op-timing" },
  "eco-force-loss":      { kbBlock: "Karar ve Ekonomi", angle: "zayıf ekonomide tam-alımmış gibi oynayıp silahı yaktın — düşman elini oku, yarım alımla bas ya da bilgi toplayıp sağ kal", concept: "ekonomi-karari" },
  "entry-no-trade":      { kbBlock: "Pozisyon — Geri-alım (trade) kurulumu", angle: "solo giriş yapıp space aldın ama ölümün geri-alınmadı — yanındaki arkadaş trade'e hazır beklerken, senkronlu gir", concept: "trade-yok" },
  "post-plant-solo":     { kbBlock: "Post-Plant Ölümleri", angle: "spike kurulduktan sonra tek açı tuttun ve retake'i tek karşıladın — çapraz post-plant açısı kur, zamanı oyna, sen onlara gitme", concept: "post-plant-tek-aci" },
  "retake-no-util":      { kbBlock: "Retake Ölümleri", angle: "site'ı util'siz/dağınık geri almaya çalıştın — util'i defuse'u geciktirmeye harca ve birlikte sayı bas, tek tek girme", concept: "retake-dagintik" },
  "over-peek-advantage": { kbBlock: "Avantaj Yönetimi", angle: "sayı üstünündeyken gereksiz peek arayıp avantajı eşitledin — önde olduğun round'da köşe kur, düşmanı sana gelmeye zorla", concept: "avantaj-yaktin" },
  "crosshair-loss":      { kbBlock: "Aim ve Crosshair Disiplini", angle: "tam can ve açık düelloda göründüğün an vuruldun, nişanın hazır değildi — crosshair'i baş hizasında tut, dur-ateş-et disiplinine gir", concept: "crosshair" },
  "timing-window":       { kbBlock: "Zamanlama — Beklenti penceresi", angle: "smoke/duvar daha açılırken, beklenti penceresi açıkken çıktın — pencere kapanınca, düşmanın gevşeme anında peek at", concept: "zamanlama-penceresi" },
  "low-hp-no-save":      { kbBlock: "Karar ve Ekonomi", angle: "düşük canla save etmeyip silahı sundun — düşük HP + dezavantajda silahı kurtar, sonraki round'a yatırım yap", concept: "save-etmedin" },
  "clutch-lost":         { kbBlock: "Karar ve Ekonomi — Clutch", angle: "son canlıyken sonuca göre değil panikle oynadın — tek açı izole et, sesle bilgi al, durumu 1v1'e indirgemeye çalış", concept: "clutch" },
  "lurk-caught":         { kbBlock: "Takım Koordinasyonu — Lurk", angle: "takımdan kopuk erken lurk'te yakalandın — lurk'ünü execute'a senkronla, takım baskısı havadayken bilgi al", concept: "lurk" },
  "info-less-push":      { kbBlock: "Zamanlama — Tetikleyici bekle", angle: "somut bir tetikleyici beklemeden, bilgi almadan bastın — ses kesilmesi ya da ilk kontağı bekle, sonra çık", concept: "tetikleyici-yok" },
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
  const isOp = /\b(operator|op|marshal|awp|outlaw)\b/.test(killer);
  const isEcoWeapon = /\b(classic|shorty|frenzy|ghost|sheriff|stinger|spectre|bucky|bulldog)\b/.test(killer);
  const side = (b.side || "").toLowerCase();
  const atk = side.startsWith("attack");
  const def = side.startsWith("defend") || side.startsWith("defens");
  const hp = typeof b.healthAtDeath === "number" ? b.healthAtDeath : undefined;
  const aa = b.alliesAlive, ea = b.enemiesAlive;
  const eco = (b.economyType || "").toLowerCase();

  // Priority order: specific → generic.
  if (b.repeatedPosition) return "repeat-angle";                          // read by the enemy — top priority
  if (isOp) return "op-angle";                                            // weapon-anchored
  if (b.spikePlanted && atk) return "post-plant-solo";                    // attack + spike up
  if (b.spikePlanted && def) return "retake-no-util";                     // defense + spike up = retake
  if (eco === "eco" || eco === "force_buy" || (eco !== "full_buy" && eco !== "" && isEcoWeapon))
    return "eco-force-loss";                                              // economy decision
  if (typeof hp === "number" && hp > 0 && hp < 50) return "low-hp-no-save"; // should have saved
  if (aa === 0) return "clutch-lost";                                     // last alive
  if (typeof aa === "number" && typeof ea === "number" && aa > ea) return "over-peek-advantage"; // man-advantage
  if (atk && b.tradedByAlly === false) return "entry-no-trade";          // un-traded entry
  if (b.deathTiming === "early" && atk) return "timing-window";          // peeked into the window
  if (typeof hp === "number" && hp >= 100 && !isEcoWeapon) return "crosshair-loss"; // full hp, rifle duel
  return "info-less-push";                                                // genuine default
}

/** Build the user-message directive: which block + lesson for THIS death, plus a ban
 *  on concepts already used earlier this match. Injected into the USER message (per-round,
 *  uncached) so the SYSTEM prompt-cache prefix is untouched (zero cache-hit impact). */
export function buildDeathTypeDirective(type: DeathType, prev: DeathType[] = []): string {
  const g = DEATH_TYPE_GUIDE[type];
  const bannedConcepts = [...new Set(prev)]
    .filter((p) => p !== type)
    .map((p) => DEATH_TYPE_GUIDE[p].concept);
  const banLine = bannedConcepts.length
    ? `\nBU MAÇTA ÖNCEKİ ROUND'LARDA ŞU AÇILARI ZATEN VERDİN: ${bannedConcepts.join(", ")}. Aynısını (eşanlamlısı dahil) TEKRARLAMA — bu round farklı bir ölüm-tipi, farklı bir kavramdan konuş.`
    : "";
  return (
    `\n[ÖLÜM-TİPİ — BU ROUND İÇİN DETERMİNİSTİK SEÇİLDİ]\n` +
    `Tip: ${type}. KB bloğu: "${g.kbBlock}".\n` +
    `Bu round'un dersi (deathAnalysis'i BUNA çıpala): ${g.angle}.\n` +
    `"açıkta kaldın / utility'siz girme" kalıbını SADECE tip gerçekten util-yokluğu ise (info-less-push veya entry-no-trade) kullan; bu tip o değilse o kalıbı KULLANMA, yukarıdaki dersi ver.` +
    banLine
  );
}

/** Concept tag for a type — exported so route.ts can stamp roundHistory / response. */
export function deathConcept(type: DeathType): string {
  return DEATH_TYPE_GUIDE[type].concept;
}
