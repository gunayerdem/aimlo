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
