# İleri Mekanikler -- Radiant Seviye Bilgi Bankası

---

## Counter-Strafe Zamanlama

Counter-strafe şu demek: hareket ederken ters yöne basarsın, böylece anında durursun. Tuşu bırakmak yerine ters tuşa bas — bu fark kritik, çünkü seni çok daha hızlı doğru nişan aralığına sokar.

### Silaha Göre Hız Farkı

Her silah counter-strafe'e farklı tepki verir:

| Kademe | Silahlar | Counter-Strafe Hızı | Tuşu Bırakmaya Göre Fark |
|---|---|---|---|
| En Hızlı | Shorty, Stinger, Classic, Frenzy, Spectre | Neredeyse anında hazır | Durma süresini neredeyse yarıya indirir |
| Hızlı | Phantom, Bulldog, Ghost, Marshal, Guardian, Vandal, Sheriff | Çok hızlı hazır | Belirgin kazanç |
| Orta | Operator, Ares, Odin | Daha yavaş hazır | Yine de büyük kazanç, pencere biraz daha geniş |

Silah ne kadar ağırsa her iki yöntem de o kadar uzun sürer — ama counter-strafe seni her zaman tuşu bırakmaktan daha hızlı hazır eder.

### Teknik Detaylar

- **Basma süresi**: Ters tuşa bir-iki frame bas, hepsi bu. Uzun tutarsan yön değiştirirsin, işe yaramaz.
- **Eşik değeri**: Hızın maksimum koşu hızının yaklaşık %30'una düştüğünde nişanın doğrulanır. Counter-strafe seni oraya tuşu bırakmaktan çok daha hızlı ulaştırır.
- **Çift-tap counter-strafe**: A-D-A veya D-A-D sırasıyla bas. Bu mikro-jiggle yaratır — düşman seni takip edemez, sen kuru peek atarken nişan eşiğinin yakınında kalırsın. Radiant'ta açıları temizlerken bunu sık görürsün.
- **Çapraz counter-strafe**: W+A veya W+D ile hareket ediyorsan, durduğunda her iki tuşa da aynı anda ters bas. Birini atlarsan hız kalıntısı kalır ve nişanın bozulur.

---

## Jiggle Peek Genişlik Optimizasyonu

Jiggle peek'te amaç şu: başını değil sadece omzunu göster, bilgi al, çekil. Ne kadar açıkta kalacağın hedefe göre değişir.

### Hedefe Göre Ne Kadar Görün

| Hedef | Ne Kadar Görün | Risk |
|---|---|---|
| Açının tutulup tutulmadığını anlamak | Sadece omuz kenarı — zar zor | Düşük |
| Op atışı bait etmek | Omuzdan biraz fazla — tepki çekecek kadar | Orta |
| Geniş swing takibi | Gövdenin çoğu açıkta | Yüksek |
| Saf bait (omuz peek) | Mutlak minimum — modelin dış kenarı | Minimal |

### Mesafeye Göre Jiggle Genişliği

IF 30 metre üstü bir açıda jiggle atıyorsan
MEANING düşman ekranında çok az hareket görür — açısal hız düşük, küçük bir kaymayı zor fark eder
COUNTER strafe tuşuna daha hafif bas, daha sıkı jiggle at
WHY bu mesafede küçük bir hareket bile bilgi toplamana yeter, gereksiz yere açıkta kalma

IF 15 metre altı bir açıda jiggle atıyorsan
MEANING düşman ekranında her hareketinle büyük bir alan kaplarsın — açısal hız yüksek
COUNTER strafe tuşunu biraz daha uzun bas, jiggle'ı genişlet
WHY bu kadar yakında çok sıkı jiggle atarsan düşman seni zar zor görür ama tepki de vermez — tepki vermesini istiyorsan biraz daha fazla görün

IF 15–30 metre arası bir açıda jiggle atıyorsan
MEANING standart mesafe, açısal hız dengeli
COUNTER orta genişlikte jiggle at — strafe tuşuna kısa ama net bas
WHY bu senin temel noktan; duruma göre biraz daralt ya da genişlet

### Jiggle Sıralaması

- **Tek jiggle**: Bir hızlı giriş-çıkış. Normal bir oyuncudan atış bait etmeye yeter.
- **Çift jiggle**: Arka arkaya iki jiggle. Op kullanan birini erken ateş ettirir ya da beklemeye zorlarsın — her ikisi de sana bilgi verir.
- **Jiggle'dan geniş swing'e**: Bir jiggle at, kısa dur, sonra içeri gir. Duraklamayla rakibin ritim beklentisini kırarsın.

