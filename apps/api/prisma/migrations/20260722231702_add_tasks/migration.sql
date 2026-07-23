-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "examPart" "ExamPart" NOT NULL,
    "statement" TEXT NOT NULL,
    "correctAnswer" TEXT,
    "referenceSolution" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_topicId_status_idx" ON "Task"("topicId", "status");

-- CreateIndex
CREATE INDEX "Task_examPart_status_idx" ON "Task"("examPart", "status");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
