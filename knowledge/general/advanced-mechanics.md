# Advanced Mechanics — Radiant-Level Knowledge

## Counter-Strafe Timing

Counter-strafing is the act of tapping the opposite movement key to instantly decelerate to 0 velocity, achieving first-shot accuracy faster than simply releasing the key.

### Weapon-Specific Deceleration to Accurate (ms from key press)

| Weapon | Release Stop (ms) | Counter-Strafe (ms) | Advantage (ms) |
|---|---|---|---|
| Vandal | ~180 | ~70 | 110 |
| Phantom | ~175 | ~68 | 107 |
| Sheriff | ~185 | ~72 | 113 |
| Ghost | ~160 | ~60 | 100 |
| Guardian | ~180 | ~70 | 110 |
| Operator | ~200 | ~80 | 120 |
| Spectre | ~140 | ~55 | 85 |
| Stinger | ~130 | ~50 | 80 |
| Marshal | ~175 | ~68 | 107 |
| Odin | ~210 | ~85 | 125 |
| Ares | ~200 | ~80 | 120 |
| Bulldog | ~170 | ~65 | 105 |
| Classic | ~140 | ~55 | 85 |
| Frenzy | ~135 | ~52 | 83 |
| Shorty | ~120 | ~45 | 75 |
| Judge | ~150 | ~58 | 92 |
| Bucky | ~150 | ~58 | 92 |

### Counter-Strafe Technique Details

- **Tap duration**: The counter-strafe key press should be 1-2 frames (~16-33ms at 60fps, ~7-14ms at 144fps). Holding too long reverses your direction.
- **Deadzone threshold**: Valorant has a movement error threshold. You become accurate when velocity drops below ~30% of max running speed. Counter-strafing gets you there in roughly 60-85ms depending on weapon.
- **Double-tap counter-strafe**: Tapping A-D-A (or D-A-D) creates a micro-jiggle that keeps you near the accuracy threshold while being harder to track. Used at Radiant+ for dry peeking common angles.
- **Diagonal counter-strafe**: When moving diagonally (W+A or W+D), you must counter-strafe BOTH keys simultaneously. Missing one key keeps residual velocity above the accuracy threshold.

## Jiggle Peek Width Optimization

Jiggle peeking exposes a minimum number of pixels to gather info or bait shots. The goal is to expose only your shoulder (not your head) while gaining visual information.

### Exposure Width by Purpose

| Purpose | Exposure Width | Approximate Pixels (1920x1080) | Risk Level |
|---|---|---|---|
| Info gather (see if angle is held) | ~15-20% of model | 8-12 pixels | Low |
| Bait an Operator shot | ~25-30% of model | 14-18 pixels | Medium |
| Wide swing follow-up | ~60-80% of model | 35-50 pixels | High |
| Shoulder peek (pure bait) | ~10% of model | 5-8 pixels | Minimal |

### Jiggle Peek Timing

- **Single jiggle**: 80-120ms round trip. Enough to bait a shot from an average player.
- **Double jiggle**: Two quick jiggles (150-200ms total). Forces an Op player to either shoot early or wait, giving you timing info.
- **Jiggle into wide swing**: Jiggle once (100ms), pause 200-400ms, then wide swing. The pause breaks the opponent's timing expectation.

### Map-Specific Jiggle Distances

- **Long angles (30m+)**: Smaller jiggle needed because the angular velocity of your model is lower from the enemy's perspective. 2-3 unit jiggle.
- **Medium angles (15-30m)**: Standard 3-5 unit jiggle.
- **Short angles (sub-15m)**: Wider jiggle needed (5-8 units) because close enemies see more of your model per unit of movement.

## Wide Swing vs Close Peek Decision Tree

```
Is the enemy holding an Operator?
├── YES → Wide swing (speed advantage, harder to track)
│   ├── Do you have a flash? → Flash + wide swing
│   └── No flash? → Jiggle bait first, then wide swing on their whiff
└── NO → Evaluate distance
    ├── Long range → Close peek (minimize exposure, take rifle duel)
    ├── Medium range → Either, depends on your weapon
    │   ├── Vandal/Phantom → Close peek preferred
    │   └── Shotgun/SMG → Wide swing to close distance
    └── Close range → Wide swing (overwhelm with speed)

Is the enemy playing off-angle?
├── YES → Close peek will miss them; wide swing to catch off-angles
└── NO → Close peek to minimize exposure

Are you peeking with a teammate (double peek)?
├── YES → One close peek, one wide swing. Different timings.
└── NO → Default to close peek unless you have utility to support the swing.
```

