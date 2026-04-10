# Radiant Seviye Koçluk Bilgi Bankası

Radiant oyuncularını diğerlerinden ayıran pattern'ler, okumalar ve mikro-kararlar. Her ipucu doğrudan koçluk sunumu için IF / MEANING / COUNTER / WHY formatını takip eder.

---

## Pozisyonlama Pattern'leri

### Off-Angle Teorisi

IF oyuncu default açı tutuyorsa (herkesin pre-aim yaptığı yaygın nokta)
MEANING düşman peek yapmadan önce crosshair'ini tam o pozisyona koymuş durumda
COUNTER default'tan hafifçe kaymış pozisyon tut -- aynı lane'i cover edecek kadar yakın ama peek yapandan mikro-ayarlama zorlayacak kadar uzak
WHY o zorlanan mikro-ayarlama tutucunun önce ateş etmek için exploit edebildiği reaksiyon boşluğu oluşturur

IF oyuncu off-angle'dan kill aldıysa
MEANING düşman takımı o noktayı işaretleyecek ve gelecek round pre-aim yapacak
COUNTER her off-angle'ı tek çatışma için kullan, sonra yeni pozisyona rotate et
WHY off-angle'lar düşman onları beklediği anda tüm değerini kaybeder -- cover'ı feda ettiği için default'lardan bile kötü olabilirler

### Derinlik Pozisyonlama

IF oyuncu köşe kenarına yakın tutuyorsa
MEANING düşman duvarı geçtiği anda tutucuyu görüyor ve tutucunun sıkı açı avantajı var
COUNTER yakın derinliği sadece bir düşmanın görünebileceği izole düellolarda ve dar koridorlarda kullan
WHY yakın derinlik açı avantajını maksimize eder ama birden fazla tehdidi işlemeye zaman bırakmaz

IF oyuncu köşeden uzak tutuyorsa
MEANING tutucu peek yapanın periferik görüşünde görünür, crosshair placement noktasında değil
COUNTER birden fazla düşman swing yapabilecekken uzak derinlik kullan -- daha fazla reaksiyon zamanı verir ve tutucunun commit etmeden önce tam resmi işlemesine izin verir
WHY köşeden uzaklık peek yapanı hem yatay hem dikey ayarlama yapmaya zorlar, reaksiyon talebini yığma

### Peek Edilmemiş Pozisyon

IF takım arkadaşları site'i temizledi ama derin köşeleri, kapı arkası açıları veya alt-yükseklik noktalarını atladı
MEANING o pozisyonlar düşmanın "temizlenmiş alanlar" mental haritasında görünmez
COUNTER lurk oyunları ve retake pusulası için peek edilmemiş pozisyonları exploit et -- takımının gerçekte ne kontrol ettiği vs nelerin önünden geçtiğini takip et
WHY temizleme sonrası güven takımların köşe kontrol etmeyi bıraktırır ve peek edilmemiş noktadan tek kill retake'i çevirebilir

### Post-Plant Üçgeni

IF spike yerde ve saldırganların tutması gerekiyorsa
MEANING savunucular birden fazla yaklaşım hattından retake etmek zorunda
COUNTER üçgen oluştur: bir oyuncu spike'a yakın defuse sesini çağırır, biri orta mesafede birincil yaklaşımı cover eder, biri derinde rotate edenleri izler
WHY üçgen herhangi bir retake yapanı bölü açılarla başa çıkmaya zorlar -- bir tutucuyu push etmek diğerin açığa çıkarır

---

## Hareket Mekanikleri

### Counter-Strafe

IF oyuncu hala strafe hareketindeyken ateş ediyorsa
MEANING ilk-atış hassasiyeti kaybolur ve mermi merkez-dışı iner
COUNTER momentumu öldürmek için ters hareket tuşuna bas, sonra model sabit olunca ateş et -- atış durma sonrası gelmeli, tuş basışı sırasında değil
WHY Valorant'ın hareket hassasiyetsizlik cezası şiddetli; küçük bir kalan hız bile atışı saptırıyor

