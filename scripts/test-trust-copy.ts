/**
 * GÜVEN METNİ DÜRÜSTLÜĞÜ KİLİDİ — B11 / A101 (2026-09-24).
 *
 * KÖK (kanıtlı):
 *   - "Oyun dosyalarına dokunmaz" mutlak değildi. Desktop lib.rs
 *     fix_valorant_display_mode (oyun kapalıyken, kullanıcı "Tek tıkla ayarla"ya
 *     basınca) %LOCALAPPDATA%\VALORANT\Saved\Config\<hesap>\WindowsClient\
 *     GameUserSettings.ini'deki FullscreenMode=0 → 1 yazar ve yanına
 *     .ini.aimlo-bak kopyası bırakır. Web metni bunu söylemiyordu
 *     (guvenlik/page.tsx, PricingClient.tsx TR+EN, ana sayfa TR+EN — bugün app/LandingClient.tsx).
 *   - /guvenlik "İzleme tüm ekranı kapsar" diyordu; desktop capture.rs'de birincil
 *     yol pencere-hedefli WGC (CreateForWindow), DXGI/GDI yedeği Valorant rect'ine
 *     kırpılır, rect yoksa tam kare.
 *   - "Vanguard-güvenli / Safe with Vanguard / ban riski yoktur" kanıtlanamaz
 *     güvence; F44 (fb2ff1a) /guvenlik'te zaten "ban yemezsin garantisi
 *     vermiyoruz" diyor.
 *
 *   [1] Oyun-dosyası iddiası geçen HER metin birimi (JS dize / <li> / <p>) aynı
 *       birimde GameUserSettings.ini + .aimlo-bak + düğme çekirdeği istisnasını
 *       taşır; iddia birim dışına kaçmaz (sayım eşitliği). Kapsam: app/**.tsx'in
 *       TAMAMI (B11 inceleme: sabit 4 dosya /legal/terms'ü kaçırıyordu).
 *   [2] Yasak (kanıtlanamaz / yanlış) iddialar kullanıcıya görünen app/**.tsx
 *       metninde (yorumlar hariç, app/api hariç) 0.
 *   [3] /guvenlik yakalama kapsamı koda göre + hassas-uygulama tavsiyesi KALDI;
 *       bellek iddiası tekrarlanmaz.
 *   [3b] Kaynak düzeyi JSX boşluk kilidi ("</strong>\n  yakalar" → boşluksuz render).
 *   [4] TR+EN eşliği: fiyat SSS'i ve ana sayfa güven bloğu iki dilde de istisnalı;
 *       istisna bu PC'deki TÜM Valorant hesaplarını söyler (lib.rs read_dir döngüsü).
 *   [5] F15: kaynaksız sosyal kanıt yok — "gerçek geri bildirim" etiketi, ölçülemez
 *       "%NN daha iyi", yorum kartı ve sahte platform istatistiği (landingStats).
 *   [6] F91: ürün yeteneği / beta durumu koda göre — "düşman pozisyon", "kapalı
 *       beta", "sınırlı davetli" yok; landing beta cümlesi FREE_TIER_ENFORCED'a bağlı.
 *   [7] F49: KVKK/Gizlilik olgusal içerik — veri sorumlusu lib/seller.ts'ten, ekran
 *       görüntüsü/destek/telemetri kategorileri, Upstash + Vercel Analytics alıcıları,
 *       "sadece prompt verisi" yok. Hukuki unsurlar kilitlenmez (hukukçu taslağı).
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
// Düğme ÇEKİRDEĞİ (B11 inceleme, 2026-09-24): masaüstünde aynı INI yazmasını yapan 3
// etiket var (App.tsx "Tek tıkla ayarla", "Tek tıkla Pencereli Tam Ekran'a geçir",
// fseDetected "TEK TIKLA …" / "Set it in one click", "One-click switch …"). Metin tek
// bir etikete kilitlenmez; "tek tık…" / "one-click / in one click" çekirdeği aranır.
const TR_BUTTON_RE = /tek[\s-]?tık/iu;
const EN_BUTTON_RE = /one-click|in one click/i;
const hasException = (u: string) =>
  u.includes("GameUserSettings.ini") &&
  u.includes(".aimlo-bak") &&
  (TR_BUTTON_RE.test(u) || EN_BUTTON_RE.test(u));

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
const relOf = (p: string) => path.relative(ROOT, p).replace(/\\/g, "/");
// Landing gövdesi: F91 (2026-09-24) sonrası app/LandingClient.tsx; app/page.tsx yalnız
// bayrağı sunucuda okuyan ince sarmalayıcı. Dosya yoksa (eski düzen) app/page.tsx'e
// düşülür ki kilitler çökmeden KIRMIZI dönsün (fix-olmadan kanıtı).
const LANDING = fs.existsSync(path.join(ROOT, "app/LandingClient.tsx")) ? "app/LandingClient.tsx" : "app/page.tsx";

// [1] SABİT LİSTE DEĞİL, TÜM SAYFALAR (B11 inceleme, 2026-09-24): eski sabit 4 dosyalık
// COPY_FILES /legal/terms §5'teki çok satırlı mutlak iddiayı ("oyun\n dosyalarına …
// müdahale etmez") hiç taramıyordu. Birim ayrıştırıcı çok satırlı JSX'i zaten doğru
// okuyor; yalnız kapsam dardı.
console.log("\n[1] oyun-dosyası iddiası = aynı birimde GameUserSettings.ini istisnası (app/**/*.tsx, app/api hariç)");
t(`app/**/*.tsx taraması boş değil (${pages.length} dosya)`, pages.length > 20);
const mentionFiles: string[] = [];
for (const p of pages) {
  const rel = relOf(p);
  const src = fs.readFileSync(p, "utf8");
  const total = countMentions(stripComments(src).replace(/&apos;/g, "'"));
  if (total === 0) continue;
  mentionFiles.push(rel);
  const { units, rest } = textUnits(src);
  const mentionUnits = units.filter((u) => countMentions(u) > 0);
  const bad = mentionUnits.filter((u) => !hasException(u));
  t(`${rel}: iddia geçen ${mentionUnits.length} birimin hepsi istisnalı`, bad.length === 0, JSON.stringify(bad));
  const inUnits = units.reduce((n, u) => n + countMentions(u), 0);
  t(`${rel}: iddia birim dışına kaçmıyor (toplam ${total} = birimlerde ${inUnits}, artık 0)`,
    total === inUnits && countMentions(rest) === 0, `rest=${countMentions(rest)}`);
}
t(`iddia geçen dosyalar bilinen 4 sayfa (guvenlik, fiyat, ana sayfa, koşullar) — ${mentionFiles.length} dosya`,
  ["app/guvenlik/page.tsx", "app/fiyatlandirma/PricingClient.tsx", LANDING, "app/legal/terms/page.tsx"]
    .every((f) => mentionFiles.includes(f)), JSON.stringify(mentionFiles));

