# KVKK Aydınlatma Metni — hukukçu taslağı

> **DURUM: HUKUKÇU ONAYI BEKLİYOR.** Bu belge yayında DEĞİL. Aşağıdaki hukuki
> sebep, toplama yöntemi, saklama süresi ve yurt dışı aktarım önerileri **aday**
> seçeneklerdir; hiçbiri karar değildir. Karar softi'nin ve hukukçunun.
>
> Kaynak: son audit F49 (2026-09-24). Hazırlayan: FB02 paketi.

## 0. Bu pakette yayına giren (yalnız olgusal düzeltmeler)

Kodla doğrulanmış, hukuki seçim içermeyen düzeltmeler `app/legal/kvkk/page.tsx`
ve `app/legal/privacy/page.tsx`'e işlendi:

- Veri sorumlusu satırı artık `lib/seller.ts` (`SELLER`) tek kaynağından okunuyor:
  unvan, adres, vergi dairesi + VKN, e-posta. Eskiden yalnız "AIMLO platformu"
  yazıyordu; bu bir kişi değil.
- Veri kategorilerine eklenenler: ekran görüntüsü, destek mesajları, SHA-256 ile
  özetlenmiş kullanıcı kimliğiyle teknik telemetri.
- Alıcılara eklenenler: Upstash (hız sınırı sayaçları), Vercel Analytics ve
  Speed Insights.
- Gizlilik Politikası'ndaki "OpenAI (sadece prompt verisi)" yanlıştı; ölünen
  round'da ekran görüntüsü de gidiyor.

**Bilerek DOKUNULMAYANLAR** (bu belgenin konusu):

- KVKK md.10 kapsamında her amacın hukuki sebebi ve toplama yöntemi (sayfada hiç yok).
- md.9 yurt dışı aktarım dayanağı ve sayfadaki "açık rızanız esas alınır" cümlesi.
- Saklama süreleri (sayfada hiç yok).
- İşleme amaçları listesi (destek ve telemetri için ayrı amaç yazılmadı).

## 1. Veri envanteri (koddan çıkarıldı)

| # | Veri | Nereden gelir | Nerede durur | Kanıt |
|---|---|---|---|---|
| 1 | E-posta, kullanıcı adı, ad, soyad, şifre (hash) | Web kayıt formu | Supabase Auth (`auth.users` + `user_metadata`), `profiles` | `app/(auth)/register/actions.ts` registerAction, `app/(auth)/schemas.ts` |
| 2 | Doğrulama kodu (OTP) özeti, son kullanma, deneme sayısı | Sunucu üretir | `user_metadata.otp` (10 dk ömür) | `app/(auth)/verify/actions.ts` |
| 3 | Maç analizi: harita, ajan, taraf, round, skor, ölüm yeri, koç metni | Masaüstü uygulaması (ekrandan okunan değerler) | `analyses`, `player_memory`, `match_events` | `app/api/ai/vision/route.ts`, `app/api/ai/report/route.ts` |
| 4 | Ekran görüntüsü (oyun karesi) | Masaüstü uygulaması | **Saklanmaz.** Yalnız `died !== false` iken OpenAI'ye gider | `app/api/ai/vision/route.ts` buildUserContent; route görseli DB'ye/storage'a yazmaz |
| 5 | Destek mesajı + hesabın e-postası | Masaüstü Destek ekranı | `support_messages` + destek posta kutusuna bildirim e-postası (Resend) | `app/api/support/route.ts`, `lib/email.ts` sendSupportNotification |
| 6 | Teknik telemetri (süre, hata kodu, sürüm) | Masaüstü uygulaması | `telemetry_events` — kimlik yalnız `sha256(user.id)` ilk 16 hane | `app/api/telemetry/route.ts` |
| 7 | Hız sınırı sayaçları: IP, e-posta/kullanıcı adı, kullanıcı kimliği | Her istek | Upstash Redis (pencere süresi kadar TTL) | `lib/api-auth.ts`, `lib/auth-rate-limit.ts` |
| 8 | AI kullanım kaydı (token, gecikme) | Sunucu | `ai_usage` | `lib/ai-usage.ts` |
| 9 | Sayfa görüntüleme / performans ölçümü | Tarayıcı | Vercel Analytics, Speed Insights | `app/layout.tsx` |
| 10 | Oturum çerezleri | Supabase Auth | Tarayıcı | `lib/supabase` |

Not: `match_events` ve `ai_usage` tablolarında `user_id` `on delete set null`;
hesap silinince satır kalır ama kimlik bağı kopar (supabase/0007, 0008).
`support_messages` da set null; F50 (aynı paket) hesap silinmeden ÖNCE bu
satırları service-role ile siliyor.

## 2. Her amaç için aday hukuki sebep ve toplama yöntemi (md.10/1-d)

Toplama yöntemi her satırda aynı sınıfta: **otomatik yollarla, elektronik
ortamda** (web formu, masaüstü uygulaması, sunucu kayıtları). Hukukçunun
teyit edeceği aday sebepler (KVKK md.5/2):

