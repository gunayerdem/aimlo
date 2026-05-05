# Takım Dinamikleri -- Radiant Seviye Bilgi Bankası

---

## IGL Nasıl Karar Verir

IGL olmak demek 5 ayrı oyuncuyu tek bir makine gibi hareket ettirmek demek. Bu rolü üstlendiysen her kararın takımı etkiler.

### Round Öncesi Karar (Buy Fazı)

1. **Ekonomiyi oku.** Kendi takımının kredi durumuna bak, düşmanın ne alacağını tahmin et. Buy round mu, eco mu, force mu — karar ver.
2. **Skor tablosuna bak.** Kimin iyi gittiğini, kimin battığını gör. Zayıf oyuncuyu hedefle.
3. **Geçmişi oku.** Geçen round B'ye stack yaptılarsa bu round A'ya geçebilirler — ya da senin döneceğini düşünerek B'yi tekrar deneyebilirler. Bunu hesapla.
4. **Stratejiyi net söyle.** "A-kontrol default, pick arıyoruz, B'ye rotate'e hazır olun." — muğlak konuşma.

### Mid-Round Adaptasyon (Anlık Kararlar)

Bilgi geldiğinde beklemek en büyük hatadır. Geç çağrı, yanlış çağrıdan daha kötüdür.

```
Bilgi alındı (örn. "İkisi B-Main'de görüldü"):
+-- Değerlendir: Fake mi yoksa gerçek baskı mı?
|   +-- Sadece 2 görüldü, split olabilir --> Çağrı: "Pozisyonları tutun, henüz rotate etmeyin."
|   +-- 3+ görüldü, utility kullanıldı --> Çağrı: "B'ye rotate, A-anchor tut."
+-- Değerlendir: Sayı avantajımız var mı?
|   +-- 5'e 4'üz --> Çağrı: "Sayıyla push, her şeyi trade et."
|   +-- 3'e 4'üz --> Çağrı: "Pasif oyna, pick odaklı, zorlama."
+-- Değerlendir: Spike durumu?
    +-- Spike kurulmadı, vaktiniz var --> Çağrı: "Yavaşla, resetle, harita kontrolü al."
    +-- Spike kuruldu veya vakit daralıyor --> Çağrı: "Şimdi execute, bekleme."
```

### Round Sonrası Analiz

Her round bitince kafanda şu üç soruyu geçir:

- Ne çalıştı, ne çalışmadı?
- Düşman bu round'a göre ayarlama yaptı mı?
- Bir takım arkadaşın battıysa, rolünü değiştir — aynı şeyi tekrar yaptırma.

---

## Timeout Ne Zaman Çağırılmalı

Her takımın yarıda bir timeout hakkı var. Doğru anda kullanırsan birden fazla round'u kurtarırsın.

### Timeout Çağır:

1. **Arka arkaya 3+ round kaybettiysen.** Momentum karşı tarafta. Timeout onların ritmi kırar, takımın kafayı toplar.
2. **Rakip aynı execute'ya cevap veremiyorsa.** Aynı oyunu 3 round üst üste yaptın, hâlâ çalışıyor — timeout çağır, takıma anlat, sonraki round yine bas.
3. **Takım birbirine giriyorsa.** Strateji tartışma. Sadece şunu söyle: "Geçti, gelecek round sıfırdan başlıyoruz."

### Timeout ÇAĞIRMA:

- Kazanıyorsan. Kendi momentumunu kesme.
- Tek round kaybettikten sonra. O normal, paniklenme.
- Sorun aim veya mekanikse. Timeout aim düzeltmez.

## Çağrı Düzeni

### Ne Çağırmalı

| Durum | Çağrı Formatı | Örnek |
|---|---|---|
| Düşman görüldü | "[Sayı] [Ajan] [Konum]" | "İki, Jett ve Omen, B-Main" |
| Yetenek kullanıldı | "[Ajan] [Yetenek] [Konum]" | "Sova drone, Mid" |
| Hasar verildi | "[Ajan] [Kalan HP] [Konum]" | "Jett lit 120, A-Short" |
| Kill onaylandı | "[Ajan] öldürüldü [Konum]" | "Jett öldürüldü, A-Site" |
| Rotasyon tespit edildi | "[Yön]'e rotate, [Sayı] görüldü" | "B'den A'ya rotate, üç duyuldu" |
| Yardım gerek | "Yardım [Konum]" | "Yardım B-Main, iki push yapıyor" |
| Ultimate durumu | "[Ajan] ult hazır/hazır değil" | "Raze ult hazır" |
| Ekonomi çağrısı | "Full buy / Force / Save / Eco" | "Bu round takım save" |

