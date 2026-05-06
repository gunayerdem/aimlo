# Feedback Samples — Overlay Preview (10 fresh outputs)

> 10 KB-aligned samples (5 TR + 5 EN) for overlay display + marketing/screenshots.
> Same schema and voice as docs/audit/feedback-samples-100.md (post-audit baseline 2026-05-05).
> All samples follow 3-field schema: deathAnalysis, enemyAnalysis[2], nextRoundSuggestion. No banned phrases.

---

## Sample 1
**Lang:** TR | **Map:** Pearl | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 8 | **Score:** 3-4
**Death:** B Long, killed by Raze with Vandal (headshot), 60 HP, 2 allies / 4 enemies alive
**Pattern:** 2 rounds — B Long Raze head angle hold
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Long'da default açıyı 2 round'dur tutuyorsun, Raze head açısını tutarak aynı yerden vurdu — sabit kalmamalı, off-angle B Screen'e geçmeliydin.",
  "enemyAnalysis": [
    "Raze B Long'da head açısını tutuyor, peek timing'ini ezberledi ve aynı yerden head buluyor",
    "Düşman B'ye 4 kişi yığıyor, A Main tarafında kimse yok"
  ],
  "nextRoundSuggestion": "B Screen off-angle'a geç, turret'i B Long'a bak — Raze aynı açıyı tutarsa trade'i Screen'den alırsın."
}
```

---

## Sample 2
**Lang:** TR | **Map:** Abyss | **Agent:** Raze (attack) | **Side:** attack | **Round:** 6 | **Score:** 2-3
**Death:** Bridge, killed by Breach Fault Line stun + Vandal, 100 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** force_buy
**Output:**
```json
{
  "deathAnalysis": "Bridge'de Breach Fault Line'a stun yedin ve uçurum kenarındaydın, satchel'ın temizlemedi — stun sesini duyunca anında merkeze çekilmeliydin.",
  "enemyAnalysis": [
    "Breach Bridge stun'unu force-buy round'larında erken açıyor, kenardakileri sabitliyor",
    "Düşman Bridge'i Breach + Op'la kilitliyor, mid kontrolü olmadan split kapalı"
  ],
  "nextRoundSuggestion": "Bridge'e satchel'ı önce at, kenar yerine merkez hattına gir — Breach stun çekerse satchel'la geri kaçarsın, uçuruma düşmezsin."
}
```

---

## Sample 3
**Lang:** TR | **Map:** Lotus | **Agent:** Sova (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** A Main, killed by Killjoy alarm bot + Sheriff (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Main'e drone atmadan girdin, alarm bot bilgini ücretsiz verdi ve Killjoy A Tree'den sheriff'le head buldu — pistol round'da utility temizlemeden açı yoklanmaz.",
  "enemyAnalysis": [
    "Killjoy pistol round'da alarm bot'u A Main koridoruna kuruyor, ilk peek atana bedava bilgi alıyor",
    "Düşman A'ya 3 kişi koyuyor, C Mound zayıf bırakılıyor"
  ],
  "nextRoundSuggestion": "Pistol round'da drone'u A Main'den içeri at, alarm bot'u tespit edip kır — temizse takımca C'ye rotate edip post-plant kazanırsınız."
}
```

---

## Sample 4
**Lang:** TR | **Map:** Bind | **Agent:** Iso (defense) | **Side:** defense | **Round:** 15 | **Score:** 7-7
**Death:** B Site, killed by Yoru ult flank + Sheriff (headshot), 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta Hookah'ya bakarken Yoru ult'la arkandan TP'leyip sheriff'le head buldu — shield'in açık değildi, ses gizleyici sayesinde duyamadın.",
  "enemyAnalysis": [
    "Yoru ult'la A Showers üzerinden B'ye flank atıyor, ses gizleyici sayesinde site içine kadar geliyor",
    "Düşman B'ye direkt baskı kurmadan Yoru flank'ıyla kill alıyor, sonrası rahat execute"
  ],
  "nextRoundSuggestion": "B'de shield'ini açık tut ve site arkasına bak, Yoru TP sesi gelirse molly'ni site içine at — flank'ta tek vurursan trade kapanır."
}
```

---

## Sample 5
**Lang:** TR | **Map:** Haven | **Agent:** Cypher (attack) | **Side:** attack | **Round:** 12 | **Score:** 5-6
**Death:** C Long, killed by Sage with Guardian (headshot), 100 HP, 3 allies / 4 enemies alive
**Pattern:** 3 rounds — C Long Sage Guardian
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "C Long'a 3 round'dur flash'siz peek atıyorsun, Sage Guardian'la aynı açıyı tutuyor ve head buluyor — bu kez de aynı hatayı yaptın.",
  "enemyAnalysis": [
    "Sage C Long'u Guardian'la kilitliyor, mesafe avantajını one-tap için kullanıyor",
    "Düşman C'yi Sage + 1 anchor cross ile tutuyor, A Long tarafı zayıf"
  ],
  "nextRoundSuggestion": "C Long'a takımdan flash iste, Spycam'i A Long'a kur — flash sonrası C'ye yüklenince Sage trade'e fırsat veremez."
}
```

