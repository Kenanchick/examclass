import { Controller, Get, Param } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('subjects')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get(':subjectCode/topics')
  getPublishedTopics(@Param('subjectCode') subjectCode: string) {
    return this.topicsService.getPublishedTopics(subjectCode);
  }
}
