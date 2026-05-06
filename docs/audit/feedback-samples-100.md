# Feedback Samples — 100 QA Reference Outputs

> Coach voice baseline for `/api/ai/feedback`. Approved by product owner 2026-05-05.
> All samples follow the 3-field schema: `deathAnalysis`, `enemyAnalysis[2]`, `nextRoundSuggestion`.
> No `coachInsight` field. No banned phrases. 1-2 sentences per field.

## Distribution Summary

- **Maps (9):** Ascent (12), Bind (10), Haven (11), Split (11), Lotus (11), Sunset (11), Corrode (11), Pearl (11), Abyss (12)
- **Languages:** Turkish (80), English (20)
- **Sides:** Attack (55), Defense (45)
- **Economy mix:** full_buy dominant, plus force_buy, eco, pistol coverage
- **Patterns:** fresh (no repeat), 2-round repeat, 3-round repeat — all represented
- **Death contexts covered:** dry peek, pre-aim, off-angle hold, post-plant retake, mid-round flank (Yoru ult), eco trade, force-buy push, ult dump (Raze, Breach, KAY/O, Brimstone, Sova, Viper Pit, Chamber TdF)
- **Killers covered:** rifle (Vandal/Phantom), op, ults, utility (molly/flash/breach), close-range pistol/sheriff, turret/trapwire/boombot
- **Audit pass:** zero `trip`, zero `wide swing`, zero `op var`, zero `basın` directives, zero `tek vuruş yetti`, zero `coachInsight` field, zero imperative `yığ`. Descriptive `yığıyor` (3rd-person narration of enemy stacking) preserved as natural Turkish.

---

## Sample 1
**Lang:** TR | **Map:** Ascent | **Agent:** Jett (attack) | **Side:** attack | **Round:** 7 | **Score:** 4-2
**Death:** B Main, killed by Cypher with Operator, 30 HP, 1 ally / 3 enemies alive
**Pattern:** 3 rounds in a row B Main → Cypher Op
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Main'den geniş açıyla peek attın, Cypher seni Heaven'dan operator'la oradan bekliyordu — bir sonraki round o açıyı smoke atmadan deneme, dar açıyla bilgi al önce.",
  "enemyAnalysis": [
    "Cypher tuzaklarını B Main girişine kurmuş, drone veya knife atmadan içeri girersen bilgini hemen alıyorlar",
    "Düşman 3 round'dur B'ye 2-3 kişi yığıyor, A tarafı zayıf kalıyor — bu pattern'i kullanmalısın"
  ],
  "nextRoundSuggestion": "Bu round B'yi bırak, takımca A'dan default ilerleyin — Cypher tuzaklarını B'ye dikti, oradan rotate edip A'yı tutamaz."
}
```

---

## Sample 2
**Lang:** TR | **Map:** Ascent | **Agent:** Sova (attack) | **Side:** attack | **Round:** 3 | **Score:** 1-1
**Death:** A Main, killed by Chamber with Sheriff (headshot), 100 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "A Main'e dry peek attın, Chamber A Lobby tarafından sheriff'le açıyı tutuyordu — pistol round'da bilgi yokken o açıyı tek başına yoklama.",
  "enemyAnalysis": [
    "Chamber pistol round'da sheriff açısı tutuyor, ekonomileri rahat olduğu için cesur peek atıyor",
    "Düşman A'da iki kişi duruyor gibi, B tarafından cross gelmiyor"
  ],
  "nextRoundSuggestion": "Drone'u A Main'den içeri at, Chamber'ın yerini gör — sonra flash'le birlikte execute deneyin, dry peek riskli."
}
```

---

## Sample 3
**Lang:** TR | **Map:** Ascent | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 12 | **Score:** 6-5
**Death:** A Site, killed by Raze with Showstopper ult, 0 HP, 2 allies / 2 enemies alive
**Pattern:** 2 rounds — Raze ult A
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta default anchor pozisyonunda kaldın, Raze ult'la köşeden geldi ve kaçacak alanın yoktu — ult sesini duyunca pozisyonu hemen değiştir.",
  "enemyAnalysis": [
    "Raze 2 round'dur A'ya ult dump'ı yapıyor, anchor'ı temizleyip site'ı açıyor",
    "Düşman A execute öncesi nade'leri pre-throw ediyor, default spot'ları tarıyorlar"
  ],
  "nextRoundSuggestion": "Bu round A'da off-angle tut, default spot'tan çık — Raze ult'unu yine A'ya kullanırsa boş alana atar, sen yan taraftan trade alırsın."
}
```

---

## Sample 4
**Lang:** TR | **Map:** Ascent | **Agent:** Phoenix (attack) | **Side:** attack | **Round:** 9 | **Score:** 4-4
**Death:** Mid Courier, killed by Omen with Vandal, 80 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid Courier'i tek başına yokladın, Omen Mid Cubby'den Vandal'la açıyı tutuyordu — solo mid kontrolü flash'siz risksiz değil.",
  "enemyAnalysis": [
    "Omen mid'de agresif duruyor, takımı bilgi için onu öne sürüyor",
    "Düşman mid alırsa rotate hızı artıyor, mid kontrolünü kaybetmemen lazım"
  ],
  "nextRoundSuggestion": "Mid'e flash'le gir veya Sova drone iste — courier kontrolünü alırsanız B Lane veya Catwalk'a geçiş açılır."
}
```

---

## Sample 5
**Lang:** TR | **Map:** Ascent | **Agent:** KAY/O (defense) | **Side:** defense | **Round:** 14 | **Score:** 7-6
**Death:** B Site, killed by Reyna with Phantom, 50 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site retake'inde knife atmadan girdin, Reyna site içinde köşede bekliyordu ve dismiss'le kaçtı — retake öncesi knife veya flash şart.",
  "enemyAnalysis": [
    "Reyna kill alınca dismiss'le hemen geri çekiliyor, trade alman zorlaşıyor",
    "Düşman B'yi 4 kişi aldı, 1 kişi A tarafında oyalama yapıyordu"
  ],
  "nextRoundSuggestion": "B retake'te knife'ı site içine at, Reyna'nın görüşünü kapat — sonra takımca aynı anda girin, solo retake olmaz."
}
```

---

## Sample 6
**Lang:** TR | **Map:** Ascent | **Agent:** Neon (attack) | **Side:** attack | **Round:** 5 | **Score:** 2-2
**Death:** A Main, killed by Killjoy turret, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** force_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e dash'le girdin, Killjoy turret'i Heaven yakınına kurmuştu ve sen utility temizlemeden geçtin — turret görmeden dash'leme.",
  "enemyAnalysis": [
    "Killjoy turret + alarm bot'u A Main giriş hattına dikiyor, ön bilgi alıyor",
    "Düşman A'da iki anchor tutuyor, force-buy round'da bile setup'larını bozmuyorlar"
  ],
  "nextRoundSuggestion": "A'ya gitmeden önce Sova drone veya KAY/O knife'la turret'i tespit edin — temiz olduğunu görünce dash'le execute edersin."
}
```

---

## Sample 7
**Lang:** TR | **Map:** Ascent | **Agent:** Omen (defense) | **Side:** defense | **Round:** 2 | **Score:** 0-1
**Death:** Mid Top, killed by Jett with Operator, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** eco
**Output:**
```json
{
  "deathAnalysis": "Mid Top'ta peek attın, Jett operator'la mid'i tutuyordu — eco round'da uzun açıyı op'a karşı yoklamak çok riskli.",
  "enemyAnalysis": [
    "Jett operator'la mid'i kontrol ediyor, dash'i hazır olduğu için trade zor",
    "Düşman ekonomisi yüksek, eco round'umuzda agresif oynuyorlar"
  ],
  "nextRoundSuggestion": "Eco round'da mid'i bırak, A veya B site'a yüklenin — Jett op'la tek tutamaz, yakın mesafede sheriff'le bile baskı kurarsınız."
}
```

---

## Sample 8
**Lang:** TR | **Map:** Ascent | **Agent:** Breach (attack) | **Side:** attack | **Round:** 11 | **Score:** 5-5
**Death:** B Site post-plant, killed by Viper molly, 0 HP, 1 ally / 1 enemy alive
**Pattern:** 2 rounds — Viper molly aynı spot
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Spike sonrası B Default'ta kaldın, Viper aynı spot'a 2 round'dur molly atıyor — o köşede oyalanmaman lazımdı.",
  "enemyAnalysis": [
    "Viper post-plant molly'sini Default'a atıyor, 50 HP eritip retake'i kolaylaştırıyor",
    "Düşman B retake'te 3 kişiyle geliyor, kısa rotate hattını kullanıyorlar"
  ],
  "nextRoundSuggestion": "Spike koyduktan sonra Default yerine CT veya Tube tarafında pozisyon al — Viper molly'si seni eritemez, retake gelirse trade alırsın."
}
```

---

## Sample 9
**Lang:** TR | **Map:** Ascent | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 16 | **Score:** 8-7
**Death:** A Heaven, killed by Yoru ult flank, 100 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Heaven'da mid'e bakarken arkandan Yoru ult'la geldi — Heaven'da tutarken arkanı tuzakla kapatmadığın için bilgi almadın.",
  "enemyAnalysis": [
    "Yoru ult'la flank atıyor, ses gizleyici sayesinde yakın mesafeye kadar geliyor",
    "Düşman A'ya direkt baskı kurmadan flank kuruyor, bilgi almak için takım sabırlı"
  ],
  "nextRoundSuggestion": "Heaven arkasına trapwire koy, mid'den gelen flank'ı yakala — Yoru ult bile kullansa tuzak ses verir, çevirip vurursun."
}
```

---

