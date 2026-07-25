export const knowledgeNodeKinds = [
  'SECTION',
  'TOPIC',
  'SUBTOPIC',
  'SKILL',
] as const;

export const skillVerificationMethods = [
  'SHORT_ANSWER',
  'MULTI_STEP_SOLUTION',
  'ORAL_EXPLANATION',
  'ERROR_ANALYSIS',
  'GRAPH_INTERPRETATION',
  'CONSTRUCTION',
  'PROOF',
  'MODELING',
] as const;

export const examTaskTypes = [
  'COMPUTATION',
  'EQUATION',
  'INEQUALITY',
  'GRAPH',
  'APPLIED_MODEL',
  'PROBABILITY',
  'PLANE_GEOMETRY',
  'STEREOMETRY',
  'PARAMETER',
  'NUMBER_THEORY',
] as const;

export const sourceCoverageLevels = ['DIRECT', 'PARTIAL', 'MISSING'] as const;

export type SkillVerificationMethod = (typeof skillVerificationMethods)[number];
export type ExamTaskType = (typeof examTaskTypes)[number];
export type SourceCoverage = (typeof sourceCoverageLevels)[number];

export type SkillDependencySeed = {
  code: string;
  rationale?: string;
  needsExpertReview?: boolean;
};

export type SkillSeed = {
  code: string;
  name: string;
  description: string;
  difficulty?: number;
  importance?: number;
  estimatedMinutes?: number;
  examNumbers?: number[];
  taskTypes?: ExamTaskType[];
  verificationMethods?: SkillVerificationMethod[];
  isFoundational?: boolean;
  sourceCoverage?: SourceCoverage;
  needsExpertReview?: boolean;
  expertReviewNote?: string;
  required?: Array<string | SkillDependencySeed>;
  recommended?: Array<string | SkillDependencySeed>;
};

export type SkillDefaults = Required<
  Pick<
    SkillSeed,
    | 'difficulty'
    | 'importance'
    | 'estimatedMinutes'
    | 'examNumbers'
    | 'taskTypes'
    | 'verificationMethods'
    | 'isFoundational'
    | 'sourceCoverage'
  >
>;

export type KnowledgeSubtopicSeed = {
  code: string;
  name: string;
  description: string;
  defaults: SkillDefaults;
  skills: SkillSeed[];
};

export type KnowledgeTopicSeed = {
  code: string;
  name: string;
  description: string;
  subtopics: KnowledgeSubtopicSeed[];
};

export type KnowledgeSectionSeed = {
  code: string;
  name: string;
  description: string;
  topics: KnowledgeTopicSeed[];
};

export type MaterialSegmentSeed = {
  pages: number[];
  title: string;
  skillCodes: string[];
  notes?: string;
  needsExpertReview?: boolean;
};

export type LearningMaterialSeed = {
  fileName: string;
  title: string;
  pageCount: number;
  segments: MaterialSegmentSeed[];
};

