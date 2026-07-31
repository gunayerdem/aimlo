// Admin analytics data layer — server-only, service-role (RLS-bypass), called
// ONLY from admin-gated Server Components. Live feed + growth/retention +
// map/agent/quality insights + recent coach-feedback sampling. All from existing
// data (analyses, auth.users, ai_usage, match_events) — no extra AI cost.
import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServiceSupabase } from "@/lib/supabase/server";
import { formatMap, formatAgent, formatSide } from "@/lib/format-display";

// Display normalizasyonu (beta cilası 2026-07-09): match_events/analyses ham OCR
// değeri ("bind"/"reyna"/"attacking") ya da İngilizce "Unknown" senteli taşır.
// Admin ekranı Türkçe — resmi ad/Türkçe taraf basılır; tanınmayan/boş → null
// (render "—" gösterir). death_loc için kanonik callout tablosu yok: yalnız
// unknown-sentinel temizlenir, casing render'daki CSS capitalize'a kalır.
function scrubDeathLoc(raw: string | null): string | null {
  const s = (raw ?? "").trim();
  if (!s || /^(unknown|bilinmiyor|n\/a|\?)$/i.test(s)) return null;
  return s;
}

function startOfDayUtc(daysAgo = 0): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

async function listAllAuthUsers(svc: SupabaseClient): Promise<User[]> {
  const all: User[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    const users = data?.users ?? [];
    all.push(...users);
    if (users.length < 200) break;
  }
  return all;
}

// ── 1) LIVE ACTIVITY ─────────────────────────────────────────────────────────

export type LiveEvent = {
  id: string;
  userId: string | null;
  label: string;
  kind: string;
  map: string | null;
  agent: string | null;
  side: string | null;
  roundNo: number | null;
  score: string | null;
  deathLoc: string | null;
  createdAt: string;
};

export type LiveActivity = {
  onlineNow: number;
  activeMatches: number;
  events: LiveEvent[];
  tableMissing: boolean;
};

export async function getLiveActivity(): Promise<LiveActivity> {
  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from("match_events")
    .select("id, user_id, match_id, kind, map, agent, side, round_no, score, death_loc, created_at")
    .order("created_at", { ascending: false })
    .limit(60);

  // Table not created yet → graceful (page shows a hint instead of crashing).
  if (error) return { onlineNow: 0, activeMatches: 0, events: [], tableMissing: true };

  const rows = (data ?? []) as {
    id: string; user_id: string | null; match_id: string | null; kind: string;
    map: string | null; agent: string | null; side: string | null; round_no: number | null;
    score: string | null; death_loc: string | null; created_at: string;
  }[];

  // Labels (username/email) for the involved users.
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean) as string[])];
  const labelById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profs } = await svc.from("profiles").select("user_id, username").in("user_id", ids);
    for (const p of (profs ?? []) as { user_id: string; username: string | null }[]) {
      if (p.username) labelById.set(p.user_id, p.username);
    }
  }

  // Online penceresi 3 dk → 10 dk (B128, 2026-07-31): match_events YALNIZ ölümde
  // ve maç sonunda yazılıyor (0008_match_events.sql: "one row per vision call"),
  // yani 3 dk ölmeyen ya da round arası bekleyen oyuncu offline görünüyordu —
  // sayı sistematik olarak DÜŞÜK. 10 dk bir round + ölümsüz seriyi kapsar.
  // Doğru çözüm watch_started/heartbeat telemetry event'i (B5/B15 ile birlikte).
  const ONLINE_WINDOW_MS = 10 * 60000;
  const onlineSince = Date.now() - ONLINE_WINDOW_MS;
  const onlineSet = new Set<string>();
  const matchSet = new Set<string>();
  for (const r of rows) {
    if (new Date(r.created_at).getTime() >= onlineSince) {
      if (r.user_id) onlineSet.add(r.user_id);
      if (r.match_id) matchSet.add(r.match_id);
    }
  }

  return {
    onlineNow: onlineSet.size,
    activeMatches: matchSet.size,
    tableMissing: false,
    events: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      label: r.user_id ? (labelById.get(r.user_id) ?? r.user_id.slice(0, 8)) : "—",
      kind: r.kind,
      map: formatMap(r.map) || null,
      agent: formatAgent(r.agent) || null,
      side: formatSide(r.side) || null,
      roundNo: r.round_no,
      score: r.score,
      deathLoc: scrubDeathLoc(r.death_loc),
      createdAt: r.created_at,
    })),
  };
}

