---
id: general_pattern_library
type: general
topic: pattern-detection
patch: "9.x"
tags: [patterns, anti-strat, reads, adaptation, tactical-coaching]
---

# PATTERN LIBRARY — Rakip Pattern'leri ve Counter Stratejileri

Valorant'ta kazanmanın %40'ı mekanik, %60'ı pattern okuma. Pro koç rakibin ne yaptığını değil, **niye** yaptığını anlar, sonraki round'u buna göre hazırlar. Bu dosya en sık görülen pattern'lerin tanımı + meaning + counter formatında kataloğudur.

## FORMAT

Her pattern:
**IF:** (Ne görürsün — trigger)
**MEANING:** (Rakip niye yapıyor — motivation)
**COUNTER:** (Nasıl yanıtla — actionable)
**WHY IT WORKS:** (Niye counter çalışır — reasoning)

---

## SITE STACK PATTERN'LARI

### Pattern: Tek Site Stack (B Stack)
**IF:** Rakip 2 round üst üste B'de 3 oyuncu tutuyor, A'da 2 kişi kalıyor
**MEANING:** Sizin saldırınızı B'ye tahmin ettiler, bu round da aynısını bekliyorlar
**COUNTER:** A'ya 4 kişiyle bas, B'ye 1 kişi fake için ses yaparak kalır. A'da sayı avantajı + utility bolluğu ile hızlı execute, B anchor'ın rotate'i geç kalır.
**WHY:** Stack okunduğu anda zayıflayan bir cezadır, tahmin üzerine kuruludur. Doğru okunmuş stack round alır, yanlış okunmuş stack bedava round verir.

### Pattern: Mid Stack (Split, Sunset, Ascent)
**IF:** Savunma mid'de 2-3 oyuncu tutuyor, siteler zayıf
**MEANING:** Mid kontrolünü agresif almak istiyorlar, saldırının split oyununu kesmek.
**COUNTER:** Mid fake + hızlı site execute. Mid'e 1 oyuncu ses yapar, gerçek bas siteden direkt. Mid'de stack olan oyuncular rotate ederken geç kalır.
**WHY:** Stack stratejisi zaman gerektirir. Mid oyuncuları site'a yetişmeden site kontrol edilirse stack avantajı kaybolur.

### Pattern: Double Anchor Tek Siteye
**IF:** Aynı site'a 2 anchor, diğer site'a tek anchor + mid
**MEANING:** Saldırının zayıf site'ını ceza ile tutmaya çalışıyorlar
**COUNTER:** Tek anchor'ın olduğu site'a hızlı execute. Tek anchor yalnız kalır, rotate gelene kadar site alınır.
**WHY:** Rotate zamanı stack'in en büyük zayıflığı. Saldırı bu zamanı kullanabilirse stack pozisyonundakiler post-plant'e geç kalır.

---

## EXECUTE PATTERN'LARI

### Pattern: Utility Dump Execute
**IF:** Saldırı round başında çok utility kullanıyor (3+ smoke, 3+ flash, molly)
**MEANING:** Full execute, site commit kesin, fake yok
**COUNTER:** Stack o site'a, utility sakla (post-plant için). Retake değil hold oyna — site'a girmelerini engellemeye çalış, girerlerse utility ile post-plant retake.
**WHY:** Utility dump eden takımın round ortasında kalan utility'si yok. Post-plant'te sen utility sahibisen onlar savunmasız.

### Pattern: Fast Execute (Minimum Utility)
**IF:** Saldırı hızlı site'a bas yapıyor, utility az kullanılıyor
**MEANING:** Eco veya force round, hız sürpriz avantajı peşinde
**COUNTER:** Close range hazır ol, spread et. Stack yapma — hız avantajı close range'dedir, hızlı ekibe open angle verme.
**WHY:** Fast execute'da en çok ölen oyuncu yalnız anchor'dır. Spread + info ile ilk duello'yu trade'le, hız avantajını kırdın.

