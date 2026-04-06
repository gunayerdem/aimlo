# AJAN: Waylay

> PATCH-SENSITIVE: Waylay yeni bir ajan. Koçluk tavsiyesi meta geliştikçe güncelleme gerektirebilir.

## 1. Rol Kimliği
- Waylay, keşif yeteneklerini agresif giriş mekanikleriyle birleştiren istihbarat-saldırgan hibrit duelist'tir. Takıma geleneksel duelist'lerin sunamadığı hem frag gücü hem düşman pozisyon bilgisi sağlar.
- Takım kompozisyonu giriş baskısının yanında keşif değeri de gerektirdiğinde Waylay seçilmelidir. Ayrı bir initiator slotu ayıramayan takımlarda Jett veya Reyna yerine Waylay tercih edilir.
- Waylay'in temel kimliği: her site baskınını istihbaratla besleyen, saldırganlığından ödün vermeden daha bilinçli dövüşler alan agresif duelist.
- Diğer duelist'lerden farkı: Waylay'in her dövüşü önceden bilgilendirilmiş dövüştür. Keşif aracı pozisyonu ortaya çıkarır, giriş aracı o pozisyona saldırgan şekilde gider.

## 2. Temel Sorumluluklar
- **Atak tarafı görevleri:** Giriş öncesi keşif odaklı yetenekleri deploy et, sonra agresif araçlarla girişe commit ol. Execute başlamadan önce takıma savunucu pozisyonlarını bildir. Bilgi avantajıyla açılış düellosunu al.
- **Defans tarafı görevleri:** Bilgi araçlarını push'ların erken tespiti için kullan. Keşif-giriş hibrit kit'iyle istihbaratla desteklenmiş güvenli peek'ler al. Toplanan bilgilere dayanarak rotasyon çağrıları yap.
- **Takım beklentisi:** Takım Waylay'den hem açılış kill'leri hem dövüş öncesi bilgi bekler. Kör giren saf duelist'ten farklı olarak, Waylay commit etmeden önce en az bir savunucunun yerini bilmelidir. Saf initiator'dan farklı olarak, Waylay dövüşü alan kişi olmalıdır.

## 3. Sık Yapılan Hatalar
1. **Saf duelist oynayıp keşif araçlarını görmezden gelmek** — Yalnızca agresif yetenekleri kullanan Waylay oyuncuları kit'in bilgi toplama yarısını boşa harcar. Her site baskını istihbaratla başlamalı, sonra saldırganlığa geçmeli.
2. **Saf keşif oynayıp girişten kaçınmak** — Tam tersi hata: bilgiye odaklanan ama dövüşe commit etmeyen oyuncular. Waylay hala duelist'tir. İstihbarat doğrudan agresif oyuna beslemeli.
3. **Yetenekleri yanlış sıralamak** — Bilgi yeteneği önce gelmeli, sonra giriş aracı. Sırayı tersine çevirmek kör giriş demektir ve Waylay'in tüm avantajını sıfırlar.
4. **Yakın mesafede keşife aşırı bağlanmak** — Yakın mesafede bilgi toplama, dövüşmeye harcanması gereken zamanı tüketir. Menzilden keşif, yakında saldırganlık kullan.
5. **İstihbaratı takıma iletmemek** — Waylay'in bilgi değeri paylaşıldığında katlanır. İstihbarat toplayıp çağrı yapmayan oyuncular Waylay'i standart duelist'in kötü versiyonuna indirger.
6. **Tüm kit'i execute öncesi harcamak** — Setup aşamasında tüm cooldown'ları tüketmek, site baskını sırasında Waylay'i araçsız bırakır. Yetenekleri tur boyunca bütçele.
7. **Duelist temellerini ihmal etmek** — Keşif hibrit kimliğine rağmen Waylay hala düel kazanmalı, alan yaratmalı ve ilk teması almalıdır. Bilgi toplama temel duelist işinin yerine geçmez.

## 4. Kalıp -> Anlam

**IF** Oyuncu bilgi topluyor ama kısa süre içinde harekete geçmiyor
**MEANING** Çok pasif oynuyor, Waylay'i duelist yerine initiator olarak kullanıyor
**COUNTER** Bilgi-saldırganlık boru hattını koçla. Keşifin doğrudan takip oyunu olmalı. İstihbarat topla, sonra hemen ortaya çıkan pozisyona peek yap. Bilgi ile peek arası ne kadar kısaysa Waylay o kadar güçlü.
**WHY** Geciken peek, savunucuya yer değiştirme fırsatı verir ve keşifin sağladığı pozisyon bilgisini geçersiz kılar.

