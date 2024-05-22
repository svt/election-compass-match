export enum QuestionType {
  PROPOSITION = 'PROPOSITION',
  PRIORITY = 'PRIORITY',
  RANGE = 'RANGE',
}

export enum LikertAlternative {
  STRONGLY_DISAGREE = 'A',
  SOMEWHAT_DISAGREE = 'B',
  SOMEWHAT_AGREE = 'C',
  STRONGLY_AGREE = 'D',
}

export enum SelectedIndex {
  MUCH_LESS = 0,
  LESS = 1,
  NO_CHANGE = 2,
  MORE = 3,
  MUCH_MORE = 4,
}

export type Answer = PropositionAnswer | RangeAnswer | PriorityAnswer | null;

export interface IAnswer {
  type: QuestionType;
  isImportant?: boolean;
}

export interface PropositionAnswer extends IAnswer {
  likertAlternative: LikertAlternative;
  type: QuestionType.PROPOSITION;
}

export interface RangeAnswer extends IAnswer {
  selectedIndex: SelectedIndex;
  alternativesCount?: 5;
  type: QuestionType.RANGE;
}

export interface PriorityAnswer extends IAnswer {
  selectedAlternatives: number[];
  type: QuestionType.PRIORITY;
}
