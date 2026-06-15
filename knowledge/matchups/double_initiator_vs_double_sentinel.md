---
id: matchup_double_initiator_vs_double_sentinel
type: matchup
patch: "9.x"
tags: [matchup, composition, double-initiator, double-sentinel, meta]
---

# MATCHUP: Double Initiator vs Double Sentinel

## 1. Matchup Özü

Double initiator (Sova + KAY/O, Breach + Skye, Fade + Gekko) bilgi üretir — flash, recon ve hasar oku ile site'ı görmeden girer. Double sentinel (Killjoy + Cypher, Chamber + Killjoy, Deadlock + Cypher) bilgi kapatır — tuzak, bot ve tel ile seni görmeden durdurur.

Bu matchup tek şeye bakar: bilgiyi topla, o bilgiyi girişe çevir, kazan. Karşı taraf o bilgiyi keser ve telini tetikletirse o kazanır. İkisi de yarım iş yaparsa maç uzar.

## 2. Kim Avantajlı

**Double initiator lehine:**
- Harita açık ve geniş angle'lıysa (Breeze, Icebox) — flash + recon zinciri site'ı tarar, tuzak hattı kaplayamaz
- Sentinel ikilisi setup kurmadan saldırı başlarsa — tuzak hattı aktif değil, giriş temiz
- Ult ekonomisi initiator tarafında doluysa — iki ult zinciri site'ı boşaltır, sentinel ult'u boşsa retake çıplak kalır
- Sentinel ikilisi ayrı site'lara bölündüyse — trade partner zinciri koptu, tek tek alırsın
- Post-plant util initiator'da kaldıysa — savunmanın en zayıf noktası retake fazıdır

**Double sentinel lehine:**
- Harita dar koridor ağırlıklıysa (Bind, Split, Fracture) — tuzak hattı koridoru kapatır, flash'ın yeri yok
- Initiator util'i erken patladıysa — ikinci baskı için elin boş, sentinel rahat bekler
- Sentinel ikilisi iki farklı angle'da setup kurduysa — tuzak + bot + molly üst üste, giriş çok pahalı
- Savunma full-buy ve setup her round farklı yerdeyse — initiator bir önceki bilgiyi kullanamaz
- Kadroda duelist yoksa — entry sadece util'e kaldı, tuzak hattı her girişi tag'ler

## 3. Önemli Düellolar

**IF** Double initiator recon + flash zincirini arka arkaya attı
**MEANING** Tuzak hattı bilgi verdi ama flash anında savunma körleşti — giriş penceresi şu an açık
**COUNTER** Flash sesini duyduğun an duvara dön. Recon tag'ini rotate sinyali olarak oku, görmezden gelme. Flash geçtikten sonra telini yeni pozisyona çek
**WHY** Bu zincir sırayla çalışır: recon bilgi verir, flash körleştirir, entry baskı kurar. Halkalardan birini koparırsan zincir kırılır, savunma penceresini geri alırsın.

---

**IF** Double sentinel ikilisi ayrı site'lara bölündü (Killjoy A, Cypher B)
**MEANING** Rotate yavaşladı, trade partner zinciri koptu — her sentinel tek başına kaldı
**COUNTER** Tek site'a tam commit et. Bölünmüş sentinel'in boş kalan site'ı var, oraya yüklen. Trade partner mid hattındaysa rotate'ini kes
**WHY** Double sentinel'in gücü iki setup'ın birbirine yakın durmasıdır. Bölündüğünde iki yarım sentinel olur, artık double sentinel comp değildir.

---

**IF** Initiator ult ekonomisi dolu, sentinel ult ekonomisi boş
**MEANING** İki ult arka arkaya site'ı boşaltır — sentinel ult'u yoksa retake çıplak kalır
**COUNTER** Sentinel ult'u beklemeyi bırak, setup'ı derinleştir — iki tuzak + iki tel + double molly zinciri ult'un işini görür
**WHY** Ult dengesi bozulduğunda matchup ult dolduran tarafa döner. Initiator ult'unu girişte yakar, sentinel ult'unu post-plant için saklar — ikisi aynı roundda patlarsa sentinel retake'i alır.

---

**IF** Double sentinel saldırı tarafında force-buy yaptı
**MEANING** Killjoy + Cypher saldırıda entry açamaz — util var ama giriş yok, duelist gibi oynayamazlar
**COUNTER** Savunmada close angle hold kur, saldırı zayıflığını sömür — util'siz gelen sentinel'ı telinle yakala
**WHY** Double sentinel savunmada tam güç, saldırıda yarım kalır. Bu dengesizlik skorboarda yansır: savunma yarısında 10+ round, saldırı yarısında 5-7 round.

---

**IF** Recon, Cypher'ın telinin tam üzerine düştü ve tel açığa çıktı
**MEANING** Tuzak hattı söküldü, o round sentinel'in savunma ekonomisi sıfırlandı
**COUNTER** Teli, initiator recon angle'ından uzak gizli bir hatta koy. Bot + tel kombosu flash koruması sağlar — flash'tan önce tel tetiklenirse konumun belli olmaz
**WHY** Görünen tuzak ölümcüldür. Görünmeyen tuzağı initiator söküp sökmediğini bilemez — bilemediği tuzağı tetikler, tetiklenen tuzak sana bilgi verir.

---

**IF** Double initiator retake sırasında site dışında kaldı, sentinel post-plant molly attı
**MEANING** Tüm util entry'de patladı, post-plant için elin boş — molly'e cevabın yok
**COUNTER** Util'i böl: yarısı entry'e, yarısı post-plant'e. KAY/O molly'sini ve Breach molly'sini post-plant için sakla
**WHY** Initiator'un işi sadece girmek değil, post-plant da senin görevin. Tüm util entry'de biterse retake çıplak kalır.