## Sample 10
**Lang:** TR | **Map:** Ascent | **Agent:** Reyna (attack) | **Side:** attack | **Round:** 6 | **Score:** 3-2
**Death:** A Catwalk, killed by Sage with Guardian, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — Catwalk Sage hold
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Catwalk'a girerken Sage Tree'den Guardian'la açıyı tutuyordu, 2 round'dur aynı açıyı tutuyor — bu round flash'siz yine peek attın.",
  "enemyAnalysis": [
    "Sage Catwalk'ta Guardian'la one-tap kovalıyor, mesafe avantajını kullanıyor",
    "Düşman A'yı Tree + Heaven cross ile kilitliyor, tek peek'le açılmaz"
  ],
  "nextRoundSuggestion": "Catwalk'a flash'le gir, Sage'in görüşünü kapat — Tree'deki Sage'i flash'lediğinde dismiss'le sonrası temiz olur."
}
```

---

## Sample 11
**Lang:** EN | **Map:** Ascent | **Agent:** Skye (attack) | **Side:** attack | **Round:** 4 | **Score:** 2-1
**Death:** B Lane, killed by Sova Hunter's Fury ult, 60 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You stood flat in B Lane when Sova's ult tagged you through the wall — once you hear Hunter's Fury, drop into Tube or hug a corner, never the open lane.",
  "enemyAnalysis": [
    "Sova clears B Lane with ult after taking mid info, very economical use",
    "Enemy locks B through mid control, no direct pressure on B Lane itself"
  ],
  "nextRoundSuggestion": "Don't stand flat in B Lane — push into Tube or rotate the corner so Sova's ult walls miss you next round."
}
```

---

## Sample 12
**Lang:** EN | **Map:** Ascent | **Agent:** Chamber (defense) | **Side:** defense | **Round:** 18 | **Score:** 10-7
**Death:** A Site, killed by Raze nade, 80 HP, 1 ally / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You held A Site default with no fallback when Raze pre-fragged your spot — once the nade lands you need to reposition off-angle, not stay on default.",
  "enemyAnalysis": [
    "Raze pre-throws her nade onto A default before executing, eats anchor HP for free",
    "Enemy commits 4 to A and leaves mid open, you can hear the rotation timing clearly"
  ],
  "nextRoundSuggestion": "Anchor A from Generator off-angle next round — Raze nade hits default, you trade her teammate when they push in."
}
```

---

## Sample 13
**Lang:** TR | **Map:** Bind | **Agent:** Raze (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** A Short, killed by Viper with Ghost (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Short'a dry peek attın, Viper Showers'tan ghost'la açıyı tutuyordu — pistol round'da bilgi olmadan açı yoklamak ekonomi katlediyor.",
  "enemyAnalysis": [
    "Viper Showers'tan ghost açısı tutuyor, A defansını tek başına kapatıyor",
    "Düşman pistol'de A'da iki kişi tutuyor, B Long zayıf"
  ],
  "nextRoundSuggestion": "Pistol round'da B Long'a yüklenin, Viper A'da sabit duruyor — rotate gelene kadar spike koyup post-plant kazanırsınız."
}
```

---

## Sample 14
**Lang:** TR | **Map:** Bind | **Agent:** Brimstone (defense) | **Side:** defense | **Round:** 8 | **Score:** 3-4
**Death:** B Site, killed by Skye flash + Phantom, 100 HP, 2 allies / 3 enemies alive
**Pattern:** 2 rounds — Skye flash B Hookah
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta Hookah'ya bakıyordun, Skye flash'i 2 round'dur aynı yerden atıyor ama yine flash'lendin — flash sesini duyunca dön veya köşeye gir.",
  "enemyAnalysis": [
    "Skye Hookah girişinde flash + push yapıyor, anchor'ı pop'lamadan içeri girmiyor",
    "Düşman B'ye 3 kişi yığıyor, A Short tarafında lurk yok"
  ],
  "nextRoundSuggestion": "B'de Hookah açısını flash'lendiğinde dönüp Default'a çekil — molly'ni Hookah girişine sakla, push gelirse eritirsin."
}
```

---

## Sample 15
**Lang:** TR | **Map:** Bind | **Agent:** Yoru (attack) | **Side:** attack | **Round:** 13 | **Score:** 6-6
**Death:** A Showers, killed by Cypher trapwire + Vandal, 100 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Showers'a Teleport'suz girdin, Cypher tuzakları su girişinde patladı ve Vandal'la cross'tan vurdu — Showers'a girerken tuzakları temizlemen şart.",
  "enemyAnalysis": [
    "Cypher tuzaklarını Showers su geçişine kuruyor, A'ya giren herkesi açığa çıkarıyor",
    "Düşman A'da Cypher + Vandal cross kuruyor, tek peek'le açılmıyor"
  ],
  "nextRoundSuggestion": "A'ya gitmeden Sova dart veya KAY/O knife'la Showers tuzaklarını tespit edin — temizse Yoru TP'yle hızlı execute basarsınız."
}
```

---

## Sample 16
**Lang:** TR | **Map:** Bind | **Agent:** Viper (defense) | **Side:** defense | **Round:** 6 | **Score:** 2-3
**Death:** A Site, killed by Breach Rolling Thunder ult, 0 HP, 1 ally / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta default anchor'da kaldın, Breach ult'u tüm site'ı kapsadı ve kaçamadın — ult sesini duyunca Lamps veya CT'ye geç.",
  "enemyAnalysis": [
    "Breach A execute'unda ult'u açıyor, anchor'ı stun'layıp temiz giriyorlar",
    "Düşman A'ya 4 kişi yığıyor, B'de bilgi alıcı tek kişi var"
  ],
  "nextRoundSuggestion": "A'da Lamps off-angle'da dur, ult'a karşı kaçacak alanın olur — Breach ult basarsa Lamps'tan trade alırsın."
}
```

---

## Sample 17
**Lang:** EN | **Map:** Bind | **Agent:** Fade (attack) | **Side:** attack | **Round:** 10 | **Score:** 4-5
**Death:** B Hookah, killed by Killjoy alarm bot + lockdown ult, 0 HP, 3 allies / 3 enemies alive
**Pattern:** 3 rounds — B Hookah Killjoy setup
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You ran B Hookah the same way three rounds straight — Killjoy's lockdown was pre-cast and the alarm bot pinged before you could react, you needed to back out the moment ult dropped.",
  "enemyAnalysis": [
    "Killjoy pre-casts lockdown in B Hookah, anyone inside is detained for free",
    "Enemy holds B with only Killjoy plus Cypher utility, numbers are stacked on A"
  ],
  "nextRoundSuggestion": "Drop B this round and execute through A Short — Killjoy's ult is anchored on B, she can't rotate the lockdown to A."
}
```

---

## Sample 18
**Lang:** TR | **Map:** Bind | **Agent:** Sage (defense) | **Side:** defense | **Round:** 4 | **Score:** 1-2
**Death:** A Lamps, killed by Phoenix flash + Vandal, 80 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Lamps'tan Showers'a peek attın, Phoenix flash atıp pop'tan vurdu — Lamps'ta flash sesini duyunca dönüp slow orb'unu Showers'a atmalıydın.",
  "enemyAnalysis": [
    "Phoenix Showers girişinde flash + peek combo yapıyor, anchor'ları teker teker alıyor",
    "Düşman A'ya 3 kişiyle baskı kuruyor, mid'den ses gelmiyor"
  ],
  "nextRoundSuggestion": "A Lamps'ta flash'i duyduğunda dön ve slow orb'unu Showers giriş hattına at — Phoenix yavaşlar, sen trade alırsın."
}
```

---

## Sample 19
**Lang:** TR | **Map:** Bind | **Agent:** Iso (attack) | **Side:** attack | **Round:** 14 | **Score:** 7-6
**Death:** Bath, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Bath'tan B'ye geçerken Chamber ult'la uzun açıyı tutuyordu, shield'in açık değildi — ult sesini duyunca shield aç ve dar açıyla geç.",
  "enemyAnalysis": [
    "Chamber ult'unu Bath uzun hattına bekliyor, hızlı rotate'i one-shot'la cezalandırıyor",
    "Düşman B Hookah'da 2 kişi tutuyor, A defansı zayıf"
  ],
  "nextRoundSuggestion": "Bath'tan geçmeden shield'i aç, Chamber ult bile vursa one-shot olmaz — sonrası takımca B execute, A'da kimse yok."
}
```

---

## Sample 20
**Lang:** EN | **Map:** Bind | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 21 | **Score:** 11-9
**Death:** B Hookah, killed by Raze Showstopper ult, 0 HP, 2 allies / 3 enemies alive
**Pattern:** 2 rounds — Raze ult B
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You held B Hookah default and Raze ulted you in the same spot for the second round — once you hear Showstopper, swap to Truck or CT off-angle.",
  "enemyAnalysis": [
    "Raze burns ult on B Hookah anchor, clears the default hold for a free site take",
    "Enemy stacks 3 on B and lurks 1 through A Showers, rotation timing is tight"
  ],
  "nextRoundSuggestion": "Set trapwire on Hookah entry and play Truck off-angle — when Raze ults default, your trap pings and you trade from the side."
}
```

---

## Sample 21
**Lang:** TR | **Map:** Bind | **Agent:** Gekko (attack) | **Side:** attack | **Round:** 17 | **Score:** 8-8
**Death:** A Short, killed by Brimstone Orbital Strike ult, 0 HP, 2 allies / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Short'ta toplandığınızda Brimstone ult'u tepenize indi — ult sesini duyunca dağılıp Showers veya Bath'a geçmeniz şarttı.",
  "enemyAnalysis": [
    "Brimstone A Short stack'ini ult'la cezalandırıyor, 3-4 kişi toplandığını duyunca anında basıyor",
    "Düşman A'da Brim + anchor cross kuruyor, ult sonrası retake kolay"
  ],
  "nextRoundSuggestion": "A Short'ta toplanmayın, Mollie atıp 2-2 dağılın — Brim ult'u stack görmezse boşa gider, sonrası temiz execute."
}
```

---

