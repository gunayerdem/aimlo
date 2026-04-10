# FRACTURE — Detaylı Strateji ve Analiz

> PATCH-SENSITIVE NOTE: Fracture, Valorant tarihinin en benzersiz harita tasarımına sahip. Çifte spawn yapısı ve zip line mekaniği nedeniyle meta değişimleri diğer haritalara göre daha hızlı yansır.

## 1. Temel Prensipler
- Fracture, iki ayrı saldırgan spawn noktası (Attacker Side Dish ve Attacker Side Hall) ile tasarlanmış tek haritadır — savunucuları her iki yönden kuşatma üzerine kurulu bir felsefe
- Defender spawn ortada yer alır, saldırganlar haritanın çevre hattında konumlanır; bu da savunma tarafını sürekli baskı altında tutar
- Saldırı temelleri: Her site'a en az iki farklı girişten ulaşabilirsin. Bu avantajı kullanmayan takım, Fracture'in sunduklarının yarısını çöpe atar. Split execute — yani iki farklı yönden eş zamanlı giriş — bu haritanın ana stratejisi
- Savunma temelleri: Defender olarak tek bir giriş noktasını tutmak yetmez. Her site'in birden fazla açılma noktası var; bu yüzden crossfire kurmak, utility ile ikincil girişleri kapatmak ve rotasyon hızını yüksek tutmak zorunlu
- Tempo prensipleri: Fracture, eş zamanlılık haritasıdır. Bir tarafın push'u erkense ve diğer taraf hazır değilse, split avantajını kaybedersin. Savunmada ise over-rotate tuzağına düşmemek gerekir — haritanın yapısı geri dönüş süresini uzatır

## 2. Ölüm Bölgeleri
- **A Dish Girişi**: A Dish'ten site'a doğru ilerleyen oyuncular, A Rope'taki yükseklik avantajına sahip savunucuya karşı açık hedef olur. Burada ölümlerin tekrarlayan sebebi, Rope pozisyonunu temizlemeden site'a adım atmaktır. Antrenman notu: A Dish'e girerken ilk iş Rope'u flash veya smoke ile etkisizleştirmek olmalı.
- **A Hall Drop**: A Hall'dan site'a inerken drop sesi pozisyonunu ele verir. Savunucu drop sesini duyar ve pre-aim yapar. Burada tekrarlayan ölümler, drop öncesi utility kullanmadan atlamayı gösterir.
- **B Tower Açılması**: B Tower'dan site'a doğru ilerleyen oyuncular, B Tree pozisyonundaki savunucunun crossfire'ına yakalanır. Bu bölgedeki ölümler, Tower'dan girerken Tree'yi kontrol etmemekten kaynaklanır.
- **B Arcade Geçişi**: B Arcade'den site'a bağlanan dar geçiş, savunucuya kolay avlanma fırsatı sunar. Saldırganlar burada ölür çünkü Arcade'i tek başına push eder ve Canteen tarafından destek gelmeden commit eder.
- **Zip Line Çıkışları**: Zip line'in her iki ucundaki çıkış noktası, karşıdan izlenen oyuncu için ölüm tuzağına dönüşür. Zip line sesi düşmana bilgi verir; çıkış noktasında pre-aim bekleyen rakibe karşı korumasız kalırsın.

## 3. Pattern -> Meaning Eşleşmesi

