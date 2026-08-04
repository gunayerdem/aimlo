// Admin data layer — server-only. All reads use the service-role client (bypasses
// RLS) and are called ONLY from admin-gated Server Components / route handlers.
// NEVER import this from a client component.
import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServiceSupabase } from "@/lib/supabase/server";
import { computeCost } from "@/lib/openai-pricing";
import { isRateBypassedPublic } from "@/lib/api-auth";
import { formatMap, formatAgent, formatSide } from "@/lib/format-display";
// F51 (pano dalga, 2026-08-04): D1/D7 kohort hesabı TEK tanımdan gelsin diye
// admin-analytics'teki saf helper'ı paylaşıyoruz (growth sayfasıyla aynı mantık,
// sayılar ayrışamaz). admin-analytics de server-only; döngüsel import yok
// (admin-analytics admin-data'yı import etmiyor).
import { computeD1D7Cohorts, type CohortRetention } from "@/lib/admin-analytics";

// ── Helpers ────────────────────────────────────────────────────────────────

function startOfDayUtc(daysAgo = 0): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

/** Fetch ALL auth.users via the admin API (paginated). Small user base for now;
 * paginates defensively so it doesn't silently cap at 50. */
async function listAllAuthUsers(svc: SupabaseClient): Promise<User[]> {
  const all: User[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error("[admin-data] listUsers failed:", error.message);
      break;
    }
    const users = data?.users ?? [];
    all.push(...users);
    if (users.length < 200) break;
  }
  return all;
}

// ── Types ──────────────────────────────────────────────────────────────────

export type OverviewData = {
  totalUsers: number;
  confirmedUsers: number;
  totalMatches: number;
  matchesToday: number;
  matchesWeek: number;
  dau: number;
  wau: number;
  mau: number;
  dailyTrend: { date: string; matches: number; users: number }[];
  topUsers: { userId: string; label: string; matches: number; lastSeen: string | null }[];
  costToday: number;
  costTotal: number;
  costRows: number; // how many ai_usage rows exist (0 = logging not capturing yet)
  // F51 (pano dalga, 2026-08-04): genel-bakış D1/D7 kohort kartı. Zaten çekilen
  // analyses verisinden hesaplanır — EK sorgu yok. Tanım growth sayfasıyla birebir
  // aynı (computeD1D7Cohorts). Not: getOverview analyses'i en-yeni-20K tavanıyla
  // okur; tavana dayanılırsa yaklaşık metriktir (küçük kullanıcı tabanında birebir).
  d1: CohortRetention;
  d7: CohortRetention;
};

export type AdminUserRow = {
  userId: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  createdAt: string | null;
  lastSignIn: string | null;
  emailConfirmed: boolean;
  matches: number;
  lastMatch: string | null;
  winRate: number | null;
};

// ── Overview ─────────────────────────────────────────────────────────────────

