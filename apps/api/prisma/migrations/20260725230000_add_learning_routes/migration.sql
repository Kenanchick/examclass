-- CreateEnum
CREATE TYPE "LearningRouteStatus" AS ENUM ('ACTIVE', 'SUPERSEDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LearningRouteModuleType" AS ENUM ('REQUIRED', 'RECOMMENDED', 'PARALLEL', 'CONTROL', 'REVIEW', 'EXTRA_DIAGNOSTIC', 'TEACHER_ASSIGNED');

-- CreateEnum
CREATE TYPE "LearningRouteModuleStatus" AS ENUM ('AVAILABLE', 'BLOCKED', 'COMPLETED');

-- CreateTable
CREATE TABLE "LearningRoute" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "algorithmVersion" TEXT NOT NULL,
    "profileFormulaVersion" TEXT NOT NULL,
    "status" "LearningRouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "horizonEndAt" TIMESTAMP(3) NOT NULL,
    "availableMinutes" INTEGER NOT NULL,
    "totalPlannedMinutes" INTEGER NOT NULL,
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRouteModule" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "moduleNodeId" TEXT,
    "moduleKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LearningRouteModuleType" NOT NULL,
    "status" "LearningRouteModuleStatus" NOT NULL,
    "position" INTEGER NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "blockedBySkillCodes" TEXT[],
    "recommendedBeforeCodes" TEXT[],
    "teacherAssignmentIds" TEXT[],
    "factorBreakdown" JSONB NOT NULL DEFAULT '{}',
    "completionCriteria" JSONB NOT NULL DEFAULT '{}',
    "reasons" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningRouteModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRouteModuleSkill" (
    "moduleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL,
    "plannedMinutes" INTEGER NOT NULL,
    "targetMastery" DOUBLE PRECISION,
    "targetConfidence" DOUBLE PRECISION NOT NULL,
    "targetStability" DOUBLE PRECISION,
    "reason" TEXT NOT NULL,

    CONSTRAINT "LearningRouteModuleSkill_pkey" PRIMARY KEY ("moduleId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningRoute_publicId_key" ON "LearningRoute"("publicId");

-- CreateIndex
CREATE INDEX "LearningRoute_studentId_status_generatedAt_idx" ON "LearningRoute"("studentId", "status", "generatedAt");

-- CreateIndex
CREATE INDEX "LearningRoute_goalId_status_idx" ON "LearningRoute"("goalId", "status");

-- CreateIndex
CREATE INDEX "LearningRoute_knowledgeMapId_idx" ON "LearningRoute"("knowledgeMapId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningRouteModule_routeId_moduleKey_key" ON "LearningRouteModule"("routeId", "moduleKey");

-- CreateIndex
CREATE INDEX "LearningRouteModule_routeId_position_idx" ON "LearningRouteModule"("routeId", "position");

-- CreateIndex
CREATE INDEX "LearningRouteModule_moduleNodeId_idx" ON "LearningRouteModule"("moduleNodeId");

-- CreateIndex
CREATE INDEX "LearningRouteModuleSkill_skillId_idx" ON "LearningRouteModuleSkill"("skillId");

-- AddForeignKey
ALTER TABLE "LearningRoute" ADD CONSTRAINT "LearningRoute_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRoute" ADD CONSTRAINT "LearningRoute_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "StudentLearningGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRoute" ADD CONSTRAINT "LearningRoute_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRouteModule" ADD CONSTRAINT "LearningRouteModule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "LearningRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRouteModule" ADD CONSTRAINT "LearningRouteModule_moduleNodeId_fkey" FOREIGN KEY ("moduleNodeId") REFERENCES "KnowledgeNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRouteModuleSkill" ADD CONSTRAINT "LearningRouteModuleSkill_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningRouteModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRouteModuleSkill" ADD CONSTRAINT "LearningRouteModuleSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
