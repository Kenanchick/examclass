import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeText } from '../../auth/dto/auth-transformers';

export class AddTeacherStudentDto {
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  studentId!: string;
}
