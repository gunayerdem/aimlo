/**
 * FEEDBACK KALİTE SKORLAYICI + A/B KARŞILAŞTIRICI — "iyileşti" KANITI (lafta değil)
 * ────────────────────────────────────────────────────────────────────────────────
 * eval-vision.ts'in ürettiği gerçek gpt-5-mini çıktılarını OBJEKTİF ölçütlerle
 * puanlar. Tek koşu için rapor; iki koşu verilirse A/B farkı.
 *
 * NEDEN: softi "feedbackler gözle görülür biçimde iyileşmeli" dedi. Gözle görülür =
 * ÖLÇÜLEBİLİR. Bu araç aynı ölçütü ÖNCE ve SONRA'ya uygular; iyileşme iddiası
 * sayıya bağlanır. Ölçütler canlı kurallardan (lib/ai-policy, lib/map-callouts)
 * TÜRETİLİR — kopya liste tutulmaz, kural değişince ölçüt de değişir.
 *
 * RUN:
 *   npx tsx scripts/eval-score.ts base10h              → tek koşu raporu
 *   npx tsx scripts/eval-score.ts base10h after10h     → A/B karşılaştırma
 */
import * as fs from "fs";
import * as path from "path";
import { BANNED_PHRASES } from "../lib/ai-policy";
import { MAP_CALLOUTS, UNIVERSAL_CALLOUTS, mapKey } from "../lib/map-callouts";
import { ABILITY_PLAIN_MAP } from "../lib/ability-plain-map";
import { scoreFields } from "../evals/generic-detector";
// B60 (pano özellik dalgası, 2026-08-04): EN çıktı kalitesi hiç ölçülmüyordu —
// TR-sızıntı detektörü EKLEMELİ bağlandı. Yalnız lang==="en" örneklerde koşar;
// TR örneklerde enLeak=[] olduğundan violations/rapor BAYT-AYNI kalır.
import { detectEnLeak } from "../evals/en-leak-detector";

type Sample = {
  id: string;
  /* B57 (2026-07-31): eval-vision artık örneğin dilini yazıyor. Bu dosyanın
   * ölçütlerinin BÜYÜK kısmı TÜRKÇE'ye özgü (BANNED_PHRASES, tarzanca kalıpları,
   * apostrof/ek kuralları) — EN aynası senaryoları aynı torbada puanlanırsa
   * "0 ihlal" yanıltıcı bir iyileşme gibi görünür. Alan opsiyonel: eski
   * cycle*-samples.json dosyalarında YOK → filtre uygulanmazsa davranış
   * bugünküyle birebir aynı kalır. */
  lang?: "tr" | "en";
  kbFiles?: string[];
  systemPromptBytes?: number;
  usage?: Record<string, number>;
  final?: {
    deathAnalysis?: string;
    enemyAnalysis?: string[];
    nextRoundSuggestion?: string;
  };
};

const OUT_DIR = path.join(process.cwd(), "scripts", "eval-out");

function load(cycle: string): Sample[] {
  const p = path.join(OUT_DIR, `cycle${cycle}-samples.json`);
  if (!fs.existsSync(p)) throw new Error(`bulunamadı: ${p}`);
  const all: Sample[] = JSON.parse(fs.readFileSync(p, "utf8"));
  /* B57 (2026-07-31): EVAL_SCORE_LANG=tr|en → yalnız o dilin örnekleri puanlanır.
   * TANIMSIZSA HİÇBİR FİLTRE YOK = bugünkü davranış birebir korunur (eski
   * cycle'lar ve mevcut A/B kanıtları etkilenmez). Örnekte lang yoksa "tr"
   * sayılır — EN alanı 2026-07-31'de eklendi, öncesi tamamen TR korpusuydu. */
  const want = process.env.EVAL_SCORE_LANG;
  if (want !== "tr" && want !== "en") return all;
  return all.filter((s) => (s.lang === "en" ? "en" : "tr") === want);
}

/** Senaryo id'sinden harita adını çıkar: "S1-ascent-cypher-def-strong" → "ascent" */
function mapOfId(id: string): string | null {
  const parts = id.split("-");
  return parts.length > 1 ? parts[1] : null;
}
function agentOfId(id: string): string | null {
  const parts = id.split("-");
  return parts.length > 2 ? parts[2] : null;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[İI]/g, "i")
    .replace(/̇/g, "");

/** Bir örneğin tüm koç metnini tek stringde topla. */
function allText(s: Sample): string {
  const f = s.final || {};
  return [f.deathAnalysis || "", ...(f.enemyAnalysis || []), f.nextRoundSuggestion || ""]
    .filter(Boolean)
    .join(" \n ");
}

