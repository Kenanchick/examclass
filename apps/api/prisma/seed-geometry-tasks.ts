import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import {
  ExamPart,
  PrismaClient,
  TaskStatus,
} from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** Оборачивает JSON-описание чертежа в fenced-блок ```geo для MathText. */
function geo(spec: unknown): string {
  return ['```geo', JSON.stringify(spec), '```'].join('\n');
}

type GeometryTask = {
  publicId: string;
  topicSlug: string;
  examPart: ExamPart;
  difficulty: number;
  source: string;
  correctAnswer: string;
  statement: string;
  referenceSolution: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СТЕРЕОМЕТРИЯ · СЕЧЕНИЕ ПРЯМОЙ ПРИЗМЫ
// ─────────────────────────────────────────────────────────────────────────────

const prismFigure = {
  maxWidth: 460,
  maxHeight: 430,
  points: {
    A: [0, 0],
    D: [6, 0],
    B: [2.7, 1.19],
    C: [6.7, 1.19],
    A1: [0, 6],
    D1: [6, 6],
    B1: [2.7, 7.19],
    C1: [6.7, 7.19],
    M: [2, 6],
    K: [6, 3],
    N: [2.7, 4.19],
    L: [0.9, 6.4],
    E: [-1.3, 7.19],
  },
  fills: [{ points: ['M', 'L', 'N', 'C', 'K'] }],
  edges: [
    { from: 'A', to: 'D' },
    { from: 'C', to: 'D' },
    { from: 'A', to: 'A1' },
    { from: 'D', to: 'D1' },
    { from: 'C', to: 'C1' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'D1' },
    { from: 'D1', to: 'A1' },
    { from: 'A', to: 'B', style: 'dashed' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'B', to: 'B1', style: 'dashed' },
    { from: 'E', to: 'M', style: 'dashed' },
    { from: 'E', to: 'C', style: 'dashed' },
    { from: 'M', to: 'L', style: 'section' },
    { from: 'L', to: 'N', style: 'section' },
    { from: 'N', to: 'C', style: 'section' },
    { from: 'C', to: 'K', style: 'section' },
    { from: 'K', to: 'M', style: 'section' },
  ],
  labels: {
    A: { dx: -10, dy: 14, anchor: 'end' },
    D: { dx: 6, dy: 16, anchor: 'start' },
    B: { dx: -6, dy: -8, anchor: 'end' },
    C: { dx: 13, dy: 6, anchor: 'start' },
    A1: { dx: -12, dy: -2, anchor: 'end' },
    D1: { dx: 8, dy: -6, anchor: 'start' },
    B1: { dx: 2, dy: -10, anchor: 'start' },
    C1: { dx: 11, dy: -2, anchor: 'start' },
    M: { dx: 0, dy: -12, anchor: 'middle' },
    K: { dx: 13, dy: 4, anchor: 'start' },
    N: { dx: -12, dy: 2, anchor: 'end' },
    L: { dx: -12, dy: -2, anchor: 'end' },
    E: { dx: -12, dy: 0, anchor: 'end' },
  },
};

const trapezoidFigure = {
  maxWidth: 380,
  maxHeight: 220,
  points: {
    A: [0, 0],
    D: [3, 0],
    B: [0.5, 0.87],
    C: [2.5, 0.87],
  },
  edges: [
    { from: 'A', to: 'B', ticks: 1 },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', ticks: 1 },
    { from: 'D', to: 'A' },
  ],
  angles: [{ at: 'D', from: 'A', to: 'C', label: '60°' }],
  dims: [
    { from: 'A', to: 'D', text: '3' },
    { from: 'B', to: 'C', text: '2' },
  ],
  labels: {
    A: { dx: -8, dy: 16, anchor: 'end' },
    D: { dx: 8, dy: 16, anchor: 'start' },
    B: { dx: -8, dy: -6, anchor: 'end' },
    C: { dx: 8, dy: -6, anchor: 'start' },
  },
};

const sectionShapeFigure = {
  maxWidth: 440,
  maxHeight: 260,
  points: {
    E: [-2.236, 0],
    N: [0, 0],
    C: [2.236, 0],
    M: [0, 1.414],
    K: [2.236, 1.414],
    L: [-0.745, 0.943],
  },
  fills: [{ points: ['M', 'K', 'C', 'N', 'L'] }],
  edges: [
    { from: 'M', to: 'K' },
    { from: 'K', to: 'C' },
    { from: 'C', to: 'N' },
    { from: 'N', to: 'E' },
    { from: 'E', to: 'L' },
    { from: 'L', to: 'M' },
    { from: 'M', to: 'N' },
    { from: 'N', to: 'L' },
  ],
  rightAngles: [
    { at: 'N', from: 'M', to: 'C' },
    { at: 'K', from: 'M', to: 'C' },
    { at: 'C', from: 'K', to: 'N' },
  ],
  dims: [
    { from: 'M', to: 'K', text: '√5' },
    { from: 'K', to: 'C', text: '√2' },
    { from: 'E', to: 'N', text: '√5' },
    { from: 'N', to: 'C', text: '√5' },
  ],
  labels: {
    E: { dx: -8, dy: 16, anchor: 'end' },
    N: { dx: 0, dy: 18, anchor: 'middle' },
    C: { dx: 8, dy: 16, anchor: 'start' },
    M: { dx: -8, dy: -8, anchor: 'end' },
    K: { dx: 8, dy: -8, anchor: 'start' },
    L: { dx: -12, dy: 0, anchor: 'end' },
  },
};

const stereometrySection: GeometryTask = {
  publicId: 'G14SEC1',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: 'ЕГЭ, профильный уровень (задание 14)',
  correctAnswer: 'б) 7√10/6',
  statement: [
    `В основании прямой призмы $ABCDA_1B_1C_1D_1$ лежит равнобедренная трапеция $ABCD$ с основаниями $AD = 3$ и $BC = 2$. Точка $M$ делит ребро $A_1D_1$ в отношении $A_1M : MD_1 = 1 : 2$, а точка $K$ — середина ребра $DD_1$.`,
    `**а)** Докажите, что плоскость $MKC$ делит отрезок $BB_1$ пополам.`,
    `**б)** Найдите площадь сечения призмы плоскостью $MKC$, если $\\angle MKC = 90°$, $\\angle ADC = 60°$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    `Грани $ADD_1A_1$ и $BCC_1B_1$ параллельны, так как основания трапеции $AD \\parallel BC$, а призма прямая. Секущая плоскость пересекает две параллельные плоскости по параллельным прямым.`,
    `Прямая $MK$ целиком лежит в грани $ADD_1A_1$ (обе точки $M \\in A_1D_1$ и $K \\in DD_1$ принадлежат этой грани). Значит, в грани $BCC_1B_1$ плоскость сечения пройдёт через точку $C$ по прямой, параллельной $MK$.`,
    `Проведём $CN \\parallel MK$, где $N \\in BB_1$. Продолжения дают вспомогательные точки: $CN$ пересекает прямую $B_1C_1$ в точке $E$, а прямая $EM$ пересекает $A_1B_1$ в точке $L$. Полное сечение — пятиугольник $MLNCK$.`,
    geo(prismFigure),
    `Так как $A_1M : MD_1 = 1 : 2$ и $A_1D_1 = AD = 3$, то $MD_1 = \\dfrac{2}{3}A_1D_1 = 2$.`,
    `Рассмотрим прямоугольные треугольники $CBN$ и $MD_1K$:`,
    `- $\\angle CBN = \\angle MD_1K = 90°$ (боковые рёбра прямой призмы перпендикулярны основаниям);\n- $BC = D_1M = 2$ (катеты);\n- $\\angle NCB = \\angle KMD_1$ (накрест лежащие при $CN \\parallel MK$).`,
    `Отсюда $\\triangle CBN = \\triangle MD_1K$ по катету и прилежащему острому углу, поэтому`,
    `$$BN = D_1K = \\frac{1}{2}DD_1 = \\frac{1}{2}BB_1.$$`,
    `Значит, точка $N$ — середина ребра $BB_1$, то есть плоскость $MKC$ делит отрезок $BB_1$ пополам. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь сечения`,
    `Обозначим $BB_1 = 2x$, тогда $B_1N = NB = x$, а также $D_1K = KD = x$.`,
    `Найдём боковую сторону трапеции. Так как $ABCD$ — равнобедренная трапеция с основаниями $BC = 2$ и $AD = 3$ и углом $\\angle ADC = 60°$, то проекция боковой стороны на большее основание равна $\\dfrac{AD - BC}{2} = \\dfrac{1}{2}$, откуда`,
    `$$CD = \\frac{(AD - BC)/2}{\\cos 60°} = \\frac{1/2}{1/2} = 1.$$`,
    geo(trapezoidFigure),
    `Теперь выразим ключевые отрезки сечения через $x$ (все — из прямоугольных треугольников по теореме Пифагора):`,
    `- в грани $BCC_1B_1$: $NC^2 = BN^2 + BC^2 = x^2 + 4$;\n- в грани $CDD_1C_1$: $CK^2 = KD^2 + CD^2 = x^2 + 1$, то есть $CK = \\sqrt{x^2 + 1}$;\n- отрезок $MK$: $MK^2 = MD_1^2 + D_1K^2 = 4 + x^2$.`,
    `Используем условие $\\angle MKC = 90°$. В треугольнике $MKC$ по теореме Пифагора $MC^2 = MK^2 + CK^2 = (4 + x^2) + (1 + x^2) = 5 + 2x^2$.`,
    `С другой стороны, $MC$ можно найти напрямую. Опустим перпендикуляры и заметим, что $MC^2 = MD_1^2 + D_1C^2$, где $D_1C^2 = DC^2 + DD_1^2$… удобнее посчитать через координаты: приняв $D$ за начало, получаем $MC^2 = 3 + 4x^2$. Приравнивая,`,
    `$$5 + 2x^2 = 3 + 4x^2 \\;\\Rightarrow\\; x^2 = 1 \\;\\Rightarrow\\; x = 1.$$`,
    `Значит, $BB_1 = 2$, и тогда`,
    `$$CK = \\sqrt{2}, \\quad MK = \\sqrt{5}, \\quad NC = \\sqrt{5}, \\quad MN = \\sqrt{2}.$$`,
    `Из равенства $\\triangle BNC = \\triangle B_1NE$ (по катету и прилежащему углу) следует $EB_1 = BC = 2$ и $EN = NC = \\sqrt{5}$. Значит, четырёхугольник $MKCN$ — прямоугольник со сторонами $MK = NC = \\sqrt{5}$ и $KC = MN = \\sqrt{2}$, а $MLNCK$ — сечение, которое удобно достроить до прямоугольной трапеции $MKCE$ и вычесть треугольник $NEL$:`,
    `$$S_{\\text{сеч}} = S_{MKCE} - S_{NEL}.$$`,
    geo(sectionShapeFigure),
    `Площадь трапеции $MKCE$ (основания $MK$ и $EC = EN + NC = 2\\sqrt{5}$, высота $KC$):`,
    `$$S_{MKCE} = \\frac{1}{2}(EC + MK)\\cdot KC = \\frac{1}{2}\\left(2\\sqrt{5} + \\sqrt{5}\\right)\\cdot \\sqrt{2} = \\frac{3\\sqrt{10}}{2}.$$`,
    `Так как $\\triangle A_1ML \\sim \\triangle B_1EL$ по двум углам, то $\\dfrac{EL}{LM} = \\dfrac{EB_1}{A_1M} = \\dfrac{2}{1}$, поэтому $\\dfrac{EL}{EM} = \\dfrac{2}{3}$. Треугольники $ELN$ и $EMN$ имеют общую высоту из вершины $N$, значит`,
    `$$S_{NEL} = \\frac{2}{3}S_{MEN} = \\frac{2}{3}\\cdot \\frac{1}{2}\\cdot EN \\cdot MN = \\frac{2}{3}\\cdot \\frac{1}{2}\\cdot \\sqrt{5}\\cdot \\sqrt{2} = \\frac{\\sqrt{10}}{3}.$$`,
    `Следовательно,`,
    `$$S_{\\text{сеч}} = \\frac{3\\sqrt{10}}{2} - \\frac{\\sqrt{10}}{3} = \\frac{9\\sqrt{10} - 2\\sqrt{10}}{6} = \\frac{7\\sqrt{10}}{6}.$$`,
    `**Ответ:** б) $\\dfrac{7\\sqrt{10}}{6}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · ВПИСАННЫЙ ЧЕТЫРЁХУГОЛЬНИК И ПОДОБИЕ
// ─────────────────────────────────────────────────────────────────────────────

const circleTriangleFigure = {
  maxWidth: 400,
  maxHeight: 360,
  points: {
    A: [0, 0],
    B: [6, 0],
    C: [2, 5],
    P: [0.828, 2.069],
    Q: [3.66, 2.927],
  },
  circles: [{ cx: 3, cy: 0, r: 3 }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'P', to: 'Q', style: 'section' },
  ],
  dims: [{ from: 'A', to: 'B', text: '6' }],
  labels: {
    A: { dx: -10, dy: 14, anchor: 'end' },
    B: { dx: 10, dy: 14, anchor: 'start' },
    C: { dx: 0, dy: -12, anchor: 'middle' },
    P: { dx: -12, dy: -2, anchor: 'end' },
    Q: { dx: 12, dy: -2, anchor: 'start' },
  },
};

const planimetrySimilarity: GeometryTask = {
  publicId: 'G17SIM1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: 'ЕГЭ, профильный уровень (задание 17)',
  correctAnswer: 'б) 3',
  statement: [
    `Окружность проходит через вершины $A$ и $B$ треугольника $ABC$ и пересекает стороны $AC$ и $BC$ в точках $P$ и $Q$ соответственно.`,
    `**а)** Докажите, что треугольник $CPQ$ подобен треугольнику $CBA$.`,
    `**б)** Найдите $PQ$, если $AB = 6$, а радиус окружности, описанной около треугольника $CPQ$, вдвое меньше радиуса окружности, описанной около треугольника $CBA$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(circleTriangleFigure),
    `Точки $A$, $P$, $Q$, $B$ лежат на одной окружности, значит четырёхугольник $APQB$ — вписанный. Сумма его противоположных углов равна $180°$:`,
    `$$\\angle APQ + \\angle ABQ = 180°.$$`,
    `Точка $P$ лежит на стороне $AC$, поэтому углы $\\angle CPQ$ и $\\angle APQ$ — смежные:`,
    `$$\\angle CPQ = 180° - \\angle APQ = \\angle ABQ.$$`,
    `Точка $Q$ лежит на стороне $BC$, поэтому $\\angle ABQ = \\angle ABC$. Значит, $\\angle CPQ = \\angle ABC = \\angle CBA$.`,
    `Угол $C$ — общий для треугольников $CPQ$ и $CBA$. По двум углам получаем $\\triangle CPQ \\sim \\triangle CBA$ (при этом $C \\leftrightarrow C$, $P \\leftrightarrow B$, $Q \\leftrightarrow A$). **Что и требовалось доказать.**`,
    `## Пункт б). Вычисление $PQ$`,
    `Обозначим коэффициент подобия $\\triangle CPQ \\sim \\triangle CBA$ через $k$. У подобных треугольников все линейные элементы, включая радиусы описанных окружностей, относятся с тем же коэффициентом:`,
    `$$\\frac{R_{CPQ}}{R_{CBA}} = k.$$`,
    `По условию $R_{CPQ} = \\dfrac{1}{2}R_{CBA}$, поэтому $k = \\dfrac{1}{2}$.`,
    `Сторона $PQ$ треугольника $CPQ$ соответствует стороне $BA$ треугольника $CBA$ (обе лежат против общего угла $C$), значит`,
    `$$PQ = k \\cdot BA = \\frac{1}{2}\\cdot 6 = 3.$$`,
    `**Ответ:** б) $3$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · СРЕДНЯЯ ЛИНИЯ ЧЕРЕЗ ЦЕНТРОИД
// ─────────────────────────────────────────────────────────────────────────────

const medianFigure = {
  maxWidth: 400,
  maxHeight: 320,
  points: {
    A: [0, 0],
    B: [3, 5],
    C: [6, 0],
    N: [3, 0],
    M: [3, 1.667],
    K: [1, 1.667],
    L: [5, 1.667],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'B', to: 'N', style: 'dashed' },
    { from: 'K', to: 'L', style: 'section' },
  ],
  ticks: [
    { from: 'A', to: 'N', ticks: 1 },
    { from: 'N', to: 'C', ticks: 1 },
  ],
  labels: {
    A: { dx: -10, dy: 14, anchor: 'end' },
    B: { dx: 0, dy: -12, anchor: 'middle' },
    C: { dx: 10, dy: 14, anchor: 'start' },
    K: { dx: -12, dy: 0, anchor: 'end' },
    L: { dx: 12, dy: 0, anchor: 'start' },
    M: { dx: 10, dy: -6, anchor: 'start' },
    N: { dx: 0, dy: 18, anchor: 'middle' },
  },
};

const planimetryMedian: GeometryTask = {
  publicId: 'G17MED1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: 'ЕГЭ, профильный уровень (задание 17)',
  correctAnswer: 'б) 20',
  statement: [
    `Через точку $M$ пересечения медиан треугольника $ABC$ проведена прямая, параллельная стороне $AC$ и пересекающая стороны $AB$ и $BC$ в точках $K$ и $L$ соответственно.`,
    `**а)** Докажите, что $KL = \\dfrac{2}{3}AC$.`,
    `**б)** Найдите площадь треугольника $BKL$, если площадь треугольника $ABC$ равна $45$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(medianFigure),
    `Пусть $BN$ — медиана треугольника, проведённая к стороне $AC$, где $N$ — середина $AC$. Точка пересечения медиан $M$ делит медиану в отношении $BM : MN = 2 : 1$, считая от вершины, поэтому`,
    `$$\\frac{BM}{BN} = \\frac{2}{3}.$$`,
    `Так как $KL \\parallel AC$, треугольник $BKL$ подобен треугольнику $BAC$ по двум углам (угол $B$ — общий, а углы при параллельных прямых равны). Прямая $KL$ проходит через точку $M$ медианы $BN$, поэтому коэффициент подобия равен`,
    `$$k = \\frac{BM}{BN} = \\frac{2}{3}.$$`,
    `Сторона $KL$ соответствует стороне $AC$, значит $KL = \\dfrac{2}{3}AC$. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь треугольника $BKL$`,
    `Отношение площадей подобных треугольников равно квадрату коэффициента подобия:`,
    `$$\\frac{S_{BKL}}{S_{ABC}} = k^2 = \\left(\\frac{2}{3}\\right)^2 = \\frac{4}{9}.$$`,
    `Следовательно,`,
    `$$S_{BKL} = \\frac{4}{9}\\cdot S_{ABC} = \\frac{4}{9}\\cdot 45 = 20.$$`,
    `**Ответ:** б) $20$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СТЕРЕОМЕТРИЯ · СЕЧЕНИЕ ТРЕУГОЛЬНОЙ ПРИЗМЫ
// ─────────────────────────────────────────────────────────────────────────────

const prismSectionFigure = {
  maxWidth: 420,
  maxHeight: 420,
  points: {
    A: [0, 0],
    B: [4, 0],
    C: [3.86, 1.56],
    A1: [0, 4],
    B1: [4, 4],
    C1: [3.86, 5.56],
    M: [3.86, 3.56],
    P: [2, 0],
  },
  fills: [{ points: ['A', 'B', 'M'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'A1' },
    { from: 'B', to: 'B1' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'A1' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'C', to: 'A', style: 'dashed' },
    { from: 'C', to: 'C1', style: 'dashed' },
    { from: 'M', to: 'P', style: 'dashed' },
    { from: 'B', to: 'M', style: 'section' },
    { from: 'M', to: 'A', style: 'section' },
  ],
  labels: {
    A: { dx: -10, dy: 12, anchor: 'end' },
    B: { dx: 4, dy: 16, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    A1: { dx: -12, dy: -2, anchor: 'end' },
    B1: { dx: -4, dy: -10, anchor: 'middle' },
    C1: { dx: 12, dy: -2, anchor: 'start' },
    M: { dx: 12, dy: 2, anchor: 'start' },
    P: { dx: 0, dy: 16, anchor: 'middle' },
  },
};

const prismSection: GeometryTask = {
  publicId: 'G14PRM1',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: 'ЕГЭ, профильный уровень (задание 14)',
  correctAnswer: 'б) 2',
  statement: [
    `В правильной треугольной призме $ABCA_1B_1C_1$ все рёбра равны $2$. Точка $M$ — середина ребра $CC_1$, точка $P$ — середина ребра $AB$.`,
    `**а)** Докажите, что $AB \\perp MP$.`,
    `**б)** Найдите площадь сечения призмы плоскостью $ABM$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(prismSectionFigure),
    `Точка $P$ — середина стороны $AB$. В равностороннем треугольнике $ABC$ медиана $CP$ является и высотой, поэтому $CP \\perp AB$.`,
    `Боковое ребро $CC_1$ перпендикулярно плоскости основания, значит $CC_1 \\perp AB$.`,
    `Прямая $AB$ перпендикулярна двум пересекающимся прямым $CP$ и $CC_1$ плоскости $CC_1P$, следовательно $AB \\perp (CC_1P)$.`,
    `Точка $M$ лежит на ребре $CC_1$, а точка $P$ — в плоскости $CC_1P$, поэтому отрезок $MP$ целиком лежит в плоскости $CC_1P$. Значит, $AB \\perp MP$. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь сечения`,
    `Плоскость $ABM$ пересекает призму по треугольнику $ABM$ ($A$ и $B$ — вершины основания, $M$ — на ребре $CC_1$). Так как $AB \\perp MP$ (доказано в пункте а), отрезок $MP$ — высота треугольника $ABM$, опущенная на сторону $AB$.`,
    `Найдём $MP$ из прямоугольного треугольника $CPM$ (угол $C$ прямой, так как $CC_1 \\perp CP$):`,
    `$$CP = \\frac{\\sqrt{3}}{2}\\cdot AB = \\frac{\\sqrt{3}}{2}\\cdot 2 = \\sqrt{3}, \\qquad CM = \\frac{1}{2}CC_1 = 1.$$`,
    `$$MP = \\sqrt{CP^2 + CM^2} = \\sqrt{3 + 1} = 2.$$`,
    `Тогда`,
    `$$S_{ABM} = \\frac{1}{2}\\cdot AB \\cdot MP = \\frac{1}{2}\\cdot 2 \\cdot 2 = 2.$$`,
    `**Ответ:** б) $2$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СТЕРЕОМЕТРИЯ · СЕЧЕНИЕ КУБА ПЛОСКОСТЬЮ ALR
// ─────────────────────────────────────────────────────────────────────────────

const cubeSectionFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    D: [0, 0],
    A: [3, 0],
    B: [4.5, 1.35],
    C: [1.5, 1.35],
    D1: [0, 3],
    A1: [3, 3],
    B1: [4.5, 4.35],
    C1: [1.5, 4.35],
    R: [0.5, 0.45],
    Q: [1.5, 3.75],
    L: [3, 4.35],
    K: [4.25, 4.125],
  },
  fills: [{ points: ['A', 'R', 'Q', 'L', 'K'] }],
  edges: [
    { from: 'D', to: 'A' },
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D1', to: 'A1' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'D1' },
    { from: 'D', to: 'D1' },
    { from: 'A', to: 'A1' },
    { from: 'B', to: 'B1' },
    { from: 'C', to: 'C1', style: 'dashed' },
    { from: 'A', to: 'R', style: 'section' },
    { from: 'R', to: 'Q', style: 'section' },
    { from: 'Q', to: 'L', style: 'section' },
    { from: 'L', to: 'K', style: 'section' },
    { from: 'K', to: 'A', style: 'section' },
  ],
  labels: {
    D: { dx: -6, dy: 16, anchor: 'end' },
    A: { dx: 6, dy: 16, anchor: 'start' },
    B: { dx: 12, dy: 6, anchor: 'start' },
    C: { dx: 9, dy: 11, anchor: 'start' },
    D1: { dx: -12, dy: 2, anchor: 'end' },
    A1: { dx: -12, dy: 4, anchor: 'end' },
    B1: { dx: 8, dy: -6, anchor: 'start' },
    C1: { dx: -8, dy: -8, anchor: 'end' },
    R: { dx: 0, dy: 17, anchor: 'middle' },
    Q: { dx: -12, dy: 2, anchor: 'end' },
    L: { dx: -6, dy: -12, anchor: 'middle' },
    K: { dx: 10, dy: 8, anchor: 'start' },
  },
};

const cubeSection: GeometryTask = {
  publicId: 'G14CUB1',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: 'ЕГЭ, профильный уровень (задание 14)',
  correctAnswer: 'б) 24√65/13',
  statement: [
    `Ребро куба $ABCDA_1B_1C_1D_1$ равно $30$. На ребре $DC$ отмечена точка $R$ так, что $DR = 10$, а на ребре $B_1C_1$ отмечена точка $L$ — середина $B_1C_1$. Плоскость $ALR$ пересекает ребро $CC_1$ в точке $Q$.`,
    `**а)** Докажите, что $CQ : QC_1 = 4 : 1$.`,
    `**б)** Найдите расстояние от точки $C$ до плоскости $ALR$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(cubeSectionFigure),
    `Введём прямоугольную систему координат с началом в точке $D$: ось $x$ направим вдоль $DA$, ось $y$ — вдоль $DC$, ось $z$ — вдоль $DD_1$. Тогда вершины и отмеченные точки имеют координаты`,
    `$$A(30;\\,0;\\,0),\\quad R(0;\\,10;\\,0),\\quad L(15;\\,30;\\,30),\\quad C(0;\\,30;\\,0).$$`,
    `Здесь $R$ лежит на $DC$ и $DR = 10$; точка $L$ — середина $B_1C_1$, где $B_1(30;30;30)$ и $C_1(0;30;30)$.`,
    `Составим уравнение плоскости $ALR$ в виде $ax + by + cz + d = 0$. Подставляя координаты точек $A$, $R$ и $L$, получаем систему`,
    `$$\\begin{cases}30a + d = 0\\\\ 10b + d = 0\\\\ 15a + 30b + 30c + d = 0\\end{cases}$$`,
    `Положим $d = -30$; тогда $a = 1$, $b = 3$, а из третьего уравнения $15 + 90 + 30c - 30 = 0$, откуда $c = -2{,}5$. Умножив на $2$, запишем уравнение плоскости в целых коэффициентах:`,
    `$$ALR:\\quad 2x + 6y - 5z - 60 = 0.$$`,
    `Точка $Q$ лежит на ребре $CC_1$, поэтому $Q(0;\\,30;\\,t)$. Подставим в уравнение плоскости:`,
    `$$6\\cdot 30 - 5t - 60 = 0 \\;\\Rightarrow\\; 120 - 5t = 0 \\;\\Rightarrow\\; t = 24.$$`,
    `Значит, $Q(0;\\,30;\\,24)$, поэтому $CQ = 24$, $QC_1 = 30 - 24 = 6$, и`,
    `$$CQ : QC_1 = 24 : 6 = 4 : 1.$$`,
    `**Что и требовалось доказать.** (Полное сечение куба этой плоскостью — пятиугольник $ARQLK$, где $K$ — точка на ребре $A_1B_1$.)`,
    `## Пункт б). Расстояние от точки $C$ до плоскости`,
    `Расстояние от точки $C(0;\\,30;\\,0)$ до плоскости $2x + 6y - 5z - 60 = 0$ находим по формуле`,
    `$$\\rho(C,\\,ALR) = \\frac{|2\\cdot 0 + 6\\cdot 30 - 5\\cdot 0 - 60|}{\\sqrt{2^2 + 6^2 + 5^2}} = \\frac{|180 - 60|}{\\sqrt{4 + 36 + 25}} = \\frac{120}{\\sqrt{65}}.$$`,
    `Избавимся от иррациональности в знаменателе:`,
    `$$\\rho(C,\\,ALR) = \\frac{120}{\\sqrt{65}} = \\frac{120\\sqrt{65}}{65} = \\frac{24\\sqrt{65}}{13}.$$`,
    `**Ответ:** б) $\\dfrac{24\\sqrt{65}}{13}$.`,
  ].join('\n\n'),
};