### Pattern: Default Execute
**IF:** Saldırı round açılışını bilgi toplamaya ayırıyor, yavaş yaklaşıyor
**MEANING:** Mid-round karar verecekler, info ağırlıklı play. Okumayla oynuyorlar.
**COUNTER:** Info verme disiplini. Defender'lar erken peek'ten kaçınmalı, info'yu sadece gerekliyken ver. Rakip info alamazsa default'u execute'a çeviremez.
**WHY:** Default'un yakıtı bilgi. Bilgi kesilirse default boşa düşer, round sonunda panik execute yapar ve okunur.

---

## UTILITY PATTERN'LARI

### Pattern: Post-Plant Lineup Spam
**IF:** Saldırı plant'ten sonra spesifik lineup'lar atıyor, aynı spot'lara
**MEANING:** Spesifik lineup oyuncusu var (Brimstone, Viper, Sova, KAY/O)
**COUNTER:** Retake hızlandır, lineup'ları çalıştıramadan girmeye zorla. Plant spike pozisyonunu önceden not et, sıradaki round plant başka yerde yap (saldırı ise) veya retake hızlı (savunma ise).
**WHY:** Lineup'lar sabit plant pozisyonuna göre kurulmuş, plant değişirse lineup boşa. Retake hızı lineup'ı çalıştıracak zamanı vermez.

### Pattern: Utility Eco — Utility'yi Tutma
**IF:** Rakip ability'lerini hiç kullanmıyor, utility save ediyor
**MEANING:** Bir sonraki round için biriktiriyorlar, ya da ult point peşinde
**COUNTER:** Bu round'u maksimum utility harcamanla al — rakip utility'siz olacak. Sonraki round'u da hızlı plan yap çünkü rakip ult + utility ile güçlü gelecek.
**WHY:** Utility eco momentum stratejisi; round ver, sonraki round al. Bu round'u al + sonrakini hazırla disiplin gerektirir.

### Pattern: Sentinel Utility Kullanmıyor
**IF:** Killjoy turret atmıyor, Cypher tripwire koymuyor
**MEANING:** Rotate round'u veya flank beklemiyorlar — full commit pozisyonu
**COUNTER:** Flank'i şiddetle deneyin. Sentinel info utility'si yoksa flank hattı açık.
**WHY:** Sentinel'ın birincil işi info denial. Utility yoksa takım gerçek bilgi akışı olmadan oynuyor demek, flank bedava.

---

## EKONOMI PATTERN'LARI

### Pattern: 2 Round Üst Üste Kaybetti + Utility Yok
**IF:** Rakip iki round kaybetti, 3. round'da utility minimum geliyor
**MEANING:** Save + force geçişi. Next round için ult + silah topluyorlar.
**COUNTER:** Anti-eco spread'ini kur, Sheriff/Spectre'ye hazır ol. Round'u kaybedersen rakibin momentumu mapi döndürebilir, bu round bırakılamaz.
**WHY:** Save round'lar ekonomiyi kurtarır ama momentum kaybı yaratır. Ekonomi döngüsünü rakibin en zayıf anında al.

### Pattern: Eco Round'da Rush Göstergeleri
**IF:** Rakip eco round'da Judge/Spectre ile grup halinde hareket ediyor
**MEANING:** Close range round çalma denemesi
**COUNTER:** Stack o yerde değil yakın tarafta, close range disadvantage yaratma. Uzun angle zorla.
**WHY:** Eco rush'ın işleyişi sürpriz + close range. Uzak mesafede rifle rush'ı yakalar.

### Pattern: Bonus Round'da Utility Zayıflığı
**IF:** Rakip eco kazandı, bonus round oynuyor
**MEANING:** Silahları var ama utility eksik
**COUNTER:** Utility dominance ile execute. Rakip utility hole'unu kapayamaz, post-plant bile utility savaşını sen kazanırsın.
**WHY:** Bonus round'da silah eşitse utility farkı round'u belirler.

---

## OYUNCU PATTERN'LARI

