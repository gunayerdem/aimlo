// Admin data layer — server-only. All reads use the service-role client (bypasses
// RLS) and are called ONLY from admin-gated Server Components / route handlers.
// NEVER import this from a client component.
import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServiceSupabase } from "@/lib/supabase/server";
import { computeCost } from "@/lib/openai-pricing";

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

  for (const a of analyses) {
    const t = new Date(a.created_at).getTime();
    if (t >= dayAgo) { dauSet.add(a.user_id); matchesToday++; }
    if (t >= weekAgo) { wauSet.add(a.user_id); matchesWeek++; }
    if (t >= monthAgo) mauSet.add(a.user_id);
    const cur = perUser.get(a.user_id) ?? { matches: 0, last: 0 };
    cur.matches++;
    if (t > cur.last) cur.last = t;
    perUser.set(a.user_id, cur);
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
};

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const svc = createServiceSupabase();

  const { data: authData } = await svc.auth.admin.getUserById(userId);
  const authUser = authData?.user ?? null;

  const [profileRes, analysesRes, memoryRes, usageRes] = await Promise.all([
    svc.from("profiles").select("username, display_name").eq("user_id", userId).maybeSingle(),
    svc
      .from("analyses")
      .select("id, riot_id, region, raw_result_json, created_at")
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
    raw_result_json: Record<string, unknown> | null;
    created_at: string;
  }[]).map((a) => {
    const r = a.raw_result_json ?? {};
    return {
      id: a.id,
      map: (r.map as string) ?? a.riot_id ?? null,
      agent: (r.agent as string) ?? a.region ?? null,
      side: (r.side as string) ?? null,
      score: (r.score as string) ?? null,
      won: typeof r.won === "boolean" ? (r.won as boolean) : null,
      createdAt: a.created_at,
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
  };
}

// ── Cost ─────────────────────────────────────────────────────────────────────

export type CostData = {
  rows: number;
  total: number;
  today: number;
  week: number;
  byRoute: { route: string; calls: number; cost: number }[];
  daily: { date: string; cost: number; calls: number }[];
  tokens: { input: number; output: number; cached: number };
};

export async function getCostData(): Promise<CostData> {
  const svc = createServiceSupabase();
  const { data } = await svc
    .from("ai_usage")
    .select("route_type, model, prompt_tokens, completion_tokens, cached_tokens, created_at")
    .limit(100000);

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
  const byRoute = new Map<string, { calls: number; cost: number }>();
  const dailyMap = new Map<string, { cost: number; calls: number }>();

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
    const r = byRoute.get(u.route_type) ?? { calls: 0, cost: 0 };
    r.calls++; r.cost += c; byRoute.set(u.route_type, r);
    const day = new Date(u.created_at).toISOString().slice(0, 10);
    const d = dailyMap.get(day) ?? { cost: 0, calls: 0 };
    d.cost += c; d.calls++; dailyMap.set(day, d);
  }

  const daily: { date: string; cost: number; calls: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = startOfDayUtc(i).toISOString().slice(0, 10);
    const d = dailyMap.get(day) ?? { cost: 0, calls: 0 };
    daily.push({ date: day.slice(5), cost: Number(d.cost.toFixed(4)), calls: d.calls });
  }

  return {
    rows: usage.length,
    total, today, week,
    byRoute: [...byRoute.entries()].map(([route, v]) => ({ route, ...v })).sort((a, b) => b.cost - a.cost),
    daily,
    tokens: { input: tIn, output: tOut, cached: tCached },
  };
}
