// ════════════════════════════════════════════════════════════════════
//  AUTO-GENERATED — gen-feedback-bank.mts ile gpt-5-mini + GERÇEK KB'den.
//  20 TR + 20 EN örnek koç-feedback'i. Yeniden üret: npx tsx gen-feedback-bank.mts
// ════════════════════════════════════════════════════════════════════
export type FeedbackExample = { agent: string; map: string; side: string; location: string; lang: "tr" | "en"; title: string; deathAnalysis: string; nextRoundPlan: string };
export const FEEDBACK_BANK_TR: FeedbackExample[] = [
  {
    "agent": "Jett",
    "map": "Ascent",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main solo entry hatası",
    "deathAnalysis": "A Main'de tek başına kuru entry yapıp trade yokken öldün; bu yüzden A Main'deki ilk mermi seni kesti ve takımın trade şansı sıfır kaldı. Aynı A Main şartında tekrar eden solo entry taktiksel hata; bir oyuncu A Main entry yaparken arka planda trade pozisyonunda biri olmaması round'u kaybettirir.",
    "nextRoundPlan": "A Main'e tek başına girme; önce takım flash patlatsın, flash patladığı an 0.3–0.6s içinde dash ile gir ve arkan sıra trade pozisyonunda bir teammate A Main girişini görsün; alternatif olarak A Main feint yap, ses verip A Short üzerinden split dene."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek tıkandı",
    "deathAnalysis": "Bu roundda Hookah'ta kill aldıktan sonra agresif overpeek yapıp açıkta kaldın ve öldün; Devour yerine tekrar peek veya yanlış Dismiss seçimi yaptın, bu yüzden trade veya ikinci açı seni bitirdi çünkü cover'a dönmeden re-peek atmak seni savunmasız bıraktı.",
    "nextRoundPlan": "Hookah'ta kill aldığında hemen en yakın cover'a dön, orada Devour yap; eğer aynı anda iki açıdan threat varsa Dismiss ile teleporter/koridor yönüne kaç ve sonra 0.5–1 saniye bekleyip information aldıktan sonra yeniden peek at."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven'da Tek Tek Ölüm",
    "deathAnalysis": "B Heaven'da geç retake yapıp tek tek girdiğin için ayrı ayrı peeldin; tek ölümler trade gelmedi ve sen öldün çünkü takım seninle aynı anda giriş yapmadı, pozisyonun yukarıdan görüldü çünkü.",
    "nextRoundPlan": "Bu round B Heaven'ı bırak; takımla birlikte B Main'den aynı anda smoke+flash atarak synchronized retake başlat—kimse tek tek giriş yapmasın."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main hızlı giriş",
    "deathAnalysis": "A Main'de utility'siz hızlı entry yaptın; Tree ve Stairs açıları seni aynı anda gördü, bu yüzden ilk atışı kaybettin çünkü karşı iki açıdan crossfire oldun.",
    "nextRoundPlan": "Fast Lane duvarını aç, A Main Tree'yi smoke'la ve Stairs yönüne flash at; flash patladığı anda sprint+slide ile gir, smoke yoksa teammate ile double entry yap ve biri trade pozisyonunda beklesin."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long Repeat!",
    "deathAnalysis": "C Long'da Sova olarak aynı geniş açıdan tekrar tekrar öldün — bu callout, pozisyonunun okunuyor olduğunu gösteriyor; Recon Bolt'u C Long tavanının farklı yüksekliğine indir ve Owl Drone ile önce Plat/CT rotasını doğrula çünkü aynı açı tekrarlandıkça savunucu seni ezberliyor. Alternatif olarak C Long yerine Garage üzerinden C Connector split ya da Plat arkasından farklı bir off-angle kullan, girişleri iki yönlü yap çünkü tek hat aynı sightline'ı veriyor.",
    "nextRoundPlan": "Recon Bolt'ı C Long farklı yükseklikten at; Owl Drone'u kısa tutup Plat ve CT'yi doğrula; entry'yi Garage+C Long split ile yap."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main flash'sız entry",
    "deathAnalysis": "Gözlem: A Main'da flash atmadan girdin ve ilk kurşunu aldın. A Main'de Curveball at, flash patladığı an geniş açıyla swing at; varyasyon olarak her round sol/sağ eğriyi değiştir ki aynı açıdan okunmayasın.",
    "nextRoundPlan": "A Main sağ köşeye Curveball at ve flash patladıktan hemen sonra geniş açıyla içeri gir; işe yaramazsa bir sonraki round sol eğriyle tekrarla ve entry sırasında bir kişi trade pozisyonunda beklesin."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt Operator Fail",
    "deathAnalysis": "A Belt'da Operator ile ilk mermiyi kaçırdın ve aynı açıda beklemeye devam ettin; bu yüzden karşıdaki ikinci atışı alıp seni trade etme şansı buldu — CALL OUT: 'A Belt op miss' diye takıma anında bildir.",
    "nextRoundPlan": "A Belt'ta Operator kaçırırsan hemen açı değiştir: ya deeper backstep yapıp angle'ı resetle, ya da hemen swap edip shorter peek için SMG/AR ile swing at."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors - Smoke'dan Peek",
    "deathAnalysis": "Mid Doors'da kendi smoke'unun içinden çıkıp peek attın; smoke içinden çıkınca silhouette ve sesle doğrudan hedef oldun çünkü smoke inside çıkış düşmana tek ve tahmin edilebilir bir açıyı verdi.",
    "nextRoundPlan": "Smoke'un kenarından jiggle ile bilgi ver; yoksa high one-way smoke veya teammate flash ile synchronize entry yap, tek başına smoke içinden çıkma."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main'da OP'ye takıldın",
    "deathAnalysis": "A Main'da Operator'la öldün ve silahı düşürmedin; bu Chamber döngüsünü (bir atış → teleport) uygulamadığın için OP trade veya ikinci atış şansı buldu. Birinci çözüm: bir atış al, hemen TP; alternatif çözüm: Headhunter ile tek kafadan risk alıp takımından A Main flash talep et.",
    "nextRoundPlan": "Round başında A Main'de agresif açıdan bir atış al, anında TP; eğer TP mümkün değilse Headhunter ile tek kafaya dene ve teammate'tan A Main'e flash iste."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "Dikkat: B Tunnel Fail",
    "deathAnalysis": "B Tunnel'da öldün çünkü rotasyonu geç başlattın ve Killjoy kurulumunu toparlamadan geldin; bu, turret ve alarmbot nüfusunu işlevsiz bıraktı. Callout: Turret'i off-angle'a al ve nanoswarm ile alarmbot'ı B default plant üstüne önceden koy ki rotasyon gecikse bile site geciksin.",
    "nextRoundPlan": "Turret'i B Tunnel dışına off-angle'a taşı; alarmbot + nanoswarm'ı default plant noktasına hazırla; rotasyona yalnızca takım 'rotate' dediğinde veya 10s altında başla."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard Eco Ölümü",
    "deathAnalysis": "Mid Courtyard'da, eco round'da geniş açıdan zorlayıp öldün; Mid Courtyard'da wide angle almak eco round'da tek HP/sidearm ile % yüksek risk demek (gözlem: eco round ve pozisyon). Ana fix — Mid Courtyard'da geniş açı yerine corner/entry'yi daralt (köşeye yanaş, kısa swing at); alternatif — eco round'da Mid Courtyard'ta full passive tutup info bekle (arkadaşın footstep veya smoke tetikleyene kadar çıkma).",
    "nextRoundPlan": "Mid Courtyard'da bu round eco olduğu için köşeye yanaş ve dar açıyla swing at; eğer takım bir footstep veya smoke bildirirse o zaman geniş açıyla swing at veya rotate yap."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mid Mail trade kaçtı",
    "deathAnalysis": "Mid Mail'da Fade olarak trade pozisyonu olmadan girmiş olman (Mid Mail, trade yok) direkt sebep: Haunt/Prowler döngüsü attın ama takım arkadaşı trade yoktu, bu yüzden girdiğin anda tek hedef oldun; bunun sonucu olarak öldün. Mid Mail'daki hatayı tekrarlamamalısın.",
    "nextRoundPlan": "Haunt atıp Prowler gönderirken bir teammate Mid Mail çıkışında trade pozisyonunda beklesin; eğer trade gelmezse Seize koyup geri çekil veya Haunt'ı duvara sektirip bekle — kesinlikle solo Hamle yapma."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage Utility Hatası!",
    "deathAnalysis": "Skye olarak Haven saldırısında Garage'da öldün çünkü bilgi almadan kuş/kopek/flash patlattın; utility patladıktan sonra giriş yaptığın için koridoru önceden kapatan oyuncuya bedava hedef oldun.",
    "nextRoundPlan": "Emir: Garage'a utility atmadan önce Sova recon veya teammate footstep onayı al ve kuşu tam peek zamanında patlat; alternatif: utility atmadan Garage'ı bırakıp Connector üzerinden 2 kişiyle split gir."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short erken ayrılma",
    "deathAnalysis": "A Short'ta anchor pozisyonunu erken bıraktın; Brimstone olarak A Short kontrolünü bırakınca takım A Short baskısını kaybettiği için seni trade alamadan öldürdüler. A Short'ta smoke veya Stim Beacon bırakıp bir tur daha pozisyonda kalmalıydın, erken ayrılman Bind savunma dengeni bozdu.",
    "nextRoundPlan": "A Short'ta bekle, iki smoke at ve Stim Beacon koy; eğer ilk trade gelmezse lamps arkasına küçük bir off-angle al ve teleporter çıkışına bak."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link Smoke Geç",
    "deathAnalysis": "Bu round'da B Link'te smoke timing'ini geç başlattın; B Link girişinde smoke patlamadan önce pozisyonunu açtığın için savunucu off-angle'dan seni cezalandırdı.",
    "nextRoundPlan": "Bir sonraki round B Link'e girerken smoke'ı girişten 0.5–1s önce at, smoke patladığı an jiggle peek ile bilgi al; smoke patlamadan önce footstep/utility sesi yoksa hemen geri çekil ve trade pozisyonuna geç."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market Lurk Tuzağı",
    "deathAnalysis": "B Market'ta lurk ederken arkadan yakalandın; Gekko olarak globülü toplama veya Wingman destek rotası planlamadan B Market'e yalnız girmen hata oldu, bu yüzden backstab yedin. Alternatif olarak B Market lurk'unda globülü attıktan sonra hemen Market girişine yakın bir cover'e (Market side cover) topla veya bir teammate'ten Market split için 1 trade/alıcı bırakmasını talep et; iki varyasyonla tekil backstab riskini düşürürsün.",
    "nextRoundPlan": "Wingman plant gönderme kararı site temizlenene kadar bekle; globülü attıktan hemen sonra Market girişindeki cover'a topla ve Market split için bir teammate çağır."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "CALLOUT: Mid Boiler TP hatası",
    "deathAnalysis": "Mid Boiler'da teleport sonrası takipsiz agresyonla öldün — TP'ye varıp klon/flash olmadan geniş swing attın, bu pozisyon Mid Boiler'da seni açıkta bıraktı çünkü takip veya utility yoktu.",
    "nextRoundPlan": "Mid Boiler'a TP attığında önce klon gönder veya Blindside/flash hazırla; TP varır varmaz geniş swing atma, klon/flash tepki çektikten sonra hemen swing at. Alternatif: TP'yi daha gizli bir arkaya göm, takımıyla senkronize gelip aynı anda giriş yap, tek başına TP sonrası agresyon deneme."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun senkronu",
    "deathAnalysis": "C Mound'da sen Fault Line/Flash senkronunu vermeden atıp takımın C Mound swing'ini bozdu; stun timing'i C Mound giriş anıyla uyumlu değildi, takım beklemiyordu. C Mound'da Breach olarak her util atmadan önce \"C Mound geliyor\" diye sesli onay al, yoksa stun boşa gider ve sen trade alınamazsın.",
    "nextRoundPlan": "C Mound için: stun/delay sinyalini ver (\"C Mound geliyor\"), takımın onayını bekle, Fault Line at ve flash patlar patlamaz takım girsin."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main: knife boş kaldı",
    "deathAnalysis": "B Main'da knife attın ama knife sonrası baskı kurmadığın için tek başına kaldın ve öldün. Knife sonrası takımın B Main trade pozisyonu yoktu; entry'yi tek başına alman ölümüne yol açtı.",
    "nextRoundPlan": "Knife vurduğun anda B Main'de biri pop-flash patlatıp senle beraber entry yapacak; ikinci kişi hemen trade pozisyonunda beklesin. Alternatif olarak, flash yoksa knife sonrası geri çekil, B Main'de bir oyuncu Market yönünü izleyecek şekilde bırak ve organize (flash+trade) tekrar girin."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "Wall Timing — A Hall uyarı",
    "deathAnalysis": "Breeze savunmasında Viper olarak A Hall'da bu roundda wall'u girişten önce uzun süre açık bıraktın; A Hall'da açık wall seni direkt görünebilir kıldı ve bu yüzden öldün. Callout: A Hall.",
    "nextRoundPlan": "Birincil: wall'ı takım entry başlamadan hemen önce aç, takım A Hall'dan geçtiğini sound veya görselle doğruladığın anda 0.8–1s sonra kapat; böylece A Hall'da cross vermemiş olursun. Alternatif: eğer teammate A Hall'dan flash/entry yapıyorsa wall'ı 0.3–0.5s önce aç ve orb'u post-plant için sakla."
  }
];
export const FEEDBACK_BANK_EN: FeedbackExample[] = [
  {
    "agent": "Jett",
    "map": "Ascent",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Solo Entry",
    "deathAnalysis": "You died at A Main while making a solo dry entry with no trade — you took the first duel alone and had no teammate watching your back, so there was no trade to punish the defender. Stop committing as the lone entry at A Main; wait for a flash or a second player to trade because A Main's long sightline and Heaven/Generator crossfire punish unsupported lone entries.",
    "nextRoundPlan": "Hold A Main off until a teammate flashes for you, then dash into the swing with the flash timing; if no flash comes, fall back and approach A site via A Short for a split instead because entering A Main alone gives defenders an isolated duel you cannot win reliably."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah — Overpeek Fix",
    "deathAnalysis": "You died at Hookah after a kill by overpeeking into a second angle instead of securing the trade window; that immediate aggressive swing left you exposed. After a first kill at Hookah, take cover and Devour to guarantee full HP, or Dismiss into the Hookah ceiling/corner to reset position if multiple angles are possible.",
    "nextRoundPlan": "On entry: win the first duel, step immediately behind the Hookah ledge and Devour; if you hear or suspect another angle, Dismiss into the Hookah ceiling/corner, re-peek only after your HP is restored and your sightline is singular."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven Tek Giriş",
    "deathAnalysis": "B Heaven'da öldün; senin geç retake ve tek tek giriş yapman (tek tek içeri girdiğin için) Heaven'daki savunmacının birer birer seni almasına izin verdi. B Heaven'ı smoke veya molly ile flush et ve en az iki oyuncuyla crossfire kurarak aynı anda içeri gir; alternatif olarak bir oyuncu Heaven'ı flush ederken diğerleri giriş penceresini eşzamanlı kullanmalı.",
    "nextRoundPlan": "Geri çekil, B Main ve Garage/Lurk pozisyonuna iki oyuncu yerleştir, B Heaven'a önce smoke sonra molly at; molly patladığı anda aynı anda içeri girin."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Fast Entry",
    "deathAnalysis": "You sprinted into A Main on Lotus as Neon with no utility and died in Tree/Stairs sightlines; Fast Lane wasn't used and you presented a predictable, exposed target. Shift to a Fast Lane + coordinated flash approach to break those sightlines, or delay the sprint until a smoke/flash lands because sprinting alone into crossfires gets you one-shotted.",
    "nextRoundPlan": "Put Fast Lane, wait for a teammate flash to land on Stairs, then sprint-slide into the Tree angle; if no flash is available, hold the wall and only sprint the moment a smoke covers Tree or Stairs."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long — Tekrarı Kes",
    "deathAnalysis": "C Long'da aynı geniş açıya tekrar tekrar girmen düşman tarafından okunmuş; bu round'da C Long'da ayni açıdan vuruldun. Bir round C Long pozisyonunu bırakıp Garage veya C Connector üzerinden split yap veya C Long'da farklı bir yükseklik/smoke kombinasyonu kullan; C Long'daki tek tip açıyı tekrarlamayı kes.",
    "nextRoundPlan": "C Long'da bekleme: Garage'dan iki kişilik split ile gel; veya C Long için üst tavan/alternatif Recon Bolt noktası kullan, önce smoke koy, flash patladığında kısa wide swing yap."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "Curve A Main Entry",
    "deathAnalysis": "You pushed A Main without throwing a Curveball and died at A Main; A Main's straight sightline punished an unflashed entry. That single error at A Main removed any entry window and made your swing predictable.",
    "nextRoundPlan": "Curveball right into A Main and swing the moment it pops; if you expect a utility stack at A Main, fake the A Main commit with a short wall then go through A Elbow instead."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt callout",
    "deathAnalysis": "You missed the Operator's first shot at A Belt and then held the exact same angle, which let the enemy recover and punish you; reset after a whiff—don’t keep exposing the same line. Instead of lingering on the belt line, step back or change to a tighter off-angle so the enemy must re-aim, because repeating the same exposure hands them an easy kill.",
    "nextRoundPlan": "If your first Operator shot misses at A Belt, immediately disengage one step, relocate to A Rafters or Generator, then re-peek with a jiggle or change your eye-level; if you must hold long, use a micro-offangle rather than the identical sightline."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors — smoke peek",
    "deathAnalysis": "At Mid Doors you peeked out of your own smoke and died because the smoke removed your visual cover; instead, re-peek by jiggle-peeking the smoke edge from behind cover or throw a flash into the smoke and immediately swing so you force timing rather than expose yourself in the smoke. As an alternative, hold the smoke's angle from off-angle (e.g., one step back of Mid Doors cover) and wait for a concrete trigger — a teammate's call or a flash — before committing.",
    "nextRoundPlan": "Hold just behind Mid Doors cover; jiggle the smoke edge and only fully swing on a teammate flash or a clear call."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main — Operator Lose",
    "deathAnalysis": "You died at A Main while still holding the Operator and did not drop it; that stopped your team from recovering the long-range weapon at A Main and cost 4700 credits (observation: death at A Main with Operator). This likely happened because you attempted a close-range duel at A Main without swapping or timing a teleport-out, so stop assuming the Operator survives close trades at A Main.",
    "nextRoundPlan": "If you enter A Main again, either teleport immediately after your first shot or swap to a secondary before close-range contact; if you must hold A Main long angles, commit to one peek then TP out—do not attempt extended close duels with the Operator at A Main."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "B Tunnel — Late Rotate",
    "deathAnalysis": "You died at B Tunnel because you started your rotation late, leaving the site without your Killjoy utility and allowing attackers to clear without contest; rotate timing from B Tunnel must be tied to teammate contact or clear turret info. Change: when in B Tunnel, only begin rotation after you hear a teammate call or the turret stops pinging, or rotate immediately and bring Alarmbot/Nanoswarm with you so you don't leave site utilityless.",
    "nextRoundPlan": "From B Tunnel, rotate on a clear teammate call or turret silence; if rotating, place Alarmbot+Nanoswarm on your path and announce 'rotating B Tunnel' before you commit."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Wide Peek",
    "deathAnalysis": "You took a wide swing from Mid Courtyard on an eco round and died because you were fully exposed without a slow or cover; Mid Courtyard wide angles punish Sage on eco. Instead of wide peeks in an eco round, anchor in Pizza/Cubby or behind the low bench and rely on a Slow Orb into the Mid Courtyard choke to force awkward approaches.",
    "nextRoundPlan": "Anchor Pizza/Cubby or bench at Mid Courtyard, pre-aim the expected entry, throw Slow Orb into the Mid Courtyard choke as soon as footsteps or comms indicate a push, then stall behind cover and only peek when a teammate can trade."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail — No Trade",
    "deathAnalysis": "You pushed Mid Mail solo and died because there was no trade position to punish that entry; Mid Mail commit without backup is a one-man loss. That death cost you both the Mid info and a teammate for the ensuing fight because nobody was holding a trade angle in Mid Mail.",
    "nextRoundPlan": "Have a partner: one player peeks Mid Mail while you hold Mid Rope (trade angle); do not step into Mid Mail until the trade is visually ready."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage Callout — Stop",
    "deathAnalysis": "You died at Garage after burning utility without first confirming enemy presence; that single action handed away positional info and left you exposed because you committed blind. Next time send Skye's Trailblazer or ask for a Sova recon before you detonate Guiding Light; if recon isn't available, hold your flash and have a teammate trade the swing so you don't go in alone.",
    "nextRoundPlan": "Send Trailblazer into Garage first, only detonate Guiding Light when teammate is lined up to swing immediately; if no recon, call for a 2-man entry (you as flash, teammate as immediate trade)."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "A Short Anchor (A Short)",
    "deathAnalysis": "You left A Short anchor too early this round, abandoning Heaven and Lamps angles and allowing attackers a clean crossfire window; hold the anchor until a concrete trigger appears. As an alternative, if you must rotate from A Short this round, call it and smoke Lamps before moving so you don't hand over an exposed A Short flank.",
    "nextRoundPlan": "Hold A Short anchor until either a teammate trades on your call or you hear Heaven peek; if rotating from A Short, announce it, throw a Lamps smoke, then fall back."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "B Link Smoke Timing",
    "deathAnalysis": "You died at B Link on defense as Astra because your Nebula was activated after the enemy entered B Link, leaving your body exposed. That late smoke timing at B Link prevented Gravity Well/Nova Pulse setup and allowed them to clear your angle before you could control the choke.",
    "nextRoundPlan": "During buy place an Astra star on B Link and activate Nebula the moment you hear footsteps or an ally calls B Main, then immediately lane Gravity Well + Nova Pulse through that B Link smoke; if you get no audio/visual confirm, keep the B Link star primed and do not astral until the enemy commits to the choke."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market Lurk Fail",
    "deathAnalysis": "You were lurk-ing at B Market and got caught from behind while isolated; being alone in B Market left no trade or info for your team. Instead hold a recovery path: lurk from B Alley with a planned escape to Market-side crate so a teammate can trade or you can re-enter after a kill.",
    "nextRoundPlan": "Lurk from B Alley, pre-plan the globule pickup route to Market-side crate, and only commit into Market when a teammate peeks B Main or you hear plant/footstep confirmation."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler — Teleport Error",
    "deathAnalysis": "You teleported into Mid Boiler and immediately pushed without follow-up; that single action (Teleport -> solo swing at Mid Boiler) got you killed because you had no trade or flash ready. Instead, teleport only as a positional threat and commit with a flash + teammate within 1 second, or bait a swing by sending the clone and wait 0.5–1s for enemy reaction before arriving.",
    "nextRoundPlan": "Place Gatecrash behind the boiler lip, send the clone toward Mid Raf, wait for a teammate to be within line-of-sight, then TP in with a flash timed to land the moment you exit — if no teammate is ready, cancel the TP and use the clone to draw fire instead."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "en",
    "title": "C Mound stun timing",
    "deathAnalysis": "You cast Fault Line at C Mound before teammates committed, so the stun window expired and you were isolated on the mound; that mistimed initiation left you exposed and got you traded. Synchronise voice cue with a visible or audible readiness—don’t fire Fault Line until two teammates confirm they will enter the same tick.",
    "nextRoundPlan": "Call “Fault Line C Mound—ready?”; wait for two audible confirmations or a toe-on-door sound, then detonate Fault Line and have teammates swing immediately on the same tick; follow with Aftershock into the corner and clear while you occupy mound cover."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "en",
    "title": "B Main knife follow-up",
    "deathAnalysis": "You used ZERO/POINT at B Main but didn’t press the suppress window or call the suppress count, so the utility value was lost and you died at B Main; the report shows knife used but no immediate entry or trade pressure followed. As a result the suppress didn’t remove defenders’ utility in time and you came into a raw duel at B Main without advantage.",
    "nextRoundPlan": "After ZERO/POINT at B Main, call the suppress result out loud, then step in immediately with a flash and be the first into the choke to force gunfights during the suppressed window; if suppress reads zero, delay entry and watch Market for a rotator instead."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "en",
    "title": "A Hall Timing Fix",
    "deathAnalysis": "In this round you opened the Toxic Screen too early in A Hall, so the wall expired before the critical fight at A Hall and left you without control; open the wall later and sequence it with your team’s entry into A Hall. Close the screen immediately after teammates clear A Hall to preserve fuel for post-plant in A Hall.",
    "nextRoundPlan": "Hold Toxic Screen in A Hall until the first teammate steps into A Hall, then open and shut the wall as they pass so you retain fuel for post-plant in A Hall."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