### Ne Zaman Çağırmalı

- **Düşmanı görür görmez çağır.** Geç kalan bilgi işe yaramaz.
- **Bir kez söyle.** Sorulmadan tekrarlama — mic'i tıkarsın.
- **Takım arkadaşın 1vX'teyken sus.** Sadece kritik bilgiyi geç: "Defuse ediyorlar" veya "Son düşman arkan." Başka bir şey söyleme.

### Nasıl Çağırmalı

- **Kısa kes.** "Jett A-Short" — uzun açıklama yapma.
- **Net konuş.** Emin değilsen bile mırıldanma. Belirsiz çağrı kaçırılan çağrıdır.
- **Round içinde suçlama yok.** Düello kaybedildi mi? "İyi deneme" de, geç. "Neden oradan çıktın?" deme.

---

## Rol Dağılımı

### Beş Standart Rol

1. **Duelist / Entry Fragger**: Site'a ilk sen giriyorsun. Kill alırsın ya da düşmanı zorla pozisyon değiştirtirsin — takım için alan açarsın.
2. **Initiator**: Bilgi toplarsın, entry'yi hazırlarsın. Flash, drone, recon — bunlarla takımı içeri sokarsın.
3. **Controller**: Smoke'larla, duvarlarla görüş hattını kesersin. Düşman ne gördüğünü bilemez, sen ne istersen onu görürsün.
4. **Sentinel**: Savunmada siteyi tek başına tutarsın, saldırıda flank'ı kapatırsın. Utility'nle alan inkar edersin.
5. **Flex**: Haritaya ve takım kompozisyonuna göre ne gerekiyorsa onu oynarsın — ikinci duelist, ikinci controller, ikinci initiator.

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

IF initiator entry noktasına flash veya drone atmışsa
MEANING choke geçici olarak temizlenmiş, savunucular yerinden edilmiş
COUNTER savunucular off-angle tutar ya da seni stack'ler; bir kısmı flash patlar patlamaz re-peek atar
WHY flash patladığı an içeri girmen lazım — beklersen savunucu toparlanır, seni yeniden nişanlar

1. **Choke'dan ilk geçen sen ol.** Flash veya drone attıktan sonra giriyorsun. Tereddüt yok.
2. **Alan yarat.** Ölsen bile savunucuyu pozisyonunu ele vermek zorunda bırakırsın. Takımın trade alır.
3. **Gördüğünü çağır.** Girerken hemen seslen: "Bir heaven, bir default." Bu bilgi takımın için her şeydir.

**Yapma:** Takım arkadaşının önce girmesini bekleme. Bunu yaparsan zaten entry fragger değilsin.

**Bil:** Entry her zaman rush demek değil. Util sonrası yavaş peek de entry'dir.

### Savunmada

IF savunmada entry rolü oynuyorsan
MEANING mobiliten ve mekanik gücün erken round etkisi yaratmaya yeter
COUNTER saldırganlar senin agresif peek noktalarını pre-aim eder; tahmin edilebilirsen bedavaya trade ederler seni
WHY erken peek takımına bilgi ve sayı üstünlüğü verir — ama trade olmadan önce çekilmen şart

1. **Erken agresif çık, sonra çekil.** Bilgi topla, pozisyona dön. Orada bekleme.
2. **Retake için oyna.** Savunmada site dışından bekliyorsun, anchor değilsin — takımla birlikte retake atıyorsun.
3. **Agresif Op tut.** Jett veya Chamber oynuyorsan savunmada agresif açı tutmak standart. Pick aldıktan sonra dash veya TP ile oradan çık.

### Entry Başarı Metrikleri

- **First Kill %**: Oynadığın round'ların %15'inden fazlasında first kill alıyorsan entry işini yapıyorsun demektir.
- **Trade Oranı**: Öldüğünde takımın hemen trade almalı — bu %70 oranında gerçekleşmiyorsa ya çok erken giriyorsun ya da çok geç.
- **FKFD (First Kill - First Death Oranı)**: 1.0 altındaysan ölümlerinden az kill alıyorsun. İyi entry 1.2 ve üstünde oynar.

---

## Anchor Sorumlulukları

Anchor, takım diğer siteye rotate ederken kendi sitende tek başına kalan oyuncusun.

