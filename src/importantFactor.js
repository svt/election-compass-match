const IMPORTANT_FACTOR = 4;

export default function importantFactor(answer) {
  if (answer.isImportant) {
    return IMPORTANT_FACTOR;
  }

  return 1;
}
