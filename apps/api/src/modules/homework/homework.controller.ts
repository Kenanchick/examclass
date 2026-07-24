import {
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseFilePipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HomeworkSubmissionService } from './homework-submission.service';
import { HomeworkService } from './homework.service';
import {
  MAX_HOMEWORK_ATTACHMENT_SIZE,
  type HomeworkUploadFile,
} from './homework-submission-storage.service';

@Controller('homework')
@UseGuards(JwtAuthGuard)
export class HomeworkController {
  constructor(
    private readonly homeworkService: HomeworkService,
    private readonly submissionService: HomeworkSubmissionService,
  ) {}

  @Get()
  getStudentHomework(@CurrentUserId() userId: string) {
    return this.homeworkService.getStudentHomework(userId);
  }

  @Get('submission-files/:attachmentPublicId')
  @Header('X-Content-Type-Options', 'nosniff')
  async downloadSubmissionAttachment(
    @CurrentUserId() userId: string,
    @Param('attachmentPublicId') attachmentPublicId: string,
  ) {
    const attachment =
      await this.submissionService.getHomeworkAttachmentForDownload(
        userId,
        attachmentPublicId,
      );

    return new StreamableFile(attachment.stream, {
      type: attachment.mimeType,
      length: attachment.sizeBytes,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
    });
  }

  @Post(':publicId/submission/tasks/:taskPublicId/attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_HOMEWORK_ATTACHMENT_SIZE },
    }),
  )
  uploadSubmissionAttachment(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
    @Param('taskPublicId') taskPublicId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: HomeworkUploadFile,
  ) {
    return this.submissionService.uploadStudentHomeworkAttachment(
      userId,
      publicId,
      taskPublicId,
      file,
    );
  }

  @Delete(':publicId/submission/tasks/:taskPublicId/attachment')
  deleteSubmissionAttachment(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
    @Param('taskPublicId') taskPublicId: string,
  ) {
    return this.submissionService.deleteStudentHomeworkAttachment(
      userId,
      publicId,
      taskPublicId,
    );
  }

  @Post(':publicId/submission/submit')
  submitHomework(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.submissionService.submitStudentHomework(userId, publicId);
  }

  @Get(':publicId')
  getStudentHomeworkAssignment(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.homeworkService.getStudentHomeworkAssignment(userId, publicId);
  }
}
