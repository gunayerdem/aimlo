// ════════════════════════════════════════════════════════════════════
//  AUTO-GENERATED — gen-feedback-bank.mts ile gpt-5-mini + GERÇEK KB'den.
//  20 TR + 20 EN örnek koç-feedback'i. Yeniden üret: npx tsx gen-feedback-bank.mts
// ════════════════════════════════════════════════════════════════════
export type FeedbackExample = { agent: string; map: string; side: string; location: string; lang: "tr" | "en"; title: string; deathAnalysis: string; enemyPatterns: string; nextRoundPlan: string };
export const FEEDBACK_BANK_TR: FeedbackExample[] = [
  {
    "agent": "Jett",
    "map": "Ascent",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main kuru entry",
    "deathAnalysis": "A Main'de tek başına kuru entry yapıp öldün; entry öncesi flash veya smoke yoktu, trade pozisyonu da bulunmuyordu — bu yüzden ilk mermiyle düştün. A Main'e girmeden önce bir flash bekle veya kendin 0.5 saniyelik high flash at, sonra dash ile gir; yanında mutlaka bir teammate trade pozisyonunda beklesin.",
    "enemyPatterns": "Rakibin A Main açısını uzun süre tuttuğu veya Heaven/Generator'dan first shot alacak pozisyonlarda beklediğine dair veri var; bu açıyı flash olmadan cezalandırıyor olabilir.",
    "nextRoundPlan": "Round başında A Main'e flash atılmadan girme; bir teammate A Main girişinin hemen arkasında trade pozisyonunda beklesin ve flash patladığı an dash ile giriş yap."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek cezası",
    "deathAnalysis": "Hookah'ta kill sonrası agresif overpeek yapıp aynı açıdan tekrar öldün; kill sonrası kapak yerine geniş açıyla tekrar swing atman seni Hookah'ın karşı ateşine bıraktı, bu yüzden ölümün util veya trade olmadan tek başına oldu.",
    "enemyPatterns": "Rakip Hookah'da ikinci bir oyuncu bekliyor olabilir — senin overpeek'in boşluk verdi ve karşı açıdan trade aldı.",
    "nextRoundPlan": "Kill aldıktan sonra hemen kapak arkasına geç, Devour/regen benzeri bir bekleme zamanı kullan ya da saniyelik delay ile teammate'in flank/trade pozisyonunu bekle; Hookah'da aynı açıyı iki round üst üste kullanma."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven'da aynı açıdan öldün",
    "deathAnalysis": "B Heaven'da tek başına, utility olmadan erken peek atıp öldün — Heaven seni görüyor ama sen onu göremiyorsun; bu yüzden önce smoke veya molly atmadan ya da en azından bir teammate trade pozisyonunda olmadan Heaven açısına bakma.",
    "enemyPatterns": "Rakip Heaven pozisyonunu korumuş gibi görünüyor; tekrar eden tek-kişilik Heaven peek'leri seni cezalandırıyor olabilir.",
    "nextRoundPlan": "Heaven için bir smoke at, bir teammate’i B Main trade pozisyonunda tut ve smoke patladığı anda birlikte swing at; alternatif olarak smoke yoksa retake'i takımla birlikte başlat, tek başına Heaven'a bakma."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main hızlı giriş",
    "deathAnalysis": "A Main'da utility'siz hızlı giriş yapıp Tree ve Stairs açılarına aynı anda maruz kaldın; bu yüzden ilk atışı alamayıp düştün. Tree'yi smoke'la veya teammate'ten flash iste, Fast Lane duvarını açıp sprint ile gir; utility yoksa kuru entry yapma.",
    "enemyPatterns": "Rakip A Tree/Stairs iki açıyı tutuyor; oradan sabit bekleyip ilk atışı veriyor olabilir.",
    "nextRoundPlan": "Round başında Tree'ye smoke at, Stairs yönüne flash gelince Fast Lane aç ve sprint ile içeri gir; utility yoksa bekle, tek başına kuru koşma."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long'u Tekrar Etme",
    "deathAnalysis": "C Long'da aynı geniş açıdan üst üste öldün — rakip senin swing zamanlamanı ve açıyı kullanıyor; o açıda sabit beklendiğinde op veya rifler seni kolayca kafa vuruşuyla alıyor. Callout: C Long'da aynı geniş açı tekrarı öldürür; bir round farklı bir micro-position al.",
    "enemyPatterns": "Bu tekrar, o açının önceden nişanlandığını ve seni beklediklerini gösteriyor olabilir — rakip o hatayı cezalandırıyor.",
    "nextRoundPlan": "C Long'a girerken önce Plat'ı smoke'la veya flash ile körle; eğer smoke yoksa geniş açı yerine daha dar bir off-angle (Plata yakın, kutu arkasına yaslanmış) tut veya Garage üzerinden C Connector ile split yap."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main'da flash yok, giriş yedin",
    "deathAnalysis": "A Main'da flash atmadan giriş yaptın; ilk temasta kafadan vuruldun çünkü Elbow'daki savunucu nişanını sabitlemişti. Curveball sağ eğri at, flash patlar patlamaz geniş açıyla swing at ve Elbow'da bir oyuncu bırakılacak şekilde zamanlamayı ayır.",
    "enemyPatterns": "Eğer aynı roundlarda tekrar olduysa bu pozisyon okunuyor olabilir; Elbow'u bekleyen oyuncu o hatadan faydalanıyor.",
    "nextRoundPlan": "Sol eğri Curveball hazırla, flash patlar patlamaz geniş açıyla dışarı çık — ilk kişi girdiğinde arkasından bir teammate Elbow'da trade pozisyonunda beklesin."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt Operator Tuzaklanması",
    "deathAnalysis": "Operator ile A Belt'te ilk mermiyi kaçırdın ve aynı off-angle'da kaldın; saldırgan ikinci atışı bekleyip seni kafadan aldı — hatan: pozisyon değişimi yok. Callout: aynı açıdan bir kez ıskalanınca hemen kısa lateral pozisyon değiştir (crate arkasına, biraz daha içeri ya da biraz daha dışa), çünkü aynı yerde beklemek ikinci mermiyi kesinleştirir.",
    "enemyPatterns": "Rakip A Belt'te birinci atışta nişanı düzeltmeyi bekleyen Operator oyuncusu kullanıyor; aynı açıyı tekrar eden oyuncuları bekleyip ikinci atışı kesiyor.",
    "nextRoundPlan": "İlk Operator atışı ıskalandığında anında küçük off-angle değiştir: crate arkasına çekil veya 0.3s kadar geri adım atıp tekrar peek at; takımın yanında biri trade pozisyonunda beklesin."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors’ta smoke çıkışı",
    "deathAnalysis": "Kendi smoke'unun dışından Mid Doors'a yürüyüp peek attığın için Shops/Plaza'dan önceden nişanlanmış bir oyuncuya kapak verdin; smoke'un arkasında bekleyip swing eden off-angle'ı görmedin, bu yüzden öldün.",
    "enemyPatterns": "Mevcut veride tekrar yok; sadece bu roundda smoke dışından peek atman seni doğrudan cezalandırdı, düşman pozisyonu smoke kenarını kapatmış olabilir.",
    "nextRoundPlan": "Smoke yüksek ve one-way koy; smoke içindeyken jiggle peek ile bilgi al, tam commit etme; eğer dışarı çıkacaksan önce Paranoia veya takım flash'ı ile görmeyi zorla, sonra sağlam trade pozisyonunda çık."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main'da Op ile ölünme",
    "deathAnalysis": "A Main'da Operator ile öldün ama Tour de Force kullanmadın — öldüğünde op düşmedi, çünkü düşerken silah bırakmak yerine açıda kaldın; A Main Tree/Stairs hattında tek atış, sonra teleport ya da cover arası eksik kaldı.",
    "enemyPatterns": "Rakip A Main Tree/Stairs hizasından tek atış bekleyip trade alacak şekilde pozisyon kuruyor olabilir; bu açıları kontrol etmeden tek atışla kafayı hedeflemeye devam edersen yine op'lu birini yenersin.",
    "nextRoundPlan": "A Main'e girerken önce Tree'yi smoke'la, Stairs yönüne flash at; bir atış al, hemen TP ile cover'a geç; öldüğünde op yere düşsün diye açıkta kalma."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel rotasyon gecikmesi",
    "deathAnalysis": "B Tunnel'da öldün çünkü rotasyonu geç başlattın; 1 tur önce B Tunnel'da 1 kez öldüğün ve bu turda yine aynı noktada ölüp rotasyonda geciktiğin gözlemi var, bu yüzden kill feed'le trade gelmeden saha boş kaldı; callout: rotasyonu timingle başlat, çünkü gecikme seni yalnız bıraktı.",
    "enemyPatterns": "Rakipler B Tunnel'dan hızlı entry/peek yapıp rotasyona karşı anlık trade fırsatı yaratıyor olabilir — bu pozisyonda onlar seni tek kişiyle cezalandırdı.",
    "nextRoundPlan": "Tur başladığında B Tunnel'dan ölünce hemen 0.5–1s içinde rotate başlat; eğer teammate B site'da ses/utility görmediyse önce turret/alarmbot ile bilgi al, ardından açı değiştirmiş rotasyonla gel."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard Eco Ölümü",
    "deathAnalysis": "Mid Courtyard'da geniş açıdan kuru peek atıp öldün; eco round'da Classic/Shotgun karşısında uzun açıyı kazanma şansın düşük — B Main/Market rotasını kontrol eden saldırgan seni kafadan cezalandırdı. Net çözüm: geniş açı yerine Pizza/Cubby arkasından kısa swing at veya smoke ile sightline kapatıp dar açıda fight aç; entry'den önce slow orb ile yaklaşmayı zorlaştır.",
    "enemyPatterns": "Son eco turunda rakip uzak hattı tercih etti ve geniş açıdan tam kafa vuruşu alabildi; bu pozisyonda uzak mesafeden one-tap ihtimali yüksek.",
    "nextRoundPlan": "Bu round'da Mid Courtyard'da açık geniş açı alma; önce smoke at veya Cubby'den kısa swing yap, eğer eco rakipse uzak hattı risk etme."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail'da solo giriş hatası",
    "deathAnalysis": "Mid Mail'da trade pozisyonu olmadan tek başına girdin, biri Garage/Heaven veya Mail içinden gelip seni aynen vurdu; solo girişin trade vermediği için death bedava oldu, bir kişi Mail'den çıkış yaparken yanında en az bir trade pozisyonunda dur.",
    "enemyPatterns": "Rakip Mail/Garage açısını trade'e hazır bekleyebiliyor, tek oyuncuya karşı hızlı trade kuruyor olabilir.",
    "nextRoundPlan": "Mail'e girmeden önce bir arkadaş Mail girişinin arkasında trade pozisyonunda beklesin; sen Haunt+Prowler zincirini başlatırken ikinci oyuncu Mail koridorunu izle ve Prowler bağlandığında 'swing atın' diye komut verip birlikte girin."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'ta Utility-boşa",
    "deathAnalysis": "Garage girişinde utility (smoke/flash) atıp bilgi almadan ilerledin; Garage'da Window ve Connector riski var, bu yüzden utility harcayıp pozisyonunu açınca op/angle bekleyen seni kafadan indirdi. Callout: utility'yi atmadan önce Window'dan bir trade ya da Sova recon/Skye dog gönderip bilgi al.",
    "enemyPatterns": "Rakip Garage'ı kontrol ediyor gibi duruyor; Window/Connector hattını kapatmadan utility'yi harcayan oyuncuları cezalandırıyor olabilir.",
    "nextRoundPlan": "Bu round Garage'a girişte önce bilgi al: bir teammate Window'dan trade pozisyonunda olsun veya Sova recon/Skye dog ile bilgi getir; smoke patladığı anda flash ile birlikte swing at veya iki yönlü split yap."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short erken terk",
    "deathAnalysis": "A Short'ta anchor'ı erken bıraktın; Heaven/ Lamps açısı hâlâ kontroldayken teleporter ve A Bath yönünden coming swing'leri alıp öldün. Anchor pozisyonunu erken terk etmen crossfire'ı kırdı ve seni tek hedef haline getirdi.",
    "enemyPatterns": "Rakip A Short/Teleporter eksenini cezalandıracak şekilde dönüşümlü peek atmış olabilir — aynı round içinde A Short boş kaldığında hızlı flank/peek ile trade alıyorlar.",
    "nextRoundPlan": "A Short'ta bir kişi anchor kalana kadar pozisyonu bırakma; anchor çıkışını takım ile koordineli yap (smoke veya flash patlayınca çık), teleporter çıkışına bakacak birini bırak; yoksa A Short'ı terk etme."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link'te smoke geç kaldı",
    "deathAnalysis": "B Link'te öldün çünkü smoke'ı zamanında atmadın; giriş başladığında smoke hâlâ animasyondaydı ve rakibin B Link açılarını kesemediğin için silhouette verdin.",
    "enemyPatterns": "Son 3 round verisi yok; mevcut gözleme göre B Link'e giren rakipler smoke window'undan önce pozisyon alıyor olabilir — elimizde tekrar eden pattern kanıtı olmadığı için kesin söyleyemem.",
    "nextRoundPlan": "Smoke'ı round başında yıldızla hazırla ve rakip ayak sesi/partner'in B Main baskısını duyduğun anda Nebula'yı aktif et, ardından takımına 'go' verip B Link'e birlikte gir; alternatif olarak smoke gecikirse Gravity Well ile giriş penceresini kapat ve Nova Pulse ile destek ver."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market Lurk Ölümü",
    "deathAnalysis": "B Market'te lurk yaparken arkandan yakalandın çünkü backline'ı temizlemeden globülü toplamak için yere indik; bu yüzden B Market entry'si açık kaldı ve flank alındı. Globülü attıktan sonra önce Market Back veya B Alley'e kısa bir check yap, globülü toplamak için yere inme yerine Wingman atıp plant sonrası toplama opsiyonunu kullan; böylece arkadan gelen trade veya flank'i kesersin.",
    "enemyPatterns": "Son birkaç round'da B Market arkasına sessiz rotate'ler geldiğini gösteren net veri yok, bu yüzden düşman analizi için yeterli veri yok.",
    "nextRoundPlan": "Bu roundta globülü attığında önce Market Back'i sesle kontrol et veya bir teammate'ten kısa bir ping iste, globülü yerde bırakıp doğrudan değil Wingman ile plant yaptır; globülü güvenli yerde topladıktan sonra tekrar geri dön."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "TP sonrası gereksiz agresyon",
    "deathAnalysis": "TP sonrası Mid Boiler'da takipsiz agresyon yüzünden öldün; TP ile varıp hemen dry swing atıyorsun, karşıda opp bir köşe tutuyorsa seni anında kilitliyor — TP'ye girince flash elinde hazır olmalı ve spawn/boiler giriş açısını kapatan off-angle'ı kontrol et. Callout: TP'ye gir, Blindside veya flash patlatıp swing at.",
    "enemyPatterns": "Son 5 round verisinde Mid Boiler TP girişlerinden sonraki anlık kill'ler var; bu tekrar, TP girişinde seni bekleyen bir oyuncu olabileceğini gösteriyor olabilir.",
    "nextRoundPlan": "TP geldiğinde önce flash at, flash patladığı anda Blindside ile içeri gir; yoksa TP'yi dumanın arkasına veya kutu arkasına göm ve team ile birlikte entry başlat."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "C Mound'da öldün çünkü Fault Line gelip takım girerken stun zamanlaman tutmadı; stun bittikten sonra takımın swing atamadı ve sen açıkta kaldın. C Mound pozisyonun yüksek ama cover yok, stun penceresini takımın giriş zamanıyla eşleştirmezsen trade alamazsın.",
    "enemyPatterns": "Son 3 roundda C Main'den gelen girişlerde takımın erken bekleyip stun sonrası alanı temizlediği görüldü; stun'ı tek başına atman takımın girme onayı olmadan etkisiz kalıyor.",
    "nextRoundPlan": "Bugün şu şekilde yap: Fault Line atmadan önce sesli 'Fault Line şimdi' de, takım 'ready' verene kadar bekle; takım hazır diyorsa Fault Line at, 0.2s sonra Fault Line patlamasıyla paralel olarak Flashpoint at ve takım içeri girsin; alternatife olarak Fault Line'ı kısa aralıkla iki kere at (ilk atış bait, ikincisi gerçek) ki takımın timing hatasını ört."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main'de bıçak sonrası ölümü",
    "deathAnalysis": "B Main'de knife attın ama suppress sonrası hemen baskı kurmadın; 1vX'e girip tek başına fight verdin ve öldün. B Main'de bıçağı vurduktan sonra takımınla 1-2 adım uyumlu hareket et; bıçağın sonucu neyse (kaç suppress) anında sesle belirt, sonra entry kişi ile aynı anlarda içeri girin.",
    "enemyPatterns": "Son roundda B Main'de bekleyen savunucu dar açıdan sabit bekliyordu; bıçak sonrası tek başına içeri girince trade gelmedi ve savunucu seni kafadan cezalandırdı.",
    "nextRoundPlan": "Bıçak vurunca hemen bağır: 'bıçak X', entry ile 0.5s içinde içeri gir, sen flash at; eğer suppress 0 ise rotayı değiş, B Main'e tek başına commit etme."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "Wall zamanı kaçtı",
    "deathAnalysis": "A Hall'da wall'u yanlış zamanda açtın; wall açılır açılmaz A Hall'da 1 kez öldün çünkü duvar takımının görüşünü kesip seni exposed bıraktı, wall açma zamanın koridorun kontrolüyle uyuşmadı — wall'ı entry sırasında değil, takım geçtikten sonra kapat. Callout: wall timing'ı seni öldürdü.",
    "enemyPatterns": "Rakibin A Hall'da duvar açılır açılmaz trade veya prefire ile seni cezalandırdığına dair veri var; bu pozisyonu wall açılmasına karşı agresif tutuyor olabilir.",
    "nextRoundPlan": "Round başı wall'ı A Hall'e koymadan önce takıma “ben wall açacağım, siz geçin” diye çağır; entry tamamlanınca wall aç, takımı kör bırakacak şekilde değil, rotasyonu bölüp sonra kapat; alternatif olarak 1 round duvarı 10° kaydır ve orb'u post-plant için sakla."
  }
];
export const FEEDBACK_BANK_EN: FeedbackExample[] = [
  {
    "agent": "Jett",
    "map": "Ascent",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main solo entry",
    "deathAnalysis": "You died because you committed a dry entry from A Main alone and there was no teammate in trade range; instead of peeking after a flash or with a partner you walked into a crossfire and lost the first duel.",
    "enemyPatterns": "Holding A Main with an off-angle or Heaven pre-aim punishes solo A Main entries because defenders only need one reliable shot to win the fight.",
    "nextRoundPlan": "Wait for a flash or have one teammate immediately offset in trade range at A Main before you dash; if flash is unavailable, delay the entry and approach with a two-player peek from A Main and A Short simultaneously."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek",
    "deathAnalysis": "You got the kill in Hookah then overpeeked into B Site and died — after a frag you stayed exposed instead of resetting behind cover, which left you vulnerable to the second CT from Elbow; when you frag in Hookah always Devour behind the window or hide on the ledge before re-peeking because Reyna's value is surviving the follow-up, not hunting extras.",
    "enemyPatterns": "Defenders at Elbow or B Garden often hold the immediate trade angle after a Hookah death and will punish an immediate second peek into site.",
    "nextRoundPlan": "After your next Hookah kill, immediately use Devour behind the ledge or fall back to the doorway, then wait 0.8–1.2s for teammate info before re-peeking; if pressured from Elbow, Dismiss into cover instead of hunting the frag."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven Death",
    "deathAnalysis": "You died alone at B Heaven during a late, staggered retake because you pushed the high angle without trade support and without a utility dump to flush the player at Heaven; pushing solo into Heaven from B Main left you exposed to a single overhead angle and you were isolated when trades didn’t arrive.",
    "enemyPatterns": "When defenders hold B Heaven they win isolated duels from height and rely on attackers coming in one-by-one to convert easy trades.",
    "nextRoundPlan": "Do not solo-swing Heaven; coordinate: have one teammate commit to B Main entry while you or a teammate use a flash/molly into Heaven, then both cross into site at the same moment to secure the trade (alternative: delay and take B Back crossfire together if Heaven utility is unavailable)."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main death — no utility",
    "deathAnalysis": "You died at A Main because you sprinted into Tree/Stairs sightlines without any utility; entering fast and utility-less at A Main left you exposed to pre-aimed angles, so you were killed before slide trade could happen.",
    "enemyPatterns": "When players hold A Main, they typically pre-aim Tree and Stairs simultaneously and punish clean, utility-less entries into that choke.",
    "nextRoundPlan": "Throw Fast Lane on A Main, wait for a flash or smoke from a teammate (or pop a flash yourself), then sprint-slide as the flash blooms so you reach Tree/Stairs while their aim is disrupted; if no utility is available, delay and take a different entry angle (Root or Silent Drop) instead."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long repeat punish",
    "deathAnalysis": "You died at C Long after taking the same wide angle repeatedly; that repetition made you an easy pre-aim target — stop giving a predictable peek. Change your entry: first use a high/low Recon Bolt to force a head turn, then wide-swing only while a teammate flashes or makes noise from Garage so you’re traded, because repetition lets defenders pre-aim and win the duel.",
    "enemyPatterns": "Holding C Long from elevated Plat/CT with pre-aim on the wide cross gives defenders an instant first-shot advantage against repeated wide swings.",
    "nextRoundPlan": "Use Owl Drone to check Plat, land a high Recon Bolt to change the angle, have a teammate flash Garage, then clear C Long with a coordinated swing — alternate to a tighter off-angle if the high dart is taken out."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main entry — No Flash",
    "deathAnalysis": "You pushed A Main and died because you entered without a Curveball; that gave the A Main defender an unbroken aim window and you took the first shot. Next time, throw a right‑arc or left‑arc Curveball for that exact corner and start your swing the instant the flash pops so you take the trade or secure the entry.",
    "enemyPatterns": "A Main defenders are holding the tight bend for first‑shot angles and punish dry commits with pre‑aimed crosshair at head level.",
    "nextRoundPlan": "Stand off the corner, call ‘right flash’ or ‘left flash’, cast the Curveball around the bend and begin your swing the moment it detonates — do not wait to peek after the flash."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt — Don’t Facecheck Twice",
    "deathAnalysis": "You missed the first Operator shot at A Belt and stayed holding the exact same off-angle, so the next swing punished you; stop re-holding the identical pixel after a miss and immediately move to a new micro-angle or fade back to cover, because repeating the same aim lets the opponent pre-aim the exact line.",
    "enemyPatterns": "When an Operator gets a missed shot at A Belt, they tend to hold that same line expecting a reset, so repeating the same position becomes a predictable kill angle.",
    "nextRoundPlan": "After any missed long-range shot at A Belt, step off the pixel: either reposition 0.5–1m to the left/right before re-aiming or back into cover and re-peek after a flash from teammate."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors peek",
    "deathAnalysis": "You stepped out of your own smoke at Mid Doors and died because you presented a predictable silhouette; instead smoke edge then jiggle from cover or commit a full wide swing after the smoke clears so you aren't the same visual every round.",
    "enemyPatterns": "Holding Mid Doors from Shops/Plaza punishes players who exit smoke the same way because they can pre-aim the doorline and win the duel.",
    "nextRoundPlan": "Smoke Mid Doors high, jiggle from the left crate for information — if you see an angle, fall back and let a teammate trade; if clear, wide-swing with a flash timed to detonate as you exit the smoke."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator Drop",
    "deathAnalysis": "You died at A Main after an Operator duel and didn’t drop the rifle; because you held the body and attempted a close follow-up fight at A Main, you lost both yourself and the weapon—next time, after losing the duel or taking a trade-hit at A Main, immediately toss the Operator or call for a drop instead of fighting for a second duel.",
    "enemyPatterns": "At A Main on Lotus, defenders punish prolonged fights by isolating the duelist and forcing close-range re-peeks that win duels and deny weapon recovery.",
    "nextRoundPlan": "If you die early at A Main, immediately type ‘drop’ and the side (e.g. ‘A Main drop’) so a teammate can recover the Operator, or throw the rifle toward cover before re-peeking to preserve team economy."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel - Late Rotate",
    "deathAnalysis": "You died at B Tunnel because your rotation started late and you entered without turret/alarm pre-setup; instead of delaying, commit the rotation with turret scout first so you have info before entry.",
    "enemyPatterns": "Holding B Tunnel from the choke punishes late rotators who arrive without turret or alarm support because they can pre-aim the tunnel and swing you as you come in.",
    "nextRoundPlan": "Rotate earlier next round: move at 30–35s, place turret to watch the tunnel before you step in, drop alarmbot+nanoswarm on the default B entry so your arrival is covered."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Overextend",
    "deathAnalysis": "You pushed wide at Mid Courtyard on an eco round and died because you committed without cover and without slow orb—your body was fully exposed to long sightlines; next time hold the corner in cubby or use slow orb before peeking so you aren't a stationary target.",
    "enemyPatterns": "On wide Courtyard peeks, defenders punish exposed bodies from Top Mid/Arches sightlines with single long-range shots.",
    "nextRoundPlan": "Hold Cubby at Mid Courtyard or throw slow orb into the choke, wait for a trigger (ally sound or utility) then wide-swing; do not walk fully exposed on eco."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail — No Trade",
    "deathAnalysis": "You entered Mid Mail alone and died because there was no teammate in a trade position; solo entry into a choke lost the 1v1 immediately, so stop taking isolated Mail peeks without backup and instead coordinate a buddy to hold the swing angle one step behind you.",
    "enemyPatterns": "Players anchoring Mid Mail punish single isolated peeks by holding tight post-aim on the chokepoint and converting lone swings into instant trades or refrags.",
    "nextRoundPlan": "Have one teammate stand directly behind your entry point in Mail (trade distance), call your push, flash Mail before stepping and commit together — if your trade isn’t immediately available, reset and retake with utility rather than forcing a solo peek."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage Death — Stop Wasting Utility",
    "deathAnalysis": "You used your flash and dog in Garage without first getting recon or a window peek, so you walked into blind angles and died; next time hold your utility until someone else confirms Window or throw a short recon drone/peek yourself before committing so your abilities don’t bait your team into a blind entry.",
    "enemyPatterns": "Defenders in Garage punish utility-first attackers by holding tight off-angles and pre-aiming common dog paths, waiting for the utility to land before firing.",
    "nextRoundPlan": "Do not send dog or flash into Garage until Window or Connector is cleared — either have Sova/ally tag Window, drone Window yourself, or send the dog only after a window peek confirms no passive hold."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "A Short Anchor Drop",
    "deathAnalysis": "You left A Short anchor too early and gave up Heaven/Lamps crossfire timing; hold A Short until a clear trigger (teleport sound + teammate trade window) or rotate after a confirmed call, because exiting that anchor created an untradeable 1-for-0 and opened Heaven sightlines.",
    "enemyPatterns": "When A Short anchor vacates early, defenders (or an Op in Heaven) exploit the timing to swing or pre-aim Heaven/Lamps and convert untraded kills.",
    "nextRoundPlan": "Stay on A Short anchor until either you hear the teleporter animation and a teammate calls a flank or you get a concrete trade window from a nearby teammate; if you must leave, hand the short angle to a teammate while you reposition to Lamps or Heaven for a proper crossfire."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "B Link - Late Smoke",
    "deathAnalysis": "You pushed B Link and died because your Nebula came late, leaving you exposed while crossing the connector; next time pre-place the star and detonate the Nebula before you step into the link so your body isn't visible when you commit.",
    "enemyPatterns": "When your smoke timing is late, defenders hold B Screen/B Tower angles that punish exposed players crossing B Link.",
    "nextRoundPlan": "Place a star on B Link during buy, call 'smoke ready', detonate Nebula the instant your teammate starts the swing into Link, then gatekeep briefly for trades — or hold the star unspent and use Gravity Well + Nova Pulse in the same choke as an alternate entry if the smoke is denied."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market Lurk Death",
    "deathAnalysis": "You were lurking behind at B Market and got caught from behind while holding Market-side angles; your position left no escape and you had no teammate watching your back — next time hold a deeper off-angle at B Back instead so you can see both Market and Alley, or fall back to Market Side behind the box so a teammate can trade you if you get engaged.",
    "enemyPatterns": "When someone lurks isolated in Market without a teammate covering B Back, defenders punish from the Alley/Back flank because they can swing the unused angle once your attention is forward.",
    "nextRoundPlan": "Start round by dropping one passive sound cue (step forward then back) and take B Back off-angle; if you commit forward into Market, call ‘hold my back’ and position where you can be traded — don’t lurk solo with your back to Alley."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "TP Aggro Mistake",
    "deathAnalysis": "You teleported into Mid Boiler and immediately pushed without a prepared swing or Blindside, dying because the TP arrival was predictable and you had no follow-up; stop TP-entrying unless your flash/join is ready and your first action is a committed swing toward a pre-aimed corner.",
    "enemyPatterns": "Mid Boiler punish is held on tight wide angles that capitalize on predictable TP timings and solo unprepared swings.",
    "nextRoundPlan": "Place Gatecrash behind the crate inside Boiler, keep Blindside ready, have one teammate fake or bait mid audio, then TP and immediately swing the exact corner you pre-aimed; if Blindside is used first, cancel TP and re-hide the orb."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound — mistimed stun",
    "deathAnalysis": "You died on C Mound because your Fault Line hit before teammates committed, leaving you isolated and exposed to crossfire from C Main; wait for the verbal 'on me' and send the Fault Line the instant teammates start their swing so they enter while enemies are still disrupted.",
    "enemyPatterns": "When Breach fires Fault Line early on C Mound, defenders hold the C Main sightline and punish the alone Breach with pre-aimed angles.",
    "nextRoundPlan": "Call 'Fault Line on me' out loud, confirm at least one teammate says 'in', then cast Fault Line and follow immediately — if you don't get confirmation, swap to a Flashpoint through the same wall and let entry happen with the blind instead."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main — failed knife",
    "deathAnalysis": "You threw the knife at B Main but didn’t follow up to exploit suppressed defenders, so you died alone in the choke; next time throw the knife when teammates are one step behind and announce suppress count so they commit with you.",
    "enemyPatterns": "When KAY/O knife lands and attackers hesitate, defenders hold the B Main choke tight and punish the solo entry with crossfire or pre‑aimed spray.",
    "nextRoundPlan": "Knife into B Main, call the suppress number, have one teammate ready to pop‑flash and one in trade position directly behind you — commit on the suppress window."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "Viper — Wall Timing",
    "deathAnalysis": "You opened Toxic Screen in A Hall while your team was still committing, which drained fuel and left no orb for post-plant; keep wall windows short so you don't exhaust fuel and get isolated inside the blind, because that timing cost you visibility and trade potential.",
    "enemyPatterns": "Holding A Hall from the site or cubby punishes a long, predictable screen—they take the safe angle and wait for your wall to finish so they can swing the cleared line.",
    "nextRoundPlan": "Open Toxic Screen as a narrow window when the first teammate steps past A Hall, immediately close it after entry, save orb and at least one Snake Bite for post-plant; if you must wall early, communicate timer to the team and stagger orb for the plant."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
