/**
 * KNOWLEDGE-LOADER SAF FONKSİYON TESTLERİ (F60, pano dalga 2026-08-04)
 * NEDEN: extractEnemyAgentFromKillerInfo / stripRankSections / filterSectionsBySide
 * export edilen, fs'e dokunmayan SAF string fonksiyonları — ama davranışları yalnız
 * verify-kb'nin dolaylı yolundan sınanıyordu. Üçü de yaşanmış bug sınıfları taşıyor:
 *   - dotted-İ OCR tuzağı (3 aylık ölüm bug'ının kök nedeni) → NFD normalize
 *   - Chromium uppercase-İ tuzağı ("RANK BAZINDA" /i ile eşleşmez) → [ıiİI] sınıfı
 *   - side-filtresinin H2-öncesi girişi asla düşürmeme sözleşmesi
 * Bu testler o davranışları DOĞRUDAN kilitler. Tamamen OFFLINE (fonksiyonlar fs okumaz).
 * RUN: npx tsx scripts/test-kb-pure-fns.ts
 */
import {
  extractEnemyAgentFromKillerInfo,
  stripRankSections,
  filterSectionsBySide,
} from "../lib/knowledge-loader";
import fs from "node:fs";
import path from "node:path";
import { knownAgent } from "../lib/format-display";
import { cleanCoachText } from "../lib/coach-text";
import { extractKillerAgent } from "../lib/reality-checker";
import { AGENT_ABILITIES } from "../lib/agent-abilities";
import {
  classifyDeath,
  sanitizeAliveCount,
  aliveCountForLog,
  ALLIES_ALIVE_MAX,
  ENEMIES_ALIVE_MAX,
  ULT_POCKET_EXEMPT,
} from "../lib/death-type";

let fail = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (!kosul) fail++;
};

console.log("\n[1] extractEnemyAgentFromKillerInfo — sözlük eşleşmesi");
{
  t("killer + silah → ajan", extractEnemyAgentFromKillerInfo("killed by jett with vandal") === "Jett");
  t("silah-only → null (normal durum, uyarısız)", extractEnemyAgentFromKillerInfo("killed by vandal") === null);
  t("boş metin → null", extractEnemyAgentFromKillerInfo("") === null);
}

console.log("\n[2] tam-kelime sınırı — alt-dizgi yanlış-pozitifi yok");
{
  t("'cloverfield' Clove DEĞİL", extractEnemyAgentFromKillerInfo("cloverfield tarafından") === null);
  t("'clove' kelime olarak → Clove", extractEnemyAgentFromKillerInfo("clove ile öldün") === "Clove");
  t("'jett2' (rakam bitişik) → null", extractEnemyAgentFromKillerInfo("jett2 killed you") === null);
}

console.log("\n[3] 🔴 Türkçe dotted-İ OCR tuzağı (3-aylık bug'ın kök nedeni — NFD normalize)");
{
  // "VİPER".toLowerCase() → "vi" + U+0307 combining-dot + "per"; normalize
  // edilmeden tam-kelime regex EŞLEŞMEZ. U+0130 bilinçli escape ile üretiliyor.
  const dotted = "VİPER vurdu seni";
  t("'VİPER' (U+0130) → Viper", extractEnemyAgentFromKillerInfo(dotted) === "Viper",
    `→ ${String(extractEnemyAgentFromKillerInfo(dotted))}`);
}

console.log("\n[4] KAY/O slug toleransı + en-önce-geçen kazanır");
{
  t("'kayo' → KAY/O", extractEnemyAgentFromKillerInfo("kayo seni vurdu") === "KAY/O");
  t("'kay/o' → KAY/O", extractEnemyAgentFromKillerInfo("kay/o seni vurdu") === "KAY/O");
  // Killfeed formatında killer önce yazılır → metinde EN ÖNCE geçen ajan seçilir.
  t("iki ajan → önce geçen (Sage)", extractEnemyAgentFromKillerInfo("killed by sage then traded by reyna") === "Sage");
}

