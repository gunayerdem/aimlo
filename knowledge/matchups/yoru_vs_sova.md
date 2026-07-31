---
id: matchup_yoru_vs_sova
type: matchup
agent_a: yoru
agent_b: sova
patch: "13.00"
verified: 2026-07-19
tags: [matchup, yoru, sova, duelist, initiator]
---

# MATCHUP: Yoru vs Sova

## Matchup Özü
Sova keşifle oynar: dart tarar, drone işaretler, takımı senin yerini bilerek girer. Yoru'nun işi o keşfi yalana boğmak — sahte kopya dart'ın taradığı hatta koşarken gerçek Yoru zıt rotadan girer. Ama tarama seni de gösterir: açığa çıktıysan aldatmaca bitmiştir, o round düz düello oynuyorsun demektir.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Sova var
**MEANING** Dart seni gösterdi ve hazır bekleyen düşmana girdin — sürprizin daha kapıda bitti
**COUNTER** Dart çizgisini gördüğün an taranan alandan çık; giriş hamleni tarama bitince yap, açığa çıkmışken commit etme
**WHY** Yoru'nun bütün değeri belirsizlikten gelir — yeri bilinen Yoru, kiti elinden alınmış bir duelist

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Sova dart'ı tekrar ettiğin köşeye ezberden atıyor — sen daha peek atmadan taranıyorsun
**COUNTER** Durduğun köşeyi değiştir; sahte kopyayı eski köşene gönder, dart yalanı tarasın
**WHY** Ezber lineup adrese atılır — adresi değiştirip eski adrese kopya koyarsan Sova'nın bilgisi zehre döner

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Işınlanmayla takımdan koptun — arkada tek başına düştün ve kimse karşılık alamadı
**COUNTER** Işınlanma çıkışını takımın baskı anına bağla: onlar önden vururken sen arkadan çık, iki cephe aynı anda açılsın
**WHY** Solo flank ancak zamanlıysa çalışır — takımdan bağımsız çıkan Yoru, keşif takımı için sıradan bir hedef

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Görünmez yürüyüş elinde bekledi — kurulumun içinden bedava geçme hakkını hiç kullanmadın
**COUNTER** Ult'la savunmanın içinden geç, gördüğün pozisyonları takıma aktar; ult biterken beklendiğin çıkış noktasında durma
**WHY** Çıkış sesi duyulur — Sova dart'ı tam oraya atar; çıkışını taşıyan Yoru bilgiyi bedava alır, taşımayan canıyla öder

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla taranmış alana girdin — dart bilgisi hazır atışı kurmuşken silah farkını da taşıyordun
**COUNTER** Eko round'unda kopyayı yem olarak öne gönder, sen zıt rotadan uzak açı tut; temas etmeden hangi koldan geldiklerini gör ve çekil
**WHY** Kopya ekonomiden bağımsız çalışır — tabancan zayıfken bile yalan bilgi üretebilirsin; kurtardığın silah sonraki round'un alımını kurar

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant açını taranmış bölgede tuttun — Sova retake'te hasar oklarını tam oraya saklıyor
**COUNTER** Plant biter bitmez yer değiştir; dart çizgisini gördüğün an o hattan yana kay. Işınlanma noktanı post-plant açının arkasına bırak, ok gelince oraya sıyrıl
**WHY** Post-plant'te zaman senin lehine; taranmış noktada duran oyuncu utility ile sökülür, yer değiştiren oyuncu defuse penceresini daraltır

**IF** öldün ve killerInfo'daki silah keskin nişancı sınıfıysa (Operator, Marshal, Outlaw)
**MEANING** Dart hattı gösterdi ve uzun açıdaki silah seni ilk görüşte aldı — sürprizin taramayla bitmişti
**COUNTER** O hattı boş bırak; kopyayı hatta gönderip atışı ona harcat, sen ışınlanmayla yandan çık. Atış sesinden sonra bas, ikinci atış hazır olmadan gir
**WHY** Tek atış silahına en ucuz cevap sahte hedeftir — kopyaya harcanan kurşun, sana bedava geçiş penceresi açar

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Kopya ve ışınlanma harcanmışken düz düello aradın — aldatma kiti boşken Yoru sıradan bir duelist
**COUNTER** Sayı azken kit boşsa dövüş arama: uzak açıya çekil, süreyi oynat. Kit doluysa önce kopyayı gönder, sesle takımı ayır, düelloları tek tek al
**WHY** Yoru'nun değeri belirsizlikten gelir; belirsizlik kalmadığında geç round düellosu yalnızca sayı ve silah kaybettirir

## Koç Notları
Kopya ile ışınlanmanın sırasını her round değiştir: bir round önce kopya sonra ışınlanma, sonraki round tersi. Sıra sabitse Sova hangi tetiklemenin gerçek olduğunu çözer — çözemeyen Sova her tetiklemeye dart harcar ve keşif ekonomisi çöker.
