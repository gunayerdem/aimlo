---
id: matchup_sentinels_vs_controllers
type: matchup
patch: "13.00"
verified: 2026-07-19
tags: [matchup, sentinel, controller, role_fallback]
---

# MATCHUP: Sentinel vs Controller

## Ne Oluyor Burada
Controller perdeyle senin görüşünü alır; senin gücün görüşü alınamayan tarafta — cihazlar ve kurulum. O smoke'la alan çalar, sen kurulumla zaman satarsın. Bu eşleşmede kaybeden, kendi planını bırakıp rakibinkine uyan taraftır.

## Ucuza Ölüm Kalıpları

**IF**: Savunmada erken öldün (died, side=Savunma, deathTiming=erken)
**MEANING**: Site smoke içinden basılırken setup'ını erken bozdun — perdenin önüne çıktın ya da çapanı bırakıp körlemesine temas aradın. Controller tam bunu ister: kurulumunun seni korumadığı yerde düello.
**COUNTER**: Perde indiğinde kurulumunun arkasında kal. Smoke görüşü kapatır ama yolu kapatmaz — yola kurduğun cihaz perdenin içinde de haber verir. Alarmı bekle, teması cihazının verdiği bilgiyle al, körlemesine değil.
**WHY**: Smoke senin gözünü alır ama kurulumun yerini değiştirmez; erken bozulan setup, hiç kurulmamış setup'tan kötüdür.

**IF**: Spike kuruldu ve savunmadayken geri alımda öldün (spikePlanted, side=Savunma)
**MEANING**: Retake'e karşı taraf perdeli, sen perdesiz girdin — controller son smoke'larını spike'ı korumaya saklar ve geri alımı kör koridora çevirir.
**COUNTER**: Util'ini retake'in ilk adımına değil, smoke'un açılış anına sakla. Perde dağılırken rakip açı tutmak için yeniden pozisyon arar — cihazın ve yeteneğin tam o pencerede en pahalıdır.
**WHY**: Post-plant'te controller'ın perdesi sonsuz değildir; perde biterken hazır olan taraf defuse penceresini kendisi açar.

**IF**: Üst üste aynı pozisyonda ölüyorsun (repeatedPosition)
**MEANING**: Rakip controller çapa köşeni ezberledi — her round aynı perde senin açına iniyor ve takımı senin kör kaldığın kenardan geçiyor.
**COUNTER**: Kurulumu komple taşımana gerek yok; çapa noktanı kaydır. Aynı cihaz düzeninin bir hat gerisinden, smoke'un kapatamadığı yeni bir açı bul — perde eski adrese inmeye devam etsin.
**WHY**: Controller pozisyona değil alışkanlığa smoke atar; alışkanlığını değiştiren sentinel her perdeyi boşa düşürür.

## Tekrarlayan Ölüm Ne Anlama Gelir
Controller'lı kompa sürekli ölüyorsan smoke'a tepki veriyorsun demektir: perde inince plan değiştiriyor, öne çıkıyor, körlemesine dövüşüyorsun. Tersini yap — perde indiğinde en sakin oyuncu sen ol: kurulumun zaten perdenin arkasını tutuyor.

## Koç Notları
Sentinel'in controller'a karşı gerçek üstünlüğü şudur: perde oyuncunun gözünü alır, yolu tutan cihazın haberini kesmez. Perdenin çalamadığı tek görüş senin kurulumun — onun arkasında dövüş ve util'ini perdenin bittiği ana sakla. Uzayan round senin lehine: onun perdesi tükenir, senin kurulumun beklemekle eskimez.
