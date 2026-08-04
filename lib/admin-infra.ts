// Altyapı paneli — veri katmanı (server-only). (altyapı paneli, 2026-08-04)
//
// NEDEN VAR: 2026-08-04'te `vercel env rm X preview` komutu scope argümanını yok
// sayıp 6 değişkeni Production dâhil TÜMDEN sildi. Canlı site etkilenmedi (env
// değişikliği çalışan deployment'a işlemez) ama UPSTASH_REDIS_REST_URL/TOKEN
// yalnız Vercel'de yaşadığı için geri konamadı → bir sonraki deploy'da
// rate-limit prod'da FAIL-CLOSED olduğu için TÜM AI route'ları 503'e düşecekti.
// Bunu deploy'dan ÖNCE gösteren hiçbir yüzey yoktu. Bu modül o boşluğu kapatır:
// "hangi kritik env eksik" + "dış servisler ayakta mı" tek çağrıda.
//
// 🔴 SIR POLİTİKASI — TARTIŞMASIZ:
// Bu modül HİÇBİR sır DEĞERİ döndürmez. Ne tam değer, ne ilk/son karakter, ne
// uzunluk, ne hash. Yalnız boolean "tanımlı mı". Sebep: bir admin oturumu ele
// geçirilse bile buradan tek bir sır sızmasın. Bu bir sır-KURTARMA aracı değil,
// bir VARLIK göstergesidir. `envs[]` üzerinde bilerek `value` alanı YOKTUR —
// istisna açılırsa kural erir, o yüzden hiç açılmıyor (sır olmayan bayraklar
// ayrı `flags` alanında, yalnız açık/kapalı olarak).
//
// MALİYET: hiçbir kontrol para yakmaz. OpenAI'a gerçek completion atılmaz;
// yalnız ücretsiz metadata uçları (GET /v1/models) çağrılır.
//
// DAYANIKLILIK: hepsi paralel, her biri ≤3 sn timeout, hata YUTULUR ve
// "unknown" olur. Sayfa asla patlamaz. SAHTE VERİ YOK: bir kontrol
// yapılamadıysa "unknown" döner — asla "ok" uydurulmaz.
import "server-only";

import { createServiceSupabase } from "@/lib/supabase/server";

// ── Sabitler ───────────────────────────────────────────────────────────────

/** Her dış kontrol için üst sınır. Panel bir tanı aracıdır; asılı kalan bir
 *  servis yüzünden admin sayfası beklemesin. */
const CHECK_TIMEOUT_MS = 3000;

/**
 * Supabase Storage public taban URL'i — app/download/route.ts:10 ile BİREBİR
 * aynı literal. NEDEN env'den türetmiyoruz: panelin ölçmesi gereken şey
 * "kullanıcının indirdiği URL"dir. Env'den türetseydik env yanlış olduğunda
 * panel BAŞKA bir hedefi ölçer ve "iyi" derdi — tam da kaçınmak istediğimiz
 * yanlış güven. Proje ref'i zaten publictir (NEXT_PUBLIC_SUPABASE_URL ile
 * tarayıcıya gidiyor), sır değildir.
 */
const SUPABASE_STORAGE_BASE = "https://bzwnchzetebwrdedkjkq.supabase.co/storage/v1/object/public/";
const LATEST_JSON_URL = `${SUPABASE_STORAGE_BASE}releases/latest.json`;

/** NEXT_PUBLIC_SUPABASE_URL okunamazsa konsol linki için düşülecek proje ref'i. */
const FALLBACK_PROJECT_REF = "bzwnchzetebwrdedkjkq";

// ── Tipler ─────────────────────────────────────────────────────────────────

/** "unknown" = kontrol EDİLEMEDİ (ağ/timeout/beklenmeyen yanıt). Asla "iyi"
 *  anlamına gelmez — panelde de öyle gösterilmeli. */
export type HealthStatus = "ok" | "fail" | "unknown";

