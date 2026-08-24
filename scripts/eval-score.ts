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
// META-TERİM ihlal sınıfı (canli-test #10 kalite dalgasi, 2026-08-05): model
// sistem-içi meta-dili ("OCR'da kesin", "kayıtta var") kullanıcı metnine taşıdı
// ve BU GECEKİ ÖLÇÜM KORPUSU BUNU YAKALAMADI — ölçüm kör noktasıydı. Dedektör
// canlı süzgecin dosyasından (lib/coach-text.ts) import edilir; kopya liste yok,
// süzgeç deseni genişleyince ölçüm de otomatik genişler. Dedektör süzgeçten
// BİLEREK geniştir: cerrahinin kaçırdığı varyantı ölçüm yine yakalar.
import { findMetaTermHits } from "../lib/coach-text";
// repeatScore (rank-1, 2026-08-24): maç-içi TEKRAR ölçümü — kavram-aile sözlüğü
// canlı kuraldan (DEATH_TYPE_GUIDE) TÜRETİLİR, kopya liste yok; guide değişince
// ölçüm de kendiliğinden değişir. Yalnız M{n}-R{r}- id'li (gerçek-korpus)
// örneklerde hesaplanır → eski S/E-id'li cycle raporları BAYT-AYNI kalır.
import { DEATH_TYPE_GUIDE } from "../lib/death-type";

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

/** Gerçek-korpus id'si (rank-1): "M1-R5-ascent-jett" → maç "M1"; S/E-id'de null. */
function matchOfId(id: string): string | null {
  const m = /^(M\d+)-R[^-]+-/.exec(id);
  return m ? m[1] : null;
}

/** Senaryo id'sinden harita adını çıkar: "S1-ascent-cypher-def-strong" → "ascent".
 *  Gerçek-korpus id'sinde (M1-R5-ascent-jett) harita/ajan bir slot sağda — rank-1. */
