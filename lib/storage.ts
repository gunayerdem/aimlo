/* ══════════════════════════════════════════════════════════
   AIMLO — LocalStorage Helpers
   ══════════════════════════════════════════════════════════ */
import type { DraftState, Lang } from "@/types";

const LS_KEYS = {
  draft: "aimlo_draft",
  lang: "aimlo_lang",
};

export function saveDraft(d: DraftState) {
  try {
    localStorage.setItem(LS_KEYS.draft, JSON.stringify(d));
  } catch {}
}

export function loadDraft(): DraftState | null {
  try {
    const s = localStorage.getItem(LS_KEYS.draft);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(LS_KEYS.draft);
  } catch {}
}

export function saveLang(l: Lang) {
  try {
    localStorage.setItem(LS_KEYS.lang, l);
  } catch {}
}

export function loadLang(): Lang | null {
  try {
    return localStorage.getItem(LS_KEYS.lang) as Lang | null;
  } catch {
    return null;
  }
}
