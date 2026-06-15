---
id: matchup_harbor_vs_sage
type: matchup
agent_a: harbor
agent_b: sage
patch: "9.x"
tags: [matchup, harbor, sage, controller, sentinel]
---

# MATCHUP: Harbor vs Sage

## 1. Matchup Özü

Harbor koridoru duvarla kapatır ve push açar. Sage choke'u duvarıyla kilitler, push'u keser. İkisi de alan satar ama farklı yoldan: Harbor'un duvarı ilerler, Sage'in duvarı sabit durur. Biri inisiyatifi alır, diğeri tepki verir. Kim önce util koymak zorunda kalırsa o round'da geri düşer.

## 2. Kim Avantajlı?

**Harbor lehine durumlar:**
- Lotus A Main, Pearl B Long gibi uzun koridorlarda Harbor duvarı koridorun tamamını kapatır; Sage'in duvarı sadece yarısını örter.
- Sage duvarını kurmadan Harbor duvarı gelirse Sage'in sabit cevabı kalmaz, push hattı açılır.
- Spike kurulduktan sonra Harbor cove ile defuse alanına cover verir; Sage'in yavaşlatma alanı defuse sesini duyurur ama defuse'u durduramaz.
- Execute round'larında Harbor duvar + cove ile iki hatta birden cover basar; Sage tek duvarla iki hattı kapatamaz.

**Sage lehine durumlar:**
- Bind Showers, Split Mid gibi dar choke'larda Sage duvarı tek noktayı komple kapatır; Harbor duvarı aynı alanda fazladan değer katmaz.
- Bir savunmacı düşünce Sage ult'unu kullanıp onu diriltirse Harbor'un execute util'i çoktan harcanmıştır, takım aynı yere tekrar giremez.
- Harbor cove zaten kullanılmışsa spike üstündeki cover zayıflar; Sage yavaşlatma alanıyla defuse'u zorlar.
- Retake round'larında Sage yavaşlatma alanı + duvar retake koridorunu daraltır, Harbor tepki vermek zorunda kalır.

**Dengeli:** Haven, Sunset, Ascent orta hatlarında iş eşit. Harbor duvarını Sage duvarı kurulmadan açarsa Sage'in hattı bozulur. Sage duvarını önce kurarsa Harbor duvarını hattın dışından geçirmek zorunda kalır.

## 3. Key Düellolar

**IF** Harbor duvarı Sage duvarının önünden geçti
**MEANING** Sage hattın arkasını göremez, push yönü tamamen Harbor'un elinde
**COUNTER** Duvarını Harbor duvarının arkasına değil tam içine kur — Harbor duvarı içinden geçemez, push yönünü bloklarsın. Ya da yavaşlatmayı Harbor duvarının çıkış noktasına at; duvar düştüğünde giren takım yavaşlasın.
**WHY** Harbor duvarı ilerler, senin duvarın sabit. İkisi üst üste binerse Harbor duvarı senin gözünü kapatır. Senin duvarının değeri, Harbor duvarından bağımsız bir hat kurmakta.

---

**IF** Sage yavaşlatma alanı Harbor execute girişindeki choke'a düştü
**MEANING** Harbor takımı yavaşlatmaya basarsa giriş hızı düşer, sen crossfire'a hazır beklersin
**COUNTER** Harbor duvarını yavaşlatma alanının üstüne at — Sage'in görüşünü keser, crossfire hedefini göremez. Cove'u yavaşlatma alanının iç çeperine koy, takım yavaştan çıkarken cover alsın.
**WHY** Yavaşlatma hem ses hem hareket kısıtı verir: ses Sage'e bilgi taşır, hareket kısıtı Harbor takımını yavaşta yakalar — yavaş giren oyuncuyu Sage bedavaya vurur. Harbor util'i sesi kesmez ama görüşü keser — Sage yavaşlatmanın içindeki oyuncuyu göremezse avantajı biter.

---

