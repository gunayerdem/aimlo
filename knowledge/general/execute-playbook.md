---
id: general_execute_playbook
type: general
topic: execute-templates
patch: "9.x"
tags: [execute, site-take, entry, trade, utility-dump, fast-slow-tempo]
---

# EXECUTE PLAYBOOK — Site Alma Kitabı

Execute, saldırının site'a commit etme anıdır. Kötü execute utility israfı + bedava ölüm, iyi execute sistematik bir site alma işlemidir. Bu dosya execute'un tiplerini, timing'ini ve rol dağılımını anlatır.

## EXECUTE'UN TEMEL BİLEŞENLERİ

Her execute aynı bileşenlere sahiptir:

1. **Utility dump:** Smoke, flash, molly sırayla patlar.
2. **Entry:** Duelist veya entry rolü oyuncusu ilk girer.
3. **Trade:** Entry'nin hemen arkasından trade'ci.
4. **Support:** Utility desteği, re-flash, cover.
5. **Anchor/Lurker:** Rotate cut, flank watch, post-plant hazırlık.

Bu bileşenlerden biri eksik olursa execute çöker. 5 oyuncu = 5 rol.

## EXECUTE TİPLERİ

### 1. FAST EXECUTE — Tempo Odaklı

Fast execute saldırının hız + sürpriz avantajına dayanır. Minimum utility, maksimum hız. Site'a saldırı savunmanın utility hazırlamasına zaman vermez.

**Ne zaman:**
- Eco veya force round (utility yok, hız var)
- Savunma setup'ı okunmuş (fake'siz direkt bas)
- Bonus round (silah var, utility yok)
- Close range map (Sunset, Bind, Split B, Corrode)

**Nasıl:**
- Utility minimum: 1 smoke, 1 flash, belki 1 molly
- Tüm takım aynı koridordan, spread yok
- Entry + trade + support aynı anda
- Site'ta temizleme yerine direkt plant

**Yasak:**
- Yavaşlama, default yapma
- Utility fazla harcama
- Spread etme

**Win condition:** Savunmanın retake'i düzgün organize edemeden site alınır.

### 2. SLOW EXECUTE — Kontrollü Site Alma

Slow execute utility dominance + disiplin odaklı. Önce bilgi topla, sonra utility dump, sonra commit. Site'ı tam temizleyerek girer.

**Ne zaman:**
- Full buy round, utility stack var
- Rakip savunma bilinmiyor, default gerekli
- Open/uzun map (Breeze, Icebox, Haven)
- Çoklu site olan map (Haven, Lotus — fake gerekli)

**Nasıl:**
- Default açılış penceresinde bilgi toplama
- Mid-round karar ile commit
- Full utility dump (3+ smoke, 2+ flash, 2+ molly)
- Entry + trade + support + lurker disiplini

**Win condition:** Site tam temizlenir, post-plant crossfire hazır, utility'nin bir kısmı post-plant için saklı.

### 3. SPLIT EXECUTE — İki Yönlü Bas

Split execute saldırının iki koridordan aynı anda bas yaparak savunma crossfire'ını bozmasıdır. En güçlü execute tipi ama koordinasyon gerektirir.

**Ne zaman:**
- Mid kontrolü alındı (Ascent, Sunset, Split, Haven)
- Savunma predictable hold pozisyonunda
- Full buy, utility tam

**Nasıl:**
- İki takım parçası: 2-3 kişi bir koridor, 2-3 kişi diğer
- Her iki parça aynı anda commit (timing şart)
- İki parça da utility hazırlıklı olmalı
- Entry her iki taraftan, trade her iki taraftan

**Yasak:**
- Timing bozulması (bir taraf erken commit = diğer taraf savunmasız)
- Communication kopukluğu
- Tek taraf tek başına commit

**Win condition:** Savunma iki angle'a aynı anda bakamaz, biri trade'lenir, crossfire bozulur.

### 4. FAKE EXECUTE — Misdirection

Fake execute savunmanın rotate'ini yanlış yöne çekmek için bir site'a ses/utility yapmak ve asıl commit'i diğer siteye yapmaktır.

**Ne zaman:**
- Savunmanın rotate pattern'i okunduysa
- Full buy round, utility'ye harcama var
- Çoklu site map (Haven, Lotus)

**Nasıl:**
- 1-2 kişi fake site'a ses + utility (ama commit etmez)
- Fake oyuncuları gerçek bir execute gibi davranır (ayak sesi, flash, smoke)
- Savunma rotate eder — boşalan asıl siteye tam takım commit
- Fake oyuncuları fake commit sonrası rotate edip asıl site'a katılır veya flank pozisyonda kalır

**Yasak:**
- Fake'e fazla utility harcama (utility hole yaratır)
- Fake'i yarı yarıya yapma (rakip fake'i anlar)
- Commit timing'i gecikmesi (fake işe yaramadan rakip doğrulama yapar)

**Win condition:** Savunma rotate eder, asıl site zayıflar, execute garanti.

### 5. DEFAULT INTO EXECUTE — Info Ağırlıklı

Default round'un açılış penceresini bilgi toplamaya ayırır. Saldırı savunmanın setup'ını okur, sonra mid-round kararla execute'a geçer.

**Ne zaman:**
- Savunma bilinmiyor
- Full buy
- Rakip stack'ları okunabilir

**Nasıl:**
- Round açılışında default spread — mid, A Main, B Main tarafında info
- IGL mid-round karar verir: hangi site zayıf, hangi utility gerekli
- Execute karar sonrası hızlı commit

**Win condition:** Savunmanın zayıf noktası bulunur, o noktaya commit edilir.