## Sample 22
**Lang:** TR | **Map:** Bind | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 19 | **Score:** 9-9
**Death:** B Site, killed by Jett dash + Operator, 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta turret'in arkasında dururken Jett operator'la Hookah'dan dash'leyip vurdu — Jett'in dash mesafesini hesaba katıp daha geride durmalıydın.",
  "enemyAnalysis": [
    "Jett operator + dash combo'sunu Hookah'dan kullanıyor, anchor'a tek kurşun yetiyor",
    "Düşman B'ye yüklenmek yerine Jett'le kill alıyor, sonrası rahat execute"
  ],
  "nextRoundSuggestion": "B'de Jett kill'ine karşı turret'i Hookah'ya bak, anchor'lığını CT'ye çek — Jett dash'leyip kill alamaz, op açısı kapanır."
}
```

---

## Sample 23
**Lang:** TR | **Map:** Haven | **Agent:** Sova (attack) | **Side:** attack | **Round:** 2 | **Score:** 1-0
**Death:** A Long, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** eco
**Output:**
```json
{
  "deathAnalysis": "Eco round'da A Long'u dry peek attın, Chamber ult'la açıyı tutuyordu — eco round'da uzun açı op'a karşı yoklanmaz.",
  "enemyAnalysis": [
    "Chamber A Long'u ult'la kilitliyor, eco round'larda agresif tutuyor",
    "Düşman A'ya 2 kişi koyuyor, C Long zayıf duruyor"
  ],
  "nextRoundSuggestion": "Eco'da A'yı bırak, C Long'a yüklenin — Chamber A'da kalır, C'de short rotate'le yetişemezler."
}
```

---

## Sample 24
**Lang:** TR | **Map:** Haven | **Agent:** Astra (defense) | **Side:** defense | **Round:** 5 | **Score:** 2-2
**Death:** B Site, killed by Sova Hunter's Fury ult, 70 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — Sova ult B
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta default tutuyordun, Sova 2 round'dur aynı duvardan ult atıyor — ult animasyonunu duyunca pozisyon değiştir, sabit kalma.",
  "enemyAnalysis": [
    "Sova ult'unu B Garage tarafından atıyor, default spot'ları tarıyor",
    "Düşman B'ye 3 kişi yığıyor, A ve C tarafında lurk yok"
  ],
  "nextRoundSuggestion": "B'de off-angle Window veya Back tarafına geç, Sova ult'u default'u tarar — sen yan taraftan çıkar trade alırsın."
}
```

---

## Sample 25
**Lang:** TR | **Map:** Haven | **Agent:** Jett (attack) | **Side:** attack | **Round:** 8 | **Score:** 4-3
**Death:** C Long, killed by Cypher trapwire + Vandal, 50 HP, 3 allies / 3 enemies alive
**Pattern:** 3 rounds — C Long Cypher tuzak
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "C Long'a girerken tuzakları temizlemeden geçtin, 3 round'dur aynı yerde Cypher tuzaklıyor — bu kez drone veya knife şarttı.",
  "enemyAnalysis": [
    "Cypher tuzakları C Long girişinde, dronesiz giren herkesi açığa çıkarıyor",
    "Düşman C'yi sadece Cypher utility ile kapatıyor, A'da 3 kişi var"
  ],
  "nextRoundSuggestion": "C Long'a Sova drone veya KAY/O knife'la önce gir, tuzakları temizle — sonra dash'le hızlı kill alırsın, takım arkadan execute basar."
}
```

---

## Sample 26
**Lang:** TR | **Map:** Haven | **Agent:** Phoenix (defense) | **Side:** defense | **Round:** 11 | **Score:** 5-5
**Death:** A Site, killed by Reyna with Phantom, 80 HP, 2 allies / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site retake'inde flash atmadan girdin, Reyna site içinde köşede bekliyordu — retake'te flash veya wall şart, dry peek olmaz.",
  "enemyAnalysis": [
    "Reyna A Site içinde köşe tutuyor, kill alıp dismiss ile kaçıyor",
    "Düşman A'yı 3 kişiyle aldı, B'de tek kişi oyalama yapıyor"
  ],
  "nextRoundSuggestion": "A retake'inde flash'ı önce sen at, takımca aynı anda gir — Reyna kill alıp kaçamaz, trade kolay."
}
```

---

## Sample 27
**Lang:** EN | **Map:** Haven | **Agent:** Breach (attack) | **Side:** attack | **Round:** 15 | **Score:** 7-7
**Death:** A Short, killed by KAY/O Null Cmd ult, 0 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "KAY/O dropped Null Cmd as you stepped into A Short, you got suppressed and lost all your utility on the entry — when you hear the ult cast, hold the execute and reset.",
  "enemyAnalysis": [
    "KAY/O times Null Cmd to attacker pushes on A, kills your utility for the entry",
    "Enemy holds A with 3 and trades the ult, they're ready for the swing"
  ],
  "nextRoundSuggestion": "Pull off A when KAY/O ults and rotate to B — he burned the ult, B has no utility coverage left."
}
```

---

## Sample 28
**Lang:** TR | **Map:** Haven | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 17 | **Score:** 9-7
**Death:** C Site, killed by Raze nade + boombot, 50 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "C Site'ta default'ta kaldın, Raze boombot + nade combo'su seni eritti — boombot sesini duyunca pozisyon değiştirmen gerekiyordu.",
  "enemyAnalysis": [
    "Raze C Site'a önce boombot, sonra nade atıyor, default anchor HP'sini bitiriyor",
    "Düşman C'ye 3 kişi yığıyor, A'da kimse yok"
  ],
  "nextRoundSuggestion": "C'de turret'i C Long'a bak, anchor'lığını Logs off-angle'a çek — Raze nade default'u eritir, sen yan taraftan trade alırsın."
}
```

---

## Sample 29
**Lang:** TR | **Map:** Haven | **Agent:** Omen (attack) | **Side:** attack | **Round:** 6 | **Score:** 3-2
**Death:** Mid Doors, killed by Viper with Vandal (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid Doors'a smoke atmadan peek attın, Viper Mid Window'dan Vandal'la açıyı tutuyordu — mid kontrolü smoke'suz olmaz.",
  "enemyAnalysis": [
    "Viper Mid Window'dan agresif tutuyor, mid'i tek başına kapatıyor",
    "Düşman mid'i kaybederse rotate çok zor, mid kontrol kritik"
  ],
  "nextRoundSuggestion": "Mid'e smoke'unu Window önüne at, Viper'ın görüşünü kapat — sonra takımca B Garage'a geçiş yapın, rotate kapalı."
}
```

---

## Sample 30
**Lang:** EN | **Map:** Haven | **Agent:** Skye (attack) | **Side:** attack | **Round:** 9 | **Score:** 4-4
**Death:** C Long, killed by Chamber with Sheriff (headshot), 100 HP, 4 allies / 4 enemies alive
**Pattern:** 2 rounds — C Long Chamber sheriff
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You dry peeked C Long for the second round straight — Chamber held the same sheriff angle and pre-aimed your head, you needed flash or info before swinging.",
  "enemyAnalysis": [
    "Chamber holds C Long with sheriff and trades into trap when you push without info",
    "Enemy plays 2 on C and 2 mid, A is the weak side this half"
  ],
  "nextRoundSuggestion": "Drop C this round and default through A Long — Chamber sits on C, rotation is too slow to cover both sites."
}
```

---

## Sample 31
**Lang:** TR | **Map:** Haven | **Agent:** Gekko (defense) | **Side:** defense | **Round:** 14 | **Score:** 7-6
**Death:** B Site, killed by Yoru flash + Vandal, 100 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta default'ta dururken Yoru köşeden flash atıp Vandal'la vurdu — flash sesini duyunca dön veya köşeye gir.",
  "enemyAnalysis": [
    "Yoru B Site içine TP atıp flank'tan flash + peek atıyor",
    "Düşman B'yi 3 kişi tutuyor, A ve C zayıf bırakılıyor"
  ],
  "nextRoundSuggestion": "B'de Wingman'i B Window'a bak, Yoru flank'ını yakala — TP sesi gelirse dönüp molly'ni at, flash atamaz."
}
```

---

## Sample 32
**Lang:** TR | **Map:** Haven | **Agent:** Sage (attack) | **Side:** attack | **Round:** 19 | **Score:** 10-8
**Death:** A Long, killed by Chamber sheriff (headshot), 100 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Long'a geniş açıyla peek attın, Chamber sheriff'le aynı açıdan kafadan vuruyordu — Chamber'a karşı dar açıyla shoulder peek at.",
  "enemyAnalysis": [
    "Chamber A Long'u sheriff açısı tutuyor, ekonomik şekilde kill alıyor",
    "Düşman A'da Chamber + 1 anchor, C tarafı zayıf"
  ],
  "nextRoundSuggestion": "A Long'da Chamber'a slow orb at, peek mesafesini bozarsın — sonrası takımca yüklenince Chamber kaçamaz."
}
```

---

## Sample 33
**Lang:** TR | **Map:** Haven | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 22 | **Score:** 12-9
**Death:** Mid Window, killed by Sova drone + Vandal, 80 HP, 1 ally / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid Window'da agresif tuttun, Sova drone bilgini aldı ve takımı aynı anda peek attı — drone'u görünce hemen pozisyon değiştir.",
  "enemyAnalysis": [
    "Sova mid'i drone'la temizliyor, info alıp takımı koordine peek attırıyor",
    "Düşman mid kontrolüyle hem A hem C'ye baskı kuruyor"
  ],
  "nextRoundSuggestion": "Mid Window'da sabit durma, drone sesi gelince dön ve cam koridoruna düş — Sova bilgi alır ama trade'e fırsat olmaz."
}
```

---

## Sample 34
**Lang:** TR | **Map:** Split | **Agent:** Raze (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** A Main, killed by Cypher with Classic + trapwire, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Main'e dry peek attın, Cypher trapwire'a takıldın ve classic'le head'le buldu — pistol round'da utility temizlemeden açı yoklama.",
  "enemyAnalysis": [
    "Cypher A Main'e trapwire kuruyor, ilk peek atana ücretsiz bilgi alıyor",
    "Düşman pistol'de A'da iki kişi tutuyor, B Tower zayıf"
  ],
  "nextRoundSuggestion": "Pistol round'da B'ye yüklenin, Cypher A'da kalır — boombot'u Tube'a at, B Site rahat alınır."
}
```

---

## Sample 35
**Lang:** TR | **Map:** Split | **Agent:** Omen (defense) | **Side:** defense | **Round:** 4 | **Score:** 2-1
**Death:** A Heaven, killed by Jett with Operator, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — A Heaven Jett op
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Heaven'da peek attın, Jett 2 round'dur Ramps'tan operator açısı tutuyor — bu kez smoke atmadan tekrar denedin.",
  "enemyAnalysis": [
    "Jett A Ramps'tan operator'la Heaven'ı kilitliyor, dash'i hazır olduğu için trade zor",
    "Düşman A'ya 3 kişi yığıyor, B tarafı zayıf"
  ],
  "nextRoundSuggestion": "A Heaven'a smoke at, Jett'in op açısını kapat — sonra Ramps'a takımca yüklenirseniz dash'leyemez."
}
```

---

## Sample 36
**Lang:** EN | **Map:** Split | **Agent:** Sova (attack) | **Side:** attack | **Round:** 7 | **Score:** 3-3
**Death:** Mid Mail, killed by Killjoy turret + alarm bot, 60 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You stepped into Mid Mail with the alarm bot pinging and turret already on you — clear utility before you cross, never push through a live setup.",
  "enemyAnalysis": [
    "Killjoy stacks alarm bot and turret on Mid, no attacker info is free",
    "Enemy uses mid control to rotate either site fast, mid is the choke this map"
  ],
  "nextRoundSuggestion": "Drone Mid Mail before you push, kill the Killjoy utility — once mid is clean, B Tower opens up."
}
```

