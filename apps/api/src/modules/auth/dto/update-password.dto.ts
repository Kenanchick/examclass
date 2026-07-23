import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  newPassword!: string;
}
