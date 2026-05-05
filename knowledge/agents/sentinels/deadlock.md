# AJAN: Deadlock

## 1. Rol Kimliği
Deadlock tek bir geçişi cehenneme çevirir. Diğer sentinel'ler utility'yi geniş alana yayar — sen bir noktayı kilitlersin. Barrier Mesh girişi tamamen kapatır, GravNet içinden geçeni yere yapıştırır, Sonic Sensor sesi cezalandırır, Annihilation yakaladığını garantili götürür. Hızla site alan takımlar senin avındır. Zayıflığın şu: utility kullandıktan sonra farklı bir açıdan gelen baskıya çok az cevabın kalır.

## 2. Temel Sorumluluklar
- **Girişi kapat**: Barrier Mesh'i düşmanın en çok bastığı tek noktaya koy. Sage duvarı gibi çabuk kırılmaz — düşman orbları yok etmek zorunda, bu süre ve konum satar.
- **Rush'ı dağıt**: GravNet'i önceden atma. Düşman o koridora girdiğini duyduğunda at. Eğilmeye zorlarsan hızını, orbu yok etmeye zorlarsan pozisyonunu alırsın.
- **Sesi cezalandır**: Sonic Sensor ayak sesine, yetenek sesine, silah sesine tepki verir — bilgi ve kısa sersemletme verir. Yalnızca takım arkadaşı geçmeyecek, düşmanın sessiz geçemeyeceği yollara koy.
- **Round'u kapat**: Annihilation izole düşmanda veya spike kurulunca defuse yapmaya gelen üzerinde kullan. Koza yolu dar ve korunmalı olmalı — açıkta kozayı takım arkadaşları vurur, düşman kurtulur.
- **Katmanla**: Barrier Mesh arkasına Sonic Sensor koy. Hem hızlı hem yavaş geleni aynı anda cezalandırırsın.

## 3. Sık Yapılan Hatalar
- Mesh'i yanlış girişe koymak — düşman zaten o yolu kullanmıyorsa sıfır değer üretir.
- GravNet'i açık alana atmak. Düşmanın mutlaka geçmek zorunda olduğu dar yola at.
- Sonic Sensor'u takım arkadaşının utility'sinin veya kendi silah sesinin sürekli tetikleyeceği yere koymak. Sahte alarm yaratır, takım gerçek uyarıyı da yok sayar.
- Annihilation'ı açık alanda kullanmak. Koza görünürdeyse düşman takım arkadaşları vurur, içindeki kurtulur.
- Tüm utility'yi tek noktaya harcamak. Düşman rotate edince elde hiçbir şey kalmaz.
- Mesh'in nasıl kırıldığını bilmemek. Orbları vurmayı bilen düşman mesh'i çabuk söker — bu sesi duy, önceden açı kur.

## 4. Kalıptan Anlama

**IF** Barrier Mesh koyuyorsun ama düşman farklı yoldan site'a giriyor
**MEANING** Yanlış girişi kapatıyorsun. Düşmanın tercih ettiği rotayı okumamışsın.
**COUNTER** İlk birkaç round'da düşmanın hangi girişi en çok kullandığına bak, mesh'i oraya taşı. Her round mesh pozisyonunu düşman rotasına göre ayarla.
**WHY** Yanlış girişi kapatan mesh hiçbir değer üretmez. Doğru yolu oku — o zaman tek kullanımını maksimize edersin.

**IF** GravNet atıyorsun ama birden fazla round sıfır düşman yakalıyor
**MEANING** Zamanlama bozuk. Ya çok erken attın, düşman henüz orada değildi — ya da yanlış yola nişanladın.
**COUNTER** GravNet'i elinde tut. Düşmanın o koridora girdiğini duyduğunda at. Önceden kurulum olarak atma.
**WHY** Erken atılan GravNet düşman girmeden boşa gider. Düşman tam geçişteyken atarsan kaçış yoktur.

**IF** Sonic Sensor tetikleniyor ama hiçbir düşman gelmiyor
**MEANING** Sensor, takım arkadaşı aktivitesinin veya ortam sesinin tetiklediği yere konmuş. Sahte alarm üretiyor.
**COUNTER** Sensor'u sadece düşman ayak sesinin — crouch-walk dahil — tetikleyeceği sessiz köşelere, derin flank yollarına koy. Bind hookah'ta kapı arkası değil iç köşe gibi noktalar doğru seçimdir.
**WHY** Sahte alarm bilgini öldürür. Takım gerçek tetiklenmeleri de yok saymaya başlar.

**IF** Annihilation kullanıyorsun ama düşman her seferinde kurtarılıyor
**MEANING** Koza yolu birden fazla düşman açısına maruz kalıyor. Takım arkadaşları kozayı kolayca vuruyor.
**COUNTER** Annihilation'ı dar koridorda veya köşede kullan. En iyi kullanım: spike kurulunca tek başına defuse yapmaya gelen üzerinde. Koza yolunun nereye gittiğine dikkat et — düşman ateş açısı bulamasın.
**WHY** Açık alandaki koza kolay hedef. Dar alan düşmanın kurtarma için açı bulmasını engeller.

**IF** Erken ölüyorsun ve utility'n kullanılmamış kalıyor
**MEANING** Çok öne çıkıyorsun. Deadlock'un her yeteneği düşman hamlesi gelince değer kazanır — ölürsen hepsini çöpe atarsın.
**COUNTER** Geri dur. Utility'ni düşman bir şey yaparken kullan, sen bir şey yaparken değil.
**WHY** Ölü Deadlock sıfır utility'dir. Hayattayken düşman push'u gelince mesh + GravNet + sensor aynı anda çalışır.

