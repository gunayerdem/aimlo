/**
 * Shared telemetry types — desktop client and `/api/telemetry` route both
 * import from here so the wire contract stays in one place.
 *
 * Privacy stance: the route never persists raw `userId`. It hashes (sha256
 * → first 16 hex chars) before any logging or downstream forwarding. PII
 * (email, username, IP) is never accepted here — only durations, counts,
 * and bounded enums.
 */

export type TelemetryEventType =
  /** Wall-clock between round-end detection and feedback delivery to UI. */
  | "round_end_latency_ms"
  /** Single AI route round-trip latency. */
  | "ai_call_duration_ms"
  /** Aggregated count of a specific OverlayError code over the batch window. */
  | "error_code_count"
  /** Per-frame OCR pipeline budget (M23 instrumentation). */
  | "ocr_frame_budget_ms"
  /** Lifecycle counter — match completed end-to-end. */
  | "match_completed"
  /**
   * Canlı-test #14 (2026-09-01): dakikalık izleme-sağlığı nabzı — Kaan'ın
   * kayıp-log gecesinde kör-pencere/OCR-isabet/basınç ayrımı yapılamadı;
   * bu event tek başına o teşhisi keser. Alan paketlemesi (şema değişmeden):
   *   value = işlenen tick sayısı (dakika içinde)
   *   count = atlanan tick sayısı (nofocus + wgc-noframe + diğer)
   *   round = ROUND_COUNT anlık değeri
   *   code  = kompakt PII'siz durum dizesi ≤64ch, örn.
   *           "wgc b3/1 s12+0 p0 6-5" → capture-kaynak, banner cand/confirm,
   *           skor ok+red, basınç-sn, committed skor. Desktop telemetry.rs
   *           CANONICAL_KIND_LIST ile SENKRON (CLAUDE.md sözleşmesi).
   */
  | "watch_health"
  /**
   * B15 huni sayaçları (2026-09-16 · launch denetimi): desktop bu üç olayı
   * 31.07.2026'dan beri GÖNDERİYOR (telemetry.rs CANONICAL_KIND_LIST +
   * record_app_open/record_login_ok/record_watch_started) ama backend
   * VALID_TYPES'ta yoktular → route her birini `invalid_type` ile reddedip
   * 200 döndüğü için 6+ haftadır SESSİZCE kayboluyorlardı. Kanıt: desktop
   * telemetry.rs:453-457 yorumu bunu zaten belgeliyor; prod telemetry_events
   * tablosunda bu üç tipten TEK satır yok (02.09-16.09 sorgusu).
   * Neyi açar: "kurdu → açtı → giriş yaptı → İzle'ye bastı → maç gördü"
   * hunisi. 14514/vaporeon sınıfı (açtı, 0 maç) vakalar ancak bununla görünür.
   * Paket: yalnız `count: 1` (record_counter) — value/code/route/round yok.
   */
  | "app_open"
  | "login_ok"
  | "watch_started"
  /**
   * B08 (2026-09-24 · A026): izleme DURDU + sebebi. WATCHING'i kapatan beş yol
   * (maç sonu, kullanıcı durdurdu, oturum temizlendi, token süresi doldu,
   * uygulama kapandı) bugüne kadar yalnız yerel tracing yazıyordu; sunucudan
   * "sessiz kullanıcı durdurdu mu, oturumu mu düştü" ayrımı yapılamıyordu.
   * Paket: `code` ZORUNLU = sebep ("match_end" | "user_stop" | "auth_clear" |
   * "auth_expired" | "app_exit"), `count: 1`, `round` opsiyonel.
   * SIRA (A006 dersi): backend ÖNCE deploy edilir, desktop (D20) SONRA gönderir;
   * aksi hâlde olay `invalid_type` ile sessizce düşer.
   */
  | "watch_stopped"
  /**
   * B08 (2026-09-24 · A014/A024/A042): oturum başına BİR kez kompakt, PII'siz rig
   * dizesi (Windows build, OCR tanıma dili, yakalama yolu, çerçeve kararı…).
   * `code` ZORUNLU, ≤64 char (genel code kapısı). Hostname / kullanıcı adı /
   * GPU model adı / dosya yolu ASLA taşımaz.
   * KVKK kararı (decisions A024/A030 applied): gizlilik metni DEĞİŞMEDİ ve desktop
   * bu olayı GÖNDERMİYOR (D20'de RIG_PROFILE_ENABLED=false). Tipin kabul edilmesi
   * zararsızdır; metin onaylanıp bayrak açılınca veri kaybolmadan akar.
   */
  | "rig_profile";

