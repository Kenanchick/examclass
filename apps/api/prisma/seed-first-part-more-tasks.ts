import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { ExamPart, PrismaClient, TaskStatus } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const moreFirstPartTasks = [
  // ========== ГРУППА 7: Задача 2 — скалярное произведение векторов ==========
  {
    publicId: 'V3K7PD',
    topicSlug: 'ege-02-dot-product',
    statement: `Даны векторы $\\vec{a}(3; -2)$ и $\\vec{b}(-1; 4)$. Найдите скалярное произведение $\\vec{a} \\cdot \\vec{b}$.

**Аналоги:** [V6M1RE](/tasks/V6M1RE) · [V9N4TA](/tasks/V9N4TA)`,
    correctAnswer: '-11',
    referenceSolution: `**Решение**

Скалярное произведение векторов равно сумме произведений соответствующих координат:

$$\\vec{a} \\cdot \\vec{b} = 3 \\cdot (-1) + (-2) \\cdot 4 = -3 - 8 = -11$$

**Ответ:** $-11$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'V6M1RE',
    topicSlug: 'ege-02-dot-product',
    statement: `Даны векторы $\\vec{a}(5; 1)$ и $\\vec{b}(2; -3)$. Найдите скалярное произведение $\\vec{a} \\cdot \\vec{b}$.

**Аналоги:** [V3K7PD](/tasks/V3K7PD) · [V9N4TA](/tasks/V9N4TA)`,
    correctAnswer: '7',
    referenceSolution: `**Решение**

Скалярное произведение векторов:

$$\\vec{a} \\cdot \\vec{b} = 5 \\cdot 2 + 1 \\cdot (-3) = 10 - 3 = 7$$

**Ответ:** $7$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'V9N4TA',
    topicSlug: 'ege-02-dot-product',
    statement: `Даны векторы $\\vec{a}(-2; 6)$ и $\\vec{b}(3; 2)$. Найдите скалярное произведение $\\vec{a} \\cdot \\vec{b}$.

**Аналоги:** [V3K7PD](/tasks/V3K7PD) · [V6M1RE](/tasks/V6M1RE)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

Скалярное произведение векторов:

$$\\vec{a} \\cdot \\vec{b} = (-2) \\cdot 3 + 6 \\cdot 2 = -6 + 12 = 6$$

**Ответ:** $6$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 8: Задача 3 — диагональ куба ==========
  {
    publicId: 'C2Q8WS',
    topicSlug: 'ege-03-cube',
    statement: `Ребро куба равно $5$. Найдите диагональ куба.

**Аналоги:** [C5T3YU](/tasks/C5T3YU) · [C8X6IO](/tasks/C8X6IO)`,
    correctAnswer: '5√3',
    referenceSolution: `**Решение**

Диагональ куба связана с его ребром формулой:

$$d = a\\sqrt{3}$$

При $a = 5$:

$$d = 5\\sqrt{3}$$

**Ответ:** $5\\sqrt{3}$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'C5T3YU',
    topicSlug: 'ege-03-cube',
    statement: `Ребро куба равно $2\\sqrt{3}$. Найдите диагональ куба.

**Аналоги:** [C2Q8WS](/tasks/C2Q8WS) · [C8X6IO](/tasks/C8X6IO)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

Диагональ куба:

$$d = a\\sqrt{3} = 2\\sqrt{3} \\cdot \\sqrt{3} = 2 \\cdot 3 = 6$$

**Ответ:** $6$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'C8X6IO',
    topicSlug: 'ege-03-cube',
    statement: `Диагональ куба равна $7\\sqrt{3}$. Найдите ребро куба.

**Аналоги:** [C2Q8WS](/tasks/C2Q8WS) · [C5T3YU](/tasks/C5T3YU)`,
    correctAnswer: '7',
    referenceSolution: `**Решение**

Из формулы диагонали куба $d = a\\sqrt{3}$ выразим ребро:

$$a = \\dfrac{d}{\\sqrt{3}} = \\dfrac{7\\sqrt{3}}{\\sqrt{3}} = 7$$

**Ответ:** $7$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 9: Задача 6 — логарифмические уравнения ==========
  {
    publicId: 'L1P4ZX',
    topicSlug: 'ege-06-logarithmic',
    statement: `Решите уравнение: $\\log_5(x + 2) = 2$.

**Аналоги:** [L4R7CV](/tasks/L4R7CV) · [L7U2BN](/tasks/L7U2BN)`,
    correctAnswer: '23',
    referenceSolution: `**Решение**

По определению логарифма:

$$x + 2 = 5^2 = 25$$

$$x = 23$$

**Проверка ОДЗ:** $x + 2 = 25 > 0$ — условие выполнено.

**Ответ:** $23$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'L4R7CV',
    topicSlug: 'ege-06-logarithmic',
    statement: `Решите уравнение: $\\log_3(x - 4) = 3$.

**Аналоги:** [L1P4ZX](/tasks/L1P4ZX) · [L7U2BN](/tasks/L7U2BN)`,
    correctAnswer: '31',
    referenceSolution: `**Решение**

По определению логарифма:

$$x - 4 = 3^3 = 27$$

$$x = 31$$

**Проверка ОДЗ:** $x - 4 = 27 > 0$ — условие выполнено.

**Ответ:** $31$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'L7U2BN',
    topicSlug: 'ege-06-logarithmic',
    statement: `Решите уравнение: $\\log_2(x + 1) = 4$.

**Аналоги:** [L1P4ZX](/tasks/L1P4ZX) · [L4R7CV](/tasks/L4R7CV)`,
    correctAnswer: '15',
    referenceSolution: `**Решение**

По определению логарифма:

$$x + 1 = 2^4 = 16$$

$$x = 15$$

**Проверка ОДЗ:** $x + 1 = 16 > 0$ — условие выполнено.

**Ответ:** $15$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 10: Задача 8 — касательная (значение производной) ==========
  {
    publicId: 'D3E6QM',
    topicSlug: 'ege-08-tangent',
    statement: `Найдите угловой коэффициент касательной к графику функции $f(x) = x^2 - 6x + 11$ в точке $x_0 = 4$.

**Аналоги:** [D6G9KA](/tasks/D6G9KA) · [D9J1SF](/tasks/D9J1SF)`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Угловой коэффициент касательной равен значению производной в точке касания.

Находим производную:

$$f'(x) = 2x - 6$$

Вычисляем в точке $x_0 = 4$:

$$f'(4) = 2 \\cdot 4 - 6 = 2$$

**Ответ:** $2$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'D6G9KA',
    topicSlug: 'ege-08-tangent',
    statement: `Найдите угловой коэффициент касательной к графику функции $f(x) = x^3 - 3x$ в точке $x_0 = 2$.

**Аналоги:** [D3E6QM](/tasks/D3E6QM) · [D9J1SF](/tasks/D9J1SF)`,
    correctAnswer: '9',
    referenceSolution: `**Решение**

Находим производную:

$$f'(x) = 3x^2 - 3$$

Вычисляем в точке $x_0 = 2$:

$$f'(2) = 3 \\cdot 4 - 3 = 9$$

**Ответ:** $9$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'D9J1SF',
    topicSlug: 'ege-08-tangent',
    statement: `Найдите угловой коэффициент касательной к графику функции $f(x) = 2x^2 + 3x - 5$ в точке $x_0 = 1$.

**Аналоги:** [D3E6QM](/tasks/D3E6QM) · [D6G9KA](/tasks/D6G9KA)`,
    correctAnswer: '7',
    referenceSolution: `**Решение**

Находим производную:

$$f'(x) = 4x + 3$$

Вычисляем в точке $x_0 = 1$:

$$f'(1) = 4 \\cdot 1 + 3 = 7$$

**Ответ:** $7$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 11: Задача 9 — закон Ома для полной цепи ==========
  {
    publicId: 'A2H5WD',
    topicSlug: 'ege-09-physical-quantities',
    statement: `Сила тока в полной цепи вычисляется по закону Ома: $I = \\dfrac{\\varepsilon}{R + r}$, где $\\varepsilon$ — ЭДС источника, $R$ — сопротивление цепи, $r$ — внутреннее сопротивление источника. Найдите силу тока (в амперах), если $\\varepsilon = 12$ В, $R = 3$ Ом, $r = 1$ Ом.

**Аналоги:** [A5K8ZG](/tasks/A5K8ZG) · [A8N1XJ](/tasks/A8N1XJ)`,
    correctAnswer: '3',
    referenceSolution: `**Решение**

Подставляем известные значения в формулу:

$$I = \\dfrac{\\varepsilon}{R + r} = \\dfrac{12}{3 + 1} = \\dfrac{12}{4} = 3$$

**Ответ:** $3$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'A5K8ZG',
    topicSlug: 'ege-09-physical-quantities',
    statement: `Сила тока в полной цепи вычисляется по закону Ома: $I = \\dfrac{\\varepsilon}{R + r}$. Найдите силу тока (в амперах), если $\\varepsilon = 24$ В, $R = 5$ Ом, $r = 1$ Ом.

**Аналоги:** [A2H5WD](/tasks/A2H5WD) · [A8N1XJ](/tasks/A8N1XJ)`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

Подставляем значения в формулу:

$$I = \\dfrac{24}{5 + 1} = \\dfrac{24}{6} = 4$$

**Ответ:** $4$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'A8N1XJ',
    topicSlug: 'ege-09-physical-quantities',
    statement: `Сила тока в полной цепи вычисляется по закону Ома: $I = \\dfrac{\\varepsilon}{R + r}$. Найдите силу тока (в амперах), если $\\varepsilon = 36$ В, $R = 7$ Ом, $r = 2$ Ом.

**Аналоги:** [A2H5WD](/tasks/A2H5WD) · [A5K8ZG](/tasks/A5K8ZG)`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

Подставляем значения в формулу:

$$I = \\dfrac{36}{7 + 2} = \\dfrac{36}{9} = 4$$

**Ответ:** $4$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 12: Задача 10 — средняя скорость ==========
  {
    publicId: 'W4B7PM',
    topicSlug: 'ege-10-straight-motion',
    statement: `Первую половину пути автомобиль проехал со скоростью $60$ км/ч, а вторую половину — со скоростью $40$ км/ч. Найдите среднюю скорость автомобиля на всём пути (в км/ч).

**Аналоги:** [W7D2RK](/tasks/W7D2RK) · [W1F9VT](/tasks/W1F9VT)`,
    correctAnswer: '48',
    referenceSolution: `**Решение**

Средняя скорость — это отношение всего пути ко всему времени. Пусть весь путь равен $S$.

Время на первой половине: $\\dfrac{S}{2 \\cdot 60}$ ч, на второй: $\\dfrac{S}{2 \\cdot 40}$ ч.

$$v_{\\text{ср}} = \\dfrac{S}{\\dfrac{S}{120} + \\dfrac{S}{80}} = \\dfrac{1}{\\dfrac{1}{120} + \\dfrac{1}{80}} = \\dfrac{2 \\cdot 60 \\cdot 40}{60 + 40} = \\dfrac{4800}{100} = 48$$

**Ответ:** $48$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'W7D2RK',
    topicSlug: 'ege-10-straight-motion',
    statement: `Первую половину пути автомобиль проехал со скоростью $90$ км/ч, а вторую половину — со скоростью $60$ км/ч. Найдите среднюю скорость автомобиля на всём пути (в км/ч).

**Аналоги:** [W4B7PM](/tasks/W4B7PM) · [W1F9VT](/tasks/W1F9VT)`,
    correctAnswer: '72',
    referenceSolution: `**Решение**

Средняя скорость при двух равных участках пути:

$$v_{\\text{ср}} = \\dfrac{2 v_1 v_2}{v_1 + v_2} = \\dfrac{2 \\cdot 90 \\cdot 60}{90 + 60} = \\dfrac{10800}{150} = 72$$

**Ответ:** $72$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'W1F9VT',
    topicSlug: 'ege-10-straight-motion',
    statement: `Первую половину пути автомобиль проехал со скоростью $80$ км/ч, а вторую половину — со скоростью $120$ км/ч. Найдите среднюю скорость автомобиля на всём пути (в км/ч).

**Аналоги:** [W4B7PM](/tasks/W4B7PM) · [W7D2RK](/tasks/W7D2RK)`,
    correctAnswer: '96',
    referenceSolution: `**Решение**

Средняя скорость при двух равных участках пути:

$$v_{\\text{ср}} = \\dfrac{2 v_1 v_2}{v_1 + v_2} = \\dfrac{2 \\cdot 80 \\cdot 120}{80 + 120} = \\dfrac{19200}{200} = 96$$

**Ответ:** $96$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 13: Задача 11 — прямая (с клетками) ==========
  {
    publicId: 'G2M6HL',
    topicSlug: 'ege-11-lines',
    statement: `На рисунке изображён график функции $f(x) = kx + b$. Найдите $f(7)$.

![График функции](/tasks/line-1.svg)

**Аналоги:** [G5P9NQ](/tasks/G5P9NQ) · [G8S3TW](/tasks/G8S3TW)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

По графику функция проходит через точки $(-2; -3)$ и $(2; 1)$.

Угловой коэффициент:

$$k = \\dfrac{1 - (-3)}{2 - (-2)} = \\dfrac{4}{4} = 1$$

Найдём $b$, подставив точку $(2; 1)$:

$$1 = 1 \\cdot 2 + b \\implies b = -1$$

Получили $f(x) = x - 1$. Тогда:

$$f(7) = 7 - 1 = 6$$

**Ответ:** $6$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'G5P9NQ',
    topicSlug: 'ege-11-lines',
    statement: `На рисунке изображён график функции $f(x) = kx + b$. Найдите $f(-4)$.

![График функции](/tasks/line-2.svg)

**Аналоги:** [G2M6HL](/tasks/G2M6HL) · [G8S3TW](/tasks/G8S3TW)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

По графику функция проходит через точки $(-1; 3)$ и $(3; -1)$.

Угловой коэффициент:

$$k = \\dfrac{-1 - 3}{3 - (-1)} = \\dfrac{-4}{4} = -1$$

Найдём $b$, подставив точку $(-1; 3)$:

$$3 = -1 \\cdot (-1) + b \\implies b = 2$$

Получили $f(x) = -x + 2$. Тогда:

$$f(-4) = 4 + 2 = 6$$

**Ответ:** $6$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'G8S3TW',
    topicSlug: 'ege-11-lines',
    statement: `На рисунке изображён график функции $f(x) = kx + b$. Найдите $f(8)$.

![График функции](/tasks/line-3.svg)

**Аналоги:** [G2M6HL](/tasks/G2M6HL) · [G5P9NQ](/tasks/G5P9NQ)`,
    correctAnswer: '-9',
    referenceSolution: `**Решение**

По графику функция проходит через точки $(-3; 2)$ и $(3; -4)$.

Угловой коэффициент:

$$k = \\dfrac{-4 - 2}{3 - (-3)} = \\dfrac{-6}{6} = -1$$

Найдём $b$, подставив точку $(-3; 2)$:

$$2 = -1 \\cdot (-3) + b \\implies b = -1$$

Получили $f(x) = -x - 1$. Тогда:

$$f(8) = -8 - 1 = -9$$

**Ответ:** $-9$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА 14: Задача 1 — прямоугольный треугольник (с рисунком) ==========
  {
    publicId: 'T6V4YB',
    topicSlug: 'ege-01-triangles',
    statement: `В треугольнике $ABC$ угол $C$ равен $90°$, $AB = 10$, $AC = 8$. Найдите $BC$.

![Чертёж задачи](/tasks/right-triangle-abc.svg)

**Аналоги:** [T9X7KD](/tasks/T9X7KD) · [T2Z1MG](/tasks/T2Z1MG)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

По теореме Пифагора:

$$AB^2 = AC^2 + BC^2$$

Выразим катет $BC$:

$$BC = \\sqrt{AB^2 - AC^2} = \\sqrt{100 - 64} = \\sqrt{36} = 6$$

**Ответ:** $6$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'T9X7KD',
    topicSlug: 'ege-01-triangles',
    statement: `В треугольнике $ABC$ угол $C$ равен $90°$, $AB = 13$, $AC = 5$. Найдите $BC$.

![Чертёж задачи](/tasks/right-triangle-abc.svg)

**Аналоги:** [T6V4YB](/tasks/T6V4YB) · [T2Z1MG](/tasks/T2Z1MG)`,
    correctAnswer: '12',
    referenceSolution: `**Решение**

По теореме Пифагора:

$$BC = \\sqrt{AB^2 - AC^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12$$

**Ответ:** $12$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'T2Z1MG',
    topicSlug: 'ege-01-triangles',
    statement: `В треугольнике $ABC$ угол $C$ равен $90°$, $AB = 17$, $BC = 15$. Найдите $AC$.

![Чертёж задачи](/tasks/right-triangle-abc.svg)

**Аналоги:** [T6V4YB](/tasks/T6V4YB) · [T9X7KD](/tasks/T9X7KD)`,
    correctAnswer: '8',
    referenceSolution: `**Решение**

По теореме Пифагора:

$$AC = \\sqrt{AB^2 - BC^2} = \\sqrt{289 - 225} = \\sqrt{64} = 8$$

**Ответ:** $8$`,
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

  let added = 0;

  for (const task of moreFirstPartTasks) {
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
    console.log(`✓ ${task.publicId} — ${task.topicSlug}`);
  }

  console.log(`\n✓ Добавлено ${added} задач (7 групп × 3 аналога)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
