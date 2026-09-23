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
 * [V] B06 (TR-KALAN-18/19, OLCUM-ARACI-01/02/04): vision prompt kurulumu route.ts'ten
 *     lib/vision-prompt-builder.ts'e taşındı. GERÇEK vision POST handler'ı
 *     (scripts/vision-route-harness.ts) evals/vision-golden vakalarında refactor
 *     ÖNCESİ route'un OpenAI gövdesiyle (route-prompts.json) BAYT-AYNI kullanıcı
 *     mesajı + sistem mesajı (sha256; KB değişmediyse) + şema/model/token üretir;
 *     route'un gövdesi buildVisionSystemMessage/buildVisionUserMessage çıktısına
 *     eşit; route.ts'te prompt kurulumu kalmadı (grep-guard).
 *     Golden yenileme (prompt BİLİNÇLİ değişince): UPDATE_VISION_GOLDEN=1.
 * [E] B06 (OLCUM-ARACI-01/02/03/04/05/07, CANLI-TEST-10): scripts/eval-vision.ts
 *     buildEvalRequest ↔ GERÇEK route, 87 korpus senaryosunda (62 sentetik+EN,
 *     2 yeni, 23 gerçek): sistem mesajı + gövde (model/450/şema/effort) bayt-eşit,
 *     kullanıcı mesajı yalnız görsel direktifi kadar farklı (imageAvailable:false,
 *     karar B), ders tipi aynı; eski aynanın 7 sapma round'u prod değerinde; S32/
 *     S33 factGround = kurucu; eval/measure/replay'de elle kurulum yok (grep-guard).
 * [M] OLCUM-ARACI-09: measure-prompt-prefix'in ölçtüğü metin = route'un sistem
 *     mesajı (totalB = Buffer.byteLength, [SENARYO REHBERİ dahil).
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
import { VISION_GOLDEN_CASES } from "../evals/vision-golden";
import { goldenRecordFor, knowledgeDigest, captureVisionCall, type VisionGoldenRecord } from "./vision-route-harness";
import {
  VISION_CALL,
  DESKTOP_VISION_MAX_TOKENS,
  resolveVisionMaxTokens,
  resolveVisionLang,
  buildVisionSystemMessage,
  buildVisionUserMessage,
  buildVisionContext,
  prevDeathTypesFromHistory,
  type VisionPromptBody,
} from "../lib/vision-prompt-builder";
import type { DeathType } from "../lib/death-type";
import { SCENARIOS as VISION_SCENARIOS, buildEvalRequest, EVAL_SCOPE_NOTE, type Scenario as VisionScenario, type MatchConceptSim } from "./eval-vision";
import * as legacyVision from "./eval-vision-legacy";
import { measurePrefixScenarios, SCENARIOS as PREFIX_SCENARIOS, bodyOf as prefixBodyOf, buildSystemPrompt as prefixSystemPrompt } from "./measure-prompt-prefix";

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

  await visionRouteSection();
  await evalParitySection();
  await measurePrefixSection();

  console.log(`\n${fail === 0 ? "✅" : "❌"} test-eval-fidelity: ${pass} geçti, ${fail} kırık\n`);
  if (fail > 0) process.exit(1);
}

/* ══════════════════════════════════════════════════════════════════════════
   [V] VISION — route ↔ golden ↔ lib/vision-prompt-builder (B06)
   ══════════════════════════════════════════════════════════════════════════ */

const VISION_GOLDEN_PATH = path.join(__dirname, "..", "evals", "vision-golden", "route-prompts.json");
type VisionGoldenFile = { note: string; kbDigest: string; records: VisionGoldenRecord[] };

/** İlk farklı karakterin konumu + iki taraftan kısa kesit (kırık teşhisi için). */
function firstDiff(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (i === a.length && i === b.length) return "";
  return `@${i} route="${a.slice(Math.max(0, i - 30), i + 50)}" beklenen="${b.slice(Math.max(0, i - 30), i + 50)}"`;
}

