---
id: matchup_chamber_vs_fade
type: matchup
patch: "13.00"
verified: 2026-07-08
tags: [matchup, chamber, fade]
---

# MATCHUP: Chamber vs Fade

## Matchup Özü
Chamber op'la uzun açı tutar, tabancasıyla kısa mesafede de sert vurur. Fade tam onu sökmek için var — recon açını yakar, bot seni açıdan kovar, sabitleme küresi TP indiğin noktayı avlar. Soru basit: Fade taradıktan sonra takımı yeterince hızlı geliyor mu, yoksa sen TP'yi erken çekip bilgiyi çöpe mi atıyorsun?

## Ucuza Ölüm Kalıpları

**IF**: Fade recon attı, op açın yandı, bot üstüne geliyor
**MEANING**: Tarandın. İki kötü seçeneğin var — yerinde kalırsan bota yakalanırsın, hemen TP atarsan tuttuğun bölgeyi boşaltırsın ve Fade takımı site'ı bedavaya alır.
**COUNTER**:
- Botu tabancayla kafadan vur
- Bot düşer düşmez Fade'e hızlı peek at
- Önce peek, TP sonra
**WHY**: Bot düştükten sonra ilk peek'i ucuza öldürürsen hem sayı hem pozisyon kazanırsın. Anında TP atarsan bedava bilgi vermiş olursun.

**IF**: Fade her tarama sonrası sen anında TP ediyorsun
**MEANING**: Bilgisi bayatladı. Takımı eski açına giriyor, sen yeni açıdayken yavaş gireni ult'la topluyorsun.
**COUNTER**:
- TP anchor'ını her round farklı yere kur
- TP indikten sonra farklı köşeden bekle
- İniş noktanı tahmin ettirme
**WHY**: Fade takımı senin nereye TP attığını ezberlerse sabitleme tam oraya düşer. Her round farklı noktaya in.

**IF**: Fade ult bastı, sabitleme küresi de TP iniş noktanda
**MEANING**: Kaçış planın okundu. Sağırsın, canın eriyor, iniş noktan avlanıyor — takım o dar pencereyi kullanıyor.
**COUNTER**:
- Anchor'ını her round farklı yere kur — sabitleme ezbere atılır
- Tuzağını TP indiğin koridorun başına bırak
- Ult dalgasının hattından çıkıp peek at, içinde durma
**WHY**: Chamber'ın tek kaçışı TP. İniş noktası ezberlendiyse sabitleme tam oraya düşer — anchor yerini tahmin ettirme.

## Tekrarlayan Başarısızlık Ne Anlama Gelir
**Chamber sürekli ölüyorsa**: TP'yi geç çekiyorsun ya da hep aynı yere atıyorsun. Recon vurdu mu — ya tabancayla peek al sonra TP, ya direkt TP çek. Açıda donup kalma.

**Fade tarıyor ama Chamber kaçıyorsa**: Takımın recon'dan sonra bekliyor. Tarama anı = giriş anı. Recon yere değdi mi Chamber çoktan yeni açıya geçti.

## AIMLO Ne Demeli
### Kaybeden taraftayken
**Chamber aynı pozisyonda üst üste ölüyorsa (repeatedPosition)**: "Üçüncü kez aynı açıda düştün — Fade'in taraması o köşeyi ezberledi. Recon vurdu mu ya tabancayla peek'i al sonra TP, ya direkt TP çek. Açıda donup kalma, takım seni önceden çapraz tutuyor."

**Fade ölüyor ve trade gelmiyorsa (tradedByAlly=false)**: "Tarıyorsun ama takımın arkanda değil. Recon yere değdiği an birlikte girin — tek başına taramanın peşinden gidersen Chamber çoktan başka açıya kaymış olur."

### Kazanan taraftayken
**Fade, Chamber'ı aynı açıda buluyorsa (repeatedPosition, düşman kompunda Chamber)**: "Chamber o köşeyi bırakmıyor — taraman onu her round oradan söküyor. Sabitlemeyi durduğu açıya değil, TP'nin ineceği noktaya at."

**Chamber, Fade'in taramasından kurtuluyorsa**: "TP'n taramayı çöpe atıyor. İniş noktanı her round değiştir — iki round üst üste aynı noktaya inersen sabitleme tam üstüne düşer."

## Koç Notları
Okuma-karşı-okuma: Fade, Chamber'ın TP iniş noktasını ezberleyip sabitlemeyi oraya atar; Chamber iniş noktasını her round değiştirip bu ezberi bozar. Kim rakibin alışkanlığını daha erken okursa açıyı o kazanır.
