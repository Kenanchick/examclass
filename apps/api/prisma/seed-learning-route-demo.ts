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

const getDemoState = (examNumber: number) => {
  const variants = [
    {
      mastery: 1,
      confidence: 0.96,
      stability: 0.94,
      status: StudentSkillStatus.MASTERED,
      needsReview: false,
    },
    {
      mastery: 0.91,
      confidence: 0.86,
      stability: 0.84,
      status: StudentSkillStatus.MASTERED,
      needsReview: false,
    },
    {
      mastery: 0.84,
      confidence: 0.79,
      stability: 0.76,
      status: StudentSkillStatus.MASTERED,
      needsReview: false,
    },
    {
      mastery: 0.93,
      confidence: 0.84,
      stability: 0.81,
      status: StudentSkillStatus.MASTERED,
      needsReview: false,
    },
    {
      mastery: 0.78,
      confidence: 0.76,
      stability: 0.62,
      status: StudentSkillStatus.NEEDS_REVIEW,
      needsReview: true,
    },
    {
      mastery: 0.66,
      confidence: 0.7,
      stability: 0.58,
      status: StudentSkillStatus.NEEDS_REINFORCEMENT,
      needsReview: false,
    },
    {
      mastery: 0.95,
      confidence: 0.9,
      stability: 0.85,
      status: StudentSkillStatus.MASTERED,
      needsReview: false,
    },
    {
      mastery: 0.57,
      confidence: 0.64,
      stability: 0.49,
      status: StudentSkillStatus.LEARNING,
      needsReview: false,
    },
    {
      mastery: 0.76,
      confidence: 0.72,
      stability: 0.61,
      status: StudentSkillStatus.NEEDS_REINFORCEMENT,
      needsReview: false,
    },
    {
      mastery: 0.48,
      confidence: 0.71,
      stability: 0.42,
      status: StudentSkillStatus.WEAK,
      needsReview: false,
    },
    {
      mastery: 0.88,
      confidence: 0.82,
      stability: 0.79,
      status: StudentSkillStatus.MASTERED,
      needsReview: false,
    },
    {
      mastery: 0.67,
      confidence: 0.73,
      stability: 0.55,
      status: StudentSkillStatus.NEEDS_REVIEW,
      needsReview: true,
    },
    {
      mastery: 0.38,
      confidence: 0.69,
      stability: 0.33,
      status: StudentSkillStatus.WEAK,
      needsReview: false,
    },
    {
      mastery: 0.5,
      confidence: 0.25,
      stability: null,
      status: StudentSkillStatus.INSUFFICIENT_DATA,
      needsReview: false,
    },
    {
      mastery: 0.44,
      confidence: 0.66,
      stability: 0.37,
      status: StudentSkillStatus.WEAK,
      needsReview: false,
    },
    {
      mastery: 0.6,
      confidence: 0.62,
      stability: 0.48,
      status: StudentSkillStatus.LEARNING,
      needsReview: false,
    },
    {
      mastery: 0.31,
      confidence: 0.7,
      stability: 0.29,
      status: StudentSkillStatus.WEAK,
      needsReview: false,
    },
    {
      mastery: 0.25,
      confidence: 0.67,
      stability: 0.24,
      status: StudentSkillStatus.WEAK,
      needsReview: false,
    },
    {
      mastery: 0.52,
      confidence: 0.23,
      stability: null,
      status: StudentSkillStatus.INSUFFICIENT_DATA,
      needsReview: false,
    },
  ] as const;

  return variants[Math.max(1, Math.min(19, examNumber)) - 1];
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
    select: {
      id: true,
      code: true,
      examMappings: {
        orderBy: [{ weight: 'desc' }, { examNumber: 'asc' }],
        select: { examNumber: true },
      },
    },
  });
  const calculatedAt = new Date();

  await prisma.$transaction(
    skills.map((skill, index) => {
      const state = getDemoState(skill.examMappings[0]?.examNumber ?? 19);

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
