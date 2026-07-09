// Merkezi TR display-format katmanı (beta cilası 2026-07-09).
// KAYNAK GERÇEĞİ: desktop OCR ham küçük-harf üretir (ocr.rs MAPS/AGENTS listeleri:
// "bind", "reyna", "spike_rush", "attacking") ve eski DB satırları bu ham değerlerle
// ya da İngilizce "Unknown" senteliyle kayıtlı. Bu modül tek noktadan insan-okur
// biçime çevirir; görüntü katmanı DB'yi asla değiştirmez (eski satırlar kalıcı).
// CLIENT-SAFE: "server-only" yok — app/page.tsx (client) + admin + API route'lar
// aynı tabloyu kullanır, casing tek kaynaktan yönetilir.

/** OCR slug → resmi harita adı. ocr.rs MAPS (13) + knowledge/maps (summit) birleşimi. */
const MAP_NAMES: Record<string, string> = {
  abyss: "Abyss",
  ascent: "Ascent",
  bind: "Bind",
  breeze: "Breeze",
  corrode: "Corrode",
  district: "District",
  fracture: "Fracture",
  haven: "Haven",
  icebox: "Icebox",
  lotus: "Lotus",
  pearl: "Pearl",
  split: "Split",
  summit: "Summit",
  sunset: "Sunset",
};

/** OCR slug → resmi ajan adı. Tek özel durum KAY/O (OCR "kayo"/"kay/o" üretebilir). */
const AGENT_NAMES: Record<string, string> = {
  astra: "Astra", breach: "Breach", brimstone: "Brimstone", chamber: "Chamber",
  clove: "Clove", cypher: "Cypher", deadlock: "Deadlock", fade: "Fade",
  gekko: "Gekko", harbor: "Harbor", iso: "Iso", jett: "Jett",
  "kay/o": "KAY/O", kayo: "KAY/O", "ky/o": "KAY/O",
  killjoy: "Killjoy", neon: "Neon", omen: "Omen", phoenix: "Phoenix",
  raze: "Raze", reyna: "Reyna", sage: "Sage", skye: "Skye",
  sova: "Sova", tejo: "Tejo", veto: "Veto", viper: "Viper",
  vyse: "Vyse", waylay: "Waylay", yoru: "Yoru",
};

const MODE_NAMES_TR: Record<string, string> = {
  spike_rush: "Spike Rush",
  "spike rush": "Spike Rush",
  competitive: "Rekabetçi",
  unrated: "Derecesiz",
  swiftplay: "Swiftplay",
  deathmatch: "Deathmatch",
  team_deathmatch: "Team Deathmatch",
  premier: "Premier",
};

const UNKNOWN_SENTINELS = new Set(["", "unknown", "bilinmiyor", "n/a", "?"]);

function isUnknown(raw: unknown): boolean {
  return typeof raw !== "string" || UNKNOWN_SENTINELS.has(raw.trim().toLowerCase());
}

/**
 * "bind" / "BIND" / "Bind" → "Bind". Bilinmeyen/boş/"Unknown" → "" (çağıran gizler
 * ya da kendi diline göre "Bilinmiyor"/"—" basar — kimlik alanında yanlış bilgi
 * göstermekten iyidir). Tabloda olmayan gerçek bir değer ilk-harf-büyük döner
 * (Türkçe locale tuzağına karşı en-US upper: "i"→"I").
 */
export function formatMap(raw: unknown): string {
  if (isUnknown(raw)) return "";
  const key = (raw as string).trim().toLowerCase();
  return MAP_NAMES[key] ?? titleCaseEn((raw as string).trim());
}

export function formatAgent(raw: unknown): string {
  if (isUnknown(raw)) return "";
  const key = (raw as string).trim().toLowerCase();
  return AGENT_NAMES[key] ?? titleCaseEn((raw as string).trim());
}

/**
 * YALNIZ tablo eşleşmesi (security audit L2): serbest-metin OCR bağlamından
 * ("killed by xhtx") çıkarılan token'ın gerçek bir ajan olduğu kanıtlanamıyorsa
 * undefined — gürültü, rapora "katil" diye giremez (anti-uydurma). Yeni ajan
 * çıktığında tabloya eklenene kadar o ajan sessizce düşer — kabul edilen ödün.
 */
export function knownAgent(raw: unknown): string | undefined {
  if (isUnknown(raw)) return undefined;
  return AGENT_NAMES[(raw as string).trim().toLowerCase()];
}

export function formatMode(raw: unknown, lang: "tr" | "en" = "tr"): string {
  if (isUnknown(raw)) return "";
  const key = (raw as string).trim().toLowerCase();
  const tr = MODE_NAMES_TR[key];
  if (tr) return lang === "en" && key === "competitive" ? "Competitive"
    : lang === "en" && key === "unrated" ? "Unrated" : tr;
  // "team_deathmatch" gibi bilinmeyen snake_case → "Team Deathmatch"
  return (raw as string).trim().split(/[_\s]+/).map(titleCaseEn).join(" ");
}

/** "attacking"/"attack" → Saldırı, "defending"/"defense" → Savunma, diğer → "" */
export function formatSide(raw: unknown, lang: "tr" | "en" = "tr"): string {
  if (typeof raw !== "string") return "";
  const s = raw.trim().toLowerCase();
  if (s === "attack" || s === "attacking" || s === "saldırı") return lang === "tr" ? "Saldırı" : "Attack";
  if (s === "defense" || s === "defending" || s === "defence" || s === "savunma") return lang === "tr" ? "Savunma" : "Defense";
  return "";
}

/** Veri-katmanı kanoniği: "attacking"→"attack", "defending"→"defense"; tanınmazsa "". */
export function normalizeSide(raw: unknown): "attack" | "defense" | "" {
  if (typeof raw !== "string") return "";
  const s = raw.trim().toLowerCase();
  if (s === "attack" || s === "attacking" || s === "saldırı") return "attack";
  if (s === "defense" || s === "defending" || s === "defence" || s === "savunma") return "defense";
  return "";
}

/** Round/maç sonucu. "won"/"lost" desktop victory-screen değerleri de tanınır. */
export function formatResult(raw: unknown, lang: "tr" | "en" = "tr"): string {
  if (typeof raw !== "string") return lang === "tr" ? "Bilinmiyor" : "Unknown";
  const s = raw.trim().toLowerCase();
  if (s === "win" || s === "won") return lang === "tr" ? "Kazanıldı" : "Won";
  if (s === "loss" || s === "lost") return lang === "tr" ? "Kaybedildi" : "Lost";
  return lang === "tr" ? "Bilinmiyor" : "Unknown";
}

/** Görsel lookup anahtarı (MAP_IMAGES/AGENT_SLUGS TitleCase anahtar kullanır). */
export function mapImageKey(raw: unknown): string { return formatMap(raw); }
export function agentImageKey(raw: unknown): string { return formatAgent(raw); }

function titleCaseEn(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
