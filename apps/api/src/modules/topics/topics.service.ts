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
            _count: {
              select: {
                tasks: {
                  where: {
                    status: TaskStatus.PUBLISHED,
                  },
                },
              },
            },
            tasks: {
              where: {
                status: TaskStatus.PUBLISHED,
              },
              orderBy: {
                createdAt: 'asc',
              },
              take: 1,
              select: {
                publicId: true,
              },
            },
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
                _count: {
                  select: {
                    tasks: {
                      where: {
                        status: TaskStatus.PUBLISHED,
                      },
                    },
                  },
                },
                tasks: {
                  where: {
                    status: TaskStatus.PUBLISHED,
                  },
                  orderBy: {
                    createdAt: 'asc',
                  },
                  take: 1,
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

    const { topics: rawTopics, ...subjectData } = subject;
    const topics = rawTopics.map(({ _count, children, ...topic }) => {
      const normalizedChildren = children.map(
        ({ _count: childCount, ...child }) => ({
          ...child,
          taskCount: childCount.tasks,
        }),
      );
      const taskCount =
        _count.tasks +
        normalizedChildren.reduce((total, child) => total + child.taskCount, 0);

      return {
        ...topic,
        taskCount,
        children: normalizedChildren,
      };
    });

    return {
      ...subjectData,
      totalTaskCount: topics.reduce(
        (total, topic) => total + topic.taskCount,
        0,
      ),
      topics,
    };
  }
}
