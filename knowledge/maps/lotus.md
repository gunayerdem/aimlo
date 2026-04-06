# LOTUS — Detaylı Strateji ve Analiz

> PATCH-SENSITIVE NOTE: Lotus, 3 site'li harita havuzunun en dinamik üyesi. Rotating door ve breakable wall mekanikleri meta değişimlerine göre farklı ağırlık kazanabilir.

## 1. Temel Prensipler
- Lotus 3 site'li (A, B, C) bir harita — Haven gibi geniş bir yapı sunar ama mekanik zenginliği ile ondan ayrılır
- Rotating door'lar (A Main ile C Mound arasında), breakable wall (B site) ve Silent Drop (A site) bu haritayı benzersiz kılar
- Saldırı temeli: Lotus attacker-sided bir harita çünkü giriş noktaları çok fazla. Saldırı tarafında utility koordinasyonu ve fake pressure ile defender'ın rotasyonlarını zorlaman gerekiyor. Tek bir site'a kuru push yapmak yerine, haritanın mekaniklerini (kapı, duvar, drop) kullanarak defender'ı yanlış pozisyona çekmen lazım.
- Savunma temeli: 3 site'i 5 kişiyle tutmak her zaman zor. Savunmada bilgi toplama önceliktir — sentinel utility ve initiator bilgisi olmadan hangi site'a rotate edeceğini bilemezsin. Retake odaklı setup'lar genellikle agresif anchor'lardan daha güvenilir çünkü attacker giriş seçeneği çok fazla.
- Tempo ilkeleri: Lotus'ta tempo kontrolu haritanın mekaniklerine bağlıdır. Rotating door ile çok kısa sürede site değiştirebilirsin — bu diğer hiçbir haritada yok. Breakable wall'u ne zaman kırdığın, Silent Drop'u ne zaman kullandığın round'un temposunu belirler. Aceleci oynamak kadar pasif oynamak da seni öldürür; haritanın sunduğu araçları doğru zamanda kullanman gerekiyor.

## 2. Ölüm Bölgeleri
- **A Main (Root Girişine Kadar)**: A Main'den site'a doğru ilerlerken A Tree (Heaven) ve A Stairs'ten gelen crossfire seni yakalar. Burada ölümlerin çoğu utility olmadan kuru push yapan oyunculardan gelir. Koçluk bağlamında: eğer bir oyuncu A Main'de sürekli ölüyorsa, pre-entry flash veya smoke kullanmıyor demektir.
- **B Main Corridor**: B Main dar bir koridordur ve B Upper'dan gelen defender seni tek açıdan kontrol edebilir. B Main'de ölümlerin ana sebebi duvar kırılmadan önce tek girişten push yapmaktır — ikinci bir giriş yokken defender tüm odağını sana verir.
- **C Mound**: C Mound yükseklik avantajı sağlar ama aynı zamanda C Main'den gelen attacker'lar için doğal bir hedef noktasıdır. Burada ölümlerin sebebi Mound'da açıkta kalarak uzun sightline'a maruz kalmaktır.
- **Mid Link**: Mid bölgesinde birden fazla bağlantı noktası var ve bu kesişim noktası flank için kullanılır. Mid Link'te ölümlerin sebebi mid kontrolunun kimseye bırakılmamasıdır — herkes kendi site'ına odaklanır, mid boş kalır.
- **Rotating Door Geçişleri**: Kapı açıldığında geçiş yapan oyuncu diğer tarafta bekleyen bir defender'a karşı savunmasızdır. Kapı kullanarak rotate yapan oyuncular, karşı tarafın peek yaptığını hesaba katmadan geçiş yapar.

## 3. Pattern -> Meaning Eşleşmesi