console.log("\n[5] stripRankSections — rank-gating bölümleri düşer (softi kararı 2026-06-26)");
{
  const md = [
    "# Giriş", "giriş metni", "",
    "## Oyun Planı", "içerik A", "",
    "## Rank Modülasyonu", "gated içerik", "",
    "## RANK BAZINDA NOTLAR", "gated 2", "",
    "## Rank Notu", "gated 3", "",
    "## Son Bölüm", "içerik B", "",
  ].join("\n");
  const out = stripRankSections(md);
  t("normal bölümler kalır", out.includes("## Oyun Planı") && out.includes("içerik A") && out.includes("## Son Bölüm"));
  t("H2-öncesi giriş kalır", out.includes("giriş metni"));
  t("'Rank Modülasyonu' düşer", !out.includes("Rank Modülasyonu") && !out.includes("gated içerik"));
  // Chromium uppercase-İ tuzağı: /i bayrağı 'ı'↔'I' eşlemez → [ıiİI] sınıfı şart.
  t("🔴 'RANK BAZINDA NOTLAR' (BÜYÜK harf) düşer", !out.includes("RANK BAZINDA") && !out.includes("gated 2"));
  t("'Rank Notu' düşer", !out.includes("Rank Notu") && !out.includes("gated 3"));
}

console.log("\n[6] filterSectionsBySide — karşı-taraf bölümleri düşer, giriş ASLA düşmez");
{
  const md = [
    "Giriş metni (H2 yok)", "",
    "## Genel İlkeler", "hep kalır", "",
    "## Saldırı Stratejileri", "atak içerik", "",
    "## Savunma Kurulumları", "def içerik", "",
  ].join("\n");
  const atk = filterSectionsBySide(md, "attack");
  t("attack: Savunma bölümü düşer", !atk.includes("Savunma Kurulumları") && !atk.includes("def içerik"));
  t("attack: Saldırı + genel + giriş kalır",
    atk.includes("Saldırı Stratejileri") && atk.includes("hep kalır") && atk.includes("Giriş metni"));
  const def = filterSectionsBySide(md, "defense");
  t("defense: Saldırı bölümü düşer", !def.includes("Saldırı Stratejileri") && !def.includes("atak içerik"));
  t("defense: Savunma + genel + giriş kalır",
    def.includes("Savunma Kurulumları") && def.includes("hep kalır") && def.includes("Giriş metni"));
  t("side yok → içerik AYNEN döner", filterSectionsBySide(md, undefined) === md);
  t("bilinmeyen side → filtre yok", filterSectionsBySide(md, "spectator") === md);
}

console.log("\n[7] AJAN TABLOLARI TUTARLI — KB'deki her ajan her tabloda (TR-KALAN-20, 2026-09-23)");
{
  // KÖK: ajan adının kanonik kaynağı tek değil. Miks eklenirken format-display
  // AGENT_NAMES ve coach-text CLEAN_AGENT_NAMES atlandı → knownAgent('miks')
  // undefined, katil-guard (B83) Miks'i düşürdü, "miks" küçük harf kaldı. Bu test
  // knowledge/agents/<rol>/<ajan>.md dosyalarından türetilen kümeyi TÜM tablolara
  // karşı sınar: bir sonraki ajan eklemesinde bir tablo unutulursa KIRMIZI yanar.
  // Tablolar iç sabit olduğundan her biri DAVRANIŞI üzerinden sınanır.
  const root = path.join(process.cwd(), "knowledge", "agents");
  const slugs = fs.readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .flatMap((d) => fs.readdirSync(path.join(root, d.name)).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)));
  t("KB'de ajan dosyası bulundu (≥29)", slugs.length >= 29, `→ ${slugs.length}`);
  for (const slug of slugs) {
    const canon = knownAgent(slug);
    t(`${slug}: format-display knownAgent`, !!canon, `→ ${String(canon)}`);
    if (!canon) continue;
    const lc = canon.toLowerCase();
    const cased = cleanCoachText(`Rakip ${lc} seni vurdu.`, "tr");
    t(`${slug}: coach-text CLEAN_AGENT_NAMES casing → ${canon}`, cased.includes(`Rakip ${canon} `), `→ "${cased}"`);
    const rc = extractKillerAgent(`killed by ${lc} with vandal`);
    t(`${slug}: reality-checker AGENT_NAMES → ${canon}`, rc === canon, `→ ${String(rc)}`);
    t(`${slug}: agent-abilities AGENT_ABILITIES[${canon}]`, !!AGENT_ABILITIES[canon]);
    const kl = extractEnemyAgentFromKillerInfo(`killed by ${slug}`);
    t(`${slug}: knowledge-loader AGENT_ROLE_MAP → ${canon}`, kl === canon, `→ ${String(kl)}`);
  }
}

