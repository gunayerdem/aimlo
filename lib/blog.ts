/* ══════════════════════════════════════════════════════════
   AIMLO — BLOG (tek kaynak)
   ──────────────────────────────────────────────────────────
   KURALLAR:
   1) UYDURMA VERİ YASAK. "X maç analizine göre", "oyuncuların %Y'si"
      gibi sahip olmadığımız istatistik BURAYA YAZILMAZ. Sayı vermek
      gerekiyorsa yalnız oyunun kendi sabitleri (kredi rakamları,
      yetenek süreleri, callout'lar) — hepsi knowledge/ ile doğrulanmış.
   2) TARİH SABİT METİN DEĞİL. Her yazının ISO `publishedAt` alanı var;
      ekranda görünen "3 gün önce / 1 ay önce" runtime'da hesaplanır
      (relativeTime). Böylece aylar sonra da doğru kalır.
   3) Koç sesi: düzgün emir kipi, tarzanca yok, yetenek kod-adı yok.
   ══════════════════════════════════════════════════════════ */

export type BlogLang = "tr" | "en";

/** Dile göre çözülen metin çifti. */
export type Localized = { tr: string; en: string };

export type BlogPost = {
  /** URL segmenti — /blog/<slug> */
  slug: string;
  /** Sabit ISO yayın tarihi. Görüntülenen "x önce" bundan türetilir. */
  publishedAt: string;
  /** Kart aksan rengi. */
  color: string;
  /** Okuma süresi (dakika). Etiket dile göre üretilir. */
  readMinutes: number;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  /** Gövde — "## " başlık, "### " alt başlık, **kalın** destekli düz metin. */
  body: Localized;
};

/* ──────────────────────────────────────────────────────────
   YAZILAR — yeniden eskiye doğru sıralı tutulur.
   Yeni yazı eklerken: en üste ekle, publishedAt'i gerçek yayın
   gününe ayarla. Haftada 1-3 yazı hedefi.
   ────────────────────────────────────────────────────────── */