// ── İHLAL DEDEKTÖRLERİ (hepsi canlı kuraldan türetilmiş) ────────────────────

/** Yasak generik/kitabi ifade (lib/ai-policy BANNED_PHRASES). */
function bannedHits(text: string): string[] {
  const t = norm(text);
  return BANNED_PHRASES.filter((p) => t.includes(norm(p)));
}

/**
 * ZAMAN YASAĞI (TIME_BAN_RULE): saniye/timer tabanlı tavsiye.
 * "0.5 saniyede", "2 saniye bekle", "0.3-0.6s", "after 3s".
 */
function timeHits(text: string): string[] {
  const hits: string[] = [];
  const re = /\b\d+([.,]\d+)?\s*(-\s*\d+([.,]\d+)?\s*)?(saniye|sn\b|s\b|second|sec\b)/giu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) hits.push(m[0].trim());
  return hits;
}

/**
 * CAN/HP İDDİASI TOTAL YASAK (HP_BAN_RULE): sayısal VE nitel.
 * stripHpClaims canlıda süzüyor ama KB/model hâlâ üretiyorsa ders bozuk demektir.
 */
function hpHits(text: string): string[] {
  const hits: string[] = [];
  const patterns: RegExp[] = [
    /\b\d{1,3}\s*(hp|can)\b/giu,
    /\bhp\s*\d{1,3}\b/giu,
    /(düşük|az|tam|full|yarım)\s*can(la|la|ı|ın|iyken)?\b/giu,
    /can(ın|in)\s*(az|düşük|tam)/giu,
    /\b(low|full)\s*(hp|health)\b/giu,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) hits.push(m[0].trim());
  }
  return hits;
}

/**
 * KOD-AD YASAĞI (SILVER_AUDIENCE_RULE): resmî yetenek adı kullanma.
 * Kaynak = ABILITY_PLAIN_MAP.official (tek kaynak, kopya liste yok).
 */
function codenameHits(text: string): string[] {
  const t = norm(text);
  const hits: string[] = [];
  for (const a of ABILITY_PLAIN_MAP) {
    const off = norm(a.official).trim();
    if (off.length < 4) continue; // "ult" gibi kısa/genel olanları atla
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${off.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "u");
    if (re.test(t)) hits.push(a.official);
  }
  return hits;
}

// ── SPESİFİKLİK ÖLÇÜTLERİ (softi: "çok genel, nerede vurulduğunu söylemiyor") ──

/** Metinde OYNANAN haritanın gerçek callout'u geçiyor mu? */
function calloutHits(text: string, map: string | null): string[] {
  const k = mapKey(map);
  const pool = [
    ...(k ? MAP_CALLOUTS[k] : []),
    ...UNIVERSAL_CALLOUTS,
  ];
  const t = norm(text);
  const found = new Set<string>();
  for (const c of pool) {
    const cn = norm(c);
    if (cn.length < 3) continue;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${cn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "u");
    if (re.test(t)) found.add(c);
  }
  return [...found];
}

const WEAPONS = [
  "vandal", "phantom", "operator", "sheriff", "guardian", "spectre", "judge",
  "odin", "ares", "bulldog", "marshal", "outlaw", "stinger", "ghost", "classic",
  "shorty", "frenzy", "bucky",
];
function weaponHits(text: string): string[] {
  const t = norm(text);
  return WEAPONS.filter((w) => new RegExp(`(?<![\\p{L}\\p{N}])${w}(?![\\p{L}\\p{N}])`, "u").test(t));
}

/** Somut taktik kavram yoğunluğu — "işe yarar" olmanın göstergesi. */
const TACTICAL_TERMS = [
  "crossfire", "off-angle", "trade", "rotasyon", "rotate", "peek", "swing",
  "lurk", "retake", "post-plant", "execute", "entry", "anchor", "flank",
  "util", "smoke", "flash", "molly", "wall", "recon", "spike", "plant",
  "defuse", "eco", "force", "bonus", "tempo", "timing", "pencere", "açı",
  "trade partner", "kontrol", "bilgi", "sızıntı", "pattern", "tetikleyici",
];
function tacticalHits(text: string): string[] {
  const t = norm(text);
  const found = new Set<string>();
  for (const term of TACTICAL_TERMS) {
    if (t.includes(norm(term))) found.add(term);
  }
  return [...found];
}

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// ── ÖRNEK BAŞINA SKOR ───────────────────────────────────────────────────────

