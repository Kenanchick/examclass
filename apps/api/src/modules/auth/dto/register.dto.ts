import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const normalizeText = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

const normalizeEmail = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim().toLowerCase() : undefined;

export class RegisterDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  firstName!: string;

  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  lastName!: string;
}
