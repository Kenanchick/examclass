import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AssessmentReviewErrorType } from '../../../generated/prisma/client';

export class ReviewCriterionDto {
  @IsString()
  @MaxLength(80)
  code!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  skillCode?: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  awardedScore!: number;

  @IsNumber()
  @Min(0.1)
  @Max(20)
  maxScore!: number;

  @IsEnum(AssessmentReviewErrorType)
  errorType!: AssessmentReviewErrorType;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  comment?: string;
}

export class ReviewAssessmentAttemptDto {
  @IsNumber()
  @Min(0)
  @Max(20)
  awardedScore!: number;

  @IsEnum(AssessmentReviewErrorType)
  errorType!: AssessmentReviewErrorType;

  @IsOptional()
  @IsString()
  @MaxLength(4_000)
  comment?: string;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ReviewCriterionDto)
  criteria!: ReviewCriterionDto[];
}