**IF** Oyuncu keşif yeteneklerini kullanmadan giriş yapıyor
**MEANING** Standart duelist davranışına geçiyor, Waylay'in bilgi avantajını harcıyor
**COUNTER** Keşif-önce sırasını drill yap. Her girişten önce bilgi aracı deploy edilmeli. İstihbaratsız giriş boşa harcanmış Waylay turu. Custom oyunda her site için "önce tara, sonra peek" rutinini tekrarla.
**WHY** Waylay'in tüm kit değeri bilgilendirilmiş dövüşte yatar; kör giriş onu yetenekleri eksik bir Jett'e dönüştürür.

**IF** Oyuncunun dövüş öncesi bilgi almasına rağmen ilk-kill oranı düşük
**MEANING** İstihbarat nişangah avantajına dönüşmüyor, muhtemelen bilgi aldıktan sonra tereddüt ediyor
**COUNTER** Bilgi ile saldırganlık arasındaki boşluğu minimize et. Peek, düşman hala keşif aracına tepki verirken gelmeli. Savunucu ya tarandığını biliyor (ve hareket ediyor) ya da bilmiyor (ve sen önceden nişanlısın) — her iki durumda da hemen peek et.
**WHY** Tereddüt penceresi büyüdükçe savunucu ya pozisyon değiştirip bilgiyi geçersiz kılar ya da nişangahını keşif aracı yönüne çevirip Waylay'i karşılar.

**IF** Oyuncu sürekli kullanılmamış yeteneklerle ölüyor
**MEANING** Tam kit'i oyun tarzına entegre etmemiş, muhtemelen hibrit doğanın karmaşıklığından bunalmış
**COUNTER** Kit kullanımını iki adıma sadeleştir: önce keşif, sonra giriş. Bu sırayı karmaşıklık eklemeden önce ustalaş. Her tur "tara-peek" mantrasıyla başlasın.
**WHY** Kullanılmamış yeteneklerle ölmek, satın alınan ama hiç ateşlenmeyen silah gibidir — takım ekonomisine ve tur kazanma şansına doğrudan zarardır.

**IF** Waylay'e rağmen takım sürekli bilgi eksikliği yaşıyor
**MEANING** Oyuncu istihbarat iletmiyor veya keşif araçlarını hiç kullanmıyor
**COUNTER** Waylay'in keşifinin takım utility'si olduğunu vurgula. Toplanan her bilgi parçası sesli çağrılmalı, Waylay kişisel olarak harekete geçmeyi planlasa bile. "Bir kişi B'de" çağrısı yapmak taşınan bilgiyi katlara çıkarır.
**WHY** Paylaşılmayan istihbarat yalnızca bir dövüşü etkiler; paylaşılan istihbarat tüm takımın rotasyon ve pozisyon kararlarını iyileştirir.

**IF** Oyuncu bilgi topladıktan sonra peek yerine geri çekilip bilgiyi takıma aktarıyor
**MEANING** Initiator gibi davranıyor, duelist sorumluluğunu almıyor
**COUNTER** Waylay'in bilgi toplaması kendi peek'ini beslemeli. Takım arkadaşlarına istihbarat aktarmak ek bonus ama birincil amaç Waylay'in kendisinin önceden bilgilenmiş düel almasını sağlamak. Bilgi topla, çağır, kendin peek yap.
**WHY** Bilgiyi sadece başkalarına veren Waylay, entry yapmayan bir duelist'tir — takımda hala bir giriş boşluğu kalır.

**IF** Oyuncu her turda aynı site'tan aynı keşif-peek sırasıyla giriyor
**MEANING** Öngörülebilir hale gelmiş, savunucular keşif zamanlamasını ve peek açısını önceden nişanlıyor
**COUNTER** Keşif zamanlamasını ve peek açısını tur bazında değiştir. Bazı turlarda keşifi geciktir, bazılarında farklı site'tan başla. Aynı noktadan üç tur üst üste aynı sırayı tekrarlamak savunucuya hazırlık zamanı verir.
**WHY** Waylay'in bilgi avantajı sürpriz unsuruna bağlıdır; öngörülebilir kalıplar savunucunun keşif deploy anında agresif push yaparak Waylay'i yetenek ortasında yakalamasına yol açar.

**IF** Oyuncu retake sırasında keşif araçlarını hiç kullanmıyor
**MEANING** Keşif araçlarını yalnızca atak tarafı aracı olarak görüyor, defans ve retake değerini kaçırıyor
**COUNTER** Retake öncesi keşif, site'taki düşman pozisyonlarını ortaya çıkararak takımın koordineli giriş yapmasını sağlar. Retake başlamadan önce en az bir keşif aracı deploy et.
**WHY** Retake'te kör giriş yapmak, savunucuların avantajlı pozisyonlarına doğrudan yürümek demektir; keşif bu avantajı nötralize eder.

