/**
 * MAÇ RAPORU SONUÇ / TARAF / KALICILIK DÜRÜSTLÜĞÜ TESTİ — FB01 (2026-09-24)
 * ─────────────────────────────────────────────────────────────────────────────
 * RUN: npx tsx scripts/test-report-outcome.ts   (exit 1 = kırık)
 *
 * [F03] lib/match-outcome.ts deriveMatchOutcome + dört tüketici (deterministik şablon,
 *       engine/Score satırı, route player_memory, raw_result_json.won). KANIT: 01.txt:5567
 *       "Maçı 9-4 kazandın" (elle bitirilen rekabetçi maç), LOG.txt:4538 "Maçı 4-5 kaybettin".
 *       Fix olmadan: (4,4) LOSS, rekabetçi (9,4) WIN, player_memory null maçı kayıp sayar.
 * [F13] rounds[].side + devre arası çıkarımı: iki taraf görülünce KB side filtresi YOK,
 *       Side "mixed", round satırında side=, kural 9 round-bazlı; ≤12 round tek taraf aynen.
 * [F54] AI hatası (sahte OpenAI 500 / geçersiz JSON / şekil / timeout) → 502/504 yapılandırılmış
 *       hata; INSERT yok, hafıza yok, refine yok; aynı matchId ikinci istek 409 DEĞİL, AI'ya gider.
 *       Fix olmadan: 200 + aiGenerated:false + şablon analyses'e kalıcı yazılır.
 * [F89] deterministik şablon: ajan/harita yok + dağınık ölüm + enemyCount yok → "Unknown",
 *       "okunuyor/tekrarlayan", "0.0", ölçülmemiş trade/utility yargısı YOK (TR+EN) +
 *       Lotus "Hookah'tan girdin." alan-yedeği vakası.
 * [F18] analyses INSERT kalıcı hata (sahte PGRST303) → 1 yeniden deneme + persisted:false.
 * [F48] refine meta-dil kapısı: LOG.txt:4538 summary'si sahte refine yanıtı → reddedilir,
 *       alan orijinal kalır; eval-out'taki kabul edilmiş refine alanlarında yanlış-pozitif 0.
 *
 * ⚠ AĞ/AI/DB YOK: scripts/report-route-harness.ts (sahte OpenAI + sahte PostgREST);
 * OPENAI_API_KEY sahte dize; .env.local OKUNMAZ.
 */
import Module from "node:module";
import * as fs from "node:fs";
import * as path from "node:path";
import { harness, resetHarness, loadReportRoute, reportRequest, newFakeDb } from "./report-route-harness";
import { deriveMatchOutcome, isTerminalScore, normalizeModeToken, MATCH_END_REASONS } from "../lib/match-outcome";
import { crossedHalfSwap } from "../lib/match-outcome";
import {
  validateRequest,
  generateDeterministicReport,
  buildReportPrompts,
  finalizeReportFields,
  resolveReportSides,
  type ReportRequest,
} from "../lib/report-prompt";
import { maybeRefineReport, hasRefineMetaLanguage, type RefineRequestBody } from "../lib/report-refine";
// GERÇEK api-auth (harness route için sahtesini sonra kurar; bu bağlama o değişmez).
// Upstash env YOK → günlük sayaç bellek deposunda (harness da UPSTASH_* siler).
import { consumeDailyQuota, refundDailyQuota } from "../lib/api-auth";

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}
const show = (x: unknown) => JSON.stringify(x);
const FIELDS = ["summary", "mistake", "tendencies", "adjustment", "bestRound", "decisionScore"] as const;
const REPO_ROOT = path.join(__dirname, "..");

function validated(body: Record<string, unknown>): ReportRequest {
  const v = validateRequest(body);
  if (!v.valid) throw new Error(`fixture geçersiz: ${v.error}`);
  return v.data;
}

/** Masaüstü düz gövdesi: sonuç dizisinden kümülatif "l - r" skorlu round'lar üretir. */
function desktopRounds(results: ("win" | "loss")[], extra: (i: number) => Record<string, unknown> = () => ({})) {
  let w = 0;
  let l = 0;
  return results.map((res, i) => {
    if (res === "win") w++; else l++;
    return { round: i + 1, score: `${w} - ${l}`, result: res, died: res === "loss", deathLocation: res === "loss" ? "A Main" : "", ...extra(i) };
  });
}
const seq = (wins: number, losses: number): ("win" | "loss")[] => {
  const out: ("win" | "loss")[] = [];
  for (let i = 0; i < Math.max(wins, losses); i++) {
    if (i < wins) out.push("win");
    if (i < losses) out.push("loss");
  }
  return out;
};

