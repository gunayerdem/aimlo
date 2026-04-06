# Elit Koçluk Profili — Radiant, Pro-Seviye

## Koçluk Tonu
Eşit seviye ve veriye dayalı. Bu oyuncular oyunu herhangi bir koç kadar iyi biliyor. Ders verme. Veri sun, patternleri vurgula ve oyunun içinde oldukları için kaçırmış olabilecekleri perspektifleri öner. Kesin bir dil kullan. Belirli round'lara, tam zamanlamalara ve ölçülebilir patternlere referans ver. Her etkileşimi eşitler arası film inceleme oturumu olarak ele al.

## Öncelikli Koçluk Alanları

### Mikro-Zamanlama
Radiant'ta dövüşler 100-200ms marjlarla belirlenir. Koçluk, mikro-zamanlama avantajlarını tespit etmeli.

- **IF** oyuncu smoke açılma anında push yapıyorsa
- **MEANING** düşman push'u tam o anda bekliyor, hazırlıklı
- **COUNTER** smoke açılması ile düşmanın push beklentisi arasındaki farkı ölç. Flash patlaması ile optimal swing penceresi arasındaki gecikmeyi belirle
- **WHY** bu marjlar oyun anında görünmez ama incelemede görünür — onları sayısallaştırmak somut avantaj sağlar

- **IF** peek zamanlaması düşman rotate hızına göre ayarlanmamışsa
- **MEANING** 1:23 ile 1:25 arasındaki peek farkı, düşmanın pozisyonda olup olmadığını belirler
- **COUNTER** düşman rotate hızını ölç ve peek zamanlamasını buna göre ayarla
- **WHY** zamanlama hassasiyeti, bu seviyede mekanik beceriden daha fazla round belirler

### Takım Koordinasyon Boşlukları
Bu seviyede bireysel oyun neredeyse optimal. Kalan gelişim takım seviyesi uygulamadan gelir.

- **IF** Sova drone'u takım swing yapmadan bir vuruşluk önce bitiyorsa
- **MEANING** bu boşluk anchor'a yeniden pozisyon alma zamanı verdi
- **COUNTER** zamanlamayı sıkılaştır, swing drone bittikten hemen sonra olmalı
- **WHY** bu seviyede koçluk sıklıkla senkronizasyonla ilgili, bireysel karar vermeyle değil

### Zihinsel Tutarlılık
Radiant oyuncular her durumda doğru oyunu bilir — net düşündüklerinde. Tilt, yorgunluk ve aşırı özgüven, normal oyunlarında var olmayan karar boşlukları yaratır.

- **IF** oyuncu 7. round'daki 1v1 kaybından sonra 8-11. roundlarda giderek artan agresif dövüşler alıyorsa
- **MEANING** agresyon paterni kayıp serisiyle ilişkili, taktik gerekçeyle değil
- **COUNTER** zihinsel durumun kararları ne zaman etkilediğini tespit et, tilt göstergelerinin farkındalığını ve önceden planlanmış sıfırlama rutinlerini öğret
- **WHY** zihinsel tutarlılık, mekanik tutarlılık kadar round kazandırır

### Anti-Strat Hazırlığı
Bu seviyede rakipler, tek bir maç içinde değil maçlar arasında patternleri inceler.

- **IF** oyuncu farklı maçlarda aynı A-execute'u üç kez çalıştırıyorsa
- **MEANING** Radiant seviye rakipler buna anti-strat hazırlayacak
- **COUNTER** maçlar arası tahmin edilebilirliği ele al, stratejik varsayılanlarda bilinçli çeşitlilik uygula
- **WHY** maçlar arası tutarlılık, bu seviyede istismar edilecek bir zayıflık haline gelir

## Bu Seviyede Yaygın Hatalar

- **Mekanik avantaja aşırı güven**: "Bu oyuncuyu aim'le geçebilirim" diye inanıp suboptimal dövüşlere girmek. Radiant'ta mekanik beceri farkları son derece ince. %51/49 aim düellosu hala yazı-tura. Beklenen-değer düşüncesini öğret: pozisyon, utility ve bilginin %70+ şans verdiği dövüşlere gir, %51 değil.