---

## Geniş Swing vs Yakın Peek Karar Ağacı

```
Düşman Operator tutuyor mu?
+-- EVET -> Geniş swing (hız avantajı, takibi zor)
|   +-- Flashın var mı? -> Flash + geniş swing
|   +-- Flash yok mu? -> Önce jiggle bait, kaçırdıktan sonra geniş swing
+-- HAYIR -> Mesafeye bak
    +-- Uzun mesafe -> Yakın peek (gereksiz açığa çıkma yok, tüfek düellosu al)
    +-- Orta mesafe -> Silahına göre karar ver
    |   +-- Vandal/Phantom -> Yakın peek
    |   +-- Pompalı/SMG -> Mesafeyi kapatmak için geniş swing
    +-- Yakın mesafe -> Geniş swing (hızla bas)

Düşman off-angle mı tutuyor?
+-- EVET -> Yakın peek işe yaramaz; off-angle'ı yakalamak için geniş swing
+-- HAYIR -> Açığa çıkmayı azalt, yakın peek at

Takım arkadaşınla peek atıyor musun (çift peek)?
+-- EVET -> Biri yakın peek, biri geniş swing. Zamanlama farklı olsun.
+-- HAYIR -> Util yoksa yakın peek varsayılan.
```

### Geniş Swing'de Hız Farkı

- Bıçakla koşmak oyundaki en hızlı hareket.
- Tüfekle koşmak bıçaktan yaklaşık %20 yavaş.
- Operatorla koşmak bıçak hızının yaklaşık %73'ü — en yavaş kategori bu.
- Tüfekle geniş swing atarken bu fark hissedilir. Bilgi toplamak için önce bıçakla swing at, sonra silahına geç ve peek'e devam et.

---

## Crouch Zamanlama

### Crouch Ne Zaman İşe Yarar

IF spray'in tam ortasındasın, 4-5. mermiye geldin
MEANING spray pattern dışa açılıyor, mermiler dağılıyor
COUNTER tam 4-5. mermide crouch yap — ilk mermide asla
WHY crouch bu noktada hareketi sıkıştırır, sonraki mermiler hedefe oturur

IF düşman açıyı kafan hizasında bekliyorsa
MEANING peek attığında başın tam crosshair'inin üstüne gelir
COUNTER peek'e girerken anında crouch yap, crosshair'inin altına in
WHY bu sadece dövüşün ilk anında çalışır — iyi oyuncular hemen aşağı ayarlar

IF cover arkasında açı tutuyorsan
MEANING görünen vücudunu küçültmek istiyorsun
COUNTER cover arkasında crouch'a in
WHY dışarıda kalan yüzey alanı azalır, düşmanın vuracak yeri kalmaz

### Crouch Seni Ne Zaman Öldürür

IF bir açıya ilk kez giriyorsan
MEANING hayatta kalmak için hız lazım
COUNTER peek'e girerken asla crouch yapma — tam koşu hızında gir
WHY crouch hızını yarıya düşürür, seni sabit hedef yapar

IF yüksek aim'li biriyle düello yapıyorsan
MEANING o oyuncu crouch'a anında uyum sağlar
COUNTER ayakta dur, strafe yap
WHY crouch başını sadece daha yavaş ve daha alçak bir hedef yapar — trade alamazsın

IF jiggle peek atıyorsan
MEANING bunu hız ve minimum görünürlük için yapıyorsun
COUNTER jiggle'da asla crouch yapma
WHY crouch strafe hızını sıfırlar, jiggle'ın tüm amacı biter

IF 1vX clutch'tasın
MEANING bir kill'den sonra sessizce pozisyon değiştirmen gerekiyor
COUNTER crouch yapma, ayakta shift-walk yap
WHY crouch ses çıkarır ve yer değiştirme'ı yavaşlatır

IF birden fazla düşman seni izliyorsa
MEANING bir düelloya crouch'la commit edersen diğerlerine karşı donup kalırsın
COUNTER ilk kill'den sonra cover'a strafe edebilmek için ayakta kal
WHY crouch'a giren oyuncu diğer düşmanlara bedava kill verir

### Crouch Zamanlama Penceresi

- Crouch sadece dövüşün ilk saniyesinde işe yarar. O pencere kapandıktan sonra iyi oyuncular aim'i zaten aşağı almıştır.
- Düşman spray'i aşağı takip ettiyse hemen ayağa kalk — crouch-stand juke yap, crosshair'ini başından çek.