### Temel Görevler

IF saldırganlar utility ve birden fazla oyuncuyu senin sitene dökmeye başlıyorsa
MEANING bu gerçek execute, fake değil
COUNTER seni utility'le bunaltıp hızlıca geçmeye çalışacaklar
WHY görevin onları öldürmek değil, geciktirmek — kazandırdığın her saniye takım arkadaşlarının rotate etmesini sağlar

1. **Siteyi tut, ama ölme.** Kill almak zorunda değilsin. Smoke, molly, yavaşlatma — ne varsa kullan, onları durdur.
2. **Execute'yu hemen çağır.** Sitene utility veya birden fazla düşman girdiğini görür görmez seslen. Geç çağrı, geç rotasyon demek.
3. **Bunalırsan çekil.** Sitede tek başına ölürsen hem bilgi kesilir hem retake gider. Hayatta kal, takımı bekle.

### Anchor Utility Kullanımı

IF saldırganlar sitene yaklaşıyorsa
MEANING ayak sesi duyuyorsun, utility görüyorsun ya da takımdan recon geldi
COUNTER ya seni rush'layarak geçmeye ya da utility'ni boşa harcatmaya çalışacaklar
WHY her utility parçası takımına rotasyon için zaman kazandırır — hepsini aynı anda patlatma, sırayla kullan

- **İlk utility**: Düşmanı duyar duymaz ilk geciktiriciyi at — smoke, slow veya molly. Bu kısa pencere kritik.
- **Sonraki utility**: İlk stall'ı geçerlerse ikinci yeteneği kullan. Her ek saniye rotasyona yaklaştırır.
- **Silaha son gir**: Utility bitti ve takım geliyor — ancak o zaman silahlı dövüşe gir. Rotasyon gelmeden ölürsen site bedava gider.

---

## Lurker Sorumlulukları

Lurk rolündeysen takımdan ayrı oynarsın, bilgi toplarsın ve flank baskısı kurarsın.

### Temel Prensipler

IF lurk rolü sana atandıysa
MEANING ana gruptan ayrı çalışıyorsun — bilgi topluyorsun ve flank tehdidi oluşturuyorsun
COUNTER düşman tripwire koyar, flank açılarını tutar ya da seni avlamak için adam gönderir
WHY varlığın düşmanı sırtını izlemeye kaynak ayırmak zorunda bırakır — takımının vurduğu sitedeki savunmayı zayıflatır

1. **Önce bilgi.** Asıl işin takıma ne duyduğunu söylemek. Senden uzak tarafa rotasyon sesi duyduysan, takım diğer sitenin boş olduğunu anlar.
2. **Flank baskısı.** İyi lurk arkadan kill almak değil. Düşmanı flank konusunda paranoyak yapıp onu execute'dan uzakta açı tutmaya zorlamaktır.
3. **Takımla aynı anda vur.** Takım siteye girerken sen de arkadan bastır. Çok erken girersen takım hareket etmeden ölürsün. Çok geç kalırsan takım seni beklerken sayı dezavantajına düşer.

### Ne Zaman Lurk vs Ne Zaman Gruplan

IF takım yavaş ve bilgi toplayarak ilerliyorsa
MEANING commit etmeden önce haritada bilgi toplama zamanın var
COUNTER düşman seni bulmak için agresif push yapabilir — flanker'ı flankla
WHY senin bilgin, takımın hangi siteyi vuracağına karar vermesini sağlar

IF takım hızlı execute veya 5 kişi rush yapıyorsa
MEANING o anda sitede her adam gerekli
COUNTER gecikmeli varışın tüm push'u çöpe atar — gruplan
WHY hızlı execute'da gücü bölmek roundu kaybettirir

---

## Destek Oyuncu Sorumlulukları

Controller veya initiator oynuyorsan, işin entry'yi yaşatmak. Utility'n onun için var.

IF entry'nin arkasındaki destek oyuncusuysan
MEANING utility'n ve pozisyonun entry'yi güçlendirmek ve trade almak için var
COUNTER entry düştüğünde sen pozisyon dışındaysan, düşman seni cezalandırır — trade yok, site yok
WHY smoke ve flash zamanlaması doğruysa ve doğru mesafedeysen, site take olur; yanlışsa ikisi de boşa gider

