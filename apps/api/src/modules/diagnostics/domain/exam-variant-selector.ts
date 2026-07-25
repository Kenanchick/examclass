import { INITIAL_DIAGNOSTIC_POLICY } from './diagnostic-policy';

export type ExamTaskCandidate = {
  id: string;
  publicId: string;
  examNumber: number;
  difficulty: number;
};

const hashSeed = (value: string) => {
  let hash = 2_166_136_261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
};

export const selectFullExamVariant = (
  candidates: ExamTaskCandidate[],
  seed: string,
) => {
  const result: ExamTaskCandidate[] = [];

  for (
    let examNumber = 1;
    examNumber <= INITIAL_DIAGNOSTIC_POLICY.examTaskCount;
    examNumber += 1
  ) {
    const available = candidates
      .filter((candidate) => candidate.examNumber === examNumber)
      .sort(
        (left, right) =>
          left.difficulty - right.difficulty ||
          left.publicId.localeCompare(right.publicId),
      );

    if (available.length === 0) {
      throw new Error(`Нет диагностической задачи №${examNumber}`);
    }

    result.push(
      available[hashSeed(`${seed}:${examNumber}`) % available.length],
    );
  }

  return result;
};