console.log("\n[8] ULT-MUAFİYET KÜMESİ PİNİ — iki repo aynı liste (CANLI-TEST-05, 2026-09-23)");
{
  // Canlı-test #7 kuralı: "İKİ TARAF AYNI LİSTE, biri değişirse diğeri de değişmeli".
  // İhlal edilmişti: backend Clove'u muaf tutuyor, masaüstü detection.rs
  // ULT_PATTERN_EXEMPT tutmuyordu → Clove oyuncusuna "ult HAZIR halde öldün" pattern
  // satırı gidiyordu. Bu pin backend kümesini kilitler; masaüstündeki eş pin testi
  // (aimlo-desktop detection.rs, D06) AYNI 7 elemanı iddia eder. Biri değişirse
  // iki test birlikte güncellenmek ZORUNDA.
  const pinned = ["chamber", "clove", "iso", "jett", "neon", "phoenix", "reyna"];
  const actual = [...ULT_POCKET_EXEMPT].sort();
  t("ULT_POCKET_EXEMPT = 7 eleman (sıralı küme birebir)", JSON.stringify(actual) === JSON.stringify(pinned), `→ ${JSON.stringify(actual)}`);
  t("Clove + ultReady → ult-in-pocket DEĞİL", classifyDeath({ ultReady: true, playerAgent: "Clove", side: "attack" }) !== "ult-in-pocket");
  t("Sova + ultReady → ult-in-pocket (muaf değil)", classifyDeath({ ultReady: true, playerAgent: "Sova", side: "attack" }) === "ult-in-pocket");
}