## EXECUTE ROL DAĞILIMI

### Entry Rolü
Siteye ilk giren oyuncu. Duelist rolü (Jett, Raze, Neon, Phoenix, Reyna). İşi ilk duelloyu kabul etmek ve rakip angle'ları yerinden kaldırmak. Entry sık sık ölür — bu normaldir, trade'i alındığı sürece değerli.

**İyi entry:** Flash pop timing'inde peek, dash/movement ability ile angle atla, ilk angle kırıl.
**Kötü entry:** Utility olmadan agresif peek, trade olmadan ilerleme, solo commit.

### Trade Rolü
Entry'nin hemen arkasından giren oyuncu. Entry öldüğünde rakibi trade eder. Initiator veya ikinci duelist rolü.

**İyi trade:** Entry'nin hemen ardından peek, entry'nin açtığı angle'dan ateş et, rakibi rotate ettikten sonra takım için zaman kazan.
**Kötü trade:** Entry'den çok geç peek (rakip angle'ı kapatır), farklı angle'dan peek (entry'nin açtığı angle'ı kullanmama).

### Support Rolü
Utility ile entry + trade'i destekleyen oyuncu. Initiator (Sova, Breach, Skye, Fade, KAY/O, Gekko) veya controller.

**İyi support:** Doğru utility sıralaması, flash zamanında pop, molly rakibi pozisyondan kaldırır.
**Kötü support:** Flash entry'den çok önce, molly yanlış pozisyon, utility eksik.

### Controller Rolü
Smoke'lar, map vision'ı kontrol eder. Execute'un görsel çerçevesi.

**İyi controller:** Smoke'lar doğru angle'ı kapatır, post-plant için smoke saklı.
**Kötü controller:** Smoke'lar geç atılır, tüm smoke'lar execute'a harcanır.

### Anchor/Lurker Rolü
Takım execute'a girerken bir oyuncu diğer tarafta. Flank keser, rotate'i bozar, post-plant'te trade desteği verir.

**İyi lurker:** Rakip rotate hattını tutar, plant'ten sonra fazla kill çıkarır, takıma zaman kazandırır.
**Kötü lurker:** Takımdan çok uzak, solo duello kabul eder, trade alınmaz.

## EXECUTE TIMING

Execute'un zamanlaması rolleri kadar belirleyicidir.

### Round Timing
- **Açılış fazı:** Default/info. Info belirleyici değilse utility de kullanma.
- **Orta faz:** Execute commit window. Bu aralıkta plant olmalı.
- **Geç faz:** Late execute riskli, rakip rotate + stack yapmıştır.
- **Son faz:** Panic execute zone, plan çökmüş.

### Utility Timing
- **Smoke:** Entry'den hemen önce atılır, entry smoke'un arkasından çıkar.
- **Flash:** Entry'nin peek'iyle aynı anda pop etmeli. Pop'tan sonra swing = bedava kör rakip.
- **Molly:** Rakip pozisyondan çıkartmak için — site içindeki anchor'a veya post-plant için.
- **Stun/damage (Breach):** Entry'den hemen önce, stun bitmeden entry girer.

### Trade Timing
- Entry'nin hemen arkasından. Bu pencere doğru — rakip entry'yi öldürdükten sonra nişan alıyorken sen peek edersin.
- Daha erken = trade peek kaybı (entry'yi de yanlış angle'a çekiyorsun).
- Daha geç = rakip angle'ı kapatmış, seni bekliyor.

## EXECUTE SONRASI — POST-PLANT GEÇİŞ

Execute plant ile bitmez. Plant sonrası post-plant pozisyonu execute'un son bölümüdür:

1. Plant'ten hemen sonra spread et (spike'tan uzaklaş).
2. Crossfire kur (farklı angle'lar).
3. Utility'yi kontrol et — post-plant için ne kaldı?
4. Defuse sesine kadar peek yok.
5. Trade chain hazır tut.

**Post-plant playbook'a referans:** `general/post-plant-playbook.md`

## EXECUTE YAYGIN HATALARI

### Hata 1: Utility'nin Tamamını Execute'a Harcama
Execute plant'e ulaşır ama post-plant'te savunma retake eder çünkü saldırının hiç utility'si kalmamıştır. Her oyuncu en az 1 utility'yi post-plant için saklamalı.

### Hata 2: Timing Kopması
Entry erken girer, trade gecikir. İki ölüm, execute çöker.

### Hata 3: Utility Sıralama Yanlış
Flash molly'den önce, smoke en sonra. Rakip flash'lanmadan position'unu değiştirir, smoke gelene kadar hazırdır.

### Hata 4: Role Kopması
İki oyuncu entry almak ister, trade'ci yok. Ya da entry hiç yok, tüm takım bekler.

### Hata 5: Commit Olmayan Execute
Execute başlar ama yarım kalır. Ya tam commit edilir ya da execute yerine default geçilir. Yarı execute = takım dağılır.

## RANK NOTU

**Gold-Plat:** Execute'larınız plansız — "go" diyen kişi farklı, entry farklı, trade gecikmiş. IGL yoksa en tecrübeli oyuncu execute planını verir: "Smoke 1, flash 2, entry 3, trade 4."

**Diamond-Ascendant:** Execute'larınızı biliyorsunuz ama rol disiplini zayıf. Herkes entry alıyor, kimse trade yapmıyor. Rol dağılımı round başında netleşmeli.

**Immortal-Radiant:** Execute varyasyonu yetersiz. Her round aynı execute okunur. 3-4 farklı execute hazırlığı + map-specific varyasyon. Ayrıca split execute'larda timing disiplini pro seviyenin ayırt edici özelliği.
