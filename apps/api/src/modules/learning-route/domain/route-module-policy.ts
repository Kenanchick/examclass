import {
  bounded,
  getTargetRelevance,
  isMastered,
  needsClarification,
  round,
} from './route-policy';
import type {
  PlannedRouteSkill,
  RouteFactorBreakdown,
  RouteModuleType,
  RouteSkill,
} from './route-types';

export type RouteCandidate = PlannedRouteSkill & {
  skill: RouteSkill;
  moduleKey: string;
  teacherAssignmentIds: string[];
};

export const averageFactors = (
  skills: RouteCandidate[],
): RouteFactorBreakdown => {
  const keys = Object.keys(skills[0]?.factors ?? {}) as Array<
    keyof RouteFactorBreakdown
  >;

  return keys.reduce<RouteFactorBreakdown>(
    (result, key) => {
      result[key] = round(
        skills.reduce((sum, skill) => sum + skill.factors[key], 0) /
          Math.max(1, skills.length),
      );
      return result;
    },
    {
      knowledgeGap: 0,
      targetRelevance: 0,
      examImpact: 0,
      foundationalReach: 0,
      deadlineUrgency: 0,
      timeEfficiency: 0,
      confidenceReliability: 0,
      reviewBonus: 0,
      teacherBonus: 0,
    },
  );
};

export const getModuleType = ({
  skill,
  forcedPrerequisite,
  teacherAssigned,
  targetScore,
}: {
  skill: RouteSkill;
  forcedPrerequisite: boolean;
  teacherAssigned: boolean;
  targetScore: number;
}): RouteModuleType => {
  if (teacherAssigned) {
    return 'TEACHER_ASSIGNED';
  }
  if (needsClarification(skill.state)) {
    return 'EXTRA_DIAGNOSTIC';
  }
  if (skill.state.needsReview || skill.state.status === 'NEEDS_REVIEW') {
    return 'REVIEW';
  }
  if (skill.state.mastery >= 0.72 && (skill.state.stability ?? 1) < 0.7) {
    return 'CONTROL';
  }
  if (
    forcedPrerequisite ||
    skill.isFoundational ||
    skill.state.status === 'UNSTUDIED' ||
    (getTargetRelevance(skill, targetScore) >= 0.75 &&
      skill.state.mastery < 0.75)
  ) {
    return 'REQUIRED';
  }

  return 'RECOMMENDED';
};

export const getTargets = (skill: RouteSkill, type: RouteModuleType) => {
  if (type === 'EXTRA_DIAGNOSTIC') {
    return { mastery: null, confidence: 0.55, stability: null };
  }
  if (type === 'CONTROL') {
    return { mastery: 0.8, confidence: 0.65, stability: 0.7 };
  }
  if (type === 'REVIEW') {
    return { mastery: 0.75, confidence: 0.55, stability: 0.55 };
  }

  return {
    mastery: skill.isFoundational ? 0.8 : 0.75,
    confidence: 0.55,
    stability: 0.55,
  };
};

export const getPlannedMinutes = (skill: RouteSkill, type: RouteModuleType) => {
  const base = skill.estimatedMinutes;

  if (type === 'EXTRA_DIAGNOSTIC') {
    return Math.round(bounded(base * 0.2, 15, 35));
  }
  if (type === 'REVIEW') {
    return Math.round(bounded(base * 0.3, 20, 60));
  }
  if (type === 'CONTROL') {
    return Math.round(bounded(base * 0.35, 25, 75));
  }

  const remainingShare =
    skill.state.status === 'UNSTUDIED'
      ? 1
      : bounded(1 - skill.state.mastery + 0.25, 0.35, 1);

  return Math.round(base * remainingShare);
};

export const getReason = (
  skill: RouteSkill,
  type: RouteModuleType,
  forcedPrerequisite: boolean,
) => {
  if (type === 'TEACHER_ASSIGNED') {
    return 'Навык входит в активное задание преподавателя';
  }
  if (type === 'EXTRA_DIAGNOSTIC') {
    return 'Данных недостаточно: сначала нужно уточнить текущий уровень';
  }
  if (type === 'REVIEW') {
    return 'Наступил срок повторения ранее изученного навыка';
  }
  if (type === 'CONTROL') {
    return 'Уровень высокий, но результат пока недостаточно стабилен';
  }
  if (forcedPrerequisite) {
    return 'Это обязательная база для более сложного выбранного навыка';
  }
  if (skill.state.status === 'UNSTUDIED') {
    return 'Ученик отметил, что этот материал ещё не проходил';
  }

  return 'Навык важен для цели и требует дальнейшего освоения';
};

export const getModuleTitle = (type: RouteModuleType, name: string) => {
  const prefixes: Partial<Record<RouteModuleType, string>> = {
    EXTRA_DIAGNOSTIC: 'Уточнить уровень',
    REVIEW: 'Повторить',
    CONTROL: 'Проверить устойчивость',
    TEACHER_ASSIGNED: 'Назначено преподавателем',
  };

  return prefixes[type] ? `${prefixes[type]}: ${name}` : name;
};

export const getCompletionCriteria = (
  type: RouteModuleType,
  skills: RouteCandidate[],
) => {
  const mastery = skills.flatMap((skill) =>
    skill.targetMastery === null ? [] : [skill.targetMastery],
  );
  const stability = skills.flatMap((skill) =>
    skill.targetStability === null ? [] : [skill.targetStability],
  );

  return {
    description:
      type === 'EXTRA_DIAGNOSTIC'
        ? 'Получить минимум две независимые проверки и уверенность системы не ниже 0,55'
        : type === 'REVIEW'
          ? 'Успешно воспроизвести материал после срока повторения'
          : type === 'CONTROL'
            ? 'Подтвердить уровень не ниже 0,80 и стабильность не ниже 0,70'
            : 'Достичь целевых показателей по всем навыкам модуля',
    mastery: mastery.length ? Math.max(...mastery) : null,
    confidence: Math.max(...skills.map((skill) => skill.targetConfidence)),
    stability: stability.length ? Math.max(...stability) : null,
    minimumIndependentAttempts:
      type === 'EXTRA_DIAGNOSTIC' ? 2 : type === 'CONTROL' ? 3 : 2,
  };
};

export const moduleIsCompleted = (
  type: RouteModuleType,
  skills: RouteCandidate[],
) => {
  if (type === 'EXTRA_DIAGNOSTIC') {
    return skills.every(
      ({ skill }) =>
        skill.state.confidence >= 0.55 &&
        skill.state.distinctEvidenceCount >= 2,
    );
  }
  if (type === 'REVIEW') {
    return skills.every(({ skill }) => !skill.state.needsReview);
  }

  return skills.every(({ skill }) => isMastered(skill.state));
};
