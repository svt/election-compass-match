import {
  parseAnswers,
  parseAnswer,
  encodeAnswer,
  encodeAnswers,
} from '../answerCodec';
import {
  LikertAlternative,
  PriorityAnswer,
  PropositionAnswer,
  QuestionType,
  RangeAnswer,
  SelectedIndex,
} from '../answer';

describe('codec', () => {
  describe('parsing', () => {
    test('parseAnswer can parse proposition answer', () => {
      const answerA = parseAnswer('A') as PropositionAnswer;
      expect(answerA.type).toBe(QuestionType.PROPOSITION);
      expect(answerA.likertAlternative).toBe(
        LikertAlternative.STRONGLY_DISAGREE,
      );

      const answerB = parseAnswer('B') as PropositionAnswer;
      expect(answerB.type).toBe(QuestionType.PROPOSITION);
      expect(answerB.likertAlternative).toBe(
        LikertAlternative.SOMEWHAT_DISAGREE,
      );

      const answerC = parseAnswer('C') as PropositionAnswer;
      expect(answerC.type).toBe(QuestionType.PROPOSITION);
      expect(answerC.likertAlternative).toBe(LikertAlternative.SOMEWHAT_AGREE);

      const answerD = parseAnswer('D') as PropositionAnswer;
      expect(answerD.type).toBe(QuestionType.PROPOSITION);
      expect(answerD.likertAlternative).toBe(LikertAlternative.STRONGLY_AGREE);
    });

    test('parseAnswer can parse important proposition answer', () => {
      const notImportant = ['A', 'B', 'C', 'D'].map((a) => parseAnswer(a));

      for (const answer of notImportant) {
        expect(answer?.isImportant).not.toBe(true);
      }
      const important = ['A!', 'B!', 'C!', 'D!'].map((a) => parseAnswer(a));

      for (const answer of important) {
        expect(answer?.isImportant).toBe(true);
      }
    });

    test('parseAnswer can parse range answer', () => {
      const answer0 = parseAnswer('0/5') as RangeAnswer;
      expect(answer0.type).toBe(QuestionType.RANGE);
      expect(answer0.selectedIndex).toBe(0);

      const answer1 = parseAnswer('1/5') as RangeAnswer;
      expect(answer1.type).toBe(QuestionType.RANGE);
      expect(answer1.selectedIndex).toBe(1);

      const answer2 = parseAnswer('2/5') as RangeAnswer;
      expect(answer2.type).toBe(QuestionType.RANGE);
      expect(answer2.selectedIndex).toBe(2);

      const answer3 = parseAnswer('3/5') as RangeAnswer;
      expect(answer3.type).toBe(QuestionType.RANGE);
      expect(answer3.selectedIndex).toBe(3);

      const answer4 = parseAnswer('4/5') as RangeAnswer;
      expect(answer4.type).toBe(QuestionType.RANGE);
      expect(answer4.selectedIndex).toBe(4);
    });

    test('parseAnswer can parse important proposition answer', () => {
      const notImportant = ['0/5', '1/5', '2/5', '3/5', '4/5'].map((a) =>
        parseAnswer(a),
      );

      for (const answer of notImportant) {
        expect(answer?.isImportant).not.toBe(true);
      }
      const important = ['0/5!', '1/5!', '2/5!', '3/5!', '4/5!'].map((a) =>
        parseAnswer(a),
      );

      for (const answer of important) {
        expect(answer?.isImportant).toBe(true);
      }
    });

    test('parseAnswer can parse priority answer', () => {
      const answer0 = parseAnswer('[0,5]') as PriorityAnswer;
      expect(answer0.type).toBe(QuestionType.PRIORITY);
      expect(answer0.selectedAlternatives).toEqual([0, 5]);

      const answer1 = parseAnswer('[1]') as PriorityAnswer;
      expect(answer1.type).toBe(QuestionType.PRIORITY);
      expect(answer1.selectedAlternatives).toEqual([1]);

      const answer2 = parseAnswer('[2,7,11]') as PriorityAnswer;
      expect(answer2.type).toBe(QuestionType.PRIORITY);
      expect(answer2.selectedAlternatives).toEqual([2, 7, 11]);

      const answer3 = parseAnswer('[3,9]') as PriorityAnswer;
      expect(answer3.type).toBe(QuestionType.PRIORITY);
      expect(answer3.selectedAlternatives).toEqual([3, 9]);

      const answer4 = parseAnswer('[4,2]') as PriorityAnswer;
      expect(answer4.type).toBe(QuestionType.PRIORITY);
      expect(answer4.selectedAlternatives).toEqual([4, 2]);
    });

    test('parseAnswer can parse important priority answer', () => {
      const notImportant = ['[0,5]', '[1]', '[2,7,11]', '[3,9]', '[4,2]'].map(
        (a) => parseAnswer(a),
      );

      for (const answer of notImportant) {
        expect(answer?.isImportant).not.toBe(true);
      }
      const important = ['[0,5]!', '[1]!', '[2,7,11]!', '[3,9]!', '[4,2]!'].map(
        (a) => parseAnswer(a),
      );

      for (const answer of important) {
        expect(answer?.isImportant).toBe(true);
      }
    });
  });

  describe('encoding', () => {
    test('encodeAnswer can encode proposition answer', () => {
      expect(
        encodeAnswer({
          type: QuestionType.PROPOSITION,
          likertAlternative: LikertAlternative.STRONGLY_DISAGREE,
        }),
      ).toBe('A');

      expect(
        encodeAnswer({
          type: QuestionType.PROPOSITION,
          likertAlternative: LikertAlternative.STRONGLY_DISAGREE,
          isImportant: false,
        }),
      ).toBe('A');

      expect(
        encodeAnswer({
          type: QuestionType.PROPOSITION,
          likertAlternative: LikertAlternative.STRONGLY_DISAGREE,
          isImportant: true,
        }),
      ).toBe('A!');
    });

    test('encodeAnswer can encode range answer', () => {
      expect(
        encodeAnswer({
          type: QuestionType.RANGE,
          selectedIndex: SelectedIndex.MUCH_LESS,
        }),
      ).toBe('0/5');

      expect(
        encodeAnswer({
          type: QuestionType.RANGE,
          selectedIndex: SelectedIndex.MUCH_LESS,
          isImportant: false,
        }),
      ).toBe('0/5');

      expect(
        encodeAnswer({
          type: QuestionType.RANGE,
          selectedIndex: SelectedIndex.MUCH_LESS,
          isImportant: true,
        }),
      ).toBe('0/5!');
    });

    test('encodeAnswer can encode priority answer', () => {
      expect(
        encodeAnswer({
          type: QuestionType.PRIORITY,
          selectedAlternatives: [1, 2, 3],
        }),
      ).toBe('[1,2,3]');

      expect(
        encodeAnswer({
          type: QuestionType.PRIORITY,
          selectedAlternatives: [1, 2, 3],
          isImportant: false,
        }),
      ).toBe('[1,2,3]');

      expect(
        encodeAnswer({
          type: QuestionType.PRIORITY,
          selectedAlternatives: [1, 2, 3],
          isImportant: true,
        }),
      ).toBe('[1,2,3]!');
    });
  });
});
