-- CreateEnum
CREATE TYPE "AttemptIndependence" AS ENUM ('UNKNOWN', 'INDEPENDENT', 'MINOR_HINT', 'MAJOR_HELP');

-- AlterEnum
ALTER TYPE "SkillEvidenceSource" ADD VALUE 'HOMEWORK';
ALTER TYPE "SkillEvidenceSource" ADD VALUE 'CONTROL_WORK';
ALTER TYPE "SkillEvidenceSource" ADD VALUE 'MOCK_EXAM';
ALTER TYPE "SkillEvidenceSource" ADD VALUE 'LESSON';
ALTER TYPE "SkillEvidenceSource" ADD VALUE 'TEACHER_CONFIRMATION';

-- AlterEnum
ALTER TYPE "StudentSkillStatus" ADD VALUE 'INSUFFICIENT_DATA';
ALTER TYPE "StudentSkillStatus" ADD VALUE 'WEAK';
ALTER TYPE "StudentSkillStatus" ADD VALUE 'LEARNING';
ALTER TYPE "StudentSkillStatus" ADD VALUE 'NEEDS_REINFORCEMENT';
ALTER TYPE "StudentSkillStatus" ADD VALUE 'NEEDS_REVIEW';
ALTER TYPE "StudentSkillStatus" ADD VALUE 'TEACHER_CONFIRMED';

-- AlterTable
ALTER TABLE "AssessmentAttempt"
ADD COLUMN "independence" "AttemptIndependence" NOT NULL DEFAULT 'UNKNOWN';

-- AlterTable
ALTER TABLE "SkillEvidence"
ADD COLUMN "activeSeconds" INTEGER,
ADD COLUMN "difficulty" INTEGER,
ADD COLUMN "errorType" "AssessmentReviewErrorType",
ADD COLUMN "expectedSeconds" INTEGER,
ADD COLUMN "independence" "AttemptIndependence" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "selfConfidence" INTEGER,
ADD COLUMN "skillRole" "TaskSkillRole",
ADD COLUMN "teacherConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StudentSkillState"
ADD COLUMN "confirmingAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "contradictingAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "explanation" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "formulaVersion" TEXT NOT NULL DEFAULT 'legacy',
ADD COLUMN "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN "needsReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reviewDueAt" TIMESTAMP(3),
ADD COLUMN "sourceSummary" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "speed" DOUBLE PRECISION,
ADD COLUMN "stability" DOUBLE PRECISION,
ADD COLUMN "teacherConfirmedAt" TIMESTAMP(3);