IF oyuncu aynı hareketten jiggle yapıp ateş etmek istiyorsa
MEANING çift counter-strafe gerekli: bir yöne strafe et, durdurmak için karşıya bas, kısa sabit pencerede ateş et, sonra dışarı strafe et
COUNTER dur-ve-ateş penceresi kas hafızası olana kadar A-D-A veya D-A-D sıralarını drill et
WHY bu Radiant'taki temel hareket döngüsü -- bilgi toplama, atış sunumu ve kaçınmayı tek harekette birleştirir

### Jiggle Peek

IF oyuncu commit etmeden bir açı hakkında bilgiye ihtiyaç duyuyorsa
MEANING omzu zar zor açığa çıkaran hızlı strafe atışı bait edebilir, savunucuyu açığa çıkarabilir veya utility'yi tetikleyebilir
COUNTER modelin sadece ince bir diliminin açıyı geçtiği sıkı A-D hareketi yap -- açığa çıkarma düşmanın atış yapamayacağı kadar minimal olmalı
WHY jiggle bedava bilgi verir: düşman ateş ederse pozisyonu açığa çıkarır ve silahının toparlanma gecikmesi olur; kimse ateş etmezse açı temiz olabilir

### Ferrari Peek

IF oyuncu utility, ses veya takım arkadaşlarının çağrılarından düşman pozisyonunu biliyorsa
MEANING bilinen pozisyona pre-aim ile tam-commit geniş swing savunucuyu hızlı hareket eden hedefi takip etmeye zorlar
COUNTER bilinen pozisyona pre-aim ederek tam strafe hızında geniş swing yap, sonra counter-strafe et ve ateş et
WHY geniş swing modeli savunucunun crosshair'inin oturduğu köşe kenarından uzaklaştırarak zaman baskısı altında büyük ayarlama zorlar

IF düşman onaylanmış açıda Operator tutuyorsa
MEANING ferrari peek değer kaybeder çünkü Operator'un tek-atış öldürmesi ayarlama talebini geçersiz kılar
COUNTER Operator açılarını ferrari peek etme -- Operator'u yerleştirmek için utility kullan veya atışı bait etmek için önce jiggle yap
WHY Operator takip gerektirmez; tek gövde atışı öldürür, dolayısıyla hareket avantajı ortadan kalkar

### Crouch Disiplini

IF oyuncu bir açıya crouch-peek yapıyorsa
MEANING baş headshot seviyesi tutan herhangi bir düşman için gövde-atış yüksekliğine düşer -- oyuncu daha yavaş olur, daha hızlı değil
COUNTER asla crouch yaparak fight başlama; ayakta başla, kısa burst ateş et, sonra hitbox'ı kaydırmak için mid-spray'de crouch yap
WHY mid-spray'de crouch yapmak aynı anda başı düşmanın aim'ini commit ettiği yerin altına düşürürken geri tepme pattern'ini aşağı çeker

IF oyuncu crouch yaparken Operator'a karşı karşılaşıyorsa
MEANING yavaş, geniş hedef olurlar -- tek-atış silahına karşı mümkün olan en kötü profil
COUNTER Operator oyuncularına karşı her zaman ayakta kal ve counter-strafe yap; lateral hız tek savunma
WHY crouch hareket hızını drastik azaltır, Operator'un işini önemsiz kılar

---

## Crosshair Placement

### Baş Yüksekliği Çıkartma

IF oyuncunun crosshair'i baş yüksekliğinin altına düşüyor
MEANING her çatışma ilk faydalı atıştan önce yukarı dikey flick ile başlıyor ve reaksiyon süresi ekliyor
COUNTER crosshair'i her haritadaki baş-yüksekliği işaretleyicilerine (kutu üstleri, pencere çerçeveleri, ayakta baş seviyesiyle hizalanan duvar dokuları) çıkarla ve hareket halinde o çizgiyi koru
WHY dikey ayarlamayı ortadan kaldırmak düşman göründüğünde oyuncunun sadece yatay düzeltmeye ihtiyaç duyması demek, tepki süresini kabaca yarılatıyor

### Pre-Aim Noktaları

