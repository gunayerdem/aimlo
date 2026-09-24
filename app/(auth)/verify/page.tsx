import type { Metadata } from "next";
import Link from "next/link";
import { VerifyForm, VerifyEmailStartForm } from "./VerifyForm";

export const metadata: Metadata = {
  title: "E-posta Doğrula — AIMLO",
  description: "AIMLO doğrulama kodunu gir.",
  robots: { index: false, follow: false },
};

/** B31 (2026-07-31): kayıtta OTP maili gönderilemediyse register action bizi
 *  buraya `mailfail=<sebep>` ile yollar. Hesap + kod zaten oluşturuldu; tek
 *  eksik mailin çıkması — bu yüzden kullanıcıya sebebi GÖRÜNÜR söyleyip
 *  aşağıdaki "Yeni kod gönder" butonuna yönlendiriyoruz (eskiden kullanıcı
 *  kayıt sayfasında kör bir hata mesajıyla kalıyordu). */
const MAIL_FAIL_TEXT: Record<string, string> = {
  quota:
    "Doğrulama kodu maili şu an gönderilemedi (mail sağlayıcı sınırı). Hesabın oluşturuldu — birkaç dakika sonra aşağıdan “Yeni kod gönder”e bas.",
  config:
    "Doğrulama kodu maili gönderilemedi (sunucu mail ayarı). Hesabın oluşturuldu — aşağıdan “Yeni kod gönder”i dene, sürerse support@aimlo.gg.",
  invalid:
    "Bu e-posta adresine mail iletilemedi. Adresi kontrol et; gerekiyorsa yeni bir adresle kayıt ol.",
  transient:
    "Doğrulama kodu maili gönderilemedi. Hesabın oluşturuldu — aşağıdan “Yeni kod gönder”e basarak tekrar dene.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; purpose?: string; mailfail?: string; sent?: string }>;
}) {
  const sp = await searchParams;
  const email = (sp.email ?? "").trim().toLowerCase();
  const purpose = sp.purpose === "login" ? "login" : "register";
  // FB02 inceleme · F34: e-posta formundan (VerifyEmailStartForm) gelindi → az önce YENİ
  // kod gönderildi; girişte sessizce giden önceki kod artık geçersiz. Yalnız sabit "1".
  const justSent = sp.sent === "1" && !sp.mailfail;
  // Yalnız bilinen anahtarlar — URL'den gelen serbest metin ekrana basılmaz.
  const mailFail = sp.mailfail ? MAIL_FAIL_TEXT[sp.mailfail] ?? MAIL_FAIL_TEXT.transient : null;

  // F34 (2026-09-24): e-posta yoksa /login'e ATMA — masaüstü bu sayfayı
  // parametresiz açıyor ve /login doğrulanmamış hesaba (enumeration koruması
  // yüzünden) doğrulama yolu göstermiyor. Mevcut resendAction'a giden küçük
  // bir e-posta formu gösterilir (VerifyForm.tsx VerifyEmailStartForm).
  if (!email || !email.includes("@")) {
    return (
      <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-slide-up-big">
        <div className="text-center space-y-5">
          <Link
            href="/login"
            className="mx-auto inline-flex items-center gap-2 text-[12px] text-neutral-500 transition hover:text-[#22D3EE] hover-underline"
          >
            ← Geri
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/aimlo-logo.png?v=3"
            alt="AIMLO"
            style={{ height: 42, width: "auto" }}
            draggable={false}
            className="auth-logo mx-auto"
          />
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              E-posta Doğrula
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Kayıt olduğun e-posta adresini yaz, sana 6 haneli yeni bir kod
              gönderelim.
            </p>
          </div>
        </div>

        <VerifyEmailStartForm />
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-[440px] space-y-8 animate-slide-up-big">
      <div className="text-center space-y-5">
        <Link
          href={purpose === "login" ? "/login" : "/register"}
          className="mx-auto inline-flex items-center gap-2 text-[12px] text-neutral-500 transition hover:text-[#22D3EE] hover-underline"
        >
          ← Geri
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/aimlo-logo.png?v=3"
          alt="AIMLO"
          style={{ height: 42, width: "auto" }}
          draggable={false}
          className="auth-logo mx-auto"
        />
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            E-posta Doğrula
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            <span className="text-neutral-300">{email}</span>
          </p>
          <p className="mt-1 text-[12px] text-neutral-400">
            {mailFail
              ? "Kod gönderilemedi"
              : justSent
                ? "Adresine 6 haneli yeni bir kod gönderdik — en son gelen e-postadaki kodu gir; önceki kodlar geçersiz."
                : "Adresine 6 haneli bir kod gönderdik"}
          </p>
        </div>
      </div>

      {mailFail && (
        <div
          role="alert"
          className="rounded-xl border border-[#FF3D71]/20 bg-[#FF3D71]/[0.06] px-4 py-3"
        >
          <p className="text-[12px] leading-relaxed text-[#FF3D71]">{mailFail}</p>
        </div>
      )}

      <VerifyForm email={email} purpose={purpose} justSent={justSent} />
    </div>
  );
}
