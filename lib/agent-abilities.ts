// ── AGENT → düz-terim yetenek haritası (web-doğrulandı 2026-06-26) ──
// Amaç: koç AI'ın bir ajana OLMAYAN yeteneği önermesini ENGELLEMEK. Canlı bug:
// Killjoy'a "tel" (Cypher'ın Trapwire'ı) öneriliyordu. Çözüm: oyuncunun TAM kitini
// vision prompt'una enjekte et → model yalnız gerçek yetenekleri kullandırır.
// Düz-terim vokabüleri (ability-plain-map ile uyumlu): smoke/flash/molly/heal/recon/
// bot/tel/kamera/duvar/dash/stun/ult/slow/teleport/satchel/drone/turret/tuzak/kalkan/
// diriliş. Kaynak: playvalorant.com / wiki.playvalorant.com / fandom (her ajan teyit).
export const AGENT_ABILITIES: Record<string, string[]> = {
  // — Sentinels —
  Killjoy: ["bot", "molly", "turret", "ult"],          // tel/duvar/smoke YOK
  Cypher: ["tel", "smoke", "kamera", "recon"],         // Cyber Cage=smoke; molly YOK
  Sage: ["duvar", "slow", "heal", "diriliş"],
  Chamber: ["tuzak", "teleport", "ult"],               // Trademark(slow-tuzak)/Rendezvous/Tour de Force
  Deadlock: ["stun", "duvar", "tuzak", "ult"],
  Vyse: ["duvar", "flash", "slow", "ult"],
  Veto: ["tuzak", "teleport", "önleyici", "ult"],      // web-doğrulandı 2026-07-08: Chokehold=tuzak (bağlar+sağırlaştırır, molotof DEĞİL), Crosscut=teleport, Interceptor=önleyici (utility yok-edici), Evolution=ult; molly YOK
  // — Controllers —
  Brimstone: ["molly", "smoke", "ult"],                // Stim=buff (düz-terim yok); stun YOK
  Viper: ["molly", "smoke", "duvar", "ult"],
  Omen: ["smoke", "flash", "teleport", "ult"],
  Astra: ["smoke", "stun", "duvar", "ult"],
  Harbor: ["smoke", "duvar", "kalkan", "ult"],         // flash YOK
  Clove: ["smoke", "heal", "diriliş", "ult"],          // tel/duvar YOK; Pick-Me-Up self-overheal
  Miks: ["heal", "smoke", "stun", "ult"],              // gerçek ajan, CONTROLLER (sentinel değil)
  // — Duelists —
  Jett: ["smoke", "dash", "ult"],
  Raze: ["bot", "molly", "satchel", "ult"],
  Phoenix: ["flash", "molly", "duvar", "ult"],         // Blaze=ateş-duvarı
  Reyna: ["flash", "heal", "dash", "ult"],
  Yoru: ["flash", "teleport", "ult"],
  Neon: ["duvar", "stun", "dash", "ult"],
  Iso: ["duvar", "kalkan", "ult"],                     // Undercut=vuln/suppress (slow DEĞİL); heal YOK
  Waylay: ["slow", "dash", "teleport", "ult"],
  // — Initiators —
  Sova: ["recon", "drone", "ult"],                     // Shock Bolt=hasar oku; molly DEĞİL
  Breach: ["flash", "stun", "molly", "ult"],
  Skye: ["flash", "recon", "heal", "ult"],
  Fade: ["recon", "bot", "ult"],
  Gekko: ["bot", "flash", "molly", "ult"],
  "KAY/O": ["flash", "molly", "ult"],
  Tejo: ["drone", "stun", "molly", "ult"],
};

// Tüm düz-terim yetenek vokabüleri (kit'te OLMAYANI hesaplamak için master küme).
// ult/diriliş/kalkan herkeste ima edilebilir, negatif listeden çıkar (false-positive önle).
const ALL_ABILITY_TERMS = [
  "smoke", "flash", "molly", "heal", "recon", "bot", "tel", "kamera", "duvar",
  "dash", "stun", "slow", "teleport", "satchel", "drone", "turret", "tuzak",
] as const;

/** Slug-tolerant lookup (OCR "Killjoy"/"KAY/O"/"kayo" hepsi çözülür). */
function abilitiesFor(agent: string | undefined | null): string[] | null {
  if (!agent) return null;
  if (AGENT_ABILITIES[agent]) return AGENT_ABILITIES[agent];
  const slug = agent.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hit = Object.entries(AGENT_ABILITIES).find(
    ([k]) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === slug,
  );
  return hit ? hit[1] : null;
}

/** Bu ajanda OLMAYAN düz-terim yetenekler (negatif hint + boundary guard için). */
export function forbiddenAbilitiesFor(agent: string | undefined | null): string[] {
  const kit = abilitiesFor(agent);
  if (!kit) return [];
  const kitSet = new Set(kit);
  return ALL_ABILITY_TERMS.filter((a) => !kitSet.has(a));
}