export const POSTS: BlogPost[] = [
  {
    slug: "gold-diamond-pozisyonlama",
    publishedAt: "2026-07-20T06:00:00.000Z",
    color: "#FF4655",
    readMinutes: 5,
    category: { tr: "Rank Rehberi", en: "Rank Guide" },
    title: {
      tr: "Gold'dan Diamond'a: Pozisyonlamanın 5 Kırılma Noktası",
      en: "Gold to Diamond: The 5 Positioning Breakpoints",
    },
    excerpt: {
      tr: "Aim'in yeterli ama round'ları hâlâ kaybediyorsan sorun nişan değil, nerede durduğun. Beş somut hata ve her birinin karşılığı.",
      en: "If your aim is fine but you keep losing rounds, the problem is where you stand, not how you shoot. Five concrete mistakes and their fixes.",
    },
    body: {
      tr: `Gold ile Diamond arasındaki fark çoğu zaman nişan değil, karar. Aynı silah, aynı harita, aynı süre — fark, kavgaya hangi şartlarla girdiğin. Aşağıdaki beş hata, düzelttiğinde tek başına round kazandıran hatalar.

## 1. Aynı Açıdan İkinci Peek

Bir açıdan peek attın, kimseyi vuramadın ve iki saniye sonra aynı yerden tekrar çıkıyorsun. Rakip seni görmediyse bile sesini duydu ve nişanını oraya sabitledi. İkinci peek'te kavgayı sen değil o başlatır.

**Ne yap:** Her peek'ten sonra yer değiştir. Aynı hattı tutacaksan bile yüksekliğini veya mesafeni değiştir — çömel, geri çekil, ikinci bir kutunun arkasından çık. Aynı pikselden çıkmak bedava ölümdür.

## 2. Sadece Bilinen Açıları Tutmak

Her haritanın herkesin bildiği "default" noktaları vardır. Rakip site'a girerken önce oralara bakar. Sen orada duruyorsan kavgayı hazır nişanla karşılarsın.

**Ne yap:** Her haritada üç alternatif açı öğren ve round'lar arasında bunları değiştir. Ascent A'da Heaven yerine Generator arkası, Split'te A Ramp'ın yan hattı gibi. Amaç sürpriz değil, tahmin edilemezlik — rakip nereye bakacağını bilmediği an tempo sende.

## 3. Trade Mesafesini Kaçırmak

Giriş yapan arkadaşından çok uzaktaysan onu tradeleyemezsin; çok yakınsan aynı utility ikinizi birden alır. İkisi de round kaybettirir.

**Ne yap:** Giriş yapanın hemen arkasında değil, farklı bir açıdan destek verebileceğin yerde dur. Ölçü basit: o düştüğünde açıya bir-iki saniye içinde bakabiliyorsan doğru mesafedesin.

## 4. Nişanın Yanlış Yükseklikte

Yere ya da duvarın ortasına bakarak koşuyorsan, düşmanı gördüğün an önce nişanını kaldırman gerekir. O düzeltme süresi kavganın tamamıdır.

**Ne yap:** Nişanı her zaman baş hizasında tut ve bir sonraki açının kenarına yasla. Yürürken bile önündeki köşeyi önceden nişanla. Bu, refleksle değil alışkanlıkla düzelir; özel oyunda on beş dakika yürüyerek çalış.

## 5. Sesi Bilgi Olarak Kullanmamak

Adım, şarjör değiştirme, yetenek sesi — hepsi bedava bilgi. Sesi kısıp müzik açan oyuncu, haritanın yarısını kör oynuyor demektir.

**Ne yap:** Round başında iki-üç saniye dur ve dinle. Duyduğunu takıma söyle: "B'de iki kişi" cümlesi bir kill'den daha çok round kazandırır.

## Toparlarsak

Bu beşi düzeltmek yeni bir mekanik öğrenmeyi gerektirmiyor — sadece aynı round'u farklı yerde durarak oynamayı gerektiriyor. AIMLO tam olarak burada devreye giriyor: her round sonunda nerede öldüğünü ve o ölümün hangi kalıba girdiğini gösteriyor, böylece tekrar eden hatayı tahmin etmek zorunda kalmıyorsun.`,
      en: `The gap between Gold and Diamond is usually decision-making, not aim. Same weapon, same map, same timer — the difference is the terms on which you enter the fight. These five mistakes win rounds on their own once you fix them.

## 1. The Second Peek From the Same Angle

You peeked, hit nothing, and two seconds later you step out from the exact same spot. Even if they did not see you, they heard you and parked their crosshair there. On the second peek, they start the fight, not you.

**Do this:** Move after every peek. Even if you hold the same line, change your height or your distance — crouch, back off, come out from behind a different box. Repeeking the same pixel is a free death.

## 2. Only Holding Known Angles

Every map has default spots everyone knows. Attackers clear those first. Standing there means meeting the fight against a crosshair that is already aimed.

**Do this:** Learn three alternative angles per map and rotate through them between rounds. Behind Generator instead of Heaven on Ascent A, the side line off A Ramp on Split. The goal is not surprise but unpredictability — the moment they do not know where to look, the tempo is yours.

## 3. Missing Trade Distance

Too far from your entry and you cannot trade him; too close and one piece of utility takes you both. Either way the round is gone.

**Do this:** Support from a different angle rather than directly behind the entry. The test is simple: if you can look at his angle within a second or two of him going down, your spacing is right.

## 4. Crosshair at the Wrong Height

If you run looking at the floor or mid-wall, you have to lift your aim the moment you see someone. That correction time is the whole duel.

**Do this:** Keep the crosshair at head level and pinned to the edge of the next angle. Pre-aim the corner ahead of you even while walking. This improves through habit, not reflexes — spend fifteen minutes walking a custom game.

## 5. Not Treating Sound as Information

Footsteps, reloads, ability sounds — all free information. A player who mutes the game and plays music is playing half the map blind.

**Do this:** Stop and listen for two or three seconds at the start of the round. Then call it: "two on B" wins more rounds than a kill does.

## The Short Version

None of these require learning a new mechanic — only playing the same round from a different place. That is exactly where AIMLO fits: after each round it shows you where you died and which pattern that death belongs to, so you do not have to guess at your own repeating mistake.`,
    },
  },

  {
    slug: "duelist-secimi-kit-ve-harita",
    publishedAt: "2026-07-19T17:00:00.000Z",
    color: "#4D7CFF",
    readMinutes: 7,
    category: { tr: "Ajan Rehberi", en: "Agent Guide" },
    title: {
      tr: "Duelist Seçimi: Kit'e Göre Harita Eşleştirmesi",
      en: "Picking a Duelist: Matching the Kit to the Map",
    },
    excerpt: {
      tr: "Hangi duelist 'daha iyi' değil — hangisi bu haritada işini görüyor? Jett, Raze, Waylay, Iso ve Neon'un kitlerini alan tipine göre eşleştiriyoruz.",
      en: "Not which duelist is better, but which one fits this map. Matching Jett, Raze, Waylay, Iso, and Neon to the kind of space you have to open.",
    },
    body: {
      tr: `Duelist seçerken sorulacak soru "hangisi güçlü" değil, "bu haritada hangi alanı açmam gerekiyor". Kitler farklı problemleri çözüyor; haritanın sana çıkardığı problemi çözen ajanı seç.

## Önce Alanı Tanı

Her giriş noktası üç tipten birine girer:

- **Uzun hat:** Geniş, açık, uzaktan tutuluyor. Ascent A Main, Haven A Long.
- **Dar geçit:** Tek sıra girilen kapı ya da koridor. Split B Main, Haven Mid Doors.
- **Dikey giriş:** Yükseklik farkı belirleyici. Split A Ramp ve Tower, Ascent Heaven.

Bunu belirlemeden ajan seçmek kumar.

## Jett — Uzun Hat Ajanı

Jett'in işi boşluğu hızla kapatmak ve düello kaybedince mesafe açmak. Uzun hatta parlar: dumanı kendisi koyar, hatta girer, tutmazsa geri kayar. Dar geçitte ise kaçış alanı olmadığı için avantajı erir. Uzun mesafeli silahla oynuyorsan Jett'in hareket kabiliyeti o silahın en iyi tamamlayıcısıdır.

## Raze — Dar Geçit Ajanı

Raze dar alanda düşmanı yerinden söker. Patlayıcıları köşede bekleyen oyuncuyu bulunduğu yerde tutamaz hale getirir; hareket yeteneği ise koridorda beklenmedik hızla mesafe kapattırır. Split ve Icebox gibi sıkışık haritalarda mantıklı; geniş, açık hatlarda patlayıcıların etkisi dağılır.

## Waylay — Kısa Ömürlü Sigortayla Giriş

Waylay hızla girer, ilk öldürmeyi alır, tutmazsa geri kayar. Kitin iki kuralını bilmezsen ajan çalışmaz:

- Geri-kayma noktası bırakıldıktan **8 saniye** sonra kendiliğinden kaybolur. Yani round başında bırakılan nokta sen temas kurmadan silinir — noktayı peek'in hemen eşiğinde bırak.
- Dash tek kullanımlıktır; normal atışla çift patlama, alternatif atışla tek. İkincisini sonraya saklayamazsın, kararı basmadan önce verirsin.
- Ult'a değen düşman **6 saniye** yavaş hareket eder, yavaş ateş eder, yavaş şarjör değiştirir; sana da **7 saniye** hız verir. Hasar vermez — bu bir giriş penceresidir, bir bitirici değil.

Bu yüzden Waylay dar ve dikey girişlerde iyi: pencere açıkken site'a ilk sen girersin.

## Iso — Düello Ajanı

Iso alan açmaz, düello kazanır. Kendine kalkan üreterek karşılıklı çatışmayı tek taraflı hale getirir. Takımın giriş sorunu değil de "açıyı temizleyemiyoruz" sorunu varsa Iso mantıklı. Beş kişiyi aynı anda site'a sokman gereken haritalarda ise yetersiz kalır.

## Neon — Tempo Ajanı

Neon haritayı hızla kat eder ve savunmanın kurulmasına vakit bırakmaz. Uzun rotasyonlu haritalarda hızlı basış planlarının merkezi olur. Buna karşılık koşarken doğruluğun düşer — hız senin lehine çalışacaksa varış anında durmayı öğrenmen gerekir.

## Pratik Kural

Takımında giriş açan kimse yoksa Jett, Raze, Waylay ya da Neon'dan **haritanın alan tipine uyanı** al. Giriş zaten açılıyor ama açılar temizlenemiyorsa Iso'yu düşün. Ajan seçimi bir moda değil, bir problem eşleştirmesi.`,
      en: `The question when picking a duelist is not "who is strong" but "what space do I have to open on this map". Kits solve different problems; pick the agent who solves the one the map hands you.

## Identify the Space First

Every entry falls into one of three types:

- **Long line:** wide, open, held from range. Ascent A Main, Haven A Long.
- **Tight choke:** a door or corridor entered single file. Split B Main, Haven Mid Doors.
- **Vertical entry:** height decides the fight. Split A Ramp and Tower, Ascent Heaven.

Picking an agent before you classify this is a gamble.

## Jett — The Long-Line Agent

Jett closes distance fast and creates space again when a duel goes wrong. She shines on long lines: she places her own smoke, takes the line, and slides back out if it does not hold. In a tight choke that advantage evaporates because there is nowhere to disengage to. If you play a long-range weapon, her mobility is its best complement.

## Raze — The Choke Agent

Raze dislodges players in tight space. Her explosives make holding a corner untenable, and her movement closes corridor distance at an unexpected speed. She makes sense on cramped maps like Split and Icebox; on wide open lines the explosives lose their bite.

## Waylay — Entry With a Short-Lived Safety Net

Waylay dives in, takes the opening kill, and slides back if it does not land. The kit does not work unless you know two rules:

- The recall point disappears on its own **8 seconds** after you drop it. A point dropped at round start is gone before you make contact — drop it right on the threshold of your peek.
- The dash is single-use: a double burst on primary fire, a single on alternate. You cannot bank the second one; you decide before you press.
- Enemies caught by the ult move, shoot, and reload slowly for **6 seconds**, and you get **7 seconds** of haste. It deals no damage — it is an entry window, not a finisher.

That is why Waylay fits tight and vertical entries: while the window is open, you enter the site first.

## Iso — The Dueling Agent

Iso does not open space; he wins duels. Generating a shield turns an even fight one-sided. If your team's problem is not entering but clearing angles, Iso makes sense. On maps where you must land five players on site at once, he falls short.

## Neon — The Tempo Agent

Neon crosses the map fast and denies the defense time to set up. On maps with long rotations she becomes the centerpiece of fast-hit plans. The tradeoff is accuracy while sprinting — if speed is going to work for you, you have to learn to stop on arrival.

## The Practical Rule

If nobody on your team opens space, take whichever of Jett, Raze, Waylay, or Neon **matches the map's space type**. If entries already land but angles never get cleared, consider Iso. Agent choice is a problem match, not a fashion.`,
    },
  },

  {
    slug: "kredi-yonetimi-buy-karari",
    publishedAt: "2026-07-18T13:00:00.000Z",
    color: "#2ECC71",
    readMinutes: 8,
    category: { tr: "Strateji", en: "Strategy" },
    title: {
      tr: "Valorant Ekonomisi: Hangi Kredide Ne Alınır",
      en: "Valorant Economy: What to Buy at Which Credit Level",
    },
    excerpt: {
      tr: "Alım kararı zevk meselesi değil, eşik meselesi. Kayıp bonusu, force sınırları, save mantığı ve takım alımının neden bireysel alımdan önce geldiği.",
      en: "The buy is not a matter of taste, it is a matter of thresholds. Loss bonus, force limits, when to save, and why the team buy comes before yours.",
    },
    body: {
      tr: `Valorant'ta round'ları kaybettiren şeylerin bir kısmı nişanla ilgili değil. Yanlış round'da alınan tüfek, yanlış round'da saklanan para, tek başına yapılan alım — bunların hepsi kavga başlamadan round'u zorlaştırır. İyi haber şu: ekonomi tahmin edilecek bir şey değil, sabit rakamları olan bir sistem. Rakamları bilirsen karar kendiliğinden çıkar.

## Önce Gelirin Nereden Geldiğini Bil

Bunlar oyunun sabitleri:

- Round kazandın: **3.000** kredi.
- Round kaybettin: **1.900** + kayıp bonusu.
- Kayıp bonusu üst üste kayıpta artar: 1. kayıp **+0** (1.900), 2. kayıp **+500** (2.400), 3. ve sonrası **+1.000** (2.900). Bir round kazandığın an sıfırlanır.
- Spike diktiysen, round'u kaybetsen bile saldıran takımın **herkesine +300**.
- Her kill **200** kredi — silah fark etmez, bıçakla bile aynı.
- Devre arasında herkes **800**'e döner; birikim taşınmaz.
- Overtime'da her round herkese sabit **5.000** verilir ve taşınmaz.

Bu liste ekonominin tamamı. Geri kalan her şey bu rakamların üstüne kurulan karar.

## Alım Eşikleri

Kendi kredine değil, **takım ortalamasına** bak. Karar sırası şöyle:

**4.500 ve üzeri → tam alım.** Tüfek 2.900 + ağır kalkan 1.000 = 3.900; üstüne yetenek. Ateş gücün rakiple en az eşit, round'u nişanınla oynarsın.

**3.900–4.499 → tam alım, bir-iki yetenek kes.** Silah ve kalkan pazarlık konusu değil; kesilecek yer yetenek.

**3.000–3.899 → force mu, save mi?** Kayıp serine bak. İkinci ya da üçüncü kaybındaysan force at — kaybetsen bile 2.400 veya 2.900 geliyor, yani gelecek round'u yakmıyorsun. Birinci kaybındaysan save et, bir sonraki round'da tam alıma çık.

**2.000–2.999 → eco.** İstisnaları var: kayıp bonusun tavandaysa force'u düşün, rakip de eco ya da yarım alımdaysa yarım alımla bas.

**2.000 altı → tam save.** Rakip tam silahlıysa hiçbir şey alma, Classic'le oyna. Rakip de zayıfsa yarım alımla baskı yap — iki taraf da fakirken round çevrilebilir, tam save çeviremez.

Tek istisna devrenin son round'u: krediler devre arasında sıfırlandığı için taşıdığın her kuruş yanar. O round elindeki her şeyi harca. Aynısı maç noktasında geride olduğun round için de geçerli — "sonraki round" diye bir şey yoksa save anlamsızdır.

## Kalkanı Doğru Hesapla

Hafif kalkan **400** krediye **25** HP, ağır kalkan **1.000** krediye **50** HP verir. HP başına maliyet hafif kalkanda 16, ağırda 20. Yani ucuz round'da Ghost (500) + hafif kalkan (400) toplam 900 krediye makul bir paket çıkarır. Tam alımda ise ağır kalkan tartışılmaz: 50 HP, bir mermilik farkı senin lehine çevirir.

Tam save'de kalkan bile alma. O 400 kredi, sonraki round'un tüfeğinden çalınmış demektir.

## Takım Alımı Bireysel Alımdan Önce Gelir

Ekonominin en pahalı hatası bölük alım: dört kişi save ederken bir kişinin tüfek alması. O round takım 4v5 silah dezavantajıyla oynar ve tek tüfek bunu kapatmaz. Ölürsen tüfek de rakibe geçer, yani kaybı ikiye katlarsın.

Kural basit: **ya hep beraber al, ya hep beraber save.** Alım öncesi beş oyuncunun kredisine bak; üç veya daha fazlası tam alım yapamıyorsa takım save eder.

Bir de silah atmayı unutma. Elinde 6.000+ kredi varsa ve takım arkadaşının 2.500'ü varsa, o tüfek onun elinde daha değerli. Sen zaten alacaksın; o alamayacak.

## Silahını Kurtarmak da Bir Kazançtır

Savunmadasın, spike dikildi, sayıca ve yetenek olarak geridesin. Retake'e girmek round'u kurtarmıyor, üstüne tüfeğini de yutuyor. Haritanın uzak çıkışından ayrıl, tüfek ve kalkanı sonraki round'a taşı — kurtarılan tüfek 2.900'lük bir alımı siler.

Sayı ve yetenek denkse retake'e gir; düello kazandıysan yerdeki tüfeği al. Aynı mantık tersinden de çalışır: rakibin bıraktığı üç tüfeği topladıysan rakip 8.700 kredilik alımı yeniden yapmak zorunda, sen bedava girersin. Yerdeki silahı almak, round kazanmaya yakın değerde.

## Rakibin Cebini Oku

Rakibin kredisini göremezsin ama hesaplayabilirsin. Geçen round kaç kill aldılar (her biri 200), round'u kazandılar mı (3.000 mi 1.900+bonus mu), geçen round pahalı bir şey aldılar mı. Pistol'ü kazanan takım ikinci round'a yaklaşık 3.800 ile girer — yani SMG ve hafif kalkan alırlar. Bunu bilirsen o round yakın mesafe vermezsin, mesafe tutup tek atışa oynarsın.

## Spike Bir Gelir Kalemidir

Ucuz round'da round'u kill için değil plant için oyna. Hep birlikte tek site'a git, spike'ı dik, kalanını çapraz açıyla tut. Round'u kaybetsen bile beş kişiye **+300** gelir ve rakip retake için yetenek yakar. Force silahıyla uzun açı kuramazsın — spike'ı siper arkasından yakın tut, defuse sesine oyna.

## Toparlarsak

Ekonomi, kavgadan önce verilen kararların toplamı. Takım ortalamasına bak, kayıp serini say, eşiği uygula ve alımı takımla birlikte yap. Bu dört adımı oturttuğun an, hiçbir nişan çalışması yapmadan round kazanmaya başlarsın.`,
      en: `Some of what loses you rounds in Valorant has nothing to do with aim. A rifle bought in the wrong round, money saved in the wrong round, a buy made alone — each one puts you behind before the fight starts. The good news: the economy is not something to guess at, it is a system with fixed numbers. Learn the numbers and the decision makes itself.

## Know Where the Income Comes From

These are game constants:

- Round won: **3,000** credits.
- Round lost: **1,900** plus the loss bonus.
- The loss bonus climbs on consecutive losses: first loss **+0** (1,900), second **+500** (2,400), third and beyond **+1,000** (2,900). It resets the moment you win a round.
- If you planted the spike, **every attacker gets +300** even in a lost round.
- Every kill is **200** credits, whatever the weapon, knife included.
- At halftime everyone resets to **800**; savings do not carry over.
- In overtime every player gets a flat **5,000** each round, and it does not carry over either.

That list is the whole economy. Everything else is a decision built on top of those numbers.

## The Buy Thresholds

Look at the **team average**, not your own wallet. The order of decisions:

**4,500 and up → full buy.** Rifle 2,900 + heavy shield 1,000 = 3,900, abilities on top. Your firepower is at least even, and you play the round with your aim.

**3,900–4,499 → full buy, cut an ability or two.** The weapon and the shield are not negotiable; the abilities are where you trim.

**3,000–3,899 → force or save?** Check your loss streak. On a second or third straight loss, force — even if you lose, 2,400 or 2,900 is coming, so you are not burning next round. On a first loss, save and come back with a full buy.

**2,000–2,999 → eco.** With exceptions: if your loss bonus is maxed, consider forcing; if they are on an eco or half buy too, push with a half buy.

**Under 2,000 → full save.** Against a fully armed enemy, buy nothing and play the Classic. If they are weak too, apply pressure with a half buy — when both sides are poor a round can be flipped, and a full save flips nothing.

One exception is the last round of the half: credits reset at halftime, so every credit you carry burns. Spend everything. The same applies when you are behind on match point — if there is no next round, saving is meaningless.

## Do the Shield Math

A light shield is **25** HP for **400** credits; a heavy is **50** HP for **1,000**. That is 16 credits per HP on light, 20 on heavy. So on a cheap round a Ghost (500) plus light shield (400) makes a reasonable 900-credit package. On a full buy the heavy is not up for debate: 50 HP turns a one-bullet margin in your favor.

On a full save, skip the shield too. That 400 is stolen from next round's rifle.

## The Team Buy Comes First

The most expensive mistake in the economy is the split buy: four players saving while one buys a rifle. That round the team plays a 4v5 in firepower, and a single rifle does not close it. Die and the rifle goes to them, doubling the loss.

The rule is simple: **buy together or save together.** Check all five wallets before buying; if three or more cannot afford a full buy, the team saves.

And do not forget to drop weapons. If you have 6,000+ and a teammate has 2,500, that rifle is worth more in his hands. You were buying anyway; he was not.

## Saving Your Gun Is Also a Win

You are defending, the spike is down, and you are behind on numbers and utility. Retaking does not save the round, and it eats your rifle too. Leave through the far exit and carry the rifle and shield into the next round — a saved rifle erases a 2,900 purchase.

If numbers and utility are even, retake; if you win the duel, pick up the rifle on the ground. The logic works in reverse too: collect three of their dropped rifles and they have to spend 8,700 again while you enter for free. Picking up a gun is worth nearly as much as winning the round.

## Read Their Wallet

You cannot see their credits, but you can compute them. How many kills did they get last round (200 each), did they win it (3,000 versus 1,900 plus bonus), did they buy something expensive. A team that wins the pistol enters round two with roughly 3,800 — meaning an SMG and a light shield. Knowing that, you refuse close range that round, hold distance, and play for the single shot.

## The Spike Is Income

On a cheap round, play for the plant rather than for kills. Go to one site together, plant, and hold the rest from a crossfire. Even in a lost round, five players collect **+300** and they burn utility on the retake. A force weapon cannot hold long angles — keep the spike close, behind cover, and play the defuse sound.

## The Short Version

The economy is the sum of decisions made before the fight. Check the team average, count your loss streak, apply the threshold, and buy with your team. Get those four right and you start winning rounds without touching your aim.`,
    },
  },

  {
    slug: "ascent-b-site-anchor",
    publishedAt: "2026-07-18T09:00:00.000Z",
    color: "#B44DFF",
    readMinutes: 6,
    category: { tr: "Harita Rehberi", en: "Map Guide" },
    title: {
      tr: "Ascent B Site: Anchor Rehberi",
      en: "Ascent B Site: The Anchor Guide",
    },
    excerpt: {
      tr: "B Main, B Link ve Market — üç giriş, tek anchor. Hangi açıyı ne zaman tutacağını ve kapıyı plana nasıl katacağını anlatıyoruz.",
      en: "B Main, B Link, and Market — three entries, one anchor. Which angle to hold when, and how to fold the door into your plan.",
    },
    body: {
      tr: `Ascent mid-merkezli bir harita: Mid'den hem A'ya hem B'ye geçiş var ve mid'i tutan taraf her yere rotasyon yapabilir. B'yi tutan oyuncu için bu şu demek — mid kaybedilirse B'ye baskı iki yönden gelir.

## Üç Giriş, Tek Kişi

B site'a üç yoldan girilir: **B Main**, **B Link** ve **Market**. Tek anchor olarak üçünü aynı anda tutamazsın; amacın öldürmek değil, gecikme yaratmak ve doğru bilgiyi vermek.

B Main dar bir koridordur. Saldıran taraf oraya yığılırsa tek sprey ile birden fazlasını almak mümkün — ama bunu ancak açıya önceden nişanlıysan yapabilirsin.

## Pozisyon Seçimi

**Yüksekten bakan hat.** Hem B Main'i hem site içini görür. En güvenli, en yaygın ve tam da bu yüzden en çok temizlenen nokta. Round'un ilk yarısında iyi, tekrar tekrar kullanılınca kötü.

**Kapalı yapının içi.** İçeri girenlerin arkasına düşersin. Tuzak ya da kamera ile birlikte çalışır: bilgi seni uyarır, sen açıyı arkadan alırsın.

**Site ortasındaki kutu hattı.** Çömelerek beklemek düşük yüksekliğe bakmayan oyuncuyu cezalandırır. Tek başına değil, takım rotasyonu yolda iken zaman kazanmak için kullan.

## Kapıyı Plana Kat

Ascent'in imzası iki mekanik kapı: biri Garden'dan A'ya inen geçidi, diğeri savunma tarafından B'ye giren arka geçidi kapatır. Panelden açılıp kapanır, kurşunla kırılır. Kırmak **ses verir, zaman yer ve o round kapı geri gelmez.**

Savunmada erken kapat — flank yolunu kesersin. Bomba kurulduktan sonra B kapısını kapatmak retake yolunu uzatır, bedava saniye kazandırır. Kapalı kapıya güvenip arkasında dikilme; kapı kırılır, sen hazırlıksız yakalanırsın.

## Ajan Notları

- **Killjoy:** Bilgi araçlarını üç girişe böl, hasar veren aracını site ortasına sakla. Ult'u sayısal dezavantajda retake'i çevirir.
- **Cypher:** Tuzakları Market ve B Main'e, kamerayı içeriyi gören hatta koy. Bomba kurulduktan sonraki bilgi paha biçilmez.
- **Chamber:** Anchor'unu round başında yerleştir, açıyı tut, tek atış yap, çekil. Round ortasında anchor taşıma — hem gecikirsin hem yerini ele verirsin.
- **Sage:** Yavaşlatmayı B Main girişine at, duvarı execute anında sakla. Retake'te duvar bir kişiyi değil, tüm zaman çizelgesini değiştirir.

## Anchor Disiplini

Tek kill aldıktan sonra pozisyonunu değiştir ya da çağrını yap. Bir kill site'ı tutmaz; tuttuğunu sanıp aynı yerde kalmak ikinci ölümdür. Duyduğunu söyle, kalan süreyi takımın rotasyonuna çevir.

Rotasyon çağrısı yaparken tahmin değil ses ver: kaç kişi, hangi girişten. "B'de kalabalık" bir bilgi değil — "B Main'de iki, Market'ten bir" bilgidir.`,
      en: `Ascent is a mid-centric map: mid connects to both A and B, and whoever holds it can rotate anywhere. For the player anchoring B that means one thing — if mid is lost, pressure arrives from two directions.

## Three Entries, One Player

B has three ways in: **B Main**, **B Link**, and **Market**. As a solo anchor you cannot hold all three; your job is not to kill but to create delay and pass accurate information.

B Main is a narrow corridor. If attackers stack into it, one spray can take more than one — but only if you are pre-aimed at the angle.

## Choosing Your Position

**The elevated line.** Sees B Main and the site itself. The safest, most common, and for exactly that reason the most cleared spot. Good early, bad on repeat.

**Inside the enclosed structure.** You end up behind whoever enters. It works alongside a trap or camera: the information warns you, you take the angle from behind.

**The box line mid-site.** Crouching there punishes players who never check low. Use it to buy time while a rotation is on the way, not as a solo hero spot.

## Fold the Door Into the Plan

Ascent's signature is its two mechanical doors: one closes the drop from Garden into A, the other the back entry into B from the defender side. They open from a panel and break to gunfire. Breaking one **makes noise, costs time, and it does not come back that round.**

On defense, close it early to cut the flank. After the spike is planted, closing the B door lengthens the retake path and buys free seconds. Do not stand behind a closed door and trust it — it breaks, and you get caught unprepared.

## Agent Notes

- **Killjoy:** split your information tools across the three entries and save the damage tool for mid-site. The ult flips a retake when you are down bodies.
- **Cypher:** traps on Market and B Main, camera on the line that sees inside. Post-plant information here is priceless.
- **Chamber:** place the anchor at round start, hold the angle, take one shot, disengage. Never move the anchor mid-round — you arrive late and give away your position.
- **Sage:** slow the B Main entry, save the wall for the execute. On a retake the wall does not delay one player, it changes the whole timeline.

## Anchor Discipline

After one kill, change position or make the call. One kill does not hold a site; staying put because you think it does is your second death. Say what you heard and turn the remaining time into a rotation.

Call with sound, not guesses: how many, through which entry. "Lots on B" is not information — "two through B Main, one from Market" is.`,
    },
  },

  {
    slug: "eco-round-3-kural",
    publishedAt: "2026-07-16T09:00:00.000Z",
    color: "#2ECC71",
    readMinutes: 4,
    category: { tr: "Strateji", en: "Strategy" },
    title: {
      tr: "Eco Round'un 3 Kuralı",
      en: "The 3 Rules of the Eco Round",
    },
    excerpt: {
      tr: "Eco, kaybedilmiş round değil — ucuz round. Silah çalmanın, yığılmanın ve kayıp bonusunun matematiğiyle nasıl oynanır?",
      en: "An eco is not a lost round, it is a cheap one. How to play it using stacking, weapon theft, and the loss bonus math.",
    },
    body: {
      tr: `Eco round'unu "zaten kaybettik" diye oynayan takım, bir sonraki round'u da kaybeder. Ucuz round'un görevi belli: ya round'u çal, ya rakibin ekonomisine hasar ver. İkisi de olmuyorsa en azından silahını kurtar.

## Önce Rakamlar

Bunlar oyunun sabitleri, tahmin değil:

- Round kazandığında **3.000** kredi gelir.
- Round kaybettiğinde **1.900** + kayıp bonusu gelir. Bonus üst üste kayıpta **+0 / +500 / +1.000** olarak artar; yani üçüncü kayıpta eline **2.900** geçer.
- Spike diktiysen, round'u kaybetsen bile saldıran takımın herkesine **+300** gelir.
- Her kill **200** kredi — hangi silahla aldığın fark etmez.
- Devre arasında herkes **800** krediye döner; birikim taşınmaz.

Bu tablo eco kararının tamamıdır. Üçüncü kaybındaysan zaten 2.900 geliyor demektir — force atmanın riski düşer. Birinci kaybındaysan save daha mantıklıdır.

## Kural 1: Yığıl ve Bekle

Eco'da açık alanda dövüşme. Beş kişi beş ayrı yerdeyse beş ayrı 1v5 oynarsınız. Beş kişi bir girişte bekliyorsa rakip tam alımlı da olsa o girişte sayı üstünlüğü sizde olur.

Rakip tam alımdayken agresif peek atar — bunu bilerek bekle, ilk hamleyi ona yaptır.

## Kural 2: Silahı Al, Sadece Round'u Değil

Eco'nun asıl kazancı çalınan tüfektir. Aldığın her tüfek bir sonraki round'da senin, olmayan bir tüfek de onun değil. Kill başına gelen 200 kredi de üstüne biner.

Bu yüzden eco'da ölürken bile silahını takımına bırakabileceğin yerde öl — spawn'a doğru değil, arkadaşının geçeceği hatta.

## Kural 3: Tek Noktaya Basma

Ucuz round'da beklenmezlik en güçlü silahın. Bir-iki kişi ses yapsın, kalanlar sessizce diğer taraftan girsin. Savunma rotasyon yaptığında hedef site zaten alınmış olur.

Bomba dikildiyse round'u kaybetsen bile herkese **+300** geldiğini unutma; ucuz round'da spike dikmek çoğu zaman kill'den kârlıdır.

## Save mi, Force mu?

Takım ortalaması **2.000'in altındaysa** ve rakip tam silahlıysa save et: Ghost (500) ya da Sheriff (800) al, yetenek alma, kalanı sakla. Ortalama **2.200–3.500** arasındaysa kayıp serine bak — ikinci ya da üçüncü kaybındaysan force kârlıdır.

Rakip de eco ya da yarım alımdaysa tam save yapma; iki taraf da zayıfken baskı round'u çevirir.`,
      en: `A team that plays the eco as "we already lost this one" loses the next round too. The cheap round has a clear job: either steal the round or damage their economy. If neither happens, at least save your gun.

## The Numbers First

These are game constants, not estimates:

- Winning a round pays **3,000** credits.
- Losing pays **1,900** plus the loss bonus, which climbs **+0 / +500 / +1,000** on consecutive losses — so a third straight loss puts **2,900** in your pocket.
- If you planted the spike, every attacker gets **+300** even in a lost round.
- Every kill is **200** credits, regardless of the weapon.
- At halftime everyone resets to **800**; savings do not carry over.

That table is the entire eco decision. On your third loss you are already getting 2,900, which lowers the risk of forcing. On your first loss, saving is the better play.

## Rule 1: Stack and Wait

Do not fight in the open on an eco. Five players in five places is five separate 1v5s. Five players on one entry gives you the numbers there, even against a full buy.

A fully bought team peeks aggressively — expect it, wait, and make them move first.

## Rule 2: Take the Gun, Not Just the Round

The real profit of an eco is a stolen rifle. Every rifle you take is yours next round and not theirs. The 200 credits per kill stack on top.

So even when you die on an eco, die where your teammate can pick your gun up — on his path, not back toward spawn.

## Rule 3: Do Not Hit One Point

On a cheap round unpredictability is your best weapon. One or two players make noise while the rest walk in quietly from the other side. By the time the defense rotates, the site is already taken.

And remember the **+300** for a plant even in a lost round; on a cheap round, planting is often worth more than a kill.

## Save or Force?

If the team average is **under 2,000** and they are fully armed, save: buy a Ghost (500) or Sheriff (800), skip abilities, bank the rest. Between **2,200 and 3,500**, check your loss streak — on a second or third straight loss, forcing pays.

If they are on an eco or a half buy too, do not full save; when both sides are weak, pressure flips the round.`,
    },
  },

  {
    slug: "ayni-acida-iki-kez-olmek",
    publishedAt: "2026-07-14T15:00:00.000Z",
    color: "#32B8B8",
    readMinutes: 7,
    category: { tr: "Strateji", en: "Strategy" },
    title: {
      tr: "Aynı Açıda İki Kez Ölmek",
      en: "Dying Twice at the Same Angle",
    },
    excerpt: {
      tr: "Tekrar eden pozisyon en pahalı hatadır: pozisyon yanlış değildir, tahmin edilebilir hale gelmiştir. Rakibin nasıl bilgi biriktirdiğini ve zinciri nasıl kıracağını anlatıyoruz.",
      en: "A repeated position is the most expensive mistake: the spot was never wrong, it just became predictable. How opponents accumulate information, and how to break the chain.",
    },
    body: {
      tr: `Aynı round içinde iki kez, ya da üst üste iki round aynı noktada ölüyorsan, o ölümün sebebi neredeyse hiçbir zaman nişan değildir. Pozisyon da çoğu zaman yanlış değildir — zaten iyi olduğu için oraya döndün. Sorun tek kelimeyle şu: **okunmak.**

## Rakip Her Ölümünle Bir Şey Öğrenir

Sen bir açıdan öldüğünde rakip iki bilgi birden alır: nerede durduğunu ve ne zaman çıktığını. Bunlar ücretsizdir, kalıcıdır ve bir sonraki round'a taşınır. Sen o açıya döndüğünde artık eşit bir düelloya girmiyorsun — karşındaki, sen görünmeden önce nişanını oraya almış olarak giriyor.

Bu yüzden tekrar eden pozisyon hatası diğerlerinden pahalıdır. Nişan hatası tek round'u götürür. Zamanlama hatası tek round'u götürür. Okunmak ise düzeltilene kadar **her** round'u götürür ve giderek daha ucuza mal olur, çünkü rakibin hazırlığı birikir.

## Üçüncü Peek Diye Bir Şey Yok

Pratik kural sade: aynı açıyı iki round üst üste tuttuysan, üçüncü round oraya hiç gitme. Rakibin nişanını oraya almış geleceğini varsay ve başka bir noktaya geç. Değişimi rakip karşı hamlesini kurmadan yaparsan hazırlığı boşa gider; sen yeni açıdan bedava bilgi alırsın.

Aynısı round içinde de geçerli. Bir açıdan peek attın, kimseyi vuramadın ve iki saniye sonra aynı yerden tekrar çıkıyorsun. Rakip seni görmese bile sesini duydu. İkinci peek'te kavgayı sen değil o başlatır.

Karşındaki uzun-hat tek-atış silahı tutuyorsa kural daha da sertleşir: o hatta üçüncü peek yok. Ya bir round o açıyı tamamen boş bırak, ya takım dumanı inince farklı bir yükseklikten zorla.

## Çözüm Üç Değişkende

Açıyı bırakmak tek seçenek değil. Aynı hattı tutmaya devam edeceksen, rakibin ezberlediği üç şeyden en az birini değiştir.

**Açı.** Klasik hizadan bir adım kaydırılmış bir noktadan tut. Önceden nişanlayarak gelen rakibin nişanı boşa bakar; o düzeltme süresi senin ilk atış penceresindir. Köşeye yapışık çıkma — bir adım geri açıl ki düşmanlar teker teker görünsün.

**Yükseklik.** Aynı hattı farklı bir yükseklikten tutmak, rakibin ezberlediği nişan hizasını geçersiz kılar. Split bu yüzden öğreticidir: A Tower ve A Ramp arasındaki yükseklik farkı, aynı koridoru tamamen farklı iki düelloya çevirir.

**Zamanlama.** En çok ihmal edileni. Aynı yerden hep aynı saniyede çıkıyorsan, konumunu değiştirmen bile yetmez. Rakibin ayak sesi kesildiği AN çık — o rotasını yeni tamamlamışken, nişanını yeniden kurmak zorunda olduğu pencerede.

## Harita Üstünde Nasıl Görünür

**Split — A Ramp.** Haritanın en yoğun ölüm noktası. Util atmadan çıkarsan A Tower ve A Site'tan gelen iki ayrı açıya aynı anda yürürsün. Burada üst üste ölüyorsan sorun nişan değil; ya çıkmadan flash/duman atmıyorsun ya da her round aynı ritimle çıkıyorsun.

**Ascent — A Main.** Uzun koridorda vücudun tamamen açıkta ve Heaven ile Generator seni aynı anda görüyor. İkinci kez aynı sırayla girmek, savunmacıya kendi planını bir kez daha uygulama fırsatı vermektir. Sırayı boz: rakip önce recon bekliyorsa bu kez önce duman at.

**Haven — C Long ve Platform.** Platform'u kapatmadan karşı tarafa geçiyorsan bedava kafa atışı veriyorsun. Bu ölüm iki kez tekrarlandıysa artık geçişin kendisi değil, geçişin zamanlaması okunmuştur.

## Ya Pozisyon İyiyse ve Yine Ölüyorsan

Bazen pozisyon gerçekten iyidir, değiştirmene rağmen aynı rakibe ölmeye devam edersin. O zaman okunan şey pozisyon değil, alışkanlığın: ayak sesin, yeteneklerini kullanma sıran ya da köşeye yaklaşma mesafen bilgi sızdırıyor.

Bu durumda pozisyonu değil sızıntıyı kapat. O açıya sessiz yürü, yeteneklerini farklı sırayla kullan, köşeye farklı mesafeden yaklaş. Sızıntı kapanınca rakip seni baştan okumak zorunda kalır.

## Trade Mesafesi Zinciri Kırar

Tekrar eden ölümün en sık ikinci sebebi desteksizliktir. Tek başına peek atıp ölüyorsan ölümün boşa gider ve rakip o açıyı bedavaya öğrenir. Peek'ten önce yanındakiyle anlaş: sen geniş açıyla çık, o yan açıda hazır beklesin. Sen düşersen seni vuranı hemen geri alsın.

Ölçü basit: arkadaşın düştüğünde onun açısına bir-iki saniye içinde bakabiliyorsan mesafen doğru. Yan yana durmayın — saldırgan tek peek'le ikinizi birden görürse iki kişilik ateş gücünüz tek kişiye düşer.

## Toparlarsak

Aynı açıda ikinci kez ölmek bir mekanik eksikliği değil, bir bilgi sızıntısıdır. Kural üç maddeye iner: iki round aynı açıysa üçüncüde bırak, bırakamıyorsan açı-yükseklik-zamanlamadan birini değiştir, tek başına aynı hattı tekrar tekrar zorlama.

AIMLO'nun round sonu geri bildirimi tam da bunun için var: ölümün hangi kalıba girdiğini ve aynı kalıbın tekrarlanıp tekrarlanmadığını gösteriyor, böylece kendi tekrarını fark etmek için rakibin okumasını beklemiyorsun.`,
      en: `If you die twice at the same spot — inside one round or across two rounds — the cause is almost never your aim. The position is usually not wrong either; you went back because it was good. The problem is one word: **being read.**

## They Learn Something From Every Death

When you die at an angle, the opponent gets two pieces of information at once: where you stood and when you stepped out. Both are free, both persist, and both carry into the next round. When you return to that angle you are no longer entering an even duel — they arrive with the crosshair already placed before you become visible.

That is why a repeated position costs more than other mistakes. An aim error loses one round. A timing error loses one round. Being read loses **every** round until you fix it, and it gets cheaper for them each time, because their preparation accumulates.

## There Is No Third Peek

The practical rule is plain: if you held the same angle two rounds running, do not go there at all on the third. Assume they will arrive pre-aimed and move somewhere else. Change before they can execute the counter and their preparation is wasted, while you gather free information from a new spot.

The same applies inside a round. You peeked, hit nothing, and two seconds later you step out from the same place. Even if they never saw you, they heard you. On the second peek they start the fight, not you.

If the player holding that line has a long-range one-shot weapon, the rule hardens: no third peek on that line. Either leave the angle empty for a full round, or force it from a different height once your team's smoke lands.

## The Fix Lives in Three Variables

Abandoning the angle is not the only option. If you intend to keep holding the same line, change at least one of the three things they memorized.

**The angle.** Hold from a spot shifted one step off the standard line. A pre-aimed opponent's crosshair now looks at nothing, and their correction time is your first-shot window. Do not hug the corner — open a step back so enemies appear one at a time.

**The height.** Holding the same line from a different elevation invalidates the aim height they learned. Split teaches this well: the gap between A Tower and A Ramp turns one corridor into two completely different duels.

**The timing.** The most neglected one. If you leave the same spot on the same beat every round, changing position alone will not save you. Step out the moment their footsteps stop — while they have just finished a rotation and still have to rebuild their aim.

## What It Looks Like on the Map

**Split — A Ramp.** The deadliest spot on the map. Step out without utility and you walk into two separate angles from A Tower and A Site at once. Repeated deaths here are not an aim problem; either you throw no flash or smoke before going, or you go on the same rhythm every round.

**Ascent — A Main.** In that long corridor your body is fully exposed, and Heaven and Generator see you at the same time. Entering the second time in the same order lets the defender run their plan again. Break the sequence: if they expect recon first, lead with smoke this time.

**Haven — C Long and Platform.** Crossing without closing Platform is a free headshot for them. If that death has repeated, what got read is no longer the cross itself but its timing.

## When the Position Is Genuinely Good

Sometimes the spot really is good and you keep dying to the same player anyway, even after moving. Then what got read is not the position but a habit: your footsteps, the order you use your abilities, or how close you get to the corner.

In that case close the leak, not the position. Walk that approach silently, use your utility in a different order, come at the corner from a different distance. Once the leak is closed they have to read you from scratch.

## Trade Distance Breaks the Chain

The second most common driver of repeated deaths is going in unsupported. Peek alone and die, and your death buys nothing while the opponent learns the angle for free. Agree with a teammate before the peek: you take the wide angle, they wait ready on a side angle. If you go down, they trade immediately.

The test is simple: if you can look at your teammate's angle within a second or two of him falling, your spacing is right. Do not stand side by side — if one peek shows them both of you, two players' worth of firepower collapses into one.

## The Short Version

Dying twice at the same angle is an information leak, not a mechanical gap. It reduces to three lines: after two rounds on an angle, drop it on the third; if you cannot drop it, change the angle, the height, or the timing; and stop forcing the same line alone.

That is precisely what AIMLO's end-of-round feedback is for — it shows which pattern the death belongs to and whether that pattern is repeating, so you notice your own repetition before the opponent does.`,
    },
  },

  {
    slug: "haven-recon-bilgi-oyunu",
    publishedAt: "2026-07-14T09:00:00.000Z",
    color: "#ECB73E",
    readMinutes: 8,
    category: { tr: "Ajan Rehberi", en: "Agent Guide" },
    title: {
      tr: "Haven'da Bilgi Oyunu: Sova ile Üç Site'ı Okumak",
      en: "The Information Game on Haven: Reading Three Sites With Sova",
    },
    excerpt: {
      tr: "Üç site, beş savunucu — her round en az bir site zayıf. Sova'nın tarama ve hasar oklarını doğru sırayla kullanarak o siteyi bulmak.",
      en: "Three sites, five defenders — one is always thin. Using Sova's recon and shock arrows in the right order to find which one.",
    },
    body: {
      tr: `Haven'ın tek farkı üç site — ve bu tek fark her şeyi değiştirir. Savunma beş kişiyle üç noktayı tutmak zorunda, yani **her round en az bir site zayıf kalır.** Sova'nın işi o siteyi kavga başlamadan bulmak.

## Kitin Gerçekleri

Uydurmadan, olduğu gibi:

- Tarama oku konum açar, hasar vermez. **13.00 ile bekleme süresi 60 saniyeden 50 saniyeye indi** — round içinde daha sık tararsın.
- Hasar okları hasar verir, konum açmaz. Elinde iki tane var.
- Drone'u kullanırken gövden savunmasız kalır. Sürdüğün süre kadar açıksın.

Bu üç cümle, ajanın oyun planının tamamı.

## Round Başı: Drone Değil, Ses

İlk beş saniyede drone sürme. Önce dinle. Adım sesi, kapı, yetenek — bedava bilgi varken pil harcamanın anlamı yok. Ses hiçbir şey söylemiyorsa drone'u kısa sür ve gövdeni koruyan bir yere çek.

## Tarama Okunu Nereye

Tarama okunu bilmediğin bir noktaya atma — ok havada vurulur, tarama sıfır olur. Ezberlemen gereken üç aile var:

**Garage ve Mid.** Haritanın kalbi burası. Garage giderse hem Mid Window geçişi hem C Link gider — yani B ve C'ye erişimin kapanır. Round'un ilk taramasını çoğu zaman buraya harcamak doğru.

**A Long.** Haritanın en uzun görüş hattı. Util'siz girdiğin an uzun tutan biri seni bedavaya alır. Taramayı A Long'a atacaksan gireceğin anla eşle — üç saniye önce atılan tarama, sen varana kadar eskimiş olur.

**C Long ve Platform.** C'ye cross yaparken Platform'u kapatmadan geçiyorsan bedava kafa atışı veriyorsun demektir. Tarama Platform'u boş gösteriyorsa cross ucuzdur; göstermiyorsa duman şart.

## Hasar Oklarını Sakla

En sık yapılan hata: iki hasar okunu round ortasında sıradan hasar için harcamak. O okların asıl işi bomba kurulduktan sonra başlar — spike'ın üstüne oturmuş rakibi yerinden kaldıran araç bu. Erken atarsan post-plant kozunu kendi elinle kapatırsın.

Tek ok da yetmez. Etki bittiği anda ikinciyi üstüne yığ; defuse tek okun süresinden uzun sürer.

## Bilgiyi Cümleye Çevir

Tarama bir görüntü verir; takıma bir görüntü söyleyemezsin. Somut konuş: **"C'de iki, biri Platform'da"**. Sayı ve konum içermeyen çağrı bilgi değildir.

## Savunmada Aynı Mantık

Savunmada Haven'ın en büyük hatası aşırı rotasyon. Bir siteye üç kişi giderse kalan iki site açılır — rakip boş siteye girer, round biter. Rotasyon kararını sesle değil bilgiyle ver: tarama ya da drone teyit etmediyse yerinde kal.

Sova'yı iyi oynamak nişanla değil, sıra ile ilgili: önce dinle, sonra tara, sonra gir, hasar oklarını post-plant'e sakla.`,
      en: `Haven's only difference is a third site — and that single difference changes everything. Five defenders have to cover three points, which means **one site is always thin.** Sova's job is to find it before the fight starts.

## What the Kit Actually Does

Plainly, without embellishment:

- The recon arrow reveals positions and deals no damage. **In 13.00 its cooldown dropped from 60 to 50 seconds** — you scan more often per round.
- The shock arrows deal damage and reveal nothing. You have two.
- While you fly the drone your body is exposed. You are vulnerable for as long as you pilot it.

Those three sentences are the agent's whole game plan.

## Round Start: Sound Before Drone

Do not fly the drone in the first five seconds. Listen first. Footsteps, a door, an ability — there is no reason to spend a charge while free information exists. If sound says nothing, fly briefly and from a spot that protects your body.

## Where the Recon Arrow Goes

Never fire a recon arrow at a spot you have not learned — it gets shot out of the air and the scan is worth zero. Three families are worth memorizing:

**Garage and Mid.** The heart of the map. Lose Garage and you lose both the Mid Window crossing and C Link — your access to B and C closes. Spending the round's first scan here is usually correct.

**A Long.** The longest sightline on the map. Walk in without utility and whoever holds it takes you for free. If you scan A Long, time it to your entry — a scan fired three seconds early is stale by the time you arrive.

**C Long and Platform.** Crossing to C without closing Platform is a free headshot for them. If the scan shows Platform empty, the cross is cheap; if it does not, smoke is mandatory.

## Save the Shock Arrows

The most common mistake is spending both shock arrows mid-round as ordinary damage. Their real job starts after the plant — they are the tool that lifts a defuser off the spike. Fire them early and you close your own post-plant option.

One arrow is not enough either. Stack the second the moment the first expires; a defuse outlasts a single arrow.

## Turn Information Into a Sentence

A scan gives you an image, and you cannot say an image to your team. Be concrete: **"two on C, one on Platform."** A call without a number and a place is not information.

## The Same Logic on Defense

Haven's biggest defensive mistake is over-rotating. Send three to one site and the other two open up — they walk into the empty one and the round is over. Base rotations on information, not noise: if a scan or a drone has not confirmed it, stay.

Playing Sova well is about order, not aim: listen, scan, enter, and keep the shock arrows for the post-plant.`,
    },
  },

  {
    slug: "clove-rehberi",
    publishedAt: "2026-07-11T09:00:00.000Z",
    color: "#FF4655",
    readMinutes: 9,
    category: { tr: "Ajan Rehberi", en: "Agent Guide" },
    title: {
      tr: "Clove: Öldükten Sonra da Oynayan Controller",
      en: "Clove: The Controller Who Plays After Dying",
    },
    excerpt: {
      tr: "Öldükten sonra duman atabilen tek controller. Diriliş ult'unun tek şartı, duman ekonomisi ve en sık yapılan altı hata.",
      en: "The only controller who can smoke after death. The single condition on the self-revive, smoke economy, and the six most common mistakes.",
    },
    body: {
      tr: `Clove pasif duman atan bir controller değil. Öldükten sonra bile duman atabiliyorsun — bunu başka hiçbir controller yapamaz. Ama aynı esneklik, ajanı yanlış oynamanın da en kolay yolunu açıyor.

## Kit'in Tek Cümlelik Özeti

Öldükten sonra duman atarsın. Öldürdüğünde kendini iyileştirirsin. Düşmanın canını eriten bir yeteneğin var. Ve ölürsen kendini diriltebilirsin — **ama tek bir şartla.**

## Dirilişin Şartını Ezberle

Diriliş seni canla geri getirir, fakat **dokunulmazlık vermez** ve süre içinde bir öldürme ya da hasarlı asist alamazsan otomatik olarak tekrar ölürsün.

Bunun pratik karşılığı net: dirilişi ancak dönünce gerçekten angaje olabileceğin zaman kullan. Takım hâlâ savaşıyorken, ya da net bir hedef varken. Bomba çoktan kurulmuş ve takım siteden çekilmişken dirilirsen vuracak kimse bulamazsın, süre dolar, ikinci ölümü bedavaya verirsin.

Bir de şu: dirilir dirilmez eski açına dönüp pasif peek atma. Önce korunaklı bir noktaya kay, sonra hedef ara.

## Duman Ekonomisi

Round başında bütün duman yüklerini birden harcarsan, round'un asıl kritik yarısını çıplak geçirirsin. Site alındıktan sonra bombayı korumak için bir dumana, geri alım savunmasında görüşü kesmek için bir dumana ihtiyacın olur.

**Kural:** açılışa yetecek kadar at, en az birini sonraya sakla. Yükler zamanla dolar ama o dolma süresini bekleyecek lüksün her zaman olmaz.

## Ölüm Sonrası Dumanı Nereye

Öldüğün an haritaya bak ve tek soru sor: takımın şu anda açıkta kalan, düşman ateşine maruz tarafı neresi? Dumanı **oraya** at.

En sık israf, zaten kontrol edilen tarafı bir kez daha kapatmak. O duman sıfır değer üretir. Ölümden sonraki tek dumanın en değerli kaynağın — açık tarafı kapatmak takımın kalan oyuncularını hayatta tutar.

## Can Eritmenin Zamanlaması

Can eritme kısa sürer. Ortada dövüş yokken atarsan, düşman temas kurana kadar canı çoktan dolmuş olur. Takımın peek atacağı **anda** at; etki, düşman ateş açarken üstünde dursun.

Aynı şekilde: takımın aktif olarak dövüşmediği düşmanlara atmak boşa harcamaktır.

## Kill Sonrası Geçici Can Tuzağı

Öldürdüğünde gelen iyileşme geçicidir. O canı daha ileri gitmek için değil, **şu anki pozisyonu daha sağlam tutmak** için kullan. Geçici can erirken kendini dezavantajlı bir dövüşün ortasında bulursun.

## En Sık Altı Hata

1. Duman atmadan dövüşe dalmak — öldürme asla dumandan önce gelmez.
2. Diriliş penceresinde angaje olmayıp süre dolunca tekrar ölmek.
3. Ölüm sonrası dumanı zaten güvenli olan tarafa atmak.
4. Can eritmeyi temas yokken erken atmak.
5. Geçici canla daha riskli açılara dalmak.
6. Round başında bütün yükleri harcayıp geç gelişen kavgaya dumansız girmek.

## Özet

Clove'la hem dövüşeceksin hem takımın dumanlarını çıkaracaksın. Sadece dövüşürsen takım dumansız kalır; sadece duman atarsan ajanın saldırgan gücünü çöpe atarsın. Duman atıp ölmek round'a katkıdır — duman atmadan ölmek Clove'u boşa harcamaktır.`,
      en: `Clove is not a passive smoke controller. You can smoke even after dying — no other controller does that. But the same flexibility is also the easiest way to play the agent wrong.

## The Kit in One Sentence

You smoke after death. You heal yourself on a kill. You have an ability that decays enemy health. And you can revive yourself — **on exactly one condition.**

## Memorize the Revive Condition

The revive brings you back with health, but it grants **no immunity**, and if you do not get a kill or a damaging assist within the window, you die again automatically.

The practical translation is clear: only use it when you can genuinely engage on arrival. While the team is still fighting, or when there is a clear target. Revive after the spike is planted and the team has pulled off site and there is nobody to shoot; the timer runs out and you hand over a free second death.

Also: do not return to your old angle and passively peek the moment you come back. Move to cover first, then look for a target.

## Smoke Economy

Burn every smoke charge at round start and you spend the genuinely critical half of the round naked. You will want one smoke to protect the spike after the site is taken, and one to cut vision on a retake.

**The rule:** throw enough for the opening, keep at least one back. Charges refill over time, but you rarely have the luxury of waiting.

## Where the Post-Death Smoke Goes

The moment you die, look at the map and ask one question: which side of your team is exposed to enemy fire right now? Put the smoke **there**.

The most common waste is re-closing a side that is already controlled. That smoke produces zero value. Your one post-death smoke is your most valuable resource — closing the open side keeps your remaining teammates alive.

## Timing the Decay

The decay is short. Thrown with no fight happening, their health is back up before contact. Throw it at the **moment** your team peeks, so the effect is on them while they are shooting.

Likewise: throwing it at enemies your team is not actively fighting is a waste.

## The Temporary Health Trap

The heal you get on a kill is temporary. Use that health to **hold your current position more firmly**, not to push further. When it decays you find yourself mid-fight at a disadvantage.

## The Six Most Common Mistakes

1. Diving into a fight before smoking — the kill never comes before the smoke.
2. Failing to engage in the revive window and dying again on the timer.
3. Spending the post-death smoke on a side that is already safe.
4. Throwing the decay early, before contact.
5. Pushing riskier angles on temporary health.
6. Burning every charge at round start and entering the late fight without smoke.

## Summary

On Clove you fight and you produce your team's smokes. Fight only and the team plays blind; smoke only and you throw away the agent's aggressive half. Dying after you smoked is a contribution to the round — dying before you smoked wastes the pick.`,
    },
  },

  {
    slug: "spike-kurulduktan-sonra",
    publishedAt: "2026-07-10T09:00:00.000Z",
    color: "#32B8B8",
    readMinutes: 8,
    category: { tr: "Strateji", en: "Strategy" },
    title: {
      tr: "Spike Kurulduktan Sonra: Post-Plant ve Retake",
      en: "After the Spike Goes Down: Post-Plant and Retake",
    },
    excerpt: {
      tr: "Plant'ten sonra saat bir tarafın lehine çalışır. Defuse sesinin ne anlattığı, sayı azken uzak açı tutmak ve retake'te util sırası.",
      en: "Once the spike is down, the clock works for exactly one side. What the defuse sound tells you, holding far angles when short-handed, and the retake utility order.",
    },
    body: {
      tr: `Round'un ikinci yarısı spike yere konduğu an başlar. O andan itibaren saat tarafsız değildir: **plant'i koyan taraf tutar, diğer taraf gelmek zorundadır.** Round'u kaybettiren hataların çoğu bu tek cümleyi unutmaktan çıkar.

## Kimin Lehine Çalıştığını Bil

Spike kuruluysa saldıran taraf hiçbir şey yapmak zorunda değil. Peek atmana gerek yok, aramaya çıkmana gerek yok, düello kazanmana gerek yok. Sadece süreyi harcatman yeter.

Savunma tarafı ise tersini yaşar: her saniye aleyhine akar. Bu yüzden retake'te acele etmek doğru değil ama beklemek de mümkün değildir — plan yapıp aynı anda girmek zorundasın.

Pratik karşılığı şu: **saldırıda sabırsızlanan, savunmada plansız koşan kaybeder.**

## Saldırı: Kararı Plant'ten Önce Ver

Kimin nereyi tutacağına spike yere konduktan sonra karar veriyorsan çoktan geç kaldın. Plant biterken herkesin gideceği yer belli olmalı.

Üç temel kural:

**1. Plant biter bitmez yerini değiştir.** Rakip ezberlediği atış noktalarını spike'ın konumuna göre ayarlar. Spike'ın dibinde kalan oyuncu, hiç görülmeden hasar util'i yer.

**2. Çapraz açı kur.** İki oyuncu aynı yönden bakmasın. Defuse'a gelen rakibi iki ayrı noktadan vurabilmelisin — birine dönen diğerine sırtını verir.

**3. En az bir util sakla.** Hasar util'i, duman veya flash olmadan defuse'u durduramazsın. Round'un asıl kritik yarısına elin boş girme.

Plant noktanı da her round aynı tutma. Aynı yere üç kez dikersen dördüncüde rakip hazır atış noktasıyla gelir.

## Defuse Sesi Ne Anlatır

Defuse sesi post-plant'in en değerli bilgisi. Üç şeyi aynı anda söyler: rakip spike'a kilitlendi, konumu belli oldu ve o an savunmasız.

Bu yüzden kural nettir: **defuse sesini duymadan peek atma.** Erken peek, rakibin hazır beklediği açıya kendi ayağınla girmektir.

Ama sesin her türü aynı değil:

- **Sahte defuse.** Rakip spike'a dokunur, ses verir, bırakır ve sipere geçer; peek atanı vurur. Tek saniyelik dokun-bırak sesine tek hasar util'ini yakma. Ses kesilmeden sürüyorsa gerçek oturuştur — o an at, hasar anında başlar ve oturan rakip geri çekilemez.
- **Yarım defuse.** Defuse yarı noktada kaydedilir. Yarıyı geçen rakip ikinci oturuşunda kalan yarıdan devam eder ve çok daha hızlı bitirir. İkinci defuse sesinde bekleme — pencere bu kez yarı yarıya dar.

## Sayı Azken: Görünme, Uzağı Tut

Post-plant pozisyonu sayıya göre değişir, zevke göre değil.

**4 veya 5 kişiyseniz** yayılın. Ayrı noktalarda durun, gelen rakip birinizi görürken diğeri onu vursun.

**3 kişiyseniz** yığılın. İki kişi aynı noktada, biri farklı bir açıda. Yığıldığınız yer spike'ın dibi değil — spike'ı gören, siperi olan açı.

**2 veya 1 kişiyseniz** hiç görünme. Uzak açıya çekil, defuse'u gör ama görünme, sesle oyna. Defuse başlar başlamaz peek at, birini indir, tekrar saklan. Yalnız başına açık alanda düello aramak round'u bitirir.

Kısa menzilli silahla kaldıysan yakın tutuş dışında seçeneğin yok; hasar util'in varsa uzaktan koru, spike'ı hiç görmeden bile round'u tutabilirsin.

## Sayı Avantajın Varsa Aramaya Çıkma

5v2'desin ve saklanan iki kişiyi bulmaya çıkıyorsan, kendi avantajını harcıyorsun. Saat zaten senin lehine — rakip sana gelmek zorunda. Açıları paylaş, flank'ı kapat, geleni çapraz ateşle karşıla. Son bilinen konumu dumanla kes ve spike'ı tut.

## Savunma: Retake'e Girmeden Önce Üç Soru

Siteyi kaptırdın, spike dikildi. Koşmadan önce üçünü bil: **spike nerede kuruldu, kaç rakip hayatta, elinde giriş util'i var mı?** Üçü de belli değilse retake gözü kapalı koşmaktır.

### Util Sırası

Sıra bilgiden girişe akar ve bozulursa util çöpe gider:

1. **Bilgi util'i** — girişten önce. Kamera, keşif, drone: kaç kişi, hangi açıda.
2. **Duman** — rakibin siteyi tuttuğu en tehlikeli hattı kes. Göremeyen rakip giriş anında ateş açamaz.
3. **Flash** — tam giriş anında. Erken atarsan rakip kapanır, sen girerken elin boş kalır.
4. **Hasar util'i** — girişle aynı anda bilinen post-plant köşesine. Rakip ya hasar alır ya açılır.
5. **Ult** — clutch ve defuse koruması için sakla.

### Birlikte Gir

En az iki kişi, **aynı anda**, farklı açılardan. Rakip iki açıyı birden tutamaz. Aynı anda olmayan bölünmüş giriş, sırayla ölmekten başka bir şey değil: birinci girer düşer, ikinci girer düşer, üçüncü 1v5 kalır.

Ve önce temizle, sonra spike'a git. Rakipler hayattayken zaten defuse yapamazsın — kill her zaman defuse'dan önce gelir.

### Defuse Sesini Sen de Kullan

Sahte defuse iki tarafın da silahı. Spike'a otur, ses ver, hemen bırak, sipere geç. Saldırının post-plant için sakladığı hasar util'i ve peek'i o sese gider; sen siperdeyken boşa yanar.

Gerçek defuse'ta ayak sesi tamamen kesilene kadar oturma. Ses dönerse bırak — yarıyı geçtiysen ilerleme saklı kalır, düelloyu kazanınca kalan yarıdan bitirirsin. Yarıdan önce bırakırsan sıfırlanır.

## Retake mi, Silah mı?

Retake'in iki bedeli var: round ve silahlar. Sayıca çok gerideysen ve giriş util'in yoksa girme. En pahalı senaryo yarım kalan retake — hem round gider hem tüfekler rakibe kalır. Kararı rakip seni aramaya çıkmadan, erken ver: tutulmayan çıkıştan ayrıl, silahı sonraki round'a taşı.

## Toparlarsak

Post-plant'te işin süreyi korumak, savunmada ise süreyi geri kazanmak. İki taraf da aynı hatayı yapıyor: acele ediyor. Sabırlı olan taraf, spike kurulduktan sonraki round'ların çoğunu alır.`,
      en: `The second half of the round begins the moment the spike hits the ground. From then on the clock is not neutral: **the side that planted holds, the other side has to come.** Most round-losing mistakes come from forgetting that one sentence.

## Know Who the Clock Favors

With the spike down, the attacking side is not required to do anything. You do not need to peek, to go hunting, or to win a duel. You only need to burn the timer.

The defense lives the opposite: every second runs against them. That is why a retake cannot be rushed and cannot be delayed either — you have to plan and go in together.

In practice: **the attacker who gets impatient and the defender who runs in without a plan both lose.**

## Attack: Decide Before the Plant

If you are deciding who holds what after the spike is down, you are already late. Everyone's spot should be settled as the plant finishes.

Three rules:

**1. Move the moment the plant completes.** Opponents tune their memorized utility throws to where the spike sits. The player who stays on top of it takes damage without ever being seen.

**2. Build a crossfire.** Two players should never look the same way. You want to hit a defuser from two separate places — turning to one means giving your back to the other.

**3. Keep at least one utility.** Without damage utility, a smoke, or a flash you cannot stop a defuse. Do not walk into the critical half of the round empty-handed.

Vary your plant spot too. Plant in the same place three rounds running and on the fourth they arrive with the throw already lined up.

## What the Defuse Sound Tells You

The defuse sound is the most valuable information in a post-plant. It says three things at once: they are locked onto the spike, their position is known, and right now they are defenseless.

So the rule is simple: **do not peek before you hear the defuse.** An early peek walks you into an angle they are already holding.

But not every sound is the same:

- **The fake defuse.** They tap the spike, make the noise, let go, and move to cover to shoot whoever peeks. Do not burn your only damage utility on a one-second tap. If the sound runs unbroken, it is a real sit — throw then; the damage starts immediately and someone sitting on the spike cannot back out.
- **The half defuse.** Progress saves at the halfway point. Past halfway, their second sit resumes from where it stopped and finishes far faster. On the second defuse sound, do not wait — the window is half as wide.

## Short-Handed: Stay Unseen, Hold Far

Post-plant positioning follows your numbers, not your taste.

**With four or five,** spread. Stand apart so that when someone looks at one of you, the other shoots him.

**With three,** stack. Two on one spot, one on a different angle. And that spot is not on top of the spike — it is the covered angle that sees it.

**With two or one,** stay unseen entirely. Pull to a far angle, watch the defuse without showing yourself, and play the sound. Peek the instant the defuse starts, take one, hide again. Hunting duels alone in the open ends the round.

If all you have left is a short-range weapon, holding close is your only option; with damage utility you can protect from range and win the round without ever seeing the spike.

## With the Numbers, Do Not Go Hunting

At 5v2, going out to find the last two spends your own advantage. The clock is already yours — they have to come to you. Split the angles, close the flank, meet them with a crossfire. Smoke off their last known position and hold the spike.

## Defense: Three Questions Before the Retake

You lost the site and the spike is down. Before running in, know all three: **where the spike was planted, how many are alive, and whether you have entry utility.** If any is unknown, the retake is a blind sprint.

### The Utility Order

The order flows from information to entry, and breaking it wastes everything:

1. **Information** — before the entry. Camera, recon, drone: how many, on which angles.
2. **Smoke** — cut the most dangerous line they hold. A blind opponent cannot shoot your entry.
3. **Flash** — at the moment of entry. Thrown early, they close up and you enter with nothing.
4. **Damage utility** — into the known post-plant corner as you enter. They either take damage or step out.
5. **Ult** — saved for the clutch or to cover the defuse.

### Go In Together

At least two players, **at the same time**, from different angles. They cannot hold two at once. A split entry that is not simultaneous is just dying in sequence: the first goes down, the second goes down, the third is left in a 1v5.

And clear before you touch the spike. They cannot be defused around — the kill always comes before the defuse.

### Use the Defuse Sound Yourself

The fake defuse belongs to both sides. Tap the spike, make the noise, release, move to cover. The damage utility and the peek they saved for the post-plant get spent on that sound while you sit behind cover.

On a real defuse, do not sit until the footsteps stop completely. If sound returns, let go — past halfway your progress is banked, and once you win the duel you finish from where you left off. Let go before halfway and it resets.

## Retake or Rifle?

A retake costs two things: the round and the guns. If you are well down on numbers with no entry utility, do not go. The most expensive outcome is the half-finished retake — you lose the round and hand over the rifles. Make the call early, before they come looking: leave through the unheld exit and carry the weapon into the next round.

## The Short Version

Post-plant your job is to protect time; on defense it is to take time back. Both sides make the same mistake — they hurry. The patient side wins most of the rounds that come after the spike goes down.`,
    },
  },

  {
    slug: "radiant-aliskanliklari",
    publishedAt: "2026-07-08T09:00:00.000Z",
    color: "#4D7CFF",
    readMinutes: 6,
    category: { tr: "Rank Rehberi", en: "Rank Guide" },
    title: {
      tr: "Üst Seviye Oyuncuların 5 Alışkanlığı",
      en: "5 Habits of High-Level Players",
    },
    excerpt: {
      tr: "Radiant'ı ayıran şey refleks değil; karar hızı, bilgi ekonomisi ve round'u erken kapatma disiplini. Beşi de öğrenilebilir.",
      en: "What separates the top is not reflexes but decision speed, information economy, and closing rounds early. All five are learnable.",
    },
    body: {
      tr: `Üst seviye oyuncuları izlerken ilk fark edilen şey nişan olur; asıl fark ise izlemeye devam edince ortaya çıkar. Aşağıdakilerin hiçbiri yetenek değil, alışkanlık.

## 1. Kararı Kavgadan Önce Verirler

Köşeye vardığında "peek atsam mı" diye düşünen oyuncu geç kalmıştır. Üst seviyede karar daha köşeye varılmadan verilir: hangi açıyı alacağım, tutmazsa nereye çekileceğim, kim beni tradeleyecek.

**Nasıl çalışılır:** Round başında kendine tek cümlelik plan kur — "mid'den bilgi al, tutmazsa B'ye dön". Plan olmadan çıkılan her peek bir kumar.

## 2. Bilgiyi Cümleye Çevirirler

"Buradalar" bir bilgi değil. Üst seviyede çağrılar sayı ve konum içerir: kaç kişi, hangi girişten, ne zaman. Bu, takımın rotasyon kararını tahmine değil veriye bağlar.

**Nasıl çalışılır:** Her ölümünden sonra son bir cümle söyle — nereden vuruldun, kaç kişi gördün. Ölü oyuncunun en değerli katkısı budur.

## 3. Aynı Şeyi İki Kez Denemezler

İlk round'da işe yarayan hamle ikinci round'da beklenir hale gelir. Üst seviyede oyuncular kendi kalıplarını takip eder ve rakip okumadan önce değiştirir.

**Nasıl çalışılır:** Üç round üst üste aynı açıyı tuttuysan dördüncüde bırak — hatta o açıyı tuttuğunu düşündürüp başka yerden çık.

## 4. Round'u Erken Kapatırlar

Sayısal üstünlük kazanıldığı an tempo değişir. Üst seviyede 4v3'e geçildiğinde takım agresifleşmez, tam tersine **zamanı ve alanı kilitler** — bomba kurulur, açılar paylaşılır, gereksiz düello alınmaz.

Aynısı ekonomide de geçerli: kazanılan round'un ardından alım disiplini bozulmaz.

## 5. Utility'yi Kill İçin Değil Alan İçin Kullanırlar

Düşük seviyede yetenekler hasar aracıdır. Üst seviyede yetenek, kavganın şartlarını değiştirmek için harcanır: görüşü kes, geçişi kapat, rakibi kendi seçmediği bir açıya zorla.

**Nasıl çalışılır:** Her yetenek kullanımından önce sor — bu, kavgayı benim lehime mi çeviriyor yoksa sadece hasar mı veriyor? İkincisiyse çoğu zaman erken harcamışsındır.

## Bunu Kendi Maçında Nasıl Görürsün

Bu beş alışkanlığın ortak yanı şu: hepsi round içinde değil, round sonrasında fark edilir. Kendi maçında hangisini kaçırdığını görmenin en hızlı yolu, her ölümün nerede ve hangi şartlarla gerçekleştiğini geri dönüp okumak. AIMLO tam olarak bunu yapıyor — round biter bitmez o ölümü kalıba oturtuyor ve bir sonraki round için tek bir somut düzeltme veriyor.`,
      en: `The first thing you notice watching top players is their aim; the real difference shows up if you keep watching. None of the following is talent — all of it is habit.

## 1. They Decide Before the Fight

A player who reaches the corner and then wonders whether to peek is already late. At the top the decision is made before arriving: which angle I take, where I fall back if it fails, who trades me.

**How to practice:** give yourself a one-sentence plan at round start — "get info from mid, fall back to B if it does not hold." Every peek without a plan is a gamble.

## 2. They Turn Information Into Sentences

"They're here" is not information. High-level calls carry a number and a place: how many, through which entry, when. That turns the team's rotation from a guess into a decision.

**How to practice:** say one sentence after every death — where you were shot from, how many you saw. That is a dead player's most valuable contribution.

## 3. They Do Not Run the Same Thing Twice

What worked in round one is expected by round two. Top players track their own patterns and change them before the opponent reads them.

**How to practice:** if you held the same angle three rounds running, drop it on the fourth — better yet, let them think you are there and come from somewhere else.

## 4. They Close Rounds Early

The moment you go up a body, the tempo changes. At the top, going 4v3 does not make a team more aggressive — it makes them **lock down time and space**: plant the spike, split the angles, refuse unnecessary duels.

The same holds in the economy: buy discipline does not slip after a won round.

## 5. They Spend Utility for Space, Not Kills

At lower levels abilities are damage. At the top they are spent to change the terms of the fight: cut vision, close a crossing, force the opponent into an angle they did not choose.

**How to practice:** before every ability, ask — does this tilt the fight toward me, or is it just damage? If it is the latter, you probably threw it early.

## How to See This in Your Own Match

What these five share is that none of them is visible during the round — only after it. The fastest way to see which one you are missing is to go back and read where each death happened and under what terms. That is exactly what AIMLO does: as soon as the round ends it places that death into a pattern and gives you one concrete correction for the next one.`,
    },
  },

  {
    slug: "split-mid-kontrolu",
    publishedAt: "2026-07-04T09:00:00.000Z",
    color: "#B44DFF",
    readMinutes: 7,
    category: { tr: "Harita Rehberi", en: "Map Guide" },
    title: {
      tr: "Split'te Mid Kontrolü: Saldırı Tarafı",
      en: "Split Mid Control: The Attacker's Side",
    },
    excerpt: {
      tr: "Split savunmayı seviyor. Mid'i alan taraf haritayı yönetir — Mid'i nasıl açarsın, A Ramp'ı neden önce almalısın?",
      en: "Split favors the defense. Whoever holds mid runs the map — how to open it, and why A Ramp comes first.",
    },
    body: {
      tr: `Split savunmada rahat, saldırıda affetmeyen bir harita. Sebep net: site girişleri dar, iki sitede de yükseklik avantajı var ve mid haritanın tam ortasında her şeyi birbirine bağlıyor. Bu haritanın özü dikey oyun.

## Neden Mid?

Mid'i alırsan Vent üzerinden A Tower'a, Mail üzerinden B Link ve B Tower'a geçersin. Mid'i kaybedersen iki siteyi bağlayan yolu kaybedersin — başka bir şey değil, ama bu tek başına yeterli.

Savunmada mid'e atılan bir duvar saldırının seçeneklerini yarıya indirir. Saldırıda mid kontrolün varsa her iki siteye bölünmüş giriş açılır.

## Ölüm Bölgelerini Tanı

**A Ramp.** Split'teki en yoğun ölüm noktası. Util atmadan çıkarsan A Tower ve A Site'tan aynı anda iki ayrı açıya yürürsün. Yükseklik farkı ve darlık her şeyi savunmacıya verir. Burada tekrar tekrar ölüyorsan sorun nişan değil — çıkmadan önce flash ya da duman atmıyorsun.

**B Main.** B'ye giden tek ana yol ve çok dar. Garage'dan, Pillar arkasından ve B Tower'dan kapatılırsın. Burada ölümün sebebi neredeyse her zaman üçünden biridir: flash patlamadan girdin, duman atmadan ilerledin, ya da takım hazır değilken tek peek attın.

**Mid Top.** Savunmanın uzun silah tuttuğu klasik nokta. Util'siz peek atarsan karşıda seni bekleyen vardır. Sıra basit: duman, flash, sonra swing.

**A Tower ve B Tower.** Yükseklik. Site'a girerken yukarıyı kapatmazsan oradaki oyuncu seni görür, sen onu göremezsin. Her B execute'ında Tower için bir duman ayır.

## Round Başı: Default

Beş kişiyi tek noktaya yüklemek Split'te kör oynamaktır. Rakibin nerede güçlü olduğunu bilmeden execute yaparsan savunmanın en yoğun olduğu yere dalarsın.

Dağılım: **2 A Ramp/Main, 1 Mid, 2 B Main.** Her bölgeden bilgi al, orta round'da karar ver. Mid alındıysa bölünmüş execute seç; mid kapandıysa doğrudan site'a gir.

## A Execute'un Sırası

A'ya giderken ilk hedefin site değil, **Ramp kontrolü**. Ramp'ı tutarsan execute rahat akar. Ramp'ı almadan A Main'den girmeye çalışırsan Tower ve Ramp'tan gelen çapraz ateş seni bitirir.

Sıra şu: Ramp'a util, Ramp'ı al, sonra Tower'ı kapat, sonra gir. Bu sıranın herhangi bir adımını atlamak round'u geri alınamaz hale getirir.

## Mid'i Açmanın Maliyeti

Mid ucuz alınmaz. En az bir duman ve bir flash gerekir; kimi round'da bunu ödemeye değmez. Rakip mid'i ağır tutuyorsa mid'e yatırım yapmak yerine bir round doğrudan B Main'e util yığmak daha kârlıdır.

Kural: mid'i almak için harcadığın util, site'a girerken elinde olmayacak. Bütçeni round başında böl, kavganın ortasında değil.

## Kısa Özet

Split'te saldırı disiplinle kazanılır. Mid'i al, Ramp'ı al, yüksekliği kapat, sonra gir. Bunlardan birini atladığın round, savunmanın kazanmak için hiçbir şey yapması gerekmeyen round'dur.`,
      en: `Split is comfortable on defense and unforgiving on attack. The reasons are plain: the site entries are narrow, both sites have a height advantage, and mid sits in the center connecting everything. Vertical play is the essence of this map.

## Why Mid?

Take mid and you reach A Tower through Vent, and B Link and B Tower through Mail. Lose mid and you lose the road that connects the two sites — nothing more, but that alone is enough.

On defense, a wall thrown into mid halves the attackers' options. On attack, mid control opens a split entry into either site.

## Know the Death Zones

**A Ramp.** The deadliest spot on Split. Step out without utility and you walk into two separate angles from A Tower and A Site at once. The height gap and the tightness hand everything to the defender. If you keep dying here, the problem is not aim — you are not throwing a flash or smoke before you go.

**B Main.** The only main road into B, and very narrow. You get closed off from Garage, from behind Pillar, and from B Tower. A death here is almost always one of three things: you entered before the flash popped, you pushed without smoke, or you peeked alone before the team was ready.

**Mid Top.** The classic long-weapon hold for the defense. Peek it without utility and someone is waiting. The order is simple: smoke, flash, then swing.

**A Tower and B Tower.** Height. Enter the site without closing the high ground and the player up there sees you while you cannot see him. Reserve one smoke for Tower on every B execute.

## Round Start: Default

Loading five players onto one point is playing blind on Split. Execute without knowing where they are strong and you walk into the thickest part of the defense.

The spread: **2 A Ramp/Main, 1 Mid, 2 B Main.** Gather information from each area, decide in the mid-round. If mid is taken, choose the split execute; if mid is closed, go straight at a site.

## The Order of an A Execute

Going A, your first objective is not the site but **Ramp control**. Hold Ramp and the execute flows. Try A Main without Ramp and the crossfire from Tower and Ramp ends you.

The sequence: utility into Ramp, take Ramp, close Tower, then enter. Skipping any step in that order makes the round unrecoverable.

## What Mid Costs

Mid is never cheap. It takes at least a smoke and a flash, and some rounds it is not worth paying. If they are holding mid heavily, stacking utility straight into B Main for a round pays better than investing in mid.

The rule: whatever utility you spend taking mid is utility you will not have entering the site. Split the budget at round start, not mid-fight.

## Short Version

Attacking Split is won with discipline. Take mid, take Ramp, close the height, then enter. The round where you skip one of those is the round the defense wins without doing anything.`,
    },
  },

  {
    slug: "chamber-nasil-oynanir",
    publishedAt: "2026-06-28T09:00:00.000Z",
    color: "#32B8B8",
    readMinutes: 5,
    category: { tr: "Ajan Rehberi", en: "Agent Guide" },
    title: {
      tr: "Chamber: Kağıt Üstünde Sentinel, Sahada Duelist",
      en: "Chamber: Sentinel on Paper, Duelist in Practice",
    },
    excerpt: {
      tr: "Chamber'ı Cypher gibi oynayan oyuncu ajanı boşa harcar. Mermi ekonomisi, anchor disiplini ve ult'un ne zaman para demek olduğu.",
      en: "Playing Chamber like Cypher wastes the pick. Ammo economy, anchor discipline, and when the ult is really money.",
    },
    body: {
      tr: `Chamber kağıt üstünde sentinel ama duelist gibi oyna. Site'ı kamera ve tuzak ağıyla kapatmaya çalışırsan ajanın hiçbir gücünü kullanmamış olursun. Senin işin, orayı peek'lemesi pahalıya patlayan bir yere çevirmek.

## Temel Döngü

Anchor koy → açıyı tut → tek atış yap → teleport ol.

Chamber'ın bütün oyunu bu dört adım. Adımlardan birini atladığın an ajan çalışmaz: anchor koymadan açı tutarsan ölürsün ve site tamamen açılır; tek atışını yapıp aynı açıda kalırsan ikinci peek'te sen ölürsün.

## Mermi Para Demek

Tabancan güçlendirilmiş bir Sheriff, ama her mermi paraya mal oluyor — **mermi başına 100 kredi.** Bu iki şey demek:

- Ucuz olduğu için pistol ve eco round'larında ana silahın olsun.
- Vandal gibi sıkma. Her ıska doğrudan para kaybı; save round'da yedek silah gibi çek ama yine de boşa sıkma.

## Ult Bir Ekonomi Aracı

Ult hazırken tüfek alma. O round silahın zaten elinde; parayı takıma dağıt. Chamber'ın ekonomik değeri buradan gelir — bir oyuncu tüfek almadan tam güçte oynarsa takımın alım tavanı yükselir.

Ult'u yakın mesafe dövüşünde harcama. O silah uzun açılar için var; koridorda kullanırsan hem silahı hem round'u verirsin.

## Tuzağı Doğru Yola Koy

Tek tuzakla yapabileceğin en fazla şey bir flank yolunu kapatmak. En tehlikeli yolu kapat, gerisini boşver.

Kritik detay: tuzak **sadece sen menzilindeyken** çalışır. Haritanın öbür ucuna kurup unutma — kendi tuttuğun bölgenin flank'ini kapat. Rotasyon yaparken tuzağı topla ve yeni bölgende yeniden kur.

## Anchor Disiplini

Anchor'u round başında yerleştir. Round ortasında anchor değiştirmek üç şeyi birden bozar: geç kalırsın, gürültü çıkarırsın, yerini ele verirsin.

Anchor'u tuttuğun agresif açıdan fazla uzağa koyma. Teleport gecikirse açıda ölürsün — anchor'un işi seni kurtarmak, sonradan yetişmek değil.

Ve teleport'u tehlike yokken erken kullanma; gerçek push geldiğinde bekleme süresinde kaçışsız yakalanırsın.

## Zayıf Yönünü Kabul Et

Chamber'ın açığı net: nişanın tutmadığı an takıma Killjoy veya Cypher gibi savunma bilgisi veremezsin. Bu yüzden Chamber'ı seçtiğinde takımın bilgi ihtiyacını başka bir ajan karşılamalı. Kompozisyonda bilgi veren kimse yoksa Chamber yanlış seçimdir — ajanın kötü olmasından değil, takımın ihtiyacını karşılamamasından.`,
      en: `Chamber is a sentinel on paper, but play him like a duelist. Try to lock a site down with a web of cameras and traps and you have used none of the agent's strengths. Your job is to make the site expensive to peek.

## The Core Loop

Place the anchor → hold the angle → take one shot → teleport out.

Those four steps are the whole agent. Skip one and it stops working: hold an angle without an anchor and you die and the site opens completely; take your shot and stay on the same angle and you lose the second peek.

## Ammo Is Money

Your pistol is an upgraded Sheriff, but every bullet costs — **100 credits per round of ammo.** That means two things:

- It is cheap, so make it your primary on pistol and eco rounds.
- Do not spray it like a Vandal. Every miss is a direct loss; pull it as a backup on save rounds, but still do not waste shots.

## The Ult Is an Economy Tool

Do not buy a rifle when the ult is up. You already have your weapon that round; push the money to your teammates. That is where Chamber's economic value comes from — one player at full strength without buying a rifle raises the whole team's ceiling.

Do not burn the ult in a close-range fight. It exists for long angles; use it in a corridor and you lose both the weapon and the round.

## Put the Trap on the Right Path

The most a single trap can do is close one flank route. Close the most dangerous one and forget the rest.

The critical detail: the trap **only works while you are in range of it.** Do not set it across the map and forget it — close the flank of the area you are actually holding. When you rotate, pick it up and re-place it in your new area.

## Anchor Discipline

Place the anchor at round start. Moving it mid-round breaks three things at once: you arrive late, you make noise, and you give away your position.

Do not place the anchor too far from the aggressive angle you are holding. If the teleport takes too long you die on the angle — the anchor's job is to save you, not to catch up afterwards.

And do not spend the teleport early with no threat present; when the real push comes you get caught with no escape on cooldown.

## Accept the Weakness

Chamber's gap is clear: the moment your aim is off, you cannot give the team the defensive information a Killjoy or a Cypher would. So when you pick him, someone else has to cover that need. If nobody in the comp provides information, Chamber is the wrong pick — not because the agent is bad, but because he does not fill the team's gap.`,
    },
  },

  {
    slug: "round-ekonomisi-101",
    publishedAt: "2026-06-23T09:00:00.000Z",
    color: "#2ECC71",
    readMinutes: 6,
    category: { tr: "Strateji", en: "Strategy" },
    title: {
      tr: "Round Ekonomisi 101: Kayıp Bonusunun Matematiği",
      en: "Round Economy 101: The Loss Bonus Math",
    },
    excerpt: {
      tr: "Save mi force mu sorusunun cevabı hissiyat değil, tablo. Kredi kaynakları, kayıp bonusu basamakları ve devre arası sıfırlaması.",
      en: "Save or force is answered by a table, not a feeling. Credit sources, the loss bonus tiers, and the halftime reset.",
    },
    body: {
      tr: `Alım kararlarını hissiyatla veriyorsan round'ların yarısını daha başlamadan kaybediyorsun. Ekonomi tahmin edilmez, hesaplanır. Aşağıdakiler oyunun sabitleri.

## Kredi Nereden Gelir

- **Round kazandın:** 3.000
- **Round kaybettin:** 1.900 + kayıp bonusu
- **Spike dikildi:** kaybetsen bile saldıran takımın herkesine +300
- **Her kill:** 200 — silahtan bağımsız

Kill kredisini aklında tut: rakibin kaç kill aldığını sayarsan onun bir sonraki round'daki alımını tahmin edebilirsin.

## Kayıp Bonusu Basamakları

| Üst üste kayıp | Bonus | Eline geçen |
|---|---|---|
| 1. kayıp | +0 | 1.900 |
| 2. kayıp | +500 | 2.400 |
| 3. ve sonrası | +1.000 | 2.900 |

Bir round kazandığın an bu basamak **sıfırlanır**. Kazandıktan sonra kaybedersen yeniden 1.900'dan başlarsın — bu, "kazandık, artık rahatız" hatasının sebebi.

## Round Başı Krediler

- Pistol round: 800
- Pistol'ü kazandıysan ikinci round: yaklaşık 3.800 (pistol'de harcamadıysan)
- Pistol'ü kaybettiysen ikinci round: yaklaşık 2.700
- **Devre arası: herkes 800'e döner, birikim taşınmaz**

Devre arası sıfırlaması, ilk yarının son round'undaki alım kararını tamamen değiştirir. Biriktirdiğin kredi ikinci yarıya geçmez; o round'da harcamadığın para kaybolur.

## Karar Tablosu

**Tam alım** — takım ortalaması 4.000 ve üstü. Herkes tüfek (2.900) ve ağır zırh (1.000) alabiliyor: en az 3.900. Yeteneği ondan sonra düşün.

**Force** — ortalama 2.200–3.500. Kayıp serine bak: ikinci ya da üçüncü kaybındaysan force kârlı, çünkü kaybetsen bile 2.400–2.900 geliyor. Birinci kaybındaysan save daha mantıklı.

**Eco / save** — ortalama 2.000'in altında, kaybediyorsun ve rakip tam silahlı. Ghost (500) ya da Sheriff (800) al, yetenek alma, kalanı sakla.

**İstisna:** rakip de eco ya da yarım alımdaysa tam save yapma. İki taraf da zayıfken baskı round'u çevirir, tam save çeviremez.

## Anti-Eco'yu Da Doğru Oyna

Rakip eco'da, sen tam alımdaysan hata yapmak kolay. Onlar yakına gelip tabancayla kafa arayacak. Tüfeğini koru, uzak hattı tut, SMG mesafesine inme ve dar köşe dibinde bekleme. Uzun silah alma — yakına girdiklerinde işe yaramaz.

Tam alımdayken ucuz silaha ölmek, kredi avantajını mesafe seçimiyle çöpe atmak demektir.

## Takım Olarak Karar Ver

Ekonomi bireysel değil takım kararıdır. Dört kişi save ederken bir kişinin tüfek alması hem o tüfeği hem round'u kaybettirir. Round başında tek cümle yeter: "hepimiz save" ya da "hepimiz force". Ortada kalan alım en pahalı alımdır.`,
      en: `If you buy on feel, you lose half your rounds before they start. Economy is not guessed, it is counted. What follows are the game's constants.

## Where Credits Come From

- **Round won:** 3,000
- **Round lost:** 1,900 plus the loss bonus
- **Spike planted:** +300 to every attacker even in a loss
- **Every kill:** 200, regardless of weapon

Keep the kill credits in mind: count their kills and you can predict their next buy.

## The Loss Bonus Tiers

| Consecutive losses | Bonus | You receive |
|---|---|---|
| 1st loss | +0 | 1,900 |
| 2nd loss | +500 | 2,400 |
| 3rd and beyond | +1,000 | 2,900 |

Winning a round **resets** the tier. Lose after a win and you are back to 1,900 — which is exactly why the "we won, we're fine now" mistake hurts.

## Starting Credits

- Pistol round: 800
- Second round after winning the pistol: roughly 3,800 (if you did not spend on the pistol)
- Second round after losing it: roughly 2,700
- **Halftime: everyone resets to 800, savings do not carry over**

The halftime reset completely changes the buy decision in the last round of the first half. Credits you banked do not survive the switch; money you did not spend that round is simply gone.

## The Decision Table

**Full buy** — team average 4,000 or more. Everyone can afford a rifle (2,900) and heavy shield (1,000): 3,900 minimum. Abilities come after that.

**Force** — average 2,200 to 3,500. Check the loss streak: on a second or third straight loss, forcing pays, because even a loss returns 2,400 to 2,900. On a first loss, saving is better.

**Eco / save** — average under 2,000, you are behind, and they are fully armed. Buy a Ghost (500) or Sheriff (800), skip abilities, bank the rest.

**The exception:** if they are on an eco or half buy too, do not full save. When both sides are weak, pressure flips the round and a full save cannot.

## Play the Anti-Eco Correctly Too

Full buy against an eco is easy to get wrong. They will close distance and hunt heads with pistols. Keep your rifle, hold the long line, do not drop to SMG range, and do not sit in a tight corner. Skip the long-range weapon — it is useless once they are close.

Dying to a cheap weapon on a full buy means you threw away your credit advantage by choosing the wrong distance.

## Decide as a Team

Economy is a team decision, not an individual one. Four players saving while one buys a rifle loses both the rifle and the round. One sentence at round start is enough: "everyone saves" or "everyone forces." The half-committed buy is the most expensive buy there is.`,
    },
  },

  {
    slug: "viper-post-plant",
    publishedAt: "2026-06-17T09:00:00.000Z",
    color: "#ECB73E",
    readMinutes: 10,
    category: { tr: "Ajan Rehberi", en: "Agent Guide" },
    title: {
      tr: "Viper ile Post-Plant: Yakıt, Sıra ve İki Molly",
      en: "Post-Plant Viper: Fuel, Sequencing, and Two Mollies",
    },
    excerpt: {
      tr: "Spike kurulduktan sonra sahanın sahibi Viper. Ama yakıtı yanlış yönetirsen elinde hiçbir şey kalmaz. Sıra ve saklama disiplini.",
      en: "After the plant, the site belongs to Viper. Mismanage the fuel and you have nothing left. Sequencing and saving discipline.",
    },
    body: {
      tr: `Viper haritayı ikiye böler. Post-plant'te hiçbir controller onunla yarışamaz — ama bu üstünlük otomatik değil, yakıt yönetiminin sonucu.

## Yakıt Tek Havuz

Duvar ve duman **tek bir paylaşımlı yakıt havuzundan** beslenir. İkisini birden uzun süre açık tutarsan ikisi de söner ve elinde hiçbir şey kalmaz. Yakıtı kim iyi yönetirse o Viper kazanır.

**Sıra kuralı:** önce duvarı entry geçişinden sonra kapat, sonra dumanı aç. Sırayla çalıştır, asla aynı anda değil.

## Duvarın İşi Bölmek

Duvarı site'ı ikiye bölmek için çek: savunucunun rotasyonunu kes, tek bir dövüşü iki ayrı dövüşe çevir. Amaç görüşü kapatmak değil, haritayı ikiye ayırmak.

İki yaygın hata:

- **Her round aynı duvarı çekmek.** Savunucu seni okur; daha sen gelmeden duvara göre durur.
- **Duvarı takım arkadaşının baktığı açıya çekmek.** Kendi takımını kör bırakırsın.

## Molly'leri Post-Plant İçin Sakla

Bu, Viper'ın en büyük israfı: molly'yi dövüşte sıradan bir hasar aracı gibi harcamak. Molly'nin asıl işi spike kurulduktan sonra başlar.

Ve tek molly yetmez — **defuse tek molly'den uzun sürer.** İkinci molly'yi birincinin etkisi biter bitmez üstüne yığ. Rakip ilk molly'nin sönmesini bekleyip defuse'a oturuyorsa, ikinci molly tam o anda gelmelidir.

Bu yüzden lineup ezberlemek Viper'da opsiyonel değil. Post-plant'i kazanmanın asıl yolu bu.

## Ult'u Dövüşten Önce Koy

Ult'u dövüşün ortasında bırakma — çok geç kalırsın. Dövüş başlamadan koy, içine gir ve **içinde kal.** Panikle dışarı çıkmak ult'u boşa harcamaktır.

## Dumanı Aç-Kapat

Dumanı koyup unutma. Aç-kapat yaparak düşmanın nereden geldiğini öğren ve tuzak kur. Duman statik bir duvar değil, bir bilgi aracı.

Aynı zamanda yakıt sebebiyle: kapalıyken yakıt harcamaz. Dar girişi kapat ama yakıt bitmeden kapat, kalanı post-plant için sakla.

## Round Sonunun Sırası

1. Spike kuruldu. Duvar kapalıysa aç ve site'ı ikiye böl.
2. Rakip hangi taraftan geliyor? O tarafa duman, diğer tarafa dikkat.
3. İlk defuse denemesinde molly. Bekle — erken atma.
4. Molly sönerken ikinciyi üstüne yığ.
5. Ult varsa ve sayısal olarak geridesin, dövüş başlamadan koy.

Bu sırayı bozmadan uygulayan Viper, sayısal dezavantajda bile post-plant kazanır. Sırayı bozan Viper, elinde yakıtı bitmiş boş bir duvarla kalır.

## Özet

Viper'ın gücü hasar değil, zaman. Duvar zamanı böler, duman zamanı uzatır, molly zamanı yakar. Üçünü de aynı anda kullanmaya çalışırsan hiçbirini kullanamazsın.`,
      en: `Viper splits the map in half. No controller competes with her after the plant — but that edge is not automatic, it is a product of fuel management.

## One Shared Fuel Pool

The wall and the smoke draw from **a single shared fuel pool.** Hold both open for long and both burn out, leaving you with nothing. Whoever manages the fuel best wins the Viper matchup.

**The sequencing rule:** close the wall after the entry passes through, then open the smoke. Run them in sequence, never at once.

## The Wall's Job Is to Divide

Pull the wall to split the site in two: cut the defender's rotation, turn one fight into two separate fights. The goal is not blocking vision, it is halving the map.

Two common mistakes:

- **Pulling the same wall every round.** They read you and set up against it before you arrive.
- **Pulling the wall across your own teammate's angle.** You blind your own team.

## Save the Mollies for the Post-Plant

This is Viper's biggest waste: spending a molly mid-fight as ordinary damage. The molly's real job begins after the plant.

And one is not enough — **a defuse outlasts a single molly.** Stack the second the instant the first expires. If they are waiting out the first molly to sit on the defuse, the second must land exactly then.

That is why memorizing lineups is not optional on Viper. It is the actual way post-plants are won.

## Place the Ult Before the Fight

Do not drop the ult mid-fight — you are too late. Place it before the fight begins, step inside, and **stay inside.** Panicking and stepping out wastes it.

## Toggle the Smoke

Do not place the smoke and forget it. Toggle it to learn where they are coming from and set a trap. The smoke is an information tool, not a static wall.

Fuel matters here too: it costs nothing while closed. Close the tight entry, but close it before the fuel runs dry and bank the rest for the post-plant.

## The Order of the Round's End

1. Spike is planted. If the wall is closed, open it and split the site.
2. Which side are they coming from? Smoke that side, watch the other.
3. Molly on the first defuse attempt. Wait — do not throw it early.
4. As it burns out, stack the second on top.
5. If you have the ult and you are down bodies, place it before the fight starts.

A Viper who runs that order wins post-plants even at a body disadvantage. A Viper who breaks it is left holding an empty wall with no fuel.

## Summary

Viper's strength is not damage, it is time. The wall divides time, the smoke stretches it, the molly burns it. Try to use all three at once and you use none of them.`,
    },
  },

  {
    slug: "iron-silver-7-kural",
    publishedAt: "2026-06-10T09:00:00.000Z",
    color: "#FF4655",
    readMinutes: 5,
    category: { tr: "Rank Rehberi", en: "Rank Guide" },
    title: {
      tr: "Yeni Başlayanlar İçin 7 Kural",
      en: "7 Rules for New Players",
    },
    excerpt: {
      tr: "İlk rekabetçi maçlarına giriyorsan: nişan ayarı, yürüme, ekonomi ve iletişim. Karmaşık taktik yok — sadece işe yarayan yedi madde.",
      en: "If you are entering your first competitive matches: crosshair, walking, economy, and comms. No complex tactics — just seven things that work.",
    },
    body: {
      tr: `Yeni başlıyorsan taktik öğrenmeye çalışma. Önce şu yedi maddeyi alışkanlığa çevir; hepsi tek başına round kazandırır.

## 1. Nişanı Küçült ve Sabitle

Büyük ve hareketli bir nişan, tam olarak nereye vurduğunu göstermez. Küçük, statik, tek renk bir nişan kullan ve **değiştirmeyi bırak.** Nişanını her hafta değiştiren oyuncu, hiçbirine alışamaz.

## 2. Baş Hizasına Bak

Yere ya da havaya bakarak koşuyorsan, düşmanı gördüğün an önce nişanını taşıman gerekir. Nişanı hep baş hizasında ve önündeki köşenin kenarında tut. Bu tek alışkanlık, düşük rankta en çok round kazandıran şeydir.

## 3. Ateş Ederken Dur

Valorant'ta koşarken atılan mermi gitmez. Dur, sık, sonra hareket et. Yakın mesafede bile bu böyle. "Koşarak sıkıp kaçmak" düşük rankın en pahalı alışkanlığı.

## 4. Yürümeyi Öğren

Koşarken ayak sesin haritanın yarısına gider. Bilgi vermek istemiyorsan yürü. Bilgi vermek istiyorsan — evet, bazen istersin — bilerek koş ve rakibi yanlış yöne çek.

## 5. Ekonomiyi Takımla Birlikte Yönet

Dört kişi save ederken tek başına tüfek alma. Round kaybettiğinde eline **1.900** kredi gelir; üst üste kaybediyorsan bu **2.400**, sonra **2.900**'a çıkar. Yani bir round beklemek çoğu zaman kârlıdır.

Devre arasında herkesin kredisi **800**'e döner — birikim taşınmaz. İlk yarının son round'unda parayı saklamanın anlamı yok.

## 6. Bir Cümle Söyle

Mikrofonun yoksa bile yazabilirsin. Öldüğünde tek cümle bırak: nereden vuruldun, kaç kişi gördün. Ölü oyuncunun en değerli katkısı bu ve hiçbir mekanik beceri gerektirmiyor.

## 7. Tek Başına Girme

Round'ların çoğunu takımdan ayrı düştüğün için kaybedersin. Yanında biri olmadan açı alma. Öldüğünde seni tradeleyecek kimse yoksa, o ölüm takıma iki kayıp birden yazar: seni ve senin bilgini.

## Sonraki Adım

Bu yediyi oturttuysan bir sonraki adım harita bilgisi: her haritada nerede sık öldüğünü öğrenmek. Kendi ölümlerini geri dönüp okumak, ezberden taktik öğrenmekten çok daha hızlı ilerletir — çünkü senin hatan, videodaki oyuncunun hatası değil.`,
      en: `If you are just starting, do not chase tactics. Turn these seven into habits first; each one wins rounds on its own.

## 1. Shrink the Crosshair and Keep It

A big, moving crosshair does not tell you exactly where you are shooting. Use a small, static, single-color one and **stop changing it.** A player who swaps crosshairs every week never adapts to any of them.

## 2. Aim at Head Level

If you run looking at the floor or the sky, you have to move your aim before you can shoot. Keep the crosshair at head height and on the edge of the corner ahead of you. This single habit wins more low-rank rounds than anything else.

## 3. Stop to Shoot

Bullets fired while running do not go where you are aiming. Stop, shoot, then move. This holds even at close range. "Spray while running away" is the most expensive habit in low ranks.

## 4. Learn to Walk

Sprinting broadcasts your footsteps across half the map. If you do not want to give information, walk. If you do want to give it — and sometimes you do — sprint deliberately and pull them the wrong way.

## 5. Manage Economy With Your Team

Do not buy a rifle alone while four teammates save. Losing a round pays **1,900**; on consecutive losses that rises to **2,400**, then **2,900**. Waiting one round is usually profitable.

At halftime everyone resets to **800** and savings do not carry over — there is no point banking money in the last round of the first half.

## 6. Say One Sentence

Even without a mic you can type. Leave one line when you die: where you were shot from, how many you saw. It is the most valuable thing a dead player contributes and it requires no mechanical skill.

## 7. Do Not Go in Alone

You lose most rounds because you got isolated. Do not take an angle without someone with you. If nobody can trade you when you die, that death costs the team twice: you, and your information.

## What Comes Next

Once these seven are habit, the next step is map knowledge: learning where you keep dying on each map. Reading back your own deaths moves you faster than memorizing tactics from videos — because your mistake is not the mistake of the player in the video.`,
    },
  },
];