export async function getOverview(): Promise<OverviewData> {
  const svc = createServiceSupabase();

  const [users, analysesRes, usageRes] = await Promise.all([
    listAllAuthUsers(svc),
    svc.from("analyses").select("user_id, created_at").order("created_at", { ascending: false }).limit(20000),
    svc
      .from("ai_usage")
      .select("model, prompt_tokens, completion_tokens, cached_tokens, created_at")
      .limit(50000),
  ]);

  const analyses = (analysesRes.data ?? []) as { user_id: string; created_at: string }[];
  const usage = (usageRes.data ?? []) as {
    model: string | null;
    prompt_tokens: number;
    completion_tokens: number;
    cached_tokens: number;
    created_at: string;
  }[];

  const dayAgo = startOfDayUtc(0).getTime();
  const weekAgo = startOfDayUtc(7).getTime();
  const monthAgo = startOfDayUtc(30).getTime();

  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();
  let matchesToday = 0;
  let matchesWeek = 0;
  const perUser = new Map<string, { matches: number; last: number }>();
  // F51 (pano dalga, 2026-08-04): D1/D7 kohortu için kullanıcı başına maç günleri
  // (UTC "YYYY-MM-DD") — getGrowth'taki gün anahtarıyla birebir aynı üretim.
  const daysByUser = new Map<string, Set<string>>();

  for (const a of analyses) {
    const t = new Date(a.created_at).getTime();
    if (t >= dayAgo) { dauSet.add(a.user_id); matchesToday++; }
    if (t >= weekAgo) { wauSet.add(a.user_id); matchesWeek++; }
    if (t >= monthAgo) mauSet.add(a.user_id);
    const cur = perUser.get(a.user_id) ?? { matches: 0, last: 0 };
    cur.matches++;
    if (t > cur.last) cur.last = t;
    perUser.set(a.user_id, cur);
    const days = daysByUser.get(a.user_id) ?? new Set<string>();
    days.add(new Date(a.created_at).toISOString().slice(0, 10));
    daysByUser.set(a.user_id, days);
  }

  // Daily trend (last 14 days)
  const trend: { date: string; matches: number; users: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = startOfDayUtc(i).getTime();
    const dayEnd = startOfDayUtc(i - 1).getTime();
    const dayUsers = new Set<string>();
    let m = 0;
    for (const a of analyses) {
      const t = new Date(a.created_at).getTime();
      if (t >= dayStart && t < dayEnd) { m++; dayUsers.add(a.user_id); }
    }
    const label = new Date(dayStart).toISOString().slice(5, 10); // MM-DD
    trend.push({ date: label, matches: m, users: dayUsers.size });
  }

  // Label map (username/email) for top users
  const labelById = new Map<string, string>();
  for (const u of users) labelById.set(u.id, u.email ?? u.id.slice(0, 8));
  const profilesRes = await svc.from("profiles").select("user_id, username").limit(5000);
  for (const p of (profilesRes.data ?? []) as { user_id: string; username: string | null }[]) {
    if (p.username) labelById.set(p.user_id, p.username);
  }

  const topUsers = [...perUser.entries()]
    .sort((a, b) => b[1].matches - a[1].matches)
    .slice(0, 5)
    .map(([userId, v]) => ({
      userId,
      label: labelById.get(userId) ?? userId.slice(0, 8),
      matches: v.matches,
      lastSeen: v.last ? new Date(v.last).toISOString() : null,
    }));

  let costToday = 0;
  let costTotal = 0;
  for (const u of usage) {
    const c = computeCost(
      { promptTokens: u.prompt_tokens, completionTokens: u.completion_tokens, cachedTokens: u.cached_tokens },
      u.model,
    );
    costTotal += c;
    if (new Date(u.created_at).getTime() >= dayAgo) costToday += c;
  }

  // F51 (pano dalga, 2026-08-04): kohort — mevcut analyses verisinden, ek sorgusuz.
  const { d1, d7 } = computeD1D7Cohorts(daysByUser.values());

  return {
    totalUsers: users.length,
    confirmedUsers: users.filter((u) => !!u.email_confirmed_at).length,
    totalMatches: analyses.length,
    matchesToday,
    matchesWeek,
    dau: dauSet.size,
    wau: wauSet.size,
    mau: mauSet.size,
    dailyTrend: trend,
    topUsers,
    costToday,
    costTotal,
    costRows: usage.length,
    d1,
    d7,
  };
}

// ── Users list ───────────────────────────────────────────────────────────────

