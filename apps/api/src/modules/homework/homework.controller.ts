import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HomeworkService } from './homework.service';

@Controller('homework')
@UseGuards(JwtAuthGuard)
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Get()
  getStudentHomework(@CurrentUserId() userId: string) {
    return this.homeworkService.getStudentHomework(userId);
  }

  @Get(':publicId')
  getStudentHomeworkAssignment(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.homeworkService.getStudentHomeworkAssignment(userId, publicId);
  }
}
