import 'dotenv/config';

import { ConfigService } from '@nestjs/config';
import {
  KnowledgeMapStatus,
  KnowledgeNodeKind,
  LearningGoalStatus,
  Role,
  StudentSkillStatus,
} from '../src/generated/prisma/client';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { KNOWLEDGE_PROFILE_FORMULA_VERSION } from '../src/modules/diagnostics/domain/profile-factors';
import { buildLearningRoute } from '../src/modules/learning-route/domain/route-planner';
import { LearningRouteDataService } from '../src/modules/learning-route/learning-route-data.service';
import { LearningRouteStoreService } from '../src/modules/learning-route/learning-route-store.service';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaService(
  new ConfigService({ DATABASE_URL: connectionString }),
);

const initialSkillState = {
  mastery: 0,
  confidence: 0,
  stability: null,
  status: StudentSkillStatus.UNSTUDIED,
  needsReview: false,
};

async function main() {
  const [student, knowledgeMap] = await Promise.all([
    prisma.user.findUnique({ where: { email: 'demo@examclass.local' } }),
    prisma.knowledgeMap.findFirst({
      where: {
        status: {
          in: [KnowledgeMapStatus.PUBLISHED, KnowledgeMapStatus.IN_REVIEW],
        },
        subject: { code: 'profile-math-ege' },
      },
      orderBy: { version: 'desc' },
    }),
  ]);

  if (!student || student.role !== Role.STUDENT || !knowledgeMap) {
    throw new Error('Demo student or knowledge map is missing');
  }

  await prisma.$transaction([
    prisma.teacherRouteChange.deleteMany({ where: { studentId: student.id } }),
    prisma.teacherSkillControl.deleteMany({ where: { studentId: student.id } }),
    prisma.learningRoute.deleteMany({ where: { studentId: student.id } }),
    prisma.studentSkillStateRevision.deleteMany({
      where: { studentId: student.id },
    }),
    prisma.skillEvidence.deleteMany({ where: { studentId: student.id } }),
  ]);

  await prisma.studentLearningGoal.updateMany({
    where: {
      studentId: student.id,
      status: LearningGoalStatus.ACTIVE,
      publicId: { not: 'GOAL-DEMO-TRAJECTORY' },
    },
    data: { status: LearningGoalStatus.ARCHIVED },
  });
  const goal = await prisma.studentLearningGoal.upsert({
    where: { publicId: 'GOAL-DEMO-TRAJECTORY' },
    update: {
      knowledgeMapId: knowledgeMap.id,
      targetScore: 90,
      examDate: new Date('2027-06-01T07:00:00.000Z'),
      weeklyMinutes: 420,
      preferredSessionMinutes: 60,
      availableWeekdays: [1, 3, 5, 6],
      status: LearningGoalStatus.ACTIVE,
    },
    create: {
      publicId: 'GOAL-DEMO-TRAJECTORY',
      studentId: student.id,
      knowledgeMapId: knowledgeMap.id,
      targetScore: 90,
      examDate: new Date('2027-06-01T07:00:00.000Z'),
      weeklyMinutes: 420,
      preferredSessionMinutes: 60,
      availableWeekdays: [1, 3, 5, 6],
      status: LearningGoalStatus.ACTIVE,
    },
  });
  const skills = await prisma.knowledgeNode.findMany({
    where: {
      knowledgeMapId: knowledgeMap.id,
      kind: KnowledgeNodeKind.SKILL,
    },
    orderBy: { code: 'asc' },
    select: { id: true },
  });
  const calculatedAt = new Date();

  await prisma.$transaction(
    skills.map((skill) => {
      const state = initialSkillState;

      return prisma.studentSkillState.upsert({
        where: {
          studentId_skillId: { studentId: student.id, skillId: skill.id },
        },
        update: {
          knowledgeMapId: knowledgeMap.id,
          formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
          mastery: state.mastery,
          confidence: state.confidence,
          speed: null,
          stability: state.stability,
          evidenceWeight: 0,
          evidenceCount: 0,
          distinctEvidenceCount: 0,
          confirmingAttempts: 0,
          contradictingAttempts: 0,
          status: state.status,
          needsReview: state.needsReview,
          reviewDueAt: null,
          lastEvidenceAt: null,
          lastVerifiedAt: null,
          sourceSummary: {},
          explanation: {
            reasons: ['Ученик начинает подготовку с нуля'],
          },
        },
        create: {
          studentId: student.id,
          skillId: skill.id,
          knowledgeMapId: knowledgeMap.id,
          formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
          mastery: state.mastery,
          confidence: state.confidence,
          speed: null,
          stability: state.stability,
          evidenceWeight: 0,
          evidenceCount: 0,
          distinctEvidenceCount: 0,
          confirmingAttempts: 0,
          contradictingAttempts: 0,
          status: state.status,
          needsReview: state.needsReview,
          reviewDueAt: null,
          lastEvidenceAt: null,
          lastVerifiedAt: null,
          sourceSummary: {},
          explanation: {
            reasons: ['Ученик начинает подготовку с нуля'],
          },
        },
      });
    }),
  );

  const data = await new LearningRouteDataService(prisma).load(
    student.id,
    calculatedAt,
  );
  const plan = buildLearningRoute(data.input);
  const saved = await new LearningRouteStoreService(prisma).save(
    student.id,
    data,
    plan,
  );

  console.log('Demo learning route seeded', {
    studentId: student.id,
    goalId: goal.publicId,
    routeId: saved.id,
    skills: skills.length,
    modules: plan.modules.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
