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
