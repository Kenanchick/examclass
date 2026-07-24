import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateHomeworkAssignmentDto } from './dto/create-homework-assignment.dto';
import { TeacherHomeworkTasksQueryDto } from './dto/teacher-homework-tasks-query.dto';
import { HomeworkService } from './homework.service';

@Controller('teacher/homework')
@UseGuards(JwtAuthGuard)
export class TeacherHomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Get('tasks')
  getTasks(
    @CurrentUserId() userId: string,
    @Query() query: TeacherHomeworkTasksQueryDto,
  ) {
    return this.homeworkService.getTeacherHomeworkTasks(userId, query);
  }

  @Get('students')
  getStudents(@CurrentUserId() userId: string) {
    return this.homeworkService.getTeacherStudents(userId);
  }

  @Post('assignments')
  createAssignment(
    @CurrentUserId() userId: string,
    @Body() dto: CreateHomeworkAssignmentDto,
  ) {
    return this.homeworkService.createTeacherHomeworkAssignment(userId, dto);
  }
}