IF oyuncu açık alana merkezlenmiş crosshair ile bir açı tutuyorsa
MEANING düşman köşe kenarında göründüğünde tepki verip ayarlama yapmak zorunda
COUNTER crosshair'i düşman peek yaptığında başın ilk görüneceği tam noktaya yerleştir -- köşe kenarında baş yüksekliğinde
WHY ilk-görünüm noktasını pre-aim etmek oyuncunun sadece tıklaması gerektiğini, tıkla ve hareket et değil, anlamına gelir

### Rotasyon Crosshair Disiplini

IF oyuncu "güvenli" alanlarda rotate ederken veya koşarken crosshair'i yere düşürüyorsa
MEANING lurker onları hazırlıksız yakalarsa garanti ölüm çünkü crosshair baş yüksekliğine tam mesafe kattetmeli
COUNTER crosshair'i her zaman baş yüksekliğinde tut, rotasyon sırasında her açıdan süzdür
WHY oyuncunun crosshair placement'ı gevşettiği tek sefer lurker'ın cezalandırdığı round'dur -- tutarlılık varyansı kaldırır

### Çoklu-Açı Bölme

IF aynı anda iki tehdit açısı mevcutsa (örn. Ascent A retake'inde Heaven ve Tree)
MEANING crosshair'i bir açıya yerleştirmek diğerini korumasız bırakır
COUNTER crosshair placement'ı iki açı arasında böl, mevcut bilgiye göre daha olası tehdide doğru yatkın
WHY bölme her iki açıya da maksimum ayarlama mesafesini minimize eder, en kötü durum reaksiyon süresini düşük tutar

---

## Ses İpucu Okumaları

### Ses Önceliği

IF oyuncu spike etkileşim sesi duyuyorsa (plant, defuse, bip artışı)
MEANING bu oyundaki en yüksek değerli ses -- round sonucunu doğrudan belirler
COUNTER spike sesini diğer tüm seslerin üzerine önceliklendir; hemen çağır ve buna göre karar ver
WHY spike durumu push, tut veya rotate etmeyi belirler -- başka hiçbir ses o ağırlıkta değil

IF oyuncu yakında reload duyuyorsa
MEANING düşmanın şarjörü boş ve reload animasyonunda kilitli
COUNTER reload penceresi sırasında hemen push yap -- düşman animasyon tamamlanana kadar karşılık ateşi yapamaz
WHY reload sesi bedava kill'e doğrudan davet; tereddüt düşmanın reload'u tamamlayıp fight'ı resetlemesine izin verir

### Ses İnkarı

IF oyuncu bir açıya yaklaşırken veya lurk yaparken koşuyorsa
MEANING düşman yaklaşmayı duyar ve giriş noktasını pre-aim eder
COUNTER pozisyon bilgisinin değerli olduğu her yerde yürü (shift) -- açılara yaklaşırken, flanklarken, lurk yaparken veya ses algılayan düşman utility'sine yakın hareket ederken
WHY ses yoluyla pozisyon vermek herhangi bir pozisyonlama avantajını siler; düşman sesi pre-aim'e çevirir

IF oyuncu yanlış okumalar yaratmak istiyorsa
MEANING bir pozisyona doğru koşup sonra diğerine shift-walk yapmak düşmanın mental haritasına yanlış bilgi yerleştirir
COUNTER tuzak pozisyonuna doğru kısa koşarak yanlış ayak sesi yönü yarat, sonra hemen gerçek saldırı yönünde sessizce yürü
WHY ses bilgisi zamansal -- düşmana oyuncunun NEREDE OLDUĞUNU değil nerede OLDUĞUNU söyler; bu gecikmeyi exploit etmek açıklar oluşturur

---

## Minimap Farkındalığı

### Alışkanlık Olarak Minimap Kontrolleri

IF oyuncu minimap'i düzenli kontrol etmiyorsa
MEANING takım arkadaşı pozisyonlarını, ölüm işaretlerini, spike hareketini ve utility ping'lerini kaçırıyor
COUNTER minimap'e sık sık göz at -- bu bilinçlice pratik ile inşa edilen bilinçdışı bir alışkanlık olmalı
WHY minimap tüm oyun durumunu tek görüntüde sıkıştırıyor; onu görmezden gelmek eksik bilgiyle karar vermek demek

### Minimap'i Okuma

IF dört takım arkadaşı haritanın bir tarafında kümelenmişse
MEANING karşı taraf lurk'lara ve hızlı execute'lara açık
COUNTER ya boşluğu kapatmak için rotate et ya da bir takım arkadaşının açık tarafı tutmasını çağır
WHY dengesiz kapsama takımların arkadan vurulma veya site'ları bedavaya kaybetmesinin birincil yolu

IF spike uzun süredir hareket etmediyse
MEANING düşman ya bilgi için default yapıyor ya yavaş fake ile bait yapıyor
COUNTER spike kesin şekilde bir site'a hareket edene kadar rotasyona aşırı commit etmekten kaçın
WHY eski spike pozisyonuna dayanan erken rotasyon takımların karşı site'a geç execute ile hazırlıksız yakalanma şekli

---

## Round Zamanlama Exploit'lemesi

### Saldırı Zamanlama Pencereleri

IF round yeni başladı ve takımın hızlı execute planı var
MEANING savunucular hala pozisyona geçiyor veya utility kuruyor olabilir
COUNTER erken agresyon savunucuları kurulum ortasında yakalar, utility'leri ve crosshair placement'ları hazır olmadan
WHY açılış fazı savunucuların gerçekten hazırlıksız olduğu tek zamandır -- kurduktan sonra her avantaj onlarda

IF round'un çoğu site vuruşu olmadan geçmişse
MEANING savunucular muhtemelen proaktif olarak bazı utility kullanmış ve sabırsızlanıyor olabilir
COUNTER geç execute'lar tüketilmiş savunucu utility'sinden faydalanır ama hız ve temiz koordinasyon gerektirir çünkü zaman baskısı artık saldırganlarda
WHY geç execute'un takası daha az düşman utility'si vs saatte daha az hata payı

### Zaman Baskısı Psikolojisi

IF saldırgan takım yavaş oynuyorsa
MEANING savunucular uzun süre tüm pozisyonlarda disiplin koruymalı, bu mental olarak yorucu
COUNTER saldırgan olarak tempoyu kasıtlı olarak değiştir -- yavaş round'ları takip eden hızlı rush'lar belirsizlik oluşturur ve savunma ritmini kırar
WHY tahmin edilemez zamanlama en güçlü makro silah çünkü savunucular okuyamadıkları zamanlamaya kaynaklarını önceden commit edemez

IF spike plant edilmiş ve savunucuların retake yapması gerekiyorsa
MEANING saat şimdi savunucuları baskılıyor -- spike'a ulaşmalı, tutucular temizlemeli ve patlama öncesi defuse'u tamamlamalılar
COUNTER post-plant saldırganları olarak her gecikme anı doğrudan savunucu opsiyonlarını azaltır; kalan zamanlarını tüketmek için utility ve reposition kullan
WHY defuse animasyonu güvenli pencere gerektiren sabit süreli commit -- o mevcut pencereyi defuse süresinin altına düşürmek round'u garanti eder

---

## Spawn Bazlı Okumalar

### Spawn RNG Exploit'lemesi

IF oyuncu spawn bölgesinin önüne doğru spawn olursa
MEANING anahtar harita pozisyonlarına arkada spawn olan takım arkadaşlarından daha erken ulaşır
COUNTER en hızlı spawn'lu oyuncu agresif erken pozisyonu veya peek'i alır; arka-spawn oyuncular destek rollerine varsayılanır
WHY hızlı ve yavaş spawn'lar arasındaki zamanlama farkı çatışan pozisyona kimin önce ulaştığını belirler -- spawn'a göre rol atamak sikke-atış fight'larını ortadan kaldırır

IF takımın taraflar arasında kabaca eşit olan erken zamanlama yarışması gerekiyorsa
MEANING kuru peek avantajsız saf sikke-atış
COUNTER ham aim düellosu almak yerine açıyı kontrol etmek için utility kullan
WHY avantajı garanti etmek için utility harcamak her zaman spawn RNG'sine ve ham reaksiyon süresine kumar oynamaktan iyidir

---

## Bilgi İnkarı

### Counter-Recon

IF düşman drone, Trailblazer, Sova dart veya Fade haunt deploy ediyorsa
MEANING recon hayatta kaldığı her an bedava düşman bilgisi
COUNTER recon utility'sini hemen yok et -- dart'lar ve haunt'lar tek atışta kırılır; drone ve Trailblazer'lar odaklı ateş gerektirir ama önceliklendirilmeli
WHY recon'u yaşatmanın maliyeti (tam takım pozisyonu açığa çıkar) birkaç mermi ve atıştan kısa pozisyon açığa çıkarma maliyetini çok aşar

### Smoke Pozisyonlama

IF oyuncu doğrudan smoke'un arkasında duruyorsa
MEANING smoke'tan geçen herhangi bir düşman çıkışta oyuncuyu hemen görür
COUNTER smoke duvarlarının arkasında değil yanında dur, push-through'lar baş-başa fight yerine off-angle ile karşılaşsın
WHY smoke push-through'lar savunucuları smoke'un hemen arkasında beklenen pozisyonda yakalamaya güveniyorlar -- yana kaymak bu varsayımı kırar

### Bilgi Ekonomisi

IF düşman takımından fazla bilgiye sahipse
MEANING onların execute'ları ve rotasyonları bilgiye dayanırken senin karşılıkların tahmin
COUNTER utility-tabanlı recon ile ses inkarını birleştirerek bilgi savaşını kazan -- her şeyi topla, hiçbir şey verme
WHY bilgi asimetrisi üst seviyede round sonuçlarının temel belirleyicisi; daha fazla veriye sahip takım daha az hata yapar

---

## Bait ve Switch

### Temel Bait ve Switch

IF takım bir site'ta gürültü ve utility mevcudiyeti yaratıyorsa
MEANING savunucular o site'ta tehdit kaydediyor ve rotasyon veya stack'lemeye başlıyor
COUNTER bait savunma tepkisini çektikten sonra gerçek vuruş sessiz rota ile karşı site'a gider
WHY ses ve utility bilgisi doğası gereği gecikmeli -- savunucular tehdidin OLDUĞU yere tepki verir, OLDUĞU yere değil

### Bait Zamanlama

IF bait çok kısaysa
MEANING savunucular rotasyona commit etmez ve switch hazırlanmış savunmaya çarpışır
COUNTER bait gerçek savunma tepkisi zorlayacak kadar uzun sürmeli -- sürekli utility veya birden fazla ses ipucu kullan
WHY üst seviyede savunucular rotate etmeden önce onay bekler; tek flash veya ayak sesi onları hareket ettirmez

IF switch bait'ten çok sonra geliyorsa
MEANING savunucuların durumu yeniden okumaya, fake'i anlamaya ve pozisyonları sıfırlamaya zamanı olur
COUNTER savunucuların bait'e tepki vermeye başladığını onayladıktan sonra switch'i hemen uygula
WHY "savunucular bait'e commit etti" ile "fake olduğunu fark etti" arasındaki pencere dar ve hızla exploit edilmeli

---

## Clutch Metodolojisi

### Save vs. Clutch Kararı

IF spike plant edilmemiş, birden fazla düşman hayatta ve oyuncunun değerli silahı var
MEANING round'u kazanma olasılığı son derece düşük ve silah gelecek round'da daha değerli
COUNTER silahı koru -- gelecek round için ekonomiyi korumak daha yüksek değerli oynama
WHY korunan tüfek gelecek round'un sonucunu değiştirebilir, kaybedilen clutch girişimi hem round'u hem ekonomiyi harcar

IF spike plant edilmiş ve oyuncunun post-plant utility'si var
MEANING saat oyuncuyu kayırıyor ve utility defuse'u inkar edebilir
COUNTER clutch'ı oyna -- defuse'u geciktirmek ve izole fight'lar zorlamak için utility kullan
WHY post-plant durumlar zaman baskısını savunuculara çevirerek gecikme yoluyla 1v2 veya 1v3'ü bile kazanılabilir kılıyor

### İzolasyon Protokolü

IF oyuncu clutch'ta birden fazla düşmana karşı karşılaşıyorsa
MEANING eş zamanlı çoklu-açı fight almak neredeyse her zaman kayıptır
COUNTER harita geometrisi, utility ve reposition kullanarak düşmanları sıralı düellolara izole et
WHY insanın aim sistemi aynı anda sadece bir hedefi işleyebilir; 1v2'yi iki 1v1'e çevirmek kazanma olasılığını dramatik artırır

IF oyuncu clutch sırasında kill alırsa
MEANING hayatta kalan düşmanlar fight'ı duydu ve oyuncunun pozisyonunu biliyor
COUNTER her kill sonrası hemen reposition et -- aynı açıdan asla re-peek etme
WHY düşman son bilinen pozisyonu pre-aim eder; orada kalmak kazanılmış fight'ı kaybedilene çevirir

---

## Mental Oyun

### Tilt Tanıma

IF oyuncu arka arkaya birden fazla round aynı başarısız oyunu tekrarlıyorsa
MEANING otopilotta veya tilt'te, adaptasyon yerine alışkanlığa varsayılan
COUNTER round başına bir bilinçlice değişiklik zorla -- farklı pozisyon, farklı zamanlama, farklı yaklaşım
WHY üst seviye düşmanlar round'lar arasında adapte olur; aynı pattern'i tekrarlamak azalan getirileri garanti eder

IF takım arkadaşı belirgin şekilde tilt'teyse (geniş peek'ler, sessiz iletişim, agresif aşırı uzanma)
MEANING karar kaliteleri düşmüş ve düşmanın momentum'unu besliyorlar
COUNTER mevcutsa timeout çağır; değilse tilt'li oyuncunun rolunu basitleştirerek karar yükünü azalt
WHY tilt'li oyuncudan karmaşık kararları kaldırmak zararı sınırlarken takım taktik ağırlığı taşıyor

