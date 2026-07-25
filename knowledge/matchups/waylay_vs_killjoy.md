---
id: matchup_waylay_vs_killjoy
type: matchup
agent_a: waylay
agent_b: killjoy
patch: "13.00"
verified: 2026-07-19
tags: [matchup, waylay, killjoy, duelist, sentinel]
---

# MATCHUP: Waylay vs Killjoy

## Matchup Özü
Killjoy taret + bot + molly zinciri kurar; zincir normal giriş temposuna göre ayarlıdır. Waylay'in dash'i ve yavaşlatma topu zinciri sırayla söker — ama sırasız girersen zincir seni söker. Bu eşleşmenin sorusu tek: ilk halkayı kim kırıyor, sen mi taret mi?

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Killjoy var
**MEANING** Taret + bot seni girişte karşıladı — hızın kurulumu değil, kurulum hızını yendi
**COUNTER** Önce taret silahla susturulsun (sen ya da takım), dash'i taret sustuktan sonra harca
**WHY** Taret otomatik tarar ve seni takımına haber verir; taret ayaktayken atılan dash bedava bilgi ve bedava hasar demektir

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Killjoy molly'yi tekrar ettiğin giriş hattına hazırlıyor — sen daha köşeye varmadan alan doluyor
**COUNTER** Giriş açısını her round değiştir; yavaşlatma topunu Killjoy'un tuttuğu köşeye at, peek'i sen kazan
**WHY** Killjoy sabit kuruluma bağlıdır — giriş açısı değişince zinciri taşımak round'unu yer, sen o boşlukta girersin

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Zinciri solo kırmaya çalıştın — bir halkayı geçtin, sonrakinde yalnız yakalandın
**COUNTER** İlk halkayı takım kırsın, sen hızını ikinci halkada harca; geri-kayma noktanı takım hattına bırak
**WHY** Zincir sırayla sökülür — solo giren zincirin tamamını tek başına yer

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Killjoy'un retake kozu ult'tur — post-plant'ta en büyük risk o alana yakalanmak; sabit beklemek seni bu riske açık bırakır
**COUNTER** Ult sesini duyduğun an alandan çık; dash'in duruyorsa kaçış için sakla, plant sonrası boş yere harcama
**WHY** Alan içinde yakalanan oyuncu savunmasızdır — dash tek kullanımlık, post-plant'ta o tek kullanım hayat sigortandır

## Koç Notları
Killjoy'a karşı Waylay'in hızı ancak söküm sırasından sonra değerlidir: taret sustur, bot hattını boşa düşür, sonra dash. Yavaşlatma topu bu eşleşmede en çok Killjoy'un kendisine işler — cihazlarının arkasında sabit duran birine atılan yavaşlatma, peek'i peşin kazandırır.
