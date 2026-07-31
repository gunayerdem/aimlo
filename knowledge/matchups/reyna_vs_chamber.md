---
id: matchup_reyna_vs_chamber
type: matchup
agent_a: reyna
agent_b: chamber
patch: "13.00"
verified: 2026-07-19
tags: [matchup, reyna, chamber, duelist, sentinel]
---

# MATCHUP: Reyna vs Chamber

## Matchup Özü
Chamber tek atışlık silahlarla (ağır tabancası, ult keskin nişancısı) uzun açı tutar; tuzağı girişini haber verir, ışınlanması onu kaybettiği düellodan sıyırır. Reyna'nın dalışı bu kitin tam menüsü: açık açıya düz giren Reyna tek atışa bedava hedeftir. İlk öldürmeyi alamayan Reyna hiçbir şeydir — o ilk öldürmeye tek atış menzilinden değil, kırık timing'le ve izole açıdan ulaş.

## Sinyal-Kapılı Dersler

**IF** öldün ve killerInfo'daki silah tek-atış silahıysa (Operator, Marshal ya da Chamber'ın ağır tabancası / ult keskin nişancısı)
**MEANING** Uzun açıya düz peek attın — tek atış silah ilk görüşte kazanır, sen o görüşü bedava verdin
**COUNTER** O hatta düz çıkma: duvardan geçen kör eden gözü köşe arkasına at, Chamber bakışını kesince gir; ya da o açıyı tamamen boş bırakıp yakın temas arayan rotayı seç
**WHY** Kör edilen ya da yaklaşılan Chamber silah değerini kaybeder — mesafe onun silahı, mesafeyi kapatan Reyna'nın

**IF** round açılışında öldün (deathTiming=erken) ve düşman kompunda Chamber var
**MEANING** İlk temasa uzun hatta koştun — Chamber açısı en çok round açılışında kuruludur
**COUNTER** İlk teması kısa mesafeli koridorda ara; uzun açıya ancak takım dumanı inince yönel
**WHY** Chamber round başında kurulu ve sabittir; kısa koridor onun kitini geçersiz kılar, ilk öldürme zinciri oradan başlar

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Chamber tuzağını ve açısını tekrar ettiğin girişe kurdu — sen kapıya varmadan haberi var
**COUNTER** Rotayı değiştir; tuzak sesini duyduğun an o girişi kes, başka kapıdan gir
**WHY** Tuzak bilgiyi Chamber'a taşır — bilinen giriş, tek atış silah için randevudur

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Ateş hızı veren ult'un elinde bekledi ve uzun açı düellosunda düştün
**COUNTER** Ult'u uzun açı düellosuna değil yakın temasa sakla; o pencerede aç ve zinciri başlat
**WHY** Ult'un ateş hızı yakın mesafede Chamber'ın tek atış ritmini ezer — uzun açıda ise tek kurşun yine kazanır

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Chamber'ın tuttuğu hatta solo girdin — tek atış silah ilk teması aldı, arkanda karşılık verecek kimse yoktu
**COUNTER** O hatta tek başına girme: kör eden gözü köşeye at, takım arkadaşınla aynı anda çık, ilk düelloyu ikiniz birden alın
**WHY** Reyna zincire muhtaç ve zincir ancak ilk öldürmeyle başlar — solo düşen Reyna'da kit hiç çalışmaz, tek atış silah da bedava sayı alır

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla Chamber'ın uzun hattına çıktın — o hatta ekonomi farkı en acımasız yerdir
**COUNTER** Eko round'unda uzun hattı hiç görme: dar koridora çek, beş kişi tek boğazdan yakın mesafede bas ya da temas etmeden geri çekilip silahı taşı
**WHY** Yakın mesafede tek atış silah yavaş kalır; kalabalık ve dar geçit ekonomi farkını kapatan tek düzendir

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant açını uzun hatta tuttun — Chamber retake'te o hattı silahıyla açar, sen ona bedava görüş verdin
**COUNTER** Post-plant pozisyonunu uzun hattan uzağa, dar açıya al; kör eden gözü defuse hattına sakla. Öldürdükten sonra kapağa çekilme kuralın burada daha sert işler
**WHY** Post-plant'te zaman senin lehine; uzun hatta görünmeyen Reyna, Chamber'ı yakın mesafede düello vermeye zorlar

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Zincir hiç başlamamışken düz düello aradın — iyileşmen ve kaçışın öldürmeye bağlı, ikisi de kapalıydı
**COUNTER** Sayı azken önce zinciri başlatacak izole bir düello ara: sesle tek düşman ayır, kör eden gözü at, gir. İzole edemiyorsan çekil ve süreyi oynat
**WHY** Zinciri başlamamış Reyna kitsizdir; geç round'da kitsiz alınan düello round'u da kapatır

## Koç Notları
Chamber'a karşı zincirin ilk halkası asla onun tuttuğu uzun açıda değildir. Kırık timing + kör eden göz + yakın rota: ilk öldürme oradan gelir, gerisi ruh zinciri. Öldürdüğünde kaçışını açı değiştirmek için kullan — Chamber ışınlanmayla yeni açı alır; aynı açıda ikinci atışı bekleyen Reyna'nın zinciri orada biter.