export async function getUsersList(): Promise<AdminUserRow[]> {
  const svc = createServiceSupabase();

  const [users, profilesRes, analysesRes, memoryRes] = await Promise.all([
    listAllAuthUsers(svc),
    svc.from("profiles").select("user_id, username, display_name").limit(5000),
    svc.from("analyses").select("user_id, created_at").limit(20000),
    svc.from("player_memory").select("user_id, memory_data").limit(5000),
  ]);

  const profiles = new Map<string, { username: string | null; display_name: string | null }>();
  for (const p of (profilesRes.data ?? []) as { user_id: string; username: string | null; display_name: string | null }[]) {
    profiles.set(p.user_id, { username: p.username, display_name: p.display_name });
  }
  const agg = new Map<string, { matches: number; last: number }>();
  for (const a of (analysesRes.data ?? []) as { user_id: string; created_at: string }[]) {
    const t = new Date(a.created_at).getTime();
    const cur = agg.get(a.user_id) ?? { matches: 0, last: 0 };
    cur.matches++;
    if (t > cur.last) cur.last = t;
    agg.set(a.user_id, cur);
  }
  const winRate = new Map<string, number | null>();
  for (const m of (memoryRes.data ?? []) as { user_id: string; memory_data: Record<string, unknown> }[]) {
    const wr = (m.memory_data?.overallWinRate ?? m.memory_data?.winRate) as number | undefined;
    winRate.set(m.user_id, typeof wr === "number" ? wr : null);
  }

  return users
    .map((u): AdminUserRow => {
      const p = profiles.get(u.id);
      const a = agg.get(u.id);
      return {
        userId: u.id,
        username: p?.username ?? null,
        displayName: p?.display_name ?? null,
        email: u.email ?? null,
        createdAt: u.created_at ?? null,
        lastSignIn: u.last_sign_in_at ?? null,
        emailConfirmed: !!u.email_confirmed_at,
        matches: a?.matches ?? 0,
        lastMatch: a?.last ? new Date(a.last).toISOString() : null,
        winRate: winRate.get(u.id) ?? null,
      };
    })
    .sort((x, y) => y.matches - x.matches);
}

// ── User detail ──────────────────────────────────────────────────────────────

export type UserMatch = {
  id: string;
  map: string | null;
  agent: string | null;
  side: string | null;
  score: string | null;
  won: boolean | null;
  createdAt: string;
  summary: string | null;
  mistake: string | null;
};

export type UserDetail = {
  userId: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  createdAt: string | null;
  lastSignIn: string | null;
  matches: UserMatch[];
  memory: Record<string, unknown> | null;
  cost: number;
  rateBypassed: boolean;
};

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const svc = createServiceSupabase();

  const { data: authData } = await svc.auth.admin.getUserById(userId);
  const authUser = authData?.user ?? null;

  const [profileRes, analysesRes, memoryRes, usageRes] = await Promise.all([
    svc.from("profiles").select("username, display_name").eq("user_id", userId).maybeSingle(),
    svc
      .from("analyses")
      .select("id, riot_id, region, summary, weakness, raw_result_json, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500),
    svc.from("player_memory").select("memory_data").eq("user_id", userId).maybeSingle(),
    svc
      .from("ai_usage")
      .select("model, prompt_tokens, completion_tokens, cached_tokens")
      .eq("user_id", userId)
      .limit(20000),
  ]);

  if (!authUser && !profileRes.data && (analysesRes.data?.length ?? 0) === 0) return null;

  const profile = profileRes.data as { username: string | null; display_name: string | null } | null;

  const matches: UserMatch[] = ((analysesRes.data ?? []) as {
    id: string;
    riot_id: string | null;
    region: string | null;
    summary: string | null;
    weakness: string | null;
    raw_result_json: Record<string, unknown> | null;
    created_at: string;
  }[]).map((a) => {
    const r = a.raw_result_json ?? {};
    return {
      id: a.id,
      // Display normalizasyonu (beta cilası 2026-07-09): eski satırlar ham OCR
      // slug'ı ("bind"/"reyna"/"attacking") ya da "Unknown" senteli taşır —
      // resmi ad/Türkçe taraf; tanınmayan/boş → null (render "—" basar).
      map: formatMap((r.map as string) ?? a.riot_id) || null,
      agent: formatAgent((r.agent as string) ?? a.region) || null,
      side: formatSide(r.side) || null,
      score: (r.score as string) ?? null,
      won: typeof r.won === "boolean" ? (r.won as boolean) : null,
      createdAt: a.created_at,
      summary: a.summary ?? (r.summary as string) ?? null,
      mistake: a.weakness ?? (r.mistake as string) ?? null,
    };
  });

  let cost = 0;
  for (const u of (usageRes.data ?? []) as {
    model: string | null;
    prompt_tokens: number;
    completion_tokens: number;
    cached_tokens: number;
  }[]) {
    cost += computeCost(
      { promptTokens: u.prompt_tokens, completionTokens: u.completion_tokens, cachedTokens: u.cached_tokens },
      u.model,
    );
  }

  return {
    userId,
    username: profile?.username ?? null,
    displayName: profile?.display_name ?? null,
    email: authUser?.email ?? null,
    createdAt: authUser?.created_at ?? null,
    lastSignIn: authUser?.last_sign_in_at ?? null,
    matches,
    memory: (memoryRes.data?.memory_data as Record<string, unknown>) ?? null,
    cost,
    rateBypassed: await isRateBypassedPublic(userId),
  };
}

