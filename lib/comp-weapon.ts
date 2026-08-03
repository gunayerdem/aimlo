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

/**
 * loadout metninden oyuncunun KENDİ silah sınıfını çıkar (2026-07-19).
 * Aynı sözlük-BAĞLI kural: serbest metin asla silah sayılmaz → anti-uydurma.
 * Sinyal: loadout (OCR, zaten buildWeaponCompDirective'e geliyor).
 */
export function extractLoadoutWeapon(loadout?: string): { name: string; cls: WeaponClass } | null {
  if (!loadout) return null;
  const m = loadout.toLowerCase().match(ANY_RE);
  return m ? { name: m[1].toLowerCase(), cls: WEAPON_CLASS[m[1].toLowerCase()] } : null;
}

// ── killerInfo prompt-normalizasyonu (canlı-test #8, 2026-08-03) ──────────────
//
// KUSUR: koç metni "Chamber seni blade ile öldürdü" dedi; silah aslında JUDGE'dı.
// KÖK NEDEN (b): killerInfo prompt'a HAM giriyordu. Masaüstü OCR'ının WEAPONS
// listesi "melee/knife/blade" token'larını da içeriyor (aimlo-desktop
// src-tauri/src/ocr.rs, `const WEAPONS`) ve bunlar combat-report GÖVDESİNDEN
// değil, güvenilmez "Region 3" merkez bandından okunabiliyor (aynı dosya,
// read_killer_info). Yani "with blade" GÖZLENMİŞ bir silah değil, gürültü.
// Backend'de bu token için ÇALIŞAN hiçbir çıkış kapısı kalmamıştı:
//   • extractKillerWeapon sözlük-bağlı → "blade" görünce null döner ama ham
//     string prompt'a yine de giriyordu (model onu kopyaladı),
//   • reality-checker WEAPON_NAMES listesinde "blade" yok → guard strip'lemedi,
//   • ai-policy BANNED_PHRASES runtime kapısı DEĞİL (yalnız eval/validator),
//   • plainifyAbilities yalnız resmi ad "Blade Storm"a bakar, çıplak "blade"e değil.
//
// FIX: prompt'a giden metinde silah yuvası ALLOW-LIST'e tabi. Sözlükte gerçek bir
// silah varsa string'e DOKUNULMAZ (mevcut davranış birebir korunur: "with vandal
// (full-buy silah)" aynen geçer). Sözlük-dışı bir token varsa silah İDDİASI
// TAMAMEN düşürülür — uydurmaktansa susmak. Katil AJANI korunur (asıl koçluk
// gerçeği o).
//
// BİLEREK YAPILMAYAN (naif tuzak): "blade" → "bıçak" gibi bir ÇEVİRİ satırı
// eklemiyoruz. (a) route'taki TR_JARGON yalnız lang==="tr" dalında çalışır, EN
// çıktı açıkta kalırdı (B84 sınıfı hata); (b) daha kötüsü, doğrulanmamış bir OCR
// token'ını KENDİNDEN EMİN bir Türkçe silah adına çevirmek uydurmayı düzeltmek
// yerine cilalar. Doğru davranış: sus.

/** Prompt'a asla girmemesi gereken, gözlem değeri olmayan silah token'ları.
 *  Kaynak: masaüstü WEAPONS listesindeki sözlük-dışı üçlü. killerInfo İngilizce
 *  üretilir (OCR "killed by" çapasıyla İngilizce istemciden okur), bu yüzden
 *  Türkçe karşılık gerekmiyor → ASCII \b güvenli (Türkçe-\b tuzağı yok). */
const UNTRUSTED_WEAPON_TOKEN_RE = /\b(?:blades?|kni(?:fe|ves)|melee)\b/gi;

/**
 * killerInfo'yu PROMPT'a girmeden önce normalize et. Deterministik silah/ölüm
 * sınıflandırıcıları (classifyDeath, extractKillerWeapon) ham gövdeyi okumaya
 * devam eder — zaten sözlük-bağlı oldukları için "blade" onlarda hiçbir sinyal
 * üretmez, davranışları değişmez. buildFactGround ise BİLEREK bu normalize
 * değerle beslenir (bkz. vision/route.ts): fact-sheet `katil=${ctx.killerInfo}`
 * yazdığı için ikisi ayrışırsa prompt'a "katil=undefined" düşerdi.
 *
 * Biçim sözleşmesi (masaüstü ocr.rs): "killed by <ajan> with <silah>",
 * "killed by <ajan>", "killed with <silah>" (+ opsiyonel " (<eko-tier>)";
 * masaüstü melee/knife/blade için tier ÜRETMEZ → o dalda kaybedilen bilgi yok).
 *
 * @returns normalize metin, ya da geriye anlamlı hiçbir gerçek kalmadıysa undefined.
 */
