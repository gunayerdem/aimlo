"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

/** Sitenin tepe paneli — ana sayfadakinin taşınabilir hâli.
 *
 * softi (2026-07-20): "tepeye de bizim ana menüde olan tepe panelini koy,
 * o panelde AIMLO yazısı ve gözüne basınca ana menüye gitsin".
 *
 * Ana sayfadaki nav (app/page.tsx) sayfaya gömülü ve o sayfaya özgü
 * durumlara bağlı (scrollTo, dil düğmesi, mobil menü, oturum). Onu olduğu
 * gibi taşımak mümkün değildi; bu, her sayfada çalışan sade sürümü:
 * logo + kelime işareti → ana sayfa. Görsel dil birebir aynı (.nav-xtract,
 * h-16, aynı gradyan).
 *
 * NOT — kelime işaretindeki gradyan `background-clip: text` kullanıyor.
 * Bu desen transform'lu bir ATA içinde bant yapıyor (bkz. PlusMark.tsx
 * ve gradyan-başlık notu). Burada güvenli: panel `fixed` ve sayfanın
 * animasyonlu `<article>`'ının DIŞINDA, kendisi hiç transform almıyor.
 * Panelin içine transform'lu bir sarmalayıcı EKLEME.
 */

const LOGO_SRC = "/aimlo-logo.png?v=3";

/** Logoyu 3B eğen etkileşimli hâli — ana sayfadaki AimloLogo'nun aynısı. */
function TiltLogo({ size = 32 }: { size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const onMove = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = 12;
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    setTilt({
      x: clamp(((e.clientY - cy) / (r.height / 2)) * -max),
      y: clamp(((e.clientX - cx) / (r.width / 2)) * max),
    });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHover(false);
  }, []);

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ perspective: "600px" }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hover ? 1 : 0,
          background:
            "radial-gradient(ellipse at center, rgba(255,70,85,0.15), rgba(77,124,255,0.08), transparent 70%)",
          filter: "blur(20px)",
          transform: "scale(1.5)",
        }}
      />
      {/* next/image DEĞİL: ana sayfadaki logo da <img>; ikisi aynı dosyayı
          aynı biçimde istesin ki tarayıcı önbelleği paylaşılsın. */}
      <img
        src={LOGO_SRC}
        alt=""
        draggable={false}
        className="relative z-10 shrink-0 object-contain"
        style={{
          height: size,
          width: "auto",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hover ? 1.08 : 1})`,
          transition: hover
            ? "transform .15s ease-out, filter .4s ease"
            : "transform .5s cubic-bezier(.16,1,.3,1), filter .5s ease",
          filter: hover
            ? "drop-shadow(0 0 12px rgba(255,70,85,.35)) drop-shadow(0 0 30px rgba(77,124,255,.15))"
            : "drop-shadow(0 0 6px rgba(255,70,85,.1))",
          willChange: "transform, filter",
        }}
      />
    </span>
  );
}

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <>
      <header className="nav-xtract fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          {/* Logo + kelime işareti TEK bağlantı: göze de yazıya da
              basınca ana sayfaya gider (softi'nin isteği). */}
          <Link
            href="/"
            aria-label="AIMLO ana sayfa"
            className="group inline-flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]/70"
          >
            <TiltLogo size={32} />
            <span
              className="text-lg font-black tracking-wider"
              style={{
                background:
                  "linear-gradient(135deg, #00D4FF 0%, #A855F7 50%, #FF4690 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 6px rgba(0,212,255,0.2))",
              }}
            >
              AIMLO
            </span>
          </Link>

          {right}
        </div>
      </header>
      {/* Sabit panelin yüksekliği kadar yer tutucu — içerik panelin
          altında kalmasın. Panel h-16 (64px). */}
      <div aria-hidden="true" className="h-16" />
    </>
  );
}
