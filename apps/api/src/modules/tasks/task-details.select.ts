import { Prisma } from '../../generated/prisma/client';

export const taskDetailsSelect = {
  publicId: true,
  examPart: true,
  statement: true,
  correctAnswer: true,
  referenceSolution: true,
  difficulty: true,
  source: true,
  topic: {
    select: {
      id: true,
      slug: true,
      name: true,
      sortOrder: true,
      parent: {
        select: {
          name: true,
          sortOrder: true,
        },
      },
      subject: {
        select: {
          code: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.TaskSelect;
