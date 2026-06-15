---
id: matchup_fast_push_vs_default_hold
type: matchup
patch: "9.x"
tags: [matchup, tempo, fast-push, default-hold, tactical]
---

# MATCHUP: Fast Push vs Default Hold

## 1. Matchup Özü

Fast push şu demek: tüm takım tek siteye yığılır, savunma rotate edemeden entry alınır. Default hold şu demek: savunma 2-1-2 ya da 2-2-1 dağılır, her hatta trade partneri olan bir oyuncu durur, saldırı ilk temasta tag yer ve rotate başlar.

Bu matchup'ta tek bir kilit an var: **ilk temas**. Saldırı bilgi vermeden ilerliyorsa push çalışıyor. Savunma ilk tag'i aldıysa hold çalışıyor. Bu anın dışındaki her şey sadece util yakmak.

## 2. Hangi Taraf Avantajlı

**Fast push avantajlı:**
- Savunma dağılımı sabit ve round başında tuzağını kurmamışsa
- Giriş koridoru tek ağızsa — savunma iki ağızlı bir hattı tek taraftan tutmaya çalışıyorsa (Split A, Bind B)
- Takımında iki flash agenti varsa — ikisi flash'ı zincirlerse savunma peek atamaz
- Savunma anchor'ı yalnız kaldıysa, trade partneri başka hatta kaymışsa
- Savunma silaha para yatırmak zorunda kalmışsa, util az

**Default hold avantajlı:**
- Saldırı smoke atmadan girdiyse — savunma iki açıdan bedava vurur
- Savunmada sentinel kuruluysa — tuzak hattına çarparsın
- Savunma orta alanı elinde tutuyorsa — flank tehdidi açılır
- Saldırının entry agenti dash'ini harcadıktan sonra yanında kimse kalmadıysa
- Savunmada aynı koridoru çaprazdan kapatan iki op varsa

## 3. Key Düellolar

**IF** Saldırı smoke atmadan fast push başlattı
**MEANING** Savunma iki açıdan rahat vurur, ilk giren iki taraftan birden yenir
**COUNTER** Girmeden önce yan hattı smoke'la kapat — tek açıyla yüzleşirsin, iki açıyla değil
**WHY** Smoke'suz fast push diye bir şey yok, sadece toplu içeri dalmak var. İkisi aynı şey değil.

---

**IF** Savunma 2-2-1 kurdu, saldırı beş kişiyle tek siteye girdi
**MEANING** Savunma o sitede sayıca az, iki anchor rotate gelmeden push'u durduramaz
**COUNTER** Savunmadaysan ilk temasta rotate sinyalini ver — orta oyuncu o siteye kaysın, op yeniden konumlansın
**WHY** Default hold sayısal savunma değil, bilgi ve rotate sistemidir. İlk tag sinyaldir; sinyali geç verirsen push tamamlanır.

---

**IF** Saldırı util sırasını yanlış kullandı — önce flash, sonra smoke
**MEANING** Flash bittiğinde savunma hazır duruyor, smoke geç geldiği için açı hâlâ açık
**COUNTER** Sıra şu: smoke → flash → giriş. Smoke açıyı öldürür, flash refleksi kırar, sonra girersin
**WHY** Sıra bozulursa her parça tek başına çalışır, hiçbiri değer üretmez.

---

**IF** Savunma anchor'ı yalnız, trade partneri orta alana kaymış
**MEANING** Fast push anchor'ı tek başına yakalar — ilk vuruştan sonra site senin
**COUNTER** Savunmadaysan orta oyuncuyu siteye çek, anchor'ı yalnız bırakma. Saldırıdaysan tam bu noktaya bas — trade partneri yoksa duelist serbest girer
**WHY** Yalnız anchor savunmanın en zayıf yeridir. Fast push tam oraya basar.

---

**IF** Savunma her round aynı default hold'u kuruyor
**MEANING** Saldırı hattını okur, savunmanın tam nerede durduğunu bilir
**COUNTER** Saldırıdaysan bunu oku — setup kurulmadan o siteye git. Savunmadaysan hold'unu değiştir, ama o round util yarım kalır
**WHY** Default hold'un okunabilirliği aynı zamanda zayıflığıdır. Her round aynıysa karşı taraf okur.

---

**IF** Fast push sırasında herkes tek hattan arka arkaya girdi
**MEANING** Savunma tek açıdan art arda vurur — birini düşürdükten sonra diğerini bekliyor
**COUNTER** İki ayrı açıdan aynı anda gir — savunma iki açıyı birden tutamaz
**WHY** Fast push'un sayısal üstünlüğü ancak çok hattan girişle işe yarar. Tek sıra savunmanın işini kolaylaştırır.

---

**IF** Savunmanın op'çusu fast push hattında değil, yan koridorda
**MEANING** Op o round hedef hatta hiç değer üretmedi
**COUNTER** Saldırıdaysan op'un olmadığı siteye git — rotate süresi push süresinden uzun
**WHY** Op bir konum silahıdır, hızlı rotate'e göre değil. Hızlı girersen o round boyunca pasif kalır.

