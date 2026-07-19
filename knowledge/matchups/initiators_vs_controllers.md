---
id: matchup_initiators_vs_controllers
type: matchup
patch: "13.00"
verified: 2026-07-19
tags: [matchup, initiator, controller, role_fallback]
---

# MATCHUP: Initiator vs Controller

## Ne Oluyor Burada
Controller senin keşfini dumanla kör eder: taradığın açı dumanın arkasındaysa bilgi gelmez, yeteneğin perdeye çarpar. Senin işin keşfi dumanın zamanına göre kurmak — perde kalkarken tara, perdenin ortasına değil. Dumanla savaşılmaz; dumanın ömrü okunur.

## Ucuza Ölüm Kalıpları

**IF**: Round'un erken anında öldün (died, deathTiming=erken) ve rakip kompta controller var (enemyComp)
**MEANING**: Controller'lı kompa karşı erken ölümün klasik kalıbı kör temastır: keşif ya perdeden önce harcanır ya hiç atılmaz — perde indiğinde el boş kalır, temas bilgisiz gelir.
**COUNTER**: Keşfi girişin açılış penceresine sakla: duman sönerken ya da takım harekete geçerken tara — perdenin arkası tam o pencerede değerlidir. Erken atılan keşfin bilgisi duman düştüğü an eskir.
**WHY**: Duman geçicidir; keşfin değeri dumanın söndüğü pencereyle çakıştığında tavan yapar. Erken tarama eskir, geç tarama round'u kaçırır.

**IF**: Saldırıdaydın, spike kuruluydu ve öldün (died, side=Saldırı, spikePlanted=true)
**MEANING**: Post-plant'te keşif görevi bitmedi — asıl şimdi başladı. Retake hangi koldan geliyorsa onu görmeyen takım, spike'ı köşe tutarak korumaya çalışır.
**COUNTER**: Post-plant'te keşfini retake koluna harca: savunmanın dönüş hattını tara, geleni takım önceden görsün. Spike'ı silah değil bilgi korur.
**WHY**: Retake'i önceden gören takım crossfire'ını kurar; görmeyen takım ilk temasta açı kaybeder ve spike başında sırayla ölür.

**IF**: Öldün, takım arkadaşın trade'ini alamadı (died, tradedByAlly=false) ve rakip kompta controller var (enemyComp)
**MEANING**: Tek başına temas verdin; controller'lı kompa karşı bu temas çoğu zaman perdenin tuttuğu dar bir geçişte gelir — kenarı tutan oyuncu hazır nişanla bekler, geçen taraf nişanını temas anında kurar.
**COUNTER**: Dar geçişlerden yalnız ve yeteneksiz geçme: önce çıkış açısını sarsıntı ya da keşifle süpür, arkanda trade alacak biri varken geç.
**WHY**: Kenar tutuşuna karşı iki sigortan var — tutuşu bozan yetenek ve ölümü karşılıksız bırakmayan takım arkadaşı. İkisi de yoksa temas bedavaya gider.

## Tekrarlayan Ölüm Ne Anlama Gelir
Controller'lı kompa üst üste ölüyorsan keşfinle dumanın saati uyuşmuyor demektir. Keşif dumandan önce gidiyorsa bilgi eskiyor; hiç gitmiyorsa kör yürüyorsun. Dumanın ömrünü round'un saati yap: perde düştü — bekle; perde kalkıyor — tara ve geç.

## Koç Notları
Controller'a karşı en değerli sayaç duman sayısıdır: kaç duman atıldı, kaç kaldı? Dumanı biten controller çıplaktır — keşfini o pencereye denk getirirsen bilgin karşılıksız kalmaz. Post-plant'te rol değişir: artık site açmıyorsun, siteyi tutuyorsun — keşif de girişe değil retake koluna akar.
