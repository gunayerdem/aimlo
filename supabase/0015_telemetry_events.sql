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
