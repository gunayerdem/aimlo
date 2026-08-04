/**
 * KB SAĞLAMLIK DOĞRULAMASI — "bir şey bozmaz" KANITI (lafta değil)
 * Her harita + her ajan + her rank için vision/report/feedback loader'ını çalıştırır,
 * hatasız + boş-olmayan blok döndürdüğünü doğrular. Bir .md bozuksa/eksikse burada patlar.
 * RUN: npx tsx scripts/verify-kb.ts
 */
import * as fs from "fs";
import * as path from "path";
// AGENT_ROLE_MAP + getAgentFile (F29 [16], pano dalga 2026-08-04): sözlük→dosya
// kapsam guard'ı loader'ın GERÇEK çözümleme yolunu kullanır (ayrı slug kopyası değil).
import { loadVisionKnowledge, loadKnowledge, AGENT_ROLE_MAP, getAgentFile } from "../lib/knowledge-loader";
import { DEATH_TYPE_GUIDE } from "../lib/death-type";
import { BANNED_PHRASES } from "../lib/ai-policy";
import { MAP_CALLOUTS, UNIVERSAL_CALLOUTS } from "../lib/map-callouts";

const KB = path.join(process.cwd(), "knowledge");
let fail = 0, pass = 0;
const check = (name: string, cond: boolean, detail = "") => {
  if (cond) { pass++; } else { fail++; console.log(`  ❌ ${name} ${detail}`); }
};

// 1) Tüm KB dosyaları okunabilir mi (fs + UTF-8)?
function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "_archive" ? [] : walk(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}
const files = walk(KB);
console.log(`\n[1] KB dosya okunabilirliği (${files.length} dosya)`);
for (const f of files) {
  try { const c = fs.readFileSync(f, "utf8"); check(f, c.length > 0, "(boş!)"); }
  catch (e) { check(f, false, `(okunamadı: ${(e as Error).message})`); }
}

// 2) Her harita vision'da yükleniyor mu (slug → maps/<slug>.md bulunuyor mu)?
const maps = fs.readdirSync(path.join(KB, "maps")).filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", ""));
console.log(`\n[2] Vision KB — her harita (${maps.length})`);
for (const m of maps) {
  try {
    const kb = loadVisionKnowledge({ map: m, agent: "Jett", rank: "silver", side: "attack" });
    const hasMap = !!kb.blocks.map && kb.blocks.map.length > 0;
    check(`map=${m}`, hasMap, `(map bloğu boş — loader bulamadı; files=[${kb.files.join(",")}])`);
  } catch (e) { check(`map=${m}`, false, `(throw: ${(e as Error).message})`); }
}

// 3) Her ajan vision'da yükleniyor mu?
const roleDirs = ["controllers", "duelists", "initiators", "sentinels"];
const agents = roleDirs.flatMap((r) => fs.readdirSync(path.join(KB, "agents", r)).filter((f) => f.endsWith(".md")).map((f) => f.replace(".md", "")));
console.log(`\n[3] Vision KB — her ajan (${agents.length})`);
for (const a of agents) {
  try {
    const kb = loadVisionKnowledge({ map: "Ascent", agent: a, rank: "silver", side: "defense" });
    check(`agent=${a}`, !!kb.blocks.agent && kb.blocks.agent.length > 0, `(agent bloğu boş)`);
  } catch (e) { check(`agent=${a}`, false, `(throw: ${(e as Error).message})`); }
}

// 4) report + feedback task'ları yükleniyor mu (her rank)?
console.log(`\n[4] report/feedback KB — her rank`);
for (const rank of ["iron", "silver", "gold", "diamond", "immortal", "radiant"]) {
  for (const task of ["report", "feedback"] as const) {
    try {
      const s = loadKnowledge(task, { map: "Summit", agent: "Omen", rank, enemyAgents: ["Jett", "Cypher"], side: "attack" });
      check(`${task}/${rank}`, typeof s === "string" && s.length > 0, `(boş)`);
    } catch (e) { check(`${task}/${rank}`, false, `(throw: ${(e as Error).message})`); }
  }
}

// 5) Summit özel — yeni harita gerçekten yükleniyor mu?
console.log(`\n[5] Summit yeni harita`);
try {
  const kb = loadVisionKnowledge({ map: "Summit", agent: "Raze", rank: "silver", side: "attack" });
  check("Summit vision map bloğu", !!kb.blocks.map && kb.blocks.map.includes("Mid Fountain"), "(Summit içeriği yok)");
} catch (e) { check("Summit", false, `(throw: ${(e as Error).message})`); }