export function normalizeKillerInfoForPrompt(killerInfo?: string): string | undefined {
  const s = (killerInfo ?? "").trim();
  if (!s) return undefined;
  // Sözlükte GERÇEK silah varsa dokunma — regresyon riski sıfır.
  if (extractKillerWeapon(s)) return s;
  // Sözlük-dışı: "with ..." kuyruğu (silah yuvası + ona bağlı parantezli tier)
  // komple düşer. "with" bu biçimde HER ZAMAN silah sınırıdır.
  let out = s.replace(/\bwith\b[\s\S]*$/i, " ");
  // Savunma-derinliği: "with" düşmüş OCR biçimi ("by reyna blade") için güvenilmez
  // token'ları nerede geçerse geçsin temizle.
  out = out.replace(UNTRUSTED_WEAPON_TOKEN_RE, " ");
  // Artık bağlaç/noktalama artıklarını topla.
  out = out.replace(/\(\s*\)/g, " ").replace(/\s{2,}/g, " ").trim();
  out = out.replace(/[\s,;:\-(]+$/g, "").trim();
  out = out.replace(/\s+(?:by|with)$/i, "").trim();
  // Geriye yalnız "killed"/"killed by" gibi içi boş bir kabuk kaldıysa alan hiç
  // yazılmasın — boş iddia, model için gürültüdür.
  if (!out || /^killed(?:\s+by)?$/i.test(out)) return undefined;
  return out;
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
  // Dil (2026-07-18): EN istekte İngilizce sarmalayıcı — rehber bölüm başlığı
  // Türkçe kalır (KB Türkçe), talimat dersi İngilizce yeniden ifade ettirir.
  lang: "tr" | "en" = "tr",
): string {
  if (!weapon && (!archetype || archetype === "standart")) return "";
  // İKİNCİ işaretçi (2026-07-19): rehberin her silah-sınıfı bölümündeki "Bunu
  // taşıyorsan" dersi (oyuncunun KENDİ silahı) yazılıydı ama hiçbir işaretçi onu
  // seçmiyordu. Sinyal: loadout. Katil-silahı işaretçisi BİRİNCİL kalır; kendi-silah
  // satırı yalnız sınıf katilinkinden FARKLIYSA eklenir (aynı bölümü iki kez
  // işaret etmemek + direktifi kısa tutmak için).
  const own = extractLoadoutWeapon(loadout);
  const ownDiffers = own !== null && own.cls !== weapon?.cls;
  if (lang === "en") {
    const L: string[] = ["\n[WEAPON+COMP HINT — from the WEAPON + COMP GUIDE in the system prompt (guide is in Turkish)]"];
    if (weapon) {
      L.push(
        `The weapon that killed you: ${weapon.name} → the guide section titled "${WEAPON_CLASS_LABEL[weapon.cls]}". ` +
        `Tie that section's lesson to THIS round's callout and enemy agent, restated in ENGLISH — do not copy its sentence` +
        (loadout ? `; the player's own weapon is ${loadout}, compare range/duel odds against it.` : "."),
      );
    }
    if (ownDiffers) {
      L.push(
        `The player's OWN weapon: ${own.name} → the "Bunu taşıyorsan" line under the guide section titled ` +
        `"${WEAPON_CLASS_LABEL[own.cls]}" — fit the position/range advice to that weapon, restated in ENGLISH.`,
      );
    }
    if (archetype && archetype !== "standart") {
      L.push(
        `Enemy comp archetype: ${archetype} (from roster OCR). Fold that section's read into one of the ` +
        `enemyAnalysis items or into nextRoundSuggestion — do not open a separate field.`,
      );
    }
    return L.join("\n");
  }
  const L: string[] = ["\n[SİLAH+KOMP İPUCU — sistem prompt'undaki SİLAH + KOMP REHBERİ'nden]"];
  if (weapon) {
    L.push(
      `Seni öldüren silah: ${weapon.name} → rehberin "${WEAPON_CLASS_LABEL[weapon.cls]}" bölümü. ` +
      `O bölümün dersini BU round'un callout'una ve düşman ajanına bağla — cümlesini KOPYALAMA` +
      (loadout ? `; oyuncunun elindeki silah ${loadout}, mesafe/düello kıyasını buna göre yap.` : "."),
    );
  }
  if (ownDiffers) {
    L.push(
      `Oyuncunun KENDİ silahı: ${own.name} → rehberin "${WEAPON_CLASS_LABEL[own.cls]}" bölümündeki ` +
      `"Bunu taşıyorsan" dersi — pozisyon/menzil önerini o silaha göre ver.`,
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
