import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { taskDetailsSelect } from '../tasks/task-details.select';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(userId: string) {
    const favorites = await this.prisma.taskFavorite.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        task: {
          select: taskDetailsSelect,
        },
      },
    });

    return favorites.map((favorite) => favorite.task);
  }

  async addFavorite(userId: string, publicId: string) {
    const task = await this.findPublishedTask(publicId);

    await this.prisma.taskFavorite.upsert({
      where: {
        userId_taskId: {
          userId,
          taskId: task.id,
        },
      },
      update: {},
      create: {
        userId,
        taskId: task.id,
      },
    });

    return { publicId: task.publicId };
  }

  async removeFavorite(userId: string, publicId: string) {
    const task = await this.findPublishedTask(publicId);

    await this.prisma.taskFavorite.deleteMany({
      where: {
        userId,
        taskId: task.id,
      },
    });

    return { publicId: task.publicId };
  }

  private async findPublishedTask(publicId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        publicId: publicId.toUpperCase(),
        status: TaskStatus.PUBLISHED,
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }
}