function mapOfId(id: string): string | null {
  const parts = id.split("-");
  const off = matchOfId(id) ? 1 : 0;
  return parts.length > 1 + off ? parts[1 + off] : null;
}
function agentOfId(id: string): string | null {
  const parts = id.split("-");
  const off = matchOfId(id) ? 1 : 0;
  return parts.length > 2 + off ? parts[2 + off] : null;
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
 *
 * 🔴 EN YANLIŞ-ALARMI (ilk EN ölçüm koşusunda yakalandı, 2026-08-04):
 * Bazı yeteneklerin SADE İngilizcesi resmî adının AYNISI — Turret/turret,
 * Updraft/updraft, Shock Bolt/shock bolt, Interceptor/interceptor (4/116).
 * Bu satırlar EN metinde ÖLÇÜLEMEZ bir kural üretiyordu: model doğru sade
 * İngilizceyi yazsa bile "kod-ad ihlali" sayılıyordu, düzeltmesi İMKÂNSIZDI.
 * Bu, "kod kendisiyle çelişiyor" sınıfının aynısı (10h ölçüm nöbeti dersi):
 * bir katman yasaklarken başka katman aynı kelimeyi EMREDİYOR.
 *
 * ÇÖZÜM: EN metinde, sade karşılığı resmî adla ÇAKIŞAN yetenekler atlanır —
 * o kelime EN'de zaten "sade dil"in ta kendisi. TR ölçümü BİREBİR aynı kalır
 * (TR karşılıkları farklı: taret/zıplama/hasar oku/önleyici), yani geçmiş
 * TR A/B kanıtları etkilenmez.
 */
function codenameHits(text: string, lang: "tr" | "en" = "tr"): string[] {
  const t = norm(text);
  const hits: string[] = [];
  for (const a of ABILITY_PLAIN_MAP) {
    const off = norm(a.official).trim();
    if (off.length < 4) continue; // "ult" gibi kısa/genel olanları atla
    // EN'de sade karşılık == resmî ad ise bu bir ihlal DEĞİL, doğru kullanım.
    if (lang === "en" && a.en && norm(a.en).trim() === off) continue;
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

/* ── repeatScore — MAÇ-İÇİ TEKRAR METRİĞİ (rank-1, 2026-08-24) ───────────────
 * Canlı-test #12 ölçümünün (23 gerçek round: aynı açılış iskeleti 17/23, "seni
 * oradan öldürdü" 9 round'da, dash 23/23) kalıcı ölçüm hâli. Üç bileşen:
 *   m1 AÇILIŞ-İSKELETİ: deathAnalysis'in normalize ilk 6 token'ı, aynı maçın
 *      ÖNCEKİ bir round'uyla Jaccard ≥ 0.5 ise round "tekrar açılışlı" sayılır.
 *   m2 4-GRAM ÇAKIŞMASI: round'un koç metni (3 alan birleşik, norm() İ/i̇
 *      normalizasyonu) 4-gram'larının aynı maçın önceki round'larında geçen
 *      payının ortalaması.
 *   m3 KAVRAM-TEKRARI: DEATH_TYPE_GUIDE'dan türetilen kavram-aile sözlüğünde
 *      aynı kavramın maç içinde 3. ve sonraki geçişini taşıyan round payı.
 * repeatScore = 0.4·m1 + 0.4·m2 + 0.2·m3 (0 = hiç tekrar, 1 = tam tekrar).
 * m1/m2 paydası = önceli olan round'lar (ilk round tekrar edemez). Metrik yalnız
 * M-id'li maç-gruplarında (≥2 round) hesaplanır; sıra = dosya sırası (korpus
 * kronolojik yazılır) — R-etiketi parse edilmez (R2b gibi phantom-round
 * disambiguation'ları sıralamayı bozamaz). */

type ConceptFamily = { concept: string; stems: string[]; re?: RegExp };

/** Kavram-aile sözlüğü: her DEATH_TYPE_GUIDE tipinin canlı 'angle' metninden,
 *  BAŞKA tiplerde nadir (≤2 tipte geçen) normalize ≥5-harf gövdeler (ilk 5 harf —
 *  Türkçe ekleri düşürür: okundu/okunma→"okun…"). Parametreler canlı #12
 *  korpusunda ÖLÇÜLEREK seçildi: 4-harf gövdeler stopword'leri ("seni","gibi",
 *  "anda") geçiriyor ve m3 0.91'e doyuyordu (ölçemez metrik); 5-harf + ≥3-gövde
 *  eşiği m3=0.55 (ölçüm başlığı var, iyileşme payı var) ve ateşlenen aileler
 *  bulgularla örtüşüyor (tam-alım/açıkta/geniş-açı/trade/crossfire/okunma).
 *  Kopya kelime listesi YOK; guide cümlesi değişince sözlük de değişir.
 *  + plan'ın istediği ek aile: "açıkta/utility'siz" (buildDeathTypeDirective'in
 *  kalıp cümlesi, lib/death-type.ts:307 — orada da tek muaf-çift bu ikili). */
function buildConceptFamilies(): ConceptFamily[] {
  const entries = Object.values(DEATH_TYPE_GUIDE);
  const stemsOf = (t: string): string[] => [
    ...new Set(
      norm(t)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length >= 5)
        .map((w) => w.slice(0, 5)),
    ),
  ];
  // gövde → kaç FARKLI tipin angle'ında geçiyor (ayırt edicilik filtresi)
  const df = new Map<string, number>();
  const perType = entries.map((e) => stemsOf(e.angle));
  for (const stems of perType) for (const s of stems) df.set(s, (df.get(s) || 0) + 1);
  const fams: ConceptFamily[] = entries.map((e, i) => ({
    concept: e.concept,
    stems: perType[i].filter((s) => (df.get(s) || 0) <= 2),
  }));
  fams.push({ concept: "acikta-utilsiz", stems: [], re: /açıkta|util\S{0,4}siz/u });
  return fams;
}
const CONCEPT_FAMILIES = buildConceptFamilies();

/** Round metninde geçen kavramlar. Aile "geçti" sayılır: ≥3 farklı ayırt-edici
 *  gövde (daha az gövdeli ailede hepsi) — canlı #12'de ölçülen eşik: 2-gövde
 *  eşiği aile başına 5.8 ateşleme/round üretip m3'ü doyuruyordu. */
function conceptHits(text: string): string[] {
  const t = norm(text);
  const found: string[] = [];
  for (const f of CONCEPT_FAMILIES) {
    if (f.re) {
      if (f.re.test(t)) found.push(f.concept);
      continue;
    }
    let n = 0;
    for (const s of f.stems) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}])${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u");
      if (re.test(t)) n++;
    }
    if (f.stems.length && n >= Math.min(3, f.stems.length)) found.push(f.concept);
  }
  return found;
}

