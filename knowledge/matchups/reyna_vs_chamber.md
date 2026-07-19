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
Chamber tek atışlık silahlarla (Headhunter tabancası, Tour de Force keskin nişancısı) uzun açı tutar; tuzağı girişini haber verir, ışınlanması onu kaybettiği düellodan sıyırır. Reyna'nın dalışı bu kitin tam menüsü: açık açıya düz giren Reyna tek atışa bedava hedeftir. İlk öldürmeyi alamayan Reyna hiçbir şeydir — o ilk öldürmeye tek atış menzilinden değil, kırık timing'le ve izole açıdan ulaş.

## Sinyal-Kapılı Dersler

**IF** öldün ve killerInfo'daki silah Headhunter / Tour de Force / Operator gibi tek-atış silahıysa
**MEANING** Uzun açıya düz peek attın — tek atış silah ilk görüşte kazanır, sen o görüşü bedava verdin
**COUNTER** O hatta düz çıkma: duvardan geçen kör eden gözü köşe arkasına at, Chamber bakışını kesince gir; ya da o açıyı tamamen boş bırakıp yakın temas arayan rotayı seç
**WHY** Kör edilen ya da yaklaşılan Chamber silah değerini kaybeder — mesafe onun silahı, mesafeyi kapatan Reyna'nın

**IF** round'un ilk saniyelerinde öldün (deathTiming=erken) ve düşman kompunda Chamber var
**MEANING** İlk saniyelerde uzun hatta koştun — Chamber açısı en çok round başında hazırdır
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

## Koç Notları
Chamber'a karşı zincirin ilk halkası asla onun tuttuğu uzun açıda değildir. Kırık timing + kör eden göz + yakın rota: ilk öldürme oradan gelir, gerisi ruh zinciri. Öldürdüğünde kaçışını açı değiştirmek için kullan — Chamber ışınlanmayla yeni açı alır; aynı açıda ikinci atışı bekleyen Reyna'nın zinciri orada biter.
