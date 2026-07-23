import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TopicStatus } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const rootTopics = [
  { number: 1, slug: 'ege-01-planimetry', name: 'Планиметрия' },
  { number: 2, slug: 'ege-02-vectors', name: 'Векторы' },
  { number: 3, slug: 'ege-03-stereometry', name: 'Стереометрия' },
  {
    number: 4,
    slug: 'ege-04-probability-basics',
    name: 'Начала теории вероятностей',
  },
  {
    number: 5,
    slug: 'ege-05-complex-probability',
    name: 'Вероятности сложных событий',
  },
  {
    number: 6,
    slug: 'ege-06-simple-equations',
    name: 'Простейшие уравнения',
  },
  {
    number: 7,
    slug: 'ege-07-transformations',
    name: 'Вычисления и преобразования',
  },
  {
    number: 8,
    slug: 'ege-08-derivative',
    name: 'Производная и первообразная',
  },
  {
    number: 9,
    slug: 'ege-09-applied-problems',
    name: 'Задачи с прикладным содержанием',
  },
  {
    number: 10,
    slug: 'ege-10-word-problems',
    name: 'Текстовые задачи',
  },
  {
    number: 11,
    slug: 'ege-11-function-graphs',
    name: 'Графики функций',
  },
  {
    number: 12,
    slug: 'ege-12-function-extrema',
    name: 'Наибольшее и наименьшее значение функций',
  },
  { number: 13, slug: 'ege-13-equations', name: 'Уравнения' },
  {
    number: 14,
    slug: 'ege-14-stereometry-problem',
    name: 'Стереометрическая задача',
  },
  { number: 15, slug: 'ege-15-inequalities', name: 'Неравенства' },
  {
    number: 16,
    slug: 'ege-16-financial-math',
    name: 'Финансовая математика',
  },
  {
    number: 17,
    slug: 'ege-17-planimetry-problem',
    name: 'Планиметрическая задача',
  },
  {
    number: 18,
    slug: 'ege-18-parameter-problem',
    name: 'Задача с параметром',
  },
  {
    number: 19,
    slug: 'ege-19-number-properties',
    name: 'Числа и их свойства',
  },
];

const planimetrySubtopics = [
  { order: 1, slug: 'ege-01-circles', name: 'Окружности' },
  { order: 2, slug: 'ege-01-figure-angles', name: 'Углы фигуры' },
];

async function main() {
  const subject = await prisma.subject.upsert({
    where: {
      code: 'profile-math-ege',
    },
    update: {
      name: 'Профильная математика',
      description: 'Подготовка к ЕГЭ по профильной математике',
      isActive: true,
    },
    create: {
      code: 'profile-math-ege',
      name: 'Профильная математика',
      description: 'Подготовка к ЕГЭ по профильной математике',
    },
  });

  const topicIds = new Map<string, string>();

  for (const topic of rootTopics) {
    const savedTopic = await prisma.topic.upsert({
      where: {
        subjectId_slug: {
          subjectId: subject.id,
          slug: topic.slug,
        },
      },
      update: {
        name: topic.name,
        parentId: null,
        sortOrder: topic.number,
        status: TopicStatus.PUBLISHED,
      },
      create: {
        subjectId: subject.id,
        slug: topic.slug,
        name: topic.name,
        sortOrder: topic.number,
        status: TopicStatus.PUBLISHED,
      },
    });

    topicIds.set(topic.slug, savedTopic.id);
  }

  const planimetryId = topicIds.get('ege-01-planimetry');

  if (!planimetryId) {
    throw new Error('Planimetry topic was not created');
  }

  for (const subtopic of planimetrySubtopics) {
    await prisma.topic.upsert({
      where: {
        subjectId_slug: {
          subjectId: subject.id,
          slug: subtopic.slug,
        },
      },
      update: {
        name: subtopic.name,
        parentId: planimetryId,
        sortOrder: subtopic.order,
        status: TopicStatus.PUBLISHED,
      },
      create: {
        subjectId: subject.id,
        parentId: planimetryId,
        slug: subtopic.slug,
        name: subtopic.name,
        sortOrder: subtopic.order,
        status: TopicStatus.PUBLISHED,
      },
    });
  }

  console.log('Seed completed: profile math topics were added');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
