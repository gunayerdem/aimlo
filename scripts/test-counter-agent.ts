// Karşı-ajan kesiti (killerInfo → "Bu Ajana Karşı") smoke testleri.
// Dalga-6 KRİTİK dersi: bu wiring doğrulama zincirinde hiç egzersiz edilmediği
// için ölü-kod olarak yeşil geçmişti — bu betik loader-seviyesi garantileri sabitler.
// died=false kapısı LOADER'da DEĞİL route'ta yaşar (app/api/ai/vision/route.ts,
// reqKillerInfo yalnız died===true iken loader'a geçer); loader'ın garantisi
// "killerInfo yok/boş → kesit yok"tur — burada o garanti test edilir.
// RUN: npx tsx scripts/test-counter-agent.ts  (exit 1 = kırık)
import fs from "fs";
import path from "path";
import {
  loadVisionKnowledge,
  extractEnemyAgentFromKillerInfo,
  getAgentFile,
  AGENT_ROLE_MAP,
} from "../lib/knowledge-loader";

let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) console.log(`  ok  ${name}`);
  else { fail++; console.log(`  FAIL ${name}: got=${g} want=${w}`); }
};

// ── Yardımcılar ────────────────────────────────────────────
const COUNTER_MARKER = "[KARŞI-AJAN — ";
// knowledge-loader.ts COUNTER_SECTION_CAP_BYTES ile aynı değer (kesit sert tavanı).
const CAP = 1400;

/** contextual bloğundan [KARŞI-AJAN ...] parçasını çıkar (yoksa null). */
function counterPart(ctx: string | undefined): string | null {
  if (!ctx) return null;
  const i = ctx.indexOf(COUNTER_MARKER);
  if (i < 0) return null;
  const rest = ctx.slice(i);
  const end = rest.indexOf("\n\n---\n\n");
  return end < 0 ? rest : rest.slice(0, end);
}

/** Kesit gövdesi = marker satırından SONRAKİ kısım (tavan ölçümü loader ile aynı birim). */
function counterBody(part: string): string {
  const nl = part.indexOf("\n");
  return nl < 0 ? "" : part.slice(nl + 1);
}

/**
 * Ajan dosyasındaki "Bu Ajana Karşı" H2 bölümünün İLK içerik satırını dosyadan
 * ham oku ("kesit gerçekten O dosyadan geldi" kanıtı). Loader'ın H2-bölme
 * regex'inin birebir aynısı; dekoratif ═ satırları atlanır (stripKbWhitespace
 * onları siler). Bölüm yoksa null.
 */
