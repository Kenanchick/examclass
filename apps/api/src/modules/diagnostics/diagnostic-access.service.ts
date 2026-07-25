import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssessmentItemStatus,
  AssessmentPhase,
  AssessmentSessionStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class DiagnosticAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getOwnedSession(studentId: string, publicId: string) {
    const session = await this.prisma.assessmentSession.findFirst({
      where: { publicId, studentId },
      select: {
        id: true,
        publicId: true,
        knowledgeMapId: true,
        status: true,
        algorithmVersion: true,
        examDurationMinutes: true,
        adaptiveQuestionLimit: true,
        theoryQuestionLimit: true,
        startedAt: true,
        createdAt: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Диагностика не найдена');
    }

    return session;
  }

  async getOwnedItem(
    studentId: string,
    sessionPublicId: string,
    itemPublicId: string,
  ) {
    const item = await this.prisma.assessmentItem.findFirst({
      where: {
        publicId: itemPublicId,
        session: { publicId: sessionPublicId, studentId },
      },
      select: {
        id: true,
        publicId: true,
        phase: true,
        status: true,
        expectedSeconds: true,
        maxScore: true,
        targetSkill: { select: { code: true } },
        session: {
          select: {
            id: true,
            knowledgeMapId: true,
            status: true,
            startedAt: true,
            examDurationMinutes: true,
          },
        },
        task: {
          select: {
            correctAnswer: true,
            examPart: true,
            difficulty: true,
            skillLinks: {
              select: {
                role: true,
                weight: true,
                skill: { select: { code: true } },
              },
            },
          },
        },
        questionTemplate: {
          select: {
            correctAnswer: true,
            evaluationMode: true,
            difficulty: true,
          },
        },
        events: {
          where: { type: 'VIEWED' },
          orderBy: { occurredAt: 'asc' },
          take: 1,
          select: { type: true, occurredAt: true },
        },
        attempt: {
          select: {
            attachments: { select: { id: true } },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Элемент диагностики не найден');
    }

    return item;
  }

  assertItemCanBeAnswered(
    item: Awaited<ReturnType<DiagnosticAccessService['getOwnedItem']>>,
  ) {
    const expectedStatus =
      item.phase === AssessmentPhase.FULL_EXAM
        ? AssessmentSessionStatus.EXAM_IN_PROGRESS
        : AssessmentSessionStatus.CLARIFICATION;

    if (item.session.status !== expectedStatus) {
      throw new BadRequestException('Этот этап диагностики сейчас недоступен');
    }

    if (
      item.status === AssessmentItemStatus.REVIEWED ||
      item.status === AssessmentItemStatus.AWAITING_REVIEW
    ) {
      throw new BadRequestException('Ответ уже отправлен');
    }
  }
}
