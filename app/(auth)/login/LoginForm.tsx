"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { ok: false };

const inputCls =
  "w-full rounded-xl border border-white/[0.06] bg-[#0a0f1e]/90 px-4 py-4 text-sm text-white outline-none transition-all duration-300 focus:border-[#FF4655]/25 focus:ring-2 focus:ring-[#FF4655]/10 focus:shadow-[0_0_20px_rgba(255,70,85,0.05)] placeholder-neutral-600";

const labelCls =
  "mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4655]/35";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="card-glow rounded-2xl p-7 sm:p-9 relative">
      <div
        aria-hidden
        className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#FF4655]/20 to-transparent"
      />

      <form action={action} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-id" className={labelCls}>
            E-posta veya Kullanıcı Adı
          </label>
          <input
            id="login-id"
            name="identifier"
            type="text"
            autoComplete="username"
            inputMode="email"
            required
            maxLength={254}
            defaultValue={state.values?.identifier}
            aria-invalid={state.error ? true : undefined}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="login-pw" className={labelCls}>
            Şifre
          </label>
          <div className="relative">
            <input
              id="login-pw"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={72}
              aria-invalid={state.error ? true : undefined}
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
        </div>

        <div className="flex justify-end -mt-1">
          <Link
            href="/forgot-password"
            className="text-[11px] text-neutral-500 hover:text-[#FF6B77] transition hover-underline"
          >
            Şifremi unuttum
          </Link>
        </div>

        {state.error && (
          <div className="rounded-xl bg-[#FF3D71]/[0.06] border border-[#FF3D71]/15 px-4 py-3 animate-scale-in">
            <p className="text-xs text-[#FF3D71] font-semibold">{state.error}</p>
            {state.needsVerification && (
              <Link
                href={`/verify?email=${encodeURIComponent(state.needsVerification.email)}&purpose=register`}
                className="mt-2 inline-block text-[12px] text-[#FF4655] font-black hover:text-[#FF6B77]/70 hover-underline"
              >
                E-postanı doğrula →
              </Link>
            )}
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
              Giriş yapılıyor...
            </span>
          ) : (
            "Giriş Yap"
          )}
        </button>
      </form>
    </div>
  );
}
