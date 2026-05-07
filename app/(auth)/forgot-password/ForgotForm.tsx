"use client";

import { useActionState } from "react";
import { forgotAction, type ForgotState } from "./actions";

const initial: ForgotState = { ok: false };

const inputCls =
  "w-full rounded-xl border border-white/[0.06] bg-[#0a0f1e]/90 px-4 py-4 text-sm text-white outline-none transition-all duration-300 focus:border-[#FF4655]/25 focus:ring-2 focus:ring-[#FF4655]/10 focus:shadow-[0_0_20px_rgba(255,70,85,0.05)] placeholder-neutral-600";

const labelCls =
  "mb-2 block text-[9px] font-black tracking-[0.2em] text-[#FF4655]/35";

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotAction, initial);

  if (state.sent) {
    return (
      <div className="card-glow rounded-2xl p-10 space-y-6 relative">
        <div
          aria-hidden
          className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#FF4655]/20 to-transparent"
        />
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4655]/[0.06] border border-[#FF4655]/15">
          <span className="text-3xl">✉️</span>
          <span
            className="absolute inset-0 rounded-2xl animate-ping bg-[#FF4655]/[0.05]"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed text-center">
          Eğer bu e-posta sistemde kayıtlıysa, sıfırlama linkini gönderdik.
          Gelen kutunu kontrol et — birkaç dakika içinde gelmezse spam&apos;e bak.
        </p>
      </div>
    );
  }

  return (
    <div className="card-glow rounded-2xl p-7 sm:p-9 relative">
      <div
        aria-hidden
        className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#FF4655]/20 to-transparent"
      />

      <form action={action} noValidate className="space-y-5">
        <div>
          <label htmlFor="forgot-email" className={labelCls}>
            E-POSTA
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            aria-invalid={state.error ? true : undefined}
            className={inputCls}
          />
        </div>

        {state.error && (
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
            "Sıfırlama Linki Gönder"
          )}
        </button>
      </form>
    </div>
  );
}
