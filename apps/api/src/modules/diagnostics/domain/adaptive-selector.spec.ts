import { selectNextAdaptiveCandidate } from './adaptive-selector';

describe('selectNextAdaptiveCandidate', () => {
  const hypotheses = [
    {
      key: 'prerequisite:trig.unit-circle',
      type: 'PREREQUISITE_GAP' as const,
      skillCode: 'trig.unit-circle',
      confidence: 0.55,
      priority: 0.9,
    },
    {
      key: 'skill:equation.trig-transform',
      type: 'SKILL_GAP' as const,
      skillCode: 'equation.trig-transform',
      confidence: 0.6,
      priority: 0.7,
    },
  ];

  const candidates = [
    {
      id: 'circle',
      kind: 'THEORY_CHOICE' as const,
      targetSkillCode: 'trig.unit-circle',
      hypothesisType: 'PREREQUISITE_GAP' as const,
      difficulty: 2,
      estimatedSeconds: 60,
      importance: 5,
    },
    {
      id: 'transform',
      kind: 'ADAPTIVE_TASK' as const,
      targetSkillCode: 'equation.trig-transform',
      hypothesisType: 'SKILL_GAP' as const,
      difficulty: 3,
      estimatedSeconds: 240,
      importance: 5,
    },
  ];

  it('сначала проверяет фундаментальную причину ошибки', () => {
    expect(
      selectNextAdaptiveCandidate(hypotheses, candidates, {
        answeredCandidateIds: [],
        questionsBySkill: {},
        selectedTotal: 0,
        selectedTheory: 0,
      }),
    ).toEqual(expect.objectContaining({ candidate: candidates[0] }));
  });

  it('соблюдает лимит вопросов по одному навыку', () => {
    expect(
      selectNextAdaptiveCandidate(hypotheses, candidates, {
        answeredCandidateIds: [],
        questionsBySkill: { 'trig.unit-circle': 2 },
        selectedTotal: 2,
        selectedTheory: 1,
      }),
    ).toEqual(expect.objectContaining({ candidate: candidates[1] }));
  });
});
