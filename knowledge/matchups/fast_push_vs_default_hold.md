---
id: matchup_fast_push_vs_default_hold
type: matchup
patch: "9.x"
tags: [matchup, tempo, fast-push, default-hold, tactical]
---

# MATCHUP: Fast Push vs Default Hold

## 1. Matchup Özü

Fast push şu demek: tüm takım tek siteye yığılır, savunma rotate edemeden entry alınır. Default hold şu demek: savunma 2-1-2 ya da 2-2-1 dağılır, her hatta trade partneri olan bir oyuncu durur, saldırı ilk temas'ta tag yer ve rotate başlar.

Bu matchup'ın tek kilit anı var: **ilk temas**. Saldırı bilgi vermeden ilerliyorsa push çalışıyor. Savunma ilk tag'i aldıysa hold çalışıyor. Bu anın dışında her şey sadece util yakma.

## 2. Hangi Taraf Avantajlı

**Fast push avantajlı:**
- Savunma dağılımı statik ve round başında tuzağı kurulmamışsa
- Giriş koridoru tek ağızsa — savunma iki ağızlı bir hattı tek taraftan tutmaya çalışıyorsa (Split A, Bind B)
- Takımında çift flash agenti varsa — ikisi zincir yaparsa savunma peek yapamaz
- Savunma anchor'ı yalnız, trade partneri başka hatta kaymışsa
- Savunma silaha para yatırmak zorunda kaldıysa, util az

**Default hold avantajlı:**
- Saldırı smoke atmadan girdiyse — savunma çift açıdan bedava vurur
- Savunmada sentinel kuruluysa — tuzak hattına çarparsın
- Savunma orta alanı elinde tutuyorsa — flank açılır
- Saldırı entry agenti dash/satchel harcadıktan sonra yanında kimse yoksa
- Savunmada aynı koridoru kapatan iki keskin nişancı varsa

## 3. Key Düellolar

**IF** Saldırı smoke atmadan fast push başlattı
**MEANING** Savunma çift açıdan rahat vurur, ilk giren iki taraftan yenir
**COUNTER** Girmeden önce yan hattı smoke'la kapat — tek açıyla yüzleşirsin, iki açıyla değil
**WHY** Smoke olmadan fast push diye bir şey yok, toplu içeri girme var. İkisi aynı şey değil.

---

**IF** Savunma 2-2-1 kurdu, saldırı 5 kişiyle bir siteye girdi
**MEANING** Savunma sayıca az, iki anchor zamanında rotate'i karşılayamaz
**COUNTER** Savunmadaysan ilk temas'ta rotate sinyali ver — orta oyuncu o siteye kayar, keskin nişancı yeniden konumlanır
**WHY** Default hold sayısal savunma değil, bilgi + rotate sistemidir. İlk tag sinyaldir, sinyal geç verilirse push tamamlanır.

---

**IF** Saldırı util sırasını yanlış attı — flash önce, smoke sonra
**MEANING** Flash bittiğinde savunma hazır, smoke geç geldiği için açı hâlâ açık
**COUNTER** Sıra şu olmalı: smoke → flash → giriş. Smoke açıyı öldürür, flash refleksi kırar, sonra girersin
**WHY** Sıra bozulursa her parça yalnız çalışır, hiçbiri değer üretmez.

---

**IF** Savunma anchor yalnız, trade partneri orta alana kaymış
**MEANING** Fast push anchor'ı tek başına karşılar — ilk vuruştan sonra serbest kalırsın
**COUNTER** Savunmadaysan orta oyuncuyu siteye çek, anchor yalnız durmasın. Saldırıdaysan bu halkaya bas — trade partneri yoksa duelist serbesttir
**WHY** Yalnız anchor savunmanın en zayıf noktası. Fast push oraya basar.

---

**IF** Savunma her round aynı default hold'u kurdu
**MEANING** Saldırı hattı okur, savunmanın nerede olduğunu bilir
**COUNTER** Saldırıdaysan bunu oku — setup kurulmadan o siteye git. Savunmadaysan hold'unu değiştir, ama util yarım kalır
**WHY** Default hold'un okunabilirliği aynı zamanda zayıflığı. Her round aynıysa karşı taraf okur.

---

**IF** Fast push sırasında herkes arka arkaya tek hattan girdi
**MEANING** Savunma tek açıdan art arda vurur — birini öldürdükten sonra diğeri hazır
**COUNTER** İki farklı açıdan aynı anda gir — savunma tek açı tutamaz
**WHY** Fast push sayısal üstünlüğü ancak çoklu giriş hattıyla işe yarar. Tek sıra savunmanın işini kolaylaştırır.

---

**IF** Savunma keskin nişancısı fast push hattında değil, yan koridorda
**MEANING** Keskin nişancının silahı o round hedef hatta değer üretmedi
**COUNTER** Saldırıdaysan keskin nişancının olmadığı siteye git — rotate süresi push süresinden uzun
**WHY** Keskin nişancı silahı konum silahıdır, hızlı rotate için tasarlanmamıştır. Hızlı girersen o round boyunca pasiftir.

