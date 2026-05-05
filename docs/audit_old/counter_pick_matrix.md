# AIMLO KB — Counter-Pick Symmetry Matrix (Valorant Agents)

Audit date: 2026-04-05
Agents audited: 29 (duelists 8, sentinels 7, initiators 7, controllers 7 — including Miks, Veto, Waylay)
Total counter relations extracted: 144
Source: `§5. Counter-Pick` sections across `/Users/gunayerdem/Desktop/aimlo/knowledge/agents/**`

Convention: a row `A` lists whom `A` is countered by (i.e. agents that appear in `A`'s §5). A check in column `B` means `B`'s name appears in `A`'s counter-pick list.

Legend: `X` = listed, `.` = not listed, `—` = self.

## Matrix

| A \ B | jet | raz | pho | rey | yor | neo | iso | way | cyp | kil | cha | sag | dea | vys | vet | sov | bre | sky | kay | fad | gek | tej | bri | vip | ome | ast | har | clo | mik |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| jett | — | . | . | . | . | . | . | . | X | X | X | . | . | . | . | X | X | . | . | . | . | . | . | . | . | . | . | . | . |
| raze | . | — | . | . | . | . | . | . | X | X | X | . | . | . | . | . | . | . | X | . | . | . | . | X | . | . | X | . | . |
| phoenix | . | X | — | . | . | . | . | . | X | . | X | . | . | . | . | . | . | . | X | . | . | . | . | X | . | . | . | . | . |
| reyna | . | . | . | — | . | . | . | . | X | X | X | . | . | . | . | . | . | . | X | . | . | . | . | X | . | . | . | . | . |
| yoru | . | . | . | . | — | . | . | . | X | X | . | . | . | . | . | X | . | . | X | X | . | . | . | . | . | . | . | . | . |
| neon | . | . | . | . | . | — | . | . | X | X | X | . | . | . | . | X | . | . | . | . | . | . | . | X | . | . | . | . | . |
| iso | . | X | . | . | . | . | — | . | . | X | X | . | . | . | . | X | . | . | X | . | . | . | . | . | . | . | . | . | . |
| waylay | . | . | . | . | . | . | . | — | X | X | X | . | . | . | . | X | . | . | X | . | . | . | . | . | . | . | . | . | . |
| cypher | . | X | . | . | . | . | . | . | — | . | . | . | . | . | . | X | . | . | X | X | . | . | . | X | . | . | . | . | . |
| killjoy | . | X | . | . | . | . | . | . | . | — | . | . | . | . | . | X | X | . | X | . | . | . | . | X | . | . | . | . | . |
| chamber | X | X | . | . | . | . | . | . | . | . | — | . | . | . | . | X | X | . | X | . | . | . | . | . | . | . | . | . | . |
| sage | . | X | . | . | . | . | . | . | . | . | X | — | . | . | . | . | X | . | X | . | . | . | . | X | . | . | . | . | . |
| deadlock | . | X | . | . | . | . | . | . | . | . | . | . | — | . | . | X | X | . | X | . | . | . | . | . | . | . | . | . | . |
| vyse | . | X | . | . | . | . | . | . | . | . | . | . | . | — | . | X | X | . | X | X | . | . | . | . | . | . | . | . | . |
| veto | . | X | X | . | X | X | . | . | . | . | . | . | . | . | — | . | . | . | X | . | . | . | . | . | . | . | . | . | . |
| sova | X | . | . | . | X | . | . | . | . | . | X | . | . | . | . | — | . | . | X | . | . | . | . | . | X | . | . | . | . |
| breach | X | . | . | X | X | . | . | . | . | . | X | . | . | . | . | . | — | . | . | . | . | . | . | . | X | . | . | . | . |
| skye | . | . | . | . | . | . | . | . | . | . | X | . | . | . | . | X | . | — | X | . | . | . | . | X | X | . | . | . | . |
| kayo | . | . | . | X | X | . | . | . | . | . | X | . | . | . | . | . | . | . | — | . | . | . | . | X | X | . | . | . | . |
| fade | . | . | . | X | X | . | . | . | . | . | X | . | . | . | . | . | . | . | X | — | . | . | . | . | X | . | . | . | . |
| gekko | X | . | . | . | . | . | . | . | . | . | X | . | . | . | . | X | . | . | X | . | — | . | . | . | X | . | . | . | . |
| tejo | X | . | . | X | . | . | . | . | . | . | X | . | . | . | . | . | . | . | X | . | . | — | . | . | X | . | . | . | . |
| brimstone | . | X | . | . | . | . | . | . | . | . | . | . | . | . | . | X | X | . | X | . | . | . | — | X | . | . | . | . | . |
| viper | . | X | . | . | . | . | . | . | . | . | . | . | . | . | . | X | X | X | X | . | . | . | . | — | . | . | . | . | . |
| omen | . | . | . | . | . | . | . | . | X | . | . | . | X | . | . | X | . | . | X | . | . | . | . | X | — | . | . | . | . |
| astra | . | X | . | . | X | . | . | . | . | . | . | . | . | . | . | X | X | . | X | . | . | . | . | . | . | — | . | . | . |
| harbor | . | X | . | . | . | . | . | . | X | . | . | . | . | . | . | X | X | . | X | . | . | . | . | . | . | . | — | . | . |
| clove | . | . | . | . | . | . | . | . | X | X | . | . | . | . | . | X | X | . | X | . | . | . | . | . | . | . | . | — | . |
| miks | . | X | . | . | . | . | . | . | X | . | . | . | . | . | . | X | X | . | X | . | . | . | . | . | . | . | . | . | — |

Row reading example: the `jett` row shows Jett is countered by Cypher, Killjoy, Chamber, Sova, Breach.

## Per-agent "who counters whom" (forward direction)

"X counters Y" relations derived from `Y.md` listing `X`.

- **KAY/O counters** (25): raze, phoenix, reyna, yoru, iso, waylay, cypher, killjoy, chamber, sage, deadlock, vyse, veto, sova, skye, fade, gekko, tejo, brimstone, viper, omen, astra, harbor, clove, miks
- **Sova counters** (18): jett, yoru, neon, iso, waylay, cypher, killjoy, chamber, vyse, skye, deadlock, brimstone, viper, omen, astra, harbor, clove, miks
- **Chamber counters** (15): jett, raze, phoenix, reyna, neon, iso, waylay, sage, sova, breach, skye, kayo, fade, gekko, tejo
- **Raze counters** (14): phoenix, iso, cypher, killjoy, chamber, sage, deadlock, vyse, veto, brimstone, viper, astra, harbor, miks
- **Breach counters** (12): jett, chamber, killjoy, sage, deadlock, vyse, brimstone, viper, astra, harbor, clove, miks
- **Cypher counters** (11): jett, raze, phoenix, reyna, yoru, neon, waylay, omen, harbor, clove, miks
- **Viper counters** (9): raze, phoenix, reyna, neon, cypher, sage, skye, kayo, brimstone
- **Killjoy counters** (8): jett, raze, reyna, yoru, neon, iso, waylay, clove
- **Omen counters** (7): sova, breach, skye, kayo, fade, gekko, tejo
- **Yoru counters** (6): sova, breach, kayo, fade, astra, veto
- **Jett counters** (5): chamber, sova, breach, gekko, tejo
- **Reyna counters** (4): breach, kayo, fade, tejo
- **Fade counters** (3): yoru, cypher, vyse
- **Phoenix counters** (1): veto
- **Neon counters** (1): veto
- **Skye counters** (1): viper
- **Deadlock counters** (1): omen

Agents that counter no one in the KB: iso, waylay, sage, vyse, veto, gekko, tejo, brimstone, astra, harbor, clove, miks. These are "countered" roles (defensive setup / info-dependent / new meta) that no file frames as a hard counter to another agent.

## Asymmetry Analysis

### CRITICAL (bidirectional relationship expected, one side missing)

1. **Harbor ↔ Raze** — `harbor.md` lists Raze as a counter to Harbor (Raze grenades + boom bot zone Harbor's static post-plant stance). `raze.md` did NOT list Harbor. Bidirectional case holds: Harbor Cascade walls Raze satchel lanes, High Tide slows Raze close entry, Cove shield absorbs Raze grenade denial, Reckoning disrupts Raze aggressive peek. **FIXED**: Harbor entry added to `raze.md` §5.

No other relations met the CRITICAL threshold. All remaining one-ways are either (a) KAY/O suppress uniqueness, (b) sentinel info-trap vs mobility asymmetry, (c) recon vs setup asymmetry, or (d) AoE vs static anchor asymmetry — all defensible as one-directional.

### MAJOR (bidirectional present but framing may conflict)

None found. All bidirectional pairs use consistent framing:
- Jett ↔ Chamber (dash vs Op/Trademark — matched framing)
- Chamber ↔ Raze (AoE vs Trademark anchor — matched)
- Chamber ↔ Sova (recon vs teleport retreat — matched)
- Chamber ↔ Breach (stun vs teleport — matched)
- Chamber ↔ KAY/O (suppress vs teleport — matched)
- Sova ↔ Omen (smoke vs recon — matched)
- Sova ↔ Yoru (teleport vs dart — matched)
- Sova ↔ Jett (dash vs dart — matched)
- Breach ↔ Jett (dash vs stun — matched)
- Raze ↔ Viper (wall vs grenade — matched)
- Raze ↔ Cypher (trap vs AoE — matched)
- Raze ↔ Killjoy (setup vs AoE — matched)
- Viper ↔ KAY/O (suppress vs decay — matched)
- Viper ↔ Skye (flash interrupt vs decay — matched)
- Yoru ↔ KAY/O (suppress vs teleport — matched)
- Yoru ↔ Fade (prowler vs gatecrash — matched)
- Reyna ↔ KAY/O (suppress vs dismiss — matched)
- KAY/O ↔ Omen (smoke vs suppress — matched)
- Phoenix ↔ Raze? — (actually one-way, Raze→Phoenix only)

### ACCEPTABLE one-way counters (no fix needed)

These are unique-mechanism or role-asymmetric counters that should remain one-directional.

**KAY/O suppress (unique mechanic)** — KAY/O counters most agents via Zero/Point; no reciprocal because no other agent has a hard counter to suppress:
- KAY/O → raze, phoenix, iso, waylay, cypher, killjoy, sage, deadlock, vyse, veto, sova, skye, fade, gekko, tejo, brimstone, astra, harbor, clove, miks (20 one-ways)

**Cypher trap/cam (info vs mobility)** — one-way vs duelists and info-weak controllers:
- Cypher → jett, phoenix, reyna, yoru, neon, waylay, omen, harbor, clove, miks (10 one-ways)

**Killjoy setup (anchor vs duelist)**:
- Killjoy → jett, reyna, yoru, neon, iso, waylay, clove (7 one-ways)

**Chamber Op/teleport (long range vs mobility/close)**:
- Chamber → phoenix, reyna, neon, iso, waylay, sage, skye, fade, gekko, tejo (10 one-ways)

**Sova recon (info vs setup/static)**:
- Sova → neon, iso, waylay, cypher, killjoy, vyse, skye, deadlock, brimstone, viper, astra, harbor, clove, miks, gekko (15 one-ways)

**Breach stun/flash (AoE vs static/setup)**:
- Breach → killjoy, sage, deadlock, vyse, brimstone, viper, astra, harbor, clove, miks (10 one-ways)

**Raze AoE (grenade vs static setup)**:
- Raze → phoenix, iso, sage, deadlock, vyse, veto, brimstone, astra, miks (9 one-ways; Harbor now bidirectional after fix)

**Viper decay/wall (zone vs heal/close)**:
- Viper → phoenix, reyna, neon, cypher, sage, brimstone (6 one-ways)

**Omen smoke/paranoia (flex vs info/flash)**:
- Omen → breach, skye, fade, gekko, tejo (5 one-ways)

**Yoru teleport/fake (mobility vs anchor/info)**:
- Yoru → breach, astra, veto (3 one-ways)

**Reyna dismiss (intangible vs flash/stun/slow)**:
- Reyna → breach, fade, tejo (3 one-ways)

**Fade prowler/haunt (seeker vs trap/lurk)**:
- Fade → cypher, vyse (2 one-ways)

**Jett dash (mobility vs info/drone)**:
- Jett → gekko, tejo (2 one-ways)

**Single-instance unique counters** (role/info-independence):
- Phoenix → veto (self-sufficient duelist, info-independent)
- Neon → veto (self-sufficient duelist, info-independent)
- Skye → viper (flash interrupt + heal vs decay — actually bidirectional, see above)
- Deadlock → omen (sensor vs shrouded step)

## Notes on scope

- "Fast Execute Comps" appears in `deadlock.md` and `veto.md` as a non-agent team-composition counter and was not included in the matrix.
- `miks.md` §5 carries a `[VERIFY]` flag noting that its counter matchups are tentative because meta is not yet settled.
- No duplicate agent files exist (no `duelists/breach.md` or `sentinels/veto.md` — veto is under sentinels, breach is under initiators, as expected).
