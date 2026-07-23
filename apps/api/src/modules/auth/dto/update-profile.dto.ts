import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeEmail, normalizeText } from './auth-transformers';

export class UpdateProfileDto {
  @Transform(normalizeText)
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[a-zA-Zа-яА-ЯёЁ][a-zA-Zа-яА-ЯёЁ '-]*$/)
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email!: string;
}
