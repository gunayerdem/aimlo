---
id: matchup_jett_vs_phoenix
type: matchup
agent_a: jett
agent_b: phoenix
patch: "13.00"
verified: 2026-07-31
tags: [matchup, jett, phoenix, duelist, duelist]
coverage_note: "B95 (2026-07-31) — Phoenix düşman tarafında SIFIR matchup dosyasıyla temsil ediliyordu."
---

# MATCHUP: Jett vs Phoenix

## Matchup Özü
Phoenix kendi kendine yeten bir duelist: köşeden kıvrılan flaşıyla açar, ateş duvarıyla görüşü keser, molly'siyle dövüş aralarında toparlanır ve ult'unda ölse bile başladığı noktaya döner. Jett'in ona karşı tek üstünlüğü mesafe ve zamanlama: Phoenix uzayan yakın düelloda avantajlıdır, sen düelloyu ilk temasta bitirir ya da hiç almazsın. Bu eşleşmede kaybedilen her uzun düello Phoenix'in lehinedir.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Phoenix var
**MEANING** Kıvrılan flaş köşeden geldi ve girişi flaşın patlamasıyla aynı saniyeye ayarladı — sen körken düelloya girdin
**COUNTER** Flaş sesini duyduğun an arkanı dön, patlama biter bitmez geri dön ve açıyı sen bas; dash'i körken atma, körlük geçtikten sonra at
**WHY** Phoenix girişini senin körlük sürene göre kurar — erken toparlanan Jett'e karşı planı çöker ve düz düelloya kalır

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Dash açını okudu — ateş duvarını tam o hatta kurup seni duvarın çıkışında bekliyor
**COUNTER** Duvar kurulduysa o hattan hiç geçme; açıyı ya da zamanı değiştir, zıplamayla farklı yükseklikten gel. Duvarın içine körlemesine sıkma
**WHY** Ateş duvarı görüşü iki yönde de keser ama Phoenix içinden iyileşerek çıkabilir — duvarın içinde düello arayan taraf her zaman kaybeder

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Takımdan kopuk dash attın; Phoenix seni tek başına yakaladı ve düelloyu uzatarak molly'siyle toparlandı
**COUNTER** Dash'i trade mesafesindeyken at; düelloyu ilk temasta bitiremeyeceksen hiç açma, takım arkadaşının açısına çekil
**WHY** Uzayan düelloda toparlanabilen taraf kazanır — trade zinciri Phoenix'e o nefes penceresini hiç vermez

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Bıçakların doluyken düz tüfek düellosunda düştün; Phoenix'in geri dönüş penceresini kıracak ucuz sayı fırsatını kullanmadın
**COUNTER** Ult'u tüfek alamadığın round'a ve anti-eco'ya sakla; açtığında bir öldürme al ve sıradaki açıya geç
**WHY** Phoenix ekonomiye en dayanıklı duelisttir çünkü ult'u ona bedava bir hayat verir — ekonomik üstünlüğü koruyan taraf bu avantajı dengeler

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla flaş destekli bir duelistin açısına çıktın — hem silah hem util farkı sendeydi
**COUNTER** Eko'da flaş sesini bekle ve o hattı tamamen boş bırak; uzak açıdan hangi koldan geldiklerini gör, temas etmeden çekil, dash'i kaçış için sakla
**WHY** Flaşı boşa patlayan Phoenix sıradan bir yakın mesafe duelisti — util'i boşa harcatmak, eko round'unda kazanılabilecek en büyük avantaj

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant açını duvarın ve molly'nin ulaşabildiği yerde tuttun — Phoenix retake'te tam o alanı kapatıyor
**COUNTER** Plant biter bitmez pozisyonunu al: zıplamayla üst sipere çık ya da uzun açıya çekil, spike'ın dibinde bekleme. Ateş duvarı geldiğinde içinde kalma, hemen yer değiştir
**WHY** Post-plant'te zaman senin lehine; duvarın ve molly'nin ulaşmadığı açıdan tutulan spike, retake'i her seferinde geciktirir

## Koç Notları
Phoenix'in ult'u açıkken üstüne mermi harcama: ölse bile başladığı noktaya döner. Dönüş noktası sesle bellidir — oraya önceden nişanlan ve düelloyu senin şartlarında başlat; dash'ini de o pencerede yeniden konumlanmak için sakla. Ateş duvarının çıkış ucunu hazır crosshair'le tut, duvardan çıktığı ilk an vur. Flaşı boşa patladıysa (kimse körlenmedi, arkasından giriş gelmedi) pencere senindir: mesafeyi aç, uzun açıdan dövüş.