export type ServiceKey = "supabase" | "upstash" | "releases" | "openai" | "resend";

export type ServiceHealth = {
  key: ServiceKey;
  label: string;
  status: HealthStatus;
  /** Yalnız kontrol gerçekten koştuysa dolu (ms). */
  latencyMs?: number;
  /** Türkçe tek cümle: ne ölçtük / neden bilinmiyor / ne bozulur. */
  note?: string;
  /** Yalnız `releases`: kullanıcıların gördüğü sürüm (latest.json → version). */
  version?: string;
};

export type EnvCheck = {
  key: string;
  /** SADECE varlık. Değer, uzunluk, hash — hiçbiri yok, hiç olmayacak. */
  present: boolean;
  /** true = yoksa canlı akış bozulur (fallback'i yok). */
  critical: boolean;
  /** Türkçe tek cümle: "yoksa NE bozulur". Bugünkü olayın dersi. */
  purpose: string;
};

export type DeployInfo = {
  /** Vercel sistem env'leri erişilebilir mi (proje ayarındaki kutu açık mı). */
  onVercel: boolean;
  commitSha: string | null;
  /** 7 karakterlik kısa sha — panelde gösterilecek olan. */
  commitShort: string | null;
  branch: string | null;
  /** VERCEL_ENV: production | preview | development. */
  env: string | null;
  /** VERCEL_TARGET_ENV: sistem veya özel ortam adı. */
  targetEnv: string | null;
  /** VERCEL_REGION — Vercel dokümanına göre YALNIZ runtime'da var (build'de yok). */
  region: string | null;
  deploymentId: string | null;
};

export type InfraLink = {
  label: string;
  url: string;
  note: string;
};

export type InfraStatus = {
  /** ISO — panel "ne zaman ölçüldü" diyebilsin (cache yanılsaması olmasın). */
  checkedAt: string;
  services: ServiceHealth[];
  envs: EnvCheck[];
  /** Eksik KRİTİK env adları — bugünkü olayın tek-bakışta göstergesi. */
  missingCritical: string[];
  /** Sır OLMAYAN çalışma-zamanı bayrakları (yalnız açık/kapalı). */
  flags: { freeTierEnforced: boolean; strictRateLimit: boolean; billingConfigured: boolean };
  deploy: DeployInfo;
  links: InfraLink[];
};

// ── Yardımcılar ────────────────────────────────────────────────────────────

/**
 * Env okuma tablosu — erişimler bilerek STATİK (`process.env.X`).
 * NEDEN: Next `process.env[degisken]` biçimindeki DİNAMİK erişimi derleme
 * sırasında yerine koyamaz. Dinamik okusaydık, tanımlı bir değişken bile
 * "yok" görünebilirdi → panel YANLIŞ ALARM verirdi. Yanlış alarm, gerçek
 * alarmı körelttiği için burada sessiz hata kadar tehlikelidir.
 * Yeni bir env eklenirse HEM buraya HEM ENV_SPEC'e satır eklenmeli.
 */
const ENV_SNAPSHOT: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  OTP_HMAC_SECRET: process.env.OTP_HMAC_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SUPPORT_NOTIFY_TO: process.env.SUPPORT_NOTIFY_TO,
  FREE_TIER_ENFORCED: process.env.FREE_TIER_ENFORCED,
  PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRICT_RATE_LIMIT: process.env.STRICT_RATE_LIMIT,
};

/** Yalnız VARLIK. Boş/boşluk string'i "yok" sayılır (Vercel'de boş değer
 *  bırakmak yaygın bir hata ve sessizce "var" görünmemeli). Değer DÖNMEZ. */
