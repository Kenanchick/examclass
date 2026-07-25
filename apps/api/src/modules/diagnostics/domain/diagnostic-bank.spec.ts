import {
  diagnosticQuestionTemplates,
  diagnosticTaskSkillMappings,
} from '../../../../prisma/diagnostic-bank.data';
import { resolveKnowledgeMapSkills } from '../../../../prisma/knowledge-map.catalog';
import { profileMathKnowledgeMap } from '../../../../prisma/knowledge-map.data';

describe('diagnostic bank metadata', () => {
  const skillCodes = new Set(
    resolveKnowledgeMapSkills(profileMathKnowledgeMap).map(
      (skill) => skill.code,
    ),
  );

  it('ссылается только на навыки рабочей карты знаний', () => {
    const referencedCodes = [
      ...diagnosticTaskSkillMappings.flatMap((mapping) => [
        ...mapping.primary,
        ...(mapping.secondary ?? []),
        ...(mapping.prerequisite ?? []),
      ]),
      ...diagnosticQuestionTemplates.map(
        (template) => template.targetSkillCode,
      ),
    ];

    expect(referencedCodes.filter((code) => !skillCodes.has(code))).toEqual([]);
  });

  it('содержит разметку задач для каждого номера ЕГЭ', () => {
    const coveredNumbers = new Set(
      diagnosticTaskSkillMappings.map((mapping) =>
        Number(mapping.topicSlug.slice(4, 6)),
      ),
    );

    expect([...coveredNumbers].sort((left, right) => left - right)).toEqual(
      Array.from({ length: 19 }, (_, index) => index + 1),
    );
  });

  it('проверяет тригонометрическую ошибку по отдельным причинам', () => {
    const trigSkills = new Set(
      diagnosticQuestionTemplates
        .filter((template) => template.code.startsWith('probe.trig.'))
        .map((template) => template.targetSkillCode),
    );

    expect(trigSkills).toEqual(
      new Set([
        'trig.angle-measure',
        'trig.unit-circle',
        'trig.basic-identities',
        'trig.reduction-formulas',
        'trig.double-half-angle',
        'equation.trig-elementary',
        'equation.trig-transform',
        'equation.trig-root-selection',
      ]),
    );
  });

  it('содержит правильный ответ среди вариантов выбора', () => {
    for (const template of diagnosticQuestionTemplates) {
      if (template.answerOptions) {
        expect(template.answerOptions).toContain(template.correctAnswer);
      }
    }
  });
});
