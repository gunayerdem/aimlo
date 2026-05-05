import nodemailer, { type Transporter } from "nodemailer";

/**
 * AIMLO transactional email — branded OTP delivery via Gmail Workspace SMTP.
 * Set these in env (Vercel + .env.local):
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_USER=support@aimlo.gg
 *   SMTP_PASS=<gmail app password — NOT your Google account password>
 *   SMTP_FROM="AIMLO <support@aimlo.gg>"
 *
 * Get the App Password at https://myaccount.google.com/apppasswords
 * (2FA must be enabled on the Workspace account first).
 */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "AIMLO <support@aimlo.gg>";

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_USER / SMTP_PASS missing — cannot send mail");
  }
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 = TLS, 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return cachedTransport;
}

export type EmailLang = "tr" | "en";

export interface OtpEmailParams {
  to: string;
  /** 6-char raw code (no dash). */
  code: string;
  lang?: EmailLang;
  /** "register" | "login" — slight wording difference. */
  purpose?: "register" | "login";
}

export async function sendOtpEmail({
  to,
  code,
  lang = "tr",
  purpose = "register",
}: OtpEmailParams): Promise<void> {
  const transport = getTransport();
  const formatted = `${code.slice(0, 3)}-${code.slice(3)}`;

  const subject =
    lang === "tr"
      ? `AIMLO doğrulama kodun: ${formatted}`
      : `Your AIMLO verification code: ${formatted}`;

  await transport.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text: textBody(formatted, lang, purpose),
    html: htmlBody(formatted, lang, purpose),
  });
}

function textBody(formatted: string, lang: EmailLang, purpose: "register" | "login"): string {
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

function htmlBody(formatted: string, lang: EmailLang, purpose: "register" | "login"): string {
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
          ignore: "Sen istemediysen bu maili yok say. Hesabında hiçbir şey değişmez.",
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
          ignore: "Didn't request this? Ignore this email — nothing changes on your account.",
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
