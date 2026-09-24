/**
 * TÜRKÇE SÜZGEÇ GUARD'LARI TESTİ — B1 (spike) · B2 (sayaç) · B3 (konum/katil/roster)
 *
 * NEDEN VAR (TR boru hattı ölçümü 2026-09-16): 39 GERÇEK pipeline çağrısında
 * (prod zinciri, lang=tr) üç hata sınıfı ölçüldü ve hiçbiri test altında DEĞİLDİ:
 *   B1  "spike kurulduktan sonra"  → "ktan sonra"        (sağ sınırsız desen)
 *   B2  "Son 9 round'un 9'unda"    → "Son 6 kez'un 9'unda" / "Son 'un hepsinde"
 *   B3  konum yokken uydurma callout + "Rakip bir düşman" + "kadro'ı"
 *
 * ⚠ KAPSAMA BOŞLUĞU (bu testin asıl gerekçesi): `rewriteUnsafeClaims`e bugüne
 * kadar HİÇBİR test ulaşmıyordu — test-killer-guard/test-agent-unknown-guard
 * `roundHistory: []` veriyor (:1169 kapısı kapalı), test-pipeline-chain'in
 * hafızalı vakası sayı/pozisyon/tekrar sinyali taşımıyor (:1170 kapısı kapalı).
 * Yani B2 kodu SIFIR kapsamayla canlıya gidiyordu.
 *
 * İZOLASYON İLKESİ: her guard `factGround.X === false` kapısıyla açılır; undefined
 * iken HİÇ çalışmaz. Bu yüzden her blok YALNIZ kendi bayrağını false yapar →
 * vakalar birbirini kirletmez.
 *
 * Koşum: npx tsx scripts/test-tr-guards.ts   (npm test içinde)
 */
import { realityCheck, extractClaims } from "../lib/reality-checker";
import * as CT from "../lib/coach-text";
const { cleanCoachText, enforceSuppliedCallout } = CT;
import { trOrdinalLocative } from "../lib/tr-suffix";
import { buildHistoryBlock } from "../lib/history-block";
import * as fs from "node:fs";
import * as path from "node:path";
import { buildVisionContext, visionPostprocessOpts, type VisionPromptBody } from "../lib/vision-prompt-builder";
import { finalizeVisionFeedback, toRoundMemory } from "../lib/vision-postprocess";

