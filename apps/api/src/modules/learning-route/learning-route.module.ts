import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LearningRouteController } from './learning-route.controller';
import { LearningRouteDataService } from './learning-route-data.service';
import { LearningRouteService } from './learning-route.service';
import { LearningRouteStoreService } from './learning-route-store.service';
import { TeacherLearningRouteController } from './teacher-learning-route.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [LearningRouteController, TeacherLearningRouteController],
  providers: [
    LearningRouteDataService,
    LearningRouteService,
    LearningRouteStoreService,
  ],
  exports: [LearningRouteService],
})
export class LearningRouteModule {}