type Row = {
  id: string;
  map: string | null;
  words: number;
  deathWords: number;
  banned: string[];
  time: string[];
  hp: string[];
  codename: string[];
  callouts: string[];
  weapons: string[];
  tactical: string[];
  detector: number; // generic-detector ortalama alan skoru (0-100)
  detectorWeak: string | null;
  violations: number;
  promptBytes: number;
  // B60 (2026-08-04): örneğin dili + EN'de yakalanan TR-sızıntı ihlalleri.
  // TR örneklerde enLeak HEP boş — mevcut TR ölçümü etkilenmez.
  lang: "tr" | "en";
  enLeak: string[];
};

function scoreSample(s: Sample): Row {
  const text = allText(s);
  const map = mapOfId(s.id);
  const agent = agentOfId(s.id);
  const f = s.final || {};

  const banned = bannedHits(text);
  const time = timeHits(text);
  const hp = hpHits(text);
  const codename = codenameHits(text);

  // B60 (pano özellik dalgası, 2026-08-04): TR-sızıntı YALNIZ EN örneklerde
  // ölçülür (dil-bağımsız değil — TR metin doğal olarak "kirli" görünürdü).
  // en-hedge kesişimi bannedHits'ten düşülür: BANNED_PHRASES'in EN girdileri
  // ("maybe/probably/it seems...") zaten yasak-ifade sayılıyor, aynı ihlali
  // iki kez saymak A/B'yi şişirirdi. Kanıt-kaynağı: evals/en-leak-detector.ts.
  const lang: "tr" | "en" = s.lang === "en" ? "en" : "tr";
  const enLeak =
    lang === "en"
      ? [...new Set(
          detectEnLeak(text).hits
            .filter((h) => !(h.category === "en-hedge" && banned.includes(h.hit)))
            .map((h) => `${h.category}:${h.hit}`),
        )]
      : [];

  let detector = 0;
  let detectorWeak: string | null = null;
  try {
    const r = scoreFields(
      {
        deathAnalysis: f.deathAnalysis,
        enemyAnalysis: f.enemyAnalysis,
        nextRoundSuggestion: f.nextRoundSuggestion,
      },
      { map: map || undefined, agent: agent || undefined },
    );
    detector = r.scores.length
      ? Math.round(r.scores.reduce((a, b) => a + b.score, 0) / r.scores.length)
      : 0;
    detectorWeak = r.weakest;
  } catch {
    detector = -1;
  }

  return {
    id: s.id,
    map,
    words: words(text),
    deathWords: words(f.deathAnalysis || ""),
    banned,
    time,
    hp,
    codename,
    callouts: calloutHits(text, map),
    weapons: weaponHits(text),
    tactical: tacticalHits(text),
    detector,
    detectorWeak,
    // B60 (2026-08-04): + enLeak.length EKLEMELİ — TR örnekte enLeak=[] → toplam değişmez.
    violations: banned.length + time.length + hp.length + codename.length + enLeak.length,
    promptBytes: s.systemPromptBytes || 0,
    lang,
    enLeak,
  };
}

type Agg = {
  n: number;
  violTotal: number;
  violSamples: number;
  banned: number;
  time: number;
  hp: number;
  codename: number;
  avgWords: number;
  avgDeathWords: number;
  calloutCoverage: number; // callout içeren örnek oranı (%)
  avgCallouts: number;
  weaponCoverage: number;
  avgTactical: number;
  avgDetector: number;
  avgPromptKB: number;
  // B60 (2026-08-04): EN TR-sızıntı toplamı (TR koşularda hep 0).
  enLeak: number;
};

function aggregate(rows: Row[]): Agg {
  const n = rows.length;
  const sum = (f: (r: Row) => number) => rows.reduce((a, r) => a + f(r), 0);
  return {
    n,
    violTotal: sum((r) => r.violations),
    violSamples: rows.filter((r) => r.violations > 0).length,
    banned: sum((r) => r.banned.length),
    time: sum((r) => r.time.length),
    hp: sum((r) => r.hp.length),
    codename: sum((r) => r.codename.length),
    avgWords: sum((r) => r.words) / n,
    avgDeathWords: sum((r) => r.deathWords) / n,
    calloutCoverage: (rows.filter((r) => r.callouts.length > 0).length / n) * 100,
    avgCallouts: sum((r) => r.callouts.length) / n,
    weaponCoverage: (rows.filter((r) => r.weapons.length > 0).length / n) * 100,
    avgTactical: sum((r) => r.tactical.length) / n,
    avgDetector: sum((r) => r.detector) / n,
    avgPromptKB: sum((r) => r.promptBytes) / n / 1024,
    enLeak: sum((r) => r.enLeak.length),
  };
}

