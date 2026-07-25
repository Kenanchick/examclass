import { AssessmentBehaviorEventType } from '../../../generated/prisma/client';
import { IsDateString, IsEnum, IsObject, IsOptional } from 'class-validator';

export class RecordBehaviorEventDto {
  @IsEnum(AssessmentBehaviorEventType)
  type!: AssessmentBehaviorEventType;

  @IsDateString()
  occurredAt!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