/** Route'un prev kaynağının aynısı: echo, boşsa (ölüm + matchId varken) maç-kavram listesi. */
function routePrevTypes(body: Record<string, unknown>, matchConcepts?: string[]): DeathType[] {
  const echo = prevDeathTypesFromHistory(body.roundHistory);
  if (body.died === true && echo.length === 0 && typeof body.matchId === "string" && body.matchId) {
    return [...(matchConcepts ?? [])] as DeathType[];
  }
  return echo;
}

async function visionRouteSection() {
  console.log("\n── [V] vision route ↔ refactor-öncesi golden ↔ lib/vision-prompt-builder (TR-KALAN-18/19, OLCUM-ARACI-01/02) ──");
  const golden = JSON.parse(fs.readFileSync(VISION_GOLDEN_PATH, "utf8")) as VisionGoldenFile;
  if (process.env.UPDATE_VISION_GOLDEN === "1") {
    const records: VisionGoldenRecord[] = [];
    for (const c of VISION_GOLDEN_CASES) records.push((await goldenRecordFor(c)).record);
    const next: VisionGoldenFile = { ...golden, kbDigest: knowledgeDigest(), records };
    fs.writeFileSync(VISION_GOLDEN_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
    golden.kbDigest = next.kbDigest;
    golden.records = records;
    console.log(`  ⚠ UPDATE_VISION_GOLDEN=1 → golden yeniden yazıldı (${records.length} vaka). Farkı commit mesajında gerekçelendir.`);
  }
  const kbSame = knowledgeDigest() === golden.kbDigest;
  if (!kbSame) {
    console.log("  ⚠ knowledge/** golden'dan farklı → sistem mesajı sha256 kıyası ATLANDI (route↔builder paritesi yine koşuyor)");
  }
  check(`golden vaka seti eşleşiyor (${VISION_GOLDEN_CASES.length} vaka)`,
    golden.records.length === VISION_GOLDEN_CASES.length && VISION_GOLDEN_CASES.every((c) => golden.records.some((r) => r.id === c.id)));

  const byId: Record<string, { user: string; sys: string; hasImage: boolean }> = {};
  for (const c of VISION_GOLDEN_CASES) {
    const g = golden.records.find((r) => r.id === c.id);
    if (!g) continue;
    const { record, capture } = await goldenRecordFor(c);
    byId[c.id] = { user: capture.userText, sys: capture.systemMessage, hasImage: capture.hasImage };
    check(`${c.id}: route 200`, record.status === 200, `status=${record.status} ${JSON.stringify(capture.json).slice(0, 160)}`);
    check(`${c.id}: kullanıcı mesajı refactor-ÖNCESİ route ile BAYT-AYNI (${g.userText.length} kr)`,
      record.userText === g.userText, firstDiff(record.userText, g.userText));
    if (kbSame) {
      check(`${c.id}: sistem mesajı refactor-ÖNCESİ route ile BAYT-AYNI (${g.systemBytes} B, sha256)`,
        record.systemSha256 === g.systemSha256 && record.systemBytes === g.systemBytes, `bytes=${record.systemBytes}`);
    }
    check(`${c.id}: şema/model/token/effort/görsel/ders-tipi golden ile aynı`,
      record.responseFormatSha256 === g.responseFormatSha256 && record.model === g.model
        && record.maxCompletionTokens === g.maxCompletionTokens && record.reasoningEffort === g.reasoningEffort
        && record.hasImage === g.hasImage && record.deathType === g.deathType,
      show({ ...record, userText: undefined }));

    // Route'un yolladığı = kurucunun ürettiği (tek kaynak).
    const body = c.body as VisionPromptBody;
    const lang = resolveVisionLang(c.body);
    const sys = buildVisionSystemMessage({ body, lang, memoryContext: c.memoryContext ?? "" });
    const um = buildVisionUserMessage({
      body, lang, prevDeathTypes: routePrevTypes(c.body, c.matchConcepts), imageAvailable: c.body.died !== false,
    });
    check(`${c.id}: route sistem mesajı = buildVisionSystemMessage`, sys.systemMessage === capture.systemMessage,
      firstDiff(capture.systemMessage, sys.systemMessage));
    check(`${c.id}: route kullanıcı mesajı = buildVisionUserMessage · ders tipi aynı`,
      um.userPrompt === capture.userText && (um.deathType ?? null) === (capture.json.deathType ?? null),
      firstDiff(capture.userText, um.userPrompt));
  }

  // İçerik kilitleri — prod prompt'unun taşıdığı direktifler (eval'in eskiden üretmedikleri).
  const u = (id: string) => byId[id]?.user ?? "";
  const s = (id: string) => byId[id]?.sys ?? "";
  check("G1 sistem: static/scenario/profile/profile2 + karşı-ajan + hafıza + pattern blokları",
    ["[SİLAH + KOMP REHBERİ", "[SENARYO REHBERİ", "[KOÇLUK PROFİLİ — her rank", "[KOÇLUK PROFİLİ — devam]", "[KARŞI-AJAN — Jett", "[CROSS-MATCH GEÇMİŞİ", "[PATTERN CONTEXT — Rust Client]"]
      .every((h) => s("G1-tr-loc-killer-spike-eco").includes(h)));
  check("G1 kullanıcı: olgu sözleşmesi + silah/komp + ajan kiti + harita + ders geçmişi + senaryo (retake+ekonomi)",
    ["[ÖLÜM-VERİ SÖZLEŞMESİ", "[SİLAH+KOMP İPUCU", "[AJAN KİTİ", "[HARİTA İPUCU", "[DERS GEÇMİŞİ", "[SENARYO İPUCU", "RETAKE TAKTİK", "[EKONOMİ REHBERİ]", "[GÖRÜNTÜDEKİ YETENEK İKONLARI"]
      .every((h) => u("G1-tr-loc-killer-spike-eco").includes(h)));
  check("G1 pattern HP'si prompt'a girmez (stripNumericHp → stripHpClaims)", !/30 HP|düşük canla/.test(u("G1-tr-loc-killer-spike-eco")));
  check("G2 EN: dil emri başta + sonda, DEATH-DATA CONTRACT, ultReady/deathTiming/timer ctx'te",
    u("G2-en-loc-killer-route-ult").includes("[LANGUAGE]") && u("G2-en-loc-killer-route-ult").includes("[REMINDER] Output language: ENGLISH ONLY")
      && u("G2-en-loc-killer-route-ult").includes("[DEATH-DATA CONTRACT") && /"ultReady": true/.test(u("G2-en-loc-killer-route-ult"))
      && /"deathTiming": "mid"/.test(u("G2-en-loc-killer-route-ult")) && /"roundTimerAtDeath": 38/.test(u("G2-en-loc-killer-route-ult")));
  check("G3 ajan Unknown + konumsuz + katilsiz: AJAN OKUNAMADI + ÖLÜM YERİ OKUNAMADI + BAĞLAMSIZ ÖLÜM; allies=5 prompt'a girmez",
    ["[AJAN OKUNAMADI]", "[ÖLÜM YERİ OKUNAMADI]", "[BAĞLAMSIZ ÖLÜM]"].every((h) => u("G3-tr-noloc-nokiller-agent-unknown").includes(h))
      && !u("G3-tr-noloc-nokiller-agent-unknown").includes("[AJAN KİTİ") && !/müttefik=5|"alliesAlive": 5/.test(u("G3-tr-noloc-nokiller-agent-unknown")));
  check("G4 harita Unknown + 'with blade': HARİTA OKUNAMADI, sözlük-dışı silah prompt'a girmez",
    u("G4-tr-map-unknown-blade").includes("[HARİTA OKUNAMADI]") && !/blade/i.test(u("G4-tr-map-unknown-blade"))
      && u("G4-tr-map-unknown-blade").includes("katil=killed by chamber"));
  check("G6 hayatta kalındı: görsel yok, görsel/ölüm direktifleri yok",
    byId["G6-tr-survived"]?.hasImage === false && !u("G6-tr-survived").includes("[GÖRÜNTÜDEKİ YETENEK İKONLARI")
      && !u("G6-tr-survived").includes("[ÖLÜM-TİPİ İPUCU — bu round'un odağı]"));

  // Çağrı parametreleri (OLCUM-ARACI-04).
  check(`resolveVisionMaxTokens(${DESKTOP_VISION_MAX_TOKENS}) = 450 (masaüstü) · (undefined) = 350 · (200) = 200 · (0) = 350`,
    resolveVisionMaxTokens(DESKTOP_VISION_MAX_TOKENS) === 450 && resolveVisionMaxTokens(undefined) === 350
      && resolveVisionMaxTokens(200) === 200 && resolveVisionMaxTokens(0) === 350 && VISION_CALL.maxTokensCap === 450,
    `${resolveVisionMaxTokens(DESKTOP_VISION_MAX_TOKENS)}/${resolveVisionMaxTokens(undefined)}`);
  check("golden'da masaüstü isteği 450 token · gpt-5-mini · minimal ile gidiyor",
    golden.records.every((r) => r.maxCompletionTokens === 450 && r.model === "gpt-5-mini" && r.reasoningEffort === "minimal"));

  // Grep-guard: route'ta prompt kurulumu kalmadı (tek kaynak = builder).
  const routeSrc = fs.readFileSync(path.join(__dirname, "..", "app", "api", "ai", "vision", "route.ts"), "utf8");
  const leftovers = ["systemSections.push(", "loadVisionKnowledge(", "buildFactSheet(", "buildFactGround(", "classifyDeathVaried(", "buildPolicyBlock(", "JSON.parse("]
    .filter((x) => codeOnly(routeSrc).includes(x));
  check("route.ts prompt kurmuyor (systemSections/loadVisionKnowledge/buildFactSheet/buildFactGround/classifyDeathVaried/buildPolicyBlock/JSON.parse yok)",
    leftovers.length === 0, leftovers.join(", "));
  check("route.ts kurucuyu çağırıyor (buildVisionSystemMessage + buildVisionUserMessage + buildVisionRequestBody + toVisionFeedbackOutcome)",
    ["buildVisionSystemMessage(", "buildVisionUserMessage(", "buildVisionRequestBody(", "toVisionFeedbackOutcome(", "visionPostprocessOpts("].every((x) => routeSrc.includes(x)));
}

/* ══════════════════════════════════════════════════════════════════════════
   [E] eval-vision ↔ prod kurucusu ↔ GERÇEK route (B06 · OLCUM-ARACI-01/02/03/
       04/05/07, TR-KALAN-18/19, CANLI-TEST-10)
   ══════════════════════════════════════════════════════════════════════════ */

const EVAL_MATCH_ID = "3f2c1a8e-5b7d-4c9e-8a61-2d4f6b8c0e13";
const IMAGE_DIRECTIVE_HEADERS = ["\n[GÖRÜNTÜDEKİ YETENEK İKONLARI]", "\n[ABILITY ICONS IN THE SCREENSHOT]"];

/** Route metninden görsel direktifini (başlığından bir sonraki "\n[" satırına kadar) keser.
 *  Direktif yoksa null. */
function withoutImageDirective(routeUser: string): string | null {
  for (const h of IMAGE_DIRECTIVE_HEADERS) {
    const i = routeUser.indexOf(h);
    if (i < 0) continue;
    const next = routeUser.indexOf("\n[", i + h.length);
    return routeUser.slice(0, i) + (next < 0 ? "" : routeUser.slice(next));
  }
  return null;
}

/** Yorumları atar (grep-guard yalnız KODA bakar; yorumda eski fonksiyon adı geçebilir). */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

async function evalParitySection() {
  console.log("\n── [E] eval-vision ↔ lib/vision-prompt-builder ↔ GERÇEK route (OLCUM-ARACI-01/02/03/04/05/07, CANLI-TEST-10) ──");
  const real = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "evals", "real-rounds-23.json"), "utf8")) as VisionScenario[];
  const corpus: VisionScenario[] = [...VISION_SCENARIOS, ...real];
  const simEval: MatchConceptSim = new Map();
  const simRoute = new Map<string, string[]>();
  const bad = { sys: [] as string[], body: [] as string[], userDiff: [] as string[], img: [] as string[], dtype: [] as string[], status: [] as string[] };
  const byId: Record<string, { req: ReturnType<typeof buildEvalRequest>; routeType: unknown; routeUser: string }> = {};
  for (const s of corpus) {
    const req = buildEvalRequest(s, simEval);
    const mcKey = /^(M\d+)-R\d+/.exec(s.id)?.[1] ?? "";
    const cap = await captureVisionCall({ maxTokens: DESKTOP_VISION_MAX_TOKENS, ...s.body, matchId: EVAL_MATCH_ID }, {
      memoryContext: s.memoryContext ?? "",
      matchConcepts: mcKey ? simRoute.get(mcKey) ?? [] : [],
    });
    if (mcKey && typeof cap.json.deathType === "string") simRoute.set(mcKey, [...(simRoute.get(mcKey) ?? []), cap.json.deathType]);
    byId[s.id] = { req, routeType: cap.json.deathType ?? null, routeUser: cap.userText };
    if (cap.status !== 200) bad.status.push(`${s.id}:${cap.status}`);
    if (req.systemMessage !== cap.systemMessage) bad.sys.push(s.id);
    // Gövde: mesajlar hariç alanlar (model / 450 / şema / effort) route ile bayt-eşit.
    const strip = (b: Record<string, unknown> | null) => JSON.stringify({ ...(b ?? {}), messages: undefined });
    if (strip(req.requestBody as unknown as Record<string, unknown>) !== strip(cap.requestBody)) bad.body.push(s.id);
    // Kullanıcı mesajı: route'unkinden YALNIZ görsel direktifi kadar farklı (ölüm round'unda).
    const died = (s.body as Record<string, unknown>).died === true;
    const cut = withoutImageDirective(cap.userText);
    const okUser = died ? cut !== null && cut === req.userPrompt : cut === null && cap.userText === req.userPrompt;
    if (!okUser) bad.userDiff.push(`${s.id} ${firstDiff(cut ?? cap.userText, req.userPrompt).slice(0, 120)}`);
    if (IMAGE_DIRECTIVE_HEADERS.some((h) => req.userPrompt.includes(h))) bad.img.push(s.id);
    if ((req.deathType ?? null) !== (cap.json.deathType ?? null)) bad.dtype.push(`${s.id}: eval=${req.deathType} route=${cap.json.deathType}`);
  }
  const n = corpus.length;
  check(`korpus: ${VISION_SCENARIOS.length} sentetik (S+EN aynası+E) + ${real.length} gerçek = ${n}; route hepsinde 200`, bad.status.length === 0, bad.status.join(", "));
  check(`sistem mesajı eval = GERÇEK route (bayt-eşit) — ${n - bad.sys.length}/${n}`, bad.sys.length === 0, bad.sys.slice(0, 8).join(", "));
  check(`istek gövdesi (model/max_completion_tokens/response_format/reasoning_effort) eval = route — ${n - bad.body.length}/${n}`, bad.body.length === 0, bad.body.slice(0, 8).join(", "));
  check(`kullanıcı mesajı eval = route − YALNIZ görsel direktifi (ölüm round'u) / birebir (hayatta kalınan) — ${n - bad.userDiff.length}/${n}`, bad.userDiff.length === 0, bad.userDiff.slice(0, 4).join(" | "));
  check(`imageAvailable:false → eval'de görsel direktifi YOK (${n}/${n} senaryo) + kapsam notu`,
    bad.img.length === 0 && /görsel yok/.test(EVAL_SCOPE_NOTE) && EVAL_SCOPE_NOTE.includes("[GÖRÜNTÜDEKİ YETENEK İKONLARI]"), bad.img.join(", "));
  check(`ders tipi eval = route — ${n - bad.dtype.length}/${n}`, bad.dtype.length === 0, bad.dtype.slice(0, 8).join(" | "));

  // Eski aynanın ölçülen 7 sapma round'u (OLCUM-ARACI-03) — prod değeriyle birebir.
  const expectType: Record<string, string> = {
    "E11-breeze-chamber-atk-op-loss": "op-loss", "E12-haven-sova-def-ult-pocket": "ult-in-pocket",
    "M1-R4-ascent-jett": "loss-streak", "M1-R5-ascent-jett": "loss-streak", "M1-R10-ascent-jett": "loss-streak",
    "M1-R18-ascent-jett": "loss-streak", "M1-R2b-ascent-jett": "overtime-matchpoint",
  };
  const typeMiss = Object.entries(expectType).filter(([id, t]) => byId[id]?.req.deathType !== t || byId[id]?.routeType !== t);
  check("E11/E12/M1-R4/R5/R10/R18/R2b: eval tipi = route tipi = prod (op-loss, ult-in-pocket, loss-streak×4, overtime-matchpoint)",
    typeMiss.length === 0, typeMiss.map(([id]) => `${id}: eval=${byId[id]?.req.deathType} route=${byId[id]?.routeType}`).join(" | "));

  // İçerik kilitleri (eval'in eskiden üretmediği prod halkaları).
  const U = (id: string) => byId[id]?.req.userPrompt ?? "";
  const S = (id: string) => byId[id]?.req.systemMessage ?? "";
  check("S1 sistem: [SİLAH + KOMP REHBERİ, [SENARYO REHBERİ, [KOÇLUK PROFİLİ (+ devam), [KARŞI-AJAN",
    ["[SİLAH + KOMP REHBERİ", "[SENARYO REHBERİ", "[KOÇLUK PROFİLİ — her rank", "[KOÇLUK PROFİLİ — devam]", "[KARŞI-AJAN"].every((h) => S("S1-ascent-cypher-def-strong").includes(h)));
  check("S1 kullanıcı: [ÖLÜM-VERİ SÖZLEŞMESİ, [SİLAH+KOMP İPUCU, [AJAN KİTİ, [HARİTA İPUCU, [DERS GEÇMİŞİ",
    ["[ÖLÜM-VERİ SÖZLEŞMESİ", "[SİLAH+KOMP İPUCU", "[AJAN KİTİ", "[HARİTA İPUCU", "[DERS GEÇMİŞİ"].every((h) => U("S1-ascent-cypher-def-strong").includes(h)));
  check("S6 (spike kurulu, savunma): [SENARYO İPUCU + RETAKE TAKTİK",
    U("S6-sunset-killjoy-def-retake-lowhp").includes("[SENARYO İPUCU") && U("S6-sunset-killjoy-def-retake-lowhp").includes("RETAKE TAKTİK"));
  check("gerçek M1-R2 (konum yok): [ÖLÜM YERİ OKUNAMADI] (eski yorum 'bu korpusta hiç ateşlemez' diyordu)",
    U("M1-R2-ascent-jett").includes("[ÖLÜM YERİ OKUNAMADI]"));
  check("S16 ctx: \"ultReady\": true · E25 ctx: \"deathTiming\": \"mid\" (masaüstü alanları eval'de de prompt'a girer)",
    /"ultReady": true/.test(U("S16-sunset-deadlock-def-ult")) && /"deathTiming": "mid"/.test(U("E25-bind-waylay-atk-no-killer")));
  check("TR-KALAN-19: eval kbFiles = prompt'a giren dosyalar (static/scenario/profile dahil)",
    ["general/weapon-comp-compact.md", "general/post-plant-playbook.md", "ranks/universal.md"].every((f) => (byId["S1-ascent-cypher-def-strong"]?.req.kbFiles ?? []).includes(f)));

  // İstek gövdesi anlık görüntüsü (OLCUM-ARACI-04).
  const tr = byId["S1-ascent-cypher-def-strong"]?.req.requestBody as unknown as {
    model: string; max_completion_tokens: number; reasoning_effort?: string;
    response_format: { type: string; json_schema: { schema: { properties: { enemyAnalysis: { description: string } } } } };
    messages: { role: string; content: unknown }[];
  };
  const en = byId["S1-ascent-cypher-def-strong-en"]?.req.requestBody as unknown as typeof tr;
  check("eval gövdesi: gpt-5-mini · max_completion_tokens 450 · minimal · json_schema · kullanıcı içeriği metin bloğu",
    tr?.model === "gpt-5-mini" && tr?.max_completion_tokens === 450 && tr?.reasoning_effort === "minimal"
      && tr?.response_format?.type === "json_schema" && Array.isArray(tr?.messages?.[1]?.content), show({ ...tr, messages: undefined, response_format: undefined }));
  check("eval şeması: enemyAnalysis.description 'KAYNAK-DİLİ YASAK' (TR) / 'SOURCE-LANGUAGE BAN' (EN) içerir",
    !!tr?.response_format.json_schema.schema.properties.enemyAnalysis.description.includes("KAYNAK-DİLİ YASAK")
      && !!en?.response_format.json_schema.schema.properties.enemyAnalysis.description.includes("SOURCE-LANGUAGE BAN"));

  // İki yeni senaryo: factGround = kurucunun factGround'u (OLCUM-ARACI-07).
  for (const id of ["S32-lotus-unknown-def-agentmiss", "S33-split-jett-atk-bladekiller"]) {
    const sc = corpus.find((x) => x.id === id);
    const r = byId[id]?.req;
    if (!sc || !r) { check(`${id}: korpusta`, false); continue; }
    const ref = buildVisionContext(sc.body as VisionPromptBody, r.lang);
    check(`${id}: eval factGround deepEqual kurucu (route) factGround`, JSON.stringify(r.factGround) === JSON.stringify(ref.factGround), `${show(r.factGround)} ≠ ${show(ref.factGround)}`);
  }
  const s32 = byId["S32-lotus-unknown-def-agentmiss"]?.req;
  const s33 = byId["S33-split-jett-atk-bladekiller"]?.req;
  check("S32 (ajan Unknown): playerAgentKnown=false · [AJAN OKUNAMADI] · [AJAN KİTİ yok",
    s32?.factGround.playerAgentKnown === false && U("S32-lotus-unknown-def-agentmiss").includes("[AJAN OKUNAMADI]") && !U("S32-lotus-unknown-def-agentmiss").includes("[AJAN KİTİ"));
  const s33ctx = buildVisionContext(corpus.find((x) => x.id === "S33-split-jett-atk-bladekiller")!.body as VisionPromptBody, "tr").ctx;
  check("S33 ('with blade'): ctx.killerInfo normalize ('killed by chamber'), hasWeapon=false, prompt'ta 'blade' YOK",
    s33ctx.killerInfo === "killed by chamber" && s33?.factGround.hasWeapon === false && s33?.factGround.hasKiller === true
      && !/blade/i.test(U("S33-split-jett-atk-bladekiller")), `${String(s33ctx.killerInfo)} · ${show(s33?.factGround)}`);
  // Sapmayı GÖRÜNÜR kılan kontrol: dondurulmuş eski ayna bu iki senaryoda prod'dan ayrışır.
  const legacyS32 = legacyVision.buildUserPrompt(corpus.find((x) => x.id === "S32-lotus-unknown-def-agentmiss")!, new Map());
  const legacyS33 = legacyVision.buildUserPrompt(corpus.find((x) => x.id === "S33-split-jett-atk-bladekiller")!, new Map());
  check("eski ayna (EVAL_LEGACY_MIRROR) bu sapmayı taşır: S32'de [AJAN OKUNAMADI] yok, S33 prompt'unda 'blade' var — yeni senaryolar ölçülebilir",
    !legacyS32.includes("[AJAN OKUNAMADI]") && /blade/.test(legacyS33));
  const legacySys = (legacyVision.buildSystemMessage(corpus.find((x) => x.id === "S1-ascent-cypher-def-strong")!) as unknown as { msg: string }).msg;
  check("eski ayna dondurulmuş pre-parity: [SENARYO REHBERİ yok, dosya 'DONDURULMUŞ' işaretli",
    !legacySys.includes("[SENARYO REHBERİ") && fs.readFileSync(path.join(__dirname, "eval-vision-legacy.ts"), "utf8").includes("DONDURULMUŞ ESKİ AYNA"));

  // Grep-guard: eval/measure/replay elle prompt KURMUYOR; eval anahtarı import'ta okumuyor.
  const src = (rel: string) => fs.readFileSync(path.join(__dirname, rel), "utf8");
  const evalSrc = src("eval-vision.ts");
  const forbidden = ["sections.push(", "loadVisionKnowledge(", "buildFactSheet(", "buildFactGround(", "classifyDeathVaried(", "buildPolicyBlock(", "ctxForFacts", "sanitizePromptInput("];
  for (const rel of ["eval-vision.ts", "measure-prompt-prefix.ts", "replay-tr.ts"]) {
    const hits = forbidden.filter((x) => codeOnly(src(rel)).includes(x));
    check(`${rel}: elle prompt/ctx/factGround kurulumu yok (${forbidden.length} desen)`, hits.length === 0, hits.join(", "));
  }
  check("eval-vision: kurucu + prod parse + prod son-işlem kullanılıyor; JSON.parse(text) yok",
    ["buildVisionSystemMessage(", "buildVisionUserMessage(", "buildVisionRequestBody(", "toVisionFeedbackOutcome(", "visionPostprocessOpts(", "finalizeVisionFeedback("].every((x) => evalSrc.includes(x))
      && !/JSON\.parse\(text\)/.test(evalSrc));
  check("eval-vision: API anahtarı YALNIZ main() içinde okunur (import yan-etkisiz) + require.main kapısı",
    !/const API_KEY = loadApiKey\(\)/.test(evalSrc) && /const apiKey = dryRun \? "" : loadApiKey\(\);/.test(evalSrc) && /if \(require\.main === module\)/.test(evalSrc));
}