// ── Cost ─────────────────────────────────────────────────────────────────────

export type CostData = {
  rows: number;
  total: number;
  today: number;
  week: number;
  truncated: boolean; // tavan aşıldı → total/token rakamları EKSİK (B103)
  rowLimit: number;
  // F5+F39 (pano dalga, 2026-08-04): route ve gün kırılımına cache metrikleri
  // EKLENDİ (ekleme — mevcut alanlar/şekil değişmedi; /cost ve /revenue tüketicileri
  // eski alanları aynen görür). cacheRatio = cached/prompt token yüzdesi;
  // prompt=0 iken null (0% ile "veri yok" ayrımı kaybolmasın).
  byRoute: { route: string; calls: number; cost: number; promptTokens: number; cachedTokens: number; cacheRatio: number | null }[];
  daily: { date: string; cost: number; calls: number; cachePct: number }[];
  tokens: { input: number; output: number; cached: number };
};

/** Cache-hit yüzdesi (0-100, 1 ondalık). prompt=0 → null. (F5+F39, 2026-08-04) */
function cacheRatioPct(cached: number, prompt: number): number | null {
  if (prompt <= 0) return null;
  // computeCost gibi clamp'le: bozuk satırda cached > prompt olursa %100'ü aşmasın.
  const c = Math.max(0, Math.min(cached, prompt));
  return Number(((c / prompt) * 100).toFixed(1));
}

// Ham-satır tavanı (B103, 2026-07-31) — artık YALNIZ fallback yolunda geçerli.
// İki somut zarar burada kapatılmıştı ve fallback'te korunuyor:
//   (1) Sorgu SIRASIZ'dı: tavan aşıldığında Postgres hangi satırları döndüreceğini
//       garanti etmez, yani "bugün/bu hafta" rastgele eksilebilirdi. created_at DESC
//       (ai_usage_created_idx ile indeksli) → tavan aşılsa bile EN YENİ satırlar gelir.
//   (2) Tavana dayanmak SESSİZDİ: `truncated` bayrağı /cost sayfasında görünür
//       uyarıya bağlandı — toplam artık sessizce yanlış gösterilmiyor.
const COST_ROW_LIMIT = 100_000;

// supabase/0016_ai_usage_rollup.sql → public.ai_usage_daily_totals(p_since)
// çıktısının BİREBİR şekli. Fiyat DB'de hesaplanmaz: `model` grup anahtarında
// olduğu için USD'yi burada, okuma anında lib/openai-pricing.ts hesaplar
// (fiyat değişince tüm geçmiş backfill'siz yeniden fiyatlanır).
type UsageRollupRow = {
  day: string; // "YYYY-MM-DD" (UTC) — JS tarafındaki gün anahtarıyla aynı
  route_type: string;
  model: string | null;
  calls: number;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
};

/** int8 kolonları PostgREST'ten string gelebilir — güvenli sayıya çevir. */
function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Son 14 günün serisi (gün anahtarı "YYYY-MM-DD", UTC). Ham ve RPC yolları ortak.
 * F5+F39 (2026-08-04): gün başına prompt/cached token da toplanır → cachePct
 * (günlük cache trendi grafiği). Çağrısız gün 0 basılır (grafikte boşluk yerine
 * taban çizgisi — mevcut cost serisiyle aynı davranış). */
