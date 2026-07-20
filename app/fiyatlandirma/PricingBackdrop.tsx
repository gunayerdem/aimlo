/* Fiyatlandırma sayfası arka planı — ana menüdeki uzay teması + IRIS gözü.
 *
 * softi (2026-07-20): "arkadaki göz çok büyük, göz detaylı iyi ama küçük
 * yukarıda olabilir / arka planda bizim ana menüdeki gibi pearl ışıkları ve
 * uzay teması olsun, hafif az yıldızlı da olabilir".
 *
 * Ana menüyle AYNI sınıflar kullanılıyor (globals.css): .hero-orb +
 * .hero-orb-inner (iris aurora "pearl" ışıkları) ve .particle (yıldız tozu).
 * Yeni bir tema icat edilmedi — site tutarlı kalsın.
 *
 * Yıldızlar SABİT konumlu (Math.random YOK): sunucu ve istemci aynı çıktıyı
 * üretmeli, aksi hâlde hydration uyuşmazlığı olur.
 */

/* Yıldız tozu — "hafif az yıldızlı" için 18 tane, dağınık ama dengeli.
   [sol%, üst%, gecikme sn, opaklık] */
const STARS: [number, number, number, number][] = [
  [8, 12, 0.0, 0.5], [17, 34, 1.4, 0.3], [26, 8, 2.6, 0.45],
  [34, 58, 0.8, 0.28], [41, 22, 3.1, 0.5], [49, 74, 1.9, 0.32],
  [56, 16, 2.2, 0.42], [63, 46, 0.4, 0.3], [71, 9, 3.4, 0.48],
  [78, 63, 1.1, 0.26], [85, 28, 2.9, 0.44], [92, 51, 0.6, 0.3],
  [12, 78, 2.4, 0.34], [31, 88, 1.7, 0.28], [58, 92, 3.2, 0.36],
  [74, 82, 0.9, 0.3], [88, 71, 2.1, 0.4], [4, 55, 3.6, 0.26],
];

export function PricingBackdrop() {
  return (
    <div className="pr-backdrop" aria-hidden="true">
      {/* Pearl ışıkları — ana menüdeki iris aurora orb'ları */}
      <div className="hero-orb" style={{ top: "-14%", left: "-12%" }} />
      <div className="hero-orb-inner" style={{ bottom: "-10%", right: "-8%" }} />

      {/* Yıldız tozu */}
      {STARS.map(([l, t, d, o], i) => (
        <span
          key={i}
          className="particle"
          style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s`, opacity: o }}
        />
      ))}

      {/* IRIS gözü — küçültüldü (620 → 300) ve YUKARI alındı */}
      <div className="pr-eye-wrap" style={{ width: 300, height: 300 }}>
        <div className="pr-eye-halo" />
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src="/aimlo-eye-outer.png"
          alt=""
          className="pr-eye-outer"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          draggable={false}
        />
        <img
          src="/aimlo-pupil.png"
          alt=""
          className="pr-eye-pupil"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "26%",
            height: "26%",
            marginTop: "-13%",
            marginLeft: "-13%",
            objectFit: "contain",
            opacity: 0.1,
          }}
          draggable={false}
        />
        {/* eslint-enable @next/next/no-img-element */}
      </div>
    </div>
  );
}