| Amaç | Veri | Aday hukuki sebep | Soru |
|---|---|---|---|
| Hesap açma ve oturum | #1, #2, #10 | md.5/2-c sözleşmenin kurulması/ifası | — |
| Koçluk hizmetinin sunulması | #3, #4 | md.5/2-c sözleşmenin ifası | Ekran görüntüsünde üçüncü kişi içeriği (masaüstündeki başka pencereler) bulunabilir; ayrıca değerlendirilmeli |
| Destek taleplerini yanıtlama | #5 | md.5/2-c ya da 5/2-f meşru menfaat | Amaç listesine ayrıca yazılmalı mı? |
| Hata ve performans ölçümü | #6, #8, #9 | md.5/2-f meşru menfaat | Amaç listesine ayrıca yazılmalı mı? |
| Kötüye kullanım ve bot tespiti | #7 | md.5/2-f meşru menfaat | — |
| Yasal yükümlülükler (fatura vb.) | ödeme kayıtları (Paddle açılınca) | md.5/2-ç hukuki yükümlülük | Ödeme henüz canlı değil |

## 3. Saklama süresi önerileri

| Veri | Bugünkü davranış (kod) | Öneri (karar değil) |
|---|---|---|
| Hesap verisi, analizler, oyuncu hafızası | Hesap silinene kadar; silmede CASCADE | Aynı + metne yazılsın |
| OTP | 10 dakika | Aynı |
| Ekran görüntüsü | AIMLO'da saklanmaz; OpenAI tarafı OpenAI'nin API politikası | OpenAI API saklama süresi hukukçuyla teyit edilsin |
| Destek mesajları (DB) | F50 ile hesap silmede silinir | Çözümden sonra N ay (ör. 12) + hesap silmede hemen |
| Destek bildirim e-postaları (posta kutusu) | Elle silinmedikçe kalır | Bkz. §7 |
| Telemetri | Süresiz (TTL yok) | 90–180 gün |
| `match_events`, `ai_usage` | Süresiz, hesap silinince kimliksizleşir | Süre belirlensin |
| Hız sınırı anahtarları | Pencere süresi (dakika–gün) | Aynı |
| İndirme sayacı | 90 gün, kişisel veri yok | — |

## 4. Adi ortaklıkta veri sorumlusu kim?

`lib/seller.ts`: "GÜNAY ERDEM VE KAAN DAĞDELEN ADİ ORTAKLIĞI". Adi ortaklığın
tüzel kişiliği yok. Sorular:

- Veri sorumlusu ortakların her biri mi (müşterek veri sorumluluğu), yoksa
  metinde ortaklık unvanı yeterli mi?
- VERBİS kaydı gerekiyor mu (çalışan sayısı / yıllık mali bilanço eşikleri ve
  yurt dışında yerleşik olma durumu)?
- Sayfada bugün unvan + adres + VKN + e-posta yazıyor; ortakların adları
  unvanın içinde zaten var.

## 5. Açık rıza — ayrı kutu, zaman damgası, metin sürümü

Bugün: kayıtta TEK birleşik kutu var (`RegisterForm.tsx` kvkk kutusu,
`schemas.ts` `kvkk: z.literal("on")`) ve onay **hiçbir yere yazılmıyor**
(`register/actions.ts` createUser çağrısında onay alanı yok). Sayfadaki "açık
rızanız esas alınır" iddiası bu yüzden ispatlanamıyor.

Öneri (hukukçu açık rıza gerekiyor derse):

1. Aydınlatma metnini okuduğunu onaylama ile açık rıza **ayrı** kutular olsun;
   açık rıza kutusu hizmet şartına bağlanmasın.
2. Kayıtta onay zaman damgası ve metin sürümü yazılsın, ör.
   `user_metadata.consents = { kvkk_notice: { version: "2026-09-24", at: <ISO> }, explicit_transfer: {...} }`
   ya da ayrı bir `consents` tablosu (RLS: yalnız sahibi okur).
3. Metin sürümü sayfadaki "Son güncelleme" tarihiyle eşleşsin; metin değişince
   sürüm artsın.

## 6. Yurt dışı aktarım (md.9, 2024 değişikliği)

Alıcıların hepsi Türkiye dışında: Supabase (AB, eu-central-1 — gizlilik
politikası), Vercel (fra1 bölgesi), Upstash (Frankfurt/eu-central-1 —
`lib/admin-infra.ts` konsol notu), OpenAI (ABD). Resend'in veri bölgesi repoda
kayıtlı değil, teyit edilmeli. Sayfadaki "açık rızanız esas alınır" cümlesi değişiklik
öncesi rejime göre yazılmış olabilir. Hukukçuya sorular:

- Her alıcı için dayanak ne: yeterlilik kararı, standart sözleşme (ve Kurul'a
  bildirim), yoksa arızi aktarım istisnaları?
- Standart sözleşme yoluna gidilecekse hangi sağlayıcılarla, kim imzalayacak?

## 7. Resend posta kutusundaki destek kopyaları

Destek formu her mesajı `SUPPORT_NOTIFY_TO` adresine e-posta olarak da
gönderiyor (`lib/email.ts` sendSupportNotification: kullanıcının e-postası,
`user_id` ve mesaj metni). F50 ile hesap silme DB satırlarını siliyor ama bu
e-postaları silemez. F50 ile silme sayfası bu kopyalar için kullanıcıyı
support@aimlo.gg'ye yönlendiriyor. Sorular:

- Posta kutusundaki kopyalar için saklama süresi ne olsun?
- Hesap silme talebinde bu kopyalar elle mi silinecek, yoksa bildirim e-postası
  mesaj metni taşımayacak biçimde mi değiştirilsin (yalnız "yeni ticket var" +
  panel bağlantısı)?
- Resend'in kendi gönderim kayıtlarındaki saklama süresi.
