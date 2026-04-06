# HAVEN — Detaylı Strateji ve Analiz

> PATCH-SENSITIVE NOTE: Haven, oyundaki nadir 3-site haritalardan biri. 3 site olması savunma kaynak dağıtımını ve saldırı karar ağacını kökünden değiştirir. Meta her patch'te evrilir ama 3-site temelleri sabit kalır.

## 1. Temel Prensipler
- Haven 3 site barındıran (A, B, C) nadir haritalardan biri — bu yapı savunmayı 5 kişiyle 3 noktayı tutmak zorunda bırakır ve her zaman en az bir site yapısal olarak zayıf kalır
- Garage/Mid bölge haritanın merkezi — Garage kontrolü hem B Window hem C Connector'a erişim sağlar; mid'i kaybeden takım haritanın yarısını kaybeder
- Saldırı temelleri: 3 site = 3 farklı execute seçeneği; bu avantajı kullanmak için bilgi toplama ve fake play'ler zorunlu. Tek bir site'a her round gitmek seni okunabilir yapar ve savunmanın işini kolaylaştırır
- Savunma temelleri: 5 kişiyle 3 site tutmak matematiksel olarak her zaman bir açık bırakır. Savunmanın gücü bilgi akışında — hangi site'in tehdit altında olduğunu erken anlamak rotate kalitesini belirler
- Tempo prensipleri: Saldırı tarafında yavaşça oyna, bilgi topla, sonra tek bir noktaya commit et. Savunmada over-rotate etme — bir site'a 3 kişi döndüğünde diğer iki site boş kalır ve rakip bunu cezalandırır. Haven'da en büyük hata over-rotation

## 2. Ölüm Bölgeleri
- **A Long**: Haven'ın en uzun sightline'larından biri. Burada ölen oyuncular Op'a kuru peek atıyorlar ya da smoke olmadan ilerliyor. Koçluk bağlamında: A Long'da ölen oyuncu utility disiplini eksikliği gösteriyor — flash veya smoke olmadan A Long'a girmek intihardır.
- **B Main Girişi**: B site'in tek ana girişi dar ve kısa bir koridordur. Buraya yığılmak savunucuya çoklu kill fırsatı verir. Burada ölen oyuncular girişin darlığını hafife alıyor — tek sırada giriyorlar ve savunucu hepsini sırayla vuruyor.
- **Garage/Mid Window**: Garage bölgesinde ölümler iki yönlü çalışır. Saldırı tarafında Garage'a utility olmadan girmek savunucunun Window'dan seni vurması demek. Savunma tarafında gereksiz peek atmak saldırganın seni pick'lemesi demek. Her iki tarafta da buradaki ölümler bilgi almadan hareket etme alışkanlığına işaret eder.
- **C Long Cross**: C Long'dan site'a girerken Plat'tan gelen crossfire oyuncuları yakalayan bir ölüm bölgesi. Burada tekrar eden ölümler smoke kullanmadan cross yapma hatasını gösterir — Plat'ı smoke'lamadan C site'a girmek savunucuya bedava bir kafa vuruşu hediye eder.
- **B Window/Connector Geçişi**: Mid'den B'ye veya C'ye geçiş yaparken Window bölgesinde yaşanan ölümler. Bu bölgede ölen oyuncular geçişi kontrol etmeden yapıyorlar — Window'dan peek atan savunucu geçiş yapan herkesi tek tek indirir.

## 3. Pattern -> Meaning Eşleşmesi

**Pattern 1: A Long Kuru Peek Ölümleri**
IF: Oyuncu A Long'da utility kullanmadan ilerliyor — smoke veya flash olmadan uzun sightline'a peek atıyor
MEANING: Sightline disiplini yok. A Long, Haven'ın en uzun hatlarından biri; burada savunucu Op veya Vandal ile pre-aim yapıp bekliyor. Utility olmadan bu hatta girdiğinde savunucunun seni görmesi ve ateş etmesi için gereken süre senin tepki süresinden çok daha kısa. Modelin koridorun tamamında görünür oluyor ve savunucu için kolay bir hedef haline geliyorsun.
COUNTER: A Long'a girmeden önce smoke at — sightline'ın orta noktasını kes. Ardından flash at ve flash'ın patlamasıyla eş zamanlı swing yap. Smoke savunucunun görüş hattını koparır, flash onu açıktan çıkarır. Op tutan savunucuya karşı ise Jett dash veya Neon slide ile hızlı geçiş yap — sabit hedef olma.
WHY: Uzun sightline'lar savunucu avantajını maksimize eder çünkü savunucu seni görmeye başladığı an ile sen onu gördüğünde ateş edecek pozisyona gelmeni arasında geçen süre savunucunun lehinedir. Utility bu denklemi bozar: smoke görüş hattını keser ve savunucuyu ya pasif kalmaya ya da smoke'un içinden push etmeye zorlar; flash ise savunucunun aim'ini resetler ve sana güvenle peek atma penceresi açar.

