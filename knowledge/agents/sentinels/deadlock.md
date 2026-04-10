# AJAN: Deadlock

## 1. Rol Kimliği
Deadlock, choke noktası hakimiyetinin sentinel'idir. Diğer sentinel'ler utility'lerini site geneline yayarken, Deadlock gücünü tek bir geçiş yolunu geçilmesi tamamen sefil hale getirmeye yoğunlaştırır. Barrier Mesh girişleri tamamen duvarla kaplar, GravNet yakalananları yere yapıştırır ve yavaşlatır, Sonic Sensor ses tabanlı hareketi cezalandırır ve Annihilation kurtulamayan düşmanları garantili ölüme çeker. Rush karşıtı uzmandır — site almak için hız ve momentuma güvenen takımlar onun avıdır. Zayıf noktası uyum yeteneğidir: utility'si kullanıldıktan sonra değişimlere tepki verme kapasitesi azdır.

## 2. Temel Sorumluluklar
- **Choke noktası engelleme**: Barrier Mesh en yüksek öncelikli giriş yolunu kapatmalıdır. Sage duvarından farklı olarak sadece ateş ederek kırılmaz — düşmanlar orbları yok etmeli, bu da zaman ve odak harcar.
- **GravNet execute bozucu olarak**: GravNet düşmanları ya push sırasında eğilerek geçmeye (momentum kaybı) ya da ağı yok etmeye (pozisyon ve zamanlama açığa çıkar) zorlar. Tespit edilen rush'lara reaktif olarak yerleştirilmelidir.
- **Sonic Sensor erken uyarı olarak**: Sensor sese tepki verir — ayak sesleri, yetenekler, silah sesi. Bilgi ve kısa concuss verir. Düşmanların sessizce yaklaşamayacağı yollara yerleştirilmelidir.
- **Annihilation round kapatıcı olarak**: Ultimate'i yakalanan düşmanı belirli bir yol boyunca kozaya çeker. İzole düşmanlarda veya post-plant sırasında defuse yapanı spike'tan uzaklaştırmak için en iyi şekilde kullanılır.
- **Katmanlı engelleme**: Deadlock'un gücü utility'yi birleştirmektedir. Arkasında Sonic Sensor olan bir choke noktasına GravNet, hem yavaş hem hızlı yaklaşımları cezalandıran iki katmanlı savunma oluşturur.

## 3. Sık Yapılan Hatalar
- Barrier Mesh'i çok erken yerleştirmek, düşmanların hiçbir şey harcamadan diğer site'a rotate etmesine izin vermek.
- GravNet'i el bombası gibi kullanmak — düşmanların yürümek zorunda olduğu belirli yollar yerine açık alana fırlatmak.
- Sonic Sensor'u ortam gürültüsünün (takım arkadaşı utility'si, silah sesi) sürekli tetiklediği yerlere yerleştirmek, gürültü yorgunluğu yaratmak.
- Annihilation'ı takım arkadaşlarının kozayı kolayca vurarak yakalanan oyuncuyu serbest bırakabileceği açık alanda kullanmak.
- Tüm utility'yi tek choke noktasına harcamak ve takım rotate ettiğinde veya düşman farklı açıdan geldiğinde elinde hiçbir şey kalmamak.
- Barrier Mesh orb yok etme mekaniğini anlamamak — orbları vurmayı bilen düşmanlar mesh'i hızla söker.

## 4. Kalıptan Anlama

**IF** Barrier Mesh sürekli yerleştiriliyor ama düşmanlar farklı bir yoldan site'ı alıyorsa
**MEANING** Mesh alternatif girişi kapatıyor ama birincil yol savunmasız. Deadlock düşmanın tercih ettiği saldırı rotasını okumuyor.
**COUNTER** Düşmanın ilk birkaç round'da en çok hangi girişi kullandığını incele, sonra Mesh'i oraya yerleştir. Mesh yerleşimini round'dan round'a adapte et.
**WHY** Yanlış girişi kapatan Mesh sıfır değer üretir; düşmanın tercih ettiği yolu okumak Mesh'in tek kullanımlık gücünü maksimize eder.

