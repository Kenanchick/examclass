import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  KnowledgeNodeKind,
  LearningGoalStatus,
  LearningRouteModuleType,
  LearningRouteStatus,
  TeacherRouteActionType,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TeacherRoadmapOrderDto } from './dto/teacher-roadmap-order.dto';
import {
  EXAM_ROADMAP_CONNECTIONS,
  EXAM_ROADMAP_TITLES,
  getExamPart,
  resolveExamRoadmapStatus,
} from './domain/exam-roadmap';
import { getEffectiveSkillStatus } from './domain/teacher-skill-state';
import { LearningRouteAccessService } from './learning-route-access.service';
import { createTeacherRouteChange } from './teacher-route-change';

const unique = <T>(items: T[]) => [...new Set(items)];
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const EXAM_NUMBERS = Array.from({ length: 19 }, (_, index) => index + 1);
const ROADMAP_ORDER_CHANGE_KEY = 'ROADMAP:EXAM_ORDER';

const readExamOrder = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const examNumbers = (value as { examNumbers?: unknown }).examNumbers;
  if (
    !Array.isArray(examNumbers) ||
    examNumbers.length !== EXAM_NUMBERS.length ||
    !examNumbers.every(
      (examNumber) =>
        typeof examNumber === 'number' &&
        Number.isInteger(examNumber) &&
        examNumber >= 1 &&
        examNumber <= 19,
    ) ||
    new Set(examNumbers).size !== EXAM_NUMBERS.length
  ) {
    return null;
  }

  return examNumbers as number[];
};

const jsonStrings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const getPrimaryExamNumber = (
  mappings: Array<{ examNumber: number; weight: number }>,
) =>
  [...mappings].sort(
    (left, right) =>
      right.weight - left.weight || left.examNumber - right.examNumber,
  )[0]?.examNumber;

const getEffectiveMetrics = (
  state:
    | {
        mastery: number;
        confidence: number;
        status: string;
        needsReview?: boolean;
      }
    | null
    | undefined,
  control:
    | {
        manualStatus: string | null;
        autoStatusEnabled: boolean;
        reviewScheduledAt?: Date | null;
      }
    | null
    | undefined,
) => {
  const status = state
    ? getEffectiveSkillStatus(state.status, control)
    : 'INSUFFICIENT_DATA';
  if (control?.autoStatusEnabled !== false || !control.manualStatus) {
    return {
      status,
      mastery: state?.mastery ?? 0.5,
      confidence: state?.confidence ?? 0,
    };
  }

  const manualMastery: Record<string, number> = {
    UNSTUDIED: 0,
    WEAK: 0.3,
    LEARNING: 0.55,
    NEEDS_REINFORCEMENT: 0.72,
    MASTERED: 0.9,
    NEEDS_REVIEW: 0.76,
    TEACHER_CONFIRMED: 0.95,
  };

  return {
    status,
    mastery: manualMastery[control.manualStatus] ?? state?.mastery ?? 0.5,
    confidence: Math.max(state?.confidence ?? 0, 0.86),
  };
};

