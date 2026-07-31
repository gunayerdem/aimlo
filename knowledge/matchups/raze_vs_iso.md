---
id: matchup_raze_vs_iso
type: matchup
agent_a: raze
agent_b: iso
patch: "13.00"
verified: 2026-07-31
tags: [matchup, raze, iso, duelist, duelist]
coverage_note: "B95 (2026-07-31) — Iso düşman tarafında SIFIR dosyayla temsil ediliyordu; Raze'in patlayıcıları kalkana karşı özel bir ders içerdiği için öncelikli."
---

# MATCHUP: Raze vs Iso

## Matchup Özü
Iso'nun kalkanı tek bir hasar örneğini emer — kaynağı fark etmez. Raze'in patlayıcıları tam burada özel bir davranış gösterir: molly'nin ilk hasar tiki kalkanı kırar, kalan tikler çıplak vurur ve Iso'yu pozisyonundan söker. Yani Raze, kalkanı hem kıran hem sahibini yerinden söken ajan. Buna karşılık Iso'nun mermileri durduran duvarı Raze'i takımından ayırmak ve patlayıcı menzilinin dışında 1v1'e zorlamak için var.

## Sinyal-Kapılı Dersler

**IF** round açılışında öldün (deathTiming=erken) ve düşman kompunda Iso var
**MEANING** Kalkanlı bir düşmanla düz düelloya girdin — ilk isabetin kalkana gitti, ikincisini atacak zamanın olmadı
**COUNTER** Düelloyu patlayıcıyla aç: molly'yi tuttuğu köşeye at, ilk tik kalkanı kırsın, sen açıyı çıplak Iso'ya karşı bas
**WHY** Kalkan tek örnek emer — hasarı zamana yayan bir kaynak onu hem kırar hem yerinde tutamaz hâle getirir

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Iso giriş açını okudu; kırılgan yapan dalgasını ve duvarını tam o hatta hazırlıyor
**COUNTER** Giriş açını her round değiştir; sıçramayla üstten gel. Dalgayı yediysen o pencerede peek atma, geri çekil, pencere geçince bas
**WHY** İşaretliyken alınan hasar katlanır — o pencereyi bekleyip geçiren Raze, kombosunu boşa harcamış bir Iso ile karşılaşır

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Iso'nun izolasyon planı tuttu: duvar arkanı kapattı, sen tek başına yakalandın
**COUNTER** Duvarın kurulduğunu gördüğün an ileri değil geri hareket et, takımınla aynı tarafta kal; girişi bot ve molly sırasıyla hazırlayıp takımla aynı anda yap
**WHY** Iso'nun duvarı yalnız kaldığın sürece çalışır — trade zinciri kurulunca izolasyon aracı işe yaramaz

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Roketin elinde bekledi; oysa kalkanlı bir rakibe karşı tek atışta iş bitiren en net cevabın oydu
**COUNTER** Ult'u dar alanda ve yakın mesafede aç; kalkan tek örnek emse de patlama alanı geniş, kaçış yönü dar olan Iso'yu pozisyonundan söker
**WHY** Dolu ult'la ölmek en pahalı hatadır — kalkanlı rakip düz düelloda pahalı, alan hasarına karşı ucuzdur

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabanca düellosunda kalkanlı rakibe karşı çıktın — silah farkının üstüne mermi farkı bindi
**COUNTER** Eko round'unda düelloyu silahla değil util'le aç: molly hâlâ senindir, ekonomiden bağımsız çalışır. Tuttuğu köşeye at, kalkanı kır, sonra bas
**WHY** Raze'in patlayıcıları eko round'unda silah farkını kapatan tek kaynaktır; kalkanı kıran ilk tik düelloyu eşitler

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e girerken Iso'nun duvarını hesaba katmadın — duvar defuse hattını böldü, sen tek başına kaldın
**COUNTER** Retake'te iki koldan aynı anda gir; molly'yi siperin arkasına at, duvar bir kolu keserse diğer kol devam etsin. Sıçramayı duvarın üstünden açı almak için sakla
**WHY** Tek kolu kesen duvar iki kollu retake'i durduramaz; alan hasarı da siperin arkasındaki kalkanlı savunmacıyı yerinden söker

## Koç Notları
Kalkan hasarsız util'i hiç engellemez: sersemletme ve kör etme kalkanı deler. Kendi kitinde hasarsız kaynak yok, o yüzden düelloyu takım util'iyle kur ve patlayıcılarını kalkan kırmaya ayır. Kalkanının yenilenmesi öldürme ister — ilk düelloyu geciktirmek ya da iki açıdan aynı anda basmak da bir plan: tek kalkan iki açıya yetmez. Duvarını gördüğünde onun seçtiği anda düello alma; duvar sönene kadar mesafeni koru.
