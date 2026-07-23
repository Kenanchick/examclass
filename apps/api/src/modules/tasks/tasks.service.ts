import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { taskDetailsSelect } from './task-details.select';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublishedTask(publicId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        publicId: publicId.toUpperCase(),
        status: TaskStatus.PUBLISHED,
      },
      select: taskDetailsSelect,
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }
}
