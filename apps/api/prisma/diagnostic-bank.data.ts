import type {
  DiagnosticHypothesisType,
  DiagnosticQuestionKind,
  QuestionEvaluationMode,
} from '../src/generated/prisma/client';

export type DiagnosticTaskSkillMapping = {
  topicSlug: string;
  primary: string[];
  secondary?: string[];
  prerequisite?: string[];
};

export type DiagnosticQuestionTemplateSeed = {
  code: string;
  targetSkillCode: string;
  kind: DiagnosticQuestionKind;
  evaluationMode: QuestionEvaluationMode;
  hypothesisType: DiagnosticHypothesisType;
  prompt: string;
  correctAnswer: string;
  answerOptions?: string[];
  estimatedSeconds: number;
  difficulty: number;
};

export const diagnosticTaskSkillMappings: DiagnosticTaskSkillMapping[] = [
  {
    topicSlug: 'ege-01-triangles',
    primary: ['geometry.pythagorean', 'geometry.triangle-area'],
    prerequisite: ['geometry.triangle-angle-sum'],
  },
  {
    topicSlug: 'ege-01-quadrilaterals',
    primary: ['geometry.parallelogram', 'geometry.trapezoid'],
    prerequisite: ['geometry.angles-parallel'],
  },
  {
    topicSlug: 'ege-01-circles',
    primary: ['geometry.circle-metrics', 'geometry.circle-angles'],
    prerequisite: ['geometry.triangle-angle-sum'],
  },
  {
    topicSlug: 'ege-01-figure-angles',
    primary: ['geometry.angles-parallel', 'geometry.triangle-angle-sum'],
  },
  {
    topicSlug: 'ege-01-inscribed-circle',
    primary: ['geometry.circumscribed-quadrilateral', 'geometry.trapezoid'],
    prerequisite: ['number.fractions'],
  },
  {
    topicSlug: 'ege-02-coordinates',
    primary: ['vector.coordinates'],
    prerequisite: ['number.signed-operations'],
  },
  {
    topicSlug: 'ege-02-vector-sum',
    primary: ['vector.operations'],
    prerequisite: ['vector.coordinates'],
  },
  {
    topicSlug: 'ege-02-dot-product',
    primary: ['vector.dot-product'],
    prerequisite: ['vector.coordinates'],
  },
  {
    topicSlug: 'ege-03-cube',
    primary: ['stereometry.prisms-parallelepipeds'],
    prerequisite: ['geometry.pythagorean'],
  },
  {
    topicSlug: 'ege-03-parallelepiped',
    primary: ['stereometry.prisms-parallelepipeds'],
    prerequisite: ['geometry.pythagorean'],
  },
  {
    topicSlug: 'ege-03-pyramid',
    primary: ['stereometry.pyramids'],
    prerequisite: ['geometry.triangle-area'],
  },
  {
    topicSlug: 'ege-03-cylinder',
    primary: ['stereometry.cylinder-cone'],
    prerequisite: ['geometry.circle-metrics'],
  },
  {
    topicSlug: 'ege-03-cone',
    primary: ['stereometry.cylinder-cone'],
    prerequisite: ['geometry.circle-metrics'],
  },
  {
    topicSlug: 'ege-03-sphere',
    primary: ['stereometry.sphere'],
    prerequisite: ['geometry.circle-metrics'],
  },
  {
    topicSlug: 'ege-03-volumes-sections',
    primary: ['stereometry.prisms-parallelepipeds', 'stereometry.sections'],
    prerequisite: ['geometry.triangle-area'],
  },
  {
    topicSlug: 'ege-04-classical-definition',
    primary: ['probability.classical'],
    prerequisite: ['probability.sample-space', 'number.fractions'],
  },
  {
    topicSlug: 'ege-05-addition-multiplication',
    primary: ['probability.union', 'probability.independence'],
    prerequisite: ['probability.classical'],
  },
  {
    topicSlug: 'ege-05-independent-events',
    primary: ['probability.independence'],
    prerequisite: ['probability.classical'],
  },
  {
    topicSlug: 'ege-06-exponential',
    primary: ['equation.exponential'],
    prerequisite: ['algebra.rational-powers'],
  },
  {
    topicSlug: 'ege-06-logarithmic',
    primary: ['equation.logarithmic'],
    prerequisite: ['algebra.log-definition', 'algebra.log-properties'],
  },
  {
    topicSlug: 'ege-06-irrational',
    primary: ['equation.irrational'],
    prerequisite: ['algebra.root-transformations', 'algebra.expression-domain'],
  },
  {
    topicSlug: 'ege-06-trigonometric',
    primary: ['equation.trig-elementary'],
    prerequisite: ['trig.unit-circle'],
  },
  {
    topicSlug: 'ege-07-trigonometry',
    primary: ['trig.basic-identities', 'trig.reduction-formulas'],
    prerequisite: ['trig.unit-circle'],
  },
  {
    topicSlug: 'ege-07-powers',
    primary: ['algebra.integer-powers', 'algebra.rational-powers'],
    prerequisite: ['number.fractions'],
  },
  {
    topicSlug: 'ege-07-logarithms',
    primary: ['algebra.log-properties'],
    prerequisite: ['algebra.log-definition'],
  },
  {
    topicSlug: 'ege-08-geometric-meaning',
    primary: ['calculus.derivative-meaning'],
    prerequisite: ['function.read-graph'],
  },
  {
    topicSlug: 'ege-08-physical-meaning',
    primary: ['calculus.derivative-meaning'],
    prerequisite: ['applied.read-data'],
  },
  {
    topicSlug: 'ege-08-tangent',
    primary: ['calculus.tangent-equation'],
    prerequisite: ['calculus.derivative-rules', 'function.linear'],
  },
  {
    topicSlug: 'ege-09-physical-quantities',
    primary: ['applied.read-data', 'applied.validate-result'],
    prerequisite: ['number.units-conversion'],
  },
  {
    topicSlug: 'ege-09-economic-quantities',
    primary: ['applied.read-data', 'number.percent-of-value'],
    prerequisite: ['number.ratio-proportion'],
  },
  {
    topicSlug: 'ege-10-straight-motion',
    primary: ['applied.straight-motion'],
    prerequisite: ['applied.build-equation', 'number.units-conversion'],
  },
  {
    topicSlug: 'ege-10-circular-motion',
    primary: ['applied.water-circle-motion'],
    prerequisite: ['applied.build-equation'],
  },
  {
    topicSlug: 'ege-10-water-motion',
    primary: ['applied.water-circle-motion'],
    prerequisite: ['applied.build-equation'],
  },
  {
    topicSlug: 'ege-10-work',
    primary: ['applied.work'],
    prerequisite: ['applied.build-equation'],
  },
  {
    topicSlug: 'ege-10-mixtures-alloys',
    primary: ['applied.mixtures'],
    prerequisite: ['number.percent-of-value', 'applied.build-equation'],
  },
  {
    topicSlug: 'ege-10-percentages',
    primary: ['number.percent-change'],
    prerequisite: ['number.percent-of-value'],
  },
  {
    topicSlug: 'ege-11-parabolas',
    primary: ['function.quadratic'],
    prerequisite: ['function.read-graph'],
  },
  {
    topicSlug: 'ege-11-hyperbolas',
    primary: ['function.reciprocal'],
    prerequisite: ['function.read-graph'],
  },
  {
    topicSlug: 'ege-11-lines',
    primary: ['function.linear'],
    prerequisite: ['function.read-graph'],
  },
  {
    topicSlug: 'ege-11-roots',
    primary: ['function.power-root'],
    prerequisite: ['function.read-graph'],
  },
  {
    topicSlug: 'ege-11-trigonometry',
    primary: ['function.trigonometric'],
    prerequisite: ['trig.unit-circle'],
  },
  {
    topicSlug: 'ege-11-logarithms',
    primary: ['function.logarithmic'],
    prerequisite: ['algebra.log-definition'],
  },
  {
    topicSlug: 'ege-12-extrema-derivative',
    primary: ['calculus.max-min-segment'],
    prerequisite: [
      'calculus.derivative-rules',
      'calculus.monotonicity-extrema',
    ],
  },
  {
    topicSlug: 'ege-13-trigonometric',
    primary: ['equation.trig-transform'],
    prerequisite: [
      'trig.unit-circle',
      'trig.basic-identities',
      'equation.trig-elementary',
    ],
  },
  {
    topicSlug: 'ege-13-exponential',
    primary: ['equation.exponential'],
    prerequisite: ['algebra.rational-powers'],
  },
  {
    topicSlug: 'ege-13-logarithmic',
    primary: ['equation.logarithmic'],
    prerequisite: ['algebra.log-definition', 'algebra.log-properties'],
  },
  {
    topicSlug: 'ege-13-root-selection',
    primary: ['equation.trig-root-selection'],
    prerequisite: ['equation.trig-transform', 'trig.angle-measure'],
  },
  {
    topicSlug: 'ege-14-proofs',
    primary: ['reasoning.proof-structure'],
    secondary: ['stereometry.line-plane-relations'],
  },
  {
    topicSlug: 'ege-14-sections',
    primary: ['stereometry.sections'],
    prerequisite: ['reasoning.construction'],
  },
  {
    topicSlug: 'ege-14-angles-distances',
    primary: [
      'stereometry.angle-line-plane',
      'stereometry.point-plane-distance',
    ],
    prerequisite: ['stereometry.perpendicular-projection'],
  },
  {
    topicSlug: 'ege-15-rational',
    primary: ['inequality.rational'],
    prerequisite: ['inequality.interval-method'],
  },
  {
    topicSlug: 'ege-15-irrational',
    primary: ['inequality.irrational'],
    prerequisite: ['algebra.expression-domain'],
  },
  {
    topicSlug: 'ege-15-exponential',
    primary: ['inequality.exponential'],
    prerequisite: ['function.exponential'],
  },
  {
    topicSlug: 'ege-15-logarithmic',
    primary: ['inequality.logarithmic'],
    prerequisite: ['algebra.log-definition', 'function.logarithmic'],
  },
  {
    topicSlug: 'ege-15-systems',
    primary: ['inequality.systems'],
    prerequisite: ['inequality.interval-method'],
  },
  {
    topicSlug: 'ege-16-differentiated-loans',
    primary: ['finance.differentiated-loan'],
    prerequisite: ['finance.compound-interest'],
  },
  {
    topicSlug: 'ege-16-annuity-loans',
    primary: ['finance.annuity-loan'],
    prerequisite: ['finance.compound-interest'],
  },
  {
    topicSlug: 'ege-16-deposits',
    primary: ['finance.compound-interest'],
    prerequisite: ['number.percent-change'],
  },
  {
    topicSlug: 'ege-16-optimization',
    primary: ['finance.optimization'],
    prerequisite: ['calculus.max-min-segment'],
  },
  {
    topicSlug: 'ege-17-proofs-calculations',
    primary: ['geometry.composite-configuration', 'reasoning.proof-structure'],
    prerequisite: ['geometry.triangle-similarity', 'reasoning.construction'],
  },
  {
    topicSlug: 'ege-18-analytic-method',
    primary: ['equation.parameter-cases'],
    prerequisite: ['reasoning.case-analysis'],
  },
  {
    topicSlug: 'ege-18-graphical-method',
    primary: ['equation.parameter-cases'],
    secondary: ['function.graph-transformations'],
    prerequisite: ['function.read-graph'],
  },
  {
    topicSlug: 'ege-18-root-location',
    primary: ['equation.parameter-cases'],
    secondary: ['function.read-graph'],
    prerequisite: ['inequality.systems'],
  },
  {
    topicSlug: 'ege-19-divisibility',
    primary: ['number.divisibility-tests', 'reasoning.modular-proof'],
    prerequisite: ['number.remainders'],
  },
  {
    topicSlug: 'ege-19-sequences',
    primary: ['reasoning.integer-bounds'],
    prerequisite: ['number.digit-properties'],
  },
  {
    topicSlug: 'ege-19-progressions',
    primary: ['applied.progression-model'],
    prerequisite: ['algebra.integer-powers'],
  },
  {
    topicSlug: 'ege-19-logic',
    primary: ['reasoning.extremal-invariant'],
    prerequisite: ['reasoning.case-analysis'],
  },
];

