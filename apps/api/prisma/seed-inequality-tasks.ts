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

const inequalityTasks: InequalityTask[] = [
  fractionalLog,
  squareLog,
  expFraction,
  expSquare,
  expSquare2,
  logConst,
  logDecreasing,
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
