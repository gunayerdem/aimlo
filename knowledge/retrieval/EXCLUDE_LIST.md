# KB Retrieval Exclude List
# Bu dosyalar RAG retrieval'dan cikarilacak — icerik yetersiz, kullaniciya gosterilmemeli
# Sprint 9'da genisletilip listeye geri eklenecek

## Current Status: Sprint 8 Audit Result

**Excluded Matchups: 0**
**Active Matchups: 24**

Sprint 8 pre-audit 99 matchup iddia etmisti — gercek sayi 24. Tum dosyalar:
- 0 scaffolding (tumu temiz)
- 511-634 kelime arasi (hedef 800-1500 altinda ama icerik dolu)
- 5 bolumlu template: Interaction Identity / Punish Patterns / Failure Meaning / AIMLO Says / Rank Modulation
- Hicbiri stub degil — her bolum multi-sentence icerik iceriyor

Exclude etmek icin yeterli neden yok. Hepsi RAG'da fonksiyonel coaching verisi sunuyor.

## Exclusion Criteria (for future reference)
- Word count < 500
- 2+ section one-liner (tek cumlelik bolum)
- Scaffolding markers (****) mevcut
- Quick audit score < 7.0

## Re-inclusion Criteria
- Word count >= 800
- All sections depth >= 3 sentences
- Audit score >= 8.5

## Sprint 9 Backlog: Matchup Expansion

Tum 24 matchup dosyasi 800-1500 kelime hedefine cikarilmali. Oncelik sirasi:

### Priority 1: Agent-specific matchups (genisletme en cok deger katar)
- jett_vs_cypher.md (526w -> 900w)
- jett_vs_chamber.md (528w -> 900w)
- raze_vs_killjoy.md (533w -> 900w)
- sova_vs_killjoy.md (549w -> 900w)
- neon_vs_trap_play.md (561w -> 900w)
- omen_vs_op_setup.md (576w -> 900w)
- kayo_vs_sentinel.md (589w -> 900w)

### Priority 2: Strategic pattern matchups
- anti_retake_setup.md (511w -> 800w)
- anti_op_play.md (516w -> 800w)
- anti_info_defense.md (558w -> 800w)
- anti_default_punish.md (588w -> 800w)
- anti_flood_defense.md (602w -> 800w)
- entry_vs_trap_play.md (582w -> 800w)

### Priority 3: Role matchups
- controller_vs_duelist.md (517w -> 800w)
- initiator_vs_sentinel.md (514w -> 800w)
- duelist_vs_sentinel.md (568w -> 800w)

### Priority 4: New agent matchups
- veto_vs_entry_paths.md (634w -> 900w)
- vyse_vs_dive_comp.md (629w -> 900w)
- clove_vs_retake.md (592w -> 800w)
- tejo_vs_default_defense.md (569w -> 800w)
- miks_vs_anchor_setups.md (585w -> 800w)
- waylay_vs_sentinel.md (587w -> 800w)
- yoru_vs_info_comp.md (587w -> 800w)
- viper_vs_fast_exec.md (600w -> 800w)

Tahmini Sprint 9 matchup genisletme suresi: ~12 saat (24 dosya x ~30dk)