/**
 * B08 (2026-09-24 · A006/A064): SUNUCUNUN KENDİ yazdığı özet satır tipi — route,
 * reddettiği olayları `telemetry_events`e `type = "telemetry_rejected"`,
 * `code = "<sebep>:<gelen tip>"`, `count = adet` olarak yazar. Bilerek
 * `VALID_TYPES` DIŞINDA: istemci bu tipte olay gönderirse kendisi
 * `invalid_type` ile reddedilir (sahtelenemez), admin kartı yalnız sunucunun
 * yazdığı satırları görür.
 */
export const TELEMETRY_REJECTED_TYPE = "telemetry_rejected";

/**
 * Reddedilen olay özetinde bir batch'ten yazılacak EN FAZLA ayrık
 * `<sebep>:<tip>` satırı. Kötü niyetli istemci 100 farklı sahte tip yollasa bile
 * satır şişmesi sınırlı kalır; artan çiftler tek `_overflow:*` satırında toplanır
 * (adet kaybolmaz).
 */
export const TELEMETRY_REJECT_MAX_ROWS = 10;

export interface TelemetryEvent {
  /** Discriminator. */
  type: TelemetryEventType;
  /** Unix epoch ms. Must be within ±30 days of server time. */
  ts: number;
  /** Numeric measurement for `*_ms` types. Required there, ignored otherwise. */
  value?: number;
  /** Bucket count for `error_code_count` (≥1). */
  count?: number;
  /**
   * Error code (matches OverlayError discriminants). B08: `watch_stopped`'ta
   * durma sebebi, `rig_profile`'da kompakt rig dizesi — ikisinde de ZORUNLU.
   */
  code?: string;
  /** Route name for `ai_call_duration_ms` — `"vision"` | `"report"` | `"match-report"` | `"feedback"` | `"insight"`. */
  route?: string;
  /** Optional round number context. */
  round?: number;
  /**
   * B80 (2026-07-31): masaüstü sürümü (örn. "1.0.19"). Rust tarafında kaynak
   * `app.package_info().version` (= tauri.conf.json "version"). B08 düzeltmesi
   * (A014/A030): `env!("CARGO_PKG_VERSION")` KULLANILMAZ — Cargo.toml
   * "1.0.0-beta.1"de donmuş durumda, ürün sürümü yalnız tauri.conf.json'da
   * (release-desktop.ps1 de oradan okur). Auto-updater canlı olduğu için
   * "hata yeni sürümden mi geliyor, kaç kullanıcı hâlâ eskide" sorusu her
   * sürümde doğuyor; sürüm alanı olmadan error_code_count artışı bir
   * sürüme bağlanamıyordu.
   *
   * OPSİYONEL ve additive: mevcut desktop (v1.0.7) bu alanı GÖNDERMİYOR —
   * alan yoksa event aynen kabul edilir, sözleşme bozulmaz. Ucuz yol
   * `TelemetryRequest.appVersion` (batch zarfı); event-seviyesi öncelikli.
   */
  appVersion?: string;
}

export interface TelemetryRequest {
  events: TelemetryEvent[];
  /**
   * B80 (2026-07-31): batch-zarfı sürüm alanı — tek alan, tek doğrulama.
   * Event'inde `appVersion` olmayan her olay bunu devralır.
   */
  appVersion?: string;
}

export interface TelemetryRejection {
  idx: number;
  reason: string;
}

export interface TelemetryResponse {
  ok: true;
  accepted: number;
  rejected?: TelemetryRejection[];
}

