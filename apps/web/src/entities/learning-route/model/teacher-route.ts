export type TeacherRouteModuleType =
  | "REQUIRED"
  | "RECOMMENDED"
  | "PARALLEL"
  | "CONTROL"
  | "REVIEW"
  | "EXTRA_DIAGNOSTIC"
  | "TEACHER_ASSIGNED";

export type TeacherRouteSkillState = {
  mastery: number;
  confidence: number;
  stability: number | null;
  status: string;
  needsReview: boolean;
};

export type TeacherRouteSkill = {
  code: string;
  name: string;
  position: number;
  priority: number;
  plannedMinutes: number;
  targetMastery: number | null;
  targetConfidence: number;
  targetStability: number | null;
  reason: string;
  currentState: TeacherRouteSkillState | null;
};

export type TeacherRouteModule = {
  moduleKey: string;
  title: string;
  type: TeacherRouteModuleType;
  status: "AVAILABLE" | "BLOCKED" | "COMPLETED";
  position: number;
  priority: number;
  estimatedMinutes: number;
  blockedBySkillCodes: string[];
  recommendedBeforeCodes: string[];
  reasons: string[];
  completionCriteria: {
    description?: string;
    mastery?: number | null;
    confidence?: number;
    stability?: number | null;
    minimumIndependentAttempts?: number;
  };
  isPinned: boolean;
  isHidden: boolean;
  autoUpdateEnabled: boolean;
  isCustom: boolean;
  positionLocked: boolean;
  teacherComment: string | null;
  skills: TeacherRouteSkill[];
};

export type TeacherLearningRoute = {
  publicId: string;
  algorithmVersion: string;
  status: string;
  generatedAt: string;
  horizonEndAt: string;
  availableMinutes: number;
  totalPlannedMinutes: number;
  isStale: boolean;
  student: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  goal: {
    publicId: string;
    targetScore: number;
    examDate: string;
    weeklyMinutes: number;
  };
  knowledgeMap: {
    version: string;
    title: string;
  };
  modules: TeacherRouteModule[];
};

export type TeacherSkillControl = {
  instructionStatus: "NOT_STARTED" | "TAUGHT" | "REINFORCED";
  manualStatus: string | null;
  autoStatusEnabled: boolean;
  systemConclusionConfirmedAt: string | null;
  reviewScheduledAt: string | null;
  controlScheduledAt: string | null;
  comment: string | null;
  updatedAt: string;
  lastAuthor: {
    id: string;
    name: string;
  };
};

export type TeacherProfileSkill = {
  mastery: number;
  confidence: number;
  speed: number | null;
  stability: number | null;
  evidenceCount: number;
  distinctEvidenceCount: number;
  confirmingAttempts: number;
  contradictingAttempts: number;
  status: string;
  effectiveStatus: string;
  statusLabel: string;
  systemStatusLabel: string;
  speedLabel: string;
  stabilityLabel: string;
  needsReview: boolean;
  reviewDueAt: string | null;
  explanation: {
    reasons?: string[];
  };
  teacherControl: TeacherSkillControl | null;
  skill: {
    id: string;
    code: string;
    name: string;
    importance: number | null;
    difficulty: number | null;
    isFoundational: boolean;
    parent: {
      code: string;
      name: string;
      parent: {
        code: string;
        name: string;
      } | null;
    } | null;
  };
};

export type TeacherKnowledgeProfile = {
  student: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  ready: boolean;
  calculatedAt: string | null;
  knowledgeMap: {
    version: string;
    title: string;
    subject: string;
  };
  skills: TeacherProfileSkill[];
};

export type TeacherSkillDetail = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isFoundational: boolean;
  importance: number | null;
  difficulty: number | null;
  estimatedMinutes: number | null;
  effectiveStatus: string;
  systemState:
    | (TeacherRouteSkillState & {
        speed: number | null;
        distinctEvidenceCount: number;
        evidenceCount: number;
        explanation: { reasons?: string[] };
      })
    | null;
  teacherControl: TeacherSkillControl | null;
  prerequisiteLinks: Array<{
    type: "REQUIRED" | "RECOMMENDED";
    rationale: string | null;
    prerequisite: {
      code: string;
      name: string;
      skillStates: TeacherRouteSkillState[];
    };
  }>;
  unlocksSkills: Array<{
    type: "REQUIRED" | "RECOMMENDED";
    skill: {
      code: string;
      name: string;
      skillStates: TeacherRouteSkillState[];
    };
  }>;
  skillEvidence: Array<{
    id: string;
    source: string;
    score: number;
    weight: number;
    independence: string;
    activeSeconds: number | null;
    errorType: string | null;
    teacherConfirmed: boolean;
    reason: string;
    occurredAt: string;
    assessmentItem: {
      publicId: string;
      promptSnapshot: string | null;
      maxScore: number;
      task: {
        publicId: string;
        statement: string;
      } | null;
      attempt: {
        outcome: string;
        awardedScore: number | null;
        activeSeconds: number;
        confidence: number | null;
        reviewedAt: string | null;
        reviewComment: string | null;
      } | null;
    } | null;
  }>;
  skillStateRevisions: Array<{
    mastery: number;
    confidence: number;
    speed: number | null;
    stability: number | null;
    status: string;
    evidenceCount: number;
    calculatedAt: string;
  }>;
  teacherRouteChanges: TeacherRouteHistoryItem[];
};

export type TeacherRouteHistoryItem = {
  publicId: string;
  action: string;
  reason: string;
  moduleKey: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
  skill?: {
    code: string;
    name: string;
  } | null;
};

export type TeacherSkillActionInput = {
  action: string;
  reason: string;
  status?: string;
  comment?: string;
  scheduledFor?: string;
  enabled?: boolean;
};

export type TeacherModuleActionInput = {
  action: string;
  reason: string;
  direction?: "UP" | "DOWN";
  comment?: string;
  enabled?: boolean;
};

export type CreateTeacherRouteModuleInput = {
  title: string;
  description?: string;
  estimatedMinutes: number;
  skillCodes?: string[];
  reason: string;
  comment?: string;
};
