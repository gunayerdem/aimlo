import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAuthAndRateLimit, authUnavailableResponse } from "@/lib/api-auth";
import { checkMatchQuota } from "@/lib/entitlements";
import { saveAiUsage } from "@/lib/ai-usage";
import { loadPlayerMemory, updatePlayerMemory, buildMemoryContext } from "@/lib/player-memory";
// B05 (OLCUM-ARACI-10/12/13/14, 2026-09-24): doğrulama, deterministik rapor, prompt
// kurulumu, çağrı sabitleri, JSON parse, son-işlem ve kalite-kapısı refine'ı lib'de —
// scripts/eval-report.ts AYNI fonksiyonları çağırır (route dosyası HTTP metodu ve
// segment config dışında export EDEMEZ; kod burada kaldıkça eval elle kopya tutuyordu).
import {
  validateRequest,
  generateDeterministicReport,
  buildReportPrompts,
  buildReportRequestBody,
  parseReportJSON,
  finalizeReportFields,
  REPORT_CALL,
  type ReportRequest,
  type ReportResponse,
} from "@/lib/report-prompt";
import { maybeRefineReport, REFINE_CALL, type RefineCallModel } from "@/lib/report-refine";

/**
 * POST /api/ai/report
 * Generates end-of-match coaching report.
 *
 * - Migrated to OpenAI GPT-5 mini (May 2026) — uses OPENAI_API_KEY
 * - OPENAI_API_KEY missing → deterministic stats only (no AI text)
 * - All paths guaranteed to return valid ReportResponse shape
 */

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */
// Vercel function deadline (Pro plan max 300s; we use 60 for AI + cushion).
// Without this export, Vercel kills the function at 15s on Pro silently.
export const maxDuration = 60;
const AI_TIMEOUT_MS = 30_000;
// Tipler, doğrulama sabitleri (MAX_ROUNDS/MAX_NOTE_LENGTH/MAX_PROMPT_ROUNDS/VALID_*)
// ve skor kuralı lib/report-prompt.ts + lib/report-score.ts'te (B05).

/* ══════════════════════════════════════════════════════════
   SERVER-SIDE PERSISTENCE — opt-in via persistOnServer
   ══════════════════════════════════════════════════════════ */

/**
 * Build a Supabase client that inherits the caller's Bearer token so
 * RLS owner-check applies (analyses_owner_insert policy: auth.uid() =
 * user_id). We don't use the service-role client here — defense in
 * depth: even if the route accidentally writes a wrong user_id into
 * the payload, RLS rejects it.
 */
