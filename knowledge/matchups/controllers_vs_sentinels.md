---
id: matchup_controllers_vs_sentinels
type: matchup
patch: "13.00"
verified: 2026-07-19
tags: [matchup, controller, sentinel, role_fallback]
---

# MATCHUP: Controller vs Sentinel

## Ne Oluyor Burada
Sentinel alanı kilitler ve hızlı girişi cezasız bırakmaz; controller o kilidi yavaş yavaş söker. Bu eşleşmede tempo senin seçimin: sentinel kurulumu acele eden takıma karşı en güçlü, sabırla sökülen execute'a karşı en zayıftır.

## Ucuza Ölüm Kalıpları

**IF**: Saldırıda erken öldün (died, side=Saldırı, deathTiming=erken) ve rakip kompta sentinel var (enemyComp)
**MEANING**: Kurulmuş bir site'a hızla girdin — sentinel cihazları tam bunu bekler: ilk giren tuzağı yer, arkası alarmla karşılanır.
**COUNTER**: Execute'u yavaşlat. Tuzak temizliğini takımın utiline bırak; sen perdeyi tuzak hattı açıldıktan sonra at — smoke'un tuzağın önüne değil, tuzağın arkasındaki tüfeğin gözüne insin.
**WHY**: Sentinel kurulumu tempo yer; tempoyu sen düşürürsen kurulum dekor kalır.

**IF**: Seni keskin nişancı tüfeği öldürdü (killerInfo silahı keskin nişancı)
**MEANING**: Keskin nişancı hattına perdesiz göründün. Sentinel'li komp uzun hattı keskin nişancıyla tutmayı sever — kilitli alan ona güvenli yuva verir, arkasından dolaşan olmaz.
**COUNTER**: O hatta smoke inmeden görünme. Smoke indiğinde de aynı çizgiden çıkma — keskin nişancı perde kalktığında eski açıya kilitlenir; farklı kenardan, farklı yükseklikten çık.
**WHY**: Keskin nişancıya karşı perdesiz uzun hat düello değil, hedef talimidir.

**IF**: Rakip kompta Sage var (enemyComp)
**MEANING**: Sage ayaktayken düşürdüğün rakip kesin kayıp değildir — düşen oyuncu bedeninin olduğu yerde ayağa kaldırılır ve bitti sandığın düello aynı noktada yeniden başlar.
**COUNTER**: Bir rakip düşürdüğünde o açıyı hemen çöpe atma: ya düşenin açısını bir an tut ve ayağa kalkanı cezalandır, ya da yer değiştirip eski açına perde bırak.
**WHY**: Diriltme hep aynı adreste olur — adresi bilen ve tutan taraf o düelloyu iki kez kazanır.

## Tekrarlayan Ölüm Ne Anlama Gelir
Sentinel'li kompa sürekli ölüyorsan tempon yanlış: kilitli alana kilidin beklediği hızla giriyorsun. Sıra hiç değişmez — kilidi utility söker, perde arkasını örter, tüfek en son konuşur. Bu sırayı atlayan controller kendi takımının perdesini de boşa harcar.

## Koç Notları
Controller sentinel'in doğal panzehiridir: onun gücü sabit kurulumda, seninki o kurulumu görünmez kılmakta. Uzayan round'dan korkma — kurulumu sökülmüş sentinel yeteneksiz bir çapa oyuncusudur ve site'ı perdene karşı tek tüfekle tutar.
