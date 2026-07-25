import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { SolutionFileStorageModule } from '../../shared/storage/solution-file-storage.module';
import { AuthModule } from '../auth/auth.module';
import { LearningRouteModule } from '../learning-route/learning-route.module';
import { DiagnosticAccessService } from './diagnostic-access.service';
import { DiagnosticAttachmentService } from './diagnostic-attachment.service';
import { DiagnosticAttemptService } from './diagnostic-attempt.service';
import { DiagnosticEvidenceService } from './diagnostic-evidence.service';
import { DiagnosticFlowService } from './diagnostic-flow.service';
import { DiagnosticReviewService } from './diagnostic-review.service';
import { DiagnosticSessionService } from './diagnostic-session.service';
import { DiagnosticsController } from './diagnostics.controller';
import { KnowledgeProfileService } from './knowledge-profile.service';
import { TeacherDiagnosticsController } from './teacher-diagnostics.controller';

@Module({
  imports: [
    AuthModule,
    LearningRouteModule,
    PrismaModule,
    SolutionFileStorageModule,
  ],
  controllers: [DiagnosticsController, TeacherDiagnosticsController],
  providers: [
    DiagnosticAccessService,
    DiagnosticAttachmentService,
    DiagnosticAttemptService,
    DiagnosticEvidenceService,
    DiagnosticFlowService,
    DiagnosticReviewService,
    DiagnosticSessionService,
    KnowledgeProfileService,
  ],
})
export class DiagnosticsModule {}
