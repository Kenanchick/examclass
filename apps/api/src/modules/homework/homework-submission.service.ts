import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ExamPart,
  HomeworkSubmissionStatus,
  Role,
} from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { getStudentHomeworkWhere } from './homework-access';
import {
  SolutionFileStorageService,
  type SolutionUploadFile,
} from '../../shared/storage/solution-file-storage.service';

@Injectable()
export class HomeworkSubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly submissionStorage: SolutionFileStorageService,
  ) {}

  async uploadStudentHomeworkAttachment(
    userId: string,
    homeworkPublicId: string,
    taskPublicId: string,
    file: SolutionUploadFile,
  ) {
    const assignment = await this.getStudentHomeworkForSubmission(
      userId,
      homeworkPublicId,
    );
    const task = this.findSecondPartTask(assignment.tasks, taskPublicId);
    const fileMetadata = this.submissionStorage.validate(file);
    const submission = await this.getOrCreateStudentSubmission(
      assignment.id,
      userId,
    );

    this.assertSubmissionCanBeEdited(submission.status);

    const previousAttachment =
      await this.prisma.homeworkSubmissionAttachment.findUnique({
        where: {
          submissionId_taskId: {
            submissionId: submission.id,
            taskId: task.id,
          },
        },
        select: {
          storageKey: true,
        },
      });
    const storedFile = await this.submissionStorage.save(
      file,
      fileMetadata,
      'homework-submissions',
    );

    const attachment = await this.prisma.homeworkSubmissionAttachment
      .upsert({
        where: {
          submissionId_taskId: {
            submissionId: submission.id,
            taskId: task.id,
          },
        },
        create: {
          publicId: this.createSubmissionPublicId(),
          submissionId: submission.id,
          taskId: task.id,
          ...storedFile,
        },
        update: storedFile,
        select: {
          publicId: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      })
      .catch(async (error: unknown) => {
        await this.submissionStorage.remove(storedFile.storageKey);
        throw error;
      });

    if (previousAttachment) {
      await this.submissionStorage.remove(previousAttachment.storageKey);
    }

    return {
      ...attachment,
      taskPublicId: task.publicId,
    };
  }

  async deleteStudentHomeworkAttachment(
    userId: string,
    homeworkPublicId: string,
    taskPublicId: string,
  ) {
    const assignment = await this.getStudentHomeworkForSubmission(
      userId,
      homeworkPublicId,
    );
    const task = this.findSecondPartTask(assignment.tasks, taskPublicId);
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: {
        homeworkId_studentId: {
          homeworkId: assignment.id,
          studentId: userId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Файл с решением не найден');
    }

    this.assertSubmissionCanBeEdited(submission.status);

    const attachment =
      await this.prisma.homeworkSubmissionAttachment.findUnique({
        where: {
          submissionId_taskId: {
            submissionId: submission.id,
            taskId: task.id,
          },
        },
        select: {
          id: true,
          storageKey: true,
        },
      });

    if (!attachment) {
      throw new NotFoundException('Файл с решением не найден');
    }

    await this.prisma.homeworkSubmissionAttachment.delete({
      where: { id: attachment.id },
    });
    await this.submissionStorage.remove(attachment.storageKey);

    return { taskPublicId: task.publicId };
  }

  async submitStudentHomework(userId: string, homeworkPublicId: string) {
    const assignment = await this.getStudentHomeworkForSubmission(
      userId,
      homeworkPublicId,
    );
    const secondPartTasks = assignment.tasks.filter(
      (task) => task.examPart === ExamPart.SECOND,
    );
    const submittedAt = new Date();

    const submission = await this.prisma.$transaction(async (transaction) => {
      const existingSubmission =
        await transaction.homeworkSubmission.findUnique({
          where: {
            homeworkId_studentId: {
              homeworkId: assignment.id,
              studentId: userId,
            },
          },
          select: {
            id: true,
            publicId: true,
            status: true,
            submittedAt: true,
            attachments: {
              select: {
                taskId: true,
              },
            },
          },
        });

      if (existingSubmission?.status === HomeworkSubmissionStatus.SUBMITTED) {
        return existingSubmission;
      }

      if (existingSubmission?.status === HomeworkSubmissionStatus.REVIEWED) {
        throw new BadRequestException(
          'Работа уже проверена преподавателем и не может быть изменена',
        );
      }

      const attachedTaskIds = new Set(
        existingSubmission?.attachments.map((attachment) => attachment.taskId),
      );
      const missingTaskPublicIds = secondPartTasks
        .filter((task) => !attachedTaskIds.has(task.id))
        .map((task) => task.publicId);

      if (missingTaskPublicIds.length > 0) {
        throw new BadRequestException(
          `Прикрепите решение для задач второй части: ${missingTaskPublicIds.join(', ')}`,
        );
      }

      return transaction.homeworkSubmission.upsert({
        where: {
          homeworkId_studentId: {
            homeworkId: assignment.id,
            studentId: userId,
          },
        },
        create: {
          publicId: this.createSubmissionPublicId(),
          homeworkId: assignment.id,
          studentId: userId,
          status: HomeworkSubmissionStatus.SUBMITTED,
          submittedAt,
        },
        update: {
          status: HomeworkSubmissionStatus.SUBMITTED,
          submittedAt,
          reviewedAt: null,
        },
        select: {
          publicId: true,
          status: true,
          submittedAt: true,
        },
      });
    });

    return {
      ...submission,
      isLate: Boolean(
        submission.submittedAt && submission.submittedAt > assignment.deadline,
      ),
    };
  }

  async getTeacherHomeworkSubmissions(
    userId: string,
    homeworkPublicId: string,
  ) {
    await this.assertTeacher(userId);

    const assignment = await this.prisma.homeworkAssignment.findFirst({
      where: {
        publicId: homeworkPublicId,
        assignedById: userId,
      },
      select: {
        publicId: true,
        title: true,
        deadline: true,
        submissions: {
          where: {
            status: HomeworkSubmissionStatus.SUBMITTED,
          },
          orderBy: {
            submittedAt: 'desc',
          },
          select: {
            publicId: true,
            status: true,
            submittedAt: true,
            student: {
              select: {
                name: true,
                email: true,
              },
            },
            attachments: {
              select: {
                publicId: true,
                originalName: true,
                mimeType: true,
                sizeBytes: true,
                createdAt: true,
                task: {
                  select: {
                    publicId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Домашнее задание не найдено');
    }

    return {
      ...assignment,
      submissions: assignment.submissions.map(
        ({ attachments, ...submission }) => ({
          ...submission,
          attachments: attachments.map(({ task, ...attachment }) => ({
            ...attachment,
            taskPublicId: task.publicId,
          })),
        }),
      ),
    };
  }

  async getHomeworkAttachmentForDownload(
    userId: string,
    attachmentPublicId: string,
  ) {
    const attachment =
      await this.prisma.homeworkSubmissionAttachment.findUnique({
        where: { publicId: attachmentPublicId },
        select: {
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          storageKey: true,
          submission: {
            select: {
              studentId: true,
              homework: {
                select: {
                  assignedById: true,
                },
              },
            },
          },
        },
      });

    if (!attachment) {
      throw new NotFoundException('Файл с решением не найден');
    }

    if (
      attachment.submission.studentId !== userId &&
      attachment.submission.homework.assignedById !== userId
    ) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user?.role !== Role.ADMIN) {
        throw new ForbiddenException('Нет доступа к файлу с решением');
      }
    }

    return {
      ...attachment,
      stream: await this.submissionStorage.openReadStream(
        attachment.storageKey,
      ),
    };
  }

  private async getStudentHomeworkForSubmission(
    userId: string,
    publicId: string,
  ) {
    const assignment = await this.prisma.homeworkAssignment.findFirst({
      where: getStudentHomeworkWhere(userId, publicId),
      select: {
        id: true,
        deadline: true,
        tasks: {
          select: {
            task: {
              select: {
                id: true,
                publicId: true,
                examPart: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Домашнее задание не найдено');
    }

    return {
      ...assignment,
      tasks: assignment.tasks.map(({ task }) => task),
    };
  }

  private findSecondPartTask(
    tasks: Array<{ id: string; publicId: string; examPart: ExamPart }>,
    taskPublicId: string,
  ) {
    const task = tasks.find(
      ({ publicId }) => publicId === taskPublicId.trim().toUpperCase(),
    );

    if (!task) {
      throw new NotFoundException('Задача не входит в это домашнее задание');
    }

    if (task.examPart !== ExamPart.SECOND) {
      throw new BadRequestException(
        'Файл можно прикрепить только к задаче второй части',
      );
    }

    return task;
  }

  private async getOrCreateStudentSubmission(
    homeworkId: string,
    studentId: string,
  ) {
    return this.prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId,
        },
      },
      create: {
        publicId: this.createSubmissionPublicId(),
        homeworkId,
        studentId,
      },
      update: {},
      select: {
        id: true,
        status: true,
      },
    });
  }

  private assertSubmissionCanBeEdited(status: HomeworkSubmissionStatus) {
    if (
      status !== HomeworkSubmissionStatus.DRAFT &&
      status !== HomeworkSubmissionStatus.RETURNED
    ) {
      throw new BadRequestException(
        'Работа уже отправлена преподавателю и не может быть изменена',
      );
    }
  }

  private createSubmissionPublicId() {
    return `HS-${randomUUID().replaceAll('-', '').toUpperCase()}`;
  }

  private async assertTeacher(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== Role.TEACHER && user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Доступно только преподавателю');
    }
  }
}
