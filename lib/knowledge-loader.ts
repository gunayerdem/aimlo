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
  Waylay: "duelists",
  // Controllers
  Brimstone: "controllers",
  Omen: "controllers",
  Astra: "controllers",
  Viper: "controllers",
  Harbor: "controllers",
  Clove: "controllers",
  Miks: "controllers",
  // Initiators
  Sova: "initiators",
  Breach: "initiators",
  Skye: "initiators",
  Fade: "initiators",
  "KAY/O": "initiators",
  Gekko: "initiators",
  Tejo: "initiators",
  // Sentinels
  Sage: "sentinels",
  Cypher: "sentinels",
  Killjoy: "sentinels",
  Chamber: "sentinels",
  Deadlock: "sentinels",
  Vyse: "sentinels",
  Veto: "sentinels",
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

/**
 * Resolve the knowledge file for a specific agent.
 * Returns the per-agent file path if it exists.
 *   e.g. Jett → agents/duelists/jett.md
 * Returns null if no role mapping or no per-agent file is found.
 */
export function getAgentFile(agentName: string): string | null {
  // Resolve role via case-insensitive lookup
  const role = resolveAgentRole(agentName);
  if (!role) return null;

  const agentSlug = agentName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const perAgentPath = `agents/${role}/${agentSlug}.md`;
  const perAgentFull = path.join(KNOWLEDGE_DIR, perAgentPath);

  if (fs.existsSync(perAgentFull)) {
    return perAgentPath;
  }
  return null;
}

/** Resolve an agent name to its role string (case-insensitive). */
function resolveAgentRole(agentName: string): string | null {
  if (AGENT_ROLE_MAP[agentName]) return AGENT_ROLE_MAP[agentName];
  const match = Object.entries(AGENT_ROLE_MAP).find(
    ([key]) => key.toLowerCase() === agentName.toLowerCase()
  );
  return match ? match[1] : null;
}

/**
 * Load up to `limit` matchup files relevant to the player agent vs enemy agents.
 * Tries specific agent matchups first, then falls back to role-vs-role.
 */
function loadMatchupFiles(
  playerAgent: string,
  enemyAgents: string[],
  limit: number = 2
): string[] {
  const results: string[] = [];
  const playerRole = resolveAgentRole(playerAgent);
  const playerSlug = playerAgent.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const enemy of enemyAgents) {
    if (results.length >= limit) break;

    const enemySlug = enemy.toLowerCase().replace(/[^a-z0-9]/g, "");
    const enemyRole = resolveAgentRole(enemy);

    // Try specific agent vs agent matchup
    const specificPath = `matchups/${playerSlug}_vs_${enemySlug}.md`;
    const specificContent = loadFile(specificPath);
    if (specificContent) {
      results.push(specificContent);
      continue;
    }

    // Try role vs role matchup
    if (playerRole && enemyRole) {
      const rolePath = `matchups/${playerRole}_vs_${enemyRole}.md`;
      const roleContent = loadFile(rolePath);
      if (roleContent) {
        results.push(roleContent);
      }
    }
  }

  return results;
}

// ── Main loader function ──────────────────────────────────

/**
 * Load concatenated knowledge based on task type and context.
 *
 * Task loading rules:
 *   insight          → core + rank + per-agent file
 *   feedback         → core + rank + map + per-agent + enemy agents + up to 2 matchups
 *   report           → core + rank + map + per-agent + enemy agents + up to 2 matchups + pro-analysis + radiant-tips
 *   critical-mistake → core + rank + map + per-agent
 *   growth-plan      → core + rank + per-agent
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

  // Agent knowledge — included for insight, feedback, report, critical-mistake, growth-plan
  if (agent) {
    const agentFile = getAgentFile(agent);
    if (agentFile) {
      const agentContent = loadFile(agentFile);
      if (agentContent) sections.push(agentContent);
    }
  }

  // Enemy agent knowledge — included for feedback and report (per-agent files)
  if (enemyAgents?.length && (task === "feedback" || task === "report")) {
    const loadedFiles = new Set<string>();
    for (const enemyAgent of enemyAgents) {
      const enemyFile = getAgentFile(enemyAgent);
      if (enemyFile && !loadedFiles.has(enemyFile)) {
        loadedFiles.add(enemyFile);
        const content = loadFile(enemyFile);
        if (content) sections.push(content);
      }
    }
  }

  // Matchup knowledge — included for feedback and report
  if (agent && enemyAgents?.length && (task === "feedback" || task === "report")) {
    const matchupContents = loadMatchupFiles(agent, enemyAgents, 2);
    for (const mc of matchupContents) {
      sections.push(mc);
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

/* ══════════════════════════════════════════════════════════
   Vision-specific loader — max 4 files, returns file list
   Priority: map > agent > rank > matchup (1)
   ══════════════════════════════════════════════════════════ */

interface VisionKnowledgeResult {
  content: string;
  files: string[];
}

export function loadVisionKnowledge(options: LoadOptions = {}): VisionKnowledgeResult {
  const { map, agent, rank, enemyAgents } = options;
  const sections: string[] = [];
  const files: string[] = [];
  const MAX_FILES = 4;

  // 1. Map knowledge (highest priority for vision — positional coaching)
  if (map && files.length < MAX_FILES) {
    const mapSlug = map.toLowerCase().replace(/[^a-z]/g, "");
    const mapPath = `maps/${mapSlug}.md`;
    const content = loadFile(mapPath);
    if (content) {
      sections.push(`[HARİTA BİLGİSİ — ${map}]\n${content}`);
      files.push(mapPath);
    }
  }

  // 2. Agent knowledge
  if (agent && files.length < MAX_FILES) {
    const agentFile = getAgentFile(agent);
    if (agentFile) {
      const content = loadFile(agentFile);
      if (content) {
        sections.push(`[AGENT BİLGİSİ — ${agent}]\n${content}`);
        files.push(agentFile);
      }
    }
  }

  // 3. Rank knowledge
  if (files.length < MAX_FILES) {
    const rankFile = getRankFile(rank);
    const content = loadFile(`ranks/${rankFile}`);
    if (content) {
      sections.push(`[RANK BİLGİSİ — ${rank || "default"}]\n${content}`);
      files.push(`ranks/${rankFile}`);
    }
  }

  // 4. Matchup knowledge (1 file max — best match)
  if (agent && enemyAgents?.length && files.length < MAX_FILES) {
    const matchups = loadMatchupFiles(agent, enemyAgents, 1);
    if (matchups.length > 0) {
      sections.push(`[EŞLEŞME BİLGİSİ]\n${matchups[0]}`);
      files.push("matchups/(best-match)");
    }
  }

  return {
    content: sections.join("\n\n---\n\n"),
    files,
  };
}
