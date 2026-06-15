# AJAN: Vyse

## 1. Rol Kimliği
Vyse tuzaklarla alan kapatan bir sentinel. Killjoy hasar verip geciktirir, Cypher bilgi toplar — Vyse ikisini birden yapar ama kendi tarzında: düşmanı kör eder, dikenle yavaşlatıp hasar verir, geçerse arkasına duvar dikip kaçışını keser. Tuzaklarını kapılarda, dar koridorlarda ve köşelerde kur — orada düşmanın etrafından dolaşma şansı yoktur. En büyük gücün şu: flash tuzağına bakmana gerek yok, gizli durur, sen tetikleyene kadar düşman varlığını bilmez.

## 2. Yetenek Seti
- **Duvar Tuzağı (Q)** — 200 kredi, 1 şarj. Yere gizli bir tuzak göm; düşman üstünden geçince arkasında yıkılmaz bir duvar yükselir ve kısa süre durur. Hasar vermez — işi düşmanı bölmek, kaçışını veya geri çekilişini kesmek. Bir düşmanı içeri kapatıp ekibinden ayır, ya da push eden takımı ikiye böl.
- **Flash Tuzağı (E)** — bedava, geri toplanabilir. Bir yüzeye gizli bir çiçek koy; tetiklediğinde ona bakan herkesi kör eder. Tuzak görünmez durur — düşman varlığını bilmez. Kullandıktan sonra geri topla, başka yere göm. Sen tetiklersin: tam peek atacağın an aç, kör düşmana çık.
- **Diken (C)** — 150 kredi, 2 şarj. Attığın yere gizli iner; tetiklendiğinde geniş bir diken alanına açılır, içinden geçen düşmana hasar verir ve yavaşlatır. Killjoy molly mantığı ama kalıcı tuzak gibi — dar geçide göm, geçen yavaşlar + hasar yer. İki şarjın var, iki ayrı giriş yolunu kapat.
- **Ult (X)** — 8 ult puanı. Geniş bir alana metal diken yayar; içinde kalan düşmanın ana silahı kilitlenir, ateş edemez. Tabancası ve yetenekleri çalışır ama tüfek/marksman avantajı sıfırlanır. Düşmanı tabanca dövüşüne mecbur bırakırsın — siz tüfekliyken bu turu kazanırsınız.

## 3. Temel Sorumluluklar
- **İki dikeni iki ayrı giriş yoluna göm**: İkisini aynı yere koyma. Düşman geçince yavaşlar, hasar yer; sen geçtiği yolu anında bilirsin.
- **Flash tuzağını düşmanın geçmek zorunda olduğu yere koy**: Hookah girişi, ramp, dar koridor. Tuzak gizli durur, sen tetikleyene kadar düşman görmez. Tam peek atacağın yere koy ki kör + sen açıdan çık.
- **Duvar tuzağını kaçış/rotate hattına koy**: Düşman geçince arkasında duvar yükselir — ya içeride kapanır (ekibinden ayrı düşer) ya da geri dönemez. Bir adamı yalnız bırakıp ekibin onu temizlesin.
- **Ult'u düşman silah avantajını kullanmadan önce aç**: Site'a tüfekle giren ya da Op tutan düşmanı kapsama al; silahı kilitlenince tabancaya düşer, siz tüfekle bastırırsınız.
- **Flash tuzağını kullandıktan sonra geri topla**: Bedava ekstra tuzak — yerde bırakma, tur içinde yeniden göm.
- **Tuzak tetiklenince takıma söyle**: "A main'de flash attım, kör girin", "B long'da duvar diktim, ayrıldı" — bu bilgi takımın bir sonraki hamlesidir.

## 4. Sık Yapılan Hatalar
- İki dikeni aynı yere yığmak — tek bir Sova oku veya Fade recon'u ikisini birden ortaya çıkarır
- Flash tuzağını açık alana koymak — düşman dolanır, kör etmen boşa gider
- Flash tuzağını yanlış anda tetiklemek — sen peek atamadan açarsan kör geçer, kimse faydalanmaz
- Duvar tuzağını kaçış hattı olmayan yere gömmek — düşman geçmez, duvar boşa kalkar
- Ult'u silah avantajı olmayan ana açmak — düşman zaten tabancalıysa silah kilidi bir şey değiştirmez
- Diken tuzağını yerde bırakıp tetiklememek — yavaşlatma + hasar değeri hiç doğmaz
- Flash tuzağını yerde bırakmak — bedava ekstra tuzağı kaçırıyorsun
- Kendi tuzaklarına yapışık durmak — tuzağını temizleyen util seni de öldürür
- Tuzakları gizli olmasına güvenip hiç saklamamak — Sova/Fade recon'u önündeyse açıkta gömme

## 5. Kalıp -> Anlam