**Pattern 1: A Dish + A Hall Split Timing Uyumsuzluğu**
IF: Saldırı tarafında A Dish ve A Hall'dan eş zamanlı push yapılması gerekirken bir taraf 3-4 raund boyunca diğer taraftan önce giriyor — diğer taraf henüz pozisyona gelmeden commit ediliyor
MEANING: Split execute'un temel mantığı bozuk. Fracture'da A site'a tek yönden giriş yapmak, savunucuya tüm ateşleme gücünü tek bir noktaya yönlendirme şansı verir. Dish tarafından erken giren oyuncu, Hall'dan henüz baskı gelmediğinden 1v2 veya 1v3 durumuna düşer. Bu bir aim sorunu değil, bir koordinasyon ve call sorunu.
COUNTER: IGL veya call yapan oyuncu, push komutu vermeden önce her iki tarafın da "hazır" onayını almalı. Pratik yöntem şu: bir taraf flash attığında diğer taraf da eş zamanlı olarak push başlatmalı. Flash sesi senkronizasyon sinyali olarak kullanılabilir. Eğer bir taraf geç kalacaksa, diğer taraf commit etmemeli ve bilgi toplama moduna geçmeli.
WHY: Fracture'in saldırı avantajı tamamen çifte giriş noktasından gelir. Bu avantajı kullanmayan takım, haritayı tek girişli bir harita gibi oynar — bu da savunma avantajını rakibe hediye eder. Eş zamanlı push, savunucuyu iki yöne birden bakmaya zorlar ve crossfire kuramaz hale getirir.

**Pattern 2: Zip Line Kullanım Hatası**
IF: Oyuncu zip line ile rotate ederken karşıdan vurularak ölüyor — zip line kullanımında sürekli ölüm tekrarlanıyor
MEANING: Zip line sesi tüm haritaya yayılır ve çıkış noktası tahmin edilebilir. Oyuncu, zip line'i güvenli bir ulaşım aracı gibi kullanıyor ama aslında zip line kullanımı bir bilgi sinyalidir. Karşı taraf, zip sesini duyar ve çıkış noktasını pre-aim yapar.
COUNTER: Zip line kullanmadan önce çıkış noktasını smoke veya flash ile koruma altına al. Alternatif olarak, zip line'i fake amaçlı kullan — sesi çıkart ama binme, karşı tarafın rotasyonunu tetikle. Takım arkadaşın zip kullanacaksa, sen çıkış noktasını izleyerek cover ver. Zip line'a atlayan oyuncu havada korumasızdır; tek başına kullanmak kumar oynamaktır.
WHY: Zip line Fracture'in en güçlü rotasyon aracıdır ama ses bilgisi nedeniyle risk taşır. Bilgisiz kullanım, rakibe bedava kill fırsatı sunar. Utility desteği ile kullanıldığında ise haritanın iki yarısını birleştiren stratejik bir silaha dönüşür.

**Pattern 3: Savunmada Tek Giriş Odaklanması**
IF: Defender olarak oyuncu sürekli aynı girişi izliyor ve diğer girişten gelen saldırıda arkadan vurularak ölüyor — bu desen 2+ raund tekrarlanıyor
MEANING: Fracture'da her site'in en az iki giriş noktası var. Savunucu tek bir girişi izleyerek diğer girişi tamamen göz ardı ediyor. Bu, haritanın temel mekaniğini anlamamaktan kaynaklanıyor. Saldırganlar her zaman iki yönden gelebilir — tek yöne bakmak, diğer yönü hediye etmek demektir.
COUNTER: Crossfire pozisyonu kur: her iki girişi gören bir açı seç veya takım arkadaşınla iki farklı girişi paylaşarak izle. Sentinel utility (tripwire, alarm bot) ikincil girişi kapatmak için kullan. Eğer yalnızsan, ikincil girişi utility ile kontrol altına al ve birincil girişte dur — utility tetiklenmesi sana bilgi ve reaksiyon süresi verir.
WHY: Fracture'in çifte giriş yapısı, savunucuları sürekli iki yöne birden düşünmeye zorlar. Tek girişi izlemek, Fracture'i normal bir harita gibi oynamaya çalışmaktır — bu harita normal değil. Crossfire ve utility kombinasyonu, çifte girişi yönetilebilir hale getirir.

