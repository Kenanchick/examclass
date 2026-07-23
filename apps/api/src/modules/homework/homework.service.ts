import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

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
}
