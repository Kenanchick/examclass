import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { ExamPart, PrismaClient, TaskStatus, TopicStatus } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const newSubtopics = [
  {
    parentSlug: 'ege-01-planimetry',
    slug: 'ege-01-inscribed-circle',
    name: 'Вписанная окружность',
    sortOrder: 5,
  },
];

const firstPartTasks = [
  // ========== ГРУППА 1: Задача 1 — трапеция, описанная около окружности ==========
  {
    publicId: 'R4T8QW',
    topicSlug: 'ege-01-inscribed-circle',
    statement: `Периметр прямоугольной трапеции, описанной около окружности, равен $163$, её большая боковая сторона равна $49$. Найдите радиус окружности.

![Чертёж задачи](/tasks/trapezoid-circle.svg)

**Аналоги:** [N7B2XK](/tasks/N7B2XK) · [M9D5LH](/tasks/M9D5LH)`,
    correctAnswer: '16,25',
    referenceSolution: `**Решение**

1) В четырёхугольник можно вписать окружность тогда и только тогда, когда суммы противоположных сторон равны. Значит, сумма оснований трапеции равна сумме боковых сторон и составляет половину периметра:

$$\\dfrac{163}{2} = 81{,}5$$

2) Меньшая боковая сторона равна $81{,}5 - 49 = 32{,}5$.

3) Поскольку трапеция прямоугольная, меньшая боковая сторона — это высота трапеции, а она равна диаметру вписанной окружности. Тогда радиус:

$$r = \\dfrac{32{,}5}{2} = 16{,}25$$

**Ответ:** $16{,}25$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'N7B2XK',
    topicSlug: 'ege-01-inscribed-circle',
    statement: `Боковые стороны трапеции, описанной около окружности, равны $15$ и $22$. Найдите среднюю линию трапеции.

![Чертёж задачи](/tasks/trapezoid-circle.svg)

**Аналоги:** [R4T8QW](/tasks/R4T8QW) · [M9D5LH](/tasks/M9D5LH)`,
    correctAnswer: '18,5',
    referenceSolution: `**Решение**

1) В четырёхугольник можно вписать окружность тогда и только тогда, когда суммы противоположных сторон равны, то есть сумма оснований равна сумме боковых сторон:

$$15 + 22 = 37$$

2) Средняя линия трапеции равна полусумме оснований:

$$\\dfrac{37}{2} = 18{,}5$$

**Ответ:** $18{,}5$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'M9D5LH',
    topicSlug: 'ege-01-inscribed-circle',
    statement: `Периметр прямоугольной трапеции, описанной около окружности, равен $120$, её большая боковая сторона равна $35$. Найдите радиус окружности.

![Чертёж задачи](/tasks/trapezoid-circle.svg)

**Аналоги:** [R4T8QW](/tasks/R4T8QW) · [N7B2XK](/tasks/N7B2XK)`,
    correctAnswer: '12,5',
    referenceSolution: `**Решение**

1) В описанном четырёхугольнике суммы противоположных сторон равны, поэтому сумма боковых сторон составляет половину периметра:

$$\\dfrac{120}{2} = 60$$

2) Меньшая боковая сторона равна $60 - 35 = 25$.

3) В прямоугольной трапеции меньшая боковая сторона — это высота, она равна диаметру окружности. Тогда радиус:

$$r = \\dfrac{25}{2} = 12{,}5$$

**Ответ:** $12{,}5$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 2: Задача 4 — классическая вероятность ==========
  {
    publicId: 'J3F6VP',
    topicSlug: 'ege-04-classical-definition',
    statement: `В коробке лежат $9$ белых и $6$ чёрных шаров. Наугад выбирают один шар. Найдите вероятность того, что он окажется белым.

**Аналоги:** [K8H2ZN](/tasks/K8H2ZN) · [L5G9QR](/tasks/L5G9QR)`,
    correctAnswer: '0,6',
    referenceSolution: `**Решение**

Всего шаров в коробке:

$$9 + 6 = 15$$

Благоприятных исходов (белый шар) — $9$. Вероятность:

$$P = \\dfrac{9}{15} = 0{,}6$$

**Ответ:** $0{,}6$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'K8H2ZN',
    topicSlug: 'ege-04-classical-definition',
    statement: `В вазе стоят $12$ красных и $8$ синих шаров. Наугад выбирают один шар. Найдите вероятность того, что он окажется синим.

**Аналоги:** [J3F6VP](/tasks/J3F6VP) · [L5G9QR](/tasks/L5G9QR)`,
    correctAnswer: '0,4',
    referenceSolution: `**Решение**

Всего шаров:

$$12 + 8 = 20$$

Благоприятных исходов (синий шар) — $8$. Вероятность:

$$P = \\dfrac{8}{20} = 0{,}4$$

**Ответ:** $0{,}4$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'L5G9QR',
    topicSlug: 'ege-04-classical-definition',
    statement: `В корзине лежат $7$ зелёных и $3$ жёлтых мяча. Наугад выбирают один мяч. Найдите вероятность того, что он окажется жёлтым.

