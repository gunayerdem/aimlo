"use client";

import { useEffect, useRef } from "react";

/**
 * Auth sahnesini çerçeveleyen 3D ajanlar — landing hero diliyle aynı.
 * Jett (sol) + Neon (sağ) fullportrait'leri, imlece göre hafif parallax
 * (derinlik hissi) + iris glow. lg altında gizli (mobilde kartı ezmez).
 * Resmi Riot render'ları (companion-app standardı) — telif-güvenli.
 */
const JETT = "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png";
const NEON = "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/fullportrait.png";

export default function AuthAgents() {
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function onMove(e: MouseEvent) {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (leftRef.current) leftRef.current.style.transform = `translate3d(${px * 18}px, ${py * 12}px, 0)`;
        if (rightRef.current) rightRef.current.style.transform = `translate3d(${px * -18}px, ${py * 12}px, 0)`;
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] hidden xl:block overflow-hidden">
      {/* eslint-disable @next/next/no-img-element */}
      <img
        ref={leftRef}
        src={JETT}
        alt=""
        draggable={false}
        className="auth-agent absolute bottom-0 left-[-3%] select-none"
        style={{ height: "min(82vh, 760px)", width: "auto", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)" }}
      />
      <img
        ref={rightRef}
        src={NEON}
        alt=""
        draggable={false}
        className="auth-agent auth-agent-r absolute bottom-0 right-[-3%] select-none"
        style={{ height: "min(82vh, 760px)", width: "auto", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)" }}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
