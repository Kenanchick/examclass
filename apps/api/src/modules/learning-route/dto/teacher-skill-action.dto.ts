import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  StudentSkillStatus,
  TeacherRouteActionType,
} from '../../../generated/prisma/client';
import { normalizeText } from '../../auth/dto/auth-transformers';

export class TeacherSkillActionDto {
  @IsEnum(TeacherRouteActionType)
  action!: TeacherRouteActionType;

  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @IsOptional()
  @IsEnum(StudentSkillStatus)
  status?: StudentSkillStatus;

  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1_500)
  comment?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