@Injectable()
export class TeacherRoadmapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: LearningRouteAccessService,
  ) {}

  async getMap(teacherId: string, studentId: string) {
    await this.access.assertTeacherStudent(teacherId, studentId);

    const goal = await this.prisma.studentLearningGoal.findFirst({
      where: { studentId, status: LearningGoalStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        knowledgeMapId: true,
        targetScore: true,
        examDate: true,
        weeklyMinutes: true,
        student: { select: { id: true, name: true, avatarUrl: true } },
        knowledgeMap: { select: { version: true, title: true } },
      },
    });
    if (!goal) {
      throw new NotFoundException('Учебная цель ученика не найдена');
    }

    const [nodes, route, evidence, latestOrderChange] = await Promise.all([
      this.prisma.knowledgeNode.findMany({
        where: {
          knowledgeMapId: goal.knowledgeMapId,
          kind: KnowledgeNodeKind.SKILL,
          examMappings: { some: { examNumber: { gte: 1, lte: 19 } } },
        },
        orderBy: [
          { parent: { parent: { sortOrder: 'asc' } } },
          { parent: { sortOrder: 'asc' } },
          { sortOrder: 'asc' },
        ],
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          isFoundational: true,
          importance: true,
          estimatedMinutes: true,
          sortOrder: true,
          parent: {
            select: {
              code: true,
              name: true,
              sortOrder: true,
              parent: { select: { code: true, name: true } },
            },
          },
          examMappings: {
            where: { examNumber: { gte: 1, lte: 19 } },
            select: { examNumber: true, weight: true },
          },
          skillStates: {
            where: { studentId },
            take: 1,
            select: {
              mastery: true,
              confidence: true,
              speed: true,
              stability: true,
              status: true,
              needsReview: true,
              evidenceCount: true,
              distinctEvidenceCount: true,
              lastVerifiedAt: true,
              reviewDueAt: true,
              explanation: true,
            },
          },
          teacherSkillControls: {
            where: { studentId },
            take: 1,
            select: {
              instructionStatus: true,
              manualStatus: true,
              autoStatusEnabled: true,
              reviewScheduledAt: true,
              controlScheduledAt: true,
              systemConclusionConfirmedAt: true,
              comment: true,
            },
          },
          prerequisiteLinks: {
            select: {
              type: true,
              rationale: true,
              prerequisite: {
                select: {
                  code: true,
                  name: true,
                  examMappings: {
                    where: { examNumber: { gte: 1, lte: 19 } },
                    select: { examNumber: true },
                  },
                  skillStates: {
                    where: { studentId },
                    take: 1,
                    select: {
                      mastery: true,
                      confidence: true,
                      status: true,
                    },
                  },
                  teacherSkillControls: {
                    where: { studentId },
                    take: 1,
                    select: {
                      manualStatus: true,
                      autoStatusEnabled: true,
                      reviewScheduledAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.learningRoute.findFirst({
        where: { studentId, status: LearningRouteStatus.ACTIVE },
        orderBy: { generatedAt: 'desc' },
        select: {
          publicId: true,
          generatedAt: true,
          modules: {
            orderBy: { position: 'asc' },
            select: {
              moduleKey: true,
              title: true,
              type: true,
              status: true,
              position: true,
              estimatedMinutes: true,
              reasons: true,
              completionCriteria: true,
              isPinned: true,
              isHidden: true,
              isCustom: true,
              autoUpdateEnabled: true,
              teacherComment: true,
              skills: {
                orderBy: { position: 'asc' },
                select: { skill: { select: { code: true } } },
              },
            },
          },
        },
      }),
      this.prisma.skillEvidence.findMany({
        where: {
          studentId,
          skill: { knowledgeMapId: goal.knowledgeMapId },
        },
        orderBy: { occurredAt: 'desc' },
        take: 240,
        select: {
          id: true,
          skillId: true,
          source: true,
          score: true,
          weight: true,
          activeSeconds: true,
          teacherConfirmed: true,
          reason: true,
          occurredAt: true,
          assessmentItem: {
            select: {
              publicId: true,
              attempt: {
                select: {
                  outcome: true,
                  awardedScore: true,
                  confidence: true,
                  reviewedAt: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.teacherRouteChange.findFirst({
        where: { studentId, moduleKey: ROADMAP_ORDER_CHANGE_KEY },
        orderBy: { createdAt: 'desc' },
        select: { after: true },
      }),
    ]);
    if (!route) {
      throw new NotFoundException('Маршрут ученика ещё не сформирован');
    }

    const nodeByCode = new Map(nodes.map((node) => [node.code, node]));
    const humanizeReason = (reason: string) =>
      reason.replace(/\b[a-z]+(?:\.[a-z0-9-]+)+\b/gi, (code) => {
        const skillName = nodeByCode.get(code)?.name;
        return skillName ? `«${skillName}»` : 'базовый навык';
      });
    const routeModules = route.modules.map((module) => ({
      ...module,
      skillCodes: module.skills.map(({ skill }) => skill.code),
    }));
    const currentModule =
      routeModules.find(
        (module) => !module.isHidden && module.status === 'AVAILABLE',
      ) ?? routeModules.find((module) => !module.isHidden);
    const currentExamNumber =
      currentModule?.skillCodes
        .map((code) =>
          getPrimaryExamNumber(nodeByCode.get(code)?.examMappings ?? []),
        )
        .find((examNumber) => examNumber !== undefined) ?? 1;
    const evidenceBySkillId = new Map<string, typeof evidence>();
    for (const item of evidence) {
      const list = evidenceBySkillId.get(item.skillId) ?? [];
      list.push(item);
      evidenceBySkillId.set(item.skillId, list);
    }

    const examOrder = readExamOrder(latestOrderChange?.after) ?? EXAM_NUMBERS;
    const orderIndex = new Map(
      examOrder.map((examNumber, index) => [examNumber, index]),
    );
    const roadmapNodes = Array.from(
      { length: 19 },
      (_, index) => index + 1,
    ).map((examNumber) => {
      const matching = nodes
        .map((node) => ({
          node,
          mapping: node.examMappings.find(
            (mapping) => mapping.examNumber === examNumber,
          ),
        }))
        .filter(
          (
            item,
          ): item is {
            node: (typeof nodes)[number];
            mapping: (typeof nodes)[number]['examMappings'][number];
          } => Boolean(item.mapping),
        );
      const totalWeight =
        matching.reduce((sum, item) => sum + item.mapping.weight, 0) || 1;
      const mastery = clamp01(
        matching.reduce((sum, { node, mapping }) => {
          const metrics = getEffectiveMetrics(
            node.skillStates[0],
            node.teacherSkillControls[0],
          );
          return sum + metrics.mastery * mapping.weight;
        }, 0) / totalWeight,
      );
      const confidence = clamp01(
        matching.reduce((sum, { node, mapping }) => {
          const metrics = getEffectiveMetrics(
            node.skillStates[0],
            node.teacherSkillControls[0],
          );
          return sum + metrics.confidence * mapping.weight;
        }, 0) / totalWeight,
      );
      const matchingCodes = new Set(
        matching
          .filter(
            ({ node }) =>
              getPrimaryExamNumber(node.examMappings) === examNumber,
          )
          .map(({ node }) => node.code),
      );
      const matchingModules = routeModules.filter((module) =>
        module.skillCodes.some((code) => matchingCodes.has(code)),
      );
      const isTeacherAssigned = matchingModules.some(
        (module) => module.type === LearningRouteModuleType.TEACHER_ASSIGNED,
      );
      const needsReview = matching.some(
        ({ node }) =>
          node.skillStates[0]?.needsReview ||
          Boolean(node.teacherSkillControls[0]?.reviewScheduledAt),
      );
      const prerequisiteItems = matching.flatMap(({ node }) =>
        node.prerequisiteLinks.map((link) => {
          const prerequisite = link.prerequisite;
          const systemState = prerequisite.skillStates[0];
          const control = prerequisite.teacherSkillControls[0];
          const effectiveMetrics = getEffectiveMetrics(systemState, control);
          const blocking =
            link.type === 'REQUIRED' &&
            !['MASTERED', 'TEACHER_CONFIRMED'].includes(
              effectiveMetrics.status,
            ) &&
            effectiveMetrics.mastery < 0.68;

          return {
            name: prerequisite.name,
            type: link.type,
            rationale: link.rationale,
            blocking,
            examNumbers: unique(
              prerequisite.examMappings.map((item) => item.examNumber),
            ).sort((left, right) => left - right),
          };
        }),
      );
      const prerequisiteByName = new Map(
        prerequisiteItems.map((item) => [item.name, item]),
      );
      const status = resolveExamRoadmapStatus({
        mastery,
        confidence,
        isCurrent: examNumber === currentExamNumber,
        isTeacherAssigned,
        needsReview,
        hasBlockingPrerequisite: prerequisiteItems.some(
          (item) => item.blocking,
        ),
      });
      const subtopicMap = new Map<
        string,
        {
          code: string;
          name: string;
          topic: string | null;
          skills: Array<{
            code: string;
            name: string;
            description: string | null;
            mastery: number;
            confidence: number;
            status: string;
            evidenceCount: number;
            lastVerifiedAt: Date | null;
            isFoundational: boolean;
          }>;
        }
      >();
      for (const { node } of matching) {
        const state = node.skillStates[0];
        const control = node.teacherSkillControls[0];
        const metrics = getEffectiveMetrics(state, control);
        const subtopicName = node.parent?.name ?? 'Другие навыки';
        const group = subtopicMap.get(subtopicName) ?? {
          code: node.parent?.code ?? `other-${examNumber}`,
          name: subtopicName,
          topic: node.parent?.parent?.name ?? null,
          skills: [],
        };
        group.skills.push({
          code: node.code,
          name: node.name,
          description: node.description,
          mastery: metrics.mastery,
          confidence: metrics.confidence,
          status: metrics.status,
          evidenceCount: state?.distinctEvidenceCount ?? 0,
          lastVerifiedAt: state?.lastVerifiedAt ?? null,
          isFoundational: node.isFoundational,
        });
        subtopicMap.set(subtopicName, group);
      }
      const subtopics = [...subtopicMap.values()].map((subtopic) => {
        const subtopicMastery =
          subtopic.skills.reduce((total, skill) => total + skill.mastery, 0) /
          Math.max(1, subtopic.skills.length);
        const subtopicConfidence =
          subtopic.skills.reduce(
            (total, skill) => total + skill.confidence,
            0,
          ) / Math.max(1, subtopic.skills.length);
        const masteredSkills = subtopic.skills.filter((skill) =>
          ['MASTERED', 'TEACHER_CONFIRMED'].includes(skill.status),
        ).length;

        return {
          ...subtopic,
          mastery: clamp01(subtopicMastery),
          confidence: clamp01(subtopicConfidence),
          masteredSkills,
          isMastered: masteredSkills === subtopic.skills.length,
        };
      });
      const isPassed =
        matching.length > 0 &&
        matching.every(({ node }) => {
          const metrics = getEffectiveMetrics(
            node.skillStates[0],
            node.teacherSkillControls[0],
          );
          return ['MASTERED', 'TEACHER_CONFIRMED'].includes(metrics.status);
        });
      const attempts = matching
        .flatMap(({ node }) => evidenceBySkillId.get(node.id) ?? [])
        .sort(
          (left, right) =>
            right.occurredAt.getTime() - left.occurredAt.getTime(),
        )
        .slice(0, 8);
      const reasons = unique(
        matchingModules.flatMap((module) =>
          jsonStrings(module.reasons).map(humanizeReason),
        ),
      ).slice(0, 4);
      if (reasons.length === 0) {
        reasons.push(
          status === 'MASTERED'
            ? 'Навыки подтверждены несколькими результатами; достаточно планового повторения.'
            : status === 'INSUFFICIENT_DATA'
              ? 'Нужно получить ещё несколько независимых решений для уверенного вывода.'
              : status === 'BLOCKED'
                ? 'Перед этим заданием нужно закрыть обязательные базовые пробелы.'
                : 'Результаты показывают, что навыки этого задания стоит укрепить.',
        );
      }

      return {
        examNumber,
        title: EXAM_ROADMAP_TITLES[examNumber],
        examPart: getExamPart(examNumber),
        mastery,
        confidence,
        status,
        isCurrent: examNumber === currentExamNumber,
        isTeacherAssigned,
        needsReview,
        isPassed,
        skillCount: matching.length,
        subtopics,
        reasons,
        prerequisites: [...prerequisiteByName.values()].slice(0, 12),
        unlocksExamNumbers: EXAM_ROADMAP_CONNECTIONS.filter(
          ([from]) => from === examNumber,
        ).map(([, to]) => to),
        completionCriteria: {
          mastery: 0.8,
          confidence: 0.65,
          independentAttempts: 3,
          description:
            'Не менее 80% владения, уверенность системы от 65% и три независимые подтверждающие попытки.',
        },
        attempts,
        plannedReviews: matching
          .flatMap(({ node }) => {
            const state = node.skillStates[0];
            const control = node.teacherSkillControls[0];
            const dates = [
              state?.reviewDueAt
                ? {
                    type: 'Повторение',
                    date: state.reviewDueAt,
                    skillName: node.name,
                  }
                : null,
              control?.reviewScheduledAt
                ? {
                    type: 'Назначено преподавателем',
                    date: control.reviewScheduledAt,
                    skillName: node.name,
                  }
                : null,
              control?.controlScheduledAt
                ? {
                    type: 'Контроль',
                    date: control.controlScheduledAt,
                    skillName: node.name,
                  }
                : null,
            ];
            return dates.filter(
              (item): item is NonNullable<typeof item> => item !== null,
            );
          })
          .sort((left, right) => left.date.getTime() - right.date.getTime())
          .slice(0, 8),
        routeModules: matchingModules.map((module) => ({
          moduleKey: module.moduleKey,
          title: module.title,
          type: module.type,
          status: module.status,
          position: module.position,
          estimatedMinutes: module.estimatedMinutes,
          isPinned: module.isPinned,
          isHidden: module.isHidden,
          autoUpdateEnabled: module.autoUpdateEnabled,
          teacherComment: module.teacherComment,
        })),
      };
    });

    const reviewNodes = routeModules
      .filter((module) =>
        /^REVIEW:TASK:(?:[1-9]|1[0-9])$/.test(module.moduleKey),
      )
      .map((module) => {
        const sourceExamNumber = Number(module.moduleKey.split(':').at(-1));
        const sourceNode = roadmapNodes.find(
          (node) => node.examNumber === sourceExamNumber,
        );
        if (!sourceNode) {
          return null;
        }

        const skillCodes = new Set(module.skillCodes);
        const subtopics = sourceNode.subtopics
          .map((subtopic) => ({
            code: subtopic.code,
            name: subtopic.name,
            skills: subtopic.skills
              .filter((skill) => skillCodes.has(skill.code))
              .map((skill) => ({ code: skill.code, name: skill.name })),
          }))
          .filter((subtopic) => subtopic.skills.length > 0);

        return {
          moduleKey: module.moduleKey,
          sourceExamNumber,
          title: sourceNode.title,
          subtopics,
          skillCount: module.skillCodes.length,
        };
      })
      .filter((node): node is NonNullable<typeof node> => node !== null);

    roadmapNodes.sort(
      (left, right) =>
        (orderIndex.get(left.examNumber) ?? left.examNumber) -
        (orderIndex.get(right.examNumber) ?? right.examNumber),
    );

    return {
      student: goal.student,
      goal: {
        targetScore: goal.targetScore,
        examDate: goal.examDate,
        weeklyMinutes: goal.weeklyMinutes,
      },
      knowledgeMap: goal.knowledgeMap,
      route: {
        publicId: route.publicId,
        generatedAt: route.generatedAt,
        currentExamNumber,
        examOrder,
      },
      nodes: roadmapNodes,
      reviewNodes,
      customNodes: routeModules
        .filter((module) => module.isCustom)
        .map((module) => ({
          moduleKey: module.moduleKey,
          title: module.title,
          description:
            module.teacherComment ??
            jsonStrings(module.reasons).map(humanizeReason)[0] ??
            'Дополнительная тема преподавателя',
          status: module.status,
          position: module.position,
          estimatedMinutes: module.estimatedMinutes,
          isPinned: module.isPinned,
          isHidden: module.isHidden,
          autoUpdateEnabled: module.autoUpdateEnabled,
        })),
      connections: examOrder.slice(0, -1).map((from, index) => ({
        from,
        to: examOrder[index + 1],
        kind: 'TEACHER_SEQUENCE' as const,
      })),
    };
  }

  async updateExamOrder(
    teacherId: string,
    studentId: string,
    dto: TeacherRoadmapOrderDto,
  ) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    const examOrder = readExamOrder({ examNumbers: dto.examNumbers });
    if (!examOrder) {
      throw new BadRequestException(
        'Порядок должен содержать все задания от 1 до 19 без повторений',
      );
    }

    const [route, latestOrderChange] = await Promise.all([
      this.prisma.learningRoute.findFirst({
        where: { studentId, status: LearningRouteStatus.ACTIVE },
        orderBy: { generatedAt: 'desc' },
        select: { id: true },
      }),
      this.prisma.teacherRouteChange.findFirst({
        where: { studentId, moduleKey: ROADMAP_ORDER_CHANGE_KEY },
        orderBy: { createdAt: 'desc' },
        select: { after: true },
      }),
    ]);
    if (!route) {
      throw new NotFoundException('Маршрут ученика ещё не сформирован');
    }

    const previousOrder =
      readExamOrder(latestOrderChange?.after) ?? EXAM_NUMBERS;
    if (
      previousOrder.every(
        (examNumber, index) => examNumber === examOrder[index],
      )
    ) {
      return { examOrder };
    }

    await this.prisma.teacherRouteChange.create({
      data: createTeacherRouteChange({
        studentId,
        authorId: teacherId,
        routeId: route.id,
        moduleKey: ROADMAP_ORDER_CHANGE_KEY,
        action: TeacherRouteActionType.MOVE_MODULE,
        reason: dto.reason,
        before: { examNumbers: previousOrder },
        after: { examNumbers: examOrder },
      }),
    });

    return { examOrder };
  }
}
