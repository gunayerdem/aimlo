---
id: matchup_vyse_vs_jett
type: matchup
agent_a: vyse
agent_b: jett
patch: "13.00"
verified: 2026-07-19
tags: [matchup, vyse, jett, sentinel, duelist]
---

# MATCHUP: Vyse vs Jett

## Matchup Özü
Jett dash ve sıçramayla hız üzerinden girer; bilgi yerine tempo oynar. Vyse'ın tuzağı ve gizli duvarı tam bunu yakalar — ama yalnızca iniş noktasına kurulursa. Dash havada yön değiştiremez: Jett'in nereye ineceğini okuyan Vyse düelloyu peek başlamadan kazanır. Koridor ortasına kurulan tuzak ise hareket yeteneğinin altında kalır, hiç tetiklenmez.

## Sinyal-Kapılı Dersler

**IF** savunmada round açılışında öldün (side=Savunma, deathTiming=erken) ve düşman kompunda Jett var
**MEANING** Jett dash'le kurulumun oturmadan girdi — tuzağın ya yanlış noktada ya geç kuruldu
**COUNTER** Tuzağı ve gizli duvarı round başında ilk iş kur; giriş ağzına değil, dash'in bittiği iniş noktasına yerleştir
**WHY** Dash sabit bir noktaya taşır; iniş noktası tuzaklıysa Jett kaçamaz — koridor ortasındaki kurulumun ise üstünden akıp geçer

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Jett sabit açını ve tuzak düzenini okudu, girişini ona göre kuruyor
**COUNTER** Tuzağın ve kendi durduğun köşenin yerini her round değiştir
**WHY** Sabit kurulum bir round bilgi verir, ikinci round Jett'e bedava giriş verir — okunan kurulum yalnızca hedef tahtasıdır

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Tuzak hattını tek başına savundun — tetiklenen tuzak bilgi verdi ama sayıyı koruyamadı
**COUNTER** Tuzağı takım arkadaşının gördüğü açıya kur; tetiklendiği an ikiniz birden vurun
**WHY** Vyse'ın kurulumu yavaşlatır ama tek başına öldürmez — değeri çapraz ateşe bağlanınca çıkar

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Silahları bozan ult'un elinde bekledi; Jett'in giriş anını boşa harcadın
**COUNTER** Ult'u Jett commit ettiği anda aç: silahı devre dışıyken tuzak + tüfek zinciriyle bitir
**WHY** Ult giriş penceresinde en değerli — dolu ult'la ölmek en pahalı hata

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Kurulumun için para kalmamışken Jett'in açısını tabancayla tutmaya çalıştın — dash mesafeyi kapatırken silah farkı sende kaldı
**COUNTER** Eko round'unda tek yeteneğini iniş noktasına kur ve o noktaya bakan dar açıda bekle; uzun hattı hiç tutma, düelloyu tuzağın tetiklendiği yerde al
**WHY** Yavaşlayan ya da körlenen Jett dash'inin bittiği yerde çakılı kalır — ekonomi farkını kapatan tek şey o pencere

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e kurulumsuz girdin — post-plant'te Jett açısını dash'le değiştirebiliyor, sen sabit hattan geldin
**COUNTER** Retake'ten önce gizli duvarı defuse hattına, tuzağı saldırganın çekilme yoluna kur; girişi takımla aynı anda yap. Ult'un varsa girişte aç, silahı bozulan savunmacı açısını tutamaz
**WHY** Post-plant'te ölçek sayıdır: aynı anda giren iki kol crossfire'ı böler, tek tek giren retake sayıyı düşmana hediye eder

**IF** öldün ve killerInfo'daki silah keskin nişancı sınıfıysa (Operator, Marshal, Outlaw)
**MEANING** Jett uzun hattı silahla kilitledi; dash'i de kaçış için saklıyor — o hatta ikinci kez göründün
**COUNTER** O hattı o round boş bırak ve kurulumunu Jett'in çekilme hattına taşı; atış sesinden sonra bas, dash harcandıysa kaçışı yok
**WHY** Uzun hatta ilk gören kazanır; hattı terk etmek silahı değersizleştirir, çekilme hattını tuzaklamak silahlı Jett'i kurulumun içine sokar

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Kurulumun tükendikten sonra düz düello aradın — geç round'da Vyse'ın kozu silah değil, silahı bozan ult
**COUNTER** Sayı azken dövüşü sen açma: dar açıya çekil, süreyi oynat, ult'u düşman commit ettiği anda aç ve düelloyu ana silahları kilitliyken al
**WHY** Ana silahı kilitlenen taraf tabancayla dövüşmek zorunda kalır; o pencerede sayı dezavantajı bile telafi edilebilir

## Koç Notları
Jett'e karşı Vyse'ın işi giriş yolunu kapatmak değil, iniş noktasını tuzağa çevirmek. Jett nereye dash atıyor, nereye sıçrıyor — kurulum oraya gider. Aynı düzeni iki round üst üste koyma; Jett bir kez okudu mu önce tuzağı temizler, sonra seni.