**IF** GravNet atılıyor ama birden fazla round boyunca sıfır düşman yakalıyorsa
**MEANING** GravNet zamanlaması bozuk — ya çok erken atılıyor (düşmanlar henüz orada değil) ya da yanlış yola nişanlanıyor.
**COUNTER** GravNet'i reaktif olarak tut. Push'u duyduğunda veya gördüğünde at, round öncesi kurulum olarak değil.
**WHY** Proaktif GravNet düşman henüz gelmeden süresi dolar; reaktif kullanım taahhüt edilmiş push'u yakalama garantisi verir.

**IF** Sonic Sensor tetikleniyor ama aslında hiçbir düşman push yapmıyorsa
**MEANING** Sensor, ortam oyun sesleri veya takım arkadaşı aktivitesinin tetiklediği yere yerleştirilmiş. Bu sahte alarmlar yaratır.
**COUNTER** Sensor'ları yalnızca düşman ayak seslerinin tetikleyeceği yollara yerleştir — derin flank'lar veya boş koridorlar bu iş için ideal.
**WHY** Sahte alarmlar bilgi güvenilirliğini yok eder; takım gerçek tetiklenmeleri de yok saymaya başlar.

**IF** Annihilation kullanılıyor ama yakalanan düşman her seferinde takım arkadaşları tarafından kurtarılıyorsa
**MEANING** Ultimate, koza yolunun birden fazla düşman açısına maruz kaldığı pozisyonlarda kullanılıyor.
**COUNTER** Annihilation'ı dar koridorlarda veya köşelerde kullan, koza yolunun düşman ateşinden korunduğu yerlerde. İzole defuse yapan üzerinde post-plant kullanımı idealdir.
**WHY** Açık alandaki koza kolay hedefdir; dar alan düşmanın kurtarma ateşi için açı bulmasını engeller.

**IF** Deadlock erken ölüyor ve utility'si kullanılmamış kalıyorsa
**MEANING** Sentinel için çok agresif konumlanıyor. Kit'i reaktif olarak deploy etmek için hayatta kalmasını gerektirir.
**COUNTER** Daha geride oyna. Deadlock'un utility'si proaktif değil, düşman aksiyonuna tepki olarak deploy edildiğinde en güçlüdür.
**WHY** Ölü Deadlock sıfır utility sağlar; hayatta kaldığında reaktif deploy ile push'ları parçalayabilir.

## 5. Harita Etkileşimleri
- **Lotus**: Güçlü. Döner kapılar ve dar koridorlar Barrier Mesh ve GravNet katmanlaması için mükemmel. B main veya A root'ta Annihilation yıkıcıdır.
- **Bind**: B site'ta mükemmel. Hookah, Barrier Mesh için doğal choke noktasıdır ve B long'da GravNet herhangi bir rush'ı parçalar.
- **Fracture**: Birçok dar saldırı yolu nedeniyle uygulanabilir. Yer altı tünellerindeki Sonic Sensor'lar erken uyarı sağlar.
- **Haven**: Üç site nedeniyle zorlayıcı. En iyi C site'a odaklanılarak oynanır, garage doğal choke noktasıdır.
- **Ascent**: B main güçlü Barrier Mesh pozisyonudur. Market'teki Sonic Sensor flank istihbaratı sağlar.

## 6. Eşleşme Notları
- Patlayıcıları Barrier Mesh orblarını ve Sonic Sensor'ları menzilden yok eden **Raze**'e karşı zayıf.
- Choke noktalarından rush'a güvenen **Neon** ve diğer hız tabanlı ajanlara karşı güçlü — tüm kit'i bunu cezalandırmak için tasarlanmış.
- **Sova** Sonic Sensor'ları temizleyebilir ve Barrier Mesh pozisyonlarını güvenli mesafeden keşfedebilir.
- Annihilation **izole oyunculara** karşı kullanıldığında en zor counter'lanır — kozayı vurabilen gruplu takımlara karşı en zayıfıdır.

## 7. Oyuncuya Ne Söylenmeli

