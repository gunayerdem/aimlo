/**
 * KB TOKEN MALİYET ÖLÇÜMÜ — "maliyeti artırmadan" KANITI
 * Temsili istek matrisi için loadVisionKnowledge blok boyutlarını (byte) ölçer.
 * KB değişikliği ÖNCESİ ve SONRASI çalıştırılıp karşılaştırılır: sonra ≤ önce olmalı.
 * (byte ≈ token×~3.2 Türkçe için — oran sabit olduğundan byte karşılaştırması yeterli)
 * RUN: npx tsx scripts/measure-kb.ts [etiket]
 */
import { loadVisionKnowledge, loadKnowledge } from "../lib/knowledge-loader";

const MATRIX: Array<{ name: string; opts: Parameters<typeof loadVisionKnowledge>[0] }> = [
  { name: "ascent-jett-atk", opts: { map: "Ascent", agent: "Jett", side: "attack", enemyAgents: ["Omen", "Cypher", "Sova", "Reyna", "Sage"] } },
  { name: "bind-omen-def", opts: { map: "Bind", agent: "Omen", side: "defense", enemyAgents: ["Jett", "Raze", "Skye", "Viper", "Killjoy"] } },
  { name: "haven-cypher-def-eco", opts: { map: "Haven", agent: "Cypher", side: "defense", economyType: "eco", enemyAgents: ["Neon", "Breach", "Astra", "Chamber", "Gekko"] } },
  { name: "summit-raze-atk-postplant", opts: { map: "Summit", agent: "Raze", side: "attack", spikePlanted: true, enemyAgents: ["Jett", "Omen", "Fade", "Vyse", "Iso"] } },
  { name: "corrode-tejo-atk", opts: { map: "Corrode", agent: "Tejo", side: "attack", enemyAgents: ["Waylay", "Clove", "Tejo", "Deadlock", "Phoenix"] } },
  { name: "icebox-reyna-def-force", opts: { map: "Icebox", agent: "Reyna", side: "defense", economyType: "force_buy", enemyAgents: ["Jett", "Harbor", "Sova", "Sage", "Yoru"] } },
];

const label = process.argv[2] ?? "run";
const rows: Array<Record<string, number | string>> = [];
let totalAll = 0;

for (const { name, opts } of MATRIX) {
  const kb = loadVisionKnowledge(opts);
  const s = kb.blocks.static?.length ?? 0; // silah+komp statik bloğu (2026-07-08 sonrası)
  const a = kb.blocks.agent?.length ?? 0;
  const m = kb.blocks.map?.length ?? 0;
  const c = kb.blocks.contextual?.length ?? 0;
  const total = s + a + m + c;
  totalAll += total;
  rows.push({ combo: name, static: s, agent: a, map: m, contextual: c, total });
}

// report task (match report KB)
const report = loadKnowledge("report", { map: "Ascent", agent: "Jett", enemyAgents: ["Omen", "Cypher"], side: "attack" });
rows.push({ combo: "report-task", agent: 0, map: 0, contextual: 0, total: report.length });
totalAll += report.length;

console.log(`\n[measure-kb] etiket=${label} tarih=${new Date().toISOString()}`);
console.table(rows);
console.log(`TOPLAM (6 vision + 1 report): ${totalAll} byte  (~${Math.round(totalAll / 3.2)} token)`);
console.log(JSON.stringify({ label, totalAll, rows }, null, 0));
