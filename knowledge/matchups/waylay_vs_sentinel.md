# EŞLEŞME: Waylay vs Sentinel

> **YAMA NOTU**: Waylay yeni bir ajan. Yetenekleri yamadan yamaya değişebilir — aşağıdaki tavsiyeleri uygulamadan önce güncel yama notuna bak.

## Bu Eşleşme Ne Test Ediyor

Waylay beklemediğin açıdan gelir, sentinel ise bilinen yolları kapatır. Asıl soru şu: Waylay sentinel'ın görmediği boşluğu bulacak mı, yoksa sentinel'ın ağı o kadar geniş mi ki en yaratıcı rotayı bile yakalıyor?

## Cezalandırma Durumları

### Waylay Sentinel'ı Nasıl Döver

**IF**: Waylay standart yoldan değil, off-angle bir rotadan giriyor
**MEANING**: Sadece beklenen yolları kapatmışsın, yanlar açık kalmış
**COUNTER**: En az bir tel veya tuzağı normalde koymayacağın off-angle noktaya koy. Waylay seni geçmek için nereyi seçer, oraya koy
**WHY**: Standart yerleşim sadece standart yolu kapatır, Waylay standart yolu kullanmaz

**IF**: Waylay bir yandan ses ve görüntüyle seni oyalıyor, gerçek giriş başka açıdan geliyor
**MEANING**: Dikkatini bir yöne çektiler, asıl girişi kaçırıyorsun
**COUNTER**: İkinci bir tuzağı ilkinin göremediği açıya koy — birincisi tetiklense bile ikincisi gerçek pozisyonu yakalar
**WHY**: Tek bilgi noktası oyalamaya dayanmaz. Waylay ilk teli bilerek tetikler, asıl flankı başka açıdan girer

**IF**: Tam kameraya veya tuzağa baktığın anda Waylay yanından geçiyor
**MEANING**: Sen alete bakarken çevren savunmasız kalıyor, Waylay bunu okudu
**COUNTER**: "Waylay görülmedi" çağrısını duyduğun an aletten gözünü kaldır, rotadan çık
**WHY**: Alete kilitlendiğin an yanın kör olur

### Sentinel Waylay'ı Nasıl Döver

**IF**: Off-angle tel ve yan açı kameraların Waylay'in yaratıcı rotasını yakaladı
**MEANING**: Waylay'in flank seçenekleri kapandı, standart yola mahkum
**COUNTER**: Waylay yeni açı aramak zorunda. Takımın ana yola baskı yaparken sen flanklarını aç — tek başına flanklarsan sentinel seni fark eder
**WHY**: Geniş yerleşim yaratıcı rotaları bile yakalar

**IF**: O koridor sessiz, öbür yol aktifse — Waylay o sessiz yolda değil demektir
**MEANING**: Waylay'in nerede olmadığı da bilgidir; bir koridorda gözükmüyorsa başka yerdedir
**COUNTER**: Takımın ana yola baskı yaparken sen Waylay'in son bilinen rotasının komşu açısını kapat — sentinel ikisine birden bakamaz
**WHY**: Nerede olmadığını bilmek nerede olduğunu bulmana yarar. Geçen round nereden geldiyse bu round o noktanın komşu açısına tuzak koy

## Sürekli Aynı Şey Oluyorsa

**Sentinel sürekli pusuya düşüyorsa**: Tuzakların beklenen yolları kapatıyor ama Waylay beklenen yolu kullanmıyor. Kendi kurulumunu geçmek istesen nereden giderdin — tuzağı oraya koy.

**Waylay sürekli yakalanıyorsa**: Sentinel off-angle'ları da kapatmaya başladı, ya da takımı Waylay'in nerede olmadığını okuyarak yerini buluyor. Aynı rotayı iki kez kullanma. Flanklarını takımın ana yola bastığı anda aç.

## AIMLO Ne Demeli

### Cezalandırılan taraftaysan

**Sentinel pusuya düşüyorsa**: "Tuzakların beklenen yolları kapatıyor ama Waylay beklenen yolu kullanmıyor. En az bir tel veya tuzağı normalde açık bırakacağın off-angle yaklaşıma koy. Kendi kurulumunu geçmek istesen nereden giderdin — oraya koy."

**Waylay yakalanıyorsa**: "Sentinel off-angle'ları da kapatmış. Aynı rotayı bir daha kullanma. Takımın ana yola girdiği anda flanklarını aç — sentinel ikisine birden bakamaz."

### Cezalandıran taraftaysan

**Waylay sentinel'ı geçiyorsa**: "Kurulumunu işe yaramaz hale getiriyorsun. Rotanı ve açını değiştirmeye devam et — tahmin edemezse kapatamaz."

**Sentinel Waylay'ı yakalıyorsa**: "Off-angle tuzakların tutuyor. Waylay'in nerede olmadığını takımına söyle — gözükmemesi de bilgidir."

## Rank Modülasyonu

**LOW**: Waylay standart yoldan yürür, off-angle denemez. Sentinel standart tuzak koyar. Waylay'e şunu söyle: standart koridoru bırak, yan duvardan veya beklenmedik köşeden gir.

**MID**: Waylay flank yapar ama hep aynı rotayı tekrarlar. Sentinel kapsamını değiştirmez. Waylay'e: "Aynı rotayı iki kez kullanma." Sentinel'a: "Waylay geçen round nereden geldiyse oraya değil, komşu açıya koy."

**HIGH**: İkisi de birbirini okuyor. Burada belirleyici olan, kim önce rotasını değiştirir. Waylay'e: "Takımın ana yola baskı yaparken flanklarını aç." Sentinel'a: "Waylay'in son pozisyonunu aklında tut, bu round komşu açıyı kapat."

**ELITE**: Waylay solo değil, takım stratejisinin parçası olarak flanklıyor. Sentinel ana baskının gerçek mi yoksa dikkat dağıtma mı olduğunu okuyor. Bu seviyede Sentinel'a şunu söyle: "Ana baskı gelirken Waylay nerede — ikisi aynı anda geliyorsa baskı gerçek, Waylay yoksa önce Waylay'i bul."
