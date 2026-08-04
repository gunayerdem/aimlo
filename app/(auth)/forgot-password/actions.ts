"use server";

import { createHash } from "node:crypto";

import { createServerSupabase } from "@/lib/supabase/server";
import { authRateLimit } from "@/lib/auth-rate-limit";
import { forgotSchema } from "../schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aimlo.gg";

/**
 * Loglanabilir e-posta kimliği: sha256(normalize(email)) ilk 16 hex.
 *
 * NEDEN (güvenlik denetimi beta4, 2026-08-04): bu dosya rate-limit dalında HAM
 * e-postayı `console.warn` ile sunucu loguna yazıyordu. Vercel loglarına erişen
 * herkes (log drain'i olan üçüncü taraflar dahil) kurbanın adresini düz metin
 * görüyordu — CLAUDE.md'nin "telemetri PII-free, kimlik hash'lenir" ilkesinden
 * sapma. Hash korelasyonu KORUR (aynı adres → aynı hash, yani "hangi adres
 * flood ediliyor" hâlâ izlenebilir) ama adresi açık etmez.
 *
 * KANIT/DESEN: app/api/telemetry/route.ts:60-62 `hashUserId()` — birebir aynı
 * algoritma (sha256 → hex → ilk 16), supabase/0015_telemetry_events.sql:32 ile
 * de aynı sözleşme. Oradaki fonksiyon export EDİLMİYOR ve bu paket lib/'e
 * dokunamıyor; ortak yardımcıya çıkarmak ayrı (lib/) bir iş, o yüzden desen
 * burada bilinçli olarak tekrar edildi.
 *
 * SINIR (dürüst not): e-posta düşük entropili bir girdidir; hash'i sözlük
 * saldırısıyla geri çevrilebilir. Yani bu "anonimleştirme" DEĞİL, log'da düz
 * metin PII bulundurmama önlemidir. Normalizasyon (lowercase+trim)
 * lib/auth-rate-limit.ts:182 ile aynı ki aynı adres hep aynı hash'i versin.
 */
function emailHash(email: string): string {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);
}

/**
 * Sağlayıcı hata metinlerinden e-posta adreslerini söker.
 *
 * NEDEN (güvenlik denetimi beta4, 2026-08-04): aşağıdaki iki `console.error`
 * satırı Supabase/GoTrue'nun `error.message`'ını olduğu gibi basıyor. GoTrue
 * bazı hatalarda adresi metnin İÇİNE gömer (ör. `email_address_invalid` →
 * `Email address "x@y.com" is invalid`), yani hash'lenmiş satırı düzeltip bunu
 * bırakmak aynı PII'yi arka kapıdan loglamaya devam ederdi. Desen tabanlı
 * süzgeç: e-posta benzeri her parça `<email:HASH>` ile değişir → hatanın SEBEBİ
 * okunur kalır, adres gitmez.
 *
 * ReDoS ÖNLEMİ (ölçülmüş, tahmin değil): ilk taslak sınırsız niceleyici
 * kullanıyordu (`[^...]+@[^...]+\.[^...]+`) ve nokta içermeyen uzun bir girdide
 * KARESEL davranıyordu — 100k karakterlik sentetik girdide **6.4 saniye** ölçüldü
 * (scratchpad/check.mjs, 2026-08-04). Şimdi niceleyiciler üst sınırlı; aynı
 * girdi <1 ms. Ek olarak regex girdisi MAX_SCAN_LEN'e bağlanır → en kötü hâl
 * sabit. Üst sınırlar schemas.ts:16-21 ile hizalı (e-posta ≤254 karakter).
 *
 * SIRA ÖNEMLİ (kendi testimde yakalandı): önce kırpıp sonra redakte edersek,
 * sınıra denk gelen bir adres YARIM kalır ve regex eşleşmediği için ham parça
 * ("...victim@exa") log'a düşer. Bu yüzden ÖNCE redakte, SONRA log için kırp —
 * 300'lük kırpma artık yalnız `<email:HASH>` içeren metne uygulanır.
 */
const MAX_SCAN_LEN = 2000; // regex iş yükü tavanı (gerçek sağlayıcı mesajları <1KB)
const MAX_LOGGED_ERROR_LEN = 300; // log satırı tavanı (gürültü + maliyet)

function redactEmails(message: string): string {
  const scanned = message.slice(0, MAX_SCAN_LEN);
  const redacted = scanned.replace(
    /[^\s"'<>@]{1,254}@[^\s"'<>@]{1,254}\.[^\s"'<>@,;)\]]{2,24}/g,
    (match) => `<email:${emailHash(match)}>`,
  );
  return redacted.slice(0, MAX_LOGGED_ERROR_LEN);
}

export interface ForgotState {
  ok: boolean;
  error?: string;
  sent?: boolean;
  values?: { email?: string };
}

export async function forgotAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const raw = { email: String(formData.get("email") ?? "") };

  const parsed = forgotSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta",
      values: raw,
    };
  }

  const { email } = parsed.data;

  // Pad total response time to ~600ms regardless of code path. Prevents
  // timing-based registered-vs-not enumeration: rate-limited path used to
  // return instantly while the actual reset-email path took ~300-500ms,
  // creating a side channel even though both responses looked identical.
  const t0 = Date.now();
  const TARGET_MS = 600;

  // Rate-limit per (email, IP). 3 / 10min — discourages mass reset-email
  // floods to a victim's inbox + email-bombing as a DoS. We do NOT short-
  // circuit on rate-limit: still wait the full window before responding.
  const rl = await authRateLimit("forgot", email);

  if (!rl.blocked) {
    try {
      const supabase = await createServerSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
      });
      if (error) {
        // PII: mesaj adres gömülü gelebilir → redactEmails (bkz. yardımcının NEDEN'i).
        console.error("[Aimlo forgot] resetPasswordForEmail failed:", redactEmails(error.message));
      }
    } catch (e) {
      console.error("[Aimlo forgot] exception:", redactEmails((e as Error).message));
    }
  } else {
    // Güvenlik denetimi beta4 (2026-08-04): eskiden ham `email` basılıyordu (PII).
    // Artık yalnız sha256'nın ilk 16 hanesi — grep öneki `[Aimlo forgot] rate-limited`
    // korundu ki mevcut log aramaları kırılmasın.
    console.warn("[Aimlo forgot] rate-limited (emailHash):", emailHash(email));
  }

  const elapsed = Date.now() - t0;
  if (elapsed < TARGET_MS) {
    await new Promise((r) => setTimeout(r, TARGET_MS - elapsed));
  }

  // Always show success — never reveal whether the email is registered.
  return { ok: true, sent: true, values: raw };
}
