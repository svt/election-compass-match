import {
  LikertAlternative,
  PriorityAnswer,
  PropositionAnswer,
  QuestionType,
  RangeAnswer,
  SelectedIndex,
  Answer,
} from './answer';

type EncodedLikertAnswer = LikertAlternative | `${LikertAlternative}!`;
type EncodedRangeAnswer = `${SelectedIndex}/5` | `${SelectedIndex}/5!`;

export function parseAnswers(answersString: string) {
  const encodedAnswers = answersString.split(';');
  const parsedAnswers: Answer[] = [];
  for (let i = 0; i < encodedAnswers.length; i++) {
    parsedAnswers.push(parseAnswer(encodedAnswers[i]));
  }

  return parsedAnswers;
}

export function parseAnswer(answer: string) {
  if (answer === '_' || answer === '[]' || answer === '[]!') {
    return null;
  }
  if (/^[A-D]!?$/.test(answer)) {
    return parsePropositionAnswer(answer as EncodedLikertAnswer);
  }
  if (/^\[/.test(answer)) {
    return parsePriorityAnswer(answer);
  }
  if (/^[0-4]/.test(answer)) {
    return parseRangeAnswer(answer as EncodedRangeAnswer);
  }
  throw new Error(`Invalid answer format: ${answer}`);
}

function parsePropositionAnswer(
  answer: EncodedLikertAnswer,
): PropositionAnswer {
  const isImportant = answer.endsWith('!');
  const likertAlternative = answer[0] as LikertAlternative;

  return { type: QuestionType.PROPOSITION, likertAlternative, isImportant };
}

function parsePriorityAnswer(answer: string): PriorityAnswer {
  const isImportant = answer.endsWith('!');
  answer = answer.replace('!', '');

  const selectedAlternatives = JSON.parse(answer);

  return { type: QuestionType.PRIORITY, isImportant, selectedAlternatives };
}

function parseRangeAnswer(answer: string): RangeAnswer {
  const isImportant = answer.endsWith('!');
  answer = answer.replace('!', '');

  const [selectedIndex, alternativesCount] = answer.split('/').map(Number);
  if (alternativesCount !== 5) {
    throw new Error(`Only 5 alternatives are allowed`);
  }

  if (![0, 1, 2, 3, 4].includes(selectedIndex)) {
    throw new Error(`Invalid alternative selected: ${selectedIndex}`);
  }

  return {
    type: QuestionType.RANGE,
    alternativesCount,
    isImportant,
    selectedIndex,
  };
}

export function encodeAnswer(answer: Answer) {
  if (answer === null) {
    return '_';
  }

  let encodedAnswer;

  switch (answer.type) {
    case QuestionType.PROPOSITION:
      encodedAnswer = answer.likertAlternative;
      break;

    case QuestionType.PRIORITY:
      if (answer.selectedAlternatives.length === 0) {
        return '_';
      }
      encodedAnswer = JSON.stringify(answer.selectedAlternatives);
      break;

    case QuestionType.RANGE:
      encodedAnswer = `${answer.selectedIndex}/${answer.alternativesCount ?? 5}`;
      break;

    default:
      encodedAnswer = '_';
      break;
  }

  if (answer.isImportant) {
    encodedAnswer += '!';
  }

  return encodedAnswer;
}

export function encodeAnswers(answers: Answer[]) {
  return answers.map((a) => encodeAnswer(a)).join(';');
}
