"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, type DeleteState } from "./actions";

const initial: DeleteState = { ok: false };

export function DeleteForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, initial);
  const [confirmText, setConfirmText] = useState("");

  // Case-insensitive (Turkish dotted İ is fragile on non-TR keyboards) +
  // accept "SIL" / "sil" / "Sil" / "SİL". Server still requires the
  // canonical "SİL" but we coerce here before submit so users on EN
  // layouts aren't blocked.
  const normalized = confirmText.trim().toLocaleUpperCase("tr-TR");
  const ready = normalized === "SİL" || normalized === "SIL";

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
          type="text"
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full rounded-xl border border-[#FF3D71]/30 bg-[#0a0f1e]/90 px-4 py-3 text-sm text-white outline-none focus:border-[#FF3D71] focus:ring-2 focus:ring-[#FF3D71]/20"
        />
        {/* Submit the normalized value so the server always sees "SİL"
            even if the user typed "sil" / "SIL" / "Sil" on a non-TR
            keyboard. The visible input has no `name` so it doesn't get
            included in the FormData. */}
        <input type="hidden" name="confirm" value={ready ? "SİL" : confirmText} />
      </div>

      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl bg-[#FF3D71]/[0.08] border border-[#FF3D71]/20 px-4 py-3"
        >
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
