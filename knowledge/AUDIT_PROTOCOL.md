---
id: audit_protocol
type: system
retrieval: excluded
purpose: kb_governance
patch: "9.x"
---

# AIMLO KB Audit Protocol (Sprint 7+)

Bu doküman KB kalite disiplininin kalıcı kuralıdır. Her sprint sonunda zorunlu olarak uygulanır. Sprint 6'da flat "hepsi 9.5" self-grade dağılımı verildi, audit 8.75 buldu — 0.75 delta. Bu protokol o hatayı tekrarlatmaz.

## 1. Temel Kurallar

### 1.1 Self-grade yasak
Sprint sırasında dosyalara kalite puanı verilmez. Puanlama ayrı audit pass ile, ayrı bir okuyucu (insan veya subagent) tarafından yapılır. Sprint raporu "tamamlandı/tamamlanmadı" listesidir; kalite claim'i içermez.

### 1.2 Random sample audit
Her sprint sonunda minimum %20 random sample 10 kriter üzerinden incelenir. Kategori başına minimum 3 dosya.

### 1.3 Word count ≠ quality
Alt sınır toleransı:
- %5 altı: acceptable if quality justifies
- %5-15 altı: inceleme, flag
- %15+ altı: stub işareti, fix zorunlu
Content kalitesi word count'tan önemlidir; filler eklemek voice drift yaratır, yasaktır.

### 1.4 Stub detection
Bir bölüm tek cümle veya 50 kelime altıysa stub işaretlenir. Matchup §5-§6-§7 stub one-liner'ları Sprint 6'nın en büyük hatasıydı.

### 1.5 Cross-reference symmetry
Her sprint'te check edilmesi zorunlu:
- Counter-pick 29×29 matrix (agent A → B varsa B → A durumu)
- Agent ↔ map landmark tutarlılığı
- Matchup ↔ agent meta tier tutarlılığı
- Synergy/counter çift taraflılığı

