import type { ReactNode } from "react";

export interface FeatureIconProps {
  /** İkon (ör. bir <svg> ya da emoji-olmayan glyph bileşeni) */
  children: ReactNode;
}

/** Iris-chip özellik ikonu — kart hover'unda iris'e döner. */
export function FeatureIcon({ children }: FeatureIconProps) {
  return <div className="feature-icon">{children}</div>;
}