/** Hard caps enforced server-side. */
export const TELEMETRY_LIMITS = {
  /** Maximum events per request. */
  maxEventsPerBatch: 100,
  /** ts must be within this window of server now() — both directions. */
  maxTsDriftMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  /** Maximum value for any *_ms field. Protects against integer overflow + nonsense data. */
  maxValueMs: 10 * 60 * 1000, // 10 minutes
  /** Maximum count value. */
  maxCount: 100_000,
  /**
   * FB04 · F87: `error_code_count` için count tavanı. Masaüstü HER hata oluşumunu ayrı
   * olay olarak `count: 1` ile gönderir (aimlo-desktop telemetry.rs record_error → :330
   * `count: Some(1)`; v1.0.19'da :194 aynı) — istemci tarafında toplama yok. Eski 100.000
   * tavanı tek bir sahte olayla kartın sum(count)'unu 100 milyona şişirmeye izin veriyordu.
   * 1000 meşru toplu gönderime bol pay bırakır. Diğer tiplerin count'u (watch_health'te
   * atlanan tick) genel maxCount'a tabi kalır.
   */
  maxErrorCodeCount: 1000,
  /** Maximum length of code/route fields (anti-payload-bloat). */
  maxStringLen: 64,
} as const;

/**
 * FB04 · F87: `route` ve `appVersion` karakter kümesi — kimlik benzeri kısa diziler
 * (gerçek değerler: "vision", "match-report", "1.0.19", "1.0.0-beta.1"). U+202E (RLO),
 * sıfır-genişlik, kontrol karakteri ve boşluk REDDEDİLİR (admin panelinde görüntü aldatması,
 * log bozma). Uzunluk kuralı (1..64) regex'in içinde.
 */
export const TELEMETRY_ID_RE = /^[A-Za-z0-9_.:\/-]{1,64}$/;

/**
 * FB04 inceleme · F87 (low): `appVersion` kümesi = TELEMETRY_ID_RE + "+" (semver derleme üst
 * verisi, "1.0.21+hotfix1"). KANIT: masaüstü telemetry.rs looks_like_version [A-Za-z0-9.+-] kabul
 * ediyor; eski küme "+" içeren sürümün diskten geri yüklenen HER olayını app_version_invalid ile
 * düşürüp zarf sürümünü sessizce null yapardı. "+" ASCII, görüntü aldatması/log bozma riski yok.
 */
export const TELEMETRY_VERSION_RE = /^[A-Za-z0-9_.:+\/-]{1,64}$/;

/**
 * FB04 · F87: `code` karakter kümesi — YAZDIRILABİLİR ASCII (U+0020..U+007E), 1..64.
 * Planın önerdiği TELEMETRY_ID_RE `code`a UYGULANMADI, çünkü GERÇEK veride ölçülen
 * yanlış-pozitif %100'dü: watch_health `code`u boşluk ve "+" taşır ("wgc b0/0 s0+0 p0 ?-?",
 * aimlo-desktop lib.rs watch_health_code; runtime loglarındaki 31/31 [HEARTBEAT] kodunun
 * 31'i reddedilirdi, bu kümeyle 0), rig_profile boşluk ve "@" taşır ("w26100 wgc1 … 1920x1080@100"),
 * error_code_count da sunucunun serbest metin hata gövdesini küçük harfle taşıyabilir
 * ("invalid json body"). Bu küme de U+202E / sıfır-genişlik / kontrol karakteri / ASCII
 * dışı her şeyi reddeder — amaç (panelde görüntü aldatması ve log bozma) karşılanır.
 */
export const TELEMETRY_CODE_RE = /^[\x20-\x7E]{1,64}$/;

/**
 * Backend'in kabul ettiği TÜM tipler — tek kaynak. Dışa açık çünkü sözleşme
 * testi (scripts/test-api-contract.ts) her tipin bir kanonik örnek yükle
 * çivilendiğini TERS yönde de denetler (B08): yeni tip eklenip örneği
 * unutulursa test kırmızı olur.
 */
export const TELEMETRY_EVENT_TYPES: readonly TelemetryEventType[] = [
  "round_end_latency_ms",
  "ai_call_duration_ms",
  "error_code_count",
  "ocr_frame_budget_ms",
  "match_completed",
  "watch_health", // canlı-test #14 — desktop CANONICAL_KIND_LIST ile senkron
  // B15 huni sayaçları — desktop 31.07.2026'dan beri gönderiyordu, backend
  // kabul etmiyordu (launch denetimi 16.09.2026). Artık SENKRON.
  "app_open",
  "login_ok",
  "watch_started",
  // B08 (2026-09-24): backend ÖNCE — desktop D20 sonra gönderir. İkisi de code zorunlu.
  "watch_stopped",
  "rig_profile",
];

const VALID_TYPES: ReadonlySet<TelemetryEventType> = new Set<TelemetryEventType>(TELEMETRY_EVENT_TYPES);