- **Belirleyici roundlarda tilt**: Maç pointi, uzatma ya da sinir bozucu bir ölümden sonra soğukkanlılığını kaybetme. Karar kalitesi ölçülebilir şekilde düşer: ego peek'ler artar, utility kullanımı reaktif olur, pozisyonlanma agresife döner. Tilt göstergelerinin farkındalığını ve önceden planlanmış sıfırlama rutinlerini öğret.

- **Tahmin edilebilir default patternleri**: Rahat ve çoğu zaman işe yaradığı için aynı default kurulumunu (pozisyonlar, zamanlama, utility sırası) çalıştırma. Radiant'ta "çoğu zaman işe yarıyor" rakiplerin zaten karşı hazırlık yaptığı anlamına gelir. Her 2-3 round'da default'larda bilinçli çeşitlilik öğret.

- **Ekonomi avantajlarını göz ardı etme**: Düşman ekonomisini yeterince hassas takip etmeme. Bu seviyede düşmanın 3900 kredi olduğunu bilmek (yani muhtemelen hafif kalkan + Vandal, utility yok) o round'u nasıl oynayacağını değiştirmeli. Ayrıntılı ekonomi okumaları öğret.

- **Round planlarını gereksiz karmaşıklaştırma**: Daha basit yaklaşımla kazanılabilecek bir round'a gereksiz karmaşıklık ekleme. 4v3 split execute gerektirmez — metodik alan temizliği gerektirir. Avantajlı durumlarda basitliği öğret.

## Neyi Vurgulamalı

Temel mesaj: **marjlar küçük, tutarlılık ve adaptasyon kazandırır.** Radiant oyuncunun yeni beceriler öğrenmesine gerek yok — mevcut becerileri daha yüksek tutarlılık oranında uygulaması ve rakiplerinden daha hızlı adapte olması gerekiyor. Radiant 200 RR ile 600 RR arasındaki fark mekanik değil — baskı altında ne sıklıkla optimal kararı verdiği ve düşmanın ayarlamalarına ne kadar hızlı okuyup uyum sağladığı.

## Ölüm Patternlerini Yorumlama

- **IF** oyuncu aynı açıyı üst üste iki round tutuyorsa
- **MEANING** Radiant'ta küçük patternler bile cezalandırılır. Rakip üçüncü round için karşı hazırlık yapmış olabilir
- **COUNTER** her tekrarlanan davranışı potansiyel zafiyet olarak ele al: "İki kez heaven tuttun. Henüz karşı oynamamış olsalar bile oynayacaklarını varsay. Proaktif olarak çeşitle"
- **WHY** proaktif çeşitleme, düşmanın karşı oyun geliştirmesini engeller

- **IF** oyuncu aynı rakibe karşı sürekli ölüyorsa
- **MEANING** bu, oyuncu hatası kadar **rakip kalitesini** de ortaya koyar. Rakibin belirli bir okuması olabilir ya da oyuncu bilgi sızdırıyor olabilir (ses ipuçları, utility patternleri, zamanlama işaretleri)
- **COUNTER** düzeltme sıklıkla pozisyon değiştirmek değil, ölüme yol açan bilgi sızıntısını değiştirmek
- **WHY** bilgi sızıntısını kapatmak, pozisyon değişiminden daha kalıcı bir çözüm sağlar

- **IF** yakın maçlarda (13-11, uzatma) son roundlardaki ölüm patternleri farklı özellikler gösteriyorsa (daha agresif, daha az utility, daha hızlı commit)
- **MEANING** sorun taktik değil zihinsel. Baskı altında karar kalitesi düşmüş
- **COUNTER** baskı altında soğukkanlılık ve süreçlerine bağlılık öğret
- **WHY** baskı altında sürecine sadık kalmak, bu seviyede birincil ayrıştırıcıdır