---

## Hareket Hız Kademeleri

Sayıları ezberleme. Kademeleri bil, sahada uygula:

| Kademe | Silahlar | Göreceli Hız |
|---|---|---|
| En Hızlı | Bıçak | Oyundaki tavan |
| Hızlı | Tabancalar (Classic, Shorty, Frenzy, Ghost, Sheriff) | Bıçaktan biraz yavaş |
| Orta | Tüfekler (Phantom, Vandal, Bulldog), SMG'ler (Spectre, Stinger), Pompalılar | Tabancalardan belirgin yavaş |
| Yavaş | Guardian, Marshal | Tüfeklerden biraz yavaş |
| En Yavaş | Operator, Odin, Ares | Tüfeklerden çok daha yavaş |

Yürürken koşmanın yaklaşık %60'ı hızındasın. Çömelince bu %40'a düşer. Bu oran hangi silahı tuttuğundan bağımsız — hep böyle.

### Hız Etkileri

- Bıçakla site'a koşarsan tüfek tutana göre belirgin önce varırsın. Çoğu haritada ilk teması sen yaparsın — bu büyük avantaj.
- Mid, her iki tarafın birbirine en yakın zamanda ulaştığı nokta. İlk çatışma neredeyse her haritada orada olur.
- Pistol round'unda tabancayla koşan, tüfek tutandan biraz hızlı. Eco rush'ta bu farkı kullan.
- Lotus gibi kapılı haritalarda kapılar rotasyonu geciktirir. Kapıya yaklaşmadan önce rotasyon çağır — yoksa geç kalırsın.

## Run-and-Gun Uygulanabilirliği

Her silahla koşarak ateş edemezsin. Hangisiyle edebileceğini ezberle:

| Silah | Run-and-Gun Olur mu? | Ne Kadar Uzakta? |
|---|---|---|
| Spectre | EVET | Yakın-orta mesafe — en iyi seçim |
| Stinger | EVET | Sadece yakın mesafe |
| Judge / Bucky | EVET | Çok yakın mesafe |
| Classic (sağ tık) | EVET | Çok yakın mesafe — burst ile kafaya vurursan tek atışta öldürürsün |
| Frenzy | EVET | Yakın mesafe |
| Ares / Odin | EVET (spin-up sonrası) | Yakın-orta mesafe |
| Ghost | Zor | Sadece çok yakın mesafe |
| Phantom | HAYIR | Sıfır mesafe bile riskli |
| Vandal | HAYIR | Koşarken hiç deneme |

### Run-and-Gun Mekanikleri

- Spectre ile koşarken spray at — hareket cezası neredeyse yok. Eco roundlarda bu silahla strafe-spray yap, bu meşru bir strateji.
- Classic sağ tık: düşman çok yakına geldiğinde koşarken ateşle. Burst gövdeye vurur ve kafaya çarparsa tek atışta öldürür.
- Ares / Odin ile birkaç atış yaptıktan sonra hareket halindeyken isabetin artar — bu yüzden bekleme, önceden ateşe başla.

---

## Spray Transfer

Bir düşmandan diğerine geçerken ne kadar flick yapacağın mesafeye göre değişir:

- Yakın düşman ekranda büyük görünür — büyük flick yaparsın.
- Uzak düşman ekranda küçük görünür — küçük flick yaparsın.
- Uzaktaki düşmana transfer daha sıkı, daha az el hareketi ister. Çoğu oyuncu bunu tersine anlar.

### Spray Transfer Tekniği

1. 1. düşmanı spray'le bitir (1-6. mermi arası). Crosshair'i 2. düşmana yapıştır.
2. Mid-spray'de silahın bir yöne çektiğini hissedersin — bunu tersiyle kapat.
3. **Vandal ile transfer**: Silah sola çeker. Crosshair'i AŞAĞI-SAĞA kaydır.
4. **Phantom ile transfer**: Silah sağa çeker. Crosshair'i AŞAĞI-SOLA kaydır.
5. 2. düşman uzaktaysa spray'i sıfırla: dur, micro counter-strafe yap, sıfırdan spray başlat.

---

## Ses Sistemi

### Ses Yarıçapı Genel Bakış

Tüm sesler iki gruba girer:

**Her yerden duyulan sesler** (duvardan bile geçer):
- Koşma, atlama inişi, silah değiştirme, reload
- Scope-in (Marshal/Operator)
- Spike plant/defuse başlangıcı, ip tırmanma, Bind teleporter çıkışı

