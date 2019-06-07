import importantFactor from './importantFactor';
import { zip } from './arrayUtils';

export function match(me, you) {
  const pairs = zip(me, you);

  let maxScore = 0;
  let score = 0;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    maxScore += maxScoreForPair(pair);
    score += scoreForPair(pair);
  }

  if (maxScore === 0) {
    return 0;
  }

  return score / maxScore;
}

function scoreForPair([me, you]) {
  return me.match(you) * importantFactor(me);
}

const NO_YOU_ANSWER_PENALTY = 2.5;

function maxScoreForPair([me, you]) {
  if (me.isSkip && you.isSkip) {
    return 0;
  }
  if (you.isSkip) {
    return NO_YOU_ANSWER_PENALTY * importantFactor(me);
  }

  return me.maxScore * importantFactor(me);
}
