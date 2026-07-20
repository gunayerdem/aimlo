"use client";

import { useCallback, useSyncExternalStore } from "react";
import { loadLang, saveLang } from "@/lib/storage";
import type { BlogLang } from "@/lib/blog";

/* ══════════════════════════════════════════════════════════
   BLOG — ZAMAN + DİL KAYNAKLARI
   ──────────────────────────────────────────────────────────
   Her ikisi de React dışı kaynaklar (saat, localStorage), bu
   yüzden useSyncExternalStore ile bağlanır — effect içinde
   senkron setState yok.

   useNow(): SUNUCUDA null döner, istemcide gerçek zaman damgası.
   Böylece "x önce" etiketi statik prerender'a GÖMÜLMEZ; sayfa
   her açıldığında yeniden hesaplanır ve aylar sonra da doğrudur.
   ══════════════════════════════════════════════════════════ */

/* ─── saat ─── */

let nowTick: number | null = null;
let nowTimer: ReturnType<typeof setInterval> | null = null;
const nowListeners = new Set<() => void>();

function subscribeNow(onChange: () => void): () => void {
  // İlk aboneyle birlikte gerçek zamanı yakala — React abonelikten
  // sonra snapshot'ı yeniden okur ve etiket "x önce"ye döner.
  if (nowTick === null) nowTick = Date.now();
  nowListeners.add(onChange);

  if (nowTimer === null) {
    nowTimer = setInterval(() => {
      nowTick = Date.now();
      nowListeners.forEach((fn) => fn());
    }, 60_000);
  }

  return () => {
    nowListeners.delete(onChange);
    if (nowListeners.size === 0 && nowTimer !== null) {
      clearInterval(nowTimer);
      nowTimer = null;
    }
  };
}

const getNowSnapshot = () => nowTick;
const getNowServerSnapshot = (): number | null => null;

/** Dakikada bir tazelenen zaman damgası. Sunucuda null. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeNow, getNowSnapshot, getNowServerSnapshot);
}

/* ─── dil ─── */

const langListeners = new Set<() => void>();

function subscribeLang(onChange: () => void): () => void {
  langListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    langListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/* Dil varsayılanı — localStorage'da `aimlo_lang` YOKKEN kullanılır.
   Ana sayfa (app/page.tsx, `loadLang() || "en"`) ile AYNI olmak ZORUNDA:
   aksi hâlde ilk kez gelen ziyaretçi ana sayfayı İngilizce, /blog'u
   Türkçe görür. Burayı değiştirirsen orayı da değiştir. */
const DEFAULT_LANG: BlogLang = "en";

const getLangSnapshot = (): BlogLang => loadLang() ?? DEFAULT_LANG;
const getLangServerSnapshot = (): BlogLang => DEFAULT_LANG;

/** Site geneliyle paylaşılan dil tercihi (lib/storage → aimlo_lang). */
export function useBlogLang(): [BlogLang, (l: BlogLang) => void] {
  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getLangServerSnapshot,
  );
  const setLang = useCallback((l: BlogLang) => {
    saveLang(l);
    langListeners.forEach((fn) => fn());
  }, []);
  return [lang, setLang];
}