## 5. Harita Etkileşimleri
- **Haven — S Tier:** Üç site keşif bileşenini ödüllendirir. Waylay hangi site'ı execute edeceğine karar vermeden önce bilgi toplayabilir. C Long'da keşif-peek boru hattı tahmin edilebilir tutma noktalarını cezalandırır. A Long ve Garage'da keşif aracı savunucu dağılımını ortaya çıkararak takım rotasyonunu bilgilendirir.
- **Ascent — S Tier:** Orta kontrol istihbarat destekli saldırganlıktan güçlü şekilde yararlanır. Catwalk ve mid'de keşif yüksek değerli. A Main'de dar choke point keşif-peek döngüsü için ideal geometri sunar. B Main'de tek bir tarama yaygın savunucu pozisyonunu elimine eder.
- **Lotus — A Tier:** Birden fazla açıyla karmaşık düzeni dövüş öncesi bilgi toplamadan yarar sağlar. Dönen kapılarda keşif açık alan bilgisi verir. A Main ve C Main'de keşif-giriş kombinasyonu güçlüdür, ancak B site'ın dar yapısı keşif aracının erken fark edilmesine yol açabilir.
- **Split — A Tier:** A Ramp ve B Main'deki dar koridorlar keşif-peek sırasını ödüllendirir. Orta bölgede bilgi toplamak her iki site'a rotasyon kararını besler. Dar yapı keşif aracının kaçırılmasını zorlaştırır.
- **Breeze — B Tier:** Uzun görüş hatları keşif araçlarını değer üretmeden ifşa edebilir. Açık alan bilgi avantajını azaltır. Waylay'in tara-peek boru hattı ancak Hall ve A Cave gibi kapalı alanlarda güçlü kalır.
- **Fracture — B Tier:** Eş zamanlı çoklu nokta girişleri Waylay'in sıralı keşif-sonra-giriş yaklaşımına tam uymaz. Yine de Arcade ve Dish gibi dar geçişlerde keşif değeri vardır.

## 6. Eşleşme Notları
- **Fade'e karşı — Zor:** Fade, Waylay'in pozisyonunu Haunt ile geri izleyebilir. Her iki ajan da keşif sağlar ama Fade'in keşifi Waylay'in agresif peek'ini geciktirmeye zorlar. Haunt deploy edildiğinde Waylay peek yerine önce trail'i kırmalıdır.
- **KAY/O'ya karşı — Zor:** Suppress, keşif-giriş kombinasyonunu tamamen devre dışı bırakır. KAY/O'nun knife'ı Waylay'in keşif aracı deploy ettiği alanı ortaya çıkarır. NULL/CMD aktifken Waylay saf mekanik düellosuna zorlanır — kit avantajı sıfırlanır.
- **Cypher'a karşı — Güçlü:** Waylay'in dövüş öncesi istihbaratı Cypher'ın tripwire kurulumlarından ve Spycam pozisyonlarından sürpriz unsurunu kaldırır. Sabit sentinel kurulumlarına karşı keşif değeri en yüksek seviyededir.
- **Chamber'a karşı — Güçlü:** Chamber'ın Trademark pozisyonları ve statik Op tutuşları Waylay'in keşifiyle ortaya çıkar. Önceden bilgilenen Waylay, Chamber'ın kaçış mekanizmasını tetiklemeden önce pozisyon avantajı elde eder.
- **Skye'a karşı — Dengeli:** Her iki ajan da keşif-saldırganlık alanında rekabet eder. Skye'ın flash'i ve Trailblazer'ı benzer bilgi-agresyon döngüsü sunar. Üstünlük hangi oyuncunun keşif-peek zamanlamasını daha iyi yönettiğine bağlıdır.
- **Killjoy'a karşı — Güçlü:** Turret yerleştirmeleri ve Alarmbot pozisyonları keşifle ortaya çıkar. Waylay, Killjoy'un savunma kurulumunu tara-peek ile sistematik olarak çözer.

## 7. Oyuncuya Ne Söylenmeli