---

## Sample 37
**Lang:** TR | **Map:** Split | **Agent:** Phoenix (defense) | **Side:** defense | **Round:** 10 | **Score:** 5-4
**Death:** B Site, killed by Skye flash + Vandal, 100 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta default'ta dururken Skye Tube tarafından flash atıp Vandal'la temiz vurdu — flash sesini duyunca dönmeli veya köşeye girmeliydin.",
  "enemyAnalysis": [
    "Skye B Tube'dan flash + push yapıyor, anchor'ı flash'leyip teker teker alıyor",
    "Düşman B'ye 3 kişi yığıyor, A defansı zayıf"
  ],
  "nextRoundSuggestion": "B'de Tube'a flash atıldığında dön ve molly'ni Tube girişine at — Skye eritilir, takım trade alır."
}
```

---

## Sample 38
**Lang:** TR | **Map:** Split | **Agent:** Jett (attack) | **Side:** attack | **Round:** 13 | **Score:** 6-6
**Death:** B Tower, killed by Viper Pit ult, 0 HP, 3 allies / 3 enemies alive
**Pattern:** 2 rounds — Viper Pit ult B
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Tower'a girerken Viper Pit ult'u patladı, decay yedin ve dash'in temizlemedi — Pit ult sesini duyunca execute'i ertele.",
  "enemyAnalysis": [
    "Viper Pit ult'unu B execute'larında patlatıyor, decay'le HP eritip retake'i kolaylaştırıyor",
    "Düşman B'yi Viper utility ile kapatıyor, sayı avantajı A'da"
  ],
  "nextRoundSuggestion": "B Tower'da Viper Pit görünce A'ya rotate edin — Viper ult harcadı, A'da utility yok."
}
```

---

## Sample 39
**Lang:** TR | **Map:** Split | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 16 | **Score:** 8-7
**Death:** A Rope, killed by Yoru ult flank + Vandal, 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Rope'ta Heaven'a bakarken Yoru ult'la arkandan geldi — Rope'ta tutarken arkanı tuzakla kapatmamışsın, Yoru ult'una hazırlıksızdın.",
  "enemyAnalysis": [
    "Yoru ult'la mid'den A'ya flank atıyor, ses gizleyici sayesinde yakına kadar geliyor",
    "Düşman A'ya direkt baskı yok, Yoru flank'ıyla kill alıp sonra execute basıyorlar"
  ],
  "nextRoundSuggestion": "Rope arkasına trapwire koy, Yoru flank'ını yakala — ult kullansa bile tuzak ses verir, dönüp vurursun."
}
```

---

## Sample 40
**Lang:** TR | **Map:** Split | **Agent:** Reyna (attack) | **Side:** attack | **Round:** 17 | **Score:** 8-8
**Death:** A Ramps, killed by Sage Guardian, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 3 rounds — Ramps Sage Guardian
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Ramps'ta 3 round'dur Sage Guardian'la açıyı tutuyor ve sen yine flash'siz peek attın — Sage'in açısına flash atmadan girilmez.",
  "enemyAnalysis": [
    "Sage Ramps'ı Guardian'la one-tap kovalıyor, mesafe avantajını agresif kullanıyor",
    "Düşman A'da Sage + Heaven anchor cross kuruyor"
  ],
  "nextRoundSuggestion": "A Ramps'a takımdan flash iste, Sage'in görüşünü kapat — sonrası Ramps kontrolü, dismiss'le hızlı yüklen."
}
```

---

## Sample 41
**Lang:** EN | **Map:** Split | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 20 | **Score:** 11-8
**Death:** B Site, killed by Raze Showstopper ult, 0 HP, 1 ally / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You sat on B default with the turret in front of you when Raze ulted — once you hear Showstopper, swap to Back Site or CT, default is the obvious clear.",
  "enemyAnalysis": [
    "Raze burns ult on B default to one-shot the anchor and open the site",
    "Enemy commits 4 to B and lurks Vents, your rotate from A is exposed"
  ],
  "nextRoundSuggestion": "Anchor B from Back Site off-angle and put turret on Tube — Raze ult clears default, your trap pings the trade."
}
```

---

## Sample 42
**Lang:** TR | **Map:** Split | **Agent:** Brimstone (attack) | **Side:** attack | **Round:** 22 | **Score:** 11-10
**Death:** A Main, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'den dry peek attın, Chamber ult'la one-shot açısını tutuyordu — ult'a karşı smoke atmadan açı yoklama.",
  "enemyAnalysis": [
    "Chamber A Main'i ult'la kilitliyor, eko avantajı için kullanıyor",
    "Düşman A'ya Chamber + 1 anchor koyuyor, B'de utility yok"
  ],
  "nextRoundSuggestion": "A Main'i smoke'la kapat, Chamber'ın ult açısını kör et — sonrası takımca yüklenirseniz Chamber kaçamaz."
}
```

---

## Sample 43
**Lang:** TR | **Map:** Split | **Agent:** Astra (defense) | **Side:** defense | **Round:** 6 | **Score:** 2-3
**Death:** A Site, killed by Breach Rolling Thunder ult, 0 HP, 2 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** force_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta default tutuyordun, Breach ult'u tüm site'ı taradı ve stun yedin — ult sesini duyunca Heaven veya Screens'e geçmeliydin.",
  "enemyAnalysis": [
    "Breach A execute'unda ult açıyor, anchor'ları stun'layıp temiz giriyorlar",
    "Düşman A'ya 4 kişi yığıyor, force-buy ekonomilerini riske atıyorlar"
  ],
  "nextRoundSuggestion": "A'da Heaven off-angle'da dur, Breach ult'una karşı kaçacak alan olur — ult basarsa Heaven'dan trade alırsın."
}
```

---

## Sample 44
**Lang:** TR | **Map:** Split | **Agent:** Sova (attack) | **Side:** attack | **Round:** 11 | **Score:** 5-5
**Death:** B Tower, killed by Cypher Spycam + Vandal, 50 HP, 3 allies / 3 enemies alive
**Pattern:** 2 rounds — B Tower Cypher cam
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Tower'a girerken Cypher Spycam'i 2 round'dur aynı yerden bilgi alıyor — drone atmadan veya cam'i kırmadan girmemeliydin.",
  "enemyAnalysis": [
    "Cypher Spycam'i B Tower'a yerleştirip tuzaklar üzerinden çift bilgi alıyor",
    "Düşman B'yi sadece Cypher utility ile kapatıyor, sayı A'da"
  ],
  "nextRoundSuggestion": "B Tower'a girmeden drone'u önce at, Spycam'i tespit et — kırarsan info kapanır, takım rahat execute basar."
}
```

---

## Sample 45
**Lang:** TR | **Map:** Lotus | **Agent:** Chamber (defense) | **Side:** defense | **Round:** 1 | **Score:** 0-0
**Death:** A Site, killed by Raze with Classic + boombot, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Site'ta default'ta dururken Raze boombot'u atıp seni eritti — boombot sesini duyunca pozisyon değiştirmeliydin.",
  "enemyAnalysis": [
    "Raze pistol round'da boombot'u A Main'den atıyor, anchor'ı bedava buluyor",
    "Düşman A'ya 3 kişi yığıyor, B ve C tarafı zayıf"
  ],
  "nextRoundSuggestion": "Pistol round'da A'da Tree off-angle'a geç, boombot'a karşı kaçacak alan olur — Raze boş yere kullanır."
}
```

---

## Sample 46
**Lang:** TR | **Map:** Lotus | **Agent:** Fade (attack) | **Side:** attack | **Round:** 4 | **Score:** 2-1
**Death:** A Main, killed by Killjoy alarm bot + Vandal, 70 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e girerken Killjoy alarm bot'u ses verdi ve sen utility temizlemeden devam ettin — alarm bot sesini duyunca durup temizle.",
  "enemyAnalysis": [
    "Killjoy A Main'e alarm bot kuruyor, attacker bilgisini ücretsiz alıyor",
    "Düşman A'yı Killjoy utility + 2 anchor ile kapatıyor"
  ],
  "nextRoundSuggestion": "A Main'e girmeden önce Prowler at, Killjoy utility'sini tespit edin — temizleyince hızlı execute basarsın."
}
```

---

## Sample 47
**Lang:** EN | **Map:** Lotus | **Agent:** Skye (attack) | **Side:** attack | **Round:** 7 | **Score:** 3-3
**Death:** B Main, killed by Viper with Vandal, 100 HP, 4 allies / 5 enemies alive
**Pattern:** 3 rounds — B Main Viper hold
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Three rounds straight you peeked B Main with no flash — Viper sits behind her wall with Vandal pre-aim, you needed a flash or to swap sites entirely.",
  "enemyAnalysis": [
    "Viper locks B Main with wall plus Vandal cross, no info hands her free kills",
    "Enemy stacks Viper plus one anchor on B, A and C are the soft sides"
  ],
  "nextRoundSuggestion": "Drop B and default through A — Viper burned utility on B, she has nothing on A."
}
```

---

## Sample 48
**Lang:** TR | **Map:** Lotus | **Agent:** Harbor (defense) | **Side:** defense | **Round:** 9 | **Score:** 4-4
**Death:** C Site, killed by Reyna with Vandal, 80 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "C Site retake'inde flash atmadan girdin, Reyna site içinde köşede bekliyordu ve dismiss'le kaçtı — retake'te dry peek olmaz.",
  "enemyAnalysis": [
    "Reyna C Site içinde köşe tutuyor, kill alıp dismiss ile yok oluyor",
    "Düşman C'yi 4 kişi aldı, B'de bilgi alıcı tek kişi var"
  ],
  "nextRoundSuggestion": "C retake'inde wall'unu Reyna'nın üstüne at, görüşünü kapat — takımca aynı anda girince kaçamaz, trade temiz."
}
```

---

