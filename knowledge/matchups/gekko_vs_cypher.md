---
id: matchup_gekko_vs_cypher
type: matchup
agent_a: gekko
agent_b: cypher
patch: "13.00"
verified: 2026-07-31
tags: [matchup, gekko, cypher, initiator, sentinel]
coverage_note: "B95 (2026-07-31) — Gekko oyuncu tarafında SIFIR matchup dosyasına sahipti (yalnız rol-fallback yükleniyordu)."
---

# MATCHUP: Gekko vs Cypher

## Matchup Özü
Cypher kurulumunu bir kez kurar ve o kurulumla round'u oynar; Gekko'nun yaratıkları ise toplanabildiği sürece geri gelir. Bu eşleşme yıpratma savaşı: Cypher'ın teli tek kullanımlık bilgi verirken senin flaş yaratığın aynı round'da ikinci kez gelebilir. Ama toplanma da bir risk — küreyi toplamaya giden oyuncu açıkta yakalanırsa döngü sende değil, Cypher'da biter.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Cypher var
**MEANING** Tel hattını görmeden dar geçitten girdin — tetiklenen tel seni yavaşlatıp takımına gösterdi
**COUNTER** Dar geçide önce yaratığını gönder: tel tetiklenirse bilgi bedava gelir, tetiklenmezse hat temiz demektir. Sen ancak yaratıktan sonra gir
**WHY** Gekko'nun en ucuz avantajı, tuzağı bedenle değil yaratıkla yoklayabilmesi — tetiklenen tel bir kayıp değil, bir haber olur

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Cypher teli ve kamerayı tekrar ettiğin rotaya taşıdı; yaratığını da hep aynı hattan gönderiyorsun
**COUNTER** Rotayı ve yaratığın hattını her round değiştir; gördüğün kamerayı vur ve ilerlemeden önce yeni kamera aramayı alışkanlık yap
**WHY** Sabit rota Cypher'ın kurulumunu ucuzlatır; değişen rota onu her round yeniden kurmaya zorlar

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Yaratığın açtığı pencerede takım hazır değildi — sen tek başına girdin ve karşılık gelmedi
**COUNTER** Yaratığı takım giriş anına senkronla: flaş açılırken takım geçsin, sen küreyi toplamak için değil düelloyu almak için orada ol
**WHY** Yaratığın açtığı pencere kısa — kullanılmayan pencere hem yeteneği hem sayıyı harcar

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Etkisiz kılan ult'un elinde bekledi — kurulu siteyi util'siz zorlarken kullanmadın
**COUNTER** Ult'u execute'un hemen önüne bas: yakalanan savunucu ne silah ne yetenek kullanabilir, takım o pencerede girsin
**WHY** Cypher'ın gücü kurulumunun başında durmasından gelir; etkisiz kılınan anchor kurulumunu savunamaz

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla kurulu siteye girdin — telin haber verdiği hazır atışa silahsız yürüdün
**COUNTER** Eko'da yaratıklarını bilgi için kullan: dar geçidi yoklat, hangi koldan geldiklerini gör, temas etmeden çekil ve silahı sonraki round'a taşı
**WHY** Yaratıkların ekonomiden bağımsız çalışır ve toplandığında geri gelir — eko round'unda takıma bilgi üreten en ucuz kaynak sensin

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant'te açığı bilgisiz tuttun — Cypher retake'i kamerayla senin yerini bilerek başlattı
**COUNTER** Plant biter bitmez kamerayı ara ve vur; alan hasarı veren yaratığını defuse hattına sakla, botunu spike'ı geri dikmek için değil retake'i geciktirmek için kullan
**WHY** Kamerası kırılan Cypher retake'i kör başlatır; alan hasarı defuse penceresini kapatır ve zaman senin lehine işler

## Koç Notları
Yere düşen küreyi toplamak senin döngünü açık tutar ama toplamaya giden oyuncu açık hedeftir — Cypher tam o alanı tel ve kamerayla izliyorsa küreyi bırak, sayıyı koru. Bot spike'ı hem diker hem söker: post-plant'te herkes düştüyse bile botla defuse denemesi round'u çevirebilir, ama botu gönderirken açıkta dikilme. Kamera vurulup silinir; ilk round'u kameraların yerini bulmaya harca, ikinci round'da sil. Bilgisiz kalan Cypher sıradan bir tüfekçidir.
