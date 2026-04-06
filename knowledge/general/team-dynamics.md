# Takım Dinamikleri -- Radiant Seviye Bilgi Bankası

---

## IGL Karar Verme Çerçevesi

In-Game Leader (IGL) rekabetçi Valorant'ta belirleyici roldür. Harika bir IGL beş bireysel oyuncuyu koordineli bir takıma dönüştürür.

### Round Öncesi Karar (Buy Fazı Penceresi)

1. **Ekonomiyi oku.** Takımının kredilerini kontrol et ve düşmanın kredilerini çıkarım yap. Buy turunu belirle.
2. **Skor tablosunu oku.** Hangi oyuncular performans gösteriyor? Hangileri zorlanıyor? Zayıf halkayı hedefle.
3. **Geçmişi oku.** Geçen round bu tarafta ne yaptılar? B stack yaptılarsa bu round A stack yapabilirler (veya senin uyum sağlayacağını düşünerek B'yi tekrarlayabilirler).
4. **Stratejiyi çağır.** Default, execute veya set play. Net iletişim kur: "A-kontrol default yapıyoruz, pick arayın, B'ye rotate etmeye hazır olun."

### Mid-Round Adaptasyon (Gerçek Zamanlı, Hızlı Kararlar)

IGL bilgiyi işlemeli ve dar bir pencere içinde ayarlamalar çağırmalı. Gecikmeli çağrılar yanlış çağrılardan daha kötüdür.

```
Bilgi alındı (örn. "İkisi B-Main'de görüldü"):
+-- Değerlendir: Fake mi yoksa gerçek baskı mı?
|   +-- Sadece 2 görüldü, split olabilir --> Çağrı: "Pozisyonları tutun, henüz rotate etmeyin."
|   +-- 3+ görüldü, utility kullanıldı --> Çağrı: "B'ye rotate, A-anchor tut."
+-- Değerlendir: Sayı avantajımız var mı?
|   +-- 5'e 4'üz --> Çağrı: "Sayıyla push, her şeyi trade et."
|   +-- 3'e 4'üz --> Çağrı: "Pasif oyna, pick odaklı, zorlama."
+-- Değerlendir: Kalan zaman?
    +-- Bol zaman var --> Çağrı: "Yavaşla, resetle, yeni harita kontrolu al."
    +-- Zaman azalıyor --> Çağrı: "Şimdi execute, daha fazla bekleme."
```

### Round Sonrası Analiz (Round'lar Arası Kısa Pencere)

Her round sonrası IGL hızla değerlendirmeli:
- Ne çalıştı? Ne çalışmadı?
- Düşman geçen round'dan ayarlama yaptı mı?
- Yaklaşımımızı değiştirmemiz gerekiyor mu?
- Herhangi bir takım arkadaşı tilt veya düşük performansta mı? Öyle ise rol atamalarını ayarla.

---

## Timeout Ne Zaman Çağırılmalı

Valorant her takıma yarı başına bir taktiksel timeout verir. Doğru zamanda kullanmak birden fazla round'u çevirebilir.

### Timeout Çağır:

1. **Arka arkaya 3+ round kaybedildiğinde.** Momentum sana karşı. Timeout düşmanın ritmini kırar ve takımının mental durumunu resetler.
2. **Rakip counter edemediğin bir strateji bulduğunda.** Aynı execute'yu 3 round üst üste yaptıysa ve cevap yoksa, counter tartışmak için timeout.
3. **Takımın tartışıyor veya tilt oluyorsa.** Timeout'u mental reset olarak kullan. Strateji tartışma; bunun yerine "resetle, derin nefes, gelecek round yeni round" de.
4. **Belirleyici eco round öncesi.** Sonraki round'u kazanmak zorundaysan, mükemmel execute planlamak için timeout.
5. **Rakibin timeout sonrası.** Rakip timeout çağırıp yeni stratejiyle kazanırsa, yanıt vermek için kendi timeout'unu düşün.

### Timeout ÇAĞIRMA:

- Kazanıyorsan ve momentum sendeyse. Kendini yavaşlatma.
- Bir round kaybettikten sonra. Bir round kaybı normal varyans.
- Overtime sırasında. Belirleyici an için sakla (örn. ilk OT round'unu kaybedersen).
- Sorun tamamen mekanikse (oyuncuların atışları kaçırıyor). Timeout aim düzeltmez.

---

## İletişim Protokolleri

### Ne Çağırmalı

| Durum | Çağrı Formatı | Örnek |
|---|---|---|
| Düşman görüldü | "[Sayı] [Ajan] [Konum]" | "İki, Jett ve Omen, B-Main" |
| Yetenek kullanıldı | "[Ajan] [Yetenek] [Konum]" | "Sova drone, Mid" |
| Hasar verildi | "[Ajan] [Kalan HP] [Konum]" | "Jett lit 120, A-Short" |
| Kill onaylandı | "[Ajan] öldürüldü [Konum]" | "Jett öldürüldü, A-Site" |
| Rotasyon tespit edildi | "[Yön]'e rotate, [Sayı] görüldü" | "B'den A'ya rotate, üç duyuldu" |
| Yardım gerek | "Yardım [Konum]" | "Yardım B-Main, iki push yapıyor" |
| Ultimate durumu | "[Ajan] ult hazır/hazır değil" | "Raze ult hazır" |
| Ekonomi çağrısı | "Full buy / Force / Save / Eco" | "Bu round takım save" |

### Ne Zaman Çağırmalı

- **Anında** düşman gördüğünde veya duyduğunda. Gecikmeli bilgi işe yaramaz bilgi.
- **Bir kez** her bilgi parçası için. Sorulmadıkça kendini tekrarlama. Tekrar iletişimi tıkar.
- **Clutch sırasında değil.** Takım arkadaşı 1vX'teyken SUS -- gerekli bilgi (örn. "Defuse ediyorlar" veya "Son oyuncu arkanda") dışında. Asla arka koltuk sürücülüğü yapma.
- **Round'lar arasında** strateji tartışması için. Round sırasında değil (taktiksel çağrı değilse).

### Nasıl Çağırmalı

- **Kısa ve spesifik.** "Jett A-Short" -- "Bence A civarlarında bir yerlerde Jett olabilir" değil.
- **Güvenli ton.** Emin değilsen bile net konuş. Mırıldanan çağrılar kaçırılan çağrılardır.
- **Round sırasında suçlama yok.** Kaybedilen düellodan sonra "İyi deneme" -- asla "Neden oradan peek attın?"
- **Pozitif iletişim.** Kill aldığında "İyi tutma". Takım morali performansı doğrudan etkiler.

---

## Rol Dağılımı

### Beş Standart Rol

1. **Duelist / Entry Fragger**: Site'a ilk giren, kill alarak veya düşmanları yeniden pozisyonlamaya zorlayarak alan yaratır.
2. **Initiator**: Bilgi toplar ve entry'yi kurar. Flash'lar, drone'lar, recon yetenekler.
3. **Controller**: Smoke'lar, duvarlar ve alan inkarı ile görüş çizgilerini kontrol eder ve bilgiyi engeller.
4. **Sentinel**: Savunmada site'ları anchor'lar, saldırıda flank koruması sağlar. Utility tabanlı site inkarı.
5. **Flex**: Harita ve kompozisyona göre rol adapte eder. Takip duelist, takip controller veya takip initiator oynayabilir.

### Harita Bazlı Rol Dağılımı

| Harita | Entry | Initiator | Controller | Sentinel | Flex |
|---|---|---|---|---|---|
| Ascent | Jett/Raze | Sova/KAY/O | Omen/Astra | Killjoy/Cypher | KAY/O/Fade |
| Bind | Raze/Jett | Skye/Fade | Brimstone/Viper | Sage/Cypher | Fade/Skye |
| Haven | Jett/Neon | Sova/Breach | Omen/Astra | Killjoy/Cypher | Breach/KAY/O |
| Split | Raze/Jett | Breach/Skye | Omen/Astra | Sage/Cypher | Skye/KAY/O |
| Icebox | Jett/Sova | Sova/Fade | Viper | Sage/Killjoy | Chamber/KAY/O |
| Lotus | Raze/Neon | Fade/Skye | Omen/Harbor | Killjoy/Cypher | Breach/KAY/O |
| Fracture | Neon/Raze | Breach/Fade | Brimstone/Viper | Killjoy/Cypher | KAY/O/Chamber |
| Pearl | Jett/Neon | Fade/KAY/O | Astra/Omen | Killjoy/Cypher | Harbor/Viper |
| Sunset | Raze/Neon | Breach/Fade | Omen/Astra | Killjoy/Cypher | Skye/KAY/O |
| Abyss | Jett/Raze | Sova/Fade | Omen/Viper | Killjoy/Sage | KAY/O/Cypher |

---

## Entry Fragger Sorumlulukları

### Saldırıda

IF initiator entry noktasına flash veya drone atmışsa
MEANING choke geçici olarak temizlenmiş ve savunucular yerinden edilmiş
COUNTER savunucular off-angle tutacak veya entry'yi stack'leyecek; bazıları flash zamanlamasını re-peek etmeye çalışacak
WHY entry flash patladığında hemen gitmeli -- tereddüt savunucuların toparlanıp yeniden nişanlamasına izin verir

1. **Choke'dan ilk geçen ol.** Initiator flash veya drone attıktan sonra sen gir. Tereddüt yok.
2. **Alan yarat.** Ölsen bile, entry'n savunucuyu pozisyonunu açıklamaya zorlar, takımının trade almasını sağlar.
3. **Gördüğünü çağır.** Girerken düşman pozisyonlarını hemen çağır. "Bir heaven, bir default" takımının alabileceği en değerli bilgi.
4. **Bait yapma.** Takım arkadaşlarının önce gitmesini bekleyen entry fragger rolünde başarısız oluyor.
5. **Ne zaman yavaşlamayı bil.** Entry her zaman "rush" demek değildir. Entry utility sonrası yavaş peek de olabilir.

### Savunmada

IF savunmada entry rolü oynuyorsan
MEANING mobilite ve mekanik kapasiten erken round etkisi yaratmaya yeter
COUNTER saldırganlara yaygın agresif peek noktalarını pre-aim edecek; tahmin edilebilirsen seni bedavaya trade ederler
WHY agresif erken peek takımına bedava bilgi ve potansiyel sayı üstünlüğü verir, ama trade edilmeden önce geri çekilmelisin

1. **Erken agresif oyna, sonra geri çekil.** Bilgi toplamak için erken-round peek at, sonra savunma pozisyonuna dön.
2. **Retake rolleri oyna.** Savunmada entry fragger'lar çoğu zaman site dışından oynar ve anchor'lamak yerine takım ile retake yapar.
3. **Agresif Op tut.** Entry Jett veya Chamber ise, savunmada agresif Operator açıları tutmak standart. Pick sonrası dash/TP ile çık.

### Entry Başarı Metrikleri

- **First Kill %**: İyi entry fragger oynanan toplam round'ların %15'inin üzerinde first-kill yüzdesine sahip olmalı.
- **Trade Oranı**: Entry öldüğünde takımı hemen trade almalı -- zamanın %70'inde.
- **FKFD (First Kill - First Death Oranı)**: 1.0 üstünde açılış ölümlerinden fazla açılış kill almak demek. Üst entry'ler 1.2+ seviyesinde.

---

## Anchor Sorumlulukları

Anchor takımın geri kalanı rotate edip push yaparken bombsite'da kalan oyuncudur.

### Temel Görevler

IF saldırganlara senin site'ına utility ve oyuncu commit etmeye başlıyorsa
MEANING bu gerçek execute, fake değil
COUNTER hız ve koordineli utility ile bunaltmaya çalışacaklar
WHY görev geciktirmek ve hayatta kalmak -- oyaladığın her an takım arkadaşlarına rotate için zaman verir

1. **Yardım gelene kadar site'ı tut.** Kill almak zorunda değilsin; saldırganları GECİKTİRMEN gerekiyor. Oyalamak için utility kullan: smoke, molly, yavaşlatma yetenekleri.
2. **Execute'yu erken çağır.** Site'ına utility veya birden fazla düşman commit ettiğini gördüğünde çağır. Erken rotasyon çağrısı round kazandırır.
3. **Hayatta kal.** Ölü anchor bilgi sağlayamaz veya oyalayamaz. Cover arkasında oyna, güvenli yerden utility kullan.
4. **Retake zamanlama.** Bunalırsan geri çekil ve takım arkadaşlarını bekle. Site'ta tek başına ölmek yerine hayatta kalıp site'i veren anchor daha iyidir.

### Anchor Utility Kullanımı

IF saldırganlara site'ına yaklaşıyorsa
MEANING ayak sesleri duyuyorsun, utility görüyorsun veya recon onay var
COUNTER stall'unu rush'layarak geçmeye veya utility'ni erken bait etmeye çalışacaklar
WHY her utility parçası takımına değerli rotasyon zamanı kazandırır -- hepsini aynı anda değil, sırayla harca

- **İlk utility**: Saldırganları duyduğunda/gördüğünde oyalama yeteneğini kullan (smoke, slow, molly). Bu kısa gecikme penceresi kazandırır.
- **Sonraki utility**: İlk stall'dan geçerlerse sonraki yeteneğini kullan. Her yetenek rotasyonlar için zaman kazandırır.
- **Silah zamanlama**: Sadece oyalama utility'ni kullandıktan VE takımın rotate etmeye yakın olduğundan sonra silahlı fight al. Rotasyonlar gelmeden önce ölürsen site bedava.

---

## Lurker Sorumlulukları

Lurker takımdan ayrı oynayarak bilgi toplayan ve flank tehdidi oluşturan oyuncudur.

### Temel Prensipler

IF lurk rolü atanmışsa sana
MEANING ana gruptan ayrı çalışarak istihbarat toplar ve flank tehdidi oluşturursun
COUNTER düşmanlar tripwire koyacak, flank açıları tutacak veya seni avlamaya oyuncu gönderecek
WHY mevcudiyetin düşmanı arkasını izlemeye kaynak ayırmaya zorlar, takımının vurduğu site'daki tutmayı zayıflatır

1. **Önce bilgi.** Birincil görev takıma ne duyduğunu söylemek. Senden uzağa rotasyon duyarsan, takım diğer site'ın zayıf olduğunu bilir.
2. **Flanklama bonus.** İyi lurk arkadan kill almak değil. Düşmanı flank'ı konusunda paranoyak yaparak onları execute'dan uzağa açı tutmaya zorlamaktır.
3. **Zamanlama.** Lurker'ın push'u takımın execute'u ile zamanlanmalı. Çok erken ve takım hareket etmeden ölürsün. Çok geç ve takım sensiz site'ı almış olur.
4. **Harita kontrolu.** Lurker mid veya bir taraf bölgesi kontrol ederek takıma rotasyon opsiyonu verir.

### Ne Zaman Lurk vs Ne Zaman Gruplanma

IF takım default veya yavaş execute çalıştırıyorsa
MEANING commit etmeden önce bilgi toplama zamanı var
COUNTER düşman agresif push yaparak lurker'ı bulmaya çalışabilir; flanker'ı flankla
WHY lurker'ın bilgisi IGL'in hangi site'i vuracağına karar vermesine yardımcı olur

IF takım hızlı execute veya 5 kişi rush çalıştırıyorsa
MEANING her oyuncu vuruşta gerekli
COUNTER lurker'ın gecikmeli varışı push'u zayıflatır -- bunun yerine gruplan
WHY hızlı execute'da saldırı gücünü bölmek round'u tehlikeye atar

---

## Destek Oyuncu Sorumlulukları

Destek oyuncu (controller veya initiator) takımın stratejisini mümkün kılar.

IF entry'nin arkasındaki destek oyuncusuysan
MEANING utility'n ve pozisyonun entry'yi güçlendirmek ve trade'leri temizlemek için var
COUNTER düşmanlar geç utility'yi veya entry öldükten sonra destek'in pozisyon dışına düşmüşlüğün cezalandıracak
WHY hassas utility zamanlama ve entry'nin arkasında doğru mesafe, kazanılmış site take ile başarısız olanı ayırır

1. **Smoke zamanlama.** Smoke'lar entry girmeden ÖNCE yerleştirilmeli, sonra değil. Geç smoke entry'yi açıkta bırakır.
2. **Flash zamanlama.** Flash entry peek yapmak üzereyken patlamalı -- önce değil (düşman toparlanır), sonra değil (entry çoktan olmuştur).
3. **Trade pozisyonu.** Destek entry'yi yakın-ama-güvenli mesafede takip eder. Trade almak için yeterince yakın, aynı spray'dan vurulmamak için yeterince uzak.
4. **Post-plant kurulumu.** Spike plant edildikten sonra destek kalan utility ile defuse deny eder (molly'ler, spike üzerinde smoke'lar).

---

## Trade Buddy Ataması

Her oyuncunun belirli bir trade buddy'si olmalı. Oyuncu A ölürse, Oyuncu B A'yı öldüren düşmanı hemen öldürür.

### Kurallar

IF trade buddy'n girip öldüyse
MEANING bir düşman fight alarak pozisyonunu açığa çıkardı
COUNTER düşman yeniden pozisyonlanmadan veya cover'a dönmeden önce trade almalısın
WHY buddy'ni yeterince yakın takip etmelisin ki düşman tepki veremeden refrag al

1. **2-2-1 bölünme**: İki çift trade buddy, artı solo çalışan bir oyuncu (lurker veya anchor).
2. **Entry'nin trade buddy'si belirleyici atama.** Bu oyuncu entry'yi hemen takip etmeli.
3. **Mesafe**: Trade buddy'ler yakın-ama-güvenli mesafe korumalı. Çok yakın ve ikisi aynı utility'den ölür. Çok uzak ve trade çok yavaş.
4. **Crossfire**: İdeal olarak, trade buddy'ler biraz farklı açılar tutar, böylece birini öldüren düşman diğerine açık kalır.

---

## Rotasyon Öncelik Sırası

IGL rotasyon çağırdığında oyuncular belirli sırada rotate etmeli:

1. **Rotasyon site'ına en yakın oyuncu** önce hareket eder. En çabuk ulaşır.
2. **Destek/Controller** retake için utility sağlamak üzere sonraki rotate eder.
3. **Entry fragger** retake push'unu yönetmek için ondan sonra rotate eder.
4. **DİĞER site'in anchor'u** en son rotate eder (eğer rotate ederse). Fake durumunda biri orijinal site'i tutmalı.
5. **Lurker** rotate edebilir veya etmeyebilir. Flanklama pozisyonundaysa backstab için kalsın. Uzaktaysa rotate etsin.

### Rotasyon Hızı

- Koşarak rotasyon: Orta mesafeden düşmana duyulur. Hız gerektiğinde kullan (spike plant edilmiş, takım ölüyor).
- Yürüyerek rotasyon: Sessiz ama yavaş. Fake olup olmadığından emin değilsen kullan.
- Kısmi rotasyon: Bir veya iki oyuncu rotate eder, diğerleri tutar. IGL split veya fake şüphelediğinde kullan.

---

## Default Oyun Çağrısı Sistemi

"Default" takımın belirli bir site'a commit etmeden standart açılışı. Amacı bilgi toplamak ve harita kontrolu almak.

### Standart Default Yapısı

1. **İki oyuncu** A-tarafı harita kontrolu alır (main/short).
2. **İki oyuncu** B-tarafı harita kontrolu alır (main/long).
3. **Bir oyuncu** (lurker veya flex) mid kontrolu alır.
4. Hedef: Düşman pozisyonları hakkında bilgi topla, pick ara, sonra bulduklarına göre execute çağır.

### Default'tan Execute'ya Geçiş

IF takım default çalıştırıyorsa
MEANING round başındaki bilgi toplama fazındasın
COUNTER düşman harita kontrolunu inkar etmek için agresif push yapabilir veya site stack'lemek için erken rotate edebilir
WHY default fazı IGL'e doğru execute'yu çağırmak için yeterli veri sağlar -- bu fazı aceleye getirmek takımını kör bırakır

```
Default Fazı (erken round):
  --> Harita kontrolu al, bilgi topla, mevcutsa pick al.
  --> IGL takım çağrılarını dinler: "A tek kişi," "B iki kişi."

Karar Noktası (mid-round):
  --> IGL çağırır: "Execute A" veya "Execute B" veya "Default'a devam."
  --> Bir site'ı stack'lemişlerse --> diğerini vur.
  --> Eşit yayılmışlarsa --> pick aldığın site'ı vur.
  --> Bilgi almadıysan --> IGL'in önceden planlanmış stratejisini execute et.

Execute Fazı (geç round):
  --> Tüm oyuncular çağrılan site'a yaklaşıyor.
  --> Entry smoke/flash kombosu sonrası girer.
  --> Site'a girer girmez hemen plant.
```

---

## Mid-Round Adaptasyon Çerçevesi

### Mid-Round Değişiklikler İçin Tetikleyiciler

| Tetikleyici | Adaptasyon |
|---|---|
| Entry fragger first blood alıyor | Push'u hızlandır; sayı avantajın var |
| Entry fragger peek'te ölüyor | Yavaşla; kill'i trade et, sonra yeniden değerlendir |
| Rakip erken rotate ediyor (ayak sesleri duyuldu) | Karşı site hafif olabilir; hızlı rotate düşün |
| Smoke'un one-way edildi | İçinden push etme; flash kullan veya smoke'un kaybolmasını bekle |
| Site stack'lenmiş buldun (3+ savunucu) | Hemen rotasyon veya yavaşla ve pick odaklı oyna |
| Zaman azalıyor | En yakın site'a commit etmek zorundasın; rotate için zaman yok |
| Takım arkadaşı bağlantı koptu (4'e 5) | Daha pasif oyuna geç; trade'lerden kaçın, pick odaklı oyna |

---

## Pistol Round Rol Atamaları

Pistol round'ları farklı dinamiklere sahiptir çünkü herkesin sınırlı utility'si var ve tüfek yok.

### Saldırı Pistol

IF takımın saldırı pistol'daysa
MEANING tüfek yok, sınırlı utility, her kredi değerli
COUNTER savunucular Classic ve Shorty ile dar açılarda tutacak; bazıları site stack'leyecek
WHY pistol-round alışları ekonomi yolunu tanımlar -- pistol kazanmak çoğu zaman sonraki iki round'u bedavaya kazanmak demek

- **Entry**: Ghost (500) + kalan yeteneklere. Ghost'un mesafedeki hassasiyeti entry'ye açı tutan savunucuları vurma şansı verir.
- **Destek**: Light Shield (400) + kalan yeteneklere. Ekstra 25 HP bir Classic vuruşuna daha dayanmak demek, trade marjı.
- **Controller**: Full yetenek al. Smoke'lar pistol'da daha değerli çünkü düşmanlar içinden hassas spray yapamaz.
- **Sentinel**: Tripwire/alarm + Light Shield. Kaotik hareket pattern'leri nedeniyle pistol round'larında flank izleme gerekli.
- **Flex**: Takım ihtiyacına göre uyarla. Herkes Ghost aldıysa, yakın mesafe fight'lar için Frenzy (450) düşün.

### Savunma Pistol

- **Anchor'lar**: Light Shield + Shorty (150) + yetenekler. Shorty yakın mesafede tek atış öldürücü, site'ta dar köşeler için mükemmel.
- **Agresif peek yapan**: Ghost (500). Ghost'un en güçlü olduğu mesafede erken fight al.
- **Stack veya yayılma**: Birçok pro takım pistol'da 3-2 stack yapar. Ekstra oyuncu pistollerle daha düşük kill sürelerini telafi eder.

---

## Anti-Eco Rol Ayarlamaları

IF düşman eco'daysa (Classic/Ghost'lar)
MEANING düşük silahlar var ve kaos, rush ve yakın mesafe right-click'lere güvenecekler
COUNTER geniş swing yaparak dar açılarda seni hazırlıksız yakalamaya çalışacaklar
WHY mesafe ve temelleri oynaman gerekiyor -- eco'ya tüfek round'u kaybetmek ekonomi ve moral için yıkıcı

1. **Dar açılarda tutma.** Eco oyuncular rush yapıp geniş swing atacak. Dar köşe tutarsan Classic right-click seni tek burst'ta öldürür.
2. **Mesafe oyna.** Tüfekler orta-uzun mesafede tabancaları yener. Eco oyuncularını yakın mesafeye sokma.
3. **Utility daha değerli.** Smoke'lar ve molly'ler eco takımının tek stratejisini (rush) inkar eder. Utility'yi bol kullan.
4. **Ego peek atma.** Anti-eco'da bile Sheriff headshot'tan ölebilirsin. Temelleri oyna.
5. **Operator'u tüfek round'larına sakla.** Anti-eco'da Operator israf etme. 4,700'lük silahı koşan Classic'e kaybetme riski çok yüksek.

---

## Sayı Avantajı Protokolleri

### 4'e 3 Protokolu

IF takımın 4'e 3 avantajı varsa
MEANING rakibi birer kişi fazla sayıyla geçiyorsun ve risk almak zorundalar
COUNTER çaresiz hareketler yaparak hızlı pick aramaya veya umutsuz execute yapmaya çalışacaklar
WHY tempo oyna, haritayı yay ve ilk hamleyi onlara yaptır -- trade hediye etme

### 3'e 2 Protokolu

IF takımın 3'e 2 avantajı varsa
MEANING round ağır şekilde lehine ama bedava değil
COUNTER ikili seni izole yakalamaya veya kahramanlık oyunu oynamaya çalışacak
WHY crossfire'ları koru ve birlikte oyna -- solo düello bulmalarına izin verme

### 5'e 4 Protokolu

IF takımın 5'e 4 avantajı varsa
MEANING maksimum harita kontrolu mümkün
COUNTER düşman fight'tan kaçınıp eşitlemek için pick aramaya çalışacak
WHY haritayı yay, lurker'ı solo gönder ve her çatışmayı güvenle oyna -- execute'da 4'e 4 bile iyi utility ile lehine

---

## Sayı Dezavantajı Protokolleri

### 2'ye 3 Protokolu (Sende 2 Var)

IF takımın 2'ye 3 gerideyse
MEANING yarışabilmek için bir pick alarak eşitlemek zorundasın
COUNTER seni trade etmeye veya güvenli oynayıp saat tüketmeye çalışacaklar
WHY avantajlı 1'e 1 düello izole etmek için utility kullan -- pick alırsan momentum ile 2'ye 2 olur

### 2'ye 4 Protokolu

IF takımın 2'ye 4 gerideyse
MEANING round neredeyse kesinlikle kayıp
COUNTER bunaltıcı sayı ve utility ile push yapacaklar
WHY maç noktası değilse save yap -- matematik çok sana karşı

### 3'e 5 Protokolu (Sende 3 Var)

IF takımın 3'e 5 gerideyse
MEANING bu round'u düz kazanmak aşırı zor
COUNTER herhangi bir site'ı sayı ve utility ile doldurabilirler
WHY bir site'ı stack'le ve kumar oyna -- 3 oyuncuyu harita boyunca yayamazsın; boş site'ı vururlarsa silah koru

---

## Pick Odaklı mı Execute mi Kararı

### Pick Odaklı Oyna:

IF sayı avantajın, güçlü açıların var veya rakip rush yapıyorsa
MEANING koşullar sabır ve onların sana gelmesini beklemeyi kayırıyor
COUNTER yavaş oynayıp inkar edebilirler ama bu sana bilgi verir
WHY pick oyunları full utility veya pozisyon commit etmeden düşmanın sayısını tüketir

### Execute Yap:

IF zaman azalıyor, full utility'n var veya skor agresyon gerektiriyorsa
MEANING daha fazla beklemek sana zarar verir
COUNTER savunucular tahmin edilen site'ı stack'leyecek veya agresif anti-execute utility oynayacak
WHY full utility ile prova edilmiş execute hazırlanmış savunmayı bile bunaltır

---

## Harita Kontrolu Öncelik Sistemi

### Öncelik Kademeleri

| Kademe | Alanlar | Neden |
|---|---|---|
| Kademe 1 (Kontrol etmeli) | Çoğu haritada Mid | Rotasyonları kontrol eder, split'leri mümkün kılar |
| Kademe 2 (Kontrol etmeli) | Short/connector alanları | Daha hızlı execute ve fake'leri mümkün kılar |
| Kademe 3 (Kontrol etmek iyi) | Site'lara yakın derin harita alanları | Execute'leri kurar ama seni commit eder |
| Kademe 4 (Lüks) | Düşman spawn-tarafı alanlar | Sadece tam harita kontroluyla ulaşılabilir |

---

## Site Vuruş Zamanlama Pencereleri

### Hızlı Execute (Round Başında Hemen)

IF round başında hemen execute ediyorsan
MEANING savunucular kurulmadan önce yakalamaya çalışıyorsun
COUNTER erken-round pozisyonları olan agresif savunucular hazır olacak
WHY hızlı execute'lar pasif/retake-tarzı savunmaları cezalandırır ama erken bilgisi olan takımlara karşı yüksek risk

### Orta-Tempo Execute (Harita Kontrolu Sonrası)

IF önce harita kontrolu alıp sonra execute ediyorsan
MEANING takım commit etmeden önce bilgi toplar ve utility'yi yöntemli kullanır
COUNTER savunucular harita kontrolunu contest etmeye veya vuracağını düşündükleri site'ı stack'lemek için erken rotate etmeye çalışacak
WHY bu standart profesyonel zamanlama -- bilgi toplama ile plant edip post-plant oynayacak zaman arasında denge kurar

### Geç Execute (Savunucu Utility'sini Tüketme)

IF round'un derinliklerine kadar execute etmeden bekliyorsan
MEANING savunucu utility'sini tüketmeye çalışıyorsun -- smoke'ları ve molly'leri süreleri dolacak
COUNTER rakip geç zamanlamayı okuyabilir ve süresi dolan saldırgan utility'si ile agresif push yapabilir
WHY geç execute'lar savunucuları round boyunca pasif tutan güçlü harita kontrolun olduğunda en iyi çalışır

---

## Rank Modülasyonu

### Immortal+ İçin

IF takım dinamiklerini üst düzeye taşımak istiyorsan
MEANING bu seviyede IGL kalitesi, iletişim disiplini ve rol uyumu round'ları belirler
COUNTER mid-round adaptasyon çerçevesini, trade buddy atamasını ve rotasyon öncelik sırasını bilinçlice uygula
WHY Immortal+'da bireysel mekanikler yakın; takım koordinasyonu maçları kazandırır

### Diamond-Ascendant İçin

IF solo queue'da takım dinamiklerini iyileştirmek istiyorsan
MEANING tam IGL kontrolu olmasa bile temel iletişim ve trade buddy prensipleri uygulanabilir
COUNTER her round en az 1 bilgi çağrısı yap, 1 trade buddy bul, ekonomi çağrılarını başlat
WHY basit takım dinamikleri bile ranked'de büyük fark yaratır -- iletişim kuran takım avantajlıdır
