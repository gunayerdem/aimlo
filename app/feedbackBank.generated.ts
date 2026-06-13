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
    "title": "A Main dry entry",
    "deathAnalysis": "A Main'den tek başına utility'siz girdin ve trade yoktu, bu yüzden Heaven ve Generator açılarından kafadan vuruldun. Dash ile smoke arkasından veya takım arkadaşının flash'ıyla giriş yapsaydın yaşayabilirdin.",
    "enemyPatterns": "Rakip Heaven ve Generator açılarını tutup A Main girişini açıyı takip ederek bekliyor.",
    "nextRoundPlan": "A Main'e dash sonra smoke ile veya teammate'in flash'ı patladığında gir."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek hatası",
    "deathAnalysis": "Hookah'ta kill sonrası gereksiz overpeek yaptın. İkinci oyuncu off-angle'dan seni bekleyip kafadan aldı.",
    "enemyPatterns": "Rakip Hookah'da kill sonrası açı değiştirip off-angle tutuyor ve ikinci girişte aktif olarak bekliyor.",
    "nextRoundPlan": "Kill sonrası overpeek yapma; ilk tercih Dismiss ile Hookah siper'ına çekil ve alternatif olarak Leer atıp kapaktan Devour yap."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven ölümü",
    "deathAnalysis": "B Heaven'da tek tek girip uzak açıdan kafadan kesildin; Raze olarak önce Boombot öne, sonra Paint Shells ile Heaven'ı temizleyip satchel ile içeri girmen gerekirdi. Alternatif olarak takım arkadaşından flash isteyip flash patladığı anda içeri gir, satchel'i kaçış için sakla.",
    "enemyPatterns": "B Heaven'ı yüksek açıyla pasif tutuyorlar ve retake sırasında uzak görüşten one-tap almaya çalışıyorlar.",
    "nextRoundPlan": "Boombot→Paint Shells sıraya koy, Heaven temizlenene kadar satchel ile entry yapma."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main utility'siz giriş",
    "deathAnalysis": "A Main'da utility'siz hızlı entry yaptın; Fast Lane açmadan sprint edip Tree ve Stairs'in crossfire'ına takıldın. Duvar olmadan sprint açık hedeftin, Fast Lane + teammate'tan flash veya smoke isteyip o pencerede içeri girseydin hayatta kalma ihtimalin artardı.",
    "enemyPatterns": "Tree ve Stairs açılarını aynı anda tutan defender crossfire kurup kafadan vuruyor.",
    "nextRoundPlan": "Fast Lane at, teammate'tan flash veya smoke iste ve Fast Lane patlayınca sprint ile slide gir."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long geniş açısı",
    "deathAnalysis": "C Long'da aynı geniş açıdan tekrar tekrar swing atarken öldün; rakip açıyı tutup kafadan vuruyor. Utility'siz giriş yaptığın için avantaj tamamen onlarındaydı.",
    "enemyPatterns": "Rakip C Long'da geniş açı tutuyor ve seni kafadan bekliyor.",
    "nextRoundPlan": "Owl Drone ile C Long'u tara ve Recon Bolt'u alternatif yükseklikten at, teammate'tan flash iste; flash patladığında aynı açıya swing at."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main flashless giriş",
    "deathAnalysis": "A Main'den flash atmadan girdin ve ilk kontakta kafadan öldün. flash kullanıp Blaze ile siper verip swing atmalıydın.",
    "enemyPatterns": "Rakip A Main açı tutuyor ve utility'siz girişleri aynı açıdan bekleyip seni kafadan kesiyor.",
    "nextRoundPlan": "flash at, Blaze duvarını A Main köşesine koy ve flash patlayınca geniş swing at."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt - Operator",
    "deathAnalysis": "A Belt'te Operator ilk mermiyi kaçırdı ve sen aynı açıda kaldığın için ikinci nişanı kafadan yedin. Trapwire veya Spycam avantajı alıp açı değiştirselerdin bu ölüm olmazdı.",
    "enemyPatterns": "Rakip Operator A Belt'te aynı açıyı sabit tutuyor; ilk mermi ıskalayınca pozisyonunda kalıp ikinci şansı değerlendiriyor.",
    "nextRoundPlan": "Trapwire'ı A Belt choke'una koy ve Spycam'ı ramp yönüne bırak."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors smoke çıkışı",
    "deathAnalysis": "Mid Doors'da kendi smoke'unun içinden çıkıp peek attın; o açıya hazır bekleyen biri seni kafadan vurdu. Smoke'tan çıkmadan önce Paranoia at ya da Shrouded Step ile farklı açıdan ortaya çık.",
    "enemyPatterns": "Rakip Mid Doors'u sabit açıdan tutuyor ve smoke içinden çıkanları kafadan hedefliyor.",
    "nextRoundPlan": "Smoke koy, Paranoia at ve Shrouded Step ile Mid Doors'un başka bir açıdan ortaya çık."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main — tek atış",
    "deathAnalysis": "A Main'da Operator seni kafadan aldı; bir atış yapıp hemen teleport ile pozisyon değişip çıkmalıydın. Alternatif olarak Trademark'ı A Main girişine koyup takımından smoke iste, aynı açıya tekrar kalıcı bekleme.",
    "enemyPatterns": "Bu tekrar, A Main uzun hattını op ile sabit nişanlayan bir bekleyiş olduğunu gösterebilir.",
    "nextRoundPlan": "teleport anchor'ını A Main yakınına set et ve bir atış sonra teleport çık."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel rotasyon hatası",
    "deathAnalysis": "B Tunnel'da öldün çünkü rotasyonu geç başlattın; Lockdown veya nanoswarm ile B Tunnel çıkışını kesip rotasyonu durdurmalıydın.",
    "enemyPatterns": "Rakipler B Tunnel girişini kapatıp rotasyonla seni B Tunnel'dan kafadan kestiler.",
    "nextRoundPlan": "B Tunnel çıkışına alarmbot ile nanoswarm'ı üst üste yerleştir ve Lockdown'ı duvar arkasına sakla."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard geniş açı",
    "deathAnalysis": "Mid Courtyard'ta geniş açıyla peek atarken utility'siz çıktın ve öldün. Slow orb'u choke'a atıp ya da Barrier Orb'u çapraz koyup tight açıdan beklemeliydin.",
    "enemyPatterns": "Rakip eco round'da Mid Courtyard'ın geniş hattını tutuyor ve uzak açıdan seni kesiyor.",
    "nextRoundPlan": "Mid Courtyard'ta geniş açıyla peek atma; önce slow orb at, sonra çapraz Barrier Orb koyup tight açıdan bekle."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail tek başına öldün",
    "deathAnalysis": "Mid Mail'da trade pozisyonu olmadan girdin, tek temasta öndeydin ve öldün. Haunt atıp Prowler zincirini kurmadın; Haunt sonrası Prowler gönderip bir teammate'ten swing beklemeliydin.",
    "enemyPatterns": "Mid Mail açısını tutan savunmacı dar açıdan kafa seviyesinden bekliyor ve trade gelmeyince aynı açıdan kafadan kesiyor.",
    "nextRoundPlan": "Mid Mail'e Haunt at, hemen Prowler'ı ize gönder ve teammate'ten swing iste."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'ta utility'siz öldün",
    "deathAnalysis": "Garage'da bilgi almadan utility harcadın, rakip seni önceden nişanlayıp kafadan vurdu. Guiding Light ile peek'i temizle sonra Trailblazer ile içeri gönder, yoksa takımından smoke iste ve o smoke patlayınca swing at.",
    "enemyPatterns": "Rakip Garage girişini önceden kapatıp utility pencere bekliyor ve aynı açıdan seni kesiyor.",
    "nextRoundPlan": "Guiding Light'ı Garage yönüne saydır, Trailblazer'ı farklı açıdan yolla ve takımından smoke iste."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short erken bıraktın",
    "deathAnalysis": "A Short'ta anchor'ı çok erken bıraktın ve Heaven ve teleporter görüşünü kapatmadan çekildin; bu yüzden A Short'tan kafadan vuruldun. Smoke'u saklayıp Stim Beacon ile pozisyonunu desteklemeliydın.",
    "enemyPatterns": "Rakip A Short açısını sabit tutuyor ve o açıdan bekleyerek seni kafadan kesiyor.",
    "nextRoundPlan": "A Short'ta beklerken smoke'u A Short'a koy, Stim Beacon'ı pozisyonuna yakın yerde aktif et ve Incendiary'yi teleporter çıkışına sakla."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link smoke gecikmesi",
    "deathAnalysis": "B Link'te smoke'yı geç açtın, smoke patlayana kadar takımın trade alamadı ve arkadan gelen entry seni kafadan vurdu. Yıldız B Link'e pre-place edip smoke'yı push başlamadan aktive etmeliydin.",
    "enemyPatterns": "Düşman B Link'e push başladığında smoke gecikince direkt swing atıyor ve açık pozisyonu kafadan kesiyor.",
    "nextRoundPlan": "B Link'e yıldızı round başında koy, push işareti gelince smoke'yı aç ve gerekirse Gravity Well ile choke'u kilitle."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market arkadan yakalandın",
    "deathAnalysis": "B Market'te lurk yaparken arkadan bir oyuncu seni B Market girişinden kesmiş; flank'e karşı boşluk bıraktın. Dizzy veya Thrash kullanıp globülü toplayıp pozisyon değiştirmeliydin.",
    "enemyPatterns": "Rakipler B Market flank'ini kontrol ediyor ve arkadan swing atıp tek açıda trade veriyor.",
    "nextRoundPlan": "Thrash'i B Market yaklaşımına at ve globülü toplayıp Dizzy'yi farklı açıdan gönder."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Mid Boiler TP girişi",
    "deathAnalysis": "Mid Boiler'da Gatecrash ile içeri ışınlandın sonra takipsiz agresyonla Boiler içine girdin; bekleyen savunucu seni kafadan vurdu, Gatecrash sonrası Blindside ile swing atıp clone ile bait yapmalıydın.",
    "enemyPatterns": "Boiler açısını tutan savunucu genelde kafa seviyesinden wide peek bekliyor.",
    "nextRoundPlan": "Gatecrash'le inince Blindside hazırla ve clone gönder, takım arkadaşından flash isteyip birlikte Boiler'da swing at."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "stun attın ama takım girme onayı vermedi, C Mound'da açıkta kaldın ve C Main'den gelen oyuncu seni kafadan aldı.",
    "enemyPatterns": "C Main tarafı off-angle tutup stun sonrası hızlı swing ile seni kafadan kesiyor.",
    "nextRoundPlan": "stun atmadan önce takıma 'Fault geliyor' diye seslen, takım flash ile desteklesin ve stun patlayınca beraber swing at."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main Knife Girişi",
    "deathAnalysis": "B Main'de ZERO ve POINT attın ama kimse suppress yemedi. Tek giriş olduğun için Market ve arkadan gelen trade seni kesti.",
    "enemyPatterns": "Savunucular B Main girişini Market'e bakıp trade için tutuyor.",
    "nextRoundPlan": "ZERO ve POINT atıp suppress sayısını anons et, takımdan flash iste ve FLASH ve DRIVE ile birlikte B Main'den entry at."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall duvar Hatası",
    "deathAnalysis": "A Hall'da duvar'i erken açtın, entry sırasında kör kaldın ve kafadan vuruldun. Duvarı takımın geçişini tetikleyecek şekilde açıp, geçince kapatman gerekiyordu.",
    "enemyPatterns": "Rakipler A Hall girişini duvar açılışına göre bekleyip kafadan kesmeyi alışkanlık haline getirmiş görünüyor.",
    "nextRoundPlan": "duvar'i takım entry başlatınca aç, takım geçince kapat."
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
    "deathAnalysis": "You pushed A Main alone with a dry peek and no trade, so the defender holding the choke pre-aimed and killed you. Keep dash for an exit after you win the duel rather than burning it before contact.",
    "enemyPatterns": "A defender is pre-aiming the A Main choke and punishing solo entries from that angle.",
    "nextRoundPlan": "Ask a teammate for a flash, throw smoke on A Main, then dash in behind the flash while a second player sits ready to trade."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek",
    "deathAnalysis": "You got the kill at Hookah then overpeeked the next angle and died because you stayed exposed instead of using Devour or Dismiss. After a kill at Hookah Devour behind cover to heal or Dismiss to reposition before taking the second peek.",
    "enemyPatterns": "A defender was holding the adjacent Hookah corner for the follow-up angle and punished your wide second peek.",
    "nextRoundPlan": "After your kill at Hookah Devour behind cover or Dismiss into Lamps before committing to the next angle."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven Death",
    "deathAnalysis": "You died at B Heaven during a late retake where you went in one-by-one and got caught holding the vertical angle; that staggered entry left you exposed to the high-ground crossfire. As Raze on B Heaven retakes, send Boombot first and follow with Paint Shells to clear the Heaven pocket before committing with a satchel.",
    "enemyPatterns": "Defenders are locking B Heaven high-ground and punishing solo or staggered entries on late retakes from B Main and Pillar.",
    "nextRoundPlan": "Send Boombot into B Heaven, use Paint Shells to clear or force rotation, then satchel in only after you get a teammate flash or smoke."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main death",
    "deathAnalysis": "You ran into A Main on Lotus with a utility'siz hızlı giriş and died to defenders holding Tree or Stairs. Use Fast Lane before sprinting and keep a teammate ready to trade instead of solo-ing the entry.",
    "enemyPatterns": "Defenders were anchoring A Tree and A Stairs expecting a raw A Main sprint and kept pre-aim on the choke.",
    "nextRoundPlan": "Cast Fast Lane, ask a teammate for a flash or smoke, then sprint through and slide in while they trade."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long repeat",
    "deathAnalysis": "You took the same wide C Long angle repeatedly and died to a pre-aim on that line; stop returning to that default sightline and change your body placement. Use Owl Drone to isolate the exact hold or fire a Recon Bolt into the higher Plat and CT line before committing to the peek.",
    "enemyPatterns": "The defender is consistently holding the long Plat and CT sightline on C Long and punishes repeated wide peeks from the same position.",
    "nextRoundPlan": "Switch to a tighter off-angle on C Long, send Owl Drone to confirm the holder and then fire a Recon Bolt into Plat and CT before you peek."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main flashless death",
    "deathAnalysis": "You entryed A Main without a flash and died to a pre-aimed defender because you never forced their crosshair off the choke. Next round either flash then swing A Main immediately or ask a teammate for a smoke and use Blaze to cut sight before you step into A Main.",
    "enemyPatterns": "They are holding A Main choke hard and punishing raw commits at that angle.",
    "nextRoundPlan": "Throw flash into A Main and swing out the moment the flash pops."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt - missed Op",
    "deathAnalysis": "You missed the first Operator shot at A Belt and kept holding the exact same angle, so the next peek punished you; stop staying in the identical line after a miss. Move off the line after your first missed shot and use Trapwire or Cyber Cage to force a reposition before re-peeking.",
    "enemyPatterns": "The opponent is pre-aiming A Belt and committing to the same sightline once they win the initial duel.",
    "nextRoundPlan": "After your first missed Operator shot, step away from the A Belt angle and ask a teammate for a flash or throw a Cyber Cage over the belt before you re-peek."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors smoke peek",
    "deathAnalysis": "You left your Dark Cover at Mid Doors and peeked straight out, and the enemy punished the exposed silhouette with pre-aim; you died because you gave them a predictable exit to shoot. Next time either stay in the smoke to force them to step or use Paranoia before peeking to break their aim.",
    "enemyPatterns": "They are holding Mid Doors specifically on smoke exits and waiting for players to walk out, so exits from your Dark Cover are being pre-aimed.",
    "nextRoundPlan": "Call Paranoia then use Shrouded Step to a different angle before challenging Mid Doors, or stay inside your Dark Cover and ask a teammate for a flash to force them off the exit."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator",
    "deathAnalysis": "At A Main you died while holding the Operator and the gun stayed on the ground, which cost your team a recoverable weapon. Take a single committed shot and use teleport to reset instead of lingering on the same angle.",
    "enemyPatterns": "The defender was holding a deep A Main angle and punished your long peek cleanly, leaving the Operator in a dangerous pickup location.",
    "nextRoundPlan": "Place Trademark behind A Main, ask a teammate for a flash, step once for the shot and teleport back immediately."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel Rotation",
    "deathAnalysis": "You started your rotation into B Tunnel late this round and were exposed while moving, without Turret or Alarmbot covering the choke. Stop rotating into that angle naked; pre-place utility so you don’t walk into a crossfire.",
    "enemyPatterns": "They were holding the B Tunnel choke and pre-aimed the rotation from elbow, punishing anyone who shows while rotating.",
    "nextRoundPlan": "Before you rotate, place Turret to watch B Tunnel and set Alarmbot with a Nanoswarm on the elbow, then rotate behind that cover."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Death",
    "deathAnalysis": "You swung wide in Mid Courtyard on an eco round and exposed your body without Slow Orb or Barrier Orb, so you died to a read on that angle. Hold Pizza and Cubby and keep your crosshair at head level instead of wide peeking.",
    "enemyPatterns": "The enemy was holding the long Mid sightline and punished large, unprotected swings from the courtyard.",
    "nextRoundPlan": "Stop wide peeks; throw Slow Orb into the mid choke and use Barrier Orb to cut the sightline, and ask a teammate for a flash or smoke before contesting."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail trade",
    "deathAnalysis": "You entered Mid Mail solo without a trade and died to a pre-aimed angle; your Haunt and Prowler came too late to create a window at Mid Mail. Next time, set up a dedicated trade angle at the Mail door instead of forcing the first peek from Mid Mail.",
    "enemyPatterns": "Someone was holding the Mail sightline and pre-aimed Mid Mail, punishing lone entries.",
    "nextRoundPlan": "Primary: send Haunt into Mail then dispatch Prowler into that trace and ask a teammate for a flash before you swing Mid Mail; alternative: hold a trade angle behind the Mail door and keep Seize ready to lock their escape when the swing happens at Mid Mail."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage utility waste",
    "deathAnalysis": "You used Guiding Light and molly without getting recon first and died at Garage; Garage was still held when you committed. Send Trailblazer to probe Garage before you burn utility and keep Regrowth for after contact.",
    "enemyPatterns": "Defender was pre-aiming the Garage entry and punished your straight utility commitment from the default Garage approach.",
    "nextRoundPlan": "Send Trailblazer into Garage, then pop Guiding Light while a teammate smokes Garage, and only use Regrowth after you confirm the angle is clear."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "Anchor left A Short",
    "deathAnalysis": "You abandoned A Short as the anchor before teammates were in trade range, so the angle was left exposed and you died when you tried to re-enter A Short. Hold the post and only leave after a confirmed teammate trade or after you smoke Heaven and Lamps and place Stim Beacon at the entry.",
    "enemyPatterns": "The opponent held A Short pre-aimed and punished the vacated angle with a clean crossfire when you rotated away, showing they trusted that lane after your early leave.",
    "nextRoundPlan": "Stay at A Short until a teammate is beside you or until you call the rotate; if you must rotate, smoke Heaven and Lamps with Brimstone, drop Stim Beacon at the entry, or ask a teammate for a flash to cover your exit."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "Late smoke — B Link",
    "deathAnalysis": "You died at B Link because your smoke popped after you committed, so the defender was already pre-aiming the choke and traded you. Put the star on B Link in buy and cast smoke before you step into the lane to deny that pre-aim.",
    "enemyPatterns": "They held B Main and B Screen pre-aiming the B Link chokepoint and punished any delayed smoke with a headshot angle.",
    "nextRoundPlan": "Place a star on B Link in buy, cast smoke before you jiggle, and ask a teammate for a flash to finish clearing the angle."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market Lurk",
    "deathAnalysis": "You lurked in B Market and got caught from behind because you weren’t positioned to secure the Dizzy globe or cover the Market back, so you arrived without a second blind or a Wingman to force the plant. That lack of a collected globe left you predictable and exposed to the flank.",
    "enemyPatterns": "Opponents were holding the Market back-rotate angle and punished your backside entry rather than fighting you front-on.",
    "nextRoundPlan": "Collect the Dizzy globe before pushing, send Dizzy through Market and hold the back-rotate yourself or ask a teammate for a flash to clear that angle."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler Gatecrash",
    "deathAnalysis": "You teleported into Mid Boiler and immediately swung alone without Fakeout or Blindside, so you arrived predictable and exposed. Gatecrash was used as an entry rather than as a baited setup, and you died for committing without follow-up.",
    "enemyPatterns": "A defender was holding the boiler-to-link sightline and punished predictable Gatecrash entries by pre-aiming the exit angle.",
    "nextRoundPlan": "Hide Gatecrash behind cover, send Fakeout first to draw that sightline, keep Blindside ready to flash the exit and ask a teammate for a flash to trade when you swing."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound stun sync",
    "deathAnalysis": "At C Mound you used stun then Flashpoint without a clear voice cue, so you swung alone and died behind Mound cover. On Lotus C Mound that timing failed because teammates did not commit during the stun window, leaving you exposed.",
    "enemyPatterns": "A defender from C Main on Lotus consistently pre-aimed Mound sightlines and punished isolated swings at C Mound.",
    "nextRoundPlan": "Announce 'stun now' for C Mound, cast stun then immediately throw Flashpoint and tell teammates to swing C Mound together."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main ZERO and POINT",
    "deathAnalysis": "You threw ZERO and POINT into B Main but did not follow up to punish suppressed defenders, so an anchor rotated or traded you while you hung in the choke. Next time, commit the push when ZERO and POINT lands and avoid lingering at the entrance.",
    "enemyPatterns": "The defender was holding the B Main angle ready to trade off a teammate or peek into the choke after your knife landed.",
    "nextRoundPlan": "After ZERO and POINT lands, call for a teammate flash and push through B Main immediately while the enemy utility is down."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "A Hall wall timing",
    "deathAnalysis": "You opened wall in A Hall on Breeze too early and burned your fuel, leaving you exposed to the angle and causing the death. Keep wall closed until your team commits to A Hall on Breeze so you don't run out of active utility.",
    "enemyPatterns": "The enemy was holding the A Hall sightline on Breeze and punished the early wall exposure.",
    "nextRoundPlan": "Do not open wall in A Hall until teammates commit and reserve fuel for a post-plant smoke on Breeze."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
