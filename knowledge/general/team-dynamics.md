# Takım Dinamikleri -- Radiant Seviye Bilgi Bankası

---

## IGL Nasıl Karar Verir

IGL olmak, beş ayrı oyuncuyu tek bir makine gibi oynatmaktır. Bu rolü aldıysan attığın her çağrı takımın kaderini belirler.

### Round Öncesi Karar (Buy Fazı)

1. **Ekonomiyi oku.** Kendi takımının kredisine bak, düşmanın ne alacağını tahmin et. Buy mu, eco mu, force mu — net karar ver, sonra söyle.
2. **Skor tablosuna bak.** Kim iyi gidiyor, kim batıyor gör. Düşmanın zayıf oyuncusunu hedefe koy, dövüşü onun tuttuğu açıya yık.
3. **Geçmişi oku.** Geçen round B'ye stack yaptılarsa bu round A'ya geçebilirler — ya da senin döneceğini hesaplayıp B'yi tekrar deneyebilirler. Bu okumayı yap.
4. **Stratejiyi net söyle.** "A-kontrol default, pick arıyoruz, B'ye rotate'e hazır olun." Muğlak konuşma, herkes ne yapacağını bilsin.

### Mid-Round Adaptasyon (Anlık Kararlar)

Bilgi geldiğinde beklemek en büyük hatadır. Geç çağrı, yanlış çağrıdan daha çok round kaybettirir.

```
Bilgi alındı (örn. "İkisi B-Main'de görüldü"):
+-- Değerlendir: Fake mi, gerçek baskı mı?
|   +-- Sadece 2 görüldü, split olabilir --> Çağrı: "Pozisyonu tutun, henüz rotate etmeyin."
|   +-- 3+ görüldü, util kullanıldı --> Çağrı: "B'ye rotate, A-anchor tut."
+-- Değerlendir: Sayı avantajım var mı?
|   +-- 5'e 4'üz --> Çağrı: "Sayıyla push, her ölümü trade et."
|   +-- 3'e 4'üz --> Çağrı: "Pasif oyna, pick odaklı, zorlama."
+-- Değerlendir: Spike durumu?
    +-- Spike kurulmadı, vaktiniz var --> Çağrı: "Yavaşla, resetle, harita kontrolü al."
    +-- Spike kuruldu ya da süre daralıyor --> Çağrı: "Şimdi execute, bekleme."
```

### Round Sonrası Analiz

Her round bitince kafandan şu üç soruyu geçir:

- Ne çalıştı, ne çalışmadı?
- Düşman bu round'a göre bir ayar çekti mi?
- Bir takım arkadaşın battıysa rolünü değiştir — aynı düelloyu tekrar yaptırma.

---

## Timeout Ne Zaman Çağırılmalı

Her takımın yarıda bir timeout hakkı var. Doğru anda kullan, birden fazla round'u kurtar.

### Timeout Çağır:

1. **Arka arkaya 3+ round kaybettiysen.** Momentum karşıda. Timeout ritimlerini kırar, takımın kafayı toplar.
2. **Rakip aynı execute'a cevap veremiyorsa.** Aynı oyunu 3 round üst üste yaptın, hâlâ çalışıyor — timeout çağır, takıma anlat, sonraki round yine bas.
3. **Takım birbirine giriyorsa.** Strateji tartışma. Sadece şunu söyle: "Geçti, gelecek round sıfırdan başlıyoruz."

### Timeout ÇAĞIRMA:

- Kazanıyorsan. Kendi momentumunu kesme.
- Tek round kaybettikten sonra. O normal, paniğe gerek yok.
- Sorun aim ya da mekanikse. Timeout aim düzeltmez.

## Çağrı Düzeni

### Ne Çağırmalı

