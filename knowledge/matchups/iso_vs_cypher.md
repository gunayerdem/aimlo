---
id: matchup_iso_vs_cypher
type: matchup
agent_a: iso
agent_b: cypher
patch: "13.00"
verified: 2026-07-19
tags: [matchup, iso, cypher, duelist, sentinel]
---

# MATCHUP: Iso vs Cypher

## Matchup Özü
Cypher'ın teli sana değil silahına bilgi taşır: tel tetiklendiği an hattın ucunda hazır bir ilk atış bekler. Iso'nun tek kurşunluk kalkanı tam bu atışı yer — kalkanla giren Iso, tel bilgisinin hazırladığı ilk kurşunu boşa düşürür ve düelloyu kendi lehine açar. Kalkansız temas ise Cypher'ın senaryosudur.

## Sinyal-Kapılı Dersler

**IF** round açılışında öldün (deathTiming=erken) ve düşman kompunda Cypher var
**MEANING** Kalkansız girdin — telin haber verdiği hazır atış seni ilk temasta düşürdü
**COUNTER** Kalkanı spawn'da değil temastan hemen önce bas; süresi sınırlı — köşeye vardığında hâlâ üstünde olsun
**WHY** Kalkan tek kurşun yer ama Cypher'ın planı zaten tek hazır kurşun üstüne kurulu — o kurşun boşa gidince plan da gider

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Kurulu siteye solo daldın — kalkan ilk atışı yedi, ikincisini yiyecek kimse yoktu
**COUNTER** Duvardan geçen zayıflatmayı tel arkasındaki tutucuya bas, takımla aynı anda gir; kalkan ilk kurşunu, takım gerisini karşılar
**WHY** Zayıflatılan düşman fazladan hasar yer — kalkan + zayıflatma + trade zinciri üçlüsü kurulu siteyi düz düelloya çevirir

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Cypher teli senin rotana taşıdı — giriş alışkanlığın kurulum planına dönüştü
**COUNTER** Rotayı değiştir; kurşun geçirmez enerji duvarını tel koridoruna sür ve arkasından ilerle
**WHY** İlerleyen duvar Cypher'ın hazır açısını kapatır — açısı kapanan Cypher ya çekilir ya duvarın çıkışında beklemek zorunda kalır, iki durumda da tel bilgisi değersizleşir

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Anchor'ı kurulumundan koparma hakkın elinde bekledi
**COUNTER** Ult'u Cypher'a bas: onu tuzaksız düz düelloya çekersin, tuzaklar sahipsiz kalır — takım o pencerede siteyi bassın
**WHY** Cypher'ın gücü kurulumunun başında durmasından gelir — arenaya çekilen Cypher sadece bir tabanca, sahipsiz tel sadece bir ses

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Kalkanın için yetenek parası kalmamışken kurulu siteye girdin — telin hazırladığı ilk kurşunu karşılayacak hiçbir katmanın yoktu
**COUNTER** Eko round'unda giriş yapma: uzak açıdan hangi koldan geldiklerini gör, temas etmeden çekil. Tek yeteneğe paran varsa kalkanı al ve düelloyu dar koridorda ara
**WHY** Kalkan tek kurşun yer; o kurşun tabanca düellosunda round'u çevirir ama kurulu site girişinde yalnızca bir saniye kazandırır

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant açını kalkansız tuttun — retake'te Cypher kamerayla açını okuyup takımını hazır sokuyor
**COUNTER** Plant biter bitmez kalkanı bas ve pozisyonunu al; kamerayı gördüğün an vur. Kurşun geçirmez duvarı defuse hattına sürerek retake'i böl
**WHY** Post-plant'te zaman senin lehine; kalkan retake'in ilk kurşununu yerken duvar defuse'u geciktirir — ikisi birlikte round'u bitirir

**IF** öldün ve killerInfo'daki silah keskin nişancı sınıfıysa (Operator, Marshal, Outlaw)
**MEANING** Uzun hatta göründün — tek atış silah kalkanı da seni de aynı kurşunda geçebilir, kalkan orada sigorta değil
**COUNTER** O hattı boş bırak; kurşun geçirmez duvarı hattın önüne sür ve arkasından ilerle, düelloyu yakın mesafeye taşı
**WHY** Kalkan bir hasar örneğini emer ama tek atışlık silah tek örnekle bitirir — mesafeyi kapatmayan Iso o hatta her round aynı şekilde düşer

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Kalkanın sönmüşken düz düello aradın — yenilenmesi öldürme ister, baskı altında dolmaz
**COUNTER** Sayı azken önce kalkanı tazeleyecek bir düello seç: dar açıda tek düşman izole et, kalkanla gir. İzole edemiyorsan çekil ve süreyi oynat
**WHY** Kalkanlı Iso her düelloya bir kurşun önde başlar; kalkansız Iso sıradan bir tüfekçidir ve geç round'da hata affı yoktur

## Koç Notları
Iso'nun kiti bilgiye karşı değil, bilginin hazırladığı ilk kurşuna karşı güçlüdür. Teli yok sayma — kalkanla, duvarla ve takımla sırala. Düello kazandıkça gelen enerji küresini vurmayı alışkanlık yap: kalkanı tazeleyen Iso, Cypher'ın her hazır atışını üst üste boşa düşürür.