// 6) DEATH-TYPE ÇAPA SÖZLEŞMESİ (KB gece nöbeti 2026-07-08 — 5 çapa parafraz
//    yüzünden KOPUKTU ve model generic bloğa kaçıyordu). Her kbBlock, universal.md'de
//    VERBATIM "H2" ya da "H2 — H3" karşılığı olmalı. universal.md'yi yeniden
//    yapılandıran HERKES bu testi kırmadan geçemez.
console.log(`\n[6] death-type kbBlock çapaları ↔ universal.md başlıkları`);
{
  const uni = fs.readFileSync(path.join(KB, "ranks", "universal.md"), "utf8");
  const h2s: string[] = [];
  const h3sByH2 = new Map<string, string[]>();
  let curH2 = "";
  for (const line of uni.split("\n")) {
    const h2 = line.match(/^## (.+?)\s*$/);
    const h3 = line.match(/^### (.+?)\s*$/);
    if (h2) { curH2 = h2[1]; h2s.push(curH2); h3sByH2.set(curH2, []); }
    else if (h3 && curH2) h3sByH2.get(curH2)!.push(h3[1]);
  }
  for (const [dtype, guide] of Object.entries(DEATH_TYPE_GUIDE)) {
    const kb = guide.kbBlock;
    // Kural: kbBlock === H2, ya da kbBlock === `${H2} — ${H3}` (H3 içinde de
    // em-dash olabilir → startsWith + kalan-eşitlik ile çöz).
    const ok = h2s.some((h2) => {
      if (kb === h2) return true;
      if (!kb.startsWith(h2 + " — ")) return false;
      const rest = kb.slice(h2.length + 3);
      return (h3sByH2.get(h2) ?? []).includes(rest);
    });
    check(`çapa ${dtype} → "${kb}"`, ok, "(universal.md'de verbatim H2 / H2 — H3 karşılığı YOK)");
  }
}

// 7) YASAK-KELİME TARAMASI — KB dosyaları BANNED_PHRASES içermemeli (KB'nin cümlesi
//    çıktının cümlesidir; yasaklı kalıp KB'deyse model onu birebir üretir).
//    İstisna: yasak-örneği olarak TIRNAK içinde öğretilen satırlar ("kill aldı" deme,
//    → düzeltme okları, YASAK etiketli satırlar) taranmaz.
//    SÖZLEŞME (2026-07-08): FAIL yalnız RUNTIME'A YÜKLENEN dosyada — prompt'a
//    ulaşamayan dosya (yüklenmeyen general/* kaynak-materyali) yalnız UYARI sayılır.
//    Runtime seti knowledge-loader'dan türetilir: maps/** + matchups/** + ranks/** +
//    agents/<rol>/*.md + general'in loader'da geçen 7 dosyası. Yeni bir general
//    dosyası runtime'a bağlanırsa BURAYA da eklenmeli (yoksa ihlali fail etmez).
// MODÜL SEVİYESİNE ALINDI (F29, pano dalga 2026-08-04): eskiden [7]'nin blok
// scope'undaydı; [15] işaretçi-tutarlılık guard'ı bu seti knowledge-loader.ts'in
// GERÇEK loadFile("general/…") çağrılarıyla iki yönlü kıyaslıyor — "yeni general
// dosyası runtime'a bağlanırsa BURAYA da eklenmeli" sözleşmesi artık elle değil
// testle korunuyor. Davranış [7] için değişmedi (aynı set, aynı kullanım).
const RUNTIME_GENERAL = new Set([
  "coaching-core.md", "post-plant-playbook.md", "economy-mastery.md",
  "pro-analysis.md", "radiant-tips.md", "weapon-comp-compact.md",
  "retake-playbook.md", // knowledge-loader: spikePlanted && side==="defense" (2026-07-19)
]);

console.log(`\n[7] KB yasak-kelime taraması (${BANNED_PHRASES.length} kalıp)`);
{
  const isRuntimeFile = (rel: string): boolean => {
    const p = rel.replace(/\\/g, "/");
    if (p.startsWith("maps/") || p.startsWith("matchups/") || p.startsWith("ranks/")) return true;
    if (/^agents\/[^/]+\/[^/]+\.md$/.test(p)) return true; // per-agent dosyaları (rol klasörü altında)
    if (p.startsWith("general/")) return RUNTIME_GENERAL.has(p.slice("general/".length));
    return false;
  };
  const exemptLine = /(yasak|deme\b|denmez|kullanma|yerine|→|❌)/i;
  let hits = 0, warns = 0;
  for (const f of files) {
    const rel = path.relative(KB, f);
    const runtime = isRuntimeFile(rel);
    const lines = fs.readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (exemptLine.test(line)) return;
      const lower = line.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        if (lower.includes(phrase.toLowerCase())) {
          if (runtime) {
            hits++;
            check(`${rel}:${i + 1}`, false, `(yasak kalıp: "${phrase}")`);
          } else {
            warns++;
          }
        }
      }
    });
  }
  if (warns > 0) console.log(`  ⚠ runtime-dışı (yüklenmeyen) dosyalarda ${warns} yasak-kalıp — fail değil, temizlik adayı`);
  check("KB yasak-kelime temiz (runtime)", hits === 0, `(${hits} ihlal)`);
}

