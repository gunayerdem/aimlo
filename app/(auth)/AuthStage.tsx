"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 3D tilt sahnesi — auth kartı imlece doğru hafifçe eğilir (perspektif).
 * Yalnızca fare hareketinde tetiklenir; kullanıcı yazarken (fare sabit)
 * kart durur, yani input'lar oynamaz. prefers-reduced-motion'a saygılıdır.
 */
export default function AuthStage({ children }: { children: ReactNode }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Unmount'ta bekleyen rAF'ı temizle (sayfa geçişlerinde hijyen).
  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = tiltRef.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    const ry = px * 6;
    const rx = -py * 6;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
  }

  function handleLeave() {
    const el = tiltRef.current;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div
      className="auth-stage relative z-10"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div ref={tiltRef} className="auth-tilt">
        {children}
      </div>
    </div>
  );
}
