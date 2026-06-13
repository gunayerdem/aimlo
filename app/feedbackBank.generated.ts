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
    "title": "A Main Entry Hatası",
    "deathAnalysis": "A Main'de tek başına utility'siz entry attın, trade yoktu ve girişte öldün. Uzun koridor açık olduğu için Heaven, Generator açıları seni kafadan kesti.",
    "enemyPatterns": "Rakip A Main, Heaven açısını tutup aynı hattı bekliyor ve seni aynen kesiyor.",
    "nextRoundPlan": "Bir sonraki round A Main'e önce flash veya smoke atıp, yanından bir teammate trade pozisyonunda beklerken gir."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek hatası",
    "deathAnalysis": "Kill aldıktan sonra Hookah'da fazla agresif overpeek yaptın; öne çıkıp corner'ı kapatmadan ikinci açıdan gelen oyuncu seni aldı. Bu yüzden öldün.",
    "enemyPatterns": "Karşı takım Hookah'da kill sonrası öne çıkan oyuncuyu ikinci açıdan bekliyor ve trade pozisyonu tutuyor.",
    "nextRoundPlan": "Kill sonrası Hookah'da öne çıkma; hemen corner'a dön, Elbow ve B Long yönünü kontrol et ve sadece trade pozisyonunda swing at."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven tek giriş",
    "deathAnalysis": "B Heaven'da geç retake sırasında tek tek entry yaptın; Heaven'daki oyuncunun sightline'ına açık kaldın.",
    "enemyPatterns": "Heaven oyuncusu pasif bekleyip kafa seviyesinden one-tap için açı tuttu.",
    "nextRoundPlan": "Bir kişi B Heaven'ı trade pozisyonunda tutarken sen B Back'e çekil ve trade pozisyonu kur."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main hızlı girişi",
    "deathAnalysis": "Lotus A Main'da utility'siz sprint ile girdin; Tree ve Stairs açıları seni aynı anda kafadan kesti. Duvar, utility olmadan entry atınca takımın trade pozisyonu yoktu ve tek öldün.",
    "enemyPatterns": "A Main defender'ı Tree ve Stairs'i sabit tutuyor, aynı koridordan bekleyip kafadan vuruyor.",
    "nextRoundPlan": "Bir teammate'ten alçak flash iste, flash patlar patlamaz duvar açıp sprint ile gir."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long aynı açıdan öldün",
    "deathAnalysis": "C Long'da aynı geniş açıdan tekrar oynadın; utility'siz olarak aynı açı kaldığın için ilk mermiyi kafadan yedin. C Long'daki konum değişikliği yapmayınca rakip hep aynı sightline'a nişan alıp seni bekledi.",
    "enemyPatterns": "C Long'daki savunucu aynı geniş açıdan bekliyor ve kafa yüksekliğinde nişan tutuyor, yani varsayılan açıdan one-tap alıyor.",
    "nextRoundPlan": "C Long'a smoke at, flash patladığı anda Garage üzerinden split ile gir."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main flash'sız ölümü",
    "deathAnalysis": "A Main'de flash atmadan entry yaptın ve ilk kontakta kafadan vuruldun; Phoenix olarak Curveball kullanıp hemen swing atmalıydın. Bu yüzden ilk oyuncu seni utility'siz yakaladı ve trade şansı da yoktu.",
    "enemyPatterns": "Savunucu A Main koridorunu kapatıp bekliyor, çoğunlukla flash gelmeden aynı açıdan bekleyip seni kafadan kesiyor.",
    "nextRoundPlan": "Curveball at, flash patlar patlamaz geniş çıkıp A Main'e gir; eğer flash tutmazsan tekrar çekil ve Market split bekle."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt Op Açısı",
    "deathAnalysis": "A Belt'te peek atarken Operator ilk mermiyi kaçırdı ama aynı A Belt açısında kaldığı için ikinci atışta seni kafadan vurdu. A Belt'te açıyı değiştirmeyince op'un crosshair'i sabit kaldı ve swing'ine izin verdi.",
    "enemyPatterns": "A Belt'teki op aynı açıyla sabit duruyor; ilk mermi kaçsa bile pozisyonunu koruyup tekrar kafadan bitiriyor.",
    "nextRoundPlan": "A Belt'te ilk kontak sonrası hemen reposition yap, aynı açıya geri dönme."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors smoke hatası",
    "deathAnalysis": "Kendi smoke'unun içinden Mid Doors'a çıkıp peek attın ve öldün. Smoke içinden direkt çıkış savunucunun önceden tuttuğu açıda seni kafadan verdiği için işe yaramadı.",
    "enemyPatterns": "Mid Doors'ta savunucu sabit durup açıyı tutuyor ve smoke içinden çıkanları kafadan bekliyor.",
    "nextRoundPlan": "Smoke içinden çıkmadan önce flash'ı yukarı at, sonra jiggle peek ile bilgi al; direkt peek atma."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main Operator Ölümü",
    "deathAnalysis": "A Main'da Operator ile kafadan vuruldun ve ölünce Operator silahı düşmedi; Chamber Headhunter'ı yere bırakmadığın için takımın trade şansı azaldı. Bir atış alıp hemen köşeye çekil veya teleportla anchor'a dön, takım için trade pozisyonu bırak ve Headhunter'ı orada tutma.",
    "enemyPatterns": "A Main'deki rakip op'la uzun açı tutuyor ve seni A Main'den kafadan nişanlayacak açıda beklemiş.",
    "nextRoundPlan": "A Main'e utility'siz giriş yapma; A Main'i smoke'la kapat veya flash'ı yukarı patlayınca swing at, yoksa teleportla anchor'a dön ve teammate ile 2'li trade pozisyonu kur."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "B Tunnel geç rotasyon",
    "deathAnalysis": "B Tunnel'da rotasyonu geç başlattın; Lockdown ve nanoswarm aktif değilken tek kaldın ve trade gelmedi, bu yüzden öldün.",
    "enemyPatterns": "Rakipler rotasyonla B Tunnel'e hızlı basıp seni tek başına yakalayıp kafadan kesmiş.",
    "nextRoundPlan": "B Tunnel rotasyonunu erken başlat, bir teammate ile birlikte gel ve trade pozisyonunda bekle."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard geniş açı",
    "deathAnalysis": "Mid Courtyard'da eco round'da utility'siz geniş açıyla swing atıp öldün. Smoke ya da slow orb ile dar açıya çekilip A Short, Top Mid'e rotate beklemeliydin.",
    "enemyPatterns": "Eco oyuncular Mid Courtyard'dan geniş açıyla agresif swing atıp yakın vuruş arıyor ve seni açıkta yakalıyor.",
    "nextRoundPlan": "Smoke at, slow orb koy, dar açıya çekilip A Short veya Top Mid'den swing yap; utility'siz geniş açıdan çıkma."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail trade eksik",
    "deathAnalysis": "Mid Mail'e trade pozisyonu olmadan girdin ve ilk kontakta düştün. Utility'siz ve tek başına Mail'e girmek seni tek açıdan swing yiyen hale getiriyor.",
    "enemyPatterns": "Mid Mail'de trade yokluğu, savunmacıların Mail, B Heaven hattını kontrol edip swing ile seni kafadan kapatmalarına zemin hazırlıyor.",
    "nextRoundPlan": "Mid Mail'e girerken teammate ile trade pozisyonunda bekle, flash patladığı anda birlikte swing at."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage'da utility hatası",
    "deathAnalysis": "Garage'da bilgi almadan utility harcadın ve o anda Garage içinden veya Window'dan tutan savunucu seni vurdu; utility'yi önceden atmak yerine bilgi ile senkronize etmeliydin.",
    "enemyPatterns": "Garage'ı veya Window'ı sabit tutan savunucu, senin utility'ni gördüğünde veya utility patlamadan önce açısını kilitleyip kafadan vuruyor.",
    "nextRoundPlan": "Köpeği veya Sova recon ile Garage'tan bilgi al, kuşu flash zamanlamasında patlat ve bilgi onaylandıktan sonra entry yap."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short erken çıkış",
    "deathAnalysis": "A Short'ta anchor'ı erken bıraktın; Brimstone olarak smoke, Incendiary saklamadan çekilince Heaven, Lamps açılarından gelen trade seni kafadan kesti.",
    "enemyPatterns": "Karşı takım Heaven ve Lamps'i crossfire için kullanıyor; A Short peek, rotate yapan oyuncu çoğunlukla trade pozisyonunda bekliyor.",
    "nextRoundPlan": "A Short'ta bekle, bir smoke veya flash sakla ve teammate'in trade pozisyonunda olduğuna emin olmadan çekilme."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "Smoke gecikti B Link",
    "deathAnalysis": "B Link'e smoke geç atıp giriş yaptın; smoke patlamadan önce savunucu açıyı tutuyordu ve seni kafadan kesti. Birinci yapman gereken smoke'ı önce atıp patladığını gördükten sonra takım olarak push'lamak olmalıydı.",
    "enemyPatterns": "Rakip B Link'i önceden açı tutuyor; smoke gecikince aynı açıdan bekleyip kafadan vuruyor.",
    "nextRoundPlan": "Bu tur smoke'ı B Link'e önce at, smoke patlayınca takımınla beraber gir ve trade pozisyonu kur."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market Lurk",
    "deathAnalysis": "B Market'ta lurk ederken arkadan yakalandın; backline kontrolü almadan döndün ve trade pozisyonun yoktu. Bu yüzden tek başına kaldın ve ölüp bilgi kaybettin.",
    "enemyPatterns": "Rakip arkadan flank yapıp B Market arka hattını tuttu ve seni o açıdan kafadan vurdu.",
    "nextRoundPlan": "Bir sonraki tur B Market lurk'ü yapmadan önce bir teammate'ten Market side veya B Back'i cover etmesini iste; alternatif olarak lurk'ü yapmayıp Market'e sessizce yaklaşan rotayı smoke ile kes ve takımın rotasına göre gir."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Mid Boiler TP hatası",
    "deathAnalysis": "TP sonrası Mid Boiler'da takipsiz agresyon yapıp öldün; TP'ye girerken klon veya flash seninle senkron değildi. TP'ye plansız girince karşı taraf seni bekleyip kafadan kesti.",
    "enemyPatterns": "Rakipler Mid Boiler'daki TP sesine tepki verip seni takip ederek agresyonla karşılıyor.",
    "nextRoundPlan": "Mid Boiler'da TP atınca klon gönder ve flash ile senkron swing at; eğer ikisini hazırlayamıyorsan TP'yi görünmez bir noktaya gömüp farklı açıdan gir."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "C Mound'da stun sen patladığında takım girmediği için açıkta kaldın ve C Main'den gelen oyuncu seni kafadan vurdu. Stun timing'i takımla uyumsuzdu, bu yüzden girişin trade'e dönüşmedi.",
    "enemyPatterns": "C Main'den geniş açı tutan oyuncu stun penceresine göre bekleyip Mound'daki seni kesi̇tirdi.",
    "nextRoundPlan": "Stun atmadan önce takıma 'stun geliyor C Mound' de, takımı flash, entry ile eşitle ve stun patladığı anda beraber swing at."
  },
  {
    "agent": "KAY, O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main bıçak boşluğu",
    "deathAnalysis": "B Main'de bıçağı attın ama baskı kurmadın; rakip sabit açıda bekleyip seni kafadan kesti. Bıçak sonrası sessiz kalmak entry'yi kaybettiriyor, hemen follow-up yapmalıydın.",
    "enemyPatterns": "Rakipler B Main'de bıçak sonrası geri kapanıp sabit açı tutuyor; bıçak sessizliği onları kafadan vuracak konuma getiriyor.",
    "nextRoundPlan": "Bıçak vurur vurmaz alçak veya üst flash ile pop-flash yapıp B Main'den anında gir, yoksa yanında trade pozisyonunda bekle."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "A Hall wall hatası",
    "deathAnalysis": "A Hall'da wall'ı yanlış zaman açtın, wall açıkken A Hall'dan gelen açı seni kafadan kesti. A Hall'da wall açık kalması takımın görselini bozdu ve seni arkadan açık bıraktı.",
    "enemyPatterns": "A Hall'daki savunucu genelde wall açıkken sabit A Hall hizasında crosshair tutuyor ve wall penceresinden aynı açıyla bekliyor.",
    "nextRoundPlan": "A Hall'da wall'ı entry için aç, takım geçince hemen kapat ve post-plant için orb, yakıtı sakla."
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
    "deathAnalysis": "You ran a dry solo entry through A Main and died with no trade, which handed the round momentum to the defender. Stop committing A Main alone; have a teammate ready on the immediate trade angle or wait for a flash pop before stepping in.",
    "enemyPatterns": "A defender was pre-aiming A Main from Heaven, Generator and punished the unsupported entry.",
    "nextRoundPlan": "Execute A Main together: flash A Main, entry from the same peek, and the trade player holds the close angle."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah Overpeek Reyna",
    "deathAnalysis": "You got the kill then overpeeked out of Hookah into a second angle and died instead of resetting behind cover at Hookah. After that kill you should have Devoured or retreated to Hookah window to avoid the immediate trade.",
    "enemyPatterns": "A defender was holding a deep Hookah off-angle that punished your aggressive second peek at Hookah.",
    "nextRoundPlan": "After the next kill at Hookah, Devour or fall back behind the Hookah window before any further peeks."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven Entry",
    "deathAnalysis": "You pushed into B Heaven alone during the late retake and died because you had no trade from B Main or Pillar. Stop making single entries into B Heaven and force a coordinated two-man entry during late retakes.",
    "enemyPatterns": "Defenders held disciplined crossfires from B Main and Pillar that punish isolated B Heaven entries in late retakes.",
    "nextRoundPlan": "Delay the B Heaven entry, call for one teammate to stack B Pillar and execute a simultaneous two-player push into B Heaven on the next late retake."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main fast entry",
    "deathAnalysis": "You sprinted into A Main without utility and died to crossfire from Tree, Stairs; your slide and speed gave defenders a predictable angle to pre-aim. Because you lacked a smoke or flash, you entered where both high and low sightlines could trade you instantly.",
    "enemyPatterns": "Defenders held A Tree and A Stairs with pre-aim on fast entries, waiting for an un-flashed sprint through the choke in A Main.",
    "nextRoundPlan": "Smoke A Tree, flash Stairs and then sprint through A Main with a teammate ready to trade."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long wide peek",
    "deathAnalysis": "You took the exact same wide C Long peek and died because the defender was pre-aiming that lane. Repeating the wide C Long angle let them hold a clean sightline on your entry.",
    "enemyPatterns": "Enemy is holding C Long wide from Plat, CT sightline, pre-aiming the long swing and punishing repeated wide entries.",
    "nextRoundPlan": "Stop taking the wide C Long peek: hold a tighter off-angle from Plat box or play deeper in C Connector and have a flash pop over Plat before you swing."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Flash Fail",
    "deathAnalysis": "You walked into A Main without a Curveball and got shot by a defender holding the A Main corner; flash first so you deny that pre-aimed angle. After the flash pops, wide swing the corner to punish the player who pre-aims head level.",
    "enemyPatterns": "The defender is anchoring the tight A Main corner and pre-aims common head-line positions to beat dry entries.",
    "nextRoundPlan": "Curveball A Main corner then commit with a wide swing."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt Op Death",
    "deathAnalysis": "You missed the first Operator shot at A Belt and stayed holding the exact same angle, so the peeker punished the second look. Don't linger on the same line after a miss; reposition off-angle or fall back to the tel so you aren't an easy double-tap target.",
    "enemyPatterns": "The attacker was holding A Belt to punish repeat peeks and took the second peek cleanly from the same sightline.",
    "nextRoundPlan": "After an early miss at A Belt, immediately step to a new off-angle or pull back behind your tel and call the angle instead of retaking the same line."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors overpeek",
    "deathAnalysis": "You stepped out of your own smoke at Mid Doors and peeked; the Mid Doors silhouette gave the defender a clean target. Exiting the smoke alone at Mid Doors exposed you before your team could trade or disrupt the Mid Plaza sightline.",
    "enemyPatterns": "The defender was holding the Mid Plaza sightline and pre-aiming Mid Doors, so they won the first-contact duel when you left the smoke.",
    "nextRoundPlan": "Smoke Mid Doors, jiggle from Plaza to bait the peek, then have a teammate trade from Shops on the Mid Doors angle."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main — Lost Operator",
    "deathAnalysis": "You held A Main with the Operator and died at close range without dropping it, so the team lost that weapon and you lost buy value. When A Main compresses into a short duel, stay ready to teleport out after your engagement to preserve the rifle or hand it off before the fight.",
    "enemyPatterns": "The attacker closed the A Main angle into a close-distance duel that neutralized long-range advantage and punished your stationary hold.",
    "nextRoundPlan": "Before the next A Main engagement, give the Operator to a teammate if you expect a close execute and take Headhunter or a fast gun to contest, or take one disciplined shot then teleport back to your anchor to keep the rifle."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel rotation",
    "deathAnalysis": "You rotated late into B Tunnel and walked into a pre-aimed angle while alone; stop committing the rotation solo and stage before you push B Tunnel. Change your rotation timing and hold a safe shoulder or utility angle on B Tunnel so you don't enter blind.",
    "enemyPatterns": "Opponents are holding a deep B Tunnel pre-aim and punishing late single-person rotations with crossfires from site or back Tunnels.",
    "nextRoundPlan": "Delay your rotation into B Tunnel until a teammate is adjacent or you have a flash, smoke to contest the pre-aim."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Wide",
    "deathAnalysis": "You swung a wide Mid Courtyard angle on an eco and died because you exposed your body without a close-range gun or a trade behind you. That wide peek gave the defender a single, clean line to punish.",
    "enemyPatterns": "An opponent was holding the Mid Top, Pizza sightline and punished your wide swing by keeping the long angle covered.",
    "nextRoundPlan": "Play the Cubby at Mid Courtyard, pre-aim the Mid Top line and only swing on a teammate flash or immediate trade behind you."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail Entry",
    "deathAnalysis": "You entered Mid Mail alone without a trade and got isolated, so the defender punished your solo swing; hold for a trade from A Short or B Main and wait for a flash before committing. As Fade, use Haunt into Mail then immediately send Prowler into that trace to force near-sight and create a clean trade window.",
    "enemyPatterns": "A defender was holding the Mid Mail sightline (likely from Mid Top, Mail connector) and punished the unsupported entry.",
    "nextRoundPlan": "Do not solo Mid Mail—call a trade, have a flash ready, then Haunt→Prowler and swing together."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage Utility Waste",
    "deathAnalysis": "You detonated Skye's flash and sent the dog in Garage without any recon, so you walked into a pre-aimed Garage angle and died. Save one Skye ability for the entry and require a teammate trigger (footstep, call, or recon) before you commit.",
    "enemyPatterns": "The defender was holding the Garage window, inside line, pre-aiming the choke and punishing every utility-heavy push into Garage.",
    "nextRoundPlan": "Keep one Skye ability in reserve; send the dog from a different angle or behind cover, call 'flash now' and only start the swing on the teammate sound."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "A Short Anchor Fail",
    "deathAnalysis": "You left A Short anchor on Bind as Brimstone too early and gave up the high-angle that covers Lamps and Teleporter. Hold the anchor until a teammate calls the site clear or you confirm a flank with audible teleporter, footsteps, then reposition with your smoke reserved.",
    "enemyPatterns": "The attackers were holding A Short pre-aim and punished the vacated angle, suggesting they expected an early rotation off that anchor.",
    "nextRoundPlan": "Stay at A Short as anchor with one smoke held; only vacate after a teammate call or audible teleporter, footstep confirm, then reposition to Lamps with your reserved smoke ready."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "B Link smoke",
    "deathAnalysis": "You tried to fight through B Link after your smoke timing slipped and died to a pre-aimed sightline; place Nebula earlier and commit through it when it blooms. Alternatively, if your smoke is late, don't force the swing—hold and let a teammate pinch from B Main to trade.",
    "enemyPatterns": "Defender was sitting on the B Link-to-B Main sightline, pre-aiming the window your delayed smoke was supposed to block.",
    "nextRoundPlan": "Smoke B Link in buy, call 'smoke down', then only swing once it blooms or have a teammate pinch from B Main for a trade."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market Lurk",
    "deathAnalysis": "You pushed to pick up your globule at B Market while alone and got shot from behind; your recovery path was exposed. Next time either clear B Alley first or leave the globule and fight from cover behind the Market pillar.",
    "enemyPatterns": "Defender rotated into B Alley, Market-side flank and held the exact spot you run to collect the globule, waiting for an isolated recovery play.",
    "nextRoundPlan": "Have a teammate watch B Alley while you collect the globule behind the Market pillar, or postpone the pickup until the site is secured."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler TP Death",
    "deathAnalysis": "You TP'd into Mid Boiler and swung alone without a pre-pop flash or coordinated bait, so the defender punished your untracked entry through the doorway. Stop TP-ing as a solo aggression and make the entry a read-and-execute instead.",
    "enemyPatterns": "The defender was holding an inner Boiler off-angle on the doorway and punished raw TP swings.",
    "nextRoundPlan": "Send the clone to Mid Main, have a teammate hold the trade, pop Blindside as you TP into cover and swing immediately."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound stun sync",
    "deathAnalysis": "You swung C Mound while your stun flashed early and teammates were not committed, so you arrived isolated and died at C Mound. Announce the stun, wait for a verbal or visible commitment, then entry — Breach utility without team follow-up leaves you exposed.",
    "enemyPatterns": "Defender sat the C Main→Mound sightline and punished a lone high-ground peek rather than trading into a coordinated stun.",
    "nextRoundPlan": "Call 'Fault Line then swing' and require a verbal ready from one entry and one trade; if no confirm, back off, bait the angle with a flash and re-engage from cover."
  },
  {
    "agent": "KAY, O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main Knife Follow-up",
    "deathAnalysis": "You threw the knife at B Main and then walked alone into a held angle without a flash or a trade, so the defender cleaned you up. You gave away position and had no support to convert the suppress into a site pressure.",
    "enemyPatterns": "The defender held the tight B Main, Market corner passive and trusted the angle, punishing solo entries.",
    "nextRoundPlan": "Pop an upper flash into B Main, have one teammate sit immediately right for the trade, then commit on the flash pop."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "A Hall Toxic Screen",
    "deathAnalysis": "You opened Toxic Screen in A Hall too early and burned fuel before the contact, so you had nothing left for post-plant or to stall; that timing left you exposed and you died. Close the screen when your entry is committed so you don't run out of charges mid-round.",
    "enemyPatterns": "Attackers were holding the A Hall sightline and punished the predictable screen timing by pre-aiming the gap created when your wall was up.",
    "nextRoundPlan": "Hold the Toxic Screen closed until your entry starts, open it as teammates commit through A Hall, then shut it after they clear the immediate angle."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
