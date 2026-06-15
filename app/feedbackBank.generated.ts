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
    "deathAnalysis": "A Main'den tek başına utility'siz giriş yaptın; trade yoktu ve ilk atışı kaybettin. Heaven veya Generator'dan gelen açıyı kapatmadan girdin, bu yüzden kafadan kesildin.",
    "enemyPatterns": "A Main'e karşı savunucu Heaven ve Generator açılarını tutuyor, aynı köşeyi önceden nişanlamış gibi davranıyor.",
    "nextRoundPlan": "A Main'den dry entry yapma; bir teammate'ten flash iste ve flash patladığı anda dash ile swing at."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek hatası",
    "deathAnalysis": "Hookah'da kill aldıktan sonra fazla agresif overpeek atıp ikinci açıya çıktın ve trade ile kesildin. Bu ölüm heal kullanmadan veya kaçış güvenli pozisyona çekilmeden gereksiz yere açığa çıkmandan kaynaklandı.",
    "enemyPatterns": "Hookah'daki savunmacı kill sonrası oyuncuların overpeek yapacağını bekliyor ve ikinci açıyı önceden tutuyor; bu tekrar okunabilir hale geldiğinde seni oradan kafadan kesiyor.",
    "nextRoundPlan": "Hookah'ta kill aldıktan sonra hemen heal ile tam can al ve kaçış ile kapak arkasına çekil ve alternatif olarak takımından bir flash isteyip kapalı açıdan çık."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven erken peek",
    "deathAnalysis": "Geç retake sırasında B Heaven'da tek tek giren takımın içinde kaldın; erken peek veya utility eksikliği yüzünden yukarıdan açıyı tutan rakip seni kafadan vurdu. Takımın tek tek girmesi trade imkânı vermedi, senin pozisyonun izolasyon yarattı.",
    "enemyPatterns": "B Heaven savunucusu pasif duruyor ve yukarıdan açı ile siteyi kontrol ediyor, bu pozisyon yukarıdan seni daha kolay görmesini sağlıyor.",
    "nextRoundPlan": "Sonraki retake'te önce takımın smoke veya flash atmasını bekle, sonra molly ile Heaven'ı flush et ya da satchel ile hızlı reposition yap ve takımınla beraber trade pozisyonunda gir."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main — duvar eksik",
    "deathAnalysis": "A Main'de Tree ve Stairs açıları seni aynı anda gördü çünkü utility'siz hızlı entry yapıp ilk atışı yedin. Duvarı açmadan sprint ve slide sırasını bozmuşsun, bu yüzden sipersız kaldın.",
    "enemyPatterns": "Savunucu Tree ve Stairs'i aynı round'da sabit tutuyor ve ilk atış advantage'ı alıyor.",
    "nextRoundPlan": "Duvarı aç, takım arkadaşından smoke ve flash iste ve flash patladığı anda sprint ile entry yap."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long aynı açı",
    "deathAnalysis": "C Long'da aynı geniş açıyı tekrarladın, Plat'tan gelen sabit açı seni kafadan kesti. Drone veya recon kullanıp farklı bir açıdan gelmeliydin.",
    "enemyPatterns": "Plat yüksekteki savunucu aynı açıya önceden nişan alıp bekliyor, bu yüzden dry wide peek'lerde seni kolayca kesiyor.",
    "nextRoundPlan": "Drone ile Plat'i tara, recon'la pozisyonu doğrula ve takımından Plat'i smoke'lamasını iste; sonra Garage'dan bir arkadaşla split yapıp site'a gir."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main flash'sız giriş",
    "deathAnalysis": "A Main'de flash atmadan geniş açıyla entry yaptın, savunucu ilk atış advantage'ını kullanıp seni kesti; flash attıktan sonra hemen swing atmadığın veya hiç flash atmadığın için görüşü sende değildi.",
    "enemyPatterns": "A Main'deki savunucu köşeyi önceden tutuyor; flash yokken seni bekleyip köşeden kafadan vuruyor.",
    "nextRoundPlan": "Flash'ı A Main köşesine at ve flash patlar patlamaz geniş açıyla swing at, molly'i köşeye koyup dövüş sonrası HP doldur."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt aynı açı",
    "deathAnalysis": "A Belt'te Operator ilk atışı ıskaladı ama aynı açıda kaldı; sen de yine aynı off-angle'da bekleyince ikinci atışta kafadan vurdun. Aynı açıyı tekrar tutman seni okunur hale getirdi.",
    "enemyPatterns": "Rakip aynı açıyı sabit tutuyor — ilk atışı ıskalasa bile pozisyondan çekilmiyor, yani o açı artık okunabilir.",
    "nextRoundPlan": "Teli A Belt choke'a koy ve kamerayı A Platform yönüne çevir, alternatifi takım arkadaşından flash veya smoke isteyip telin üzerine smoke at."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors — smoke'tan çıkıp peek",
    "deathAnalysis": "Mid Doors'da kendi smoke'unun içinden çıkıp peek attın ve açıyı önceden nişanlayan bir oyuncu seni aynı açıdan kafadan aldı. Smoke içinde çıkmak seni predictable yaptı; teleport ile beklenmedik açıdan çıkmalıydın.",
    "enemyPatterns": "Rakip Mid Doors açılarını önceden nişanlıyor; smoke içinden çıkanları aynı açıdan tuttuğu için o çıkışlarda öldürme oranı yüksek.",
    "nextRoundPlan": "Mid Doors'a yüksek koyulmuş smoke at, flash at ve teleport ile farklı açıdan dışarı çık."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main tek atış + TP",
    "deathAnalysis": "A Main'de Tree ve Stairs açılarına utility olmadan girip Operator'la sabit kaldın; ilk atışı alamadın ve karşı açıdan op seni kesti. Chamber döngüsünü bozmuşsun — bir atış, teleport; tekrar peek atmak öldürdü.",
    "enemyPatterns": "Lotus A Main'de defender'lar Tree ve Stairs'i aynı anda tutuyor, yani utility'siz wide veya sabit duruşta op seni iki açıdan kafadan vuruyor.",
    "nextRoundPlan": "Anchor'ı A Main'e kur, bir atış için tabanca veya Operator'ı hazır tut, flash iste ve flash patladığı anda swing at sonra teleport et."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel rotasyonu geç kaldı",
    "deathAnalysis": "B Tunnel'da rotasyonu geç başlattın; turret ve bot'ın verdiği gecikmeden faydalanamadan karşılaştın ve öldün. Bot tetiklenmeden molly'ı aktif edemedin, bu yüzden utility kombinasyonu işe yaramadı.",
    "enemyPatterns": "Rotasyonu geç başlatman, B Tunnel girişlerini erken kontrol eden düşmanın seni o koridorda yakalayıp öldürmesine yol açtı; burada util'in zamanlaması seni okumasına izin verdi.",
    "nextRoundPlan": "Bot'u B Tunnel girişine koy ve molly'ı bot'un üstüne yerleştir, rotasyonu başlatmadan önce turret'i geri çek ve teammate'ten smoke veya flash iste."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard Eco Ölüm",
    "deathAnalysis": "Mid Courtyard'da eco round'da geniş açıyla utility'siz swing atıp girdin; uzak-orta mesafeden gelen saldırı seni ödedi.",
    "enemyPatterns": "KB'ye göre eco round'da rakipler yakın mesafede agresif gelir, Mid Courtyard'ın geniş açısı bu agresyona açık alan sundu.",
    "nextRoundPlan": "Yavaşlatma Mid Courtyard'a at ve duvarı çapraz koy, takımdan smoke veya flash isteyip uzak mesafede tut."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail trade yok",
    "deathAnalysis": "Mid Mail'de trade pozisyonu olmadan girdin; tek başına girişte biri seni kafadan aldı. Recon at, bot'ı o ize gönderip takımdan swing ve trade iste; trade gelmezse sabitlemeyi choke'a atıp geri çekil.",
    "enemyPatterns": "Mid Mail'de savunmacılar erken açı tutup trade gelmeyen solo girişleri anında tekli kafadan kapıyor.",
    "nextRoundPlan": "Recon at, bot bağlandığında 'swing atın' de ve takımdan trade al; trade yoksa sabitleme ile choke'u kilitle, geri çekil."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'ta utility'siz ölüm",
    "deathAnalysis": "Garage'da bilgi almadan flash ve recon kullandın ve boş alana util harcadın; düşman Window ve Connector açılarını önceden tutuyordu. Bu yüzden senin util penceren boşa gitti ve ilk atışı onlar yaptı.",
    "enemyPatterns": "Garage ihmal edildiğinde rakip Window ve Connector üzerinden sabit açı tutup kolayca trade ve one-tap alıyor.",
    "nextRoundPlan": "Recon'ı Garage içeri gönderip pozisyonu doğrula, flash'ı girişte flash olarak patlat ve takımından birinden smoke ve flash iste."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short anchor hatası",
    "deathAnalysis": "A Short'ta anchor pozisyonunu çok erken bıraktın; Heaven ve Lamps açılarını boş bıraktın ve arkadan veya teleporter çıkışından çıkan düşman seni kesti. Bu, A Short'u her zaman en az iki kişi tutman gerektiği kuralını ihlal ediyor çünkü tek başına kaldığında trade alamıyorsun.",
    "enemyPatterns": "Düşman A Short'ı açıyı önceden tutuyor ve teleporter ve arka açıya bakarak aynı noktadan tekrar tekrar seni vuruyor.",
    "nextRoundPlan": "A Short'ta anchor'ı bırakma; teleporter çıkışına molly at ve yanında bir teammate ile tandem bekle, gerekiyorsa teammate'ten flash iste."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link smoke gecikmesi",
    "deathAnalysis": "B Link'te smoke'yı geç açtın; smoke patlayıp etkisi bitince açık kaldın ve site'ı tutan seni kesti. Astra yıldızını B Link'e koyup smoke'yı girişte açmalıydın; smoke patladığı anda takımınla swing başlat.",
    "enemyPatterns": "Savunucular B Link'te smoke'in bitmesini bekleyip, açıkta kalan oyuncuyu aynı açıdan kesiyor.",
    "nextRoundPlan": "Round başında B Link yıldızını yerleştir, smoke'yı girişten hemen önce aç ve takım arkadaşından flash iste."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market'te flank yediniz",
    "deathAnalysis": "B Market'te lurk yaparken arkadan yakalandın; arka hattı kontrol etmeyip globülü geri alma rotanı planlamadın. Gekko'da globül geri almamak, yaratık döngünü ve bilgi pencereni yok ediyor.",
    "enemyPatterns": "Rakip arkadan flank ve rotate ile Market geçişlerini kullanıp arka açıdan seni kesiyor, yani B Market'in arka hattı kontrolsüz kalmış.",
    "nextRoundPlan": "Globülü attıktan sonra hemen topla ve bot'i sadece site temiz veya smoke'luysa plant için yolla, tehlike varsa teammate'ten smoke iste."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Mid Boiler — takipsiz teleport",
    "deathAnalysis": "Teleport sonrası Mid Boiler'da takipsiz agresyon yapıp doğrudan swing atmadın; teleport sonrası ne yapacağını planlamamışsın, bu yüzden öldün. Teleport'e girerken flash hazır olmadan veya klonla senkronize olmadan yerleşince düşman seni kafadan kesti.",
    "enemyPatterns": "Işınlandıktan sonra takip olmadan girince düşman o açıyı önceden nişanlamış ve seni oradan kafadan vuruyor.",
    "nextRoundPlan": "Teleport'e girmeden önce flash hazırla ve teammate'ten trade pozisyonu iste, alternatif olarak önce klonu gönder; klona tepki gelince hemen swing at."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "C Mound'da sersemletme attın ama takım giriş yapmadı; flash patladığında açıkta kaldın ve öldün.",
    "enemyPatterns": "Bu pattern, sersemletme attığın an takım hazır olmadığı için sarsmanın boşa gittiğini gösteriyor; yani util zamanlaman takımla uyumsuz.",
    "nextRoundPlan": "Bir sonraki round'da C Mound'da 'sersemletme geliyor' diye sesli bildir, sersemletme at ve flash duyurup flash patlar patlamaz takım girsin."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main'de yetenek kapatan bıçak etkisiz kalmış",
    "deathAnalysis": "B Main'de yetenek kapatan bıçak attın ama bıçak sonrası baskı kurmadın, suppress penceresini kullanmadın; bunun sonucunda oradaki savunucu seni kafadan kesti. Bıçak etkisini anonslamayı veya hemen giriş yapmayı atladın, o pencere boşa gitti.",
    "enemyPatterns": "Yetenek kapatan bıçak sonrası baskı kurmaman, B Main'deki savunucunun o açıyı sabit tuttuğunu okunabilir hale getirdi; savunucu muhtemelen köşede bekliyor.",
    "nextRoundPlan": "Yetenek kapatan bıçak at, hemen 'bıçak ikiye vurdu' diye söyle ve flash patlayınca B Main'e gir."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall - duvar hatası",
    "deathAnalysis": "A Hall'da duvarı yanlış zamanda açtın, duvar aktifken rakip açıya hazırdı ve seni ilk atışta kesti. Duvarı erken açman yakıtını boşalttı ve post-plant için elinde util kalmadı.",
    "enemyPatterns": "Rakip A Hall açısını önceden nişanlıyor ve ilk atış advantage'ı alıyor.",
    "nextRoundPlan": "Duvarı takım A'ya girerken aç ve geçince kapat, orb'u post-plant için sakla."
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
    "deathAnalysis": "You did a solo dry entry through A Main with no trade and died instantly; entry without a flash or teammate trade handed the defender a free first shot. Use smoke or ask a teammate for a flash before you dash or swing next time, because your dash alone didn't protect you in A Main.",
    "enemyPatterns": "The kill indicates a defender was pre-aiming A Main from a high Heaven and Generator line and punished an isolated peek.",
    "nextRoundPlan": "Do not entry alone: wait for a teammate to be in trade range and have their flash or your smoke land before you dash into A Main."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek",
    "deathAnalysis": "You got a kill in Hookah then overpeeked aggressively without heal or a safe dash away, so you were exposed and traded. After kills at Hookah default to heal behind cover and only use dash away to exit into a prepared safe spot.",
    "enemyPatterns": "A defender was holding the Hookah trade angle and punished the second peek when you stayed exposed after the kill.",
    "nextRoundPlan": "After a Hookah kill, nearsight then heal behind cover or dash away into a corner and ask a teammate for a flash before you re-peek."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven late retake",
    "deathAnalysis": "You attempted a late retake into B Heaven and came in one-by-one from B Main, so the high-ground defender had an isolated kill on you. Entering solo on a Heaven retake removed any chance for trades or using your explosives effectively.",
    "enemyPatterns": "The enemy held B Heaven’s height and punished single entries from B Main with a straight sightline into site.",
    "nextRoundPlan": "Do not entry alone; ask a teammate for a flash or smoke, send bot into B Main, use cluster grenade to flush Heaven, then Satchel into site while the flash pops so you have a trade window."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main — wall miss",
    "deathAnalysis": "You ran into A Main without wall or a teammate flash and got killed holding no cover; wall then slide would have given you cover and timing. The dry sprint left you exposed to Tree and Stairs sightlines, so stop entering A Main raw.",
    "enemyPatterns": "Defenders in A Main held Tree and Stairs angles and punished the unprotected run with stacked sightlines.",
    "nextRoundPlan": "Open wall first, ask a teammate for a flash or smoke, then sprint and slide into the A Main angle as the flash pops."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long repeat",
    "deathAnalysis": "You died at C Long after repeatedly taking the same wide sightline; they were pre-aiming that exact angle. Shift your recon to a different height and use drone first so you don't expose yourself while droning.",
    "enemyPatterns": "The defender is holding the common wide C Long line and punishing repeated, predictable peeks with pre-aimed fire.",
    "nextRoundPlan": "Fire an off-height recon, drone the angle with drone, and ask a teammate for a flash or smoke before you peek."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main — no flash",
    "deathAnalysis": "You entered A Main without using flash and died to a pre-aimed defender at A Main; flashless dry entry let them keep their aim locked. Next time pop flash and wide-swing the corner as it blinds, or ask a teammate for a smoke then use fire wall to block line of sight.",
    "enemyPatterns": "The killer held A Main and Elbow ready for a dry entry, meaning they expected a blind push and stayed on the default sightline.",
    "nextRoundPlan": "Start the round by throwing flash into A Main then commit the swing immediately after the flash pops."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt — stayed same angle",
    "deathAnalysis": "You fired the Operator and missed the first shot at A Belt, then held the exact same angle and died because they were pre-aiming that line; change the angle or fall back after a whiff to avoid the follow-up peek. Use camera to gather info before re-peeking and place tripwire or smoke behind you so a second swing must clear utility before swinging the belt again.",
    "enemyPatterns": "The enemy held A Belt's sightline and punished the missed first shot by staying on that line and re-peeking the same angle.",
    "nextRoundPlan": "Do not hold the same sightline after an Operator whiff; fall back to cover, reposition off-angle on A Belt and ask a teammate for a flash if you want to re-enter."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Died at Mid Doors",
    "deathAnalysis": "You stepped out of your own smoke at Mid Doors and got killed because you presented a predictable silhouette when the smoke cleared; instead smoke high for a one-way or reposition with teleport before peeking. A backup option is to ask a teammate for a flash and time your peek to the flash pop rather than exiting the smoke alone at Mid Doors.",
    "enemyPatterns": "The opponent held the Mid Doors sightline and pre-aimed the smoke exit, punishing anyone who peeks from the same smoke at Mid Doors.",
    "nextRoundPlan": "Smoke Mid Doors high for a one-way or teleport to an unexpected angle before you peek, and if neither is available ask a teammate for a flash to cover your peek."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator Death",
    "deathAnalysis": "You died at A Main with the Operator after taking a close peek instead of holding the long line; ult is for long angles and that peek put you in a close duel. Your teleport was too exposed — one-shot then immediate teleport to cover, or swap to pistol for close fights.",
    "enemyPatterns": "The defender held the A Main angle tight and punished any close-range Operator peek.",
    "nextRoundPlan": "Hold the long A Main sightline or buy pistol for close A Main peeks and place teleport behind cover."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "Late Rotate — B Tunnel",
    "deathAnalysis": "You rotated late into B Tunnel after the initial contact and pushed without your bot and molly or turret set, so you walked into an enemy crossfire and died. Put your bot and molly down before you commit, or stay on-site to delay instead of rotating blind.",
    "enemyPatterns": "The enemy was holding a crossfire from B site and the back-site angle, using the choke to punish delayed rotations into B Tunnel.",
    "nextRoundPlan": "Pre-place bot and molly covering B Tunnel, keep your turret off-angle for early info, and ask a teammate for a flash if you must rotate in."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Eco",
    "deathAnalysis": "You pushed wide at Mid Courtyard on an eco round and died because you entered a large sightline without using slow or wall. On eco rounds that wide peek lost you the duel; either delay the peek or force them to react first.",
    "enemyPatterns": "The opponent held the long Mid sightline and punished the wide eco peek at Mid Courtyard, turning your uncovered angle into an easy kill.",
    "nextRoundPlan": "Do not wide peek Mid Courtyard on eco; throw slow as they commit and either set a wall to cut the sightline or ask a teammate for a flash and swing together."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Died Solo at Mid Mail",
    "deathAnalysis": "You pushed Mid Mail alone without a trade and got punished because nobody was holding the swing for you; use recon then send bot to clear before committing or move with a partner to guarantee a trade.",
    "enemyPatterns": "They held the Mail sightline and punished a lone entry, so the angle is being watched and will continue to punish solo peeks.",
    "nextRoundPlan": "Recon into Mail then send bot while a teammate stays ready to trade, or ask a teammate for a flash and wide-swing Mail together."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage — wasted utility",
    "deathAnalysis": "You popped flash and sent the recon into Garage before you had any recon, so you walked into a held angle and died. Save one utility and wait for a clear sound or a teammate flash before committing to Garage.",
    "enemyPatterns": "Someone was holding Garage from a safe angle that punishes utility-first entries and waits for you to clear the path.",
    "nextRoundPlan": "Hold flash or recon until you hear footsteps or a teammate flashes, then use flash to blind and recon to confirm before swinging into Garage."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "A Short anchor",
    "deathAnalysis": "You left your anchor at A Short too early and got killed while rotating; hold that corner longer because A Short and the teleporter create two-way pressure. Use smoke to block the teleporter line and save molly for post-plant instead of abandoning the angle.",
    "enemyPatterns": "This suggests attackers were holding the A Short lane or a Heaven and Lamps crossfire and punished your premature rotation when you vacated the anchor.",
    "nextRoundPlan": "Stay at A Short until a teammate trades or you hear teleporter and utility, place smoke on the teleporter line and keep molly to delay any defuse or plant."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "Late smoke — B Link",
    "deathAnalysis": "You committed into B Link before your smoke went up, so you walked into a pre-aimed angle and died; as Astra place the star in buy and activate smoke before stepping into the choke. Using smoke after you start the peek left you exposed to a clean first shot.",
    "enemyPatterns": "The defender was holding the B Link sightline and kept a tight pre-aim on the choke so the smoke window needed to be live before your entry.",
    "nextRoundPlan": "Place the star at B Link during buy, pop smoke before you step into the lane and ask a teammate for a flash to immediately follow the smoke."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "Caught at B Market",
    "deathAnalysis": "You lurked into B Market and got killed from behind because you never denied the flank or used flash and ult to check that space. Pull flash into the flank path or throw ult to force them out before you rotate back into Market.",
    "enemyPatterns": "Opponent held the Market backside route and timed a flank to punish your solo lurk.",
    "nextRoundPlan": "Send flash toward the Market flank and ask a teammate for a flash before you enter, or hold the backtrack angle yourself instead of drifting alone."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler TP death",
    "deathAnalysis": "You teleported into Mid Boiler then pushed without a plan, and died because your teleport was predictable and you had no flash ready. Main: hide teleport behind cover and arrive with flash in hand; alternative: send clone first and only teleport when the clone draws fire.",
    "enemyPatterns": "A defender held the close Boiler angle pre-aiming the TP exit and punished the predictable arrival.",
    "nextRoundPlan": "Conceal teleport behind the box, have flash ready, and only TP when the clone or a teammate's flash forces a reaction."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound stun mismatch",
    "deathAnalysis": "You cast stun at C Mound but the team did not follow the stun timing, so the sarsma window ended and you were left exposed and traded. Next time call the ability out loud before you cast and chain flash so the team can commit during the stun.",
    "enemyPatterns": "A defender was holding C Main sightline and punished you as you were stationary on Mound while the stun window closed.",
    "nextRoundPlan": "Announce \"stun coming\" and wait a teammate to confirm entry, then cast flash and stun together; if teammates hesitate, ask a teammate for a flash or smoke instead."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main — suppress knife miss",
    "deathAnalysis": "You dropped suppress knife before defenders settled in B Main, it hit nobody so you pushed with no suppress and got punished; next time wait for defenders to take their angles then drop the blade so it counts. Always call the suppress number right after the knife so your team knows whether to commit.",
    "enemyPatterns": "A defender was holding a B Main angle and punished your dry entry once the knife produced no effect.",
    "nextRoundPlan": "Hold off, throw suppress knife into the B Main corner once enemies show or hold angle, call the count, then ask a teammate for a flash and commit."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "Wrong Wall Timing — A Hall",
    "deathAnalysis": "You opened wall in A Hall too early and got killed while the wall was active; close the wall after your teammates pass to avoid giving defenders a pre-aim advantage in A Hall. Save smoke for post-plant and stop using molly during the initial entry on A Hall because your utility is being spent at the wrong phase.",
    "enemyPatterns": "The defender holding A Hall was pre-aiming the wall line and abused the open wall to take a clean angle on you in A Hall.",
    "nextRoundPlan": "Open wall as your team commits through A Hall, close it once teammates clear the entry, and keep smoke for after the spike plant."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