**Pattern 4: Post-Plant Pozisyon Hatası**
IF: Spike plant edildikten sonra tüm takım aynı tarafta toplanarak defuse'u izliyor — retake yapan savunucu tek bir açı temizleyerek herkesi vurma fırsatı buluyor
MEANING: Fracture'in post-plant gücü, iki farklı yönden crossfire kurma olanaklarından gelir. Tüm takımın tek tarafta olması, bu avantajı tamamen yok eder. Savunucu tek bir flash veya smoke ile tüm takımı etkisiz hale getirebilir çünkü herkes aynı açı üzerinde.
COUNTER: Plant sonrası takımı ikiye böl — örneğin A site'ta plant sonrası 2 kişi A Dish tarafında, 2 kişi A Hall tarafında konumlansın. Retake yapan savunucu hangi taraftan gelirse gelsin, diğer taraftan crossfire yiyecek. Spike'i gören bir oyuncu yeterli; diğer herkes crossfire açılarını tutmalı.
WHY: Crossfire, retake yapan takımı iki kötüden birini seçmeye zorlar. Tek taraftan savunma ise retake yapan takıma temiz bir giriş hattı verir. Fracture'in iki yönlü yapısı post-plant'te en çok parlayan anıdır — bu avantajı kullanmamak, haritanın ruhunu kaybetmek demektir.

**Pattern 5: Over-Rotate Tuzağı**
IF: Savunma tarafında bir site'tan bilgi geldiğinde tüm takım o site'a döner ve boş kalan site'tan saldırganlar engelsiz giriyor — bu desen her yarıda 3+ kez yaşanıyor
MEANING: Fracture'da fake ve bilgi manipülasyonu çok güçlü çünkü saldırganlar zaten iki taraftalar. Tek bir ses veya utility görüntüsü ile tüm savunmayı bir tarafa çekebilirler. Over-rotate eden takım, diğer site'i tamamen boş bırakır ve saldırganlar karşılama olmadan plant yapar.
COUNTER: Rotasyon kuralını net belirle: en fazla 1 kişi rotate etsin, diğerleri bilgi onaylanana kadar pozisyonlarını korusun. "Ses duydum, hepimiz dönelim" refleksini kırman gerekiyor. Sentinel utility diğer site'ta kalırsa, rotate eden kişi geri dönmek zorunda kaldığında bile bilgi akışı devam eder.
WHY: Fracture'in çifte spawn yapısı, saldırı tarafına doğal fake potansiyeli verir. Savunma olarak buna karşı en iyi silah disiplindir — bilgi onaylanmadan hareket etmemek. Bir site'tan gelen ses, o site'a tam commit anlamı taşımaz; saldırganlar ses çıkarıp diğer tarafa dönebilir.

**Pattern 6: B Arcade Solo Push**
IF: Saldırı tarafında oyuncu B Arcade'den tek başına site'a giriyor ve B Tree veya B Generator'daki savunucu tarafından kolayca durdurularak ölüyor
MEANING: B Arcade, site'a bağlanan ikincil giriş noktasıdır ve tek başına kullanılmak için tasarlanmamıştır. Arcade'den giren oyuncu, B Main/Canteen tarafından gelecek ana push ile eş zamanlı olmalıdır. Solo giriş, savunucuya tüm odağını tek noktaya verme imkânı tanır.
COUNTER: B Arcade'yi her zaman B Main push'u ile koordineli kullan. Ana grup B Main'den baskı yaparken, Arcade oyuncusu savunucunun odağını bölen ikinci cepheyi açar. Arcade'den giriş yapmadan önce B Main'deki takım arkadaşlarının hazır olduğunu onayla. Raze oynanıyorsa, satchel ile Arcade'den hızlı giriş yapılabilir ama bu bile Main'den eş zamanlı baskı gerektirir.
WHY: Fracture'in her girişi, diğer girişlerle birlikte kullanılmak üzere tasarlanmıştır. Tek başına herhangi bir girişi zorlamak, haritanın split mekaniğini yok sayar ve savunucuya kolay bir iş çıkarır. Koordineli giriş, savunucunun odağını böler ve hangi tarafa döneceğini bilemez hale getirir.

