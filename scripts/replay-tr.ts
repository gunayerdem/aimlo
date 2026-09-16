/** TR süzgeç yamalarının 39 GERÇEK çıktı üzerindeki etkisini ölçer.
 *  Model YENİDEN ÇAĞRILMAZ: kaydedilmiş `raw` alanları mevcut son-işlem
 *  zincirinden geçirilip kaydedilmiş `final` ile karşılaştırılır → fark
 *  YALNIZ süzgeç değişikliğinden gelir (model rastgeleliği yok, maliyet yok). */
import fs from "node:fs";
import { realityCheck, buildFactGround } from "../lib/reality-checker";
import { cleanCoachText, clampWords, enforceSuppliedCallout } from "../lib/coach-text";
import { enforceAgentKit } from "../lib/agent-abilities";
import { sanitizePromptInput } from "../lib/prompt-safety";

const SP = "C:/Users/GNAYER~1/AppData/Local/Temp/claude/C--Users-G-nay-Erdem-Desktop-aimlo/37eabe72-d4f9-4576-9780-05e357a57a03/scratchpad/test/";
const PAIRS: [string, string][] = [
  ["cycletr-cards", "tr-cards.json"], ["cycletr-cards2", "tr-cards-2.json"],
  ["cycletr-cards3", "tr-cards-3.json"], ["cycletr-posters", "tr-posters.json"],
  ["cycletr-posters2", "tr-posters-2.json"], ["cycletr-posters3", "tr-posters-3.json"],
  ["cycletr-posters4", "tr-posters-4.json"], ["cycleab-base", "../lens/proj/evals/real-rounds-23.json"],
];

type S = { id: string; lang?: string; body: Record<string, unknown> };
function post(s: S, fb: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }) {
  const b = s.body;
  const lang = (s.lang === "en" || b.lang === "en" ? "en" : "tr") as "tr" | "en";
  const map = typeof b.map === "string" ? b.map : undefined;
  const agent = typeof b.agent === "string" ? b.agent : undefined;
  const rh = (b.roundHistory as Record<string, unknown>[] | undefined) || [];
  const mem = rh.map((r) => ({
    round_index: r.round_index as number, died: !!r.died,
    death_position: r.death_position as string | null | undefined,
    position_confidence: r.position_confidence as string | undefined,
  }));
  const ctx: Record<string, unknown> = {};
  if (b.died === true) {
    if (typeof b.deathLocation === "string") ctx.deathLocation = sanitizePromptInput(b.deathLocation, { max: 50, collapseWhitespace: true });
    if (typeof b.deathAngle === "string") ctx.deathAngle = sanitizePromptInput(b.deathAngle, { max: 30, collapseWhitespace: true });
    if (typeof b.playerRoute === "string") ctx.playerRoute = sanitizePromptInput(b.playerRoute, { max: 120, collapseWhitespace: true });
  }
  const fg = buildFactGround(b, ctx);
  // route.ts:1819-1848 — callout duzeltici clampWords'un DISINDA uygulanir (S5).
  const suppliedLoc = typeof b.deathLocation === "string" ? b.deathLocation : "";
  const fix = (x: string) => (suppliedLoc ? enforceSuppliedCallout(x, suppliedLoc) : x);
  const ca = realityCheck(fb.deathAnalysis, mem as never, fg, "death", lang, map);
  const cs = realityCheck(fb.nextRoundSuggestion, mem as never, fg, "suggestion", lang, map);
  const cl = cleanCoachText(ca.text, lang);
  return {
    deathAnalysis: fix(clampWords(enforceAgentKit(cl && cl.trim() ? cl : ca.text, agent), 350)),
    enemyAnalysis: (fb.enemyAnalysis || []).slice(0, 2).map((x) => {
      const c = realityCheck(String(x), mem as never, fg, "suggestion", lang, map);
      return fix(clampWords(enforceAgentKit(cleanCoachText(c.text && c.text.trim() ? c.text : String(x), lang), agent), 180));
    }).filter((s) => s && s.trim().length > 0),
    nextRoundSuggestion: fix(clampWords(enforceAgentKit(cleanCoachText(cs.text && cs.text.trim() ? cs.text : fb.nextRoundSuggestion, lang), agent), 350)),
  };
}

// Kabul ölçütü (plan §5): bu desenlerin HİÇBİRİ kalmamalı.
const BAD: [string, RegExp][] = [
  ["kelime-ortası kesme", /(^|[\s:;,(])(ktan sonra|ğ[a-zçğıöşü]{1,8}\s)/],
  ["yetim pencere eki", /Son\s['’]|kez['’][uü]n|round['’]un\s['’]/],
  ["yetim ek (genel)", /(^|\s)['’][ıiuü]n[dt][ae]n?\s/],
  ["apostroflu kadro", /kadro['’]/],
  ["apostroflu düşman", /bir düşman['’]/],
  ["fazlalık niteleme", /Rakip bir düşman/],
];
const texts = (o: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }) =>
  [o.deathAnalysis, ...(o.enemyAnalysis || []), o.nextRoundSuggestion].filter(Boolean);

let nScen = 0, nChanged = 0;
const before: Record<string, number> = {}, after: Record<string, number> = {};
const diffs: string[] = [];
for (const [cycle, corpusFile] of PAIRS) {
  const sf = `scripts/eval-out/${cycle}-samples.json`;
  if (!fs.existsSync(sf)) { console.log(`  · ${cycle}: örnek dosyası yok, atlandı`); continue; }
  const samples = JSON.parse(fs.readFileSync(sf, "utf8")) as { id: string; raw: never; final: never }[];
  const corpus = JSON.parse(fs.readFileSync(SP + corpusFile, "utf8")) as S[];
  const byId = new Map(corpus.map((s) => [s.id, s]));
  for (const smp of samples) {
    const s = byId.get(smp.id);
    if (!s || !smp.raw) continue;
    nScen++;
    const oldF = smp.final as { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string };
    const newF = post(s, smp.raw);
    for (const [label, re] of BAD) {
      if (texts(oldF).some((t) => re.test(t))) before[label] = (before[label] || 0) + 1;
      if (texts(newF).some((t) => re.test(t))) after[label] = (after[label] || 0) + 1;
    }
    const ot = texts(oldF).join("\u0000"), nt = texts(newF).join("\u0000");
    if (ot !== nt) {
      nChanged++;
      const a = texts(oldF), b2 = texts(newF);
      for (let i = 0; i < Math.max(a.length, b2.length); i++) {
        if (a[i] !== b2[i]) diffs.push(`[${cycle}/${smp.id}#${i}]\n   ESKİ: ${a[i] ?? "(yok)"}\n   YENİ: ${b2[i] ?? "(yok)"}`);
      }
    }
  }
}
console.log(`\nSenaryo: ${nScen} · metni DEĞİŞEN senaryo: ${nChanged}\n`);
console.log("KABUL ÖLÇÜTÜ (senaryo sayısı, 0 olmalı):");
let bad = 0;
for (const [label] of BAD) {
  const b = before[label] || 0, a = after[label] || 0;
  if (a > 0) bad++;
  console.log(`  ${a === 0 ? "✓" : "✗"} ${label.padEnd(22)} önce ${String(b).padStart(2)} → sonra ${String(a).padStart(2)}`);
}
fs.writeFileSync("scripts/eval-out/replay-tr-diff.txt", diffs.join("\n\n"), "utf8");
console.log(`\nTam fark dökümü: scripts/eval-out/replay-tr-diff.txt (${diffs.length} alan)`);
process.exit(bad ? 1 : 0);
