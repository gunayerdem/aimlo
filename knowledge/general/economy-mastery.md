---
id: general_economy-mastery
type: general
patch: "13.00"
verified: 2026-07-08
tags: [general, economy, mastery]
---

# Ekonomi Ustalığı

---

## Kredi Sistemi — Bilmen Gerekenler

### Round Sonucu

| Sonuç | Kredi |
|---|---|
| Round kazandın | 3,000 |
| Round kaybettin | 1,900 + kayıp bonusu |
| Spike dikildi (kaybetsen bile) | +300 saldıran takımın herkesine |

### Kill Kredisi

Her kill 200 kredi — silahtan bağımsız, bıçakla öldürsen bile aynı 200. Kill sayısını aklında tut — düşmanın ekonomisini buradan okursun.

### Kayıp Bonusu

| Üst üste kayıp | Bonus | Toplam |
|---|---|---|
| 1. kayıp | +0 | 1,900 |
| 2. kayıp | +500 | 2,400 |
| 3.+ kayıp | +1,000 | 2,900 |

Round kazandığın an sıfırlanır. Kazandıktan sonra kaybedersen yine 1,900'dan başlarsın. 3 round üst üste kaybettiysen herkesin elinde 2,900 var, force atabilirsin.

### Round Başı Kredi

- Pistol: 800
- Pistol kazandıysan 2. round: ~3,800 (pistol'de harcamadıysan)
- Pistol kaybettiysen 2. round: ~2,700
- Devre arası: herkes 800'e döner, birikim taşınmaz (overtime kuralı aşağıda kendi bölümünde)

---

## Ne Zaman Ne Alırsın

### Full Buy

TAKIM ORTALAMASI: 4,000+
NE ANLAMA GELİR: herkes Vandal/Phantom + Heavy Shield + util alabiliyor.
NE YAPARSIN: tam al. Tüfek 2,900 + Heavy 1,000 = 3,900 minimum, util'i ondan sonra düşün.
NEDEN: ateş gücün düşmanla eşit ya da üstte — round'u nişanınla kazanırsın.

### Force Buy

TAKIM ORTALAMASI: 2,200-3,500 arası
NE ANLAMA GELİR: full alamıyorsun ama save de şart değil.
NE YAPARSIN: kayıp serine bak. 2. kayıptaysan force at, 3. kayıptaysan force daha da kârlı — kaybetsen bile 2,900 geliyor. 1. kayıptaysan save daha mantıklı.
NEDEN: kayıp bonusu yüksekken force etmenin riski düşer — kaybetsen bile gelecek round full alırsın.

### Eco / Save

TAKIM ORTALAMASI: 2,000 altı VE kaybediyorsun
NE ANLAMA GELİR: bu round'u zaten zor kazanırsın, gelecek round'u garantile.
NE YAPARSIN: Ghost (500) ya da Sheriff (800) al, util ALMA, kalanı sakla.
NEDEN: save'in işi bu round'u kazanmak değil, sonraki round'da herkesin elinde tüfek olmasını sağlamak.

### Anti-Eco

DURUM: düşman eco'da, sen full'sün.
NE ANLAMA GELİR: yakına gelip kafana sıkmaya çalışacaklar.
NE YAPARSIN: tüfeğini koru, uzak hattı tut — SMG mesafesine inme, dar köşe dibinde bekleme. Op ALMA — yakına gelince işe yaramaz.
NEDEN: eco takımı agresif gelir, Sheriff one-tap'leri uçuşur — mesafe seni korur.

### Tam Alımdayken Eco Silahına Ölmek

DURUM: sen tam alımdasın ve seni tabanca, SMG ya da pompalı öldürdü (killerInfo ucuz silah).
NE ANLAMA GELİR: kredi avantajını mesafe seçimiyle çöpe attın — eco silahı yakın mesafede tüfekle eşitlenir, uzakta erir.
NE YAPARSIN: eco'ya karşı düelloyu uzun hatta al; köşe dibine, dar geçide, yakın açıya girme — düşmanı sana açık alandan gelmek zorunda bırak.
NEDEN: ölünce sadece round değil silahın da gider — 2,900'lük tüfek eco takıma bedava geçer, ekonomi farkın bir round'da kapanır.

---

## Buy Karar Akışı

```
Round bittiğinde takımın ortalamasına bak:

4,500+ → FULL BUY (tüfek + heavy + util)
3,900-4,499 → FULL BUY (1-2 util kes)
3,000-3,899 → FORCE mu SAVE mi?
  ├─ 2.+ kayıptaysan → force at
  ├─ 1. kayıptaysan → save, sonraki round full
  └─ Devrenin son round'u → force at (devre arasında krediler sıfırlanır, taşıdığın her kuruş yanar)
2,000-2,999 → ECO
  ├─ Kayıp bonusu maksimumda → force düşün
  └─ Değilse → save
2,000 altı → FULL SAVE, Classic'le oyna
```

---

## Düşmanın Ekonomisini Oku

Düşmanın kredisini doğrudan göremezsin ama hesaplarsın:

1. **Kill say**: her kill 200. Geçen round 3 kişi öldüren 600 ekstra topladı.
2. **Round sonucu**: kazandılarsa 3,000, kaybettilerse 1,900 + bonus.
3. **Önceki alışverişine bak**: geçen round Op aldıysa bu round eli kısa.
4. **Silah topla**: yerdeki Vandal'ı al — düşman 2,900'ü yeniden harcamak zorunda kalır.

### Düşman Okuma Kalıpları

DURUM: düşman pistol'ü kazandı, 2. round'a giriyor.
NE ANLAMA GELİR: ellerinde ~3,800, Spectre + Light alırlar.
NE YAPARSIN: yakın mesafede SMG'yi bekleme, mesafe tutup Sheriff ya da Ghost ile kafadan vur.
NEDEN: bonus round'da SMG'nin geleceğini bilirsen pozisyonunu ona göre kurarsın.

DURUM: düşman force atıp kaybetti.
NE ANLAMA GELİR: 1,900 geliyor, sonraki round sert eco.
NE YAPARSIN: agresif oyna, eco round'da yakın mesafe verme.
NEDEN: force kaybeden takım iki round geri düşer — fırsatı kaçırma.

DURUM: 3 düşman tüfekle öldü, silahlarını topladın.
NE ANLAMA GELİR: düşman 8,700 kaybetti, sen 3 bedava tüfekle giriyorsun.
NE YAPARSIN: her trade sonrası yere bak, tüfek varsa al — round içinde de işine yarar.
NEDEN: silah toplamak round kazanmak kadar değerli, ekonomiyi tek başına çevirir.

---

## Thrifty Round (Eco'da Kazanma)

DURUM: eco ya da yarım alışverişle full düşmanı yendin.
NE ANLAMA GELİR: ekonomi takla attı, sen öndesin.
NE YAPARSIN: aşağıdaki taktiklerden birini uygula.
NEDEN: thrifty round maçı çevirir — 2-3 round'luk değer üretir.

### Eco'yu Çevirme Yolları

1. **Beşli baskın**: Spectre ya da Judge al, tek site'a hep birlikte koş. Hız ve kaos tüfek kurulumlarını bozar.
2. **Off-angle Sheriff**: yayıl, beklenmedik açıdan kafadan vur. Bir kill bir tüfek demek.
3. **Site yığını**: 4-5 kişi tek site'a, yakın mesafe silahıyla. Düşmanı SMG mesafesine çek.
4. **Fake + flash döndürme**: bir site'ta gürültü çıkar, sessizce öbür site'a kay.

---

## Force Senaryoları (Sayılarla)

### Pistol Kaybettin, Bonus Round

- Elinde: 2,700
- **Save**: bir sonraki round 5,100 — tam full buy garanti.
- **Spectre force**: 1,600 + 400 shield = 2,000. Kaybetsen 700 + 2,400 = 3,100 — tüfek çıkar ama kalkana para kalmaz.
- **Marshal force**: 950 + 400 shield = 1,350. Kaybetsen 1,350 + 2,400 = 3,750 — tüfek + Light çıkar, Heavy'e yetmez.
- **Doğru hareket**: pistol kaybettiysen save standart, 3. round'da garanti tüfek istiyorsun. Force sadece Raze/Neon/Jett gibi eco'da güçlü ajanların elindeyse mantıklı.

### Maç Noktası, Sen Geride

DURUM: kaybedersen maç biter.
NE ANLAMA GELİR: "sonraki round" diye bir şey yok.
NE YAPARSIN: her krediyi harca, ne alabiliyorsan al.
NEDEN: save etmek anlamsız — para taşımanın bir faydası kalmadı.

---

## Spike ve Ekonomi

DURUM: eco ya da save round'undasın.
NE ANLAMA GELİR: plant yine de para basar — spike dikilirse kaybetsen bile herkese +300 gelir, rakip retake için util de yakar.
NE YAPARSIN: round'u kill için değil plant için oyna: hep birlikte tek site'a git, spike'ı dik, kalanını çapraz açıyla tut. Force silahıyla (Spectre) uzak açı kuramazsın — spike'ı siper arkasından yakın tut, defuse sesine oyna.
NEDEN: +300 × 5 kişi sonraki alımı büyütür — pistol'e özgü değil, her eco'da geçerli.

DURUM: savunmadasın, spike dikildi, sayı ve util gerideysen.
NE ANLAMA GELİR: retake round'la birlikte tüfeğini de yutar.
NE YAPARSIN: silahını kurtar — haritanın uzak çıkışından ayrıl, tüfek + kalkanı sonraki round'a taşı. Sayı ve util denk ise retake'e gir; düello kazandıysan yerdeki tüfeği al, round'u hayatta bitirirsen silah sende kalır.
NEDEN: kurtarılan tüfek 2,900'lük alımı siler; yarım kalan retake hem round'u hem silahı rakibe verir.

---

## Ult Orb Ekonomisi

Kill, ölüm, orb ve round bitişi ult'u doldurur. Tek kural yeter: round çeviren ult'a (diriliş, site söken duvar, bedava keskin nişancı) yaklaşan takım arkadaşın varsa orb önceliği onda. Orb alırken ses verirsin — önce köşeyi temizle, sonra al.

---

## Pistol Round

- **Silah kararı**: kafadan tek atış hattı tutacaksan Ghost; yakın mesafe ve dayanıklılık istiyorsan Classic + Light kalkan. İkisi de meşru — pozisyonuna göre seç.
- **Her kill 200**: pistol'de 2-3 kişi öldürmek bonus round alımını büyütür — SMG yerine SMG + kalkan + util'e çıkarsın.
- **Plant +300 herkese**: pistol kaybedilecek gibi olsa bile plant, takımın 2. round alımını değiştirir. Plant şansı varsa dik.

---

## İlk Tüfek Round Yolları

### Pistol Kazandın

- Pistol sonu: 3,800
- Bonus round alışverişi: Spectre 1,600 + Light 400 + util ~300 = ~2,300. Cebinde ~1,500.
- Bonus kazandın: 1,500 + 3,000 = 4,500 — 3. round full.
- Bonus kaybettin: 1,500 + 1,900 = 3,400 — 3. round tüfek + heavy alır, util kesersin.

### Pistol Kaybettin

Sayılar aşağıda "Force Senaryoları"nda — özet: save standart, bonus sonu 5,100 ile 3. round tam yüklü full buy.

---

## Overtime

DURUM: overtime'dasın.
NE ANLAMA GELİR: her OT round'unda herkese sabit 5,000 verilir — full buy standart (tüfek + heavy + util). Save ve eco kavramı yok; kredi sonraki round'a taşınmaz.
NE YAPARSIN: her round tam al — tüfek, ağır kalkan, tam util.
NEDEN: iki taraf da full geliyor — farkı silah değil, ilk düello ve util kullanımı yaratır.

---

## Shield Değeri

| Shield | HP | Kredi | HP başına |
|---|---|---|---|
| Yok | 0 | 0 | - |
| Light | 25 | 400 | 16/HP |
| Heavy | 50 | 1,000 | 20/HP |

### Light > Heavy Olduğu An

DURUM: eco'da Ghost + Light istiyorsun.
NE ANLAMA GELİR: Heavy alırsan silaha para kalmaz.
NE YAPARSIN: Ghost + Light kombosuyla git, 900 kredi.
NEDEN: yakın mesafede Light yeter, kafadan vurursan zaten armor önemsiz.

### Shieldsız Kalmak Ne Zaman Olur

DURUM: full save'desin.
NE ANLAMA GELİR: 400 kredi bile gelecek round'u zayıflatır.
NE YAPARSIN: hiçbir şey alma, Classic'le oyna.
NEDEN: save = sonraki round için maksimum kredi, bu round zaten kayıp sayılıyor.

---

## Silah Yükselme Yolu

1. **Pistol**: Ghost (500) ya da Light + Classic
2. **Bonus (kazandın)**: Spectre (1,600) ya da Marshal (950) — önce Spectre.
3. **Bonus (save)**: hiçbir şey alma, tut.
4. **İlk tüfek round**: Vandal/Phantom 2,900 + Heavy 1,000.
5. **Sonrası**: tüfeği koru. Takımda Chamber veya Jett varsa ve arkanı toplayan biri varsa Op (4,700) düşün.

### Op Almanın Bedeli

DURUM: Op'çusun ve almak istiyorsun.
NE ANLAMA GELİR: 4,700 kredi — Vandal'dan 1,800 fazla, ölüp düşersen takıma 1,800'lük açık.
NE YAPARSIN: takım ortalaması 5,000+ ise VE arkanı toplayan biri varsa al (Chamber TP, Jett dash, Cypher teli).
NEDEN: Op'çu öldü, silah toplandı = bir sonraki round 1,800 açıkla giriyorsun. Yarı boyu birikir, ekonomiyi çökertir.

---

## Chamber Ekonomik Etkisi

DURUM: takımında Chamber var.
NE ANLAMA GELİR: ult'u bedava ağır keskin nişancı verir — Op parası (4,700) cebinde kalır. Tabancası ayrı bir araç: eco round'ların kafadan tek atış seçeneği, mermileri kredi ile satın alınır, ult'la gelmez.
NE YAPARSIN: Chamber ult'luyken Op parasını takım util'ine ya da silah atmaya kaydır.
NEDEN: bedava keskin nişancı binlerce kredilik avantaj — Chamber'lı takım ekonomide önde başlar.

---

## Takım Buy Düzeni

DURUM: 1 kişi full alırken 4 kişi eco'da.
NE ANLAMA GELİR: 4v5 silah dezavantajı, round çöp.
NE YAPARSIN: ya hep beraber al ya hep beraber save — bölük buy yok.
NEDEN: birleşik buy bölük buy'ı her zaman yener, istisnası yok.

### Kurallar

1. **Silah at**: 6,000+ kredisi olan, 2,500 kredili takım arkadaşına tüfek atsın. Onun elinde değeri daha yüksek.
2. **Buy turunu takım belirler**: tek başına sapma, ya al ya save yap.
3. **Almadan önce kontrol et**: 5 oyuncunun kredisine bak. 3+ kişi full alamıyorsa takım save.
4. **Pistol'ü kazandıysanız bonus round = Spectre + Light, hepiniz**: tüfek alma, ekonomi tutmaz. Pistol'ü kaybettiyseniz bonus'ta standart save.
