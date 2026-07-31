---
id: matchup_veto_vs_jett
type: matchup
agent_a: veto
agent_b: jett
patch: "13.00"
verified: 2026-07-19
tags: [matchup, veto, jett, sentinel, duelist]
---

# MATCHUP: Veto vs Jett

## Matchup Özü
Veto giriş hazırlığını keser: önleyici cihazı fırlatılan util'i havada imha eder, bağlama alanı yakaladığını sağırlaştırıp hasar verir, ışınlanma noktası onu kurulumuna anında döndürür. Jett ise hazırlığa en az muhtaç duelist — dash'i util değil hareket. Bu yüzden Jett'e karşı Veto'nun değeri cihaz imhasından çok alan kilidinde: dash'in bittiği yeri kilitleyen Veto, hızı tuzağa çevirir.

## Sinyal-Kapılı Dersler

**IF** savunmada round açılışında öldün (side=Savunma, deathTiming=erken) ve düşman kompunda Jett var
**MEANING** Jett'in giriş kozu dash'tir — bağlama alanı giriş ağzında kalırsa dash tek hamlede ötesine iner ve seni alanın örtmediği noktada yakalar
**COUNTER** Bağlama alanını giriş ağzına değil dash'in bittiği site içi iniş noktasına kur; önleyiciyi Jett'in girişini örten duman hattına yerleştir
**WHY** Dash alanın üstünden tek hamlede geçer; iniş noktası kilitliyse Jett yakalanır, dumanı havada imha olursa açık girmek zorunda kalır

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Cihazların hep aynı noktada — Jett önce cihazı vurup sonra giriyor
**COUNTER** Kurulumu her round kaydır; ışınlanma noktası satın alma aşamasında sökülüp yeniden kurulur, bunu kullan
**WHY** Sabit kurulan cihaz bir kez okunduğunda artık sadece hedef tahtası

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Işınlanma noktan takımdan kopuktu — düellon kaybolunca kimse karşılık alamadı
**COUNTER** Işınlanma noktasını takımın tuttuğu hatta kur; geri döndüğünde yalnız değil, çapraz ateşin parçası ol
**WHY** Işınlanma sana iki pozisyon verir ama ikisi de takımsızsa ikisi de mezardır

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Kör etme ve sersemletmeye bağışıklık veren pencereyi hiç açmadın
**COUNTER** Ult'u round'un son düellosuna sakla ve o pencerede düelloyu sen aç — dolu ult'la ölme
**WHY** Ult açıkken Jett'in takımının flaşları sana işlemez; o pencerede düello düz nişan yarışıdır ve hazır olan kazanır

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla Jett'in uzun hattına çıktın — dash'li rakip mesafeyi kapatırken sen silah farkını da taşıyordun
**COUNTER** Bu round kurulumu öne değil geriye kur: bağlama alanını site içindeki dar geçide koy, uzun hattı hiç tutma, dar açıda yakın düello ara
**WHY** Yakın mesafede tabanca ile tüfek arasındaki fark daralır; bağlama alanı orada tetiklenirse düelloyu ekonomi değil kurulum belirler

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e kurulumsuz girdin — Jett post-plant açısını dash'le değiştirebilen tek taraf, sen sabit hattan geldin
**COUNTER** Retake'ten önce ışınlanma noktanı site dışına bırak, önleyiciyi saldırganın post-plant util hattına kur; girişi takımla aynı anda yap, ışınlanmayı ikinci açı için sakla
**WHY** Işınlanma sana retake'te ikinci bir giriş yönü verir — tek koldan giren retake, dash'iyle açı değiştiren savunmaya karşılıksız düşer

**IF** öldün ve killerInfo'daki silah keskin nişancı sınıfıysa (Operator, Marshal, Outlaw)
**MEANING** Jett uzun hattı silahla kilitledi ve dash'i kaçış sigortası olarak tutuyor — o hatta ikinci kez göründün
**COUNTER** O hattı o round tamamen boş bırak; önleyiciyi ve bağlama alanını Jett'in çekilme hattına taşı. Atış sesinden sonra üstüne bas: dash'i harcadıysa kaçışı yok
**WHY** Uzun hatta ilk görüş kazanır; hattı boş bırakmak Jett'in silahını değersizleştirir, çekilme hattını kilitlemek onu silahsız yakalar

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Kurulumun tükendikten sonra düz düello aradın — Veto'nun geç round değeri silahta değil, ult'un açtığı pencerede
**COUNTER** Sayı azaldıysa dövüşü sen açma: uzak açıya çekil, süreyi oynat. Ult'un varsa düşman util'ini üstüne çektikten sonra aç ve düelloyu o pencerede başlat
**WHY** Kötü etkilerin işlemediği pencerede düello düz nişan yarışına iner — hazır olan kazanır; penceresiz geç round düellosu kurulumsuz sentinel için kayıptır

## Koç Notları
Jett az util fırlatır, önleyicinin işi bu eşleşmede azalır — değerin bağlama alanının yerinde. Alanı bir round girişe, bir round Jett'in kaçış hattına kur: dash'ini girişte harcayan Jett dönüş yolunda alana basar ve sağır, hasarlı, yalnız yakalanır.