| Durum | Çağrı Formatı | Örnek |
|---|---|---|
| Düşman görüldü | "[Sayı] [Ajan] [Konum]" | "İki, Jett ve Omen, B-Main" |
| Util kullanıldı | "[Ajan] [Util] [Konum]" | "Sova recon, Mid" |
| Hasar verildi | "[Ajan] [Kalan HP] [Konum]" | "Jett lit 120, A-Short" |
| Kill onaylandı | "[Ajan] öldü [Konum]" | "Jett öldü, A-Site" |
| Rotasyon tespit edildi | "[Yön]'e rotate, [Sayı] görüldü" | "B'den A'ya rotate, üç duyuldu" |
| Yardım gerek | "Yardım [Konum]" | "Yardım B-Main, iki push var" |
| Ult durumu | "[Ajan] ult hazır/hazır değil" | "Raze ult hazır" |
| Ekonomi çağrısı | "Full buy / Force / Save / Eco" | "Bu round takım save" |

### Ne Zaman Çağırmalı

- **Düşmanı görür görmez çağır.** Geç kalan bilgi işe yaramaz.
- **Bir kez söyle.** Sorulmadan tekrarlama — mic'i tıkarsın.
- **Takım arkadaşın 1vX'teyken sus.** Sadece kritik bilgiyi geç: "Defuse ediyorlar" ya da "Son düşman arkanda." Başka hiçbir şey söyleme.

### Nasıl Çağırmalı

- **Kısa kes.** "Jett A-Short" — uzun açıklama yapma.
- **Net konuş.** Emin değilsen bile mırıldanma. Belirsiz çağrı, kaçırılan çağrıdır.
- **Round içinde suçlama yok.** Düello kaybedildi mi? "İyi deneme" de, geç. "Neden oradan çıktın?" deme.

---

## Rol Dağılımı

### Beş Standart Rol

1. **Duelist / Entry Fragger**: Site'a ilk sen gir. Ya kill al ya da düşmanı pozisyonunu ele vermeye zorla — takım için alan aç.
2. **Initiator**: Bilgi topla, entry'yi hazırla. flash, recon, bot — bunlarla takımı içeri sok.
3. **Controller**: smoke'larla, duvarlarla görüş hattını kes. Düşman ne gördüğünü bilemez, sen ne istersen onu görürsün.
4. **Sentinel**: Savunmada siteyi tek başına tut, saldırıda flank'ı kapat. Util'inle alan inkar et.
5. **Flex**: Haritaya ve komp'a göre ne gerekiyorsa onu oyna — ikinci duelist, ikinci controller, ikinci initiator.

### Harita Bazlı Rol Dağılımı

| Harita | Entry | Initiator | Controller | Sentinel | Flex |
|---|---|---|---|---|---|
| Ascent | Jett/Raze | Sova/KAY/O | Omen/Astra | Killjoy/Cypher | KAY/O/Fade |
| Bind | Raze/Jett | Skye/Fade | Brimstone/Viper | Sage/Cypher | Fade/Skye |
| Haven | Jett/Neon | Sova/Breach | Omen/Astra | Killjoy/Cypher | Breach/KAY/O |
| Split | Raze/Jett | Breach/Skye | Omen/Astra | Sage/Cypher | Skye/KAY/O |
| Icebox | Jett/Sova | Sova/Fade | Viper | Sage/Killjoy | Chamber/KAY/O |
| Lotus | Raze/Neon | Fade/Skye | Omen/Harbor | Killjoy/Cypher | Breach/KAY/O |
| Fracture | Neon/Raze | Breach/Fade | Brimstone/Viper | Killjoy/Cypher | KAY/O/Chamber |
| Pearl | Jett/Neon | Fade/KAY/O | Astra/Omen | Killjoy/Cypher | Harbor/Viper |
| Sunset | Raze/Neon | Breach/Fade | Omen/Astra | Killjoy/Cypher | Skye/KAY/O |
| Abyss | Jett/Raze | Sova/Fade | Omen/Viper | Killjoy/Sage | KAY/O/Cypher |

---

## Entry Fragger Sorumlulukları

### Saldırıda

IF initiator entry noktasına flash ya da recon attıysa
MEANING choke geçici temizlendi, savunucular yerinden oynadı
COUNTER savunucular off-angle tutar ya da seni stack'ler; bir kısmı flash söner sönmez re-peek atar
WHY flash patladığı an içeri gir — beklersen savunucu toparlar, seni yeniden nişanlar

