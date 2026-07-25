import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AssessmentAttemptOutcome,
  AssessmentItemStatus,
  AssessmentPhase,
  ExamPart,
  Prisma,
  QuestionEvaluationMode,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { DiagnosticAccessService } from './diagnostic-access.service';
import { DiagnosticEvidenceService } from './diagnostic-evidence.service';
import { RecordBehaviorEventDto } from './dto/record-behavior-event.dto';
import {
  AttemptSubmissionType,
  SubmitAssessmentAttemptDto,
} from './dto/submit-assessment-attempt.dto';
import { gradeExactAnswer } from './domain/answer-grading';
import {
  analyzeAttempt,
  type AnalysisEvidenceSource,
} from './domain/diagnostic-analysis';

const createPublicId = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll('-', '').toUpperCase()}`;

@Injectable()
export class DiagnosticAttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DiagnosticAccessService,
    private readonly evidenceService: DiagnosticEvidenceService,
  ) {}

  async recordBehaviorEvent(
    studentId: string,
    sessionPublicId: string,
    itemPublicId: string | null,
    dto: RecordBehaviorEventDto,
  ) {
    const session = await this.access.getOwnedSession(
      studentId,
      sessionPublicId,
    );
    const occurredAt = new Date(dto.occurredAt);
    const now = Date.now();

    if (
      occurredAt.getTime() < session.createdAt.getTime() - 5 * 60_000 ||
      occurredAt.getTime() > now + 5 * 60_000
    ) {
      throw new BadRequestException('Некорректное время события');
    }

    let itemId: string | null = null;

    if (itemPublicId) {
      const item = await this.prisma.assessmentItem.findFirst({
        where: { publicId: itemPublicId, sessionId: session.id },
        select: { id: true },
      });

      if (!item) {
        throw new NotFoundException('Элемент диагностики не найден');
      }

      itemId = item.id;
    }

    if (dto.payload && JSON.stringify(dto.payload).length > 10_000) {
      throw new BadRequestException('Данные события слишком велики');
    }

    await this.prisma.assessmentBehaviorEvent.create({
      data: {
        sessionId: session.id,
        itemId,
        type: dto.type,
        occurredAt,
        payload: dto.payload
          ? (dto.payload as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return { recorded: true };
  }

  async submitAttempt(
    studentId: string,
    sessionPublicId: string,
    itemPublicId: string,
    dto: SubmitAssessmentAttemptDto,
  ) {
    const item = await this.access.getOwnedItem(
      studentId,
      sessionPublicId,
      itemPublicId,
    );

    this.access.assertItemCanBeAnswered(item);

    if (dto.activeSeconds > dto.elapsedSeconds) {
      throw new BadRequestException('Активное время не может превышать общее');
    }

    if (dto.awaySeconds > dto.elapsedSeconds) {
      throw new BadRequestException(
        'Время вне вкладки не может превышать общее',
      );
    }

    if (
      dto.submissionType === AttemptSubmissionType.ANSWER &&
      !dto.rawAnswer &&
      !dto.solutionText &&
      item.attempt?.attachments.length === 0
    ) {
      throw new BadRequestException('Введите ответ или приложите решение');
    }

    const isManual =
      item.task?.examPart === ExamPart.SECOND ||
      item.questionTemplate?.evaluationMode === QuestionEvaluationMode.MANUAL;
    const outcome = this.getOutcome(dto, item, isManual);
    const score =
      outcome === AssessmentAttemptOutcome.CORRECT
        ? 1
        : outcome === AssessmentAttemptOutcome.INCORRECT
          ? 0
          : null;
    const submittedAt = new Date();
    const firstViewedAt =
      item.events.find((event) => event.type === 'VIEWED')?.occurredAt ?? null;
    const attempt = await this.prisma.assessmentAttempt.upsert({
      where: { itemId: item.id },
      update: {
        rawAnswer: dto.rawAnswer,
        solutionText: dto.solutionText,
        confidence: dto.confidence,
        independence: dto.independence,
        declaredUnstudied:
          dto.submissionType === AttemptSubmissionType.UNSTUDIED,
        outcome,
        autoScore: score,
        awardedScore: score === null ? null : score * item.maxScore,
        activeSeconds: dto.activeSeconds,
        elapsedSeconds: dto.elapsedSeconds,
        awaySeconds: dto.awaySeconds,
        answerChanges: dto.answerChanges,
        firstViewedAt,
        submittedAt,
      },
      create: {
        publicId: createPublicId('DA'),
        itemId: item.id,
        rawAnswer: dto.rawAnswer,
        solutionText: dto.solutionText,
        confidence: dto.confidence,
        independence: dto.independence,
        declaredUnstudied:
          dto.submissionType === AttemptSubmissionType.UNSTUDIED,
        outcome,
        autoScore: score,
        awardedScore: score === null ? null : score * item.maxScore,
        activeSeconds: dto.activeSeconds,
        elapsedSeconds: dto.elapsedSeconds,
        awaySeconds: dto.awaySeconds,
        answerChanges: dto.answerChanges,
        firstViewedAt,
        submittedAt,
      },
      select: {
        id: true,
        publicId: true,
        outcome: true,
        autoScore: true,
        awardedScore: true,
      },
    });

    await this.prisma.assessmentItem.update({
      where: { id: item.id },
      data: {
        status:
          outcome === AssessmentAttemptOutcome.AWAITING_REVIEW
            ? AssessmentItemStatus.AWAITING_REVIEW
            : outcome === AssessmentAttemptOutcome.SKIPPED ||
                outcome === AssessmentAttemptOutcome.UNSTUDIED
              ? AssessmentItemStatus.SKIPPED
              : AssessmentItemStatus.ANSWERED,
      },
    });

    if (outcome !== AssessmentAttemptOutcome.AWAITING_REVIEW) {
      await this.analyzeAndPersist({
        studentId,
        item,
        outcome,
        activeSeconds: dto.activeSeconds,
        confidence: dto.confidence,
        independence: dto.independence,
        answerChanges: dto.answerChanges,
        hasVisibleWork:
          dto.hasVisibleWork ||
          Boolean(dto.solutionText) ||
          (item.attempt?.attachments.length ?? 0) > 0,
        occurredAt: submittedAt,
      });
    }

    return attempt;
  }

  private getOutcome(
    dto: SubmitAssessmentAttemptDto,
    item: Awaited<ReturnType<DiagnosticAccessService['getOwnedItem']>>,
    isManual: boolean,
  ) {
    if (dto.submissionType === AttemptSubmissionType.UNSTUDIED) {
      return AssessmentAttemptOutcome.UNSTUDIED;
    }

    if (dto.submissionType === AttemptSubmissionType.SKIP) {
      return AssessmentAttemptOutcome.SKIPPED;
    }

    if (isManual) {
      return AssessmentAttemptOutcome.AWAITING_REVIEW;
    }

    const correctAnswer =
      item.questionTemplate?.correctAnswer ?? item.task?.correctAnswer;

    return gradeExactAnswer(dto.rawAnswer, correctAnswer)
      ? AssessmentAttemptOutcome.CORRECT
      : AssessmentAttemptOutcome.INCORRECT;
  }

  private async analyzeAndPersist({
    studentId,
    item,
    outcome,
    activeSeconds,
    confidence,
    independence,
    answerChanges,
    hasVisibleWork,
    occurredAt,
  }: {
    studentId: string;
    item: Awaited<ReturnType<DiagnosticAccessService['getOwnedItem']>>;
    outcome: AssessmentAttemptOutcome;
    activeSeconds: number;
    confidence?: number;
    independence?: Parameters<typeof analyzeAttempt>[0]['independence'];
    answerChanges: number;
    hasVisibleWork: boolean;
    occurredAt: Date;
  }) {
    const source: AnalysisEvidenceSource =
      item.phase === AssessmentPhase.FULL_EXAM
        ? 'FULL_EXAM'
        : item.phase === AssessmentPhase.THEORY
          ? 'THEORY_QUESTION'
          : 'ADAPTIVE_TASK';
    const skillLinks = item.task
      ? item.task.skillLinks.map((link) => ({
          skillCode: link.skill.code,
          role: link.role,
          weight: link.weight,
        }))
      : item.targetSkill
        ? [
            {
              skillCode: item.targetSkill.code,
              role: 'PRIMARY' as const,
              weight: 1,
            },
          ]
        : [];
    const remainingSessionSeconds =
      item.phase === AssessmentPhase.FULL_EXAM
        ? item.session.startedAt
          ? Math.max(
              0,
              item.session.examDurationMinutes * 60 -
                Math.floor(
                  (occurredAt.getTime() - item.session.startedAt.getTime()) /
                    1_000,
                ),
            )
          : item.session.examDurationMinutes * 60
        : (item.expectedSeconds ?? 180);

    await this.evidenceService.persistItemAnalysis({
      studentId,
      sessionId: item.session.id,
      itemId: item.id,
      occurredAt,
      analysis: analyzeAttempt({
        itemKey: item.publicId,
        source,
        outcome,
        activeSeconds,
        expectedSeconds: item.expectedSeconds ?? 180,
        remainingSessionSeconds,
        confidence,
        difficulty:
          item.task?.difficulty ?? item.questionTemplate?.difficulty ?? 2,
        independence,
        answerChanges,
        hasVisibleWork,
        skillLinks,
      }),
    });
  }
}
