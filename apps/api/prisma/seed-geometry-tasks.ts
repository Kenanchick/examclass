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

/** Источники: ФИПИ/реальный экзамен — одно, прочие — по названию сборника. */
const SOURCE = 'Реальные задания (ЕГЭ, ФИПИ)';
const EXAMCLASS = 'ExamClass';
const STATGRAD = 'Статград';
const YASHCHENKO = 'Ященко (сборник ЕГЭ)';
const LYSENKO = 'Лысенко (сборник ЕГЭ)';

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

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СТЕРЕОМЕТРИЯ · СЕЧЕНИЕ ПИРАМИДЫ И ОТНОШЕНИЕ ОБЪЁМОВ
// ─────────────────────────────────────────────────────────────────────────────

const pyramidFigure = {
  maxWidth: 520,
  maxHeight: 440,
  points: {
    S: [0, 2.4],
    A: [2.5, -0.1],
    B: [0.5, 1.1],
    C: [-2.5, 0.1],
    D: [-0.5, -1.1],
    O: [0, 0],
    F: [1.25, 1.15],
    M: [2, 0.2],
    K: [-0.125, 1.525],
    T: [-2, -0.2],
    P: [4, 0.4],
  },
  fills: [{ points: ['M', 'F', 'K', 'T'] }],
  edges: [
    { from: 'D', to: 'A' },
    { from: 'C', to: 'D' },
    { from: 'A', to: 'B', style: 'dashed' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'S', to: 'A' },
    { from: 'S', to: 'C' },
    { from: 'S', to: 'D' },
    { from: 'S', to: 'B', style: 'dashed' },
    { from: 'A', to: 'C', style: 'dashed' },
    { from: 'B', to: 'D', style: 'dashed' },
    { from: 'F', to: 'O', style: 'dashed' },
    { from: 'A', to: 'P', style: 'dashed' },
    { from: 'M', to: 'P', style: 'dashed' },
    { from: 'M', to: 'F', style: 'section' },
    { from: 'F', to: 'K', style: 'section' },
    { from: 'K', to: 'T', style: 'section' },
    { from: 'T', to: 'M', style: 'section' },
  ],
  labels: {
    S: { dx: 0, dy: -12, anchor: 'middle' },
    A: { dx: 10, dy: 8, anchor: 'start' },
    B: { dx: -9, dy: -4, anchor: 'end' },
    C: { dx: -10, dy: 4, anchor: 'end' },
    D: { dx: -8, dy: 14, anchor: 'end' },
    O: { dx: -7, dy: 13, anchor: 'end' },
    F: { dx: 9, dy: 2, anchor: 'start' },
    M: { dx: 8, dy: 12, anchor: 'start' },
    K: { dx: -10, dy: -2, anchor: 'end' },
    T: { dx: -10, dy: 2, anchor: 'end' },
    P: { dx: 10, dy: 2, anchor: 'start' },
  },
};

const pyramidVolumeRatio: GeometryTask = {
  publicId: 'G14PYR1',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 25/39',
  statement: [
    `Точка $F$ — середина бокового ребра $SA$ правильной четырёхугольной пирамиды $SABCD$, точка $M$ лежит на стороне основания $AB$. Плоскость $\\beta$ проходит через точки $F$ и $M$ параллельно боковому ребру $SC$.`,
    `**а)** Плоскость $\\beta$ пересекает ребро $SD$ в точке $K$. Докажите, что $BM : MA = DK : KS$.`,
    `**б)** Пусть $BM : MA = 3 : 1$. Найдите отношение объёмов многогранников, на которые плоскость $\\beta$ разбивает пирамиду.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(pyramidFigure),
    `Пусть $O$ — точка пересечения диагоналей основания (центр квадрата $ABCD$); тогда $SO$ — высота пирамиды.`,
    `Построим сечение. Плоскость $\\beta$ пересекает грань $ASB$ по прямой $FM$. Так как $\\beta \\parallel SC$, а прямая $SC$ лежит в плоскости $ASC$, то $\\beta$ пересекает эту плоскость по прямой, параллельной $SC$. Эта прямая проходит через середину $SA$ — точку $F$, поэтому она является средней линией треугольника $ASC$ и проходит через середину $AC$, то есть через точку $O$. Значит, $FO \\parallel SC$ и $O \\in \\beta$.`,
    `Продолжим $MO$ до пересечения с прямой $CD$ в точке $T$. В грани $CSD$ проведём $TK \\parallel CS$ ($K \\in SD$). Четырёхугольник $MFKT$ — искомое сечение.`,
    `Рассмотрим треугольники $COT$ и $AOM$: $CO = AO$ (диагонали квадрата точкой пересечения делятся пополам), $\\angle COT = \\angle AOM$ (вертикальные), $\\angle OCT = \\angle OAM$ (накрест лежащие при $CD \\parallel AB$ и секущей $CA$). Значит, $\\triangle COT = \\triangle AOM$, откуда $CT = AM$ и`,
    `$$DT = DC - CT = AB - AM = BM.$$`,
    `В треугольнике $DSC$ прямая $TK \\parallel SC$, поэтому по теореме о пропорциональных отрезках $DK : KS = DT : TC$. Учитывая, что $DT = BM$ и $TC = AM$, получаем`,
    `$$DK : KS = DT : TC = BM : MA.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Отношение объёмов`,
    `Введём обозначения $AB = 4t$, $SO = 2h$. По условию $BM : MA = 3 : 1$, поэтому $BM = 3t$, $MA = t$. Пусть $P$ — точка пересечения плоскости $\\beta$ с прямой $AD$ (она лежит на продолжении ребра $AD$ за точку $A$).`,
    `Опустим из $F$ и $K$ перпендикуляры на плоскость основания. Так как $F$ — середина $SA$, отрезок $FH$ ($H$ — середина $AO$) — средняя линия треугольника $ASO$, поэтому $FH \\parallel SO$ и $FH = \\tfrac{1}{2}SO = h$. Аналогично $KL \\parallel SO$, а из $DK : KS = 3 : 1$ следует $DK : DS = 3 : 4$, поэтому $KL = \\tfrac{3}{4}SO = \\tfrac{3}{2}h$.`,
    `Плоскость $\\beta$ отсекает многогранник объёма $V_1$, который удобно представить как разность двух пирамид с общей вершиной $P$:`,
    `$$V_1 = V_{KDTP} - V_{FAMP} = \\tfrac{1}{3}\\left(S_{DTP}\\cdot KL - S_{AMP}\\cdot FH\\right).$$`,
    `Так как $DT \\parallel AM$ (обе прямые лежат на параллельных сторонах $CD$ и $AB$), треугольники $PDT$ и $PAM$ подобны с коэффициентом $\\dfrac{DT}{AM} = \\dfrac{BM}{MA} = 3$. Значит, $\\dfrac{PD}{PA} = 3$. Так как $PD = PA + AD = PA + 4t$, получаем $PA + 4t = 3\\,PA$, откуда $PA = 2t$, $PD = 6t$.`,
    `Учитывая, что углы $A$ и $D$ квадрата прямые,`,
    `$$S_{DTP} = \\tfrac{1}{2}\\,DT\\cdot DP = \\tfrac{1}{2}\\cdot 3t\\cdot 6t = 9t^2, \\qquad S_{AMP} = \\tfrac{1}{2}\\,AM\\cdot AP = \\tfrac{1}{2}\\cdot t\\cdot 2t = t^2.$$`,
    `$$V_1 = \\tfrac{1}{3}\\left(9t^2\\cdot \\tfrac{3}{2}h - t^2\\cdot h\\right) = \\tfrac{1}{3}\\cdot \\tfrac{25}{2}t^2h = \\tfrac{25}{6}t^2h.$$`,
    `Объём всей пирамиды равен $V = \\tfrac{1}{3}\\,S_{ABCD}\\cdot SO = \\tfrac{1}{3}\\,(4t)^2\\cdot 2h = \\tfrac{32}{3}t^2h$. Тогда`,
    `$$V_2 = V - V_1 = \\tfrac{32}{3}t^2h - \\tfrac{25}{6}t^2h = \\tfrac{13}{2}t^2h,$$`,
    `$$\\frac{V_1}{V_2} = \\frac{25/6}{13/2} = \\frac{25}{39}.$$`,
    `**Ответ:** б) $\\dfrac{25}{39}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · ДОКАЗАТЕЛЬСТВО · BD ⊥ (ASC) В ПРАВИЛЬНОЙ ПИРАМИДЕ
// ─────────────────────────────────────────────────────────────────────────────

const pyramidPerpFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    S: [0, 2.4],
    A: [2.5, -0.1],
    B: [0.5, 1.1],
    C: [-2.5, 0.1],
    D: [-0.5, -1.1],
    O: [0, 0],
  },
  fills: [{ points: ['A', 'S', 'C'] }],
  edges: [
    { from: 'D', to: 'A' },
    { from: 'C', to: 'D' },
    { from: 'A', to: 'B', style: 'dashed' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'S', to: 'A' },
    { from: 'S', to: 'C' },
    { from: 'S', to: 'D' },
    { from: 'S', to: 'B', style: 'dashed' },
    { from: 'A', to: 'C', style: 'section' },
    { from: 'B', to: 'D', style: 'dashed' },
  ],
  labels: {
    S: { dx: 0, dy: -12, anchor: 'middle' },
    A: { dx: 10, dy: 8, anchor: 'start' },
    B: { dx: -8, dy: -4, anchor: 'end' },
    C: { dx: -10, dy: 4, anchor: 'end' },
    D: { dx: -6, dy: 14, anchor: 'end' },
    O: { dx: 9, dy: 10, anchor: 'start' },
  },
};

const pyramidPerp: GeometryTask = {
  publicId: 'G14PRP1',
  topicSlug: 'ege-14-proofs',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 2√2',
  statement: [
    `В правильной четырёхугольной пирамиде $SABCD$ все рёбра равны $4$.`,
    `**а)** Докажите, что прямая $BD$ перпендикулярна плоскости $ASC$.`,
    `**б)** Найдите расстояние от точки $B$ до плоскости $ASC$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(pyramidPerpFigure),
    `Пусть $O$ — точка пересечения диагоналей основания (центр квадрата $ABCD$). Тогда $SO$ — высота пирамиды, то есть $SO \\perp (ABC)$.`,
    `Диагонали квадрата взаимно перпендикулярны, поэтому $BD \\perp AC$. Кроме того, прямая $BD$ лежит в плоскости основания, а $SO \\perp (ABC)$, поэтому $SO \\perp BD$.`,
    `Плоскость $ASC$ содержит прямые $AC$ и $SO$ (точка $O$ лежит на диагонали $AC$). Прямая $BD$ перпендикулярна двум пересекающимся прямым $AC$ и $SO$ этой плоскости, следовательно`,
    `$$BD \\perp (ASC).$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Расстояние от точки $B$ до плоскости`,
    `Так как $BD \\perp (ASC)$ и точка $O \\in (ASC)$ (она лежит на диагонали $AC$), перпендикуляр из $B$ на плоскость $ASC$ — это отрезок $BO$. Значит, расстояние от $B$ до плоскости равно $BO$.`,
    `Отрезок $BO$ — половина диагонали $BD$ квадрата со стороной $4$. Диагональ равна $BD = 4\\sqrt{2}$, поэтому`,
    `$$\\rho(B,\\,ASC) = BO = \\frac{1}{2}\\cdot 4\\sqrt{2} = 2\\sqrt{2}.$$`,
    `**Ответ:** б) $2\\sqrt{2}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · УГЛЫ И РАССТОЯНИЯ · РАССТОЯНИЕ ОТ ЦЕНТРА ДО БОКОВОЙ ГРАНИ
// ─────────────────────────────────────────────────────────────────────────────

const pyramidDistFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    S: [0, 2.4],
    A: [2.5, -0.1],
    B: [0.5, 1.1],
    C: [-2.5, 0.1],
    D: [-0.5, -1.1],
    O: [0, 0],
    K: [-1.5, -0.5],
  },
  fills: [{ points: ['S', 'C', 'D'] }],
  edges: [
    { from: 'D', to: 'A' },
    { from: 'C', to: 'D' },
    { from: 'A', to: 'B', style: 'dashed' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'S', to: 'A' },
    { from: 'S', to: 'C' },
    { from: 'S', to: 'D' },
    { from: 'S', to: 'B', style: 'dashed' },
    { from: 'S', to: 'K', style: 'section' },
    { from: 'O', to: 'K', style: 'dashed' },
  ],
  rightAngles: [{ at: 'K', from: 'S', to: 'D' }],
  labels: {
    S: { dx: 0, dy: -12, anchor: 'middle' },
    A: { dx: 10, dy: 8, anchor: 'start' },
    B: { dx: 8, dy: -2, anchor: 'start' },
    C: { dx: -10, dy: 2, anchor: 'end' },
    D: { dx: 4, dy: 16, anchor: 'start' },
    O: { dx: 9, dy: 8, anchor: 'start' },
    K: { dx: -9, dy: 10, anchor: 'end' },
  },
};

