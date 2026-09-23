/** TR süzgeç yamalarının GERÇEK çıktılar üzerindeki etkisini ölçer.
 *  Model YENİDEN ÇAĞRILMAZ: kaydedilmiş `raw` alanları mevcut son-işlem
 *  zincirinden geçirilip kaydedilmiş `final` ile karşılaştırılır → fark
 *  YALNIZ süzgeç değişikliğinden gelir (model rastgeleliği yok, maliyet yok).
 *
 *  OLCUM-ARACI-08 (2026-09-23):
 *   • Zincir artık ELLE KOPYALANMAZ — prod ile AYNI fonksiyon
 *     (lib/vision-postprocess.ts:finalizeVisionFeedback). Eskiden dördüncü elle
 *     kopyalanmış zincirdi; her yeni halka yalnız bazı kopyalara ulaşıyordu.
 *   • Korpus yolu oturuma özel Temp klasörüne SABİT KODLUYDU (başka makinede
 *     yeniden üretilemezdi). Artık parametre: REPLAY_CORPUS_DIR = tr-cards*.json /
 *     tr-posters*.json dosyalarının klasörü. Bu korpuslar Riot kullanıcı adı
 *     içerebildiği için PII denetimi yapılmadan repoya KOPYALANMADI. Değişken
 *     yoksa o döngüler atlanır; gerçek-round korpusu (evals/real-rounds-23.json)
 *     repo içinde olduğundan her zaman koşar.
 *   • Örnek dosyaları (scripts/eval-out/*-samples.json) gitignore'da; eval-vision
 *     koşularıyla yeniden üretilir.
 *  RUN: REPLAY_CORPUS_DIR=<klasör> npx tsx scripts/replay-tr.ts */
import fs from "node:fs";
import path from "node:path";
import { finalizeVisionFeedback } from "../lib/vision-postprocess";
// B06 (OLCUM-ARACI-07, 2026-09-24): factGround + son-işlem seçenekleri route'un
// kurucusundan — eskiden burada elle ctx kuruluyordu (ham killerInfo, 3 ctx alanı,
// playerAgentKnown hiç set edilmiyor → reality-checker'ın ajan-boş guard'ı replay'de
// hiç açılmıyordu). Artık route/eval ile AYNI türetme.
import { buildVisionContext, visionPostprocessOpts, type VisionPromptBody } from "../lib/vision-prompt-builder";

const CORPUS_DIR = process.env.REPLAY_CORPUS_DIR || "";
const REPO_EVALS = path.join(process.cwd(), "evals");
/** [döngü, korpus dosyası, konum]: "ext" = REPLAY_CORPUS_DIR, "repo" = evals/. */
const PAIRS: [string, string, "ext" | "repo"][] = [
  ["cycletr-cards", "tr-cards.json", "ext"], ["cycletr-cards2", "tr-cards-2.json", "ext"],
  ["cycletr-cards3", "tr-cards-3.json", "ext"], ["cycletr-posters", "tr-posters.json", "ext"],
  ["cycletr-posters2", "tr-posters-2.json", "ext"], ["cycletr-posters3", "tr-posters-3.json", "ext"],
  ["cycletr-posters4", "tr-posters-4.json", "ext"], ["cycleab-base", "real-rounds-23.json", "repo"],
];

type S = { id: string; lang?: string; body: Record<string, unknown> };
function post(s: S, fb: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }) {
  const b = s.body;
  const lang = (s.lang === "en" || b.lang === "en" ? "en" : "tr") as "tr" | "en";
  const body = b as VisionPromptBody;
  const { factGround } = buildVisionContext(body, lang);
  return finalizeVisionFeedback(fb, visionPostprocessOpts(body, lang, factGround));
}

