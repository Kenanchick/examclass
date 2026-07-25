import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AssessmentItemKind,
  AssessmentPhase,
  AssessmentSessionStatus,
  KnowledgeMapStatus,
  Role,
  TaskStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateInitialDiagnosticDto } from './dto/create-initial-diagnostic.dto';
import {
  EXPECTED_TASK_SECONDS,
  INITIAL_DIAGNOSTIC_POLICY,
  MAX_TASK_SCORE,
} from './domain/diagnostic-policy';
import {
  selectFullExamVariant,
  type ExamTaskCandidate,
} from './domain/exam-variant-selector';
import { DiagnosticEvidenceService } from './diagnostic-evidence.service';

const createPublicId = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll('-', '').toUpperCase()}`;

const getExamNumber = (slug: string, parentSlug?: string | null) => {
  const match = (parentSlug ?? slug).match(/^ege-(\d{2})-/);
  return match ? Number(match[1]) : null;
};

@Injectable()
export class DiagnosticSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evidenceService: DiagnosticEvidenceService,
  ) {}

  async createInitialDiagnostic(
    studentId: string,
    dto: CreateInitialDiagnosticDto,
  ) {
    await this.assertStudent(studentId);
    const examDate = new Date(dto.examDate);

    if (examDate.getTime() <= Date.now()) {
      throw new BadRequestException('Дата экзамена должна быть в будущем');
    }

    if (dto.availableWeekdays.length === 0) {
      throw new BadRequestException(
        'Выберите хотя бы один доступный день недели',
      );
    }

    const knowledgeMap = await this.prisma.knowledgeMap.findFirst({
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
      throw new BadRequestException(
        'Карта знаний профильной математики не подготовлена',
      );
    }

    const selectedUnstudiedNodes = dto.selfReportedUnstudiedNodeCodes?.length
      ? await this.prisma.knowledgeNode.findMany({
          where: {
            knowledgeMapId: knowledgeMap.id,
            code: { in: dto.selfReportedUnstudiedNodeCodes },
          },
          select: { id: true, code: true },
        })
      : [];

    if (
      selectedUnstudiedNodes.length !==
      (dto.selfReportedUnstudiedNodeCodes?.length ?? 0)
    ) {
      const foundCodes = new Set(
        selectedUnstudiedNodes.map((node) => node.code),
      );
      const missingCodes = dto.selfReportedUnstudiedNodeCodes?.filter(
        (code) => !foundCodes.has(code),
      );

      throw new BadRequestException(
        `Неизвестные разделы карты: ${missingCodes?.join(', ')}`,
      );
    }

    const taskRows = await this.prisma.task.findMany({
      where: {
        status: TaskStatus.PUBLISHED,
        skillLinks: {
          some: {
            skill: { knowledgeMapId: knowledgeMap.id },
          },
        },
      },
      select: {
        id: true,
        publicId: true,
        difficulty: true,
        topic: {
          select: {
            slug: true,
            parent: { select: { slug: true } },
          },
        },
      },
    });
    const candidates = taskRows.flatMap<ExamTaskCandidate>((task) => {
      const examNumber = getExamNumber(
        task.topic.slug,
        task.topic.parent?.slug,
      );

      return examNumber
        ? [
            {
              id: task.id,
              publicId: task.publicId,
              examNumber,
              difficulty: task.difficulty,
            },
          ]
        : [];
    });
    const sessionPublicId = createPublicId('DG');
    let selectedVariant: ExamTaskCandidate[];

    try {
      selectedVariant = selectFullExamVariant(candidates, sessionPublicId);
    } catch (error) {
      throw new BadRequestException(
        `${(error as Error).message}. Запустите разметку диагностического банка`,
      );
    }

    const created = await this.prisma.$transaction(async (transaction) => {
      const goal = await transaction.studentLearningGoal.create({
        data: {
          publicId: createPublicId('GOAL'),
          studentId,
          knowledgeMapId: knowledgeMap.id,
          targetScore: dto.targetScore,
          examDate,
          weeklyMinutes: dto.weeklyMinutes,
          preferredSessionMinutes: dto.preferredSessionMinutes,
          availableWeekdays: dto.availableWeekdays,
          lastMockScore: dto.lastMockScore,
          unstudiedNodes: {
            create: selectedUnstudiedNodes.map((node) => ({
              nodeId: node.id,
            })),
          },
        },
        select: { id: true, publicId: true },
      });
      const session = await transaction.assessmentSession.create({
        data: {
          publicId: sessionPublicId,
          studentId,
          goalId: goal.id,
          knowledgeMapId: knowledgeMap.id,
          algorithmVersion: INITIAL_DIAGNOSTIC_POLICY.algorithmVersion,
          examDurationMinutes: INITIAL_DIAGNOSTIC_POLICY.examDurationMinutes,
          adaptiveQuestionLimit:
            INITIAL_DIAGNOSTIC_POLICY.adaptiveTargetQuestions,
          theoryQuestionLimit: INITIAL_DIAGNOSTIC_POLICY.theoryMaximumQuestions,
          items: {
            create: selectedVariant.map((task) => ({
              publicId: createPublicId('DI'),
              taskId: task.id,
              phase: AssessmentPhase.FULL_EXAM,
              kind: AssessmentItemKind.TASK,
              examNumber: task.examNumber,
              sortOrder: task.examNumber,
              expectedSeconds: EXPECTED_TASK_SECONDS[task.examNumber],
              maxScore: MAX_TASK_SCORE[task.examNumber],
            })),
          },
        },
        select: {
          id: true,
          publicId: true,
          status: true,
          examDurationMinutes: true,
        },
      });

      return { goal, session };
    });

    await this.evidenceService.addSelfReportedEvidence({
      studentId,
      sessionId: created.session.id,
      goalId: created.goal.id,
      knowledgeMapId: knowledgeMap.id,
      selectedNodeIds: selectedUnstudiedNodes.map((node) => node.id),
    });

    return {
      sessionPublicId: created.session.publicId,
      goalPublicId: created.goal.publicId,
      status: created.session.status,
      examDurationMinutes: created.session.examDurationMinutes,
      examTaskCount: selectedVariant.length,
      knowledgeMapVersion: knowledgeMap.version,
    };
  }

  async startExam(studentId: string, publicId: string) {
    const session = await this.getOwnedSessionRecord(studentId, publicId);

    if (session.status === AssessmentSessionStatus.EXAM_IN_PROGRESS) {
      return this.getSession(studentId, publicId);
    }

    if (session.status !== AssessmentSessionStatus.EXAM_READY) {
      throw new BadRequestException(
        'Полный вариант уже был начат или завершён',
      );
    }

    await this.prisma.assessmentSession.update({
      where: { id: session.id },
      data: {
        status: AssessmentSessionStatus.EXAM_IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    return this.getSession(studentId, publicId);
  }

  async getSession(studentId: string, publicId: string) {
    const session = await this.prisma.assessmentSession.findFirst({
      where: { publicId, studentId },
      select: {
        publicId: true,
        status: true,
        currentPhase: true,
        algorithmVersion: true,
        examDurationMinutes: true,
        adaptiveQuestionLimit: true,
        theoryQuestionLimit: true,
        startedAt: true,
        examSubmittedAt: true,
        completedAt: true,
        goal: {
          select: {
            publicId: true,
            targetScore: true,
            examDate: true,
            weeklyMinutes: true,
            preferredSessionMinutes: true,
            availableWeekdays: true,
            lastMockScore: true,
          },
        },
        items: {
          orderBy: [{ phase: 'asc' }, { sortOrder: 'asc' }],
          select: {
            publicId: true,
            phase: true,
            kind: true,
            examNumber: true,
            sortOrder: true,
            status: true,
            promptSnapshot: true,
            expectedSeconds: true,
            maxScore: true,
            task: {
              select: {
                publicId: true,
                statement: true,
                examPart: true,
                difficulty: true,
                source: true,
              },
            },
            questionTemplate: {
              select: {
                code: true,
                kind: true,
                answerOptions: true,
              },
            },
            attempt: {
              select: {
                publicId: true,
                rawAnswer: true,
                solutionText: true,
                confidence: true,
                declaredUnstudied: true,
                outcome: true,
                awardedScore: true,
                activeSeconds: true,
                elapsedSeconds: true,
                awaySeconds: true,
                answerChanges: true,
                submittedAt: true,
                reviewedAt: true,
                reviewComment: true,
                attachments: {
                  select: {
                    publicId: true,
                    originalName: true,
                    mimeType: true,
                    sizeBytes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Диагностика не найдена');
    }

    return session.status === AssessmentSessionStatus.EXAM_READY
      ? { ...session, items: [] }
      : session;
  }

  private async getOwnedSessionRecord(studentId: string, publicId: string) {
    const session = await this.prisma.assessmentSession.findFirst({
      where: { publicId, studentId },
      select: { id: true, status: true },
    });

    if (!session) {
      throw new NotFoundException('Диагностика не найдена');
    }

    return session;
  }

  private async assertStudent(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.STUDENT) {
      throw new ForbiddenException('Диагностика доступна ученику');
    }
  }
}
