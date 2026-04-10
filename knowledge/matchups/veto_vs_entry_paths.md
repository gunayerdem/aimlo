# EŞLEŞME: Veto vs Entry Yolları

> **YAMA DUYARLILIĞI NOTU**: Veto yeni bir sentinel ajandır. Yetenek değerleri, bekleme aralıkları ve etkileşimler yamalar arasında belirgin şekilde değişebilir. Koçluk tavsiyesi uygulamadan önce güncel yama notlarını doğrulayın.

## Etkileşim Kimliği
Veto'nun bilgi-inkâr kiti, entry yollarında benzersiz bir savunma dinamiği yaratır. Standart entry oyunu, taahhüt etmeden önce bilgi toplamaya (drone, tarama, flash) dayanır. Veto bu sıralama sürecini keşfetme aşamasını bozarak bozar, entry oyuncularını kör push etmeye veya istihbaratı yeniden toplamak için vakit harcamaya zorlar. Bu eşleşmede olay Veto'nun entry'yi öldürmesi değil — entry'nin hazırlığını güvensiz hale getirerek taahhüt ettiklerinde kötü veya sıfır bilgiyle çalışmalarını sağlamaktır.

## Yaygın Cezalandırma Kalıpları

### Veto Entry Yollarını Cezalandırırken

**IF**: Entry takımı drone veya tarama yaptığında parazit aktive edilerek yanlış veya sıfır bilgi döndürüyor
**MEANING**: Keşfetme aşaması güvensiz — bilgi yanıltıcı
**COUNTER**: Recon'a hiç güvenmeyen push — flash ve ham agresyon Veto'nun inkârını bypass eder
**WHY**: Parazit keşfetme araçlarını hedefler, ham agresyonu değil

**IF**: Hareket maskeleme site'ta kaç savunucu olduğunu gizliyor
**MEANING**: Entry takımı bir mi üç mü savunucuyla karşılaşacağını bilemez
**COUNTER**: Birden fazla eşanlı bilgi kaynağı kullanarak Veto'nun hepsini bozamayacağı durum yaratmalı
**WHY**: Tek bilgi kaynağına güven maskelemeye karşı kırılgandır

**IF**: Recon bozması execute'un hemen öncesine zamanlanıyorsa
**MEANING**: Entry takımının son bilgisi güvensiz — güncellenmemiş veriyle push ediyorlar
**COUNTER**: Hızlı entry'ler Veto inkâr aktive edemeden taahhüt ederek bozmalı bypass etmeli
**WHY**: Zamanlama bazlı inkâr gecikmeye bağlıdır

### Entry Yolları Veto'yu Cezalandırırken

**IF**: Recon'a hiç güvenmeden push ediliyorsa — flash ve ham agresyon Veto'nun inkârını bypass ediyor
**MEANING**: İnkâr edecek şey yok çünkü zaten drone kullanılmayacaktı
**COUNTER**: Veto standart sentinel gibi oynamalı — silah dövüşü için konumlan, takımın sayısını gizlemek için hareket maskeleme kullan
**WHY**: Veto'nun değeri bilgi inkârındadır — bilgi toplanmıyorsa inkâr işe yaramaz

**IF**: İnkâr edilmiş bilgi kendisi bilgi olarak kullanılıyorsa — "Veto drone'umuzu bozuyorsa, bu site'ta"
**MEANING**: Bozma tersine bilgi veriyor
**COUNTER**: Veto bozma zamanlamasını ve pozisyonunu çeşitlendirmeli ki okuma yapılmasın
**WHY**: Tutarlı bozma kalıpları ters mühendislik ile konum ifşa eder

## Tekrarlanan Başarısızlık Ne Anlama Gelir
**Entry'ler** sürekli Veto'ya karşı başarısızsa, push öncesi bilgiye çok bağımlı. Drone atıyorlar, Veto bozuyor, yine de kötü istihbaratla push ediyorlar ve beklemedikleri savunuculara ölüyorlar. Bozulmuş istihbarata güvenmeden push etmeleri veya bozmaları tanıyıp reset atmaları gerekir.

**Veto** sürekli entry'leri inkâr edemiyorsa, düşman takım push öncesi recon kullanmıyor veya bozmanın fark etmeyeceği kadar hızlı push ediyor. Bilgi toplamaya hiç niyet etmemiş ham agresyona karşı Veto'nun değeri ciddi şekilde düşer.

## AIMLO Ne Demeli

### Oyuncu cezalandırılan taraftayken
**Entry Veto'ya karşı başarısız**: "Drone'un bozuldu ve yine de kötü bilgiyle push ettin. Recon'un bozulduğunda, BU bilgidir — Veto o site'ta. Ya diğer site'a reset at ya da taramaya güvenmek yerine tam flash desteğiyle push et."

**Veto entry'yi inkâr edemiyor**: "Push etmeden önce drone atmıyorlar, yani inkârının bozacak bir şeyi yok. Saf agresyona karşı standart sentinel gibi oyna — silah dövüşü için konumlan, takımın sayısını gizlemek için hareket maskeleme kullan ve takım arkadaşının yetenek araçlarından faydalanarak oyna."

### Oyuncu cezalandıran taraftayken
**Veto entry'leri inkâr ediyorsa**: "Parazitinin recon'larını mahvettiği için kör push ediyorlar. İnkârını onların tarama anına zamanlomaya devam et ve site'in hakkında hiç güvenilir bilgileri olmasın."

**Entry Veto'yu yeniyorsa**: "Bilgi yerine agresyonla push ederek inkârını bypass ediyorsun. Devam et — Veto flash-and-peek'i bozamaz, sadece drone'u."

## Rank Modülasyonu
**LOW**: Entry'ler push etmeden önce drone atmıyor, yani Veto'nun inkârı anlamsız. Entry'lere önce recon kullanmayı öğret (bu Veto'nun inkâr edeceği dinamiği yaratır).

**MID**: Entry'ler drone atıyor ama bozulmuş bilgiye rağmen push ediyor. Veto'nun inkârı çalışıyor ama entry takımı fark etmiyor. Entry'lere inkâr tanıma ve yaklaşımı adapte etmeyi öğret.

**HIGH**: İki taraf da dinamiği anlar. Zamanlama oyununu öğret — Veto ne zaman inkâr aktive ediyor, entry ne zaman bilgi toplama yöntemini ayarlıyor, ne zaman drone yerine flash ile push etmeli.

**ELITE**: Eşleşmede entry takımı recon-bağımlı ve recon-bağımsız push'lar arasında geçiş yapar. Veto hangi yaklaşımın geldiğini okumalı. Okumaları ve adaptif inkârı öğret.
