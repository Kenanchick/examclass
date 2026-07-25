export const EXAM_ROADMAP_TITLES: Record<number, string> = {
  1: 'Планиметрия',
  2: 'Векторы',
  3: 'Стереометрия',
  4: 'Начала теории вероятностей',
  5: 'Вероятности сложных событий',
  6: 'Простейшие уравнения',
  7: 'Вычисления и преобразования',
  8: 'Производная и первообразная',
  9: 'Задачи с прикладным содержанием',
  10: 'Текстовые задачи',
  11: 'Графики функций',
  12: 'Наибольшее и наименьшее значение функций',
  13: 'Уравнения',
  14: 'Стереометрическая задача',
  15: 'Неравенства',
  16: 'Финансовая математика',
  17: 'Планиметрическая задача',
  18: 'Задача с параметром',
  19: 'Числа и их свойства',
};

export const EXAM_ROADMAP_CONNECTIONS = [
  [1, 17],
  [2, 14],
  [3, 14],
  [4, 5],
  [6, 13],
  [7, 6],
  [7, 12],
  [7, 13],
  [7, 15],
  [7, 18],
  [7, 19],
  [8, 12],
  [9, 10],
  [9, 16],
  [11, 12],
  [11, 18],
  [13, 15],
  [13, 18],
  [14, 17],
  [15, 18],
  [16, 18],
  [17, 19],
  [18, 19],
] as const;

export type ExamRoadmapStatus =
  | 'MASTERED'
  | 'LEARNING'
  | 'CURRENT_PRIORITY'
  | 'AVAILABLE'
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'INSUFFICIENT_DATA'
  | 'TEACHER_ASSIGNED';

type RoadmapStatusInput = {
  mastery: number;
  confidence: number;
  isCurrent: boolean;
  isTeacherAssigned: boolean;
  needsReview: boolean;
  hasBlockingPrerequisite: boolean;
};

export const resolveExamRoadmapStatus = ({
  mastery,
  confidence,
  isCurrent,
  isTeacherAssigned,
  needsReview,
  hasBlockingPrerequisite,
}: RoadmapStatusInput): ExamRoadmapStatus => {
  if (isTeacherAssigned) return 'TEACHER_ASSIGNED';
  if (isCurrent) return 'CURRENT_PRIORITY';
  if (needsReview) return 'NEEDS_REVIEW';
  if (mastery >= 0.8 && confidence >= 0.62) return 'MASTERED';
  if (confidence < 0.3) return 'INSUFFICIENT_DATA';
  if (hasBlockingPrerequisite) return 'BLOCKED';
  if (mastery < 0.68) return 'LEARNING';
  return 'AVAILABLE';
};

export const getExamPart = (examNumber: number) =>
  examNumber <= 12 ? 'Краткий ответ' : 'Развёрнутое решение';
