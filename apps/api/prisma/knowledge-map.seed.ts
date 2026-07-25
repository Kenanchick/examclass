import {
  ExamPart,
  ExamTaskType,
  KnowledgeDependencyType,
  KnowledgeMapStatus,
  KnowledgeNodeKind,
  KnowledgeReviewItemType,
  KnowledgeSourceCoverage,
  MaterialReviewStatus,
  MaterialSkillRole,
  PrismaClient,
  SkillVerificationMethod,
} from '../src/generated/prisma/client';
import {
  normalizeDependency,
  resolveKnowledgeMapSkills,
  validateKnowledgeMapCatalog,
} from './knowledge-map.catalog';
import { profileMathKnowledgeMap } from './knowledge-map.data';

type KnowledgeMapPrismaClient = Pick<
  PrismaClient,
  | 'subject'
  | 'knowledgeMap'
  | 'knowledgeNode'
  | 'knowledgeDependency'
  | 'knowledgeExamMapping'
  | 'knowledgeVerificationMethod'
  | 'learningMaterial'
  | 'learningMaterialSegment'
  | 'knowledgeReviewItem'
  | 'knowledgeMapReference'
>;

const verificationDescriptions: Record<SkillVerificationMethod, string> = {
  SHORT_ANSWER:
    'Короткая задача с однозначным числовым или символьным ответом.',
  MULTI_STEP_SOLUTION:
    'Развёрнутое решение, в котором видны промежуточные преобразования.',
  ORAL_EXPLANATION:
    'Краткое объяснение правила, выбора метода или ограничения.',
  ERROR_ANALYSIS: 'Поиск и объяснение ошибки в предложенном решении.',
  GRAPH_INTERPRETATION:
    'Чтение, сравнение или восстановление свойств по графику.',
  CONSTRUCTION:
    'Построение графика, геометрического объекта или вспомогательной линии.',
  PROOF: 'Логически полное доказательство с обоснованием переходов.',
  MODELING: 'Перевод условия в математическую модель и проверка результата.',
};