### Güven Kalibrasyonu

IF oyuncu az önce çoklu-kill round geçirdi ve durdurulamaz hissediyorsa
MEANING aşırı güven ego peek'lere, solo oyunlara ve takım utility'sini görmezden gelmeye yol açar
COUNTER her round öncesi "takım ne gerektiriyor?" sor, "ne yapmak istiyorum?" değil -- rol-bazlı oyun duygusal karar vermeyi kaldırır
WHY bireysel parlama round'ları istatistiksel olarak tutarsız; onlara güvenmek zirve-veya-çukur performans oluşturur

### Otopilot Tuzağı

IF oyuncu bilinçlice düşünmeden her round aynı setup, aynı pozisyonlar ve aynı rotasyonları çalıştırıyorsa
MEANING düşman pattern'i okuyacak ve hard-counter yapacak
COUNTER her round en az bir kasıtlı değişiklik zorla -- pozisyon, zamanlama veya utility sırasını değiştir
WHY Radiant seviyede tahmin edilebilirlik düşmana bedava bilgi vermekle eşdeğer; çeşitlilik bilgi inkarının bir formu

---

## İletişim Protokolleri

### Temel Çağrılar

IF oyuncu temas kuruyorsa
MEANING takım hemen pozisyon, sayı ve hasar bilgisine ihtiyaç duyuyor
COUNTER özlü çağır: sayı, biliniyorsa sağlık, konum -- "Bir lit 80 A Main" şablon
WHY geç veya belirsiz çağrılar takım arkadaşlarını eksik bilgiyle karar vermeye zorlar, kayıp round'lara birikir

