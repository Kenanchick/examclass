import { buildLearningRoute } from './route-planner';
import type {
  BuildLearningRouteInput,
  RouteSkill,
  RouteSkillState,
} from './route-types';

const asOf = new Date('2026-07-25T12:00:00Z');
const examDate = new Date('2027-06-01T09:00:00Z');

const state = (overrides: Partial<RouteSkillState> = {}): RouteSkillState => ({
  mastery: 0.35,
  confidence: 0.75,
  stability: 0.4,
  distinctEvidenceCount: 4,
  status: 'WEAK',
  needsReview: false,
  lastVerifiedAt: new Date('2026-07-20T12:00:00Z'),
  ...overrides,
});

const skill = (
  code: string,
  overrides: Partial<RouteSkill> = {},
): RouteSkill => ({
  id: `id-${code}`,
  code,
  name: code,
  moduleId: `module-${code}`,
  moduleCode: `module-${code}`,
  moduleName: `Модуль ${code}`,
  topicName: 'Профильная математика',
  difficulty: 2,
  importance: 4,
  estimatedMinutes: 90,
  isFoundational: false,
  examMappings: [{ examNumber: 6, examPart: 'FIRST', weight: 1 }],
  state: state(),
  ...overrides,
});

const build = (
  skills: RouteSkill[],
  overrides: Partial<BuildLearningRouteInput> = {},
) =>
  buildLearningRoute({
    skills,
    dependencies: [],
    goal: { targetScore: 80, examDate, weeklyMinutes: 360 },
    asOf,
    ...overrides,
  });

const findSkillModule = (
  route: ReturnType<typeof buildLearningRoute>,
  code: string,
) =>
  route.modules.find((module) =>
    module.skills.some((item) => item.skillCode === code),
  );