1. **Choke'dan ilk geçen sen ol.** flash ya da recon attıktan sonra giriyorsun. Tereddüt yok.
2. **Alan yarat.** Ölsen bile savunucuyu pozisyonunu ele vermeye zorlarsın. Takımın trade alır.
3. **Gördüğünü çağır.** Girer girmez seslen: "Bir heaven, bir default." Bu bilgi takımın için her şeydir.

**Yapma:** Takım arkadaşının önce girmesini bekleme. Beklersen zaten entry fragger değilsin.

**Bil:** Entry her zaman rush demek değil. Util sonrası yavaş peek de entry'dir.

### Savunmada

IF savunmada entry rolü oynuyorsan
MEANING mobiliten ve mekanik gücün erken round etkisi yaratmaya yeter
COUNTER saldırganlar agresif peek noktalarını açı tutar; tahmin edilebilirsen seni bedavaya trade ederler
WHY erken peek takımına bilgi ve sayı üstünlüğü verir — ama trade olmadan çekilmen şart

1. **Erken agresif çık, sonra çekil.** Bilgi topla, pozisyona dön. Orada oturup bekleme.
2. **Retake için oyna.** Savunmada site dışından bekliyorsun, anchor değilsin — takımla birlikte retake atıyorsun.
3. **Agresif op tut.** Jett ya da Chamber oynuyorsan savunmada agresif açı tutmak standart. Pick aldıktan sonra dash ya da TP ile oradan çık.

### Entry Başarı Metrikleri

- **First Kill %**: Oynadığın round'ların %15'inden fazlasında first kill alıyorsan entry işini yapıyorsun demektir.
- **Trade Oranı**: Öldüğünde takımın hemen trade almalı — bu %70 oranında gerçekleşmiyorsa ya çok erken giriyorsun ya da çok geç.
- **FKFD (First Kill - First Death Oranı)**: 1.0 altındaysan ölümlerinden az kill alıyorsun. İyi entry 1.2 ve üstünde oynar.

---

## Anchor Sorumlulukları

Anchor, takım diğer siteye rotate ederken kendi sitende tek başına kalan oyuncudur.

### Temel Görevler

IF saldırganlar util ve birden fazla oyuncuyu sitene dökmeye başlıyorsa
MEANING bu gerçek execute, fake değil
COUNTER seni util'le bunaltıp hızla geçmeye çalışacaklar
WHY görevin onları öldürmek değil, geciktirmek — kazandırdığın her saniye takımın rotate etmesini sağlar

1. **Siteyi tut, ama ölme.** Kill almak zorunda değilsin. smoke, molly, yavaşlatma — ne varsa kullan, onları durdur.
2. **Execute'u hemen çağır.** Sitene util ya da birden fazla düşman girdiğini görür görmez seslen. Geç çağrı, geç rotasyon demek.
3. **Bunalırsan çekil.** Sitede tek başına ölürsen hem bilgi kesilir hem retake gider. Hayatta kal, takımı bekle.

### Anchor Util Kullanımı

IF saldırganlar sitene yaklaşıyorsa
MEANING ayak sesi duyuyorsun, util görüyorsun ya da takımdan recon geldi
COUNTER ya seni rush'layarak geçmeye ya da util'ini boşa harcatmaya çalışacaklar
WHY her util parçası takımına rotasyon için zaman kazandırır — hepsini aynı anda patlatma, sırayla kullan

- **İlk util**: Düşmanı duyar duymaz ilk geciktiriciyi at — smoke, slow ya da molly. Bu kısa pencere kritik.
- **Sonraki util**: İlk geciktirmeyi geçerlerse ikinci util'i kullan. Her ek saniye rotasyona yaklaştırır.
- **Silaha en son gir**: Util bitti ve takım geliyor — ancak o zaman silahlı dövüşe gir. Rotasyon gelmeden ölürsen site bedava gider.

---

## Lurker Sorumlulukları

Lurk rolündeysen takımdan ayrı oynar, bilgi toplar ve flank baskısı kurarsın.