### Pattern: Aynı Op Oyuncusu Aynı Spot
**IF:** Rakip Op oyuncusu 2 round aynı angle tutuyor
**MEANING:** Konfor spot, pre-aim angle, öğrendiği spot
**COUNTER:** Flash + utility dump o angle'a. Pre-aim edilmiş bir oyuncu flash'ı kafaya alınca değer kaybeder. Angle tekrar ediyorsa bir sonraki round smoke ile angle'ı tamamen öldür.
**WHY:** Op'un değeri accuracy + positioning. Positioning okunduğunda Op sadece pahalı bir silahtır, değeri kaybolur.

### Pattern: Lurker Aynı Hatta
**IF:** Rakip takımın bir oyuncusu her round diğer tarafta görünüyor (flank area)
**MEANING:** Dedicated lurker, info + flank kill rolü
**COUNTER:** Flank alanına tripwire, turret, dart veya dedicated watcher. Lurker'ı ilk round'da tanı, sonraki round'larda haritada yok sayma — rotasyon yolundaki tuzağı hesaba kat.
**WHY:** Lurker info avantajını çalıyor. Info avantajı alınmazsa lurker pasif kalır, takımı 4v5 oynar.

### Pattern: Duelist Çok Erken Ability Harcıyor
**IF:** Jett dash, Raze satchel gibi ability'ler round'un ilk anlarında bitiyor
**MEANING:** Rakip duelist kontrolü kaybetmiş, panikle ability harcıyor
**COUNTER:** Ability'si bitmiş duelist'i takip et, ikinci peek'te yakala. Dash veya satchel'sız duelist savunmasız.
**WHY:** Duelist'in değeri ability escape'tir. Ability yoksa normal bir oyuncudur, mekaniğe düşer.

---

## DEFENSIVE BEHAVIOR PATTERN'LARI

### Pattern: Early Aggression (Defender)
**IF:** Savunma her round agresif bilgi alıyor — A Main'den, B Main'den
**MEANING:** Info prioritize ediyorlar, pozisyona göre değil oyuncuya göre anchor atamışlar
**COUNTER:** Agresif peek'i utility ile cezalandır. 3. round flash + utility dump = o oyuncu 1 kere ceza görür, 4. round geri çekilir. O noktadan sonra ekstra info avantajın var.
**WHY:** Agresif peek tekrar ederse predictable olur. Bir kere ceza = pattern'in kırılması.

### Pattern: Passive Anchor Hold
**IF:** Defender ilk info verildikten sonra site'a çekiliyor, duello kabul etmiyor
**MEANING:** Retake odaklı savunma, delay + trade mentality
**COUNTER:** Fast execute değil kontrollü execute. Site'ı temizle, plant, spread, post-plant. Passive anchor'ı post-plant'te yakala.
**WHY:** Passive anchor'ın tehlikesi retake'te. Site alınmadan önce commit'i yavaşlatır, site alındıktan sonra post-plant'te angle tutar. Bu beklentiye göre oyna.

---

## ROTATE PATTERN'LARI

### Pattern: Tek Yönlü Rotate
**IF:** Savunma her zaman mid'den rotate ediyor, CT yoldan gelmiyor
**MEANING:** Mid kontrolüne güveniyorlar, CT hattını kullanmıyorlar
**COUNTER:** Mid'e utility + flank CT'den. Rotate yolu tuzağa dönüşür, geç kalan defender kolay kill.
**WHY:** Predictable rotate = predictable ölüm. Rotate hattı önceden biliniyorsa utility ile kilitlenebilir.

### Pattern: Çift Rotate (Over-Rotate)
**IF:** Savunma info alır almaz 2-3 kişiyle bir tarafa akıyor
**MEANING:** Overreact ediyorlar, panikle rotate kararları veriyorlar
**COUNTER:** Fake ses + rotate bekle + boşalan tarafa asıl commit. Over-rotate'e karşı fake = gold standard counter.
**WHY:** Over-rotate defender sayısını yanlış yere koyar. Asıl commit o tarafın boşalmasına zamanlanır.