**Pattern 2: B Main Yığılma Ölümleri**
IF: Takım B Main girişinde aynı anda 2-3 kişi kaybediyor — dar girişten sırayla giriyor ve savunucu hepsini tek spray'de vuruyor
MEANING: Dar giriş disiplini yok. B Main Haven'ın en dar choke point'lerinden biri — savunucu tek bir açıdan tüm girişi kontrol edebilir. Takım olarak bu girişten sırayla girmek savunucuya çoklu kill fırsatı veriyor çünkü her oyuncu aynı sightline'a giriyor.
COUNTER: B execute yaparken iki yönden gir: B Main'den 2 kişi utility ile girerken, Mid Window'dan 1-2 kişi destek ateşi açsın. B Main girişi öncesinde molly veya smoke ile savunucunun pozisyonunu kırdır. Flash + entry combo kullan — ilk oyuncu flash atar, ikinci oyuncu flash patlamasıyla girer. Aynı anda girmek yerine zamanlama farkı bırak.
WHY: Dar girişler savunucuya çoklu kill potansiyeli verir çünkü her oyuncu aynı sightline'dan geçer. Split yaklaşım savunucuyu iki yön arasında seçim yapmaya zorlar — tek bir açıya odaklanamaz. Zamanlamayı kademeli yapmak ise tek bir spray'in birden fazla kişiyi vurması olasılığını düşürür. Window desteğiyle savunucunun odağını dağıtırsın ve B Main girişi çok daha güvenli hale gelir.

**Pattern 3: Garage Kontrolü Kaybetme**
IF: Takım Garage kontrolünü round başında kaybediyor — ne utility atıyor ne de bilgi alıyor, Garage'i tamamen ihmal ediyor
MEANING: Harita kontrolü anlayışı eksik. Garage Haven'ın merkezi — B Window ve C Connector'a bağlantı sağlar. Garage'i boş bıraktığında rakip hem B'ye hem C'ye split yapma opsiyonunu bedavaya kazanır. Ayrıca flank yolu olarak Garage kontrolsuz kalırsa savunma tarafında arkadan gelecek tehditleri görmezden geliyorsun.
COUNTER: Saldırı tarafında: round başında 1-2 kişi Garage'a utility gönder — smoke + flash combo ile Garage girişi yap veya en azından bilgi al. Sova recon bolt veya Fade haunt ile Garage'da kim var öğren. Savunma tarafında: Garage Window'dan bilgi al ama gereksiz peek atma. Sentinel utility (Cypher tripwire, Killjoy turret) Garage girişine koy — saldırı geldiğinde erken uyarı alırsın. Sage wall ile Garage girişini geciktir.
WHY: Mid kontrol Haven'da diğer haritalardakinden daha fazla anlam taşır çünkü 3 site var ve Garage bu sitelerin ikisine doğrudan erişim sağlar. Garage'i kontrol eden takım rotasyon hızında ve split opsiyonlarında büyük avantaj kazanır. Garage'i ihmal etmek haritanın yarısını rakibe teslim etmek demek — ve 3-site haritada bu, savunmanın tamamen dağılması anlamına gelir.

**Pattern 4: Over-Rotation Hatası**
IF: Savunma tarafında bir site'a 3+ kişi rotate ediyor — diğer site'lar tamamen boş kalıyor ve rakip fake'ten sonra boş site'a spike dikıyor
MEANING: Bilgi doğrulama eksik. Haven'da over-rotation en büyük ve en yaygın hata çünkü 3 site varken rotate kararları çok karmaşık. Oyuncu ses veya tek bir utility ipucuyla panikleyip rotate ediyor ama bu bilgiyi doğrulamıyor. Rakip bir site'a utility atıp ses çıkararak fake yapıyor, sonra boş kalan site'a execute ediyor.
COUNTER: Rotate etmeden önce bilgiyi doğrula. Tek bir ses veya tek bir utility görmek yeterli değil — en az 2 farklı bilgi kaynağı (görüş, ses, utility, minimap) rotate kararını desteklemeli. B anchor'ı özellikle yerinde tutmayı öğret — B'den rotate etmek B'yi tamamen boş bırakır ve rakip bunu cezalandırır. Rotate eden kişinin yerine bir başkasının kayma sistemi kur: A'dan rotate ediyorsan, mid'deki oyuncu A'ya kaysın.
WHY: 3-site haritada rotate mesafeleri uzun ve her rotate kararı iki site'i etkiler. Over-rotate ettiğinde boş kalan site'a rakip 5 kişiyle girebilir ve retake çok zor olur. Bilgi doğrulama bu döngüyü kırar: fake'i gerçek execute'tan ayırabilirsen doğru sayıda kişiyi doğru yere gönderirsin. Haven'da "az rotate et, geç rotate et" prensibi "çok rotate et, erken rotate et"ten her zaman daha güvenlidir.

