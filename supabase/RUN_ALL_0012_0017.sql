-- ═══════════════════════════════════════════════════════════════════════════
--  AIMLO — 0012 → 0017 MİGRASYONLARI  (TEK DOSYA, TEK ÇALIŞTIRMA)
-- ═══════════════════════════════════════════════════════════════════════════
--  NASIL: Supabase Dashboard → proje bzwnchzetebwrdedkjkq → SQL Editor →
--         New query → BU DOSYANIN TAMAMINI yapıştır → Run.
--
--  GÜVENLİ:
--    · Hiçbir veri SİLİNMEZ. Yalnız tablo/kural/fonksiyon EKLENİR.
--    · Hepsi tekrar-çalıştırılabilir (idempotent) — iki kez koşman zarar vermez.
--    · Mevcut bozuk profil satırları migration'ı PATLATMAZ (kural NOT VALID
--      eklenir: bundan sonraki yazımlar denetlenir, eskiler dokunulmaz).
--    · lookup_email_by_username'in anon yetkisi BİLEREK korunur — desktop
--      girişi ona bağlı.
--
--  BİTİNCE: aynı klasördeki VERIFY_0012_0017.sql dosyasını çalıştır.
--           On satırın hepsi ✅ olmalı.
--
--  HATA GELİRSE: panik yok, yıkıcı bir şey yok. Hata metnini Claude'a gönder.
-- ═══════════════════════════════════════════════════════════════════════════


-- ###########################################################################
-- ##  0012_storage_releases.sql
-- ###########################################################################

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


-- ###########################################################################
-- ##  0013_profiles_constraints.sql
-- ###########################################################################

-- ═══════════════════════════════════════════════════════════════
-- AIMLO — profiles alan kısıtları (B20 · 2026-07-31)
-- ═══════════════════════════════════════════════════════════════
-- NEDEN: `profiles_self_update` (0002_otp_auth.sql:104-107) kullanıcıya kendi
-- satırında SINIRSIZ yazma veriyor, tablo tanımında (0002:48-56) tek bir CHECK
-- yok. Doğrulama SADECE register akışında (app/(auth)/schemas.ts:9-27, zod).
-- Yani kayıtlı herhangi bir kullanıcı kendi JWT'siyle
--   PATCH /rest/v1/profiles?user_id=eq.<kendi-id>
-- atıp username/display_name/first_name/last_name alanlarına İSTEDİĞİ metni
-- (uzunluk + karakter sınırı olmadan) yazabiliyor:
--   (a) `=cmd|'/C ...'!A0` gibi bir username, /admin CSV export'u Excel'de
--       açıldığında formül olarak çalışır (softi'nin kendi iş istasyonu),
--   (b) megabaytlık display_name admin panelini ve getUsersList'i şişirir.
--
-- Bu migration zod kurallarını DB seviyesine mühürler (tek gerçek sınır).
--
-- ⚠️ İKİNCİ KATMAN BU DOSYADA DEĞİL: app/api/admin/export/route.ts:7-10
--    `csvCell` hâlâ baştaki `=`, `+`, `-`, `@` karakterlerini nötrlemiyor.
--    O fix ayrı pakette (backend) — bu migration onun yerine geçmez.
--
-- İdempotent: tekrar çalıştırmak güvenlidir.
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1) CHECK kısıtları
-- ──────────────────────────────────────────────────────────────
-- Kısıt önce NOT VALID eklenir (yeni/güncellenen HER satır anında denetlenir),
-- sonra mevcut satırlar için VALIDATE denenir. Prod'da eski bir satır kuralı
-- ihlal ediyorsa migration ÇÖKMEZ; NOTICE basar ve koruma yine de aktif olur.
do $$
declare
  c record;
