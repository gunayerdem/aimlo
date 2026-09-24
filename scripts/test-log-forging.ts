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

  console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
