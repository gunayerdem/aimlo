"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-runs the server component every `seconds` (router.refresh) — used by the
 * live feed. Only active while the tab is visible (no background polling). */
export function AutoRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
