import type { ReactNode } from "react";

export interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

/** Iris-spektrum gradyan metin (başlık vurgusu için). */
export function GradientText({ children, className = "" }: GradientTextProps) {
  return <span className={`gradient-text ${className}`.trim()}>{children}</span>;
}
