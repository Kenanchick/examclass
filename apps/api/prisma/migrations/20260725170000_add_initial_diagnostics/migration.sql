-- CreateEnum
CREATE TYPE "LearningGoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssessmentSessionType" AS ENUM ('INITIAL_DIAGNOSTIC');

-- CreateEnum
CREATE TYPE "AssessmentSessionStatus" AS ENUM ('EXAM_READY', 'EXAM_IN_PROGRESS', 'EXAM_REVIEW_PENDING', 'CLARIFICATION', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "AssessmentPhase" AS ENUM ('FULL_EXAM', 'ADAPTIVE', 'THEORY');

-- CreateEnum
CREATE TYPE "AssessmentItemKind" AS ENUM ('TASK', 'QUESTION');

-- CreateEnum
CREATE TYPE "AssessmentItemStatus" AS ENUM ('PENDING', 'ACTIVE', 'ANSWERED', 'SKIPPED', 'AWAITING_REVIEW', 'REVIEWED');

-- CreateEnum
CREATE TYPE "AssessmentAttemptOutcome" AS ENUM ('CORRECT', 'INCORRECT', 'PARTIAL', 'SKIPPED', 'UNSTUDIED', 'NOT_REACHED', 'AWAITING_REVIEW');

-- CreateEnum
CREATE TYPE "AssessmentBehaviorEventType" AS ENUM ('VIEWED', 'FOCUS_GAINED', 'FOCUS_LOST', 'ANSWER_CHANGED', 'MARKED_FOR_REVIEW', 'WORK_SAVED');

-- CreateEnum
CREATE TYPE "DiagnosticQuestionKind" AS ENUM ('ADAPTIVE_TASK', 'THEORY_SHORT', 'THEORY_CHOICE');

-- CreateEnum
CREATE TYPE "QuestionEvaluationMode" AS ENUM ('EXACT', 'CHOICE', 'MANUAL');

-- CreateEnum
CREATE TYPE "DiagnosticHypothesisType" AS ENUM ('SKILL_GAP', 'PREREQUISITE_GAP', 'COMPUTATION_ERROR', 'MISREAD_CONDITION', 'TIME_PRESSURE', 'CARELESSNESS', 'UNSTUDIED', 'POSSIBLE_GUESS');

-- CreateEnum
CREATE TYPE "DiagnosticHypothesisStatus" AS ENUM ('OPEN', 'CONFIRMED', 'REJECTED', 'INSUFFICIENT');

-- CreateEnum
CREATE TYPE "SkillEvidenceSource" AS ENUM ('FULL_EXAM', 'ADAPTIVE_TASK', 'THEORY_QUESTION', 'MANUAL_REVIEW', 'SELF_REPORT');

-- CreateEnum
CREATE TYPE "StudentSkillStatus" AS ENUM ('UNKNOWN', 'UNSTUDIED', 'GAP', 'DEVELOPING', 'MASTERED');

-- CreateEnum
CREATE TYPE "AssessmentReviewErrorType" AS ENUM ('NONE', 'COMPUTATION', 'CONCEPTUAL', 'MODELING', 'LOGIC', 'NOTATION', 'INCOMPLETE', 'MISREAD_CONDITION');

-- CreateTable
CREATE TABLE "StudentLearningGoal" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "targetScore" INTEGER NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "weeklyMinutes" INTEGER NOT NULL,
    "preferredSessionMinutes" INTEGER NOT NULL,
    "availableWeekdays" INTEGER[],
    "lastMockScore" INTEGER,
    "status" "LearningGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLearningGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningGoalUnstudiedNode" (
    "goalId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningGoalUnstudiedNode_pkey" PRIMARY KEY ("goalId","nodeId")
);

-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "type" "AssessmentSessionType" NOT NULL DEFAULT 'INITIAL_DIAGNOSTIC',
    "status" "AssessmentSessionStatus" NOT NULL DEFAULT 'EXAM_READY',
    "currentPhase" "AssessmentPhase" NOT NULL DEFAULT 'FULL_EXAM',
    "algorithmVersion" TEXT NOT NULL,
    "examDurationMinutes" INTEGER NOT NULL DEFAULT 235,
    "adaptiveQuestionLimit" INTEGER NOT NULL DEFAULT 8,
    "theoryQuestionLimit" INTEGER NOT NULL DEFAULT 4,
    "startedAt" TIMESTAMP(3),
    "examSubmittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticQuestionTemplate" (
    "id" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "targetSkillId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "DiagnosticQuestionKind" NOT NULL,
    "evaluationMode" "QuestionEvaluationMode" NOT NULL,
    "hypothesisType" "DiagnosticHypothesisType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "correctAnswer" TEXT,
    "answerOptions" JSONB,
    "estimatedSeconds" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticQuestionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentItem" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "taskId" TEXT,
    "questionTemplateId" TEXT,
    "targetSkillId" TEXT,
    "phase" "AssessmentPhase" NOT NULL,
    "kind" "AssessmentItemKind" NOT NULL,
    "examNumber" INTEGER,
    "sortOrder" INTEGER NOT NULL,
    "status" "AssessmentItemStatus" NOT NULL DEFAULT 'PENDING',
    "promptSnapshot" TEXT,
    "selectionReason" JSONB,
    "expectedSeconds" INTEGER,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "rawAnswer" TEXT,
    "solutionText" TEXT,
    "confidence" INTEGER,
    "declaredUnstudied" BOOLEAN NOT NULL DEFAULT false,
    "outcome" "AssessmentAttemptOutcome" NOT NULL,
    "autoScore" DOUBLE PRECISION,
    "awardedScore" DOUBLE PRECISION,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "awaySeconds" INTEGER NOT NULL DEFAULT 0,
    "answerChanges" INTEGER NOT NULL DEFAULT 0,
    "firstViewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewErrorType" "AssessmentReviewErrorType",
    "reviewComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttemptAttachment" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAttemptAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentBehaviorEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemId" TEXT,
    "type" "AssessmentBehaviorEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentBehaviorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticHypothesis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "skillId" TEXT,
    "sourceItemId" TEXT,
    "key" TEXT NOT NULL,
    "type" "DiagnosticHypothesisType" NOT NULL,
    "status" "DiagnosticHypothesisStatus" NOT NULL DEFAULT 'OPEN',
    "confidence" DOUBLE PRECISION NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "evidenceCount" INTEGER NOT NULL DEFAULT 1,
    "rationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticHypothesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEvidence" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "assessmentItemId" TEXT,
    "source" "SkillEvidenceSource" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "independenceKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSkillState" (
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "initializedBySessionId" TEXT,
    "mastery" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidenceWeight" DOUBLE PRECISION NOT NULL,
    "evidenceCount" INTEGER NOT NULL,
    "distinctEvidenceCount" INTEGER NOT NULL,
    "status" "StudentSkillStatus" NOT NULL,
    "lastEvidenceAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSkillState_pkey" PRIMARY KEY ("studentId","skillId")
);

-- CreateTable
CREATE TABLE "TaskRubricCriterion" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "skillId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskRubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentReviewCriterion" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "rubricCriterionId" TEXT,
    "skillId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "awardedScore" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "errorType" "AssessmentReviewErrorType" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentReviewCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentLearningGoal_publicId_key" ON "StudentLearningGoal"("publicId");

-- CreateIndex
CREATE INDEX "StudentLearningGoal_studentId_status_createdAt_idx" ON "StudentLearningGoal"("studentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "StudentLearningGoal_knowledgeMapId_idx" ON "StudentLearningGoal"("knowledgeMapId");

-- CreateIndex
CREATE INDEX "LearningGoalUnstudiedNode_nodeId_idx" ON "LearningGoalUnstudiedNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSession_publicId_key" ON "AssessmentSession"("publicId");

-- CreateIndex
CREATE INDEX "AssessmentSession_studentId_status_createdAt_idx" ON "AssessmentSession"("studentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentSession_goalId_idx" ON "AssessmentSession"("goalId");

-- CreateIndex
CREATE INDEX "AssessmentSession_knowledgeMapId_idx" ON "AssessmentSession"("knowledgeMapId");

-- CreateIndex
CREATE INDEX "DiagnosticQuestionTemplate_targetSkillId_kind_isActive_idx" ON "DiagnosticQuestionTemplate"("targetSkillId", "kind", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticQuestionTemplate_knowledgeMapId_code_key" ON "DiagnosticQuestionTemplate"("knowledgeMapId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentItem_publicId_key" ON "AssessmentItem"("publicId");

-- CreateIndex
CREATE INDEX "AssessmentItem_sessionId_status_phase_idx" ON "AssessmentItem"("sessionId", "status", "phase");

-- CreateIndex
CREATE INDEX "AssessmentItem_taskId_idx" ON "AssessmentItem"("taskId");

-- CreateIndex
CREATE INDEX "AssessmentItem_targetSkillId_idx" ON "AssessmentItem"("targetSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentItem_sessionId_phase_sortOrder_key" ON "AssessmentItem"("sessionId", "phase", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttempt_publicId_key" ON "AssessmentAttempt"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttempt_itemId_key" ON "AssessmentAttempt"("itemId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_outcome_reviewedAt_idx" ON "AssessmentAttempt"("outcome", "reviewedAt");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_reviewerId_idx" ON "AssessmentAttempt"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttemptAttachment_publicId_key" ON "AssessmentAttemptAttachment"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttemptAttachment_storageKey_key" ON "AssessmentAttemptAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "AssessmentAttemptAttachment_attemptId_idx" ON "AssessmentAttemptAttachment"("attemptId");

-- CreateIndex
CREATE INDEX "AssessmentBehaviorEvent_sessionId_occurredAt_idx" ON "AssessmentBehaviorEvent"("sessionId", "occurredAt");

-- CreateIndex
CREATE INDEX "AssessmentBehaviorEvent_itemId_occurredAt_idx" ON "AssessmentBehaviorEvent"("itemId", "occurredAt");

-- CreateIndex
CREATE INDEX "DiagnosticHypothesis_sessionId_status_priority_idx" ON "DiagnosticHypothesis"("sessionId", "status", "priority");

-- CreateIndex
CREATE INDEX "DiagnosticHypothesis_skillId_type_idx" ON "DiagnosticHypothesis"("skillId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticHypothesis_sessionId_key_key" ON "DiagnosticHypothesis"("sessionId", "key");

-- CreateIndex
CREATE INDEX "SkillEvidence_studentId_skillId_occurredAt_idx" ON "SkillEvidence"("studentId", "skillId", "occurredAt");

-- CreateIndex
CREATE INDEX "SkillEvidence_sessionId_source_idx" ON "SkillEvidence"("sessionId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "SkillEvidence_sessionId_skillId_independenceKey_source_key" ON "SkillEvidence"("sessionId", "skillId", "independenceKey", "source");

-- CreateIndex
CREATE INDEX "StudentSkillState_studentId_knowledgeMapId_status_idx" ON "StudentSkillState"("studentId", "knowledgeMapId", "status");

-- CreateIndex
CREATE INDEX "StudentSkillState_skillId_status_idx" ON "StudentSkillState"("skillId", "status");

-- CreateIndex
CREATE INDEX "TaskRubricCriterion_skillId_idx" ON "TaskRubricCriterion"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskRubricCriterion_taskId_code_key" ON "TaskRubricCriterion"("taskId", "code");

-- CreateIndex
CREATE INDEX "AssessmentReviewCriterion_skillId_errorType_idx" ON "AssessmentReviewCriterion"("skillId", "errorType");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentReviewCriterion_attemptId_code_key" ON "AssessmentReviewCriterion"("attemptId", "code");

-- AddForeignKey
ALTER TABLE "StudentLearningGoal" ADD CONSTRAINT "StudentLearningGoal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLearningGoal" ADD CONSTRAINT "StudentLearningGoal_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningGoalUnstudiedNode" ADD CONSTRAINT "LearningGoalUnstudiedNode_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "StudentLearningGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningGoalUnstudiedNode" ADD CONSTRAINT "LearningGoalUnstudiedNode_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "StudentLearningGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticQuestionTemplate" ADD CONSTRAINT "DiagnosticQuestionTemplate_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticQuestionTemplate" ADD CONSTRAINT "DiagnosticQuestionTemplate_targetSkillId_fkey" FOREIGN KEY ("targetSkillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItem" ADD CONSTRAINT "AssessmentItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItem" ADD CONSTRAINT "AssessmentItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItem" ADD CONSTRAINT "AssessmentItem_questionTemplateId_fkey" FOREIGN KEY ("questionTemplateId") REFERENCES "DiagnosticQuestionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItem" ADD CONSTRAINT "AssessmentItem_targetSkillId_fkey" FOREIGN KEY ("targetSkillId") REFERENCES "KnowledgeNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AssessmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttemptAttachment" ADD CONSTRAINT "AssessmentAttemptAttachment_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentBehaviorEvent" ADD CONSTRAINT "AssessmentBehaviorEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentBehaviorEvent" ADD CONSTRAINT "AssessmentBehaviorEvent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AssessmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticHypothesis" ADD CONSTRAINT "DiagnosticHypothesis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticHypothesis" ADD CONSTRAINT "DiagnosticHypothesis_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticHypothesis" ADD CONSTRAINT "DiagnosticHypothesis_sourceItemId_fkey" FOREIGN KEY ("sourceItemId") REFERENCES "AssessmentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEvidence" ADD CONSTRAINT "SkillEvidence_assessmentItemId_fkey" FOREIGN KEY ("assessmentItemId") REFERENCES "AssessmentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillState" ADD CONSTRAINT "StudentSkillState_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillState" ADD CONSTRAINT "StudentSkillState_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillState" ADD CONSTRAINT "StudentSkillState_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillState" ADD CONSTRAINT "StudentSkillState_initializedBySessionId_fkey" FOREIGN KEY ("initializedBySessionId") REFERENCES "AssessmentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRubricCriterion" ADD CONSTRAINT "TaskRubricCriterion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRubricCriterion" ADD CONSTRAINT "TaskRubricCriterion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentReviewCriterion" ADD CONSTRAINT "AssessmentReviewCriterion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentReviewCriterion" ADD CONSTRAINT "AssessmentReviewCriterion_rubricCriterionId_fkey" FOREIGN KEY ("rubricCriterionId") REFERENCES "TaskRubricCriterion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentReviewCriterion" ADD CONSTRAINT "AssessmentReviewCriterion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