**IF** Tuzakların sürekli açılmadan temizleniyor
**MEANING** Koyduğun yerler fazla belli — düşman gözüyle görüyor ya da nereye koyacağını tahmin ediyor
**COUNTER** Sesin ortam gürültüsüne karıştığı yerlere göm. Haven C long'da ortam sesi tuzak sesini yutar. Bind A short'ta ise temizleme sesinin kendisi bilgi verir — tuzağı temizlemeye çalışan saldırgan pozisyonunu ele verir. Tuzağı temizlemek için düşmanın savunmasız bir pozisyona girmek zorunda kaldığı yeri seç.
**WHY** Gizli tuzak: düşman ya tetikler (kör / yavaş + hasar) ya da temizlemeye zaman harcar. Belli tuzak: bedavaya temizlenir, sıfır değer üretir.

**IF** Flash tuzağını açık alana koyuyorsun ve düşman etrafından dolanıyor
**MEANING** Flash tuzağı sadece düşmanın geçmek zorunda olduğu yerde işe yarar — gizli durur ama yanlış yerdeyse kimse tetiklemez
**COUNTER** Bind Hookah girişi, Split A ramp, Lotus B main — bunlar dar geçit, alternatifi yok. Açık alanda düşmanın seçeneği var, dar yolda yok.
**WHY** Dar koridor: düşman tam o noktadan geçer, sen tetikler kör edersin. Açık alan: düşman başka yoldan girer, flash boşa gider.

**IF** Flash tuzağını yanlış anda tetikliyorsun
**MEANING** Kör etme ile peek aynı anda olmazsa hiç değeri yok — sen açıdan çıkmadan açarsan kör geçer
**COUNTER** Tuzağı kendi peek hattına göm. Düşman geleceğini gördüğün an tetikle, aynı anda açıdan çık. Kör düşman seni göremez — bedava dövüş.
**WHY** Geç tetikleme: kör süresi sen çıkmadan biter. Eş zamanlı: kör + peek = düşman cevap veremeden gitti.

**IF** Diken can yakıyor ama ne sen ne takımın bundan faydalanamıyor
**MEANING** Dikeni kendi göremediğin bir yere koymuşsun — yavaşlattı, hasar verdi ama kimse peek atamadı
**COUNTER** Dikeni kendi güvenli açından düşmanı görebileceğin yere göm. Düşman dikenden geçerken yavaşlar ve hasar yer, sen tam o anda açıdan çık. Yavaş + hasar yemiş düşmana peek atmak = kazandığın dövüş.
**WHY** Açın yoksa diken sadece can yakar, düşman geçip gider. Açın varsa: yavaş + hasar + peek = düşman gitti.

**IF** Ult'u silah avantajı olmayan ana açıyorsun
**MEANING** Ult'un işi düşmanın tüfeğini kilitlemek — düşman zaten tabancalıysa ya da sen geç açtıysan boşa gider
**COUNTER** Tüfekle giren push'u, Op tutan açıyı veya post-plant'te defuse'a gelen tam-alımlı düşmanı kapsama al. Silah kilitlenince tabancaya düşer, siz tüfekle bastırırsınız.
**WHY** Doğru an: düşmanın tüfeği kilitli, sizin değil — açık üstünlük. Yanlış an: kilitlenecek silah yok, ult boşa.

**IF** Vyse hayattayken post-plant turları kaybediliyor
**MEANING** Spike'ın çevresine tuzak konulmamış — Vyse'ın post-plant gücü dikimden önce ön yerleştirme ister
**COUNTER** Saldırıda en az bir dikeni ve duvarı post-plant için sakla. Spike dikilmeden önce defuse açısına dikeni göm, kaçış hattına duvarı hazırla. Defuse'a gelen düşman ya dikenden geçer (yavaş + hasar, sen peek'lersin) ya da duvarla bölünür.
**WHY** Post-plant diken: defuse'çu yavaşlar + hasar yer, sen bedava dövüş alırsın. Tuzaksız post-plant: spike savunmasız.

**IF** Tuzak kurulumun her tur aynı
**MEANING** Düşman kurulumunu ezberledi — tur başında gelip direkt temizliyor
**COUNTER** Her tur en az bir tuzağın yerini değiştir. A main'e her tur soldan değil; bazen sağdan, bazen daha derinden. Düşman bir yeri kontrol etmeye alışınca farklı yere koy.
**WHY** Aynı kurulum: düşman tur başında temizler, tuzak sıfır değer. Değişen kurulum: her tur yeni bir bulmaca.

**IF** Vyse sürekli kullanılmamış tuzaklarla ölüyor
**MEANING** Dövüşe tuzak atmadan giriyorsun — tuzaksız Vyse sıradan bir ajandır
**COUNTER** Herhangi bir açıya çıkmadan önce elindeki her şeyi at. Daha alım aşamasında planla: flash tuzağı nereye, diken nereye, duvarı ne için saklıyorsun.
**WHY** Atılmamış tuzak = alan yok = Vyse oynamanın bir anlamı yok.

