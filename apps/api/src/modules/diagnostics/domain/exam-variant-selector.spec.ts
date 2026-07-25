import { selectFullExamVariant } from './exam-variant-selector';

describe('selectFullExamVariant', () => {
  const candidates = Array.from({ length: 19 }, (_, index) => [
    {
      id: `${index + 1}-a`,
      publicId: `TASK-${index + 1}-A`,
      examNumber: index + 1,
      difficulty: 1,
    },
    {
      id: `${index + 1}-b`,
      publicId: `TASK-${index + 1}-B`,
      examNumber: index + 1,
      difficulty: 2,
    },
  ]).flat();

  it('собирает ровно по одной задаче каждого номера', () => {
    const variant = selectFullExamVariant(candidates, 'student-session');

    expect(variant).toHaveLength(19);
    expect(variant.map((task) => task.examNumber)).toEqual(
      Array.from({ length: 19 }, (_, index) => index + 1),
    );
  });

  it('даёт воспроизводимый вариант для одного seed', () => {
    expect(selectFullExamVariant(candidates, 'same')).toEqual(
      selectFullExamVariant(candidates, 'same'),
    );
  });

  it('останавливается, если банк неполон', () => {
    expect(() =>
      selectFullExamVariant(
        candidates.filter((task) => task.examNumber !== 7),
        'student-session',
      ),
    ).toThrow('Нет диагностической задачи №7');
  });
});
