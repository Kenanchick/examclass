import { IsIn } from 'class-validator';
import { Role } from '../../../generated/prisma/client';

export class UpdateRoleDto {
  @IsIn([Role.STUDENT, Role.TEACHER])
  role!: Extract<Role, 'STUDENT' | 'TEACHER'>;
}
