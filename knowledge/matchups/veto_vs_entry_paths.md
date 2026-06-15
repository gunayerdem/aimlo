# EŞLEŞME: Veto vs Entry Yolları

> **YAMA NOTU**: Veto yeni bir sentinel. Yetenek etkileri yamadan yamaya değişebilir — buradaki patternleri güncel yamaya göre kontrol et.

## Bu Eşleşme Ne Hakkında

Veto entry oyununu öldürmez — hazırlığını zehirler. Standart entry, push öncesi bilgi toplar: recon, tarama, flash. Veto o bilgiyi bozar. Sonuç ya kör push edersin ya da zaman kaybedersin. Temel çatışma tam burada.

## Yaygın Cezalandırma Kalıpları

### Veto Entry Yollarını Ezerken

**IF**: Recon ya da tarama atıyorsun, Veto cihazını aktive edip sıfır veya yanlış bilgi döndürüyor
**MEANING**: O bilgiye güvenemezsin — site'ta kaç kişi var bilmiyorsun
**COUNTER**: Recon atmadan push et — flash önde, doğrudan gir
**WHY**: Veto cihazı bilgi araçlarını hedef alır, flash'ı değil

**IF**: Hareket maskesi açık, site'ta kaç savunucu olduğunu göremiyorsun
**MEANING**: 1 kişiye mi giriyorsun 3 kişiye mi, hiç bilmiyorsun
**COUNTER**: Aynı anda birden fazla açıdan bilgi topla — Veto hepsini birden bozamaz
**WHY**: Tek bilgi kaynağına yaslanırsan maskeleme seni kör bırakır

**IF**: Recon attın, Veto bozdu, ama yine de o bilgiyle giriyorsun
**MEANING**: Bozulmuş bilgiyle push ediyorsun — ölürsün
**COUNTER**: Bozulmayı gördüğün an dur, diğer site'a reset at ya da flash öne alıp gir
**WHY**: Bozulmuş bilgi sıfır bilgi demek; sıfır bilgiyle push, hazırlıksız push'tur

### Entry Veto'yu Cezalandırırken

**IF**: Düşman takım recon atmadan, flash öne alıp direkt giriyor
**MEANING**: Bozacak bilgi toplama yok — Veto cihazı boşta kalır
**COUNTER**: Standart sentinel gibi oyna — silah dövüşü için köşe tut, hareket maskesiyle kaç kişi olduğunu gizle
**WHY**: Veto'nun değeri bilgiyi kesmekte; bilgi toplanmıyorsa sen sadece kötü konumlanmış bir sentinel'sin

**IF**: Düşmanın recon'unu bozdun ama düşman yine de o site'a geliyor
**MEANING**: Bozma onlara ters bilgi verdi — "Veto orada" diye okuyup geldiler
**COUNTER**: Bozma zamanını ve yerini değiştir — her seferinde aynı anda aktive edersen seni okurlar
**WHY**: Sabit pattern konumunu ele verir

## Sürekli Kaybediyorsan Ne Anlama Gelir

**Entry sürekli Veto'ya takılıyorsa**: Recon atıp bozulmuş bilgiyle yine push ediyorsun. Bozulma dur sinyalidir. Ya diğer site'a dön ya da recon'u bırak, flash öne al.

**Veto sürekli entry'leri tutamıyorsa**: Düşman takım zaten recon atmıyor — flash-and-go geliyor. Bozacak bir şey yok. O maçta Veto'dan sentinel değeri çıkar: köşe tut, sayıyı gizle, silah dövüşünü kazan.

## AIMLO Ne Demeli

### Oyuncu cezalandırılan taraftaysa

**Entry Veto'ya karşı patlıyorsa**: "Recon'un bozuldu ve yine de girdin. Bozulma sana bilgi veriyor — Veto o site'ta. Ya diğer site'a çekil ya da recon'u unutup flash öne alarak gir."

**Veto entry'leri tutamıyorsa**: "Recon atmıyorlar, flash-and-go geliyorlar. Bozacak bir şey yok. Sentinel gibi köşe tut, hareket maskesiyle sayıyı gizle, silah dövüşünü kazan."

### Oyuncu cezalandıran taraftaysa

**Veto entry'leri eziyorsa**: "Recon'larını bozuyorsun, kör giriyorlar. Bozma zamanını sabit tut — her tarama atıldığında aktive et, site hakkında güvenilir tek bilgileri kalmasın."

**Entry Veto'yu geçiyorsa**: "Bilgi yerine flash ile giriyorsun, Veto'nun bozacak bir şeyi yok. Aynen devam — flash-and-peek'i Veto durduramaz."

## Rank Modülasyonu

**LOW**: Entry'ler zaten recon atmıyor — Veto'nun bozacak bir şeyi yok. Önce düşmana recon attırmayı sağla; o dinamik yoksa eşleşme çalışmaz.

**MID**: Entry'ler recon atıyor ama bozulmuş bilgiyle yine push ediyor. Bozulmayı fark etmiyorlar. Bozulduğu an dur ve kararını yenile.

**HIGH**: İki taraf da dinamiği biliyor. Veto ne zaman bozacağını, entry ne zaman recon'u bırakıp flash'a geçeceğini hesaplıyor. Zamanlama ve okuma oyunu burada başlıyor.

**ELITE**: Entry takımı recon'lu ve recon'suz push arasında anlık geçiş yapıyor. Veto hangisinin geldiğini okuyup bozma zamanlamasını buna göre ayarlıyor. Okuma ve adaptif hamle burada kritik.
