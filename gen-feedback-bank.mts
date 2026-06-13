/* ════════════════════════════════════════════════════════════════════
   AIMLO — Feedback ÖRNEK BANKASI jeneratörü (GERÇEK KB + gpt-5-mini)
   Patron: "20 TR + 20 EN örnek feedback ürettir, birini koy."
   loadKnowledge("feedback") + buildPolicyBlock + gpt-5-mini. Çıktıyı dil-duyarlı
   yasak/tarzanca regex'iyle doğrular (TR'de tarzanca yasak; EN'de "pre-aim" normal,
   sadece generic-advice + etiket yasak). 20 senaryo × 2 dil = 40 örnek.
   Çalıştır: npx tsx gen-feedback-bank.mts → app/feedbackBank.generated.ts
   ════════════════════════════════════════════════════════════════════ */
import fs from "fs";
import path from "path";
import { loadKnowledge } from "./lib/knowledge-loader";
import { buildPolicyBlock, BANNED_PHRASES } from "./lib/ai-policy";

function readKey(): string {
  const raw = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^OPENAI_API_KEY\s*=\s*(.+)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  throw new Error("OPENAI_API_KEY yok");
}
const API_KEY = readKey();

type Scn = { agent: string; map: string; side: "attack" | "defense"; loc: string; note: string };
const SCENARIOS: Scn[] = [
  { agent: "Jett", map: "Ascent", side: "attack", loc: "A Main", note: "tek başına kuru entry, trade yok" },
  { agent: "Reyna", map: "Bind", side: "attack", loc: "Hookah", note: "kill sonrası fazla agresif overpeek" },
  { agent: "Raze", map: "Split", side: "defense", loc: "B Heaven", note: "geç retake, tek tek giriş" },
  { agent: "Neon", map: "Lotus", side: "attack", loc: "A Main", note: "utility'siz hızlı giriş" },
  { agent: "Sova", map: "Haven", side: "attack", loc: "C Long", note: "aynı geniş açıyı tekrar tekrar aldı" },
  { agent: "Phoenix", map: "Sunset", side: "attack", loc: "A Main", note: "flash atmadan giriş" },
  { agent: "Cypher", map: "Icebox", side: "defense", loc: "A Belt", note: "Operator ilk mermiyi kaçırınca aynı açıda kaldı" },
  { agent: "Omen", map: "Pearl", side: "attack", loc: "Mid Doors", note: "kendi smoke'undan çıkıp peek attı" },
  { agent: "Chamber", map: "Lotus", side: "attack", loc: "A Main", note: "Operator'la ölünce silahı düşürmedi" },
  { agent: "Killjoy", map: "Breeze", side: "defense", loc: "B Tunnel", note: "rotasyonu geç başlattı" },
  { agent: "Sage", map: "Ascent", side: "defense", loc: "Mid Courtyard", note: "eco round'da geniş açıdan zorladı" },
  { agent: "Fade", map: "Split", side: "attack", loc: "Mid Mail", note: "trade pozisyonu olmadan girdi" },
  { agent: "Skye", map: "Haven", side: "attack", loc: "Garage", note: "bilgi almadan utility harcadı" },
  { agent: "Brimstone", map: "Bind", side: "defense", loc: "A Short", note: "anchor pozisyonunu çok erken bıraktı" },
  { agent: "Astra", map: "Pearl", side: "defense", loc: "B Link", note: "smoke timing'i geç kaldı" },
  { agent: "Gekko", map: "Sunset", side: "attack", loc: "B Market", note: "lurk ederken arkadan yakalandı" },
  { agent: "Yoru", map: "Icebox", side: "attack", loc: "Mid Boiler", note: "teleport sonrası takipsiz agresyon" },
  { agent: "Breach", map: "Lotus", side: "attack", loc: "C Mound", note: "stun timing'i takımla uyumsuz" },
  { agent: "KAY/O", map: "Ascent", side: "attack", loc: "B Main", note: "knife sonrası baskı kurmadı" },
  { agent: "Viper", map: "Breeze", side: "defense", loc: "A Hall", note: "wall'u yanlış zamanda açtı" },
];

