/**
 * GÜVEN METNİ DÜRÜSTLÜĞÜ KİLİDİ — B11 / A101 (2026-09-24).
 *
 * KÖK (kanıtlı):
 *   - "Oyun dosyalarına dokunmaz" mutlak değildi. Desktop lib.rs
 *     fix_valorant_display_mode (oyun kapalıyken, kullanıcı "Tek tıkla ayarla"ya
 *     basınca) %LOCALAPPDATA%\VALORANT\Saved\Config\<hesap>\WindowsClient\
 *     GameUserSettings.ini'deki FullscreenMode=0 → 1 yazar ve yanına
 *     .ini.aimlo-bak kopyası bırakır. Web metni bunu söylemiyordu
 *     (guvenlik/page.tsx, PricingClient.tsx TR+EN, app/page.tsx TR+EN).
 *   - /guvenlik "İzleme tüm ekranı kapsar" diyordu; desktop capture.rs'de birincil
 *     yol pencere-hedefli WGC (CreateForWindow), DXGI/GDI yedeği Valorant rect'ine
 *     kırpılır, rect yoksa tam kare.
 *   - "Vanguard-güvenli / Safe with Vanguard / ban riski yoktur" kanıtlanamaz
 *     güvence; F44 (fb2ff1a) /guvenlik'te zaten "ban yemezsin garantisi
 *     vermiyoruz" diyor.
 *
 *   [1] Oyun-dosyası iddiası geçen HER metin birimi (JS dize / <li> / <p>) aynı
 *       birimde GameUserSettings.ini + .aimlo-bak + düğme adı istisnasını taşır;
 *       iddia birim dışına kaçmaz (sayım eşitliği).
 *   [2] Yasak (kanıtlanamaz / yanlış) iddialar kullanıcıya görünen app/**.tsx
 *       metninde (yorumlar hariç, app/api hariç) 0.
 *   [3] /guvenlik yakalama kapsamı koda göre + hassas-uygulama tavsiyesi KALDI.
 *   [4] TR+EN eşliği: fiyat SSS'i ve ana sayfa güven bloğu iki dilde de istisnalı.
 * RUN: npx tsx scripts/test-trust-copy.ts
 */
import fs from "node:fs";
import path from "node:path";

let fail = 0;
let pass = 0;
const t = (ad: string, kosul: boolean, detay = "") => {
  console.log(kosul ? `  ✅ ${ad}` : `  ❌ ${ad} ${detay}`);
  if (kosul) pass++;
  else fail++;
};

const ROOT = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/** Kaynak koddan yorumları at (JSX {/* *\/}, blok /* *\/, satır başı //). */
function stripComments(src: string): string {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\r?\n/)
    .filter((l) => !/^\s*\/\//.test(l))
    .join("\n");
}