const GOOD_AI = JSON.stringify({
  summary: "R3 ve R6'da A Main'de aynı açıdan öldün; kayıttaki son skor ekranda.",
  mistake: "R3, R6: A Main'e flaşsız girdin. İkinci girişte flaşla gir ya da takımı bekle.",
  tendencies: "Rakip A Main'i tutuyor; aynı zamanlamayla giriyorsun, açıyı okuyorlar.",
  adjustment: "A Main'e girmeden önce yetenekle bilgi al VEYA B'ye dön; açını her round değiştir.",
  bestRound: "R2: hayatta kaldın ve round'u aldın — itişi bekledin.",
  decisionScore: "6/10 — A Main tekrarları dışında karar iyi.",
});
const MID = "7c0b4a52-3f1e-4d6a-9b2c-5e8f1a3d7c90";
const LIVE_4538 = "Maçı 4-5 kaybettin. Savunmada R1'de A/kanalizasyonda tek başına son canlıyken öldün; R5 ve R10 bilgisi listede yok — bunları yazamam. Karşı takım \"bir düşman\" olarak kaydedildi. Hayatta kalma veya decision score gibi ek sayılar listede yok — bunları yazamam. Ne yap: A/kanalizasyon pozisyonunda takım ile birlikte kal ve takımmanın smoke ya da molotovu kullanmasını sağla; elinde Brimstone olarak orbital smokes tetikle ve takımın arkasına çekilerek yeniden pozisyon al. Eğer ölüm konumu listede yoksa konum belirtme.";

