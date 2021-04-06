import { match } from './match';
import { parseAnswers } from './answerEncoding';

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
    expectMatch(ANSWERS1, ANSWERS2, 81.58730158730158);
    expectMatch(ANSWERS1, ALL_SKIP, 0.0);

    // eslint-disable-next-line
    for (const [me, you, expected] of require('./testCompasses.json')) {
      expectMatch(me, you, expected);
    }
  });

  test('important factor is not commutative, only the answers marked as "important" for "me" matters', () => {
    expect(parseMatch('B;A;_;B!', 'B;_;A!;_')).toBe(
      parseMatch('B;A;_;B!', 'B!;_;A!;_')
    );
    expect(parseMatch('A;A;_;B', 'B;_;A;_')).toBe(
      parseMatch('A;A;_;B', 'B!;_;A!;_')
    );
  });

  test('priority answers', () => {
    expectMatch('[1,3]', '_', 0.0);
    expectMatch('[4]', '[4]', 100.0);
    expectMatch('[2]', '[1,3]', 0.0);
    expectMatch('[1,3]', '[1,3]', 100.0);
    expectMatch('[1,3,8]', '[1,3,8]', 100.0);
    expectMatch('[1,3,8]', '[3,8,1]', 100.0);
    expectMatch('[1,3]', '[1,3,8]', 87.87879);
    expectMatch('[1,3,8]', '[1,3]', 78.78788);
    expectMatch('[1,2]', '[2,4,8]', 43.93939);
  });

  test('a skipped answer in "you" is less bad than a mismatch', () => {
    expect(parseMatch('A;A', 'A;_')).toBeGreaterThan(parseMatch('A;A', 'A;D'));
  });

  test('range answers', () => {
    expectMatch('3/5', '3/5', 100.0);
    expectMatch('0/5', '4/5', 0.0);
    expectMatch('2/5', '_', 0.0);
    expect(parseMatch('3/5', '4/5')).toBeGreaterThan(parseMatch('2/5', '4/5'));
    expectMatch('3/6', '3/6', 100.0);
    expect(parseMatch('3/6', '4/6')).toBeGreaterThan(parseMatch('2/6', '4/6'));
  });

  test('important on everything is the same as important on nothing', () => {
    expect(parseMatch('A;B;A!;C;D!;[1,2]', 'D;B;D;D;A;[3]')).toBe(
      parseMatch('A;B;A!;C;D!;[1,2]', 'D!;B!;D!;D!;A!;[3]!')
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

  function expectMatch(me, you, expectedPercent) {
    expect(parseMatch(me, you)).toBeCloseTo(expectedPercent, 4);
  }

  function parseMatch(me, you) {
    return match(parseAnswers(me), parseAnswers(you)) * 100;
  }
});
