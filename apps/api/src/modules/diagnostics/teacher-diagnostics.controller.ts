import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DiagnosticReviewService } from './diagnostic-review.service';
import { ReviewAssessmentAttemptDto } from './dto/review-assessment-attempt.dto';
import { KnowledgeProfileService } from './knowledge-profile.service';

@Controller('teacher/diagnostics')
@UseGuards(JwtAuthGuard)
export class TeacherDiagnosticsController {
  constructor(
    private readonly reviewService: DiagnosticReviewService,
    private readonly profileService: KnowledgeProfileService,
  ) {}

  @Get('review-queue')
  getReviewQueue(@CurrentUserId() userId: string) {
    return this.reviewService.getReviewQueue(userId);
  }

  @Get('students/:studentId/profile')
  getStudentProfile(
    @CurrentUserId() userId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.profileService.getTeacherStudentProfile(userId, studentId);
  }

  @Post(':sessionPublicId/attempts/:attemptPublicId/review')
  reviewAttempt(
    @CurrentUserId() userId: string,
    @Param('sessionPublicId') sessionPublicId: string,
    @Param('attemptPublicId') attemptPublicId: string,
    @Body() dto: ReviewAssessmentAttemptDto,
  ) {
    return this.reviewService.reviewAttempt(
      userId,
      sessionPublicId,
      attemptPublicId,
      dto,
    );
  }
}
