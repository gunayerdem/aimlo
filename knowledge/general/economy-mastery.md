# Economy Mastery — Radiant-Level Knowledge

## Credit System Fundamentals

### Round Outcome Credits

| Outcome | Credits Earned |
|---|---|
| Round Win (attack) | 3,000 |
| Round Win (defense) | 3,000 |
| Round Loss | 1,900 (base) + loss bonus |
| Spike Plant (attack, even on loss) | +300 to planter |
| Spike Plant team bonus (attack loss) | +200 to team |

### Kill Credits

| Weapon Category | Kill Reward |
|---|---|
| Knife | 400 |
| Sidearm (Classic, Shorty, Frenzy, Ghost, Sheriff) | 200 |
| SMG (Spectre, Stinger) | 200 |
| Shotgun (Bucky, Judge) | 200 |
| Rifle (Bulldog, Guardian, Phantom, Vandal) | 200 |
| Sniper (Marshal, Operator) | 200 |
| Machine Gun (Ares, Odin) | 200 |

Note: All weapon kill rewards were normalized to 200 credits in a previous patch. The knife remains at 400 as a risk-reward bonus.

### Loss Bonus (Streak) System

| Consecutive Losses | Loss Bonus | Total on Loss |
|---|---|---|
| 1st loss | +0 | 1,900 |
| 2nd consecutive loss | +500 | 2,400 |
| 3rd+ consecutive loss | +1,000 | 2,900 |

- The loss bonus resets when you win a round.
- After winning, if you then lose, you start back at the 1st loss tier (1,900).
- This system ensures that even after 2 consecutive losses, the losing team has 2,900 per player, enabling a force buy or close-to-full buy.

### Round Start Credits

| Round | Starting Credits |
|---|---|
| Pistol (Round 1) | 800 |
| Round 2 (after pistol win) | 3,000 + 800 = 3,800 |
| Round 2 (after pistol loss) | 1,900 + 800 = 2,700 |
| Overtime (each half) | 2,400 |

## Buy Type Definitions and Thresholds

### Full Buy

- **Definition**: Rifle (Vandal/Phantom) + Heavy Shield (50) + Full Abilities
- **Cost**: ~3,900-4,700 per player depending on agent
- **Threshold**: Buy when team average is 4,000+ credits
- Minimum acceptable full buy: Vandal (2,900) + Heavy Shield (1,000) = 3,900. Abilities are secondary.

### Half Buy (Force)

- **Definition**: SMG or Bulldog/Marshal + Light Shield (25) + Some Abilities
- **Cost**: ~2,000-2,800 per player
- **Threshold**: Buy when team average is 2,200-3,500 credits
- Common force buys: Spectre (1,600) + Light Shield (400) = 2,000. Or Marshal (950) + Light Shield (400) + ability = ~1,600.

### Eco (Save) Round

- **Definition**: Classic/Ghost/Sheriff only + optional Light Shield
- **Cost**: 0-900 per player
- **Threshold**: Buy when team average is below 2,000 credits AND losing
- The purpose of an eco is to save for next round's full buy, not to win this round.
- Eco round minimum spend: Ghost (500) or Sheriff (800). The Classic is free but severely limits your ability to get kills.

### Anti-Eco

- **Definition**: When the enemy is on eco and you have full buy advantage.
- Best weapons against eco: Spectre (run-and-gun close range), Judge (one-shot close range), Ares (spam through walls).
- Do NOT buy Operator on anti-eco. The enemy will push aggressively and the Op is weak in close quarters.

## Credit Thresholds Decision Framework

```
After a round, check team economy:

Team average 4,500+ → FULL BUY (rifle + heavy + abilities)
Team average 3,900-4,499 → FULL BUY (rifle + heavy, cut 1-2 abilities)
Team average 3,000-3,899 → FORCE BUY decision:
  ├── Score is close (within 3 rounds) → Force with Spectre/Bulldog + Light Shield
  ├── Score is not close → Save for full buy next round
  └── It's round 12 (last round of half) → ALWAYS force
Team average 2,000-2,999 → ECO
  ├── Unless it's match point → Force
  └── Unless loss bonus is maxed (2,900 next round) → Might force
Team average below 2,000 → FULL SAVE (spend nothing, Classic only)
```

## Reading Enemy Economy from Scoreboard

### Tracking Enemy Credits

You cannot see enemy credits directly, but you can infer:

1. **Count their kills**: Each kill = 200 credits. A player with 3 kills in the previous round earned 600 extra.
2. **Track round outcomes**: Did they win (3,000) or lose (1,900+loss bonus)?
3. **Watch for spike plants**: Planter gets +300, team gets +200 on loss.
4. **Observe their buys**: If they bought an Op last round (4,700), they likely have fewer credits this round.
5. **Track deaths**: Dying does not cost credits, but you drop your weapon. If they died and their weapon was not recovered, they must rebuy.

### Economy Reading Heuristics

