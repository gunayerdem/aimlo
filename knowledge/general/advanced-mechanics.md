# İleri Mekanikler -- Radiant Seviye Bilgi Bankası

---

## Counter-Strafe Zamanlama

Counter-strafe sıfır hıza anında yavaşlamak için ters hareket tuşuna basmaktır, tuşu bırakmaktan çok daha hızlı ilk-atış hassasiyeti sağlar.

### Silah-Spesifik Yavaşlama Kademeleri

Silahlar counter-strafe ile hassasiyete ulaşma hızına göre kademelere ayrılır:

| Kademe | Silahlar | Counter-Strafe Hızı | Bırak-Dur Üzerine Avantaj |
|---|---|---|---|
| En Hızlı | Shorty, Stinger, Classic, Frenzy, Spectre | Neredeyse anında hassasiyete ulaşır | En büyük kazanç -- durma süresini neredeyse yarılatıyor |
| Hızlı | Phantom, Bulldog, Ghost, Marshal, Guardian, Vandal, Sheriff | Çok hızlı hassasiyete ulaşır | Bırak-dur üzerine belirgin kazanç |
| Orta | Operator, Ares, Odin | Belirgin şekilde yavaş hassasiyete ulaşır | Hala büyük kazanç, ama pencere daha geniş |

Silah ne kadar ağırsa, her iki yöntemde hassasiyete ulaşması o kadar uzun sürer -- ama counter-strafe her zaman bırak-dur'a kıyasla o süreyi yarıdan fazla keser.

### Counter-Strafe Teknik Detayları

- **Basma süresi**: Counter-strafe tuş basışı son derece kısa olmalı -- bir ila iki frame. Çok uzun tutmak yönünü tersine çevirir.
- **Deadzone eşiği**: Valorant'ta hareket hatası eşiği var. Hız maksimum koşma hızının kabaca %30'unun altına düştüğünde hassas olursun. Counter-strafe seni oraya tuşu bırakmaktan çok daha hızlı getirir.
- **Çift-tap counter-strafe**: A-D-A (veya D-A-D) basmak hassasiyet eşiğine yakın kalırken takibi zorlaştıran mikro-jiggle oluşturur. Radiant+'da yaygın açıları kuru peek için kullanılır.
- **Çapraz counter-strafe**: Çapraz hareket ederken (W+A veya W+D), HER İKİ tuşu da aynı anda counter-strafe yapmalısın. Bir tuşu kaçırmak hassasiyet eşiğinin üzerinde kalan hız bırakır.

---

## Jiggle Peek Genişlik Optimizasyonu

Jiggle peek karakter modelinin minimum miktarını açığa çıkararak bilgi toplamak veya atışları bait etmek için kullanılır. Amaç başını değil sadece omzunu açığa çıkarmak ve görüş bilgisi almak.

### Amaca Göre Açığa Çıkarma Genişliği

| Amaç | Açığa Çıkarma Genişliği | Risk Seviyesi |
|---|---|---|
| Bilgi toplama (açının tutulup tutulmadığını görmeye) | Zar zor görünür -- sadece omuz kenarı | Düşük |
| Operator atışı bait etme | Omuzdan biraz fazla -- tepki tetikleyecek kadar | Orta |
| Geniş swing takibi | Gövdenin çoğu açıkta | Yüksek |
| Omuz peek (saf bait) | Mutlak minimum -- modelin sadece dış kenarı | Minimal |

### Jiggle Peek Yaklaşımı

IF uzun açıda (30m+) jiggle peek yapıyorsan
MEANING modelin düşman ekranında hareket girişi başına çok az hareket ediyor -- perspektiflerinden açısal hız düşük
COUNTER daha sıkı jiggle kullan -- strafe tuşuna zar zor bas
WHY uzun mesafede küçük bir strafe bile aşırı açığa çıkmadan bilgi toplamak için yeterli

IF kısa açıda (15m altı) jiggle peek yapıyorsan
MEANING modelin her harekette düşman ekranının büyük bir kısmını kaplıyor -- perspektiflerinden açısal hız yüksek
COUNTER telafi etmek için daha geniş jiggle kullan -- strafe tuşunu biraz daha uzun tut
WHY yakın mesafede sıkı jiggle düşman ekranında zar zor kaydediyor, ama geniş jiggle tepki zorluyor

