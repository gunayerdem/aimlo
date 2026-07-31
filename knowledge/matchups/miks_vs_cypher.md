---
id: matchup_miks_vs_cypher
type: matchup
agent_a: miks
agent_b: cypher
patch: "13.00"
verified: 2026-07-31
tags: [matchup, miks, cypher, controller, sentinel]
coverage_note: "B95 (2026-07-31) — Miks oyuncu tarafında SIFIR matchup dosyasına sahipti (yalnız rol-fallback yükleniyordu); yeni controller olarak öncelikli."
---

# MATCHUP: Miks vs Cypher

## Matchup Özü
Cypher görmeye dayalı bir sentinel: teli, kamerası ve çağrıları takımının hazır beklemesini sağlar. Miks'in smoke'u tam o görüşü keser, desteği takımı düellodan sonra ayakta tutar. Ama Miks'in en kırılgan anı destek verdiği andır — destek animasyonundayken silahı devrede değildir ve Cypher'ın teli tam o anı takımına haber verebilir. Bu eşleşme zamanlama savaşı: desteği ne zaman verdiğin, smoke'u nereye koyduğun kadar önemli.

## Sinyal-Kapılı Dersler

**IF** savunmada round açılışında öldün (side=Savunma, deathTiming=erken) ve düşman kompunda Cypher var
**MEANING** Cypher düşman tarafındayken agresif çıktın ve tel bilgisi olmadan açık açı tuttun
**COUNTER** Erken çıkışları takım arkadaşının açısıyla eşle; smoke'unu kendi geri çekilme hattına değil, düşmanın seni gördüğü hatta koy
**WHY** Controller'ın ilk teması vermesi en pahalı ölümdür: sen düşersen takım round boyunca smoke'suz oynar

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Smoke'unu ve durduğun köşeyi tekrar ediyorsun — Cypher teli ve kamerayı tam o hatta taşıdı
**COUNTER** Smoke düzenini ve durduğun yeri her round kaydır; kendi dumanının hep aynı kenarında bekleme
**WHY** Sabit smoke düzeni düşmana bedava bilgi verir; dumandan çıkacağın yeri bilen taraf açıyı önceden nişanlar

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Destek verdiğin ya da smoke attığın anda yalnızdın — o pencerede silahın devrede değildi ve karşılık gelmedi
**COUNTER** Desteği ve smoke'u kapağın arkasında ver, açık açıda verme; takım arkadaşın seni görecek mesafede olsun
**WHY** Destek animasyonu seni kısa süre savunmasız bırakır — o pencereyi kapak arkasında geçiren Miks bedava ölüm vermez

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Ses dalgan elinde bekledi — kurulu hattı ya da retake'i utility ile açmadan gövdeyle zorladın
**COUNTER** Ult'u girişin hemen önüne bas: dalganın ardından takım aynı anda girsin, sen ikinci sırada gir
**WHY** Cypher'ın gücü kurulumunun başında sabit durmasından gelir; savrulan anchor tellerini de kamerasını da savunamaz

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla açık hatta çıktın — smoke'unu da kendi geçişin için harcadın
**COUNTER** Eko'da smoke'u takımın toplu geçişi için kullan, tek başına giriş için değil; desteği dövüş öncesi değil dövüş sonrası ver, hasarlı arkadaşını sıradaki düelloya tam gönder
**WHY** Smoke ve destek ekonomiden bağımsız çalışır — eko round'unu kazandıran şey silah değil, bu iki kaynağın doğru sırası

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e kurulumsuz girdin — Cypher takımdayken bile retake'i tek başına açmaya çalıştın
**COUNTER** Retake'ten önce toplan: smoke'u spike bölgesine at, hız desteğini girişe bağla, ult'un varsa girişte kullan. Sayı sende değilse hiç girme
**WHY** Retake'te ölçek sayıdır; smoke ile bölünen crossfire ve aynı anda giren takım site'ı geri alır, tek tek giren eritir

## Koç Notları
Cypher'ın kamerası vurulup silinir: kamerayı gördüğün an ilet, gerekiyorsa vur — bilgisi kesilen Cypher sıradan bir tüfekçidir. Smoke'unu Cypher'ın tuttuğu uzun hatta koyup takımın geçişini oradan açmak bu eşleşmenin en verimli hamlesi; ama dumandan çıkan ilk silüeti bekleyen açı da var, o yüzden kendi dumanının kenarında oyalanma. Desteğini savaş arasına sakla: hasarlı bıraktığın arkadaşını iyileşmiş göndermek, Cypher'ın kurulum avantajını en çok eriten şey.