IF oyuncu ölürse
MEANING kameraları hala bilgi sağlayabilir ve ölüm konumları hikaye anlatır
COUNTER düşman pozisyonuyla ölüm çağrısı sun: "Öldü, bir A Main" -- sonra sorulmadıkça sus
WHY ölüm bilgisi takım arkadaşlarının rotate mi yoksa tutma mı kararını belirler; sinir nedeniyle bilgiyi tutmak round'daki en değerli çağrıyı harcar

### İletişim Disiplini

IF takım arkadaşı clutch yapıyorsa
MEANING ham bilginin ötesinde her sesli trafik baskıncı ve gürültü ekler
COUNTER sadece olgusal bilgi çağır (düşman pozisyonları, spike durumu, utility statüsü) -- öneri yok, arka koltuk çağrısı yok
WHY clutch oyuncuları ses ipuçlarını duymak için sessizliğe ihtiyaç duyar; ekstra sesli trafik round'u belirleyen ayak seslerini ve yetenek seslerini maskeler

IF IGL bir oyun çağırırsa
MEANING takımın tartışmak değil execute etmesi gerekiyor
COUNTER "tamam" veya sessizlikle onayla, sonra execute et -- mid-round'da gerçekten kafası karışmadıkça çağrıyı geri tekrarlama veya açıklayıcı sorular sorma
WHY çağrıyı tartışmaya harcanan round zamanı execute etmeye harcanmayan round zamanı; temiz iletişim karar-eylem gecikmesini sıkıştırıyor

