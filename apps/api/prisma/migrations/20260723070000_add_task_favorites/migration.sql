-- CreateTable
CREATE TABLE "TaskFavorite" (
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskFavorite_pkey" PRIMARY KEY ("userId", "taskId")
);

-- CreateIndex
CREATE INDEX "TaskFavorite_userId_createdAt_idx" ON "TaskFavorite"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "TaskFavorite" ADD CONSTRAINT "TaskFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFavorite" ADD CONSTRAINT "TaskFavorite_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
