---
id: general_radiant-tips
type: general
patch: "13.00"
verified: 2026-07-08
tags: [general, radiant, tips]
---

# Radiant Seviye Koçluk Bilgi Bankası

Radiant'ı diğerlerinden ayıran şey refleks değil — pattern okuma ve mikro-kararlar. Buradaki her ipucu IF / MEANING / COUNTER / WHY formatıyla geliyor. Yüz yüze koçluk gibi oku.

---

## Pozisyonlama Pattern'leri

### Off-Angle Teorisi

IF düşman peek atmadan önce crosshair'ini default açıya koymuşsa
MEANING sen o default açıyı tutuyorsan, peek atmadan seni çoktan bulmuş demek
COUNTER default'tan biraz kay — aynı koridoru kapatacak kadar yakın dur, ama seni bulmak için mikro-ayar yapmak zorunda kalsın
WHY o zorladığın mikro-ayar, sana önce ateş etme fırsatı veren reaksiyon boşluğunu açar

IF o off-angle'dan düşman öldürdüysen
MEANING düşman takımı o noktayı işaretledi, sıradaki round o açıyı tutarak gelecekler
COUNTER her off-angle'ı tek round kullan, sonra farklı pozisyona geç
WHY o açıyı bekliyorlarsa siperini de feda etmiş olursun — default'tan bile kötü bir pozisyona döner

### Derinlik Pozisyonlama

IF köşe kenarına yakın duruyorsan
MEANING düşman köşeyi geçer geçmez seni görür; açı avantajın var ama birden fazla düşmana karşı kör kalırsın
COUNTER yakın derinliği sadece izole düellolarda ve dar koridorlarda kullan — tek düşman gelecekse
WHY yakın derinlik açı avantajını sonuna kadar açar ama birden fazla tehdidi işlemeye vakit bırakmaz

IF köşeden uzakta duruyorsan
MEANING peek atan seni crosshair placement (nişanı kafa hizasında/köşeye önceden koyma) noktasında değil, ekranın kenarında görür — düzeltmek için vakit kaybeder
COUNTER birden fazla düşman peek atabilecekse uzak derinliği seç — tam resmi görmeden yüklenmezsin
WHY köşeden uzaklık, peek atanı hem yatay hem dikey ayar yapmaya zorlar, reaksiyon yükünü ikiye katlar

### Peek Edilmemiş Pozisyon

IF takım arkadaşların site'i temizledi ama derin köşeleri, kapı arkalarını veya alt-yükseklik noktalarını sadece önünden geçtilerse
MEANING o noktalar düşmanın kafasında "temizlendi" diye işaretlendi
COUNTER lurk ve retake için o noktaları kullan — takımının gerçekten kontrol ettiği yerle, sadece önünden geçtiği yeri ayır
WHY temizleme sonrası gelen rahatlık, düşmanın köşe check etmeyi bırakmasını sağlar; peek edilmemiş noktadan tek kill retake'i çevirir

### Post-Plant Üçgeni

IF spike yerde ve saldırgan olarak tutman gerekiyorsa
MEANING savunucular birden fazla hattan retake etmek zorunda
COUNTER üç nokta tut:
- Biri spike'a yakın, defuse sesini yakalar
- Biri orta mesafede birincil yaklaşımı kapatır
- Biri derinde rotate edenleri izler

WHY bu üçgen, retake'e geleni bölünmüş açılarla uğraşmaya zorlar — birinin üstüne gidince diğerine açığını verir

## Hareket Mekanikleri

### Dur ve Ateş Et (ters tuş)

IF yana hareket hâlindeyken ateş ediyorsan
MEANING ilk atışın merkezden sapar, düşmanı ıskalarsın
COUNTER bastığın yön tuşunun tersine kısa dokun, model durunca ateş et — tuşa basarken değil, tam durduktan sonra
WHY Valorant'ta en ufak hareket bile atışı dağıtıyor, bu cezası ağır bir hata

IF aynı hareketle hem jiggle atıp hem ateş etmek istiyorsan
MEANING tek ters-tuş dokunuşu yetmez, iki yönde de durman gerekir
COUNTER bir yana git, karşı tuşla dur, o kısa sabit anda ateş et, sonra çık — A-D-A veya D-A-D dizisini kas hafızana yerleşene kadar çalış
WHY bu döngü açıyı yoklamayı, atışı ve kaçmayı tek harekette birleştirir — Radiant'ta temel budur

### Jiggle Peek