const pyramidDistance: GeometryTask = {
  publicId: 'G14ANG1',
  topicSlug: 'ege-14-angles-distances',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 2√5/5',
  statement: [
    `В правильной четырёхугольной пирамиде $SABCD$ сторона основания $AB = 2$, а высота $SO = 2$ ($O$ — центр основания). Точка $K$ — середина ребра $CD$.`,
    `**а)** Докажите, что $SK \\perp CD$.`,
    `**б)** Найдите расстояние от точки $O$ до плоскости $SCD$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(pyramidDistFigure),
    `Боковые рёбра правильной пирамиды равны, поэтому треугольник $SCD$ равнобедренный: $SC = SD$. Точка $K$ — середина основания $CD$, значит $SK$ — медиана этого треугольника, а в равнобедренном треугольнике медиана, проведённая к основанию, является и высотой. Поэтому`,
    `$$SK \\perp CD.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Расстояние от точки $O$ до плоскости $SCD$`,
    `Отрезок $OK$ соединяет центр квадрата с серединой стороны $CD$, поэтому $OK \\perp CD$ и $OK = \\tfrac{1}{2}AB = 1$.`,
    `Прямая $CD$ перпендикулярна двум пересекающимся прямым $SK$ и $OK$, поэтому $CD \\perp (SOK)$. Плоскость $SCD$ содержит прямую $CD$, значит $(SCD) \\perp (SOK)$, и расстояние от $O$ до плоскости $SCD$ равно расстоянию от точки $O$ до прямой $SK$ в плоскости $SOK$.`,
    `В прямоугольном треугольнике $SOK$ ($\\angle SOK = 90°$, так как $SO \\perp (ABC) \\supset OK$) по теореме Пифагора`,
    `$$SK = \\sqrt{SO^2 + OK^2} = \\sqrt{4 + 1} = \\sqrt{5}.$$`,
    `Расстояние от вершины прямого угла $O$ до гипотенузы $SK$ равно`,
    `$$\\rho(O,\\,SCD) = \\frac{SO \\cdot OK}{SK} = \\frac{2 \\cdot 1}{\\sqrt{5}} = \\frac{2}{\\sqrt{5}} = \\frac{2\\sqrt{5}}{5}.$$`,
    `**Ответ:** б) $\\dfrac{2\\sqrt{5}}{5}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · ОТРЕЗОК ЧЕРЕЗ ТОЧКУ ПЕРЕСЕЧЕНИЯ ДИАГОНАЛЕЙ ТРАПЕЦИИ
// ─────────────────────────────────────────────────────────────────────────────

const trapezoidMnFigure = {
  maxWidth: 420,
  maxHeight: 280,
  points: {
    A: [0, 0],
    D: [6, 0],
    B: [1, 3],
    C: [5, 3],
    O: [3, 1.8],
    M: [0.6, 1.8],
    N: [5.4, 1.8],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D' },
    { from: 'D', to: 'A' },
    { from: 'A', to: 'C', style: 'dashed' },
    { from: 'B', to: 'D', style: 'dashed' },
    { from: 'M', to: 'N', style: 'section' },
  ],
  dims: [
    { from: 'B', to: 'C', text: '4' },
    { from: 'A', to: 'D', text: '6' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    D: { dx: 8, dy: 14, anchor: 'start' },
    B: { dx: -8, dy: -6, anchor: 'end' },
    C: { dx: 8, dy: -6, anchor: 'start' },
    O: { dx: 2, dy: 15, anchor: 'start' },
    M: { dx: -12, dy: 2, anchor: 'end' },
    N: { dx: 12, dy: 2, anchor: 'start' },
  },
};

const trapezoidMidline: GeometryTask = {
  publicId: 'G17TRP1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 4,8',
  statement: [
    `Диагонали трапеции $ABCD$ с основаниями $BC$ и $AD$ пересекаются в точке $O$. Через точку $O$ проведена прямая, параллельная основаниям и пересекающая боковые стороны $AB$ и $CD$ в точках $M$ и $N$ соответственно.`,
    `**а)** Докажите, что $O$ — середина отрезка $MN$.`,
    `**б)** Найдите $MN$, если $BC = 4$ и $AD = 6$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(trapezoidMnFigure),
    `Треугольники $BOC$ и $DOA$ подобны (углы при вершине $O$ вертикальные, а углы $\\angle OBC = \\angle ODA$ накрест лежащие при $BC \\parallel AD$), поэтому`,
    `$$\\frac{BO}{OD} = \\frac{BC}{AD} \\quad\\Rightarrow\\quad \\frac{BO}{BD} = \\frac{BC}{BC + AD}.$$`,
    `В треугольнике $ABD$ отрезок $MO \\parallel AD$, поэтому $\\dfrac{MO}{AD} = \\dfrac{BO}{BD} = \\dfrac{BC}{BC + AD}$.`,
    `Аналогично из подобия ($CO : OA = BC : AD$) в треугольнике $ACD$ отрезок $NO \\parallel AD$ даёт $\\dfrac{NO}{AD} = \\dfrac{CO}{CA} = \\dfrac{BC}{BC + AD}$.`,
    `Значит, $MO = NO$, то есть $O$ — середина отрезка $MN$. **Что и требовалось доказать.**`,
    `## Пункт б). Длина отрезка $MN$`,
    `Из полученных равенств $MO = NO = \\dfrac{BC \\cdot AD}{BC + AD}$, поэтому`,
    `$$MN = 2\\cdot MO = \\frac{2\\,BC\\cdot AD}{BC + AD} = \\frac{2\\cdot 4\\cdot 6}{4 + 6} = \\frac{48}{10} = 4{,}8.$$`,
    `**Ответ:** б) $4{,}8$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · ОТРЕЗКИ КАСАТЕЛЬНЫХ ВПИСАННОЙ ОКРУЖНОСТИ
// ─────────────────────────────────────────────────────────────────────────────

const incircleFigure = {
  maxWidth: 420,
  maxHeight: 380,
  points: {
    A: [5, 12],
    B: [0, 0],
    C: [14, 0],
    P: [2.31, 5.54],
    Q: [9.2, 6.4],
    R: [6, 0],
    I: [6, 4],
  },
  circles: [{ cx: 6, cy: 4, r: 4 }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'A', to: 'P', style: 'section' },
    { from: 'A', to: 'Q', style: 'section' },
    { from: 'I', to: 'P', style: 'dashed' },
    { from: 'I', to: 'Q', style: 'dashed' },
    { from: 'I', to: 'R', style: 'dashed' },
  ],
  rightAngles: [
    { at: 'P', from: 'A', to: 'I' },
    { at: 'Q', from: 'C', to: 'I' },
    { at: 'R', from: 'B', to: 'I' },
  ],
  labels: {
    A: { dx: 0, dy: -12, anchor: 'middle' },
    B: { dx: -8, dy: 14, anchor: 'end' },
    C: { dx: 8, dy: 14, anchor: 'start' },
    P: { dx: -12, dy: 0, anchor: 'end' },
    Q: { dx: 12, dy: 0, anchor: 'start' },
    R: { dx: 0, dy: 16, anchor: 'middle' },
    I: { dx: 10, dy: 2, anchor: 'start' },
  },
};

const incircleTangents: GeometryTask = {
  publicId: 'G17INC1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 7',
  statement: [
    `Вписанная в треугольник $ABC$ окружность касается сторон $AB$ и $CA$ в точках $P$ и $Q$ соответственно.`,
    `**а)** Докажите, что $AP = AQ = \\dfrac{AB + CA - BC}{2}$.`,
    `**б)** Найдите $AP$, если $AB = 13$, $BC = 14$, $CA = 15$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(incircleFigure),
    `Пусть окружность касается сторон $AB$, $BC$ и $CA$ в точках $P$, $R$ и $Q$. Отрезки касательных, проведённых к окружности из одной точки, равны, поэтому`,
    `$$AP = AQ = x, \\qquad BP = BR = y, \\qquad CQ = CR = z.$$`,
    `Тогда стороны треугольника выражаются так:`,
    `$$AB = x + y, \\qquad BC = y + z, \\qquad CA = z + x.$$`,
    `Сложив три равенства, получим $AB + BC + CA = 2(x + y + z)$, откуда $x + y + z = \\dfrac{AB + BC + CA}{2}$. Вычитая отсюда $BC = y + z$, находим`,
    `$$AP = x = \\frac{AB + BC + CA}{2} - BC = \\frac{AB + CA - BC}{2}.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Вычисление $AP$`,
    `Подставим $AB = 13$, $BC = 14$, $CA = 15$:`,
    `$$AP = \\frac{AB + CA - BC}{2} = \\frac{13 + 15 - 14}{2} = \\frac{14}{2} = 7.$$`,
    `**Ответ:** б) $7$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · ДОКАЗАТЕЛЬСТВО · ДИАГОНАЛЬ КУБА ⊥ СЕЧЕНИЮ ACB₁
// ─────────────────────────────────────────────────────────────────────────────

const cubeDiagFigure = {
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
  },
  fills: [{ points: ['A', 'C', 'B1'] }],
  edges: [
    { from: 'D', to: 'A' },
    { from: 'A', to: 'B' },
    { from: 'D1', to: 'A1' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'D1' },
    { from: 'D', to: 'D1' },
    { from: 'A', to: 'A1' },
    { from: 'B', to: 'B1' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'C', to: 'C1', style: 'dashed' },
    { from: 'A', to: 'C', style: 'section' },
    { from: 'C', to: 'B1', style: 'section' },
    { from: 'A', to: 'B1', style: 'section' },
    { from: 'B', to: 'D1', style: 'dashed' },
  ],
  labels: {
    D: { dx: -6, dy: 16, anchor: 'end' },
    A: { dx: 4, dy: 16, anchor: 'start' },
    B: { dx: 12, dy: 6, anchor: 'start' },
    C: { dx: 10, dy: 11, anchor: 'start' },
    D1: { dx: -12, dy: 2, anchor: 'end' },
    A1: { dx: -12, dy: 4, anchor: 'end' },
    B1: { dx: 8, dy: -6, anchor: 'start' },
    C1: { dx: -8, dy: -8, anchor: 'end' },
  },
};

const cubeDiagonal: GeometryTask = {
  publicId: 'G14CUB2',
  topicSlug: 'ege-14-proofs',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 2√3',
  statement: [
    `Дан куб $ABCDA_1B_1C_1D_1$ с ребром $6$.`,
    `**а)** Докажите, что прямая $BD_1$ перпендикулярна плоскости $ACB_1$.`,
    `**б)** Найдите расстояние от точки $B$ до плоскости $ACB_1$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(cubeDiagFigure),
    `Введём систему координат с началом в точке $D$: оси направим вдоль рёбер $DA$, $DC$ и $DD_1$. Тогда`,
    `$$A(6;\\,0;\\,0),\\ C(0;\\,6;\\,0),\\ B(6;\\,6;\\,0),\\ B_1(6;\\,6;\\,6),\\ D_1(0;\\,0;\\,6).$$`,
    `Найдём нормаль к плоскости $ACB_1$ как векторное произведение $\\vec{AC}$ и $\\vec{AB_1}$:`,
    `$$\\vec{AC} = (-6;\\,6;\\,0), \\quad \\vec{AB_1} = (0;\\,6;\\,6), \\quad \\vec{n} = \\vec{AC}\\times\\vec{AB_1} = (36;\\,36;\\,-36).$$`,
    `Вектор направляющей прямой $BD_1$ равен $\\vec{BD_1} = D_1 - B = (-6;\\,-6;\\,6)$. Поскольку`,
    `$$\\vec{BD_1} = -\\tfrac{1}{6}\\,\\vec{n},$$`,
    `векторы коллинеарны, значит $BD_1 \\perp (ACB_1)$. **Что и требовалось доказать.**`,
    `## Пункт б). Расстояние от точки $B$ до плоскости`,
    `Уравнение плоскости $ACB_1$ с нормалью $(1;\\,1;\\,-1)$, проходящей через $A(6;0;0)$: $x + y - z - 6 = 0$. Тогда`,
    `$$\\rho(B,\\,ACB_1) = \\frac{|6 + 6 - 0 - 6|}{\\sqrt{1^2 + 1^2 + 1^2}} = \\frac{6}{\\sqrt{3}} = 2\\sqrt{3}.$$`,
    `**Ответ:** б) $2\\sqrt{3}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · УГЛЫ И РАССТОЯНИЯ · ДВУГРАННЫЙ УГОЛ ПРИ ОСНОВАНИИ ПИРАМИДЫ
// ─────────────────────────────────────────────────────────────────────────────

const pyramidDihedralFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    S: [0, 2.4],
    A: [2.5, -0.1],
    B: [0.5, 1.1],
    C: [-2.5, 0.1],
    D: [-0.5, -1.1],
    O: [0, 0],
    K: [-1.5, -0.5],
  },
  fills: [{ points: ['S', 'C', 'D'] }],
  edges: [
    { from: 'D', to: 'A' },
    { from: 'C', to: 'D' },
    { from: 'A', to: 'B', style: 'dashed' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'S', to: 'A' },
    { from: 'S', to: 'C' },
    { from: 'S', to: 'D' },
    { from: 'S', to: 'B', style: 'dashed' },
    { from: 'S', to: 'K', style: 'section' },
    { from: 'O', to: 'K', style: 'dashed' },
    { from: 'S', to: 'O', style: 'dashed' },
  ],
  angles: [{ at: 'K', from: 'S', to: 'O', label: '45°' }],
  labels: {
    S: { dx: 0, dy: -12, anchor: 'middle' },
    A: { dx: 10, dy: 8, anchor: 'start' },
    B: { dx: 8, dy: -2, anchor: 'start' },
    C: { dx: -10, dy: 2, anchor: 'end' },
    D: { dx: 4, dy: 16, anchor: 'start' },
    O: { dx: 9, dy: 8, anchor: 'start' },
    K: { dx: -9, dy: 10, anchor: 'end' },
  },
};

const pyramidDihedral: GeometryTask = {
  publicId: 'G14ANG2',
  topicSlug: 'ege-14-angles-distances',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 45°',
  statement: [
    `В правильной четырёхугольной пирамиде $SABCD$ сторона основания $AB = 2$, а высота $SO = 1$ ($O$ — центр основания). Точка $K$ — середина ребра $CD$.`,
    `**а)** Докажите, что $\\angle SKO$ — линейный угол двугранного угла между боковой гранью $SCD$ и плоскостью основания.`,
    `**б)** Найдите двугранный угол между гранью $SCD$ и плоскостью основания.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(pyramidDihedralFigure),
    `Ребро двугранного угла — прямая $CD$. Точка $K$ — середина $CD$.`,
    `Треугольник $SCD$ равнобедренный ($SC = SD$), поэтому медиана $SK$ является высотой: $SK \\perp CD$.`,
    `Отрезок $OK$ соединяет центр основания с серединой стороны $CD$, поэтому $OK \\perp CD$.`,
    `Обе прямые $SK$ и $OK$ перпендикулярны ребру $CD$ в одной точке $K$, значит $\\angle SKO$ — линейный угол двугранного угла между гранью $SCD$ и основанием. **Что и требовалось доказать.**`,
    `## Пункт б). Величина угла`,
    `$OK = \\tfrac{1}{2}AB = 1$. В прямоугольном треугольнике $SOK$ ($\\angle SOK = 90°$, так как $SO \\perp$ основанию)`,
    `$$\\operatorname{tg}\\angle SKO = \\frac{SO}{OK} = \\frac{1}{1} = 1 \\;\\Rightarrow\\; \\angle SKO = 45°.$$`,
    `**Ответ:** б) $45°$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · МЕДИАНА К ГИПОТЕНУЗЕ
// ─────────────────────────────────────────────────────────────────────────────

const medianHypotenuseFigure = {
  maxWidth: 400,
  maxHeight: 360,
  points: {
    C: [0, 0],
    A: [0, 6],
    B: [8, 0],
    M: [4, 3],
  },
  circles: [{ cx: 4, cy: 3, r: 5 }],
  edges: [
    { from: 'C', to: 'A' },
    { from: 'C', to: 'B' },
    { from: 'A', to: 'B' },
    { from: 'C', to: 'M', style: 'section' },
  ],
  rightAngles: [{ at: 'C', from: 'A', to: 'B' }],
  labels: {
    C: { dx: -8, dy: 14, anchor: 'end' },
    A: { dx: -8, dy: -4, anchor: 'end' },
    B: { dx: 10, dy: 12, anchor: 'start' },
    M: { dx: 10, dy: -4, anchor: 'start' },
  },
};

const medianHypotenuse: GeometryTask = {
  publicId: 'G17MED2',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 5',
  statement: [
    `В прямоугольном треугольнике $ABC$ с прямым углом $C$ проведена медиана $CM$ к гипотенузе $AB$.`,
    `**а)** Докажите, что $CM = \\dfrac{1}{2}AB$.`,
    `**б)** Найдите $CM$, если катеты равны $6$ и $8$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(medianHypotenuseFigure),
    `Опишем окружность около треугольника $ABC$. Вписанный угол $\\angle ACB = 90°$ опирается на сторону $AB$, поэтому $AB$ — диаметр этой окружности, а её центр — середина $AB$, то есть точка $M$.`,
    `Тогда $MA = MB = MC$ как радиусы окружности, поэтому`,
    `$$CM = MA = \\frac{1}{2}AB.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Вычисление $CM$`,
    `По теореме Пифагора гипотенуза равна`,
    `$$AB = \\sqrt{AC^2 + BC^2} = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10,$$`,
    `поэтому $CM = \\tfrac{1}{2}AB = 5$.`,
    `**Ответ:** б) $5$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · МЕДИАНЫ, ТОЧКА ПЕРЕСЕЧЕНИЯ, ПЛОЩАДЬ
// ─────────────────────────────────────────────────────────────────────────────

const centroidFigure = {
  maxWidth: 420,
  maxHeight: 340,
  points: {
    A: [0, 6],
    B: [-4, 0],
    C: [4, 0],
    M: [-2, 3],
    N: [2, 3],
    O: [0, 2],
  },
  fills: [{ points: ['M', 'O', 'N'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'B', to: 'N', style: 'dashed' },
    { from: 'C', to: 'M', style: 'dashed' },
    { from: 'M', to: 'N', style: 'section' },
  ],
  labels: {
    A: { dx: 0, dy: -12, anchor: 'middle' },
    B: { dx: -8, dy: 14, anchor: 'end' },
    C: { dx: 8, dy: 14, anchor: 'start' },
    M: { dx: -12, dy: 0, anchor: 'end' },
    N: { dx: 12, dy: 0, anchor: 'start' },
    O: { dx: 8, dy: 12, anchor: 'start' },
  },
};

const centroidArea: GeometryTask = {
  publicId: 'G17CEN1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 12',
  statement: [
    `В треугольнике $ABC$ точки $M$ и $N$ — середины сторон $AB$ и $AC$ соответственно. Отрезки $BN$ и $CM$ пересекаются в точке $O$.`,
    `**а)** Докажите, что $BO : ON = 2 : 1$.`,
    `**б)** Найдите площадь треугольника $ABC$, если площадь треугольника $MON$ равна $1$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(centroidFigure),
    `Так как $M$ и $N$ — середины сторон $AB$ и $AC$, отрезки $BN$ и $CM$ — медианы треугольника $ABC$. Медианы пересекаются в одной точке (центроиде), которая делит каждую из них в отношении $2 : 1$, считая от вершины. Поэтому`,
    `$$BO : ON = 2 : 1.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Площадь треугольника $ABC$`,
    `Обозначим высоту треугольника $ABC$, опущенную из вершины $A$ на $BC$, через $h$, а $BC = a$. Тогда $S_{ABC} = \\tfrac{1}{2}ah$.`,
    `Средняя линия $MN \\parallel BC$ и $MN = \\tfrac{1}{2}a$; она находится на расстоянии $\\tfrac{1}{2}h$ от вершины $A$. Точка $O$ делит медиану из $A$ в отношении $2 : 1$, поэтому она удалена от $A$ на $\\tfrac{2}{3}h$. Значит, расстояние от $O$ до прямой $MN$ равно $\\tfrac{2}{3}h - \\tfrac{1}{2}h = \\tfrac{1}{6}h$.`,
    `Площадь треугольника $MON$ с основанием $MN$:`,
    `$$S_{MON} = \\frac{1}{2}\\cdot MN \\cdot \\frac{h}{6} = \\frac{1}{2}\\cdot \\frac{a}{2}\\cdot \\frac{h}{6} = \\frac{ah}{24} = \\frac{1}{12}S_{ABC}.$$`,
    `Отсюда $S_{ABC} = 12\\,S_{MON} = 12\\cdot 1 = 12$.`,
    `**Ответ:** б) $12$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СЕЧЕНИЯ · СЕЧЕНИЕ ПИРАМИДЫ ЧЕРЕЗ СТОРОНУ ОСНОВАНИЯ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const sectionAbmn3dFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    A: [-2, 0],
    B: [2, 0],
    C: [3.2, 1.5],
    D: [-0.8, 1.5],
    S: [0.6, 4.5],
    M: [1.9, 3],
    N: [-0.1, 3],
  },
  fills: [{ points: ['A', 'B', 'M', 'N'] }],
  edges: [
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D', to: 'A', style: 'dashed' },
    { from: 'S', to: 'A' },
    { from: 'S', to: 'B' },
    { from: 'S', to: 'C' },
    { from: 'S', to: 'D', style: 'dashed' },
    { from: 'A', to: 'B', style: 'section' },
    { from: 'B', to: 'M', style: 'section' },
    { from: 'M', to: 'N', style: 'section' },
    { from: 'N', to: 'A', style: 'section' },
  ],
  labels: {
    S: { dx: 0, dy: -12, anchor: 'middle' },
    A: { dx: -8, dy: 14, anchor: 'end' },
    B: { dx: 8, dy: 14, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    D: { dx: -10, dy: -4, anchor: 'end' },
    M: { dx: 11, dy: 2, anchor: 'start' },
    N: { dx: -11, dy: -2, anchor: 'end' },
  },
};

const sectionAbmnFlatFigure = {
  maxWidth: 400,
  maxHeight: 300,
  points: {
    A: [0, 0],
    B: [4, 0],
    M: [3, 4.243],
    N: [1, 4.243],
    P: [2, 0],
    Q: [2, 4.243],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'M', ticks: 1 },
    { from: 'M', to: 'N' },
    { from: 'N', to: 'A', ticks: 1 },
    { from: 'P', to: 'Q', style: 'dashed' },
  ],
  rightAngles: [{ at: 'P', from: 'A', to: 'Q' }],
  dims: [
    { from: 'A', to: 'B', text: '4' },
    { from: 'M', to: 'N', text: '2' },
    { from: 'P', to: 'Q', text: '3√2' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    B: { dx: 8, dy: 14, anchor: 'start' },
    M: { dx: 8, dy: -4, anchor: 'start' },
    N: { dx: -8, dy: -4, anchor: 'end' },
    P: false,
    Q: false,
  },
};

const pyramidSectionAbmn: GeometryTask = {
  publicId: 'G14SEC2',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 9√2',
  statement: [
    `В правильной четырёхугольной пирамиде $SABCD$ через сторону основания $AB$ и середину $M$ бокового ребра $SC$ проведено сечение.`,
    `**а)** Докажите, что это сечение — трапеция.`,
    `**б)** Найдите площадь сечения, если сторона основания равна $4$, а высота пирамиды равна $6$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(sectionAbmn3dFigure),
    `Секущая плоскость проходит через сторону основания $AB$ и точку $M$ — середину ребра $SC$. Так как $AB \\parallel CD$, а прямая $AB$ лежит в секущей плоскости, то плоскость пересекает грань $SCD$ по прямой, проходящей через $M$ параллельно $CD$.`,
    `Эта прямая — средняя линия треугольника $SCD$, поэтому она проходит через середину $N$ ребра $SD$, причём $MN \\parallel CD \\parallel AB$ и $MN = \\tfrac{1}{2}CD$.`,
    `Итак, сечение — четырёхугольник $ABMN$, у которого $AB \\parallel MN$. Значит, сечение — трапеция. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь сечения`,
    `Введём координаты с началом в центре основания $O$: $A(2;-2;0)$, $B(2;2;0)$, $C(-2;2;0)$, $D(-2;-2;0)$, $S(0;0;6)$. Тогда $M(-1;1;3)$ и $N(-1;-1;3)$.`,
    `Основания трапеции: $AB = 4$ и $MN = \\tfrac{1}{2}CD = 2$. Пусть $P(2;0;0)$ и $Q(-1;0;3)$ — середины оснований $AB$ и $MN$. Вектор $\\vec{PQ}=(-3;0;3)$ перпендикулярен направлению оснований $(0;1;0)$, поэтому $PQ$ — высота трапеции:`,
    `$$h = PQ = \\sqrt{(-3)^2 + 0^2 + 3^2} = 3\\sqrt{2}.$$`,
    geo(sectionAbmnFlatFigure),
    `$$S_{ABMN} = \\frac{AB + MN}{2}\\cdot h = \\frac{4 + 2}{2}\\cdot 3\\sqrt{2} = 9\\sqrt{2}.$$`,
    `**Ответ:** б) $9\\sqrt{2}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · УГЛЫ И РАССТОЯНИЯ · РАССТОЯНИЕ ОТ ВЕРШИНЫ КУБА ДО ПЛОСКОСТИ (2 рис.)
// ─────────────────────────────────────────────────────────────────────────────

const cubePlane3dFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    A: [0, 0],
    B: [3, 0],
    C: [4.2, 1.2],
    D: [1.2, 1.2],
    A1: [0, 3],
    B1: [3, 3],
    C1: [4.2, 4.2],
    D1: [1.2, 4.2],
  },
  fills: [{ points: ['A1', 'B', 'D'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D', to: 'A', style: 'dashed' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'D1' },
    { from: 'D1', to: 'A1' },
    { from: 'A', to: 'A1' },
    { from: 'B', to: 'B1' },
    { from: 'C', to: 'C1' },
    { from: 'D', to: 'D1', style: 'dashed' },
    { from: 'A1', to: 'B', style: 'section' },
    { from: 'B', to: 'D', style: 'section' },
    { from: 'D', to: 'A1', style: 'section' },
    { from: 'A', to: 'C1', style: 'dashed' },
  ],
  labels: {
    A: { dx: -6, dy: 16, anchor: 'end' },
    B: { dx: 4, dy: 16, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    D: { dx: -8, dy: -6, anchor: 'end' },
    A1: { dx: -12, dy: 2, anchor: 'end' },
    B1: { dx: 8, dy: 2, anchor: 'start' },
    C1: { dx: 10, dy: -2, anchor: 'start' },
    D1: { dx: -2, dy: -10, anchor: 'middle' },
  },
};

const equilateralTriangleFigure = {
  maxWidth: 360,
  maxHeight: 340,
  points: {
    A1: [0, 0],
    B: [4.243, 0],
    D: [2.121, 3.674],
  },
  edges: [
    { from: 'A1', to: 'B', ticks: 1 },
    { from: 'B', to: 'D', ticks: 1 },
    { from: 'D', to: 'A1', ticks: 1 },
  ],
  dims: [{ from: 'A1', to: 'B', text: '3√2' }],
  labels: {
    A1: { dx: -8, dy: 14, anchor: 'end' },
    B: { dx: 8, dy: 14, anchor: 'start' },
    D: { dx: 0, dy: -12, anchor: 'middle' },
  },
};

const cubePlaneDistance: GeometryTask = {
  publicId: 'G14ANG3',
  topicSlug: 'ege-14-angles-distances',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) √3',
  statement: [
    `Дан куб $ABCDA_1B_1C_1D_1$ с ребром $3$.`,
    `**а)** Докажите, что диагональ $AC_1$ перпендикулярна плоскости $A_1BD$.`,
    `**б)** Найдите расстояние от точки $A$ до плоскости $A_1BD$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(cubePlane3dFigure),
    `Введём систему координат с началом в точке $A$: оси направим вдоль рёбер $AB$, $AD$ и $AA_1$. Тогда`,
    `$$B(3;0;0),\\ D(0;3;0),\\ A_1(0;0;3),\\ C_1(3;3;3).$$`,
    `Точки $A_1$, $B$, $D$ удовлетворяют уравнению $x + y + z = 3$, поэтому это уравнение плоскости $A_1BD$, а её нормаль — вектор $(1;1;1)$.`,
    `Направляющий вектор диагонали $\\vec{AC_1} = (3;3;3) = 3\\,(1;1;1)$ коллинеарен нормали, значит $AC_1 \\perp (A_1BD)$. **Что и требовалось доказать.**`,
    `## Пункт б). Расстояние от точки $A$ до плоскости`,
    `Найдём расстояние через объём тетраэдра $AA_1BD$. Рёбра $AB$, $AD$, $AA_1$ попарно перпендикулярны, поэтому`,
    `$$V = \\frac{1}{6}\\,AB\\cdot AD\\cdot AA_1 = \\frac{1}{6}\\cdot 3\\cdot 3\\cdot 3 = \\frac{27}{6} = 4{,}5.$$`,
    `Треугольник $A_1BD$ равносторонний: его стороны $A_1B = BD = DA_1 = 3\\sqrt{2}$ — диагонали граней куба. Его площадь`,
    `$$S_{A_1BD} = \\frac{\\sqrt{3}}{4}\\,(3\\sqrt{2})^2 = \\frac{\\sqrt{3}}{4}\\cdot 18 = \\frac{9\\sqrt{3}}{2}.$$`,
    geo(equilateralTriangleFigure),
    `Тогда расстояние от $A$ до плоскости $A_1BD$ равно`,
    `$$\\rho(A,\\,A_1BD) = \\frac{3V}{S_{A_1BD}} = \\frac{3\\cdot 4{,}5}{\\tfrac{9\\sqrt{3}}{2}} = \\frac{27}{9\\sqrt{3}} = \\frac{3}{\\sqrt{3}} = \\sqrt{3}.$$`,
    `**Ответ:** б) $\\sqrt{3}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · МЕДИАНА, РАВНАЯ ПОЛОВИНЕ СТОРОНЫ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const medianCircleFigure = {
  maxWidth: 400,
  maxHeight: 340,
  points: {
    A: [3, 4],
    B: [-5, 0],
    C: [5, 0],
    M: [0, 0],
  },
  circles: [{ cx: 0, cy: 0, r: 5 }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'C' },
    { from: 'A', to: 'M', style: 'section', ticks: 1 },
    { from: 'B', to: 'M', ticks: 1 },
    { from: 'M', to: 'C', ticks: 1 },
  ],
  rightAngles: [{ at: 'A', from: 'B', to: 'C' }],
  labels: {
    A: { dx: 0, dy: -12, anchor: 'middle' },
    B: { dx: -8, dy: 14, anchor: 'end' },
    C: { dx: 8, dy: 14, anchor: 'start' },
    M: { dx: 0, dy: 16, anchor: 'middle' },
  },
};

const rightTriangleAreaFigure = {
  maxWidth: 360,
  maxHeight: 360,
  points: {
    A: [0, 0],
    B: [6, 0],
    C: [0, 8],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'C' },
  ],
  rightAngles: [{ at: 'A', from: 'B', to: 'C' }],
  dims: [
    { from: 'A', to: 'B', text: '6' },
    { from: 'A', to: 'C', text: '8' },
    { from: 'B', to: 'C', text: '10' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    B: { dx: 8, dy: 14, anchor: 'start' },
    C: { dx: -8, dy: -4, anchor: 'end' },
  },
};

const medianRightAngle: GeometryTask = {
  publicId: 'G17RTM1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: SOURCE,
  correctAnswer: 'б) 24',
  statement: [
    `Медиана $AM$ треугольника $ABC$, проведённая к стороне $BC$, равна половине этой стороны.`,
    `**а)** Докажите, что $\\angle BAC = 90°$.`,
    `**б)** Найдите площадь треугольника $ABC$, если $AB = 6$ и $AC = 8$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(medianCircleFigure),
    `Точка $M$ — середина $BC$, поэтому $BM = CM = \\tfrac{1}{2}BC$. По условию $AM = \\tfrac{1}{2}BC$, значит`,
    `$$AM = BM = CM.$$`,
    `Точки $A$, $B$, $C$ равноудалены от $M$, поэтому лежат на окружности с центром $M$ и радиусом $\\tfrac{1}{2}BC$, для которой $BC$ — диаметр. Вписанный угол $\\angle BAC$ опирается на диаметр $BC$, следовательно $\\angle BAC = 90°$. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь треугольника`,
    `Так как $\\angle BAC = 90°$, треугольник прямоугольный с катетами $AB$ и $AC$, поэтому`,
    geo(rightTriangleAreaFigure),
    `$$S_{ABC} = \\frac{1}{2}\\,AB\\cdot AC = \\frac{1}{2}\\cdot 6\\cdot 8 = 24.$$`,
    `**Ответ:** б) $24$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · ПЕРЕСЕКАЮЩИЕСЯ ХОРДЫ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const chordsCircleFigure = {
  maxWidth: 380,
  maxHeight: 380,
  points: {
    A: [-4, -3],
    B: [5, 0],
    C: [-3, 4],
    D: [4, -3],
    E: [2, -1],
  },
  circles: [{ cx: 0, cy: 0, r: 5 }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'C', to: 'D' },
  ],
  labels: {
    A: { dx: -8, dy: 8, anchor: 'end' },
    B: { dx: 10, dy: 2, anchor: 'start' },
    C: { dx: -8, dy: -4, anchor: 'end' },
    D: { dx: 8, dy: 8, anchor: 'start' },
    E: { dx: 8, dy: 8, anchor: 'start' },
  },
};

const chordsSimilarFigure = {
  maxWidth: 380,
  maxHeight: 340,
  points: {
    A: [-4, -3],
    B: [5, 0],
    C: [-3, 4],
    D: [4, -3],
    E: [2, -1],
  },
  fills: [{ points: ['A', 'E', 'C'] }, { points: ['D', 'E', 'B'] }],
  edges: [
    { from: 'A', to: 'E' },
    { from: 'E', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'D', to: 'E' },
    { from: 'E', to: 'B' },
    { from: 'B', to: 'D' },
  ],
  angles: [
    { at: 'A', from: 'E', to: 'C', label: 'α' },
    { at: 'D', from: 'E', to: 'B', label: 'α' },
  ],
  labels: {
    A: { dx: -8, dy: 8, anchor: 'end' },
    B: { dx: 10, dy: 2, anchor: 'start' },
    C: { dx: -8, dy: -4, anchor: 'end' },
    D: { dx: 8, dy: 8, anchor: 'start' },
    E: { dx: 6, dy: 10, anchor: 'start' },
  },
};

const intersectingChords: GeometryTask = {
  publicId: 'G17CHD1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: EXAMCLASS,
  correctAnswer: 'б) 8',
  statement: [
    `Хорды $AB$ и $CD$ окружности пересекаются в точке $E$.`,
    `**а)** Докажите, что $AE \\cdot BE = CE \\cdot DE$.`,
    `**б)** Найдите $DE$, если $AE = 4$, $BE = 6$, $CE = 3$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(chordsCircleFigure),
    `Рассмотрим треугольники $AEC$ и $DEB$. Углы $\\angle AEC$ и $\\angle DEB$ равны как вертикальные. Углы $\\angle CAE$ и $\\angle BDE$ равны как вписанные, опирающиеся на одну и ту же дугу $BC$.`,
    geo(chordsSimilarFigure),
    `Значит, $\\triangle AEC \\sim \\triangle DEB$ по двум углам, откуда`,
    `$$\\frac{AE}{DE} = \\frac{CE}{BE} \\quad\\Rightarrow\\quad AE \\cdot BE = CE \\cdot DE.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Вычисление $DE$`,
    `Подставим $AE = 4$, $BE = 6$, $CE = 3$ в доказанное равенство:`,
    `$$4 \\cdot 6 = 3 \\cdot DE \\quad\\Rightarrow\\quad DE = \\frac{24}{3} = 8.$$`,
    `**Ответ:** б) $8$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · ДОКАЗАТЕЛЬСТВО · РОМБ В КУБЕ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const rhombusCubeFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    A: [0, 0],
    B: [3, 0],
    C: [4.2, 1.2],
    D: [1.2, 1.2],
    A1: [0, 3],
    B1: [3, 3],
    C1: [4.2, 4.2],
    D1: [1.2, 4.2],
    E: [3, 1.5],
    F: [1.2, 2.7],
  },
  fills: [{ points: ['A', 'E', 'C1', 'F'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D', to: 'A', style: 'dashed' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'D1' },
    { from: 'D1', to: 'A1' },
    { from: 'A', to: 'A1' },
    { from: 'B', to: 'B1' },
    { from: 'C', to: 'C1' },
    { from: 'D', to: 'D1', style: 'dashed' },
    { from: 'A', to: 'E', style: 'section' },
    { from: 'E', to: 'C1', style: 'section' },
    { from: 'C1', to: 'F', style: 'section' },
    { from: 'F', to: 'A', style: 'section' },
  ],
  labels: {
    A: { dx: -6, dy: 14, anchor: 'end' },
    B: { dx: 2, dy: 16, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    D: { dx: -8, dy: -6, anchor: 'end' },
    A1: { dx: -12, dy: 2, anchor: 'end' },
    B1: { dx: 8, dy: 2, anchor: 'start' },
    C1: { dx: 10, dy: -2, anchor: 'start' },
    D1: { dx: -2, dy: -10, anchor: 'middle' },
    E: { dx: 11, dy: 2, anchor: 'start' },
    F: { dx: -11, dy: 2, anchor: 'end' },
  },
};

const rhombusFlatFigure = {
  maxWidth: 380,
  maxHeight: 320,
  points: {
    A: [-1.732, 0],
    C1: [1.732, 0],
    E: [0, 1.414],
    F: [0, -1.414],
    O: [0, 0],
  },
  fills: [{ points: ['A', 'E', 'C1', 'F'] }],
  edges: [
    { from: 'A', to: 'E' },
    { from: 'E', to: 'C1' },
    { from: 'C1', to: 'F' },
    { from: 'F', to: 'A' },
    { from: 'A', to: 'C1', style: 'dashed' },
    { from: 'E', to: 'F', style: 'dashed' },
  ],
  rightAngles: [{ at: 'O', from: 'C1', to: 'E' }],
  dims: [
    { from: 'A', to: 'C1', text: '2√3' },
    { from: 'E', to: 'F', text: '2√2' },
  ],
  labels: {
    A: { dx: -10, dy: 4, anchor: 'end' },
    C1: { dx: 10, dy: 4, anchor: 'start' },
    E: { dx: 0, dy: -10, anchor: 'middle' },
    F: { dx: 0, dy: 16, anchor: 'middle' },
    O: false,
  },
};

const rhombusInCube: GeometryTask = {
  publicId: 'G14PRP2',
  topicSlug: 'ege-14-proofs',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: 'б) 2√6',
  statement: [
    `В кубе $ABCDA_1B_1C_1D_1$ с ребром $2$ точки $E$ и $F$ — середины рёбер $BB_1$ и $DD_1$ соответственно.`,
    `**а)** Докажите, что четырёхугольник $AEC_1F$ — ромб.`,
    `**б)** Найдите площадь четырёхугольника $AEC_1F$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(rhombusCubeFigure),
    `Введём координаты с началом в $A$: $A(0;0;0)$, $E(2;0;1)$, $C_1(2;2;2)$, $F(0;2;1)$.`,
    `Найдём стороны четырёхугольника: $\\vec{AE}=(2;0;1)$, $\\vec{FC_1}=(2;0;1)$ — значит $AE \\parallel FC_1$ и $AE = FC_1$, то есть $AEC_1F$ — параллелограмм. Далее`,
    `$$AE = \\sqrt{2^2+0^2+1^2} = \\sqrt{5}, \\qquad EC_1 = \\sqrt{0^2+2^2+1^2} = \\sqrt{5}.$$`,
    `Соседние стороны равны, поэтому параллелограмм $AEC_1F$ — ромб. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь ромба`,
    `Площадь ромба равна половине произведения диагоналей. Диагонали:`,
    `$$AC_1 = \\sqrt{2^2+2^2+2^2} = 2\\sqrt{3}, \\qquad EF = \\sqrt{2^2+2^2+0^2} = 2\\sqrt{2}.$$`,
    geo(rhombusFlatFigure),
    `$$S_{AEC_1F} = \\frac{1}{2}\\,AC_1\\cdot EF = \\frac{1}{2}\\cdot 2\\sqrt{3}\\cdot 2\\sqrt{2} = 2\\sqrt{6}.$$`,
    `**Ответ:** б) $2\\sqrt{6}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СЕЧЕНИЯ · ПРАВИЛЬНЫЙ ШЕСТИУГОЛЬНИК В СЕЧЕНИИ КУБА (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const hexSection3dFigure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    A: [0, 0],
    B: [3, 0],
    C: [4.2, 1.2],
    D: [1.2, 1.2],
    A1: [0, 3],
    B1: [3, 3],
    C1: [4.2, 4.2],
    D1: [1.2, 4.2],
    P1: [1.5, 0],
    P2: [3.6, 0.6],
    P3: [4.2, 2.7],
    P4: [2.7, 4.2],
    P5: [0.6, 3.6],
    P6: [0, 1.5],
  },
  fills: [{ points: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D', to: 'A', style: 'dashed' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'D1' },
    { from: 'D1', to: 'A1' },
    { from: 'A', to: 'A1' },
    { from: 'B', to: 'B1' },
    { from: 'C', to: 'C1' },
    { from: 'D', to: 'D1', style: 'dashed' },
    { from: 'P1', to: 'P2', style: 'section' },
    { from: 'P2', to: 'P3', style: 'section' },
    { from: 'P3', to: 'P4', style: 'section' },
    { from: 'P4', to: 'P5', style: 'section' },
    { from: 'P5', to: 'P6', style: 'section' },
    { from: 'P6', to: 'P1', style: 'section' },
  ],
  labels: {
    A: { dx: -6, dy: 14, anchor: 'end' },
    B: { dx: 2, dy: 16, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    D: { dx: -8, dy: -6, anchor: 'end' },
    A1: { dx: -12, dy: 2, anchor: 'end' },
    B1: { dx: 8, dy: 2, anchor: 'start' },
    C1: { dx: 10, dy: -2, anchor: 'start' },
    D1: { dx: -2, dy: -10, anchor: 'middle' },
    P1: false,
    P2: false,
    P3: false,
    P4: false,
    P5: false,
    P6: false,
  },
};

const hexFlatFigure = {
  maxWidth: 360,
  maxHeight: 340,
  points: {
    V1: [4.243, 0],
    V2: [2.121, 3.674],
    V3: [-2.121, 3.674],
    V4: [-4.243, 0],
    V5: [-2.121, -3.674],
    V6: [2.121, -3.674],
  },
  edges: [
    { from: 'V1', to: 'V2', ticks: 1 },
    { from: 'V2', to: 'V3', ticks: 1 },
    { from: 'V3', to: 'V4', ticks: 1 },
    { from: 'V4', to: 'V5', ticks: 1 },
    { from: 'V5', to: 'V6', ticks: 1 },
    { from: 'V6', to: 'V1', ticks: 1 },
  ],
  dims: [{ from: 'V1', to: 'V2', text: '3√2' }],
  labels: {
    V1: false,
    V2: false,
    V3: false,
    V4: false,
    V5: false,
    V6: false,
  },
};

const hexSection: GeometryTask = {
  publicId: 'G14SEC3',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: STATGRAD,
  correctAnswer: 'б) 27√3',
  statement: [
    `В кубе $ABCDA_1B_1C_1D_1$ с ребром $6$ проведено сечение плоскостью, проходящей через середины рёбер $AB$, $BC$, $CC_1$, $C_1D_1$, $D_1A_1$ и $A_1A$.`,
    `**а)** Докажите, что это сечение — правильный шестиугольник.`,
    `**б)** Найдите площадь сечения.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(hexSection3dFigure),
    `Введём координаты с началом в $A$ (ребро $6$). Середины указанных рёбер:`,
    `$$(3;0;0),\\ (6;3;0),\\ (6;6;3),\\ (3;6;6),\\ (0;3;6),\\ (0;0;3).$$`,
    `Все шесть точек удовлетворяют уравнению $x - y + z = 3$, то есть лежат в одной плоскости с нормалью $(1;-1;1)$. Это направление — диагональ куба, а плоскость проходит через его центр $(3;3;3)$ перпендикулярно диагонали.`,
    `Каждая сторона шестиугольника соединяет середины двух смежных рёбер одной грани и равна половине диагонали грани: $\\tfrac{1}{2}\\cdot 6\\sqrt{2} = 3\\sqrt{2}$. Все стороны равны, а из симметрии куба относительно диагонали равны и все углы. Значит, сечение — правильный шестиугольник. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь сечения`,
    `Площадь правильного шестиугольника со стороной $a = 3\\sqrt{2}$:`,
    geo(hexFlatFigure),
    `$$S = \\frac{3\\sqrt{3}}{2}\\,a^2 = \\frac{3\\sqrt{3}}{2}\\cdot (3\\sqrt{2})^2 = \\frac{3\\sqrt{3}}{2}\\cdot 18 = 27\\sqrt{3}.$$`,
    `**Ответ:** б) $27\\sqrt{3}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · УГЛЫ И РАССТОЯНИЯ · ПЕРПЕНДИКУЛЯРНОЕ БОКОВОЕ РЕБРО (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const perpEdgePyramid3dFigure = {
  maxWidth: 460,
  maxHeight: 430,
  points: {
    A: [0, 0],
    B: [3, 0],
    C: [4.2, 1.2],
    D: [1.2, 1.2],
    S: [0, 3.6],
  },
  fills: [{ points: ['S', 'B', 'C'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D', to: 'A', style: 'dashed' },
    { from: 'S', to: 'A' },
    { from: 'S', to: 'B' },
    { from: 'S', to: 'C' },
    { from: 'S', to: 'D', style: 'dashed' },
  ],
  rightAngles: [
    { at: 'A', from: 'S', to: 'B' },
    { at: 'B', from: 'S', to: 'C' },
  ],
  labels: {
    A: { dx: -8, dy: 12, anchor: 'end' },
    B: { dx: 2, dy: 16, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    D: { dx: -8, dy: -6, anchor: 'end' },
    S: { dx: 0, dy: -12, anchor: 'middle' },
  },
};

const perpEdgeFlatFigure = {
  maxWidth: 360,
  maxHeight: 320,
  points: {
    A: [0, 0],
    S: [0, 3],
    B: [4, 0],
    H: [1.44, 1.92],
  },
  edges: [
    { from: 'A', to: 'S' },
    { from: 'A', to: 'B' },
    { from: 'S', to: 'B' },
    { from: 'A', to: 'H', style: 'dashed' },
  ],
  rightAngles: [
    { at: 'A', from: 'S', to: 'B' },
    { at: 'H', from: 'A', to: 'S' },
  ],
  dims: [
    { from: 'A', to: 'S', text: '3' },
    { from: 'A', to: 'B', text: '4' },
  ],
  labels: {
    A: { dx: -8, dy: 4, anchor: 'end' },
    S: { dx: -8, dy: -4, anchor: 'end' },
    B: { dx: 10, dy: 8, anchor: 'start' },
    H: { dx: 10, dy: -2, anchor: 'start' },
  },
};

const perpEdgePyramid: GeometryTask = {
  publicId: 'G14ANG4',
  topicSlug: 'ege-14-angles-distances',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: 'б) 2,4',
  statement: [
    `В основании пирамиды $SABCD$ лежит квадрат $ABCD$ со стороной $4$. Боковое ребро $SA$ перпендикулярно плоскости основания и равно $3$.`,
    `**а)** Докажите, что грань $SBC$ — прямоугольный треугольник.`,
    `**б)** Найдите расстояние от точки $A$ до плоскости $SBC$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(perpEdgePyramid3dFigure),
    `Сторона основания $BC \\perp AB$ (стороны квадрата). Кроме того, $SA \\perp$ плоскости основания, поэтому $SA \\perp BC$.`,
    `Прямая $BC$ перпендикулярна двум пересекающимся прямым $AB$ и $SA$ плоскости $SAB$, значит $BC \\perp (SAB)$, а следовательно $BC \\perp SB$. Поэтому треугольник $SBC$ прямоугольный с прямым углом при вершине $B$. **Что и требовалось доказать.**`,
    `## Пункт б). Расстояние от точки $A$ до плоскости $SBC$`,
    `Так как $BC \\perp (SAB)$, то плоскость $SBC$ перпендикулярна плоскости $SAB$. Значит, расстояние от $A$ до плоскости $SBC$ равно расстоянию от $A$ до прямой $SB$ в треугольнике $SAB$.`,
    `Треугольник $SAB$ прямоугольный ($\\angle SAB = 90°$) с катетами $SA = 3$ и $AB = 4$, поэтому $SB = 5$. Расстояние от вершины прямого угла $A$ до гипотенузы $SB$:`,
    geo(perpEdgeFlatFigure),
    `$$\\rho(A,\\,SBC) = \\frac{SA\\cdot AB}{SB} = \\frac{3\\cdot 4}{5} = \\frac{12}{5} = 2{,}4.$$`,
    `**Ответ:** б) $2{,}4$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · ДВЕ КАСАЮЩИЕСЯ ОКРУЖНОСТИ И ОБЩАЯ КАСАТЕЛЬНАЯ (2 рис.)
// ─────────────────────────────────────────────────────────────────────────────

const twoCirclesFigure = {
  maxWidth: 480,
  maxHeight: 360,
  points: {
    O1: [0, 0],
    O2: [13, 0],
    K: [9, 0],
    A: [3.46, 8.31],
    B: [14.54, 3.69],
    M: [9, 6],
  },
  circles: [
    { cx: 0, cy: 0, r: 9 },
    { cx: 13, cy: 0, r: 4 },
  ],
  edges: [
    { from: 'A', to: 'B', style: 'section' },
    { from: 'A', to: 'K' },
    { from: 'B', to: 'K' },
    { from: 'K', to: 'M', style: 'dashed' },
    { from: 'O1', to: 'O2', style: 'dashed' },
  ],
  rightAngles: [{ at: 'K', from: 'A', to: 'B' }],
  labels: {
    O1: { dx: -6, dy: 14, anchor: 'end' },
    O2: { dx: 6, dy: 14, anchor: 'start' },
    K: { dx: -2, dy: 15, anchor: 'end' },
    A: { dx: -6, dy: -8, anchor: 'end' },
    B: { dx: 10, dy: 0, anchor: 'start' },
    M: { dx: 10, dy: 2, anchor: 'start' },
  },
};

const twoCirclesFlatFigure = {
  maxWidth: 400,
  maxHeight: 300,
  points: {
    O1: [0, 0],
    A: [0, 9],
    B: [12, 9],
    O2: [12, 5],
    T: [0, 5],
  },
  edges: [
    { from: 'O1', to: 'A' },
    { from: 'A', to: 'B' },
    { from: 'B', to: 'O2' },
    { from: 'O2', to: 'O1' },
    { from: 'O2', to: 'T', style: 'dashed' },
  ],
  rightAngles: [
    { at: 'A', from: 'O1', to: 'B' },
    { at: 'B', from: 'A', to: 'O2' },
    { at: 'T', from: 'O1', to: 'O2' },
  ],
  dims: [
    { from: 'O1', to: 'A', text: '9' },
    { from: 'B', to: 'O2', text: '4' },
    { from: 'A', to: 'B', text: 'AB' },
    { from: 'O1', to: 'O2', text: '13' },
  ],
  labels: {
    O1: { dx: -8, dy: 4, anchor: 'end' },
    A: { dx: -8, dy: -4, anchor: 'end' },
    B: { dx: 8, dy: -4, anchor: 'start' },
    O2: { dx: 10, dy: 4, anchor: 'start' },
    T: false,
  },
};

const twoTangentCircles: GeometryTask = {
  publicId: 'G17TAN1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: STATGRAD,
  correctAnswer: 'б) 12',
  statement: [
    `Две окружности с центрами $O_1$ и $O_2$ и радиусами $9$ и $4$ касаются внешним образом в точке $K$. Их общая внешняя касательная касается окружностей в точках $A$ и $B$ соответственно.`,
    `**а)** Докажите, что $\\angle AKB = 90°$.`,
    `**б)** Найдите $AB$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(twoCirclesFigure),
    `Проведём общую касательную в точке $K$; пусть она пересекает прямую $AB$ в точке $M$. Отрезки касательных, проведённых из точки $M$ к первой окружности, равны: $MA = MK$. Аналогично для второй окружности $MB = MK$.`,
    `Значит, $MA = MK = MB$, то есть точка $K$ лежит на окружности с диаметром $AB$ и центром $M$. Вписанный угол $\\angle AKB$ опирается на диаметр $AB$, поэтому $\\angle AKB = 90°$. **Что и требовалось доказать.**`,
    `## Пункт б). Длина $AB$`,
    `Так как $O_1A \\perp AB$ и $O_2B \\perp AB$, четырёхугольник $O_1ABO_2$ — прямоугольная трапеция. Опустим из $O_2$ перпендикуляр $O_2T$ на прямую $O_1A$; тогда $O_2T = AB$, а $O_1T = O_1A - O_2B = 9 - 4 = 5$.`,
    geo(twoCirclesFlatFigure),
    `Расстояние между центрами $O_1O_2 = 9 + 4 = 13$. Из прямоугольного треугольника $O_1TO_2$ по теореме Пифагора`,
    `$$AB = O_2T = \\sqrt{O_1O_2^2 - O_1T^2} = \\sqrt{13^2 - 5^2} = \\sqrt{144} = 12.$$`,
    `**Ответ:** б) $12$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · КАСАТЕЛЬНАЯ И СЕКУЩАЯ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const tangentSecantFigure = {
  maxWidth: 420,
  maxHeight: 340,
  points: {
    O: [0, 0],
    P: [-7, 0],
    A: [-1.29, 2.71],
    B: [-3, 0],
    C: [3, 0],
  },
  circles: [{ cx: 0, cy: 0, r: 3 }],
  edges: [
    { from: 'P', to: 'A', style: 'section' },
    { from: 'P', to: 'C' },
    { from: 'O', to: 'A', style: 'dashed' },
  ],
  rightAngles: [{ at: 'A', from: 'P', to: 'O' }],
  labels: {
    O: { dx: 4, dy: 14, anchor: 'start' },
    P: { dx: -8, dy: 4, anchor: 'end' },
    A: { dx: -4, dy: -10, anchor: 'end' },
    B: { dx: -2, dy: 15, anchor: 'end' },
    C: { dx: 8, dy: 8, anchor: 'start' },
  },
};

const tangentSecantSimilarFigure = {
  maxWidth: 420,
  maxHeight: 320,
  points: {
    P: [-7, 0],
    A: [-1.29, 2.71],
    B: [-3, 0],
    C: [3, 0],
  },
  fills: [{ points: ['P', 'A', 'B'] }, { points: ['P', 'C', 'A'] }],
  edges: [
    { from: 'P', to: 'A' },
    { from: 'A', to: 'B' },
    { from: 'P', to: 'C' },
    { from: 'C', to: 'A' },
  ],
  angles: [
    { at: 'A', from: 'P', to: 'B', label: 'α' },
    { at: 'C', from: 'A', to: 'P', label: 'α' },
  ],
  labels: {
    P: { dx: -8, dy: 4, anchor: 'end' },
    A: { dx: 0, dy: -10, anchor: 'middle' },
    B: { dx: -2, dy: 15, anchor: 'end' },
    C: { dx: 8, dy: 8, anchor: 'start' },
  },
};

const tangentSecant: GeometryTask = {
  publicId: 'G17TSC1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: LYSENKO,
  correctAnswer: 'б) 6',
  statement: [
    `Из точки $P$, лежащей вне окружности, проведены касательная $PA$ ($A$ — точка касания) и секущая, пересекающая окружность в точках $B$ и $C$ (точка $B$ лежит между $P$ и $C$).`,
    `**а)** Докажите, что $PA^2 = PB \\cdot PC$.`,
    `**б)** Найдите $PA$, если $PB = 4$ и $PC = 9$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(tangentSecantFigure),
    `Рассмотрим треугольники $PAB$ и $PCA$. Угол $P$ у них общий. Угол между касательной $PA$ и хордой $AB$ равен вписанному углу $\\angle ACB$, опирающемуся на ту же дугу $AB$, то есть $\\angle PAB = \\angle PCA$.`,
    geo(tangentSecantSimilarFigure),
    `Значит, $\\triangle PAB \\sim \\triangle PCA$ по двум углам, откуда`,
    `$$\\frac{PA}{PC} = \\frac{PB}{PA} \\quad\\Rightarrow\\quad PA^2 = PB \\cdot PC.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Вычисление $PA$`,
    `$$PA = \\sqrt{PB \\cdot PC} = \\sqrt{4 \\cdot 9} = \\sqrt{36} = 6.$$`,
    `**Ответ:** б) $6$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · ПЛОЩАДЬ ТРАПЕЦИИ ЧЕРЕЗ ПЛОЩАДИ ТРЕУГОЛЬНИКОВ (2 рис.)
// ─────────────────────────────────────────────────────────────────────────────

const trapezoidAreaFigure = {
  maxWidth: 420,
  maxHeight: 300,
  points: {
    A: [0, 0],
    D: [6, 0],
    B: [1, 3],
    C: [5, 3],
    O: [3, 1.8],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D' },
    { from: 'D', to: 'A' },
    { from: 'A', to: 'C', style: 'dashed' },
    { from: 'B', to: 'D', style: 'dashed' },
  ],
  dims: [
    { from: 'B', to: 'C', text: '4' },
    { from: 'A', to: 'D', text: '6' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    D: { dx: 8, dy: 14, anchor: 'start' },
    B: { dx: -8, dy: -6, anchor: 'end' },
    C: { dx: 8, dy: -6, anchor: 'start' },
    O: { dx: 8, dy: 10, anchor: 'start' },
  },
};

const trapezoidTrianglesFigure = {
  maxWidth: 420,
  maxHeight: 300,
  points: {
    A: [0, 0],
    D: [6, 0],
    B: [1, 3],
    C: [5, 3],
    O: [3, 1.8],
  },
  fills: [{ points: ['B', 'O', 'C'] }, { points: ['A', 'O', 'D'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'C', to: 'D' },
    { from: 'B', to: 'C' },
    { from: 'A', to: 'D' },
    { from: 'B', to: 'O' },
    { from: 'O', to: 'C' },
    { from: 'A', to: 'O' },
    { from: 'O', to: 'D' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    D: { dx: 8, dy: 14, anchor: 'start' },
    B: { dx: -8, dy: -6, anchor: 'end' },
    C: { dx: 8, dy: -6, anchor: 'start' },
    O: { dx: 9, dy: 3, anchor: 'start' },
  },
};

const trapezoidDiagonalArea: GeometryTask = {
  publicId: 'G17TRP2',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: 'б) 50',
  statement: [
    `Диагонали трапеции $ABCD$ с основаниями $BC = 4$ и $AD = 6$ пересекаются в точке $O$. Площадь треугольника $BOC$ равна $8$.`,
    `**а)** Докажите, что треугольники $BOC$ и $AOD$ подобны.`,
    `**б)** Найдите площадь трапеции $ABCD$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(trapezoidAreaFigure),
    `Так как $BC \\parallel AD$, углы $\\angle OBC = \\angle ODA$ и $\\angle OCB = \\angle OAD$ равны как накрест лежащие, а $\\angle BOC = \\angle AOD$ — как вертикальные. Значит, $\\triangle BOC \\sim \\triangle AOD$ по двум углам. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь трапеции`,
    `Коэффициент подобия $k = \\dfrac{BC}{AD} = \\dfrac{4}{6} = \\dfrac{2}{3}$. Отношение площадей равно $k^2$, поэтому`,
    `$$S_{AOD} = \\frac{S_{BOC}}{k^2} = \\frac{8}{4/9} = 18.$$`,
    geo(trapezoidTrianglesFigure),
    `Треугольники $AOB$ и $BOC$ имеют общую высоту из вершины $B$, поэтому $\\dfrac{S_{AOB}}{S_{BOC}} = \\dfrac{AO}{OC} = \\dfrac{AD}{BC} = \\dfrac{3}{2}$, откуда $S_{AOB} = \\dfrac{3}{2}\\cdot 8 = 12$. Аналогично $S_{COD} = 12$.`,
    `$$S_{ABCD} = S_{BOC} + S_{AOD} + S_{AOB} + S_{COD} = 8 + 18 + 12 + 12 = 50.$$`,
    `**Ответ:** б) $50$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · УГЛЫ И РАССТОЯНИЯ · ДИАГОНАЛЬ КУБА ⊥ ПЛОСКОСТИ BDC₁ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const cubeBdc1Figure = {
  maxWidth: 460,
  maxHeight: 420,
  points: {
    A: [0, 0],
    B: [3, 0],
    C: [4.2, 1.2],
    D: [1.2, 1.2],
    A1: [0, 3],
    B1: [3, 3],
    C1: [4.2, 4.2],
    D1: [1.2, 4.2],
  },
  fills: [{ points: ['B', 'D', 'C1'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D', to: 'A', style: 'dashed' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'D1' },
    { from: 'D1', to: 'A1' },
    { from: 'A', to: 'A1' },
    { from: 'B', to: 'B1' },
    { from: 'C', to: 'C1' },
    { from: 'D', to: 'D1', style: 'dashed' },
    { from: 'B', to: 'D', style: 'section' },
    { from: 'D', to: 'C1', style: 'section' },
    { from: 'C1', to: 'B', style: 'section' },
    { from: 'A1', to: 'C', style: 'dashed' },
  ],
  labels: {
    A: { dx: -6, dy: 16, anchor: 'end' },
    B: { dx: 2, dy: 16, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    D: { dx: -8, dy: -6, anchor: 'end' },
    A1: { dx: -12, dy: 2, anchor: 'end' },
    B1: { dx: 8, dy: 2, anchor: 'start' },
    C1: { dx: 10, dy: -2, anchor: 'start' },
    D1: { dx: -2, dy: -10, anchor: 'middle' },
  },
};

const bdc1TriangleFigure = {
  maxWidth: 340,
  maxHeight: 320,
  points: {
    B: [0, 0],
    C1: [4.243, 0],
    D: [2.121, 3.674],
  },
  edges: [
    { from: 'B', to: 'C1', ticks: 1 },
    { from: 'C1', to: 'D', ticks: 1 },
    { from: 'D', to: 'B', ticks: 1 },
  ],
  dims: [{ from: 'B', to: 'C1', text: '√2' }],
  labels: {
    B: { dx: -8, dy: 14, anchor: 'end' },
    C1: { dx: 8, dy: 14, anchor: 'start' },
    D: { dx: 0, dy: -12, anchor: 'middle' },
  },
};

const cubeDiagPlane: GeometryTask = {
  publicId: 'G14ANG5',
  topicSlug: 'ege-14-angles-distances',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: STATGRAD,
  correctAnswer: 'б) 2√3/3',
  statement: [
    `Дан единичный куб $ABCDA_1B_1C_1D_1$.`,
    `**а)** Докажите, что прямая $A_1C$ перпендикулярна плоскости $BDC_1$.`,
    `**б)** Найдите расстояние от точки $A_1$ до плоскости $BDC_1$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(cubeBdc1Figure),
    `Введём координаты с началом в $A$: $A_1(0;0;1)$, $C(1;1;0)$, $B(1;0;0)$, $D(0;1;0)$, $C_1(1;1;1)$.`,
    `Направляющий вектор диагонали: $\\vec{A_1C} = (1;1;-1)$. Нормаль к плоскости $BDC_1$ найдём как $\\vec{BD}\\times\\vec{BC_1}$, где $\\vec{BD}=(-1;1;0)$, $\\vec{BC_1}=(0;1;1)$:`,
    `$$\\vec{n} = \\vec{BD}\\times\\vec{BC_1} = (1;1;-1).$$`,
    `Так как $\\vec{A_1C} = \\vec{n}$, прямая $A_1C$ параллельна нормали, значит $A_1C \\perp (BDC_1)$. **Что и требовалось доказать.**`,
    `## Пункт б). Расстояние от точки $A_1$ до плоскости`,
    `Уравнение плоскости $BDC_1$ с нормалью $(1;1;-1)$, проходящей через $B(1;0;0)$: $x + y - z = 1$. Тогда`,
    `$$\\rho(A_1,\\,BDC_1) = \\frac{|0 + 0 - 1 - 1|}{\\sqrt{1^2+1^2+1^2}} = \\frac{2}{\\sqrt{3}} = \\frac{2\\sqrt{3}}{3}.$$`,
    `Треугольник $BDC_1$ — равносторонний со стороной $\\sqrt{2}$ (диагонали граней куба); диагональ $A_1C$ протыкает его в центре.`,
    geo(bdc1TriangleFigure),
    `**Ответ:** б) $\\dfrac{2\\sqrt{3}}{3}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СЕЧЕНИЯ · СЕЧЕНИЕ ТРЕУГОЛЬНОЙ ПРИЗМЫ ЧЕРЕЗ СТОРОНУ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const prismSection3dFigure = {
  maxWidth: 440,
  maxHeight: 440,
  points: {
    A: [0, 0],
    C: [4, 0],
    B: [2.6, 1.6],
    A1: [0, 4.5],
    C1: [4, 4.5],
    B1: [2.6, 6.1],
    M: [2.6, 3.85],
    P: [2, 0],
  },
  fills: [{ points: ['A', 'C', 'M'] }],
  edges: [
    { from: 'A', to: 'C' },
    { from: 'A', to: 'B', style: 'dashed' },
    { from: 'B', to: 'C', style: 'dashed' },
    { from: 'A1', to: 'B1' },
    { from: 'B1', to: 'C1' },
    { from: 'C1', to: 'A1' },
    { from: 'A', to: 'A1' },
    { from: 'C', to: 'C1' },
    { from: 'B', to: 'B1', style: 'dashed' },
    { from: 'A', to: 'M', style: 'section' },
    { from: 'C', to: 'M', style: 'section' },
    { from: 'M', to: 'P', style: 'dashed' },
  ],
  rightAngles: [{ at: 'P', from: 'A', to: 'M' }],
  labels: {
    A: { dx: -8, dy: 12, anchor: 'end' },
    C: { dx: 10, dy: 10, anchor: 'start' },
    B: { dx: -10, dy: 2, anchor: 'end' },
    A1: { dx: -10, dy: 0, anchor: 'end' },
    C1: { dx: 10, dy: 0, anchor: 'start' },
    B1: { dx: -10, dy: -2, anchor: 'end' },
    M: { dx: 11, dy: 2, anchor: 'start' },
    P: false,
  },
};

const prismSectionFlatFigure = {
  maxWidth: 340,
  maxHeight: 340,
  points: {
    A: [0, 0],
    C: [4, 0],
    M: [2, 4.583],
    P: [2, 0],
  },
  edges: [
    { from: 'A', to: 'C' },
    { from: 'A', to: 'M', ticks: 1 },
    { from: 'C', to: 'M', ticks: 1 },
    { from: 'M', to: 'P', style: 'dashed' },
  ],
  rightAngles: [{ at: 'P', from: 'A', to: 'M' }],
  dims: [
    { from: 'A', to: 'C', text: '4' },
    { from: 'A', to: 'M', text: '5' },
    { from: 'C', to: 'M', text: '5' },
    { from: 'M', to: 'P', text: '√21' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    C: { dx: 8, dy: 14, anchor: 'start' },
    M: { dx: 0, dy: -12, anchor: 'middle' },
    P: false,
  },
};

const prismTriangleSection: GeometryTask = {
  publicId: 'G14SEC4',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: 'б) 2√21',
  statement: [
    `В правильной треугольной призме $ABCA_1B_1C_1$ сторона основания равна $4$, а боковое ребро равно $6$. Через сторону $AC$ основания и середину $M$ ребра $BB_1$ проведено сечение.`,
    `**а)** Докажите, что сечение — равнобедренный треугольник.`,
    `**б)** Найдите площадь сечения.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(prismSection3dFigure),
    `Сечение — треугольник $ACM$. Точка $M$ лежит на оси симметрии призмы, проходящей через середину $AC$ и ребро $BB_1$, поэтому $AM = CM$ (наклонные с равными проекциями). Значит, треугольник $ACM$ равнобедренный. **Что и требовалось доказать.**`,
    `## Пункт б). Площадь сечения`,
    `Введём координаты: $A(0;0;0)$, $C(4;0;0)$, $B(2;2\\sqrt{3};0)$, тогда $M(2;2\\sqrt{3};3)$. Найдём стороны:`,
    `$$AM = CM = \\sqrt{2^2 + (2\\sqrt{3})^2 + 3^2} = \\sqrt{4 + 12 + 9} = 5.$$`,
    `Пусть $P$ — середина $AC$. Высота треугольника $MP = \\sqrt{MC^2 - PC^2} = \\sqrt{25 - 4} = \\sqrt{21}$.`,
    geo(prismSectionFlatFigure),
    `$$S_{ACM} = \\frac{1}{2}\\,AC\\cdot MP = \\frac{1}{2}\\cdot 4\\cdot \\sqrt{21} = 2\\sqrt{21}.$$`,
    `**Ответ:** б) $2\\sqrt{21}$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 14 · СЕЧЕНИЯ · ОБЪЁМ ОТСЕЧЁННОЙ ЧАСТИ ПИРАМИДЫ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const pyramidMidSection3dFigure = {
  maxWidth: 460,
  maxHeight: 430,
  points: {
    A: [-2, 0],
    B: [2, 0],
    C: [3.2, 1.5],
    D: [-0.8, 1.5],
    S: [0.6, 4.5],
    M: [-0.7, 2.25],
    N: [1.3, 2.25],
    K: [1.9, 3],
    L: [-0.1, 3],
  },
  fills: [{ points: ['M', 'N', 'K', 'L'] }],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D', style: 'dashed' },
    { from: 'D', to: 'A', style: 'dashed' },
    { from: 'S', to: 'A' },
    { from: 'S', to: 'B' },
    { from: 'S', to: 'C' },
    { from: 'S', to: 'D', style: 'dashed' },
    { from: 'M', to: 'N', style: 'section' },
    { from: 'N', to: 'K', style: 'section' },
    { from: 'K', to: 'L', style: 'section' },
    { from: 'L', to: 'M', style: 'section' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    B: { dx: 8, dy: 14, anchor: 'start' },
    C: { dx: 12, dy: 4, anchor: 'start' },
    D: { dx: -10, dy: -4, anchor: 'end' },
    S: { dx: 0, dy: -12, anchor: 'middle' },
    M: { dx: -11, dy: 2, anchor: 'end' },
    N: { dx: 4, dy: 12, anchor: 'start' },
    K: { dx: 11, dy: 2, anchor: 'start' },
    L: { dx: -11, dy: -2, anchor: 'end' },
  },
};

const midSquareFigure = {
  maxWidth: 300,
  maxHeight: 300,
  points: {
    M: [0, 0],
    N: [3, 0],
    K: [3, 3],
    L: [0, 3],
  },
  edges: [
    { from: 'M', to: 'N' },
    { from: 'N', to: 'K' },
    { from: 'K', to: 'L' },
    { from: 'L', to: 'M' },
  ],
  dims: [{ from: 'M', to: 'N', text: '3' }],
  labels: {
    M: { dx: -8, dy: 14, anchor: 'end' },
    N: { dx: 8, dy: 14, anchor: 'start' },
    K: { dx: 8, dy: -4, anchor: 'start' },
    L: { dx: -8, dy: -4, anchor: 'end' },
  },
};

const pyramidMidSection: GeometryTask = {
  publicId: 'G14SEC5',
  topicSlug: 'ege-14-sections',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: LYSENKO,
  correctAnswer: 'б) 42',
  statement: [
    `В правильной четырёхугольной пирамиде $SABCD$ сторона основания равна $6$, а высота равна $4$. Через середины $M$, $N$, $K$, $L$ боковых рёбер $SA$, $SB$, $SC$, $SD$ проведено сечение.`,
    `**а)** Докажите, что $MNKL$ — квадрат.`,
    `**б)** Найдите объём части пирамиды, заключённой между сечением и основанием.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(pyramidMidSection3dFigure),
    `Отрезки $MN$, $NK$, $KL$, $LM$ — средние линии треугольников $SAB$, $SBC$, $SCD$, $SDA$, поэтому они параллельны сторонам основания и равны их половинам: $MN = KL = \\tfrac{1}{2}AB$, $NK = LM = \\tfrac{1}{2}BC$.`,
    `Так как $ABCD$ — квадрат, все стороны $MNKL$ равны, а смежные стороны параллельны перпендикулярным сторонам квадрата, значит углы прямые. Следовательно, $MNKL$ — квадрат. **Что и требовалось доказать.**`,
    `## Пункт б). Объём`,
    `Объём всей пирамиды: $V = \\tfrac{1}{3}\\,S_{ABCD}\\cdot h = \\tfrac{1}{3}\\cdot 36\\cdot 4 = 48$.`,
    `Сечение $MNKL$ проходит через середины боковых рёбер, поэтому пирамида $SMNKL$ подобна пирамиде $SABCD$ с коэффициентом $\\tfrac{1}{2}$. Её объём`,
    geo(midSquareFigure),
    `$$V_{SMNKL} = \\left(\\frac{1}{2}\\right)^3 V = \\frac{1}{8}\\cdot 48 = 6.$$`,
    `Искомый объём части между сечением и основанием:`,
    `$$V_{ABCD\\text{-}MNKL} = V - V_{SMNKL} = 48 - 6 = 42.$$`,
    `**Ответ:** б) $42$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · СВОЙСТВО БИССЕКТРИСЫ (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const bisectorFigure = {
  maxWidth: 400,
  maxHeight: 340,
  points: {
    A: [0, 4],
    B: [-4, 0],
    C: [2, 0],
    L: [-0.4, 0],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'A', to: 'L', style: 'section' },
  ],
  angles: [
    { at: 'A', from: 'B', to: 'L', label: 'α' },
    { at: 'A', from: 'L', to: 'C', label: 'α' },
  ],
  dims: [
    { from: 'A', to: 'B', text: '6' },
    { from: 'A', to: 'C', text: '4' },
  ],
  labels: {
    A: { dx: 0, dy: -12, anchor: 'middle' },
    B: { dx: -8, dy: 14, anchor: 'end' },
    C: { dx: 8, dy: 14, anchor: 'start' },
    L: { dx: 2, dy: 16, anchor: 'start' },
  },
};

const bisectorRatioFigure = {
  maxWidth: 400,
  maxHeight: 320,
  points: {
    A: [0, 4],
    B: [-4, 0],
    C: [2, 0],
    L: [-0.4, 0],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'C', to: 'A' },
    { from: 'B', to: 'L', style: 'section' },
    { from: 'L', to: 'C', style: 'section' },
    { from: 'A', to: 'L', style: 'dashed' },
  ],
  dims: [
    { from: 'B', to: 'L', text: '3' },
    { from: 'L', to: 'C', text: '2' },
  ],
  labels: {
    A: { dx: 0, dy: -12, anchor: 'middle' },
    B: { dx: -8, dy: 14, anchor: 'end' },
    C: { dx: 8, dy: 14, anchor: 'start' },
    L: { dx: 0, dy: 16, anchor: 'middle' },
  },
};

const bisectorProperty: GeometryTask = {
  publicId: 'G17BIS1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: 'б) 3',
  statement: [
    `Биссектриса $AL$ треугольника $ABC$ пересекает сторону $BC$ в точке $L$.`,
    `**а)** Докажите, что $BL : LC = AB : AC$.`,
    `**б)** Найдите $BL$, если $AB = 6$, $AC = 4$, $BC = 5$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(bisectorFigure),
    `Треугольники $ABL$ и $ACL$ имеют общую высоту из вершины $A$, поэтому отношение их площадей равно отношению оснований: $\\dfrac{S_{ABL}}{S_{ACL}} = \\dfrac{BL}{LC}$.`,
    `С другой стороны, $AL$ — биссектриса, значит точка $L$ равноудалена от сторон $AB$ и $AC$; обозначим это расстояние $d$. Тогда $S_{ABL} = \\tfrac{1}{2}AB\\cdot d$ и $S_{ACL} = \\tfrac{1}{2}AC\\cdot d$, поэтому $\\dfrac{S_{ABL}}{S_{ACL}} = \\dfrac{AB}{AC}$. Отсюда`,
    `$$\\frac{BL}{LC} = \\frac{AB}{AC}.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Вычисление $BL$`,
    `По доказанному $\\dfrac{BL}{LC} = \\dfrac{AB}{AC} = \\dfrac{6}{4} = \\dfrac{3}{2}$. Значит, $BL = 3x$, $LC = 2x$ и $BL + LC = 5x = BC = 5$, откуда $x = 1$.`,
    geo(bisectorRatioFigure),
    `$$BL = 3x = 3.$$`,
    `**Ответ:** б) $3$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · СРЕДНЯЯ ЛИНИЯ И СЕРЕДИНЫ ДИАГОНАЛЕЙ ТРАПЕЦИИ (2 рис.)
// ─────────────────────────────────────────────────────────────────────────────

const trapezoidMidlineFigure = {
  maxWidth: 440,
  maxHeight: 260,
  points: {
    A: [0, 0],
    D: [8, 0],
    B: [2, 3],
    C: [6, 3],
    M: [1, 1.5],
    N: [7, 1.5],
    P: [3, 1.5],
    Q: [5, 1.5],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'D' },
    { from: 'D', to: 'A' },
    { from: 'A', to: 'C', style: 'dashed' },
    { from: 'B', to: 'D', style: 'dashed' },
    { from: 'M', to: 'N' },
    { from: 'P', to: 'Q', style: 'section' },
  ],
  labels: {
    A: { dx: -8, dy: 14, anchor: 'end' },
    D: { dx: 8, dy: 14, anchor: 'start' },
    B: { dx: -6, dy: -8, anchor: 'end' },
    C: { dx: 6, dy: -8, anchor: 'start' },
    M: { dx: -11, dy: 2, anchor: 'end' },
    N: { dx: 11, dy: 2, anchor: 'start' },
    P: { dx: -2, dy: -9, anchor: 'end' },
    Q: { dx: 2, dy: -9, anchor: 'start' },
  },
};

const trapezoidSegmentsFigure = {
  maxWidth: 440,
  maxHeight: 140,
  points: {
    M: [0, 0],
    P: [2, 0],
    Q: [4, 0],
    N: [6, 0],
  },
  edges: [{ from: 'M', to: 'N' }],
  dims: [
    { from: 'M', to: 'P', text: 'b/2' },
    { from: 'P', to: 'Q', text: '(a−b)/2' },
    { from: 'Q', to: 'N', text: 'b/2' },
  ],
  labels: {
    M: { dx: -4, dy: 16, anchor: 'end' },
    P: { dx: 0, dy: 16, anchor: 'middle' },
    Q: { dx: 0, dy: 16, anchor: 'middle' },
    N: { dx: 4, dy: 16, anchor: 'start' },
  },
};

const trapezoidMidlineSegment: GeometryTask = {
  publicId: 'G17TRP3',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: STATGRAD,
  correctAnswer: 'б) 8 и 4',
  statement: [
    `В трапеции $ABCD$ ($BC \\parallel AD$) средняя линия $MN$ равна $6$, а отрезок $PQ$, соединяющий середины диагоналей, равен $2$.`,
    `**а)** Докажите, что $PQ = \\dfrac{AD - BC}{2}$.`,
    `**б)** Найдите основания трапеции.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(trapezoidMidlineFigure),
    `Точки $M$, $P$, $Q$, $N$ лежат на средней линии (все на серединном уровне между основаниями). Обозначим $AD = a$, $BC = b$.`,
    `Точка $P$ — середина диагонали $AC$, поэтому $MP$ — средняя линия треугольника $ABC$ и $MP = \\tfrac{1}{2}BC = \\tfrac{b}{2}$. Аналогично $QN = \\tfrac{b}{2}$. Вся средняя линия $MN = \\tfrac{a+b}{2}$, поэтому`,
    geo(trapezoidSegmentsFigure),
    `$$PQ = MN - MP - QN = \\frac{a+b}{2} - \\frac{b}{2} - \\frac{b}{2} = \\frac{a-b}{2} = \\frac{AD - BC}{2}.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Основания`,
    `Из условия $\\dfrac{a+b}{2} = 6$ и $\\dfrac{a-b}{2} = 2$, то есть $a + b = 12$ и $a - b = 4$. Решая систему, получаем $a = 8$, $b = 4$.`,
    `**Ответ:** б) основания равны $8$ и $4$.`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 17 · ПЛАНИМЕТРИЯ · ВЫСОТА ИЗ ПРЯМОГО УГЛА (2 рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const altitudeFigure = {
  maxWidth: 440,
  maxHeight: 300,
  points: {
    A: [0, 0],
    B: [13, 0],
    C: [4, 6],
    H: [4, 0],
  },
  edges: [
    { from: 'A', to: 'B' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'C', to: 'H', style: 'section' },
  ],
  rightAngles: [
    { at: 'C', from: 'A', to: 'B' },
    { at: 'H', from: 'C', to: 'A' },
  ],
  dims: [
    { from: 'A', to: 'H', text: '4' },
    { from: 'H', to: 'B', text: '9' },
  ],
  labels: {
    A: { dx: -8, dy: 4, anchor: 'end' },
    B: { dx: 8, dy: 4, anchor: 'start' },
    C: { dx: 0, dy: -12, anchor: 'middle' },
    H: { dx: 0, dy: 16, anchor: 'middle' },
  },
};

const altitudeSimilarFigure = {
  maxWidth: 440,
  maxHeight: 300,
  points: {
    A: [0, 0],
    B: [13, 0],
    C: [4, 6],
    H: [4, 0],
  },
  fills: [{ points: ['A', 'C', 'H'] }, { points: ['C', 'B', 'H'] }],
  edges: [
    { from: 'A', to: 'C' },
    { from: 'C', to: 'H' },
    { from: 'H', to: 'A' },
    { from: 'C', to: 'B' },
    { from: 'B', to: 'H' },
  ],
  angles: [
    { at: 'A', from: 'C', to: 'B', label: 'β' },
    { at: 'C', from: 'H', to: 'B', label: 'β' },
  ],
  rightAngles: [{ at: 'H', from: 'C', to: 'A' }],
  labels: {
    A: { dx: -8, dy: 4, anchor: 'end' },
    B: { dx: 8, dy: 4, anchor: 'start' },
    C: { dx: 0, dy: -12, anchor: 'middle' },
    H: { dx: 0, dy: 16, anchor: 'middle' },
  },
};

const altitudeGeometricMean: GeometryTask = {
  publicId: 'G17ALT1',
  topicSlug: 'ege-17-proofs-calculations',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: LYSENKO,
  correctAnswer: 'б) 6',
  statement: [
    `В прямоугольном треугольнике $ABC$ с прямым углом $C$ проведена высота $CH$ к гипотенузе $AB$.`,
    `**а)** Докажите, что $CH^2 = AH \\cdot BH$.`,
    `**б)** Найдите $CH$, если $AH = 4$ и $BH = 9$.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Доказательство`,
    geo(altitudeFigure),
    `Рассмотрим треугольники $ACH$ и $CBH$. Оба прямоугольные ($\\angle AHC = \\angle CHB = 90°$). Угол $\\angle CAH$ (то есть $\\angle A$) равен углу $\\angle BCH$, так как оба дополняют угол $\\angle ACH$ до $90°$.`,
    geo(altitudeSimilarFigure),
    `Значит, $\\triangle ACH \\sim \\triangle CBH$ по двум углам, откуда`,
    `$$\\frac{CH}{BH} = \\frac{AH}{CH} \\quad\\Rightarrow\\quad CH^2 = AH \\cdot BH.$$`,
    `**Что и требовалось доказать.**`,
    `## Пункт б). Вычисление $CH$`,
    `$$CH = \\sqrt{AH \\cdot BH} = \\sqrt{4 \\cdot 9} = \\sqrt{36} = 6.$$`,
    `**Ответ:** б) $6$.`,
  ].join('\n\n'),
};

const geometryTasks: GeometryTask[] = [
  stereometrySection,
  prismSection,
  cubeSection,
  pyramidVolumeRatio,
  pyramidPerp,
  pyramidDistance,
  cubeDiagonal,
  pyramidDihedral,
  pyramidSectionAbmn,
  cubePlaneDistance,
  rhombusInCube,
  hexSection,
  perpEdgePyramid,
  cubeDiagPlane,
  prismTriangleSection,
  pyramidMidSection,
  planimetrySimilarity,
  planimetryMedian,
  trapezoidMidline,
  incircleTangents,
  medianHypotenuse,
  centroidArea,
  medianRightAngle,
  intersectingChords,
  twoTangentCircles,
  tangentSecant,
  trapezoidDiagonalArea,
  bisectorProperty,
  trapezoidMidlineSegment,
  altitudeGeometricMean,
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