## Sample 49
**Lang:** TR | **Map:** Lotus | **Agent:** Yoru (attack) | **Side:** attack | **Round:** 12 | **Score:** 6-5
**Death:** Mid Top, killed by Sova drone + Hunter's Fury ult, 50 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid Top'ta Sova drone'u bilgini aldı, ardından ult'la duvardan vurdu — drone sesini duyunca pozisyon değiştirmen gerekiyordu.",
  "enemyAnalysis": [
    "Sova mid kontrolünü drone + ult combo'suyla alıyor, attacker'ı uzaktan eritiyor",
    "Düşman mid'den hem A hem C'ye baskı kurabiliyor"
  ],
  "nextRoundSuggestion": "Mid Top'tan TP'yle yan tarafa kaç, Sova ult'u boşa atar — sonrası A Main'den execute, mid'i bilgi için bırak."
}
```

---

## Sample 50
**Lang:** TR | **Map:** Lotus | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 15 | **Score:** 7-7
**Death:** A Site, killed by Jett dash + Operator, 100 HP, 1 ally / 3 enemies alive
**Pattern:** 2 rounds — A Jett op pick
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta default'ta dururken Jett A Main'den operator'la dash'leyip vurdu, 2 round'dur aynı kill'i alıyor — daha geride veya off-angle dur.",
  "enemyAnalysis": [
    "Jett A Main'den dash + op combo'suyla anchor kill'i alıyor",
    "Düşman A pick sonrası rahat execute basıyor, sayı dezavantajı oluşturuyorlar"
  ],
  "nextRoundSuggestion": "A'da default'tan çık, Tree off-angle'a geç ve trapwire'ı Main'e kur — Jett dash'lese bile tuzak ses verir, op açısı kapanır."
}
```

---

## Sample 51
**Lang:** TR | **Map:** Lotus | **Agent:** Phoenix (attack) | **Side:** attack | **Round:** 17 | **Score:** 8-8
**Death:** B Site, killed by Brimstone Orbital Strike ult, 0 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ı aldıktan sonra spike etrafında toplandın, Brimstone ult'u tepenize indi — post-plant'te dağılmak şart.",
  "enemyAnalysis": [
    "Brimstone B post-plant'te ult'la stack'i cezalandırıyor",
    "Düşman B retake'te ult sonrası 3 kişiyle hızlı geliyor"
  ],
  "nextRoundSuggestion": "Spike koyduktan sonra B Default, B Tree, B Drop diye 2-1-1 dağılın — Brim ult'u stack bulamaz, retake'i temiz karşılarsınız."
}
```

---

## Sample 52
**Lang:** TR | **Map:** Lotus | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 20 | **Score:** 11-8
**Death:** C Site, killed by Raze nade + Vandal, 60 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "C Site'ta default'ta kaldın, Raze nade'i C Mound'a atıp HP'ni eritti — nade sesini duyunca pozisyon değiştirmeliydin.",
  "enemyAnalysis": [
    "Raze C execute'unda nade'i Mound'a atıyor, anchor HP'sini bedava bitiriyor",
    "Düşman C'ye 3 kişi yığıyor, A ve B zayıf"
  ],
  "nextRoundSuggestion": "C'de Mound off-angle'dan çık, turret'i C Long'a bak — Raze nade default'u eritir, sen yan taraftan trade alırsın."
}
```

---

## Sample 53
**Lang:** TR | **Map:** Lotus | **Agent:** Omen (attack) | **Side:** attack | **Round:** 5 | **Score:** 2-2
**Death:** A Tree, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** force_buy
**Output:**
```json
{
  "deathAnalysis": "Force-buy round'da A Tree'ye dry peek attın, Chamber ult'la açıyı tutuyordu — force-buy'da uzun açıyı op'a karşı yoklamak çok riskli.",
  "enemyAnalysis": [
    "Chamber A Tree'yi ult'la kilitliyor, ekonomik dengesizliği maksimize ediyor",
    "Düşman A'da Chamber + 1 anchor, C tarafı zayıf bırakılıyor"
  ],
  "nextRoundSuggestion": "Force-buy'da A'yı bırak, smoke'larla C'ye yüklenin — Chamber A'da kalır, post-plant'te kazanırsınız."
}
```

---

## Sample 54
**Lang:** EN | **Map:** Lotus | **Agent:** Sova (attack) | **Side:** attack | **Round:** 14 | **Score:** 7-6
**Death:** A Main, killed by Cypher trapwire + Vandal, 100 HP, 4 allies / 4 enemies alive
**Pattern:** 2 rounds — A Main Cypher trap
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You walked into A Main without clearing utility for the second round straight — Cypher's trap pings you, then his teammate prefires the trap spot.",
  "enemyAnalysis": [
    "Cypher trap on A Main door pings every push, Vandal anchor trades from inside",
    "Enemy holds A with 2 utility setup, B and C are thin this half"
  ],
  "nextRoundSuggestion": "Drone A Main before stepping in, kill the trap then execute — once info is clean, your team rushes through."
}
```

---

## Sample 55
**Lang:** TR | **Map:** Lotus | **Agent:** Breach (attack) | **Side:** attack | **Round:** 22 | **Score:** 11-10
**Death:** A Main, killed by KAY/O Null Cmd ult + Vandal, 0 HP, 3 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e girerken KAY/O ult'unu açtı, suppress yedin ve flash'larını kullanamadın — ult sesini duyunca execute'i ertele.",
  "enemyAnalysis": [
    "KAY/O ult'unu A push'unda açıyor, attacker utility'sini iptal ediyor",
    "Düşman A'ya 3 kişi tutuyor, B ve C zayıf"
  ],
  "nextRoundSuggestion": "A execute'i KAY/O ult'undan sonra B'ye rotate et — ult harcadı, B'de utility yok, hızlı execute kazanır."
}
```

---

## Sample 56
**Lang:** TR | **Map:** Sunset | **Agent:** Iso (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** A Main, killed by Killjoy turret + Sheriff, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Main'e dry peek attın, Killjoy turret bilgini aldı ve sheriff'le kafadan vurdu — pistol round'da utility temizlemeden açı yoklama.",
  "enemyAnalysis": [
    "Killjoy A Main'e turret kuruyor, attacker peek'lerini ücretsiz buluyor",
    "Düşman pistol'de A'ya 3 kişi yığıyor, B Market zayıf"
  ],
  "nextRoundSuggestion": "Pistol round'da B Market'a yüklenin, Killjoy A'da utility tuttu — rotate gelene kadar spike koyup post-plant kazanırsınız."
}
```

---

## Sample 57
**Lang:** TR | **Map:** Sunset | **Agent:** Omen (defense) | **Side:** defense | **Round:** 4 | **Score:** 2-1
**Death:** Mid Top, killed by Jett with Operator, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — Mid Jett op
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid Top'ta peek attın, Jett 2 round'dur Mid'i operator'la kilitliyor — bu kez smoke'suz tekrar denedin.",
  "enemyAnalysis": [
    "Jett Mid'i op'la kapatıyor, dash'i hazır olduğu için trade zor",
    "Düşman mid'i kaybederse rotate çok zor, mid kontrol kritik"
  ],
  "nextRoundSuggestion": "Mid'e smoke at, Jett'in op açısını kör et — sonra A veya B'ye rotate destek atarsın, Jett tek kalır."
}
```

---

## Sample 58
**Lang:** TR | **Map:** Sunset | **Agent:** Raze (attack) | **Side:** attack | **Round:** 8 | **Score:** 4-3
**Death:** A Main, killed by Cypher trapwire + Vandal, 60 HP, 3 allies / 4 enemies alive
**Pattern:** 3 rounds — A Main Cypher trap
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e 3 round'dur tuzakları temizlemeden giriyorsun, Cypher trapwire'a takılınca Vandal pre-fire'la buluyor — drone veya boombot şart.",
  "enemyAnalysis": [
    "Cypher A Main'e tuzaklar kuruyor, dronesiz girene ücretsiz bilgi veriyor",
    "Düşman A'yı Cypher utility + 2 anchor ile kapatıyor"
  ],
  "nextRoundSuggestion": "A Main'e boombot'u önce at, tuzakları patlat — temizse hızlı dash'le execute basarsın, takım arkadan gelir."
}
```

---

## Sample 59
**Lang:** TR | **Map:** Sunset | **Agent:** Phoenix (defense) | **Side:** defense | **Round:** 11 | **Score:** 5-5
**Death:** B Site, killed by Skye flash + Vandal, 80 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta Market'a bakıyordun, Skye flash atıp pop'tan vurdu — flash sesini duyunca dön veya köşeye gir.",
  "enemyAnalysis": [
    "Skye B Market'tan flash + push yapıyor, anchor'ı flash'leyip teker teker alıyor",
    "Düşman B'ye 3 kişi yığıyor, A defansı zayıf"
  ],
  "nextRoundSuggestion": "B'de Market açısını flash'lendiğinde dönüp Default'a çekil — molly'ni Market girişine sakla, push gelirse eritirsin."
}
```

---

## Sample 60
**Lang:** EN | **Map:** Sunset | **Agent:** Sova (attack) | **Side:** attack | **Round:** 13 | **Score:** 6-6
**Death:** B Market, killed by Viper Pit ult, 0 HP, 3 allies / 3 enemies alive
**Pattern:** 2 rounds — Viper Pit B
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Viper popped Pit on your B Market entry for the second round in a row — once you hear the ult cast, hold the execute, decay eats your HP before you can fight.",
  "enemyAnalysis": [
    "Viper saves Pit ult for B executes, decay drains attacker HP and opens the retake",
    "Enemy locks B with Viper utility, the numbers are weighted on A"
  ],
  "nextRoundSuggestion": "Rotate to A the moment you hear Pit drop — Viper burned ult on B, A has no utility coverage."
}
```

---

## Sample 61
**Lang:** TR | **Map:** Sunset | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 16 | **Score:** 8-7
**Death:** A Site, killed by Yoru ult flank + Vandal, 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta Main'e bakarken Yoru ult'la arkandan geldi — site içine tuzak kurmadığın için flank'ı duyamadın.",
  "enemyAnalysis": [
    "Yoru ult'la mid'den A'ya flank atıyor, ses gizleyici sayesinde yakına kadar geliyor",
    "Düşman A'ya direkt baskı yok, Yoru flank'ıyla kill alıp sonra basıyor"
  ],
  "nextRoundSuggestion": "A site arkasına trapwire koy, Yoru flank'ını yakala — ult kullansa da tuzak ses verir, dönüp vurursun."
}
```

