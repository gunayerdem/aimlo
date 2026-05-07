# Feedback Samples — Overlay Preview v2 (10 fresh outputs)

> 10 KB-aligned samples (5 TR + 5 EN) for overlay display + marketing/screenshots.
> Same schema and voice as docs/audit/feedback-samples-100.md (post-audit baseline 2026-05-05).
> Post-purge v2 — no overlap with overlay-10.md v1, zero banned phrases, all idiomatic TR/EN.

---

## Sample 1
**Lang:** TR | **Map:** Ascent | **Agent:** Clove (defense) | **Side:** defense | **Round:** 1 | **Score:** 0-0
**Death:** A Heaven, killed by Raze Classic + boombot, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Heaven'da default'ta dururken Raze boombot'u Main'den attı, classic ile temiz vurdu — boombot sesini duyunca Heaven kenarına çekilmeliydin.",
  "enemyAnalysis": [
    "Raze pistol round'da boombot'u A Main'den atıyor, Heaven anchor'ını ücretsiz buluyor",
    "Düşman pistol'de A'ya 3 kişi yığıyor, B Main tarafında bilgi alıcı tek kişi var"
  ],
  "nextRoundSuggestion": "Pistol'de Heaven'da default'tan çık, smoke'unu Main'e at ve Tree off-angle'a geç — Raze boombot kullanırsa görüşü kapanır."
}
```

---

## Sample 2
**Lang:** TR | **Map:** Lotus | **Agent:** Viper (attack) | **Side:** attack | **Round:** 10 | **Score:** 5-4
**Death:** C Site post-plant, killed by Killjoy molly + Vandal, 0 HP, 1 ally / 2 enemies alive
**Pattern:** 2 rounds — Killjoy molly C Mound post-plant
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Spike sonrası C Mound'da kaldın, Killjoy 2 round'dur post-plant molly'sini aynı yere döküyor — Mound'da oyalanmaman lazımdı.",
  "enemyAnalysis": [
    "Killjoy C retake'inde molly'sini Mound'a atıyor, attacker HP'sini bedava eritiyor",
    "Düşman C retake'te 3 kişiyle Tree üzerinden geliyor, kısa rotate hattını kullanıyor"
  ],
  "nextRoundSuggestion": "Spike koyduktan sonra Mound yerine C Hall veya Drop tarafında pozisyon al, wall'unu Tree'ye at — Killjoy molly seni eritemez."
}
```

---

## Sample 3
**Lang:** TR | **Map:** Sunset | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 7 | **Score:** 3-3
**Death:** B Market, killed by Reyna with Vandal, 60 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Market'a yardıma gittin, Reyna site içinde takım arkadaşını alıp dismiss'le Market köşesine geçmiş, sen girişte Vandal'la kafadan vurdu — solo retake'e girmeden trapwire kontrol etmeliydin.",
  "enemyAnalysis": [
    "Reyna B'yi alıp dismiss'le Market köşesine kaçıyor, ikinci kill'i de bedava topluyor",
    "Düşman B'ye 3 kişi yığıyor, A tarafında lurk yok, rotate edebilirdin"
  ],
  "nextRoundSuggestion": "B retake'inde Market girişine trapwire kur, takımdan flash iste — Reyna dismiss'le kaçsa bile tuzak ses verir, trade alırsın."
}
```

---

## Sample 4
**Lang:** TR | **Map:** Pearl | **Agent:** Neon (attack) | **Side:** attack | **Round:** 12 | **Score:** 6-5
**Death:** B Hall, killed by Killjoy Lockdown ult + Vandal, 0 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Hall'a slide'la girdin, Killjoy lockdown'ı önceden site'a kurmuştu ve detained oldun — ult sesini duyunca execute'i ertelemen şarttı.",
  "enemyAnalysis": [
    "Killjoy lockdown'ı B Site'a kuruyor, içeride kalan attacker'ı bedava düşürüyor",
    "Düşman B'ye 2 anchor + Killjoy utility ile yetiniyor, sayı A'da"
  ],
  "nextRoundSuggestion": "Lockdown sesini duyunca B'yi bırak, A Main'e rotate edin — Killjoy ult'u harcadı, A'da utility yok, hızlı execute kazanır."
}
```

---