function has(name: string): boolean {
  const v = ENV_SNAPSHOT[name];
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Build sırasında dış çağrı YASAK (emsal: hiçbir sayfa build'de ağ vurmamalı;
 * panel sayfası dynamic olacak). Bu, sayfa yanlışlıkla statikleşirse devreye
 * giren ikinci savunma katmanı — böyle bir durumda ölçüm yapmayız ve dürüstçe
 * "unknown" deriz. NEXT_PHASE'i Next build sürecinin kendisi set eder
 * (next/dist/build/index.js → PHASE_PRODUCTION_BUILD).
 */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** AbortController + temizlik (emsal: lib/api-auth.ts, app/download/route.ts). */
async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), CHECK_TIMEOUT_MS);
  try {
    return await fn(ctrl.signal);
  } finally {
    clearTimeout(tid);
  }
}

/**
 * Yanıt gövdesini OKUMADAN kapat. NEDEN: (1) gövdeyi hiç tutmuyoruz — sır ya da
 * hesap verisi belleğe/log'a düşmesin; (2) undici'de tüketilmeyen gövde soket
 * sızdırır. Model listesi / domain listesi bize lazım değil, yalnız durum kodu.
 */
function discardBody(res: Response): void {
  try {
    void res.body?.cancel();
  } catch {
    /* yut — kontrol akışını asla etkilemez */
  }
}

/** latest.json'dan gelen sürümü panele koymadan önce daralt: dış kaynaklı bir
 *  string'i olduğu gibi taşımayalım (React kaçışlıyor ama tipi de biz garanti
 *  edelim). Beklenen biçim: 1.0.7 / 1.0.7-beta.1 */
function sanitizeVersion(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return /^[\w.+-]{1,32}$/.test(t) ? t : undefined;
}

/** Konsol linki için proje ref'i. NEXT_PUBLIC_* = zaten public, sır değil. */
function supabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      const m = /^([a-z0-9-]+)\.supabase\.(co|in)$/i.exec(new URL(url).hostname);
      if (m) return m[1];
    } catch {
      /* bozuk URL → sabite düş */
    }
  }
  return FALLBACK_PROJECT_REF;
}

// ── A) Servis sağlığı ──────────────────────────────────────────────────────

/** Supabase: service-role ile EN UCUZ sorgu — tek satır, sayım yok, PII yok.
 *  `admins` tablosu küçük ve zaten admin gate'i tarafından okunuyor. Bu tek
 *  sorgu üç şeyi birden kanıtlar: DB ayakta + service-role anahtarı geçerli +
 *  RLS-bypass yolu çalışıyor. */
async function checkSupabase(): Promise<ServiceHealth> {
  const base: ServiceHealth = { key: "supabase", label: "Supabase (DB)", status: "unknown" };
  const t0 = Date.now();
  try {
    const svc = createServiceSupabase(); // anahtar yoksa burada throw eder
    // NOT: PostgREST builder'ı gerçek Promise değil PromiseLike'tır — async
    // sarmalayıcı içinde await ediyoruz ki withTimeout'un Promise sözleşmesi
    // tutsun (ve zincir gerçekten burada beklensin).
    const { error } = await withTimeout(
      async (signal) => await svc.from("admins").select("user_id").limit(1).abortSignal(signal),
    );
    const latencyMs = Date.now() - t0;
    if (error) {
      return {
        ...base,
        status: "fail",
        latencyMs,
        // Hata mesajını taşımıyoruz: Postgres hataları bağlantı dizesi/şema
        // ayrıntısı sızdırabiliyor. Ayrıntı sunucu log'unda kalsın.
        note: "Sorgu reddedildi — service-role anahtarı ya da tablo erişimi bozuk.",
      };
    }
    return { ...base, status: "ok", latencyMs, note: "service-role okuma çalışıyor." };
  } catch (e) {
    const msg = (e as Error).message || "";
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return {
        ...base,
        status: "fail",
        note: "SUPABASE_SERVICE_ROLE_KEY yok — admin paneli, OTP kaydı ve rapor kaydı çalışmaz.",
      };
    }
    return { ...base, status: "unknown", note: "Ulaşılamadı (zaman aşımı/ağ) — durum bilinmiyor." };
  }
}