---

## IGL Karar Ağaçları

### Saldırı Tarafı

IF erken bilgi bir site'ta zayıf savunma gösteriyorsa
MEANING düşman eksik commit etmiş ve hızlı vuruş zayıf tarafı cezalandırır
COUNTER eksik kadrolu site'ta full utility ile hemen execute et
WHY rotasyonlar gelmeden vurmak sayı avantajını site take'ine çevirir

IF bilgi toplama fazından sonra net okuma yoksa
MEANING düşman ya tahmin edilemez stack'liyor ya saldırı hareketini yansıtıyor
COUNTER her iki site'ta baskıncı yay, sonra daha zayıf karşılık gosterene commit et
WHY bölü baskıncı savunmayı tahsisini açığa çıkmaya zorlar, bilinmeyeni bilinene çevirir

IF site commit'i olmadan zaman azalıyorsa
MEANING saldırganlara tempo savaşını kaybetmiş ve savunucular avantaj tutuyor
COUNTER kalan utility ne olursa olsun en yakın uygulanabilir site'a hemen commit et -- bu noktada tereddüt kaybı garanti eder
WHY geç-round kararsızlık optimal-altı execute'dan bile kötü; en azından commit edilmiş push fight fırsatları oluşturur

### Savunma Tarafı

IF uzun süre düşman teması görünmüyorsa
MEANING saldırganlara ya bilgi için yavaş-default yapıyor ya koordineli geç vuruş kuruyor
COUNTER bilgi için tek agresif peek düşün ama aşırı commit etme -- bir oyuncu dışarı çıkar, okuma yapar ve geri çekilir
WHY yavaş saldırılara karşı pasif savunma saldırganlara bedavaya tam harita kontrolu verir; hesaplanmış bilgi peek'i savunma kurulumundan fedakarlık etmeden ritmlerini bozar

