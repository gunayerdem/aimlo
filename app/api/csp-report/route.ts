import { NextRequest } from "next/server";

/**
 * POST /api/csp-report — CSP ihlal raporu alıcısı (B62/F92; pano dalga, 2026-08-04)
 *
 * proxy.ts'in yaydığı Content-Security-Policy-Report-Only header'ındaki
 * `report-uri /api/csp-report` buraya düşer. Tarayıcılar bu isteği KENDİLERİ
 * atar (kullanıcı JS'i değil) — o yüzden auth İMKANSIZ ve BİLEREK yok. Bunun
 * telafisi aşağıdaki sertleştirmeler:
 *
 *  - Gövde ≤ 8KB, GÖVDE OKUNMADAN doğrulanır: geçerli bir Content-Length ZORUNLU
 *    (yoksa/0/sayı değil → 411, 8KB'i aşıyorsa → 413). Okuma sonrası gerçek
 *    uzunluk kontrolü ikinci katman olarak duruyor.
 *    NEDEN ZORUNLU (güvenlik denetimi beta4, 2026-08-04): eski sıra "ön kontrol
 *    + okuma sonrası" diyordu ama ön kontrol ATLATILABİLİYORDU — başlık hiç
 *    yollanmazsa `Number(null ?? "0")` = 0 çıkıp kapıdan geçiyor, `request.text()`
 *    gövdeyi TAMAMEN belleğe alıyordu (platform tavanı ~4.5MB). Content-Length'i
 *    şart koşmak bu deliği kapatır: HTTP/1.1'de Content-Length varsa çerçeveleme
 *    ona göre yapılır (fazlası gövdeye dahil edilmez) ve Content-Length ile
 *    Transfer-Encoding: chunked BİRLİKTE gelirse istek zaten reddedilir (request
 *    smuggling koruması) — yani "küçük beyan edip büyük gönderme" yolu yok,
 *    chunked yolu da 411'e takılır.
 *    MEŞRU TRAFİK KIRILMAZ: CSP raporunu tarayıcı kendi gönderir ve gövde
 *    uzunluğu baştan bellidir → Chrome/Firefox/Safari report-uri POST'unda
 *    Content-Length'i DAİMA yollar (fetch/sendBeacon de gövde uzunluğunu bilir).
 *  - IP başına kaba oran sınırı: 20 rapor/dk, in-memory (görev: "in-memory
 *    yeter"). Serverless'ta her lambda örneğinin kendi Map'i olur — kusursuz
 *    değil ama flood'u örnek başına keser, amaç bu.
 *    DÜRÜST SINIR (güvenlik denetimi beta4, 2026-08-04): bu kapı ÖRNEK BAŞINA
 *    çalışır — cold-start'ta sayaç sıfırlanır ve dağıtık (çok-IP / çok-örnek)
 *    bir flood bunu atlar. Bilinçli olarak Upstash'e BAĞLANMADI: bu uç auth'suz
 *    ve tarayıcı-tetikli, Redis'e bağlamak her ihlal raporunu maliyet/kota
 *    yoluna sokardı. Gerçek çözüm ağ katmanında: dağıtık flood için Vercel
 *    Firewall/WAF (yol bazlı oran sınırı) gerekir.
 *  - Log hacmi tavanı: örnek başına dakikada en fazla MAX_LOGGED_LINES_PER_WINDOW
 *    satır. Üstü SESSİZCE düşer (yanıt yine 204) — IP sınırını atlayan dağıtık
 *    bir flood'un faturayı/log gürültüsünü şişirmesine karşı sabit tavan.
 *    Ayrı bir sayaç uzunluk kapısına takılan istekleri pencere başına TEK satırda
 *    özetler (bkz. noteLengthReject) — böylece "başlık düşürüldü, tüm raporlar
 *    sessizce gitti" hâli fark edilir; ana bütçeyi yemez.
 *  - Map tavanı: IP spoof'la hafıza şişirilemesin diye en fazla 2000 IP izlenir;
 *    tavan aşımında süresi geçenler süpürülür, hâlâ doluysa istek sessizce
 *    düşürülür (bu uç yalnız telemetri — kapalı düşmek güvenli taraf).
 *  - PII LOGLANMAZ: IP, User-Agent, cookie, query string stdout'a ASLA yazılmaz.
 *    Yalnız violated-directive + sanitize edilmiş blocked-uri/source-file özeti
 *    console'a gider (Vercel logs). URI'lerden query/hash kırpılır — token
 *    sızıntısı yolu kapalı.
 *  - Hatalı/parse edilemeyen gövde → sessiz 204. Saldırgana format probu için
 *    geri bildirim verilmez, tarayıcıya retry sebebi verilmez.
 *
 * Desktop sözleşmesiyle İLGİSİZ yeni uç — mevcut hiçbir shape'e dokunmaz.
 * İki format kabul edilir:
 *   1) report-uri klasik: { "csp-report": { "violated-directive": ... } }
 *      (Content-Type: application/csp-report)
 *   2) Reporting API dizisi: [{ type: "csp-violation", body: {...} }]
 *      (Content-Type: application/reports+json) — ileride report-to'ya
 *      geçersek endpoint hazır.
 */

