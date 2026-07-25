import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  LearningRouteModuleStatus,
  LearningRouteModuleType,
  LearningRouteStatus,
  Prisma,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import type { LearningRoutePlan } from './domain/route-types';
import type { LearningRouteData } from './learning-route-data.service';

const createPublicId = () =>
  `ROUTE-${randomUUID().replaceAll('-', '').toUpperCase()}`;

const storedModuleSelect = {
  moduleNodeId: true,
  moduleKey: true,
  title: true,
  type: true,
  status: true,
  position: true,
  priority: true,
  estimatedMinutes: true,
  blockedBySkillCodes: true,
  recommendedBeforeCodes: true,
  teacherAssignmentIds: true,
  factorBreakdown: true,
  completionCriteria: true,
  reasons: true,
  isPinned: true,
  isHidden: true,
  autoUpdateEnabled: true,
  isCustom: true,
  positionLocked: true,
  teacherComment: true,
  skills: {
    select: {
      skillId: true,
      position: true,
      priority: true,
      plannedMinutes: true,
      targetMastery: true,
      targetConfidence: true,
      targetStability: true,
      reason: true,
    },
  },
} as const;

type StoredModule = Prisma.LearningRouteModuleGetPayload<{
  select: typeof storedModuleSelect;
}>;

const copyStoredModule = (module: StoredModule) => ({
  moduleNodeId: module.moduleNodeId,
  moduleKey: module.moduleKey,
  title: module.title,
  type: module.type,
  status: module.status,
  position: module.position,
  priority: module.priority,
  estimatedMinutes: module.estimatedMinutes,
  blockedBySkillCodes: module.blockedBySkillCodes,
  recommendedBeforeCodes: module.recommendedBeforeCodes,
  teacherAssignmentIds: module.teacherAssignmentIds,
  factorBreakdown: module.factorBreakdown as Prisma.InputJsonValue,
  completionCriteria: module.completionCriteria as Prisma.InputJsonValue,
  reasons: module.reasons as Prisma.InputJsonValue,
  isPinned: module.isPinned,
  isHidden: module.isHidden,
  autoUpdateEnabled: module.autoUpdateEnabled,
  isCustom: module.isCustom,
  positionLocked: module.positionLocked,
  teacherComment: module.teacherComment,
  skills: {
    create: module.skills.map((skill) => ({
      skillId: skill.skillId,
      position: skill.position,
      priority: skill.priority,
      plannedMinutes: skill.plannedMinutes,
      targetMastery: skill.targetMastery,
      targetConfidence: skill.targetConfidence,
      targetStability: skill.targetStability,
      reason: skill.reason,
    })),
  },
});

