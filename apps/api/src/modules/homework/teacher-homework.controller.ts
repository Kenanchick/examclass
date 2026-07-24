import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddTeacherStudentDto } from './dto/add-teacher-student.dto';
import { CreateHomeworkAssignmentDto } from './dto/create-homework-assignment.dto';
import { TeacherHomeworkTasksQueryDto } from './dto/teacher-homework-tasks-query.dto';
import { HomeworkSubmissionService } from './homework-submission.service';
import { HomeworkService } from './homework.service';

@Controller('teacher/homework')
@UseGuards(JwtAuthGuard)
export class TeacherHomeworkController {
  constructor(
    private readonly homeworkService: HomeworkService,
    private readonly submissionService: HomeworkSubmissionService,
  ) {}

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

  @Post('students')
  addStudent(
    @CurrentUserId() userId: string,
    @Body() dto: AddTeacherStudentDto,
  ) {
    return this.homeworkService.addTeacherStudent(userId, dto);
  }

  @Get('assignments/:publicId/submissions')
  getSubmissions(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.submissionService.getTeacherHomeworkSubmissions(
      userId,
      publicId,
    );
  }

  @Post('assignments')
  createAssignment(
    @CurrentUserId() userId: string,
    @Body() dto: CreateHomeworkAssignmentDto,
  ) {
    return this.homeworkService.createTeacherHomeworkAssignment(userId, dto);
  }
}
