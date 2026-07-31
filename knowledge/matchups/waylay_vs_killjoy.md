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

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Işık huzmesi elinde bekledi — Killjoy'un kurulu sitesine pencere açmadan girdin
**COUNTER** Ult'u execute'un hemen önüne bas: huzmeye değen savunucular yavaş dövüşür, hız sende olur; pencere açıkken site'a ilk sen gir
**WHY** Kurulu site ancak zaman kazanarak alınır — yavaşlayan anchor cihazlarının arkasına çekilemez, hızlanan Waylay zinciri tek geçişte aşar

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla cihaz zincirinin içine yürüdün — taret hasarı ve silah farkı üst üste bindi
**COUNTER** Eko round'unda zinciri sökmeye çalışma: taretin görüş hattına hiç girme, dash'i kaçış için sakla, düelloyu taretin görmediği dar köşede ara
**WHY** Taret hem hasar hem haber verir; görüş hattına girmeyen oyuncu ikisini de ödemez ve silahını sonraki round'a taşır

**IF** öldün ve killerInfo'daki silah kısa menzilli sınıfsa (Judge, Bucky, Spectre, Stinger)
**MEANING** Killjoy cihazlarının arkasındaki dar açıda seni yakın mesafeye çekti — dash seni tam onun mesafesine götürdü
**COUNTER** Dash'i kör köşeye atma; yavaşlatma topunu köşenin arkasına at, yavaşlayan savunucuyu uzaktan al. Yakın mesafeye ancak taret sustuktan sonra gir
**WHY** Kısa menzilli silah dar açıda tavan değer üretir — mesafeyi sen seçersen dash bir avantaj, o seçerse bir tuzak olur

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Geri-kayma noktan silinmişken ya da dash'in harcanmışken kurulu siteye ikinci hamleyi aldın
**COUNTER** Sayı azken hamleden hemen önce noktayı yeniden bırak; kit boşsa hamle alma, uzak açıya çekil ve süreyi oynat
**WHY** Killjoy'un kurulumu bekleyebilir, senin sigorten bekleyemez — kitsiz alınan geç round hamlesi round'u kapatır

## Koç Notları
Killjoy'a karşı Waylay'in hızı ancak söküm sırasından sonra değerlidir: taret sustur, bot hattını boşa düşür, sonra dash. Yavaşlatma topu bu eşleşmede en çok Killjoy'un kendisine işler — cihazlarının arkasında sabit duran birine atılan yavaşlatma, peek'i peşin kazandırır.