const geometryTasks: GeometryTask[] = [
  stereometrySection,
  prismSection,
  cubeSection,
  planimetrySimilarity,
  planimetryMedian,
];

async function main() {
  const subject = await prisma.subject.findUnique({
    where: { code: 'profile-math-ege' },
  });

  if (!subject) {
    throw new Error('Предмет profile-math-ege не найден. Сначала запустите seed.ts');
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: subject.id },
    select: { id: true, slug: true },
  });
  const topicMap = new Map(topics.map((t) => [t.slug, t.id]));

  let added = 0;
  let skipped = 0;

  for (const task of geometryTasks) {
    const topicId = topicMap.get(task.topicSlug);

    if (!topicId) {
      console.warn(`⚠ Тема ${task.topicSlug} не найдена, пропускаем ${task.publicId}`);
      skipped += 1;
      continue;
    }

    const data = {
      topicId,
      examPart: task.examPart,
      statement: task.statement,
      correctAnswer: task.correctAnswer,
      referenceSolution: task.referenceSolution,
      difficulty: task.difficulty,
      status: TaskStatus.PUBLISHED,
      source: task.source,
    };

    await prisma.task.upsert({
      where: { publicId: task.publicId },
      update: data,
      create: { publicId: task.publicId, ...data },
    });

    added += 1;
  }

  console.log(`\n✓ Загружено задач по геометрии (ч. 2): ${added}`);
  if (skipped > 0) {
    console.log(`⚠ Пропущено: ${skipped}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
