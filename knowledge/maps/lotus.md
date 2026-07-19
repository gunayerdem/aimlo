---
type: map
map: lotus
patch: "13.00"
verified: 2026-07-08
pool: "rotasyon-dışı — 13.00 rekabetçi havuzunda değil"
---

# LOTUS — Detaylı Strateji ve Analiz

> Lotus 3 siteli bir harita; döner kapı ve kırılabilir duvar ise başka hiçbir haritada yok. Bu iki mekanik ya seni öldürür ya da seni kurtarır, ortası yok.

## 1. Temel Prensipler
- Lotus 3 siteli (A, B, C) bir harita — Haven gibi geniş ama mekanik olarak çok daha zengin.
- İki döner kapı (biri A Main ile A Tree arası, diğeri C Mound ile B Main arası), kırılabilir duvar (A site, A Main ile A Link arası) ve Silent Drop (A site) bu haritayı diğerlerinden ayırır.
- Saldırı temeli: Lotus saldırı tarafına avantajlı, çünkü giriş noktası çok fazla. Tek bir siteye utility'siz push atma — kapıyı, duvarı, drop'u kullan, savunucuyu yanlış yere çek, sonra gir.
- Savunma temeli: 5 kişiyle 3 siteyi tutamazsın. Sentinel ve initiator bilgisi yoksa nereye rotate edeceğini bilemezsin. Agresif anchor yerine retake odaklı dur — saldırganın giriş seçeneği çok fazla.
- Tempo: Döner kapı ile anında site değiştir — bu sadece bu haritada var. Duvarı ne zaman kırdığın, drop'u ne zaman kullandığın round'un akışını belirler. Çok erken oynama, çok geç de oynama — haritanın araçlarını doğru anda kullan.

## 2. Ölüm Bölgeleri
- **A Main (Root Girişine Kadar)**: A Tree ve A Stairs'ten çapraz ateş gelir. Flash ya da smoke atmadan utility'siz girersen ölürsün. Önce util at, sonra gir.
- **A Main (Kırılabilir Duvar)**: A Main ile A Link arasındaki kırılabilir duvar sağlamken savunucu tek açıdan kontrol ediyor, tüm odağını sana verir. Duvarı kırmadan utility'siz girersen karşında tek başınasın — önce util at ya da execute anında duvarı kır, ikinci açıyı aç.
- **B Main Corridor**: B Upper'daki savunucu uzun koridoru tek açıdan tutuyor. Flash ya da smoke atmadan dalarsan ilk atış onun. Önce görüş hattını kes, sonra gir.
- **C Mound**: Mound'a çıktıktan sonra hareketsiz durma. C Main'den gelen saldırgan için sabit hedefsin. Yüksekliği kullan ama açıkta bekleme.
- **Mid Link**: Mid'i kimse sahiplenmezse herkes kendi sahasına bakar, o kesişim boş kalır ve flank yolu açılır. Takımdan biri mid'i kapatmalı.
- **Döner Kapı Geçişleri**: Kapıdan geçerken karşı tarafın peek attığını varsay. Kapıyı açıp direkt dalma — önce durumu oku, sonra geç.

## 3. Saldırı Kalıpları

**Pattern 1: A Main Utility'siz Push Ölümleri**
IF: A Main'e flash ya da smoke olmadan giriyorsun — Tree ve Stairs açılarına yürüyerek dalıyorsun.
MEANING: Tree'den ve Stairs'ten iki ayrı açı seni aynı anda görüyor. Savunucu açıyı tutarak bekliyor, sen yürüyerek giriyorsun — ilk atış zaten onun.
COUNTER: Girmeden önce Tree'yi smoke'la. Stairs yönüne flash at. Flash patlar patlamaz swing at — arada boşluk bırakma. Girdikten sonra Root'u al, yoksa flank yersin.
WHY: A Main dar, savunucu iki yükseklikten seni izliyor. Smoke görüş hattını keser. Flash savunucuyu açıdan söker. Root'u kontrol etmeden yapılan her A execute flank riski taşır.

