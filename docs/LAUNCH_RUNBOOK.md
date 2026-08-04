# AIMLO Launch Runbook

> **Ne bu:** Launch günü ve sonrası ilk 48 saat için OPERASYON prosedürleri.
> Bu belge KARAR vermez — kararlar softi'nin; burada yalnız "karar verildiğinde
> hangi düğmeye hangi sırayla basılır" yazar. (F34+B1, pano dalga, 2026-08-04)
>
> Kod referansları yazım anındaki duruma göredir; bir prosedür koşulmadan önce
> ilgili dosyadaki güncel durumu doğrula (özellikle env adları ve limitler).

---

## 1. FREE_TIER_ENFORCED flip — ücretsiz kota kapısını açma

Kota modeli (`lib/entitlements.ts`): ücretsiz hesap **haftada 3 MAÇ** (ISO
hafta, Pazartesi 00:00 UTC sıfırlanır), AIMLO+ abonesi **ayda 100 maç** adil
kullanım. Bayrak **şu an KAPALI** (softi kararı: "betada sınırsız"). Bayrak
kapalıyken kota yolu tek ağ çağrısı bile yapmaz — flip tamamen geri alınabilir.

### 1.1 Ön koşullar (flip'ten ÖNCE kontrol et)

- [ ] Prod'da `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` tanımlı.
      Yoksa bayrak açık olsa bile kota **sessizce uygulanmaz** (log:
      `[entitlements] FREE_TIER_ENFORCED açık ama UPSTASH_* eksik`).
- [ ] `subscriptions` tablosu DB'de var (`supabase/0011` — prod'da uygulı).
      Tablo yoksa kod FAIL-OPEN yapar: paywall zorlanmaz, kimse kilitlenmez.
- [ ] Desktop'ın yayındaki sürümü 402'yi düzgün karşılıyor (yükseltme
      CTA'sı gösteriyor, sahte feedback ÜRETMİYOR). Emin değilsen önce
      1.3'teki provayı staging/test hesabıyla koş.

### 1.2 Flip adımları

1. Env'i ekle (değer TAM OLARAK `true` olmalı — başka her değer = kapalı):
   ```
   vercel env add FREE_TIER_ENFORCED production
   # değer sorulduğunda: true
   ```
2. **Redeploy** — env değişikliği mevcut deployment'a işlemez, yeni deployment
   gerekir. İki yol:
   - Vercel dashboard → Deployments → en son production deployment → **Redeploy**
     (kod değişikliği yoksa en temizi bu), veya
   - `vercel redeploy <son-prod-deployment-url>` (CLI).
3. Deploy READY olunca 1.3'teki 402 provasını koş.

### 1.3 402 provası (flip sonrası doğrulama)

1. **Ücretsiz test hesabıyla** 3 FARKLI `matchId` için analiz tüket. İki yol:
   - Gerçek yol: desktop ile 3 kısa maç analizi, VEYA
   - Hızlı yol: Upstash konsolundan sayacı elle doldur —
     key `aimlo:free_matches:<userId>:<ISO-hafta>` (örn. `...:2026-W32`,
     hafta anahtarı `isoWeekKey()` formatı), `SADD` ile 3 sahte üye +
     `EXPIRE 691200` (8 gün).
2. **4. maç** için istek at → hem `/api/ai/vision` hem `/api/ai/report`
   şunu dönmeli: HTTP **402**, gövde
   `{ "error": "quota_exceeded", "message": "...", "detail": { "used": 3, "limit": 3, "resetsAt": "<ISO>" } }`.
3. **Desktop yükseltme akışı:** 402 alan desktop, yükseltme CTA'sını
   göstermeli; koç metni yerine boş/sahte içerik GÖSTERMEMELİ. Aynı maçın
   (aynı `matchId`) tekrar çağrıları yeni hak YAKMAMALI (SET üyeliği).
4. **AIMLO+ tarafı:** aktif abonelik satırı olan test hesabı haftalık 3'e
   TAKILMAMALI (aylık 100 fair-use kovasına düşer; aşımda mesaj "abone ol"
   satışı yapmaz — R14).
5. Vercel loglarında `[QUOTA]` satırlarını gör (aşağıda §2).

### 1.4 GERİ ALMA (rollback)

1. `vercel env rm FREE_TIER_ENFORCED production`
2. Redeploy (1.2 adım 2 ile aynı).
3. Bu kadar — bayrak İLK kontrol edildiği için kapalıyken davranış beta ile
   birebir aynıdır. Upstash'taki `aimlo:free_matches:*` /
   `aimlo:plus_matches:*` anahtarlarını silmek GEREKMEZ (TTL 8/40 gün,
   kendiliğinden düşer).

---

## 2. İzleme — launch sonrası ilk 48 saat

| Ne | Nerede | Ne sıklıkta | Neye bakılır |
|---|---|---|---|
| AI maliyeti | `aimlo.gg/admin/cost` | günde en az 1 | günlük toplam + kullanıcı-başı uç değerler. Ölçülen en-kötü gün/kullanıcı ≈ **$0.79** (2026-08-04 tablosu, `lib/api-auth.ts`); bunun üstü anomali |
| Firewall / bot-challenge | Vercel dashboard → Firewall | ilk 48s günde 2 | 403 challenge'a takılan desktop istekleri. GEÇMİŞ DERS: bot-challenge feedback'i sessizce öldürdü; desktop retry'ı var ama challenge oranı artarsa system-bypass kuralını gözden geçir (IP-bazlı çalışıyor, custom-rule bypass ÇALIŞMIYOR) |
| Upstash | Upstash konsol panosu | günde 1 | komut hacmi, hata oranı, latency. DİKKAT: rate-limit prod'da FAIL-CLOSED — Upstash düşerse AI route'ları kapanır (kullanıcı etkisi anında); kota (entitlements) tarafı FAIL-OPEN, o düşerse yalnız bedava analiz kaçar |
| `[QUOTA]` logları | Vercel → Logs, arama: `[QUOTA]` | ilk 48s günde 2 | vision: `free tier limit reached`, report: `report blocked`, artı AIMLO+ `adil kullanım tavanı doldu` uyarıları. Hacim beklenenden yüksekse bayrak/limit kararını softi'ye taşı |
| Telemetri hata sayaçları | `telemetry_events` (kind `error_code_count`) — admin/insights | günde 1 | hata kodu artışları; sürüm alanıyla birlikte oku ki yeni desktop sürümü regresyonu eski sürüm gürültüsünden ayrılsın |
| Destek | `aimlo.gg/admin/support` | günde 2 | yeni ticket'lar — launch günü ilk gerçek-kullanıcı sinyali çoğu zaman buradan gelir |

---

## 3. Acil durum prosedürleri

### 3.1 Kötü deploy → rollback

```
vercel rollback            # bir önceki production deployment'a döner
# veya: vercel rollback <deployment-url>
```
- Rollback **kodu** geri alır, **env'leri ALMAZ** — sorun env kaynaklıysa
  (örn. yeni eklenen bayrak) env'i kaldırıp redeploy et (§1.4 deseni).
- Git tarafı: `main`'e revert commit'i ancak softi onayıyla push edilir
  (push = auto-deploy).

### 3.2 Rate-limit sıkılaştırma (saldırı / maliyet patlaması)

- Kalıcı sıkılaştırma: `lib/api-auth.ts` içindeki `RATE_LIMITS` (dakikalık)
  ve `DAILY_QUOTA` (günlük) değerlerini indir → deploy. KURAL (dosyada
  yazılı): kota değişince `npx tsx scripts/measure-quota-cost.ts` yeniden
  koşulur ve maliyet tablosu güncellenir.
- `STRICT_RATE_LIMIT="true"` env'i prod'da EK sıkılık GETİRMEZ (prod zaten
  fail-closed); o bayrak staging'e prod-sertliği vermek içindir.
- Tek kullanıcı kötüye kullanıyorsa: limitleri herkese indirmek yerine
  o hesabı softi kararıyla ele al (bypass'ın tersi yok — gerekirse
  Supabase'den hesabı askıya alma kararı softi'nin).

### 3.3 Meşru kullanıcı limite takılıyor → runtime bypass

- `aimlo.gg/admin` → kullanıcı detayı → rate-bypass toggle, veya
  `POST /api/admin/rate-bypass` gövde `{ "userId": "<uuid>", "grant": true }`.
- Özellikler: **24 saat TTL** (kendiliğinden düşer), yalnız limit AŞILDIĞINDA
  bakılır, UUID v4 zorunlu, admin-audit'e loglanır.
- Geri alma: aynı yerden `grant:false` (revoke).

### 3.4 Billing webhook acil kapama

- `PADDLE_WEBHOOK_SECRET` (ve/veya `STRIPE_WEBHOOK_SECRET`) env'ini kaldır →
  redeploy → route **503 uyku moduna** döner, hiçbir şey yazmaz.
- Veri kaybolmaz: sağlayıcı 5xx/503'te retry eder (Paddle saatlerce tekrar
  dener); secret geri konunca kaçan event'ler idempotent işlenir
  (`billing_events` UNIQUE(provider,event_id) defteri).

