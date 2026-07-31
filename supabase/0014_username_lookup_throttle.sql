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