**Pattern 2: A Duvar Timing Hataları**
IF: A Main ile A Link arasındaki kırılabilir duvarı round başlar başlamaz kırıyorsun — her seferinde, hemen.
MEANING: Savunucu iki şeyi öğreniyor: A'ya geliyorsun ve hangi taraftan geleceğini tahmin edebiliyor. Kendini ele veriyorsun.
COUNTER: Duvarı execute anında kır, round başında değil. Önce A Main'den baskı yap — duvar sağlamken savunucu tek açıya odaklanır. Execute anında kır, A Link'e ikinci girişi aç. Bazı round'larda hiç kırma — bu da bilgi manipülasyonu.
WHY: Duvar sağlam = savunucu tek açıya bakar. Duvar kırık = iki açıya bakmak zorunda. Bu kararı ne zaman verdiğin round'u belirler. Erken kırarsan bu avantajı savunucuya teslim edersin.

**Pattern 3: Döner Kapıyı Kullanmamak**
IF: Takım döner kapıları hiç kullanmıyor — C ile B arasında hep dış kenardan rotate ediyorsunuz.
MEANING: Haritanın en güçlü mekaniğini çöpe atıyorsun. Split seçeneğin yok, rotasyonun yavaş.
COUNTER:
- B Main'de baskı yarat, C Mound kapısından 2 kişiyi C'ye gönder — savunucu B'ye dönerken C boş kalır. (A tarafında ise A Main↔A Tree kapısıyla site içinde açı değiştir.)
- Eco'da: C Mound↔B Main kapısıyla hızlı rotate yap, savunucunun setup'ını boz.
WHY: C Mound ile B Main'i bağlayan kapı çapraz-site geçişini 2-3 adıma indirir. Dış kenardan aynı rotasyon kat kat uzun sürer. Bu fark round ortasında C ile B arasında site değiştirmeyi mümkün kılar.

**Pattern 4: Silent Drop Farkındalıksızlığı**
IF: Saldırıda Silent Drop kullanılmıyor — A execute her seferinde tek yönden geliyor.
MEANING: Tek boyutlu giriyorsun — savunucu tüm odağı A Main'e veriyor.
COUNTER: 1 kişiyi Drop'tan sessiz gönder, takım A Main'den execute etsin — crossfire kurarsın.
WHY: Silent Drop ses çıkarmadan site girişi sağlar. Diğer tüm girişlerde ayak sesi ya da ability sesi var — Drop bunları geçer.

**Pattern 5: Post-Plant'te Kapı Kullanmamak**
IF: Spike dikildi ama post-plant pozisyonlarını sadece site içinde alıyorsunuz.
MEANING: Kapıyı kullanmayan takımın nerede olduğunu savunucu retake sırasında tam olarak bilir.
COUNTER: Spike C'ye dikildiğinde 1 kişiyi C Mound kapısıyla B tarafına gönder — retake sırasında kapı arkasında bekler. Spike B'ye dikildiğinde aynısını C için yap (aynı kapı iki yönü de bağlar). Bu crossfire savunucunun retake'ini çok zorlaştırır.
WHY: Savunucu retake'te hem site içini hem kapı arkasını kontrol etmek zorunda kalır. Bu ek kontrol süresi defuse için zamanı azaltır. Kapı kullanan takım savunucuya iki problemi birden çıkarır.

### Sık Saldırı Hataları
- Döner kapıyı hiç kullanmamak — bu kapı Lotus'un en güçlü kozu. Kullanmazsan kendini zayıflatırsın.
- Kırılabilir duvarı her round aynı noktada kırmak — savunucu bir kez görünce seni okur, hazır bekler.
- 1-1-1-2 dağılımıyla oynamak — hiçbir site'ta sayı üstünlüğü kuramazsın, execute çöker.

## 4. Savunma Kalıpları

