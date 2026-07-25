import { Injectable, NotFoundException } from '@nestjs/common';
import {
  KnowledgeNodeKind,
  LearningGoalStatus,
  LearningRouteModuleType,
  LearningRouteStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  EXAM_ROADMAP_CONNECTIONS,
  EXAM_ROADMAP_TITLES,
  getExamPart,
  resolveExamRoadmapStatus,
} from './domain/exam-roadmap';
import { getEffectiveSkillStatus } from './domain/teacher-skill-state';
import { LearningRouteAccessService } from './learning-route-access.service';

const unique = <T>(items: T[]) => [...new Set(items)];
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

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

    const [nodes, route, evidence] = await Promise.all([
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
      },
      nodes: roadmapNodes,
      connections: EXAM_ROADMAP_CONNECTIONS.map(([from, to]) => ({
        from,
        to,
        kind: 'KNOWLEDGE_DEPENDENCY' as const,
      })),
    };
  }
}
