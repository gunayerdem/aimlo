---
id: matchup_brimstone_vs_killjoy
type: matchup
agent_a: brimstone
agent_b: killjoy
patch: "13.00"
verified: 2026-07-31
tags: [matchup, brimstone, killjoy, controller, sentinel]
coverage_note: "B95 (2026-07-31) — Brimstone oyuncu tarafında SIFIR matchup dosyasına sahipti (yalnız rol-fallback yükleniyordu)."
---

# MATCHUP: Brimstone vs Killjoy

## Matchup Özü
Killjoy görüşe ve alana dayalı bir zincir kurar: taret görür, bot yapışır, molly alanı doldurur. Brimstone'un smoke'ları o görüşü keser, molly'si cihazı kırar, ult'u ise sabit kurulumun tam üstüne iner. Bu eşleşmenin sorusu kaynak sayımı: Killjoy'un cihazları round başına sabit, senin smoke'ların da sınırlı. Kim önce diğerinin kaynağını boşa harcatırsa site o tarafın olur.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Killjoy var
**MEANING** Smoke'lar inmeden ilk teması sen aldın — taret seni gördü ve takımına haber verdi
**COUNTER** İlk temas util'in işi: taretin görüş hattını smoke'la kes, molly'yi cihaz kümesine at, giriş bu ikisinden sonra gelsin. Smoke inmeden geniş açıya çıkma
**WHY** Taret hem hasar hem bilgi verir; görüşü kesilen taret ikisini de veremez ve zincirin ilk halkası kırılır

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Smoke'larını hep aynı yere koyuyorsun — Killjoy botu ve molly'yi smoke'un çıkışına hazırlıyor
**COUNTER** Smoke düzenini her round kaydır; aynı hattı iki round üst üste kapatma. Girişi de smoke'un beklenmedik tarafından yap
**WHY** Sabit smoke düzeni savunmaya bedava bilgi verir: nereden çıkacağını bilen Killjoy util'ini tam oraya saklar

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Smoke'u attın ama takımdan önce sen geçtin — zincire tek başına girdin ve karşılık gelmedi
**COUNTER** Smoke'u sen at, girişi takım açsın; sen ikinci sırada, trade mesafesinde gir. Ateş hızı desteğini girişin hemen önüne bırak
**WHY** Controller'ın işi alanı açmak, alanı ilk kullanan olmak değil — açtığın alana takımla girersen zincir sırayla değil topluca sökülür

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Sabit kuruluma inen ult'un elinde bekledi — Killjoy'un cihazlarının ve anchor'ın durduğu noktaya basmadın
**COUNTER** Ult'u cihaz kümesinin ve anchor'ın sabit durduğu alana bas; post-plant'te de defuse noktasına sakla. Çember inerken takım girişi hazırlasın
**WHY** Killjoy'un tüm değeri sabit kalmasında; alandan çıkmak zorunda kalan Killjoy kurulumunu da terk eder

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla cihaz zincirinin içine yürüdün — taret hasarı silah farkının üstüne bindi
**COUNTER** Eko'da smoke'unu giriş için değil kaçış ve görüş kesme için kullan; taretin hattına girme, düelloyu taretin görmediği dar köşede ara ya da temas etmeden çekil
**WHY** Smoke ekonomiden bağımsızdır: eko round'unda bile takıma güvenli geçiş üretir, ama tek başına düello kazandırmaz

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant'te site içinde yığıldın — Killjoy ult'unu tam bu duruma saklıyor
**COUNTER** Plant biter bitmez yayıl; ult sesini duyduğun an alandan çık ve cihaza baskı yap. Molly'ni ilk defuse sesinde değil, defuse ikinci kez başladığında bırak
**WHY** Ult tek kümede bekleyen takımı topluca yakalar; molly'nin doğru zamanlanması ise defuse penceresini tek başına kapatır

## Koç Notları
Smoke'un söndüğü an tempo düşmana geçer — üçünü birden yakarsan yeniden kapatacak dumanın kalmaz, o yüzden sırayı planla: hangi hattı hangi saniyede kapatacağını girişten önce söyle. Molly tek şarj: onu Killjoy'un cihazına mı yoksa post-plant'e mi ayıracağına round başında karar ver. Ateş hızı desteği yerdeki cihazdan yayılır, yani sabit — girişin geçeceği hatta bırak, takım oradan geçerken destekli olsun. Killjoy'u kurulumundan menzille ayırmak da bir plan: sahte baskı verip rotate ettirirsen uzakta kalan cihazları devre dışı kalır.
