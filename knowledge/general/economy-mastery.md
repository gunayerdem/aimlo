# Ekonomi Ustalığı -- Radiant Seviye Bilgi Bankası

---

## Kredi Sistemi Temelleri

### Round Sonuç Kredileri

| Sonuç | Kazanılan Kredi |
|---|---|
| Round Kazanma (saldırı) | 3,000 |
| Round Kazanma (savunma) | 3,000 |
| Round Kaybetme | 1,900 (temel) + kayıp bonusu |
| Spike Plant (saldırı, kayıpda bile) | +300 plant yapana |
| Spike Plant takım bonusu (saldırı kaybı) | +200 takıma |

### Kill Kredileri

| Silah Kategorisi | Kill Ödülü |
|---|---|
| Bıçak | 400 |
| Tabanca (Classic, Shorty, Frenzy, Ghost, Sheriff) | 200 |
| SMG (Spectre, Stinger) | 200 |
| Pompalı (Bucky, Judge) | 200 |
| Tüfek (Bulldog, Guardian, Phantom, Vandal) | 200 |
| Keskin nişancı (Marshal, Operator) | 200 |
| Makineli (Ares, Odin) | 200 |

Not: Tüm silah kill ödülleri önceki patch'te 200 krediye normalize edildi. Bıçak risk-ödül bonusu olarak 400'de kaldı.

### Kayıp Bonusu (Seri) Sistemi

| Arka Arkaya Kayıplar | Kayıp Bonusu | Kayıpda Toplam |
|---|---|---|
| 1. kayıp | +0 | 1,900 |
| 2. arka arkaya kayıp | +500 | 2,400 |
| 3.+ arka arkaya kayıp | +1,000 | 2,900 |

- Kayıp bonusu round kazanıldığında sıfırlanır.
- Kazandıktan sonra kaybedersen, 1. kayıp kademesinden (1,900) başlarsın.
- Bu sistem 2 arka arkaya kayıptan sonra bile kaybeden takımın kişi başına 2,900'u olmasını, force buy veya yakın-full buy yapabilmesini sağlar.

### Round Başlangıç Kredileri

| Round | Başlangıç Kredileri |
|---|---|
| Pistol (Round 1) | 800 |
| Round 2 (pistol kazanma sonrası) | 3,000 + 800 = 3,800 |
| Round 2 (pistol kaybetme sonrası) | 1,900 + 800 = 2,700 |
| Overtime (her yarı) | 2,400 |

---

## Buy Turu Tanımları ve Eşikler

### Full Buy

IF takım ortalaması 4,000+ krediyse
MEANING herkes Vandal/Phantom + Heavy Shield + yetenekler alabilir
COUNTER full buy yap -- tüfek (2,900) + heavy shield (1,000) = 3,900 minimum; yetenekler ikincil
WHY full buy takımın ateş gücünü ve hayatta kalma şansını maksimize eder

### Half Buy (Force)

IF takım ortalaması 2,200-3,500 kredi arasındaysa
MEANING full buy için yetersiz ama save yapmak da gereksiz olabilir
COUNTER duruma göre karar ver: skor yakınsa force yap (Spectre 1,600 + Light Shield 400 = 2,000), yakın değilse save
WHY force buy kararı skor, round sayısı ve kayıp bonusuna bağlı olmalı

### Eco (Save) Round

IF takım ortalaması 2,000 kredinin altındaysa VE kaybediyorsan
MEANING bu round'u kazanma şansın düşük, gelecek round'un full buy'ını hazırla
COUNTER Ghost (500) veya Sheriff (800) al, utility alma, tasarruf et
WHY eco'nun amacı bu round'u kazanmak değil, gelecek round'un full buy'ını garanti etmek

### Anti-Eco

IF düşman eco'da ve sende full buy avantajı varsa
MEANING düşman yakın mesafe fight'ı arayacak
COUNTER uzak mesafe tut, Spectre (run-and-gun) veya Ares (duvar spam) kullan; Operator ALMA
WHY eco takımı agresif push yapar ve Op yakın mesafede zayıftır

---

## Kredi Eşikleri Karar Çerçevesi

