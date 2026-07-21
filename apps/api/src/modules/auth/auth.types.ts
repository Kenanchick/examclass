import type { Request } from 'express';
import type { Role } from '../../generated/prisma/client';

export type JwtPayload = {
  sub: string;
  role: Role;
};

export type AuthenticatedRequest = Request & {
  auth: JwtPayload;
};
