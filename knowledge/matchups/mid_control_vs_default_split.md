---
id: matchup_mid_control_vs_default_split
type: matchup
patch: "9.x"
tags: [matchup, mid-control, default-split, map-control, tactical]
---

# MATCHUP: Mid Control vs Default Split

## 1. Matchup Özü

Mid control saldırının round başı mid alanını ele geçirerek her iki site'a eşit rotate baskısı kuran strateji; default split savunmanın mid'i feragat edip iki site'ı yarım anchor'la kaplayarak mid'i köprü yerine tampon alan kullanan savunma. Matchup mid alanın round içi değeri üzerinde kurulu — mid control saldırıya rotate özgürlüğü verir, default split savunmaya utility saklama hakkı verir. Hangi taraf mid'in değerini doğru ölçüyorsa round ekonomisini kazanır.

## 2. Hangi Taraf Avantajlı

**Mid control lehine:**
- Map mid hatlı ve çift rotate noktası var (Ascent Mid Courier, Haven Garage, Split Mid Mail) — mid kontrolü rotate özgürlüğü
- Saldırı tarafında double initiator + controller — mid utility ile kontrol edilir
- Savunma mid'i tek oyuncu ile kaplıyor — mid duello sayısal avantajı
- Mid rotate hattı site'lara yakın — saldırı rotate süresi savunma rotate süresinden kısa
- Savunma default split utility'sini mid'e değil site'lara yatırmışsa — mid duellosu saldırı lehine

**Default split lehine:**
- Map mid hattı dar ve crossfire'lı (Split Mid, Bind yok-mid yapısı) — savunma mid'i 2 oyuncu ile kilitler
- Savunma mid'e sentinel setup kurdu (Killjoy turret + alarmbot) — trap hattı mid duellosunu kırar
- Savunma iki OP ile mid'i kaplıyor — saldırı mid'e peek attığı an iki OP shot'ı alır
- Saldırı tarafı mid kontrolü için utility yatırıyor ama trade partner kopmuş — mid duellosu trade'siz
- Saldırı tarafı mid kazandıktan sonra site'a commit push yapamıyorsa — mid kontrolü bilgi değil, statik pozisyon

## 3. Key Düellolar

**IF** Saldırı mid kontrolü için round başı smoke + flash yatırdı
**MEANING** Savunma mid oyuncusu kör + sightline'sız, saldırı mid'i kontrol eder
**COUNTER** Savunma mid oyuncusu flash'ı bekleyerek back pozisyona çekilir, mid'i vermez ama saldırı sayısal üstünlüğüne karşı agresif hold yapmaz
**WHY** Mid'in round başı değeri rotate penceresi kontrolüdür. Saldırı utility yatırımı mid rotate hattını açar — tek savunma oyuncusu 2-3 saldırı oyuncusuna karşı ayakta kalamaz, ama mid'in değerini savunma tam teslim etmeden pozisyon değiştirebilir.

---

**IF** Savunma mid'e sentinel setup kurdu (Cypher tripwire + camera)
**MEANING** Mid'e girişteki trap hattı saldırı mid kontrolünü tripwire sesiyle bilgi kaynağına dönüştürür
**COUNTER** Saldırı initiator utility'si ile trap'leri sök — Sova shock dart tripwire, KAY/O knife reveal Cypher. Trap hattı kırıldıktan sonra mid duellosu açılır
**WHY** Mid'in trap'li savunması savunma için düşük maliyet + yüksek değer. Trap'ler round 1'de bilgi verir, round 2'de saldırı trap'i sökerse utility maliyeti çıkar — ancak savunma bu sırada iki round bilgi aldı, ekonomik denge savunmada.

---

**IF** Saldırı mid kontrolünü kazandı ama site commit push yapmadı
**MEANING** Mid pozisyonu durağan, rotate baskısı kurulmuyor, savunma rotate süresi sıfırlandı
**COUNTER** Saldırı mid kontrolünü rotate baskısına çevirmeli — mid'den A commit veya B commit karar verir, lurker mid'de bilgi taşıyıcı olarak kalır
**WHY** Mid kontrolü statik değer üretmez. Mid'in değeri rotate hareketine çevrilmezse mid kontrolü sadece alan kaplama. Saldırı mid'i alıp ne yapacağını bilmiyorsa mid kontrolü savunmaya zaman kazandırır.