const f1 = (x: number) => x.toFixed(1);

function printSingle(cycle: string, rows: Row[]) {
  const a = aggregate(rows);
  console.log(`\n══════ KOŞU: ${cycle} (${a.n} senaryo) ══════\n`);
  console.log("── İHLALLER (0 olmalı) ──");
  console.log(`  Toplam ihlal        : ${a.violTotal}  (ihlalli örnek: ${a.violSamples}/${a.n})`);
  console.log(`    yasak ifade       : ${a.banned}`);
  console.log(`    zaman-tabanlı      : ${a.time}`);
  console.log(`    HP iddiası         : ${a.hp}`);
  console.log(`    kod-ad (yetenek)   : ${a.codename}`);
  // B60 (2026-08-04): satır YALNIZ korpusta EN örnek varken basılır —
  // TR-only koşuların konsol çıktısı bayt-aynı kalır (TR akışına dokunma kuralı).
  if (rows.some((r) => r.lang === "en")) {
    console.log(`    EN TR-sızıntısı    : ${a.enLeak}`);
  }
  console.log("\n── SPESİFİKLİK (yüksek iyi) ──");
  console.log(`  Callout kapsamı     : %${f1(a.calloutCoverage)}  (örnek başına ${f1(a.avgCallouts)})`);
  console.log(`  Silah adı kapsamı   : %${f1(a.weaponCoverage)}`);
  console.log(`  Taktik terim/örnek  : ${f1(a.avgTactical)}`);
  console.log(`  Detector skoru      : ${f1(a.avgDetector)}/100`);
  console.log("\n── HACİM ──");
  console.log(`  Ortalama kelime     : ${f1(a.avgWords)}  (ölüm analizi: ${f1(a.avgDeathWords)})`);
  console.log(`  Prompt boyutu       : ${f1(a.avgPromptKB)} KB`);

  const bad = rows.filter((r) => r.violations > 0);
  if (bad.length) {
    console.log("\n── İHLALLİ ÖRNEKLER ──");
    for (const r of bad) {
      const parts: string[] = [];
      if (r.banned.length) parts.push(`yasak:[${r.banned.join(", ")}]`);
      if (r.time.length) parts.push(`zaman:[${r.time.join(", ")}]`);
      if (r.hp.length) parts.push(`HP:[${r.hp.join(", ")}]`);
      if (r.codename.length) parts.push(`kod-ad:[${r.codename.join(", ")}]`);
      // B60 (2026-08-04): TR örnekte enLeak hep boş → TR çıktısı değişmez.
      if (r.enLeak.length) parts.push(`EN-sızıntı:[${r.enLeak.join(", ")}]`);
      console.log(`  ❌ ${r.id} → ${parts.join(" ")}`);
    }
  }
  const noCallout = rows.filter((r) => r.callouts.length === 0);
  if (noCallout.length) {
    console.log(`\n── CALLOUT'SUZ (çok genel) — ${noCallout.length}/${a.n} ──`);
    for (const r of noCallout) console.log(`  ⚠ ${r.id}`);
  }
}

function delta(before: number, after: number, higherBetter: boolean): string {
  const d = after - before;
  const sign = d > 0 ? "+" : "";
  if (Math.abs(d) < 0.05) return `   =`;
  const good = higherBetter ? d > 0 : d < 0;
  return `${good ? "✅" : "🔴"} ${sign}${f1(d)}`;
}