**Pattern 1: A Main Kuru Push Ölümleri**
IF: Oyuncu A Main'de utility kullanmadan push yapıyor — flash veya smoke olmadan Tree ve Stairs açılarına yürüyerek giriyor.
MEANING: Koridor disiplini yok. A Main'de Tree'den ve Stairs'ten gelen iki farklı açı seni aynı anda görebilir. Utility olmadan girdiğin anda defender'ın pre-aim'li olduğu açıya yürüyorsun ve ilk atışı o atıyor. A Main'in uzunluğu seni yaklaşırken tamamen görünür kılıyor.
COUNTER: A Main'e girmeden önce Tree'yi smoke'la ve Stairs yönüne flash at. Smoke defender'ın görüş hattını keser; flash onu açısından zorla çıkarır. Flash'ın patladığı anda swing yap — flash ile swing arasında boşluk bırakma. Entry'den sonra Root kontrolunu al ki flank yemeyesin.
WHY: A Main dar bir yaklaşma yolu ve defender iki farklı yükseklikten seni izliyor. Utility bu dengesizliği senin lehine çevirir çünkü smoke ile sightline'ı kırıyorsun, flash ile defender'ın reaksiyon süresini sıfıra indiriyorsun. Root kontrolu ise arkını güvenli kılar — Root kontrolsuz A execute her zaman flank riskiyle gelir.

**Pattern 2: B Duvar Timing Hataları**
IF: Oyuncu breakable wall'u her round'un başında kırıyor — round başlar başlamaz ability harcayarak duvarı yıkıyor.
MEANING: Bilgi veriyorsun. Duvar kırıldığında defender iki şey biliyor: B'ye geliyorsun ve hangi taraftan geleceğini tahmin edebiliyor. Erken kırım seni okuması kolay bir oyuncu yapar. Ayrıca duvarı kırmak için harcadığın ability başka bir yerde kullanılabilirdi.
COUNTER: Duvarı execute anında kır, round başında değil. Execute öncesi duvarı sağlamken B Main'den pressure yap — defender duvarın sağlamlığına güvenip tek açıya odaklanır. Execute anında duvarı kır ve ikinci girişi aç; defender iki açıya birden bakmak zorunda kalır. Bazı round'larda duvarı hiç kırma — bu bile bilgi manipülasyonudur.
WHY: Breakable wall Lotus'un en güçlü mekaniklerinden biri çünkü defender'ın setup'ını doğrudan etkiler. Duvar sağlam = defender tek açıya odaklanır. Duvar kırık = defender iki açıya bakmak zorunda. Bu kararı ne zaman verdiğin round'un kaderini belirler. Erken kırım bu avantajı defender'a teslim eder çünkü hazırlanma süresi verir.

**Pattern 3: Rotating Door'u Kullanmamak**
IF: Takım rotating door'ları hiç kullanmıyor — A ve C arasında her zaman haritanın dış kenarlarından rotate ediyor.
MEANING: Haritanın en benzersiz mekaniğini görmezden geliyorsun. Rotating door A ile C arasında devasa bir rotasyon kısayolu sunar. Bunu kullanmamak, defend tarafında yalnızca dış rotasyona bağlı kalmak ve saldırı tarafında split execute seçeneğini kaybetmek demektir.
COUNTER: Saldırı tarafında: A Main'de pressure yarat, sonra kapı üzerinden 2 kişiyi C'ye gönder — defender A'ya rotate ederken C boş kalır. Savunma tarafında: kapı sesini dinle ve karşı taraftan peek yap. Eco round'larda kapı ile hızlı site switch yap — defender'ın setup'ını tamamen bozar.
WHY: Rotating door Lotus'u diğer haritalardan ayıran mekaniktir. A ile C arasında 2-3 adımlık bir geçiş sağlar — haritanın dış kenarlarından aynı rotasyonu yapmak 5-6 kat daha uzun sürer. Bu hız farkı round ortasında site değiştirmeyi mümkün kılar ve defender için tahmin edilmesi zor bir değişken yaratır.

**Pattern 4: Silent Drop Farkındalıksızlığı**
IF: Saldırı tarafında Silent Drop hiç kullanılmıyor — A site'a her zaman A Main'den giriş yapılıyor. Savunma tarafında Silent Drop kontrol edilmiyor.
MEANING: Saldırı tarafında tek boyutlu giriş yapıyorsun; defender tüm odağını A Main'e veriyor ve seni kolayca durduruyor. Savunma tarafında Silent Drop'u kontrol etmemek sessiz bir flank'a davetiye çıkarmaktır.
COUNTER: Saldırı tarafında: 1 kişiyi Silent Drop'tan sessiz şekilde A site'a gönder, geri kalan takım A Main'den execute etsin. Drop'tan inen oyuncu defender'ın arkasına veya yanına düşer — crossfire oluşur. Savunma tarafında: Drop altına tripwire, turret veya alarm botu yerleştir. Bu utility olmadan Drop'u sürekli peek etmen gerekir ki bu seni A Main'e karşı savunmasız bırakır.
WHY: Silent Drop A site'in en güçlü taktiksel elemanıdır çünkü ses çıkarmadan site'a giriş imkânı sunar. Diğer tüm girişlerde ayak sesi veya ability sesi vardır — Drop bunları bypass eder. Savunma tarafında ise kontrol edilmeyen bir Drop, defender'ın arkasına düşen bir oyuncu demektir ve bu durumdan kurtulmak neredeyse imkânsızdır.

