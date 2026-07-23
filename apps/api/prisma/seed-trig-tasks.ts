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

/** Оборачивает JSON-описание единичной окружности в fenced-блок ```circle. */
function circle(spec: unknown): string {
  return ['```circle', JSON.stringify(spec), '```'].join('\n');
}

const FIPI = 'Реальные задания (ЕГЭ, ФИПИ)';
const YASHCHENKO = 'Ященко (сборник ЕГЭ)';
const STATGRAD = 'Статград';
const LYSENKO = 'Лысенко (сборник ЕГЭ)';

type TrigTask = {
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
// ЗАДАЧА 13 · ТРИГОНОМЕТРИЯ · ДРОБЬ С ОДЗ  (пример из методички, №15585)
// ─────────────────────────────────────────────────────────────────────────────

const fractionCircleA = {
  radius: 118,
  points: [
    { angle: 90, kind: 'root', label: 'π/2' },
    { angle: 30, kind: 'hole', label: 'π/6' },
    { angle: 150, kind: 'hole', label: '5π/6' },
    { angle: 210, kind: 'root', label: '7π/6' },
    { angle: 330, kind: 'root', label: '-π/6' },
    { angle: 270, kind: 'hole', label: '3π/2' },
  ],
  caption: 'Слева — все точки cos 3x = 0. Выколоты те, где 1 − sin 3x = 0.',
};

const fractionCircleB = {
  radius: 118,
  arcs: [{ from: 270, to: 180 }],
  axisLabels: { right: '-2π', left: '-π', bottom: '-5π/2' },
  points: [
    { angle: 90, kind: 'selected', label: 'x_2' },
    { angle: 330, kind: 'selected', label: 'x_1' },
    { angle: 210, kind: 'root' },
    { angle: 30, kind: 'hole' },
    { angle: 150, kind: 'hole' },
    { angle: 270, kind: 'hole' },
  ],
  caption: 'Справа — дуга [−5π/2; −π] (три четверти круга) и попавшие корни x₁, x₂.',
};

const fractionEquation: TrigTask = {
  publicId: 'T13TRIG1',
  topicSlug: 'ege-13-trigonometric',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: FIPI,
  correctAnswer: 'а) -π/6 + 2πn/3, n∈Z; б) -13π/6, -3π/2',
  statement: [
    `**а)** Решите уравнение $\\dfrac{\\cos 3x}{1 - \\sin 3x} = 0.$`,
    `**б)** Укажите корни этого уравнения, принадлежащие отрезку $\\left[-\\dfrac{5\\pi}{2};\\, -\\pi\\right].$`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Решение уравнения`,
    `Дробь равна нулю, когда её числитель равен нулю, а знаменатель — нет. Поэтому уравнение равносильно системе`,
    `$$\\begin{cases} \\cos 3x = 0, \\\\ 1 - \\sin 3x \\ne 0. \\end{cases}$$`,
    `**Числитель.** Из $\\cos 3x = 0$ получаем`,
    `$$3x = \\frac{\\pi}{2} + \\pi k \\;\\Rightarrow\\; x = \\frac{\\pi}{6} + \\frac{\\pi}{3}k, \\quad k \\in \\mathbb{Z}.$$`,
    `**Знаменатель (ОДЗ).** Найдём, при каких $x$ он обращается в нуль. Из $1 - \\sin 3x = 0$, то есть $\\sin 3x = 1$, следует`,
    `$$3x = \\frac{\\pi}{2} + 2\\pi k \\;\\Rightarrow\\; x = \\frac{\\pi}{6} + \\frac{2\\pi}{3}k, \\quad k \\in \\mathbb{Z}.$$`,
    `Эти значения нужно исключить из найденной серии. Отметим на единичной окружности все шесть точек серии $x = \\dfrac{\\pi}{6} + \\dfrac{\\pi}{3}k$ и выколем те три, где $\\sin 3x = 1$ (это точки $\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6},\\ \\dfrac{3\\pi}{2}$).`,
    circle(fractionCircleA),
    `После выкалывания остаются три точки, стоящие через $\\dfrac{2\\pi}{3}$ друг от друга: $\\dfrac{\\pi}{2},\\ \\dfrac{7\\pi}{6}$ и $-\\dfrac{\\pi}{6}$. Их можно записать одной серией с началом в удобной точке $-\\dfrac{\\pi}{6}$:`,
    `$$x = -\\frac{\\pi}{6} + \\frac{2\\pi}{3}n, \\quad n \\in \\mathbb{Z}.$$`,
    `## Пункт б). Отбор корней методом окружности`,
    `Нужно выбрать корни серии $x = -\\dfrac{\\pi}{6} + \\dfrac{2\\pi}{3}n$, попавшие в отрезок $\\left[-\\dfrac{5\\pi}{2};\\, -\\pi\\right].$`,
    `**Шаг 1. Двойное неравенство.** Подставим формулу корня в условие и решим неравенство относительно $n$:`,
    `$$-\\frac{5\\pi}{2} \\le -\\frac{\\pi}{6} + \\frac{2\\pi}{3}n \\le -\\pi.$$`,
    `Прибавим ко всем частям $\\dfrac{\\pi}{6}$:`,
    `$$-\\frac{5\\pi}{2} + \\frac{\\pi}{6} \\le \\frac{2\\pi}{3}n \\le -\\pi + \\frac{\\pi}{6} \\;\\Rightarrow\\; -\\frac{7\\pi}{3} \\le \\frac{2\\pi}{3}n \\le -\\frac{5\\pi}{6}.$$`,
    `Разделим все части на $\\dfrac{2\\pi}{3}$ (число положительное — знаки неравенства сохраняются):`,
    `$$-\\frac{7}{2} \\le n \\le -\\frac{5}{4}, \\qquad\\text{то есть}\\qquad -3{,}5 \\le n \\le -1{,}25.$$`,
    `**Шаг 2. Целые $n$.** В этот промежуток попадают ровно два целых числа: $n = -3$ и $n = -2$.`,
    `**Шаг 3. Значения корней.**`,
    `$$n = -3:\\quad x_1 = -\\frac{\\pi}{6} + \\frac{2\\pi}{3}\\cdot(-3) = -\\frac{\\pi}{6} - 2\\pi = -\\frac{13\\pi}{6};$$`,
    `$$n = -2:\\quad x_2 = -\\frac{\\pi}{6} + \\frac{2\\pi}{3}\\cdot(-2) = -\\frac{\\pi}{6} - \\frac{4\\pi}{3} = -\\frac{3\\pi}{2}.$$`,
    `**Шаг 4. Проверка по окружности.** Отрезок $\\left[-\\dfrac{5\\pi}{2};\\, -\\pi\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ и изображается дугой в три четверти круга. На ней лежат ровно две точки нашей серии — это $x_1$ и $x_2$; третья точка серии (соответствующая $\\dfrac{7\\pi}{6}$) в дугу не попадает.`,
    circle(fractionCircleB),
    `Оба найденных значения удовлетворяют ОДЗ (они не совпадают с выколотыми точками), поэтому оба входят в ответ.`,
    `**Ответ:** а) $-\\dfrac{\\pi}{6} + \\dfrac{2\\pi}{3}n,\\ n \\in \\mathbb{Z}$; б) $-\\dfrac{13\\pi}{6},\\ -\\dfrac{3\\pi}{2}.$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 13 · ТРИГОНОМЕТРИЯ · СВЕДЕНИЕ К КВАДРАТНОМУ (формула двойного угла)
// ─────────────────────────────────────────────────────────────────────────────

const doubleAngleCircleA = {
  radius: 118,
  points: [
    { angle: 90, kind: 'root', label: 'π/2' },
    { angle: 30, kind: 'root', label: 'π/6' },
    { angle: 150, kind: 'root', label: '5π/6' },
  ],
  caption: 'Три семейства корней: sin x = ½ (точки π/6 и 5π/6) и sin x = 1 (точка π/2).',
};

const doubleAngleCircleB = {
  radius: 118,
  arcs: [{ from: 0, to: 270 }],
  axisLabels: { right: '-2π', bottom: '-π/2' },
  points: [
    { angle: 30, kind: 'selected', label: 'x_1' },
    { angle: 90, kind: 'selected', label: 'x_2', labelGap: 0.46 },
    { angle: 150, kind: 'selected', label: 'x_3' },
  ],
  caption: 'Дуга [−2π; −π/2] (три четверти круга). Все три корня попали в отрезок.',
};

const doubleAngleEquation: TrigTask = {
  publicId: 'T13TRIG2',
  topicSlug: 'ege-13-trigonometric',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: YASHCHENKO,
  correctAnswer: 'а) π/2+2πk, π/6+2πn, 5π/6+2πn; б) -11π/6, -3π/2, -7π/6',
  statement: [
    `**а)** Решите уравнение $\\cos 2x + 3\\sin x - 2 = 0.$`,
    `**б)** Укажите корни этого уравнения, принадлежащие отрезку $\\left[-2\\pi;\\, -\\dfrac{\\pi}{2}\\right].$`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Решение уравнения`,
    `Сведём уравнение к квадратному относительно $\\sin x$. Применим формулу двойного угла в виде $\\cos 2x = 1 - 2\\sin^2 x$:`,
    `$$1 - 2\\sin^2 x + 3\\sin x - 2 = 0 \\;\\Rightarrow\\; -2\\sin^2 x + 3\\sin x - 1 = 0.$$`,
    `Умножим на $-1$ и сделаем замену $t = \\sin x$, где $|t| \\le 1$:`,
    `$$2t^2 - 3t + 1 = 0, \\qquad D = 9 - 8 = 1, \\qquad t_{1,2} = \\frac{3 \\pm 1}{4}.$$`,
    `Получаем $t = 1$ или $t = \\dfrac{1}{2}$ — оба корня подходят по модулю.`,
    `**Первый случай.** $\\sin x = 1 \\;\\Rightarrow\\; x = \\dfrac{\\pi}{2} + 2\\pi k.$`,
    `**Второй случай.** $\\sin x = \\dfrac{1}{2} \\;\\Rightarrow\\; x = \\dfrac{\\pi}{6} + 2\\pi n$ или $x = \\dfrac{5\\pi}{6} + 2\\pi n.$`,
    circle(doubleAngleCircleA),
    `## Пункт б). Отбор корней методом окружности`,
    `Отрезок $\\left[-2\\pi;\\, -\\dfrac{\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ и изображается дугой в три четверти круга. Найдём корни каждой серии, попадающие в этот отрезок, решая двойное неравенство.`,
    `**Серия $x = \\dfrac{\\pi}{2} + 2\\pi k$.**`,
    `$$-2\\pi \\le \\frac{\\pi}{2} + 2\\pi k \\le -\\frac{\\pi}{2} \\;\\Rightarrow\\; -\\frac{5\\pi}{2} \\le 2\\pi k \\le -\\pi \\;\\Rightarrow\\; -\\frac{5}{4} \\le k \\le -\\frac{1}{2}.$$`,
    `Целое $k = -1$, тогда $x = \\dfrac{\\pi}{2} - 2\\pi = -\\dfrac{3\\pi}{2}.$`,
    `**Серия $x = \\dfrac{\\pi}{6} + 2\\pi n$.**`,
    `$$-2\\pi \\le \\frac{\\pi}{6} + 2\\pi n \\le -\\frac{\\pi}{2} \\;\\Rightarrow\\; -\\frac{13\\pi}{6} \\le 2\\pi n \\le -\\frac{2\\pi}{3} \\;\\Rightarrow\\; -\\frac{13}{12} \\le n \\le -\\frac{1}{3}.$$`,
    `Целое $n = -1$, тогда $x = \\dfrac{\\pi}{6} - 2\\pi = -\\dfrac{11\\pi}{6}.$`,
    `**Серия $x = \\dfrac{5\\pi}{6} + 2\\pi n$.**`,
    `$$-2\\pi \\le \\frac{5\\pi}{6} + 2\\pi n \\le -\\frac{\\pi}{2} \\;\\Rightarrow\\; -\\frac{17\\pi}{6} \\le 2\\pi n \\le -\\frac{4\\pi}{3} \\;\\Rightarrow\\; -\\frac{17}{12} \\le n \\le -\\frac{2}{3}.$$`,
    `Целое $n = -1$, тогда $x = \\dfrac{5\\pi}{6} - 2\\pi = -\\dfrac{7\\pi}{6}.$`,
    circle(doubleAngleCircleB),
    `Все три найденных корня лежат внутри отрезка (на рисунке — тёмные точки на дуге).`,
    `**Ответ:** а) $\\dfrac{\\pi}{2} + 2\\pi k,\\ \\dfrac{\\pi}{6} + 2\\pi n,\\ \\dfrac{5\\pi}{6} + 2\\pi n$; б) $-\\dfrac{11\\pi}{6},\\ -\\dfrac{3\\pi}{2},\\ -\\dfrac{7\\pi}{6}.$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 13 · ТРИГОНОМЕТРИЯ · РАЗЛОЖЕНИЕ НА МНОЖИТЕЛИ  (sin 2x = cos x)
// ─────────────────────────────────────────────────────────────────────────────

const factorCircleA = {
  radius: 118,
  points: [
    { angle: 90, kind: 'root', label: 'π/2' },
    { angle: 270, kind: 'root', label: '3π/2' },
    { angle: 30, kind: 'root', label: 'π/6' },
    { angle: 150, kind: 'root', label: '5π/6' },
  ],
  caption: 'cos x = 0 (точки π/2 и 3π/2) и sin x = ½ (точки π/6 и 5π/6).',
};

const factorCircleB = {
  radius: 118,
  arcs: [{ from: 180, to: 90 }],
  axisLabels: { left: '-3π' },
  points: [
    { angle: 270, kind: 'selected', label: 'x_1' },
    { angle: 30, kind: 'selected', label: 'x_2' },
    { angle: 90, kind: 'selected', label: 'x_3', labelGap: 0.46 },
    { angle: 150, kind: 'root' },
  ],
  caption: 'Дуга [−3π; −3π/2]. Корень при 5π/6 (светлая точка вне дуги) в отрезок не попал.',
};

const factorEquation: TrigTask = {
  publicId: 'T13TRIG3',
  topicSlug: 'ege-13-trigonometric',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: STATGRAD,
  correctAnswer: 'а) π/2+πk, π/6+2πn, 5π/6+2πn; б) -5π/2, -11π/6, -3π/2',
  statement: [
    `**а)** Решите уравнение $\\sin 2x = \\cos x.$`,
    `**б)** Укажите корни этого уравнения, принадлежащие отрезку $\\left[-3\\pi;\\, -\\dfrac{3\\pi}{2}\\right].$`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Решение уравнения`,
    `Перенесём всё в левую часть и применим формулу $\\sin 2x = 2\\sin x \\cos x$:`,
    `$$2\\sin x \\cos x - \\cos x = 0.$$`,
    `Вынесем общий множитель $\\cos x$ за скобки:`,
    `$$\\cos x\\,(2\\sin x - 1) = 0.$$`,
    `Произведение равно нулю, когда хотя бы один множитель равен нулю.`,
    `**Первый множитель.** $\\cos x = 0 \\;\\Rightarrow\\; x = \\dfrac{\\pi}{2} + \\pi k.$`,
    `**Второй множитель.** $2\\sin x - 1 = 0 \\;\\Rightarrow\\; \\sin x = \\dfrac{1}{2} \\;\\Rightarrow\\; x = \\dfrac{\\pi}{6} + 2\\pi n$ или $x = \\dfrac{5\\pi}{6} + 2\\pi n.$`,
    circle(factorCircleA),
    `## Пункт б). Отбор корней методом окружности`,
    `Отрезок $\\left[-3\\pi;\\, -\\dfrac{3\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ (три четверти круга). Разберём каждую серию.`,
    `**Серия $x = \\dfrac{\\pi}{2} + \\pi k$** (шаг $\\pi$, поэтому корней в отрезке может быть несколько).`,
    `$$-3\\pi \\le \\frac{\\pi}{2} + \\pi k \\le -\\frac{3\\pi}{2} \\;\\Rightarrow\\; -\\frac{7\\pi}{2} \\le \\pi k \\le -2\\pi \\;\\Rightarrow\\; -\\frac{7}{2} \\le k \\le -2.$$`,
    `Целые $k = -3$ и $k = -2$:`,
    `$$k=-3:\\ x = \\frac{\\pi}{2} - 3\\pi = -\\frac{5\\pi}{2}; \\qquad k=-2:\\ x = \\frac{\\pi}{2} - 2\\pi = -\\frac{3\\pi}{2}.$$`,
    `**Серия $x = \\dfrac{\\pi}{6} + 2\\pi n$.**`,
    `$$-3\\pi \\le \\frac{\\pi}{6} + 2\\pi n \\le -\\frac{3\\pi}{2} \\;\\Rightarrow\\; -\\frac{19\\pi}{6} \\le 2\\pi n \\le -\\frac{5\\pi}{3} \\;\\Rightarrow\\; -\\frac{19}{12} \\le n \\le -\\frac{5}{6}.$$`,
    `Целое $n = -1$, тогда $x = \\dfrac{\\pi}{6} - 2\\pi = -\\dfrac{11\\pi}{6}.$`,
    `**Серия $x = \\dfrac{5\\pi}{6} + 2\\pi n$.**`,
    `$$-3\\pi \\le \\frac{5\\pi}{6} + 2\\pi n \\le -\\frac{3\\pi}{2} \\;\\Rightarrow\\; -\\frac{23\\pi}{6} \\le 2\\pi n \\le -\\frac{7\\pi}{3} \\;\\Rightarrow\\; -\\frac{23}{12} \\le n \\le -\\frac{7}{6}.$$`,
    `Между $-\\dfrac{23}{12} \\approx -1{,}92$ и $-\\dfrac{7}{6} \\approx -1{,}17$ целых чисел нет — из этой серии в отрезок **не попадает ни одного корня**.`,
    circle(factorCircleB),
    `Итак, в отрезок попали три корня: $-\\dfrac{5\\pi}{2},\\ -\\dfrac{11\\pi}{6},\\ -\\dfrac{3\\pi}{2}$ (тёмные точки на дуге), а корень серии $\\dfrac{5\\pi}{6}$ остался вне дуги.`,
    `**Ответ:** а) $\\dfrac{\\pi}{2} + \\pi k,\\ \\dfrac{\\pi}{6} + 2\\pi n,\\ \\dfrac{5\\pi}{6} + 2\\pi n$; б) $-\\dfrac{5\\pi}{2},\\ -\\dfrac{11\\pi}{6},\\ -\\dfrac{3\\pi}{2}.$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 13 · ТРИГОНОМЕТРИЯ · КВАДРАТНОЕ ОТНОСИТЕЛЬНО cos x
// ─────────────────────────────────────────────────────────────────────────────

const cosQuadCircleA = {
  radius: 118,
  points: [
    { angle: 0, kind: 'root', label: '0' },
    { angle: 120, kind: 'root', label: '2π/3' },
    { angle: 240, kind: 'root', label: '4π/3' },
  ],
  caption: 'cos x = 1 (точка 0) и cos x = −½ (точки 2π/3 и 4π/3).',
};

const cosQuadCircleB = {
  radius: 118,
  arcs: [{ from: 180, to: 90 }],
  axisLabels: { left: 'π', top: '5π/2' },
  points: [
    { angle: 240, kind: 'selected', label: 'x_1' },
    { angle: 0, kind: 'selected', label: 'x_2' },
    { angle: 120, kind: 'root' },
  ],
  caption: 'Дуга [π; 5π/2]. Корень при 2π/3 (светлая точка вне дуги) в отрезок не попал.',
};

const cosQuadEquation: TrigTask = {
  publicId: 'T13TRIG4',
  topicSlug: 'ege-13-trigonometric',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: LYSENKO,
  correctAnswer: 'а) 2πk, ±2π/3+2πn; б) 4π/3, 2π',
  statement: [
    `**а)** Решите уравнение $2\\cos^2 x - \\cos x - 1 = 0.$`,
    `**б)** Укажите корни этого уравнения, принадлежащие отрезку $\\left[\\pi;\\, \\dfrac{5\\pi}{2}\\right].$`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Решение уравнения`,
    `Уравнение квадратное относительно $\\cos x$. Сделаем замену $t = \\cos x$, где $|t| \\le 1$:`,
    `$$2t^2 - t - 1 = 0, \\qquad D = 1 + 8 = 9, \\qquad t_{1,2} = \\frac{1 \\pm 3}{4}.$$`,
    `Получаем $t = 1$ или $t = -\\dfrac{1}{2}$ — оба значения допустимы.`,
    `**Первый случай.** $\\cos x = 1 \\;\\Rightarrow\\; x = 2\\pi k.$`,
    `**Второй случай.** $\\cos x = -\\dfrac{1}{2} \\;\\Rightarrow\\; x = \\pm\\dfrac{2\\pi}{3} + 2\\pi n.$`,
    circle(cosQuadCircleA),
    `## Пункт б). Отбор корней методом окружности`,
    `Отрезок $\\left[\\pi;\\, \\dfrac{5\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ (три четверти круга). Рассмотрим три серии.`,
    `**Серия $x = 2\\pi k$.**`,
    `$$\\pi \\le 2\\pi k \\le \\frac{5\\pi}{2} \\;\\Rightarrow\\; \\frac{1}{2} \\le k \\le \\frac{5}{4}.$$`,
    `Целое $k = 1$, тогда $x = 2\\pi.$`,
    `**Серия $x = \\dfrac{2\\pi}{3} + 2\\pi n$.**`,
    `$$\\pi \\le \\frac{2\\pi}{3} + 2\\pi n \\le \\frac{5\\pi}{2} \\;\\Rightarrow\\; \\frac{\\pi}{3} \\le 2\\pi n \\le \\frac{11\\pi}{6} \\;\\Rightarrow\\; \\frac{1}{6} \\le n \\le \\frac{11}{12}.$$`,
    `Между $\\dfrac{1}{6} \\approx 0{,}17$ и $\\dfrac{11}{12} \\approx 0{,}92$ целых чисел нет — корней из этой серии в отрезке **нет**.`,
    `**Серия $x = -\\dfrac{2\\pi}{3} + 2\\pi n$.**`,
    `$$\\pi \\le -\\frac{2\\pi}{3} + 2\\pi n \\le \\frac{5\\pi}{2} \\;\\Rightarrow\\; \\frac{5\\pi}{3} \\le 2\\pi n \\le \\frac{19\\pi}{6} \\;\\Rightarrow\\; \\frac{5}{6} \\le n \\le \\frac{19}{12}.$$`,
    `Целое $n = 1$, тогда $x = -\\dfrac{2\\pi}{3} + 2\\pi = \\dfrac{4\\pi}{3}.$`,
    circle(cosQuadCircleB),
    `В отрезок попали два корня: $\\dfrac{4\\pi}{3}$ и $2\\pi$ (тёмные точки на дуге).`,
    `**Ответ:** а) $2\\pi k,\\ \\pm\\dfrac{2\\pi}{3} + 2\\pi n$; б) $\\dfrac{4\\pi}{3},\\ 2\\pi.$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 13 · ТРИГОНОМЕТРИЯ · ВВЕДЕНИЕ ВСПОМОГАТЕЛЬНОГО УГЛА
// ─────────────────────────────────────────────────────────────────────────────

const auxAngleCircleA = {
  radius: 118,
  points: [
    { angle: 90, kind: 'root', label: 'π/2' },
    { angle: 330, kind: 'root', label: '-π/6' },
  ],
  caption: 'Два семейства корней: x = −π/6 + 2πn и x = π/2 + 2πk.',
};

const auxAngleCircleB = {
  radius: 118,
  arcs: [{ from: 90, to: 0 }],
  axisLabels: { right: '-2π' },
  points: [
    { angle: 90, kind: 'selected', label: 'x_1', labelGap: 0.46 },
    { angle: 330, kind: 'selected', label: 'x_2' },
  ],
  caption: 'Дуга [−7π/2; −2π]. Оба корня попали в отрезок.',
};

const auxAngleEquation: TrigTask = {
  publicId: 'T13TRIG5',
  topicSlug: 'ege-13-trigonometric',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: 'а) -π/6+2πn, π/2+2πk; б) -7π/2, -13π/6',
  statement: [
    `**а)** Решите уравнение $\\sin x + \\sqrt{3}\\cos x = 1.$`,
    `**б)** Укажите корни этого уравнения, принадлежащие отрезку $\\left[-\\dfrac{7\\pi}{2};\\, -2\\pi\\right].$`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Решение уравнения`,
    `Это линейное относительно $\\sin x$ и $\\cos x$ уравнение. Свернём левую часть в один синус методом вспомогательного угла. Коэффициенты $1$ и $\\sqrt{3}$ дают «амплитуду» $\\sqrt{1^2 + (\\sqrt{3})^2} = 2$. Разделим обе части на $2$:`,
    `$$\\frac{1}{2}\\sin x + \\frac{\\sqrt{3}}{2}\\cos x = \\frac{1}{2}.$$`,
    `Заметим, что $\\dfrac{1}{2} = \\cos\\dfrac{\\pi}{3}$ и $\\dfrac{\\sqrt{3}}{2} = \\sin\\dfrac{\\pi}{3}$. Тогда левая часть — это синус суммы:`,
    `$$\\sin x \\cos\\frac{\\pi}{3} + \\cos x \\sin\\frac{\\pi}{3} = \\sin\\!\\left(x + \\frac{\\pi}{3}\\right) = \\frac{1}{2}.$$`,
    `Решаем простейшее уравнение $\\sin\\!\\left(x + \\dfrac{\\pi}{3}\\right) = \\dfrac{1}{2}$:`,
    `$$x + \\frac{\\pi}{3} = \\frac{\\pi}{6} + 2\\pi n \\quad\\text{или}\\quad x + \\frac{\\pi}{3} = \\frac{5\\pi}{6} + 2\\pi n.$$`,
    `Отсюда`,
    `$$x = -\\frac{\\pi}{6} + 2\\pi n \\qquad\\text{или}\\qquad x = \\frac{\\pi}{2} + 2\\pi k.$$`,
    circle(auxAngleCircleA),
    `## Пункт б). Отбор корней методом окружности`,
    `Отрезок $\\left[-\\dfrac{7\\pi}{2};\\, -2\\pi\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ (три четверти круга). Проверим обе серии.`,
    `**Серия $x = -\\dfrac{\\pi}{6} + 2\\pi n$.**`,
    `$$-\\frac{7\\pi}{2} \\le -\\frac{\\pi}{6} + 2\\pi n \\le -2\\pi \\;\\Rightarrow\\; -\\frac{10\\pi}{3} \\le 2\\pi n \\le -\\frac{11\\pi}{6} \\;\\Rightarrow\\; -\\frac{5}{3} \\le n \\le -\\frac{11}{12}.$$`,
    `Целое $n = -1$, тогда $x = -\\dfrac{\\pi}{6} - 2\\pi = -\\dfrac{13\\pi}{6}.$`,
    `**Серия $x = \\dfrac{\\pi}{2} + 2\\pi k$.**`,
    `$$-\\frac{7\\pi}{2} \\le \\frac{\\pi}{2} + 2\\pi k \\le -2\\pi \\;\\Rightarrow\\; -4\\pi \\le 2\\pi k \\le -\\frac{5\\pi}{2} \\;\\Rightarrow\\; -2 \\le k \\le -\\frac{5}{4}.$$`,
    `Целое $k = -2$, тогда $x = \\dfrac{\\pi}{2} - 4\\pi = -\\dfrac{7\\pi}{2}.$`,
    circle(auxAngleCircleB),
    `Оба корня лежат в отрезке (корень $-\\dfrac{7\\pi}{2}$ совпадает с его левым концом и потому включается).`,
    `**Ответ:** а) $-\\dfrac{\\pi}{6} + 2\\pi n,\\ \\dfrac{\\pi}{2} + 2\\pi k$; б) $-\\dfrac{7\\pi}{2},\\ -\\dfrac{13\\pi}{6}.$`,
  ].join('\n\n'),
};

const trigTasks: TrigTask[] = [
  fractionEquation,
  doubleAngleEquation,
  factorEquation,
  cosQuadEquation,
  auxAngleEquation,
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

  for (const task of trigTasks) {
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

  console.log(`\n✓ Загружено тригонометрических задач (задание 13): ${added}`);
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
