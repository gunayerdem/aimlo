/* ════════════════════════════════════════════════════════════════════
   AIMLO — Demo feedback jeneratörü (GERÇEK KB + gpt-5-mini)
   Patron: "gerçekten KB'ye ürettir feedbackleri, ordan al."
   Üretim pipeline'ını (ai/report) sadık taklit eder: loadKnowledge("report")
   + buildPolicyBlock(strict) + gpt-5-mini json_object. Çıktıyı BANNED_PHRASES
   ve tarzanca regex'iyle doğrular; ihlalde düzeltme notuyla tekrar üretir.
   Çalıştır:  npx tsx gen-demo.mts   → aimlo-desktop/src/demoFeedback.generated.ts
   ════════════════════════════════════════════════════════════════════ */
import fs from "fs";
import path from "path";
import { loadKnowledge } from "./lib/knowledge-loader";
import { buildPolicyBlock, BANNED_PHRASES } from "./lib/ai-policy";

// ── OPENAI_API_KEY'i .env.local'den oku (değeri ASLA loglanmaz) ──
function readKey(): string {
  const raw = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^OPENAI_API_KEY\s*=\s*(.+)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  throw new Error("OPENAI_API_KEY .env.local'de yok");
}
const API_KEY = readKey();

type Death = { round: number; loc: string };
type Spec = {
  id: string; map: string; agent: string; side: "attack" | "defense";
  score: string; won: boolean; rank: string;
  teamComp: string[]; enemyComp: string[]; deaths: Death[];
};

