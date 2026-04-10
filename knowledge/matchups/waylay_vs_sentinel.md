# EŞLEŞME: Waylay vs Sentinel

> **YAMA DUYARLILIĞI NOTU**: Waylay yeni bir ajandır. Yetenek değerleri, bekleme aralıkları ve etkileşimler yamalar arasında belirgin şekilde değişebilir. Koçluk tavsiyesi uygulamadan önce güncel yama notlarını doğrulayın.

## Etkileşim Kimliği
Waylay pusu ve aldatmada uzmandır — savunmanın beklemediği açılardan yaklaşır ve yanıltma yoluyla açıklar yaratır. Sentinel'lar bilinen yaklaşım açılarını trap'ler ve bilgi araçlarıyla kapatmaya güvenirler. Bu eşleşmede Waylay'in sentinel kapsamasındaki boşluğu bulup bulamayacağı veya sentinel'in ağının alışılmadık yaklaşımları bile yakalayacak kadar kapsamlı olup olmadığı test edilir. Waylay, sentinel'in hazırlığının geçerli olmadığı yerden saldırarak hazırlığını anlamsız kılmak ister.

## Yaygın Cezalandırma Kalıpları

### Waylay Sentinel'ı Cezalandırırken

**IF**: Waylay standart trap yerleştirmesini bypass eden açılardan yaklaşıyorsa
**MEANING**: Sentinel'ın savunma ağı kapsanmamış yollar bırakmış
**COUNTER**: Sentinel alışılmadık yaklaşımları yakalayan geniş kapsam kullanmalı — alışılmadık yollarda tripwire, off-angle'ları izleyen kameralar
**WHY**: Standart yerleştirme sadece standart yolları kapsar

**IF**: Aldatma yetenekleri sentinel'in ilgisini bir yola çekerken gerçek giriş başka yerden yapılıyorsa
**MEANING**: Sentinel yanlış yönü izliyor — gerçek tehdit başka yerde
**COUNTER**: Birden fazla bilgi katmanı kullanarak ilk trap bypass edilse bile ikincisinin gerçek pozisyonu yakalaması
**WHY**: Tek bilgi katmanı aldatmaya karşı kırılgandır

**IF**: Pusu konumlanması sentinel'i yetenek aracı veya kamera izlerken yakalıyorsa
**MEANING**: Sentinel'in odağı başka yerdeyken savunmasız
**COUNTER**: Takım iletişimi Waylay'in yanıltmasını erken tespit etmeli
**WHY**: Yetenek aracı kullanan sentinel çevresine karşı savunmasız

### Sentinel Waylay'ı Cezalandırırken

**IF**: Geniş kapsam alışılmadık yaklaşımları yakalıyorsa (alışılmadık yollarda tripwire, off-angle'ları izleyen kameralar)
**MEANING**: Waylay'in flank rotaları bile kapsam altında
**COUNTER**: Waylay yeni açılar bulmalı veya yetenek araçları bekleme aralığındeyken ya da sentinel'in odağı başka yerdeyken zamanlamasını ayarlamalı
**WHY**: Geniş kapsam yaratıcı rotaları bile yakalar

**IF**: Eleme yöntemiyle — beklenen yol sessizse beklenmedik yol aktif
**MEANING**: Waylay'in yokluğu bile bilgi veriyor
**COUNTER**: Waylay flank zamanlamasını takımın varsayılan yoldaki baskısıyla koordine etmeli
**WHY**: Görüş alanı dışındaki bilgi, görülen bilgi kadar değerlidir

## Tekrarlanan Başarısızlık Ne Anlama Gelir
**Sentinel'lar** sürekli Waylay tarafından pusuya düşürülüyorsa, trap kapsamlarında off-angle boşlukları var. Sadece ders kitabı yaklaşım yollarını kapatıp yaratıcı girişleri açık bırakıyorlar. Waylay'a karşı sentinel'lar kendi kurulumlarını bypass etmek isteseler NEREYE gideceklerini düşünüp o noktaları tuzaklamalı.

**Waylay** flank yapmasına rağmen sürekli yakalanıyorsa, sentinel kapsamını off-angle'ları da içerecek şekilde adapte etmiş veya takım Waylay'in varlığını eleme yöntemiyle izleyecek kadar iyi iletişim kuruyor. Waylay yeni açılar veya daha iyi zamanlama bulmalı.

## AIMLO Ne Demeli

### Oyuncu cezalandırılan taraftayken
**Sentinel pusuya düşürülüyorsa**: "Trap'lerin beklenen yolları kapsıyor ama Waylay beklenen yolları kullanmaz. En az bir tripwire veya sensoru normalde açık bırakacağın off-angle yaklaşıma koy. Kendi kurulumunu bypass etmek istesen nereye giderdin onu düşün."

**Waylay yakalanıyorsa**: "Sentinel flanklarını kapatacak şekilde adapte oldu. Yeni açılar bulmalısın veya yaklaşımını yetenek araçları bekleme aralığındeyken ya da odağı başka yerdeyken zamalamalısın. Flank zamanlamanı takımının varsayılan yoldaki baskısıyla koordine et."

### Oyuncu cezalandıran taraftayken
**Waylay sentinel'ı bypass ediyorsa**: "Flanklarının kurulumlarını anlamsız kılıyor. Yaklaşım yollarını ve zamanlamanı çeşitlendirmeye devam et ki hangi açıyı kullanacağını tahmin edemesinler."

**Sentinel Waylay'ı yakalıyorsa**: "Geniş kapsamın çalışıyor. Off-angle trap'leri korumaya devam et ve Waylay'in olası pozisyonunu GÖZÜKMEDIĞI yere göre ilet."

## Rank Modülasyonu
**LOW**: Waylay yaratıcı flank yapmaz — standart yolda yürür. Sentinel'lar standart trap'ler koyar. Eşleşmede anlam yok. Waylay'a off-angle yaklaşımları öğret.

**MID**: Waylay flank yapmaya başlar ama aynı rotayı tekrarlar. Sentinel'lar kapsamını adapte etmez. Sentinel'a trap kapsamını genişletmeyi, Waylay'a rotaları çeşitlendirmeyi öğret.

**HIGH**: İki taraf da adapte olur. Eşleşmede zamanlama ve tahmin belirleyici olur. Zamanlama disiplini öğret — ne zaman erken vs. geç flank, ne zaman trap kapsamını kaydırmak.

**ELITE**: Waylay'in yaklaşımı takım koordineli bir strateji, solo flank değil. Sentinel ana baskının gerçek push mu yoksa odak dağıtma mı olduğunu okumalı. Takım seviyesinde okuma kalıplarını öğret.