1. **Smoke zamanlaması.** Entry içeri girmeden smoke'u koy. Entry girdikten sonra koyarsan, zaten açıkta kalmış olur.
2. **Flash zamanlaması.** Flash, entry peek yapmak üzereyken patlamalı. Erken patlasa düşman toparlanır, geç patlasa entry çoktan girmiş olur — ikisi de işe yaramaz.
3. **Trade pozisyonu.** Entry'nin hemen arkasında dur — trade alacak kadar yakın, aynı hasar alanına girmeyecek kadar uzak.
4. **Spike kurulduktan sonra.** Molly ve smoke'larını spike'ın üstüne kullan. Defuse ettirmezsin.

---

## Trade Buddy Ataması

Sen ve takım arkadaşın trade buddy olmalısın. Sen ölürsen takım arkadaşın o düşmanı anında öldürür.

### Kurallar

IF trade buddy'n girip öldüyse
MEANING bir düşman fight alarak nerede durduğunu ele verdi
COUNTER o düşman cover'a dönmeden trade al
WHY buddy'nin hemen arkasında olmalısın — düşman seni görmeden önce refrag vurursun

1. **2-2-1 bölünme**: İki trade buddy çifti, bir de yalnız oynayan oyuncu (lurker ya da anchor).
2. **Entry'nin trade buddy'si en kritik atama.** Entry girdiği anda arkasında olman lazım.
3. **Mesafe**: Yakın dur ama aynı noktada durma. Çok yakınsan aynı molly'den ya da flash'tan ikiniz de gidersiniz. Çok uzaksan trade geç gelir, işe yaramaz.

- Trade buddy'ler farklı açılar tutmalı. Biri düşarken diğeri zaten düşmanın profiline bakıyor olsun.

---

## Rotasyon Öncelik Sırası

IGL rotasyon dediğinde sırayla hareket et:

1. **Hedef site'e en yakın oyuncu** önce gider. En hızlı ulaşan o.
2. **Controller** arkasından gider — retake için smoke/util hazırlar.
3. **Entry fragger** retake push'unu o çeker.
4. **Diğer site'in anchor'u** en son kalkar — fake olabilir, o siteyi tutacak biri lazım.
5. **Lurker** flank pozisyonundaysa kalır, backstab atar. Uzakta boşta duruyorsa rotate eder.

### Rotasyon Hızı

- **Koşarak:** Düşman duyar. Spike kurulduysa ya da takım eridiyse kullan.
- **Yürüyerek:** Sessiz ama yavaş. Fake şüphen varsa bununla git.
- **Kısmi rotasyon:** 1-2 kişi gider, geride biri kalır. IGL split ya da fake kokusunu aldıysa bunu seçer.

---

## Default Oyun Çağrısı Sistemi

"Default" demek bir siteye kilitlenmeden haritayı okumak demek. Amacın bilgi toplamak ve kontrol almak.

### Standart Default Yapısı

1. **İki oyuncu** A tarafını kontrol altına alır (main/short).
2. **İki oyuncu** B tarafını kontrol altına alır (main/long).
3. **Bir oyuncu** (lurker veya flex) mid'i alır.

Hedef şu: düşmanın nerede olduğunu öğren, pick yakala, sonra öğrendiklerine göre execute çağır.

### Default'tan Execute'ya Geçiş

IF takım default çalıştırıyorsa
MEANING round'un bilgi toplama fazındasın
COUNTER düşman harita kontrolunu kesmek için sana agresif push açabilir ya da site'ı erken stack'lemek için rotate edebilir
WHY default fazı IGL'e doğru execute'yu çağırmak için veri sağlar — bunu aceleye getirirsen takımın kör ilerler

```
Default Fazı (erken round):
  --> Harita kontrolu al, bilgi topla, varsa pick al.
  --> IGL takım çağrılarını dinler: "A tek kişi," "B iki kişi."

Karar Noktası (mid-round):
  --> IGL çağırır: "Execute A" veya "Execute B" veya "Default'a devam."
  --> Bir site'ı stack'lemişlerse --> diğerini vur.
  --> Eşit yayılmışlarsa --> pick aldığın site'ı vur.
  --> Bilgi almadıysan --> IGL'in önceden planladığı stratejiyi execute et.

Execute Fazı (geç round):
  --> Tüm oyuncular çağrılan site'a yaklaşıyor.
  --> Entry smoke/flash kombosu sonrası gir.
  --> Site'a girer girmez hemen plant yap.
```

---

## Mid-Round'da Nasıl Adapte Olursun

### Ne Olunca Ne Yaparsın

