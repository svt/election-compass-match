import {
  PriorityAnswer,
  PropositionAnswer,
  RangeAnswer,
  skippedAnswer
} from './answer';

export function encodeAnswers(answers) {
  return answers
    .map((answer) => {
      let encodedAnswer;

      switch (answer.constructor) {
        case PropositionAnswer:
          encodedAnswer = answer.likertAnswer;
          break;

        case PriorityAnswer:
          encodedAnswer = JSON.stringify(answer.selectedAlternatives);
          break;

        case RangeAnswer:
          encodedAnswer = `${answer.selectedIndex}/${answer.alternativesCount}`;
          break;

        default:
          encodedAnswer = '_';
          break;
      }

      if (answer.isImportant) {
        encodedAnswer += '!';
      }

      return encodedAnswer;
    })
    .join(';');
}

export function parseAnswers(string) {
  const parts = string.split(';');
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    result.push(parseAnswer(parts[i]));
  }

  return result;
}

function parseAnswer(string) {
  if (string === '_') {
    return skippedAnswer;
  }
  if (/^[A-D]/.test(string)) {
    return parsePropositionAnswer(string);
  }
  if (/^\[/.test(string)) {
    return parsePriorityAnswer(string);
  }
  if (/^[0-9]/.test(string)) {
    return parseRangeAnswer(string);
  }
  throw new Error(`Invalid answer format: ${string}`);
}

function parsePropositionAnswer(string) {
  const isImportant = string[1] === '!';
  const likertAnswer = string[0];

  return new PropositionAnswer(likertAnswer, { isImportant });
}

function parsePriorityAnswer(string) {
  const isImportant = string.endsWith('!');
  if (isImportant) {
    string = string.slice(0, -1);
  }
  const selectedAlternatives = JSON.parse(string);

  return new PriorityAnswer(selectedAlternatives, { isImportant });
}

function parseRangeAnswer(string) {
  const isImportant = string.endsWith('!');
  if (isImportant) {
    string = string.slice(0, -1);
  }
  const [selectedIndex, alternativesCount] = string.split('/').map(Number);

  return new RangeAnswer(selectedIndex, alternativesCount, { isImportant });
}
