/** AIMLO+ artı işareti — marka renk temasında.
 *
 * softi (2026-07-20): "o tik yerine + işaretimiz olsun bizim renk temalarında olsun".
 *
 * NEDEN SVG/gradyan-metin DEĞİL de iki çubuk:
 * 1. `-webkit-background-clip: text` + transform'lu ata = bant sorunu. Bu tablo
 *    `.pr-rise` içinde ve o `translateY(34px)` uyguluyor — gradyan başlıkta
 *    yaşadığımız glitch'in tam deseni. Arka plan gradyanı (metin kırpma DEĞİL)
 *    bu sorundan etkilenmez.
 * 2. SVG <linearGradient> her hücrede tekrar render edilince id çakışır
 *    (aynı id onlarca kez → geçersiz HTML, tarayıcıya göre değişen sonuç).
 *
 * İki ton var, çünkü tablo iki sütun:
 *  - "brand": AIMLO+ sütunu — iris tayfı (kızıl→pembe→magenta) + hafif hâle
 *  - "muted": Ücretsiz sütun — aynı biçim, nötr ton. Özellik VAR ama parlamıyor.
 * Fark böyle görünür oluyor; iki sütun da beyaz tik olunca tablo hiçbir şey
 * anlatmıyordu.
 */

/** İris tayfı — globals.css'teki --iris-* değişkenleriyle aynı. */
const BRAND_GRADIENT = "linear-gradient(135deg, #FF4655 0%, #FF5E8A 55%, #E14DDA 100%)";
const MUTED_FILL = "rgba(238, 240, 248, 0.34)";

export function PlusMark({
  tone = "brand",
  size = 13,
}: {
  tone?: "brand" | "muted";
  size?: number;
}) {
  const isBrand = tone === "brand";
  const bar = isBrand ? BRAND_GRADIENT : MUTED_FILL;
  const thickness = Math.max(2, Math.round(size * 0.23));

  return (
    <span
      aria-hidden="true"
      className="relative inline-block shrink-0"
      style={{
        width: size,
        height: size,
        /* Hâle yalnız marka tonunda — ücretsiz sütun sakin kalsın. */
        filter: isBrand ? "drop-shadow(0 0 6px rgba(255, 70, 85, 0.45))" : undefined,
      }}
    >
      {/* dikey çubuk */}
      <span
        className="absolute left-1/2 top-0 h-full -translate-x-1/2 rounded-full"
        style={{ width: thickness, background: bar }}
      />
      {/* yatay çubuk */}
      <span
        className="absolute left-0 top-1/2 w-full -translate-y-1/2 rounded-full"
        style={{ height: thickness, background: bar }}
      />
    </span>
  );
}

/** Tablo hücresi sarmalayıcısı — artı işaretini ortalar, ekran okuyucuya
 *  anlamlı metin verir (görsel işaret aria-hidden). */
export function PlusCell({ tone = "brand", label }: { tone?: "brand" | "muted"; label: string }) {
  return (
    <span className="inline-flex items-center justify-center">
      <PlusMark tone={tone} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Kelime işareti: "AIMLO" düz + "+" marka renginde.
 *
 *  Buradaki "+" DÜZ RENK, gradyan değil — bilerek. Bu bileşen `.pr-hero`
 *  gibi transform'lu kaplarda kullanılıyor ve gradyan-metin (background-clip)
 *  orada bant yapıyor (yukarıdaki nota bak). Tek karakterlik bir "+"da
 *  gradyan zaten görsel olarak fark edilmez; kızıl ember hem güvenli hem net.
 *
 *  DİKKAT: yalnız JSX yüzeylerinde kullanılır. Düz metin gereken yerlerde
 *  (Next metadata, API hata mesajı, hukuki sözleşme, e-posta gövdesi)
 *  lib/brand.ts'teki PRODUCT_NAME sabiti kullanılır — bileşen DEĞİL. */
export function AimloPlus({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      AIMLO
      <span style={{ color: "#FF4655" }}>+</span>
    </span>
  );
}
