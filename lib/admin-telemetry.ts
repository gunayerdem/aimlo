// Telemetri kartı — veri katmanı (server-only). B08 (2026-09-24 · A064/A006)
//
// NEDEN VAR: `telemetry_events` (supabase/0015_telemetry_events.sql) 31.07'den
// beri YAZILIYOR ama repo'da onu OKUYAN tek satır yoktu — admin katmanının
// okuduğu tablolar analyses/ai_usage/match_events/profiles/player_memory/
// admins/support_messages idi. Sonuç: app_open/login_ok/watch_started 31.07 →
// 16.09 arası `invalid_type` ile sessizce düştü ve bu ancak elle yazılan bir
// scratchpad SQL'iyle bulundu. 0015:77 "admin kartı bunların üstüne kurulur"
// diyordu; kart hiç yapılmamıştı. Bu modül o kartın verisini tek çağrıda verir:
//   (a) error_code_count — kod × sürüm, son 24 saat ve 7 gün (sum(count))
//   (b) ai_call_duration_ms — route bazlı p50/p95 (percentile_cont), son 24 saat
//   (c) huni — app_open / login_ok / watch_started ayrık kullanıcı, 7 gün
//   (d) izleyen — watch_health gönderen ayrık kullanıcı, son 60 dk
//   (e) reddedilenler — route'un yazdığı `telemetry_rejected` satırları, 7 gün
// (a) ve (b), 0015'in 79-93. satırlarındaki örnek sorgularla BİREBİR aynı
// anlamdadır (created_at penceresi, sum(count), percentile_cont) — panel ile
// SQL editörü aynı sayıyı göstermeli.
//
// (d) NEDEN 60 dk (plan 10 dk diyordu): desktop telemetriyi 30 dk'lık partilerle
// gönderiyor (aimlo-desktop telemetry.rs:48 FLUSH_INTERVAL = 30*60 s, :416
// `last_flush.elapsed() >= FLUSH_INTERVAL`). 10 dk'lık created_at penceresi
// sürekli izleyen kullanıcıyı çoğu an 0 gösterirdi — tam da kaçındığımız sahte
// sıfır. 60 dk = 2 × flush aralığı: son yarım saattir izleyen herkes en az bir
// parti göndermiş olur. Kartta "şu an online DEĞİL, gecikmeli" diye yazılır.
//
// SAHTE VERİ YOK: bir bölümün sorgusu hata verir ya da zaman aşımına uğrarsa o
// bölüm `null` döner ve kart "bilinmiyor" yazar — asla 0 uydurulmaz. Satır
// tavanına dayanılırsa `truncated: true` döner ve kart sayının önüne "≥" koyar.
//
// SAYFALAMA: Supabase projelerinde API "Max rows" ayarı (proje varsayılanı 1000)
// istek başına satırı keser ve bunu HATA olarak bildirmez; tek `.limit(20000)`
// sessizce 1000 satırda kalabilir. Prod'daki ayar repo'dan doğrulanamadığı için
// güvenli taraf seçildi: 1000'lik sayfalarla okunur; ofset OKUNAN satır kadar
// ilerler, döngü yalnız BOŞ sayfada biter (sunucu sayfayı daha küçük kesse de eksik
// kalmaz — W2 inceleme B08-F1); TELEMETRY_MAX_ROWS'ta durup truncated denir.
// TAVAN YÖNÜ (W2 inceleme B08-F2): sıra created_at ↑ olduğu için tavana dayanınca en
// YENİ satırlar düşer. Bu yüzden hata kodlarının 24 saatlik sütunu KENDİ sorgusuyla
// okunur (7 günlük küme kesilse de son 24 saat eksiksiz), tablo önce 24s'e göre
// sıralanır ve gecikme tablosu kesildiğinde "p50/p95 YAKLAŞIK" der (alt sınır değil).
//
// GİZLİLİK: yalnız user_hash (sha256 önek) ayrık sayılır; dışarı hiçbir kimlik
// verilmez. Dönen yapıda user_hash YOK.
import "server-only";

import { createServiceSupabase } from "@/lib/supabase/server";
import { TELEMETRY_REJECTED_TYPE } from "@/lib/telemetry-types";

// ── Sabitler ───────────────────────────────────────────────────────────────

/** PostgREST varsayılan max-rows ile aynı; daha büyük sayfa sessizce kesilirdi. */
export const TELEMETRY_PAGE_SIZE = 1000;
/** Bölüm başına en fazla okunacak sayfa (20 × 1000 = 20.000 satır). */
export const TELEMETRY_MAX_PAGES = 20;
/** Bölüm başına satır tavanı (W2 inceleme B08-F1): tavan SATIR sayısıyla tutulur —
 *  prod "Max rows" 1000'den küçükse sayfa sayısı değil okunan satır belirleyicidir. */
