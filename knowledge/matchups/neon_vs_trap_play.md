# EŞLEŞME: Neon vs Tuzak Oyunu

## Etkileşim Kimliği
Neon, sprint ve slide ile sahayı herkesten hızlı geçer. Tuzak kuran ajanlar (Killjoy, Cypher, Deadlock, Vyse) buna göre tasarlanmamış — düşmanın normal hızda yürüyeceğini varsayarlar. Neon bu varsayımı kırar. Tek katman tuzak koyarsan, Neon üstünden geçer. Neon duvarı ve stunü kullanmadan sprint ederse, katmanlı kuruluma girer ve ölür.

## Yaygın Cezalandırma Kalıpları

### Neon Tuzak Oyununu Cezalandırırken

**IF**: Neon sprint hızıyla tripwire'dan geçiyor, sentinel onu durduramıyor
**MEANING**: Tek tuzak tetikleniyor ama Neon içinden çıkmadan dövüşe giriyor — ek katman yok
**COUNTER**: Tuzakları art arda diz — birini geçer, arkasında hemen ikincisi olsun
**WHY**: Tek katman hıza yenilir, ard arda dizilince Neon duraksıyor ve ikinci tuzağa basıyor

**IF**: Neon nanoswarm bölgesinden slide ile geçiyor, hasar almıyor
**MEANING**: Slide süresince bölgede kalmıyor — hasar birikmesi için yeterli temas yok
**COUNTER**: Neon slide ile çıkarken nanoswarm'u patlat, girerken değil
**WHY**: Slide çıkışında Neon yavaşlar — nanoswarm tam o anda patlarsa kaçacak yer kalmaz

**IF**: Neon Relay Bolt ile sentinel'i kendi tuzağınin arkasında stunluyor
**MEANING**: Stun yiyen sentinel hem ateş edemez hem util kullanamaz — tuzak korumasız kalıyor
**COUNTER**: Sentinel, tuzak kurulumunun gerisinde değil yanında ya da ayrı bir açıda dur
**WHY**: Ayrı açıda duran sentinel Relay Bolt'un etkisinden çıkar, tuzak korunur

### Tuzak Oyunu Neon'u Cezalandırırken

**IF**: Üç katman tuzak art arda dizilmiş — Neon hepsini geçemiyor
**MEANING**: Sprint hızı katmanları tek tek aşıyor ama üçüncüsüne ulaşamadan duraksıyor
**COUNTER**: İlk katmanı duvarla ya da stun ile temizle, kalanını sprint ile geç
**WHY**: Katmanlı kurulumda sprint tek başına işe yaramaz — önce önünü açmazsan içinde kalırsın

**IF**: Deadlock GravNet Neon'u yere bağlıyor, sprint durdu
**MEANING**: Hız avantajı tamamen gitti — Neon normal düşman hızına döndü
**COUNTER**: GravNet'in atıldığı açıyı öğren — o açıdan girme, yan koridoru dene
**WHY**: GravNet o açıya girildiğinde tetikleniyor — açıyı değiştirirsen tetiklenme olmaz

## Tekrarlanan Başarısızlık Ne Anlama Gelir

**Tuzak oyuncusu Neon'a sürekli eziliyorsa**: Tuzakların dağınık ve tek katmanlı. Neon tek bir boşluk bulur geçer. Tripwire, alarmbot, nanoswarm'u üst üste diz — birini geçince hemen diğerine düşsün.

**Neon tuzaklara sürekli ölüyorsa**: Hiçbir şey temizlemeden hazır kuruluma sprint ediyorsun. Önce duvarla sightline'ı kapat, stun ile sentinel'i uzaklaştır, sonra sprint et. Util olmadan hız sadece hızlı ölümdür.

## AIMLO Ne Demeli

### Oyuncu cezalandırılan taraftayken

**Tuzak oyuncusu Neon'a eziliyorsa**: "Tuzakların çok dağınık — aralarındaki boşluktan sprint ediyor. Üst üste diz: tripwire, alarmbot, nanoswarm. Birini geçebilir, üçünü geçemez."

**Neon tuzaklara ölüyorsa**: "Önünü açmadan hazır kuruluma giriyorsun. Duvarı koy, stun at, sentinel uzaklaşsın — sonra sprint et. Util'siz hız, hızlı ölümdür."

### Oyuncu cezalandıran taraftayken

**Neon tuzakları geçiyorsa**: "Hızın tek katman kurulumu kesiyor. Sprint etmeye devam et, sentinel tepki veremeden dövüşe gir."

**Tuzak oyuncusu Neon'u durduruyorsa**: "Katmanlı kurulum tam hızda bile onu durduruyor. Util'leri sırayla yığmaya devam et — ya duraksır ya ölür."

## Rank Modülasyonu

**LOW**: Neon her seferinde direkt sprint eder, tuzak oyuncusu tek tuzak koyar. İkisi de adapte olmaz. Neon'a şunu söyle: önce temizle sonra gir. Tuzak oyuncusuna şunu söyle: ard arda diz.

**MID**: Neon ara sıra util kullanmaya başlar. Tuzak oyuncusunun kurulumu var ama tek katmanlı. Neon'a söyle: entry öncesi duvar at, stun at, sonra sprint et. Tuzak oyuncusuna söyle: tripwire, alarmbot, nanoswarm'u üst üste diz.

**HIGH**: Her iki taraf da hız vs. yoğunluk oyununu bilir. Neon'a söyle: 1 düşman düştüğünde sprint et, rotasyon henüz gelmemişse yürü ve önce açı temizle. Tuzak oyuncusuna söyle: Neon slide ile çıkarken nanoswarm patla, girişte değil.

**ELITE**: Tuzak kurulumları Neon hızı varsayılarak yapılır. İlk katmanı atlayıp atlamayacağına karar ver — util'siz girersen bu seviyede ölürsün. Tuzak oyuncusuna söyle: Neon'un slide çıkış noktasına nanoswarm göm, tripwire'ı yan koridora değil direkt sprint hattına koy.