/* ══════════════════════════════════════════════════════════════════════════
   [M] measure-prompt-prefix = GERÇEK sistem mesajı (OLCUM-ARACI-09)
   ══════════════════════════════════════════════════════════════════════════ */

async function measurePrefixSection() {
  console.log("\n── [M] measure-prompt-prefix ölçtüğü metin = route'un sistem mesajı (OLCUM-ARACI-09) ──");
  const rows = measurePrefixScenarios();
  check(`${rows.length} önek senaryosu ölçüldü`, rows.length === PREFIX_SCENARIOS.length && rows.length === 5);
  for (const sc of PREFIX_SCENARIOS) {
    const row = rows.find((r) => r.id === sc.id);
    const sys = buildVisionSystemMessage({ body: prefixBodyOf(sc.second), lang: sc.second.lang ?? "tr", memoryContext: "" }).systemMessage;
    check(`${sc.id} ${sc.name}: totalB = Buffer.byteLength(buildVisionSystemMessage) (${row?.totalB} B) · [SENARYO REHBERİ dahil`,
      row?.totalB === Buffer.byteLength(sys, "utf8") && sys.includes("[SENARYO REHBERİ"), `${row?.totalB} ≠ ${Buffer.byteLength(sys, "utf8")}`);
  }
  // Ölçülen metin, aynı gövdeyle GERÇEK route'un modele yolladığı sistem mesajıdır.
  const base = PREFIX_SCENARIOS.find((s) => s.id === "A")!.first;
  const cap = await captureVisionCall({ maxTokens: DESKTOP_VISION_MAX_TOKENS, ...(prefixBodyOf(base) as Record<string, unknown>) });
  check("A.first: measure sistem metni = GERÇEK route sistem mesajı (bayt-eşit)", cap.status === 200 && prefixSystemPrompt(base) === cap.systemMessage,
    firstDiff(cap.systemMessage, prefixSystemPrompt(base)));
}

main().catch((e) => { console.error(e); process.exit(1); });
