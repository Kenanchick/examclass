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

const inequalityTasks: InequalityTask[] = [fractionalLog, squareLog];

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
