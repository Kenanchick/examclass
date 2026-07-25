import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AttemptIndependence } from '../../../generated/prisma/client';

export enum AttemptSubmissionType {
  ANSWER = 'ANSWER',
  SKIP = 'SKIP',
  UNSTUDIED = 'UNSTUDIED',
}

const normalizeOptionalText = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class SubmitAssessmentAttemptDto {
  @IsEnum(AttemptSubmissionType)
  submissionType!: AttemptSubmissionType;

  @Transform(normalizeOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(4_000)
  rawAnswer?: string;

  @Transform(normalizeOptionalText)
  @IsOptional()
  @IsString()
  @MaxLength(30_000)
  solutionText?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidence?: number;

  @IsOptional()
  @IsBoolean()
  hasVisibleWork?: boolean;

  @IsOptional()
  @IsEnum(AttemptIndependence)
  independence?: AttemptIndependence;

  @IsInt()
  @Min(0)
  @Max(24 * 60 * 60)
  activeSeconds!: number;

  @IsInt()
  @Min(0)
  @Max(24 * 60 * 60)
  elapsedSeconds!: number;

  @IsInt()
  @Min(0)
  @Max(24 * 60 * 60)
  awaySeconds!: number;

  @IsInt()
  @Min(0)
  @Max(1_000)
  answerChanges!: number;
}