### Wide Swing Speed Values

- Running speed (knife): 6.75 m/s
- Running speed (rifle): 5.4 m/s
- Running speed (Operator): 4.95 m/s (76% of knife speed)
- The speed difference means a wide swing with a rifle is 20% slower than with a knife. Consider knife-swinging to gather info, then re-peeking with weapon.

## Crouch Timing

### When Crouching Helps

- **Spray commitment**: After the first 4-5 bullets of a spray, crouching tightens the spread. Crouch at bullet 4-5, not at bullet 1.
- **Head-level dodge**: If an enemy pre-aims head level, crouching dips your hitbox below their crosshair. Effective in the first 200ms of an engagement.
- **Holding tight corners**: Crouching behind cover reduces your exposed profile.
- **Counter-strafe crouch**: Counter-strafe then immediately crouch. The crouch further reduces movement inaccuracy and drops your head hitbox.

### When Crouching Kills You

- **Initial peek**: Never crouch while peeking. You move at 30% speed while crouched (2.7 m/s rifle vs 5.4 m/s standing), making you an easy target.
- **Against better aimers**: At Radiant, players adjust to crouching in <150ms. Crouching just makes your head easier to hit from medium range.
- **Jiggle peeking**: Crouching defeats the purpose of jiggle peeking because you lose speed.
- **1vX clutch situations**: Crouching makes noise (fabric sound) and slows your repositioning. Stay standing and shift-walk.
- **Multiple enemies**: If you crouch-commit to one enemy, the second enemy has a stationary target.

### Crouch Timing Window

- Effective crouch window: 0-200ms after engagement starts. After 200ms, good players have already adjusted.
- Re-stand timing: If you crouch and the spray is going low, stand up at ~400ms into the fight. This creates a "crouch-stand" juke.

## Movement Speed Values

| Weapon Category | Running (m/s) | Walking (m/s) | Crouching (m/s) |
|---|---|---|---|
| Knife | 6.75 | 4.05 | 2.70 |
| Classic/Shorty/Frenzy | 5.73 | 3.44 | 2.29 |
| Ghost/Sheriff | 5.73 | 3.44 | 2.29 |
| Spectre/Stinger | 5.40 | 3.24 | 2.16 |
| Phantom/Vandal/Bulldog | 5.40 | 3.24 | 2.16 |
| Guardian | 5.22 | 3.13 | 2.09 |
| Marshal | 5.22 | 3.13 | 2.09 |
| Operator | 4.95 | 2.97 | 1.98 |
| Odin/Ares | 4.95 | 2.97 | 1.98 |
| Judge/Bucky | 5.40 | 3.24 | 2.16 |

### Speed Implications

- A knife runner covers the distance from A-Main to A-Site on Ascent in ~3.8 seconds. A rifle runner takes ~4.7 seconds. This 0.9 second difference determines who gets first contact on a site take.
- Spawn timing difference: On Bind, attackers reach B-Short in ~12 seconds (rifle). Defenders reach B-Site in ~8 seconds (rifle). This gives defenders a 4-second setup window.
- On pistol rounds, the Classic's higher move speed (5.73 m/s) vs rifles (5.4 m/s) gives pistol users a 6% speed advantage during eco rushes.

## Run-and-Gun Accuracy Thresholds

Running accuracy is measured by the "movement error" added to the weapon's base spread. Some weapons are viable while moving:

| Weapon | Standing Accuracy (spread) | Running Accuracy (spread) | Run-and-Gun Viable? |
|---|---|---|---|
| Spectre | 0.4 | 1.3 | YES (sub-15m) |
| Stinger | 0.5 | 1.6 | YES (sub-10m) |
| Shotguns (Judge) | 2.0 | 3.0 | YES (sub-8m) |
| Phantom | 0.2 | 3.8 | NO (except point blank) |
| Vandal | 0.25 | 4.0 | NO |
| Classic (right-click) | 1.0 | 1.5 | YES (sub-8m, deadly) |
| Frenzy | 0.45 | 1.5 | YES (sub-12m) |
| Ghost | 0.3 | 2.0 | Marginal (sub-8m only) |
| Ares | 0.8 | 1.7 | YES (after spin-up, sub-20m) |
| Odin | 0.8 | 1.5 | YES (after spin-up, sub-20m) |

