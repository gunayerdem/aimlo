---
id: matchup_tejo_vs_cypher
type: matchup
agent_a: tejo
agent_b: cypher
patch: "13.00"
verified: 2026-07-31
tags: [matchup, tejo, cypher, initiator, sentinel]
coverage_note: "B95 (2026-07-31) — Tejo oyuncu tarafında SIFIR matchup dosyasına sahipti (yalnız rol-fallback yükleniyordu); meta initiator olarak öncelikli."
---

# MATCHUP: Tejo vs Cypher

## Matchup Özü
Cypher bilgiyi tuzakla toplar, Tejo bilgiyi drone'la toplar ve yeteneklerini kısa süre kapatabilir. Bu, iki bilgi ajanının birbirini kör etmeye çalıştığı eşleşme: Cypher'ın teli senin rotanı okur, senin drone'un onun kurulumunu okur. Kimin bilgisi önce gelirse round da onun senaryosuyla oynanır. Füze barajın ise Cypher'ın en zayıf noktasına basar — sabit tutucu, yerinden sökülünce kurulumunun tamamı sahipsiz kalır.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Cypher var
**MEANING** Tel hattını öğrenmeden standart kapıdan girdin — tetiklenen tel seni yavaşlatıp takımına gösterdi
**COUNTER** Girişten önce drone'u gönder: kamerayı ve teli önce sen gör, takıma bildir. Drone bilgisi gelmeden hiçbir dar geçide commit etme
**WHY** Cypher'ın kurulumu ancak görülmediği sürece değerlidir — görülmüş tel yalnızca bir hedef, görülmemiş tel bir randevu

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Drone'u ve girişini hep aynı hattan yapıyorsun; Cypher teli ve kamerayı o hatta taşıdı
**COUNTER** Drone rotasını ve giriş kolunu her round değiştir; gördüğün kamerayı vurup ilerlemeden önce yeni kamera aramayı alışkanlık yap
**WHY** Tekrar eden rota bilgiyi tersine çevirir: sen düşmanın yerini öğrenirken kendi zamanlamanı da ele verirsin

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Drone'la baktın ama takım arkanda hazır değildi — bilgi tazeyken kimse basmadı, sen tek başına yakalandın
**COUNTER** Drone'u girişten hemen önce kullan ve takım drone havadayken bassın; sersemletmeni köşeye sektir, giriş sersemletme oturduğu saniyede gelsin
**WHY** Bilgi geç kullanılırsa eskir — taze bilgiyle basan takım Cypher'ın kurulumunu hazırlıksız yakalar

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Yönlendirilen patlama hattın elinde bekledi — kurulu siteyi utility ile açmadan gövdeyle zorladın
**COUNTER** Ult'u execute'un hemen önüne bas: hattı savunucunun tutamayacağı yerden geçir, o pozisyonundan sökülürken takım girsin
**WHY** Cypher'ın gücü kurulumunun başında sabit durmasından gelir; yerinden sökülen Cypher tellerini de kameralarını da savunamaz

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla kurulu siteye girdin — telin haber verdiği hazır atışı karşılayacak silahın yoktu
**COUNTER** Eko'da giriş yapma; drone'u bilgi almak için kullan, hangi koldan geldiklerini gör ve temas etmeden çekil. Zorlama alımda sersemletmeyi dar geçide sektirip yakın mesafede bas
**WHY** Drone ekonomiden bağımsız çalışır: eko round'unda bile takıma sonraki round'un planını kuracak bilgiyi verir

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant'te açığı bilgisiz tuttun — Cypher retake'i kamerayla senin yerini bilerek başlattı
**COUNTER** Plant biter bitmez kamerayı ara ve vur; drone'unu retake yönünü öğrenmek için sakla, sersemletmeni defuse hattına ayır
**WHY** Kamerası kırılan Cypher retake'i kör başlatır; bilgiyi elinde tutan post-plant tarafı zamanı da kazanır

## Koç Notları
Kitin sırayla zincirlenir: drone → sersemletme → füze. Zinciri bozmadan oyna, ama drone'u da körlemesine harcama — Cypher onu duyduğu an vurur. Drone'u köşeden ve kısa sürelerle kullan, gördüğünü hemen ilet. Kamera vurulup silinir: ilk round'u kameranın yerini bulmaya harca, ikinci round'da sil. Bilgisiz kalan Cypher sıradan bir tüfekçidir ve senin füzen onu sabit durduğu yerden söker.
