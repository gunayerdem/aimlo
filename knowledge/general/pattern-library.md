---
id: general_pattern_library
type: general
topic: pattern-detection
patch: "9.x"
tags: [patterns, anti-strat, reads, adaptation, tactical-coaching]
---

# PATTERN LIBRARY — Rakip Pattern'leri ve Counter'ları

Rakibin ne yaptığını değil, **niye** yaptığını oku. Niye'yi bildiğinde bir sonraki round'u zaten görmüşsündür. Bu dosya en sık karşına çıkan pattern'lerin IF / MEANING / COUNTER / WHY formatında listesi.

## FORMAT

**IF:** Ne görüyorsun — tetikleyici
**MEANING:** Rakip bunu niye yapıyor
**COUNTER:** Nasıl karşıla — ne yapacaksın
**WHY:** Niye çalışır

---

## SITE STACK PATTERN'LARI

### Pattern: Tek Site Stack (B Stack)
**IF:** Rakip iki round üst üste B'de 3 kişi tutuyor, A'da 2 kişi kalıyor
**MEANING:** Saldırının yine B'ye geleceğini bekliyorlar
**COUNTER:** A'ya 4 kişiyle gir, B'ye ses için 1 kişi bırak. A'da sayı ve util üstünlüğüyle hızlı gir. B anchor'ı rotate ederken geç kalır.
**WHY:** Stack tahmin üzerine kuruludur. Tahmini okuduğunda boşta kalırlar — A'da kimse yoktur.

### Pattern: Mid Stack (Split, Sunset, Ascent)
**IF:** Savunma mid'de 2-3 kişi tutuyor, siteler zayıf
**MEANING:** Saldırının split oyununu kesmek istiyorlar, mid'i agresif tutuyorlar
**COUNTER:** Mid'e 1 kişi ses yaptır, gerçek entry'yi siteden direkt aç. Mid'deki oyuncular dönene kadar site'ı al.
**WHY:** Mid stack dönüş süresi ister. Site'a onlar gelmeden yerleşirsen stack'in anlamı kalmaz.

### Pattern: Double Anchor Tek Siteye
**IF:** Bir site'a 2 anchor, diğerine 1 anchor + mid
**MEANING:** Zayıf siteyi ceza ile tutmaya çalışıyorlar
**COUNTER:** Tek anchor'lı siteye hızlı gir. Rotate gelmeden o site'ı kapat.
**WHY:** Rotate süresi stack'in en büyük açığı. O süreyi kullanırsan anchor yalnız kalır.

---

## EXECUTE PATTERN'LARI

### Pattern: Utility Dump Execute
**IF:** Saldırı round açılışında 3+ smoke, 3+ flash, molly döküyor
**MEANING:** Full execute — o siteye tam commit, fake yok
**COUNTER:** O siteye stack yap, util'i sakla — post-plant için tut. Girişi durdurmaya çalışma; girerlerse sakladığın util ile retake al.
**WHY:** Util döken takımın post-plant'te elinde bir şey kalmaz. O anda util sende varsa onlar savunmasız.

### Pattern: Fast Execute (Az Utility)
**IF:** Saldırı hızlı site'a basıyor, util'i az kullanıyor
**MEANING:** Eco veya force round — hızla sürpriz yakalamak istiyorlar
**COUNTER:** Close range hazır ol, spread et. Stack yapma — hıza open angle verme.
**WHY:** Fast execute'da ilk düşen yalnız anchor'dır. Spread + info ile ilk dövüşü trade'le, hız avantajı biter.

### Pattern: Default Execute
**IF:** Saldırı round açılışını bilgi toplamaya ayırıyor, yavaş yaklaşıyor
**MEANING:** Mid-round karar verecekler — nereye gideceklerini bilgiye göre seçiyorlar
**COUNTER:** Erken peek atma. Bilgiyi sadece zorunda kaldığında ver. Bilgi alamayan saldırı default'u execute'a çeviremez.
**WHY:** Default'un yakıtı bilgidir. Bilgi kesilirse round sonunda panikle execute yapar, o execute okunur.

---

## UTILITY PATTERN'LARI

### Pattern: Post-Plant Lineup Spam
**IF:** Saldırı spike koyulduktan sonra aynı spot'lara tekrar tekrar util atıyor
**MEANING:** Sabit lineup'ları var — molly ve recon'u ezbere aynı noktaya bırakıyorlar
**COUNTER:** Retake'i hızlandır, lineup'ı çalıştıracak zaman verme. Bir sonraki round spike'ı farklı yere koy — lineup o pozisyona kurulmuş, plant değişirse boşa düşer.
**WHY:** Lineup sabit plant pozisyonuna bağlıdır. Plant değişirse ya da retake yetişirse lineup çalışmaz.

### Pattern: Utility Eco — Ability Tutma
**IF:** Rakip ability'lerini hiç kullanmıyor
**MEANING:** Bir sonraki round için biriktiriyorlar, ya da ult point topluyorlar
**COUNTER:** Bu round'u maksimum util harcayarak al. Rakip bir sonraki round ult + util ile gelecek — o round'a da hazır ol.
**WHY:** Bu round util'siz oynuyorlar. En zayıf anları şimdi — baskıyı şimdi kur.

