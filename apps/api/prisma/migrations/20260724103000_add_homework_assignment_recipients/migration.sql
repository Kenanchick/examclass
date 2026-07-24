-- CreateTable
CREATE TABLE "HomeworkAssignmentRecipient" (
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeworkAssignmentRecipient_pkey" PRIMARY KEY ("homeworkId","studentId")
);

-- CreateIndex
CREATE INDEX "HomeworkAssignmentRecipient_studentId_assignedAt_idx" ON "HomeworkAssignmentRecipient"("studentId", "assignedAt");

-- AddForeignKey
ALTER TABLE "HomeworkAssignmentRecipient" ADD CONSTRAINT "HomeworkAssignmentRecipient_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "HomeworkAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAssignmentRecipient" ADD CONSTRAINT "HomeworkAssignmentRecipient_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
