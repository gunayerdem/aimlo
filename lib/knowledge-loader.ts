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

// Rank-gating REMOVED (2026-06-26, softi's standing decision). Every player —
// Iron to Radiant — gets the same Radiant-depth insight, expressed in universal
// plain language. The OLD per-tier files (low/mid/high-elo, elite) actively
// CAPPED insight ("şu konuyu açma: counter-strafing, off-angle, …") and, because
// the desktop never sends rank, EVERY user was silently served the gated
// low-elo.md. The single universal.md replaces all of them. Insight depth is now
// selected by DEATH TYPE (via RAG inside the file), not rank. Every rank maps to
// universal.md so an explicit ctx.rank can never reintroduce gating.
const RANK_FILE_MAP: Record<string, string> = {
  iron: "universal.md",
  bronze: "universal.md",
  silver: "universal.md",
  gold: "universal.md",
  platinum: "universal.md",
  diamond: "universal.md",
  ascendant: "universal.md",
  immortal: "universal.md",
  radiant: "universal.md",
};

// Desktop currently never sends rank; the default must also be the un-gated file.
const DEFAULT_RANK_FILE = "universal.md";

// ── Task types and their knowledge requirements ───────────

type TaskType = "insight" | "feedback" | "report" | "critical-mistake" | "growth-plan";

interface LoadOptions {
  map?: string;
  agent?: string;
  rank?: string;
  enemyAgents?: string[];
  spikePlanted?: boolean;
  economyType?: string;
  /** "attack" | "defense" — when set, side-irrelevant sections are dropped. */
  side?: string;
}

// ── File loading helpers ──────────────────────────────────
//
// In-process cache. KB markdown files are immutable for the lifetime of a
// serverless instance — they're shipped via outputFileTracingIncludes and
// never change between requests. Without this cache every AI request
// re-reads 25-140 KB through fs.readFileSync, which adds ~5-20 ms per
// request and gets multiplied by every agent/map/contextual file the
// vision/feedback/report routes touch.
//
// Cache key = relativePath (already canonical). Negative results (file
// missing) are also cached as empty string to avoid repeated existsSync
// checks on the hot path. Cache lives for the process lifetime — Vercel
// recycles serverless instances within minutes anyway, so no manual TTL.
const FILE_CACHE = new Map<string, string>();

