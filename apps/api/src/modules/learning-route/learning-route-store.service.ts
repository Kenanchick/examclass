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

@Injectable()
export class LearningRouteStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    studentId: string,
    data: LearningRouteData,
    plan: LearningRoutePlan,
  ) {
    return this.prisma.$transaction(async (transaction) => {
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
          totalPlannedMinutes: plan.totalPlannedMinutes,
          explanation: plan.explanation as Prisma.InputJsonValue,
          modules: {
            create: plan.modules.map((module) => ({
              moduleNodeId: module.moduleId,
              moduleKey: module.moduleKey,
              title: module.title,
              type: LearningRouteModuleType[module.type],
              status: LearningRouteModuleStatus[module.status],
              position: module.position,
              priority: module.priority,
              estimatedMinutes: module.estimatedMinutes,
              blockedBySkillCodes: module.blockedBySkillCodes,
              recommendedBeforeCodes: module.recommendedBeforeCodes,
              teacherAssignmentIds: module.teacherAssignmentIds,
              factorBreakdown: module.factors as Prisma.InputJsonValue,
              completionCriteria:
                module.completionCriteria as Prisma.InputJsonValue,
              reasons: module.reasons as Prisma.InputJsonValue,
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
            })),
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
