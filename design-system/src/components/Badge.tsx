import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  /** Sol taraftaki küçük iris-kapsül etiket (opsiyonel), örn. "YENİ" */
  tag?: string;
}

/** Iris-kapsül rozet. Opsiyonel sol etiketle (pill-tag). */
export function Badge({ children, tag }: BadgeProps) {
  return (
    <span className="pill-badge">
      {tag ? <span className="pill-tag">{tag}</span> : null}
      {children}
    </span>
  );
}