IF orta mesafede (15-30m) jiggle peek yapıyorsan
MEANING standart çatışma mesafesi, dengeli açısal hız
COUNTER standart genişlikte jiggle kullan -- orta strafe tap
WHY bu temel çizgi; bağlama göre yukarı veya aşağı ayarla

### Jiggle Sıralama

- **Tek jiggle**: Bir hızlı giriş-çıkış. Ortalama oyuncudan atış bait etmek için yeterli.
- **Çift jiggle**: Arka arkaya iki hızlı jiggle. Operator oyuncusunu erken ateş etmeye veya beklemeye zorlayarak zamanlama bilgisi verir.
- **Jiggle'dan geniş swing'e**: Bir jiggle, kısa duraklama, sonra geniş swing. Duraklama rakibin zamanlama beklentisini bozar.

---

## Geniş Swing vs Yakın Peek Karar Ağacı

```
Düşman Operator tutuyor mu?
+-- EVET -> Geniş swing (hız avantajı, takibi zor)
|   +-- Flash'ın var mı? -> Flash + geniş swing
|   +-- Flash yok mu? -> Önce jiggle bait, sonra kaçırdıktan sonra geniş swing
+-- HAYIR -> Mesafeyi değerlendir
    +-- Uzun mesafe -> Yakın peek (açığa çıkarmayı minimize et, tüfek düellosu al)
    +-- Orta mesafe -> İkisi de, silahına bağlı
    |   +-- Vandal/Phantom -> Yakın peek tercih
    |   +-- Pompalı/SMG -> Mesafeyi kapatmak için geniş swing
    +-- Yakın mesafe -> Geniş swing (hızla bunalt)

Düşman off-angle mı tutuyor?
+-- EVET -> Yakın peek onları kaçırır; off-angle'ları yakalamak için geniş swing
+-- HAYIR -> Açığa çıkarmayı minimize etmek için yakın peek

Takım arkadaşıyla mı peek yapıyorsun (çift peek)?
+-- EVET -> Biri yakın peek, biri geniş swing. Farklı zamanlamalar.
+-- HAYIR -> Swing'i destekleyecek utility'n yoksa yakın peek varsayılan.
```

### Geniş Swing Hız Bağlamı

- Bıçak koşması oyundaki en hızlı hareket.
- Tüfek koşması bıçak koşmasından kabaca %20 yavaş.
- Operator koşması ana silah kategorilerinin en yavaşı -- bıçak hızının kabaca %73'ü.
- Hız farkı tüfekle geniş swing'in bıçakla olandan belirgin şekilde yavaş olduğu anlamına geliyor. Bilgi toplamak için bıçakla swing yapmayı, sonra silahla yeniden peek yapmayı düşün.

---

## Crouch Zamanlama

### Crouch Ne Zaman Yardımcı Olur

IF mid-spray'desin ve ilk 4-5 mermiden sonrasın
MEANING spray pattern'i merkezden uzaklaşıyor ve dağılıyor
COUNTER spray'i sıkılaştırmak için mermi 4-5'te crouch yap -- asla mermi 1'de
WHY crouch ateş konusunu sıkıştırarak commit edilmiş spray sırasında takip mermilerinin isabet etme olasılığını artırır

IF düşman çatışmanın başında baş seviyesini pre-aim ediyorsa
MEANING crosshair'i peek yaptığında başının olacağı yere ayarlanmış
COUNTER crosshair'lerinin altına düşürmek için hemen crouch yap
WHY bu sadece fight'ın açılış penceresinde işler -- sonra iyi oyuncular aşağı ayarlama yapar

IF cover arkasında dar köşe tutuyorsan
MEANING görünür gövdenin ne kadarını minimize etmek istiyorsun
COUNTER açığa çıkan profilini azaltmak için cover arkasında crouch yap
WHY daha az açığa çıkan yüzey alanı = vurulabilecek daha az vücut parçası

### Crouch Ne Zaman Seni Öldürür

IF ilk peek'indeysen
MEANING bir açıya ilk kez swing yapıyorsun, hayatta kalmak için hız gerekiyor
COUNTER peek yaparken asla crouch yapma -- tam koşma hızında kal
WHY crouch hareket ayakta durmanın kabaca yarısı hızında, seni kolay sabit görünümlü hedef yapar

