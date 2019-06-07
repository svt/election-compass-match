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

// prettier-ignore
const RANGE_SCORING = {
  5: {
    '00': 16, '10':  8, '20':  0, '30':  0, '40':  0,
    '01': 12, '11': 12, '21':  4, '31':  4, '41':  4,
    '02':  8, '12':  8, '22':  8, '32':  8, '42':  8,
    '03':  4, '13':  4, '23':  4, '33': 12, '43': 12,
    '04':  0, '14':  0, '24':  0, '34':  8, '44': 16,
  }
};

export class RangeAnswer {
  constructor(selectedIndex, alternativesCount, { isImportant = false } = {}) {
    this.selectedIndex = selectedIndex;
    this.alternativesCount = alternativesCount;
    this.scoring = RANGE_SCORING[this.alternativesCount];
    if (!this.scoring) {
      throw new Error(
        `Range questions with ${
          this.alternativesCount
        } alternatives are not supported.`
      );
    }
    this.maxScore = this.scoring[`${selectedIndex}${selectedIndex}`];
    this.isImportant = isImportant;
  }

  match(other) {
    return this.scoring[`${this.selectedIndex}${other.selectedIndex}`];
  }
}