---

**IF** Savunma default split 2-2-1 dağılımı, mid 1 oyuncu
**MEANING** Mid solo anchor pozisyonunda, saldırı mid'e 3 oyuncu push'u ile sayısal avantaj alır
**COUNTER** Savunma mid oyuncusu back pozisyonda bilgi rolünde kalır, duello için angle çekmez. Rotate sinyali mid oyuncusundan gelir, savunma rotate'i onun bilgisiyle yapılır
**WHY** Solo mid oyuncusunun rolü duello değildir — bilgi + stall. Solo mid agresif oynarsa mid bedava kaybedilir, pasif oynarsa mid kaybedilir ama savunma rotate'i zamanında yapılır. İki farklı kayıp senaryosunun ekonomik farkı: bilgi.

---

**IF** Saldırı mid kontrolünü iki aşamalı aldı (önce smoke, sonra entry)
**MEANING** Utility sırası doğru, savunma sightline kapandıktan sonra entry rahat
**COUNTER** Savunma utility sırasını tersine çevir — mid'e saldırı smoke attığı an savunma molly mid'e, saldırı smoke dışında kalmak zorunda
**WHY** Mid duellosu utility sırası işidir. Saldırı utility sırası bozulursa matchup savunmaya döner, savunma utility sırası bozulursa matchup saldırıya döner. Sıra doğru tarafta hangi taraftaysa mid ona açılır.

---

**IF** Savunma mid'de çift OP ekonomisi kurdu
**MEANING** Saldırı mid peek'i iki OP shot'ına açık, mid duellosu saldırı için ekonomik olarak çok pahalı
**COUNTER** Saldırı mid'i by-pass eder — mid hattını terk edip A Long veya B Main üzerinden direkt site'a gider. Çift OP mid'de sabit kalır, site'ta savunma yetersiz
**WHY** Çift OP mid'de değer üretir ancak mid saldırı tarafından hedef alınırsa. Saldırı mid'i by-pass ettiği an iki OP (9,400 kredi) ölü metaldir. Çift OP mid ekonomisi saldırı uyum sağlarsa savunmanın en pahalı hatası.

---

**IF** Saldırı mid kontrolünü kazandıktan sonra savunma rotate'i okuduğu halde hedef site'a commit push geç kaldı
**MEANING** Savunma rotate tamamlandı, saldırı commit push sayısal eşitlikte yapılıyor, mid kontrolü avantajı kayboldu
**COUNTER** Saldırı commit push kararını mid kontrolü sağlanır sağlanmaz vermeli — rotate okuma bekleme savunma lehine zaman verir. Mid kontrolü bilgi aracı değil, baskı aracıdır
**WHY** Mid'in değeri zamansaldır. Mid tutulurken savunma rotate düşünür, saldırı commit düşünmelidir. İki taraf da karar alır, karar hızı matchup'ı belirler.

## 4. Utility/Kaynak Takası

Mid control saldırı tarafında round başı 3-4 utility slot yatırımı gerektirir (smoke mid'e + flash mid'e + initiator recon). Default split savunma tarafında round başı 1-2 utility slot gerektirir (sentinel mid setup + controller mid smoke). Sayısal olarak savunma utility ekonomisi üstün — saldırı mid için utility harcarken savunma utility'yi site retake için saklar. Bu denge mid kontrolü avantajının maliyetini gösterir: saldırı mid'i alırsa utility ekonomisi yarılanır, savunma mid'i koruduğu halde utility ekonomisi korunur. Bu yüzden mid control saldırı tarafında ekonomik risk, default split savunma tarafında ekonomik güvence. Ult ekonomisi mid duellosunda hangi tarafta hazırsa o tarafa açılır — Breach Rolling Thunder mid'i temizler, Killjoy Lockdown mid'e setup kilitler. Ult ekonomisi dengesiz ise matchup ult hazır tarafa döner.

## 5. Map Bazlı Değişim

**Ascent (dengeli):** Mid Courier + Mid Catwalk saldırı için, Mid Boxes savunma için. Mid Ascent'in kalbi, matchup utility sırasına bağlı.

