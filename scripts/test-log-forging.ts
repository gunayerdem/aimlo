/**
 * LOG FORGING KİLİDİ — vision yolunun console şablonları (W2 inceleme RW1-F2, 2026-09-24).
 *
 * KÖK: 1b61e55 yalnız canlı-sayısı WARN satırını kapatmıştı (aliveCountForLog). Aynı
 * sınıf (kullanıcı kontrollü değer TİP/İÇERİK kontrolü olmadan log şablonunda) aynı
 * route'ta açıktı: imageFormat red satırı (isValidVisionRequest PNG için yalnız
 * `includes("png")` ister), maxTokens satırı (tip doğrulaması yok), builder'ın [KB]
 * seçici satırı ve knowledge-loader'ın seçici uyarıları (map/agent/rank ≤4096 kr).
 *
 *   [1] logSafe birim sözleşmesi — sıradan değer bayt-aynı, satır sonu/bidi kaçışlı.
 *   [2] kaynak-yapı kilidi — route/builder/loader şablonları ham değer basmaz.
 *   [3] DAVRANIŞ — GERÇEK vision POST handler'ı (scripts/vision-route-harness.ts):
 *       sahte satır enjekte eden gövde 200 döner ve hiçbir log girdisi yeni satırla
 *       başlayan sahte "[Aimlo AI] …" satırı taşımaz.
 *   [4] W2 inceleme B06-F2 — kurucu log satırları onLog alıcısıyla üretildiği an
 *       iletilir: kurucu istisna atsa da o ana kadarki teşhis satırı kaybolmaz.
 *   [5] W2 inceleme B06-F2 — tip-karışık gövde (side/killerInfo/… sayı) 500 değil;
 *       genel catch yanıtına iç hata metni konmaz.
 * RUN: npx tsx scripts/test-log-forging.ts
 */
import fs from "node:fs";
import path from "node:path";
import { logSafe } from "../lib/log-safe";
import { captureVisionCall } from "./vision-route-harness";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};

const FORGED = "\n[Aimlo AI] vision OK user=admin";