**IF** Mesh orbları düşman tarafından hızla temizleniyor ve mesh değer üretemiyor
**MEANING** Düşman orb kırma mekanik bilgisine sahip ve bunu organize yapıyor. Mesh tek başına duruyor, tuzak değil engel gibi.
**COUNTER** Orb kırma sesini aktif dinle — kıran düşman pozisyonunu açığa çıkarır. O ses gelince hazır açıda bekle. Arkasına Sonic Sensor koy, orb kırarken sensor tetiklensin.
**WHY** Mesh yalnız durduğunda sadece geciktirir. Sonic Sensor ile birleşince orb kıran düşman hem sersemer hem pozisyon açığa çıkarır — mesh bir tuzak kapısına dönüşür.

## 5. Harita Etkileşimleri
- **Lotus**: Döner kapılar ve dar koridorlar Barrier Mesh + GravNet katmanlaması için biçilmiş kaftan. B main veya A root'ta Annihilation'ın kaçış yolu yok.
- **Bind**: B site'ta güçlü. Hookah, Barrier Mesh için doğal geçiş noktası. B long'da rush gelen gruba GravNet dağıtır.
- **Fracture**: Dar saldırı yolları işine yarar. Yer altı tünellerine Sonic Sensor koy — düşman rotasyonunu erken öğrenirsin.
- **Haven**: Üç site zor. Garage'ı kilitleyerek C site'a odaklan — choke noktası nettir.
- **Ascent**: B main Barrier Mesh için güçlü pozisyon. Market'e Sonic Sensor koy — flank'ı erken görürsün.

## 6. Eşleşme Notları
- **Raze**'e karşı zayıfsın. Patlayıcıları Barrier Mesh orblarını ve Sonic Sensor'ları uzaktan temizler. Mesh'i beklenmedik açıya koy.
- **Neon** ve hız bazlı ajanlara karşı güçlüsün. Tüm kit'in bunları cezalandırmak için var.
- **Sova** Sonic Sensor'ları temizleyebilir, Mesh pozisyonlarını güvenli mesafeden keşfeder. Sensor'ları standart yerden koy, tahmin edilemez ol.
- Annihilation **izole düşmana** karşı counter'lanamaz. Grup halinde gelen takımlara karşı en zayıfısın — kozayı çabuk vururlar.

## 7. Oyuncuya Ne Söylenmeli

### İyi Gidiyorsa
**Ne yapıyorsun:** İlk birkaç round düşmanın hangi girişi tercih ettiğini okudun, Mesh'i oraya koydun, arkasına Sonic Sensor katladın, GravNet'i düşman o koridora girerken attın.

**Düşman ne görüyor:** Barrier Mesh görüyor, orbları hızla kırabileceğini düşünüyor. Arkasındaki Sonic Sensor'dan haberi yok — orb kırmak için adım atıyor, tam o anda sersemiyor.

**Düşman ne yapıyor:** Ya orbları yok ediyor — ateş sesiyle pozisyon açığa çıkar, üstüne sensor çarpar. Ya alternatif yola geçiyor — takımının crossfire kurduğu tarafa düşer. Rush yapanlar GravNet yediğinde koordineli grup 4-5 bireysel dövüşe parçalanır.

**Düşman adapte olursa:**
- AoE ile mesh + sensor'u aynı anda temizlemeye çalışırlarsa: ikisini birbirinden ayır, tek utility ikisini birden temizleyemesin.
- Saldırıyı böler iki gruptan gelirlerse: küçük gruba GravNet at, takımın sayı üstünlüğü kazansın.
- Senin site'ından kaçınıp diğer site'ı basarlarsa: mesh'i sonraki round oraya döndür veya retake'e odaklan, GravNet + Annihilation ile post-plant girişimini durdur.

### Zorlanıyorsa
"Mesh yanlış girişi kapatıyor. İlk birkaç round'a bak — düşman en çok nereden geliyor? Mesh'i oraya taşı. GravNet'i elinde tut, düşman o yola girene kadar atma."

### Tahmin Edilebilir Olduysa
"Düşman mesh pozisyonlarını ezberledi, etrafından dolanıyor. Round değiştir — hangi girişi kilitlediğini değiştir. Mesh'in kapamadığı yolu GravNet ile tut."

## 8. Rütbe Modülasyonu

**Düşük (Iron-Silver):** Mesh'i rastgele koyuyorsun, Sonic Sensor'ları unutuyorsun, GravNet'i el bombası gibi atıyorsun. Mesh ana geçişe, sensor flank yoluna, GravNet tam koridora girince.

**Orta (Gold-Platinum):** Utility işlevsel ama her round aynı yere koyuyorsun. Annihilation açık alanda patlıyor, düşman kurtarılıyor. Reaktif GravNet zamanlamasına ve koza yolunun korunmasına odaklan.

**Yüksek (Diamond-Ascendant):** Katmanlama tamam ama tek site'a bağlısın. Düşman hangi round hangi girişi tercih ediyor — bunu okuyup mesh'i round'dan round'a taşı.

**Elit (Immortal-Radiant):** Deadlock'un gücü bir saldırı rotasını tek round'da tamamen kapatmaktır. Mesh ve GravNet her round okumalara göre değişmeli. Annihilation spike kurulunca post-plant için sakla — garantili defuse engeli olarak kullan. Orb kırma sesini aktif dinle ve o sese önceden açı kur: mesh geciktirici değil, tuzak olur.