/**
 * B80 (2026-07-31): sürüm dizesi doğrulaması — hem event-seviyesi hem
 * batch-zarfı (`TelemetryRequest.appVersion`) aynı kuralı kullansın diye
 * dışa açık. Serbest metin değil: uzunluk + tip + (FB04 · F87) karakter kümesi
 * kapısı (TELEMETRY_ID_RE), PII taşımaz.
 */
export function isValidAppVersion(v: unknown): v is string {
  return (
    typeof v === "string" &&
    v.length > 0 &&
    v.length <= TELEMETRY_LIMITS.maxStringLen &&
    TELEMETRY_VERSION_RE.test(v)
  );
}

/**
 * Per-event validation. Returns null on success, or a short reason string
 * on rejection. The route handler uses this to populate the `rejected[]`
 * array — partial-success semantics, never reject the whole batch for one
 * bad event.
 */
export function validateTelemetryEvent(
  event: unknown,
  serverNowMs: number,
): string | null {
  if (!event || typeof event !== "object") return "not_an_object";
  const e = event as Record<string, unknown>;

  if (typeof e.type !== "string" || !VALID_TYPES.has(e.type as TelemetryEventType)) {
    return "invalid_type";
  }
  if (typeof e.ts !== "number" || !Number.isFinite(e.ts)) {
    return "invalid_ts";
  }
  const drift = Math.abs(serverNowMs - e.ts);
  if (drift > TELEMETRY_LIMITS.maxTsDriftMs) {
    return "ts_out_of_window";
  }

  if (e.value !== undefined) {
    if (typeof e.value !== "number" || !Number.isFinite(e.value) || e.value < 0) {
      return "value_invalid";
    }
    if (e.value > TELEMETRY_LIMITS.maxValueMs) {
      return "value_too_large";
    }
  }
  if (e.count !== undefined) {
    if (typeof e.count !== "number" || !Number.isFinite(e.count) || e.count < 0) {
      return "count_invalid";
    }
    if (e.count > TELEMETRY_LIMITS.maxCount) {
      return "count_too_large";
    }
    // FB04 · F87: error_code_count masaüstünde her zaman 1 — tek olayla kartı şişirme kapısı.
    if (e.type === "error_code_count" && e.count > TELEMETRY_LIMITS.maxErrorCodeCount) {
      return "count_too_large";
    }
  }
  if (e.code !== undefined) {
    // FB04 · F87: uzunluk (1..64) + yazdırılabilir ASCII (TELEMETRY_CODE_RE) — U+202E vb. red.
    if (typeof e.code !== "string" || !TELEMETRY_CODE_RE.test(e.code)) {
      return "code_invalid";
    }
  }
  if (e.route !== undefined) {
    // FB04 · F87: uzunluk (1..64) + kimlik karakter kümesi (TELEMETRY_ID_RE).
    if (typeof e.route !== "string" || !TELEMETRY_ID_RE.test(e.route)) {
      return "route_invalid";
    }
  }
  if (e.round !== undefined) {
    if (typeof e.round !== "number" || !Number.isFinite(e.round) || e.round < 0 || e.round > 1000) {
      return "round_invalid";
    }
  }
  // B80 (2026-07-31): sürüm alanı — code/route ile aynı sınır (≤64 char),
  // aynı anti-bloat gerekçesi. Opsiyonel: yoksa event geçerli kalır.
  if (e.appVersion !== undefined && !isValidAppVersion(e.appVersion)) {
    return "app_version_invalid";
  }

  // Type-specific shape rules.
  switch (e.type as TelemetryEventType) {
    case "round_end_latency_ms":
    case "ai_call_duration_ms":
    case "ocr_frame_budget_ms":
      if (typeof e.value !== "number") return "value_required";
      break;
    case "error_code_count":
      if (typeof e.code !== "string") return "code_required";
      if (typeof e.count !== "number") return "count_required";
      break;
    case "match_completed":
      // No required value — pure counter event.
      break;
    case "app_open":
    case "login_ok":
    case "watch_started":
      // Saf sayaç (desktop record_counter → yalnız count:1). Zorunlu alan yok;
      // count gelirse yukarıdaki genel count kapısı zaten doğruladı.
      break;
    case "watch_health":
      // value (işlenen tick) zorunlu; count/code/round opsiyonel paket alanları.
      if (typeof e.value !== "number") return "value_required";
      break;
    case "watch_stopped":
    case "rig_profile":
      // B08: sebep / rig dizesi olayın TEK taşıdığı bilgi — code'suz olay
      // değersizdir, kabul edilmez (uzunluk kapısı yukarıda: ≤64).
      if (typeof e.code !== "string") return "code_required";
      break;
  }

  return null;
}