/**
 * Upstash — BUGÜNKÜ OLAYI TAM OLARAK YAKALAYAN KART.
 * Env yoksa "fail": prod'da rate-limit FAIL-CLOSED (lib/api-auth.ts) → tüm AI
 * route'ları 503. Yani env eksikliği "eksik yapılandırma" değil, doğrudan
 * TAM KESİNTİ demektir; panelde de öyle görünmeli.
 */
async function checkUpstash(): Promise<ServiceHealth> {
  const base: ServiceHealth = { key: "upstash", label: "Upstash Redis (rate-limit)", status: "unknown" };
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return {
      ...base,
      status: "fail",
      note: "UPSTASH_REDIS_REST_URL/TOKEN eksik → rate-limit prod'da fail-closed: tüm AI route'ları 503.",
    };
  }
  const t0 = Date.now();
  try {
    const res = await withTimeout((signal) =>
      fetch(`${url}/ping`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal,
      }),
    );
    const latencyMs = Date.now() - t0;
    discardBody(res);
    if (res.ok) return { ...base, status: "ok", latencyMs, note: "PING yanıtlandı." };
    if (res.status === 401 || res.status === 403) {
      return { ...base, status: "fail", latencyMs, note: "Token reddedildi (401/403) → rate-limit fail-closed riski." };
    }
    return { ...base, status: "unknown", latencyMs, note: `Beklenmeyen yanıt (HTTP ${res.status}).` };
  } catch {
    return { ...base, status: "unknown", note: "Ulaşılamadı (zaman aşımı/ağ) — durum bilinmiyor." };
  }
}

/** Releases: kullanıcıların GÖRDÜĞÜ latest.json. Cache-buster query eklemiyoruz
 *  (bkz. SUPABASE_STORAGE_BASE notu) — `cache: "no-store"` yalnız Next'in kendi
 *  veri cache'ini atlar, URL aynı kalır, yani CDN'in kullanıcıya servis ettiği
 *  nesnenin aynısını ölçeriz. */
async function checkReleases(): Promise<ServiceHealth> {
  const base: ServiceHealth = { key: "releases", label: "Releases (latest.json)", status: "unknown" };
  const t0 = Date.now();
  try {
    const res = await withTimeout((signal) =>
      fetch(LATEST_JSON_URL, { cache: "no-store", signal }),
    );
    const latencyMs = Date.now() - t0;
    if (!res.ok) {
      discardBody(res);
      return {
        ...base,
        status: "fail",
        latencyMs,
        note: `latest.json okunamadı (HTTP ${res.status}) → aimlo.gg/download ana sayfaya düşer.`,
      };
    }
    const j = (await res.json()) as { version?: unknown };
    const version = sanitizeVersion(j?.version);
    if (!version) {
      // Dosya var ama beklenen alan yok: "ok" DEMİYORUZ — updater bu dosyaya
      // güveniyor, biçim bozuksa bu gerçek bir sorundur.
      return { ...base, status: "unknown", latencyMs, note: "latest.json ulaşıldı ama `version` alanı okunamadı." };
    }
    return { ...base, status: "ok", latencyMs, version, note: "Kullanıcıların gördüğü sürüm." };
  } catch {
    return { ...base, status: "unknown", note: "Ulaşılamadı (zaman aşımı/ağ) — durum bilinmiyor." };
  }
}

/** OpenAI: PARA YAKMADAN anahtar doğrulama. GET /v1/models ücretsiz metadata —
 *  token harcamaz, completion üretmez. Gövde okunmaz. */