### Temel Prensipler

IF lurk rolü sana atandıysa
MEANING ana gruptan ayrı çalışıyorsun — bilgi topluyor ve flank tehdidi yaratıyorsun
COUNTER düşman tel koyar, flank açılarını tutar ya da seni avlamak için adam gönderir
WHY varlığın düşmanı sırtını izlemeye kaynak ayırmaya zorlar — takımının vurduğu sitedeki savunmayı zayıflatır

1. **Önce bilgi.** Asıl işin takıma ne duyduğunu söylemek. Senden uzak tarafa rotasyon sesi duyduysan, takım diğer sitenin boş olduğunu anlar.
2. **Flank baskısı.** İyi lurk arkadan kill almak değil. Düşmanı flank'tan paranoyak yapıp execute'tan uzakta açı tutmaya zorlamaktır.
3. **Takımla aynı anda vur.** Takım siteye girerken sen arkadan bastır. Çok erken girersen takım hareket etmeden ölürsün. Çok geç kalırsan takım seni beklerken sayı dezavantajına düşer.

### Ne Zaman Lurk, Ne Zaman Gruplan

IF takım yavaş ve bilgi toplayarak ilerliyorsa
MEANING commit etmeden önce haritada bilgi toplama vaktin var
COUNTER düşman seni bulmak için agresif push atabilir — flank'ı flankla
WHY senin bilgin, takımın hangi siteyi vuracağına karar vermesini sağlar

IF takım hızlı execute ya da 5 kişi rush yapıyorsa
MEANING o an sitede her adam gerekli
COUNTER gecikmeli varışın tüm push'u çöpe atar — gruplan
WHY hızlı execute'ta gücü bölmek roundu kaybettirir

---

## Destek Oyuncu Sorumlulukları

Controller ya da initiator oynuyorsan işin entry'yi yaşatmak. Util'in onun için var.

IF entry'nin arkasındaki destek oyuncusuysan
MEANING util'in ve pozisyonun entry'yi güçlendirmek ve trade almak için var
COUNTER entry düştüğünde sen pozisyon dışındaysan düşman seni cezalandırır — trade yok, site yok
WHY smoke ve flash zamanlaman doğruysa ve doğru mesafedeysen site take olur; yanlışsa ikisi de boşa gider

1. **smoke zamanlaması.** Entry içeri girmeden smoke'u koy. Entry girdikten sonra koyarsan zaten açıkta kalır.
2. **flash zamanlaması.** flash, entry peek atmak üzereyken patlamalı. Erken patlarsa düşman toparlar, geç patlarsa entry çoktan girmiş olur — ikisi de işe yaramaz.
3. **Trade pozisyonu.** Entry'nin hemen arkasında dur — trade alacak kadar yakın, aynı hasar alanına girmeyecek kadar uzak.
4. **Plant sonrası.** molly ve smoke'larını spike'ın üstüne kullan. Defuse ettirme.

---

## Trade Buddy Ataması

Sen ve takım arkadaşın trade buddy olmalısınız. Sen ölürsen takım arkadaşın o düşmanı anında öldürür.

### Kurallar

IF trade buddy'n girip öldüyse
MEANING bir düşman dövüş alarak nerede durduğunu ele verdi
COUNTER o düşman cover'a dönmeden trade al
WHY buddy'nin hemen arkasında olmalısın — düşman seni görmeden refrag vurursun

1. **2-2-1 bölünme**: İki trade buddy çifti, bir de yalnız oynayan oyuncu (lurker ya da anchor).
2. **Entry'nin trade buddy'si en kritik atama.** Entry girdiği an arkasında olman lazım.
3. **Mesafe**: Yakın dur ama aynı noktada durma. Çok yakınsan aynı molly'den ya da flash'tan ikiniz de gidersiniz. Çok uzaksan trade geç gelir, işe yaramaz.

- Trade buddy'ler farklı açı tutmalı. Biri düşerken diğeri zaten düşmanın profiline bakıyor olsun.

---

## Rotasyon Öncelik Sırası

