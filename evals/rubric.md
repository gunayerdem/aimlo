# AIMLO AI Coaching Output Quality Rubric

This rubric evaluates every AI-generated coaching output before it reaches the player. Each dimension is scored independently; the total determines whether the output ships or gets regenerated.

---

## Dimensions

### 1. Data Reference Density (0-3)

How well does the output ground its claims in the player's actual data?

| Score | Criteria |
|-------|----------|
| 0 | No numbers, percentages, or position names anywhere in the output |
| 1 | One vague reference (e.g., "you died a lot") |
| 2 | Multiple specific references using round numbers, percentages, or counts (e.g., "4 deaths at A Short", "38% win rate") |
| 3 | Every claim is backed by specific data from the player's match history |

### 2. Actionability (0-3)

Can the player actually do something different in their next game based on this advice?

| Score | Criteria |
|-------|----------|
| 0 | Vague advice with no clear action (e.g., "play better", "daha iyi oyna") |
| 1 | General direction without specifics (e.g., "change your position") |
| 2 | Specific action the player can take (e.g., "try playing off-angle at A Short instead of peeking the same corner") |
| 3 | Specific action + situational context + expected outcome (e.g., "when holding A Short on defense rounds, play the off-angle behind the box -- this should reduce your first-death rate since 3 of your 4 deaths there came from the same peek angle") |

### 3. Map/Agent Specificity (0-3)

Does the output demonstrate awareness of the specific map, agent, and game context?

| Score | Criteria |
|-------|----------|
| 0 | Advice could apply to any map, any agent, any game (completely generic) |
| 1 | Mentions map or agent name but the advice itself is generic |
| 2 | Map-specific position callouts or agent-specific ability references |
| 3 | Map + agent + side specific tactical advice (e.g., "on Ascent defense with Killjoy, your turret placement at B Main is getting destroyed early -- try the deeper angle near Market door") |

### 4. Non-Generic Quality (0-3)

Is the output clearly written for this specific player and not a template?

| Score | Criteria |
|-------|----------|
| 0 | Contains banned phrases: "daha dikkatli oyna", "dikkatli ol", "bilgi topla", "pozisyonunu gelistir", "takiminla oyna", "utility kullan", "daha iyi karar ver", "play carefully", "gather information", "improve positioning", "play with team", "use utility" |
| 1 | No banned phrases but reads like a fill-in-the-blank template |
| 2 | Somewhat personalized; references player-specific patterns but still has a formulaic feel |
| 3 | Clearly unique to this player's data; could not be copy-pasted to another player without rewriting |

### 5. Hallucination Absence (0 or -3)

Does the output contain any information that is not present in the input data?

| Score | Criteria |
|-------|----------|
| 0 | All information in the output can be traced back to the provided input data |
| -3 | Contains fabricated statistics, invented match details, or claims about data that was not provided |

This is a binary penalty. Any hallucination immediately deducts 3 points from the total.

### 6. Confidence Appropriateness (0-3)

Does the language certainty match the volume and quality of available data?

| Score | Criteria |
|-------|----------|
| 0 | Overconfident with very little data (e.g., "you always die here" after 2 matches) or underconfident with extensive data |
| 1 | Slightly mismatched -- mostly appropriate but some phrases overshoot or undershoot |
| 2 | Mostly appropriate; hedging language used with small samples, direct language used with large samples |
| 3 | Perfect match -- uses "it seems like" / "early data suggests" with few matches, and "consistently" / "pattern across N matches" with many |

**Guideline for confidence levels:**
- 1-3 matches: "calibrating" -- must use uncertain language
- 4-7 matches: "developing" -- can note emerging patterns
- 8-14 matches: "established" -- can state patterns with moderate confidence
- 15+ matches: "confident" -- can state patterns directly

### 7. Consistency with Deterministic Analytics (0-3)

Does the AI output align with the hard numbers from the analytics pipeline?

| Score | Criteria |
|-------|----------|
| 0 | Directly contradicts the data (e.g., says "strong attacker" when attack win rate is 30%) |
| 1 | Ignores key patterns visible in the data (e.g., never mentions a 0% map win rate) |
| 2 | Aligns with most patterns and references the important ones |
| 3 | Fully consistent with all data points and adds useful reasoning or interpretation on top |

---

## Scoring

| Range | Grade | Action |
|-------|-------|--------|
| 18-21 | Excellent | Ship as-is |
| 15-17 | Good | Ship (meets PASS threshold) |
| 12-14 | Acceptable | Ship with monitoring; flag for review |
| 9-11 | Below Standard | Regenerate with adjusted prompt |
| < 9 | Fail | Regenerate; investigate prompt/data issues |

**Total possible range: -3 to 21**
**Minimum acceptable score: 12**
**PASS threshold: 15**

---

## Applying the Rubric

1. Read the AI output alongside the input data that produced it.
2. Score each of the 7 dimensions independently.
3. Sum the scores.
4. If the total is below 12, the output must not be shown to the player.
5. Log the per-dimension scores for trend analysis.
