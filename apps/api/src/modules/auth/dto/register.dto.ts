import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { normalizeEmail, normalizeText } from './auth-transformers';

export class RegisterDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  password!: string;

  @Transform(normalizeText)
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9а-яА-ЯёЁ]+$/)
  name!: string;
}