async function checkOpenAI(): Promise<ServiceHealth> {
  const base: ServiceHealth = { key: "openai", label: "OpenAI API", status: "unknown" };
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      ...base,
      status: "fail",
      note: "OPENAI_API_KEY yok → vision/report/feedback/insight/ask hepsi yapılandırma hatası döner.",
    };
  }
  const t0 = Date.now();
  try {
    const res = await withTimeout((signal) =>
      fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
        signal,
      }),
    );
    const latencyMs = Date.now() - t0;
    discardBody(res);
    if (res.ok) return { ...base, status: "ok", latencyMs, note: "Anahtar geçerli (ücretsiz metadata ucu)." };
    if (res.status === 401) return { ...base, status: "fail", latencyMs, note: "Anahtar reddedildi (401) → AI route'ları çalışmaz." };
    if (res.status === 429) return { ...base, status: "unknown", latencyMs, note: "Hız sınırı (429) — anahtar geçerli olabilir, doğrulanamadı." };
    return { ...base, status: "unknown", latencyMs, note: `Beklenmeyen yanıt (HTTP ${res.status}).` };
  } catch {
    return { ...base, status: "unknown", note: "Ulaşılamadı (zaman aşımı/ağ) — durum bilinmiyor." };
  }
}

/** Resend: anahtar varlığı + ücretsiz `GET /domains`.
 *
 *  🔴 ÖLÇÜLDÜ, VARSAYILMADI (2026-08-04, canlı panelde yanlış alarm sonrası):
 *  Resend'in "sending only" kısıtlı anahtarı bu uca **403 DEĞİL, 401** döner ve
 *  gövdesinde `"name":"restricted_api_key"` +
 *  `"message":"This API key is restricted to only send emails"` bulunur.
 *  İlk sürüm 403 varsayıp 401'i "anahtar reddedildi → e-posta kırık" saydı ve
 *  ÇALIŞAN bir gönderim hattını kırık gösterdi. Yanlış alarm, gerçek alarmı
 *  körelttiği için sahte "ok" kadar zararlıdır.
 *
 *  Ayrım artık gövdeden yapılıyor: `restricted_api_key` → anahtar SAĞLAM ve
 *  doğru yapılandırılmış (yalnız gönderim yetkisi = en güvenli kurulum);
 *  başka bir 401 → gerçekten geçersiz anahtar. Gönderimin kendisi buradan
 *  doğrulanamaz (test maili göndermek gerekirdi) — bu yüzden en iyi ihtimalde
 *  "bilinmiyor" deriz, asla "her şey yolunda" demeyiz. */
async function checkResend(): Promise<ServiceHealth> {
  const base: ServiceHealth = { key: "resend", label: "Resend (e-posta)", status: "unknown" };
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return {
      ...base,
      status: "fail",
      note: "RESEND_API_KEY yok → OTP kodu, şifre sıfırlama ve destek bildirimi gönderilemez.",
    };
  }
  const t0 = Date.now();
  try {
    const res = await withTimeout((signal) =>
      fetch("https://api.resend.com/domains", {
        method: "GET",
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
        signal,
      }),
    );
    const latencyMs = Date.now() - t0;
    if (res.ok) {
      discardBody(res);
      return { ...base, status: "ok", latencyMs, note: "Anahtar geçerli (domain listesi okundu)." };
    }
    // 401/403 gövdesini OKUMAK gerekiyor: kısıtlı-anahtar ile geçersiz-anahtar
    // ayrımı yalnız `name` alanından yapılabilir (yukarıdaki ölçüm notu).
    // Gövde küçük (~120 bayt) ve sır içermez; okuma hatası yutulur.
    let restricted = false;
    if (res.status === 401 || res.status === 403) {
      try {
        const body = (await res.json()) as { name?: unknown };
        restricted = body?.name === "restricted_api_key";
      } catch {
        /* gövde okunamadı — aşağıdaki muhafazakâr dala düşer */
      }
    } else {
      discardBody(res);
    }
    if (restricted) {
      return {
        ...base,
        status: "unknown",
        latencyMs,
        note: "Anahtar SAĞLAM — yalnız gönderim yetkisi var (en güvenli kurulum), o yüzden okuma uçları reddediyor. Gönderimin kendisi buradan doğrulanamaz.",
      };
    }
    if (res.status === 401) {
      return { ...base, status: "fail", latencyMs, note: "Anahtar geçersiz (401) → OTP, şifre sıfırlama ve destek bildirimi gönderilemez." };
    }
    if (res.status === 403) {
      return { ...base, status: "unknown", latencyMs, note: "Anahtar var ama domain okuma izni yok — gönderim doğrulanamadı." };
    }
    return { ...base, status: "unknown", latencyMs, note: `Beklenmeyen yanıt (HTTP ${res.status}).` };
  } catch {
    return { ...base, status: "unknown", note: "Ulaşılamadı (zaman aşımı/ağ) — durum bilinmiyor." };
  }
}

