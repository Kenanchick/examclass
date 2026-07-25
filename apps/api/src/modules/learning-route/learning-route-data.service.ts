import { BadRequestException, Injectable } from '@nestjs/common';
import {
  KnowledgeNodeKind,
  LearningGoalStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { KNOWLEDGE_PROFILE_FORMULA_VERSION } from '../diagnostics/domain/profile-factors';
import type {
  BuildLearningRouteInput,
  RouteSkill,
  RouteSkillStatus,
  RouteTeacherAssignment,
} from './domain/route-types';
import { getEffectiveSkillStatus } from './domain/teacher-skill-state';

export type LearningRouteData = {
  goalId: string;
  knowledgeMapId: string;
  profileFormulaVersion: string;
  input: BuildLearningRouteInput;
};

@Injectable()
export class LearningRouteDataService {
  constructor(private readonly prisma: PrismaService) {}

  async load(studentId: string, asOf: Date): Promise<LearningRouteData> {
    const goal = await this.prisma.studentLearningGoal.findFirst({
      where: { studentId, status: LearningGoalStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        knowledgeMapId: true,
        targetScore: true,
        examDate: true,
        weeklyMinutes: true,
        knowledgeMap: { select: { subjectId: true } },
      },
    });

    if (!goal) {
      throw new BadRequestException(
        'Сначала задайте цель и завершите стартовую диагностику',
      );
    }
    if (goal.examDate <= asOf) {
      throw new BadRequestException('Дата экзамена уже прошла');
    }

    const [nodes, dependencies, states, homeworkRecipients, teacherControls] =
      await Promise.all([
        this.prisma.knowledgeNode.findMany({
          where: {
            knowledgeMapId: goal.knowledgeMapId,
            kind: KnowledgeNodeKind.SKILL,
          },
          orderBy: { code: 'asc' },
          select: {
            id: true,
            code: true,
            name: true,
            difficulty: true,
            importance: true,
            estimatedMinutes: true,
            isFoundational: true,
            parent: {
              select: {
                id: true,
                code: true,
                name: true,
                parent: { select: { name: true } },
              },
            },
            examMappings: {
              select: { examNumber: true, examPart: true, weight: true },
            },
          },
        }),
        this.prisma.knowledgeDependency.findMany({
          where: { skill: { knowledgeMapId: goal.knowledgeMapId } },
          select: {
            type: true,
            skill: { select: { code: true } },
            prerequisite: { select: { code: true } },
          },
        }),
        this.prisma.studentSkillState.findMany({
          where: { studentId, knowledgeMapId: goal.knowledgeMapId },
          select: {
            skillId: true,
            mastery: true,
            confidence: true,
            stability: true,
            distinctEvidenceCount: true,
            status: true,
            needsReview: true,
            lastVerifiedAt: true,
            formulaVersion: true,
          },
        }),
        this.prisma.homeworkAssignmentRecipient.findMany({
          where: {
            studentId,
            homework: {
              deadline: { gte: asOf },
              classroom: { subjectId: goal.knowledgeMap.subjectId },
            },
          },
          select: {
            homework: {
              select: {
                publicId: true,
                title: true,
                tasks: {
                  select: {
                    task: {
                      select: {
                        skillLinks: {
                          where: {
                            skill: { knowledgeMapId: goal.knowledgeMapId },
                          },
                          select: {
                            skill: { select: { code: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        this.prisma.teacherSkillControl.findMany({
          where: {
            studentId,
            skill: { knowledgeMapId: goal.knowledgeMapId },
          },
          select: {
            skillId: true,
            manualStatus: true,
            autoStatusEnabled: true,
            reviewScheduledAt: true,
            controlScheduledAt: true,
            skill: { select: { code: true, name: true } },
          },
        }),
      ]);

    if (states.length === 0) {
      throw new BadRequestException(
        'Профиль знаний ещё не сформирован по результатам диагностики',
      );
    }

    const stateBySkillId = new Map(
      states.map((state) => [state.skillId, state]),
    );
    const controlBySkillId = new Map(
      teacherControls.map((control) => [control.skillId, control]),
    );
    const skills: RouteSkill[] = nodes.map((node) => {
      const profile = stateBySkillId.get(node.id);
      const control = controlBySkillId.get(node.id);
      const reviewScheduled = Boolean(control?.reviewScheduledAt);

      return {
        id: node.id,
        code: node.code,
        name: node.name,
        moduleId: node.parent?.id ?? null,
        moduleCode: node.parent?.code ?? node.code,
        moduleName: node.parent?.name ?? node.name,
        topicName: node.parent?.parent?.name ?? null,
        difficulty: node.difficulty ?? 2,
        importance: node.importance ?? 3,
        estimatedMinutes: node.estimatedMinutes ?? 90,
        isFoundational: node.isFoundational,
        examMappings: node.examMappings,
        state: profile
          ? {
              mastery: profile.mastery,
              confidence: profile.confidence,
              stability: profile.stability,
              distinctEvidenceCount: profile.distinctEvidenceCount,
              status: getEffectiveSkillStatus(
                profile.status,
                control,
              ) as RouteSkillStatus,
              needsReview: profile.needsReview || reviewScheduled,
              lastVerifiedAt: profile.lastVerifiedAt,
            }
          : {
              mastery: 0.5,
              confidence: 0,
              stability: null,
              distinctEvidenceCount: 0,
              status: 'INSUFFICIENT_DATA',
              needsReview: false,
              lastVerifiedAt: null,
            },
      };
    });
    const teacherAssignments: RouteTeacherAssignment[] =
      homeworkRecipients.flatMap(({ homework }) =>
        homework.tasks.flatMap(({ task }) =>
          task.skillLinks.map(({ skill }) => ({
            skillCode: skill.code,
            assignmentId: homework.publicId,
            title: homework.title,
          })),
        ),
      );
    teacherAssignments.push(
      ...teacherControls.flatMap((control) =>
        control.controlScheduledAt
          ? [
              {
                skillCode: control.skill.code,
                assignmentId: `CONTROL:${control.skill.code}`,
                title: `Контроль: ${control.skill.name}`,
                kind: 'CONTROL' as const,
              },
            ]
          : [],
      ),
    );

    return {
      goalId: goal.id,
      knowledgeMapId: goal.knowledgeMapId,
      profileFormulaVersion:
        states.find(
          (state) => state.formulaVersion === KNOWLEDGE_PROFILE_FORMULA_VERSION,
        )?.formulaVersion ??
        states[0]?.formulaVersion ??
        'unknown',
      input: {
        skills,
        dependencies: dependencies.map((dependency) => ({
          skillCode: dependency.skill.code,
          prerequisiteCode: dependency.prerequisite.code,
          type: dependency.type,
        })),
        goal,
        teacherAssignments,
        asOf,
      },
    };
  }
}
