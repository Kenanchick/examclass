import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TeacherRouteActionType } from '../../../generated/prisma/client';
import { normalizeText } from '../../auth/dto/auth-transformers';

export class TeacherModuleActionDto {
  @IsEnum(TeacherRouteActionType)
  action!: TeacherRouteActionType;

  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @IsOptional()
  @IsIn(['UP', 'DOWN'])
  direction?: 'UP' | 'DOWN';

  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1_500)
  comment?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