function userScopedSupabase(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const auth = request.headers.get("authorization") ?? "";
  return createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

interface PersistResult {
  /**
   * "ok"        — fresh insert;
   * "conflict"  — AYNI KULLANICIYA ait aynı matchId zaten vardı (idempotency hit);
   * "collision" — B108 (2026-07-31): matchId analyses.id'de var ama BİZİM
   *               satırımız değil (RLS SELECT'i boş dönüyor). Eskiden bu da
   *               "conflict" sayılıp istemciye "kaydedildi" deniyordu → maç
   *               SESSİZCE kaybediliyordu. Artık ayrı ve görünür.
   * "error"     — diğer her şey.
   */
  kind: "ok" | "conflict" | "collision" | "error";
  id?: string;
  message?: string;
}

async function persistAnalysis(
  request: NextRequest,
  userId: string,
  body: ReportRequest,
  report: ReportResponse,
): Promise<PersistResult> {
  const sb = userScopedSupabase(request);

  // Cheap pre-flight when matchId is supplied: a SELECT short-circuits
  // duplicate writes without burning a round trip on the AI route's
  // upstream cost (we already paid for it on this call, but a future
  // optimisation can move this check in front of the AI call).
  if (body.matchId) {
    const { data: existing, error: selErr } = await sb
      .from("analyses")
      .select("id")
      .eq("id", body.matchId)
      .maybeSingle();
    if (!selErr && existing?.id) {
      return { kind: "conflict", id: existing.id };
    }
  }

  // Match the legacy column shape used by web's saveReportToDb so the
  // history loader (rowToReport) keeps working without a migration.
  const insertPayload: Record<string, unknown> = {
    user_id: userId,
    riot_id: body.setup.map,    // legacy: stores map name
    region: body.setup.agent,    // legacy: stores agent name
    summary: report.summary,
    weakness: report.mistake,
    strength: report.tendencies,
    focus: report.adjustment,
    raw_result_json: {
      map: body.setup.map,
      agent: body.setup.agent,
      side: body.setup.side,
      score: report.scoreStr,
      won: report.matchWon,
      winPct: report.winPct,
      roundsWon: report.won,
      roundsLost: report.lost,
      roundsSkipped: report.skipped,
      survivedCount: report.survivedCount,
      totalRounds: report.total,
      rounds: body.rounds,
      setup: body.setup,
    },
  };
  if (body.matchId) {
    insertPayload.id = body.matchId;
  }

  const { data, error } = await sb
    .from("analyses")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    // Postgres UNIQUE violation. Desktop reads 409 as "already saved, drop
    // from queue" — ama ÖNCE satırın GERÇEKTEN bizim olduğunu doğrula.
    //
    // B108 (2026-07-31): matchId istemci tarafından seçilen bir UUID ve doğrudan
    // analyses.id primary key'i oluyor. Çakışma BAŞKA bir kullanıcının satırıyla
    // olursa RLS SELECT'i boş döner; eski kod bunu koşulsuz "benim satırım zaten
    // var" sayıp istemciye savedAnalysisId veriyordu → desktop kuyruktan
    // düşürüyor, maç ASLA kaydedilmiyor (SESSİZ VERİ KAYBI) + verilen bir
    // UUID'nin tabloda global olarak var olup olmadığına dair varlık-oracle'ı.
    // Ayrım artık owner-scoped SELECT ile yapılıyor: RLS gereği satır bizimse
    // GÖRÜNÜR, değilse görünmez — servis-rol anahtarına gerek yok.
    if (error.code === "23505" && body.matchId) {
      const { data: mine, error: ownErr } = await sb
        .from("analyses")
        .select("id")
        .eq("id", body.matchId)
        .maybeSingle();
      if (ownErr) {
        // Doğrulama sorgusu başarısız (ağ/geçici) — SESSİZ "collision" iddiası
        // üretmektense muhafazakâr davran ve eski idempotency davranışında kal.
        console.warn(
          "[AIMLO] 23505 sahiplik doğrulaması başarısız, idempotency varsayıldı:",
          ownErr.message,
        );
        return { kind: "conflict", id: body.matchId };
      }
      if (mine?.id) return { kind: "conflict", id: mine.id };
      console.error(
        `[AIMLO] analyses id ÇAKIŞMASI — matchId=${body.matchId} başka bir kullanıcıya ait, maç KAYDEDİLMEDİ`,
      );
      return { kind: "collision", message: "match_id_collision" };
    }
    return { kind: "error", message: error.message };
  }
  return { kind: "ok", id: data?.id };
}

/* ══════════════════════════════════════════════════════════
   AI REPORT — with timeout, validation, safe prompt
   ══════════════════════════════════════════════════════════ */