## 4. Util ve Kaynak Dengesi

Fast push en az çift smoke + iki flash ister. Tek smoke hattı kapatmaz, tek flash refleksi kırmaz. Savunma default hold için sentinel kurulumu + tek yönlü smoke ister — kalanını retake için saklar.

Saldırı util'ini girişe yatırıyorsa spike kurulduktan sonra çıplak kalır. Bu yüzden fast push kazancı girişte olmalı — uzayan fast push tanım gereği ölmüştür. Savunma ilk tag'i aldığında kazancını üretiyor, tag olmadan hold bilgi üretmez ve util boşa gider.

## 5. Haritaya Göre Değişim

**Bind (fast push avantajlı):** B koridoru tek ağız, A'ya teleportla toplu giriş yapılabilir. Savunma hattı tek noktaya yığılır, diğer site açık kalır.

**Haven (default hold avantajlı):** Üç site savunmanın evi. 2-2-1 dağılımı her hattı kapatır, fast push hangi siteye giderse gitsin iki oyuncuyla karşılaşır.

**Ascent (dengeli):** Orta alan kilit. Orta alanı alan taraf fast push'u ya destekler ya da çaprazdan keser.

**Split (default hold avantajlı):** Dar koridorlar ve dikey oyun sentinel kurulumuna uygun. Fast push ancak havalandırma yoluyla delinir.

**Lotus (fast push avantajlı):** Üç site ve döner kapılar saldırı geçişine geniş alan açar. Savunma bölününce tek siteye baskı kurduğunda rotate uzar.

**Breeze (fast push avantajlı):** Uzun açılar savunmayı hatta dağıtır. A tünel veya B koridordan commit push yapar, savunma toplu gelişi geç görür.

**Sunset (dengeli):** A ve B farklı tempo. A'da dar koridor oyunu, B'de alan oyunu — fast push hangisine girerse karşı taktik farklı.

## 6. Dönüm Noktaları

**Dönüm 1 — İlk temas kimin lehine:** Saldırı ilk tag'i yediyse baskı kırıldı, savunma rotate kazandı. Savunma ilk tag'i yediyse hold çöküyor, bilgi saldırıya geçti.

**Dönüm 2 — Util sırası:** Smoke → flash → giriş sırasını kur, push yaşar. Sıra bozulursa push ölür, savunma trade avantajı alır.

**Dönüm 3 — Trade partneri kopması:** Savunmada trade partneri koparsa fast push avantaj alır. Savunma iki oyuncuyu aynı açıdan çıkarırsa trade zinciri kurulur ve push durur.

**Dönüm 4 — Orta alan kontrolü:** Orta alan saldırıda ise fast push hangi siteye giderse rotate açık. Orta alan savunmada ise flank tehdidi var, giriş sayıca az kalır.

**Dönüm 5 — Savunmanın ekonomisi:** Savunma full-buy ise default hold sağlam, retake util'i hazır. Savunma silaha para yatırmak zorunda kaldıysa fast push için en iyi an.

## 7. Koç Notları

Fast push'u savunma henüz yerini oturtmamışken çalıştır — savunma ilk round'da aynı noktada durduysa ikinci round aynı hatta git, setup kurulmadan içeridesin. Fast push, savunmanın hattı alışkanlığa dönüştürdükten sonra o alışkanlığı kırmak için değerlidir. Savunma hep aynı yerde duruyorsa oku ve o hatta git.

Fast push'ta smoke atan bilir nereye atar, flash atan bilir ne zaman atar, giren bilir trade partneri omuzunun hemen arkasında, trade yapan bilir ilk düşman düştüğünde adım atar, flank kapatan bilir orta alan kapanmadan içeri girmez. Biri bu sırayı bozarsa savunmaya bedava round gider.

Default hold'da her oyuncunun açısı var ama asıl karar şu: ilk temas hangi hatta oldu, o hattaki oyuncu sinyali verdi mi, orta oyuncu o siteye kaydı mı, keskin nişancı yeniden konumlandı mı. Bu üç hareket ilk düşman düştüğünde gerçekleşmezse hold tutmamış demektir.

Smoke kapandığı anda flash gider, flash bittiği anda ilk oyuncu içeridedir ve trade partneri omuzunun hemen arkasındadır. Bu üçü aynı anda olmazsa fast push değil toplu giriş olur.

**Temel test:** "Fast push smoke'suz commit ise o push plan değil, panik. Default hold tag'siz tutulmuşsa o hold sistem değil, umut. Her ikisinin de kazancı ilk temas anında: saldırı bilgi vermeden ilerliyorsa push çalışıyor, savunma ilk tag'i aldıysa hold çalışıyor. Bu anın dışındaki her şey util israfı."