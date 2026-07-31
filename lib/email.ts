import { Resend } from "resend";

/**
 * Transactional email via Resend (HTTP API).
 *
 * Why not Gmail SMTP?
 *   Vercel serverless functions can hang on Gmail's port-465 TLS handshake;
 *   the function times out before the redirect runs and the browser sees
 *   a half-rendered response. Resend uses plain HTTPS, so it's always
 *   <500ms and never blocks on TCP.
 *
 * Setup:
 *   1) Sign up at https://resend.com (free tier: 100/day, 3000/month).
 *   2) Verify aimlo.gg domain — Resend gives 3 CNAME records (SPF +
 *      DKIM) to add to Porkbun DNS. SPF coexists with Gmail Workspace.
 *   3) Create an API key (Production scope) → set RESEND_API_KEY env.
 *   4) Until the domain is verified, use `onboarding@resend.dev` as the
 *      sender — Resend will only let you send to your own account email.
 *
 * B31 (2026-07-31): OTP maili + destek bildirimi AYNI Resend kotasını
 * paylaşır. Ücretsiz katmanda gün içinde 100 mail sınırı dolarsa kayıt
 * hunisi durur — bu yüzden aşağıdaki `EmailSendError.reason` sınıflandırması
 * ve "MAIL-KAPALI" log damgası var. Launch öncesi ücretli plan doğrulanmalı.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "AIMLO <support@aimlo.gg>";
/** Destek bildirimlerinin gideceği kutu (B28). Env ile değiştirilebilir. */
const SUPPORT_NOTIFY_TO = process.env.SUPPORT_NOTIFY_TO || "support@aimlo.gg";

let cachedClient: Resend | null = null;

/* ────────────────────────────────────────────────────────────────
   B31 (2026-07-31): OTP maili kayıt hunisinin TEK bacağı ve Resend'in
   ücretsiz katmanı 100/gün. Eskiden her hata tek tip `Error` idi; çağıran
   "kota mı doldu, anahtar mı yanlış, geçici mi" ayrımını yapamıyor ve
   kullanıcıya doğru yolu (yeniden gönder / biraz sonra dene) gösteremiyordu.
   Sebebi sınıflandırıyoruz + kota/anahtar hatasını loglarda GÖRÜNÜR
   yapıyoruz (aksi halde duyuru günü kayıt sessizce ölür).
   ──────────────────────────────────────────────────────────────── */
export type EmailFailReason =
  /** RESEND_API_KEY yok/geçersiz — deploy sorunu, kullanıcı çözemez. */
  | "config"
  /** Günlük/dakikalık gönderim kotası doldu — biraz sonra tekrar dene. */
  | "quota"
  /** Alıcı adresi Resend tarafından reddedildi. */
  | "invalid"
  /** Ağ/5xx — geçici. */
  | "transient";

/** Resend SDK'sının hata şekli (gevşek — SDK sürümüne bağlanmıyoruz). */
type ResendErrorLike = { message?: string; name?: string; statusCode?: number | null };

export class EmailSendError extends Error {
  readonly reason: EmailFailReason;
  constructor(reason: EmailFailReason, message: string) {
    super(message);
    this.name = "EmailSendError";
    this.reason = reason;
  }
}

/** Bilinmeyen hataları güvenli tarafa ("transient") düşürür. */
export function emailFailReason(e: unknown): EmailFailReason {
  return e instanceof EmailSendError ? e.reason : "transient";
}

function classifyResendError(
  name: string,
  message: string,
  statusCode?: number | null,
): EmailFailReason {
  if (statusCode === 429) return "quota";
  if (statusCode === 401 || statusCode === 403) return "config";
  if (statusCode === 422) return "invalid";

  const s = `${name} ${message}`.toLowerCase();
  if (s.includes("api_key") || s.includes("api key") || s.includes("unauthorized") || s.includes("forbidden")) {
    return "config";
  }
  if (s.includes("rate_limit") || s.includes("rate limit") || s.includes("quota") || s.includes("too many")) {
    return "quota";
  }
  if (s.includes("validation") || s.includes("invalid_parameter") || s.includes("invalid to") || s.includes("not a valid")) {
    return "invalid";
  }
  return "transient";
}

