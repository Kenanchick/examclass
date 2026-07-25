import { randomUUID } from 'node:crypto';
import { Prisma, TeacherRouteActionType } from '../../generated/prisma/client';

const toJson = (value: unknown) =>
  value === null || value === undefined
    ? Prisma.JsonNull
    : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);

export const createTeacherRouteChange = ({
  studentId,
  authorId,
  routeId,
  moduleId,
  moduleKey,
  skillId,
  action,
  reason,
  before,
  after,
}: {
  studentId: string;
  authorId: string;
  routeId?: string | null;
  moduleId?: string | null;
  moduleKey?: string | null;
  skillId?: string | null;
  action: TeacherRouteActionType;
  reason: string;
  before?: unknown;
  after?: unknown;
}): Prisma.TeacherRouteChangeUncheckedCreateInput => ({
  publicId: `CHANGE-${randomUUID().replaceAll('-', '').toUpperCase()}`,
  studentId,
  authorId,
  routeId,
  moduleId,
  moduleKey,
  skillId,
  action,
  reason,
  before: toJson(before),
  after: toJson(after),
});
