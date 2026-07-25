import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DiagnosticReviewService } from './diagnostic-review.service';
import { ReviewAssessmentAttemptDto } from './dto/review-assessment-attempt.dto';

@Controller('teacher/diagnostics')
@UseGuards(JwtAuthGuard)
export class TeacherDiagnosticsController {
  constructor(private readonly reviewService: DiagnosticReviewService) {}

  @Get('review-queue')
  getReviewQueue(@CurrentUserId() userId: string) {
    return this.reviewService.getReviewQueue(userId);
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
