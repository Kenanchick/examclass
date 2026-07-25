import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTeacherRouteModuleDto } from './dto/create-teacher-route-module.dto';
import { TeacherModuleActionDto } from './dto/teacher-module-action.dto';
import { TeacherSkillActionDto } from './dto/teacher-skill-action.dto';
import { UpdateLearningLoadDto } from './dto/update-learning-load.dto';
import { LearningRouteService } from './learning-route.service';
import { TeacherRoadmapService } from './teacher-roadmap.service';
import { TeacherRouteModuleService } from './teacher-route-module.service';
import { TeacherRouteSkillService } from './teacher-route-skill.service';

@Controller('teacher/learning-routes')
@UseGuards(JwtAuthGuard)
export class TeacherLearningRouteController {
  constructor(
    private readonly routes: LearningRouteService,
    private readonly roadmap: TeacherRoadmapService,
    private readonly modules: TeacherRouteModuleService,
    private readonly skills: TeacherRouteSkillService,
  ) {}

  @Get('students/:studentId/map')
  getStudentMap(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.roadmap.getMap(userId, studentId);
  }

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

  @Get('students/:studentId/history')
  getHistory(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.modules.getHistory(userId, studentId);
  }

  @Get('students/:studentId/skills/:skillCode')
  getSkillDetail(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Param('skillCode') skillCode: string,
  ) {
    return this.skills.getDetail(userId, studentId, skillCode);
  }

  @Post('students/:studentId/skills/:skillCode/actions')
  applySkillAction(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Param('skillCode') skillCode: string,
    @Body() dto: TeacherSkillActionDto,
  ) {
    return this.skills.applyAction(userId, studentId, skillCode, dto);
  }

  @Post('students/:studentId/modules/:moduleKey/actions')
  applyModuleAction(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Param('moduleKey') moduleKey: string,
    @Body() dto: TeacherModuleActionDto,
  ) {
    return this.modules.applyAction(userId, studentId, moduleKey, dto);
  }

  @Post('students/:studentId/modules')
  addCustomModule(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Body() dto: CreateTeacherRouteModuleDto,
  ) {
    return this.modules.addCustomModule(userId, studentId, dto);
  }

  @Patch('students/:studentId/goal')
  updateWeeklyLoad(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateLearningLoadDto,
  ) {
    return this.modules.updateWeeklyLoad(userId, studentId, dto);
  }
}
