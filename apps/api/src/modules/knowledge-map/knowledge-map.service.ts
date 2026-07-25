import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  KnowledgeMapStatus,
  KnowledgeNodeKind,
} from '../../generated/prisma/client';
import { buildKnowledgeTree } from './knowledge-map-tree';

@Injectable()
export class KnowledgeMapService {
  constructor(private readonly prisma: PrismaService) {}

  private findLatestMap(subjectCode: string) {
    return this.prisma.knowledgeMap.findFirst({
      where: {
        subject: {
          code: subjectCode,
        },
        status: {
          in: [KnowledgeMapStatus.PUBLISHED, KnowledgeMapStatus.IN_REVIEW],
        },
      },
      orderBy: {
        version: 'desc',
      },
      select: {
        id: true,
        version: true,
        title: true,
        description: true,
        sourceSummary: true,
        status: true,
      },
    });
  }

  async getMap(subjectCode: string) {
    const map = await this.findLatestMap(subjectCode);

    if (!map) {
      throw new NotFoundException(
        `Карта знаний для предмета ${subjectCode} не найдена`,
      );
    }

    const [nodes, dependencies, materials, reviewItems, references] =
      await Promise.all([
        this.prisma.knowledgeNode.findMany({
          where: {
            knowledgeMapId: map.id,
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            parentId: true,
            code: true,
            kind: true,
            name: true,
            description: true,
            sortOrder: true,
            difficulty: true,
            importance: true,
            estimatedMinutes: true,
            isFoundational: true,
            sourceCoverage: true,
            needsExpertReview: true,
            expertReviewNote: true,
            examMappings: {
              orderBy: [{ examNumber: 'asc' }, { taskType: 'asc' }],
              select: {
                examNumber: true,
                examPart: true,
                taskType: true,
                weight: true,
              },
            },
            verification: {
              orderBy: {
                sortOrder: 'asc',
              },
              select: {
                method: true,
                description: true,
              },
            },
          },
        }),
        this.prisma.knowledgeDependency.findMany({
          where: {
            skill: {
              knowledgeMapId: map.id,
            },
          },
          orderBy: [{ type: 'asc' }, { skillId: 'asc' }],
          select: {
            type: true,
            rationale: true,
            needsExpertReview: true,
            skill: {
              select: {
                code: true,
              },
            },
            prerequisite: {
              select: {
                code: true,
              },
            },
          },
        }),
        this.prisma.learningMaterial.findMany({
          where: {
            knowledgeMapId: map.id,
          },
          orderBy: {
            fileName: 'asc',
          },
          select: {
            fileName: true,
            title: true,
            pageCount: true,
            reviewStatus: true,
            _count: {
              select: {
                segments: true,
              },
            },
          },
        }),
        this.prisma.knowledgeReviewItem.findMany({
          where: {
            knowledgeMapId: map.id,
          },
          orderBy: [{ type: 'asc' }, { priority: 'asc' }, { code: 'asc' }],
          select: {
            code: true,
            type: true,
            priority: true,
            title: true,
            description: true,
            resolvedAt: true,
            skillLinks: {
              select: {
                skill: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.knowledgeMapReference.findMany({
          where: {
            knowledgeMapId: map.id,
          },
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            title: true,
            url: true,
            purpose: true,
          },
        }),
      ]);

    const skills = nodes.filter(
      (node) => node.kind === KnowledgeNodeKind.SKILL,
    );

    return {
      ...map,
      summary: {
        sections: nodes.filter(
          (node) => node.kind === KnowledgeNodeKind.SECTION,
        ).length,
        topics: nodes.filter((node) => node.kind === KnowledgeNodeKind.TOPIC)
          .length,
        subtopics: nodes.filter(
          (node) => node.kind === KnowledgeNodeKind.SUBTOPIC,
        ).length,
        skills: skills.length,
        foundationalSkills: skills.filter((node) => node.isFoundational).length,
        expertReviewSkills: skills.filter((node) => node.needsExpertReview)
          .length,
        requiredDependencies: dependencies.filter(
          (dependency) => dependency.type === 'REQUIRED',
        ).length,
        recommendedDependencies: dependencies.filter(
          (dependency) => dependency.type === 'RECOMMENDED',
        ).length,
      },
      tree: buildKnowledgeTree(nodes),
      dependencies: dependencies.map((dependency) => ({
        type: dependency.type,
        skillCode: dependency.skill.code,
        prerequisiteCode: dependency.prerequisite.code,
        rationale: dependency.rationale,
        needsExpertReview: dependency.needsExpertReview,
      })),
      materials: materials.map(({ _count, ...material }) => ({
        ...material,
        segmentCount: _count.segments,
      })),
      reviewItems: reviewItems.map(({ skillLinks, ...item }) => ({
        ...item,
        skillCodes: skillLinks.map((link) => link.skill.code),
      })),
      references,
    };
  }

  async getSkill(subjectCode: string, skillCode: string) {
    const map = await this.findLatestMap(subjectCode);

    if (!map) {
      throw new NotFoundException(
        `Карта знаний для предмета ${subjectCode} не найдена`,
      );
    }

    const currentSkill = await this.prisma.knowledgeNode.findFirst({
      where: {
        knowledgeMapId: map.id,
        code: skillCode,
        kind: KnowledgeNodeKind.SKILL,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        difficulty: true,
        importance: true,
        estimatedMinutes: true,
        isFoundational: true,
        sourceCoverage: true,
        needsExpertReview: true,
        expertReviewNote: true,
        parent: {
          select: {
            code: true,
            name: true,
            parent: {
              select: {
                code: true,
                name: true,
                parent: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        examMappings: {
          orderBy: [{ examNumber: 'asc' }, { taskType: 'asc' }],
        },
        verification: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        prerequisiteLinks: {
          orderBy: {
            type: 'asc',
          },
          select: {
            type: true,
            rationale: true,
            needsExpertReview: true,
            prerequisite: {
              select: {
                code: true,
                name: true,
                difficulty: true,
                importance: true,
              },
            },
          },
        },
        unlocksSkills: {
          orderBy: {
            type: 'asc',
          },
          select: {
            type: true,
            rationale: true,
            needsExpertReview: true,
            skill: {
              select: {
                code: true,
                name: true,
                difficulty: true,
                importance: true,
              },
            },
          },
        },
        materialLinks: {
          select: {
            role: true,
            confidence: true,
            needsExpertReview: true,
            segment: {
              select: {
                title: true,
                pages: true,
                notes: true,
                material: {
                  select: {
                    fileName: true,
                    title: true,
                    reviewStatus: true,
                  },
                },
              },
            },
          },
        },
        reviewLinks: {
          select: {
            reviewItem: {
              select: {
                code: true,
                type: true,
                priority: true,
                title: true,
                description: true,
                resolvedAt: true,
              },
            },
          },
        },
      },
    });

    if (!currentSkill) {
      throw new NotFoundException(`Навык ${skillCode} не найден`);
    }

    const { parent, reviewLinks, ...skill } = currentSkill;

    return {
      map: {
        id: map.id,
        version: map.version,
        status: map.status,
      },
      skill: {
        ...skill,
        hierarchy: {
          section: parent?.parent?.parent ?? null,
          topic: parent?.parent
            ? {
                code: parent.parent.code,
                name: parent.parent.name,
              }
            : null,
          subtopic: parent
            ? {
                code: parent.code,
                name: parent.name,
              }
            : null,
        },
        reviewItems: reviewLinks.map((link) => link.reviewItem),
      },
    };
  }
}