IF güçlü aim'li oyuncuyla savaşıyorsan (Radiant seviye düellolar)
MEANING rakip crouch'a neredeyse anında uyum sağlar
COUNTER ayakta kal ve strafe-düello yap
WHY güçlü aim'ciye karşı crouch başını sadece hala takip edebildikleri daha yavaş, daha alçak hedef yapar

IF jiggle peek yapıyorsan
MEANING tüm amaç hız ve minimum açığa çıkarma
COUNTER jiggle peek sırasında asla crouch yapma
WHY crouch strafe hızını yok eder, jiggle'ın amacını ortadan kaldırır

IF 1vX clutch'taysan
MEANING kill'ler arasında hızlı ve sessiz reposition yapman gerekiyor
COUNTER crouch yerine ayakta kal ve shift-walk yap
WHY crouch kumaş gürültüsü çıkarır ve pozisyonlar arası rotasyonunu yavaşlatır

IF birden fazla düşman pozisyonunu izliyorsa
MEANING crouch ile bir düelloya commit etmek diğerleri için seni sabit bırakır
COUNTER ilk kill sonrası cover'a strafe yapabilmek için ayakta kal
WHY crouch yapan oyuncu diğer düşmanlar için bedava kill

### Crouch Zamanlama Penceresi

- Crouch sadece çatışmanın çok erken parçasında faydalı. O başlangıç penceresinden sonra iyi oyuncular aim'lerini aşağı ayarlamıştır.
- Tekrar ayağa kalkma zamanlama: Crouch yapıp düşman spray'i aşağı takip ederse, crosshair'lerini başından çekmek için "crouch-stand" juke yaratarak tekrar ayağa kalk.

---

## Hareket Hız Kademeleri

Tam değerleri ezberlemek yerine göreceli hız kademelerini anla:

| Kademe | Silahlar | Göreceli Hız |
|---|---|---|
| En Hızlı | Bıçak | Temel çizgi -- oyundaki en hızlı |
| Hızlı | Tabancalar (Classic, Shorty, Frenzy, Ghost, Sheriff) | Bıçaktan biraz yavaş |
| Orta | Tüfekler (Phantom, Vandal, Bulldog), SMG'ler (Spectre, Stinger), Pompalılar | Tabancalardan belirgin yavaş |
| Yavaş | Guardian, Marshal | Tüfeklerden biraz yavaş |
| En Yavaş | Operator, Odin, Ares | Tüfeklerden büyük ölçüde yavaş |

Yürüyüş koşma hızının kabaca %60'ı. Crouch koşma hızının kabaca %40'ı. Bu oranlar tüm silahlarda geçerli.

### Hız Etkileri

- Bıçak koşucu site'a tüfek koşucudan büyük ölçüde daha hızlı ulaşır. Birçok haritada bu fark site take'inde kimin ilk teması yapacağını belirler.
- Mid kontrolu neredeyse her haritada en erken çatışma noktasıdır çünkü her iki takım birbirine yakın zamanlamada mid'e ulaşır.
- Pistol round'larında tabanca taşıyıcılar tüfek taşıyıcılardan biraz hızlı hareket eder, eco rush'larında küçük hız avantajı verir.
- Rotasyon kapılı haritalarda (Lotus) kapılar rotasyonlara belirgin gecikme ekler. Kapılardan erken rotasyon çağır.

---

## Run-and-Gun Uygulanabilirliği

Koşma hassasiyeti silah sınıfları arasında drastik farklılık gösterir. Bazı silahlar hareket halinde uygulanabilir:

| Silah | Run-and-Gun Uygulanabilir mi? | Hareket Halinde Geçerli Menzil |
|---|---|---|
| Spectre | EVET | Yakın-orta menzil -- run-and-gun kralı |
| Stinger | EVET | Sadece yakın menzil |
| Judge / Bucky | EVET | Çok yakın menzil |
| Classic (right-click) | EVET | Çok yakın menzil -- burst headshot ile tek atış öldürebilir |
| Frenzy | EVET | Yakın menzil |
| Ares / Odin | EVET (spin-up sonrası) | Yakın-orta menzil |
| Ghost | Marjinal | Sadece çok yakın menzil |
| Phantom | HAYIR | Sıfır mesafe hariç |
| Vandal | HAYIR | Hareket halinde asla uygulanabilir değil |

### Run-and-Gun Mekanikleri