// Rapor alımı mikro-iş — Vercel bütçesinden çalmasın (telemetry route kalıbı).
export const maxDuration = 5;

const MAX_BODY_BYTES = 8 * 1024; // 8KB — tek CSP raporu tipik ~1KB, bol pay.
const WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 20; // IP başına dakikada 20 rapor — sayfa başına birkaç ihlal + gezinme payı.
const MAX_TRACKED_IPS = 2000; // in-memory Map tavanı (hafıza guard'ı).
const MAX_LOGGED_REPORTS = 5; // Tek gövdeden en fazla 5 ihlal özetlenir (Reporting API batch atabilir).
const MAX_FIELD_LEN = 160; // Log alanı başına karakter tavanı.
// Örnek başına toplam log tavanı: 20 rapor/dk × 5 ihlal = tek IP'nin üretebileceği
// en fazla 100 satır. 200, meşru çok-kullanıcılı trafiğe 2× pay bırakır ama dağıtık
// flood'un log hacmini sabitler (güvenlik denetimi beta4, 2026-08-04).
const MAX_LOGGED_LINES_PER_WINDOW = 200;

type IpWindow = { count: number; resetAt: number };
const ipHits = new Map<string, IpWindow>();

// Örnek-ömrü boyunca yaşayan log bütçesi (IP'den bağımsız, toplam).
let logWindowResetAt = 0;
let logLinesInWindow = 0;

/**
 * true = bu log satırı yazılabilir; false = dakikalık bütçe doldu, SESSİZCE düş.
 *
 * NEDEN (güvenlik denetimi beta4, 2026-08-04): IP sayacı örnek başına olduğu için
 * dağıtık bir flood (her IP limitin altında) sınırsız `console.warn` üretebiliyordu
 * — log maliyeti + gürültü. Bu tavan yanıt davranışına DOKUNMAZ (her hâlükârda 204),
 * yalnız stdout hacmini sabitler. Bütçe ilk dolduğunda tek bir uyarı satırı basılır
 * ki "loglar sessizce kesildi" durumu operasyonda görünür olsun.
 */
function allowLogLine(now: number): boolean {
  if (now >= logWindowResetAt) {
    logWindowResetAt = now + WINDOW_MS;
    logLinesInWindow = 0;
  }
  logLinesInWindow++;
  if (logLinesInWindow <= MAX_LOGGED_LINES_PER_WINDOW) return true;
  if (logLinesInWindow === MAX_LOGGED_LINES_PER_WINDOW + 1) {
    console.warn(
      "[csp-report] log budget exhausted for this window — further reports dropped from logs (responses unchanged).",
    );
  }
  return false;
}

// Uzunluk kapısı tanılaması: pencere başına EN FAZLA 1 özet satır.
let lenRejectWindowResetAt = 0;
let lenRejectCount = 0;

/**
 * Uzunluk kapısına (411) takılan istekleri sayar, pencere değişince TEK satır özet basar.
 *
 * NEDEN (güvenlik denetimi beta4, 2026-08-04): Content-Length'i şart koşmanın tek
 * gerçek riski, araya giren bir katmanın (proxy/CDN) başlığı düşürmesi hâlinde TÜM
 * meşru raporların sessizce reddedilmesi ve "hiç ihlal yok" sanılmasıdır. Bu sayaç
 * o sessiz kaybı görünür kılar. Kendi log bütçesi var (dakikada 1 satır) ki
 * saldırgan bunu ne şişirebilsin ne de gerçek ihlal satırlarını bastırmak için
 * kullanabilsin. PII yok: yalnız sayı yazılır, IP/UA ASLA.
 */
