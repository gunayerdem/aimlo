# EŞLEŞME: Veto vs Entry Yolları

> **YAMA NOTU**: Veto yeni bir sentinel. Yetenek etkileri yamadan yamaya değişebilir — buradaki patternler güncel yamaya göre kontrol et.

## Bu Eşleşme Ne Hakkında

Veto entry oyununu öldürmüyor — hazırlığını zehirliyor. Standart entry, push öncesi bilgi toplar: drone, tarama, flash. Veto o bilgiyi bozar. Sonuç: kör push edersin ya da zaman kaybedersin. Temel çatışma burası.

## Yaygın Cezalandırma Kalıpları

### Veto Entry Yollarını Ezerken

**IF**: Drone veya tarama atıyorsun, Veto cihazı aktive edip sıfır/yanlış bilgi döndürüyor
**MEANING**: O bilgiye güvenemezsin — site'ta kaç kişi var bilmiyorsun
**COUNTER**: Drone atmadan push et — flash önde, doğrudan gir
**WHY**: Veto cihazı bilgi araçlarını hedef alır, flash'ı değil

**IF**: Hareket maskesi açık, site'ta kaç savunucu olduğunu göremiyorsun
**MEANING**: 1'e mi giriyorsun 3'e mi — bilmiyorsun
**COUNTER**: Aynı anda birden fazla açıdan bilgi topla — Veto hepsini aynı anda bozamaz
**WHY**: Tek bilgi kaynağına güvenirsen maskeleme seni keser

**IF**: Drone attın, Veto bozdu, ama yine de o bilgiyle giriyorsun
**MEANING**: Bozulmuş bilgiyle push ediyorsun — ölürsün
**COUNTER**: Bozulma gerçekleştiği an dur, diğer site'a reset at ya da flash öne alarak gir
**WHY**: Bozulmuş bilgi = sıfır bilgi; sıfır bilgiyle push, hazırlıksız push

### Entry Veto'yu Cezalandırırken

**IF**: Düşman takım drone atmadan, flash öne alarak direkt giriyor
**MEANING**: Bozacak bilgi toplama yok — Veto cihazı boşta
**COUNTER**: Standart sentinel gibi oyna — silah dövüşü için köşe al, hareket maskesiyle kaç kişi olduğunu gizle
**WHY**: Veto'nun değeri bilgi kesmekte; bilgi toplanmıyorsa sen sadece kötü konumlanmış bir sentinel'sin

**IF**: Düşman drone'unu bozdun ama düşman yine de o site'a geliyor
**MEANING**: Bozma tersine bilgi verdi — "Veto orada" dediler ve geldiler
**COUNTER**: Bozma zamanını ve yerini değiştir — her seferinde aynı anda aktive edersen okurlar
**WHY**: Tutarlı pattern konum ele verir

## Sürekli Kaybediyorsan Ne Anlama Gelir

**Entry sürekli Veto'ya takılıyorsa**: Drone atıp, bozulmuş bilgiyle yine push ediyorsun. Bozulma = dur sinyali. Ya diğer site'a dön ya da drone'u bırak, flash öne al.

**Veto sürekli entry'leri tutamıyorsa**: Düşman takım zaten drone atmıyor — flash-and-go geliyor. Bozacak bir şey yok. O maçta Veto'dan sentinel değeri çıkar: köşe al, sayıyı gizle, silah dövüşünü kazan.

## AIMLO Ne Demeli

### Oyuncu cezalandırılan taraftaysa

**Entry Veto'ya karşı patlıyorsa**: "Drone'un bozuldu ve yine de girdin. Bozulma sana bilgi veriyor — Veto o site'ta. Ya diğer site'a çekil ya da drone'u unutup flash öne alarak gir."

**Veto entry'leri tutamıyorsa**: "Drone atmıyorlar, flash-and-go geliyorlar. Bozacak bir şey yok. Sentinel gibi köşe al, hareket maskesiyle sayıyı gizle, silah dövüşünü kazan."

### Oyuncu cezalandıran taraftaysa

**Veto entry'leri eziyorsa**: "Drone'larını bozuyorsun, kör giriyorlar. Bozma zamanını sabit tut — her tarama atıldığında aktive et, site hakkında hiç güvenilir bilgileri olmasın."

**Entry Veto'yu geçiyorsa**: "Bilgi yerine flash ile giriyorsun, Veto'nun bozacak bir şeyi yok. Devam et — flash-and-peek'i Veto durduramaz."

## Rank Modülasyonu

**LOW**: Entry'ler zaten drone atmıyor — Veto'nun bozacak bir şeyi yok. Önce düşmana drone attırmayı sağla; o dinamik yoksa eşleşme çalışmaz.

**MID**: Entry'ler drone atıyor ama bozulmuş bilgiyle yine push ediyor. Bozulmayı fark etmiyorlar. Bozulduğu an dur ve karar yenile.

**HIGH**: İki taraf da dinamiği biliyor. Veto ne zaman bozacağını, entry ne zaman drone'u bırakıp flash'a geçeceğini hesaplıyor. Zamanlama ve okuma oyunu burada başlıyor.

**ELITE**: Entry takımı drone'lu ve drone'suz push arasında anlık geçiş yapıyor. Veto hangisinin geldiğini okuyup bozma zamanlamasını buna göre ayarlıyor. Okuma ve adaptif hamle burada kritik.