### Pattern: Sentinel Utility Kullanmıyor
**IF:** Karşı sentinel bot atmıyor, tel koymuyor
**MEANING:** Rotate round ya da full commit — flank bilgisini önemsemiyorlar
**COUNTER:** Flank'i dene. Sentinel'ın util'i yoksa o hat açık.
**WHY:** Sentinel'ın işi bilgi kesmek. Util yoksa takım körcesine oynuyor, flank bedava geçer.

---

## EKONOMİ PATTERN'LARI

### Pattern: 2 Round Üst Üste Kayıp + Utility Yok
**IF:** Rakip iki round kaybetti, 3. round'da az util ile geliyor
**MEANING:** Save + force geçişi — ult ve silah topluyorlar
**COUNTER:** Anti-eco spread'ini kur, Sheriff ve Spectre'ye hazır ol. Bu round'u bırakma — kaybedersen rakibin momentumu maçı çevirebilir.
**WHY:** Save round ekonomiyi kurtarır ama rakip tam da en zayıf anda. O anı kullan.

### Pattern: Eco Round'da Rush Göstergeleri
**IF:** Rakip eco round'da Judge/Spectre ile grup halinde hareket ediyor
**MEANING:** Close range ile round çalmak istiyorlar
**COUNTER:** O noktada stack yapma — uzak açı zorla.
**WHY:** Eco rush'ın işleyişi sürpriz + yakın mesafe. Uzakta rifle yakalar.

### Pattern: Bonus Round'da Utility Açığı
**IF:** Rakip eco kazandı, bonus round oynuyor — silahları var ama util'i eksik
**MEANING:** Silahları var ama ability hole'ları kapatılmamış
**COUNTER:** Util ağırlıklı execute yap. Post-plant'te bile util savaşını sen kazanırsın.
**WHY:** Bonus round'da silah eşitse util farkı round'u belirler.

---

## OYUNCU PATTERN'LARI

### Pattern: Aynı Op Oyuncusu Aynı Spot
**IF:** Rakip Op oyuncusu iki round aynı açıyı tutuyor
**MEANING:** Konfor spotu — o açıyı ezbere tutuyor
**COUNTER:** O açıya flash + util at. Pre-aim eden oyuncu flash'ı kafaya yiyince değer kaybeder. Bir sonraki round o açıyı tamamen smoke ile öldür.
**WHY:** Op'un değeri doğruluk + pozisyondur. Pozisyon okunduğunda Op sadece pahalı bir silaha döner.

### Pattern: Lurker Aynı Hatta
**IF:** Rakip takımdan biri her round diğer tarafta beliriyor
**MEANING:** Dedicated lurker — bilgi + flank kill rolü
**COUNTER:** O hatta tel, bot, recon ya da kamera koy. Lurker'ı ilk round'da tanı, sonraki round'larda o rotasyon yolunu kapat.
**WHY:** Lurker bilgi avantajını çalar. Bilgi alamadığında lurker pasif kalır, takımı 4v5 oynar.

### Pattern: Duelist Çok Erken Ability Harcıyor
**IF:** Jett dash'i ya da Raze sıçrama util'i round açılışında bitiyor
**MEANING:** Duelist kontrolsüz ability harcadı — kaçışı kalmadı
**COUNTER:** Ability'si biten duelist'i takip et, ikinci peek'te yakala. Dash'siz ya da sıçramasız duelist savunmasızdır.
**WHY:** Duelist'in değeri kaçış ability'sidir. O gittiğinde sıradan bir oyuncuya döner.

---

## SAVUNMA DAVRANIŞ PATTERN'LARI

### Pattern: Early Aggression (Defender)
**IF:** Savunma her round agresif bilgi alıyor — A Main'den, B Main'den
**MEANING:** Bilgiyi önceliklendiriyorlar, pozisyona değil oyuncuya göre anchor koymuşlar
**COUNTER:** Agresif peek'e flash + util at, çıktığı anda onu oradan vur. 3. round bir kez bedavaya ölürse 4. round geri çekilir. Artık o tarafta fazladan bilgin var.
**WHY:** Agresif peek tekrarlanırsa tahmin edilebilir olur. Tek bir ceza pattern'i kırar.

### Pattern: Passive Anchor Hold
**IF:** Savunma ilk bilgiden sonra siteye çekiliyor, dövüşe girmiyor
**MEANING:** Retake odaklı savunma — geciktir ve trade al
**COUNTER:** Hızlı execute değil, kontrollü gir. Site'ı temizle, spike koy, açıyı yay, post-plant'te passive anchor'ı yakala.
**WHY:** Passive anchor'ın tehlikesi post-plant'tedir. Site alınmadan önce yavaşlatır, sonra açı tutar. Yerleşimini bu beklentiye göre yap.

---