describe('buildLearningRoute', () => {
  it('ставит базовую арифметику раньше сложной назначенной темы', () => {
    const arithmetic = skill('number.arithmetic', {
      isFoundational: true,
      importance: 5,
    });
    const fractions = skill('number.fractions', { isFoundational: true });
    const logarithms = skill('equation.logarithmic', {
      difficulty: 3,
      examMappings: [{ examNumber: 13, examPart: 'SECOND', weight: 1 }],
    });
    const route = build([arithmetic, fractions, logarithms], {
      dependencies: [
        {
          skillCode: fractions.code,
          prerequisiteCode: arithmetic.code,
          type: 'REQUIRED',
        },
        {
          skillCode: logarithms.code,
          prerequisiteCode: fractions.code,
          type: 'REQUIRED',
        },
      ],
      teacherAssignments: [
        {
          skillCode: logarithms.code,
          assignmentId: 'HW-LOG',
          title: 'Логарифмы',
        },
      ],
    });
    const arithmeticModule = findSkillModule(route, arithmetic.code)!;
    const fractionsModule = findSkillModule(route, fractions.code)!;
    const logarithmsModule = findSkillModule(route, logarithms.code)!;

    expect(arithmeticModule.position).toBeLessThan(fractionsModule.position);
    expect(fractionsModule.position).toBeLessThan(logarithmsModule.position);
    expect(logarithmsModule.status).toBe('BLOCKED');
    expect(logarithmsModule.blockedBySkillCodes).toContain(fractions.code);
  });

  it('не возвращает освоенную первую часть и выбирает пробелы второй', () => {
    const firstPart = skill('first-part', {
      state: state({
        mastery: 0.9,
        confidence: 0.9,
        stability: 0.85,
        status: 'MASTERED',
      }),
    });
    const secondPart = skill('second-part', {
      examMappings: [{ examNumber: 15, examPart: 'SECOND', weight: 1 }],
    });
    const route = build([firstPart, secondPart], {
      goal: { targetScore: 90, examDate, weeklyMinutes: 360 },
    });

    expect(findSkillModule(route, firstPart.code)).toBeUndefined();
    expect(findSkillModule(route, secondPart.code)).toBeDefined();
  });

  it('назначает контроль сильному, но нестабильному ученику', () => {
    const unstable = skill('unstable', {
      state: state({
        mastery: 0.84,
        confidence: 0.88,
        stability: 0.3,
        status: 'NEEDS_REINFORCEMENT',
      }),
    });

    expect(findSkillModule(build([unstable]), unstable.code)?.type).toBe(
      'CONTROL',
    );
  });

  it('отправляет явно не изученную программу в освоение', () => {
    const unstudied = skill('unstudied', {
      state: state({
        mastery: 0.5,
        confidence: 0,
        stability: null,
        distinctEvidenceCount: 0,
        status: 'UNSTUDIED',
        lastVerifiedAt: null,
      }),
    });

    expect(findSkillModule(build([unstudied]), unstudied.code)?.type).toBe(
      'REQUIRED',
    );
  });

  it('для цели около 70 баллов выше ставит первую часть', () => {
    const firstPart = skill('target-70-first');
    const secondPart = skill('target-70-second', {
      examMappings: [{ examNumber: 18, examPart: 'SECOND', weight: 1 }],
    });
    const route = build([firstPart, secondPart], {
      goal: { targetScore: 70, examDate, weeklyMinutes: 360 },
    });

    expect(findSkillModule(route, firstPart.code)!.priority).toBeGreaterThan(
      findSkillModule(route, secondPart.code)!.priority,
    );
  });

  it('для цели 90+ повышает приоритет второй части', () => {
    const firstPart = skill('target-95-first');
    const secondPart = skill('target-95-second', {
      examMappings: [{ examNumber: 18, examPart: 'SECOND', weight: 1 }],
    });
    const route = build([firstPart, secondPart], {
      goal: { targetScore: 95, examDate, weeklyMinutes: 360 },
    });

    expect(findSkillModule(route, secondPart.code)!.priority).toBeGreaterThan(
      findSkillModule(route, firstPart.code)!.priority,
    );
  });

  it('при недостатке данных предлагает уточнение уровня', () => {
    const uncertain = skill('uncertain', {
      state: state({
        mastery: 0.5,
        confidence: 0.18,
        stability: null,
        distinctEvidenceCount: 1,
        status: 'INSUFFICIENT_DATA',
      }),
    });
    const module = findSkillModule(build([uncertain]), uncertain.code)!;

    expect(module.type).toBe('EXTRA_DIAGNOSTIC');
    expect(module.completionCriteria.mastery).toBeNull();
    expect(module.completionCriteria.confidence).toBe(0.55);
  });

  it('отдельно сохраняет повторение и назначение преподавателя', () => {
    const review = skill('review', {
      state: state({
        mastery: 0.82,
        confidence: 0.8,
        stability: 0.75,
        status: 'NEEDS_REVIEW',
        needsReview: true,
      }),
    });
    const assigned = skill('assigned');
    const route = build([review, assigned], {
      teacherAssignments: [
        {
          skillCode: assigned.code,
          assignmentId: 'HW-1',
          title: 'Назначение',
        },
      ],
    });

    expect(findSkillModule(route, review.code)?.type).toBe('REVIEW');
    expect(findSkillModule(route, assigned.code)?.type).toBe(
      'TEACHER_ASSIGNED',
    );
  });

  it('помечает независимый рекомендуемый модуль как параллельный', () => {
    const main = skill('main', {
      importance: 3,
      examMappings: [{ examNumber: 18, examPart: 'SECOND', weight: 0.7 }],
    });
    const independent = skill('independent', {
      importance: 3,
      examMappings: [{ examNumber: 19, examPart: 'SECOND', weight: 0.7 }],
    });
    const route = build([main, independent], {
      goal: { targetScore: 70, examDate, weeklyMinutes: 360 },
    });

    expect(route.modules.some((module) => module.type === 'PARALLEL')).toBe(
      true,
    );
  });
});