function tokensOf(text: string): string[] {
  return norm(text).split(/[^\p{L}\p{N}']+/u).filter(Boolean);
}
function grams4Of(text: string): string[] {
  const tok = tokensOf(text);
  const out = new Set<string>();
  for (let i = 0; i + 4 <= tok.length; i++) out.add(tok.slice(i, i + 4).join(" "));
  return [...out];
}

type RepeatAgg = { score: number; m1: number; m2: number; m3: number; nGrouped: number; matches: number };

/** Maç-gruplu tekrar toplaması — M-id'li grup (≥2 round) yoksa null → eski
 *  cycle'ların (S/E id) rapor çıktısı BAYT-AYNI kalır. */
function repeatAggregate(rows: Row[]): RepeatAgg | null {
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const m = matchOfId(r.id);
    if (!m) continue;
    const g = groups.get(m) || [];
    g.push(r);
    groups.set(m, g);
  }
  let m1n = 0, m1d = 0, m2sum = 0, m2d = 0, m3n = 0, m3d = 0, total = 0, matches = 0;
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    matches++;
    total += g.length;
    const conceptCount = new Map<string, number>();
    for (let i = 0; i < g.length; i++) {
      const r = g[i];
      if (i > 0 && r.openerTokens.length) {
        m1d++;
        const cur = new Set(r.openerTokens);
        let hit = false;
        for (let j = 0; j < i && !hit; j++) {
          const prev = new Set(g[j].openerTokens);
          if (!prev.size) continue;
          const inter = [...cur].filter((t) => prev.has(t)).length;
          const uni = new Set([...cur, ...prev]).size;
          if (uni && inter / uni >= 0.5) hit = true;
        }
        if (hit) m1n++;
      }
      if (i > 0 && r.grams4.length) {
        m2d++;
        const seen = new Set<string>();
        for (let j = 0; j < i; j++) for (const q of g[j].grams4) seen.add(q);
        m2sum += r.grams4.filter((q) => seen.has(q)).length / r.grams4.length;
      }
      m3d++;
      let third = false;
      for (const c of r.concepts) {
        const n = (conceptCount.get(c) || 0) + 1;
        conceptCount.set(c, n);
        if (n >= 3) third = true;
      }
      if (third) m3n++;
    }
  }
  if (!total) return null;
  const m1 = m1d ? m1n / m1d : 0;
  const m2 = m2d ? m2sum / m2d : 0;
  const m3 = m3d ? m3n / m3d : 0;
  return { m1, m2, m3, score: 0.4 * m1 + 0.4 * m2 + 0.2 * m3, nGrouped: total, matches };
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
  // META-TERİM (canli-test #10, 2026-08-05): sistem-içi dil sızıntısı
  // ("OCR", "kayıtta var", "tespit edildi"...) — kaynak lib/coach-text.ts.
  meta: string[];
  violations: number;
  promptBytes: number;
  // B60 (2026-08-04): örneğin dili + EN'de yakalanan TR-sızıntı ihlalleri.
  // TR örneklerde enLeak HEP boş — mevcut TR ölçümü etkilenmez.
  lang: "tr" | "en";
  enLeak: string[];
  // repeatScore hammaddesi (rank-1, 2026-08-24) — yalnız repeatAggregate okur;
  // rapor satırlarına girmez, eski cycle çıktıları değişmez.
  openerTokens: string[];
  grams4: string[];
  concepts: string[];
};

