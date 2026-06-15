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
    "title": "A Main utility'siz entry",
    "deathAnalysis": "A Main'de tek başına utility'siz entry yaptın, trade yok olduğu için karşı açı seni kafadan vurdu. Jett olarak dash'i entry için saklamalıydın; peek-kill-dash sırasını uygulayıp kill alır almaz dash'le çekilmeliydin.",
    "enemyPatterns": "A Main'deki savunucu açıyı önceden nişanlamış ve aynı hatta bekleyerek seni karşı açıdan kafadan vuruyor.",
    "nextRoundPlan": "A Main'e gitmeden teammate'ten flash iste, flash patladığı an dash'le gir ve ilk kill'i alır almaz dash'le çekil."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah — overpeek",
    "deathAnalysis": "Hookah'ta ilk kill'i alınca fazla agresif overpeek yaptın ve açıkta kaldın; second CT seni karşı açıdan kafadan vurdu. İlk öldürmeden sonra hemen kapağa çekilip heal almalısın.",
    "enemyPatterns": "Hookah'ta kill sonrası CT'ler genelde ikinci oyuncuyla hızlı trade pozisyonu kuruyor ve aynı açıdan seni bekliyor.",
    "nextRoundPlan": "Hookah'ta kill alınca hemen sipere çekil, heal kullan ve sonra farklı açıdan yeniden gir."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven retake",
    "deathAnalysis": "B Heaven'da geç retake'te tek tek giriş yaptın; smoke veya flash olmadan Heaven'dan kafadan vuruldun. Retake'te Heaven'ı önce flush etmeliydin.",
    "enemyPatterns": "Bu ölüm düşmanın B Heaven'i aktif tuttuğunu ve Heaven'dan seni kafadan beklediğini gösteriyor.",
    "nextRoundPlan": "Molly veya bot ile Heaven'ı flush et ve sıçrama ile takımınla beraber gir."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main hızlı giriş",
    "deathAnalysis": "A Main'de utility'siz hızlı giriş yaptın, Tree ve Stairs açıları aynı anda seni gördü ve ilk atışı onlar yaptı. Neon duvarını açmadan sprint atıp slide ile açıkta kaldın, bu yüzden kafa vuruşunu yediniz.",
    "enemyPatterns": "Tree ve Stairs'ten iki ayrı açı seni aynı anda tutuyor ve defender'lar o açıları bekleyip ilk atış avantajı alıyor.",
    "nextRoundPlan": "Önce duvarını aç, takımından flash veya smoke iste ve flash ve smoke patladığında sprint atıp slide ile köşeyi temizle."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long tekrar ölümü",
    "deathAnalysis": "C Long'da aynı geniş açıyı tekrar tekrar tutuyorsun; savunucu seni aynı açıdan kafadan vuruyor. Sova olarak recon dart veya drone ile o açıyı bozmadan doğrudan yürüdün, bu yüzden öldün.",
    "enemyPatterns": "Rakip Plat ve CT yüksek noktasından C Long cross'u sabit tutuyor ve aynı açıdan seni kafadan vuruyor.",
    "nextRoundPlan": "Recon dart veya drone ile Plat'i açığa çıkar, takım arkadaşından smoke ve flash iste ve flash patladığında geniş açıyla peek at."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main'da utility'siz giriş",
    "deathAnalysis": "A Main'da flash atmadan utility'siz giriş yaptın; savunan köşeyi önceden nişanlayıp ilk atış'u aldı ve öldün. Flash patladığı anda swing at; utility'siz içeri girmek seni ilk atışı kaybettirir.",
    "enemyPatterns": "Bu ölüm düşmanın A Main açısını önceden tuttuğunu ve köşede ilk atış beklediğini gösteriyor.",
    "nextRoundPlan": "A Main'e flash at, patladığı anda swing at ve alternatif olarak Elbow'a ateş duvarı ya da molly atıp görüşü kırdıktan sonra gir."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt - aynı açı",
    "deathAnalysis": "A Belt'te Operator ilk mermiyi kaçırdıktan sonra aynı açıda kaldı ve seni kafadan vurdu. Sen aynı açıda bekledin; açı değiştirmeyince ikinci atışı verdi ve öldün.",
    "enemyPatterns": "Operator ilk atışı ıskalasa da A Belt açısını önceden tutuyor; o açıyı sabit bekleme eğilimi gösteriyor.",
    "nextRoundPlan": "Teli A Belt girişinin biraz gerisine gizli yere koy ve kamerayı yüksek off-angle'a al, o açıda aynen bekleme çünkü."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors smoke kenarı",
    "deathAnalysis": "Kendi smoke'undan çıkıp Mid Doors'ta peek attın ve smoke'un kenarında beklediğin için savunucu seni kafadan vurdu. Smoke'u takım için değil kendi kill'in için kullanıyorsun; dumanın içinde eşit şartta kaldın.",
    "enemyPatterns": "Savunucu Mid Doors'ta smoke kenarını tutuyor ve smoke'tan çıkanları bekleyip ilk atış avantajı alıyor.",
    "nextRoundPlan": "Smoke'u Mid Doors'un görüşünü kapatacak şekilde yüksek at, dumanın kenarından çekil ve takımından flash iste; flash patladığı anda peek at."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main op'la öldün",
    "deathAnalysis": "A Main'e smoke veya flash olmadan girdin; Tree ve Stairs açılarından gelen op ilk atış avantajı aldı ve seni kafadan kesti. Chamber olarak bir atış vurup teleport ile çekilmeliydin çünkü op'ı düşürmeden ölünce takım silah kazanamıyor.",
    "enemyPatterns": "Bu tekrar A Main'de dry entry yaptığını gösteriyor ve defender uzun açıdan op'la köşeyi önceden nişanlamış gibi ilk atış avantajı alıyor.",
    "nextRoundPlan": "Girmeden önce Tree'yi smoke'la ve flash iste, flash patlar patlamaz swing at, bir atış vurup teleport ile çekil."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel geç rotate",
    "deathAnalysis": "B Tunnel'da rotasyonu geç başlattın ve girişi kontrol etmeden dönerken düşman rotayı kesip kafadan vurdu. Rotate'ı bot veya util ile kapatmadan çıktın, o yüzden o açık seni yedi.",
    "enemyPatterns": "Düşman B Tunnel rotasını önceden bekliyor gibi; girişe açıyı önceden tutuyor ve rotate edenleri kesiyor.",
    "nextRoundPlan": "B Tunnel'dan rotate ederken bot'u flank hattına ve turret'i B Tunnel çıkışına koy ve molly'ı defuse ve retake için sakla."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard - geniş açı",
    "deathAnalysis": "Mid Courtyard'da utility'siz geniş açıyla swing atıp eco oyuncunun yakın mesafe atışına düştün. Uzak mesafeyi koruyup dar açı tutmalıydın çünkü eco yakın mesafede seni kafadan keser.",
    "enemyPatterns": "Eco round'larda Mid Courtyard'taki rakipler yakın mesafede agresif swing atıyor ve geniş açılarda one-tap arıyor.",
    "nextRoundPlan": "Mid Courtyard'ta utility bekle; duvar ile açıyı kapat ve eğer push gelirse yavaşlatma at, sonra geniş açı yerine dar açıdan bekle ve swing at."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail solo entry",
    "deathAnalysis": "Mid Mail'e trade pozisyonu olmadan girdin ve solo çıkışta düştün; solo çıkış takıma ne bilgi ne trade verir. Recon atıp botla zincir kurmalıydın, yoksa takım arkadaşından flash isteyip birlikte girmeliydin.",
    "enemyPatterns": "Savunmacı Mid Mail köşesini tutuyor ve ilk kontakta seni kafadan vuruyor.",
    "nextRoundPlan": "Recon at, bot gönderip stun'la zinciri kur ve takım arkadaşının swing yapacağını bekleyip beraber gir."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage utility hatası",
    "deathAnalysis": "Garage'da bilgi almadan utility harcadın ve içeride bekleyen oyuncu seni kafadan kesti. Köpeği recon'ı veya kuşu flash'ı kullanmadan önce Window ve inside'den kesin bilgi almalısın.",
    "enemyPatterns": "Rakip genelde Garage Window veya inside'dan açı tutuyor; utility'siz girenleri aynı açıdan kafadan vuruyor.",
    "nextRoundPlan": "Köpeği recon'ı farklı açıdan gönder ve Window'dan bilgi al, takımından bir flash iste sonra utility harca."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short anchor hatası",
    "deathAnalysis": "A Short'ta anchor pozisyonunu çok erken bıraktın; tek kişi kalınca A Bath ve Heaven hattına açık kaldın ve utility'siz kafadan vuruldun.",
    "enemyPatterns": "Rakip A Bath ve Heaven hattını aynı açıdan bekliyor, seni o açıdan tutup kafadan kesiyor.",
    "nextRoundPlan": "A Short'ı en az iki kişiyle tut; Heaven ve A Bath'e smoke sakla ve Lamps'ta off-angle tut, stim'i retake için hazırda bırak."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link smoke gecikmesi",
    "deathAnalysis": "B Link'te öldün çünkü yıldızı gerideki güvenli noktadan aktive etmeyip smoke'u geç patlattın, smoke açıkken bedenin hala görünürdü ve gelen push seni yakaladı.",
    "enemyPatterns": "Son round'da B Link geleneği smoke'tan önce içeri girdi; smoke patladıktan sonra onlar zaten pozisyon ayarlamıştı ve seni B Link açısında buldular.",
    "nextRoundPlan": "Yıldızı B Link choke'un gerisine koy, smoke'u B Link gelmeden önce patlat ve bir teammate'ten flash iste çünkü geriden aktif edilen smoke seni entry oynarken korur."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market Lurk'i",
    "deathAnalysis": "B Market'te lurk yaparken arkadan yakalandın; botu önden köşeye göndermeyip globülü geri alacak pozisyonu kurmadın. Bu yüzden arkadan gelen oyuncu sessizce gelip seni kesti, ilk atışı rakip aldı.",
    "enemyPatterns": "Rakip Market'ten flank ve rotate yapıyor ve arkadan sessiz girişlerle tek kişileri avlıyor.",
    "nextRoundPlan": "Botu önden Market köşesine gönder, globülü topla ve arkayı kapatması için takım arkadaşından birini iste; sonra güvenli açıdan entry yap."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Mid Boiler TP girişi",
    "deathAnalysis": "Işınlandıktan sonra Mid Boiler'da sık öldün; TP noktaların tahmin edilebilir ve girmeden önce ne yapacağını planlamamışsın. TP'ye girerken flash elinde tutmalıydın çünkü düşman seni önceden nişanlamış.",
    "enemyPatterns": "Mid Boiler'da TP'ye tepki verip seni geri nişanlayıp kafadan vuruyorlar.",
    "nextRoundPlan": "Mid Boiler'da TP'yi kutu arkasına göm ve takım arkadaşından flash iste, TP active olur olmaz flash patlayınca içeri gir."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "C Mound'da sersemletme attın ama takım girmedi, stun tek başına seni açıkta bıraktı. Stun zamanı takımın giriş penceresiyle uyuşmadığı için C Main'den angle tutan oyuncu seni kesti.",
    "enemyPatterns": "Rakip C Main'den C Mound'u sabit açıyla bekliyor ve stun sonrası oluşan boşluğu hemen kapatıyor.",
    "nextRoundPlan": "'sersemletme geliyor' diye bağır, takım hazır deyince sersemletme sonra flash at; flash patlayınca takım Mound'dan swing atsın."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main bıçak boş",
    "deathAnalysis": "B Main'de bıçağı attın ama basmadın; kilit penceresini boşa harcadın ve beklerken Market ve CT tarafından kafadan vuruldun.",
    "enemyPatterns": "B Main'de bıçak sonrası takip gelmediği için savunucu Market veya CT yönünden açıyı tutup seni kafadan kesti.",
    "nextRoundPlan": "Bıçak at, takım arkadaşından flash iste ve flash patladığı anda birlikte gir."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall duvar hatası",
    "deathAnalysis": "A Hall'da duvarı takım girişinden sonra açtın; duvar bölme işini yapmadığı için açık alanda dövüştün ve öldün.",
    "enemyPatterns": "Geç açılan duvar yüzünden savunucu açıyı görüp ilk atış avantajı aldı ve seni aynı açıdan kafadan vurdu.",
    "nextRoundPlan": "Duvarı A Hall entry'den hemen ÖNCE çek, orb'u post-plant için sakla."
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
    "deathAnalysis": "You did a dry solo entry into A Main and died without a trade; stop entrying alone and ask for a flash or smoke before you go because solo entry hands the first kill and map control to the defender. Use smoke to blind the sightline and only dash after you secure a kill or have trade coverage because dash is your escape, not your first-move tool.",
    "enemyPatterns": "The defender held A Main from a higher and behind angle (Heaven and Generator) and pre-aimed that lane, so they were ready for a lone push because long A Main sightlines favour pre-aimed defenders.",
    "nextRoundPlan": "Do not run in alone — call for a flash or smoke, throw smoke into A Main, then commit with a teammate ready to trade or dash out if you get the kill because trades and timed utility turn entry deaths into wins."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah overpeek",
    "deathAnalysis": "You got the kill in Hookah then overpeeked instead of taking cover; you died because you left yourself exposed without using heal or dash away. After a frag, immediately use heal behind cover or dash away to reset position so you are not the obvious next target.",
    "enemyPatterns": "The defender held the angled re-peek on Hookah and punished your exposed follow-up swing.",
    "nextRoundPlan": "After your first kill in Hookah, step back behind cover, cast heal if safe or dash away to a safe corner, then re-enter from a different angle."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven late retake",
    "deathAnalysis": "You died at B Heaven during a late, one-by-one retake; you went up alone and got punished from above, send your bot or throw cluster grenade into Heaven before you swing because Heaven gives the defender the vertical advantage.",
    "enemyPatterns": "The defender held the B Heaven angle and punished solo late entries from above.",
    "nextRoundPlan": "Do not entry alone—send your bot and lob cluster grenade into B Heaven then take the angle with a teammate because Heaven must be cleared before you commit."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main fast push",
    "deathAnalysis": "You died at A Main on Lotus because you sprinted in without wall or a teammate flash and walked into Tree and Stairs crossfire; use wall before you sprint and slide into cover. At A Main your slide should land behind cover so you aren’t exposed to both angles at once.",
    "enemyPatterns": "At A Main defenders held Tree and Stairs with pre-aim, waiting for a raw entry and punishing any duvarsiz sprint into the choke.",
    "nextRoundPlan": "Start the A Main entry by casting wall, ask a teammate for a flash or smoke, then sprint and slide to the chosen cover once the utility pops."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long repeat angle",
    "deathAnalysis": "You kept taking the same wide C Long angle and died to a pre-aimed defender because the line was predictable. Use recon or drone to clear that sightline and ask a teammate for a flash or smoke before you re-peek.",
    "enemyPatterns": "The defender is holding the long C sightline and pre-aiming the same wide angle you keep taking.",
    "nextRoundPlan": "Clear C Long first with drone or recon, get a teammate flash, then re-enter from a different angle."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main entry (no flash)",
    "deathAnalysis": "You pushed A Main without flash and died to a pre-angled defender at A Elbow. Next time throw your flash and swing as it pops so their crosshair isn't locked on you.",
    "enemyPatterns": "The defender held A Elbow with pre-aim on the choke, waiting for a dry entry rather than swinging out.",
    "nextRoundPlan": "Throw a flash into A Elbow and swing immediately or use fire wall to block sight then time a different entry."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt - change angle",
    "deathAnalysis": "You missed the first Operator shot at A Belt then stayed on the exact same angle, so the enemy who pre-aimed that line finished you. Reposition off the belt or fall back behind the crate and reset your crosshair before re-engaging.",
    "enemyPatterns": "The killer was holding a fixed pre-aim on A Belt and punished repeated peeks by keeping their crosshair on that spot.",
    "nextRoundPlan": "Do not hold the belt again; move to the crate or off-angle, set a tripwire on the likely entry and use camera to call the contact."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors peek",
    "deathAnalysis": "You stepped out of your smoke at Mid Doors and tried to fight from inside your own smoke, so the defender had the clean angle and shot you. Don’t stand in your smoke; smoke should deny their sight while you take the better outside angle.",
    "enemyPatterns": "The defender was holding the Mid Doors pre-aim and punished anyone who peeks from inside the smoke.",
    "nextRoundPlan": "Place smoke to block their sight, then step off the smoke and use teleport to appear on a different angle at Mid Doors because staying inside your own smoke hands them the kill."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator Loss",
    "deathAnalysis": "You swung A Main with the Operator into Tree and Stairs without a smoke or flash and died, and you left the Operator on your corpse so the team lost the weapon at A Main.",
    "enemyPatterns": "Defender held the long Tree and Stairs sightline into A Main and punished wide A Main swings with a long-peek setup.",
    "nextRoundPlan": "Before any A Main swing, either give the Operator to a teammate or ask a teammate for a smoke and a flash to clear Tree and Stairs, then take the peek."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "Late rotate — B Tunnel",
    "deathAnalysis": "You rotated late into B Tunnel while your bot and Turret were out of effective coverage, so you walked into enemy tunnel control and died; reposition your bot deep in B Tunnel and place a molly on the choke so the entry is contested because it gives early warning and forces them to clear utility before they swing.",
    "enemyPatterns": "Enemies held B Tunnel control and punished late rotations by swinging tunnel angles that your setup no longer covered because they kept the tunnel line of sight.",
    "nextRoundPlan": "Place bot in the tunnel flank, tuck Turret deeper, hold your molly for when the bot triggers and ask a teammate for a smoke if you need to slow their swing because this converts late rotate into a defended choke."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Widepeek",
    "deathAnalysis": "You pushed wide into Mid Courtyard on an eco round and lost the close-range duel because eco rounds favor tight, close fights and your wide angle left you exposed to a short-angle spray.",
    "enemyPatterns": "The eco held a close courtyard angle and punished wide peeks, taking advantage of short-range guns.",
    "nextRoundPlan": "Hold a tighter angle or back off to a choke, use slow into the courtyard and ask a teammate for a flash before you re-peek because that forces the eco to fight on your terms."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail — no trade",
    "deathAnalysis": "You pushed Mid Mail alone with no trade and got cut down because you gave the defender a single duel to win; instead use recon to force a reaction and send the bot into that recon before you peek. Stop entrying Mail solo without a teammate ready to trade because solo exits hand the angle to the defender.",
    "enemyPatterns": "The defender was holding the Mail choke and pre-aimed the common swing line, so they only had to win one duel when you walked into it.",
    "nextRoundPlan": "Throw Fade's recon into Mail, send the bot to the recon to narrow vision, ask a teammate for a flash and then swing together so someone is ready to trade."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage utility misuse",
    "deathAnalysis": "You sent recon into Garage and popped flash without confirming contact, so you walked into an angle blind and died at Garage. Control recon to clear the corner and call the contact before you commit or hold for a teammate flash and smoke.",
    "enemyPatterns": "A defender was holding the Garage angle (Window and box lines) and punished an unconfirmed utility entry.",
    "nextRoundPlan": "Drive recon through the alternate approach, call when it hits, then entry together with a flash or smoke."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "Left A Short Anchor",
    "deathAnalysis": "You left A Short anchor too early and rotated off, so the player holding the teleporter exit or A Bath pre-aimed the swing and traded you. Stay on anchor with one smoke ready and use fire-rate buff on your entry to win the duel.",
    "enemyPatterns": "Enemy held A Short from the teleporter exit, holding the obvious off-angle that punishes anyone who abandons the corner early.",
    "nextRoundPlan": "Hold A Short until a teammate trades or you call for a flash, and keep one smoke reserved to block the teleporter exit."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "Late smoke at B Link",
    "deathAnalysis": "You delayed detonating smoke at B Link and walked into a pre-aimed B Main angle; you died because the smoke window closed too late and the enemy already had their crosshair on the choke.",
    "enemyPatterns": "Defender was holding a B Main and B Screen sightline and punished a late smoke with a pre-aimed angle.",
    "nextRoundPlan": "Place your Stars before the push and detonate smoke on the B Link choke from cover, or ask a teammate for a flash to force the angle, because early smoke denies the pre-aim and gives your team a safe entry."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market lurk",
    "deathAnalysis": "You lurked at B Market and got caught from behind because you never sent your bot forward to scout or left a globule-retrieval plan. Send the bot into Market first and collect its globule before committing so you don't enter blind.",
    "enemyPatterns": "Enemy held the Market flank and punished a solo lurk by keeping their back angles covered.",
    "nextRoundPlan": "Send your bot into Market to scout, pick up the globule, then re-enter with your flash and ask a teammate to hold your back."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler Teleport",
    "deathAnalysis": "You teleported into Mid Boiler and pushed without a follow-up, dying because your teleport placement and lack of an immediate flash made the entry predictable.",
    "enemyPatterns": "A defender was holding the Mid Boiler angle ready to trade any teleport entry.",
    "nextRoundPlan": "Either hide teleport behind the box in Mid Boiler and have flash ready to pop the moment you arrive, or send the clone decoy first and teleport only after defenders turn."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound stun",
    "deathAnalysis": "You cast stun from C Mound while the team wasn't synced, so the stun window closed and a defender holding C Main punished your swing. Announce 'stun coming' and chain flash then stun so the stun lines up with the team entry.",
    "enemyPatterns": "A defender on C Main sat passive on the mound sightline and waited out your solo stun to get the easy kill.",
    "nextRoundPlan": "Call 'stun coming', get a teammate confirmation, then throw flash and cast stun as the team pushes C Mound."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "Knife — B Main",
    "deathAnalysis": "You threw the knife at B Main then waited and the window closed, so the knife only gave info and not the ability lock; you died because you didn’t press the advantage. Commit the moment the knife lands by either pushing with a trade partner or popping your FLASH and swinging immediately.",
    "enemyPatterns": "The defender held a B Main sightline and punished the delayed push once your knife window ended.",
    "nextRoundPlan": "Knife B Main and either sprint in with a teammate for an instant trade or pop your FLASH and swing the locked angle right away."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "Wall timing — A Hall",
    "deathAnalysis": "You popped wall after your team started the A Hall entry, so it failed to split the site and you died in open sightlines. Open wall just before the entry so defenders are forced to reposition.",
    "enemyPatterns": "Defenders were already set up on A site holding cross and heaven angles through A Hall and punished the late wall.",
    "nextRoundPlan": "Cast wall before your team moves into A Hall and keep smoke saved for post-plant."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
