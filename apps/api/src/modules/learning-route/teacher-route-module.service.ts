import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  LearningGoalStatus,
  LearningRouteModuleStatus,
  LearningRouteModuleType,
  LearningRouteStatus,
  Prisma,
  TeacherRouteActionType,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateTeacherRouteModuleDto } from './dto/create-teacher-route-module.dto';
import { TeacherModuleActionDto } from './dto/teacher-module-action.dto';
import { UpdateLearningLoadDto } from './dto/update-learning-load.dto';
import { LearningRouteAccessService } from './learning-route-access.service';
import { LearningRouteService } from './learning-route.service';
import { LearningRouteStoreService } from './learning-route-store.service';
import { createTeacherRouteChange } from './teacher-route-change';

const moduleActions = new Set<TeacherRouteActionType>([
  TeacherRouteActionType.MOVE_MODULE,
  TeacherRouteActionType.PIN_MODULE,
  TeacherRouteActionType.UNPIN_MODULE,
  TeacherRouteActionType.HIDE_MODULE,
  TeacherRouteActionType.SHOW_MODULE,
  TeacherRouteActionType.UPDATE_MODULE_COMMENT,
  TeacherRouteActionType.SET_MODULE_AUTOMATION,
]);

@Injectable()
export class TeacherRouteModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: LearningRouteAccessService,
    private readonly routes: LearningRouteService,
    private readonly store: LearningRouteStoreService,
  ) {}

  async applyAction(
    teacherId: string,
    studentId: string,
    moduleKey: string,
    dto: TeacherModuleActionDto,
  ) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    if (!moduleActions.has(dto.action)) {
      throw new BadRequestException('Эта команда не относится к модулю');
    }

    const route = await this.getActiveRoute(studentId);
    const currentIndex = route.modules.findIndex(
      (module) => module.moduleKey === moduleKey,
    );
    const module = route.modules[currentIndex];
    if (!module) {
      throw new NotFoundException('Модуль маршрута не найден');
    }

    if (dto.action === TeacherRouteActionType.MOVE_MODULE) {
      if (!dto.direction) {
        throw new BadRequestException('Укажите направление перемещения');
      }
      const targetIndex =
        dto.direction === 'UP' ? currentIndex - 1 : currentIndex + 1;
      const target = route.modules[targetIndex];
      if (!target) {
        return this.store.getById(route.id, studentId);
      }

      await this.prisma.$transaction(async (transaction) => {
        await Promise.all([
          transaction.learningRouteModule.update({
            where: { id: module.id },
            data: {
              position: target.position,
              positionLocked: true,
            },
          }),
          transaction.learningRouteModule.update({
            where: { id: target.id },
            data: {
              position: module.position,
              positionLocked: true,
            },
          }),
        ]);
        await transaction.teacherRouteChange.create({
          data: createTeacherRouteChange({
            studentId,
            authorId: teacherId,
            routeId: route.id,
            moduleId: module.id,
            moduleKey,
            action: dto.action,
            reason: dto.reason,
            before: {
              module: { key: module.moduleKey, position: module.position },
              target: { key: target.moduleKey, position: target.position },
            },
            after: {
              module: { key: module.moduleKey, position: target.position },
              target: { key: target.moduleKey, position: module.position },
            },
          }),
        });
      });

      return this.store.getById(route.id, studentId);
    }

    const changes = this.getModuleChanges(dto);
    const after = await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.learningRouteModule.update({
        where: { id: module.id },
        data: changes,
      });
      await transaction.teacherRouteChange.create({
        data: createTeacherRouteChange({
          studentId,
          authorId: teacherId,
          routeId: route.id,
          moduleId: module.id,
          moduleKey,
          action: dto.action,
          reason: dto.reason,
          before: module,
          after: updated,
        }),
      });
      return updated;
    });

    return {
      module: after,
      route: await this.store.getById(route.id, studentId),
    };
  }

  async addCustomModule(
    teacherId: string,
    studentId: string,
    dto: CreateTeacherRouteModuleDto,
  ) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    const route = await this.getActiveRoute(studentId);
    const skillCodes = dto.skillCodes ?? [];
    const skills = await this.prisma.knowledgeNode.findMany({
      where: {
        knowledgeMapId: route.knowledgeMapId,
        code: { in: skillCodes },
      },
      select: { id: true, code: true },
    });
    if (skills.length !== skillCodes.length) {
      throw new BadRequestException(
        'Один или несколько навыков не найдены в текущей карте',
      );
    }

    const moduleKey = `CUSTOM:${randomUUID().replaceAll('-', '').toUpperCase()}`;
    const position =
      Math.max(0, ...route.modules.map((module) => module.position)) + 1;
    const module = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.learningRouteModule.create({
        data: {
          routeId: route.id,
          moduleKey,
          title: dto.title,
          type: LearningRouteModuleType.TEACHER_ASSIGNED,
          status: LearningRouteModuleStatus.AVAILABLE,
          position,
          priority: 1,
          estimatedMinutes: dto.estimatedMinutes,
          blockedBySkillCodes: [],
          recommendedBeforeCodes: [],
          teacherAssignmentIds: [],
          factorBreakdown: {},
          completionCriteria: {
            description:
              'Критерий завершения определяет преподаватель после практики или контроля',
          },
          reasons: [dto.reason],
          isPinned: true,
          isCustom: true,
          positionLocked: true,
          teacherComment: dto.comment ?? dto.description ?? null,
          skills: {
            create: skills.map((skill, index) => ({
              skillId: skill.id,
              position: index + 1,
              priority: 1,
              plannedMinutes: Math.max(
                15,
                Math.round(dto.estimatedMinutes / Math.max(1, skills.length)),
              ),
              targetConfidence: 0.55,
              reason: dto.reason,
            })),
          },
        },
      });

      await transaction.learningRoute.update({
        where: { id: route.id },
        data: {
          totalPlannedMinutes: { increment: dto.estimatedMinutes },
        },
      });
      await transaction.teacherRouteChange.create({
        data: createTeacherRouteChange({
          studentId,
          authorId: teacherId,
          routeId: route.id,
          moduleId: created.id,
          moduleKey,
          action: TeacherRouteActionType.ADD_CUSTOM_MODULE,
          reason: dto.reason,
          after: {
            title: dto.title,
            description: dto.description,
            estimatedMinutes: dto.estimatedMinutes,
            skillCodes,
          },
        }),
      });

      return created;
    });

    return {
      module,
      route: await this.store.getById(route.id, studentId),
    };
  }

  async updateWeeklyLoad(
    teacherId: string,
    studentId: string,
    dto: UpdateLearningLoadDto,
  ) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    const goal = await this.prisma.studentLearningGoal.findFirst({
      where: { studentId, status: LearningGoalStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      select: { id: true, weeklyMinutes: true },
    });
    if (!goal) {
      throw new NotFoundException('Активная учебная цель не найдена');
    }
    const route = await this.prisma.learningRoute.findFirst({
      where: { studentId, status: LearningRouteStatus.ACTIVE },
      orderBy: { generatedAt: 'desc' },
      select: { id: true },
    });

    await this.prisma.$transaction(async (transaction) => {
      await transaction.studentLearningGoal.update({
        where: { id: goal.id },
        data: { weeklyMinutes: dto.weeklyMinutes },
      });
      await transaction.teacherRouteChange.create({
        data: createTeacherRouteChange({
          studentId,
          authorId: teacherId,
          routeId: route?.id,
          action: TeacherRouteActionType.UPDATE_WEEKLY_LOAD,
          reason: dto.reason,
          before: { weeklyMinutes: goal.weeklyMinutes },
          after: { weeklyMinutes: dto.weeklyMinutes },
        }),
      });
    });

    return this.routes.rebuildTeacherStudentRoute(teacherId, studentId);
  }

  async getHistory(teacherId: string, studentId: string) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    return this.prisma.teacherRouteChange.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        publicId: true,
        action: true,
        reason: true,
        before: true,
        after: true,
        moduleKey: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        skill: { select: { code: true, name: true } },
      },
    });
  }

  private async getActiveRoute(studentId: string) {
    const route = await this.prisma.learningRoute.findFirst({
      where: { studentId, status: LearningRouteStatus.ACTIVE },
      orderBy: { generatedAt: 'desc' },
      select: {
        id: true,
        knowledgeMapId: true,
        modules: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            moduleKey: true,
            position: true,
            isPinned: true,
            isHidden: true,
            autoUpdateEnabled: true,
            teacherComment: true,
          },
        },
      },
    });
    if (!route) {
      throw new NotFoundException('Активный маршрут не найден');
    }

    return route;
  }

  private getModuleChanges(
    dto: TeacherModuleActionDto,
  ): Prisma.LearningRouteModuleUpdateInput {
    switch (dto.action) {
      case TeacherRouteActionType.PIN_MODULE:
        return { isPinned: true };
      case TeacherRouteActionType.UNPIN_MODULE:
        return { isPinned: false };
      case TeacherRouteActionType.HIDE_MODULE:
        return { isHidden: true };
      case TeacherRouteActionType.SHOW_MODULE:
        return { isHidden: false };
      case TeacherRouteActionType.UPDATE_MODULE_COMMENT:
        if (dto.comment === undefined) {
          throw new BadRequestException('Передайте комментарий');
        }
        return { teacherComment: dto.comment || null };
      case TeacherRouteActionType.SET_MODULE_AUTOMATION:
        if (dto.enabled === undefined) {
          throw new BadRequestException('Укажите состояние автоматизации');
        }
        return { autoUpdateEnabled: dto.enabled };
      default:
        throw new BadRequestException('Неизвестная команда модуля');
    }
  }
}
