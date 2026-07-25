import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LearningRouteService } from './learning-route.service';

@Controller('teacher/learning-routes')
@UseGuards(JwtAuthGuard)
export class TeacherLearningRouteController {
  constructor(private readonly routes: LearningRouteService) {}

  @Get('students/:studentId')
  getStudentRoute(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.routes.getTeacherStudentRoute(userId, studentId);
  }

  @Post('students/:studentId/rebuild')
  rebuildStudentRoute(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.routes.rebuildTeacherStudentRoute(userId, studentId);
  }
}
