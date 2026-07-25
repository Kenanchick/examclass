export type RouteModuleType =
  | 'REQUIRED'
  | 'RECOMMENDED'
  | 'PARALLEL'
  | 'CONTROL'
  | 'REVIEW'
  | 'EXTRA_DIAGNOSTIC'
  | 'TEACHER_ASSIGNED';

export type RouteModuleStatus = 'AVAILABLE' | 'BLOCKED' | 'COMPLETED';

export type RouteSkillStatus =
  | 'UNKNOWN'
  | 'UNSTUDIED'
  | 'GAP'
  | 'DEVELOPING'
  | 'MASTERED'
  | 'INSUFFICIENT_DATA'
  | 'WEAK'
  | 'LEARNING'
  | 'NEEDS_REINFORCEMENT'
  | 'NEEDS_REVIEW'
  | 'TEACHER_CONFIRMED';

export type RouteSkillState = {
  mastery: number;
  confidence: number;
  stability: number | null;
  distinctEvidenceCount: number;
  status: RouteSkillStatus;
  needsReview: boolean;
  lastVerifiedAt: Date | null;
};

export type RouteExamMapping = {
  examNumber: number;
  examPart: 'FIRST' | 'SECOND';
  weight: number;
};

export type RouteSkill = {
  id: string;
  code: string;
  name: string;
  moduleId: string | null;
  moduleCode: string;
  moduleName: string;
  topicName: string | null;
  difficulty: number;
  importance: number;
  estimatedMinutes: number;
  isFoundational: boolean;
  examMappings: RouteExamMapping[];
  state: RouteSkillState;
};

export type RouteDependency = {
  skillCode: string;
  prerequisiteCode: string;
  type: 'REQUIRED' | 'RECOMMENDED';
};

export type RouteTeacherAssignment = {
  skillCode: string;
  assignmentId: string;
  title: string;
};

export type RouteGoal = {
  targetScore: number;
  examDate: Date;
  weeklyMinutes: number;
};

export type RouteFactorBreakdown = {
  knowledgeGap: number;
  targetRelevance: number;
  examImpact: number;
  foundationalReach: number;
  deadlineUrgency: number;
  timeEfficiency: number;
  confidenceReliability: number;
  reviewBonus: number;
  teacherBonus: number;
};

export type PlannedRouteSkill = {
  skillId: string;
  skillCode: string;
  skillName: string;
  priority: number;
  plannedMinutes: number;
  targetMastery: number | null;
  targetConfidence: number;
  targetStability: number | null;
  reason: string;
  type: RouteModuleType;
  factors: RouteFactorBreakdown;
};

export type PlannedRouteModule = {
  moduleId: string | null;
  moduleKey: string;
  title: string;
  topicName: string | null;
  type: RouteModuleType;
  status: RouteModuleStatus;
  position: number;
  priority: number;
  estimatedMinutes: number;
  blockedBySkillCodes: string[];
  recommendedBeforeCodes: string[];
  teacherAssignmentIds: string[];
  factors: RouteFactorBreakdown;
  completionCriteria: {
    description: string;
    mastery: number | null;
    confidence: number;
    stability: number | null;
    minimumIndependentAttempts: number;
  };
  reasons: string[];
  skills: PlannedRouteSkill[];
};

export type LearningRoutePlan = {
  algorithmVersion: string;
  generatedAt: Date;
  horizonEndAt: Date;
  availableMinutes: number;
  totalPlannedMinutes: number;
  modules: PlannedRouteModule[];
  explanation: {
    targetScore: number;
    weeksUntilExam: number;
    horizonWeeks: number;
    consideredSkills: number;
    selectedSkills: number;
    selectedModules: number;
    policy: string[];
  };
};

export type BuildLearningRouteInput = {
  skills: RouteSkill[];
  dependencies: RouteDependency[];
  goal: RouteGoal;
  teacherAssignments?: RouteTeacherAssignment[];
  asOf?: Date;
};
