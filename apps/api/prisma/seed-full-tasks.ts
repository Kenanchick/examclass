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

const fullTaskBank = [
  // ========== ПЛАНИМЕТРИЯ (Задача 1) ==========
  {
    publicId: 'P1T3A8',
    topicSlug: 'ege-01-triangles',
    statement: `В треугольнике $ABC$ известно, что $AB = 5$, $BC = 7$, $AC = 8$. Найдите косинус угла $B$.`,
    correctAnswer: '0,5',
    referenceSolution: `**Решение**

Используем теорему косинусов:

$$AC^2 = AB^2 + BC^2 - 2 \\cdot AB \\cdot BC \\cdot \\cos B$$

**Подставляем известные значения:**

$$8^2 = 5^2 + 7^2 - 2 \\cdot 5 \\cdot 7 \\cdot \\cos B$$

$$64 = 25 + 49 - 70 \\cos B$$

$$64 = 74 - 70 \\cos B$$

$$70 \\cos B = 74 - 64 = 10$$

$$\\cos B = \\frac{10}{70} = \\frac{1}{7} \\approx 0,143$$

**Ответ:** $\\frac{1}{7}$`,
    difficulty: 2,
  },
  {
    publicId: 'P1C9K2',
    topicSlug: 'ege-01-circles',
    statement: `Центральный угол $\\angle AOB$ равен $110°$. Найдите величину вписанного угла $\\angle ACB$, опирающегося на ту же дугу $AB$.`,
    correctAnswer: '55',
    referenceSolution: `**Решение**

Вписанный угол равен половине центрального угла, опирающегося на ту же дугу:

$$\\angle ACB = \\frac{1}{2} \\cdot \\angle AOB = \\frac{110°}{2} = 55°$$

**Ответ:** $55°$`,
    difficulty: 1,
  },
  {
    publicId: 'P1Q5M7',
    topicSlug: 'ege-01-quadrilaterals',
    statement: `В параллелограмме $ABCD$ сторона $AB = 6$, сторона $BC = 8$, угол $\\angle ABC = 60°$. Найдите диагональ $AC$.`,
    correctAnswer: '2√13',
    referenceSolution: `**Решение**

В параллелограмме применим теорему косинусов к треугольнику $ABC$:

$$AC^2 = AB^2 + BC^2 - 2 \\cdot AB \\cdot BC \\cdot \\cos(\\angle ABC)$$

$$AC^2 = 6^2 + 8^2 - 2 \\cdot 6 \\cdot 8 \\cdot \\cos 60°$$

$$AC^2 = 36 + 64 - 96 \\cdot \\frac{1}{2} = 100 - 48 = 52$$

$$AC = \\sqrt{52} = 2\\sqrt{13}$$

**Ответ:** $2\\sqrt{13}$`,
    difficulty: 2,
  },

  // ========== ВЕКТОРЫ (Задача 2) ==========
  {
    publicId: 'V2D4N6',
    topicSlug: 'ege-02-coordinates',
    statement: `Даны точки $A(2; 5)$ и $B(8; 1)$. Найдите длину вектора $\\vec{AB}$.`,
    correctAnswer: '2√10',
    referenceSolution: `**Решение**

Координаты вектора $\\vec{AB}$:

$$\\vec{AB} = (x_B - x_A; y_B - y_A) = (8 - 2; 1 - 5) = (6; -4)$$

Длина вектора:

$$|\\vec{AB}| = \\sqrt{6^2 + (-4)^2} = \\sqrt{36 + 16} = \\sqrt{52} = 2\\sqrt{10}$$

**Ответ:** $2\\sqrt{10}$`,
    difficulty: 1,
  },
  {
    publicId: 'V2E8R3',
    topicSlug: 'ege-02-dot-product',
    statement: `Векторы $\\vec{a} = (3; 4)$ и $\\vec{b} = (4; -3)$. Найдите угол между ними в градусах.`,
    correctAnswer: '90',
    referenceSolution: `**Решение**

Скалярное произведение:

$$\\vec{a} \\cdot \\vec{b} = 3 \\cdot 4 + 4 \\cdot (-3) = 12 - 12 = 0$$

Если скалярное произведение равно нулю, векторы перпендикулярны:

$$\\angle(\\vec{a}, \\vec{b}) = 90°$$

**Ответ:** $90°$`,
    difficulty: 1,
  },

  // ========== СТЕРЕОМЕТРИЯ (Задача 3) ==========
  {
    publicId: 'S3F7T9',
    topicSlug: 'ege-03-cube',
    statement: `Ребро куба равно $4$. Найдите расстояние от вершины $A$ до диагонали $B_1D_1$ верхней грани.`,
    correctAnswer: '2√2',
    referenceSolution: `**Решение**

Диагональ верхней грани куба:

$$B_1D_1 = a\\sqrt{2} = 4\\sqrt{2}$$

Расстояние от вершины $A$ до диагонали $B_1D_1$ — это высота треугольника $AB_1D_1$, опущенная из $A$.

Площадь треугольника $AB_1D_1$:

$$S = \\frac{1}{2} \\cdot B_1D_1 \\cdot h = \\frac{1}{2} \\cdot 4\\sqrt{2} \\cdot h$$

С другой стороны, $AB_1 = AD_1 = 4\\sqrt{2}$ (диагонали боковых граней).

Треугольник $AB_1D_1$ — равносторонний со стороной $4\\sqrt{2}$.

Высота равностороннего треугольника:

$$h = \\frac{a\\sqrt{3}}{2} = \\frac{4\\sqrt{2} \\cdot \\sqrt{3}}{2} = 2\\sqrt{6}$$

**Ответ:** $2\\sqrt{6}$`,
    difficulty: 3,
  },
  {
    publicId: 'S3G2W5',
    topicSlug: 'ege-03-pyramid',
    statement: `В правильной четырёхугольной пирамиде сторона основания равна $6$, а боковое ребро равно $5$. Найдите высоту пирамиды.`,
    correctAnswer: '√7',
    referenceSolution: `**Решение**

В правильной пирамиде вершина проецируется в центр основания (пересечение диагоналей).

Диагональ основания:

$$d = 6\\sqrt{2}$$

Расстояние от центра до вершины основания:

$$\\frac{d}{2} = 3\\sqrt{2}$$

По теореме Пифагора в треугольнике (высота, половина диагонали, боковое ребро):

$$h^2 + (3\\sqrt{2})^2 = 5^2$$

$$h^2 + 18 = 25$$

$$h^2 = 7$$

$$h = \\sqrt{7}$$

**Ответ:** $\\sqrt{7}$`,
    difficulty: 2,
  },

  // ========== ТЕОРИЯ ВЕРОЯТНОСТЕЙ (Задачи 4-5) ==========
  {
    publicId: 'T4H6X1',
    topicSlug: 'ege-04-classical-definition',
    statement: `В урне 12 белых и 8 чёрных шаров. Наугад выбирают один шар. Найдите вероятность того, что он окажется чёрным.`,
    correctAnswer: '0,4',
    referenceSolution: `**Решение**

Всего шаров: $12 + 8 = 20$

Благоприятных исходов (чёрные шары): $8$

Вероятность:

$$P = \\frac{8}{20} = \\frac{2}{5} = 0,4$$

**Ответ:** $0,4$`,
    difficulty: 1,
  },
  {
    publicId: 'T5J8Y4',
    topicSlug: 'ege-05-independent-events',
    statement: `Вероятность попадания в мишень при одном выстреле равна $0,7$. Стрелок делает два выстрела. Найдите вероятность того, что он попадёт в мишень ровно один раз.`,
    correctAnswer: '0,42',
    referenceSolution: `**Решение**

Вероятность попадания: $P(A) = 0,7$

Вероятность промаха: $P(\\bar{A}) = 1 - 0,7 = 0,3$

Вероятность ровно одного попадания (либо первое попал-второе промах, либо первое промах-второе попал):

$$P = P(A) \\cdot P(\\bar{A}) + P(\\bar{A}) \\cdot P(A) = 0,7 \\cdot 0,3 + 0,3 \\cdot 0,7 = 0,21 + 0,21 = 0,42$$

**Ответ:** $0,42$`,
    difficulty: 2,
  },

  // ========== ПРОСТЕЙШИЕ УРАВНЕНИЯ (Задача 6) ==========
  {
    publicId: 'E6K3Z7',
    topicSlug: 'ege-06-exponential',
    statement: `Решите уравнение: $3^{x+2} = 81$.`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Представим $81$ как степень тройки:

$$81 = 3^4$$

Уравнение принимает вид:

$$3^{x+2} = 3^4$$

Так как основания равны, приравниваем показатели:

$$x + 2 = 4$$

$$x = 2$$

**Ответ:** $2$`,
    difficulty: 1,
  },
  {
    publicId: 'E6L9A2',
    topicSlug: 'ege-06-logarithmic',
    statement: `Решите уравнение: $\\log_2(x - 3) = 4$.`,
    correctAnswer: '19',
    referenceSolution: `**Решение**

По определению логарифма:

$$x - 3 = 2^4 = 16$$

$$x = 19$$

**Проверка ОДЗ:** $x - 3 = 19 - 3 = 16 > 0$ ✓

**Ответ:** $19$`,
    difficulty: 1,
  },

  // ========== ПРОИЗВОДНАЯ (Задача 8) ==========
  {
    publicId: 'D8M5B9',
    topicSlug: 'ege-08-tangent',
    statement: `Найдите угловой коэффициент касательной к графику функции $f(x) = x^3 - 3x^2 + 2x$ в точке $x_0 = 1$.`,
    correctAnswer: '-1',
    referenceSolution: `**Решение**

Угловой коэффициент касательной равен значению производной в точке:

$$f'(x) = 3x^2 - 6x + 2$$

$$f'(1) = 3 \\cdot 1^2 - 6 \\cdot 1 + 2 = 3 - 6 + 2 = -1$$

**Ответ:** $-1$`,
    difficulty: 2,
  },

  // ========== ТЕКСТОВЫЕ ЗАДАЧИ (Задача 10) ==========
  {
    publicId: 'W10N7C4',
    topicSlug: 'ege-10-straight-motion',
    statement: `Из города $A$ в город $B$ выехал автомобиль со скоростью $60$ км/ч. Через $2$ часа навстречу ему из $B$ в $A$ выехал другой автомобиль со скоростью $80$ км/ч. Расстояние между городами $400$ км. Через сколько часов после выезда первого автомобиля они встретятся?`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

За первые $2$ часа первый автомобиль проехал:

$$s_1 = 60 \\cdot 2 = 120 \\text{ км}$$

Оставшееся расстояние:

$$400 - 120 = 280 \\text{ км}$$

Скорость сближения:

$$v = 60 + 80 = 140 \\text{ км/ч}$$

Время до встречи после выезда второго:

$$t = \\frac{280}{140} = 2 \\text{ часа}$$

Общее время после выезда первого:

$$2 + 2 = 4 \\text{ часа}$$

**Ответ:** $4$`,
    difficulty: 2,
  },

  // ========== УРАВНЕНИЯ (Задача 13) ==========
  {
    publicId: 'Q13P8D6',
    topicSlug: 'ege-13-trigonometric',
    statement: `Решите уравнение: $\\sin x = \\frac{\\sqrt{3}}{2}$. В ответе укажите наименьший положительный корень в градусах.`,
    correctAnswer: '60',
    referenceSolution: `**Решение**

По таблице значений тригонометрических функций:

$$\\sin x = \\frac{\\sqrt{3}}{2} \\implies x = 60° + 360°k \\text{ или } x = 120° + 360°k, \\quad k \\in \\mathbb{Z}$$

Наименьший положительный корень: $x = 60°$

**Ответ:** $60°$`,
    difficulty: 1,
  },

  // ========== НЕРАВЕНСТВА (Задача 15) ==========
  {
    publicId: 'I15R4E8',
    topicSlug: 'ege-15-logarithmic',
    statement: `Решите неравенство: $\\log_3(x - 2) > 2$.`,
    correctAnswer: '(11; +∞)',
    referenceSolution: `**Решение**

**ОДЗ:** $x - 2 > 0 \\implies x > 2$

По определению логарифма (основание $3 > 1$, функция возрастает):

$$\\log_3(x - 2) > \\log_3(9)$$

$$x - 2 > 9$$

$$x > 11$$

С учётом ОДЗ: $x > 11$

**Ответ:** $(11; +\\infty)$`,
    difficulty: 2,
  },

  // ========== ФИНАНСОВАЯ МАТЕМАТИКА (Задача 16) ==========
  {
    publicId: 'F16S9G3',
    topicSlug: 'ege-16-annuity-loans',
    statement: `В банк положили $100\,000$ рублей под $10\\%$ годовых. Какую сумму можно будет снять через $2$ года, если проценты начисляются ежегодно?`,
    correctAnswer: '121000',
    referenceSolution: `**Решение**

Используем формулу сложных процентов:

$$S = P \\cdot (1 + r)^n$$

где:
- $P = 100\,000$ — начальная сумма
- $r = 0,10$ — процентная ставка
- $n = 2$ — количество лет

$$S = 100\,000 \\cdot (1 + 0,10)^2 = 100\,000 \\cdot 1,1^2 = 100\,000 \\cdot 1,21 = 121\,000$$

**Ответ:** $121\,000$ рублей`,
    difficulty: 2,
  },

  // ========== ЗАДАЧА С ПАРАМЕТРОМ (Задача 18) ==========
  {
    publicId: 'A18T5H7',
    topicSlug: 'ege-18-analytic-method',
    statement: `При каких значениях параметра $a$ уравнение $x^2 - 2ax + a + 6 = 0$ имеет два различных корня?`,
    correctAnswer: 'a < -2 или a > 3',
    referenceSolution: `**Решение**

Квадратное уравнение имеет два различных корня, когда дискриминант положителен:

$$D = b^2 - 4ac > 0$$

$$D = (-2a)^2 - 4 \\cdot 1 \\cdot (a + 6) > 0$$

$$4a^2 - 4a - 24 > 0$$

$$a^2 - a - 6 > 0$$

$$(a - 3)(a + 2) > 0$$

Решаем методом интервалов:

$$a \\in (-\\infty; -2) \\cup (3; +\\infty)$$

**Ответ:** $a < -2$ или $a > 3$`,
    difficulty: 3,
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
  let skipped = 0;

  for (const task of fullTaskBank) {
    const topicId = topicMap.get(task.topicSlug);

    if (!topicId) {
      console.warn(`⚠ Тема ${task.topicSlug} не найдена, пропускаем задачу ${task.publicId}`);
      skipped++;
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
        source: 'ExamClass (полная база)',
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
        source: 'ExamClass (полная база)',
      },
    });

    added++;
  }

  console.log(`\n✓ Добавлено ${added} задач в базу`);
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
