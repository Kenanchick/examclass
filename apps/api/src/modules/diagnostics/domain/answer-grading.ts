const normalizeMinus = (value: string) =>
  value.replaceAll('−', '-').replaceAll('–', '-');

export const normalizeShortAnswer = (value: string) =>
  normalizeMinus(value)
    .trim()
    .toLowerCase()
    .replaceAll(',', '.')
    .replace(/\s+/g, '');

const parseSimpleNumber = (value: string) => {
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  const fraction = value.match(/^(-?\d+)\/(-?\d+)$/);

  if (!fraction || Number(fraction[2]) === 0) {
    return null;
  }

  return Number(fraction[1]) / Number(fraction[2]);
};

export const gradeExactAnswer = (
  actualAnswer: string | null | undefined,
  expectedAnswer: string | null | undefined,
) => {
  if (!actualAnswer?.trim() || !expectedAnswer?.trim()) {
    return false;
  }

  const actual = normalizeShortAnswer(actualAnswer);
  const acceptedAnswers = expectedAnswer
    .split('||')
    .map(normalizeShortAnswer)
    .filter(Boolean);
  const actualNumber = parseSimpleNumber(actual);

  return acceptedAnswers.some((expected) => {
    if (actual === expected) {
      return true;
    }

    const expectedNumber = parseSimpleNumber(expected);

    return (
      actualNumber !== null &&
      expectedNumber !== null &&
      Math.abs(actualNumber - expectedNumber) < 1e-9
    );
  });
};
