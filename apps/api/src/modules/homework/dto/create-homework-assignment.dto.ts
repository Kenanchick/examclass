import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeText } from '../../auth/dto/auth-transformers';

const normalizePublicIds = ({ value }: TransformFnParams): unknown =>
  Array.isArray(value)
    ? (value as unknown[]).map((item) =>
        typeof item === 'string' ? item.trim().toUpperCase() : item,
      )
    : value;

export class CreateHomeworkAssignmentDto {
  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  description?: string;

  @IsDateString()
  deadline!: string;

  @Transform(normalizePublicIds)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(64, { each: true })
  taskPublicIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(64, { each: true })
  studentIds!: string[];
}
