---
id: matchup_harbor_vs_sage
type: matchup
agent_a: harbor
agent_b: sage
patch: "13.00"
verified: 2026-07-08
tags: [matchup, harbor, sage, controller, sentinel]
---

# MATCHUP: Harbor vs Sage

## 1. Matchup Özü

Harbor koridoru duvarla kapatır ve giriş açar. Sage dar geçidi duvarıyla kilitler, girişi keser. İkisi de alan satar ama farklı yoldan: Harbor'un duvarı ilerler, Sage'in duvarı sabit durur. Biri inisiyatifi alır, diğeri tepki verir. Kendi planıyla önce koyan kazanır; rakibin util'ine TEPKİ olarak harcamak zorunda kalan round'da geri düşer.

## 2. Kim Avantajlı?

**Harbor lehine durumlar:**
- Haven A Long, Icebox Mid gibi uzun koridorlarda Harbor duvarı koridorun tamamını kapatır; Sage'in duvarı sadece yarısını örter.
- Sage duvarını kurmadan Harbor duvarı gelirse Sage'in sabit cevabı kalmaz, giriş hattı açılır.
- Spike kurulduktan sonra Harbor koruma kubbesiyle defuse alanına siper verir; Sage'in yavaşlatma alanı defuse sesini duyurur ama defuse'u durduramaz.
- Execute round'larında Harbor duvar + kubbe ile iki hatta birden siper basar; Sage tek duvarla iki hattı kapatamaz.

**Sage lehine durumlar:**
- Bind Showers, Split Mid gibi dar geçitlerde Sage duvarı tek noktayı komple kapatır; Harbor duvarı aynı alanda fazladan değer katmaz.
- Bir savunmacı düşünce Sage ult'uyla onu diriltirse Harbor'un execute util'i çoktan harcanmıştır, takım aynı yere tekrar giremez.
- Harbor kubbesi zaten kullanılmışsa spike üstündeki siper zayıflar; Sage yavaşlatma alanıyla defuse'u zorlar.
- Retake round'larında Sage yavaşlatma + duvar retake koridorunu daraltır, Harbor tepki vermek zorunda kalır.

**Dengeli:** Haven, Sunset, Ascent orta hatlarında iş eşit. Harbor duvarını Sage duvarı kurulmadan açarsa Sage'in hattı bozulur. Sage duvarını önce kurarsa Harbor duvarını hattın dışından geçirmek zorunda kalır.

## 3. Önemli Düellolar

**IF** Harbor duvarı Sage duvarının önünden geçti
**MEANING** Sage hattın arkasını göremez, giriş yönü tamamen Harbor'un elinde
**COUNTER** (Sage için) Duvarını Harbor duvarının arkasına değil bağımsız bir hatta kur. Ya da yavaşlatmayı Harbor duvarının çıkış noktasına at; duvar düştüğünde giren takım yavaşlasın.
**WHY** Harbor duvarı ilerler, senin duvarın sabit. İkisi üst üste binerse Harbor duvarı senin gözünü kapatır. Senin duvarının değeri, Harbor duvarından bağımsız bir hat kurmakta.

---

**IF** Sage yavaşlatma alanı Harbor execute girişindeki dar geçide düştü
**MEANING** Harbor takımı yavaşlatmaya basarsa giriş hızı düşer, Sage crossfire'a hazır bekler
**COUNTER** Harbor duvarını yavaşlatma alanının üstüne at — Sage'in görüşünü keser, hedefini göremez. Kubbeyi yavaşlatma alanının iç çeperine koy, takım yavaştan çıkarken siper alsın.
**WHY** Yavaşlatma hem ses hem hareket kısıtı verir — yavaş giren oyuncuyu Sage bedavaya vurur. Harbor util'i sesi kesmez ama görüşü keser — Sage yavaşlatmanın içindeki oyuncuyu göremezse avantajı biter.

---

**IF** Sage ult'unu Harbor execute sonrası ilk trade'de kullandı
**MEANING** Sage ilk ölen savunmacıyı geri getirdi; Harbor takımı aynı site'ı baştan temizlemek zorunda ve util'i bitti
**COUNTER** Dirilen savunmacının kalktığı noktayı işaretle. Diriliş bitip savunmacı hareket etmeden baskıyı bas, trade'i al.
**WHY** Diriliş tamamlanana kadar savunmacı savunmasızdır. O pencerede Harbor takımı hazırsa diriliş bedavaya gelmez. Bu noktayı bilmeden oynamak Sage'e bedava round verir.

---

**IF** Harbor ult'u Sage ve partnerinin hattına atıldı
**MEANING** İki oyuncu aynı anda sersemler, Sage sağlıklı duvar kuramaz, Harbor takımı serbest girer
**COUNTER** (Sage için) Ult'un sesini duyduğun an alandan çık. Duvarını alanın dışına önceden kur.
**WHY** Harbor ult'u nişanı bozar ve sersemletir. Sage'in duvar kurulumu bu pencereyle çakışırsa duvar heba gider. Alanın dışına çıkan Sage util'ini kurtarır.

---

