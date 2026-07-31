import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRateLimit } from "@/lib/api-auth";
import { sanitizePromptInput } from "@/lib/prompt-safety";
import { createServiceSupabase } from "@/lib/supabase/server";
import { isUuidV4 } from "@/lib/uuid";

/**
 * POST /api/feedback-rating
 *
 * ── KARŞI-DENETİM 2026-07-31 · R8 ONARIMI ────────────────────────────────────
 * NEDEN: bu gece desktop'a 👍/👎 kalite sinyali eklendi (aimlo-desktop
 * src/App.tsx `rateFeedback`, ~1915: `POST https://aimlo.gg/api/feedback-rating`)
 * ama backend'de KARŞILIĞI YOKTU. Sonuç: her istek 404 dönüyordu, sinyal
 * sessizce kayboluyordu, UI ise "Geri bildirimin kaydedildi" diyordu — yani
 * SAHTE BAŞARI sinyali. Bu route o eksik ucu kapatır; sözleşme desktop'ta
 * yazılmış olduğu için alan adları BİREBİR oradan alındı (aşağıdaki Body).
 *
 * KRİTİK — CORS: bu çağrı Rust reqwest'ten DEĞİL, WebView2 içindeki düz
 * `fetch`'ten geliyor (tauri:// origin → cross-origin). Bu yüzden AI route
 * kalıbı DEĞİL, app/api/support/route.ts kalıbı uygulandı: CORS başlıkları +
 * OPTIONS preflight ŞART, yoksa tarayıcı isteği hiç göndermez ve regresyon
 * (sinyal kaybı) aynen sürer. Başlıklar HER yanıt yolunda damgalanır — 4xx ve
 * verifyAuthAndRateLimit'in 401/429'u dâhil.
 *
 * Body (desktop `rateFeedback` → `{ ratingKey, rating, ...meta }`):
 *   {
 *     ratingKey: string,                 // "report:<uuid>" | "round:<uuid>:<n>"
 *                                        // | "live-report:<map>:<score>" | "live-round:<map>:<n>"
 *     rating:    "up" | "down",
 *     scope?:    "round" | "report",
 *     matchId?:  string (uuid v4),       // canlı maç kartlarında YOK (henüz kayıt yok)
 *     round?:    number,
 *     map?:      string,
 *     agent?:    string
 *   }
 * Response: { ok: true } | { ok: false, error: string }  (camelCase, yapısal).
 *
 * Güvenlik:
 *   - Auth (Supabase JWT) + per-user/per-IP rate-limit → verifyAuthAndRateLimit.
 *     Route anahtarı "telemetry" (60/dk, 1000/gün): yeni bir tier EKLENMEDİ
 *     (lib/api-auth.ts bu pakette DEĞİL) ve mevcut anahtarlar içinde tek doğru
 *     büyüklük bu. "support" (5/dk) olsaydı 13 round'luk kayıtlı bir maçı
 *     puanlayan kullanıcı 429 yerdi → sinyal yine kaybolurdu; "telemetry"
 *     semantik olarak da en yakını (PII'siz, hafif olay sinyali).
 *   - user_id DOĞRULANMIŞ JWT'den alınır, gövdeden ASLA.
 *   - Serbest metin alanları (ratingKey/map/agent) lib/prompt-safety'den
 *     geçirilir + sert uzunluk tavanı: bu satırlar ileride /admin'de
 *     gösterilecek → derinlemesine savunma (stored-XSS/injection).
 *   - INSERT service-role ile (server-only); anahtar tarayıcıya ASLA gitmez.
 *     Tablo RLS'te kapalı (revoke all) — supabase/0017_feedback_rating.sql.
 *
 * DB yazımı BEKLENİR (after()/fire-and-forget DEĞİL) ve hata YAPISAL 503
 * döner. NEDEN: R8'in özü zaten "sahte başarı"ydı; yazma başarısızken ok:true
 * demek aynı günahı sunucu tarafında tekrarlardı. Maliyeti yok — tek küçük
 * upsert. Kullanıcı tarafı ZATEN bloklanmıyor: desktop çağrıyı 10 sn'lik
 * AbortController ile fire-and-forget atıyor ve seçimi önce localStorage'a
 * yazıyor, yani yanıtı beklemiyor.
 *
 * NOT: supabase/0017_feedback_rating.sql UYGULANMADI — softi elle koşacak.
 * Tablo yokken insert patlar ve dürüstçe 503 döneriz (uydurma başarı yok).
 */

// Tek küçük INSERT, AI yok — dar Vercel bütçesi.
export const maxDuration = 10;

