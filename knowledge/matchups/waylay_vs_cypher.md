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

**IF** saldırıda round'un ilk saniyelerinde öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Cypher var
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

## Koç Notları
Dash'i harcadıysan ikinci agresif hamleyi alma — kaçış zincirinin kalan halkası geri-kayma, o da iki öldürmeyle yenilenir ve baskı altında dolmaz. Cypher kamera modundayken silahı devrede değil: kamerayı bulduğun an o pencerede bas.