**Pattern 5: C Mound Açıkta Kalma**
IF: Defender C Mound'da açıkta duruyor — cover kullanmadan Mound'un tepesinde pozisyon alıyor ve C Main'den gelen peek'lere karşı savunmasız kalıyor.
MEANING: Mound yükseklik avantajı sağlar ama aynı zamanda C Main'den uzun bir sightline vardır. Açıkta durarak Op veya Vandal ile kolayca vurulabilirsin. Mound'un gücü pozisyon almakta, açıkta durmakta değil.
COUNTER: Mound'da oyna ama cover arkasında kal. Kısa peek'ler yap — bilgi al veya kill al, sonra hemen cover'a geri çekil. Mound'un kenarındaki kutuları ve duvarları kullan. Eğer attacker C Main'de smoke atarsa, Mound'dan çekil ve site içinden oyna — smoke içinden push geleceğini biliyorsun.
WHY: Yükseklik avantajı sadece cover ile birleştiğinde güçlüdür. Açıkta duran yüksek pozisyon aslında dezavantajdır çünkü vücut modelinin tamamı görünür ve kaçış yolun sınırlıdır. Cover arkasında peek yaparak avantajı korursun — attacker seni görene kadar sen onu görmüş olursun.

**Pattern 6: Over-Rotate (3 Site Tuzağı)**
IF: Savunma tarafında 3 veya daha fazla oyuncu tek bir site'a rotate ediyor — diğer site'lar boş kalıyor.
MEANING: 3 site'li haritada over-rotate en büyük tuzaklardan biri. Attacker A Main'de ses çıkarıp C'ye execute edebilir; eğer 3 kişin A'ya rotate ettiyse C'de kimse kalmaz. Fake'lere düşüyorsun.
COUNTER: Rotate kararını bilgiye dayandırın, sese değil. Ses duydum = 1 kişi rotate etsin ve bilgi versin. Görsel temas veya utility görüldüğünde = ikinci kişi rotate etsin. Spike görülmediği sürece üçüncü kişinizi göndermeyin. Sentinel utility (tripwire, turret, alarm) bilgi toplama için kullanın — rotate kararını utility'nin verdiği bilgiyle verin, ses ile değil.
WHY: 3 site'li haritalar fake pressure için idealdir çünkü defender 5 kişiyi 3 site'a dağıtmak zorundadır. Her site'ta en fazla 2 kişi vardır — eğer biri rotate ederse site'ta 1 kişi kalır. Bilgiye dayanmayan rotate, attacker'ın tam istediğini verir: boş site.

**Pattern 7: Post-Plant'te Kapı Kullanmamak**
IF: Spike dikildi ama takım post-plant pozisyonlarını sadece site içinde alıyor — rotating door'u kullanmıyor.
MEANING: Post-plant'te kapı ile pozisyon değiştirmek defender'ın retake planını bozar. Kapıyı kullanmamak, retake sırasında defender'ın tam olarak nerede olduğunu bilmesini sağlar.
COUNTER: Spike A'ya dikildiğinde 1 kişiyi kapı üzerinden C tarafına gönder — defender A'ya retake yaparken kapı arkasında bir oyuncu bekler. Aynı mantık C site için de geçerli: spike C'ye dikildiğinde kapı ile A tarafına 1 kişi gönder. Bu crossfire defender'ın retake'ini son derece zorlaştırır.
WHY: Rotating door post-plant'te pozisyon çeşitliliği sağlar. Defender retake sırasında hem site içini hem kapı arkasını kontrol etmek zorunda kalır — bu ek kontrol süresi spike defuse zamanını azaltır. Kapı kullanan takım defender'a iki problem birden sunar: site'taki oyuncular ve kapı arkasındaki oyuncu.