function noteLengthReject(now: number): void {
  if (now >= lenRejectWindowResetAt) {
    if (lenRejectCount > 0) {
      console.warn(`[csp-report] length-gate rejected ${lenRejectCount} request(s) in the previous window`);
    }
    lenRejectWindowResetAt = now + WINDOW_MS;
    lenRejectCount = 0;
  }
  lenRejectCount++;
}

/**
 * IP çözümü — lib/api-auth.ts:461-468 ile AYNI mantık (oradan kopya, çünkü o
 * fonksiyon export edilmiyor ve bu paket lib/'e dokunamaz): Vercel'de x-real-ip
 * platform tarafından set edilir, spoof edilemez — öncelik onda. XFF'e düşersek
 * SON eleman alınır (Vercel gerçek IP'yi zincirin SONUNA ekler; başı client
 * kontrolünde).
 */
function clientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  const xffLast = xff ? xff.split(",").pop()?.trim() : undefined;
  return request.headers.get("x-real-ip") || xffLast || "unknown";
}

/** true = bu istek işlenebilir; false = pencere dolu ya da Map tavanda. */
function allowByIp(ip: string, now: number): boolean {
  const entry = ipHits.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX_REPORTS_PER_WINDOW) return false;
    entry.count++;
    return true;
  }
  // Yeni pencere açılacak — önce tavan kontrolü (süresi geçenleri süpür).
  if (!entry && ipHits.size >= MAX_TRACKED_IPS) {
    for (const [k, v] of ipHits) {
      if (now >= v.resetAt) ipHits.delete(k);
    }
    // Süpürme yetmediyse: yeni IP izleyemeyiz → isteği düşür (fail-closed;
    // rapor kaybı kabul edilebilir, hafıza şişmesi değil).
    if (ipHits.size >= MAX_TRACKED_IPS) return false;
  }
  ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  return true;
}

/**
 * URI sanitizasyonu: query + hash atılır (token/PII sızıntı yolu), uzunluk
 * kırpılır. CSP'nin "inline" / "eval" / "data" gibi anahtar-kelime değerleri
 * URL değildir — olduğu gibi (kırpılarak) geçer.
 */
function sanitizeUri(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  let out = value;
  try {
    const u = new URL(value);
    out = `${u.origin}${u.pathname}`;
  } catch {
    // URL değil ("inline", "eval", göreli yol...) — ham değerden query'yi yine de kes.
    const cut = out.search(/[?#]/);
    if (cut !== -1) out = out.slice(0, cut);
  }
  return out.slice(0, MAX_FIELD_LEN);
}

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  return value.slice(0, MAX_FIELD_LEN);
}

type ViolationSummary = {
  violatedDirective?: string;
  effectiveDirective?: string;
  blockedUri?: string;
  documentUri?: string;
  sourceFile?: string;
  lineNumber?: number;
  disposition?: string;
};

/** Tek bir ihlal objesinden (her iki formatın body'si) PII'siz özet çıkarır. */
function summarize(raw: Record<string, unknown>): ViolationSummary | null {
  const summary: ViolationSummary = {
    // report-uri formatı kebab-case, Reporting API camelCase — ikisi de denenir.
    violatedDirective: sanitizeText(raw["violated-directive"] ?? raw["violatedDirective"]),
    effectiveDirective: sanitizeText(raw["effective-directive"] ?? raw["effectiveDirective"]),
    blockedUri: sanitizeUri(raw["blocked-uri"] ?? raw["blockedURL"] ?? raw["blockedURI"]),
    documentUri: sanitizeUri(raw["document-uri"] ?? raw["documentURL"] ?? raw["documentURI"]),
    sourceFile: sanitizeUri(raw["source-file"] ?? raw["sourceFile"]),
    disposition: sanitizeText(raw["disposition"]),
  };
  const line = raw["line-number"] ?? raw["lineNumber"];
  if (typeof line === "number" && Number.isFinite(line)) summary.lineNumber = line;

  // Hiç anlamlı alan yoksa loglama — çöp gövdeyle stdout doldurulamasın.
  if (!summary.violatedDirective && !summary.effectiveDirective && !summary.blockedUri) {
    return null;
  }
  return summary;
}

/** Gövdeyi iki bilinen formattan birine göre ihlal listesine indirger. */
function extractViolations(parsed: unknown): ViolationSummary[] {
  const out: ViolationSummary[] = [];

  const push = (candidate: unknown) => {
    if (out.length >= MAX_LOGGED_REPORTS) return;
    if (typeof candidate !== "object" || candidate === null) return;
    const s = summarize(candidate as Record<string, unknown>);
    if (s) out.push(s);
  };

  if (Array.isArray(parsed)) {
    // Reporting API: [{ type: "csp-violation", body: {...} }, ...]
    for (const item of parsed) {
      if (typeof item === "object" && item !== null) {
        const body = (item as Record<string, unknown>)["body"];
        push(body);
      }
    }
  } else if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj["csp-report"] === "object" && obj["csp-report"] !== null) {
      // Klasik report-uri zarfı.
      push(obj["csp-report"]);
    } else {
      // Zarfsız düz obje gönderen tarayıcı/araçlar için tolerans.
      push(obj);
    }
  }
  return out;
}

