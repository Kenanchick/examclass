import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LearningGoalStatus,
  LearningRouteStatus,
  StudentSkillStatus,
  TeacherInstructionStatus,
  TeacherRouteActionType,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TeacherSkillActionDto } from './dto/teacher-skill-action.dto';
import { LearningRouteAccessService } from './learning-route-access.service';
import { LearningRouteService } from './learning-route.service';
import { createTeacherRouteChange } from './teacher-route-change';

type SkillControlChanges = {
  instructionStatus?: TeacherInstructionStatus;
  manualStatus?: StudentSkillStatus | null;
  autoStatusEnabled?: boolean;
  systemConclusionConfirmedAt?: Date;
  reviewScheduledAt?: Date;
  controlScheduledAt?: Date;
  comment?: string | null;
};

const routeChangingActions = new Set<TeacherRouteActionType>([
  TeacherRouteActionType.CHANGE_SKILL_STATUS,
  TeacherRouteActionType.CLEAR_SKILL_STATUS,
  TeacherRouteActionType.SCHEDULE_CONTROL,
  TeacherRouteActionType.SCHEDULE_REVIEW,
  TeacherRouteActionType.SET_SKILL_AUTOMATION,
]);

@Injectable()
export class TeacherRouteSkillService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: LearningRouteAccessService,
    private readonly routes: LearningRouteService,
  ) {}

  async applyAction(
    teacherId: string,
    studentId: string,
    skillCode: string,
    dto: TeacherSkillActionDto,
  ) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    const context = await this.getSkillContext(studentId, skillCode);
    const changes = this.getChanges(dto, context.systemStatus);
    const before = await this.prisma.teacherSkillControl.findUnique({
      where: {
        studentId_skillId: { studentId, skillId: context.skillId },
      },
    });

    const after = await this.prisma.$transaction(async (transaction) => {
      const control = await transaction.teacherSkillControl.upsert({
        where: {
          studentId_skillId: { studentId, skillId: context.skillId },
        },
        update: { ...changes, lastAuthorId: teacherId },
        create: {
          studentId,
          skillId: context.skillId,
          lastAuthorId: teacherId,
          ...changes,
        },
      });

      await transaction.teacherRouteChange.create({
        data: createTeacherRouteChange({
          studentId,
          authorId: teacherId,
          routeId: context.routeId,
          skillId: context.skillId,
          action: dto.action,
          reason: dto.reason,
          before,
          after: control,
        }),
      });

      return control;
    });

    if (routeChangingActions.has(dto.action)) {
      const route = await this.routes.rebuildTeacherStudentRoute(
        teacherId,
        studentId,
      );
      return { control: after, route };
    }

    return { control: after };
  }

  async getDetail(teacherId: string, studentId: string, skillCode: string) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    const goal = await this.prisma.studentLearningGoal.findFirst({
      where: { studentId, status: LearningGoalStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      select: { knowledgeMapId: true },
    });
    if (!goal) {
      throw new NotFoundException('Активная учебная цель не найдена');
    }

    const skill = await this.prisma.knowledgeNode.findUnique({
      where: {
        knowledgeMapId_code: {
          knowledgeMapId: goal.knowledgeMapId,
          code: skillCode,
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isFoundational: true,
        importance: true,
        difficulty: true,
        estimatedMinutes: true,
        parent: {
          select: {
            code: true,
            name: true,
            parent: { select: { code: true, name: true } },
          },
        },
        skillStates: {
          where: { studentId },
          take: 1,
        },
        teacherSkillControls: {
          where: { studentId },
          take: 1,
          include: { lastAuthor: { select: { id: true, name: true } } },
        },
        prerequisiteLinks: {
          orderBy: { prerequisite: { sortOrder: 'asc' } },
          select: {
            type: true,
            rationale: true,
            prerequisite: {
              select: {
                code: true,
                name: true,
                skillStates: { where: { studentId }, take: 1 },
                teacherSkillControls: { where: { studentId }, take: 1 },
              },
            },
          },
        },
        unlocksSkills: {
          orderBy: { skill: { sortOrder: 'asc' } },
          take: 30,
          select: {
            type: true,
            skill: {
              select: {
                code: true,
                name: true,
                skillStates: { where: { studentId }, take: 1 },
              },
            },
          },
        },
        skillEvidence: {
          where: { studentId },
          orderBy: { occurredAt: 'desc' },
          take: 30,
          select: {
            id: true,
            source: true,
            score: true,
            weight: true,
            difficulty: true,
            skillRole: true,
            independence: true,
            activeSeconds: true,
            expectedSeconds: true,
            selfConfidence: true,
            errorType: true,
            teacherConfirmed: true,
            reason: true,
            occurredAt: true,
            assessmentItem: {
              select: {
                publicId: true,
                promptSnapshot: true,
                maxScore: true,
                task: {
                  select: { publicId: true, statement: true },
                },
                attempt: {
                  select: {
                    outcome: true,
                    awardedScore: true,
                    activeSeconds: true,
                    confidence: true,
                    reviewedAt: true,
                    reviewComment: true,
                  },
                },
              },
            },
          },
        },
        skillStateRevisions: {
          where: { studentId },
          orderBy: { calculatedAt: 'desc' },
          take: 20,
          select: {
            mastery: true,
            confidence: true,
            speed: true,
            stability: true,
            status: true,
            evidenceWeight: true,
            evidenceCount: true,
            calculatedAt: true,
          },
        },
        teacherRouteChanges: {
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: 30,
          select: {
            publicId: true,
            action: true,
            reason: true,
            before: true,
            after: true,
            createdAt: true,
            author: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    const systemState = skill.skillStates[0] ?? null;
    const teacherControl = skill.teacherSkillControls[0] ?? null;
    const effectiveStatus =
      teacherControl?.autoStatusEnabled === false && teacherControl.manualStatus
        ? teacherControl.manualStatus
        : (systemState?.status ?? StudentSkillStatus.INSUFFICIENT_DATA);

    return {
      ...skill,
      systemState,
      effectiveStatus,
      teacherControl,
      skillStates: undefined,
      teacherSkillControls: undefined,
    };
  }

  private async getSkillContext(studentId: string, skillCode: string) {
    const goal = await this.prisma.studentLearningGoal.findFirst({
      where: { studentId, status: LearningGoalStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      select: { knowledgeMapId: true },
    });
    if (!goal) {
      throw new NotFoundException('Активная учебная цель не найдена');
    }

    const [skill, route] = await Promise.all([
      this.prisma.knowledgeNode.findUnique({
        where: {
          knowledgeMapId_code: {
            knowledgeMapId: goal.knowledgeMapId,
            code: skillCode,
          },
        },
        select: {
          id: true,
          skillStates: {
            where: { studentId },
            select: { status: true },
            take: 1,
          },
        },
      }),
      this.prisma.learningRoute.findFirst({
        where: { studentId, status: LearningRouteStatus.ACTIVE },
        orderBy: { generatedAt: 'desc' },
        select: { id: true },
      }),
    ]);
    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    return {
      skillId: skill.id,
      routeId: route?.id ?? null,
      systemStatus:
        skill.skillStates[0]?.status ?? StudentSkillStatus.INSUFFICIENT_DATA,
    };
  }

  private getChanges(
    dto: TeacherSkillActionDto,
    systemStatus: StudentSkillStatus,
  ): SkillControlChanges {
    const scheduledFor = dto.scheduledFor
      ? new Date(dto.scheduledFor)
      : new Date();

    switch (dto.action) {
      case TeacherRouteActionType.CONFIRM_SYSTEM_CONCLUSION:
        return { systemConclusionConfirmedAt: new Date() };
      case TeacherRouteActionType.CHANGE_SKILL_STATUS:
        if (!dto.status) {
          throw new BadRequestException('Укажите новый статус навыка');
        }
        return {
          manualStatus: dto.status,
          autoStatusEnabled: false,
        };
      case TeacherRouteActionType.CLEAR_SKILL_STATUS:
        return { manualStatus: null, autoStatusEnabled: true };
      case TeacherRouteActionType.MARK_TAUGHT:
        return { instructionStatus: TeacherInstructionStatus.TAUGHT };
      case TeacherRouteActionType.MARK_REINFORCED:
        return { instructionStatus: TeacherInstructionStatus.REINFORCED };
      case TeacherRouteActionType.SCHEDULE_CONTROL:
        return { controlScheduledAt: scheduledFor };
      case TeacherRouteActionType.SCHEDULE_REVIEW:
        return { reviewScheduledAt: scheduledFor };
      case TeacherRouteActionType.UPDATE_SKILL_COMMENT:
        if (dto.comment === undefined) {
          throw new BadRequestException('Передайте комментарий');
        }
        return { comment: dto.comment || null };
      case TeacherRouteActionType.SET_SKILL_AUTOMATION:
        if (dto.enabled === undefined) {
          throw new BadRequestException('Укажите состояние автоматизации');
        }
        return {
          autoStatusEnabled: dto.enabled,
          manualStatus: dto.enabled ? null : systemStatus,
        };
      default:
        throw new BadRequestException('Эта команда не относится к навыку');
    }
  }
}