**Pattern 8: B Anchor Sessiz Ölüm**
IF: B anchor'ı yardım istemeden ölüyor — callout yapmadan ve retake çağrısı olmadan B'de tek başına düşerek site'ı kaybediyor.
MEANING: B site'ta tek kişi tutuyor ve bu oyuncu ya comm yapmıyor ya da çok agresif oynuyor. B'nin breakable wall mekaniği yüzünden push geldiğinde hızlı erimek mümkün — ama bilgi vermeden ölürsen takım neyin olduğunu anlayana kadar site kaybedilmiş oluyor.
COUNTER: B anchor olarak ilk görev bilgi vermek, kill almak değil. Push geldiğini gördüğünde hemen callout yap: kaç kişi, hangi yönden, duvar kırıldı mı. Sonra delay utility'ni kullan (molly, slow, turret) ve geride kal. Eğer kill fırsatı varsa al ama trade edilmeyecek pozisyonda kal — ölürsen bile takım bilgiyi almış olsun.
WHY: B anchor Lotus'un en zor rolü çünkü tek başına tutuyor ve breakable wall ile iki girişi kontrol etmek zorunda kalabiliyor. Bu rolün asıl görevi zaman kazanmak ve bilgi vermek, hero play yapmak değil. Sessiz ölüm takıma sıfır bilgi verir — en kötü ölüm budur.

**Pattern 9: Mid Kontrolunu İhmal Etmek**
IF: Takım mid bölgesi için hiçbir kaynak ayırmıyor — ne utility ne de oyuncu mid'e gönderiliyor.
MEANING: Mid Lotus'ta hem A hem B hem C'ye bağlantı sağlar. Mid kontrolu olmadan attacker mid üzerinden her yöne split yapabilir, defender ise rotasyon için mid'i kullanamaz. Mid'i boş bırakmak haritanın ortasını rakibe teslim etmektir.
COUNTER: En az 1 kişiyi mid'e ata veya sentinel utility ile mid'i kontrol et. Saldırı tarafında mid kontrolu split execute seçeneklerini açar. Savunma tarafında mid kontrolu rotasyonları hızlandırır ve flank bilgisi verir. Mid Link'e tripwire veya turret koymak bile yeterli olabilir.
WHY: Mid her haritada strateji çarpanıdır ama Lotus'ta 3 site'a birden bağlantısı olduğu için etkisi katlanır. Mid'i kontrol eden takım hem saldırı hem savunmada ek seçenek kazanır. Mid'i bırakıyorsan 3 site'li haritayı 3 ayrı koridor gibi oynuyorsun — bağlantıları kaybediyorsun.

## 4. Taraf Bazlı Hatalar

### Saldırı
- Rotating door'u round boyunca hiç kullanmamak — haritanın en güçlü mekaniğini görmezden gelmek saldırı çeşitliliğini öldürür
- Breakable wall'u her round aynı zamanda kırmak — defender pattern'ini okuyor ve hazır oluyor
- Silent Drop'u kullanmamak — A site'a tek boyutlu giriş yapmak defender'ın işini kolaylaştırır
- 3 site'a birden yayılıp hiçbir yerde sayı üstünlüğü kuramamak — 1-1-1-2 dağılımları Lotus'ta çok zayıf
- Execute sırasında mid kontrolu almamak — mid'den gelen flank execute'u çökertiyor
- Post-plant'te herkesin aynı yerde durması — kapı ve çoklu pozisyon seçeneklerini kullanmamak

### Savunma
- Over-rotate: fake pressure'a 3 kişiyi gönderip diğer site'ları boş bırakmak — 3 site'li haritanın en büyük tuzağı
- B anchor'ın bilgi vermeden ölmesi — takım neyin olduğunu anlayana kadar site kaybedilmiş oluyor
- Rotating door sesini ignore etmek — kapı sesi doğrudan rotasyon sinyalidir ve buna tepki vermemek free site vermeye eşittir
- Silent Drop'u kontrol etmemek — utility veya peek olmadan Drop'u izlememek A site'ta sessiz flank'a davetiye
- Tüm site'larda aynı pozisyonlarda oynamak — Lotus'un çok sayıda off-angle'ı var ve bunları kullanmamak defender'ı tahmin edilebilir kılar
- Retake sırasında kapı kullanmamak — kapı üzerinden retake flank'ı yapılabilir ama çoğu takım bunu atlar