- Spectre en iyi run-and-gun silahı. Yakın mesafede hareket cezası zar zor önem taşıyor. Spectre ile strafe-spray eco round'larında meşru strateji.
- Classic right-click çok yakın mesafede koşarken tek-burst öldürebilir. Burst ağır gövde hasarı verir ve headshot çarpanıyla ölümcül olabilir.
- Ares/Odin spin-up mekaniğine sahip: kısa başlangıç atış süresinden sonra hareket halinde bile hassasiyetleri dramatik şekilde iyileşir. Bu silahlarla ön-ateş yap.

---

## Spray Transfer

Bir hedeften diğerine spray ederken ekranındaki transfer mesafesi menzile bağlıdır:

- Yakın mesafede hedefler ekranda uzak görünür -- büyük transfer flick gerekli.
- Uzun mesafede hedefler ekranda yakın görünür -- küçük transfer flick gerekli.
- Hedef ne kadar uzaksa, flick o kadar sıkı. Bu çoğu oyuncunun beklediğinin tersi.

### Spray Transfer Tekniği

1. Hedef 1'i spray ederken öldür (mermi 1-6).
2. Crosshair'i hedef 2'ye yapıştır (bu transfer).
3. Spray pattern offset'ini telafi et: mid-spray'de pattern bir yöne çekiyor. Transfer ederken bunu counter'laman gerekiyor.
4. **Vandal spray transfer**: Vandal'ın sol çekişini telafi etmek için transfer sırasında crosshair'i AŞAĞI-SAĞA çek.
5. **Phantom spray transfer**: Phantom'ın sağ çekişini telafi etmek için transfer sırasında crosshair'i AŞAĞI-SOLA çek.
6. Hedef 2 uzaktaysa spray'i resetle: atış durdurup, mikro counter-strafe yapıp yeni spray başlatmak daha hızlı olabilir.

---

## Ses Sistemi

### Ses Yarıçapı Genel Bakış

Valorant'taki tüm sesler iki kategoriye düşer:

**Tam yarıçap sesler** (uzaktan, duvarlardan duyulur):
- Koşma ayak sesleri
- Atlama inişleri
- Silah equip/değiştirme
- Reload
- Scope-in (Marshal/Operator)
- Spike plant ve defuse başlangıcı
- İp tırmanma
- Teleporter çıkışı (Bind)

**Kısa yarıçap sesler** (sadece yakında duyulur):
- Yürüme ayak sesleri
- Crouch yürüme (yürüme ile aynı yarıçap -- yürüme üzerine gizlilik avantajı yok)

Temel çıkarım: yürümeden daha yüksek her eylem çoğu harita alanlarından duyulabilir. Yürüme/crouch olmayan tüm eylemleri pozisyonunu yayınlamak olarak kabul et.

### Yetenek Ses İpuçları ve Bilgi

| Yetenek | Sesin Açığa Çıkardığı |
|---|---|
| Jett dash | Dash yönü, Jett pozisyonunu onaylar |
| Raze satchel | Yön ve olası peek açısı |
| Omen Shrouded Step | Varış konumu (kaynak değil) |
| Omen ult | Varış sesini duyarsan varış konumu |
| Chamber TP | Varış anchor konumu |
| Reyna dismiss | Seyahat yönü |
| Yoru TP | Hem kaynak hem varış |
| Yoru clone ayak sesleri | Gerçekten ayırt edilemez (bait için tasarlanmış) |
| KAY/O knife inişi | Baskılama yarıçap merkezi |
| Sova drone | Yön ve yaklaşık konum |
| Skye köpek | Yön; düşmana yakınken tetiklenir |
| Fade prowler | Seyahat yönü |
| Breach aftershock | Aftershock'un tam pozisyonu (duvardan şarj eder) |
| Killjoy turret atışı | Turret konumu; ateş ediyorsa düşman yakında |
| Cypher tripwire tetiklenmesi | Tam tripwire konumu |

### Dikey Ses