**Sadece yakından duyulan sesler**:
- Yürüme ayak sesleri
- Crouch yürüme — yürümeyle aynı ses yarıçapı, hiçbir gizlilik avantajı yok

Yürüme veya crouch dışında attığın her adım pozisyonunu düşmana söyler. Koşuyorsan, zıplıyorsan, silah değiştiriyorsan — nerede olduğunu haritanın her yerine ilan ediyorsun.

---

### Yetenek Ses İpuçları

| Yetenek | Sesin Sana Söylediği |
|---|---|
| Jett dash | Dash yönü — Jett'in pozisyonunu onaylar |
| Raze bot | Yön ve muhtemel peek açısı |
| Omen kaçış | Nereden değil, nereye gittiği |
| Omen ult | Varış sesini duyduysan, oraya iniyor |
| Chamber TP | Anchor konumu |
| Reyna kaçış | Kaçış yönü |
| Yoru TP | Hem çıkış hem varış noktası |
| Yoru klon ayak sesleri | Gerçek olanı ayırt edemezsin — bait için tasarlanmış |
| KAY/O bot inişi | Baskılama alanının tam merkezi |
| Sova recon | Yön ve yaklaşık konum |
| Skye köpek | Yön; düşmana yaklaşınca ses değişir |
| Fade bot | Hareket yönü |
| Breach molly | Mollynin tam yeri — duvardan şarj eder |
| Killjoy bot atışı | Bot konumu; ateş ediyorsa düşman orada |
| Cypher tel | Tetiklenen telin tam pozisyonu |

---

### Dikey Ses

- Ayarlardan HRTF'yi aç. Üstten gelen sesler tonal olarak farklı gelir — daha tiz.
- Yukarıdan koşan biri ile aynı seviyeden koşan biri aynı ses değil.
- Bu farkı duyabileceğin yerler: Haven C-Long garaj, Split Mid heaven/hell, Ascent Mid catwalk/market üstü, Icebox B tube/yer altı, Lotus B üst/alt.
- Metal ızgara sesi duyuyorsan karşındaki catwalk veya heaven'da. Taş veya tahta sesi duyuyorsan aynı kattasınız.

## Spike Zamanlama

### Temel Spike Mekanikleri

- **Plant**: Plant animasyonunu hasar vererek durduramazsın — ya görüş hattını kes ya da planter'ı öldür.
- **Full defuse**: Plant'ın yaklaşık iki katı sürer.
- **Yarı defuse**: Yarıda bıraktığında %50 ilerleme kaydolur. Bir sonraki girişimde sadece kalan yarıyı tamamlarsın.
- **Spike patlama**: Bip sesi patlamaya yaklaştıkça hızlanır — başta yavaş, ortada belirgin, sona doğru sürekli. Bunu duyarak patlamaya ne kadar kaldığını anlarsın.

### Fake Defuse

IF post-plant'te defuse sesi duyuyorsan
MEANING savunucu defuse başlatmış ya da seni açığa çekmek için fake yapıyor
COUNTER açını tut — ilk seste hemen peek atma; ses kesintisiz devam ediyorsa gerçektir, o zaman peek at
WHY iyi savunucular spike'a kısaca dokunup sesi tetikler, post-plant oyuncusunu boşa peek'e çeker

IF defuse ederken saldırgan hayattaysa
MEANING saldırgan defuse sesini dinleyip seni ezmeye ya da util atmaya hazırlanıyor
COUNTER kısaca dokun, hemen dur, açını tut — peek atarsa öldür, sonra gerçek defuse'a commit et
WHY fake defuse tuzak kurar — saldırgan ya üzerine util harcar ya da crosshair'ine girer

### Spike Patlama Hasarı

- Spike'ın tam yanındaysan ölürsün.
- Mesafe arttıkça hasar düşer — orta mesafede heavy shield ile hayatta kalabilirsin.
- Bazı kalın duvarlar patlamayı tamamen keser — patlama her geometriyi delmez.

---

## Round'un Akışına Göre Karar Ver

### Ne Zaman Ne Yaparsın

