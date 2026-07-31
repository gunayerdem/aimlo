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

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Raze eko round'unda en pahalı rakip: patlayıcıları ekonomiden bağımsız çalışır, senin kurulumun ise paraya bağlı
**COUNTER** Az parayla tek yetenek alabiliyorsan onu göze görünmeyen köşeye kur ve o köşeden uzakta bekle; patlayıcı ezber noktaya gelir, sen orada olma
**WHY** Raze'in patlayıcısı adrese atılır — adreste durmayan savunucu hasarı yemez ve düelloyu kendi mesafesinde alır

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e girerken Raze'in patlayıcılarının dar retake koridorunda tavan değer ürettiğini hesaba katmadın
**COUNTER** Retake'e yayılarak gir, tek sıra hâlinde koridordan girme; gizli duvarı defuse hattına kur, ult'un varsa girişte aç
**WHY** Patlayıcı tek kümeye tavan hasar verir — yayılan retake o değeri yarıya indirir; silahları kilitlenen saldırgan siperini de koruyamaz

**IF** öldün ve killerInfo'daki silah kısa menzilli sınıfsa (Judge, Bucky, Spectre, Stinger)
**MEANING** Raze yaklaştı ve yakın mesafede sıçrama + kısa menzil kombosu kurdu — mesafeyi o seçti
**COUNTER** Kutu ve köşe dibinde durma, sıçrayıp üstünden gelebileceği açıları hesapla. Tuzağını iniş noktasına kur; düelloyu uzun hatta çek, yakın mesafeye inme
**WHY** Kısa menzilli silah ancak mesafe kapanırsa çalışır; iniş noktası tuzaklıysa Raze yaklaşamadan yavaşlar ve açıkta kalır

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Kurulumun sökülmüş, sen düz düello aradın — Raze'in ult'u da tam bu duruma bakar
**COUNTER** Sayı azken açık alanda bekleme; dar açıya çekil, süreyi oynat, ult'unu düşman commit ettiği anda aç ve mesafeyi koruyarak bitir
**WHY** Ana silahı kilitlenen Raze yakın mesafe patlayıcısına mahkum kalır — mesafeyi tutan taraf onun tek cevabını da alır

## Koç Notları
Raze'e karşı kurulumun görünmez ve katmanlı olması tek başına yetmez: iniş noktasını oku. Raze aynı sıçrama hattını iki round üst üste kullandıysa ikinci katmanı tam iniş noktasına çek — hareket yeteneği havada yön değiştiremez, okunan iniş bedava sayıdır.
