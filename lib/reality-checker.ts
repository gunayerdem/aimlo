/**
 * AIMLO Reality Checker
 * Validates AI output claims against actual round memory.
 * Runs AFTER AI generation, BEFORE response to user.
 * Deterministic — no extra AI calls.
 */

import { extractKillerWeapon } from "@/lib/comp-weapon";
import { mapKey, MAP_CALLOUTS, UNIVERSAL_CALLOUTS } from "@/lib/map-callouts";
// Denetim B83 (2026-07-31): katil ajanının RESMİ adı tek kaynaktan (format-display
// AGENT_NAMES tablosu) gelsin — reality-checker'ın kendi AGENT_NAMES listesi OCR
// garble'ları da ("Reay") içerdiği için TESPİT'te kullanılır, GERÇEK katil adı
// olarak yalnız tabloda KANITLI olan resmi ad yazılır.
import { knownAgent } from "@/lib/format-display";
// B2 (2026-09-16): Türkçe sayı eki TEK KAYNAK — prompt (lib/history-block.ts)
// ile süzgeç aynı tabloyu kullansın. Yaprak modül: hiçbir import'u yok →
// döngü yapısal olarak imkânsız.
import { trOrdinalLocative, trNumberLocative } from "@/lib/tr-suffix";
// FB05 · F14: ölçülen konumu Türkçe bulunma ekiyle yazmak için (tek kaynak). Yön
// reality-checker → coach-text; coach-text reality-checker'ı import etmez (döngü yok,
// landing bundle politikası etkilenmez).
import { trLocative } from "@/lib/coach-text";

// ── Types ──

interface RoundMemoryEntry {
  round_index: number;
  died: boolean;
  death_position?: string | null;
  position_confidence?: string;
}

interface ExtractedClaims {
  claimedCount: number | null;
  claimedWindow: number | null;
  claimedPosition: string | null;
  repetitionClaim: boolean;
  // TR-KALAN-14 (2026-09-23): pencere ROUND birimli mi ("son 10 round", "last 8
  // rounds")? Round hafızası yalnız bunu doğrulayabilir; "son 5 maç" maçlar arası
  // iddiadır (player-memory besliyor olabilir) → bilerek doğrulanmaz. Opsiyonel:
  // elle kurulan eski ExtractedClaims nesneleri tip-uyumlu kalır (undefined = false).
  claimedWindowIsRound?: boolean;
  // FB06 · F57 (2026-09-24): sayım iddiasına bağlı konum DOĞRUDAN koordineli bir listenin
  // son öğesiyse ("B Main/B Lobby'de 2 kez") listenin TÜM konumları (≥2 farklı). Sayım bu
  // konumların ölüm TOPLAMIYLA doğrulanır (claimedPosition = son öğe, konum bulma yolu için
  // aynen kalır). Opsiyonel: yalnız liste varken set edilir.
  claimedPositionList?: string[];
}

interface ValidationResult {
  countValid: boolean;
  positionValid: boolean;
  repetitionValid: boolean;
  actualCount: number;
  actualWindow: number;
  rewriteLevel: 1 | 2 | 3;
  // FB05 · F14: konum iddiası doğrulanırken EŞLEŞEN round'ların round_index'leri (pencere
  // içi, high/medium). Sayım silinirken geçmiş çapası bu round'la yazılır ("R2'de").
  // Opsiyonel: elle kurulan eski ValidationResult nesneleri tip-uyumlu kalır.
  matchedRounds?: number[];
  /** Hafızadaki round_index'ler tekil mi (değilse "R<n>" çapası yazılmaz). */
  roundIndexUnique?: boolean;
}

// ── Death-Data Contract (Ölüm-Veri Sözleşmesi 2026-06-29) ──
//
// Single ground-truth shape shared by BOTH the vision route AND the report
// route (built once via buildFactGround → no per-route drift). Each flag means
// "this fact was actually OBSERVED for this round" (OCR/desktop truth present).
// When a flag is false/absent, guardUnprovenFacts DETERMINISTICALLY removes any
// AI claim about that fact — the model can never assert an unobserved fact.
// When a flag is TRUE the corresponding guard NEVER touches the text (a correct
// killer/location/weapon is preserved verbatim). All optional → every existing
// caller (route/trade/killer/location/headshot only) stays type-compatible.
export interface FactGround {
  hasKiller?: boolean;        // killerInfo OCR present
  // Denetim B83 (2026-07-31): killerInfo'dan SÖZLÜK-BAĞLI çıkarılan GERÇEK katil
  // ajanı (varsa). hasKiller=true iken guardUnprovenFacts bunu kullanıp metindeki
  // YANLIŞ ajan adını düzeltir. Belirsizse (ajan sözlükte yok / iki farklı ad
  // geçiyor / maç-seviyesi rapor) undefined kalır → guard DOKUNMAZ.
  killerAgent?: string;
  hasWeapon?: boolean;        // killerInfo contains "with <weapon>" (enemy weapon parsed)
  hasDeathLocation?: boolean; // deathLocation OCR present
  hasDeathAngle?: boolean;    // deathAngle OCR present (NO guard — meşru "arkadan geldi")
  hasHeadshot?: boolean;      // headshot===true (desktop never sends → effectively always false)
  hasAliveCount?: boolean;    // alive counts RELIABLE (desktop can't distinguish 0-vs-unread → always false)
  hasSpike?: boolean;         // spike state RELIABLE (only set when true → can't tell false/absent → always false)
  // B1 (TR pipeline ölçümü 2026-09-16): hasSpike "spike DURUMU güvenilir mi"
  // sorusunu yanıtlar ve DAİMA false'tur — desktop spikePlanted'ı yalnız TRUE
  // iken gönderdiği için "kurulmadı" ile "okunamadı" ayrılamıyor. Ama
  // spikePlanted===true gelen ÖLÜM round'unda plant'in kurulduğu ÖLÇÜLMÜŞ bir
  // OLGUDUR: aynı değer lib/vision-prompt-builder.ts buildVisionContext (died kapısı
  // → ctx.spikePlanted) → buildVisionUserMessage ctx JSON'u zinciriyle modele
  // "[ROUND CONTEXT — OCR pixel truth]" başlığıyla zaten veriliyor (B06 sonrası atıf).
  //
  // ⚠ hasSpike'tan AYRI TUTULDU (ŞART): hasSpike'ı true yapmak buildFactSheet'i
  // de değiştirir — lib/vision-prompt.ts:55-58 `if (fg.hasSpike) known.push(...)
  // else unknown.push("spike durumu")` → olgu BİLİNMEYEN'den BİLİNEN'e geçer =
  // ÖLÇÜLMEMİŞ prompt değişikliği + A/B taban kayması. buildFactSheet bu alanı
  // OKUMAZ → prompt bayt-aynı kalır.
  spikeObservedPlanted?: boolean;
  // Denetim B35 (2026-07-31): düşmanın YETENEK/SETUP kullanımı OCR'da HİÇ okunmuyor
  // (payload'da yalnız killerInfo + roster + killfeed sırası var) → DAİMA false,
  // alive/spike ile aynı sözleşme. Masaüstü ileride yetenek-okuma gönderirse
  // buildFactGround'da true'ya çevrilir → guard susar.
  hasEnemyUtil?: boolean;
  hasTradeData?: boolean;     // tradedByAlly boolean present
  hasRoute?: boolean;         // playerRoute measured
  // Canlı-test #9 (2026-08-04): oyuncunun AJANI istekte okundu mu? Kanıt: maç
  // onaylanmadan atılan warmup AI çağrısında agent alanı BOŞTU ve model "Phoenix
  // olarak kendi utilini..." yazdı — oyuncu Brimstone'du. Maç ortasında agent-OCR
  // boş kalabildiği (bilinen ayrı desktop sorunu) için aynı uydurma o zaman
  // KULLANICIYA gider. false iken guardUnprovenFacts "<Ajan> olarak" (TR) /
  // "as <Agent>" (EN) OYUNCU-kendine-yakıştırma kalıplarını deterministik düşürür.
  // undefined = guard KAPALI → tüm mevcut çağıranlar (report route dahil,
  // buildFactGround bu alanı SET ETMEZ) bayt-aynı. Yalnız vision route, isteğin
  // agent alanı boş/Unknown olduğunda bayrağı false'a çeker.
  playerAgentKnown?: boolean;
  // W1 followup #51 (2026-09-24): oyuncunun OKUNMUŞ ajanı (resmî yazımla; bilinmiyorsa
  // undefined). Katil-guard STEP2 "<oyuncunun ajanı> olarak" öbeğini katil sanmasın diye
  // (bkz. guardUnprovenFacts STEP2). Set edenler: vision buildVisionContext ve (REV-W2,
  // 2026-09-24) rapor buildReportCleaner — ikisi de knownAgent ile, aynı kaynaktan.
  playerAgent?: string;
  // Masaüstünün OCR ile ölçtüğü ölüm yeri/yerleri (varsa). stripForeignCallouts
  // bunu HER ZAMAN meşru sayar — tablo eksik olsa bile ölçülen konumu silmez.
  // Vision route TEK round → string; report route TÜM round'ların konumları → string[]
  // (rapor ÖZETİ birçok round'un konumuna atıfta bulunur; hepsi korunmalı).
  deathLocation?: string | string[];
  // TR-KALAN-16 (2026-09-23) + B02 İNCELEME: BU round'un ölçülmüş konum(lar)ı
  // (deathLocation; düz toLowerCase) — guardUnprovenFacts'in konum-yokken döngüsü
  // bunlara KOŞULSUZ dokunmaz. realityCheck kendisi doldurur. İlk sürüm buraya
  // geçmiş round'ların konumlarını da koyuyordu → model geçmiş ölüm yerini bu
  // round'a yapıştırdığında ("Bu round yine B Main'de vuruldun") uydurma korunuyordu;
  // geçmiş artık ayrı alanda (historyLocations). Opsiyonel: doğrudan çağıranlar ve
  // rapor route'u bayt-aynı kalır (verilmezse muafiyet yok).
  measuredLocations?: string[];
  // Geçmiş round'ların ÖLÇÜLMÜŞ (died===true, position_confidence high/medium) ölüm
  // yerleri. Muafiyet şartı: aynı yan-cümlede konuma en yakın zaman çapası GEÇMİŞ
  // ("R2'de", "önceki round", "son 3 round'da", "earlier") olmalı; "bu round/şimdi/
  // this round" ya da hiç çapa yoksa muaf DEĞİL (historyAnchorAt; FB05 · F83: sayısal round
  // çapasında yalnız o round'un kaydı muaf tutar — historyMatchesAnchor).
  historyLocations?: string[];
  // FB05 · F83 (2026-09-24): geçmiş konumların ROUND'A GÖRE dizini (round_index → ölçülmüş
  // ölüm yeri; historyLocations ile AYNI süzgeç: died===true + high/medium). Konuma en yakın
  // geçmiş çapası SAYISAL bir round ise ("R3'te", "round 3", "3. round") muafiyeti yalnız
  // o round'un kaydı verir (historyMatchesAnchor). realityCheck kendisi doldurur; verilmezse
  // eski küme kuralı (doğrudan çağıranlar bayt-aynı).
  historyRoundLocations?: ReadonlyMap<number, string>;
}

// ── Claim Extraction ──

// B02 İNCELEME (2026-09-23): EN'in baskın sayım biçimi "N of the last M rounds"
// (korpusta 7 raw alan). Pencere sayısı (M) artık count sayılmadığı için (TR-KALAN-15)
// N hiçbir desene uymuyordu → "You died in 5 of the last 6 rounds" (1 ölüm) L1 ile
// geçiyordu. EN ÖNCE: aynı metinde "6 rounds" deseni N'den önce denenmesin.
// OLGU AŞILAMASI YASAĞI (TR_DEATH_MARKER emsali): yalnız ÖLÜM cümlesinde sayılır —
// "You went first in 3 of the last 4 rounds" giriş sayımıdır, ölüm sayısıyla
// "doğrulanıp" 3→2 yapılmamalı (korpus cycle3/E5 ölçümünde yakalandı).
const EN_OF_LAST_COUNT_RE = /(\d+)\s+(?:out\s+)?of\s+(?:the\s+|your\s+|my\s+)?(?:last|past|previous)\s+\d+/i;
/** Sayım iddiasının ÖLÜM iddiası olduğunu gösteren yüklem (TR + EN). */
const CLAIM_DEATH_MARKER =
  /öl(?!dür)(?:dü|üm|üyor|dün)|vurul|düştü|düşmüş|elendin|died|dies|dying|deaths?\b|killed\s+you|(?:got|were|was|been)\s+killed|shot\s+you|caught\s+you|went\s+down/iu;

