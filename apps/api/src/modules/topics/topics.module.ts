import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { TopicTasksController } from './topic-tasks.controller';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

@Module({
  imports: [PrismaModule],
  controllers: [TopicsController, TopicTasksController],
  providers: [TopicsService],
})
export class TopicsModule {}
