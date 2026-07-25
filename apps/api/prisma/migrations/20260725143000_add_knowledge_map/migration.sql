-- CreateEnum
CREATE TYPE "KnowledgeMapStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KnowledgeNodeKind" AS ENUM ('SECTION', 'TOPIC', 'SUBTOPIC', 'SKILL');

-- CreateEnum
CREATE TYPE "KnowledgeDependencyType" AS ENUM ('REQUIRED', 'RECOMMENDED');

-- CreateEnum
CREATE TYPE "KnowledgeSourceCoverage" AS ENUM ('DIRECT', 'PARTIAL', 'MISSING');

-- CreateEnum
CREATE TYPE "SkillVerificationMethod" AS ENUM ('SHORT_ANSWER', 'MULTI_STEP_SOLUTION', 'ORAL_EXPLANATION', 'ERROR_ANALYSIS', 'GRAPH_INTERPRETATION', 'CONSTRUCTION', 'PROOF', 'MODELING');

-- CreateEnum
CREATE TYPE "ExamTaskType" AS ENUM ('COMPUTATION', 'EQUATION', 'INEQUALITY', 'GRAPH', 'APPLIED_MODEL', 'PROBABILITY', 'PLANE_GEOMETRY', 'STEREOMETRY', 'PARAMETER', 'NUMBER_THEORY');

-- CreateEnum
CREATE TYPE "TaskSkillRole" AS ENUM ('PRIMARY', 'SECONDARY', 'PREREQUISITE');