### Run-and-Gun Mechanics

- The Spectre is the king of run-and-gun. At sub-15m, the movement penalty barely matters. Strafe-spray with Spectre is a legitimate strategy on eco rounds.
- Classic right-click at <8m while running does 78 damage per burst to the body (26x3) and can one-burst headshot kill (78 + headshot multiplier).
- Ares/Odin have a spin-up mechanic: after ~0.5 seconds of firing, their accuracy improves dramatically even while moving. Pre-fire with these weapons.

## Spray Transfer Pixel Distances

When spraying from one target to another, the crosshair must move a specific distance depending on range. These are approximate pixel distances at 1920x1080 resolution, 103 FOV:

| Range to Target | Target Separation (1 body width apart) | Pixel Transfer Distance |
|---|---|---|
| 10m | ~60 pixels |
| 20m | ~30 pixels |
| 30m | ~20 pixels |
| 40m | ~15 pixels |
| 50m | ~12 pixels |

### Spray Transfer Technique

1. Kill target 1 while spraying (bullets 1-6).
2. Snap crosshair to target 2 (this is the transfer).
3. Compensate for spray pattern offset: at bullet 7-10, the spray pattern is pulling UP and LEFT (Vandal) or UP and RIGHT (Phantom). You must counter this while transferring.
4. **Vandal spray transfer**: Pull crosshair DOWN-RIGHT during transfer to compensate for Vandal's left pull.
5. **Phantom spray transfer**: Pull crosshair DOWN-LEFT during transfer to compensate for Phantom's right pull.
6. Reset spray if target 2 is far: Sometimes it is faster to stop firing, counter-strafe micro, and start a new spray.

## Sound System

### Sound Radius Values

| Action | Radius | Notes |
|---|---|---|
| Running footsteps | ~40m | Audible through walls; direction discernible |
| Walking footsteps | ~14m | Silent beyond this range |
| Crouch walking | ~14m | Same as walk, no difference |
| Jumping (landing) | ~40m | Landing sound is loud |
| Weapon equip/switch | ~40m | Audible; switching weapons reveals position |
| Reload | ~40m | Highly audible, very punishable |
| Scope in (Marshal/Op) | ~40m | The zoom sound is audible |
| Spike plant start | ~40m | 4-second plant animation |
| Spike defuse start | ~40m | Defuse sound is loud |
| Spike beep (half) | Increases with time | Beep rate doubles at 25s, triples at 12s, constant at 5s |
| Rope climb | ~40m | Rope pulleys are loud |
| Teleporter (Bind) | ~40m on exit | Entry sound is localized to entrance |

### Ability Sound Cues and Information

| Ability | Sound | What It Reveals |
|---|---|---|
| Jett dash | Whoosh + footstep | Direction of dash, confirms Jett position |
| Raze satchel | Explosion + flight | Direction, likely peek angle |
| Omen TP (Shrouded Step) | Shadow sound at arrival | Destination location (not origin) |
| Omen ult | Global sound, then arrival sound | Destination if you hear the arrival |
| Chamber TP | Anchor sound at destination | Destination anchor location |
| Reyna dismiss | Ethereal sound | Direction of travel |
| Yoru TP | Rift sound at both ends | Both origin and destination |
| Yoru clone footsteps | Normal footstep sounds | Indistinguishable from real (designed to bait) |
| KAY/O knife landing | Pulse sound | Suppression radius center |
| Sova drone | Buzzing engine sound | Direction and approximate location |
| Skye dog | Growling/running sound | Direction; triggers when near enemy |
| Fade prowler | Crawling sound | Direction of travel |
| Breach aftershock | Charging sound through wall | Exact position of aftershock |
| Killjoy turret | Firing sound | Turret location; if it fires, enemy is nearby |
| Cypher tripwire trigger | Snap sound | Exact tripwire location |

### Vertical Audio

- Valorant's HRTF (Head-Related Transfer Function) system simulates vertical audio. Sounds from above have a slightly different tonal quality (higher frequency emphasis) than sounds from the same level.
- Enable HRTF in audio settings for competitive play.
- Common vertical audio spots: Haven C-Long garage (above/below), Split Mid (heaven/hell), Ascent Mid (catwalk above market), Icebox B-Site (tube above ground), Lotus B-Site (upper vs lower).
- Footstep sounds on different surfaces (metal, wood, stone) help identify vertical position. Metal grating sounds indicate catwalks/heaven positions.