### 3.5 Kota kapısı acil kapama

- §1.4 ile aynı: env'i kaldır + redeploy. Upstash temizliği gerekmez.

---

## 4. Bilinen açık kararlar (launch anında bilinçli-açık bırakılanlar)

1. **Kota bayrağı (`FREE_TIER_ENFORCED`)** — KAPALI. Açma kararı ve zamanı
   softi'nin; prosedür §1. Karar verilene dek herkes sınırsız.
2. **Paddle onboarding** — webhook kodu hazır ama UYKUDA
   (`PADDLE_WEBHOOK_SECRET` yok). Secret konmadan önce
   `app/api/billing/webhook/route.ts` içindeki **sandbox doğrulama
   TODO-listesi** tek tek işaretlenmeli (imza, subscription.activated/
   canceled, transaction.completed tutarı, `custom_data.user_id`).
   Checkout sayfası HENÜZ YAZILMADI — yazılırken `custom_data.user_id`
   YALNIZ sunucu-doğrulamalı oturumdan konur (route başındaki M2 uyarısı).
   Fiyat kararı: 499 TL / $9.99; satıcı künyesi `lib/seller.ts`.
3. **Kod-imza sertifikası** — SSL.com eSigner (sipariş `co-9c115mr8012`)
   validation bekliyor; bulut imzalama, token yok → pipeline
   otomatikleştirilebilir. Sertifika gelene dek SmartScreen uyarısı sürer;
   bu bilinen ve kabul edilmiş bir launch durumudur.
4. **Preview-secrets ayrımı** — Vercel preview ortamının prod secret'larını
   (service-role key, `OPENAI_API_KEY`, `UPSTASH_*`) paylaşıp paylaşmadığı
   gözden geçirilecek; hedef: preview'a ayrı/boş değerler, prod service-role
   asla preview branch'lerine sızmasın.
5. **Updater-anahtar yedeği** — Tauri updater private key'inin tek kopya
   kalmaması için offline yedek alınacak. Anahtar kaybı = mevcut kurulumlara
   bir daha güncelleme İTİLEMEZ (yeni sürüm ancak elle indirme ile dağıtılır);
   bu yüzden yedek launch-sonrası ilk hafta işi değil, İLK GÜN işidir.
