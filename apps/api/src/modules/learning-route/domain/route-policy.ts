import type {
  RouteFactorBreakdown,
  RouteSkill,
  RouteSkillState,
} from './route-types';

export const LEARNING_ROUTE_ALGORITHM_VERSION = 'learning-route-v1';
export const DAY_MS = 24 * 60 * 60 * 1_000;

export const bounded = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

export const round = (value: number) => Math.round(value * 10_000) / 10_000;

export const isMastered = (state: RouteSkillState) =>
  !state.needsReview &&
  (state.status === 'MASTERED' ||
    state.status === 'TEACHER_CONFIRMED' ||
    (state.mastery >= 0.8 &&
      state.confidence >= 0.6 &&
      (state.stability ?? 0) >= 0.65));

export const isPrerequisiteReady = (state: RouteSkillState) =>
  !state.needsReview &&
  (state.status === 'TEACHER_CONFIRMED' ||
    (state.mastery >= 0.72 && state.confidence >= 0.5));

export const needsClarification = (state: RouteSkillState) =>
  state.status !== 'UNSTUDIED' &&
  (state.status === 'UNKNOWN' ||
    state.status === 'INSUFFICIENT_DATA' ||
    state.confidence < 0.45);

export const getKnowledgeGap = (state: RouteSkillState) => {
  if (state.status === 'UNSTUDIED') {
    return 1;
  }

  if (needsClarification(state)) {
    return 0.55;
  }

  if (state.needsReview || state.status === 'NEEDS_REVIEW') {
    return 0.35;
  }

  return bounded(1 - state.mastery, 0.08, 1);
};

export const getTargetRelevance = (skill: RouteSkill, targetScore: number) => {
  if (skill.examMappings.length === 0) {
    return skill.isFoundational ? 0.65 : 0.2;
  }

  const secondPartWeight =
    targetScore >= 90 ? 1.2 : targetScore >= 70 ? 0.72 : 0.35;

  return Math.max(
    ...skill.examMappings.map(
      (mapping) =>
        (mapping.examPart === 'FIRST' ? 1 : secondPartWeight) *
        bounded(mapping.weight, 0.25, 1.25),
    ),
  );
};

export const getExamImpact = (skill: RouteSkill) => {
  const importance = bounded(skill.importance / 5);
  const frequency = bounded(
    new Set(skill.examMappings.map((mapping) => mapping.examNumber)).size / 5,
  );
  const mappingWeight =
    skill.examMappings.length === 0
      ? 0
      : bounded(
          Math.max(...skill.examMappings.map((mapping) => mapping.weight)),
        );

  return 0.45 * importance + 0.35 * frequency + 0.2 * mappingWeight;
};

export const getDeadlineUrgency = (weeksUntilExam: number) =>
  1 + bounded((16 - weeksUntilExam) / 40, -0.1, 0.4);

export const getFactors = ({
  skill,
  targetScore,
  weeksUntilExam,
  prerequisiteReach,
  teacherAssigned,
}: {
  skill: RouteSkill;
  targetScore: number;
  weeksUntilExam: number;
  prerequisiteReach: number;
  teacherAssigned: boolean;
}): RouteFactorBreakdown => {
  const clarification = needsClarification(skill.state);

  return {
    knowledgeGap: round(getKnowledgeGap(skill.state)),
    targetRelevance: round(getTargetRelevance(skill, targetScore)),
    examImpact: round(getExamImpact(skill)),
    foundationalReach: round(
      1 +
        (skill.isFoundational ? 0.25 : 0) +
        Math.min(0.5, prerequisiteReach / 10),
    ),
    deadlineUrgency: round(getDeadlineUrgency(weeksUntilExam)),
    timeEfficiency: round(
      bounded(120 / Math.max(30, skill.estimatedMinutes), 0.55, 1.25),
    ),
    confidenceReliability: round(
      clarification
        ? 1 + (1 - skill.state.confidence) * 0.2
        : 0.75 + skill.state.confidence * 0.25,
    ),
    reviewBonus:
      skill.state.needsReview || skill.state.status === 'NEEDS_REVIEW'
        ? 0.65
        : 0,
    teacherBonus: teacherAssigned ? 2 : 0,
  };
};

export const getPriority = (factors: RouteFactorBreakdown) =>
  round(
    factors.knowledgeGap *
      factors.targetRelevance *
      factors.examImpact *
      factors.foundationalReach *
      factors.deadlineUrgency *
      factors.timeEfficiency *
      factors.confidenceReliability +
      factors.reviewBonus +
      factors.teacherBonus,
  );
