import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class LearningRouteAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertStudent(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.STUDENT) {
      throw new ForbiddenException('Маршрут доступен ученику');
    }
  }

  async assertTeacherStudent(teacherId: string, studentId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { role: true },
    });

    if (teacher?.role !== Role.TEACHER && teacher?.role !== Role.ADMIN) {
      throw new ForbiddenException('Доступно только преподавателю');
    }

    if (teacher.role === Role.TEACHER) {
      const membership = await this.prisma.classroomMember.findFirst({
        where: {
          userId: studentId,
          classroom: { ownerId: teacherId },
        },
        select: { classroomId: true },
      });

      if (!membership) {
        throw new ForbiddenException(
          'Можно управлять маршрутом только своего ученика',
        );
      }
    }
  }
}
