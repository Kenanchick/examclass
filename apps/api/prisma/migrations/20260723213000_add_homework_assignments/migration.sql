-- CreateTable
CREATE TABLE "HomeworkAssignment" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "classroomId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkAssignmentTask" (
    "homeworkId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HomeworkAssignmentTask_pkey" PRIMARY KEY ("homeworkId","taskId")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkAssignment_publicId_key" ON "HomeworkAssignment"("publicId");

-- CreateIndex
CREATE INDEX "HomeworkAssignment_classroomId_deadline_idx" ON "HomeworkAssignment"("classroomId", "deadline");

-- CreateIndex
CREATE INDEX "HomeworkAssignment_assignedById_idx" ON "HomeworkAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "HomeworkAssignmentTask_taskId_idx" ON "HomeworkAssignmentTask"("taskId");

-- AddForeignKey
ALTER TABLE "HomeworkAssignment" ADD CONSTRAINT "HomeworkAssignment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAssignment" ADD CONSTRAINT "HomeworkAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAssignmentTask" ADD CONSTRAINT "HomeworkAssignmentTask_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "HomeworkAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAssignmentTask" ADD CONSTRAINT "HomeworkAssignmentTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