async function main() {
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n── [F03] deriveMatchOutcome — tek kaynak ──");
  {
    const o = (y: number, e: number, mc?: boolean, mode?: string) => deriveMatchOutcome({ yours: y, enemy: e, matchComplete: mc, mode });
    check("(9,4,matchComplete=false) → UNFINISHED / won=null", show(o(9, 4, false)) === show({ won: null, label: "UNFINISHED" }), show(o(9, 4, false)));
    check("(13,11,true) → WIN / true", show(o(13, 11, true)) === show({ won: true, label: "WIN" }));
    check("(4,4,true) → DRAW / null (eskiden LOSS)", show(o(4, 4, true)) === show({ won: null, label: "DRAW" }), show(o(4, 4, true)));
    check("eski istemci rekabetçi (9,4) → UNFINISHED / null", o(9, 4, undefined, "competitive").won === null && o(9, 4, undefined, "competitive").label === "UNFINISHED");
    check("eski istemci rekabetçi (13,11) → WIN / true", o(13, 11, undefined, "competitive").won === true);
    check("eski istemci mod boş (9,4) → WIN / true (geri uyum)", o(9, 4, undefined, "").won === true && o(9, 4).won === true);
    check("rekabetçi 13-12 / 12-12 / 14-13 uzatma ortası → UNFINISHED",
      [o(13, 12, undefined, "competitive"), o(12, 12, undefined, "competitive"), o(14, 13, undefined, "competitive")].every((x) => x.label === "UNFINISHED"));
    check("rekabetçi 14-12 WIN, 12-14 LOSS, 15-13 WIN (uzatma sonu)",
      o(14, 12, undefined, "competitive").label === "WIN" && o(12, 14, undefined, "competitive").label === "LOSS" && o(15, 13, undefined, "unrated").label === "WIN");
    check("swiftplay 5-4 WIN, 3-1 UNFINISHED; spike rush 4-3 WIN ('Spike Rush' token), premier 13-5 WIN",
      o(5, 4, undefined, "swiftplay").label === "WIN" && o(3, 1, undefined, "swiftplay").label === "UNFINISHED"
        && o(4, 3, undefined, "Spike Rush").label === "WIN" && o(13, 5, undefined, "premier").label === "WIN");
    check("mod boş beraberlik (4,4) → DRAW (eskiden LOSS)", o(4, 4).label === "DRAW" && o(4, 4).won === null);
    check("matchComplete=true terminal-olmayan skoru da sonuç sayar (masaüstü bitiş ekranı otoritatif)", o(9, 4, true, "competitive").label === "WIN");
    check("isTerminalScore: tanınmayan mod → null (çıkarım yok)", isTerminalScore(9, 4, "deathmatch") === null && isTerminalScore(9, 4, undefined) === null);
    check("normalizeModeToken: ' Spike Rush ' → spike_rush", normalizeModeToken(" Spike Rush ") === "spike_rush");
    check("MATCH_END_REASONS masaüstü FD01 listesi (aynı yazım)", show(MATCH_END_REASONS) === show(["end_screen", "manual", "lobby", "progression", "valorant_exit", "new_match"]));
  }

  console.log("\n── [F03] rapor prompt'u + deterministik şablon (dört kopya tek yardımcıda) ──");
  {
    // aimlo-runtime 01.txt biçimi: rekabetçi, 12 round, defter 9-4'te donmuş (matchComplete yok).
    const r9_4 = desktopRounds(seq(9, 4).slice(0, 13));
    const unfinished = validated({ rounds: r9_4, lang: "tr", map: "summit", agent: "brimstone", mode: "competitive", side: "attacking" });
    const { systemPrompt, userPrompt } = buildReportPrompts(unfinished, { memoryContext: "" });
    check("rekabetçi 9-4 (eski istemci) → 'Score: 9-4 (UNFINISHED)' (fix yok: '(WIN)')", userPrompt.includes("Score: 9-4 (UNFINISHED)"), userPrompt.split("\n")[1]);
    check("prompt'ta sonuç yasağı (kural 12) var", /12\. ⏸ MAÇ SONUCU KESİN DEĞİL/.test(systemPrompt) && systemPrompt.includes("\"kazandın\", \"kaybettin\""));
    check("summary alan tarifi sonuç istemiyor ('maç sonucu YOK')", systemPrompt.includes("Oynanan round'ların özü (1 keskin cümle, maç sonucu YOK)"));
    const det = generateDeterministicReport(unfinished);
    check("deterministik matchWon=null, matchResult=UNFINISHED (fix yok: true)", det.matchWon === null && det.matchResult === "UNFINISHED", `won=${det.matchWon} result=${det.matchResult}`);
    check("şablon 'önde/geride kapattın' demiyor, nötr cümle", !/kapattın/.test(det.tendencies) && /sonucu kesinleşmedi/.test(det.tendencies), det.tendencies);
    const mc = validated({ rounds: desktopRounds(seq(9, 4).slice(0, 13)), lang: "tr", map: "summit", matchComplete: false, endReason: "manual" });
    check("matchComplete:false (mod yok) → UNFINISHED; endReason 'manual' korunur",
      buildReportPrompts(mc, { memoryContext: "" }).userPrompt.includes("(UNFINISHED)") && mc.endReason === "manual" && mc.matchComplete === false);
    const bogus = validated({ rounds: desktopRounds(seq(2, 1)), lang: "tr", map: "bind", matchComplete: "false", endReason: "hack" });
    check("matchComplete 'false' dizesi / tanınmayan endReason yok sayılır (alan yokmuş gibi)", bogus.matchComplete === undefined && bogus.endReason === undefined && !("matchComplete" in bogus));
    const draw = validated({ rounds: desktopRounds(seq(4, 4)), lang: "en", map: "bind", matchComplete: true });
    const dp = buildReportPrompts(draw, { memoryContext: "" });
    const dd = generateDeterministicReport(draw);
    check("(4,4,true) → 'Score: 4-4 (DRAW)' + berabere kuralı; matchWon=null (fix yok: '(LOSS)', false)",
      dp.userPrompt.includes("Score: 4-4 (DRAW)") && /MAÇ BERABERE BİTTİ/.test(dp.systemPrompt) && dd.matchWon === null && dd.matchResult === "DRAW", `won=${dd.matchWon}`);
    const win = validated({ rounds: desktopRounds(seq(13, 11)), lang: "tr", map: "bind", mode: "competitive", matchComplete: true });
    const wp = buildReportPrompts(win, { memoryContext: "" });
    check("(13,11,true) → '(WIN)', kural 12 YOK, summary tarifi eskisi gibi",
      wp.userPrompt.includes("Score: 13-11 (WIN)") && !/\n12\. /.test(wp.systemPrompt) && wp.systemPrompt.includes("- summary: Neden kazanıldı/kaybedildi (1 keskin cümle) + skor"));
    // Ücretli A/B (FB01): TR R4 summary 3/3 tekrarda "skor 9-4 (unfinished)" / "(UNFINISHED)" /
    // "maç UNFINISHED" — Score satırı etiketi sızdı (kural 12 TR'de yetmedi). Temizleyici çevirir.
    const leakTr = finalizeReportFields({ summary: "Summit, Brimstone ile 12 round analiz: skor 9-4 (UNFINISHED). Hayatta kalma %33.", mistake: "R12'de B Lobby'de tek kaldın; maç UNFINISHED, dersi round'dan al.",
      tendencies: "Rakip B Main'i tutuyor.", adjustment: "B Main'e smoke ile gir VEYA A'ya dön.", bestRound: "R4: hayatta kaldın.", decisionScore: "5/10 — skor 9-4 (unfinished)." }, unfinished, det)!;
    check("etiket sızıntısı: '(UNFINISHED)' / 'maç UNFINISHED' / '(unfinished)' → Türkçe, 'unfinished' kalmaz",
      FIELDS.every((f) => !/unfinished/i.test(leakTr[f])) && leakTr.summary.includes("skor 9-4 (sonuç kesinleşmedi)") && leakTr.mistake.includes("maç sonucu kesinleşmemiş"), show({ s: leakTr.summary, m: leakTr.mistake }));
    const enBody = validated({ rounds: r9_4, lang: "en", map: "summit", mode: "competitive" });
    const leakEn = finalizeReportFields({ summary: "Summit match, score 9-4 (unfinished). Deaths cluster at B.", mistake: "R12: alone at B Lobby.", tendencies: "Enemy holds B Main.",
      adjustment: "Smoke B Main OR rotate A.", bestRound: "R4: survived.", decisionScore: "5/10 — mid." }, enBody, generateDeterministicReport(enBody))!;
    check("EN: '(unfinished)' → '(result not confirmed)'", leakEn.summary.includes("score 9-4 (result not confirmed)"), leakEn.summary);
    const clean = finalizeReportFields(JSON.parse(GOOD_AI), unfinished, det)!;
    check("etiket yoksa temizleyici metne dokunmaz (bayt-aynı yol)", !/kesinleş/.test(clean.summary + clean.mistake), clean.summary);
  }

  // ══════════════════════════════════════════════════════════════════════
  console.log("\n── [F03] player_memory — null maç wins/games'e GİRMEZ (gerçek lib/player-memory) ──");
  const route = loadReportRoute(); // çözümleyici + route sahteleri kurulur
  {
    type ModCache = Record<string, { exports: unknown } | undefined>;
    const M = Module as unknown as { _cache: ModCache };
    const pmPath = require.resolve(path.join(REPO_ROOT, "lib/player-memory"));
    const sbPath = require.resolve(path.join(REPO_ROOT, "lib/supabase/server"));
    const savedPm = M._cache[pmPath];
    const savedSb = M._cache[sbPath];
    const store: { row: Record<string, unknown> | null; upserts: Record<string, unknown>[] } = {
      row: { mapStats: { Ascent: { wins: 2, losses: 1 } }, agentStats: { Jett: { wins: 2, losses: 1 } }, weakLocations: {}, tendencies: [], totalMatches: 3, totalRounds: 60, overallWinRate: 2 / 3 },
      upserts: [],
    };
    const client = {
      from: () => {
        const q = {
          select: () => q,
          eq: () => q,
          maybeSingle: async () => ({ data: store.row ? { memory_data: store.row, updated_at: "2026-09-24T00:00:00Z" } : null, error: null }),
          upsert: async (payload: Record<string, unknown>) => {
            store.upserts.push(payload);
            store.row = payload.memory_data as Record<string, unknown>;
            return { error: null };
          },
        };
        return q;
      },
    };
    M._cache[sbPath] = { id: sbPath, filename: sbPath, loaded: true, exports: { createServiceSupabase: () => client }, children: [], paths: [] } as unknown as { exports: unknown };
    delete M._cache[pmPath];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const realPm = require(pmPath) as { updatePlayerMemory: (u: string, d: Record<string, unknown>) => Promise<void> };
    if (savedPm) M._cache[pmPath] = savedPm; else delete M._cache[pmPath];
    if (savedSb) M._cache[sbPath] = savedSb; else delete M._cache[sbPath];
    const rounds = [{ deathLocation: "A Main", survived: false, skipped: false, result: "loss" }];
    await realPm.updatePlayerMemory("u-mem", { map: "Ascent", agent: "Jett", won: null, rounds });
    const m1 = (store.upserts[0]?.memory_data ?? {}) as Record<string, Record<string, { wins: number; losses: number }> | number>;
    const asc = (m1.mapStats as Record<string, { wins: number; losses: number }>)?.Ascent;
    const jett = (m1.agentStats as Record<string, { wins: number; losses: number }>)?.Jett;
    check("won=null → mapStats/agentStats wins-losses DEĞİŞMEZ (2/1), WR 2/3 aynı (fix yok: losses 2)",
      asc?.wins === 2 && asc?.losses === 1 && jett?.wins === 2 && jett?.losses === 1 && Math.abs((m1.overallWinRate as number) - 2 / 3) < 1e-9,
      show({ asc, jett, wr: m1.overallWinRate }));
    check("won=null → maç yine sayılır (totalMatches 4) ve ölüm konumu birikir", m1.totalMatches === 4 && show(m1.weakLocations) === show({ "A Main": 1 }), show({ t: m1.totalMatches, w: m1.weakLocations }));
    await realPm.updatePlayerMemory("u-mem", { map: "Ascent", agent: "Jett", won: true, rounds });
    const m2 = (store.upserts[1]?.memory_data ?? {}) as Record<string, Record<string, { wins: number; losses: number }>>;
    check("won=true → wins 3 (bilinen sonuç eskisi gibi sayılır)", m2.mapStats?.Ascent?.wins === 3 && m2.mapStats?.Ascent?.losses === 1, show(m2.mapStats));
  }

  console.log("\n── [F03] route — matchComplete:false → raw_result_json.won === null, hafıza won=null ──");
  {
    resetHarness();
    delete process.env.OPENAI_API_KEY; // anahtarsız dev yolu (şablon) — DB/hafıza yolu yine koşar
    harness.db = newFakeDb();
    const res = await route.POST(reportRequest({
      rounds: desktopRounds(seq(9, 4).slice(0, 13)), lang: "tr", map: "summit", agent: "brimstone", mode: "competitive",
      matchComplete: false, endReason: "manual", matchId: MID, persistOnServer: true,
    }));
    const body = await res.json() as Record<string, unknown>;
    const row = harness.db.rows.get(MID) as Record<string, unknown> | undefined;
    const raw = (row?.raw_result_json ?? {}) as Record<string, unknown>;
    check("200 + matchWon=null + matchResult UNFINISHED", res.status === 200 && body.matchWon === null && body.matchResult === "UNFINISHED", `status=${res.status} won=${body.matchWon}`);
    check("raw_result_json.won === null, result 'UNFINISHED', matchComplete/endReason kayıtta", raw.won === null && raw.result === "UNFINISHED" && raw.matchComplete === false && raw.endReason === "manual", show({ won: raw.won, result: raw.result }));
    check("updatePlayerMemory won=null ile çağrıldı (wins/games artmaz)", harness.memoryUpdates.length === 1 && harness.memoryUpdates[0].won === null, show(harness.memoryUpdates.map((m) => m.won)));
    check("kayıt yazıldı (savedAnalysisId = matchId)", body.savedAnalysisId === MID);
  }

  // ══════════════════════════════════════════════════════════════════════
  console.log("\n── [F13] round tarafı + devre arası ──");
  {
    check("crossedHalfSwap: rekabetçi 13 → true, 12 → false; swiftplay 5 → true; spike_rush 4 → true; bilinmeyen → null",
      crossedHalfSwap(13, "competitive") === true && crossedHalfSwap(12, "competitive") === false && crossedHalfSwap(5, "swiftplay") === true
        && crossedHalfSwap(4, "spike_rush") === true && crossedHalfSwap(20, "") === null);
    const sideRounds = desktopRounds(["loss", "win", "win", "loss", "win", "win", "loss", "win", "loss", "win", "win", "loss", "win"],
      (i) => ({ side: i < 12 ? "defending" : "attacking" }));
    const mixed = validated({ rounds: sideRounds, lang: "tr", map: "summit", agent: "brimstone", mode: "competitive", side: "attacking" });
    const sides = resolveReportSides(mixed);
    const { systemPrompt, userPrompt } = buildReportPrompts(mixed, { memoryContext: "" });
    check("13 round, R1-R12 savunma + R13 saldırı → mixed (round verisinden)", sides.mixed && sides.perRound, show(sides));
    check("Side satırı 'mixed (… R1-R12 defense, R13 attack)'", userPrompt.includes("Side: mixed (İKİ TARAF — devre arasında taraf değişti; R1-R12 defense, R13 attack)"), userPrompt.split("\n")[0]);
    check("round satırlarında side= var", /R1: loss side=defense died@/.test(userPrompt) && /R13: win side=attack \(alive\)/.test(userPrompt), userPrompt.split("\n").slice(4, 6).join(" | "));
    check("KB side filtresi YOK → summit savunma bölümü prompt'ta ('## 4. Savunma Stratejileri')", systemPrompt.includes("## 4. Savunma Stratejileri"));
    check("kural 9 round-bazlı ('Her round'u KENDİ tarafının diliyle koçla')", systemPrompt.includes("Her round'u KENDİ tarafının diliyle koçla") && systemPrompt.includes("Round'un tarafı round satırındaki side= alanıdır"));
    check("deterministik şablon tek taraf yazmıyor ('Saldırı ve Savunma')", generateDeterministicReport(mixed).summary.includes("Saldırı ve Savunma"));
    const oneSide = validated({ rounds: desktopRounds(seq(3, 2), () => ({ side: "attacking" })), lang: "tr", map: "summit", mode: "competitive", side: "attacking" });
    const op = buildReportPrompts(oneSide, { memoryContext: "" });
    check("tek taraflı maç: KB filtreli (savunma bölümü YOK), eski kural 9", !op.systemPrompt.includes("## 4. Savunma Stratejileri") && op.systemPrompt.includes("savunma maçında \"entry açmadın\" yazmak"));

    const noSide17 = validated({ rounds: desktopRounds(seq(9, 8)), lang: "en", map: "summit", mode: "competitive", side: "attacking" });
    const n17 = buildReportPrompts(noSide17, { memoryContext: "" });
    check("side'sız 17 round rekabetçi → 'mixed' (çıkarım), KB filtresiz", n17.userPrompt.includes("Side: mixed (both sides — sides switched at halftime; per-round side not reported)") && n17.systemPrompt.includes("## 4. Savunma Stratejileri"), n17.userPrompt.split("\n")[0]);
    // 01.txt fixture biçimi: 12 round taşıyor ama son round R13, skor 9-4 (R8 dispatch edilmemiş).
    const gap = desktopRounds(seq(9, 4).slice(0, 13)).filter((r) => r.round !== 8);
    const g = validated({ rounds: gap, lang: "tr", map: "summit", mode: "competitive", side: "attacking" });
    check("12 elemanlı ama son round R13 (skor toplamı 13) → mixed (yalnız rounds.length yetmez)", g.rounds.length === 12 && resolveReportSides(g).mixed);

    // ≤12 round: F13 prompt'u DEĞİŞTİRMEZ — rekabetçi gövde, mod'suz aynı gövdeyle (F13 hiç
    // devreye giremez) "Mode:" parçası dışında bayt-aynı. (HEAD'e karşı tek seferlik kıyas
    // commit mesajında.)
    const ten = desktopRounds(seq(6, 4));
    const withMode = validated({ rounds: ten, lang: "tr", map: "summit", agent: "brimstone", mode: "competitive", side: "attacking", matchComplete: true });
    const noMode = validated({ rounds: ten, lang: "tr", map: "summit", agent: "brimstone", side: "attacking", matchComplete: true });
    const a = buildReportPrompts(withMode, { memoryContext: "" });
    const b = buildReportPrompts(noMode, { memoryContext: "" });
    check("10 round rekabetçi → mixed DEĞİL", !resolveReportSides(withMode).mixed);
    check("10 round: system prompt bayt-aynı, user prompt yalnız ', Mode: Competitive' kadar farklı",
      a.systemPrompt === b.systemPrompt && a.userPrompt.replace(", Mode: Competitive", "") === b.userPrompt);
    check("10 round: Side satırı tek taraf, round satırında side= yok",
      a.userPrompt.includes("Side: attack (SALDIRI — oyuncu site'lara giriyor: entry/execute/trade/space)") && !/ side=/.test(a.userPrompt));
    const spike = validated({ rounds: desktopRounds(seq(4, 2)), lang: "tr", map: "bind", mode: "spike_rush", side: "attacking" });
    check("spike rush 6 round (R3'te taraf değişir, masaüstü is_side_swap_probe_round) → mixed", resolveReportSides(spike).mixed);
  }

  // ══════════════════════════════════════════════════════════════════════
  console.log("\n── [F54] AI hatası → yapılandırılmış hata, kalıcı kayıt / 409 kilidi YOK ──");
  {
    const body = {
      rounds: desktopRounds(["win", "loss", "loss", "win", "loss", "win"]), lang: "tr", map: "ascent", agent: "jett",
      side: "attacking", matchId: MID, persistOnServer: true,
    };
    const cases: { name: string; reply: Parameters<typeof harness.replies.push>[0]; status: number; error: string; reason: string; refund: number }[] = [
      { name: "sahte OpenAI 500", reply: { content: "", status: 500 }, status: 502, error: "ai_upstream_error", reason: "ai_upstream_error", refund: 1 },
      { name: "geçersiz JSON", reply: { content: "bu bir json değil {" }, status: 502, error: "ai_upstream_error", reason: "ai_invalid_json", refund: 0 },
      { name: "geçersiz şekil", reply: { content: JSON.stringify({ summary: "x" }) }, status: 502, error: "ai_upstream_error", reason: "ai_invalid_shape", refund: 0 },
      { name: "timeout (AbortError)", reply: { content: "", throwAbort: true }, status: 504, error: "ai_timeout", reason: "ai_timeout", refund: 1 },
    ];
    for (const c of cases) {
      resetHarness();
      harness.db = newFakeDb();
      process.env.OPENAI_API_KEY = "sk-test-harness-not-real";
      harness.replies = [c.reply];
      const res = await route.POST(reportRequest(body));
      const j = await res.json().catch(() => ({})) as Record<string, unknown>;
      const inserts = harness.db.calls.filter((m) => m === "POST").length;
      check(`${c.name} → ${c.status} {error:${c.error}, detail.reason:${c.reason}} (fix yok: 200 + aiGenerated:false)`,
        res.status === c.status && j.error === c.error && (j.detail as Record<string, unknown>)?.reason === c.reason,
        `status=${res.status} ${show(j).slice(0, 160)}`);
      check(`${c.name}: koç metni YOK, Retry-After 30, TR mesaj`,
        FIELDS.every((f) => !(f in j)) && res.headers.get("retry-after") === "30" && typeof j.message === "string" && /Koç raporu şu an oluşturulamadı/.test(j.message as string));
      check(`${c.name}: INSERT yok (fix yok: şablon analyses'e yazılıyordu)`, inserts === 0 && harness.db.rows.size === 0, `inserts=${inserts}`);
      check(`${c.name}: hafıza güncellenmedi, refine çağrılmadı`, harness.memoryUpdates.length === 0 && harness.fetchCalls.length === 1, `mem=${harness.memoryUpdates.length} fetch=${harness.fetchCalls.length}`);
      check(`${c.name}: günlük kota ${c.refund ? "iade edildi (net 0)" : "harcanmış kalır (model yanıtı ücretlendi; iade = kota delme yüzeyi)"}`,
        harness.dailyCalls === 1 && harness.dailyRefunds === c.refund, `consume=${harness.dailyCalls} refund=${harness.dailyRefunds}`);
    }
    // Aynı matchId ile ikinci istek (OpenAI artık sağlıklı) → 409 DEĞİL, AI çağrılır, kayıt yazılır.
    resetHarness();
    const db = newFakeDb();
    harness.db = db;
    process.env.OPENAI_API_KEY = "sk-test-harness-not-real";
    harness.replies = [{ content: "", status: 500 }];
    await route.POST(reportRequest(body));
    harness.replies = [{ content: GOOD_AI }];
    const res2 = await route.POST(reportRequest(body));
    const j2 = await res2.json() as Record<string, unknown>;
    check("aynı matchId ikinci istek → 200 (409 DEĞİL), AI çağrıldı, aiGenerated=true",
      res2.status === 200 && j2.aiGenerated === true && harness.fetchCalls.length >= 2, `status=${res2.status} ${show(j2).slice(0, 120)}`);
    check("ikinci istekte kayıt yazıldı (savedAnalysisId = matchId)", j2.savedAnalysisId === MID && db.rows.has(MID));
    check("kayıttaki metin AI metni (şablon değil) ve raw_result_json.aiGenerated=true",
      (db.rows.get(MID)?.raw_result_json as Record<string, unknown>)?.aiGenerated === true && /A Main/.test(String(db.rows.get(MID)?.summary)));
    delete process.env.OPENAI_API_KEY;
  }
  {
    // GERÇEK refundDailyQuota (bellek deposu): tek iade, harcamadan fazla iade yok.
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const u = `refund-test-${Date.now()}`;
    let allowed = 0;
    for (let i = 0; i < 10; i++) if ((await consumeDailyQuota(u, "report")) === null) allowed++;
    const eleventh = await consumeDailyQuota(u, "report");
    check("gerçek kota: 10/gün harcandı, 11. istek 429", allowed === 10 && eleventh?.status === 429, `allowed=${allowed} 11.=${eleventh?.status}`);
    const u2 = `refund-test2-${Date.now()}`;
    for (let i = 0; i < 10; i++) await consumeDailyQuota(u2, "report");
    const r1 = await refundDailyQuota(u2, "report");
    const afterRefund = await consumeDailyQuota(u2, "report");
    const overAgain = await consumeDailyQuota(u2, "report");
    check("refundDailyQuota: 1 iade → 1 hak geri gelir, sonraki yine 429", r1 === true && afterRefund === null && overAgain?.status === 429, `r1=${r1} after=${afterRefund?.status ?? "ok"} over=${overAgain?.status}`);
    const u3 = `refund-test3-${Date.now()}`;
    await consumeDailyQuota(u3, "report");
    const once = await refundDailyQuota(u3, "report");
    const twice = await refundDailyQuota(u3, "report");
    const never = await refundDailyQuota(`never-${Date.now()}`, "report");
    check("tek iade: aynı harcama iki kez iade edilmez; harcamasız kullanıcıya iade yok (kota bypass'ı yok)", once === true && twice === false && never === false, show({ once, twice, never }));
  }

  // ══════════════════════════════════════════════════════════════════════
  console.log("\n── [F89] deterministik şablon — ölçülmeyen iddia yok ──");
  for (const lang of ["tr", "en"] as const) {
    // ajan/harita yok + her ölüm FARKLI konumda + enemyCount yok (masaüstü göndermez)
    const locs = ["A Main", "B Site", "Mid", "A Link", "B Main"];
    let li = 0;
    const rounds = desktopRounds(["loss", "win", "loss", "loss", "win", "loss", "loss"]).map((r) => ({ ...r, deathLocation: r.died ? locs[li++] : "" }));
    const v = validated({ rounds, lang });
    const d = generateDeterministicReport(v);
    const texts = FIELDS.map((f) => `${f}: ${d[f]}`);
    const hit = (re: RegExp) => texts.filter((t) => re.test(t));
    check(`${lang}: 6 alanda /\\bUnknown\\b/ yok (fix yok: 'Unknown olarak', 'As Unknown')`, hit(/\bUnknown\b/).length === 0, show(hit(/\bUnknown\b/)));
    check(`${lang}: tekrar iddiası yok (/okunuyor|tekrarlayan|being read|Recurring/)`, hit(/okunuyor|tekrarlayan|being read|Recurring/).length === 0, show(hit(/okunuyor|tekrarlayan|being read|Recurring/)));
    check(`${lang}: '0.0' temas satırı yok`, hit(/0\.0/).length === 0, show(hit(/0\.0/)));
    check(`${lang}: decisionScore'da trade/utility yargısı yok, ölçülen veri var`,
      !/trade|utility/i.test(d.decisionScore) && (lang === "tr" ? /Round kazanma %\d+, hayatta kalma %\d+/ : /\d+% rounds won, \d+% survival/).test(d.decisionScore), d.decisionScore);
  }
  {
    // Alan-yedeği vakası: model bestRound'u Lotus'ta OLMAYAN callout'la yazar → süzgeç boşaltır →
    // stats.bestRound yedeği kullanıcıya gider; ajan okunmamışken "Unknown" basılmamalı.
    const v = validated({ rounds: desktopRounds(["win", "loss", "win"]).map((r) => ({ ...r, died: false })), lang: "tr", map: "lotus" });
    const stats = generateDeterministicReport(v);
    const parsed = { summary: "R1 ve R3'te hayatta kaldın; skor önde.", mistake: "R2'de A Main'e tek girdin.", tendencies: "Rakip A Main'i tutuyor.",
      adjustment: "A Main'e flaşla gir VEYA C'ye dön.", bestRound: "Hookah'tan girdin.", decisionScore: "6/10 — iyi." };
    const fin = finalizeReportFields(parsed, v, stats)!;
    check("Lotus + 'Hookah'tan girdin.' → yedek bestRound'da 'Unknown' yok (fix yok: 'Unknown olarak')",
      !!fin && !/Hookah/.test(fin.bestRound) && !/\bUnknown\b/.test(fin.bestRound) && fin.bestRound.length > 0, show(fin?.bestRound));
    const oneDeath = validated({ rounds: [{ round: 1, score: "0 - 1", result: "loss", died: true, deathLocation: "B Lobby" }], lang: "tr", map: "sunset", agent: "sova" });
    const od = generateDeterministicReport(oneDeath);
    check("tek ölüm → 'bu pozisyon okunuyor' YOK, ajan biliniyorsa 'Sova olarak' kalır",
      !/okunuyor/.test(od.summary + od.adjustment) && /Sova olarak/.test(od.mistake), show({ s: od.summary, m: od.mistake }));
    const repeated = validated({ rounds: desktopRounds(["loss", "loss", "loss", "win"]), lang: "tr", map: "ascent", agent: "jett" });
    const rd = generateDeterministicReport(repeated);
    check("aynı noktada 3 ölüm → tekrar iddiası ölçülmüş, korunur ('okunuyor', 'A Main'de 3 tekrar ölüm')",
      /bu pozisyon okunuyor/.test(rd.summary) && /A Main'de 3 tekrar ölüm/.test(rd.decisionScore), show({ s: rd.summary, d: rd.decisionScore }));
  }

  // ══════════════════════════════════════════════════════════════════════
  console.log("\n── [F18] analyses INSERT hatası → 1 yeniden deneme + persisted:false ──");
  {
    resetHarness();
    delete process.env.OPENAI_API_KEY;
    harness.db = newFakeDb();
    harness.db.failWith = { status: 401, body: { code: "PGRST303", message: "JWT expired", details: null, hint: null } };
    const res = await route.POST(reportRequest({ rounds: desktopRounds(seq(2, 1)), lang: "tr", map: "bind", matchId: MID, persistOnServer: true }));
    const j = await res.json() as Record<string, unknown>;
    const posts = harness.db.calls.filter((m) => m === "POST").length;
    check("sahte PGRST303 → 200 + persisted:false, savedAnalysisId YOK (fix yok: persisted alanı yok)", res.status === 200 && j.persisted === false && j.savedAnalysisId === undefined, show({ s: res.status, p: j.persisted, id: j.savedAnalysisId }));
    check("INSERT bir kez yeniden denendi (2 POST)", posts === 2, `posts=${posts}`);
    resetHarness();
    harness.db = newFakeDb();
    const ok = await route.POST(reportRequest({ rounds: desktopRounds(seq(2, 1)), lang: "tr", map: "bind", matchId: MID, persistOnServer: true }));
    const jo = await ok.json() as Record<string, unknown>;
    check("sağlıklı DB → persisted:true + savedAnalysisId", jo.persisted === true && jo.savedAnalysisId === MID);
    resetHarness();
    const web = await route.POST(reportRequest({ rounds: desktopRounds(seq(2, 1)), lang: "tr", map: "bind" }));
    check("persistOnServer yok (web) → persisted alanı YOK", !("persisted" in (await web.json() as Record<string, unknown>)));
  }

  // ══════════════════════════════════════════════════════════════════════
  console.log("\n── [F48] refine meta-dil kapısı + olgu listesinde round'lar ──");
  {
    const v = validated({
      rounds: [
        { round: 1, score: "0 - 1", result: "loss", died: true, deathLocation: "a/kanalizasyon" },
        { round: 5, score: "2 - 3", result: "loss", died: true },
        { round: 9, score: "4 - 4", result: "win", died: false },
        { round: 10, score: "4 - 5", result: "loss", died: true },
      ],
      lang: "tr", map: "haven", agent: "brimstone", side: "defending",
    });
    const stats = generateDeterministicReport(v);
    const report = { ...stats, summary: "Maç kaybedildi.", aiGenerated: true };
    const before = { ...report };
    const calls: RefineRequestBody[] = [];
    const out = await maybeRefineReport(report, v, async (b) => { calls.push(b); return { content: LIVE_4538, finishReason: "stop" }; });
    const w = out.weakest as (typeof FIELDS)[number] | null;
    check("LOG.txt:4538 summary sahte refine yanıtı → refined=false, metaRejected (fix yok: refined=true)", out.attempted && !out.refined && out.metaRejected === true, show(out));
    check("alan ORİJİNAL kaldı (meta metin yazılmadı)", !!w && report[w] === before[w] && FIELDS.every((f) => report[f] === before[f]), `${w}: ${w && String(report[w]).slice(0, 60)}`);
    const u = calls[0]?.messages[1].content ?? "";
    check("refine olgu listesinde round satırları var (R#, sonuç, ölüm konumu)",
      u.includes("- Round'lar:") && u.includes("  R1: kaybedildi, öldün — a/kanalizasyon") && u.includes("  R9: kazanıldı, hayatta kaldın") && u.includes("  R5: kaybedildi, öldün\n"), u.slice(u.indexOf("- Round'lar"), u.indexOf("- Round'lar") + 200));
    check("kural 1: verilmeyeni anma + eksik veriyi söyleme", u.includes("Verilmeyen bilgiden (ajan, konum, round, skor, sayı) hiç söz etme ve eksik veriyi okuyucuya söyleme"));
    const en = "You lost 4-5. R5 and R10 are not in the list — I can't write about them. Survival numbers aren't in the facts, so I can't mention them. Hold A Sewer with your team.";
    check("EN karşılığı ('not in the list', 'can't write/mention') meta sayılır", hasRefineMetaLanguage(en));
    check("normal koç metni meta sayılmaz ('listede' geçse bile: 'kadro listesinde yok' değil)",
      !hasRefineMetaLanguage("R5'te A Main'e tek girdin; bir sonraki round flaşla gir ve takımı bekle.")
        && !hasRefineMetaLanguage("Rakip kadroda Chamber var; OP'yi listelediği açıya bakma, off-angle tut.")
        && !hasRefineMetaLanguage("You can't win the duel from that angle; swing wide with a flash."));
    // Yanlış-pozitif ölçümü: eval-out'taki (gitignore'lu, ücretli koşu çıktısı) kabul edilmiş refine alanları.
    const dir = path.join(REPO_ROOT, "scripts", "eval-out");
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^report-.*\.json$/.test(f)) : [];
    if (files.length === 0) {
      console.log("  ℹ scripts/eval-out/report-*.json yok (temiz klon) — yanlış-pozitif ölçümü atlandı");
    } else {
      let refinedFields = 0;
      let refinedHits = 0;
      let allFields = 0;
      const allHits: string[] = [];
      for (const f of files) {
        const arr = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { id?: string; refined?: boolean; refinedField?: string; final?: Record<string, string> }[];
        for (const s of Array.isArray(arr) ? arr : []) {
          if (!s.final) continue;
          for (const k of FIELDS) {
            const t = s.final[k];
            if (typeof t !== "string") continue;
            allFields++;
            if (hasRefineMetaLanguage(t)) allHits.push(`${f}:${s.id}:${k}`);
          }
          if (s.refined && s.refinedField && typeof s.final[s.refinedField] === "string") {
            refinedFields++;
            if (hasRefineMetaLanguage(s.final[s.refinedField])) refinedHits++;
          }
        }
      }
      check(`yanlış-pozitif: eval-out'taki ${refinedFields} kabul edilmiş refine alanında 0 eşleşme`, refinedHits === 0 && refinedFields > 0, `hits=${refinedHits}`);
      check(`yanlış-pozitif: eval-out'taki ${allFields} final rapor alanında 0 eşleşme`, allHits.length === 0, show(allHits));
    }
  }

  console.log(`\n${fail === 0 ? "✅" : "❌"} test-report-outcome: ${pass} geçti, ${fail} kırık\n`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
