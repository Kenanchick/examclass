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

const prototypeTasks = [
  {
    publicId: 'K9M2XP',
    topicSlug: 'ege-01-circles',
    statement: `На рисунке изображён вписанный угол $\\angle BAC$, опирающийся на дугу $BC$ окружности с центром в точке $O$.

![Чертёж задачи](/tasks/inscribed-angle.svg)

Центральный угол $\\angle BOC$ равен $120°$. Найдите величину вписанного угла $\\angle BAC$ в градусах.`,
    correctAnswer: '60',
    referenceSolution: `**Решение**

Вписанный угол — это угол, вершина которого лежит на окружности, а стороны пересекают эту окружность.

**Ключевое свойство:** Вписанный угол равен половине центрального угла, опирающегося на ту же дугу.

$$\\angle BAC = \\frac{1}{2} \\cdot \\angle BOC$$

**Подставляем известные данные:**

$$\\angle BAC = \\frac{1}{2} \\cdot 120° = 60°$$

**Ответ:** $60°$`,
    difficulty: 1,
  },
  {
    publicId: 'V4N8QT',
    topicSlug: 'ege-01-triangles',
    statement: `Дан прямоугольный треугольник $ABC$ с прямым углом при вершине $B$.

![Чертёж задачи](/tasks/right-triangle.svg)

Катет $AB = 6$, катет $BC = 8$. Найдите длину гипотенузы $AC$.`,
    correctAnswer: '10',
    referenceSolution: `**Решение**

В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов (теорема Пифагора).

**Формула:**

$$AC^2 = AB^2 + BC^2$$

**Подставляем известные значения:**

$$AC^2 = 6^2 + 8^2 = 36 + 64 = 100$$

**Извлекаем квадратный корень:**

$$AC = \\sqrt{100} = 10$$

**Ответ:** $10$`,
    difficulty: 1,
  },
  {
    publicId: 'L5R9CW',
    topicSlug: 'ege-03-parallelepiped',
    statement: `Дан прямоугольный параллелепипед $ABCDA_1B_1C_1D_1$ с рёбрами:

![Чертёж задачи](/tasks/parallelepiped.svg)

$AB = 3$, $BC = 4$, $CC_1 = 5$. Найдите длину диагонали $AC_1$ параллелепипеда.`,
    correctAnswer: '5√2',
    referenceSolution: `**Решение**

Диагональ прямоугольного параллелепипеда вычисляется по формуле:

$$d^2 = a^2 + b^2 + c^2$$

где $a$, $b$, $c$ — длины рёбер параллелепипеда.

**Подставляем данные:**

$$AC_1^2 = AB^2 + BC^2 + CC_1^2$$

$$AC_1^2 = 3^2 + 4^2 + 5^2 = 9 + 16 + 25 = 50$$

**Извлекаем квадратный корень:**

$$AC_1 = \\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$$

**Ответ:** $5\\sqrt{2}$`,
    difficulty: 2,
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

  for (const task of prototypeTasks) {
    const topicId = topicMap.get(task.topicSlug);

    if (!topicId) {
      throw new Error(`Topic ${task.topicSlug} not found`);
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
        source: 'ФИПИ (прототип)',
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
        source: 'ФИПИ (прототип)',
      },
    });

    console.log(`✓ Задача ${task.publicId} добавлена в тему "${task.topicSlug}"`);
  }

  console.log('\nГотово! Добавлены 3 задачи с картинками и LaTeX-решениями.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
