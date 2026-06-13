"use client";

import { useActionState, useState } from "react";
import { resetAction, type ResetState } from "./actions";

const initial: ResetState = { ok: false };

const inputCls = "auth-input";

const labelCls = "auth-label";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(resetAction, initial);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  return (
    <div className="auth-card rounded-2xl p-7 sm:p-9 relative">
      <div aria-hidden className="auth-hairline" />

      <form action={action} noValidate className="space-y-5">
        <div>
          <label htmlFor="reset-pw" className={labelCls}>YENI ŞIFRE</label>
          <div className="relative">
            <input
              id="reset-pw"
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
          <label htmlFor="reset-pw2" className={labelCls}>YENI ŞIFRE TEKRAR</label>
          <div className="relative">
            <input
              id="reset-pw2"
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
              Kaydediliyor...
            </span>
          ) : (
            "Şifreyi Güncelle"
          )}
        </button>
      </form>
    </div>
  );
}