| Durum | Yap Bunu |
|---|---|
| Entry fragger ilk kanı aldı | Hemen bas; karşı tarafta sayı eksiği var |
| Entry fragger peek'te öldü | Dur; önce trade al, sonra karar ver |
| Ayak sesi duydun, rakip rotate ediyor | Karşı site boş kaldı, hemen geç |
| Smoke'un one-way'e döndü | İçinden girme; flash at ya da smoke bitisin bekle |
| 3 veya daha fazla savunucu buldun | O siteden çık; başka siteye geç ya da pick için bekle |
| Takım arkadaşın bağlantısı koptu | Pasif oyna; trade'e girme, sadece pick ara |

## Pistol Round Rol Atamaları

Pistol round'unda tüfek yok, utility az, her kredi değerli. Bunu kafana kaz.

IF takımın saldırı pistol'daysa
MEANING tüfekten vazgeçiyorsun, her kuruşun bir karşılığı olmalı
COUNTER savunucular Classic ve Shorty ile dar açılarda bekliyor; bir kısmı site'ı yığıyor
WHY pistol round'u kazanırsan sonraki iki round'u da cebine koyuyorsun — ekonomin rayına giriyor

### Saldırı Pistol

- **Entry**: Ghost (500) al, kalanı yeteneklere yatır. Ghost uzak açıdaki savunucuyu vurur — Classic o mesafede işe yaramaz.
- **Destek**: Light Shield (400) al, kalanı yeteneklere. O 25 HP bir Classic vuruşunu daha yutman demek, trade yaparken fark yaratıyor.
- **Controller**: Full utility al, Ghost almasan da olur. Pistol'da smoke çok güçlü — düşman dumanın içinden doğru spray yapamaz.
- **Sentinel**: Tripwire veya alarm + Light Shield. Pistol round'u kaotik gidiyor, flank'ı kapatmazsan arkandan geliyorlar.
- **Flex**: Takımda herkes Ghost aldıysa sen Frenzy (450) al. Yakın dövüşte Frenzy kazanır.

### Savunma Pistol

- **Anchor**: Light Shield + Shorty (150) + yetenekler. Shorty dar köşede tek atışta öldürür — site içinde mükemmel.
- **Agresif peek yapan**: Ghost (500) al. Erken fight'ı Ghost'un güçlü olduğu mesafede ver, yakına düşürme.
- **Stack mı, yayılma mı**: 3-2 yığılması pistol'da işe yarar. Fazladan oyuncu, düşük fire-rate dezavantajını kapatıyor.

---

## Anti-Eco Rol Ayarlamaları

IF düşman eco'daysa (Classic/Ghost'lar)
MEANING ellerinde zayıf silah var — kaos, rush ve yakın mesafe right-click'e oynayacaklar
COUNTER dar açılarda seni geniş swing'le yakalamaya çalışacaklar
WHY mesafe ve temel pozisyonları oynamalısın — eco'ya tüfek round'u kaybetmek hem kasayı hem takımı çöpe atar

1. **Dar açı tutma.** Eco oyuncu rush yapıp geniş açılır. Dar köşede beklersen Classic right-click seni tek patlamada bitirir.
2. **Mesafeyi koru.** Tüfek orta-uzun mesafede tabancayı ezer. Eco oyuncusunu yakına sokma.
3. **Smoke ve molly at.** Eco takımının tek planı rush. Utility o planı iptal eder — cimri olma.

- Ego peek atma. Anti-eco'da bile Sheriff headshot'tan ölürsün.
- Operator'u bu round'a harcama. 4,700'lük silahı koşan Classic'e kaptırma.

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
WHY crossfire'ları bırakma, birlikte oyna — solo düello bulduklarında round gider

### 5'e 4 Öndesin

IF takımın 5'e 4 avantajı varsa
MEANING haritanın her köşesini kontrol edebilirsin
COUNTER düşman fight etmez, seni izole edip eşitlemeye çalışır
WHY haritayı yay, lurker'ı ayrı gönder — execute'ta 4'e 4 bile olsa iyi util ile o fight senin

---

## Sayı Dezavantajıyla Oynamak

### 2'ye 3 (Sende 2 Var)

IF takımında 2 kişi kaldıysa
MEANING eşitlemek zorundasın — 1 pick al, 2'ye 2 yap
COUNTER seni trade'e zorlarlar ya da köşe başında beklerler
WHY smoke, flash, molly ile düelloyu izole et — trade verme, pick al

### 2'ye 4 (Sende 2 Var)

