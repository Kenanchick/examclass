import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { normalizeText } from '../../auth/dto/auth-transformers';

export class UpdateLearningLoadDto {
  @Type(() => Number)
  @IsInt()
  @Min(30)
  @Max(4_200)
  weeklyMinutes!: number;

  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
