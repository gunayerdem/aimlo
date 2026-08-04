/**
 * AIMLO Reality Checker
 * Validates AI output claims against actual round memory.
 * Runs AFTER AI generation, BEFORE response to user.
 * Deterministic — no extra AI calls.
 */

import { extractKillerWeapon } from "@/lib/comp-weapon";
import { mapKey, MAP_CALLOUTS, UNIVERSAL_CALLOUTS } from "@/lib/map-callouts";
// Denetim B83 (2026-07-31): katil ajanının RESMİ adı tek kaynaktan (format-display
// AGENT_NAMES tablosu) gelsin — reality-checker'ın kendi AGENT_NAMES listesi OCR
// garble'ları da ("Reay") içerdiği için TESPİT'te kullanılır, GERÇEK katil adı
// olarak yalnız tabloda KANITLI olan resmi ad yazılır.
import { knownAgent } from "@/lib/format-display";

// ── Types ──

interface RoundMemoryEntry {
  round_index: number;
  died: boolean;
  death_position?: string | null;
  position_confidence?: string;
}

interface ExtractedClaims {
  claimedCount: number | null;
  claimedWindow: number | null;
  claimedPosition: string | null;
  repetitionClaim: boolean;
}

interface ValidationResult {
  countValid: boolean;
  positionValid: boolean;
  repetitionValid: boolean;
  actualCount: number;
  actualWindow: number;
  rewriteLevel: 1 | 2 | 3;
}

// ── Death-Data Contract (Ölüm-Veri Sözleşmesi 2026-06-29) ──
//
// Single ground-truth shape shared by BOTH the vision route AND the report
// route (built once via buildFactGround → no per-route drift). Each flag means
// "this fact was actually OBSERVED for this round" (OCR/desktop truth present).
// When a flag is false/absent, guardUnprovenFacts DETERMINISTICALLY removes any
// AI claim about that fact — the model can never assert an unobserved fact.
// When a flag is TRUE the corresponding guard NEVER touches the text (a correct
// killer/location/weapon is preserved verbatim). All optional → every existing
// caller (route/trade/killer/location/headshot only) stays type-compatible.
export interface FactGround {
  hasKiller?: boolean;        // killerInfo OCR present
  // Denetim B83 (2026-07-31): killerInfo'dan SÖZLÜK-BAĞLI çıkarılan GERÇEK katil
  // ajanı (varsa). hasKiller=true iken guardUnprovenFacts bunu kullanıp metindeki
  // YANLIŞ ajan adını düzeltir. Belirsizse (ajan sözlükte yok / iki farklı ad
  // geçiyor / maç-seviyesi rapor) undefined kalır → guard DOKUNMAZ.
  killerAgent?: string;
  hasWeapon?: boolean;        // killerInfo contains "with <weapon>" (enemy weapon parsed)
  hasDeathLocation?: boolean; // deathLocation OCR present
  hasDeathAngle?: boolean;    // deathAngle OCR present (NO guard — meşru "arkadan geldi")
  hasHeadshot?: boolean;      // headshot===true (desktop never sends → effectively always false)
  hasAliveCount?: boolean;    // alive counts RELIABLE (desktop can't distinguish 0-vs-unread → always false)
  hasSpike?: boolean;         // spike state RELIABLE (only set when true → can't tell false/absent → always false)
  // Denetim B35 (2026-07-31): düşmanın YETENEK/SETUP kullanımı OCR'da HİÇ okunmuyor
  // (payload'da yalnız killerInfo + roster + killfeed sırası var) → DAİMA false,
  // alive/spike ile aynı sözleşme. Masaüstü ileride yetenek-okuma gönderirse
  // buildFactGround'da true'ya çevrilir → guard susar.
  hasEnemyUtil?: boolean;
  hasTradeData?: boolean;     // tradedByAlly boolean present
  hasRoute?: boolean;         // playerRoute measured
  // Canlı-test #9 (2026-08-04): oyuncunun AJANI istekte okundu mu? Kanıt: maç
  // onaylanmadan atılan warmup AI çağrısında agent alanı BOŞTU ve model "Phoenix
  // olarak kendi utilini..." yazdı — oyuncu Brimstone'du. Maç ortasında agent-OCR
  // boş kalabildiği (bilinen ayrı desktop sorunu) için aynı uydurma o zaman
  // KULLANICIYA gider. false iken guardUnprovenFacts "<Ajan> olarak" (TR) /
  // "as <Agent>" (EN) OYUNCU-kendine-yakıştırma kalıplarını deterministik düşürür.
  // undefined = guard KAPALI → tüm mevcut çağıranlar (report route dahil,
  // buildFactGround bu alanı SET ETMEZ) bayt-aynı. Yalnız vision route, isteğin
  // agent alanı boş/Unknown olduğunda bayrağı false'a çeker.
  playerAgentKnown?: boolean;
  // Masaüstünün OCR ile ölçtüğü ölüm yeri/yerleri (varsa). stripForeignCallouts
  // bunu HER ZAMAN meşru sayar — tablo eksik olsa bile ölçülen konumu silmez.
  // Vision route TEK round → string; report route TÜM round'ların konumları → string[]
  // (rapor ÖZETİ birçok round'un konumuna atıfta bulunur; hepsi korunmalı).
  deathLocation?: string | string[];
}

// ── Claim Extraction ──

const COUNT_PATTERNS = [
  // Turkish
  /(\d+)\s*kez/i,
  /(\d+)\s*defa/i,
  /(\d+)'[iu]nde/i,
  /(\d+)'[iu]nda/i,
  // Multilingual
  /(\d+)\s*round/i,
  // English
  /(\d+)\s*times?/i,
  /(\d+)\s*deaths?/i,
  /(\d+)\s*rounds?\s*(in\s*a\s*row|straight|consecutive)/i,
  /(\d+)\s*matches?\s*in\s*a\s*row/i,
];

const WINDOW_PATTERNS = [
  // Turkish
  /son\s+(\d+)\s*round/i,
  /son\s+(\d+)\s*maç/i,
  /son\s+(\d+)/i,
  // English
  /last\s+(\d+)\s*rounds?/i,
  /last\s+(\d+)\s*matches?/i,
  /past\s+(\d+)\s*rounds?/i,
  /over\s+the\s+last\s+(\d+)/i,
];

const POSITION_NAMES = [
  "a short", "a long", "a main", "a site", "a heaven", "a hell",
  "b short", "b long", "b main", "b site", "b heaven", "b hell",
  "c site", "c long", "c main",
  "mid", "mid top", "mid bottom", "mid doors",
  "market", "garage", "garden", "heaven", "hell",
  "catwalk", "elbow", "cubby", "window", "tree",
  "lobby", "hookah", "lamps", "showers", "link",
  "sewers", "pizza", "wine", "tiles", "u-hall",
  "rafters", "pocket", "generator", "ct spawn",
  // Lotus / Sunset / Abyss / Split callouts (council 2026-06-25 — extractClaims
  // now recognizes positions on these maps too, so count/position checks run).
  "a rubble", "a flower", "b elbow", "c side", "waterfall",
  "mound", "c nest", "b yard", "b market", "mid alley",
  "a yard", "b nest", "a nest", "a cliff", "mid platform",
  "a drop", "ramen", "screen", "mail",
  // Summit callouts (2026-06-26 — yeni harita; extractClaims Summit pozisyonlarını
  // da tanısın ki "Mid Fountain'da tekrar ölüyorsun" gibi pattern doğrulansın).
  "mid fountain", "mid bend", "mid window", "mid tiles", "double box",
  "a garden", "a cave", "a link", "a art", "b link", "b tower",
  "b trophy", "b gym", "triples", "close box",
  // Fracture callouts (2026-06-28 LAUNCH-BLOCKER: canlı-test "A Dish"/"B Tower"
  // ölüm-yeri halüsinasyonu — "a dish" listede yoktu, death-loc-absent guard
  // onu tanıyamıyordu). death_location-absent guard + repetition bunları tanısın.
  "a dish", "a rope", "a hall", "b tree", "b arcade", "b canteen",
  // KB gece nöbeti denetimi (2026-07-08) — Fracture "A Dish" sınıfı boşlukların
  // kalanı kapatıldı: KB harita dosyalarında geçen ama burada TANINMAYAN callout'lar
  // (deathLocation-absent guard bunları süzemiyordu, Abyss/Ascent/Bind/Icebox/Haven
  // ölümlerinde uydurma callout iddiası nötrlenemiyordu).
  // Abyss:
  "a security", "a tower", "a bridge", "a vent", "a secret", "b danger", "mid library",
  // Ascent ("switch" bilinçli DIŞARIDA — İngilizce fiil olarak koç metninde
  // geçebilir, yanlış-pozitif riski; bileşik "b switch" güvenli):
  "closet", "boathouse", "dice", "mid courtyard", "b lanes", "b switch",
  // Bind:
  "a bath", "b hall", "triple box",
  // Icebox:
  "a belt", "nest", "pipes", "kitchen", "tube", "boiler",
  "blue", "orange", "yellow", "green", "snowman",
  // Haven:
  "c link", "c platform",
  // Lotus / Pearl / Split / Sunset kalanları (maps-3 denetimi):
  "a ramp", "vents", "sewer", "pillar", "plaza", "dugout", "shops",
  "connector", "club", "tunnel", "courtyard", "boba", "alley",
  "a root", "b upper", "a stairs", "c hall", "tower", "ramp",
  // Corrode gerçek callout seti (maps-2 denetimi, 2026-07-08 — corrode.md
  // web-doğrulanmış isimlerle sıfırdan yazıldı; elbow/pocket/a yard/mid window/
  // tower zaten listede):
  "stairs", "top mid", "bottom mid",
];

