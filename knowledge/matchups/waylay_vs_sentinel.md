---
id: matchup_waylay_vs_sentinel
type: matchup
patch: "13.00"
verified: 2026-07-08
tags: [matchup, waylay, sentinel]
---

# EŞLEŞME: Waylay vs Sentinel

## Bu Eşleşme Ne Test Ediyor

Waylay beklemediğin açıdan gelir: dash'i onu duvar üstüne ve yan rotalara taşır, geri-kayması ise agresif hamlenin sigortasıdır. Sentinel ise bilinen yolları kapatır. Asıl soru şu: Waylay sentinel'ın görmediği boşluğu bulacak mı, yoksa sentinel'ın ağı en yaratıcı rotayı bile yakalıyor mu?

Waylay'in kit gerçekleri (sentinel bunları bilmeli):
- **Dash tek kullanımlık** — çift atım ya da tek atım olarak harcanır, ilk atım yukarı da çıkarabilir. Harcandıysa Waylay'in kaçış hamlesi geri-kaymaya kalır.
- **Geri-kayma bir ışık noktası bırakır**: Waylay noktayı agresif hamlesinden hemen önce bırakır ve saniyeler içinde oraya geri döner. Nokta kısa ömürlü — round boyu duran bir güvence değil; iki öldürmeyle yenilenir.
- **Yavaşlatma topu** peek öncesi açını ezer; **ult'u** geniş ışık huzmesiyle değdiklerini güçsüzleştirir ve kendine hız verir — giriş penceresi açar, hasar vermez.

## Baskı Kalıpları

### Waylay Sentinel'ı Nasıl Döver

**IF**: Waylay standart yoldan değil, dash ile off-angle bir rotadan giriyor
**MEANING**: Sadece beklenen yolları kapatmışsın, yanlar ve yüksek açılar açık kalmış
**COUNTER**: En az bir tel veya tuzağı normalde koymayacağın off-angle noktaya koy. Dash yukarı da taşır — yüksek geçişleri unutma
**WHY**: Standart yerleşim sadece standart yolu kapatır; Waylay'in dash'i standart yolu kullanmaz

**IF**: Waylay geri-kayma noktasını bırakıp agresif peek atıyor, dövüş kötü gidince ışığa geri dönüyor
**MEANING**: Trade fırsatın kayboluyor — vurduğun Waylay geri kayıp iyileşip tekrar geliyor
**COUNTER**: Geri döneceği yer bellidir: peek'ten hemen önceki pozisyonu. Dönüş noktasına önceden nişan al ya da util bas — döndüğü an yakala
**WHY**: Geri-kayma Waylay'i bıraktığı noktaya götürür; o nokta okunursa sigorta tuzağa döner

**IF**: Tam kameraya veya tuzağa baktığın anda Waylay yanından geçiyor
**MEANING**: Sen alete bakarken çevren savunmasız kalıyor, Waylay bunu okudu
**COUNTER**: "Waylay görülmedi" çağrısını duyduğun an aletten gözünü kaldır, rotadan çık
**WHY**: Alete kilitlendiğin an yanın kör olur

### Sentinel Waylay'ı Nasıl Döver

**IF**: Off-angle tel ve yan açı kameraların Waylay'in yaratıcı rotasını yakaladı
**MEANING**: Waylay'in flank seçenekleri kapandı, standart yola mahkum
**COUNTER**: Waylay yeni açı aramak zorunda. Takımın ana yola baskı yaparken flanklarını aç — tek başına flanklarsan sentinel seni fark eder
**WHY**: Geniş yerleşim yaratıcı rotaları bile yakalar

**IF**: Waylay dash'ini girişte harcadı, geri-kayması da yok
**MEANING**: Waylay'in hareket sigortası bitti — o an sıradan bir düellocu
**COUNTER**: Dash sesini duyduysan bas: ikinci bir kaçış hamlesi gelmeyecek. Waylay geri-kaymayı kullandıysa yenilenmesi öldürme ister — baskı altında dolmaz
**WHY**: Waylay'in gücü hareket zincirinde; zincir koptuğunda tuzak + çapraz ateş onu bitirir

## Sürekli Aynı Şey Oluyorsa

**Sentinel sürekli pusuya düşüyorsa**: Tuzakların beklenen yolları kapatıyor ama Waylay beklenen yolu kullanmıyor. Kendi kurulumunu geçmek istesen nereden giderdin — tuzağı oraya koy.

**Waylay sürekli yakalanıyorsa**: Sentinel off-angle'ları da kapatmaya başladı ya da geri dönüş noktanı okuyor. Aynı rotayı iki kez kullanma; geri-kayma noktanı her peek öncesi farklı yere bırak — hep aynı köşeye bırakırsan dönüşünde seni bekleyen olur.

## AIMLO Ne Demeli

### Kaybeden taraftaysan

**Sentinel pusuya düşüyorsa**: "Tuzakların beklenen yolları kapatıyor ama Waylay beklenen yolu kullanmıyor. En az bir teli off-angle yaklaşıma koy. Geri kaydığında döneceği yer peek'ten önceki pozisyonu — orayı önceden nişanla."

**Waylay yakalanıyorsa**: "Sentinel off-angle'ları da kapatmış. Aynı rotayı bir daha kullanma. Geri-kayma noktanı her hamle öncesi yeniden ve farklı yere bırak; dash'ini girişte harcadıysan ikinci agresif hamleyi alma."

### Kazanan taraftaysan

**Waylay sentinel'ı geçiyorsa**: "Kurulumunu işe yaramaz hale getiriyorsun. Rotanı, açını ve geri dönüş noktanı değiştirmeye devam et — tahmin edemezse kapatamaz."

**Sentinel Waylay'ı yakalıyorsa**: "Off-angle tuzakların tutuyor. Waylay'in nerede olmadığını takımına söyle — gözükmemesi de bilgidir. Ana baskı gelirken Waylay ortada yoksa önce Waylay'i bul."