async function generateAIReport(body: ReportRequest, userId?: string): Promise<ReportResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  const stats = generateDeterministicReport(body);

  if (!apiKey) return stats;

  const { lang } = body;

  // Try loading player memory — route'ta kalır (lib/player-memory server-only).
  // Prompt kurulumu lib/report-prompt.ts buildReportPrompts'ta (OLCUM-ARACI-10: eval
  // aynı fonksiyonu çağırır). Tek fark SIRA: hafıza artık prompt hesaplarından ÖNCE
  // yükleniyor (ikisi birbirinden bağımsız; prompt içeriği bayt-aynı). Hata → "".
  let memoryContext = "";
  try {
    if (userId) {
      const memory = await loadPlayerMemory(userId);
      if (memory) {
        memoryContext = buildMemoryContext(memory, lang || "tr");
      }
    }
  } catch (e) {
    console.log("[Aimlo] Player memory not available");
  }

  const { systemPrompt, userPrompt } = buildReportPrompts(body, { memoryContext });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    // F8 (pano dalga, 2026-08-04): AI çağrı süresi ölçümü — yalnız saveAiUsage'a
    // latencyMs geçmek için; route mantığına dokunmuyor.
    const aiStartMs = Date.now();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      // OLCUM-ARACI-12: model / max_completion_tokens 1400 / reasoning_effort /
      // response_format TEK KAYNAK (lib/report-prompt.ts REPORT_CALL) — eval aynı gövdeyi yollar.
      body: JSON.stringify(buildReportRequestBody(systemPrompt, userPrompt)),
      signal: controller.signal,
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      console.error(`[Aimlo AI] Report API ${response.status}`);
      return stats;
    }

    const data = await response.json();
    clearTimeout(timeoutId);
    const text: string = data?.choices?.[0]?.message?.content || "";
    const stopReason = data?.choices?.[0]?.finish_reason ?? "unknown";
    const usage = data?.usage as { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } } | undefined;
    if (usage) {
      const cached = usage.prompt_tokens_details?.cached_tokens ?? 0;
      console.log(`[Aimlo AI tokens] report in=${usage.prompt_tokens ?? 0} cached=${cached} out=${usage.completion_tokens ?? 0} finish=${stopReason}`);
      // F8 (pano dalga, 2026-08-04): matchId + latencyMs eklendi — 0018 migration
      // kolonları; lib/ai-usage.ts migration'sız ortamda eski kolon setine düşer.
      saveAiUsage({ userId, routeType: "report", model: data?.model ?? REPORT_CALL.model, promptTokens: usage.prompt_tokens ?? 0, completionTokens: usage.completion_tokens ?? 0, cachedTokens: cached, matchId: body.matchId ?? null, latencyMs: Date.now() - aiStartMs });
    }

    // Robust JSON extraction (fence/balanced) — lib/report-prompt.ts parseReportJSON (eval ile ortak).
    const parsed = parseReportJSON(text);
    if (parsed === null) {
      console.error(`[Aimlo AI] Report JSON parse failed (finish=${stopReason}). Raw:`, text.slice(0, 300));
      return stats;
    }

    // Şekil doğrulama + temizleyici zincir + kapaklar (OLCUM-ARACI-13): lib/report-prompt.ts
    // finalizeReportFields — eval aynı fonksiyonu çağırır. Geçersiz şekil → null → stats.
    const finalized = finalizeReportFields(parsed, body, stats);
    if (finalized) return finalized;

    console.error("[Aimlo AI] Report invalid shape");
    return stats;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Aimlo AI] Report request timed out");
    } else {
      console.error(
        "[Aimlo AI] Report exception:",
        err instanceof Error ? err.message : "unknown",
      );
    }
    return stats;
  }
}

