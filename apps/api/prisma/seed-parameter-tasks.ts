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

/** Оборачивает JSON-описание координатного чертежа в fenced-блок ```plot. */
function plot(spec: unknown): string {
  return ['```plot', JSON.stringify(spec), '```'].join('\n');
}

/** Точки верхней полуокружности радиуса r для ломаной чертежа. */
function semicirclePoints(r: number, n = 48): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = -r + (2 * r * i) / n;
    return [
      Number(x.toFixed(4)),
      Number(Math.sqrt(Math.max(r * r - x * x, 0)).toFixed(4)),
    ];
  });
}

/** Точки «W»-графика y = |x² − 1| на [−2; 2]. */
function absParabolaPoints(n = 80): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = -2 + (4 * i) / n;
    return [Number(x.toFixed(4)), Number(Math.abs(x * x - 1).toFixed(4))];
  });
}

const YASHCHENKO = 'Ященко (сборник ЕГЭ)';
const FIPI = 'Реальные задания (ЕГЭ, ФИПИ)';
const EXAMCLASS = 'ExamClass (банк задач)';

type ParameterTask = {
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
// ЗАДАЧА 18 · ПАРАМЕТР · ГРАФИЧЕСКИЙ МЕТОД (система с модулем и семейством прямых)
// ─────────────────────────────────────────────────────────────────────────────

const systemFigure = {
  xRange: [-12.5, 7.5],
  yRange: [-13, 6],
  xTicks: [-8, -1, 1],
  yTicks: [-12, 1, 4],
  curves: [
    // График 1-го уравнения — гипербола y = 1/x + 5/2 (правая ветвь).
    {
      kind: 'reciprocal',
      a: 1,
      p: 0,
      q: 2.5,
      domain: [0.14, 7.5],
      color: 'blue',
      label: 'y = 1/x + 5/2',
      labelAt: 4.6,
      labelDelta: [6, -4],
      labelAnchor: 'start',
    },
    // Та же гипербола — левый кусок x ≤ −8.
    {
      kind: 'reciprocal',
      a: 1,
      p: 0,
      q: 2.5,
      domain: [-12, -8],
      color: 'blue',
    },
    // График 1-го уравнения — вертикальный луч x = −8, y ≤ 2 3/8.
    {
      kind: 'polyline',
      points: [
        [-8, 2.375],
        [-8, -13],
      ],
      color: 'blue',
    },
    // Прямая y = 3/2·x (первый множитель 2-го уравнения).
    {
      kind: 'linear',
      k: 1.5,
      b: 0,
      color: 'orange',
      label: 'y = 3x/2',
      labelAt: -6,
      labelDelta: [-8, 20],
      labelAnchor: 'end',
    },
    // Семейство y = ax + 4: красная — касательная a = −9/16.
    { kind: 'linear', k: -0.5625, b: 4, color: 'red' },
    // Семейство y = ax + 4: зелёная — секущая a = −1/4 (две общие точки).
    { kind: 'linear', k: -0.25, b: 4, color: 'green' },
    // Асимптота гиперболы y = 5/2.
    {
      kind: 'linear',
      k: 0,
      b: 2.5,
      color: 'muted',
      dashed: true,
      width: 1.6,
      label: 'y = 2,5',
      labelAt: -11.5,
      labelDelta: [2, -6],
      labelAnchor: 'start',
    },
  ],
  points: [
    { x: -8, y: 2.375, label: 'A', labelDelta: [-9, -6], labelAnchor: 'end' },
    { x: -8, y: -12, label: 'B', labelDelta: [-9, 4], labelAnchor: 'end' },
    {
      x: 2,
      y: 3,
      label: 'C',
      labelDelta: [11, 17],
      labelAnchor: 'start',
      color: 'orange',
    },
    { x: 0, y: 4, kind: 'open' },
  ],
  labels: [
    {
      x: 3.2,
      y: 5.4,
      text: 'y = ax + 4',
      color: 'red',
      anchor: 'start',
      size: 13,
    },
  ],
  caption:
    'Синим — график 1-го уравнения (гипербола и луч x = −8). Оранжевая прямая y = 3/2·x даёт точки B и C. Семейство y = ax + 4: красная — касательная a = −9/16, зелёная — секущая.',
};

const parameterSystem: ParameterTask = {
  publicId: 'P18SYS1',
  topicSlug: 'ege-18-graphical-method',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: '(-9/16;-1/2)∪(-1/2;0)∪(0;2)∪(2;+∞)',
  statement: [
    `Найдите все значения $a$, при каждом из которых система уравнений`,
    `$$\\begin{cases} \\dfrac{5}{x} + 3 - y = \\left| y - 2 + \\dfrac{3}{x} \\right|, \\\\[2mm] 2y(y-4) + 3x(ax+4) = xy(2a+3) \\end{cases}$$`,
    `имеет более трёх решений.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Первое уравнение — раскрытие модуля`,
    `Уравнение вида $|A| = B$ равносильно системе $B \\ge 0,\\ A = \\pm B$. Здесь $A = y - 2 + \\dfrac{3}{x}$, а $B = \\dfrac{5}{x} + 3 - y$, поэтому`,
    `$$\\left| y - 2 + \\frac{3}{x} \\right| = \\frac{5}{x} + 3 - y \\iff \\begin{cases} \\dfrac{5}{x} + 3 - y \\ge 0, \\\\[1mm] \\left[\\begin{array}{l} y - 2 + \\dfrac{3}{x} = \\dfrac{5}{x} + 3 - y, \\\\[1mm] y - 2 + \\dfrac{3}{x} = -\\dfrac{5}{x} - 3 + y. \\end{array}\\right. \\end{cases}$$`,
    `Из первого равенства $2y = 5 + \\dfrac{2}{x}$, то есть $y = \\dfrac{1}{x} + \\dfrac{5}{2}$. Из второго $\\dfrac{8}{x} = -1$, то есть $x = -8$.`,
    `Учтём условие $\\dfrac{5}{x} + 3 - y \\ge 0$:`,
    `- для $y = \\dfrac{1}{x} + \\dfrac{5}{2}$ оно принимает вид $\\dfrac{4}{x} + \\dfrac{1}{2} \\ge 0$, что верно при $x > 0$ и при $x \\le -8$;\n- для $x = -8$ получаем $y \\le -\\dfrac{5}{8} + 3 = 2\\dfrac{3}{8}$.`,
    `Итак, **график первого уравнения** — это гипербола $y = \\dfrac{1}{x} + \\dfrac{5}{2}$ при $x > 0$ и при $x \\le -8$ вместе с вертикальным лучом $x = -8,\\ y \\le 2\\dfrac{3}{8}$. Луч и левый кусок гиперболы стыкуются в точке $A\\left(-8;\\ 2\\dfrac{3}{8}\\right)$, ведь при $x = -8$ имеем $y = -\\dfrac{1}{8} + \\dfrac{5}{2} = \\dfrac{19}{8}$.`,
    `## Второе уравнение — разложение на две прямые`,
    `Приведём его к квадратному относительно $y$:`,
    `$$2y^2 - 8y + 3ax^2 + 12x = (2a+3)xy \\iff y^2 - \\left(4 + ax + \\tfrac{3}{2}x\\right)y + \\tfrac{3}{2}x(ax + 4) = 0.$$`,
    `По теореме Виета корни этого уравнения — $y = \\dfrac{3}{2}x$ и $y = ax + 4$ (их сумма равна $4 + ax + \\dfrac{3}{2}x$, а произведение $\\dfrac{3}{2}x(ax+4)$). Значит, второе уравнение задаёт объединение двух прямых:`,
    `$$y = \\frac{3}{2}x \\qquad \\text{и} \\qquad y = ax + 4.$$`,
    `## Сколько общих точек у графиков`,
    `Система имеет более трёх решений тогда и только тогда, когда графики первого и второго уравнений имеют более трёх общих точек. Прямая $y = \\dfrac{3}{2}x$ не зависит от $a$ и пересекает график первого уравнения в двух точках:`,
    `- с гиперболой: $\\dfrac{3}{2}x = \\dfrac{1}{x} + \\dfrac{5}{2} \\Rightarrow 3x^2 - 5x - 2 = 0 \\Rightarrow x = 2$ (второй корень $x = -\\tfrac{1}{3}$ в область не входит) — точка $C(2;\\ 3)$;\n- с лучом $x = -8$: $y = \\dfrac{3}{2}\\cdot(-8) = -12 \\le 2\\dfrac{3}{8}$ — точка $B(-8;\\ -12)$.`,
    `Точки $B$ и $C$ — решения при любом $a$. Поэтому «более трёх решений» означает, что прямая $y = ax + 4$ должна дать с графиком первого уравнения ещё **не менее двух** общих точек. Все прямые этого семейства проходят через точку $(0;\\ 4)$, а их пересечение с гиперболой описывается уравнением`,
    `$$\\frac{1}{x} + \\frac{5}{2} = ax + 4 \\iff 2ax^2 + 3x - 2 = 0. \\qquad (\\ast)$$`,
    plot(systemFigure),
    `**Граница — касание.** Дискриминант $(\\ast)$ равен $9 + 16a$ и обращается в нуль при $a = -\\dfrac{9}{16}$: прямая касается гиперболы (красная прямая на рисунке). При $a < -\\dfrac{9}{16}$ уравнение $(\\ast)$ решений не имеет и других общих точек тоже нет, а при $a = -\\dfrac{9}{16}$ точка касания одна. В обоих случаях всего не более трёх решений — **не подходит**.`,
    `**Две добавочные точки.** При $a > -\\dfrac{9}{16}$ уравнение $(\\ast)$ имеет два корня, и прямая добавляет ровно две общие точки: при $-\\dfrac{9}{16} < a < 0$ обе лежат на правой ветви гиперболы, а при $a > 0$ одна попадает на правую ветвь, другая — на левый кусок $x \\le -8$ или на луч $x = -8$. Тогда решений не меньше четырёх — **подходит**, кроме трёх особых значений:`,
    `- $a = 0$: уравнение $(\\ast)$ вырождается в линейное $3x - 2 = 0$ с единственным корнем $x = \\dfrac{2}{3}$. Прямая $y = 4$ добавляет лишь одну точку — всего три решения, не подходит;\n- $a = -\\dfrac{1}{2}$: прямая $y = -\\dfrac{1}{2}x + 4$ проходит через уже учтённую точку $C(2;\\ 3)$, поэтому добавляет лишь одну новую точку — всего три, не подходит;\n- $a = 2$: прямая $y = 2x + 4$ проходит через уже учтённую точку $B(-8;\\ -12)$, поэтому добавляет лишь одну новую точку — всего три, не подходит.`,
    `Для всех остальных $a > -\\dfrac{9}{16}$ решений больше трёх.`,
    `## Ответ`,
    `$$a \\in \\left(-\\frac{9}{16};\\ -\\frac{1}{2}\\right) \\cup \\left(-\\frac{1}{2};\\ 0\\right) \\cup (0;\\ 2) \\cup (2;\\ +\\infty).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 18 · ПАРАМЕТР · АНАЛИТИЧЕСКИЙ МЕТОД (модуль и корень, без рисунка)
// ─────────────────────────────────────────────────────────────────────────────

const parameterAnalytic: ParameterTask = {
  publicId: 'P18ABS1',
  topicSlug: 'ege-18-analytic-method',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: '{-5}∪(-1;0)',
  statement: [
    `Найдите все значения $a$, при каждом из которых уравнение`,
    `$$\\left| x^2 - a^2 \\right| = |x + a|\\cdot\\sqrt{x^2 - 4ax + 5a}$$`,
    `имеет ровно один корень.`,
  ].join('\n\n'),
  referenceSolution: [
    `## Разложение на множители`,
    `Так как $x^2 - a^2 = (x - a)(x + a)$, то $\\left| x^2 - a^2 \\right| = |x + a|\\cdot|x - a|$, и уравнение принимает вид`,
    `$$|x + a|\\cdot|x - a| = |x + a|\\cdot\\sqrt{x^2 - 4ax + 5a} \\iff |x + a|\\left(|x - a| - \\sqrt{x^2 - 4ax + 5a}\\right) = 0.$$`,
    `Область допустимых значений задаётся условием $x^2 - 4ax + 5a \\ge 0$. Произведение равно нулю, когда обращается в нуль один из множителей.`,
    `## Случай 1: $|x + a| = 0$`,
    `Тогда $x = -a$ — но лишь если при этом выполнена ОДЗ. Подставим $x = -a$ в подкоренное выражение:`,
    `$$(-a)^2 - 4a\\cdot(-a) + 5a = a^2 + 4a^2 + 5a = 5a^2 + 5a = 5a(a + 1).$$`,
    `Условие $5a(a + 1) \\ge 0$ выполнено при $a \\le -1$ и при $a \\ge 0$. Значит, корень $x = -a$ существует тогда и только тогда, когда $a \\le -1$ или $a \\ge 0$.`,
    `## Случай 2: $|x - a| = \\sqrt{x^2 - 4ax + 5a}$`,
    `Обе части неотрицательны, поэтому возведение в квадрат равносильно (при этом ОДЗ выполняется автоматически, ведь правая часть станет равна $(x - a)^2 \\ge 0$):`,
    `$$(x - a)^2 = x^2 - 4ax + 5a \\iff x^2 - 2ax + a^2 = x^2 - 4ax + 5a \\iff 2ax = 5a - a^2.$$`,
    `- при $a = 0$ получаем $0 = 0$ — равенство верно при любом $x$, то есть **бесконечно много** корней;\n- при $a \\ne 0$ имеем единственный корень $x = \\dfrac{5a - a^2}{2a} = \\dfrac{5 - a}{2}$.`,
    `## Собираем корни`,
    `При $a = 0$ корней бесконечно много — не подходит. При $a \\ne 0$ уравнение всегда имеет корень $x_2 = \\dfrac{5 - a}{2}$, и, кроме того, корень $x_1 = -a$, если $a \\le -1$ или $a > 0$.`,
    `Ровно один корень получается в двух ситуациях:`,
    `1. Корня $x_1 = -a$ нет, то есть $-1 < a < 0$. Тогда единственный корень — $x_2$. Подходит весь интервал $(-1;\\ 0)$.\n2. Корни $x_1$ и $x_2$ существуют, но совпадают: $-a = \\dfrac{5 - a}{2} \\Rightarrow -2a = 5 - a \\Rightarrow a = -5$. Это значение удовлетворяет условию $a \\le -1$, значит оба корня есть и они слились в один. Подходит.`,
    `Проверим, что на границах лишнего не возникает:`,
    `- $a = -1$: $x_1 = 1$, $x_2 = 3$ — два корня;\n- $a > 0$: $x_1 = -a$ и $x_2 = \\dfrac{5 - a}{2}$ совпали бы лишь при $a = -5$, поэтому корней два;\n- $a < -1,\\ a \\ne -5$: два различных корня.`,
    `Во всех этих случаях корней не один, поэтому они в ответ не входят.`,
    `## Ответ`,
    `$$a \\in \\{-5\\} \\cup (-1;\\ 0).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 18 · РАСПОЛОЖЕНИЕ КОРНЕЙ КВАДРАТНОГО ТРЁХЧЛЕНА
// ─────────────────────────────────────────────────────────────────────────────

const rootPositiveFigure = {
  xRange: [-1.5, 6.5],
  yRange: [-2, 4.2],
  equalScale: false,
  maxWidth: 500,
  maxHeight: 320,
  curves: [
    { kind: 'parabola', a: 0.4, b: -2.6, c: 3, color: 'blue', width: 2.6 },
  ],
  points: [
    { x: 1.5, y: 0, label: 'x₁', labelDelta: [-2, 20], labelAnchor: 'middle' },
    { x: 5, y: 0, label: 'x₂', labelDelta: [2, 20], labelAnchor: 'middle' },
    { x: 0, y: 3, color: 'red' },
  ],
  labels: [
    {
      x: 0.2,
      y: 3.9,
      text: 'f(0) > 0',
      color: 'red',
      anchor: 'start',
      size: 12,
    },
  ],
  caption: 'Схема: оба корня правее нуля — D ≥ 0, f(0) > 0, вершина x_в > 0.',
};

const rootPositive: ParameterTask = {
  publicId: 'P18RL1',
  topicSlug: 'ege-18-root-location',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '[4;+∞)',
  statement: `Найдите все значения $a$, при каждом из которых оба корня уравнения $x^2 - 2(a-1)x + 2a + 1 = 0$ положительны.`,
  referenceSolution: [
    `## Условия расположения корней`,
    `Пусть $f(x) = x^2 - 2(a-1)x + (2a+1)$. Ветви параболы направлены вверх, поэтому оба корня положительны (лежат правее нуля) тогда и только тогда, когда одновременно выполнены три условия:`,
    `$$\\begin{cases} D \\ge 0 & (\\text{корни существуют}), \\\\ x_в > 0 & (\\text{вершина правее нуля}), \\\\ f(0) > 0 & (\\text{график в нуле выше оси}). \\end{cases}$$`,
    plot(rootPositiveFigure),
    `## Проверяем условия`,
    `**Дискриминант.** $\\dfrac{D}{4} = (a-1)^2 - (2a+1) = a^2 - 4a = a(a-4) \\ge 0$, откуда $a \\le 0$ или $a \\ge 4$.`,
    `**Вершина.** $x_в = a - 1 > 0$, откуда $a > 1$.`,
    `**Значение в нуле.** $f(0) = 2a + 1 > 0$, откуда $a > -\\dfrac{1}{2}$.`,
    `Пересекаем условия: $\\{a \\le 0\\ \\text{или}\\ a \\ge 4\\}$, $a > 1$ и $a > -\\dfrac{1}{2}$ дают $a \\ge 4$.`,
    `## Ответ`,
    `$$a \\in [4;\\ +\\infty).$$`,
  ].join('\n\n'),
};

const rootStraddleFigure = {
  xRange: [-2.5, 5.5],
  yRange: [-3.6, 3],
  equalScale: false,
  maxWidth: 500,
  maxHeight: 320,
  xTicks: [1],
  curves: [
    { kind: 'vertical', x: 1, color: 'muted', dashed: true, width: 1.4 },
    { kind: 'parabola', a: 0.5, b: -1.5, c: -2, color: 'blue', width: 2.6 },
  ],
  points: [
    { x: -1, y: 0, label: 'x₁', labelDelta: [-4, 20], labelAnchor: 'middle' },
    { x: 4, y: 0, label: 'x₂', labelDelta: [4, 20], labelAnchor: 'middle' },
    { x: 1, y: -3, color: 'red' },
  ],
  labels: [
    {
      x: 1.2,
      y: -2.6,
      text: 'f(1) < 0',
      color: 'red',
      anchor: 'start',
      size: 12,
    },
  ],
  caption: 'Число 1 между корнями ⟺ парабола в этой точке ниже оси: f(1) < 0.',
};

const rootStraddle: ParameterTask = {
  publicId: 'P18RL2',
  topicSlug: 'ege-18-root-location',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '(-1;2)',
  statement: `Найдите все значения $a$, при каждом из которых корни уравнения $x^2 - (2a+1)x + a^2 + a - 2 = 0$ лежат по разные стороны от числа $1$.`,
  referenceSolution: [
    `## Ключевое условие`,
    `Пусть $f(x) = x^2 - (2a+1)x + (a^2 + a - 2)$ — парабола с ветвями вверх. Число $1$ лежит строго между её корнями тогда и только тогда, когда $f(1) < 0$: в точке между корнями график параболы опускается ниже оси абсцисс.`,
    plot(rootStraddleFigure),
    `## Вычисление`,
    `$$f(1) = 1 - (2a+1) + a^2 + a - 2 = a^2 - a - 2 = (a-2)(a+1).$$`,
    `Неравенство $(a-2)(a+1) < 0$ выполнено при $-1 < a < 2$.`,
    `## Ответ`,
    `$$a \\in (-1;\\ 2).$$`,
  ].join('\n\n'),
};

const rootIntervalFigure = {
  xRange: [0, 5],
  yRange: [-1.4, 3],
  equalScale: false,
  maxWidth: 500,
  maxHeight: 320,
  xTicks: [1, 4],
  curves: [
    { kind: 'vertical', x: 1, color: 'muted', dashed: true, width: 1.4 },
    { kind: 'vertical', x: 4, color: 'muted', dashed: true, width: 1.4 },
    { kind: 'parabola', a: 0.8, b: -4, c: 4.8, color: 'blue', width: 2.6 },
  ],
  points: [
    { x: 2, y: 0, label: 'x₁', labelDelta: [-2, 20], labelAnchor: 'middle' },
    { x: 3, y: 0, label: 'x₂', labelDelta: [2, 20], labelAnchor: 'middle' },
    { x: 1, y: 1.6, color: 'red' },
    { x: 4, y: 1.6, color: 'red' },
  ],
  labels: [
    { x: 0.9, y: 2.2, text: 'f(1)>0', color: 'red', anchor: 'end', size: 11 },
    { x: 4.1, y: 2.2, text: 'f(4)>0', color: 'red', anchor: 'start', size: 11 },
  ],
  caption: 'Оба корня в (1;4): f(1)>0, f(4)>0, вершина внутри, D≥0.',
};

const rootInterval: ParameterTask = {
  publicId: 'P18RL3',
  topicSlug: 'ege-18-root-location',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '(2;3)',
  statement: `Найдите все значения $a$, при каждом из которых оба корня уравнения $x^2 - 2ax + a^2 - 1 = 0$ принадлежат интервалу $(1;\\ 4)$.`,
  referenceSolution: [
    `## Условия`,
    `$f(x) = x^2 - 2ax + (a^2 - 1)$, ветви вверх. Оба корня лежат в интервале $(1;\\ 4)$ тогда и только тогда, когда выполнены четыре условия:`,
    `$$\\begin{cases} D \\ge 0, \\\\ f(1) > 0, \\\\ f(4) > 0, \\\\ 1 < x_в < 4. \\end{cases}$$`,
    plot(rootIntervalFigure),
    `## Проверка`,
    `**Дискриминант.** $\\dfrac{D}{4} = a^2 - (a^2 - 1) = 1 > 0$ — выполнено всегда.`,
    `**Концы интервала.** $f(1) = 1 - 2a + a^2 - 1 = a(a-2) > 0 \\Rightarrow a < 0$ или $a > 2$.`,
    `$f(4) = 16 - 8a + a^2 - 1 = a^2 - 8a + 15 = (a-3)(a-5) > 0 \\Rightarrow a < 3$ или $a > 5$.`,
    `**Вершина.** $x_в = a$, условие $1 < a < 4$.`,
    `Пересечение всех условий даёт $2 < a < 3$. (Проверка: корни равны $a \\pm 1$, и неравенства $a - 1 > 1$, $a + 1 < 4$ также дают $2 < a < 3$.)`,
    `## Ответ`,
    `$$a \\in (2;\\ 3).$$`,
  ].join('\n\n'),
};

const rootOneInsideFigure = {
  xRange: [-0.8, 5.5],
  yRange: [-2, 4.6],
  equalScale: false,
  maxWidth: 500,
  maxHeight: 320,
  xTicks: [3],
  curves: [
    { kind: 'vertical', x: 3, color: 'muted', dashed: true, width: 1.4 },
    { kind: 'parabola', a: 0.6, b: -3.6, c: 4.05, color: 'blue', width: 2.6 },
  ],
  points: [
    { x: 1.5, y: 0, label: 'x₁', labelDelta: [-2, 20], labelAnchor: 'middle' },
    { x: 4.5, y: 0, label: 'x₂', labelDelta: [2, 20], labelAnchor: 'middle' },
    { x: 0, y: 4.05, color: 'red' },
    { x: 3, y: -1.35, color: 'red' },
  ],
  labels: [
    { x: 0.2, y: 4.5, text: 'f(0)>0', color: 'red', anchor: 'start', size: 11 },
    {
      x: 3.15,
      y: -1.0,
      text: 'f(3)<0',
      color: 'red',
      anchor: 'start',
      size: 11,
    },
  ],
  caption: 'Ровно один корень в (0;3) ⟺ f(0) и f(3) разных знаков.',
};

const rootOneInside: ParameterTask = {
  publicId: 'P18RL4',
  topicSlug: 'ege-18-root-location',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '(-2;1)∪(2;5)',
  statement: `Найдите все значения $a$, при каждом из которых уравнение $x^2 - 2ax + a^2 - 4 = 0$ имеет ровно один корень на интервале $(0;\\ 3)$.`,
  referenceSolution: [
    `## Ключевое условие`,
    `$f(x) = x^2 - 2ax + (a^2 - 4)$, ветви вверх. Ровно один корень лежит в интервале $(0;\\ 3)$ тогда и только тогда, когда значения на концах интервала имеют разные знаки: $f(0)\\cdot f(3) < 0$. Тогда парабола пересекает ось абсцисс внутри интервала ровно один раз.`,
    plot(rootOneInsideFigure),
    `## Вычисление`,
    `$$f(0) = a^2 - 4 = (a-2)(a+2),$$`,
    `$$f(3) = 9 - 6a + a^2 - 4 = a^2 - 6a + 5 = (a-1)(a-5).$$`,
    `$$f(0)\\cdot f(3) = (a+2)(a-2)(a-1)(a-5) < 0.$$`,
    `Нули выражения: $-2,\\ 1,\\ 2,\\ 5$. Методом интервалов (старший коэффициент положителен) неравенство выполнено на $(-2;\\ 1)$ и $(2;\\ 5)$.`,
    `## Ответ`,
    `$$a \\in (-2;\\ 1) \\cup (2;\\ 5).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 18 · ГРАФИЧЕСКИЙ МЕТОД (окружности, прямые, полуокружность, W-график)
// ─────────────────────────────────────────────────────────────────────────────

const tangentCircleFigure = {
  xRange: [-1.5, 6],
  yRange: [-3, 3],
  equalScale: true,
  maxWidth: 520,
  maxHeight: 380,
  xTicks: [3],
  circles: [
    {
      cx: 3,
      cy: 0,
      r: 2,
      color: 'blue',
      label: '(x−3)²+y²=4',
      labelAngle: 65,
      labelDelta: [2, -4],
    },
  ],
  curves: [
    {
      kind: 'linear',
      k: 0.8944,
      b: 0,
      color: 'red',
      label: 'y = ax',
      labelAt: 5,
      labelDelta: [4, -4],
    },
    { kind: 'linear', k: -0.8944, b: 0, color: 'red' },
  ],
  points: [
    { x: 1.667, y: 1.491, color: 'red' },
    { x: 1.667, y: -1.491, color: 'red' },
  ],
  caption: 'Касание ⟺ расстояние от центра (3;0) до прямой равно радиусу 2.',
};

const tangentCircle: ParameterTask = {
  publicId: 'P18GR1',
  topicSlug: 'ege-18-graphical-method',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: YASHCHENKO,
  correctAnswer: '±2√5/5',
  statement: `Найдите все значения $a$, при каждом из которых прямая $y = ax$ имеет с окружностью $(x-3)^2 + y^2 = 4$ ровно одну общую точку.`,
  referenceSolution: [
    `## Подстановка`,
    `Подставим $y = ax$ в уравнение окружности:`,
    `$$(x-3)^2 + a^2x^2 = 4 \\iff (1 + a^2)x^2 - 6x + 5 = 0.$$`,
    `Коэффициент $1 + a^2 > 0$ при любом $a$, поэтому уравнение квадратное. Ровно одна общая точка ⟺ его дискриминант равен нулю.`,
    plot(tangentCircleFigure),
    `## Дискриминант`,
    `$$D = 36 - 20(1 + a^2) = 16 - 20a^2 = 0 \\iff a^2 = \\frac{4}{5} \\iff a = \\pm\\frac{2}{\\sqrt5} = \\pm\\frac{2\\sqrt5}{5}.$$`,
    `Тот же ответ даёт геометрическое условие «расстояние от центра $(3;0)$ до прямой $ax - y = 0$ равно радиусу $2$»: $\\dfrac{3|a|}{\\sqrt{a^2 + 1}} = 2 \\Rightarrow 9a^2 = 4a^2 + 4$.`,
    `## Ответ`,
    `$$a = \\pm\\frac{2\\sqrt5}{5}.$$`,
  ].join('\n\n'),
};

const circleVeeFigure = {
  xRange: [-4.3, 4.3],
  yRange: [-5.2, 4],
  equalScale: true,
  maxWidth: 440,
  maxHeight: 420,
  xTicks: [-3, 3],
  yTicks: [3, -4],
  circles: [
    {
      cx: 0,
      cy: 0,
      r: 3,
      color: 'blue',
      label: 'x²+y²=9',
      labelAngle: 52,
      labelDelta: [2, -2],
    },
  ],
  curves: [
    {
      kind: 'abs',
      k: 1,
      p: 0,
      q: -4,
      color: 'orange',
      label: 'y=|x|+a',
      labelAt: 2.7,
      labelDelta: [6, 6],
    },
  ],
  points: [
    { x: 2.707, y: -1.293, color: 'red' },
    { x: -2.707, y: -1.293, color: 'red' },
    { x: 1.293, y: -2.707, color: 'red' },
    { x: -1.293, y: -2.707, color: 'red' },
  ],
  caption:
    'При a = −4 «галка» y = |x| − 4 даёт четыре общие точки с окружностью.',
};

const circleVee: ParameterTask = {
  publicId: 'P18GR2',
  topicSlug: 'ege-18-graphical-method',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: '(-3√2;-3)',
  statement: `Найдите все значения $a$, при каждом из которых система $\\begin{cases} x^2 + y^2 = 9, \\\\ y = |x| + a \\end{cases}$ имеет ровно четыре решения.`,
  referenceSolution: [
    `## Сведение к уравнению относительно $t = |x|$`,
    `Подставим $y = |x| + a$ в первое уравнение и обозначим $t = |x| \\ge 0$:`,
    `$$t^2 + (t + a)^2 = 9 \\iff 2t^2 + 2at + a^2 - 9 = 0.$$`,
    `Каждому корню $t > 0$ отвечают **два** значения $x = \\pm t$, а корню $t = 0$ — одно. Значит, четыре решения системы получаются тогда и только тогда, когда это уравнение имеет **два различных положительных** корня $t$.`,
    plot(circleVeeFigure),
    `## Условия двух положительных корней`,
    `$$\\begin{cases} D > 0, \\\\ t_1 + t_2 > 0, \\\\ t_1 t_2 > 0. \\end{cases}$$`,
    `$\\dfrac{D}{4} = a^2 - 2(a^2 - 9) = 18 - a^2 > 0 \\Rightarrow |a| < 3\\sqrt2$.`,
    `$t_1 + t_2 = -a > 0 \\Rightarrow a < 0$.`,
    `$t_1 t_2 = \\dfrac{a^2 - 9}{2} > 0 \\Rightarrow |a| > 3$.`,
    `Пересечение: $a < 0$ и $3 < |a| < 3\\sqrt2$ дают $-3\\sqrt2 < a < -3$.`,
    `## Ответ`,
    `$$a \\in (-3\\sqrt2;\\ -3).$$`,
  ].join('\n\n'),
};

const semicircleLineFigure = {
  xRange: [-3, 3.4],
  yRange: [-0.6, 3.5],
  equalScale: true,
  maxWidth: 500,
  maxHeight: 320,
  xTicks: [-2, 2],
  yTicks: [2],
  curves: [
    {
      kind: 'polyline',
      points: semicirclePoints(2),
      color: 'blue',
      label: 'y=√(4−x²)',
      labelXY: [-2.2, 1.7],
      labelDelta: [-2, 0],
      labelAnchor: 'end',
    },
    {
      kind: 'linear',
      k: 1,
      b: 2.828,
      color: 'red',
      label: 'y=x+2√2',
      labelAt: -2.6,
      labelDelta: [-2, -4],
      labelAnchor: 'end',
    },
    {
      kind: 'linear',
      k: 1,
      b: 0.6,
      color: 'green',
      label: 'y=x+a',
      labelAt: 1.3,
      labelDelta: [6, 10],
    },
  ],
  points: [
    { x: -1.414, y: 1.414, color: 'red' },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
  ],
  caption:
    'Верхняя полуокружность и прямая y = x + a. Красная — касательная (a = 2√2).',
};

const semicircleLine: ParameterTask = {
  publicId: 'P18GR3',
  topicSlug: 'ege-18-graphical-method',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '[-2;2)∪{2√2}',
  statement: `Найдите все значения $a$, при каждом из которых уравнение $\\sqrt{4 - x^2} = x + a$ имеет ровно одно решение.`,
  referenceSolution: [
    `## Графическая модель`,
    `Левая часть $y = \\sqrt{4 - x^2}$ — верхняя полуокружность радиуса $2$ с центром в начале координат ($y \\ge 0$, $-2 \\le x \\le 2$). Правая часть $y = x + a$ — прямая с угловым коэффициентом $1$, которую при изменении $a$ сдвигают по вертикали. Число решений равно числу общих точек.`,
    plot(semicircleLineFigure),
    `## Разбор положений прямой`,
    `**Касание сверху.** Расстояние от центра $(0;0)$ до прямой $x - y + a = 0$ равно $2$: $\\dfrac{|a|}{\\sqrt2} = 2 \\Rightarrow a = 2\\sqrt2$ (верхняя касательная) — одна общая точка.`,
    `**Через правый конец $(2;0)$:** $0 = 2 + a \\Rightarrow a = -2$ — одна точка.`,
    `**Через левый конец $(-2;0)$:** $0 = -2 + a \\Rightarrow a = 2$; при этом прямая проходит ещё и через $(0;2)$ — две точки.`,
    `Итог: при $-2 \\le a < 2$ прямая пересекает дугу ровно один раз; при $2 \\le a < 2\\sqrt2$ — дважды; при $a = 2\\sqrt2$ — касается (одна точка); при остальных $a$ общих точек нет.`,
    `## Ответ`,
    `$$a \\in [-2;\\ 2) \\cup \\{2\\sqrt2\\}.$$`,
  ].join('\n\n'),
};

const absParabolaFigure = {
  xRange: [-2.3, 2.3],
  yRange: [-0.4, 3.1],
  equalScale: false,
  maxWidth: 500,
  maxHeight: 320,
  xTicks: [-1, 1],
  yTicks: [1],
  curves: [
    {
      kind: 'polyline',
      points: absParabolaPoints(),
      color: 'blue',
      label: 'y=|x²−1|',
      labelXY: [1.55, 2.3],
      labelDelta: [4, 0],
    },
    {
      kind: 'linear',
      k: 0,
      b: 0.5,
      color: 'green',
      label: 'y=a',
      labelAt: -2.1,
      labelDelta: [0, -6],
      labelAnchor: 'start',
    },
  ],
  points: [
    { x: 1.2247, y: 0.5, color: 'red' },
    { x: -1.2247, y: 0.5, color: 'red' },
    { x: 0.7071, y: 0.5, color: 'red' },
    { x: -0.7071, y: 0.5, color: 'red' },
  ],
  caption:
    'При 0 < a < 1 прямая y = a пересекает график |x² − 1| в четырёх точках.',
};

const absParabolaEq: ParameterTask = {
  publicId: 'P18GR4',
  topicSlug: 'ege-18-graphical-method',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '(0;1)',
  statement: `Найдите все значения $a$, при каждом из которых уравнение $|x^2 - 1| = a$ имеет ровно четыре различных корня.`,
  referenceSolution: [
    `## График левой части`,
    `Построим $y = |x^2 - 1|$: берём параболу $y = x^2 - 1$ и её часть ниже оси абсцисс (при $-1 < x < 1$) отражаем вверх. Получается «W»-образная линия с минимумами в точках $(-1;\\ 0)$ и $(1;\\ 0)$ и локальным максимумом $(0;\\ 1)$.`,
    plot(absParabolaFigure),
    `## Пересечение с прямой $y = a$`,
    `Горизонтальная прямая $y = a$ пересекает график:`,
    `- при $a < 0$ — нет точек; при $a = 0$ — две ($x = \\pm 1$);\n- при $0 < a < 1$ — **четыре** точки;\n- при $a = 1$ — три ($x = 0,\\ \\pm\\sqrt2$); при $a > 1$ — две точки.`,
    `Ровно четыре корня получаются при $0 < a < 1$.`,
    `## Ответ`,
    `$$a \\in (0;\\ 1).$$`,
  ].join('\n\n'),
};

const twoCirclesFigure = {
  xRange: [-1.6, 3.6],
  yRange: [-1.7, 1.7],
  equalScale: true,
  maxWidth: 520,
  maxHeight: 340,
  xTicks: [2],
  circles: [
    {
      cx: 0,
      cy: 0,
      r: 1,
      color: 'blue',
      label: 'x²+y²=1',
      labelAngle: 128,
      labelDelta: [-4, -2],
      labelAnchor: 'end',
    },
    {
      cx: 2,
      cy: 0,
      r: 1,
      color: 'orange',
      label: '(x−a)²+y²=1',
      labelAngle: 52,
      labelDelta: [4, -2],
    },
  ],
  points: [{ x: 1, y: 0, label: 'M', labelDelta: [4, -8] }],
  caption:
    'Внешнее касание при a = 2 (симметрично a = −2): единственная точка (1;0).',
};

const twoCircles: ParameterTask = {
  publicId: 'P18GR5',
  topicSlug: 'ege-18-graphical-method',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '±2',
  statement: `Найдите все значения $a$, при каждом из которых система $\\begin{cases} x^2 + y^2 = 1, \\\\ (x - a)^2 + y^2 = 1 \\end{cases}$ имеет ровно одно решение.`,
  referenceSolution: [
    `## Геометрическая модель`,
    `Это две окружности радиуса $1$ с центрами $O(0;\\ 0)$ и $O_1(a;\\ 0)$; расстояние между центрами равно $|a|$.`,
    plot(twoCirclesFigure),
    `## Число общих точек`,
    `Для двух окружностей одинакового радиуса $R = 1$:`,
    `- при $|a| = 0$ они совпадают (бесконечно много общих точек);\n- при $0 < |a| < 2$ пересекаются в двух точках;\n- при $|a| = 2$ касаются внешним образом — **одна** общая точка;\n- при $|a| > 2$ не пересекаются.`,
    `Ровно одно решение ⟺ $|a| = 2$.`,
    `## Ответ`,
    `$$a = \\pm 2.$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 18 · АНАЛИТИЧЕСКИЙ МЕТОД (показательное с заменой, кусочный модуль)
// ─────────────────────────────────────────────────────────────────────────────

const expUniqueFigure = {
  xRange: [-5.4, 1.9],
  yRange: [-6, 4.4],
  equalScale: false,
  maxWidth: 480,
  maxHeight: 360,
  xLabel: 't',
  regions: [
    {
      points: [
        [0, -6],
        [1.9, -6],
        [1.9, 4.4],
        [0, 4.4],
      ],
      color: 'green',
      opacity: 0.09,
    },
  ],
  curves: [
    {
      kind: 'parabola',
      a: 1,
      b: 4,
      c: -1,
      color: 'blue',
      label: 'g(t)',
      labelXY: [-4.4, 3.2],
      labelDelta: [-2, 0],
      labelAnchor: 'end',
    },
  ],
  points: [
    {
      x: -4.236,
      y: 0,
      label: 't₁',
      labelDelta: [-4, 18],
      labelAnchor: 'middle',
      color: 'blue',
    },
    {
      x: 0.236,
      y: 0,
      label: 't₂',
      labelDelta: [10, 18],
      labelAnchor: 'start',
      color: 'red',
    },
  ],
  labels: [
    {
      x: 0.7,
      y: 3.7,
      text: 't > 0',
      color: 'green',
      anchor: 'start',
      size: 12,
    },
  ],
  caption:
    'При a < −3 (здесь a = −4) g(t) = t² − at + (a+3) имеет отрицательный корень t₁ и положительный t₂.',
};

const expUnique: ParameterTask = {
  publicId: 'P18AN1',
  topicSlug: 'ege-18-analytic-method',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: '(-∞;-3)∪{6}',
  statement: `Найдите все значения $a$, при каждом из которых уравнение $4^x - a\\cdot 2^x + a + 3 = 0$ имеет единственное решение.`,
  referenceSolution: [
    `## Замена переменной`,
    `Так как $4^x = (2^x)^2$, положим $t = 2^x > 0$. Уравнение принимает вид`,
    `$$t^2 - a t + (a + 3) = 0, \\qquad t > 0.$$`,
    `Число решений исходного уравнения равно числу **положительных** корней $t$ (каждому $t > 0$ отвечает единственный $x = \\log_2 t$). Значит, нужен ровно один положительный корень.`,
    plot(expUniqueFigure),
    `## Два случая одного положительного корня`,
    `**1) Двойной положительный корень.** $D = a^2 - 4(a + 3) = a^2 - 4a - 12 = (a - 6)(a + 2) = 0$ даёт $a = 6$ или $a = -2$. Корень $t = \\dfrac{a}{2}$ положителен только при $a = 6$ (тогда $t = 3$). Значение $a = -2$ даёт $t = -1 < 0$ — не подходит.`,
    `**2) Один положительный и один неположительный корень.** По теореме Виета произведение корней равно $a + 3$. Если $a + 3 < 0$, то есть $a < -3$, корни разных знаков — ровно один положительный. Если же $a + 3 = 0$ ($a = -3$), то корни $t = 0$ и $t = -3$ — положительных нет.`,
    `Объединяя оба случая, получаем $a < -3$ или $a = 6$.`,
    `## Ответ`,
    `$$a \\in (-\\infty;\\ -3) \\cup \\{6\\}.$$`,
  ].join('\n\n'),
};

const piecewiseFigure = {
  xRange: [-4.5, 6.5],
  yRange: [-5.4, 5.4],
  equalScale: false,
  maxWidth: 520,
  maxHeight: 330,
  xTicks: [-1, 3],
  yTicks: [4, -4],
  curves: [
    {
      kind: 'polyline',
      points: [
        [-4.5, 4],
        [-1, 4],
        [3, -4],
        [6.5, -4],
      ],
      color: 'blue',
      label: 'y=|x−3|−|x+1|',
      labelXY: [-4.3, 4.6],
      labelDelta: [0, -2],
    },
    {
      kind: 'linear',
      k: 0,
      b: 1,
      color: 'green',
      label: 'y=a',
      labelAt: 5.6,
      labelDelta: [4, -6],
    },
  ],
  points: [{ x: 0.5, y: 1, color: 'red' }],
  caption:
    'На наклонном участке (−1 < x < 3) прямая y = a пересекает график один раз.',
};

const piecewiseMod: ParameterTask = {
  publicId: 'P18AN2',
  topicSlug: 'ege-18-analytic-method',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '(-4;4)',
  statement: `Найдите все значения $a$, при каждом из которых уравнение $|x - 3| - |x + 1| = a$ имеет ровно одно решение.`,
  referenceSolution: [
    `## Раскрытие модулей`,
    `Рассмотрим функцию $g(x) = |x - 3| - |x + 1|$ на трёх промежутках (точки $-1$ и $3$ — где выражения под модулями меняют знак):`,
    `$$g(x) = \\begin{cases} 4, & x \\le -1, \\\\ 2 - 2x, & -1 < x < 3, \\\\ -4, & x \\ge 3. \\end{cases}$$`,
    `На крайних лучах функция постоянна ($4$ и $-4$), а между ними убывает от $4$ до $-4$. Область значений — отрезок $[-4;\\ 4]$.`,
    plot(piecewiseFigure),
    `## Пересечение с прямой $y = a$`,
    `- при $|a| > 4$ решений нет;\n- при $a = 4$ уравнению удовлетворяет весь луч $x \\le -1$, а при $a = -4$ — весь луч $x \\ge 3$ (бесконечно много решений);\n- при $-4 < a < 4$ прямая $y = a$ пересекает только наклонный участок — **ровно одно** решение $x = \\dfrac{2 - a}{2}$.`,
    `## Ответ`,
    `$$a \\in (-4;\\ 4).$$`,
  ].join('\n\n'),
};

const parameterTasks: ParameterTask[] = [
  parameterSystem,
  parameterAnalytic,
  rootPositive,
  rootStraddle,
  rootInterval,
  rootOneInside,
  tangentCircle,
  circleVee,
  semicircleLine,
  absParabolaEq,
  twoCircles,
  expUnique,
  piecewiseMod,
];

async function main() {
  const profileMathSubject = await prisma.subject.findUnique({
    where: { code: 'profile-math-ege' },
  });

  if (!profileMathSubject) {
    throw new Error('Profile math subject not found. Run seed.ts first.');
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: profileMathSubject.id },
  });

  const topicMap = new Map(topics.map((t) => [t.slug, t.id]));

  let added = 0;
  let skipped = 0;

  for (const task of parameterTasks) {
    const topicId = topicMap.get(task.topicSlug);

    if (!topicId) {
      console.warn(
        `⚠ Тема ${task.topicSlug} не найдена, пропускаем задачу ${task.publicId}`,
      );
      skipped++;
      continue;
    }

    await prisma.task.upsert({
      where: { publicId: task.publicId },
      update: {
        topicId,
        examPart: task.examPart,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: task.source,
      },
      create: {
        publicId: task.publicId,
        topicId,
        examPart: task.examPart,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: task.source,
      },
    });

    added++;
  }

  console.log(`\n✓ Добавлено ${added} задач (задание 18, параметр)`);
  if (skipped > 0) {
    console.log(`⚠ Пропущено ${skipped} задач (темы не найдены)`);
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
