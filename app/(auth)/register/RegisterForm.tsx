"use client";

import { useActionState, useState } from "react";
import { registerAction, type RegisterState } from "./actions";

const initial: RegisterState = { ok: false };

const inputCls =
  "w-full rounded-xl border border-white/[0.06] bg-[#0a0f1e]/90 px-4 py-4 text-sm text-white outline-none transition-all duration-300 focus:border-[#FF4655]/25 focus:ring-2 focus:ring-[#FF4655]/10 focus:shadow-[0_0_20px_rgba(255,70,85,0.05)] placeholder-neutral-600";

const labelCls =
  "mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  return (
    <div className="card-glow rounded-2xl p-7 sm:p-9 relative">
      <div
        aria-hidden
        className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#FF4655]/20 to-transparent"
      />

      {/* autoComplete="off" + 1Password/Chrome adres-defteri bypass:
          - given-name/family-name/username/email otomatik doldurmayı tetikler
          - non-standard değerler ("nope-*") + autoCorrect/autoCapitalize off
          - sadece password manager için new-password aktif kalıyor */}
      <form action={action} noValidate autoComplete="off" className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first" className={labelCls}>İsim</label>
            <input
              id="reg-first"
              name="firstName"
              type="text"
              autoComplete="nope-first"
              data-1p-ignore="true"
              data-lpignore="true"
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
            <label htmlFor="reg-last" className={labelCls}>Soyisim</label>
            <input
              id="reg-last"
              name="lastName"
              type="text"
              autoComplete="nope-last"
              data-1p-ignore="true"
              data-lpignore="true"
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
          <label htmlFor="reg-username" className={labelCls}>Kullanıcı Adı</label>
          <input
            id="reg-username"
            name="username"
            type="text"
            autoComplete="nope-username"
            data-1p-ignore="true"
            data-lpignore="true"
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
          <label htmlFor="reg-email" className={labelCls}>E-posta</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="nope-email"
            data-1p-ignore="true"
            data-lpignore="true"
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
          <label htmlFor="reg-pw" className={labelCls}>Şifre</label>
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-[#FF6B77] transition"
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {state.fieldErrors?.password && (
            <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-pw2" className={labelCls}>Şifre Tekrar</label>
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-[#FF6B77] transition"
            >
              {showPw2 ? "🙈" : "👁️"}
            </button>
          </div>
          {state.fieldErrors?.passwordConfirm && (
            <p className="mt-1.5 text-[11px] text-[#FF3D71]">{state.fieldErrors.passwordConfirm}</p>
          )}
        </div>

        <label
          htmlFor="reg-kvkk"
          className="flex items-start gap-3 cursor-pointer select-none pt-1"
        >
          <input
            id="reg-kvkk"
            name="kvkk"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#FF4655] rounded border border-white/15 bg-[#0a0f1e]"
          />
          <span className="text-[12px] text-neutral-400 leading-relaxed">
            <a
              href="/legal/kvkk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4655] hover:text-[#FF6B77]/70 hover-underline"
            >
              KVKK Aydınlatma Metni
            </a>
            {", "}
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4655] hover:text-[#FF6B77]/70 hover-underline"
            >
              Kullanım Koşulları
            </a>
            {" ve "}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4655] hover:text-[#FF6B77]/70 hover-underline"
            >
              Gizlilik Politikası
            </a>
            'nı okudum, onaylıyorum.
          </span>
        </label>
        {state.fieldErrors?.kvkk && (
          <p className="text-[11px] text-[#FF3D71]">{state.fieldErrors.kvkk}</p>
        )}

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