**Pattern 5: C Long Cross Ölümleri**
IF: Oyuncu C Long'dan site'a geçerken Plat'tan veya CT'den vuruluyor — cross noktasını smoke'lamadan geçiyor
MEANING: Cross disiplini yok. C Long'dan C site'a giriş yaparken Plat yüksek bir pozisyon ve savunucu oradan aşağı bakıyor. Smoke olmadan bu geçişi yapmak savunucuya tamamen açık bir hedef sunuyor — sen koşerken o sabit durup ateş ediyor.
COUNTER: C Long cross öncesinde Plat'ı ve CT spawn çıkışını smoke'la. Ardından flash at ve takım olarak site'a gir. C Garage split kullan: 2 kişi C Long'dan girerken 2 kişi Garage üzerinden C Connector'dan girer — savunucu iki yöne birden bakmak zorunda kalır. Tek başına C Long'dan site'a girmeye çalışma, her zaman destek iste.
WHY: Yükseklik avantajı savunucuya aim kolaylığı ve görüş genişliği verir. Plat'taki savunucu aşağı bakan bir açıya sahip — sen yatay hareket ederken o aşağı bakarak kolayca vurabilir. Smoke bu yükseklik avantajını nötralize eder çünkü savunucu seni göremez. Split yaklaşım ise savunucuyu iki açıya birden bakmak zorunda bırakır ve odağını dağıtır.

**Pattern 6: B Anchor İzolasyonu**
IF: B anchor oyuncusu yardım istemeden veya komünikasyon kurmadan tek başına ölüyor — takım B'ye rotate gelemeden anchor düşmüş oluyor
MEANING: Komünikasyon ve geciktirme becerisi eksik. B site'i Haven'da solo tutmak en zor görev — tek giriş, dar alan ve savunucunun yedeği uzakta. B anchor eğer utility ile geciktirme yapmazsa ve takıma bilgi vermezse, 1v2 veya 1v3 durumuna düşer ve kaybeder.
COUNTER: B anchor her zaman sentinel olmalı (Killjoy veya Cypher). Turret/tripwire ile erken uyarı al ve utility ile girişleri geciktir. İlk temas anında takıma "B'de adam var" bilgisini ver — rotate için zaman kazandır. Eğer push geliyorsa site'in önünde değil arkasında oyna (B Back pozisyonu) ve utility ile zaman kazan. Killjoy lockdown B site için özel tasarlanmış gibi çalışır — execute'u tamamen durdurabilir.
WHY: B anchor'ın görevi kill almak değil, zaman kazanmak ve bilgi vermek. Takım 3 site tutarken B'ye en az kaynak ayırır — bu yüzden B anchor'ın hayatta kalıp bilgi akışı sağlaması rotate'un zamanında gelmesi için şart. Sentinel utility olmadan B tutmak neredeyse imkânsız çünkü execute geldiğinde yalnızsın ve yardım en az 5-8 adım uzakta.

**Pattern 7: Tek Site'a Tekrarlayan Execute**
IF: Saldırı tarafında takım her round aynı site'a execute yapıyor — rakip bunu okuyor ve o site'i stack'liyor
MEANING: Strateji çeşitliliği yok. Haven 3 site sunuyor ama takım sadece birini kullanıyor — bu 3-site avantajını tamamen çöpe atıyor. Rakip 2-3 round sonra nereye geleceğini biliyor ve o site'i 3-4 kişiyle stack'liyor.
COUNTER: Her yarım içinde en az 2 farklı site'a execute yap. Arada fake play kullan — bir site'a utility at, ses çıkar, sonra başka bir site'a rotate et. Haven'da fake play'ler son derece güçlü çünkü rotate mesafeleri uzun ve savunma 3 site arasında bölünmek zorunda. Round planı: 1. round A execute, 2. round B execute, 3. round C fake + A rotate gibi bir döngü oluştur.
WHY: 3-site haritada saldırının en büyük avantajı seçim zenginliği. Tek bir site'a bağlanmak bu avantajı yok eder ve savunmaya kaynaklarını odaklama imkânı verir. Çeşitlilik savunmayı tahmin edemez kılar — 3 site arasında dağılım yapmak zorunda kalan savunma her site'ta daha zayıf kalır. Fake play'ler bu etkiyi ikiye katlar çünkü savunma gerçek tehdidi ayırt edemez ve rotate kararları hata yapmaya müsait olur.

