import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { normalizeText } from '../../auth/dto/auth-transformers';

export class TeacherRoadmapOrderDto {
  @IsArray()
  @ArrayMinSize(19)
  @ArrayMaxSize(19)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(19, { each: true })
  examNumbers!: number[];

  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