const REPETITION_KEYWORDS = [
  // Turkish
  // Cycle 3 (council 2026-06-26): bare "tekrar" REMOVED — it matched FUTURE
  // coach advice ("o açıyı tekrar deneme", "A'ya tekrar girersen") and falsely
  // flagged it as a PAST repetition claim, which (with no death_position in the
  // round memory) cascaded to a level-3 strip that DESTROYED a good suggestion
  // (empirical S9: "...A'ya tekrar giriyorsanız operator'la smoke/flash..." →
  // gutted to a stub). PAST-claim forms kept: "tekrar eden" (sıfat-fiil) +
  // "tekrar tekrar" (yineleme). Anti-uydurma intact — count/position/window
  // checks below still catch fabricated stats.
  "tekrar eden", "tekrar tekrar", "art arda", "sürekli",
  "hep aynı", "aynı bölge", "aynı pozisyon",
  "pattern", "kalıcı",
  // English
  "in a row", "straight", "consecutive", "consistently",
  "every round", "same spot", "same position",
  "repeating", "recurring", "persistent", "every time",
];

export function extractClaims(text: string): ExtractedClaims {
  const lower = text.toLowerCase();

  // Extract count
  let claimedCount: number | null = null;
  for (const p of COUNT_PATTERNS) {
    const m = lower.match(p);
    if (m) { claimedCount = parseInt(m[1]); break; }
  }

  // Extract window
  let claimedWindow: number | null = null;
  for (const p of WINDOW_PATTERNS) {
    const m = lower.match(p);
    if (m) { claimedWindow = parseInt(m[1]); break; }
  }

  // Extract position
  let claimedPosition: string | null = null;
  for (const pos of POSITION_NAMES) {
    if (lower.includes(pos)) { claimedPosition = pos; break; }
  }

  // Detect repetition claim
  const repetitionClaim = REPETITION_KEYWORDS.some(k => lower.includes(k));

  return { claimedCount, claimedWindow, claimedPosition, repetitionClaim };
}

// ── Memory Validation ──

export function validateClaims(
  claims: ExtractedClaims,
  memory: RoundMemoryEntry[],
): ValidationResult {
  const totalRounds = memory.length;

  // FIX #1: Window MUST be strict — only use last N rounds for windowed claims
  const windowSize = claims.claimedWindow
    ? Math.min(claims.claimedWindow, totalRounds)
    : totalRounds;
  const windowEntries = memory.slice(-windowSize);

  // FIX #2: ONLY count HIGH or MEDIUM confidence — LOW NEVER counted
  const windowDeaths = windowEntries.filter(r =>
    r.died === true &&
    typeof r.death_position === "string" &&
    r.death_position.length > 0 &&
    (r.position_confidence === "high" || r.position_confidence === "medium")
  );

  // Count matching position within window
  let actualCount = 0;
  if (claims.claimedPosition) {
    const posLower = claims.claimedPosition.toLowerCase();
    actualCount = windowDeaths.filter(r =>
      (r.death_position || "").toLowerCase().includes(posLower)
    ).length;
  } else {
    actualCount = windowDeaths.length;
  }

  // Validate count — claimed must be <= actual
  const countValid = claims.claimedCount === null || claims.claimedCount <= actualCount;

  // Validate position exists in windowed memory
  const positionValid = claims.claimedPosition === null || actualCount > 0;

  // FIX #4: Repetition requires actualCount >= 2, no exceptions
  const repetitionValid = !claims.repetitionClaim || actualCount >= 2;

  // Determine rewrite level
  let rewriteLevel: 1 | 2 | 3;
  if (countValid && positionValid && repetitionValid) {
    rewriteLevel = 1;
  } else if (positionValid && actualCount >= 1) {
    rewriteLevel = 2;
  } else {
    rewriteLevel = 3;
  }

  return {
    countValid,
    positionValid,
    repetitionValid,
    actualCount,
    actualWindow: windowSize,
    rewriteLevel,
  };
}

// ── Safe Rewrite ──

export function rewriteUnsafeClaims(
  text: string,
  claims: ExtractedClaims,
  validation: ValidationResult,
  // Cycle 3 (council 2026-06-26): when EVERY sentence is an unproven repetition
  // claim and gets dropped, the neutral death-fallback ("Bu round beklenen
  // açıdan vuruldun.") is fine for a deathAnalysis but WRONG for a
  // nextRoundSuggestion (a past-tense death line in a "next round plan" field =
  // useless stub). When false, return "" instead so the caller can keep the
  // original advice. Defaults true → every existing caller is byte-identical.
  allowEmptyFallback: boolean = true,
  // Denetim 2026-07-19 (F5): route istek dilini biliyor — verilirse heuristik
  // yerine kesin dil kullanılır; verilmezse eski heuristik → eski çağıranlar bayt-aynı.
  lang?: "tr" | "en",
): string {
  if (validation.rewriteLevel === 1) {
    return text; // all claims verified
  }

  let result = text;

  // Dil tespiti (canlı-test 2026-07-18 "bir TR bir EN"): replacement metinleri
  // ÇIKTININ diliyle eşleşmeli — EN cümleye "kez" enjekte etmek (ve TR cümleye
  // "recently") kelime-düzeyi dil karışmasının kaynağıydı. Türkçe özel harf
  // heuristiği level-3'teki mevcut isTr tespitiyle aynı ailedendir.
  // Denetim 2026-07-19 (F5): lang verilmişse heuristik atlanır (özel-harfsiz TR
  // cümle EN sayılıp "times/recently" enjekte edilmesin).
  const trText = lang ? lang === "tr" : /[şçğıöü]/i.test(text);

  if (validation.rewriteLevel === 2) {
    // Position valid but count/repetition overclaimed
    if (claims.claimedCount !== null && !validation.countValid) {
      // Cover Turkish AND English count phrasings — sed only handled "kez".
      const ct = claims.claimedCount;
      const countPatterns = [
        new RegExp(`${ct}\\s*kez`, "gi"),
        new RegExp(`${ct}\\s*defa`, "gi"),
        new RegExp(`${ct}\\s*round(s)?\\s*(in\\s*a\\s*row|straight|consecutive)?`, "gi"),
        new RegExp(`${ct}\\s*time(s)?`, "gi"),
        new RegExp(`${ct}\\s*death(s)?`, "gi"),
        new RegExp(`${ct}\\s*match(es)?\\s*in\\s*a\\s*row`, "gi"),
      ];
      const replacement = validation.actualCount >= 2
        ? (trText ? `${validation.actualCount} kez` : `${validation.actualCount} times`)
        : "";
      for (const re of countPatterns) {
        result = result.replace(re, replacement);
      }
    }

    if (claims.claimedWindow !== null) {
      const w = claims.claimedWindow;
      const windowPatterns = [
        new RegExp(`son\\s+${w}\\s*round`, "gi"),
        new RegExp(`son\\s+${w}\\s*maç`, "gi"),
        new RegExp(`last\\s+${w}\\s*round(s)?`, "gi"),
        new RegExp(`last\\s+${w}\\s*match(es)?`, "gi"),
        new RegExp(`past\\s+${w}\\s*round(s)?`, "gi"),
      ];
      for (const re of windowPatterns) {
        result = result.replace(re, trText ? "son round'larda" : "recently");
      }
    }

    // FIX #3+#4: If repetition invalid, strip ALL repetition language at level 2 too
    if (!validation.repetitionValid) {
      for (const keyword of REPETITION_KEYWORDS) {
        if (result.toLowerCase().includes(keyword)) {
          result = result.replace(new RegExp(keyword, "gi"), "");
        }
      }
    }
  }

  if (validation.rewriteLevel === 3) {
    // No memory support — strip ALL historical and repetition claims.
    // Detect language from the (already-mostly-cleaned) result so the neutral
    // fallback (used only if EVERY sentence gets dropped) matches the language.
    // Denetim 2026-07-19 (F5): lang verilmişse kesin; verilmezse eski heuristik.
    const isTr = lang ? lang === "tr" : /[şçğıöü]|round'da|maç|tur|round'lar/i.test(result);

    // DROP the ENTIRE sentence that carries an unproven repetition claim,
    // instead of the old in-place keyword→"bu round'da" substitution which
    // produced broken Turkish like "Bu bu round'da eden hata". Split on
    // sentence boundaries, keep only sentences with NO repetition keyword.
    const sentences = result.split(/(?<=[.!?])\s+/);
    const safe = sentences.filter(
      (sent) => !REPETITION_KEYWORDS.some((k) => sent.toLowerCase().includes(k)),
    );
    result = safe.join(" ").trim();
    if (!result) {
      // Cycle 3 (council 2026-06-26): a nextRoundSuggestion must NOT be replaced
      // by a past-tense death stub — return "" so the caller keeps the original
      // (still-actionable) advice instead. Only deathAnalysis/generic get the
      // neutral fallback.
      if (!allowEmptyFallback) return "";
      // Every sentence was an unproven repetition claim → neutral, language-
      // matched fallback. NOT coach advice (no-fake: this is a safety strip,
      // not synthesized coaching) — just a factual, non-overclaiming line.
      result = isTr
        ? "Bu round beklenen açıdan vuruldun."
        : "You were caught at the expected angle this round.";
    }

    // Remove count claims entirely (TR + EN forms).
    if (claims.claimedCount !== null) {
      const ct = claims.claimedCount;
      const countPatterns = [
        new RegExp(`${ct}\\s*kez`, "gi"),
        new RegExp(`${ct}\\s*defa`, "gi"),
        new RegExp(`${ct}\\s*round(s)?\\s*(in\\s*a\\s*row|straight|consecutive)?`, "gi"),
        new RegExp(`${ct}\\s*time(s)?`, "gi"),
        new RegExp(`${ct}\\s*death(s)?`, "gi"),
        new RegExp(`${ct}\\s*match(es)?\\s*in\\s*a\\s*row`, "gi"),
      ];
      for (const re of countPatterns) result = result.replace(re, "");
    }

    // Remove window claims (TR + EN).
    if (claims.claimedWindow !== null) {
      const w = claims.claimedWindow;
      const windowPatterns = [
        new RegExp(`son\\s+${w}\\s*(round|maç)`, "gi"),
        new RegExp(`last\\s+${w}\\s*(round|match)(es|s)?`, "gi"),
        new RegExp(`past\\s+${w}\\s*(round|match)(es|s)?`, "gi"),
      ];
      for (const re of windowPatterns) result = result.replace(re, "");
    }

    // Remove "pattern" word if no pattern proven
    result = result.replace(/\bpattern\b/gi, "");
  }

  // Clean up double spaces and trailing punctuation issues
  result = result.replace(/\s{2,}/g, " ").trim();

  return result.trim();
}

