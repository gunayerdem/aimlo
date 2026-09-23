/**
 * EMPIRICAL REPORT-ROUTE EVAL HARNESS — KB brutal-audit Cycle 6 (2026-06-26)
 * ─────────────────────────────────────────────────────────────────────────
 * Reproduces the match-report (app/api/ai/report/route.ts) AI pipeline offline
 * and records the text a user would actually receive.
 *
 * ⚠ SADAKAT SÖZLEŞMESİ (B05, 2026-09-24 — OLCUM-ARACI-10/11/12/13/14):
 * Bu dosya eskiden route'un system prompt'unu ELLE kısaltıp kopyalıyordu
 * ("copied from report/route.ts:683-779" — 2.691 B'lık bayat anlık görüntü;
 * kapalı-kadro kuralı, VERİ-ETİKETİ yasağı, DÜŞMAN MODELİ, HARİTA OKUNAMADI
 * yoktu), user prompt'u elle yazılmış tek satırdı, çağrı 700 token'la katı
 * JSON.parse ediliyordu, son-işlem yalnız cleanCoachText'ti ve kalite-kapısı
 * refine'ı hiç yoktu. Artık HİÇBİR ŞEY kopyalanmaz — prod'un fonksiyonları:
 *   validateRequest            (lib/report-prompt)  — fixture gövdesi doğrulanır
 *   generateDeterministicReport(lib/report-prompt)  — prod'un fallback `stats`ı
 *   buildReportPrompts         (lib/report-prompt)  — system + user prompt
 *   buildReportRequestBody     (lib/report-prompt)  — REPORT_CALL (1400 token)
 *   parseReportJSON            (lib/report-prompt)  — fence/balanced parse
 *   finalizeReportFields       (lib/report-prompt)  — temizleyici + kapaklar
 *   maybeRefineReport          (lib/report-refine)  — kalite kapısı + refine
 * Sıra-kilidi: scripts/test-eval-fidelity.ts — her fixture için eval'in istek
 * gövdeleri (ana + refine) ve son metni GERÇEK POST handler'ınkiyle bayt-eşit.
 * Bilinçli farklar: ağ katmanı (route'taki 30 sn/10 sn AbortController yok),
 * oyuncu hafızası fixture'ın `memoryContext` alanından gelir (route'ta
 * lib/player-memory), maliyet ai_usage'a değil örnek dosyasına yazılır.
 *
 * KORPUS: evals/report-fixtures/*.json (ReportRequest = desktop düz gövdesi;
 * 3 TR + 4 EN, eski senaryoların aynı içerikli karşılığı — bkz. index.ts).
 *
 * RUN:  npx tsx scripts/eval-report.ts          (EVAL_ONLY=<id-öneki> alt küme)
 * OUT:  scripts/eval-out/report-samples.json   (+ konsol özeti)
 * Anahtar: OPENAI_API_KEY env ya da .env.local — YALNIZ main() içinde okunur
 * (modülü import eden testler anahtara/ağa dokunmaz).
 */
import * as fs from "fs";
import * as path from "path";
import {
  validateRequest,
  generateDeterministicReport,
  buildReportPrompts,
  buildReportRequestBody,
  parseReportJSON,
  finalizeReportFields,
  type ReportResponse,
} from "../lib/report-prompt";
import { maybeRefineReport, type RefineCallModel } from "../lib/report-refine";
import { REPORT_FIXTURES, type ReportFixture } from "../evals/report-fixtures";

export const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const FIELDS = ["summary", "mistake", "tendencies", "adjustment", "bestRound", "decisionScore"] as const;
type ReportText = Record<(typeof FIELDS)[number], string>;
const pickText = (r: ReportResponse): ReportText =>
  Object.fromEntries(FIELDS.map((k) => [k, r[k]])) as ReportText;

type Usage = { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } };

export type ReportEvalSample = {
  id: string;
  note: string;
  lang?: "tr" | "en";
  map?: string;
  agent?: string;
  side?: string;
  /** buildReportPrompts'un policy bloğuna verdiği güven (patterns.overallConfidence). */
  confidence?: string;
  sysBytes?: number;
  userBytes?: number;
  /** Ana çağrının finish_reason'ı ("http_<status>" = OpenAI hata döndü). */
  finish_reason?: string;
  /** false → prod bu durumda deterministik şablonu gösterirdi (parse/şekil/HTTP hatası). */
  aiGenerated?: boolean;
  /** parseReportJSON çıktısı (null = parse edilemedi). */
  raw?: unknown;
  /** Refine ÖNCESİ metin (yalnız refine alanı değiştirdiyse). */
  preRefine?: ReportText;
  /** Kullanıcıya giden metin (refine dahil). */
  final?: ReportText;
  qc?: { score: number; weakest: string | null };
  refined?: boolean;
  refineAttempted?: boolean;
  refine_finish_reason?: string | null;
  refinedField?: string | null;
  usage?: Usage | null;
  refineUsage?: Usage | null;
  error?: string;
};

/**
 * Tek fixture'ı prod zinciriyle koşar. `fetchImpl` testte sahte OpenAI'dır —
 * bu fonksiyon anahtar OKUMAZ, ağ yalnız verilen fetchImpl'den geçer.
 */