- After the enemy wins pistol round, they have ~3,800. Round 2 they usually buy Spectre + Light Shield (2,000). Round 3 they can full buy.
- After the enemy loses pistol round, they have ~2,700. Round 2 is usually a save or light force. Round 3 they have ~4,600-5,100 (save + loss bonus + round income).
- If the enemy force-bought and lost, they are likely on a hard eco next round (1,900 income only).
- If 3+ enemies died with rifles and you picked up none, they need to rebuy 3 rifles (8,700 total team cost). This can break their economy even on a round win.

## Thrifty Round Strategies

A thrifty round is when you win a round while on eco/half-buy against a full-buy enemy. These are high-value rounds because they swing economy massively.

### Thrifty Tactics

1. **5-man rush a site**: On eco, buy Spectres or Judges and rush a site together. The speed and chaos can overwhelm a rifle setup before they can trade.
2. **Play for picks on defense**: Spread out, play aggressive off-angles with Sheriffs. One headshot kill = a rifle pickup. A single Sheriff pick can turn the round.
3. **Stack a site**: Put 4-5 players on one site with close-range weapons. Force the attackers into close-range duels where your SMGs/shotguns are competitive.
4. **Bait-and-switch**: Show presence at one site to pull a rotation, then rush the other site. Eco rounds succeed by creating confusion.

## Force Buy Scenarios (With Math)

### Scenario 1: Lost Pistol, Round 2

- Credits: 2,700 (1,900 loss + 800 starting).
- Option A: Save. Next round: 2,700 + 2,400 (2nd loss) = 5,100. Full buy with everything.
- Option B: Force with Spectre (1,600) + Light Shield (400) = 2,000. Remaining: 700. If you lose, next round: 700 + 2,900 (3rd loss) = 3,600. Tight full buy.
- Option C: Force with Marshal (950) + Light Shield (400) = 1,350. Remaining: 1,350. If you lose: 1,350 + 2,900 = 4,250. Comfortable full buy.
- **Recommendation**: Most pro teams save round 2 after pistol loss for a guaranteed full buy on round 3. Forcing is only worth it if your team composition has strong eco-round abilities (Raze, Neon, Jett).

### Scenario 2: Won 2 rounds, lost round 3

- Credits: 3,000 (win bonus round 2) - buy cost + 1,900 (loss) = depends on previous spend.
- Typical: ~3,500-4,500 credits.
- If above 3,900: Full buy.
- If below 3,900: Evaluate. If 4+ teammates can full buy, the low-economy player should request a weapon drop.

### Scenario 3: Match point against (11-12 or similar)

- ALWAYS full force, spend every credit. There is no "next round" if you lose.
- Buy the best weapon you can afford. Sheriff > Classic. Spectre > Sheriff. Phantom/Vandal > everything.
- Even if you have 1,600 credits and teammates have 0, buy a Spectre and play your life.

## Ult Orb Economy

Ultimate abilities charge through: kills (1 orb), deaths (1 orb), orb pickups (1 orb), and round completions (varies).

### Which Ults Are Worth Eco-ing For

