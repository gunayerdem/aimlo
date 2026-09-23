/**
 * RAPOR EVAL SADAKATİ + KALİTE-KAPISI REFINE TESTİ — B05 (2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-eval-fidelity.ts   (exit 1 = kırık)
 *
 * [F] OLCUM-ARACI-10/11/12/13: scripts/eval-report.ts runReportFixture ↔ GERÇEK
 *     POST handler (scripts/report-route-harness.ts). Her fixture (evals/
 *     report-fixtures) için: validateRequest'ten geçer; eval'in OpenAI'a yolladığı
 *     gövde buildReportPrompts + buildReportRequestBody çıktısıyla ve route'un
 *     gövdesiyle BAYT-EŞİT (system/user prompt, 1400 token, minimal, json_object);
 *     refine gövdeleri de eşit; kullanıcıya giden 6 alan eval ile route'ta aynı.
 *     İçerik kilitleri: kapalı kadro kuralı, HARİTA OKUNAMADI, Data confidence /
 *     PLAYER SCORES satırları, Lotus'ta "A Short" final metinden silinir.
 * [R] OLCUM-ARACI-14: lib/report-refine.ts maybeRefineReport — route ve eval'in
 *     ORTAK kalite kapısı. Sahte callModel ile: qc<65 → en zayıf alan değişir;
 *     finish_reason!=="stop" → değişmez; callModel yok → çağrı yok; istisna →
 *     orijinal kalır; refine metnindeki yabancı-harita callout'u ("A Short",
 *     Lotus'ta YOK — lib/map-callouts.ts:9) ana alanlarla AYNI temizleyiciden silinir.
 * [C] OLCUM-ARACI-15: GERÇEK POST handler — refine yanıtı geldiğinde saveAiUsage
 *     İKİNCİ kez çağrılır (ana + refine = 2). Eskiden refine çağrısı ai_usage'a
 *     hiç yazılmıyordu (yalnız ana çağrı) → admin /cost rapor maliyetini eksik sayıyordu.
 *
 * ⚠ AĞ/AI/DB YOK: model yanıtları sahte (harness.replies); OPENAI_API_KEY sahte
 * bir dize, .env.local OKUNMAZ (eval-report anahtarı yalnız main()'de okur).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { harness, resetHarness, loadReportRoute, reportRequest, fakeFetch, type ModelReply } from "./report-route-harness";
import {
  validateRequest,
  generateDeterministicReport,
  buildReportPrompts,
  buildReportRequestBody,
  parseReportJSON,
  type ReportRequest,
  type ReportResponse,
} from "../lib/report-prompt";
import { maybeRefineReport, REFINE_CALL, REFINE_SYSTEM_PROMPT, type RefineRequestBody } from "../lib/report-refine";
import { runReportFixture } from "./eval-report";
import { REPORT_FIXTURES, type ReportFixture } from "../evals/report-fixtures";

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}
const show = (x: unknown) => JSON.stringify(x);
const FIELDS = ["summary", "mistake", "tendencies", "adjustment", "bestRound", "decisionScore"] as const;
const pick6 = (r: Record<string, unknown>) => Object.fromEntries(FIELDS.map((k) => [k, r[k]]));

function fixture(id: string): ReportFixture {
  const f = REPORT_FIXTURES.find((x) => x.id === id);
  if (!f) throw new Error(`fixture yok: ${id}`);
  return f;
}
function validated(fx: ReportFixture): ReportRequest {
  const v = validateRequest(fx.body);
  if (!v.valid) throw new Error(`fixture ${fx.id} geçersiz: ${v.error}`);
  return v.data;
}
/** Kalite kapısını kesin açan zayıf rapor (generic-detector yasak ifadeleri). */
function weakReport(body: ReportRequest): ReportResponse {
  return {
    ...generateDeterministicReport(body),
    summary: "İyi oyna.",
    mistake: "Dikkatli ol, daha iyi oyna, sabırlı ol.",
    adjustment: "Farklı dene.",
    aiGenerated: true,
  };
}
const REFINED_TR = "A Short'tan dönerken Chamber op seni A Main'de aldı; bir sonraki round A Main'e smoke ile gir ve trade için takım arkadaşını bekle.";
const WEAK_JSON = JSON.stringify({
  summary: "İyi oyna.", mistake: "Dikkatli ol, daha iyi oyna, sabırlı ol.", tendencies: "Düşman iyi oynadı.",
  adjustment: "Farklı dene.", bestRound: "Güzel round.", decisionScore: "5/10 — idare eder.",
});
/** Modelin "iyi" çıktısı — Lotus/Icebox'ta OLMAYAN "A Short" ham metinde bilerek var. */
function goodJson(lang: unknown): string {
  return JSON.stringify(lang === "en" ? {
    summary: "A Short: you lost the mid-rounds because the same angle killed you in R1, R3 and R9; 11-13.",
    mistake: "R1, R3, R9: you held the same spot alone and the Operator took the angle. Shift off that angle and set utility first.",
    tendencies: "The enemy Operator watches your default spot and flanks through the other lane after the first contact.",
    adjustment: "Use utility for info before you peek OR fall back a step; ask for a smoke on the Operator and swap your angle.",
    bestRound: "R5: you survived and won the round by waiting for the push instead of peeking first.",
    decisionScore: "5/10 — repeated deaths at the same spot, no trade setup.",
  } : {
    summary: "A Short: aynı açıda R1, R3 ve R9'da öldün; skor 11-13.",
    mistake: "R1, R3, R9: aynı yeri tek başına tuttun ve Operator açıyı aldı. Açını değiştir, önce yetenekle bilgi al.",
    tendencies: "Rakip Operator varsayılan yerine bakıyor, ilk temastan sonra diğer koridordan dolanıyor.",
    adjustment: "Peek atmadan önce yetenekle bilgi al YA DA bir adım geri çekil; Operator'a smoke iste ve açını değiştir.",
    bestRound: "R5: peek atmak yerine itişi bekledin, hayatta kaldın ve round'u aldın.",
    decisionScore: "5/10 — aynı yerde tekrar eden ölümler, trade kurulumu yok.",
  });
}
const mainUsage = { prompt_tokens: 5100, completion_tokens: 640, prompt_tokens_details: { cached_tokens: 1024 } };
const refineUsage = { prompt_tokens: 410, completion_tokens: 95 };