/* ══════════════════════════════════════════════════════════
   ROUTE HANDLER
   ══════════════════════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    // Reject oversized payloads (max 100KB)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 100_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // Auth + rate limit check — reject unauthenticated/rate-limited requests
    let userId: string;
    try {
      const auth = await verifyAuthAndRateLimit(request, "report");
      if (!auth.ok) {
        return auth.response;
      }
      userId = auth.userId;
    } catch (e) {
      // A021 (B05, 2026-09-24): bilinen auth reddi auth.response ile dönüyor; buraya
      // düşen İSTİSNA altyapı hatasıdır (Supabase/Upstash erişilemedi). Eskiden 401
      // "Authentication required" dönüyordu → desktop 401'i oturum sonu sayıp
      // (ai_client.rs:386 AuthExpired) sağlam oturumu yıkıyordu. 503 auth_unavailable
      // + Retry-After 15 = fail-closed (erişim yok), desktop Upstream sayar (yıkım yok).
      console.error(
        "[Aimlo API] Report auth exception:",
        e instanceof Error ? e.message : "unknown",
      );
      return authUnavailableResponse();
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.log("[AIMLO] AI report request");

    const validation = validateRequest(rawBody);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Cost-aware pre-flight: when the client sets persistOnServer + matchId,
    // a second POST with the same matchId is already-saved by definition.
    // Skip the AI call entirely so duplicate desktop retries don't burn
    // OpenAI credits. Spec: 409 with the existing analysis id; desktop
    // reads this as "drop from SQLite write-behind queue".
    //
    // B81 (2026-07-31) — BİLİNEN SINIR: bu kontrol ATOMİK DEĞİL. Sıralı
    // retry'lar korunuyor; ancak desktop timeout-retry'i ilk istek HÂLÂ AI'da
    // beklerken gelirse ikinci istek de pre-flight'ı geçer ve ikinci bir tam AI
    // çağrısı yakılır (~$0.02). Kaybeden INSERT 23505 alır ve artık 409 döner
    // (aşağıdaki persist dalı) — yani SONUÇ doğru, maliyet iki katı.
    // Gerçek çözüm AI çağrısından önce Upstash SETNX kilididir; BİLİNÇLİ olarak
    // ertelendi: kilidi alamayan isteğe 409 dönmek, kilit sahibi fonksiyon
    // platformca öldürülürse (TTL boyunca) meşru retry'ı da "kaydedildi" sayıp
    // maçı SESSİZCE kaybettirir — mevcut çift-maliyetten daha kötü bir kırılma.
    // Güvenli hâli desktop tarafında "retry-edilebilir" bir statü sözleşmesi
    // ister (bkz. rapor: crossFile).
    if (validation.data.persistOnServer && validation.data.matchId) {
      try {
        const sb = userScopedSupabase(request);
        const { data: existing } = await sb
          .from("analyses")
          .select("id")
          .eq("id", validation.data.matchId)
          .maybeSingle();
        if (existing?.id) {
          return NextResponse.json(
            { error: "match_already_saved", savedAnalysisId: existing.id },
            { status: 409 },
          );
        }
      } catch (e) {
        // Pre-flight lookup is best-effort — fall through to AI + INSERT,
        // the post-INSERT UNIQUE check is the real source of truth.
        console.warn(
          "[AIMLO] Pre-flight match lookup failed:",
          e instanceof Error ? e.message : "unknown",
        );
      }
    }

    // ── Ücretsiz katman kotası (2026-07-20) — haftada 3 MAÇ ──
    // Denetim bulgusu H1: kota yalnız vision'daydı; maç raporu (ürünün en
    // değerli çıktısı) paywall dışında kalıyordu. AYNI hafta anahtarını
    // paylaşır → bir maç iki hak yakmaz, vision'da sayılmış maç burada bedava.
    // ŞU AN KAPALI (FREE_TIER_ENFORCED). 409 idempotency kontrolünden SONRA:
    // zaten kaydedilmiş maçın tekrarı kotaya dokunmaz.
    const quota = await checkMatchQuota(userId, validation.data.matchId);
    if (!quota.allowed) {
      console.log(`[QUOTA] report blocked — user=${userId.slice(0, 8)} used=${quota.used}/${quota.limit}`);
      return NextResponse.json(
        {
          error: "quota_exceeded",
          message: `Ücretsiz hesabın haftalık ${quota.limit} maç analizi hakkı doldu. AIMLO+ ile sınırsız analiz al.`,
          detail: { used: quota.used, limit: quota.limit, resetsAt: quota.resetsAt },
        },
        { status: 402 },
      );
    }

    const report = await generateAIReport(validation.data, userId);

    // Update player memory with match data
    try {
      if (userId) {
        const { setup, rounds, score } = validation.data;
        const matchWon = Number(score.yours) > Number(score.enemy);
        await updatePlayerMemory(userId, {
          map: setup?.map || "",
          agent: setup?.agent || "",
          won: matchWon,
          rounds: rounds.map(r => ({
            deathLocation: r.deathLocation,
            survived: r.survived,
            skipped: r.skipped,
            // player-memory binary tüketici — unknown, engine'lerdeki gibi loss'a iner
            result: r.result === "unknown" ? "loss" : r.result,
          }))
        });
      }
    } catch (e) {
      console.log("[Aimlo] Player memory update failed");
    }

    // Output quality gate + field-level refinement — lib/report-refine.ts
    // maybeRefineReport (OLCUM-ARACI-14): eval aynı kapıyı/prompt'u/kabul kuralını
    // koşar. Model çağrısı burada enjekte edilir (10 sn timeout); anahtar yoksa
    // null → kapı ölçülür/loglanır ama çağrı yapılmaz (eski apiKey koşulu).
    const apiKey = process.env.OPENAI_API_KEY;
    const refineCall: RefineCallModel | null = apiKey
      ? async (requestBody) => {
          const rc = new AbortController();
          const rt = setTimeout(() => rc.abort(), 10000);
          const refineStartMs = Date.now();
          const rr = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify(requestBody),
            signal: rc.signal,
          });
          clearTimeout(rt);
          if (!rr.ok) return null;
          const rd = await rr.json();
          // OLCUM-ARACI-15 (B05, 2026-09-24): refine İKİNCİ, ücretli bir AI çağrısı ama
          // ai_usage'a HİÇ yazılmıyordu (yalnız ana çağrı, generateAIReport) → admin
          // /cost paneli rapor maliyetini eksik sayıyordu. Yanıt geldiyse token harcanmıştır:
          // metin kabul de edilse (finish=stop) reddedilse de kaydedilir. routeType
          // "report" (panel byRoute gruplaması değişmez; ayrı tip admin-data'yı etkilerdi).
          const ru = rd?.usage as { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } } | undefined;
          if (ru) {
            const rCached = ru.prompt_tokens_details?.cached_tokens ?? 0;
            console.log(`[Aimlo AI tokens] report-refine in=${ru.prompt_tokens ?? 0} cached=${rCached} out=${ru.completion_tokens ?? 0} finish=${rd?.choices?.[0]?.finish_reason ?? "unknown"}`);
            saveAiUsage({ userId, routeType: "report", model: rd?.model ?? REFINE_CALL.model, promptTokens: ru.prompt_tokens ?? 0, completionTokens: ru.completion_tokens ?? 0, cachedTokens: rCached, matchId: validation.data.matchId ?? null, latencyMs: Date.now() - refineStartMs });
          }
          return { content: rd?.choices?.[0]?.message?.content, finishReason: rd?.choices?.[0]?.finish_reason };
        }
      : null;
    await maybeRefineReport(report, validation.data, refineCall);

    // Server-side persistence — opt-in via persistOnServer. The web UI
    // does its own client-side INSERT (saveReportToDb in app/page.tsx)
    // and leaves this off, so the two write paths don't double-write.
    if (validation.data.persistOnServer) {
      const persist = await persistAnalysis(
        request,
        userId,
        validation.data,
        report,
      );
      if (persist.kind === "ok") {
        report.savedAnalysisId = persist.id;
      } else if (persist.kind === "conflict") {
        // 🔴 GERİ ALINDI (karşı-denetim, 2026-07-31 gecesi). Bu dal kısa süre 409
        // dönüyordu ("409 = idempotent hit" sözleşmesini tek statüde toplamak için).
        // Ölçüldü: SESSİZ RAPOR KAYBI üretiyordu.
        //
        // Ayrım kritik: 409 sözleşmesi PRE-FLIGHT kontrol içindir (satır ~1326) —
        // orada AI hiç çağrılmamıştır, "zaten kayıtlı" demek doğru ve ucuzdur.
        // BURASI ise INSERT'in 23505 alması, yani AI çağrısı ZATEN YAPILMIŞ ve
        // parası ödenmiş durumda; elimizde kullanıcının beklediği rapor VAR.
        //
        // Yarışı desktop'ın kendisi rutin olarak üretiyor: maç sonu satırı önce
        // SQLite kuyruğuna yazılıyor, sonra canlı POST atılıyor; kuyruk yeniden
        // denemesi canlı isteği geçerse canlı istek 23505 alır. 409 + gövdesiz
        // yanıtta kullanıcı maç raporunu HİÇ göremez — üstelik AI parası yanmıştır.
        // Doğrusu: kaydın id'sini iliştir ve raporu 200 ile teslim et.
        report.savedAnalysisId = persist.id;
      } else if (persist.kind === "collision") {
        // B108 (2026-07-31): matchId başkasının satırıyla çakıştı → maç
        // KAYDEDİLMEDİ. 409 DÖNME: desktop 409'u "kaydedildi, kuyruktan düşür"
        // okur ve maç sessizce kaybolur. 422 → 409-dışı 4xx olarak sınıflanır,
        // sahte "kaydedildi" sinyali üretilmez ve olay loglarda görünür.
        // (Pratikte UUID v4 ile ~imkânsız; bu bir sessiz-veri-kaybı kapısıdır.)
        return NextResponse.json(
          {
            error: "match_id_collision",
            message:
              "Bu matchId başka bir kayıtla çakışıyor. Maç kaydedilmedi — yeni bir matchId ile tekrar gönder.",
          },
          { status: 422 },
        );
      } else {
        // Don't fail the response — AI report is still useful and the
        // client can retry persistence on its own schedule.
        console.warn(
          "[AIMLO] Server-side analyses INSERT failed:",
          persist.message ?? "unknown",
        );
      }
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error(
      "[Aimlo API] Report route error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
