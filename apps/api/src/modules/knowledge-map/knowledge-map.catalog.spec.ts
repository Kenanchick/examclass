import {
  resolveKnowledgeMapSkills,
  validateKnowledgeMapCatalog,
} from '../../../prisma/knowledge-map.catalog';
import { profileMathKnowledgeMap } from '../../../prisma/knowledge-map.data';

describe('profileMathKnowledgeMap', () => {
  const skills = resolveKnowledgeMapSkills(profileMathKnowledgeMap);

  it('содержит полную четырёхуровневую карту и проходит проверку целостности', () => {
    expect(validateKnowledgeMapCatalog(profileMathKnowledgeMap)).toEqual({
      sections: 9,
      topics: 19,
      subtopics: 42,
      skills: 195,
      requiredDependencies: 281,
      recommendedDependencies: 17,
      materials: 18,
      materialSegments: 42,
      coverageGaps: 9,
      expertReviewItems: 6,
    });
  });

  it('содержит полную карту задания №1 по планиметрии', () => {
    const planimetryTopic = profileMathKnowledgeMap.sections
      .flatMap((section) => section.topics)
      .find((topic) => topic.code === 'topic.ege01-planimetry');

    expect(planimetryTopic?.subtopics).toHaveLength(8);
    expect(
      planimetryTopic?.subtopics.reduce(
        (total, subtopic) => total + subtopic.skills.length,
        0,
      ),
    ).toBe(45);
    expect(
      skills.filter((skill) => skill.examNumbers.includes(1)),
    ).toHaveLength(45);
  });

  it('покрывает все номера профильного ЕГЭ', () => {
    const coveredExamNumbers = new Set(
      skills.flatMap((skill) => skill.examNumbers),
    );

    expect([...coveredExamNumbers].sort((left, right) => left - right)).toEqual(
      Array.from({ length: 19 }, (_, index) => index + 1),
    );
  });

  it('задаёт проверяемую метаинформацию для каждого навыка', () => {
    for (const skill of skills) {
      expect(skill.description.length).toBeGreaterThan(20);
      expect(skill.difficulty).toBeGreaterThanOrEqual(1);
      expect(skill.difficulty).toBeLessThanOrEqual(5);
      expect(skill.importance).toBeGreaterThanOrEqual(1);
      expect(skill.importance).toBeLessThanOrEqual(5);
      expect(skill.estimatedMinutes).toBeGreaterThanOrEqual(10);
      expect(skill.examNumbers.length).toBeGreaterThan(0);
      expect(skill.verificationMethods.length).toBeGreaterThan(0);
      expect(skill.taskTypes.length).toBeGreaterThan(0);
    }
  });

  it('не подменяет проверяемые навыки крупными названиями тем', () => {
    const broadTopicNames = new Set([
      'Алгебра',
      'Геометрия',
      'Планиметрия',
      'Стереометрия',
      'Тригонометрия',
      'Теория вероятностей',
      'Функции',
    ]);

    expect(
      skills.filter((skill) => broadTopicNames.has(skill.name)),
    ).toHaveLength(0);
  });
});
