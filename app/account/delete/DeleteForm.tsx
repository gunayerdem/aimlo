"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, type DeleteState } from "./actions";

const initial: DeleteState = { ok: false };

export function DeleteForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, initial);
  const [confirmText, setConfirmText] = useState("");

  const ready = confirmText === "SİL";

  return (
    <form action={action} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="confirm-input"
          className="mb-2 block text-[11px] font-bold tracking-wide text-[#FF3D71]"
        >
          Silmek için aşağıdaki kutuya <span className="font-mono">SİL</span> yaz
        </label>
        <input
          id="confirm-input"
          name="confirm"
          type="text"
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full rounded-xl border border-[#FF3D71]/30 bg-[#0a0f1e]/90 px-4 py-3 text-sm text-white outline-none focus:border-[#FF3D71] focus:ring-2 focus:ring-[#FF3D71]/20"
        />
      </div>

      {state.error && (
        <div className="rounded-xl bg-[#FF3D71]/[0.08] border border-[#FF3D71]/20 px-4 py-3">
          <p className="text-xs text-[#FF3D71] font-semibold">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!ready || pending}
        className="w-full rounded-xl bg-[#FF3D71] hover:bg-[#FF5588] active:bg-[#E63862] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 text-sm transition-colors"
      >
        {pending ? "Siliniyor..." : "Hesabımı Kalıcı Olarak Sil"}
      </button>
    </form>
  );
}