function loadFile(relativePath: string): string {
  const cached = FILE_CACHE.get(relativePath);
  if (cached !== undefined) return cached;
  try {
    const fullPath = path.join(KNOWLEDGE_DIR, relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    FILE_CACHE.set(relativePath, content);
    return content;
  } catch {
    FILE_CACHE.set(relativePath, "");
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

/** Resolve an agent name to its role string (case-insensitive + slug-tolerant). */
function resolveAgentRole(agentName: string): string | null {
  if (AGENT_ROLE_MAP[agentName]) return AGENT_ROLE_MAP[agentName];
  const lower = agentName.toLowerCase();
  const ci = Object.entries(AGENT_ROLE_MAP).find(([key]) => key.toLowerCase() === lower);
  if (ci) return ci[1];
  // Slug fallback (2026-06-26): the "KAY/O" key's slash breaks the case-insensitive
  // match when the desktop/OCR sends "KAYO" or "kayo" → KAY/O's KB never loaded
  // (caught by scripts/verify-kb.ts). Compare alphanumeric-only slugs so KAY/O
  // resolves no matter how the agent name arrives (KAY/O, KAYO, kayo).
  const slug = lower.replace(/[^a-z0-9]/g, "");
  const bySlug = Object.entries(AGENT_ROLE_MAP).find(
    ([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === slug,
  );
  return bySlug ? bySlug[1] : null;
}

/**
 * Load up to `limit` matchup files relevant to the player agent vs enemy agents.
 * Tries specific agent matchups first, then falls back to role-vs-role.
 *
 * IMPORTANT: enemyAgents is sorted before iteration to keep matchup-file
 * selection DETERMINISTIC across requests. Anthropic prompt cache is
 * content-keyed; if two requests share the same map+agent+enemy comp but
 * the comp arrives in different orders (different scoreboard sort), the
 * selected matchup file would differ → cache miss. With sort, identical
 * compositions always pick the same file → cross-user cache hits at scale.
 */
function loadMatchupFiles(
  playerAgent: string,
  enemyAgents: string[],
  limit: number = 2
): string[] {
  const results: string[] = [];
  const playerRole = resolveAgentRole(playerAgent);
  const playerSlug = playerAgent.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Sort enemy roster alphabetically for cache-key stability (see comment above).
  const sortedEnemies = [...enemyAgents].sort();

  for (const enemy of sortedEnemies) {
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
  const { map, agent, rank, enemyAgents, side } = options;

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
    if (mapContent) sections.push(filterSectionsBySide(stripRankSections(mapContent), side));
  }

  // Agent knowledge — included for insight, feedback, report, critical-mistake, growth-plan
  if (agent) {
    const agentFile = getAgentFile(agent);
    if (agentFile) {
      const agentContent = loadFile(agentFile);
      if (agentContent) sections.push(filterSectionsBySide(stripRankSections(agentContent), side));
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
        if (content) sections.push(stripRankSections(content));
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
  /** Joined content (legacy field, still useful for logging or single-block fallback). */
  content: string;
  files: string[];
  /**
   * Separated blocks for 4-block prompt-cache strategy.
   * Order of stability (most stable → most variable):
   *   - agent: rarely changes (player's main agent)
   *   - map: per-match
   *   - contextual: rank + matchup + post-plant + economy (situational)
   * Splitting these into separate cache_control breakpoints lets cross-match
   * cache reuse work — if user keeps the same agent across matches, the agent
   * block stays cached even when the map block is rewritten.
   */
  blocks: {
    /**
     * Block 0 — statik silah+komp rehberi (weapon-comp-compact.md). TÜM
     * isteklerde AYNI içerik → en-kararlı prefix; policy bloğundan hemen sonra
     * push edilir ki kullanıcılar/maçlar arası prompt-cache paylaşımı maksimum
     * olsun. Round-bazlı BÖLÜM SEÇİMİ YAPILMAZ (yapılsaydı sistem bloğu her
     * round değişir, arkasındaki ~65KB cache'ten düşerdi) — hangi bölümün
     * kullanılacağını user-message'daki [SİLAH+KOMP İPUCU] işaretçisi söyler.
     */
    static?: string;
    agent?: string;
    map?: string;
    contextual?: string;
  };
}

/**
 * Whitespace-strip raw KB markdown:
 *   - decorative `═══` borders → removed (pure visual, model ignores)
 *   - 3+ consecutive newlines → 2 (preserves paragraph structure)
 *   - trailing whitespace per line → stripped
 * Preserves: headers, bullet lists, code blocks, tables, all content tokens.
 * Saves ~10% on KB tokens with zero impact on model comprehension.
 */
function stripKbWhitespace(content: string): string {
  return content
    .replace(/^═{5,}\s*$/gm, "")        // decorative border lines
    .replace(/\n{3,}/g, "\n\n")          // collapse 3+ newlines to 2
    .replace(/[ \t]+\n/g, "\n")          // trailing whitespace
    .trim();
}

/**
 * Side-aware section filter — drops H2 sections that are exclusively about the
 * OPPOSITE side of the round.
 *
 * Strategy (zero info-loss): only filters sections whose H2 header contains
 * an explicit Turkish side keyword. Sections without a clear keyword (general
 * principles, callouts, post-plant, agent tier, etc.) are KEPT regardless of
 * side. This ensures we never drop content that could be relevant.
 *
 *   side="attack"  → drop sections with "Savunma" or "Defansif" in the H2 header
 *   side="defense" → drop sections with "Saldırı" or "Saldırgan" or "Atak" in the H2 header
 *   side undefined or unknown → no filter (full content)
 *
 * Map files vary in structure: some have explicit "## 3. Saldırı Stratejileri"
 * splits, others use "## Pattern → Meaning" without side split. The filter
 * is conservative — it only acts on explicit keyword matches, so files without
 * clean splits get loaded fully (no risk of dropping useful content).
 */
/**
 * Rank-gating bölümlerini düşür (defense-in-depth, denetim 2026-07-08).
 * softi'nin 2026-06-26 kararı: rank-tiering YASAK — herkes Radiant-derinlik alır.
 * KB fix dalgası dosyalardaki "## Rank Modülasyonu" / "## Rank Notu" bölümlerini
 * söküyor; bu filtre, gözden kaçan ya da İLERİDE eklenen bir rank bölümünün
 * prompt'a sızmasını LOADER seviyesinde engeller (tipik istekte ~2.9KB tasarruf
 * + "bu rankta bunu öğrenme" gating-dilinin çıktıya bulaşma riski kapanır).
 * filterSectionsBySide ile aynı H2-bölme mekaniği.
 */
export function stripRankSections(content: string): string {
  const rankHeader = /rank\s*(modülasyonu|modulasyonu|notu|başına|basina)/i;
  const sections = content.split(/(?=^## )/gm);
  const kept: string[] = [];
  for (const section of sections) {
    const headerMatch = section.match(/^## (.+)$/m);
    if (headerMatch && rankHeader.test(headerMatch[1])) continue;
    kept.push(section);
  }
  return kept.join("");
}

export function filterSectionsBySide(content: string, side?: string): string {
  if (!side || (side !== "attack" && side !== "defense")) return content;

  // No \b boundary — \b doesn't handle Turkish 'ı' well in JS regex.
  // Substring match is safe: these keywords don't appear inside common words.
  const dropKeywords = side === "attack"
    ? /(savunma|defansif|defensif|\bdefense\b)/i
    : /(saldırı|saldırgan|\batak\b|\battack\b|offens)/i;

  // Split on H2 boundaries while preserving the headers.
  // Pattern: capture from "## " at line start to next "## " or end-of-string.
  const sections = content.split(/(?=^## )/gm);
  const kept: string[] = [];
  for (const section of sections) {
    const headerMatch = section.match(/^## (.+)$/m);
    if (!headerMatch) {
      // No H2 — pre-content (intro), always keep.
      kept.push(section);
      continue;
    }
    const header = headerMatch[1];
    if (dropKeywords.test(header)) {
      // Drop this section.
      continue;
    }
    kept.push(section);
  }
  return kept.join("");
}

export function loadVisionKnowledge(options: LoadOptions = {}): VisionKnowledgeResult {
  const { map, agent, rank, enemyAgents, spikePlanted, economyType, side } = options;
  const files: string[] = [];

  // ── Block 0: Statik silah+komp rehberi (istekten BAĞIMSIZ — en kararlı blok) ──
  // killerInfo(silah)/loadout/enemyRoster verisi zaten geliyor ama KB'si hiç
  // yüklenmiyordu (denetim 2026-07-08) → silah/komp-özel ders üretilemiyordu.
  // Kullanım: user-message'daki [SİLAH+KOMP İPUCU] işaretçisi bölüm seçer.
  let staticBlock: string | undefined;
  {
    const content = loadFile("general/weapon-comp-compact.md");
    if (content) {
      staticBlock =
        `[SİLAH + KOMP REHBERİ — user message'daki [SİLAH+KOMP İPUCU] işaretçisinin ` +
        `gösterdiği bölümü kullan; işaretçi yoksa bu rehberden ders çıkarma]\n` +
        stripKbWhitespace(content);
      files.push("general/weapon-comp-compact.md");
    }
  }

  // ── Block 1: Agent KB (most stable across matches — main agent rarely changes) ──
  let agentBlock: string | undefined;
  if (agent) {
    const agentFile = getAgentFile(agent);
    if (agentFile) {
      const content = loadFile(agentFile);
      if (content) {
        // Side-filter agent file too: agents have "Saldırı" / "Savunma" usage sections.
        // stripRankSections: rank-gating bölümleri loader'da düşer (defense-in-depth).
        const filtered = filterSectionsBySide(stripRankSections(content), side);
        agentBlock = `[AGENT BİLGİSİ — ${agent}]\n${stripKbWhitespace(filtered)}`;
        files.push(agentFile);
      }
    }
  }
  // Council 2026-06-08: surface a realistic agent-selector miss (OCR slug/role
  // mismatch) so wrong/empty agent KB is diagnosable instead of silently generic.
  if (agent && !agentBlock) {
    console.warn(`[KB] agent selector '${agent}' matched no agents file (role/slug miss)`);
  }

  // ── Block 2: Map KB (per-match — high cache miss rate across matches) ──
  let mapBlock: string | undefined;
  if (map) {
    const mapSlug = map.toLowerCase().replace(/[^a-z]/g, "");
    const mapPath = `maps/${mapSlug}.md`;
    const content = loadFile(mapPath);
    if (content) {
      const filtered = filterSectionsBySide(stripRankSections(content), side);
      mapBlock = `[HARİTA BİLGİSİ — ${map}]\n${stripKbWhitespace(filtered)}`;
      files.push(mapPath);
    }
  }
  if (map && !mapBlock) {
    console.warn(`[KB] map selector '${map}' matched no maps file (slug '${map.toLowerCase().replace(/[^a-z]/g, "")}')`);
  }

  // ── Block 3: Contextual KB (rank + matchup + situational — most variable) ──
  const contextualParts: string[] = [];

  // Rank
  const rankFile = getRankFile(rank);
  const rankContent = loadFile(`ranks/${rankFile}`);
  if (rankContent) {
    contextualParts.push(`[KOÇLUK PROFİLİ — her rank için Radiant derinliği, sade dil]\n${stripKbWhitespace(rankContent)}`);
    files.push(`ranks/${rankFile}`);
  }

  // Post-plant (only if spike planted)
  if (spikePlanted) {
    const content = loadFile("general/post-plant-playbook.md");
    if (content) {
      contextualParts.push(`[POST-PLANT TAKTİK]\n${stripKbWhitespace(content)}`);
      files.push("general/post-plant-playbook.md");
    }
  }

  // Economy (only if eco/force/pistol)
  if (economyType && (economyType === "eco" || economyType === "force_buy" || economyType === "pistol")) {
    const content = loadFile("general/economy-mastery.md");
    if (content) {
      contextualParts.push(`[EKONOMİ REHBERİ]\n${stripKbWhitespace(content)}`);
      files.push("general/economy-mastery.md");
    }
  }

  // Matchup (1 best match)
  if (agent && enemyAgents?.length) {
    const matchups = loadMatchupFiles(agent, enemyAgents, 1);
    if (matchups.length > 0) {
      contextualParts.push(`[EŞLEŞME BİLGİSİ]\n${stripKbWhitespace(matchups[0])}`);
      files.push("matchups/(best-match)");
    }
  }

  const contextualBlock = contextualParts.length > 0
    ? contextualParts.join("\n\n---\n\n")
    : undefined;

  // Joined content (backward-compat).
  const allParts = [staticBlock, agentBlock, mapBlock, contextualBlock].filter(Boolean) as string[];

  return {
    content: allParts.join("\n\n---\n\n"),
    files,
    blocks: {
      static: staticBlock,
      agent: agentBlock,
      map: mapBlock,
      contextual: contextualBlock,
    },
  };
}
