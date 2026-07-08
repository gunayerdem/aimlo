// lib/comp-weapon.ts
// SİLAH + KOMP deterministik sınıflandırma (KB gece nöbeti, 2026-07-08).
//
// KÖK NEDEN (denetim, wiring bulgusu-1): killerInfo'daki SİLAH ve enemyRoster'daki
// KOMP modele ham string/JSON olarak gidiyordu — reasoning_effort:minimal'de model
// bunlardan ders türetemiyor (death-type fix'inin kanıtladığı aynı sınıf sorun).
// FIX: death-type direktifi DESENİNİN birebir kopyası — OCR alanlarından deterministik
// (saf fonksiyon, AI çağrısı yok, mikrosaniye) silah-sınıfı + komp-arketipi türet,
// USER message'a KB işaretçisi enjekte et. KB içeriği (weapon-comp-compact.md) sistem
// prompt'unun STATİK prefix'inde durur (tüm istekerde aynı → prompt-cache dostu);
// round-bazlı değişen tek şey bu işaretçi (user message zaten uncached → sıfır cache etkisi).
//
// TEK-KAYNAK SÖZLÜĞÜ: silah adı → sınıf. death-type.ts (isOp/isEcoWeapon) ve
// reality-checker.ts (WEAPON_NAMES) bu sözlükten türetilir — 3 kopyalı drift kapandı
// (denetim: judge eco listesinde eksikti, bulldog yanlışlıkla eco sayılıyordu).

import { AGENT_ROLE_MAP } from "@/lib/knowledge-loader";

export type WeaponClass = "sniper" | "rifle" | "smg" | "shotgun" | "pistol" | "mg";

export const WEAPON_CLASS: Record<string, WeaponClass> = {
  operator: "sniper", marshal: "sniper", outlaw: "sniper",
  vandal: "rifle", phantom: "rifle", guardian: "rifle", bulldog: "rifle",
  spectre: "smg", stinger: "smg",
  judge: "shotgun", bucky: "shotgun", shorty: "shotgun",
  sheriff: "pistol", bandit: "pistol", ghost: "pistol", classic: "pistol", frenzy: "pistol",
  odin: "mg", ares: "mg",
};

// weapon-comp-compact.md'deki H3 başlıklarıyla hizalı sınıf etiketi — işaretçi
// modele "rehberin şu bölümü" diyebilsin diye.
export const WEAPON_CLASS_LABEL: Record<WeaponClass, string> = {
  sniper: "keskin nişancı (Operator / Marshal / Outlaw)",
  rifle: "tüfek (Vandal / Phantom / Guardian / Bulldog)",
  smg: "hafif makineli (Spectre / Stinger)",
  shotgun: "pompalı (Judge / Bucky / Shorty)",
  pistol: "tabanca (Sheriff / Bandit / Ghost / Classic / Frenzy)",
  mg: "ağır makineli (Odin / Ares)",
};

const WEAPON_ALT = Object.keys(WEAPON_CLASS).join("|");
// killerInfo standart biçimi "killed by jett with vandal"; OCR bazen "by jett vandal"
// düşürür — iki desen de sözlük-BAĞLI (serbest metin asla silah sayılmaz → anti-uydurma).
const WITH_RE = new RegExp(`\\bwith\\s+(?:the\\s+)?(${WEAPON_ALT})\\b`, "i");
const ANY_RE = new RegExp(`\\b(${WEAPON_ALT})\\b`, "i");

/** killerInfo'dan katil silahını çıkar. Sözlükte yoksa null — silah İDDİA EDİLMEZ. */
export function extractKillerWeapon(killerInfo?: string): { name: string; cls: WeaponClass } | null {
  if (!killerInfo) return null;
  const s = killerInfo.toLowerCase();
  const m = s.match(WITH_RE) ?? s.match(ANY_RE);
  return m ? { name: m[1].toLowerCase(), cls: WEAPON_CLASS[m[1].toLowerCase()] } : null;
}

