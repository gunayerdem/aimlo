import { NextRequest, NextResponse } from "next/server";

/**
 * proxy.ts — CSP Report-Only ölçüm katmanı (B62/F92 güvenli dilim; pano dalga, 2026-08-04)
 *
 * NEDEN BU DOSYA `middleware.ts` DEĞİL: Next 16'da `middleware` dosya-konvansiyonu
 * DEPRECATED ve adı `proxy` oldu (node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/proxy.md — ilk not + v16.0.0 changelog satırı). next.config.ts'teki
 * B62 planı da aynı tespiti yapıyor: "öneriyi harfiyen uygulamak yanlış dosyayı yaratırdı".
 *
 * NE YAPAR: sayfa isteklerine Content-Security-Policy-Report-Only header'ı ekler.
 * Bu header, HEDEF (nonce'lu, sertleştirilmiş) script-src politikasını tarayıcıya
 * "uygulama ama ihlalleri /api/csp-report'a POST'la" modunda verir. Böylece launch
 * öncesi canlıda, gerçek trafiği kırmadan, nonce geçişinin tam olarak neyi
 * bozacağını sayarız (denetim panosunun şart koştuğu Report-Only aşaması).
 *
 * BOZMAMA KANITI (softi: "bişey bozma"):
 *  1) Report-Only header TANIMI GEREĞİ hiçbir kaynağı engellemez; tarayıcı yalnız
 *     rapor üretir (MDN: Content-Security-Policy-Report-Only). Render değişmez.
 *  2) next.config.ts'teki ZORLANAN CSP'ye dokunulmadı — o dosya bu pakette salt-oku.
 *  3) Nonce'u BİLEREK yalnız Report-Only YANIT header'ına koyuyoruz; İSTEK
 *     header'ına (x-nonce / Content-Security-Policy) KOYMUYORUZ. Next.js nonce'u
 *     istek header'ındaki CSP'den çıkarıp script'lere uygular ve bu TÜM sayfaları
 *     dinamik render'a zorlar (docs/01-app/02-guides/content-security-policy.md →
 *     "you must use dynamic rendering to add nonces"). Statik üretim + CDN cache
 *     bozulmasın diye o adımı atlıyoruz.
 *  4) Redirect/rewrite YOK — her dalda NextResponse.next() + tek header set.
 *
 * BEKLENEN RAPOR PROFİLİ (bilinçli): nonce hiçbir <script>'e uygulanmadığı için
 * Next'in framework inline script'leri (self.__next_f.push) ve 'strict-dynamic'
 * altındaki parser-inserted chunk'lar HER sayfa görüntülemede ihlal raporlar.
 * Bu gürültü değil, ÖLÇÜMÜN KENDİSİ: raporlar hedef politikanın bugün neyi
 * kıracağının tam envanteri. Veri toplandıktan sonra GERÇEK nonce geçişi
 * (istek header'ı + dinamikleşme maliyeti ölçümü + enforce'a çevirme) AYRI BİR
 * İŞTİR — bkz. next.config.ts B62 "YAPILACAK" planı, adım (a)-(d).
 */
export function proxy(request: NextRequest) {
  // Nonce: 16 rastgele bayt → hex. Web Crypto her iki runtime'da (Node/Edge)
  // global; Buffer bağımlılığı yok. Hex, CSP'nin base64-value gramerinin
  // (ALPHA/DIGIT alt kümesi) içinde kaldığı için geçerli bir nonce değeridir.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

  // Hedef politika = next.config.ts B62 planındaki script-src sertleştirmesi.
  // BİLEREK yalnız script-src + report-uri: zorlanan CSP'nin geri kalanı
  // (img-src, connect-src, ...) zaten enforce ediliyor; onları buraya kopyalamak
  // sinyal katmaz, rapor gürültüsünü büyütür. Tek ölçmek istediğimiz delta,
  // 'unsafe-inline' → 'nonce + strict-dynamic' geçişinin kıracakları.
  // Dev'de 'unsafe-eval' eklenir (Turbopack HMR + React hata yığını; zorlanan
  // CSP ile aynı gerekçe) — dev konsolunu sahte ihlalle doldurmamak için.
  const isDev = process.env.NODE_ENV !== "production";
  const reportOnlyCsp = [
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // report-uri: deprecated ama halen en geniş tarayıcı desteğine sahip yol;
    // Reporting API (report-to + Reporting-Endpoints) geçişi nonce işiyle
    // birlikte ele alınacak. Endpoint: app/api/csp-report/route.ts.
    "report-uri /api/csp-report",
  ].join("; ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy-Report-Only", reportOnlyCsp);
  return response;
}

export const config = {
  // Matcher DAR tutuldu (görev şartı): yalnız sayfa istekleri. API route'ları,
  // Next statik varlıkları, imaj optimizasyonu ve UZANTILI her yol (public/
  // altındaki .png/.svg/.txt vb. — `.*\\..*` kalıbı) HARİÇ; oralarda CSP raporu
  // anlamsız, proxy çalıştırmak yalnız gecikme ekler. Prefetch istekleri de
  // atlanır (docs/01-app/02-guides/content-security-policy.md önerisi birebir).
  // Kalıp notu: matcher path-to-regexp ile derlenir; iç içe (?:...) grupları
  // riskli olduğundan doc'un kendi örneklerindeki basit `.*\\..*` biçimi seçildi.
  // Yan etki: noktalı bir sayfa slug'ı olursa yalnız Report-Only header'ı almaz
  // (ölçüm eksilir, hiçbir şey kırılmaz). favicon/sitemap/robots zaten noktalı
  // ama doc kalıbıyla birebirlik için açıkça da yazıldı.
  // Not: /api hariç tutulduğu için /api/csp-report kendisi bu header'ı ALMAZ —
  // rapor endpoint'inin rapor üretme döngüsü baştan kapalı.
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