**Pattern 1: Over-Rotate (3 Site Tuzağı)**
IF: Savunmada 3 ya da daha fazla kişi tek site'a rotate ediyor, diğerleri boş kalıyor.
MEANING: 3 siteli haritada en büyük tuzak budur. Saldırgan A'da ses çıkarıp C'ye execute eder — 3 kişin A'ya gittiyse C'de kimse kalmaz. Fake'lere düşersin.
COUNTER:
- Ses duydun = 1 kişi rotate etsin, bilgi versin.
- Görsel temas ya da utility göründü = ikinci kişi gitsin.
- Spike görülmeden üçüncü kişiyi gönderme.
WHY: 3 siteli haritada her site'ta en fazla 2 kişi var. Biri gidince 1 kişi kalır. Bilgiye dayanmayan rotate saldırgana tam istediğini verir: boş site.

**Pattern 2: B Anchor Sessiz Ölüm**
IF: B anchor callout yapmadan, retake çağrısı vermeden yalnız ölüyor.
MEANING: B'de iki giriş (B Main ve C Mound kapısı) aynı anda baskı yapabildiği için push geldiğinde hızlı erirsin — ama bilgi vermeden ölürsen takım ne olduğunu anlayana kadar site çoktan gitmiş olur.
COUNTER: B anchor olarak ilk işin bilgi vermek, öldürmek değil. Push gelir gelmez callout yap: kaç kişi, hangi yönden, duvar kırıldı mı. Sonra delay util'ini kullan (molly, slow, tuzak) ve geride kal. Fırsat varsa öldür ama trade yemeyecek yerde dur — ölsen bile takım bilgiyi almış olsun.
WHY: B anchor tek başına tutar, iki girişi kontrol etmek zorundadır. Bu rolün işi zaman kazanmak ve bilgi vermek. Sessiz ölüm takıma sıfır bilgi verir — en kötü ölüm budur.

**Pattern 3: C Mound Açıkta Kalma**
IF: C Mound'da siper kullanmadan açıkta duruyorsun.
MEANING: C Main'den uzun görüş hattı var. Açıkta durursan Op ya da Vandal seni kolayca vurur. Mound'un gücü pozisyon almakta, açıkta durmakta değil.
COUNTER: Siper arkasında oyna. Kısa peek at — bilgiyi al ya da öldür, hemen geri çekil. Mound kenarındaki kutu ve duvarları kullan. Saldırgan C Main'e smoke atarsa Mound'dan çekil, site içinden oyna.
WHY: Yükseklik avantajı sadece siperle çalışır. Açıkta duran yüksek pozisyon dezavantajdır — tüm vücut görünür, kaçış yolu sınırlı. Siper arkasından peek atarsan, sen onu görene kadar o seni göremez.

**Pattern 4: Mid Kontrolünü İhmal Etmek**
IF: Takım mid'e ne util ne oyuncu gönderiyor.
MEANING: Mid A'ya, B'ye ve C'ye bağlanır. Boş bırakırsan saldırgan mid üzerinden her yöne split yapar, sen rotasyon için mid'i kullanamazsın.
COUNTER: En az 1 kişi mid'e baksın ya da sentinel util ile kapatsın. Mid Link'e tel ya da tuzak koymak bile yeterli.
WHY: Mid 3 site'a birden bağlandığı için etkisi katlanır. Mid'i bırakırsan 3 siteli haritayı 3 ayrı koridor gibi oynarsın — bağlantıları kaybedersin.

**Pattern 5: Drop ve Kapı Kontrolsüzlüğü**
IF: Silent Drop kontrol edilmiyor, döner kapı sesine tepki verilmiyor.
MEANING: Drop'u kontrol etmemek sessiz bir flank'çıyı içeri davet eder; kapı sesini görmezden gelmek karşı tarafa bedava site verir.
COUNTER: Drop altına tel, tuzak ya da bot koy — yoksa Drop'u sürekli peek etmek zorunda kalırsın ve A Main'e karşı açık kalırsın. Kapı sesini duyunca karşı taraftan peek at ya da takıma doğrulat — o ses doğrudan rotasyon sinyali.
WHY: Drop'tan giren, savunucunun arkasına düşer; oradan kurtulmak neredeyse imkânsız. Kapı sesine tepkisiz kalan savunma bedava site kaybeder.

