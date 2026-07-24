import { Prisma } from '../../generated/prisma/client';

export function getStudentHomeworkWhere(
  userId: string,
  publicId?: string,
): Prisma.HomeworkAssignmentWhereInput {
  return {
    ...(publicId ? { publicId } : {}),
    OR: [
      {
        recipients: {
          some: { studentId: userId },
        },
      },
      {
        recipients: {
          none: {},
        },
        classroom: {
          members: {
            some: { userId },
          },
        },
      },
    ],
  };
}
