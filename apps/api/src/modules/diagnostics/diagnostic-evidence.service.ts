import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AssessmentReviewErrorType,
  AttemptIndependence,
  DiagnosticHypothesisStatus,
  DiagnosticHypothesisType,
  KnowledgeNodeKind,
  Prisma,
  SkillEvidenceSource,
  StudentSkillStatus,
  TaskSkillRole,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import type { AttemptAnalysis } from './domain/diagnostic-analysis';
import { reconcileHypothesisStatus } from './domain/hypothesis-reconciliation';
import {
  calculateKnowledgeProfile,
  type ProfileEvidenceSource,
} from './domain/profile-calculator';
import { KNOWLEDGE_PROFILE_FORMULA_VERSION } from './domain/profile-factors';

@Injectable()
export class DiagnosticEvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async persistItemAnalysis({
    studentId,
    sessionId,
    itemId,
    occurredAt,
    analysis,
  }: {
    studentId: string;
    sessionId: string;
    itemId: string;
    occurredAt: Date;
    analysis: AttemptAnalysis;
  }) {
    const skillCodes = [
      ...new Set([
        ...analysis.evidence.map((item) => item.skillCode),
        ...analysis.hypotheses.flatMap((item) =>
          item.skillCode ? [item.skillCode] : [],
        ),
      ]),
    ];
    const session = await this.prisma.assessmentSession.findUniqueOrThrow({
      where: { id: sessionId },
      select: { knowledgeMapId: true },
    });
    const skills = await this.prisma.knowledgeNode.findMany({
      where: {
        knowledgeMapId: session.knowledgeMapId,
        code: { in: skillCodes },
        kind: KnowledgeNodeKind.SKILL,
      },
      select: { id: true, code: true },
    });
    const skillByCode = new Map(skills.map((skill) => [skill.code, skill.id]));

    await this.prisma.$transaction(async (transaction) => {
      for (const item of analysis.evidence) {
        const skillId = skillByCode.get(item.skillCode);

        if (!skillId) {
          continue;
        }

        await transaction.skillEvidence.upsert({
          where: {
            sessionId_skillId_independenceKey_source: {
              sessionId,
              skillId,
              independenceKey: item.independenceKey,
              source: SkillEvidenceSource[item.source],
            },
          },
          update: {
            score: item.score,
            weight: item.weight,
            difficulty: item.difficulty,
            skillRole: TaskSkillRole[item.skillRole],
            independence: AttemptIndependence[item.independence],
            activeSeconds: item.activeSeconds,
            expectedSeconds: item.expectedSeconds,
            selfConfidence: item.selfConfidence,
            errorType: item.errorType
              ? AssessmentReviewErrorType[item.errorType]
              : null,
            teacherConfirmed: item.teacherConfirmed,
            reason: item.reason,
            occurredAt,
          },
          create: {
            studentId,
            skillId,
            sessionId,
            assessmentItemId: itemId,
            source: SkillEvidenceSource[item.source],
            score: item.score,
            weight: item.weight,
            difficulty: item.difficulty,
            skillRole: TaskSkillRole[item.skillRole],
            independence: AttemptIndependence[item.independence],
            activeSeconds: item.activeSeconds,
            expectedSeconds: item.expectedSeconds,
            selfConfidence: item.selfConfidence,
            errorType: item.errorType
              ? AssessmentReviewErrorType[item.errorType]
              : null,
            teacherConfirmed: item.teacherConfirmed,
            independenceKey: item.independenceKey,
            reason: item.reason,
            occurredAt,
          },
        });
      }

      for (const hypothesis of analysis.hypotheses) {
        const skillId = hypothesis.skillCode
          ? skillByCode.get(hypothesis.skillCode)
          : null;

        await transaction.diagnosticHypothesis.upsert({
          where: {
            sessionId_key: {
              sessionId,
              key: hypothesis.key,
            },
          },
          update: {
            confidence: Math.max(0, Math.min(1, hypothesis.confidence)),
            priority: Math.max(0, hypothesis.priority),
            evidenceCount: { increment: 1 },
            rationale: hypothesis.rationale,
          },
          create: {
            sessionId,
            skillId: skillId ?? null,
            sourceItemId: itemId,
            key: hypothesis.key,
            type: DiagnosticHypothesisType[hypothesis.type],
            confidence: Math.max(0, Math.min(1, hypothesis.confidence)),
            priority: Math.max(0, hypothesis.priority),
            rationale: hypothesis.rationale,
          },
        });
      }
    });

    await this.reconcileHypotheses(sessionId);
  }

  async addSelfReportedEvidence({
    studentId,
    sessionId,
    goalId,
    knowledgeMapId,
    selectedNodeIds,
  }: {
    studentId: string;
    sessionId: string;
    goalId: string;
    knowledgeMapId: string;
    selectedNodeIds: string[];
  }) {
    if (selectedNodeIds.length === 0) {
      return;
    }

    const nodes = await this.prisma.knowledgeNode.findMany({
      where: { knowledgeMapId },
      select: { id: true, parentId: true, code: true, kind: true },
    });
    const included = new Set(selectedNodeIds);
    let changed = true;

    while (changed) {
      changed = false;

      for (const node of nodes) {
        if (
          node.parentId &&
          included.has(node.parentId) &&
          !included.has(node.id)
        ) {
          included.add(node.id);
          changed = true;
        }
      }
    }

    const skills = nodes.filter(
      (node) => node.kind === KnowledgeNodeKind.SKILL && included.has(node.id),
    );

    if (skills.length === 0) {
      return;
    }

    await this.prisma.skillEvidence.createMany({
      data: skills.map((skill) => ({
        studentId,
        skillId: skill.id,
        sessionId,
        source: SkillEvidenceSource.SELF_REPORT,
        score: 0,
        weight: 0.1,
        independenceKey: `goal:${goalId}:${skill.code}`,
        reason: 'Ученик отметил тему как ещё не изученную до диагностики',
        occurredAt: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  async recalculateProfile(
    studentId: string,
    knowledgeMapId: string,
    initializedBySessionId: string,
  ) {
    const [skills, evidence] = await Promise.all([
      this.prisma.knowledgeNode.findMany({
        where: {
          knowledgeMapId,
          kind: KnowledgeNodeKind.SKILL,
        },
        orderBy: { code: 'asc' },
        select: { id: true, code: true },
      }),
      this.prisma.skillEvidence.findMany({
        where: {
          studentId,
          skill: { knowledgeMapId },
        },
        select: {
          skill: { select: { code: true } },
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
          independenceKey: true,
          occurredAt: true,
        },
      }),
    ]);
    const calculated = calculateKnowledgeProfile({
      skillCodes: skills.map((skill) => skill.code),
      evidence: evidence.map((item) => ({
        skillCode: item.skill.code,
        source: item.source as ProfileEvidenceSource,
        score: item.score,
        weight: item.weight,
        difficulty: item.difficulty,
        skillRole: item.skillRole,
        independence: item.independence,
        activeSeconds: item.activeSeconds,
        expectedSeconds: item.expectedSeconds,
        selfConfidence: item.selfConfidence,
        errorType: item.errorType,
        teacherConfirmed: item.teacherConfirmed,
        independenceKey: item.independenceKey,
        occurredAt: item.occurredAt,
      })),
    });
    const skillIdByCode = new Map(
      skills.map((skill) => [skill.code, skill.id]),
    );
    const calculationBatchId = randomUUID();

    await this.prisma.$transaction(
      calculated.flatMap((state) => {
        const skillId = skillIdByCode.get(state.skillCode)!;

        return [
          this.prisma.studentSkillState.upsert({
            where: {
              studentId_skillId: {
                studentId,
                skillId,
              },
            },
            update: {
              knowledgeMapId,
              initializedBySessionId,
              formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
              mastery: state.mastery,
              confidence: state.confidence,
              evidenceWeight: state.evidenceWeight,
              evidenceCount: state.evidenceCount,
              distinctEvidenceCount: state.distinctEvidenceCount,
              confirmingAttempts: state.confirmingAttempts,
              contradictingAttempts: state.contradictingAttempts,
              speed: state.speed,
              stability: state.stability,
              status: StudentSkillStatus[state.status],
              lastEvidenceAt: state.lastEvidenceAt,
              lastVerifiedAt: state.lastVerifiedAt,
              reviewDueAt: state.reviewDueAt,
              needsReview: state.needsReview,
              teacherConfirmedAt: state.teacherConfirmedAt,
              sourceSummary: state.sourceSummary as Prisma.InputJsonValue,
              explanation: state.explanation as Prisma.InputJsonValue,
            },
            create: {
              studentId,
              skillId,
              knowledgeMapId,
              initializedBySessionId,
              formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
              mastery: state.mastery,
              confidence: state.confidence,
              evidenceWeight: state.evidenceWeight,
              evidenceCount: state.evidenceCount,
              distinctEvidenceCount: state.distinctEvidenceCount,
              confirmingAttempts: state.confirmingAttempts,
              contradictingAttempts: state.contradictingAttempts,
              speed: state.speed,
              stability: state.stability,
              status: StudentSkillStatus[state.status],
              lastEvidenceAt: state.lastEvidenceAt,
              lastVerifiedAt: state.lastVerifiedAt,
              reviewDueAt: state.reviewDueAt,
              needsReview: state.needsReview,
              teacherConfirmedAt: state.teacherConfirmedAt,
              sourceSummary: state.sourceSummary as Prisma.InputJsonValue,
              explanation: state.explanation as Prisma.InputJsonValue,
            },
          }),
          this.prisma.studentSkillStateRevision.create({
            data: {
              calculationBatchId,
              studentId,
              skillId,
              knowledgeMapId,
              formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
              mastery: state.mastery,
              confidence: state.confidence,
              speed: state.speed,
              stability: state.stability,
              status: StudentSkillStatus[state.status],
              evidenceWeight: state.evidenceWeight,
              evidenceCount: state.evidenceCount,
              sourceSummary: state.sourceSummary as Prisma.InputJsonValue,
              explanation: state.explanation as Prisma.InputJsonValue,
            },
          }),
        ];
      }),
    );

    return calculated;
  }

  private async reconcileHypotheses(sessionId: string) {
    const hypotheses = await this.prisma.diagnosticHypothesis.findMany({
      where: {
        sessionId,
        status: DiagnosticHypothesisStatus.OPEN,
        skillId: { not: null },
      },
      select: {
        id: true,
        type: true,
        skillId: true,
        sourceItemId: true,
      },
    });

    for (const hypothesis of hypotheses) {
      if (!hypothesis.skillId) {
        continue;
      }

      const evidence = await this.prisma.skillEvidence.findMany({
        where: {
          sessionId,
          skillId: hypothesis.skillId,
          source: {
            in: [
              SkillEvidenceSource.FULL_EXAM,
              SkillEvidenceSource.ADAPTIVE_TASK,
              SkillEvidenceSource.THEORY_QUESTION,
              SkillEvidenceSource.MANUAL_REVIEW,
            ],
          },
        },
        select: {
          score: true,
          weight: true,
          independenceKey: true,
          source: true,
          assessmentItemId: true,
        },
      });
      const resolved = reconcileHypothesisStatus({
        type: hypothesis.type,
        sourceItemId: hypothesis.sourceItemId,
        evidence,
      });
      const status =
        resolved === 'OPEN' ? null : DiagnosticHypothesisStatus[resolved];

      if (status) {
        await this.prisma.diagnosticHypothesis.update({
          where: { id: hypothesis.id },
          data: { status },
        });
      }
    }
  }
}
