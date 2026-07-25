import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(19)
  sourceExamNumber?: number;
}
