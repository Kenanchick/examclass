-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ClassroomMemberRole" AS ENUM ('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "ClassroomStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExamPart" AS ENUM ('FIRST', 'SECOND');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "inviteCode" TEXT NOT NULL,
    "status" "ClassroomStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomMember" (
    "classroomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ClassroomMemberRole" NOT NULL DEFAULT 'STUDENT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomMember_pkey" PRIMARY KEY ("classroomId","userId")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "parentId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "TopicStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicPrerequisite" (
    "topicId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "minimumMastery" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicPrerequisite_pkey" PRIMARY KEY ("topicId","prerequisiteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_inviteCode_key" ON "Classroom"("inviteCode");

-- CreateIndex
CREATE INDEX "Classroom_ownerId_idx" ON "Classroom"("ownerId");

-- CreateIndex
CREATE INDEX "Classroom_subjectId_idx" ON "Classroom"("subjectId");

-- CreateIndex
CREATE INDEX "ClassroomMember_userId_idx" ON "ClassroomMember"("userId");

-- CreateIndex
CREATE INDEX "Topic_subjectId_parentId_idx" ON "Topic"("subjectId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_slug_key" ON "Topic"("subjectId", "slug");

-- CreateIndex
CREATE INDEX "TopicPrerequisite_prerequisiteId_idx" ON "TopicPrerequisite"("prerequisiteId");

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicPrerequisite" ADD CONSTRAINT "TopicPrerequisite_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicPrerequisite" ADD CONSTRAINT "TopicPrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