function scoreSample(s: Sample): Row {
  const text = allText(s);
  const map = mapOfId(s.id);
  const agent = agentOfId(s.id);
  const f = s.final || {};

  const banned = bannedHits(text);
  const time = timeHits(text);
  const hp = hpHits(text);
  // lang aşağıda kuruluyor ama kod-adı ölçümü de dile duyarlı olmalı (EN'de
  // sade karşılığı resmî adla çakışan yetenekler ihlal sayılmamalı) — bu
  // yüzden dil burada BİR KEZ türetilip iki yerde de kullanılıyor.
  const sampleLang: "tr" | "en" = s.lang === "en" ? "en" : "tr";
  const codename = codenameHits(text, sampleLang);
  // META-TERİM (canli-test #10, 2026-08-05): dil-bağımsız ölçülür — "OCR" gibi
  // sistem-içi kelimeler EN çıktıda da aynı derecede yasak (koç sesi kuralı).
  const meta = findMetaTermHits(text);

  // B60 (pano özellik dalgası, 2026-08-04): TR-sızıntı YALNIZ EN örneklerde
  // ölçülür (dil-bağımsız değil — TR metin doğal olarak "kirli" görünürdü).
  // en-hedge kesişimi bannedHits'ten düşülür: BANNED_PHRASES'in EN girdileri
  // ("maybe/probably/it seems...") zaten yasak-ifade sayılıyor, aynı ihlali
  // iki kez saymak A/B'yi şişirirdi. Kanıt-kaynağı: evals/en-leak-detector.ts.
  const lang = sampleLang;
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
    meta,
    // B60 (2026-08-04): + enLeak.length EKLEMELİ — TR örnekte enLeak=[] → toplam değişmez.
    // canli-test #10 (2026-08-05): + meta.length — meta-dil artık ihlal sayılır
    // (bu geceki sızıntı sınıfı ölçüme bağlandı; eski korpuslarda varsa GÖRÜNÜR
    // olması bilinçli — kör noktayı kapatmak tam olarak bu).
    violations: banned.length + time.length + hp.length + codename.length + enLeak.length + meta.length,
    promptBytes: s.systemPromptBytes || 0,
    lang,
    enLeak,
    // repeatScore hammaddesi (rank-1): m1 = deathAnalysis'in ilk 6 token'ı,
    // m2 = 3 alan birleşik 4-gram'lar, m3 = kavram-aile geçişleri.
    openerTokens: tokensOf(f.deathAnalysis || "").slice(0, 6),
    grams4: grams4Of(text),
    concepts: conceptHits(text),
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
  // canli-test #10 (2026-08-05): meta-dil ihlal toplamı (OCR/kayıt/sistemde...).
  meta: number;
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
    meta: sum((r) => r.meta.length),
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
  // canli-test #10 (2026-08-05): meta-dil sınıfı — HEP basılır (bu geceki kör
  // noktanın kendisi: sınıf raporda görünmüyordu, sızıntı da görünmez kaldı).
  console.log(`    meta-dil (OCR/kayıt): ${a.meta}`);
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

  // repeatScore (rank-1, 2026-08-24): YALNIZ gerçek-korpus (M-id, maç-gruplu)
  // koşularında basılır — eski S/E-id cycle raporları bayt-aynı kalır.
  const rep = repeatAggregate(rows);
  if (rep) {
    console.log("\n── TEKRAR (maç-içi, düşük iyi) ──");
    console.log(`  repeatScore         : ${rep.score.toFixed(3)}  (${rep.matches} maç, ${rep.nGrouped} round)`);
    console.log(`    m1 açılış-iskeleti: ${rep.m1.toFixed(3)}`);
    console.log(`    m2 4-gram çakışma : ${rep.m2.toFixed(3)}`);
    console.log(`    m3 kavram-tekrarı : ${rep.m3.toFixed(3)}`);
  }

  const bad = rows.filter((r) => r.violations > 0);
  if (bad.length) {
    console.log("\n── İHLALLİ ÖRNEKLER ──");
    for (const r of bad) {
      const parts: string[] = [];
      if (r.banned.length) parts.push(`yasak:[${r.banned.join(", ")}]`);
      if (r.time.length) parts.push(`zaman:[${r.time.join(", ")}]`);
      if (r.hp.length) parts.push(`HP:[${r.hp.join(", ")}]`);
      if (r.codename.length) parts.push(`kod-ad:[${r.codename.join(", ")}]`);
      if (r.meta.length) parts.push(`meta:[${r.meta.join(", ")}]`);
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
  line("  meta-dil", A.meta, B.meta, false); // canli-test #10 (2026-08-05)
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

  // repeatScore A/B (rank-1, 2026-08-24): kabul çubuğu = sonra ≤ önce·0.5 VE
  // detector ≥ baseline VE ihlal 0 (plan repetitionMetric). 3 ondalık — f1'in
  // tek ondalığı 0-1 aralığında ayrım gücü taşımıyor. Yalnız M-id korpusta basılır.
  const repA = repeatAggregate(rowsA);
  const repB = repeatAggregate(rowsB);
  if (repA || repB) {
    console.log("\n── TEKRAR (maç-içi, düşük iyi) ──");
    const rline = (label: string, a: number, b: number) => {
      const d = b - a;
      const mark = Math.abs(d) < 0.0005 ? "   =" : `${d < 0 ? "✅" : "🔴"} ${d > 0 ? "+" : ""}${d.toFixed(3)}`;
      console.log(`  ${label.padEnd(24)} ${a.toFixed(3).padStart(7)} → ${b.toFixed(3).padStart(7)}   ${mark}`);
    };
    const g = (r: RepeatAgg | null, f: (x: RepeatAgg) => number) => (r ? f(r) : 0);
    rline("repeatScore", g(repA, (r) => r.score), g(repB, (r) => r.score));
    rline("  m1 açılış-iskeleti", g(repA, (r) => r.m1), g(repB, (r) => r.m1));
    rline("  m2 4-gram çakışma", g(repA, (r) => r.m2), g(repB, (r) => r.m2));
    rline("  m3 kavram-tekrarı", g(repA, (r) => r.m3), g(repB, (r) => r.m3));
  }

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