export const TELEMETRY_MAX_ROWS = TELEMETRY_PAGE_SIZE * TELEMETRY_MAX_PAGES;
/** İstek tavanı: sunucu sayfayı çok küçük kesse bile (ör. 250) döngü sınırlı kalır;
 *  ulaşılırsa truncated=true ("≥"). */
export const TELEMETRY_MAX_REQUESTS = TELEMETRY_MAX_PAGES * 4;
/** Bölüm başına TOPLAM süre sınırı (tüm sayfalar dahil). Panel bir tanı aracı;
 *  asılı kalan bir sorgu yüzünden admin sayfası beklemesin. */
const SECTION_TIMEOUT_MS = 8000;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Kartın başlıklarında kullanılan pencereler (tek kaynak). */
export const TELEMETRY_WINDOWS = {
  errorsShortHours: 24,
  errorsLongDays: 7,
  latencyHours: 24,
  funnelDays: 7,
  watchingMinutes: 60,
  rejectedDays: 7,
} as const;

// ── Tipler ─────────────────────────────────────────────────────────────────

/** Ham satır — yalnız kartın okuduğu kolonlar (hepsi opsiyonel: seçime göre). */
export type TelemetryDbRow = {
  user_hash?: string | null;
  type?: string | null;
  value?: number | string | null;
  count?: number | string | null;
  code?: string | null;
  route?: string | null;
  app_version?: string | null;
  created_at?: string | null;
};

/** null = ölçülemedi ("bilinmiyor"); truncated = satır tavanına dayanıldı ("≥"). */
export type TelemetrySection<T> = { data: T; truncated: boolean } | null;

export type ErrorCodeRow = {
  code: string;
  /** null = istemci sürüm göndermedi (bugünkü desktop hiç göndermiyor — A042). */
  appVersion: string | null;
  /** Son 24 saat sum(count). */
  hitsShort: number;
  /** Son 7 gün sum(count). */
  hitsLong: number;
};

export type LatencyRow = { route: string; n: number; p50: number; p95: number };

export type FunnelCounts = { appOpen: number; loginOk: number; watchStarted: number };

export type RejectionRow = { reason: string; type: string; hits: number };

export type TelemetrySummary = {
  generatedAt: string;
  errors: TelemetrySection<ErrorCodeRow[]>;
  latency: TelemetrySection<LatencyRow[]>;
  funnel: TelemetrySection<FunnelCounts>;
  watching: TelemetrySection<number>;
  rejected: TelemetrySection<RejectionRow[]>;
};

// ── Saf yardımcılar (scripts/test-telemetry-route.ts birim testli) ──────────

/** int/double kolonları PostgREST'ten string de gelebilir — güvenli sayı. */
function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return Number.NaN;
}

/**
 * Postgres `percentile_cont(p) within group (order by value)` ile AYNI tanım:
 * sıralı dizide konum = p·(n−1), alt ve üst komşu arasında doğrusal
 * enterpolasyon. Boş dizide null (SQL'de de NULL).
 */
export function percentileCont(sortedAsc: readonly number[], p: number): number | null {
  const n = sortedAsc.length;
  if (n === 0) return null;
  const pos = Math.min(Math.max(p, 0), 1) * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (pos - lo);
}