export async function POST(request: NextRequest) {
  const now = Date.now();

  // 1) IP oranlama — gövdeyi OKUMADAN önce; flood'da CPU/IO harcanmaz.
  if (!allowByIp(clientIp(request), now)) {
    return new Response(null, { status: 429 });
  }

  // 2) Boyut kapısı — GÖVDE OKUNMADAN. Geçerli Content-Length ŞART.
  //
  // NEDEN (güvenlik denetimi beta4, 2026-08-04): eski hâlde başlık yoksa
  // `Number(null ?? "0")` = 0 çıkıyor, koşul `0 > 8KB` yanlış olduğu için kapı
  // AÇILIYOR ve `request.text()` ne gelirse belleğe alıyordu (platform tavanı
  // ~4.5MB × eşzamanlı istek). Yani dosya başındaki "ön kontrol + okuma sonrası"
  // güvencesinin ilk yarısı atlatılabilirdi; artık atlatılamıyor.
  // Ayrıntılı gerekçe + "meşru tarayıcı trafiği neden kırılmaz" kanıtı dosya
  // başındaki blokta.
  // Sıkı ayrıştırma: RFC 9110 Content-Length = SADECE ondalık rakamlar. `Number()`
  // tek başına "1e3"/"+8"/"0x10" gibi HTTP'de geçersiz biçimleri de kabul ederdi;
  // rakam-dışı her şey NaN'a düşürülüp 411 alsın (ölçüldü: check.mjs doğruluk tablosu).
  const rawLen = request.headers.get("content-length")?.trim();
  const declaredLen = rawLen && /^\d{1,10}$/.test(rawLen) ? Number(rawLen) : Number.NaN;
  if (!Number.isInteger(declaredLen) || declaredLen <= 0) {
    // Uzunluk beyanı yok/geçersiz/boş gövde → okumadan 411 (Length Required).
    noteLengthReject(now);
    return new Response(null, { status: 411 });
  }
  if (declaredLen > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return new Response(null, { status: 204 });
  }

  // 3) İkinci katman: gerçek uzunluk. Yukarıdaki kapı çerçevelemeyi zaten
  //    bağlıyor (UTF-8'de string uzunluğu ≤ bayt sayısı), bu satır yine de
  //    savunma-derinliği olarak duruyor — runtime beklenmedik davranırsa yakalar.
  if (text.length > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Parse edilemeyen gövde: sessiz kabul (204) — probing'e sinyal yok.
    return new Response(null, { status: 204 });
  }

  const violations = extractViolations(parsed);
  for (const v of violations) {
    // Tek satır, yapısal, PII'siz — Vercel logs'ta `[csp-report]` ile grep'lenir.
    // Enforce kararı öncesi envanter bu satırlardan çıkarılacak (B62 plan (c)).
    // Dakikalık log bütçesi dolduysa satır SESSİZCE düşer; yanıt (204) değişmez.
    if (!allowLogLine(now)) break;
    console.warn("[csp-report]", JSON.stringify(v));
  }

  // Tarayıcıya her durumda içeriksiz başarı — CSP raporlama uçlarının standardı.
  return new Response(null, { status: 204 });
}
