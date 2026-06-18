import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  /** "xtract" = 3B tilt + iris kenar ışığı; "glow" = sade glow hover */
  variant?: "xtract" | "glow";
  className?: string;
}

/** IRIS cam kart. Hover'da 3B eğilir ve iris ışığı yakalar. */
export function Card({ children, variant = "xtract", className = "" }: CardProps) {
  const base = variant === "xtract" ? "card-xtract" : "card-glow";
  return <div className={`${base} ${className}`.trim()}>{children}</div>;
}
