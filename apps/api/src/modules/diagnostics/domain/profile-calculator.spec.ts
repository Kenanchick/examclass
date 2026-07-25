import {
  calculateKnowledgeProfile,
  type ProfileEvidence,
} from './profile-calculator';

const asOf = new Date('2026-07-25T12:00:00Z');
const attempt = (
  overrides: Partial<ProfileEvidence> &
    Pick<ProfileEvidence, 'independenceKey'>,
): ProfileEvidence => ({
  skillCode: 'skill',
  source: 'ADAPTIVE_TASK',
  score: 1,
  weight: 1,
  occurredAt: new Date('2026-07-20T12:00:00Z'),
  difficulty: 2,
  skillRole: 'PRIMARY',
  independence: 'INDEPENDENT',
  activeSeconds: 120,
  expectedSeconds: 180,
  selfConfidence: 4,
  ...overrides,
});

const calculate = (evidence: ProfileEvidence[]) =>
  calculateKnowledgeProfile({
    skillCodes: ['skill'],
    evidence,
    asOf,
  })[0];

describe('calculateKnowledgeProfile', () => {
  it('не делает вывод по одному правильному ответу', () => {
    const state = calculate([attempt({ independenceKey: 'one' })]);

    expect(state.status).toBe('INSUFFICIENT_DATA');
    expect(state.distinctEvidenceCount).toBe(1);
    expect(state.speed).not.toBeNull();
    expect(state.stability).toBeNull();
    expect(state.explanation.averageFactors.baseSkillWeight).toBe(1);
    expect(state.explanation.roleSummary.PRIMARY).toBe(1);
  });

  it('отделяет «не изучалось» от измеренного слабого навыка', () => {
    const state = calculate([
      attempt({
        independenceKey: 'self-report',
        source: 'SELF_REPORT',
        score: 0,
        weight: 0.1,
      }),
    ]);

    expect(state.status).toBe('UNSTUDIED');
    expect(state.evidenceCount).toBe(0);
    expect(state.sourceSummary.SELF_REPORT).toEqual(
      expect.objectContaining({ attempts: 1, effectiveWeight: 0 }),
    );
  });

  it('помечает подтверждённую серию ошибок как слабый навык', () => {
    const state = calculate(
      ['exam', 'adaptive', 'theory', 'control'].map((key, index) =>
        attempt({
          independenceKey: key,
          source:
            index === 0
              ? 'FULL_EXAM'
              : index === 2
                ? 'THEORY_QUESTION'
                : 'ADAPTIVE_TASK',
          score: index === 3 ? 0.2 : 0,
          selfConfidence: 4,
          errorType: 'CONCEPTUAL',
        }),
      ),
    );

    expect(state.status).toBe('WEAK');
    expect(state.contradictingAttempts).toBe(4);
    expect(state.confidence).toBeGreaterThanOrEqual(0.45);
  });

  it('считает устойчивый независимый результат освоенным', () => {
    const state = calculate(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((key, index) =>
        attempt({
          independenceKey: key,
          source: index % 2 === 0 ? 'MOCK_EXAM' : 'ADAPTIVE_TASK',
          difficulty: index % 3 === 0 ? 3 : 2,
          activeSeconds: 130 + index * 5,
        }),
      ),
    );

    expect(state.status).toBe('MASTERED');
    expect(state.mastery).toBeGreaterThanOrEqual(0.8);
    expect(state.stability).toBeGreaterThanOrEqual(0.7);
    expect(state.confirmingAttempts).toBe(6);
  });

  it('отправляет противоречивый результат на закрепление', () => {
    const state = calculate(
      [1, 1, 0, 1, 0.8].map((score, index) =>
        attempt({
          independenceKey: `mixed-${index}`,
          score,
          source: index % 2 === 0 ? 'FULL_EXAM' : 'ADAPTIVE_TASK',
        }),
      ),
    );

    expect(state.status).toBe('NEEDS_REINFORCEMENT');
    expect(state.stability).toBeLessThan(0.7);
    expect(state.confirmingAttempts).toBe(4);
    expect(state.contradictingAttempts).toBe(1);
  });

  it('отправляет ранее освоенный навык на повторение по давности', () => {
    const oldDate = new Date('2025-12-01T12:00:00Z');
    const state = calculate(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((key) =>
        attempt({
          independenceKey: key,
          occurredAt: oldDate,
          source: 'MOCK_EXAM',
        }),
      ),
    );

    expect(state.status).toBe('NEEDS_REVIEW');
    expect(state.needsReview).toBe(true);
    expect(state.reviewDueAt).toBeInstanceOf(Date);
  });

  it('учитывает свежее подтверждение преподавателя', () => {
    const state = calculate([
      attempt({ independenceKey: 'exam', source: 'FULL_EXAM' }),
      attempt({ independenceKey: 'adaptive', source: 'ADAPTIVE_TASK' }),
      attempt({
        independenceKey: 'teacher',
        source: 'MANUAL_REVIEW',
        teacherConfirmed: true,
      }),
    ]);

    expect(state.status).toBe('TEACHER_CONFIRMED');
    expect(state.teacherConfirmedAt).toEqual(new Date('2026-07-20T12:00:00Z'));
    expect(state.explanation.reasons).toContain(
      'Результат недавно подтверждён преподавателем',
    );
  });

  it('понижает вес результата с существенной помощью', () => {
    const independent = calculate(
      ['a', 'b', 'c'].map((key) => attempt({ independenceKey: key })),
    );
    const helped = calculate(
      ['a', 'b', 'c'].map((key) =>
        attempt({ independenceKey: key, independence: 'MAJOR_HELP' }),
      ),
    );

    expect(helped.mastery).toBeLessThan(independent.mastery);
    expect(helped.confidence).toBeLessThan(independent.confidence);
  });
});