## Sample 5
**Lang:** TR | **Map:** Bind | **Agent:** Sage (defense) | **Side:** defense | **Round:** 18 | **Score:** 9-8
**Death:** A Showers, killed by Brimstone Stim + Vandal, 80 HP, 2 allies / 4 enemies alive
**Pattern:** 2 rounds — Brim stim + push A Showers
**Economy:** force_buy
**Output:**
```json
{
  "deathAnalysis": "A Showers'ta açıyı tutuyordun, Brimstone 2 round'dur stim atıp Vandal'la sıkı peek atıyor — bu kez slow orb'unu Showers girişine atmamışsın.",
  "enemyAnalysis": [
    "Brimstone stim ile fire-rate'ini hızlandırıp A Showers'a yükleniyor, anchor'ı agresif düşürüyor",
    "Düşman force-buy'a rağmen A'ya 4 kişi yığıyor, B tarafında bilgi alıcı tek kişi var"
  ],
  "nextRoundSuggestion": "A Showers girişine slow orb'unu önceden at, kendi açını Lamps'tan tut — Brim stim'le bile yavaşlar, sen rahat trade alırsın."
}
```

---

## Sample 6
**Lang:** EN | **Map:** Corrode | **Agent:** Iso (attack) | **Side:** attack | **Round:** 2 | **Score:** 0-1
**Death:** Mid, killed by Sova drone + Vandal (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** eco
**Output:**
```json
{
  "deathAnalysis": "You crossed Mid on eco with no shield — Sova droned the choke, his teammate prefired the corner and headshot you on the cross.",
  "enemyAnalysis": [
    "Sova drones Mid every eco round to feed his Vandal anchor a clean prefire angle",
    "Enemy uses Mid info to flex either site, you can't trade across the choke without smoke"
  ],
  "nextRoundSuggestion": "Skip Mid this round and stack B Long with the team — Sova spends drone on Mid, B has no info coverage."
}
```

---

## Sample 7
**Lang:** EN | **Map:** Haven | **Agent:** Tejo (defense) | **Side:** defense | **Round:** 6 | **Score:** 2-3
**Death:** C Long, killed by Jett dash + Operator, 100 HP, 2 allies / 4 enemies alive
**Pattern:** 3 rounds — C Long Jett dash op pick
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Three rounds straight Jett dashes C Long, lines up the Operator and one-taps the C anchor — you swung the same angle and ate the same shot.",
  "enemyAnalysis": [
    "Jett dashes C Long with Operator every round, kills the anchor before trade is possible",
    "Enemy farms one C kill, then runs default through Garage with the player advantage"
  ],
  "nextRoundSuggestion": "Anchor C from C Cubby off-angle and rotate the camera onto C Long — Jett dashes into a clean angle, your teammate trades from inside."
}
```

---

## Sample 8
**Lang:** EN | **Map:** Split | **Agent:** Vyse (defense) | **Side:** defense | **Round:** 14 | **Score:** 7-6
**Death:** A Site, killed by Raze nade, 60 HP, 1 ally / 3 enemies alive
**Pattern:** 2 rounds — Raze nade A default
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You anchored A default for the second round and Raze hit the same nade lineup — twice in a row, default is the burn spot.",
  "enemyAnalysis": [
    "Raze pre-throws nade onto A default before the execute, eats anchor HP for free every round",
    "Enemy commits 4 to A and lurks Vents, the rotate read is always one-sided"
  ],
  "nextRoundSuggestion": "Anchor A from Heaven off-angle and prep your razorvine on Ramps — Raze nade lands on default, you trade her teammate from above."
}
```

---

## Sample 9
**Lang:** EN | **Map:** Abyss | **Agent:** Sage (attack) | **Side:** attack | **Round:** 8 | **Score:** 3-4
**Death:** Bridge, killed by KAY/O knife + Phantom, 100 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "KAY/O threw the knife onto Bridge and tagged you mid-cross — once you're suppressed and pinged, the Phantom anchor had a free Phantom headshot.",
  "enemyAnalysis": [
    "KAY/O lines the knife onto Bridge to suppress and locate every attacker crossing",
    "Enemy holds Bridge with KAY/O utility plus a Phantom anchor, no info means free trades"
  ],
  "nextRoundSuggestion": "Wall off Bridge before crossing to block KAY/O knife sight — once the wall is up, you cross unsuppressed and trade clean."
}
```

---

## Sample 10
**Lang:** EN | **Map:** Lotus | **Agent:** Harbor (attack) | **Side:** attack | **Round:** 15 | **Score:** 7-7
**Death:** C Mound, killed by Sova Hunter's Fury ult, 0 HP, 3 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You stood flat on C Mound when Sova's ult tagged you through the wall — once Hunter's Fury casts, drop into Tree cover, never open Mound.",
  "enemyAnalysis": [
    "Sova drones C, then drops Hunter's Fury onto Mound to clear the entry stack",
    "Enemy holds C with Sova ult timing, anchor trades you the moment the ult lands"
  ],
  "nextRoundSuggestion": "Cascade onto Mound to block Sova drone sight, then split through Tree on the cast — Hunter's Fury walls hit empty Mound, you enter from the angle."
}
```

---