/** Ops'un görmesi gereken iki sınıf için tek satırlık, aranabilir log damgası. */
function logIfOpsActionable(reason: EmailFailReason, where: string, detail: string): void {
  if (reason === "quota" || reason === "config") {
    console.error(
      `[Aimlo email] MAIL-KAPALI (${reason}) — ${where}: ${detail}. ` +
        "Resend planını/anahtarını kontrol et; bu sürerken kayıt/destek maili gitmiyor.",
    );
  }
}

function getClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new EmailSendError("config", "RESEND_API_KEY missing — cannot send mail");
  }
  if (!cachedClient) {
    cachedClient = new Resend(RESEND_API_KEY);
  }
  return cachedClient;
}

/** HTML gövdesine gömülen her kullanıcı metni için — mail istemcisinde
 *  markup çalışmasın diye (destek mesajı prompt-safety'den geçse bile
 *  savunma-derinliği olarak burada da kaçırıyoruz). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailLang = "tr" | "en";

export interface OtpEmailParams {
  to: string;
  /** 6-char raw code (no dash). */
  code: string;
  lang?: EmailLang;
  purpose?: "register" | "login";
}

export async function sendOtpEmail({
  to,
  code,
  lang = "tr",
  purpose = "register",
}: OtpEmailParams): Promise<void> {
  const client = getClient();
  const formatted = `${code.slice(0, 3)}-${code.slice(3)}`;

  const subject =
    lang === "tr"
      ? `AIMLO doğrulama kodun: ${formatted}`
      : `Your AIMLO verification code: ${formatted}`;

  // B31 (2026-07-31): ağ katmanı istisnası da atabiliyor — SDK'nın döndürdüğü
  // `error` ile aynı sınıflandırmadan geçsin ki çağıran tek tip davransın.
  let error: ResendErrorLike | null = null;
  try {
    ({ error } = await client.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text: textBody(formatted, lang, purpose),
      html: htmlBody(formatted, lang, purpose),
    }));
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    const reason = classifyResendError("", msg);
    logIfOpsActionable(reason, "sendOtpEmail", msg);
    throw new EmailSendError(reason, `Resend request failed: ${msg}`);
  }

  if (error) {
    // Resend's SDK returns errors instead of throwing on most cases — surface
    // them so the caller's catch can show a useful message to the user.
    const msg = error.message ?? JSON.stringify(error);
    const reason = classifyResendError(error.name ?? "", msg, error.statusCode);
    logIfOpsActionable(reason, "sendOtpEmail", msg);
    throw new EmailSendError(reason, `Resend API error: ${msg}`);
  }
}

/* ────────────────────────────────────────────────────────────────
   B28 (2026-07-31): destek ticket'ı DB'ye yazılıyordu ama softi'ye HİÇBİR
   sinyal gitmiyordu — /admin/support'a bakılmadıkça ticket görünmezdi.
   Duyuru günü ilk kullanıcıların (ör. SmartScreen'e takılanlar) yanıtsız
   kalması en pahalı ilk izlenim kaybı. Bu fonksiyon route'tan `after()` ile
   ÇAĞRILIR: yanıt gönderildikten sonra koşar, INSERT'i asla bloklamaz.
   ──────────────────────────────────────────────────────────────── */
export interface SupportNotifyParams {
  /** Ticket sahibinin e-postası — Reply-To olarak takılır (yoksa null). */
  userEmail: string | null;
  /** Doğrulanmış JWT'den gelen user_id (panelde aramak için). */
  userId: string;
  /** ZATEN sanitize edilmiş mesaj (route prompt-safety'den geçiriyor). */
  message: string;
}