---

## CLUTCH VE LATE ROUND PATTERN'LARI

### Pattern: Late Round Panic Push
**IF:** Saldırı round saati düşükken panikle bas yapıyor
**MEANING:** Default başarısız oldu, bilgi toplayamadılar
**COUNTER:** Retake setup'ı gibi bekle. Panik execute'de trade chain bozulur, utility sıralaması yanlıştır. Hazır bir savunma kolay multi-kill çıkarır.
**WHY:** Panik kararların kalitesi düşer. Planlı savunma karşısında panik saldırı kaybeder.

### Pattern: 1vN Clutch Hiding vs Aggressive
**IF:** Rakip clutch oyuncusu round sonuna kadar ses çıkarmıyor
**MEANING:** Hiding play, defuse timer peşinde
**COUNTER:** Spike'a yaklaşma, utility sprey, zorla peek. Hide clutch'ın silahı zaman; zaman azaldıkça clutch'ın panik peek şansı artar.
**WHY:** Zaman baskısı clutch'ı savunmadan saldırıya geçirir. Kötü angle'da peek etmek zorunda kalır.

---

## META PATTERN'LARI

### Pattern: Viper/Harbor Double Controller
**IF:** Rakip double controller kullanıyor (iki smoker)
**MEANING:** Post-plant meta, utility dominance oyunu
**COUNTER:** Utility eşitliği için sen de double controller veya utility rich comp. Post-plant'te utility savaşını kaybedersen round kaybı garanti.
**WHY:** Double controller'ın gücü post-plant'te belirginleşir. Utility eşit olmadan retake imkansız hale gelir.

### Pattern: Double Duelist Rush
**IF:** Rakip iki duelist, her round hızlı execute
**MEANING:** Tempo meta, hız ve sürpriz avantajı
**COUNTER:** Info utility (Sova dart, Cypher cam) + info-based defender setup. Info erken alınırsa rush'ın sürprizi öldürülür.
**WHY:** Double duelist'in fonksiyonu hız. Hız sürpriz olmadan sadece dezorganize saldırı olur.

### Pattern: Lurker-Heavy Comp
**IF:** Rakip her round bir oyuncu diğer tarafta, asla 5 kişi yok
**MEANING:** Info + flank + late round clutch oyunu
**COUNTER:** Flank watch utility her round, map control zorla. 5 kişi bir yerde olmadığı için 4 kişiyle execute yapıyorlar — sayı avantajına çevir.
**WHY:** Lurker takımın gücünü dağıtıyor. 4v5 execute savunma ile eşit ya da dezavantajlı. Savunma flank alanını kapatırsa lurker tamamen silinir.

---

## PATTERN DETECTION DISIPLINI

- **Bir pattern 2 round'da başlar, 3 round'da doğrulanır.** 1 round okuma değil tesadüf.
- **Kendi pattern'lerini de okuyorlar.** Her 3 round'da bir varyasyon şart, yoksa sen okunuyorsun.
- **Pattern ≠ hard read.** Pattern olasılık artışı, garanti değil. Pattern counter'ın %70 çalışıyorsa zafer.
- **Pattern + ekonomi + ult = round kararı.** Üçünü birleştir, tek başına pattern yeterli değil.

## RANK NOTU

**Gold-Plat:** Pattern okumak değil, reaction ile oynuyorsun. Pattern'leri öğrenmeye başla: rakibin son 3 round'unun nerede olduğunu mental olarak not et.

**Diamond-Ascendant:** Pattern'leri görüyorsun ama counter'ları yavaş uyguluyorsun. Pattern gördüğünde anında plan değiştirme disiplini. IGL değilsen de kendi pozisyonunu pattern'e göre ayarla.

**Immortal-Radiant:** Anti-pattern oyunu. Pattern'leri doğrulamadan counter'ını oynarsan tuzağa düşersin — rakip seni pattern okuyor ve counter-counter hazırladı. 2-3 katmanlı pattern oyunu pro seviyenin işidir.