```
Round sonrası takım ekonomisini kontrol et:

Takım ortalaması 4,500+ --> FULL BUY (tüfek + heavy + yetenekler)
Takım ortalaması 3,900-4,499 --> FULL BUY (tüfek + heavy, 1-2 yetenek kes)
Takım ortalaması 3,000-3,899 --> FORCE BUY kararı:
  |-- Skor yakın (3 round içinde) --> Spectre/Bulldog + Light Shield ile force
  |-- Skor yakın değil --> Gelecek round full buy için save
  |-- Round 12 (yarının son round'u) --> HER ZAMAN force
Takım ortalaması 2,000-2,999 --> ECO
  |-- Maç noktası değilse --> Save
  |-- Kayıp bonusu maksimumda (gelecek round 2,900) --> Force düşünülebilir
Takım ortalaması 2,000 altında --> FULL SAVE (hiçbir şey harcama, Classic)
```

---

## Düşman Ekonomisi Okuma

### Düşman Kredilerini Takip

Düşman kredilerini doğrudan göremezsin ama çıkarım yapabilirsin:

1. **Kill'lerini say**: Her kill = 200 kredi. Önceki round'da 3 kill alan oyuncu 600 ekstra kazandı.
2. **Round sonuçlarını takip et**: Kazandılar mı (3,000) yoksa kaybettiler mi (1,900 + kayıp bonusu)?
3. **Spike plant'leri izle**: Plant yapan +300, takım kayıpda +200 alır.
4. **Buy'larını gözlemle**: Geçen round Op aldılarsa (4,700), bu round daha az kredileri var.
5. **Ölümleri takip et**: Silahlarını düşürdüler mi? Silah kurtarılamadıysa yeniden almak zorundalar.

### Ekonomi Okuma Kuralları

IF düşman pistol kazandıktan sonra 2. round'daysa
MEANING ~3,800 kredileri var, Spectre + Light Shield (2,000) alırlar, 3. round full buy yapabilirler
COUNTER bonus round'da Spectre + Light Shield bekle; 3. round'da full buy hazır ol
WHY düşman ekonomi yolunu bilmek seni şaşırtılmaktan korur

IF düşman force-buy yapıp kaybettiyse
MEANING sadece 1,900 gelir -- gelecek round sert eco
COUNTER agresif oyna, eco round'larında yakın mesafeye izin verme
WHY force kaybeden takımın ekonomisi kırılmıştır; bunu exploit et

IF 3+ düşman tüfekle öldü ve hiçbirini almadıysan
MEANING 3 tüfek yeniden almak zorundalar (8,700 toplam takım maliyeti) -- kazansalar bile ekonomileri kırılabilir
COUNTER düşmüş silahlarını topla, her fırsat = ekonomik avantaj
WHY silah kurtarma/çalma ekonomi savaşı içinde round kazanmak kadar değerli

---

## Thrifty Round Stratejileri

IF eco/half-buy ile full-buy düşmana karşı kazanırsan
MEANING ekonomi sallanır -- büyük değer round'u
COUNTER thrifty taktikleri uygula: 5 kişi rush, defans'ta agresif off-angle Sheriff pick, site stack, bait-and-switch
WHY thrifty round'lar ekonomiyi devasa ölçüde sallayarak iki takımın da gelecek round'larını etkiler

### Thrifty Taktikleri

1. **5 kişi site rush**: Eco'da Spectre veya Judge al ve bir site'a hep birlikte koş. Hız ve kaos tüfek setup'ını ezdirip geçebilir.
2. **Defans'ta pick odaklı oyna**: Yayıl, agresif off-angle'lardan Sheriff ile oyna. Bir headshot kill = tüfek pickup.
3. **Site stack**: 4-5 oyuncuyu bir site'a yerleştir, yakın mesafe silahlarıyla. Saldırganları SMG/pompalının rekabetçi olduğu yakın mesafe düellolarına zorla.
4. **Bait-and-switch**: Bir site'ta mevcudiyet göster, rotasyon çek, sonra diğer site'a rush et. Eco round'ları karışıklık yaratarak başarılı olur.

---

## Force Buy Senaryoları (Matematikle)

### Senaryo 1: Pistol Kaybettin, Round 2

- Kredi: 2,700 (1,900 kayıp + 800 başlangıç).
- **Opsiyon A**: Save. Gelecek round: 2,700 + 2,400 (2. kayıp) = 5,100. Her şeyle full buy.
- **Opsiyon B**: Spectre (1,600) + Light Shield (400) = 2,000 ile force. Kalan: 700. Kaybedersen: 700 + 2,900 (3. kayıp) = 3,600. Sıkı full buy.
- **Opsiyon C**: Marshal (950) + Light Shield (400) = 1,350 ile force. Kalan: 1,350. Kaybedersen: 1,350 + 2,900 = 4,250. Rahat full buy.
- **Tavsiye**: Çoğu pro takım pistol kaybettikten sonra round 3'te garanti full buy için round 2'de save yapar. Force sadece takım kompozisyonun güçlü eco-round yeteneklerine sahipse (Raze, Neon, Jett) değerli.