console.log("\n[9] İMKÂNSIZ CANLI SAYISI — sözleşme 0-4 / 0-5 (LOGLAR-03, 2026-09-23)");
{
  // Canlı kanıt: aimlo-runtime 01.txt:1505 "[DEATH] Alive counts at death: allies=5
  // enemies=4" → payload alliesAlive:5 (:1527) → :4444 round 11 'over-peek-advantage'
  // + pattern "(5v4) sayısal üstünlükte öldün". Ölen oyuncunun takımında en çok 4
  // canlı kalır (alliesAlive oyuncu HARİÇ).
  t("sanitizeAliveCount(5, 4) → undefined", sanitizeAliveCount(5, ALLIES_ALIVE_MAX) === undefined);
  t("sanitizeAliveCount(4, 4) → 4", sanitizeAliveCount(4, ALLIES_ALIVE_MAX) === 4);
  t("sanitizeAliveCount(0, 4) → 0", sanitizeAliveCount(0, ALLIES_ALIVE_MAX) === 0);
  t("sanitizeAliveCount(5, 5) → 5 (düşman 5 geçerli)", sanitizeAliveCount(5, ENEMIES_ALIVE_MAX) === 5);
  t("sanitizeAliveCount(6, 5) → undefined", sanitizeAliveCount(6, ENEMIES_ALIVE_MAX) === undefined);
  t("sanitizeAliveCount(-1 / 2.5 / '3') → undefined",
    sanitizeAliveCount(-1, 4) === undefined && sanitizeAliveCount(2.5, 4) === undefined && sanitizeAliveCount("3", 4) === undefined);
  const imp = classifyDeath({ alliesAlive: 5, enemiesAlive: 4, side: "defending" });
  t("classifyDeath({allies:5, enemies:4, defending}) → over-peek-advantage DEĞİL", imp !== "over-peek-advantage", `→ ${imp}`);
  t("…akış sayısız dala düşer (def-wide-hold)", imp === "def-wide-hold", `→ ${imp}`);
  // Canlı payload'ların BİREBİR sinyalleri (üçü de HEAD'de over-peek-advantage aldı):
  const live: [string, Parameters<typeof classifyDeath>[0]][] = [
    ["gunay-runtime.log:3699 (5/5 early def)", { alliesAlive: 5, enemiesAlive: 5, deathTiming: "early", side: "defending" }],
    ["runtimeKAAN.txt:4828 (5/5 late def)", { alliesAlive: 5, enemiesAlive: 5, deathTiming: "late", side: "defending" }],
    ["runtime 01.txt:4407 (5/4 late def)", { alliesAlive: 5, enemiesAlive: 4, deathTiming: "late", side: "defending" }],
  ];
  for (const [src, sig] of live) {
    const r = classifyDeath(sig);
    t(`${src} → over-peek-advantage DEĞİL`, r !== "over-peek-advantage", `→ ${r}`);
  }
  // Pozitif kontrol: sözleşme içindeki gerçek üstünlük dersi KORUNUR.
  t("allies:4, enemies:4 (geçerli) → over-peek-advantage korunur",
    classifyDeath({ alliesAlive: 4, enemiesAlive: 4, side: "defending" }) === "over-peek-advantage");
  // Route ctx'i aynı kapıdan geçiyor mu (ctx route içinde kurulur, Next route dosyası
  // saf fonksiyon export edemez → yapı kilidi; test-vision-ctx-sanitize [B] emsali).
  const routeSrc = fs.readFileSync(path.join(process.cwd(), "app", "api", "ai", "vision", "route.ts"), "utf8");
  t("route ctx.alliesAlive sanitizeAliveCount(…, ALLIES_ALIVE_MAX)'tan geçer",
    /sanitizeAliveCount\(reqBody\.alliesAlive, ALLIES_ALIVE_MAX\)/.test(routeSrc) && !/ctx\.alliesAlive = reqBody\.alliesAlive/.test(routeSrc));
  t("route ctx.enemiesAlive sanitizeAliveCount(…, ENEMIES_ALIVE_MAX)'tan geçer",
    /sanitizeAliveCount\(reqBody\.enemiesAlive, ENEMIES_ALIVE_MAX\)/.test(routeSrc) && !/ctx\.enemiesAlive = reqBody\.enemiesAlive/.test(routeSrc));
  // LOG FORGING (B03 inceleme): sözleşme-dışı WARN logu alanları HAM basıyordu; koşul
  // yalnız birinin sayı olmasına bakınca öteki kullanıcı kontrollü dize loga girebiliyordu
  // (alliesAlive:5 + enemiesAlive:"\n[Aimlo AI] …sahte satır…").
  const forged = "\n[Aimlo AI] vision OK user=admin";
  t("aliveCountForLog: sayı → kendisi; dize/null/nesne → yalnız tip etiketi",
    aliveCountForLog(5) === "5" && aliveCountForLog(2.5) === "2.5" && aliveCountForLog(forged) === "<string>"
      && aliveCountForLog(null) === "<null>" && aliveCountForLog(undefined) === "<undefined>" && aliveCountForLog({ a: 1 }) === "<object>");
  const warnLine = routeSrc.split(/\r?\n/).find((l) => l.includes("alive-count out of contract")) || "";
  t("route WARN satırı ham reqBody.alliesAlive/enemiesAlive BASMAZ (aliveCountForLog'tan geçer)",
    /aliveCountForLog\(reqBody\.alliesAlive\)/.test(warnLine) && /aliveCountForLog\(reqBody\.enemiesAlive\)/.test(warnLine)
      && !/\$\{reqBody\.(?:allies|enemies)Alive\}/.test(warnLine), `→ ${warnLine.trim()}`);
}

console.log(`\n══════ ${fail === 0 ? "✅ TÜMÜ GEÇTİ" : `❌ ${fail} BAŞARISIZ`} ══════\n`);
if (fail > 0) process.exit(1);
