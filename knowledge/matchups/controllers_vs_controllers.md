---
id: matchup_controllers_vs_controllers
type: matchup
patch: "13.00"
verified: 2026-07-19
tags: [matchup, controller, mirror, role_fallback]
---

# MATCHUP: Controller vs Controller

## Ne Oluyor Burada
İki taraf da haritayı perdeyle bölüyor; round'u perdeleri daha iyi zamanlayan taraf alır. Rakip controller'ın smoke düzeni sana planını söyler: kapattığı açıdan geçecekler, açık bıraktığı açıda bekleyen var. Smoke savaşında bilgi, perdenin kendisinden değil perdenin nereye indiğinden çıkar.

## Ucuza Ölüm Kalıpları

**IF**: Round başında öldün (died, deathTiming=erken) ve smoke'lar daha yere oturmamıştı
**MEANING**: Perdeler inmeden peek aldın — çift-controller round'unda ilk temas en körüdür ve rakip, senin çıkış açına çoktan bir tüfek koymuştur.
**COUNTER**: Kendi smoke'un yere oturana kadar temas alma. Perde indikten sonra da beklenen kenardan değil ters kenardan çık — rakip controller çıkışını kendi smoke alışkanlığına göre tahmin eder.
**WHY**: Smoke savaşında erken peek, iki perde arasındaki tek açık pencereye gönüllü girmektir.

**IF**: Üst üste aynı pozisyonda ölüyorsun (repeatedPosition)
**MEANING**: Rakip controller smoke düzenini ve durduğun kenarı okudu — artık perdesini sana göre atıyor, takımını senin kör kaldığın kenardan geçiriyor.
**COUNTER**: Smoke düzenini değil pozisyonunu boz: aynı perdeyi at ama arkasında durduğun kenarı değiştir. Perde aynı kalınca rakip değişikliği geç fark eder — ezberlediği fotoğraf eskir.
**WHY**: Çift-controller maçında smoke'lar değil, smoke arkasındaki alışkanlıklar okunur.

**IF**: Savunmadayken spike kuruldu ve geri alım sırasında öldün (spikePlanted, side=Savunma)
**MEANING**: Rakip controller son perdelerini spike'ı korumaya ayırdı; perdesiz girdiysen kurulmuş açılara açık yürüdün.
**COUNTER**: Geri alıma kendi smoke'un inmeden başlama — rakibin post-plant perdesine kendi perdenle cevap ver: spike'ı tutan açıyı kapat, takım defuse alanına perdenin arkasından girsin.
**WHY**: Post-plant'te smoke'u kalan taraf, geri alımın tek güvenli koridorunu kendisi çizer.

## Tekrarlayan Ölüm Ne Anlama Gelir
Aynadaki controller'a sürekli ölüyorsan smoke savaşını değil, smoke sonrası düelloyu kaybediyorsun: perden doğru iniyor ama sen perdenin beklenen kenarında duruyorsun. Perdeyi at, sonra rakibin bakmadığı kenara geç — perde seni ancak arkasında öngörülemezsen korur.

## Koç Notları
Çift-controller round'unda avantaj ikinci smoke'u atana geçer: ilk smoke planı açık eder, ikinci smoke o plana cevap verir. Rakibin perdesini gördüğünde planını okudun demektir — kapattığı açıdan gelecekler. Kendi perdeni bu bilgiyle at; körü körüne değil, cevap olarak.