---

## Sample 62
**Lang:** TR | **Map:** Sunset | **Agent:** Jett (attack) | **Side:** attack | **Round:** 17 | **Score:** 8-8
**Death:** A Main, killed by Sage Guardian, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — A Main Sage Guardian
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e geniş açıyla peek attın, Sage 2 round'dur Guardian'la açıyı tutuyor — flash'siz aynı açıyı tekrar yokladın.",
  "enemyAnalysis": [
    "Sage A Main'i Guardian'la one-tap'le kovalıyor, mesafe avantajını kullanıyor",
    "Düşman A'da Sage + Heaven cross kuruyor, tek peek'le açılmaz"
  ],
  "nextRoundSuggestion": "A Main'e flash'le gir, Sage'in görüşünü kapat — sonra dash'le hızlı yüklen, Sage trade'e fırsat veremez."
}
```

---

## Sample 63
**Lang:** EN | **Map:** Sunset | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 19 | **Score:** 10-8
**Death:** A Site, killed by Raze Showstopper ult, 0 HP, 1 ally / 2 enemies alive
**Pattern:** 2 rounds — Raze ult A
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Raze ulted you on A default for the second round in a row — when she has rocket and you're the anchor, default is the obvious clear, swap to Elbow off-angle.",
  "enemyAnalysis": [
    "Raze burns ult on A default, eats the anchor every execute round",
    "Enemy commits 4 to A and lurks B Market, your rotation read is one-sided"
  ],
  "nextRoundSuggestion": "Anchor A from Elbow off-angle and put turret on Main — Raze ult lands on default, your trap pings the trade."
}
```

---

## Sample 64
**Lang:** TR | **Map:** Sunset | **Agent:** Brimstone (attack) | **Side:** attack | **Round:** 21 | **Score:** 10-10
**Death:** B Market, killed by KAY/O knife + Vandal, 80 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Market'a girerken KAY/O knife'ı bilgini aldı ve aynı anda Vandal'la buldu — knife sesini duyunca pozisyon değiştirmen gerekiyordu.",
  "enemyAnalysis": [
    "KAY/O B Market'a knife atıp attacker bilgisini ücretsiz alıyor",
    "Düşman B'yi KAY/O utility + 2 anchor ile kapatıyor"
  ],
  "nextRoundSuggestion": "B'ye smoke'larını Market girişine at, KAY/O görüşünü kapat — knife atsa da takım pozisyonu görmez."
}
```

---

## Sample 65
**Lang:** TR | **Map:** Sunset | **Agent:** Skye (attack) | **Side:** attack | **Round:** 23 | **Score:** 12-10
**Death:** A Main, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'den dry peek attın, Chamber ult'la one-shot açısını tutuyordu — ult'a karşı flash veya smoke şart.",
  "enemyAnalysis": [
    "Chamber A Main'i ult'la kilitliyor, eko avantajı için kullanıyor",
    "Düşman A'ya Chamber + 1 anchor koyuyor, B'de bilgi alıcı yok"
  ],
  "nextRoundSuggestion": "A Main'e flash'le gir, Chamber'ın görüşünü kapat — sonrası takımca yüklenince ult açısı kapanır."
}
```

---

## Sample 66
**Lang:** TR | **Map:** Sunset | **Agent:** Astra (defense) | **Side:** defense | **Round:** 6 | **Score:** 2-3
**Death:** B Site, killed by Breach Rolling Thunder ult, 0 HP, 2 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta default tutuyordun, Breach ult tüm site'ı kapsadı ve stun yedin — ult sesini duyunca CT veya Boba'ya geçmeliydin.",
  "enemyAnalysis": [
    "Breach B execute'unda ult açıyor, anchor'ları stun'layıp temiz giriyorlar",
    "Düşman B'ye 4 kişi yığıyor, A'da 1 kişi oyalama yapıyor"
  ],
  "nextRoundSuggestion": "B'de Boba off-angle'da dur, ult'a karşı kaçacak alan olur — Breach ult basarsa Boba'dan trade alırsın."
}
```

---

## Sample 67
**Lang:** TR | **Map:** Corrode | **Agent:** Tejo (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** A Main, killed by Cypher Spycam + Sheriff, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Main'e dry peek attın, Cypher Spycam bilgini aldı ve sheriff'le kafadan vurdu — pistol round'da Spycam temizlenmeden peek atılmaz.",
  "enemyAnalysis": [
    "Cypher Spycam'i A Main'e dikiyor, attacker peek'lerini ücretsiz buluyor",
    "Düşman pistol'de A'ya 3 kişi yığıyor, B tarafı zayıf"
  ],
  "nextRoundSuggestion": "Pistol round'da B'ye yüklenin, Cypher A'da utility tuttu — rotate gelene kadar spike koyup post-plant kazanırsınız."
}
```

---

## Sample 68
**Lang:** TR | **Map:** Corrode | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 4 | **Score:** 2-1
**Death:** B Site, killed by Raze nade + boombot, 50 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — Raze nade B
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta default'ta dururken Raze 2 round'dur nade'i aynı yere atıyor — nade sesini duyunca pozisyon değiştirmeliydin.",
  "enemyAnalysis": [
    "Raze B execute'unda nade + boombot combo'su atıyor, anchor HP'sini bitiriyor",
    "Düşman B'ye 3 kişi yığıyor, A zayıf"
  ],
  "nextRoundSuggestion": "B'de off-angle'a geç, turret'i B Main'e bak — Raze nade default'u eritir, sen yan taraftan trade alırsın."
}
```

---

## Sample 69
**Lang:** TR | **Map:** Corrode | **Agent:** Sova (attack) | **Side:** attack | **Round:** 7 | **Score:** 3-3
**Death:** Mid, killed by Viper Vandal (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid'e smoke atmadan peek attın, Viper Mid Window'dan Vandal'la açıyı tutuyordu — mid kontrolü smoke'suz olmaz.",
  "enemyAnalysis": [
    "Viper Mid'i wall + Vandal cross ile kapatıyor, mid'i tek başına kilitliyor",
    "Düşman mid kontrolüyle iki site'a baskı kuruyor"
  ],
  "nextRoundSuggestion": "Mid'e drone'u önce at, Viper'ın yerini gör — sonra smoke + flash'le takımca execute, mid açılır."
}
```

---

## Sample 70
**Lang:** TR | **Map:** Corrode | **Agent:** Phoenix (defense) | **Side:** defense | **Round:** 10 | **Score:** 5-4
**Death:** A Site, killed by Skye flash + Vandal, 100 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta Main'e bakıyordun, Skye flash atıp pop'tan vurdu — flash sesini duyunca dön veya köşeye gir.",
  "enemyAnalysis": [
    "Skye A Main'den flash + push yapıyor, anchor'ı flash'leyip teker teker alıyor",
    "Düşman A'ya 3 kişi yığıyor, B defansı zayıf"
  ],
  "nextRoundSuggestion": "A'da Main flash'lendiğinde dön ve molly'ni Main girişine at — Skye eritilir, takım trade alır."
}
```

---

## Sample 71
**Lang:** TR | **Map:** Corrode | **Agent:** Jett (attack) | **Side:** attack | **Round:** 13 | **Score:** 6-6
**Death:** B Long, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 4 enemies alive
**Pattern:** 3 rounds — B Long Chamber op
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Long'a 3 round'dur smoke'suz peek atıyorsun, Chamber ult'la one-shot açısını tutuyor — bu kez yine smoke yoktu.",
  "enemyAnalysis": [
    "Chamber B Long'u ult'la kilitliyor, hızlı rotate'i one-shot'la cezalandırıyor",
    "Düşman B'ye Chamber + 1 anchor, A'da 3 kişi var"
  ],
  "nextRoundSuggestion": "B Long'u smoke'la kapat, Chamber'ın ult açısını kör et — sonrası takımca yüklenince Chamber kaçamaz."
}
```

---

## Sample 72
**Lang:** TR | **Map:** Corrode | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 15 | **Score:** 7-7
**Death:** B Site, killed by Yoru ult flank + Vandal, 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta Long'a bakıyordun, Yoru ult'la arkandan geldi — site arkasına tuzak kurmadığın için flank'ı duymadın.",
  "enemyAnalysis": [
    "Yoru ult'la mid'den B'ye flank atıyor, ses gizleyici sayesinde yakına kadar geliyor",
    "Düşman B'ye direkt baskı yok, Yoru flank'ıyla kill alıp sonra basıyor"
  ],
  "nextRoundSuggestion": "B site arkasına trapwire koy, Yoru flank'ını yakala — ult kullansa da tuzak ses verir, dönüp vurursun."
}
```

---

## Sample 73
**Lang:** TR | **Map:** Corrode | **Agent:** Reyna (attack) | **Side:** attack | **Round:** 17 | **Score:** 8-8
**Death:** A Main, killed by Sage Guardian, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — A Main Sage Guardian
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e 2 round'dur Sage Guardian'la açıyı tutuyor ve sen flash'siz peek attın — Sage'in açısına flash atmadan girilmez.",
  "enemyAnalysis": [
    "Sage A Main'i Guardian'la one-tap'le kovalıyor, mesafe avantajını kullanıyor",
    "Düşman A'da Sage + 1 anchor cross kuruyor"
  ],
  "nextRoundSuggestion": "A Main'e flash'le gir, Sage'in görüşünü kapat — dismiss'le hızlı yüklen, Sage trade'e fırsat veremez."
}
```

---

## Sample 74
**Lang:** EN | **Map:** Corrode | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 18 | **Score:** 10-7
**Death:** A Site, killed by Raze Showstopper ult, 0 HP, 1 ally / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Raze ulted A default and you didn't move off the spot — once you hear Showstopper, swap to off-angle, default is always the burn.",
  "enemyAnalysis": [
    "Raze burns ult on A default to one-shot the anchor and clear the site",
    "Enemy commits 4 to A and leaves B with one player, the rotate read is clear"
  ],
  "nextRoundSuggestion": "Anchor A off-angle and put turret on Main — Raze ult lands on default, your trap pings the trade."
}
```

---

## Sample 75
**Lang:** EN | **Map:** Corrode | **Agent:** Brimstone (attack) | **Side:** attack | **Round:** 20 | **Score:** 10-9
**Death:** A Site post-plant, killed by Viper molly, 0 HP, 1 ally / 1 enemy alive
**Pattern:** 2 rounds — Viper post-plant molly A
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You sat A default post-plant for the second round and Viper hit the same molly spot — once it lands twice, never anchor default, swap to Heaven or CT.",
  "enemyAnalysis": [
    "Viper drops post-plant molly on A default every round, kills HP and opens retake",
    "Enemy retakes A with 3 through the short rotate, timing is tight"
  ],
  "nextRoundSuggestion": "After the plant move to Heaven instead of default — Viper molly misses, you trade the retake from the angle."
}
```