| Faz | Saldırgan | Savunucu |
|---|---|---|
| Açılış | Harita kontrolü al, bilgi topla | Pozisyonunu tut, gereğinden fazla ilerleme |
| Orta | Execute'a gir ya da hazırlığı bitir | Saldırganın nereye baktığını anla, rotate'e hazırlan |
| Geç | Bir site'a kilitle | Rotate'e geç ya da pozisyonunu savun |
| Son an | Spike'ı hemen plant et — bekleme, ölürsün | Agresif retake'e gir yoksa kaybedersin |
| Süre doldu | Plant yoksa round bitti | Plant görmediysen kazandın |

### Plant Sonrası Tek Hesap: Spike Sayacı

- Spike plant edildiği andan itibaren round sayacını unut — tek önemli şey spike'ın patlamasına kalan süre.
- Savunucu olarak spike'a ulaştığında full defuse'u bitirecek kadar vaktinin olması lazım — yoksa girme.
- Yarı defuse'u kullan: ilk yarıyı başlat, fight gerekirse çekil, spike patlamaya yakın dönüp ikinci yarıyı tamamla.

---

## Spawn Zamanlama ve Site Take'ler

### Spawn Zamanlama Prensipleri

Saniye ezberlemene gerek yok. Şu pattern'leri kafana sok:

- **Savunucu her site'a senden önce girer.** Bu fark küçük olabilir (mid) ya da büyük olabilir (Bind'da B-Long, Lotus'ta C-Main). Buna göre hamle yap.
- **Mid her zaman ilk çatışma noktası.** Her iki takım mid'e neredeyse aynı anda girer. Mid'in bu kadar kanlı olmasının sebebi bu.
- **Bıçakla koşarsan farkı kapatırsın.** Ama silahın hazır olmaz. O yüzden düşman sesini duyduğunda bıçakla koşma.

---

**Lotus kapıları:** Kapı animasyonu zaman yer. Rotasyon çağrısı geldiğinde erken basmalısın, yoksa geç kalırsın.

**Haven:** Üç site savunucuyu böler. Her zaman bir site'ta geç rotasyon olur. Hangi savunucu hangi site'i tutuyor, takip et. Zayıf olan tarafa gir.

---

## Jump Peek Zamanlama ve Hassasiyet

### Jump Mekanikleri

- Havadayken silahın isabetsiz olur. Havada ateş etme — Jett'in ultu hariç.
- Jump peek'in amacı şu: silahlı çatışmaya girmeden açıyı taramak. Atlama zirvesinde kafan, standart peek'e göre daha zor takip edilir.
- Zirvede counter-strafe yap. İniş noktanı tahmin edilemez hale getirirsin.

### Jump Peek Uygulamaları

IF bir açının tutulup tutulmadığını öğrenmek istiyorsun ama ölüm riskini alamıyorsan
MEANING birinin orada olup olmadığını commit etmeden görmek istiyorsun
COUNTER jump peek at — havadayken kısa bir penceren var, o pencerede tara, sonra cover'a in
WHY zirvede kafan doğrusal olmayan bir yol izler, takip etmek zorlaşır

IF tehlikeli bir görüş hattını geçmen gerekiyorsa — Ascent mid avlusu veya Icebox mid gibi
MEANING koşarak geçersen daha uzun süre açıkta kalırsın
COUNTER atlayarak geç — yatay hız ile dikey hareket birleşince düşmanın crosshair'inde geçirdiğin süre kısalır
WHY yerden koşmak seni o görüş hattına daha uzun süre kilitler

### Yaygın Jump Peek Noktaları

- **Bind A-Short:** Short köşeden dirsek/lamps'ın tutulup tutulmadığını görmek için jump peek at.
- **Ascent Mid:** Catwalk'tan mid/market'i taramak için jump peek at.
- **Icebox B-Orange:** Tube veya site'ın tutulup tutulmadığını commit etmeden görmek için jump peek at.
- **Haven C-Long:** Long köşeden açının Op tarafından tutulup tutulmadığını kontrol etmek için jump peek at.

---

## Wallbang Noktaları ve Hasar

Duvara göre hasar değişir. Bunları bil:

| Materyal | Nüfuz Seviyesi |
|---|---|
| İnce tahta | Yüksek — hasarın çoğu geçer |
| Kalın tahta | Orta — yaklaşık yarı hasar |
| İnce metal | Orta-yüksek |
| Kalın metal | Düşük — hasar büyük ölçüde emilir |
| İnce taş | Orta |
| Kalın taş | Çok düşük |
| Cam | Neredeyse tam hasar |

### Yüksek Değerli Wallbang Noktaları