// 8) Statik silah+komp bloğu vision'a yükleniyor mu?
console.log(`\n[8] weapon-comp-compact statik bloğu`);
try {
  const kb = loadVisionKnowledge({ map: "Ascent", agent: "Jett", side: "attack" });
  check("static blok dolu", !!kb.blocks.static && kb.blocks.static.length > 500, "(weapon-comp-compact.md yok/boş)");
  check("static blok komp bölümlü", !!kb.blocks.static && kb.blocks.static.includes("Komp Okuma"), "(Komp Okuma bölümü yok)");
  const sizeOk = !kb.blocks.static || kb.blocks.static.length <= 8500;
  check("static blok ≤8.5KB (maliyet disiplini)", sizeOk, `(${kb.blocks.static?.length ?? 0}b)`);
} catch (e) { check("static blok", false, `(throw: ${(e as Error).message})`); }

// 9) UNIVERSAL.MD BOYUT TAVANI — universal.md HER istekte prompt'a gider (maliyet
//    disiplini). Tavanı aşmak = her AI isteğinin maliyetini KALICI büyütmek.
//    Ölçüm 2026-07-19: 40.955 bayt → tavan = ~%10 pay ile 45.000 bayt.
//    Aşarsan bu BİLİNÇLİ bir karar olmalı: önce içeriği yoğunlaştır / IF-kapıla /
//    arşive taşı; gerçekten gerekiyorsa tavanı commit mesajında gerekçelendirerek yükselt.
console.log(`\n[9] universal.md boyut tavanı`);
{
  const UNI_CAP_BYTES = 45_000;
  const uniSize = fs.statSync(path.join(KB, "ranks", "universal.md")).size;
  check(
    `universal.md ≤${UNI_CAP_BYTES}b (her-istek maliyet tavanı)`,
    uniSize <= UNI_CAP_BYTES,
    `(${uniSize}b — tavan aşıldı! Bu bilinçli bir karar olmalı: önce yoğunlaştır, olmuyorsa tavanı gerekçeyle güncelle)`
  );

  // 🔴 universal-2.md — B37 bölünmesinin ikinci sayfası (2026-07-31).
  // İKİ ayrı guard, çünkü bu bölme bir kez SESSİZ İÇERİK KAYBI üretti: dosya
  // oluşturuldu, içerik universal.md'den çıkarıldı, ama loader'a bağlanmadığı
  // için ~3 KB koçluk bilgisi her prompt'tan düştü ve hiçbir test bunu görmedi.
  const uni2Path = path.join(KB, "ranks", "universal-2.md");
  const uni2Exists = fs.existsSync(uni2Path);
  if (uni2Exists) {
    const UNI2_CAP_BYTES = 8_000;
    const uni2Size = fs.statSync(uni2Path).size;
    check(
      `universal-2.md ≤${UNI2_CAP_BYTES}b (her-istek maliyet tavanı)`,
      uni2Size <= UNI2_CAP_BYTES,
      `(${uni2Size}b — tavan aşıldı; universal.md ile TOPLAM maliyet düşünülmeli)`
    );
    // Asıl guard: dosya VAR ama yükleyen kod YOKSA içerik ölü demektir.
    const loaderSrc = fs.readFileSync(path.join(process.cwd(), "lib", "knowledge-loader.ts"), "utf8");
    check(
      "universal-2.md loader tarafından YÜKLENİYOR (sessiz içerik kaybı guard'ı)",
      loaderSrc.includes("universal-2.md") && loaderSrc.includes("profile2"),
      "(dosya var ama lib/knowledge-loader.ts onu okumuyor → içerik prompt'a HİÇ gitmiyor)"
    );
    const visionSrc = fs.readFileSync(path.join(process.cwd(), "app", "api", "ai", "vision", "route.ts"), "utf8");
    check(
      "vision route profile2 bloğunu system prompt'a ekliyor",
      visionSrc.includes("blocks.profile2"),
      "(loader yüklüyor ama vision yolu bloğu prompt'a koymuyor)"
    );
  }
}

