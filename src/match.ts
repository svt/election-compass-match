import { Answer, QuestionType } from './answer';
import { priorityMatcher, propositionMatcher, rangeMatcher } from './matchers';
import { DEFAULT_SCORING } from './scoring';

type MatchResults = {
  matchResult: number;
  maxScores: number[];
  scores: number[];
};

export function match(
  userAnswers: Answer[],
  politicalEntityAnswers: Answer[],
  scoring = DEFAULT_SCORING,
): number {
  return calculateMatchScores(userAnswers, politicalEntityAnswers, scoring)
    .matchResult;
}

export function calculateMatchScores(
  userAnswers: Answer[],
  politicalEntityAnswers: Answer[],
  scoring = DEFAULT_SCORING,
): MatchResults {
  if (userAnswers.length !== politicalEntityAnswers.length) {
    throw new Error(
      [
        'Expected both answer array to have the same length.',
        `userAnswers.length=${userAnswers.length}`,
        `politicalEntityAnswers.length=${politicalEntityAnswers.length}`,
      ].join('\n'),
    );
  }

  let maxScores = [];
  let scores = [];

  let maxScore = 0;
  let score = 0;
  for (let i = 0; i < userAnswers.length; i++) {
    const factor = getImportantFactor(
      userAnswers[i]?.isImportant,
      politicalEntityAnswers[i]?.isImportant,
      scoring,
    );

    const currentMaxScore =
      maxScoreForPair(userAnswers[i], politicalEntityAnswers[i], scoring) *
      factor;
    const currentScore =
      scoreForPair(userAnswers[i], politicalEntityAnswers[i], scoring) * factor;

    maxScore += currentMaxScore;
    score += currentScore;
    maxScores.push(currentMaxScore);
    scores.push(currentScore);
  }

  const matchResult = maxScore === 0 ? 0 : score / maxScore;

  return {
    matchResult,
    maxScores,
    scores,
  };
}

function scoreForPair(
  userAnswer: Answer,
  politicalEntityAnswer: Answer,
  scoring: typeof DEFAULT_SCORING,
) {
  if (userAnswer === null || politicalEntityAnswer === null) {
    return 0;
  }

  if (userAnswer.type !== politicalEntityAnswer.type) {
    throw new Error(
      [
        'Incompatible answer types.',
        `userAnswer.type=${userAnswer.type}`,
        `politicalEntityAnswer.type=${politicalEntityAnswer.type}`,
      ].join('\n'),
    );
  }

  // We've already checked that both answers are the same, but typescript can't infer that automatically
  // so we "cast" politicalEntityAnswer to be the type of userAnswer even though it already is
  switch (userAnswer.type) {
    case QuestionType.PROPOSITION:
      return propositionMatcher(
        userAnswer,
        politicalEntityAnswer as typeof userAnswer,
        scoring.PROPOSITION,
      );
    case QuestionType.PRIORITY:
      return priorityMatcher(
        userAnswer,
        politicalEntityAnswer as typeof userAnswer,
        scoring.PRIORITY,
      );
    case QuestionType.RANGE:
      return rangeMatcher(
        userAnswer,
        politicalEntityAnswer as typeof userAnswer,
        scoring.RANGE,
      );
    default:
      throw new Error(`Unexpected answer type`);
  }
}

function maxScoreForPair(
  userAnswer: Answer,
  politicalEntityAnswer: Answer,
  scoring: typeof DEFAULT_SCORING,
) {
  if (userAnswer === null && politicalEntityAnswer === null) {
    return 0;
  }
  if (politicalEntityAnswer === null) {
    return scoring.POLITICAL_ENTITY_PENALTY_FOR_SKIPPING;
  }
  return scoreForPair(userAnswer, userAnswer, scoring);
}

function getImportantFactor(
  importantForUser: boolean = false,
  importantForPoliticalEntity: boolean = false,
  scoring = DEFAULT_SCORING,
): number {
  if (importantForUser && importantForPoliticalEntity) {
    return scoring.IMPORTANT_FACTOR_BOTH;
  }

  if (importantForUser) {
    return scoring.IMPORTANT_FACTOR_USER;
  }

  if (importantForPoliticalEntity) {
    return scoring.IMPORTANT_FACTOR_POLITICAL_ENTITY;
  }

  return 1;
}