**IF** Duvar tuzağını kaçış hattı olmayan yere gömüyorsun
**MEANING** Duvar düşmanı geçince arkasında yükselir — ama düşman oradan geri çekilmiyorsa onu hiç kapatmaz
**COUNTER** Duvarı düşmanın push edip sonra geri çekileceği ya da bir adamın yalnız kalacağı kavşağa göm. Bir adamı içeri kapat, ekibinden ayır; takımın o yalnız düşmanı temizlesin.
**WHY** Kaçış hattındaki duvar: düşmanı böler, sayı üstünlüğü yaratır. Boş yerdeki duvar: kalkar ama kimseyi etkilemez.

**IF** Tuzaklarını her zaman açıkta, görünür yerlere gömüyorsun (Sova/Fade varken)
**MEANING** Recon util'i güvenli mesafeden tuzaklarını işaretliyor — gizli kalma avantajını kaybediyorsun
**COUNTER** Görüş hattının dışına, köşe arkasına, duvar gölgesine göm. Recon tarayan ajanın oku/kuşu görüş hattı ister; tuzağı o hattın kör noktasına koy.
**WHY** Gizli tuzak Vyse'ın tüm gücü — recon onu açığa çıkarırsa kit'in çöker. Kör noktada: düşman yine tetikler.

## 6. Harita Etkileşimleri
- **Lotus**: Dönen kapılar ve dar B main, duvar tuzağı ve diken için biçilmiş kaftan — B main'de geçen düşman dikenden yavaşlar, arkasına duvar dikersin, geri dönemez. A main'deki dar geçit flash tuzağının garantili tetiklenmesini sağlar; tam peek hattına göm, kör girene çık. C site'ın çoklu girişleri tuzakları dağıtmayı ödüllendirir — ult'u C retake'te tüfekle giren düşmana aç, silahını kilitle.
- **Bind**: Teleporter çıkışından çıkan düşman tuzağa düz girer — teleporter çıkışlarına diken koy, çıkar çıkmaz yavaşlasın. A short ve B long kavşaklarına duvar tuzağı, Hookah'a flash tuzağı — Hookah dar geçit, düşman tam o noktadan geçer, kör edersin. Bind'de duvar push eden ekibi A short'ta ikiye bölmek için ideal.
- **Ascent**: A main ve A tree'ye birer tuzak, iki giriş birden kapanır. B main doğal bir diken koridoru — geçen düşman yavaşlar, sen mercato/lane açısından peek'lersin. Mid catwalk'ta flash tuzağı rotate eden düşmanı tam o anda kör eder. Ult'u A site retake'te tüfekli düşmana aç, silah avantajını al.
- **Split**: Dar yollar düşmanı yapıların içinden geçmeye zorlar — Vyse cenneti. B heaven'dan B main'e geçişte duvar tuzağı düşmanı heaven'da kapatır, ekibinden ayırır. A ramp'ta diken push'u yavaşlatır + hasar verir, mid'den rotate gelene zaman kazandırır. Mid mail/vent dar geçidine flash, tam peek hattında.
- **Sunset**: Mid koridoru diken ve flash tuzağı için ana nokta — dar, alternatifi zayıf. A main ve B market'a birer diken; geçen yavaşlar, sen yakın açıdan çıkarsın. Mid geçişte duvar tuzağı rotate eden tek düşmanı bölmek için iyi.
- **Genel kural**: Dar geçit = garantili tetikleme. Kavşak/kaçış hattı = duvarın değeri. Peek hattın = flash'ın doğru yeri. Tuzağı haritanın geometrisine göre seç, alışkanlıkla aynı yere değil.