/** JSX metnini görünen hâle getir: etiketler/ifade boşlukları atılır, varlıklar çözülür. */
function jsxText(s: string): string {
  return s
    .replace(/\{"\s*"\}/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Metin birimleri: önce <li>/<p> blokları, kalan kaynaktan JS dize sabitleri. */
function textUnits(src: string): { units: string[]; rest: string } {
  const code = stripComments(src);
  const units: string[] = [];
  const blockRe = /<(li|p)\b[^>]*>([\s\S]*?)<\/\1>/g;
  const withoutBlocks = code.replace(blockRe, (_m, _tag, inner: string) => {
    units.push(jsxText(inner));
    return " ";
  });
  const strRe = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`([^`]*)`/g;
  const rest = withoutBlocks.replace(strRe, (_m, a?: string, b?: string, c?: string) => {
    units.push(a ?? b ?? c ?? "");
    return " ";
  });
  return { units, rest };
}

// Oyun-dosyası iddiası (TR/EN). Türkçe-\b tuzağı yok: kalıp harf sınırına dayanmıyor.
const GAME_FILES_RE = /oyun(?:un)?\s+(?:kurulum\s+)?dosya|game(?:'s)?\s+(?:installation\s+)?files/giu;
const countMentions = (s: string) => (s.match(GAME_FILES_RE) ?? []).length;
const hasException = (u: string) =>
  u.includes("GameUserSettings.ini") &&
  u.includes(".aimlo-bak") &&
  (/Tek tıkla ayarla/u.test(u) || /Set it in one click/i.test(u));

const COPY_FILES = [
  "app/guvenlik/page.tsx",
  "app/fiyatlandirma/PricingClient.tsx",
  "app/page.tsx",
  "app/(auth)/register/RegisterForm.tsx",
];

console.log("\n[1] oyun-dosyası iddiası = aynı birimde GameUserSettings.ini istisnası");
for (const rel of COPY_FILES) {
  const src = read(rel);
  const { units, rest } = textUnits(src);
  const mentionUnits = units.filter((u) => countMentions(u) > 0);
  const bad = mentionUnits.filter((u) => !hasException(u));
  t(`${rel}: iddia geçen ${mentionUnits.length} birimin hepsi istisnalı`, bad.length === 0, JSON.stringify(bad));
  const total = countMentions(stripComments(src).replace(/&apos;/g, "'"));
  const inUnits = units.reduce((n, u) => n + countMentions(u), 0);
  t(`${rel}: iddia birim dışına kaçmıyor (toplam ${total} = birimlerde ${inUnits}, artık 0)`,
    total === inUnits && countMentions(rest) === 0, `rest=${countMentions(rest)}`);
}

console.log("\n[2] yasak iddialar — kullanıcıya görünen app/**/*.tsx (yorum + app/api hariç)");
function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (path.relative(ROOT, p).replace(/\\/g, "/") === "app/api") continue;
      walk(p, out);
    } else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}
const pages = walk(path.join(ROOT, "app"));
t(`app/**/*.tsx taraması boş değil (${pages.length} dosya)`, pages.length > 20);
const FORBIDDEN: [string, RegExp][] = [
  ["considered safe by Vanguard", /considered safe by Vanguard/i],
  ["güvenli kabul edilir", /güvenli kabul edilir/iu],
  ["Vanguard-güvenli / Vanguard-safe", /Vanguard[-\s]?(?:güvenli|safe)(?!\p{L})/iu],
  ["Safe with Vanguard / Vanguard ile güvenli", /Safe with Vanguard|Vanguard ile güvenli/iu],
  ["ban riski yok / no ban risk", /ban riski yok|no ban risk/iu],
  ["tüm ekranı / entire screen", /tüm ekranı|entire (?:primary )?(?:display|screen)/iu],
  ["api.openai.com (sayfa metninde)", /api\.openai\.com/i],
];
for (const [ad, re] of FORBIDDEN) {
  const hits = pages
    .filter((p) => {
      const code = stripComments(fs.readFileSync(p, "utf8"));
      // Hem ham (boşluk-daraltılmış) hem etiket-soyulmuş görünür metin: etiketle bölünen iddia da yakalanır.
      return re.test(code.replace(/\s+/g, " ")) || re.test(jsxText(code));
    })
    .map((p) => path.relative(ROOT, p).replace(/\\/g, "/"));
  t(`'${ad}' → 0`, hits.length === 0, JSON.stringify(hits));
}

console.log("\n[3] /guvenlik yakalama kapsamı koda göre");
const guv = jsxText(stripComments(read("app/guvenlik/page.tsx")));
t("öncelikle yalnızca Valorant penceresi (WGC)", /öncelikle yalnızca Valorant penceresini yakalar/u.test(guv));
t("yedek yol: ekran tabanlı + Valorant alanına kırpma + üstteki pencereler girebilir",
  /ekran tabanlı yakalamaya geçilir/u.test(guv) && /alanına kırpılır/u.test(guv) && /başka pencereler görüntüye girebilir/u.test(guv));
t("pencere yeri okunamazsa tam ekran (capture.rs rect-yok dalı) açıkça yazılı", /yeri okunamazsa ekranın tamamı işlenebilir/u.test(guv));
t("hassas uygulamaları kapatma tavsiyesi KALDI", /Tavsiye:/u.test(guv) && /hassas uygulamaları/u.test(guv));
t("F44 dürüstlük paragrafı KALDI (garanti yok)", /garantisi vermiyoruz/u.test(guv));

console.log("\n[4] TR+EN eşliği");
const exceptionUnits = (rel: string) => textUnits(read(rel)).units.filter(hasException);
const pr = exceptionUnits("app/fiyatlandirma/PricingClient.tsx");
t("fiyat SSS'i: TR ('Tek tıkla ayarla') + EN ('Set it in one click') istisnalı cevap",
  pr.some((u) => /Tek tıkla ayarla/u.test(u)) && pr.some((u) => /Set it in one click/.test(u)), JSON.stringify(pr.length));
const home = exceptionUnits("app/page.tsx");
t("ana sayfa güven bloğu: TR + EN istisnalı madde",
  home.some((u) => /Tek tıkla ayarla/u.test(u)) && home.some((u) => /Set it in one click/.test(u)), JSON.stringify(home.length));
const homeSrc = stripComments(read("app/page.tsx"));
t("ana sayfa güven başlığı konu başlığı (TR+EN), güvence değil",
  homeSrc.includes('"Vanguard ve hesap güvenliği"') && homeSrc.includes('"Vanguard & account safety"'));

console.log(`\n${fail === 0 ? "✅" : "❌"} test-trust-copy: ${pass} geçti, ${fail} kırık`);
if (fail > 0) process.exit(1);