function buildDailySeries(
  dailyMap: Map<string, { cost: number; calls: number; prompt: number; cached: number }>,
): { date: string; cost: number; calls: number; cachePct: number }[] {
  const daily: { date: string; cost: number; calls: number; cachePct: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = startOfDayUtc(i).toISOString().slice(0, 10);
    const d = dailyMap.get(day) ?? { cost: 0, calls: 0, prompt: 0, cached: 0 };
    daily.push({
      date: day.slice(5),
      cost: Number(d.cost.toFixed(4)),
      calls: d.calls,
      cachePct: cacheRatioPct(d.cached, d.prompt) ?? 0,
    });
  }
  return daily;
}

/**
 * B103 (2026-07-31) — /cost artık ÖNCE SQL-tarafı rollup'ı okur.
 * NEDEN: eski yol `ai_usage`'dan 100.000 HAM satır çekip toplamı Node'da
 * hesaplıyordu; sayfa force-dynamic olduğu için her görüntüleme tüm geçmişi
 * fonksiyona taşıyordu (büyümeyle lineer yavaşlama) ve tavan aşılınca TOPLAM
 * sessizce eksik kalıyordu = yanlış maliyet raporu. Rollup satır sayısı
 * gün × route × model ile sınırlı (yılda ~1.500), büyümeden bağımsız.
 *
 * RPC prod'a HENÜZ uygulanmamış olabilir (migration'ı softi elle çalıştıracak)
 * → hata durumunda eski ham-sorgu yoluna düşülür ve tek satır uyarı loglanır;
 * panel migration öncesi de aynen çalışmaya devam eder.
 */
export async function getCostData(): Promise<CostData> {
  const svc = createServiceSupabase();

  const { data: rollup, error: rollupError } = await svc.rpc("ai_usage_daily_totals", {
    p_since: null, // tüm geçmiş: panel "TOPLAM" kartını gösteriyor
  });

  if (!rollupError && Array.isArray(rollup)) {
    return aggregateRollup(rollup as UsageRollupRow[]);
  }

  console.warn(
    `[admin-data] ai_usage_daily_totals RPC yok/başarısız (${rollupError?.message ?? "beklenmeyen yanıt"}) — ham ai_usage taramasına düşülüyor (B103; supabase/0016_ai_usage_rollup.sql uygulanmalı)`,
  );
  return getCostDataRaw(svc);
}

/** RPC yolu: gün×route×model toplamlarını panelin beklediği şekle indirger. */
function aggregateRollup(rows: UsageRollupRow[]): CostData {
  // Gün anahtarı karşılaştırması: ISO "YYYY-MM-DD" sözlük sırası = kronolojik
  // sıra. Ham yoldaki `t >= startOfDayUtc(n)` eşikleri zaten UTC gün sınırı
  // olduğu için sonuç birebir aynı.
  const todayKey = startOfDayUtc(0).toISOString().slice(0, 10);
  const weekKey = startOfDayUtc(7).toISOString().slice(0, 10);

  let calls = 0, total = 0, today = 0, week = 0;
  let tIn = 0, tOut = 0, tCached = 0;
  // F5+F39 (2026-08-04): route kırılımına prompt/cached token toplamları eklendi —
  // rollup satırları zaten gün×route×model granülünde token taşıyor, EK sorgu yok.
  const byRoute = new Map<string, { calls: number; cost: number; prompt: number; cached: number }>();
  const dailyMap = new Map<string, { cost: number; calls: number; prompt: number; cached: number }>();

  for (const row of rows) {
    const promptTokens = num(row.prompt_tokens);
    const completionTokens = num(row.completion_tokens);
    const cachedTokens = num(row.cached_tokens);
    const rowCalls = num(row.calls);
    // computeCost token'da lineer ve `model` grup anahtarında → grup başına
    // hesaplamak, satır satır hesaplayıp toplamakla aynı sonucu verir.
    const c = computeCost({ promptTokens, completionTokens, cachedTokens }, row.model);
    const day = String(row.day).slice(0, 10);

    calls += rowCalls;
    total += c;
    if (day >= todayKey) today += c;
    if (day >= weekKey) week += c;
    tIn += promptTokens; tOut += completionTokens; tCached += cachedTokens;

    const r = byRoute.get(row.route_type) ?? { calls: 0, cost: 0, prompt: 0, cached: 0 };
    r.calls += rowCalls; r.cost += c; r.prompt += promptTokens; r.cached += cachedTokens;
    byRoute.set(row.route_type, r);
    const d = dailyMap.get(day) ?? { cost: 0, calls: 0, prompt: 0, cached: 0 };
    d.cost += c; d.calls += rowCalls; d.prompt += promptTokens; d.cached += cachedTokens;
    dailyMap.set(day, d);
  }

  return {
    rows: calls, // "çağrı" sayısı — rollup'ta tavan yok, gerçek toplam
    total, today, week,
    truncated: false, // SQL tarafında toplanıyor: eksik-toplam riski yok
    rowLimit: COST_ROW_LIMIT,
    byRoute: [...byRoute.entries()]
      .map(([route, v]) => ({
        route,
        calls: v.calls,
        cost: v.cost,
        promptTokens: v.prompt,
        cachedTokens: v.cached,
        cacheRatio: cacheRatioPct(v.cached, v.prompt),
      }))
      .sort((a, b) => b.cost - a.cost),
    daily: buildDailySeries(dailyMap),
    tokens: { input: tIn, output: tOut, cached: tCached },
  };
}