**Pattern 7: Mid/CT Spawn Rotasyon Kontrolsuzluğu**
IF: Savunma tarafında CT Spawn ve mid bölgesi kontrol edilmiyor, saldırganlar zip line veya mid üzerinden serbest rotasyon yapıyor
MEANING: CT Spawn, Fracture'da savunmanın kalbidir — her iki site'a rotasyon buradan yapılır. Bu bölgenin kontrolsuz bırakılması, saldırganın rotasyon hızını engelleyemeyeceğin ve flank yollarını açık bırakacağın anlamına gelir. Zip line kontrolü de bu bölgeye bağlıdır.
COUNTER: Bir oyuncu mid/CT Spawn bölgesi için sorumluluk almalı. Bu oyuncu her iki site'a bilgi taşır ve zip line kullanımını izler. Cypher cam veya Fade haunt bu bölge için çok değerli bilgi araçlarıdır. Rotasyon yapan oyuncu bile arkasını kapatmadan hareket etmemeli.
WHY: Fracture'in ortası, savunmanın omurgasıdır. Bu omurga kırılırsa, savunucu iki ayrı site'i birbirinden bağımsız savunmak zorunda kalır — bu da saldırganın sayısal üstünlüğünü her iki site'ta da kullanabilmesi demektir.

## 4. Taraf Bazlı Hatalar

### Saldırı
- Split yapmadan tek taraftan push etmek — Fracture'in tüm tasarımı iki yönlü saldırı için yapılmış; tek yönlü giriş bu haritada yarıda kalmış bir stratejidir
- Zip line'i utility desteği olmadan kullanmak — ses bilgisi verir ve çıkış noktası tahmin edilir; korumasız zip kullanımı bedava ölüm demektir
- A Drop'u temizlemeden site'a inmek — drop sesi savunucuya pozisyon verir; flash veya smoke olmadan inmek intihardir
- B Tower'da gereksiz agresif peek yapmak — Tower uzun sightline sunar ama savunucu bunu bekler; kuru peek yerine utility ile aç
- Post-plant'te tek tarafta yığılmak — crossfire kurmamak Fracture'in en büyük post-plant hatasıdır
- Takım koordinasyonu olmadan commit etmek — Fracture'da bireysel oyun değil, takım senkronizasyonu kazandırır

### Savunma
- Tek giriş noktasını izleyip diğer girişi göz ardı etmek — her site'in birden fazla girişi var; biri açık kalmamalı
- Over-rotate — bir taraftan ses gelince tüm takımın dönmesi, diğer site'i boş bırakır; disiplinli rotasyon şart
- Utility'yi raundun başında tüketmek — Fracture'da saldırganlar timing'i değiştirir; utility'yi gerektiğinde kullanmak için sakla
- CT Spawn/mid kontrolunu ihmal etmek — rotasyon omurgası kırılırsa her iki site izole kalır
- Retake'te koordinasyonsuz push — dar geçişlerden tek tek girmek, saldırganın crossfire'ına yem olmaktır
- Aynı pozisyonda raund raund beklemek — saldırganlar pre-aim yapar; pozisyon değiştirmek hayatta kalmanın anahtarıdır