console.log("\n[2] yasak iddialar — kullanıcıya görünen app/**/*.tsx (yorum + app/api hariç)");
const FORBIDDEN: [string, RegExp][] = [
  ["considered safe by Vanguard", /considered safe by Vanguard/i],
  ["güvenli kabul edilir", /güvenli kabul edilir/iu],
  ["Vanguard-güvenli / Vanguard-safe", /Vanguard[-\s]?(?:güvenli|safe)(?!\p{L})/iu],
  // B11 inceleme: araya kelime giren biçim ("Vanguard ile tamamen güvenlidir") eski
  // kalıplardan kaçıyordu. "Vanguard ve hesap güvenliği" (konu başlığı) eşleşmez:
  // iki ara sözcük + "güvenliği" ≠ güvenli(dir).
  ["Vanguard (ile/with) <söz> güvenli(dir)/safe", /Vanguard\s+(?:ile\s+|with\s+)?(?:\p{L}+\s+)?(?:güvenli(?:dir)?|safe)(?!\p{L})/iu],
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
// B11 inceleme: bellek iddiası iki madde üst üste tekrarlanıyordu (":53 belleğine girmez"
// + ":55 kurulum dosyalarına, belleğine ve Vanguard'a dokunmaz").
t("bellek iddiası ('belleğine') sayfada TEK maddede (tekrar yok)",
  (guv.match(/belleğine/gu) ?? []).length === 1, String((guv.match(/belleğine/gu) ?? []).length));

console.log("\n[3b] JSX kaynak boşluğu — kapanan satır-içi etiketten sonra satır sonu + harf YOK");
// jsxText() boşlukları daralttığı için "</strong>\n  yakalar" → React çıktısı
// "penceresiniyakalar" hatası metin testinde görünmüyordu (B11 commit sapması (c)).
// Kaynak düzeyi kilit: iddia taşıyan sayfalar + /guvenlik. Ölçüm (2026-09-24):
// app/**/*.tsx'in TAMAMINDA bu kalıp 0 → kilit yanlış-pozitif üretmiyor.
const JSX_GAP_RE = /<\/(?:strong|em|b|i|a|span|code|Link)>[ \t]*\r?\n[ \t]*\p{L}/gu;
for (const rel of [...new Set([...mentionFiles, "app/guvenlik/page.tsx"])]) {
  const hits = stripComments(read(rel)).match(JSX_GAP_RE) ?? [];
  t(`${rel}: '</strong>' + satır sonu + harf (boşluksuz render) 0`, hits.length === 0, JSON.stringify(hits));
}

console.log("\n[4] TR+EN eşliği");
const exceptionUnits = (rel: string) => textUnits(read(rel)).units.filter(hasException);
// Yazma bu PC'deki HER hesap klasörüne (desktop lib.rs read_dir döngüsü) → istisna metni
// tekil "kullanıcı ayar dosyası" demez (B11 inceleme).
const TR_ALL_ACCOUNTS = /bu bilgisayardaki Valorant hesaplarının/u;
const EN_ALL_ACCOUNTS = /Valorant accounts on this PC/;
const pr = exceptionUnits("app/fiyatlandirma/PricingClient.tsx");
t("fiyat SSS'i: TR + EN istisnalı cevap (düğme çekirdeği + tüm hesaplar)",
  pr.some((u) => TR_BUTTON_RE.test(u) && TR_ALL_ACCOUNTS.test(u)) && pr.some((u) => EN_BUTTON_RE.test(u) && EN_ALL_ACCOUNTS.test(u)),
  JSON.stringify(pr.length));
const home = exceptionUnits(LANDING);
t("ana sayfa güven bloğu: TR + EN istisnalı madde (düğme çekirdeği + tüm hesaplar)",
  home.some((u) => TR_BUTTON_RE.test(u) && TR_ALL_ACCOUNTS.test(u)) && home.some((u) => EN_BUTTON_RE.test(u) && EN_ALL_ACCOUNTS.test(u)),
  JSON.stringify(home.length));
const trOnly = ["app/guvenlik/page.tsx", "app/legal/terms/page.tsx"].flatMap(exceptionUnits);
t("/guvenlik + /legal/terms (yalnız TR sayfalar): her istisna birimi tüm hesapları söyler",
  trOnly.length >= 3 && trOnly.every((u) => TR_ALL_ACCOUNTS.test(u)), JSON.stringify(trOnly.filter((u) => !TR_ALL_ACCOUNTS.test(u))));
t("hiçbir istisna birimi tekil 'kullanıcı ayar dosyası' / 'user settings file' demez",
  mentionFiles.flatMap(exceptionUnits).every((u) => !/kullanıcı ayar dosyası|user settings file/iu.test(u)));
const homeSrc = stripComments(read(LANDING));
t("ana sayfa güven başlığı konu başlığı (TR+EN), güvence değil",
  homeSrc.includes('"Vanguard ve hesap güvenliği"') && homeSrc.includes('"Vanguard & account safety"'));

// [5] F15 (2026-09-24): landing'deki "Oyuncular Ne Diyor?" bölümü a2a8e16'da yer
// tutucuların yerine yazılmış üç "gerçekçi" karttı ("Real feedback from beta
// players" etiketiyle); kaynak kaydı (izinli mesaj/ticket) yok. Ölü landingStats
// ("500+ Aktif Oyuncu", "94% Memnuniyet") de istemci paketine giriyordu.
// Geri eklemek kaynak kaydı ister → metin geri gelirse bu kilit kırmızı döner.
// Ölçüm (2026-09-24, fix sonrası): SOURCE_CLAIMS app/**/*.tsx (yorum + app/api hariç)
// + constants/i18n.ts'te 0 isabet; LANDING_ONLY kalıpları yalnız landing + i18n'de
// aranır, çünkü "memnuniyeti" /legal/iade'de meşru (müşteri memnuniyeti).
console.log("\n[5] F15 — kaynaksız sosyal kanıt yok (yorum kartı, 'gerçek geri bildirim', ölçülemez yüzde, sahte istatistik)");
const visibleText = (rel: string) => {
  const code = stripComments(read(rel));
  return `${code.replace(/\s+/g, " ")}\n${jsxText(code)}`;
};
const SOURCE_CLAIMS: [string, RegExp][] = [
  ["'gerçek geri bildirim' / 'Real feedback'", /gerçek geri bildirim|real feedback/iu],
  ["'%NN daha iyi' / 'NN% better'", /%\s?\d+\s+daha\s+iyi|\d+\s?%\s+better/iu],
];
// FB02 inceleme (2026-09-25): hiç import edilmeyen constants/i18n.ts aynası SİLİNDİ (aşağıdaki [9]
// kilidi); kapsam artık yalnız kullanıcıya görünen app/**/*.tsx.
const claimScope = pages.map(relOf);
for (const [ad, re] of SOURCE_CLAIMS) {
  const hits = claimScope.filter((rel) => re.test(visibleText(rel)));
  t(`${ad} → 0 (app/**/*.tsx)`, hits.length === 0, JSON.stringify(hits));
}
const LANDING_FILES = [LANDING];
const LANDING_ONLY: [string, RegExp][] = [
  ["'Oyuncular Ne Diyor' / 'What Players Say' bölümü", /Oyuncular Ne Diyor|What Players Say/u],
  ["yorum kartı kalıbı (handle: \"@…\")", /handle:\s*["'`]@/u],
  // Hem düz metin ("500+ Aktif") hem sözlük biçimi ({ value: "500+", label: "Aktif Oyuncu" }).
  ["'500+ Aktif' / '500+ Active' istatistiği", /\d[\d.,]*[KkMm]?\+(?:["'`]\s*,\s*label:\s*["'`]|\s*)(?:Aktif|Active)/u],
  ["'Memnuniyet' / 'Satisfaction' istatistiği", /Memnuniyet|Satisfaction/u],
];
for (const [ad, re] of LANDING_ONLY) {
  const hits = LANDING_FILES.filter((rel) => re.test(visibleText(rel)));
  t(`${ad} → 0 (landing)`, hits.length === 0, JSON.stringify(hits));
}
t("ölü landingStats anahtarı yok (landing)",
  LANDING_FILES.every((rel) => !/landingStats/.test(stripComments(read(rel)))),
  JSON.stringify(LANDING_FILES.filter((rel) => /landingStats/.test(stripComments(read(rel))))));

// [6] F91 (2026-09-24): B11 taraması ürün yeteneği ve beta durumu iddialarını
// kapsamıyordu. Kök (kanıtlı): masaüstü/backend'de düşman konumunu ÖLÇEN alan yok
// (enemyPos/enemy_position grep 0; OCR-only sözleşmesi); kayıtta davet/allowlist
// kontrolü yok (register/actions.ts) ve /download kimliksiz; landing SSS'indeki
// "Beta süresince her şey sınırsız" cümlesi FREE_TIER_ENFORCED'a bağlı değildi
// (fiyat sayfası B91'de bağlanmıştı: PricingPageBody.tsx).
// Ölçüm (fix sonrası): üç yasak kalıp app/**/*.tsx + constants/i18n.ts'te 0 isabet.
console.log("\n[6] F91 — ürün yeteneği ve beta durumu iddiaları koda göre");
const F91_FORBIDDEN: [string, RegExp][] = [
  ["'düşman pozisyon' / 'enemy position'", /düşman pozisyon|enemy position/iu],
  ["'kapalı beta' / 'closed beta'", /kapalı beta|closed beta/iu],
  ["'sınırlı (sayıda) davetli'", /sınırlı\s+(?:sayıda\s+)?davetli/iu],
];
for (const [ad, re] of F91_FORBIDDEN) {
  const hits = claimScope.filter((rel) => re.test(visibleText(rel)));
  t(`${ad} → 0 (app/**/*.tsx)`, hits.length === 0, JSON.stringify(hits));
}
const landingCode = stripComments(read(LANDING));
t("SSS 'Nasıl çalışıyor?' ölçülen olguları söyler (TR+EN: ölüm yeri, skor, round sonucu, öldüren ajan)",
  landingCode.includes("ölüm yerini, skoru, round sonucunu ve seni öldüren ajanı ekrandan okur") &&
    landingCode.includes("death location, the score, the round result and the agent that killed you"));
// Beta cümlesi YALNIZ betaNote alanında ve render bayrağa bağlı. Toplam = betaNote
// sayısı → cümle SSS cevabına ya da başka bir metne koşulsuz kopyalanamaz.
const BETA_RE = /Beta süresince|during the beta/giu;
const betaTotal = (landingCode.match(BETA_RE) ?? []).length;
const betaInNote = (landingCode.match(/betaNote:\s*"[^"\n]*(?:Beta süresince|during the beta)/giu) ?? []).length;
t("landing beta cümlesi yalnız betaNote alanında (TR+EN, SSS cevabına gömülü değil)",
  betaTotal === 2 && betaInNote === 2, `toplam=${betaTotal} betaNote=${betaInNote}`);
t("betaNote render'ı bayrağa bağlı (faq.betaNote && !quotaEnforced)",
  /faq\.betaNote\s*&&\s*!quotaEnforced/.test(landingCode));
const wrapper = stripComments(read("app/page.tsx"));
t("app/page.tsx sunucu sarmalayıcısı: 'use client' YOK, bayrak lib/flags isFreeTierEnforced() (kota kapısıyla tek kaynak), prop geçişi",
  !/^\s*["']use client["']/.test(wrapper) &&
    /import\s*\{\s*isFreeTierEnforced\s*\}\s*from\s*["']@\/lib\/flags["']/.test(wrapper) &&
    /quotaEnforced\s*=\s*isFreeTierEnforced\(\)/.test(wrapper) &&
    /<LandingClient\s+quotaEnforced=\{quotaEnforced\}/.test(wrapper));
// FB02 inceleme · B9 ayna (2026-09-25): `process.env.FREE_TIER_ENFORCED === "true"` dört
// yerde literal kopyaydı (lib/entitlements.ts, PricingPageBody.tsx, app/page.tsx,
// lib/admin-infra.ts); kilit yalnız landing literal'ini görüyordu → kapı kuralı değişirse
// pazarlama metni ayrışırdı (F91 sınıfı). Artık kural YALNIZ lib/flags.ts'te (sıfır import).
{
  const libDir = path.join(ROOT, "lib");
  const walkTs = (dir: string, out: string[] = []): string[] => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walkTs(p, out);
      else if (/\.tsx?$/.test(e.name)) out.push(p);
    }
    return out;
  };
  const scope = [...walkTs(path.join(ROOT, "app")), ...walkTs(libDir)].map(relOf);
  const FLAG_LITERAL = /process\.env\.FREE_TIER_ENFORCED\s*===/;
  const literalHits = scope.filter((rel) => FLAG_LITERAL.test(stripComments(read(rel))));
  t("FREE_TIER_ENFORCED kuralı YALNIZ lib/flags.ts'te (app/** + lib/** literal kopyası yok)",
    JSON.stringify(literalHits) === JSON.stringify(["lib/flags.ts"]), JSON.stringify(literalHits));
  const flagsSrc = stripComments(read("lib/flags.ts"));
  t("lib/flags.ts sıfır import (halka açık sayfalar service-role zincirine bağlanmaz)",
    !/^\s*import\b/m.test(flagsSrc) && !/\brequire\(/.test(flagsSrc));
  const readers: [string, RegExp][] = [
    ["lib/entitlements.ts", /from\s*["']\.\/flags["']/],
    ["app/fiyatlandirma/PricingPageBody.tsx", /from\s*["']@\/lib\/flags["']/],
    ["app/page.tsx", /from\s*["']@\/lib\/flags["']/],
    ["lib/admin-infra.ts", /from\s*["']\.\/flags["']/],
  ];
  const missing = readers.filter(([rel, re]) => !(re.test(read(rel)) && /isFreeTierEnforced/.test(stripComments(read(rel))))).map(([rel]) => rel);
  t("kota kapısı, fiyat sayfası, landing ve /admin/altyapi bayrağı lib/flags'tan okuyor", missing.length === 0, JSON.stringify(missing));
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const flags = require(path.join(ROOT, "lib/flags")) as { isFreeTierEnforced: () => boolean };
  const env = process.env as Record<string, string | undefined>;
  const prev = env.FREE_TIER_ENFORCED;
  const at = (v: string | undefined) => { if (v === undefined) delete env.FREE_TIER_ENFORCED; else env.FREE_TIER_ENFORCED = v; return flags.isFreeTierEnforced(); };
  const res = [at(undefined), at("1"), at("TRUE"), at("true")];
  if (prev === undefined) delete env.FREE_TIER_ENFORCED; else env.FREE_TIER_ENFORCED = prev;
  t("isFreeTierEnforced: yok/'1'/'TRUE' kapalı, yalnız 'true' açık (eski literal kuralla aynı)",
    JSON.stringify(res) === JSON.stringify([false, false, false, true]), JSON.stringify(res));
}
t("/guvenlik beta bölümü olgu: herkes kayıt olup indirebilir + geri bildirim kanalı",
  /Herkes kayıt olup uygulamayı/u.test(guv) && /aimlo\.gg\/download/.test(guv) &&
    /Destek ekranından/u.test(guv) && /support@aimlo\.gg/.test(guv));

// [7] F49 (2026-09-24): KVKK/Gizlilik metninde OLGUSAL eksikler — veri sorumlusu
// "AIMLO platformu" (kişi değil; kimlik lib/seller.ts'te duruyordu), ekran
// görüntüsünün OpenAI'ye gittiği yazmıyordu (vision/route.ts buildUserContent),
// Gizlilik "OpenAI (sadece prompt verisi)" diyordu, Upstash (lib/api-auth.ts,
// lib/auth-rate-limit.ts) ve Vercel Analytics/Speed Insights (app/layout.tsx) alıcı
// listesinde yoktu. Hukuki unsurlar (md.10 hukuki sebep ve toplama yöntemi, md.9
// dayanağı, saklama süreleri) KİLİTLENMEZ — hukukçu taslağında
// (docs/legal/KVKK-HUKUKCU-TASLAGI.md), softi + hukukçu onayı bekliyor.
console.log("\n[7] F49 — KVKK/Gizlilik olgusal içerik koda göre");
{
  const kvkkRaw = read("app/legal/kvkk/page.tsx");
  const kvkk = jsxText(stripComments(kvkkRaw));
  t("KVKK: veri sorumlusu lib/seller.ts'ten okunur (import + tradeName/address/taxOffice/taxNumber/email)",
    /import\s*\{\s*SELLER\s*\}\s*from\s*["']@\/lib\/seller["']/.test(kvkkRaw) &&
      ["tradeName", "address", "taxOffice", "taxNumber", "email"].every((k) => kvkkRaw.includes(`SELLER.${k}`)));
  t("KVKK: künye KOPYALANMAMIŞ (VKN / unvan literal olarak sayfada yok)",
    !kvkkRaw.includes("4271175312") && !/ADİ ORTAKLIĞI/u.test(kvkkRaw));
  t("KVKK: 'AIMLO platformu … veri sorumlusudur' (kişi olmayan sorumlu) yok", !/AIMLO platformu/u.test(kvkk));
  t("KVKK: ekran görüntüsü kategorisi — yalnız ölünen round, OpenAI (ABD), AIMLO'da kaydedilmez",
    /Ekran görüntüsü:/u.test(kvkk) && /öldüğünüz round'da/u.test(kvkk) && /OpenAI'ye \(ABD\)/u.test(kvkk) &&
      /AIMLO sunucularında kaydedilmez/u.test(kvkk));
  t("KVKK: destek mesajları + SHA-256 özetli telemetri kategorileri",
    /Destek mesajları:/u.test(kvkk) && /SHA-256/.test(kvkk));
  t("KVKK: alıcılarda Upstash + Vercel Analytics/Speed Insights",
    /Upstash/.test(kvkk) && /Vercel Analytics/.test(kvkk) && /Speed Insights/.test(kvkk));
  const priv = jsxText(stripComments(read("app/legal/privacy/page.tsx")));
  t("Gizlilik: 'sadece prompt verisi' YOK", !/sadece prompt verisi/iu.test(priv));
  t("Gizlilik: OpenAI satırı ekran görüntüsü (yalnız ölünen round) + round verisi + AIMLO saklamaz",
    /OpenAI \(AI işleme — ekran görüntüsü \(yalnızca ölünen round'da\) \+ round verisi; AIMLO saklamaz\)/u.test(priv));
  t("Gizlilik: Upstash üçüncü taraf listesinde", /Upstash/.test(priv));
  // FB02 inceleme · F49 (2026-09-25): telemetri kalemi yalnız "süreler, hata kodları,
  // uygulama sürümü" diyordu; oysa lib/telemetry-types.ts app_open, login_ok,
  // watch_started, watch_stopped (sebep kodu), match_completed ve watch_health (round +
  // skor) olaylarını kabul ediyor, lib/admin-telemetry.ts countFunnel bunları kullanıcı
  // hunisi olarak okuyor. Kilit: metin kullanım olaylarını söylüyor VE her olay tipi
  // gerçekten kabul ediliyor (tip kaldırılırsa metin yeniden gözden geçirilsin).
  const telKvkk = kvkk.slice(kvkk.indexOf("Teknik telemetri:"), kvkk.indexOf("Teknik telemetri:") + 400);
  const telPriv = priv.slice(priv.indexOf("Teknik telemetri:"), priv.indexOf("Teknik telemetri:") + 300);
  const USAGE_TR = [/kullanım olayları/u, /uygulama açılışı/u, /giriş/u, /başlatıl|başlatma/u, /durdurul|durdurma/u, /maç\s+tamamlanması/u, /round/u];
  t("KVKK telemetri kalemi kullanım olaylarını + izleme sağlığını (round, skor) söyler",
    USAGE_TR.every((re) => re.test(telKvkk)) && /sebebi/u.test(telKvkk) && /skor/u.test(telKvkk), telKvkk.slice(0, 200));
  t("Gizlilik telemetri kalemi kullanım olaylarını söyler",
    USAGE_TR.every((re) => re.test(telPriv)), telPriv.slice(0, 200));
  const typesSrc = read("lib/telemetry-types.ts");
  const acceptedList = typesSrc.slice(typesSrc.indexOf("export const TELEMETRY_EVENT_TYPES"));
  t("metnin andığı olaylar backend'de gerçekten kabul ediliyor (app_open/login_ok/watch_started/watch_stopped/match_completed/watch_health)",
    ["app_open", "login_ok", "watch_started", "watch_stopped", "match_completed", "watch_health"].every((k) => acceptedList.includes(`"${k}"`)));
}

// [8] Yakınsama Y08 (2026-09-25): landing SSS "Verilerim güvende mi?" cevabı
// "yalnızca senin hesabın tarafından görüntülenebilir" / "only viewable by your own
// account", Gizlilik "Row Level Security ile sadece sahibine açılır" diyordu. Oysa
// service-role ile çalışan /admin paneli (lib/admin-data.ts getUserDetail: e-posta,
// analyses summary/weakness/raw_result_json, player_memory; app/admin/users/[userId])
// ve /admin/insights (lib/admin-analytics.ts match_events) bu verileri yetkili
// yöneticiye gösteriyor. RLS KULLANICILAR ARASI izolasyondur; vaat buna çekildi.
// Ölçüm (fix sonrası): üç kalıp app/**/*.tsx + constants/i18n.ts'te 0 isabet.
console.log("\n[8] Y08 — veri erişimi vaadi olguya göre (RLS kullanıcılar arası; yetkili yönetici erişimi açık)");
{
  const Y08_FORBIDDEN: [string, RegExp][] = [
    ["'yalnızca senin hesabın tarafından'", /yalnızca\s+senin\s+hesabın\s+tarafından/iu],
    ["'only viewable by your own account'", /only\s+viewable\s+by\s+your\s+own\s+account/iu],
    ["'sadece sahibine açılır'", /sadece\s+sahibine\s+açılır/iu],
  ];
  for (const [ad, re] of Y08_FORBIDDEN) {
    const hits = claimScope.filter((rel) => re.test(visibleText(rel)));
    t(`${ad} → 0 (app/**/*.tsx)`, hits.length === 0, JSON.stringify(hits));
  }
  const land = visibleText(LANDING);
  t("landing SSS: TR + EN yetkili yönetici erişimini ve ekran görüntüsünün OpenAI'ye gidip AIMLO'da saklanmadığını söyler",
    /yalnızca yetkili AIMLO yöneticileri/u.test(land) && /Only authorized AIMLO administrators/.test(land) &&
      /OpenAI'ye gönderilir, AIMLO'da saklanmaz/u.test(land) && /not stored by AIMLO/.test(land));
  const privY08 = visibleText("app/legal/privacy/page.tsx");
  t("Gizlilik: RLS diğer kullanıcılara kapalı + yetkili yönetici erişimi",
    /diğer kullanıcılara kapalıdır/u.test(privY08) && /yetkili AIMLO yöneticileri/u.test(privY08));
}

// [9] FB02 inceleme (2026-09-25) — ölü ama pakete giren iddialar. F15 landingStats'ı "ölü ama
// istemci paketine giren sahte sayılar" gerekçesiyle sildi; aynı t objesinde render edilmeyen
// landingAbout*/landingB2B*/landingB2C* anahtarları olmayan bir ürünü anlatıyordu ("Espor
// organizasyonları için özel analiz panelleri, toplu oyuncu takibi", "Sadece 10$ ile başlayın" /
// "Start for just $10"). constants/i18n.ts hiç import edilmiyordu ama eski SSS'yi (koşulsuz
// "Beta süresince tüm özellikler sınırsız", "girdiğin kısa notları") taşıyan bir B9 aynasıydı.
// İkisi de silindi; bir anahtar yeniden bağlanırsa ya da ayna geri gelirse kilit kırmızı döner.
console.log("\n[9] FB02 inceleme — ölü landing anahtarları ve import edilmeyen i18n aynası yok");
{
  t("constants/i18n.ts yok (hiç import edilmeyen eski SSS aynası)", !fs.existsSync(path.join(ROOT, "constants/i18n.ts")));
  const land = stripComments(read(LANDING));
  const DEAD = ["landingAboutTitle", "landingAboutText", "landingAboutMission", "landingB2BTitle", "landingB2BText", "landingB2CTitle", "landingB2CText"];
  const still = DEAD.filter((k) => land.includes(k));
  t("landing t objesinde render edilmeyen About/B2B/B2C anahtarları yok", still.length === 0, JSON.stringify(still));
  t("'10$ ile başlayın' / 'Start for just $10' landing paketinde yok", !/10\$ ile başlayın|Start for just \$10/u.test(land));
}

console.log(`\n${fail === 0 ? "✅" : "❌"} test-trust-copy: ${pass} geçti, ${fail} kırık`);
if (fail > 0) process.exit(1);
