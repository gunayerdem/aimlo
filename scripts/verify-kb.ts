/**
 * KB SAĞLAMLIK DOĞRULAMASI — "bir şey bozmaz" KANITI (lafta değil)
 * Her harita + her ajan + her rank için vision/report/feedback loader'ını çalıştırır,
 * hatasız + boş-olmayan blok döndürdüğünü doğrular. Bir .md bozuksa/eksikse burada patlar.
 * RUN: npx tsx scripts/verify-kb.ts
 */
import * as fs from "fs";
import * as path from "path";
import { loadVisionKnowledge, loadKnowledge } from "../lib/knowledge-loader";

const KB = path.join(process.cwd(), "knowledge");
let fail = 0, pass = 0;
const check = (name: string, cond: boolean, detail = "") => {
  if (cond) { pass++; } else { fail++; console.log(`  ❌ ${name} ${detail}`); }
};

// 1) Tüm KB dosyaları okunabilir mi (fs + UTF-8)?
function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "_archive" ? [] : walk(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}
const files = walk(KB);
console.log(`\n[1] KB dosya okunabilirliği (${files.length} dosya)`);
for (const f of files) {
  try { const c = fs.readFileSync(f, "utf8"); check(f, c.length > 0, "(boş!)"); }
  catch (e) { check(f, false, `(okunamadı: ${(e as Error).message})`); }
}

// 2) Her harita vision'da yükleniyor mu (slug → maps/<slug>.md bulunuyor mu)?
const maps = fs.readdirSync(path.join(KB, "maps")).filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", ""));
console.log(`\n[2] Vision KB — her harita (${maps.length})`);
for (const m of maps) {
  try {
    const kb = loadVisionKnowledge({ map: m, agent: "Jett", rank: "silver", side: "attack" });
    const hasMap = !!kb.blocks.map && kb.blocks.map.length > 0;
    check(`map=${m}`, hasMap, `(map bloğu boş — loader bulamadı; files=[${kb.files.join(",")}])`);
  } catch (e) { check(`map=${m}`, false, `(throw: ${(e as Error).message})`); }
}

// 3) Her ajan vision'da yükleniyor mu?
const roleDirs = ["controllers", "duelists", "initiators", "sentinels"];
const agents = roleDirs.flatMap((r) => fs.readdirSync(path.join(KB, "agents", r)).filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", "")));
console.log(`\n[3] Vision KB — her ajan (${agents.length})`);
for (const a of agents) {
  try {
    const kb = loadVisionKnowledge({ map: "Ascent", agent: a, rank: "silver", side: "defense" });
    check(`agent=${a}`, !!kb.blocks.agent && kb.blocks.agent.length > 0, `(agent bloğu boş)`);
  } catch (e) { check(`agent=${a}`, false, `(throw: ${(e as Error).message})`); }
}

// 4) report + feedback task'ları yükleniyor mu (her rank)?
console.log(`\n[4] report/feedback KB — her rank`);
for (const rank of ["iron", "silver", "gold", "diamond", "immortal", "radiant"]) {
  for (const task of ["report", "feedback"] as const) {
    try {
      const s = loadKnowledge(task, { map: "Summit", agent: "Omen", rank, enemyAgents: ["Jett", "Cypher"], side: "attack" });
      check(`${task}/${rank}`, typeof s === "string" && s.length > 0, `(boş)`);
    } catch (e) { check(`${task}/${rank}`, false, `(throw: ${(e as Error).message})`); }
  }
}

// 5) Summit özel — yeni harita gerçekten yükleniyor mu?
console.log(`\n[5] Summit yeni harita`);
try {
  const kb = loadVisionKnowledge({ map: "Summit", agent: "Raze", rank: "silver", side: "attack" });
  check("Summit vision map bloğu", !!kb.blocks.map && kb.blocks.map.includes("Mid Fountain"), "(Summit içeriği yok)");
} catch (e) { check("Summit", false, `(throw: ${(e as Error).message})`); }

console.log(`\n══════ SONUÇ: ${pass} geçti, ${fail} başarısız ══════`);
if (fail > 0) { console.log("❌ KB BOZUK — bir şey kırılmış!"); process.exit(1); }
console.log("✅ TÜM KB sağlam — hiçbir dosya bozuk/eksik değil, tüm route'lar yüklüyor.");