### İyi performans gösterdiğinde
**Oyuncu Aksiyonu:** Her girişten önce keşif deploy ediyorsun, toplanan istihbaratla anında aksiyon alıyorsun ve swing yapmadan önce savunucu pozisyonlarını takıma çağırıyorsun — duelist saldırganlığını initiator bilgi akışıyla birleştiriyorsun.
**Düşman Algısı:** Savunucular peek yapmadan önce her zaman nerede olduklarını bilen bir duelist görüyor. Nişangahının olağanüstü olduğuna inanıyorlar ama gerçek avantaj her dövüşün önceden nişanlanmış olması — keşifin az önce pozisyonlarını ortaya çıkardığı için.
**Düşman Tepkisi:** Her keşif taraması sonrası yer değiştirmek (kısa ama değerli tur süresine mal oluyor ve hazırlanmış pozisyonları terk ediyorlar) veya tutup pozisyonunu zaten bilen oyuncuya karşı savunmak zorunda kalıyorlar.
**Fırsat Penceresi:** Keşif ortaya çıkarma ile savunucu yer değiştirmesi arasındaki kısa pencere kill penceren. Savunucu ya taranan pozisyonda (önceden nişanlanmış düel) ya da yeni pozisyona hareket halinde (nişangah yerleştirmesi olmayan hareketli hedef).
**Tekrar Stratejisi:** Tur 1: birincil tutma açısını tara, anında peek yap, pozisyonu çağır. Tur 2: birincilden kayanları yakalamak için ikincil açıyı tara. Tur 3: keşifi atla ve kuru-peek yap — tarama için bekleyen savunucuları hız değişikliğiyle cezalandır.
**Düşman Adaptasyonu:** 3-5 turdan sonra savunucular keşifin inmesinden önce önceden yer değiştirecek, taranması zor pozisyonlar oynayacak veya keşif deploy'u sırasında agresif push yaparak seni yetenek ortasında yakalayacak.
**Karşı Adaptasyon:** Önceden yer değiştirdiklerinde: yeni pozisyonları doğrulamak için keşif kullan — taşınsalar bile bilgi hala değerli. Anti-tarama pozisyonlar oynuyorlarsa: o noktaları duelist saldırganlığıyla temizle ve keşifi turun ilerisine sakla. Deploy sırasında push yapıyorlarsa: off-angle tut ve seni yetenek ortasında beklerlerken nişangahına yürümelerine izin ver.

### Zorlandığında
"Tur başına bir rol seç: ya keşifle başla ve girişe commit et, ya da bilgiyle destekle ve takım arkadaşının seni trade etmesine izin ver. İkisini de yapmamak en kötü seçenek. Tara-peek mantrasına dön ve her turu bu sırayla aç."

### Öngörülebilir olduğunda
"Keşif zamanlamanı okuyorlar. Bilgi aracını geciktir veya takip peek'ini önceden nişanlamalarından kaçınmak için farklı açıdan kullan. Aynı noktadan aynı zamanlama ile tarama yapmak seni tahmin edilebilir kılar."

## 8. Rank Modülasyonu

### Düşük Elo (Iron-Silver)
Temel iki adıma odaklan: önce bilgi aracını kullan, sonra savaş. Optimizasyonu düşünme — yalnızca peek etmeden önce istihbarat toplama alışkanlığı oluştur. Öğrendiğin her şeyi takıma çağır. Waylay'i keşif aracı olan bir duelist olarak oyna, tersini değil. Her turda mantra: "tara, çağır, peek."

### Orta Elo (Gold-Platinum)
Keşif ile saldırganlık arasındaki zamanlamayı geliştir — konfor arttıkça ara kısalmalı. İstihbaratı yalnızca kişisel peek'ler için değil tüm takım yararına kullanmaya başla. Her haritada hangi site'ların en yüksek keşif değeri verdiğini öğren. Yetenekleri tur başında hepsini kullanmak yerine tüm tur boyunca sıralama. Retake senaryolarında keşif aracı kullanmayı alışkanlık haline getir.

### Yüksek Elo (Diamond-Ascendant)
Bilgi-aksiyon boru hattını anında olacak şekilde ustalaş. Keşifi adaptif kullan: kimi turda kişisel giriş için, kimi turda takım koordinasyonu için. Keşif araçlarını inkar etmeye veya yem olarak kullanmaya çalışan düşman takımlara karşı karşı-oyun geliştir. Waylay'in bu ranktaki pick değeri disiplinli kit kullanımına bağımlıdır.

### Elit (Immortal-Radiant)
Waylay'in hibrit rolünün saf duelist veya saf initiator'dan ne zaman daha fazla değer kattığı konusunda meta-seviye okumalara odaklan. Yetenek sıralaması her turda düşman savunma ayarlamalarına göre optimize edilmeli. Keşif zamanlaması kalıp okumalarını önlemek için değişmeli. Bu rankte Waylay'in bilgi değeri frag değerini aşabilir — her ikisinin de teslim edildiğinden emin ol. Rakip takımın Waylay'e özgü karşı taktiklerini round bazında oku ve kit kullanımını buna göre ayarla.
