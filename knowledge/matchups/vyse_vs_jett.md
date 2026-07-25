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

## Koç Notları
Jett'e karşı Vyse'ın işi giriş yolunu kapatmak değil, iniş noktasını tuzağa çevirmek. Jett nereye dash atıyor, nereye sıçrıyor — kurulum oraya gider. Aynı düzeni iki round üst üste koyma; Jett bir kez okudu mu önce tuzağı temizler, sonra seni.