// ── B) Env varlık denetimi ─────────────────────────────────────────────────

/**
 * Liste kodu grepleyerek DOĞRULANDI (2026-08-04) — uydurma yok.
 * `critical` tanımı: "yoksa canlı akış bozulur, güvenli bir fallback'i YOK".
 * Fallback'i olanlar (EMAIL_FROM, NEXT_PUBLIC_SITE_URL, SUPPORT_NOTIFY_TO)
 * bilerek critical DEĞİL — yanlış alarm, gerçek alarmı körelttir.
 */
const ENV_SPEC: { key: string; critical: boolean; purpose: string }[] = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    critical: true,
    purpose: "Yoksa uygulama hiç açılmaz — lib/supabase/server.ts modül yüklenirken throw eder.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    critical: true,
    purpose: "Yoksa uygulama hiç açılmaz; tarayıcı oturumu (giriş) kurulamaz.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    critical: true,
    purpose: "Yoksa admin paneli, OTP kayıt akışı ve maç raporu kaydı çalışmaz (RLS'i aşan tek istemci).",
  },
  {
    key: "OPENAI_API_KEY",
    critical: true,
    purpose: "Yoksa koç geri bildirimi tamamen durur: vision/report/feedback/insight/ask yapılandırma hatası döner.",
  },
  {
    key: "UPSTASH_REDIS_REST_URL",
    critical: true,
    purpose: "Yoksa rate-limit prod'da fail-closed: TÜM AI route'ları 503 (2026-08-04 olayı tam olarak buydu).",
  },
  {
    key: "UPSTASH_REDIS_REST_TOKEN",
    critical: true,
    purpose: "Yoksa rate-limit prod'da fail-closed: TÜM AI route'ları 503; indirme sayacı ve kota da ölür.",
  },
  {
    key: "OTP_HMAC_SECRET",
    critical: true,
    purpose: "Yoksa (veya <32 karakterse) OTP üretilemez — e-posta doğrulama ve şifre sıfırlama kırılır.",
  },
  {
    key: "RESEND_API_KEY",
    critical: true,
    purpose: "Yoksa hiçbir e-posta gitmez: OTP kodu, şifre sıfırlama, destek bildirimi.",
  },
  {
    key: "EMAIL_FROM",
    critical: false,
    purpose: 'Yoksa "AIMLO <support@aimlo.gg>" varsayılanına düşer (lib/email.ts) — gönderim durmaz.',
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    critical: false,
    purpose: "Yoksa https://aimlo.gg varsayılanına düşer; yalnız özel bir alan adına geçilirse önem kazanır.",
  },
  {
    key: "SUPPORT_NOTIFY_TO",
    critical: false,
    purpose: "Yoksa destek bildirimleri support@aimlo.gg adresine gider (varsayılan).",
  },
  {
    key: "FREE_TIER_ENFORCED",
    critical: false,
    purpose: 'Kota bayrağı: yalnız "true" iken ücretsiz katman kotası uygulanır — beta boyunca kapalı.',
  },
  {
    key: "PADDLE_WEBHOOK_SECRET",
    critical: false,
    purpose: "Yoksa billing webhook'u uyku modunda 503 döner (bilinçli) — abonelik akışı kapalı demektir.",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    critical: false,
    purpose: "Paddle'a alternatif imza yolu; ikisi de yoksa billing webhook'u kapalıdır.",
  },
  {
    key: "STRICT_RATE_LIMIT",
    critical: false,
    purpose: 'Yalnız yerelde anlamlı: "true" ise dev ortamda da prod katılığı (fail-closed) uygulanır.',
  },
];