## 5. Kompozisyon / Harita Etkileşim Notları
- **Breach**: Fracture'in en güçlü initiator'u. Fault Line duvarların ardına kadar uzanır — dar geçişlerde savunucuyu pozisyondan çıkarır. Aftershock ile site içindeki gizli açılar temizlenir. Flash'i iki farklı yönden eş zamanlı entry için idealdir. A Hall'dan fault line + flash kombinasyonu, garanti edilmiş giriş oluşturur.
- **Neon**: Hızlı A Dish entry için tasarlanmış gibi. Duvar ile site'i ikiye böler ve savunucunun crossfire kurmasını engeller. Sprint ile diğer entry duelist'lerinden çok daha hızlı commit eder — split timing'inde senkronizasyonu kolaylaştırır.
- **Fade**: Haunt, iki girişli site'larda muazzam bilgi toplar çünkü her iki yönü tek bir ability ile tarayabilir. Prowler dar geçişleri kontrol eder ve gizlenen savunucuyu ortaya çıkarır. Fracture gibi bilgi odaklı bir haritada Fade'in değeri katlanarak artar.
- **Cypher**: Çifte giriş noktası = çifte tripwire ihtiyacı. Cypher her site'in ikincil girişine tripwire koyarak savunucuya erken uyarı sistemi kurar. Kamerası mid/CT Spawn kontrolü için çok değerli. Fracture savunmasının bel kemiği olabilecek bir ajan.
- **Raze**: B Arcade satchel entry, B Tower boombot bilgi toplama, paint shells ile dar geçişleri kontrol etme — Raze'in kit'i Fracture'in yapısına çok uygun. Showstopper dar alanlarda kaçış yolu bırakmaz.
- **Chamber**: Op ile A Dish uzun sightline'i kontrol eder ve TP ile güvenle geri çekilir. B Tower'da aynı strateji geçerli. Fracture'in uzun açıları Chamber'in Op oyununa çok uygun; TP ise çifte giriş haritasında hayatta kalmayı garantiler.
- **KAY/O**: Suppression blade site temizleme için muhteşem — site'taki tüm utility'yi devre dışı bırakır ve entry'yi kolaylaştırır. Flash'i dar geçişlerde çok güçlü; eş zamanlı push'ta iki farklı yönden flash atılabilir.
- **Viper**: Toxic Screen ile site'i ikiye bölmek, savunucunun crossfire kurmasını tamamen engeller. Snake Bite post-plant lineup'ları Fracture'da çok güçlü çünkü spike pozisyonları tahmin edilebilir. Wall ile iki giriş noktasından birini tamamen kapatabilir.
- **Brimstone**: Fracture'da S-tier controller. Anlık üçlü smoke ile iki farklı girişi eş zamanlı kapatabilir — bu diğer controller'ların yapamadığını tek ability ile çözer. Incendiary post-plant lineup'ları her iki site'ta çok güçlü çünkü spike pozisyonları tahmin edilebilir. Stim Beacon dar giriş noktalarında takım entry'sini güçlendiriyor. Orbital Strike kompakt site'larda kaçış yolu bırakmaz. Fracture'in boyutu Brimstone'un smoke menzilini sınırlamaz — tüm pozisyonlara rahatça ulaşır.
- Controller olmadan Fracture oynamak mümkün değil — smoke'lar site'a giriş için olmazsa olmaz. Çifte controller setup'ları (Viper + Omen veya Viper + Harbor) iki girişi eş zamanlı smoke'lamak için giderek daha popüler.

## 6. Koçluk Satırları
- "Fracture, bireysel aim'in değil takım senkronizasyonunun haritasıdır. İki taraftan aynı anda girmezsen, savunucu seni tek başına karşılar."
- "Zip line'i düşman çağrı cihazı gibi düşün — her kullandığında karşı tarafa 'geliyorum' diyorsun. Utility olmadan binme."
- "Tek taraftan push etmek, Fracture'i Bind gibi oynamaya çalışmaktır. Bu harita Bind değil — iki tarafın var, ikisini de kullan."
- "Savunmada tek girişi izleyip diğer girişi unutuyorsan, duvara bakarak futbol oynamaya benziyor. İki gözün var, iki girişi de gör."
- "Post-plant'te aynı yerde duruyorsanız, rakibe tek flash ile hepinizi temizleme fırsatı veriyorsunuz. Dağılın, crossfire kurun."
- "Over-rotate Fracture'in en büyük savunma hatasıdır. Ses duydun diye koşma — bilgi onayla, sonra hareket et."
- "Bu haritada 'ben tutarım' diye düşünme. 'Biz tutarız' diye düşün. Her giriş, iki kişinin işi."

