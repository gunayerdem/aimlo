# EŞLEŞME: Waylay vs Sentinel

> **YAMA NOTU**: Waylay yeni bir ajan. Yetenekleri yamadan yamaya değişebilir — aşağıdaki tavsiyeleri uygulamadan önce güncel yama notuna bak.

## Bu Eşleşme Ne Test Ediyor

Waylay beklenmediğin açıdan gelir. Sentinel bilinen yolları kapatır. Asıl soru şu: Waylay sentinel'ın görmediği bir boşluk bulabilir mi, yoksa sentinel'ın ağı o kadar geniş mi ki her yaratıcı rotayı da yakalar?

## Cezalandırma Durumları

### Waylay Sentinel'ı Nasıl Döver

**IF**: Waylay standart değil, off-angle bir rotadan geliyor
**MEANING**: Sen sadece beklenen yolları kapamışsın — yan yollar açık
**COUNTER**: En az bir tripwire veya sensoru normalde koymayacağın off-angle noktaya koy; Waylay'in seni geçmek için seçeceği yeri düşün, oraya koy
**WHY**: Standart yerleştirme sadece standart yolu kapatır, Waylay standart yolu kullanmaz

**IF**: Waylay bir yönden ses/görüntü ile seni oyalarken gerçek giriş farklı açıdan geliyor
**MEANING**: Dikkatini çektiler, asıl girişi kaçırıyorsun
**COUNTER**: İkinci bir sensor veya tripwire koy — ilki tetiklendiğinde bile gerçek pozisyonu yakalayacak, ilkinin göremediği açıda
**WHY**: Tek bilgi noktası oyalamaya dayanmaz; Waylay ilk tripwire'ı kasıtlı tetikletir, asıl flanki farklı açıdan girer

**IF**: Waylay tam kamerana ya da sensora baktığın anda yanından geçiyor
**MEANING**: Sen alete bakarken etrafın savunmasız — Waylay bunu okudu
**COUNTER**: Takımın sana söylesin: "Waylay görülmedi" duyulduğunda kamerayı bırak, rotadan çık
**WHY**: Sen alete bakarken yanın kör olur

### Sentinel Waylay'ı Nasıl Döver

**IF**: Off-angle tripwire ve yan açı kameraların Waylay'in yaratıcı rotasını yakaladı
**MEANING**: Waylay'in flank seçenekleri kapandı, standart yola mahkum
**COUNTER**: Waylay yeni bir açı bulmak zorunda — takımın ana yola baskı yaparken sen flanklarını aç; tek başına flanklarsan sentinel fark eder
**WHY**: Geniş yerleştirme yaratıcı rotaları bile yakalar

**IF**: O koridor sessiz, öbür yol aktifse — Waylay o sessiz yolda değil demektir
**MEANING**: Waylay'in nerede olmadığı da bilgi; o koridorda gözükmüyorsa başka yerdedir
**COUNTER**: Takımın ana yola baskı yaparken sen Waylay'in son bilinen rotasının yanındaki açıyı kapat — sentinel ikisine birden bakamaz
**WHY**: Nerede olmadığını bilmek, nerede olduğunu bulmana yardım eder; bir önceki roundda nereden geldi, bu roundda o noktanın komşu açısına trap koy

## Sürekli Aynı Şey Oluyorsa

**Sentinel sürekli pusuya düşüyorsa**: Trap'lerin beklenen yolları kapatıyor ama Waylay beklenen yolları kullanmıyor. Kendi kurulumunu geçmek istesen nereye giderdin — o noktaya koy.

**Waylay sürekli yakalanıyorsa**: Sentinel off-angle'ları da kapamaya başladı ya da takımı Waylay'in nerede olmadığını okuyarak seni buluyor. Aynı rotayı iki kez kullanma. Flanklarını takımının ana yola baskı yaptığı anda aç.

## AIMLO Ne Demeli

### Cezalandırılan taraftaysan

**Sentinel pusuya düşüyorsa**: "Trap'lerin beklenen yolları kapsıyor ama Waylay beklenen yolları kullanmıyor. En az bir tripwire veya sensoru normalde açık bırakacağın off-angle yaklaşıma koy. Kendi kurulumunu geçmek istesen nereye giderdin — oraya koy."

**Waylay yakalanıyorsa**: "Sentinel off-angle'ları da kapamış. Aynı rotayı kullanma. Takımın ana yola girdiği anda flanklarını aç — sentinel ikisine birden bakamaz."

### Cezalandıran taraftaysan

**Waylay sentinel'ı geçiyorsa**: "Kurulumunu işe yaramaz hale getiriyorsun. Rotanı ve açını değiştirmeye devam et — tahmin edemezlerse kapatamazlar."

**Sentinel Waylay'ı yakalıyorsa**: "Off-angle trap'lerin çalışıyor. Waylay'in nerede olmadığını takımına söyle — gözükmemesi de bir bilgidir."

## Rank Modülasyonu

**LOW**: Waylay standart yoldan yürür, off-angle denemez. Sentinel standart trap koyar. Waylay'e şunu söyle: standart koridoru bırak, yan duvardan veya beklenmedik köşeden gir.

**MID**: Waylay flank yapar ama aynı rotayı tekrarlar. Sentinel kapsamını değiştirmez. Waylay'e: "Aynı rotayı iki kez kullanma." Sentinel'a: "Waylay geçen roundda nereden geldi, oraya değil, yanındaki açıya koy."

**HIGH**: İkisi de birbirini okuyor. Burada belirleyici olan kim önce rotasını değiştirir. Waylay'e: "Takımın ana yola baskı yaparken flanklarını aç." Sentinel'a: "Waylay'in son pozisyonunu aklında tut, bu roundda komşu açıyı kapat."

**ELITE**: Waylay solo flank değil, takım stratejisinin parçası olarak flanklıyor. Sentinel ana baskının gerçek mi yoksa dikkat dağıtma mı olduğunu okuyor. Bu seviyede Sentinel'a şunu söyle: "Ana baskı gelirken Waylay nerede — ikisi aynı anda geliyorsa ana baskı gerçek, Waylay yoksa önce Waylay'i bul."