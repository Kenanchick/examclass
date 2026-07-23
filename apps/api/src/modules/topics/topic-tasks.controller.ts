import { Controller, Get, Param } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicTasksController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get(':topicId/tasks')
  getPublishedTopicTasks(@Param('topicId') topicId: string) {
    return this.topicsService.getPublishedTopicTasks(topicId);
  }
}