## 5. Kompozisyon / Harita Etkileşim Notları
- **Harbor**: Lotus'ta S-tier. High Tide 3 site arasında geçiş smoke'u sağlar, Cove spike'ı korur, Cascade A Main push'unu destekler. Haritanın genişliği ve çoklu giriş noktaları Harbor'un büyük utility'lerine tam uyar.
- **Viper**: Wall ile A-C arası veya B-Mid arası bölebilir, Orb ile üçüncü site'ı kontrol edebilir. 3 site haritada Viper'ın iki utility'si çok değerli — tek controller'dan 2 site'ı etkilemek başka hiçbir agent ile bu kadar verimli yapılmaz. Snake Bite lineup'ları post-plant'te defuse deny için çok güçlü.
- **Raze**: Breakable wall'u Blast Pack ile kırabilir — bu hem ability tasarrufu sağlar hem de timing kontrolu verir. Satchel entry B Main'de ve C Main'de çok güçlü. Boombot dar koridorlarda bilgi toplama için ideal.
- **Breach**: Fault Line B Main'de çoklu oyuncuyu vurabilir, flash combo A Main girişi için tasarlanmış gibi çalışır. Aftershock breakable wall arkasında bekleyen defender'ı cezalandırır. Lotus'un dar giriş noktaları Breach'in stun ve flash'ını amplify eder.
- **Killjoy**: B anchor rolü için en iyi agent. Turret + Alarm Bot duvarı ve B Main'i aynı anda izleyebilir, Lockdown B site'ta çok güçlü çünkü site kompakt. Nano Swarm duvarın kırılma anında çok değerli — duvar kırıldığında geçişi deny eder.
- **Fade**: Haunt ile 3 site'a bilgi toplama yapabilir — Lotus gibi geniş haritada Haunt'un verdiği bilgi altın değerinde. Prowler rotating door arkasını ve Silent Drop'u kontrol edebilir. Nightfall dar koridorlarda tüm takımı etkiler.
- **Omen**: TP ile rotating door'u bypass edebilir — kapı sesi olmadan karşıya geçmek defender'ı şaşırtır. C Waterfall'a TP yaparak off-angle alabilir. Paranoia dar koridorlarda çok güçlü.
- **Skye**: Flash kapı arkası için ideal — kapının diğer tarafına flash atıp teammate'in geçişini güvenli kılabilir. Trailblazer (dog) dar koridorlarda ve kapı geçişlerinde bilgi toplama için mükemmel.

## 6. Koçluk Satırları
- "Lotus'ta round kazanmak mekaniklerden önce harita mekanikleriyle başlar — kapı, duvar, drop. Bunları kullanmayan takım haritanın yarısını oynamıyor."
- "Breakable wall'u her round kırmak strateji değil, alışkanlık. Strateji, onu ne zaman kırdığını ve ne zaman kırmadığını seçmektir."
- "Rotating door ses yapar — bu hem avantaj hem dezavantaj. Sesi fake olarak kullanmayı öğren, hayalet gibi rotate etmeyi öğren."
- "3 site'li haritada over-rotate en çok round kaybettiren hata. Ses duydun diye 3 kişiyi gönderme — bilgiyle rotate et."
- "Silent Drop Lotus'un gizli silahı. Saldırı tarafında kullanmıyorsan A execute'un tek boyutlu. Savunma tarafında kontrol etmiyorsan arkanı da açık bırakıyorsun."
- "B anchor'ın görevi kill almak değil, hayatta kalmak ve bilgi vermek. Sessiz ölüm takıma sıfır değer katar."
- "Post-plant'te kapıyı kullanmayan takım, defender'a kolay retake hediye ediyor. Spike dikildikten sonra pozisyon değiştir — kapı bunun için var."
- "Lotus'u koridor haritası gibi oynama. Bu harita bağlantı haritası — mid, kapı, duvar, drop hepsi bağlantı noktası. Bağlantıları kontrol eden haritayı kontrol eder."

## 7. Rank Modulasyonu

