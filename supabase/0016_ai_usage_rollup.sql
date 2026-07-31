-- ═══════════════════════════════════════════════════════════════
-- AIMLO — ai_usage gün+route toplamları RPC'si (B103 · 2026-07-31)
-- ═══════════════════════════════════════════════════════════════
-- NEDEN: lib/admin-data.ts:345-348 `/cost` sayfası için ai_usage'dan
-- `.limit(100000)` ile HAM SATIR çekiyor ve toplamı :366-381'de Node
-- tarafında döngüyle hesaplıyor. force-dynamic olduğu için (app/admin/cost/
-- page.tsx:5) her görüntüleme tüm geçmişi fonksiyona taşıyor. 100 aktif
-- kullanıcı × 20 çağrı/maç × 1 maç/gün ≈ 60K satır/ay → birkaç ayda limit'e
-- dayanır ve 100K sonrası SESSİZCE eksik toplam gösterir (maliyet takibi
-- yanlışlanır).
--
-- FIX: agregasyonu SQL'e taşı. Satır sayısı gün × route × model ile sınırlı
-- (yılda ~1.500 satır), büyümeden bağımsız.
--
-- ⚠️ FİYAT MANTIĞI DEĞİŞMİYOR: USD burada HESAPLANMAZ. 0007_ai_usage.sql'in
--    kuralı korunuyor — maliyet OKUMA anında lib/openai-pricing.ts ile token
--    kolonlarından hesaplanır, böylece fiyat değişince tüm geçmiş backfill'siz
--    yeniden fiyatlanır. Bu yüzden `model` de grup anahtarında: JS grup başına
--    computeCost(..., model) çağırabilsin.
--
-- ⚠️ ÇAĞIRAN TARAF BU DOSYADA DEĞİL: lib/admin-data.ts getCostData() bu RPC'ye
--    geçmeli (`svc.rpc("ai_usage_daily_totals", { p_since: null })`). O fix
--    ayrı pakette; RPC eklenmesi tek başına mevcut davranışı değiştirmez.
--
-- İdempotent: tekrar çalıştırmak güvenlidir.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.ai_usage_daily_totals(p_since timestamptz default null)
returns table (
  day               date,
  route_type        text,
  model             text,
  calls             bigint,
  prompt_tokens     bigint,
  completion_tokens bigint,
  cached_tokens     bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    -- JS tarafındaki `new Date(created_at).toISOString().slice(0,10)` ile
    -- birebir aynı gün anahtarı (UTC).
    (u.created_at at time zone 'utc')::date            as day,
    u.route_type,
    u.model,
    count(*)::bigint                                   as calls,
    coalesce(sum(u.prompt_tokens), 0)::bigint          as prompt_tokens,
    coalesce(sum(u.completion_tokens), 0)::bigint      as completion_tokens,
    coalesce(sum(u.cached_tokens), 0)::bigint          as cached_tokens
    from public.ai_usage u
   where p_since is null or u.created_at >= p_since
   group by 1, 2, 3
   order by 1 desc;
$$;

-- ai_usage servis-rol tablosu (0007: anon/authenticated'a policy YOK).
-- RPC de aynı sınırda kalsın — admin paneli service-role ile okuyor.
revoke execute on function public.ai_usage_daily_totals(timestamptz) from public, anon, authenticated;
grant  execute on function public.ai_usage_daily_totals(timestamptz) to service_role;

-- ──────────────────────────────────────────────────────────────
-- DOĞRULAMA (elle)
-- ──────────────────────────────────────────────────────────────
-- select * from public.ai_usage_daily_totals(null) limit 20;
-- -- Ham toplamla tutmalı:
-- select sum(prompt_tokens), sum(completion_tokens), sum(cached_tokens), count(*)
--   from public.ai_usage;
-- select sum(prompt_tokens), sum(completion_tokens), sum(cached_tokens), sum(calls)
--   from public.ai_usage_daily_totals(null);
-- ═══════════════════════════════════════════════════════════════
