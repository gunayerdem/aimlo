# AJAN: Killjoy

## 1. Rol Kimliği
Killjoy en iyi solo site tutan ajandır. Turret bilgi verir, alarmbot + nanoswarm hasar verir, lockdown site'ı temizler. Düşman siteye girmek için bile utility harcamak zorunda kalır — sen bunu kullanırsın. Görevi frag değil: düşmanın zamanını ve yeteneğini tüket, takımına alan aç.

## 2. Temel Sorumluluklar
- **Solo site tut**: Fiziksel orada olmadan geciktir, uyar, hasar ver.
- **Turret = bilgi**: Birincil işi hasar değil — agresyonu erken açığa çıkar.
- **Alarmbot + Nanoswarm kombosu**: Alarmbot vulnerability verir, nanoswarm üstüne patlar. Düşmanın yürümek zorunda olduğu yere koy — kolay geçilebilecek yere değil.
- **Nanoswarm post-plant için sakla**: Defuse girişimini her biri ciddi süre engeller.
- **Lockdown'ı duvar arkasına yerleştir**: Açıkta konulan lockdown anında yok edilir.

## 3. Sık Yapılan Hatalar
- Turret'i tek peek'te ölen açık yere koyuyorsun — bilgi gelmeden ölüyor.
- Tüm utility'yi tek choke'a yığıyorsun — bir Sova dart her şeyi siliyor.
- Alarmbot tetiklendikten sonra nanoswarm patlatıyorsun — önceden üst üste koy, otomatik tetiklensin.
- Lockdown'ı açıkta kullanıyorsun — duvar arkası veya düşmanın içeri girmeden yok edemeyeceği yer şart.
- Turret'inin yanında duruyorsun — utility'nin yarattığı gecikmeden yararlanmak için mesafeni koru.
- Çok uzağa rotasyon yapıp utility'ni devre dışı bırakıyorsun — leash mesafesini bil.

## 4. Kalıptan Anlama

**IF** Turret'in çoğu roundda ilk kontak anında yok ediliyorsa
**MEANING** Turret yerin çok açık veya çok tahmin edilebilir. Düşman siteye girmeden nereyi vuracağını biliyor.
**COUNTER** Turret'i düşmanın yok etmek için siteye girmek zorunda kaldığı off-angle'lara koy. Birkaç roundda bir pozisyonu değiştir.
**WHY** Tahmin edilebilir turret bilgi vermeden ölür. Off-angle yerleşim düşmanı tehlikeli alana sokmadan yok edemez hale getirir.

**IF** Nanoswarm'ların site alındığı roundlarda hep boşa gidiyorsa
**MEANING** Ya baskı altında unutuyorsun ya da swarm'ları düşmanın geçmediği yere koyuyorsun.
**COUNTER** Nanoswarm'ları default plant noktasına ve alarmbot'un üstüne önceden yerleştir. Alarmbot tetiklendiği anda nanoswarm'ı patlat — beklemeden.
**WHY** Kullanılmayan nanoswarm sıfır değer üretir. Önceden yerleştirince baskı altında unutmak sorun olmaz.

**IF** Lockdown koyuyorsun ama düşmanlar aktive olmadan sürekli yok ediyorsa
**MEANING** Cihazı görülebilir veya kolay ulaşılır yere koyuyorsun. Uzun hazırlanma süresi korunaklı yer ister.
**COUNTER** Lockdown'ı duvar arkasına veya düşmanın fiziksel olarak içeri girmeden ulaşamayacağı kapalı alana koy. Cihazı takımınla birlikte koru.
**WHY** Açık lockdown anında yok edilir. Duvar arkası düşmanı tehlikeli girişe ya da alanı terk etmeye zorlar.

**IF** Her round 1-2 kill alıyorsun ama site hâlâ düşüyorsa
**MEANING** Geciktirmek yerine frag için oynuyorsun. Görevin düşmanın zamanını ve utility'sini tüketmek — düello kazanmak değil.
**COUNTER** Düşman siteye 2+ yetenek harcayarak girdiyse kurulumun işini yaptı. Kill sayısına değil, düşmanın kaç yetenek harcadığına bak.
**WHY** Sentinel değeri gecikme ve kaynak tüketimindedir. Kill peşine düşersen site'ı korumak yerine dövüşe giriyorsun.

**IF** Utility'n sık sık leash nedeniyle devre dışı kalıyorsa
**MEANING** Çok agresif rotasyon yapıyorsun veya leash yarıçapını bilmiyorsun.
**COUNTER** Her harita için leash mesafesini öğren. Rotasyon yapmadan önce utility'ni topla ya da devre dışı kalacağını hesaba kat.
**WHY** Devre dışı utility sıfır değer üretir. Leash sınırını aşan her rotasyon kurulumunu sıfırlar.

**IF** Alarmbot tetikleniyor ama nanoswarm takip etmiyorsa
**MEANING** Swarm'ları alarmbot'tan çok uzağa koyuyorsun ya da tetiklenmeyi takip etmiyorsun.
**COUNTER** Nanoswarm alarmbot'la aynı noktayı örtmeli. Alarmbot çaldığında nanoswarm'ı hemen patlat — vulnerability kısa sürer, swarm yakındaysa yetişir.
**WHY** Vulnerability aktifken nanoswarm hasarı artar. Ayrı yerleştirince alarmbot + nanoswarm kombosu çalışmaz.