- Valorant'ın HRTF sistemi dikey sesi simüle eder. Yukarıdan gelen sesler aynı seviyeden gelen seslerden biraz farklı tonal kaliteye sahiptir (daha yüksek frekans vurgusu).
- Rekabetçi oyun için ses ayarlarında HRTF'yi etkinleştir.
- Yaygın dikey ses noktaları: Haven C-Long garaj (üst/alt), Split Mid (heaven/hell), Ascent Mid (catwalk/market üstü), Icebox B-Site (tube/yer altı), Lotus B-Site (üst vs alt).
- Farklı yüzeylerdeki ayak sesi sesleri (metal, tahta, taş) dikey pozisyonu belirlemeye yardımcı olur. Metal ızgara sesleri catwalk/heaven pozisyonlarını gösterir.

---

## Spike Zamanlama

### Temel Spike Mekanikleri

- **Plant**: Hasarla kesintiye uğratılamayan sabit süreli animasyon -- görüş hattını kesmeli veya plant yapanı öldürmeli.
- **Full defuse**: Kabaca plant'ın iki katı kadar sürer.
- **Yarı defuse**: Yarı yola kadar defuse edip durma %50 ilerleme kaydeder. Sonraki defuse girişimi sadece kalan yarıyı gerektirir.
- **Spike patlama**: Plant sonrası geri sayım başlar. Spike bip hızı patlamaya yaklaştıkça artar -- başta yavaş, yarım noktasında daha hızlı, sona doğru hızlı, sonra patlamadan hemen önce sürekli.

### Fake Defuse

IF post-plant'te defuse sesi duyuyorsan
MEANING savunucu defuse başlatmış veya seni peek'e bait etmek için fake yapıyor
COUNTER açını tut -- ilk defuse sesinde hemen peek atma; commit edilmiş defuse için bekle (sürekli sesi dinle) veya kısa bir gecikmeden sonra peek at
WHY deneyimli savunucular bait için spike'a kısaca dokunarak defuse sesinin başlangıcını çıkarır, post-plant oyuncusunu açık peek'e çıkarır

IF defuse eden ve post-plant oyuncusu hayattayken sen defuse ediyorsan
MEANING saldırgan peek veya molly zamanlamak için defuse seslerini dinliyor
COUNTER kısa dokunuşla fake defuse yap, hemen dur ve açıyı tut; peek yaparlarsa öldür, sonra gerçek defuse'a commit et
WHY fake zamanlama tuzağı oluşturur -- saldırgan ya fake üzerine utility harcar ya crosshair'ine peek eder

### Spike Patlama Hasarı

- Spike'a çok yakın mesafede ölümcül.
- Hasar mesafeyle düşer. Orta mesafede heavy shield hayatta kalabilir.
- Bazı kalın duvarlar yakın mesafede bile patlamayı tamamen engeller -- patlama tüm geometriyi delmez.

---

## Round Timer Exploit'lemesi

### Timer Bazlı Karar Verme

| Faz | Saldırgan Önceliği | Savunucu Önceliği |
|---|---|---|
| Erken round | Default: harita kontrolu al, bilgi topla | Pozisyonları tut, aşırı commit etme |
| Orta round | Execute et veya execute için hazırlan | Saldırgan niyetlerini belirle, gerekirse rotate etmeye başla |
| Geç round | Bir site'a commit etmek zorunda | Rotate'e commit et veya tut |
| Son aşamalar | Spike'ı ŞİMDİ plant et -- her gecikme can alıcı | Agresif retake yap veya teslim ol |
| Zaman bitti | Plant yoksa kaybedersin | Spike plant edilmediyse timer'la kazanırsın |

### Post-Plant Timer Mantığı

- Spike plant edildikten sonra sadece spike patlama geri sayımı önem taşır. Round timer'ı alakasız olur.
- Savunucular full defuse'u tamamlamak için patlama geri sayımında yeterli zamanla spike'a ulaşmalı.
- Yarı-defuse uygulanabilir pencereyi genişletir: savunucular ilk yarıyı daha erken başlayabilir, fight için geri çekilebilir, sonra patlamaya daha yakın ikinci yarıyı tamamlayabilir.

---

## Spawn Zamanlama ve Site Take'ler

### Spawn Zamanlama Prensipleri

Tam varış sayılarını ezberlemek yerine şu pattern'leri anla:

- **Savunucular her zaman her site'a önce ulaşır.** Fark küçük avantajdan (mid alanları) büyük avantaja (uzak site'lar -- Bind'da B-Long veya Lotus'ta C-Main) kadar değişir.
- **Mid her zaman en yakın çatışma noktası.** Her iki takım her haritada çok kısa pencere içinde mid'e ulaşır. Mid kontrolunun bu kadar çatışılan olmasının nedeni budur.
- **Bıçak koşması farkı kapatır.** Bıçakla koşan saldırganlara çatışma alanlarına daha hızlı ulaşır, ama hazır silah olmaması pahasına.
- **Rotasyon kapıları (Lotus) gecikme ekler.** Kapı animasyonu anlamlı zaman harcar, bu yüzden kapılardan erken rotasyon çağrısı gerekli.
- **Üç site'li haritalar (Haven) savunucuları ince yayar.** En az bir site'ta her zaman gecikmeli savunucu rotasyonu vardır. Hangi savunucunun hangi site'i oynadığını takip et ve zayıf setup'ı saldır.

---

## Jump Peek Zamanlama ve Hassasiyet

### Jump Mekanikleri

- Atlamanın kısa yukarı ve kısa aşağı fazı var.
- Silahlar havadayken tamamen hassasiyetsiz. Havada hassas ateş edemezsin (Bladestorm'lu Jett hariç).
- Jump peek amacı: Silahlı çatışmaya commit etmeden görüş bilgisi toplamak. Atlamanın zirvesinde headshot yemesi daha zor.
- Zirvede, yönü değiştirmek için counter-strafe yapabilirsin, iniş pozisyonunu tahmin edilemez kılarsın.

### Jump Peek Uygulamaları

IF bir açının tutulup tutulmadığını bilgi edinmen ama silahlı çatışma riskini alamazsan
MEANING birinin orada olup olmadığını görmek istiyorsun commit etmeden
COUNTER açıyı jump peek yap -- taramak için kısa havada kalma penceresini kullan, sonra cover arkasına in
WHY atlama zirvesinde başın standart strafe peek'ten daha zor takip edilen doğrusal olmayan yol izler

IF tehlikeli görüş hattını geçmen gerekiyorsa (Ascent mid avlusu veya Icebox mid gibi)
MEANING boşluktan koşmak atlamaktan daha uzun süre açıkta bırakır
COUNTER boşluktan koşma atlaması yap -- atlama sırasında katedilen yatay mesafe görüş hatlarını yerden hareketten daha hızlı geçebilir
WHY atlama yatay hız ile dikey yer değiştirmeyi birleştirerek düşman crosshair'inde geçirdiğin süreyi azaltır

### Yaygın Jump Peek Noktaları

- Bind A-Short: Short köşeden dirsek/lamps'ın tutulup tutulmadığını görmek için jump peek.
- Ascent Mid: Catwalk'tan mid/market'i görmek için jump peek. Pro seviyede son derece yaygın.
- Icebox B-Orange: Commit etmeden tube/site'ın tutulup tutulmadığını görmek için jump peek.
- Haven C-Long: Long köşeden açının Operator tarafından tutulup tutulmadığını görmek için jump peek.

---

## Wallbang Noktaları ve Hasar

Valorant'ta materyal nüfuz kademeleri var:

| Materyal | Nüfuz Seviyesi |
|---|---|
| İnce tahta | Yüksek nüfuz -- hasarın çoğu geçiyor |
| Kalın tahta | Orta nüfuz -- kabaca yarım hasar |
| İnce metal | Orta-yüksek nüfuz |
| Kalın metal | Düşük nüfuz -- hasarın çoğu emilir |
| İnce taş | Orta nüfuz |
| Kalın taş | Çok düşük nüfuz |
| Cam | Neredeyse tam nüfuz |

### Yüksek Değerli Wallbang Noktaları

- **Ascent B-Main tahta kapı**: Bu kapıdan tüfek headshot'u hala ölümcül veya neredeyse ölümcül hasar verir. Baş seviyesinde spam yapmak son derece uygulanabilir.
- **Ascent Mid Pizza/Market**: İnce duvar kısımları güçlü hasar için tüfek wallbang'e izin verir.
- **Bind A-Short**: Metal konteyner duvarı ince metal -- tüfek headshot'lar büyük hasar verir.
- **Haven C-Long tahta duvar**: Plat yakınında ince tahta, neredeyse ölümcül headshot hasarı için tam tüfek wallbang'e izin verir.
- **Split A-Ramp**: Ramp'taki tahta kutu ince tahta. Ayak sesleri duyarsan spam yap.
- **Icebox B-Orange konteyner**: İnce metal duvarlar. Tüfek headshot'lar yüksek hasar verir. Çok yaygın wallbang noktası.
- **Lotus B-Upper**: Tahta bölme neredeyse ölümcül tüfek headshot hasarı için spam'lanabilir.

### Wallbang Karar Verme

IF spam'lanabilir yüzey arkasında ayak sesleri veya defuse duyarsan
MEANING düşman nüfuz edilebilir materyalin arkasında ve yaklaşık pozisyonunu biliyorsun
COUNTER hemen baş seviyesinde tüfek veya Odin ile wallbang yap
WHY duvarlardan kısmi hasar bile düşmanları pozisyonlardan zorlar, defuse'ları keser ve ince materyallerden kill alabilir

IF SMG veya tabanca ile wallbang yapmayı düşünüyorsan
MEANING bu silahlar nüfuzdan çok fazla hasar kaybeder
COUNTER cephane tasarruf et veya doğrudan açı için reposition yap
WHY düşük kalibre silahlardaki nüfuz hasar çarpanı wallbang yapmayı verimsiz kılar -- sadece tüfekler ve ağır silahlar yeterli hasarı korur

---

## One-Way Smoke Pozisyonları

One-way smoke'lar düşman ayaklarını görmenize izin verirken onlar sizi göremez. Smoke'un alt kenarının göz hizanızda ama düşmanın görüşünü kaplayacak şekilde yerleştirilmesine dayanır.

### Prensipler

- Smoke bir yüzeye (duvar, kutu, çıkıntı) yapışarak smoke kürenin altının yükselmesi gerekir.
- Başın smoke'un alt kenarında veya altında olmalı. Crouch yapmak yardımcı olur.
- Diğer taraftaki düşman daha alçak bir yükseklikte veya aynı seviyede ama mesafede olmalı (smoke perspektiflerinden yukarı kıvrılır).

### Temel One-Way Smoke Pozisyonları (Ajan Spesifik)

- **Omen Bind B-Long'da**: Smoke'u uzun duvarın üstüne yerleştir. Site'tan smoke'un altından ayak görürsün. Pro-seviye temel.
- **Viper Ascent A-Main'de**: Main girişinin yakınındaki alçak duvarda Poison cloud. Savunucular jeneratör arkasından ayak görür.
- **Jett Split A-Ramp'ta**: Ramp çıkıntısına Cloud burst. Ramp'tan A-Main ayakları görürsün.
- **Brimstone Haven C-Long'da**: Long duvar kenarında smoke. Site'tan long'dan yaklaşan ayakları görürsün.
- **Astra Icebox B-Site'ta**: Turuncu konteynerin üstüne yerleştirilen yıldız B-main'e bakan one-way oluşturur.
- **Harbor Lotus A-Main'de**: A-Main üstündeki duvar çıkıntısına yerleştirilen Cove moloz'dan one-way oluşturur.

### One-Way Smoke Karşı Oynama

IF düşman one-way'ini biliyorsa
MEANING altından crouch-walk yapacak veya içinden agresif push yapacak
COUNTER one-way pozisyonlarını round'lar arasında rotate et, setup'ı tahmin edemesinler
WHY one-way rakip beklediğinde tüm değerini kaybeder -- sürpriz unsuru tüm avantajdır

---

## Rank Modülasyonu

### Immortal+ İçin

IF ileri mekaniklerini rafine etmek istiyorsan
MEANING bu seviyede counter-strafe zamanlama, jiggle peek genişliği ve crouch disiplini round sonuçlarını belirler
COUNTER her mekaniği izole pratik et: counter-strafe için Range bot'ları, jiggle peek için custom oyunlar, crouch zamanlama için deathmatch
WHY Immortal+'da mekanik farklar küçük ama belirleyici; mikro-optimizasyon üst sıralamalarla alt sıralamalar arasındaki farktır

### Diamond-Ascendant İçin

IF mekanik temellerini kurmak istiyorsan
MEANING counter-strafe, ses sistemi bilgisi ve spray transfer bu seviyede en büyük kazançlar
COUNTER counter-strafe'i kas hafızasına yerleştir, ses ipuçlarını bilinçlice dinle, spray transfer'i pratik et
WHY bu üç mekanik combined olarak diğer mekanik iyileştirmelerden daha fazla round kazandırır
