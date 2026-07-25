import { reconcileHypothesisStatus } from './hypothesis-reconciliation';

const sourceEvidence = {
  assessmentItemId: 'source',
  score: 1,
  weight: 0.35,
  independenceKey: 'source:skill',
  source: 'FULL_EXAM',
};

describe('reconcileHypothesisStatus', () => {
  it('не снимает гипотезу угадывания исходным ответом', () => {
    expect(
      reconcileHypothesisStatus({
        type: 'POSSIBLE_GUESS',
        sourceItemId: 'source',
        evidence: [sourceEvidence],
      }),
    ).toBe('OPEN');
  });

  it('снимает гипотезу угадывания после независимого успеха', () => {
    expect(
      reconcileHypothesisStatus({
        type: 'POSSIBLE_GUESS',
        sourceItemId: 'source',
        evidence: [
          sourceEvidence,
          {
            assessmentItemId: 'follow-up',
            score: 1,
            weight: 1,
            independenceKey: 'follow-up:skill',
            source: 'ADAPTIVE_TASK',
          },
        ],
      }),
    ).toBe('REJECTED');
  });

  it('подтверждает нехватку времени при успехе без общего таймера', () => {
    expect(
      reconcileHypothesisStatus({
        type: 'TIME_PRESSURE',
        sourceItemId: 'source',
        evidence: [
          {
            assessmentItemId: 'follow-up',
            score: 1,
            weight: 1,
            independenceKey: 'follow-up:skill',
            source: 'ADAPTIVE_TASK',
          },
        ],
      }),
    ).toBe('CONFIRMED');
  });
});
