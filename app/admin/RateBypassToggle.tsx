"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RateBypassToggle({ userId, initial }: { userId: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/rate-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, grant: !on }),
      });
      if (res.ok) {
        setOn(!on);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={toggle} disabled={busy} className={on ? "adm-toggle on" : "adm-toggle"}>
      {busy ? "…" : on ? "✓ Rate-limit muaf" : "Rate-limit muafiyeti ver"}
    </button>
  );
}
