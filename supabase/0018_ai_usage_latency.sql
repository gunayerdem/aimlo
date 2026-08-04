-- ═══════════════════════════════════════════════════════════════
-- AIMLO — ai_usage'a match_id + latency_ms kolonları (F8 · pano dalga, 2026-08-04)
-- ═══════════════════════════════════════════════════════════════
-- NASIL ÇALIŞTIRILIR (softi, elle):
--   Supabase Dashboard → SQL Editor → bu dosyanın içeriğini yapıştır → Run.
--   (Alternatif: psql ile aynı içerik.) İdempotent — tekrar çalıştırmak
--   güvenlidir (ADD COLUMN IF NOT EXISTS). Yalnız EKLEMELİ: mevcut satırlara,
--   index'lere, RLS'e ve 0016 RPC'sine DOKUNMAZ.
--
-- NEDEN: /admin/cost paneli maliyeti görüyor ama "hangi maçın çağrısı" ve
-- "AI ne kadar sürdü" soruları cevapsız. match_id ile report çağrısı
-- analizle eşlenir; latency_ms ile route-bazlı AI gecikme trendi izlenir.
--
-- ⚠️ match_id'ye BİLEREK foreign key YOK: matchId istemci-seçimli bir UUID ve
--    analyses satırı her zaman var olmayabilir (persistOnServer:false akışı,
--    ya da usage insert'i analiz insert'inden ÖNCE koşabilir). FK koysaydık
--    usage yazımı patlar, maliyet defteri sessizce eksik kalırdı.
--
-- ⚠️ KOD DAYANIKLI: lib/ai-usage.ts bu migration UYGULANMADAN da çalışır —
--    yeni kolonlu insert "unknown column" ile düşerse aynı kaydı eski kolon
--    setiyle bir kez daha dener. Yani sıralama serbest: önce deploy, sonra
--    migration da olur; tersi de.
-- ═══════════════════════════════════════════════════════════════

alter table public.ai_usage
  add column if not exists match_id   uuid,    -- report çağrısının bağlı olduğu maç (istemci UUID'si); diğer route'larda null
  add column if not exists latency_ms integer; -- ölçülen AI çağrı süresi (ms); eski satırlarda null

comment on column public.ai_usage.match_id   is 'Report route: istemcinin matchId UUID''si (FK YOK — analyses satırı garanti değil). Diğer route''larda null.';
comment on column public.ai_usage.latency_ms is 'AI çağrısının ölçülen süresi (ms, fetch başlangıcı → usage parse). Migration öncesi satırlarda null.';

-- ──────────────────────────────────────────────────────────────
-- DOĞRULAMA (elle)
-- ──────────────────────────────────────────────────────────────
-- select column_name, data_type from information_schema.columns
--  where table_schema = 'public' and table_name = 'ai_usage'
--  order by ordinal_position;
-- -- Beklenen: ... match_id (uuid), latency_ms (integer) satırları görünür.
-- ═══════════════════════════════════════════════════════════════
