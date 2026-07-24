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
  caption: 'Все точки cos 3x = 0. Выколоты те, где 1 − sin 3x = 0.',
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
  caption:
    'Синяя дуга — отрезок [−5π/2; −π]. Тёмные точки x₁, x₂ — подходящие корни.',
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
    `**Знаменатель (ОДЗ).** Из $1 - \\sin 3x = 0$, то есть $\\sin 3x = 1$, следует`,
    `$$3x = \\frac{\\pi}{2} + 2\\pi k \\;\\Rightarrow\\; x = \\frac{\\pi}{6} + \\frac{2\\pi}{3}k, \\quad k \\in \\mathbb{Z}.$$`,
    `Отметим на окружности все шесть точек серии $x = \\dfrac{\\pi}{6} + \\dfrac{\\pi}{3}k$ и выколем те три, где $\\sin 3x = 1$ (точки $\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6},\\ \\dfrac{3\\pi}{2}$).`,
    circle(fractionCircleA),
    `Остаются три точки, стоящие через $\\dfrac{2\\pi}{3}$: $\\dfrac{\\pi}{2},\\ \\dfrac{7\\pi}{6}$ и $-\\dfrac{\\pi}{6}$. Запишем их одной серией:`,
    `$$x = -\\frac{\\pi}{6} + \\frac{2\\pi}{3}n, \\quad n \\in \\mathbb{Z}.$$`,
    `## Пункт б). Отбор корней по окружности`,
    `Изобразим отрезок $\\left[-\\dfrac{5\\pi}{2};\\, -\\pi\\right]$ на окружности. Его длина равна $\\dfrac{3\\pi}{2}$, поэтому он занимает три четверти круга — дугу от точки $-\\dfrac{5\\pi}{2}$ (внизу) против часовой стрелки до точки $-\\pi$ (слева).`,
    `**Отберём корни.** На эту дугу попадают две точки серии — они отмечены как $x_1$ и $x_2$ (тёмные). Это положения $-\\dfrac{\\pi}{6}$ и $\\dfrac{\\pi}{2}$. Точка при $\\dfrac{7\\pi}{6}$ лежит вне дуги — этот корень нам не подходит.`,
    circle(fractionCircleB),
    `Запишем значения подходящих корней, попадающие в отрезок: сдвигаем каждую точку на один оборот назад ($-2\\pi$):`,
    `$$x_1 = -\\frac{\\pi}{6} - 2\\pi = -\\frac{13\\pi}{6}, \\qquad x_2 = \\frac{\\pi}{2} - 2\\pi = -\\frac{3\\pi}{2}.$$`,
    `Оба значения удовлетворяют ОДЗ (не совпадают с выколотыми точками).`,
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
  caption:
    'Три семейства корней: sin x = ½ (точки π/6 и 5π/6) и sin x = 1 (точка π/2).',
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
  caption: 'Синяя дуга — отрезок [−2π; −π/2]. Все три точки попали на дугу.',
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
    `Сведём уравнение к квадратному относительно $\\sin x$, применив формулу $\\cos 2x = 1 - 2\\sin^2 x$:`,
    `$$1 - 2\\sin^2 x + 3\\sin x - 2 = 0 \\;\\Rightarrow\\; -2\\sin^2 x + 3\\sin x - 1 = 0.$$`,
    `Умножим на $-1$ и заменим $t = \\sin x$, где $|t| \\le 1$:`,
    `$$2t^2 - 3t + 1 = 0, \\qquad D = 1, \\qquad t = 1 \\;\\text{ или }\\; t = \\frac{1}{2}.$$`,
    `**Случай 1.** $\\sin x = 1 \\;\\Rightarrow\\; x = \\dfrac{\\pi}{2} + 2\\pi k.$`,
    `**Случай 2.** $\\sin x = \\dfrac{1}{2} \\;\\Rightarrow\\; x = \\dfrac{\\pi}{6} + 2\\pi n$ или $x = \\dfrac{5\\pi}{6} + 2\\pi n.$`,
    circle(doubleAngleCircleA),
    `## Пункт б). Отбор корней по окружности`,
    `Отрезок $\\left[-2\\pi;\\, -\\dfrac{\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ — это три четверти круга: дуга от точки $-2\\pi$ (справа) против часовой стрелки до точки $-\\dfrac{\\pi}{2}$ (внизу).`,
    `**Отберём корни.** На эту дугу попадают все три точки — $\\dfrac{\\pi}{6},\\ \\dfrac{\\pi}{2}$ и $\\dfrac{5\\pi}{6}$ (тёмные точки $x_1, x_2, x_3$). За пределами отрезка корней не осталось.`,
    circle(doubleAngleCircleB),
    `Их значения на данном промежутке (каждую точку сдвигаем на оборот назад, на $-2\\pi$):`,
    `$$x_1 = \\frac{\\pi}{6} - 2\\pi = -\\frac{11\\pi}{6}, \\quad x_2 = \\frac{\\pi}{2} - 2\\pi = -\\frac{3\\pi}{2}, \\quad x_3 = \\frac{5\\pi}{6} - 2\\pi = -\\frac{7\\pi}{6}.$$`,
    `**Ответ:** а) $\\dfrac{\\pi}{2} + 2\\pi k,\\ \\dfrac{\\pi}{6} + 2\\pi n,\\ \\dfrac{5\\pi}{6} + 2\\pi n$; б) $-\\dfrac{11\\pi}{6},\\ -\\dfrac{3\\pi}{2},\\ -\\dfrac{7\\pi}{6}.$`,
  ].join('\n\n'),
};

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
  caption:
    'Синяя дуга — отрезок [−3π; −3π/2]. Точка 5π/6 (светлая) вне дуги — не подходит.',
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
    `Применим формулу $\\sin 2x = 2\\sin x \\cos x$ и перенесём всё влево:`,
    `$$2\\sin x \\cos x - \\cos x = 0 \\;\\Rightarrow\\; \\cos x\\,(2\\sin x - 1) = 0.$$`,
    `Произведение равно нулю, когда один из множителей равен нулю.`,
    `**Множитель 1.** $\\cos x = 0 \\;\\Rightarrow\\; x = \\dfrac{\\pi}{2} + \\pi k.$`,
    `**Множитель 2.** $2\\sin x - 1 = 0 \\;\\Rightarrow\\; \\sin x = \\dfrac{1}{2} \\;\\Rightarrow\\; x = \\dfrac{\\pi}{6} + 2\\pi n$ или $x = \\dfrac{5\\pi}{6} + 2\\pi n.$`,
    circle(factorCircleA),
    `## Пункт б). Отбор корней по окружности`,
    `Отрезок $\\left[-3\\pi;\\, -\\dfrac{3\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ — три четверти круга: дуга от $-3\\pi$ (слева) против часовой стрелки до $-\\dfrac{3\\pi}{2}$ (вверху).`,
    `**Отберём корни.** На дугу попадают три точки: $\\dfrac{3\\pi}{2}$ (внизу), $\\dfrac{\\pi}{6}$ (справа сверху) и $\\dfrac{\\pi}{2}$ (вверху, конец отрезка) — это $x_1, x_2, x_3$. Точка $\\dfrac{5\\pi}{6}$ осталась вне дуги — этот корень не подходит.`,
    circle(factorCircleB),
    `Значения подходящих корней на данном промежутке:`,
    `$$x_1 = \\frac{3\\pi}{2} - 4\\pi = -\\frac{5\\pi}{2}, \\quad x_2 = \\frac{\\pi}{6} - 2\\pi = -\\frac{11\\pi}{6}, \\quad x_3 = \\frac{\\pi}{2} - 2\\pi = -\\frac{3\\pi}{2}.$$`,
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
  caption:
    'Синяя дуга — отрезок [π; 5π/2]. Точка 2π/3 (светлая) вне дуги — не подходит.',
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
    `Уравнение квадратное относительно $\\cos x$. Замена $t = \\cos x$, где $|t| \\le 1$:`,
    `$$2t^2 - t - 1 = 0, \\qquad D = 9, \\qquad t = 1 \\;\\text{ или }\\; t = -\\frac{1}{2}.$$`,
    `**Случай 1.** $\\cos x = 1 \\;\\Rightarrow\\; x = 2\\pi k.$`,
    `**Случай 2.** $\\cos x = -\\dfrac{1}{2} \\;\\Rightarrow\\; x = \\pm\\dfrac{2\\pi}{3} + 2\\pi n.$`,
    circle(cosQuadCircleA),
    `## Пункт б). Отбор корней по окружности`,
    `Отрезок $\\left[\\pi;\\, \\dfrac{5\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ — три четверти круга: дуга от $\\pi$ (слева) против часовой стрелки до $\\dfrac{5\\pi}{2}$ (вверху).`,
    `**Отберём корни.** На дугу попадают две точки — $\\dfrac{4\\pi}{3}$ (внизу слева) и $0$ (справа, ей отвечает $2\\pi$), это $x_1$ и $x_2$. Точка $\\dfrac{2\\pi}{3}$ осталась вне дуги — не подходит.`,
    circle(cosQuadCircleB),
    `Значения корней на данном промежутке:`,
    `$$x_1 = \\frac{4\\pi}{3}, \\qquad x_2 = 0 + 2\\pi = 2\\pi.$$`,
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
  caption: 'Синяя дуга — отрезок [−7π/2; −2π]. Обе точки попали на дугу.',
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
    `Свернём левую часть в один синус методом вспомогательного угла. «Амплитуда» равна $\\sqrt{1^2 + (\\sqrt{3})^2} = 2$; разделим обе части на $2$:`,
    `$$\\frac{1}{2}\\sin x + \\frac{\\sqrt{3}}{2}\\cos x = \\frac{1}{2}.$$`,
    `Так как $\\dfrac{1}{2} = \\cos\\dfrac{\\pi}{3}$ и $\\dfrac{\\sqrt{3}}{2} = \\sin\\dfrac{\\pi}{3}$, левая часть — синус суммы:`,
    `$$\\sin\\!\\left(x + \\frac{\\pi}{3}\\right) = \\frac{1}{2}.$$`,
    `Отсюда $x + \\dfrac{\\pi}{3} = \\dfrac{\\pi}{6} + 2\\pi n$ или $x + \\dfrac{\\pi}{3} = \\dfrac{5\\pi}{6} + 2\\pi n$, и`,
    `$$x = -\\frac{\\pi}{6} + 2\\pi n \\qquad\\text{или}\\qquad x = \\frac{\\pi}{2} + 2\\pi k.$$`,
    circle(auxAngleCircleA),
    `## Пункт б). Отбор корней по окружности`,
    `Отрезок $\\left[-\\dfrac{7\\pi}{2};\\, -2\\pi\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ — три четверти круга: дуга от $-\\dfrac{7\\pi}{2}$ (вверху) против часовой стрелки до $-2\\pi$ (справа).`,
    `**Отберём корни.** На дугу попадают обе точки — $\\dfrac{\\pi}{2}$ (вверху, конец отрезка) и $-\\dfrac{\\pi}{6}$ (справа снизу), это $x_1$ и $x_2$.`,
    circle(auxAngleCircleB),
    `Значения корней на данном промежутке:`,
    `$$x_1 = \\frac{\\pi}{2} - 4\\pi = -\\frac{7\\pi}{2}, \\qquad x_2 = -\\frac{\\pi}{6} - 2\\pi = -\\frac{13\\pi}{6}.$$`,
    `**Ответ:** а) $-\\dfrac{\\pi}{6} + 2\\pi n,\\ \\dfrac{\\pi}{2} + 2\\pi k$; б) $-\\dfrac{7\\pi}{2},\\ -\\dfrac{13\\pi}{6}.$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 13 · ТРИГОНОМЕТРИЯ · СЛОЖНАЯ · КУБИЧЕСКАЯ (4sin³x − 3sin x = 0 ⇒ sin 3x)
// ─────────────────────────────────────────────────────────────────────────────

const cubicCircleA = {
  radius: 118,
  points: [
    { angle: 0, kind: 'root', label: '0' },
    { angle: 60, kind: 'root', label: 'π/3' },
    { angle: 120, kind: 'root', label: '2π/3' },
    { angle: 180, kind: 'root', label: 'π' },
    { angle: 240, kind: 'root', label: '4π/3' },
    { angle: 300, kind: 'root', label: '5π/3' },
  ],
  caption: 'Корни x = πk/3 — шесть точек через каждые 60°.',
};

const cubicCircleB = {
  radius: 118,
  arcs: [{ from: 0, to: 270 }],
  axisLabels: { right: '-2π', bottom: '-π/2' },
  points: [
    { angle: 0, kind: 'selected' },
    { angle: 60, kind: 'selected' },
    { angle: 120, kind: 'selected' },
    { angle: 180, kind: 'selected' },
    { angle: 240, kind: 'selected' },
    { angle: 300, kind: 'root' },
  ],
  caption:
    'Синяя дуга — отрезок [−2π; −π/2]. Тёмные точки — 5 подходящих корней; при 5π/3 (светлая) корень вне дуги.',
};

const cubicEquation: TrigTask = {
  publicId: 'T13TRIG6',
  topicSlug: 'ege-13-trigonometric',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: YASHCHENKO,
  correctAnswer: 'а) πk/3, k∈Z; б) -2π, -5π/3, -4π/3, -π, -2π/3',
  statement: [
    `**а)** Решите уравнение $4\\sin^3 x - 3\\sin x = 0.$`,
    `**б)** Укажите корни этого уравнения, принадлежащие отрезку $\\left[-2\\pi;\\, -\\dfrac{\\pi}{2}\\right].$`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Решение уравнения`,
    `Заметим, что левая часть — это формула тройного угла для синуса с обратным знаком. Действительно,`,
    `$$\\sin 3x = 3\\sin x - 4\\sin^3 x, \\qquad\\text{значит}\\qquad 4\\sin^3 x - 3\\sin x = -\\sin 3x.$$`,
    `Поэтому уравнение равносильно $-\\sin 3x = 0$, то есть $\\sin 3x = 0$:`,
    `$$3x = \\pi k \\;\\Rightarrow\\; x = \\frac{\\pi k}{3}, \\quad k \\in \\mathbb{Z}.$$`,
    `Это шесть точек на окружности, расположенных через каждые $60°$.`,
    circle(cubicCircleA),
    `## Пункт б). Отбор корней по окружности`,
    `Отрезок $\\left[-2\\pi;\\, -\\dfrac{\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ — три четверти круга: дуга от $-2\\pi$ (справа) против часовой стрелки до $-\\dfrac{\\pi}{2}$ (внизу).`,
    `**Отберём корни.** На эту дугу попадают пять точек серии: $0,\\ \\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3},\\ \\pi,\\ \\dfrac{4\\pi}{3}$ (тёмные). Шестая точка $\\dfrac{5\\pi}{3}$ лежит в оставшейся четверти круга — вне дуги, поэтому не подходит.`,
    circle(cubicCircleB),
    `Значения корней на данном промежутке (каждую точку сдвигаем на оборот назад, на $-2\\pi$):`,
    `$$0 - 2\\pi = -2\\pi,\\quad \\frac{\\pi}{3} - 2\\pi = -\\frac{5\\pi}{3},\\quad \\frac{2\\pi}{3} - 2\\pi = -\\frac{4\\pi}{3},\\quad \\pi - 2\\pi = -\\pi,\\quad \\frac{4\\pi}{3} - 2\\pi = -\\frac{2\\pi}{3}.$$`,
    `**Ответ:** а) $\\dfrac{\\pi k}{3},\\ k \\in \\mathbb{Z}$; б) $-2\\pi,\\ -\\dfrac{5\\pi}{3},\\ -\\dfrac{4\\pi}{3},\\ -\\pi,\\ -\\dfrac{2\\pi}{3}.$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 13 · ТРИГОНОМЕТРИЯ · СЛОЖНАЯ · ОДНОРОДНОЕ УРАВНЕНИЕ 2-Й СТЕПЕНИ
// ─────────────────────────────────────────────────────────────────────────────

const homogCircleA = {
  radius: 118,
  points: [
    { angle: 60, kind: 'root', label: 'π/3' },
    { angle: 240, kind: 'root', label: '4π/3' },
    { angle: 150, kind: 'root', label: '5π/6' },
    { angle: 330, kind: 'root', label: '-π/6' },
  ],
  caption: 'tg x = √3 (точки π/3 и 4π/3) и tg x = −1/√3 (точки 5π/6 и −π/6).',
};

const homogCircleB = {
  radius: 118,
  arcs: [{ from: 0, to: 270 }],
  axisLabels: { right: '2π', bottom: '7π/2' },
  points: [
    { angle: 60, kind: 'selected', label: 'x_1' },
    { angle: 150, kind: 'selected', label: 'x_2' },
    { angle: 240, kind: 'selected', label: 'x_3' },
    { angle: 330, kind: 'root' },
  ],
  caption:
    'Синяя дуга — отрезок [2π; 7π/2]. Точка −π/6 (светлая) вне дуги — не подходит.',
};

const homogEquation: TrigTask = {
  publicId: 'T13TRIG7',
  topicSlug: 'ege-13-trigonometric',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: STATGRAD,
  correctAnswer: 'а) π/3+πk, -π/6+πn; б) 7π/3, 17π/6, 10π/3',
  statement: [
    `**а)** Решите уравнение $\\sqrt{3}\\sin^2 x - 2\\sin x \\cos x - \\sqrt{3}\\cos^2 x = 0.$`,
    `**б)** Укажите корни этого уравнения, принадлежащие отрезку $\\left[2\\pi;\\, \\dfrac{7\\pi}{2}\\right].$`,
  ].join('\n\n'),
  referenceSolution: [
    `## Пункт а). Решение уравнения`,
    `Это однородное уравнение второй степени относительно $\\sin x$ и $\\cos x$. Проверим $\\cos x = 0$: тогда остаётся $\\sqrt{3}\\sin^2 x = \\sqrt{3} \\ne 0$ — значит, $\\cos x \\ne 0$, и можно разделить обе части на $\\cos^2 x$:`,
    `$$\\sqrt{3}\\,\\mathrm{tg}^2 x - 2\\,\\mathrm{tg}\\,x - \\sqrt{3} = 0.$$`,
    `Замена $t = \\mathrm{tg}\\,x$:`,
    `$$\\sqrt{3}\\,t^2 - 2t - \\sqrt{3} = 0, \\qquad D = 4 + 12 = 16, \\qquad t = \\frac{2 \\pm 4}{2\\sqrt{3}}.$$`,
    `Получаем $t = \\sqrt{3}$ или $t = -\\dfrac{1}{\\sqrt{3}}.$`,
    `**Случай 1.** $\\mathrm{tg}\\,x = \\sqrt{3} \\;\\Rightarrow\\; x = \\dfrac{\\pi}{3} + \\pi k.$`,
    `**Случай 2.** $\\mathrm{tg}\\,x = -\\dfrac{1}{\\sqrt{3}} \\;\\Rightarrow\\; x = -\\dfrac{\\pi}{6} + \\pi n.$`,
    circle(homogCircleA),
    `## Пункт б). Отбор корней по окружности`,
    `Отрезок $\\left[2\\pi;\\, \\dfrac{7\\pi}{2}\\right]$ имеет длину $\\dfrac{3\\pi}{2}$ — три четверти круга: дуга от $2\\pi$ (справа) против часовой стрелки до $\\dfrac{7\\pi}{2}$ (внизу).`,
    `**Отберём корни.** На дугу попадают три точки — $\\dfrac{\\pi}{3}$ (сверху справа), $\\dfrac{5\\pi}{6}$ (сверху слева) и $\\dfrac{4\\pi}{3}$ (снизу слева), это $x_1, x_2, x_3$. Точка $-\\dfrac{\\pi}{6}$ осталась вне дуги — не подходит.`,
    circle(homogCircleB),
    `Значения корней на данном промежутке (каждую точку сдвигаем на оборот вперёд, на $+2\\pi$):`,
    `$$x_1 = \\frac{\\pi}{3} + 2\\pi = \\frac{7\\pi}{3}, \\quad x_2 = \\frac{5\\pi}{6} + 2\\pi = \\frac{17\\pi}{6}, \\quad x_3 = \\frac{4\\pi}{3} + 2\\pi = \\frac{10\\pi}{3}.$$`,
    `**Ответ:** а) $\\dfrac{\\pi}{3} + \\pi k,\\ -\\dfrac{\\pi}{6} + \\pi n$; б) $\\dfrac{7\\pi}{3},\\ \\dfrac{17\\pi}{6},\\ \\dfrac{10\\pi}{3}.$`,
  ].join('\n\n'),
};

const trigTasks: TrigTask[] = [
  fractionEquation,
  doubleAngleEquation,
  factorEquation,
  cosQuadEquation,
  auxAngleEquation,
  cubicEquation,
  homogEquation,
];

async function main() {
  const subject = await prisma.subject.findUnique({
    where: { code: 'profile-math-ege' },
  });

  if (!subject) {
    throw new Error(
      'Предмет profile-math-ege не найден. Сначала запустите seed.ts',
    );
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
      console.warn(
        `⚠ Тема ${task.topicSlug} не найдена, пропускаем ${task.publicId}`,
      );
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