## Spike Timing

- **Plant time**: 4.0 seconds (cannot be interrupted by damage; must break line of sight or kill planter)
- **Defuse time (full)**: 7.0 seconds
- **Defuse time (half kit)**: 3.5 seconds (requires half-defuse progress saved)
- **Spike detonation timer**: 45 seconds after plant
- **Half defuse**: Defusing for 3.5 seconds, then stopping. This saves 50% progress. The next defuse attempt only needs 3.5 seconds.
- **Defuse audio cue**: The defuser makes a distinct sound. Faking a defuse (tapping spike for 0.2-0.5 seconds) produces the start of this sound, potentially baiting the post-plant player into peeking.
- **Fake defuse timing**: Tap for 0.3-0.5 seconds (enough to be heard), immediately stop and hold angle. If post-plant player peeks, kill them, then defuse. If they do not peek, repeat or commit to full defuse.

### Spike Detonation Kill Radius

- Lethal radius: ~8m from spike
- Damage falloff: Damage decreases linearly beyond ~5m. At 8m, it deals ~150 damage. At 12m, it deals ~50 damage. Heavy shields survive at 10m+ depending on exact position.
- You can survive spike detonation behind certain thick walls even at close range (the explosion does not penetrate all walls).

## Round Timer Exploitation

The round timer is 1:40 (100 seconds).

### Timer-Based Decision Making

| Time Remaining | Attacker Priority | Defender Priority |
|---|---|---|
| 1:40-1:10 | Default: take map control, gather info | Hold positions, don't overcommit |
| 1:10-0:45 | Execute or set up for execute | Identify attacker intentions, begin rotating if needed |
| 0:45-0:30 | Must commit to a site | Commit to rotate or hold |
| 0:30-0:15 | Plant spike NOW, any delay is fatal | Aggressively retake or concede |
| 0:15-0:00 | If no plant, you lose | If spike not planted, you win by timer |

### Post-Plant Timer Math

- 45 seconds on spike.
- Full defuse: 7 seconds. Defenders must reach spike by 38 seconds remaining on spike timer.
- Half defuse: Defenders must reach spike by 41.5 seconds to start first half, then again by 3.5 seconds to complete.
- If you plant with 30 seconds left in the round, defenders have (30 + 45) = 75 seconds? No. The round timer stops mattering once spike is planted; only the 45-second spike timer matters.

## Spawn Timing and Site Takes

### Map-Specific Spawn Timings (Rifle Speed)

| Map | Location | Attacker Arrival (s) | Defender Arrival (s) | Difference |
|---|---|---|---|---|
| Ascent | A-Main | 10.5 | 7.0 | Def +3.5s |
| Ascent | B-Main | 11.0 | 7.5 | Def +3.5s |
| Ascent | Mid | 9.0 | 8.0 | Def +1.0s |
| Bind | A-Short | 10.0 | 7.0 | Def +3.0s |
| Bind | B-Long | 12.0 | 7.5 | Def +4.5s |
| Haven | A-Long | 11.0 | 7.5 | Def +3.5s |
| Haven | C-Long | 11.5 | 8.0 | Def +3.5s |
| Haven | Garage | 9.5 | 8.5 | Def +1.0s |
| Split | A-Main | 10.0 | 6.5 | Def +3.5s |
| Split | B-Main | 10.5 | 7.0 | Def +3.5s |
| Split | Mid | 8.5 | 7.5 | Def +1.0s |
| Icebox | A-Belt | 10.5 | 7.0 | Def +3.5s |
| Icebox | B-Long | 11.0 | 8.0 | Def +3.0s |
| Lotus | A-Main | 11.0 | 7.0 | Def +4.0s |
| Lotus | B-Main | 10.5 | 7.5 | Def +3.0s |
| Lotus | C-Main | 11.5 | 7.0 | Def +4.5s |

### Spawn Implications

- Mid control is almost always the fastest contest point because both teams arrive at similar times.
- A fast B-rush on Bind requires the entry fragger to knife-run (~8.8 seconds) to arrive before the defenders fully set up.
- On Lotus, the rotating doors add ~1.5 seconds to rotation time. Calling early rotations through doors is critical.
- On Haven with 3 sites, at least one site has a delayed defender. IGL should track which defender plays which site and attack the weaker/slower rotation.