/**
 * Vision system-prompt'una enjekte edilecek kit-grounding satırı. Oyuncunun
 * agent'i bilinmiyorsa "" döner (no-op). Bu, modelin ajana OLMAYAN yeteneği
 * önermesini KAYNAKTA engeller (örn. Killjoy'a "tel").
 */
export function buildAgentAbilityHint(agent: string | undefined | null, lang: "tr" | "en" = "tr"): string {
  const abilities = abilitiesFor(agent);
  if (!abilities || !abilities.length) return "";
  const list = abilities.join(", ");
  const forbidden = forbiddenAbilitiesFor(agent);
  const noList = forbidden.join(", ");
  if (lang === "en") {
    return `\nYOUR KIT (${agent}): ${list}. ${agent} does NOT have: ${noList} — NEVER tell the player to throw/use any of these as their OWN action; recommend ONLY kit-list abilities for the player. If a missing ability matters tactically, frame it strictly as TEAM utility ("wait for a teammate's flash/smoke"), never "you flash/smoke". Enemy abilities may still be named factually.`;
  }
  return `\nSENİN KİTİN (${agent}): ${list}. ${agent}'te ŞU YETENEKLER YOK: ${noList} — bunları oyuncuya KENDİ aksiyonu olarak ("sen smoke at", "flash'la aç", "duvar kur") ASLA önerme; oyuncuya SADECE kit listesindeki yetenekleri öner. Olmayan bir yetenek taktiksel olarak gerekiyorsa SADECE TAKIM utility'si olarak çerçevele ("takım smoke'u bekle", "arkadaşının flash'ıyla gir") — asla "sen" diye. (Düşmanın yeteneğini olgu olarak adlandırmak serbest.)`;
}

/**
 * DETERMİNİSTİK BOUNDARY GUARD (defense-in-depth, 2026-06-26).
 * prompt-hint LLM'i tam bağlamadığı için (empirik: Killjoy'a hâlâ "tel"/"duvar"
 * öneriliyor) son savunma. Forbidden bir yetenek SADECE geçerli bir kit-yeteneğine
 * BAĞLAÇLA bitişikse ("bot/duvar", "bot veya tel") silinir → kit-ability korunur.
 * Kit-ability bitişikliği şart olduğu için harita-duvarı / düşman-olgusu gibi
 * meşru kullanımlar TETİKLENMEZ (false-positive güvenliği).
 */
export function enforceAgentKit(text: string, agent: string | undefined | null): string {
  if (!text) return text;
  const kit = abilitiesFor(agent);
  if (!kit || !kit.length) return text;
  const forbidden = forbiddenAbilitiesFor(agent);
  if (!forbidden.length) return text;
  const conn = "(?:\\s*/\\s*|\\s+veya\\s+|\\s+ya\\s+da\\s+|\\s+ve\\s+|\\s*,\\s*)";
  const sfx = "(?:['’]?[a-zçğıöşü]{0,4})";        // -ı/-i/-u/-la/-yle vb. ekler
  const before = "(?<![a-zçğıöşü])";
  const after = "(?![a-zçğıöşü])";
  let t = text;
  for (const f of forbidden) {
    for (const v of kit) {
      if (v === "ult") continue;                 // çok genel; bağlaç kurma
      // "[kit] BAĞLAÇ [forbidden]" → "[kit]"
      t = t.replace(new RegExp(`(${before}${v}${sfx})${conn}${f}${sfx}${after}`, "giu"), "$1");
      // "[forbidden] BAĞLAÇ [kit]" → "[kit]"
      t = t.replace(new RegExp(`${before}${f}${sfx}${conn}(${v}${sfx}${after})`, "giu"), "$1");
    }
  }
  // 2. KATMAN — self-action reframe: forbidden yetenek imperatif KULLANIM-fiiliyle
  // ("flash ile zorla", "smoke'la aç") → başına "takım " ekle → meşru takım-utility
  // çerçevesine çevir. Imperatif fiil listesi geçmiş-zamandan (attı/açtı/kurdu)
  // ayrık olduğu için düşman-olgusu ("Jett flash attı") TETİKLENMEZ. "takım/
  // arkadaş" zaten varsa veya kit-yeteneğiyse dokunmaz.
  const useVerb = "(?:at|atıp|atarak|aç|açıp|açarak|kur|kurup|kurarak|kullan|kullanıp|patlat|patlatıp|zorla|zorlayıp)";
  const teamGuard = "(?<!takım )(?<!takımın )(?<!arkadaşın )(?<!arkadaşının )(?<!düşman )(?<!rakip )";
  const gap = "(?:\\s+(?:ile|yle))?(?:\\s+[a-zçğıöşüA-ZÇĞİÖŞÜ'’/]+){0,3}\\s+";
  for (const f of forbidden) {
    const re = new RegExp(`${teamGuard}${before}${f}(['’]?[a-zçğıöşü]{0,4})(${gap}${useVerb})${after}`, "giu");
    t = t.replace(re, (_m, sfxCap: string, tail: string) => `takım ${f}${sfxCap}${tail}`);
  }
  return t;
}