@Injectable()
export class LearningRouteStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    studentId: string,
    data: LearningRouteData,
    plan: LearningRoutePlan,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const previousRoute = await transaction.learningRoute.findFirst({
        where: { studentId, status: LearningRouteStatus.ACTIVE },
        orderBy: { generatedAt: 'desc' },
        select: { modules: { select: storedModuleSelect } },
      });
      const previousByKey = new Map(
        previousRoute?.modules.map((module) => [module.moduleKey, module]) ??
          [],
      );
      const generatedModules = plan.modules.map((module) => {
        const previous = previousByKey.get(module.moduleKey);
        if (previous && !previous.autoUpdateEnabled) {
          return copyStoredModule(previous);
        }

        return {
          moduleNodeId: module.moduleId,
          moduleKey: module.moduleKey,
          title: module.title,
          type: LearningRouteModuleType[module.type],
          status: LearningRouteModuleStatus[module.status],
          position:
            previous?.positionLocked === true
              ? previous.position
              : module.position,
          priority: module.priority,
          estimatedMinutes: module.estimatedMinutes,
          blockedBySkillCodes: module.blockedBySkillCodes,
          recommendedBeforeCodes: module.recommendedBeforeCodes,
          teacherAssignmentIds: module.teacherAssignmentIds,
          factorBreakdown: module.factors as Prisma.InputJsonValue,
          completionCriteria:
            module.completionCriteria as Prisma.InputJsonValue,
          reasons: module.reasons as Prisma.InputJsonValue,
          isPinned: previous?.isPinned ?? false,
          isHidden: previous?.isHidden ?? false,
          autoUpdateEnabled: previous?.autoUpdateEnabled ?? true,
          isCustom: false,
          positionLocked: previous?.positionLocked ?? false,
          teacherComment: previous?.teacherComment ?? null,
          skills: {
            create: module.skills.map((skill, index) => ({
              skillId: skill.skillId,
              position: index + 1,
              priority: skill.priority,
              plannedMinutes: skill.plannedMinutes,
              targetMastery: skill.targetMastery,
              targetConfidence: skill.targetConfidence,
              targetStability: skill.targetStability,
              reason: skill.reason,
            })),
          },
        };
      });
      const generatedKeys = new Set(
        generatedModules.map((module) => module.moduleKey),
      );
      const preservedModules =
        previousRoute?.modules
          .filter(
            (module) =>
              !generatedKeys.has(module.moduleKey) &&
              (module.isCustom ||
                module.isPinned ||
                module.isHidden ||
                !module.autoUpdateEnabled),
          )
          .map(copyStoredModule) ?? [];
      const modules = [...generatedModules, ...preservedModules]
        .sort(
          (left, right) =>
            left.position - right.position ||
            left.moduleKey.localeCompare(right.moduleKey),
        )
        .map((module, index) => ({ ...module, position: index + 1 }));

      await transaction.learningRoute.updateMany({
        where: { studentId, status: LearningRouteStatus.ACTIVE },
        data: { status: LearningRouteStatus.SUPERSEDED },
      });

      return transaction.learningRoute.create({
        data: {
          publicId: createPublicId(),
          studentId,
          goalId: data.goalId,
          knowledgeMapId: data.knowledgeMapId,
          algorithmVersion: plan.algorithmVersion,
          profileFormulaVersion: data.profileFormulaVersion,
          generatedAt: plan.generatedAt,
          horizonEndAt: plan.horizonEndAt,
          availableMinutes: plan.availableMinutes,
          totalPlannedMinutes: modules.reduce(
            (total, module) => total + module.estimatedMinutes,
            0,
          ),
          explanation: plan.explanation as Prisma.InputJsonValue,
          modules: {
            create: modules,
          },
        },
        select: { id: true },
      });
    });
  }

  async getCurrent(studentId: string) {
    const route = await this.prisma.learningRoute.findFirst({
      where: { studentId, status: LearningRouteStatus.ACTIVE },
      orderBy: { generatedAt: 'desc' },
      select: { id: true },
    });

    if (!route) {
      throw new NotFoundException(
        'Маршрут ещё не сформирован. Запустите его построение',
      );
    }

    return this.getById(route.id, studentId);
  }

  async getById(routeId: string, studentId: string) {
    const [route, latestProfileState] = await Promise.all([
      this.prisma.learningRoute.findUniqueOrThrow({
        where: { id: routeId },
        select: {
          publicId: true,
          algorithmVersion: true,
          profileFormulaVersion: true,
          status: true,
          generatedAt: true,
          horizonEndAt: true,
          availableMinutes: true,
          totalPlannedMinutes: true,
          explanation: true,
          student: {
            select: { id: true, name: true, avatarUrl: true },
          },
          goal: {
            select: {
              publicId: true,
              targetScore: true,
              examDate: true,
              weeklyMinutes: true,
              updatedAt: true,
            },
          },
          knowledgeMap: { select: { version: true, title: true } },
          modules: {
            orderBy: { position: 'asc' },
            select: {
              moduleKey: true,
              title: true,
              type: true,
              status: true,
              position: true,
              priority: true,
              estimatedMinutes: true,
              blockedBySkillCodes: true,
              recommendedBeforeCodes: true,
              teacherAssignmentIds: true,
              factorBreakdown: true,
              completionCriteria: true,
              reasons: true,
              isPinned: true,
              isHidden: true,
              autoUpdateEnabled: true,
              isCustom: true,
              positionLocked: true,
              teacherComment: true,
              moduleNode: { select: { code: true, name: true } },
              skills: {
                orderBy: { position: 'asc' },
                select: {
                  position: true,
                  priority: true,
                  plannedMinutes: true,
                  targetMastery: true,
                  targetConfidence: true,
                  targetStability: true,
                  reason: true,
                  skill: {
                    select: {
                      code: true,
                      name: true,
                      skillStates: {
                        where: { studentId },
                        select: {
                          mastery: true,
                          confidence: true,
                          stability: true,
                          status: true,
                          needsReview: true,
                        },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.studentSkillState.findFirst({
        where: {
          studentId,
          knowledgeMap: { learningRoutes: { some: { id: routeId } } },
        },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    return {
      ...route,
      isStale:
        (latestProfileState?.updatedAt.getTime() ?? 0) >
          route.generatedAt.getTime() ||
        route.goal.updatedAt.getTime() > route.generatedAt.getTime(),
      modules: route.modules.map((module) => ({
        ...module,
        skills: module.skills.map(({ skill, ...item }) => ({
          ...item,
          code: skill.code,
          name: skill.name,
          currentState: skill.skillStates[0] ?? null,
        })),
      })),
    };
  }
}
