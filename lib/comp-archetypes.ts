// KOMP ARKETİPİ ADLARI — TEK KAYNAK (W2 followup #70 / W2 inceleme B06-F6, 2026-09-24)
// ─────────────────────────────────────────────────────────────────────────────
// Slug'lar knowledge/general/weapon-comp-compact.md "## Komp Okuma" H3 başlıklarıyla
// BİREBİR aynı (lib/comp-weapon.ts classifyCompArchetype bunları üretir, user-message
// [SİLAH+KOMP İPUCU] işaretçisi modele bölüm adı olarak verir).
//
// KANIT (kod-ad sızıntısı): model slug'ı kullanıcı metnine kopyalıyor — canlıda
// aimlo-runtimeKAAN.txt 18 satır ("Rakip kadrosunda double-duelist-dive var; …",
// "Rakip kadro'ı double-duelist-dive: …"), eval korpusunda 13 tekil ham alan
// (cycleb06-parity-syn: double-duelist-dive ×4, op-comp ×6, double-controller ×3).
// Kod-ad yasağı (lib/ai-policy.ts) ihlali; son-işlem süzgeci lib/coach-text.ts
// stripCompArchetypeTokens bu tablodan sade ad basar, eval-score aynı listeyle sayar.
//
// YAPRAK MODÜL: hiçbir şey import etmez — coach-text (client bundle'a da giren)
// güvenle import edebilsin (comp-weapon knowledge-loader → fs çektiği için olmaz).

export const COMP_ARCHETYPES = [
  "double-duelist-dive",
  "double-initiator-util",
  "double-sentinel-kale",
  "double-controller",
  "op-comp",
  "no-controller-rush",
  "standart",
] as const;

export type CompArchetype = (typeof COMP_ARCHETYPES)[number];

/** Kullanıcı metnine SIZAN slug → sade ad. "standart" YOK: sıradan Türkçe sözcük
 *  (directive onu zaten modele vermiyor — buildWeaponCompDirective "standart"ı atlar).
 *  TR adlar gözlenen bağlamlarda doğal okunur: "Rakip kadrosunda çift duelist var",
 *  "Rakibin çift duelist kompozisyonu", "Op'lu komp var", "Rakip çift controller
 *  olduğu için". EN adlar sıfat olarak: "a two-duelist comp", "an Op comp". */
export const COMP_ARCHETYPE_PLAIN: Readonly<Record<Exclude<CompArchetype, "standart">, { tr: string; en: string }>> = {
  "double-duelist-dive": { tr: "çift duelist", en: "two-duelist" },
  "double-initiator-util": { tr: "çift initiator", en: "two-initiator" },
  "double-sentinel-kale": { tr: "çift sentinel", en: "two-sentinel" },
  "double-controller": { tr: "çift controller", en: "two-controller" },
  "op-comp": { tr: "Op'lu komp", en: "Op comp" },
  "no-controller-rush": { tr: "smoke'suz komp", en: "no-smoke comp" },
};
