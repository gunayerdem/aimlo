/**
 * AIMLO Reality Checker
 * Validates AI output claims against actual round memory.
 * Runs AFTER AI generation, BEFORE response to user.
 * Deterministic — no extra AI calls.
 */

import { extractKillerWeapon } from "@/lib/comp-weapon";

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
  hasWeapon?: boolean;        // killerInfo contains "with <weapon>" (enemy weapon parsed)
  hasDeathLocation?: boolean; // deathLocation OCR present
  hasDeathAngle?: boolean;    // deathAngle OCR present (NO guard — meşru "arkadan geldi")
  hasHeadshot?: boolean;      // headshot===true (desktop never sends → effectively always false)
  hasAliveCount?: boolean;    // alive counts RELIABLE (desktop can't distinguish 0-vs-unread → always false)
  hasSpike?: boolean;         // spike state RELIABLE (only set when true → can't tell false/absent → always false)
  hasTradeData?: boolean;     // tradedByAlly boolean present
  hasRoute?: boolean;         // playerRoute measured
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
): string {
  if (validation.rewriteLevel === 1) {
    return text; // all claims verified
  }

  let result = text;

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
        ? `${validation.actualCount} kez`
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
        result = result.replace(re, "recently");
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
    const isTr = /[şçğıöü]|round'da|maç|tur|round'lar/i.test(result);

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
    // TEK-KAYNAK (güvenlik denetimi L-1, 2026-07-08): eski /\bwith\s+\S/ kalıbı,
    // OCR'ın "with"i düşürdüğü "by reyna sheriff" formunu KAÇIRIYORDU → [SİLAH+KOMP
    // İPUCU] "silah: sheriff" derken factSheet "silah BİLİNMEYEN" diyor, guard
    // gerçek silahı strip'liyordu (çelişkili sinyal). extractKillerWeapon sözlük-
    // bağlı (yalnız gerçek silah adları eşleşir, serbest metin asla) → çıplak
    // token da GÖZLENMİŞ silahtır. İşaretçi + factSheet + guard artık aynı gerçeği
    // paylaşır; silah token'ı hiç yoksa guard eskisi gibi strip'ler.
    hasWeapon: killerInfo.length > 0 && extractKillerWeapon(killerInfo) !== null,
    hasDeathLocation: typeof ctx.deathLocation === "string" && (ctx.deathLocation as string).length > 0,
    hasDeathAngle: typeof ctx.deathAngle === "string" && (ctx.deathAngle as string).length > 0,
    hasHeadshot: reqBody.headshot === true,
    hasAliveCount: false,
    hasSpike: false,
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
): string {
  let result = text;

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
    const NAME_ALT = AGENT_NAMES.map(escapeRe).sort((a, b) => b.length - a.length).join("|");
    const KILLER_TOKEN = `(?:${NAME_ALT}|unknown|bilinmeyen)`;
    const KV2 = "(?:vurup öldürdü|öldürdü|öldürdün|öldürüldün|kestiler|kesti|vuruldun|vurdun|vurdu|düşürdü|indirdi|biçti|aldılar|aldı|avladı|devirdi|götürdü|temizledi)";
    const NLB = "(?<![a-zçğıöşüâîû])", NL = "(?![a-zçğıöşüâîû])";
    // STEP1: ≥2 üyeli katil-disjunction ("X ya da Y ya da Z") → tek "bir düşman"
    result = result.replace(new RegExp(`${NLB}${KILLER_TOKEN}(?:\\s*(?:ya da|veya|/|,)\\s*${KILLER_TOKEN})+`, "gi"), "bir düşman");
    // STEP2: tek isimli katil + aynı clause'da kill-verb → "bir düşman" (char-cap YOK)
    const SINGLE = new RegExp(`${NLB}${KILLER_TOKEN}\\b([^.!?;:—\\n]*?\\s)${KV2}${NL}`, "gi");
    result = result.replace(SINGLE, (m: string, mid: string) => "bir düşman" + m.slice(m.indexOf(mid)));
    // STEP3: kalan stray "unknown"/"bilinmeyen" → "bir düşman"
    result = result.replace(new RegExp(`${NLB}(?:unknown|bilinmeyen)${NL}`, "gi"), "bir düşman");
    // STEP4: "bir düşman ya da bir düşman" run'larını tek'e çökert
    result = result.replace(/bir düşman(?:\s*(?:ya da|veya|\/|,)\s*bir düşman)+/gi, "bir düşman");
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
    }
    for (const re of ROUTE_GENERIC_PATTERNS) result = result.replace(re, "");
  }

  if (factGround.hasTradeData !== true) {
    for (const re of TRADE_CLAIM_PATTERNS) result = result.replace(re, "");
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
export function realityCheck(
  outputText: string,
  roundHistory: RoundMemoryEntry[],
  factGround?: FactGround,
  // Cycle 3 (council 2026-06-26): field-type hint. "suggestion" suppresses the
  // neutral death-fallback (returns "" instead so the route keeps the original
  // advice). Omitted ⇒ "death"/"generic" behavior = byte-identical to before;
  // every existing report/insight/feedback caller is unaffected.
  kind?: "death" | "suggestion" | "generic",
): { text: string; modified: boolean; rewriteLevel: number } {
  if (!outputText) {
    return { text: outputText, modified: false, rewriteLevel: 1 };
  }

  let text = outputText;
  let rewriteLevel = 1;

  // Present-fact guard (route/trade) — runs even with EMPTY round history
  // (round 1) because it validates against the current round's facts, not the
  // match's past memory.
  if (factGround) {
    const guarded = guardUnprovenFacts(text, factGround);
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
      text = rewriteUnsafeClaims(text, claims, validation, kind !== "suggestion");
      rewriteLevel = Math.max(rewriteLevel, validation.rewriteLevel);
    }
  }

  return { text, modified: text !== outputText, rewriteLevel };
}