const MAX_PAYLOAD_BYTES = 4_000; // ~2KB'lık bir gövdenin iki katı, fazlasıyla yeter.
const MAX_KEY_CHARS = 200;       // "round:<uuid>:<n>" ~45 char; kötü niyetli şişmeye tavan.
const MAX_LABEL_CHARS = 48;      // harita/ajan adı — en uzunu ~12 char.
const MAX_ROUND = 99;            // Valorant OT dâhil ~30'u geçmez; 99 güvenli tavan.

// CORS — support/route.ts ile BİREBİR aynı desen. Wildcard ACAO burada güvenli:
// kimlik doğrulama Authorization başlığındaki Bearer token (ortam kimlik bilgisi
// yok) ve Access-Control-Allow-Credentials BİLEREK gönderilmiyor.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Preflight — auth OLMADAN yanıtlanmalı (tarayıcı OPTIONS'ı Authorization'sız yollar).
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// İnce sarmalayıcı: handler'ı koş, sonra CORS başlıklarını HER yanıt yoluna damgala
// (başarı, doğrulama 4xx ve verifyAuthAndRateLimit'in auth/rate-limit hataları).
export async function POST(request: NextRequest): Promise<NextResponse> {
  const res = await handleRating(request);
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

async function handleRating(request: NextRequest): Promise<NextResponse> {
  // Aşırı büyük gövdeyi JSON parse etmeden reddet.
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const auth = await verifyAuthAndRateLimit(request, "telemetry");
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  // ── rating: tek zorunlu enum ──
  const rating = typeof b.rating === "string" ? b.rating : "";
  if (rating !== "up" && rating !== "down") {
    return NextResponse.json({ ok: false, error: "rating_invalid" }, { status: 400 });
  }

  // ── ratingKey: zorunlu; aynı kartın tekrar puanlanmasını (👍→👎) eşleyen anahtar ──
  if (typeof b.ratingKey !== "string") {
    return NextResponse.json({ ok: false, error: "rating_key_required" }, { status: 400 });
  }
  const ratingKey = sanitizePromptInput(b.ratingKey.trim(), {
    max: MAX_KEY_CHARS,
    collapseWhitespace: true,
  });
  if (ratingKey.length === 0) {
    return NextResponse.json({ ok: false, error: "rating_key_required" }, { status: 400 });
  }

  // ── scope: opsiyonel ama varsa geçerli olmalı ──
  // Desktop her çağrıda gönderiyor. "Yoksa 400" DEMİYORUZ bilerek: ileride bir
  // çağrı yeri scope'u unutursa sinyalin tamamen kaybolmasındansa scope'suz
  // kaydedilmesi yeğdir (R8'in dersi tam olarak buydu).
  let scope: string | null = null;
  if (b.scope !== undefined && b.scope !== null) {
    const s = typeof b.scope === "string" ? b.scope : "";
    if (s !== "round" && s !== "report") {
      return NextResponse.json({ ok: false, error: "scope_invalid" }, { status: 400 });
    }
    scope = s;
  }

  // ── matchId: opsiyonel (canlı maç kartlarında henüz kayıt YOK) ama varsa uuid ──
  // DB kolonu uuid; uuid olmayan bir değer insert'i patlatırdı → önden reddet.
  let matchId: string | null = null;
  const rawMatchId: unknown = b.matchId;
  if (rawMatchId !== undefined && rawMatchId !== null && rawMatchId !== "") {
    if (!isUuidV4(rawMatchId)) {
      return NextResponse.json({ ok: false, error: "match_id_invalid" }, { status: 400 });
    }
    matchId = rawMatchId;
  }

  // ── round: opsiyonel; sonlu, 0..99 tam sayı ──
  let round: number | null = null;
  if (b.round !== undefined && b.round !== null) {
    const n = b.round;
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > MAX_ROUND) {
      return NextResponse.json({ ok: false, error: "round_invalid" }, { status: 400 });
    }
    round = Math.round(n);
  }

  // ── map / agent: opsiyonel etiketler; temizlenir + tavanlanır, asla reddedilmez ──
  const label = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const s = sanitizePromptInput(v.trim(), { max: MAX_LABEL_CHARS, collapseWhitespace: true });
    return s.length > 0 ? s : null;
  };
  const map = label(b.map);
  const agent = label(b.agent);

  try {
    const svc = createServiceSupabase();
    // Upsert: kullanıcı 👍'dan 👎'ya dönebilir — (user_id, rating_key) tekil
    // indeksi son seçimi tutar, çift kayıt üretmez (0017 migration).
    const { error } = await svc
      .from("feedback_ratings")
      .upsert(
        {
          user_id: auth.userId,
          rating_key: ratingKey,
          rating,
          scope,
          match_id: matchId,
          round,
          map,
          agent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,rating_key" },
      );

    if (error) {
      console.error("[Aimlo feedback-rating] upsert failed:", error.message);
      return NextResponse.json({ ok: false, error: "store_failed" }, { status: 503 });
    }
  } catch (e) {
    console.error("[Aimlo feedback-rating] route error:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