## 7. Rank Modülasyonu
- **Iron-Silver**: Oyuncular Fracture'in çifte giriş yapısını anlamıyor. Split yapmadan tek taraftan push ediyorlar ve zip line'i hiç kullanmıyorlar. Antrenman odağı: "Her site'a iki yol var, her zaman takım arkadaşınla farklı yollardan gir" temel kural olarak öğretilmeli. A Dish giren varsa, başkası A Hall'dan gelmeli — bu kadar basit tut. Savunmada ise "iki giriş var, birini utility ile kapat" prensibi yeterli.
- **Gold-Platinum**: Oyuncular split kavramından haberdar ama timing uyumsuz. Bir taraf erkence giriyor, diğer taraf geç kalıyor. Antrenman odağı: senkronizasyon sinyalleri oluştur — flash sesi, call, countdown gibi yöntemlerle iki tarafın aynı anda commit etmesini sağla. Savunmada over-rotate sorunu başlıyor; "rotate etmeden önce bilgi onayla" disiplini bu seviyede öğretilmeli. Zip line kullanımı öğretilmeli ama utility desteği ile.
- **Diamond-Ascendant**: Oyuncular temel split ve savunma yapısını biliyor ama tahmin edilebilir hale geliyor. Her raund aynı A split yapıyorsan rakip okur ve 3 kişi A'ya stack yapar. A fake gösterip B'ye dönmek, zip line ile timing değiştirmek, farklı utility sıraları kullanmak bu seviyenin ayrımı. Post-plant crossfire pozisyonlarını optimize etmek ve anti-strat okuma yapabilmek gerekiyor.
- **Immortal-Radiant**: Fracture bu seviyede satranç masasına dönüyor. Antrenman odağı: rakibin default'unu okuma ve exploit etme. Zip line timing'lerini çeşitlendirmek, her raundi farklı bir strateji ile açmak, timeout kullanarak momentum kırmak ve post-plant lineup'ları milimetrik hassasiyetle uygulamak bu seviyenin gereksinimleri. Anti-strat adaptasyonu raund bazında yapılmalı — aynı stratejiyi arka arkaya iki raund kullanmak okunma riskini katlar.

## 8. Site Bazlı Stratejiler

### A Site Saldırı
- A Dish + A Hall split, Fracture'in en güçlü execute'udur. İki farklı yönden eş zamanlı giriş, savunucuyu iki yöne birden bakmak zorunda bırakır.
- Smoke hedefleri: A Site CT çıkışı (savunucunun rotate yolunu kes) ve A Rope (yükseklik avantajını kaldır)
- Flash sıralama: A Hall'dan flash at, savunucuyu Dish tarafına döndür; Dish'ten giren oyuncu arkadan vurur. Veya tam tersi — flash kaynağını değiştirerek savunucunun hangi tarafa döneceğini kontrol et.
- Entry sırası: Dish'ten entry fragcı girer, Hall'dan trade yapacak oyuncu gelir. İki tarafın da trade potansiyeli olmalı.
- Spike plant pozisyonu: A Default (site ortası) en güvenli plant. Post-plant için Dish ve Hall tarafından crossfire kurulur.

### A Site Savunma
- A Rope, site'in en güçlü savunma pozisyonu — yükseklik avantajı ve geniş görüş açısı sağlar. Ama her raund burada durmak pre-aim'e davetiye çıkarır; 2-3 raund sonra site seviyesine in.
- A Drop'tan gelen saldırganlar drop sesi ile kendini ele verir — bu sesi kullanarak pre-aim yap. Ama drop'a molly veya smoke atarak girişi yavaşlatmak daha güçlü bir strateji.
- A Sandy off-angle, saldırganın beklemediği bir pozisyon. İlk raundi burada oyna, kill al, sonra değiştir.
- Çifte giriş problemi: Tripwire veya alarm utility'sini Dish veya Hall'dan birine koy, sen diğerini izle. Utility tetiklenmesi sana reaksiyon zamanı verir.

### B Site Saldırı
- B Tower + B Arcade split, B site'in ana saldırı stratejisi. Tower ana giriş, Arcade ikincil baskı noktası.
- Smoke hedefleri: B Tree (defender anchor pozisyonu) ve B CT çıkışı (rotate yolunu kes)
- B Canteen'den Main'e ilerle, Arcade'den ikincil baskı gönder. İki grup eş zamanlı push yapmalı.
- Raze kullanılıyorsa: Boombot Tower'a gönder (bilgi topla), satchel ile Arcade'den hızlı giriş yap.
- Spike plant: B Default (kutuların arkası). Post-plant için B Main + B Arcade crossfire.

