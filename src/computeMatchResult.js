import match from './match';
import storage from '../storage';
import { shuffle } from './arrayUtils';
import uuid from 'uuid/v4';

function matchAll(answers, partiesOrCandidates) {
  const matches = [];
  for (let i = 0; i < partiesOrCandidates.length; i++) {
    const partyOrCandidate = partiesOrCandidates[i];
    const percentMatch = match(answers, partyOrCandidate.answers);
    matches.push({
      id: partyOrCandidate.id,
      percentMatch
    });
  }

  const shuffled = shuffle(matches);

  return shuffled.sort((a, b) => {
    return b.percentMatch - a.percentMatch;
  });
}

export default async function computeMatchResult(answers, bundle) {
  const partiesResult = matchAll(answers, bundle.parties);
  const candidatesResult = matchAll(answers, bundle.candidates);
  const matchId = uuid();
  const matchResult = {
    id: matchId,
    version: bundle.version,
    parties: partiesResult,
    candidates: candidatesResult
  };

  await storage.storeMatchResult(matchId, matchResult);

  return matchResult;
}
