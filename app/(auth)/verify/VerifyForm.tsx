"use client";

import {
  forwardRef,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import {
  resendAction,
  verifyAction,
  type ResendState,
  type VerifyState,
} from "./actions";

const initialVerify: VerifyState = { ok: false };
const initialResend: ResendState = { ok: false };

const VALID_CHAR_RE = /[0-9]/;

function cleanString(input: string, max: number): string {
  return input
    .split("")
    .filter((c) => VALID_CHAR_RE.test(c))
    .join("")
    .slice(0, max);
}

export function VerifyForm({
  email,
  purpose,
}: {
  email: string;
  purpose: "register" | "login";
}) {
  const [verifyState, verifyDoAction, verifyPending] = useActionState(
    verifyAction,
    initialVerify,
  );
  const [resendState, resendDoAction, resendPending] = useActionState(
    resendAction,
    initialResend,
  );

  const [chars, setChars] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const code = chars.join("");

  // Resend countdown timer (60s after each successful resend).
  // Tracked off the action's identity (we trip every time resendState
  // changes AND it carries `resent: true`); ref-gated so a second resend
  // in the same session resets the timer instead of getting swallowed
  // because resendState.resent stays true.
  //
  // The setState-inside-useEffect pattern is the canonical way to react
  // to useActionState transitions in React 19. The `react-hooks/set-state-
  // in-effect` rule treats the pattern as suspicious to catch render
  // loops; here the dep + ref-gate guarantees it fires at most once per
  // action result. Disable for this single line with the rationale
  // captured here.
  const [resendCooldown, setResendCooldown] = useState(0);
  const lastResendStateRef = useRef<ResendState | null>(null);
  useEffect(() => {
    if (resendState.resent && resendState !== lastResendStateRef.current) {
      lastResendStateRef.current = resendState;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResendCooldown(60);
    }
  }, [resendState]);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(
      // eslint-disable-next-line react-hooks/set-state-in-effect
      () => setResendCooldown((c) => c - 1),
      1000,
    );
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function setCharAt(i: number, val: string) {
    setChars((cur) => {
      const next = [...cur];
      next[i] = val;
      return next;
    });
  }

  function focusAt(i: number) {
    if (i < 0 || i > 5) return;
    refs.current[i]?.focus();
    refs.current[i]?.select();
  }

  function handleChange(i: number, raw: string) {
    const clean = cleanString(raw, 6 - i);
    if (clean.length === 0) {
      setCharAt(i, "");
      return;
    }
    if (clean.length === 1) {
      setCharAt(i, clean);
      if (i < 5) focusAt(i + 1);
    } else {
      setChars((cur) => {
        const next = [...cur];
        for (let k = 0; k < clean.length && i + k < 6; k++) {
          next[i + k] = clean[k];
        }
        return next;
      });
      const target = Math.min(i + clean.length, 5);
      setTimeout(() => focusAt(target), 0);
    }
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (chars[i] === "" && i > 0) {
        e.preventDefault();
        focusAt(i - 1);
        setCharAt(i - 1, "");
      }
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      focusAt(i + 1);
    }
  }

  function handleFormPaste(e: ClipboardEvent<HTMLFormElement>) {
    const text = cleanString(e.clipboardData.getData("text"), 6);
    if (text.length < 2) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setChars(next);
    setTimeout(() => focusAt(Math.min(text.length, 5)), 0);
  }

  return (
    <div className="auth-card rounded-2xl p-7 sm:p-9 relative">
      <div aria-hidden className="auth-hairline" />

      <form
        action={verifyDoAction}
        onPaste={handleFormPaste}
        className="space-y-6"
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="code" value={code} />

        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {[0, 1, 2].map((i) => (
            <CharBox
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={chars[i]}
              onChange={(v) => handleChange(i, v)}
              onKeyDown={(e) => handleKey(i, e)}
              autoFocus={i === 0}
              ariaLabel={`Kodun ${i + 1}. karakteri`}
              hasError={!!verifyState.error}
            />
          ))}
          <span
            aria-hidden
            className="mx-1 text-[#A855F7]/45 text-3xl font-black select-none leading-none"
          >
            –
          </span>
          {[3, 4, 5].map((i) => (
            <CharBox
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={chars[i]}
              onChange={(v) => handleChange(i, v)}
              onKeyDown={(e) => handleKey(i, e)}
              ariaLabel={`Kodun ${i + 1}. karakteri`}
              hasError={!!verifyState.error}
            />
          ))}
        </div>

        {verifyState.error && (
          <div className="rounded-xl bg-[#FF3D71]/[0.06] border border-[#FF3D71]/15 px-4 py-3 animate-scale-in">
            <p className="text-xs text-[#FF3D71] font-semibold text-center" role="alert">
              {verifyState.error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={verifyPending || code.length !== 6}
          className="btn-neon w-full rounded-xl py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifyPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#030711]/30 border-t-[#030711]" />
              Doğrulanıyor...
            </span>
          ) : (
            "Doğrula ve Devam Et"
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-white/[0.05]">
        <form action={resendDoAction} className="text-center">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="purpose" value={purpose} />
          {resendCooldown > 0 ? (
            <p className="text-[12px] text-neutral-600">
              Yeni kod talep etmek için{" "}
              <span className="text-neutral-400 font-mono">
                {resendCooldown}s
              </span>{" "}
              bekle
            </p>
          ) : (
            <button
              type="submit"
              disabled={resendPending}
              className="text-[12px] text-neutral-400 hover:text-[#22D3EE] disabled:opacity-50 transition-colors hover-underline"
            >
              {resendPending
                ? "Yeni kod gönderiliyor..."
                : resendState.resent
                  ? "✓ Yeni kod gönderildi"
                  : "Kod gelmedi mi? Yeni kod gönder"}
            </button>
          )}
          {resendState.error && (
            <p className="mt-2 text-[11px] text-[#FF3D71]" role="alert">
              {resendState.error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

interface CharBoxProps {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  ariaLabel: string;
  autoFocus?: boolean;
  hasError?: boolean;
}

const CharBox = forwardRef<HTMLInputElement, CharBoxProps>(function CharBox(
  { value, onChange, onKeyDown, ariaLabel, autoFocus, hasError },
  ref,
) {
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="one-time-code"
      autoCorrect="off"
      spellCheck={false}
      autoFocus={autoFocus}
      value={value}
      maxLength={6}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={(e) => e.target.select()}
      className="auth-otp"
      data-filled={value ? "true" : undefined}
      data-error={hasError ? "true" : undefined}
    />
  );
});
