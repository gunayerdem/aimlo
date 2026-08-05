/**
 * P9 regresyon kilidi (2026-08-05): 429 gövdesindeki detail.kind sözleşmesi.
 *
 * NEDEN: desktop (ai_client.rs classify_http_error) 429'u "günlük kota mı,
 * kısa-pencere mi" diye ÖNCE detail.kind ile ayırır; alan yokken yedek yol
 * `message` alanına bakıyordu ama backend metni `error` alanına koyar — yani
 * günlük kota PerIp sanılıp kullanıcı "3600 sn sonra tekrar dene" görüyordu
 * (gerçek: kota UTC gece yarısına kadar kapalı). Bu test, alanın sessizce
 * silinmesini veya yanlış dala bağlanmasını yakalar.
 *
 * Route dosyaları HTTP metotları dışında export edemediği ve checkRateLimit
 * Upstash'e bağlı olduğu için bu bir KAYNAK-YAPI kilididir (aynı desen:
 * test-vision-ctx-sanitize.ts bölüm [5]).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

let fail = 0;
function ok(cond: boolean, label: string) {
  console.log(`  ${cond ? "ok " : "FAIL"} ${label}`);
  if (!cond) fail = 1;
}

const src = readFileSync(join(process.cwd(), "lib", "api-auth.ts"), "utf8");

console.log("[1] 429 gövdesi detail.kind taşıyor (desktop sözleşmesi)");
// isDailyQuota ternary'sine bağlı kind üretimi — birebir yapı.
ok(/detail:\s*\{\s*kind:\s*isDailyQuota\s*\?\s*"daily"\s*:\s*"ip"\s*\}/.test(src),
  'detail.kind = isDailyQuota ? "daily" : "ip" mevcut');
// Service (503) dalına detail bulaşmıyor — spread isService kapısının arkasında.
ok(/\.\.\.\(isService\s*\?\s*\{\}\s*:\s*\{\s*detail:/.test(src),
  "detail yalnız 429'da (isService dalı hariç)");

console.log("[2] Mevcut gövde alanları DEĞİŞMEDİ (eski desktop'lar kırılmaz)");
ok(src.includes('"Daily quota exceeded"'), 'günlük kota metni aynen: "Daily quota exceeded"');
ok(src.includes('"Too many requests. Please wait a moment."'), "kısa-pencere metni aynen");
ok(/retryAfter:\s*rateResult\.retryAfter/.test(src), "retryAfter alanı duruyor");
ok(/"Retry-After":\s*String\(rateResult\.retryAfter\)/.test(src), "Retry-After başlığı duruyor");

console.log("[3] kind kaynakları: reason eşlemesi bozulmadı");
ok(/reason:\s*"daily"/.test(src), 'günlük aşım reason:"daily" üretiyor');
ok(/reason:\s*"rate"/.test(src) && /reason:\s*"ip"/.test(src),
  'kısa-pencere reason:"rate"/"ip" üretiyor (ikisi de kind:"ip" olur)');

if (fail) {
  console.error("\nTEST BAŞARISIZ — P9 sözleşmesi bozulmuş olabilir (lib/api-auth.ts 429 gövdesi).");
  process.exit(1);
}
console.log("\nTÜM TESTLER GEÇTİ ✓");
