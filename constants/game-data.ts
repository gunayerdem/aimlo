/* ══════════════════════════════════════════════════════════
   AIMLO — Game Constants (Agents, Maps, Scores)
   ══════════════════════════════════════════════════════════ */
import type { Lang } from "@/types";

// ── Agent Groups ──
export const AGENT_GROUPS: Record<string, string[]> = {
  Controllers: ["Brimstone", "Viper", "Omen", "Astra", "Harbor", "Clove"],
  Duelists: ["Jett", "Raze", "Reyna", "Phoenix", "Yoru", "Neon", "Iso", "Waylay"],
  Initiators: ["Sova", "Breach", "Skye", "KAY/O", "Fade", "Gekko", "Tejo"],
  Sentinels: ["Sage", "Cypher", "Killjoy", "Chamber", "Deadlock", "Vyse"],
};

export const AGENT_GROUP_LABELS: Record<string, Record<Lang, string>> = {
  Controllers: { tr: "Kontrolcüler", en: "Controllers" },
  Duelists: { tr: "Düellistler", en: "Duelists" },
  Initiators: { tr: "Öncüler", en: "Initiators" },
  Sentinels: { tr: "Gözcüler", en: "Sentinels" },
};

export const AGENT_COLORS: Record<string, string> = {
  Controllers: "from-emerald-500/30 to-emerald-900/20",
  Duelists: "from-red-500/30 to-red-900/20",
  Initiators: "from-sky-500/30 to-sky-900/20",
  Sentinels: "from-amber-500/30 to-amber-900/20",
};

export const AGENT_BORDER: Record<string, string> = {
  Controllers: "border-emerald-500/50",
  Duelists: "border-red-500/50",
  Initiators: "border-sky-500/50",
  Sentinels: "border-amber-500/50",
};

export const AGENT_ACCENT: Record<string, string> = {
  Controllers: "text-emerald-400",
  Duelists: "text-red-400",
  Initiators: "text-sky-400",
  Sentinels: "text-amber-400",
};

// ── Agent Helpers ──
export function getAgentRole(agent: string): string {
  for (const [role, agents] of Object.entries(AGENT_GROUPS)) {
    if (agents.includes(agent)) return role;
  }
  return "Controllers";
}

export function getAgentInitials(name: string): string {
  if (name === "KAY/O") return "K/O";
  return name.slice(0, 2).toUpperCase();
}

const AGENT_SLUGS: Record<string, string> = {
  Brimstone: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
  Viper: "707eab51-4836-f488-046a-cda6bf494859",
  Omen: "8e253930-4c05-31dd-1b6c-968525494517",
  Astra: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
  Harbor: "95b78ed7-4637-86d9-7e41-71ba8c293152",
  Clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
  Jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
  Raze: "f94c3b30-42be-e959-889c-5aa313dba261",
  Reyna: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
  Phoenix: "eb93336a-449b-9c1b-0a54-a891f7921d69",
  Yoru: "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
  Neon: "bb2a4828-46eb-8cd1-e765-15848195d751",
  Iso: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
  Waylay: "efba5359-4016-a1e5-7626-b1ae76895940",
  Sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
  Breach: "5f8d3a7f-467b-97f3-062c-13acf203c006",
  Skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
  "KAY/O": "601dbbe7-43ce-be57-2a40-4abd24953621",
  Fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
  Gekko: "e370fa57-4757-3604-3648-499e1f642d3f",
  Tejo: "b444168c-4e35-8076-db47-ef9bf368f384",
  Sage: "569fdd95-4d10-43ab-ca70-79becc718b46",
  Cypher: "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
  Killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
  Chamber: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
  Deadlock: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
  Vyse: "efba5359-4016-a1e5-7626-b1ae76895940",
};

export function agentImgUrl(name: string): string {
  const id = AGENT_SLUGS[name];
  if (!id) return "";
  return `https://media.valorant-api.com/agents/${id}/displayicon.png`;
}

// ── Map Data ──
export const MAP_LOCATIONS: Record<string, string[]> = {
  Ascent: ["A Main", "A Short", "A Site", "A Heaven", "B Main", "B Site", "B Market", "Mid Top", "Mid Bottom", "Mid Cubby", "Tree", "CT Spawn", "Garden"],
  Bind: ["A Short", "A Bath", "A Site", "A Lamps", "A Tower", "B Long", "B Short", "B Site", "B Elbow", "B Garden", "B Hall", "Hookah", "CT Spawn"],
  Haven: ["A Main", "A Short", "A Site", "A Sewer", "B Main", "B Site", "B Back", "C Main", "C Long", "C Site", "C Cubby", "Garage", "Mid Window", "CT Spawn"],
  Split: ["A Main", "A Ramp", "A Rafters", "A Site", "A Heaven", "B Main", "B Heaven", "B Site", "B Back", "Mid Vent", "Mid Mail", "Mid Top", "CT Spawn"],
  Lotus: ["A Main", "A Root", "A Site", "A Rubble", "A Tree", "B Main", "B Upper", "B Site", "B Pillar", "C Main", "C Mound", "C Site", "C Hall", "CT Spawn"],
  Sunset: ["A Main", "A Elbow", "A Site", "A Alley", "B Main", "B Market", "B Site", "B Boba", "Mid Top", "Mid Bottom", "Mid Courtyard", "CT Spawn"],
  Icebox: ["A Main", "A Belt", "A Site", "A Nest", "A Pipes", "B Main", "B Orange", "B Site", "B Green", "B Yellow", "Mid Boiler", "Mid Blue", "CT Spawn"],
  Breeze: ["A Main", "A Hall", "A Site", "A Cave", "A Bridge", "B Main", "B Elbow", "B Site", "B Back", "Mid Pillar", "Mid Nest", "CT Spawn"],
  Fracture: ["A Main", "A Dish", "A Site", "A Drop", "A Rope", "B Main", "B Arcade", "B Site", "B Tree", "B Tower", "Mid Hall", "CT Spawn"],
  Pearl: ["A Main", "A Art", "A Site", "A Dugout", "B Main", "B Long", "B Site", "B Hall", "B Link", "Mid Plaza", "Mid Top", "CT Spawn"],
  Abyss: ["A Main", "A Short", "A Site", "A Ramp", "B Main", "B Site", "B Tower", "B Ramp", "Mid Link", "Mid Bridge", "CT Spawn"],
};

export const MAPS = Object.keys(MAP_LOCATIONS);

export const MAP_IMAGES: Record<string, string> = {
  Ascent: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
  Bind: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
  Haven: "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
  Split: "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
  Lotus: "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
  Sunset: "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
  Icebox: "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
  Breeze: "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
  Fracture: "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
  Pearl: "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
  Abyss: "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
};

// ── Score Options ──
export const SCORE_OPTIONS = [
  "13 - 0", "13 - 1", "13 - 2", "13 - 3", "13 - 4", "13 - 5",
  "13 - 6", "13 - 7", "13 - 8", "13 - 9", "13 - 10", "13 - 11",
  "14 - 12", "13 - 12",
  "12 - 14", "12 - 13",
  "11 - 13", "10 - 13", "9 - 13", "8 - 13", "7 - 13", "6 - 13",
  "5 - 13", "4 - 13", "3 - 13", "2 - 13", "1 - 13", "0 - 13",
];

// ── Icon Constants ──
export const IC = {
  diamond: "\u25C6",
  cross: "\u2715",
  circle: "\u25CE",
  play: "\u25B8",
  bolt: "\u26A1",
  check: "\u2713",
  arrow: "\u2192",
  dot: "\u00B7",
  copy: "\u00A9",
  mid: "\u203A",
};
