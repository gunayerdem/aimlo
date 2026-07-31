---
id: matchup_waylay_vs_cypher
type: matchup
agent_a: waylay
agent_b: cypher
patch: "13.00"
verified: 2026-07-19
tags: [matchup, waylay, cypher, duelist, sentinel]
---

# MATCHUP: Waylay vs Cypher

## Matchup Özü
Cypher bilinen yolları kapatır; Waylay bilinmeyen yoldan gelir. Dash seni duvar üstüne ve yan rotalara taşır — tel seviyesinin üstünden geçersin. Ama dash tek kullanımlık: girişte harcarsan kaçışın geri-kaymaya kalır, o da kısa ömürlü bir ışık noktası. Bu eşleşme rota okuma savaşı — tel senin rotanı mı okuyor, sen telin yerini mi?

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Cypher var
**MEANING** Tel hattını görmeden standart kapıdan yürüdün — Cypher'ın kurulumu seni takımına haber verdi
**COUNTER** Dash'i standart kapıdan değil yüksek ya da yan rotadan kullan; ilk atım yukarı da taşır, tel seviyesinin üstünden geç
**WHY** Yerdeki tel yerden yürüyeni tutar — Waylay yerden gitmek zorunda olmayan tek taraftır, bu avantajı kapıdan yürüyerek çöpe atma

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Cypher teli ve kamerayı tekrar ettiğin rotaya taşıdı — yaratıcı rotan artık bilinen rota
**COUNTER** Rotayı her round değiştir; gördüğün tel ve kamera konumunu takıma bildir
**WHY** Tuzak yalnızca okuduğu rotayı yakalar — rota değiştikçe Cypher kurulumunu sıfırdan kurmak zorunda kalır

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Solo derin girdin ve geri-kayma noktan da takımdan uzaktaydı — düşünce kimse karşılık alamadı
**COUNTER** Geri-kayma noktasını her hamle öncesi yeniden ve takımın görebildiği hatta bırak; hep aynı köşeye bırakırsan dönüşünde seni bekleyen olur
**WHY** Geri-kayma seni bıraktığın noktaya götürür — o nokta okunursa sigorta tuzağa döner, takımsızsa mezara

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Işık huzmesi elinde bekledi — kurulu açıyı kırmadan düz düello aldın
**COUNTER** Ult'u giriş anında aç: değdiğini güçsüzleştirir ve sana hız verir — güçsüzleşen Cypher açısını tutamaz
**WHY** Ult hasar vermez, pencere açar; pencereyi açmadan giren Waylay sıradan bir duelist

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla kurulu siteye giriş denedin — dash mesafeyi kapatıyor ama tel bilgisi hazır atışı zaten kurmuş
**COUNTER** Eko round'unda giriş yapma: dash'i kaçış için sakla, uzak açıdan hangi koldan geldiklerini gör, temas etmeden çekil. Zorlama alımda düelloyu dar geçitte ara
**WHY** Kurtardığın silah sonraki round'un tam alımını kurar; kurulu siteye tabancayla giren Waylay hem sayıyı hem parayı verir

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Plant sonrası açığı dash'siz tuttun — Cypher retake'te kamerayla açını okuyup takımını hazır sokuyor
**COUNTER** Plant biter bitmez yerini al: geri-kayma noktanı post-plant açının hemen arkasına bırak, kamerayı gördüğün an vur. Dash'i girişte harcadıysan açıyı dar tut
**WHY** Post-plant'te zaman senin lehine; kamerası kırılan Cypher retake'i kör başlatır ve senin geri-kayma sigortan düelloyu ikinci kez açar

**IF** öldün ve killerInfo'daki silah keskin nişancı sınıfıysa (Operator, Marshal, Outlaw)
**MEANING** Cypher'ın takımı uzun hattı silahla kilitledi ve tel o hatta ne zaman geleceğini haber verdi
**COUNTER** O hattı boş bırak: dash'in seni yukarı da taşıyabilir, yan ya da yüksek rotadan gir. Yavaşlatmayı tutulan açının önüne at, atış sesinden sonra bas
**WHY** Uzun hatta ilk gören kazanır; hattı hiç kullanmayan Waylay tel bilgisini de değersizleştirir

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Geri-kayma noktan çoktan silinmişken agresif hamle aldın — kısa ömürlü sigortayı geç round'da kullanılamaz hâle getirdin
**COUNTER** Sayı azken hamleden hemen önce noktayı yeniden bırak; bırakamıyorsan hamleyi hiç alma, uzak açıya çekil ve süreyi oynat
**WHY** Sigortasız Waylay sıradan bir duelist; geç round'da kaybedilen düello round'u da kapatır

## Koç Notları
Dash'i harcadıysan ikinci agresif hamleyi alma — kaçış zincirinin kalan halkası geri-kayma, o da iki öldürmeyle yenilenir ve baskı altında dolmaz. Cypher kamera modundayken silahı devrede değil: kamerayı bulduğun an o pencerede bas.
