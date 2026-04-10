# AIMLO Evaluation Framework

This directory contains the quality evaluation framework for AIMLO's AI coaching outputs. It ensures that AI-generated advice is specific, data-grounded, and actionable rather than generic or hallucinated.

## Structure

```
evals/
  rubric.md              # Human-readable scoring rubric (7 dimensions, 0-21 scale)
  generic-detector.ts    # Automated quality checker (TypeScript)
  README.md              # This file
  cases/
    dashboard-cases.json # 5 test cases for dashboard-level AI outputs
    feedback-cases.json  # 3 test cases for round-by-round feedback
```

## Rubric

The rubric in `rubric.md` defines 7 scoring dimensions:

1. **Data Reference Density** -- are claims backed by numbers?
2. **Actionability** -- can the player act on the advice?
3. **Map/Agent Specificity** -- is the advice context-aware?
4. **Non-Generic Quality** -- is it personalized, not templated?
5. **Hallucination Absence** -- is all info traceable to input data?
6. **Confidence Appropriateness** -- does certainty match data volume?
7. **Consistency with Deterministic Analytics** -- does it align with hard stats?

Total range: -3 to 21. PASS threshold: 15. Minimum acceptable: 12.

## Generic Detector

`generic-detector.ts` exports a `checkOutputQuality()` function that programmatically checks AI outputs. It returns a score (0-100) and a list of issues.

### What it checks

- **Forbidden phrases**: Catches banned generic advice in Turkish and English (e.g., "daha dikkatli oyna", "play carefully")
- **Minimum word count**: Flags fields under 10 words
- **Numeric references**: Counts stats, percentages, round numbers
- **Map references**: Checks for Valorant map names
- **Agent references**: Checks for Valorant agent names
- **Position references**: Checks for callout names (A Short, B Main, etc.)
- **Side references**: Checks for attack/defense mentions
- **Template detection**: Flags fields with identical opening phrases

### Usage

```typescript
import { checkOutputQuality } from "./evals/generic-detector";

const result = checkOutputQuality(
  {
    deathAnalysis: "A Short'ta 7 ölüm yaşadın, hep aynı köşeden peek atıyorsun...",
    nextRoundPlan: "Bu raund B Main'den Killjoy turret'ını market kapısına koy...",
  },
  { map: "Ascent", agent: "Killjoy" }
);

if (!result.passed) {
  console.log("Quality issues:", result.issues);
  // Regenerate or flag the output
}
```

## Test Cases

### Dashboard cases (`cases/dashboard-cases.json`)

5 scenarios covering different data conditions:

| # | Case | Tests |
|---|------|-------|
| 1 | Low data (2 matches) | Uncertain language, no overclaiming |
| 2 | Strong death pattern (8 matches) | Pattern identification, direct advice |
| 3 | Side imbalance (attack 30% / defense 65%) | Side-specific feedback |
| 4 | Map weakness (0% on Ascent) | Map-specific problem flagging |
| 5 | Generic output risk (average stats) | Resistance to templated advice |

### Feedback cases (`cases/feedback-cases.json`)

3 round-by-round scenarios:

| # | Case | Tests |
|---|------|-------|
| 1 | First round (R1) | No pattern claims, single-event focus |
| 2 | Round 10, repeated deaths | In-match pattern detection |
| 3 | Round 24, match point | Full-match summary, confident tactical advice |

## Adding New Cases

1. Create a new entry in the appropriate JSON file.
2. Provide realistic `context` data matching what the AI prompt receives.
3. Define `expectedBehavior` with:
   - `shouldContain` / `shouldNotContain`: exact strings to check
   - `shouldContainAnyOf`: at least one must appear
   - `minimumScore`: rubric score threshold for this case
   - Any boolean flags relevant to the scenario
4. Run the generic detector against the AI output for that case to verify automated checks pass.

## Running Evals

Type-check the generic detector:

```bash
npx tsc --noEmit evals/generic-detector.ts
```

To evaluate an AI output against a test case, feed the case context to the AI prompt, capture the output, then pass it through `checkOutputQuality()`. Compare the result against the case's `expectedBehavior`.
