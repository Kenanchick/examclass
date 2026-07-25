import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AssessmentAttemptOutcome,
  ExamPart,
  Role,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  SolutionFileStorageService,
  type SolutionUploadFile,
} from '../../shared/storage/solution-file-storage.service';
import { DiagnosticAccessService } from './diagnostic-access.service';

const createPublicId = (prefix: string) =>
  `${prefix}-${randomUUID().replaceAll('-', '').toUpperCase()}`;

@Injectable()
export class DiagnosticAttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DiagnosticAccessService,
    private readonly storage: SolutionFileStorageService,
  ) {}

  async upload(
    studentId: string,
    sessionPublicId: string,
    itemPublicId: string,
    file: SolutionUploadFile,
  ) {
    const item = await this.access.getOwnedItem(
      studentId,
      sessionPublicId,
      itemPublicId,
    );

    if (item.task?.examPart !== ExamPart.SECOND) {
      throw new BadRequestException(
        'Файл требуется только для задания с развёрнутым ответом',
      );
    }

    this.access.assertItemCanBeAnswered(item);

    if ((item.attempt?.attachments.length ?? 0) >= 5) {
      throw new BadRequestException(
        'К одному решению можно приложить не более пяти файлов',
      );
    }

    const metadata = this.storage.validate(file);
    const attempt = await this.prisma.assessmentAttempt.upsert({
      where: { itemId: item.id },
      update: {},
      create: {
        publicId: createPublicId('DA'),
        itemId: item.id,
        outcome: AssessmentAttemptOutcome.AWAITING_REVIEW,
      },
      select: { id: true },
    });
    const stored = await this.storage.save(
      file,
      metadata,
      'diagnostic-attempts',
    );

    return this.prisma.assessmentAttemptAttachment
      .create({
        data: {
          publicId: createPublicId('DF'),
          attemptId: attempt.id,
          ...stored,
        },
        select: {
          publicId: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      })
      .catch(async (error: unknown) => {
        await this.storage.remove(stored.storageKey);
        throw error;
      });
  }

  async getForDownload(userId: string, attachmentPublicId: string) {
    const attachment = await this.prisma.assessmentAttemptAttachment.findUnique(
      {
        where: { publicId: attachmentPublicId },
        select: {
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          storageKey: true,
          attempt: {
            select: {
              item: {
                select: {
                  session: { select: { studentId: true } },
                },
              },
            },
          },
        },
      },
    );

    if (!attachment) {
      throw new NotFoundException('Файл решения не найден');
    }

    await this.assertDownloadAccess(
      userId,
      attachment.attempt.item.session.studentId,
    );

    return {
      ...attachment,
      stream: await this.storage.openReadStream(attachment.storageKey),
    };
  }

  private async assertDownloadAccess(userId: string, studentId: string) {
    if (studentId === userId) {
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role === Role.STUDENT) {
      throw new ForbiddenException('Нет доступа к файлу решения');
    }

    if (user.role === Role.TEACHER) {
      const classroomAccess = await this.prisma.classroomMember.findFirst({
        where: {
          userId: studentId,
          classroom: { ownerId: userId },
        },
        select: { classroomId: true },
      });

      if (!classroomAccess) {
        throw new ForbiddenException('Нет доступа к файлу решения');
      }
    }
  }
}