// ── Komp arketipi ─────────────────────────────────────────────
// weapon-comp-compact.md "## Komp Okuma" H3 slug'larıyla BİREBİR aynı adlar.
export type CompArchetype =
  | "double-duelist-dive"
  | "double-initiator-util"
  | "double-sentinel-kale"
  | "double-controller"
  | "op-comp"
  | "no-controller-rush"
  | "standart";

// Op'u en sık taşıyan core ajanlar — op-comp sinyalinin yarısı (diğer yarısı çift sentinel).
const OP_AGENTS = new Set(["jett", "chamber"]);

/**
 * Düşman roster'ından deterministik komp arketipi. Sayım-bazlı → roster sırasından
 * bağımsız (loadMatchupFiles determinizm gereksinimiyle aynı felsefe). Roster eksikse
 * (<4 ajan OCR'lanmışsa) null — arketip İDDİA EDİLMEZ (anti-uydurma).
 * Öncelik: spesifik → genel (classifyDeath ile aynı desen).
 */
export function classifyCompArchetype(roster?: string[]): CompArchetype | null {
  if (!roster || roster.length < 4) return null;
  const counts: Record<string, number> = { duelists: 0, controllers: 0, initiators: 0, sentinels: 0 };
  let opCore = 0;
  for (const a of roster) {
    // KAY/O-toleranslı slug eşleme — knowledge-loader.resolveAgentRole ile aynı kural.
    const slug = String(a).toLowerCase().replace(/[^a-z0-9]/g, "");
    const entry = Object.entries(AGENT_ROLE_MAP).find(
      ([k]) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === slug,
    );
    if (!entry) continue;
    counts[entry[1]]++;
    if (OP_AGENTS.has(slug)) opCore++;
  }
  if (opCore >= 1 && counts.sentinels >= 2) return "op-comp";
  if (counts.duelists >= 2) return "double-duelist-dive";
  if (counts.initiators >= 2) return "double-initiator-util";
  if (counts.sentinels >= 2) return "double-sentinel-kale";
  if (counts.controllers >= 2) return "double-controller";
  if (counts.controllers === 0) return "no-controller-rush";
  return "standart";
}

/**
 * User-message işaretçisi (death-type direktifi deseni): sistem prompt'undaki
 * SİLAH + KOMP REHBERİ'nin hangi bölümünün BU round'a uygulanacağını söyler.
 * HAZIR CÜMLE DAYATMAZ (canlı ders 2026-06-30: tam-cümle direktif = KB bypass,
 * robotik çıktı) — sadece bölümü işaret eder, derinlik KB'den gelir.
 * Sinyal yoksa boş string — factSheet "silah BİLİNMEYEN" demeye devam eder,
 * reality-checker hasWeapon guard'ı süzmeye devam eder (defense-in-depth).
 */
export function buildWeaponCompDirective(
  weapon: { name: string; cls: WeaponClass } | null,
  archetype: CompArchetype | null,
  loadout?: string,
): string {
  if (!weapon && (!archetype || archetype === "standart")) return "";
  const L: string[] = ["\n[SİLAH+KOMP İPUCU — sistem prompt'undaki SİLAH + KOMP REHBERİ'nden]"];
  if (weapon) {
    L.push(
      `Seni öldüren silah: ${weapon.name} → rehberin "${WEAPON_CLASS_LABEL[weapon.cls]}" bölümü. ` +
      `O bölümün dersini BU round'un callout'una ve düşman ajanına bağla — cümlesini KOPYALAMA` +
      (loadout ? `; oyuncunun elindeki silah ${loadout}, mesafe/düello kıyasını buna göre yap.` : "."),
    );
  }
  if (archetype && archetype !== "standart") {
    L.push(
      `Düşman komp arketipi: ${archetype} (roster OCR'dan). Rehberin o bölümündeki okumayı ` +
      `enemyAnalysis maddelerinden birine ya da nextRoundSuggestion'a yedir — ayrı alan açma.`,
    );
  }
  return L.join("\n");
}
