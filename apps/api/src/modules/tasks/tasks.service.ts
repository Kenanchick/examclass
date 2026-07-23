import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublishedTask(publicId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        publicId: publicId.toUpperCase(),
        status: TaskStatus.PUBLISHED,
      },
      select: {
        publicId: true,
        examPart: true,
        statement: true,
        correctAnswer: true,
        referenceSolution: true,
        difficulty: true,
        source: true,
        topic: {
          select: {
            id: true,
            slug: true,
            name: true,
            sortOrder: true,
            parent: {
              select: {
                name: true,
                sortOrder: true,
              },
            },
            subject: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }
}
