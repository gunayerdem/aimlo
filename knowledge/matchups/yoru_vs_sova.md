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

## Koç Notları
Kopya ile ışınlanmanın sırasını her round değiştir: bir round önce kopya sonra ışınlanma, sonraki round tersi. Sıra sabitse Sova hangi tetiklemenin gerçek olduğunu çözer — çözemeyen Sova her tetiklemeye dart harcar ve keşif ekonomisi çöker.