-- CreateEnum
CREATE TYPE "MaterialReviewStatus" AS ENUM ('PENDING', 'REVIEWED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MaterialSkillRole" AS ENUM ('EXPLAINS', 'PRACTICES', 'REFERENCES');

-- CreateEnum
CREATE TYPE "KnowledgeReviewItemType" AS ENUM ('COVERAGE_GAP', 'EXPERT_REVIEW');

-- CreateEnum
CREATE TYPE "KnowledgeReviewPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "KnowledgeMap" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceSummary" TEXT,
    "status" "KnowledgeMapStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeNode" (
    "id" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "kind" "KnowledgeNodeKind" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER,
    "importance" INTEGER,
    "estimatedMinutes" INTEGER,
    "isFoundational" BOOLEAN NOT NULL DEFAULT false,
    "sourceCoverage" "KnowledgeSourceCoverage",
    "needsExpertReview" BOOLEAN NOT NULL DEFAULT false,
    "expertReviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDependency" (
    "skillId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "type" "KnowledgeDependencyType" NOT NULL,
    "rationale" TEXT,
    "needsExpertReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeDependency_pkey" PRIMARY KEY ("skillId","prerequisiteId")
);

-- CreateTable
CREATE TABLE "KnowledgeExamMapping" (
    "skillId" TEXT NOT NULL,
    "examNumber" INTEGER NOT NULL,
    "examPart" "ExamPart" NOT NULL,
    "taskType" "ExamTaskType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeExamMapping_pkey" PRIMARY KEY ("skillId","examNumber","taskType")
);

-- CreateTable
CREATE TABLE "KnowledgeVerificationMethod" (
    "skillId" TEXT NOT NULL,
    "method" "SkillVerificationMethod" NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KnowledgeVerificationMethod_pkey" PRIMARY KEY ("skillId","method")
);

-- CreateTable
CREATE TABLE "TaskSkill" (
    "taskId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "role" "TaskSkillRole" NOT NULL DEFAULT 'PRIMARY',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskSkill_pkey" PRIMARY KEY ("taskId","skillId")
);

-- CreateTable
CREATE TABLE "LearningMaterial" (
    "id" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "checksum" TEXT,
    "storageKey" TEXT,
    "reviewStatus" "MaterialReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningMaterialSegment" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pages" INTEGER[],
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "needsExpertReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningMaterialSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningMaterialSkill" (
    "segmentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "role" "MaterialSkillRole" NOT NULL DEFAULT 'REFERENCES',
    "confidence" INTEGER NOT NULL DEFAULT 100,
    "needsExpertReview" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningMaterialSkill_pkey" PRIMARY KEY ("segmentId","skillId")
);

-- CreateTable
CREATE TABLE "KnowledgeReviewItem" (
    "id" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "KnowledgeReviewItemType" NOT NULL,
    "priority" "KnowledgeReviewPriority",
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeReviewItemSkill" (
    "reviewItemId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeReviewItemSkill_pkey" PRIMARY KEY ("reviewItemId","skillId")
);

-- CreateTable
CREATE TABLE "KnowledgeMapReference" (
    "id" TEXT NOT NULL,
    "knowledgeMapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KnowledgeMapReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeMap_subjectId_status_version_idx" ON "KnowledgeMap"("subjectId", "status", "version");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeMap_subjectId_version_key" ON "KnowledgeMap"("subjectId", "version");

-- CreateIndex
CREATE INDEX "KnowledgeNode_knowledgeMapId_kind_parentId_idx" ON "KnowledgeNode"("knowledgeMapId", "kind", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeNode_knowledgeMapId_code_key" ON "KnowledgeNode"("knowledgeMapId", "code");

-- CreateIndex
CREATE INDEX "KnowledgeDependency_prerequisiteId_type_idx" ON "KnowledgeDependency"("prerequisiteId", "type");

-- CreateIndex
CREATE INDEX "KnowledgeExamMapping_examNumber_examPart_taskType_idx" ON "KnowledgeExamMapping"("examNumber", "examPart", "taskType");

-- CreateIndex
CREATE INDEX "TaskSkill_skillId_role_idx" ON "TaskSkill"("skillId", "role");

-- CreateIndex
CREATE INDEX "LearningMaterial_knowledgeMapId_reviewStatus_idx" ON "LearningMaterial"("knowledgeMapId", "reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "LearningMaterial_knowledgeMapId_fileName_key" ON "LearningMaterial"("knowledgeMapId", "fileName");

-- CreateIndex
CREATE INDEX "LearningMaterialSegment_materialId_sortOrder_idx" ON "LearningMaterialSegment"("materialId", "sortOrder");

-- CreateIndex
CREATE INDEX "LearningMaterialSkill_skillId_role_idx" ON "LearningMaterialSkill"("skillId", "role");

-- CreateIndex
CREATE INDEX "KnowledgeReviewItem_knowledgeMapId_type_priority_idx" ON "KnowledgeReviewItem"("knowledgeMapId", "type", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeReviewItem_knowledgeMapId_code_key" ON "KnowledgeReviewItem"("knowledgeMapId", "code");

-- CreateIndex
CREATE INDEX "KnowledgeReviewItemSkill_skillId_idx" ON "KnowledgeReviewItemSkill"("skillId");

-- CreateIndex
CREATE INDEX "KnowledgeMapReference_knowledgeMapId_sortOrder_idx" ON "KnowledgeMapReference"("knowledgeMapId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeMapReference_knowledgeMapId_url_key" ON "KnowledgeMapReference"("knowledgeMapId", "url");

-- AddForeignKey
ALTER TABLE "KnowledgeMap" ADD CONSTRAINT "KnowledgeMap_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeNode" ADD CONSTRAINT "KnowledgeNode_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeNode" ADD CONSTRAINT "KnowledgeNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDependency" ADD CONSTRAINT "KnowledgeDependency_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDependency" ADD CONSTRAINT "KnowledgeDependency_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeExamMapping" ADD CONSTRAINT "KnowledgeExamMapping_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeVerificationMethod" ADD CONSTRAINT "KnowledgeVerificationMethod_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSkill" ADD CONSTRAINT "TaskSkill_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSkill" ADD CONSTRAINT "TaskSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningMaterial" ADD CONSTRAINT "LearningMaterial_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningMaterialSegment" ADD CONSTRAINT "LearningMaterialSegment_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningMaterialSkill" ADD CONSTRAINT "LearningMaterialSkill_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "LearningMaterialSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningMaterialSkill" ADD CONSTRAINT "LearningMaterialSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeReviewItem" ADD CONSTRAINT "KnowledgeReviewItem_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeReviewItemSkill" ADD CONSTRAINT "KnowledgeReviewItemSkill_reviewItemId_fkey" FOREIGN KEY ("reviewItemId") REFERENCES "KnowledgeReviewItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeReviewItemSkill" ADD CONSTRAINT "KnowledgeReviewItemSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "KnowledgeNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeMapReference" ADD CONSTRAINT "KnowledgeMapReference_knowledgeMapId_fkey" FOREIGN KEY ("knowledgeMapId") REFERENCES "KnowledgeMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
