---
id: matchup_veto_vs_neon
type: matchup
agent_a: veto
agent_b: neon
patch: "13.00"
verified: 2026-07-19
tags: [matchup, veto, neon, sentinel, duelist]
---

# MATCHUP: Veto vs Neon

## Matchup Özü
Neon dar boğazdan hızla akar ve girişini sektirdiği stunla açar. Veto'nun önleyici cihazı seken util'i havada imha eder — Neon'un stunu tam bu sınıfta. Stunu yok edilen Neon körlemesine sprint etmek zorunda kalır; bağlama alanı da sprint hattının tek çizgiye indiği boğazda onu yakalar. Hıza karşı Veto'nun cevabı hızlanmak değil, hızın geçeceği çizgiyi kilitlemek.

## Sinyal-Kapılı Dersler

**IF** savunmada round açılışında öldün (side=Savunma, deathTiming=erken) ve düşman kompunda Neon var
**MEANING** Stun + sprint kombosu seni açında yakaladı — önleyici stun hattında değildi
**COUNTER** Önleyiciyi stunun sektiği giriş hattına kur; stun havada imha olunca peek'i sen kazanırsın
**WHY** Stunu olmayan Neon hızını silaha çeviremez — açına ancak açık ve savunmasız girer

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Neon sabit açını ezberledi, her round aynı sprint rotasıyla üstüne geliyor
**COUNTER** Açını ve alan kurulumunu her round değiştir; Neon'un rotası sabitse bağlama alanını tam o çizgiye taşı
**WHY** Sprint rotası da bir alışkanlıktır — alışkanlığı okuyan taraf tuzağı doğru yere koyar

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Boğazı solo tuttun — alan Neon'u yavaşlatıp sağırlaştırdı ama bitiren olmadı
**COUNTER** Alan tetiklendiğinde takımla birlikte vur: sen bir açıdan, takım arkadaşın diğerinden
**WHY** Bağlama alanı düelloyu kazanmaz, kazanılır hale getirir — o pencereyi kullanan biri yoksa Neon sıyrılır

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Sersemletmeye bağışıklık veren pencereyi Neon'a karşı hiç açmadın
**COUNTER** Neon'un bastığını duyduğun an ult'u aç: stunu sana işlemez, düelloyu o pencerede al
**WHY** Neon'un düello planı stun üstüne kurulu — plan çöktüğünde elinde sadece ayak hızı kalır

## Koç Notları
Bağlama alanını koridorun genişlediği yere değil dar boğaza kur: sprint hattı orada tek çizgi, kaçış yanı yok. Neon slide'ını hep aynı köşede bitiriyorsa bir sonraki round alanı tam çıkış noktasına taşı — hız okunan çizgide avantaj olmaktan çıkar.
