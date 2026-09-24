import { TELEMETRY_EVENT_TYPES } from "@/lib/telemetry-types";

/**
 * GET /api/version — CANLI telemetri sözleşmesi (FB04 · F39, 2026-09-24).
 *
 * NEDEN VAR: masaüstünün "desktop backend'den önde olamaz" kilitleri (telemetry.rs
 * desktop_tipleri_backend_listesinde_var, scripts/test-api-contract.ts [3]) geliştiricinin
 * YEREL backend kopyasına bakıyor. Yerel kopya prod'un onlarca commit önündeyken hepsi
 * yeşil kalıp prod 5 tipi (app_open, login_ok, watch_started, watch_stopped, rig_profile)
 * `invalid_type` ile sessizce düşürebiliyordu (A006 sınıfı). origin/main kontrolü de
 * "push edildi ama Vercel build'i düştü / rollback yapıldı" durumunu yakalamaz. Bu uç,
 * DEPLOY EDİLMİŞ kodun kabul ettiği tip listesini döndürür; masaüstü release kapısı
 * (aimlo-desktop scripts/check-telemetry-prod.mjs, release 0t adımı) bunu yoklar ve
 * CANONICAL_KIND_LIST'in tamamı burada yoksa release'i durdurur.
 *
 * ── CLAUDE.md "tüm route'lar auth + rate-limit" KURALININ BİLİNÇLİ İSTİSNASI ──
 * Kimlik ve rate-limit YOK, çünkü (security-auditor kontrol listesiyle gözden geçirildi):
 *  - Yanıt DERLEME ZAMANINDA sabit: `dynamic = "force-static"` → Next 16 bu GET'i build'de
 *    önceden üretir (node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
 *    "Caching"; 02-guides/caching-without-cache-components.md `dynamic`). İstek başına
 *    fonksiyon ÇALIŞMAZ → DB/AI/Upstash çağrısı yok, maliyet ya da DoS yüzeyi yok.
 *  - PII YOK, kullanıcıya özgü hiçbir şey yok: yalnız telemetri tip adları (zaten
 *    dağıtılan masaüstü ikilisinde düz metin) ve sabit bir sözleşme sürümü.
 *  - Commit SHA / ortam / env DÖNDÜRÜLMEZ (sürüm parmak izi vermemek için; masaüstü kapısı
 *    commit alanını opsiyonel okur, yoksa "?" yazar).
 *  - İstekten hiçbir girdi okunmaz (header/query/body yok) → enjeksiyon yüzeyi yok.
 *  - Yalnız GET: diğer metotlar Next tarafından 405.
 * Bu ucu dinamik yapmak, girdi okumak ya da buraya sır/kimlik/sürüm SHA'sı eklemek bu
 * istisnayı GEÇERSİZ kılar — o zaman auth + rate-limit şarttır.
 */
export const dynamic = "force-static";

/** Masaüstü↔backend tel sözleşmesinin sürümü. Alan adı/şekli kıran (additive OLMAYAN)
 *  bir değişiklikte artır; additive değişiklikte DOKUNMA. */
const API_CONTRACT = 1;

export function GET() {
  return Response.json({ telemetryTypes: TELEMETRY_EVENT_TYPES, contract: API_CONTRACT });
}
