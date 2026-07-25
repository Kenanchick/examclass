import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { SolutionFileStorageModule } from '../../shared/storage/solution-file-storage.module';
import { AuthModule } from '../auth/auth.module';
import { HomeworkController } from './homework.controller';
import { HomeworkSubmissionService } from './homework-submission.service';
import { HomeworkService } from './homework.service';
import { TeacherHomeworkController } from './teacher-homework.controller';

@Module({
  imports: [AuthModule, PrismaModule, SolutionFileStorageModule],
  controllers: [HomeworkController, TeacherHomeworkController],
  providers: [HomeworkService, HomeworkSubmissionService],
})
export class HomeworkModule {}
