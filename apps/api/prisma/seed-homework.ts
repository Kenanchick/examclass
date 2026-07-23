import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const homework = [
  {
    publicId: 'HW-DERIVATIVE-01',
    title: 'Производная: скорость и касательная',
    description:
      'Повторите геометрический и физический смысл производной. Ответы записывайте без единиц измерения.',
    deadlineOffset: 2,
    taskPublicIds: ['R4T8QW', 'N7B2XK', 'M9D5LH', 'J3F6VP'],
  },
  {
    publicId: 'HW-GEOMETRY-01',
    title: 'Сечения и углы в пространстве',
    description:
      'К каждому заданию сделайте отдельный чертёж и подпишите известные величины.',
    deadlineOffset: 5,
    taskPublicIds: ['G14SEC1', 'G14ANG1', 'G14CUB1'],
  },
  {
    publicId: 'HW-GRAPHS-01',
    title: 'Чтение графиков функций',
    description:
      'Сначала определите тип графика, затем отмечайте характерные точки и интервалы.',
    deadlineOffset: 8,
    taskPublicIds: ['Q2L8GA', 'Q5N3HB', 'Q8P6JC', 'S3R7KD', 'S6U1MF'],
  },
] as const;

function getDeadline(dayOffset: number) {
  const date = new Date();

  date.setDate(date.getDate() + dayOffset);
  date.setHours(20, 0, 0, 0);
  return date;
}

async function main() {
  const teacher = await prisma.user.upsert({
    where: { email: 'mentor@examclass.local' },
    update: {
      name: 'Анна Сергеевна',
      role: Role.TEACHER,
    },
    create: {
      email: 'mentor@examclass.local',
      name: 'Анна Сергеевна',
      role: Role.TEACHER,
    },
  });
  const student = await prisma.user.findUniqueOrThrow({
    where: { email: 'demo@examclass.local' },
  });
  const subject = await prisma.subject.findUniqueOrThrow({
    where: { code: 'profile-math-ege' },
  });
  const classroom = await prisma.classroom.upsert({
    where: { inviteCode: 'EXAM-HOMEWORK-DEMO' },
    update: {
      title: 'Профильная математика · 11 класс',
      ownerId: teacher.id,
      subjectId: subject.id,
    },
    create: {
      title: 'Профильная математика · 11 класс',
      inviteCode: 'EXAM-HOMEWORK-DEMO',
      ownerId: teacher.id,
      subjectId: subject.id,
    },
  });

  await prisma.classroomMember.upsert({
    where: {
      classroomId_userId: {
        classroomId: classroom.id,
        userId: student.id,
      },
    },
    update: {},
    create: {
      classroomId: classroom.id,
      userId: student.id,
    },
  });

  for (const item of homework) {
    const tasks = await prisma.task.findMany({
      where: {
        publicId: { in: [...item.taskPublicIds] },
      },
      select: {
        id: true,
        publicId: true,
      },
    });
    const taskByPublicId = new Map(tasks.map((task) => [task.publicId, task]));
    const assignment = await prisma.homeworkAssignment.upsert({
      where: { publicId: item.publicId },
      update: {
        title: item.title,
        description: item.description,
        deadline: getDeadline(item.deadlineOffset),
        classroomId: classroom.id,
        assignedById: teacher.id,
      },
      create: {
        publicId: item.publicId,
        title: item.title,
        description: item.description,
        deadline: getDeadline(item.deadlineOffset),
        classroomId: classroom.id,
        assignedById: teacher.id,
      },
    });

    await prisma.homeworkAssignmentTask.deleteMany({
      where: { homeworkId: assignment.id },
    });
    await prisma.homeworkAssignmentTask.createMany({
      data: item.taskPublicIds.flatMap((publicId, sortOrder) => {
        const task = taskByPublicId.get(publicId);

        return task
          ? [{ homeworkId: assignment.id, taskId: task.id, sortOrder }]
          : [];
      }),
    });
  }

  console.log('Homework seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