| Agent | Ult Orbs Needed | Eco Priority | Reasoning |
|---|---|---|---|
| Jett (Bladestorm) | 7 | Medium | Free weapon, but Jett can buy anyway |
| Raze (Showstopper) | 8 | Low | Too many orbs, not worth delaying buys |
| Sova (Hunter's Fury) | 8 | Low | Strong but too expensive in orbs |
| Brimstone (Orbital Strike) | 7 | Medium | Excellent post-plant; worth having for key rounds |
| Sage (Resurrection) | 8 | HIGH | Resurrect is game-changing; worth eco-ing for |
| Killjoy (Lockdown) | 8 | Medium | Site lockdown is powerful for retakes |
| Viper (Viper's Pit) | 7 | HIGH | Transforms site defense; worth saving for |
| Omen (From the Shadows) | 7 | Low | Situational; not worth eco-ing for |
| Chamber (Tour De Force) | 7 | HIGH | Free Op essentially; saves 4,700 credits |
| KAY/O (NULL/cmd) | 7 | Medium | Strong for entry; good to have |
| Cypher (Neural Theft) | 6 | Medium | Info ult, cheap in orbs |
| Gekko (Thrash) | 7 | Medium | Can pick up and reuse |

### Ult Orb Locations and Timing

- Every map has 2 ultimate orbs that spawn at round start.
- Orbs typically spawn in mid or contested areas, forcing fights for them.
- Picking up an orb is worth 200+ credits in "ult economy" value. Prioritize orb control in default plays.
- The orb pickup sound is audible to enemies. Picking up an orb reveals your presence in that area.

## First Gun Round Economy Paths

The "first gun round" is typically round 3 or 4, when both teams can afford rifles.

### After Winning Pistol (2-0 up)

- Round 1 win: 3,000 + 800 = 3,800.
- Round 2 buy: Spectre (1,600) + Light Shield (400) + abilities (~300) = ~2,300. Remaining: ~1,500.
- Round 2 win: 1,500 + 3,000 = 4,500. Round 3: Full buy with everything.
- Round 2 loss: 1,500 + 1,900 = 3,400. Round 3: Tight buy. Rifle + Heavy but limited abilities.

### After Losing Pistol (0-2 down)

- Round 1 loss: 1,900 + 800 = 2,700. Save round 2.
- Round 2 loss: 2,700 + 2,400 = 5,100. Round 3: Full buy with max abilities and utility.
- This is why saving after pistol loss is standard. You get 5,100 credits for a stacked gun round.

## Overtime Economy

- Each overtime half gives each player 2,400 credits.
- This is enough for: Vandal (2,900)... wait, that is not enough for a Vandal alone.
- Actually in overtime you get exactly enough for a Phantom (2,900) OR Vandal (2,900) with a light shield at most, forcing economic choices.
- Light Shield (400) + Phantom (2,900) = 3,300. Not possible with 2,400. You need to choose: Phantom + no shield or Spectre + Heavy Shield.
- **Overtime buy priority**: Weapon > Shield > Abilities. A Vandal with no shield beats a Spectre with heavy shield in most engagements.
- Common overtime buys: Phantom/Vandal + 0-1 abilities (spend all 2,400 + any carryover). No heavy shield unless you have carryover from winning the previous OT round.

## Shield Value Analysis

| Shield | HP Added | Cost | Cost per HP |
|---|---|---|---|
| No Shield | 0 | 0 | N/A |
| Light Shield | 25 | 400 | 16 creds/HP |
| Heavy Shield | 50 | 1,000 | 20 creds/HP |

### When Light Shield > Heavy Shield

- On eco rounds where you want a Ghost + Light Shield (900 total) rather than just a Heavy Shield (1,000).
- Light shield survives one Vandal body shot (40 damage) but not two. Heavy shield survives two Vandal body shots.
- Against Spectres and SMGs, light shield often provides "enough" survivability for close-range duels.
- On rounds where you need to buy abilities, light shield + full utility often beats heavy shield + no utility.

### When No Shield is Acceptable

- Full eco: All credits go to saving for next round. Do not spend 400 on light shield if you are saving.
- If you only have 500 credits and need a Ghost (500) for any chance of getting a kill and picking up a weapon.

## Weapon Upgrade Paths

### Standard Progression

1. **Round 1 (Pistol)**: Ghost (500) or Light Shield + Classic abilities.
2. **Round 2 (Win)**: Spectre (1,600) or Marshal (950). Spectre is standard. Marshal if you have a player who hits heads.
3. **Round 2 (Loss/Save)**: Nothing. Save all credits.
4. **Round 3 (First gun round)**: Vandal (2,900) or Phantom (2,900) + Heavy Shield (1,000).
5. **Subsequent rounds**: Maintain Vandal/Phantom. Add Operator (4,700) for one player if team economy allows.

### Operator Economy Impact

- The Operator costs 4,700 credits. This is 1,800 more than a Vandal.
- An Operator player who dies without their team recovering the weapon costs the team 4,700 on the rebuy.
- Rule of thumb: Only buy an Operator if the team has average 5,000+ credits or if you are on defense with a safe position (can TP out as Chamber, dash out as Jett).
- A dead Operator player who loses their gun creates a "1,800 credit deficit" compared to if they had a Vandal. Over a half, this adds up.

## Chamber Economic Impact

Chamber is unique because his ultimate (Tour De Force) is essentially a free Operator.

- Tour De Force costs 7 ult orbs but saves 4,700 credits when available.
- Chamber's Headhunter (ability Sheriff) costs 100 per bullet, max 8 = 800 credits. This is equivalent to buying a Sheriff (800) but with better accuracy and no movement speed penalty.
- Chamber with ult available means the team can invest his would-be Operator money (4,700) into another player's utility or save it as buffer.
- Economic advantage per half: Chamber with good ult economy saves the team ~4,700-9,400 credits over a full half (1-2 Op buys replaced by ult).

## Team Buy Coordination Rules

1. **Never have 1 player full buy and 4 players eco.** Either the whole team buys or the whole team saves.
2. **Weapon drops**: If one player has 6,000+ credits and a teammate has 2,500, the rich player should buy a weapon for the teammate. The marginal value of that 2,900 is higher for the poor player.
3. **IGL calls the buy**: The IGL (or designated economy caller) decides the team buy type. No one goes rogue.
4. **Check team economy BEFORE buying**: Look at all 5 players' credits. If 3+ players cannot full buy, the team should save.
5. **Carry-over principle**: After winning 3+ rounds in a row, players should have excess credits. This is when to upgrade to Operator or buy extra abilities.
6. **Bonus round after pistol win**: Always buy Spectre + Light Shield. Do NOT buy rifles on the bonus round; the economy does not support it, and if you lose, you want credits for round 3.
