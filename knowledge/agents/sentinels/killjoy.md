---
patch: "13.00"
verified: 2026-07-08
---

# AJAN: Killjoy

## 1. Rol Kimliği
Killjoy tek başına site tutan en güçlü ajandır. Botun ve taretin bilgi getirir, molly'n hasar verir, ult'un site'ı temizler. Düşman site'a girmek için bile yetenek harcamak zorunda kalır — sen tam burayı sömürürsün. Senin işin öldürmek değil: düşmanın zamanını ve yeteneğini tüket, takımına alan aç.

## 2. Yetenek Seti
- **Alarm Botu (Q)** — 1 şarj, fiyat patch'e göre değişir, tur arası geri toplanır. Yere gizli bir bot bırak; menziline giren düşmanı kovalar, yakınında patlar ve onu savunmasız (aldığı hasar artar) yapar. İşi hasar değil — bilgi vermek ve düşmanı bir sonraki yeteneğine açık hale getirmek. Botu molly'nin patlayacağı yere koy: bot savunmasız bırakır, molly üstüne biner.
- **Taret (E)** — 1 şarj, bedava (imza yeteneği), geri toplanıp yeniden kurulabilir. Önüne baktığı 180 derecelik yayı tarayan, otomatik ateş eden bir taret kur. Ateş temposu güçlendirildi — açıkta yakalanan düşmana artık gerçek hasar baskısı da kurar; yine de asıl değeri sana "düşman şu anda buradan geliyor" bilgisini sesle vermesi. Sınırlı bir menzili var: o menzilden çok uzağa gidersen taret devre dışı kalır, yani rotate ederken menzilini hesaba kat.
- **Molly (C)** — fiyat ve şarj patch'e göre değişir. Bir el bombası at; yere inince gizlenir, sen tetikleyince geniş bir alana saniyede hasar veren bir hasar bulutu açılır (yaklaşık 45 hasar/sn, patch'e göre değişir). Bulut artık daha uzun açık kalır — defuse'u bölme gücü arttı. Düşmanı alandan söker ya da ciddi hasar yedirir. Post-plant için sakla: defuse'a gelen düşmanın üstüne patlat, defuse'u böl.
- **Ult / Kilit (X)** — 9 ult puanı (patch'e göre değişir). Geniş bir alana bir cihaz kur; uzun bir hazırlanma süresinden sonra menzildeki tüm düşmanları kısa süreliğine kilitler (ateş edemez, yetenek kullanamaz, yavaşlar). Hazırlık süresi uzun olduğu için cihaz açıkta dururken anında patlatılır — duvar arkasına ya da düşmanın içeri girmeden ulaşamayacağı yere koy. Site temizlemek veya post-plant'te retake'i kırmak için en güçlü kozun.

## 3. Temel Sorumluluklar
- **Tek başına site tut**: Orada fiziksel durmadan geciktir, uyar, hasar ver.
- **Botun bilgi içindir**: Asıl işi hasar değil — düşmanın agresyonunu erken açığa çıkar.
- **İki yeteneği üst üste koy**: Botun düşmanı savunmasız bırakır, molly üstüne patlar. İkisini düşmanın yürümek zorunda olduğu yere koy — kolayca dolanılan yere değil.
- **Molly'ni post-plant için sakla**: Her molly defuse girişimini ciddi süre geciktirir.
- **Ult'unu duvar arkasına koy**: Açıkta bıraktığın ult anında patlatılır.

## 4. Sık Yapılan Hatalar
- Botunu tek peek'te ölen açık yere koyuyorsun — bilgi getirmeden öldürülüyor.
- Tüm yeteneğini tek choke'a yığıyorsun — tek bir recon hepsini siliyor.
- Botun tetiklendikten sonra molly'ni atıyorsun — ikisini önceden üst üste koy, otomatik tetiklensin.
- Ult'unu açıkta kullanıyorsun — duvar arkası ya da düşmanın içeri girmeden ulaşamayacağı yer şart.
- Botunun yanında duruyorsun — yeteneğinin yarattığı gecikmeden faydalanmak için mesafeni koru.
- Çok uzağa rotate edip yeteneğini devre dışı bırakıyorsun — menzilini bil.
- Yeteneklerini round başında erken kuruyorsun, düşman erken geldiğinde ya hepsi keşfedilmiş ya kullanılmış oluyor — kurulumunu girişten önce tut, bilgiye göre yerleştir.
- Botunu hep aynı pozisyona koyuyorsun ama bekleme sesini hesaba katmıyorsun — düşman botun aktivasyon sesini duyup geri çekiliyor, sen sesi bilgi olarak takip etmiyorsun.

## 5. Kalıp -> Anlam

**IF** Botun çoğu roundda ilk temas anında öldürülüyorsa
**MEANING** Bot yerin çok açık ya da çok tahmin edilebilir. Düşman site'a girmeden nereyi vuracağını biliyor.
**COUNTER** Botunu düşmanın yok etmek için site'a girmek zorunda kaldığı off-angle'lara koy. Birkaç roundda bir yerini değiştir.
**WHY** Tahmin edilebilir bot bilgi getirmeden ölür. Off-angle yerleşim, düşmanı tehlikeli alana sokmadan botunu öldüremez hale getirir.

**IF** Molly'lerin site alındığı roundlarda hep boşa gidiyorsa
**MEANING** Ya baskı altında atmayı unutuyorsun ya da molly'leri düşmanın geçmediği yere koyuyorsun.
**COUNTER** Molly'leri default plant noktasına ve botunun üstüne önceden yerleştir. Bot tetiklendiği an molly'yi patlat — bekleme.
**WHY** Atılmayan molly sıfır değer üretir. Önceden yerleştirirsen baskı altında unutmak sorun olmaz.

**IF** Ult'unu koyuyorsun ama düşmanlar aktive olmadan sürekli yok ediyorsa
**MEANING** Cihazı görünür ya da kolay ulaşılır yere koyuyorsun. Uzun hazırlanma süresi korunaklı yer ister.
**COUNTER** Ult'unu duvar arkasına ya da düşmanın fiziksel olarak içeri girmeden ulaşamayacağı kapalı alana koy. Cihazı takımınla birlikte koru. Mümkünse tek başına da patlatma — Astra ya da Omen gibi kapatan bir ajanın duvarı ya da smoke'uyla birlikte kur; düşman hem çıkışı hem cihazı aynı anda yönetemez.
**WHY** Açık ult anında yok edilir. Duvar arkası düşmanı ya tehlikeli girişe ya da alanı terk etmeye zorlar.

**IF** Her round 1-2 kişi öldürüyorsun ama site hâlâ düşüyorsa
**MEANING** Geciktirmek yerine öldürmek için oynuyorsun. Senin işin düşmanın zamanını ve yeteneğini tüketmek — düello kazanmak değil.
**COUNTER** Düşman site'a 2+ yetenek harcayarak girdiyse kurulumun işini yaptı. Öldürme sayına değil, düşmanın kaç yetenek harcadığına bak.
**WHY** Sentinel'in değeri gecikme ve kaynak tüketiminde. Kill peşine düşersen site'ı tutmak yerine dövüşe giriyorsun.

**IF** Yeteneğin sık sık menzil dışına çıktığın için devre dışı kalıyorsa
**MEANING** Çok agresif rotate ediyorsun ya da menzil yarıçapını bilmiyorsun.
**COUNTER** Her harita için menzil mesafeni öğren. Rotate etmeden önce yeteneğini topla ya da devre dışı kalacağını hesaba kat.
**WHY** Devre dışı yetenek sıfır değer üretir. Menzil sınırını aşan her rotate kurulumunu sıfırlar.

**IF** Botun tetikleniyor ama molly takip etmiyorsa
**MEANING** Molly'leri botundan çok uzağa koyuyorsun ya da tetiklenmeyi izlemiyorsun.
**COUNTER** Molly botunla aynı noktayı örtmeli. Bot çaldığında molly'yi hemen patlat — düşmanın savunmasızlığı kısa sürer, molly yakındaysa yetişir.
**WHY** Düşman savunmasızken molly hasarı artar. Ayrı koyarsan iki yetenek üst üste çalışmaz.

**IF** Düşman botunu vurup yok ettikten sonra hiç tepki vermeden ölüyorsun
**MEANING** Botu bir bilgi alarmı gibi değil, sadece bir hasar aleti gibi kullanıyorsun. Bot tetiklendiğinde sen başka yere bakıyorsun.
**COUNTER** Bot çaldığı an o açıya pozisyon al ve crosshair'i botun koruduğu girişe koy. Bot, düşmanın tam nereden geldiğini söyler — sen o sesi peek zamanlamasına çevir.
**WHY** Botun asıl değeri hasar değil, "düşman şu an şuradan geliyor" bilgisidir. O bilgiyi açıya dönmek için kullanmazsan bot sadece bir uyarı olur, avantaja dönüşmez.

**IF** Çok sayıda round'u 2'ye 1 ya da 3'e 1 kalmışken, site'ı tek başına anchor'larken kaybediyorsun
**MEANING** Geç-round'da fazla pasif bekliyorsun; sayı dezavantajında zaman değil, alan ve molly kullanman gerek.
**COUNTER** Sayı geriye düştüğünde molly'ni ve botunu spike'ı koruyan tek bir choke'a yığ, geri kalan alanı terk et. Tek girişi pahalı hale getir, geniş alan tutmaya çalışma.
**WHY** Az sayıyla geniş alan tutmak imkânsız — her ekstra açı, kapatamadığın bir flank. Yeteneği daraltıp tek hat savunmaya çevirirsen zamanı senin lehine kullanırsın.

**IF** Spike kuruluyor ama defuse'ları molly ve ult ile geciktiremeden kaybediyorsun
**MEANING** Post-plant kaynaklarını saklamamışsın — molly'ni retake savunmasında ya da yanlış zamanda harcamışsın.
**COUNTER** En az bir molly'ni daima defuse cezası için sakla. Düşman defuse'a başladığı an molly'yi defuse noktasına bırak; sıkışırlarsa ult ile alanı kilitle. Molly bitince half-defuse'ı zorla.
**WHY** Bir molly tam defuse süresini katlar; düşmanı defuse'u bölmeye zorlar. Molly'ni erken harcarsan post-plant'te en güçlü kozun kalmaz.

**IF** Flank'tan ya da arkadan sürekli vuruluyorsun, botun seni hiç uyarmıyor
**MEANING** Botunu sadece ana giriş açısına koyuyorsun, flank rotasını boş bırakıyorsun.
**COUNTER** Anchor'larken botu ana girişe değil, kimsenin izlemediği flank/rotate hattına koy. Ana açıyı zaten sen tutuyorsun — bot, göremediğin tarafı izlesin.
**WHY** Botun en yüksek değeri senin gözünün olmadığı yerde. Baktığın yere bot koymak çift kapama yapmaz; kör noktanı kapatmak seni flank'tan kurtarır.

## 6. Harita Etkileşimleri
- **Bind**: B site'ta baskınsın. B long ve hookah'taki dar girişler molly için biçilmiş kaftan. Ult'un B site girişlerini kapatır. Teleport girişleri yüzünden flank hızlı gelir — botunu ana açıya değil, teleport çıkışını ya da rotate hattını izleyecek şekilde koy ki sırtın güvende olsun.
- **Ascent**: B site'ta market'i izleyen taret ve lane'deki bot + molly güçlü. A site'ta A main'i kapsayan yeteneğin de işe yarar. Mid kontrolü kaybolursa flank açılır; botunu mid'den B'ye akan rotate hattını da görecek şekilde konumla.
- **Haven**: B site anchor bu haritanın en güçlü pozisyonu. Taretin B main ve garage'ı izler, botun + molly B girişini kapatır. Ult'un B site girişlerini bloke eder. Üç site'lı harita olduğu için tek başına anchor'larken botun rotate uyarısı kritik — yanlış site'ı tutmamak için bilgiye güven.
- **Lotus**: Döner kapılar yeteneğin için doğal huni oluşturur — B site verimli. Kapalı B site alanında ult'unu yok etmek zordur. Döner kapı sesi düşmanı ele verir; molly'ni kapının hemen ardına koy, geçen düşman hem sesle yakalanır hem hasarla karşılaşır.
- **Sunset**: B site'ta güçlü. Dar site geometrisi molly kapsamını en yükseğe çıkarır. Mid'i izleyen botun erken bilgi getirir. Mid'i kapatabilirsen iki site arası rotate kesilir — botu mid'e koyup mid push'u erken oku.
- **Icebox**: B site'ta güçlü. Botunu Orange girişine koy — ana giriş erken haber verir; taretini Kitchen'dan gelen retake/split'i görecek şekilde kur. Default plant noktasına molly zorunlu. Dikey alan bol — molly'ni plant noktasının üstüne koy ki defuse için açığa çıkmak zorunda kalsınlar.
- **Corrode**: Dar koridorlar ve sınırlı girişler yeteneğinin değerini ikiye katlar. Molly dar alanda kaçınılmaz hasar verir. Koridor kesişimlerindeki botun birden fazla açıya bilgi getirir.
- **Summit**: A site küçük — tuzağı A Main'e değil A Link'e baktır (A Main'dekini girmeden kırarlar), botu A Main girişine koy; ult'u retake'e sakla, küçük A'da menzili alanın çoğunu alır. B büyük — molly'leri B Main girişine ve B Tower civarına yay, ult'u tüm site yerine spike çevresine odakla. Mid-split B Link'ten gelir: geniş haritada rotate uyarısı kritik, B Link'i tuzağınla izlet.

## 7. Eşleşme Notları
- **Raze** ile karşılaştığında kurulumunu koru — botuyla senin botunu temizler, molly'leriyle botunu ve molly'ni güvenli mesafeden patlatır. Yeteneğini daha iç pozisyonlara al.
- **Sova** ile karşılaştığında kurulumunu iki ayrı açıya yay — tek recon hepsini silemesin.
- Rush kompozisyonlarına karşı güçlüsün — yeteneğini temizlemeye vakit bulamadan girerler.
- Astra ya da Viper gibi yavaş site oturan takımları sert vurursun — alanı terk etmeden geçiş yapamazlar; ult'unu tam bu anda atarsan hepsini alandan söker, sıkışıp kalırlar.
- Recon yeteneği olan ajanlara (drone/dart/recon atışı) karşı botunu duvar/köşe arkasına gizle — taranamayacağı yere koy, taranırsa hemen yer değiştir; aynı yere ikinci kez kurma.
- Flash'lı saldırgan ajanlara karşı kör kaldığında botunun ve molly'nin sesine güven — göremesen bile düşmanın nereden geldiğini ses söyler, körken o yöne molly bırak.

## 8. Oyuncuya Ne Söylenmeli

### Kurulum çalışırken
**Oyuncu ne yapıyor:** İki yeteneği üst üste koyuyor, botunu birkaç roundda bir off-angle'a taşıyor. İki yeteneğin üst üste patladığı yere giren düşman ağır hasarla site'a girer — sonraki silah dövüşünde tek atışlık hedef olur.
**Karşı hamle (kanıta göre):** Botun art arda ilk temas anında vuruluyorsa yerini ezberlemişler — recon'un ulaşamayacağı köşeye taşı; eski noktayı kontrol edip zaman harcarlar. Kurulumun tek alan-hasarıyla birden temizleniyorsa yay — tek yetenek ikisini birden silemesin. Rush yiyorsan bot tetiklendiği an molly'yi patlat, bekleme.

### Sorun bildirimi
**Yeteneğin kolayca temizleniyorsa:** "Her şeyi tek koridora yığmışsın. Kurulumunu birden fazla açıya yay. Botun bilgi için — hasar ikincil."
**Kurulum tahmin edilebilirse:** "Düşmanlar botunu önceden nişanlıyor, molly'lerinden kaçınıyor. Tüm düzeni değiştir. Farklı açı, farklı molly konumu."
**Flank'tan ölüyorsan:** "Botunu baktığın açıya koymuşsun, sırtın boşta. Botu kör noktana — flank hattına — al, gözün olmayan yeri o izlesin."
**Botun bilgi getiriyor ama tepki vermiyorsan:** "Bot çaldığında crosshair'ini o açıya çevir. Bot sana düşmanın nereden geldiğini söylüyor — sen onu peek zamanlamasına çevir."
**Post-plant'te molly kalmıyorsa:** "Molly'ni retake'te erken harcamışsın. En az bir molly'yi defuse cezası için sakla — bir molly tam defuse süresini katlar."

### İyi oynuyorken
**Ne yapıyorsun:** Bot ve molly aynı noktayı örtüyor, bot tetiklendiği an molly patlıyor; en az bir molly post-plant'e saklı, bot birkaç round'da bir farklı off-angle'a taşınıyor.
**Döngü:** Ana açıyı sen tut, bot kör noktanı izlesin; spike kurulunca molly'yi defuse cezası için beklet, ult'u retake kırılırken aç.
**Düşman adapte olunca:** Kurulumunu uzaktan utility ile temizlemeye başlarlarsa yeteneklerini iki ayrı açıya yay ve daha iç pozisyona çek — tek alan-hasarı ikisini birden silmesin.

### Zorlanırken
"Yeteneklerin bilgi getirmeden ölüyor. Botu off-angle'a, molly'yi botun üstüne koy, kurulumu tek koridora yığma. Sen açıyı tut — kim nereden geliyor, onu kurulum söylesin."

### Öngörülebilir olduğunda
"Düşman botunun yerini ezberledi, molly'nden dolanıyor. Düzeni komple değiştir: farklı açı, farklı molly noktası, bot recon'un ulaşamadığı köşeye. Aynı setup iki round üst üste aynı yerde durmasın."

## 9. Bu Ajana Karşı
- Taret seni gördüğü an hem hasar baskısı hem "buradan geliyor" bildirimi — taret hattına gövdenle girme: hattı utility ile kır ya da taretin görmediği açıdan vur, sonra ilerle.
- Setup'lı site'a hızlı giriş Killjoy'a çalışır: bot seni savunmasız bırakır, molly üstüne biner. Giriş sesi verdiysen yavaşla — yetenekleri mesafeden, adım adım temizle, sonra bas.
- Ult sesini duyduğunda tek kümede koşma — yayıl ve cihaza baskı yap: cihaz vurulup düşürülür; alandan topluca kaçmaya çalışan takım kilitte topluca yakalanır.
- Killjoy'u kurulumundan menzille ayır: bir site'a sahte baskı verip rotate ettirirsen uzakta kalan yetenekleri devre dışı kalır — setup'ı silahla değil haritayla kır.