function cmpStr(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * error_code_count satırlarını kod × sürüm bazında toplar. SQL `sum(count)`
 * gibi: count NULL/geçersizse 0 sayılır (satır sayısı DEĞİL, olay adedi).
 * `shortSinceMs`ten yeni satırlar ayrıca kısa pencereye yazılır.
 */
export function aggregateErrorCodes(
  rows: readonly TelemetryDbRow[],
  shortSinceMs: number,
  /** Verilirse kısa pencere (24s) BU satırlardan sayılır (ayrı sorgu — W2 inceleme
   *  B08-F2: 7 günlük küme tavanda kesilince en yeni satırlar düşüyordu). */
  shortRows?: readonly TelemetryDbRow[],
): ErrorCodeRow[] {
  const acc = new Map<string, ErrorCodeRow>();
  const rowFor = (r: TelemetryDbRow): { row: ErrorCodeRow; hits: number; t: number } => {
    const code = typeof r.code === "string" && r.code.length > 0 ? r.code : "(kodsuz)";
    const appVersion = typeof r.app_version === "string" && r.app_version.length > 0 ? r.app_version : null;
    const key = `${code}\u0000${appVersion ?? ""}`;
    const c = toNum(r.count);
    let row = acc.get(key);
    if (!row) {
      row = { code, appVersion, hitsShort: 0, hitsLong: 0 };
      acc.set(key, row);
    }
    return { row, hits: Number.isFinite(c) ? c : 0, t: r.created_at ? Date.parse(r.created_at) : Number.NaN };
  };
  for (const r of rows) {
    const { row, hits, t } = rowFor(r);
    row.hitsLong += hits;
    if (!shortRows && Number.isFinite(t) && t >= shortSinceMs) row.hitsShort += hits;
  }
  if (shortRows) {
    for (const r of shortRows) {
      const { row, hits, t } = rowFor(r);
      if (Number.isFinite(t) && t >= shortSinceMs) row.hitsShort += hits;
    }
  }
  // Önce 24s (W2 inceleme B08-F2): yaşanan olay (7 günde düşük, son saatlerde yüksek kod)
  // 20 satırlık tabloda üstte görünsün; eşitlikte 7g.
  return [...acc.values()].sort(
    (a, b) =>
      b.hitsShort - a.hitsShort ||
      b.hitsLong - a.hitsLong ||
      cmpStr(a.code, b.code) ||
      cmpStr(a.appVersion ?? "", b.appVersion ?? ""),
  );
}

/** ai_call_duration_ms → route bazlı n / p50 / p95 (percentile_cont). */
export function aggregateLatency(rows: readonly TelemetryDbRow[]): LatencyRow[] {
  const byRoute = new Map<string, number[]>();
  for (const r of rows) {
    const v = toNum(r.value);
    if (!Number.isFinite(v)) continue;
    const route = typeof r.route === "string" && r.route.length > 0 ? r.route : "(yok)";
    const arr = byRoute.get(route) ?? [];
    arr.push(v);
    byRoute.set(route, arr);
  }
  const out: LatencyRow[] = [];
  for (const [route, values] of byRoute) {
    values.sort((a, b) => a - b);
    out.push({
      route,
      n: values.length,
      p50: percentileCont(values, 0.5) ?? 0,
      p95: percentileCont(values, 0.95) ?? 0,
    });
  }
  return out.sort((a, b) => b.n - a.n || cmpStr(a.route, b.route));
}

/** Satırlardaki ayrık user_hash sayısı (boş/eksik hash sayılmaz). */
export function countDistinctUsers(rows: readonly TelemetryDbRow[]): number {
  const set = new Set<string>();
  for (const r of rows) if (typeof r.user_hash === "string" && r.user_hash.length > 0) set.add(r.user_hash);
  return set.size;
}

/** Huni: her adım için AYRIK kullanıcı (aynı kullanıcı 5 kez açtıysa 1). */
export function countFunnel(rows: readonly TelemetryDbRow[]): FunnelCounts {
  const by = (type: string) => countDistinctUsers(rows.filter((r) => r.type === type));
  return { appOpen: by("app_open"), loginOk: by("login_ok"), watchStarted: by("watch_started") };
}

/**
 * `telemetry_rejected` satırları → sebep × tip toplamı. code biçimi route'un
 * yazdığı `<sebep>:<tip>` (lib/telemetry-types summarizeTelemetryRejections);
 * ilk ':' ayırıcıdır. Ayırıcısız eski/bozuk satır: sebep = code, tip = "?".
 */
export function aggregateRejections(rows: readonly TelemetryDbRow[]): RejectionRow[] {
  const acc = new Map<string, RejectionRow>();
  for (const r of rows) {
    const code = typeof r.code === "string" && r.code.length > 0 ? r.code : "?";
    const i = code.indexOf(":");
    const reason = i >= 0 ? code.slice(0, i) : code;
    const type = i >= 0 ? code.slice(i + 1) || "?" : "?";
    const c = toNum(r.count);
    const hits = Number.isFinite(c) ? c : 0;
    const key = `${reason}\u0000${type}`;
    const row = acc.get(key) ?? { reason, type, hits: 0 };
    row.hits += hits;
    acc.set(key, row);
  }
  return [...acc.values()].sort(
    (a, b) => b.hits - a.hits || cmpStr(a.reason, b.reason) || cmpStr(a.type, b.type),
  );
}

// ── Okuma ──────────────────────────────────────────────────────────────────

type ServiceClient = ReturnType<typeof createServiceSupabase>;

/**
 * Bir pencere + tip kümesi için satırları SAYFALI okur. Sıra created_at ↑ + id ↑:
 * okuma sırasında gelen yeni satırlar sona eklenir, önceki sayfaları kaydırmaz.
 * Hata / zaman aşımı → null (bölüm "bilinmiyor").
 *
 * W2 inceleme B08-F1 (2026-09-24): eskiden `batch.length < TELEMETRY_PAGE_SIZE` "bitti"
 * sayılıyordu ve ofset sayfa × 1000 ilerliyordu → prod "Max rows" ayarı 1000'den küçükse
 * (repo'dan doğrulanamıyor) ilk kısa sayfada `truncated:false` ile SESSİZCE eksik sayım —
 * korunmaya çalışılan hatanın aynısı. Artık ofset OKUNAN satır kadar ilerler ve döngü
 * yalnız BOŞ sayfada biter (bölüm başına fazladan tek istek); tavan satır sayısıyla.
 */
async function fetchTelemetryRows(
  svc: ServiceClient,
  types: readonly string[],
  sinceIso: string,
  columns: string,
): Promise<{ rows: TelemetryDbRow[]; truncated: boolean } | null> {
  const signal = AbortSignal.timeout(SECTION_TIMEOUT_MS);
  const rows: TelemetryDbRow[] = [];
  try {
    let from = 0;
    for (let req = 0; req < TELEMETRY_MAX_REQUESTS; req++) {
      const { data, error } = await svc
        .from("telemetry_events")
        .select(columns)
        .in("type", [...types])
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + TELEMETRY_PAGE_SIZE - 1)
        .abortSignal(signal);
      if (error) {
        console.error("[admin-telemetry] query failed:", types.join(","), error.message);
        return null;
      }
      const batch = (data ?? []) as unknown as TelemetryDbRow[];
      if (batch.length === 0) return { rows, truncated: false };
      rows.push(...batch);
      from += batch.length;
      if (rows.length >= TELEMETRY_MAX_ROWS) return { rows, truncated: true };
    }
    return { rows, truncated: true };
  } catch (err) {
    console.error("[admin-telemetry] query error:", types.join(","), (err as Error).message);
    return null;
  }
}