/**
 * B08 (2026-09-24 · A006/A064): reddedilen olayın `type` alanının log/DB için
 * GÜVENLİ etiketi. Dize değilse (ya da boşsa) "?". Dizeyse [A-Za-z0-9_.-] dışı
 * her karakter "_" olur ve 64'te kesilir: istemci kontrolündeki metin log'a /
 * tabloya ham girmez (log-forging, PII taşıma). Gerçek kind adları snake_case
 * ASCII olduğundan teşhis bilgisi kaybolmaz.
 */
export function rejectedTypeLabel(event: unknown): string {
  if (!event || typeof event !== "object") return "?";
  const t = (event as Record<string, unknown>).type;
  if (typeof t !== "string" || t.length === 0) return "?";
  return t.slice(0, TELEMETRY_LIMITS.maxStringLen).replace(/[^A-Za-z0-9_.-]/g, "_");
}

export interface TelemetryRejectionSummary {
  /** Red sebebi → adet (örn. { invalid_type: 2 }). */
  reasons: Record<string, number>;
  /** Reddedilen olayın (güvenli) tip etiketi → adet (örn. { app_open: 1 }). */
  types: Record<string, number>;
  /**
   * Kalıcı iz satırları: `code = "<sebep>:<tip>"` (≤64), `count` = adet.
   * En fazla TELEMETRY_REJECT_MAX_ROWS ayrık çift; artanlar tek
   * `_overflow:*` satırında toplanır. Sıra: adet azalan, eşitlikte kod.
   */
  rows: { code: string; count: number }[];
}

/**
 * B08 (2026-09-24 · A006/A064): reddedilen olayları sebep ve tip bazında toplar.
 * KÖK: route kısmi başarıda 200 dönüyor ve yalnız red SAYISINI logluyordu;
 * 31.07→16.09 arası app_open/login_ok/watch_started `invalid_type` ile
 * düşerken ne sebep ne tip hiçbir yerde görünmedi. Saf fonksiyon: route hem
 * `[TELEMETRY_REJECTED]` log satırını hem de `telemetry_rejected` satırlarını
 * buradan üretir.
 */
export function summarizeTelemetryRejections(
  events: readonly unknown[],
  rejected: readonly TelemetryRejection[],
): TelemetryRejectionSummary {
  // Prototipsiz sayaçlar (W2 inceleme B08-F3, 2026-09-24): `{}` ile istemci tipi
  // "constructor"/"toString" sayacı Object.prototype fonksiyonundan başlatıyordu → log
  // satırında `"constructor":"function Object() { [native code] }1"`; "__proto__" tipi
  // log'dan SESSİZCE düşüyordu. Object.create(null) ile her anahtar sıradan own-property
  // (JSON.stringify aynı biçimde basar); DB satırları zaten Map'ten üretiliyordu.
  const reasons: Record<string, number> = Object.create(null);
  const types: Record<string, number> = Object.create(null);
  const pairs = new Map<string, number>();
  for (const r of rejected) {
    const type = rejectedTypeLabel(events[r.idx]);
    reasons[r.reason] = (reasons[r.reason] ?? 0) + 1;
    types[type] = (types[type] ?? 0) + 1;
    const code = `${r.reason}:${type}`.slice(0, TELEMETRY_LIMITS.maxStringLen);
    pairs.set(code, (pairs.get(code) ?? 0) + 1);
  }
  const sorted = [...pairs.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
  let rows = sorted;
  if (sorted.length > TELEMETRY_REJECT_MAX_ROWS) {
    const kept = sorted.slice(0, TELEMETRY_REJECT_MAX_ROWS);
    const rest = sorted.slice(TELEMETRY_REJECT_MAX_ROWS).reduce((n, r) => n + r.count, 0);
    rows = [...kept, { code: "_overflow:*", count: rest }];
  }
  return { reasons, types, rows };
}
