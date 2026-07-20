/* AIMLO IRIS gözü — fiyatlandırma sayfasının canlı arka planı.
 *
 * softi (2026-07-20): "bizim logo (oynayan göz bebeği ile birlikte) koy
 * arka plana, aynı tarz olsun, boş duruyo, canlandır animasyonlarla".
 *
 * Server component — durum yok, saf sunum. Animasyonlar tamamen CSS
 * (globals.css .pr-eye-*): dış halka 90 sn'de bir tur döner, göz bebeği
 * 17 sn'lik serbest gezinme yapar, arkadaki hâle nefes alır. Opaklık
 * bilinçli olarak çok düşük (%4-8) — metnin okunurluğunu bozmamalı.
 * pointer-events:none → tıklamalar içeriğe geçer.
 */
export function PricingBackdrop() {
  return (
    <div className="pr-backdrop" aria-hidden="true">
      <div className="pr-eye-wrap" style={{ width: 620, height: 620 }}>
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
            opacity: 0.09,
          }}
          draggable={false}
        />
        {/* eslint-enable @next/next/no-img-element */}
      </div>
    </div>
  );
}