IF saldırganlara tam execute başlıyorsa
MEANING site tutucular geciktirmeli, kahramanlık oynamamalı
COUNTER site'ta teksen push'u yavaşlatmak için utility kullan ve rotasyon çağırarak retake pozisyonuna düş; iki savunucu varsa bölü açılardan contest et
WHY rotasyonlar için zaman kazanmadan site'ta ölmek en kötü sonuç -- birkaç anlık gecikme bile koordineli retake için tam takımın ulaşmasına izin verebilir

### Ekonomi

IF takım pistol round'u yeni kaybettiyse
MEANING düşman gelecek round için belirgin silah ve utility avantajına sahip
COUNTER bonus round'u contest etmek için kısmi utility ile hafif silahlar force-buy yap veya sonraki round temiz buy için tam-save yap -- bu birleşik takım kararı olmalı
WHY bölü-buy (bazıları force, bazıları save) uyumsuz ateş gücü oluşturur ve tutarlı round planı üretmeden kredi harcar

IF takım full-buy yapabiliyorsa ama bonus-round silahlarıyla yeni kazandıysa
MEANING mevcut donanım fonksiyonel ve krediler biriktirilebilir
COUNTER bonus-round silahlarını koru ve tüfeklere yükseltmek yerine full utility'ye yatır
WHY utility ham silah yükseltmelerinden daha fazla round kazandırır; fonksiyonel donanımı korurken kredi biriktirmek uzun vadeli ekonomik avantaj oluşturur

