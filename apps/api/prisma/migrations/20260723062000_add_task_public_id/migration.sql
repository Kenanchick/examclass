-- AlterTable
ALTER TABLE "Task" ADD COLUMN "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_publicId_key" ON "Task"("publicId");