function collectEnvs(): EnvCheck[] {
  // DEĞER YOK — yalnız boolean. Bu satır bilinçli olarak tek satır kalıyor:
  // buraya bir gün "value"/"length" eklenirse sır politikası çöker.
  return ENV_SPEC.map((s) => ({ key: s.key, present: has(s.key), critical: s.critical, purpose: s.purpose }));
}

// ── C) Dağıtım bilgisi ─────────────────────────────────────────────────────

/** Değerler Vercel sistem env'lerinden gelir (vercel.com/docs/environment-variables/
 *  system-environment-variables — 2026-08-04'te doğrulandı). Proje ayarındaki
 *  "Enable access to System Environment Variables" kapalıysa hepsi boştur;
 *  o zaman uydurmuyoruz, null bırakıyoruz → panel "bilinmiyor" der.
 *  NOT: VERCEL_REGION dokümana göre YALNIZ runtime'da vardır (build'de yok). */
function readDeployInfo(): DeployInfo {
  // Erişimler STATİK (ENV_SNAPSHOT ile aynı gerekçe: dinamik anahtar Next
  // tarafından yerine konmaz → var olan bir değer "yok" görünebilir).
  const clean = (v: string | undefined): string | null =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

  const sha = clean(process.env.VERCEL_GIT_COMMIT_SHA);
  return {
    onVercel: clean(process.env.VERCEL) === "1",
    commitSha: sha,
    commitShort: sha ? sha.slice(0, 7) : null,
    branch: clean(process.env.VERCEL_GIT_COMMIT_REF),
    env: clean(process.env.VERCEL_ENV),
    targetEnv: clean(process.env.VERCEL_TARGET_ENV),
    region: clean(process.env.VERCEL_REGION),
    deploymentId: clean(process.env.VERCEL_DEPLOYMENT_ID),
  };
}

// ── D) Dış konsol linkleri ─────────────────────────────────────────────────

/** Vercel'in resmî takım/proje-bağımsız yönlendirmesi (dokümanda bu biçimde
 *  geçiyor): takım slug'ını bilmeden doğru projenin ayar sayfasına gider. */
function vercelDeepLink(path: string, title: string): string {
  return `https://vercel.com/d?to=${encodeURIComponent(path)}&title=${encodeURIComponent(title)}`;
}

