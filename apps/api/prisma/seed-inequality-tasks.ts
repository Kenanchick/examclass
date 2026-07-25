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

/** Оборачивает JSON-описание числовой прямой в fenced-блок ```numline. */
function numline(spec: unknown): string {
  return ['```numline', JSON.stringify(spec), '```'].join('\n');
}

const FIPI = 'Реальные задания (ЕГЭ, ФИПИ)';
const EXAMCLASS = 'ExamClass (банк задач)';

type InequalityTask = {
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
// ЗАДАЧА 15 · ДРОБНО-ЛОГАРИФМИЧЕСКОЕ НЕРАВЕНСТВО С ЗАМЕНОЙ
// ─────────────────────────────────────────────────────────────────────────────

const fractionSignFigure = {
  points: [
    { label: '0', kind: 'open' },
    { label: '1', kind: 'filled' },
    { label: '3', kind: 'open' },
  ],
  signs: ['-', '+', '-', '+'],
  bands: [{ from: -1, to: 0 }, { from: 1, to: 2 }],
  axisLabel: 'a',
  caption: 'Знаки дроби (a−1)/(a(a−3)). Зелёным — где она ≤ 0.',
};

const fractionAnswerFigure = {
  points: [
    { label: '0', kind: 'open' },
    { label: '1', kind: 'open' },
    { label: '2', kind: 'filled' },
    { label: '8', kind: 'open' },
  ],
  bands: [{ from: 0, to: 1 }, { from: 2, to: 3 }],
  axisLabel: 'x',
  caption: 'Ответ на оси x после обратной замены a = log₂x.',
};

const fractionalLog: InequalityTask = {
  publicId: 'N15LOG1',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '(0;1)∪[2;8)',
  statement: `Решите неравенство $$\\dfrac{\\log_2(4x) - 3}{\\log_2^2 x - 3\\log_2 x} \\le 0.$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `Логарифм определён только при положительном аргументе. Аргументы всех логарифмов — это $x$ (в $\\log_2 x$) и $4x$ (в $\\log_2(4x)$); оба положительны при $x > 0$. Кроме того, знаменатель дроби не должен обращаться в нуль — это ограничение учтём на шаге метода интервалов.`,
    `**ОДЗ:** $x > 0$.`,
    `## Упрощаем числитель и знаменатель`,
    `**Логарифм произведения:** $\\log_a(bc) = \\log_a b + \\log_a c$. Поэтому`,
    `$$\\log_2(4x) = \\log_2 4 + \\log_2 x = 2 + \\log_2 x,$$`,
    `так как $\\log_2 4 = 2$. Тогда числитель равен`,
    `$$\\log_2(4x) - 3 = 2 + \\log_2 x - 3 = \\log_2 x - 1.$$`,
    `В знаменателе $\\log_2^2 x = (\\log_2 x)^2$. Вынесем общий множитель $\\log_2 x$:`,
    `$$\\log_2^2 x - 3\\log_2 x = \\log_2 x\\,(\\log_2 x - 3).$$`,
    `Неравенство принимает вид`,
    `$$\\frac{\\log_2 x - 1}{\\log_2 x\\,(\\log_2 x - 3)} \\le 0.$$`,
    `## Замена переменной`,
    `Пусть $a = \\log_2 x$. При $x > 0$ переменная $a$ принимает **любые** действительные значения. Получаем рациональное неравенство`,
    `$$\\frac{a - 1}{a\\,(a - 3)} \\le 0.$$`,
    `## Метод интервалов`,
    `Нули числителя и знаменателя: $a = 1$ (числитель), $a = 0$ и $a = 3$ (знаменатель). Точку $a = 1$ отмечаем **закрашенной** — неравенство нестрогое, и в ней дробь равна нулю (это решение). Точки $a = 0$ и $a = 3$ — **выколотые**: в них знаменатель обращается в нуль, дробь не определена.`,
    `Определим знак дроби на каждом промежутке подстановкой пробной точки:`,
    `- $a < 0$: числитель $<0$, множители знаменателя оба $<0$, их произведение $>0$ — дробь $\\dfrac{-}{+} < 0$;\n- $0 < a < 1$: числитель $<0$, знаменатель $(+)\\cdot(-) < 0$ — дробь $\\dfrac{-}{-} > 0$;\n- $1 < a < 3$: числитель $>0$, знаменатель $(+)\\cdot(-) < 0$ — дробь $\\dfrac{+}{-} < 0$;\n- $a > 3$: числитель $>0$, знаменатель $(+)\\cdot(+) > 0$ — дробь $\\dfrac{+}{+} > 0$.`,
    numline(fractionSignFigure),
    `Неравенству $\\le 0$ отвечают промежутки, где дробь отрицательна или равна нулю:`,
    `$$a < 0 \\quad \\text{или} \\quad 1 \\le a < 3.$$`,
    `## Обратная замена`,
    `Возвращаемся к $x$ по формуле $a = \\log_2 x$. Функция $\\log_2$ **возрастающая** (основание $2 > 1$), поэтому знаки неравенств при переходе к $x$ сохраняются.`,
    `**1)** $a < 0$: $\\log_2 x < 0 = \\log_2 1 \\Rightarrow 0 < x < 1$ (левую границу даёт ОДЗ $x > 0$).`,
    `**2)** $1 \\le a < 3$: $\\log_2 x \\ge 1 = \\log_2 2$ и $\\log_2 x < 3 = \\log_2 8$, откуда $2 \\le x < 8$.`,
    numline(fractionAnswerFigure),
    `## Ответ`,
    `$$x \\in (0;\\ 1) \\cup [2;\\ 8).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ЛОГАРИФМИЧЕСКОЕ НЕРАВЕНСТВО, КВАДРАТНОЕ ОТНОСИТЕЛЬНО ЛОГАРИФМА
// ─────────────────────────────────────────────────────────────────────────────

const squareLogSignFigure = {
  points: [
    { label: '1', kind: 'filled' },
    { label: '2', kind: 'filled' },
  ],
  signs: ['+', '-', '+'],
  bands: [{ from: 0, to: 1 }],
  axisLabel: 't',
  caption: '(t−1)(t−2) ≤ 0 ⟺ 1 ≤ t ≤ 2.',
};

const squareLogAnswerFigure = {
  points: [
    { label: '−√7', kind: 'filled' },
    { label: '−√5', kind: 'filled' },
    { label: '√5', kind: 'filled' },
    { label: '√7', kind: 'filled' },
  ],
  bands: [{ from: 0, to: 1 }, { from: 2, to: 3 }],
  axisLabel: 'x',
  caption: 'Ответ: [−√7; −√5] ∪ [√5; √7] (внутри ОДЗ (−3;3)).',
};

const squareLog: InequalityTask = {
  publicId: 'N15LOG2',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '[-√7;-√5]∪[√5;√7]',
  statement: `Решите неравенство $$\\log_2^2(9 - x^2) - 3\\log_2(9 - x^2) + 2 \\le 0.$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `Логарифм определён при положительном аргументе:`,
    `$$9 - x^2 > 0 \\iff x^2 < 9 \\iff -3 < x < 3.$$`,
    `**ОДЗ:** $x \\in (-3;\\ 3)$.`,
    `## Замена переменной`,
    `Обозначим $t = \\log_2(9 - x^2)$. Тогда $\\log_2^2(9 - x^2) = t^2$, и неравенство становится квадратным относительно $t$:`,
    `$$t^2 - 3t + 2 \\le 0.$$`,
    `## Решаем квадратное неравенство`,
    `Разложим трёхчлен на множители. По теореме Виета корни $t_1 = 1$ и $t_2 = 2$ (их сумма $3$, произведение $2$), поэтому`,
    `$$t^2 - 3t + 2 = (t - 1)(t - 2).$$`,
    `Неравенство $(t - 1)(t - 2) \\le 0$: парабола с ветвями вверх не превосходит нуля между корнями (включая их).`,
    numline(squareLogSignFigure),
    `$$1 \\le t \\le 2.$$`,
    `## Обратная замена`,
    `Возвращаемся к $x$, подставляя $t = \\log_2(9 - x^2)$:`,
    `$$1 \\le \\log_2(9 - x^2) \\le 2.$$`,
    `Запишем границы как логарифмы по основанию $2$: $1 = \\log_2 2$, $\\ 2 = \\log_2 4$. Тогда`,
    `$$\\log_2 2 \\le \\log_2(9 - x^2) \\le \\log_2 4.$$`,
    `Функция $\\log_2$ **возрастающая** ($2 > 1$), поэтому при переходе к аргументам знаки сохраняются:`,
    `$$2 \\le 9 - x^2 \\le 4.$$`,
    `## Двойное неравенство относительно $x$`,
    `Вычтем $9$ из всех трёх частей:`,
    `$$2 - 9 \\le -x^2 \\le 4 - 9 \\iff -7 \\le -x^2 \\le -5.$$`,
    `Умножим все части на $-1$ — знаки неравенств меняются на противоположные:`,
    `$$5 \\le x^2 \\le 7.$$`,
    `Неравенство $x^2 \\ge 5$ даёт $x \\le -\\sqrt5$ или $x \\ge \\sqrt5$; неравенство $x^2 \\le 7$ даёт $-\\sqrt7 \\le x \\le \\sqrt7$. Пересекаем:`,
    `$$x \\in [-\\sqrt7;\\ -\\sqrt5] \\cup [\\sqrt5;\\ \\sqrt7].$$`,
    numline(squareLogAnswerFigure),
    `Все эти значения лежат в ОДЗ $(-3;\\ 3)$, поскольку $\\sqrt7 \\approx 2{,}65 < 3$.`,
    `## Ответ`,
    `$$x \\in [-\\sqrt7;\\ -\\sqrt5] \\cup [\\sqrt5;\\ \\sqrt7].$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ПОКАЗАТЕЛЬНОЕ НЕРАВЕНСТВО · ДРОБИ С ЗАМЕНОЙ t = 3^x
// ─────────────────────────────────────────────────────────────────────────────

const expFractionSignFigure = {
  points: [
    { label: '−3', kind: 'open' },
    { label: '3', kind: 'open' },
    { label: '9', kind: 'filled' },
  ],
  signs: ['-', '+', '-', '+'],
  bands: [{ from: 0, to: 1 }, { from: 2, to: 3 }],
  axisLabel: 't',
  caption: 'Знаки (t−9)/((t+3)(t−3)); решение ≥ 0 — зелёные участки.',
};

const expFractionAnswerFigure = {
  points: [
    { label: '1', kind: 'open' },
    { label: '2', kind: 'filled' },
  ],
  bands: [{ from: -1, to: 0 }, { from: 1, to: 2 }],
  axisLabel: 'x',
  caption: 'После обратной замены t = 3^x (напомним, 3^x > 0).',
};

const expFraction: InequalityTask = {
  publicId: 'N15EXP1',
  topicSlug: 'ege-15-exponential',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '(-∞;1)∪[2;+∞)',
  statement: `Решите неравенство $$\\dfrac{2}{3^x + 3} \\ge \\dfrac{1}{3^x - 3}.$$`,
  referenceSolution: [
    `## Замена переменной`,
    `Показательная функция $3^x$ входит в оба знаменателя. Сделаем замену $t = 3^x$. Важно запомнить: $3^x > 0$ при любом $x$, поэтому $t > 0$ — это понадобится при обратной замене. Неравенство принимает вид`,
    `$$\\frac{2}{t + 3} \\ge \\frac{1}{t - 3}.$$`,
    `## Приводим к виду «дробь $\\ge 0$»`,
    `Умножать на знаменатели нельзя — их знак заранее неизвестен. Переносим всё в левую часть:`,
    `$$\\frac{2}{t + 3} - \\frac{1}{t - 3} \\ge 0.$$`,
    `Приводим к общему знаменателю $(t + 3)(t - 3)$:`,
    `$$\\frac{2(t - 3) - (t + 3)}{(t + 3)(t - 3)} \\ge 0.$$`,
    `Раскроем скобки в числителе: $2(t - 3) - (t + 3) = 2t - 6 - t - 3 = t - 9$. Получаем`,
    `$$\\frac{t - 9}{(t + 3)(t - 3)} \\ge 0.$$`,
    `## Метод интервалов`,
    `Нули числителя и знаменателя: $t = 9$ (закрашенная точка — неравенство нестрогое, дробь может равняться нулю), $t = -3$ и $t = 3$ (выколотые — в них знаменатель равен нулю). Определим знак дроби на каждом промежутке:`,
    `- $t < -3$: числитель $<0$, оба множителя знаменателя $<0$ (произведение $>0$) — дробь $<0$;\n- $-3 < t < 3$: числитель $<0$, знаменатель $(+)\\cdot(-)<0$ — дробь $>0$;\n- $3 < t < 9$: числитель $<0$, знаменатель $(+)\\cdot(+)>0$ — дробь $<0$;\n- $t > 9$: числитель $>0$, знаменатель $>0$ — дробь $>0$.`,
    numline(expFractionSignFigure),
    `Неравенству $\\ge 0$ отвечают промежутки $-3 < t < 3$ и $t \\ge 9$.`,
    `## Обратная замена (учитываем $t = 3^x > 0$)`,
    `**1)** $-3 < t < 3$. Неравенство $-3 < 3^x$ выполняется **всегда** (показательная функция положительна), поэтому остаётся только $3^x < 3$, то есть $3^x < 3^1$. Основание $3 > 1$, функция возрастает, значит $x < 1$.`,
    `**2)** $t \\ge 9$: $3^x \\ge 9 = 3^2$, откуда $x \\ge 2$.`,
    numline(expFractionAnswerFigure),
    `## Ответ`,
    `$$x \\in (-\\infty;\\ 1) \\cup [2;\\ +\\infty).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ПОКАЗАТЕЛЬНОЕ НЕРАВЕНСТВО · КВАДРАТНОЕ ОТНОСИТЕЛЬНО t = 2^x
// ─────────────────────────────────────────────────────────────────────────────

const expSquareSignFigure = {
  points: [
    { label: '1', kind: 'open' },
    { label: '4', kind: 'open' },
  ],
  signs: ['+', '-', '+'],
  bands: [{ from: -1, to: 0 }, { from: 1, to: 2 }],
  axisLabel: 't',
  caption: '(t−1)(t−4) > 0 при 0 < t < 1 и t > 4.',
};

const expSquareAnswerFigure = {
  points: [
    { label: '0', kind: 'open' },
    { label: '2', kind: 'open' },
  ],
  bands: [{ from: -1, to: 0 }, { from: 1, to: 2 }],
  axisLabel: 'x',
  caption: '2^x < 1 ⟹ x < 0;  2^x > 4 ⟹ x > 2.',
};

const expSquare: InequalityTask = {
  publicId: 'N15EXP2',
  topicSlug: 'ege-15-exponential',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '(-∞;0)∪(2;+∞)',
  statement: `Решите неравенство $$4^x - 5\\cdot 2^x + 4 > 0.$$`,
  referenceSolution: [
    `## Замена переменной`,
    `Заметим, что $4^x = (2^2)^x = (2^x)^2$. Сделаем замену $t = 2^x$, причём $t > 0$ (показательная функция положительна). Неравенство становится квадратным:`,
    `$$t^2 - 5t + 4 > 0.$$`,
    `## Решаем квадратное неравенство`,
    `Найдём корни трёхчлена. По теореме Виета $t_1 = 1$, $t_2 = 4$ (их сумма $5$, произведение $4$), поэтому $t^2 - 5t + 4 = (t - 1)(t - 4)$. Неравенство $(t - 1)(t - 4) > 0$: парабола с ветвями вверх положительна вне отрезка между корнями (точки выколотые — неравенство строгое):`,
    numline(expSquareSignFigure),
    `$$t < 1 \\quad \\text{или} \\quad t > 4.$$`,
    `С учётом условия $t > 0$ первый промежуток превращается в $0 < t < 1$.`,
    `## Обратная замена`,
    `**1)** $0 < 2^x < 1 = 2^0$. Основание $2 > 1$ (функция возрастает), значит $x < 0$.`,
    `**2)** $2^x > 4 = 2^2$, откуда $x > 2$.`,
    numline(expSquareAnswerFigure),
    `## Ответ`,
    `$$x \\in (-\\infty;\\ 0) \\cup (2;\\ +\\infty).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ПОКАЗАТЕЛЬНОЕ НЕРАВЕНСТВО · КВАДРАТНОЕ ОТНОСИТЕЛЬНО t = 5^x
// ─────────────────────────────────────────────────────────────────────────────

const expSquare2SignFigure = {
  points: [
    { label: '1', kind: 'filled' },
    { label: '5', kind: 'filled' },
  ],
  signs: ['+', '-', '+'],
  bands: [{ from: 0, to: 1 }],
  axisLabel: 't',
  caption: '(t−1)(t−5) ≤ 0 ⟺ 1 ≤ t ≤ 5.',
};

const expSquare2AnswerFigure = {
  points: [
    { label: '0', kind: 'filled' },
    { label: '1', kind: 'filled' },
  ],
  bands: [{ from: 0, to: 1 }],
  axisLabel: 'x',
  caption: '1 ≤ 5^x ≤ 5 ⟺ 0 ≤ x ≤ 1.',
};

const expSquare2: InequalityTask = {
  publicId: 'N15EXP3',
  topicSlug: 'ege-15-exponential',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '[0;1]',
  statement: `Решите неравенство $$25^x - 6\\cdot 5^x + 5 \\le 0.$$`,
  referenceSolution: [
    `## Замена переменной`,
    `Так как $25^x = (5^2)^x = (5^x)^2$, сделаем замену $t = 5^x$, причём $t > 0$. Неравенство принимает вид`,
    `$$t^2 - 6t + 5 \\le 0.$$`,
    `## Решаем квадратное неравенство`,
    `Корни трёхчлена по теореме Виета: $t_1 = 1$, $t_2 = 5$ (сумма $6$, произведение $5$). Тогда $t^2 - 6t + 5 = (t - 1)(t - 5)$. Неравенство $(t - 1)(t - 5) \\le 0$ выполняется между корнями (включая их):`,
    numline(expSquare2SignFigure),
    `$$1 \\le t \\le 5.$$`,
    `Условие $t > 0$ здесь выполнено автоматически.`,
    `## Обратная замена`,
    `$1 \\le 5^x \\le 5$, то есть $5^0 \\le 5^x \\le 5^1$. Основание $5 > 1$ (функция возрастает), поэтому`,
    `$$0 \\le x \\le 1.$$`,
    numline(expSquare2AnswerFigure),
    `## Ответ`,
    `$$x \\in [0;\\ 1].$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ЛОГАРИФМ ≤ ЧИСЛУ С ОДЗ (основание > 1)
// ─────────────────────────────────────────────────────────────────────────────

const logConstFigure = {
  points: [
    { label: '−1', kind: 'filled' },
    { label: '0', kind: 'open' },
    { label: '1', kind: 'open' },
    { label: '2', kind: 'filled' },
  ],
  bands: [{ from: 0, to: 1 }, { from: 2, to: 3 }],
  brackets: [{ from: 0, to: 3, label: 'x² − x ≤ 2' }],
  axisLabel: 'x',
  caption: 'Отрезок [−1; 2] даёт неравенство; ОДЗ (x²−x>0) убирает промежуток [0; 1].',
};

const logConst: InequalityTask = {
  publicId: 'N15LOG3',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '[-1;0)∪(1;2]',
  statement: `Решите неравенство $$\\log_2\\left(x^2 - x\\right) \\le 1.$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `Логарифм определён при положительном аргументе:`,
    `$$x^2 - x > 0 \\iff x(x - 1) > 0 \\iff x < 0 \\ \\text{или}\\ x > 1.$$`,
    `**ОДЗ:** $x \\in (-\\infty;\\ 0) \\cup (1;\\ +\\infty)$.`,
    `## Решаем неравенство`,
    `Запишем правую часть как логарифм по основанию $2$: $1 = \\log_2 2$. Неравенство принимает вид`,
    `$$\\log_2\\left(x^2 - x\\right) \\le \\log_2 2.$$`,
    `Основание $2 > 1$, функция $\\log_2$ **возрастающая**, поэтому при переходе к аргументам знак неравенства сохраняется:`,
    `$$x^2 - x \\le 2 \\iff x^2 - x - 2 \\le 0 \\iff (x - 2)(x + 1) \\le 0 \\iff -1 \\le x \\le 2.$$`,
    `## Пересечение с ОДЗ`,
    `Совместим полученный отрезок $[-1;\\ 2]$ с ОДЗ — нужно выбросить промежуток $[0;\\ 1]$, где логарифм не определён:`,
    numline(logConstFigure),
    `$$x \\in [-1;\\ 0) \\cup (1;\\ 2].$$`,
    `## Ответ`,
    `$$x \\in [-1;\\ 0) \\cup (1;\\ 2].$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ЛОГАРИФМ С ОСНОВАНИЕМ МЕНЬШЕ 1 (смена знака неравенства)
// ─────────────────────────────────────────────────────────────────────────────

const logDecreasingFigure = {
  points: [
    { label: '1/2', kind: 'open' },
    { label: '2', kind: 'filled' },
  ],
  bands: [{ from: 0, to: 1 }],
  axisLabel: 'x',
  caption: 'ОДЗ x > 1/2; убывающее основание ⟹ 2x − 1 ≤ 3, то есть x ≤ 2.',
};

const logDecreasing: InequalityTask = {
  publicId: 'N15LOG4',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '(1/2;2]',
  statement: `Решите неравенство $$\\log_{1/3}\\left(2x - 1\\right) \\ge -1.$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `Аргумент логарифма положителен: $2x - 1 > 0 \\iff x > \\dfrac{1}{2}$.`,
    `**ОДЗ:** $x > \\dfrac{1}{2}$.`,
    `## Решаем неравенство`,
    `Запишем число $-1$ как логарифм по основанию $\\dfrac{1}{3}$: поскольку $\\left(\\dfrac{1}{3}\\right)^{-1} = 3$, имеем $-1 = \\log_{1/3} 3$. Неравенство принимает вид`,
    `$$\\log_{1/3}(2x - 1) \\ge \\log_{1/3} 3.$$`,
    `Основание $\\dfrac{1}{3} < 1$, функция $\\log_{1/3}$ **убывающая**, поэтому при переходе к аргументам знак неравенства **меняется на противоположный**:`,
    `$$2x - 1 \\le 3 \\iff 2x \\le 4 \\iff x \\le 2.$$`,
    `## Пересечение с ОДЗ`,
    `Совместим условие $x \\le 2$ с ОДЗ $x > \\dfrac{1}{2}$:`,
    numline(logDecreasingFigure),
    `$$x \\in \\left(\\dfrac{1}{2};\\ 2\\right].$$`,
    `## Ответ`,
    `$$x \\in \\left(\\dfrac{1}{2};\\ 2\\right].$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ИРРАЦИОНАЛЬНОЕ НЕРАВЕНСТВО (равносильный переход, два случая)
// ─────────────────────────────────────────────────────────────────────────────

const irrationalFigure = {
  points: [
    { label: '−7', kind: 'filled' },
    { label: '−1', kind: 'filled' },
    { label: '2', kind: 'filled' },
  ],
  bands: [{ from: 0, to: 2 }],
  brackets: [
    { from: 1, to: 2, label: 'случай 2: x ≥ −1', row: 0 },
    { from: 0, to: 1, label: 'случай 1: x < −1', row: 1 },
  ],
  axisLabel: 'x',
  caption: 'Случай 1 даёт [−7; −1), случай 2 — [−1; 2]; объединение [−7; 2].',
};

const irrational: InequalityTask = {
  publicId: 'N15IRR1',
  topicSlug: 'ege-15-irrational',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '[-7;2]',
  statement: `Решите неравенство $$\\sqrt{x + 7} \\ge x + 1.$$`,
  referenceSolution: [
    `## Равносильный переход`,
    `Неравенство $\\sqrt{f} \\ge g$ равносильно **совокупности двух систем**: либо правая часть отрицательна (тогда неравенство верно всюду, где определён корень), либо обе части неотрицательны и можно возвести в квадрат:`,
    `$$\\sqrt{f} \\ge g \\iff \\left[\\begin{array}{l} \\begin{cases} g < 0, \\\\ f \\ge 0; \\end{cases} \\\\[2mm] \\begin{cases} g \\ge 0, \\\\ f \\ge g^2. \\end{cases} \\end{array}\\right.$$`,
    `Здесь $f = x + 7$, $g = x + 1$.`,
    `## Случай 1: $g < 0$`,
    `$$\\begin{cases} x + 1 < 0, \\\\ x + 7 \\ge 0 \\end{cases} \\iff \\begin{cases} x < -1, \\\\ x \\ge -7 \\end{cases} \\iff -7 \\le x < -1.$$`,
    `## Случай 2: $g \\ge 0$`,
    `$$\\begin{cases} x + 1 \\ge 0, \\\\ x + 7 \\ge (x + 1)^2. \\end{cases}$$`,
    `Второе неравенство раскроем: $x + 7 \\ge x^2 + 2x + 1 \\iff 0 \\ge x^2 + x - 6 \\iff x^2 + x - 6 \\le 0$. Разложим на множители: $(x + 3)(x - 2) \\le 0 \\iff -3 \\le x \\le 2$. Вместе с условием $x \\ge -1$ получаем $-1 \\le x \\le 2$.`,
    `## Объединение случаев`,
    `Ответ — объединение решений двух случаев:`,
    numline(irrationalFigure),
    `$$[-7;\\ -1) \\cup [-1;\\ 2] = [-7;\\ 2].$$`,
    `## Ответ`,
    `$$x \\in [-7;\\ 2].$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ЛОГАРИФМ + ОБОБЩЁННЫЙ МЕТОД ИНТЕРВАЛОВ (кратный корень)
// ─────────────────────────────────────────────────────────────────────────────

const multiRootSignFigure = {
  points: [
    { label: '0', kind: 'filled' },
    { label: '2', kind: 'filled' },
    { label: '3', kind: 'open' },
  ],
  signs: ['+', '-', '-', '+'],
  bands: [{ from: -1, to: 0 }, { from: 2, to: 3 }],
  axisLabel: 'a',
  caption: 'Корень a=2 чётной кратности: знак не меняется, а точка изолирована.',
};

const multiRootAnswerFigure = {
  points: [
    { label: '0', kind: 'open' },
    { label: '1', kind: 'filled' },
    { label: '9', kind: 'filled' },
    { label: '27', kind: 'open' },
  ],
  bands: [{ from: 0, to: 1 }, { from: 3, to: 4 }],
  axisLabel: 'x',
  caption: 'Ответ (0;1] ∪ {9} ∪ (27;+∞): точка x=9 изолированная.',
};

const logMultiRoot: InequalityTask = {
  publicId: 'N15LOG5',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '(0;1]∪{9}∪(27;+∞)',
  statement: `Решите неравенство $$\\dfrac{\\log_3 x\\,\\bigl(\\log_3 x - 2\\bigr)^2}{\\log_3 x - 3} \\ge 0.$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `Логарифм $\\log_3 x$ определён при $x > 0$. Знаменатель не равен нулю: $\\log_3 x - 3 \\ne 0 \\Rightarrow \\log_3 x \\ne 3 \\Rightarrow x \\ne 27$.`,
    `## Замена переменной`,
    `Пусть $a = \\log_3 x$. При $x > 0$ переменная $a$ принимает любые действительные значения. Неравенство принимает вид`,
    `$$\\frac{a\\,(a - 2)^2}{a - 3} \\ge 0.$$`,
    `## Обобщённый метод интервалов`,
    `Нули выражения: $a = 0$ (кратность $1$), $a = 2$ (кратность $2$ — **чётная**), $a = 3$ (нуль знаменателя). Точки $a = 0$ и $a = 2$ закрашиваем (в них дробь равна нулю, а неравенство нестрогое), точку $a = 3$ выкалываем.`,
    `Ключевой момент: множитель $(a - 2)^2 \\ge 0$ **не меняет знак**, поэтому при переходе через $a = 2$ знак всей дроби **сохраняется**:`,
    `- $a < 0$: $\\dfrac{(-)\\cdot(+)}{(-)} = +$;\n- $0 < a < 2$: $\\dfrac{(+)\\cdot(+)}{(-)} = -$;\n- $2 < a < 3$: $\\dfrac{(+)\\cdot(+)}{(-)} = -$ (знак не изменился!);\n- $a > 3$: $\\dfrac{(+)\\cdot(+)}{(+)} = +$.`,
    numline(multiRootSignFigure),
    `Неравенству $\\ge 0$ удовлетворяют: $a \\le 0$, отдельная (изолированная) точка $a = 2$, где дробь равна нулю, и $a > 3$.`,
    `## Обратная замена`,
    `$a = \\log_3 x$, функция возрастает ($3 > 1$):`,
    `- $a \\le 0$: $\\log_3 x \\le 0 = \\log_3 1 \\Rightarrow 0 < x \\le 1$;\n- $a = 2$: $\\log_3 x = 2 \\Rightarrow x = 9$;\n- $a > 3$: $\\log_3 x > 3 = \\log_3 27 \\Rightarrow x > 27$.`,
    numline(multiRootAnswerFigure),
    `## Ответ`,
    `$$x \\in (0;\\ 1] \\cup \\{9\\} \\cup (27;\\ +\\infty).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · РАЦИОНАЛЬНОЕ НЕРАВЕНСТВО С КРАТНЫМ КОРНЕМ
// ─────────────────────────────────────────────────────────────────────────────

const ratMultiRootFigure = {
  points: [
    { label: '−3', kind: 'filled' },
    { label: '1', kind: 'filled' },
    { label: '4', kind: 'open' },
  ],
  signs: ['+', '-', '-', '+'],
  bands: [{ from: 0, to: 2 }],
  axisLabel: 'x',
  caption: 'Корень x=1 чётной кратности: знак не меняется; x=1 входит в решение.',
};

const rationalMultiRoot: InequalityTask = {
  publicId: 'N15RAT1',
  topicSlug: 'ege-15-rational',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: EXAMCLASS,
  correctAnswer: '[-3;4)',
  statement: `Решите неравенство $$\\dfrac{(x + 3)(x - 1)^2}{x - 4} \\le 0.$$`,
  referenceSolution: [
    `## Метод интервалов с учётом кратности`,
    `Нули числителя и знаменателя: $x = -3$ (кратность $1$), $x = 1$ (кратность $2$), $x = 4$ (нуль знаменателя). Точки $x = -3$ и $x = 1$ закрашиваем (в них выражение равно нулю, неравенство нестрогое), точку $x = 4$ выкалываем.`,
    `Множитель $(x - 1)^2 \\ge 0$ на знак не влияет (кроме самой точки $x = 1$, где всё выражение равно нулю). Поэтому знак дроби определяется множителями $\\dfrac{x + 3}{x - 4}$, и при переходе через $x = 1$ знак **не меняется**:`,
    `- $x < -3$: $\\dfrac{(-)\\cdot(+)}{(-)} = +$;\n- $-3 < x < 1$: $\\dfrac{(+)\\cdot(+)}{(-)} = -$;\n- $1 < x < 4$: $\\dfrac{(+)\\cdot(+)}{(-)} = -$ (знак сохранился);\n- $x > 4$: $\\dfrac{(+)\\cdot(+)}{(+)} = +$.`,
    numline(ratMultiRootFigure),
    `Неравенству $\\le 0$ отвечает промежуток, где выражение отрицательно или равно нулю. Точки $x = -3$ и $x = 1$ входят (в них ноль), точка $x = 4$ исключается:`,
    `$$x \\in [-3;\\ 4).$$`,
    `## Ответ`,
    `$$x \\in [-3;\\ 4).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · СИСТЕМА НЕРАВЕНСТВ (логарифмическое + квадратное)
// ─────────────────────────────────────────────────────────────────────────────

const system1Figure = {
  points: [
    { label: '1', kind: 'open' },
    { label: '2', kind: 'open' },
    { label: '5', kind: 'open' },
  ],
  bands: [{ from: 1, to: 2 }],
  brackets: [
    { from: 1, to: 2, label: 'x² − 7x + 10 < 0', row: 0 },
    { from: 0, to: 2, label: 'log₀.₅(x−1) ≥ −2', row: 1 },
  ],
  axisLabel: 'x',
  caption: 'Зелёный отрезок — пересечение решений обоих неравенств: (2; 5).',
};

const system1: InequalityTask = {
  publicId: 'N15SYS1',
  topicSlug: 'ege-15-systems',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: FIPI,
  correctAnswer: '(2;5)',
  statement: `Решите систему неравенств $$\\begin{cases} \\log_{0{,}5}(x - 1) \\ge -2, \\\\ x^2 - 7x + 10 < 0. \\end{cases}$$`,
  referenceSolution: [
    `## Первое неравенство`,
    `$\\log_{0{,}5}(x - 1) \\ge -2$. **ОДЗ:** $x - 1 > 0 \\Rightarrow x > 1$.`,
    `Запишем $-2$ как логарифм: $-2 = \\log_{0{,}5} 4$, поскольку $0{,}5^{-2} = 4$. Тогда $\\log_{0{,}5}(x - 1) \\ge \\log_{0{,}5} 4$. Основание $0{,}5 < 1$ — функция **убывает**, поэтому знак неравенства **меняется на противоположный**:`,
    `$$x - 1 \\le 4 \\iff x \\le 5.$$`,
    `С учётом ОДЗ решение первого неравенства: $1 < x \\le 5$.`,
    `## Второе неравенство`,
    `$$x^2 - 7x + 10 < 0 \\iff (x - 2)(x - 5) < 0 \\iff 2 < x < 5.$$`,
    `## Пересечение`,
    `Система выполнена там, где верны **оба** неравенства одновременно — на пересечении промежутков $(1;\\ 5]$ и $(2;\\ 5)$:`,
    numline(system1Figure),
    `$$x \\in (2;\\ 5).$$`,
    `## Ответ`,
    `$$x \\in (2;\\ 5).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · СИСТЕМА НЕРАВЕНСТВ (показательное + рациональное)
// ─────────────────────────────────────────────────────────────────────────────

const system2Figure = {
  points: [
    { label: '−4', kind: 'filled' },
    { label: '−1', kind: 'filled' },
    { label: '1', kind: 'open' },
    { label: '4', kind: 'filled' },
  ],
  bands: [{ from: 2, to: 3 }],
  brackets: [
    { from: 1, to: 3, label: '2^(x²−3x) ≤ 16', row: 0 },
    { from: -1, to: 0, label: 'дробь ≥ 0', row: 1 },
    { from: 2, to: 4, label: '', row: 1 },
  ],
  axisLabel: 'x',
  caption: 'Пересечение [−1; 4] и (x ≤ −4 ∪ x > 1) даёт (1; 4].',
};

const system2: InequalityTask = {
  publicId: 'N15SYS2',
  topicSlug: 'ege-15-systems',
  examPart: ExamPart.SECOND,
  difficulty: 2,
  source: EXAMCLASS,
  correctAnswer: '(1;4]',
  statement: `Решите систему неравенств $$\\begin{cases} 2^{x^2 - 3x} \\le 16, \\\\ \\dfrac{x + 4}{x - 1} \\ge 0. \\end{cases}$$`,
  referenceSolution: [
    `## Первое неравенство`,
    `$2^{x^2 - 3x} \\le 16 = 2^4$. Основание $2 > 1$ (функция возрастает), поэтому знак сохраняется при переходе к показателям:`,
    `$$x^2 - 3x \\le 4 \\iff x^2 - 3x - 4 \\le 0 \\iff (x - 4)(x + 1) \\le 0 \\iff -1 \\le x \\le 4.$$`,
    `## Второе неравенство`,
    `$\\dfrac{x + 4}{x - 1} \\ge 0$. Методом интервалов (нуль числителя $x = -4$ закрашен, нуль знаменателя $x = 1$ выколот):`,
    `$$x \\le -4 \\quad \\text{или} \\quad x > 1.$$`,
    `## Пересечение`,
    `Пересекаем отрезок $[-1;\\ 4]$ с множеством $(-\\infty;\\ -4] \\cup (1;\\ +\\infty)$:`,
    numline(system2Figure),
    `Общей частью служит промежуток $(1;\\ 4]$.`,
    `## Ответ`,
    `$$x \\in (1;\\ 4].$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · ЛОГАРИФМ С ПЕРЕМЕННЫМ ОСНОВАНИЕМ (разбор по случаям)
// ─────────────────────────────────────────────────────────────────────────────

const VARBASE = 'ЕГЭ, профиль · логарифм с переменным основанием';
const RATIONALIZE = 'ЕГЭ, профиль · метод рационализации';

const varBase1Figure = {
  points: [
    { label: '1', kind: 'open' },
    { label: '2', kind: 'open' },
    { label: '3', kind: 'filled' },
  ],
  bands: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
  brackets: [
    { from: 1, to: 2, label: 'основание x−1 > 1', row: 0 },
    { from: 0, to: 1, label: '0 < x−1 < 1', row: 1 },
  ],
  axisLabel: 'x',
  caption: 'Случай 0<x−1<1 даёт (1;2); случай x−1>1 даёт (2;3].',
};

const varBase1: InequalityTask = {
  publicId: 'N15LOG6',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: VARBASE,
  correctAnswer: '(1;2)∪(2;3]',
  statement: `Решите неравенство $$\\log_{x-1}\\left(x^2 - 5x + 7\\right) \\le 0.$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `У логарифма переменное основание, поэтому ОДЗ состоит из трёх условий:`,
    `- основание положительно и не равно единице: $x - 1 > 0$ и $x - 1 \\ne 1$, то есть $x > 1$ и $x \\ne 2$;\n- аргумент положителен: $x^2 - 5x + 7 > 0$. Его дискриминант $25 - 28 = -3 < 0$, а ветви параболы направлены вверх — значит, выражение **положительно при всех** $x$.`,
    `**ОДЗ:** $x > 1,\\ x \\ne 2$.`,
    `## Разбор по случаям`,
    `Запишем правую часть как логарифм: $0 = \\log_{x-1} 1$. Неравенство принимает вид $\\log_{x-1}(x^2 - 5x + 7) \\le \\log_{x-1} 1$. Направление знака при переходе к аргументам зависит от того, больше или меньше единицы основание.`,
    `**Случай 1: $0 < x - 1 < 1$**, то есть $1 < x < 2$. Основание меньше единицы — функция убывает, знак неравенства **меняется на противоположный**:`,
    `$$x^2 - 5x + 7 \\ge 1 \\iff x^2 - 5x + 6 \\ge 0 \\iff (x - 2)(x - 3) \\ge 0 \\iff x \\le 2\\ \\text{или}\\ x \\ge 3.$$`,
    `Пересекаем с условием случая $1 < x < 2$ — подходит весь промежуток $(1;\\ 2)$.`,
    `**Случай 2: $x - 1 > 1$**, то есть $x > 2$. Основание больше единицы — функция возрастает, знак **сохраняется**:`,
    `$$x^2 - 5x + 7 \\le 1 \\iff x^2 - 5x + 6 \\le 0 \\iff (x - 2)(x - 3) \\le 0 \\iff 2 \\le x \\le 3.$$`,
    `Пересекаем с условием случая $x > 2$ — получаем $(2;\\ 3]$.`,
    `## Объединение случаев`,
    numline(varBase1Figure),
    `$$x \\in (1;\\ 2) \\cup (2;\\ 3].$$`,
    `## Ответ`,
    `$$x \\in (1;\\ 2) \\cup (2;\\ 3].$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · СРАВНЕНИЕ ДВУХ ЛОГАРИФМОВ С ПЕРЕМЕННЫМ ОСНОВАНИЕМ
// ─────────────────────────────────────────────────────────────────────────────

const varBase2Figure = {
  points: [
    { label: '5/2', kind: 'open' },
    { label: '3', kind: 'open' },
    { label: '4', kind: 'filled' },
  ],
  bands: [{ from: 0, to: 1 }, { from: 2, to: 3 }],
  brackets: [
    { from: 2, to: 3, label: 'основание > 1', row: 0 },
    { from: 0, to: 1, label: '0 < основание < 1', row: 1 },
  ],
  axisLabel: 'x',
  caption: '0<x−2<1 (с ОДЗ x>5/2) даёт (5/2;3); x−2>1 даёт [4;+∞).',
};

const varBase2: InequalityTask = {
  publicId: 'N15LOG7',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: VARBASE,
  correctAnswer: '(5/2;3)∪[4;+∞)',
  statement: `Решите неравенство $$\\log_{x-2}(2x - 5) \\ge \\log_{x-2}(x - 1).$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `- основание: $x - 2 > 0$ и $x - 2 \\ne 1$, то есть $x > 2$ и $x \\ne 3$;\n- аргументы: $2x - 5 > 0 \\Rightarrow x > 2{,}5$ и $x - 1 > 0 \\Rightarrow x > 1$.`,
    `Все условия вместе дают **ОДЗ:** $x > 2{,}5,\\ x \\ne 3$.`,
    `## Разбор по случаям`,
    `Логарифмы имеют одинаковое переменное основание $x - 2$. Сравнение логарифмов равносильно сравнению аргументов, но направление зависит от основания.`,
    `**Случай 1: $0 < x - 2 < 1$** (основание меньше единицы), то есть $2 < x < 3$; с учётом ОДЗ — $2{,}5 < x < 3$. Функция убывает, знак неравенства **меняется**:`,
    `$$2x - 5 \\le x - 1 \\iff x \\le 4.$$`,
    `Это выполнено на всём промежутке $(2{,}5;\\ 3)$ — он целиком подходит.`,
    `**Случай 2: $x - 2 > 1$** (основание больше единицы), то есть $x > 3$. Функция возрастает, знак **сохраняется**:`,
    `$$2x - 5 \\ge x - 1 \\iff x \\ge 4.$$`,
    `Пересекаем с $x > 3$ — получаем $[4;\\ +\\infty)$.`,
    `## Объединение случаев`,
    numline(varBase2Figure),
    `$$x \\in \\left(\\frac{5}{2};\\ 3\\right) \\cup [4;\\ +\\infty).$$`,
    `## Ответ`,
    `$$x \\in \\left(\\frac{5}{2};\\ 3\\right) \\cup [4;\\ +\\infty).$$`,
  ].join('\n\n'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ЗАДАЧА 15 · МЕТОД РАЦИОНАЛИЗАЦИИ (логарифмы в числителе и знаменателе)
// ─────────────────────────────────────────────────────────────────────────────

const rationalizeFigure = {
  points: [
    { label: '1', kind: 'open' },
    { label: '2', kind: 'open' },
    { label: '3', kind: 'filled' },
  ],
  signs: [null, '+', '-', '+'],
  bands: [{ from: 0, to: 1 }, { from: 2, to: 3 }],
  axisLabel: 'x',
  caption: 'Знаки (x−3)(x−1)/(x−2) на ОДЗ x>1, x≠2.',
};

const rationalize: InequalityTask = {
  publicId: 'N15LOG8',
  topicSlug: 'ege-15-logarithmic',
  examPart: ExamPart.SECOND,
  difficulty: 3,
  source: RATIONALIZE,
  correctAnswer: '(1;2)∪[3;+∞)',
  statement: `Решите неравенство $$\\dfrac{\\lg\\left(x^2 - 4x + 4\\right)}{\\lg(x - 1)} \\ge 0.$$`,
  referenceSolution: [
    `## Область допустимых значений`,
    `Заметим, что $x^2 - 4x + 4 = (x - 2)^2$.`,
    `- аргумент числителя: $(x - 2)^2 > 0 \\Rightarrow x \\ne 2$;\n- аргумент знаменателя: $x - 1 > 0 \\Rightarrow x > 1$;\n- знаменатель дроби не равен нулю: $\\lg(x - 1) \\ne 0 \\Rightarrow x - 1 \\ne 1 \\Rightarrow x \\ne 2$.`,
    `**ОДЗ:** $x > 1,\\ x \\ne 2$.`,
    `## Метод рационализации`,
    `Основание десятичного логарифма равно $10 > 1$, поэтому знак $\\lg t$ совпадает со знаком $(t - 1)$:`,
    `$$\\lg t > 0 \\iff t > 1, \\qquad \\lg t < 0 \\iff 0 < t < 1.$$`,
    `Значит, дробь $\\dfrac{\\lg A}{\\lg B}$ имеет тот же знак, что и $\\dfrac{A - 1}{B - 1}$ — это и есть **рационализация** (замена логарифмов на разности с сохранением знака). Здесь $A = (x - 2)^2$, $B = x - 1$, поэтому неравенство равносильно`,
    `$$\\frac{(x - 2)^2 - 1}{(x - 1) - 1} \\ge 0.$$`,
    `Разложим числитель по формуле разности квадратов: $(x - 2)^2 - 1 = (x - 2 - 1)(x - 2 + 1) = (x - 3)(x - 1)$. Получаем`,
    `$$\\frac{(x - 3)(x - 1)}{x - 2} \\ge 0.$$`,
    `## Метод интервалов на ОДЗ`,
    `Решаем на ОДЗ $x > 1,\\ x \\ne 2$. Нули: $x = 1$ и $x = 3$ (числитель, закрашены), $x = 2$ (знаменатель, выколот). Расставим знаки:`,
    numline(rationalizeFigure),
    `Неравенству $\\ge 0$ на ОДЗ отвечают промежутки $(1;\\ 2)$ и $[3;\\ +\\infty)$ (точка $x = 3$ входит — там числитель равен нулю; точка $x = 2$ исключена; левее $x = 1$ значений нет по ОДЗ).`,
    `## Ответ`,
    `$$x \\in (1;\\ 2) \\cup [3;\\ +\\infty).$$`,
  ].join('\n\n'),
};

const inequalityTasks: InequalityTask[] = [
  fractionalLog,
  squareLog,
  expFraction,
  expSquare,
  expSquare2,
  logConst,
  logDecreasing,
  irrational,
  logMultiRoot,
  rationalMultiRoot,
  system1,
  system2,
  varBase1,
  varBase2,
  rationalize,
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

  for (const task of inequalityTasks) {
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

  console.log(`\n✓ Добавлено ${added} задач (задание 15, неравенства)`);
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
