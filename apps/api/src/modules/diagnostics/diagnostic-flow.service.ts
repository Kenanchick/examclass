import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AssessmentAttemptOutcome,
  AssessmentItemStatus,
  AssessmentPhase,
  AssessmentSessionStatus,
  DiagnosticHypothesisStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { DiagnosticAccessService } from './diagnostic-access.service';
import { DiagnosticEvidenceService } from './diagnostic-evidence.service';
import { selectNextAdaptiveCandidate } from './domain/adaptive-selector';
import { analyzeAttempt } from './domain/diagnostic-analysis';
import { INITIAL_DIAGNOSTIC_POLICY } from './domain/diagnostic-policy';

const createPublicId = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll('-', '').toUpperCase()}`;

@Injectable()
export class DiagnosticFlowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DiagnosticAccessService,
    private readonly evidenceService: DiagnosticEvidenceService,
  ) {}

  async finishFullExam(studentId: string, sessionPublicId: string) {
    const session = await this.access.getOwnedSession(
      studentId,
      sessionPublicId,
    );

    if (session.status !== AssessmentSessionStatus.EXAM_IN_PROGRESS) {
      throw new BadRequestException('Полный вариант сейчас не решается');
    }

    const pendingItems = await this.prisma.assessmentItem.findMany({
      where: {
        sessionId: session.id,
        phase: AssessmentPhase.FULL_EXAM,
        OR: [{ attempt: null }, { attempt: { submittedAt: null } }],
      },
      select: {
        id: true,
        publicId: true,
        expectedSeconds: true,
        task: {
          select: {
            skillLinks: {
              where: {
                skill: { knowledgeMapId: session.knowledgeMapId },
              },
              select: {
                role: true,
                weight: true,
                skill: { select: { code: true } },
              },
            },
          },
        },
      },
    });
    const submittedAt = new Date();

    for (const item of pendingItems) {
      await this.prisma.assessmentAttempt.upsert({
        where: { itemId: item.id },
        update: {
          outcome: AssessmentAttemptOutcome.NOT_REACHED,
          submittedAt,
        },
        create: {
          publicId: createPublicId('DA'),
          itemId: item.id,
          outcome: AssessmentAttemptOutcome.NOT_REACHED,
          submittedAt,
        },
      });
      await this.prisma.assessmentItem.update({
        where: { id: item.id },
        data: { status: AssessmentItemStatus.SKIPPED },
      });
      await this.evidenceService.persistItemAnalysis({
        studentId,
        sessionId: session.id,
        itemId: item.id,
        occurredAt: submittedAt,
        analysis: analyzeAttempt({
          itemKey: item.publicId,
          source: 'FULL_EXAM',
          outcome: 'NOT_REACHED',
          activeSeconds: 0,
          expectedSeconds: item.expectedSeconds ?? 300,
          remainingSessionSeconds: 0,
          skillLinks:
            item.task?.skillLinks.map((link) => ({
              skillCode: link.skill.code,
              role: link.role,
              weight: link.weight,
            })) ?? [],
        }),
      });
    }

    await this.prisma.assessmentSession.update({
      where: { id: session.id },
      data: {
        status: AssessmentSessionStatus.CLARIFICATION,
        currentPhase: AssessmentPhase.ADAPTIVE,
        examSubmittedAt: submittedAt,
      },
    });

    return this.createNextAdaptiveItem(studentId, sessionPublicId);
  }

  async createNextAdaptiveItem(studentId: string, sessionPublicId: string) {
    const session = await this.access.getOwnedSession(
      studentId,
      sessionPublicId,
    );

    if (session.status !== AssessmentSessionStatus.CLARIFICATION) {
      throw new BadRequestException('Уточняющий блок сейчас недоступен');
    }

    const [hypotheses, templates, existingItems] = await Promise.all([
      this.prisma.diagnosticHypothesis.findMany({
        where: {
          sessionId: session.id,
          status: DiagnosticHypothesisStatus.OPEN,
          skillId: { not: null },
        },
        orderBy: { priority: 'desc' },
        select: {
          key: true,
          type: true,
          confidence: true,
          priority: true,
          skill: { select: { code: true } },
        },
      }),
      this.prisma.diagnosticQuestionTemplate.findMany({
        where: {
          knowledgeMapId: session.knowledgeMapId,
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          kind: true,
          hypothesisType: true,
          estimatedSeconds: true,
          difficulty: true,
          prompt: true,
          targetSkill: {
            select: { id: true, code: true, importance: true },
          },
        },
      }),
      this.prisma.assessmentItem.findMany({
        where: {
          sessionId: session.id,
          phase: { in: [AssessmentPhase.ADAPTIVE, AssessmentPhase.THEORY] },
        },
        select: {
          publicId: true,
          phase: true,
          kind: true,
          promptSnapshot: true,
          expectedSeconds: true,
          targetSkill: { select: { code: true } },
          questionTemplate: {
            select: {
              id: true,
              code: true,
              kind: true,
              answerOptions: true,
            },
          },
          attempt: { select: { id: true } },
        },
      }),
    ]);
    const pendingItem = existingItems.find((item) => !item.attempt);

    if (pendingItem) {
      return {
        completed: false,
        item: {
          publicId: pendingItem.publicId,
          phase: pendingItem.phase,
          kind: pendingItem.kind,
          promptSnapshot: pendingItem.promptSnapshot,
          expectedSeconds: pendingItem.expectedSeconds,
          questionTemplate: pendingItem.questionTemplate
            ? {
                code: pendingItem.questionTemplate.code,
                kind: pendingItem.questionTemplate.kind,
                answerOptions: pendingItem.questionTemplate.answerOptions,
              }
            : null,
          targetSkill: pendingItem.targetSkill,
        },
      };
    }

    const answeredItems = existingItems.filter((item) => item.attempt);
    const theoryCount = existingItems.filter(
      (item) => item.phase === AssessmentPhase.THEORY,
    ).length;
    const questionsBySkill = existingItems.reduce<Record<string, number>>(
      (result, item) => {
        if (item.targetSkill) {
          result[item.targetSkill.code] =
            (result[item.targetSkill.code] ?? 0) + 1;
        }

        return result;
      },
      {},
    );
    const highPriorityUnresolved = hypotheses.some(
      (hypothesis) => hypothesis.priority >= 0.8,
    );
    const effectiveLimit = highPriorityUnresolved
      ? INITIAL_DIAGNOSTIC_POLICY.adaptiveMaximumQuestions
      : session.adaptiveQuestionLimit;

    if (existingItems.length >= effectiveLimit) {
      return this.finishClarification(studentId, session);
    }

    const selection = selectNextAdaptiveCandidate(
      hypotheses.map((hypothesis) => ({
        key: hypothesis.key,
        type: hypothesis.type,
        skillCode: hypothesis.skill?.code ?? null,
        confidence: hypothesis.confidence,
        priority: hypothesis.priority,
      })),
      templates.map((template) => ({
        id: template.id,
        kind: template.kind,
        targetSkillCode: template.targetSkill.code,
        hypothesisType: template.hypothesisType,
        difficulty: template.difficulty,
        estimatedSeconds: template.estimatedSeconds,
        importance: template.targetSkill.importance ?? 3,
      })),
      {
        answeredCandidateIds: answeredItems.flatMap((item) =>
          item.questionTemplate ? [item.questionTemplate.id] : [],
        ),
        questionsBySkill,
        selectedTotal: existingItems.length,
        selectedTheory: theoryCount,
      },
    );

    if (!selection) {
      return this.finishClarification(studentId, session);
    }

    const template = templates.find(
      (item) => item.id === selection.candidate.id,
    )!;
    const phase =
      template.kind === 'ADAPTIVE_TASK'
        ? AssessmentPhase.ADAPTIVE
        : AssessmentPhase.THEORY;
    const phaseSortOrder =
      existingItems.filter((item) => item.phase === phase).length + 1;
    const item = await this.prisma.assessmentItem.create({
      data: {
        publicId: createPublicId('DI'),
        sessionId: session.id,
        questionTemplateId: template.id,
        targetSkillId: template.targetSkill.id,
        phase,
        kind: 'QUESTION',
        sortOrder: phaseSortOrder,
        promptSnapshot: template.prompt,
        expectedSeconds: template.estimatedSeconds,
        selectionReason: {
          hypothesisKey: selection.hypothesisKey,
          score: selection.score,
          algorithmVersion: session.algorithmVersion,
        },
      },
      select: {
        publicId: true,
        phase: true,
        kind: true,
        promptSnapshot: true,
        expectedSeconds: true,
        questionTemplate: {
          select: {
            code: true,
            kind: true,
            answerOptions: true,
          },
        },
        targetSkill: { select: { code: true, name: true } },
      },
    });

    return { completed: false, item };
  }

  private async finishClarification(
    studentId: string,
    session: Awaited<ReturnType<DiagnosticAccessService['getOwnedSession']>>,
  ) {
    await this.prisma.diagnosticHypothesis.updateMany({
      where: {
        sessionId: session.id,
        status: DiagnosticHypothesisStatus.OPEN,
      },
      data: { status: DiagnosticHypothesisStatus.INSUFFICIENT },
    });
    const pendingManual = await this.prisma.assessmentItem.count({
      where: {
        sessionId: session.id,
        status: AssessmentItemStatus.AWAITING_REVIEW,
      },
    });
    const profile = await this.evidenceService.recalculateInitialProfile(
      studentId,
      session.knowledgeMapId,
      session.id,
    );
    const completed = pendingManual === 0;

    await this.prisma.assessmentSession.update({
      where: { id: session.id },
      data: {
        status: completed
          ? AssessmentSessionStatus.COMPLETED
          : AssessmentSessionStatus.EXAM_REVIEW_PENDING,
        completedAt: completed ? new Date() : null,
      },
    });

    return {
      completed,
      awaitingManualReview: pendingManual,
      profileSummary: {
        mastered: profile.filter((item) => item.status === 'MASTERED').length,
        gaps: profile.filter((item) => item.status === 'GAP').length,
        unstudied: profile.filter((item) => item.status === 'UNSTUDIED').length,
        unknown: profile.filter((item) => item.status === 'UNKNOWN').length,
      },
    };
  }
}