### Iron-Silver
Oyuncular rotating door'un varlığını bilmiyor veya kullanmıyor. Breakable wall'u ya hiç kırmıyorlar ya da her round korkuyla kırıyorlar. Silent Drop çoğunlukla keşfedilmemiş bir mekanik. Bu seviyede koçluk tek hedefe odaklanmalı: haritanın üç mekaniğini (kapı, duvar, drop) tanıt ve her birini en az bir kez kullandırt. Mekanik farkındalığı bile bu seviyede büyük fark yaratır. Ayrıca temel rotasyon yollarını öğret — oyuncular 3 site arasında nasıl hareket edeceklerini bilmiyor ve kayboluyorlar. Callout'ları öğretmek rotasyon hızını doğrudan artırır.

### Gold-Platinum
Oyuncular mekanikleri biliyor ama stratejik kullanmıyor. Breakable wall her round aynı anda kırılıyor, rotating door kullanılıyor ama timing rastgele, Silent Drop kullanılıyor ama koordinasyonsuz. Bu seviyede koçluk timing ve koordinasyon üzerine olmalı: duvarı execute anında kır (round başında değil), kapı rotate'unu teammate ile koordine et (tek başına geçme), Silent Drop'u A execute planıyla senkronize et. Ayrıca savunmada over-rotate problemi başlıyor — fake pressure'a takım tamamen rotate ediyor. Bilgi bazlı rotate kavramı bu seviyede öğretilmeli.

### Diamond-Ascendant
Oyuncular mekanikleri ve temel stratejiyi biliyor ama round-to-round adaptasyon eksik. Aynı kapı stratejisini her round tekrarlıyorlar, duvar kırma pattern'leri okunuyor, post-plant pozisyonları değişmiyor. Bu seviyede koçluk adaptasyon ve okuma üzerine olmalı: rakibin kapı stratejisine karşı anti-strat geliştir, duvar kırma zamanlamasını round bazında değiştir, post-plant'te kapı ve site içi pozisyonları alternate et. Mid kontrolunun stratejik değeri bu seviyede tam anlaşılmalı — mid'i kim kontrol ediyorsa split execute ve rotasyon avantajı onundadır.

### Immortal-Radiant
Oyuncular tüm mekanikleri, stratejileri ve adaptasyonları biliyor. Bu seviyede fark yaratan şey round bazında okuma ve anti-strat derinliğidir. Kapı fake'leri, duvar timing mind game'leri, Silent Drop bait'leri — bunlar round kazandıran mikro kararlar. Taktik bazında: rakibin hangi round'da hangi site'a execute ettiğini oku ve setup'ını ona göre ayarla. Kapı mekaniklerini anti-strat planına dahil et — rakip kapı ile rotate ediyorsa kapı yakınına sentinel utility koy. Rakip kapı kullanmıyorsa kapı tarafını hafif tut ve diğer girişleri güçlendir. Timeout kullanımı ve mid-round shotcalling bu seviyede round kazandırır.

## 8. Ekonomi Stratejileri
- Lotus attacker-sided olduğu için saldırı tarafında ekonomiyi daha agresif kullanabilirsin — force buy round'ları saldırı tarafında diğer haritalara göre daha yüksek başarı oranı taşır
- Force buy: C rush en az utility ile yapılabilir çünkü C Main'den site'a mesafe kısa ve giriş noktaları geniş. Spectre veya Marshal ile C Main'den Mound kontrolu alıp site'a gir
- Eco round: Rotating door ile agresif flank play en değerli eco stratejisi. Sheriff veya Spectre ile kapı üzerinden rotate yap — defender bunu beklemiyorsa free kill potansiyeli yüksek
- Breakable wall'u kırmak ability charge harcar — tam buy'da bunu hesaba kat. Raze Blast Pack ile kırıyorsa bir satchel charge kaybeder; Breach Aftershock ile kırıyorsa bir ability slot kaybeder. Ekonomi planında bu maliyeti göz önünde bulundur
- 3 site = utility zorunlu. Tam buy round'unda ability eksik bırakma — Lotus'ta ability olmadan execute etmek diğer haritalardan daha çok cezalandırılır çünkü giriş noktaları çok ve defender'ın utility'ye ihtiyacı var
- Defender tarafında ekonomi yönetimi: retake odaklı oyna ve gereksiz agresif peek'lerle silah kaybetme. Lotus'ta silah kaybetmek pahalıdır çünkü bir sonraki round'da 3 site'ı utility'siz savunmak zorunda kalırsın

