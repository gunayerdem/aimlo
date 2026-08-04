/**
 * AJAN-BOŞ UYDURMA GUARD'I TESTİ (reality-checker).
 *
 * NEDEN VAR (canlı-test #9, 2026-08-04): maç onaylanmadan atılan warmup AI
 * çağrısında agent alanı BOŞTU ve model "Phoenix olarak kendi utilini..."
 * yazdı — oyuncu Brimstone'du. Warmup teslim edilmediği için kullanıcı görmedi
 * ama maç ortasında agent-OCR boş kalabiliyor (bilinen ayrı desktop sorunu) ve
 * aynı uydurma o zaman KULLANICIYA gider. Guard, playerAgentKnown === false
 * iken "<Ajan> olarak" (TR) / "as <Agent>" (EN) OYUNCU-kendine-yakıştırma
 * kalıplarını deterministik düşürür (cümle akıcı kalır); ajan BİLİNİRKEN metne
 * hiç dokunmaz; katil/düşman cümleleri ("Skye seni öldürdü") hiçbir durumda
 * bozulmaz.
 *
 * Koşum: npx tsx scripts/test-agent-unknown-guard.ts
 */
import { realityCheck } from "../lib/reality-checker";

let fail = 0;
function t(name: string, ok: boolean, extra = "") {
  console.log(`  ${ok ? "ok " : "FAIL"} ${name}${ok ? "" : " — " + extra}`);
  if (!ok) fail++;
}

// Katil-absent guard'ının araya girmemesi için hasKiller:true + killerAgent
// KANITLI verilir (izolasyon) — yalnız [5] bilinçli olarak hasKiller:false ile
// iki guard'ın BİRLİKTE davranışını kilitler.
const gUnknown = (extra: Record<string, unknown> = {}) =>
  ({ hasKiller: true, killerAgent: "Skye", playerAgentKnown: false, ...extra } as never);
const gKnown = () =>
  ({ hasKiller: true, killerAgent: "Skye", playerAgentKnown: true } as never);

const tr = (text: string, g: never) => realityCheck(text, [] as never, g, "death", "tr").text;
const en = (text: string, g: never) => realityCheck(text, [] as never, g, "death", "en").text;

console.log("\n[1] AJAN BOŞKEN — TR 'X olarak' yakıştırması düşer, cümle akıcı kalır");
{
  // Canlı warmup kanıtının birebir sınıfı
  const out = tr("Phoenix olarak kendi utilini savunmada kullanmadın.", gUnknown());
  console.log("    SONRA:", out);
  t("'Phoenix' silindi", !/Phoenix/i.test(out), `→ "${out}"`);
  t("ders korundu", /kendi utilini savunmada kullanmadın/i.test(out), `→ "${out}"`);
  t("cümle başı büyütüldü", /^Kendi/.test(out), `→ "${out}"`);

  const out2 = tr("Bu round Jett olarak erken peek attın.", gUnknown());
  console.log("    SONRA:", out2);
  t("cümle ortası kalıp da düşer", out2 === "Bu round erken peek attın.", `→ "${out2}"`);

  const out3 = tr("Brimstone olarak, önce smoke at sonra gir.", gUnknown());
  console.log("    SONRA:", out3);
  t("virgüllü form da düşer", !/Brimstone/i.test(out3) && /smoke at sonra gir/.test(out3), `→ "${out3}"`);
}

console.log("\n[2] AJAN BİLİNİRKEN — metne DOKUNULMAZ (bayt-aynı)");
{
  const src = "Brimstone olarak smoke'larını girişten önce at.";
  const out = tr(src, gKnown());
  t("playerAgentKnown=true → aynen korunur", out === src, `→ "${out}"`);

  // Geriye-uyum: bayrak hiç verilmezse (mevcut çağıranlar/report route) guard kapalı
  const legacy = realityCheck(
    "Phoenix olarak kendi utilini kullanmadın.",
    [] as never,
    { hasKiller: true, killerAgent: "Skye" } as never,
    "death", "tr",
  ).text;
  t("bayrak undefined → guard kapalı (bayt-aynı)", legacy === "Phoenix olarak kendi utilini kullanmadın.", `→ "${legacy}"`);
}

console.log("\n[3] DÜŞMAN/KATİL CÜMLESİ HİÇBİR DURUMDA BOZULMAZ");
{
  const out = tr("Skye seni öldürdü, sonraki round o köşeyi önceden tut.", gUnknown());
  console.log("    SONRA:", out);
  t("'Skye seni öldürdü' aynen kaldı", /Skye seni öldürdü/.test(out), `→ "${out}"`);

  const out2 = tr("Phoenix olarak açıldın ve Skye seni öldürdü.", gUnknown());
  console.log("    SONRA:", out2);
  t("yakıştırma düştü, katil korundu", !/Phoenix/i.test(out2) && /Skye seni öldürdü/.test(out2), `→ "${out2}"`);
}

console.log("\n[4] EN — 'as <Agent>' düşer; 'such as Jett' (meşru örnekleme) MUAF");
{
  const out = en("As Jett, you dashed in without your team.", gUnknown());
  console.log("    SONRA:", out);
  t("'as Jett' silindi", !/Jett/i.test(out), `→ "${out}"`);
  t("cümle akıcı + büyük harf", /^You dashed in without your team\./.test(out), `→ "${out}"`);

  const out2 = en("You died playing as Jett without util.", gUnknown());
  console.log("    SONRA:", out2);
  t("cümle ortası 'as Jett' düşer", out2 === "You died playing without util.", `→ "${out2}"`);

  const src3 = "Duelists such as Jett punish that angle.";
  const out3 = en(src3, gUnknown());
  t("'such as Jett' korunur", out3 === src3, `→ "${out3}"`);

  const src4 = "As Reyna, keep your flash for the retake.";
  const out4 = en(src4, gKnown());
  t("EN'de de ajan bilinirken dokunulmaz", out4 === src4, `→ "${out4}"`);
}

console.log("\n[5] ENTEGRASYON — ajan boş + katil de yokken iki guard birlikte");
{
  // hasKiller:false → killer-absent guard "Reyna ... vurdu"yu "bir düşman"a
  // çevirir; bizim guard ondan ÖNCE "Phoenix olarak"ı düşürür (sıra kilidi:
  // aksi hâlde "bir düşman olarak ..." bozuğu üreyebilirdi).
  const out = tr(
    "Phoenix olarak açık alanda durdun ve Reyna seni vurdu.",
    { hasKiller: false, playerAgentKnown: false } as never,
  );
  console.log("    SONRA:", out);
  t("yakıştırma düştü", !/Phoenix/i.test(out), `→ "${out}"`);
  t("uydurma katil genelleştirildi", !/Reyna/i.test(out) && /bir düşman/i.test(out), `→ "${out}"`);
  t("'bir düşman olarak' bozuğu YOK", !/bir düşman olarak/i.test(out), `→ "${out}"`);
}

console.log(`\n${fail === 0 ? "TÜM TESTLER GEÇTİ ✓" : `${fail} TEST BAŞARISIZ ✗`}`);
process.exit(fail ? 1 : 0);