### B Site Savunma
- B Tree = en güçlü anchor pozisyonu. Cover ve geniş açı sunar; buradan hem Tower hem Main girişi izlenebilir.
- B Tower tarafından agresif push gelebilir — utility ile yavaşlat, kuru peek yapma.
- B Generator off-angle, saldırganın beklemediği bir pozisyon. Tree ile değişimli kullan.
- B Arcade kontrolü, ikincil girişi kapatmanın anahtarı. Tripwire veya turret bu noktada çok değerli.

## 9. Ekonomi Stratejileri
- Fracture, saldırı taraflı bir haritadır — saldırı ekonomisini agresif kullanabilirsin. Force buy raundlarında bile A Dish + Hall split, minimal utility ile güçlü kalır çünkü haritanın yapısı zaten avantaj verir.
- Eco raundları: Zip line ile agresif flank. Spectre + sürpriz faktörü, eco raundlarında round çalma potansiyeli taşır. Zip line'in ses bilgisi vermesi dezavantaj gibi görünür ama eco'da risk-ödül dengesi buna değer.
- Full buy raundları: Utility yüklenmesi zorunlu. Çifte giriş = çift utility ihtiyacı demektir. Saldırı tarafında her raund en az 3-4 ability kullanılmalı.
- Savunma ekonomisi Fracture'da zorlu — her raund utility harcamak zorundasın çünkü saldırganlar her yönden gelebilir. Utility tasarrufu yapacaksan, hangi raundlarda hangi girişleri açık bırakacağını önceden planla.
- Marshal, A Dish'teki uzun sightline'da çok güçlü. Eco veya force raundlarında A Dish Marshal + Hall'dan Spectre push kombinasyonu işler.
- Operator, savunma tarafında Chamber ile A Dish veya B Tower'da kullanıldığında çok güçlü. TP ile geri çekilme garantisi, Op yatırımını korur.

## 10. Anti-Strat Rehberi
- Rakip her raund A split yapıyorsa: A'ya 3 kişi stack et, B'den 1 kişiyi hızlı rotate için hazır tut. A'ya 3 kişi koymak, split'in her iki kolunu karşılamak için yeterli sayı sağlar.
- Rakip zip line'i çok kullanıyorsa: Zip çıkış noktasını izle ve pre-aim yap. Zip line'dan çıkan oyuncu hareketsiz hedeftir — bu bilgiyi kullan. Alternatif olarak, zip çıkışına molly veya trap koy.
- Rakip B Tower'dan her raund agresif peek yapıyorsa: Tower'a early utility at (molly, stun) ve Arcade'den flank gönder. Agresif peek yapan oyuncu utility ile geri itilir, flank ise pozisyonunu tamamen bozar.
- Rakip eş zamanlı push yapıyorsa (gerçek split): Bir tarafta güçlü tut (3 kişi veya heavy utility), diğer tarafta retake oyna. Her iki tarafı eşit tutmak, rakibin sayısal üstünlüğüne teslim olmaktır — bir tarafı güçlü tut ve diğer tarafta retake stratejisi uygula.
- Rakip lurk yapıyorsa ve flanklardan kill alıyorsa: Cypher veya Killjoy utility'sini çifte taraf zorunlu olarak yerleştir. Her girişte en az bir bilgi verici utility bulunmalı. Lurker'in yolunu utility ile kesmek, onu ya geri çekilmeye ya da kendini ifşa etmeye zorlar.
- Rakip default savunma oynuyorsa (2-1-2): Mid'e baskı yap ve rotasyon omurgasını kır. Mid kontrolunu alırsan, savunucuların rotate hızını düşürürsün ve split execute'un başarı oranını artırırsın.