begin
  for c in
    select * from (values
      ('profiles_username_chk',
       $q$username is null or (username::text) ~ '^[A-Za-z0-9_]{3,20}$'$q$),
      ('profiles_display_name_len_chk',
       $q$display_name is null or length(display_name) <= 40$q$),
      ('profiles_first_name_len_chk',
       $q$first_name is null or length(first_name) <= 40$q$),
      ('profiles_last_name_len_chk',
       $q$last_name is null or length(last_name) <= 40$q$)
    ) as t(cname, cexpr)
  loop
    if not exists (
      select 1 from pg_constraint
       where conrelid = 'public.profiles'::regclass
         and conname  = c.cname
    ) then
      execute format(
        'alter table public.profiles add constraint %I check (%s) not valid',
        c.cname, c.cexpr
      );
      raise notice 'AIMLO/B20: kisit EKLENDI -> %', c.cname;
    end if;

    begin
      execute format('alter table public.profiles validate constraint %I', c.cname);
    exception
      when check_violation then
        raise notice
          'AIMLO/B20: % DOGRULANAMADI (mevcut satirlarda ihlal var). Kisit yeni yazmalar icin AKTIF. Ihlalli satirlari temizleyip su komutu calistir: alter table public.profiles validate constraint %;',
          c.cname, c.cname;
    end;
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────
-- 2) Kayıt trigger'ı yeni kısıtla çakışmasın (regresyon koruması)
-- ──────────────────────────────────────────────────────────────
-- 0002'deki tg_handle_new_user, first_name metadata'sı yoksa display_name'i
-- `split_part(email,'@',1)`den türetiyor — e-posta local-part'ı 64 karaktere
-- kadar çıkabilir, bu da yeni 40-karakter kısıtını ihlal edip KAYIT AKIŞINI
-- kırardı. Aynı gövde + isim alanlarında left(...,40) kırpması.
-- (Normal register akışında zod zaten <=40 gönderiyor; bu yalnız savunma.)
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name, first_name, last_name, username)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)), 40),
    left(new.raw_user_meta_data->>'first_name', 40),
    left(new.raw_user_meta_data->>'last_name', 40),
    new.raw_user_meta_data->>'username'   -- kırpma YOK: regex kısıtı geçerli olmalı
  );
  return new;
end;
$$;

-- ──────────────────────────────────────────────────────────────
-- 3) DOĞRULAMA (elle çalıştır)
-- ──────────────────────────────────────────────────────────────
-- select conname, convalidated
--   from pg_constraint
--  where conrelid = 'public.profiles'::regclass and contype = 'c';
--
-- Beklenen davranış (kullanıcı JWT'siyle):
--   update public.profiles set username = '=cmd|x' where user_id = auth.uid();
--   → ERROR: new row for relation "profiles" violates check constraint
--            "profiles_username_chk"
-- ═══════════════════════════════════════════════════════════════


-- ###########################################################################
-- ##  0014_username_lookup_throttle.sql
-- ###########################################################################

-- ═══════════════════════════════════════════════════════════════
-- AIMLO — lookup_email_by_username DB-seviyesi throttle (B33 · 2026-07-31)
-- ═══════════════════════════════════════════════════════════════
-- NEDEN: 0003_user_lookup.sql:62-65 yorumu "enumeration ... mitigated at the
-- application layer by aggressive rate limiting on the /login server action
-- (lib/auth-rate-limit.ts)" diyor. Bu, DESKTOP yolunda GEÇERSİZ: uygulama
-- backend'e hiç uğramıyor, doğrudan PostgREST'e vuruyor —
--   aimlo-desktop/src/App.tsx:1486-1490
--     POST {SUPABASE_URL}/rest/v1/rpc/lookup_email_by_username  (anon key ile)
-- Anon key hem desktop binary'sinde hem web bundle'ında herkese açık, yani
-- kullanıcı-adı → e-posta sözlük taraması bugün pratikte SINIRSIZ.
--
-- FIX: sayacı RPC'nin İÇİNE koy (tek yer, her istemci için geçerli).
--   • dakika + IP başına sayaç, eşik üstü → PT429 (PostgREST HTTP 429)
--   • anon grant KALIYOR — desktop login ona bağlı, kaldırmak ürünü kırar
--   • service_role MUAF: web login server action'ı service-role client'la
--     çağırıyor (app/(auth)/login/actions.ts:77,92) ve tüm istekler Vercel'in
--     ORTAK IP'sinden gelir; muaf olmasa tek IP altında herkesi kilitlerdi
--   • IP okunamazsa THROTTLE YOK (fail-open) — login'i asla kırma
--
-- KALICI ÇÖZÜM (bu dosyada DEĞİL): backend'e POST /api/auth/resolve-username
-- (authRateLimit("login", ...)) ekle, desktop'ı bir sonraki sürümde ona geçir,
-- sonra `revoke execute ... from anon`.
--
-- ⚠️ VOLATILITY DEĞİŞİYOR: fonksiyon 0003'te STABLE'dı; sayaç yazdığı için
--    artık VOLATILE olmak ZORUNDA (Postgres non-volatile fonksiyonda INSERT'e
--    izin vermez). PostgREST volatile fonksiyonu yalnız POST ile çağırır —
--    her iki istemci de zaten POST kullanıyor:
--      desktop: App.tsx:1487 `method: "POST"`
--      web    : supabase-js `.rpc()` (varsayılan POST)
--    RPC'yi GET ile çağıran YENİ bir istemci yazma.
--
-- İdempotent: tekrar çalıştırmak güvenlidir.
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1) Sayaç tablosu (IP ham saklanmaz — sha256 hash)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.username_lookup_log (
  ip_hash       text        not null,
  minute_bucket timestamptz not null,
  hits          integer     not null default 0,
  primary key (ip_hash, minute_bucket)
);