**IF** Sage ult'unu Harbor execute sonrası ilk trade'de kullandı
**MEANING** Sage ilk ölen savunmacıyı geri getirdi; Harbor takımı aynı site'ı baştan temizlemek zorunda ve util'i bitti
**COUNTER** Dirilen savunmacının iniş noktasını önceden işaretle. Cove'u o noktaya kaydır — diriliş animasyonu bitip savunmacı hareket etmeden cove baskısını bas, trade'i al.
**WHY** Diriliş animasyonu bitene kadar savunmacı hareket edemez. O pencerede Harbor util'i hazırsa diriliş bedavaya gelmez. Bu noktayı bilmeden oynamak Sage'e bedava round verir.

---

**IF** Harbor ult'u Sage ve partnerinin hattına atıldı
**MEANING** İki oyuncu aynı anda etkilenir, Sage duvar kuramaz, Harbor takımı serbest girer
**COUNTER** Ult'un sesini duyduğun an alandan çık. Duvarını alanın dışına önceden kur. Alanın içinde kalıp hasar alırsan round biter.
**WHY** Harbor ult'u nişanı bozar ve sersemletir. Sage'in duvar kurma süresi bu pencereyle çakışırsa kurulum iptal olur, duvar heba gider. Alanın dışına çıkan Sage util'ini kurtarır.

---

**IF** Sage B'de tek başına bekliyor, Harbor A'da execute hazırlıyor
**MEANING** Sage'in rotate mesafesi uzun; koşarken yavaşlatma veya duvar kuramaz
**COUNTER** Harbor A'ya fake util at; Sage B duvarını kurmadan rotate etsin. Rotate hattında Sage util'siz kalır — Harbor'un A util'i dönüşe hazırdır.
**WHY** Sage'in gücü beklediği pozisyonda. Hareket halindeyken util'inin değeri düşer. Harbor tempo silahı — proaktif açar, Sage tepki vermek zorunda kalır. Sage'in statik hesabı tempo karşısında iki siteden birinde mutlaka boşluk açar.

---

**IF** Harbor cove spike üstündeyken Sage yavaşlatma alanı cove içine atıldı
**MEANING** Yavaşlatma görüşü örtmez ama defuse edenin hızını keser; defuse uzar, savunmacılar ekstra zaman kazanır
**COUNTER** Cove açısını yavaşlatmanın düşüş hattından kaydır. Cove'un çeperi choke'u örtsün, spike'ın tam merkezini değil — yavaşlatma spike'a düşerse cove işe yaramaz.
**WHY** Cove görsel cover, yavaşlatma mekanik kısıt. İkisi farklı eksende çalışır. Cove'u spike'ın tam merkezine atarsan Sage yavaşlatma + retake hattıyla takımını defuse'dan koparır.

---

**IF** Harbor duvarı Sage duvarı kurulduktan sonra aynı choke'a geldi
**MEANING** İki sabit hat aynı choke'ta; iki tarafın da cover'ı var, push yavaşladı
**COUNTER** Harbor duvarını Sage duvarı kurulmadan önce kullan — Sage choke'un iç yüzünü göremez, duvar cevabı geç kalır.
**WHY** Harbor'un avantajı tempo, Sage'in avantajı tepki. Harbor önceden açarsa Sage tepki vermek zorunda kalır. Harbor sonradan açarsa Sage proaktif duvarla durdurur.

## 4. Utility Sırası

Harbor dört util'le oynar: ilerleyen duvar, cove, kısa duvar ve ult. Sage üç savunma util'i ve bir tempo util'iyle gelir: duvar, yavaşlatma alanı, heal ve ult diriliş.

Harbor her util'ini önden koyar, Sage cevap verir. Sage duvarını önce kurarsa Harbor duvarını hattın dışına açmak zorunda kalır. Harbor duvarı önce gelirse Sage'in duvarı artık geri pozisyonda kalır.