// 10) HARİTA DOSYASI TAVANI — harita bloğu her vision isteğinde prompt'a gider.
//     Ölçüm 2026-07-19: en büyük dosya summit.md = 33.447 bayt → tavan = ~%10 pay
//     ile 37.000 bayt. Aşım = bilinçli karar (yoğunlaştır ya da tavanı gerekçeyle yükselt).
console.log(`\n[10] harita dosyası boyut tavanı (${maps.length} dosya)`);
{
  const MAP_CAP_BYTES = 37_000;
  for (const m of maps) {
    const mSize = fs.statSync(path.join(KB, "maps", `${m}.md`)).size;
    check(
      `maps/${m}.md ≤${MAP_CAP_BYTES}b`,
      mSize <= MAP_CAP_BYTES,
      `(${mSize}b — tavan aşıldı! Bilinçli karar gerekir: yoğunlaştır ya da tavanı gerekçeyle güncelle)`
    );
  }
}

// 11) AJAN × AKTİF-HAVUZ KAPSAM GUARD'I — pool frontmatter'ı "aktif" olan her
//     harita, 29 aktif ajan dosyasının her birinde adıyla geçmeli (ajan rehberi
//     aktif havuzu kapsamalı).
//     KİLİTLENDİ (B117, 2026-07-31): süpürme dalgaları BİTTİ — 7 aktif harita
//     (ascent/breeze/haven/lotus/split/summit/sunset) × 29 ajan dosyası kapsamı
//     tam, 13/13 harita dosyasında pool frontmatter'ı var (doğrulandı). Uyarı
//     modunun gerekçesi kalmadı; false kaldıkça yeni bir ajan dosyası ya da havuz
//     rotasyonu kapsamı SESSİZCE delebilirdi. Artık eksik kapsam FAIL.
console.log(`\n[11] ajan × aktif-havuz kapsam guard'ı`);
{
  const STRICT_POOL_COVERAGE = true; // B117: kapsam tamamlandı → eksik kapsam artık FAIL
  const frontmatterOf = (content: string): string => {
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return fm ? fm[1] : "";
  };
  // SAVUNMA KATMANI (2026-07-19): pool anahtarı OLMAYAN harita dosyası bu guard'ın
  // kör noktasıdır (aktif olsa bile kapsam asla zorlanmaz — false-PASS). Eksik
  // anahtar sessiz kalmasın: uyarı bas + STRICT modda FAIL'e dönüşür.
  const noPoolMaps: string[] = [];
  const activeMaps = maps.filter((m) => {
    const fm = frontmatterOf(fs.readFileSync(path.join(KB, "maps", `${m}.md`), "utf8"));
    if (!/^pool:/im.test(fm)) { noPoolMaps.push(m); return false; }
    return /^pool:\s*["']?aktif/im.test(fm);
  });
  for (const m of noPoolMaps) {
    console.log(`  ⚠ ${m}: pool frontmatter'ı YOK — kapsam guard'ı bu haritayı göremiyor (aktifse sessiz kör nokta)`);
  }
  check(
    `her harita dosyasında pool frontmatter'ı var (${maps.length - noPoolMaps.length}/${maps.length}${STRICT_POOL_COVERAGE ? "" : " — uyarı modu"})`,
    STRICT_POOL_COVERAGE ? noPoolMaps.length === 0 : true,
    `(pool anahtarı eksik: [${noPoolMaps.join(", ")}])`
  );
  const agentFiles = roleDirs.flatMap((r) =>
    fs.readdirSync(path.join(KB, "agents", r))
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.join(KB, "agents", r, f))
  );
  console.log(`  (pool=aktif harita: ${activeMaps.length} → [${activeMaps.join(", ")}] × ${agentFiles.length} ajan dosyası)`);
  for (const m of activeMaps) {
    // Harita adı ASCII slug — 'i' bayrağı Türkçe İ tuzağına girmeden case-insensitive eşler.
    const re = new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const missing = agentFiles.filter((f) => !re.test(fs.readFileSync(f, "utf8")));
    if (missing.length > 0) {
      const names = missing.map((f) => path.basename(f, ".md")).join(", ");
      console.log(`  ⚠ ${m}: ${missing.length}/${agentFiles.length} ajan dosyasında adı geçmiyor → [${names}]${STRICT_POOL_COVERAGE ? " (STRICT: FAIL)" : " (uyarı modu)"}`);
    }
    check(
      `havuz kapsamı ${m} (${agentFiles.length - missing.length}/${agentFiles.length} ajan${STRICT_POOL_COVERAGE ? "" : " — uyarı modu"})`,
      STRICT_POOL_COVERAGE ? missing.length === 0 : true,
      `(${missing.length} ajan dosyası ${m} adını içermiyor)`
    );
  }
}

