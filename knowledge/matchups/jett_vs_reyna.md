---
id: matchup_jett_vs_reyna
type: matchup
agent_a: jett
agent_b: reyna
patch: "13.00"
verified: 2026-07-31
tags: [matchup, jett, reyna, duelist, duelist]
coverage_note: "B95 (2026-07-31) — Reyna düşman tarafında yalnız 1 dosyayla temsil ediliyordu (raze_vs_reyna); Jett+Reyna en çok oynanan iki ajan olduğu için bu eşleşme rol-fallback'e düşüyordu."
---

# MATCHUP: Jett vs Reyna

## Matchup Özü
İki duelist de ilk düelloyu almak için var ama ödülleri farklı: Jett kazandığı düellodan dash'le sıyrılır, Reyna kazandığı düellodan iyileşmiş çıkar. Yani Reyna'nın kiti ancak öldürünce açılır, Jett'inki öldürmeden de çalışır. Bu eşleşmenin tek kuralı şu: Reyna'ya ilk öldürmeyi verme. Zinciri hiç başlamayan Reyna sıradan bir tüfekçidir; bir kez başlayan Reyna'yı yıpratma savaşıyla durduramazsın.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Reyna var
**MEANING** Agresif savunma yapan Reyna ilk temasa senin girdiğin saniyede geldi — dash'i utility'siz açtın ve kör eden gözün önüne düştün
**COUNTER** İlk temasa dash'le değil util'le git: smoke ya da flash inmeden geniş açıya çıkma. Kör eden küreyi gördüğün an bir adım geri çekil, körlük geçerken açıyı sen bas
**WHY** Reyna'nın tek öncü avantajı kör + sürpriz; körlenmemiş bir Jett'e karşı düz düello vermek zorunda kalır ve orada dash'in reflekse ihtiyacı yoktur

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Dash açını ve zamanını okudu — Reyna küresini tam o köşeye atıp seni çıkarken bekliyor
**COUNTER** Ya açıyı ya zamanı değiştir: bir round zıplamayla üstten gel, bir round dash'i bir an geciktirip peek'e dönenleri yakala. Ölüm yerini adıyla söyle ve o açıyı bir round tamamen boş bırak
**WHY** Kör eden küre atılacak yeri bilmek ister; bilinmeyen açıya küre atılamaz, atılamayan küre Reyna'yı kitsiz bırakır

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Takımdan kopuk dash attın — Reyna seni tek başına yakaladı ve o öldürmeyle zincirini başlattı
**COUNTER** Dash'i takım arkadaşların seni trade'leyebilecek mesafedeyken at; ilk düelloyu kaybetsen bile arkandaki karşılık Reyna'nın iyileşmesini kesintiye uğratsın
**WHY** Trade'lenen ölüm Reyna'ya zincir vermez — iyileşmesini kapak arkasında tamamlayamayan Reyna sıradaki düelloyu eksik açar

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Bıçakların doluyken tüfek düellosunda öldün; Reyna'nın zincirini kıracak ucuz sayı penceresini hiç kullanmadın
**COUNTER** Ult'u tüfek alamadığın round'a ve anti-eco'ya sakla; açtığında bir öldürme al ve hemen sıradaki açıya geç, aynı yerde ikinci hedefi bekleme
**WHY** Reyna'nın kartopu ancak bedava öldürme bulunca büyür — ekonomik üstünlüğü koruyan taraf o bedava öldürmeleri hiç vermez

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Reyna eko round'unun en tehlikeli rakibi: tek bedava öldürme ona hem silah hem zincir veriyor, sen tabancayla düello aradın
**COUNTER** Eko'da işin sağ kalmak: uzak açıdan hangi koldan geldiklerini gör, temas etmeden çekil, dash'i kaçış için sakla. Düello alacaksan yakın mesafede ve takımla birlikte al
**WHY** Bir eko ölümü Reyna'ya iyileşme + silah + moral verir; verilmeyen ölüm onun kitini o round tamamen kapalı tutar

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e dash'le tek başına daldın — post-plant'te bekleyen Reyna için tek tek gelen retake bedava zincirdir
**COUNTER** Retake'i takımla senkronla: util defuse'u geciktirsin, sen dash'i ilk açıyı kapatmak için değil temizlenmiş hattan sürpriz yön almak için kullan. Sayı sende değilse hiç girme, silahı taşı
**WHY** Retake'te ölçek sayıdır; tek tek giren her oyuncu Reyna'nın iyileşme döngüsünü besler ve site'ı geri alınamaz hâle getirir

## Koç Notları
Reyna'yı öldürdüğünde iş bitmez: kaçışıyla dokunulmaz sıyrılabilir. Dokunulmazken mermi harcama — gideceği kapağı nişanla ve çıkış anını bekle. Kör eden kürenin canı var: uzaktan gördüğün küreyi patlat, patlatamıyorsan körlük alanından çık ve çıkacağı açıya crosshair'i tut. Ult'lu Reyna'ya karşı düelloyu uzatma; ilk teması takım ateşiyle bitir, dash'ini de o pencerede kaçış için sakla.
