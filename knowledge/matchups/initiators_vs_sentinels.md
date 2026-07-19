---
id: matchup_initiators_vs_sentinels
type: matchup
patch: "13.00"
verified: 2026-07-08
tags: [matchup, initiator, sentinel, role_fallback]
---

# MATCHUP: Initiator vs Sentinel

## Bu Çatışma Nedir
Initiator düşmanın tuzaklarını bulur ve açar. Sentinel tuzaklarını saklar, bilgiyi keser. Hangisi öne geçerse round o yöne döner. Bu matchup her roundu şekillendirir.

## Ucuza Ölüm Kalıpları

**IF**: Keşif araçları tuzak ve kamera pozisyonlarını açığa çıkarıyorsa, gelen bot tuzakları zararsız yiyorsa, ult sentinel yeteneklerini tamamen kapatıyorsa
**MEANING**: Sentinelin o round koyduğu her şey çöpe gitti. Bot öne dalıp tuzağı tetikliyor, molly duvarın arkasındaki tuzağı patlatıyor. Saldıran hiçbir tuzağa basmadan giriyor.
**COUNTER**: (Sentinel için) Tuzaklarını bot ve giriş güzergahlarına koy — taranmadan önce uyarı alırsın. Kamerayı initiator yetenek kullanırken yakalayacak şekilde yerleştir; çoğu initiator tararken sabit durur ve korumasızdır. Tuzaklarını beklenmedik köşelere göm, standart tarama hattının dışına çık.
**WHY**: Tuzak yalnızca görünmediğinde iş yapar. Gizle ve her round yerini değiştir.

**IF**: Sentinel yetenek koymasına rağmen kurulumu her round initiator tarafından temizleniyorsa
**MEANING**: Ya her şeyi aynı köşeye yığıyorsun — tek tarama hepsini açıyor — ya da her round aynı yere koyuyorsun. Düşman seni ezberledi.
**COUNTER**: Tuzakları birden fazla açıya yay. Birini temizlemek gerisini ele vermesin. Her round yerini değiştir.
**WHY**: Yığılı kurulum tek taramayla çöker. Dağıttığın kurulum karşıya birden fazla yetenek harcatır.

**IF**: Initiator tuzakları çok erken tarıyor — sentinel hâlâ kurulum yaparken — sonra giriş geliyor ama bilgi çoktan eskimişse
**MEANING**: Erken tarama boşa gider. Sentinel taramadan sonra tuzağı başka yere taşır. Takım eski bilgiyle girer, taze tuzağa basar.
**COUNTER**: Taramayı takım hareket ederken at. Takım kapıya dayandığı an keşif gitsin — o anda sentinel yeniden koyamaz. Giriş ile tarama arasındaki boşluğu sıfıra indir.
**WHY**: Doğru bilgi yanlış anda işe yaramaz. Boşluğu kapattığında sentinele uyum sağlama vakti bırakmazsın.

## Tekrarlayan Başarısızlık Ne Anlama Gelir

**Initiator** sürekli temizleyemiyorsa: Ya yanlış yeri tarıyorsun ya da çok erken tarıyorsun. Sentinel hangi açıdan vuruyor — taramaya oradan başla.

**Sentinel** sürekli sökülüyorsa: Her şeyi aynı yere koyuyorsun, düşman seni okudu. Bir tuzağı standart dışı köşeye taşı — tarama oraya uğramaz.

## AIMLO Ne Demeli

### Kaybeden taraftayken

**Initiator temizleyemiyorsa**: "Keşfin yanlış yere gidiyor. Sentinel hangi açıdan vuruyor — sonraki round oraya at. Taramayı tam takım kapıya dayandığında kullan, daha erken değil."

**Sentinel sökülüyorsa**: "Her şeyi aynı köşeye yığıyorsun, tek tarama yetiyor. Bir tuzağı tarama hattının dışına koy. Sonraki round yerini tamamen değiştir."

### Kazanan taraftayken

**Initiator kurulumları söküyorsa**: "Yetenek savaşını kazanıyorsun, sentinel her round baştan kurmak zorunda kalıyor. Tarama zamanlamanı değiştir — kimi round erken at, kimi round takım kapıya dayandığında — ki keşfini önceden yok edemesin."

**Sentinel taramaları atlatıyorsa**: "Tuzakların görünmüyor, düşman kötü bilgiyle giriyor. Yerini korumaya devam et ama her round bir tuzağı başka köşeye taşı — okunamaz hale gelirsin."

## Koç Notları
Üst seviyede iki taraf da birbirinin kalıbını okur: initiator sentinelin hangi rounda nereye koyacağını tahmin eder, sentinel tarama güzergahını öngörüp tuzağı oradan uzağa koyar. Kalıbı kır — aynı kurulumu arka arkaya tekrarlama; düşman ilk kez görünce ikinci kez bekler. Zamanlama dersi de net: giriş tam kapıya dayandığında tara, daha erken değil.

## Sage Varsa: Beden Tehdidi

Düşman kompunda Sage varsa takımın aldığı kill kesin değildir: sayıyı Sage ölmeden ya da bedeni güvenceye almadan kapanmış sayma. Bedeni gören açıyı tut ya da o alanı yetenekle kilitle — dirilmeye gelen Sage sabit ve savunmasızdır (bedava kill); kalkan oyuncu silahıyla doğar ama kalkış ânında nişanı hazır değildir, o pencerede düello senindir.