async function main() {
  console.log("\n[1] logSafe — sıradan değer bayt-aynı, enjeksiyon kaçışlı");
  t("sıradan dizeler aynen ('Ascent', 'image/jpeg', 'Jett', 'Iron 2')",
    ["Ascent", "image/jpeg", "Jett", "Iron 2", "KAY/O"].every((s) => logSafe(s) === s));
  t("sayı/boolean → String (900, 2.5, true)", logSafe(900) === "900" && logSafe(2.5) === "2.5" && logSafe(true) === "true");
  const f = logSafe("png" + FORGED);
  t("satır sonu \\u000a olarak kaçışlı, ham '\\n' yok", !f.includes("\n") && f.includes("\\u000a[Aimlo AI]"), `→ ${JSON.stringify(f)}`);
  t("CR / U+2028 / bidi RLO kaçışlı", !/[\r\u2028\u202e]/.test(logSafe("a\rb\u2028c\u202ed")) && logSafe("a\rb").includes("\\u000d"));
  t("uzun dize kapaklı (64 + uzunluk notu)", logSafe("x".repeat(500)) === `${"x".repeat(64)}…(+436)`);
  t("null/undefined/nesne/dizi → yalnız tip etiketi",
    logSafe(null) === "<null>" && logSafe(undefined) === "<undefined>" && logSafe({ a: 1 }) === "<object>" && logSafe(["png\n"]) === "<array>");

  console.log("\n[2] kaynak-yapı kilidi — log şablonlarında ham istemci değeri yok");
  const read = (rel: string) => fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
  const route = read("app/api/ai/vision/route.ts");
  const consoleLines = route.split(/\r?\n/).filter((l) => /console\.(log|warn|error)\(/.test(l));
  // Ham interpolasyon biçimleri: ${rawFormat}, ${rawMaxTokens}, ${rawMaxTokens ?? …}, ${reqBody.x}.
  const rawHits = consoleLines.filter((l) => /\$\{rawFormat\}|\$\{rawMaxTokens\s*(?:\}|\?\?)|\$\{reqBody\.|\$\{\(body as VisionRequest\)\./.test(l));
  t("route console şablonlarında ${rawFormat} / ${rawMaxTokens…} / ${reqBody.…} yok", rawHits.length === 0, JSON.stringify(rawHits));
  t("route imageFormat + maxTokens satırları logSafe'ten geçer",
    /imageFormat rejected: "\$\{logSafe\(rawFormat\)\}"/.test(route) && /requested=\$\{[^`]*logSafe\(rawMaxTokens\)/.test(route));
  const builder = read("lib/vision-prompt-builder.ts");
  const kbLine = builder.split(/\r?\n/).find((l) => l.includes("selectors map=")) ?? "";
  t("builder [KB] seçici satırı map/agent/rank'ı logSafe'ten geçirir",
    ["logSafe(reqMap)", "logSafe(reqAgent)"].every((s) => kbLine.includes(s))
      && /rank=\$\{[^}]*logSafe\(reqRank\)/.test(builder), `→ ${kbLine.trim()}`);
  const loader = read("lib/knowledge-loader.ts");
  const warnLines = loader.split(/\r?\n/).filter((l) => /\[KB\] (?:agent|map|matchup) selector|Bu Ajana Karşı" bölümü yok/.test(l));
  t("knowledge-loader seçici uyarıları (4 satır) logSafe'ten geçer",
    warnLines.length === 4 && warnLines.every((l) => l.includes("logSafe(") && !/'\$\{(?:agent|map|enemyAgent)\}'/.test(l)),
    JSON.stringify(warnLines.map((l) => l.trim())));

  console.log("\n[3] DAVRANIŞ — GERÇEK vision route'u, sahte satır enjeksiyonu");
  const cap = await captureVisionCall({
    died: true, round: 3, map: "Ascent" + FORGED, agent: "Jett" + FORGED, rank: "Gold" + FORGED,
    killerInfo: "killed by jett with vandal", imageFormat: "png" + FORGED, maxTokens: "900" + FORGED,
  });
  t("istek 200 (davranış değişmedi — yalnız log gösterimi)", cap.status === 200, `status=${cap.status} ${JSON.stringify(cap.json).slice(0, 160)}`);
  const forgedLines = cap.logs.filter((l) => l.includes(FORGED));
  t("hiçbir log girdisi ham '\\n[Aimlo AI] vision OK' taşımaz (0 sahte satır)", forgedLines.length === 0,
    JSON.stringify(forgedLines.map((l) => l.slice(0, 120))));
  t("red/seçici satırları yine basılıyor (gözlemlenebilirlik korunur)",
    cap.logs.some((l) => l.startsWith("[Aimlo AI] imageFormat rejected: \"png\\u000a[Aimlo AI]"))
      && cap.logs.some((l) => l.includes("[Aimlo AI] maxTokens: requested=900\\u000a"))
      && cap.logs.some((l) => l.includes("selectors map=Ascent\\u000a")),
    JSON.stringify(cap.logs.filter((l) => /imageFormat|maxTokens|selectors/.test(l)).map((l) => l.slice(0, 140))));
  const clean = await captureVisionCall({ died: true, round: 3, map: "Ascent", agent: "Jett", rank: "Gold", killerInfo: "killed by jett with vandal" });
  t("sıradan istek: [KB] seçici satırı eski biçimde ('map=Ascent agent=Jett rank=Gold')",
    clean.logs.some((l) => l.includes("selectors map=Ascent agent=Jett rank=Gold enemies=0")),
    JSON.stringify(clean.logs.filter((l) => l.includes("selectors")).map((l) => l.slice(-80))));

  // ── [4] W2 inceleme B06-F2: kurucu log satırları istisna yolunda KAYBOLMAZ ──────
  // Eskiden buildVisionUserMessage satırları `logs` dizisinde biriktirip dönüyordu;
  // kurucu istisna atınca (tip-karışık gövde → classifyDeath) route o diziyi hiç
  // görmüyor, alive-count WARN'ı Vercel logundan düşüyordu. onLog alıcısı satırı
  // üretildiği an alır. Sahte istisna: alive-count WARN'ından SONRA okunan bir alanın
  // getter'ı atar (JSON gövdesi bunu yapamaz — yalnız kurucunun sözleşmesini sınar).
  console.log("\n[4] kurucu log alıcısı — istisna yolunda da satır kaybı yok");
  const { buildVisionUserMessage, buildVisionSystemMessage } = await import("../lib/vision-prompt-builder");
  const got: string[] = [];
  const throwing: Record<string, unknown> = { died: true, round: 2, alliesAlive: 9, enemiesAlive: 1, side: "defending", map: "Ascent", agent: "Jett" };
  Object.defineProperty(throwing, "roundHistory", { enumerable: true, get() { throw new Error("sahte kurucu istisnası"); } });
  let threw = false;
  try {
    buildVisionUserMessage({ body: throwing as never, lang: "tr", imageAvailable: true, onLog: (l) => got.push(l.msg) });
  } catch { threw = true; }
  t("istisna atıldı ve alive-count WARN'ı alıcıya ondan ÖNCE ulaştı",
    threw && got.some((m) => m.includes("alive-count out of contract dropped: allies=9")), JSON.stringify(got));
  const okBody = { died: true, round: 3, map: "Ascent", agent: "Jett", rank: "Gold", killerInfo: "killed by jett with vandal", alliesAlive: 9 } as never;
  const streamedU: string[] = [];
  const u = buildVisionUserMessage({ body: okBody, lang: "tr", imageAvailable: true, onLog: (l) => streamedU.push(l.msg) });
  const streamedS: string[] = [];
  const sy = buildVisionSystemMessage({ body: okBody, lang: "tr", memoryContext: "", onLog: (l) => streamedS.push(l.msg) });
  t("başarılı yolda alıcıya giden satırlar = dönen `logs` (aynı sıra, aynı içerik)",
    JSON.stringify(streamedU) === JSON.stringify(u.logs.map((l) => l.msg)) && JSON.stringify(streamedS) === JSON.stringify(sy.logs.map((l) => l.msg))
      && streamedU.length >= 2 && streamedS.length >= 2, JSON.stringify({ streamedU, streamedS }).slice(0, 300));
  const routeSrc = read("app/api/ai/vision/route.ts");
  t("route kurucuya onLog veriyor, dönen diziyi sonradan toplu basmıyor",
    (route.match(/onLog: emitVisionLog/g) ?? []).length === 2 && !/emitVisionLogs\(/.test(route));

  // ── [5] W2 inceleme B06-F2: tip-karışık gövde 500 değil; iç hata metni yanıta sızmaz ──
  console.log("\n[5] tip-karışık gövde → 200; iç hata metni yanıt gövdesinde yok");
  const mixed = await captureVisionCall({
    died: true, round: 4, map: "Ascent", agent: "Jett", side: 1, killerInfo: 5, deathLocation: 7,
    deathTiming: 2, economyType: 3, loadout: 9,
  });
  t("side/killerInfo/deathLocation/deathTiming/economyType/loadout sayı → 200 (eskiden 500)", mixed.status === 200,
    `status=${mixed.status} ${JSON.stringify(mixed.json).slice(0, 200)}`);
  const { loadVisionRoute, visionRequest } = await import("./vision-route-harness");
  const { harness } = await import("./report-route-harness");
  const r = loadVisionRoute();
  harness.replies = []; // sahte OpenAI yanıtı yok → fetch istisna atar → route'un genel catch'i
  process.env.OPENAI_API_KEY = "sk-test-harness-not-real";
  const origErr = console.error; const origLog = console.log; const origWarn = console.warn;
  const errs: string[] = [];
  console.error = (...a: unknown[]) => { errs.push(a.map(String).join(" ")); };
  console.log = () => {}; console.warn = () => {};
  let res: Response;
  try { res = await r.POST(visionRequest({ died: true, round: 1, map: "Ascent", agent: "Jett" })); }
  finally { console.error = origErr; console.log = origLog; console.warn = origWarn; delete process.env.OPENAI_API_KEY; }
  const body = await res.json() as Record<string, unknown>;
  t("genel catch → 500 ai_internal_error, message genel ('Internal server error'), iç metin YOK",
    res.status === 500 && body.error === "ai_internal_error" && body.message === "Internal server error"
      && !JSON.stringify(body).includes("harness"), JSON.stringify(body));
  t("ayrıntı sunucu loguna yazılıyor (teşhis kaybolmaz)", errs.some((e) => e.includes("Vision route error:") && e.includes("harness")), JSON.stringify(errs));

  console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
