---
id: matchup_veto_vs_neon
type: matchup
agent_a: veto
agent_b: neon
patch: "13.00"
verified: 2026-07-19
tags: [matchup, veto, neon, sentinel, duelist]
---

# MATCHUP: Veto vs Neon

## Matchup Özü
Neon dar boğazdan hızla akar ve girişini sektirdiği stunla açar. Veto'nun önleyici cihazı seken util'i havada imha eder — Neon'un stunu tam bu sınıfta. Stunu yok edilen Neon körlemesine sprint etmek zorunda kalır; bağlama alanı da sprint hattının tek çizgiye indiği boğazda onu yakalar. Hıza karşı Veto'nun cevabı hızlanmak değil, hızın geçeceği çizgiyi kilitlemek.

## Sinyal-Kapılı Dersler

**IF** savunmada round açılışında öldün (side=Savunma, deathTiming=erken) ve düşman kompunda Neon var
**MEANING** Stun + sprint kombosu seni açında yakaladı — önleyici stun hattında değildi
**COUNTER** Önleyiciyi stunun sektiği giriş hattına kur; stun havada imha olunca peek'i sen kazanırsın
**WHY** Stunu olmayan Neon hızını silaha çeviremez — açına ancak açık ve savunmasız girer

**IF** aynı pozisyonda üst üste öldün (repeatedPosition)
**MEANING** Neon sabit açını ezberledi, her round aynı sprint rotasıyla üstüne geliyor
**COUNTER** Açını ve alan kurulumunu her round değiştir; Neon'un rotası sabitse bağlama alanını tam o çizgiye taşı
**WHY** Sprint rotası da bir alışkanlıktır — alışkanlığı okuyan taraf tuzağı doğru yere koyar

**IF** öldün ve takım arkadaşın trade'ini alamadı (tradedByAlly=false)
**MEANING** Boğazı solo tuttun — alan Neon'u yavaşlatıp sağırlaştırdı ama bitiren olmadı
**COUNTER** Alan tetiklendiğinde takımla birlikte vur: sen bir açıdan, takım arkadaşın diğerinden
**WHY** Bağlama alanı düelloyu kazanmaz, kazanılır hale getirir — o pencereyi kullanan biri yoksa Neon sıyrılır

**IF** öldüğünde ult'un doluydu (ultReady)
**MEANING** Sersemletmeye bağışıklık veren pencereyi Neon'a karşı hiç açmadın
**COUNTER** Neon'un bastığını duyduğun an ult'u aç: stunu sana işlemez, düelloyu o pencerede al
**WHY** Neon'un düello planı stun üstüne kurulu — plan çöktüğünde elinde sadece ayak hızı kalır

**IF** zayıf ekonomide öldün (economyType=eco ya da force_buy)
**MEANING** Neon eko round'unda en tehlikeli rakip: hız yakın mesafeyi bedava kapatır, sen tabancayla açık alanda kaldın
**COUNTER** Kurulumu boğaza kur ve boğazın arkasında dur; açık alana çıkma. Bağlama alanı tetiklendiği an takımla birlikte bas, tek başına düello alma
**WHY** Yavaşlayıp sağırlaşan Neon hızını kaybeder — ekonomi farkını kapatan şey silah değil, onu yerinde tutan kurulumdur

**IF** spike kuruluyken savunmadaydın ve öldün (spikePlanted, side=Savunma)
**MEANING** Retake'e girerken Neon'un sprintle açı değiştirdiğini hesaba katmadın — post-plant'te sabit açıya nişan aldın
**COUNTER** Retake'ten önce bağlama alanını spike bölgesine giden dar hatta kur; ışınlanma noktanı ikinci giriş yönü olarak sakla, defuse'u takım arkadaşın çözerken sen açıyı tut
**WHY** Bağlama alanı defuse penceresini senin lehine uzatır — yerinde bağlanan savunucu ne rotate eder ne de defuse'u keser

**IF** öldün ve killerInfo'daki silah kısa menzilli sınıfsa (Spectre, Judge, Bucky, Stinger)
**MEANING** Neon yakın mesafeye girdi ve orada hız avantajı en yüksek — sen mesafeyi seçmedin, o seçti
**COUNTER** Köşe dibine yapışma; boğazın çıkışını bir adım açıktan geniş açıyla tut. Önleyiciyi sektirdiği sersemletme hattına kur, kombosu kırılınca mesafe yine senin olur
**WHY** Kısa menzilli silah ancak yaklaşabilirse çalışır; sersemletmesi imha edilen Neon açık koridorda mesafe kapatmak zorunda kalır

**IF** round'un geç anında öldün (deathTiming=geç) ve sayı aleyhine dönmüştü
**MEANING** Neon geç round'da ult'unu panikle açar ve kaosa oynar — sen o kaosun içine yürüdün
**COUNTER** Sayı azken alanı daralt: dar geçide çekil, ult'unu düşman util'ini üstüne çektikten sonra aç, düelloyu tek açıdan sırayla al
**WHY** Hız ancak seçenek varken avantajdır — tek dar hatta indirgenen Neon, hızını kullanamadan düello vermek zorunda kalır

## Koç Notları
Bağlama alanını koridorun genişlediği yere değil dar boğaza kur: sprint hattı orada tek çizgi, kaçış yanı yok. Neon slide'ını hep aynı köşede bitiriyorsa bir sonraki round alanı tam çıkış noktasına taşı — hız okunan çizgide avantaj olmaktan çıkar.
