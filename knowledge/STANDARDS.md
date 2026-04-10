---
id: standards
type: system
retrieval: excluded
purpose: kb_governance
patch: "9.x"
---

# AIMLO KB Standards (Sprint 7+)

## Word Count Targets

| Document Type | Target Range | Min Floor | Max Ceiling |
|---|---|---|---|
| Agent | 2000-3500 | 1900 (-5%) | 3500 |
| Map | 2300-3400 | 2185 (-5%) | 3400 |
| Matchup | 800-1500 | 760 (-5%) | 1500 |
| General (content) | 800-2500 | 760 | 2500 |
| General (system prompt) | n/a | n/a | n/a |
| Rank | 2500-5000 | 2375 | 5000 |

### Word Count Discipline
- Alt sınırın %5 altı: acceptable if quality justifies
- Alt sınırın %5-15 altı: inceleme gerekir (review)
- Alt sınırın %15+ altı: stub işareti, fix zorunlu
- Upper ceiling aşımı: %5'e kadar tolere, ötesi trim

Content quality > word count. Filler adding voice drift yaratır — yasaktır.

## Banned Terminology

### Never use:
- Numeric ability values (cooldowns, damage, range, duration)
- Fixed numeric unit references: unit, units, pixel, pixels, px, saniye, sn, second, seconds, metre, meter, tick, dakika, minute
- Filler adjectives: önemli, önemlidir, kritik, kritiktir, akıllıca, akıllı, dikkat, etkili, verimli, başarılı
- Weak quantifiers: genelde, genellikle, bazen, çoğu zaman, çoğunlukla, genel olarak

### Use instead:
- Situational language: "smoke aktif / smoke bitmiş", "ult dolu / ult boş"
- Specific triggers: "round 3+ pattern okunduğunda", "yakıt barı yarıda"
- Landmark-anchored claims: "Ascent A Main Heaven angle'ında"

## Format Templates

### Agent file sections
1. Kimlik & Rol
2. Ability Kullanım Mantığı
3. Pattern → Meaning → Counter → Why (12-13 patterns)
4. Sinerjiler
5. Counter-Pick
6. Map Bazlı Kullanım
7. Sık Yapılan Hatalar (12 hatalar)
8. Pro Coach Notları

### Map file sections
1. Map'in Özü
2. Callout Envanteri
3. Tehlikeli Pozisyonlar
4. Pattern → Meaning → Counter → Why
5. Savunma Setup'ları (≥4)
6. Saldırı Execute'ları (≥4)
7. Post-Plant Pozisyonları
8. Retake Mantığı
9. Rank Notu
10. Comp Önerileri
11. (map-unique section)

### Matchup file sections (7)
1. Matchup Özü
2. Kim Avantajlı
3. Key Düellolar (6-8 IF/MEANING/COUNTER/WHY)
4. Utility Takası (≥200 words)
5. Map Bazlı Değişim (≥200 words, ≥4 maps)
6. Flip Moment'ler (≥300 words, 3-5 flips)
7. Pro Coach Notları (≥150 words)

## Pattern Discipline

IF → MEANING → COUNTER → WHY. Strict order. No variation.
- IF: landmark-specific trigger
- MEANING: cause-effect, what shifts
- COUNTER: specific response + landmark
- WHY: economy/positioning rationale

## Pro Voice Test

Every sentence must answer: "would a real VCT coach say this in a round review?" If not, rewrite or delete.

## Self-Grade Policy

Self-grade during writing is forbidden. Audit pass is a separate step performed by a separate reader (human or subagent). Sprint report = completion list. Audit report = quality score.

## Audit Thresholds

- File avg ≥ 9.0 = pass
- File avg 8.5-9.0 = minor fix
- File avg < 8.5 = re-work
- Sprint delta (self-claim vs audit) > 0.3 = sprint fail, re-audit required