// ── 2) GROWTH / RETENTION / FUNNEL ───────────────────────────────────────────

// Kohort retention (B52, 2026-07-31). `returning` (>=2 farklı gün) kümülatif ve
// kohortsuz olduğu için haftalar geçtikçe otomatik şişiyor ve kohortlar
// karşılaştırılamıyordu — launch'ın en kritik kararı olan "ertesi gün geri
// dönüyor mu?" sorusunu cevaplamıyor. D0 = kullanıcının İLK maç günü.
// eligible = pencerenin TAMAMI geçmiş olan kullanıcı sayısı (devam eden gün
// sayılmaz, yoksa oran yapay olarak düşer); returned = o pencerede maçı olan.
export type CohortRetention = {
  eligible: number;
  returned: number;
  rate: number | null; // yüzde (0-100); eligible=0 iken null
};

export type GrowthData = {
  registered: number;
  confirmed: number;
  activated: number; // >=1 match
  engaged: number; // >=5 matches
  returning: number; // matches on >=2 distinct days
  d1: CohortRetention; // ilk maçın ERTESİ günü (D0+1) maçı olanlar
  d7: CohortRetention; // D0+1..D0+7 penceresinde maçı olanlar
  signupTrend: { date: string; signups: number }[];
};

export async function getGrowth(): Promise<GrowthData> {
  const svc = createServiceSupabase();
  const [users, analysesRes] = await Promise.all([
    listAllAuthUsers(svc),
    svc.from("analyses").select("user_id, created_at").limit(20000),
  ]);

  const matchesByUser = new Map<string, { count: number; days: Set<string> }>();
  for (const a of (analysesRes.data ?? []) as { user_id: string; created_at: string }[]) {
    const cur = matchesByUser.get(a.user_id) ?? { count: 0, days: new Set<string>() };
    cur.count++;
    cur.days.add(new Date(a.created_at).toISOString().slice(0, 10));
    matchesByUser.set(a.user_id, cur);
  }

  let activated = 0, engaged = 0, returning = 0;
  for (const v of matchesByUser.values()) {
    if (v.count >= 1) activated++;
    if (v.count >= 5) engaged++;
    if (v.days.size >= 2) returning++;
  }

  // D1/D7 kohort hesabı (B52, 2026-07-31) — veri zaten elde, yalnız hesap eksikti.
  const DAY_MS = 86_400_000;
  const todayStartMs = startOfDayUtc(0).getTime();
  const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  let d1Eligible = 0, d1Returned = 0, d7Eligible = 0, d7Returned = 0;
  for (const v of matchesByUser.values()) {
    let d0Ms = Number.POSITIVE_INFINITY;
    for (const day of v.days) {
      const ms = Date.parse(`${day}T00:00:00.000Z`);
      if (Number.isFinite(ms) && ms < d0Ms) d0Ms = ms;
    }
    if (!Number.isFinite(d0Ms)) continue;

    // D1: yalnız D0+1 günü tamamen geçmişse say.
    if (d0Ms + DAY_MS < todayStartMs) {
      d1Eligible++;
      if (v.days.has(dayKey(d0Ms + DAY_MS))) d1Returned++;
    }
    // D7: D0+1..D0+7 penceresinin tamamı geçmişse say; pencerede TEK maç yeter.
    if (d0Ms + 7 * DAY_MS < todayStartMs) {
      d7Eligible++;
      for (let k = 1; k <= 7; k++) {
        if (v.days.has(dayKey(d0Ms + k * DAY_MS))) { d7Returned++; break; }
      }
    }
  }
  const rate = (ret: number, el: number) => (el > 0 ? Math.round((ret / el) * 100) : null);

  const trend: { date: string; signups: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = startOfDayUtc(i).getTime();
    const dayEnd = startOfDayUtc(i - 1).getTime();
    let s = 0;
    for (const u of users) {
      const t = u.created_at ? new Date(u.created_at).getTime() : 0;
      if (t >= dayStart && t < dayEnd) s++;
    }
    trend.push({ date: startOfDayUtc(i).toISOString().slice(5, 10), signups: s });
  }

  return {
    registered: users.length,
    confirmed: users.filter((u) => !!u.email_confirmed_at).length,
    activated,
    engaged,
    returning,
    d1: { eligible: d1Eligible, returned: d1Returned, rate: rate(d1Returned, d1Eligible) },
    d7: { eligible: d7Eligible, returned: d7Returned, rate: rate(d7Returned, d7Eligible) },
    signupTrend: trend,
  };
}