/**
 * Kartın tüm verisi — bölümler paralel ve birbirinden bağımsız: biri düşerse
 * yalnız o "bilinmiyor" olur. `nowMs` testte sabitlenir.
 */
export async function getTelemetrySummary(nowMs: number = Date.now()): Promise<TelemetrySummary> {
  const svc = createServiceSupabase();
  const iso = (msAgo: number) => new Date(nowMs - msAgo).toISOString();
  const W = TELEMETRY_WINDOWS;

  const [errs, errsShort, lat, fun, watch, rej] = await Promise.all([
    fetchTelemetryRows(svc, ["error_code_count"], iso(W.errorsLongDays * DAY_MS), "code, count, app_version, created_at"),
    // 24s sütunu kendi sorgusundan (W2 inceleme B08-F2) — 7 günlük küme tavanda kesilse
    // de son 24 saat eksiksiz kalır.
    fetchTelemetryRows(svc, ["error_code_count"], iso(W.errorsShortHours * HOUR_MS), "code, count, app_version, created_at"),
    fetchTelemetryRows(svc, ["ai_call_duration_ms"], iso(W.latencyHours * HOUR_MS), "route, value"),
    fetchTelemetryRows(svc, ["app_open", "login_ok", "watch_started"], iso(W.funnelDays * DAY_MS), "type, user_hash"),
    fetchTelemetryRows(svc, ["watch_health"], iso(W.watchingMinutes * 60 * 1000), "user_hash"),
    fetchTelemetryRows(svc, [TELEMETRY_REJECTED_TYPE], iso(W.rejectedDays * DAY_MS), "code, count"),
  ]);

  return {
    generatedAt: new Date(nowMs).toISOString(),
    errors: errs && errsShort
      ? {
        data: aggregateErrorCodes(errs.rows, nowMs - W.errorsShortHours * HOUR_MS, errsShort.rows),
        truncated: errs.truncated || errsShort.truncated,
      }
      : null,
    latency: lat ? { data: aggregateLatency(lat.rows), truncated: lat.truncated } : null,
    funnel: fun ? { data: countFunnel(fun.rows), truncated: fun.truncated } : null,
    watching: watch ? { data: countDistinctUsers(watch.rows), truncated: watch.truncated } : null,
    rejected: rej ? { data: aggregateRejections(rej.rows), truncated: rej.truncated } : null,
  };
}