## 9. Ajan Bazlı İpuçları
- **Raze**: Blast Pack ile breakable wall'u kır — Satchel entry B Main ve C Main'de çok güçlü. Paint Shells (bombacık) dar koridorlarda alan kontrolu sağlar. Showstopper (ulti) B site'ta ve C site'ta compact alanlarda çok değerli. Boombot rotating door arkasını ve Silent Drop'u kontrol edebilir.
- **Breach**: Fault Line B Main'de çoklu oyuncuyu vurur. Flash combo A Main girişi için ideal — flash at, teammate swing yapsın. Aftershock breakable wall arkasında bekleyen defender'ı cezalandırır, ayrıca post-plant'te spike üzerinde defuse deny yapar. Rolling Thunder (ulti) B site gibi compact alanlarda tüm takımı etkiler.
- **Killjoy**: B anchor için en iyi agent. Turret B Main'i izlerken Alarm Bot kapı tarafını veya kırık duvarı kontrol eder. Nano Swarm duvarın kırılma anında veya post-plant'te spike üzerinde çok değerli. Lockdown B site'ta execute'u tamamen durdurabilir. A site'ta turret Silent Drop'u izleyebilir.
- **Fade**: Haunt 3 site'a bilgi toplama yapar — Lotus gibi geniş haritada bu bilgi altın değerinde. Prowler rotating door arkasını ve dar koridorları kontrol eder. Nightfall A Main veya B Main gibi dar giriş noktalarında tüm saldırı grubunu etkiler. Seize post-plant'te defuse deny için kullanılabilir.
- **Omen**: Shrouded Step ile rotating door'u ses yapmadan bypass edebilir — defender kapı sesini beklerken sen zaten karşı taraftasın. Dark Cover ile 3 site arasında smoke atabilir. Paranoia dar koridorlarda (A Main, B Main) çok güçlü — tüm girişi körleştir. From the Shadows (ulti) ile map'in herhangi bir yerine TP yaparak defender'ın setup'ını tamamen bozabilirsin.
- **Viper**: Toxic Screen (wall) ile A-C arası veya B-Mid arası bölebilir — tek ability ile 2 site'ı etkiler. Poison Cloud (orb) ile üçüncü site'ı kontrol eder. Snake Bite lineup'ları Lotus'un her 3 site'ında defuse deny yapabilir — post-plant'te çok güçlü. Viper's Pit compact site'larda (B site) alanın tamamını kaplar.
- **Skye**: Guiding Light (flash) kapı arkası için ideal — kapının diğer tarafına flash atıp teammate'in geçişini güvenli kıl. Trailblazer dar koridorlarda ve kapı geçişlerinde bilgi toplama için mükemmel — dog ile kapı arkasını, Silent Drop'u ve mid'i kontrol edebilirsin. Seekers (ulti) 3 site'li haritada tüm düşman pozisyonlarını açığa çıkarır.
- **Harbor**: Lotus'ta S-tier. High Tide geniş bir su duvarı oluşturarak 3 site arasında geçiş smoke'u sağlar — tek ability ile A Main'den C Main'e kadar sightline kırabilir. Cove spike'ı korumak için mükemmel — bubble içinde defuse yapmak neredeyse imkânsız. Cascade A Main push'unu destekler ve giriş smoke'u olarak kullanılabilir. Reckoning (ulti) geniş site'larda çoklu oyuncuyu vurur.