// 12 demo maçının çekirdek gerçekleri (mevcut demoData ile aynı)
const SPECS: Spec[] = [
  { id:"demo-1", map:"Ascent", agent:"Jett", side:"attack", score:"13-9", won:true, rank:"ascendant",
    teamComp:["Jett","Sova","Omen","Killjoy","Sage"], enemyComp:["Reyna","Cypher","Brimstone","Fade","Chamber"],
    deaths:[{round:2,loc:"A Main"},{round:5,loc:"Mid Courtyard"},{round:7,loc:"A Main"},{round:11,loc:"Market"}] },
  { id:"demo-2", map:"Lotus", agent:"Neon", side:"defense", score:"11-13", won:false, rank:"ascendant",
    teamComp:["Neon","Fade","Harbor","Killjoy","Raze"], enemyComp:["Jett","Skye","Omen","Cypher","KAY/O"],
    deaths:[{round:2,loc:"A Main"},{round:3,loc:"C Mound"},{round:5,loc:"A Tree"},{round:7,loc:"C Mound"},{round:9,loc:"B Link"},{round:11,loc:"A Main"},{round:12,loc:"C Mound"}] },
  { id:"demo-3", map:"Split", agent:"Reyna", side:"attack", score:"13-7", won:true, rank:"ascendant",
    teamComp:["Reyna","Breach","Omen","Cypher","Raze"], enemyComp:["Jett","Sova","Viper","Killjoy","Sage"],
    deaths:[{round:3,loc:"A Main"},{round:6,loc:"Mid Mail"},{round:9,loc:"B Heaven"}] },
  { id:"demo-4", map:"Bind", agent:"Raze", side:"defense", score:"13-11", won:true, rank:"ascendant",
    teamComp:["Raze","Skye","Brimstone","Cypher","Gekko"], enemyComp:["Reyna","Fade","Astra","Killjoy","Neon"],
    deaths:[{round:1,loc:"A Short"},{round:4,loc:"Hookah"},{round:6,loc:"B Long"},{round:9,loc:"A Short"},{round:12,loc:"Showers"}] },
  { id:"demo-5", map:"Haven", agent:"Sova", side:"attack", score:"8-13", won:false, rank:"ascendant",
    teamComp:["Sova","Jett","Omen","Killjoy","Sage"], enemyComp:["Raze","Breach","Astra","Cypher","Chamber"],
    deaths:[{round:1,loc:"C Long"},{round:3,loc:"Garage"},{round:4,loc:"C Long"},{round:6,loc:"Mid Doors"},{round:7,loc:"C Long"},{round:9,loc:"A Short"},{round:10,loc:"Garage"},{round:12,loc:"C Long"}] },
  { id:"demo-6", map:"Ascent", agent:"Jett", side:"defense", score:"13-10", won:true, rank:"ascendant",
    teamComp:["Jett","Sova","Omen","Killjoy","KAY/O"], enemyComp:["Neon","Skye","Astra","Cypher","Sage"],
    deaths:[{round:2,loc:"A Main"},{round:5,loc:"Mid Courtyard"},{round:7,loc:"A Main"},{round:10,loc:"B Main"}] },
  { id:"demo-7", map:"Sunset", agent:"Phoenix", side:"attack", score:"10-13", won:false, rank:"ascendant",
    teamComp:["Phoenix","Fade","Clove","Cypher","Raze"], enemyComp:["Jett","Sova","Omen","Killjoy","Vyse"],
    deaths:[{round:2,loc:"A Main"},{round:3,loc:"Mid Courtyard"},{round:5,loc:"B Market"},{round:7,loc:"A Main"},{round:8,loc:"A Elbow"},{round:10,loc:"Mid Courtyard"},{round:12,loc:"A Main"}] },
  { id:"demo-8", map:"Icebox", agent:"Cypher", side:"defense", score:"13-6", won:true, rank:"ascendant",
    teamComp:["Cypher","Sova","Viper","Sage","Jett"], enemyComp:["Reyna","Fade","Harbor","Killjoy","Raze"],
    deaths:[{round:3,loc:"A Belt"},{round:6,loc:"Mid Boiler"},{round:9,loc:"B Snowman"}] },
  { id:"demo-9", map:"Pearl", agent:"Omen", side:"attack", score:"13-11", won:true, rank:"ascendant",
    teamComp:["Omen","Fade","Neon","Killjoy","Chamber"], enemyComp:["Jett","Sova","Astra","Cypher","Raze"],
    deaths:[{round:2,loc:"A Main"},{round:4,loc:"Mid Doors"},{round:7,loc:"B Link"},{round:9,loc:"A Art"},{round:12,loc:"Mid Doors"}] },
  { id:"demo-10", map:"Split", agent:"Jett", side:"attack", score:"9-13", won:false, rank:"ascendant",
    teamComp:["Jett","Breach","Omen","Cypher","Raze"], enemyComp:["Reyna","Skye","Viper","Killjoy","Sage"],
    deaths:[{round:1,loc:"A Main"},{round:3,loc:"Mid Mail"},{round:4,loc:"A Main"},{round:6,loc:"B Heaven"},{round:7,loc:"A Ramp"},{round:9,loc:"A Main"},{round:11,loc:"Mid Mail"},{round:12,loc:"A Main"}] },
  { id:"demo-11", map:"Breeze", agent:"Killjoy", side:"defense", score:"13-8", won:true, rank:"ascendant",
    teamComp:["Killjoy","Sova","Viper","Jett","Skye"], enemyComp:["Reyna","Fade","Harbor","Cypher","Raze"],
    deaths:[{round:2,loc:"A Main"},{round:5,loc:"Mid Pillar"},{round:7,loc:"B Tunnel"},{round:10,loc:"A Hall"}] },
  { id:"demo-12", map:"Lotus", agent:"Chamber", side:"attack", score:"11-13", won:false, rank:"ascendant",
    teamComp:["Chamber","Fade","Omen","Killjoy","Raze"], enemyComp:["Jett","Sova","Harbor","Cypher","Sage"],
    deaths:[{round:2,loc:"A Main"},{round:3,loc:"C Mound"},{round:5,loc:"B Link"},{round:7,loc:"A Tree"},{round:9,loc:"A Main"},{round:11,loc:"C Mound"}] },
];

// ── Tarzanca / yasak doğrulayıcı (KB satır 687-716 + BANNED_PHRASES) ──
const TARZANCA = [
  /pre-?aim/i, /wide swing/i,
  /head\s+(at[ıi]yor|att[ıi]|buldu|buluyor|aç[ıi]s[ıi]n[ıi])/i,
  /swing yap[ıi]yor/i, /peek (yap[ıi]yor|ediyor)/i, /hold (ediyor|yap[ıi]yor)/i,
  /(stun|flash|molly|smoke|ult)\s+çekiyor/i, /\bop var\b/i, /pick al[ıi]yor/i,
];
function findViolations(text: string): string[] {
  const t = text.toLowerCase();
  const hits: string[] = [];
  for (const p of TARZANCA) { const m = t.match(p); if (m) hits.push(m[0]); }
  for (const b of BANNED_PHRASES) { if (t.includes(b.toLowerCase())) hits.push(b); }
  return [...new Set(hits)];
}

