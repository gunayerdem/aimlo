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
import { realityCheck } from "../lib/reality-checker";
import * as CT from "../lib/coach-text";
const { cleanCoachText, enforceSuppliedCallout } = CT;
import { trOrdinalLocative } from "../lib/tr-suffix";
import { buildHistoryBlock } from "../lib/history-block";

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
  const c46 = "MID'de aynı köşeyi tuttun.";
  same("46 ölçülen konum (roundHistory) DOKUNULMAZ", run(c46, mem(3, 1, "Mid")), c46);

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
    const out = rk("Yoru yerine — Jett/Reyna'nin hızlı peek'ine trade verebilecek düzen kur.");
    t("50 apostroflu ek artığı YOK ('bir düşman'nin')",
      !/bir düşman['’]/.test(out) && /bir düşmanın/.test(out), `→ "${out}"`);
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
  // Callout / harita yolu BAYT-AYNI (bugünkü çağıranlar: report/route.ts, app/page.tsx).
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

console.log(`\n${fail === 0 ? "TAM YEŞİL" : "KIRMIZI"} — ${n - fail}/${n} geçti${fail ? `, ${fail} HATA` : ""}`);
process.exit(fail ? 1 : 0);
