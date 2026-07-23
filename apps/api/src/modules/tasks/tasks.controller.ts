import { Controller, Get, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':publicId')
  getPublishedTask(@Param('publicId') publicId: string) {
    return this.tasksService.getPublishedTask(publicId);
  }
}
