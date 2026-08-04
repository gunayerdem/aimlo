-- ═══════════════════════════════════════════════════════════════
-- AIMLO — lookup_email_by_username throttle SIKILAŞTIRMA: 30/dk → 6/dk
-- (güvenlik denetimi beta4 · 2026-08-04)
-- ═══════════════════════════════════════════════════════════════
--
-- ── NASIL ÇALIŞTIRILIR ──
--   Supabase Dashboard → SQL Editor → bu dosyanın TAMAMINI yapıştır → Run.
--   (Proje ref: bzwnchzetebwrdedkjkq.) İdempotent: tekrar çalıştırmak güvenli.
--   Ön koşul: 0014_username_lookup_throttle.sql uygulanmış olmalı — bu dosya
--   0014'ün tablosunu `if not exists` ile yine de kurar, böylece fonksiyon
--   asla var-olmayan bir tabloya referans veremez (plpgsql gövdesi CREATE
--   anında doğrulanmaz; eksik tablo ancak İLK LOGIN'de patlardı).
--
-- ── GERİ ALMA (rollback) ──
--   supabase/0014_username_lookup_throttle.sql dosyasını AYNEN yeniden
--   çalıştır. 0014 aynı fonksiyonu `create or replace` ile c_limit=30 olarak
--   geri yazar; şema değişikliği yok, veri kaybı yok, anında etkili.
--   (Alternatif: aşağıdaki gövdede tek satır — `c_limit constant integer := 6;`
--   → 30 yapıp bu dosyayı yeniden çalıştır.)
--
-- ── NEDEN (bulgu) ──
-- 0014 anon throttle'ı IP başına dakikada 30 çağrıya ayarladı. Bu, kötüye
-- kullanım tarafında IP başına 30 × 60 × 24 = 43.200 sorgu/gün demek. RPC
-- `kullanıcı-adı → E-POSTA` döndürdüğü için bu bir PII HASADI yüzeyi: elde
-- bir kullanıcı-adı sözlüğü (Valorant adları herkese açık) olan biri günde
-- on binlerce ad deneyip gerçek e-posta adresleri toplayabilir. Anon grant
-- KASITLI ve KALIYOR (desktop login ona bağlı — CLAUDE.md koruma emri;
-- aşağıda grant aynen yeniden veriliyor), bu yüzden tek kaldıraç eşik.
--
-- ── KANIT: meşru maliyeti YOK, çünkü normal akış çağrı başına 1 kullanır ──
--   • DESKTOP (tek anon çağıran): aimlo-desktop/src/App.tsx:2215-2220 —
--     login denemesi başına TEK `POST /rest/v1/rpc/lookup_email_by_username`,
--     RETRY YOK, ve yalnız girdi "@" İÇERMİYORSA (e-posta ile giriş yapan
--     kullanıcı bu RPC'ye hiç dokunmaz).
--   • WEB login: service-role client ile çağırıyor
--     (app/(auth)/login/actions.ts) → 0014'teki service_role MUAFİYETİ
--     gereği sayaca HİÇ girmiyor; ortak Vercel IP'si etkilenmez.
--   • IP okunamazsa throttle uygulanmaz (fail-open) — 0014'ten devralındı.
--
-- ── KABUL EDİLEN RİSK ve neden sınırlı ──
-- 6/dk/IP: aynı genel IP'nin ARDINDA dakika içinde 7+ kullanıcı-adıyla giriş
-- denemesi olursa 7.'si 429 alır (desktop bunu "Kullanıcı bulunamadı" diye
-- gösterir — App.tsx:2223-2226, yanıltıcı mesaj, DESKTOP tarafı ayrı iş).
-- Sınırlı kalmasının nedeni: sayaç `date_trunc('minute', now())` kovasında,
-- yani kilit EN FAZLA o dakikanın sonuna kadar sürer (<60 sn) ve kendi
-- kendine açılır — kalıcı kilitlenme mümkün değil. Bugünkü kullanıcı
-- hacminde tek bir genel IP'nin arkasında aynı dakikada 7 farklı AIMLO
-- girişi pratikte görülmez. Şikâyet gelirse rollback tek adım (yukarıda).
--
-- ── KALICI ÇÖZÜM (bu dosyada DEĞİL, 0014'ün notu hâlâ geçerli) ──
-- Backend'e POST /api/auth/resolve-username (authRateLimit("login", ...))
-- ekle, desktop'ı bir sonraki sürümde ona geçir, sonra
-- `revoke execute on function public.lookup_email_by_username(text) from anon`.
-- İkinci iyileştirme adayı: aynı kullanıcı-adının TEKRARINI saymamak
-- (satıra last_username_hash kolonu) — meşru şifre-deneme döngüsünü tamamen
-- muaf tutar; login-kritik fonksiyonda şema değişikliği gerektirdiği için
-- bu güvenlik dalgasına ALINMADI.
--
-- ⚠ DEĞİŞEN TEK ŞEY: c_limit sabiti (30 → 6). Fonksiyon imzası, dönüş tipi
--   (text), volatility (VOLATILE — sayaç INSERT'i gerektiriyor), search_path,
--   SECURITY DEFINER, throttle mantığı, PT429 sözleşmesi ve anon/authenticated
--   grant'ı 0014 ile BİREBİR AYNI. Desktop/web sözleşmesi değişmiyor.
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1) Sayaç tablosu — 0014 ile birebir aynı, yalnız güvence amaçlı tekrar
--    (hepsi idempotent; 0014 uygulanmışsa hiçbir şey değişmez)
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
-- 2) RPC — 0014'ün gövdesi AYNEN, tek fark c_limit 30 → 6
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
  -- 0014'te 30'du. 30/dk = 43.200/gün/IP → kullanıcı-adı sözlüğüyle e-posta
  -- hasadı için fazlasıyla geniş bir pencere (güvenlik denetimi beta4,
  -- 2026-08-04). 6/dk: normal login denemesi başına 1 çağrı yapar
  -- (aimlo-desktop/src/App.tsx:2215-2220, retry yok; e-postayla giriş bu
  -- RPC'ye hiç dokunmaz), web login service_role muafiyetiyle sayaç dışında —
  -- yani meşru akışın maliyeti YOK. Hasat hızı 7.200/gün/IP'ye iner (−%83).
  -- Kilit en fazla içinde bulunulan dakika kovası kadar sürer (<60 sn).
  c_limit     constant integer := 6;
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
-- `create or replace function` mevcut grant'ları düşürmez; yine de 0014 ile
-- aynı satırı açıkça tekrar ediyoruz ki bu dosya tek başına çalıştırıldığında
-- da login akışı kesinlikle ayakta kalsın.
grant execute on function public.lookup_email_by_username(text) to anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 3) DOĞRULAMA (elle — SQL Editor / curl)
-- ──────────────────────────────────────────────────────────────
-- 1) Eşiğin gerçekten 6 olduğunu doğrula (kaynak metinden oku):
--    select prosrc like '%c_limit     constant integer := 6;%' as limit_is_6
--      from pg_proc where proname = 'lookup_email_by_username';
--    → true bekleniyor.
--
-- 2) Anon grant duruyor mu (desktop login KRİTİK):
--    select has_function_privilege('anon',
--             'public.lookup_email_by_username(text)', 'execute') as anon_ok;
--    → true bekleniyor. false ise DERHAL yukarıdaki grant satırını çalıştır.
--
-- 3) Mutlu yol bozulmadı: anon key ile
--    POST /rest/v1/rpc/lookup_email_by_username {"lookup_username":"softi"}
--    → 200 + e-posta (mevcut davranış).
--
-- 4) Eşik: aynı IP'den arka arkaya 7 çağrı → 7.'si 429 "rate limited".
--    Bir sonraki dakika kovasında yeniden 200 dönmeli (kilit kalıcı değil).
--
-- 5) Sayaç görünümü:
--    select ip_hash, minute_bucket, hits from public.username_lookup_log
--      order by minute_bucket desc limit 5;
-- ═══════════════════════════════════════════════════════════════