export const diagnosticQuestionTemplates: DiagnosticQuestionTemplateSeed[] = [
  {
    code: 'probe.fractions.subtract',
    targetSkillCode: 'number.fractions',
    kind: 'ADAPTIVE_TASK',
    evaluationMode: 'EXACT',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Вычислите: $\\frac{3}{4}-\\frac{1}{6}$.',
    correctAnswer: '7/12',
    estimatedSeconds: 90,
    difficulty: 1,
  },
  {
    code: 'probe.operation-order',
    targetSkillCode: 'number.operation-order',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Какое действие выполняется первым в выражении $8-2(3+1)^2$?',
    correctAnswer: 'действие в скобках',
    answerOptions: [
      'вычитание',
      'умножение',
      'возведение в степень',
      'действие в скобках',
    ],
    estimatedSeconds: 45,
    difficulty: 1,
  },
  {
    code: 'probe.factorization.identity',
    targetSkillCode: 'algebra.factorization',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Как раскладывается выражение $x^2-9$?',
    correctAnswer: '(x-3)(x+3)',
    answerOptions: ['(x-3)^2', '(x-3)(x+3)', '(x-9)(x+1)', 'x(x-9)'],
    estimatedSeconds: 45,
    difficulty: 1,
  },
  {
    code: 'probe.quadratic.discriminant',
    targetSkillCode: 'equation.quadratic-discriminant',
    kind: 'ADAPTIVE_TASK',
    evaluationMode: 'EXACT',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Сколько действительных корней имеет уравнение $x^2-6x+9=0$?',
    correctAnswer: '1',
    estimatedSeconds: 90,
    difficulty: 1,
  },
  {
    code: 'probe.log.domain',
    targetSkillCode: 'algebra.log-definition',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Какое условие обязательно для выражения $\\log_2(x-3)$?',
    correctAnswer: 'x>3',
    answerOptions: ['x≠3', 'x>3', 'x≥3', 'x<3'],
    estimatedSeconds: 45,
    difficulty: 2,
  },
  {
    code: 'probe.trig.angle-measure',
    targetSkillCode: 'trig.angle-measure',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Чему равен угол $60°$ в радианах?',
    correctAnswer: 'π/3',
    answerOptions: ['π/6', 'π/3', 'π/2', '2π/3'],
    estimatedSeconds: 45,
    difficulty: 1,
  },
  {
    code: 'probe.trig.unit-circle.value',
    targetSkillCode: 'trig.unit-circle',
    kind: 'ADAPTIVE_TASK',
    evaluationMode: 'EXACT',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Найдите $\\sin\\frac{5\\pi}{6}$.',
    correctAnswer: '1/2||0,5',
    estimatedSeconds: 60,
    difficulty: 1,
  },
  {
    code: 'probe.trig.unit-circle.sign',
    targetSkillCode: 'trig.unit-circle',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'SKILL_GAP',
    prompt: 'Какой знак имеет косинус угла в третьей четверти?',
    correctAnswer: 'отрицательный',
    answerOptions: [
      'положительный',
      'отрицательный',
      'всегда ноль',
      'зависит от радиуса',
    ],
    estimatedSeconds: 40,
    difficulty: 1,
  },
  {
    code: 'probe.trig.identity',
    targetSkillCode: 'trig.basic-identities',
    kind: 'THEORY_SHORT',
    evaluationMode: 'EXACT',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Чему равно $\\sin^2x+\\cos^2x$?',
    correctAnswer: '1',
    estimatedSeconds: 40,
    difficulty: 1,
  },
  {
    code: 'probe.trig.reduction',
    targetSkillCode: 'trig.reduction-formulas',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Выберите верное равенство для $\\cos(\\pi-x)$.',
    correctAnswer: '-cos x',
    answerOptions: ['cos x', '-cos x', 'sin x', '-sin x'],
    estimatedSeconds: 50,
    difficulty: 2,
  },
  {
    code: 'probe.trig.transform.double-angle',
    targetSkillCode: 'trig.double-half-angle',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Как можно заменить выражение $2\\sin x\\cos x$?',
    correctAnswer: 'sin 2x',
    answerOptions: ['sin 2x', 'cos 2x', '2sin x', '1'],
    estimatedSeconds: 50,
    difficulty: 2,
  },
  {
    code: 'probe.trig.equation.elementary',
    targetSkillCode: 'equation.trig-elementary',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Как выглядит общее решение уравнения $\\sin x=0$?',
    correctAnswer: 'x=πn, n∈Z',
    answerOptions: [
      'x=πn, n∈Z',
      'x=π/2+πn, n∈Z',
      'x=2πn, n∈Z',
      'x=(-1)^nπ/2, n∈Z',
    ],
    estimatedSeconds: 60,
    difficulty: 2,
  },
  {
    code: 'probe.trig.equation.transform',
    targetSkillCode: 'equation.trig-transform',
    kind: 'ADAPTIVE_TASK',
    evaluationMode: 'CHOICE',
    hypothesisType: 'SKILL_GAP',
    prompt: 'К какому уравнению сводится $2\\sin x\\cos x=1$?',
    correctAnswer: 'sin 2x=1',
    answerOptions: ['sin 2x=1', 'cos 2x=1', 'sin x=1', 'cos x=1/2'],
    estimatedSeconds: 90,
    difficulty: 2,
  },
  {
    code: 'probe.trig.root-selection',
    targetSkillCode: 'equation.trig-root-selection',
    kind: 'ADAPTIVE_TASK',
    evaluationMode: 'EXACT',
    hypothesisType: 'SKILL_GAP',
    prompt:
      'Перечислите корни $\\sin x=0$ на отрезке $[0;2\\pi]$ через точку с запятой.',
    correctAnswer: '0;π;2π',
    estimatedSeconds: 120,
    difficulty: 2,
  },
  {
    code: 'probe.probability.sample-space',
    targetSkillCode: 'probability.sample-space',
    kind: 'THEORY_SHORT',
    evaluationMode: 'EXACT',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Сколько равновозможных исходов у одного броска обычного кубика?',
    correctAnswer: '6',
    estimatedSeconds: 40,
    difficulty: 1,
  },
  {
    code: 'probe.function.read-graph.concept',
    targetSkillCode: 'function.read-graph',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'PREREQUISITE_GAP',
    prompt: 'Что означает точка $(3;5)$ на графике функции $y=f(x)$?',
    correctAnswer: 'f(3)=5',
    answerOptions: ['f(3)=5', 'f(5)=3', 'x всегда равен 5', 'f(x)=8'],
    estimatedSeconds: 45,
    difficulty: 1,
  },
  {
    code: 'probe.geometry.proof-structure',
    targetSkillCode: 'reasoning.proof-structure',
    kind: 'THEORY_CHOICE',
    evaluationMode: 'CHOICE',
    hypothesisType: 'SKILL_GAP',
    prompt:
      'Какой шаг обязателен в доказательстве после формулировки используемого признака?',
    correctAnswer: 'проверить выполнение всех условий признака',
    answerOptions: [
      'сразу записать ответ',
      'проверить выполнение всех условий признака',
      'измерить рисунок линейкой',
      'сослаться на очевидность',
    ],
    estimatedSeconds: 60,
    difficulty: 2,
  },
];