export async function runReportFixture(
  fx: ReportFixture,
  deps: { apiKey: string; fetchImpl: typeof fetch },
): Promise<ReportEvalSample> {
  const v = validateRequest(fx.body);
  if (!v.valid) return { id: fx.id, note: fx.note, error: `validateRequest: ${v.error}` };
  const body = v.data;
  const stats = generateDeterministicReport(body);
  const { systemPrompt, userPrompt, confidence } = buildReportPrompts(body, { memoryContext: fx.memoryContext ?? "" });
  const post = (payload: unknown) =>
    deps.fetchImpl(OPENAI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${deps.apiKey}` },
      body: JSON.stringify(payload),
    });

  let report: ReportResponse;
  let raw: unknown = null;
  let finishReason: string;
  let usage: Usage | null = null;
  const res = await post(buildReportRequestBody(systemPrompt, userPrompt));
  if (!res.ok) {
    // prod: !response.ok → stats (aiGenerated=false); eval aynısını ölçer.
    finishReason = `http_${res.status}`;
    report = { ...stats };
  } else {
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content || "";
    finishReason = data?.choices?.[0]?.finish_reason ?? "unknown";
    usage = (data?.usage as Usage | undefined) ?? null;
    raw = parseReportJSON(text);
    report = (raw === null ? null : finalizeReportFields(raw, body, stats)) ?? { ...stats };
  }

  let refineUsage: Usage | null = null;
  const refineCall: RefineCallModel = async (requestBody) => {
    const rr = await post(requestBody);
    if (!rr.ok) return null;
    const rd = await rr.json();
    refineUsage = (rd?.usage as Usage | undefined) ?? null;
    return { content: rd?.choices?.[0]?.message?.content, finishReason: rd?.choices?.[0]?.finish_reason };
  };
  const before = pickText(report);
  const refine = await maybeRefineReport(report, body, refineCall);

  return {
    id: fx.id,
    note: fx.note,
    lang: body.lang,
    map: body.setup.map,
    agent: body.setup.agent,
    side: body.setup.side,
    confidence,
    sysBytes: Buffer.byteLength(systemPrompt, "utf8"),
    userBytes: Buffer.byteLength(userPrompt, "utf8"),
    finish_reason: finishReason,
    aiGenerated: report.aiGenerated,
    raw,
    ...(refine.refined ? { preRefine: before } : {}),
    final: pickText(report),
    qc: { score: refine.qcScore, weakest: refine.weakest },
    refined: refine.refined,
    refineAttempted: refine.attempted,
    refine_finish_reason: refine.finishReason ?? null,
    refinedField: refine.refined ? refine.weakest : null,
    usage,
    refineUsage,
  };
}

function loadApiKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const raw = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  }
  throw new Error("OPENAI_API_KEY not found");
}

async function main() {
  const apiKey = loadApiKey();
  const only = process.env.EVAL_ONLY;
  const fixtures = only ? REPORT_FIXTURES.filter((f) => f.id.startsWith(only)) : REPORT_FIXTURES;
  const results: ReportEvalSample[] = [];
  console.log(`\n══════ REPORT EMPIRICAL EVAL — ${fixtures.length} match reports (prod zinciri) ══════\n`);
  for (const fx of fixtures) {
    process.stdout.write(`[${fx.id}] generating... `);
    try {
      const s = await runReportFixture(fx, { apiKey, fetchImpl: fetch });
      results.push(s);
      console.log(s.error
        ? `FAILED: ${s.error}`
        : `done (sys=${s.sysBytes}b finish=${s.finish_reason} ai=${s.aiGenerated} qc=${s.qc?.score} refined=${s.refined}${s.refined ? `:${s.refinedField}` : ""})`);
    } catch (e) {
      console.log(`FAILED: ${(e as Error).message}`);
      results.push({ id: fx.id, note: fx.note, error: (e as Error).message });
    }
  }
  const outDir = path.join(process.cwd(), "scripts", "eval-out");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "report-samples.json"), JSON.stringify(results, null, 2), "utf8");

  console.log(`\n══════ FINAL REPORT TEXT (prod son-işlem + refine) ══════\n`);
  for (const r of results) {
    if (r.error || !r.final) { console.log(`\n### ${r.id} — ERROR: ${r.error}`); continue; }
    console.log(`\n### ${r.id}  (finish=${r.finish_reason}, ai=${r.aiGenerated}, qc=${r.qc?.score}, refined=${r.refined ? r.refinedField : "no"})`);
    for (const k of FIELDS) console.log(`  ${k}: ${r.final[k]}`);
  }
  const ok = results.filter((r) => !r.error);
  console.log(`\nÖZET: ${ok.length}/${results.length} örnek · aiGenerated=${ok.filter((r) => r.aiGenerated).length} · finish=stop ${ok.filter((r) => r.finish_reason === "stop").length} · refine denendi ${ok.filter((r) => r.refineAttempted).length} / kabul ${ok.filter((r) => r.refined).length}`);
  console.log(`\n✅ wrote ${path.join(outDir, "report-samples.json")}\n`);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
