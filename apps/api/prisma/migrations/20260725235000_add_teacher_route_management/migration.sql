-- CreateEnum
CREATE TYPE "TeacherInstructionStatus" AS ENUM ('NOT_STARTED', 'TAUGHT', 'REINFORCED');

-- CreateEnum
CREATE TYPE "TeacherRouteActionType" AS ENUM (
    'CONFIRM_SYSTEM_CONCLUSION',
    'CHANGE_SKILL_STATUS',
    'CLEAR_SKILL_STATUS',
    'MARK_TAUGHT',
    'MARK_REINFORCED',
    'SCHEDULE_CONTROL',
    'SCHEDULE_REVIEW',
    'UPDATE_SKILL_COMMENT',
    'SET_SKILL_AUTOMATION',
    'MOVE_MODULE',
    'PIN_MODULE',
    'UNPIN_MODULE',
    'HIDE_MODULE',
    'SHOW_MODULE',
    'UPDATE_MODULE_COMMENT',
    'SET_MODULE_AUTOMATION',
    'ADD_CUSTOM_MODULE',
    'UPDATE_WEEKLY_LOAD'
);

-- AlterTable
ALTER TABLE "LearningRouteModule"
ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "autoUpdateEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "positionLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "teacherComment" TEXT;

-- CreateTable
CREATE TABLE "StudentSkillStateRevision" (
    "id" TEXT NOT NULL,
    "calculationBatchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "formulaVersion" TEXT NOT NULL,
    "mastery" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "stability" DOUBLE PRECISION,
    "status" "StudentSkillStatus" NOT NULL,
    "evidenceWeight" DOUBLE PRECISION NOT NULL,
    "evidenceCount" INTEGER NOT NULL,
    "sourceSummary" JSONB NOT NULL DEFAULT '{}',
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSkillStateRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSkillControl" (
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "instructionStatus" "TeacherInstructionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "manualStatus" "StudentSkillStatus",
    "autoStatusEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemConclusionConfirmedAt" TIMESTAMP(3),
    "reviewScheduledAt" TIMESTAMP(3),
    "controlScheduledAt" TIMESTAMP(3),
    "comment" TEXT,
    "lastAuthorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherSkillControl_pkey" PRIMARY KEY ("studentId", "skillId")
);

-- CreateTable
CREATE TABLE "TeacherRouteChange" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "routeId" TEXT,
    "moduleId" TEXT,
    "moduleKey" TEXT,
    "skillId" TEXT,
    "action" "TeacherRouteActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherRouteChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentSkillStateRevision_studentId_skillId_calculatedAt_idx"
ON "StudentSkillStateRevision"("studentId", "skillId", "calculatedAt");

-- CreateIndex
CREATE INDEX "StudentSkillStateRevision_calculationBatchId_idx"
ON "StudentSkillStateRevision"("calculationBatchId");

-- CreateIndex
CREATE INDEX "TeacherSkillControl_lastAuthorId_updatedAt_idx"
ON "TeacherSkillControl"("lastAuthorId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherRouteChange_publicId_key"
ON "TeacherRouteChange"("publicId");

-- CreateIndex
CREATE INDEX "TeacherRouteChange_studentId_createdAt_idx"
ON "TeacherRouteChange"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherRouteChange_skillId_createdAt_idx"
ON "TeacherRouteChange"("skillId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherRouteChange_routeId_createdAt_idx"
ON "TeacherRouteChange"("routeId", "createdAt");

-- AddForeignKey
ALTER TABLE "StudentSkillStateRevision"
ADD CONSTRAINT "StudentSkillStateRevision_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillStateRevision"
ADD CONSTRAINT "StudentSkillStateRevision_skillId_fkey"
FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillStateRevision"
ADD CONSTRAINT "StudentSkillStateRevision_knowledgeMapId_fkey"
FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSkillControl"
ADD CONSTRAINT "TeacherSkillControl_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSkillControl"
ADD CONSTRAINT "TeacherSkillControl_skillId_fkey"
FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSkillControl"
ADD CONSTRAINT "TeacherSkillControl_lastAuthorId_fkey"
FOREIGN KEY ("lastAuthorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRouteChange"
ADD CONSTRAINT "TeacherRouteChange_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRouteChange"
ADD CONSTRAINT "TeacherRouteChange_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRouteChange"
ADD CONSTRAINT "TeacherRouteChange_routeId_fkey"
FOREIGN KEY ("routeId") REFERENCES "LearningRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRouteChange"
ADD CONSTRAINT "TeacherRouteChange_moduleId_fkey"
FOREIGN KEY ("moduleId") REFERENCES "LearningRouteModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRouteChange"
ADD CONSTRAINT "TeacherRouteChange_skillId_fkey"
FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
