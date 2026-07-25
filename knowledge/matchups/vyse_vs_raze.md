---
id: matchup_vyse_vs_raze
type: matchup
agent_a: vyse
agent_b: raze
patch: "13.00"
verified: 2026-07-19
tags: [matchup, vyse, raze, sentinel, duelist]
---

# MATCHUP: Vyse vs Raze

## Matchup Özü
Raze kurulumu uzaktan söker: nade tuzağı patlatır, sıçrama onu kurulumun üstünden taşır. Tek katmanlı Vyse kurulumu Raze'e karşı yaşamaz. Cevap katmandır — tuzak ile gizli duvarı üst üste diz: nade ilkini temizlese bile Raze inişte ikincisine basar.

## Sinyal-Kapılı Dersler

**IF** savunmada round açılışında öldün (side=Savunma, deathTiming=erken) ve düşman kompunda Raze var
**MEANING** Sıçramayla inen Raze'i tek katman karşıladı — nade kurulumunu girmeden önce süpürdü
**COUNTER** Tuzağı görünür giriş ağzına değil köşe arkasına, nade hattının ulaşamadığı noktaya kur; gizli duvarı ikinci katman olarak arkasına ekle
**WHY** Nade ancak gördüğü ya da ezberlediği noktayı temizler; saklı ve katmanlı kurulum Raze'i iniş anında yakalar

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Raze sabit köşene nade lineup'ı hazırladı — sen daha peek atmadan hasar geliyor
**COUNTER** Durduğun köşeyi ve tuzak düzenini her round taşı
**WHY** Raze'in lineup'ı adrese atılır; adres değişirse nade boş köşeye düşer

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Dar koridoru solo tuttun — Raze'in nade'si tek başına duran savunucuya en çok işler
**COUNTER** Çapraz açı kur: sen tuzağın bir yanında, takım arkadaşın diğer açıda; Raze inişte ikinize birden dönemez
**WHY** Raze'in patlayıcıları tek hedefe tavan değer üretir; iki açıya bölünen savunma o değeri yarılar

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Silahları bozan ult'un elinde bekledi — Raze'in commit anını boşa harcadın
**COUNTER** Ult'u Raze siteye commit ettiğinde aç; silahı devre dışıyken mesafeni koru, patlayıcı menzilinin dışından bitir
**WHY** Silahı bozulan Raze hasar için yakın mesafe patlayıcısına mahkum kalır — mesafe onun tek cevabını da alır

## Koç Notları
Raze'e karşı kurulumun görünmez ve katmanlı olması tek başına yetmez: iniş noktasını oku. Raze aynı sıçrama hattını iki round üst üste kullandıysa ikinci katmanı tam iniş noktasına çek — hareket yeteneği havada yön değiştiremez, okunan iniş bedava sayıdır.