**Аналоги:** [J3F6VP](/tasks/J3F6VP) · [K8H2ZN](/tasks/K8H2ZN)`,
    correctAnswer: '0,3',
    referenceSolution: `**Решение**

Всего мячей:

$$7 + 3 = 10$$

Благоприятных исходов (жёлтый мяч) — $3$. Вероятность:

$$P = \\dfrac{3}{10} = 0{,}3$$

**Ответ:** $0{,}3$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 3: Задача 6 — показательные уравнения ==========
  {
    publicId: 'P2V7XC',
    topicSlug: 'ege-06-exponential',
    statement: `Решите уравнение: $5^{x-3} = 125$.

**Аналоги:** [Q6W1BD](/tasks/Q6W1BD) · [R9Y4TF](/tasks/R9Y4TF)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

Представим правую часть как степень с основанием $5$:

$$125 = 5^3$$

Уравнение принимает вид:

$$5^{x-3} = 5^3$$

Основания равны, приравниваем показатели:

$$x - 3 = 3$$

$$x = 6$$

**Ответ:** $6$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'Q6W1BD',
    topicSlug: 'ege-06-exponential',
    statement: `Решите уравнение: $2^{x+4} = 32$.

**Аналоги:** [P2V7XC](/tasks/P2V7XC) · [R9Y4TF](/tasks/R9Y4TF)`,
    correctAnswer: '1',
    referenceSolution: `**Решение**

Представим правую часть как степень с основанием $2$:

$$32 = 2^5$$

Уравнение принимает вид:

$$2^{x+4} = 2^5$$

Приравниваем показатели:

$$x + 4 = 5$$

$$x = 1$$

**Ответ:** $1$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'R9Y4TF',
    topicSlug: 'ege-06-exponential',
    statement: `Решите уравнение: $4^{x-2} = 64$.

**Аналоги:** [P2V7XC](/tasks/P2V7XC) · [Q6W1BD](/tasks/Q6W1BD)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Представим правую часть как степень с основанием $4$:

$$64 = 4^3$$

Уравнение принимает вид:

$$4^{x-2} = 4^3$$

Приравниваем показатели:

$$x - 2 = 3$$

$$x = 5$$

**Ответ:** $5$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 4: Задача 11 — гипербола (с клетками) ==========
  {
    publicId: 'G1K8ME',
    topicSlug: 'ege-11-hyperbolas',
    statement: `На рисунке изображён график функции $f(x) = \\dfrac{k}{x} + a$. Найдите значение $x$, при котором значение функции равно $2{,}2$.

![График функции](/tasks/hyperbola-1.svg)

**Аналоги:** [G4N2PS](/tasks/G4N2PS) · [G7R5TV](/tasks/G7R5TV)`,
    correctAnswer: '-15',
    referenceSolution: `**Решение**

По графику видно, что функция имеет горизонтальную асимптоту $y = 2$, значит, $a = 2$.

График $f(x) = \\dfrac{k}{x} + 2$ проходит через точку $(-3; 3)$. Подставим:

$$3 = -\\dfrac{k}{3} + 2$$

$$1 = -\\dfrac{k}{3}$$

$$k = -3$$

Получим $f(x) = -\\dfrac{3}{x} + 2$. Тогда:

$$-\\dfrac{3}{x} + 2 = 2{,}2$$

$$-\\dfrac{3}{x} = 0{,}2$$

$$x = -15$$

**Ответ:** $-15$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'G4N2PS',
    topicSlug: 'ege-11-hyperbolas',
    statement: `На рисунке изображён график функции $f(x) = \\dfrac{k}{x} + a$. Найдите значение $x$, при котором значение функции равно $1{,}5$.

![График функции](/tasks/hyperbola-2.svg)

**Аналоги:** [G1K8ME](/tasks/G1K8ME) · [G7R5TV](/tasks/G7R5TV)`,
    correctAnswer: '8',
    referenceSolution: `**Решение**

По графику видно, что горизонтальная асимптота — прямая $y = 1$, значит, $a = 1$.

График $f(x) = \\dfrac{k}{x} + 1$ проходит через точку $(2; 3)$. Подставим:

$$3 = \\dfrac{k}{2} + 1$$

$$\\dfrac{k}{2} = 2$$

$$k = 4$$

Получим $f(x) = \\dfrac{4}{x} + 1$. Тогда:

$$\\dfrac{4}{x} + 1 = 1{,}5$$

$$\\dfrac{4}{x} = 0{,}5$$

$$x = 8$$

**Ответ:** $8$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'G7R5TV',
    topicSlug: 'ege-11-hyperbolas',
    statement: `На рисунке изображён график функции $f(x) = \\dfrac{k}{x} + a$. Найдите значение $x$, при котором значение функции равно $0{,}5$.

![График функции](/tasks/hyperbola-3.svg)

**Аналоги:** [G1K8ME](/tasks/G1K8ME) · [G4N2PS](/tasks/G4N2PS)`,
    correctAnswer: '-2',
    referenceSolution: `**Решение**

По графику видно, что горизонтальная асимптота — прямая $y = -1$, значит, $a = -1$.

График $f(x) = \\dfrac{k}{x} - 1$ проходит через точку $(-1; 2)$. Подставим:

$$2 = \\dfrac{k}{-1} - 1$$

$$3 = -k$$

$$k = -3$$

Получим $f(x) = -\\dfrac{3}{x} - 1$. Тогда:

$$-\\dfrac{3}{x} - 1 = 0{,}5$$

$$-\\dfrac{3}{x} = 1{,}5$$

$$x = -2$$

**Ответ:** $-2$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 5: Задача 12 — наибольшее значение с тангенсом ==========
  {
    publicId: 'X2C9UJ',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наибольшее значение функции $y = 16\\,\\mathrm{tg}\\,x - 16x + 4\\pi - 5$ на отрезке $\\left[-\\dfrac{\\pi}{4}; \\dfrac{\\pi}{4}\\right]$.

**Аналоги:** [X5F1GK](/tasks/X5F1GK) · [X8H3NM](/tasks/X8H3NM)`,
    correctAnswer: '11',
    referenceSolution: `**Решение**

Функция $y$ определена при $\\cos x \\neq 0$, то есть $x \\neq \\dfrac{\\pi}{2} + \\pi k$, $k \\in \\mathbb{Z}$. Отрезок $\\left[-\\dfrac{\\pi}{4}; \\dfrac{\\pi}{4}\\right]$ входит в область определения.

Найдём производную:

$$y' = \\dfrac{16}{\\cos^2 x} - 16 = 16\\left(\\dfrac{1}{\\cos^2 x} - 1\\right) = 16\\,\\mathrm{tg}^2\\,x \\geq 0$$

Производная неотрицательна на всём отрезке, значит, функция возрастает. Следовательно, наибольшее значение достигается в правом конце отрезка:

$$y\\left(\\dfrac{\\pi}{4}\\right) = 16\\,\\mathrm{tg}\\,\\dfrac{\\pi}{4} - 16 \\cdot \\dfrac{\\pi}{4} + 4\\pi - 5 = 16 - 4\\pi + 4\\pi - 5 = 11$$

**Ответ:** $11$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'X5F1GK',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наибольшее значение функции $y = 8\\,\\mathrm{tg}\\,x - 8x + 2\\pi - 3$ на отрезке $\\left[-\\dfrac{\\pi}{4}; \\dfrac{\\pi}{4}\\right]$.

**Аналоги:** [X2C9UJ](/tasks/X2C9UJ) · [X8H3NM](/tasks/X8H3NM)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Функция определена на отрезке $\\left[-\\dfrac{\\pi}{4}; \\dfrac{\\pi}{4}\\right]$, так как на нём $\\cos x \\neq 0$.

Найдём производную:

$$y' = \\dfrac{8}{\\cos^2 x} - 8 = 8\\left(\\dfrac{1}{\\cos^2 x} - 1\\right) = 8\\,\\mathrm{tg}^2\\,x \\geq 0$$

Функция возрастает на всём отрезке, поэтому наибольшее значение — в правом конце:

$$y\\left(\\dfrac{\\pi}{4}\\right) = 8\\,\\mathrm{tg}\\,\\dfrac{\\pi}{4} - 8 \\cdot \\dfrac{\\pi}{4} + 2\\pi - 3 = 8 - 2\\pi + 2\\pi - 3 = 5$$

**Ответ:** $5$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'X8H3NM',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наибольшее значение функции $y = 4\\,\\mathrm{tg}\\,x - 4x + \\pi - 7$ на отрезке $\\left[-\\dfrac{\\pi}{4}; \\dfrac{\\pi}{4}\\right]$.

**Аналоги:** [X2C9UJ](/tasks/X2C9UJ) · [X5F1GK](/tasks/X5F1GK)`,
    correctAnswer: '-3',
    referenceSolution: `**Решение**

Функция определена на отрезке $\\left[-\\dfrac{\\pi}{4}; \\dfrac{\\pi}{4}\\right]$, так как на нём $\\cos x \\neq 0$.

Найдём производную:

$$y' = \\dfrac{4}{\\cos^2 x} - 4 = 4\\left(\\dfrac{1}{\\cos^2 x} - 1\\right) = 4\\,\\mathrm{tg}^2\\,x \\geq 0$$

Функция возрастает на всём отрезке, поэтому наибольшее значение — в правом конце:

$$y\\left(\\dfrac{\\pi}{4}\\right) = 4\\,\\mathrm{tg}\\,\\dfrac{\\pi}{4} - 4 \\cdot \\dfrac{\\pi}{4} + \\pi - 7 = 4 - \\pi + \\pi - 7 = -3$$

**Ответ:** $-3$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 6: Задача 7 — тригонометрические вычисления ==========
  {
    publicId: 'Y3D6KP',
    topicSlug: 'ege-07-trigonometry',
    statement: `Найдите значение выражения: $5\\,\\mathrm{tg}\\,7° \\cdot \\mathrm{tg}\\,83°$.

**Аналоги:** [Y6G2QS](/tasks/Y6G2QS) · [Y9J4WZ](/tasks/Y9J4WZ)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Заметим, что $83° = 90° - 7°$, поэтому по формулам приведения:

$$\\mathrm{tg}\\,83° = \\mathrm{tg}(90° - 7°) = \\mathrm{ctg}\\,7°$$

Тогда:

$$5\\,\\mathrm{tg}\\,7° \\cdot \\mathrm{ctg}\\,7° = 5 \\cdot 1 = 5$$

так как $\\mathrm{tg}\\,\\alpha \\cdot \\mathrm{ctg}\\,\\alpha = 1$.

**Ответ:** $5$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'Y6G2QS',
    topicSlug: 'ege-07-trigonometry',
    statement: `Найдите значение выражения: $\\dfrac{24}{\\sin^2 37° + \\sin^2 127°}$.

**Аналоги:** [Y3D6KP](/tasks/Y3D6KP) · [Y9J4WZ](/tasks/Y9J4WZ)`,
    correctAnswer: '24',
    referenceSolution: `**Решение**

По формулам приведения:

$$\\sin 127° = \\sin(180° - 53°) = \\sin 53° = \\cos 37°$$

Подставляем в знаменатель и используем основное тригонометрическое тождество:

$$\\sin^2 37° + \\sin^2 127° = \\sin^2 37° + \\cos^2 37° = 1$$

Тогда:

$$\\dfrac{24}{1} = 24$$

**Ответ:** $24$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'Y9J4WZ',
    topicSlug: 'ege-07-trigonometry',
    statement: `Найдите значение выражения: $\\dfrac{5\\cos 29°}{\\sin 61°}$.

**Аналоги:** [Y3D6KP](/tasks/Y3D6KP) · [Y6G2QS](/tasks/Y6G2QS)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Заметим, что $29° = 90° - 61°$, поэтому по формулам приведения:

$$\\cos 29° = \\cos(90° - 61°) = \\sin 61°$$

Тогда:

$$\\dfrac{5\\cos 29°}{\\sin 61°} = \\dfrac{5\\sin 61°}{\\sin 61°} = 5$$

**Ответ:** $5$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
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

  for (const subtopic of newSubtopics) {
    const parentId = topicMap.get(subtopic.parentSlug);

    if (!parentId) {
      throw new Error(`Parent topic ${subtopic.parentSlug} not found`);
    }

    const saved = await prisma.topic.upsert({
      where: {
        subjectId_slug: {
          subjectId: profileMathSubject.id,
          slug: subtopic.slug,
        },
      },
      update: {
        name: subtopic.name,
        parentId,
        sortOrder: subtopic.sortOrder,
        status: TopicStatus.PUBLISHED,
      },
      create: {
        subjectId: profileMathSubject.id,
        parentId,
        slug: subtopic.slug,
        name: subtopic.name,
        sortOrder: subtopic.sortOrder,
        status: TopicStatus.PUBLISHED,
      },
    });

    topicMap.set(saved.slug, saved.id);
    console.log(`✓ Подтема "${subtopic.name}" создана`);
  }

  let added = 0;

  for (const task of firstPartTasks) {
    const topicId = topicMap.get(task.topicSlug);

    if (!topicId) {
      console.warn(`⚠ Тема ${task.topicSlug} не найдена, пропускаем ${task.publicId}`);
      continue;
    }

    await prisma.task.upsert({
      where: { publicId: task.publicId },
      update: {
        topicId,
        examPart: ExamPart.FIRST,
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
        examPart: ExamPart.FIRST,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: task.source,
      },
    });

    added++;
    console.log(`✓ ${task.publicId} (${task.source})`);
  }

  console.log(`\n✓ Добавлено ${added} задач первой части (6 групп × 3 аналога)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