create index if not exists username_lookup_log_bucket_idx
  on public.username_lookup_log (minute_bucket);

alter table public.username_lookup_log enable row level security;

-- ai_usage kalıbı: anon/authenticated için HİÇ policy yok — yalnız
-- SECURITY DEFINER fonksiyon (sahibi postgres) yazar.
revoke all on public.username_lookup_log from anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 2) RPC — aynı sözleşme (text döner), önünde throttle
-- ──────────────────────────────────────────────────────────────
create or replace function public.lookup_email_by_username(lookup_username text)
returns text
language plpgsql
volatile                         -- 0003'te STABLE'dı; sayaç INSERT'i bunu gerektiriyor
security definer
set search_path = public, auth
as $$
declare
  found_email text;
  v_headers   json;
  v_ip        text;
  v_role      text;
  v_hash      text;
  v_bucket    timestamptz;
  v_hits      integer;
  -- Dakikada 30: normal login 1 çağrı yapar, yani ~30x pay. Ortak NAT/okul
  -- ağında bile yanlış kilitlenme pratik olarak imkânsız; sözlük taraması ise
  -- ilk 30 denemede durur.
  c_limit     constant integer := 30;
begin
  -- Çağıran rol. ÜÇ kaynağa birden bakılıyor: service_role muafiyetinin
  -- kaçırılması web login'ini (tek Vercel IP'si) kilitleyeceği için burada
  -- fazladan sağlamlık ucuz. Sırası: PostgREST JWT claim GUC'ları (sürüme
  -- göre biri dolu) → PostgREST'in `set local role` ile koyduğu `role` GUC'u
  -- (SECURITY DEFINER bunu değiştirmez, dış rol görünür).
  begin
    v_role := coalesce(
      nullif(current_setting('request.jwt.claim.role', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role',
      nullif(current_setting('role', true), 'none')
    );
  exception when others then
    v_role := null;
  end;

  if v_role is distinct from 'service_role' then
    begin
      v_headers := nullif(current_setting('request.headers', true), '')::json;
    exception when others then
      v_headers := null;
    end;

    if v_headers is not null then
      -- cf-connecting-ip Cloudflare tarafından YAZILIR (istemci sahteleyemez);
      -- yoksa x-real-ip, en son XFF'in ilk elemanı.
      v_ip := coalesce(
        nullif(v_headers ->> 'cf-connecting-ip', ''),
        nullif(v_headers ->> 'x-real-ip', ''),
        nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), '')
      );
    end if;

    -- v_ip null ise (header yok / doğrudan SQL çağrısı) throttle UYGULANMAZ.
    if v_ip is not null then
      v_hash   := encode(sha256(convert_to(v_ip || '|aimlo-username-lookup', 'utf8')), 'hex');
      v_bucket := date_trunc('minute', now());

      insert into public.username_lookup_log as l (ip_hash, minute_bucket, hits)
      values (v_hash, v_bucket, 1)
      on conflict (ip_hash, minute_bucket)
        do update set hits = l.hits + 1
      returning l.hits into v_hits;

      if v_hits > c_limit then
        -- PostgREST: 'PTxyz' SQLSTATE'i HTTP xyz'ye çevirir → 429.
        -- (Desteklemeyen sürümde 500 döner; her iki durumda da istek BLOKLANIR.)
        -- NOT: raise transaction'ı geri alır, yani sayaç c_limit'te ÇAKILI kalır
        -- ve o dakika boyunca her çağrı bloklanır — istenen davranış bu.
        raise sqlstate 'PT429'
          using message = 'rate limited',
                hint    = 'too many username lookups from this address';
      end if;

      -- Fırsatçı temizlik (pg_cron gerektirmez): ~%1 çağrıda eski satırları sil.
      if random() < 0.01 then
        delete from public.username_lookup_log
         where minute_bucket < now() - interval '10 minutes';
      end if;
    end if;
  end if;

  -- ── Asıl sözleşme: username → email (0003 ile birebir aynı) ──
  select u.email
    into found_email
    from public.profiles p
    join auth.users u on u.id = p.user_id
   where p.username = lookup_username::citext
   limit 1;
  return found_email;
