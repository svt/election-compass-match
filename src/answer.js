export const skippedAnswer = {
  isSkip: true,
  maxScore: 0.0,
  isImportant: false,
  match() {
    return 0.0;
  }
};

// prettier-ignore
const LIKERT_SCORING = {
  'AA': 11, 'AB':  8, 'AC':  3, 'AD':  0,
  'BA':  5, 'BB':  8, 'BC':  3, 'BD':  0,
  'CA':  0, 'CB':  3, 'CC':  8, 'CD':  5,
  'DA':  0, 'DB':  3, 'DC':  8, 'DD': 11,
};

export const LikertAlternative = {
  STRONGLY_DISAGREE: 'A',
  SOMEWHAT_DISAGREE: 'B',
  SOMEWHAT_AGREE: 'C',
  STRONGLY_AGREE: 'D'
};

export class PropositionAnswer {
  constructor(likertAlternative, { isImportant = false } = {}) {
    this.likertAlternative = likertAlternative;
    this.maxScore = LIKERT_SCORING[likertAlternative + likertAlternative];
    this.isImportant = isImportant;
  }

  match(other) {
    return LIKERT_SCORING[this.likertAlternative + other.likertAlternative];
  }
}

const PRIORITY_MAX_SCORE = 33;
const PRIORITY_ME_ANSWER_WEIGHT = 1.75;
const PRIORITY_YOU_ANSWER_WEIGHT = 1;

export class PriorityAnswer {
  constructor(selectedAlternatives, { isImportant = false } = {}) {
    this.selectedAlternatives = selectedAlternatives;
    this.maxScore = PRIORITY_MAX_SCORE;
    this.isImportant = isImportant;
  }

  match(other) {
    const sharedSelections = this.selectedAlternatives.filter((n) =>
      other.selectedAlternatives.includes(n)
    );
    const meSelectionsCount = this.selectedAlternatives.length;
    const youSelectionsCount = other.selectedAlternatives.length;

    const scorePerSharedSelection =
      ((this.maxScore / meSelectionsCount) * PRIORITY_ME_ANSWER_WEIGHT +
        (this.maxScore / youSelectionsCount) * PRIORITY_YOU_ANSWER_WEIGHT) /
      (PRIORITY_YOU_ANSWER_WEIGHT + PRIORITY_ME_ANSWER_WEIGHT);

    return sharedSelections.length * scorePerSharedSelection;
  }
}

function rangeScoring(me, you, N) {
  function maskWeight(me, N) {
    let fromMiddle = me - Math.ceil(N / 2);

    if (fromMiddle < 0 || N % 2 == 1)
      fromMiddle++;

    return Math.ceil(N / 2) - Math.abs(fromMiddle) - 1;
  };

  const rawScore = (N - Math.abs(me - you) - 1) * (N - 1);
  const mask = maskWeight(me, N) * (N - 1);

  return rawScore - mask;
};

export class RangeAnswer {
  constructor(selectedIndex, alternativesCount, { isImportant = false } = {}) {
    this.selectedIndex = selectedIndex;
    this.alternativesCount = alternativesCount;
	if (this.alternativesCount <= 1) {
		throw new Error(
		  `Range questions with ${
			this.alternativesCount
		  } alternatives are not supported.`
		);
	  }
    this.scoring = rangeScoring;
    this.maxScore = this.scoring(selectedIndex, selectedIndex, this.alternativesCount);
    this.isImportant = isImportant;
  }

  match(other) {
    return this.scoring(this.selectedIndex, other.selectedIndex, this.alternativesCount);
  }
}