## 5. Harita Etkileşimleri
- **Bind**: B site'ta baskınsın. B long ve hookah'daki dar girişler nanoswarm için biçilmiş kaftan. Lockdown B site girişlerini kapatır.
- **Ascent**: B site'ta market'i izleyen turret ve lane'deki alarmbot + nanoswarm güçlü. A site'ta A main'i kapsayan utility de işe yarar.
- **Haven**: B site anchor bu haritanın en güçlü pozisyonu. Turret B main ve garage'ı izler, alarmbot + nanoswarm B girişini kapatır. Lockdown B site girişlerini bloke eder.
- **Lotus**: Döner kapılar utility için doğal huni oluşturur — B site verimli. Kapalı B site alanında lockdown yok etmek zor.
- **Sunset**: B site'ta güçlü. Dar site geometrisi nanoswarm kapsamını maksimuma çıkarır. Mid'i izleyen turret erken bilgi verir.
- **Icebox**: B site'ta güçlü. Container üstündeki turret yellow ve orange'ı aynı anda izler. Default plant noktasına nanoswarm zorunlu.
- **Corrode**: Dar koridorlar ve sınırlı girişler utility değerini ikiye katlar. Nanoswarm dar alanda kaçınılmaz hasar verir. Turret koridor kesişimlerinde birden fazla açıya bilgi sağlar.

## 6. Eşleşme Notları
- **Raze** ile karşılaştığında dikkatli ol — Boom Bot alarmbot'u temizler, bombaları turret ve nanoswarm'ı güvenli mesafeden yok eder. Utility'ni daha iç pozisyonlara al.
- **Sova** ile karşılaştığında kurulumunu iki ayrı açıya yay — tek dart her şeyi silemesin.
- Rush kompozisyonlarına karşı güçlüsün — utility'ni temizlemeye vakit bulamadan taahhüt ederler.
- Lockdown, Astra veya Viper gibi yavaş siteye oturan takımları sert vurur — alanı terk etmeden geçiş yapamıyorlar.

## 7. Feedback Rehberi

### Kurulum çalışırken
**Oyuncu ne yapıyor:** Alarmbot ve nanoswarm'ı üst üste koyuyor, turret'i birkaç roundda bir off-angle'a taşıyor.
**Düşman ne yapıyor:** İlk roundlarda turret pozisyonunu öğrenip önceden nişanlamaya geliyor. Turret yeni açıya taşındığında eski noktayı kontrol edip zaman harcıyorlar. Alarmbot vulnerability'yi hafife alıp nanoswarm'a düz giriyorlar.
**Düşman ne öder:** Turret'i temizlemek için yetenek veya zaman harcıyor. Alarmbot + nanoswarm kombosuna girenler 100+ HP kaybedip siteye giriyor — sonraki her silah dövüşünde tek atış.
**Düşman adapte olduğunda:** Drone veya dart ile kurulumu keşfetmeye başlar, AoE ile menzilden temizler ya da nanoswarm patlatamadan rush yapar.
**Sen nasıl karşı adapte edersin:** Drone ulaşamayacağı köşelere alarmbot koy. AoE temizliyorlarsa kurulumu yay — tek yetenek ikisini birden silemesin. Rush yapıyorlarsa alarmbot tetiklendiği anda nanoswarm'ı patlat.

### Sorun bildirimi
**Utility kolayca temizleniyorsa:** "Her şeyi tek koridora yığmışsın. Kurulumunu birden fazla açıya yay. Turret bilgi için — hasar ikincil."
**Kurulum tahmin edilebilirse:** "Düşmanlar turret'ini önceden nişanlıyor, swarm'larından kaçınıyor. Tüm düzeni değiştir. Farklı açı, farklı nanoswarm konumu."

## 8. Rütbe Modülasyonu

**Düşük (Iron-Silver):** Turret'i açık alana koyuyorsun, nanoswarm'ı unutuyorsun. Alarmbot + nanoswarm'ı aynı noktaya yerleştir, turret farklı açıyı izlesin — bu ikisini önce oturtursun.

**Orta (Gold-Platinum):** Komboları kuruyorsun ama kurulum her round aynı. Lockdown'ı ya çok erken ya panikle kullanıyorsun. Kurulum çeşitliliğine ve lockdown'ı duvar arkasına yerleştirmeye odaklan.

**Yüksek (Diamond-Ascendant):** Kurulumların sağlam ama düşman takım counter-strat öğrendi. Site başına en az 3-4 farklı kurulum geliştir — düşmanın hangi yeteneği taşıdığına göre hangisini kullanacağını oku.

**Elit (Immortal-Radiant):** Değerin adaptif post-plant oyununda ve lockdown kullanımında. Post-plant için nanoswarm lineup'ları beklenir. Spike kurulunca, düşman rotate edip siteye dönerken lockdown'ı koy — rotasyonu tamamlayamadan alanı terk etmeye zorla. Lockdown'ı tek başına patlatma — Astra veya Omen gibi kapatan bir ajanın wall veya smoke'uyla birlikte kur, düşman hem çıkışı hem cihazı birden yönetemesin.