**Pattern 8: Post-Plant Pozisyon Hatası**
IF: Oyuncu post-plant'te spike'a çok yakın pozisyon alıyor — savunucunun molly veya nade'i ile spike'la birlikte ölüyor
MEANING: Post-plant mesafe yönetimi yok. Spike dikildikten sonra spike'ın hemen yanında durmak savunucunun alan inkar utility'sini sana da uygulaması demek. Molly, nade veya Killjoy lockdown spike bölgesini temizlerken sen de o bölgede olduğun için ölüyorsun.
COUNTER: Spike dikildikten sonra spike'tan uzaklaşarak crossfire pozisyonu al. Haven'da ideal post-plant pozisyonları: A site'ta A Long + A Short crossfire (spike'i iki yönden izle), B site'ta B Main + Mid Window crossfire, C site'ta C Long + Garage crossfire. Spike'i duyma mesafesinde ol ama doğrudan yanında durma — savunucunun defuse'u başladığını duyunca peek at.
WHY: Post-plant'te amaç spike'i korumak, spike'ın yanında olmak değil. Mesafe sana iki avantaj verir: savunucunun alan inkar utility'si seni etkilemez ve crossfire pozisyonundan peek attığında savunucu iki yönü birden kontrol edemez. Spike'a yakın durmak savunucunun işini kolaylaştırır çünkü tek bir molly hem spike'i hem seni etkiler.

**Pattern 9: A Heaven'da Değişmez Pozisyon**
IF: Savunucu A Heaven'da her round aynı açıyı tutuyor — 3-4 round üst üste aynı pozisyonda olup ölmeye başlıyor
MEANING: Pozisyon çeşitliliği yok. A Heaven güçlü bir yükseklik avantajı sunar ama rakip bu pozisyonu öğrendikten sonra pre-aim yapar, flash atar veya utility gönderir. Güçlü pozisyonlar tekrarlanınca zayıf pozisyonlara dönüşür.
COUNTER: A Heaven ile A Hell (site altı), A Short ve A site zeminindeki pozisyonlar arasında döngü yap. Bir round Heaven'dan kill aldıysan sonraki round Hell'e veya site zeminine in — rakip Heaven'ı pre-aim edecek ve seni bulamayacak. Heaven'ı sürpriz pozisyonu olarak kullan, varsayılan pozisyon olarak değil. Off-angle'ları rotation içine sok: 2 round Heaven, 1 round Hell, 1 round agresif A Short peek.
WHY: Off-angle'lar güçlerini beklenmedik olmalarına borçlu. Rakip bir pozisyonu öğrendiğinde o pozisyon one-trick haline gelir — pre-aim + flash combo ile kolayca temizlenir. Pozisyon rotasyonu rakibi her round birden fazla açı kontrol etmeye zorlar ve bu bilişsel yük onların entry hızını düşürür ve tereddüt yaratır.

**Pattern 10: Eco Round Disiplin Kaybetme**
IF: Takım eco round'da dağılıp farklı farklı yerlerde tek başına ölüp kaybediyor — koordinasyonsuz bireysel play'ler yapıyor
MEANING: Ekonomi disiplini yok. Eco round'da amaç ya tam save yapmak ya da koordineli bir rush ile bir site'i ele geçirmek. Dağınık bireysel play'ler ne save yapar ne round kazanır — sadece kredi israf eder.
COUNTER: Eco round'da iki opsiyondan birini seç: tam save (herkes geri çekil, elde ne varsa sakla) veya koordineli rush. Haven'da en iyi eco rush B site üzerindendir — B girişi dar ama en az utility gerektiren execute budur. Sheriff ile Garage üzerinden agresif play de güçlü çünkü dar koridor Sheriff'in tek vuruş potansiyelini artırır. Takım olarak tek bir karar al ve herkes aynı planı uygulasın.
WHY: Eco round'da bireysel oynamak kaynakları boşa harcar çünkü herkes farklı yerde olup farklı planları dener. Koordineli hareket eco round'un kazanma şansını maksimize eder çünkü sayı avantajı tek bir noktada yoğunlaşır. Dağınık play'de rakip seni birer birer yok eder; koordineli rush'ta ise bir site'i alırsan round kazanma şansın var.