## 4. Util ve Kaynak Dengesi

Fast push en az iki smoke ve iki flash ister. Tek smoke hattı kapatmaz, tek flash refleksi kırmaz. Savunma default hold için sentinel kurulumu ve tek yönlü smoke ister — gerisini retake'e saklar.

Saldırı util'inin tamamını girişe yatırırsa spike kurulduktan sonra çıplak kalır. O yüzden fast push'un kazancı girişte olmalı — uzayan fast push tanımı gereği ölmüştür. Savunma kazancını ilk tag'i aldığında üretir; tag yoksa hold bilgi üretmez, util boşa gider.

## 5. Haritaya Göre Değişim

**Bind (fast push avantajlı):** B koridoru tek ağız, A'ya teleportla toplu giriş yapılır. Savunma hattı tek noktaya yığılınca diğer site açık kalır.

**Haven (default hold avantajlı):** Üç site savunmanın evidir. 2-2-1 dağılımı her hattı kapatır, fast push hangi siteye giderse iki oyuncuyla karşılaşır.

**Ascent (dengeli):** Orta alan kilit. Orta alanı alan taraf ya fast push'u destekler ya da çaprazdan keser.

**Split (default hold avantajlı):** Dar koridorlar ve dikey oyun sentinel kurulumuna birebir uygundur. Fast push ancak havalandırmadan delinir.

**Lotus (fast push avantajlı):** Üç site ve döner kapılar saldırıya geniş geçiş açar. Savunma bölünür, tek siteye baskı kurarsan rotate uzar.

**Breeze (fast push avantajlı):** Uzun açılar savunmayı hatta yayar. A tünel ya da B koridordan commit push yaparsın, savunma toplu gelişi geç görür.

**Sunset (dengeli):** A ve B farklı tempo ister. A'da dar koridor oyunu, B'de alan oyunu — fast push hangisine girersen karşı taktik değişir.

## 6. Dönüm Noktaları

**Dönüm 1 — İlk temas kimin lehine:** Saldırı ilk tag'i yediyse baskı kırıldı, savunma rotate kazandı. Savunma ilk tag'i yediyse hold çöküyor, bilgi saldırıya geçti.

**Dönüm 2 — Util sırası:** Smoke → flash → giriş sırasını kurarsan push yaşar. Sıra bozulursa push ölür, savunma trade avantajını alır.

**Dönüm 3 — Trade partnerinin kopması:** Savunmada trade partneri koparsa fast push avantaj alır. Savunma iki oyuncuyu aynı açıdan çıkarırsa trade zinciri kurulur, push durur.

**Dönüm 4 — Orta alan kontrolü:** Orta alan saldırıdaysa fast push hangi siteye giderse rotate açık kalır. Orta alan savunmadaysa flank tehdidi var, giriş sayıca azalır.

**Dönüm 5 — Savunmanın ekonomisi:** Savunma full-buy ise default hold sağlam, retake util'i hazır. Savunma silaha para yatırmak zorunda kaldıysa fast push için en iyi an.

## 7. Koç Notları

Fast push'u savunma daha yerine oturmadan çalıştır — savunma ilk round'da aynı noktada durduysa ikinci round aynı hatta git, setup kurulmadan içeridesin. Fast push'un asıl değeri, savunma hattını alışkanlığa çevirdikten sonra o alışkanlığı kırmaktır. Savunma hep aynı yerde duruyorsa oku ve tam o hatta bas.

Fast push'ta smoke atan nereye atacağını bilir, flash atan ne zaman atacağını bilir, giren trade partnerinin omzunun hemen arkasında olduğunu bilir, trade yapan ilk düşman düştüğü an adımını atar, flank kapatan orta alan kapanmadan içeri girmez. Biri bu sırayı bozarsa savunmaya bedava round gider.

Default hold'da her oyuncunun bir açısı var, ama asıl karar şu: ilk temas hangi hatta oldu, o hattaki oyuncu sinyali verdi mi, orta oyuncu o siteye kaydı mı, op yeniden konumlandı mı. Bu üç hareket ilk düşman düştüğü an gerçekleşmezse hold tutmamış demektir.

Smoke kapandığı an flash gider, flash bittiği an ilk oyuncu içeridedir ve trade partneri omzunun hemen arkasındadır. Bu üçü aynı anda olmazsa fast push değil, toplu içeri dalmak olur.

**Temel test:** Smoke'suz commit eden fast push plan değil, panik. Tag'siz tutulan default hold sistem değil, umut. İkisinin de kazancı ilk temas anındadır: saldırı bilgi vermeden ilerliyorsa push çalışıyor, savunma ilk tag'i aldıysa hold çalışıyor. Bu anın dışındaki her şey util israfı.