IGL rotasyon dediğinde sırayla hareket et:

1. **Hedef site'a en yakın oyuncu** önce gider. En hızlı ulaşan o.
2. **Controller** arkasından gider — retake için smoke/util hazırlar.
3. **Entry fragger** retake push'unu o çeker.
4. **Diğer site'in anchor'u** en son kalkar — fake olabilir, o siteyi tutacak biri lazım.
5. **Lurker** flank pozisyonundaysa kalır, backstab atar. Uzakta boşta duruyorsa rotate eder.

### Rotasyon Hızı

- **Koşarak:** Düşman duyar. Spike kurulduysa ya da takım eridiyse kullan.
- **Yürüyerek:** Sessiz ama yavaş. Fake şüphen varsa bununla git.
- **Kısmi rotasyon:** 1-2 kişi gider, geride biri kalır. IGL split ya da fake kokusu aldıysa bunu seçer.

---

## Default Oyun Çağrısı Sistemi

"Default" demek, bir siteye kilitlenmeden haritayı okumak demek. Amacın bilgi toplamak ve kontrol almak.

### Standart Default Yapısı

1. **İki oyuncu** A tarafını kontrol altına alır (main/short).
2. **İki oyuncu** B tarafını kontrol altına alır (main/long).
3. **Bir oyuncu** (lurker ya da flex) mid'i alır.

Hedef şu: düşmanın nerede olduğunu öğren, pick yakala, sonra öğrendiğine göre execute çağır.

### Default'tan Execute'a Geçiş

IF takım default çalıştırıyorsa
MEANING round'un bilgi toplama fazındasın
COUNTER düşman harita kontrolünü kesmek için sana agresif push açabilir ya da siteyi erken stack'lemek için rotate edebilir
WHY default fazı IGL'e doğru execute'u çağırmak için veri verir — bunu aceleye getirirsen takımın kör ilerler

```
Default Fazı (erken round):
  --> Harita kontrolü al, bilgi topla, varsa kill al.
  --> IGL takım çağrılarını dinler: "A tek kişi," "B iki kişi."

Karar Noktası (mid-round):
  --> IGL çağırır: "Execute A" ya da "Execute B" ya da "Default'a devam."
  --> Bir siteyi stack'lemişlerse --> diğerini vur.
  --> Eşit yayılmışlarsa --> kill aldığın siteyi vur.
  --> Bilgi almadıysan --> IGL'in önceden planladığı stratejiyi execute et.

Execute Fazı (geç round):
  --> Tüm oyuncular çağrılan site'a yaklaşıyor.
  --> Entry smoke/flash kombosu sonrası girer.
  --> Site'a girer girmez hemen plant yap.
```

---

## Mid-Round'da Nasıl Adapte Olursun

### Ne Olunca Ne Yaparsın

| Durum | Yap Bunu |
|---|---|
| Entry fragger ilk kanı aldı | Hemen bas; karşıda sayı eksiği var |
| Entry fragger peek'te öldü | Dur; önce trade al, sonra karar ver |
| Ayak sesi duydun, rakip rotate ediyor | Karşı site boşaldı, hemen geç |
| smoke'un one-way'e döndü | İçinden girme; flash at ya da smoke sönsün bekle |
| 3 ya da daha fazla savunucu buldun | O siteden çık; başka siteye geç ya da pick için bekle |
| Takım arkadaşının bağlantısı koptu | Pasif oyna; trade'e girme, sadece pick ara |

## Pistol Round Rol Atamaları

Pistol round'unda tüfek yok, util az, her kredi değerli. Bunu kafana kaz.

IF takımın saldırı pistol'daysa
MEANING tüfekten vazgeçiyorsun, her kuruşun bir karşılığı olmalı
COUNTER savunucular Classic ve Shorty ile dar açıda bekliyor; bir kısmı siteyi yığıyor
WHY pistol round'unu kazanırsan sonraki iki round'u da cebine koyarsın — ekonomin rayına oturur

### Saldırı Pistol

