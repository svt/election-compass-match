import { match } from '../match';
import { parseAnswers } from '../answerCodec';
import { DEFAULT_SCORING } from '../scoring';
import data from '../testCompasses.json';

const testCompasses = data as [string, string, number][];
const OLD_SCORING = {
  ...DEFAULT_SCORING,
  IMPORTANT_FACTOR_USER: 4,
  IMPORTANT_FACTOR_POLITICAL_ENTITY: 1,
  IMPORTANT_FACTOR_BOTH: 4,
};

function expectMatch(
  userAnswers: string,
  politicalEntityAnswers: string,
  expectedPercent: number,
  scoring = DEFAULT_SCORING,
) {
  expect(parseMatch(userAnswers, politicalEntityAnswers, scoring)).toBeCloseTo(
    expectedPercent,
    4,
  );
}

function parseMatch(
  userAnswers: string,
  politicalEntityAnswers: string,
  scoring = DEFAULT_SCORING,
) {
  return (
    match(
      parseAnswers(userAnswers),
      parseAnswers(politicalEntityAnswers),
      scoring,
    ) * 100
  );
}

describe('match', () => {
  const ALL_SKIP =
    '_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_;_';
  const ANSWERS1 =
    'D;B;B;C;A;A;B;B;C;A;A!;B;A;C;C;_;B;C;A;D;B;B;A;C;C;A!;B;A;D;B;B;C;A;A;B;B;C;A;A!;B;A;C;C;_;B;C;A;D;B;B;A;C;C;A!;B;A';
  const ANSWERS2 =
    'B;A;C;D;A;B;B;B;B;A;A!;C;B;C;D!;_;B;D;C;D;B;A;B;C;D;A;B;A;B;A;C;D;A;B;B;B;B;A;A!;C;B;C;D!;_;B;D;C;D;B;A;B;C;D;A;B;A';

  test('skipping all answers should give 0 percent', () => {
    expectMatch(ALL_SKIP, ANSWERS1, 0.0);
  });

  test('a full match on single question compass should give 100 percent', () => {
    for (const answers of ['A', 'B', 'C', 'D']) {
      const answersExtraImportant = answers + '!';

      expectMatch(answers, answers, 100.0);
      expectMatch(answersExtraImportant, answersExtraImportant, 100.0);
    }
  });

  test('a full match should give 100 percent', () => {
    expectMatch(ANSWERS1, ANSWERS1, 100.0);
  });

  test('a known result', () => {
    expectMatch(ANSWERS1, ANSWERS2, 81.58730158730158, OLD_SCORING);
    expectMatch(ANSWERS1, ALL_SKIP, 0.0, OLD_SCORING);

    for (const [
      userAnswers,
      politicalEntityAnswers,
      expected,
    ] of testCompasses) {
      expectMatch(userAnswers, politicalEntityAnswers, expected, OLD_SCORING);
    }
  });

  test('important factor was not commutative, only the answers marked as `important` for `user` mattered', () => {
    expect(parseMatch('B;A;_;B!', 'B;_;A!;_', OLD_SCORING)).toBe(
      parseMatch('B;A;_;B!', 'B!;_;A!;_', OLD_SCORING),
    );
    expect(parseMatch('A;A;_;B', 'B;_;A;_', OLD_SCORING)).toBe(
      parseMatch('A;A;_;B', 'B!;_;A!;_', OLD_SCORING),
    );
  });

  test('priority answers', () => {
    expectMatch('[1,3]', '_', 0.0);
    expectMatch('_', '[1,3]', 0.0);
    expectMatch('[2,4];[1,3]', '[2,4];_', 92.95775);
    expectMatch('[2,4];_', '[2,4];[1,3]', 100.0);
    expectMatch('[4]', '[4]', 100.0);
    expectMatch('[2]', '[1,3]', 0.0);
    expectMatch('[1,3]', '[1,3]', 100.0);
    expectMatch('[1,3,8]', '[1,3,8]', 100.0);
    expectMatch('[1,3,8]', '[3,8,1]', 100.0);
    expectMatch('[1,3]', '[1,3,8]', 87.87879);
    expectMatch('[1,3,8]', '[1,3]', 78.78788);
    expectMatch('[1,2]', '[2,4,8]', 43.93939);
  });

  test('an empty priority answers list is equivalent to skipping', () => {
    expect(parseMatch('[1,3]', '[]')).toBe(parseMatch('[1,3]', '_'));
    expect(parseMatch('[]', '[1,3]')).toBe(parseMatch('_', '[1,3]'));
    expect(parseMatch('[2,4];[1,3]', '[2,4];[]')).toBe(
      parseMatch('[2,4];[1,3]', '[2,4];_'),
    );
    expect(parseMatch('[2,4];[]', '[2,4];[1,3]')).toBe(
      parseMatch('[2,4];_', '[2,4];[1,3]'),
    );
  });

  // Skipping all questions results in a 0 score, so we need to have at least one
  // question that is not skipped
  test('a skipped answer by `politicalEntity` is less bad than a mismatch', () => {
    expect(parseMatch('A;A', 'A;_')).toBeGreaterThan(parseMatch('A;A', 'A;C'));
    expect(parseMatch('A;A', 'A;_')).toBeGreaterThan(parseMatch('A;A', 'A;D'));
    expect(parseMatch('A;B', 'A;_')).toBeGreaterThan(parseMatch('A;B', 'A;D'));
    expect(parseMatch('A;C', 'A;_')).toBeGreaterThan(parseMatch('A;C', 'A;A'));

    expect(parseMatch('A;[1,3,8]', 'A;_')).toBeGreaterThan(
      parseMatch('A;[1,3,8]', 'A;[1,2,5]'),
    );
    expect(parseMatch('A;[1,2]', 'A;_')).toBeGreaterThan(
      parseMatch('A;[1,2]', 'A;[2,4,8]'),
    );
    expect(parseMatch('A;[1,2,3]', 'A;_')).toBeGreaterThan(
      parseMatch('A;[1,2,3]', 'A;[4,5,6]'),
    );
    expect(parseMatch('A;[1,2]', 'A;_')).toBeGreaterThan(
      parseMatch('A;[1,2]', 'A;[4,6,8]'),
    );

    expect(parseMatch('A;0/5', 'A;_')).toBeGreaterThan(
      parseMatch('A;0/5', 'A;3/5'),
    );
    expect(parseMatch('A;0/5', 'A;_')).toBeGreaterThan(
      parseMatch('A;0/5', 'A;4/5'),
    );
    expect(parseMatch('A;0/5', 'A;_')).toBeGreaterThan(
      parseMatch('A;1/5', 'A;3/5'),
    );
    expect(parseMatch('A;1/5', 'A;_')).toBeGreaterThan(
      parseMatch('A;1/5', 'A;4/5'),
    );
  });

  test('range answers', () => {
    expectMatch('3/5', '3/5', 100.0);
    expectMatch('0/5', '4/5', 0.0);
    expectMatch('2/5', '_', 0.0);
    expect(parseMatch('3/5', '4/5')).toBeGreaterThan(parseMatch('2/5', '4/5'));
  });

  test('important on everything is the same as important on nothing', () => {
    expect(parseMatch('A;B;A;C;D;[1,2]', 'D;B;D;D;A;[3]')).toBe(
      parseMatch('A;B;A;C;D;[1,2]', 'D!;B!;D!;D!;A!;[3]!'),
    );

    expect(parseMatch('A;B;A;C;D;[1,2]', 'D;B;D;D;A;[3]')).toBe(
      parseMatch('A!;B!;A!;C!;D!;[1,2]!', 'D;B;D;D;A;[3]'),
    );

    expect(parseMatch('A;B;A;C;D;[1,2]', 'D;B;D;D;A;[3]')).toBe(
      parseMatch('A!;B!;A!;C!;D!;[1,2]!', 'D!;B!;D!;D!;A!;[3]!'),
    );

    expect(parseMatch('A!;B!;A!;C!;D!;[1,2]!', 'D!;B!;D!;D!;A!;[3]!')).toBe(
      parseMatch('A!;B!;A!;C!;D!;[1,2]!', 'D!;B!;D!;D!;A!;[3]!'),
    );
  });

  test('it should throw if the answers arrays are of different lengths', () => {
    expect(() => {
      parseMatch('A;B;C;D', 'A;B;C');
    }).toThrow(/same length/i);
  });

  test('it should throw if two answers are of different kinds', () => {
    expect(() => {
      parseMatch('A;B', 'A;[1,2]');
    }).toThrow(/proposition[^]*priority/i);
  });

  test('it should be fast', () => {
    for (let i = 0; i < 1e4; i++) {
      expectMatch(ANSWERS1, ANSWERS2, 79.734219269103);
    }
  });

  test('it should be possible to provide your own scoring', () => {
    const CUSTOM_SCORING = {
      IMPORTANT_FACTOR_USER: 4,
      IMPORTANT_FACTOR_POLITICAL_ENTITY: 3,
      IMPORTANT_FACTOR_BOTH: 5,
      POLITICAL_ENTITY_PENALTY_FOR_SKIPPING: 100,
      // prettier-ignore
      PROPOSITION : {
        'A:A': 20, 'A:B': 10, 'A:C':  5,  'A:D':  0,
        'B:A': 10, 'B:B': 20, 'B:C': 10,  'B:D':  5,
        'C:A':  5, 'C:B': 10, 'C:C': 20,  'C:D': 10,
        'D:A':  0, 'D:B':  5, 'D:C': 10,  'D:D': 20,
      },
      // prettier-ignore
      RANGE: {
          '0:0': 20, '1:0': 15, '2:0':  10, '3:0':  5, '4:0':  0,
          '0:1': 15, '1:1': 20, '2:1':  15, '3:1': 10, '4:1':  5,
          '0:2': 10, '1:2': 15, '2:2':  20, '3:2': 15, '4:2': 10,
          '0:3':  5, '1:3': 10, '2:3':  15, '3:3': 20, '4:3': 15,
          '0:4':  0, '1:4':  5, '2:4':  10, '3:4': 15, '4:4': 20,
      },
      PRIORITY: {
        MAX_SCORE: 50,
        USER_ANSWER_WEIGHT: 2,
        POLITICAL_ENTITY_ANSWER_WEIGHT: 1,
      },
    };

    const userAnswers = parseAnswers(ANSWERS1);
    const politicalEntityAnswers = parseAnswers(ANSWERS2);

    const defaultMatch = match(userAnswers, politicalEntityAnswers);
    const customMatch = match(
      userAnswers,
      politicalEntityAnswers,
      CUSTOM_SCORING,
    );

    // Protect against NaN
    expect(defaultMatch).toBeGreaterThan(0);
    expect(customMatch).toBeGreaterThan(0);

    expect(defaultMatch).not.toEqual(customMatch);
  });
});