function firstCounterLineFromFile(agentName: string): string | null {
  const rel = getAgentFile(agentName);
  if (!rel) return null;
  const raw = fs.readFileSync(path.join(process.cwd(), "knowledge", rel), "utf-8");
  const sections = raw.split(/(?=^## )/gm);
  for (const section of sections) {
    const h = section.match(/^## (.+)$/m);
    if (!h || !/bu ajana karş[ıi]/i.test(h[1])) continue;
    for (const line of section.split(/\r?\n/).slice(1)) {
      const t = line.replace(/[ \t\r]+$/, "");
      if (!t || /^═+$/.test(t)) continue;
      return t;
    }
  }
  return null;
}

/** Bir killer-ajan vakasını uçtan uca doğrula: kesit var + doğru dosyadan + ≤tavan. */
function assertCounterCase(label: string, killerInfo: string, agentName: string): void {
  const res = loadVisionKnowledge({ killerInfo });
  const part = counterPart(res.blocks.contextual);
  eq(`${label}: kesit var`, part !== null, true);
  const rel = getAgentFile(agentName);
  eq(`${label}: files işaretçisi`, res.files.includes(`${rel}#bu-ajana-karsi`), true);
  eq(`${label}: marker doğru ajan`, (part ?? "").startsWith(`${COUNTER_MARKER}${agentName}`), true);
  eq(`${label}: 'Bu Ajana Karşı' başlığı kesitte`, /bu ajana karş[ıi]/i.test(part ?? ""), true);
  const fileLine = firstCounterLineFromFile(agentName);
  eq(`${label}: dosyada bölüm mevcut`, fileLine !== null, true);
  eq(`${label}: içerik ${agentName} dosyasından`, fileLine !== null && (part ?? "").includes(fileLine), true);
  eq(`${label}: kesit ≤1.4KB`, part !== null && counterBody(part).length <= CAP, true);
}

// ── 1) killerInfo → kesit gelir, içerik doğru ajanın dosyasından ──
assertCounterCase("jett", "killed by jett with vandal", "Jett");
assertCounterCase("sage", "killed by sage", "Sage");

// ── 2) killerInfo'suz → kesit yok ──
{
  const res = loadVisionKnowledge({ agent: "Omen", map: "Ascent" });
  eq("killerInfo yok: kesit yok", counterPart(res.blocks.contextual), null);
  eq("killerInfo yok: files işaretçisi yok", res.files.some((f) => f.includes("#bu-ajana-karsi")), false);
}

// ── 3) Sözlükte olmayan ad → kesit yok ──
{
  eq("xyz: extract null", extractEnemyAgentFromKillerInfo("killed by xyz"), null);
  const res = loadVisionKnowledge({ killerInfo: "killed by xyz" });
  eq("xyz: kesit yok", counterPart(res.blocks.contextual), null);
}

// ── 4) died=false → kesit yok (route kapısının birebir simülasyonu) ──
// route.ts: reqKillerInfo = died===true && killerInfo ? sanitize(killerInfo) : undefined
{
  const routeGate = (died: boolean, raw: string): string | undefined =>
    died === true && raw.length > 0 ? raw : undefined;
  const res = loadVisionKnowledge({ killerInfo: routeGate(false, "killed by jett with vandal") });
  eq("died=false: loader'a killerInfo geçmez → kesit yok", counterPart(res.blocks.contextual), null);
  eq("boş killerInfo: extract null", extractEnemyAgentFromKillerInfo(""), null);
}

// ── 5) Tam-kelime eşleşme / yanlış-pozitif tuzakları ──
eq("silah 'ares' ajan sanılmaz", extractEnemyAgentFromKillerInfo("killed by xyz with ares"), null);
eq("phoenix + ares birlikte → Phoenix", extractEnemyAgentFromKillerInfo("killed by phoenix with ares"), "Phoenix");
eq("cloverfield Clove DEĞİL (tam-kelime)", extractEnemyAgentFromKillerInfo("cloverfield"), null);
eq("gömülü ad eşleşmez (xyzneon)", extractEnemyAgentFromKillerInfo("killed by xyzneon with vandal"), null);
eq("kayo slug toleransı → KAY/O", extractEnemyAgentFromKillerInfo("killed by kayo with vandal"), "KAY/O");
eq("kay/o ham adı → KAY/O", extractEnemyAgentFromKillerInfo("killed by kay/o"), "KAY/O");
eq("en-önce geçen ajan kazanır", extractEnemyAgentFromKillerInfo("killed by sage with vandal jett"), "Sage");
eq("Türkçe dotted-İ (VİPER) → Viper", extractEnemyAgentFromKillerInfo("KILLED BY VİPER"), "Viper");

// ── 6) Ayna-eşleşme guard'ı: katil = oyuncunun kendi ajanı → mükerrer kesit yok ──
// (Chamber dosyasında bölüm VAR — guard'ın gerçekten bastırdığı kanıtlanır.)
{
  eq("ön-koşul: chamber dosyasında bölüm var", firstCounterLineFromFile("Chamber") !== null, true);
  const res = loadVisionKnowledge({ agent: "Chamber", killerInfo: "killed by chamber with the operator" });
  eq("ayna-eşleşme: kesit bastırılır", res.files.some((f) => f.includes("#bu-ajana-karsi")), false);
}

// ── 7) Kapsam süpürmesi: bölümü OLAN her ajan için kesit gelir ve ≤tavan ──
// (Bölümü olmayan dosya atlanır — içerik kapsamı verify-kb'nin işi; burası wiring.)
{
  let exercised = 0;
  for (const agentName of Object.keys(AGENT_ROLE_MAP).sort()) {
    if (firstCounterLineFromFile(agentName) === null) continue;
    const killerInfo = `killed by ${agentName.toLowerCase()} with vandal`;
    const res = loadVisionKnowledge({ killerInfo });
    const part = counterPart(res.blocks.contextual);
    if (part === null) {
      fail++;
      console.log(`  FAIL süpürme ${agentName}: bölüm dosyada var ama kesit gelmedi`);
      continue;
    }
    if (!part.startsWith(`${COUNTER_MARKER}${agentName}`)) {
      fail++;
      console.log(`  FAIL süpürme ${agentName}: marker yanlış ajanı gösteriyor`);
      continue;
    }
    if (counterBody(part).length > CAP) {
      fail++;
      console.log(`  FAIL süpürme ${agentName}: kesit tavanı aşıyor (${counterBody(part).length} > ${CAP})`);
      continue;
    }
    exercised++;
  }
  console.log(`  ok  süpürme: ${exercised} ajan kesiti egzersiz edildi`);
  // Dalga-7 (2026-07-20) sonrası 29/29 ajan dosyasında bölüm TAM; H2'ler DONMUŞ
  // (silme/yeniden-adlandırma yasak) → taban 29. Bölümü kaybolan dosya süpürmede
  // sessizce atlanır (continue) — bu taban o kaybı yakalayan tek otomatik guard.
  eq("süpürme: en az 29 kesit (29/29 tam)", exercised >= 29, true);
}

console.log(fail === 0 ? "\nTÜM TESTLER GEÇTİ ✓" : `\n${fail} TEST BAŞARISIZ ✗`);
process.exit(fail === 0 ? 0 : 1);
