import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(10)
  @IsString()
  password: string;
}
