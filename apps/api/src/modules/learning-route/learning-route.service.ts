import { Injectable } from '@nestjs/common';
import { buildLearningRoute } from './domain/route-planner';
import { LearningRouteAccessService } from './learning-route-access.service';
import { LearningRouteDataService } from './learning-route-data.service';
import { LearningRouteStoreService } from './learning-route-store.service';

@Injectable()
export class LearningRouteService {
  constructor(
    private readonly access: LearningRouteAccessService,
    private readonly data: LearningRouteDataService,
    private readonly store: LearningRouteStoreService,
  ) {}

  async getOwnCurrent(studentId: string) {
    await this.access.assertStudent(studentId);
    return this.store.getCurrent(studentId);
  }

  async rebuildOwn(studentId: string) {
    await this.access.assertStudent(studentId);
    return this.rebuild(studentId);
  }

  async getTeacherStudentRoute(teacherId: string, studentId: string) {
    await this.access.assertTeacherStudent(teacherId, studentId);
    return this.store.getCurrent(studentId);
  }

  async rebuildTeacherStudentRoute(teacherId: string, studentId: string) {
    await this.access.assertTeacherStudent(teacherId, studentId);
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
}
