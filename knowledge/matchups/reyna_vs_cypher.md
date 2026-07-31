---
id: matchup_reyna_vs_cypher
type: matchup
agent_a: reyna
agent_b: cypher
patch: "13.00"
verified: 2026-07-19
tags: [matchup, reyna, cypher, duelist, sentinel]
---

# MATCHUP: Reyna vs Cypher

## Matchup Özü
Cypher tuzak ağıyla senin rotanı okur; Reyna öldürmeden hiçbir şeydir ve tel, ilk teması hazır bekleyen düşmana verir. Bu eşleşme rota savaşıdır: telin yerini bilen Reyna serbesttir, bilmeyen Reyna okunmuştur. Zincir ancak ilk öldürmeyle başlar — o ilk öldürmeyi telin haber vermediği yerden al.

## Sinyal-Kapılı Dersler

**IF** öldün ve aynı giriş rotasında tekrarlanan ölüm var (repeatedPosition)
**MEANING** Aynı rotadan giriyorsun — tel ve kamera tam o rotada seni bekliyor, Cypher her girişini takımına önceden bildiriyor
**COUNTER** Rotayı her round değiştir; gördüğün tel ve kamera konumunu takıma bildir
**WHY** Bilinen tuzak tuzak değildir — ama rotası bilinen Reyna, tuzağın kendisidir

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Cypher kurulumuna solo daldın — tel tetiklendiğinde yalnızdın, düşman hazırdı, karşılık gelmedi
**COUNTER** Kurulu siteye takımla gir: tel tetiklense bile arkandaki trade zinciri sayıyı korur
**WHY** Reyna kill zincirine muhtaç — zincir hiç başlamadan solo düşersen Cypher tek telle round'u kapatmış olur

**IF** round açılışında öldün (deathTiming=erken) ve düşman kompunda Cypher var
**MEANING** Tel hattını öğrenmeden hazır kuruluma commit ettin — ilk temas Cypher'ın senaryosuyla oynandı
**COUNTER** Girişten önce duvardan geçen kör eden gözü köşeye at: tel arkasında bekleyen Cypher bakışını kesmek zorunda kalır, ilk atış sana döner
**WHY** Göz vurulup kırılsa bile o an Cypher'ın gözü tellerinde değil göz küresindedir — pencere senin

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Ult penceresi elinde bekledi — görünmez kaçış hakkını hiç açmadan tel hattında düştün
**COUNTER** Ult'u ilk temastan önce aç: öldür, görünmez sıyrıl, kameranın takibinden çık, sıradaki açıya geç
**WHY** Ult penceresinde kaçışın seni görünmez yapar — Cypher'ın bütün kiti görmeye dayalıdır, görmediği Reyna'yı hiçbir tel tutamaz

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla kurulu siteye girdin — tel bilgisi hazır atışı kurmuşken senin tek avantajın olan öldürme zinciri hiç başlamadı
**COUNTER** Eko round'unda giriş yapma: telin haber vermediği uzak açıdan hangi koldan geldiklerini gör, temas etmeden çekil, silahı sonraki round'a taşı
**WHY** Reyna'nın kiti öldürmeyle açılır; tabancayla kurulu siteye giren Reyna zinciri başlatamadan hem sayıyı hem parayı verir

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant açını kameranın gördüğü yerde tuttun — Cypher retake'i senin yerini bilerek başlattı
**COUNTER** Plant biter bitmez kamerayı ara ve vur; pozisyonunu kameranın görmediği dar açıya al. Bir öldürme alınca hemen kapağa çekilip iyileşmeni tamamla
**WHY** Kamerası kırılan Cypher retake'i kör başlatır; iyileşme döngüsü kapak arkasında tamamlanırsa retake'i tek başına da eritebilirsin

**IF** öldün ve killerInfo'daki silah keskin nişancı sınıfıysa (Operator, Marshal, Outlaw)
**MEANING** Telin haber verdiği hatta uzun mesafede göründün — kör eden göz o mesafede vurulup patlatılır
**COUNTER** O hattı boş bırak; düellonu dar geçide taşı, gözü duvar arkasından köşeye at ve patlarken çık. Atış sesinden sonra bas, ikinci atış hazır olmadan gir
**WHY** Kör eden gözün değeri yakın mesafede; uzakta vurulan göz hem kiti hem sürprizi harcar

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Zincir hiç başlamamışken kurulu alanda düello aradın — iyileşmen ve kaçışın kapalıydı
**COUNTER** Sayı azken tel hattından uzak dar açıya çekil, sesle tek düşman izole et, gözü at ve zinciri o düelloyla başlat; izole edemiyorsan süreyi oynat
**WHY** Kitsiz Reyna sıradan bir tüfekçi; zincir ancak izole düelloyla başlar, kalabalığa giren geç round Reyna'sı round'u kapatır

## Koç Notları
Kamera vurulup silinir — ilk round'u kameranın yerini bulmaya harca, ikinci round'da sil. Bilgisiz kalan Cypher sıradan bir tüfekçidir ve Reyna'nın zinciri tam orada başlar. Tel tetiklediysen geri çekilme kararını hızlı ver: tetiklenen tel üstüne yürümek, hazır düşmana ikinci kez aynı hediyeyi vermektir.