## 4. Taraf Bazlı Hatalar

### Saldırı
- Garage'i ihmal etmek — Garage kontrolü almadan execute yapmak saldırı opsiyonlarını tek boyutlu kılar; Garage Haven'ın anahtarı ve onu kullanmamak 3-site avantajını çöpe atar
- Her round aynı site'a gitmek — rakip seni okuyor ve stack'liyor; 3 site var, kullan. Execute çeşitliliği olmadan Haven'da saldırı tarafında başarılı olmak neredeyse imkânsız
- B Main'e yığılmak — dar girişten 3-4 kişi aynı anda girmek savunucuya çoklu kill fırsatı verir; B execute her zaman Window split ile yapılmalı
- Fake play kullanmamak — Haven fake play için yaratılmış bir harita; bir site'a utility at, ses çıkar, sonra başka bir site'a dön. Bu stratejiyi kullanmayan takım Haven'ın yapısal avantajını çöpe atıyor
- A Long'a kuru peek atmak — uzun sightline'a utility olmadan girmek savunucuya bedava kill vermek demek; her A Long push'undan önce smoke + flash zorunlu
- Mid-round karar gecikmesi — 3 site bilgi toplama gerektirir ama toplanan bilgiyle hızlı karar vermek şart; bilgi topla ama commit'i geciktirme

### Savunma
- Over-rotation — Haven'ın en büyük savunma hatası. Bir site'a 3 kişi göndermek diğer iki site'i boş bırakır ve rakip fake'ten sonra boş site'a girer. Rotate etmeden önce bilgiyi doğrula
- B anchor'ı desteksiz bırakmak — B anchor yalnız kalacak, bunu bilerek sentinel ve utility ataması yap. B'ye support gelmiyorsa B anchor stres altında erir ve bilgi akışı kesilir
- Garage kontrolünü gereksiz peek'le kaybetmek — Garage Window'dan bilgi almak için peek atıyorsun ama fazla ileri çıkıp ölüyorsun. Window'dan görüş açını kullan ama bedenini açma
- Retake koordinasyonsuzluğu — Haven'da retake özel bir zorluk taşır çünkü rotate mesafeleri uzun. Retake'e giren oyuncular farklı zamanlamalarda gelir ve rakip onları tek tek yok eder. Retake her zaman utility ile başlamalı ve takım olarak aynı anda girilmeli
- Eco round'da agresif oynayıp ölmek — avantajlı round'da gereksiz risk almak ekonomiyi bozmak demek. Eco'ya karşı spread oyna, Sheriff tek vuruş riskine karşı mesafe koru

## 5. Kompozisyon / Harita Etkileşim Notları
- **Omen**: Haven'da S-tier controller. Shrouded Step ile Garage'da bilgi toplama, B Heaven'a TP ile sürpriz pozisyon, Paranoia ile dar koridorları kontrol etme. 3 site arasında smoke'ları esnek dağıtıyor — tek smoke controller'ları Haven'da zorlanır ama Omen'in iki smoke'u ve recharge mekaniği bu sorunu çözer
- **Killjoy**: B anchor için en iyi ajan. Turret + Alarmbot + Nanoswarm ile B site'i tek başına tutabilir. Lockdown B site için özel tasarlanmış gibi çalışır — dar alanı tamamen kontrol eder ve execute'u durdurur. Haven'da Killjoy olmadan B tutmak ciddi bir dezavantaj
- **Sova**: Recon Bolt ile 3 site'in herhangi birinde round başı bilgi toplama. Haven'ın açık alanları Sova'nın oklarının ve drone'unun tam potansiyeliyle çalışması için ideal. A Long ve C Long recon bolt'ları savunmanın ilk bilgi katmanı olarak kullanılır
- **Breach**: B Main'den flash + Aftershock combo ile B site'i açma. Haven'ın dar koridorları Breach'in stun ve flash'lerinin kaçınılmaz olması demek. Aftershock duvar arkasına atar, oyuncu pozisyonu terk etmek zorunda kalır
- **Jett**: C Long agresif Op oyunu için ideal. Dash ile kill aldıktan sonra geri çekilme — Haven'ın uzun sightline'ları Op için cennet ve Jett'in kaçış mekaniği bu stili mümkün kılar. A Long'da da Op oynayabilir ama C Long pozisyonu daha güvenli çünkü geri çekilme hattı daha kısa
- **Cypher**: B'de Killjoy alternatifi. Tripwire + Camera ile B girişi ve Garage bilgisi aynı anda sağlar. Killjoy'dan farkı: Cypher bilgi ağırlıklıyken Killjoy geciktirme ağırlıklıdır. Cypher ayrıca flank izleme konusunda üstün — Haven'ın çok girişli yapısında flank izleme çok değerli
- **Harbor**: Haven'da A-tier. High Tide duvarı C Long'dan A'ya kadar çekilebilir ve birden fazla sightline'ı tek ability ile keser. Cascade Garage push için mükemmel — dar koridorda su duvarı kaçınılmaz. Cove ile spike dikme alanı koruma. Haven'ın büyük açık alanları Harbor'ın duvarlarının tam değerini göstermesi için ideal
- **Astra**: Stars mekaniği ile 3 site'i tek ajan olarak kontrol edebilir. Garage deny, A Long kontrol ve C Long sightline kesme hepsini aynı round'da yapabilir. Macro oyuncular için ideal — Haven'da Astra'nın tavanı çok yüksek ama tabanı da çok düşük