### Sık Savunma Hataları
- Fake baskıya 3 kişi gönderme — 3 siteli haritada over-rotate = bedava site kaybı.
- B anchor bilgi vermeden ölürse takım ne olduğunu anlayana kadar site gider. Ölmeden önce sesle ya da yazıyla söyle.

### Site Bazlı Retake Rotaları
- **A Retake**: A Stairs ve Tree'den iki kolla aynı anda gir. Saldırgan A Main + Root crossfire'ına yaslanır — A Main açısını smoke'la, Root köşesine flash at. Duvar kırıksa A Link açısı da saldırganın elinde: oraya da bir flash ayır. Silent Drop'u boş bırakma — post-plant'te oradan spike'a sarkan olur, bir kişi o hattı tutsun.
- **B Retake**: Ana giriş B Upper'dan — yüksekten site zeminini görürsün. Saldırgan B Main + kapı tarafı crossfire'ı kurar: B Main açısını smoke'la, C Mound kapısının arkasında bekleyen saldırgana flash ya da molly at, sonra site'a in. Spike üstüne molly bırakılmışsa defuse'u molly sönünce başlat, üstünde erime.
- **C Retake**: Ana kol C Hall'dan, sessiz kol Waterfall'dan girer. Mound saldırgandaysa yükseklik onun — Mound'a smoke at, o açı kapanmadan site zeminine yayılma. İki kol aynı anda girince C Main'deki saldırgan iki yöne birden bakamaz.
- Kapı sesi retake'te silahtır: kapıyı açıp geçmek yerine sesi verip karşı koldan gir — post-plant oyuncusu kapıya dönerken asıl kol siteye iner.

## 5. Koçluk Satırları
- "Lotus'ta round kapı, duvar, drop'la başlar. Bunları kullanmıyorsan haritanın yarısında yoksun."
- "Kırılabilir duvarı her round kırmak strateji değil, refleks. Strateji şu: onu ne zaman kırıp ne zaman kırmayacağını seçmek."
- "Döner kapı dönerken herkesin duyacağı bir ses çıkarır — bu seni de satar, düşmanı da. O sesi fake olarak kullan. Kapıyı açıp geçme, sesle kafayı karıştır. Çapraz-site rotate için C Mound↔B Main kapısını kullan; A tarafındaki kapı (A Main↔A Tree) site içi açı içindir."
- "3 siteli haritada fazla rotate etmek en çok round öldüren şeydir. Ses duydun diye 3 kişi gönderme — önce bilgiyi al, sonra rotate et."
- "Silent Drop'u saldırıda kullanmıyorsan A execute'un tek yönlü kalır. Savunmada kontrol etmiyorsan arkandan girerler."
- "B anchor'ın işi öldürmek değil, yaşamak ve bilgi vermek. Sessiz ölürsen takıma sıfır katkın olur."
- "Spike dikildikten sonra aynı pozisyonda bekleme. Kapıyı kullan, pozisyon değiştir — yoksa savunucuya bedava retake verirsin."
- "Lotus'u koridor haritası gibi oynama. Mid, kapı, duvar, drop — hepsi bağlantı noktası. Bu bağlantıları kim kontrol ederse haritayı o kontrol eder."

## 6. Ekonomi Stratejileri
- Lotus saldırı avantajlı bir harita. Saldırı tarafında force buy yap — diğer haritalara göre daha çok işe yarar.
- Force buy'da C rush at. C Main'den Mound'u al, site'a gir. Spectre ya da Marshal yeter — giriş geniş, mesafe kısa.
- Eco round'da döner kapıyı kullan. Sheriff ya da Spectre ile kapıdan rotate yap. Savunucu bunu okuyamazsa kill gelir.
- Kırılabilir duvar ancak hasarla düşer: silahla kırarsan mermi ve ses harcarsın, Raze sıçrama paketiyle ya da Breach molly'siyle kırarsa bir ability yuvası gider. Tam buy planlarken bunu hesaba kat.
- Tam buy round'unda ability eksik bırakma. Lotus'ta execute ability olmadan yapılmaz — 3 site var, her giriş noktası savunuluyor.
- Savunma tarafında gereksiz peek atma. Silahını kaybedersen sonraki round 3 siteyi util'siz savunursun.