## 7. Eşleştirme Notları
- **Sova ve Fade'e karşı zayıf**: Sova'nın recon'u ve Fade'in recon'u güvenli mesafeden tuzaklarını bulur. Bu maçlarda tuzakları görüş hattından gizle — duvar arkası, köşe dönüşleri, recon'un giremeyeceği kör noktalar.
- **Hızlı baskı kompozisyonlarına karşı güçlü**: Tuzakları temizleyecek vakti olmayan takımlar dikene ve flash'a direkt girer. Hızlı baskı = tuzak tetiklenir = aynı anda yavaş + hasar + kör alırsın, geciktirip ekibini bekletirsin.
- **Breach'e karşı**: Breach duvarların ardından stun atabilir, tuzaklarını tetiklemeden sen sersemlersin. Tuzaklarını stun hattının dışına, dağıtık kur; flash'ı kendi peek'ine değil düşmanın stun sonrası gireceği noktaya koy.
- **Operator oyuncularına karşı güçlü**: Ult Op'un ana silahını kilitler — Op tutan düşmanı kapsama al, tüfeği gidince tabancaya düşer. Flash tuzağı Op'un görüş hattını anlık keser, diken Op'çuyu pozisyondan çıkmaya zorlar.
- **KAY/O'ya karşı**: Yetenek kapatması tüm tuzaklarını devre dışı bırakır, atıldığı an kurulumun çöker. Tuzaklarını yetenek kapatma menzilinin dışına kur; etkisi bitince hızlıca yeniden göm. Flash tuzağını geri toplayıp yetenek kapatma bölgesinin dışından yeniden konumla.
- **Killjoy ile aynı takımda**: Site'ı çift katman kilitlersin. Killjoy hasar + gecikme verir, Vyse kör + yavaş + duvarla bölme yapar. İkinizinkini aynı girişe yığmayın — farklı giriş yollarına dağıtın ki düşman tek util'le ikisini birden temizleyemesin.
- **Duelist ile aynı takımda (entry desteği)**: Flash tuzağını entry duelist'in gireceği açıya göm; duelist push ederken sen tetikle, kör düşmana o girsin. Diken'i entry sonrası geri çekilme hattına koy, takipçileri yavaşlat.

## 8. Oyuncuya Ne Söylenmeli

### İyi oynayınca
Tuzakları 2-3 ayrı girişe yayıyorsun, flash tuzağını peek hattına koyup tam zamanında tetikliyorsun, post-plant için en az bir diken/duvar saklıyorsun. Aynen devam. Düşman bir açıyı temizleyip ikincisinde de tuzakla karşılaşınca üstünde psikolojik baskı kurarsın — aynı mantığı koru ama her tur en az bir pozisyonu değiştir. Ult'u tüfek avantajına denk getiriyorsan tam doğrusunu yapıyorsun.

### Zorlanınca
Tuzakların ya fazla göze batıyor ya da kimsenin geçmediği yerlerde. Düşmanın hangi yolları kullandığına bak, tuzakları oraya kaydır. Flash'ı kendi peek hattına koy ve tam çıkacağın an tetikle — kör ile peek aynı anda olmalı. Herhangi bir açıya çıkmadan önce elindeki her şeyi at.

### Tahmin edilebilir olunca
Düşman her tur kurulumunu önceden temizliyor. Pozisyonları değiştir. Aynı açı, farklı nokta bile yeter. Saldırıda önce post-plant dikenini ve duvarını göm — kit'inin post-plant'te en sert noktası orası. Sova/Fade varsa tuzakları görüş hattının dışına, kör noktaya gizle.

## 9. Rank Modülasyonu

**Düşük (Iron-Silver)**: Tuzağı nereye koyacağını bilmiyor ya da unutuyor; flash'ı tetiklemeyi unutuyor. Şunu öğret: her giriş yoluna bir diken, ana dar geçide flash tuzağı, açıya çıkmadan önce her şeyi at. Flash gizli durur — sen tetikleyeceksin, peek atacağın an aç. Alım aşamasında kendine sor: "tuzaklarımı nereye koyuyorum?" Flash tuzağını kullandıktan sonra geri toplamayı alışkanlık yap.

**Orta (Gold-Platinum)**: Tuzak koyuyor ama her tur aynı yere. Flash'ı yanlış anda açıyor, ult'u rastgele basıyor. Her tur en az bir tuzağın yerini değiştir. Flash'ı kendi peek'ine bağla — kör + çık aynı anda. Ult'u tüfek avantajının olduğu ana sakla: Op tutan veya tam-alımlı düşmana aç.

**Yüksek (Diamond-Ascendant)**: Tuzak ağını anlıyor ama düşman karşı oynamaya başlayınca adapte olamıyor. Düşmanın hangi yollardan kaçındığını oku, tuzakları oraya kaydır. Duvarı kaçış hattına koyup tek düşmanı ayırmayı öğren. Ult zamanlamasını düşmanın silah avantajını kullanacağı ana denk getir, erken/geç basma. Flash tuzağını tur ortasında geri toplayıp yeniden göm.

**Elit (Immortal-Radiant)**: Her tur farklı tuzak yerleşimi olmalı — aynı kurulum iki tur üst üste çıkmasın. Flash'ı peek'inle saniyesinde senkronla; duvarı düşmanı bölüp sayı üstünlüğü yaratacak kavşağa diktir. Ult, retake'te ya da post-plant'te tüfek avantajını tersine çevirdiğin an açılmalı — tek saniye geç kalma. Diken'i hem geciktirme hem peek-bait olarak kullan: düşman yavaşlarken sen çıkarsın. Flash tuzağını tur içinde iki kez kullan: göm, tetikle, topla, başka yere göm. Sova/Fade'e karşı tuzaklarını recon'un kör noktasına gizleyerek gizli-kalma avantajını koru.
