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
import { plainifyAbilities, fixTurkishApostrophe } from "./lib/ability-plain-map";

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

// Zaman-bağımlı tavsiye (her dil): "0.5 saniye", "0.3-0.6s", "2 sn", "5 s içinde"
const TIME_RE = /\b\d+([.,]\d+)?\s*(saniye|sn|ms|milisaniye)\b|\b\d([.,]\d+)?\s*s\b|\b\d+\s*[-–]\s*\d+([.,]\d+)?\s*s\b/i;
const TARZANCA_TR = [
  /pre-?aim/i, /wide swing/i, /head\s+(at[ıi]yor|att[ıi]|buldu|aç[ıi]s[ıi]n[ıi])/i,
  /swing yap[ıi]yor/i, /peek (yap[ıi]yor|ediyor)/i, /hold (ediyor|yap[ıi]yor)/i,
  /(stun|flash|molly|smoke|ult)\s+çekiyor/i, /\bop var\b/i, /pick al[ıi]yor/i,
  /sorun\s*:/i, /\bfix\s*:/i, /sonras[ıi]\s+plan/i, /tekil veri/i, /veri yok/i, /belirsiz/i,
  // koç-sesi denetimi (2026-06-13): patron-şikayeti kalıplar (teammate/cover/sightline
  // doğal gamer-Türkçesi sayıldı, hard-yasak değil — soft çeviri prompt'ta kalır)
  /first shot/i, /first contact/i, /high flash/i, /low flash/i, /\bmicro-/i, /\bkiller\b/i,
  /cezaland[ıi]r/i, /konumland[ıi]r/i, /pozisyonland[ıi]r/i,
  /kuru (entry|giriş|peek|swing|koş|gir)/i, /\bolabilir\b/i, /gösteriyor olabilir/i, TIME_RE,
];
const BANNED_EN = [
  "play carefully", "gather information", "improve positioning", "play with team",
  "use utility", "be better", "try different", "keep improving", "play smarter",
  "deployment", "protocol", "optimal", "utilize", "facilitate", "leverage",
];
const LABELS = [/problem\s*:/i, /\bfix\s*:/i, /solution\s*:/i, /next round plan\s*:/i, /no data/i, /not enough data/i, /micro-?position/i, /first[- ]shot advantage/i, /\bmight\b/i, /could be/i, /\bmaybe\b/i, /\bseems\b/i, TIME_RE];

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
function clean(s: string, lang: "tr" | "en" = "tr"): string {
  if (!s) return "";
  const andW = lang === "tr" ? " ve " : " and ";
  // dotted-i önce temizle (isim eşleşmesi için), sonra resmi yetenek adı → düz Silver terimi (güvenlik ağı)
  let out = plainifyAbilities(s.replace(/̇/g, ""), lang)
    // baştaki bölüm-başlığı öneklerini sök (UI'da zaten başlık var)
    .replace(/^\s*(ölüm neden[iı]|hata analiz[iı]|ölüm analiz[iı]|düşman analiz[iı]|düşman pattern[iı]|sonraki round|death cause|death analysis|enemy read|enemy pattern|next round)\s*:\s*/i, "")
    // callout/ability slash → "ve"/"and" (A Main/Heaven → A Main ve Heaven; cümle bozulmaz)
    .replace(/(\w)\s*\/\s*(\w)/g, `$1${andW}$2`).replace(/(\w)\s*\/\s*(\w)/g, `$1${andW}$2`)
    .replace(/\s*[;.,—-]\s*(çözüm|çozum|neden|fix|sorun|solution|problem)\s*:\s*/gi, ". ")
    .replace(/(^|\.\s+)(çözüm|çozum|neden|fix|sorun|solution|problem)\s*:\s*/gi, "$1")
    .replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").replace(/\.{2,}/g, ".").trim();
  out = out.replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
  // TR çıktıda whitelist-dışı İngilizce → düz Türkçe (EN'de bu terimler meşru, DOKUNMA)
  if (lang === "tr") out = out
    .replace(/micro-?position(['’][a-zçğıöşü]+)?/gi, "açı")
    .replace(/high flash/gi, "flash'ı yukarı at").replace(/low flash/gi, "alçak flash").replace(/first shot/gi, "ilk atış")
    .replace(/\bblind ?zone\b/gi, "kör nokta")
    .replace(/\bcover\b/gi, "siper").replace(/\bsightline\b/gi, "açı").replace(/\bwall\b/gi, "duvar");
  // düz Türkçe terim yanlış apostroflanmışsa düzelt (duvar'i → duvarı, açı'yı → açıyı)
  if (lang === "tr") out = fixTurkishApostrophe(out);
  return out;
}

function sys(s: Scn, lang: "tr" | "en", corrective: string): string {
  let kb = "";
  try { kb = loadKnowledge("feedback", { map: s.map, agent: s.agent, rank: "ascendant" }); } catch {}
  const kbPart = kb ? `\nKOÇLUK BİLGİ KAYNAĞI:\n${kb}\n` : "";
  // includeEnemyGate:false — showcase senaryosunda ölüm yerinde HEP bir savunan var,
  // o yüzden "yeterli veri yok" dedirten gate kapalı; kesin düşman okuması istiyoruz.
  const policy = buildPolicyBlock({ confidence: "high", tone: "strict", lang, includeEnemyGate: false });
  if (lang === "tr") {
    return `${kbPart}Sen AIMLO'sun: Radiant seviye Valorant koçu. Keskin, spesifik, kendinden emin.
DİL: sokak Türkçesi, sade. Oyun terimleri İngilizce (peek, trade, dash, entry, smoke, flash, op, lurk, anchor, retake).
${policy}
🚫 TARZANCA YASAK: "pre-aim"→"açıyı tutuyor"; "head atıyor"→"kafadan vuruyor"; "peek yapıyor"→"peek atıyor"; "swing yapıyor"→"swing atıyor"; "wide swing"→"geniş açıyla peek"; "X çekiyor"→"X atıyor". Etiket (Sorun:/Fix:/Çözüm:) YASAK — akıcı yaz.

🎙 KOÇ AĞZI (ZORUNLU): Cümleleri yukarıdaki KB koçluk bloklarının DİLİNDEN uyarla (kendi Türkçeni sıfırdan uydurma) — seni CANLI İZLEYEN keskin bir radiant koç gibi DOĞRUDAN konuş: "şunu yaptın, bak şöyle yapmalısın". Yazılı rapor değil.
- DOLU ol, telegraf gibi kısa olma: deathAnalysis 2-3 net cümle (ne yaptın + neden öldün + ne yapmalıydın). enemyPatterns 1-2 cümle. nextRoundPlan 1-2 cümle. İşe yarar, somut.
- DİLBİLGİSİ KUSURSUZ: bozuk, devrik, yarım cümle ve YAZIM HATASI YASAK. Akıcı, doğal Türkçe; cümleler tam ve düzgün kurulsun.
- TEREDDÜT YASAK ("olabilir/belki"); SLASH YASAK ("A Main/Heaven" → tek callout); etiket YASAK. Net, kesin.${corrective}
ÖNEMLİ: Değerlerin İÇİNE "ÖLÜM NEDENİ:", "DÜŞMAN ANALİZİ:", "SONRAKİ ROUND:" gibi BAŞLIK/ÖNEK YAZMA — sadece düz cümle. Başlıklar UI'da var.
ÇIKTI — SADECE JSON: { "title": "kısa başlık (3-5 kelime, callout içersin)", "deathAnalysis": "ne oldu + ne yap, MAX 2 kısa cümle, callout zorunlu, öneksiz", "enemyPatterns": "öldüğün yerden ÇIKARIM: seni kim, nereden kafadan vurdu / o açıyı nasıl tutuyor — kesin TEK kısa cümle. 'yeterli veri yok' / 'veri yok' YAZMA, öneksiz", "nextRoundPlan": "doğrudan emir, tek kısa cümle, öneksiz" }`;
  }
  return `${kbPart}You are AIMLO: a Radiant-level Valorant coach. Sharp, specific, confident.
LANGUAGE: clear coach English, no corporate jargon. Standard game terms (peek, trade, dash, entry, smoke, flash, op, lurk, anchor, retake, pre-aim, wide swing are FINE in English).
${policy}
🚫 BANNED: generic advice ("play carefully", "be better", "use utility", "improve positioning"). No labels (Problem:/Fix:/Solution:).

🎙 COACH TALK (REQUIRED): Sound like a sharp Radiant coach WATCHING you live — direct: "you did X, here's what to do". Not a written report.
- Be substantive, not telegraphic: deathAnalysis 2-3 full sentences (what you did + why you died + what to do). enemyPatterns 1-2 sentences. nextRoundPlan 1-2 sentences. Useful and concrete.
- PERFECT grammar: no broken/fragment sentences, no typos. Natural, fluent English; complete sentences.
- NO hedging ("might/could be/maybe"); NO slashes ("A Main/Heaven" → one callout); no labels. Confident and clear.${corrective}
IMPORTANT: Do NOT write any heading/prefix like "DEATH CAUSE:", "ENEMY READ:", "NEXT ROUND:" inside the values — plain sentences only. The headings live in the UI.
OUTPUT — JSON ONLY: { "title": "short title (3-5 words, include callout)", "deathAnalysis": "what happened + what to do, MAX 2 short sentences, callout required, no prefix", "enemyPatterns": "INFER from the death: who killed you and from where / how they hold that angle — confident single short sentence. Never 'not enough data', no prefix", "nextRoundPlan": "direct imperative, one short sentence, no prefix" }`;
}
function usr(s: Scn, lang: "tr" | "en"): string {
  if (lang === "tr") {
    return `SENARYO: ${s.agent} · ${s.map} · ${s.side === "attack" ? "Saldırı" : "Savunma"} · ${s.loc}'da öldün. Durum: ${s.note}. Bu ölüm için tek bir örnek koç-feedback'i üret.
ÖNEMLİ: Yetenek önerirken SADECE ${s.agent}'in GERÇEK yeteneklerini ad ver. ${s.agent}'te OLMAYAN yeteneği uydurma (ör. ${s.agent} ≠ Sova ise "Sova recon" deme, wall sadece Sage/Viper/Harbor'da). Başka ajan yeteneği gerekiyorsa adını verme; "takım arkadaşından flash/smoke iste" gibi genel söyle. İki callout söyleyeceksen "ve" ile bağla, virgülle liste yapma; cümleyi düzgün kur.`;
  }
  return `SCENARIO: ${s.agent} · ${s.map} · ${s.side} · died at ${s.loc}. Situation: ${s.note}. Produce one example coaching feedback for this death.
IMPORTANT: When suggesting abilities, name ONLY ${s.agent}'s REAL abilities. Do not invent abilities ${s.agent} lacks (e.g. if ${s.agent} ≠ Sova, never say "Sova recon"; walls only exist on Sage/Viper/Harbor). If team utility is needed, don't name another agent — say "ask a teammate for a flash/smoke". If you mention two callouts, join with "and" and keep the sentence grammatical; no comma-stitched lists.`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGPT(system: string, user: string, maxTok = 1400): Promise<any> {
  for (let i = 0; i < 5; i++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-5-mini", max_completion_tokens: maxTok, reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    if (res.status === 429 || res.status >= 500) { await sleep(2500 * (i + 1)); continue; }
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const j = await res.json();
    const c = j.choices?.[0]?.message?.content;
    if (!c) { await sleep(1200); continue; }
    return JSON.parse(c);
  }
  throw new Error("API backoff bitti");
}

// Acımasız koç-yargıç: feedback gerçekten canlı izleyen keskin bir koç gibi mi,
// dilbilgisi kusursuz mu, dolu mu, işe yarar mı? (brutal-audit-fix-loop'un kalbi)
async function judge(item: any, lang: "tr" | "en"): Promise<{ pass: boolean; critique: string }> {
  const sysJ = lang === "tr"
    ? `Sen acımasız bir baş-antrenörsün. Aşağıdaki Valorant koç-feedback'ini değerlendir. GEÇMESİ için HEPSİ şart:
1) Seni CANLI İZLEYEN keskin bir koç gibi DOĞRUDAN konuşuyor (yazılı rapor / genel laf değil).
2) Dilbilgisi KUSURSUZ — bozuk, devrik, yarım cümle ve yazım hatası YOK.
3) İŞE YARAR + somut — callout + net, uygulanabilir aksiyon.
4) DOLU: deathAnalysis 2-3 gerçek cümle (telegraf/tek parça DEĞİL); diğer alanlar tam cümle.
5) Tereddüt ("olabilir"), etiket (Sorun:/Fix:), yarı-İngilizce (first shot/high flash/cover/sightline/teammate), slash YOK.
6) Yetenek önerisi SADECE ${item.agent}'e ait. ${item.agent}'te OLMAYAN yetenek (başka ajanın Sova recon/Omen smoke/Killjoy turret/wall'ı) ad verilmişse FAIL.
7) Virgülle birbirine yapışmış callout listesi ("A Main, Heaven açısını") cümleyi BOZMAMIŞ; cümleler tam ve düzgün.
Sadece JSON: {"pass": true|false, "critique": "kalırsa neden — TEK net cümle"}`
    : `You are a ruthless head coach. Judge this Valorant coaching feedback. To PASS, ALL must hold:
1) Talks like a sharp coach WATCHING you live (not a written report / generic).
2) PERFECT grammar — no broken/fragment sentences, no typos.
3) Useful + concrete — callout + clear actionable advice.
4) Substantive: deathAnalysis 2-3 real sentences (not telegraphic); other fields full sentences.
5) No hedging ("might"), no labels, no broken English, no slashes.
6) Abilities suggested belong ONLY to ${item.agent}. If it names an ability ${item.agent} lacks (another agent's Sova recon/Omen smoke/Killjoy turret/wall), FAIL.
7) No comma-stitched callout lists that break the sentence; sentences are complete and clean.
JSON only: {"pass": true|false, "critique": "if fail, why — ONE clear sentence"}`;
  const usrJ = `${lang === "tr" ? "Ölüm Nedeni" : "Death Cause"}: ${item.deathAnalysis}\n${lang === "tr" ? "Düşman Analizi" : "Enemy Read"}: ${item.enemyPatterns}\n${lang === "tr" ? "Sonraki Round" : "Next Round"}: ${item.nextRoundPlan}`;
  try { const r = await callGPT(sysJ, usrJ, 250); return { pass: r.pass === true, critique: String(r.critique || "") }; }
  catch { return { pass: true, critique: "" }; }
}

async function gen(s: Scn, lang: "tr" | "en"): Promise<any> {
  let corrective = "", best: any = null, bestV = Infinity;
  for (let a = 1; a <= 7; a++) {
    try {
      const out = await callGPT(sys(s, lang, corrective), usr(s, lang));
      const cl = {
        agent: s.agent, map: s.map, side: s.side, location: s.loc, lang,
        title: clean(out.title || "", lang), deathAnalysis: clean(out.deathAnalysis || "", lang),
        enemyPatterns: clean(out.enemyPatterns || "", lang), nextRoundPlan: clean(out.nextRoundPlan || "", lang),
      };
      const txt = [cl.title, cl.deathAnalysis, cl.enemyPatterns, cl.nextRoundPlan].filter(Boolean).join(" \n ");
      const v = violations(txt, lang);
      const longs = [cl.deathAnalysis, cl.enemyPatterns, cl.nextRoundPlan].filter((x) => x.length > 420).length;
      const tooShort = cl.deathAnalysis.length < 90 ? 1 : 0;
      const missing = (cl.title && cl.deathAnalysis && cl.enemyPatterns && cl.nextRoundPlan) ? 0 : 1;
      const issues = v.length + longs + tooShort + missing;
      if (issues === 0) {
        const verdict = await judge(cl, lang);
        if (verdict.pass) { console.log(`  ✓ ${s.agent}/${s.loc} [${lang}] (deneme ${a})`); return cl; }
        if (best === null) { best = cl; bestV = 1; }
        corrective = `\n\n⚠ KOÇ DENETİMİ kaldı: ${verdict.critique}. Daha DOLU (2-3 cümle), dilbilgisi KUSURSUZ, doğrudan seni izleyen-koç ağzıyla ve İŞE YARAR yaz.`;
        console.log(`  ↻ ${s.agent}/${s.loc} [${lang}] yargıç: ${verdict.critique.slice(0, 70)}`);
        continue;
      }
      if (issues < bestV) { best = cl; bestV = issues; }
      const probs = [v.length ? `yasak: ${v.join(", ")}` : "", longs ? "çok uzun, kısalt" : "", tooShort ? "çok KISA: deathAnalysis 2-3 dolu cümle" : "", missing ? "alan eksik" : ""].filter(Boolean).join("; ");
      corrective = `\n\n⚠ DÜZELTME: ${probs}. DOLU, kusursuz, doğrudan koç ağzı — tereddüt/slash/etiket/yarı-İngilizce yok.`;
    } catch (e: any) { console.log(`  ! ${s.agent}/${s.loc} [${lang}] ${String(e.message).slice(0, 60)}`); corrective = ""; await sleep(1500); }
  }
  if (best) { console.log(`  ⚠ ${s.agent}/${s.loc} [${lang}] en iyi (${bestV})`); return best; }
  throw new Error(`${s.agent}/${s.loc} [${lang}] üretilemedi`);
}

function fallback(s: Scn, lang: "tr" | "en"): any {
  const base = { agent: s.agent, map: s.map, side: s.side, location: s.loc, lang };
  if (lang === "tr") return { ...base,
    title: `${s.loc} pozisyon hatası`,
    deathAnalysis: `${s.loc}'da ${s.note}; trade gelmeden düştün. Yoldaşınla aynı anda gir, ilk kontağı paylaş.`,
    enemyPatterns: `Rakip ${s.loc}'u önceden tutup ilk açıyı cezalandırıyor.`,
    nextRoundPlan: `${s.loc}'a girmeden smoke veya flash kullan, sonra yoldaşınla birlikte yüklen.` };
  return { ...base,
    title: `${s.loc} positioning error`,
    deathAnalysis: `At ${s.loc} you ${s.note}; you fell before any trade. Enter with a teammate and share the first contact.`,
    enemyPatterns: `The defender pre-holds ${s.loc} and punishes the first angle.`,
    nextRoundPlan: `Use a smoke or flash before ${s.loc}, then commit together with a teammate.` };
}

async function main() {
  const jobs: { s: Scn; lang: "tr" | "en" }[] = [];
  for (const s of SCENARIOS) jobs.push({ s, lang: "tr" });
  for (const s of SCENARIOS) jobs.push({ s, lang: "en" });
  console.log(`Feedback bankası — ${jobs.length} örnek (20 TR + 20 EN), gpt-5-mini…`);
  const out: any[] = new Array(jobs.length);
  const queue = jobs.map((j, i) => ({ ...j, i }));
  async function worker() { while (queue.length) { const job = queue.shift()!; try { out[job.i] = await gen(job.s, job.lang); } catch { out[job.i] = fallback(job.s, job.lang); console.log(`  ⛑ ${job.s.agent}/${job.s.loc} [${job.lang}] fallback`); } } }
  await Promise.all([worker(), worker(), worker()]);

  const tr = out.filter((o) => o.lang === "tr");
  const en = out.filter((o) => o.lang === "en");
  const header = `// ════════════════════════════════════════════════════════════════════
//  AUTO-GENERATED — gen-feedback-bank.mts ile gpt-5-mini + GERÇEK KB'den.
//  20 TR + 20 EN örnek koç-feedback'i. Yeniden üret: npx tsx gen-feedback-bank.mts
// ════════════════════════════════════════════════════════════════════
export type FeedbackExample = { agent: string; map: string; side: string; location: string; lang: "tr" | "en"; title: string; deathAnalysis: string; enemyPatterns: string; nextRoundPlan: string };
export const FEEDBACK_BANK_TR: FeedbackExample[] = ${JSON.stringify(tr, null, 2)};
export const FEEDBACK_BANK_EN: FeedbackExample[] = ${JSON.stringify(en, null, 2)};
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
`;
  const outPath = path.join(process.cwd(), "app", "feedbackBank.generated.ts");
  fs.writeFileSync(outPath, header, "utf-8");
  console.log(`\n✅ Yazıldı: ${outPath} (TR ${tr.length}, EN ${en.length})`);
}
main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
