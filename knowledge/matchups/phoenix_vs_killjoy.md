---
id: matchup_phoenix_vs_killjoy
type: matchup
agent_a: phoenix
agent_b: killjoy
patch: "13.00"
verified: 2026-07-19
tags: [matchup, phoenix, killjoy, duelist, sentinel]
---

# MATCHUP: Phoenix vs Killjoy

## Matchup Özü
Killjoy sabit cihaz zinciri kurar: taret görür, bot yapışır, molly alanı doldurur. Phoenix'in kiti bu zinciri parça parça söker — alev duvarı taretin görüşünü keser, molly'si cihazı kırar, kıvrılan flaşı köşedeki Killjoy'u kapatır. Sıra doğruysa site açılır; sırasız girersen zincir seni öğütür.

## Sinyal-Kapılı Dersler

**IF** saldırıda round açılışında öldün (side=Saldırı, deathTiming=erken) ve düşman kompunda Killjoy var
**MEANING** Taret + bot seni girişte karşıladı — söküm yapmadan zincirin içine yürüdün
**COUNTER** Alev duvarını taretin görüş hattına çek (duvar arkasını taret göremez), molly'yi cihaza at — kırılır; giriş bu ikisinden sonra gelir
**WHY** Zincirin gücü sırayla vurmasında — halkalar tek tek söküldüğünde geriye sadece köşede bekleyen bir tüfek kalır

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Cihaz zincirinin arkasındaki tüfek çaprazına solo girdin — düştüğünde karşılık alacak kimse yoktu
**COUNTER** Flaşı köşeye kıvır ve takım arkanda girsin; zincire tek tek giren tek tek düşer
**WHY** Killjoy kurulumu solo girişleri yemek için tasarlanmıştır — flaş + trade zinciri o tasarımı ters çevirir

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Killjoy molly lineup'ını ve cihazlarını tekrar ettiğin girişe taşıdı
**COUNTER** Giriş açını her round değiştir; alev duvarını da hep aynı hizaya çekme — o da okunur
**WHY** Killjoy sabit kuruluma bağlıdır ama sen sabit girişe bağlı kalırsan avantaj ona geçer — değişen giriş, kurulumu her round taşınmaya zorlar

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Geri doğuş hakkın elinde bekledi — kurulumun içine risksiz bakma şansını hiç kullanmadın
**COUNTER** Ult'la kurulumun içine gir: düşersen geri doğarsın, taret-bot-molly konumları takıma bedava çıkar
**WHY** Killjoy'un gücü kurulumunun bilinmemesinde — ult'lu Phoenix o bilgiyi canı yanmadan söker; yalnız geri doğuş noktan bellidir, dönüş anında açık durma

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Tabancayla cihaz zincirinin içine yürüdün — taret hasarı silah farkının üstüne bindi
**COUNTER** Eko round'unda söküm yapma: taretin görüş hattına girme, molly'ni cihaza değil kendi kaçış hattına sakla, düelloyu taretin görmediği dar köşede ara
**WHY** Taret hem hasar hem haber verir; hattına girmeyen oyuncu ikisini de ödemez ve silahını sonraki round'a taşır

**IF** spike kuruluyken saldırıdaydın ve öldün (spikePlanted, side=Saldırı)
**MEANING** Post-plant'te site içinde yığıldın — Killjoy ult'unu tam bu duruma saklıyor
**COUNTER** Plant biter bitmez yayıl ve açını al; ult sesini duyduğun an alandan çık. Alev duvarını defuse hattına sakla, molly'yi defuse ikinci kez başladığında bırak
**WHY** Ult tek kümede bekleyen takımı topluca yakalar; yayılan ve alandan çıkan takım cihazı vurup round'u bitirir

**IF** öldün ve killerInfo'daki silah kısa menzilli sınıfsa (Judge, Bucky, Spectre, Stinger)
**MEANING** Killjoy cihazlarının arkasındaki dar açıda seni yakın mesafeye çekti — mesafeyi o seçti
**COUNTER** Kör köşeye girme; alev duvarını görüş hattına çek, kıvrılan flaşı köşeye at ve o köşeyi flaş patlarken al. Yakın mesafeye ancak taret sustuktan sonra gir
**WHY** Kısa menzilli silah dar açıda tavan değer üretir; körlenmiş savunucu o mesafeyi kullanamaz

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Kit boşken kurulu siteye ikinci hamleyi aldın — molly'nin toparlama penceresini de kullanmamışsın
**COUNTER** Sayı azken dövüşü uzatma: molly'yi kapak arkasında toparlanmak için kullan, sonra tek açı izole et. Kit tamamen boşsa hamle alma, süreyi oynat
**WHY** Uzayan düelloda toparlanabilen taraf avantajlı; ama toparlanma penceresi ancak kapak arkasında çalışır, açıkta yanmak yalnızca can eritir

## Koç Notları
Killjoy'a karşı acele giriş yok, söküm sırası var: duvar (görüş), molly (cihaz), flaş (köşe), giriş. Sıra tamamsa Killjoy eli boş kalır; taret sesi hâlâ dönüyorsa sıra tamamlanmamış demektir. Spike kurulduysa Killjoy ult'unu retake'e sakladığını unutma — plant sonrası site içinde yığılma, ult sesinde alandan çık.