---

**IF** Sentinel ikilisi aynı açıyı tutuyor (Killjoy + Chamber aynı A Long)
**MEANING** Savunma üst üste yığıldı, diğer site trade partner olmadan solo kaldı — rotate gelmez
**COUNTER** Diğer site'a commit et. İki sentinel aynı angle'daysa comp double sentinel değil, gereksiz sentineldir — diğer site boştur
**WHY** Double sentinel değer üretir çünkü iki farklı angle'da baskı kurar. Aynı angle'da yığılırsa avantaj sıfırlanır.

## 4. Utility ve Kaynak Dengesi

Initiator util'i tükenir — her round sıfırdan açarsın. Sentinel util'i kurulur — round başında setup'ı dizer, round boyunca bekletirsin. Bu farkın anlamı şu: initiator her round kaynağını harcar, sentinel kurduğu setup'ı birkaç round koruyabilir.

Ult ekonomisinde tablo tersine döner. Initiator ult'ları savunmada daha hızlı dolar (recon kill, ult orb). Sentinel ult'ları uzun maçlarda geride kalır. Maç uzadıkça ult baskısı initiator tarafına geçer.

Sonuç: round sayısı 15'in altındayken sentinel setup baskısı yüksektir — her giriş tuzak hattına çarpar. Round sayısı 20'yi geçtiğinde initiator ult stoku dolmuştur — o rounddan itibaren giriş baskısı artar, sentinel ult'u yoksa site'ı boşalt.

## 5. Haritaya Göre Değişim

**Bind (double sentinel avantajlı):** TP rotate + Hookah + Showers dar geçitleri tuzak hattının evidir. Flash sentinel telini bulamaz, TP rotate zinciri kapanır.

**Breeze (double initiator avantajlı):** Geniş site alanları tuzak hattını dağıtır, kaplatmaz. Recon zinciri site'ı tarar, giriş temiz olur.

**Icebox (double initiator avantajlı):** Dikey oyun + uzun görüş hattı recon ve flash için biçilmiş kaftandır. Sentinel tuzak hattı dikey ekonomide yetersiz kalır.

**Ascent (dengeli):** Mid Courier initiator için, A ve B site sentinel içindir. Mid kontrolünü kim alırsa matchup ona açılır.

**Lotus (double sentinel avantajlı):** Üç site + döner kapı sentinel'e katmanlı setup izni verir. Initiator bilgi toplar ama tuzak hattı her round yenilenir.

**Haven (dengeli):** Üç site initiator util'ini dağıtır, sentinel tek site'ta yoğunlaşır. Her round site seçimi matchup'ı belirler.

**Split (double sentinel avantajlı):** Dar koridor + dikey oyun tuzak hattının evidir. Savunma tarafında double sentinel Split'te 10+ round alır.

**Sunset (double initiator avantajlı):** A Main açık angle + Mid initiator util hattı. Sentinel tuzak hattı tek site'a sıkışır.

## 6. Dönüm Noktaları

**Flip 1 — Util harcama sırası:** Initiator util'i erken patladıysa double sentinel retake'i alır. Util'i yarısı entry'e yarısı post-plant'e ayırdıysan her iki fazda da baskı kurarsın, sentinel retake çıplak kalır.

**Flip 2 — Tuzak görünürlüğü:** Tuzak hattı ilk roundda açığa çıktıysa initiator ikinci roundda o hattı siler, double sentinel çöker. Gizli kalırsa sentinel matchup'ı kilitler.

**Flip 3 — Ult dengesi:** Initiator ult'u dolu + sentinel ult'u boşsa o round initiator'ındır. Tersi olduğunda sentinel retake'te üstündür.

**Flip 4 — Saldırı yarısı:** Double sentinel saldırıda zayıf, initiator saldırıda güçlüdür. Yarı sonundaki round farkı matchup'ı belirler.

**Flip 5 — Trade zinciri:** Sentinel trade partner'ı kopmuşsa entry rahattır. Trade zinciri sağlamsa her giriş tag'lenir.

## 7. Koç Notları

Double initiator + duelist kadrosu (KAY/O + Sova + Jett) Breeze ve Icebox'ta birinci tercihtir. Double sentinel ise harita spesifiktir — Bind, Split, Lotus'ta çalışır, Breeze ve Icebox'ta dağılır. Dar haritada sentinel al, açık haritada initiator al.

Double initiator comp'ta en sık yaptığın hata: iki initiator'ın aynı util türünü atması. Sova recon rolünde, KAY/O flash rolünde olmalı. İkisi aynı işi yaparsa comp'ın değeri yarıya iner.

Double sentinel comp'ta en sık yaptığın hata: saldırıda sentinel agent'larını duelist gibi oynatmak. Saldırıda işin entry açmak değil — rifle taşıyan oyuncuyu desteklemek ve post-plant molly saklamak.

Sentinel aktif bilgi üreticisidir: tel tetiklendiğinde konum bilgisi alırsın, bot tag'lediğinde düşman pozisyonu açığa çıkar. Bu bilgiyi rotate'e çevir — çevirmezsen sentinel boşa gitmiş demektir.

**Koç testi:** Double initiator bilgi toplar, double sentinel bilgi kapatır. Bilgiyi girişe çeviremiyorsan util'i ikiye böl ve post-plant fazında elinde tut. Bilgiyi kapatıp rotate'i yönetemiyorsan Killjoy'u A'dan B'ye çek, Cypher'ı Mid'e koy. İkisi de aynı anda eksikse Bind veya Split'te sentinel, Breeze veya Icebox'ta initiator comp seç.
