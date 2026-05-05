"use client";

import { useMemo } from "react";

/**
 * Mirrors AmbientBg() from app/page.tsx so the auth route group has the
 * same starfield background as the marketing site. Kept as a separate file
 * to avoid pulling app/page.tsx (4.6 kloc) into the (auth) bundle.
 *
 * Particle positions are deterministic to avoid SSR/CSR hydration mismatch.
 */
export default function AuthBg() {
  const particles = useMemo(
    () => [
      { l: 12, t: 8, d: 0.2, dur: 4.2, o: 0.35, s: 2 },
      { l: 87, t: 15, d: 1.1, dur: 5.1, o: 0.3, s: 2.5 },
      { l: 34, t: 22, d: 0.8, dur: 3.8, o: 0.45, s: 1.8 },
      { l: 65, t: 5, d: 2.3, dur: 6.2, o: 0.28, s: 2.2 },
      { l: 8, t: 45, d: 1.5, dur: 4.5, o: 0.4, s: 1.8 },
      { l: 92, t: 38, d: 0.3, dur: 5.5, o: 0.32, s: 2.5 },
      { l: 45, t: 62, d: 3.1, dur: 3.5, o: 0.38, s: 2 },
      { l: 73, t: 75, d: 0.7, dur: 4.8, o: 0.25, s: 3 },
      { l: 22, t: 85, d: 2.0, dur: 5.8, o: 0.42, s: 1.8 },
      { l: 55, t: 92, d: 1.8, dur: 4.1, o: 0.3, s: 2.2 },
      { l: 3, t: 68, d: 0.5, dur: 6.5, o: 0.27, s: 2.5 },
      { l: 78, t: 52, d: 2.8, dur: 3.3, o: 0.36, s: 1.5 },
      { l: 41, t: 35, d: 1.3, dur: 5.3, o: 0.33, s: 2.8 },
      { l: 96, t: 72, d: 3.5, dur: 4.6, o: 0.29, s: 2 },
      { l: 18, t: 18, d: 0.9, dur: 5.9, o: 0.43, s: 2 },
      { l: 60, t: 42, d: 2.5, dur: 3.6, o: 0.31, s: 2.8 },
      { l: 30, t: 55, d: 1.7, dur: 4.3, o: 0.37, s: 1.8 },
      { l: 82, t: 28, d: 3.3, dur: 5.7, o: 0.26, s: 2.5 },
      { l: 50, t: 80, d: 0.1, dur: 4.9, o: 0.39, s: 2.2 },
      { l: 15, t: 95, d: 2.2, dur: 3.9, o: 0.34, s: 2 },
      { l: 5, t: 30, d: 0.4, dur: 5.2, o: 0.28, s: 1.5 },
      { l: 25, t: 12, d: 1.6, dur: 4.4, o: 0.35, s: 2.2 },
      { l: 48, t: 48, d: 2.7, dur: 3.7, o: 0.22, s: 2.8 },
      { l: 70, t: 30, d: 0.9, dur: 6.1, o: 0.4, s: 1.8 },
      { l: 90, t: 60, d: 3.2, dur: 4.0, o: 0.33, s: 2 },
      { l: 38, t: 78, d: 1.4, dur: 5.6, o: 0.29, s: 2.5 },
      { l: 62, t: 18, d: 2.1, dur: 3.4, o: 0.36, s: 1.6 },
      { l: 85, t: 85, d: 0.6, dur: 5.0, o: 0.25, s: 3 },
      { l: 16, t: 58, d: 3.8, dur: 4.7, o: 0.38, s: 1.5 },
      { l: 72, t: 45, d: 1.0, dur: 5.4, o: 0.31, s: 2.2 },
      { l: 43, t: 10, d: 2.4, dur: 3.9, o: 0.42, s: 1.8 },
      { l: 58, t: 70, d: 0.3, dur: 6.3, o: 0.27, s: 2.5 },
      { l: 95, t: 20, d: 1.8, dur: 4.2, o: 0.35, s: 2 },
      { l: 28, t: 42, d: 3.0, dur: 5.1, o: 0.3, s: 1.5 },
      { l: 7, t: 88, d: 2.6, dur: 3.6, o: 0.4, s: 2.2 },
      { l: 68, t: 58, d: 0.8, dur: 4.8, o: 0.33, s: 2.8 },
      { l: 52, t: 25, d: 1.2, dur: 5.5, o: 0.28, s: 1.8 },
      { l: 35, t: 95, d: 3.4, dur: 4.3, o: 0.36, s: 2 },
      { l: 80, t: 10, d: 0.1, dur: 5.8, o: 0.44, s: 1.5 },
      { l: 20, t: 65, d: 2.9, dur: 3.2, o: 0.32, s: 2.5 },
    ],
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            animationDelay: `${p.d}s`,
            animationDuration: `${p.dur}s`,
            opacity: p.o,
            width: `${p.s}px`,
            height: `${p.s}px`,
          }}
        />
      ))}
    </div>
  );
}
