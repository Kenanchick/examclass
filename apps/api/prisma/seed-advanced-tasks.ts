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

const advancedTasks = [
  {
    publicId: 'Z17A7Q9',
    topicSlug: 'ege-17-proofs-calculations',
    statement: `В треугольнике $ABC$ проведена медиана $BM$. Известно, что $AB = 6$, $BC = 8$, $AC = 10$.

а) Докажите, что треугольник $ABC$ прямоугольный.

б) Найдите длину медианы $BM$.`,
    correctAnswer: 'б) BM = 5',
    referenceSolution: `**а) Доказательство**

Проверим выполнение теоремы Пифагора:

$$AB^2 + BC^2 = 6^2 + 8^2 = 36 + 64 = 100$$

$$AC^2 = 10^2 = 100$$

Так как $AB^2 + BC^2 = AC^2$, по теореме, обратной теореме Пифагора, треугольник $ABC$ прямоугольный с прямым углом при вершине $B$. **Что и требовалось доказать.**

**б) Нахождение медианы**

В прямоугольном треугольнике медиана, проведённая к гипотенузе, равна половине гипотенузы:

$$BM = \\frac{AC}{2} = \\frac{10}{2} = 5$$

**Альтернативное решение (формула длины медианы):**

$$BM = \\frac{1}{2}\\sqrt{2AB^2 + 2BC^2 - AC^2}$$

$$BM = \\frac{1}{2}\\sqrt{2 \\cdot 36 + 2 \\cdot 64 - 100} = \\frac{1}{2}\\sqrt{72 + 128 - 100} = \\frac{1}{2}\\sqrt{100} = \\frac{10}{2} = 5$$

**Ответ:** б) $BM = 5$`,
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

  for (const task of advancedTasks) {
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
        examPart: ExamPart.SECOND,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: 'ExamClass (расширенная база)',
      },
      create: {
        publicId: task.publicId,
        topicId,
        examPart: ExamPart.SECOND,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: 'ExamClass (расширенная база)',
      },
    });

    added++;
  }

  console.log(`\n✓ Добавлено ${added} задач (задание 17)`);
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
