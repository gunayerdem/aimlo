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
    "title": "A Main tek başına ölüm",
    "deathAnalysis": "A Main'de tek başına utility'siz entry yapıp düştün, bu round trade yoktu. Flash veya smoke bekleyip dash ile girseydin bu round'da ilk mermiyi yemeyecektin.",
    "enemyPatterns": "A Main'deki savunucu Heaven yönünden kafadan bekliyor ve bu round seni oradan kafadan vurdu.",
    "nextRoundPlan": "Bu round A Main'de teammate'ten flash iste ve flash patladığında dash ile gir."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek hatası",
    "deathAnalysis": "Hookah'da kill sonrası fazla agresif overpeek yaptın, ikinci açı kontrolü yokken swing atınca açıldın. Bundan sonra kill sonrası kapak arkasına dön veya hemen Devour yap, açıkta overpeek etme.",
    "enemyPatterns": "Hookah'daki savunucu crosshair'ı kafaya hizalamış bekliyordu, wide peek'inde seni kafadan vurdu.",
    "nextRoundPlan": "Kill alırsan önce kapak arkasına Devour yap ve trade pozisyonuna çekil; açıkta ikinci peek atma."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven ölümü",
    "deathAnalysis": "Geç retake yapıp tek tek içeri girdin; B Heaven açısı seni kafadan bekliyordu. B Heaven'ı smoke'la, flash patladığı an iki kişiyle swing at ve trade pozisyonunda ol.",
    "enemyPatterns": "Heaven'daki savunmacı pasif bekleyip aynı açıyı tutuyor ve tek tek girişleri kafadan kesiyor.",
    "nextRoundPlan": "B Heaven'ı önce smoke+flash ile flush et, iki kişilik entry ile iç ve biri her zaman trade pozisyonunda beklesin."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main hızlı giriş",
    "deathAnalysis": "A Main'de utility'siz hızlı entry yaptın, Tree/Stairs görüş hattı seni öldürdü. Önce duvar at, flash veya smoke patlayınca sprint ile entry yap.",
    "enemyPatterns": "Defender A Main'in yüksek açılarından birini hazır tutup walk-in bekliyor, aynı açıdan kafadan vuruyor.",
    "nextRoundPlan": "Duvar at, flash veya smoke patlayınca sprint ile içeri gir, bir teammate trade pozisyonunda beklesin."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long Aynı Açı",
    "deathAnalysis": "C Long'da aynı geniş açıdan sürekli swing atıp kafadan öldün. Bir sonraki C Long girişinde smoke atıp flash patladığı anda swing at, utility'siz girme.",
    "enemyPatterns": "C Long'daki rakip aynı geniş açıyı tutuyor ve seni kafadan vuruyor.",
    "nextRoundPlan": "C Long'a smoke + flash ile gir; flash patladığı anla birlikte swing at."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main dry giriş",
    "deathAnalysis": "A Main'de flash atmadan girdin ve ilk kontakta öldün; flash patlar patlamaz çıkış yapman gerekiyordu.",
    "enemyPatterns": "A Main dry girenlere karşı savunucu aynı açıdan bekliyor ve ilk mermiyi alıyor.",
    "nextRoundPlan": "Bir teammate trade pozisyonunda beklesin, sen sağ curveball at ve flash patlar patlamaz geniş swing at."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt aynı açı",
    "deathAnalysis": "A Belt'te op ilk mermiyi ıskaladı ve aynı açıda bekledi; o yüzden senin A Belt'e aynı açıdan dönmen kafadan yiyip öldün.",
    "enemyPatterns": "A Belt'te op miss sonrası aynı açıda bekleyip yeniden nişan alıyor ve o hattı koruyor.",
    "nextRoundPlan": "A Belt'e gelmeden önce farklı bir off-angle al veya smoke atıp entry başlat."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors smoke peek",
    "deathAnalysis": "Smoke içinden çıkıp Mid Doors'ta peek attın; dışarıdaki crosshair'ı görmeden yürüdün ve kafadan vuruldun. Smoke çıkışında flash'ı yukarı atıp jiggle ile bilgi al, sonra commit et.",
    "enemyPatterns": "Rakip Mid Top hattını önceden crosshair ile tutuyor ve smoke içinden çıkanları bekliyor.",
    "nextRoundPlan": "Smoke'tan doğrudan çıkma, önce flash'ı yukarı patlat ve jiggle ile bilgi al."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main Op Kill",
    "deathAnalysis": "A Main'da op'la kafadan öldün ve silah düşmedi, yani tek atışla öldün. A Main'e utility olmadan çıkmışsın, bir atış alıp kaldın.",
    "enemyPatterns": "A Main'deki op oyuncusu aynı sightline'ı sabit tutuyor ve önceden nişan alıyor; seni tek atışla kesti.",
    "nextRoundPlan": "A Main'e smoke at, flash'ı yukarı at ve flash patladığı an swing at."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel rotasyon gecikmesi",
    "deathAnalysis": "B Tunnel'da rotasyonu geç başlattığın için tek başına kaldın ve öldün. B Tunnel'dan çıkmadan önce teammate bekle ve alarmbot/nanoswarm hazır et.",
    "enemyPatterns": "Rakipler B Tunnel girişini sabit açıdan tutup seni kafadan karşıladı.",
    "nextRoundPlan": "Rotate'ı başlatmadan önce teammate'in yanında durup B Tunnel girişini util ile temizle."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard geniş peek",
    "deathAnalysis": "Geniş açıdan dry peek atıp eco round'da Mid Courtyard'da öldün; flash veya smoke olmadan entry yaptığın için karşı açı seni yakaladı.",
    "enemyPatterns": "Düşman Mid Courtyard'da wide angle tutuyor ve açık görüş hattından bekliyor.",
    "nextRoundPlan": "Flash at, flash patladığı an swing at; alternatife smoke koyup dar açıdan gir."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail dry entry",
    "deathAnalysis": "Mid Mail'da trade pozisyonu olmadan girdin, ilk giren düştü ve kimse trade almadı. Bir teammate trade pozisyonunda beklesin; flash patladığı anda birlikte swing atın.",
    "enemyPatterns": "Rakip Mid Mail'de tek açıdan bekleyip ilk gireni tuttu, trade yokken rahatça karşılık verdi.",
    "nextRoundPlan": "Mid Mail'e girerken yanında bir teammate trade pozisyonunda kalsın ve flash patladığında birlikte swing atın."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'da utility kaybı",
    "deathAnalysis": "Garage'da bilgi almadan utility attın ve öldün. Köpeği farklı açıdan gönderip tam bilgi aldıktan sonra flash'ı takımın peek'ine senkronize et.",
    "enemyPatterns": "Rakip Garage girişini bekliyor; utility'siz gelenleri tek açıdan cevaplıyor.",
    "nextRoundPlan": "Köpekle Garage'tan bilgi al, flash patladığında takımla entry yap."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short Anchor Hatası",
    "deathAnalysis": "A Short'ta anchor'ı çok erken bıraktın, trade gelmeden kafadan öldün. Smoke veya flash patlayana kadar A Short'tan çekilme ve trade pozisyonunu bekle.",
    "enemyPatterns": "Saldıranlar A Short açısını tutup erken çıkanları kafadan kesiyor.",
    "nextRoundPlan": "A Short'ta smoke/flash gelene kadar pozisyonda kal ve teammate'in trade pozisyonuna göre çekil."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link - smoke gecikmesi",
    "deathAnalysis": "B Link'te smoke'i geç attın. Smoke patlamadan önce swing atıp kafadan vurdular.",
    "enemyPatterns": "Rakip B Link'i smoke öncesi açı tutuyor ve girişleri o açıya göre bekliyor.",
    "nextRoundPlan": "B Link smoke'ını entry trigger'ıyla (teammate giriş ya da flash patlaması) senkronla ve yanında trade pozisyonunda bekle."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market arkadan yakalandın",
    "deathAnalysis": "B Market'ta lurk ederken arkadan yakalandın; sırtın kapalıydı ve yanında trade pozisyonu yoktu. Bir sonraki lurk'ta back yönünü ya bir teammate ile kapat ya da trade pozisyonu bırakarak yaklaş.",
    "enemyPatterns": "Rakip lurk oyuncusu B Market back'ten arkadan gelip seni kafadan vurmuş.",
    "nextRoundPlan": "B Market lurk'ta back'e yaklaşmadan önce bir teammate'i trade pozisyonunda beklet."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Mid Boiler TP agresyonu",
    "deathAnalysis": "Mid Boiler'da TP sonrası takipsiz agresyon yaptın, girişte flash veya klon yoktu. Mid Boiler'da tek başına girdin ve karşı takım seni TP sesine göre kafadan tuttu.",
    "enemyPatterns": "Mid Boiler'da düşman TP sesine bakıp bekliyor ve kafadan line tutuyor.",
    "nextRoundPlan": "Mid Boiler'da TP ile girerken flash patlat ve yanına trade pozisyonunda bir takım arkadaşı koy."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumu",
    "deathAnalysis": "C Mound'da stun timing takımla senkron değilken öldün. Fault Line attığını sesle onaylat, Flash patlar patlamaz takım girsin.",
    "enemyPatterns": "C Main'den gelen uzun sightline seni sabit hedef yapıyor; stun penceresini değerlendirmiyorlar.",
    "nextRoundPlan": "Fault Line atacağını bağır, Flash patladığında takım anında entry yapsın."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main knife başarısızlığı",
    "deathAnalysis": "B Main'de knife attın ama takım arkasından push yapmadı; solo ilerleyince savunucu o açıya hazır bekleyip seni öldürdü.",
    "enemyPatterns": "Rakip B Main girişini sabit açıdan tutuyor ve knife penceresini kaçırdıktan sonra o açıyı kontrol ediyor.",
    "nextRoundPlan": "Bıçak vurduğunda hemen ses ver \"bıçak ikiye\" ve takımca pop-flash+entry ile B Main'e birlikte girin."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall duvar hatası",
    "deathAnalysis": "A Hall'da duvarı yanlış zamanda açtın; duvar açıkken seni kafadan kestiler. Duvarı entry başladıktan sonra değil, takım geçip görüş netleşince açıp hemen kapat.",
    "enemyPatterns": "Rakipler A Hall açısını duvar açıkken kafadan tutuyor.",
    "nextRoundPlan": "Duvarı takım entry yaptıktan sonra aç ve takım geçince kapat."
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
    "deathAnalysis": "You solo dry-entered A Main with no trade and died while wide swinging. Flash A Main first, then dash only when a teammate is directly ready to trade you.",
    "enemyPatterns": "A defender was pre-aiming the Heaven line to A Main and punished your untraded swing.",
    "nextRoundPlan": "Flash A Main, wait for a teammate to be in trade position, then dash in."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek punish",
    "deathAnalysis": "You took a kill at Hookah then overpeeked and died on the follow-up swing. After a frag at Hookah, reset to cover behind the window and avoid immediate second peeks.",
    "enemyPatterns": "The defender held a delayed Elbow swing to punish an aggressive second peek from Hookah.",
    "nextRoundPlan": "Take your entry kill, fall back behind the Hookah window and force a teammate to clear Elbow before you re-engage."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven Death",
    "deathAnalysis": "You walked into B Heaven alone during the late retake and died to a held angle; stop committing one-by-one to Heaven. On B Heaven, wait for a teammate to be on B Main trade and satchel out or re-peek together.",
    "enemyPatterns": "They held a passive Heaven angle to punish single entries and trusted crossfire rather than peeking early.",
    "nextRoundPlan": "Stack B Main with one teammate for a coordinated trade and satchel-reposition into Heaven together."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main fast entry",
    "deathAnalysis": "You sprinted A Main without utility and died to the A Tree / A Stairs crossfire. Open Fast Lane first and call for a flash over A Tree before you commit to the sprint.",
    "enemyPatterns": "Defender held the A Tree and A Stairs crossfire expecting a raw sprint and punished the unprotected entry.",
    "nextRoundPlan": "Ask a teammate for a flash over A Tree, open Fast Lane, then sprint A Main while staying inside the lane."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long Repeat Peek",
    "deathAnalysis": "You kept taking the same wide C Long peek and died while exposed. Shift to a deeper cover spot behind the crate or hold a tight off-angle from Garage instead.",
    "enemyPatterns": "They are pre-aiming the wide C Long sightline and punishing predictable swings.",
    "nextRoundPlan": "Hold a deep crate angle or an off-angle from Garage and only swing once you have a flash or a teammate trade ready."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Flashless Entry",
    "deathAnalysis": "You entered A Main without a flash and died to a pre-aimed defender. Throw a Curveball into A Main and swing the moment it pops.",
    "enemyPatterns": "Defender is holding A Main pre-aim consistently and punishes dry entries.",
    "nextRoundPlan": "Have a teammate flash A Main while you or the entry swing immediately, with a second player ready to trade from Elbow."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt repeat hold",
    "deathAnalysis": "You missed the first Operator shot at A Belt and stayed on the same tight angle. Fall back to A Generator or reposition to A Rafters before re-peeking to avoid the pre-aim.",
    "enemyPatterns": "Enemy was holding A Belt with a pre-aim on that exact line and punished the repeated angle.",
    "nextRoundPlan": "Do not re-hold A Belt after a missed shot; take A Generator or A Rafters and wait for trade or utility before peeking."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors Peek",
    "deathAnalysis": "You stepped out of your own smoke at Mid Doors and died on the swing. Either cast Paranoia before exiting and have a teammate watch Mid Plaza, or jiggle the smoke edge while staying behind the box to avoid full exposure.",
    "enemyPatterns": "They were pre-aiming the Mid Doors smoke exit and punished any full-body swing.",
    "nextRoundPlan": "Cast Paranoia, then peek the smoke edge with a teammate holding the trade."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator Loss",
    "deathAnalysis": "You held A Main with the Operator and died in a close-range contest, leaving the gun on the ground. Give the Operator to a teammate or back off to force a long-range fight instead.",
    "enemyPatterns": "An enemy swung from A Stairs or Tree into a short-range duel, forcing a close engagement that negated the Operator's strength.",
    "nextRoundPlan": "Hand the Operator to a teammate before committing to A Main or hold a deeper off-angle so fights stay long-range."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel Late Rotation",
    "deathAnalysis": "You rotated late from B Tunnel and walked into a B Window swing. Hold B Tunnel or wait for alarmbot trigger before leaving B Tunnel.",
    "enemyPatterns": "Enemy sat B Window to cut late B Tunnel rotations and punished your timing.",
    "nextRoundPlan": "Keep turret and alarmbot covering B Tunnel and rotate from B Tunnel only after teammate call or alarmbot trigger."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Wide Peek",
    "deathAnalysis": "You forced a wide peek at Mid Courtyard on an eco and died while exposed to a ranged weapon. Play tight angles on eco and stop challenging open sightlines unarmored.",
    "enemyPatterns": "The opponent held the deep sightline from Top Mid and punished the wide swing into Mid Courtyard.",
    "nextRoundPlan": "Anchor the Pizza cubby at Mid Courtyard or play a close shoulder angle instead of a wide swing on eco."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail solo entry",
    "deathAnalysis": "You pushed Mid Mail alone and died because there was no trade; solo Mid Mail on Split gives the defender a guaranteed swing. Bring a trade from Mid Top or Mail before you commit to the swing.",
    "enemyPatterns": "Defender held a passive Mail angle on the Mail→Mid corridor, punishing your unsupported solo peek.",
    "nextRoundPlan": "Take Mid Mail with a partner: Haunt first, send Prowler right after, and have your partner hold Mid Top to trade the swing."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage Utility Burn",
    "deathAnalysis": "You burned Skye abilities without getting recon in Garage and died. Next time, send the dog or force a team peek before popping a flash in Garage.",
    "enemyPatterns": "A defender held a Garage window/connector angle and waited for your utility window in Garage to punish you.",
    "nextRoundPlan": "Send Skye's dog into Garage, confirm a contact or sound cue, then flash and entry into Garage."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "A Short Anchor",
    "deathAnalysis": "You abandoned the A Short anchor too early and left Lamps/A Bath sightlines unchecked. Stay on A Short until a teammate trades or a flash pops, then move.",
    "enemyPatterns": "Defenders were punished by a Lamps-held angle covering A Short that capitalized on your early rotation.",
    "nextRoundPlan": "Hold A Short anchor until a teammate trades or a flash pops."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "B Link smoke timing",
    "deathAnalysis": "You stepped into B Link while your smoke popped late, so the defender had a clean pre-aim on the gap. Place the star pre-round and activate Nebula before committing to the Link next time.",
    "enemyPatterns": "The defender is holding the B Main/B Link sightline pre-aiming the smoke gap and punishes any late-smoke commits.",
    "nextRoundPlan": "Place a star on B Link in buy time and pop Nebula before you cross into the Link."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market Lurk",
    "deathAnalysis": "You lurked behind B Market and got killed from a B Alley flank. Stop deep solo lurks; hold a close off-angle near Market entrance and wait for a teammate to cut the flank.",
    "enemyPatterns": "A defender rotated through B Alley and was pre-aiming Market backline to catch isolated lurks.",
    "nextRoundPlan": "Have one teammate anchor B Alley while you hold a Market off-angle and immediately move to collect your Dizzy globule after contact."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler TP Aggro",
    "deathAnalysis": "You teleported into Mid Boiler and swung alone without a coordinated follow-up from Mid, so you died. Next time TP into Mid Boiler only when a flash is ready and a teammate is posted to trade the inner angle.",
    "enemyPatterns": "The defender held a tight inner/Mid Boiler line and pre-aimed the TP arrival, punishing solo entry.",
    "nextRoundPlan": "TP into Mid Boiler with flash synced and a Mid teammate committed to the inner trade."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound stun sync",
    "deathAnalysis": "You cast your stun on C Mound without team confirmation and they didn't follow, so you were exposed alone. Call the stun out loud and only fire it after a teammate verbally or ping-confirmed they're committing.",
    "enemyPatterns": "The defender held C Main and immediately peeked into Mound timing windows after isolated utility, punishing solo attempts.",
    "nextRoundPlan": "Announce \"stun C Mound\" then wait for a teammate \"going\" or ping before you throw it and commit together."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main Knife Fail",
    "deathAnalysis": "You threw the knife and then stalled, walking into a held B Main angle. Commit the suppress: have a flash pop and a teammate immediately follow to trade.",
    "enemyPatterns": "Defender is anchoring a tight Market/CT peek that punishes solo, delayed pushes into B Main.",
    "nextRoundPlan": "Call the knife, stack a flash on B Main and force the entry with a teammate ready to trade from Market."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "A Hall wall timing",
    "deathAnalysis": "You opened Toxic Screen on A Hall while no teammate controlled A Hall. That burned your fuel and left you pre-aimed, so you died.",
    "enemyPatterns": "A defender was pre-aiming A Hall entry and punished the wall opening from that angle.",
    "nextRoundPlan": "Wait for a teammate to hold A Hall entry before opening the wall, then close it once your team passes."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