const TARZANCA_TR = [
  /pre-?aim/i, /wide swing/i, /head\s+(at[ıi]yor|att[ıi]|buldu|aç[ıi]s[ıi]n[ıi])/i,
  /swing yap[ıi]yor/i, /peek (yap[ıi]yor|ediyor)/i, /hold (ediyor|yap[ıi]yor)/i,
  /(stun|flash|molly|smoke|ult)\s+çekiyor/i, /\bop var\b/i, /pick al[ıi]yor/i,
  /sorun\s*:/i, /\bfix\s*:/i, /sonras[ıi]\s+plan/i, /tekil veri/i, /veri yok/i, /belirsiz/i,
];
const BANNED_EN = [
  "play carefully", "gather information", "improve positioning", "play with team",
  "use utility", "be better", "try different", "keep improving", "play smarter",
];
const LABELS = [/problem\s*:/i, /\bfix\s*:/i, /solution\s*:/i, /next round plan\s*:/i, /no data/i, /not enough data/i];

function violations(text: string, lang: "tr" | "en"): string[] {
  const t = text.toLowerCase();
  const hits: string[] = [];
  if (lang === "tr") {
    for (const p of TARZANCA_TR) { const m = t.match(p); if (m) hits.push(m[0]); }
    for (const b of BANNED_PHRASES) { if (t.includes(b.toLowerCase())) hits.push(b); }
  } else {
    for (const b of BANNED_EN) { if (t.includes(b)) hits.push(b); }
    for (const p of LABELS) { const m = t.match(p); if (m) hits.push(m[0]); }
  }
  return [...new Set(hits)];
}
function clean(s: string): string {
  if (!s) return "";
  let out = s
    .replace(/\s*[;.,—-]\s*(çözüm|çozum|neden|fix|sorun|solution|problem)\s*:\s*/gi, ". ")
    .replace(/(^|\.\s+)(çözüm|çozum|neden|fix|sorun|solution|problem)\s*:\s*/gi, "$1")
    .replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").replace(/\.{2,}/g, ".").trim();
  out = out.replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
  return out;
}

function sys(s: Scn, lang: "tr" | "en", corrective: string): string {
  let kb = "";
  try { kb = loadKnowledge("feedback", { map: s.map, agent: s.agent, rank: "ascendant" }); } catch {}
  const kbPart = kb ? `\nKOÇLUK BİLGİ KAYNAĞI:\n${kb}\n` : "";
  const policy = buildPolicyBlock({ confidence: "high", tone: "strict", lang });
  if (lang === "tr") {
    return `${kbPart}Sen AIMLO'sun: Radiant seviye Valorant koçu. Keskin, spesifik, kendinden emin.
DİL: sokak Türkçesi, sade. Oyun terimleri İngilizce (peek, trade, dash, entry, smoke, flash, op, lurk, anchor, retake).
${policy}
🚫 TARZANCA YASAK: "pre-aim"→"açıyı tutuyor"; "head atıyor"→"kafadan vuruyor"; "peek yapıyor"→"peek atıyor"; "swing yapıyor"→"swing atıyor"; "wide swing"→"geniş açıyla peek"; "X çekiyor"→"X atıyor". Etiket (Sorun:/Fix:/Çözüm:) YASAK — akıcı yaz.${corrective}
ÇIKTI — SADECE JSON: { "title": "kısa başlık (3-5 kelime, callout içersin)", "deathAnalysis": "ne yanlış gitti + net çözüm, akıcı 1-2 cümle, callout zorunlu", "nextRoundPlan": "doğrudan emir, öneksiz" }`;
  }
  return `${kbPart}You are AIMLO: a Radiant-level Valorant coach. Sharp, specific, confident.
LANGUAGE: clear coach English, no corporate jargon. Standard game terms (peek, trade, dash, entry, smoke, flash, op, lurk, anchor, retake, pre-aim, wide swing are FINE in English).
${policy}
🚫 BANNED: generic advice ("play carefully", "be better", "use utility", "improve positioning"). No labels (Problem:/Fix:/Solution:). Write fluent, confident sentences.${corrective}
OUTPUT — JSON ONLY: { "title": "short title (3-5 words, include callout)", "deathAnalysis": "what went wrong + clear fix, fluent 1-2 sentences, callout required", "nextRoundPlan": "direct imperative, no prefix" }`;
}
function usr(s: Scn, lang: "tr" | "en"): string {
  if (lang === "tr") {
    return `SENARYO: ${s.agent} · ${s.map} · ${s.side === "attack" ? "Saldırı" : "Savunma"} · ${s.loc}'da öldün. Durum: ${s.note}. Bu ölüm için tek bir örnek koç-feedback'i üret.`;
  }
  return `SCENARIO: ${s.agent} · ${s.map} · ${s.side} · died at ${s.loc}. Situation: ${s.note}. Produce one example coaching feedback for this death.`;
}

