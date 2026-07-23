import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus, TopicStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublishedTopics(subjectCode: string) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        code: subjectCode,
      },
      select: {
        id: true,
        code: true,
        name: true,
        topics: {
          where: {
            parentId: null,
            status: TopicStatus.PUBLISHED,
          },
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            slug: true,
            name: true,
            sortOrder: true,
            children: {
              where: {
                status: TopicStatus.PUBLISHED,
              },
              orderBy: {
                sortOrder: 'asc',
              },
              select: {
                id: true,
                slug: true,
                name: true,
                sortOrder: true,
                tasks: {
                  where: {
                    status: TaskStatus.PUBLISHED,
                  },
                  orderBy: {
                    createdAt: 'asc',
                  },
                  select: {
                    publicId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Предмет не найден');
    }

    return subject;
  }
}