IF bir açı hakkında canını riske atmadan bilgi almak istiyorsan
MEANING omzunun ucunu gösterip düşmanı ya ateş ettirir ya da yerini ifşa ettirirsin; bunun için hızlı bir A-D yaparsın
COUNTER modelinin sadece ince bir dilimi geçsin — düşmanın tepki veremeyeceği kadar az aç
WHY bedava bilgi: düşman ateş ederse yerini verir ve silahının toparlanma anını yakalarsın, ateş etmezse açı temiz demektir

### Ferrari Peek

IF düşmanın tam olarak nerede durduğunu biliyorsan
MEANING Ferrari peek (gaza basıp hızla gir-çık) — tam strafe hızında geniş açıyla yüklenirsin, karşı taraf seni gözüyle takip etmek zorunda kalır
COUNTER bilinen noktaya açıyı tut, tam hızda geniş peek at, ters tuşla dur ve ateş et
WHY geniş açılı peek seni köşe kenarından hızla uzaklaştırır — düşman baskı altında büyük bir ayar yapmaya zorlanır

IF o açıda op olduğunu biliyorsan
MEANING ferrari peek işe yaramaz, tek atışta ölürsün
COUNTER op açısına ferrari peek atma — önce util kullan ya da jiggle ile atışını bait et
WHY op takip etmeyi gerektirmez, gövdene bir kurşun yeter; hareket avantajın sıfırlanır

### Eğilme Disiplini

IF bir açıya eğilerek giriyorsan
MEANING başın, headshot bekleyen düşmanın tam gövde hizasına iner; hem yavaşlarsın hem de daha büyük hedef olursun
COUNTER dövüşe ayakta gir, kısa seri at, spray ortasında vücut hizanı kaydırmak için eğil — başında değil, ortasında
WHY spray ortasında eğilirsen başın düşmanın nişan aldığı noktanın altına düşer, aynı anda spray sıçramasını da aşağı çekersin

IF op tutan biriyle karşı karşıyaysan
MEANING eğilirsen yavaş ve geniş bir hedef olursun — en kötü profil bu
COUNTER op'a karşı her zaman ayakta kal, ters tuşla durup ateş et
WHY eğilmek hareket hızını öldürür, op tutanın işini kolaylaştırırsın

---

## Crosshair Placement

### Baş Yüksekliği

IF crosshair'in baş yüksekliğinin altındaysa
MEANING her dövüşe dikey bir düzeltmeyle başlarsın — reaksiyon süren daha bitmeden düelloyu kaybedersin
COUNTER haritadaki referans noktalara kilitlen: kutu üstleri, pencere çerçeveleri, duvar doku çizgileri. O seviyeyi hareket halinde de koru
WHY dikey ayarı sıfırlarsan, düşman çıktığında sadece yatay düzeltme yaparsın. Tepki süren neredeyse yarıya iner

### Açıyı Önceden Tutma Noktaları

IF crosshair'i köşeye yakın ama ortada tutuyorsan
MEANING düşman peek attığında hem tepki verip hem ayar yapman gerekir — bu iki iş birden
COUNTER crosshair'i tam köşe kenarına, baş yüksekliğine koy. Düşmanın başının ilk göründüğü yere
WHY oraya koyduysan sadece tıklarsın. Tıkla-sonra-ayarla değil, sadece tıkla

### Rotasyon Sırasında Crosshair

IF rotate ederken veya koşarken crosshair'i yere bırakıyorsan
MEANING lurker seni o anda yakalarsa, crosshair baş yüksekliğine çıkana kadar zaten ölmüş olursun
COUNTER rotasyonda da crosshair'i baş yüksekliğinde tut. Her geçtiğin açıyı süzgeçten geçir
WHY crosshair'i bir kez gevşettiğin round, lurker'ın seni o gevşek açıdan bedavaya vurduğu round olur

### İki Açı Aynı Anda

IF aynı anda iki tehdit varsa — örneğin Ascent A retake'inde Heaven ve Tree
MEANING birini önceden hedeflersen diğeri tamamen açık kalır
COUNTER crosshair'i ikisinin ortasına koy, ama daha olası tehdide hafif yatır
WHY iki açıya da nişan düzeltme mesafeni kısaltırsın. En kötü durumda bile reaksiyon farkın düşük kalır

---

## Ses İpucu Okumaları

### Ses Önceliği

IF spike sesi geliyorsa (plant, defuse, bip hızlanması)
MEANING o round'un en kritik sesi bu — sonucu doğrudan belirler
COUNTER hemen callout at, kararını o sese göre ver — gerisini bırak
WHY spike durumu sana push mu, tut mu, rotate mı yapacağını söyler — hiçbir ses bunun önüne geçemez