## 7. Ajan Bazlı İpuçları
- **Raze**: Sıçrama paketinle ya da execute anındaki silah ateşiyle A Main↔A Link kırılabilir duvarını kır — timing senin elinde olur, ikinci açı açılır. B Main ve C Main'e sıçrama paketiyle gir, bu iki noktada çok işe yarar. Molly'n dar koridorlarda alanı tutmana yardımcı olur. Ult'unu B site ve C site'ta kullan, kompakt alan olduğu için her şeyi vurur. Bot'unu dar koridorlara, döner kapı arkasına ve Silent Drop'a süre — bilgi gelir, mermi harcamazsın.
- **Breach**: Stun'ı B Main'de at, birden fazla düşmanı yakalar. Flash combo'yu A Main girişinde uygula — önce flash at, sonra takım arkadaşın swing atsın. Molly ile A Main↔A Link kırılabilir duvarının arkasında bekleyen savunucuyu sök; spike kurulduktan sonra aynı molly'yi defuse deny için kullan. Ult'unu B site gibi dar alanlarda kullan, tüm takımı etkiler.
- **Killjoy**: B anchor için en iyi seçim. Tuzağını B Main'i izleyecek şekilde koy, botunu C Mound kapısı tarafına yerleştir — B'nin iki girişini birden duyarsın. A'yı anchor'larken botunu A Main↔A Link kırılabilir duvarına baktır, molly'ni duvar kırılma anında ya da spike kurulduktan sonra defuse deny için bırak. Ult'unla site'a gelecek execute'u durdurabilirsin. A site'ta ayrıca tuzağını Silent Drop'a baktır.
- **Fade**: Recon'unla 3 site'tan bilgi al — Lotus'ta bu bilgi her şeyden değerli. Bot'unu döner kapı arkasına ve dar koridorlara sok. Ult'unu A Main ya da B Main'de at, tüm saldırı grubunu yakalar. Ult'unu spike kurulduktan sonra defuse deny için de kullanabilirsin.
- **Omen**: Kaçışınla kapı sesini hiç vermeden rotate et — savunucu kapı sesini beklerken sen çoktan başka açıdan çıkarsın. C Waterfall'a TP at, off-angle al. Smoke'unla 3 site arasına perde çek. Flash'ını A Main ve B Main gibi dar girişlerde kullan, tüm koridoru körleştirir. Ult'unla haritanın herhangi bir yerine geç, savunucunun düzenini boz.
- **Viper**: Duvarınla A-C arasını ya da B-Mid arasını böl — tek ability ile 2 site'ı etkilersin. Smoke'unla üçüncü site'ı kontrol al. Molly lineup'larını 3 site'ın hepsinde öğren, spike kurulduktan sonra defuse deny için şart. Ult'unu B site gibi kompakt alanlarda kullan, alanın tamamını kapatır.
- **Skye**: Flash'ını kapı arkası için kullan — kapının diğer tarafına flash at, takım arkadaşın geçsin. Recon'unu dar koridorlara ve kapı geçişlerine sür; onunla kapı arkasını, Silent Drop'u ve mid'i kontrol et. Ult'un 3 siteli haritada tüm düşman pozisyonlarını açığa çıkarır, boşa harcama.
- **Harbor**: Lotus'ta en güçlü controller — bu haritada S-tier. Duvarınla A Main'den C Main'e kadar görüş hattı kır — tek util ile 3 site arası geçişi smoke'larsın. Kalkan kubbeni spike'ın üstüne at, kubbe içinde defuse yapmak neredeyse imkânsız. Giriş smoke'unu A Main push'unda kullan. Ult'unu geniş site'larda birden fazla düşmanın üstüne bas.

