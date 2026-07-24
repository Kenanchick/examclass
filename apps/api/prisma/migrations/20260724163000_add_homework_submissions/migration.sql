-- CreateEnum
CREATE TYPE "HomeworkSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED', 'REVIEWED');

-- CreateTable
CREATE TABLE "HomeworkSubmission" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "HomeworkSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkSubmissionAttachment" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkSubmissionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_publicId_key" ON "HomeworkSubmission"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_homeworkId_studentId_key" ON "HomeworkSubmission"("homeworkId", "studentId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_studentId_status_updatedAt_idx" ON "HomeworkSubmission"("studentId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_homeworkId_status_submittedAt_idx" ON "HomeworkSubmission"("homeworkId", "status", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmissionAttachment_publicId_key" ON "HomeworkSubmissionAttachment"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmissionAttachment_storageKey_key" ON "HomeworkSubmissionAttachment"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmissionAttachment_submissionId_taskId_key" ON "HomeworkSubmissionAttachment"("submissionId", "taskId");

-- CreateIndex
CREATE INDEX "HomeworkSubmissionAttachment_taskId_idx" ON "HomeworkSubmissionAttachment"("taskId");

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "HomeworkAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionAttachment" ADD CONSTRAINT "HomeworkSubmissionAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "HomeworkSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionAttachment" ADD CONSTRAINT "HomeworkSubmissionAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