## ROTATE PATTERN'LARI

### Pattern: Tek Yönlü Rotate
**IF:** Savunma her zaman mid'den rotate ediyor, CT yoldan gelmiyor
**MEANING:** Mid kontrolüne güveniyorlar, CT hattını kullanmıyorlar
**COUNTER:** Mid'e util at + CT'den flank. Rotate yolu tuzağa döner, geç gelen defender kolay kill olur.
**WHY:** Rotate hattı tahmin edilebilirse util ile kilitlenir.

### Pattern: Çift Rotate (Over-Rotate)
**IF:** Savunma bilgi alır almaz 2-3 kişiyle bir tarafa akıyor
**MEANING:** Panikle rotate kararı veriyorlar
**COUNTER:** Ses yap, rotate'i bekle, boşalan tarafa asıl girişi yap. Over-rotate'e karşı fake — klasik counter.
**WHY:** Over-rotate savunmayı yanlış tarafa koyar. Asıl giriş tam o boşalmaya denk gelir.

---

## CLUTCH VE SON AŞAMA PATTERN'LARI

### Pattern: Panik Bas
**IF:** Saldırının default'u tutmadı ve panikle siteye giriyorlar
**MEANING:** Bilgi toplayamadılar, başka seçenek kalmadı
**COUNTER:** Retake setup'ı kurmuş gibi bekle. Panik execute'de util sıralaması bozulur, trade chain çözülür. Hazır savunma kolay çoklu kill alır.
**WHY:** Panik kararların kalitesi düşer. Planlı savunma karşısında panik saldırı kaybeder.

### Pattern: 1vN Clutch — Gizlenme vs Agresif
**IF:** Rakip clutch oyuncusu spike koyulduktan sonra ses çıkarmıyor
**MEANING:** Gizlenme oynuyor — spike'ı defuse etmeni bekliyor, sesle yerini açacaksın
**COUNTER:** Spike'a yaklaşma. Util spreyle, onu peek'e zorla. Süre azaldıkça clutch oyuncusu kötü açıdan çıkmak zorunda kalır.
**WHY:** Gizlenmenin silahı zamandır. Zaman baskısı onu savunmadan saldırıya geçirir, kötü açıda peek eder.

---

## META PATTERN'LARI

### Pattern: Viper/Harbor Double Controller
**IF:** Rakip iki smoke oyuncusu kullanıyor
**MEANING:** Post-plant ağırlıklı oyun, util baskısı
**COUNTER:** Sen de double controller ya da util zengin kadro oyna. Util eşit olmazsa retake imkansızlaşır.
**WHY:** Double controller'ın gücü post-plant'te çıkar. Util savaşını kaybedersen round da gider.

### Pattern: Double Duelist Rush
**IF:** Rakipte iki duelist var, her round hızlı execute geliyor
**MEANING:** Hız ve sürpriz üzerine kurulu oyun
**COUNTER:** Sova recon, Cypher kamera gibi bilgi util'i koy — rush gelmeden bilgi al. Bilgi alındığında sürpriz ölür.
**WHY:** Double duelist'in gücü hızdır. Hız, sürpriz olmadan sadece dağınık bir saldırıdır.

### Pattern: Lurker Ağırlıklı Kadro
**IF:** Rakipte her round bir oyuncu diğer tarafta, hiç 5 kişi bir arada değil
**MEANING:** Bilgi + flank + son aşama clutch oyunu
**COUNTER:** Her round flank hattına util koy, harita kontrolünü zorla. 4 kişiyle execute yapıyorlar — bunu sayı avantajına çevir.
**WHY:** Lurker takım gücünü böler. 4v5 execute savunmaya karşı eşit ya da dezavantajlıdır. Flank kapatılırsa lurker sıfırlanır.

---

## PATTERN OKUMA DİSİPLİNİ

- **1 round tesadüf, 2 round şüphe, 3 round pattern.** Tek round'dan okuma yapma.
- **Rakip seni de okuyor.** Her 3 round'da bir şeyini değiştir — yoksa okunan sen olursun.
- **Pattern garanti değil.** Olasılığı artırır. Counter %70 tutuyorsa zaten işini yapıyor.
- **Pattern + ekonomi + ult = round kararı.** Üçünü birleştir. Tek başına pattern yetmez.

---

## RANK NOTLARI

**Gold-Plat:** Şu an rakibe tepki veriyorsun, pattern okumuyorsun. Basit başla: rakibin son 3 round'da hangi siteye gittiğini kafanda tut. Okumayı oradan kur.

**Diamond-Ascendant:** Pattern'leri görüyorsun ama counter'ı geç uyguluyorsun. Pattern'i gördüğün anda pozisyonunu ayarla — IGL olman gerekmiyor, kendi açını değiştirmen yeter.

**Immortal-Radiant:** Rakip seni de okuyor ve counter-counter hazırladı. Pattern'i 2-3 round doğrulamadan counter'ını oynama — tuzağa düşersin. Bu seviyede pattern okuma çok katmanlı ilerler.