## 6. Koçluk Satırları
- "Haven 3 site sunar ama sen sadece birini kullanıyorsan, 2-site haritası oynuyorsun demektir — ve rakibin bunu öğrendiği andan itibaren kaybetmeye başlıyorsun."
- "Garage Haven'ın kalbi. Garage'i kontrol eden haritayı kontrol eder, Garage'i ihmal eden haritanın yarısını rakibe teslim eder."
- "B anchor'ın görevi kill almak değil, hayatta kalmak ve bilgi vermek. Ölürsen takım kör kalır."
- "Over-rotation Haven'da en çok round kaybettiren hata. Bir site'a koşan herkes boş site'a dikilen spike'ı izlemek zorunda kalır."
- "Fake play yapma becerisi Haven'da rank atlamanın en hızlı yolu. Bir site'a utility at, ses çıkar, sonra dön ve boş site'a gir."
- "Post-plant'te spike'ın yanında durma. Mesafe seni molly'den korur, crossfire seni kazandırır."
- "A Long'a kuru peek atmak, savunucuya hediye vermek demektir. Utility at, sonra peek at. Her zaman."
- "Haven'da eco round disiplini diğer haritalardan daha fazla anlam taşır — 3 site'a dağılan eco takım hiçbir şey başaramaz."
- "Rotate kararını vermeden önce iki farklı bilgi kaynağı bekle. Tek bir ses fake olabilir."
- "C Long cross'u smoke'suz geçmek rulettir. Plat'taki savunucu seni bekliyor — smoke at, sonra geç."

## 7. Rank Modülasyonu
- **Iron-Silver**: Oyuncular haritanın 3 site olduğunu bilir ama bunun ne anlama geldiğini kavramaz. Her round aynı site'a gider, Garage'i tamamen ihmal eder, rotate kavramı yoktur. Koçluk odağı: temel harita bilinci — Garage'ın nereye bağlandığını öğret, her yarımda en az 2 farklı site'a execute yapma alışkanlığı kazandır. B anchor'a sentinel ata ve "utility at, bilgi ver, hayatta kal" döngüsünü öğret. Bu seviyede tek bir alışkanlık değişikliği — Garage kontrolü almak — round kazanma oranını sert şekilde artırır.
- **Gold-Platinum**: Oyuncular site'ları bilir ve temel execute kalıpları vardır ama over-rotation, fake play eksikliği ve post-plant pozisyon hataları yoğundur. Koçluk odağı: bilgi doğrulama — rotate etmeden önce iki farklı bilgi kaynağı bekleme alışkanlığı kazan. Fake play'leri repertuara ekle: "A'ya smoke at, C'ye git" gibi temel fake kalıplarını öğret. Post-plant'te spike'tan uzaklaşmayı ve crossfire pozisyonu almayı öğret. B anchor'ın komünikasyon kalitesini artır — "kaç kişi, hangi utility, ne kadar hızlı" bilgisini net ver.
- **Diamond-Ascendant**: Oyuncular temel stratejileri bilir ama round-to-round adaptasyon eksiktir. Aynı default'u her round tekrarlar ve rakip okuyunca saç acar. Koçluk odağı: varyasyon ve adaptasyon — her 2-3 round'da default'u değiştir, agresif ve pasif Garage kontrolü arasında geç, A Long'da Op ile C Long'da Op arasında döngü yap. Anti-strat okuma: rakibin hangi site'i stack'lediğini anla ve diğer site'a git. Mid-round karar hızı: bilgiyi topla ve hızla commit et, bekleme. Timeout kullanmayı öğret — Haven'da momentum çok güçlü ve bir timeout ile kırabilirsin.
- **Immortal-Radiant**: Haven bu seviyede satranç oyununa dönüşür. Her round bir önceki round'un bilgisine göre şekillenir. Koçluk odağı: anti-strat derinliği — rakibin default'unu oku ve onu boş site'a yönlendirecek fake dizayn et. Post-plant lineup mastery: Viper, Brimstone veya KAY/O lineup'ları ile spike'i uzaktan koru. Ekonomi optimizasyonu: hangi round'da hangi utility'yi save edip hangi round'da kullanacağını planla. Takım olarak rotate hızını ölç ve pratikte geliştir — Haven'da rotate zamanlama farkı round kaybetme ile kazanma arasındaki çizgiyi belirler. Execute çeşitliliğini data ile destekle: hangi site'ta kazanma oranın düşük, orayı pratikte geliştir.