IF yakında mermi doldurma sesi duyuyorsan
MEANING düşmanın silahı boş, doldurma bitene kadar elini kolunu bağlamış durumda
COUNTER o an hemen üstüne git — doldurma bitmeden seni vuramaz
WHY tereddüt edersen düşman doldurmayı tamamlar, düello sıfırlanır — bu pencere bedava

### Ses İnkarı

IF bir açıya koşarak yaklaşıyorsan
MEANING düşman seni duyar ve geldiğin noktaya açıyı tutar
COUNTER açılara, flank'lara ve lurk'e girerken shift ile yürü
WHY konumunu sesle verirsen pozisyon avantajın sıfırlanır — düşman o sesi açı tutmaya çevirir

IF düşmanı yanıltmak istiyorsan
MEANING bir yöne koşup sonra sessizce başka yöne geçmek, düşmanın kafasına yanlış bilgi yerleştirir
COUNTER sahte yöne kısa koş, ayak sesi bırak, sonra gerçek hedefe shift ile yürü
WHY ses gecikmeli bilgidir — düşmana nerede olduğunu değil, nerede OLDUĞUNU söyler; bu gecikmeyi kullan, açık yarat

---

## Minimap Farkındalığı

### Minimap'e Bakma Alışkanlığı

IF minimap'e bakmıyorsan
MEANING takım arkadaşlarının nerede olduğunu, kimin öldüğünü, spike'ın nereye gittiğini ve atılan util'i görmüyorsun
COUNTER her boş anda minimap'e bak — peek'ler arasında, mermi doldururken, util beklerken. Bunu bilinçli zorla
WHY minimap oyunun tamamını tek karede gösterir; bakmazsan kör karar alırsın

### Minimap'i Okumak

IF dört takım arkadaşın haritanın aynı tarafında yığılmışsa
MEANING karşı taraf lurk'a ve hızlı execute'a tamamen açık
COUNTER ya o tarafa kay ya da bir takım arkadaşından boş tarafı tutmasını iste
WHY dengesiz dağılım, arkadan vurulmanın ve bedava site kaybetmenin bir numaralı sebebidir

IF savunmadayken plant sesi ya da net bir görüş çağrısı gelmediyse
MEANING düşman ya haritayı yokluyor ya da seni erken rotasyona çekmeye çalışıyor
COUNTER plant sesi veya takımdan net görüş çağrısı gelmeden rotate etme — util sesi tek başına rotasyon sebebi değil
WHY görmeden erken rotate edersen tuttuğun site'ı bedava bırakırsın; fake'in bir numaralı hedefi erken dönen savunmacıdır

---

## Round Zamanlamasını Sömürmek

### Saldırı Zamanlama Pencereleri

IF takımın hızlı execute planı varsa ve round daha yeni açıldıysa
MEANING savunucular hâlâ pozisyona geçiyor, util'lerini henüz dizmediler
COUNTER hemen bas — açılışta yakalarsan hazır değiller, crosshair'leri senin üzerinde değil
WHY round açılışı, savunucunun gerçekten hazırlıksız olduğu tek an; bir kez yerleştiler mi her avantaj onlara geçer

IF takımın bir site'a tam yüklendiyse ve spike henüz kurulmadıysa
MEANING savunucular util'lerini boşalttı, pozisyonlarında gerginlik var
COUNTER geç execute at — dolu util'li bir savunmaya değil, boşalmış bir savunmaya girersin
WHY az util = daha temiz giriş; ama koordinasyon kusursuz olsun — flash, smoke ve giriş aynı saniyede

---

### Zaman Baskısı Psikolojisi

IF saldırgan olarak bilerek yavaş oynuyorsan
MEANING rakip her round dar açıda dikkatini tutamaz — bir noktada gözü kayar
COUNTER tempoyu kır — yavaş round'tan sonra aniden hep birlikte bas; ritmi kaybeden savunucu yanlış tepki verir
WHY okuyamadıkları bir tempoyu önceden karşılamak için adam ya da util yatıramazlar

IF spike kurulmuşsa ve savunucular retake'e geliyorsa
MEANING artık baskı onların üzerinde — spike'a ulaşmaları, temizlemeleri ve defuse'u bitirmeleri lazım, hepsi üst üste
COUNTER util at ve yer değiştirme yap — onların kaybettiği her saniye senin kazancın
WHY defuse sabit süreli bir animasyon; o pencereyi defuse süresinin altına çekersen round bitti

## Spawn Bazlı Okumalar

### Spawn RNG'sini Kullan