### 1.6 Bimodal quality red flag
Bir kategori içinde uzunluk/kalite bimodal dağılımı varsa (örneğin matchup'ların bir kısmı 1300, bir kısmı 770 kelime) sprint fail sayılır — stub'ların "done" olarak işaretlendiğinin göstergesidir.

### 1.7 Delta tolerance
Sprint claim'i ile audit gerçeği arasındaki delta:
- 0.0-0.2: normal varyasyon
- 0.2-0.5: inceleme
- 0.5+: sprint fail, re-work

### 1.8 Honest verdict koşulları
"Backend entegrasyonuna hazır" demek için:
- Audit ortalaması ≥ 9.2
- Stub dosya sayısı = 0
- CRITICAL asimetri sayısı = 0
- [VERIFY] flag sayısı < 30

Bu koşullar sağlanmadan "hazır" ilanı verilmez.

## 2. Sprint Raporu Kuralları

- Sprint raporu = tamamlanan task listesi + kanıt (word count, grep output, file path)
- Sprint raporu self-score YAPMAZ
- Audit raporu ayrı bir dosyadır (`knowledge/audit/sprint-N-audit.md`)
- Audit raporu sprint'ten bağımsız okuyucu tarafından yazılır
- Sprint raporu claim yapıyorsa audit raporu ile karşılaştırma zorunludur

## 3. 10 Audit Kriteri

Her dosya için 0-10 arası puanlanır, ortalama alınır.

1. **Pro Coach Voice** — Her cümle VCT düzeyinde bir koçun söyleyebileceği biçimde mi? Filler adjektif, klişe ifade, içi boş claim içermeyen.
2. **IF/MEANING/COUNTER/WHY format disiplini** — Pattern bölümlerinde sıra ve derinlik standartta mı? IF somut tetik, MEANING cause-effect, COUNTER landmark'lı, WHY ekonomi/pozisyon gerekçesi.
3. **Cause-Effect Zinciri** — Her claim bir nedene ve bir sonuca bağlı mı? Spekülatif veya tek cümlelik boş iddialar var mı?
4. **Specifiklik** — Landmark, durum, round fazı, comp bağlamı ile desteklenmiş mi? "Raze güçlü" ❌, "Raze Breeze A Main'de uzun açıdan" ✅.
5. **Yasaklı Kelime Final Check (grep)** — Banned word listesi üzerinde 0 hit.
6. **Cross-Reference Tutarlılığı** — Bu dosya diğer dosyaların iddialarıyla çelişiyor mu? Counter symmetry, landmark naming, meta tier.
7. **Terminology Tutarlılığı** — Aynı konsept aynı terminolojiyle kullanılmış mı? ("yakıt barı" vs "fuel bar" vs "viper yakıt" — bir tanesine karar ver).
8. **Gold Standard Karşılaştırma** — Kategorinin gold standard dosyasıyla kıyaslandığında derinlik seviyesi benzer mi?
9. **Word Count & Template** — STANDARDS.md'deki target + template'e uygun mu?
10. **Actionability Test** — Oyuncu bu dosyayı okuduktan sonra round içinde kullanabileceği somut bir karar çıkarabiliyor mu?

## 4. Audit Thresholds

- Dosya ortalaması ≥ 9.0 → pass
- 8.5-9.0 → minor fix, dosya tutulur ama weak points listelenir
- 8.0-8.5 → major fix, re-write gerek
- < 8.0 → unacceptable, hemen re-write veya dosyayı sil

## 5. Kategori Gold Standards

Her kategori için referans dosya. Audit sırasında kıyas için kullanılır.

- **Agent:** agents/sentinels/cypher.md (en derin, flank/setup ekonomisi net)
- **Map:** maps/haven.md (3 site + comprehensive post-plant, rank notu)
- **Matchup:** matchups/omen_vs_op_setup.md (ability vs ability ekonomi + flip ekonomisi)
- **General (content):** general/economy-mastery.md (structured decision framework)
- **Rank:** ranks/elite.md (deepest coaching voice)

## 6. Banned Terminology

### Numeric (always banned in prose)
Cooldown, damage, range, duration, movement speed — hiçbir numeric ability value yazılmaz. Bunun yerine situational language: "smoke aktif / bitmiş", "ult dolu / boş", "yakıt yarıda".

### Unit references
unit, units, pixel, pixels, px, saniye, sn, second, seconds, metre, meter, tick, dakika, minute

### Filler adjectives
önemli, önemlidir, kritik, kritiktir, akıllıca, akıllı, dikkat, dikkatini, dikkatli, etkili, verimli, başarılı

### Weak quantifiers
genelde, genellikle, bazen, ara sıra, çoğu zaman, çoğunlukla, genel olarak

## 7. Sprint Completion Checklist

Her sprint sonunda:

- [ ] Banned word grep: 0 hit
- [ ] Stub detection: 0 dosya altı 50 kelime bölüm
- [ ] Word count range compliance: ≥95% dosya target içinde
- [ ] [VERIFY] flag sayısı < 30
- [ ] Cross-ref symmetry: 0 CRITICAL asimetri
- [ ] Random sample audit: min %20, avg ≥ 9.0
- [ ] Sprint raporu + audit raporu ayrı dosyalar
- [ ] Delta hesabı: sprint claim - audit gerçek, |delta| < 0.3
- [ ] Gold standard kıyası yapıldı

Herhangi bir kalem fail ise sprint fail.

## 8. Sprint 6 → Sprint 7 Dersleri

### Ne hata yapıldı
1. Self-grade flat dağılımı ("hepsi 9.5") istatistiksel olarak imkansız — bell curve olmalıydı
2. Word count floor'u tutulan ama depth eklenmeyen 6 matchup "done" işaretlendi
3. 3 legacy map (abyss, split, sunset) Phase 1'den beri güncellenmedi ama sprint raporunda "güncellendi" olarak geçti
4. 276 [VERIFY] flag "ileride bakarız" parking lot'una atıldı
5. Counter-pick symmetry hiç audit edilmedi → Raze↔Harbor asimetrisi fark edilmedi

### Sprint 7'de nasıl düzeltildi
1. Continuous verification loop: her dosya için 10 kriter + 2 weak point zorunlu
2. 9.0 altına düşen dosya re-work'e gitti (chamber_vs_sova 8.3 → 9.4, raze_vs_viper 8.5 → 9.3)
3. STANDARDS.md oluşturuldu, word count politikası formalize edildi
4. [VERIFY] batch cleanup: 276 → 22
5. Counter-pick 29×29 matrix build edildi, tek CRITICAL asimetri (Raze↔Harbor) fix edildi
6. Deferred items fiilen kapatıldı (4 legacy index silindi, kod referansları güncellendi)

### Kalıcı kural
Self-grade sprint içinde yapılmaz. Audit sprint dışında yapılır. Sprint raporu "ne yapıldığı", audit raporu "ne kadar iyi yapıldığı"dır. İki role birbirinin yerine geçmez.
