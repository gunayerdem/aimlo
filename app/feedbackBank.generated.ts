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
    "deathAnalysis": "ÖLÜM NEDENİ: A Main'de tek başına kuru entry yaptın, trade yok; ilk mermiyi yedin çünkü flash/smoke olmadan wide peek atıyorsun. Next time A Main'de flash bekle, flash patladığı an dash ile swing atıp hemen geri çekil.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son round killfeed ve pozisyon göstergesi var — karşı taraf A Main'i cover eden bir oyuncu hazır bekliyordu; bu tekrar okunabilir hale geldiği için aynı açıya tekrar çıkma riskin yüksek.",
    "nextRoundPlan": "SONRAKİ ROUND: A Main'e tek başına çıkma — önce bir flash atın, flash patladı mı hemen dash ile gir; eğer trade pozisyonuna biri hazır değilse girme, bekle."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "tr",
    "title": "Hookah overpeek öldün",
    "deathAnalysis": "ÖLÜM NEDENİ: Hookah'da kill sonrası hemen overpeek atıp ekstra açı kontrolü yapmaya çalıştın; öldükten sonra takım trade alamadı. Hookah'ta kill sonrası kapak arkasına geç, Devour kullan ve 0.5–1 saniye bekleyip sonraki swing'i takımla koordine et — ekstra peek atma.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son 1. öldürmeden sonra aynı Hookah köşesinden ikinci bir oyuncu quick swing ile seni cezalandırdı; bu tekrar eden bir setup olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: Hookah'ta kill alırsan önce kapak arkasına dön, Devour yap, 0.5–1s bekle; sadece teammate ses/peşi gelirse ikinci açıya çık — direkt overpeek atma."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "tr",
    "title": "B Heaven'da tek tek öldün",
    "deathAnalysis": "ÖLÜM NEDENİ: B Heaven'da tek başına pozisyon tutarken, geç retake ve tek tek giriş nedeniyle trade yoktu; utility (molly/flash) ile Heaven'i flush etmeden veya arkadan destek olmadan bekledin, bu yüzden tek vuruşta düşürüldün. Bir round boyunca B Heaven'da pasif anchor ol — molly/flash gelene kadar alçak pozisyonda kal ve sadece bir teammate B Main/Back bilgisi verdiğinde swing at.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son 3 round'da B Heaven'dan tek kişiyi kolayca çıkardılar; bu tekrar, Heaven'daki pasif bekleyeni cezalandırıyor olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: Heaven'da tek başına agresif oynamıyorsun — önce teammate'ten B Main veya Back'ten trade-ready call al; eğer trade yoksa molly/flash iste, yoksa pozisyonu bırak ve B Back'e yakın crossfire kur."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main hızlı girişi",
    "deathAnalysis": "ÖLÜM NEDENİ: A Main'de utility'siz hızlı entry yapıp A Tree ve A Stairs açılarını aynı anda expose ettin — Tree/Stairs birleşiminden gelen ilk atış seni aldı. Fast Lane duvarını önce koy, bir smoke veya flash alanı kapatana kadar sprint başlatma; duvar+flash patladığında slide ile içeri gir, Tree’ye ani swing at.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son round'da A Tree ve A Stairs iki farklı açıdan seni aynı anda gördü; bu tekrar, o callout'un aktif tutulduğunu gösteriyor olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: Fast Lane aç, Tree sightline'ını smoke'la veya flash'la uyuştur, flash patlar patlamaz sprint+slide ile sola swing at — utility yoksa girmeyeceksin."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "tr",
    "title": "C Long Tekrarı — Darbe Alıyorsun",
    "deathAnalysis": "ÖLÜM NEDENİ: C Long'da aynı geniş açıdan tekrar tekrar girdiğin için savunucu seni aynı sightline'dan kafadan cezalandırdı; çözüm olarak sonraki round Sova drone ile C Long içini gör, Recon Bolt'u farklı yükseklikten (plat tavanı yerine box arkasına) at ve entry'yi flash patlarken yap — DRONE ile bilgi almadan kuru geniş açı verme.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son birkaç roundda C Long'da seni aynı geniş açıda bekleyen oyuncu tutarlı bir şekilde aynı sightline'ı kullanıyor olabilir; bu tekrar okunabilir hale gelmiş.",
    "nextRoundPlan": "SONRAKİ ROUND: Owl Drone ile C Long içini tarayıp pozisyon doğrula; Recon Bolt'u alternatif yüksekliğe indir; flash patladığı anda iki kişi birlikte entry yap — tek başına geniş açıdan kuru girme."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main'te Flash'sız Entry",
    "deathAnalysis": "ÖLÜM NEDENİ: A Main'den flash atmadan düz giriyorsun; Elbow'da bekleyen savunucu ilk kurşunu alıyor. Curveball ile köşeyi körlet, flash patlar patlamaz sağa geniş açıyla swing atıp Elbow'u kontrol et; flash olmadan hiçbir zaman Elbow'a commit etme.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son 1 round'da seni A Main'de flash'sız girerken öldüren pozisyon tekrarlandı—rakip Elbow'u köşede bekleyip ilk atışı alıyor olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: Sen A Main entry'sin — sağ Curveball at, flash patladığı anda geniş açıyla içeri gir; eğer flash başarısız olursa geri çekil ve Market'ten split iste."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "tr",
    "title": "A Belt’te Opersiz Beklemek",
    "deathAnalysis": "ÖLÜM NEDENİ: A Belt'te Operator ile aynı off-angle'da bekledin; ilk mermiyi ıskaladıktan sonra açıyı değiştirmedin, karşı taraftan ikinci atışla cezalandırıldın. Callout yapar yapmaz—\"belt 1\"—hedefi değiştirmezsen trade alacak biri arkanda hazır beklesin veya hemen position değiştir; sabit beklemek risktir.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Veride tekrar yok; sadece bu round için çıkarım: rakip Operator ile aynı açıda bekledi ve ikinci shot'ı kullanarak seni cezalandırdı.",
    "nextRoundPlan": "SONRAKİ ROUND: A Belt'e gelir gelmez kamerayı veya tel’i choke’a koy, Operator sesi/ilk atış gelirse anında pozisyon değiştir (hemen sola 0.5s kay/alt kata geç) ve teammate'in trade pozisyonunda olmasını sesli söyle: \"trade on belt\"."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "tr",
    "title": "Mid Doors’ta Smoke Hatası",
    "deathAnalysis": "ÖLÜM NEDENİ: Kendi smoke'unun içinden çıkıp Mid Doors'ta peek atınca savunucu sana scope/wide açıyı zaten hazırlamıştı; smoke'dan çıkışın silhouette verdi ve öldün. Smoke'un arkasında durup jiggle ile bilgi al, smoke patladıktan hemen sonra Paranoia ya da flash ile eşleştirip dışarı çık — Mid Doors'tan direkt body gösterme.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Bu tek round değilse, aynı pozisyondan çıkışların savunucuya okunuyor olabilir; yine de şu an için yeterli tekrar kanıtı yok.",
    "nextRoundPlan": "SONRAKİ ROUND: Smoke Mid Doors'un üstüne yüksek koy, Paranoia/flash patladığı anda bir jiggle ile test et; eğer trade hazırsa tam commit, yoksa geri dön."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "tr",
    "title": "A Main Operator Kaybı",
    "deathAnalysis": "ÖLÜM NEDENİ: A Main'da Operator'lu bir defender karşısına yaklaştın ve tek atışla öldün; teleport sonrası tekrar aynı açıdan peek atıp bir daha öldün — Headhunter/TP döngüsünü tek atış kuralıyla bozmadın ve op'u düşürme fırsatı yaratmadın.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Mevcut veride rakibin repeat davranışı veya spesifik player bilgisi yok; sadece bu roundda A Main'de op ile seni tutan bir oyuncu vardı ve senin ikinci peek'in onu yeniden öldürmeye izin verdi.",
    "nextRoundPlan": "SONRAKİ ROUND: A Main'e gelirken bir atış yap, teleport ol; eğer ilk atış kafadan kaçtıysa o noktayı bırak ve başka bir off-angle'dan tekrar gel; op'u vurduğun anda yerdeki silahı almak için hemen pozisyon değiştir, tekrar aynı açıdan swing atma."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "tr",
    "title": "Rotasyon Geç Başlatma — B Tunnel",
    "deathAnalysis": "ÖLÜM NEDENİ: B Tunnel'da rotasyonu geç başlattın; site tarafında 3v2 olmasına rağmen hemen rotasyon yerine orada beklemeyi seçtin ve B Tunnel'da kaldığın için rotasyon zamanı kaçtı — Callout: rotasyonu zamanında başlat. Tek çözüm: bir sonraki benzer durumda 2 saniye farkla hemen rotate et, B Tunnel çıkışında smoke+turret hazırla.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Veride düşman davranışı tekrarlayan bir pattern görünmüyor; düşmanın pozisyonu veya killfeed kanıtı olmadığı için spesifik adaptasyon belirtilemiyor.",
    "nextRoundPlan": "SONRAKİ ROUND: Skoru kontrol et, A takım arkadaşın site içinden 2 kişi düştüğünde anında rotasyon başlat — B Tunnel'da 2 saniyede kendini hazır et (turret kur, smoke lineup hazır) ve çıkarken alarmbot+swarm kombosunu ezberle."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "tr",
    "title": "Mid Courtyard Ölümü",
    "deathAnalysis": "ÖLÜM NEDENİ: Mid Courtyard'da geniş açıyla kuru peek atıp eco round'da tek başına kaldın; B Main/Mid link'ten gelen yakın mesafe Classic/Sheriff'i cezalandırdı — o açıda sağlam cover yokken geniş açıyla çıkmak ölümle sonuçlandı. Mid Courtyard'da dar açı tut, pizza/cubby arkasından jiggle ile bilgi çek veya duvar slow ile chokeyi daralt; geniş açıyla açıkta durma.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son round'da killfeed'de eco silah görüldü; bu tekrar, yakın mesafeyle seni cezalandıracaklarını gösteriyor olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: Mid Courtyard'da önce cubby'den jiggle ile bilgi çek, eğer ses/killfeed yakın mesafe gösterirse duvar koyup slow at; tek başına geniş açıdan çıkma."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "tr",
    "title": "Mail'de Tek Başına Öldün",
    "deathAnalysis": "ÖLÜM NEDENİ: Mid Mail'de trade pozisyonu olmadan solo girdin — Mail dar, Mail içindeki veya B Heaven/Connector tarafından swing gelecek şekilde açık bıraktın; Prowler/Seize ile bile girsen tek başına trade yoksa ölürsün. Mail'e girerken bir arkadaşın Garage/Mail girişini trade edecek pozisyonda beklesin veya sen Prowler'ı Haunt'la eş zamanlayıp hemen arkasından bir teammate swing atsın; tek varyasyonla girmeyi bırak.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Bu round verisine göre rakibin Mail/Connector rotasını trade beklemeden kapatacak biri vardı — Mail'de solo giriş yaptığında seni anında cezalandırdılar.",
    "nextRoundPlan": "SONRAKİ ROUND: Mail'e girişin için 1) Haunt at, Prowler gönder; hemen arkasından teammate Garage/Connector'dan swing atsın; veya 2) Sen Mail'e çıkmadan önce bir teammate Mail kapısına yakın trade pozisyonunda beklesin — tek başına Mail'e girme."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "tr",
    "title": "Garage Utility Kaybı",
    "deathAnalysis": "ÖLÜM NEDENİ: Garage'da bilgi almadan utility harcadın — smoke/flash'ı erken veya tek başına kullanıp sonra swing atınca savunucu zaten nişanını almış; bunun sonucu olarak op/shotgun seni kafadan vurdu. Utility'ı önce bilgi için kullan, köpeği/Seeker/ally ile görüş teyidi almadan smoke'ı sahte bırakıp swing atma.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son 3 round'da Garage girişinde seni utility sonrası bekleyip tek atışla cezalandırdılar; bu tekrar düşmanın o pozisyonu okuduğunu gösteriyor olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: Garage'a girmeden önce Sova recon veya köpek/Seeker ile bilgi al; smoke'ı patlat ama takım peek için hazır olana kadar bekle — ilk kişi flash patlatıp dışarı çıkmasın, iki kişi koordineli entry yapın."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "tr",
    "title": "A Short Anchor Hatası",
    "deathAnalysis": "ÖLÜM NEDENİ: A Short'ta anchor pozisyonunu erken terk ettin — Heaven ve Lamps açılarını açık bıraktın, o yüzden A Short'tan gelen swing seni arkasından vurdu. Heaven veya Lamps'ta 2 round boyunca anchor kal; pozisyon değişmeden önce team trade pozisyonu olana kadar bekle, teleporter sesine ya da teammate'in 'clear' call'una kadar çıkma.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son round'da A Short bağlantısını kullanan saldırıcı, senin erken ayrılışını reward etti; bu tekrar okunabilir hale gelmiş olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: Heaven'da anchor ol, Lamps'ta off-angle tutan takım arkadaşınla trade hattı kur; anchor'ı terk etmeden önce teammate 'trade ready' demeli — aksi halde pozisyondan çıkma."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "tr",
    "title": "B Link Smoke Geçikmesi",
    "deathAnalysis": "ÖLÜM NEDENİ: B Link'te smoke timing'ini geciktirdin; B Link'e girerken duman yoktu, dar koridordan gelen rotator seni silhouette verip bitirdi. B Link'e girerken smoke'ı 0.5–1s önce at ve hemen jiggle ile pozisyon doğrula; smoke patladıktan sonra takımına swing için sinyal ver ve trade pozisyonuna geç.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son 3 roundda B Link'e girerken smoke yoksa aynı dar açıdan hızlı rotate ile trade veya lurk yapan oyuncular seni cezalandırmış — bu tekrar okunabilir hale gelmiş olabilir.",
    "nextRoundPlan": "SONRAKİ ROUND: B Link smoke'ını round startında ya da yaklaşırken yap; smoke patlayana kadar commit etme, smoke patladığı an takımınla eş zamanlı gir ve trade pozisyonu al."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "tr",
    "title": "B Market Lurk Kaybı",
    "deathAnalysis": "ÖLÜM NEDENİ: B Market'te lurk yaparken arkadan yakalandın çünkü rotasyon/market kontrolü sağlamadan globül toplamak için pozisyon değiştirdin; sonuçta arkan boş kaldı. Globülü toplarken önce Market girişini bir oyuncuya veya tripwire/utility ile kilitle — globülü aldıktan sonra backline'a sakince dön, arkanda en az 1 trade-ready takım arkadaşı bulundur.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Veride tekrar yok; elinde killfeed ya da önceki round kanıtı olmadığı için düşman davranışı hakkında net iddia yok.",
    "nextRoundPlan": "SONRAKİ ROUND: Globül toplarken Market girişine bir teammate bırak (trade-ready) veya Cypher/Killjoy tuzağı varsayıyorsa onu pasifleştir, globülü almadan önce Market'e hızlı utility at ve sadece trade-ready arkaya döndüğünde backline'a geç."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "tr",
    "title": "Boiler TP'ye takipsiz girme",
    "deathAnalysis": "ÖLÜM NEDENİ: Mid Boiler'da teleport yapıp takipsiz agresyonla girdin; TP sonrası ne yapacağına dair bir tetikleyici yoktu, bu yüzden Boiler köşesinden instant trade yedin. TP atarken elinde flash hazır ol, TP varır varmaz Blindside/flash patlatıp geniş açıyla swing at — TP'ye plansız giriş yapma, her TP girişi bir sonraki eylemi tetikleyecek şekilde olmalı.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Bu maçta düşman Boiler köşesini bekliyor olabilir; önceki round kanıtı yok, bu yüzden kesin demek için veri yetersiz.",
    "nextRoundPlan": "SONRAKİ ROUND: Boiler TP at, TP yerleştiğinde anında Blindside + kısa flash ile birlikte geniş açıya swing at; alternatif olarak TP'yi daha gizli bir kutu arkasına gömüp takımınla trade setlemeden tek başına girmeye çalışma."
  },
  {
    "agent": "Breach",
    "map": "Lotus",
    "side": "attack",
    "location": "C Mound",
    "lang": "tr",
    "title": "C Mound stun uyumsuzluğu",
    "deathAnalysis": "ÖLÜM NEDENİ: C Mound'da Fault Line/Stun zamanlamasını takımla eşleştirmeden attın; stun patladı ama takım o anda swing/entry yapmadığı için sen tek kaldın ve 1vX olarak öldün. Stun atmadan önce sesli onay al — “fault line C mound, giriyoruz” de, stun sonrası ekip anında swing atsın.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Rakip C Main/Waterfall tarafında bekleyip stun sonrası tek hedefi ceza veriyor olabilir — bu tekrar, stun uyumsuzluğunda seni cezalandırıyor.",
    "nextRoundPlan": "SONRAKİ ROUND: Stun atmadan önce voice’ta “fault line C mound — 3 kişi giriyoruz” diye onay al; stun patladıktan 0.3s içinde iki kişi Mound’dan swing atsın, sen trade pozisyonunda kal."
  },
  {
    "agent": "KAY/O",
    "map": "Ascent",
    "side": "attack",
    "location": "B Main",
    "lang": "tr",
    "title": "B Main - Knife Boşa Gitti",
    "deathAnalysis": "ÖLÜM NEDENİ: B Main'de knife (ZERO/POINT) attın ama suppress eden düşman sayısını takıma söylemedin ve hemen içeri girip entry rolünü üstlendin; knife sıfır veya tek vuran bir atışsa savunucu sağlam kaldı ve seni trade etti. Knife atınca anında komut ver—\"knife X\"—sonra takımınla 0/1/2 sonucuna göre ya anında yığıl (2+), ya geri çekilip flash/frag ile choke'ı temizle (0-1).",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Mevcut veri tek round; düşman B Main'de sabit off-angle tutuyor gibi görünmüyor, bu yüzden knife sonrası sessiz kalman onların pozisyonunu korumasına izin verdi.",
    "nextRoundPlan": "SONRAKİ ROUND: Knife at, sonucu bağır—eğer \"knife 2\" gelirse anında üç kişi B Main'e yığıl; \"knife 0/1\" gelirse sen geri çekil, FRAG/MENT choke'a at ve takım flash ile pop-flash yapıp giriş yap."
  },
  {
    "agent": "Viper",
    "map": "Breeze",
    "side": "defense",
    "location": "A Hall",
    "lang": "tr",
    "title": "Wall Zamanlaması Patladı",
    "deathAnalysis": "ÖLÜM NEDENİ: A Hall'da wall'u takımın giriş anına yakın, ama henüz arkadaşlar pozisyon almadan açtın; koridoru kapatırken arka açıdan gelip kafadan one-tap yedin. Wall zamanlamasını yanlış seçtin — wall açılırken takımın ready değilse sen yalnız kalırsın.",
    "enemyPatterns": "DÜŞMAN ANALİZİ: Son 3 round verisi yok; bu nedenle düşmanın davranışı hakkında kesin iddia yok. Ancak bu pozisyonda wall erken açıldığında arkadan veya A Hall içinden hızlı swing yapan bir oyuncuya karşı savunmasız kalırsın.",
    "nextRoundPlan": "SONRAKİ ROUND: Wall'u A Hall'da sadece entry start sinyali sonrası aç — takımın 1 kişi A Hall girişinde ready olduğunda wall aç, hemen kapat; alternatif olarak wall'ı 0.5 saniye geciktirip orb'u post-plant için sakla."
  }
];
export const FEEDBACK_BANK_EN: FeedbackExample[] = [
  {
    "agent": "Jett",
    "map": "Ascent",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Kuru Entry",
    "deathAnalysis": "DEATH CAUSE: You solo‑peeked A Main without utility and died because there was no trade—your peek was the only contact, so one bullet ended the round; fix by having a partner ready in Generator or A Short to trade you immediately and only commit the moment your flash/smoke lands.",
    "enemyPatterns": "ENEMY READ: The defender punished isolated A Main entries—when you come alone they hold an angle and pre‑aim the choke, so single‑man dry swings are being consistently punished.",
    "nextRoundPlan": "NEXT ROUND: Wait for a teammate in Generator or A Short to be in trade position, call “flash now,” have the flash pop and then entry together; if no trade is available, delay the entry and take a different angle (A Short or mid split) instead."
  },
  {
    "agent": "Reyna",
    "map": "Bind",
    "side": "attack",
    "location": "Hookah",
    "lang": "en",
    "title": "Hookah Overpeek",
    "deathAnalysis": "DEATH CAUSE: You killed one in Hookah then immediately overpeeked and died; after the first frag you pushed out of cover instead of using Devour or resetting angle, which left you exposed. After the first kill take the immediate cover at Hookah ledge, cast Devour and reposition to a different angle before re-engaging.",
    "enemyPatterns": "ENEMY READ: After losing a teammate in Hookah, defenders frequently pre-aim the nearby off-angle and punish immediate wide re-peeks from the same line of fire.",
    "nextRoundPlan": "NEXT ROUND: After a Hookah kill, step back to the ledge, Devour, change to a new peek (ceiling or elbow), then only re-engage when you have cover or a concrete timing window."
  },
  {
    "agent": "Raze",
    "map": "Split",
    "side": "defense",
    "location": "B Heaven",
    "lang": "en",
    "title": "B Heaven Anchor",
    "deathAnalysis": "DEATH CAUSE: You died at B Heaven because you committed a late, solo retake into a narrow choke (B Main/B Pillar) without teammate crossfire; you entered one-by-one and got isolated — change: do not solo-swing Heaven on a late retake, instead hold the angle to stall or wait for a coordinated flash from B Main before peeking.",
    "enemyPatterns": "ENEMY READ: Repeated single-entry retakes into B Heaven get punished because defenders can focus one-lane trade from Pillar/Main then swing Heaven; that spacing favors the defender on the high ground.",
    "nextRoundPlan": "NEXT ROUND: Hold off retake; call for 1 flash from B Main and a molly on Pillar, then swing Heaven together (you lead with Boombot into Pillar before committing)."
  },
  {
    "agent": "Neon",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main death — utilityless entry",
    "deathAnalysis": "DEATH CAUSE: You sprinted into A Main without utility and died to prepared sightlines; fix by opening Fast Lane, then wait for one flash or smoke before committing so you don't run into stacked Tree/Stairs fire.",
    "enemyPatterns": "ENEMY READ: The repeated result of utilityless A Main entries suggests defenders hold Tree and Stairs angles to punish raw speed rather than chasing — they trade off each other when you run straight in.",
    "nextRoundPlan": "NEXT ROUND: Open Fast Lane, call for a single flash on Tree or a smoke on Stairs, then sprint-slide through A Main immediately on the flash/smoke pop."
  },
  {
    "agent": "Sova",
    "map": "Haven",
    "side": "attack",
    "location": "C Long",
    "lang": "en",
    "title": "C Long Repeat — Stop Taking Same Line",
    "deathAnalysis": "DEATH CAUSE: You kept taking the same wide C Long angle and died because you were pre-aimed; change your exit line and timing — either jiggle from the Plat edge then swing or use a short-range smoke onto Plat before you commit so you force an eyeball reset.",
    "enemyPatterns": "ENEMY READ: Repeating that wide line made you predictable; the defender could hold that sightline with pre-aim and punish your identical timing.",
    "nextRoundPlan": "NEXT ROUND: Do a feint — send Owl Drone toward Plat, then either (A) smoke Plat and flash into the long cross while a teammate pressure from Garage, or (B) delay your peek by 0.5–1s and jiggle-preaim the inner corner instead of the wide shoulder; pick one and execute it."
  },
  {
    "agent": "Phoenix",
    "map": "Sunset",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main death — no flash",
    "deathAnalysis": "DEATH CAUSE: You pushed A Main and died because you entered without using Curveball; entering blind let the defender hold the angle and win the first duel. Next time hold at the A Main corner, throw a right-curve or left-curve Curveball so it pops as you step, then wide-swing immediately — flash then swing, not swing then flash.",
    "enemyPatterns": "ENEMY READ: Repeated entry without flashes makes that A Main angle a one-shot trap for defenders who pre-aim the corner.",
    "nextRoundPlan": "NEXT ROUND: Stand at A Main corner, call 'right flash', throw Curveball that pops as you step, wide-swing instantly; if you don't get the trade within 2 seconds, fall back to Elbow and let Market or a teammate pressure for a cross."
  },
  {
    "agent": "Cypher",
    "map": "Icebox",
    "side": "defense",
    "location": "A Belt",
    "lang": "en",
    "title": "A Belt Op Mistake",
    "deathAnalysis": "DEATH CAUSE: You missed the first Operator shot at A Belt and stayed on the exact same off-angle, so the second swing got you — instead reposition after a miss; step back to the box edge or jiggle to reset crosshair before re-peeking.",
    "enemyPatterns": "ENEMY READ: The defender punished repeated presence on the same Belt angle by holding the reset window after a missed shot.",
    "nextRoundPlan": "NEXT ROUND: If your Operator shot misses at A Belt, immediately change your sightline — either back toward Sandbags to bait a reset or shift to a deeper off-angle on the left box before re-peeking."
  },
  {
    "agent": "Omen",
    "map": "Pearl",
    "side": "attack",
    "location": "Mid Doors",
    "lang": "en",
    "title": "Mid Doors Peek",
    "deathAnalysis": "DEATH CAUSE: You exited your own smoke at Mid Doors and peeked into a cleared sightline, exposing your head — that timing let a defender pre-aim your angle; instead, delay the peek 0.5–1s after smoke pops and jiggle from edge of smoke so only a sliver shows, or crouch-walk to minimize silhouette.",
    "enemyPatterns": "ENEMY READ: Defenders are holding Mid Doors pre-aiming the common smoke-exit line, punishing players who fully step into sight immediately after the smoke.",
    "nextRoundPlan": "NEXT ROUND: Pop the smoke, wait half a second, then jiggle-peek from the smoke edge (or use flash first) — do not step fully out and stand still."
  },
  {
    "agent": "Chamber",
    "map": "Lotus",
    "side": "attack",
    "location": "A Main",
    "lang": "en",
    "title": "A Main Operator Drop",
    "deathAnalysis": "DEATH CAUSE: You died at A Main holding Operator and did not drop it when killed, so your team lost potential weapon economy; instead of trying to duel longer you should have immediately toss-dropped the Operator body or called for a trade while falling to preserve the 4k+ value.",
    "enemyPatterns": "ENEMY READ: When you hold A Main with an Operator, attackers punish prolonged duels and prioritize securing the long gun on your corpse, so failing to relinquish it hands them a free buy.",
    "nextRoundPlan": "NEXT ROUND: If you get Operator-picked in A Main, immediately throw the weapon (drop) on death or loudly call 'drop on death' so a teammate peeks and secures it; if you can’t drop, stall with utility while calling for a trade instead."
  },
  {
    "agent": "Killjoy",
    "map": "Breeze",
    "side": "defense",
    "location": "B Tunnel",
    "lang": "en",
    "title": "Late Rotate Kill (B Tunnel)",
    "deathAnalysis": "DEATH CAUSE: You died in B Tunnel because you rotated late into the site and were caught in a crossfire while entering — move faster into anchor positions or delay rotation until you have utility to contest; instead of running straight into tunnel, take the off-angle at the back alcove and use your turret as early warning so you don't arrive alone.",
    "enemyPatterns": "ENEMY READ: The killer punished late rotations into B Tunnel crossfire, suggesting defenders held pre-aimed angles on common rotation timings for that entrance.",
    "nextRoundPlan": "NEXT ROUND: Rotate earlier the moment teammate HP or presence drops (don't wait for call), place turret to watch B Tunnel approach before committing, and enter B Tunnel from the alcove peek to force wide aim or buy time for a trade."
  },
  {
    "agent": "Sage",
    "map": "Ascent",
    "side": "defense",
    "location": "Mid Courtyard",
    "lang": "en",
    "title": "Mid Courtyard Death",
    "deathAnalysis": "DEATH CAUSE: You swung wide at Mid Courtyard on an eco round and died — you exposed your body to long sightlines with a weak pistol; stay narrow and use cover instead.",
    "enemyPatterns": "ENEMY READ: The kill indicates the defender held a long sightline from Top Mid/Pizza and punished wide peeks on eco buys.",
    "nextRoundPlan": "NEXT ROUND: On eco, don't take a wide Courtyard swing; jiggle from the left crate or close-corner peek from the arch, and if you must challenge long, trade with a teammate at the doorway."
  },
  {
    "agent": "Fade",
    "map": "Split",
    "side": "attack",
    "location": "Mid Mail",
    "lang": "en",
    "title": "Mid Mail — No Trade",
    "deathAnalysis": "DEATH CAUSE: You entered Mid Mail alone and died because there was no trade behind you; that single peek surrendered any chance to convert the frag into a round advantage. On the next Mid Mail approach, never go first alone — step back 0.5–1s after Haunt/Prowler starts and wait for a team member to hold the swing line for immediate trade.",
    "enemyPatterns": "ENEMY READ: When a solo player shows in Mid Mail, defenders punish the initial peek angle by pre-aiming the choke or holding a deep off-angle that windows out lone entries.",
    "nextRoundPlan": "NEXT ROUND: Call 'Mail ready' and send Haunt into Mail, then hold a stable trade spot with a teammate (anchor at Mail door or top Mail) — when Prowler lands, the anchor swings immediately; you do not entry alone."
  },
  {
    "agent": "Skye",
    "map": "Haven",
    "side": "attack",
    "location": "Garage",
    "lang": "en",
    "title": "Garage Death — Stop Utility First",
    "deathAnalysis": "DEATH CAUSE: You used your flash/smoke in Garage and then immediately pushed without first getting recon or teammate confirmation, so you entered blind and died; fix by forcing information before committing — send a drone/peek with teammate or have Skye's dog clear the angle, then push on the utility window.",
    "enemyPatterns": "ENEMY READ: When attackers pop utility into Garage and immediately push, defenders commonly hold a passive off-angle inside Garage or Window and punish blind entries.",
    "nextRoundPlan": "NEXT ROUND: Do not commit after your utility alone — send the dog through the alternate line or ask a teammate to trade-window peek, wait for audio/camera confirmation, then entry on that confirmation; if no info, reset and pressure Garage from Connector instead."
  },
  {
    "agent": "Brimstone",
    "map": "Bind",
    "side": "defense",
    "location": "A Short",
    "lang": "en",
    "title": "A Short Anchor",
    "deathAnalysis": "DEATH CAUSE: You left A Short anchor too early and died; holding Heaven/Lamps crossfire collapsed because nobody replaced your angle — stay at A Short until either a teammate physically peeks Bath or you hear teleporter/footstep info that validates a rotate.",
    "enemyPatterns": "ENEMY READ: From this round's outcome, the attacker punished early A Short abandonment by exploiting the unguarded Short-to-Heaven corridor and entry swing.",
    "nextRoundPlan": "NEXT ROUND: Remain on A Short anchor until a concrete trigger (teammate calls ‘Bath clear’ OR you hear teleporter/short footsteps); if you must rotate, verbally call ‘rotating now’ and delay by 0.5–1s so a teammate can shift into the Short angle."
  },
  {
    "agent": "Astra",
    "map": "Pearl",
    "side": "defense",
    "location": "B Link",
    "lang": "en",
    "title": "B Link — Late Smoke",
    "deathAnalysis": "DEATH CAUSE: You died at B Link because your smoke timing was late — you entered the choke after the smoke should have blocked sight, exposing your body; instead of creating space you walked into a prepared angle. Plant your star and call \"smoke now\" so the Nebula lands before you commit; if the smoke isn't down by the time you reach the corner, stop 1m back and force a jiggle for info rather than full entry.",
    "enemyPatterns": "ENEMY READ: The defender is holding the B Link choke pre-aimed to punish late utility — that angle rewards shooting a visible silhouette through delayed smokes.",
    "nextRoundPlan": "NEXT ROUND: place the star on B Link during buy, call the smoke timer out loud to teammates, and only step into the choke once the Nebula is visibly deployed; if it isn’t, fall back and take a jiggle or wait for trade."
  },
  {
    "agent": "Gekko",
    "map": "Sunset",
    "side": "attack",
    "location": "B Market",
    "lang": "en",
    "title": "B Market positioning error",
    "deathAnalysis": "At B Market you lurk ederken arkadan yakalandı; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds B Market and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before B Market, then commit together with a teammate."
  },
  {
    "agent": "Yoru",
    "map": "Icebox",
    "side": "attack",
    "location": "Mid Boiler",
    "lang": "en",
    "title": "Mid Boiler positioning error",
    "deathAnalysis": "At Mid Boiler you teleport sonrası takipsiz agresyon; you fell before any trade. Enter with a teammate and share the first contact.",
    "enemyPatterns": "The defender pre-holds Mid Boiler and punishes the first angle.",
    "nextRoundPlan": "Use a smoke or flash before Mid Boiler, then commit together with a teammate."
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
    "title": "Wrong Wall Timing — Fix It",
    "deathAnalysis": "DEATH CAUSE: You opened Toxic Screen in A Hall while your team was still committing, which left the screen active when defenders swung — you were blind and died; fix by opening the wall only as the first teammate steps through the Hall and immediately closing it after your team clears the immediate angle, because the wall must not block your own sightline during entry.",
    "enemyPatterns": "ENEMY READ: That A Hall angle punishes Vipers who expose themselves behind a late-opening wall — defenders swing into the blindgap created when the screen is active.",
    "nextRoundPlan": "NEXT ROUND: Hold the wall closed pre-entry, call 'I open' and trigger the Toxic Screen the instant teammate 1 crosses the Hall threshold, then close it as you clear the first box; if you need sustained cover, open a slightly shifted wall (10–15°) toward the corner to avoid blocking your own peek."
  }
];
export const FEEDBACK_BANK: Record<"tr" | "en", FeedbackExample[]> = { tr: FEEDBACK_BANK_TR, en: FEEDBACK_BANK_EN };
