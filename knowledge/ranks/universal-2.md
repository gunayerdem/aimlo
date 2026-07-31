---
id: ranks_universal_2
type: rank
tags: [rank, universal, coaching, profile2]
patch: "13.00"
verified: 2026-07-31
split_from: ranks/universal.md
split_reason: "B37 (2026-07-31) — universal.md 45.000B tavanının %99,1'indeydi (44.590B, kalan pay 410B). Büyüme yolu açmak için ÇAPASIZ H2 bölümleri buraya taşındı. Buradaki hiçbir başlık lib/death-type.ts DEATH_TYPE_GUIDE kbBlock çapası DEĞİL — çapalı bölümlerin tamamı universal.md'de KALDI (scripts/verify-kb.ts [6] orayı okur). Bu dosya da istekten BAĞIMSIZ ve bayt-aynı: universal.md ile aynı prompt-cache kararlılık sınıfında, blocks.profile2 olarak yüklenmeli."
---

# Evrensel Koçluk Profili — Bölüm 2 (çapasız bloklar)

> Bu dosya `ranks/universal.md`'nin devamıdır. İçerik TEK BAYT değişmedi, yalnız yeri değişti.
> Ölüm-tipi çapaları (Aim, Pozisyon, Zamanlama, Okunabilirlik, Karar-Ekonomi, Avantaj, Seri,
> Uzatma, Takım Koordinasyonu, Erken Round, Post-Plant, Retake, Lurk) universal.md'de kalır;
> buraya yalnız hiçbir death-type'ın çapası OLMAYAN bölümler taşınır.

## Dersi Kanıta Bağla

"Aynı açıyı tekrarlıyorsun" cümlesi ancak elinde "R6 ve R9'da da A Short'ta öldün" varken kurulur. Kanıt varsa dersin İÇİNE göm; yoksa iddiayı hiç kurma.

**Kanıt sayılan TEK kaynak:** `Son round geçmişi` / `Recent round history` satırları (`R7: öldü @ A Short` — round no + öldü/hayatta kaldı + yer; başka hiçbir şey yok) · `Position pattern` · `Death zone pattern` · `[PATTERN]` · `[ROUND CONTEXT]` (yalnız BU round: katil ajan + silah, ölüm yeri, side, skor, sayı, ekonomi, loadout, spike, ult).

**Kalıp — kanıtı ayrı cümle yapma, dersin içine göm:** "R6 ve R9'da da A Short'ta öldün, bu üçüncüsü — Cypher artık o açıya nişanını almış bekliyor; bir round orayı boş bırak."

**Kanıt DEĞİL — yazarsan uydurmadır:**
- Geçmiş round'un katili/silahı/ekonomisi/sayısı/kazanç-kaybı: geçmiş satırlarında YOK. "Son 3 round'da Operator'a öldün" YAZMA — silah yalnız BU round için gelir.
- Listede olmayan round numarası; "hep", "her seferinde", "%60" gibi uydurma sıklık — yalnız sayılabilen kezi yaz (2 kez, 3 kez). Tek ölüm pattern değildir; iki FARKLI yerde ölmek "aynı hatayı tekrarlıyorsun" değildir.
- Kanıt yoksa geçmişi hiç açma, hedge cümlesi de kurma: dersi bu round'un callout + katil ajan + silah + side'ına çapala. Tek round'un kanıtı da kanıttır.

## Düşmanı Okuma ve Karşı Hamle

Bu blokları düşmanın tekrar eden bir alışkanlığını gördüğünde kullan — savunmadan saldırıya geçiş için.

- **Örnek**: Ascent'te bir düşman üç round üst üste B Main'den takım sesi beklemeden tek peek attı — dördüncü round ayak sesini duyar duymaz oraya flash at, kör peek'i karşıla.

### Tekrar eden peek'i önceden tut

- **IF** bir düşman üst üste birkaç round aynı noktadan, takımının sesini beklemeden peek atıyorsa
- **MEANING** kör peek onun alışkanlığı; sen zamanını biliyorsan o açı artık senin
- **COUNTER** bir sonraki round o açıyı önceden hazırla; o noktadan ayak sesi gelir gelmez, peek başlamadan oraya flash at; patlayınca açıyı tutan takım arkadaşın temizlesin
- **WHY** alışkanlığı yakalayınca zamanlama avantajı sana geçer, peek'e başlamadan kör kalır

### Tekrar eden util'i kendi zamanına karşı çevir

- **IF** düşman her tam ekonomi round'unda spike kurulur kurulmaz aynı yere smoke atıyorsa
- **MEANING** aynı smoke aynı anda geliyorsa o smoke artık bir saat: nereye ve ne zaman bakacağını sana söylüyor
- **COUNTER** o smoke'un her zaman geldiği anı bekle; smoke yere inip seni körleştirmeden önce, düşmanın atış animasyonunu gördüğün AN o smoke'un ardındaki açıya bas
- **WHY** düşmanın tekrarını okursan onu kendi zamanlamasına karşı çevirir, hazır olmadan yakalarsın

### Düşman ajanını oku

- **IF** aynı düşman ajanına karşı tekrar tekrar ölüyorsan
- **MEANING** o ajanın ne yaptığını okumuyorsun — hangi util'i nereye attığını, hangi açıyı tuttuğunu bilmiyorsun
- **COUNTER** önce o ajanın sana ne yaptığını net belirle, tek karşı hamleyi tetiğe bağla: recon'u havaya kalktığı AN açıyı boş bırak; smoke attığı geçişi smoke inince başka yoldan al
- **WHY** tehdidi okumak karşı oynamanın önkoşuludur; ne yaptığını bilmeden açıyı tutmak her round aynı ölümü tekrarlar
