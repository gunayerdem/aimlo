"use client";

import { useActionState, useState } from "react";
import { registerAction, type RegisterState } from "./actions";

const initial: RegisterState = { ok: false };

const inputCls = "auth-input";

// Labels written directly in Turkish uppercase (dotted İ) — patron kararı
// 2026-07-09: TR yazım kuralları geçerli ("ŞİFRE", "İNDİR"). Already-uppercase
// text is unaffected by any text-transform, so lang="tr" is safe.
const labelCls = "auth-label";

// Eye / EyeOff SVG — replaces 👁️ / 🙈 emojis
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [kvkkChecked, setKvkkChecked] = useState(false);

  return (
    <div className="auth-card rounded-2xl p-7 sm:p-9 relative">
      <div aria-hidden className="auth-hairline" />

      {/* Anti-autofill: form-level off + per-field nope-* + 1Password/LP ignore */}
      <form action={action} noValidate autoComplete="off" className="space-y-5">
        {/* Hidden honeypot fields trick Chrome into autofilling these instead
            of the real ones. They're absolute-positioned off-screen. */}
        <div aria-hidden style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
          <input type="text" name="fakeusernameremembered" tabIndex={-1} autoComplete="username" />
          <input type="password" name="fakepasswordremembered" tabIndex={-1} autoComplete="current-password" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first" className={labelCls}>ISIM</label>
            <input
              id="reg-first"
              name="firstName"
              type="text"
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              required
              maxLength={40}
              defaultValue={state.values?.firstName}
              aria-invalid={state.fieldErrors?.firstName ? true : undefined}
              className={inputCls}
            />
            {state.fieldErrors?.firstName && (
              <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="reg-last" className={labelCls}>SOYISIM</label>
            <input
              id="reg-last"
              name="lastName"
              type="text"
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              required
              maxLength={40}
              defaultValue={state.values?.lastName}
              aria-invalid={state.fieldErrors?.lastName ? true : undefined}
              className={inputCls}
            />
            {state.fieldErrors?.lastName && (
              <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="reg-username" className={labelCls}>KULLANICI ADI</label>
          <input
            id="reg-username"
            name="username"
            type="text"
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            defaultValue={state.values?.username}
            aria-invalid={state.fieldErrors?.username ? true : undefined}
            className={inputCls}
          />
          {state.fieldErrors?.username && (
            <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-email" className={labelCls}>E-POSTA</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            defaultValue={state.values?.email}
            aria-invalid={state.fieldErrors?.email ? true : undefined}
            className={inputCls}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-pw" className={labelCls}>ŞİFRE</label>
          <div className="relative">
            <input
              id="reg-pw"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              aria-invalid={state.fieldErrors?.password ? true : undefined}
              className={inputCls}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              tabIndex={-1}
              aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
              className="auth-eye absolute right-3.5 top-1/2 -translate-y-1/2 p-1 -m-1"
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          {state.fieldErrors?.password && (
            <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-pw2" className={labelCls}>ŞİFRE TEKRAR</label>
          <div className="relative">
            <input
              id="reg-pw2"
              name="passwordConfirm"
              type={showPw2 ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              aria-invalid={state.fieldErrors?.passwordConfirm ? true : undefined}
              className={inputCls}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw2(!showPw2)}
              tabIndex={-1}
              aria-label={showPw2 ? "Şifreyi gizle" : "Şifreyi göster"}
              className="auth-eye absolute right-3.5 top-1/2 -translate-y-1/2 p-1 -m-1"
            >
              <EyeIcon open={showPw2} />
            </button>
          </div>
          {state.fieldErrors?.passwordConfirm && (
            <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.passwordConfirm}</p>
          )}
        </div>

        {/* Custom KVKK checkbox — site theme (red accent, dark base, glow). */}
        <label
          htmlFor="reg-kvkk"
          className="flex items-start gap-3 cursor-pointer select-none pt-1"
        >
          <input
            id="reg-kvkk"
            name="kvkk"
            type="checkbox"
            required
            checked={kvkkChecked}
            onChange={(e) => setKvkkChecked(e.target.checked)}
            className="sr-only"
          />
          <span
            aria-hidden
            className="auth-check"
            data-checked={kvkkChecked ? "true" : undefined}
          >
            {kvkkChecked && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#030711"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <span className="text-[12px] text-neutral-400 leading-relaxed">
            <a
              href="/legal/kvkk"
              target="_blank"
              rel="noopener noreferrer"
              className="auth-link hover-underline"
            >
              KVKK Aydınlatma Metni
            </a>
            {", "}
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="auth-link hover-underline"
            >
              Kullanım Koşulları
            </a>
            {" ve "}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="auth-link hover-underline"
            >
              Gizlilik Politikası
            </a>
            &apos;nı okudum, onaylıyorum.
          </span>
        </label>
        {state.fieldErrors?.kvkk && (
          <p className="text-[11px] text-[#FF3D71]">{state.fieldErrors.kvkk}</p>
        )}

        <p className="text-[11px] text-neutral-500 leading-relaxed">
          AIMLO ekranını okur, oyuna müdahale etmez — hile değildir, ban riski yoktur.{" "}
          <a
            href="/guvenlik"
            target="_blank"
            rel="noopener noreferrer"
            className="auth-link hover-underline"
          >
            Güvenlik &amp; SSS
          </a>
        </p>

        {state.error && !state.fieldErrors && (
          <div className="rounded-xl bg-[#FF3D71]/[0.06] border border-[#FF3D71]/15 px-4 py-3 animate-scale-in">
            <p className="text-xs text-[#FF3D71] font-semibold">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-neon w-full rounded-xl py-4 text-sm mt-3 disabled:opacity-60 disabled:cursor-wait"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#030711]/30 border-t-[#030711]" />
              Gönderiliyor...
            </span>
          ) : (
            "Kayıt Ol"
          )}
        </button>
      </form>
    </div>
  );
}