end;
$$;

-- Anon grant BİLEREK korunuyor — desktop login akışı buna bağlı (CLAUDE.md).
grant execute on function public.lookup_email_by_username(text) to anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 3) DOĞRULAMA (elle)
-- ──────────────────────────────────────────────────────────────
-- 1) Normal: anon key ile POST /rest/v1/rpc/lookup_email_by_username
--    {"lookup_username":"softi"} → 200 + e-posta (mevcut davranış)
-- 2) 31 kez arka arkaya aynı IP'den → 429 "rate limited"
-- 3) select ip_hash, minute_bucket, hits from public.username_lookup_log
--      order by minute_bucket desc limit 5;
-- ═══════════════════════════════════════════════════════════════


-- ###########################################################################
-- ##  0015_telemetry_events.sql
-- ###########################################################################

-- ═══════════════════════════════════════════════════════════════
-- AIMLO — telemetry_events kalıcı defteri (B5 · 2026-07-31)
-- ═══════════════════════════════════════════════════════════════
-- NEDEN: Desktop düzgün topluyor, backend düzgün doğruluyor
-- (lib/telemetry-types.ts validateTelemetryEvent), sonra veri
-- app/api/telemetry/route.ts:102-128'de `console.log` ile stdout'a yazılıp
-- ÖLÜYOR — Vercel logları kısa ömürlü. error_code_count (ai_timeout vb.),
-- ai_call_duration p50/p95, round_end_latency, match_completed: hepsi kayıp.
-- Launch haftasında "AI hata oranı arttı mı? gecikme kötüleşti mi? kaç maç
-- tamamlandı?" sorularının HİÇBİRİ cevaplanamıyor.
--
-- 0007_ai_usage.sql aynı sorunu maliyet için çözmüştü; bu tablo o kalıbın
-- telemetri karşılığı: RLS açık + anon/authenticated'a HİÇ policy yok →
-- yalnız service-role yazar (route) ve okur (admin paneli).
--
-- GİZLİLİK: kullanıcı kimliği ASLA ham girmez. Route zaten
-- `sha256(user.id).slice(0,16)` üretiyor (route.ts:47-49) — `user_hash`
-- tam olarak o değerdir. PII (e-posta, kullanıcı adı, IP, UA) burada YOK.
--
-- Kolon adları lib/telemetry-types.ts `TelemetryEvent` alanlarının birebir
-- snake_case karşılığı — desktop↔backend sözleşmesi (camelCase JSON) DEĞİŞMEZ.
--
-- ⚠️ YAZMA TARAFI BU DOSYADA DEĞİL: app/api/telemetry/route.ts'e
--    `saveAiUsage` kalıbında NON-BLOCKING insert eklenmeli (console.log
--    satırları kalsın). O fix ayrı pakette.
--
-- İdempotent: tekrar çalıştırmak güvenlidir.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.telemetry_events (
  id          uuid primary key default gen_random_uuid(),
  -- sha256(user_id) ilk 16 hex — route.ts:47-49 hashUserId() ile aynı değer
  user_hash   text        not null,
  -- TelemetryEventType: round_end_latency_ms | ai_call_duration_ms |
  -- error_code_count | ocr_frame_budget_ms | match_completed
  type        text        not null,
  -- *_ms tiplerinde ölçüm (ms). Kesirli gelebilir → double precision.
  value       double precision,
  -- error_code_count için toplam adet
  count       integer,
  -- OverlayError kodu (error_code_count)
  code        text,
  -- ai_call_duration_ms için route adı: vision | report | match-report | insight
  route       text,
  round       integer,
  -- Şu an sözleşmede YOK; sürüm-bazlı regresyon takibi için ileriye dönük
  -- (desktop bir sonraki sürümde gönderirse kolon hazır).
  app_version text,
  -- Olayın CİHAZDA oluştuğu an (event.ts). created_at'ten 30 dk'ya kadar
  -- eski olabilir: desktop flush aralığı 30 dk (telemetry.rs FLUSH_INTERVAL).
  event_ts    timestamptz,
  created_at  timestamptz not null default now(),

  -- lib/telemetry-types.ts TELEMETRY_LIMITS aynası (defense-in-depth):
  constraint telemetry_events_code_len_chk       check (code        is null or length(code)        <= 64),
  constraint telemetry_events_route_len_chk      check (route       is null or length(route)       <= 64),
  constraint telemetry_events_type_len_chk       check (length(type) between 1 and 64),
  constraint telemetry_events_userhash_len_chk   check (length(user_hash) between 8 and 64),
  constraint telemetry_events_appversion_len_chk check (app_version is null or length(app_version) <= 32)
);