// ── TR SAYIM ALTERNASYONU — TEK KAYNAK (FB06 · F57, 2026-09-24) ──────────────────
// KANIT: COUNT_PATTERNS yalnız rakam + kez/defa tanıyordu → extractClaims("B Main'de üç kez
// öldün") ve ("3 kere") claimedCount=null, metin bayt-aynı. Korpus cyclereal-r3d M1-R5 NR "B
// Main'de üç kez öldüğün kayıt var" (hafızada B Main ölümü YOK) kullanıcıya gidiyordu; aynı
// iddia "3 kez" yazılsa siliniyordu. TR ham çıktıların 94'ünde yazıyla sayı + birim var.
// ÇÖZÜM: aynı alternasyon çıkarımda (COUNT_PATTERNS) VE TR yeniden yazım desenlerinde
// (level-2 indirme/silme, level-3 silme, locateCountClaim) kullanılır — yalnız çıkarıma
// eklenseydi claimedCount dolar ama `${ct}\s*kez` deseni yazıyı görmediği için metin değişmezdi.
// ÖĞÜT KALKANI: yazıyla sayı YALNIZ ölüm yüklemli YAN-CÜMLEDE sayımdır ("bir kez daha dene",
// "A Main'i üç kez aynı açıdan verdin" sayım değil). Rakamlı biçimin eski davranışı aynen.
// "İki": "İ".toLowerCase() = "i\u0307" (i + U+0307) ve /i/iu "İ"yi tutmaz → [iİ]\u0307?.
const TR_COUNT_WORD_VALUE: Readonly<Record<string, number>> = {
  bir: 1, iki: 2, "üç": 3, "dört": 4, "beş": 5, "altı": 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10,
};
const trCountWordSrc = (w: string) => w.replace(/^i/, "[iİ]\\u0307?");
const TR_COUNT_NUM_ALT = "\\d+|" + Object.keys(TR_COUNT_WORD_VALUE).map(trCountWordSrc).join("|");
const TR_COUNT_UNIT_ALT = "(?:kez|defa|kere)";
/** Sayım belirteci → sayı ("3" → 3, "üç"/"Üç" → 3, "i\u0307ki" → 2); tanınmazsa NaN. */
function trCountValue(tok: string): number {
  if (/^\d+$/.test(tok)) return parseInt(tok, 10);
  return TR_COUNT_WORD_VALUE[tok.toLocaleLowerCase("tr-TR").replace(/\u0307/g, "")] ?? NaN;
}
/** ct sayısının metindeki biçimleri: rakam + (1-10 ise) sözcük → "(?:3|üç)". */
function trCountTokenSrc(ct: number): string {
  const w = Object.keys(TR_COUNT_WORD_VALUE).find((k) => TR_COUNT_WORD_VALUE[k] === ct);
  return w ? `(?:${ct}|${trCountWordSrc(w)})` : String(ct);
}
/** index'in YAN-CÜMLESİNDE ([.!?;:—\n] sınırlı) ölüm yüklemi var mı? (yazıyla sayı kalkanı) */
function deathClauseAt(text: string, index: number): boolean {
  let cs = index;
  while (cs > 0 && !/[.!?;:—\n]/.test(text[cs - 1])) cs--;
  let ce = index;
  while (ce < text.length && !/[.!?;:—\n]/.test(text[ce])) ce++;
  return CLAIM_DEATH_MARKER.test(text.slice(cs, ce));
}
/** Eşleşen sayım belirteci yazıyla mı ve ölüm yan-cümlesi DIŞINDA mı? (öyleyse dokunulmaz) */
function wordCountOutsideDeathClause(tok: string, full: string, offset: number): boolean {
  return !/^\d/.test(tok) && !deathClauseAt(full, offset);
}
/** TR sayım birimi (rakam | bir…on) + kez|defa|kere; 1. grup sayı. Sağda harf yok ("bir kerede"). */
const TR_COUNT_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${TR_COUNT_NUM_ALT})\\s*${TR_COUNT_UNIT_ALT}(?![\\p{L}])`, "iu");

const COUNT_PATTERNS = [
  EN_OF_LAST_COUNT_RE,
  // Turkish — FB06 · F57: rakam | bir…on + kez|defa|kere (TR_COUNT_RE; eskiden (\d+)\s*kez ve
  // (\d+)\s*defa ayrı iki desendi).
  TR_COUNT_RE,
  /(\d+)'[iu]nde/i,
  /(\d+)'[iu]nda/i,
  // TR-KALAN-15: kaynaştırmalı/ünlü uyumlu iç nicelik ("2'sinde", "6'sında",
  // "3'ünde") — eski iki desen yalnız "'inde/'unda"yı görüyordu, "Son 9 round'un
  // 2'sinde" bu yüzden pencereyi (9) sayı sanıyordu.
  /(\d+)['’][sşny]?[ıiuü]n[dt][ae]/i,
  // Multilingual
  /(\d+)\s*round/i,
  // English
  /(\d+)\s*times?/i,
  /(\d+)\s*deaths?/i,
  /(\d+)\s*rounds?\s*(in\s*a\s*row|straight|consecutive)/i,
  /(\d+)\s*matches?\s*in\s*a\s*row/i,
];

const WINDOW_PATTERNS = [
  // Turkish
  /son\s+(\d+)\s*round/i,
  /son\s+(\d+)\s*maç/i,
  // "son 3 kez B Main'de öldün" = SON ÜÇ SEFER (sayım iddiası), pencere DEĞİL —
  // pencere sayılınca sayım yalnız son 3 round'da aranıp yanlış doğrulanıyordu.
  // FB06 · F57: "kere" de sayım birimi (TR_COUNT_RE ile aynı birim kümesi).
  /son\s+(\d+)(?!\d)(?!\s*(?:kez|defa|kere))/i,
  // English
  /last\s+(\d+)\s*rounds?/i,
  /last\s+(\d+)\s*matches?/i,
  /past\s+(\d+)\s*rounds?/i,
  /over\s+the\s+last\s+(\d+)/i,
];

// ── ORTAK DİKİŞ ONARIMI (B1 + B2, 2026-09-16) ─────────────────────────────
//
// İki guard da artık metinden bir yan-cümle SİLEBİLİYOR; silinen parçanın
// bıraktığı enkaz (çift boşluk, öksüz virgül/bağlaç, çift nokta, küçük harfle
// başlayan metin) TEK yerde onarılır. YALNIZ guard metne GERÇEKTEN dokunduysa
// çağrılır → dokunulmamış metin bayt-aynı kalır (ev deseni: reality-checker.ts:
// 662-668 `if (result !== before)` kapısı).
//
// SIRA KRİTİK: öksüz bağlaç ÖNCE sökülür, SONRA büyük harfe çevrilir. Tersi
// ölçülmüş bir regresyon üretiyordu: "Ve sen açıkta kaldın." — büyütülen "Ve",
// lib/coach-text.ts:48'deki (`i` bayrağı OLMAYAN, yalnız küçük harfli "ve"/"ile"
// gören) öksüz-bağlaç temizliğini KÖR EDİYOR ve bozuk cümle kullanıcıya gidiyor.
// Bağlaç deseni oradaki kuralın BİREBİR aynısıdır (ev üslubu).
//
// BÜYÜTME: metin başı DAİMA; metin-İÇİ yalnız guard'ın YENİ doğurduğu cümle
// başında (TR-KALAN-11, 2026-09-23). Global `(^|[.!?]\s+)([a-zçğıöşü])` formu
// ölçülmüş bir yanlış-pozitif üretiyordu ("Spike kuruldu. vb. açıyı erken tut." →
// "Vb. Açıyı erken tut." — "Açıyı" cümle ORTASINDA büyüyor). Kapı: aynı küçük
// harfli devam `before` (guard öncesi metin) içinde de bir [.!?] + boşluktan
// sonra geçiyorsa o küçük harf ÖNCEDEN VARDI → dokunulmaz ("vb. açıyı"). Yoksa
// silme onu cümle başına taşımıştır → büyütülür ("aldın. sen" → "aldın. Sen").
// `before` verilmezse metin-içi büyütme HİÇ yapılmaz (eski davranış).
function repairTrSeam(s: string, lang?: "tr" | "en", before?: string): string {
  // i→İ için toLocaleUpperCase("tr-TR") ŞART ("i".toUpperCase()="I").
  // Dil sezgisi MUTASYON ÖNCESİ metinde çalışır: ı/ş/ğ kanıtını taşıyan kelimeyi
  // guard yeni silmiş olabilir (ölçüldü: "Spike kurulmadı, ikinci turda tekrar
  // dene." → lang verilmezse "Ikinci" çıkıyordu; doğrusu "İkinci").
  const trText = lang ? lang === "tr" : /[şçğıöü]/i.test(before ?? s);
  const up = (c: string) => (trText ? c.toLocaleUpperCase("tr-TR") : c.toUpperCase());
  const t = s
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?])\s*\1+/g, "$1")               // "aldın.." → "aldın."
    // Cümle başı öksüz virgül. TR-KALAN-11: noktalamadan SONRAKİ boşluk korunur —
    // eski `$1` biçimi onu da yutuyordu ("çıktın. , yine" → "çıktın.yine").
    .replace(/(^|[.!?;])\s*[,;]\s*/g, (_m, p: string) => (p ? p + " " : ""))
    .replace(/^[\s,;:.—–-]+/, "")
    .replace(/(^|[.!?]\s+)(?:ve|ile)\s+(?=[a-zçğıöşüA-ZÇĞİÖŞÜ])/g, "$1") // coach-text.ts:48 ile AYNI
    .trim();
  const head = t.replace(/^([a-zçğıöşü])/u, up);
  if (before === undefined) return head;
  return head.replace(/([.!?]\s+)([a-zçğıöşü][\p{L}]*)/gu, (m, p: string, w: string, off: number) => {
    if (off === 0) return m;
    const existed = new RegExp(`[.!?]\\s+${escapeRe(w)}(?![\\p{L}])`, "u").test(before);
    return existed ? m : p + up(w.charAt(0)) + w.slice(1);
  });
}

// ── TÜRKÇE PENCERE BİRİMİ (B2 — TR boru hattı denetimi 2026-09-16) ─────────
//
// 🔴 CANLI KANIT (39 gerçek çağrı; taban koşusunda 23 örneğin 8'i):
//   raw   "Son 9 round'un 9'unda öldün"      → final "Son 6 kez'un 9'unda öldün"   (M1-R11)
//   raw   "Son 21 round'un hepsinde öldün"   → final "Son 'un hepsinde öldün"      (M1-R25)
//   raw   "Son 4 round'un 3'ünde öldün"      → final "Son 'un 3'ünde öldün"        (skye-c)
//   raw   "Son 3 round'da her round öldün…"  → final "Son 'da her round öldün…"    (r4-a)
//
// KÖK: "Son N round'un M'inde" TEK bir dilbilgisi birimidir (pencere + iyelik
// eki + iç sayı + bulunma eki); :317 ve :390'daki `${ct}\s*round(s)?` deseni
// SAĞ SINIRSIZ olduğu için birimin ORTASINDAN kesiyordu. Level-2'de ismi de
// değiştiriyordu (`round`→`kez`, :322) → arkadaki "'un" eki YETİM kalıyordu;
// level-3'te siliyordu → "Son 'un" kalıyordu.
//
// ⚠ ÇÖZÜM İLKESİ — "birimi yeniden YAZ" YOLU ÖLÇÜLÜP ELENDİ. O yol üç kusur
// üretiyor (üçü de ölçüldü):
//   (a) OLGU AŞILAMA — yüklemi okumadan ölüm sayısını başka olguya yazıyor:
//       "Son 6 round'un 4'ünde takımın A Site'ta spike'ı kurdu." → "…3'ünde…"
//   (b) ÇİFT SAYI — yutamadığı çekimde kendi sayısını ekliyor:
//       "Son 6 round'un 4'ünü kaybettin." → "Son 6 round'un 3'ünde 4'ünü…"
//   (c) ŞİŞİRME — modelin DOĞRU ve düşük sayısını yükseltiyor (model 2, süzgeç 5).
// UYGULANAN İLKE: **İSMİ VE EKİ ASLA DEĞİŞTİRME.** Yalnız iki işlem meşru:
//   (1) sayıyı YERİNDE DÜŞÜR (asla yükseltme) → isim+ek yerinde kaldığı için
//       dilbilgisi yapısal olarak bozulamaz;
//   (2) birimi TAMAMEN KALDIR + dikişi onar (level-3, kanıt yok) → cümle ayakta
//       kalır, iddia gider.
// Üç kapı: ikame YALNIZ aynı cümlede ölüm yüklemi varken (olgu aşılaması
// imkânsız), YALNIZ indirme (şişirme imkânsız), ismin HÂLİNE göre biçim
// (tamlayan → "5'inde", bulunma/eksiz → "5 kez"; ikincisi prompt'un kendi
// idiomu, lib/history-block.ts "son N round içinde M kez").
// Türkçe-\b TUZAĞI (dosya konvansiyonu): JS \b ş/ç/ğ/ı/ö/ü'de kırılır → \p{L}.

/** İsmin ek almış her biçimi ("round'un", "turda", "maçında"). */
const TR_NOUN_SUFFIX =
  "(?:['’]?(?:l[ae]r)?(?:n?[uüıi]n|[dt][ae])|['’]?[uüıi]n[dt][ae]n?|['’][uüıi]n(?:d[ae]n|[ae]))?";

/**
 * İç nicelik. DİKKAT: yalnız BULUNMA hâli ("4'ünde") nicelik sayılır —
 * "4'ünü / 4'üne / 4'ünden" BAŞKA bir yüklemin nesnesidir, DOKUNULMAZ.
 * Edatlar (içinde/boyunca/süresince) nicelik DEĞİLDİR ama silmede yutulur.
 * "tümünde/tümünün" korpusta verbatim geçiyor ("Son 20 round'un tümünde öldün").
 */
const TR_INNER =
  "(?:(\\d+)\\s*['’]\\s*[sşny]?[iıuü]n[dt][ae]"
  + "|(\\d+)\\s*(?:kez|defa)"
  + "|(içinde|boyunca|süresince)"
  + "|hepsinde|hepsinin|tümünde|tümünün|tamamında|tamamının|çoğunda|yarısında"
  + "|her\\s+(?:round|tur|maç)|üst\\s+üste|art\\s+arda)";

const TR_UNIT_RE = new RegExp(
  "(?<![\\p{L}\\p{N}])(son)\\s+(\\d+)\\s*(round|raund|tur|maç)(" + TR_NOUN_SUFFIX + ")(?![\\p{L}'’])"
  + "(\\s*" + TR_INNER + "(?![\\p{L}\\p{N}'’]))?",
  "giu",
);

/** Sayı ikamesi YALNIZ ölüm cümlesinde yapılır (olgu aşılaması yasağı). */
const TR_DEATH_MARKER = /öl(dü|üm|üyor|dün)|vurul|düştü|elendin|gittin/iu;

/** Eşleşmenin bulunduğu CÜMLE — ölüm yüklemi AYNI cümlede mi? */
function trSentenceAt(text: string, index: number): string {
  const start = Math.max(
    0,
    text.lastIndexOf(".", index) + 1,
    text.lastIndexOf("!", index) + 1,
    text.lastIndexOf("?", index) + 1,
  );
  let end = text.length;
  for (const ch of [".", "!", "?"]) {
    const i = text.indexOf(ch, index);
    if (i !== -1 && i < end) end = i;
  }
  return text.slice(start, end);
}

/**
 * drop=false (level 2, kısmi kanıt) → SADECE sayıları DÜŞÜRÜR.
 * drop=true  (level 3, KANIT YOK)   → birimi TAMAMEN kaldırır + dikişi onarır.
 */
function rewriteTrWindowUnit(
  text: string,
  actualWindow: number,
  actualCount: number,
  drop: boolean,
  lang?: "tr" | "en",
): string {
  const before = text;
  let removed = false;
  const out = text.replace(
    TR_UNIT_RE,
    (
      m: string, _son: string, win: string, _noun: string, nsuf: string,
      inner: string, locN: string, cntN: string, adj: string,
      offset: number, whole: string,
    ) => {
      if (drop) { removed = true; return ""; }

      const winN = parseInt(win, 10);
      // Pencere yalnız KISALTILIR (11 round varken "son 20 round" olamaz).
      const newWin = winN > actualWindow ? String(actualWindow) : win;

      let newInner = inner ?? "";
      // adj !== undefined → edat; nicelik değil, ASLA değiştirilmez.
      if (inner && adj === undefined) {
        const deathClause = TR_DEATH_MARKER.test(trSentenceAt(whole, offset));
        const genitive = /[uüıi]n$/.test(nsuf || "");
        const claimed =
          locN !== undefined ? parseInt(locN, 10)
            : cntN !== undefined ? parseInt(cntN, 10)
              : Number.POSITIVE_INFINITY; // "hepsinde/her round" = mutlak iddia
        if (deathClause && actualCount >= 1 && claimed > actualCount) {
          newInner = genitive
            ? ` ${trOrdinalLocative(actualCount)}`   // "round'un 3'ünde"
            : ` ${actualCount} kez`;                 // "round'da 3 kez"
        }
      }

      const winStart = m.indexOf(win);
      const head = m.slice(0, winStart);
      const mid = m.slice(winStart + win.length, m.length - (inner ? inner.length : 0));
      return `${head}${newWin}${mid}${newInner}`;
    },
  );
  return removed ? repairTrSeam(out, lang, before) : out;
}

/** Ek almış biçime generic TR desenleri DOKUNMAZ (birimi üstteki fonksiyon sahiplenir). */
const TR_SUFFIX_GUARD = "(?!['’]|[a-zçğıöşü])";

const POSITION_NAMES = [
  "a short", "a long", "a main", "a site", "a heaven", "a hell",
  "b short", "b long", "b main", "b site", "b heaven", "b hell",
  "c site", "c long", "c main",
  "mid", "mid top", "mid bottom", "mid doors",
  "market", "garage", "garden", "heaven", "hell",
  "catwalk", "elbow", "cubby", "window", "tree",
  "lobby", "hookah", "lamps", "showers", "link",
  "sewers", "pizza", "wine", "tiles", "u-hall",
  "rafters", "pocket", "generator", "ct spawn",
  // Lotus / Sunset / Abyss / Split callouts (council 2026-06-25 — extractClaims
  // now recognizes positions on these maps too, so count/position checks run).
  "a rubble", "a flower", "b elbow", "c side", "waterfall",
  "mound", "c nest", "b yard", "b market", "mid alley",
  "a yard", "b nest", "a nest", "a cliff", "mid platform",
  "a drop", "ramen", "screen", "mail",
  // Summit callouts (2026-06-26 — yeni harita; extractClaims Summit pozisyonlarını
  // da tanısın ki "Mid Fountain'da tekrar ölüyorsun" gibi pattern doğrulansın).
  "mid fountain", "mid bend", "mid window", "mid tiles", "double box",
  "a garden", "a cave", "a link", "a art", "b link", "b tower",
  "b trophy", "b gym", "triples", "close box",
  // Fracture callouts (2026-06-28 LAUNCH-BLOCKER: canlı-test "A Dish"/"B Tower"
  // ölüm-yeri halüsinasyonu — "a dish" listede yoktu, death-loc-absent guard
  // onu tanıyamıyordu). death_location-absent guard + repetition bunları tanısın.
  "a dish", "a rope", "a hall", "b tree", "b arcade", "b canteen",
  // KB gece nöbeti denetimi (2026-07-08) — Fracture "A Dish" sınıfı boşlukların
  // kalanı kapatıldı: KB harita dosyalarında geçen ama burada TANINMAYAN callout'lar
  // (deathLocation-absent guard bunları süzemiyordu, Abyss/Ascent/Bind/Icebox/Haven
  // ölümlerinde uydurma callout iddiası nötrlenemiyordu).
  // Abyss:
  "a security", "a tower", "a bridge", "a vent", "a secret", "b danger", "mid library",
  // Ascent ("switch" bilinçli DIŞARIDA — İngilizce fiil olarak koç metninde
  // geçebilir, yanlış-pozitif riski; bileşik "b switch" güvenli):
  "closet", "boathouse", "dice", "mid courtyard", "b lanes", "b switch",
  // Bind:
  "a bath", "b hall", "triple box",
  // Icebox:
  "a belt", "nest", "pipes", "kitchen", "tube", "boiler",
  "blue", "orange", "yellow", "green", "snowman",
  // Haven:
  "c link", "c platform",
  // Lotus / Pearl / Split / Sunset kalanları (maps-3 denetimi):
  "a ramp", "vents", "sewer", "pillar", "plaza", "dugout", "shops",
  "connector", "club", "tunnel", "courtyard", "boba", "alley",
  "a root", "b upper", "a stairs", "c hall", "tower", "ramp",
  // Corrode gerçek callout seti (maps-2 denetimi, 2026-07-08 — corrode.md
  // web-doğrulanmış isimlerle sıfırdan yazıldı; elbow/pocket/a yard/mid window/
  // tower zaten listede):
  "stairs", "top mid", "bottom mid",
];

const REPETITION_KEYWORDS = [
  // Turkish
  // Cycle 3 (council 2026-06-26): bare "tekrar" REMOVED — it matched FUTURE
  // coach advice ("o açıyı tekrar deneme", "A'ya tekrar girersen") and falsely
  // flagged it as a PAST repetition claim, which (with no death_position in the
  // round memory) cascaded to a level-3 strip that DESTROYED a good suggestion
  // (empirical S9: "...A'ya tekrar giriyorsanız operator'la smoke/flash..." →
  // gutted to a stub). PAST-claim forms kept: "tekrar eden" (sıfat-fiil) +
  // "tekrar tekrar" (yineleme). Anti-uydurma intact — count/position/window
  // checks below still catch fabricated stats.
  "tekrar eden", "tekrar tekrar", "art arda", "sürekli",
  "hep aynı", "aynı bölge", "aynı pozisyon",
  "pattern", "kalıcı",
  // English
  // FB06 · F41: çıplak "straight" ÇIKARILDI — "straight duel", "straight-line entry", "straight
  // front-angle fight" bu round'un betimidir; yalnız SAYIM bağlamı tekrar iddiasıdır
  // (EN_STRAIGHT_COUNT_RE, repetitionKeyIn).
  "in a row", "consecutive", "consistently",
  "every round", "same spot", "same position",
  "repeating", "recurring", "persistent", "every time",
];

// ── "straight" YALNIZ SAYIM BAĞLAMINDA (FB06 · F41, 2026-09-24) ──────────────────────
// KANIT: çıplak "straight" alt-dizge eşleşmesi (s.includes) bu round'u anlatan, katili/silahı/
// konumu ÖLÇÜLMÜŞ EN cümlelerini tekrar iddiası sayıyordu → level-3 yan-cümle silmesi →
// TR-KALAN-26 (b) gereği EA maddesi düşüyordu. Korpus (maliyetsiz A/B): cycleb09-cand-en E2
// "Jett held the long sight at B Long with an Operator and punished the straight duel." ve E5/
// E10, cyclew3-base2-en E5 EA0'ları realityCheck'te {text:"", level:3} → çıktıdan düşüyordu.
// Sayım bağlamı: "N (rounds|deaths|times|games) straight", "straight rounds/deaths/…",
// "rounds straight" (N rakam ya da two…ten) — "3 rounds straight", "three straight rounds" hâlâ
// tekrar iddiasıdır ve kanıtsızken HEAD'deki gibi nötrlenir.
const EN_STRAIGHT_COUNT_SRC =
  "(?<![\\p{L}\\p{N}])(?:(?:\\d+|two|three|four|five|six|seven|eight|nine|ten)\\s+(?:(?:rounds?|deaths?|times|games?)\\s+)?straight"
  + "|straight\\s+(?:rounds?|deaths?|times|games?)|rounds?\\s+straight)(?![\\p{L}])";
const EN_STRAIGHT_COUNT_RE = new RegExp(EN_STRAIGHT_COUNT_SRC, "iu");

// ── BELİRSİZ TEKRAR ANAHTARLARI (TR-KALAN-25, 2026-09-23) ─────────────────
// "sürekli", "aynı pozisyon", "aynı bölge" yalın alt-dizge olarak hem ÇAPRAZ-ROUND
// iddiasını ("son maçlarda sürekli aynı pozisyonda öldün") hem de BU round'un
// betimini ("aynı pozisyonda beklerken Jett seni vurdu") ya da ÖĞÜDÜ ("pozisyonu
// sürekli değiştir") taşıyor. Cycle 3'te çıplak "tekrar" aynı gerekçeyle
// çıkarılmıştı (yukarıda). Ölçülen hasar: maliyetsiz replay'de phoenix-c / skye-b /
// M1-R16 deathAnalysis'i tümüyle "Bu round beklenen açıdan vuruldun." kalıbına
// çöküyordu; tarihsel korpusta final DA'ların 12/970'i bu kalıp.
// Kural: belirsiz anahtar ancak AYNI CÜMLEDE bir çapraz-round çapası varsa sayılır.
// Belirsiz OLMAYANLAR ("tekrar eden", "tekrar tekrar", "art arda", "hep aynı", EN
// listesi) değişmez. Türkçe-\b TUZAĞI: \p{L} lookaround (dosya konvansiyonu).
const AMBIGUOUS_REPETITION = new Set(["sürekli", "aynı pozisyon", "aynı bölge"]);
// FB06 · F41: EN "pattern" de BELİRSİZ — "punished the mid duel pattern", "Their comp includes
// an Op-player pattern" bu round'un / rakibin betimi; "your pattern shows you died once in R1"
// (çapa R1) çapraz-round iddiası. EN çapraz-round çapaları CROSS_ROUND_ANCHOR_RE'ye ÖNCE eklendi
// (again, every round, keep dying/getting, previous rounds, this match, last N rounds, past
// rounds, each round, all match) ki çapalı EN iddiası kaçmasın.
// ⚠ PLAN SAPMASI (ölçülmüş): plan "pattern"i AMBIGUOUS_REPETITION'a (iki dil) taşıyordu. Maliyetsiz
// A/B'de TR'de 3 kanıtsız tekrar iddiası geri geldi (cyclefinal2 S10 "B Link'te aynı noktada ölme
// pattern'in var", cyclereal-n14 M1-R8 "Bu round mid bottom'da ölünce pattern devam etmiş",
// cyclereal-base M1-R4 "ölmen pattern'e eklendi"): TR koç metninde "pattern" korpusun 74 TR
// cümlesinin HEPSİNDE oyuncunun çapraz-round ölüm kalıbı anlamında; çapası çoğu kez başka
// yan-cümlede. Belirsizlik yalnız EN'de → TR davranışı bayt-aynı.
const isAmbiguousRepetition = (k: string, isTr: boolean) => AMBIGUOUS_REPETITION.has(k) || (k === "pattern" && !isTr);
const CROSS_ROUND_ANCHOR_RE = new RegExp(
  "(?<![\\p{L}\\p{N}])(?:r\\d+"
  + "|round['’]?lar[\\p{L}]*"
  + "|önceki|geçen|yine|tekrar|\\d+\\s*kez|defa"
  + "|üst\\s+üste|art\\s+arda|her\\s+round"
  + "|bu\\s+maç[\\p{L}'’]*|maç\\s+boyunca"
  // spec listesine EK (ölçülmüş): pencere ifadeleri de çapraz-round çapasıdır —
  // spec'in kendi negatif vakası "Son maçlarda sürekli aynı pozisyonda öldün."
  // (hâlâ nötrlenmeli) yalnız bu çapayla yakalanıyor.
  + "|son\\s+(?:\\d+\\s*)?(?:round|raund|tur|maç)[\\p{L}'’]*|maçlar[\\p{L}]*"
  // B02 İNCELEME: 2. şahıs ŞİMDİKİ zaman ölüm/yakalanma yüklemi ALIŞKANLIK bildirir
  // ("B Main'de sürekli ölüyorsun") → çapraz-round iddiası. Çapa listesinde yoktu →
  // iddia hiçbir katmana takılmıyordu (rewriteLevel=3 raporlanıp metin değişmiyordu).
  // Emir/öğüt biçimleri ("sürekli değiştir", "aynı pozisyonda bekleme") ÇAPA DEĞİL.
  + "|ölüyorsun|vuruluyorsun|yakalanıyorsun|düşüyorsun|öldürülüyorsun"
  // FB06 · F41: EN çapraz-round çapaları ("pattern" belirsiz listeye taşınmadan ÖNCE).
  + "|again|every\\s+round|keep\\s+(?:dying|getting)|previous\\s+rounds?|this\\s+match"
  + "|last\\s+\\d+\\s+rounds?|past\\s+rounds|each\\s+round|all\\s+match"
  + ")(?![\\p{L}])",
  "iu",
);
/** Bu PARÇA tekrar-iddiası taşıyor mu? Belirsiz anahtar için çapa `scope`ta (cümle) aranır.
 *  Döner: eşleşen anahtar (ya da FB06 · F41 sayım bağlamlı "straight" öbeğinin kendisi).
 *  isTr (FB06 · F41): metnin dili — "pattern" yalnız EN'de belirsiz. */
function repetitionKeyIn(segment: string, scope: string, isTr: boolean): string | undefined {
  const s = segment.toLowerCase();
  const key = REPETITION_KEYWORDS.find((k) =>
    s.includes(k) && (!isAmbiguousRepetition(k, isTr) || CROSS_ROUND_ANCHOR_RE.test(scope)));
  if (key !== undefined) return key;
  return EN_STRAIGHT_COUNT_RE.exec(s)?.[0];
}

// ── İDDİA ÇIKARIMI (TR-KALAN-14/15, 2026-09-23) ──────────────────────────
//
// 🔴 CANLI KANIT (r4-a, 3/3 ölüm hepsi high): raw "Son 3 round'da her round öldün
// (R1 A Hall, R2 B Generator, R3 B Link)" → final "Son 3 round'da 1 kez öldün
// (R1 A Hall, R2 B Generator, R3 )". DOĞRU iddia, anti-uydurma katmanında YANLIŞ
// olguya çevriliyordu. İki yüzeysel çıkarım birlikte:
//   (a) COUNT_PATTERNS'teki `(\d+)\s*round` PENCERE sayısını ("son 3 round")
//       ölüm sayısı sanıyordu;
//   (b) konum = POSITION_NAMES sırasındaki İLK includes() eşleşmesi: "link",
//       "b link"in alt-dizgesi. Sayım LİSTESİ tek-konum iddiası sanılıyordu.
// ÇÖZÜM:
//   (a) pencere sayısı ("son/last/past N") ASLA count değildir. Sayısal iddialar
//       ("3 kez", "3'ünde", "2'sinde") eski öncelik sırasıyla okunur; hiç sayısal
//       iddia yoksa TR biriminin MUTLAK niceleyicisi ("hepsinde/tümünde/her
//       round/üst üste") → pencere N. Nicelik yoksa → null.
//   (b) konumlar SINIRLI (\p{L} lookaround — Türkçe-\b tuzağı) ve EN UZUN önce
//       taranır. İddianın konumu, iddianın KENDİ yan-cümlesinde ([.!?;:—\n])
//       ona BAĞLI konumdur: hemen önündeki en yakın konum ("B Main'de 3 kez");
//       önünde yoksa ardındaki konumlar — TEK farklı konumsa o, ≥2 ise sayım
//       LİSTESİ → null (sayım genel ölüm sayısıyla doğrulanır, r4-a). Yan-cümlede
//       hiç konum yoksa iddia GENELDİR → null.
//   ⚠ SPEC SAPMASI (bilinçli, ölçülmüş): spec'in "metindeki ≥2 farklı konum →
//   null" kuralı, TR koç metninin neredeyse HER örneğinde bulunan ÖĞÜT
//   konumlarını (Market/Heaven/CT) da saydığı için konuma-bağlı sayımları genel
//   ölüm sayısıyla doğruluyordu ve maliyetsiz replay'de YENİ uydurma üretti:
//   real-rounds-23 M1-R5 (rh'de B Main ölümü 0) "Bu round B Main'de 3 kez benzer
//   ölüm var — … Market veya CT'den … Heaven" → "B Main'de 2 kez" (HEAD sayıyı
//   siliyordu); M1-R9/M1-R17 "B Main'de 2/3 kez" (gerçek 1) aynen geçiyordu.
//   İddiaya BAĞLI konum kuralı r4-a listesini çözer, bu sınıfı doğurmaz.
//   İddia yoksa (yalnız konum geçen metin) eski anlam korunur: tek konum → o.
const WINDOW_NUMBER_BEFORE = /(?:son|last|past)\s+$/i;
/** Pencere sayısı yalnız ardından PENCERE BİRİMİ geliyorsa atlanır (B02 inceleme):
 *  "son 3 kez" / "last 3 times" SAYIM iddiasıdır — eski koşulsuz atlama bunları hiç
 *  doğrulamıyordu ("Son 3 kez B Main'de öldün", 1 ölüm → L3 no-op). */
const WINDOW_UNIT_AFTER = /^\d+\s*(?:round|raund|tur|maç|match|game)/i;
const TR_ABSOLUTE_INNER = /^(?:hepsinde|hepsinin|tümünde|tümünün|tamamında|tamamının|her\s+(?:round|tur|maç)|üst\s+üste|art\s+arda)$/iu;
const POSITION_SCAN_RE = new RegExp(
  "(?<![\\p{L}\\p{N}])("
  + [...POSITION_NAMES].sort((a, b) => b.length - a.length).map(escapeRe).join("|")
  + ")(?![\\p{L}\\p{N}])",
  "giu",
);
const CLAIM_CLAUSE_END = /[.!?;:—\n]/;
/** Round birimli pencere mi? (TR-KALAN-14 — "maç" birimi bilerek dışarıda.) */
function isRoundWindow(text: string, n: number): boolean {
  return new RegExp(`(?:son|last|past)\\s+${n}\\s*(?:round|raund|tur)`, "i").test(text);
}
/** İddianın (anchor) yan-cümlesinde ona BAĞLI konum; anchor yoksa metnin tek konumu. */
function claimPosition(lower: string, anchor: number | null): string | null {
  if (anchor === null) {
    const set = new Set([...lower.matchAll(POSITION_SCAN_RE)].map((m) => m[1]));
    return set.size === 1 ? [...set][0] : null;
  }
  return claimPositionSpan(lower, anchor)?.name ?? null;
}
/** claimPosition'ın gövdesi (FB05 · F14: konumun ADI yanında metindeki YERİ de döner — sayım
 *  silinirken geçmiş çapasının yazılacağı / konumun düşeceği yer). Karar kuralı AYNEN. */
function claimPositionSpan(lower: string, anchor: number): { name: string; start: number; end: number } | null {
  const all = [...lower.matchAll(POSITION_SCAN_RE)].map((m) => ({
    name: m[1], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length,
  }));
  let cs = anchor;
  while (cs > 0 && !CLAIM_CLAUSE_END.test(lower[cs - 1])) cs--;
  let ce = anchor;
  while (ce < lower.length && !CLAIM_CLAUSE_END.test(lower[ce])) ce++;
  const inClause = all.filter((a) => a.start >= cs && a.end <= ce);
  // BAĞLILIK: konum ile iddia arasında virgül yok ve boşluk ≤40 karakter
  // ("B Main'de 3 kez", "B Site bölgesinde son 3 round içinde 3 kez"). Virgül
  // ötesi konum çoğunlukla ÖĞÜTTÜR ("…3 kez öldün, bu yüzden A Site'ı bırak").
  const bound = (gap: string) => !gap.includes(",") && gap.length <= 40;
  const before = inClause.filter((a) => a.end <= anchor && bound(lower.slice(a.end, anchor)));
  if (before.length) return before[before.length - 1];
  const afterAll = inClause.filter((a) => a.start >= anchor);
  const afterNames = new Set(afterAll.map((a) => a.name));
  if (afterNames.size !== 1) return null;            // 0 = genel iddia, ≥2 = sayım listesi
  return bound(lower.slice(anchor, afterAll[0].start)) ? afterAll[0] : null;
}

// ── SAYIMDAN ÖNCEKİ KONUM LİSTESİ (FB06 · F57 (b), 2026-09-24) ──────────────────────
// KANIT: claimPositionSpan sayımdan ÖNCEKİ bağlı konumların SONUNCUSUNU döndürüyor →
// "B Main/B Lobby'de 2 kez öldün" (R5 b main + R10 b lobby, gerçek 2) 'lobby' sayılıp 1 ölümle
// "doğrulanıyor", DOĞRU sayım siliniyordu (test 102 bunu kilitliyordu); "B Site/B Main'de 2 kez"
// (rh R1 b site, R5 b main, R7 b site) de aynı yoldan siliniyordu. ÇÖZÜM: son öğeden geriye,
// adların arasında YALNIZ "/", ",", " ve ", " ile " (+ isteğe bağlı site harfi) varken yürünür;
// liste ≥2 farklı ad ise sayım bu konumların ölüm TOPLAMIYLA doğrulanır (validateClaims).
// ⚠ SPEC SAPMASI KORUNUR (yukarıdaki not): koordinasyon ŞART — öğüt konumu ("Market'ten
// bakarken B Main'de 3 kez") liste sayılmaz, sayım yine yalnız B Main'le doğrulanır.
const POSITION_DIRECT_SEP_RE = /^\s*(?:\/|,|\s(?:ve|ile)\s)\s*(?:[abc]\s+)?$/u;
/** Konum adının önünde site harfi varsa ("b lobby") onunla birlikte ad. */
function positionWithSiteLetter(lower: string, name: string, start: number): string {
  return !/^[abc]\s/.test(name) && /(?<![\p{L}\p{N}])[abc]\s+$/u.test(lower.slice(0, start))
    ? `${lower.slice(0, start).trimEnd().slice(-1)} ${name}`
    : name;
}
function claimPositionList(lower: string, anchor: number): string[] | null {
  const last = claimPositionSpan(lower, anchor);
  if (!last || last.end > anchor) return null;       // yalnız sayımdan ÖNCEKİ bağlı konum
  const all = [...lower.matchAll(POSITION_SCAN_RE)].map((m) => ({
    name: m[1], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length,
  }));
  const names = [positionWithSiteLetter(lower, last.name, last.start)];
  let cur = last;
  for (;;) {
    const prev = all.filter((a) => a.end <= cur.start).pop();
    if (!prev) break;
    // Ara metinde site harfi varsa ("/b ") ayraç deseni onu da tüketir.
    if (!POSITION_DIRECT_SEP_RE.test(lower.slice(prev.end, cur.start))) break;
    names.unshift(positionWithSiteLetter(lower, prev.name, prev.start));
    cur = prev;
  }
  return new Set(names).size >= 2 ? [...new Set(names)] : null;
}

// ── SAYIM SİLMESİ ÇAPAYI KORUR (FB05 · F14 (2), 2026-09-24) ──────────────────────
// KANIT: rewriteUnsafeClaims'in TR sayım silmesi (actualCount<2 → "(son )N kez" = "")
// doğrulanamayan sayıyla birlikte GEÇMİŞ ÇAPASINI da siliyordu → geçmiş iddia çapasız ölüm
// cümlesine, yani BU round'un konum iddiasına dönüşüyordu: "Son 3 kez B Main'de öldün" (R2
// B Main, bu round A Site) → "B Main'de öldün, açıyı değiştir." (test 108 bunu kilitliyordu);
// korpus cycleab-luna-default M1-R12 NR "B Main'de 2 kez öldüğün için" → "B Main'de
// öldüğün için". EN aynası "You died at B Main 3 times, …" → "You died at B Main , …".
// ÇÖZÜM: sayım silinirken iddiaya BAĞLI konumun önüne eşleşen round'un çapası yazılır
// ("R2'de B Main'de öldün"; EN "… at B Main in R2"); konum bir LİSTENİN parçasıysa
// ("B Main/B Lobby'de") tek round yanlış olur → "daha önce" / "earlier". Yan-cümle açıkça
// "bu round/şimdi"ye çapalıysa geçmiş çapası YAZILMAZ (kendisiyle çelişen cümle üretmemek
// için; konum düzeltmesini F14 (1) halkası yapar). Kanıt sıfırsa (level-3, actualCount 0)
// BAĞLI konum düşer — bu round'un ölçülen konumu ve liste hâli hariç.

/** text.toLowerCase() ile AYNI küçük metin + küçük→orijinal indeks haritası ("İ" iki birime
 *  açılır; indeks kaymasın). Parça parça küçültme bütünle aynı değilse null (düzenleme yok). */
function lowerWithMap(text: string): { lower: string; toOrig: number[] } | null {
  let lower = "";
  const toOrig: number[] = [];
  for (let i = 0; i < text.length;) {
    const ch = String.fromCodePoint(text.codePointAt(i) as number);
    const l = ch.toLowerCase();
    lower += l;
    for (let j = 0; j < l.length; j++) toOrig.push(i);
    i += ch.length;
  }
  toOrig.push(text.length);
  return lower === text.toLowerCase() ? { lower, toOrig } : null;
}
/** Konumun solunda "<konum> /|,|ve|veya|ya da|and|or" varsa liste başına yürümek için. */
const POSITION_LIST_PREV_RE = new RegExp(
  "(?<![\\p{L}\\p{N}])(?:"
  + [...POSITION_NAMES].sort((a, b) => b.length - a.length).map(escapeRe).join("|")
  + ")\\s*(?:\\/|,|\\s(?:ve|veya|ya\\s+da|and|or)\\s)\\s*$",
  "iu",
);
type CountClaimSpan = {
  countStart: number; countEnd: number; posStart: number; posEnd: number;
  listStart: number; isList: boolean;
  /** İddianın yan-cümlesinde (virgül dahil sınır) iddianın SOLUNDA/İÇİNDE "bu round/şimdi". */
  currentAnchored: boolean;
  /** Yan-cümlede sayımın KENDİSİ dışında bir geçmiş çapası ("son 3 round", "R5", "önceki
   *  round") — sayım silinse de iddia geçmişe çapalı kalır, yeni çapa yazılmaz. */
  otherPastAnchor: boolean;
  deathSentence: boolean;
};
/** Sayım iddiasının metindeki yeri + ona BAĞLI konum (orijinal indeksler). unitRe (g
 *  bayraklı, küçük metin üzerinde): 1. grup sayıdan önceki önek (yoksa boş). Yoksa null. */
function locateCountClaim(text: string, unitRe: RegExp, claimedPosition: string): CountClaimSpan | null {
  const lm = lowerWithMap(text);
  if (!lm) return null;
  const { lower, toOrig } = lm;
  for (const m of lower.matchAll(unitRe)) {
    const at = m.index ?? 0;
    const digit = at + (m[1] ?? "").length;
    const span = claimPositionSpan(lower, digit);
    if (!span || span.name !== claimedPosition) continue;
    // POSITION_NAMES bazı bileşikleri yalnız çekirdek kelimeyle tutar ("lobby" var, "b lobby"
    // yok) → önündeki SİTE HARFİ konuma dahil edilir (öksüz "B" kalmasın, liste doğru okunsun).
    const letter = /(?<![\p{L}\p{N}])[abc]\s+$/u.exec(lower.slice(0, span.start));
    const posStartL = letter ? letter.index : span.start;
    let listStart = posStartL;
    for (;;) {
      const pm = POSITION_LIST_PREV_RE.exec(lower.slice(0, listStart));
      if (!pm) break;
      listStart = pm.index;
    }
    // Yan-cümle = virgül dahil sınırlar ([.,!?;:—\n]). "…öldüğün için bu round Market'te kur"
    // gibi SONRAKİ plan yan-cümlesindeki "bu round" iddiayı bu round'a çapalamaz: çapa yalnız
    // iddianın solunda/içinde aranır.
    const claimStartL = Math.min(listStart, at), claimEndL = Math.max(span.end, at + m[0].length);
    let ss = claimStartL;
    while (ss > 0 && !/[.,!?;:—\n]/.test(lower[ss - 1])) ss--;
    let se = claimEndL;
    while (se < lower.length && !/[.,!?;:—\n]/.test(lower[se])) se++;
    const countEndL = at + m[0].length;
    const otherPastAnchor = [...lower.slice(ss, se).matchAll(LOC_PAST_ANCHOR_RE)]
      .some((pm) => { const a = ss + (pm.index ?? 0), b = a + pm[0].length; return b <= at || a >= countEndL; });
    return {
      countStart: toOrig[at], countEnd: toOrig[countEndL],
      posStart: toOrig[posStartL], posEnd: toOrig[span.end],
      listStart: toOrig[listStart], isList: listStart !== posStartL,
      currentAnchored: new RegExp(LOC_CURRENT_ANCHOR_RE.source, "iu").test(lower.slice(ss, claimEndL)),
      otherPastAnchor,
      deathSentence: CLAIM_DEATH_MARKER.test(trSentenceAt(lower, digit)),
    };
  }
  return null;
}
/** Tek eşleşen round'un geçmiş çapası: TR "R2'de" (ünlü uyumlu, trNumberLocative), EN
 *  "in R2". Eşleşen round TEK değilse null (çapa uydurulmaz). */
function pastRoundAnchor(v: ValidationResult, lang: "tr" | "en"): string | null {
  const rounds = v.matchedRounds ?? [];
  if (rounds.length !== 1 || !Number.isFinite(rounds[0])) return null;
  // Hafızada aynı round_index birden çok kez varsa (korpus real-rounds-23 M1-R22: R2/R3 iki
  // kez) "R3" belirsizdir → numarasız geçmiş çapası.
  if (v.roundIndexUnique === false) return lang === "tr" ? "daha önce" : "earlier";
  return lang === "tr" ? `R${trNumberLocative(rounds[0])}` : `in R${rounds[0]}`;
}

export function extractClaims(text: string, lang?: "tr" | "en"): ExtractedClaims {
  const lower = text.toLowerCase();
  // FB06 · F41: dil ("pattern" yalnız EN'de belirsiz). Verilmezse rewriteUnsafeClaims ile aynı sezgi.
  const isTrText = lang ? lang === "tr" : /[şçğıöü]/i.test(text);

  // Extract count — (a) sayısal iddialar eski öncelik sırasıyla, pencere sayısı atlanır.
  let claimedCount: number | null = null;
  let anchor: number | null = null;
  outer: for (const p of COUNT_PATTERNS) {
    // FB06 · F57: TR_COUNT_RE \p{L} kullanır → "u" bayrağı korunur (eski desenler bayraksızdı).
    for (const m of lower.matchAll(new RegExp(p.source, p.flags.includes("u") ? "giu" : "gi"))) {
      const at = m.index ?? 0;
      const deathSentence = CLAIM_DEATH_MARKER.test(trSentenceAt(lower, at));
      // "son N kez" yalnız ÖLÜM cümlesinde sayımdır; pencere birimli sayı hiç değil.
      if (WINDOW_NUMBER_BEFORE.test(lower.slice(0, at)) && (WINDOW_UNIT_AFTER.test(lower.slice(at)) || !deathSentence)) continue;
      if (p === EN_OF_LAST_COUNT_RE && !deathSentence) continue;
      // FB06 · F57: yazıyla sayı ("üç kez") yalnız ölüm yan-cümlesinde sayımdır (öğüt kalkanı).
      if (p === TR_COUNT_RE && wordCountOutsideDeathClause(m[1], lower, at)) continue;
      const value = p === TR_COUNT_RE ? trCountValue(m[1]) : parseInt(m[1]);
      if (!Number.isFinite(value)) continue;
      claimedCount = value;
      anchor = m.index ?? null;
      break outer;
    }
  }
  // Sayısal iddia yoksa: TR biriminin MUTLAK niceleyicisi → pencere N.
  if (claimedCount === null) {
    for (const u of lower.matchAll(new RegExp(TR_UNIT_RE.source, TR_UNIT_RE.flags))) {
      const inner = (u[5] ?? "").trim();
      if (inner && TR_ABSOLUTE_INNER.test(inner)) {
        claimedCount = parseInt(u[2], 10);
        anchor = u.index ?? null;
        break;
      }
    }
  }

  // Extract window
  let claimedWindow: number | null = null;
  let windowIdx: number | null = null;
  for (const p of WINDOW_PATTERNS) {
    const m = lower.match(p);
    if (m) { claimedWindow = parseInt(m[1]); windowIdx = m.index ?? null; break; }
  }
  const claimedWindowIsRound = claimedWindow !== null && isRoundWindow(lower, claimedWindow);

  // Detect repetition claim — TR-KALAN-25: belirsiz anahtar yalnız aynı cümlede
  // çapraz-round çapasıyla sayılır (cümle bazında taranır).
  let repIdx: number | null = null;
  for (const sm of lower.matchAll(/[^.!?]+[.!?]*/g)) {
    const key = repetitionKeyIn(sm[0], sm[0], isTrText);
    if (key !== undefined) { repIdx = (sm.index ?? 0) + sm[0].indexOf(key); break; }
  }
  const repetitionClaim = repIdx !== null;

  // Extract position — iddiaya BAĞLI konum (bkz. yukarıdaki (b)).
  const claimAnchor = anchor ?? windowIdx ?? repIdx;
  const claimedPosition = claimPosition(lower, claimAnchor);
  // FB06 · F57 (b): yalnız SAYIM iddiasında (anchor) ve doğrudan koordineli listede.
  const claimedPositionList = anchor !== null && claimedPosition !== null ? claimPositionList(lower, anchor) : null;

  return {
    claimedCount, claimedWindow, claimedPosition, repetitionClaim, claimedWindowIsRound,
    ...(claimedPositionList ? { claimedPositionList } : {}),
  };
}

// ── Memory Validation ──

export function validateClaims(
  claims: ExtractedClaims,
  memory: RoundMemoryEntry[],
): ValidationResult {
  const totalRounds = memory.length;

  // FIX #1: Window MUST be strict — only use last N rounds for windowed claims
  const windowSize = claims.claimedWindow
    ? Math.min(claims.claimedWindow, totalRounds)
    : totalRounds;
  const windowEntries = memory.slice(-windowSize);

  // FIX #2: ONLY count HIGH or MEDIUM confidence — LOW NEVER counted
  const windowDeaths = windowEntries.filter(r =>
    r.died === true &&
    typeof r.death_position === "string" &&
    r.death_position.length > 0 &&
    (r.position_confidence === "high" || r.position_confidence === "medium")
  );

  // Count matching position within window
  let actualCount = 0;
  let matchedRounds: number[] = [];
  if (claims.claimedPositionList && claims.claimedPositionList.length >= 2) {
    // FB06 · F57 (b): konum LİSTESİ → listedeki konumların ölüm TOPLAMI (round başına bir kez).
    const names = claims.claimedPositionList.map((n) => n.toLowerCase());
    const matched = windowDeaths.filter((r) => {
      const dp = (r.death_position || "").toLowerCase();
      return names.some((n) => dp.includes(n));
    });
    actualCount = matched.length;
    matchedRounds = matched.map((r) => r.round_index);
  } else if (claims.claimedPosition) {
    const posLower = claims.claimedPosition.toLowerCase();
    const matched = windowDeaths.filter(r =>
      (r.death_position || "").toLowerCase().includes(posLower)
    );
    actualCount = matched.length;
    matchedRounds = matched.map((r) => r.round_index);
  } else {
    // TR-KALAN-15: konum iddiası yoksa sayım GENEL ölüm sayısıyla doğrulanır —
    // ölüm olgusu konum güveninden BAĞIMSIZDIR (FIX #2'nin high/medium süzgeci
    // KONUMA-bağlı sayım içindir). Eski hâli yalnız konumu okunmuş ölümleri
    // sayıyordu: real-rounds-23 M1-R24 (20 round, 20 ölüm, 15'i konumlu) "Son 20
    // round'un hepsinde öldün" DOĞRU iddiası "15'inde"ye indiriliyordu.
    actualCount = windowEntries.filter((r) => r.died === true).length;
  }

  // Validate count — claimed must be <= actual
  const countValid = claims.claimedCount === null || claims.claimedCount <= actualCount;

  // Validate position exists in windowed memory
  const positionValid = claims.claimedPosition === null || actualCount > 0;

  // FIX #4: Repetition requires actualCount >= 2, no exceptions
  const repetitionValid = !claims.repetitionClaim || actualCount >= 2;

  // TR-KALAN-14 (2026-09-23): PENCERE doğrulaması hiç yoktu — "Son 10 round'da"
  // 2 round'luk hafızada geçiyordu; bugün kısalıyormuş gibi görünmesinin tek
  // sebebi COUNT_PATTERNS'ın pencere sayısını count sanmasıydı (TR-KALAN-15 ile
  // birlikte kapatıldı; AYRI commit'lenirse kısaltma kaybolur). Yalnız ROUND
  // birimli pencere doğrulanır; "son 5 maç" maçlar arası iddiadır → dokunulmaz.
  const windowValid = claims.claimedWindow === null
    || claims.claimedWindowIsRound !== true
    || claims.claimedWindow <= totalRounds;

  // Determine rewrite level
  let rewriteLevel: 1 | 2 | 3;
  if (countValid && positionValid && repetitionValid) {
    // Salt-pencere aşımı: kanıt kısmi değil, yalnız pencere büyük → en az 2
    // (TR'de sayı yerinde KISALIR, EN'de "recently" — ikisi de olgu üretmez).
    rewriteLevel = windowValid ? 1 : 2;
  } else if (positionValid && actualCount >= 1) {
    rewriteLevel = 2;
  } else {
    rewriteLevel = 3;
  }

  return {
    countValid,
    positionValid,
    repetitionValid,
    actualCount,
    actualWindow: windowSize,
    rewriteLevel,
    matchedRounds,
    roundIndexUnique: new Set(memory.map((r) => r.round_index)).size === memory.length,
  };
}

// ── Safe Rewrite ──

export function rewriteUnsafeClaims(
  text: string,
  claims: ExtractedClaims,
  validation: ValidationResult,
  // Cycle 3 (council 2026-06-26): when EVERY sentence is an unproven repetition
  // claim and gets dropped, the neutral death-fallback ("Bu round beklenen
  // açıdan vuruldun.") is fine for a deathAnalysis but WRONG for a
  // nextRoundSuggestion (a past-tense death line in a "next round plan" field =
  // useless stub). When false, return "" instead so the caller can keep the
  // original advice. Defaults true → every existing caller is byte-identical.
  allowEmptyFallback: boolean = true,
  // Denetim 2026-07-19 (F5): route istek dilini biliyor — verilirse heuristik
  // yerine kesin dil kullanılır; verilmezse eski heuristik → eski çağıranlar bayt-aynı.
  lang?: "tr" | "en",
  // FB05 · F14: BU round'un ölçülmüş konum(lar)ı (küçük harf). Kanıtsız sayım iddiasına bağlı
  // konum düşürülürken bunlar ASLA düşmez (hafıza yalnız GEÇMİŞİ tutar; bu round'un doğru
  // konumu orada yoktur). Verilmezse boş küme.
  protectedLocs?: ReadonlySet<string>,
): string {
  if (validation.rewriteLevel === 1) {
    return text; // all claims verified
  }

  let result = text;

  // Dil tespiti (canlı-test 2026-07-18 "bir TR bir EN"): replacement metinleri
  // ÇIKTININ diliyle eşleşmeli — EN cümleye "kez" enjekte etmek (ve TR cümleye
  // "recently") kelime-düzeyi dil karışmasının kaynağıydı. Türkçe özel harf
  // heuristiği level-3'teki mevcut isTr tespitiyle aynı ailedendir.
  // Denetim 2026-07-19 (F5): lang verilmişse heuristik atlanır (özel-harfsiz TR
  // cümle EN sayılıp "times/recently" enjekte edilmesin).
  const trText = lang ? lang === "tr" : /[şçğıöü]/i.test(text);

  if (validation.rewriteLevel === 2) {
    // B2 (2026-09-16): TR'de pencere birimini TEK SAHİP ele alır; isim/ek asla
    // değişmez, sayı yalnız DÜŞER. Aşağıdaki generic TR desenleri bu yüzden
    // TR'de DEVRE DIŞI — onlar "9 round'un"u parçalayıp "Son 6 kez'un 9'unda"
    // üretenlerdi (canlı M1-R11). EN desenleri ve EN yolu BİREBİR eskisi gibi.
    if (trText) {
      result = rewriteTrWindowUnit(result, validation.actualWindow, validation.actualCount, false, lang);
    }

    // B02 İNCELEME: EN "N of the last M rounds" birimi TEK sahiple yeniden yazılır
    // (sayı yalnız İNER, pencere yalnız KISALIR); aşağıdaki genel sayım/pencere
    // desenleri o birime bir daha DOKUNMAZ ("1 of the recently" artığı olmasın).
    const ofLastHandled = !trText && claims.claimedCount !== null
      && rewriteEnOfLast(result, validation, false) !== result;
    if (ofLastHandled) result = rewriteEnOfLast(result, validation, false);

    // Position valid but count/repetition overclaimed
    if (claims.claimedCount !== null && !validation.countValid && !ofLastHandled) {
      // Cover Turkish AND English count phrasings — sed only handled "kez".
      const ct = claims.claimedCount;
      if (trText) {
        // TR: yalnız İSİMLİ sayaçlar; ek almış biçime DOKUNMA (guard). B02 inceleme:
        // "son N kez" TEK birimdir — sayı düşerken "son" da düşer ("Son 3 kez B
        // Main'de öldün" → "B Main'de öldün"; eskiden "Son B Main'de öldün").
        // Sol rakam sınırı: ct=3 "13 kez"in içinden eşleşmesin.
        const before2 = result;
        let removed = false;
        // FB05 · F14 (2): kanıt TEK round ise silinen sayımın yerine konuma geçmiş çapası
        // yazılır ("Son 3 kez B Main'de öldün" → "R2'de B Main'de öldün"); liste konumunda
        // "daha önce". Yan-cümle "bu round/şimdi"ye çapalıysa yazılmaz (bkz. locateCountClaim).
        // FB06 · F57: sayı TEK ortak alternasyonla (rakam | yazıyla) ve kez|defa|kere birimiyle
        // aranır; yazıyla biçim yalnız ölüm yan-cümlesinde (öğüt "bir kez daha dene" dokunulmaz).
        const ctSrc = trCountTokenSrc(ct);
        if (validation.actualCount === 1 && claims.claimedPosition) {
          const anchorTr = pastRoundAnchor(validation, "tr");
          const loc = anchorTr
            ? locateCountClaim(result, new RegExp(`(?<![\\p{L}\\p{N}])(son\\s+)?${ctSrc}\\s*${TR_COUNT_UNIT_ALT}${TR_SUFFIX_GUARD}`, "giu"), claims.claimedPosition)
            : null;
          if (loc && loc.deathSentence && !loc.currentAnchored && !loc.otherPastAnchor) {
            result = result.slice(0, loc.listStart) + (loc.isList ? "daha önce" : anchorTr) + " " + result.slice(loc.listStart);
          }
        }
        result = result.replace(
          new RegExp(`(?<![\\p{L}\\p{N}])(son\\s+)?(${ctSrc})\\s*${TR_COUNT_UNIT_ALT}${TR_SUFFIX_GUARD}`, "giu"),
          (m: string, son: string | undefined, tok: string, off: number, full: string) => {
            if (wordCountOutsideDeathClause(tok, full, off + (son ?? "").length)) return m;
            if (validation.actualCount >= 2) return `${son ?? ""}${validation.actualCount} kez`;
            removed = true;
            return "";
          },
        );
        if (removed) result = repairTrSeam(result, lang, before2);
      } else {
        const countPatterns = [
          new RegExp(`${ct}\\s*kez`, "gi"),
          new RegExp(`${ct}\\s*defa`, "gi"),
          new RegExp(`${ct}\\s*round(s)?\\s*(in\\s*a\\s*row|straight|consecutive)?`, "gi"),
          new RegExp(`${ct}\\s*time(s)?`, "gi"),
          new RegExp(`${ct}\\s*death(s)?`, "gi"),
          new RegExp(`${ct}\\s*match(es)?\\s*in\\s*a\\s*row`, "gi"),
        ];
        const replacement = validation.actualCount >= 2 ? `${validation.actualCount} times` : "";
        const beforeCnt = result;
        // FB05 · F14 (2) EN aynası: "You died at B Main 3 times" (tek kanıt R2) → "… at B Main
        // in R2" (eskiden "You died at B Main , …": çapa kaybı + boşluk artığı).
        if (validation.actualCount === 1 && claims.claimedPosition) {
          const anchorEn = pastRoundAnchor(validation, "en");
          const loc = anchorEn
            ? locateCountClaim(result, new RegExp(`(?<![\\p{L}\\p{N}])()${ct}\\s*times?(?![\\p{L}])`, "giu"), claims.claimedPosition)
            : null;
          if (loc && loc.deathSentence && !loc.currentAnchored && !loc.otherPastAnchor) {
            result = result.slice(0, loc.countStart) + (loc.isList ? "earlier" : anchorEn) + result.slice(loc.countEnd);
          }
        }
        for (const re of countPatterns) {
          result = result.replace(re, replacement);
        }
        // Silme noktalamadan önce boşluk bırakmışsa ("B Main , change") onar — yalnız değiştiyse.
        if (result !== beforeCnt) result = result.replace(/ +([,.;:!?])/g, "$1");
      }
    }

    // Pencere iddiası: TR'de rewriteTrWindowUnit sayıyı ZATEN kısalttı (doğru
    // bir indirme, isim/ek yerinde); EN yolu eskisi gibi "recently" ile nötrlenir.
    if (claims.claimedWindow !== null && !trText && !ofLastHandled) {
      const w = claims.claimedWindow;
      // TR-KALAN-14: salt-pencere iddiası artık bu yola ULAŞIYOR → EN çıktısı
      // dilbilgisel kalmalı. Öndeki edat+artikel ("over the / in the") birlikte
      // tüketilir (eski hâli "Over the last 12 rounds" → "Over the recently"),
      // cümle başındaysa büyük harf korunur ("Last 8 rounds" → "Recently").
      const EN_PRE = "\\b(?:(?:over|in|during|for)\\s+)?(?:the\\s+)?";
      const windowPatterns = [
        new RegExp(`son\\s+${w}\\s*round`, "gi"),
        new RegExp(`son\\s+${w}\\s*maç`, "gi"),
        new RegExp(`${EN_PRE}last\\s+${w}\\s*round(s)?`, "gi"),
        new RegExp(`${EN_PRE}last\\s+${w}\\s*match(es)?`, "gi"),
        new RegExp(`${EN_PRE}past\\s+${w}\\s*round(s)?`, "gi"),
      ];
      for (const re of windowPatterns) {
        result = result.replace(re, (m: string) => (/^[A-Z]/.test(m) ? "Recently" : "recently"));
      }
    }

    // FIX #3+#4: If repetition invalid, strip repetition claims at level 2 too.
    // B02 İNCELEME: eski hâli anahtarı HAM ALT-DİZGE olarak siliyordu
    // (new RegExp(keyword,'gi')) → "sürekli aynı pozisyonda ölüyorsun" → "da
    // ölüyorsun", "your pattern shows" → "your shows" (replay E22), "pattern'e" →
    // "'e" (M1-R4). Artık stripRepetitionLevel2: NİTELEYİCİ anahtarlar ("tekrar
    // eden", "tekrar tekrar", "hep aynı", çapalı "sürekli") sözcük sınırıyla YERİNDE
    // düşer (korpusta "tekrar eden açını" → "açını" doğru çalışan yol korunur); İSİM
    // anahtarlar ("aynı pozisyon", "pattern", "same spot") yerinde silinemez → o
    // YAN-CÜMLE düşer. Belirsiz anahtar çapasızsa hiç sayılmaz (öğüt korunur).
    if (!validation.repetitionValid) {
      const kept = stripRepetitionLevel2(result, trText);
      if (kept !== result) {
        result = kept || (allowEmptyFallback
          ? (trText ? "Bu round beklenen açıdan vuruldun." : "You were caught at the expected angle this round.")
          : "");
        if (!result) return "";
      }
    }
  }

  if (validation.rewriteLevel === 3) {
    // No memory support — strip ALL historical and repetition claims.
    // Detect language from the (already-mostly-cleaned) result so the neutral
    // fallback (used only if EVERY sentence gets dropped) matches the language.
    // Denetim 2026-07-19 (F5): lang verilmişse kesin; verilmezse eski heuristik.
    const isTr = lang ? lang === "tr" : /[şçğıöü]|round'da|maç|tur|round'lar/i.test(result);

    // FB05 · F14 (2): sayım iddiasına BAĞLI konumun hafızada HİÇ kanıtı yok (actualCount 0) →
    // sayım aşağıda silinince kalan "B Main'de öldün" bu round'un konum iddiasına dönüşürdü.
    // Bağlı konum (+ bulunma eki / EN edatı) burada düşer. Bu round'un ölçülen konumu
    // (protectedLocs), liste hâli ve ölüm-dışı cümle HARİÇ. Yalnız "kez/defa" (TR) ve
    // "times" (EN) birimleri — "N of the last M" / pencere birimi kendi yolunda kalır.
    const cp = claims.claimedPosition;
    if (claims.claimedCount !== null && cp && validation.actualCount === 0
      && ![...(protectedLocs ?? [])].some((l) => l.includes(cp) || cp.includes(l))) {
      const unitRe = isTr
        ? new RegExp(`(?<![\\p{L}\\p{N}])(son\\s+)?${trCountTokenSrc(claims.claimedCount)}\\s*${TR_COUNT_UNIT_ALT}${TR_SUFFIX_GUARD}`, "giu")
        : new RegExp(`(?<![\\p{L}\\p{N}])()${claims.claimedCount}\\s*times?(?![\\p{L}])`, "giu");
      const loc = locateCountClaim(result, unitRe, cp);
      if (loc && !loc.isList && loc.deathSentence) {
        if (isTr) {
          const suf = /^\s*['’]?\s*(?:d[ae]|t[ae])(?![\p{L}])[ \t]*/u.exec(result.slice(loc.posEnd));
          if (suf) result = result.slice(0, loc.posStart) + result.slice(loc.posEnd + suf[0].length);
        } else {
          const prep = /\s(?:at|in|on|near)\s+$/i.exec(result.slice(0, loc.posStart));
          if (prep) result = result.slice(0, loc.posStart - prep[0].length) + result.slice(loc.posEnd);
        }
      }
    }

    // DROP the ENTIRE sentence that carries an unproven repetition claim,
    // instead of the old in-place keyword→"bu round'da" substitution which
    // produced broken Turkish like "Bu bu round'da eden hata". Split on
    // sentence boundaries, keep only sentences with NO repetition keyword.
    //
    // TR-KALAN-25 (2026-09-23): silme birimi CÜMLE değil YAN-CÜMLE. Modelin tipik
    // çıktısı ";" / "—" ile bağlı TEK cümle; cümle bütün düşünce ders ve ölüm olgusu
    // da gidiyor ve yerine kalıp satır yazılıyordu. Cümle [;—] ile bölünür (virgül
    // DEĞİL), yalnız tekrar-iddiası taşıyan yan-cümle düşer; kalan yan-cümleler
    // aradaki ilk ayıraçla birleşir. Kalıp satır YALNIZ hiçbir yan-cümle kalmazsa.
    // İddia TESPİTİ cümle kapsamında (extractClaims ile aynı); SİLME kararında
    // belirsiz anahtarın çapası YAN-CÜMLENİN KENDİSİNDE aranır. Ölçüldü: cümle
    // kapsamı phoenix-c NR'de ("R7'de yine aynı açıdan öldün — bir sonraki round
    // A Heaven'da aynı pozisyonda bekleme, off-angle al…") çapa ("R7/yine") ilk
    // yan-cümlede olduğu için ÖĞÜT yan-cümlesini silip geriye yalnız geçmiş-zaman
    // ölüm satırını bırakıyordu (Cycle 3'ün "öneri alanında ölüm kalıbı" dersi).
    result = dropRepetitionClauses(result, isTr);
    if (!result) {
      // Cycle 3 (council 2026-06-26): a nextRoundSuggestion must NOT be replaced
      // by a past-tense death stub — return "" so the caller keeps the original
      // (still-actionable) advice instead. Only deathAnalysis/generic get the
      // neutral fallback.
      if (!allowEmptyFallback) return "";
      // Every sentence was an unproven repetition claim → neutral, language-
      // matched fallback. NOT coach advice (no-fake: this is a safety strip,
      // not synthesized coaching) — just a factual, non-overclaiming line.
      result = isTr
        ? "Bu round beklenen açıdan vuruldun."
        : "You were caught at the expected angle this round.";
    }

    // B2 (2026-09-16): level-3'te actualCount MATEMATİKSEL OLARAK 0'dır
    // (validateClaims:253 `positionValid = claimedPosition === null || actualCount > 0`;
    // level-3 ⇒ positionValid=false) → yazılacak KANIT YOK, yalnız SİLME meşru.
    // Eski desenler birimi ORTASINDAN silip "Son 'un hepsinde öldün" (M1-R25) /
    // "Son 'da her round öldün" (r4-a) bırakıyordu; bu çağrı birimi EKİYLE
    // BİRLİKTE siler, cümle AYAKTA kalır.
    // ⚠ "Son round'larda" gibi bir ifade YAZILMAZ: kanıt sıfırken o da YENİ bir
    // tarihsel iddiadır ve bu bloğun kendi beyanına (:355 "strip ALL historical
    // and repetition claims") aykırıdır.
    // YERLEŞİM BİLİNÇLİ: tekrar-iddiası CÜMLE süzgecinden (:365-370) SONRA →
    // repetition taşıyan cümleler eskisi gibi tamamen düşmeye devam eder.
    if (isTr) {
      result = rewriteTrWindowUnit(result, validation.actualWindow, validation.actualCount, true, lang);
    }

    // B02 İNCELEME: EN "N of the last M rounds" birimi kanıt yokken "recently"ye
    // iner (birim bütün olarak); genel desenler onu bir daha görmez.
    const ofLast3 = !isTr && claims.claimedCount !== null
      && rewriteEnOfLast(result, validation, true) !== result;
    if (ofLast3) result = rewriteEnOfLast(result, validation, true);

    // Remove count claims entirely (TR + EN forms).
    // TR_SUFFIX_GUARD (B2): ek almış biçim ("4 round'un", "3 turda") ARTIK
    // buradan silinmez — yetim ek bırakmanın tek yolu buydu.
    // B02 İNCELEME: TR "son N kez" birimi "son" ile birlikte düşer (öksüz "Son" yok);
    // sol rakam sınırı ct=3'ün "13 kez"e yapışmasını engeller.
    if (claims.claimedCount !== null && !ofLast3) {
      const ct = claims.claimedCount;
      // FB06 · F57: TR sayım TEK ortak alternasyonla (rakam | yazıyla; kez|defa|kere) silinir,
      // "son üç kez" dahil. Yazıyla biçim ölüm yan-cümlesi dışındaysa (öğüt) DOKUNULMAZ.
      const countPatterns = isTr
        ? [
            new RegExp(`(?<![\\p{L}\\p{N}])(son\\s+)?(${trCountTokenSrc(ct)})\\s*${TR_COUNT_UNIT_ALT}${TR_SUFFIX_GUARD}`, "giu"),
          ]
        : [
            new RegExp(`${ct}\\s*kez`, "gi"),
            new RegExp(`${ct}\\s*defa`, "gi"),
            new RegExp(`${ct}\\s*round(s)?\\s*(in\\s*a\\s*row|straight|consecutive)?`, "gi"),
            new RegExp(`${ct}\\s*time(s)?`, "gi"),
            new RegExp(`${ct}\\s*death(s)?`, "gi"),
            new RegExp(`${ct}\\s*match(es)?\\s*in\\s*a\\s*row`, "gi"),
          ];
      const beforeCnt3 = result;
      for (const re of countPatterns) {
        result = isTr
          ? result.replace(re, (m: string, son: string | undefined, tok: string, off: number, full: string) =>
            (wordCountOutsideDeathClause(tok, full, off + (son ?? "").length) ? m : ""))
          : result.replace(re, "");
      }
      // FB05 · F14: EN silme artığı ("You died , change") — yalnız değiştiyse (TR'yi repairTrSeam onarır).
      if (!isTr && result !== beforeCnt3) result = result.replace(/ +([,.;:!?])/g, "$1");
    }

    // Remove window claims (TR + EN). TR tarafını rewriteTrWindowUnit kaldırdı.
    if (claims.claimedWindow !== null && !isTr && !ofLast3) {
      const w = claims.claimedWindow;
      // TR-KALAN-14: level-2 ile aynı EN öneki — "Over the last 12 rounds you
      // died…" eskiden "Over the you died…" bırakıyordu.
      const EN_PRE = "\\b(?:(?:over|in|during|for)\\s+)?(?:the\\s+)?";
      const windowPatterns = [
        new RegExp(`son\\s+${w}\\s*(round|maç)`, "gi"),
        new RegExp(`${EN_PRE}last\\s+${w}\\s*(round|match)(es|s)?`, "gi"),
        new RegExp(`${EN_PRE}past\\s+${w}\\s*(round|match)(es|s)?`, "gi"),
      ];
      const beforeWin = result;
      for (const re of windowPatterns) result = result.replace(re, "");
      // Silme metin başını açtıysa büyük harf korunur (yalnız gerçekten sildiyse).
      if (result !== beforeWin && /^[A-Z]/.test(beforeWin.trim())) {
        result = result.replace(/^[\s,;:]*([a-z])/, (_m, c: string) => c.toUpperCase());
      }
    }

    // FB06 · F41: eski `result.replace(/\bpattern\b/gi, "")` KALDIRILDI. "pattern" tekrar
    // anahtarı olduğu sürece dropRepetitionClauses onu taşıyan her yan-cümleyi zaten düşürdüğü
    // için satır no-op'tu; "pattern" BELİRSİZ listeye taşınınca çapasız betimi ("punished the
    // duel pattern") ortasından kesip "the duel ." bırakırdı. Çapalı iddia yukarıda düşüyor.
    // Silmeler cümle başında/ortasında boşluk-virgül bırakmış olabilir.
    if (isTr) result = repairTrSeam(result, lang, text);
  }

  // Clean up double spaces and trailing punctuation issues
  result = result.replace(/\s{2,}/g, " ").trim();

  return result.trim();
}

/** Tekrar-iddiası taşıyan YAN-CÜMLELERİ düşürür (level-3 süzgeci; B02 incelemede
 *  rewriteUnsafeClaims içinden bu fonksiyona taşındı, davranış AYNEN). Cümle [.!?]
 *  ile, cümle içi [;—] ile bölünür (virgül DEĞİL — TR-KALAN-25); iddia tespiti cümle
 *  kapsamında, silme kararı yan-cümlenin KENDİ içinde (belirsiz anahtarın çapası
 *  dahil). Hiçbir yan-cümle kalmazsa "" döner (çağıran fallback'e karar verir). */
function dropRepetitionClauses(text: string, isTr: boolean): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const safe: string[] = [];
  for (const sent of sentences) {
    if (repetitionKeyIn(sent, sent, isTr) === undefined) { safe.push(sent); continue; }
    const mEnd = /[.!?]+$/.exec(sent);
    const body = mEnd ? sent.slice(0, mEnd.index) : sent;
    const end = mEnd ? mEnd[0] : "";
    const parts = body.split(/(\s*[;—]\s*)/);          // [yan0, ayıraç0, yan1, …]
    let rebuilt = "";
    let pendingSep = "";
    let firstDropped = false;
    for (let i = 0; i < parts.length; i += 2) {
      const clause = parts[i];
      if (!clause.trim() || repetitionKeyIn(clause, clause, isTr) !== undefined) {
        if (i === 0) firstDropped = true;
        continue;
      }
      rebuilt += (rebuilt ? pendingSep : "") + clause;
      pendingSep = parts[i + 1] ?? "";
    }
    rebuilt = rebuilt.trim();
    if (!rebuilt) continue;                             // cümlenin tamamı iddiaydı
    if (firstDropped) {
      rebuilt = rebuilt.replace(/^([a-zçğıöşü])/u, (c) => (isTr ? c.toLocaleUpperCase("tr-TR") : c.toUpperCase()));
    }
    safe.push(rebuilt + end);
  }
  return safe.join(" ").trim();
}

/** Level-2 tekrar süzgeci (B02 inceleme) — bkz. rewriteUnsafeClaims level-2 notu.
 *  Yerinde silinemeyen İSİM anahtarlar; geri kalanlar NİTELEYİCİDİR. */
const REPETITION_NOUN_KEYS = new Set(["aynı pozisyon", "aynı bölge", "pattern", "same spot", "same position"]);
function stripRepetitionLevel2(text: string, isTr: boolean): string {
  const up = (c: string) => (isTr ? c.toLocaleUpperCase("tr-TR") : c.toUpperCase());
  const out: string[] = [];
  for (const sent of text.split(/(?<=[.!?])\s+/)) {
    if (repetitionKeyIn(sent, sent, isTr) === undefined) { out.push(sent); continue; }
    const mEnd = /[.!?]+$/.exec(sent);
    const body = mEnd ? sent.slice(0, mEnd.index) : sent;
    const end = mEnd ? mEnd[0] : "";
    const parts = body.split(/(\s*[;—]\s*)/);
    let rebuilt = "";
    let pendingSep = "";
    for (let i = 0; i < parts.length; i += 2) {
      let c = parts[i];
      if (repetitionKeyIn(c, c, isTr) !== undefined) {
        for (const k of REPETITION_KEYWORDS) {
          if (REPETITION_NOUN_KEYS.has(k)) continue;
          if (AMBIGUOUS_REPETITION.has(k) && !CROSS_ROUND_ANCHOR_RE.test(c)) continue;
          c = c.replace(new RegExp(`(?<![\\p{L}])${escapeRe(k)}(?![\\p{L}])\\s*`, "giu"), "");
        }
        // FB06 · F41: sayım bağlamlı "straight" NİTELEYİCİDİR — eskisi gibi yalnız kelime yerinde
        // düşer ("3 rounds straight at" → "3 rounds at"); bağlamsız "straight duel" dokunulmaz.
        c = c.replace(new RegExp(EN_STRAIGHT_COUNT_SRC, "giu"),
          (m: string) => m.replace(/(?:^|\s+)straight(?=\s|$)/i, "").trim());
        c = c.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
        if (!c.trim() || repetitionKeyIn(c, c, isTr) !== undefined) continue;   // isim anahtar → yan-cümle düşer
      }
      rebuilt += (rebuilt ? pendingSep : "") + c;
      pendingSep = parts[i + 1] ?? "";
    }
    rebuilt = rebuilt.trim();
    if (!rebuilt) continue;
    if (/^\p{Lu}/u.test(sent.trim())) rebuilt = rebuilt.replace(/^([a-zçğıöşü])/u, (ch) => up(ch));
    out.push(rebuilt + end);
  }
  return out.join(" ").trim();
}

/** EN "(in) N (out) of the/your last|past M rounds" birimini hafızaya göre yazar
 *  (B02 inceleme). drop=false (level 2): sayı yalnız İNER (asla yükselmez), pencere
 *  yalnız KISALIR; ölüm yoksa birim "recently" olur. drop=true (level 3, kanıt yok):
 *  birim "recently" olur. Birim yoksa metin bayt-aynı döner. */
const EN_OF_LAST_RE = /(\b(?:in|over|during)\s+)?(\d+)\s+(out\s+)?of\s+(the\s+|your\s+|my\s+)?(last|past|previous)\s+(\d+)\s+rounds?\b/gi;
function rewriteEnOfLast(text: string, v: ValidationResult, drop: boolean): string {
  return text.replace(EN_OF_LAST_RE,
    (m: string, pre: string | undefined, n: string, out: string | undefined, det: string | undefined, lp: string, w: string, off: number, full: string) => {
      // Olgu aşılaması yasağı: ölüm cümlesi değilse ("went first in 3 of the last 4") dokunma.
      if (!CLAIM_DEATH_MARKER.test(trSentenceAt(full, off))) return m;
      const recently = /^[A-Z]/.test(m) ? "Recently" : "recently";
      if (drop || v.actualCount < 1) return recently;
      const win = Math.min(parseInt(w, 10), v.actualWindow);
      const cnt = Math.min(parseInt(n, 10), v.actualCount);
      if (win === parseInt(w, 10) && cnt === parseInt(n, 10)) return m;
      return `${pre ?? ""}${cnt} ${out ?? ""}of ${det ?? ""}${lp} ${win} ${win === 1 ? "round" : "rounds"}`;
    });
}

// ── Route / Trade Anti-Fabrication Guard ──
//
// deathLocation tells us WHERE the player died — NEVER the route they took to
// get there. So "mid'den çıkıp A'da öldün" is a fabrication unless the desktop
// actually measured the route (FAZ3 minimap tracking). Likewise "trade
// alamadın" is a claim about a trade OUTCOME we may not have observed. This
// guard strips such unproven claims when the supporting fact is absent.
//
// Anchored to real callout names (POSITION_NAMES) so legitimate death-angle
// wording like "arkadan geldi" (came from behind) is NEVER touched — that's a
// direction, not a route origin. Imperative advice ("trade kur", "rotate yap")
// is also untouched; only PAST-TENSE origin/outcome claims match.
//
// factGround.hasRoute / hasTradeData are derived in the route from whether the
// desktop actually sent playerRoute / tradedByAlly for this round.

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Motion verbs that, following "<callout>'dan/den", assert an entry/route.
// ONLY past-tense / gerund CLAIM forms (çıkıp, geldin, gelerek…). Conditional
// or future advice ("gelirsen", "gelince", "çıkarsan", aorist "gelir") is
// deliberately NOT listed — stripping legit advice would degrade coach quality.
const ROUTE_ORIGIN_VERBS =
  "(çıkıp|çıktın|çıkmışsın|çıkarak|gelip|geldin|gelmişsin|gelerek|geçip|geçtin|geçmişsin|geçerek|açılıp|açıldın|açılmışsın|girip|girdin|girmişsin|girerek|ilerleyip|ilerledin|gittin|gitmişsin)";

// NOTE: \w does NOT match Turkish ı/ş/ğ/ç/ö/ü, so suffixed claim verbs are
// enumerated explicitly rather than via \w+ (e.g. "attın" would slip past att\w+).
const ROUTE_GENERIC_PATTERNS: RegExp[] = [
  /\brotasyon\s+(attın|attı|atmışsın|atmış|yaptın|yaptı|yapmışsın|yapmış)/gi,
  /\brotate\s+(ettin|etti|etmişsin)/gi,
  /\bgeri\s+dön(dün|üp|erek)/gi,
];

const TRADE_CLAIM_PATTERNS: RegExp[] = [
  /\btrade\s*['’]?\s*(alamadın|alınmadı|kuramadın|kurulmadı|edilemedin|edilmedi|yapılmadı|olmadı)/gi,
  /\btakım(ın)?\s+(seni\s+)?trade\s+(etmedi|alamadı|kurmadı|edemedi)/gi,
  /\btrade\s*['’]?\s*siz\s+(öldün|kaldın|gittin)/gi,
  // EN aynası (denetim 2026-07-19 F8): "your death wasn't traded" EN çıktıda
  // süzülmüyordu. TR ile aynı ilke: yalnız GEÇMİŞ-sonuç iddiaları; öğüt
  // ("make sure you get traded") listede DEĞİL. EN literal'ler TR metne değemez.
  /\b(?:wasn['’]?t|was\s+not|couldn['’]?t\s+be|didn['’]?t\s+get|never\s+got)\s+traded\b/gi,
  /\bwent\s+untraded\b/gi,
  /\bun-?traded\b/gi,
  /\bno\s+one\s+traded\s+you\b/gi,
  /\bnobody\s+traded\s+you\b/gi,
  /\bteam\s+(?:didn['’]?t|couldn['’]?t|failed\s+to)\s+trade\s+you\b/gi,
];

// Agent names for the killer-when-absent guard (2026-06-26 grounding audit).
const AGENT_NAMES = [
  "Jett", "Raze", "Phoenix", "Reyna", "Yoru", "Neon", "Iso", "Waylay",
  "Sage", "Killjoy", "Cypher", "Chamber", "Deadlock", "Vyse", "Veto",
  "Omen", "Brimstone", "Viper", "Astra", "Harbor", "Clove", "Miks",
  "Sova", "Breach", "Skye", "Fade", "Gekko", "KAY/O", "Kayo", "Tejo",
  "Reay", // model/OCR garble of "Reyna" (canlı-test 2026-06-29) — yakala ki katil-guard onu da nötrlesin
];
// Definite kill verbs (after coach-text's -miş→-di normalization runs upstream).
const KILL_VERBS = "(öldürdü|öldürdün|kesti|vurdu|düşürdü|indirdi|biçti)";

// ── Ortak ajan-alternasyonu (denetim B35 + B83, 2026-07-31) ──
// Uzun ad ÖNCE ("KAY/O" > "Kayo"). guardUnprovenFacts içindeki mevcut yerel
// NAME_ALT BİLİNÇLİ olarak yerinde bırakıldı — hasKiller=false yolu bayt-aynı kalsın.
const AGENT_NAME_ALT = AGENT_NAMES.map(escapeRe).sort((a, b) => b.length - a.length).join("|");

/**
 * killerInfo'dan GERÇEK katil ajanını çıkar (denetim B83, 2026-07-31).
 *
 * SÖZLÜK-BAĞLI, extractKillerWeapon ile birebir aynı anti-uydurma ilkesi: yalnız
 * RESMİ ajan tablosunda (format-display.knownAgent) kanıtlı bir ad kabul edilir;
 * serbest metin ("killed by xhtx") ASLA ajan sayılmaz. İKİ FARKLI resmi ad
 * geçiyorsa (OCR karışması / killfeed'de iki satır) null döner — belirsizken
 * metne DOKUNULMAZ. Dönüş: resmi ad ("Cypher", "KAY/O") ya da null.
 */
export function extractKillerAgent(killerInfo?: string | null): string | null {
  if (!killerInfo) return null;
  const found = new Set<string>();
  for (const raw of AGENT_NAMES) {
    const canon = knownAgent(raw);
    if (!canon) continue; // OCR garble'ı ("Reay") gerçek-katil kaynağı SAYILMAZ
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(raw)}(?![\\p{L}\\p{N}])`, "iu");
    if (re.test(killerInfo)) found.add(canon);
  }
  return found.size === 1 ? [...found][0] : null;
}

