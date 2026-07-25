import { getEffectiveSkillStatus } from './teacher-skill-state';

describe('getEffectiveSkillStatus', () => {
  it('не подменяет освоение отметкой о прохождении темы', () => {
    expect(
      getEffectiveSkillStatus('WEAK', {
        autoStatusEnabled: true,
        manualStatus: null,
        instructionStatus: 'TAUGHT',
      }),
    ).toBe('WEAK');
  });

  it('применяет зафиксированный преподавателем статус', () => {
    expect(
      getEffectiveSkillStatus('WEAK', {
        autoStatusEnabled: false,
        manualStatus: 'NEEDS_REINFORCEMENT',
      }),
    ).toBe('NEEDS_REINFORCEMENT');
  });

  it('возвращает автоматический статус после включения автоматики', () => {
    expect(
      getEffectiveSkillStatus('MASTERED', {
        autoStatusEnabled: true,
        manualStatus: 'WEAK',
      }),
    ).toBe('MASTERED');
  });

  it('ставит навык на повторение отдельно от уровня владения', () => {
    expect(
      getEffectiveSkillStatus('MASTERED', {
        autoStatusEnabled: true,
        manualStatus: null,
        reviewScheduledAt: new Date('2026-08-01T00:00:00Z'),
      }),
    ).toBe('NEEDS_REVIEW');
  });
});