// ── 3) INSIGHTS — map/agent/side + win rates + quality ───────────────────────

export type DistRow = { name: string; matches: number; winRate: number | null };
export type InsightsData = {
  totalRated: number;
  maps: DistRow[];
  agents: DistRow[];
  sides: DistRow[];
  avgDecisionScore: number | null;
};

export async function getInsights(): Promise<InsightsData> {
  const svc = createServiceSupabase();
  const { data } = await svc
    .from("analyses")
    .select("riot_id, region, raw_result_json")
    .limit(20000);

  const rows = (data ?? []) as {
    riot_id: string | null;
    region: string | null;
    raw_result_json: Record<string, unknown> | null;
  }[];

  const mapAgg = new Map<string, { n: number; w: number; known: number }>();
  const agentAgg = new Map<string, { n: number; w: number; known: number }>();
  const sideAgg = new Map<string, { n: number; w: number; known: number }>();
  let dsSum = 0, dsCount = 0;

  function bump(m: Map<string, { n: number; w: number; known: number }>, key: string | null | undefined, won: unknown) {
    if (!key) return;
    const k = String(key).toLowerCase();
    const cur = m.get(k) ?? { n: 0, w: 0, known: 0 };
    cur.n++;
    if (typeof won === "boolean") { cur.known++; if (won) cur.w++; }
    m.set(k, cur);
  }

  for (const r of rows) {
    const j = r.raw_result_json ?? {};
    const won = j.won;
    bump(mapAgg, (j.map as string) ?? r.riot_id, won);
    bump(agentAgg, (j.agent as string) ?? r.region, won);
    bump(sideAgg, j.side as string, won);
    const ds = j.decisionScore;
    if (typeof ds === "number" && Number.isFinite(ds)) { dsSum += ds; dsCount++; }
  }

  // fmt (2026-07-09 beta cilası): gruplama anahtarı lowercase-kanonik kalır
  // ('bind'/'Bind' birleşik sayılır) ama görüntü adı resmi biçime çevrilir;
  // 'unknown' senteli TR 'Bilinmiyor' olur — panele İngilizce 'unknown' çıkmaz.
  function top(
    m: Map<string, { n: number; w: number; known: number }>,
    limit: number,
    fmt: (s: string) => string,
  ): DistRow[] {
    return [...m.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, limit)
      .map(([name, v]) => ({ name: fmt(name) || "Bilinmiyor", matches: v.n, winRate: v.known > 0 ? Math.round((v.w / v.known) * 100) : null }));
  }

  return {
    totalRated: rows.length,
    maps: top(mapAgg, 12, formatMap),
    agents: top(agentAgg, 12, formatAgent),
    sides: top(sideAgg, 4, (s) => formatSide(s, "tr")),
    avgDecisionScore: dsCount > 0 ? Math.round((dsSum / dsCount) * 10) / 10 : null,
  };
}

// ── 4) RECENT FEEDBACK SAMPLING ──────────────────────────────────────────────

export type FeedbackSample = {
  id: string;
  userId: string;
  userLabel: string;
  createdAt: string;
  summary: string | null;
  mistake: string | null;
  map: string | null;
  agent: string | null;
};

export async function getRecentFeedback(limit = 25): Promise<FeedbackSample[]> {
  const svc = createServiceSupabase();
  const { data } = await svc
    .from("analyses")
    .select("id, user_id, riot_id, region, summary, weakness, raw_result_json, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as {
    id: string; user_id: string; riot_id: string | null; region: string | null;
    summary: string | null; weakness: string | null;
    raw_result_json: Record<string, unknown> | null; created_at: string;
  }[];

  const ids = [...new Set(rows.map((r) => r.user_id))];
  const labelById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profs } = await svc.from("profiles").select("user_id, username").in("user_id", ids);
    for (const p of (profs ?? []) as { user_id: string; username: string | null }[]) {
      if (p.username) labelById.set(p.user_id, p.username);
    }
  }

  return rows.map((r) => {
    const j = r.raw_result_json ?? {};
    return {
      id: r.id,
      userId: r.user_id,
      userLabel: labelById.get(r.user_id) ?? r.user_id.slice(0, 8),
      createdAt: r.created_at,
      summary: r.summary ?? (j.summary as string) ?? null,
      mistake: r.weakness ?? (j.mistake as string) ?? null,
      map: formatMap((j.map as string) ?? r.riot_id) || null,
      agent: formatAgent((j.agent as string) ?? r.region) || null,
    };
  });
}