async function runBoth(fx: ReportFixture, replies: ModelReply[]) {
  resetHarness();
  harness.replies = replies.map((r) => ({ ...r }));
  harness.memoryContext = fx.memoryContext;
  const sample = await runReportFixture(fx, { apiKey: "sk-test-harness-not-real", fetchImpl: fakeFetch });
  const evalBodies = harness.fetchCalls.map((c) => c.body);

  resetHarness();
  harness.replies = replies.map((r) => ({ ...r }));
  harness.memoryContext = fx.memoryContext;
  process.env.OPENAI_API_KEY = "sk-test-harness-not-real";
  const res = await loadReportRoute().POST(reportRequest(fx.body));
  const routeJson = await res.json() as Record<string, unknown>;
  const routeBodies = harness.fetchCalls.map((c) => c.body);
  delete process.env.OPENAI_API_KEY;
  return { sample, evalBodies, routeJson, routeBodies, status: res.status };
}

async function main() {
  // ── [F] eval ↔ prod paritesi ─────────────────────────────────────────────
  console.log("\n── [F] eval-report ↔ GERÇEK route paritesi (OLCUM-ARACI-10/11/12/13) ──");
  const tr = REPORT_FIXTURES.filter((f) => f.body.lang === "tr").length;
  const en = REPORT_FIXTURES.filter((f) => f.body.lang === "en").length;
  check(`fixture seti: 3 TR + 4 EN (eski senaryoların karşılığı) — ${tr} TR + ${en} EN`, tr === 3 && en === 4);
  for (const fx of REPORT_FIXTURES) {
    const v = validateRequest(fx.body);
    check(`${fx.id}: validateRequest'ten geçer`, v.valid, v.valid ? "" : v.error);
    if (!v.valid) continue;
    const { systemPrompt, userPrompt } = buildReportPrompts(v.data, { memoryContext: fx.memoryContext });
    const expected = JSON.stringify(buildReportRequestBody(systemPrompt, userPrompt));
    for (const variant of ["iyi", "zayıf→refine"] as const) {
      const replies: ModelReply[] = variant === "iyi"
        ? [{ content: goodJson(fx.body.lang), usage: mainUsage }, { content: REFINED_TR, finishReason: "stop", usage: refineUsage }]
        : [{ content: WEAK_JSON, usage: mainUsage }, { content: REFINED_TR, finishReason: "stop", usage: refineUsage }];
      const { sample, evalBodies, routeJson, routeBodies, status } = await runBoth(fx, replies);
      const tag = `${fx.id} [${variant}]`;
      check(`${tag}: eval ana gövdesi = buildReportPrompts + buildReportRequestBody (bayt-eşit)`,
        JSON.stringify(evalBodies[0]) === expected, `eval=${JSON.stringify(evalBodies[0] ?? null).length}b beklenen=${expected.length}b`);
      check(`${tag}: route ana gövdesi = eval ana gövdesi (bayt-eşit)`,
        status === 200 && JSON.stringify(routeBodies[0]) === JSON.stringify(evalBodies[0]), `status=${status}`);
      check(`${tag}: refine çağrı sayısı ve gövdeleri eşit (${evalBodies.length - 1} refine)`,
        evalBodies.length === routeBodies.length && evalBodies.every((b, i) => JSON.stringify(b) === JSON.stringify(routeBodies[i])),
        `eval=${evalBodies.length} route=${routeBodies.length}`);
      check(`${tag}: kullanıcıya giden 6 alan + aiGenerated eval = route`,
        show(sample.final) === show(pick6(routeJson)) && sample.aiGenerated === routeJson.aiGenerated,
        `eval.summary="${String(sample.final?.summary).slice(0, 60)}" route.summary="${String(routeJson.summary).slice(0, 60)}"`);
      if (variant === "zayıf→refine") {
        check(`${tag}: eval refine'ı kaydetti (qc<65, refined, finish=stop)`,
          !!sample.qc && sample.qc.score < 65 && sample.refined === true && sample.refine_finish_reason === "stop" && !!sample.refinedField, show(sample.qc));
      }
    }
  }

  console.log("\n── [F] içerik kilitleri (eval'in yolladığı prompt'ta) ──");
  {
    resetHarness();
    const r1 = fixture("R1-ascent-cypher-def-loss");
    harness.replies = [{ content: goodJson("tr"), usage: mainUsage }];
    const s = await runReportFixture(r1, { apiKey: "sk-test-harness-not-real", fetchImpl: fakeFetch });
    const b = harness.fetchCalls[0].body as { model: string; max_completion_tokens: number; reasoning_effort: string; response_format: { type: string }; messages: { role: string; content: string }[] };
    const sys = b.messages[0].content;
    const usr = b.messages[1].content;
    check("max_completion_tokens 1400 (eski eval 700 — finish=length rejimi)", b.max_completion_tokens === 1400, `got=${b.max_completion_tokens}`);
    check("model gpt-5-mini · reasoning_effort minimal · response_format json_object",
      b.model === "gpt-5-mini" && b.reasoning_effort === "minimal" && b.response_format?.type === "json_object");
    check("enemyComp fixture → 'DÜŞMAN KADROSU KAPALI LİSTEDİR' + kadro adları",
      sys.includes("DÜŞMAN KADROSU KAPALI LİSTEDİR — bu maçta yalnız şu ajanlar vardı: Jett, Sova, Omen, Killjoy, Reyna"));
    check("prod'un eval'de eksik olan blokları geldi (VERİ-ETİKETİ YASAK, DÜŞMAN MODELİ, VERİ KAYNAKLARI)",
      sys.includes("VERİ-ETİKETİ YASAK") && sys.includes("DÜŞMAN MODELİ (ZORUNLU)") && sys.includes("VERİ KAYNAKLARI"));
    check("user prompt prod biçiminde: '- Data confidence:' + 'PLAYER SCORES:' + 'IMPROVEMENT FOCUS:'",
      usr.includes("- Data confidence:") && usr.includes("PLAYER SCORES:") && usr.includes("IMPROVEMENT FOCUS:"));
    check("round özeti prod biçiminde (died@ + killedBy= + (alive))",
      usr.includes("R1: loss died@B Main killedBy=Jett/operator") && usr.includes("R5: win (alive)"), usr.split("\n").slice(3, 6).join(" | "));
    check("örnek kaydı: finish_reason + aiGenerated + qc yazıldı", s.finish_reason === "stop" && s.aiGenerated === true && typeof s.qc?.score === "number");
  }
  {
    resetHarness();
    const r1 = fixture("R1-ascent-cypher-def-loss");
    const noMap: ReportFixture = { ...r1, id: "R1-unknown-map", body: { ...r1.body, map: undefined } };
    harness.replies = [{ content: goodJson("tr"), usage: mainUsage }];
    const s = await runReportFixture(noMap, { apiKey: "sk-test-harness-not-real", fetchImpl: fakeFetch });
    const sys = (harness.fetchCalls[0].body as { messages: { content: string }[] }).messages[0].content;
    check("map yok → validateRequest 'Unknown' → 'HARİTA OKUNAMADI' kuralı", s.map === "Unknown" && sys.includes("HARİTA OKUNAMADI"));
  }
  {
    const r1 = fixture("R1-ascent-cypher-def-loss");
    const withMem: ReportFixture = { ...r1, id: "R1-memory", memoryContext: "OYUNCU HAFIZASI: son 5 maçta B Main'de 7 ölüm." };
    const { evalBodies, routeBodies } = await runBoth(withMem, [{ content: goodJson("tr"), usage: mainUsage }]);
    const usr = (evalBodies[0] as { messages: { content: string }[] }).messages[1].content;
    check("memoryContext eval ve route'ta aynı yere, aynı metinle girer",
      usr.includes("OYUNCU HAFIZASI: son 5 maçta B Main'de 7 ölüm.") && JSON.stringify(evalBodies[0]) === JSON.stringify(routeBodies[0]));
  }
  {
    resetHarness();
    const lotus = fixture("R3-lotus-omen-atk-close");
    harness.replies = [{ content: goodJson("tr"), usage: mainUsage }];
    const s = await runReportFixture(lotus, { apiKey: "sk-test-harness-not-real", fetchImpl: fakeFetch });
    const rawSummary = String((s.raw as Record<string, unknown>)?.summary ?? "");
    check("Lotus + ham 'A Short' → final metinde YOK (realityCheck/stripForeignCallouts)",
      rawSummary.includes("A Short") && !/A Short/i.test(String(s.final?.summary)), `final="${s.final?.summary}"`);
  }
  {
    const obj = JSON.parse(goodJson("tr"));
    const fenced = "```json\n" + goodJson("tr") + "\n```";
    const trailing = "Sonuç: " + goodJson("tr") + " — bitti {";
    check("parseReportJSON: fence'li ve sonda-metinli girdi = JSON.parse(iç)",
      show(parseReportJSON(fenced)) === show(obj) && show(parseReportJSON(trailing)) === show(obj) && parseReportJSON("{ bozuk") === null);
  }
  {
    const evalSrc = fs.readFileSync(path.join(__dirname, "eval-report.ts"), "utf8");
    check("eval-report elle ayna taşımıyor (buildSystemPrompt / 700 token / cleanCoachText-only yok; prod lib import'lu)",
      !/function buildSystemPrompt\(/.test(evalSrc) && !/max_completion_tokens:\s*700/.test(evalSrc) && !/cleanCoachText\(/.test(evalSrc)
        && evalSrc.includes('from "../lib/report-prompt"') && evalSrc.includes('from "../lib/report-refine"'));
  }

  // ── [R] ortak kalite kapısı ──────────────────────────────────────────────
  const lotus = validated(fixture("R3-lotus-omen-atk-close"));
  console.log("\n── [R] maybeRefineReport — ortak kalite kapısı (OLCUM-ARACI-14) ──");
  {
    const rep = weakReport(lotus);
    const before = { ...rep };
    const calls: RefineRequestBody[] = [];
    const out = await maybeRefineReport(rep, lotus, async (b) => { calls.push(b); return { content: `  ${REFINED_TR}  `, finishReason: "stop" }; });
    const w = out.weakest as keyof ReportResponse | null;
    check("qc < 65 → kapı açıldı, model 1 kez çağrıldı", out.qcScore < 65 && out.attempted && calls.length === 1, show(out));
    check("en zayıf alan DEĞİŞTİ (refined=true)", !!w && out.refined && rep[w] !== before[w], `${w}: ${String(w && rep[w]).slice(0, 80)}`);
    check("diğer alanlar dokunulmadı", FIELDS.filter((k) => k !== w).every((k) => rep[k] === before[k]));
    check("refine metnindeki Lotus-dışı 'A Short' temizleyiciden silindi", !!w && !/A Short/i.test(String(rep[w])) && /A Main/.test(String(rep[w])), String(w && rep[w]));
    const b = calls[0];
    check(`refine gövdesi REFINE_CALL (model ${REFINE_CALL.model}, max ${REFINE_CALL.maxCompletionTokens}, effort ${REFINE_CALL.reasoningEffort})`,
      b.model === "gpt-5-mini" && b.max_completion_tokens === 500 && b.reasoning_effort === "minimal" && !("response_format" in b), show({ ...b, messages: undefined }));
    check("sistem mesajı olgu-bağlı refine metni", b.messages[0].role === "system" && b.messages[0].content === REFINE_SYSTEM_PROMPT);
    const u = b.messages[1].content;
    check("refine prompt'u ölçülen olguları taşır (harita/kadro/konum/skor)",
      u.includes("- Harita: Lotus") && u.includes("- Düşman kadrosu: Chamber, Killjoy, Viper, Fade, Sage") && u.includes("- Ölüm konumları: A Main, C Site") && u.includes("- Skor: 13-11"), u.slice(0, 300));
  }
  {
    const rep = weakReport(lotus);
    const before = { ...rep };
    const out = await maybeRefineReport(rep, lotus, async () => ({ content: `${REFINED_TR} ve sonra rotasy`, finishReason: "length" }));
    check("finish_reason 'length' → alan DEĞİŞMEZ (yarım metin basılmaz)", out.attempted && !out.refined && out.finishReason === "length" && show(rep) === show(before), show(out));
  }
  {
    const rep = weakReport(lotus);
    const before = { ...rep };
    const out = await maybeRefineReport(rep, lotus, null);
    check("callModel null (anahtar yok) → kapı ölçülür ama çağrı yok", !out.attempted && !out.refined && out.qcScore < 65 && show(rep) === show(before), show(out));
  }
  {
    const rep = weakReport(lotus);
    const before = { ...rep };
    const out = await maybeRefineReport(rep, lotus, async () => { throw new Error("ağ koptu"); });
    check("model istisnası → orijinal kalır, fırlatmaz", out.attempted && !out.refined && show(rep) === show(before), show(out));
  }
  {
    const rep = weakReport(lotus);
    const before = { ...rep };
    const out = await maybeRefineReport(rep, lotus, async () => ({ content: "Kısa metin.", finishReason: "stop" }));
    check("≤30 karakter refine reddedilir (eski eşik)", out.attempted && !out.refined && show(rep) === show(before));
  }

  // ── [C] refine maliyet kaydı ─────────────────────────────────────────────
  console.log("\n── [C] Route — refine çağrısı ai_usage'a yazılır (OLCUM-ARACI-15) ──");
  const route = loadReportRoute();
  const lotusBody = { ...fixture("R3-lotus-omen-atk-close").body, matchId: "4b0f7d3e-9c1a-4e2b-8f6d-2a7c9e1b5d30" };
  {
    resetHarness();
    process.env.OPENAI_API_KEY = "sk-test-harness-not-real";
    harness.replies = [
      { content: WEAK_JSON, usage: mainUsage },
      { content: REFINED_TR, finishReason: "stop", usage: refineUsage, model: "gpt-5-mini-refine-test" },
    ];
    const res = await route.POST(reportRequest(lotusBody));
    const body = await res.json() as Record<string, unknown>;
    const u = harness.usageCalls;
    check("200 + refine çağrısı yapıldı (2 OpenAI isteği)", res.status === 200 && harness.fetchCalls.length === 2, `status=${res.status} fetch=${harness.fetchCalls.length}`);
    check("saveAiUsage 2 kez (ana + refine) — önceden 1", u.length === 2, `got=${u.length}`);
    const r = u[1] ?? {};
    check("refine kaydı: routeType report, refine token'ları, yanıt modeli, matchId, userId",
      r.routeType === "report" && r.promptTokens === 410 && r.completionTokens === 95 && r.cachedTokens === 0
        && r.model === "gpt-5-mini-refine-test" && r.matchId === lotusBody.matchId && r.userId === "00000000-0000-4000-8000-000000000001", show(r));
    check("refine kaydı latencyMs sayısal", typeof r.latencyMs === "number" && (r.latencyMs as number) >= 0);
    check("ana kayıt değişmedi (5100/640/1024)", u[0]?.promptTokens === 5100 && u[0]?.completionTokens === 640 && u[0]?.cachedTokens === 1024, show(u[0]));
    check("refine metni rapora girdi ('A Short' temizlenmiş)", typeof body.mistake === "string" && body.mistake.includes("A Main") && !/A Short/.test(body.mistake), String(body.mistake));
  }
  {
    resetHarness();
    harness.replies = [
      { content: WEAK_JSON, usage: mainUsage },
      { content: `${REFINED_TR} ve sonra rotasy`, finishReason: "length", usage: refineUsage },
    ];
    await route.POST(reportRequest(lotusBody));
    check("refine REDDEDİLSE de (finish=length) token harcandı → 2 kayıt", harness.usageCalls.length === 2, `got=${harness.usageCalls.length}`);
  }
  {
    resetHarness();
    harness.replies = [
      { content: WEAK_JSON, usage: mainUsage },
      { content: "", status: 500 },
    ];
    await route.POST(reportRequest(lotusBody));
    check("refine HTTP 500 → yalnız ana kayıt (1)", harness.usageCalls.length === 1, `got=${harness.usageCalls.length}`);
  }
  {
    resetHarness();
    harness.replies = [
      { content: WEAK_JSON, usage: mainUsage },
      { content: REFINED_TR, finishReason: "stop" },
    ];
    await route.POST(reportRequest(lotusBody));
    check("refine yanıtında usage yoksa kayıt yok (uydurma token yok) → 1", harness.usageCalls.length === 1, `got=${harness.usageCalls.length}`);
  }
  delete process.env.OPENAI_API_KEY;

  console.log(`\n${fail === 0 ? "✅" : "❌"} test-eval-fidelity: ${pass} geçti, ${fail} kırık\n`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
