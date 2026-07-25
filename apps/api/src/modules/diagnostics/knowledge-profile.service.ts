import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  KnowledgeMapStatus,
  Role,
  StudentSkillStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { DiagnosticEvidenceService } from './diagnostic-evidence.service';
import { KNOWLEDGE_PROFILE_FORMULA_VERSION } from './domain/profile-factors';

const statusLabels: Partial<Record<StudentSkillStatus, string>> = {
  UNSTUDIED: 'Ещё не изучалось',
  INSUFFICIENT_DATA: 'Недостаточно данных',
  WEAK: 'Слабый навык',
  LEARNING: 'Изучается',
  NEEDS_REINFORCEMENT: 'Требует закрепления',
  MASTERED: 'Освоено',
  NEEDS_REVIEW: 'Требует повторения',
  TEACHER_CONFIRMED: 'Подтверждено преподавателем',
};

const getSpeedLabel = (speed: number | null) => {
  if (speed === null) {
    return 'Недостаточно данных';
  }

  if (speed >= 0.8) {
    return 'Быстро';
  }

  if (speed >= 0.55) {
    return 'В рабочем темпе';
  }

  return 'Медленно';
};

const getStabilityLabel = (stability: number | null) => {
  if (stability === null) {
    return 'Недостаточно данных';
  }

  if (stability >= 0.75) {
    return 'Стабильно';
  }

  if (stability >= 0.45) {
    return 'Нестабильно';
  }

  return 'Противоречивые результаты';
};

@Injectable()
export class KnowledgeProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evidenceService: DiagnosticEvidenceService,
  ) {}

  async getOwnProfile(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true },
    });

    if (user?.role !== Role.STUDENT) {
      throw new ForbiddenException('Профиль знаний доступен ученику');
    }

    return this.getProfile(studentId);
  }

  async getTeacherStudentProfile(teacherId: string, studentId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { role: true },
    });

    if (teacher?.role !== Role.TEACHER && teacher?.role !== Role.ADMIN) {
      throw new ForbiddenException('Доступно только преподавателю');
    }

    if (teacher.role === Role.TEACHER) {
      const membership = await this.prisma.classroomMember.findFirst({
        where: {
          userId: studentId,
          classroom: { ownerId: teacherId },
        },
        select: { classroomId: true },
      });

      if (!membership) {
        throw new ForbiddenException(
          'Можно просматривать профиль только своего ученика',
        );
      }
    }

    return this.getProfile(studentId);
  }

  private async getProfile(studentId: string) {
    const knowledgeMap = await this.prisma.knowledgeMap.findFirst({
      where: {
        subject: { code: 'profile-math-ege' },
        status: {
          in: [KnowledgeMapStatus.PUBLISHED, KnowledgeMapStatus.IN_REVIEW],
        },
      },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        title: true,
        subject: { select: { name: true } },
      },
    });

    if (!knowledgeMap) {
      throw new NotFoundException('Карта знаний не найдена');
    }

    const staleState = await this.prisma.studentSkillState.findFirst({
      where: {
        studentId,
        knowledgeMapId: knowledgeMap.id,
        formulaVersion: { not: KNOWLEDGE_PROFILE_FORMULA_VERSION },
      },
      select: { initializedBySessionId: true },
    });

    if (staleState?.initializedBySessionId) {
      await this.evidenceService.recalculateProfile(
        studentId,
        knowledgeMap.id,
        staleState.initializedBySessionId,
      );
    }

    const [student, states] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, avatarUrl: true, role: true },
      }),
      this.prisma.studentSkillState.findMany({
        where: { studentId, knowledgeMapId: knowledgeMap.id },
        orderBy: [
          { skill: { parent: { parent: { sortOrder: 'asc' } } } },
          { skill: { parent: { sortOrder: 'asc' } } },
          { skill: { sortOrder: 'asc' } },
        ],
        select: {
          mastery: true,
          formulaVersion: true,
          confidence: true,
          speed: true,
          stability: true,
          evidenceWeight: true,
          evidenceCount: true,
          distinctEvidenceCount: true,
          confirmingAttempts: true,
          contradictingAttempts: true,
          status: true,
          lastEvidenceAt: true,
          lastVerifiedAt: true,
          reviewDueAt: true,
          needsReview: true,
          teacherConfirmedAt: true,
          sourceSummary: true,
          explanation: true,
          updatedAt: true,
          skill: {
            select: {
              code: true,
              name: true,
              importance: true,
              difficulty: true,
              isFoundational: true,
              parent: {
                select: {
                  code: true,
                  name: true,
                  parent: { select: { code: true, name: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    if (!student || student.role !== Role.STUDENT) {
      throw new NotFoundException('Ученик не найден');
    }

    const statusSummary = states.reduce<Record<string, number>>(
      (summary, state) => {
        summary[state.status] = (summary[state.status] ?? 0) + 1;
        return summary;
      },
      {},
    );

    return {
      student,
      knowledgeMap: {
        version: knowledgeMap.version,
        title: knowledgeMap.title,
        subject: knowledgeMap.subject.name,
      },
      ready: states.length > 0,
      calculatedAt:
        states
          .map((state) => state.updatedAt)
          .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
      statusSummary,
      skills: states.map((state) => ({
        ...state,
        statusLabel: statusLabels[state.status] ?? state.status,
        speedLabel: getSpeedLabel(state.speed),
        stabilityLabel: getStabilityLabel(state.stability),
      })),
    };
  }
}
