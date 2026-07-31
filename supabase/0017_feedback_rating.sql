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
