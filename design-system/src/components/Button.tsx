import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** "ember" = Valorant kırmızısı ana CTA (marka sabiti); "ghost" = ikincil cam buton */
  variant?: "ember" | "ghost";
  children: ReactNode;
}

/**
 * AIMLO ana butonu. Ana eylemler DAİMA ember (#FF4655) — marka sabiti.
 * İkincil eylemler için variant="ghost".
 */
export function Button({ variant = "ember", children, className = "", ...rest }: ButtonProps) {
  const base = variant === "ember" ? "btn-neon" : "btn-ghost";
  return (
    <button className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