- **Ascent B-Main tahta kapı**: Baş hizasına tüfekle spam at. Neredeyse her zaman öldürür veya kritik hasar bırakır.
- **Ascent Mid Pizza/Market**: İnce duvar kısımları var. Tüfekle wallbang tam çalışır.
- **Bind A-Short**: Metal konteynerin duvarı ince metal. Tüfek headshot büyük hasar verir.
- **Haven C-Long tahta duvar**: Plat yakınındaki ince tahta, tüfek headshot'la neredeyse öldürür.
- **Split A-Ramp**: Ramptaki tahta kutu ince tahta. Ayak sesi duyarsan direkt spam at.
- **Icebox B-Orange konteyner**: İnce metal duvarlar. Tüfek headshot yüksek hasar verir. Buraya bak.
- **Lotus B-Upper**: Tahta bölme var. Tüfek headshot spamıyla neredeyse öldürürsün.

### Wallbang Karar Verme

IF spam'lanabilir bir yüzeyin arkasından ayak sesi veya defuse sesi geliyorsa
MEANING düşman ince materyalin arkasında ve yerini biliyorsun
COUNTER hemen baş hizasına tüfek veya Odin'le wallbang yap
WHY yarım hasar bile düşmanı pozisyondan atar, defuse'u keser ve ince materyalden kill alırsın

IF SMG veya tabancayla wallbang yapmayı düşünüyorsan
MEANING bu silahlar nüfuzda çok fazla hasar kaybeder
COUNTER mermiyi harcama, doğrudan açıya gir
WHY düşük kalibre silahlarda nüfuz hasarı o kadar düşer ki wallbang işe yaramaz — yeterli hasarı sadece tüfek ve ağır silahlar taşır

---

## One-Way Smoke Pozisyonları

One-way smoke şu demek: düşman seni göremez ama sen onun ayaklarını görürsün. Smoke'un alt kenarı tam göz hizanda durur, karşı taraf ise smoke'un içine bakar.

### Prensipler

- Smoke bir duvara, kutuya ya da çıkıntıya yapışmalı — böylece alt kenar yükselir.
- Başın smoke'un tam alt kenarında ya da altında olmalı. Gerekirse crouch yap.
- Karşı taraftaki düşman ya daha aşağıda olmalı ya da uzakta — smoke perspektif yüzünden yukarı doğru kıvrılır.

### Ajan Bazlı Pozisyonlar

- **Omen – Bind B-Long**: Smoke'u uzun duvarın üstüne at. Site içinden smoke altında ayak görürsün.
- **Viper – Ascent A-Main**: A-Main girişindeki alçak duvara smoke koy. Jeneratör arkasından ayak görürsün.
- **Jett – Split A-Ramp**: Ramp çıkıntısına smoke at. Ramp'tan A-Main ayaklarını görürsün.
- **Brimstone – Haven C-Long**: Long duvarın kenarına smoke at. Site içinden long'dan gelen ayakları görürsün.
- **Astra – Icebox B-Site**: Turuncu konteynerin üstüne smoke koy. B-Main'e bakan one-way açılır.
- **Harbor – Lotus A-Main**: A-Main üstündeki duvar çıkıntısına smoke at. Molozdan one-way çıkar.

### One-Way'e Karşı Oynama

IF düşman senin one-way'ini öğrendi
MEANING altından crouch-walk yapar ya da içine doğru agresif girer
COUNTER pozisyonu round'lar arasında değiştir, aynı noktaya yapıştırma
WHY düşman nereye bakacağını bilirse one-way'in sıfır değer kalır — tek avantajın sürpriz olmak

---

## Rank Modülasyonu

### Immortal+ İçin

IF mekaniklerini keskinleştirmek istiyorsan
MEANING bu seviyede counter-strafe zamanlaması, jiggle peek genişliği ve crouch zamanlaması round kazandırır ya da kaybettirir
COUNTER her mekaniği ayrı ayrı çalış: counter-strafe için Range botları, jiggle peek için custom oyun, crouch zamanlaması için deathmatch
WHY Immortal+'da fark küçük ama belirleyici — bu mikro düzeltmeler üst ile alt sıra arasındaki tek farktır

### Diamond-Ascendant İçin

IF mekanik temelini oturtmak istiyorsan
MEANING bu sıralamada sana en çok round'u counter-strafe, ses bilgisi ve spray transfer kazandırır
COUNTER counter-strafe'i kas hafızasına göm, düşman seslerini aktif dinle, spray transfer'i pratik et
WHY bu üç mekanik bir arada diğer her şeyden fazla round kazandırır
