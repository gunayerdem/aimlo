/**
 * KB SAĞLAMLIK DOĞRULAMASI — "bir şey bozmaz" KANITI (lafta değil)
 * Her harita + her ajan + her rank için vision/report/feedback loader'ını çalıştırır,
 * hatasız + boş-olmayan blok döndürdüğünü doğrular. Bir .md bozuksa/eksikse burada patlar.
 * RUN: npx tsx scripts/verify-kb.ts
 */
import * as fs from "fs";
import * as path from "path";
import { loadVisionKnowledge, loadKnowledge } from "../lib/knowledge-loader";
import { DEATH_TYPE_GUIDE } from "../lib/death-type";
import { BANNED_PHRASES } from "../lib/ai-policy";

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

// 6) DEATH-TYPE ÇAPA SÖZLEŞMESİ (KB gece nöbeti 2026-07-08 — 5 çapa parafraz
//    yüzünden KOPUKTU ve model generic bloğa kaçıyordu). Her kbBlock, universal.md'de
//    VERBATIM "H2" ya da "H2 — H3" karşılığı olmalı. universal.md'yi yeniden
//    yapılandıran HERKES bu testi kırmadan geçemez.
console.log(`\n[6] death-type kbBlock çapaları ↔ universal.md başlıkları`);
{
  const uni = fs.readFileSync(path.join(KB, "ranks", "universal.md"), "utf8");
  const h2s: string[] = [];
  const h3sByH2 = new Map<string, string[]>();
  let curH2 = "";
  for (const line of uni.split("\n")) {
    const h2 = line.match(/^## (.+?)\s*$/);
    const h3 = line.match(/^### (.+?)\s*$/);
    if (h2) { curH2 = h2[1]; h2s.push(curH2); h3sByH2.set(curH2, []); }
    else if (h3 && curH2) h3sByH2.get(curH2)!.push(h3[1]);
  }
  for (const [dtype, guide] of Object.entries(DEATH_TYPE_GUIDE)) {
    const kb = guide.kbBlock;
    // Kural: kbBlock === H2, ya da kbBlock === `${H2} — ${H3}` (H3 içinde de
    // em-dash olabilir → startsWith + kalan-eşitlik ile çöz).
    const ok = h2s.some((h2) => {
      if (kb === h2) return true;
      if (!kb.startsWith(h2 + " — ")) return false;
      const rest = kb.slice(h2.length + 3);
      return (h3sByH2.get(h2) ?? []).includes(rest);
    });
    check(`çapa ${dtype} → "${kb}"`, ok, "(universal.md'de verbatim H2 / H2 — H3 karşılığı YOK)");
  }
}

// 7) YASAK-KELİME TARAMASI — KB dosyaları BANNED_PHRASES içermemeli (KB'nin cümlesi
//    çıktının cümlesidir; yasaklı kalıp KB'deyse model onu birebir üretir).
//    İstisna: yasak-örneği olarak TIRNAK içinde öğretilen satırlar ("kill aldı" deme,
//    → düzeltme okları, YASAK etiketli satırlar) taranmaz.
//    SÖZLEŞME (2026-07-08): FAIL yalnız RUNTIME'A YÜKLENEN dosyada — prompt'a
//    ulaşamayan dosya (yüklenmeyen general/* kaynak-materyali) yalnız UYARI sayılır.
//    Runtime seti knowledge-loader'dan türetilir: maps/** + matchups/** + ranks/** +
//    agents/<rol>/*.md + general'in loader'da geçen 6 dosyası. Yeni bir general
//    dosyası runtime'a bağlanırsa BURAYA da eklenmeli (yoksa ihlali fail etmez).
console.log(`\n[7] KB yasak-kelime taraması (${BANNED_PHRASES.length} kalıp)`);
{
  const RUNTIME_GENERAL = new Set([
    "coaching-core.md", "post-plant-playbook.md", "economy-mastery.md",
    "pro-analysis.md", "radiant-tips.md", "weapon-comp-compact.md",
  ]);
  const isRuntimeFile = (rel: string): boolean => {
    const p = rel.replace(/\\/g, "/");
    if (p.startsWith("maps/") || p.startsWith("matchups/") || p.startsWith("ranks/")) return true;
    if (/^agents\/[^/]+\/[^/]+\.md$/.test(p)) return true; // per-agent dosyaları (rol klasörü altında)
    if (p.startsWith("general/")) return RUNTIME_GENERAL.has(p.slice("general/".length));
    return false;
  };
  const exemptLine = /(yasak|deme\b|denmez|kullanma|yerine|→|❌)/i;
  let hits = 0, warns = 0;
  for (const f of files) {
    const rel = path.relative(KB, f);
    const runtime = isRuntimeFile(rel);
    const lines = fs.readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (exemptLine.test(line)) return;
      const lower = line.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        if (lower.includes(phrase.toLowerCase())) {
          if (runtime) {
            hits++;
            check(`${rel}:${i + 1}`, false, `(yasak kalıp: "${phrase}")`);
          } else {
            warns++;
          }
        }
      }
    });
  }
  if (warns > 0) console.log(`  ⚠ runtime-dışı (yüklenmeyen) dosyalarda ${warns} yasak-kalıp — fail değil, temizlik adayı`);
  check("KB yasak-kelime temiz (runtime)", hits === 0, `(${hits} ihlal)`);
}

// 8) Statik silah+komp bloğu vision'a yükleniyor mu?
console.log(`\n[8] weapon-comp-compact statik bloğu`);
try {
  const kb = loadVisionKnowledge({ map: "Ascent", agent: "Jett", side: "attack" });
  check("static blok dolu", !!kb.blocks.static && kb.blocks.static.length > 500, "(weapon-comp-compact.md yok/boş)");
  check("static blok komp bölümlü", !!kb.blocks.static && kb.blocks.static.includes("Komp Okuma"), "(Komp Okuma bölümü yok)");
  const sizeOk = !kb.blocks.static || kb.blocks.static.length <= 8500;
  check("static blok ≤8.5KB (maliyet disiplini)", sizeOk, `(${kb.blocks.static?.length ?? 0}b)`);
} catch (e) { check("static blok", false, `(throw: ${(e as Error).message})`); }

console.log(`\n══════ SONUÇ: ${pass} geçti, ${fail} başarısız ══════`);
if (fail > 0) { console.log("❌ KB BOZUK — bir şey kırılmış!"); process.exit(1); }
console.log("✅ TÜM KB sağlam — hiçbir dosya bozuk/eksik değil, tüm route'lar yüklüyor.");