## 11. Zip Line Ustalığı
- Zip line, Fracture'in en benzersiz mekaniği ve doğru kullanımla oyun değiştirici bir araç. Ama hatalı kullanımla bedava ölüm demek.
- **Temel kullanım kuralları**: Zip line'a binmeden önce çıkış noktasını smoke veya flash ile koru. Çıkış noktasında beklediğini bildirdiğin bir takım arkadaşının cover'i olmadan zip kullanma. Zip line kullanımı bir takım kararı olmalı, bireysel karar değil.
- **Fake zip**: Zip line'a yaklaşarak sesi çıkart ama binme. Karşı taraftaki savunucu rotate sinyali alır ve pozisyon değiştirir — bu hareketi exploit et. Fake zip, özellikle B'den A'ya (veya tersi) rotasyon görüntüsü yaratmak için çok güçlü.
- **Eco round zip aggression**: Eco raundlarında zip line ile beklenmedik taraftan flank yap. Spectre veya Judge ile yakın mesafe avantajı kur. Karşı taraf eco'da zip kullanmayı beklemez — sürpriz faktörü yüksek.
- **Timing çeşitlendirmesi**: Aynı zamanda zip kullanımını tekrarlama. Raundun başında, ortasında ve sonunda farklı zamanlarda zip kullanarak rakibin okuma yapmasını engelle. Zip timing'i okunabilir bir pattern oluşturursa, rakip buna karşı pozisyon alır.
- **Rotate aracı olarak**: Savunma tarafında zip line, site'lar arası rotasyonu hızlandırır. CT Spawn'dan koşarak rotate etmek yerine zip kullanmak sana zamandan kazandırır — ama ses bilgisi verdiğini unutma. Rotate sırasında zip kullanırken, takım arkadaşının çıkış noktasını izlediğinden emin ol.
- **Bilgi aracı olarak**: Zip line sesini bilgi olarak değerlendir. Düşman zip kullanıyorsa, hangi yönde gittiğini ve hangi site'a commit edeceğini tahmin edebilirsin. Bu bilgiyi takım ile paylaş ve savunma rotasyonunu buna göre ayarla.

## 12. Agent Tier Listesi

### S-Tier
- **Breach**: Fracture'in dar koridorları ve çifte giriş yapısı Breach'in kit'ini mükemmel destekler. Fault Line ve Aftershock duvarların arkasını temizler. Flash dar girişlerde kaçınılmazdır. Rolling Thunder site execute'larında savunucuyu tamamen bozar. Fracture'da Breach diğer haritalara göre çok daha fazla değer üretir.
- **Raze**: Boombot dar koridorlarda bilgi toplar ve temizler. Satchel ile beklenmedik açılardan giriş yapılır — özellikle Arcade'den B site'a satchel giriş çok güçlü. Paint Shells dar alanlarda kaçınılmazdır. Showstopper site execute'larında anchor'i zorla çıkarır.

### A-Tier
- **Fade**: Haunt ile çifte giriş noktalarından birini tarar. Prowler dar koridorlarda temizleme yapar. Seize post-plant'te alan engelleme sağlar. Nightfall site execute'larını destekler. Fracture'in bilgi ihtiyacını karşılıyor.
- **Brimstone**: Smoke'ları Fracture'in dar choke point'lerini kapatmak için idealdir. Molly post-plant lineup'ları güçlü. Stim Beacon takım push'unu destekler. Orbital Strike site temizleme ve post-plant için kullanılır.
- **Killjoy**: Çifte giriş problemini sentinel utility ile çözer. Turret bir girişi izlerken sen diğerini tutarsın. Nanoswarm dar koridorlarda rush'ları durdurur. Lockdown retake'te oyun değiştirici.

### B-Tier
- **Chamber**: Op + TP Fracture'da çalışır ama haritanın çifte giriş yapısı Chamber'i zor durumda bırakır — TP ile sadece bir taraftan kaçabilirsin. Trademark flank izleme için değerli.
- **Cypher**: Tripwire çifte girişlerin birini kontrol eder. Spycam uzaktan bilgi verir. Ama Fracture'in agresif saldırı temposu Cypher'in pasif setup'ini zorlar.
- **Skye**: Flash dar girişlerde işe yarar ve bilgi geri dönüşü verir. Trailblazer koridorlarda temizleme yapar. Ama Breach'in Fracture'a özgü üstünlüğü Skye'i ikinci plana atar.
- **Viper**: Toxic Screen Fracture'da işe yarar ama haritanın boyutu ve yapısı Viper'in diğer haritalardaki dominansını sınırlar. Snake Bite post-plant için güçlü.
