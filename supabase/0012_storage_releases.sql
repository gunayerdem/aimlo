-- ═══════════════════════════════════════════════════════════════
-- AIMLO — `releases` bucket politikası koda döküldü (B49 · 2026-07-31)
-- ═══════════════════════════════════════════════════════════════
-- NEDEN: Bucket politikaları yalnızca Supabase dashboard'unda duruyordu,
-- repoda tek satır izi yoktu. Yani `authenticated` rolüne INSERT/UPDATE
-- açık kalmış olabilir (bucket oluştururken en sık yapılan hata) ve bunu
-- kimse doğrulayamıyordu. Açıksa herhangi bir kayıtlı kullanıcı
-- `releases/latest.json`ı üzerine yazıp tüm kurulu tabanı DOWNGRADE
-- edebilir ya da indirmeyi kırabilir (minisign imzası sahte MSI'ı önler
-- ama eski-imzalı sürüme düşürmeyi ÖNLEMEZ).
--
-- İSTENEN SON DURUM:
--   • public SELECT (updater + aimlo.gg/download okur)
--   • anon / authenticated için INSERT/UPDATE/DELETE politikası YOK
--   • yazma yalnız service_role ile (release-desktop.ps1, RLS'i bypass eder)
--
-- Okuma yolu : aimlo-desktop/src-tauri/tauri.conf.json:52 (latest.json)
--              app/download/route.ts:10-11
-- Yazma yolu : aimlo-desktop/scripts/release-desktop.ps1:61-65 (service-role)
--
-- İdempotent: tekrar çalıştırmak güvenlidir.
-- NOT: storage.objects sahibi `supabase_storage_admin`. Bu dosyayı Supabase
-- Studio → SQL Editor'de (postgres rolü) çalıştır; policy DDL'i orada geçer.
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1) Bucket var + public-read olsun
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('releases', 'releases', true)
on conflict (id) do update set public = true;

-- ──────────────────────────────────────────────────────────────
-- 2) releases üzerindeki her YAZMA politikasını (anon/authenticated/public)
--    kaldır — dashboard'da ne bırakıldığını bilmediğimiz için tarayıp siliyoruz
-- ──────────────────────────────────────────────────────────────
-- ⚠️ Kapsam: yalnız tanımında 'releases' GEÇEN yazma politikaları düşer.
--    Bugün kodda tek bucket var (grep: yalnız app/download/route.ts:10).
--    İleride `bucket_id in ('releases','baska')` gibi ÇOK-bucket'lı bir
--    politika yazılırsa bu döngü onu da düşürür — o gün burayı daralt.
do $$
declare
  p record;
begin
  for p in
    select policyname,
           cmd,
           roles,
           coalesce(qual, '') || ' ' || coalesce(with_check, '') as def
      from pg_policies
     where schemaname = 'storage'
       and tablename  = 'objects'
  loop
    if p.cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
       and p.def like '%releases%'
       and (p.roles && array['anon', 'authenticated', 'public']::name[])
    then
      execute format('drop policy if exists %I on storage.objects', p.policyname);
      raise notice 'AIMLO/B49: releases yazma politikasi DUSURULDU -> %', p.policyname;
    end if;
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────
-- 3) Tek açık politika: public SELECT
-- ──────────────────────────────────────────────────────────────
drop policy if exists "releases_public_read" on storage.objects;
create policy "releases_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'releases');

-- Tablo seviyesinde `revoke ... on storage.objects from authenticated` BİLEREK
-- yapılmadı: o grant TÜM bucket'lar için geçerli, ileride kullanıcı-yüklemeli
-- bir bucket eklenirse sessizce kırardı. Erişim kontrolü RLS'te: yukarıda
-- yazma politikası bırakılmadığı için anon/authenticated yazamaz (deny-by-default).

-- ──────────────────────────────────────────────────────────────
-- 4) DOĞRULAMA (elle çalıştır — beklenen: yalnız releases_public_read / SELECT)
-- ──────────────────────────────────────────────────────────────
-- select policyname, cmd, roles, qual, with_check
--   from pg_policies
--  where schemaname = 'storage' and tablename = 'objects'
--    and coalesce(qual,'') || coalesce(with_check,'') like '%releases%';
--
-- select id, public from storage.buckets where id = 'releases';  -- public = true
-- ═══════════════════════════════════════════════════════════════
