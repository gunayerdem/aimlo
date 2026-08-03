-- ═══════════════════════════════════════════════════════════════
-- AIMLO — 0012–0017 migration DOĞRULAMA sorgusu
-- ═══════════════════════════════════════════════════════════════
-- NE İŞE YARAR: Altı migration'ı çalıştırdıktan SONRA bunu koş. Her satır bir
-- kontrol; "durum" sütununda tamamı ✅ ise iş bitti. ❌ olan satır hangi
-- migration'ın eksik/yarım kaldığını söyler.
--
-- GÜVENLİ: yalnız OKUR. Hiçbir şey yazmaz, değiştirmez, silmez. İstediğin
-- kadar tekrar çalıştırabilirsin.
--
-- NEREDE: Supabase Dashboard → proje bzwnchzetebwrdedkjkq → SQL Editor →
--         içeriği yapıştır → Run.
-- ═══════════════════════════════════════════════════════════════

with kontroller as (

  -- ── 0012: releases bucket herkese-okuma politikası ──
  select
    '0012' as migration,
    'releases bucket public-read politikası' as kontrol,
    exists (
      select 1 from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
        and policyname = 'releases_public_read'
    ) as gecti

  -- ── 0013: profiles alan kısıtları (4 adet) ──
  union all
  select '0013', 'profiles CHECK kısıtları (4/4)',
    (select count(*) from pg_constraint
      where conrelid = 'public.profiles'::regclass
        and contype = 'c'
        and conname in ('profiles_username_chk','profiles_display_name_len_chk',
                        'profiles_first_name_len_chk','profiles_last_name_len_chk')
    ) = 4

  -- ── 0014: username lookup throttle ──
  union all
  select '0014', 'username_lookup_log tablosu',
    to_regclass('public.username_lookup_log') is not null

  union all
  select '0014', 'lookup_email_by_username VOLATILE (sayaç yazabiliyor)',
    exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'lookup_email_by_username'
        and p.provolatile = 'v'
    )

  -- 🔴 EN KRİTİK KONTROL: bu ❌ ise DESKTOP GİRİŞİ KIRILMIŞTIR.
  union all
  select '0014', '⚠ anon yetkisi KORUNDU (desktop girişi buna bağlı)',
    has_function_privilege('anon', 'public.lookup_email_by_username(text)', 'EXECUTE')

  -- ── 0015: telemetri kalıcı defteri ──
  union all
  select '0015', 'telemetry_events tablosu',
    to_regclass('public.telemetry_events') is not null

  union all
  select '0015', 'telemetry_events RLS açık (yalnız service-role yazar)',
    coalesce((select relrowsecurity from pg_class
              where oid = to_regclass('public.telemetry_events')), false)

  -- ── 0016: admin maliyet paneli RPC'si ──
  union all
  select '0016', 'ai_usage_daily_totals RPC''si',
    exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'ai_usage_daily_totals'
    )

  -- ── 0017: 👍/👎 kalite sinyali ──
  union all
  select '0017', 'feedback_ratings tablosu',
    to_regclass('public.feedback_ratings') is not null

  union all
  select '0017', 'feedback_ratings RLS açık',
    coalesce((select relrowsecurity from pg_class
              where oid = to_regclass('public.feedback_ratings')), false)
)
select
  migration,
  case when gecti then '✅' else '❌ EKSİK' end as durum,
  kontrol
from kontroller
order by migration, kontrol;