function systemPrompt(s: Spec, corrective: string): string {
  let kb = "";
  try { kb = loadKnowledge("report", { map: s.map, agent: s.agent, rank: s.rank, enemyAgents: s.enemyComp.filter(a => a && a !== "Unknown") }); } catch {}
  const knowledgePart = kb ? `\nKOÇLUK BİLGİ KAYNAĞI:\n${kb}\n` : "";
  return `${knowledgePart}Sen AIMLO'sun: Radiant seviye gerçek bir Valorant koçusun. VCT analisti gibi konuş, empatik değil — keskin ve spesifik.

DİL — ZORUNLU: Türkçe çıktı, sokak Türkçesi, sade. 'deployment/optimal/protocol' gibi corp yığını YASAK. Evrensel oyun terimleri İngilizce: peek, trade, retake, lurk, anchor, rotate, default, execute, fake, stack, smoke, flash, util, op, dash, spike, eco. ZAMAN-BAĞIMLI tavsiye YASAK (saniye/timer yok) — olay-bazlı konuş.
${buildPolicyBlock({ confidence: "high", tone: "strict", lang: "tr", includeDecisionRubric: true })}

🚫 TARZANCA — KESİNLİKLE YASAK (KB kuralı):
- "pre-aim" tüm formları → "açıyı tutuyor / aynı yere bakıyor"
- "head atıyor/attı/buldu", "head açısını tutuyor" → "kafadan vurdu / kafadan vuruyor"
- "peek yapıyor/ediyor" → "peek atıyor" ; "swing yapıyor" → "swing atıyor"
- "hold ediyor" → "açıyı tutuyor" ; "wide swing" → "geniş açıyla peek / geniş swing"
- "stun/flash/molly/smoke/ult çekiyor" → "...atıyor/açıyor"
- Generik YASAK: "dikkatli ol", "daha iyi oyna", "sabırlı ol", "aim'ini geliştir", "konsantre ol".

KURALLAR: Her cümle somut veri (ajan/pozisyon/round no/silah). Max 15 kelime/cümle, paragraf yok. "sen" hitabı. MİKRO-POZİSYON ZORUNLU (callout adı; "site"/"mid" tek başına yasak). Düşman iddiası SADECE tekrar eden pattern kanıtlıysa.${corrective}

ÇIKTI — SADECE geçerli JSON, tam şu alanlar:
{
  "summary": "neden kazanıldı/kaybedildi + skor + hayatta kalma + pattern (1-2 keskin cümle)",
  "mistake": "en çok tekrarlayan hata, round no + pozisyon + taktiksel neden + çözüm",
  "tendencies": "düşman pattern özeti, ajan + pozisyon bazlı",
  "adjustment": "min 2 spesifik değişiklik (A yap VEYA B yap), callout + ability",
  "bestRound": "round no + ne yaptın + neden işe yaradı",
  "decisionScore": "X/10 — kısa gerekçe",
  "rounds": [ { "deathLocation": "<verilen callout>", "deathAnalysis": "ne yanlış gitti + fix (1-2 cümle, callout zorunlu)", "enemyPatterns": "rakip eğilimi (kanıt varsa)", "nextRoundPlan": "somut sonraki-round planı" } ]
}
rounds dizisi, sana verilen ÖLÜM ROUND'larıyla AYNI SIRADA ve aynı sayıda olmalı. Markdown yok, sadece JSON.`;
}

function userPrompt(s: Spec): string {
  const lines = s.deaths.map(d => `  R${d.round}: ÖLDÜN — ${d.loc}`).join("\n");
  return `MAÇ VERİSİ (OCR truth):
Harita: ${s.map} | Ajan: ${s.agent} | Taraf: ${s.side === "attack" ? "Saldırı" : "Savunma"} | Skor: ${s.score} | Sonuç: ${s.won ? "GALİBİYET" : "MAĞLUBİYET"}
Takım: ${s.teamComp.join(", ")}
Düşman: ${s.enemyComp.join(", ")}

ÖLÜM ROUND'LARI (rounds dizisini bunlarla aynı sırada üret):
${lines}

Bu maç için raporu ve her ölüm round'u için feedback'i üret. Yalnızca verideki gerçeklere dayan.`;
}

