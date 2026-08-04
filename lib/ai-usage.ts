// AI usage logger — server-only. Persists one row per OpenAI call to
// public.ai_usage so the admin /cost panel can show real spend over time.
// Call it right where each AI route already parses the usage object.
//
// NON-BLOCKING + FAIL-SAFE: this must NEVER delay or break an AI response.
// Callers should NOT await it (fire-and-forget) — and it swallows every error
// internally as a final guard. Uses the service-role client (ai_usage has no
// anon/authenticated RLS policy).
import "server-only";

import { after } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export type SaveUsageInput = {
  userId: string | null | undefined;
  routeType: "vision" | "report" | "feedback" | "insight";
  model?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  cachedTokens?: number | null;
  // F8 (pano dalga, 2026-08-04): opsiyonel — 0018 migration'ının eklediği
  // match_id/latency_ms kolonları için. Geriye uyumlu: mevcut çağıranlar
  // geçmezse insert payload'ı ESKİSİYLE birebir aynı kalır.
  matchId?: string | null;
  latencyMs?: number | null;
};

/**
 * F8 (pano dalga, 2026-08-04): 0018 migration'ı prod'da HENÜZ uygulanmamışken
 * yeni kolonlu insert PostgREST'te "unknown column" ile düşer. O hatayı tanıyıp
 * aynı kaydı eski kolon setiyle bir kez daha denemek için ayırt ediyoruz.
 * PGRST204 = PostgREST schema-cache'te kolon yok; 42703 = Postgres undefined_column.
 * Mesaj kontrolü yedek ağ: schema-cache yenilenme anlarında kod değişebiliyor.
 */
function isUnknownColumnError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "PGRST204" || err.code === "42703") return true;
  return /column|schema cache/i.test(err.message ?? "");
}

/**
 * Fire-and-forget insert of a usage row. Returns immediately; the write happens
 * after the response is flushed and any failure is logged, never thrown. Do not
 * `await` in a hot path — call `void saveAiUsage(...)`.
 *
 * B67 (2026-07-31): eskiden iş `Promise.resolve().then(...)` mikrotask'ına
 * atılıyordu. Vercel yanıtı gönderir göndermez lambda'yı DONDURUYOR; çoğu
 * route'ta saveAiUsage yanıttan yalnız milisaniyeler önce çağrıldığı için
 * bekleyen insert tamamlanmadan kaybolabiliyordu → /admin/cost maliyet sayımı
 * sessizce eksik kalıyordu. Next 16 `after()` işi yanıttan SONRA, route'un
 * maxDuration bütçesi içinde koşturur (docs: 01-app/.../functions/after.md).
 * İmza ve çağıranlar DEĞİŞMEDİ.
 */
export function saveAiUsage(input: SaveUsageInput): void {
  const work = async () => {
    try {
      const svc = createServiceSupabase();
      // Eski kolon seti — 0007 şeması. Bu payload DEĞİŞMEDİ; F8 kolonları
      // yalnız çağıran gerçekten geçtiğinde eklenir (aşağıda), böylece
      // vision/feedback gibi parametresiz çağıranlar için davranış birebir aynı.
      const basePayload: Record<string, unknown> = {
        user_id: input.userId ?? null,
        route_type: input.routeType,
        model: input.model ?? null,
        prompt_tokens: Math.max(0, Math.round(input.promptTokens ?? 0)),
        completion_tokens: Math.max(0, Math.round(input.completionTokens ?? 0)),
        cached_tokens: Math.max(0, Math.round(input.cachedTokens ?? 0)),
      };

      // F8 (pano dalga, 2026-08-04): yeni kolonlar OPSİYONEL ve yalnız değer
      // geldiğinde payload'a girer. latency negatif/NaN gelirse null'a düşür —
      // saçma değerle paneli kirletme.
      const extendedPayload: Record<string, unknown> = { ...basePayload };
      let hasNewColumns = false;
      if (input.matchId != null && input.matchId !== "") {
        extendedPayload.match_id = input.matchId;
        hasNewColumns = true;
      }
      if (input.latencyMs != null && Number.isFinite(input.latencyMs) && input.latencyMs >= 0) {
        extendedPayload.latency_ms = Math.round(input.latencyMs);
        hasNewColumns = true;
      }

      const { error } = await svc.from("ai_usage").insert(extendedPayload);
      if (error && hasNewColumns && isUnknownColumnError(error)) {
        // DAYANIKLILIK (F8): 0018 migration'ı henüz uygulanmamış → aynı kaydı
        // eski kolon setiyle BİR KEZ daha dene. Maliyet defteri satır
        // kaybetmesin; ama sorunu da görünür kıl (migration hatırlatıcısı).
        console.warn(
          `[ai-usage] yeni kolonlu insert reddedildi (${error.code ?? "?"}: ${error.message}) — 0018 migration uygulanmamış olabilir; eski kolon setiyle tekrar deneniyor`,
        );
        const { error: retryError } = await svc.from("ai_usage").insert(basePayload);
        if (retryError) console.error("[ai-usage] fallback insert failed:", retryError.message);
      } else if (error) {
        console.error("[ai-usage] insert failed:", error.message);
      }
    } catch (e) {
      console.error("[ai-usage] saveAiUsage error:", (e as Error).message);
    }
  };

  try {
    after(work);
  } catch {
    // İstek bağlamı dışında (script/test) after() fırlatır — eski mikrotask
    // yoluna düş; davranış aynı kalır, çağıran yine bloklanmaz.
    void work();
  }
}