// ── DÜŞMAN SETUP/UTIL İDDİASI TESPİTİ (denetim B35, 2026-07-31) ──
// Üç koşul da AYNI CÜMLEDE sağlanmalı: (1) düşman öznesi, (2) util adı,
// (3) 3. TEKİL GEÇMİŞ util fiili. 2. tekil ("attın/kurdun" = oyuncunun kendi
// eylemi), emir kipi ("at/aç/kur" = öğüt) ve geniş/koşullu zaman ("atar/atarsa")
// listede YOK — ROUTE_ORIGIN_VERBS ile aynı ilke: yalnız GEÇMİŞ-İDDİA süzülür.
const ENEMY_UTIL_NOUNS = [
  "smoke", "duman", "flash", "molly", "molotof", "tuzak", "trap", "trapwire",
  "tripwire", "ult", "ultimate", "util", "utility", "yetenek", "duvar", "wall",
  "drone", "dart", "mayın", "kafes", "stun", "nade",
];
const ENEMY_UTIL_PAST_VERBS = [
  // TR — yalnız 3. tekil geçmiş
  "attı", "atmıştı", "açtı", "açmıştı", "kurdu", "kurmuştu", "dizdi", "dizmişti",
  "bıraktı", "bırakmıştı", "yerleştirdi", "yerleştirmişti", "kullandı", "kullanmıştı",
  "patlattı", "çekti",
  // EN aynası
  "threw", "placed", "lined", "popped", "dropped", "flashed", "walled", "used",
];
const ENEMY_SUBJECT_RE = new RegExp(
  `(?<![\\p{L}])(?:${AGENT_NAME_ALT}|düşman|rakip|enem(?:y|ies)|opponent)(?:['’]?[\\p{L}]{0,6})?(?![\\p{L}])`,
  "iu",
);
const ENEMY_UTIL_NOUN_RE = new RegExp(
  `(?<![\\p{L}])(?:${ENEMY_UTIL_NOUNS.map(escapeRe).join("|")})(?:['’]?[\\p{L}]{0,8})?(?![\\p{L}])`,
  "iu",
);
const ENEMY_UTIL_VERB_RE = new RegExp(
  `(?<![\\p{L}])(?:${ENEMY_UTIL_PAST_VERBS.map(escapeRe).join("|")}|set\\s+up)(?![\\p{L}])`,
  "iu",
);
// KANITLI ÖLÜM ÇEKİRDEĞİ — bu kalıbı taşıyan cümle util-iddiası yüzünden ASLA
// düşürülmez (2026-07-24 "nerede vurulduğunu söylemiyor" regresyonunun dersi:
// uydurmayı silerken GERÇEĞİ kaybetmek en pahalı hata).
const DEATH_CORE_RE = new RegExp(
  `(?<![\\p{L}])seni(?![\\p{L}])[^.!?\\n]{0,60}?(?:öldürdü|vurdu|kesti|düşürdü|indirdi|biçti|avladı|devirdi)(?![\\p{L}])`
  + `|(?<![\\p{L}])(?:öldün|vuruldun|öldürüldün|düştün|yakalandın)(?![\\p{L}])`
  + `|(?<![\\p{L}])(?:killed|shot|caught|picked|dropped|hit|took)\\s+you(?![\\p{L}])`,
  "iu",
);

