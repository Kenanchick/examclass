import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { normalizeText } from '../../auth/dto/auth-transformers';

const normalizeCodes = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? (value as unknown[]).map((item) =>
        typeof item === 'string' ? item.trim().toLowerCase() : item,
      )
    : value;

export class CreateTeacherRouteModuleDto {
  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1_500)
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(2_400)
  estimatedMinutes!: number;

  @Transform(normalizeCodes)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  skillCodes?: string[];

  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1_500)
  comment?: string;
}
