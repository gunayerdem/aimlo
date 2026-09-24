import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAuthAndRateLimit, authUnavailableResponse, consumeDailyQuota, refundDailyQuota } from "@/lib/api-auth";
import { checkMatchQuota, quotaExceededBody } from "@/lib/entitlements";
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
  interpretReportCompletion,
  buildReportAIFailure,
  reportOutcome,
  REPORT_AI_FAILURE_WIRE,
  REPORT_CALL,
  type ReportAIResult,
  type ReportRequest,
  type ReportResponse,
} from "@/lib/report-prompt";
import { maybeRefineReport, REFINE_CALL, type RefineCallModel } from "@/lib/report-refine";

/**
 * POST /api/ai/report
 * Generates end-of-match coaching report.
 *
 * - Migrated to OpenAI GPT-5 mini (May 2026) — uses OPENAI_API_KEY
 * - OPENAI_API_KEY missing → deterministic stats only (no AI text; dev path)
 * - FB01 · F54 (2026-09-24): key present + AI failure → 502/504 structured error
 *   (never template coach text), nothing persisted, no player_memory update.
 */

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */
// Vercel function deadline (Pro plan max 300s; we use 60 for AI + cushion).
// Without this export, Vercel kills the function at 15s on Pro silently.
export const maxDuration = 60;
const AI_TIMEOUT_MS = 30_000;
/** FB01 · F18: başarısız analyses INSERT'inin tek yeniden denemesinden önceki bekleme. */
const PERSIST_RETRY_DELAY_MS = 500;
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
      // FB01 · F03: null = sonuç bilinmiyor (UNFINISHED/DRAW) — jsonb, migration gerekmez.
      // `result` null'ın hangisi olduğunu ayırır (masaüstü FD01 nötr rozeti için).
      won: report.matchWon,
      result: report.matchResult,
      ...(body.matchComplete !== undefined ? { matchComplete: body.matchComplete } : {}),
      ...(body.endReason ? { endReason: body.endReason } : {}),
      // FB01 · F54: geçmiş ekranı şablonu AI raporundan ayırabilsin (anahtarsız dev yolu).
      aiGenerated: report.aiGenerated,
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
// FB01 · F54 (2026-09-24): dönüş artık ReportAIResult — başarısızlık AYRI sınıf
// (ai_timeout / ai_upstream_error / ai_invalid_json / ai_invalid_shape); POST handler
// onu 502/504'e çevirir. Eskiden dört yol da sessizce `stats` (şablon) dönüyordu.
// Şablon YALNIZ anahtarsız dev yolunda kalır (ok:true, aiGenerated=false).
async function generateAIReport(body: ReportRequest, userId?: string): Promise<ReportAIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const stats = generateDeterministicReport(body);

  if (!apiKey) return { ok: true, report: stats };

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

  // F54: yanıt gövdesi alındıktan SONRAKİ istisna (son-işlem hatası) altyapı hatası DEĞİL
  // → ai_invalid_shape (kota iadesi yok); öncesi ağ/OpenAI → ai_upstream_error.
  let gotResponse = false;
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
      return { ok: false, code: "ai_upstream_error" };
    }

    const data = await response.json();
    clearTimeout(timeoutId);
    gotResponse = true;
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

    // Robust JSON extraction (fence/balanced) + şekil doğrulama + temizleyici zincir +
    // kapaklar — lib/report-prompt.ts interpretReportCompletion (parseReportJSON +
    // finalizeReportFields; OLCUM-ARACI-13, eval aynı fonksiyonu çağırır).
    const result = interpretReportCompletion(text, body, stats);
    if (!result.ok) {
      if (result.code === "ai_invalid_json") {
        console.error(`[Aimlo AI] Report JSON parse failed (finish=${stopReason}). Raw:`, text.slice(0, 300));
      } else {
        console.error("[Aimlo AI] Report invalid shape");
      }
    }
    return result;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Aimlo AI] Report request timed out");
      return { ok: false, code: "ai_timeout" };
    }
    console.error(
      "[Aimlo AI] Report exception:",
      err instanceof Error ? err.message : "unknown",
    );
    return { ok: false, code: gotResponse ? "ai_invalid_shape" : "ai_upstream_error" };
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
      // A058-B (W2 followup #62/#68): günlük kota burada HARCANMAZ (deferDaily) — gövde
      // doğrulandıktan SONRA consumeDailyQuota. JWT + dakika + per-IP kapıları aynen burada.
      const auth = await verifyAuthAndRateLimit(request, "report", { deferDaily: true });
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
      // FB04 · F88: eski masaüstü (v1.0.19-, UA'sız rapor istemcisi) 503'ü tanımaz → B04
      // öncesi 401 (auth_expired → diriltilir); sürümlü UA 503 almaya devam eder.
      return authUnavailableResponse(request);
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

    // A058-B (W2 followup #62/#68): günlük rapor kotası YALNIZ geçerli gövdede harcanır.
    // Eskiden 400 alan istek de 10/gün kotayı yakıyordu (desktop kalıcı 400'ü yeniden
    // denedikçe günlük kota bitiyordu). 429/503 gövdesi verifyAuthAndRateLimit'inkiyle
    // AYNI (rateLimitResponse). 409 pre-flight'tan ÖNCE (fix_spec A058-B sırası).
    try {
      const quotaResponse = await consumeDailyQuota(userId, "report");
      if (quotaResponse) return quotaResponse;
    } catch (e) {
      // verifyAuthAndRateLimit istisnasıyla aynı muamele: altyapı hatası → 503 (fail-closed).
      console.error("[Aimlo API] Report daily quota exception:", e instanceof Error ? e.message : "unknown");
      return authUnavailableResponse(request); // F88: eski masaüstüne B04 öncesi 401
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
      // FB04 · F93: vision ile AYNI kurucu (lib/entitlements quotaExceededBody) — abone adil
      // kullanım tavanında CTA'sız metin; detail'e reason+tier (additive). Statü 402 aynı.
      return NextResponse.json(quotaExceededBody(quota, validation.data.lang), { status: 402 });
    }

    const ai = await generateAIReport(validation.data, userId);
    if (!ai.ok) {
      // FB01 · F54: AI başarısız → yapılandırılmış hata. persistAnalysis / updatePlayerMemory /
      // maybeRefineReport ÇAĞRILMAZ → şablon rapor kalıcı yazılmaz, aynı matchId'nin sonraki
      // denemesi 409 kilidine takılmadan AI'ya gider. Tel kodu masaüstünün Upstream kümesinden
      // (A2 kuyruğu yeniden dener — REPORT_AI_FAILURE_WIRE notu). Günlük hak yalnız altyapı
      // hatasında (timeout / OpenAI !ok) iade edilir.
      if (REPORT_AI_FAILURE_WIRE[ai.code].refundQuota) {
        await refundDailyQuota(userId, "report");
      }
      console.warn(`[Aimlo AI] Report failed (${ai.code}) → ${REPORT_AI_FAILURE_WIRE[ai.code].status}, rapor kaydedilmedi`);
      const failure = buildReportAIFailure(ai.code, validation.data.lang);
      return NextResponse.json(failure.body, { status: failure.status, headers: failure.headers });
    }
    const report = ai.report;

    // Update player memory with match data
    // FB01 inceleme · F18/F48: player_memory yazımı idempotent DEĞİL (matchId'yi tutmuyor —
    // her çağrı ölüm konumlarını ve W/L'yi yeniden ekler). persistOnServer'da güncelleme
    // eskiden kalıcılıktan ÖNCE koşuyordu: INSERT kalıcı hata verince route persisted:false
    // dönüyor, masaüstü (FD05 1c98c49) maçı yeniden gönderiyor ve AYNI maç hafızaya İKİ kez
    // yazılıyordu. Artık persistOnServer'da hafıza yalnız bu isteğin analyses satırını
    // GERÇEKTEN yazdığı durumda güncellenir (aşağıda persist sonrası). Web yolu (kalıcılık
    // istemcide) eskisi gibi burada, aynı sırada.
    const recordPlayerMemory = async () => {
      try {
        if (userId) {
          const { setup, rounds } = validation.data;
          // FB01 · F03: sonuç TEK kaynaktan; null (UNFINISHED/DRAW) → wins/losses ARTMAZ.
          const matchWon = reportOutcome(validation.data).won;
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
    };
    if (!validation.data.persistOnServer) await recordPlayerMemory();

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
          // metin kabul de edilse (finish=stop) reddedilse de kaydedilir.
          // B05 inceleme (2026-09-24): routeType "report_refine" (eskiden "report") —
          // aynı routeType/matchId ile ana çağrıdan AYIRT EDİLEMİYORDU: route bazlı
          // çağrı sayısı ~%86 raporda 2 sayılıyor, latency_ms / $-çağrı ortalaması
          // ~500 token'lık refine ile düşük görünüyordu. Şema değişmez (route_type düz
          // text, CHECK yok — "ask" emsali); toplam maliyet ve match_id eşlemesi aynı.
          const ru = rd?.usage as { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } } | undefined;
          if (ru) {
            const rCached = ru.prompt_tokens_details?.cached_tokens ?? 0;
            console.log(`[Aimlo AI tokens] report-refine in=${ru.prompt_tokens ?? 0} cached=${rCached} out=${ru.completion_tokens ?? 0} finish=${rd?.choices?.[0]?.finish_reason ?? "unknown"}`);
            saveAiUsage({ userId, routeType: "report_refine", model: rd?.model ?? REFINE_CALL.model, promptTokens: ru.prompt_tokens ?? 0, completionTokens: ru.completion_tokens ?? 0, cachedTokens: rCached, matchId: validation.data.matchId ?? null, latencyMs: Date.now() - refineStartMs });
          }
          return { content: rd?.choices?.[0]?.message?.content, finishReason: rd?.choices?.[0]?.finish_reason };
        }
      : null;
    await maybeRefineReport(report, validation.data, refineCall);

    // Server-side persistence — opt-in via persistOnServer. The web UI
    // does its own client-side INSERT (saveReportToDb in app/LandingClient.tsx)
    // and leaves this off, so the two write paths don't double-write.
    if (validation.data.persistOnServer) {
      let persist = await persistAnalysis(
        request,
        userId,
        validation.data,
        report,
      );
      // F18 yeniden denemesi "conflict" dönerse satırı büyük olasılıkla İLK denememiz yazdı
      // (hata yanıtı yolda kayboldu) → hafıza bu istekte güncellenir. Kalan dar yarış: ilk
      // deneme GERÇEKTEN yazmadıysa ve arada eşzamanlı bir kopya yazdıysa o maç bir kez fazla
      // sayılabilir (B81 atomik-olmayan pre-flight ile aynı sınıf).
      let firstAttemptErrored = false;
      if (persist.kind === "error") {
        firstAttemptErrored = true;
        // FB01 · F18 (2026-09-24): geçici PostgREST/ağ hatası (5xx, bağlantı kopması) tek
        // hatada raporu kalıcılıktan düşürüyordu (probe: sahte PGRST303 → 200, savedAnalysisId
        // yok). ~500 ms sonra BİR kez daha dene. persistAnalysis idempotent: ilk INSERT
        // aslında yazıldıysa pre-flight SELECT onu bulur (conflict → aynı id).
        console.warn(
          "[AIMLO] Server-side analyses INSERT failed, 1 kez yeniden deneniyor:",
          persist.message ?? "unknown",
        );
        await new Promise((r) => setTimeout(r, PERSIST_RETRY_DELAY_MS));
        persist = await persistAnalysis(request, userId, validation.data, report);
      }
      // FB01 inceleme · F48: hafıza YALNIZ bu isteğin yazdığı satır için (yukarıdaki not).
      if (persist.kind === "ok" || (persist.kind === "conflict" && firstAttemptErrored)) {
        await recordPlayerMemory();
      }
      if (persist.kind === "ok") {
        report.savedAnalysisId = persist.id;
        report.persisted = true;
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
        report.persisted = true;
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
        // Don't fail the response — AI report is still useful. FB01 · F18: kalıcılığın
        // OLMADIĞI artık yanıtta açık (additive persisted:false, savedAnalysisId YOK);
        // masaüstü tarafında boş id'yi "kaydedilmedi" sayma işi FD tarafında (followup).
        console.warn(
          "[AIMLO] Server-side analyses INSERT failed (yeniden deneme sonrası):",
          persist.message ?? "unknown",
        );
        report.persisted = false;
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
