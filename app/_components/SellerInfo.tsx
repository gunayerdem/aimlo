import { SELLER } from "@/lib/seller";

/** Satıcı künyesi — kompakt, yan yana yerleşim.
 *
 * softi (2026-07-20): "çok yer kaplıyor, bunları yan yana çek, minimalist bir
 * görüntü ver". Önceki hâl her alanı alt alta yazıyordu (7 satır). Şimdi
 * 3 sütunlu ızgara; etiket üstte küçük, değer altında. Mobilde tek sütuna,
 * tablette ikiye iner.
 *
 * MERSİS satırı YOK — adi ortaklıkta MERSİS numarası bulunmaz (bkz. lib/seller.ts).
 */
export function SellerInfo({ compact = false }: { compact?: boolean }) {
  const items: Array<[string, React.ReactNode]> = [
    ["Ticaret unvanı", SELLER.tradeName],
    ["Vergi dairesi", SELLER.taxOffice],
    ["Vergi kimlik no", SELLER.taxNumber],
    ["Adres", SELLER.address],
    [
      "Telefon",
      <a key="tel" href={`tel:${SELLER.phoneHref}`} className="transition hover:text-[#FF6B77]">
        {SELLER.phone}
      </a>,
    ],
    [
      "E-posta",
      <a key="mail" href={`mailto:${SELLER.email}`} className="transition hover:text-[#FF6B77]">
        {SELLER.email}
      </a>,
    ],
  ];

  return (
    <section className={compact ? "space-y-3" : "space-y-3 border-t border-white/10 pt-8"}>
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
        Satıcı bilgileri
      </h2>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[10px] uppercase tracking-wide text-neutral-600">{label}</dt>
            <dd className="mt-0.5 text-[12px] leading-snug text-neutral-300">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
