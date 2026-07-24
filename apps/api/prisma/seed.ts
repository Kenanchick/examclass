import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient, Role, TopicStatus } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const demoStudent = {
  email: 'demo@examclass.local',
  name: 'Демо-ученик',
  password: 'DemoPass123',
};

const passwordHashOptions: argon2.HashOptions = {
  type: argon2.argon2id as 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

const subjects = [
  {
    code: 'profile-math-ege',
    name: 'Профильная математика',
    description: 'Подготовка к ЕГЭ по профильной математике',
    sortOrder: 1,
  },
  {
    code: 'russian-language-ege',
    name: 'Русский язык',
    description: 'Подготовка к ЕГЭ по русскому языку',
    sortOrder: 2,
  },
  {
    code: 'physics-ege',
    name: 'Физика',
    description: 'Подготовка к ЕГЭ по физике',
    sortOrder: 3,
  },
  {
    code: 'informatics-ege',
    name: 'Информатика',
    description: 'Подготовка к ЕГЭ по информатике',
    sortOrder: 4,
  },
];

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

const subtopicGroups = [
  {
    parentSlug: 'ege-01-planimetry',
    subtopics: [
      { slug: 'ege-01-triangles', name: 'Треугольники' },
      { slug: 'ege-01-quadrilaterals', name: 'Четырёхугольники' },
      { slug: 'ege-01-circles', name: 'Окружности' },
      { slug: 'ege-01-figure-angles', name: 'Углы фигуры' },
    ],
  },
  {
    parentSlug: 'ege-02-vectors',
    subtopics: [
      { slug: 'ege-02-coordinates', name: 'Координаты' },
      { slug: 'ege-02-vector-sum', name: 'Сумма векторов' },
      { slug: 'ege-02-dot-product', name: 'Скалярное произведение' },
    ],
  },
  {
    parentSlug: 'ege-03-stereometry',
    subtopics: [
      { slug: 'ege-03-cube', name: 'Куб' },
      { slug: 'ege-03-parallelepiped', name: 'Параллелепипед' },
      { slug: 'ege-03-pyramid', name: 'Пирамида' },
      { slug: 'ege-03-cylinder', name: 'Цилиндр' },
      { slug: 'ege-03-cone', name: 'Конус' },
      { slug: 'ege-03-sphere', name: 'Шар' },
      { slug: 'ege-03-volumes-sections', name: 'Объёмы и сечения' },
    ],
  },
  {
    parentSlug: 'ege-04-probability-basics',
    subtopics: [
      {
        slug: 'ege-04-classical-definition',
        name: 'Классическое определение вероятности',
      },
    ],
  },
  {
    parentSlug: 'ege-05-complex-probability',
    subtopics: [
      {
        slug: 'ege-05-addition-multiplication',
        name: 'Теоремы сложения и умножения вероятностей',
      },
      { slug: 'ege-05-independent-events', name: 'Независимые события' },
    ],
  },
  {
    parentSlug: 'ege-06-simple-equations',
    subtopics: [
      { slug: 'ege-06-exponential', name: 'Показательные уравнения' },
      { slug: 'ege-06-logarithmic', name: 'Логарифмические уравнения' },
      { slug: 'ege-06-irrational', name: 'Иррациональные уравнения' },
      { slug: 'ege-06-trigonometric', name: 'Тригонометрические уравнения' },
    ],
  },
  {
    parentSlug: 'ege-07-transformations',
    subtopics: [
      { slug: 'ege-07-trigonometry', name: 'Тригонометрия' },
      { slug: 'ege-07-powers', name: 'Степени' },
      { slug: 'ege-07-logarithms', name: 'Логарифмы' },
    ],
  },
  {
    parentSlug: 'ege-08-derivative',
    subtopics: [
      {
        slug: 'ege-08-geometric-meaning',
        name: 'Геометрический смысл производной',
      },
      {
        slug: 'ege-08-physical-meaning',
        name: 'Физический смысл производной',
      },
      { slug: 'ege-08-tangent', name: 'Касательная' },
    ],
  },
  {
    parentSlug: 'ege-09-applied-problems',
    subtopics: [
      {
        slug: 'ege-09-physical-quantities',
        name: 'Физические величины в формулах',
      },
      {
        slug: 'ege-09-economic-quantities',
        name: 'Экономические величины в формулах',
      },
    ],
  },
  {
    parentSlug: 'ege-10-word-problems',
    subtopics: [
      { slug: 'ege-10-straight-motion', name: 'Движение по прямой' },
      { slug: 'ege-10-circular-motion', name: 'Движение по окружности' },
      { slug: 'ege-10-water-motion', name: 'Движение по воде' },
      { slug: 'ege-10-work', name: 'Работа' },
      { slug: 'ege-10-mixtures-alloys', name: 'Смеси и сплавы' },
      { slug: 'ege-10-percentages', name: 'Проценты' },
    ],
  },
  {
    parentSlug: 'ege-11-function-graphs',
    subtopics: [
      { slug: 'ege-11-parabolas', name: 'Параболы' },
      { slug: 'ege-11-hyperbolas', name: 'Гиперболы' },
      { slug: 'ege-11-lines', name: 'Прямые' },
      { slug: 'ege-11-roots', name: 'Корни' },
      { slug: 'ege-11-trigonometry', name: 'Тригонометрические функции' },
      { slug: 'ege-11-logarithms', name: 'Логарифмические функции' },
    ],
  },
  {
    parentSlug: 'ege-12-function-extrema',
    subtopics: [
      {
        slug: 'ege-12-extrema-derivative',
        name: 'Нахождение минимума и максимума с помощью производной',
      },
    ],
  },
  {
    parentSlug: 'ege-13-equations',
    subtopics: [
      { slug: 'ege-13-trigonometric', name: 'Тригонометрические уравнения' },
      { slug: 'ege-13-exponential', name: 'Показательные уравнения' },
      { slug: 'ege-13-logarithmic', name: 'Логарифмические уравнения' },
      { slug: 'ege-13-root-selection', name: 'Отбор корней' },
    ],
  },
  {
    parentSlug: 'ege-14-stereometry-problem',
    subtopics: [
      { slug: 'ege-14-proofs', name: 'Доказательство свойств фигур' },
      { slug: 'ege-14-sections', name: 'Сечения' },
      { slug: 'ege-14-angles-distances', name: 'Углы и расстояния' },
    ],
  },
  {
    parentSlug: 'ege-15-inequalities',
    subtopics: [
      { slug: 'ege-15-rational', name: 'Рациональные неравенства' },
      { slug: 'ege-15-irrational', name: 'Иррациональные неравенства' },
      { slug: 'ege-15-exponential', name: 'Показательные неравенства' },
      { slug: 'ege-15-logarithmic', name: 'Логарифмические неравенства' },
      { slug: 'ege-15-systems', name: 'Системы неравенств' },
    ],
  },
  {
    parentSlug: 'ege-16-financial-math',
    subtopics: [
      {
        slug: 'ege-16-differentiated-loans',
        name: 'Кредиты с дифференцированными платежами',
      },
      {
        slug: 'ege-16-annuity-loans',
        name: 'Кредиты с аннуитетными платежами',
      },
      { slug: 'ege-16-deposits', name: 'Вклады' },
      { slug: 'ege-16-optimization', name: 'Задачи на оптимизацию' },
    ],
  },
  {
    parentSlug: 'ege-17-planimetry-problem',
    subtopics: [
      {
        slug: 'ege-17-proofs-calculations',
        name: 'Сложная геометрическая задача на доказательство и вычисление',
      },
    ],
  },
  {
    parentSlug: 'ege-18-parameter-problem',
    subtopics: [
      { slug: 'ege-18-analytic-method', name: 'Аналитический метод' },
      { slug: 'ege-18-graphical-method', name: 'Графический метод' },
      {
        slug: 'ege-18-root-location',
        name: 'Расположение корней квадратного трёхчлена',
      },
    ],
  },
  {
    parentSlug: 'ege-19-number-properties',
    subtopics: [
      { slug: 'ege-19-divisibility', name: 'Делимость' },
      { slug: 'ege-19-sequences', name: 'Последовательности' },
      { slug: 'ege-19-progressions', name: 'Прогрессии' },
      { slug: 'ege-19-logic', name: 'Логика' },
    ],
  },
];

async function main() {
  const demoPasswordHash = (await argon2.hash(
    demoStudent.password,
    passwordHashOptions,
  )) as string;

  await prisma.user.upsert({
    where: {
      email: demoStudent.email,
    },
    update: {
      name: demoStudent.name,
      passwordHash: demoPasswordHash,
      role: Role.STUDENT,
    },
    create: {
      email: demoStudent.email,
      name: demoStudent.name,
      passwordHash: demoPasswordHash,
      role: Role.STUDENT,
    },
  });

  const seededSubjects = new Map<string, string>();

  for (const subject of subjects) {
    const savedSubject = await prisma.subject.upsert({
      where: {
        code: subject.code,
      },
      update: {
        name: subject.name,
        description: subject.description,
        sortOrder: subject.sortOrder,
        isActive: true,
      },
      create: subject,
    });

    seededSubjects.set(subject.code, savedSubject.id);
  }

  const subjectId = seededSubjects.get('profile-math-ege');

  if (!subjectId) {
    throw new Error('Profile math subject was not created');
  }

  const topicIds = new Map<string, string>();

  for (const topic of rootTopics) {
    const savedTopic = await prisma.topic.upsert({
      where: {
        subjectId_slug: {
          subjectId,
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
        subjectId,
        slug: topic.slug,
        name: topic.name,
        sortOrder: topic.number,
        status: TopicStatus.PUBLISHED,
      },
    });

    topicIds.set(topic.slug, savedTopic.id);
  }

  for (const group of subtopicGroups) {
    const parentId = topicIds.get(group.parentSlug);

    if (!parentId) {
      throw new Error(`Parent topic ${group.parentSlug} was not created`);
    }

    for (const [index, subtopic] of group.subtopics.entries()) {
      const savedSubtopic = await prisma.topic.upsert({
        where: {
          subjectId_slug: {
            subjectId,
            slug: subtopic.slug,
          },
        },
        update: {
          name: subtopic.name,
          parentId,
          sortOrder: index + 1,
          status: TopicStatus.PUBLISHED,
        },
        create: {
          subjectId,
          parentId,
          slug: subtopic.slug,
          name: subtopic.name,
          sortOrder: index + 1,
          status: TopicStatus.PUBLISHED,
        },
      });

      topicIds.set(subtopic.slug, savedSubtopic.id);
    }
  }

  console.log(
    'Seed completed: demo student, subjects, and topics were added',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