export type CoverageGapSeed = {
  code: string;
  title: string;
  description: string;
  affectedSkillCodes: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type ExpertReviewItemSeed = {
  code: string;
  title: string;
  description: string;
  affectedSkillCodes: string[];
};

export type ExternalReferenceSeed = {
  title: string;
  url: string;
  purpose: string;
};

export type KnowledgeMapSeed = {
  subjectCode: string;
  version: number;
  title: string;
  description: string;
  sourceSummary: string;
  sections: KnowledgeSectionSeed[];
  materials: LearningMaterialSeed[];
  coverageGaps: CoverageGapSeed[];
  expertReviewItems: ExpertReviewItemSeed[];
  externalReferences: ExternalReferenceSeed[];
};

export type ResolvedSkillSeed = Omit<
  SkillSeed,
  | 'difficulty'
  | 'importance'
  | 'estimatedMinutes'
  | 'examNumbers'
  | 'taskTypes'
  | 'verificationMethods'
  | 'isFoundational'
  | 'sourceCoverage'
> &
  SkillDefaults & {
    sectionCode: string;
    topicCode: string;
    subtopicCode: string;
    sortOrder: number;
  };

export type KnowledgeMapCatalogSummary = {
  sections: number;
  topics: number;
  subtopics: number;
  skills: number;
  requiredDependencies: number;
  recommendedDependencies: number;
  materials: number;
  materialSegments: number;
  coverageGaps: number;
  expertReviewItems: number;
};

const resolveDependency = (
  dependency: string | SkillDependencySeed,
): SkillDependencySeed =>
  typeof dependency === 'string' ? { code: dependency } : dependency;

export const resolveKnowledgeMapSkills = (
  catalog: KnowledgeMapSeed,
): ResolvedSkillSeed[] =>
  catalog.sections.flatMap((section) =>
    section.topics.flatMap((topic) =>
      topic.subtopics.flatMap((subtopic) =>
        subtopic.skills.map((skill, index) => ({
          ...subtopic.defaults,
          ...skill,
          examNumbers: skill.examNumbers ?? subtopic.defaults.examNumbers,
          taskTypes: skill.taskTypes ?? subtopic.defaults.taskTypes,
          verificationMethods:
            skill.verificationMethods ?? subtopic.defaults.verificationMethods,
          sectionCode: section.code,
          topicCode: topic.code,
          subtopicCode: subtopic.code,
          sortOrder: index + 1,
        })),
      ),
    ),
  );

export const validateKnowledgeMapCatalog = (
  catalog: KnowledgeMapSeed,
): KnowledgeMapCatalogSummary => {
  const hierarchyCodes = new Set<string>();
  const resolvedSkills = resolveKnowledgeMapSkills(catalog);
  const skillCodes = new Set(resolvedSkills.map((skill) => skill.code));

  const registerCode = (code: string, kind: string) => {
    if (hierarchyCodes.has(code)) {
      throw new Error(`Duplicate ${kind} code: ${code}`);
    }

    hierarchyCodes.add(code);
  };

  for (const section of catalog.sections) {
    registerCode(section.code, 'section');

    for (const topic of section.topics) {
      registerCode(topic.code, 'topic');

      for (const subtopic of topic.subtopics) {
        registerCode(subtopic.code, 'subtopic');

        for (const skill of subtopic.skills) {
          registerCode(skill.code, 'skill');
        }
      }
    }
  }

  const requiredGraph = new Map<string, string[]>();
  let requiredDependencies = 0;
  let recommendedDependencies = 0;

  for (const skill of resolvedSkills) {
    if (skill.difficulty < 1 || skill.difficulty > 5) {
      throw new Error(`Invalid difficulty for ${skill.code}`);
    }

    if (skill.importance < 1 || skill.importance > 5) {
      throw new Error(`Invalid importance for ${skill.code}`);
    }

    if (skill.estimatedMinutes < 10) {
      throw new Error(`Invalid estimated time for ${skill.code}`);
    }

    if (
      skill.examNumbers.some((examNumber) => examNumber < 1 || examNumber > 19)
    ) {
      throw new Error(`Invalid exam number for ${skill.code}`);
    }

    const required = (skill.required ?? []).map(resolveDependency);
    const recommended = (skill.recommended ?? []).map(resolveDependency);
    const allDependencies = [...required, ...recommended];

    for (const dependency of allDependencies) {
      if (!skillCodes.has(dependency.code)) {
        throw new Error(
          `Unknown dependency ${dependency.code} for ${skill.code}`,
        );
      }

      if (dependency.code === skill.code) {
        throw new Error(`Self dependency for ${skill.code}`);
      }
    }

    requiredGraph.set(
      skill.code,
      required.map((dependency) => dependency.code),
    );
    requiredDependencies += required.length;
    recommendedDependencies += recommended.length;
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visitRequiredDependencies = (skillCode: string, path: string[]) => {
    if (visiting.has(skillCode)) {
      throw new Error(
        `Required dependency cycle: ${[...path, skillCode].join(' -> ')}`,
      );
    }

    if (visited.has(skillCode)) {
      return;
    }

    visiting.add(skillCode);

    for (const prerequisiteCode of requiredGraph.get(skillCode) ?? []) {
      visitRequiredDependencies(prerequisiteCode, [...path, skillCode]);
    }

    visiting.delete(skillCode);
    visited.add(skillCode);
  };

  for (const skillCode of skillCodes) {
    visitRequiredDependencies(skillCode, []);
  }

  for (const material of catalog.materials) {
    for (const segment of material.segments) {
      if (
        segment.pages.length === 0 ||
        segment.pages.some((page) => page < 1 || page > material.pageCount)
      ) {
        throw new Error(`Invalid page mapping in ${material.fileName}`);
      }

      for (const skillCode of segment.skillCodes) {
        if (!skillCodes.has(skillCode)) {
          throw new Error(
            `Unknown material skill ${skillCode} in ${material.fileName}`,
          );
        }
      }
    }
  }

  for (const item of [...catalog.coverageGaps, ...catalog.expertReviewItems]) {
    for (const skillCode of item.affectedSkillCodes) {
      if (!skillCodes.has(skillCode)) {
        throw new Error(`Unknown review skill ${skillCode} in ${item.code}`);
      }
    }
  }

  return {
    sections: catalog.sections.length,
    topics: catalog.sections.reduce(
      (sum, section) => sum + section.topics.length,
      0,
    ),
    subtopics: catalog.sections.reduce(
      (sum, section) =>
        sum +
        section.topics.reduce(
          (topicSum, topic) => topicSum + topic.subtopics.length,
          0,
        ),
      0,
    ),
    skills: resolvedSkills.length,
    requiredDependencies,
    recommendedDependencies,
    materials: catalog.materials.length,
    materialSegments: catalog.materials.reduce(
      (sum, material) => sum + material.segments.length,
      0,
    ),
    coverageGaps: catalog.coverageGaps.length,
    expertReviewItems: catalog.expertReviewItems.length,
  };
};

export const normalizeDependency = resolveDependency;