export const seedKnowledgeMap = async (prisma: KnowledgeMapPrismaClient) => {
  const summary = validateKnowledgeMapCatalog(profileMathKnowledgeMap);
  const subject = await prisma.subject.findUnique({
    where: {
      code: profileMathKnowledgeMap.subjectCode,
    },
    select: {
      id: true,
    },
  });

  if (!subject) {
    throw new Error(
      `Subject ${profileMathKnowledgeMap.subjectCode} must be seeded first`,
    );
  }

  const knowledgeMap = await prisma.knowledgeMap.upsert({
    where: {
      subjectId_version: {
        subjectId: subject.id,
        version: profileMathKnowledgeMap.version,
      },
    },
    update: {
      title: profileMathKnowledgeMap.title,
      description: profileMathKnowledgeMap.description,
      sourceSummary: profileMathKnowledgeMap.sourceSummary,
      status: KnowledgeMapStatus.IN_REVIEW,
    },
    create: {
      subjectId: subject.id,
      version: profileMathKnowledgeMap.version,
      title: profileMathKnowledgeMap.title,
      description: profileMathKnowledgeMap.description,
      sourceSummary: profileMathKnowledgeMap.sourceSummary,
      status: KnowledgeMapStatus.IN_REVIEW,
    },
    select: {
      id: true,
    },
  });

  const resolvedSkills = new Map(
    resolveKnowledgeMapSkills(profileMathKnowledgeMap).map((item) => [
      item.code,
      item,
    ]),
  );
  const nodeIds = new Map<string, string>();
  const activeCodes: string[] = [];

  const upsertNode = async ({
    code,
    kind,
    name,
    description,
    parentId,
    sortOrder,
  }: {
    code: string;
    kind: KnowledgeNodeKind;
    name: string;
    description: string;
    parentId: string | null;
    sortOrder: number;
  }) => {
    const resolvedSkill = resolvedSkills.get(code);
    const skillMetadata = resolvedSkill
      ? {
          difficulty: resolvedSkill.difficulty,
          importance: resolvedSkill.importance,
          estimatedMinutes: resolvedSkill.estimatedMinutes,
          isFoundational: resolvedSkill.isFoundational,
          sourceCoverage: KnowledgeSourceCoverage[resolvedSkill.sourceCoverage],
          needsExpertReview: resolvedSkill.needsExpertReview ?? false,
          expertReviewNote: resolvedSkill.expertReviewNote ?? null,
        }
      : {
          difficulty: null,
          importance: null,
          estimatedMinutes: null,
          isFoundational: false,
          sourceCoverage: null,
          needsExpertReview: false,
          expertReviewNote: null,
        };

    const node = await prisma.knowledgeNode.upsert({
      where: {
        knowledgeMapId_code: {
          knowledgeMapId: knowledgeMap.id,
          code,
        },
      },
      update: {
        parentId,
        kind,
        name,
        description,
        sortOrder,
        ...skillMetadata,
      },
      create: {
        knowledgeMapId: knowledgeMap.id,
        parentId,
        code,
        kind,
        name,
        description,
        sortOrder,
        ...skillMetadata,
      },
      select: {
        id: true,
      },
    });

    nodeIds.set(code, node.id);
    activeCodes.push(code);

    return node.id;
  };

  for (const [
    sectionIndex,
    section,
  ] of profileMathKnowledgeMap.sections.entries()) {
    const sectionId = await upsertNode({
      code: section.code,
      kind: KnowledgeNodeKind.SECTION,
      name: section.name,
      description: section.description,
      parentId: null,
      sortOrder: sectionIndex + 1,
    });

    for (const [topicIndex, topic] of section.topics.entries()) {
      const topicId = await upsertNode({
        code: topic.code,
        kind: KnowledgeNodeKind.TOPIC,
        name: topic.name,
        description: topic.description,
        parentId: sectionId,
        sortOrder: topicIndex + 1,
      });

      for (const [subtopicIndex, subtopic] of topic.subtopics.entries()) {
        const subtopicId = await upsertNode({
          code: subtopic.code,
          kind: KnowledgeNodeKind.SUBTOPIC,
          name: subtopic.name,
          description: subtopic.description,
          parentId: topicId,
          sortOrder: subtopicIndex + 1,
        });

        for (const [skillIndex, currentSkill] of subtopic.skills.entries()) {
          await upsertNode({
            code: currentSkill.code,
            kind: KnowledgeNodeKind.SKILL,
            name: currentSkill.name,
            description: currentSkill.description,
            parentId: subtopicId,
            sortOrder: skillIndex + 1,
          });
        }
      }
    }
  }

  await prisma.knowledgeDependency.deleteMany({
    where: {
      skill: {
        knowledgeMapId: knowledgeMap.id,
      },
    },
  });
  await prisma.knowledgeExamMapping.deleteMany({
    where: {
      skill: {
        knowledgeMapId: knowledgeMap.id,
      },
    },
  });
  await prisma.knowledgeVerificationMethod.deleteMany({
    where: {
      skill: {
        knowledgeMapId: knowledgeMap.id,
      },
    },
  });
  await prisma.learningMaterial.deleteMany({
    where: {
      knowledgeMapId: knowledgeMap.id,
    },
  });
  await prisma.knowledgeReviewItem.deleteMany({
    where: {
      knowledgeMapId: knowledgeMap.id,
    },
  });
  await prisma.knowledgeMapReference.deleteMany({
    where: {
      knowledgeMapId: knowledgeMap.id,
    },
  });
  await prisma.knowledgeNode.deleteMany({
    where: {
      knowledgeMapId: knowledgeMap.id,
      code: {
        notIn: activeCodes,
      },
    },
  });

  for (const currentSkill of resolvedSkills.values()) {
    const skillId = nodeIds.get(currentSkill.code);

    if (!skillId) {
      throw new Error(`Skill node ${currentSkill.code} was not created`);
    }

    const dependencies = [
      ...(currentSkill.required ?? []).map((item) => ({
        ...normalizeDependency(item),
        type: KnowledgeDependencyType.REQUIRED,
      })),
      ...(currentSkill.recommended ?? []).map((item) => ({
        ...normalizeDependency(item),
        type: KnowledgeDependencyType.RECOMMENDED,
      })),
    ];

    if (dependencies.length > 0) {
      await prisma.knowledgeDependency.createMany({
        data: dependencies.map((dependency) => {
          const prerequisiteId = nodeIds.get(dependency.code);

          if (!prerequisiteId) {
            throw new Error(`Prerequisite ${dependency.code} was not created`);
          }

          return {
            skillId,
            prerequisiteId,
            type: dependency.type,
            rationale: dependency.rationale ?? null,
            needsExpertReview: dependency.needsExpertReview ?? false,
          };
        }),
      });
    }

    await prisma.knowledgeExamMapping.createMany({
      data: currentSkill.examNumbers.flatMap((examNumber) =>
        currentSkill.taskTypes.map((taskType) => ({
          skillId,
          examNumber,
          examPart: examNumber <= 12 ? ExamPart.FIRST : ExamPart.SECOND,
          taskType: ExamTaskType[taskType],
        })),
      ),
    });

    await prisma.knowledgeVerificationMethod.createMany({
      data: currentSkill.verificationMethods.map((method, index) => {
        const enumMethod = SkillVerificationMethod[method];

        return {
          skillId,
          method: enumMethod,
          description: verificationDescriptions[enumMethod],
          sortOrder: index + 1,
        };
      }),
    });
  }

  for (const material of profileMathKnowledgeMap.materials) {
    const savedMaterial = await prisma.learningMaterial.create({
      data: {
        knowledgeMapId: knowledgeMap.id,
        fileName: material.fileName,
        title: material.title,
        pageCount: material.pageCount,
        reviewStatus: MaterialReviewStatus.REVIEWED,
      },
      select: {
        id: true,
      },
    });

    for (const [segmentIndex, segment] of material.segments.entries()) {
      await prisma.learningMaterialSegment.create({
        data: {
          materialId: savedMaterial.id,
          title: segment.title,
          pages: segment.pages,
          notes: segment.notes,
          sortOrder: segmentIndex + 1,
          needsExpertReview: segment.needsExpertReview ?? false,
          skillLinks: {
            create: segment.skillCodes.map((skillCode) => {
              const skillId = nodeIds.get(skillCode);

              if (!skillId) {
                throw new Error(`Material skill ${skillCode} was not created`);
              }

              return {
                skillId,
                role: MaterialSkillRole.REFERENCES,
                needsExpertReview: segment.needsExpertReview ?? false,
              };
            }),
          },
        },
      });
    }
  }

  for (const gap of profileMathKnowledgeMap.coverageGaps) {
    await prisma.knowledgeReviewItem.create({
      data: {
        knowledgeMapId: knowledgeMap.id,
        code: gap.code,
        type: KnowledgeReviewItemType.COVERAGE_GAP,
        priority: gap.priority,
        title: gap.title,
        description: gap.description,
        skillLinks: {
          create: gap.affectedSkillCodes.map((skillCode) => {
            const skillId = nodeIds.get(skillCode);

            if (!skillId) {
              throw new Error(
                `Coverage gap skill ${skillCode} was not created`,
              );
            }

            return {
              skillId,
            };
          }),
        },
      },
    });
  }

  for (const reviewItem of profileMathKnowledgeMap.expertReviewItems) {
    await prisma.knowledgeReviewItem.create({
      data: {
        knowledgeMapId: knowledgeMap.id,
        code: reviewItem.code,
        type: KnowledgeReviewItemType.EXPERT_REVIEW,
        title: reviewItem.title,
        description: reviewItem.description,
        skillLinks: {
          create: reviewItem.affectedSkillCodes.map((skillCode) => {
            const skillId = nodeIds.get(skillCode);

            if (!skillId) {
              throw new Error(
                `Expert review skill ${skillCode} was not created`,
              );
            }

            return {
              skillId,
            };
          }),
        },
      },
    });
  }

  await prisma.knowledgeMapReference.createMany({
    data: profileMathKnowledgeMap.externalReferences.map(
      (reference, index) => ({
        knowledgeMapId: knowledgeMap.id,
        title: reference.title,
        url: reference.url,
        purpose: reference.purpose,
        sortOrder: index + 1,
      }),
    ),
  });

  return {
    knowledgeMapId: knowledgeMap.id,
    ...summary,
  };
};