**Haven (mid control avantajlı):** Garage saldırı rotate hattı, mid kontrolü A-C rotate baskısı verir. Savunma Haven'da mid'i dar tutamaz.

**Split (default split avantajlı):** Mid dar koridor, çift crossfire + vertical play savunma için ideal. Saldırı Split'te mid için tam utility dump ister.

**Bind (default split avantajlı):** Bind'da klasik mid yok, TP ekonomisi mid'in yerine geçer. Default split Bind'da A-B rotate TP üzerinden.

**Icebox (mid control avantajlı):** Mid Tube + Kitchen mid kontrol saldırı için geniş. Savunma mid'i vertical ile tutmaya çalışır ama ekonomik.

**Breeze (mid control avantajlı):** Mid Pillar + Mid Nest saldırı için rotate hattı. Savunma Breeze'de mid kontrolünü değil rotate süresini öncelik yapar.

**Lotus (mid control avantajlı):** Mid + üç site rotate hattı saldırı için ideal. Savunma default split Lotus'ta üç site yapısı sebebiyle dağılır.

**Sunset (dengeli):** Mid Top + Mid Courtyard saldırı için, Mid Market savunma için. Matchup utility sırasına bağlı.

## 6. Flip Moment'ler

**Flip 1 — Utility sırası doğruluğu:** Saldırı mid utility sırasını smoke → flash → entry olarak kurduysa mid kazanıldı. Sıra bozuldu ise mid duellosu savunmaya döner.

**Flip 2 — Savunma mid agent sayısı:** Mid'de 2 savunma oyuncusu ise saldırı mid'i çok pahalıya alır. Mid'de 1 savunma oyuncusu ise saldırı sayısal avantajlı.

**Flip 3 — Trap hattı durumu:** Mid'de sentinel setup kuruldu ise mid duellosu trap avantajlı. Setup kurulmadıysa mid duello düz silah + utility.

**Flip 4 — Commit push karar hızı:** Saldırı mid kontrolünden sonra hemen commit ettiyse round kazanma yolu açık. Commit gecikti ise savunma rotate'i tamamlandı, mid avantajı silindi.

**Flip 5 — OP ekonomisi mid'de:** Çift OP mid'de var ise savunma mid statik. Tek OP mid'de ise savunma mid duellosu için flex.

## 7. Pro Coach Notları + Sentinels Coach Test

Pro sahnede mid kontrolü pro takımların round başı öncelikleri listesinde birinci sırada. Sentinels ve Fnatic mid kontrolü için her round smoke + utility yatırımı yapıyor, mid'i kazanan takım round'un %60+'ını kazanıyor pro istatistiklerine göre. Türk sahnesinde BBL mid kontrolünü Ascent ve Haven'da baskın şekilde kullanıyor, Split ve Bind'da default split tercih ediyor. Pro koçluk açısı: mid kontrolü round hedefi değil, round aracı. Mid kontrolü kazanıldığında sonraki adım rotate baskısıdır, mid'de durmak değil. Default split koçluğu: mid'i terk etmek mid'i kaybetmek değil — mid'i feragat etmek tampon alan yaratmaktır, savunma mid için değil site için savaşır.

Pro seviye karar ağacı: round 1-3'te mid kontrolü için yatırım yapılır, round 4+'da mid duruş pattern'i okunur ve pattern'e göre karar verilir. Mid kontrolü pattern'ine uyum sağlamayan takım meta olarak geride kalır.

**Meta tier durumu:** Patch 9.x mid kontrolü meta'sı yükselişte, özellikle Ascent, Haven, Lotus map'lerinde. Default split Split ve Bind'da dominant. Rank seviyesinde Platinum altı oyuncular mid'i anlamlı olarak kullanmıyor, Diamond+ seviyesinde mid karar'ı round başı belirleyici.

**Sentinels Coach Test:** "Mid kontrolü round'un yarım pusulasıdır. Saldırı mid'i aldığı an rotate okuma saldırı tarafına geçer, savunma rotate'e tepki verir. Default split ise savunmanın pusulayı terk ettiği kararıdır — mid feragat edilir ama utility ekonomisi korunur. İki taraf da farklı bir tempo seçer, hangi tempo round'un ritmini belirlerse matchup'ı kazanır."