## 8. Post-Plant Stratejileri
- **A Site Post-Plant**: Spike'ı A Default'a, kutuların arkasına dik. Sonra A Main ve A Root'ta crossfire kur — savunucu A Stairs ya da Tree'den gelecek, iki taraftan ateş altında kalacak. Kırılabilir duvarı execute'ta kırdıysan A Link açısı sana ekstra bir crossfire kolu verir, savunucu oraya da bakmak zorunda kalır. Tree'yi smoke'la, yoksa savunucu yüksekten seni görür. Silent Drop'u unutma — biri oradan düşüp spike'a ulaşabilir, birini oraya baktır.
- **B Site Post-Plant**: Spike'ı B Default'a dik. B Main ve C Mound kapısı tarafında crossfire kur — savunucu B Upper'dan ya da kapıdan gelecek, iki girişe birden bakmak zorunda kalır. Viper'ın ya da Brimstone'un molly'sini spike üstüne bırak, defuse yaptırma.
- **C Site Post-Plant**: Spike'ı C Default'a, Waterfall tarafına dik. C Main ve C Mound'da crossfire kur — Mound'un yüksekliğini post-plant'te kullan. Waterfall'ı izle, savunucu oradan sokulacak. C Hall'dan gelen rotate'u da bir gözle takip et.
- **Kapı Kullanımı Post-Plant'te**: C'ye spike diktiysen C Mound↔B Main kapısından 1 kişiyi B tarafına gönder. Savunucu C'ye retake yaparken kapı arkasında biri beklesin — hem site içini hem kapı arkasını kontrol etmek zorunda kalacaklar, retake planları çöküyor. B'ye diktiysen aynısını tersine yap, aynı kapıyla 1 kişiyi C tarafına at. (A tarafındaki kapı A Main↔A Tree site içi olduğundan A post-plant'inde A Link/Root crossfire'ına yaslan.)
- **3 Site Retake Farkı**: Lotus'ta 3 site var, savunucu retake için toplanmak zorunda. Spike dikildikten sonra bu sana çalışır. Lineup'lar ve delay util bu yüzden bu haritada çok daha değerli — savunucu geç kalır, spike tıklar.

## 9. Anti-Strat İpuçları
- Rakip her round A duvarını (A Main↔A Link) kırıyorsa: duvar arkasında bekleme. Duvar kırılma anında peek at, trade al. Molly'ni kırılma noktasına göm — geçerken yer.
- Rakip döner kapıyla sürekli rotate ediyorsa: kapının iki tarafına da tel ya da tuzak bırak. Kapı açılır açılmaz bilgi gelir, karşı taraftan peek at — kapıdan geçen oyuncu o an savunmasız.
- Rakip A Silent Drop'u kullanıyorsa: Drop'un altına tel, tuzak ya da bot koy. Util yoksa Drop'u sürekli peek etmek zorunda kalırsın, bu seni A Main'e karşı açık bırakır. Drop kapalıysa dikkatini A Main'e ver.
- Rakip C Mound'da agresif oynuyorsa: C Main'den Mound'a erken smoke at, flash'la contest et. Agresif Mound oyuncusu smoke içinden push etmek zorunda kalır — bu senin lehine. Ya da Mound'u hiç umursama, siteye farklı açıdan gir.
- Rakip 3 site'a yayılarak default oynuyorsa: mid kontrolü al, split execute yap. Mid'i tutarsan haritayı ikiye bölersin — her site'ta 1-2 kişi kalan rakip split'e karşı duramaz, rotate süresi çok uzun.
- Rakip kapı sesini fake olarak kullanıyorsa: kapı açılır açılmaz rotate etme. Takım arkadaşın karşı tarafta görsel temas kurana kadar bekle, bilgiyi doğrula. Bu bir pattern — fark ettiğin anda avantaj sende.
- Rakip post-plant'te kapıyı kullanıyorsa: retake'te kapının iki tarafını da kontrol et. Kapı arkasındaki oyuncuyu söküp atmak için flash ya da molly at. Util atmadan retake yapma — kapı arkasındaki seni yandan vurur.
- Rakip B'de Killjoy/Cypher setup'ı oynuyorsa: execute öncesi Raze botu ya da Fade botuyla util'i tetikle. Killjoy'un tuzağını ve botunu uyandırmadan push atarsan delay yersin — delay yersen rotate gelir, sayı üstünlüğünü kaybedersin.