## 10. Post-Plant Stratejileri
- **A Site Post-Plant**: Spike A Default'a (kutuların arkasına) dik. Post-plant pozisyonları: A Main ve A Root crossfire kur — defender A Stairs veya Tree'den gelecek, iki taraftan ateş altına al. Tree'yi smoke'la ki defender yükseklik avantajını kullamasın. Silent Drop'u kontrol et — defender Drop'tan düşüp spike'a ulaşabilir.
- **B Site Post-Plant**: Spike B Default'a dik. Post-plant pozisyonları: B Main ve kırık duvar arkası crossfire — defender B Upper'dan rotate edecek, iki açıdan karşı. Kırık duvar post-plant'te avantaja dönüşür çünkü defender'ın yaklaşmak zorunda olduğu ek bir açı yaratır. Lineup'lar B site'ta çok güçlü — Viper Snake Bite ve Brimstone Incendiary ile spike üzerinde defuse deny yap.
- **C Site Post-Plant**: Spike C Default'a (Waterfall tarafına) dik. Post-plant pozisyonları: C Main ve C Mound crossfire — Mound'un yükseklik avantajını post-plant'te kullan. Waterfall'ı izle çünkü defender oradan yaklaşmaya çalışacak. C Hall'dan gelen rotate'u kontrol et.
- **Kapı Kullanımı Post-Plant'te**: Spike A veya C'ye dikildiğinde rotating door ile pozisyon değiştir. A'ya spike dikilmişse 1 kişiyi kapı üzerinden C tarafına gönder — defender A'ya retake yaparken kapı arkasında bir oyuncu bekler. C'ye spike dikilmişse kapı ile A tarafına 1 kişi gönder. Bu defender'ın retake planını tamamen bozar çünkü hem site içi hem kapı arkası kontrol edilmek zorunda kalır.
- **3 Site Retake Süresi**: Lotus'ta defender rotasyonu uzun sürer çünkü 3 site var. Bu post-plant için avantajdır — spike dikildikten sonra zaman senin tarafında. Defender retake için toplanmak zorunda ve bu süre spike'ın tıklamasını senin lehine çalıştırır. Lineup'lar ve delay utility bu yüzden Lotus'ta diğer haritalardan daha değerli.

## 11. Anti-Strat İpuçları
- Rakip her round B duvarını kırıyorsa: duvar arkasında beklemeyi kes, bunun yerine duvar kırılma anında peek yap ve trade al. Nano Swarm veya molly'yi duvarın kırılma noktasına koy — kırıldığında geçiş yapan oyuncuyu cezalandır.
- Rakip rotating door ile sürekli rotate ediyorsa: kapının iki tarafına da sentinel utility koy (tripwire veya alarm). Kapı açıldığında bilgiyi hemen al ve karşı taraftan peek yap — kapı açıkken geçiş yapan oyuncu savunmasızdır.
- Rakip A Silent Drop kullanıyorsa: Drop altına tripwire, turret veya alarm botu yerleştir. Bu utility olmadan Drop'u sürekli peek etmen gerekir ki bu seni A Main'e karşı savunmasız bırakır. Drop kontrol altındayken defender A Main'e odaklanabilir.
- Rakip C Mound'da agresif oynuyorsa: C Main'den Mound'a early smoke at ve flash ile contest et. Agresif Mound oyuncusu smoke içinden push yapmak zorunda kalır — bu senin avantajına döner. Alternatif olarak Mound'u ignore et ve site'a farklı açıdan gir.
- Rakip 3 site arasında yayılarak default oynuyorsa: mid kontrolu al ve split execute yap. Mid'i kontrol edersen haritayı ikiye bölersin — rakibin yayılmış setup'ı split'e karşı çok zayıftır çünkü her site'ta 1-2 kişi var ve rotate süresi uzun.
- Rakip kapı sesini fake olarak kullanıyorsa (açıp geçmiyorsa): kapı açıldığında hemen rotate etme. Kısa bir süre bekle ve bilgiyi doğrula — teammate'in karşı site'ta görsel temas kurması gerekiyor. Fake kapı sesi bir pattern'dir ve fark ettiğin anda avantajın sana geçer çünkü rakip zamanını kapı fake'ine harcamış olur.
- Rakip post-plant'te kapı kullanıyorsa: retake sırasında kapının iki tarafını da kontrol et. Kapı arkasında bekleyen oyuncuyu flush etmek için flash veya molly kullan. Kapıya utility atmadan retake yapma — kapı arkasındaki oyuncu seni side'dan vurur.
- Rakip B'de KJ/Cypher setup'ı kullanıyorsa: execute öncesi Raze Boombot veya Fade dog ile utility'yi tetikle. KJ turret'ini ve alarm'ını tetiklemeden B push yapmak delay yemek demektir — delay yersen rotate gelir ve sayı üstünlüğü kaybolur.