---

## Sample 76
**Lang:** TR | **Map:** Corrode | **Agent:** Skye (attack) | **Side:** attack | **Round:** 5 | **Score:** 2-2
**Death:** B Long, killed by Killjoy alarm bot + Vandal, 70 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** force_buy
**Output:**
```json
{
  "deathAnalysis": "Force-buy round'da B Long'a girerken Killjoy alarm bot ses verdi ve Vandal'la pre-aim'le buldu — alarm bot'u temizlemeden devam etmen riskliydi.",
  "enemyAnalysis": [
    "Killjoy B Long'a alarm bot kuruyor, attacker bilgisini ücretsiz alıyor",
    "Düşman B'yi Killjoy utility + 2 anchor ile kapatıyor"
  ],
  "nextRoundSuggestion": "B Long'a girerken trailblazer veya flash'i önce at, Killjoy bot'unu tetikle — temizlerseniz hızlı execute basarsın."
}
```

---

## Sample 77
**Lang:** TR | **Map:** Corrode | **Agent:** Omen (defense) | **Side:** defense | **Round:** 8 | **Score:** 4-3
**Death:** Mid, killed by Sova drone + Hunter's Fury ult, 50 HP, 3 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid'de tutarken Sova drone bilgini aldı, ardından ult'la duvardan vurdu — drone sesini duyunca pozisyon değiştirmen gerekiyordu.",
  "enemyAnalysis": [
    "Sova mid'i drone + ult combo'suyla kontrol ediyor, anchor'ları uzaktan eritiyor",
    "Düşman mid kontrolüyle hem A hem B'ye baskı kuruyor"
  ],
  "nextRoundSuggestion": "Mid'de sabit durma, drone gelince smoke'la görüşü kapat — Sova ult'u boşa atar, sen pozisyon değiştirir trade alırsın."
}
```

---

## Sample 78
**Lang:** TR | **Map:** Pearl | **Agent:** Jett (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** A Main, killed by Chamber Sheriff (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Main'e dry peek attın, Chamber Art tarafından sheriff'le açıyı tutuyordu — pistol'de uzun açıyı sheriff'e karşı yoklama.",
  "enemyAnalysis": [
    "Chamber A Main'i sheriff açısı tutuyor, ekonomik bedava kill alıyor",
    "Düşman pistol'de A'ya 3 kişi yığıyor, B Hall zayıf"
  ],
  "nextRoundSuggestion": "Pistol round'da B'ye yüklenin, Chamber A'da kalır — Hall'dan execute basıp post-plant kazanırsınız."
}
```

---

## Sample 79
**Lang:** TR | **Map:** Pearl | **Agent:** Astra (defense) | **Side:** defense | **Round:** 4 | **Score:** 2-1
**Death:** A Site, killed by Raze nade, 60 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — Raze nade A default
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta default'ta dururken Raze 2 round'dur nade'i aynı yere atıyor — nade sesini duyunca pozisyon değiştirmen gerekiyordu.",
  "enemyAnalysis": [
    "Raze A execute'unda nade'i Default'a atıyor, anchor HP'sini ücretsiz bitiriyor",
    "Düşman A'ya 3 kişi yığıyor, B ve mid zayıf"
  ],
  "nextRoundSuggestion": "A'da Flowers off-angle'a geç, smoke'unu Main'e at — Raze nade default'u bulamaz, sen yan taraftan trade alırsın."
}
```

---

## Sample 80
**Lang:** TR | **Map:** Pearl | **Agent:** Sova (attack) | **Side:** attack | **Round:** 7 | **Score:** 3-3
**Death:** Mid, killed by Cypher trapwire + Sheriff, 100 HP, 4 allies / 5 enemies alive
**Pattern:** 3 rounds — mid Cypher trap
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid'e 3 round'dur tuzak temizlemeden giriyorsun, Cypher trapwire'a takılınca sheriff'le buluyor — drone şart.",
  "enemyAnalysis": [
    "Cypher mid'e tuzaklar kuruyor, dronesiz girene ücretsiz bilgi veriyor",
    "Düşman mid'i Cypher utility ile kilitliyor, A ve B'de fark açılıyor"
  ],
  "nextRoundSuggestion": "Mid'e drone'u önce at, tuzakları temizle — sonra Connector veya A Dugout'tan takımca execute, mid açılır."
}
```

---

## Sample 81
**Lang:** TR | **Map:** Pearl | **Agent:** Phoenix (defense) | **Side:** defense | **Round:** 10 | **Score:** 5-4
**Death:** B Site, killed by Skye flash + Vandal, 100 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta Hall'a bakıyordun, Skye flash atıp pop'tan vurdu — flash sesini duyunca dön veya köşeye gir.",
  "enemyAnalysis": [
    "Skye B Hall'dan flash + push yapıyor, anchor'ı flash'leyip teker teker alıyor",
    "Düşman B'ye 3 kişi yığıyor, A defansı zayıf"
  ],
  "nextRoundSuggestion": "B'de Hall flash'lendiğinde dön ve molly'ni Hall girişine at — Skye eritilir, takım trade alır."
}
```

---

## Sample 82
**Lang:** EN | **Map:** Pearl | **Agent:** Reyna (attack) | **Side:** attack | **Round:** 13 | **Score:** 6-6
**Death:** A Dugout, killed by Viper with Vandal, 80 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — A Dugout Viper hold
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Two rounds straight Viper Vandal-pre-aimed you through the wall and you peeked dry — you need a flash through the wall before swinging A Dugout.",
  "enemyAnalysis": [
    "Viper holds A Dugout with wall plus Vandal cross, no info means free trades",
    "Enemy commits Viper plus one anchor on A, B is the soft side this round"
  ],
  "nextRoundSuggestion": "Flash into A Dugout to break Viper's wall sight, then dismiss in fast — she has no time to trade once you're inside."
}
```

---

## Sample 83
**Lang:** TR | **Map:** Pearl | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 16 | **Score:** 8-7
**Death:** A Site, killed by Yoru ult flank + Vandal, 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta Main'e bakıyordun, Yoru ult'la mid'den arkandan geldi — site arkasına tuzak kurmadığın için flank'ı duyamadın.",
  "enemyAnalysis": [
    "Yoru ult'la mid'den A'ya flank atıyor, ses gizleyici sayesinde yakına kadar geliyor",
    "Düşman A'ya direkt baskı yok, Yoru flank'ıyla kill alıp sonra basıyor"
  ],
  "nextRoundSuggestion": "A site arkasına trapwire koy, Yoru flank'ını yakala — ult kullansa da tuzak ses verir, dönüp vurursun."
}
```

---

## Sample 84
**Lang:** TR | **Map:** Pearl | **Agent:** Brimstone (attack) | **Side:** attack | **Round:** 17 | **Score:** 8-8
**Death:** B Hall, killed by Sage Guardian, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — B Hall Sage Guardian
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Hall'a 2 round'dur Sage Guardian'la açıyı tutuyor ve sen flash'siz peek attın — Sage'in açısına flash atmadan girilmez.",
  "enemyAnalysis": [
    "Sage B Hall'u Guardian'la one-tap'le kovalıyor, mesafe avantajını kullanıyor",
    "Düşman B'de Sage + 1 anchor cross kuruyor"
  ],
  "nextRoundSuggestion": "B Hall'a smoke'unu Sage açısına at, görüşünü kör et — sonrası takımca yüklenince Sage kaçamaz."
}
```

---

## Sample 85
**Lang:** TR | **Map:** Pearl | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 19 | **Score:** 10-8
**Death:** B Site, killed by Raze Showstopper ult, 0 HP, 1 ally / 2 enemies alive
**Pattern:** 2 rounds — Raze ult B
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta default'ta kaldın, Raze 2 round'dur aynı spot'a ult atıyor — ult sesini duyunca off-angle'a geçmeliydin.",
  "enemyAnalysis": [
    "Raze B execute'unda ult'la default'u temizliyor, site'ı bedava açıyor",
    "Düşman B'ye 4 kişi yığıyor, A'da bilgi alıcı tek kişi var"
  ],
  "nextRoundSuggestion": "B'de off-angle'a geç, turret'i Hall'a bak — Raze ult default'u eritir, sen yan taraftan trade alırsın."
}
```

---

## Sample 86
**Lang:** EN | **Map:** Pearl | **Agent:** Sova (attack) | **Side:** attack | **Round:** 14 | **Score:** 7-6
**Death:** Mid Top, killed by Chamber with Operator, 100 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You dry peeked Mid Top into a Chamber holding op — without a smoke, that long angle is a free pick every round.",
  "enemyAnalysis": [
    "Chamber holds Mid Top with op, recall is up so trade is hard",
    "Enemy stacks 2 mid and 2 A, B Hall is the soft side this round"
  ],
  "nextRoundSuggestion": "Smoke Mid Top before peeking, kill the op angle — once mid is contested, your team executes B clean."
}
```

---

## Sample 87
**Lang:** TR | **Map:** Pearl | **Agent:** Fade (attack) | **Side:** attack | **Round:** 20 | **Score:** 10-9
**Death:** A Main, killed by KAY/O Null Cmd ult + Vandal, 0 HP, 3 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e girerken KAY/O ult'unu açtı, suppress yedin ve utility'ni kullanamadın — ult sesini duyunca execute'i ertele.",
  "enemyAnalysis": [
    "KAY/O ult'unu A push'unda açıyor, attacker utility'sini iptal ediyor",
    "Düşman A'ya 3 kişi tutuyor, B'de utility yok"
  ],
  "nextRoundSuggestion": "A execute'i KAY/O ult'undan sonra B'ye rotate edin — ult harcadı, B'de utility yok, hızlı execute kazanır."
}
```

---

## Sample 88
**Lang:** TR | **Map:** Pearl | **Agent:** Omen (defense) | **Side:** defense | **Round:** 22 | **Score:** 12-9
**Death:** Mid, killed by Sova drone + Hunter's Fury ult, 70 HP, 1 ally / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid'de tutarken Sova drone bilgini aldı, ardından ult'la duvardan vurdu — drone sesini duyunca pozisyon değiştirmen gerekiyordu.",
  "enemyAnalysis": [
    "Sova mid'i drone + ult combo'suyla temizliyor, anchor'ları uzaktan eritiyor",
    "Düşman mid kontrolüyle iki site'a baskı kuruyor"
  ],
  "nextRoundSuggestion": "Mid'de drone gelince smoke'la görüşü kapat ve pozisyon değiştir — Sova ult'u boşa atar, trade için zaman kazanırsın."
}
```

