import { calculateInitialProfile } from './profile-calculator';

describe('calculateInitialProfile', () => {
  it('оставляет навык неизвестным по одному результату', () => {
    const [state] = calculateInitialProfile(
      ['skill'],
      [
        {
          skillCode: 'skill',
          source: 'FULL_EXAM',
          score: 1,
          weight: 1,
          independenceKey: 'task-1',
          occurredAt: new Date('2026-07-25T10:00:00Z'),
        },
      ],
    );

    expect(state.status).toBe('UNKNOWN');
    expect(state.confidence).toBeLessThan(0.55);
  });

  it('выводит пробел только по нескольким независимым подтверждениям', () => {
    const [state] = calculateInitialProfile(
      ['skill'],
      ['FULL_EXAM', 'ADAPTIVE_TASK', 'THEORY_QUESTION'].map(
        (source, index) => ({
          skillCode: 'skill',
          source: source as 'FULL_EXAM' | 'ADAPTIVE_TASK' | 'THEORY_QUESTION',
          score: 0,
          weight: 1,
          independenceKey: `item-${index}`,
          occurredAt: new Date(`2026-07-25T10:0${index}:00Z`),
        }),
      ),
    );

    expect(state.status).toBe('GAP');
    expect(state.confidence).toBeGreaterThanOrEqual(0.55);
  });

  it('не смешивает «не изучал» с измеренным незнанием', () => {
    const [state] = calculateInitialProfile(
      ['skill'],
      [
        {
          skillCode: 'skill',
          source: 'SELF_REPORT',
          score: 0,
          weight: 0.1,
          independenceKey: 'self-report',
          occurredAt: new Date('2026-07-25T10:00:00Z'),
        },
      ],
    );

    expect(state).toEqual(
      expect.objectContaining({
        status: 'UNSTUDIED',
        confidence: 0,
        evidenceCount: 0,
      }),
    );
  });
});