### İyi performans gösterirken
**Oyuncu Eylemi:** Barrier Mesh'i düşmanın tercih ettiği giriş yoluna (round 1-3'ten okunan) yerleştiriyorsun, mesh'in arkasına Sonic Sensor katmanlıyorsun ve GravNet'i taahhüt edilmiş push'lar için reaktif tutuyorsun.
**Düşman Algısı:** Saldırganlar birincil rotalarını kapatan Barrier Mesh'i görür ve orbları hızla temizleyebileceklerine inanır. Mesh'in arkasındaki Sonic Sensor'u beklemezler — zamanlamalarını orb yok etmeye göre planlarlar, adım attıkları anda ateşlenen concuss'a göre değil.
**Düşman Tepkisi:** Ya mesh orblarını yok etmek (round zamanı kaybı, ateş sesiyle pozisyon açığa çıkması ve girişte Sonic Sensor concuss tetiklenmesi) ya da alternatif yola yönelmek (takımının crossfire hazırladığı yer) zorunda kalırlar. Taahhüt edilmiş push'ta GravNet koşan saldırganları yere yapıştırır ve gruplarını izole hedeflere parçalar.
**Faydalanma Penceresi:** Saldırganların Barrier Mesh'i temizlerken harcadığı zaman takımına tam rotation süresi verir. Sonic Sensor concuss'u temizlenmiş mesh'ten adım attıkları anda vurur — en kötü anda concuss olurlar (girişte, siper olmadan). Rush yapanlara GravNet koordineli 5 kişilik push'u 5 bireysel dövüşe dönüştürür.
**Tekrar Stratejisi:** Round 1-3: düşmanın favori girişini tespit et. Round 4: o yola Barrier Mesh, arkasına Sonic Sensor. Round 5-6: adapte olurlarsa mesh'i alternatif yola kaydır. GravNet'i elde tut — yalnızca onaylanmış push sesi üzerine at. Annihilation dar koridorlarda veya takım arkadaşlarının kozayı serbest vuramayacağı izole defuse yapanlar üzerinde.
**Düşman Adaptasyonu:** 4-5 round sonra saldırganlar mesh + sensor'u aynı anda temizlemek için AoE utility kullanacak, mesh yolundan kaçınmak için saldırılarını bölecek veya mesh'ini anlamsız kılmak için tamamen diğer site'ı execute edecek.
**Karşı Adaptasyon:** AoE ile temizlediklerinde: mesh ve sensor'u birbirinden ayır, tek yetenek ikisini birden yok edemesin. Böldüklerinde: bölünen gruba GravNet kullan (2-3 oyuncuyu yere yapıştırmak takımına bir tarafta sayı avantajı verir). Site'ından kaçındıklarında: mesh'i sonraki round diğer site'a döndür veya retake oyna ve post-plant girişimini durdurmak için GravNet + Annihilation kullan.

**Zorlanan**: "Barrier Mesh'in doğru girişi kapatmıyor veya GravNet zamanlaması bozuk. Düşmanın hangi yolu tercih ettiğini izle ve mesh'ini oraya yerleştir. Push'u duyana kadar GravNet'i tut."

**Tahmin edilebilir**: "Düşman mesh pozisyonlarını öğrendi ve etrafından dolanıyor. Her round hangi choke noktasını kilitlediğini değiştir. Mesh'in kapatmadığı yolu kapsamak için GravNet kullan."

## 8. Rütbe Modülasyonu

**Düşük (Iron-Silver)**: Oyuncular Barrier Mesh'i rastgele yerleştirir ve Sonic Sensor'ların var olduğunu unutur. GravNet flashbang gibi atılır. Temelleri öğret: mesh ana choke noktasına, sensor flank'a, GravNet rush'a.

**Orta (Gold-Platinum)**: Utility yerleşimi işlevsel ama statik. Annihilation düşmanların kurtulduğu açık alanlarda kullanılıyor. Reaktif GravNet zamanlaması ve korumalı Annihilation yollarına odaklan.

**Yüksek (Diamond-Ascendant)**: Buradaki Deadlock main'ler katmanlamayı anlıyor ama tek site'a çok bağlı olabilir. Hangi round'da hangi girişe mesh yerleştirileceğine karar vermek için düşman kalıplarını okumaya odaklan.

**Elit (Immortal-Radiant)**: Deadlock'un değeri belirli bir saldırı stratejisini bir round için tamamen kapatma yeteneğindedir. Bu seviyede mesh ve GravNet okumalara göre her round adapte olmalıdır. Annihilation garantili post-plant engelleme için saklanmalıdır.