// N) HARİTA CALLOUT TABLOSU ↔ KB TUTARLILIĞI (canlı bug 2026-07-21)
// lib/map-callouts.ts, koçun uydurma yer adını (Lotus'ta "A Short") ayıklamak
// için kullanılıyor. Tablo KB'den sessizce SAPARSA iki yönde de zarar var:
//   • Tabloda olup KB'de olmayan  → gerçekte var olmayan bir adı meşru sayarız
//   • KB'de olup tabloda olmayan  → MEŞRU koçluk metnini bozarız (daha kötü)
// Bu kontrol birincisini yakalar; ikincisi için tablo bilerek geniş tutuluyor.
console.log(`\n[N] Harita callout tablosu ↔ KB tutarlılığı`);
{
  const mapFiles = fs.readdirSync(path.join(KB, "maps")).filter((f) => f.endsWith(".md"));
  const known = new Set(mapFiles.map((f) => f.replace(".md", "")));
  // Tablodaki her harita gerçekten var mı?
  for (const m of Object.keys(MAP_CALLOUTS)) {
    check(`tablo haritası '${m}' KB'de var`, known.has(m), "(knowledge/maps/ altında yok)");
  }
  // Her callout, kendi haritasının .md dosyasında geçiyor mu?
  for (const [m, callouts] of Object.entries(MAP_CALLOUTS)) {
    if (!known.has(m)) continue;
    const body = fs.readFileSync(path.join(KB, "maps", `${m}.md`), "utf8").toLowerCase();
    // Evrensel adlar (spawn'lar) her haritada VAR ama KB dosyaları hepsini tek
    // tek yazmaz → harita-başına kontrolden muaf.
    const ghosts = callouts.filter(
      (c) => !UNIVERSAL_CALLOUTS.includes(c.toLowerCase()) && !body.includes(c.toLowerCase()),
    );
    check(
      `${m}: ${callouts.length - ghosts.length}/${callouts.length} callout KB'de geçiyor`,
      ghosts.length === 0,
      ghosts.length ? `(KB'de BULUNMAYAN: ${ghosts.join(", ")})` : "",
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9) PROMPT KAYNAKLARI YASAK-KELİME TARAMASI (dil denetimi 2026-07-25)
// KÖK NEDEN: KB dosyaları [7]'de taranıyordu ama PROMPT kaynak dosyaları HİÇ
// taranmıyordu. Sonuç: lib/vision-prompt.ts modele `nextRoundSuggestion'da
// "... bilgi topla ..." de` diye ÖRNEK veriyordu — oysa "bilgi topla"
// ai-policy.ts BANNED_PHRASES listesindeydi. Yani prompt'un bir yeri yasaklarken
// başka yeri EMREDİYORDU; canlı eval'de eco/force/pistol senaryolarının 3'ünde
// yasak kalıp çıktı. Bu kontrol o çelişkiyi sınırda yakalar.
// NOT: BANNED_PHRASES tanımının KENDİSİ (ai-policy.ts:11 listesi) ve yasağı
// ANLATAN satırlar meşru — yalnız modele ÖRNEK/EMİR olarak verilen kullanımlar
// hatadır. Ayrım: "YASAK"/"KULLANMA"/"YAZMA" gibi olumsuzlayıcı bir işaret aynı
// satırda varsa muaf.
{
  const PROMPT_SOURCES = [
    "lib/vision-prompt.ts",
    "lib/round-engine.ts",
    "lib/improvement-plan.ts",
    "lib/playstyle-system.ts",
    "lib/skill-system.ts",
  ];
  console.log(`\n[12] Prompt kaynaklarında yasak-kalıp taraması (${PROMPT_SOURCES.length} dosya)`);
  // Muafiyet: yasağı ANLATAN / KÖTÜ ÖRNEK gösteren / yanlış→doğru eşlemesi yapan satırlar.
  // Bağlam-duyarlı: işaret aynı satırda olmayabilir (çok satırlı "KÖTÜ ÖRNEK" JSON bloğu
  // gibi) → önceki 6 satıra da bak.
  const NEGATORS =
    /YASAK|KULLANMA|YAZMA|DEME\b|ASLA|BANNED|kaldırıldı|KALDIRILDI|KÖTÜ|YANLIŞ|BAD EXAMPLE|karşı-örnek|→/i;
  for (const rel of PROMPT_SOURCES) {
    const abs = path.join(process.cwd(), rel);
    if (!fs.existsSync(abs)) continue;
    const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/);
    const hits: string[] = [];
    lines.forEach((line, i) => {
      // satırın kendisi VEYA yakın önceki bağlam yasağı işaret ediyorsa muaf
      const context = lines.slice(Math.max(0, i - 6), i + 1).join("\n");
      if (NEGATORS.test(context)) return;
      const low = line.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        const p = phrase.toLowerCase();
        // Çok kısa/genel kalıpları atla (yanlış-pozitif üretir)
        if (p.length < 10) continue;
        // KELİME SINIRI: "bilgi toplayan oyuncu" bir İSİM TAMLAMASI, öğüt değil —
        // "bilgi topla" alt-dizgisini içerse de ihlal sayılmamalı. Kalıbın ardından
        // Türkçe harf gelmemeli (çekim eki = farklı sözcük).
        const idx = low.indexOf(p);
        if (idx === -1) continue;
        const after = low.charAt(idx + p.length);
        if (after && /[a-zçğıöşü]/.test(after)) continue;
        hits.push(`${rel}:${i + 1} «${phrase}»`);
      }
    });
    check(
      `${rel} yasak kalıp içermiyor`,
      hits.length === 0,
      hits.length ? `\n      ${hits.join("\n      ")}` : "",
    );
  }

  // ── 12b) ÖZ-ÇELİŞKİ GUARD'I: "kanıtı olmayan olguyu EMREDEN" prompt satırı ──
  // 🔴 NEDEN (B35, 2026-07-31 — bu sınıf 4. kez): reality-checker düşmanın
  // util/setup iddiasını SİLERKEN, json_schema description'ı modele tam olarak
  // o iddiayı yazmasını EMREDİYORDU ("Madde 1 = düşmanın SOMUT setup/util'i",
  // örnek: "Cypher tuzaklarını B Main girişine dizdi"). OCR payload'ında düşman
  // util verisi YOK → model uydurmak zorundaydı, guard siliyordu, feedback
  // fakirleşiyordu. Aynı desen daha önce "bilgi topla" ve "kill al-" ile yaşandı.
  //
  // Kural: prompt kaynaklarında modele DÜŞMAN UTIL YERLEŞİMİ yazdıran emir
  // kipi bulunmamalı. Yasağı anlatan/karşı-örnek gösteren satırlar muaf.
  const SELF_CONTRADICT = [
    /düşmanın\s+(?:bu\s+round'?daki\s+)?SOMUT\s+setup/i,
    /enemy'?s\s+CONCRETE\s+setup/i,
    /tuzaklarını\s+\w+\s+girişine\s+dizdi/i,
    /lined\s+his\s+traps/i,
  ];
  for (const rel of PROMPT_SOURCES) {
    const abs = path.join(process.cwd(), rel);
    if (!fs.existsSync(abs)) continue;
    const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/);
    const bad: string[] = [];
    lines.forEach((line, i) => {
      // ⚠ BURADA GENİŞ `NEGATORS` MUAFİYETİ KULLANILMAZ (doğrulama turunda öğrenildi):
      // suçlu json_schema description'ı BAŞKA sebeplerle "YASAK" kelimesini içeriyor
      // ("generic gözlem YASAK", "İngilizce yön YASAK") → geniş muafiyet guard'ı
      // tamamen susturuyordu ve hiç ateşlenmeyen bir guard, guard değildir.
      // Yalnız İKİ dar muafiyet: (a) satır bir KOD YORUMU (bu bloğun kendi açıklaması
      // gibi), (b) satır açıkça "uydurma" yasağını taşıyor.
      const s = line.trim();
      if (s.startsWith("//") || s.startsWith("*") || s.startsWith("/*")) return;
      if (/UYDURMA|do NOT invent/i.test(line)) return;
      for (const re of SELF_CONTRADICT) {
        if (re.test(line)) bad.push(`${rel}:${i + 1} «${line.trim().slice(0, 90)}»`);
      }
    });
    check(
      `${rel} kanıtsız düşman-util iddiası EMRETMİYOR (öz-çelişki guard'ı)`,
      bad.length === 0,
      bad.length ? `\n      ${bad.join("\n      ")}` : "",
    );
  }
}