## 8. Ekonomi ve Satın Alma Stratejileri
- 3 site olduğu için utility zorunluluğu yüksek — tam buy'da utility eksik bırakmak Haven'da diğer haritalarda olduğundan daha çok cezalandırılır çünkü her site'a utility gönderemen gerekiyor
- B anchor'a sentinel atamak utility maliyetini düşürür — Killjoy veya Cypher'ın kendi utility'si B'yi tutmaya yeter, takım utility'sini A ve C'ye yönlendirebilirsin
- Force buy stratejisi: B rush en az utility gerektiren execute — dar giriş sadece 1-2 flash ve 1 smoke ile açılabilir. Force buy round'larında B'yi hedefle
- Eco round: Garage üzerinden agresif play en iyi eco stratejisi — dar koridor Sheriff'in tek vuruş potansiyelini artırır ve yakın mesafe savaşı silah dezavantajını azaltır. Takım olarak Garage'dan B Window'a push et
- Bonus round (kazanılan eco sonrası): utility save et, silah avantajını kullan. Rakibin eco'da Sheriff veya Spectre ile geleceğini bil — spread oyna ve mesafe koru
- Anti-eco: Spread oynamamak büyük hata — 3 site'a dağılın, Sheriff tek vuruş riskine karşı kalabalık olmayın. Anti-eco'da yığılmak bedava round'u kaybettiren en yaygın neden