// Kabul ölçütü (plan §5): bu desenlerin HİÇBİRİ kalmamalı.
const BAD: [string, RegExp][] = [
  ["kelime-ortası kesme", /(^|[\s:;,(])(ktan sonra|ğ[a-zçğıöşü]{1,8}\s)/],
  ["yetim pencere eki", /Son\s['’]|kez['’][uü]n|round['’]un\s['’]/],
  ["yetim ek (genel)", /(^|\s)['’][ıiuü]n[dt][ae]n?\s/],
  ["apostroflu kadro", /kadro['’]/],
  ["apostroflu düşman", /bir düşman['’]/],
  ["fazlalık niteleme", /Rakip bir düşman/],
  // B03 (2026-09-23) kabul ölçütleri:
  // TR-KALAN-07 — deathAnalysis rapor etiketiyle açılıyor ("En kritik neden:", "Kök neden:").
  ["tanı-etiketi açılışı", /^\s*(?:en\s+kr[iİ]t[iİ]k|kök\s+neden|temel\s+neden|asıl\s+sorun|ana\s+hata|root\s+cause)[^:.]{0,24}:/iu],
  // TR-KALAN-09 — modelin harf düzeyinde bozduğu ajan adı (katil-guard'ını atlatıyordu).
  ["bozuk ajan adı", /(?<!\p{L})(?:Reına|Rejyna|Reğu|Reay|Cyclpher)(?!\p{L})/u],
];
// TR-KALAN-08 — SÜZGEÇ KESİĞİ: ham alan noktalamayla BİTİYOR ama son hâli bitmiyor
// (kapak cümleyi ortadan kesti). Ham metni zaten noktasız olan model üslubu sayılmaz.
const TERMINAL = /[.!?…]["'”’)\]]*$/;
type F = { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string };
const fieldPairs = (raw: F, fin: F): [string, string][] => [
  [raw.deathAnalysis, fin.deathAnalysis], [raw.nextRoundSuggestion, fin.nextRoundSuggestion],
  ...(raw.enemyAnalysis || []).slice(0, 2).map((r, i) => [r, (fin.enemyAnalysis || [])[i] ?? ""] as [string, string]),
];
const cutCount = (raw: F, fin: F) =>
  fieldPairs(raw, fin).filter(([r, f]) => !!f && TERMINAL.test(String(r).trim()) && !TERMINAL.test(f.trim())).length;
let cutBefore = 0, cutAfter = 0;
const texts = (o: { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string }) =>
  [o.deathAnalysis, ...(o.enemyAnalysis || []), o.nextRoundSuggestion].filter(Boolean);

let nScen = 0, nChanged = 0;
const before: Record<string, number> = {}, after: Record<string, number> = {};
const diffs: string[] = [];
for (const [cycle, corpusFile, where] of PAIRS) {
  const sf = `scripts/eval-out/${cycle}-samples.json`;
  if (!fs.existsSync(sf)) { console.log(`  · ${cycle}: örnek dosyası yok, atlandı`); continue; }
  const samples = JSON.parse(fs.readFileSync(sf, "utf8")) as { id: string; raw: never; final: never }[];
  if (where === "ext" && !CORPUS_DIR) { console.log(`  · ${cycle}: REPLAY_CORPUS_DIR tanımsız, atlandı`); continue; }
  const corpusPath = where === "ext" ? path.join(CORPUS_DIR, corpusFile) : path.join(REPO_EVALS, corpusFile);
  if (!fs.existsSync(corpusPath)) { console.log(`  · ${cycle}: korpus yok (${corpusPath}), atlandı`); continue; }
  const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8")) as S[];
  const byId = new Map(corpus.map((s) => [s.id, s]));
  for (const smp of samples) {
    const s = byId.get(smp.id);
    if (!s || !smp.raw) continue;
    nScen++;
    const oldF = smp.final as { deathAnalysis: string; enemyAnalysis: string[]; nextRoundSuggestion: string };
    const newF = post(s, smp.raw);
    cutBefore += cutCount(smp.raw as F, oldF);
    cutAfter += cutCount(smp.raw as F, newF);
    for (const [label, re] of BAD) {
      if (texts(oldF).some((t) => re.test(t))) before[label] = (before[label] || 0) + 1;
      if (texts(newF).some((t) => re.test(t))) after[label] = (after[label] || 0) + 1;
    }
    const ot = texts(oldF).join("\u0000"), nt = texts(newF).join("\u0000");
    if (ot !== nt) {
      nChanged++;
      const a = texts(oldF), b2 = texts(newF);
      for (let i = 0; i < Math.max(a.length, b2.length); i++) {
        if (a[i] !== b2[i]) diffs.push(`[${cycle}/${smp.id}#${i}]\n   ESKİ: ${a[i] ?? "(yok)"}\n   YENİ: ${b2[i] ?? "(yok)"}`);
      }
    }
  }
}
console.log(`\nSenaryo: ${nScen} · metni DEĞİŞEN senaryo: ${nChanged}\n`);
console.log("KABUL ÖLÇÜTÜ (senaryo sayısı, 0 olmalı):");
let bad = 0;
for (const [label] of BAD) {
  const b = before[label] || 0, a = after[label] || 0;
  if (a > 0) bad++;
  console.log(`  ${a === 0 ? "✓" : "✗"} ${label.padEnd(22)} önce ${String(b).padStart(2)} → sonra ${String(a).padStart(2)}`);
}
console.log(`  ${cutAfter === 0 ? "✓" : "✗"} ${"süzgeç kesiği (alan)".padEnd(22)} önce ${String(cutBefore).padStart(2)} → sonra ${String(cutAfter).padStart(2)}`);
if (cutAfter > 0) bad++;
fs.writeFileSync("scripts/eval-out/replay-tr-diff.txt", diffs.join("\n\n"), "utf8");
console.log(`\nTam fark dökümü: scripts/eval-out/replay-tr-diff.txt (${diffs.length} alan)`);
process.exit(bad ? 1 : 0);