// 13) "BU AJANA KARŞI" KESİT SÖZLEŞMESİ (B119 + B36/B41, 2026-07-31)
//     Bu bölüm artık RUNTIME SÖZLEŞMESİ: knowledge-loader hem vision'da
//     (killerInfo → loadCounterAgentSection) hem feedback/report'ta (düşman komp)
//     düşman ajan için TAM dosya yerine YALNIZ bu H2 kesitini yüklüyor. Bölüm
//     yoksa loader sessiz/uyarıyla geçer → o ajan için karşı-oyun bilgisi prompt'a
//     HİÇ girmez (sessiz kapsam kaybı). Bugün 29/29 dosyada var; yeni bir ajan
//     dosyası bölümsüz eklenirse BURADA patlasın.
console.log(`\n[13] her ajan dosyasında "Bu Ajana Karşı" H2 kesiti`);
{
  const COUNTER_H2 = /^##\s+.*bu ajana karş[ıi]/im;
  for (const r of roleDirs) {
    for (const f of fs.readdirSync(path.join(KB, "agents", r)).filter((x) => x.endsWith(".md"))) {
      const body = fs.readFileSync(path.join(KB, "agents", r, f), "utf8");
      check(
        `agents/${r}/${f} → "Bu Ajana Karşı" H2`,
        COUNTER_H2.test(body),
        "(bölüm YOK — loader düşman-ajan kesitini bu dosyadan çıkaramaz, karşı-oyun bilgisi prompt'a girmez)",
      );
    }
  }
}