---

## VOD Review

### Kendi-Review Protokolü

IF oyuncu kendi VOD'unu izliyorsa
MEANING rastgele gözlemler değil, aksiyon alınabilir pattern'ler çıkaracak yapılı çerçeve gerekli
COUNTER ilk geçiş: duraklatmadan izle, yanlış hissettiren round'ları işaretle; ikinci geçiş: her ölümde durakla ve sebebi kategorize et (pozisyonlama, zamanlama, aim, bilgi, iletişim); üçüncü geçiş: beceriyi şanstan ayırmak için kazanma round'larını review et
WHY yapılandırılmamış VOD review spesifik düzeltmeler yerine belirsiz hisler üretir; üç-geçiş yöntemi filmi somut pratik planına çevirir

### Pattern Çıkarma

IF aynı hata kategorisi birden fazla haritada görünüyorsa
MEANING oyuncunun tek seferlik hata değil, sistematik zayıflığı var
COUNTER en çok tekrarlanan ilk iki veya üç pattern'i izole et ve daha fazla görüntü review etmeden önce o spesifik alanlara odaklı pratik adamak
WHY bir tekrarlayan pattern'i düzeltmek o pattern'in görüneceği her gelecek round'u iyileştirir; rastgele tek seferlik hataları düzeltmenin minimal birikimli değeri var

### Pro VOD Review

IF oyuncu profesyonel oyundan öğrenmek istiyorsa
MEANING kullanılabilir dersler çıkarmak için dar odak gerekli
COUNTER bir pro oyuncu, bir ajan, bir harita seç -- round round pozisyonlamayı, sonra utility kullanımını, sonra ekonomi kararlarını izle; daha fazla review etmeden önce sonraki beş ranked oyuna bir çıkarım uygula
WHY geniş pro VOD review hayranlık üretir, gelişim değil; anında uygulama ile dar odak gözlemi beceriye çevirir

---

## Isınma Yapısı

### Ranked Öncesi Isınma

IF oyuncu ranked'e girecekse
MEANING soğuk mekanikler kaçırılan açılış düelloları üretir
COUNTER fare aktivasyonu için aim antremanı, counter-strafe drill için hard bot'lar, crosshair placement odaklı bir deathmatch (kill-kovalama değil)
WHY ısınma mevcut kas hafızasını aktive eder; amaç hazırlık, gelişim değil

### Uzun Isınma

IF seans yüksek-risk'li (turnuva, scrim)
MEANING oyuncunun mekanik keskinlik ve harita-spesifik hazırlığa ihtiyacı var
COUNTER tracking ve flick aim senaryoları, Range'de hız challange, iki deathmatch (biri tapping, biri spray) ve beklenen haritanın custom-oyun yürüyüşü ekle
WHY turnuva oyunu hem aim aktivasyonu hem taktiksel hazırlama gerektirir; birini atlamak exploit edilebilir boşluk oluşturur

---

## Rank Modülasyonu

### Immortal+ İçin

IF Radiant seviye oyununu rafine etmek istiyorsan
MEANING bu dokümandaki her pattern doğrudan uygulanabilir
COUNTER mikro-kararlarını bilinçlice pratik et: off-angle rotasyonu, ses inkarı, spawn-bazlı rol ataması
WHY Immortal+'da fark yapan şey macro karar kalitesi ve mikro-mekanik tutarlılık; bu dokümanın özeti

### Diamond-Ascendant İçin

IF Radiant pattern'lerini uyarlamak istiyorsan
MEANING temel prensipler aynı ama uygulama seviyesi farklı
COUNTER crosshair placement, ses ipucu okumaları ve post-plant üçgeni ile başla -- bu üç prensip en yüksek getiriyi sağlar
WHY ileri pattern'lerin temeli bu üç beceride oturur; bunlar sağlamsa geri kalan donuk yerine oturur