---

## Sample 89
**Lang:** TR | **Map:** Abyss | **Agent:** Jett (attack) | **Side:** attack | **Round:** 1 | **Score:** 0-0
**Death:** A Main, killed by Cypher trapwire + Sheriff, 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** pistol
**Output:**
```json
{
  "deathAnalysis": "Pistol round'da A Main'e dry peek attın, Cypher trapwire'a takılınca sheriff'le buluyor — pistol'de utility temizlemeden açı yoklama.",
  "enemyAnalysis": [
    "Cypher A Main'e tuzak kuruyor, attacker peek'lerini ücretsiz buluyor",
    "Düşman pistol'de A'ya 3 kişi yığıyor, B zayıf"
  ],
  "nextRoundSuggestion": "Pistol round'da B'ye yüklenin, Cypher A'da kalır — hızlı execute'le post-plant kazanırsınız."
}
```

---

## Sample 90
**Lang:** TR | **Map:** Abyss | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 4 | **Score:** 2-1
**Death:** A Site, killed by Raze with Vandal, 80 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — A Raze nade
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta default'ta dururken Raze 2 round'dur nade'i aynı yere atıyor — nade sesini duyunca pozisyon değiştirmeliydin.",
  "enemyAnalysis": [
    "Raze A execute'unda nade'i Default'a atıyor, anchor HP'sini bedava bitiriyor",
    "Düşman A'ya 3 kişi yığıyor, B ve mid zayıf"
  ],
  "nextRoundSuggestion": "A'da off-angle'a geç, turret'i A Main'e bak — Raze nade default'u eritir, sen yan taraftan trade alırsın."
}
```

---

## Sample 91
**Lang:** TR | **Map:** Abyss | **Agent:** Sova (attack) | **Side:** attack | **Round:** 7 | **Score:** 3-3
**Death:** B Main, killed by Viper Vandal (headshot), 100 HP, 4 allies / 5 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Main'e wall temizlemeden peek attın, Viper smoke arkasından Vandal'la açıyı tutuyordu — Viper'a karşı flash veya smoke şart.",
  "enemyAnalysis": [
    "Viper B Main'i wall + Vandal cross ile kapatıyor",
    "Düşman B'yi Viper utility ile kilitliyor, A'da fark açılıyor"
  ],
  "nextRoundSuggestion": "B'ye drone'u önce at, Viper'ın yerini gör — sonra smoke + flash'le takımca execute, B açılır."
}
```

---

## Sample 92
**Lang:** TR | **Map:** Abyss | **Agent:** Phoenix (defense) | **Side:** defense | **Round:** 10 | **Score:** 5-4
**Death:** A Site, killed by Skye flash + Vandal, 100 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Site'ta Main'e bakıyordun, Skye flash atıp pop'tan vurdu — flash sesini duyunca dön veya köşeye gir.",
  "enemyAnalysis": [
    "Skye A Main'den flash + push yapıyor, anchor'ı flash'leyip teker teker alıyor",
    "Düşman A'ya 3 kişi yığıyor, B defansı zayıf"
  ],
  "nextRoundSuggestion": "A'da Main flash'lendiğinde dön ve molly'ni Main girişine at — Skye eritilir, takım trade alır."
}
```

---

## Sample 93
**Lang:** TR | **Map:** Abyss | **Agent:** Reyna (attack) | **Side:** attack | **Round:** 13 | **Score:** 6-6
**Death:** A Main, killed by Chamber Tour de Force ult, 100 HP, 4 allies / 4 enemies alive
**Pattern:** 3 rounds — A Main Chamber op
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "A Main'e 3 round'dur smoke'suz peek atıyorsun, Chamber ult'la one-shot açısını tutuyor — bu kez yine smoke yoktu.",
  "enemyAnalysis": [
    "Chamber A Main'i ult'la kilitliyor, hızlı rotate'i one-shot'la cezalandırıyor",
    "Düşman A'ya Chamber + 1 anchor, B zayıf"
  ],
  "nextRoundSuggestion": "A Main'i smoke'la kapat, Chamber'ın ult açısını kör et — sonrası takımca yüklenince Chamber kaçamaz, dismiss'le hızlı kapat."
}
```

---

## Sample 94
**Lang:** TR | **Map:** Abyss | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 15 | **Score:** 7-7
**Death:** B Site, killed by Yoru ult flank + Vandal, 100 HP, 1 ally / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Site'ta Main'e bakıyordun, Yoru ult'la arkandan geldi — site arkasına tuzak kurmadığın için flank'ı duyamadın.",
  "enemyAnalysis": [
    "Yoru ult'la mid'den B'ye flank atıyor, ses gizleyici sayesinde yakına kadar geliyor",
    "Düşman B'ye direkt baskı yok, Yoru flank'ıyla kill alıp sonra basıyor"
  ],
  "nextRoundSuggestion": "B site arkasına trapwire koy, Yoru flank'ını yakala — ult kullansa da tuzak ses verir, dönüp vurursun."
}
```

---

## Sample 95
**Lang:** TR | **Map:** Abyss | **Agent:** Brimstone (attack) | **Side:** attack | **Round:** 17 | **Score:** 8-8
**Death:** B Main, killed by Sage Guardian, 100 HP, 3 allies / 4 enemies alive
**Pattern:** 2 rounds — B Main Sage Guardian
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "B Main'e 2 round'dur Sage Guardian'la açıyı tutuyor ve sen flash'siz peek attın — Sage'in açısına flash atmadan girilmez.",
  "enemyAnalysis": [
    "Sage B Main'i Guardian'la one-tap'le kovalıyor, mesafe avantajını kullanıyor",
    "Düşman B'de Sage + 1 anchor cross kuruyor"
  ],
  "nextRoundSuggestion": "B Main'e smoke'unu Sage açısına at, görüşünü kör et — sonrası takımca yüklenince Sage kaçamaz."
}
```

---

## Sample 96
**Lang:** EN | **Map:** Abyss | **Agent:** Killjoy (defense) | **Side:** defense | **Round:** 19 | **Score:** 10-8
**Death:** A Site, killed by Raze Showstopper ult, 0 HP, 1 ally / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Raze ulted A default and you didn't move — once you hear Showstopper, default is the burn, swap to off-angle.",
  "enemyAnalysis": [
    "Raze burns ult on A default to one-shot the anchor and open the site",
    "Enemy commits 4 to A and lurks B with one player, rotate read is one-sided"
  ],
  "nextRoundSuggestion": "Anchor A off-angle and put turret on Main — Raze ult clears default, your trap pings the trade."
}
```

---

## Sample 97
**Lang:** EN | **Map:** Abyss | **Agent:** Jett (attack) | **Side:** attack | **Round:** 20 | **Score:** 10-9
**Death:** A Main, killed by Chamber sheriff (headshot), 100 HP, 4 allies / 4 enemies alive
**Pattern:** 2 rounds — A Main Chamber sheriff
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "You peeked A Main wide into Chamber's sheriff for the second round straight — against a head-level pre-aim, shoulder peek with smoke, not a dry swing.",
  "enemyAnalysis": [
    "Chamber holds A Main with sheriff and head pre-aim, eats anyone swinging wide",
    "Enemy plays 2 A and 2 mid, B is the weak side this round"
  ],
  "nextRoundSuggestion": "Smoke A Main and push B with the team — Chamber sits A, rotation is too slow to catch you."
}
```

---

## Sample 98
**Lang:** EN | **Map:** Abyss | **Agent:** Phoenix (defense) | **Side:** defense | **Round:** 11 | **Score:** 5-5
**Death:** B Site, killed by Skye flash + Vandal, 100 HP, 2 allies / 3 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Skye flashed Main and you got popped on the head turn — once you hear the flash, you turn away or rotate behind cover, not stand still.",
  "enemyAnalysis": [
    "Skye flashes B Main and pushes immediately, picks anchor on the pop turn",
    "Enemy stacks 3 on B and leaves A thin, rotation timing is fast"
  ],
  "nextRoundSuggestion": "Anchor B from off-angle and prep molly on Main entrance — when Skye flashes, you turn away and molly the push."
}
```

---

## Sample 99
**Lang:** EN | **Map:** Abyss | **Agent:** Cypher (defense) | **Side:** defense | **Round:** 22 | **Score:** 12-9
**Death:** A Site, killed by Yoru ult flank, 100 HP, 1 ally / 2 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Yoru ulted into A from mid and you didn't have a trap covering the flank — you were watching Main with no info on your back.",
  "enemyAnalysis": [
    "Yoru ults from mid into A flank, sound masker keeps the rotate quiet",
    "Enemy doesn't pressure A directly, they pick anchor with flank then execute"
  ],
  "nextRoundSuggestion": "Drop a trapwire behind A site to catch the Yoru flank — even with ult, the trap pings and you turn for the trade."
}
```

---

## Sample 100
**Lang:** TR | **Map:** Abyss | **Agent:** Skye (attack) | **Side:** attack | **Round:** 23 | **Score:** 12-10
**Death:** Mid, killed by Sova Hunter's Fury ult, 60 HP, 4 allies / 4 enemies alive
**Pattern:** fresh
**Economy:** full_buy
**Output:**
```json
{
  "deathAnalysis": "Mid'de düz hatta dururken Sova ult'u duvardan geldi — ult sesini duyunca açık alanı bırakıp köşeye geçmen gerekiyordu.",
  "enemyAnalysis": [
    "Sova mid'i ult'la temizliyor, drone bilgisinden sonra ekonomik şekilde kullanıyor",
    "Düşman mid kontrolüyle iki site'a baskı kuruyor, mid kontrol kritik"
  ],
  "nextRoundSuggestion": "Mid'de düz hatta durma, smoke'unu duvar açısına at — Sova ult'u yine atarsa görüşü kapanır, sen güvenli geçersin."
}
```

---
