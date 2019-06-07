# Election ”Compass“ Match

The algorithm used by [SVT's Valkompass](https://valkompassen.svt.se) to get a percentage of how well two entities' political opinions are aligned.

## Overview

[SVT's Valkompass](https://valkompassen.svt.se) works like this:

1. Political candidates and political parties answer a set of questions developed by independent political analysts, with the express intent to find the most contentious and divisive issues, such that the answers given are as diverse as possible.
2. Individuals answer the same set of questions.
3. To each candidate/party, the individual's answers are compared, yielding a percentage of how similar the answers were.
4. The percentages are revealed to the user, giving them an indication to which parties or candidates most closely reflect their political view.

This library fits in at step 3 :point_up:

---

The matching has a _direction_. It's not commutative. We call the individual `me`, and the political entity `you`. Of course, the algorithm can be run the other way around, but it will answer a different question.

It works like this:

1. For each answer pair `(me, you)`,
   - Let `maxScore` be the _potential_ of a strong political consesus. This should correspond to a distinct statement by `me`.
   - Let `score` be a value corresponding to the closeness of the two answers.
2. Sum all the `maxScore` and `score` values for both answer sets.
3. Divide `score` with `maxScore` to get the fractional match result.

### Types of Answers

To make the compass more interesting, it includes different types of questions, and therefore different kinds of answers. The match algorithm is built to support adding more types of questions/answers, as long as they conform to the procedure described above.

Here's what's available right now:

| Name                | Description                                                                         | Encoded format                                                      |
| :------------------ | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `PropositionAnswer` | A reaction to a political proposition given in a four-level [Likert scale][likert]. | Characters `A` (strongly disagree) through `D` (strongly agree)     |
| `PriorityAnswer`    | A multi-choice answer to a question of prioritizing political issues.               | An array of indices in JSON-like format (e.g. `[0,4]`)              |
| `RangeAnswer`       | A single choice from `N` alternatives.                                              | The index of the choice and the number of alternatives (e.g. `0/5`) |

> **Note:** Currently, the `RangeAnswer` only supports answers to questions with exactly five alternatives.

Each answer can be marked as important to the respondent, making the match in that question more impactful to the overall match result (when marked by `me`). This is encoded by suffixing with an exclamation point (`!`).

The encoded format for multiple answers is separating the answers with semicolons (`;`).

[likert]: https://en.wikipedia.org/wiki/Likert_scale

### Skipped Questions

Any answer can also be replaced with a "skipped" answer, both by `me` and `you`, impacting the match result in the following way:

- If `me` has skipped a question, it has no impact at all. The question is simply removed from the calculation.
- If `you` has skipped a question, it penalizes `you` by adding onto the `maxScore` but scoring `0`.

A skipped-question answer is encoded as an underscore (`_`).

### Usage

The answers can be parsed from their canonical encoding format, or constructed manually:

```javascript
import {
  PropositionAnswer,
  PriorityAnswer,
  RangeAnswer,
  skippedAnswer,
  parseAnswers,
  match
} from 'election-compass-match';

const me = parseAnswers('D!;[0,3];_;0/5;B');
const you = [
  new PropositionAnswer('A', { isImportant: false }),
  new PriorityAnswer([1, 2], { isImportant: false }),
  new PropositionAnswer('B', { isImportant: true }),
  new RangeAnswer(0, 5, { isImportant: false }),
  skippedAnswer
];

const fractionalMatch = match(me, you); // 0.16753926701570682
```
