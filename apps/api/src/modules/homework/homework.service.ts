import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { taskDetailsSelect } from '../tasks/task-details.select';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentHomework(userId: string) {
    const assignments = await this.prisma.homeworkAssignment.findMany({
      where: {
        classroom: {
          members: {
            some: { userId },
          },
        },
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
      select: {
        publicId: true,
        title: true,
        description: true,
        deadline: true,
        createdAt: true,
        assignedBy: {
          select: {
            name: true,
          },
        },
        classroom: {
          select: {
            title: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
        tasks: {
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            task: {
              select: {
                publicId: true,
              },
            },
          },
        },
      },
    });

    return assignments.map(
      ({ assignedBy, createdAt, tasks, ...assignment }) => ({
        ...assignment,
        assignedAt: createdAt,
        teacher: assignedBy,
        taskCount: tasks.length,
        tasks: tasks.map(({ task }) => task),
      }),
    );
  }

  async getStudentHomeworkAssignment(userId: string, publicId: string) {
    const assignment = await this.prisma.homeworkAssignment.findFirst({
      where: {
        publicId,
        classroom: {
          members: {
            some: { userId },
          },
        },
      },
      select: {
        publicId: true,
        title: true,
        description: true,
        deadline: true,
        createdAt: true,
        assignedBy: {
          select: {
            name: true,
          },
        },
        classroom: {
          select: {
            title: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
        tasks: {
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            task: {
              select: taskDetailsSelect,
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Домашнее задание не найдено');
    }

    const { assignedBy, createdAt, tasks, ...homework } = assignment;

    return {
      ...homework,
      assignedAt: createdAt,
      teacher: assignedBy,
      taskCount: tasks.length,
      tasks: tasks.map(({ task }) => task),
    };
  }
}
