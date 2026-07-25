import { Transform } from 'class-transformer';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { StudentSkillStatus } from '../../../generated/prisma/client';
import { normalizeText } from '../../auth/dto/auth-transformers';

export class TeacherSubtopicStatusDto {
  @IsEnum(StudentSkillStatus)
  status!: StudentSkillStatus;

  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