async function callGPT(sys: string, usr: string): Promise<any> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "gpt-5-mini",
      max_completion_tokens: 2200,
      reasoning_effort: "low",
      response_format: { type: "json_object" },
      messages: [ { role: "system", content: sys }, { role: "user", content: usr } ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  const content = j.choices?.[0]?.message?.content;
  if (!content) throw new Error("boş yanıt");
  return JSON.parse(content);
}

async function genMatch(s: Spec): Promise<any> {
  let corrective = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const out = await callGPT(systemPrompt(s, corrective), userPrompt(s));
      const allText = [out.summary, out.mistake, out.tendencies, out.adjustment, out.bestRound,
        ...(out.rounds || []).flatMap((r: any) => [r.deathAnalysis, r.enemyPatterns, r.nextRoundPlan])]
        .filter(Boolean).join(" \n ");
      const viol = findViolations(allText);
      const okRounds = Array.isArray(out.rounds) && out.rounds.length === s.deaths.length;
      if (viol.length === 0 && okRounds) {
        // ölüm konumlarını garanti et (model bazen değiştirir)
        out.rounds = out.rounds.map((r: any, i: number) => ({ ...r, deathLocation: s.deaths[i].loc }));
        console.log(`  ✓ ${s.id} (deneme ${attempt})`);
        return out;
      }
      const probs = [
        viol.length ? `YASAK kelime kullandın: ${viol.join(", ")} — bunları KB karşılıklarıyla değiştir.` : "",
        !okRounds ? `rounds dizisi ${s.deaths.length} öğe olmalı (her ölüm round'u için).` : "",
      ].filter(Boolean).join(" ");
      corrective = `\n\n⚠ DÜZELTME (önceki denemede hata): ${probs}`;
      console.log(`  ↻ ${s.id} deneme ${attempt} reddedildi: ${probs.slice(0, 120)}`);
    } catch (e: any) {
      console.log(`  ! ${s.id} deneme ${attempt} hata: ${String(e.message).slice(0, 140)}`);
      corrective = "";
    }
  }
  throw new Error(`${s.id} 4 denemede üretilemedi`);
}

async function main() {
  console.log(`KB jeneratörü başlıyor — ${SPECS.length} maç, gpt-5-mini…`);
  const results: Record<string, any> = {};
  // 3'lü eşzamanlılık havuzu
  const queue = [...SPECS];
  async function worker() {
    while (queue.length) {
      const s = queue.shift()!;
      results[s.id] = await genMatch(s);
    }
  }
  await Promise.all([worker(), worker(), worker()]);

  const ordered: Record<string, any> = {};
  for (const s of SPECS) ordered[s.id] = results[s.id];

  const header = `// ════════════════════════════════════════════════════════════════════
//  AUTO-GENERATED — gen-demo.mts ile gpt-5-mini + GERÇEK KB'den üretildi.
//  Elle düzenleme; yeniden üretmek için: (backend) npx tsx gen-demo.mts
//  Koç-sesi ai-policy uyumlu; tarzanca/yasak kelime regex'iyle doğrulandı.
// ════════════════════════════════════════════════════════════════════
export type DemoRoundFb = { deathLocation: string; deathAnalysis: string; enemyPatterns: string; nextRoundPlan: string };
export type DemoMatchGen = { summary: string; mistake: string; tendencies: string; adjustment: string; bestRound: string; decisionScore: string; rounds: DemoRoundFb[] };
export const DEMO_GENERATED: Record<string, DemoMatchGen> = ${JSON.stringify(ordered, null, 2)};
`;
  const outPath = path.join(process.cwd(), "..", "aimlo-desktop", "src", "demoFeedback.generated.ts");
  fs.writeFileSync(outPath, header, "utf-8");
  console.log(`\n✅ Yazıldı: ${outPath}`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
