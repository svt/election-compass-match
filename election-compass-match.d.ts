declare module 'election-compass-match' {
  /**
   * An answer to a compass question. Used by the match function
   * to match one answer to another.
   */
  interface AnswerBase {
    /**
     * Whether the answer was marked as _important_ to the
     * respondent. If true on the _me_ side, this makes the
     * overall match result be more sensitive to this question.
     */
    readonly isImportant: boolean;

    /**
     * The maximum score that a compared answer can get using the
     * _match_ method. The score divided by the max score gives the
     * match result for this question.
     */
    readonly maxScore: number;
  }

  export type Answer =
    | PropositionAnswer
    | PriorityAnswer
    | RangeAnswer
    | SkippedAnswer;

  /**
   * An answer to a question whether one agrees or disagrees with a
   * political proposition.
   */
  export interface PropositionAnswer extends AnswerBase {
    readonly likertAlternative: LikertAlternative;

    match(other: PropositionAnswer): number;
  }

  export const PropositionAnswer: new (
    likertAlternative: LikertAlternative,
    opts?: { isImportant?: boolean }
  ) => PropositionAnswer;

  export type LikertAlternative = 'A' | 'B' | 'C' | 'D';
  export const LikertAlternative: {
    STRONGLY_DISAGREE: 'A';
    SOMEWHAT_DISAGREE: 'B';
    SOMEWHAT_AGREE: 'C';
    STRONGLY_AGREE: 'D';
  };

  /**
   * An answer consisting of multiple choices out of a set.
   */
  export interface PriorityAnswer extends AnswerBase {
    readonly selectedAlternatives: number[];

    match(other: PriorityAnswer): number;
  }

  export const PriorityAnswer: new (
    selectedAlternatives: number[],
    opts?: { isImportant?: boolean }
  ) => PriorityAnswer;

  /**
   * An answer selected from a range from one extreme to another.
   */
  export interface RangeAnswer extends AnswerBase {
    readonly selectedIndex: number;
    readonly alternativesCount: number;

    match(other: RangeAnswer): number;
  }

  export const RangeAnswer: new (
    selectedIndex: number,
    alternativesCount: number,
    opts?: { isImportant?: boolean }
  ) => RangeAnswer;

  /**
   * A answer that marks a question as skipped.
   */
  export interface SkippedAnswer extends AnswerBase {
    readonly isSkip: true;

    match(answer: Answer): number;
  }

  export const skippedAnswer: SkippedAnswer;

  /**
   * Compares all the answers in _me_ will all the answers in _you_,
   * returning a fractional match result of how aligned the answer are.
   *
   * @throws Error if the arrays have different lengths.
   * @throws Error if two answers to be matched are not the same kind of
   *         answer, with the exception of skipped answers.
   *
   * @param me The respondent who is looking to compare their opinion.
   * @param you The respondent to whom the other will be compared.
   */
  export function match(me: Answer[], you: Answer[]): number;

  /**
   * Parses an answer string like:
   *
   *     A;B!;C;2/5;[1,5,4];B!;C;A;A;_;A;_;C;D!
   *
   * into an array of answer objects, ready to be passed to the
   * _match_ function.
   */
  export function parseAnswers(encoded: string): Answer[];

  /**
   * Encodes an array of answers into a string that can be parsed
   * using the _parseAnswers_ function.
   */
  export function encodeAnswers(answers: Answer[]): string;
}