let fail = 0;
let n = 0;
function t(name: string, ok: boolean, extra = "") {
  n++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : " — " + extra}`);
  if (!ok) fail++;
}
/** Metin BAYT-AYNI kalmalı. */
function same(name: string, got: string, input: string) {
  t(name, got === input, `beklenen BAYT-AYNI\n        girdi : "${input}"\n        çıktı : "${got}"`);
}
function eq(name: string, got: string, want: string) {
  t(name, got === want, `\n        beklenen: "${want}"\n        çıktı   : "${got}"`);
}

type Mem = { round_index: number; died: boolean; death_position?: string | null; position_confidence?: string };
/** total round, son `deaths` tanesi `pos`'ta ÖLÇÜLMÜŞ ölüm (high confidence). */
function mem(total: number, deaths: number, pos = "A Site"): Mem[] {
  const out: Mem[] = [];
  for (let i = 0; i < total; i++) {
    const isDeath = i >= total - deaths;
    out.push({
      round_index: i + 1,
      died: isDeath,
      death_position: isDeath ? pos : null,
      position_confidence: isDeath ? "high" : undefined,
    });
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B1 · SPIKE (kelime-ortası kesme + faz koruması) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const g = (planted: boolean) => ({ hasSpike: false, spikeObservedPlanted: planted } as never);
  const run = (s: string, planted = false, lang: "tr" | "en" | undefined = "tr") =>
    realityCheck(s, [] as never, g(planted), "death", lang).text;

  // 1 — GROUNDED: ölçülmüş plant ifadesi KESİLMEZ (canlı astra-a / r2-a / r4-a)
  const c1 = "A site'te spike kurulduktan sonra açık alanda kaldın, Jett seni Vandal'la oradan vurdu.";
  same("1  grounded 'kurulduktan sonra' bayt-aynı", run(c1, true), c1);

  // 2-4 — UNGROUNDED: nötrlenir, kelime ortasından KESİLMEZ
  eq("2  ungrounded → 'plant sonrası'", run(c1, false),
    "A site'te plant sonrası açık alanda kaldın, Jett seni Vandal'la oradan vurdu.");
  eq("3  'kurulduğunda' → 'plant sonrası'",
    run("Retake'i planla: spike kurulduğunda bir kişi defuse hattını tut.", false),
    "Retake'i planla: plant sonrası bir kişi defuse hattını tut.");
  eq("4  'kuruluyken' → post-plant (DURUM)",
    run("A Site'te spike kuruluyken girişte açıldın.", false),
    "A Site'te post-plant'te girişte açıldın.");

  // 5-6 — FAZ TERSİNE ÇEVRİLMEZ (K1): plant DEVAM EDİYOR, "post-plant" demek olguyu ters çevirir
  const c5 = "Spike kurulurken B'ye rotasyon al.";
  same("5  'kurulurken' DOKUNULMAZ (K1 faz koruması)", run(c5, false), c5);
  const c6 = "Spike kurarken arkanı kolla.";
  same("6  'kurarken' DOKUNULMAZ (K1)", run(c6, false), c6);

  // 7-10 — dikiş onarımı: öksüz bağlaç / çift nokta / cümle başı büyük harf
  eq("7  öndeki iddia silinince bağlaç yutulur",
    run("Spike kuruldu ve sen açıkta kaldın.", false), "Sen açıkta kaldın.");
  eq("8  arkadaki iddia silinince bağlaç yutulur",
    run("Açıkta kaldın ve spike kuruldu.", false), "Açıkta kaldın.");
  eq("9  olumsuz iddia grounded'da da düşer (ÇELİŞKİ)",
    run("Spike kurulmadı, yine de siteye girdin.", true), "Yine de siteye girdin.");
  eq("10 çift nokta bırakmaz",
    run("Açıyı geç aldın. Spike kuruldu.", false), "Açıyı geç aldın.");

  // 11 — lang verilmese bile TR sezgisi MUTASYON ÖNCESİ metinden gelir → "İ" (I değil)
  eq("11 lang yok → dotted İ korunur",
    run("Spike kurulmadı, ikinci turda tekrar dene.", false, undefined),
    "İkinci turda tekrar dene.");

  // 12 — YANLIŞ ALARM KİLİDİ: meşru koç dili DOKUNULMAZ
  for (const s of [
    "Bir kişi defuse hattını tut.",
    "Spike Rush modunda oynadın.",
    "Düşman sesini duyduğunda köşeye yaslan.",
    "Yağmur yağdığında bile aynı açıyı tut.",
  ]) same(`12 NEG bayt-aynı: "${s.slice(0, 32)}…"`, run(s, false), s);

  // 13 — hasSpike undefined → blok HİÇ çalışmaz
  const c13 = "Spike kuruldu ve sen açıkta kaldın.";
  same("13 hasSpike undefined → bayt-aynı",
    realityCheck(c13, [] as never, {} as never, "death", "tr").text, c13);

  // 14-17 — EN aynası
  const en = (s: string, planted = false) =>
    realityCheck(s, [] as never, g(planted), "death", "en").text;
  eq("14 EN ungrounded 'after the spike was planted'",
    en("After the spike was planted you held one angle."),
    "After the plant you held one angle.");
  eq("15 EN ungrounded öksüz artikel kalmaz",
    en("Raze finished you off while two enemies remained and the spike was down."),
    "Raze finished you off while two enemies remained.");
  const c16a = "After the spike was planted you held one angle.";
  same("16 EN grounded bayt-aynı", en(c16a, true), c16a);
  for (const s of [
    "Hold the angle at B Main and plant the spike early.",
    "Once the spike is down, hold the far angle.",
    "With the spike down, you pushed alone.",
  ]) same(`17 EN NEG (öğüt formu) bayt-aynı: "${s.slice(0, 30)}…"`, en(s), s);

  // 18 — P13 sınır savunması: callout-düzeltici koç terimini callout'a ÇEVİRMEZ
  const c18a = "Plant sonrası uzak açıya çekil.";
  same("18a enforceSuppliedCallout 'Plant' bozmaz", enforceSuppliedCallout(c18a, "a plaza"), c18a);
  const c18b = "Post-plant'te çapraz açı tut.";
  same("18b enforceSuppliedCallout 'Post' bozmaz", enforceSuppliedCallout(c18b, "plat"), c18b);
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B2 · SAYAÇ (pencere birimi tek parça) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const run = (s: string, m: Mem[]) =>
    realityCheck(s, m as never, undefined, "death", "tr").text;

  // 19-24 — LEVEL-2: sayı YERİNDE düşer, isim+ek ASLA değişmez
  eq("19 'Son 9 round'un 9'unda' → 6'sında (canlı M1-R11)",
    run("Son 9 round'un 9'unda öldün; rakipler pozisyonunu okumuş.", mem(9, 6)),
    "Son 9 round'un 6'sında öldün; rakipler pozisyonunu okumuş.");
  eq("20 'hepsinde' → ölçülen sayı (canlı M1-R25)",
    run("Son 21 round'un hepsinde öldün, bu maç boyunca aynı hata.", mem(21, 3)),
    "Son 21 round'un 3'ünde öldün, bu maç boyunca aynı hata.");
  eq("21 bulunma hâli → 'N kez' idiomu (canlı M1-R9)",
    run("Bu maçta son 7 round'da her round öldün; aynı açıyı tutuyorsun.", mem(7, 5)),
    "Bu maçta son 7 round'da 5 kez öldün; aynı açıyı tutuyorsun.");
  eq("22 'N kez' yerinde düşer",
    run("Bu round A site'ta öldün; son 6 round'da 5 kez aynı yerden vuruldun.", mem(6, 3, "A site")),
    "Bu round A site'ta öldün; son 6 round'da 3 kez aynı yerden vuruldun.");
  eq("23 eksiz 'roundda' biçimi",
    run("Son 4 roundda 3 kez öldün, aynı açı hatası.", mem(4, 2)),
    "Son 4 roundda 2 kez öldün, aynı açı hatası.");
  eq("24 'tümünde' (K12)",
    run("Son 20 round'un tümünde öldün, açını hiç değiştirmedin.", mem(20, 5)),
    "Son 20 round'un 5'inde öldün, açını hiç değiştirmedin.");

  // 25-27 — LEVEL-3 (kanıt SIFIR): birim EKİYLE BİRLİKTE kalkar, cümle ayakta kalır
  eq("25 level-3 birim tamamen kalkar (canlı skye-c)",
    run("Son 4 round'un 3'ünde öldün, sen yine aynı açıyı tuttun.", mem(4, 0)),
    "Öldün, sen yine aynı açıyı tuttun.");
  eq("26 level-3 parantezli liste korunur (canlı r4-a)",
    run("Son 3 round'da her round öldün (R1 A Hall, R2 B Generator, R3 B Link) — açıyı değiştir.", mem(3, 0)),
    "Öldün (R1 A Hall, R2 B Generator, R3 B Link) — açıyı değiştir.");
  eq("27 level-3 ayrılma hâli",
    run("Son 9 round'undan 6'sında A Site'ta öldün.", mem(9, 0)),
    "A Site'ta öldün.");

  // 28-31 — GUARD'IN KENDİ REGRESYONLARI (doğrulayıcıların bulduğu 3 kusur)
  const c28 = "Son 6 round'un 4'ünde takımın A Site'ta spike'ı kurdu.";
  same("28 OLGU AŞILAMA YASAĞI — ölüm yüklemi yok, dokunma", run(c28, mem(6, 3, "A Site")), c28);
  const c29 = "Son 8 round'un 5'inde A Site'ta round'u kazandın.";
  same("29 OLGU AŞILAMA YASAĞI — 'kazandın'", run(c29, mem(8, 2, "A Site")), c29);
  const c30 = "Son 9 round'un 2'sinde A Site'ta öldün, sürekli aynı yerde bekliyorsun.";
  same("30 ŞİŞİRME YASAĞI — iddia(2) < gerçek(5), yükseltme YOK", run(c30, mem(9, 5, "A Site")), c30);
  const c31 = "Son 6 round'un 4'ünü A Site'ta kaybettin.";
  same("31 ÇİFT SAYI YOK — belirtme hâli ('4'ünü') nicelik DEĞİL", run(c31, mem(6, 3, "A Site")), c31);

  // 32-34 — edat / çoklu birim / yarım ek
  {
    const out = run("Son 5 round içinde 3 kez A Site'ta öldün.", mem(9, 6, "A Site"));
    t("32 edat ('içinde') DOKUNULMAZ, birim parçalanmaz",
      out.includes("Son 5 round içinde") && !/kez['’]/.test(out), `→ "${out}"`);
  }
  {
    const out = run("Son 20 round'da sürekli öldün ve son 3 round'da B site'te tekrar eden ölümler var.", mem(20, 5, "B site"));
    // Ölçülen sayı (5) İKİNCİ birime kopyalanmamalı; hiçbir birim yetim ek bırakmamalı.
    t("33 ÇOKLU BİRİM — 2. birime sayı KOPYALANMAZ (K9)",
      !/son 3 round['’]?d[ae]s*5s*kez/i.test(out)
      && !/Sons*['’]/.test(out)
      && !/kez['’]/.test(out), `→ "${out}"`);
  }
  const c34 = "Son 9 round'undan sonra toparlaman lazım, A site'ta tek kaldın.";
  same("34 YARIM EK KORUMASI — 'round'undan sonra' nicelik değil", run(c34, mem(9, 6, "A site")), c34);

  // 35 — hiç sayı iddiası olmayan metin
  const c35 = "Bu round Mid'de öldün, önceki round'da da aynısı oldu.";
  same("35 sayısız metin bayt-aynı", run(c35, mem(5, 3, "Mid")), c35);

  // 36 — İDEMPOTANS: süzülmüş metin ikinci turda DEĞİŞMEMELİ
  for (const [label, src, m] of [
    ["19", "Son 9 round'un 9'unda öldün; rakipler pozisyonunu okumuş.", mem(9, 6)],
    ["20", "Son 21 round'un hepsinde öldün, bu maç boyunca aynı hata.", mem(21, 3)],
    ["25", "Son 4 round'un 3'ünde öldün, sen yine aynı açıyı tuttun.", mem(4, 0)],
    ["27", "Son 9 round'undan 6'sında A Site'ta öldün.", mem(9, 0)],
  ] as [string, string, Mem[]][]) {
    const once = run(src, m);
    const twice = run(once, m);
    t(`36 idempotans (vaka ${label})`, once === twice, `1.tur "${once}" ≠ 2.tur "${twice}"`);
  }

  // 37 — ek tablosu (ünlü uyumu)
  const TABLE: [number, string][] = [
    [1, "1'inde"], [2, "2'sinde"], [3, "3'ünde"], [4, "4'ünde"], [5, "5'inde"],
    [6, "6'sında"], [7, "7'sinde"], [8, "8'inde"], [9, "9'unda"], [10, "10'unda"],
    [13, "13'ünde"], [19, "19'unda"], [20, "20'sinde"], [21, "21'inde"], [30, "30'unda"],
    [40, "40'ında"], [60, "60'ında"], [70, "70'inde"], [90, "90'ında"], [100, "100'ünde"],
    [1000, "1000'inde"], [1000000, "1000000'unda"],
  ];
  const bad = TABLE.filter(([k, v]) => trOrdinalLocative(k) !== v);
  t("37 trOrdinalLocative 22 değer", bad.length === 0,
    bad.map(([k, v]) => `${k}→${trOrdinalLocative(k)} (beklenen ${v})`).join(", "));

  // 38 — EN yolu BAYT-AYNI (TR yamalarının EN'e sızmadığının kilidi)
  const enRun = (s: string, m: Mem[]) => realityCheck(s, m as never, undefined, "death", "en").text;
  for (const s of [
    "You died in 6 of the last 9 rounds; they read your position.",
    "Over the last 12 rounds you died 12 times at the same spot.",
    "In the last 4 rounds you went down 3 times at A Site.",
  ]) {
    for (const m of [mem(9, 6, "A Site"), mem(12, 3, "A Site"), mem(4, 0, "A Site"), mem(20, 5, "A Site"), mem(3, 2, "A Site")]) {
      const out = enRun(s, m);
      // EN yolunda eski davranış korunur; TR birimi HİÇ tetiklenmemeli
      t(`38 EN TR-birimi tetiklenmedi: "${s.slice(0, 26)}…"`,
        !/kez|round'un|'ünde|'sında/.test(out), `→ "${out}"`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B2b · PROMPT EKİ (lib/history-block.ts) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const hist = (total: number, deaths: number) =>
    Array.from({ length: total }, (_, i) => ({
      roundIndex: i + 1,
      died: i >= total - deaths,
      position: i >= total - deaths ? "A Site" : undefined,
    }));
  const CASES: [number, number, string][] = [
    [19, 19, "19'unda"], [9, 9, "9'unda"], [4, 3, "3'ünde"],
    [2, 2, "2'sinde"], [1, 1, "1'inde"], [10, 10, "10'unda"],
  ];
  for (const [total, deaths, want] of CASES) {
    const block = buildHistoryBlock(hist(total, deaths) as never, "tr");
    const line = block.split("\n").find((l) => l.startsWith("Pattern: Son")) || "";
    t(`39 prompt eki ${total}/${deaths} → ${want}`,
      line.includes(`round'un ${want} ölüm`), `→ "${line}"`);
  }
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B3 · KONUM / KATİL / ROSTER ════");
// ═══════════════════════════════════════════════════════════════════
{
  const noLoc = { hasDeathLocation: false } as never;
  const run = (s: string, m: Mem[] = []) => realityCheck(s, m as never, noLoc, "death", "tr").text;

  // 40-42 — UYDURMA CALLOUT nötrlenir (silinmez!), cümle yapısı korunur
  eq("40 'A Heaven'da …tuttun' → 'O açıda' (canlı phoenix 9/11)",
    run("A Heaven'da aynı köşeyi tuttun, Jett seni oradan öldürdü."),
    "O açıda aynı köşeyi tuttun, Jett seni oradan öldürdü.");
  eq("41 '-daki' eki korunur + 'açı' tekrarı önlenir",
    run("Jett seni A Heaven'daki aynı açıdan bekliyordu."),
    "Jett seni o noktadaki aynı açıdan bekliyordu.");
  eq("42 edat-benzeri ek ('civarında')",
    run("A Elbow civarında siper yanında dururken seni o açıdan vurdu."),
    "O noktada siper yanında dururken seni o açıdan vurdu.");

  // 43 — MEŞRU MÜTTEFİK/UTIL CÜMLELERİ (doğrulayıcının bulduğu regresyon: tek fiil
  //      listesi bunları yok ediyordu) → 3. şahıs fiilde KURBAN ÇAPASI şart
  for (const s of [
    "Takım arkadaşın B Main'de bekliyordu, sen tek girdin.",
    "Sage duvarı A Main'de duruyordu ve geçemedin.",
    "Rakip kadro A Main'de toplandı ve alanı temizledi.",
  ]) same(`43 müttefik/util bayt-aynı: "${s.slice(0, 30)}…"`, run(s), s);

  // 44 — HAVUZ ELEMESİ: <4 harf çıplak adlar + oyun terimleri dışarıda
  for (const s of ["Plantta kaldın.", "Gende bekledin.", "CT'de bekledin."])
    same(`44 jargon bayt-aynı: "${s}"`, run(s), s);

  // 45 — BİLEŞİK CALLOUT: asla YARIM işlenmez (öksüz "B"/"Mid" kalmaz)
  for (const s of ["B Stairs'ta erken peek atıp öldürüldün.", "Mid Boiler'da beklerken vuruldun."]) {
    const out = run(s);
    t(`45 bileşik yarım işlenmedi: "${s.slice(0, 28)}…"`,
      !/(^|[\s.])([Bb]|[Mm]id)\s+(o açıda|o noktada)/.test(out) && !/\s{2,}/.test(out), `→ "${out}"`);
  }

  // 46 — ÖLÇÜLEN konum MUAF (düz toLowerCase; "MID" ≠ Türkçe yerel "mıd")
  // B02 inceleme: geçmiş konum yalnız GEÇMİŞE ÇAPALI yan-cümlede muaf → vaka
  // R-etiketiyle kurulur (case-fold kilidi aynen sürer); çapasız hâli artık düşer.
  const c46 = "R3'te MID'de aynı köşeyi tuttun.";
  same("46 ölçülen konum (roundHistory, R-çapalı) DOKUNULMAZ", run(c46, mem(3, 1, "Mid")), c46);
  eq("46b çapasız geçmiş konum bu round'a yapıştırılamaz",
    run("MID'de aynı köşeyi tuttun.", mem(3, 1, "Mid")), "O açıda aynı köşeyi tuttun.");

  // 47 — ÖĞÜT/EMİR KİPİ dokunulmaz (fiil listelerinde emir yok)
  for (const s of [
    "Bu round A Heaven'ı tek başına tutma, yanına birini koy.",
    "A Heaven'da beklerken önce kuşu gönder.",
    "Mid'de geniş açı verme.",
  ]) same(`47 öğüt bayt-aynı: "${s.slice(0, 30)}…"`, run(s), s);

  // 48 — bayrak false DEĞİLSE katman HİÇ çalışmaz
  const c48 = "A Heaven'da aynı köşeyi tuttun.";
  same("48a hasDeathLocation:true → bayt-aynı",
    realityCheck(c48, [] as never, { hasDeathLocation: true } as never, "death", "tr").text, c48);
  same("48b hasDeathLocation undefined → bayt-aynı",
    realityCheck(c48, [] as never, {} as never, "death", "tr").text, c48);

  // 49-53 — KATİL İKAMESİ DİKİŞİ (B3 "bozuk özne" sınıfı, canlı skye-i/skye-j)
  const noKiller = { hasKiller: false } as never;
  const rk = (s: string, lang: "tr" | "en" = "tr") =>
    realityCheck(s, [] as never, noKiller, "death", lang).text;

  {
    const out = rk("Rakip Jett senin tuttuğun açıyı hızla kapıp seni oradan öldürdü.");
    t("49 'Rakip bir düşman' fazlalığı YOK + cümle başı büyük",
      out.startsWith("Bir düşman") && !/Rakip bir düşman/.test(out), `→ "${out}"`);
  }
  {
    // BEKLENTİ DÜZELTİLDİ (TR-KALAN-21, 2026-09-23): eski beklenti "bir düşmanın hızlı
    // peek'ine" bozulmasını DOĞRU diye pinliyordu — bu bir öldürme iddiası değil,
    // roster'a göre GENEL counter tavsiyesi (kill fiili / kurban çapası yok).
    const c50 = "Yoru yerine — Jett/Reyna'nin hızlı peek'ine trade verebilecek düzen kur.";
    same("50 roster tavsiyesi (öldürme iddiası değil) bayt-aynı", rk(c50), c50);
    // Apostrof-dikişi hâlâ çalışır: kurban çapalı disjunction iner, ek uyumlanır.
    eq("50b apostroflu ek artığı YOK ('bir düşman'nin')",
      rk("Jett/Reyna'nin peek'i seni yakaladı."), "Bir düşmanın peek'i seni yakaladı.");
  }
  {
    const out = rk("Jett'ıyla karşılaşınca kaybettin, Jett seni vurdu.");
    t("51 vasıta hâli apostrofsuz ('bir düşmanla')",
      !/bir düşman['’]/.test(out), `→ "${out}"`);
  }
  const c52 = "Jett seni B Main'de vurdu.";
  same("52 hasKiller:true → bayt-aynı",
    realityCheck(c52, [] as never, { hasKiller: true, killerAgent: "Jett" } as never, "death", "tr").text, c52);
  {
    const out = rk("The Cypher killed you at B Main.", "en");
    t("53 EN cümle başı 'An enemy'", out.startsWith("An enemy"), `→ "${out}"`);
  }

  // 54-57 — ROSTER EK TABLOSU (softi'nin yasakladığı "kadro'<ek>" biçimi)
  // 54 BEKLENTİSİ DÜZELTİLDİ (TR-KALAN-23, 2026-09-23): eski beklenti "kadrosunu
  // … kontrol ediyor" YANLIŞI doğru sayıyordu — özne konumunda belirtisiz tamlama
  // iyeliktir ("Jett ve Reyna kadrosu … ediyor"), belirtme hâli değil.
  eq("54 özne konumu 'roster'ı' → kadrosu (canlı skye-i)",
    cleanCoachText("Jett ve Reyna roster'ı hızla kontrol ediyor.", "tr"),
    "Jett ve Reyna kadrosu hızla kontrol ediyor.");
  // 54b — özne konumu ölçütü: (i) ajan/rakip öbeği + (ii) yan-cümle sonu 3. şahıs.
  for (const [src, want] of [
    ["Jett ve Reyna roster'ı hızla site içi açıları kontrol edip ani peek'lerle seni yakalayabilir.",
      "Jett ve Reyna kadrosu hızla site içi açıları kontrol edip ani peek'lerle seni yakalayabilir."],
    ["Chamber roster'ı uzun menzile izin vermiyor.", "Chamber kadrosu uzun menzile izin vermiyor."],
    // Emir kipi / 2. şahıs → belirtme hâli ("kadrosunu") KORUNUR.
    ["Roster'ı kontrol et.", "Kadrosunu kontrol et."],
    ["Rakip roster'ı iyi oku ve bekle.", "Rakip kadrosunu iyi oku ve bekle."],
    ["Rakip roster'ı okudun ama yine erken çıktın.", "Rakip kadrosunu okudun ama yine erken çıktın."],
    // 3 harfli emirler "gir/ver/kur" geniş-zaman ekiyle biter — kural ≥5 harf ister.
    ["Rakip roster'ı görüp gir.", "Rakip kadrosunu görüp gir."],
  ] as [string, string][]) {
    eq(`54b "${src.slice(0, 34)}…"`, cleanCoachText(src, "tr"), want);
  }
  const R55: [string, string][] = [
    ["roster'ından", "kadrosundan"], ["roster'ını", "kadrosunu"], ["roster'ına", "kadrosuna"],
    ["roster'ıyla", "kadrosuyla"], ["roster'a", "kadrosuna"], ["rosterı", "kadrosunu"],
  ];
  for (const [src, want] of R55) {
    const out = cleanCoachText(`Rakip ${src} bak.`, "tr");
    t(`55 "${src}" → ${want}`, out.includes(want) && !/kadro['’]/.test(out), `→ "${out}"`);
  }
  // 55b — ÇIPLAK -ı EKİ İKİ ANLAMLI: varlık yükleminden önce İYELİK okunur.
  //        Kanıt: replay-tr / cycletr-posters3 phoenix-h — eski çıktı "kadroı var",
  //        genel kural tek başına "kadrosunu var" (ikisi de bozuk) veriyordu.
  for (const [src, want] of [
    ["tek bir düşman rosterı var.", "kadrosu var."],
    ["Rakip rosterı yok.", "kadrosu yok."],
  ] as [string, string][]) {
    const out = cleanCoachText(src, "tr");
    t(`55b iyelik okuması: "${src.slice(0, 26)}…"`,
      out.includes(want) && !/kadrosunu (var|yok)/.test(out) && !/kadro['’]/.test(out), `→ "${out}"`);
  }
  for (const [src, want] of [["roster'inde", "kadrosunda"], ["rosterda", "kadrosunda"]] as [string, string][]) {
    const out = cleanCoachText(`Rakip ${src} Cypher var.`, "tr");
    t(`56 "${src}" → ${want}`, out.includes(want) && !/kadro['’]/.test(out), `→ "${out}"`);
  }
  {
    const out = cleanCoachText("rakip roster agresif.", "tr");
    t("56c çıplak 'roster' → kadro", out.includes("kadro") && !/kadro['’]/.test(out), `→ "${out}"`);
  }
  const c57 = "Their roster is aggressive.";
  same("57 EN 'roster' bayt-aynı", cleanCoachText(c57, "en"), c57);
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B01 · AJAN-ADI KİLİDİ + KATİL-GUARD ZİNCİRİ (TR-KALAN-09) ════");
// ═══════════════════════════════════════════════════════════════════
{
  // HEAD: "Reyna seni vurdu" nötrleniyor ama bozuk "Rejyna seni vurdu" katil-guard'ı
  // atlatıp DEĞİŞMEDEN kullanıcıya gidiyordu (katil bilinmezken uydurma iddia).
  // Kilit realityCheck'ten ÖNCE çalışınca guard kanonik adı görür (bağlama B03'te).
  const ean = (CT as unknown as Record<string, unknown>).enforceAgentNames as
    ((s: string, a: string[]) => string) | undefined;
  const fixed = ean ? ean("Rejyna seni vurdu, açıyı tut.", ["Jett", "Reyna"]) : "Rejyna seni vurdu, açıyı tut.";
  const out = realityCheck(fixed, [] as never, { hasKiller: false } as never, "death", "tr").text;
  eq("58 kilit + guard: uydurma katil nötrlenir", out, "Bir düşman seni vurdu, açıyı tut.");
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B01 · SAYI + BULUNMA EKİ (TR-KALAN-27) ════");
// ═══════════════════════════════════════════════════════════════════
{
  // HEAD: trLocative("3") → "3'de" (doğrusu 3'te), "6" → "6'de", "40" → "40'de".
  const want: [string, string][] = [
    ["1", "1'de"], ["2", "2'de"], ["3", "3'te"], ["4", "4'te"], ["5", "5'te"], ["6", "6'da"],
    ["7", "7'de"], ["8", "8'de"], ["9", "9'da"], ["10", "10'da"], ["19", "19'da"], ["20", "20'de"],
    ["30", "30'da"], ["40", "40'ta"], ["60", "60'ta"], ["70", "70'te"], ["90", "90'da"], ["100", "100'de"],
    ["R3", "R3'te"], ["R40", "R40'ta"],
  ];
  for (const [n, w] of want) eq(`59 trLocative("${n}")`, CT.trLocative(n), w);
  // Callout / harita yolu BAYT-AYNI (bugünkü çağıranlar: report/route.ts, app/LandingClient.tsx).
  for (const [w, exp] of [["A Main", "A Main'de"], ["B Link", "B Link'te"], ["Bind", "Bind'da"],
    ["Ascent", "Ascent'te"], ["Mid", "Mid'de"]] as [string, string][]) {
    eq(`60 callout "${w}" bayt-aynı`, CT.trLocative(w), exp);
  }
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B02 · DİKİŞ + DEFUSE ARTIĞI (TR-KALAN-11/12) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const sp = { hasSpike: false, spikeObservedPlanted: false } as never;
  const run = (s: string, lang: "tr" | "en" | undefined = "tr") => realityCheck(s, [] as never, sp, "death", lang).text;
  // HEAD: "Açıyı geç aldın. sen açıkta kaldın." (metin-içi küçük harf)
  eq("61 silme ortada yeni cümle başı doğurunca büyür",
    run("Açıyı geç aldın. Spike kuruldu ve sen açıkta kaldın."), "Açıyı geç aldın. Sen açıkta kaldın.");
  // HEAD: "Bu round erken çıktın.yine de siteye girdin." (virgül dikişi boşluğu yutuyordu)
  eq("62 öksüz virgül sökülürken nokta sonrası boşluk korunur",
    run("Bu round erken çıktın. Spike kurulmadı, yine de siteye girdin."), "Bu round erken çıktın. Yine de siteye girdin.");
  {
    // K5 yanlış-pozitifi: ÖNCEDEN VAR OLAN "vb. açıyı" büyütülmez.
    const out = run("Spike kuruldu. vb. açıyı erken tut.");
    t("63 önceden var olan küçük harf ('vb. açıyı') büyümez", /vb\. açıyı/i.test(out) && !/Açıyı/.test(out), `→ "${out}"`);
  }
  eq("64 vaka 11 korunur (lang yok → dotted İ)",
    run("Spike kurulmadı, ikinci turda tekrar dene.", undefined), "İkinci turda tekrar dene.");
  // TR-KALAN-12 — HEAD: "Çalışırken vuruldun." (öksüz ulaç)
  eq("65 defuse amaç-zarfı bütün düşer", run("Spike defuse etmeye çalışırken vuruldun."), "Vuruldun.");
  eq("66 defuse zarfı metin ortasında (11 ile birlikte)",
    run("Açıyı geç aldın. Spike defuse etmeye çalışırken vuruldun."), "Açıyı geç aldın. Vuruldun.");
  // HEAD: "Çalışan düşmanı molly ile durdur." (çıplak mastar öğüt dilini siliyordu)
  for (const s of ["Bir kişi defuse hattını tut.", "Defuse etmeye çalışan düşmanı molly ile durdur."])
    same(`67 NEG bayt-aynı: "${s.slice(0, 34)}…"`, run(s), s);
  // İddia biçimleri hâlâ düşer (eski desenin kalan fiilleri).
  eq("68 'defuse ediyordun' hâlâ düşer", run("Spike defuse ediyordun ve vuruldun."), "Vuruldun.");
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B02 · PENCERE + SAYIM İDDİASI (TR-KALAN-14/15) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const run = (s: string, m: Mem[], lang: "tr" | "en" = "tr", fg?: unknown, kind: "death" | "suggestion" = "death", map?: string) =>
    realityCheck(s, m as never, fg as never, kind, lang, map).text;
  const all = (total: number, positioned: number, pos = "B Site"): Mem[] =>
    Array.from({ length: total }, (_, i) => ({
      round_index: i + 1, died: true,
      death_position: i < positioned ? pos : null,
      position_confidence: i < positioned ? "high" : undefined,
    }));

  // 69 — salt-pencere iddiası artık rewriter'a ulaşır; pencere YERİNDE kısalır.
  //      HEAD: mem(2,0) → "Agresif oynadın, …" (pencere count sanılıp birim silindi)
  const c69 = "Son 10 round'da agresif oynadın, bu round da erken peek attın.";
  eq("69 rh=2 → 'Son 2 round'da' (0 ölüm)", run(c69, mem(2, 0)), "Son 2 round'da agresif oynadın, bu round da erken peek attın.");
  eq("69b rh=2 → 'Son 2 round'da' (1 ölüm)", run(c69, mem(2, 1)), "Son 2 round'da agresif oynadın, bu round da erken peek attın.");
  same("70 rh=12 → pencere geçerli, bayt-aynı", run(c69, mem(12, 3)), c69);
  const c71 = "Son 5 maçta bu haritada hep geç açılıyorsun.";
  same("71 'maç' birimli pencere BİLEREK dokunulmaz", run(c71, mem(2, 1)), c71);
  // 72 — EN "recently" yolu. HEAD: "Last you pushed early." (count deseni '8 rounds'u siliyordu)
  eq("72 EN 'Last 8 rounds' + rh=2 → 'Recently'", run("Last 8 rounds you pushed early.", mem(2, 1), "en"), "Recently you pushed early.");
  same("72b EN pencere geçerli (rh=12) bayt-aynı", run("Last 8 rounds you pushed early.", mem(12, 1), "en"), "Last 8 rounds you pushed early.");
  eq("72c EN 'Over the last 12 rounds' öneki birlikte düşer",
    run("Over the last 12 rounds you pushed early.", mem(4, 1), "en"), "Recently you pushed early.");

  // 73 — r4-a (canlı): DOĞRU "her round" iddiası "1 kez" UYDURMASINA çevrilmez.
  //      HEAD: "Son 3 round'da 1 kez öldün (R1 A Hall, R2 B Generator, R3 ) — …"
  const rhR4: Mem[] = [
    { round_index: 1, died: true, death_position: "a hall", position_confidence: "high" },
    { round_index: 2, died: true, death_position: "b generator", position_confidence: "high" },
    { round_index: 3, died: true, death_position: "b link", position_confidence: "high" },
  ];
  const r4a = "Son 3 round'da her round öldün (R1 A Hall, R2 B Generator, R3 B Link) — bu round da post-plant'te A Link'te öldü; rakip farklı açılarda seni yakalıyor.";
  {
    const out = run(r4a, rhR4, "tr", { hasSpike: false, spikeObservedPlanted: true, hasDeathLocation: true, deathLocation: "a link" }, "suggestion", "fracture");
    t("73 r4-a 'her round öldün' korunur, 'N kez' YOK", out.includes("Son 3 round'da her round öldün") && !/\d+\s*kez/.test(out), `→ "${out}"`);
  }
  t("74 extractClaims(\"Son 9 round'un 2'sinde\").claimedCount === 2",
    extractClaims("Son 9 round'un 2'sinde").claimedCount === 2, JSON.stringify(extractClaims("Son 9 round'un 2'sinde")));
  // 75 — GENEL ölüm sayısı: 4 round'un 4'ünde ölüm (2'si konumlu) → "hepsinde" DOĞRU.
  //      HEAD: konumlu ölümleri (2) sayıyordu → "Son 4 round'un 2'sinde öldün".
  const c75 = "Son 4 round'un hepsinde öldün, açıyı değiştir.";
  same("75 genel ölüm sayısı (konumsuz ölüm de ölümdür)", run(c75, all(4, 2)), c75);
  // 76 — SPEC SAPMASI KİLİDİ: iddiaya BAĞLI konum. rh'de B Main ölümü YOK; öğüt
  //      konumları (Market/CT/Heaven) sayımı "genel"e çevirip uydurma yazdırmamalı.
  {
    const rh76: Mem[] = [
      { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
      { round_index: 2, died: true, death_position: null },
      { round_index: 3, died: true, death_position: "a tree", position_confidence: "high" },
      { round_index: 4, died: true, death_position: null },
    ];
    const out = run("Bu round B Main'de 3 kez benzer ölüm var — sonraki round B Main'i tek başına bırak, takımınla Market veya CT'den crossfire kur ve sen farklı yükseklikten (zıplama/Heaven) tut.", rh76, "tr", undefined, "suggestion");
    t("76 konuma-bağlı sayım genel sayıyla 'doğrulanmaz' (B Main'de N kez YAZILMAZ)", !/B Main'de \d+ kez/.test(out), `→ "${out}"`);
  }
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B02 · ÖLÇÜLMÜŞ KONUM KORUMASI (TR-KALAN-16) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const rhR4: Mem[] = [
    { round_index: 1, died: true, death_position: "a hall", position_confidence: "high" },
    { round_index: 2, died: true, death_position: "b generator", position_confidence: "high" },
    { round_index: 3, died: true, death_position: "b link", position_confidence: "high" },
  ];
  // 77 — r4-a (canlı): stripForeignCallouts ölçülmüş GEÇMİŞ konumu siliyordu.
  //      HEAD: "…(R1 A Hall, R2 B Generator, R3 ) — …"
  {
    const out = realityCheck("Son 3 round'da her round öldün (R1 A Hall, R2 B Generator, R3 B Link) — bu round da post-plant'te A Link'te öldü; rakip farklı açılarda seni yakalıyor.",
      rhR4 as never, { hasSpike: false, spikeObservedPlanted: true, hasDeathLocation: true, deathLocation: "a link" } as never, "suggestion", "tr", "fracture").text;
    t("77 r4-a '(R1 A Hall, R2 B Generator, R3 B Link)' korunur", out.includes("(R1 A Hall, R2 B Generator, R3 B Link)"), `→ "${out}"`);
  }
  // 78 — M1-R4 (gerçek maç korpusu, 20 cycle final'i): HEAD "yanında durdun…"
  // B02 İNCELEME (ters çevrildi): A Tree R3'ün konumu; R4 ölçülmedi ve cümle çapasız
  // → bu round'a yapıştırılmış geçmiş konum = uydurma (vision-prompt RED BAYRAĞI).
  // Doğru çıktı öksüz "yanında durdun" DEĞİL, nötr "O açıda durdun".
  {
    const rhM4: Mem[] = [
      { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
      { round_index: 2, died: true, death_position: null },
      { round_index: 3, died: true, death_position: "a tree", position_confidence: "high" },
    ];
    const src = "A Tree yanında durdun ve aynı round içinde savunmada sabit kaldın — açıkta değildin ama o sipere yakın duruşunu rakip açıdan okuyup seni oradan vurdu.";
    const out = realityCheck(src, rhM4 as never, { hasDeathLocation: false, hasKiller: true } as never, "death", "tr", "ascent").text;
    t("78 M1-R4 çapasız 'A Tree yanında durdun' → 'O açıda durdun…' (öksüz ek yok)",
      out.startsWith("O açıda durdun ve aynı round içinde") && !/A Tree/.test(out), `→ "${out}"`);
  }
  const noLoc = { hasDeathLocation: false } as never;
  const rhGen: Mem[] = [{ round_index: 1, died: true, death_position: "b generator", position_confidence: "high" }];
  // 79 — HEAD: "R1'de B öldün." (döngü rh'ye bakmıyordu + öksüz "B")
  same("79 rh 'b generator' → bayt-aynı",
    realityCheck("R1'de B Generator'da öldün.", rhGen as never, noLoc, "death", "tr").text, "R1'de B Generator'da öldün.");
  // 80 — ölçülmemişse konum düşer ama SİTE HARFİ de gider (öksüz "B" yok). HEAD: "R1'de B öldün."
  eq("80 rh boş → \"R1'de öldün.\" (öksüz B yok)",
    realityCheck("R1'de B Generator'da öldün.", [] as never, noLoc, "death", "tr").text, "R1'de öldün.");
  // 81 — EN aynası aynı ilke: ölçülmüş konum muaf, ölçülmemiş düşer.
  const rhMain: Mem[] = [{ round_index: 1, died: true, death_position: "b main", position_confidence: "high" }];
  // B02 İNCELEME (ters çevrildi): çapasız EN cümle geçmiş konumu bu round'a yapıştırır.
  eq("81 EN rh 'b main' ama çapasız → 'You died.'", realityCheck("You died at B Main.", rhMain as never, noLoc, "death", "en").text, "You died.");
  same("81c EN R-çapalı geçmiş konum bayt-aynı",
    realityCheck("You died at B Main in R1.", rhMain as never, noLoc, "death", "en").text, "You died at B Main in R1.");
  eq("81b EN rh boş → 'You died.'", realityCheck("You died at B Main.", [] as never, noLoc, "death", "en").text, "You died.");
  // 82 — RAPOR ROTASI (fg.deathLocation dizisi, roundHistory = []) bayt-aynı.
  const c82 = "A Main'de utility'siz kaldın, B Link'te de açıkta vuruldun.";
  same("82 rapor rotası (deathLocation dizisi) bayt-aynı",
    realityCheck(c82, [] as never, { hasDeathLocation: true, deathLocation: ["a main", "b link"] } as never, "generic", "tr", "Fracture").text, c82);
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B02 · TEKRAR-ANAHTARI + YAN-CÜMLE SİLME (TR-KALAN-25) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const STUB = "Bu round beklenen açıdan vuruldun.";
  const run = (s: string, m: Mem[], kind: "death" | "suggestion" = "death") =>
    realityCheck(s, m as never, undefined, kind, "tr").text;
  // 83 — phoenix-c (canlı raw): "aynı pozisyonda beklerken" BU round'un betimi.
  //      HEAD: tüm DA → kalıp satır.
  {
    const out = run("Açıyı sabit tutma; A Heaven'da aynı pozisyonda beklerken Jett seni oradan öldürdü — savunmada aynı açıda sabit durup bekleme, off-angle al ya da pozisyon değiştir.", mem(6, 0));
    t("83 phoenix-c kalıp satır DEĞİL, 'Jett seni oradan öldürdü' korunur", out !== STUB && out.includes("Jett seni oradan öldürdü"), `→ "${out}"`);
  }
  // 84 — skye-b (canlı raw): "tekrar" çapası ÖĞÜT yan-cümlesinde ("tekrar durma");
  //      "aynı pozisyonda beklerken" bu round'un betimi → hiçbir yan-cümle silinmez.
  //      HEAD: kalıp satır.
  const c84 = "Rakipler açıyı tuttu; Jett/Reyna seni aynı pozisyonda beklerken o açıdan vurdular — savunmada aynı siper yanında tekrar durma, farklı off-angle veya geriye çekilerek bekle.";
  same("84 skye-b kalıp satır DEĞİL (betim + öğüt korunur)", run(c84, mem(4, 0)), c84);
  // 84b — yan-cümle silme: çapası KENDİ yan-cümlesinde olan iddia düşer, öğüt kalır.
  eq("84b çapalı iddia yan-cümlesi düşer, öğüt kalır",
    run("R2'de ve R3'te sürekli aynı pozisyonda öldün; bir sonraki round off-angle al.", mem(4, 0)),
    "Bir sonraki round off-angle al.");
  // 84c — phoenix-c NR (canlı raw): çapa ilk yan-cümlede, belirsiz anahtar ÖĞÜTTE →
  //       öğüt SİLİNMEZ (öneri alanı geçmiş-zaman ölüm satırına inmez).
  const c84c = "R7'de yine aynı açıdan öldün — bir sonraki round A Heaven'da aynı pozisyonda bekleme, off-angle al veya Heaven ile Hell arasında yer değiştirip Jett'in dash'ine karşı trade hazırla.";
  same("84c phoenix-c NR öğüt yan-cümlesi korunur", run(c84c, mem(6, 1, null as never), "suggestion"), c84c);
  // 85 — M1-R16 (gerçek maç raw), kanıtsız hafıza: 'hep aynı' yan-cümlesi düşer. HEAD: kalıp satır.
  const m16 = "A Lobby'de sabit bir açı tuttun — savunmada Jett olarak burada öldün çünkü aynı yükseklik/konumla hep aynı açıyı veriyorsun; açıyı değiştir ve Heaven/Generator tarafına ani off-angle alarak bekle.";
  eq("85 M1-R16 kanıtsız → yan-cümle silme",
    run(m16, mem(13, 0)), "A Lobby'de sabit bir açı tuttun — açıyı değiştir ve Heaven/Generator tarafına ani off-angle alarak bekle.");
  // 85b — gerçek rh (13 round'un 13'ünde ölüm, 9'u konumlu): tekrar iddiası KANITLI → bayt-aynı.
  {
    const rh: Mem[] = Array.from({ length: 13 }, (_, i) => ({
      round_index: i + 1, died: true, death_position: i < 9 ? "B Site" : null, position_confidence: i < 9 ? "high" : undefined,
    }));
    same("85b M1-R16 gerçek hafıza → bayt-aynı", run(m16, rh), m16);
  }
  // 86 — öğütteki 'sürekli' (çapasız) tekrar iddiası DEĞİL. HEAD: kalıp satır.
  const c86 = "A Lobby'de öldün, Heaven'a crossfire koy ve pozisyonu sürekli değiştir.";
  same("86 öğüt 'sürekli değiştir' bayt-aynı", run(c86, mem(5, 0)), c86);
  // 87-88 — KİLİT: kanıtsız çapraz-round iddiası hâlâ nötrlenir.
  eq("87 'Son maçlarda sürekli aynı pozisyonda öldün.' kanıt yok → nötr", run("Son maçlarda sürekli aynı pozisyonda öldün.", mem(5, 0)), STUB);
  // B02 inceleme: başlık düzeltildi — realityCheck "" döner ama vision zinciri NR
  // alanında HAM metni korur (TR-KALAN-26 kararı (b): NR alanı boş kalamaz). Yani
  // bu test NR'de kanıtsız iddianın kullanıcıdan SÜZÜLDÜĞÜNÜ kanıtlamaz — bilinen sınır.
  eq("88 aynı metin suggestion → realityCheck '' (zincir NR'de ham metni korur — bilinen sınır)",
    run("Son maçlarda sürekli aynı pozisyonda öldün.", mem(5, 0), "suggestion"), "");
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B02 · JENERİK ROTA SİLMESİ DİKİŞİ (CANLI-TEST-06) ════");
// ═══════════════════════════════════════════════════════════════════
{
  // HEAD (probe-chain): "Rotasyon attın ve geç kaldın. A Main'de açıyı tut." →
  // "geç kaldın. A Main'de açıyı tut." (öksüz "ve" + küçük harfle başlayan metin).
  const nr = { hasRoute: false } as never;
  const run = (s: string) => realityCheck(s, [] as never, nr, "death", "tr").text;
  eq("89 'Rotasyon attın ve geç kaldın.' → 'Geç kaldın.'", run("Rotasyon attın ve geç kaldın."), "Geç kaldın.");
  eq("90 ardındaki cümle korunur", run("Rotasyon attın ve geç kaldın. A Main'de açıyı tut."), "Geç kaldın. A Main'de açıyı tut.");
  const c91 = "Bir sonraki round erken rotasyon at ve B'yi tut.";
  same("91 öğüt ('rotasyon at') bayt-aynı", run(c91), c91);
}

// ═══════════════════════════════════════════════════════════════════
console.log("\n════ B02 İNCELEME · GEÇMİŞ KONUM ÇAPASI (ölüm-yeri launch-blocker sınıfı) ════");
// ═══════════════════════════════════════════════════════════════════
{
  const noLoc = { hasDeathLocation: false } as never;
  const rhB: Mem[] = [
    { round_index: 1, died: false, death_position: null },
    { round_index: 2, died: true, death_position: "b main", position_confidence: "high" },
    { round_index: 3, died: false, death_position: null },
  ];
  const rc = (s: string, rh: Mem[], kind: "death" | "suggestion" = "death", lang: "tr" | "en" = "tr") =>
    realityCheck(s, rh as never, noLoc, kind, lang).text;
  // HEAD (8e99e56 sonrası): hepsi DEĞİŞMEDEN geçiyordu (L1).
  {
    const o = rc("B Main'de öldün, açıyı değiştir.", rhB);
    t("92 çapasız 'B Main'de öldün' (R2=b main, R3 ölçülmedi) → konum düşer", !/B Main/.test(o) && /öldün, açıyı değiştir\.$/.test(o), `→ "${o}"`);
  }
  eq("93 'Bu round yine B Main'de vuruldun' → konum düşer",
    rc("Bu round yine B Main'de vuruldun; açıyı değiştir.", rhB), "Bu round yine vuruldun; açıyı değiştir.");
  eq("94 EN 'You died at B Main again.' → 'You died again.'", rc("You died at B Main again.", rhB, "death", "en"), "You died again.");
  // Gerçek raw'lar (maliyetsiz replay): cycleab-base M1-R9 NR, cyclereal-r2b M1-R2 EA0.
  {
    const rh9: Mem[] = [{ round_index: 8, died: true, death_position: "mid bottom", position_confidence: "high" }];
    const o = rc("Savunmada control'ü dağıt: bu round mid bottom'da öldün ve önceki turlarda B'de öldün.", rh9, "suggestion");
    t("95 cycleab-base M1-R9 'bu round mid bottom'da öldün' → konum düşer", !/mid bottom/i.test(o) && /bu round öldün/.test(o), `→ "${o}"`);
    const rh2: Mem[] = [{ round_index: 1, died: true, death_position: "b site", position_confidence: "high" }];
    const o2 = rc("OCR kaydına göre bu round B site'de öldün.", rh2, "suggestion");
    t("96 cyclereal-r2b M1-R2 'bu round B site'de öldün' → konum düşer", !/B site/i.test(o2), `→ "${o2}"`);
  }
  // Güven/ölüm kapısı: LOW konum ve ölmeden kaydedilen konum R-çapası olsa bile muaf DEĞİL.
  {
    const low: Mem[] = [{ round_index: 2, died: true, death_position: "b main", position_confidence: "low" }];
    eq("97 LOW-confidence geçmiş konum muaf değil", rc("R2'de B Main'de öldün, açıyı değiştir.", low), "R2'de öldün, açıyı değiştir.");
    const alive: Mem[] = [{ round_index: 2, died: false, death_position: "b main", position_confidence: "high" }];
    eq("98 died=false round'un konumu muaf değil", rc("R2'de B Main'de öldün, açıyı değiştir.", alive), "R2'de öldün, açıyı değiştir.");
  }
  // Pozitif: geçmişe çapalı olgu KORUNUR (8e99e56'nın meşru hedefi).
  same("99 R-çapalı geçmiş konum bayt-aynı", rc("R2'de B Main'de öldün, bu round açıyı değiştir.", rhB), "R2'de B Main'de öldün, bu round açıyı değiştir.");
  eq("100 aynı cümlede geçmiş (R5) korunur, 'bu round' iddiası düşer",
    rc("R5'te B Main'de öldün ve bu round da B Main'de öldün.", [
      { round_index: 5, died: true, death_position: "b main", position_confidence: "high" },
    ]), "R5'te B Main'de öldün ve bu round da öldün.");
  {
    const rh8: Mem[] = [
      { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
      { round_index: 5, died: true, death_position: "b main", position_confidence: "high" },
      { round_index: 7, died: true, death_position: "b site", position_confidence: "high" },
    ];
    const c = "Bu roundlarda B Site/B Main'de iki kez öldün, açıyı değiştir.";
    same("101 çoğul/nicelik çapası ('roundlarda', 'iki kez') bayt-aynı (cyclereal-base M1-R9)", rc(c, rh8, "suggestion"), c);
    // FB06 · F57: 101 eskiden yalnız sayı YAZIYLA olduğu için (doğrulayıcı onu hiç görmüyordu)
    // geçiyordu. Rakamlı ikizi de bayt-aynı olmalı: liste (B Site/B Main) ölüm TOPLAMI 3 ≥ 2.
    // HEAD: "…B Site/B Main'de öldün…" (sayım liste yerine yalnız 'b main' ile doğrulanıp siliniyordu).
    const c101b = "Bu roundlarda B Site/B Main'de 2 kez öldün, açıyı değiştir.";
    same("101b rakamlı ikiz ('2 kez') bayt-aynı (liste toplamı 3)", rc(c101b, rh8, "suggestion"), c101b);
    // Sayım memory katmanında silinirken GEÇMİŞ ÇAPASI da korunur (r4c M1-R11).
    // FB05 · F14 BEKLENTİ DÜZELTİLDİ: eski beklenti /B Main\/B Lobby'de öldün/ yalnız öksüz
    // "B Main/" olmamasını ölçüyordu ve ÇAPASIZ "B Main/B Lobby'de öldün" çıktısını (geçmiş
    // iddianın bu round'un konum iddiasına dönüşmesi) doğru sayıyordu — o hâl, sayım
    // silinmeden ÖNCE yakalanan anchoredBefore sayesinde korunuyordu. Artık sayım silmesi
    // çapayı KENDİSİ yazar; konum bir listenin parçası olduğu için tek round (R10) yanlış
    // olurdu → "daha önce" (R5 b main + R10 b lobby, ikisi de ölçülmüş).
    // FB06 · F57 BEKLENTİ DÜZELTİLDİ: sayım DOĞRU (B Main 1 + B Lobby 1 = 2). Eski beklenti
    // doğru sayımın silinmesini kilitliyordu — claimPosition listeyi son öğeye ('lobby') indirip
    // 1 ölümle "doğruluyordu". Artık liste toplamıyla doğrulanır → bayt-aynı.
    const rh10: Mem[] = [
      { round_index: 5, died: true, death_position: "b main", position_confidence: "high" },
      { round_index: 10, died: true, death_position: "b lobby", position_confidence: "high" },
    ];
    const c102 = "Bu round B'yi tek başına tutma — B Main/B Lobby'de 2 kez öldün, savunurken Heaven'dan bak.";
    same("102 doğru liste sayımı ('B Main/B Lobby'de 2 kez', gerçek 2) bayt-aynı", rc(c102, rh10, "suggestion"), c102);
    // Liste sayımı yine de AŞILIRSA çapa yazımı (FB05 · F14) aynen çalışır: 3 > 2 → 2'ye iner.
    eq("102b liste sayımı aşılırsa ('3 kez', gerçek 2) → '2 kez'",
      rc("Bu round B'yi tek başına tutma — B Main/B Lobby'de 3 kez öldün, savunurken Heaven'dan bak.", rh10, "suggestion"),
      "Bu round B'yi tek başına tutma — B Main/B Lobby'de 2 kez öldün, savunurken Heaven'dan bak.");
  }
}

console.log("\n════ B02 İNCELEME · SAYIM İDDİASI ('N of the last M', 'son N kez') ════");
{
  const fgA = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const m6: Mem[] = Array.from({ length: 6 }, (_, i) => ({
    round_index: i + 1, died: i === 1, death_position: i === 1 ? "b main" : null, position_confidence: i === 1 ? "high" : undefined,
  }));
  const rc = (s: string, m: Mem[], lang: "tr" | "en" = "en", kind: "death" | "suggestion" = "death") =>
    realityCheck(s, m as never, fgA, kind, lang).text;
  // HEAD: pencere sayısı count sayılmadığı için N hiç doğrulanmıyordu (L1, bayt-aynı).
  eq("103 EN 'died in 5 of the last 6 rounds' (1 ölüm) → '1 of the last 6'",
    rc("You died in 5 of the last 6 rounds, change your angle.", m6), "You died in 1 of the last 6 rounds, change your angle.");
  eq("104 EN konumlu 'at B Main in 5 of the last 6' → '1 of the last 6'",
    rc("You died at B Main in 5 of the last 6 rounds.", m6), "You died at B Main in 1 of the last 6 rounds.");
  same("105 EN doğru sayım bayt-aynı", rc("You died in 1 of the last 6 rounds, change your angle.", m6), "You died in 1 of the last 6 rounds, change your angle.");
  // Olgu aşılaması yasağı: ölüm cümlesi değilse sayım doğrulanmaz (korpus cycle3/E5).
  same("106 EN ölüm-dışı 'went first in 3 of the last 4' bayt-aynı",
    rc("You went first in 3 of the last 4 rounds and got no trades.", m6, "en", "suggestion"), "You went first in 3 of the last 4 rounds and got no trades.");
  const m6b: Mem[] = m6.map((r) => (r.round_index === 2 ? { ...r, death_position: "a site" } : r));
  eq("107 EN kanıtsız (B Main'de 0 ölüm) → 'recently'",
    rc("You died at B Main in 5 of the last 6 rounds.", m6b), "You died at B Main recently.");
  // FB05 · F14 BEKLENTİ DÜZELTİLDİ: eski beklenti "B Main'de öldün, açıyı değiştir." idi —
  // sayımla birlikte GEÇMİŞ ÇAPASI da siliniyor, bu round'un konumu "a site" iken metin "bu
  // round B Main'de öldün" diyordu (yanlış ölüm yeri, launch-blocker sınıfı). Tek kanıt R2 →
  // çapa korunur.
  eq("108 TR 'Son 3 kez B Main'de öldün' (1 ölüm, R2) → 'R2'de B Main'de öldün'",
    rc("Son 3 kez B Main'de öldün, açıyı değiştir.", m6, "tr"), "R2'de B Main'de öldün, açıyı değiştir.");
  eq("108b EN aynası 'You died at B Main 3 times' (1 ölüm, R2) → '… at B Main in R2' (boşluk artığı yok)",
    rc("You died at B Main 3 times, change your angle.", m6), "You died at B Main in R2, change your angle.");
  const m6c: Mem[] = m6.map((r) => (r.round_index === 4 ? { ...r, died: true, death_position: "b main", position_confidence: "high" } : r));
  eq("109 TR 'Son 3 kez' (2 ölüm) → 'Son 2 kez'",
    rc("Son 3 kez B Main'de öldün, açıyı değiştir.", m6c, "tr"), "Son 2 kez B Main'de öldün, açıyı değiştir.");
  same("110 TR ölüm-dışı 'Son 3 kez ilk giren sen oldun' bayt-aynı",
    rc("Son 3 kez ilk giren sen oldun, bu round bekle.", m6, "tr", "suggestion"), "Son 3 kez ilk giren sen oldun, bu round bekle.");
}

console.log("\n════ B02 İNCELEME · 'sürekli … ölüyorsun' + level-2 ham anahtar silmesi ════");
{
  const fgA = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const rc = (s: string, m: Mem[], kind: "death" | "suggestion" = "death", lang: "tr" | "en" = "tr") =>
    realityCheck(s, m as never, fgA, kind, lang).text;
  const STUB = "Bu round beklenen açıdan vuruldun.";
  const m3: Mem[] = [
    { round_index: 1, died: false, death_position: null },
    { round_index: 2, died: true, death_position: "a site", position_confidence: "high" },
    { round_index: 3, died: false, death_position: null },
  ];
  // HEAD: rewriteLevel=3 raporlanıp metin DEĞİŞMİYORDU (çapa listesinde alışkanlık yüklemi yoktu).
  eq("111 'B Main'de sürekli ölüyorsun' (B Main'de 0 ölüm) → uydurma iddia düşer",
    rc("B Main'de sürekli ölüyorsun, oraya tek gitme.", m3), STUB);
  eq("112 'Sürekli aynı pozisyonda ölüyorsun' (1 ölüm) → uydurma iddia düşer",
    rc("Sürekli aynı pozisyonda ölüyorsun, açını değiştir.", m3), STUB);
  // HEAD: "R7'de yine aynı açıdan öldün — da ölüyorsun, off-angle al." (ham alt-dizge silmesi)
  const m7: Mem[] = Array.from({ length: 7 }, (_, i) => ({
    round_index: i + 1, died: i === 6, death_position: i === 6 ? "a site" : null, position_confidence: i === 6 ? "high" : undefined,
  }));
  eq("113 karışık cümlede bozuk 'da ölüyorsun' üretilmez",
    rc("R7'de yine aynı açıdan öldün — sürekli aynı pozisyonda ölüyorsun, off-angle al.", m7), "R7'de yine aynı açıdan öldün.");
  // Niteleyici anahtar YERİNDE düşer (korpus cycleab-luna-none2 M1-R17 EA0 — yan-cümle silinmez).
  eq("114 'tekrar eden' niteleyicisi yerinde düşer, olgu kalır",
    rc("Rakip B Main'deki tekrar eden açını okudu; bu maçta B Main'de daha önce de öldün.", [
      { round_index: 5, died: true, death_position: "b main", position_confidence: "high" },
      { round_index: 6, died: false, death_position: null },
    ], "suggestion"),
    "Rakip B Main'deki açını okudu; bu maçta B Main'de daha önce de öldün.");
  // HEAD (replay E22): "your pattern shows" → "your shows". İsim anahtar → yan-cümle düşer.
  {
    const o = rc("You held a predictable angle on defense and won the round but your pattern shows you died once in R1 from that same side—don't keep anchoring the exact same line every round; vary between Heaven and Gen.",
      m3, "death", "en");
    t("115 EN 'your pattern shows' → bozuk 'your shows' üretilmez", !/your shows/.test(o) && /vary between Heaven and Gen\.$/.test(o), `→ "${o}"`);
  }
  // Öğüt 'sürekli' (çapasız) hâlâ dokunulmaz.
  const c86b = "A Lobby'de öldün, Heaven'a crossfire koy ve pozisyonu sürekli değiştir.";
  same("116 öğüt 'sürekli değiştir' bayt-aynı (level-2 yolunda da)", rc(c86b, m3), c86b);
}

console.log("\n════ FB05 · F14 · ÖLÇÜLMÜŞ KONUMLA ÇELİŞEN ÖLÜM YERİ + SAYIM SİLMESİ ÇAPASI ════");
{
  const fgA = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const m6: Mem[] = Array.from({ length: 6 }, (_, i) => ({
    round_index: i + 1, died: i === 1, death_position: i === 1 ? "b main" : null, position_confidence: i === 1 ? "high" : undefined,
  }));
  const m6prev: Mem[] = m6.map((r) => (r.round_index === 6 ? { ...r, died: true, death_position: "b main", position_confidence: "high" } : r));
  const rc = (s: string, m: Mem[], fg: never, lang: "tr" | "en" = "tr", map?: string, kind: "death" | "suggestion" = "death") =>
    realityCheck(s, m as never, fg, kind, lang, map).text;
  // (1) HEAD: BAYT-AYNI ("bu round <başka callout>'da öldün" hiç denetlenmiyordu).
  eq("118 'Bu round B Main'de öldün' (ölçülen a site, Ascent) → ölçülen konum",
    rc("Bu round B Main'de öldün, açıyı değiştir.", m6, fgA, "tr", "Ascent"), "Bu round A Site'ta öldün, açıyı değiştir.");
  eq("118b EN 'You died at B Main this round' → 'at A Site'",
    rc("You died at B Main this round, change your angle.", m6, fgA, "en", "Ascent"), "You died at A Site this round, change your angle.");
  eq("118c EN 'Jett killed you at B Main.' → 'at A Site'",
    rc("Jett killed you at B Main.", m6, fgA, "en", "Ascent"), "Jett killed you at A Site.");
  // Ölçülen konum tabloda KANONİK değilse (A016: masaüstü ham TR gönderebilir) önce masaüstünün
  // TR→EN eşleme aynasıyla kanonikleşir (yakınsama Y03; eskiden "o noktada" nötrü): Haven
  // 'a kanalizasyon' = callouts.rs "kanalizasyon"→"sewer" → tablodaki "a sewer".
  eq("118d ölçülen 'a kanalizasyon' (Haven, TR ham) → masaüstü eşlemesiyle 'A Sewer'da'",
    rc("Bu round C Long'da öldün.", [] as never, { hasDeathLocation: true, deathLocation: "a kanalizasyon" } as never, "tr", "Haven"),
    "Bu round A Sewer'da öldün.");
  // Kapılar (dokunulmaz): harita bilinmiyor · kaba OCR ↔ ince model adı · geçmiş çapası ·
  // bu round'un kendi konumu · tabloda olmayan ad · liste · rapor yolu (konum dizisi) · öğüt.
  const keep: [string, string, Mem[], never, "tr" | "en", string | undefined][] = [
    ["118e harita yok", "Bu round B Main'de öldün, açıyı değiştir.", m6, fgA, "tr", undefined],
    ["118f ölçülen 'mid' ↔ 'Mid Bottom' (iç içe)", "Mid Bottom'da öldün.", m6, { hasDeathLocation: true, deathLocation: "mid" } as never, "tr", "Ascent"],
    ["118g R-çapalı geçmiş (R2 = b main, doğru olgu)", "R2'de B Main'de öldün, bu round A Site'ta açıyı değiştir.", m6, fgA, "tr", "Ascent"],
    // Yakınsama Y09: fikstür GERÇEK veriyle — önceki round (R6) b main'de ölmüş. BİLİNEN SINIR: sayısal
    // OLMAYAN çapa ("önceki round", "ilk round", "daha önce") doğrulanamaz (FactGround'da güncel round
    // numarası yok) → halka dokunmaz; bu test yanlış olguyu "doğru" saymaz, dokunulmadığını kilitler.
    ["118h 'önceki round' çapası (R6 = b main; bilinen sınır: doğrulanmaz)", "Önceki round B Main'de öldün, bu round A'yı tut.", m6prev, fgA, "tr", "Ascent"],
    ["118i ölçülen konumun kendisi", "A Site'ta öldün, açıyı değiştir.", m6, fgA, "tr", "Ascent"],
    ["118j OCR varyantı (tabloda yok)", "A Hail'de öldün.", m6, fgA, "tr", "Fracture"],
    // BİLİNEN SINIR (yakınsama Y09): halka liste parçasına ("B Main/B Lobby") dokunmaz — B Lobby hiç
    // ölçülmemiş olsa da. Liste üyesi doğrulaması bu halkanın kapsamı dışında; test "doğru çıktı"
    // değil "dokunulmadı" kilididir.
    ["118k liste (bilinen sınır: liste üyeleri doğrulanmaz)", "B Main/B Lobby'de öldün.", m6, fgA, "tr", "Ascent"],
    ["118l rapor yolu (konum dizisi)", "Bu round B Main'de öldün.", [] as never, { hasDeathLocation: true, deathLocation: ["a site"] } as never, "tr", "Ascent"],
    ["118m öğüt (ölüm fiili yok)", "Bu round B Main'de açıyı tut.", m6, fgA, "tr", "Ascent"],
    ["118n EN geçmiş çapası", "You died at B Main in R2, change your angle.", m6, fgA, "en", "Ascent"],
  ];
  for (const [ad, s, m, fg, lang, map] of keep) same(`${ad} bayt-aynı`, rc(s, m, fg, lang, map), s);
  // (1) çapa yan-cümle düzeyinde: sonraki plan yan-cümlesindeki "bu round" iddiayı bu round'a
  // çapalamaz; sayım silmesi R5'i yazar, halka dokunmaz (luna-default M1-R12 NR biçimi).
  const rh12: Mem[] = [
    { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
    { round_index: 5, died: true, death_position: "b main", position_confidence: "high" },
  ];
  eq("119 '…B Main'de 2 kez öldüğün için bu round Market'te crossfire kur' → R5 çapası, plan korunur",
    rc("B Site'a tek başına yapışma; B Main'de 2 kez öldüğün için bu round Market tarafında crossfire kur.", rh12, fgA, "tr", "Ascent", "suggestion"),
    "B Site'a tek başına yapışma; R5'te B Main'de öldüğün için bu round Market tarafında crossfire kur.");
  // (2) yan-cümle AÇIKÇA "bu round"a çapalıysa geçmiş çapası yazılmaz; halka konumu düzeltir
  // (cyclereal-base M1-R8 NR biçimi; ölçülen mid bottom).
  eq("119b 'Bu round B Main'de 2 kez … öldün' → 'Bu round Mid Bottom'da … öldün'",
    rc("Bu round B Main'de 2 kez ve diğerlerde de sık öldün, off-angle al.", rh12,
      { hasDeathLocation: true, deathLocation: "mid bottom" } as never, "tr", "Ascent", "suggestion"),
    "Bu round Mid Bottom'da ve diğerlerde de sık öldün, off-angle al.");
  // (2) kanıt SIFIR (level-3): sayıma bağlı konum düşer; bu round'un ölçülen konumu düşmez.
  const m6b: Mem[] = m6.map((r) => (r.round_index === 2 ? { ...r, death_position: "a site" } : r));
  eq("120 level-3 'Son 3 kez B Main'de öldün' (B Main'de 0 ölüm) → 'Öldün, …'",
    rc("Son 3 kez B Main'de öldün, açıyı değiştir.", m6b, fgA), "Öldün, açıyı değiştir.");
  eq("120b EN level-3 'You died at B Main 3 times' → 'You died, …' (boşluk artığı yok)",
    rc("You died at B Main 3 times, change your angle.", m6b, fgA, "en"), "You died, change your angle.");
  const alive6: Mem[] = m6b.map((r) => ({ ...r, died: false }));
  eq("120c level-3 ama konum BU round'un ölçülen konumu → konum KORUNUR",
    rc("Son 3 kez A Site'ta öldün, açıyı değiştir.", alive6, fgA), "A Site'ta öldün, açıyı değiştir.");
  // (2) ölüm-dışı sayım cümlesine çapa YAZILMAZ (korpus cyclereal-r3d2 M1-R9: "b'yi 2 kez
  // işaretleyip sonra Mid'e dönme" — ilk sürüm "R8'de Mid'e" üretiyordu).
  const rh9: Mem[] = [{ round_index: 8, died: true, death_position: "mid bottom", position_confidence: "high" }];
  const o121 = rc("Bu round Mid'de riskli kalma — b'yi 2 kez işaretleyip sonra Mid'e dönme taktiğini boz.", rh9, noLocF14(), "tr", "Ascent", "suggestion");
  t("121 ölüm-dışı sayım cümlesine 'R8'de' yazılmaz", !/R8/.test(o121), `→ "${o121}"`);
  // (2) yan-cümlede sayım dışında geçmiş çapası varsa ("son 3 round") yeni çapa yazılmaz.
  const o122 = rc("B Site bölgesinde son 3 round içinde 3 kez öldün, erken peek atma.", [
    { round_index: 1, died: true, death_position: "a site", position_confidence: "high" },
    { round_index: 2, died: true, death_position: "a site", position_confidence: "high" },
    { round_index: 3, died: true, death_position: "b site", position_confidence: "high" },
  ], fgA, "tr", "Ascent", "suggestion");
  t("122 'son 3 round' çapası varken 'R3'te' eklenmez", !/R3/.test(o122) && /son 3 round içinde öldün/.test(o122), `→ "${o122}"`);
}
function noLocF14(): never { return { hasDeathLocation: false } as never; }

console.log("\n════ FB05 · F52 · KONUM ÖLÇÜLMEMİŞKEN YAN-CÜMLE DÜZEYİ KONUM İDDİASI ════");
{
  // Gerçek korpus raw'ları (scripts/eval-out, konum ölçülmemiş round'lar; hafıza R1 b site, R3
  // a tree, …). HEAD: hepsi DEĞİŞMEDEN geçiyordu (fiil listesi / 60 kr pencere dışı biçimler).
  const noLoc = { hasDeathLocation: false } as never;
  const rh4: Mem[] = [
    { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
    { round_index: 2, died: true, death_position: null },
    { round_index: 3, died: true, death_position: "a tree", position_confidence: "high" },
  ];
  const rh11: Mem[] = [
    ...rh4,
    { round_index: 5, died: true, death_position: "b main", position_confidence: "high" },
    { round_index: 7, died: true, death_position: "b site", position_confidence: "high" },
    { round_index: 8, died: true, death_position: "mid bottom", position_confidence: "high" },
    { round_index: 10, died: true, death_position: "b lobby", position_confidence: "high" },
  ];
  const rc = (s: string, rh: Mem[], kind: "death" | "suggestion" = "death") =>
    realityCheck(s, rh as never, noLoc, kind, "tr", "ascent").text;
  const pos: [string, string, Mem[], "death" | "suggestion", string, string][] = [
    // [ad, ham metin, hafıza, alan, silinmesi gereken ad, çıktıda olması gereken nötr ifade]
    ["123a nano-none M1-R4 DA", "A Tree'de siperin yanında beklemeden açıya çıktın, bu yüzden defansta seni tek yerden aldılar.", rh4, "death", "A Tree", "O noktada siperin yanında beklemeden açıya çıktın"],
    ["123b nano-none M1-R4 EA0", "Seni A Tree hattında susturup öldüren tek bir görüş hattı vardı; açı açıkken yakaladılar.", rh4, "suggestion", "A Tree", "Seni o açıda susturup öldüren"],
    ["123c r2b M1-R4 EA0", "Bir düşman seni A Tree yakınındaki siper hattından vurdu; bu açı uzun hatta bekleyen bir oyuncuya uygun.", rh4, "suggestion", "A Tree", "seni o açıdaki siper hattından vurdu"],
    ["123d n14 M1-R4 EA1", "Rakip seni A Tree köşesinden vuruyor; bu açıya karşı crossfire ya da yanına bir takımlı koy ki tek hedef olma.", rh4, "suggestion", "A Tree", "Rakip seni o açıdan vuruyor"],
    ["123e r3d2 M1-R4 EA0", "Son 3 round'da 3 kez öldün; bu round A Tree'de düşmüş olman, rakibin farklı açılardan seni bekleyip çapraz ateş verdiğini gösteriyor.", rh4, "suggestion", "A Tree", "bu round o açıda düşmüş olman"],
    ["123f luna-none M1-R9 DA", "Bu round Mid Bottom'da siperin yanını kullanmadan açıya çıktın; bir düşman seni vurdu.", rh11.slice(0, 7), "death", "Mid Bottom", "Bu round o noktada siperin yanını"],
    ["123g r3c M1-R11 DA (>60 kr pencere)", "Rakip o açıda seni geniş savunma açısı tutma yaparak angle'de tuttu; Jett olarak B Lobby'de o açıyı aynı anda savunacak crossfire veya off-angle almak yerine tek tarafta kaldın — bir sonraki defans roundunda o açıda yalnız bekleme.", rh11, "death", "B Lobby", "Jett olarak o noktada o açıyı"],
    ["123h luna-none M1-R4 'A Tree'deki ölümde'", "Bu round seni kimin ve hangi silahla öldürdüğü okunmadı; A Tree'deki ölümde düşmanın açısını doğrulayacak bilgi yok.", rh4, "suggestion", "A Tree", "o noktadaki ölümde"],
  ];
  for (const [ad, s, rh, kind, gone, want] of pos) {
    const o = rc(s, rh, kind);
    t(`${ad} → nötrlenir`, !o.includes(gone) && o.includes(want), `→ "${o}"`);
  }
  // Dokunulmaz: öğüt cümleleri (seni/sana var ama yüklem emir / -masın / ki), sonraki round planı,
  // geçmişe çapalı doğru olgu, müttefik cümleleri (vaka 43 aynası).
  for (const [ad, s, rh] of [
    ["124a öğüt 'ki rakip seni … tutamasın'", "B Lobby'de Jett olarak dash'i erken harcama, siperden açı alıp temas sonrası geri çekil ki rakip seni aynı hatta tutamasın.", rh11],
    ["124b öğüt '… izin verme'", "A Lobby'de Cypher varsa telini giriş hattına koyup seni açıkta beklemeye zorlamasına izin verme; siper kenarından kısa peek atıp dash'le geri çekil.", rh11],
    ["124c 'Bir sonraki round A Tree'de açıya uzun uzanma'", "Bir sonraki round A Tree'de açıya uzun uzanma: önce tek kısa peek at, karşılık gelince hemen siperine geri dön.", rh4],
    ["124d geçmişe çapalı 'R3'te A Tree'de öldün'", "R3'te A Tree'de öldün, bu round açını değiştir.", rh4],
    ["124e müttefik 've geçemedin'", "Sage duvarı A Main'de duruyordu ve geçemedin.", rh4],
    // İlk sürümün korpus yanlış-pozitifleri (A/B'de yakalandı):
    ["124f ayrılma = karşılaştırma ('B Site'tan farklı')", "Düşmanın hattını açık bıraktı; ölümün bu kez B Site'tan farklı bir bölgede geldi.", rh11],
    ["124g liste üyesi ('B Main/Mid'deki tekrarları')", "Karşı hamle: B Main/Mid'deki tekrarları gördülerse seni aynı açıdan bekliyorlar.", rh11],
  ] as [string, string, Mem[]][]) same(`${ad} bayt-aynı`, rc(s, rh, "suggestion"), s);
  // "de/da" bağlacı ikameyle birlikte ünlü uyumuna çekilir (ilk sürüm "o açıda de").
  eq("125 'şimdi mid'de de … tekrarladın' → 'o açıda da'",
    rc("Birkaç kez öldün ve şimdi mid'de de aynı hatayı tekrarladın.", rh11, "suggestion"),
    "Birkaç kez öldün ve şimdi o açıda da aynı hatayı tekrarladın.");
  // Yakınsama Y04 (gerçek korpus/probe; HEAD çıktıları yorumda).
  // (1) -mIştIn yüklemi geçmiş çapası (ad hafızada ölçülmüşse): HEAD "Bu round o açıda ölmeden önce
  //     o açıda da ölmüştün" — R1'in DOĞRU B Site'ı silinip "aynı yerde yine öldün" iması kuruluyordu.
  eq("148a p2 M1-R4 '… ölmeden önce B Site'ta da ölmüştün' (R1 = b site) → B Site korunur, A Tree nötr",
    rc("Bu round A Tree'de ölmeden önce B Site'ta da ölmüştün; aynı hatayı tekrarlama.", rh4),
    "Bu round o açıda ölmeden önce B Site'ta da ölmüştün; aynı hatayı tekrarlama.");
  // (2) aynı cümlede İKİNCİ FARKLI ad aynı yer tutucuya inmez (korpus cyclereal-r3c M1-R4 NR; B Main
  //     ölçülmemiş → -mIştIn olsa da muaf değil). HEAD: "… o açıda ölmeden önce o açıda da ölmuştun".
  eq("148b r3c M1-R4 '… B Main'de de ölmuştun' (B Main ölçülmemiş) → 'başka bir noktada da'",
    rc("Bu round A Tree'de ölmeden önce B Main'de de ölmuştun; A'yı tek başına tutma.", rh4, "suggestion"),
    "Bu round o açıda ölmeden önce başka bir noktada da ölmuştun; A'yı tek başına tutma.");
  // Aynı ad iki kez → ikisi de aynı yer (o açı/nokta), "başka bir" YAZILMAZ.
  const o148c = rc("Bu round A Tree'de açıyı tuttun ve A Tree'den gelen düşman seni vurdu.", rh4);
  t("148c aynı ad iki kez → 'başka bir' yazılmaz", !/başka bir/.test(o148c) && !/A Tree/.test(o148c), `→ "${o148c}"`);
  // (3) callout'un önündeki çıplak harita adı ikameyle birlikte düşer (korpus cyclereal-r5 M1-R9 DA;
  //     HEAD: "Ascent o noktada Jett olarak orada bekleyen…").
  const o148d = rc("Ascent Mid Bottom'da Jett olarak orada bekleyen açıyı kapatamadın ve rakip seni o açıdan vurdu.", rh11.slice(0, 7));
  t("148d 'Ascent Mid Bottom'da …' → 'Ascent o …' artığı yok", !/Ascent/.test(o148d) && /^O noktada Jett olarak/.test(o148d), `→ "${o148d}"`);
  // Harita adı + ölçülmüş (muaf) callout → öbek aynen kalır.
  same("148e 'Ascent B Site'ta … ölmüştün' (b site ölçülmüş, -mIştIn) bayt-aynı",
    rc("Maçın başında Ascent B Site'ta da ölmüştün.", rh4), "Maçın başında Ascent B Site'ta da ölmüştün.");
  // Zarf-fiil yüklemi ("ölmeden") geçmiş çapası DEĞİL; ölçülmemiş ad -mIştIn'le de muaf değil.
  eq("148f '-mIştIn' + ölçülmemiş ad (Market) → nötr", rc("Market'te seni bekleyip vurmuşlardı, ölmüştün.", rh4), "O açıda seni bekleyip vurmuşlardı, ölmüştün.");
  // Konum ÖLÇÜLMÜŞSE bu geçiş hiç çalışmaz (bayrak false değil).
  const c126 = "Rakip seni A Tree köşesinden vuruyor.";
  same("126 hasDeathLocation:true → bayt-aynı",
    realityCheck(c126, rh4 as never, { hasDeathLocation: true, deathLocation: "b site" } as never, "suggestion", "tr", "ascent").text, c126);
}

console.log("\n════ FB05 · F83 · GEÇMİŞ KONUM MUAFİYETİ ROUND'A BAĞLI ════");
{
  // exp9 (gerçek korpus M1-R4): hafıza R1=b site, R2 konumsuz, R3=a tree; R4 konumu ölçülmedi.
  // HEAD: "R3'te B site'ta öldün, …" DEĞİŞMEDEN geçiyordu (küme kuralı: "b site" geçmişte var
  // + çapa geçmiş → muaf). 9355dec "R3'te öldün, …" diye nötrlüyordu.
  const noLoc = { hasDeathLocation: false } as never;
  const rh9: Mem[] = [
    { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
    { round_index: 2, died: true, death_position: null },
    { round_index: 3, died: true, death_position: "a tree", position_confidence: "high" },
  ];
  const rc = (s: string, lang: "tr" | "en" = "tr", fg: never = noLoc) => realityCheck(s, rh9 as never, fg, "death", lang).text;
  eq("117a 'R3'te B site'ta öldün' (R3 = a tree) → konum düşer", rc("R3'te B site'ta öldün, B'yi tek tutma."), "R3'te öldün, B'yi tek tutma.");
  eq("117b 'Round 3'te B Site'ta öldün.' → konum düşer", rc("Round 3'te B Site'ta öldün."), "Round 3'te öldün.");
  eq("117c EN 'You died at B Site in R3' → 'You died in R3'", rc("You died at B Site in R3, hold a safer angle.", "en"), "You died in R3, hold a safer angle.");
  // EN nötrleyici (neutralizeUnprovenLocationsEn) de aynı kuralı kullanır.
  eq("117c2 EN nötrleyici 'In R3 you held … at B Site' → 'there'",
    rc("In R3 you held the same corner at B Site and Jett killed you.", "en"), "In R3 you held the same corner there and Jett killed you.");
  const c117d = "R1'de B site'ta öldün, B'yi tek tutma.";
  same("117d DOĞRU round-konum (R1 = b site) bayt-aynı", rc(c117d), c117d);
  same("117d2 EN doğru round-konum (R1) bayt-aynı",
    rc("In R1 you held the same corner at B Site and Jett killed you.", "en"), "In R1 you held the same corner at B Site and Jett killed you.");
  same("117d3 R3 = a tree → 'R3'te A Tree'de öldün' bayt-aynı", rc("R3'te A Tree'de öldün."), "R3'te A Tree'de öldün.");
  // (e) kararı: en yakın çapa R3 → R3'ün konumu a tree → "B site" düşer (kabul edilen sonuç).
  const o117e = rc("Son 3 round'da R1 ve R3'te B site'ta öldün.");
  t("117e 'R1 ve R3'te B site'ta' → en yakın çapa R3 → konum düşer", !/B site/i.test(o117e) && /R3'te öldün/.test(o117e), `→ "${o117e}"`);
  // Sayısal OLMAYAN çapa eski küme kuralıyla kalır.
  same("117e2 'Daha önce B site'ta öldün.' (sayısal değil) bayt-aynı", rc("Daha önce B site'ta öldün."), "Daha önce B site'ta öldün.");
  // (f) Yakınsama Y09: ölçülmüş yol da AYNI round kuralını kullanır (F14 halkası, harita biliniyorken).
  // Eski 117f "R3'te B site'ta öldün." (R3 = a tree) çıktısını haritasız çağrıyla "bayt-aynı" diye
  // kilitliyordu — yanlış olgu. Doğru veriyle: R3'ün ÖLÇÜLMÜŞ konumu korunur, çelişen konum düşer.
  const fgA9 = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const rcM = (s: string, lang: "tr" | "en" = "tr") => realityCheck(s, rh9 as never, fgA9, "death", lang, "Ascent").text;
  same("117f ölçülmüş yol: DOĞRU round-konum 'R3'te A Tree'de öldün.' bayt-aynı", rcM("R3'te A Tree'de öldün."), "R3'te A Tree'de öldün.");
  eq("117g ölçülmüş yol: 'R3'te B site'ta öldün.' (R3 = a tree) → konum düşer (117a ile simetrik)",
    rcM("R3'te B site'ta öldün, B'yi tek tutma."), "R3'te öldün, B'yi tek tutma.");
  eq("117h ölçülmüş yol EN: 'You died at B Site in R3' (R3 = a tree) → 'You died in R3'",
    rcM("You died at B Site in R3, hold a safer angle.", "en"), "You died in R3, hold a safer angle.");
  eq("117i ölçülmüş yol: kaydı olmayan round ('R2'de Market'te') → konum düşer", rcM("R2'de Market'te öldün."), "R2'de öldün.");
  same("117j ölçülmüş yol: 'R1'de B site'ta öldün' (R1 = b site) bayt-aynı", rcM("R1'de B site'ta öldün."), "R1'de B site'ta öldün.");
}

console.log("\n════ FB05 inceleme · F14 tekrar/alışkanlık · lookbehind · OCR varyantı · ek/EN · F52 geçmiş + tahmin ════");
{
  // Ascent; hafıza R2/R4/R5 = b main (high); bu round ölçülen a site. HEAD (f797729+): (1)'deki
  // doğru tekrar/alışkanlık cümlelerinin HEPSİ ölçülen konuma çevriliyordu ("Sürekli A Site'ta
  // öldün", "You always died at A Site") → OCR'da olmayan tekrar ölüm olgusu.
  const fgA = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const m5: Mem[] = [1, 2, 3, 4, 5].map((i) => (i === 2 || i === 4 || i === 5
    ? { round_index: i, died: true, death_position: "b main", position_confidence: "high" }
    : { round_index: i, died: false }));
  const rc = (s: string, lang: "tr" | "en" = "tr", fg: never = fgA, map = "Ascent", m: Mem[] = m5, kind: "death" | "suggestion" = "death") =>
    realityCheck(s, m as never, fg, kind, lang, map).text;
  for (const [ad, s, lang] of [
    ["140a 'Sürekli'", "Sürekli B Main'de öldün.", "tr"],
    ["140b 'Hep …; B Main'i bırak'", "Hep B Main'de öldün; B Main'i bırak.", "tr"],
    ["140c 'üst üste'", "B Main'de üst üste öldün, bu round farklı açı al.", "tr"],
    ["140d 'Genelde'", "Genelde B Main'de öldün.", "tr"],
    ["140e 'Her seferinde'", "Her seferinde B Main'de öldün.", "tr"],
    ["140f 'öldüğün round'da' (başka round'a gönderme)", "B Main'de öldüğün round'da da aynı hatayı yaptın.", "tr"],
    ["140h 'Savunmada … üst üste öldüğün' (lookbehind açıldı, alışkanlık korur)", "Savunmada B Main'de üst üste öldüğün için açını değiştir.", "tr"],
    ["140i EN 'always'", "You always died at B Main.", "en"],
    ["140j EN 'again'", "You died at B Main again.", "en"],
    ["140k EN 'Early in the match'", "Early in the match you died at B Main.", "en"],
  ] as [string, string, "tr" | "en"][]) same(`${ad} bayt-aynı`, rc(s, lang), s);
  // Yakınsama Y09: 140g fikstürü GERÇEK veriyle (eskiden m5'te R1 died:false iken "İlk round B Main'de
  // öldün" doğru sayılıyordu). BİLİNEN SINIR: "ilk round" sayısal çapa değildir → doğrulanmaz.
  const m5r1: Mem[] = m5.map((r) => (r.round_index === 1 ? { round_index: 1, died: true, death_position: "b main", position_confidence: "high" } : r));
  same("140g 'İlk round' (Türkçe-İ tuzağı; R1 = b main) bayt-aynı", rc("İlk round B Main'de öldün.", "tr", fgA, "Ascent", m5r1), "İlk round B Main'de öldün.");
  // Yakınsama Y01: MAÇ DÖNEMİ çapaları (B Main hafızada R2/R4/R5 ölçülmüş → DOĞRU geçmiş olgu). HEAD:
  // hepsi ölçülen konuma çevriliyordu ("Maçın başında A Site'ta öldün", "In the first half you died at
  // A Site") → OCR'da olmayan ölüm yeri.
  for (const [ad, s, lang, kind] of [
    ["146a 'Maçın başında'", "Maçın başında B Main'de öldün; bu round farklı açı al.", "tr", "death"],
    ["146b 'İlk yarıda … öldüğün için bu round …'", "İlk yarıda B Main'de öldüğün için bu round Market'ten crossfire kur.", "tr", "suggestion"],
    ["146c 'Savunma yarısında'", "Savunma yarısında B Main'de öldün, şimdi atakta farklı gir.", "tr", "death"],
    ["146d 'İkinci yarının başında'", "İkinci yarının başında B Main'de öldün.", "tr", "death"],
    ["146e 'Maç başında'", "Maç başında B Main'de öldün.", "tr", "death"],
    ["146f 'Pistolde'", "Pistolde B Main'de öldün.", "tr", "death"],
    ["146g EN 'In the first half'", "In the first half you died at B Main.", "en", "death"],
    ["146h EN '… in the first half, hold …'", "Since you died at B Main in the first half, hold Market with a teammate this round.", "en", "suggestion"],
    ["146i EN 'At the start of the match'", "At the start of the match you died at B Main.", "en", "death"],
    ["146j EN 'In the opening rounds'", "In the opening rounds you died at B Main.", "en", "death"],
  ] as [string, string, "tr" | "en", "death" | "suggestion"][]) same(`${ad} bayt-aynı`, rc(s, lang, fgA, "Ascent", m5, kind), s);
  // Çapasız ve açık "bu round" iddiası düzeltilmeye DEVAM eder (halkanın asıl hedefi).
  eq("146k çapasız 'B Main'de öldün, …' → ölçülen konum", rc("B Main'de öldün, bu round farklı açı al."), "A Site'ta öldün, bu round farklı açı al.");
  eq("146l EN 'You died at B Main this round' → ölçülen konum", rc("You died at B Main this round.", "en"), "You died at A Site this round.");
  // "<callout>'de <sayı>," açık "bu round" çapası YOKSA bu round iddiası değil (sayım yolu ele alır).
  const o130l = rc("B Main'de 3, genel olarak son 6 round'da hep öldün.");
  t("140l '<sayı>,' çapasız → konum ölçülene ÇEVRİLMEZ ('A Site'ta 3' yok)", o130l.startsWith("B Main'de 3,") && !/A Site/.test(o130l), `→ "${o130l}"`);
  // (2) lookbehind: a/b/c/t ile biten kelimeden sonraki callout artık görünür.
  eq("141 'Bu round'da B Main'de öldün' → ölçülen konum (HEAD: bayt-aynı geçiyordu)", rc("Bu round'da B Main'de öldün."), "Bu round'da A Site'ta öldün.");
  eq("141b sade 'Bu round B Main'de öldün' aynen düzelir", rc("Bu round B Main'de öldün."), "Bu round A Site'ta öldün.");
  // (3) ölçülen konum ham OCR varyantı ('a hail' ~ 'a hall') → modelin doğru adı KALIR; farklı ad hâlâ nötr.
  const fgHail = { hasDeathLocation: true, deathLocation: "a hail" } as never;
  same("142a 'a hail' ölçülü + 'A Hall'da öldün' (Fracture) bayt-aynı (HEAD: 'O noktada öldün')", rc("A Hall'da öldün.", "tr", fgHail, "Fracture"), "A Hall'da öldün.");
  same("142b EN 'You died at A Hall' bayt-aynı (HEAD: 'You died there')", rc("You died at A Hall.", "en", fgHail, "Fracture"), "You died at A Hall.");
  eq("142c farklı callout ('B Main') hâlâ nötrlenir", rc("B Main'de öldün.", "tr", fgHail, "Fracture"), "O noktada öldün.");
  // Yakınsama Y03: kanonik OLMAYAN ölçülen konum önce masaüstü eşleme aynasıyla kanonikleşir; olmazsa
  // (ve tablodaki bir adın OCR varyantı da değilse) kanıtlanabilir çelişki yok → halka çalışmaz.
  // KANIT (saha v1.0.19 gövdeleri): 'istemci b ana' (aimlo-runtime 01.txt:4974), 'a/lobi'
  // (aimlo-runtimeKAAN.txt:4226) — HEAD: modelin DOĞRU "B Main"/"A Lobby"si "o noktada"ya iniyordu.
  const loc = (d: string) => ({ hasDeathLocation: true, deathLocation: d }) as never;
  same("147a 'istemci b ana' + \"Bu round B Main'de öldün\" bayt-aynı (HEAD: 'o noktada')", rc("Bu round B Main'de öldün.", "tr", loc("istemci b ana")), "Bu round B Main'de öldün.");
  same("147b 'a/lobi' + \"Bu round A Lobby'de öldün\" bayt-aynı", rc("Bu round A Lobby'de öldün.", "tr", loc("a/lobi")), "Bu round A Lobby'de öldün.");
  eq("147c 'a/lobi' + \"Bu round B Main'de öldün\" → kanonik 'A Lobby'", rc("Bu round B Main'de öldün.", "tr", loc("a/lobi")), "Bu round A Lobby'de öldün.");
  same("147d Summit 'a resim' + \"A Art'ta öldün\" bayt-aynı", rc("A Art'ta öldün.", "tr", loc("a resim"), "Summit"), "A Art'ta öldün.");
  same("147e Haven 'a kanalizasyon' + \"A Sewer'da öldün\" bayt-aynı", rc("A Sewer'da öldün.", "tr", loc("a kanalizasyon"), "Haven"), "A Sewer'da öldün.");
  same("147f eşlenemeyen 'x yz' + \"Bu round B Main'de öldün\" bayt-aynı (HEAD: 'o noktada')", rc("Bu round B Main'de öldün.", "tr", loc("x yz")), "Bu round B Main'de öldün.");
  same("147g Sunset 'a lobi' (A016: Sunset tablosunda 'a lobby' yok) bayt-aynı", rc("Bu round B Main'de öldün.", "tr", loc("a lobi"), "Sunset"), "Bu round B Main'de öldün.");
  eq("147h EN HUD önekli 'iştemcj f b/ bölge' → 'at B Site'", rc("You died at B Main this round.", "en", loc("iştemcj f b/ bölge")), "You died at B Site this round.");
  // (4) halkanın yazdığı ek / EN metin.
  eq("143a ölçülen 'market kapısı' → \"Market Kapısı'nda\" (HEAD: \"Kapısı'da\")",
    rc("Bu round B Main'de öldün.", "tr", { hasDeathLocation: true, deathLocation: "market kapısı" } as never), "Bu round Market Kapısı'nda öldün.");
  eq("143b ölçülen 'ct' → \"CT'de\" (HEAD: \"CT'te\")",
    rc("Bu round B Main'de öldün.", "tr", { hasDeathLocation: true, deathLocation: "ct" } as never), "Bu round CT'de öldün.");
  eq("143c EN + Türkçe harfli kanonik ad → 'there' (HEAD: 'at Market Kapısı')",
    rc("You died at B Main this round.", "en", { hasDeathLocation: true, deathLocation: "market kapısı" } as never), "You died there this round.");
  // (5) F52: geçmiş çapası yalnız o round'un ÖLÇÜLMÜŞ konumuyla muaf (F83 kuralı).
  const noLoc = { hasDeathLocation: false } as never;
  const rh13: Mem[] = [
    { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
    { round_index: 3, died: true, death_position: "a tree", position_confidence: "high" },
  ];
  eq("144a 'R3'te B Site'tan seni vurdular' (R3 = a tree) → nötr (HEAD: bayt-aynı)", rc("R3'te B Site'tan seni vurdular.", "tr", noLoc, "Ascent", rh13), "R3'te o açıdan seni vurdular.");
  eq("144b 'Daha önce Market'ten seni vurdular' (hiç ölçülmedi) → nötr", rc("Daha önce Market'ten seni vurdular.", "tr", noLoc, "Ascent", rh13), "Daha önce o açıdan seni vurdular.");
  same("144c doğru round-konum 'R1'de B Site'tan seni vurdular' bayt-aynı", rc("R1'de B Site'tan seni vurdular.", "tr", noLoc, "Ascent", rh13), "R1'de B Site'tan seni vurdular.");
  eq("144d lookbehind: 'Bu round'da A Tree'de … çıktın' → nötr (HEAD: bayt-aynı)",
    rc("Bu round'da A Tree'de siperin yanında beklemeden açıya çıktın.", "tr", noLoc, "Ascent", [{ round_index: 3, died: true, death_position: "a tree", position_confidence: "high" }]),
    "Bu round'da o noktada siperin yanında beklemeden açıya çıktın.");
  // (6) F52: tahmin/alışkanlık + öğüt cümleleri plan referansını kaybetmez (HEAD: 'o açıda/o açıdan').
  for (const [ad, s] of [
    ["145a 'seni bekliyor, o yüzden smoke at'", "Rakip A Main'de seni bekliyor, o yüzden smoke at ve geç gir."],
    ["145b 'genelde … peek'liyor'", "Jett genelde A Main'den seni peek'liyor; drone'la bilgi al."],
    ["145c '… var, oraya smoke at'", "Heaven'dan seni gören Operator'cü var, oraya smoke at."],
    ["145d 'veya' listesi ('A Site veya Mid'de … bekledin')", "Bu round ölmüş değilsin; A Site veya Mid'de takımınla birlikte giriş bekledin."],
  ] as [string, string][]) same(`${ad} bayt-aynı`, rc(s, "tr", noLoc, "Ascent", rh13, "suggestion"), s);
  eq("145e tek başına şimdiki zaman anlatımı hâlâ nötrlenir (123d sınıfı)",
    rc("Rakip seni A Tree köşesinden vuruyor; bu açıya karşı crossfire kur.", "tr", noLoc, "Ascent", rh13, "suggestion"), "Rakip seni o açıdan vuruyor; bu açıya karşı crossfire kur.");
}

console.log("\n════ FB06 · F57 · YAZIYLA SAYI + 'kere' + KONUM LİSTESİ SAYIMI ════");
{
  // HEAD: COUNT_PATTERNS yalnız rakam + kez/defa → aşağıdaki pozitiflerin HEPSİ bayt-aynı geçiyordu
  // (claimedCount=null). Hafıza: R2'de a site (B Main'de ölüm YOK); bu round ölçülen a site.
  const fgA = { hasDeathLocation: true, deathLocation: "a site" } as never;
  const m6: Mem[] = Array.from({ length: 6 }, (_, i) => ({
    round_index: i + 1, died: i === 1, death_position: i === 1 ? "a site" : null, position_confidence: i === 1 ? "high" : undefined,
  }));
  const rc = (s: string, m: Mem[], kind: "death" | "suggestion" = "death", fg: never = fgA) =>
    realityCheck(s, m as never, fg, kind, "tr").text;
  eq("127 'B Main'de üç kez öldün' (B Main'de 0 ölüm) → sayım + bağlı konum düşer (rakamlı test 120 ile aynı)",
    rc("B Main'de üç kez öldün, açıyı değiştir.", m6), "Öldün, açıyı değiştir.");
  eq("127b 'Son üç kez B Main'de öldün' → 'son' ile birlikte düşer",
    rc("Son üç kez B Main'de öldün, açıyı değiştir.", m6), "Öldün, açıyı değiştir.");
  eq("127c rakam + 'kere' ('3 kere') → düşer", rc("B Main'de 3 kere öldün, açıyı değiştir.", m6), "Öldün, açıyı değiştir.");
  eq("127d cümle başı 'İki kez' (toLowerCase U+0307 tuzağı) → düşer", rc("İki kez B Main'de öldün.", m6), "Öldün.");
  // Level-2: sayı yalnız İNER, yazıyla biçim de rakamla yazılır (prompt idiomu "N kez").
  const m6c: Mem[] = m6.map((r) => (r.round_index === 4 || r.round_index === 5
    ? { ...r, died: true, death_position: "b main", position_confidence: "high" } : r));
  eq("127e 'B Main'de dört kez öldün' (gerçek 2) → '2 kez'",
    rc("B Main'de dört kez öldün, açıyı değiştir.", m6c), "B Main'de 2 kez öldün, açıyı değiştir.");
  same("127f DOĞRU yazıyla sayım ('B Main'de iki kez', gerçek 2) bayt-aynı",
    rc("B Main'de iki kez öldün, açıyı değiştir.", m6c), "B Main'de iki kez öldün, açıyı değiştir.");
  // ÖĞÜT KALKANI (negatif): yazıyla sayı ölüm yan-cümlesi dışında sayım DEĞİL (korpus biçimleri).
  for (const [ad, s] of [
    ["128a 'bir kez daha dene'", "B Main'de öldün; bir kez daha dene ama bu sefer smoke'la gir."],
    ["128b korpus S5 'A Main'i üç kez aynı açıdan verdin'", "Bu round A Main'i üç kez aynı açıdan verdin; bir round orayı tamamen boş bırak."],
    ["128c korpus r4c 'bir kere pozisyonunu değiştir'", "B tarafı için bir kere pozisyonunu değiştir: B Lobby'yi tek başına tutma."],
    ["128d 'bir kerede' (sağ sınır)", "Bir kerede iki açıya bakma, B Main'de öldün."],
  ] as [string, string][]) same(`${ad} bayt-aynı`, rc(s, m6, "suggestion"), s);
  // Liste YALNIZ doğrudan koordinasyonla: öğüt konumu ('Market'ten bakarken') listeye girmez →
  // sayım Market ölümleriyle ŞİŞİRİLMEZ (SPEC SAPMASI, :480-487 notu). Market 2 + B Main 1 = 3
  // toplamı "3 kez"i doğrulamamalı.
  const rhM: Mem[] = [
    { round_index: 1, died: true, death_position: "market", position_confidence: "high" },
    { round_index: 2, died: true, death_position: "market", position_confidence: "high" },
    { round_index: 5, died: true, death_position: "b main", position_confidence: "high" },
  ];
  const o129 = rc("Market'ten bakarken B Main'de 3 kez öldün, açıyı değiştir.", rhM);
  t("129 öğüt konumu liste sayılmaz ('3 kez' Market ölümleriyle doğrulanmaz)", !/3 kez/.test(o129), `→ "${o129}"`);
  // Gerçek korpus regresyon vakası (cyclereal-r3d M1-R5 NR, real-rounds-23 hafızası: R1 b site,
  // R3 a tree; bu round ölçülen b main). HEAD: bayt-aynı ("üç kez" uydurma sayım kullanıcıya gidiyordu).
  const rh5: Mem[] = [
    { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
    { round_index: 2, died: true, death_position: null },
    { round_index: 3, died: true, death_position: "a tree", position_confidence: "high" },
    { round_index: 4, died: true, death_position: null },
  ];
  const nr5 = "B Main'de üç kez öldüğün kayıt var — bir sonraki round B'yi tek başına tutma, Market/CT'ye birini bırakıp sen Heaven/closet yerine off-angle alarak crossfire bekle.";
  const o130 = realityCheck(nr5, rh5 as never, { hasDeathLocation: true, deathLocation: "b main" } as never, "suggestion", "tr", "ascent").text;
  t("130 cyclereal-r3d M1-R5 NR: uydurma 'üç kez' düşer, ölçülen B Main + öğüt kalır",
    !/üç kez/.test(o130) && /^B Main'de öldüğün/.test(o130) && /bir sonraki round B'yi tek başına tutma/.test(o130), `→ "${o130}"`);

  // FB06 inceleme · F57 (medium): liste üyesinin HER biri pencerede ≥1 ölümle eşleşmeli. Hafıza
  // R1 b site, R3 a tree, R5 b site; bu round ölçülen b site; A Main'de ölüm 0. HEAD: toplam
  // (B Site 2) uydurma A Main'i de "doğruluyordu" ("2 kez" bayt-aynı, "3 kez" → "A Main'de 2 kez").
  const rhL: Mem[] = [
    { round_index: 1, died: true, death_position: "b site", position_confidence: "high" },
    { round_index: 3, died: true, death_position: "a tree", position_confidence: "high" },
    { round_index: 5, died: true, death_position: "b site", position_confidence: "high" },
  ];
  const fgB = { hasDeathLocation: true, deathLocation: "b site" } as never;
  const rcL = (s: string) => realityCheck(s, rhL as never, fgB, "death", "tr", "Ascent").text;
  for (const [ad, s] of [
    ["151a rakamlı 'B Site ve A Main'de 2 kez'", "B Site ve A Main'de 2 kez öldün; açıyı değiştir."],
    ["151b aşan sayım '… 3 kez' (HEAD: 'A Main'de 2 kez'e YAZIYORDU)", "B Site ve A Main'de 3 kez öldün; açıyı değiştir."],
    ["151c yazıyla ikiz '… iki kez'", "B Site ve A Main'de iki kez öldün; açıyı değiştir."],
    ["151d uydurma üye başta ('A Main ve B Site'ta 2 kez')", "A Main ve B Site'ta 2 kez öldün; açıyı değiştir."],
  ] as [string, string][]) {
    const o = rcL(s);
    t(`${ad} → uydurma üye + sayım birlikte kalmaz`, !/A Main/.test(o) && !/(?:2|3|iki) kez/.test(o) && o === "B Site'ta öldün; açıyı değiştir.", `→ "${o}"`);
  }
  same("151e tüm üyeler kanıtlı liste ('B Site/A Tree'de 2 kez', toplam 3) bayt-aynı", rcL("B Site/A Tree'de 2 kez öldün; açıyı değiştir."), "B Site/A Tree'de 2 kez öldün; açıyı değiştir.");

  // FB06 inceleme (low): "bir kez/kere daha" deyimi sayım değil (HEAD: "Bu round daha öldün").
  const fgBM = { hasDeathLocation: true, deathLocation: "b main" } as never;
  const m5b: Mem[] = [1, 2, 3, 4, 5].map((i) => (i <= 2 ? { round_index: i, died: true, death_position: "b main", position_confidence: "high" } : { round_index: i, died: true }));
  for (const s of [
    "Bu round bir kez daha A Main'de öldün; açıyı erken verdin.",
    "Bir kez daha A Main'de öldün, açıyı erken verdin.",
    "A Main'de bir kere daha öldün, açıyı erken verdin.",
  ]) same(`152 '${s.slice(0, 26)}…' yetim 'daha' üretmez (bayt-aynı)`, realityCheck(s, m5b as never, fgBM, "death", "tr", "Ascent").text, s);
  // FB06 inceleme (low): bileşik yazıyla sayı "on iki" = 12 (HEAD: "iki kez" okunup 2 ≤ 5 "doğru").
  eq("153a 'Bu maçta on iki kez öldün' (toplam 5 ölüm) → '5 kez' (rakamlı '12 kez' ile aynı yol)",
    realityCheck("Bu maçta on iki kez öldün.", m5b as never, fgBM, "death", "tr", "Ascent").text, "Bu maçta 5 kez öldün.");
  eq("153b 'B Main'de on iki kez' (gerçek 2) → '2 kez', öksüz 'on' yok",
    realityCheck("B Main'de on iki kez öldün, açıyı değiştir.", m5b as never, fgBM, "death", "tr", "Ascent").text, "B Main'de 2 kez öldün, açıyı değiştir.");
}

console.log("\n════ FB06 · F51 · ÖNERİ ALANI KUYRUĞA İNMEZ (iddia öbeği / ham metin kurtarması) ════");
{
  // Gerçek maç gövdeleri (evals/real-rounds-23.json) + gerçek ham NR'ler (scripts/eval-out),
  // prod zinciri (finalizeVisionFeedback + buildVisionContext/visionPostprocessOpts).
  const real = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "evals", "real-rounds-23.json"), "utf8")) as { id: string; body: VisionPromptBody }[];
  const body = (id: string) => {
    const r = real.find((x) => x.id === id);
    if (!r) throw new Error("real-rounds-23'te yok: " + id);
    return r.body;
  };
  const chainNr = (id: string, nr: string) => {
    const b = body(id);
    const fg = buildVisionContext(b, "tr").factGround;
    return finalizeVisionFeedback({ deathAnalysis: "Açıkta kaldın ve bir düşman seni vurdu.", enemyAnalysis: [], nextRoundSuggestion: nr },
      visionPostprocessOpts(b, "tr", fg)).nextRoundSuggestion;
  };
  // M1-R3 (cyclew3-cand3-real): HEAD "Dash'i geri çekilme ya da geri trade için sakla." — tetikleyici
  // "straight" yanlış-pozitifi F41 ile kapandı; burada zincir kilidi.
  const nr3 = "Savunmayı değiştir: A Tree'de straight açıkta durma, smoke atıp sonra dash'le farklı bir yüksek açıya gelerek ilk peek'i sen aç — dash'i geri çekilme/geri trade için sakla.";
  const o3 = chainNr("M1-R3-ascent-jett", nr3);
  t("131 M1-R3 NR: asıl öğüt ('smoke atıp … ilk peek'i sen aç') çıktıda", /ilk peek'i sen aç/.test(o3) && /^Savunmayı değiştir/.test(o3), `→ "${o3}"`);
  // M1-R9 (cycleb06-parity-real): HEAD 257 → 53 karakter "Dash ile giriş açma değil, ölürken kaçış
  // hattı yarat." İddia yan-cümlesi (TR "pattern" + R-listesi) öbek düzeyinde silinemiyor → kalan
  // metin yarıdan kısa → realityCheck "" → zincir süzülmüş HAM metni gösterir (TR-KALAN-26; bedel:
  // ham metnin tarih iddiası geri gelir — RW1-F1 bilinen sınırı).
  const nr9 = "Savunmada bu round B site ve mid pattern'lerini kır: R2·R3·R5·R7 geçmişine bakıp B bölgesini fazla tutma, bir sonraki defansta takım smoke/flash inince sen dash'le hızlı geri çekilme hattı açıp off-angle kur — dash ile giriş açma değil, ölürken kaçış hattı yarat.";
  const b9 = body("M1-R9-ascent-jett");
  const fg9 = buildVisionContext(b9, "tr").factGround;
  const mem9 = toRoundMemory(b9.roundHistory as never);
  eq("132 M1-R9 realityCheck(suggestion) → '' (kuyruğa inme kapısı)", realityCheck(nr9, mem9, fg9, "suggestion", "tr", "ascent").text, "");
  const o9 = chainNr("M1-R9-ascent-jett", nr9);
  t("132b M1-R9 zincir: asıl öğüt ('B bölgesini fazla tutma … off-angle kur') çıktıda",
    /B bölgesini fazla tutma/.test(o9) && /off-angle kur/.test(o9), `→ "${o9}"`);
  // Kapsam kilidi: DA (kind="death") yolu DEĞİŞMEZ — yan-cümle eskisi gibi düşer.
  eq("133 aynı metin kind='death' → eski yan-cümle silmesi (bayt-aynı davranış)",
    realityCheck(nr9, mem9, fg9, "death", "tr", "ascent").text, "Dash ile giriş açma değil, ölürken kaçış hattı yarat.");

  console.log("\n════ FB06 · F95 · 'KAYIT VAR' → OLGU, realityCheck'TEN ÖNCEKİ HALKADA ════");
  // cyclereal-r3d M1-R5 NR (bu round ölçülen b main; hafızada B Main ölümü yok): tutanak dili gider,
  // yazıyla uydurma sayım (F57) dönüştürülmüş metinde düşer, ölçülen konum + öğüt kalır.
  // HEAD: "B Main'de öldüğün kayıt var — …" (tutanak dili kullanıcıya gidiyordu).
  const o134 = chainNr("M1-R5-ascent-jett", "B Main'de üç kez öldüğün kayıt var — bir sonraki round B'yi tek başına tutma, Market/CT'ye birini bırakıp sen Heaven/closet yerine off-angle alarak crossfire bekle.");
  t("134 M1-R5 zincir: 'kayıt var' yok, 'üç kez' yok, 'B Main'de öldün — …' + öğüt",
    !/kayıt/.test(o134) && !/üç kez/.test(o134) && /^B Main'de öldün — bir sonraki round B'yi tek başına tutma/.test(o134), `→ "${o134}"`);
  // HALKA SIRASI KİLİDİ — cyclew3-cand3-real M1-R9 NR (bu round konum ÖLÇÜLMEDİ; B Main yalnız R5'te).
  // Dönüşüm realityCheck'ten ÖNCE: "B Main'de üst üste öldün" kesin ölüm cümlesi olur, konum
  // nötrleyicisi çapasız "B Main'de" iddiasını görür ve düşürür. Dönüşüm yalnız cleanCoachText'te
  // olsaydı RC ortaç biçimini ("öldüğün kayıtları da var") görmez, çıktı "Savunmada B Main'de üst
  // üste öldün; …" olurdu (A/B'de ölçüldü).
  const o135 = chainNr("M1-R9-ascent-jett", "Savunmada B Main'de üst üste öldüğün kayıtları da var; sonraki round siper kenarını sabit tutma, smoke ile görüş hattını kapat ve dash'le farklı bir off-angle'dan pozisyona girerek retake/rotate tehdidini azalt.");
  t("135 M1-R9 zincir: dönüşüm RC'den önce → kanıtsız 'B Main'de' düşer, tutanak dili yok",
    !/kayıt/.test(o135) && !/B Main/.test(o135) && /^Savunmada üst üste öldün; sonraki round siper kenarını sabit tutma/.test(o135), `→ "${o135}"`);
}

console.log("\n════ FB06 inceleme · F51 · KUYRUK KAPISI YEDEĞİ HAM DEĞİL, GUARD'LI METİN ════");
{
  // Gerçek gövde M1-R5 (evals/real-rounds-23.json; bu round ölçülen b main, katil OKUNMAMIŞ) +
  // prod gibi mevcut round hafızada (R5 b main high → B Main gerçek ölüm = 1). HEAD: kuyruk kapısı
  // realityCheck'i "" yapıyor, zincir HAM nrIn'e dönüyordu → uydurma sayım/katil/silah/headshot
  // kullanıcıya gidiyordu (F57 ve guardUnprovenFacts'in sildiği sınıflar).
  const real = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "evals", "real-rounds-23.json"), "utf8")) as { id: string; body: VisionPromptBody }[];
  const b0 = real.find((x) => x.id === "M1-R5-ascent-jett")!.body as VisionPromptBody & { roundHistory: Record<string, unknown>[] };
  const cur = { round_index: 5, died: true, round_won: false, death_detected_confidence: "observed", timestamp: 4, death_position: "b main", position_confidence: "high" };
  const chain = (lang: "tr" | "en", nr: string, ea: string[] = []) => {
    const b = { ...b0, lang, roundHistory: [...b0.roundHistory, cur] } as VisionPromptBody;
    const fg = buildVisionContext(b, lang).factGround;
    return finalizeVisionFeedback({ deathAnalysis: lang === "tr" ? "Açıkta kaldın." : "You were exposed.", enemyAnalysis: ea, nextRoundSuggestion: nr },
      visionPostprocessOpts(b, lang, fg));
  };
  const nrCount = chain("tr", "B Main'de 3 kez öldün ve aynı pozisyonda bekliyorsun, rakip seni artık okuyor; smoke at.").nextRoundSuggestion;
  t("150a NR 'B Main'de 3 kez … aynı pozisyon' → uydurma '3 kez' YOK, öğüt kalır (HEAD: ham metin '3 kez' dahil)",
    !/3 kez/.test(nrCount) && /smoke at\.$/.test(nrCount) && /B Main'de öldün/.test(nrCount), `→ "${nrCount}"`);
  const nrEn = chain("en", "You died at B Main 3 times from the same spot and they are reading you now; smoke first.").nextRoundSuggestion;
  t("150b EN ikizi → '3 times' YOK, öğüt kalır", !/3 times/.test(nrEn) && /smoke first\.$/.test(nrEn), `→ "${nrEn}"`);
  const killerRaw = "Bu round Jett seni Operator'la B Main'de kafadan vurdu ve sürekli aynı pozisyonda ölüyorsun, rakip seni okuyor; smoke at.";
  const nrKill = chain("tr", killerRaw).nextRoundSuggestion;
  t("150c NR katil bilinmezken 'Jett … Operator'la … kafadan' + tekrar → Jett/Operator/kafadan YOK (HEAD: hepsi geri geliyordu)",
    !/Jett|Operator|kafadan/.test(nrKill) && /smoke at\.$/.test(nrKill), `→ "${nrKill}"`);
  const eaOne = chain("tr", "Smoke at ve bekle.", [killerRaw]).enemyAnalysis;
  t("150d aynı metin TEK EA maddesi → Jett/Operator/kafadan YOK, madde korunur (son madde)",
    eaOne.length === 1 && !/Jett|Operator|kafadan/.test(eaOne[0]), JSON.stringify(eaOne));
  const eaTwo = chain("tr", "Smoke at ve bekle.", ["B Main'de Killjoy kurulu, drone'la temizle.", killerRaw]).enemyAnalysis;
  t("150e kanıtlı madde varken kanıtsız (kuyruğa inen) madde yine DÜŞER (TR-KALAN-26 (b) aynen)",
    eaTwo.length === 1 && /Killjoy kurulu/.test(eaTwo[0]), JSON.stringify(eaTwo));
  const rcKill = realityCheck(killerRaw, toRoundMemory([...b0.roundHistory, cur] as never), buildVisionContext({ ...b0, roundHistory: [...b0.roundHistory, cur] } as VisionPromptBody, "tr").factGround, "suggestion", "tr", "ascent");
  t("150f realityCheck sinyali aynen: text '' + fallbackText guard'lı", rcKill.text === "" && !!rcKill.fallbackText && !/Jett|Operator|kafadan/.test(rcKill.fallbackText), JSON.stringify(rcKill));
}

console.log(`\n${fail === 0 ? "TAM YEŞİL" : "KIRMIZI"} — ${n - fail}/${n} geçti${fail ? `, ${fail} HATA` : ""}`);
process.exit(fail ? 1 : 0);