İnisiyatifi alan taraf bu sırayı kendi lehine kırar:
- Harbor kısa duvarıyla choke'u örter.
- Sage duvarını Harbor duvarının dışına kurar.
- Harbor ilerleyen duvarıyla Sage duvarını aşar.
- Sage yavaşlatmayı Harbor duvarının çıkış noktasına düşürür.
- Harbor cove'la spike üstünü örter.
- Sage heal ile retake sırasında HP'yi dengeler.

Ult karşılaşması: Harbor ult'u alanı açar, Sage ult'u trade'i geri alır. Aynı round ikisi birden patlarsa Harbor ult'u önce gelsin, anında push at, diriliş animasyonu bitmeden savunmacıyı trade et.

## 5. Map Bazlı Değişim

**Lotus (Harbor avantajlı):** A Main ve C Mound geniş — Harbor duvarı choke'un tamamını kapatır. Sage duvarı yalnızca iki slot örter.

**Pearl (Harbor avantajlı):** B Long, Mid Connector ve A Link geniş hatlar. Sage Pearl'de B Main anchor'da güçlü ama A tarafında Harbor serbest oynar.

**Bind (Sage avantajlı):** Showers ve Hookah dar. Sage duvarı choke'u komple kapatır, Harbor duvarı fazladan değer katmaz.

**Split (Sage avantajlı):** B Main ve A Ramps dar ve dikey. Sage'in duvar + yavaşlatma kombosu bu choke'lar için biçilmiş kaftan. Harbor duvarı dikey alanı kapatamaz.

**Ascent (Dengeli):** A Main Harbor'un, B Main Sage'in. Kimin duvarı önce geldiyse o round'u götürür.

**Sunset (Dengeli):** A Main ve B Market çift choke. Harbor cove A Site'ta güçlü, Sage duvarı Market choke'unda güçlü.

**Haven (Harbor hafif avantajlı):** 3 site, Sage'in rotate yolu uzun. Harbor'un A Long ve C Long için duvar değeri yüksek.

## 6. Flip Anlar

**Flip 1 — Duvar zamanlaması:** Sage duvarını Harbor duvarından önce kurarsa round Sage'e döner. Sonra kurarsa duvarı etkisiz kalır, round Harbor'a gider.

**Flip 2 — Cove noktası:** Harbor cove'u spike merkezine atarsa retake zorlaşır. Yanlış açıya atarsa Sage yavaşlatmayla retake hattını açar.

**Flip 3 — Diriliş hedefi:** Sage ult'unu yanlış oyuncuya kullanırsa — HP'si düşük support yerine entry'yi diriltirse — round Harbor'a döner. Doğru anchor'a kullanırsa round Sage'e gider.

**Flip 4 — Harbor ult'unun isabeti:** Harbor ult'u Sage hattını tutarsa duvar kurulumu iptal olur, round Harbor'a. Tutmazsa Sage alanın dışından duvarını kurar, round Sage'e.

## 7. Koç Notları

**Rotate oku:** Bu matchup'ı rotate üzerinden oku. Harbor geniş hatlı map'lerde açılır — Lotus, Pearl. Sage dar choke map'lerinde parlar — Bind, Split. İkisi aynı map'te karşılaşırsa Harbor'un işi Sage duvarı kurulmadan kendi duvarını açmak. Sage duvarı hazırken açılan Harbor duvarı hatta fazladan değer katmaz.

**Harbor oynuyorsan:**
- Duvarını Sage'in duvarı kurulmadan aç.
- Cove'u spike kurulana kadar sakla.
- Ult'unu Sage'in util hattının tam üstüne kilitle.

**Sage oynuyorsan:**
- Duvarını Harbor duvarı gelmeden önceden kur — tepkiyle değil.
- Yavaşlatmayı Harbor cove alanının dışına at.
- Ult dirilişini ilk ölen anchor için sakla, entry için harcama.

**Özet:** Harbor tempo getirir, Sage tepki verir. Sage önce hareket ederse roller tersine döner. Kim önce util koymaya mecbur kalırsa o kaybeder.
