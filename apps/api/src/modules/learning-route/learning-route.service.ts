import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { buildLearningRoute } from './domain/route-planner';
import { LearningRouteDataService } from './learning-route-data.service';
import { LearningRouteStoreService } from './learning-route-store.service';

@Injectable()
export class LearningRouteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly data: LearningRouteDataService,
    private readonly store: LearningRouteStoreService,
  ) {}

  async getOwnCurrent(studentId: string) {
    await this.assertStudent(studentId);
    return this.store.getCurrent(studentId);
  }

  async rebuildOwn(studentId: string) {
    await this.assertStudent(studentId);
    return this.rebuild(studentId);
  }

  async getTeacherStudentRoute(teacherId: string, studentId: string) {
    await this.assertTeacherStudentAccess(teacherId, studentId);
    return this.store.getCurrent(studentId);
  }

  async rebuildTeacherStudentRoute(teacherId: string, studentId: string) {
    await this.assertTeacherStudentAccess(teacherId, studentId);
    return this.rebuild(studentId);
  }

  rebuildFromProfile(studentId: string) {
    return this.rebuild(studentId);
  }

  private async rebuild(studentId: string) {
    const data = await this.data.load(studentId, new Date());
    const plan = buildLearningRoute(data.input);
    const route = await this.store.save(studentId, data, plan);

    return this.store.getById(route.id, studentId);
  }

  private async assertStudent(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.STUDENT) {
      throw new ForbiddenException('Маршрут доступен ученику');
    }
  }

  private async assertTeacherStudentAccess(
    teacherId: string,
    studentId: string,
  ) {
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