create index if not exists telemetry_events_created_idx
  on public.telemetry_events (created_at desc);
create index if not exists telemetry_events_type_created_idx
  on public.telemetry_events (type, created_at desc);
-- Hata-oranı kartı: error_code_count satırlarını koda göre daralt.
create index if not exists telemetry_events_code_created_idx
  on public.telemetry_events (code, created_at desc)
  where code is not null;

alter table public.telemetry_events enable row level security;

-- ai_usage kalıbı: anon/authenticated için HİÇ policy yok — yalnız service-role.
revoke all on public.telemetry_events from anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- DOĞRULAMA / örnek sorgular (admin kartı bunların üstüne kurulur)
-- ──────────────────────────────────────────────────────────────
-- -- p50 / p95 gecikme (son 24s, route bazlı):
-- select route,
--        percentile_cont(0.5)  within group (order by value) as p50,
--        percentile_cont(0.95) within group (order by value) as p95,
--        count(*) as n
--   from public.telemetry_events
--  where type = 'ai_call_duration_ms' and created_at > now() - interval '24 hours'
--  group by route;
--
-- -- Hata oranı (son 24s):
-- select code, sum(count) as hits
--   from public.telemetry_events
--  where type = 'error_code_count' and created_at > now() - interval '24 hours'
--  group by code order by hits desc;
-- ═══════════════════════════════════════════════════════════════


-- ###########################################################################
-- ##  0016_ai_usage_rollup.sql
-- ###########################################################################

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


-- ###########################################################################
-- ##  0017_feedback_rating.sql
-- ###########################################################################

