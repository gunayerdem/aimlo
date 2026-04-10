---
id: kb_changelog
type: meta
patch: "9.x"
tags: [changelog, meta, sprint-log]
---

# AIMLO KB CHANGELOG

## Sprint: Pro-Coach Voice Rewrite (Faz 2)

Bu sprint KB'yi "pro takım koçu sesi"ne taşımak için yapıldı. Sayısal spesiflik (unit, saniye, pixel, frame, exact cooldown) yerine situational + actionable + neden-sonuç zinciri kullanıldı. Tek istisnalar: credit miktarı, round numarası, numbers disadvantage (oyuncunun zaten takip ettiği sayılar).

### Faz 1 — Map Rewrites (Pro-Coach Voice)

**Tam rewrite (1,500-2,500 kelime, 8-15 section):**
- `maps/ascent.md` — 549 → 2,470 kelime. YAML frontmatter, callout envanteri, tehlikeli pozisyonlar, 7 Pattern→Meaning, savunma setup'ları, 4 execute plan, mid kontrolü, 12 utility fikri, post-plant, retake mantığı, 6 yaygın hata (cause-effect), rank notu, 3 comp önerisi.
- `maps/bind.md` — 309 → 2,302 kelime. Aynı yapı + teleporter ses disiplini + no-mid unique dinamik.
- `maps/sunset.md` — 940 → ~2,400 kelime. Market kontrolü + A Elbow fight + close-range meta vurgusu.
- `maps/abyss.md` — 947 → ~2,400 kelime. Void mechanic + kenar oyunu risk/reward + ability ile düşürme taktikleri.
- `maps/split.md` — 1,014 → ~2,400 kelime. Defender-sided disiplin + mid kontrolü (Vents/Mail) + rope mechanic'i.

**YAML Frontmatter Eklenen (polish pending):**
- `maps/haven.md`
- `maps/corrode.md`
- `maps/breeze.md`
- `maps/fracture.md`
- `maps/icebox.md`
- `maps/lotus.md`
- `maps/pearl.md`

### Faz 4 — Yeni General Files (7 yeni dosya)

Retrieval-optimized, cross-map kavramsal kitaplar:

- `general/round-playbook.md` — Round tipine göre karar ağacı (pistol, anti-eco, force, save, full-buy, eco, bonus). Her tip için buy mantığı + strateji + yasak + timing. Ekonomi pattern'leri.
- `general/pattern-library.md` — Rakip pattern'leri kataloğu. IF/MEANING/COUNTER/WHY formatı. Site stack, execute, utility, ekonomi, oyuncu, rotate, clutch, meta pattern'leri. ~25 pattern.
- `general/weapon-counters.md` — Operator, Odin, Judge/Bucky, Marshal, Sheriff, Spectre, Spectre rush için counter taktikleri. Silah mantığı + counter prensipleri + rank notu.
- `general/post-plant-playbook.md` — Plant spot seçimi, spread vs stack, utility ekonomisi, defuse ses okuma, numbers durumları (5v5 → 1v5), map-specific post-plant notları.
- `general/retake-playbook.md` — Retake protokolleri, numbers disadvantage (5v5, 4v5, 3v5, 2v4, 1vN), utility sıralaması, retake trap'leri, retake vs hold karar ağacı.
- `general/execute-playbook.md` — Execute tipleri (fast, slow, split, fake, default-into-execute), rol dağılımı (entry/trade/support/controller/lurker), timing, yaygın hatalar.
- `general/team-comp-library.md` — Her map için S-tier + alternative + aggressive comp. 12 map × 3 comp. Counter-comp okuma, comp tipleri (double duelist, double controller, Op comp, vb).
- `general/utility-library.md` — Utility kategorileri (smoke/flash/molly/info/stun/wall/movement/TP/heal), map × ajan kritik utility kombinasyonları, lineup prensipleri, utility ekonomisi.

### Faz 5 — YAML Frontmatter Global

Tüm dosyalara YAML frontmatter eklendi (retrieval sistemine hazırlık):

**Agents (29 dosya):**
- Duelists (8): jett, raze, reyna, phoenix, neon, yoru, iso, waylay
- Initiators (7): sova, skye, breach, fade, kayo, gekko, tejo
- Controllers (7): omen, brimstone, viper, astra, harbor, clove, miks
- Sentinels (7): killjoy, cypher, sage, chamber, deadlock, vyse, veto

Her ajan için: id, type, role, tier (S/A/B/C), best_maps, worst_maps, patch, tags.