// ── Route / Trade Anti-Fabrication Guard ──
//
// deathLocation tells us WHERE the player died — NEVER the route they took to
// get there. So "mid'den çıkıp A'da öldün" is a fabrication unless the desktop
// actually measured the route (FAZ3 minimap tracking). Likewise "trade
// alamadın" is a claim about a trade OUTCOME we may not have observed. This
// guard strips such unproven claims when the supporting fact is absent.
//
// Anchored to real callout names (POSITION_NAMES) so legitimate death-angle
// wording like "arkadan geldi" (came from behind) is NEVER touched — that's a
// direction, not a route origin. Imperative advice ("trade kur", "rotate yap")
// is also untouched; only PAST-TENSE origin/outcome claims match.
//
// factGround.hasRoute / hasTradeData are derived in the route from whether the
// desktop actually sent playerRoute / tradedByAlly for this round.

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Motion verbs that, following "<callout>'dan/den", assert an entry/route.
// ONLY past-tense / gerund CLAIM forms (çıkıp, geldin, gelerek…). Conditional
// or future advice ("gelirsen", "gelince", "çıkarsan", aorist "gelir") is
// deliberately NOT listed — stripping legit advice would degrade coach quality.
const ROUTE_ORIGIN_VERBS =
  "(çıkıp|çıktın|çıkmışsın|çıkarak|gelip|geldin|gelmişsin|gelerek|geçip|geçtin|geçmişsin|geçerek|açılıp|açıldın|açılmışsın|girip|girdin|girmişsin|girerek|ilerleyip|ilerledin|gittin|gitmişsin)";

// NOTE: \w does NOT match Turkish ı/ş/ğ/ç/ö/ü, so suffixed claim verbs are
// enumerated explicitly rather than via \w+ (e.g. "attın" would slip past att\w+).
const ROUTE_GENERIC_PATTERNS: RegExp[] = [
  /\brotasyon\s+(attın|attı|atmışsın|atmış|yaptın|yaptı|yapmışsın|yapmış)/gi,
  /\brotate\s+(ettin|etti|etmişsin)/gi,
  /\bgeri\s+dön(dün|üp|erek)/gi,
];

