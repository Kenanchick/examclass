import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LearningRouteController } from './learning-route.controller';
import { LearningRouteAccessService } from './learning-route-access.service';
import { LearningRouteDataService } from './learning-route-data.service';
import { LearningRouteService } from './learning-route.service';
import { LearningRouteStoreService } from './learning-route-store.service';
import { TeacherLearningRouteController } from './teacher-learning-route.controller';
import { TeacherRoadmapService } from './teacher-roadmap.service';
import { TeacherRouteModuleService } from './teacher-route-module.service';
import { TeacherRouteSkillService } from './teacher-route-skill.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [LearningRouteController, TeacherLearningRouteController],
  providers: [
    LearningRouteAccessService,
    LearningRouteDataService,
    LearningRouteService,
    LearningRouteStoreService,
    TeacherRouteModuleService,
    TeacherRoadmapService,
    TeacherRouteSkillService,
  ],
  exports: [LearningRouteService],
})
export class LearningRouteModule {}