---

## Sample 6
**Lang:** EN | **Map:** Sunset | **Agent:** Sova (attack) | **Side:** attack | **Round:** 14 | **Score:** 7-6
**Death:** B Market, killed by Viper Pit ult, 0 HP, 3 allies / 3 enemies alive
**Pattern:** 2 rounds — Viper Pit B Market
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Viper popped Pit on your B Market entry for the second round in a row — once you hear the ult drop, hold the execute, decay eats your HP before you can hit a shot.",
  "enemyAnalysis": [
    "Viper saves Pit ult for B Market executes, decay drains attacker HP and sets up the retake",
    "Enemy locks B with Viper utility while one lurker watches A Main rotation"
  ],
  "nextRoundSuggestion": "Rotate to A Main the moment you hear Pit drop — Viper burned ult on B, A has no smoke or wall coverage."
}
```

---

## Sample 7
**Lang:** EN | **Map:** Ascent | **Agent:** Sage (attack) | **Side:** attack | **Round:** 5 | **Score:** 1-3
**Death:** A Main, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** eco
**Output:**
```json
{
  "deathAnalysis": "You dry peeked A Main on eco against a Chamber holding the TdF ult angle from A Lobby — eco round, no smoke, no flash, his one-shot was a free kill.",
  "enemyAnalysis": [
    "Chamber holds A Main with Tour de Force on eco rounds, punishes any wide-angle peek for free credits",
    "Enemy stacks Chamber plus one anchor on A, Mid Cubby is the soft side this round"
  ],
  "nextRoundSuggestion": "Skip A on eco and stack Mid through Cubby — Chamber sits A with the ult, your team sneaks B Lane post-plant before he rotates."
}
```

---

## Sample 8
**Lang:** EN | **Map:** Split | **Agent:** Jett (attack) | **Side:** attack | **Round:** 9 | **Score:** 4-4
**Death:** B Tower, killed by Cypher Spycam + trapwire + Vandal, 80 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** force_buy
**Output:**
```json
{
  "deathAnalysis": "You dashed B Tower without clearing utility — the trapwire pinged your entry and Cypher prefired through the Spycam line.",
  "enemyAnalysis": [
    "Cypher locks B Tower with Spycam plus trapwire, anyone entering without info is a free trade",
    "Enemy holds B with only Cypher utility and one anchor, A Main is the lighter side"
  ],
  "nextRoundSuggestion": "Force-buy through A Main this round — Cypher spent his utility on B, A only has the anchor on rotation timing."
}
```

---

## Sample 9
**Lang:** EN | **Map:** Corrode | **Agent:** Omen (defense) | **Side:** defense | **Round:** 17 | **Score:** 9-7
**Death:** A Catwalk, killed by Yoru ult flank + Vandal, 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You held A Catwalk facing Main while Yoru ulted through Mid Pipes and tapped you from behind — without rear utility you never heard the flank.",
  "enemyAnalysis": [
    "Yoru ults through Mid Pipes onto A Catwalk, the sound mask gets him into trade range before you can turn",
    "Enemy holds A with only Yoru flank pressure, no direct push on Main this round"
  ],
  "nextRoundSuggestion": "Drop a paranoia toward Mid Pipes and reposition off Catwalk after first contact — Yoru ults again, the flash blinds his entry and you trade clean."
}
```

---

## Sample 10
**Lang:** EN | **Map:** Abyss | **Agent:** Reyna (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** Bridge, killed by Killjoy alarm bot + Sheriff (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "You walked Bridge on pistol with the alarm bot pinging — Killjoy already had her sheriff lined on the choke and headshot you the moment you crossed.",
  "enemyAnalysis": [
    "Killjoy drops alarm bot on Bridge pistol round, gets free attacker info and a sheriff one-tap window",
    "Enemy stacks 3 on Bridge for pistol, A Ramp is the softer site this round"
  ],
  "nextRoundSuggestion": "Skip Bridge on pistol and stack A Ramp through Main — Killjoy committed utility on Bridge, A only has one defender on rotation."
}
```

---
