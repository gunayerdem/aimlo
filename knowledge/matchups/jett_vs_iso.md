---
id: matchup_jett_vs_iso
type: matchup
agent_a: jett
agent_b: iso
patch: "13.00"
verified: 2026-07-31
tags: [matchup, jett, iso, duelist, duelist]
coverage_note: "B95 (2026-07-31) — Iso düşman tarafında SIFIR matchup dosyasıyla temsil ediliyordu; Jett'e karşı en sık çıkan yeni duelist eşleşmelerinden biri."
---

# MATCHUP: Jett vs Iso

## Matchup Özü
Iso'nun kozu tek kurşunluk kalkanı: her düelloya bir mermi önde başlar. Jett'in kozu ise düellonun nerede ve ne zaman başlayacağını seçebilmesi. Yani bu eşleşme mermi sayısı savaşı: kalkanlı Iso'ya karşı düelloyu iki mermiye göre planlamayan Jett, kazandığını sandığı her düelloyu yarım bırakır. Buna karşılık Iso'nun mermileri durduran duvarı seni takımından ayırmak için var — izolasyonu bozulan Iso sıradan bir duelist.

## Sinyal-Kapılı Dersler

**IF** round açılışında öldün (deathTiming=erken) ve düşman kompunda Iso var
**MEANING** İlk temasta kalkanlı bir düşmana tek isabetle yetindin — ilk atışın kalkana gitti, ikinciyi atmadan sen vuruldun
**COUNTER** Düelloyu iki mermiye kur: kafa hizasında kal, ilk isabetten sonra crosshair'i düşürme. Kalkan kırıldıysa hemen bitir, kıramadıysan dash'le açıyı tamamen terk et
**WHY** Kalkan tek hasar örneğini emer — bunu bilerek giren Jett düelloyu bir mermi geriden değil, planlı başlatır

**IF** öldün ve killerInfo'daki silah yakın-orta menzilli tüfek sınıfıysa ve ölüm yeri dar bir geçitse
**MEANING** Iso seni kendi seçtiği kapalı alanda 1v1'e sıkıştırdı — mermileri durduran duvarıyla takımının trade'ini kesti
**COUNTER** Duvar hattından geri çekil; düelloyu onun seçtiği anda kabul etme. Takım arkadaşının açısına yerleş, duvar sönünce iki kişi birden bas
**WHY** Iso'nun duvarı yalnız kaldığın sürece çalışır; trade zinciri kurulduğunda izolasyon aracı işe yaramaz hâle gelir

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Giriş açını okudu — kırılgan yapan dalgasını tam o köşeye atıp seni işaretli hâlde yakalıyor
**COUNTER** Açıyı ya da zamanı değiştir; dalgayı yediysen o pencerede peek atma, geri çekil, pencere geçince açıyı sen bas
**WHY** İşaretliyken alınan hasar katlanır — o pencereyi bekleyip geçiren Jett, kombosunu boşa harcamış bir Iso ile karşılaşır

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Iso'nun izolasyon planı tuttu: dash'le takımdan kopuk öne geçtin, o da duvarla arkanı kapattı
**COUNTER** Dash'i takım trade mesafesindeyken at; duvar kurulduğunu gördüğün an ileri değil geri hareket et, takımınla aynı tarafta kal
**WHY** Bu eşleşmenin tamamı sayı yalıtımı üzerine kurulu — yalıtılmayan Jett kalkan farkını takımıyla kapatır

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Bıçakların doluyken tüfek düellosunda düştün; oysa kalkanlı rakibe karşı ucuz ve seri atış penceresi tam senin elindeydi
**COUNTER** Ult'u tüfek alamadığın round'a ve anti-eco'ya sakla; açtığında seri isabetle kalkanı kır ve bitir, aynı yerde ikinci hedefi bekleme
**WHY** Kalkan tek örnek emer, seri atış onu hızla tüketir — pencere açıkken kalkan avantajı Iso'nun elinden alınır

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabanca düellosunda kalkanlı rakibe karşı çıktın — silah farkının üstüne bir de mermi farkı bindi
**COUNTER** Eko'da düelloyu tek başına alma: takımla aynı anda bas, iki açıdan aynı anda vur. Tek kalkan iki açıya yetmez; alamayacağın düelloda temas etmeden çekil
**WHY** Kalkan tek seferliktir ve yenilenmesi öldürme ister — iki açıdan bastırılan Iso kalkanını ilk açıda harcar, ikinci açıda çıplak kalır

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e girerken Iso'nun duvarını hesaba katmadın — duvar defuse hattını böldü, sen tek başına kaldın
**COUNTER** Retake'te duvarın kuracağı hattı önceden oku: iki koldan aynı anda gir, duvar bir kolu keserse diğer kol devam etsin. Dash'i duvarın arkasına geçmek için değil, yeni açı almak için sakla
**WHY** Tek kolu kesen duvar iki kollu retake'i durduramaz; bölünmüş giriş Iso'nun izolasyon planını da böler

## Koç Notları
Kalkan hasarın kaynağını ayırt etmez: ilk molly tiki de ilk mermi de kalkana gider. Ama hasarsız util onu hiç ilgilendirmez — flash ve sersemletme kalkanı deler, düelloyu onlarla kur. Kalkanı yenilenmesi öldürme istediği için ilk düelloyu geciktirmek de bir plandır: sönmüş kalkanla dövüşen Iso kit avantajsızdır. Ult'uyla seni kapalı bir düelloya çekerse takım yardımı gelmez — o pencerede dash'in tek avantajın: açıyı sen seç, mesafeyi sen kur.