**IF** Sage B'de tek başına bekliyor, Harbor A'da execute hazırlıyor
**MEANING** Sage'in rotasyon mesafesi uzun; koşarken yavaşlatma veya duvar kuramaz
**COUNTER** Harbor A'ya sahte util at; Sage B duvarını kurmadan rotasyona girsin. Rotasyon hattında Sage util'siz kalır — Harbor'un gerçek util'i dönüşe hazırdır.
**WHY** Sage'in gücü beklediği pozisyonda. Hareket halindeyken util'inin değeri düşer. Harbor tempo silahı — proaktif açar, Sage tepki vermek zorunda kalır.

---

**IF** Harbor kubbesi spike üstündeyken Sage yavaşlatması kubbenin içine atıldı
**MEANING** Yavaşlatma görüşü örtmez ama defuse edenin hızını keser; defuse uzar, savunmacılar ekstra zaman kazanır
**COUNTER** Kubbenin açısını yavaşlatmanın düşüş hattından kaydır. Kubbenin çeperi geçidi örtsün, spike'ın tam merkezini değil.
**WHY** Kubbe görsel siper, yavaşlatma hareket kısıtı. İkisi farklı eksende çalışır. Kubbeyi spike'ın tam merkezine atarsan Sage yavaşlatma + retake hattıyla takımını defuse'dan koparır.

---

**IF** Harbor duvarı Sage duvarı kurulduktan sonra aynı geçide geldi
**MEANING** İki sabit hat aynı geçitte; iki tarafın da siperi var, giriş yavaşladı
**COUNTER** Harbor duvarını Sage duvarı kurulmadan önce kullan — Sage geçidin iç yüzünü göremez, duvar cevabı geç kalır.
**WHY** Harbor'un avantajı tempo, Sage'in avantajı tepki. Harbor önceden açarsa Sage tepki vermek zorunda kalır. Harbor sonradan açarsa Sage proaktif duvarla durdurur.

## 4. Utility Sırası

Harbor dört util'le oynar: uzun kıvrılan duvar, ilerleyen dalga duvarı, koruma kubbesi ve ult. Sage üç savunma util'i ve bir tempo kartıyla gelir: duvar, yavaşlatma alanı, heal ve diriliş ult'u.

Harbor her util'ini önden koyar, Sage cevap verir. Sage duvarını önce kurarsa Harbor duvarını hattın dışına açmak zorunda kalır. Harbor duvarı önce gelirse Sage'in duvarı artık geri pozisyonda kalır.

İnisiyatifi alan taraf bu sırayı kendi lehine kırar:
- Harbor dalga duvarıyla geçidi örter.
- Sage duvarını Harbor duvarının dışına kurar.
- Harbor ilerleyen duvarıyla Sage duvarını aşar.
- Sage yavaşlatmayı Harbor duvarının çıkış noktasına düşürür.
- Harbor kubbeyle spike üstünü örter.
- Sage heal ile retake sırasında canları dengeler.

Ult karşılaşması: Harbor ult'u alanı açar, Sage ult'u trade'i geri alır. Aynı round ikisi birden patlarsa Harbor ult'u önce gelsin, anında giriş bas, diriliş tamamlanmadan savunmacıyı trade et.

## 5. Haritaya Göre Değişim

**Haven (Harbor):** 3 site, Sage'in rotasyon yolu uzun — A Long ve C Long için duvar değeri yüksek.
**Bind / Split (Sage):** Showers, Hookah, B Main dar ve dikey — Sage duvar + yavaşlatma kombosu geçidi komple kapatır, Harbor duvarı fazladan değer katmaz.
**Ascent / Sunset (Dengeli):** çift geçitli yapı — kimin duvarı önce geldiyse o round'u götürür.

## 6. Koç Notları

**Rotasyon oku:** Bu matchup'ı rotasyon üzerinden oku. Harbor geniş hatlı haritalarda açılır, Sage dar geçit haritalarında parlar. İkisi aynı haritada karşılaşırsa Harbor'un işi Sage duvarı kurulmadan kendi duvarını açmak.

**Harbor oynuyorsan:**
- Duvarını Sage'in duvarı kurulmadan aç.
- Kubbeyi spike kurulana kadar sakla.
- Ult'unu Sage'in util hattının tam üstüne kilitle.

**Sage oynuyorsan:**
- Duvarını Harbor duvarı gelmeden önceden kur — tepkiyle değil.
- Yavaşlatmayı Harbor kubbesinin alanının dışına at.
- Diriltmeyi ilk ölen anchor için sakla, girişçi için harcama.

**Özet:** Harbor tempo getirir, Sage tepki verir. Sage önce hareket ederse roller tersine döner. Rakibin util'ine tepki olarak util harcamaya mecbur kalan taraf kaybeder.

## 7. Diriliş Tehdidi

Düşman kompunda Sage varsa takımın aldığı her kill beden tehdididir: sayıyı Sage ölmeden ya da bedeni güvenceye almadan kesin sayma. Harbor'un cevabı alan kesmek — duvarı beden ile Sage'in geliş hattı arasına çek: duvardan geçen Sage yavaşlar ve açığa çıkar, takımın onu bedava vurur. Bedeni gören açıyı takıma tuttur: dirilten Sage beden başında sabit ve savunmasız — bedava kill; kalkan oyuncu silahıyla doğar ama kalkış ânında nişanı hazır değildir, açı sende kaldıkça ikinci sayı da gelir.