- **Entry**: Ghost (500) al, kalanı util'e yatır. Ghost uzak açıdaki savunucuyu vurur — Classic o mesafede işe yaramaz.
- **Destek**: Light Shield (400) al, kalanı util'e. O 25 HP bir Classic vuruşunu daha yutman demek, trade yaparken fark yaratır.
- **Controller**: Full util al, Ghost almasan da olur. Pistol'da smoke çok güçlü — düşman dumanın içinden düzgün spray yapamaz.
- **Sentinel**: tel ya da bot + Light Shield. Pistol round'u kaotik geçer, flank'ı kapatmazsan arkandan gelirler.
- **Flex**: Takımda herkes Ghost aldıysa sen Frenzy (450) al. Yakın dövüşte Frenzy kazanır.

### Savunma Pistol

- **Anchor**: Light Shield + Shorty (150) + util. Shorty dar köşede tek atışta öldürür — site içinde mükemmel.
- **Agresif peek atan**: Ghost (500) al. Erken dövüşü Ghost'un güçlü olduğu mesafede ver, yakına düşürme.
- **Stack mı, yayılma mı**: 3-2 yığılma pistol'da işe yarar. Fazladan oyuncu, düşük fire-rate dezavantajını kapatır.

---

## Anti-Eco Rol Ayarlamaları

IF düşman eco'daysa (Classic/Ghost'lar)
MEANING ellerinde zayıf silah var — kaos, rush ve yakın mesafe right-click'e oynayacaklar
COUNTER dar açıda seni geniş swing'le yakalamaya çalışacaklar
WHY mesafe ve temel pozisyonu oyna — eco'ya tüfek round'u kaybetmek hem kasayı hem takımı çöpe atar

1. **Dar açı tutma.** Eco oyuncu rush atıp geniş açar. Dar köşede beklersen Classic right-click seni tek patlamada bitirir.
2. **Mesafeyi koru.** Tüfek orta-uzun mesafede tabancayı ezer. Eco oyuncusunu yakına sokma.
3. **smoke ve molly at.** Eco takımının tek planı rush. Util o planı iptal eder — cimrilik etme.

- Ego peek atma. Anti-eco'da bile Sheriff headshot'u seni gönderir.
- op'u bu round'a harcama. 4.700'lük silahı koşan Classic'e kaptırma.

---

## Sayı Avantajıyla Oynamak

### 4'e 3 Öndesin

IF takımın 4'e 3 avantajı varsa
MEANING rakip geride, risk almak zorunda
COUNTER çılgın hareket yapar, koşa koşa pick arar ya da umutsuz execute dener
WHY haritayı yay, ilk hamleyi onlara yaptır — sen trade hediye etme

### 3'e 2 Öndesin

IF takımın 3'e 2 avantajı varsa
MEANING round lehine ama bedava değil
COUNTER o ikili seni tek başına yakalamaya çalışır
WHY crossfire'ı bırakma, birlikte oyna — solo düello bulduklarında round gider

### 5'e 4 Öndesin

IF takımın 5'e 4 avantajı varsa
MEANING haritanın her köşesini kontrol edebilirsin
COUNTER düşman dövüşmez, seni izole edip eşitlemeye çalışır
WHY haritayı yay, lurker'ı ayrı gönder — execute'ta 4'e 4 bile olsa iyi util ile o dövüş senin

---

## Sayı Dezavantajıyla Oynamak

### 2'ye 3 (Sende 2 Var)

IF takımında 2 kişi kaldıysa
MEANING eşitlemek zorundasın — 1 kill al, 2'ye 2 yap
COUNTER seni trade'e zorlarlar ya da köşe başında beklerler
WHY smoke, flash, molly ile düelloyu izole et — trade verme, kill al

### 2'ye 4 (Sende 2 Var)

IF karşında 4 kişi varsa
MEANING bu round gitti
COUNTER dört kişi üstüne gelir, util boşaltır
WHY maç noktası değilse save yap — silahını taşı, round'u hediye etme

### 3'e 5 (Sende 3 Var)