function printAB(cA: string, rowsA: Row[], cB: string, rowsB: Row[]) {
  const A = aggregate(rowsA);
  const B = aggregate(rowsB);
  console.log(`\n══════ A/B: ${cA} → ${cB} ══════\n`);
  const line = (label: string, a: number, b: number, higherBetter: boolean, suffix = "") =>
    console.log(
      `  ${label.padEnd(24)} ${f1(a).padStart(7)}${suffix} → ${f1(b).padStart(7)}${suffix}   ${delta(a, b, higherBetter)}`,
    );

  console.log("── İHLALLER (düşük iyi) ──");
  line("Toplam ihlal", A.violTotal, B.violTotal, false);
  line("  yasak ifade", A.banned, B.banned, false);
  line("  zaman-tabanlı", A.time, B.time, false);
  line("  HP iddiası", A.hp, B.hp, false);
  line("  kod-ad", A.codename, B.codename, false);
  // B60 (2026-08-04): yalnız iki koşudan birinde EN örnek varsa basılır —
  // eski TR-only A/B kanıt çıktıları bayt-aynı kalır.
  if (rowsA.some((r) => r.lang === "en") || rowsB.some((r) => r.lang === "en")) {
    line("  EN TR-sızıntısı", A.enLeak, B.enLeak, false);
  }
  line("İhlalli örnek", A.violSamples, B.violSamples, false);

  console.log("\n── SPESİFİKLİK (yüksek iyi) ──");
  line("Callout kapsamı", A.calloutCoverage, B.calloutCoverage, true, "%");
  line("Callout/örnek", A.avgCallouts, B.avgCallouts, true);
  line("Silah kapsamı", A.weaponCoverage, B.weaponCoverage, true, "%");
  line("Taktik terim/örnek", A.avgTactical, B.avgTactical, true);
  line("Detector skoru", A.avgDetector, B.avgDetector, true);

  console.log("\n── HACİM ──");
  line("Ort. kelime", A.avgWords, B.avgWords, true);
  line("Ölüm analizi kelime", A.avgDeathWords, B.avgDeathWords, true);
  line("Prompt KB", A.avgPromptKB, B.avgPromptKB, false, "KB");

  // Senaryo bazlı regresyon avı — hangi örnek KÖTÜLEŞTİ?
  const byId = new Map(rowsA.map((r) => [r.id, r]));
  const worse: string[] = [];
  const better: string[] = [];
  for (const b of rowsB) {
    const a = byId.get(b.id);
    if (!a) continue;
    if (b.violations > a.violations) worse.push(`${b.id} (ihlal ${a.violations}→${b.violations})`);
    if (a.callouts.length > 0 && b.callouts.length === 0) worse.push(`${b.id} (callout kayboldu)`);
    if (a.callouts.length === 0 && b.callouts.length > 0) better.push(`${b.id} (callout kazandı)`);
    if (a.violations > 0 && b.violations === 0) better.push(`${b.id} (ihlal temizlendi)`);
  }
  if (worse.length) {
    console.log("\n🔴 REGRESYON:");
    for (const w of worse) console.log(`   ${w}`);
  } else {
    console.log("\n✅ REGRESYON YOK — hiçbir senaryo kötüleşmedi");
  }
  if (better.length) {
    console.log("\n✅ İYİLEŞEN:");
    for (const w of better) console.log(`   ${w}`);
  }
}

// ── main ────────────────────────────────────────────────────────────────────
// 3. argüman: id filtresi (regex). A/B'nin ELMA-ELMA olması için şart —
// batarya sonradan genişletildiyse yalnız ORTAK senaryolar karşılaştırılmalı.
// örn: npx tsx scripts/eval-score.ts base10h after10h '^S([1-9]|1[0-9]|20)-'
const [cA, cB, filter] = process.argv.slice(2);
if (!cA) {
  console.error("kullanım: npx tsx scripts/eval-score.ts <cycle> [<cycleB>] [<id-regex>]");
  process.exit(1);
}
const re = filter ? new RegExp(filter) : null;
const keep = (rows: Row[]) => (re ? rows.filter((r) => re.test(r.id)) : rows);

const rowsA = keep(load(cA).map(scoreSample));
if (cB) {
  const rowsB = keep(load(cB).map(scoreSample));
  // Elma-elma güvencesi: yalnız İKİ koşuda da bulunan id'ler.
  const idsA = new Set(rowsA.map((r) => r.id));
  const idsB = new Set(rowsB.map((r) => r.id));
  const shared = [...idsA].filter((id) => idsB.has(id));
  const onlyA = [...idsA].filter((id) => !idsB.has(id));
  const onlyB = [...idsB].filter((id) => !idsA.has(id));
  if (onlyA.length || onlyB.length) {
    console.log(`\n⚠ ORTAK OLMAYAN SENARYOLAR — A/B yalnız ${shared.length} ortak id üzerinden:`);
    if (onlyA.length) console.log(`   yalnız ${cA}: ${onlyA.join(", ")}`);
    if (onlyB.length) console.log(`   yalnız ${cB}: ${onlyB.join(", ")}`);
  }
  const sA = rowsA.filter((r) => idsB.has(r.id));
  const sB = rowsB.filter((r) => idsA.has(r.id));
  printSingle(cA, sA);
  printSingle(cB, sB);
  printAB(cA, sA, cB, sB);
  // Yeni eklenen senaryolar (yalnız B'de) ayrı raporlanır — kapsam taraması.
  if (onlyB.length) {
    const extra = rowsB.filter((r) => !idsA.has(r.id));
    console.log(`\n\n══════ EK KAPSAM (yalnız ${cB} — A/B'ye dahil DEĞİL) ══════`);
    printSingle(`${cB}/ek-kapsam`, extra);
  }
} else {
  printSingle(cA, rowsA);
}