IF karşında 4 kişi varsa
MEANING bu round gitti
COUNTER dört kişi üstüne gelir, utility boşaltırlar
WHY maç noktası değilse save yap — silahını taşı, round'u hediye etme

### 3'e 5 (Sende 3 Var)

IF karşında 5 kişi varsa
MEANING 3 kişiyle haritayı kapatmaya çalışma
COUNTER tek bir site'ı beş kişiyle doldururlar
WHY bir site'a yığın, kumar oyna — boş site'ı alırlarsa silahını koru, o round'dan kazancın bu

---

## Pick Odaklı mı Execute mi Kararı

### Pick Odaklı Oyna:

IF sayı avantajın var, güçlü açıların var ya da rakip rush yapıyorsa
MEANING onların sana gelmesini bekle — koşullar senden yana
COUNTER yavaş oynayıp seni inkar edebilirler — ama bu bile sana bilgi verir
WHY pick oyununda util veya pozisyon yakmazsın, düşmanın sayısını eritirsin

### Execute Yap:

IF tur sona yaklaşıyor, elinde full util var ya da skor senden agresyon istiyorsa
MEANING daha fazla beklersen avantaj tersine döner
COUNTER savunucular siteyi stack'ler ya da anti-execute util patlatır
WHY full util'le giden hazırlıklı bir execute, kurulmuş savunmayı bile ezer

---

## Harita Kontrolu Öncelik Sistemi

### Öncelik Kademeleri

| Kademe | Alanlar | Neden |
|---|---|---|
| Kademe 1 (Al) | Çoğu haritada Mid | Rotasyonu kesersin, site'ı ikiye bölersin |
| Kademe 2 (Al) | Short/connector noktaları | Hızlı execute atarsın, fake'e zorlarsin |
| Kademe 3 (İyi olur) | Site'a yakın derin alanlar | Execute'ü kurar ama geri çekilemezsin |
| Kademe 4 (Lüks) | Düşman spawn tarafı | Ancak tam harita kontroluyla ayağını basarsın |

---

## Site Vuruş Zamanlama Pencereleri

### Hızlı Execute (Round Başında Hemen)

IF round açılır açılmaz siteye giriyorsan
MEANING savunucular yerine oturmadan yakalıyorsun
COUNTER erken-round agresif pozisyon alan savunucular seni bekliyor olacak
WHY pasif retake oynayan takımlara karşı işe yarar — ama pozisyon bilgisi olan takımlara karşı her açıdan pre-aim yersin ve choke'ta ölürsün

### Orta-Tempo Execute (Harita Kontrolü Sonrası)

IF önce orta ve flanklardan bilgi toplar, sonra execute ediyorsan
MEANING utility'yi körü körüne harcamıyorsun, ne nereye gideceğini biliyorsun
COUNTER savunucular seni okursa ya harita kontrolüne çıkar ya da vuracağını düşündükleri siteı stack'ler
WHY standart zamanlama bu — bilgi toplama ile spike kurma arasında dengeyi kurar

### Geç Execute (Savunucu Utility'sini Tüketme)

IF uzun süre bekleyip savunucunun smoke ve molly'lerini eritmesini bekliyorsan
MEANING savunucu utility'si bitince siteye giriyorsun
COUNTER rakip geç tempo oynadığını anlarsa, süresi dolan kendi utility'nle agresif push yapar
WHY bunu sadece harita kontrolünü çoktan aldıysan ve savunucu utility'si bittiyse yap

---

## Seviyene Göre Oyna

### Immortal+ İçin

IF bu seviyede takım oyununu üst çekmeye çalışıyorsan
MEANING bireysel mekanik farkı kapandı — IGL kalitesi, iletişim disiplini ve rol uyumu round'ları belirliyor
COUNTER mid-round okuma yap, trade buddy ata, rotasyon kararını erkenden seslendir
WHY herkesin aim'i yetiyor; trade buddy ata, rotasyonu erken seslendir, mid-round'da okuma yap — bunları yapan taraf kazanıyor

### Diamond-Ascendant İçin

IF solo queue'da takım oyununu düzeltmek istiyorsan
MEANING tam IGL olman şart değil — 3 cümlelik standart bile seni 80% solo queue oyuncusunun önüne geçirir
COUNTER her round şunu yap: 1 bilgi çağrısı, 1 trade buddy, 1 ekonomi seslendirmesi
WHY iletişim kuran taraf bilgi avantajıyla oynuyor; sessiz takım kör oynuyor