IF öne doğru spawn aldıysan
MEANING kilit noktaya takım arkadaşlarından önce ulaşırsın
COUNTER hemen agresif pozisyonu al; geç spawn alanlar seni desteklesin
WHY açıyı, kim önce gelirse o belirler — spawn'a göre rol paylaşmazsan aynı noktaya iki kişi koşar, ikisi de ölür

IF karşı takımla aynı noktaya aynı anda ulaşıyorsan
MEANING bu saf bir düello, sana bir avantaj yok
COUNTER ham düelloya girme — flash, smoke veya molly at, açıyı util'le zorla
WHY util harcamak, her zaman spawn şansına kumar oynamaktan iyidir

---

## Bilgi İnkarı

### Counter-Recon

IF düşmanın recon'u aktifse (dart, haunt, recon bıçağı veya recon drone)
MEANING o recon yaşadığı sürece pozisyonun düşmana bedava gidiyor
COUNTER hemen vur ve kır — dart ve haunt tek atışta düşer; drone ve recon bot için birkaç atış gerekir ama yine de önce onları al
WHY birkaç mermiyi esirgeyip recon'u yaşatırsan, takımının nerede durduğunu rakibe verirsin — bu takas sana hiçbir şey kazandırmaz

### Smoke Pozisyonlama

IF smoke'un tam arkasında duruyorsan
MEANING smoke'tan geçen düşman çıkışta seni anında görür, sen onu göremezsin
COUNTER smoke'un tam arkasında durma — yana çekil, off-angle kur; smoke'u geçen düşman seni beklediği yerde bulamasın
WHY smoke'u push eden, arkasında biri olduğunu bilir ve oraya bakar — yana kayarsan bu okumayı kırarsın

### Bilgi Ekonomisi

IF düşman takımı senden fazla bilgiye sahipse
MEANING onlar her hamlesini veriye dayandırır, sen tahminle oynarsın
COUNTER recon util'inle düşmanın yerini öğren, sesinle ve pozisyonunla da bilgi verme — ikisini aynı anda yürüt
WHY bilgi farkı üst seviyede round'u belirleyen şeydir; elinde daha fazla veri olan takım daha az hata yapar

---

## Bait ve Switch

### Temel Bait ve Switch

IF bir site'a baskı yapıp gürültü ve util harcıyorsanız
MEANING savunucular o site'a kilitlenir ve rotate etmeye başlar
COUNTER savunucular o site'a kaydıktan sonra diğer site'a sessizce gir
WHY ses ve util bilgisi her zaman gecikmelidir — savunucular tehdidin geldiği yere koşar, çoktan geçtiğin yere değil

### Bait Zamanlaması

IF bait'in çok kısaysa
MEANING savunucular yerinden kımıldamaz ve switch tam hazır bir savunmaya çarpar
COUNTER bait'ini uzat — birden fazla ses çıkar, sürekli util kullan, savunucuyu gerçekten yerinden et
WHY üst seviyede savunucu rotate etmeden önce ikinci bir teyit bekler; tek flash ya da tek ayak sesi onu yerinden etmez

IF geçiş bait'ten çok sonra geliyorsa
MEANING savunucuların fake'i okuyup eski pozisyonlarına dönmesi için zaman kalır
COUNTER savunucunun bait'e gerçekten yüklendiğini gördüğün an diğer site'a geçişi hemen yap
WHY "yüklendi" ile "fake olduğunu anladı" arasındaki pencere çok kısa — o pencereyi kaçırırsan bait boşa gider

---

## Clutch Metodolojisi

### Save mı Clutch mı?

IF spike kurulmamışsa, iki veya daha fazla düşman ayaktaysa ve elinde değerli silah varsa
MEANING round'u kazanma ihtimalin yok denecek kadar düşük
COUNTER silahı kurtar — bir sonraki round için ekonomini sağlam tut
WHY o silah bir sonraki round'u döndürebilir; boşa gitti mi hem round'u hem ekonomiyi yakarsın

IF spike kurulmuşsa ve elinde post-plant için util varsa
MEANING zaman artık seni kayırıyor, util defuse'u engeller
COUNTER clutch'ı oyna — defuse'u geciktirmek için util'ini kullan, düşmanları teker teker fight'a zorla
WHY spike patlama baskısı altında savunucu panikler; 1v2 hatta 1v3 bile kazanılabilir hale gelir

### İzolasyon

IF clutch'ta aynı anda birden fazla düşmanla karşılaşıyorsan
MEANING iki açıdan aynı anda baskı yersen kaybedersin, nokta
COUNTER harita geometrisini ve util'ini kullan, düşmanları sıraya sok — birer birer fight al
WHY bir anda sadece bir hedefe aim edebilirsin; 1v2'yi iki ayrı 1v1'e çevir

