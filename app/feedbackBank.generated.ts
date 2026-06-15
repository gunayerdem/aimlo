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
    "deathAnalysis": "A Main'de tek başına utility'siz giriş yaptın, trade yoktu ve Heaven ve Generator açısını tutan savunucu seni kafadan vurdu. Utility'siz entry yaptığında düşman nişanını sana kilitler; dash'i yaşamak için saklamalısın.",
    "enemyPatterns": "Savunucu A Main'i Heaven veya Generator'dan açıyı önceden tutuyor ve utility'siz girenleri kafadan vuruyor.",
    "nextRoundPlan": "Takımdan flash veya smoke iste ve flash patladığı an dash ile A Main'den gir."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek",
    "deathAnalysis": "Hookah'ta kill sonrası fazla agresif overpeek yaptın, ikinci açıya çıkınca orada bekleyen oyuncu seni kafadan vurdu. Kill sonrası varsayılan hareket kaçış değil, kapağa çekilip heal ile tam can almak olmalı.",
    "enemyPatterns": "Hookah açısını öldüğün anda aynı hizadan tutuyorlar ve ikinci swing için açı bekliyorlar.",
    "nextRoundPlan": "Hookah'ta kill alınca çıkma, kapağa çekil ve heal ile tam can al ve gerekirse kaçış kullan."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven'da öldün",
    "deathAnalysis": "B Heaven'da geç retake'te tek tek içeri girdin. Paint Shell atıp bot öne sürmeden satchel'le içeri girdiğin için Heaven'daki oyuncu seni kafadan vurdu.",
    "enemyPatterns": "B Heaven'daki oyuncu pozisyonunu sabit tutuyor ve yukarı açıyı koruyor, satchel'le gelen tek tek girişleri yukarıdan kafadan bekliyor.",
    "nextRoundPlan": "Bot'u öne at, Paint Shell'i Heaven içine at ve takımından smoke veya flash iste sonra satchel ile içeri gir çünkü Heaven yukarıdan seni kafadan kesiyor."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main'de utility'siz sprint ölümü",
    "deathAnalysis": "A Main'de duvarını açmadan utility'siz hızlı giriş yaptın; Tree ve Stairs açıları seni aynı anda gördü, ilk atışı düşman aldı. Önce duvarını aç, teammate'ten smoke veya flash iste, flash patlar patlamaz sprint ve slide ile içeri gir.",
    "enemyPatterns": "Tree veya Stairs'te defender açıyı önceden nişanlamış bekliyor; dry sprint'leri kafadan kesiyorlar.",
    "nextRoundPlan": "Duvarını at, smoke veya flash gelene kadar sprint etme; flash patlayınca slide ile A Main'e gir."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long aynı açıdan öldün",
    "deathAnalysis": "C Long'da hep aynı geniş açıdan öldün; Plat ve CT yüksek açısını utility'siz geçince karşı savunucu seni kafadan vuruyor. Recon veya drone ile açı doğrulayıp Plat'ı smoke'la ya da teammate'tan flash iste, ardından iki yönlü split ile geç.",
    "enemyPatterns": "Karşı takım Plat tarafında yüksek açı tutuyor ve C Long cross'u sabit kontrol ediyor, yani geniş açıya sık sık kafadan vuruyorlar.",
    "nextRoundPlan": "Recon'i Plat ve CT hattına at, drone ile doğrula, smoke at veya flash iste ve Garage'dan destekle çift yön split ile gir."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main'da flash'sız giriş",
    "deathAnalysis": "Flash atmadan A Main'e girdin ve savunan ilk atış avantajı aldı çünkü flash patlamadan swing atmadın. Ateş duvarı ile görüşü kapatıp molly ile HP doldurmadan içeri girmek seni açığa çıkardı.",
    "enemyPatterns": "Savunan A Main köşesini önceden nişanlayıp ilk atış ile seni kafadan kesmiş gibi duruyor.",
    "nextRoundPlan": "Flash at, patladığı anda geniş swing at ve molly ile HP doldur."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt aynı açı",
    "deathAnalysis": "A Belt'te Operator ilk atışı kaçırdı ama aynı açıda bekleyip seni ikinci atışta kafadan vurdu. Aynı açıya tekrar çıkman düşmanın nişanını o noktaya kilitledi.",
    "enemyPatterns": "Rakip aynı açıyı üst üste tutuyor; ilk atışı kaçırsa bile aynı noktada bekleyip ikinci atışı alıyor.",
    "nextRoundPlan": "Bir sonraki round A Belt'te farklı bir açıda bekle ve kamera ile teli A Belt'e yakın off-angle bir noktaya koy."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors smoke çıkışı",
    "deathAnalysis": "Mid Doors'da kendi smoke'unun içinden çıkıp peek attın; savunucu köşeyi önceden nişanlamış ve seni kafadan kesti. Smoke'ı içerden düz çıkış için kullanmak yerine high one-way ayarlayıp veya teleport ile farklı açıya geçmeliydin.",
    "enemyPatterns": "Rakip Mid Doors'da smoke içinden çıkışları bekleyip köşeyi önceden nişanlıyor gibi görünüyor.",
    "nextRoundPlan": "Smoke'ı yüksek one-way koy ve teleport ile kutu üstüne teleport olup oradan peek at."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main bir atış, teleport",
    "deathAnalysis": "A Main'de Operator seni tek atışla kafadan vurdu; ilk atışı yapıp teleport olmadan aynı açıdan tekrar peek attın.",
    "enemyPatterns": "A Main'de Operator tutan düşman açıyı önceden nişanlayıp sabit bekliyor, aynı açıdan seni kafadan vuruyor.",
    "nextRoundPlan": "A Main'de bir atış yap ve hemen teleport ol, anchor'u biraz geriye koy ve takımından flash'ı yukarı at iste."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel erken nişanlandı",
    "deathAnalysis": "B Tunnel'da rotasyonu geç başlattın, düşman açıyı önceden tutuyordu ve seni kafadan vurdu. Senin hatan, rotasyon gecikmesiyle ilk atış avantajı onlara bırakmandı.",
    "enemyPatterns": "Sonraki roundlarda B Tunnel açısını önceden nişanlayıp bekleme eğiliminde görünüyorlar; aynı açıdan kafadan kesiyorlar.",
    "nextRoundPlan": "Turret'i B Tunnel off-angle'a koy ve bot ile molly'ı botun üstüne önceden yerleştir, rotasyonla birlikte geri çekil."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard'da geniş açıyla öldün",
    "deathAnalysis": "Mid Courtyard'da eco round'da geniş açıdan dry çıkıp erken görüldün; açıkta kaldığın için yakın mesafe silahlar seni kafadan kestirdi. Geniş açıda util yoktu, bu yüzden ilk duelde şansın sıfırdı.",
    "enemyPatterns": "Eco rakipleri yakın mesafeyle agresif gelip geniş açıları zorladılar; Mid Courtyard'da seni açıkta bekleyen bir oynama varmış gibi çalıştılar.",
    "nextRoundPlan": "Mid Courtyard'da dry geniş açıya çıkma, takım arkadaşından flash iste ve sen gelince slow at."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail solo entry",
    "deathAnalysis": "Mid Mail'de trade pozisyonu olmadan girdin; solo entry'de biri seni kafadan kesti çünkü arkan trade yoktu.",
    "enemyPatterns": "Mid Mail'de girişlerine karşı rakip trade beklemiyor ve tek temasta seni aynı açıdan kesiyor.",
    "nextRoundPlan": "Recon at, ize bot gönder ve stun ile kaçış yolunu kapat, takımdan hemen trade iste."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'da utility hatası",
    "deathAnalysis": "Garage'da bilgi almadan utility harcadın ve içeri girdin; bu yüzden Window hattından gelen savunucu seni kafadan vurdu. Recon veya flash ile önce bilgi almamız gerekirdi.",
    "enemyPatterns": "Garage'ı kontrol eden savunucu Window hattını önceden tutuyor ve utility'siz girişleri kafadan kesiyor.",
    "nextRoundPlan": "Recon'ı Garage içine gönder, flash'ı patlat ve flash sesiyle takım arkadaşınla birlikte içeri gir."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short'ta erken çekilme",
    "deathAnalysis": "A Short'ta anchor pozisyonunu çok erken bıraktın; Lamps ve Heaven açısını kapatacak kimse kalmayınca aynı açıdan seni kafadan kestiler. Bu yüzden öldün, çünkü trade veya crossfire yoktu.",
    "enemyPatterns": "Tekrar eden bir hata: aynı açıya veri veriyorsun — rakip o açıyı bekleyip sabit tutuyor ve seni aynı noktadan kesiyor.",
    "nextRoundPlan": "Heaven'da kal veya Lamps'a geri dön ve A Short'ı en az iki kişiyle tut, gerekirse teammate'ten flash ya da smoke iste."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link smoke gecikmesi",
    "deathAnalysis": "B Link'te smoke timing'i geç kaldın, smoke patlamadan girince açıkta kaldın ve arkadan avlandın. Yıldızı erken B Link choke'a koyup smoke'u aktif etseydin girişin trade'e dönüşme şansı olurdu",
    "enemyPatterns": "B Link'i tutan savunucu smoke gecikmesine göre aynı açıdan bekliyor, smoke patlamadan önce nişanını o choke'a kilitliyor",
    "nextRoundPlan": "Yıldızını B Link choke'a önceden koy, smoke'u patlatır patlatmaz gir ya da takım arkadaşından smoke ve flash iste"
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market'te Lurk Yakalandın",
    "deathAnalysis": "B Market'te lurk yaparken arkadan yakalandın; arka hattı kontrol etmeden dolaşmak seni kafadan vurulmaya açık bıraktı. Bu pozisyonda tek başına arka koridoru tutmaya çalışmak riskli.",
    "enemyPatterns": "Seni arkadan yakalayan rakip B Market arkasını takip edip gizli rotadan flank atıyor gibi oynuyor.",
    "nextRoundPlan": "Globülü topla ve Market arkasını kapatana kadar orada bekleme, takımından birinden Market'e siper veya bir utility iste."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Mid Boiler TP hatası",
    "deathAnalysis": "Mid Boiler'da TP sonrası takipsiz agresyon yaptın ve flash olmadan girdin, bu yüzden seni açıyı önceden tutan rakip kafadan vurdu. TP noktası tahmin edilebilir ve girmeden ne yapacağını planlamamışsın, bu yüzden ölünce trade de gelmedi.",
    "enemyPatterns": "Rakipler Mid Boiler açısını önceden tutuyor; TP sesi veya gözüken hareket sonrası orayı kapıyorlar.",
    "nextRoundPlan": "TP'yi kutunun arkasına göm ve flash'ı patlatır patlatmaz aynı anda çık."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun mismatch",
    "deathAnalysis": "C Mound'da sersemletme (stun) attın ama takım giriş yapmadı; stun etkisi geçince açıkta kaldın ve öldün. Stun atacağını sesli söyleyip takım onayını alın; stun patladığı anda takım arkanızdan girsin.",
    "enemyPatterns": "Stun attın ama kimse girmedi, bunun anlamı takım stun zamanlamanı bilmiyor ve sarsma penceresini kaçırıyor.",
    "nextRoundPlan": "Sersemletme diye bağır, takım onayını al ve stun patladığı an C Mound'dan içeri girin."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main bıçak sonrası boş",
    "deathAnalysis": "B Main'de bıçağı attın ama kaç kilit geldiğini takıma söyleyip hemen baskı kurmadın; solo push'unda trade yoktu ve tek atıldın. Bu yüzden B Main'den çıkan savunucu seni rahatça öldürdü.",
    "enemyPatterns": "B Main'deki savunucu bıçağın sonrası pozisyonunu bekliyor ve geniş açıyla swing atıp tek oyuncuyu kesiyor.",
    "nextRoundPlan": "Bıçak attığın anda bağır: 'bıçak ikiye ve boş', hemen entry ile beraber takım arkadaşından flash iste ve birlikte B Main'den gir."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall'de duvarı erken açtın",
    "deathAnalysis": "A Hall'de duvarı yanlış zamanda açtın; karşıdaki açıyı önceden nişanlamış savunucu ilk atış avantajı alıp kafadan vurdu. Duvarı takım site'a girerken aç, geçer geçmez kapat ve orb'u post-plant için sakla.",
    "enemyPatterns": "Bu tekrar A Hall duvar açısını okuduğunu gösteriyor; rakip aynı açıyı önceden tutuyor.",
    "nextRoundPlan": "Duvarı entry'de açık tutma, takım geçince aç ve hemen kapat."
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
    "deathAnalysis": "You ran a dry solo entry into A Main with no trade and died because the defender was pre-aiming that angle; next time wait for a teammate flash or smoke before peeking A Main and use dash (dash) to exit after a kill.",
    "enemyPatterns": "The defender was holding A Main from Heaven or Generator, pre-aiming the common A Main line and punishing dry peeks.",
    "nextRoundPlan": "Ask a teammate for a flash and follow it into A Main, then pop dash to bail after your first kill."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek",
    "deathAnalysis": "You cleared the first fight in Hookah then overpeeked aggressively and got traded instead of healing with heal or exiting with dash away, which left you exposed in Hookah. Next time, stun with nearsight into cover, use heal behind the box, or dash away back to safety after the frag.",
    "enemyPatterns": "The killer held a tight Hookah angle ready to punish wide overpeeks and capitalized on your momentum after the first kill.",
    "nextRoundPlan": "After your entry frag at Hookah, throw nearsight, step to cover and use heal or dash away before re-engaging."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "Death at B Heaven",
    "deathAnalysis": "You attempted a late retake and swung into B Heaven one‑by‑one, dying to the high angle because you gave Heaven an isolated duel. Next time send your bot and then use cluster grenade + a satchel entry before committing, because clearing Heaven first removes the vertical blindspot that killed you.",
    "enemyPatterns": "Defender held B Heaven as the dominant angle watching B Main and B Back, using the height to win isolated fights.",
    "nextRoundPlan": "Ask a teammate for a smoke and a flash, send bot first then cluster grenade into Heaven and push together through B Main to trade, because coordinated pressure negates the Heaven advantage."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main dry entry",
    "deathAnalysis": "You rushed A Main on Lotus without wall or team utility and died to Tree and Stairs crossfire because your sprint left you fully exposed. Use wall then sprint and slide with a teammate flash or smoke because the wall and utility deny the defender a clean first shot.",
    "enemyPatterns": "A Main defenders held Tree and Stairs crossfire on A Main, waiting for a dry entry.",
    "nextRoundPlan": "Cast wall, ask a teammate for a flash or smoke, then sprint and slide into A Main."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long repeat death",
    "deathAnalysis": "You took the same wide C Long sightline again and died because defenders were pre-aiming that exact angle. Switch how you clear it: your recon should confirm the Plat and CT hold before you peek.",
    "enemyPatterns": "A defender on Plat and CT is holding the long sightline and pre-aiming the wide cross so repeated wide peeks get eaten.",
    "nextRoundPlan": "First send your drone into C Long then fire a Recon Dart to force or reveal the Plat and CT angle, and ask a teammate for a smoke and a flash before you swing."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main dry push",
    "deathAnalysis": "You entered A Main without throwing a flash and died because the defender was pre-aiming that angle.",
    "enemyPatterns": "The opponent held a tight A Main sightline and punished a dry push.",
    "nextRoundPlan": "Throw your flash into A Main and swing as the flash pops, and if no teammate can flash, put your fire wall across the choke to block vision then step through while using molly behind cover."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt off-angle",
    "deathAnalysis": "You missed the first Operator shot at A Belt and then stayed on the exact A Belt angle, so the enemy simply pre-aimed and finished you. Next time don't hold the same A Belt line after a whiff; reposition or use camera to delay their sightline.",
    "enemyPatterns": "The opponent held A Belt with an Operator pre-aiming the belt line and remained on that A Belt angle after the first miss.",
    "nextRoundPlan": "Move off the standard A Belt angle and set tripwire or place camera covering the original A Belt line."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors peek",
    "deathAnalysis": "You exited your smoke at Mid Doors and straight-peeked out of the smoke, which left you exposed to a pre-aim; you died because the defender held that angle. Use flash or ask a teammate for a flash before leaving smoke so you aren’t blind to pre-aims.",
    "enemyPatterns": "The defender was holding Mid Doors from Plaza and Connector and waited for the smoke to clear rather than swing early.",
    "nextRoundPlan": "Cast flash or get a teammate flash, then peek Mid Doors after the blind pops."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator death",
    "deathAnalysis": "You walked into A Main into Tree and Stairs with the Operator without a smoke or flash and got shot; you then died still holding the Operator instead of giving it away. One peek, one shot, then teleport out — and if you can't trade the peek, drop the Operator to a teammate before you re-peek.",
    "enemyPatterns": "Defender held the Tree and Stairs crossfire on A Main and punished a dry Operator push.",
    "nextRoundPlan": "Smoke Tree, ask a teammate for a flash at Stairs, do one peek-one shot then use teleport to leave and drop the Operator to a teammate if you won't survive the fight."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel rotation",
    "deathAnalysis": "You rotated to B late and walked into their pre-aim at B Tunnel, so bot and Turret never bought you time. Next round place bot and molly covering B Tunnel before you rotate or hold a deeper off-angle inside B Site so you don't meet their aim mid-rotate.",
    "enemyPatterns": "They held B Tunnel pre-aim, waiting for your rotation and punished you as you entered the choke.",
    "nextRoundPlan": "Place bot+molly on B Tunnel before committing the rotate or sit deeper in B Site and let the utility slow them while your team moves in."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Wide peek — Mid Courtyard",
    "deathAnalysis": "You wide‑peeked Mid Courtyard on an eco round and walked into a close‑range fight, so you died before your slow could help; Sage's slow needs to be cast reacting to a push, not after you’re exposed. Instead of that wide swing, hold the corner and use your slow to break their momentum or place your wall to deny the long sightline.",
    "enemyPatterns": "Eco rounds on Ascent tend to shove close angles from Mid Courtyard, so the attacker was holding a tight, near‑range line that punishes wide swings.",
    "nextRoundPlan": "Hold a tighter angle at Mid Courtyard, cast slow as they commit and only then step out or ask a teammate for a flash to force the fight."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Died at Mid Mail",
    "deathAnalysis": "You pushed Mid Mail alone and had no trade when you died, so the defender held the angle and rewarded the solo peek. Use recon first to force a reaction, send bot into the revealed trace, then have a teammate ready to trade or throw a flash into Mail before you swing.",
    "enemyPatterns": "Defender was holding Mid Top and Mail sightline in a passive angle that punishes solo Mail peeks on Split.",
    "nextRoundPlan": "Do not enter Mid Mail solo; cast recon to reveal, send bot to chase the mark and only swing when a teammate is on trade or a flash lands."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage utility dump",
    "deathAnalysis": "You spent utility in Garage without first getting info, so you walked into a pre-aimed sightline and died; stop committing utility before confirming an entry. Use recon or a teammate flash to clear Window and inside before you throw flash in Garage.",
    "enemyPatterns": "A defender was holding Garage and Window sightline and punished your utility-first entry by pre-aiming the common angles.",
    "nextRoundPlan": "Send recon into Garage then ask a teammate for a flash and only after the flash pops swing with flash as cover."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "Left A Short Early",
    "deathAnalysis": "You abandoned the A Short anchor too early and died walking into the angle you were supposed to cover. As Brimstone, keep smoke up and fire-rate buff ready so you can contest without giving the teleporter and Short line away.",
    "enemyPatterns": "The enemy held A Short line and likely pre-angled the exact spot you rotated from, punishing predictable early leaves.",
    "nextRoundPlan": "Stay anchored on A Short, place a smoke to deny their sight and ask a teammate for a flash before you reposition."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "Late smoke at B Link",
    "deathAnalysis": "You placed stars but popped the smoke too late at B Link, so the defender already had his crosshair locked and punished you; instead place stars during buy and activate the smoke before you step into the choke. Use stun right after the smoke to blind anyone holding the angle because your smoke alone came too late.",
    "enemyPatterns": "The kill came from a defender holding the B Main and B Link sightline with pre-aim, waiting for your smoke window to close.",
    "nextRoundPlan": "Place the star for B Link during buy, ask a teammate for a flash and activate smoke then stun before you commit into the choke."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "Caught at B Market",
    "deathAnalysis": "You lurked behind at B Market and got killed from the flank because you were isolated and your bot and globule cycle wasn't active. Send the bot only when site is mostly clear and pick up the globule after use so you can reuse it next engagement.",
    "enemyPatterns": "The enemy held the Market flank line and punished lone rear lurks from Market side with crossfire and timing.",
    "nextRoundPlan": "Do not lurk alone in B Market; stay with a teammate or ask for a flash, send the bot only after one enemy is removed, and immediately collect your globule."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler TP death",
    "deathAnalysis": "You Teleported into Mid Boiler and pushed without a flash or clone backup, so you arrived visible and got shot because you had no entry support. Bury Teleports behind cover and only commit when flash pops or clone draws their attention because entering alone hands defenders a free kill.",
    "enemyPatterns": "A defender was holding the Boiler exit angle pre-aiming Teleport arrivals and punished you as you appeared.",
    "nextRoundPlan": "Bury your Teleport behind the crate and call flash to pop as you exit, or wait for clone to pull their look before you step into Boiler."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound stun",
    "deathAnalysis": "You died at C Mound because your stun stun went off without teammates ready to follow, leaving you isolated in the high ground. Next time call the stun out loud — \"stun C Mound\" — and only trigger it after a teammate confirms they will swing.",
    "enemyPatterns": "The defender held the long C Main sightline and punished your isolated position from range with a Vandal and Operator angle.",
    "nextRoundPlan": "Announce \"stun C Mound\" and get a verbal ready from a teammate before you detonate the stun so they enter the moment it lands."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main suppress knife",
    "deathAnalysis": "You threw suppress knife into B Main but it locked zero players, so defenders kept their angle and you died at B Main; tell the team the knife result next time (e.g. \"suppress knife two\" or \"suppress knife zero\").",
    "enemyPatterns": "Defender held the B Main entry angle tight and punished your unpressured swing from that common corner.",
    "nextRoundPlan": "Aim suppress knife at the exact corner the defender holds, call the result out, then use flash and swing with a teammate ready to trade."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "A Hall wall mistime",
    "deathAnalysis": "You opened the wall in A Hall before your teammates moved and it blocked your own crossfire, so you got isolated and traded, because.",
    "enemyPatterns": "The defender held A Hall sight behind where the wall lands and punished anyone caught alone on that angle.",
    "nextRoundPlan": "Keep the wall closed until teammates commit, open it to let them pass and then close it immediately for post-plant control because."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