/** Bir CÜMLE, kanıtsız düşman-setup/util iddiası taşıyor mu? (B35) */
function isUnprovenEnemyUtilClaim(sentence: string): boolean {
  if (DEATH_CORE_RE.test(sentence)) return false; // kanıtlı ölüm olgusu → dokunma
  return ENEMY_SUBJECT_RE.test(sentence)
    && ENEMY_UTIL_NOUN_RE.test(sentence)
    && ENEMY_UTIL_VERB_RE.test(sentence);
}

// Weapon names for the weapon-when-absent guard (Ölüm-Veri Sözleşmesi 2026-06-29).
// Used to strip a FABRICATED enemy-weapon claim when killerInfo has no "with <X>"
// (i.e. the killing weapon was never read). 'op'/'awp'/short ambiguous tokens
// DELIBERATELY EXCLUDED — 'operator' already covers it and short tokens risk
// matching unrelated words ('open', 'op' inside other words). loadout (the
// PLAYER'S own weapon) is a SEPARATE fact and is NEVER touched: the strip is
// anchored to a "seni ... <weapon> ... <kill-verb>" (enemy→player) pattern so
// legit loadout advice ("Vandal aldın ama vuramadın") and enemy-economy
// observations ("düşman shorty aldı") stay byte-identical (denetim fix #1/#3).
const WEAPON_NAMES = [
  "operator", "vandal", "phantom", "sheriff", "ghost", "classic", "spectre",
  "bulldog", "guardian", "marshal", "outlaw", "judge", "bucky", "ares", "odin",
  "stinger", "frenzy", "shorty",
];

/**
 * Build the Death-Data Contract ground truth from the raw request body + the
 * sanitized ctx. SINGLE source for BOTH the vision route AND the report route so
 * the fact-sheet (prompt) and the guard (post-process) read the SAME object —
 * no per-route drift. Every flag means "this fact was actually OBSERVED".
 *
 * alive/spike are HARD-false: the desktop sends no reliable signal (can't tell
 * "0" from "unread", spike only set when planted). Safe side = those claims are
 * always neutralized = zero fabrication. If the desktop later sends an explicit
 * read-flag/sentinel, flip these here — backend-only, no desktop dependency.
 */
export function buildFactGround(
  reqBody: Record<string, unknown>,
  ctx: Record<string, unknown>,
): FactGround {
  const killerInfo = typeof reqBody.killerInfo === "string" ? reqBody.killerInfo : "";
  return {
    hasKiller: killerInfo.length > 0,
    // Denetim B83 (2026-07-31): katil KESİN biliniyorsa adı da taşınır → guard
    // metindeki yanlış ajanı düzeltebilsin. Sözlükte yoksa/belirsizse null →
    // undefined kalır ve guard hiç çalışmaz (belirsizken metne dokunmayız).
    killerAgent: extractKillerAgent(killerInfo) ?? undefined,
    // TEK-KAYNAK (güvenlik denetimi L-1, 2026-07-08): eski /\bwith\s+\S/ kalıbı,
    // OCR'ın "with"i düşürdüğü "by reyna sheriff" formunu KAÇIRIYORDU → [SİLAH+KOMP
    // İPUCU] "silah: sheriff" derken factSheet "silah BİLİNMEYEN" diyor, guard
    // gerçek silahı strip'liyordu (çelişkili sinyal). extractKillerWeapon sözlük-
    // bağlı (yalnız gerçek silah adları eşleşir, serbest metin asla) → çıplak
    // token da GÖZLENMİŞ silahtır. İşaretçi + factSheet + guard artık aynı gerçeği
    // paylaşır; silah token'ı hiç yoksa guard eskisi gibi strip'ler.
    hasWeapon: killerInfo.length > 0 && extractKillerWeapon(killerInfo) !== null,
    hasDeathLocation: typeof ctx.deathLocation === "string" && (ctx.deathLocation as string).length > 0,
    deathLocation: typeof ctx.deathLocation === "string" ? (ctx.deathLocation as string) : undefined,
    hasDeathAngle: typeof ctx.deathAngle === "string" && (ctx.deathAngle as string).length > 0,
    hasHeadshot: reqBody.headshot === true,
    hasAliveCount: false,
    hasSpike: false,
    // B1 (2026-09-16): plant'in KURULDUĞU yönü ölçülmüş olgudur → guard artık
    // DOĞRU ifadeyi kesmez. İKİ KAPI birden — ctx kurucusunun KENDİ kapısının AYNISI:
    //   · died===true      → lib/vision-prompt-builder.ts buildVisionContext ctx ölüm
    //     bloğunu bu kapıyla açıyor (`if (reqBody.spikePlanted === true)
    //     ctx.spikePlanted = true;`), böylece guard'ın güvendiği olgu, prompt'a giren
    //     olgunun TAM AYNISI olur.
    //   · spikePlanted===true → false/undefined "kurulmadı" DEĞİL "bilinmiyor"
    //     demektir (hasSpike'ın daima-false gerekçesi aynen korunur).
    // reqBody okunuyor (ctx DEĞİL): buildVisionContext ham gövdeyi (killerInfo'yu
    // ctx'tekiyle değiştirerek) geçiyor. B06 (2026-09-24) sonrası route, eval-vision ve
    // replay-tr factGround'u AYNI kurucudan alıyor (eski elle kurulan eval
    // ctxForFacts aynası silindi) → ayna ayrı bakım istemez. Rapor yolu
    // (lib/report-prompt.ts buildReportCleaner) `...buildFactGround({}, {})` çağırdığı
    // için orada DAİMA false → rapor davranışı yalnız nötrleme yönünde değişir.
    // (Yorum W2 inceleme B06-F5 ile güncellendi: eski satır atıfları B06'da bayatlamıştı.)
    spikeObservedPlanted: reqBody.died === true && reqBody.spikePlanted === true,
    // Denetim B35 (2026-07-31): düşman yetenek/setup kullanımı HİÇ okunmuyor →
    // HARD-false (alive/spike ile aynı gerekçe). Masaüstü gerçek bir util sinyali
    // göndermeye başlarsa yalnız burası true olur — backend-only, desktop bağımlılığı yok.
    hasEnemyUtil: false,
    hasTradeData: typeof reqBody.tradedByAlly === "boolean",
    hasRoute: typeof ctx.playerRoute === "string" && (ctx.playerRoute as string).length > 0,
  };
}

/**
 * Strip route-origin and trade-outcome claims the supporting fact can't back.
 * Deterministic, grammar-collapsing (same house style as rewriteUnsafeClaims).
 */
