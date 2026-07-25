import { EXAM_ROADMAP_TITLES, resolveExamRoadmapStatus } from './exam-roadmap';

describe('exam roadmap', () => {
  it('contains all nineteen human-readable exam tasks', () => {
    expect(Object.keys(EXAM_ROADMAP_TITLES)).toHaveLength(19);
    expect(EXAM_ROADMAP_TITLES[1]).toBe('Планиметрия');
    expect(EXAM_ROADMAP_TITLES[19]).toBe('Числа и их свойства');
    expect(Object.values(EXAM_ROADMAP_TITLES)).not.toContain(
      'number.types-order',
    );
  });

  it('keeps teacher assignment and current priority visible', () => {
    expect(
      resolveExamRoadmapStatus({
        mastery: 0.9,
        confidence: 0.9,
        isCurrent: true,
        isTeacherAssigned: false,
        needsReview: false,
        hasBlockingPrerequisite: false,
      }),
    ).toBe('CURRENT_PRIORITY');
    expect(
      resolveExamRoadmapStatus({
        mastery: 0.9,
        confidence: 0.9,
        isCurrent: true,
        isTeacherAssigned: true,
        needsReview: false,
        hasBlockingPrerequisite: false,
      }),
    ).toBe('TEACHER_ASSIGNED');
  });

  it('does not mark uncertain results as mastered', () => {
    expect(
      resolveExamRoadmapStatus({
        mastery: 0.95,
        confidence: 0.2,
        isCurrent: false,
        isTeacherAssigned: false,
        needsReview: false,
        hasBlockingPrerequisite: false,
      }),
    ).toBe('INSUFFICIENT_DATA');
  });
});