**Role summaries (4):** duelists.md, initiators.md, controllers.md, sentinels.md

**Ranks (4):** low-elo, mid-elo, high-elo, elite

**Existing general files (9):** advanced-mechanics, clutch-methodology, coaching-core, economy-mastery, mental-game, patch-meta, pro-analysis, radiant-tips, team-dynamics

**Matchups (25):** tüm mevcut matchup dosyaları

### Mutlak Prensipler — Sprint Boyunca Uygulandı

1. **PRO KOÇ SESİ** — Robot dili yasak, sayı yok, konsept var.
2. **NEDEN-SONUÇ HER İDDIA İÇİN** — "X yap çünkü Y olur, yapmazsan Z."
3. **SİTUATİONAL > NUMERICAL** — "Dash sonrası savunmasız" ✅ vs "12s cooldown" ❌.
4. **ACTIONABLE** — Oyuncu okur, hemen uygulayabilmeli.
5. **GOLD-IMMORTAL RANGE** — Gold anlar, Immortal değer bulur.
6. **FILLER YASAK** — Motivasyon, giriş paragrafı, generic cliché yasak.
7. **KISA VE YOĞUN > UZUN VE DAĞINIK**.
8. **EMİN OLMADIĞIN ŞEYİ UYDURMA**.
9. **GÜNCEL META** — 2025-2026.

### Bu Sprint'te Tamamlanmayan (Follow-up Gerekli)

**Faz 1 kalan:**
- Haven, Corrode, Breeze, Fracture, Icebox, Lotus, Pearl — frontmatter var ama pro-coach voice rewrite yapılmadı. Mevcut halleri 7.2-7.8 score ile güçlü ama template değil.

**Faz 2 (Ajan Derin Genişletme):**
- 29 ajan için frontmatter eklendi ama 2,000-2,800 kelime derin genişletme yapılmadı.
- Her ajan için eklenecekler: Ability Overview (kullanım mantığı odaklı, sayısız), Cause-effect hata formatı, Pattern→Meaning 10-12 entry, Synergy Combos, Counter-Pick listesi.
- Mevcut 8-section template'ler zaten 8.0-8.5 seviyesinde, tam rewrite değil incremental expansion gerekli.

**Faz 3 (Matchup Library):**
- Mevcut 25 matchup dosyasına frontmatter eklendi.
- Yeni ~75 matchup dosyası yazılmadı (jett_vs_sova, killjoy_vs_raze, cypher_vs_breach, chamber_vs_breach, astra_vs_fade, omen_vs_brimstone, anti_odin, anti_judge, vb).

**Faz 6 (Quality Pass):**
- Her dosya için final self-check pass yapılmadı.
- Cross-reference validation yapılmadı.
- [VERIFY] flag'ler yok (bu sprint'te sayı yazılmadığı için gerekmedi).

### Progress Özeti

- **Map dosyaları:** 5/12 tam rewrite, 7/12 frontmatter (total: 12/12 frontmatter'lı)
- **Agent dosyaları:** 29/29 frontmatter, 0/29 derin expansion
- **General yeni dosyalar:** 8/8 planlanmış (round, pattern, weapon, post-plant, retake, execute, comp, utility)
- **Frontmatter global:** 100% (90 dosya)
- **Commit recommendation:** Bu sprint'i tek commit olarak at: `kb: phase 1-4 — pro-coach voice rewrites + new general library + global frontmatter`

### Effort Hesabı

Yapılan iş tahminen 15-20 saatlik çıktı (tek context penceresinde). Orijinal prompt 60-100 saat işaret ediyordu. Kalan iş:
- Kalan 7 map rewrite: ~25-35 saat
- 29 agent derin expansion: ~30-40 saat
- ~75 yeni matchup dosyası: ~15-20 saat
- Quality pass: ~5-10 saat
- Toplam kalan: ~75-105 saat

### Ana Kazanım

Bu sprint sonrası KB'nin **retrieval altyapısı %100 hazır**:
- Tüm dosyalarda YAML frontmatter
- 8 yeni general file cross-map concept retrieval için
- Pattern library + weapon counters + playbook'lar direkt AI output'a besleme-hazır
- 5 en zayıf map tam pro-coach voice'a çıkarıldı

AIMLO vision endpoint'inin Faz 1 (inline cheat-sheet) için KB artık **hazır**. Faz 2 (full retrieval) için frontmatter hazır, sadece retrieval pipeline'ı yazılmalı.