export async function sendSupportNotification({
  userEmail,
  userId,
  message,
}: SupportNotifyParams): Promise<void> {
  const client = getClient();

  // Konu satırı: mesajın ilk satırından kısa bir önizleme — gelen kutusunda
  // ticket'ı açmadan ayırt edebilmek için.
  const preview = message.replace(/\s+/g, " ").trim().slice(0, 60);
  const subject = `[AIMLO destek] ${preview || "yeni ticket"}`;

  const text = [
    "Yeni destek mesajı — /admin/support",
    "",
    `Kullanıcı: ${userEmail ?? "(e-posta yok)"}`,
    `user_id: ${userId}`,
    "",
    "Mesaj:",
    message,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#111;">
  <p style="margin:0 0 12px 0;"><strong>Yeni destek mesajı</strong> — <a href="https://aimlo.gg/admin/support">/admin/support</a></p>
  <p style="margin:0 0 4px 0;color:#555;">Kullanıcı: <strong>${escapeHtml(userEmail ?? "(e-posta yok)")}</strong></p>
  <p style="margin:0 0 16px 0;color:#888;font-size:12px;">user_id: ${escapeHtml(userId)}</p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f5f5f7;border:1px solid #e3e3e8;border-radius:8px;padding:14px;margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;">${escapeHtml(message)}</pre>
</div>`;

  let error: ResendErrorLike | null = null;
  try {
    ({ error } = await client.emails.send({
      from: EMAIL_FROM,
      to: [SUPPORT_NOTIFY_TO],
      // Doğrudan "yanıtla" ile kullanıcıya dönebilmek için.
      ...(userEmail ? { replyTo: userEmail } : {}),
      subject,
      text,
      html,
    }));
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    const reason = classifyResendError("", msg);
    logIfOpsActionable(reason, "sendSupportNotification", msg);
    throw new EmailSendError(reason, `Resend request failed: ${msg}`);
  }

  if (error) {
    const msg = error.message ?? JSON.stringify(error);
    const reason = classifyResendError(error.name ?? "", msg, error.statusCode);
    logIfOpsActionable(reason, "sendSupportNotification", msg);
    throw new EmailSendError(reason, `Resend API error: ${msg}`);
  }
}

function textBody(
  formatted: string,
  lang: EmailLang,
  purpose: "register" | "login",
): string {
  if (lang === "tr") {
    const verb = purpose === "register" ? "kayıt" : "giriş";
    return [
      `AIMLO doğrulama kodun: ${formatted}`,
      ``,
      `Bu kodu ${verb} sayfasında 10 dakika içinde gir.`,
      `Sen istemediysen bu maili yok say — hiçbir şey olmaz.`,
      ``,
      `— AIMLO`,
    ].join("\n");
  }
  const verb = purpose === "register" ? "registration" : "login";
  return [
    `Your AIMLO verification code: ${formatted}`,
    ``,
    `Enter it on the ${verb} page within 10 minutes.`,
    `Didn't request this? Ignore this email — nothing happens.`,
    ``,
    `— AIMLO`,
  ].join("\n");
}

function htmlBody(
  formatted: string,
  lang: EmailLang,
  purpose: "register" | "login",
): string {
  const t =
    lang === "tr"
      ? {
          preheader: "AIMLO doğrulama kodun",
          title: "Doğrulama kodun",
          intro:
            purpose === "register"
              ? "Kayıt işlemini tamamlamak için bu kodu siteye gir."
              : "Giriş yapmak için bu kodu siteye gir.",
          expires: "Kod 10 dakika içinde geçerli.",
          ignore:
            "Sen istemediysen bu maili yok say. Hesabında hiçbir şey değişmez.",
          footer: "AIMLO — AI destekli Valorant koçun",
        }
      : {
          preheader: "Your AIMLO verification code",
          title: "Your verification code",
          intro:
            purpose === "register"
              ? "Enter this code on the site to finish registration."
              : "Enter this code on the site to sign in.",
          expires: "Code expires in 10 minutes.",
          ignore:
            "Didn't request this? Ignore this email — nothing changes on your account.",
          footer: "AIMLO — your AI Valorant coach",
        };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark only" />
<meta name="supported-color-schemes" content="dark only" />
<title>AIMLO</title>
</head>
<body style="margin:0;padding:0;background:#050810;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${t.preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050810;">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background:#0b0f1a;border:1px solid rgba(255,70,85,0.18);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 8px 32px;">
            <div style="font-size:13px;font-weight:700;letter-spacing:0.32em;color:#FF4655;text-transform:uppercase;">AIMLO</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 0 32px;">
            <h1 style="margin:16px 0 8px 0;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">${t.title}</h1>
            <p style="margin:0 0 24px 0;font-size:14px;color:#9ca3af;line-height:1.5;">${t.intro}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <div style="background:rgba(255,70,85,0.08);border:1px solid rgba(255,70,85,0.4);border-radius:12px;padding:24px;text-align:center;">
              <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,'Courier New',monospace;font-size:34px;font-weight:600;letter-spacing:0.2em;color:#ffffff;">${formatted}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <p style="margin:0 0 8px 0;font-size:13px;color:#9ca3af;line-height:1.5;">${t.expires}</p>
            <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">${t.ignore}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px 32px;">
            <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
              <p style="margin:0;font-size:11px;color:#6b7280;letter-spacing:0.04em;">${t.footer}</p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
