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

const getDemoState = (index: number) => {
  const variants = [
    {
      mastery: 0.32,
      confidence: 0.74,
      stability: 0.36,
      status: StudentSkillStatus.WEAK,
      needsReview: false,
    },
    {
      mastery: 0.5,
      confidence: 0.24,
      stability: null,
      status: StudentSkillStatus.INSUFFICIENT_DATA,
      needsReview: false,
    },
    {
      mastery: 0.58,
      confidence: 0.61,
      stability: 0.52,
      status: StudentSkillStatus.LEARNING,
      needsReview: false,
    },
    {
      mastery: 0.72,
      confidence: 0.7,
      stability: 0.57,
      status: StudentSkillStatus.NEEDS_REINFORCEMENT,
      needsReview: false,
    },
    {
      mastery: 0.87,
      confidence: 0.82,
      stability: 0.78,
      status: StudentSkillStatus.MASTERED,
      needsReview: false,
    },
    {
      mastery: 0.79,
      confidence: 0.76,
      stability: 0.68,
      status: StudentSkillStatus.NEEDS_REVIEW,
      needsReview: true,
    },
  ] as const;

  return variants[index % variants.length];
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
    select: { id: true, code: true },
  });
  const calculatedAt = new Date();

  await prisma.$transaction(
    skills.map((skill, index) => {
      const state = getDemoState(index);

      return prisma.studentSkillState.upsert({
        where: {
          studentId_skillId: { studentId: student.id, skillId: skill.id },
        },
        update: {
          knowledgeMapId: knowledgeMap.id,
          formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
          mastery: state.mastery,
          confidence: state.confidence,
          speed: index % 4 === 0 ? 0.48 : 0.72,
          stability: state.stability,
          evidenceWeight: state.confidence * 4,
          evidenceCount: state.status === 'INSUFFICIENT_DATA' ? 1 : 4,
          distinctEvidenceCount: state.status === 'INSUFFICIENT_DATA' ? 1 : 3,
          confirmingAttempts: state.mastery >= 0.65 ? 3 : 1,
          contradictingAttempts: state.mastery < 0.45 ? 3 : 1,
          status: state.status,
          needsReview: state.needsReview,
          reviewDueAt: state.needsReview ? calculatedAt : null,
          lastEvidenceAt: calculatedAt,
          lastVerifiedAt: calculatedAt,
          sourceSummary: {
            FULL_EXAM: {
              attempts: 2,
              effectiveWeight: 1.4,
              lastAt: calculatedAt.toISOString(),
            },
          },
          explanation: {
            reasons: [
              state.status === 'INSUFFICIENT_DATA'
                ? 'Нужны дополнительные независимые попытки'
                : 'Демонстрационная оценка для проверки рабочего места преподавателя',
            ],
          },
        },
        create: {
          studentId: student.id,
          skillId: skill.id,
          knowledgeMapId: knowledgeMap.id,
          formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
          mastery: state.mastery,
          confidence: state.confidence,
          speed: index % 4 === 0 ? 0.48 : 0.72,
          stability: state.stability,
          evidenceWeight: state.confidence * 4,
          evidenceCount: state.status === 'INSUFFICIENT_DATA' ? 1 : 4,
          distinctEvidenceCount: state.status === 'INSUFFICIENT_DATA' ? 1 : 3,
          confirmingAttempts: state.mastery >= 0.65 ? 3 : 1,
          contradictingAttempts: state.mastery < 0.45 ? 3 : 1,
          status: state.status,
          needsReview: state.needsReview,
          reviewDueAt: state.needsReview ? calculatedAt : null,
          lastEvidenceAt: calculatedAt,
          lastVerifiedAt: calculatedAt,
          sourceSummary: {
            FULL_EXAM: {
              attempts: 2,
              effectiveWeight: 1.4,
              lastAt: calculatedAt.toISOString(),
            },
          },
          explanation: {
            reasons: [
              state.status === 'INSUFFICIENT_DATA'
                ? 'Нужны дополнительные независимые попытки'
                : 'Демонстрационная оценка для проверки рабочего места преподавателя',
            ],
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
