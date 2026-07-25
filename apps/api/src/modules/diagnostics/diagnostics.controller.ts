import {
  Body,
  Controller,
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
import {
  MAX_SOLUTION_FILE_SIZE,
  type SolutionUploadFile,
} from '../../shared/storage/solution-file-storage.service';
import { DiagnosticAttachmentService } from './diagnostic-attachment.service';
import { DiagnosticAttemptService } from './diagnostic-attempt.service';
import { DiagnosticFlowService } from './diagnostic-flow.service';
import { DiagnosticSessionService } from './diagnostic-session.service';
import { CreateInitialDiagnosticDto } from './dto/create-initial-diagnostic.dto';
import { RecordBehaviorEventDto } from './dto/record-behavior-event.dto';
import { SubmitAssessmentAttemptDto } from './dto/submit-assessment-attempt.dto';

@Controller('diagnostics')
@UseGuards(JwtAuthGuard)
export class DiagnosticsController {
  constructor(
    private readonly sessionService: DiagnosticSessionService,
    private readonly attemptService: DiagnosticAttemptService,
    private readonly attachmentService: DiagnosticAttachmentService,
    private readonly flowService: DiagnosticFlowService,
  ) {}

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateInitialDiagnosticDto,
  ) {
    return this.sessionService.createInitialDiagnostic(userId, dto);
  }

  @Get('attempt-files/:attachmentPublicId')
  @Header('X-Content-Type-Options', 'nosniff')
  async downloadAttachment(
    @CurrentUserId() userId: string,
    @Param('attachmentPublicId') attachmentPublicId: string,
  ) {
    const attachment = await this.attachmentService.getForDownload(
      userId,
      attachmentPublicId,
    );

    return new StreamableFile(attachment.stream, {
      type: attachment.mimeType,
      length: attachment.sizeBytes,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
    });
  }

  @Get(':publicId')
  getSession(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.sessionService.getSession(userId, publicId);
  }

  @Post(':publicId/start')
  startExam(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.sessionService.startExam(userId, publicId);
  }

  @Post(':publicId/items/:itemPublicId/events')
  recordEvent(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
    @Param('itemPublicId') itemPublicId: string,
    @Body() dto: RecordBehaviorEventDto,
  ) {
    return this.attemptService.recordBehaviorEvent(
      userId,
      publicId,
      itemPublicId,
      dto,
    );
  }

  @Post(':publicId/items/:itemPublicId/answer')
  submitAnswer(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
    @Param('itemPublicId') itemPublicId: string,
    @Body() dto: SubmitAssessmentAttemptDto,
  ) {
    return this.attemptService.submitAttempt(
      userId,
      publicId,
      itemPublicId,
      dto,
    );
  }

  @Post(':publicId/items/:itemPublicId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SOLUTION_FILE_SIZE },
    }),
  )
  uploadAttachment(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
    @Param('itemPublicId') itemPublicId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: SolutionUploadFile,
  ) {
    return this.attachmentService.upload(userId, publicId, itemPublicId, file);
  }

  @Post(':publicId/exam/finish')
  finishExam(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.flowService.finishFullExam(userId, publicId);
  }

  @Post(':publicId/clarification/next')
  nextClarification(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.flowService.createNextAdaptiveItem(userId, publicId);
  }
}
