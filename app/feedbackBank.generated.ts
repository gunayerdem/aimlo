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
    "title": "A Main utility'siz giriş",
    "deathAnalysis": "A Main'de tek başına utility'siz entry attın ve trade yokken öldün; Heaven veya Generator açısını tutan biri seni pre-aim'le kafadan kesti. Dash'i flash ile senkronize etseydin ellerinde olan ilk mermi avantajını alırdın.",
    "enemyPatterns": "A Main'e utility'siz çıkanlara karşı savunucu Heaven ve Generator'dan sabit pre-aim tutuyor ve bekliyor.",
    "nextRoundPlan": "Takım arkadaşından flash veya smoke iste ve flash patladığı anda dash ile A Main'e gir."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek Reyna",
    "deathAnalysis": "Kill sonrası Hookah'ta gereksiz overpeek yaptın, karşı açı seni tuttu. Kör etme fırlatıp heal ile kapak arkasına geçseydin hayatta kalırdın.",
    "enemyPatterns": "Hookah'ta karşı açı sabit bekliyordu ve overpeek anında seni kafadan kesti.",
    "nextRoundPlan": "Hookah'ta kill sonrası agresyonu kes, kör etme fırlat ve takımından flash isteyip beraber clear et."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven'da tek girip öldün",
    "deathAnalysis": "B Heaven'da geç retake sırasında tek tek girip öldün; Heaven yukarıdan seni kapattı. Raze olarak önce Boombot ile Heaven'ı öne atıp molly'la flush et, sonra Satchel ile içe girseydin hayatta kalma şansın yükselirdi.",
    "enemyPatterns": "Heaven'daki savunmacı sabit pozisyonda duruyor ve yukarıdan siteyi tek seferde kontrol ediyor.",
    "nextRoundPlan": "Boombot öne at, molly'la Heaven'ı flush et ve Satchel ile takım arkadaşının flash'ıyla aynı anda içe gir; Boombot yoksa Satchel'le off-angle'da bekle."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main hızlı giriş",
    "deathAnalysis": "A Main'da bu round'da utility'siz hızlı giriş yaptın; smoke ve flash yok, duvar açılmadan sprint'ledin ve açık görüş hattı'da öldün. Duvar olmadan sprint atıp slide ile köşeye girince takımın trade fırsatı yaratamadı; bunun sonucu ölümdü.",
    "enemyPatterns": "A Main'deki defender bu round'da Tree veya Stairs açılarını sabit tutuyor ve açık alandan seni kafadan vurdu, yani aynı açıdan tekrar bekleyebilirler.",
    "nextRoundPlan": "A Main'da önce duvar aç, takım arkadaşından flash veya smoke iste ve flash ve smoke patladığı an sprint at, slide ile kutuya gir."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long geniş açı",
    "deathAnalysis": "C Long'da aynı geniş açıyı tekrar tekrar tuttun; C Long'da rakip o tekrar sayesinde seni oradan kafadan vurdu.",
    "enemyPatterns": "C Long'daki rakipler sabit geniş açı bekliyor ve crosshair'ı kafaya hizalayıp swing atana kadar line tutuyor.",
    "nextRoundPlan": "C Long'a recon'un yüksek tavan noktasını at, drone ile doğrula ve takımdan flash iste, flash patladığı anda swing at."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main flash eksik",
    "deathAnalysis": "Flash atmadan A Main'e girdin; savunucu A Main açısını tutmuş ve ilk mermi'ı aldı. Flash atmadan çıkma, ateş duvarı ile Elbow görüşünü baskıla.",
    "enemyPatterns": "Karşı takım A Main'de bekliyor ve aynı açıdan ilk mermi alıyor.",
    "nextRoundPlan": "Flash at, flash patladığında swing at ve ateş duvarı Elbow'a koy."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt off-angle",
    "deathAnalysis": "A Belt'te Operator ilk mermiyi kaçırdıktan sonra aynı off-angle'da kaldın ve açıyı düzeltmedin; bu yüzden kafadan vuruldun.",
    "enemyPatterns": "Karşı takım A Belt'i aynı off-angle'da tutuyor ve ilk mermi sonrası nişanını sabit bırakıyor, yani tekrara karşı hassaslar.",
    "nextRoundPlan": "Teli A Belt choke'a taşı ve kamerayı A Elbow'e koy ve takım arkadaşından flash iste."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors smoke hatası",
    "deathAnalysis": "Mid Doors'da kendi smoke'unun içinden çıkıp peek attın ve orada öldün. Smoke'tan çıkınca vücudun tamamen göründü, karşı kişi önceden nişan tutmuş şekilde kafadan vurdu.",
    "enemyPatterns": "Karşı oyuncu Mid Doors açısını sabit tutuyor ve smoke içinden çıkanları bekliyor.",
    "nextRoundPlan": "Smoke içindeyken flash at, teleport ile farklı açıya geç ve smoke'tan çıktıktan sonra peek at."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main Operator Ölümü",
    "deathAnalysis": "A Main'de Operator'la kafadan öldün ve silah düşmedi; ilk atış sonrası pozisyonu kaybettin. Tuzağı A Main root hattına koy, teleport'u daha geriye anchor'la ve ilk atıştan sonra TP yap veya teammate'ten A Main'e smoke iste ve swing at.",
    "enemyPatterns": "A Main'de sabit bir op açısı tutuluyor, ilk mermi kafadan seni alıyor.",
    "nextRoundPlan": "Tuzağı root hattına koy ve teleport'u geriye anchor'la, smoke gelince A Main'e swing at."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel ölümü",
    "deathAnalysis": "B Tunnel'da rotasyonu geç başlattın; rakip seni orada bekleyip kafadan vurdu. Rotasyonu erken başlatsaydın trade veya crossfire şansı olurdu.",
    "enemyPatterns": "B Tunnel'a girenler büyük ihtimalle o açıya önceden nişan alıyor ve entry'yi durduracak bir oyuncu orayı tutuyor.",
    "nextRoundPlan": "Turret'i B Tunnel görüş hattı'ına koy ve bot ile molly'ı girişe önceden hazır et, rotasyonu hemen başlat."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard geniş açı",
    "deathAnalysis": "Mid Courtyard'da geniş açıyla dry peek atıp yakından öldün. Utility'siz açılınca rakip kafa hizasından bekleyip seni one-tap veya yakın silahla kesti.",
    "enemyPatterns": "Eco round'da rakipler yakın mesafeden geniş açı kontrolü yapıyor ve aynı açıyı tutma eğilimindeler.",
    "nextRoundPlan": "Mid Courtyard'e girmeden önce yavaşlatma at ve duvarı çapraz koy, takımından bir flash iste; flash patladığında swing at."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail ölümü",
    "deathAnalysis": "Mid Mail'e trade pozisyonu olmadan girdin; kimse arkan beklemediği için ilk kontakta düştün. Takımdan trade pozisyonu kurana kadar Mid Mail'e tek başına girme ve flash iste, çünkü trade yokken o açı seni kafadan vuruyor.",
    "enemyPatterns": "Mid Mail'i aynı açıdan bekleyen savunmacı, utility'siz tek çıkış yapanlara karşı o açıyı tutuyor ve seni tek kontakta kesiyor.",
    "nextRoundPlan": "Mid Mail'e girme, önce bir teammate trade pozisyonunda beklesin ve flash patladığı an birlikte swing atın."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'da utility'siz ölme",
    "deathAnalysis": "Garage'da bilgi almadan flash ve recon kullandın, bu yüzden Garage girişinde takımında kör ya da sersem yoktu ve seni bekleyen açıdan öldün.",
    "enemyPatterns": "Garage'da utility'siz girince savunucu aynı açıya bekleyip Garage girişinde seni kafadan indiriyor, bu da aynı açıyı tekrar kullanmanın okunur hale geldiğini gösteriyor.",
    "nextRoundPlan": "İlk olarak Garage girişinde recon'ı farklı bir açıdan yolla ve flash'ı giriş anında patlat, alternatif olarak takım arkadaşından smoke iste ve köpeği smoke içinden gönder."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short anchor hatası",
    "deathAnalysis": "Bu round A Short'ta anchor'ı erken terk ettin; A Short yönü boş kaldı ve o açıdan gelen ateşi karşılayamadın.",
    "enemyPatterns": "A Short'taki erken çekilmen rakibin o açıya rahat nişan almasına izin veriyor, dolayısıyla aynı açıdan tekrar vurulma riski yüksek.",
    "nextRoundPlan": "Bu round A Short'ta kal, takımın flash veya smoke atana kadar çıkma ve ateş hızı bufu A Short girişine koy."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link smoke Geçikmesi",
    "deathAnalysis": "B Link'te smoke'yı geç açtın. Smoke gecikince B Link görüş hattı açık kaldı ve seni öldürdü.",
    "enemyPatterns": "Rakip B Link görüş hattını sabit tutuyor ve scope ile bekliyor.",
    "nextRoundPlan": "Bir sonraki round smoke'yı B Link yıldızından erken aç, sonra takımınla entry yap."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market Lurk Flank",
    "deathAnalysis": "B Market'de lurk yaparken arkandan flank geldi ve seni yakaladılar, B Market ve B Back açılarını kontrol etmeliydin. Arkayı tutan oyuncu seni sessizce çevirdiği için flank alanına tel ve kamera eksikti ve senin dönüşün geç kaldı.",
    "enemyPatterns": "Rakipler B Market arkasından sık flank atıyor ve Market Side'dan silent rotate ile arkadan oynuyor.",
    "nextRoundPlan": "B Market arkasına tel veya kamera koy ve takım arkadaşından flash iste, flank gelirse hemen trade pozisyonuna çekil."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Mid Boiler TP hatası",
    "deathAnalysis": "Mid Boiler'da teleport sonrası takipsiz agresyon yaptın, karşı açıda bekleyen oyuncuya doğrudan vuruldun. Teleport'e girerken flash veya klon senkronu yoktu, bu yüzden açıkta kaldın.",
    "enemyPatterns": "Mid Boiler'da rakip büyük ihtimalle aynı açıya sabit bekliyor ve TP sesinden sonra o açıyı kafa seviyesinden tutuyor.",
    "nextRoundPlan": "Teleport'i dumanın arkasına göm ve flash'ı varışta aynı anda patlat, gelmeden önce takım arkadaşından flash iste."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "C Mound'da sersemletme ve molly setup'ını zamanlayıp takım onayı olmadan attın; stun penceresi takım girmeden geçti ve açık kaldın. Bunun sonucu olarak C Main'den gelen swing seni sıraladı.",
    "enemyPatterns": "Rakipler C Main'den swing atıp stun penceresini bekliyor gibiydi; stun uyumunu gördüklerinde agresifçe içeri girdiler.",
    "nextRoundPlan": "Sersemletme diye bağır, takım onaylayınca flash ile flash'ı yukarı at ve molly'u dar köşeye at, sonra takım girsin."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main yetenek kapatan bıçak",
    "deathAnalysis": "B Main'de yetenek kapatan bıçak attın ama takım arkadaşı trade gelmeyince B Main girişinde tek kaldın ve oradan öldün. Knife sonrası suppress sonucunu takıma söylemediğin için B Main'de baskı kurulmadı; bunu söylemeden ilerleme hatası oldu.",
    "enemyPatterns": "B Main'deki savunucu bıçağa rağmen pozisyonunu korumuş; B Main'de savunucular bıçak sonrası beklemeyi tercih ediyor gibi.",
    "nextRoundPlan": "B Main'de yetenek kapatan bıçak vurduğunda hemen 'bıçak ikiye vurdu' diye bağır, ardından flash patladığı anda takımle B Main'e gir."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall duvar hatası",
    "deathAnalysis": "A Hall'da duvarı takım geçmeden önce açtın ve duvar açıkken arkanın boşalmasıyla kafadan vuruldun. Duvarı takımın girişini kesmeyecek şekilde zamanlamalıydın, geçişte açıp geçince kapatmalıydın.",
    "enemyPatterns": "Rakipler A Hall'a duvar açıkken bekleyip off-angle tutuyor ve duvarın arkasından seni kesiyor.",
    "nextRoundPlan": "Duvarı takımın geçişini tetikleyecek anda aç, takım geçince kapat ve smoke'u post-plant için sakla."
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
    "deathAnalysis": "You pushed A Main alone without a flash or smoke and died on contact, and there was no teammate in trade to punish the angle. That solo dry entry at A Main surrendered first fight and left your team a 4v5.",
    "enemyPatterns": "The defender was holding a pre-aim from Heaven or Generator over A Main and punished solo entries into that sightline.",
    "nextRoundPlan": "Ask a teammate for a flash and a smoke, throw smoke into A Main, then dash in with a trade partner ready."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek Reyna",
    "deathAnalysis": "You got a kill at Hookah then overpeeked into an unseen angle and paid for it. After the frag you should have heal behind cover instead of re-peeking aggressively.",
    "enemyPatterns": "An opponent held an off-angle around the Hookah exit and punished the immediate follow-up swing.",
    "nextRoundPlan": "After your first kill at Hookah, throw nearsight into the approach and heal behind a corner before any second peek."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "Death at B Heaven",
    "deathAnalysis": "You attempted a late retake into B Heaven alone and got killed holding the high angle. Use bot then cluster grenade before you satchel in because the Heaven player had time to pre-aim and you walked into a clean overhead angle.",
    "enemyPatterns": "They are anchoring B Heaven and punishing solo, late entries from above.",
    "nextRoundPlan": "Send bot first, dump cluster grenade into Heaven to force or clear the angle and only satchel in with a teammate or take a different off-angle because entering alone into a held Heaven gets you one-shot before you can trade."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Fast Entry",
    "deathAnalysis": "You sprinted into A Main without utility and died to crossfire from Tree and Stairs; your wall was not used and you had no flash to disrupt those angles. Open wall first and slide in behind a teammate's flash or smoke so you do not run into two sightlines alone.",
    "enemyPatterns": "Defender held Tree and Stairs in A Main, forcing a two-angle crossfire that punishes lone, utility-less entries.",
    "nextRoundPlan": "Ask a teammate for a flash and deploy wall before you sprint and slide into A Main."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long repeat",
    "deathAnalysis": "You took the same wide C Long angle repeatedly and died to a pre-aimed line; stop reusing that default swing. Use recon and drone to clear or confirm C Long before stepping up, and if you can't get info ask a teammate for a flash or smoke.",
    "enemyPatterns": "The defender is holding C Long pre-aiming the wide sightline and punishing repeat swings.",
    "nextRoundPlan": "Send a recon to an alternate air spot to tag C Long and step with a teammate's flash or smoke."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Flashless Entry",
    "deathAnalysis": "You pushed A Main without using flash, so the defender holding the A Main angle had pre-aim and shot you as you entered. Next time use flash before the peek and consider fire wall across A Main to deny their sightline and molly to recover after the fight.",
    "enemyPatterns": "The defender was holding the A Main crosshair on the choke, using the narrow A Main sightline to win the first contact.",
    "nextRoundPlan": "Flash the A Main corner and swing immediately, or ask a teammate for a smoke and then place fire wall across A Main before you entry."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt Operator hold",
    "deathAnalysis": "You missed the first Operator shot at A Belt and kept the exact same shoulder-line, so the enemy recovered and punished your follow-up because repeating the same sightline hands the aim advantage back to them.",
    "enemyPatterns": "This shows the opponent is holding A Belt with an Operator on a consistent headshot line and is prepared to punish anyone who peeks the same angle because they stayed locked on after your miss.",
    "nextRoundPlan": "After missing an Operator shot at A Belt, fall back behind the box, place tripwire across the entry and ask a teammate for a flash before you re-peek because you must force a new aiming angle to win the duel."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors smoke peek",
    "deathAnalysis": "You stepped out of your smoke at Mid Doors and peeked while still committed, so an opponent with mid pre-aim punished your silhouette; use flash first or teleport to a different angle before you leave the smoke. Keep the exit unpredictable by varying teleport locations and timing so they cannot pre-aim the same spot.",
    "enemyPatterns": "The defender held a tight Plaza and Mid Top angle aimed at Mid Doors, capitalizing on your predictable smoke exit and your visible movement.",
    "nextRoundPlan": "Cast flash onto Mid, deploy smoke high, then teleport to an unexpected box or door angle before you peek."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator Death",
    "deathAnalysis": "You held A Main with ult and died while still holding the weapon; you never used trap to delay nor teleport to escape, so the Operator stayed off the map and the team lost a buy.",
    "enemyPatterns": "An opponent was sitting a long A sightline with an Operator and punished extended peeks into A Main.",
    "nextRoundPlan": "Place trap on the A Main exit, take a single pistol peek and use teleport to reset, or ask a teammate to drop a rifle."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel late rotation",
    "deathAnalysis": "You died at B Tunnel after rotating late, so you walked into an angle enemies had already committed to before you arrived. Hold an off-angle in B Tunnel next time or delay the push until your rotation reaches the site to avoid pre-aims.",
    "enemyPatterns": "Opponents are pre-aiming B Tunnel and punishing late rotators by holding the site entrance.",
    "nextRoundPlan": "Start your rotation on first B contact, set your Turret and bot covering B Tunnel and ask a teammate for a flash before you step into the choke."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Wide Swing",
    "deathAnalysis": "You wide-swung at Mid Courtyard on an eco round and exposed your torso to a long angle. On this eco round at Mid Courtyard you should have used slow to disrupt the push or held the close Cubby angle instead.",
    "enemyPatterns": "The enemy appears to be holding the Top Mid sightline and punishing wide Mid Courtyard swings.",
    "nextRoundPlan": "Hold the close Cubby angle at Mid Courtyard and place a wall across Mid Link or ask a teammate for a flash before you swing."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail solo entry",
    "deathAnalysis": "You entered Mid Mail alone without a trade and died because there was no follow-up on your contact at Mid Mail. You also sent recon and bot disconnected instead of chaining them, so the reveal produced no immediate swing window.",
    "enemyPatterns": "Defenders were holding the Mail choke and CT sightline to punish solo peeks at Mid Mail and capitalized on the lack of a trade.",
    "nextRoundPlan": "Chain recon into bot into tether on Mid Mail, tell a teammate 'bot hit, swing' or ask for a flash to secure the trade."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage utility waste",
    "deathAnalysis": "On attack at Haven Garage you fired flash and sent recon without confirming enemy positions, which left you exposed and resulted in your death. Using both Skye abilities in Garage before getting info removed your entry tools and cost the round advantage.",
    "enemyPatterns": "The defender held a passive Garage line from Window or Connector on Haven and pre-aimed the Garage entry to punish your unconfirmed utility usage.",
    "nextRoundPlan": "Hold flash and recon until you or a teammate confirms a Garage contact, and ask a teammate for a smoke or flash before committing the Garage entry."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "Left A Short Anchor",
    "deathAnalysis": "You abandoned A Short anchor too early and got caught rotating away from the angle at A Short; hold the anchor until a trade is ready. If you must leave A Short, use a smoke and fire-rate buff to cover your exit so you don’t give Lamps or Heaven a free peek.",
    "enemyPatterns": "Opponents were holding A Short from Lamps or Heaven angles, punishing any early rotation away from A Short.",
    "nextRoundPlan": "Stay anchored on A Short until a teammate is beside you to trade, or smoke Heaven, cast fire-rate buff at A Short entry, then reposition with a flash from a teammate."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "Late smoke at B Link",
    "deathAnalysis": "You died at B Link because your smoke came after the enemy peeked and you exited the smoke timing window at B Link. You walked into a held angle at B Link with no pull or stun to disrupt them.",
    "enemyPatterns": "They held the B Link sightline and punished any brief exposure at B Link with pre-aim and disciplined crossfire.",
    "nextRoundPlan": "Place a smoke star on the B Link choke before they show and keep a pull or stun primed to stop their follow-up at B Link."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market Lurk",
    "deathAnalysis": "You lurked in B Market and got caught from behind because you cleared alone without forcing or blinding that back route. Collect the globule after your first flash so you can redeploy abilities for the second attempt.",
    "enemyPatterns": "A defender was holding the Market backline pre-aiming the standard flank route and punished a lone flank clear.",
    "nextRoundPlan": "Send flash into the back route, collect the globule, and use bot to secure the area before you push deeper."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler teleport",
    "deathAnalysis": "You used teleport into Mid Boiler and swung alone. You died to a pre-aim at Mid Boiler because there was no clone or teammate flash.",
    "enemyPatterns": "An opponent was pre-aiming the Mid Boiler entrance from Catwalk holding a tight angle on Mid Boiler.",
    "nextRoundPlan": "Send clone toward Mid Boiler, then teleport to a different Mid Boiler corner and ask a teammate for a flash."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "Stun timing — C Mound",
    "deathAnalysis": "On C Mound you triggered stun but the team did not follow, so you were isolated and died to the C Main sightline this round. Announce stun before you cast it and chain flash immediately once a teammate confirms so you are not the lone peek.",
    "enemyPatterns": "Defenders are holding the C Main sightline and punishing solo mound peeks when your stuns land without team follow-up.",
    "nextRoundPlan": "Call stun out loud, get one teammate to confirm they will trade, then cast flash and commit to the peek together."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main suppress knife fail",
    "deathAnalysis": "You threw suppress knife into B Main but did not follow up to pressure suppressed defenders, so they held the close angle and traded you. You also didn’t announce the suppress result, so teammates never committed behind you.",
    "enemyPatterns": "A defender sat on the tight B Main angle and timed the trade off your hesitation.",
    "nextRoundPlan": "Throw suppress knife into B Main, call how many were suppressed, then pop flash and entry the angle immediately."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "A Hall wall",
    "deathAnalysis": "You opened wall in A Hall too early and put yourself visible in the wall gap, so the defender holding the close A Hall angle pre-aimed and punished you. Close the wall after you cross or hold it until your team actually commits to avoid exposing yourself.",
    "enemyPatterns": "The A Hall defender is holding the close angle through the wall and timing peeks to punish early screens.",
    "nextRoundPlan": "Wait for a teammate flash or your entry to start, then open wall and shut it immediately after you cross."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
