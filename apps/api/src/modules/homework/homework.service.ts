import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ClassroomMemberRole,
  ClassroomStatus,
  Role,
  TaskStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { taskDetailsSelect } from '../tasks/task-details.select';
import { CreateHomeworkAssignmentDto } from './dto/create-homework-assignment.dto';
import { TeacherHomeworkTasksQueryDto } from './dto/teacher-homework-tasks-query.dto';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentHomework(userId: string) {
    const assignments = await this.prisma.homeworkAssignment.findMany({
      where: {
        OR: [
          {
            recipients: {
              some: { studentId: userId },
            },
          },
          {
            recipients: {
              none: {},
            },
            classroom: {
              members: {
                some: { userId },
              },
            },
          },
        ],
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
        OR: [
          {
            recipients: {
              some: { studentId: userId },
            },
          },
          {
            recipients: {
              none: {},
            },
            classroom: {
              members: {
                some: { userId },
              },
            },
          },
        ],
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

  async getTeacherHomeworkTasks(
    userId: string,
    query: TeacherHomeworkTasksQueryDto,
  ) {
    await this.assertTeacher(userId);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const search = query.search?.trim();
    const where = {
      status: TaskStatus.PUBLISHED,
      ...(search
        ? {
            OR: [
              {
                publicId: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                statement: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                topic: {
                  name: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, tasks] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select: {
          publicId: true,
          statement: true,
          difficulty: true,
          topic: {
            select: {
              name: true,
              parent: {
                select: {
                  name: true,
                },
              },
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return { tasks, page, pageSize, total };
  }

  async getTeacherStudents(userId: string) {
    await this.assertTeacher(userId);

    const classrooms = await this.prisma.classroom.findMany({
      where: {
        ownerId: userId,
        status: ClassroomStatus.ACTIVE,
      },
      orderBy: [{ title: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        members: {
          where: {
            role: ClassroomMemberRole.STUDENT,
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const studentsById = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        classroom: { id: string; title: string };
      }
    >();

    for (const classroom of classrooms) {
      for (const { user } of classroom.members) {
        if (!studentsById.has(user.id)) {
          studentsById.set(user.id, {
            ...user,
            classroom: { id: classroom.id, title: classroom.title },
          });
        }
      }
    }

    return [...studentsById.values()].sort((first, second) =>
      first.name.localeCompare(second.name, 'ru'),
    );
  }

  async createTeacherHomeworkAssignment(
    userId: string,
    dto: CreateHomeworkAssignmentDto,
  ) {
    await this.assertTeacher(userId);

    const deadline = new Date(dto.deadline);

    if (deadline <= new Date()) {
      throw new BadRequestException('Срок выполнения должен быть в будущем');
    }

    const taskPublicIds = dto.taskPublicIds.map((publicId) =>
      publicId.trim().toUpperCase(),
    );
    const [tasks, memberships] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          publicId: { in: taskPublicIds },
          status: TaskStatus.PUBLISHED,
        },
        select: {
          id: true,
          publicId: true,
        },
      }),
      this.prisma.classroomMember.findMany({
        where: {
          userId: { in: dto.studentIds },
          role: ClassroomMemberRole.STUDENT,
          classroom: {
            ownerId: userId,
            status: ClassroomStatus.ACTIVE,
          },
        },
        select: {
          classroomId: true,
          userId: true,
          classroom: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    if (tasks.length !== taskPublicIds.length) {
      throw new BadRequestException(
        'Можно добавить только существующие опубликованные задачи',
      );
    }

    const membershipsByStudentId = new Map<
      string,
      Array<{ classroomId: string; classroomTitle: string }>
    >();

    for (const membership of memberships) {
      const studentMemberships =
        membershipsByStudentId.get(membership.userId) ?? [];

      studentMemberships.push({
        classroomId: membership.classroomId,
        classroomTitle: membership.classroom.title,
      });
      membershipsByStudentId.set(membership.userId, studentMemberships);
    }

    if (membershipsByStudentId.size !== dto.studentIds.length) {
      throw new BadRequestException(
        'Выберите только учеников из ваших активных классов',
      );
    }

    const studentIdsByClassroom = new Map<string, string[]>();

    for (const studentId of dto.studentIds) {
      const [membership] = membershipsByStudentId
        .get(studentId)!
        .sort(
          (first, second) =>
            first.classroomTitle.localeCompare(second.classroomTitle, 'ru') ||
            first.classroomId.localeCompare(second.classroomId),
        );
      const studentIds =
        studentIdsByClassroom.get(membership.classroomId) ?? [];

      studentIds.push(studentId);
      studentIdsByClassroom.set(membership.classroomId, studentIds);
    }

    const taskByPublicId = new Map(
      tasks.map((task) => [task.publicId, task.id]),
    );
    const assignments = await this.prisma.$transaction((tx) =>
      Promise.all(
        [...studentIdsByClassroom.entries()]
          .sort(([firstClassroomId], [secondClassroomId]) =>
            firstClassroomId.localeCompare(secondClassroomId),
          )
          .map(([classroomId, studentIds]) =>
            tx.homeworkAssignment.create({
              data: {
                publicId: `HW-${randomUUID().replaceAll('-', '').toUpperCase()}`,
                title: dto.title,
                description: dto.description ?? null,
                deadline,
                classroomId,
                assignedById: userId,
                tasks: {
                  create: taskPublicIds.map((publicId, sortOrder) => ({
                    taskId: taskByPublicId.get(publicId)!,
                    sortOrder,
                  })),
                },
                recipients: {
                  create: studentIds.map((studentId) => ({ studentId })),
                },
              },
              select: {
                publicId: true,
                title: true,
              },
            }),
          ),
      ),
    );

    return { assignments };
  }

  private async assertTeacher(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.TEACHER && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Доступно только преподавателю');
    }
  }
}
