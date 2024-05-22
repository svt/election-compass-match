import { PriorityAnswer, PropositionAnswer, RangeAnswer } from './answer';
import { DEFAULT_SCORING } from './scoring';

export function propositionMatcher(
  userAnswer: PropositionAnswer,
  politicalEntityAnswer: PropositionAnswer,
  scoring = DEFAULT_SCORING.PROPOSITION,
) {
  return scoring[
    `${userAnswer.likertAlternative}:${politicalEntityAnswer.likertAlternative}`
  ];
}

export function priorityMatcher(
  userAnswer: PriorityAnswer,
  politicalEntityAnswer: PriorityAnswer,
  scoring = DEFAULT_SCORING.PRIORITY,
) {
  const sharedSelections = userAnswer.selectedAlternatives.filter((n) =>
    politicalEntityAnswer.selectedAlternatives.includes(n),
  );
  const userSelectionsCount = userAnswer.selectedAlternatives.length;
  if (userSelectionsCount === 0) {
    throw new Error('User must select at least one alternative');
  }

  const politicalEntitySelectionsCount =
    politicalEntityAnswer.selectedAlternatives.length;
  if (userSelectionsCount === 0) {
    throw new Error('Political entity must select at least one alternative');
  }

  const scorePerSharedSelection =
    ((scoring.MAX_SCORE / userSelectionsCount) * scoring.USER_ANSWER_WEIGHT +
      (scoring.MAX_SCORE / politicalEntitySelectionsCount) *
        scoring.POLITICAL_ENTITY_ANSWER_WEIGHT) /
    (scoring.POLITICAL_ENTITY_ANSWER_WEIGHT + scoring.USER_ANSWER_WEIGHT);

  return sharedSelections.length * scorePerSharedSelection;
}

export function rangeMatcher(
  userAnswer: RangeAnswer,
  politicalEntityAnswer: RangeAnswer,
  scoring = DEFAULT_SCORING.RANGE,
) {
  return scoring[
    `${userAnswer.selectedIndex}:${politicalEntityAnswer.selectedIndex}`
  ];
}
