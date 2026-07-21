import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail, normalizeText } from './auth-transformers';

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
