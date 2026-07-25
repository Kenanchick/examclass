import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const normalizeCodes = ({ value }: TransformFnParams): unknown =>
  Array.isArray(value)
    ? (value as unknown[]).map((item) =>
        typeof item === 'string' ? item.trim().toLowerCase() : item,
      )
    : value;

export class CreateInitialDiagnosticDto {
  @IsInt()
  @Min(1)
  @Max(100)
  targetScore!: number;

  @IsDateString()
  examDate!: string;

  @IsInt()
  @Min(60)
  @Max(3_000)
  weeklyMinutes!: number;

  @IsInt()
  @Min(20)
  @Max(240)
  preferredSessionMinutes!: number;

  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  availableWeekdays!: number[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  lastMockScore?: number;

  @Transform(normalizeCodes)
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  selfReportedUnstudiedNodeCodes?: string[];
}
