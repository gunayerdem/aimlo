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
    "title": "A Main'te utility'siz tek başına entry",
    "deathAnalysis": "A Main'de tek başına utility'siz entry atınca ilk mermiyi yedin; trade yok çünkü yanında kimse yoktu. Bir kişi flash atıyor diye bekle, sen entry'yi ona follow et ve diğer oyuncu trade pozisyonunda kalsın.",
    "enemyPatterns": "Rakip A Main/heaven hattını bekliyor olabilir; hep aynı açıyı tuttuğun için kafadan vuruldun.",
    "nextRoundPlan": "Bu roundu tekrarlama — önce teammate'ten flash gör, ardından sen gir; yanında bir oyuncu trade pozisyonunda kalacak."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek",
    "deathAnalysis": "Hookah'da kill aldıktan sonra fazla agresif overpeek atıp dışarıyı göz ardı ederek öldün; burada util yoksa Hookah çıkışını hemen kapatan B Long/Elbow açısı seni kafadan alır. Tek çözüm: kill sonrası kapak arkasına dön, Devour gibi can avantajıysa bile dışarıya tam kontrol sağlanmadan tekrar peek atma.",
    "enemyPatterns": "Karşı taraf Hookah çıkışını agresif tutuyor; kill sonrası hemen wide peek yapan oyuncuları aynı açıdan kafadan kesmeye devam ediyor olabilir.",
    "nextRoundPlan": "Hookah'ta kill aldıysan önce kapak arkasına çekil, jump/wide peek yapma; eğer takım arkadaşı yoksa önce util at (smoke/flash) veya mini jiggle ile info al, sadece sonra temizle."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven'da erken peek yedin",
    "deathAnalysis": "B Heaven'da erken peek atıp kafadan vuruldun; sen Heaven'dan bakarken B Main'den gelen trade veya Garage açıları seni aynı anda kapattı. Heaven'da pasif kal, B Main push gelene kadar peek atma; eğer bilgi yoksa low-profile pozisyona geç ve flash veya molly iste, çünkü açıkken iki yönlü crossfire'a giriyorsun.",
    "enemyPatterns": "Rakip B Main/ Garage hattını trade ve geniş açıyla kontrol ediyor olabilir — Heaven'dan erken peek atınca seni aynı anda iki açıdan kesiyor.",
    "nextRoundPlan": "Heaven'da pasif bekle, B Main sesi veya takım arkadaşının flash'ı gelmeden peek atma; eğer push duyarsan satırını değiştir ve back-of-heaven düşük açıya çekil."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main utility'siz entry",
    "deathAnalysis": "A Main'de utility'siz hızlı entry atarken Tree ve Stairs açılarını beraberce görmüş oldun; utility yokken sprint/slide ile tek hedefe dönüştün, bu yüzden öldün. Tree'ye smoke atılmadan veya Stairs'e flash gelmeden sprint atma.",
    "enemyPatterns": "Rakip Tree ve Stairs'i aynı round içinde tuttu ve seni açıkta yakaladı; bu iki açı A Main'de örtüşüyor ve utility'siz girişleri kesiyor.",
    "nextRoundPlan": "Tree'yi smoke'la, Stairs yönüne flash atılmasını bekle; flash patladığı an Fast Lane/duvar açıp sprint ile slide'la içeri gir; utility yoksa bekle, tek başına entry atma."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long aynı açı",
    "deathAnalysis": "C Long'da aynı geniş açıdan defalarca öldün; bu açıya utility atıp girmezsen op veya sabit kafadan seni kesiyor, o yüzden aynı açıyı tutmayı bırakıp açını değiştir. Bir round C Long'da smoke atarken başka bir yüksek açıdan (plat üstü yerine alçak tavan/duvar köşesi) Recon Bolt indirip giriş yap — dart indiği yerde op nişanını bozamıyorsa hemen başka noktaya geç.",
    "enemyPatterns": "Rakip C Long'u tek bir geniş açıyla tutuyor ve seni aynı hattan kafadan indiriyor; bu tekrar eden pattern, o açının önceden nişanlandığını gösteriyor olabilir.",
    "nextRoundPlan": "Bu round C Long'a girerken önce plat veya CT spawn'ı smoke'la, Recon Bolt'u farklı yükseklikten (tavan köşesi ya da kutu arkası) indir; smoke patladığı ve dart indikten sonra flash atıp swing at; eğer dart vurulduysa hemen başka açıdan entry dene."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main utility'siz giriş",
    "deathAnalysis": "A Main'de flash atmadan içeri girdiğin için Elbow'daki savunucu seni köşeden kafadan vurdu; flash yokken ilk kontak sende değil, düşman pozisyonu hazırdı. Curveball at — flash patladığı anda geniş swing at, flash'i bazen sağ bazen sol eğriyle değiştir; Elbow temizlenince takımınla trade pozisyonu kur.",
    "enemyPatterns": "Elbow açısını kapatan savunucu genellikle köşede bekleyip ilk mermiyi sıfırlıyor, utility'siz girişleri aynı açıdan bekleyip ucuz kill alıyor.",
    "nextRoundPlan": "Bu round Market'ten bir kişi split yapsın; sen A Main'de önce sağ mı sol mı diye ses verip Curveball at, flash patlar patlamaz çık; eğer ilk kontak kaybedilirse ikinci kişi trade pozisyonunda olsun."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt’te op ile aynı açıda kaldın",
    "deathAnalysis": "A Belt’te operator first mermi kaçırdıktan sonra aynı açıda bekleyip karşıdan kafadan vuruldun; sen tel ya da kamera erken bilgi verip retreat etmeliydin — op ile aynı hatta kalmak riskli çünkü missed shot sonrası kafa avantajı düşer.",
    "enemyPatterns": "Rakip op o açıdan first miss sonrası pozisyonu bırakmıyor, aynı hattı kontrol etmeye devam ediyor olabilir (round geçmişinde tekrar kontrol et).",
    "nextRoundPlan": "A Belt’e döndüğünde tel’i choke noktasına taşı, kamera A Belt rotasını izleyecek şekilde yerleştir; op sesi/first miss benzeri bir tetik geldiğinde çekil ve teammate’in trade pozisyonunda olmasını sağla."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors — smoke'tan çıkıp öldün",
    "deathAnalysis": "Mid Doors'ta kendi smoke'unun içinden çıkıp peek attın; smoke'un arkasından çıkmak seni silhouette yaptı ve Mid Top/Plaza'dan bekleyen açı seni kafadan vurdu, doğrudan pozisyon hatası.",
    "enemyPatterns": "Rakip Mid Top/Plaza'da op veya rifler smoke arkasını aktif bekliyor olabilir—sen smoke'tan çıkınca tek açıdan seni kesiyorlar.",
    "nextRoundPlan": "Smoke patladıktan sonra önce jiggle peek ile bilgi al; eğer trade yoksa Shrouded Step veya Paranoia ile pozisyon değiştirip farklı açıdan swing at; smoke'un içinden direkt full peek atma."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main - Operator kaybı",
    "deathAnalysis": "A Main'da op ile kafadan vuruldun ve silah düşmedi çünkü op'lu oyuncu seni one-tap ile yok etti; sen ilk kontakta Headhunter yerine Tour de Force için pozisyon korumayı seçmedin ve teleport ile anında pozisyon değiştirip op'u almak için geri dönmedin.",
    "enemyPatterns": "Karşı taraf A Main'de uzun hatta op tutuyor; senin ilk swing'inde kafadan vurup pozisyonunu koruyorlar.",
    "nextRoundPlan": "Tour de Force hazırsa tüfeği takım arkadaşına bırak; A Main entry'de smoke Tree veya Stairs'e at, flash patladığı an agresif swing atıp bir atış al; öldürürsen hemen teleport ile op'u düşür veya pozisyondan çekil; öldüysen op düştüyse takım alır — op düşürülmediyse hiçbir zaman solo olarak geri dönme."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel tekrar avlandı",
    "deathAnalysis": "B Tunnel'da rotasyonu geç başlattığın için takımın zaten 2v3 iken tek başına orada kaldın ve B Tunnel girişinden kafadan vuruldun; oraya erken gel ve turret/Alarmbot ile koridoru önceden kapat, rotasyon gecikirse o açıdan çekil.",
    "enemyPatterns": "Rakip B Tunnel'e erken yerleşip sabit açıdan peek atıyor olabilir — seni rotasyon gecikince aynı açıdan kafadan vuruyor.",
    "nextRoundPlan": "Round başında rotasyon bayrağını taşı: push sesi duyar duymaz veya takımın ilk kontak aldığında B Tunnel'e erken hareket et, turret+alarmbot'u koridora yerleştir ve girişte trade pozisyonunda bekle."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard — wide peek fiyatı",
    "deathAnalysis": "Mid Courtyard'da eco round'da geniş açıyla peek atıp (dry peek) Op veya yakın mesafe silahın sırtına girdin; açıkta kaldığın için kafadan olan bir atışla öldün. Market rotası veya Pizza'dan kısa jiggle ile bilgi al; geniş açıyla full swing atma, önce low-risk jiggle/sound bait yap ve teammate'ten trade pozisyonu iste.",
    "enemyPatterns": "Rakibin eco veya shotgun/sheriff ile yakın mesafe beklediği verisi yok ancak geniş açıyla çıkınca seni aynı açıdan tek atışla kesmiş olması, orayı tutan bir oyuncunun avantajını net gösteriyor.",
    "nextRoundPlan": "Bu round'da Mid Courtyard'ta geniş açıyla çıkma; önce Pizza veya Market'ten kısa jiggle ile ayak sesi/peek al, eğer teammate 1 kişi hazırsa birlikte swing at ve entry yapanın arkasında trade pozisyonunda bekle."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mail'de solo girdiğin için öldün",
    "deathAnalysis": "Mail girişinde trade pozisyonu olmadan dry olarak girdin; B Mail'de tek başına peek atınca Garage/Pillar veya B Heaven'dan gelen çapraz ateş seni anında aldı. Mail'de solo giriş riskli, çünkü dar koridor ve arka açıları aynı anda göremezsin.",
    "enemyPatterns": "Rakip B Heaven/Garage kombinasyonunu Mail açılışı sırasında trade pozisyonu bekleyerek kullanıyor; tek giriş yapanı çaprazdan veya pillar arkası trade ile kesiyorlar.",
    "nextRoundPlan": "Mail'e gitmeden önce mutlaka 2'li hareket yap: biri Mail'den peek atsın, diğeri trade pozisyonunda Garage/Pillar hattını kapatsın; yoksa flash atıp Prowler/utility ile temizle ve sonra gir."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'da utility'siz yere girip öldün",
    "deathAnalysis": "Garage girişinde utility harcadın ama bilgi yoktu; bu yüzden Window'dan bekleyen rakip seni kafadan vurdu — utility'yi boş yere kullanıp peek atmadın, o yüzden görülmeden öldün.",
    "enemyPatterns": "Window veya Connector açılarından bekleyen rakipler genelde smoke/flash'e değil, boş utility kullananlara karşı sabit açı tutuyor; senin boş util kullanımın onları tek mermiyle kafadan vurma fırsatı verdi.",
    "nextRoundPlan": "Garage'a girme: önce Sova recon/Fade haunt veya smoke at, köpekle ya da drone ile bilgi al; utility patladığı an takımına 'flash/push' diye bağır, flash patladığında swing at veya ikinci kişi trade pozisyonunda beklesin."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short erken terk",
    "deathAnalysis": "A Short'ta anchor pozisyonunu erken bıraktın — Heaven/Triple Box'e bakarken iki round önce aynı anda A Bath'tan gelen girişte öldün; erken çekilince Lamps ve teleporter çıkışını kapatamadın ve arkandan gelen swing seni kafadan vurdu. A Short'tan çıkmadan önce yanında en az bir trade pozisyonu bırak veya Heaven/Triple Box'e geçişi takımınla senkronize et, tek başına yer değiştirip açı boşluğu verme.",
    "enemyPatterns": "Rakip A Bath/teleporter kombinasyonunu takip ediyor olabilir; sen A Short'ı erken bıraktığında arkadan gelen flank/pek break ile seni aynı açıdan kafadan kesiyor.",
    "nextRoundPlan": "Bu round A Short'ta kal; eğer pozisyon değişeceksen önce teammate'in trade pozisyonuna geçiş sinyali ver — ya birlikte çekil ya da hiç çekil."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link smoke gecikti",
    "deathAnalysis": "B Link'te smoke timing'i geç kaldığın için dar koridordan gelen swing'te silahını hedefe koyamadan öldün; B Link'te önde dururken önce smoke atıp sonra peek atman lazımdı.",
    "enemyPatterns": "Rakip B Link'i erken geniş açıyla kullandı, sen smoke patlamadan önce peek atınca ilk kontakta gövdeni gördü ve kafadan vurdu.",
    "nextRoundPlan": "B Link'e girişte önce smoke at, smoke patlayınca jiggle veya peek at; eğer smoke gecikirse geri çekilip takımından trade pozisyonu bekle."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market’e Lurk'ta Arkadan Yakalandın",
    "deathAnalysis": "B Market lurk'ında arkadan yakalandın çünkü Market girişinde flank kontrolü almadan ilerledin; senin pozisyon B Market, uzak koridor değil, flank ihtimali yüksek. Market flank hattını Cypher/Killjoy tuzağı ya da bir teammate ile kapatmadan lurk yapma; peek etmeden önce Market girişine doğru bir tane ses/utility tetikleyicisi bekle veya bir teammate Market side'da trade pozisyonunda dursun.",
    "enemyPatterns": "Rakip B Market arkasını kontrol ediyor olabilir çünkü sen Market lurk'ında tek başına yakalandın — tekrar eden bir pattern için daha fazla veri lazım.",
    "nextRoundPlan": "Bu round'ta Market flankini kapat; ya bir teammate Market side'da anchor olsun ya da flank tuzağı (tripwire/alarm) koyulmuş gibi davranıp önce bir utility patlat, sonra lurk'a gir."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Boiler TP'de agresyon hatası",
    "deathAnalysis": "Boiler'da teleport sonrası takipsiz agresyon yüzünden öldün; TP'yi attın ve hiçbir flash/klon senkronizasyonu olmadan içeri girdin, bu yüzden Boiler girişini tutan rakip seni tek atışla kesti.",
    "enemyPatterns": "Rakip Boiler hattını bekliyor olabilir — sen TP'den çıktığın anda seni karşılayacak açı hazırdı.",
    "nextRoundPlan": "TP atınca önce klonu veya flash'ı patlat, TP'ye girmeden önce Blindside/flash patlayınca swing at; yoksa TP'yi yedekte tut ve takım arkadaşla birlikte entry yap."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "C Mound'da Fault Line atıp takımın girmesini beklemeden kendin swing atmışsın; stun'ı patlatıp takım hazır değilken öndesin, o yüzden kafadan öldün.",
    "enemyPatterns": "Rakip C Main'den bekleyip geniş açıyla seni one-tap'liyor çünkü takımın stun window'unda değil; senin erken swing'in onların crosshair'ine tam hediye oluyor.",
    "nextRoundPlan": "Fault Line atacağını sesli söyle: \"Fault Line Mound geliyor\"; takım onay verene kadar swing atma, stun patlayınca ortak ses ver (\"go\") ve takımınla beraber Mound'a gir."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main Knife Boşuna",
    "deathAnalysis": "B Main'de knife atıp sonra içeri baskı kurmadın; knife sıfır suppress etmiş gibi davranıldı ve sen solo öndün, o yüzden kafadan öldün. Knife vurduktan sonra hemen takım arkadaşıyla B Main entry'ine aynı anda gir — sen flash at, o trade pozisyonunda beklesin.",
    "enemyPatterns": "Bu rondan elde tek veri: knife sonrası içeri girme ihtimaline karşı savunucu B Main'i tutuyordu ve seni kafadan kesti.",
    "nextRoundPlan": "Knife sonucu kaç kişi suppress yediğini anons et, eğer 1+ suppress ise takım olarak B Main'den birlikte girin; sen flash'ı pop et, entry arkadaşın trade pozisyonunda olsun."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall wall hatası",
    "deathAnalysis": "A Hall'da wall'u takım geçmeden önce erken açtığın için 1. Roundda kafadan vuruldun; wall açıkken koridoru keserek kendi backline'ını kör ettin, bu seni tek başına exposed bıraktı. Wall'ı entry öncesi değil, takımın clear edip geçtiği an aç, sonra hızlı kapat; duvar açılıp takım içeri girince hemen tekrar kapat ki arkadan gelen enemy seni göremesin.",
    "enemyPatterns": "Rakip A Hall'da wall açıkken crosshair'ı o hatta tutup seni kolayca kafadan kesti; aynı açıdan bekleyen biri olmuş olabilir, bunun için wall zamanlaman okunabilir hale gelmiş.",
    "nextRoundPlan": "Wall'ı takımın entry yapacağı an aç, takım içeri girdikten sonra kapat; eğer solo anchor durumundaysan wall'ı farklı açıdan (10 derece kaydırılmış) kullan veya orb'u post-plant için sakla."
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
    "deathAnalysis": "You pushed A Main alone as attacker and died because there was no trade position behind you; stop doing solo dry entries into A Main, wait for one teammate to flash or hold immediate trade on A Main before you commit.",
    "enemyPatterns": "Holding A Main from Heaven/Generator punishes solo A Main commits because they pre-aim the choke and win the first duel.",
    "nextRoundPlan": "Coordinate: call \"flash A Main\" and only dash/swing on the flash pop with a teammate ready in A Main to trade; if no flash, sit and bait utility from Heaven then take a slow, paired entry."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek",
    "deathAnalysis": "You got the kill in Hookah then overpeeked and died; after your first frag you left cover and swung the same line—stop giving the site a second easy shot because you lose the trade window and your Devour value. Move back to cover after the kill and Devour first so you enter the next duel at full health.",
    "enemyPatterns": "Players holding Hookah will waste no time retaking or pre-aiming the same angle after a kill, punishing anyone who re-exposes the same line without utility or a heal.",
    "nextRoundPlan": "After your clear in Hookah, immediately fall to cover and Devour; only re-peek from a different angle or after a teammate creates pressure or a flash pops."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven positioning error",
    "deathAnalysis": "At B Heaven you geç retake, tek tek giriş; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds B Heaven and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before B Heaven, then commit together with a teammate."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main entry error",
    "deathAnalysis": "You sprinted into A Main without utility and died because you were exposed to Tree and Stairs angles at once; open with Fast Lane then have a teammate flash or smoke before you commit so you don't arrive as a naked target.",
    "enemyPatterns": "Defenders holding Tree and Stairs punish raw A Main speed-ins by stacking sightlines and waiting for the runner to appear.",
    "nextRoundPlan": "Open Fast Lane, wait for a teammate flash/smoke on Tree or Stairs, then sprint and slide through the cleared angle; if utility isn't coming, take a slower swing from Root instead."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long - Wide Peek Punish",
    "deathAnalysis": "You kept taking the same wide angle at C Long and died for it; stop replaying that exact swing — instead pre-smoke Plat or use a short feint angle so you don’t present the same full body to an Op. Make the change every round you feel pressure from that line.",
    "enemyPatterns": "Holding the long sightline punishes repeated wide swings because they only need to pre-aim the center and you expose your torso on entry.",
    "nextRoundPlan": "Smoke Plat first, send drone from cover to confirm close/plat presence, then either wide-swing with a teammate trade or take the short off-angle entry rather than the same full-body peek."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main — No Flash Entry",
    "deathAnalysis": "You died at A Main because you walked into the choke without a Curveball; entering A Main blind let the defender win the first exchange — next time throw a right-curve or left-curve flash at the corner and start your swing the moment the flash pops.",
    "enemyPatterns": "Defenders holding A Main punish blind commits from the choke by pre-aiming the exit and winning the initial duel.",
    "nextRoundPlan": "Throw a Curveball to the A Main corner, call your flash (\"right flash\"/\"left flash\"), then wide-swing immediately; if flash fails, reset and have a teammate trade from Elbow or Market."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt positioning error",
    "deathAnalysis": "At A Belt you Operator ilk mermiyi kaçırınca aynı açıda kaldı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds A Belt and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before A Belt, then commit together with a teammate."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors positioning error",
    "deathAnalysis": "At Mid Doors you kendi smoke'undan çıkıp peek attı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds Mid Doors and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before Mid Doors, then commit together with a teammate."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main positioning error",
    "deathAnalysis": "At A Main you Operator'la ölünce silahı düşürmedi; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds A Main and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before A Main, then commit together with a teammate."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel positioning error",
    "deathAnalysis": "At B Tunnel you rotasyonu geç başlattı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds B Tunnel and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before B Tunnel, then commit together with a teammate."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard positioning error",
    "deathAnalysis": "At Mid Courtyard you eco round'da geniş açıdan zorladı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds Mid Courtyard and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before Mid Courtyard, then commit together with a teammate."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail positioning error",
    "deathAnalysis": "At Mid Mail you trade pozisyonu olmadan girdi; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds Mid Mail and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before Mid Mail, then commit together with a teammate."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage positioning error",
    "deathAnalysis": "At Garage you bilgi almadan utility harcadı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds Garage and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before Garage, then commit together with a teammate."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "A Short positioning error",
    "deathAnalysis": "At A Short you anchor pozisyonunu çok erken bıraktı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds A Short and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before A Short, then commit together with a teammate."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "B Link — delayed smoke",
    "deathAnalysis": "You died at B Link because your smoke popped after you committed; you walked into sightline while the enemy still had a clear angle. Next time hold until the smoke is live before stepping into the choke or stay behind cover until a teammate confirms the smoke is up.",
    "enemyPatterns": "Defenders punish late utility at B Link by keeping a pre-aim on the choke and taking the first guaranteed shot when the smoke hasn't obscured their angle.",
    "nextRoundPlan": "Place the star on B Link pre-round, activate Nebula so the smoke is fully deployed before you cross the doorway, or if the smoke timing is uncertain, stay in cover and call for a teammate to clear while you anchor the trade angle."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market lurk death",
    "deathAnalysis": "You died at B Market because you were isolated while lurking behind the main push; being alone in Market left you without a trade and vulnerable to a flank that killed you. Move to a concrete recovery point (Market corner by B Market Side) after your peek so you can be traded or call timing instead of holding wide-open behind the group.",
    "enemyPatterns": "When a lone lurker shows in Market, defenders punish with a fast flank or silent rotate into Market alley to isolate and trade-free you.",
    "nextRoundPlan": "Peek Market only with one teammate covering the entry or, if you commit to a solo lurk, delay until after your team contacts B Main and then hold the tight Market corner (not wide behind the push) so you provide a trade window."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler TP Death",
    "deathAnalysis": "You teleported into Mid Boiler and immediately pushed alone without a follow-up or flash, which left you exposing the TP arrival and getting traded; stop using TP as a solo entry tool and plan an immediate action before you arrive, because arriving unready gives defenders a single clear angle to pre-aim.",
    "enemyPatterns": "Defenders holding Boiler punish predictable TP arrivals by pre-aiming the close angle that TP exposes and trading off the first contact.",
    "nextRoundPlan": "Hide the TP behind the crate or in the smoke, tell a teammate to be ready for the trade or pre-pop a flash so you can swing as the TP lands."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound positioning error",
    "deathAnalysis": "At C Mound you stun timing'i takımla uyumsuz; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds C Mound and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before C Mound, then commit together with a teammate."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main positioning error",
    "deathAnalysis": "At B Main you knife sonrası baskı kurmadı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds B Main and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before B Main, then commit together with a teammate."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "A Hall positioning error",
    "deathAnalysis": "At A Hall you wall'u yanlış zamanda açtı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds A Hall and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before A Hall, then commit together with a teammate."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
