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
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "AIMLO <support@aimlo.gg>";

let cachedClient: Resend | null = null;

function getClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing — cannot send mail");
  }
  if (!cachedClient) {
    cachedClient = new Resend(RESEND_API_KEY);
  }
  return cachedClient;
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

  const { error } = await client.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    text: textBody(formatted, lang, purpose),
    html: htmlBody(formatted, lang, purpose),
  });

  if (error) {
    // Resend's SDK returns errors instead of throwing on most cases — surface
    // them so the caller's catch can show a useful message to the user.
    throw new Error(
      `Resend API error: ${error.message ?? JSON.stringify(error)}`,
    );
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