async function callGPT(system: string, user: string): Promise<any> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "gpt-5-mini", max_completion_tokens: 700, reasoning_effort: "low",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const j = await res.json();
  const c = j.choices?.[0]?.message?.content;
  if (!c) throw new Error("boş");
  return JSON.parse(c);
}

async function gen(s: Scn, lang: "tr" | "en"): Promise<any> {
  let corrective = "", best: any = null, bestV = Infinity;
  for (let a = 1; a <= 5; a++) {
    try {
      const out = await callGPT(sys(s, lang, corrective), usr(s, lang));
      const txt = [out.title, out.deathAnalysis, out.nextRoundPlan].filter(Boolean).join(" \n ");
      const v = violations(txt, lang);
      const ok = out.title && out.deathAnalysis && out.nextRoundPlan;
      if (ok && v.length === 0) {
        console.log(`  ✓ ${s.agent}/${s.loc} [${lang}]`);
        return { agent: s.agent, map: s.map, side: s.side, location: s.loc, lang, title: clean(out.title), deathAnalysis: clean(out.deathAnalysis), nextRoundPlan: clean(out.nextRoundPlan) };
      }
      if (ok && v.length < bestV) { best = out; bestV = v.length; }
      corrective = `\n\n⚠ DÜZELTME: yasak kullandın: ${v.join(", ")} — at, akıcı yaz.`;
    } catch (e: any) { console.log(`  ! ${s.agent}/${s.loc} [${lang}] ${String(e.message).slice(0, 60)}`); corrective = ""; }
  }
  if (best) { console.log(`  ⚠ ${s.agent}/${s.loc} [${lang}] en iyi (${bestV})`); return { agent: s.agent, map: s.map, side: s.side, location: s.loc, lang, title: clean(best.title), deathAnalysis: clean(best.deathAnalysis), nextRoundPlan: clean(best.nextRoundPlan) }; }
  throw new Error(`${s.agent}/${s.loc} [${lang}] üretilemedi`);
}

async function main() {
  const jobs: { s: Scn; lang: "tr" | "en" }[] = [];
  for (const s of SCENARIOS) jobs.push({ s, lang: "tr" });
  for (const s of SCENARIOS) jobs.push({ s, lang: "en" });
  console.log(`Feedback bankası — ${jobs.length} örnek (20 TR + 20 EN), gpt-5-mini…`);
  const out: any[] = new Array(jobs.length);
  const queue = jobs.map((j, i) => ({ ...j, i }));
  async function worker() { while (queue.length) { const job = queue.shift()!; out[job.i] = await gen(job.s, job.lang); } }
  await Promise.all([worker(), worker(), worker(), worker()]);

  const tr = out.filter((o) => o.lang === "tr");
  const en = out.filter((o) => o.lang === "en");
  const header = `// ════════════════════════════════════════════════════════════════════
//  AUTO-GENERATED — gen-feedback-bank.mts ile gpt-5-mini + GERÇEK KB'den.
//  20 TR + 20 EN örnek koç-feedback'i. Yeniden üret: npx tsx gen-feedback-bank.mts
// ════════════════════════════════════════════════════════════════════
export type FeedbackExample = { agent: string; map: string; side: string; location: string; lang: "tr" | "en"; title: string; deathAnalysis: string; nextRoundPlan: string };
export const FEEDBACK_BANK_TR: FeedbackExample[] = ${JSON.stringify(tr, null, 2)};
export const FEEDBACK_BANK_EN: FeedbackExample[] = ${JSON.stringify(en, null, 2)};
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
`;
  const outPath = path.join(process.cwd(), "app", "feedbackBank.generated.ts");
  fs.writeFileSync(outPath, header, "utf-8");
  console.log(`\n✅ Yazıldı: ${outPath} (TR ${tr.length}, EN ${en.length})`);
}
main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