export function guardUnprovenFacts(
  text: string,
  factGround: FactGround,
  // Denetim 2026-07-19 (F5): çağıran route istek dilini (reqLang) ZATEN biliyor —
  // özel-harf heuristiği özel-harfsiz TR cümleyi EN sayıp "an enemy"yi Türkçe
  // metne enjekte ediyordu. lang verilirse kesin; verilmezse eski heuristik →
  // mevcut 2-arg çağıranlar bayt-aynı.
  lang?: "tr" | "en",
): string {
  let result = text;

  // ── AJAN-BOŞ UYDURMA GUARD'I (canlı-test #9, 2026-08-04) ──────────────────
  // NEDEN: istek payload'ında oyuncunun ajanı BOŞ/Unknown iken model oyuncuya
  // ajan YAKIŞTIRABİLİYOR. Canlı kanıt: maç onaylanmadan atılan warmup AI
  // çağrısında agent alanı boştu ve model "Phoenix olarak kendi utilini..."
  // yazdı — oyuncu Brimstone'du. Warmup teslim edilmediği için kullanıcı
  // görmedi; ama maç ortasında agent-OCR boş kalabiliyor (bilinen ayrı desktop
  // sorunu) ve aynı uydurma o zaman KULLANICIYA gider.
  // KAPSAM DAR (bilinçli): yalnız OYUNCU-kendine-yakıştırma kalıpları düşer —
  // TR "<Ajan> olarak", EN "as <Agent>". Katil/düşman cümleleri ("Skye seni
  // öldürdü") bu kalıbı KURMAZ → onlara hiç dokunulmaz (killerInfo yolları
  // aşağıdaki mevcut guard'ların işi). Kalıp düşer, cümle akıcı kalır:
  // "Phoenix olarak kendi utilini kullanmadın" → "kendi utilini kullanmadın".
  // playerAgentKnown undefined/true iken blok HİÇ çalışmaz → mevcut çağıranlar
  // (report route dahil) bayt-aynı.
  // SIRA: killer-when-absent'ten ÖNCE — "Phoenix olarak ... Reyna seni vurdu"
  // metninde önce kalıp temizlenmezse STEP2 "Phoenix"i katil sanıp
  // "bir düşman olarak ..." bozuğunu üretebilir.
  if (factGround.playerAgentKnown === false) {
    const before = result;
    // TR: "<Ajan> olarak" (+ opsiyonel virgül). Türkçe-\b TUZAĞI: JS \b,
    // ş/ç/ğ/ı/ö/ü harflerinde kırılır → (?<![\p{L}]) sınıfı (dosya konvansiyonu).
    result = result.replace(
      new RegExp(`(?<![\\p{L}])(?:${AGENT_NAME_ALT})\\s+olarak(?![\\p{L}])\\s*,?\\s*`, "giu"),
      "",
    );
    // EN: "as <Agent>" (+ opsiyonel virgül). "such as Jett" BİLEREK MUAF —
    // "duelists such as Jett" meşru bir örnekleme, yakıştırma değil.
    result = result.replace(
      new RegExp(`(?<![\\p{L}])(?<!such\\s)as\\s+(?:${AGENT_NAME_ALT})(?![\\p{L}])\\s*,?\\s*`, "giu"),
      "",
    );
    if (result !== before) {
      // Kalıp cümle BAŞINDAN düştüyse kalan ilk harfi büyüt ("kendi utilini..."
      // → "Kendi utilini..."). Yalnız strip GERÇEKLEŞTİYSE çalışır — dokunulmamış
      // metnin harfleri değişmez (coach-text stripEnHedges emsali). TR'de
      // i→İ dönüşümü için toLocaleUpperCase("tr-TR") şart ("i".toUpperCase()="I").
      const trText = lang ? lang === "tr" : /[şçğıöü]/i.test(result);
      result = result.replace(/(^|[.!?]\s+)([a-zçğıöşü])/gu, (_m, p: string, c: string) =>
        p + (trText ? c.toLocaleUpperCase("tr-TR") : c.toUpperCase()),
      );
    }
  }

  // Killer-when-absent (grounding audit 2026-06-26): killerInfo OCR'da YOKKEN
  // model belirli bir düşman ajanını katil olarak İSİMLENDİREMEZ (S14: "Cypher
  // seni kesti" uydurması). Ajan adını "bir düşman"a indir — ölüm gerçek ama
  // katilin KİMLİĞİ bilinmiyor. hasKiller=true iken (killfeed var) DOKUNMA:
  // model killer'ı doğru isimlendirmeli. reality-checker bunu daha önce HİÇ
  // denetlemiyordu (audit'in #1 fabrikasyon kaynağı).
  // killerInfo OCR'da YOKKEN model katil ismi UYDURAMAZ. Canlı-test 2026-06-29:
  // killerInfo prefetch-timing yüzünden gönderilmiyordu → model roster'dan tahmin
  // edip (a) yanlış katil, (b) çoklu-aday hedge "Reyna ya da Jett ya da Deadlock",
  // (c) "unknown" sızıntısı üretiyordu. 4-adımlı deterministik collapse → tek
  // "bir düşman". hasKiller=true iken (killfeed okundu) DOKUNMA. (council node-test 8/8)
  if (factGround.hasKiller === false) {
    // Dil (2026-07-18): "bir düşman" EN çıktıya Türkçe sızdırıyordu — replacement
    // metnin diline uyar (EN kill-fiilleri de token'a eklendi ki STEP2 EN'de tetiklensin).
    // Denetim 2026-07-19 (F5): lang verilmişse heuristik yerine onu kullan.
    const trText = lang ? lang === "tr" : /[şçğıöü]/i.test(result);
    const AN_ENEMY = trText ? "bir düşman" : "an enemy";
    const NAME_ALT = AGENT_NAMES.map(escapeRe).sort((a, b) => b.length - a.length).join("|");
    // Denetim 2026-07-19 (F6): EN'de katil adının önündeki "the" artikeli match'e
    // DAHİL — eski hali "The Cypher killed you" → "The an enemy killed you" üretiyordu
    // (EN şemanın kendi few-shot kalıbı "the Cypher killed you..." → model bu formu
    // üretmeye teşvikli). TR metinde "the" geçmez → TR yolu bayt-aynı.
    const THE = "(?:the\\s+)?";
    const KILLER_TOKEN = `(?:${NAME_ALT}|unknown|bilinmeyen)`;
    const KV2 = "(?:vurup öldürdü|öldürdü|öldürdün|öldürüldün|kestiler|kesti|vuruldun|vurdun|vurdu|düşürdü|indirdi|biçti|aldılar|aldı|avladı|devirdi|götürdü|temizledi|killed you|shot you|killed|shot|picked you off|took you down|caught you)";
    const NLB = "(?<![a-zçğıöşüâîû])", NL = "(?![a-zçğıöşüâîû])";
    // STEP1: ≥2 üyeli katil-disjunction ("X ya da Y ya da Z" / "X or Y") → tek genel-düşman
    // TR-KALAN-21 (2026-09-23): STEP1 "çoklu aday = katil hedge'i" varsayımıyla
    // BAĞLAMSIZ çalışıyordu ve geleceğe dönük/koşullu koç tavsiyesini de indiriyordu:
    // "Jett/Reyna varsa agresif girişlerde…" → "bir düşman varsa…", "Jett/Reyna'nin
    // hızlı peek'ine trade verebilecek düzen kur." → "Bir düşmanın hızlı peek'ine…"
    // (vision-prompt.ts:292 modele enemyComp'u GENEL counter için kullanmasını
    // bizzat söylüyor). İki kapı — STEP2'nin KV2 şartının aynası:
    //   · ardından koşul kipi (varsa/yoksa/olursa/ise/oynuyorsa) geliyorsa DOKUNMA;
    //   · indirme yalnız AYNI yan-cümlede ([.!?;:—\n]) KV2 öldürme fiili ya da
    //     kurban çapası (seni/sana/senin/you/your) varsa — katil hedge'inin imzası.
    //   · SPEC SAPMASI (ölçülmüş): 2. şahıs ÖLÜM yüklemi de imzadır. Spec'in iki
    //     kapısı maliyetsiz replay'de bir katil-hedge'ini SIZDIRDI (cyclehedge/S14,
    //     katil bilinmiyor): "Raze ya da Brimstone util'ine yakalanıp öldün" — HEAD
    //     "bir düşman util'ine…" yapıyordu; "öldün" KV2'de ve kurban listesinde yok.
    //   · B02 İNCELEME (2026-09-23): "gibi" örneklemesi de koşul kipi gibi korunur
    //     ("Jett/Reyna gibi duelistler …"); KV2'ye 3. ÇOĞUL öldürme biçimleri eklendi
    //     (öldürdüler/vurdular…); imza BİTİŞİK yan-cümlede de aranır — ama YALNIZ
    //     disjunction'ın kendi yan-cümlesi GEÇMİŞ-zaman anlatıyla bitiyorsa (TR).
    //     Gerçek sızıntılar (katil bilinmiyor): cyclesummit/S14 "Hookah girişinde
    //     öldün; … Raze/Skye çapraz ateşinden yüzünü açtın", cyclefix1/S14
    //     "Cypher/Viper/Brimstone üçlüsünün kesişen açılarında kaldın — … seni oradan
    //     öldürdüler". Emir/öğüt yan-cümlesi ("… Skye/Brimstone'dan smoke iste")
    //     anlatı sonu taşımadığı için komşu ölüm cümlesine rağmen DOKUNULMAZ.
    const STEP1_COND = /^['’]?\s*(?:varsa|yoksa|olursa|ise|oynuyorsa|gibi)(?![a-zçğıöşüâîû])/i;
    const STEP1_VICTIM = /(?<![\p{L}])(?:seni|sana|senin|you|your)(?![\p{L}])/iu;
    const STEP1_KILL = new RegExp(`${NLB}(?:${KV2}|öldürdüler|vurdular|düşürdüler|indirdiler|biçtiler|avladılar|temizlediler)${NL}`, "i");
    const STEP1_DEATH = /(?<![\p{L}])(?:öldün|öldürüldün|düştün|yakalandın|elendin|died|got\s+killed|were\s+killed|went\s+down)(?![\p{L}])/iu;
    // Anlatı sonu: 2./3. şahıs GEÇMİŞ çekimli yüklem ("açtın", "kaldın", "vurdu",
    // "girmişsin", "bekliyordun"). Emir kökü ("iste", "kur", "tut") EŞLEŞMEZ.
    const STEP1_NARRATIVE_END = /(?:[dt][ıiuü](?:n|nız|niz|nuz|nüz|lar|ler)?|m[ıiuü]şs[ıiuü]n|yordu(?:n)?)\s*$/iu;
    const signature = (seg: string) => STEP1_VICTIM.test(seg) || STEP1_KILL.test(seg) || STEP1_DEATH.test(seg);
    result = result.replace(
      new RegExp(`${NLB}${THE}${KILLER_TOKEN}(?:\\s*(?:ya da|veya|or|/|,)\\s*${THE}${KILLER_TOKEN})+`, "gi"),
      (m: string, off: number, full: string) => {
        if (STEP1_COND.test(full.slice(off + m.length))) return m;
        let s = off;
        while (s > 0 && !/[.!?;:—\n]/.test(full[s - 1])) s--;
        let e = off + m.length;
        while (e < full.length && !/[.!?;:—\n]/.test(full[e])) e++;
        const clause = full.slice(s, off) + " " + full.slice(off + m.length, e);
        if (signature(clause)) return AN_ENEMY;
        if (!trText || !STEP1_NARRATIVE_END.test(full.slice(off + m.length, e))) return m;
        let S = s;
        while (S > 0 && !/[.!?\n]/.test(full[S - 1])) S--;
        let E = e;
        while (E < full.length && !/[.!?\n]/.test(full[E])) E++;
        const sentence = full.slice(S, off) + " " + full.slice(off + m.length, E);
        return signature(sentence) ? AN_ENEMY : m;
      },
    );
    // STEP2: tek isimli katil + aynı clause'da kill-verb → genel-düşman (char-cap YOK).
    // Lookahead formu (F6): yalnız "(the) <katil>" token'ı değişir, clause'un geri
    // kalanı verbatim kalır — eski m.slice(m.indexOf(mid)) hilesi "The " tüketilince
    // ilk boşluğu "The"nin içinde bulup katil adını geri sızdırıyordu.
    const SINGLE = new RegExp(`${NLB}${THE}${KILLER_TOKEN}\\b(?=[^.!?;:—\\n]*?\\s${KV2}${NL})`, "gi");
    // OYUNCU-KENDİ-AJANI MUAFİYETİ (W1 followup #51, W2 inceleme M1-R18): "<oyuncunun
    // ajanı> olarak" öbeği ("Jett olarak orada beklerken vuruldun" = oyuncu Jett'le
    // bekliyordu) KATİL İDDİASI DEĞİL; aynı yan-cümlede ölüm fiili geçtiği için STEP2
    // onu "bir düşman olarak" diye bozuyordu. Ölçüm: scripts/eval-out 1075 örnek zincir
    // çıktısında 15 tekil "bir düşman olarak" bozuğu, hepsi oyuncu = Jett olan gerçek
    // korpus (M1-*-ascent-jett). Muafiyet DAR: yalnız OKUNMUŞ oyuncu ajanı
    // (factGround.playerAgent) + hemen ardından "olarak". Başka ajan + "olarak" ve
    // "Jett seni vurdu" gibi katil cümleleri eskisi gibi indirilir.
    const selfAgent = (factGround.playerAgent ?? "").toLowerCase();
    result = result.replace(SINGLE, (m: string, off: number, full: string) =>
      selfAgent
        && m.replace(/^the\s+/i, "").toLowerCase() === selfAgent
        && /^\s+olarak(?![a-zçğıöşüâîû])/i.test(full.slice(off + m.length))
        ? m
        : AN_ENEMY);
    // STEP3: kalan stray "unknown"/"bilinmeyen" → genel-düşman
    result = result.replace(new RegExp(`${NLB}(?:unknown|bilinmeyen)${NL}`, "gi"), AN_ENEMY);
    // STEP4: "bir düşman ya da bir düşman" / "an enemy or an enemy" run'larını tek'e çökert
    result = result.replace(/bir düşman(?:\s*(?:ya da|veya|\/|,)\s*bir düşman)+/gi, "bir düşman");
    result = result.replace(/an enemy(?:\s*(?:or|\/|,)\s*an enemy)+/gi, "an enemy");
    // STEP5: İKAME DİKİŞİNİ ONAR (B3, 2026-09-16). STEP1-3 yalnız TOKEN'ı
    // değiştiriyordu; token'ın ÇEVRESİ bozuk kalıyordu (gerçek pipeline çıktısı,
    // cycletr-posters4):
    //   "Rakip Jett …"      → "Rakip bir düşman …"    (fazlalık niteleme)
    //   "Jett/Reyna'nin …"  → "bir düşman'nin …"      (apostroflu ek artığı)
    //   "Jett'ıyla …"       → "bir düşman'ıyla …"     (vasıta hâli)
    //   cümle başı "Jett …" → "bir düşman …"          (küçük harf)
    // Üçü de DAR ve ikame-token'a ÇAPALI. Blok hasKiller===false iken zaten
    // çalışıyor → katil BİLİNİYORKEN bayt-aynı.
    if (trText) {
      // "Rakip" yalnız hemen ardından ikame token'ı gelirse düşer. Sınır BİLEREK
      // gevşek: ek almış hâlde de ("Rakip bir düşmanın dash'i") niteleme fazlalık.
      result = result.replace(/(?<![\p{L}])[Rr]akip\s+(?=bir düşman)/gu, "");
      // Türkçe ek uyumu: kök ünsüzle biter → kaynaştırma "n" düşer, ünlü uyumu
      // kalın ("düşman" son ünlüsü "a") → -ın/-a/-ı/-da/-dan/-la.
      // ⚠ SIRA: vasıta hâli (l[ae]) belirtme/yönelmeden ÖNCE — "'ıyla" aksi
      //   hâlde hiçbir kurala düşmeyip apostroflu kalıyordu.
      const AN_ENEMY_SUFFIX: [RegExp, string][] = [
        [/bir düşman['’]\s*n?[ıiuü]n(?![\p{L}])/giu, "bir düşmanın"],
        [/bir düşman['’]\s*(?:n?d[ae]n|t[ae]n)(?![\p{L}])/giu, "bir düşmandan"],
        [/bir düşman['’]\s*(?:n?d[ae]|t[ae])(?![\p{L}])/giu, "bir düşmanda"],
        [/bir düşman['’]\s*(?:[yn]?[ıiuü])?y?l[ae](?![\p{L}])/giu, "bir düşmanla"],
        [/bir düşman['’]\s*[yn]?[ıiuü](?![\p{L}])/giu, "bir düşmanı"],
        [/bir düşman['’]\s*[yn]?[ae](?![\p{L}])/giu, "bir düşmana"],
        [/bir düşman['’](?![\p{L}])/giu, "bir düşman"],
      ];
      for (const [re, rep] of AN_ENEMY_SUFFIX) result = result.replace(re, rep);
      // Cümle başı: EKLİ hâlde de çalışsın diye yalnız "bir" büyütülür.
      result = result.replace(/(^|[.!?]\s+)bir(?=\s+düşman)/gu, "$1Bir");
    } else {
      // EN aynası — bugün "The Cypher killed you." → "an enemy killed you."
      // (küçük harf) çıkıyor. Yalnız büyük harf; TR ek tablosu çalışmaz.
      result = result.replace(/(^|[.!?]\s+)an(?=\s+enemy)/g, "$1An");
    }
  }

  // KATİL-TUTARLILIĞI (denetim B83, 2026-07-31): üstteki guard yalnız katilin
  // BİLİNMEDİĞİ durumu kapsıyordu; killerInfo OCR'da VARKEN model roster'daki
  // BAŞKA bir ajanı katil gösterirse ("killerInfo=killed by jett" iken "Cypher
  // seni vurdu") hiçbir katman yakalamıyordu. Burada uydurma ajan adı GERÇEK
  // katille DEĞİŞTİRİLİR (silme değil düzeltme — ölüm olgusu korunur).
  //
  // ÇAPA (dar bilinçli): ajan adı + AYNI virgülsüz clause içinde "seni" + öldürme
  // fiili (EN'de "killed/shot you"). Bu yüzden oyuncunun KENDİ ajanına yapılan
  // atıflar eşleşmez: "Jett'inle dash atabilirdin, Reyna seni vurdu" → virgül
  // clause'u kestiği için "Jett" DOKUNULMAZ. Apostroflu iyelik ("Jett'in ult'u")
  // da bilinçli DIŞARIDA — Türkçe ek uyumu bozulmasın ("Reyna'in" üretmeyelim).
  // killerAgent yoksa (sözlükte ajan yok / iki ad / rapor route'u maç-seviyesi)
  // guard HİÇ çalışmaz → mevcut davranış bayt-aynı.
  const truthKiller = factGround.killerAgent;
  if (factGround.hasKiller === true && truthKiller) {
    // clause sınırı: virgül dahil ayraçlar geçilmez.
    //
    // 🔴 AJAN-GEÇİRMEZ (karşı-denetim, 2026-07-31 gecesi): eskiden bu sınıf düz
    // `[^.,;:!?—\n]` idi ve guard, ölüm çekirdeğine giden yolda BAŞKA bir ajan adı
    // olsa bile ilk adı katille EZİYORDU. Yani uydurmayı önlemek için konan katman
    // kendisi uydurma üretiyordu:
    //     "Sage duvarını beklerken Cypher seni A Short'ta vurdu."
    //       → "Cypher duvarını beklerken Cypher seni A Short'ta vurdu."  ✗
    //     "Jett ile dash attın ve Reyna seni vurdu."
    //       → oyuncunun KENDİ ajanı katilin adıyla değişiyordu (canlı-test #7'de
    //         OCR tarafında düzelttiğimiz "ajan dönmesi"nin deterministik ikizi).
    // Çözüm: boşluğun HİÇBİR noktasında bir ajan adı başlamasın. Böylece guard'ın
    // asıl işi (metindeki YANLIŞ katili doğrusuyla düzeltmek) aynen sürer —
    // aradaki ikinci ajanı ezme davranışı biter.
    const CL = `(?:(?!(?<![\\p{L}])(?:${AGENT_NAME_ALT})(?![\\p{L}]))[^.,;:!?—\\n])`;
    const fixKiller = (m: string, pre: string, name: string) =>
      name.toLowerCase() === truthKiller.toLowerCase() ? m : `${pre}${truthKiller}`;
    // TR: "<Ajan> ... seni ... <öl-fiili>"
    result = result.replace(
      new RegExp(
        `(?<![\\p{L}])((?:the\\s+)?)(${AGENT_NAME_ALT})(?![\\p{L}'’])`
        + `(?=${CL}{0,50}?(?<![\\p{L}])seni(?![\\p{L}])${CL}{0,40}?${KILL_VERBS}(?![\\p{L}]))`,
        "giu",
      ),
      fixKiller,
    );
    // EN aynası: "<Agent> ... killed/shot you" (nesne fiilden SONRA gelir).
    result = result.replace(
      new RegExp(
        `(?<![\\p{L}])((?:the\\s+)?)(${AGENT_NAME_ALT})(?![\\p{L}'’])`
        + `(?=${CL}{0,50}?(?:(?:killed|shot|caught|dropped)\\s+you(?![\\p{L}])`
        + `|picked\\s+you\\s+off|took\\s+you\\s+down))`,
        "giu",
      ),
      fixKiller,
    );
  }

  // WEAPON-absent (Ölüm-Veri Sözleşmesi #2, 2026-06-29): killerInfo'da "with <silah>"
  // YOKKEN öldüren DÜŞMAN silahı BİLİNMİYOR → model silah-ismini UYDURAMAZ. Strip
  // SADECE "seni ... <silah> ... <öl-fiili>" (düşman→oyuncu öldürme) çapasına bağlı:
  // böylece (a) loadout/oyuncu-silahı ("Vandal aldın ama vuramadın") ve (b) düşman-
  // ekonomi gözlemi ("düşman shorty aldı") DOKUNULMADAN kalır (denetim fix #1/#3).
  // hasWeapon=true iken (killerInfo silahı içeriyor) DOKUNMA. 'aldı' fiil-listesinde
  // DEĞİL (çift-anlam: öldürdü/satın-aldı). Fiilden SONRA NL sınırı → 'vurdun/öldürdün'
  // gibi ekli formlar kısmi eşleşmesin.
  if (factGround.hasWeapon === false) {
    const WALT = WEAPON_NAMES.map(escapeRe).sort((a, b) => b.length - a.length).join("|");
    const NLB = "(?<![a-zçğıöşüâîû])", NL = "(?![a-zçğıöşüâîû])";
    const WKV = "(öldürdü|öldürdün|vurdu|vurdun|kesti|düşürdü|indirdi|biçti)";
    // "seni ... operator'la ... öldürdü" → silahı (+edatı) sil, geri kalanı koru.
    const re = new RegExp(
      `((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.!?;:—\\n]{0,40}?)${NLB}(?:${WALT})${NL}\\s*['’]?\\s*(?:l[ae]|ile)?\\s+([^.!?;:—\\n]{0,30}?)${WKV}${NL}`,
      "gi",
    );
    result = result.replace(re, (_m, pre, mid, verb) => `${pre}${mid}${verb}`);
    // EN AYNASI (CANLI-TEST-06, 2026-09-23): F8 EN-ayna dalgası (2026-07-19) bu kolu
    // atlamıştı → "Jett killed you with an Operator from long range." EN çıktıda
    // DEĞİŞMEDEN geçiyordu (TR karşılığı "Jett seni operator'la öldürdü" → "Jett seni
    // öldürdü"). Maliyetsiz replay: EN raw'ların baskın ölüm kalıbı tam bu
    // ("<Ajan> killed/shot you with a <Silah>", 30+ alan); real-rounds-23'te 22/22
    // ölümde killerInfo silahsız → hasWeapon=false canlıda olağan durum.
    // TR ile aynı sözleşme: yalnız GEÇMİŞ-kip, OYUNCU-nesneli ("… you with …") —
    // oyuncunun KENDİ loadout'u ("you bought a Vandal") ve öğüt ("buy an Operator",
    // "with an Operator you can hold…") çapaya uymaz → DOKUNULMAZ. Ölüm olgusu kalır.
    result = result.replace(
      new RegExp(`(?<![\\p{L}])(killed|shot|one-tapped|got|dropped|picked|took)\\s+you(\\s+(?:off|down|out))?\\s+with\\s+(?:(?:a|an|the|his|her|their)\\s+)?(?:${WALT})(?![\\p{L}])`, "giu"),
      (_m: string, v: string, tail: string | undefined) => `${v} you${tail ?? ""}`,
    );
    // İyelikli özne: "Reyna's Vandal shot you" → "Reyna shot you".
    result = result.replace(
      new RegExp(`(?<![\\p{L}])((?:the\\s+)?(?:${AGENT_NAME_ALT}))['’]s\\s+(?:${WALT})\\s+(shot|killed)\\s+you(?![\\p{L}])`, "giu"),
      "$1 $2 you",
    );
  }

  // ALIVE-COUNT-absent (Ölüm-Veri Sözleşmesi #6, 2026-06-29): hayatta-sayısı
  // güvenilir DEĞİL (desktop '0 gerçekten 0' vs 'OCR okunamadı' ayrımı göndermiyor)
  // → hasAliveCount DAİMA false → "N düşman kaldı / 1vN kaldın / takımın N kişi sağ"
  // sayı-iddiasını sil. hasAliveCount=true iken (ileride desktop güvenilir sinyal
  // gönderirse) DOKUNMA.
  if (factGround.hasAliveCount === false) {
    const ALIVE_PATTERNS: RegExp[] = [
      /\b\d+\s*(düşman|rakip)\s*(kaldı|sağ|hayatta|vardı)/gi,
      /\b\d+\s*v\s*\d+\b/gi,                       // "1v3", "2 v 4"
      /\btakım(ın)?\s+\d+\s*kişi\s*(sağ|kaldı|hayatta)/gi,
      /\b\d+\s*kişi\s*(sağ\s*kaldı|hayatta\s*kaldı)/gi,
      // EN aynası (denetim 2026-07-19 F8): "3 enemies left/alive" EN çıktıda
      // süzülmüyordu. EN literal'ler TR metinle eşleşemez → TR yolu bayt-aynı.
      /\b\d+\s*enem(?:y|ies)\s+(?:left|alive|remaining|up)\b/gi,
      /\b\d+\s*(?:allies|teammates?|players?)\s+(?:left|alive|remaining)\b/gi,
    ];
    for (const re of ALIVE_PATTERNS) result = result.replace(re, "");
  }

  // SPIKE (Ölüm-Veri Sözleşmesi #7, 2026-06-29 → B1 kök-fix 2026-09-16)
  //
  // 🔴 CANLI HATA (TR pipeline ölçümü 16.09; kanıt scripts/eval-out/
  // cycletr-cards-samples.json → astra-a / r2-a / r4-a, ÜÇÜNÜN de girdisinde
  // spikePlanted:true):
  //   raw   "A site'te spike kurulduktan sonra açık alanda kaldın"
  //   final "A site'te ktan sonra açık alanda kaldın"
  // Sebep: eski ilk kalıp SAĞ SINIRSIZDI → "kurulduktan" içinden "kuruldu"yu
  // söküyordu. lib/coach-text.ts:1000-1003 aynı tuzağın "ğ" artığını zaten
  // biliyordu; "ktan" artığı o ağdan kaçıyordu.
  //
  // 🔴 KOD KENDİSİYLE ÇELİŞİYORDU (KB-10h nöbetinin dersi): plant ÖLÇÜLEN bir
  // olgu ve prompt'un ÜÇ katmanı modele onu SÖYLETİYOR —
  //   · route.ts:941+1222+1460 → ctx.spikePlanted, "[ROUND CONTEXT — OCR pixel
  //     truth, screenshot'tan güvenilir]" başlığıyla user mesajına giriyor,
  //   · lib/death-type.ts:198 → tip "post-plant-solo", :77 direktifi modeli
  //     KB'nin "Post-Plant Ölümleri" bölümüne yolluyor,
  //   · knowledge/ranks/universal.md:360 → o bölüm "spike kurulduktan sonra"
  //     ifadesini BİZZAT öğretiyor.
  // Sonra bu katman aynı ifadeyi kesiyordu. Kesme anti-uydurma işini de
  // GÖRMÜYORDU: korpustaki 14 spike-iddiasının 11'i ("kurulu iken",
  // "kuruluyken", "kurulurken", "kurulduğunda") hiç yakalanmadan sızıyordu.
  //
  // SÖZLEŞME — DÖRT SINIR:
  //  (1) SAĞ SINIR: her TR kalıbı NL_S ile biter → kelime-ortası kesme İMKÂNSIZ.
  //  (2) SİLME YERİNE NÖTRLEME: yan-cümle atılmaz, koç diline çevrilir →
  //      cümlenin dilbilgisi bozulmaz.
  //  (3) GÖZLENEN PLANT KORUNUR: spikeObservedPlanted=true iken olumlu ifade
  //      AYNEN kalır; yalnız ÇELİŞEN olumsuz iddia ve defuse iddiası düşer.
  //  (4) FAZ TERSİNE ÇEVRİLMEZ + ÖĞÜT FORMU DOKUNULMAZ:
  //      · "kurulurken / kurarken / kurmuşken" = plant HENÜZ SÜRÜYOR. Bunları
  //        "post-plant" diye yazmak OLGUYU TERSİNE ÇEVİRİR (anti-uydurma katmanı
  //        uydurma ÜRETİR) → listede YOK, bugünkü gibi bayt-aynı bırakılır.
  //        Yalnız DURUM formları ("kurulu iken/kuruluyken") post-plant'tir.
  //      · EN'de yalnız GEÇMİŞ-iddia (was/got/had been). "is/gets/once … is
  //        down" ÖĞÜTTÜR; :814-816'daki yazılı muafiyet aynen korunur.
  //      · "with/while the spike down" bugün HİÇ eşleşmiyor ve ölçülmüş bir
  //        hatası yok → yüzey BÜYÜTÜLMEZ.
  if (factGround.hasSpike === false) {
    const NLB_S = "(?<![\\p{L}])", NL_S = "(?![\\p{L}])";
    // "spike" + opsiyonel kesme + opsiyonel belirtme eki ("spike'ı kurduktan").
    // Türkçe-\b TUZAĞI: JS \b ş/ç/ğ/ı/ö/ü'de kırılır → dosya konvansiyonu \p{L}.
    const SP = `${NLB_S}spike\\s*['’]?\\s*(?:[ıiu]\\s+)?`;
    // İddiayla BİRLİKTE yutulan bağlaç öneki (öksüz "ve" kalmasın —
    // "Açıkta kaldın ve spike kuruldu." → "Açıkta kaldın.").
    const TR_CONJ = "(?:\\s+(?:ve|ama|ancak|fakat)(?![\\p{L}])\\s+)?";
    const before = result;
    const spikeUp = factGround.spikeObservedPlanted === true;

    if (!spikeUp) {
      // (a) ZAMAN yan-cümlesi → "plant sonrası". Kuyruk ("sonra/sonraki/
      //     sonrasında") birlikte tüketilir, yoksa "plant sonrası sonrasında" çıkar.
      result = result.replace(
        new RegExp(`${SP}kur(?:ul)?(?:duktan|duğunda|dugunda|unca|duysa)${NL_S}(?:\\s+(?:hemen\\s+)?sonra(?:ki|sında)?${NL_S})?`, "giu"),
        "plant sonrası",
      );
      // (b) DURUM yan-cümlesi (plant AYAKTA) → "post-plant'te".
      //     DİKKAT: "kurulurken/kurarken" BİLEREK YOK — bkz. sınır (4).
      result = result.replace(
        new RegExp(`${SP}kurulu\\s*(?:iken|yken|hâldeyken|haldeyken)${NL_S}`, "giu"),
        "post-plant'te",
      );
      // (c) EN aynası — aynı sınıf hata EN yolunda da ölçüldü:
      // "After the spike was planted you held one angle." → "After the you held
      // one angle." (öksüz "the"). Yalnız GEÇMİŞ kip.
      result = result.replace(
        /\b(?:after|once|as soon as)\s+(?:the\s+)?spike\s+(?:was|got|had been)\s+(?:planted|down)\b/gi,
        "after the plant",
      );
    }

    const SPIKE_DROP: RegExp[] = [
      // Olumsuz iddia: plant gözlenmemişse kanıtsız, gözlenmişse ÇELİŞKİ → daima düşer.
      new RegExp(`${TR_CONJ}${SP}(?:kurulmadı|kurulmamıştı)${NL_S}`, "giu"),
      // Defuse AMAÇ-ZARFI (TR-KALAN-12, 2026-09-23): "Spike defuse etmeye
      // çalışırken vuruldun" → eski desen yalnız "defuse etmeye"yi söküp öksüz
      // ulaç bırakıyordu ("Çalışırken vuruldun."). Zarf öbeği BÜTÜN düşer, dikiş
      // repairTrSeam'de onarılır → "Vuruldun." Olguyu yeniden yazmak ("defuse
      // denemesinde") defuse sinyali olmadığı için uydurma olurdu → silme.
      new RegExp(`${TR_CONJ}(?:${SP})?(?:defuse|defüz)\\s*etme(?:ye|k\\s+için)\\s+(?:çalışırken|uğraşırken|çalıştığın\\s+sırada)${NL_S}`, "giu"),
      // Defuse: sistemde HİÇBİR sinyal yok → spikeUp'tan BAĞIMSIZ, eski davranış.
      // Önündeki "spike" de yutulur (yoksa "Spike ve vuruldun." artığı kalıyordu);
      // TESPİT ÇAPASI DEĞİŞMEDİ — hâlâ defuse fiili. Meşru koç kullanımı
      // ("defuse hattını tut") fiil çapası olmadığı için DOKUNULMAZ.
      // TR-KALAN-12: çıplak mastar "etmeye" ÇIKARILDI — tek iddia biçimi
      // ("etmeye çalışırken") artık üstteki desenin; tek başına mastar ise
      // öğüt/3. şahıs dilidir ve siliniyordu: "Defuse etmeye çalışan düşmanı
      // molly ile durdur." → "Çalışan düşmanı molly ile durdur." (ölçüldü, HEAD).
      new RegExp(`${TR_CONJ}(?:${SP})?(?:defuse|defüz)\\s*(?:ediyordun|ettin|alıyordun)${NL_S}`, "giu"),
      new RegExp(`${TR_CONJ}${NLB_S}spike\\s*(?:defuse|çöz)${NL_S}`, "giu"),
      /(?:\s+(?:and|but|while))?\byou\s+were\s+defusing\b/gi,
      /(?:\s+(?:and|but))?\bwhile\s+defusing\b/gi,
    ];
    if (!spikeUp) {
      // Olumlu BİTMİŞ-fiil iddiası: yan-cümle değil, nötrlenemez → eski davranış
      // (sil), fakat artık SAĞ SINIRLI → "kurulduktan" içine GİREMEZ.
      SPIKE_DROP.push(new RegExp(`${TR_CONJ}${SP}(?:kuruldu|kurulmuştu|kurmuştun|açılmıştı)${NL_S}`, "giu"));
      // EN: artikel + öndeki bağlaç da tüketilir, yoksa "…remained and the spike
      // was down." → "…remained and the ." öksüz artikeli kalıyordu (ölçüldü).
      SPIKE_DROP.push(/(?:\s+(?:and|but|while|when|as))?\s*(?:the\s+)?\bspike\s+(?:was|got|had been)\s+(?:planted|down|ticking)\b/gi);
    }
    for (const re of SPIKE_DROP) result = result.replace(re, "");

    if (result !== before) result = repairTrSeam(result, lang, before);
  }

  // HEADSHOT-absent (canlı-test 2026-06-29): headshot verisi sistemde HİÇ okunmuyor
  // (combat-report sadece "killed by X"; silah/yer/headshot YOK) → "kafadan vuruldun/
  // öldün" %100 UYDURMA. Ölüm-tarifindeki "kafadan"ı sil ("seni ... kafadan [öl-verb]"
  // → "seni ... [öl-verb]"). İMPERATİF/GELECEK ÖĞÜT "kafadan vur" KORUNUR (anchor:
  // "seni" + ölüm-fiili). hasHeadshot=true gelirse (ileride OCR) strip atlanır.
  if (factGround.hasHeadshot === false) {
    result = result.replace(
      /((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,50}?)kafadan (vurup öldürdü|öldürdü|öldürdün|vurdu|vurdun|kesti|düşürdü|indirdi|biçti|aldı)(?![a-zçğıöşü])/gi,
      (_m: string, pre: string, verb: string) => pre + (verb === "vurup öldürdü" ? "vurup öldürdü" : (verb === "vurdu" || verb === "vurdun") ? "öldürdü" : verb),
    );
    result = result.replace(
      /((?<![a-zçğıöşü])seni(?![a-zçğıöşü])[^.;:—!?\n]{0,50}?)kafadan (vurarak|tek atışta) /gi,
      "$1",
    );
    // EN aynası (denetim 2026-07-19 F8): "one-tapped you / shot you in the head"
    // EN çıktıda süzülmüyordu. TR guard'la aynı sözleşme: kill-olgusu KORUNUR
    // ("killed you"), yalnız headshot-iddiası düşer. Öğüt ("aim for the head")
    // "you" nesne çapası olmadığından DOKUNULMAZ. Sıra: one-tapped önce (çıktısı
    // ikinci kalıba beslenebilir).
    result = result.replace(/\b(?:one[- ]?tapped|head-?shott?ed)\s+you\b/gi, "killed you");
    result = result.replace(/\b(killed|shot|hit|caught)\s+you\s+in\s+the\s+head\b/gi, "$1 you");
    result = result.replace(/\bwith\s+a\s+headshot\b/gi, "");
  }

  // Death-location-when-absent (LAUNCH BLOCKER 2026-06-28): deathLocation OCR'da
  // YOKKEN model belirli bir callout'u ÖLDÜĞÜN YER olarak iddia edemez (canlı-test
  // R2 "A Dish'te öldün" / R5 "B Tower'da vuruldun" = saf halüsinasyon; desktop
  // payload'ı o maçta 4/4 deathLocation göndermedi). Konum+lokatif(-da/-de/-ta/-te)
  // + ölüm/öldürme-fiili çapasını yakalayıp SADECE yer-iddiasını siler (fiil kalır).
  // hasDeathLocation=true iken DOKUNMA. Yön ("arkadan geldi") lokatif değil → güvenli.
  if (factGround.hasDeathLocation === false) {
    const DEATH_AT_VERBS = "(öldün|öldürüldün|vuruldun|düştün|yakalandın|kaldın|öldürdü|vurdu|düşürdü|kesti|indirdi)";
    // TR-KALAN-16 (2026-09-23): ÖLÇÜLMÜŞ konum (bu round + geçmiş round'lar)
    // DOKUNULMAZ — "masaüstünün ölçtüğü konum asla silinmez" ilkesi
    // (stripForeignCallouts) bu döngüde yalnız hiç uygulanmıyordu:
    // rh 'b generator' iken "R1'de B Generator'da öldün." → "R1'de B öldün.".
    // B02 İNCELEME: measuredLocations = YALNIZ bu round'un ölçülmüş konumu (koşulsuz
    // muaf); historyLocations = geçmişin ölçülmüş konumları, yalnız geçmişe çapalı
    // yan-cümlede muaf ("R1'de B Generator'da öldün" korunur; "B Main'de öldün" /
    // "Bu round yine B Main'de vuruldun" geçmiş konum bu round'a yapıştırılmışsa düşer).
    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const measured = new Set((factGround.measuredLocations ?? []).map(norm));
    const history = new Set((factGround.historyLocations ?? []).map(norm));
    // FB05 · F83: geçmiş muafiyeti round'a bağlı — "R3'te B site'ta öldün" ancak R3'ün
    // ölçülmüş konumu "b site" ise korunur (historyMatchesAnchor; nötrleyicilerle AYNI kural).
    const rounds = factGround.historyRoundLocations;
    const isMeasured = (name: string, off: number, end: number, full: string) =>
      measured.has(norm(name)) || historyMatchesAnchor(norm(name), history, rounds, full, off, end);
    for (const pos of POSITION_NAMES) {
      // Bileşik callout'un SİTE HARFİ de tüketilir (öksüz "B" kalmasın): çıplak
      // "generator" eşleşince "B Generator'da" → "B " artığı bırakıyordu.
      // Türkçe-\b TUZAĞI: \p{L} lookbehind (dosya konvansiyonu).
      const re = new RegExp(
        `(?<![\\p{L}])((?:[abc]\\s+)?${escapeRe(pos)})\\s*['’]?\\s*(?:d[ae]|t[ae])\\s+([^.!?]{0,30}?)${DEATH_AT_VERBS}`,
        "giu",
      );
      result = result.replace(re, (m: string, name: string, mid: string, verb: string, off: number, full: string) =>
        (isMeasured(name, off, off + m.length, full) ? m : `${mid}${verb}`));
      // EN aynası (denetim 2026-07-19 F8): "you died at B Main" EN çıktıda
      // süzülmüyordu. TR guard'la aynı sözleşme: ölüm-fiili KALIR, yalnız uydurma
      // YER düşer. Ölüm-fiiline çapalı → "hold the angle at B Main" öğüdü
      // DOKUNULMAZ. Yalnız geçmiş-iddia formları ("get caught" öğüt formu yok).
      // TR-KALAN-16: ölçülmüş konum burada da muaf (aynı ilke, iki dil).
      const reEnA = new RegExp(
        `\\b(died|was killed|got killed|was shot|got shot|was caught|got caught|went down)\\s+(?:at|in|near|on)\\s+(${escapeRe(pos)})(?![a-z0-9-])`,
        "gi",
      );
      result = result.replace(reEnA, (m: string, v: string, name: string, off: number, full: string) =>
        (isMeasured(name, off, off + m.length, full) ? m : v));
      const reEnB = new RegExp(
        `\\b(killed|shot|caught|picked)\\s+you(\\s+off)?\\s+(?:at|in|near|on)\\s+(${escapeRe(pos)})(?![a-z0-9-])`,
        "gi",
      );
      result = result.replace(reEnB, (m: string, v: string, offW: string | undefined, name: string, at: number, full: string) =>
        (isMeasured(name, at, at + m.length, full) ? m : `${v} you${offW ?? ""}`));
    }
  }

  if (factGround.hasRoute !== true) {
    // Origin claims anchored to a known callout: "<callout>'dan çıkıp/gelip..."
    for (const pos of POSITION_NAMES) {
      const re = new RegExp(
        `\\b${escapeRe(pos)}\\s*['’]?\\s*(d[ae]n|t[ae]n)\\s+${ROUTE_ORIGIN_VERBS}`,
        "gi",
      );
      result = result.replace(re, "");
      // EN aynası (denetim 2026-07-19 F8): "came through mid / wrapped behind B Main"
      // rota-kökeni iddiası EN çıktıda süzülmüyordu (EN few-shot SCENARIO A bu dili
      // bizzat modelliyor). Yalnız GEÇMİŞ formlar — emir/koşul öğüdü ("push through
      // mid", "rotate from B") listede DEĞİL (TR ROUTE_ORIGIN_VERBS ile aynı ilke).
      const reEn = new RegExp(
        `\\b(?:came|pushed|rotated|wrapped|flanked)\\s+(?:in\\s+)?(?:from|through|behind|out\\s+of|via)\\s+${escapeRe(pos)}(?![a-z0-9-])`,
        "gi",
      );
      result = result.replace(reEn, "");
    }
    const beforeGeneric = result;
    for (const re of ROUTE_GENERIC_PATTERNS) result = result.replace(re, "");
    // CANLI-TEST-06 (2026-09-23): jenerik rota silmesi cümle başını açıyordu ve
    // dikiş onarılmıyordu — "Rotasyon attın ve geç kaldın. A Main'de açıyı tut." →
    // "geç kaldın. A Main'de açıyı tut." (öksüz "ve" + küçük harf). Ortak dikiş
    // onarımı yalnız silme GERÇEKLEŞTİYSE ve metin TR ise (desenler TR-only).
    if (result !== beforeGeneric && (lang ? lang === "tr" : /[şçğıöü]/i.test(beforeGeneric))) {
      result = repairTrSeam(result, lang, beforeGeneric);
    }
  }

  if (factGround.hasTradeData !== true) {
    for (const re of TRADE_CLAIM_PATTERNS) result = result.replace(re, "");
  }

  // DÜŞMAN SETUP/UTIL İDDİASI (denetim B35, 2026-07-31): masaüstü düşmanın
  // YETENEK KULLANIMINI HİÇ okumuyor, buna rağmen model "Cypher tuzaklarını
  // B Main'e dizdi" / "Omen smoke'unu mid'e attı" sınıfı GEÇMİŞ-KİP setup
  // iddiaları üretiyor ve hiçbir deterministik katman bunu süzmüyordu.
  //
  // İKİ SERT SINIR (regresyon koruması — "çalışanı bozma"):
  //  1) YALNIZ CÜMLE DÜŞÜRÜR, kelime kırpmaz. "Cypher tuzaklarını dizdi"nin
  //     ortasından silmek bozuk Türkçe üretir (level-3 rewrite'ın kendi dersi).
  //  2) TÜM cümleler iddia taşıyorsa metne HİÇ DOKUNMAZ. Boş alan döndürmek
  //     yasak: rapor route'unda fallback yok (alan boş kalırdı), vision'da ise
  //     çağıran zaten orijinali geri koyuyor → net etki sıfır. Ayrıca KANITLI
  //     ölüm çekirdeği ("seni ... öldürdü"/"killed you") taşıyan cümle asla
  //     düşmez — uydurmayı silerken gerçeği kaybetmeyiz.
  // NOT (kapsam): enemyAnalysis[0] şu an TEK cümle ve şema bu sınıfı BİZZAT
  // emrediyor (vision-prompt.ts ROUND_FEEDBACK_SCHEMA "Madde 1 = düşmanın SOMUT
  // setup/util'i") → orada guard bilinçli olarak no-op. Kalıcı çözüm şema
  // metnini killerInfo/roster gerçeğine bağlamaktır (crossFile).
  if (factGround.hasEnemyUtil === false) {
    // Ayıraçları YAKALAYARAK böl → korunan cümlelerin arasındaki satır sonu
    // (\n) ve boşluk aynen geri yazılır (rapor alanlarının biçimi bozulmasın).
    const chunks = result.split(/((?<=[.!?])\s+)/);
    const total = Math.ceil(chunks.length / 2);
    if (total > 1) {
      let dropped = 0;
      let rebuilt = "";
      for (let i = 0; i < chunks.length; i += 2) {
        const sent = chunks[i];
        if (sent.trim() && isUnprovenEnemyUtilClaim(sent)) { dropped++; continue; }
        rebuilt += sent + (chunks[i + 1] ?? "");
      }
      if (dropped > 0 && dropped < total) result = rebuilt.trim();
    }
  }

  // Collapse spaces and repair orphaned punctuation left by removals.
  result = result
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:]\s*){2,}/g, ", ")
    .replace(/[,;:]\s*([.!?])/g, "$1")   // "attın,." → "attın."
    .replace(/^[\s,;:.]+/, "")
    .replace(/[\s,;:]+$/, "")            // drop trailing orphan comma
    .trim();

  return result;
}

// ── Main Entry Point ──

/**
 * Validate AI output against round memory + present-round facts.
 * Call this AFTER AI generation, BEFORE returning response.
 *
 * @param outputText - The AI-generated text (deathAnalysis, insight, etc.)
 * @param roundHistory - Current round memory from the watch session
 * @param factGround - OPTIONAL present-round ground truth (route/trade presence).
 *                     When omitted, behaviour is identical to before — every
 *                     existing 2-arg caller is unaffected.
 * @returns Safe text with false claims rewritten
 */
/** Harita başına çıplak callout kelimesinin SİTESİ — YALNIZ KB'de açıkça yazılı
 *  olanlar (harita bilgisi UYDURULMAZ). stripForeignCallouts'un site-harfi bestesi
 *  bunu kullanır: harf uyuşmazsa beste meşru sayılmaz (cross-map kapısına düşer).
 *  Kanıt: knowledge/maps/ascent.md:119 "A site'i savunuyorsun — Heaven, Generator
 *  veya Wine'dasın"; :121 "Wine (Tree altı)"; :234 "Tree / Window: A site'a bakan
 *  pencere alanı"; :236 "Garden: … A site'e inen bağlantı bölgesi"; :173 A Retake
 *  "CT'den Hell üzerinden site zeminine iner". */
const CALLOUT_WORD_SITE: Record<string, Record<string, "a" | "b" | "c">> = {
  ascent: { tree: "a", garden: "a", wine: "a", heaven: "a", generator: "a", hell: "a" },
};

/** YABANCI CALLOUT AYIKLAYICI (canlı bug 2026-07-21, Kaan/Lotus).
 *
 * Koç, OYNANMAYAN haritanın yer adını uydurabiliyor: Lotus maçında "A Short'ta
 * tek başına girdin" yazdı — Lotus'ta A Short YOKTUR (Ascent/Bind/Haven'da var).
 * POSITION_NAMES harita-bağımsız tek liste olduğu için doğrulayıcı bunu geçirdi.
 *
 * Bu ayıklayıcı, oynanan haritaya AİT OLMAYAN callout'ları metinden çıkarır.
 * Mevcut `guardUnprovenFacts`'ten BAĞIMSIZ ve ona DİK çalışır: o, ölüm yeri
 * bilinmiyorken konum iddiasını siler; bu ise ölüm yeri BİLİNSE bile yanlış
 * haritanın adını siler (rapor özeti gibi ölüm-bağlamı olmayan metinlerde de).
 *
 * GÜVENLİK: harita bilinmiyorsa (Unknown / tabloda yok / hiç verilmedi)
 * fonksiyon metne DOKUNMAZ — davranış eskisiyle bayt-aynı. Ayıklama yalnız
 * haritayı KESİN bildiğimizde çalışır.
 *
 * Cümleyi bozmamak için yalnız YER ADI düşer, cümle yapısı korunur:
 *   TR "A Short'ta tek başına girdin" → "tek başına girdin"
 *   EN "you pushed at A Short"        → "you pushed"
 */
export function stripForeignCallouts(
  text: string,
  map: string | undefined | null,
  // Masaüstünün OCR ile ÖLÇÜP gönderdiği ölüm yeri/yerleri. HER ZAMAN meşru.
  // Vision route TEK string; report route TÜM round'ların konum dizisi.
  suppliedLocation?: string | string[] | null,
  // FB05 · F12: İSTEK dili. YALNIZ "en" iken İngilizce belirsiz artikel koruması açılır
  // (aşağıdaki enArticle). Verilmezse / "tr" ise davranış BAYT-AYNI (TR yolu değişmez).
  lang?: "tr" | "en",
): string {
  if (!text) return text;
  const k = mapKey(map);

  // Meşru = (harita biliniyorsa) o haritanın callout'ları + her haritada bulunan
  // evrensel adlar (spawn'lar) + MASAÜSTÜNÜN GÖNDERDİĞİ ÖLÜM YERİ/YERLERİ.
  //
  // 🔴 CANLI REGRESYON (2026-07-24, Fracture): masaüstü ölüm yerini "a main"
  // gönderdi ama tablomda Fracture için "a main" YOKTU (tablo eksikti) → strip
  // onu "yabancı callout" sanıp SİLDİ → "nerede vurulduğunu söylemiyor".
  // İLKE: masaüstünün ölçtüğü konumu backend ASLA silmez. O veri yanlışsa
  // düzeltmek masaüstünün işi; backend'in sessizce silmesi felakettir — çünkü
  // tablom eksik olduğunda "tabloda yok = uydurma" varsayımı ÇÖKER. Yalnız
  // AI'ın SIFIRDAN uydurduğu (masaüstünün göndermediği) callout ayıklanmalı.
  //
  // UNKNOWN HARİTA (2026-07-24, konsey — Omen/Unknown maçı): eskiden burada
  // `if (!k) return text` ile NO-OP'tu → harita okunamayınca AI'ın uydurduğu
  // "A Short/B Main" serbest geçiyordu (canlı bug). Artık Unknown'da da çalışır:
  // haritanın kendi tablosu yok ama meşru = evrensel + gönderilen konum, ve
  // aşağıdaki cross-map kapısı yalnız BAŞKA haritaya AİT KANITLI callout'u siler.
  const legit = new Set<string>(UNIVERSAL_CALLOUTS.map((c) => c.toLowerCase()));
  if (k) for (const c of MAP_CALLOUTS[k]) legit.add(c.toLowerCase());
  const supplied = Array.isArray(suppliedLocation)
    ? suppliedLocation
    : suppliedLocation != null
      ? [suppliedLocation]
      : [];
  for (const loc of supplied) {
    if (typeof loc === "string" && loc.trim()) legit.add(loc.trim().toLowerCase());
  }

  // EN UZUN EŞLEŞME ÖNCE — kritik. İlk uygulamada callout'ları tek tek gezip
  // "haritaya ait değilse sil" dedim ve MEŞRU METNİ BOZDUM: POSITION_NAMES
  // içinde çıplak "mound" var, Lotus listesinde ise "c mound" var; kısa olan
  // önce eşleşince "C Mound'da tek başına kaldın" → "C tek başına kaldın"
  // oldu. Test bunu yakaladı. Çözüm: tüm adları TEK regex'te, uzunluğa göre
  // AZALAN sırada alternatif olarak ver — regex alternasyonu soldan sağa
  // denediği için "c mound" her zaman "mound"dan önce eşleşir. Eşleşen ad
  // haritaya AİTSE olduğu gibi geri yazılır, değilse düşer.
  // ADAY HAVUZU = POSITION_NAMES ∪ TÜM haritaların callout'ları.
  // POSITION_NAMES tek başına YETMİYOR: içinde çıplak "mound" var ama "c mound"
  // YOK. Havuzda uzun ad hiç bulunmayınca uzunluk sıralaması da kurtarmıyordu —
  // "mound" eşleşip Lotus'un meşru "C Mound"unu parçalıyordu (test yakaladı).
  // Tüm harita adlarını havuza katınca "c mound" aday olur, uzunluk sırasıyla
  // "mound"dan ÖNCE eşleşir ve haritaya ait olduğu için korunur.
  // BAŞKA-HARİTAYA-AİT KANITI: yalnız GERÇEK bir Valorant callout'u olan
  // (herhangi bir haritanın tablosunda geçen) adlar silinebilir. POSITION_NAMES'te
  // olup hiçbir harita tablosunda olmayan adlar ile OCR varyantları (aşağıda)
  // bu kümenin DIŞINDA kalır → asla silinmez.
  const knownMapCallouts = new Set<string>();
  for (const list of Object.values(MAP_CALLOUTS)) {
    for (const c of list) knownMapCallouts.add(c.toLowerCase());
  }
  const pool = new Set<string>(POSITION_NAMES.map((p) => p.toLowerCase()));
  for (const c of knownMapCallouts) pool.add(c);
  const ordered = [...pool].sort((a, b) => b.length - a.length);
  const ALT = ordered.map(escapeRe).join("|");
  // SİTE-HARFİ BESTESİ (TR-KALAN-17, 2026-09-23): masaüstü resolve() adım-2
  // (aimlo-desktop src-tauri/src/callouts.rs:346-360) kanonik tek kelimeyi site
  // harfiyle birleştiriyor ('a' + 'tree' → "a tree"); backend aynı bileşiği
  // "yabancı" sayıp siliyordu: Ascent'te "A Tree" (real-rounds-23'te rh'de 19 kez,
  // deathLocation olarak 1 kez — OCR gerçeği), çünkü tabloda yalnız çıplak "tree"
  // var ve "a tree" Lotus'ta KANITLI. Ayna: "<a|b|c> <w>" ve w bu haritada meşru
  // ise KORU. CROSS-MAP KAPISI AÇILMASIN diye tek şart daha: haritanın tablosunda
  // w'nin BAŞKA harfli bir biçimi YOKSA ("long" Bind'da yalnız "b long" olarak
  // var → "A Long"/"C Long" Bind'da hâlâ yabancı; Lotus'ta çıplak "short" yok →
  // "A Short" hâlâ siliniyor).
  const letteredWords = new Set<string>();
  if (k) for (const c of MAP_CALLOUTS[k]) {
    const m = /^[abc]\s+(.+)$/.exec(c.toLowerCase());
    if (m) letteredWords.add(m[1]);
  }
  // EN BELİRSİZ ARTİKEL KORUMASI (FB05 · F12, 2026-09-24).
  // KANIT: iki regex de "giu" (büyük/küçük harf duyarsız) → EN'de artikel "a" + sıfat
  // ("a long", "a short", "a back", "a wall", "a default") başka haritanın "a long" /
  // "a short" callout'u sanılıp siliniyordu: [Bind] "Jett held a long sightline down B
  // Long" → "Jett held sightline down B Long"; [Icebox] "Execute a short two-man
  // post-plant" → "Execute two-man post-plant"; [Ascent] "Play for a default and hold a
  // wall until…" → "Play for and hold until…". Korpus: 164 EN örneğin 24'ünde 29 öbek,
  // son prod-parity koşularında 60'ın 13'ü. realityCheck lang'i biliyordu ama
  // stripForeignCallouts'a geçirmiyordu.
  // KURAL (yalnız lang === "en"; eşleşen ORİJİNAL metin görülür):
  //   • ad tek harfli site önekiyle başlıyor ve o harf KÜÇÜKSE ("a long", "b long") → artikel
  //     /gündelik kullanım sayılır, dokunulmaz (EN koç metninde callout'lar Title-Case;
  //     neutralizeUnprovenLocationsEn kural 4 ile aynı gerekçe);
  //   • cümle başındaki büyük "A" belirsizdir: ardından gelen kelime KÜÇÜK harfliyse artikel
  //     ("A long sightline…" korunur), BÜYÜK harfliyse callout ("A Long" / "A Short" eskisi gibi
  //     silinir). Cümle ortasındaki büyük "A"/"B"/"C" + küçük kelime eski kurala tabi.
  const enArticle = (whole: string, name: string, offset: number, full: string): boolean => {
    if (lang !== "en") return false;
    const m = /^([abcABC])\s+(\S)/.exec(name);
    if (!m) return false;
    if (m[1] === m[1].toLowerCase()) return true;
    if (m[1] !== "A" || m[2] === m[2].toUpperCase()) return false;
    // Adın metindeki başlangıcı: regex-1'de ad eşleşmenin SONUNDA, regex-2'de BAŞINDA.
    const at = whole.startsWith(name) ? offset : offset + whole.lastIndexOf(name);
    return /(?:^|[.!?\n]\s*)$/.test(full.slice(0, at));
  };
  const keepIfLegit = (whole: string, name: string, offset?: number, full?: string) => {
    if (typeof offset === "number" && typeof full === "string" && enArticle(whole, name, offset, full)) return whole;
    const n = name.trim().toLowerCase();
    if (legit.has(n)) return whole; // bu haritaya ait / evrensel / gönderilen konum
    const lettered = /^([abc])\s+(.+)$/.exec(n);
    if (k && lettered && legit.has(lettered[2]) && !letteredWords.has(lettered[2])) {
      // B02 İNCELEME: kelimenin sitesi KB'de biliniyorsa harf ona UYMALI — Ascent'te
      // Tree/Garden A tarafında; "B Tree" (Fracture) / "B Garden" (Bind) cross-map
      // callout'u artık korunmaz. Tabloda olmayan kelime eski davranış (her harf).
      const site = CALLOUT_WORD_SITE[k]?.[lettered[2]];
      if (!site || site === lettered[1]) return whole;
    }
    // YALNIZ ÇOK-KELİMELİ yabancı callout'ları sil (2026-07-24, konsey rank-5).
    // Çıplak tek kelimeler ("tree", "mid", "link", "market", "garden") hem sık
    // gündelik kelime hem birleşik-callout çekirdeği — silmek çok fazla meşru
    // metni kırıyordu ("geniş"→"iş" gibi). AI'ın uydurduğu yanlış-harita
    // callout'u ("A Short", "B Long") zaten ÇOK-KELİMELİ olur; tek-kelimelik
    // yanlış-harita uydurması nadir ve zararı düşük. Occam: az sil, gerçeği koru.
    if (!n.includes(" ")) return whole;
    // CROSS-MAP-KANITI KAPISI (2026-07-24, sağlamlık): yalnız BAŞKA bir haritanın
    // tablosunda KANITLI olarak var olan callout'u sil ("A Short" ∈ Ascent/Haven/
    // Bind → Lotus'ta yabancı → sil). Masaüstünün OCR varyantı ("A Hall"→"a hail")
    // ya da modelin özgün bir ifadesi ("sağ arka açı") hiçbir tabloda YOKTUR →
    // silinmez. Bu, tablo-eksikliği felaketini kökten bitirir: tabloda-yok artık
    // "sil" demek DEĞİL; yalnız "başka-haritada-KANITLI-var" silme gerekçesidir.
    if (!knownMapCallouts.has(n)) return whole;
    return "";
  };

  let result = text;

  // UNICODE KELİME SINIRI — \b KULLANILAMAZ. JS'te \b, \w=[A-Za-z0-9_] ASCII
  // tanımına dayanır; Türkçe ş/ı/ğ/ü/ö/ç harfleri \w DEĞİLDİR. İki ayrı hasar
  // doğuruyordu (ikisi de testte görüldü):
  //   • Kapanış sınırı hiç yokken "gen" (Ascent callout'u) "GENİŞ" kelimesinin
  //     içinden silindi → "solo geniş açı" → "solo iş açı".
  //   • Sadece \b konsaydı "yard" callout'u "YARDIm" içinde eşleşirdi, çünkü
  //     "ı" ASCII \w olmadığı için orada sahte bir sınır var.
  // Çözüm: \p{L}\p{N} temelli, u-bayraklı bakış işaretleri.
  const NB = "(?<![\\p{L}\\p{N}_-])"; // önünde harf/rakam OLMAYACAK
  const NA = "(?![\\p{L}\\p{N}_-])"; // ardında harf/rakam OLMAYACAK

  // 1) EN: edat + yer ("died at A Short", "pushed from Market") — edat da düşer.
  result = result.replace(
    new RegExp(
      `\\s*${NB}(?:at|in|on|near|through|from|toward|towards|into)\\s+(${ALT})${NA}`,
      "giu",
    ),
    keepIfLegit,
  );

  // 2) TR hâl ekleri + çıplak kullanım + "A Short:" başlık biçimi tek geçişte.
  //    Ad haritaya aitse (ekli ya da eksiz) olduğu gibi korunur.
  //    Ek grubu apostrofsuz da çalışır ("Midde") ama ardından yine sınır şart.
  result = result.replace(
    new RegExp(
      `${NB}(${ALT})(?:\\s*['’]\\s*(?:d[ae]n|t[ae]n|d[ae]|t[ae]|y?[ae])|(?:d[ae]n|t[ae]n|d[ae]|t[ae]))?${NA}\\s*:?\\s*`,
      "giu",
    ),
    keepIfLegit,
  );

  // Ayıklamadan artan boşluk/noktalama onarımı (guardUnprovenFacts ile aynı sözleşme).
  // ÖKSÜZ AYIRAÇ (2026-07-24): "A Short — advice" / "A Short: advice" başlığından
  // callout silinince "— advice" / ": advice" kalıyordu. Bir CÜMLE/SATIR BAŞINDA
  // (metin başı, ya da . ! ? \n sonrası) öksüz kalan em-dash/tire/iki-nokta/virgül
  // ayıracını temizle. "B Main — advice" (callout KORUNDU) etkilenmez: oradaki "—"
  // ayıracın önünde "Main" var, cümle başı değil.
  return result
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:]\s*){2,}/g, ", ")
    .replace(/[,;:]\s*([.!?])/g, "$1")
    .replace(/(^|[.!?\n])\s*[—–\-:;,]+\s*/g, "$1 ")
    .replace(/^[\s,;:.—–\-]+/, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n /g, "\n")
    .trim();
}

/** ÖLÇÜLMEMİŞ KONUM İDDİASI NÖTRLEYİCİSİ (B3, canlı-test #15 sınıfı — 2026-09-16).
 *
 * NEDEN: :854'teki konum-yokken guard'ı SADECE <callout>+lokatif+ÖLÜM-FİİLİ
 * çapasına bağlı. Model bu çapayı POZİSYON fiiliyle kolayca atlatıyor:
 *   "A Heaven'da aynı köşeyi tuttun" (11 phoenix adayının 9'u, gerçek çıktı).
 * stripForeignCallouts da kurtarmıyor: "A Heaven" OYNANAN haritanın MEŞRU
 * callout'u → `legit` kümesinde (:1010) ve korunuyor. Kaynağı KB besliyor
 * (knowledge/maps/haven.md:108 "A Heaven'da Değişmez Pozisyon") → son savunma
 * deterministik olmak zorunda.
 *
 * SÖZLEŞME — SİLME DEĞİL YENİDEN YAZMA: silmek boşluk bırakıyor ("da öldün"
 * sınıfı). Callout NÖTR ifadeyle değiştirilir ("o açıda" / "o noktada"), ders
 * ve cümle yapısı AYNEN kalır. İkame daima BOŞLUKLA başlayan tail'e bağlanır →
 * kelimeye yapışma yapısal olarak imkânsız.
 *
 * DÖRT GÜVENLİK KAPISI (2026-07-24 strip-callout felaketinin dersi):
 *  1) ÖLÇÜLEN konum MUAF — factGround.deathLocation + roundHistory[].death_position.
 *     Karşılaştırma DÜZ .toLowerCase() ile (ev deseni :1010/:1021): Türkçe yerel
 *     küçültme "I"→"ı" yaptığı için OCR'ın "MID" yazımı supplied "Mid" ile
 *     eşleşmiyor ve ÖLÇÜLEN konum siliniyordu (Fracture sınıfı regresyon).
 *  2) BİLEŞİK-CALLOUT KORUMASI — "B Stairs'ta" içindeki "stairs" tek başına
 *     eşleşip "B" öksüz kalmasın diye bileşiklerin İLK kelimeleri lookbehind
 *     ile reddedilir.
 *  3) FİİL İKİ KATMANLI — 2. şahıs (oyuncunun KENDİ geçmişi) doğrudan; 3. şahıs
 *     formları YALNIZ aynı cümlede "seni/sana/senin" kurban çapası varsa. Bu
 *     olmadan katman müttefik/util cümlelerini yok ediyordu (ölçüldü:
 *     "Takım arkadaşın B Main'de bekliyordu", "Sage duvarı A Main'de duruyordu").
 *     Emir ve öğüt kipleri her iki listede de YOK → meşru koçluk dokunulmaz.
 *  4) HAVUZ ELEMESİ — <4 harfli ÇIPLAK adlar ("gen", "ct") dışarıda ("mid" tek
 *     istisna; emsal lib/coach-text.ts:890 "<4 harf … tuzak", ayrıca "gen"in
 *     "geniş"i bozduğu :1058'de belgeli). "plant"/"switch" tabloda callout ama
 *     koç metninde oyun terimi → dışarıda.
 *
 * ⚠ BİLİNEN SINIR: buildFactGround'da (`:598-599`) hem hasDeathLocation hem
 * deathLocation AYNI ctx.deathLocation'dan türüyor → vision yolunda
 * hasDeathLocation=false iken deathLocation DAİMA undefined. Yani kapı (1)'in
 * ctx yarısı orada ÖLÜ; işleyen muafiyet roundHistory'dir. Kapı, rapor yolu için
 * canlı: lib/report-prompt.ts buildReportCleaner `hasDeathLocation: anyLoc,
 * deathLocation: suppliedLocs` (dizi; B05'te route'tan taşındı).
 *
 * SIRA: realityCheck'in EN SONUNDA çalışır — extractClaims/validateClaims
 * callout'u hâlâ ORİJİNAL hâliyle görür, böylece claimedPosition ve rewriteLevel
 * BAYT-AYNI kalır. Nötrlemeyi öne almak claimedPosition'ı null yapar ve level-3 →
 * level-2 kaymasıyla hafıza katmanının davranışını sessizce değiştirirdi.
 * TR-only: Türkçe lokatif + Türkçe geçmiş-zaman fiili şart → EN bayt-aynı.
 * EN karşılığı ayrı fonksiyondur: neutralizeUnprovenLocationsEn (TR-KALAN-13).
 */
const LOC_POOL: readonly string[] = (() => {
  const pool = new Set<string>();
  const add = (raw: string) => {
    const n = raw.toLowerCase();
    if (!n.includes(" ") && n.length < 4 && n !== "mid") return;
    if (n === "plant" || n === "switch") return;
    pool.add(n);
  };
  POSITION_NAMES.forEach(add);
  for (const list of Object.values(MAP_CALLOUTS)) list.forEach(add);
  // EN UZUN EŞLEŞME ÖNCE (stripForeignCallouts:1028 ile aynı gerekçe).
  return [...pool].sort((a, b) => b.length - a.length);
})();
const LOC_ALT = LOC_POOL.map(escapeRe).join("|");
/** Bileşik callout'ların İLK kelimeleri ("a", "b", "mid", "top", …). */
const LOC_HEAD_ALT = [...new Set(LOC_POOL.filter((p) => p.includes(" ")).map((p) => p.split(" ")[0]))]
  .sort((a, b) => b.length - a.length)
  .map(escapeRe)
  .join("|");
/** Lokatif yerine kullanılan edat-benzeri ekler ("A Elbow civarında"). */
// FB05 · F52 (c): "köşesinden|yakınındaki|hattından|kenarından" eklendi (korpus: n14 "seni A
// Tree köşesinden vuruyor", r2b "seni A Tree yakınındaki siper hattından vurdu"). Bu dördü
// bulunma hâlinde DEĞİL (ayrılma / -deki) → nötr ikame hâle uyar (locCase / neutralBase).
const LOC_POSTP = "(?:civarında|civarı|yakınında|yanında|tarafında|kenarında|hattında|bölgesinde|üstünde|içinde|açısında|köşesinde|koridorunda|girişinde|çıkışında|köşesinden|yakınındaki|hattından|kenarından)";
/** FB05 · F52: callout'a bağlı ek/edatın HÂLİ — nötr ikame aynı hâlde yazılır ("o açıdan",
 *  "o noktadaki"). Eski LOC_POSTP'lerin hepsi bulunma hâli (+ "civarı") → "loc" (bayt-aynı). */
function locCase(suffix: string): "loc" | "ki" | "abl" {
  const x = suffix.trim().toLowerCase();
  if (/(?:d[ae]n|t[ae]n)$/.test(x)) return "abl";
  if (/ki$/.test(x)) return "ki";
  return "loc";
}
function neutralBase(kind: "loc" | "ki" | "abl", aciNearby: boolean): string {
  const head = aciNearby ? "o nokta" : "o açı";
  return kind === "abl" ? `${head}dan` : kind === "ki" ? `${head}daki` : `${head}da`;
}
/** 2. ŞAHIS = oyuncunun kendi geçmişi → çapa tek başına yeter. */
const LOC_SELF_VERB = "(?:tuttun|tutmuştun|tutuyordun|korudun|koruyordun|bekledin|bekliyordun|durdun|duruyordun|kaldın|kalmıştın|kalıyordun|oturdun|sabitlendin|açıldın|öldün|öldürüldün|vuruldun|düştün|yakalandın)";
/** 3. ŞAHIS = özne müttefik/util/düşman olabilir → kurban çapası ŞART. */
const LOC_THIRD_VERB = "(?:tuttu|tutuyordu|bekledi|bekliyordu|durdu|duruyordu|kaldı|öldürdü|vurdu|kesti|düşürdü|indirdi|biçti|temizledi|avladı|yakaladı|cezalandırdı|aldı)";
const LOC_SELF_TAIL_RE = new RegExp(LOC_SELF_VERB + "$", "u");
const LOC_VICTIM_RE = /(?<![\p{L}])(?:seni|sana|senin)(?![\p{L}])/u;
// Türkçe-\b TUZAĞI: sınırlar \p{L}\p{N} lookaround ile (:1085-1092 konvansiyonu).
const LOC_CLAIM_RE = new RegExp(
  `(?<![\\p{L}\\p{N}_-])(?<!(?:${LOC_HEAD_ALT})\\s)(${LOC_ALT})`
  + `(?:(?:\\s*['’]\\s*)?(?:d[ae]|t[ae])(ki)?|\\s+${LOC_POSTP})`
  + `(?![\\p{L}\\p{N}_-])`
  + `(\\s[^.,!?;:—\\n]{0,60}?(?:${LOC_SELF_VERB}|${LOC_THIRD_VERB})(?![\\p{L}]))`,
  "giu",
);

/** ÖLÇÜLEN (masaüstünün gönderdiği) konumların TAM kümesi (bu round + TÜM geçmiş) —
 *  YALNIZ harita meşruiyeti için (stripForeignCallouts): ölçülmüş bir ad hiçbir
 *  haritada "yabancı" sayılıp silinmez. Ölüm-yeri İDDİASI muafiyeti için
 *  currentLocationSet + historyLocationSet + historyMatchesAnchor kullanılır. */
function suppliedLocationSet(
  fgLocation: string | string[] | undefined,
  roundHistory: readonly RoundMemoryEntry[],
): Set<string> {
  const s = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v === "string" && v.trim()) s.add(v.trim().toLowerCase());
  };
  if (Array.isArray(fgLocation)) fgLocation.forEach(add);
  else add(fgLocation);
  // Geçmiş round'ların ÖLÇÜLMÜŞ ölüm yerleri de gerçektir ("R2 B Generator'da
  // öldün") — bu round'un konumu okunamadı diye geçmişin gerçeği silinemez.
  for (const r of roundHistory) add(r.death_position);
  return s;
}

/** BU round'un ölçülmüş ölüm yeri/yerleri (vision: tek string; report: dizi). */
function currentLocationSet(fgLocation: string | string[] | undefined): Set<string> {
  return suppliedLocationSet(fgLocation, []);
}

/** GEÇMİŞ round'ların GÜVENİLİR ölçülmüş ölüm yerleri: died===true ve
 *  position_confidence high/medium (validateClaims FIX #2 ile aynı ölçüt — LOW
 *  konum sayılmıyorsa muafiyet de kazandırmaz; ölmeden kaydedilen konum ölüm yeri
 *  değildir). */
function historyLocationSet(roundHistory: readonly RoundMemoryEntry[]): Set<string> {
  const s = new Set<string>();
  for (const r of roundHistory) {
    if (r.died !== true) continue;
    if (r.position_confidence !== "high" && r.position_confidence !== "medium") continue;
    if (typeof r.death_position === "string" && r.death_position.trim()) s.add(r.death_position.trim().toLowerCase());
  }
  return s;
}

/** FB05 · F83: historyLocationSet'in ROUND'A GÖRE hâli (aynı süzgeç, aynı normalleştirme). */
function historyRoundLocationMap(roundHistory: readonly RoundMemoryEntry[]): Map<number, string> {
  const m = new Map<number, string>();
  for (const r of roundHistory) {
    if (r.died !== true) continue;
    if (r.position_confidence !== "high" && r.position_confidence !== "medium") continue;
    if (typeof r.round_index !== "number" || !Number.isFinite(r.round_index)) continue;
    if (typeof r.death_position === "string" && r.death_position.trim()) m.set(r.round_index, r.death_position.trim().toLowerCase());
  }
  return m;
}

// ── GEÇMİŞ-ROUND ÇAPASI (B02 inceleme, 2026-09-23) ──────────────────────────
// KANIT (maliyetsiz replay, 944 örnek): 8e99e56 geçmiş round konumunu koşulsuz
// "ölçülmüş" saydığı için hasDeathLocation=false round'larda 100 alanda geçmiş
// konum bu round'a yapıştırılmış hâliyle korundu (28'i deathAnalysis): cycleab-base
// M1-R9 "bu round mid bottom'da öldün" (R9 ölçülmedi, R8=mid bottom), cyclereal-r2b
// M1-R2 "OCR kaydına göre bu round B site'de öldün". vision-prompt.ts bunu RED
// BAYRAĞI sayıyor. Kural: konuma aynı yan-cümlede EN YAKIN zaman çapası (önce
// soldaki, yoksa sağdaki) GEÇMİŞ ise muaf; "bu round/şimdi/this round" ya da hiç
// çapa yoksa muaf DEĞİL. Türkçe-\b TUZAĞI: \p{L} lookaround (dosya konvansiyonu).
// Çoklu-round nicelikleri ("2 kez", "iki kez", "roundlarda", "bu maçta") da GEÇMİŞ
// çapasıdır: iddia birden çok round'u kapsar (korpus base M1-R9 "Bu roundlarda B
// Site/B Main'de iki kez öldün", r4c M1-R11 "B Main/B Lobby'de 2 kez öldün" — iki
// konum da geçmişte ölçülmüş). "yine/tekrar" BİLEREK çapa DEĞİL: "B Main'de yine
// öldün" bu round'un konumunu da iddia eder (uydurma sınıfı).
const LOC_PAST_ANCHOR_RE = new RegExp(
  "(?<![\\p{L}\\p{N}])(?:r\\d{1,2}"
  + "|(?:round|raund|tur)\\s+\\d{1,2}"
  + "|\\d{1,2}\\.\\s*(?:round|raund|tur)"
  + "|(?:round|raund|tur)['’]?l[ae]r[\\p{L}'’]*"
  + "|(?:önceki|geçen)\\s+(?:round|raund|tur|maç)"
  + "|bu\\s+maç[\\p{L}'’]*|maç\\s+boyunca"
  + "|daha\\s+önce|geçmişte"
  + "|son\\s+(?:\\d+|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on)\\s*(?:round|raund|tur)"
  + "|\\d+\\s*(?:kez|defa)|(?:iki|üç|dört|beş|altı|birkaç|birçok)\\s+(?:kez|defa)"
  + "|earlier|previously|twice|\\d+\\s+times|(?:last|past|previous|earlier|prior)\\s+(?:\\d+\\s+)?rounds?"
  + ")(?![\\p{L}\\p{N}])",
  "giu",
);
const LOC_CURRENT_ANCHOR_RE = new RegExp(
  "(?<![\\p{L}])(?:bu\\s+(?:round|raund|tur)(?!['’]?l[ae]r)|bu\\s+(?:sefer|kez)|şimdi|az\\s+önce|this\\s+(?:round|time)|just\\s+now|now)(?![\\p{L}])",
  "giu",
);
/** [start,end) aralığındaki konum iddiasına en yakın zaman çapası (metni ile). FB05 · F83:
 *  historyAnchorAt'in gövdesi buraya taşındı — seçim kuralı AYNEN; ek olarak çapanın metni
 *  döner ki sayısal round çapası ("R3") o round'un kaydıyla karşılaştırılabilsin. */
function historyAnchorPick(full: string, start: number, end: number): { at: number; past: boolean; text: string } | null {
  let cs = start;
  while (cs > 0 && !/[.!?;:—\n]/.test(full[cs - 1])) cs--;
  let ce = end;
  while (ce < full.length && !/[.!?;:—\n]/.test(full[ce])) ce++;
  const seg = full.slice(cs, ce);
  const marks: { at: number; past: boolean; text: string }[] = [];
  for (const m of seg.matchAll(LOC_PAST_ANCHOR_RE)) marks.push({ at: cs + (m.index ?? 0), past: true, text: m[0] });
  for (const m of seg.matchAll(LOC_CURRENT_ANCHOR_RE)) marks.push({ at: cs + (m.index ?? 0), past: false, text: m[0] });
  // Konum iddiasının İÇİNDEKİ ya da SOLUNDAKİ en yakın çapa ("R2'de B Main'de öldün",
  // "B Main'de bu round öldün"); yoksa SAĞDAKİ ilk çapa ("You died at B Main in R2").
  const left = marks.filter((x) => x.at < end).sort((a, b) => b.at - a.at)[0];
  return left ?? marks.filter((x) => x.at >= end).sort((a, b) => a.at - b.at)[0] ?? null;
}
/** [start,end) aralığındaki konum iddiasına en yakın zaman çapası: "past" | "current" | null. */
function historyAnchorAt(full: string, start: number, end: number): "past" | "current" | null {
  const pick = historyAnchorPick(full, start, end);
  return pick ? (pick.past ? "past" : "current") : null;
}

// ── ROUND'A BAĞLI GEÇMİŞ MUAFİYETİ (FB05 · F83, 2026-09-24) ────────────────────────
// KANIT (exp9, gerçek korpus M1-R4, hafıza R1=b site, R3=a tree, R4 konumu ölçülmedi):
// "R3'te B site'ta öldün, …" HEAD'de DEĞİŞMEDEN geçiyordu (lvl 1); 9355dec "R3'te öldün, …"
// diye nötrlüyordu. KÖK: TR-KALAN-16 muafiyeti "ad geçmişte ölçülmüş mü (küme) + en yakın
// çapa geçmiş mi" iki şartına bakıyor, çapadaki round NUMARASINI o round'un death_position'ıyla
// hiç karşılaştırmıyordu → R1'in konumu R3'e yapıştırılınca korunuyordu. Aynı kural iki
// katmanda: guardUnprovenFacts isMeasured (TR döngüsü + EN reEnA/reEnB) ve nötrleyicilerin
// historyExempt'i — ikisi de artık bu yardımcıyı kullanır (yalnız birine yazılsaydı yanlış
// eşleşme öteki katmandan geçmeye devam ederdi).
// KURAL: en yakın geçmiş çapası SAYISAL round ise ("R<n>", "round/raund/tur <n>", "<n>.
// round") muafiyeti yalnız round_index===n, died, high/medium ve death_position'ı ada EŞİT
// kayıt verir. Sayısal olmayan çapalar ("roundlarda", "N kez", "daha önce", "earlier")
// eski küme kuralıyla kalır. Dizin verilmezse (doğrudan çağıran) eski küme kuralı.
const ROUND_NUMBER_ANCHOR_RE = /^(?:r(\d{1,2})|(?:round|raund|tur)\s+(\d{1,2})|(\d{1,2})\.\s*(?:round|raund|tur))$/iu;
function historyMatchesAnchor(
  name: string, history: ReadonlySet<string>, rounds: ReadonlyMap<number, string> | undefined,
  full: string, start: number, end: number,
): boolean {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  const pick = historyAnchorPick(full, start, end);
  if (!pick || !pick.past) return false;
  const num = rounds ? ROUND_NUMBER_ANCHOR_RE.exec(pick.text) : null;
  if (num && rounds) return rounds.get(parseInt(num[1] ?? num[2] ?? num[3], 10)) === key;
  return history.has(key);
}
/** Memory katmanı sayımı ("2 kez") silmeden ÖNCE geçmişe çapalı anılan geçmiş
 *  konumlar. Nötrleyici EN SONDA çalıştığı için çapası (sayım) silinmiş olabilir
 *  ("B Main/B Lobby'de 2 kez öldün" → level-2 → "B Main/B Lobby'de öldün"): o
 *  konumu çapasız görünce uydurma sanmasın diye adı burada hatırlanır. Açık
 *  "bu round" çapası yine kazanır (bkz. neutralizer kapısı). */
function pastAnchoredHistoryNames(
  text: string, history: ReadonlySet<string>, rounds?: ReadonlyMap<number, string>,
): Set<string> {
  const out = new Set<string>();
  for (const name of history) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, "giu");
    for (const m of text.matchAll(re)) {
      const at = m.index ?? 0;
      // FB05 · F83: sayısal round çapası o round'un kaydıyla eşleşmeli (historyMatchesAnchor).
      if (historyMatchesAnchor(name, history, rounds, text, at, at + m[0].length)) { out.add(name); break; }
    }
  }
  return out;
}
/** Geçmiş konum muafiyeti: çapa GEÇMİŞ ise muaf (FB05 · F83: sayısal round çapasında yalnız
 *  o round'un kaydı eşleşirse); çapa yoksa yalnız metinde başka yerde geçmişe çapalı
 *  anılmışsa; "bu round/şimdi" çapası varsa ASLA. */
function historyExempt(
  key: string, history: ReadonlySet<string>, anchoredBefore: ReadonlySet<string>,
  full: string, start: number, end: number, rounds?: ReadonlyMap<number, string>,
): boolean {
  if (!history.has(key)) return false;
  const a = historyAnchorAt(full, start, end);
  if (a === "past") return historyMatchesAnchor(key, history, rounds, full, start, end);
  return a === null && anchoredBefore.has(key);
}

export function neutralizeUnprovenLocations(
  text: string,
  supplied: ReadonlySet<string>,
  history: ReadonlySet<string> = new Set(),
  anchoredBefore: ReadonlySet<string> = new Set(),
  // FB05 · F83: round_index → ölçülmüş konum; sayısal round çapası yalnız o round'la eşleşir.
  historyRounds?: ReadonlyMap<number, string>,
): string {
  if (!text) return text;
  return text.replace(
    LOC_CLAIM_RE,
    (whole: string, name: string, ki: string | undefined, tail: string, offset: number, full: string) => {
      const key = name.trim().toLowerCase();
      if (supplied.has(key)) return whole;   // BU round ÖLÇÜLDÜ → dokunma
      if (historyExempt(key, history, anchoredBefore, full, offset, offset + whole.length, historyRounds)) return whole;   // geçmişin olgusu
      // 3. şahıs fiil: özne müttefik/util olabilir → aynı cümlede kurban çapası şart.
      if (!LOC_SELF_TAIL_RE.test(tail)) {
        let start = 0;
        for (const ch of [".", "!", "?", "\n"]) {
          const i = full.lastIndexOf(ch, offset - 1);
          if (i + 1 > start) start = i + 1;
        }
        const rel = full.slice(offset).search(/[.!?\n]/);
        const end = rel < 0 ? full.length : offset + rel;
        if (!LOC_VICTIM_RE.test(full.slice(start, end))) return whole;
      }
      // "o açıda ... açıyı" tekrarını önle. FB05 · F52: ek/edat hâli korunur — eski biçimler
      // ("'de", "'deki", bulunma edatları, "civarı") için sonuç BAYT-AYNI ("o açıda"/"o açıdaki").
      const suffixText = whole.slice(name.length, whole.length - tail.length);
      const base0 = neutralBase(ki ? "ki" : locCase(suffixText), /açı/i.test(tail));
      let base = base0;
      const atStart = offset === 0 || /[.!?]\s+$/.test(full.slice(0, offset));
      if (atStart) base = base.charAt(0).toLocaleUpperCase("tr-TR") + base.slice(1);
      return base + tail;   // tail daima boşlukla başlar → yapışma imkânsız
    },
  );
}

// ── YAN-CÜMLE DÜZEYİ KONUM İDDİASI (FB05 · F52, 2026-09-24) ─────────────────────────
// KANIT: yukarıdaki nötrleyici (LOC_CLAIM_RE) iddiayı "callout + bulunma eki + ≤60 kr + DAR
// fiil listesi" kalıbıyla tanıyor; guardUnprovenFacts'in ölüm-yeri döngüsü 30 kr pencere +
// DEATH_AT_VERBS. Model aynı iddiayı başka fiille, ayrılma ekiyle, "-deki" sıfatıyla ya da uzun
// ara sözle kurunca HİÇBİR katman eşleşmiyordu (HEAD zinciri, konum ölçülmemiş round'lar):
//   nano-none M1-R4 DA  "A Tree'de siperin yanında beklemeden açıya çıktın, …"
//   nano-none M1-R4 EA0 "Seni A Tree hattında susturup öldüren tek bir görüş hattı vardı"
//   r2b M1-R4 EA0       "Bir düşman seni A Tree yakınındaki siper hattından vurdu"
//   n14 M1-R4 EA1       "Rakip seni A Tree köşesinden vuruyor"
//   r3d2 M1-R4 EA0      "bu round A Tree'de düşmüş olman, …"
//   luna-none M1-R9 DA  "Bu round Mid Bottom'da siperin yanını kullanmadan açıya çıktın"
//   r3c M1-R11 DA       "Jett olarak B Lobby'de o açıyı … (>60 kr) … tek tarafta kaldın"
//   luna-none M1-R4     "A Tree'deki ölümde düşmanın açısını doğrulayacak bilgi yok"
// Hepsinde konum ölçülmemiş, geçmişte başka round'un konumu (R3 a tree / R8 mid bottom / R10
// b lobby) BU round'a yapıştırılıyor (ölüm-yeri launch-blocker sınıfı; 8e99e56 "A Tree"yi
// tanınan callout yaptığı için 9355dec'teki tesadüfi silme de kalktı).
// KURAL — üç kapı birden (fix_final (a)-(e); yalnız "seni/sana" varsa nötrle kuralı ÖĞÜT
// cümlelerinde yanlış-pozitif üretiyordu, ör. "…geri çekil ki rakip seni aynı hatta tutamasın"):
//  (a) YAN-CÜMLENİN yüklemi bildirme kipinde: son kelime -dı/-dın/-du/-dü… (ünsüz uyumlu:
//      bekle-di, çık-tı, öl-dü), -yor(du), var/yok, "-mış olman"; ya da yan-cümlede
//      "öldüren/vuran". Emir ("…tut", "…uzanma"), -masın/-mesin, "ki …" yan-cümlesi ve
//      "(bir) sonraki round" çapası dışarıda.
//  (b) Kurban/ölüm çapası AYNI yan-cümlede: seni/sana/senin, 2. şahıs geçmiş fiil (…dın),
//      ya da "ölüm/ölümde/düşmüş olman/ölmüş olman".
//  (c) Ekler: bulunma, -deki, ayrılma ve LOC_POSTP.
//  (d) Pencere yan-cümle sonuna kadar; sınırlar [.,!?;:—\n] + bağlaçlar (ve, ama, fakat,
//      ancak, çünkü, zira, yoksa, ise, ki). "veya/ya da" BİLEREK sınır değil (koç metninde
//      çoğunlukla ad bağlıyor: "crossfire veya off-angle almak yerine … kaldın").
//  (e) En yakın zaman çapası GEÇMİŞ ise dokunulmaz; ölçülen (supplied) ve geçmiş (history,
//      F83 round kuralıyla) muafiyetleri aynen.
// İkame hâle uyar: bulunma "o açıda", -deki "o açıdaki", ayrılma "o açıdan" (yan-cümlede "açı"
// varsa "o nokta…"). Silme yok; ders ve cümle aynen kalır.
const LOC_CLAUSE_CALLOUT_RE = new RegExp(
  `(?<![\\p{L}\\p{N}_-])(?<!(?:${LOC_HEAD_ALT})\\s)(${LOC_ALT})`
  + `((?:\\s*['’]\\s*)?(?:d[ae]n|t[ae]n|d[ae]ki|t[ae]ki|d[ae]|t[ae])|\\s+${LOC_POSTP})(?![\\p{L}\\p{N}_-])`
  // "de/da" bağlacı ("mid'de de") ikameyle birlikte ünlü uyumuna çekilir ("o açıda da") —
  // ilk sürüm "o açıda de" üretiyordu (korpus cycleb09-base-real M1-R9, cyclereal-r3c M1-R4).
  + `(\\s+d[ae](?![\\p{L}\\p{N}_'’-]))?`,
  "giu",
);
/** Ayrılma eki KARŞILAŞTIRMA/zaman bildiriyorsa konum iddiası değildir ("B Site'tan farklı
 *  bir bölgede", "A Main'den sonra") — korpus cycleab-luna-none2 M1-R9 EA0 ilk sürümde
 *  "o açıdan farklı bir bölgede" oluyordu. */
const ABL_NON_LOC_AFTER_RE = /^\s+(?:farklı|başka|ayrı|uzak|önce|sonra|itibaren|beri)(?![\p{L}])/iu;
/** Yan-cümle sınırı olan bağlaçlar ("veya/ya da" bilerek yok — bkz. (d)). */
const LOC_CLAUSE_CONJ_RE = /\s(ve|ama|fakat|ancak|çünkü|zira|yoksa|ise|ki)\s/giu;
/** Ünsüz uyumlu -dI(n) sonu: ünlüden sonra d (bekle-di), sert ünsüzden sonra t (çık-tı),
 *  yumuşak ünsüzden sonra d (öl-dü). "kapat-ın/tut-un" (emir, ünlü+t) böylece elenir. */
const PAST_SUFFIX_CORE = "(?:[aıoueiöüâ]d|[çfhkpsşt]t|[bcdgğjlmnrvyzw]d)[ıiuü]";
const SECOND_PAST_WORD_RE = new RegExp(`(?<![\\p{L}])([\\p{L}]*${PAST_SUFFIX_CORE}n)(?![\\p{L}])`, "giu");
const INDICATIVE_FINAL_RE = new RegExp(
  `(?:${PAST_SUFFIX_CORE}(?:n|k|m|nız|niz|nuz|nüz|lar|ler)?|[ıiuü]yor(?:du|dun|dum|sun|lar|lardı|uz|um)?|^var|^yok)$`,
  "iu",
);
/** Ad/sıfat olup -dI(n) ile biten sık kelimeler (korpus taraması: hattı ×12, kendin, kaydı…). */
const PAST_WORD_STOP = new Set([
  "hattı", "hattın", "kendi", "kendin", "şimdi", "adı", "adın", "tadı", "üstü", "üstün", "kaydı",
  "kaydın", "roundun", "kredin", "kadın", "ordu", "ordun", "yurdu", "midi", "bütün", "sağdı",
]);
const DEATH_NOMINAL_RE = /(?<![\p{L}])(?:ölüm(?:de|ün|den|ü)?|(?:düşmüş|ölmüş)\s+olman)(?![\p{L}])/iu;
const PARTICIPLE_RE = /(?<![\p{L}])(?:öldüren|vuran)(?![\p{L}])/iu;
const LOC_VICTIM_ANY_CASE_RE = new RegExp(LOC_VICTIM_RE.source, "iu");
const NEXT_ROUND_RE = /(?<![\p{L}])(?:bir\s+)?sonraki\s+(?:round|raund|tur)/iu;
/** [start,end) konum iddiasını içeren YAN-CÜMLE sınırları ve "ki" ile açılıp açılmadığı. */
function locClauseBounds(full: string, start: number, end: number): { cs: number; ce: number; kiClause: boolean } {
  let cs = start;
  while (cs > 0 && !/[.,!?;:—\n]/.test(full[cs - 1])) cs--;
  let ce = end;
  while (ce < full.length && !/[.,!?;:—\n]/.test(full[ce])) ce++;
  let kiClause = false;
  for (const m of full.slice(cs, ce).matchAll(LOC_CLAUSE_CONJ_RE)) {
    const a = cs + (m.index ?? 0), b = a + m[0].length;
    if (b <= start) { cs = b; kiClause = m[1].toLowerCase() === "ki"; } else if (a >= end) { ce = a; break; }
  }
  return { cs, ce, kiClause };
}
function clauseHasAnchor(clause: string): boolean {
  // Büyük/küçük harf duyarsız: cümle başındaki "Seni A Tree hattında…" (LOC_VICTIM_RE'nin
  // kendisi küçük harfe bağlı — eski geçişin davranışı değişmesin diye ona dokunulmadı).
  if (LOC_VICTIM_ANY_CASE_RE.test(clause) || DEATH_NOMINAL_RE.test(clause)) return true;
  for (const m of clause.matchAll(SECOND_PAST_WORD_RE)) {
    const w = m[1].toLocaleLowerCase("tr");
    if (w.length >= 4 && !PAST_WORD_STOP.has(w)) return true;
  }
  return false;
}
function clauseHasIndicative(clause: string): boolean {
  if (PARTICIPLE_RE.test(clause)) return true;
  const t = clause.trim().replace(/[\s"'’”)\]]+$/u, "");
  if (/m[ıiuü]ş\s+olman$/iu.test(t)) return true;
  const last = (/([\p{L}]+)$/u.exec(t)?.[1] ?? "").toLocaleLowerCase("tr");
  if (!last || PAST_WORD_STOP.has(last)) return false;
  return INDICATIVE_FINAL_RE.test(last);
}
export function neutralizeUnprovenLocationClauses(
  text: string,
  supplied: ReadonlySet<string>,
  history: ReadonlySet<string> = new Set(),
  anchoredBefore: ReadonlySet<string> = new Set(),
  historyRounds?: ReadonlyMap<number, string>,
): string {
  if (!text) return text;
  return text.replace(LOC_CLAUSE_CALLOUT_RE, (whole: string, name: string, suffix: string, clitic: string | undefined, offset: number, full: string) => {
    const key = name.trim().toLowerCase();
    const end = offset + whole.length;
    if (supplied.has(key)) return whole;                                   // (e) bu round ölçüldü
    // Liste üyesi ("B Main/Mid'deki tekrarları…") tek başına bu round iddiası değil — korpus
    // cycleb06-parity-real M1-R11 EA1 ilk sürümde "B Main/o noktadaki" oluyordu.
    if (/\/\s*$/.test(full.slice(0, offset))) return whole;
    if (locCase(suffix) === "abl" && ABL_NON_LOC_AFTER_RE.test(full.slice(end - (clitic ?? "").length))) return whole;
    if (historyAnchorAt(full, offset, end) === "past") return whole;        // (e) geçmişe çapalı
    if (historyExempt(key, history, anchoredBefore, full, offset, end, historyRounds)) return whole;
    const { cs, ce, kiClause } = locClauseBounds(full, offset, end);
    if (kiClause) return whole;                                             // (a) "ki …" yan-cümlesi
    const clause = full.slice(cs, ce);
    if (NEXT_ROUND_RE.test(clause)) return whole;                          // (a) sonraki round planı
    if (!clauseHasAnchor(clause) || !clauseHasIndicative(clause)) return whole;   // (b) + (a)
    let base = neutralBase(locCase(suffix), /açı/i.test(full.slice(end, ce)));
    const atStart = offset === 0 || /[.!?]\s+$/.test(full.slice(0, offset));
    if (atStart) base = base.charAt(0).toLocaleUpperCase("tr-TR") + base.slice(1);
    return clitic ? `${base} da` : base;
  });
}

/** EN ÖLÇÜLMEMİŞ KONUM NÖTRLEYİCİSİ (TR-KALAN-13, 2026-09-23).
 *
 * NEDEN: B3 nötrleyicisi (yukarıda) yalnız Türkçe lokatif + Türkçe geçmiş fiile
 * bağlı; EN aynası (guardUnprovenFacts) yalnız ölüm fiilini ("died at / killed you
 * at") yakalıyor. Konum okunmamışken "You held the same corner at A Heaven and Jett
 * killed you from there." HİÇBİR katmana takılmadan geçiyordu ("You died at A
 * Heaven." ise "You died." oluyordu). EN istemci zinciri canlı; EN raw'larda baskın
 * kalıp "You held a wide angle at B Market / on A Site / in B Long" (replay 9/228).
 *
 * SÖZLEŞME (TR ile aynı kapılar): "<edat> <callout>" → "there" (silme değil ikame —
 * cümle ve ders kalır).
 *  1) 2. şahıs GEÇMİŞ ("you held/stood/waited/stayed/sat/peeked/got caught…") →
 *     çapa tek başına yeter; emir/öğüt ("Hold the angle at A Heaven", "Don't wait at
 *     B Main") özne+geçmiş şartına uymaz → DOKUNULMAZ.
 *  2) 3. şahıs ("held/was holding/waited/was waiting/killed/shot/caught") yalnız AYNI
 *     cümlede kurban çapası ("you"/"your", "your teammate/team" HARİÇ) varsa.
 *  3) ÖLÇÜLEN konum MUAF (supplied = deathLocation + roundHistory).
 *  4) Callout BÜYÜK harfle yazılmış olmalı ("A Heaven", "B Main") — EN'de havuzdaki
 *     çıplak adlar gündelik kelimedir ("in green smoke", "near the window").
 *  Yan-cümle sınırı [.,!?;:—\n]; iyelik ("at A Heaven's edge") dokunulmaz.
 */
const EN_LOC_TAIL = `\\s(?:at|in|on|near|around)\\s+(${LOC_ALT})(?![\\p{L}\\p{N}_'’-])`;
const EN_LOC_SELF_RE = new RegExp(
  `(?<![\\p{L}])(you\\s+(?:held|were\\s+holding|stood|waited|stayed|sat|were\\s+sitting|got\\s+caught|were\\s+caught|peeked)(?![\\p{L}])[^.,!?;:—\\n]{0,40}?)${EN_LOC_TAIL}`,
  "giu",
);
const EN_LOC_THIRD_RE = new RegExp(
  `(?<![\\p{L}])((?:held|was\\s+holding|waited|was\\s+waiting|killed|shot|caught)(?![\\p{L}])[^.,!?;:—\\n]{0,40}?)${EN_LOC_TAIL}`,
  "giu",
);
// Kurban çapası = NESNE/İYELİK konumundaki "you/your" (TR "seni/sana/senin"
// aynası). EN'de "you" özne de olabildiği için cümle başındaki ya da bağlaçtan
// sonraki "you" SAYILMAZ: "Your teammate was holding at B Main while you pushed."
// müttefik cümlesidir (TR vaka 43'ün aynası) — ilk sürüm bunu nötrlüyordu (probe).
const EN_SUBJ_LEAD = new Set(["and", "but", "while", "when", "as", "so", "if", "because", "before", "after", "until", "since", "or", "then", "once", "that", "where"]);
function hasEnVictimAnchor(sentence: string): boolean {
  for (const m of sentence.matchAll(/(?<![\p{L}])(you|your)(?![\p{L}'’])/giu)) {
    const low = m[1].toLowerCase();
    const rest = sentence.slice((m.index ?? 0) + m[0].length);
    if (low === "your") {
      if (!/^\s+(?:team|teammates?|ally|allies|duo|squad)(?![\p{L}])/iu.test(rest)) return true;
      continue;
    }
    const prev = /([\p{L}]+)[^\p{L}]*$/u.exec(sentence.slice(0, m.index ?? 0));
    if (prev && !EN_SUBJ_LEAD.has(prev[1].toLowerCase())) return true;   // nesne konumu
  }
  return false;
}

export function neutralizeUnprovenLocationsEn(
  text: string,
  supplied: ReadonlySet<string>,
  history: ReadonlySet<string> = new Set(),
  anchoredBefore: ReadonlySet<string> = new Set(),
  // FB05 · F83: round_index → ölçülmüş konum; sayısal round çapası yalnız o round'la eşleşir.
  historyRounds?: ReadonlyMap<number, string>,
): string {
  if (!text) return text;
  const keep = (name: string, off: number, end: number, full: string) => {
    const key = name.trim().toLowerCase();
    return !/^\p{Lu}/u.test(name) || supplied.has(key) || historyExempt(key, history, anchoredBefore, full, off, end, historyRounds);
  };
  let out = text.replace(EN_LOC_SELF_RE, (whole: string, head: string, name: string, offset: number, full: string) =>
    (keep(name, offset, offset + whole.length, full) ? whole : `${head} there`));
  out = out.replace(EN_LOC_THIRD_RE, (whole: string, head: string, name: string, offset: number, full: string) => {
    if (keep(name, offset, offset + whole.length, full)) return whole;
    let start = 0;
    for (const ch of [".", "!", "?", "\n"]) {
      const i = full.lastIndexOf(ch, offset - 1);
      if (i + 1 > start) start = i + 1;
    }
    const rel = full.slice(offset).search(/[.!?\n]/);
    const end = rel < 0 ? full.length : offset + rel;
    return hasEnVictimAnchor(full.slice(start, end)) ? `${head} there` : whole;
  });
  return out;
}

// ── ÖLÇÜLMÜŞ KONUMLA ÇELİŞEN ÖLÜM YERİ (FB05 · F14 (1), 2026-09-24) ─────────────────
// KANIT: konum koruması tek yönlüydü — yalnız "konum bilinmiyor" dalı vardı
// (hasDeathLocation===false); ölçülmüş deathLocation yalnız muafiyet kümesine giriyordu.
// Probe: realityCheck("Bu round B Main'de öldün…", rh, {hasDeathLocation:true, deathLocation:
// 'a site'}) → BAYT-AYNI. Korpus (deathLocation'lı 474 TR örnek, HEAD zinciri): cyclereal-r2b
// M1-R7 NR "bu round B Main'de öldün" (ölçülen b site), cyclereal-base M1-R8 NR "Bu round B
// Main'de … öldün" (mid bottom), cyclereal-r4c M1-R8 NR "Bu round B Main'de 2, … öldün" (mid
// bottom) — tarihsel launch-blocker sınıfı (yanlış ölüm yeri) kullanıcıya gidiyordu.
// KURAL (dar): 2. şahıs ÖLÜM fiiline bağlı callout (TR "öldün / öldüğün… / vuruldun" ≤30 kr
// ve virgülsüz — ya da callout'tan sonra yalnız "<sayı>," gelen fiilsiz parça; EN "you died
// at / killed you at <Callout>"):
//   • bu round'un ölçülen konumu DEĞİLSE (ve biri ötekinin alt kümesi değilse — kaba OCR
//     "mid" ile modelin ince "Mid Bottom"u çelişki sayılmaz),
//   • OYNANAN haritanın tablosunda VARSA (OCR varyantı / özgün ifade dokunulmaz),
//   • callout'un yan-cümlesi (virgül dahil sınır) geçmişe çapalı DEĞİLSE ("R\d", "önceki",
//     "N kez", "earlier", "recently"…; "bu round" çapa SAYILMAZ),
//   • bir listenin parçası değilse ("B Main/B Lobby'de") ve bağlanan aralıkta başka callout yoksa
// → ölçülen konumla değiştirilir (tabloda kanonikse; TR trLocative ile ek uyumu), değilse
// "o noktada" / "there" ile nötrlenir. Silme yok: ders ve cümle aynen kalır.
const DEATH_BIND_TR_RE = new RegExp(
  `(?<![\\p{L}\\p{N}_-])(?<!(?:${LOC_HEAD_ALT})\\s)(${LOC_ALT})(\\s*['’]?\\s*(?:d[ae]|t[ae]))(?![\\p{L}\\p{N}_-])`
  + `(\\s[^.,!?;:—\\n]{0,30}?|\\s+\\d+\\s*,[^.!?;:—\\n]{0,60}?\\s)(öldün|öldüğün[\\p{L}]*|vuruldun)(?![\\p{L}])`,
  "giu",
);
const DEATH_BIND_EN_RE = new RegExp(
  `(?<![\\p{L}])(you\\s+(?:[\\p{L}]+\\s+)?died|killed\\s+you)\\s+(at|in|on|near)\\s+(${LOC_ALT})(?![\\p{L}\\p{N}_'’-])`,
  "giu",
);
/** Ring-yerel ek geçmiş çapaları (LOC_PAST_ANCHOR_RE'nin kapsamadığı tekil biçimler). */
const DEATH_BIND_PAST_EXTRA_RE = /(?<![\p{L}])(?:önceki|geçen|recently|son\s+zamanlarda)(?![\p{L}])/iu;
const LOC_ALT_ANY_RE = new RegExp(`(?<![\\p{L}\\p{N}_-])(?:${LOC_ALT})(?![\\p{L}\\p{N}_-])`, "iu");
/** "a site" → "A Site", "mid bottom" → "Mid Bottom" (site harfi / ct büyük). */
function calloutDisplay(loc: string): string {
  return loc.trim().split(/\s+/).map((w) => (/^(?:[abc]|ct|t)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
}
function correctContradictedDeathLocation(
  text: string, measured: string, mk: string, currentLocs: ReadonlySet<string>, lang?: "tr" | "en",
): string {
  const table = MAP_CALLOUTS[mk];
  const words = (x: string) => x.split(/\s+/).filter(Boolean);
  const nested = (a: string, b: string) => {
    const wa = words(a), wb = words(b);
    return wa.every((w) => wb.includes(w)) || wb.every((w) => wa.includes(w));
  };
  const canonical = table.includes(measured);
  /** Callout'un yan-cümlesi (virgül dahil sınır) geçmişe çapalı mı? */
  const pastAnchored = (full: string, from: number, to: number) => {
    let cs = from;
    while (cs > 0 && !/[.,!?;:—\n]/.test(full[cs - 1])) cs--;
    let ce = to;
    while (ce < full.length && !/[.,!?;:—\n]/.test(full[ce])) ce++;
    const seg = full.slice(cs, ce);
    return new RegExp(LOC_PAST_ANCHOR_RE.source, "iu").test(seg) || DEATH_BIND_PAST_EXTRA_RE.test(seg);
  };
  const eligible = (name: string, offset: number, full: string) => {
    const key = name.trim().toLowerCase().replace(/\s+/g, " ");
    if (currentLocs.has(key) || !table.includes(key) || nested(key, measured)) return false;
    return !/\/\s*$/.test(full.slice(0, offset));          // liste parçası değil
  };
  let out = text;
  if (lang !== "en") {
    out = out.replace(DEATH_BIND_TR_RE, (whole: string, name: string, _suf: string, mid: string, verb: string, offset: number, full: string) => {
      if (!eligible(name, offset, full) || /^\s*\//.test(mid) || LOC_ALT_ANY_RE.test(mid)) return whole;
      // Fiilsiz "<sayı>," parçasında çapa yalnız callout'un KENDİ parçasında aranır.
      const fragComma = /^\s+\d+\s*,/.test(mid) ? offset + name.length + _suf.length + mid.indexOf(",") : offset + whole.length;
      if (pastAnchored(full, offset, fragComma)) return whole;
      const atStart = offset === 0 || /[.!?]\s+$/.test(full.slice(0, offset));
      let head = canonical ? trLocative(calloutDisplay(measured)) : "o noktada";
      if (!canonical && atStart) head = "O noktada";
      return head + mid + verb;
    });
  }
  if (lang !== "tr") {
    out = out.replace(DEATH_BIND_EN_RE, (whole: string, verb: string, prep: string, name: string, offset: number, full: string) => {
      if (!/^\p{Lu}/u.test(name)) return whole;                  // EN'de çıplak küçük ad gündelik kelime
      const at = offset + whole.length - name.length;
      if (!eligible(name, at, full) || pastAnchored(full, offset, offset + whole.length)) return whole;
      return canonical ? `${verb} ${prep} ${calloutDisplay(measured)}` : `${verb} there`;
    });
  }
  return out;
}

export function realityCheck(
  outputText: string,
  roundHistory: RoundMemoryEntry[],
  factGround?: FactGround,
  // Cycle 3 (council 2026-06-26): field-type hint. "suggestion" suppresses the
  // neutral death-fallback (returns "" instead so the route keeps the original
  // advice). Omitted ⇒ "death"/"generic" behavior = byte-identical to before;
  // every existing report/insight/feedback caller is unaffected.
  kind?: "death" | "suggestion" | "generic",
  // Denetim 2026-07-19 (F5): İSTEK dili (route reqLang'den). Verilirse guard +
  // rewrite replacement metinleri bu dille yazılır (özel-harfsiz TR cümlenin EN
  // sayılıp "an enemy"/"recently" enjekte edilmesi biter). Verilmezse eski
  // heuristik → mevcut çağıranlar (eval-vision dahil) bayt-aynı.
  lang?: "tr" | "en",
  // Oynanan harita (canlı bug 2026-07-21): verilirse o haritaya AİT OLMAYAN
  // callout'lar metinden ayıklanır (Lotus'ta "A Short" gibi). VERİLMEZSE ya da
  // harita tabloda yoksa hiçbir şey değişmez — tüm mevcut çağıranlar bayt-aynı.
  map?: string,
): { text: string; modified: boolean; rewriteLevel: number } {
  if (!outputText) {
    return { text: outputText, modified: false, rewriteLevel: 1 };
  }

  let text = outputText;
  let rewriteLevel = 1;

  // ÖLÇÜLMÜŞ KONUMLAR (TR-KALAN-16, 2026-09-23) — bu round'un deathLocation'ı +
  // geçmiş round'ların death_position'ları. Masaüstünün ölçtüğü konum HİÇBİR
  // katmanda silinmez; eskiden yalnız bu round'unki muaftı ve canlı r4-a'da
  // "(R1 A Hall, R2 B Generator, R3 B Link)" → "(…, R3 )", M1-R4'te "A Tree
  // yanında durdun" → "yanında durdun" (20 ayrı cycle final'i) oluyordu.
  const measured = suppliedLocationSet(factGround?.deathLocation, roundHistory);
  // B02 İNCELEME: ölüm-yeri İDDİASI muafiyeti iki kümeye ayrıldı — bu round'un
  // ölçülmüş konumu koşulsuz, geçmişin güvenilir konumu yalnız geçmişe çapalı
  // yan-cümlede (historyMatchesAnchor). `measured` (tam küme) yalnız harita meşruiyeti.
  const currentLocs = currentLocationSet(factGround?.deathLocation);
  const historyLocs = historyLocationSet(roundHistory);
  // FB05 · F83: aynı süzgeçle round'a göre dizin (sayısal round çapası muafiyeti).
  const historyRounds = historyRoundLocationMap(roundHistory);

  // Yabancı-harita callout ayıklaması — EN BAŞTA çalışır ki sonraki guard'lar
  // zaten temizlenmiş metin üzerinde işlesin (uydurma yer adı hiçbir aşamaya
  // sızmasın). Harita bilinmiyorsa no-op. Ölçülmüş konumlar HER ZAMAN korunur —
  // tablo eksik olsa bile.
  if (map) {
    // FB05 · F12: istek dili geçirilir → EN'de belirsiz artikel ("a long sightline") callout
    // sanılıp silinmez. lang verilmeyen/TR çağrıda strip bayt-aynı.
    const stripped = stripForeignCallouts(text, map, [...measured], lang);
    if (stripped !== text) {
      text = stripped;
      rewriteLevel = Math.max(rewriteLevel, 2);
    }
  }

  // Present-fact guard (route/trade) — runs even with EMPTY round history
  // (round 1) because it validates against the current round's facts, not the
  // match's past memory.
  if (factGround) {
    const guarded = guardUnprovenFacts(text, { ...factGround, measuredLocations: [...currentLocs], historyLocations: [...historyLocs], historyRoundLocations: historyRounds }, lang);
    if (guarded !== text) {
      text = guarded;
      rewriteLevel = Math.max(rewriteLevel, 2);
    }
  }

  // Memory-based claim check (count/window/position/repetition) — logic
  // unchanged; just operates on the (possibly guard-trimmed) text.
  if (roundHistory.length > 0) {
    const claims = extractClaims(text, lang);
    // TR-KALAN-14: salt-pencere iddiası ("Son 5 round'da agresif oynadın") kapıyı
    // tek başına açmıyordu → validateClaims'e hiç ulaşmıyordu. Yalnız ROUND
    // birimli pencere açar; "son 5 maç" bilerek dışarıda (kapsam kararı).
    if (claims.claimedCount || claims.claimedPosition || claims.repetitionClaim
      || (claims.claimedWindow !== null && claims.claimedWindowIsRound === true)) {
      const validation = validateClaims(claims, roundHistory);
      text = rewriteUnsafeClaims(text, claims, validation, kind !== "suggestion", lang, currentLocs);
      rewriteLevel = Math.max(rewriteLevel, validation.rewriteLevel);
    }
  }

  // Nötrleyici (en sonda) için: metinde başka bir yerde geçmişe çapalı anılan geçmiş konumlar
  // (bkz. pastAnchoredHistoryNames). FB05 · F14 (3): memory katmanından SONRA hesaplanır.
  // Eskiden sayım silinmeden ÖNCE yakalanıyordu → "Son 3 kez B Main'de öldün" sayımı (çapası)
  // silinip "B Main'de öldün" kaldığında bile B Main muaf sayılıyordu (test 102 bunu
  // kilitliyordu). Sayım silmesi artık doğru çapayı KENDİSİ yazdığı için (F14 (2)) önceki
  // hâli hatırlamaya gerek yok; çapası gerçekten silinmiş konum muaf DEĞİL.
  const anchoredBefore = factGround?.hasDeathLocation === false
    ? pastAnchoredHistoryNames(text, historyLocs, historyRounds)
    : new Set<string>();

  // ÖLÇÜLMEMİŞ KONUM NÖTRLEMESİ — EN SON çalışır (B3, 2026-09-16).
  // SIRA BİLİNÇLİ: extractClaims/validateClaims yukarıda callout'u ORİJİNAL
  // hâliyle görür → claimedPosition ve rewriteLevel bayt-aynı kalır.
  // hasDeathLocation !== false iken (ölçüldü / bayrak hiç verilmedi) HİÇ çalışmaz
  // → konum okunan her round ve bayrağı set etmeyen her çağıran bayt-aynı.
  if (factGround?.hasDeathLocation === false) {
    let neutralized = neutralizeUnprovenLocations(text, currentLocs, historyLocs, anchoredBefore, historyRounds);
    // FB05 · F52: yan-cümle düzeyi ikinci geçiş (eski geçişin kaçırdığı fiil/ek/pencere biçimleri).
    // TR-only (Türkçe ek + Türkçe yüklem şartı); EN istekte hiç koşmaz (EN yolu bayt-aynı).
    if (lang !== "en") neutralized = neutralizeUnprovenLocationClauses(neutralized, currentLocs, historyLocs, anchoredBefore, historyRounds);
    // TR-KALAN-13: EN aynası yalnız istek dili EN iken (TR yolu bayt-aynı).
    if (lang === "en") neutralized = neutralizeUnprovenLocationsEn(neutralized, currentLocs, historyLocs, anchoredBefore, historyRounds);
    if (neutralized !== text) {
      text = neutralized;
      rewriteLevel = Math.max(rewriteLevel, 2);
    }
  }

  // ÖLÇÜLMÜŞ KONUMLA ÇELİŞEN ÖLÜM YERİ (FB05 · F14 (1)) — konum biliniyorken metnin
  // "bu round <başka callout>'da öldün" iddiası. Yalnız vision'ın TEK-round konumunda
  // (string) ve harita tablosu biliniyorken; rapor yolunun konum DİZİSİ (çok round) kapsam dışı.
  const measuredOne = typeof factGround?.deathLocation === "string" ? factGround.deathLocation.trim().toLowerCase() : "";
  const mk = mapKey(map);
  if (factGround?.hasDeathLocation === true && measuredOne && mk) {
    const fixed = correctContradictedDeathLocation(text, measuredOne, mk, currentLocs, lang);
    if (fixed !== text) {
      text = fixed;
      rewriteLevel = Math.max(rewriteLevel, 2);
    }
  }

  return { text, modified: text !== outputText, rewriteLevel };
}
