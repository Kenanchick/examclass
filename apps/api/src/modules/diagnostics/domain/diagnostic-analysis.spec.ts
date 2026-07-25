import { analyzeAttempt } from './diagnostic-analysis';

const skillLinks = [
  { skillCode: 'equation.trig-transform', role: 'PRIMARY' as const, weight: 1 },
  {
    skillCode: 'trig.unit-circle',
    role: 'PREREQUISITE' as const,
    weight: 0.8,
  },
];

describe('analyzeAttempt', () => {
  it('после недостигнутого задания предлагает проверку навыка без общего таймера', () => {
    const result = analyzeAttempt({
      itemKey: 'task-19',
      source: 'FULL_EXAM',
      outcome: 'NOT_REACHED',
      activeSeconds: 0,
      expectedSeconds: 1_200,
      remainingSessionSeconds: 0,
      skillLinks: [
        {
          skillCode: 'ALG.PARAM.MODEL',
          role: 'PRIMARY',
          weight: 1,
        },
      ],
    });

    expect(result.evidence).toHaveLength(0);
    expect(result.hypotheses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'time:ALG.PARAM.MODEL',
          type: 'TIME_PRESSURE',
        }),
      ]),
    );
  });

  it('не создаёт отрицательное evidence для задания, не достигнутого из-за времени', () => {
    const result = analyzeAttempt({
      itemKey: 'exam-13',
      source: 'FULL_EXAM',
      outcome: 'NOT_REACHED',
      activeSeconds: 0,
      expectedSeconds: 1_200,
      remainingSessionSeconds: 0,
      skillLinks,
    });

    expect(result.evidence).toHaveLength(0);
    expect(result.hypotheses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'TIME_PRESSURE', skillCode: null }),
      ]),
    );
  });

  it('снижает вес возможного угадывания и назначает уточнение', () => {
    const result = analyzeAttempt({
      itemKey: 'exam-13',
      source: 'FULL_EXAM',
      outcome: 'CORRECT',
      activeSeconds: 30,
      expectedSeconds: 1_200,
      remainingSessionSeconds: 2_000,
      confidence: 1,
      hasVisibleWork: false,
      skillLinks,
    });

    expect(result.evidence[0].weight).toBeCloseTo(0.35);
    expect(result.hypotheses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'POSSIBLE_GUESS',
          skillCode: 'equation.trig-transform',
        }),
      ]),
    );
  });

  it('отделяет самооценку «не изучал» от доказательства ошибки', () => {
    const result = analyzeAttempt({
      itemKey: 'exam-13',
      source: 'FULL_EXAM',
      outcome: 'UNSTUDIED',
      activeSeconds: 10,
      expectedSeconds: 1_200,
      remainingSessionSeconds: 2_000,
      skillLinks,
    });

    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ source: 'SELF_REPORT', weight: 0.1 }),
    );
    expect(result.hypotheses[0].type).toBe('UNSTUDIED');
  });

  it('учитывает частичное решение по доле баллов', () => {
    const result = analyzeAttempt({
      itemKey: 'exam-13',
      source: 'MANUAL_REVIEW',
      outcome: 'PARTIAL',
      activeSeconds: 900,
      expectedSeconds: 1_200,
      remainingSessionSeconds: 2_000,
      scoreRatio: 0.6,
      hasVisibleWork: true,
      skillLinks,
    });

    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ score: 0.6, weight: 1 }),
    );
  });

  it('подтверждает вычислительную причину только по результату проверки', () => {
    const result = analyzeAttempt({
      itemKey: 'exam-13',
      source: 'MANUAL_REVIEW',
      outcome: 'PARTIAL',
      activeSeconds: 900,
      expectedSeconds: 1_200,
      remainingSessionSeconds: 2_000,
      scoreRatio: 0.8,
      reviewErrorType: 'COMPUTATION',
      hasVisibleWork: true,
      skillLinks,
    });

    expect(result.hypotheses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'COMPUTATION_ERROR',
          confidence: 0.95,
        }),
      ]),
    );
  });
});
