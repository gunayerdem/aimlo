/* ══════════════════════════════════════════════════════════
   AIMLO — Rank-Aware Knowledge Loader
   Conditionally loads knowledge files based on task type,
   player rank, agent, and map context.
   ══════════════════════════════════════════════════════════ */

import fs from "fs";
import path from "path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");

// ── Agent-to-role mapping ──────────────────────────────────

export const AGENT_ROLE_MAP: Record<string, string> = {
  // Duelists
  Jett: "duelists",
  Raze: "duelists",
  Phoenix: "duelists",
  Reyna: "duelists",
  Yoru: "duelists",
  Neon: "duelists",
  Iso: "duelists",
  // Controllers
  Brimstone: "controllers",
  Omen: "controllers",
  Astra: "controllers",
  Viper: "controllers",
  Harbor: "controllers",
  Clove: "controllers",
  // Initiators
  Sova: "initiators",
  Breach: "initiators",
  Skye: "initiators",
  Fade: "initiators",
  "KAY/O": "initiators",
  Gekko: "initiators",
  // Sentinels
  Sage: "sentinels",
  Cypher: "sentinels",
  Killjoy: "sentinels",
  Chamber: "sentinels",
  Deadlock: "sentinels",
  Vyse: "sentinels",
};

// ── Rank-to-file mapping ──────────────────────────────────

const RANK_FILE_MAP: Record<string, string> = {
  iron: "low-elo.md",
  bronze: "low-elo.md",
  silver: "low-elo.md",
  gold: "mid-elo.md",
  platinum: "mid-elo.md",
  diamond: "mid-elo.md",
  ascendant: "high-elo.md",
  immortal: "high-elo.md",
  radiant: "elite.md",
};

const DEFAULT_RANK_FILE = "mid-elo.md";

// ── Task types and their knowledge requirements ───────────

type TaskType = "insight" | "feedback" | "report" | "critical-mistake" | "growth-plan";

interface LoadOptions {
  map?: string;
  agent?: string;
  rank?: string;
  enemyAgents?: string[];
}

// ── File loading helpers ──────────────────────────────────

function loadFile(relativePath: string): string {
  try {
    const fullPath = path.join(KNOWLEDGE_DIR, relativePath);
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return "";
  }
}

function getRankFile(rank: string | undefined | null): string {
  if (!rank) return DEFAULT_RANK_FILE;
  const normalized = rank.toLowerCase().trim();
  return RANK_FILE_MAP[normalized] ?? DEFAULT_RANK_FILE;
}

function getAgentRoleFile(agent: string): string | null {
  // Try exact match first
  if (AGENT_ROLE_MAP[agent]) {
    return `agents/${AGENT_ROLE_MAP[agent]}.md`;
  }
  // Try case-insensitive match
  const match = Object.entries(AGENT_ROLE_MAP).find(
    ([key]) => key.toLowerCase() === agent.toLowerCase()
  );
  return match ? `agents/${match[1]}.md` : null;
}

// ── Main loader function ──────────────────────────────────

/**
 * Load concatenated knowledge based on task type and context.
 *
 * Task loading rules:
 *   insight          → core coaching + rank
 *   feedback         → core coaching + map + agent + rank
 *   report           → core coaching + map + agent + rank + pro-analysis + radiant-tips
 *   critical-mistake → core coaching + map + rank
 *   growth-plan      → core coaching + rank + agent
 */
export function loadKnowledge(task: TaskType, options: LoadOptions = {}): string {
  const { map, agent, rank, enemyAgents } = options;

  const sections: string[] = [];

  // Core coaching is always included
  const core = loadFile("general/coaching-core.md");
  if (core) sections.push(core);

  // Rank knowledge is always included
  const rankContent = loadFile(`ranks/${getRankFile(rank)}`);
  if (rankContent) sections.push(rankContent);

  // Map knowledge — included for feedback, report, critical-mistake
  if (map && (task === "feedback" || task === "report" || task === "critical-mistake")) {
    const mapSlug = map.toLowerCase().replace(/[^a-z]/g, "");
    const mapContent = loadFile(`maps/${mapSlug}.md`);
    if (mapContent) sections.push(mapContent);
  }

  // Agent knowledge — included for feedback, report, growth-plan
  if (agent && (task === "feedback" || task === "report" || task === "growth-plan")) {
    const agentFile = getAgentRoleFile(agent);
    if (agentFile) {
      const agentContent = loadFile(agentFile);
      if (agentContent) sections.push(agentContent);
    }
  }

  // Enemy agent knowledge — included for feedback and report when provided
  if (enemyAgents?.length && (task === "feedback" || task === "report")) {
    const loadedRoles = new Set<string>();
    for (const enemyAgent of enemyAgents) {
      const roleFile = getAgentRoleFile(enemyAgent);
      if (roleFile && !loadedRoles.has(roleFile)) {
        loadedRoles.add(roleFile);
        const content = loadFile(roleFile);
        if (content) sections.push(content);
      }
    }
  }

  // Advanced knowledge — report only
  if (task === "report") {
    const proAnalysis = loadFile("general/pro-analysis.md");
    if (proAnalysis) sections.push(proAnalysis);

    const radiantTips = loadFile("general/radiant-tips.md");
    if (radiantTips) sections.push(radiantTips);
  }

  return sections.join("\n\n---\n\n");
}
