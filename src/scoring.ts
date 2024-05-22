export const DEFAULT_SCORING = {
  IMPORTANT_FACTOR_USER: 2,
  IMPORTANT_FACTOR_POLITICAL_ENTITY: 2,
  IMPORTANT_FACTOR_BOTH: 4,
  POLITICAL_ENTITY_PENALTY_FOR_SKIPPING: 2.5,
  // prettier-ignore
  PROPOSITION : {
    'A:A': 11, 'A:B':  8, 'A:C':  3, 'A:D':  0,
    'B:A':  5, 'B:B':  8, 'B:C':  3, 'B:D':  0,
    'C:A':  0, 'C:B':  3, 'C:C':  8, 'C:D':  5,
    'D:A':  0, 'D:B':  3, 'D:C':  8, 'D:D': 11,
  },
  // prettier-ignore
  RANGE: {
      '0:0': 16, '1:0':  8, '2:0':  0, '3:0':  0, '4:0':  0,
      '0:1': 12, '1:1': 12, '2:1':  4, '3:1':  4, '4:1':  4,
      '0:2':  8, '1:2':  8, '2:2':  8, '3:2':  8, '4:2':  8,
      '0:3':  4, '1:3':  4, '2:3':  4, '3:3': 12, '4:3': 12,
      '0:4':  0, '1:4':  0, '2:4':  0, '3:4':  8, '4:4': 16,
  },
  PRIORITY: {
    MAX_SCORE: 33,
    USER_ANSWER_WEIGHT: 1.75,
    POLITICAL_ENTITY_ANSWER_WEIGHT: 1,
  },
};
