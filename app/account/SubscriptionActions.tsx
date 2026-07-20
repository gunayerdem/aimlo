"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscriptionAction } from "./actions";

/** İptal, PARA ile ilgili ve geri alınması sağlayıcıya bağlı bir işlem —
 *  bu yüzden tek tıkla değil, açık onay adımıyla. */
export function SubscriptionActions({
  cancelAtPeriodEnd,
  periodEnd,
}: {
  cancelAtPeriodEnd: boolean;
  periodEnd: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (cancelAtPeriodEnd) {
    return (
      <p className="rounded-lg border border-white/[0.08] bg-black/20 p-4 text-[13px] leading-relaxed text-neutral-400">
        Aboneliğin <strong className="text-white">{periodEnd}</strong> tarihinde sona erecek.
        O güne kadar tüm AIMLO+ özelliklerini kullanmaya devam edebilirsin. Fikrini
        değiştirirsen{" "}
        <a href="mailto:support@aimlo.gg" className="text-[#FF4655] hover:underline">support@aimlo.gg</a>{" "}
        üzerinden yeniden başlatabiliriz.
      </p>
    );
  }

  async function cancel() {
    setBusy(true);
    setErr(null);
    try {
      // Server Action — cookie oturumu doğal çalışır + Next'in yerleşik
      // Origin doğrulaması CSRF'i kapatır (güvenlik denetimi C1/L1).
      const res = await cancelSubscriptionAction();
      if (!res.ok) {
        setErr(res.error ?? "İptal işlemi tamamlanamadı. Lütfen tekrar dene.");
        return;
      }
      router.refresh();
    } catch {
      setErr("Bağlantı sorunu — lütfen tekrar dene.");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-3">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="text-[13px] font-semibold text-neutral-500 underline-offset-4 transition hover:text-red-400 hover:underline"
        >
          Aboneliği iptal et
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-red-500/25 bg-red-500/[0.06] p-4">
          <p className="text-[13px] leading-relaxed text-neutral-300">
            Aboneliğin <strong className="text-white">{periodEnd}</strong> tarihine kadar
            açık kalır, o tarihte sona erer. Ödediğin dönem için iade yapılmaz — süresini
            sonuna kadar kullanırsın.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={cancel}
              disabled={busy}
              className="rounded-lg bg-red-500/90 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {busy ? "İptal ediliyor…" : "Evet, iptal et"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="rounded-lg border border-white/[0.14] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
      {err && <p className="text-[12px] text-red-400">{err}</p>}
    </div>
  );
}
