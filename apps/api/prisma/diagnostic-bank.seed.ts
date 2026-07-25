import {
  DiagnosticHypothesisType,
  DiagnosticQuestionKind,
  KnowledgeMapStatus,
  KnowledgeNodeKind,
  PrismaClient,
  QuestionEvaluationMode,
  TaskSkillRole,
} from '../src/generated/prisma/client';
import {
  diagnosticQuestionTemplates,
  diagnosticTaskSkillMappings,
} from './diagnostic-bank.data';

type DiagnosticBankPrismaClient = Pick<
  PrismaClient,
  | 'diagnosticQuestionTemplate'
  | 'knowledgeMap'
  | 'knowledgeNode'
  | 'task'
  | 'taskSkill'
>;

const mappingRolePriority: Record<TaskSkillRole, number> = {
  PRIMARY: 3,
  SECONDARY: 2,
  PREREQUISITE: 1,
};

export const seedDiagnosticBank = async (
  prisma: DiagnosticBankPrismaClient,
) => {
  const knowledgeMap = await prisma.knowledgeMap.findFirst({
    where: {
      subject: { code: 'profile-math-ege' },
      status: {
        in: [KnowledgeMapStatus.PUBLISHED, KnowledgeMapStatus.IN_REVIEW],
      },
    },
    orderBy: { version: 'desc' },
    select: { id: true, version: true },
  });

  if (!knowledgeMap) {
    throw new Error('Knowledge map must be seeded before diagnostic bank');
  }

  const requestedSkillCodes = [
    ...new Set([
      ...diagnosticTaskSkillMappings.flatMap((mapping) => [
        ...mapping.primary,
        ...(mapping.secondary ?? []),
        ...(mapping.prerequisite ?? []),
      ]),
      ...diagnosticQuestionTemplates.map(
        (template) => template.targetSkillCode,
      ),
    ]),
  ];
  const skills = await prisma.knowledgeNode.findMany({
    where: {
      knowledgeMapId: knowledgeMap.id,
      kind: KnowledgeNodeKind.SKILL,
      code: { in: requestedSkillCodes },
    },
    select: { id: true, code: true },
  });
  const skillIdByCode = new Map(skills.map((skill) => [skill.code, skill.id]));
  const missingSkillCodes = requestedSkillCodes.filter(
    (code) => !skillIdByCode.has(code),
  );

  if (missingSkillCodes.length > 0) {
    throw new Error(
      `Unknown diagnostic skill codes: ${missingSkillCodes.join(', ')}`,
    );
  }

  for (const template of diagnosticQuestionTemplates) {
    await prisma.diagnosticQuestionTemplate.upsert({
      where: {
        knowledgeMapId_code: {
          knowledgeMapId: knowledgeMap.id,
          code: template.code,
        },
      },
      update: {
        targetSkillId: skillIdByCode.get(template.targetSkillCode)!,
        kind: DiagnosticQuestionKind[template.kind],
        evaluationMode: QuestionEvaluationMode[template.evaluationMode],
        hypothesisType: DiagnosticHypothesisType[template.hypothesisType],
        prompt: template.prompt,
        correctAnswer: template.correctAnswer,
        answerOptions: template.answerOptions,
        estimatedSeconds: template.estimatedSeconds,
        difficulty: template.difficulty,
        isActive: true,
      },
      create: {
        knowledgeMapId: knowledgeMap.id,
        targetSkillId: skillIdByCode.get(template.targetSkillCode)!,
        code: template.code,
        kind: DiagnosticQuestionKind[template.kind],
        evaluationMode: QuestionEvaluationMode[template.evaluationMode],
        hypothesisType: DiagnosticHypothesisType[template.hypothesisType],
        prompt: template.prompt,
        correctAnswer: template.correctAnswer,
        answerOptions: template.answerOptions,
        estimatedSeconds: template.estimatedSeconds,
        difficulty: template.difficulty,
      },
    });
  }

  const mappingsBySlug = new Map(
    diagnosticTaskSkillMappings.map((mapping) => [mapping.topicSlug, mapping]),
  );
  const tasks = await prisma.task.findMany({
    where: { topic: { slug: { in: [...mappingsBySlug.keys()] } } },
    select: {
      id: true,
      topic: { select: { slug: true } },
    },
  });
  let taskSkillLinks = 0;

  for (const task of tasks) {
    const mapping = mappingsBySlug.get(task.topic.slug);

    if (!mapping) {
      continue;
    }

    const requestedLinks = [
      ...mapping.primary.map((skillCode) => ({
        skillCode,
        role: TaskSkillRole.PRIMARY,
        weight: 1,
      })),
      ...(mapping.secondary ?? []).map((skillCode) => ({
        skillCode,
        role: TaskSkillRole.SECONDARY,
        weight: 0.65,
      })),
      ...(mapping.prerequisite ?? []).map((skillCode) => ({
        skillCode,
        role: TaskSkillRole.PREREQUISITE,
        weight: 0.45,
      })),
    ];
    const deduplicated = [
      ...requestedLinks
        .reduce<
          Map<
            string,
            { skillCode: string; role: TaskSkillRole; weight: number }
          >
        >((result, link) => {
          const existing = result.get(link.skillCode);

          if (
            !existing ||
            mappingRolePriority[link.role] > mappingRolePriority[existing.role]
          ) {
            result.set(link.skillCode, link);
          }

          return result;
        }, new Map())
        .values(),
    ];

    for (const link of deduplicated) {
      await prisma.taskSkill.upsert({
        where: {
          taskId_skillId: {
            taskId: task.id,
            skillId: skillIdByCode.get(link.skillCode)!,
          },
        },
        update: {
          role: link.role,
          weight: link.weight,
        },
        create: {
          taskId: task.id,
          skillId: skillIdByCode.get(link.skillCode)!,
          role: link.role,
          weight: link.weight,
        },
      });
      taskSkillLinks += 1;
    }
  }

  return {
    knowledgeMapVersion: knowledgeMap.version,
    questionTemplates: diagnosticQuestionTemplates.length,
    mappedTasks: tasks.length,
    taskSkillLinks,
  };
};