const TRADE_CLAIM_PATTERNS: RegExp[] = [
  /\btrade\s*['’]?\s*(alamadın|alınmadı|kuramadın|kurulmadı|edilemedin|edilmedi|yapılmadı|olmadı)/gi,
  /\btakım(ın)?\s+(seni\s+)?trade\s+(etmedi|alamadı|kurmadı|edemedi)/gi,
  /\btrade\s*['’]?\s*siz\s+(öldün|kaldın|gittin)/gi,
  // EN aynası (denetim 2026-07-19 F8): "your death wasn't traded" EN çıktıda
  // süzülmüyordu. TR ile aynı ilke: yalnız GEÇMİŞ-sonuç iddiaları; öğüt
  // ("make sure you get traded") listede DEĞİL. EN literal'ler TR metne değemez.
  /\b(?:wasn['’]?t|was\s+not|couldn['’]?t\s+be|didn['’]?t\s+get|never\s+got)\s+traded\b/gi,
  /\bwent\s+untraded\b/gi,
  /\bun-?traded\b/gi,
  /\bno\s+one\s+traded\s+you\b/gi,
  /\bnobody\s+traded\s+you\b/gi,
  /\bteam\s+(?:didn['’]?t|couldn['’]?t|failed\s+to)\s+trade\s+you\b/gi,
];

// Agent names for the killer-when-absent guard (2026-06-26 grounding audit).
const AGENT_NAMES = [
  "Jett", "Raze", "Phoenix", "Reyna", "Yoru", "Neon", "Iso", "Waylay",
  "Sage", "Killjoy", "Cypher", "Chamber", "Deadlock", "Vyse", "Veto",
  "Omen", "Brimstone", "Viper", "Astra", "Harbor", "Clove", "Miks",
  "Sova", "Breach", "Skye", "Fade", "Gekko", "KAY/O", "Kayo", "Tejo",
  "Reay", // model/OCR garble of "Reyna" (canlı-test 2026-06-29) — yakala ki katil-guard onu da nötrlesin
];
// Definite kill verbs (after coach-text's -miş→-di normalization runs upstream).
const KILL_VERBS = "(öldürdü|öldürdün|kesti|vurdu|düşürdü|indirdi|biçti)";

// ── Ortak ajan-alternasyonu (denetim B35 + B83, 2026-07-31) ──
// Uzun ad ÖNCE ("KAY/O" > "Kayo"). guardUnprovenFacts içindeki mevcut yerel
// NAME_ALT BİLİNÇLİ olarak yerinde bırakıldı — hasKiller=false yolu bayt-aynı kalsın.
const AGENT_NAME_ALT = AGENT_NAMES.map(escapeRe).sort((a, b) => b.length - a.length).join("|");

/**
 * killerInfo'dan GERÇEK katil ajanını çıkar (denetim B83, 2026-07-31).
 *
 * SÖZLÜK-BAĞLI, extractKillerWeapon ile birebir aynı anti-uydurma ilkesi: yalnız
 * RESMİ ajan tablosunda (format-display.knownAgent) kanıtlı bir ad kabul edilir;
 * serbest metin ("killed by xhtx") ASLA ajan sayılmaz. İKİ FARKLI resmi ad
 * geçiyorsa (OCR karışması / killfeed'de iki satır) null döner — belirsizken
 * metne DOKUNULMAZ. Dönüş: resmi ad ("Cypher", "KAY/O") ya da null.
 */
export function extractKillerAgent(killerInfo?: string | null): string | null {
  if (!killerInfo) return null;
  const found = new Set<string>();
  for (const raw of AGENT_NAMES) {
    const canon = knownAgent(raw);
    if (!canon) continue; // OCR garble'ı ("Reay") gerçek-katil kaynağı SAYILMAZ
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(raw)}(?![\\p{L}\\p{N}])`, "iu");
    if (re.test(killerInfo)) found.add(canon);
  }
  return found.size === 1 ? [...found][0] : null;
}

// ── DÜŞMAN SETUP/UTIL İDDİASI TESPİTİ (denetim B35, 2026-07-31) ──
// Üç koşul da AYNI CÜMLEDE sağlanmalı: (1) düşman öznesi, (2) util adı,
// (3) 3. TEKİL GEÇMİŞ util fiili. 2. tekil ("attın/kurdun" = oyuncunun kendi
// eylemi), emir kipi ("at/aç/kur" = öğüt) ve geniş/koşullu zaman ("atar/atarsa")
// listede YOK — ROUTE_ORIGIN_VERBS ile aynı ilke: yalnız GEÇMİŞ-İDDİA süzülür.
const ENEMY_UTIL_NOUNS = [
  "smoke", "duman", "flash", "molly", "molotof", "tuzak", "trap", "trapwire",
  "tripwire", "ult", "ultimate", "util", "utility", "yetenek", "duvar", "wall",
  "drone", "dart", "mayın", "kafes", "stun", "nade",
];
const ENEMY_UTIL_PAST_VERBS = [
  // TR — yalnız 3. tekil geçmiş
  "attı", "atmıştı", "açtı", "açmıştı", "kurdu", "kurmuştu", "dizdi", "dizmişti",
  "bıraktı", "bırakmıştı", "yerleştirdi", "yerleştirmişti", "kullandı", "kullanmıştı",
  "patlattı", "çekti",
  // EN aynası
  "threw", "placed", "lined", "popped", "dropped", "flashed", "walled", "used",
];
const ENEMY_SUBJECT_RE = new RegExp(
  `(?<![\\p{L}])(?:${AGENT_NAME_ALT}|düşman|rakip|enem(?:y|ies)|opponent)(?:['’]?[\\p{L}]{0,6})?(?![\\p{L}])`,
  "iu",
);
const ENEMY_UTIL_NOUN_RE = new RegExp(
  `(?<![\\p{L}])(?:${ENEMY_UTIL_NOUNS.map(escapeRe).join("|")})(?:['’]?[\\p{L}]{0,8})?(?![\\p{L}])`,
  "iu",
);
const ENEMY_UTIL_VERB_RE = new RegExp(
  `(?<![\\p{L}])(?:${ENEMY_UTIL_PAST_VERBS.map(escapeRe).join("|")}|set\\s+up)(?![\\p{L}])`,
  "iu",
);
// KANITLI ÖLÜM ÇEKİRDEĞİ — bu kalıbı taşıyan cümle util-iddiası yüzünden ASLA
// düşürülmez (2026-07-24 "nerede vurulduğunu söylemiyor" regresyonunun dersi:
// uydurmayı silerken GERÇEĞİ kaybetmek en pahalı hata).
const DEATH_CORE_RE = new RegExp(
  `(?<![\\p{L}])seni(?![\\p{L}])[^.!?\\n]{0,60}?(?:öldürdü|vurdu|kesti|düşürdü|indirdi|biçti|avladı|devirdi)(?![\\p{L}])`
  + `|(?<![\\p{L}])(?:öldün|vuruldun|öldürüldün|düştün|yakalandın)(?![\\p{L}])`
  + `|(?<![\\p{L}])(?:killed|shot|caught|picked|dropped|hit|took)\\s+you(?![\\p{L}])`,
  "iu",
);

/** Bir CÜMLE, kanıtsız düşman-setup/util iddiası taşıyor mu? (B35) */
function isUnprovenEnemyUtilClaim(sentence: string): boolean {
  if (DEATH_CORE_RE.test(sentence)) return false; // kanıtlı ölüm olgusu → dokunma
  return ENEMY_SUBJECT_RE.test(sentence)
    && ENEMY_UTIL_NOUN_RE.test(sentence)
    && ENEMY_UTIL_VERB_RE.test(sentence);
}

// Weapon names for the weapon-when-absent guard (Ölüm-Veri Sözleşmesi 2026-06-29).
// Used to strip a FABRICATED enemy-weapon claim when killerInfo has no "with <X>"
// (i.e. the killing weapon was never read). 'op'/'awp'/short ambiguous tokens
// DELIBERATELY EXCLUDED — 'operator' already covers it and short tokens risk
// matching unrelated words ('open', 'op' inside other words). loadout (the
// PLAYER'S own weapon) is a SEPARATE fact and is NEVER touched: the strip is
// anchored to a "seni ... <weapon> ... <kill-verb>" (enemy→player) pattern so
// legit loadout advice ("Vandal aldın ama vuramadın") and enemy-economy
// observations ("düşman shorty aldı") stay byte-identical (denetim fix #1/#3).
const WEAPON_NAMES = [
  "operator", "vandal", "phantom", "sheriff", "ghost", "classic", "spectre",
  "bulldog", "guardian", "marshal", "outlaw", "judge", "bucky", "ares", "odin",
  "stinger", "frenzy", "shorty",
];

/**
 * Build the Death-Data Contract ground truth from the raw request body + the
 * sanitized ctx. SINGLE source for BOTH the vision route AND the report route so
 * the fact-sheet (prompt) and the guard (post-process) read the SAME object —
 * no per-route drift. Every flag means "this fact was actually OBSERVED".
 *
 * alive/spike are HARD-false: the desktop sends no reliable signal (can't tell
 * "0" from "unread", spike only set when planted). Safe side = those claims are
 * always neutralized = zero fabrication. If the desktop later sends an explicit
 * read-flag/sentinel, flip these here — backend-only, no desktop dependency.
 */
export function buildFactGround(
  reqBody: Record<string, unknown>,
  ctx: Record<string, unknown>,
): FactGround {
  const killerInfo = typeof reqBody.killerInfo === "string" ? reqBody.killerInfo : "";
  return {
    hasKiller: killerInfo.length > 0,
    // Denetim B83 (2026-07-31): katil KESİN biliniyorsa adı da taşınır → guard
    // metindeki yanlış ajanı düzeltebilsin. Sözlükte yoksa/belirsizse null →
    // undefined kalır ve guard hiç çalışmaz (belirsizken metne dokunmayız).
    killerAgent: extractKillerAgent(killerInfo) ?? undefined,
    // TEK-KAYNAK (güvenlik denetimi L-1, 2026-07-08): eski /\bwith\s+\S/ kalıbı,
    // OCR'ın "with"i düşürdüğü "by reyna sheriff" formunu KAÇIRIYORDU → [SİLAH+KOMP
    // İPUCU] "silah: sheriff" derken factSheet "silah BİLİNMEYEN" diyor, guard
    // gerçek silahı strip'liyordu (çelişkili sinyal). extractKillerWeapon sözlük-
    // bağlı (yalnız gerçek silah adları eşleşir, serbest metin asla) → çıplak
    // token da GÖZLENMİŞ silahtır. İşaretçi + factSheet + guard artık aynı gerçeği
    // paylaşır; silah token'ı hiç yoksa guard eskisi gibi strip'ler.
    hasWeapon: killerInfo.length > 0 && extractKillerWeapon(killerInfo) !== null,
    hasDeathLocation: typeof ctx.deathLocation === "string" && (ctx.deathLocation as string).length > 0,
    deathLocation: typeof ctx.deathLocation === "string" ? (ctx.deathLocation as string) : undefined,
    hasDeathAngle: typeof ctx.deathAngle === "string" && (ctx.deathAngle as string).length > 0,
    hasHeadshot: reqBody.headshot === true,
    hasAliveCount: false,
    hasSpike: false,
    // Denetim B35 (2026-07-31): düşman yetenek/setup kullanımı HİÇ okunmuyor →
    // HARD-false (alive/spike ile aynı gerekçe). Masaüstü gerçek bir util sinyali
    // göndermeye başlarsa yalnız burası true olur — backend-only, desktop bağımlılığı yok.
    hasEnemyUtil: false,
    hasTradeData: typeof reqBody.tradedByAlly === "boolean",
    hasRoute: typeof ctx.playerRoute === "string" && (ctx.playerRoute as string).length > 0,
  };
}

/**
 * Strip route-origin and trade-outcome claims the supporting fact can't back.
 * Deterministic, grammar-collapsing (same house style as rewriteUnsafeClaims).
 */
export function guardUnprovenFacts(
  text: string,
  factGround: FactGround,
  // Denetim 2026-07-19 (F5): çağıran route istek dilini (reqLang) ZATEN biliyor —
  // özel-harf heuristiği özel-harfsiz TR cümleyi EN sayıp "an enemy"yi Türkçe
  // metne enjekte ediyordu. lang verilirse kesin; verilmezse eski heuristik →
  // mevcut 2-arg çağıranlar bayt-aynı.
  lang?: "tr" | "en",
): string {
  let result = text;

  // ── AJAN-BOŞ UYDURMA GUARD'I (canlı-test #9, 2026-08-04) ──────────────────
  // NEDEN: istek payload'ında oyuncunun ajanı BOŞ/Unknown iken model oyuncuya
  // ajan YAKIŞTIRABİLİYOR. Canlı kanıt: maç onaylanmadan atılan warmup AI
  // çağrısında agent alanı boştu ve model "Phoenix olarak kendi utilini..."
  // yazdı — oyuncu Brimstone'du. Warmup teslim edilmediği için kullanıcı
  // görmedi; ama maç ortasında agent-OCR boş kalabiliyor (bilinen ayrı desktop
  // sorunu) ve aynı uydurma o zaman KULLANICIYA gider.
  // KAPSAM DAR (bilinçli): yalnız OYUNCU-kendine-yakıştırma kalıpları düşer —
  // TR "<Ajan> olarak", EN "as <Agent>". Katil/düşman cümleleri ("Skye seni
  // öldürdü") bu kalıbı KURMAZ → onlara hiç dokunulmaz (killerInfo yolları
  // aşağıdaki mevcut guard'ların işi). Kalıp düşer, cümle akıcı kalır:
  // "Phoenix olarak kendi utilini kullanmadın" → "kendi utilini kullanmadın".
  // playerAgentKnown undefined/true iken blok HİÇ çalışmaz → mevcut çağıranlar
  // (report route dahil) bayt-aynı.
  // SIRA: killer-when-absent'ten ÖNCE — "Phoenix olarak ... Reyna seni vurdu"
  // metninde önce kalıp temizlenmezse STEP2 "Phoenix"i katil sanıp
  // "bir düşman olarak ..." bozuğunu üretebilir.
  if (factGround.playerAgentKnown === false) {
    const before = result;
    // TR: "<Ajan> olarak" (+ opsiyonel virgül). Türkçe-\b TUZAĞI: JS \b,
    // ş/ç/ğ/ı/ö/ü harflerinde kırılır → (?<![\p{L}]) sınıfı (dosya konvansiyonu).
    result = result.replace(
      new RegExp(`(?<![\\p{L}])(?:${AGENT_NAME_ALT})\\s+olarak(?![\\p{L}])\\s*,?\\s*`, "giu"),
      "",
    );
    // EN: "as <Agent>" (+ opsiyonel virgül). "such as Jett" BİLEREK MUAF —
    // "duelists such as Jett" meşru bir örnekleme, yakıştırma değil.
    result = result.replace(
      new RegExp(`(?<![\\p{L}])(?<!such\\s)as\\s+(?:${AGENT_NAME_ALT})(?![\\p{L}])\\s*,?\\s*`, "giu"),
      "",
    );
    if (result !== before) {
      // Kalıp cümle BAŞINDAN düştüyse kalan ilk harfi büyüt ("kendi utilini..."
      // → "Kendi utilini..."). Yalnız strip GERÇEKLEŞTİYSE çalışır — dokunulmamış
      // metnin harfleri değişmez (coach-text stripEnHedges emsali). TR'de
      // i→İ dönüşümü için toLocaleUpperCase("tr-TR") şart ("i".toUpperCase()="I").
      const trText = lang ? lang === "tr" : /[şçğıöü]/i.test(result);
      result = result.replace(/(^|[.!?]\s+)([a-zçğıöşü])/gu, (_m, p: string, c: string) =>
        p + (trText ? c.toLocaleUpperCase("tr-TR") : c.toUpperCase()),
      );
    }
  }

  // Killer-when-absent (grounding audit 2026-06-26): killerInfo OCR'da YOKKEN
  // model belirli bir düşman ajanını katil olarak İSİMLENDİREMEZ (S14: "Cypher
  // seni kesti" uydurması). Ajan adını "bir düşman"a indir — ölüm gerçek ama
  // katilin KİMLİĞİ bilinmiyor. hasKiller=true iken (killfeed var) DOKUNMA:
  // model killer'ı doğru isimlendirmeli. reality-checker bunu daha önce HİÇ
  // denetlemiyordu (audit'in #1 fabrikasyon kaynağı).
  // killerInfo OCR'da YOKKEN model katil ismi UYDURAMAZ. Canlı-test 2026-06-29:
  // killerInfo prefetch-timing yüzünden gönderilmiyordu → model roster'dan tahmin
  // edip (a) yanlış katil, (b) çoklu-aday hedge "Reyna ya da Jett ya da Deadlock",
  // (c) "unknown" sızıntısı üretiyordu. 4-adımlı deterministik collapse → tek
  // "bir düşman". hasKiller=true iken (killfeed okundu) DOKUNMA. (council node-test 8/8)
  if (factGround.hasKiller === false) {
    // Dil (2026-07-18): "bir düşman" EN çıktıya Türkçe sızdırıyordu — replacement
    // metnin diline uyar (EN kill-fiilleri de token'a eklendi ki STEP2 EN'de tetiklensin).
    // Denetim 2026-07-19 (F5): lang verilmişse heuristik yerine onu kullan.
    const trText = lang ? lang === "tr" : /[şçğıöü]/i.test(result);
    const AN_ENEMY = trText ? "bir düşman" : "an enemy";
    const NAME_ALT = AGENT_NAMES.map(escapeRe).sort((a, b) => b.length - a.length).join("|");
    // Denetim 2026-07-19 (F6): EN'de katil adının önündeki "the" artikeli match'e
    // DAHİL — eski hali "The Cypher killed you" → "The an enemy killed you" üretiyordu
    // (EN şemanın kendi few-shot kalıbı "the Cypher killed you..." → model bu formu
    // üretmeye teşvikli). TR metinde "the" geçmez → TR yolu bayt-aynı.
    const THE = "(?:the\\s+)?";
    const KILLER_TOKEN = `(?:${NAME_ALT}|unknown|bilinmeyen)`;
    const KV2 = "(?:vurup öldürdü|öldürdü|öldürdün|öldürüldün|kestiler|kesti|vuruldun|vurdun|vurdu|düşürdü|indirdi|biçti|aldılar|aldı|avladı|devirdi|götürdü|temizledi|killed you|shot you|killed|shot|picked you off|took you down|caught you)";
    const NLB = "(?<![a-zçğıöşüâîû])", NL = "(?![a-zçğıöşüâîû])";
    // STEP1: ≥2 üyeli katil-disjunction ("X ya da Y ya da Z" / "X or Y") → tek genel-düşman
    result = result.replace(new RegExp(`${NLB}${THE}${KILLER_TOKEN}(?:\\s*(?:ya da|veya|or|/|,)\\s*${THE}${KILLER_TOKEN})+`, "gi"), AN_ENEMY);
    // STEP2: tek isimli katil + aynı clause'da kill-verb → genel-düşman (char-cap YOK).
    // Lookahead formu (F6): yalnız "(the) <katil>" token'ı değişir, clause'un geri
    // kalanı verbatim kalır — eski m.slice(m.indexOf(mid)) hilesi "The " tüketilince
    // ilk boşluğu "The"nin içinde bulup katil adını geri sızdırıyordu.
    const SINGLE = new RegExp(`${NLB}${THE}${KILLER_TOKEN}\\b(?=[^.!?;:—\\n]*?\\s${KV2}${NL})`, "gi");
    result = result.replace(SINGLE, AN_ENEMY);
    // STEP3: kalan stray "unknown"/"bilinmeyen" → genel-düşman
    result = result.replace(new RegExp(`${NLB}(?:unknown|bilinmeyen)${NL}`, "gi"), AN_ENEMY);
    // STEP4: "bir düşman ya da bir düşman" / "an enemy or an enemy" run'larını tek'e çökert
    result = result.replace(/bir düşman(?:\s*(?:ya da|veya|\/|,)\s*bir düşman)+/gi, "bir düşman");
    result = result.replace(/an enemy(?:\s*(?:or|\/|,)\s*an enemy)+/gi, "an enemy");
  }

  // KATİL-TUTARLILIĞI (denetim B83, 2026-07-31): üstteki guard yalnız katilin
  // BİLİNMEDİĞİ durumu kapsıyordu; killerInfo OCR'da VARKEN model roster'daki
  // BAŞKA bir ajanı katil gösterirse ("killerInfo=killed by jett" iken "Cypher
  // seni vurdu") hiçbir katman yakalamıyordu. Burada uydurma ajan adı GERÇEK
  // katille DEĞİŞTİRİLİR (silme değil düzeltme — ölüm olgusu korunur).
  //
  // ÇAPA (dar bilinçli): ajan adı + AYNI virgülsüz clause içinde "seni" + öldürme
  // fiili (EN'de "killed/shot you"). Bu yüzden oyuncunun KENDİ ajanına yapılan
  // atıflar eşleşmez: "Jett'inle dash atabilirdin, Reyna seni vurdu" → virgül
  // clause'u kestiği için "Jett" DOKUNULMAZ. Apostroflu iyelik ("Jett'in ult'u")
  // da bilinçli DIŞARIDA — Türkçe ek uyumu bozulmasın ("Reyna'in" üretmeyelim).
  // killerAgent yoksa (sözlükte ajan yok / iki ad / rapor route'u maç-seviyesi)
  // guard HİÇ çalışmaz → mevcut davranış bayt-aynı.
  const truthKiller = factGround.killerAgent;
  if (factGround.hasKiller === true && truthKiller) {
    // clause sınırı: virgül dahil ayraçlar geçilmez.
    //
    // 🔴 AJAN-GEÇİRMEZ (karşı-denetim, 2026-07-31 gecesi): eskiden bu sınıf düz
    // `[^.,;:!?—\n]` idi ve guard, ölüm çekirdeğine giden yolda BAŞKA bir ajan adı
    // olsa bile ilk adı katille EZİYORDU. Yani uydurmayı önlemek için konan katman
    // kendisi uydurma üretiyordu:
    //     "Sage duvarını beklerken Cypher seni A Short'ta vurdu."
    //       → "Cypher duvarını beklerken Cypher seni A Short'ta vurdu."  ✗
    //     "Jett ile dash attın ve Reyna seni vurdu."
    //       → oyuncunun KENDİ ajanı katilin adıyla değişiyordu (canlı-test #7'de
    //         OCR tarafında düzelttiğimiz "ajan dönmesi"nin deterministik ikizi).
    // Çözüm: boşluğun HİÇBİR noktasında bir ajan adı başlamasın. Böylece guard'ın
    // asıl işi (metindeki YANLIŞ katili doğrusuyla düzeltmek) aynen sürer —
    // aradaki ikinci ajanı ezme davranışı biter.
    const CL = `(?:(?!(?<![\\p{L}])(?:${AGENT_NAME_ALT})(?![\\p{L}]))[^.,;:!?—\\n])`;
    const fixKiller = (m: string, pre: string, name: string) =>
      name.toLowerCase() === truthKiller.toLowerCase() ? m : `${pre}${truthKiller}`;
    // TR: "<Ajan> ... seni ... <öl-fiili>"
    result = result.replace(
      new RegExp(
        `(?<![\\p{L}])((?:the\\s+)?)(${AGENT_NAME_ALT})(?![\\p{L}'’])`
        + `(?=${CL}{0,50}?(?<![\\p{L}])seni(?![\\p{L}])${CL}{0,40}?${KILL_VERBS}(?![\\p{L}]))`,
        "giu",
      ),
      fixKiller,
    );
    // EN aynası: "<Agent> ... killed/shot you" (nesne fiilden SONRA gelir).
    result = result.replace(
      new RegExp(
        `(?<![\\p{L}])((?:the\\s+)?)(${AGENT_NAME_ALT})(?![\\p{L}'’])`
        + `(?=${CL}{0,50}?(?:(?:killed|shot|caught|dropped)\\s+you(?![\\p{L}])`
        + `|picked\\s+you\\s+off|took\\s+you\\s+down))`,
        "giu",
      ),
      fixKiller,
    );
  }

  // WEAPON-absent (Ölüm-Veri Sözleşmesi #2, 2026-06-29): killerInfo'da "with <silah>"
  // YOKKEN öldüren DÜŞMAN silahı BİLİNMİYOR → model silah-ismini UYDURAMAZ. Strip
  // SADECE "seni ... <silah> ... <öl-fiili>" (düşman→oyuncu öldürme) çapasına bağlı:
  // böylece (a) loadout/oyuncu-silahı ("Vandal aldın ama vuramadın") ve (b) düşman-
  // ekonomi gözlemi ("düşman shorty aldı") DOKUNULMADAN kalır (denetim fix #1/#3).
  // hasWeapon=true iken (killerInfo silahı içeriyor) DOKUNMA. 'aldı' fiil-listesinde
  // DEĞİL (çift-anlam: öldürdü/satın-aldı). Fiilden SONRA NL sınırı → 'vurdun/öldürdün'
  // gibi ekli formlar kısmi eşleşmesin.
  if (factGround.hasWeapon === false) {
    const WALT = WEAPON_NAMES.map(escapeRe).sort((a, b) => b.length - a.length).join("|");
    const NLB = "(?<![a-zçğıöşüâîû])", NL = "(?![a-zçğıöşüâîû])";
    const WKV = "(öldürdü|öldürdün|vurdu|vurdun|kesti|düşürdü|indirdi|biçti)";
    // "seni ... operator'la ... öldürdü" → silahı (+edatı) sil, geri kalanı koru.
    const re = new RegExp(
      `((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.!?;:—\\n]{0,40}?)${NLB}(?:${WALT})${NL}\\s*['’]?\\s*(?:l[ae]|ile)?\\s+([^.!?;:—\\n]{0,30}?)${WKV}${NL}`,
      "gi",
    );
    result = result.replace(re, (_m, pre, mid, verb) => `${pre}${mid}${verb}`);
  }

  // ALIVE-COUNT-absent (Ölüm-Veri Sözleşmesi #6, 2026-06-29): hayatta-sayısı
  // güvenilir DEĞİL (desktop '0 gerçekten 0' vs 'OCR okunamadı' ayrımı göndermiyor)
  // → hasAliveCount DAİMA false → "N düşman kaldı / 1vN kaldın / takımın N kişi sağ"
  // sayı-iddiasını sil. hasAliveCount=true iken (ileride desktop güvenilir sinyal
  // gönderirse) DOKUNMA.
  if (factGround.hasAliveCount === false) {
    const ALIVE_PATTERNS: RegExp[] = [
      /\b\d+\s*(düşman|rakip)\s*(kaldı|sağ|hayatta|vardı)/gi,
      /\b\d+\s*v\s*\d+\b/gi,                       // "1v3", "2 v 4"
      /\btakım(ın)?\s+\d+\s*kişi\s*(sağ|kaldı|hayatta)/gi,
      /\b\d+\s*kişi\s*(sağ\s*kaldı|hayatta\s*kaldı)/gi,
      // EN aynası (denetim 2026-07-19 F8): "3 enemies left/alive" EN çıktıda
      // süzülmüyordu. EN literal'ler TR metinle eşleşemez → TR yolu bayt-aynı.
      /\b\d+\s*enem(?:y|ies)\s+(?:left|alive|remaining|up)\b/gi,
      /\b\d+\s*(?:allies|teammates?|players?)\s+(?:left|alive|remaining)\b/gi,
    ];
    for (const re of ALIVE_PATTERNS) result = result.replace(re, "");
  }

  // SPIKE-absent (Ölüm-Veri Sözleşmesi #7, 2026-06-29): spike durumu güvenilir DEĞİL
  // (ctx.spikePlanted yalnız true iken set → false/absent ayırt edilemiyor) → hasSpike
  // DAİMA false → "spike kuruldu/kurulmadı/defuse ediyordun" iddiasını sil. hasSpike=true
  // iken DOKUNMA.
  if (factGround.hasSpike === false) {
    const SPIKE_PATTERNS: RegExp[] = [
      /\bspike\s*['’]?\s*(kuruldu|kurulmuştu|kurulmadı|kurulmamıştı|kurmuştun|açılmıştı)/gi,
      /\b(defuse|defüz)\s*(ediyordun|ettin|etmeye|alıyordun)/gi,
      /\bspike\s*(defuse|çöz)/gi,
      // EN aynası (denetim 2026-07-19 F8): "the spike was planted/down" iddiası
      // EN çıktıda süzülmüyordu. Yalnız GEÇMİŞ-iddia formları — öğüt ("plant the
      // spike", "after the spike is planted" koşulu) listede DEĞİL.
      /\bspike\s+(?:was|got|had been)\s+(?:planted|down|ticking)\b/gi,
      /\byou\s+were\s+defusing\b/gi,
      /\bwhile\s+defusing\b/gi,
    ];
    for (const re of SPIKE_PATTERNS) result = result.replace(re, "");
  }

  // HEADSHOT-absent (canlı-test 2026-06-29): headshot verisi sistemde HİÇ okunmuyor
  // (combat-report sadece "killed by X"; silah/yer/headshot YOK) → "kafadan vuruldun/
  // öldün" %100 UYDURMA. Ölüm-tarifindeki "kafadan"ı sil ("seni ... kafadan [öl-verb]"
  // → "seni ... [öl-verb]"). İMPERATİF/GELECEK ÖĞÜT "kafadan vur" KORUNUR (anchor:
  // "seni" + ölüm-fiili). hasHeadshot=true gelirse (ileride OCR) strip atlanır.
  if (factGround.hasHeadshot === false) {
    result = result.replace(
      /((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,50}?)kafadan (vurup öldürdü|öldürdü|öldürdün|vurdu|vurdun|kesti|düşürdü|indirdi|biçti|aldı)(?![a-zçğıöşü])/gi,
      (_m: string, pre: string, verb: string) => pre + (verb === "vurup öldürdü" ? "vurup öldürdü" : (verb === "vurdu" || verb === "vurdun") ? "öldürdü" : verb),
    );
    result = result.replace(
      /((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,50}?)kafadan (vurarak|tek atışta) /gi,
      "$1",
    );
    // EN aynası (denetim 2026-07-19 F8): "one-tapped you / shot you in the head"
    // EN çıktıda süzülmüyordu. TR guard'la aynı sözleşme: kill-olgusu KORUNUR
    // ("killed you"), yalnız headshot-iddiası düşer. Öğüt ("aim for the head")
    // "you" nesne çapası olmadığından DOKUNULMAZ. Sıra: one-tapped önce (çıktısı
    // ikinci kalıba beslenebilir).
    result = result.replace(/\b(?:one[- ]?tapped|head-?shott?ed)\s+you\b/gi, "killed you");
    result = result.replace(/\b(killed|shot|hit|caught)\s+you\s+in\s+the\s+head\b/gi, "$1 you");
    result = result.replace(/\bwith\s+a\s+headshot\b/gi, "");
  }

  // Death-location-when-absent (LAUNCH BLOCKER 2026-06-28): deathLocation OCR'da
  // YOKKEN model belirli bir callout'u ÖLDÜĞÜN YER olarak iddia edemez (canlı-test
  // R2 "A Dish'te öldün" / R5 "B Tower'da vuruldun" = saf halüsinasyon; desktop
  // payload'ı o maçta 4/4 deathLocation göndermedi). Konum+lokatif(-da/-de/-ta/-te)
  // + ölüm/öldürme-fiili çapasını yakalayıp SADECE yer-iddiasını siler (fiil kalır).
  // hasDeathLocation=true iken DOKUNMA. Yön ("arkadan geldi") lokatif değil → güvenli.
  if (factGround.hasDeathLocation === false) {
    const DEATH_AT_VERBS = "(öldün|öldürüldün|vuruldun|düştün|yakalandın|kaldın|öldürdü|vurdu|düşürdü|kesti|indirdi)";
    for (const pos of POSITION_NAMES) {
      const re = new RegExp(
        `\\b${escapeRe(pos)}\\s*['’]?\\s*(?:d[ae]|t[ae])\\s+([^.!?]{0,30}?)${DEATH_AT_VERBS}`,
        "gi",
      );
      result = result.replace(re, (_m: string, mid: string, verb: string) => `${mid}${verb}`);
      // EN aynası (denetim 2026-07-19 F8): "you died at B Main" EN çıktıda
      // süzülmüyordu. TR guard'la aynı sözleşme: ölüm-fiili KALIR, yalnız uydurma
      // YER düşer. Ölüm-fiiline çapalı → "hold the angle at B Main" öğüdü
      // DOKUNULMAZ. Yalnız geçmiş-iddia formları ("get caught" öğüt formu yok).
      const reEnA = new RegExp(
        `\\b(died|was killed|got killed|was shot|got shot|was caught|got caught|went down)\\s+(?:at|in|near|on)\\s+${escapeRe(pos)}(?![a-z0-9-])`,
        "gi",
      );
      result = result.replace(reEnA, "$1");
      const reEnB = new RegExp(
        `\\b(killed|shot|caught|picked)\\s+you(\\s+off)?\\s+(?:at|in|near|on)\\s+${escapeRe(pos)}(?![a-z0-9-])`,
        "gi",
      );
      result = result.replace(reEnB, "$1 you$2");
    }
  }

  if (factGround.hasRoute !== true) {
    // Origin claims anchored to a known callout: "<callout>'dan çıkıp/gelip..."
    for (const pos of POSITION_NAMES) {
      const re = new RegExp(
        `\\b${escapeRe(pos)}\\s*['’]?\\s*(d[ae]n|t[ae]n)\\s+${ROUTE_ORIGIN_VERBS}`,
        "gi",
      );
      result = result.replace(re, "");
      // EN aynası (denetim 2026-07-19 F8): "came through mid / wrapped behind B Main"
      // rota-kökeni iddiası EN çıktıda süzülmüyordu (EN few-shot SCENARIO A bu dili
      // bizzat modelliyor). Yalnız GEÇMİŞ formlar — emir/koşul öğüdü ("push through
      // mid", "rotate from B") listede DEĞİL (TR ROUTE_ORIGIN_VERBS ile aynı ilke).
      const reEn = new RegExp(
        `\\b(?:came|pushed|rotated|wrapped|flanked)\\s+(?:in\\s+)?(?:from|through|behind|out\\s+of|via)\\s+${escapeRe(pos)}(?![a-z0-9-])`,
        "gi",
      );
      result = result.replace(reEn, "");
    }
    for (const re of ROUTE_GENERIC_PATTERNS) result = result.replace(re, "");
  }

  if (factGround.hasTradeData !== true) {
    for (const re of TRADE_CLAIM_PATTERNS) result = result.replace(re, "");
  }

  // DÜŞMAN SETUP/UTIL İDDİASI (denetim B35, 2026-07-31): masaüstü düşmanın
  // YETENEK KULLANIMINI HİÇ okumuyor, buna rağmen model "Cypher tuzaklarını
  // B Main'e dizdi" / "Omen smoke'unu mid'e attı" sınıfı GEÇMİŞ-KİP setup
  // iddiaları üretiyor ve hiçbir deterministik katman bunu süzmüyordu.
  //
  // İKİ SERT SINIR (regresyon koruması — "çalışanı bozma"):
  //  1) YALNIZ CÜMLE DÜŞÜRÜR, kelime kırpmaz. "Cypher tuzaklarını dizdi"nin
  //     ortasından silmek bozuk Türkçe üretir (level-3 rewrite'ın kendi dersi).
  //  2) TÜM cümleler iddia taşıyorsa metne HİÇ DOKUNMAZ. Boş alan döndürmek
  //     yasak: rapor route'unda fallback yok (alan boş kalırdı), vision'da ise
  //     çağıran zaten orijinali geri koyuyor → net etki sıfır. Ayrıca KANITLI
  //     ölüm çekirdeği ("seni ... öldürdü"/"killed you") taşıyan cümle asla
  //     düşmez — uydurmayı silerken gerçeği kaybetmeyiz.
  // NOT (kapsam): enemyAnalysis[0] şu an TEK cümle ve şema bu sınıfı BİZZAT
  // emrediyor (vision-prompt.ts ROUND_FEEDBACK_SCHEMA "Madde 1 = düşmanın SOMUT
  // setup/util'i") → orada guard bilinçli olarak no-op. Kalıcı çözüm şema
  // metnini killerInfo/roster gerçeğine bağlamaktır (crossFile).
  if (factGround.hasEnemyUtil === false) {
    // Ayıraçları YAKALAYARAK böl → korunan cümlelerin arasındaki satır sonu
    // (\n) ve boşluk aynen geri yazılır (rapor alanlarının biçimi bozulmasın).
    const chunks = result.split(/((?<=[.!?])\s+)/);
    const total = Math.ceil(chunks.length / 2);
    if (total > 1) {
      let dropped = 0;
      let rebuilt = "";
      for (let i = 0; i < chunks.length; i += 2) {
        const sent = chunks[i];
        if (sent.trim() && isUnprovenEnemyUtilClaim(sent)) { dropped++; continue; }
        rebuilt += sent + (chunks[i + 1] ?? "");
      }
      if (dropped > 0 && dropped < total) result = rebuilt.trim();
    }
  }

  // Collapse spaces and repair orphaned punctuation left by removals.
  result = result
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:]\s*){2,}/g, ", ")
    .replace(/[,;:]\s*([.!?])/g, "$1")   // "attın,." → "attın."
    .replace(/^[\s,;:.]+/, "")
    .replace(/[\s,;:]+$/, "")            // drop trailing orphan comma
    .trim();

  return result;
}

// ── Main Entry Point ──

/**
 * Validate AI output against round memory + present-round facts.
 * Call this AFTER AI generation, BEFORE returning response.
 *
 * @param outputText - The AI-generated text (deathAnalysis, insight, etc.)
 * @param roundHistory - Current round memory from the watch session
 * @param factGround - OPTIONAL present-round ground truth (route/trade presence).
 *                     When omitted, behaviour is identical to before — every
 *                     existing 2-arg caller is unaffected.
 * @returns Safe text with false claims rewritten
 */
/** YABANCI CALLOUT AYIKLAYICI (canlı bug 2026-07-21, Kaan/Lotus).
 *
 * Koç, OYNANMAYAN haritanın yer adını uydurabiliyor: Lotus maçında "A Short'ta
 * tek başına girdin" yazdı — Lotus'ta A Short YOKTUR (Ascent/Bind/Haven'da var).
 * POSITION_NAMES harita-bağımsız tek liste olduğu için doğrulayıcı bunu geçirdi.
 *
 * Bu ayıklayıcı, oynanan haritaya AİT OLMAYAN callout'ları metinden çıkarır.
 * Mevcut `guardUnprovenFacts`'ten BAĞIMSIZ ve ona DİK çalışır: o, ölüm yeri
 * bilinmiyorken konum iddiasını siler; bu ise ölüm yeri BİLİNSE bile yanlış
 * haritanın adını siler (rapor özeti gibi ölüm-bağlamı olmayan metinlerde de).
 *
 * GÜVENLİK: harita bilinmiyorsa (Unknown / tabloda yok / hiç verilmedi)
 * fonksiyon metne DOKUNMAZ — davranış eskisiyle bayt-aynı. Ayıklama yalnız
 * haritayı KESİN bildiğimizde çalışır.
 *
 * Cümleyi bozmamak için yalnız YER ADI düşer, cümle yapısı korunur:
 *   TR "A Short'ta tek başına girdin" → "tek başına girdin"
 *   EN "you pushed at A Short"        → "you pushed"
 */
export function stripForeignCallouts(
  text: string,
  map: string | undefined | null,
  // Masaüstünün OCR ile ÖLÇÜP gönderdiği ölüm yeri/yerleri. HER ZAMAN meşru.
  // Vision route TEK string; report route TÜM round'ların konum dizisi.
  suppliedLocation?: string | string[] | null,
): string {
  if (!text) return text;
  const k = mapKey(map);

  // Meşru = (harita biliniyorsa) o haritanın callout'ları + her haritada bulunan
  // evrensel adlar (spawn'lar) + MASAÜSTÜNÜN GÖNDERDİĞİ ÖLÜM YERİ/YERLERİ.
  //
  // 🔴 CANLI REGRESYON (2026-07-24, Fracture): masaüstü ölüm yerini "a main"
  // gönderdi ama tablomda Fracture için "a main" YOKTU (tablo eksikti) → strip
  // onu "yabancı callout" sanıp SİLDİ → "nerede vurulduğunu söylemiyor".
  // İLKE: masaüstünün ölçtüğü konumu backend ASLA silmez. O veri yanlışsa
  // düzeltmek masaüstünün işi; backend'in sessizce silmesi felakettir — çünkü
  // tablom eksik olduğunda "tabloda yok = uydurma" varsayımı ÇÖKER. Yalnız
  // AI'ın SIFIRDAN uydurduğu (masaüstünün göndermediği) callout ayıklanmalı.
  //
  // UNKNOWN HARİTA (2026-07-24, konsey — Omen/Unknown maçı): eskiden burada
  // `if (!k) return text` ile NO-OP'tu → harita okunamayınca AI'ın uydurduğu
  // "A Short/B Main" serbest geçiyordu (canlı bug). Artık Unknown'da da çalışır:
  // haritanın kendi tablosu yok ama meşru = evrensel + gönderilen konum, ve
  // aşağıdaki cross-map kapısı yalnız BAŞKA haritaya AİT KANITLI callout'u siler.
  const legit = new Set<string>(UNIVERSAL_CALLOUTS.map((c) => c.toLowerCase()));
  if (k) for (const c of MAP_CALLOUTS[k]) legit.add(c.toLowerCase());
  const supplied = Array.isArray(suppliedLocation)
    ? suppliedLocation
    : suppliedLocation != null
      ? [suppliedLocation]
      : [];
  for (const loc of supplied) {
    if (typeof loc === "string" && loc.trim()) legit.add(loc.trim().toLowerCase());
  }

  // EN UZUN EŞLEŞME ÖNCE — kritik. İlk uygulamada callout'ları tek tek gezip
  // "haritaya ait değilse sil" dedim ve MEŞRU METNİ BOZDUM: POSITION_NAMES
  // içinde çıplak "mound" var, Lotus listesinde ise "c mound" var; kısa olan
  // önce eşleşince "C Mound'da tek başına kaldın" → "C tek başına kaldın"
  // oldu. Test bunu yakaladı. Çözüm: tüm adları TEK regex'te, uzunluğa göre
  // AZALAN sırada alternatif olarak ver — regex alternasyonu soldan sağa
  // denediği için "c mound" her zaman "mound"dan önce eşleşir. Eşleşen ad
  // haritaya AİTSE olduğu gibi geri yazılır, değilse düşer.
  // ADAY HAVUZU = POSITION_NAMES ∪ TÜM haritaların callout'ları.
  // POSITION_NAMES tek başına YETMİYOR: içinde çıplak "mound" var ama "c mound"
  // YOK. Havuzda uzun ad hiç bulunmayınca uzunluk sıralaması da kurtarmıyordu —
  // "mound" eşleşip Lotus'un meşru "C Mound"unu parçalıyordu (test yakaladı).
  // Tüm harita adlarını havuza katınca "c mound" aday olur, uzunluk sırasıyla
  // "mound"dan ÖNCE eşleşir ve haritaya ait olduğu için korunur.
  // BAŞKA-HARİTAYA-AİT KANITI: yalnız GERÇEK bir Valorant callout'u olan
  // (herhangi bir haritanın tablosunda geçen) adlar silinebilir. POSITION_NAMES'te
  // olup hiçbir harita tablosunda olmayan adlar ile OCR varyantları (aşağıda)
  // bu kümenin DIŞINDA kalır → asla silinmez.
  const knownMapCallouts = new Set<string>();
  for (const list of Object.values(MAP_CALLOUTS)) {
    for (const c of list) knownMapCallouts.add(c.toLowerCase());
  }
  const pool = new Set<string>(POSITION_NAMES.map((p) => p.toLowerCase()));
  for (const c of knownMapCallouts) pool.add(c);
  const ordered = [...pool].sort((a, b) => b.length - a.length);
  const ALT = ordered.map(escapeRe).join("|");
  const keepIfLegit = (whole: string, name: string) => {
    const n = name.trim().toLowerCase();
    if (legit.has(n)) return whole; // bu haritaya ait / evrensel / gönderilen konum
    // YALNIZ ÇOK-KELİMELİ yabancı callout'ları sil (2026-07-24, konsey rank-5).
    // Çıplak tek kelimeler ("tree", "mid", "link", "market", "garden") hem sık
    // gündelik kelime hem birleşik-callout çekirdeği — silmek çok fazla meşru
    // metni kırıyordu ("geniş"→"iş" gibi). AI'ın uydurduğu yanlış-harita
    // callout'u ("A Short", "B Long") zaten ÇOK-KELİMELİ olur; tek-kelimelik
    // yanlış-harita uydurması nadir ve zararı düşük. Occam: az sil, gerçeği koru.
    if (!n.includes(" ")) return whole;
    // CROSS-MAP-KANITI KAPISI (2026-07-24, sağlamlık): yalnız BAŞKA bir haritanın
    // tablosunda KANITLI olarak var olan callout'u sil ("A Short" ∈ Ascent/Haven/
    // Bind → Lotus'ta yabancı → sil). Masaüstünün OCR varyantı ("A Hall"→"a hail")
    // ya da modelin özgün bir ifadesi ("sağ arka açı") hiçbir tabloda YOKTUR →
    // silinmez. Bu, tablo-eksikliği felaketini kökten bitirir: tabloda-yok artık
    // "sil" demek DEĞİL; yalnız "başka-haritada-KANITLI-var" silme gerekçesidir.
    if (!knownMapCallouts.has(n)) return whole;
    return "";
  };

  let result = text;

  // UNICODE KELİME SINIRI — \b KULLANILAMAZ. JS'te \b, \w=[A-Za-z0-9_] ASCII
  // tanımına dayanır; Türkçe ş/ı/ğ/ü/ö/ç harfleri \w DEĞİLDİR. İki ayrı hasar
  // doğuruyordu (ikisi de testte görüldü):
  //   • Kapanış sınırı hiç yokken "gen" (Ascent callout'u) "GENİŞ" kelimesinin
  //     içinden silindi → "solo geniş açı" → "solo iş açı".
  //   • Sadece \b konsaydı "yard" callout'u "YARDIm" içinde eşleşirdi, çünkü
  //     "ı" ASCII \w olmadığı için orada sahte bir sınır var.
  // Çözüm: \p{L}\p{N} temelli, u-bayraklı bakış işaretleri.
  const NB = "(?<![\\p{L}\\p{N}_-])"; // önünde harf/rakam OLMAYACAK
  const NA = "(?![\\p{L}\\p{N}_-])"; // ardında harf/rakam OLMAYACAK

  // 1) EN: edat + yer ("died at A Short", "pushed from Market") — edat da düşer.
  result = result.replace(
    new RegExp(
      `\\s*${NB}(?:at|in|on|near|through|from|toward|towards|into)\\s+(${ALT})${NA}`,
      "giu",
    ),
    keepIfLegit,
  );

  // 2) TR hâl ekleri + çıplak kullanım + "A Short:" başlık biçimi tek geçişte.
  //    Ad haritaya aitse (ekli ya da eksiz) olduğu gibi korunur.
  //    Ek grubu apostrofsuz da çalışır ("Midde") ama ardından yine sınır şart.
  result = result.replace(
    new RegExp(
      `${NB}(${ALT})(?:\\s*['’]\\s*(?:d[ae]n|t[ae]n|d[ae]|t[ae]|y?[ae])|(?:d[ae]n|t[ae]n|d[ae]|t[ae]))?${NA}\\s*:?\\s*`,
      "giu",
    ),
    keepIfLegit,
  );

  // Ayıklamadan artan boşluk/noktalama onarımı (guardUnprovenFacts ile aynı sözleşme).
  // ÖKSÜZ AYIRAÇ (2026-07-24): "A Short — advice" / "A Short: advice" başlığından
  // callout silinince "— advice" / ": advice" kalıyordu. Bir CÜMLE/SATIR BAŞINDA
  // (metin başı, ya da . ! ? \n sonrası) öksüz kalan em-dash/tire/iki-nokta/virgül
  // ayıracını temizle. "B Main — advice" (callout KORUNDU) etkilenmez: oradaki "—"
  // ayıracın önünde "Main" var, cümle başı değil.
  return result
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:]\s*){2,}/g, ", ")
    .replace(/[,;:]\s*([.!?])/g, "$1")
    .replace(/(^|[.!?\n])\s*[—–\-:;,]+\s*/g, "$1 ")
    .replace(/^[\s,;:.—–\-]+/, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n /g, "\n")
    .trim();
}

export function realityCheck(
  outputText: string,
  roundHistory: RoundMemoryEntry[],
  factGround?: FactGround,
  // Cycle 3 (council 2026-06-26): field-type hint. "suggestion" suppresses the
  // neutral death-fallback (returns "" instead so the route keeps the original
  // advice). Omitted ⇒ "death"/"generic" behavior = byte-identical to before;
  // every existing report/insight/feedback caller is unaffected.
  kind?: "death" | "suggestion" | "generic",
  // Denetim 2026-07-19 (F5): İSTEK dili (route reqLang'den). Verilirse guard +
  // rewrite replacement metinleri bu dille yazılır (özel-harfsiz TR cümlenin EN
  // sayılıp "an enemy"/"recently" enjekte edilmesi biter). Verilmezse eski
  // heuristik → mevcut çağıranlar (eval-vision dahil) bayt-aynı.
  lang?: "tr" | "en",
  // Oynanan harita (canlı bug 2026-07-21): verilirse o haritaya AİT OLMAYAN
  // callout'lar metinden ayıklanır (Lotus'ta "A Short" gibi). VERİLMEZSE ya da
  // harita tabloda yoksa hiçbir şey değişmez — tüm mevcut çağıranlar bayt-aynı.
  map?: string,
): { text: string; modified: boolean; rewriteLevel: number } {
  if (!outputText) {
    return { text: outputText, modified: false, rewriteLevel: 1 };
  }

  let text = outputText;
  let rewriteLevel = 1;

  // Yabancı-harita callout ayıklaması — EN BAŞTA çalışır ki sonraki guard'lar
  // zaten temizlenmiş metin üzerinde işlesin (uydurma yer adı hiçbir aşamaya
  // sızmasın). Harita bilinmiyorsa no-op. Masaüstünün gönderdiği ölüm yeri
  // (factGround.deathLocation) HER ZAMAN korunur — tablo eksik olsa bile.
  if (map) {
    const stripped = stripForeignCallouts(text, map, factGround?.deathLocation);
    if (stripped !== text) {
      text = stripped;
      rewriteLevel = Math.max(rewriteLevel, 2);
    }
  }

  // Present-fact guard (route/trade) — runs even with EMPTY round history
  // (round 1) because it validates against the current round's facts, not the
  // match's past memory.
  if (factGround) {
    const guarded = guardUnprovenFacts(text, factGround, lang);
    if (guarded !== text) {
      text = guarded;
      rewriteLevel = Math.max(rewriteLevel, 2);
    }
  }

  // Memory-based claim check (count/window/position/repetition) — logic
  // unchanged; just operates on the (possibly guard-trimmed) text.
  if (roundHistory.length > 0) {
    const claims = extractClaims(text);
    if (claims.claimedCount || claims.claimedPosition || claims.repetitionClaim) {
      const validation = validateClaims(claims, roundHistory);
      text = rewriteUnsafeClaims(text, claims, validation, kind !== "suggestion", lang);
      rewriteLevel = Math.max(rewriteLevel, validation.rewriteLevel);
    }
  }

  return { text, modified: text !== outputText, rewriteLevel };
}