/* ──────────────────────────────────────────────────────────
   ZAMAN — runtime'da hesaplanır, sabit metin YOK.
   ────────────────────────────────────────────────────────── */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
/** Ortalama ay/yıl — takvim kesinliği değil, "x önce" etiketi için yeterli. */
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Sabit ISO yayın tarihinden "3 saat önce / 2 gün önce / 1 ay önce"
 * etiketini ÜRETİR. Çağrıldığı anda hesaplandığı için aylar sonra da
 * doğru kalır.
 */
export function relativeTime(iso: string, lang: BlogLang, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";

  const diff = now - then;
  // Gelecek tarih (saat farkı / erken önizleme) → "şimdi".
  if (diff < MINUTE) return lang === "tr" ? "az önce" : "just now";

  const unit = (n: number, tr: string, en: string) =>
    lang === "tr" ? `${n} ${tr} önce` : `${n} ${en}${n === 1 ? "" : "s"} ago`;

  if (diff < HOUR) return unit(Math.floor(diff / MINUTE), "dakika", "minute");
  if (diff < DAY) return unit(Math.floor(diff / HOUR), "saat", "hour");
  if (diff < WEEK) return unit(Math.floor(diff / DAY), "gün", "day");
  if (diff < MONTH) return unit(Math.floor(diff / WEEK), "hafta", "week");
  if (diff < YEAR) return unit(Math.floor(diff / MONTH), "ay", "month");
  return unit(Math.floor(diff / YEAR), "yıl", "year");
}

/** Tam tarih — "18 Temmuz 2026" / "July 18, 2026". */
export function fullDate(iso: string, lang: BlogLang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Okuma süresi etiketi. */
export function readLabel(minutes: number, lang: BlogLang): string {
  return lang === "tr" ? `${minutes} dk` : `${minutes} min`;
}

/** Yeniden eskiye sıralı yazılar. */
export function sortedPosts(): BlogPost[] {
  return [...POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** Slug ile tek yazı; yoksa undefined. */
export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** Verilen yazı hariç, en yeni n yazı. */
export function relatedPosts(slug: string, count = 3): BlogPost[] {
  return sortedPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, count);
}