### Senaryo 2: Maç Noktası Karşı (11-12 veya benzeri)

IF kaybedersen maç biter
MEANING "gelecek round" yok
COUNTER her krediyi harca, tam force yap -- alabileceğin en iyi silahı al
WHY tasarrufun değeri sıfır çünkü gelecek round yok

---

## Ult Orb Ekonomisi

Ultimate yetenekler kill (1 orb), ölüm (1 orb), orb pickup (1 orb) ve round tamamlamalarıyla (değişken) şarj olur.

### Hangi Ult'lar İçin Eco Yapılmaya Değer

| Ajan | Ult Orb Sayısı | Eco Önceliği | Sebep |
|---|---|---|---|
| Sage (Resurrection) | 8 | YÜKSEK | Diriliş oyun değiştirici |
| Viper (Viper's Pit) | 7 | YÜKSEK | Site savunmasını dönüştürür |
| Chamber (Tour De Force) | 7 | YÜKSEK | Bedava Op = 4,700 kredi tasarrufu |
| Brimstone (Orbital Strike) | 7 | ORTA | Mükemmel post-plant denial |
| Killjoy (Lockdown) | 8 | ORTA | Retake için güçlü site kilit |
| KAY/O (NULL/cmd) | 7 | ORTA | Entry için güçlü |
| Cypher (Neural Theft) | 6 | ORTA | Bilgi ult'u, orb'da ucuz |
| Gekko (Thrash) | 7 | ORTA | Toplayıp yeniden kullanabilir |
| Jett (Bladestorm) | 7 | DÜŞÜK | Bedava silah ama Jett zaten alabilir |
| Raze (Showstopper) | 8 | DÜŞÜK | Çok fazla orb |
| Sova (Hunter's Fury) | 8 | DÜŞÜK | Güçlü ama orb maliyeti yüksek |
| Omen (From the Shadows) | 7 | DÜŞÜK | Durumsal |

### Ult Orb Konumları ve Zamanlama

- Her haritada round başında 2 ultimate orb spawn olur.
- Orb'lar mid veya çatışma alanlarında spawn olarak onlar için fight zorlar.
- Orb almak "ult ekonomisi" değerinde 200+ kredi değer. Default oyunlarda orb kontrolünü önceliklendir.
- Orb alma sesi düşmana duyulur. Almak o bölgede mevcudiyetini açığa çıkarır.

---

## İlk Tüfek Round Ekonomi Yolları

### Pistol Kazandıktan Sonra (2-0 önde)

- Round 1 kazanma: 3,000 + 800 = 3,800.
- Round 2 buy: Spectre (1,600) + Light Shield (400) + yetenekler (~300) = ~2,300. Kalan: ~1,500.
- Round 2 kazanma: 1,500 + 3,000 = 4,500. Round 3: Her şeyle full buy.
- Round 2 kayıp: 1,500 + 1,900 = 3,400. Round 3: Sıkı buy. Tüfek + Heavy ama sınırlı yetenekler.

### Pistol Kaybettikten Sonra (0-2 geride)

- Round 1 kayıp: 1,900 + 800 = 2,700. Round 2 save.
- Round 2 kayıp: 2,700 + 2,400 = 5,100. Round 3: Maksimum yetenekler ve utility ile full buy.
- Bu yüzden pistol kaybettikten sonra save yapmak standarttır. 3. round için 5,100 kredi elde edersin.

---

## Overtime Ekonomisi

IF overtime'daysan
MEANING her oyuncu 2,400 kredi alıyor -- Phantom/Vandal (2,900) bile tek başına yetmiyor
COUNTER Silah > Shield > Yetenekler öncelik sırası. Armor olmadan tüfek al, veya Spectre + Heavy Shield
WHY overtime'da shield'siz Vandal her durumda Spectre + heavy shield'dan üstün performans gösterir

- Yaygın overtime buy'ları: Phantom/Vandal + 0-1 yetenek (2,400 + önceki OT round'undan kalan). Önceki OT round'unu kazanmadıysan heavy shield yok.

---

## Shield Değer Analizi

| Shield | Eklenen HP | Maliyet | HP Başına Maliyet |
|---|---|---|---|
| Shield Yok | 0 | 0 | N/A |
| Light Shield | 25 | 400 | 16 kredi/HP |
| Heavy Shield | 50 | 1,000 | 20 kredi/HP |

### Light Shield Ne Zaman > Heavy Shield

IF eco round'daysan ve Ghost + Light Shield (900 toplam) istiyorsan
MEANING sadece Heavy Shield (1,000) almak seni silahsız bırakır
COUNTER Ghost + Light Shield kombinasyonu kill potansiyeli sağlar
WHY light shield SMG ve yakın mesafe fight'larda "yeterli" hayatta kalma sağlar

### Shield Olmadan Ne Zaman Kabul Edilebilir

IF full eco'daysan ve tüm kredileri gelecek round'a saklıyorsan
MEANING 400 kredi light shield'a harcamak gelecek round buy'ını zayıflatır
COUNTER save round'da shield alma, tüm kredileri koru
WHY eco'nun amacı gelecek round'un full buy'ını garanti etmek, bu round'u kazanmak değil

---

## Silah Yükselme Yolları

### Standart İlerleme

1. **Round 1 (Pistol)**: Ghost (500) veya Light Shield + Classic yetenekler.
2. **Round 2 (Kazanma)**: Spectre (1,600) veya Marshal (950). Spectre standart.
3. **Round 2 (Kayıp/Save)**: Hiçbir şey. Tüm kredileri sakla.
4. **Round 3 (İlk tüfek round)**: Vandal (2,900) veya Phantom (2,900) + Heavy Shield (1,000).
5. **Sonraki round'lar**: Vandal/Phantom'ı koru. Takım ekonomisi izin veriyorsa bir oyuncu için Operator (4,700) ekle.

### Operator Ekonomi Etkisi

IF Op oyuncun olup op almak istiyorsan
MEANING Op 4,700 kredi -- Vandal'dan 1,800 fazla, ölüp silahı kurtarılamazsa büyük kayıp
COUNTER sadece takım ortalaması 5,000+ krediyse veya güvenli pozisyondaysan (Chamber TP, Jett dash) Op al
WHY ölen ve silahını kaybeden Op oyuncusu Vandal'a kıyasla "1,800 kredi açığı" oluşturur; bir yarı boyunca toplanır

---

## Chamber Ekonomik Etkisi

IF Chamber'ın ult'u hazırsa
MEANING Tour De Force (ult Op) 4,700 kredi tasarrufu sağlar, Headhunter (800 kredi, 8 mermi) eco round'larda en güçlü silah
COUNTER Chamber'ın Op parasını (4,700) başka bir oyuncunun utility'sine yatır veya buffer olarak sakla
WHY yarı başına ~4,700-9,400 kredi ekonomik avantaj (1-2 Op alımı ult ile değiştirilmiş)

---

## Takım Buy Koordinasyon Kuralları

IF 1 oyuncu full buy yaparken 4 oyuncu eco yapıyorsa
MEANING 4v5 silah dezavantajı, round pratikte kayıp
COUNTER ya tüm takım alsın ya tüm takım save yapsın -- bölü buy asla
WHY birleşik buy her zaman bölü buy'dan üstündür

### Koordinasyon Kuralları

1. **Silah düşürme**: 6,000+ kredili oyuncu 2,500 kredili takım arkadaşına silah alsın. Marjinal değer fakir oyuncu için daha yüksek.
2. **IGL buy'ı çağırır**: IGL (veya atanmış ekonomi çağırıcı) takım buy turunu belirler. Kimse rogue gitmez.
3. **Buy etmeden ÖNCE takım ekonomisini kontrol et**: 5 oyuncunun kredilerine bak. 3+ oyuncu full buy yapamazsa takım save yapsın.
4. **Bonus round**: Her zaman Spectre + Light Shield al. Bonus round'da tüfek ALMA; ekonomi desteklemiyor.

---

## Rank Modülasyonu

### Immortal+ İçin

IF ekonomi yönetimini ustaya çıkarttıysan
MEANING bu seviyede ekonomi farkı round'ları belirler
COUNTER düşman ekonomisini her round takip et, takım buy koordinasyonunu IGL olarak yönet, Op ekonomisini optimize et
WHY Immortal+'da ekonomi okuma ve yönetimi mekanik kadar fark yaratır

### Diamond-Ascendant İçin

IF ekonomi temellerini öğrenmek istiyorsan
MEANING buy turları, force kararları ve save zamanlama bilgisi rank atlatır
COUNTER bu dokümandaki karar çerçevesini ezberle, her round öncesi takım ekonomisini kontrol etme alışkanlığı edin
WHY yanlış ekonomi kararları 2-3 round'luk kayıp serilerine yol açar; doğru ekonomi yönetimi tutarlı silah avantajı sağlar