IF karşında 5 kişi varsa
MEANING 3 kişiyle haritayı kapatmaya çalışma
COUNTER tek bir siteyi beş kişiyle doldururlar
WHY bir site'a yığıl, kumarı oyna — boş siteyi alırlarsa silahını koru, o round'dan kazancın bu

---

## Pick Odaklı mı, Execute mi Kararı

### Pick Odaklı Oyna:

IF sayı avantajın var, güçlü açıların var ya da rakip rush yapıyorsa
MEANING onların sana gelmesini bekle — koşullar senden yana
COUNTER yavaş oynayıp seni inkar edebilirler — ama bu bile sana bilgi verir
WHY pick oyununda util ya da pozisyon yakmazsın, düşmanın sayısını eritirsin

### Execute Yap:

IF tur sona yaklaşıyor, elinde full util var ya da skor senden agresyon istiyorsa
MEANING daha fazla beklersen avantaj tersine döner
COUNTER savunucular siteyi stack'ler ya da anti-execute util patlatır
WHY full util'le giden hazırlıklı bir execute, kurulmuş savunmayı bile ezer

---

## Harita Kontrolü Öncelik Sistemi

### Öncelik Kademeleri

| Kademe | Alanlar | Neden |
|---|---|---|
| Kademe 1 (Al) | Çoğu haritada Mid | Rotasyonu kesersin, siteyi ikiye bölersin |
| Kademe 2 (Al) | Short/connector noktaları | Hızlı execute atarsın, fake'e zorlarsın |
| Kademe 3 (İyi olur) | Site'a yakın derin alanlar | Execute'u kurar ama geri çekilemezsin |
| Kademe 4 (Lüks) | Düşman spawn tarafı | Ancak tam harita kontrolüyle ayağını basarsın |

---

## Site Vuruş Zamanlama Pencereleri

### Hızlı Execute (Round Başında Hemen)

IF round açılır açılmaz siteye giriyorsan
MEANING savunucular yerine oturmadan yakalıyorsun
COUNTER erken-round agresif pozisyon alan savunucular seni bekliyor olacak
WHY pasif retake oynayan takımlara karşı işe yarar — ama pozisyon bilgisi olan takımlar her açıyı önceden tutar, choke'ta ölürsün

### Orta-Tempo Execute (Harita Kontrolü Sonrası)

IF önce orta ve flank'tan bilgi toplar, sonra execute ediyorsan
MEANING util'i körü körüne harcamıyorsun, neyi nereye atacağını biliyorsun
COUNTER savunucular seni okursa ya harita kontrolüne çıkar ya da vuracağını sandıkları siteyi stack'ler
WHY standart zamanlama bu — bilgi toplama ile spike kurma arasında dengeyi tutar

### Geç Execute (Savunucu Util'ini Tüketme)

IF uzun süre bekleyip savunucunun smoke ve molly'lerini eritmesini bekliyorsan
MEANING savunucu util'i bitince siteye giriyorsun
COUNTER rakip geç tempo oynadığını okursa, süresi dolan kendi util'iyle agresif push atar
WHY bunu sadece harita kontrolünü çoktan aldıysan ve savunucu util'i bittiyse yap

---

## Seviyene Göre Oyna

### Immortal+ İçin

IF bu seviyede takım oyununu üst çekmeye çalışıyorsan
MEANING bireysel mekanik farkı kapandı — IGL kalitesi, iletişim disiplini ve rol uyumu round'ları belirliyor
COUNTER mid-round okuma yap, trade buddy ata, rotasyon kararını erken seslendir
WHY herkesin aim'i yetiyor; trade buddy ata, rotasyonu erken seslendir, mid-round'da okuma yap — bunları yapan taraf kazanıyor

### Diamond-Ascendant İçin

IF solo queue'da takım oyununu düzeltmek istiyorsan
MEANING tam IGL olman şart değil — 3 cümlelik standart bile seni solo queue oyuncularının %80'inin önüne geçirir
COUNTER her round şunu yap: 1 bilgi çağrısı, 1 trade buddy, 1 ekonomi seslendirmesi
WHY iletişim kuran taraf bilgi avantajıyla oynar; sessiz takım kör oynar
