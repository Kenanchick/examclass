import type { ProfileEvidence, ProfileEvidenceSource } from './profile-types';

export const KNOWLEDGE_PROFILE_FORMULA_VERSION = 'knowledge-profile-v1';
export const DAY_MS = 24 * 60 * 60 * 1_000;
const HALF_LIFE_DAYS = 180;

const sourceWeight: Record<ProfileEvidenceSource, number> = {
  FULL_EXAM: 1,
  ADAPTIVE_TASK: 1.1,
  THEORY_QUESTION: 0.7,
  MANUAL_REVIEW: 1.2,
  SELF_REPORT: 0,
  HOMEWORK: 0.85,
  CONTROL_WORK: 1,
  MOCK_EXAM: 1.1,
  LESSON: 0.75,
  TEACHER_CONFIRMATION: 1.3,
};

const independenceWeight = {
  UNKNOWN: 0.85,
  INDEPENDENT: 1,
  MINOR_HINT: 0.75,
  MAJOR_HELP: 0.45,
} as const;

export const bounded = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));
export const round = (value: number) => Math.round(value * 10_000) / 10_000;

const getRecencyFactor = (occurredAt: Date, asOf: Date) => {
  const ageDays = Math.max(0, (asOf.getTime() - occurredAt.getTime()) / DAY_MS);

  return Math.max(0.35, 0.5 ** (ageDays / HALF_LIFE_DAYS));
};

const getDifficultyFactor = (
  difficulty: number | null | undefined,
  score: number,
) => {
  const normalizedDifficulty = Math.min(3, Math.max(1, difficulty ?? 2));

  return score >= 0.7
    ? 0.9 + normalizedDifficulty * 0.1
    : 1.1 - normalizedDifficulty * 0.1;
};

const getConfidenceFactor = (
  selfConfidence: number | null | undefined,
  score: number,
) => {
  if (!selfConfidence) {
    return 1;
  }

  if (score >= 0.7 && selfConfidence <= 2) {
    return 0.85;
  }

  if (score < 0.5 && selfConfidence >= 4) {
    return 1.1;
  }

  return 1;
};

const getErrorFactor = (
  errorType: ProfileEvidence['errorType'],
  score: number,
) => {
  if (score >= 0.7 || !errorType || errorType === 'NONE') {
    return 1;
  }

  const factors: Record<
    Exclude<NonNullable<ProfileEvidence['errorType']>, 'NONE'>,
    number
  > = {
    COMPUTATION: 0.7,
    CONCEPTUAL: 1.1,
    MODELING: 1.05,
    LOGIC: 1.05,
    NOTATION: 0.65,
    INCOMPLETE: 0.85,
    MISREAD_CONDITION: 0.55,
  };

  return factors[errorType];
};

export const getEvidenceFactors = (evidence: ProfileEvidence, asOf: Date) => ({
  source: sourceWeight[evidence.source],
  independence: independenceWeight[evidence.independence ?? 'UNKNOWN'],
  recency: getRecencyFactor(evidence.occurredAt, asOf),
  difficulty: getDifficultyFactor(evidence.difficulty, evidence.score),
  selfConfidence: getConfidenceFactor(evidence.selfConfidence, evidence.score),
  error: getErrorFactor(evidence.errorType, evidence.score),
  teacher: evidence.teacherConfirmed ? 1.15 : 1,
});

export const getSpeedScore = (evidence: ProfileEvidence) => {
  if (
    evidence.score < 0.6 ||
    !evidence.activeSeconds ||
    !evidence.expectedSeconds
  ) {
    return null;
  }

  const ratio = evidence.activeSeconds / evidence.expectedSeconds;

  return bounded(1.2 - ratio * 0.3, 0.2, 1);
};

export const getReviewIntervalDays = (
  mastery: number,
  stability: number | null,
) => {
  if (mastery >= 0.85 && (stability ?? 0) >= 0.8) {
    return 90;
  }

  if (mastery >= 0.75 && (stability ?? 0) >= 0.6) {
    return 45;
  }

  return 21;
};