function buildLinks(): InfraLink[] {
  const ref = supabaseProjectRef();
  return [
    {
      label: "Vercel — Environment Variables",
      url: vercelDeepLink("/[team]/[project]/settings/environment-variables", "Environment Variables"),
      note: "Eksik env buradan geri konur. UYARI: `vercel env rm` scope'u yok sayabiliyor — panelden gir.",
    },
    {
      label: "Vercel — Deployments",
      url: vercelDeepLink("/[team]/[project]/deployments", "Deployments"),
      note: "Son deploy, build log'u ve geri alma (rollback).",
    },
    {
      label: "Supabase — Proje",
      url: `https://supabase.com/dashboard/project/${ref}`,
      note: "Tablolar, RLS politikaları, auth kullanıcıları.",
    },
    {
      label: "Supabase — releases bucket",
      url: `https://supabase.com/dashboard/project/${ref}/storage/buckets/releases`,
      note: "MSI + latest.json burada; aimlo.gg/download ve updater aynı dosyayı okur.",
    },
    {
      label: "Upstash — Redis konsolu",
      url: "https://console.upstash.com/redis",
      note: "AIMLO DB'si (organic-oriole-119981): rate-limit, günlük kota ve indirme sayacı.",
    },
    {
      label: "OpenAI — Kullanım/maliyet",
      url: "https://platform.openai.com/usage",
      note: "Gerçek fatura. Panelin maliyet sayfası ai_usage'dan tahmin eder; kesin rakam burası.",
    },
    {
      label: "Resend — Gönderim log'u",
      url: "https://resend.com/emails",
      note: "OTP / şifre sıfırlama / destek maili teslim durumu.",
    },
    {
      label: "GitHub — backend (aimlo)",
      url: "https://github.com/gunayerdem/aimlo",
      note: "Bu repo; main'e push = Vercel prod deploy.",
    },
    {
      label: "GitHub — desktop (aimlo-desktop)",
      url: "https://github.com/gunayerdem/aimlo-desktop",
      note: "Windows uygulaması; bu API sözleşmesini tüketen taraf.",
    },
  ];
}

// ── Giriş noktası ──────────────────────────────────────────────────────────

/**
 * Tüm altyapı durumunu TEK çağrıda toplar. Yalnız admin gate'inin ARKASINDAN
 * çağrılmalı (app/admin/* zaten layout'ta getAdminUser ile kapalı).
 *
 * Çağıran sayfa DYNAMIC olmalı (`export const dynamic = "force-dynamic"`):
 * burada gerçek zamanlı ölçüm var, statik snapshot yanıltıcı olurdu.
 *
 * Bu fonksiyon ASLA throw etmez: her kontrol kendi hatasını yutar, üstelik
 * allSettled ile ikinci bir ağ atılır (bir kontrol beklenmedik şekilde
 * reject ederse bile panel açılır, o kart "unknown" görünür).
 */
export async function getInfraStatus(): Promise<InfraStatus> {
  const envs = collectEnvs();
  const missingCritical = envs.filter((e) => e.critical && !e.present).map((e) => e.key);

  const flags = {
    freeTierEnforced: process.env.FREE_TIER_ENFORCED === "true",
    strictRateLimit: process.env.STRICT_RATE_LIMIT === "true",
    // Billing "uykuda mı": iki imza sırrından biri bile varsa webhook açık.
    billingConfigured: has("PADDLE_WEBHOOK_SECRET") || has("STRIPE_WEBHOOK_SECRET"),
  };

  const checks: { key: ServiceKey; label: string; run: () => Promise<ServiceHealth> }[] = [
    { key: "supabase", label: "Supabase (DB)", run: checkSupabase },
    { key: "upstash", label: "Upstash Redis (rate-limit)", run: checkUpstash },
    { key: "releases", label: "Releases (latest.json)", run: checkReleases },
    { key: "openai", label: "OpenAI API", run: checkOpenAI },
    { key: "resend", label: "Resend (e-posta)", run: checkResend },
  ];

  let services: ServiceHealth[];
  if (isBuildPhase()) {
    // Build sırasında ağ vurmuyoruz (yukarıdaki isBuildPhase notu). Sahte "ok"
    // yerine dürüst "unknown".
    services = checks.map((c) => ({
      key: c.key,
      label: c.label,
      status: "unknown" as const,
      note: "Build sırasında ölçüm yapılmaz — sayfayı yenileyin.",
    }));
  } else {
    const settled = await Promise.allSettled(checks.map((c) => c.run()));
    services = settled.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : {
            key: checks[i].key,
            label: checks[i].label,
            status: "unknown" as const,
            note: "Kontrol beklenmedik şekilde sonlandı — durum bilinmiyor.",
          },
    );
  }

  return {
    checkedAt: new Date().toISOString(),
    services,
    envs,
    missingCritical,
    flags,
    deploy: readDeployInfo(),
    links: buildLinks(),
  };
}