// ── 5) PER-DEATH FEEDBACK (the ACTUAL coaching users get, every death) ────────

export type DeathFeedback = {
  id: string;
  userId: string | null;
  userLabel: string;
  createdAt: string;
  map: string | null;
  agent: string | null;
  deathLoc: string | null;
  deathAnalysis: string | null;
  enemyAnalysis: string[];
  nextRoundSuggestion: string | null;
  tableMissing: boolean;
};

export async function getRecentDeathFeedback(limit = 30): Promise<DeathFeedback[]> {
  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from("match_events")
    .select("id, user_id, map, agent, death_loc, feedback, created_at")
    .not("feedback", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [{ id: "missing", userId: null, userLabel: "", createdAt: "", map: null, agent: null, deathLoc: null, deathAnalysis: null, enemyAnalysis: [], nextRoundSuggestion: null, tableMissing: true }];

  const rows = (data ?? []) as {
    id: string; user_id: string | null; map: string | null; agent: string | null;
    death_loc: string | null; feedback: Record<string, unknown> | null; created_at: string;
  }[];

  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean) as string[])];
  const labelById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profs } = await svc.from("profiles").select("user_id, username").in("user_id", ids);
    for (const p of (profs ?? []) as { user_id: string; username: string | null }[]) {
      if (p.username) labelById.set(p.user_id, p.username);
    }
  }

  return rows.map((r) => {
    const f = r.feedback ?? {};
    const enemy = Array.isArray(f.enemyAnalysis) ? (f.enemyAnalysis as unknown[]).map(String) : [];
    return {
      id: r.id,
      userId: r.user_id,
      userLabel: r.user_id ? (labelById.get(r.user_id) ?? r.user_id.slice(0, 8)) : "—",
      createdAt: r.created_at,
      map: formatMap(r.map) || null,
      agent: formatAgent(r.agent) || null,
      deathLoc: scrubDeathLoc(r.death_loc),
      deathAnalysis: (f.deathAnalysis as string) ?? null,
      enemyAnalysis: enemy,
      nextRoundSuggestion: (f.nextRoundSuggestion as string) ?? null,
      tableMissing: false,
    };
  });
}

// ── SUPPORT MESSAGES (Yardım / Sorular) ──────────────────────────────────────
// User-submitted support questions from the desktop "Destek" screen. Read via
// service-role (RLS-bypass) for the admin panel. Graceful when the table doesn't
// exist yet (migration 0010 not applied) — the page shows a hint, never crashes.

export type SupportMessage = {
  id: string;
  userId: string | null;
  userLabel: string;
  email: string | null;
  message: string;
  status: string;
  createdAt: string;
};

export type SupportMessages = {
  messages: SupportMessage[];
  tableMissing: boolean;
};

export async function getSupportMessages(limit = 100): Promise<SupportMessages> {
  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from("support_messages")
    .select("id, user_id, email, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Table not created yet (migration 0010 not applied) → graceful.
  if (error) return { messages: [], tableMissing: true };

  const rows = (data ?? []) as {
    id: string; user_id: string | null; email: string | null;
    message: string; status: string; created_at: string;
  }[];

  // Resolve usernames for a friendlier label (falls back to email, then id).
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean) as string[])];
  const labelById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profs } = await svc.from("profiles").select("user_id, username").in("user_id", ids);
    for (const p of (profs ?? []) as { user_id: string; username: string | null }[]) {
      if (p.username) labelById.set(p.user_id, p.username);
    }
  }

  return {
    tableMissing: false,
    messages: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userLabel: r.user_id
        ? (labelById.get(r.user_id) ?? r.email ?? r.user_id.slice(0, 8))
        : (r.email ?? "—"),
      email: r.email,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
    })),
  };
}