// 14) BOŞ-BÖLÜM GUARD'I (F29, pano dalga 2026-08-04)
//     NEDEN: RAG seçimi (death-type çapaları, "Bu Ajana Karşı" kesiti, side/rank
//     filtreleri) H2 sınırlarıyla çalışır. İçeriği boş bir H2 = başlığı var ama
//     dersi olmayan ölü işaretçi: çapa "eşleşir", model başlıktan başka hiçbir
//     şey alamaz ve hiçbir test bunu görmezdi (universal-2.md sessiz-içerik-kaybı
//     dersinin bölüm-seviyesi eşleniği). Ölçüm 2026-08-04: HEAD'de 0 boş bölüm —
//     guard mevcut durumu KİLİTLER, davranış değiştirmez.
//     "Boş" tanımı: başlık satırından sonraki gövde, dekoratif ═-çizgileri ve
//     yalnız-tire ayraç satırları düşüldükten sonra whitespace'ten ibaretse.
console.log(`\n[14] boş H2 bölümü guard'ı (${files.length} dosya)`);
{
  for (const f of files) {
    const rel = path.relative(KB, f);
    const body = fs.readFileSync(f, "utf8");
    const sections = body.split(/(?=^## )/gm);
    const empties: string[] = [];
    for (const s of sections) {
      const hm = s.match(/^## (.+?)\s*$/m);
      if (!hm) continue; // H2-öncesi giriş bloğu — bölüm değil
      const content = s
        .slice(s.indexOf("\n") + 1)
        .replace(/^═{3,}\s*$/gm, "")   // stripKbWhitespace'in de sildiği süs çizgileri
        .replace(/^-{3,}\s*$/gm, "");  // yalnız yatay-çizgi ayraç satırı
      if (content.trim().length === 0) empties.push(hm[1]);
    }
    check(
      `bölüm doluluğu ${rel}`,
      empties.length === 0,
      `(içi BOŞ H2: ${empties.map((h) => `"${h}"`).join(", ")} — başlık var, ders yok)`,
    );
  }
}

// 15) İŞARETÇİ TUTARLILIĞI (F29, pano dalga 2026-08-04)
//     NEDEN (yaşanmış sınıf): universal-2.md olayında dosya VARDI ama yükleyen
//     kod yoktu → ~3KB sessiz içerik kaybı ([9]'daki guard o TEK dosyayı korur).
//     Bu guard sınıfı GENELLER, iki yönde:
//       (a) knowledge-loader.ts'in koddaki her LİTERAL "…/*.md" işaretçisi diskte
//           gerçekten VAR olmalı (ölü işaretçi = loadFile catch'i "" döner,
//           içerik prompt'a HİÇ girmez, hiçbir şey patlamaz — en sessiz kayıp).
//       (b) [7]'nin RUNTIME_GENERAL seti ↔ loader'ın gerçek general/ çağrıları
//           BİREBİR aynı olmalı. [7]'nin kendi yorumu "yeni general dosyası
//           bağlanırsa buraya da eklenmeli (yoksa ihlali fail etmez)" diyordu —
//           elle hatırlanan sözleşme artık burada zorlanıyor.
//     Yalnız KOD satırları taranır (yorum satırındaki örnek yol — ör. loader'ın
//     JSDoc'undaki "matchups/jett_vs_cypher.md" — guard'ı yanlış tetiklemesin).
console.log(`\n[15] işaretçi tutarlılığı — knowledge-loader.ts ↔ disk ↔ RUNTIME_GENERAL`);
{
  const loaderPath = path.join(process.cwd(), "lib", "knowledge-loader.ts");
  const codeLines = fs
    .readFileSync(loaderPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => {
      const t = l.trim();
      return !(t.startsWith("//") || t.startsWith("*") || t.startsWith("/*"));
    });
  const litRe = /"((?:general|ranks|maps|matchups|agents)\/[^"$]*?\.md)"/g;
  const literals = new Set<string>();
  for (const line of codeLines) {
    let m: RegExpExecArray | null;
    while ((m = litRe.exec(line))) literals.add(m[1]);
  }
  check("loader'da en az bir literal KB işaretçisi bulundu (tarayıcı sağlığı)", literals.size > 0,
    "(regex hiç işaretçi bulamadı — guard kör, tarama desenini güncelle)");
  for (const rel of [...literals].sort()) {
    check(
      `loader işaretçisi diskte var: ${rel}`,
      fs.existsSync(path.join(KB, rel)),
      "(ÖLÜ İŞARETÇİ — loadFile sessizce \"\" döner, içerik prompt'a hiç girmez)",
    );
  }
  const loaderGenerals = new Set(
    [...literals].filter((l) => l.startsWith("general/")).map((l) => l.slice("general/".length)),
  );
  for (const g of [...loaderGenerals].sort()) {
    check(
      `loader general '${g}' RUNTIME_GENERAL'de kayıtlı`,
      RUNTIME_GENERAL.has(g),
      "([7] yasak-kelime taraması bu RUNTIME dosyayı runtime-dışı sanıyor → ihlali FAIL etmez)",
    );
  }
  for (const g of [...RUNTIME_GENERAL].sort()) {
    check(
      `RUNTIME_GENERAL '${g}' loader'da hâlâ kullanılıyor`,
      loaderGenerals.has(g),
      "(bayat kayıt — loader bu dosyayı artık yüklemiyor; set güncellenmeli)",
    );
  }
}

// 16) SÖZLÜK → DOSYA KAPSAM GUARD'I (F29, pano dalga 2026-08-04)
//     NEDEN: [3] ve [13] ajan listesini DİSKTEN türetiyor — bir ajan dosyası
//     silinir/yanlış klasöre taşınırsa döngüden sessizce düşer, hiçbir check
//     fail olmaz (disk-türevli liste kendi eksiğini göremez). Otorite liste
//     AGENT_ROLE_MAP'tir (loader'ın çözümleme sözlüğü): her sözlük ajanı
//     getAgentFile ile GERÇEK bir dosyaya çözünmeli. Ters yön de kapalı:
//     diskteki her ajan dosyasının slug'ı sözlükte olmalı (sözlüksüz dosya =
//     loader'ın ASLA yükleyemeyeceği ölü KB içeriği).
console.log(`\n[16] AGENT_ROLE_MAP ↔ disk kapsamı (${Object.keys(AGENT_ROLE_MAP).length} sözlük ajanı)`);
{
  for (const agentName of Object.keys(AGENT_ROLE_MAP).sort()) {
    check(
      `sözlük ajanı '${agentName}' → per-agent dosya çözünüyor`,
      getAgentFile(agentName) !== null,
      "(dosya YOK/yanlış rol klasöründe — bu ajanın KB'si hiçbir route'a yüklenmez)",
    );
  }
  const dictSlugs = new Set(
    Object.keys(AGENT_ROLE_MAP).map((a) => a.toLowerCase().replace(/[^a-z0-9]/g, "")),
  );
  for (const r of roleDirs) {
    for (const f of fs.readdirSync(path.join(KB, "agents", r)).filter((x) => x.endsWith(".md"))) {
      const slug = f.replace(/\.md$/, "");
      check(
        `disk ajan dosyası agents/${r}/${f} sözlükte var`,
        dictSlugs.has(slug),
        "(AGENT_ROLE_MAP'te karşılığı yok — loader bu dosyayı asla seçemez, ölü içerik)",
      );
    }
  }
}

console.log(`\n══════ SONUÇ: ${pass} geçti, ${fail} başarısız ══════`);
if (fail > 0) { console.log("❌ KB BOZUK — bir şey kırılmış!"); process.exit(1); }
console.log("✅ TÜM KB sağlam — hiçbir dosya bozuk/eksik değil, tüm route'lar yüklüyor.");