IF clutch'ta bir düşman düşürdüysen
MEANING hayatta kalan düşmanlar sesin geldiği yeri biliyor
COUNTER her kill'den sonra pozisyon değiştir — aynı açıdan bir daha bakma
WHY düşman senin son görüldüğün noktaya açı tutar; orada beklersen kazandığın fight'ı geri verirsin

---

## Mental Oyun

### Tilt Tanıma

IF aynı başarısız hamleyi arka arkaya birkaç round tekrarlıyorsan
MEANING otopilottasın ya da tilt'tesin — adapte olmak yerine alışkanlığa kaçıyorsun
COUNTER her round'a bilinçli bir değişiklikle gir: farklı pozisyon, farklı yaklaşım, farklı util sırası
WHY üst seviye rakip round'lar arasında seni okur; aynı şeyi tekrarlıyorsan ona bedava bilgi veriyorsun

### Otopilot Tuzağı

IF her round aynı setup, aynı pozisyon, aynı rotasyonla oynuyorsan
MEANING rakip seni okudu ve hard-counter hazırlıyor
COUNTER her round en az bir şeyi bilerek değiştir: pozisyon, zamanlama veya util sırası
WHY Radiant seviyede tahmin edilebilirsen rakibe bedava bilgi verirsin; çeşitlilik bunu keser

---

## IGL Karar Ağaçları

### Saldırı Tarafı

IF erken bilgi bir site'ta az savunucu gösteriyorsa
MEANING düşman o site'a tam adamını koymamış
COUNTER o site'a tüm util'ini dökerek hemen gir
WHY rotasyon gelmeden vurursan sayı üstünlüğü işe yarar

IF keşif yaptın ama hangi site'a gideceğini hâlâ bilmiyorsan
MEANING düşman ya öngörülemez şekilde yığılmış ya da seni okuyor
COUNTER iki site'ta da baskı uygula, hangisi daha az direnç gösterirse oraya yüklen
WHY çift baskı düşmanı seçim yapmaya zorlar, belirsizliği ortadan kaldırır

IF round bitiyor ama hâlâ site'a girmediysen
MEANING tempo savaşını kaybettin, savunma kazanıyor
COUNTER elinde ne util varsa kullan, en yakın site'a hemen gir — duraksarsan round bitti
WHY geç round'da kararsız kalmak, kötü bir execute'tan bile beterdir; en azından bir push savaşma fırsatı doğurur

### Savunma Tarafı

IF uzun süre hiç düşman teması olmadıysa
MEANING saldırganlar ya yavaş default çekiyor ya da geç bir vuruş kuruyorlar
COUNTER bir oyuncu çıkıp peek atsın, okuma yapsın, geri çekilsin — fazla içeri girmesin
WHY pasif kalırsan harita kontrolünü düşmana bedava verirsin; tek bir peek onların ritmini bozar

IF düşman tam execute başlattıysa
MEANING site'taki savunucu tek başına durduramaz
COUNTER
- Tek kişiysen: util kullan, push'u yavaşlat, retake pozisyonuna düş
- İki kişiyseniz: farklı açılardan contest et, rotasyon çağır
WHY rotasyon gelmeden orada ölmek en kötü senaryo; birkaç saniyelik gecikme bile takımın toplanmasına yeter

### Ekonomi

IF takım pistol round'u kaybettiyse
MEANING düşmanın bir sonraki round'da silah ve util üstünlüğü olur
COUNTER ya hep birlikte hafif silah + kısmi util ile force-buy yapın, ya da hep birlikte tam save edin — karar ortak olsun
WHY yarısı force yarısı save yaparsa ateş gücünüz tutarsız olur ve krediler çöpe gider

IF full-buy yapabiliyorsunuz ama elinizdeki bonus-round silahlar hâlâ işe yarıyorsa
MEANING silahlar fonksiyonel, kredi biriktirme şansın var
COUNTER silahları koru, tüfeğe yükseltme — parayı util'e yatır
WHY round'u util kazandırır, ham silah yükseltmesi değil; iyi donanımı korurken kredi biriktirirsen 2-3 round sonra full buy bozulmadan döner

---

## Öncelik Sırası

IF bu dosyadaki her şeyi aynı anda uygulamaya çalışıyorsan
MEANING hepsi birden kas hafızasına oturmaz
COUNTER önce üçünü otur: crosshair'i baş hizasında tutmak, ses ipucu okumak, post-plant üçgeni — gerisi bunların üstüne oturur
WHY ileri seviye her beceri bu üçünün üstüne kurulur; temel sağlamsa gerisi kendiliğinden gelir
