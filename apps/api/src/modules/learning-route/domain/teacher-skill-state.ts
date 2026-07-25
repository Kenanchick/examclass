export type TeacherSkillStateControl = {
  autoStatusEnabled: boolean;
  manualStatus: string | null;
  reviewScheduledAt?: Date | null;
  instructionStatus?: 'NOT_STARTED' | 'TAUGHT' | 'REINFORCED';
};

export const getEffectiveSkillStatus = (
  systemStatus: string,
  control?: TeacherSkillStateControl | null,
) => {
  if (control?.autoStatusEnabled === false && control.manualStatus) {
    return control.manualStatus;
  }

  if (control?.reviewScheduledAt) {
    return 'NEEDS_REVIEW';
  }

  return systemStatus;
};

export const getEffectiveSkillMetrics = (
  state:
    | {
        mastery: number;
        confidence: number;
        status: string;
      }
    | null
    | undefined,
  control?: TeacherSkillStateControl | null,
) => {
  const status = getEffectiveSkillStatus(
    state?.status ?? 'INSUFFICIENT_DATA',
    control,
  );
  if (control?.autoStatusEnabled !== false || !control.manualStatus) {
    return {
      status,
      mastery: state?.mastery ?? 0.5,
      confidence: state?.confidence ?? 0,
    };
  }

  const manualMastery: Record<string, number> = {
    UNSTUDIED: 0,
    WEAK: 0.3,
    LEARNING: 0.55,
    NEEDS_REINFORCEMENT: 0.72,
    MASTERED: 0.9,
    NEEDS_REVIEW: 0.76,
    TEACHER_CONFIRMED: 0.95,
  };

  return {
    status,
    mastery: manualMastery[control.manualStatus] ?? state?.mastery ?? 0.5,
    confidence: Math.max(state?.confidence ?? 0, 0.86),
  };
};