## 9. Post-Plant Stratejileri
- **A Site Post-Plant**: Spike'ı A Default'a (kutu arkası, Heaven'dan korunur) dik. Post-plant pozisyonları: A Long + A Short crossfire. Heaven'ı smoke'la — retake eden savunucu Heaven'dan bakamaz. Defuse sesini dinle, erken peek atma. Lineup biliyorsan A Long'dan molly at
- **B Site Post-Plant**: Spike'ı B Default'a (ortada) dik. Post-plant pozisyonları: B Main + Mid Window crossfire. B Back'i izle — retake oradan gelir. B'de post-plant en zorlaştırıcı çünkü alan küçük ve retake mesafesi kısa. Lineup'lar çok değerli — Viper veya Brimstone molly ile spike'i uzaktan koru
- **C Site Post-Plant**: Spike'ı C Default'a (kutularının arkası) dik. Post-plant pozisyonları: C Long + Garage crossfire. Plat'ı smoke'la — retake eden savunucu Plat'tan bakamaz. C'de post-plant güçlü çünkü crossfire açılarının arasındaki mesafe uzun ve savunucu ikisini birden kontrol edemez
- Haven'da post-plant lineup'lar diğer haritalarda olduğundan daha değerli çünkü 3 site = rotate mesafesi uzun = savunucunun retake'e gelmesi uzun sürer = spike için daha fazla zaman kazanırsın. Lineup öğrenmeye yatırım yap
- Spike'ı dinleme prensibi: defuse sesi duyunca peek at, öncesinde peek atma. Haven'da retake eden savunucu uzaktan gelir ve yorgun — acelessiz ol, pozisyonunu koru

## 10. Anti-Strat Kalıpları
- Rakip her round A Long push yapıyorsa: Op + Cypher tripwire A Long'a koy + agresif A Short flank oyna. Push'u Op ile durdur, tripwire ile erken uyarı al, A Short'tan flank ile arkalarından gel
- Rakip Garage kontrolü alıyorsa: Sage wall Garage girişi + Window'dan erken agresyon. Wall ile Garage'i fiziksel olarak kapat, Window'dan peek atarak wall'un arkasındaki hareketi izle
- Rakip B rush yapıyorsa: Killjoy lockdown + double stack B. Lockdown execute'u tamamen durdurur, double stack ile sayı avantajı kazan. İki round double stack yaptıktan sonra bir round normal dağıl — rakip adapte olmasın
- Rakip C Long Op oynuyorsa: 5 flash execute — flash yağmuru ile Op'u etkisiz hale getir. Omen Paranoia + Breach flash + duelist flash combo ile C Long'u kapat. Op'a karşı kuru peek atma, her zaman flash ile conte et
- Rakip lurk-heavy oynuyorsa: flank watch utility zorunlu. Cypher tripwire veya Killjoy alarmbot flank yollarına koy. Haven'da flank yolları çok — Garage, A Short, C Connector hepsi flank için kullanılır. Lurk okuyunca utility'yi flank yoluna taşı
- Rakip her round default oynuyorsa: agresif bilgi toplama ile default'u kırdır. Round başında Sova drone veya Fade haunt ile rakibin dağılımını öğrenin — kalabalık olmayan site'a hızlı execute yap. Default'u kırmak için erken bilgi şart
- Rakip retake-heavy oynuyorsa (site'ları erken teslim edip retake ile geri alıyor): post-plant pozisyonlarını güçlendir ve lineup'lar öğren. Retake oynayan rakibe karşı spike dikildikten sonraki pozisyon kalitesi round'u belirler. Crossfire kur ve defuse sesini bekle

## 11. Ajan Sinerjileri ve Takım Kompozisyonları
- **Meta Comp (Omen + Killjoy + Sova + Breach + Jett)**: Haven'ın en dengeli comp'u. Omen smoke ile 3 site kontrolü, Killjoy B anchor, Sova bilgi toplama, Breach dar girişleri açma, Jett entry ve Op. Bu comp'un gücü her role'un Haven'ın yapısına özel olarak uyması
- **Double Controller (Omen + Harbor)**: Harbor'ın High Tide duvarı + Omen smoke ile aynı anda birden fazla sightline kesilir. C Long'dan A'ya uzanan Harbor duvarı + Omen smoke Garage = haritanın büyük bölümü kontrol altında. Bu comp utility-heavy ve execute kalitesi çok yüksek ama duelist eksikliği entry'de bireysel performansa bağımlılık yaratır
- **Agresif Comp (Jett + Breach + Omen + Sova + Cypher)**: C Long agresif Op (Jett) + Breach flash ile A/B push + Cypher flank izleme. Bu comp erken pick'ler ile oyun açmaya odaklı — pick alınamazsa default'a dön ve bilgi topla
- **Sentinel-Heavy (Killjoy + Cypher + Omen + Sova + Jett)**: Savunma tarafında güçlü — Killjoy B anchor, Cypher A veya C flank izleme + Garage bilgisi. 3 site'i sentinel utility ile doldurmak savunmada büyük avantaj verir ama saldırı tarafında entry gücü düşük — Jett'in bireysel performansına bağımlı
- **Ajan Bazı Sinerji Notları**:
  - Sova Recon + Breach Flash: Recon ile pozisyon bul, Breach flash ile oyuncuyu çıkart. Bu combo Haven'ın her site'ında çalışır
  - Killjoy Lockdown + Takım Execute: Lockdown'ı site'a at, savunucular geri çekilmek zorunda kalır, takım bedavaya girer. B site'ta özel olarak güçlü
  - Omen TP + Jett Op: Omen B Heaven'a TP ile geçip bilgi alır, Jett C Long'da Op tutar. İki farklı site'ta aynı anda baskı yaratır
  - Harbor High Tide + Execute: High Tide ile uzun bir duvar çek, arkasından takım olarak site'a gir. A Long veya C Long execute'larında smoke'tan daha geniş koruma sağlar
  - Cypher Cam + Takım Rotate: Cypher kamerasını bir site'a bırakır ve takımla başka site'a gider — kamera bilgi vermeye devam eder ve rotate kararını destekler. Haven'da 3 site olduğu için uzaktan bilgi alma çok değerli
