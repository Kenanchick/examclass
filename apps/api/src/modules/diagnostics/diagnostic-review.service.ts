import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssessmentAttemptOutcome,
  AssessmentItemStatus,
  AssessmentSessionStatus,
  Role,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LearningRouteService } from '../learning-route/learning-route.service';
import { DiagnosticEvidenceService } from './diagnostic-evidence.service';
import { ReviewAssessmentAttemptDto } from './dto/review-assessment-attempt.dto';
import { analyzeAttempt } from './domain/diagnostic-analysis';

@Injectable()
export class DiagnosticReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evidenceService: DiagnosticEvidenceService,
    private readonly learningRoutes: LearningRouteService,
  ) {}

  async getReviewQueue(reviewerId: string) {
    await this.assertTeacher(reviewerId);

    return this.prisma.assessmentAttempt.findMany({
      where: {
        outcome: AssessmentAttemptOutcome.AWAITING_REVIEW,
        item: {
          session: {
            student: {
              classroomMemberships: {
                some: {
                  classroom: { ownerId: reviewerId },
                },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
      select: {
        publicId: true,
        submittedAt: true,
        rawAnswer: true,
        solutionText: true,
        item: {
          select: {
            publicId: true,
            examNumber: true,
            maxScore: true,
            task: {
              select: {
                publicId: true,
                statement: true,
                referenceSolution: true,
                rubricCriteria: {
                  orderBy: { sortOrder: 'asc' },
                  select: {
                    code: true,
                    title: true,
                    description: true,
                    maxScore: true,
                    skill: { select: { code: true, name: true } },
                  },
                },
              },
            },
            session: {
              select: {
                publicId: true,
                student: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        attachments: {
          select: {
            publicId: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
          },
        },
      },
    });
  }

  async reviewAttempt(
    reviewerId: string,
    sessionPublicId: string,
    attemptPublicId: string,
    dto: ReviewAssessmentAttemptDto,
  ) {
    await this.assertTeacher(reviewerId);
    const attempt = await this.prisma.assessmentAttempt.findFirst({
      where: {
        publicId: attemptPublicId,
        item: { session: { publicId: sessionPublicId } },
      },
      select: {
        id: true,
        outcome: true,
        activeSeconds: true,
        confidence: true,
        independence: true,
        item: {
          select: {
            id: true,
            publicId: true,
            maxScore: true,
            expectedSeconds: true,
            session: {
              select: {
                id: true,
                studentId: true,
                knowledgeMapId: true,
                status: true,
                student: {
                  select: {
                    classroomMemberships: {
                      where: { classroom: { ownerId: reviewerId } },
                      take: 1,
                      select: { classroomId: true },
                    },
                  },
                },
              },
            },
            task: {
              select: {
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
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Ответ диагностики не найден');
    }

    if (attempt.item.session.student.classroomMemberships.length === 0) {
      throw new ForbiddenException(
        'Можно проверять диагностику только своего ученика',
      );
    }

    if (attempt.outcome !== AssessmentAttemptOutcome.AWAITING_REVIEW) {
      throw new BadRequestException('Ответ уже проверен');
    }

    if (dto.awardedScore > attempt.item.maxScore) {
      throw new BadRequestException('Баллы превышают максимум за задание');
    }

    if (
      new Set(dto.criteria.map((criterion) => criterion.code)).size !==
      dto.criteria.length
    ) {
      throw new BadRequestException('Коды критериев не должны повторяться');
    }

    const criteriaTotal = dto.criteria.reduce(
      (sum, criterion) => sum + criterion.awardedScore,
      0,
    );
    const criteriaMaximum = dto.criteria.reduce(
      (sum, criterion) => sum + criterion.maxScore,
      0,
    );

    if (
      dto.criteria.length > 0 &&
      (Math.abs(criteriaTotal - dto.awardedScore) > 1e-9 ||
        criteriaMaximum > attempt.item.maxScore)
    ) {
      throw new BadRequestException(
        'Сумма критериев не совпадает с итоговым баллом',
      );
    }

    const skillCodes = dto.criteria.flatMap((criterion) =>
      criterion.skillCode ? [criterion.skillCode] : [],
    );
    const skills = await this.prisma.knowledgeNode.findMany({
      where: {
        knowledgeMapId: attempt.item.session.knowledgeMapId,
        code: { in: skillCodes },
      },
      select: { id: true, code: true },
    });
    const skillIdByCode = new Map(
      skills.map((skill) => [skill.code, skill.id]),
    );

    if (skillIdByCode.size !== new Set(skillCodes).size) {
      throw new BadRequestException('В критериях указан неизвестный навык');
    }

    const scoreRatio =
      attempt.item.maxScore > 0 ? dto.awardedScore / attempt.item.maxScore : 0;
    const outcome =
      scoreRatio >= 1
        ? AssessmentAttemptOutcome.CORRECT
        : scoreRatio > 0
          ? AssessmentAttemptOutcome.PARTIAL
          : AssessmentAttemptOutcome.INCORRECT;
    const reviewedAt = new Date();

    await this.prisma.$transaction(async (transaction) => {
      await transaction.assessmentReviewCriterion.deleteMany({
        where: { attemptId: attempt.id },
      });

      if (dto.criteria.length > 0) {
        await transaction.assessmentReviewCriterion.createMany({
          data: dto.criteria.map((criterion) => ({
            attemptId: attempt.id,
            skillId: criterion.skillCode
              ? skillIdByCode.get(criterion.skillCode)
              : null,
            code: criterion.code,
            title: criterion.title,
            awardedScore: criterion.awardedScore,
            maxScore: criterion.maxScore,
            errorType: criterion.errorType,
            comment: criterion.comment,
          })),
        });
      }

      await transaction.assessmentAttempt.update({
        where: { id: attempt.id },
        data: {
          outcome,
          awardedScore: dto.awardedScore,
          reviewerId,
          reviewedAt,
          reviewErrorType: dto.errorType,
          reviewComment: dto.comment,
        },
      });
      await transaction.assessmentItem.update({
        where: { id: attempt.item.id },
        data: { status: AssessmentItemStatus.REVIEWED },
      });
    });

    if (dto.criteria.length > 0) {
      for (const criterion of dto.criteria) {
        if (!criterion.skillCode) {
          continue;
        }

        await this.evidenceService.persistItemAnalysis({
          studentId: attempt.item.session.studentId,
          sessionId: attempt.item.session.id,
          itemId: attempt.item.id,
          occurredAt: reviewedAt,
          analysis: analyzeAttempt({
            itemKey: `${attempt.item.publicId}:${criterion.code}`,
            source: 'MANUAL_REVIEW',
            outcome:
              criterion.awardedScore >= criterion.maxScore
                ? 'CORRECT'
                : criterion.awardedScore > 0
                  ? 'PARTIAL'
                  : 'INCORRECT',
            activeSeconds:
              attempt.activeSeconds || attempt.item.expectedSeconds || 1_200,
            expectedSeconds: attempt.item.expectedSeconds ?? 1_200,
            remainingSessionSeconds: 0,
            confidence: attempt.confidence,
            difficulty: attempt.item.task?.difficulty ?? 2,
            independence: attempt.independence,
            hasVisibleWork: true,
            scoreRatio: criterion.awardedScore / criterion.maxScore,
            reviewErrorType: criterion.errorType,
            teacherConfirmed: true,
            skillLinks: [
              {
                skillCode: criterion.skillCode,
                role: 'PRIMARY',
                weight: 1,
              },
            ],
          }),
        });
      }
    } else {
      await this.evidenceService.persistItemAnalysis({
        studentId: attempt.item.session.studentId,
        sessionId: attempt.item.session.id,
        itemId: attempt.item.id,
        occurredAt: reviewedAt,
        analysis: analyzeAttempt({
          itemKey: attempt.item.publicId,
          source: 'MANUAL_REVIEW',
          outcome,
          activeSeconds:
            attempt.activeSeconds || attempt.item.expectedSeconds || 1_200,
          expectedSeconds: attempt.item.expectedSeconds ?? 1_200,
          remainingSessionSeconds: 0,
          confidence: attempt.confidence,
          difficulty: attempt.item.task?.difficulty ?? 2,
          independence: attempt.independence,
          hasVisibleWork: true,
          scoreRatio,
          reviewErrorType: dto.errorType,
          teacherConfirmed: true,
          skillLinks:
            attempt.item.task?.skillLinks.map((link) => ({
              skillCode: link.skill.code,
              role: link.role,
              weight: link.weight,
            })) ?? [],
        }),
      });
    }

    const profile = await this.evidenceService.recalculateProfile(
      attempt.item.session.studentId,
      attempt.item.session.knowledgeMapId,
      attempt.item.session.id,
    );
    const pendingReview = await this.prisma.assessmentItem.count({
      where: {
        sessionId: attempt.item.session.id,
        status: AssessmentItemStatus.AWAITING_REVIEW,
      },
    });

    if (
      pendingReview === 0 &&
      attempt.item.session.status ===
        AssessmentSessionStatus.EXAM_REVIEW_PENDING
    ) {
      await this.prisma.assessmentSession.update({
        where: { id: attempt.item.session.id },
        data: {
          status: AssessmentSessionStatus.COMPLETED,
          completedAt: reviewedAt,
        },
      });
      await this.learningRoutes.rebuildFromProfile(
        attempt.item.session.studentId,
      );
    }

    return {
      outcome,
      awardedScore: dto.awardedScore,
      maxScore: attempt.item.maxScore,
      pendingReview,
      profileUpdated: profile.length,
    };
  }

  private async assertTeacher(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.TEACHER && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Доступно только преподавателю');
    }
  }
}
