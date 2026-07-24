import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { TeacherHomeworkController } from './teacher-homework.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [HomeworkController, TeacherHomeworkController],
  providers: [HomeworkService],
})
export class HomeworkModule {}