/** Fallback: RPC uygulanmadan önceki ham-satır yolu (davranışı değişmedi). */
async function getCostDataRaw(svc: SupabaseClient): Promise<CostData> {
  const { data } = await svc
    .from("ai_usage")
    .select("route_type, model, prompt_tokens, completion_tokens, cached_tokens, created_at")
    .order("created_at", { ascending: false })
    .limit(COST_ROW_LIMIT);

  const usage = (data ?? []) as {
    route_type: string;
    model: string | null;
    prompt_tokens: number;
    completion_tokens: number;
    cached_tokens: number;
    created_at: string;
  }[];

  const dayAgo = startOfDayUtc(0).getTime();
  const weekAgo = startOfDayUtc(7).getTime();
  let total = 0, today = 0, week = 0;
  let tIn = 0, tOut = 0, tCached = 0;
  // F5+F39 (2026-08-04): rollup yolundaki cache kırılımının birebir aynısı —
  // fallback'te de aynı alanlar dolmalı ki migration uygulanmamışken panel bozulmasın.
  const byRoute = new Map<string, { calls: number; cost: number; prompt: number; cached: number }>();
  const dailyMap = new Map<string, { cost: number; calls: number; prompt: number; cached: number }>();

  for (const u of usage) {
    const c = computeCost(
      { promptTokens: u.prompt_tokens, completionTokens: u.completion_tokens, cachedTokens: u.cached_tokens },
      u.model,
    );
    const t = new Date(u.created_at).getTime();
    total += c;
    if (t >= dayAgo) today += c;
    if (t >= weekAgo) week += c;
    tIn += u.prompt_tokens; tOut += u.completion_tokens; tCached += u.cached_tokens;
    const r = byRoute.get(u.route_type) ?? { calls: 0, cost: 0, prompt: 0, cached: 0 };
    r.calls++; r.cost += c; r.prompt += u.prompt_tokens; r.cached += u.cached_tokens;
    byRoute.set(u.route_type, r);
    const day = new Date(u.created_at).toISOString().slice(0, 10);
    const d = dailyMap.get(day) ?? { cost: 0, calls: 0, prompt: 0, cached: 0 };
    d.cost += c; d.calls++; d.prompt += u.prompt_tokens; d.cached += u.cached_tokens;
    dailyMap.set(day, d);
  }

  return {
    rows: usage.length,
    total, today, week,
    truncated: usage.length >= COST_ROW_LIMIT,
    rowLimit: COST_ROW_LIMIT,
    byRoute: [...byRoute.entries()]
      .map(([route, v]) => ({
        route,
        calls: v.calls,
        cost: v.cost,
        promptTokens: v.prompt,
        cachedTokens: v.cached,
        cacheRatio: cacheRatioPct(v.cached, v.prompt),
      }))
      .sort((a, b) => b.cost - a.cost),
    daily: buildDailySeries(dailyMap), // aynı 14-günlük seri (B103'te ortak yardımcıya taşındı)
    tokens: { input: tIn, output: tOut, cached: tCached },
  };
}
