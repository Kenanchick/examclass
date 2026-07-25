export type ProfileEvidenceSource =
  | 'FULL_EXAM'
  | 'ADAPTIVE_TASK'
  | 'THEORY_QUESTION'
  | 'MANUAL_REVIEW'
  | 'SELF_REPORT'
  | 'HOMEWORK'
  | 'CONTROL_WORK'
  | 'MOCK_EXAM'
  | 'LESSON'
  | 'TEACHER_CONFIRMATION';

export type ProfileEvidence = {
  skillCode: string;
  source: ProfileEvidenceSource;
  score: number;
  weight: number;
  independenceKey: string;
  occurredAt: Date;
  difficulty?: number | null;
  skillRole?: 'PRIMARY' | 'SECONDARY' | 'PREREQUISITE' | null;
  independence?: 'UNKNOWN' | 'INDEPENDENT' | 'MINOR_HINT' | 'MAJOR_HELP';
  activeSeconds?: number | null;
  expectedSeconds?: number | null;
  selfConfidence?: number | null;
  errorType?:
    | 'NONE'
    | 'COMPUTATION'
    | 'CONCEPTUAL'
    | 'MODELING'
    | 'LOGIC'
    | 'NOTATION'
    | 'INCOMPLETE'
    | 'MISREAD_CONDITION'
    | null;
  teacherConfirmed?: boolean;
};

export type KnowledgeProfileStatus =
  | 'UNSTUDIED'
  | 'INSUFFICIENT_DATA'
  | 'WEAK'
  | 'LEARNING'
  | 'NEEDS_REINFORCEMENT'
  | 'MASTERED'
  | 'NEEDS_REVIEW'
  | 'TEACHER_CONFIRMED';

export type SourceSummary = Record<
  string,
  { attempts: number; effectiveWeight: number; lastAt: string }
>;

export type CalculatedSkillState = {
  skillCode: string;
  mastery: number;
  confidence: number;
  speed: number | null;
  stability: number | null;
  evidenceWeight: number;
  evidenceCount: number;
  distinctEvidenceCount: number;
  confirmingAttempts: number;
  contradictingAttempts: number;
  status: KnowledgeProfileStatus;
  lastEvidenceAt: Date | null;
  lastVerifiedAt: Date | null;
  reviewDueAt: Date | null;
  needsReview: boolean;
  teacherConfirmedAt: Date | null;
  sourceSummary: SourceSummary;
  explanation: {
    formulaVersion: string;
    prior: { alpha: number; beta: number };
    effectiveWeight: number;
    averageFactors: Record<string, number>;
    roleSummary: Record<string, number>;
    thresholds: Record<string, number>;
    reasons: string[];
  };
};
