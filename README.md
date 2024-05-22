# Election Compass Match

The algorithm used by [SVT's Valkompass (election compass)](https://valkompass.svt.se) to get a percentage of how well two entities' political opinions are aligned.

## Overview

[SVT's Valkompass](https://valkompass.svt.se) works like this:

1. Political candidates and political parties answer a set of questions developed by independent political analysts, with the express intent to find the most contentious and divisive issues, such that the answers given are as diverse as possible.
2. Individuals answer the same set of questions.
3. To each candidate/party, the individual's answers are compared, yielding a percentage of how similar the answers were.
4. The percentages are revealed to the user, giving them an indication to which parties or candidates most closely reflect their political view.

This library fits in at step 3 :point_up:

---

The matching has a _direction_. It's not commutative. We call the individual `user`, and the political entity `politicalEntity`. Of course, the algorithm can be run the other way around, but it will answer a different question.

It works like this:

1. For each answer pair `(user, politicalEntity)`,
   - Let `maxScore` be the _potential_ of a strong political consensus. This should correspond to a distinct statement by the `user`.
   - Let `score` be a value corresponding to the closeness of the two answers.
   - If marked as `important` by the `user` and/or `politicalEntity`, multiply `score` and `maxScore` by an `importantFactor`
2. Sum all the `maxScore` and `score` values for both answer sets.
3. Divide `score` with `maxScore` to get the fractional match result.

### Types of Answers

To make the compass more interesting, it includes different types of questions, and therefore different kinds of answers. The match algorithm is built to support adding more types of questions/answers, as long as they conform to the procedure described above.

Here's what's available right now:

| Name                | Description                                                                         | Encoded format                                                      |
| :------------------ | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `PropositionAnswer` | A reaction to a political proposition given in a four-level [Likert scale][likert]. | Characters `A` (strongly disagree) through `D` (strongly agree)     |
| `RangeAnswer`       | A single choice from `N` alternatives.                                              | The index of the choice and the number of alternatives (e.g. `0/5`) |
| `PriorityAnswer`    | A multi-choice answer to a question of prioritizing political issues.               | An array of indices in JSON-like format (e.g. `[0,4]`)              |

> **Note:** Currently, the `RangeAnswer` only supports answers to questions with exactly five alternatives.

Each answer can be marked as important to the respondent, making the match in that question more impactful to the overall match result (when marked by the `user`). This is encoded by suffixing with an exclamation point (`!`).

The encoded format for multiple answers is separating the answers with semicolons (`;`).

[likert]: https://en.wikipedia.org/wiki/Likert_scale

### Skipped Questions

Any answer can also be replaced with a "skipped" answer, both by the `user` and `politicalEntity`, impacting the match result in the following way:

- If the `user` has skipped a question, it has no impact at all. The question is simply removed from the calculation.
- If `politicalEntity` has skipped a question, it penalizes `politicalEntity` by adding `POLITICAL_ENTITY_PENALTY_FOR_SKIPPING` onto the `maxScore` but scoring `0`.

A skipped-question answer is encoded as an underscore (`_`).

### Usage

The answers can be parsed from their canonical encoding format, or constructed manually:

```javascript
import {
  PropositionAnswer,
  PriorityAnswer,
  RangeAnswer,
  parseAnswers,
  match,
} from 'election-compass-match';

const user = parseAnswers('D!;[0,3];_;0/5;B');
const politialEntity = [
  { type: PropositionAnswer, likertAlternative: 'A', isImportant: false },
  { type: PriorityAnswer, selectedAlternatives: [1, 2], isImportant: false },
  { type: PropositionAnswer, likertAlternative: 'B', isImportant: true },
  { type: RangeAnswer, selectedIndex: 0, isImportant: false },
  null,
];

const fractionalMatch = match(user, politialEntity); // 0.16753926701570682
```

#### Difference from 2018

Besides the newly added `RangeAnswer` type, a slight adjustment has also been made to how strong of a penalty the _you_ side gets if it hasn't answered a question. In the 2018 algorithm, the penalty was a `5` unit increase in the `maxScore`, yielding a small decrease in the resulting quotient after the `score / maxScore` operation. In 2019 the penalty is `2.5` instead, which makes the penalty smaller.

#### Difference from 2019

##### Functional

The matching algorithm has been converted into a functional programming approach, mostly to separate the scoring from being part of the answer, thereby making it easier to use a custom scoring.

##### Custom scoring

All matching related functions can now take an optional `scoring` parameter at the end with custom scoring. This is set to the `DEFAULT_SCORING` from [src/scoring.ts](src/scoring.ts) by default, which is the scoring used in the [2024 EU Election Compass](https://valkompass.svt.se/eu-2024/).

##### Important scoring

Previous years only questions marked as important _by the `user`_ was given extra weight. This time, we also give extra weight to a question that was marked as important by the `politicalEntity`. We also provide a distinct weight for when both have marked the question as important, but that weight is still set to the product of the two weights this time around.

The weights are set as follows and can be found in [src/scoring.ts](src/scoring.ts):

```
IMPORTANT_FACTOR_USER: 2,
IMPORTANT_FACTOR_POLITICAL_ENTITY: 2,
IMPORTANT_FACTOR_BOTH: 4,
```

##### Additional return values

Another difference is that the `score` and `maxScore` for each question is returned by the `match` function in the arrays `scores` and `maxScores`. The total match result is provided in `matchResult`.

## License

Copyright 2024 Sveriges Television AB.

Election Compass Match is released under the [MIT License](LICENSE).

## Maintenance

This code base should be seen as UNMAINTAINED, and provided as-is for transparency. However, we might still consider PRs and issues if found.
