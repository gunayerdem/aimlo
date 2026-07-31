---
id: matchup_tejo_vs_killjoy
type: matchup
agent_a: tejo
agent_b: killjoy
patch: "13.00"
verified: 2026-07-31
tags: [matchup, tejo, killjoy, initiator, sentinel]
coverage_note: "B95 (2026-07-31) — Tejo oyuncu tarafında SIFIR matchup dosyasına sahipti; Killjoy meta sentinel olarak öncelikli eşleşme."
---

# MATCHUP: Tejo vs Killjoy

## Matchup Özü
Killjoy sabit cihaz zinciri kurar: taret görür, bot yapışır, molly alanı doldurur. Tejo bu zincire karşı oyunun en doğrudan cevabına sahip: drone kurulumu görür, sersemletme köşeyi açar, füze barajı cihazların ve anchor'ın durduğu sabit noktaya basar. Sıra doğruysa site utility ile açılır; sırasız girersen zincir seni öğütür.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Killjoy var
**MEANING** Taret + bot seni girişte karşıladı — söküm yapmadan zincirin içine yürüdün
**COUNTER** Önce drone'la cihazların yerini gör, sonra füzeyi cihaz kümesine bas; giriş bu ikisinden sonra gelsin. Taret sesi hâlâ dönüyorsa sıra tamamlanmamıştır
**WHY** Zincirin gücü sırayla vurmasında — halkalar tek tek söküldüğünde geriye köşede bekleyen bir tüfek kalır

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Killjoy molly'yi ve botu tekrar ettiğin giriş hattına hazırlıyor — sen köşeye varmadan alan doluyor
**COUNTER** Giriş kolunu her round değiştir; drone rotasını da değiştir, aynı hattan gönderilen drone her round aynı yerde vurulur
**WHY** Killjoy sabit kuruluma bağlıdır; giriş açısı değişince zinciri taşımak round'unu yer, sen o boşlukta girersin

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Zinciri solo sökmeye çalıştın — bir halkayı geçtin, sonrakinde yalnız yakalandın
**COUNTER** Sersemletmeyi köşeye sektir ve takım sersemletme oturduğu saniyede girsin; drone'unu takım hazır değilken harcama
**WHY** Killjoy kurulumu solo girişleri yemek için tasarlanmıştır — util + trade zinciri o tasarımı ters çevirir

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Yönlendirilen patlama hattın elinde bekledi; oysa sabit cihaz kümesine karşı en net cevabın oydu
**COUNTER** Ult'u kurulu site girişinin hemen önüne bas: hattı cihaz kümesinden ve anchor'ın durduğu noktadan geçir, o alan boşalırken takım girsin
**WHY** Killjoy'un cihazları sabittir ve taşınması zaman ister; alan hasarı hem cihazları hem anchor'ı aynı anda yerinden söker

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla cihaz zincirinin içine yürüdün — taret hasarı silah farkının üstüne bindi
**COUNTER** Eko'da söküm yapma: taretin görüş hattına girme, drone'u yalnız bilgi için kullan, düelloyu taretin görmediği dar köşede ara
**WHY** Taret hem hasar hem haber verir; hattına girmeyen oyuncu ikisini de ödemez ve silahını sonraki round'a taşır

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant'te site içinde yığıldın — Killjoy ult'unu tam bu duruma saklıyor
**COUNTER** Plant biter bitmez yayıl; ult sesini duyduğun an alandan çık ve cihaza baskı yap. Drone'unu retake yönünü öğrenmek için, sersemletmeni defuse'u kesmek için sakla
**WHY** Ult tek kümede bekleyen takımı topluca yakalar; yayılan takım cihazı vurup round'u bitirir

## Koç Notları
Kitin sırayla zincirlenir: drone → sersemletme → füze. Killjoy'a karşı bu sıra bir avantaj değil, zorunluluk — taret ayaktayken atılan sersemletme boşa gider. Drone'unu erken harcama, cihazların yerini öğrenmek için girişten hemen önce gönder. Killjoy'u kurulumundan menzille de ayırabilirsin: bir site'a sahte baskı verip rotate ettirirsen uzakta kalan cihazları devre dışı kalır, sen boşalan tarafa füzeyle açarsın.