-- ═══════════════════════════════════════════════════════════════
-- AIMLO — feedback_ratings (👍/👎 koçluk kalite sinyali)
-- KARŞI-DENETİM 2026-07-31 · R8 onarımı
-- ═══════════════════════════════════════════════════════════════
-- ⚠️  YENİ MİGRASYON — PRODA UYGULANMADI. Supabase SQL Editor'de
--     (proje bzwnchzetebwrdedkjkq) ELLE koşulacak. 0002–0016'nın aksine
--     "zaten canlı" VARSAYMA. Tablo yokken /api/feedback-rating dürüstçe
--     503 döner (uydurma başarı yok) — UI bozulmaz, sinyal yazılmaz.
--
-- NEDEN: bu gece desktop'a 👍/👎 butonları eklendi (aimlo-desktop
-- src/App.tsx `rateFeedback`) ama backend'de ne route ne tablo vardı →
-- istek 404, sinyal sessizce kayıp, UI ise "kaydedildi" diyordu.
-- app/api/feedback-rating/route.ts o ucu kapatır; bu dosya da kalıcı defteri.
--
-- RLS modeli — 0007_ai_usage / 0015_telemetry_events kalıbı:
-- RLS AÇIK + anon/authenticated'a HİÇ policy yok → tabloya yalnız
-- service-role (API route + ileride admin paneli) erişir. Kullanıcı kendi
-- seçimini zaten localStorage'da tutuyor, sunucudan geri okumasına gerek yok.
--
-- Kolonlar desktop sözleşmesinin (camelCase JSON) birebir snake_case
-- karşılığıdır; desktop↔backend sözleşmesi DEĞİŞMEZ.
--
-- İdempotent (IF NOT EXISTS): tekrar çalıştırmak güvenlidir.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.feedback_ratings (
  id          uuid primary key default gen_random_uuid(),
  -- DOĞRULANMIŞ JWT'den gelir, gövdeden ASLA. Hesap silinince sinyal de gider.
  user_id     uuid        not null references auth.users(id) on delete cascade,
  -- Puanlanan kartın kimliği (desktop `ratingKey`):
  --   "report:<uuid>" | "round:<uuid>:<n>" | "live-report:<map>:<score>" | "live-round:<map>:<n>"
  -- Canlı (live-*) anahtarlarda maç henüz kaydedilmediği için match_id NULL'dur.
  rating_key  text        not null,
  rating      text        not null,
  -- "round" | "report" — opsiyonel: bir çağrı yeri unutursa satır yine yazılsın.
  scope       text,
  -- Kayıtlı maç puanlamalarında dolu; canlı maç kartlarında NULL.
  match_id    uuid,
  round       integer,
  map         text,
  agent       text,
  created_at  timestamptz not null default now(),
  -- 👍→👎 dönüşünde upsert bunu tazeler; created_at ilk puanlama anını korur.
  updated_at  timestamptz not null default now(),

  -- app/api/feedback-rating/route.ts doğrulamasının DB aynası (derinlemesine savunma):
  constraint feedback_ratings_rating_chk     check (rating in ('up','down')),
  constraint feedback_ratings_scope_chk      check (scope is null or scope in ('round','report')),
  constraint feedback_ratings_key_len_chk    check (length(rating_key) between 1 and 200),
  constraint feedback_ratings_round_chk      check (round is null or (round >= 0 and round <= 99)),
  constraint feedback_ratings_map_len_chk    check (map   is null or length(map)   <= 48),
  constraint feedback_ratings_agent_len_chk  check (agent is null or length(agent) <= 48)
);

-- Aynı kartın tek satırı olsun: kullanıcı 👍'dan 👎'ya dönebilir. Route'un
-- upsert'ü (onConflict: "user_id,rating_key") TAM OLARAK bu indekse dayanır —
-- indeks yoksa upsert hata verir, yani bu satır ZORUNLU.
create unique index if not exists feedback_ratings_user_key_uidx
  on public.feedback_ratings (user_id, rating_key);

-- Admin kartı: en yeni sinyaller + harita/ajan kırılımı.
create index if not exists feedback_ratings_created_idx
  on public.feedback_ratings (created_at desc);
create index if not exists feedback_ratings_match_idx
  on public.feedback_ratings (match_id)
  where match_id is not null;

alter table public.feedback_ratings enable row level security;

-- ai_usage / telemetry_events kalıbı: anon ve authenticated'a HİÇ policy yok.
-- Açıkça revoke — ileride yanlışlıkla verilen bir GRANT yüzeyi genişletmesin.
revoke all on public.feedback_ratings from anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- DOĞRULAMA / örnek sorgular
-- ──────────────────────────────────────────────────────────────
-- -- Genel memnuniyet (son 7 gün):
-- select rating, count(*) from public.feedback_ratings
--  where created_at > now() - interval '7 days' group by rating;
--
-- -- Koçluğun en kötü olduğu harita/ajan (👎 oranı, en az 5 sinyal):
-- select map, agent,
--        count(*) filter (where rating = 'down')::float / count(*) as down_rate,
--        count(*) as n
--   from public.feedback_ratings
--  where map is not null
--  group by map, agent having count(*) >= 5
--  order by down_rate desc;
-- ═══════════════════════════════════════════════════════════════

