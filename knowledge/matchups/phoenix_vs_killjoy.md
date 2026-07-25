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

## Koç Notları
Killjoy'a karşı acele giriş yok, söküm sırası var: duvar (görüş), molly (cihaz), flaş (köşe), giriş. Sıra tamamsa Killjoy eli boş kalır; taret sesi hâlâ dönüyorsa sıra tamamlanmamış demektir. Spike kurulduysa Killjoy ult'unu retake'e sakladığını unutma — plant sonrası site içinde yığılma, ult sesinde alandan çık.