## Jump Peek Timing and Accuracy

### Jump Mechanics

- Jump duration: ~0.6 seconds total (0.3s up, 0.3s down).
- Accuracy during jump: Weapons are fully inaccurate while airborne. You cannot shoot accurately mid-air (except Jett with Bladestorm/knives).
- Jump peek purpose: Gather visual information without committing to a gunfight. You are harder to headshot during the apex of the jump.
- Jump peek counter-strafe: At the apex of the jump, you can counter-strafe to change direction, making the landing position unpredictable.

### Jump Peek Info Gathering

- Bind A-Short: Jump peek from short corner to see if elbow/lamps is held. Exposure time: ~300ms.
- Ascent Mid: Jump peek from catwalk to see mid/market. Extremely common at pro level.
- Icebox B-Orange: Jump peek to see if tube/site is held before committing.
- Haven C-Long: Jump peek from the long corner to see if the angle is being held by an Op.

### Running Jump Distance

- Maximum horizontal distance during a jump: ~3.5m (knife), ~2.8m (rifle).
- This is relevant for crossing gaps (Ascent mid courtyard, Icebox mid) where a running jump can cross a sightline faster than running on the ground.

## Wallbang Spots and Damage Values

Valorant has material penetration tiers:

| Material | Penetration Damage Multiplier |
|---|---|
| Thin wood | 0.75x |
| Thick wood | 0.50x |
| Thin metal | 0.65x |
| Thick metal | 0.35x |
| Thin stone | 0.50x |
| Thick stone | 0.25x |
| Glass | 0.90x |

### Common Wallbang Spots (High Value)

- **Ascent B-Main wooden door**: Vandal does 117 headshot through the door (0.75x of 156). Spamming through the door at head height is extremely effective.
- **Ascent Mid Pizza/Market**: Thin wall sections allow rifle wallbangs. Vandal headshot: ~78 damage through the wall.
- **Bind A-Short**: The metal container wall is thin metal. Vandal headshot: ~101 damage.
- **Haven C-Long wooden wall**: Near plat, thin wood allows full rifle wallbangs. Vandal headshot: 117 damage.
- **Split A-Ramp**: The wooden box on ramp is thin wood. Spam it if you hear footsteps.
- **Icebox B-Orange container**: Thin metal walls. Vandal headshot: ~101 damage. Very common wallbang spot.
- **Lotus B-Upper**: The wooden partition is spammable. Vandal headshot: 117 damage.

### Wallbang Decision Making

- Only wallbang with rifles or the Odin. SMGs and pistols lose too much damage.
- The Odin is the best wallbang weapon: high fire rate, large magazine, decent penetration damage.
- Always aim head height when wallbanging. Even through walls, headshots do significantly more damage.
- If you hear a defuse sound, wallbang the spike location immediately. Even 50 damage forces them off the defuse.

## One-Way Smoke Positions

One-way smokes allow you to see enemy feet while they cannot see you. They rely on placing the smoke so that the bottom edge is at your eye level but covers the enemy's vision.

### Principles

- The smoke must clip into a surface (wall, box, ledge) so the bottom of the smoke sphere is elevated.
- Your head must be at or below the bottom edge of the smoke. Crouching often helps.
- The enemy must be on the other side at a lower elevation or at the same level but at distance (the smoke curves upward from their perspective).

### Key One-Way Smoke Positions (Agent-Specific)

- **Omen on Bind B-Long**: Place smoke on top of the long wall. From site, you see feet under the smoke. This has been a pro-level staple for years.
- **Viper on Ascent A-Main**: Poison cloud on the short wall near main entrance. Defenders see feet from behind the generator.
- **Jett on Split A-Ramp**: Cloud burst on the ramp overhang. From ramp, you see A-Main feet.
- **Brimstone on Haven C-Long**: Smoke on the long wall edge. From site, you see feet approaching from long.
- **Astra on Icebox B-Site**: Star placed on top of the orange container creates a one-way looking into B-main.
- **Harbor on Lotus A-Main**: Cove placed on the wall ledge above A-Main creates a one-way from rubble.

One-way smokes are extremely powerful but have a counter: if the enemy knows the one-way exists, they can crouch-walk under it or push through it aggressively. Rotate your one-way positions between rounds.
